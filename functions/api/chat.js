import { sendMessage, getAnswerCacheKey, getCachedAnswer, setCachedAnswer, buildKnowledgeFallback, getProviderStatus } from './_shared/provider-router.js';
import { processLanguage } from './_shared/agents/language.js';
import { detectIntent } from './_shared/agents/intent.js';
import { searchAndRankProducts } from './_shared/agents/product.js';
import { buildFullKnowledgeContext, searchRawDocuments, generateKnowledgeAnswer } from './_shared/agents/knowledge.js';
import { smartMemory } from './_shared/agents/memory.js';

function buildSystemPrompt(language) {
    if (language === 'english') {
        return `You are SF AI, Bangladeshi agriculture expert. Answer ONLY farming/fertilizer questions. Be practical for Bangladesh climate. Include product names, prices, quantities. Step-by-step advice. Safety warnings. Always actionable.`;
    }
    return `তোমি SF AI, বাংলাদেশ কৃষি বিশেষজ্ঞ। শুধু কৃষি/সার প্রশ্নের উত্তর দাও। বাংলায় উত্তর দাও। পণ্যের নাম, দাম, পরিমাণ উল্লেখ করো। ধাপে ধাপে পরামর্শ দাও। নিরাপত্তা সতর্কতা দাও।`;
}

function getEmergencyFallback(language) {
    if (language === 'english') {
        return `I'm experiencing a temporary issue, but I can still help you with agriculture advice.\n\n**General Recommendations:**\n1. Contact your local DAE office\n2. Visit BARI website: bari.gov.bd\n3. Consult with a local agriculture officer\n\n**Quick Tips:**\n- Use verified seeds from authorized dealers\n- Follow recommended fertilizer schedules\n- Practice integrated pest management (IPM)\n\n*For immediate help, call our hotline: 01829-775552*`;
    }
    return `আমি সাময়িক সমস্যার সম্মুখীন হচ্ছি, তবে কৃষি পরামর্শ দিতে পারছি।\n\n**সাধারণ পরামর্শ:**\n১. আপনার নিকটস্থ কৃষি সম্প্রসারণ অফিসে (DAE) যোগাযোগ করুন\n২. BARI ওয়েবসাইট: bari.gov.bd\n৩. স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন\n\n**দ্রুত পরামর্শ:**\n- অনুমোদিত ডিলার থেকে যাচাইকৃত বীজ ব্যবহার করুন\n- সুপারিশকৃত সারের সময়সূচি অনুসরণ করুন\n- একীভূত পোকামাকড় ব্যবস্থাপনা (IPM) অনুশীলন করুন\n\n*জরুরি সহায়তায় কল করুন: 01829-775552*`;
}

async function handleChatRequest(body, env) {
    const { messages = [], sessionId = 'default' } = body;
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const rawInput = lastUserMsg?.content || '';

    const languageResult = processLanguage(rawInput);
    const intent = detectIntent(rawInput, languageResult);
    const lang = languageResult.language;

    let productResults = { products: [], context: '' };
    if (intent.isProductQuery || intent.isFertilizerQuery || intent.primaryIntent === 'product' || intent.primaryIntent === 'fertilizer') {
        productResults = await searchAndRankProducts(rawInput, intent.cropName, intent.primaryIntent);
    }

    const knowledgeContext = buildFullKnowledgeContext(rawInput, {
        crop: intent.cropName, disease: null, season: intent.season, intent: intent.primaryIntent, limit: 6,
    });

    const cacheKey = getAnswerCacheKey(rawInput, intent);
    const cachedAnswer = getCachedAnswer(cacheKey);
    const systemPrompt = buildSystemPrompt(lang);

    let userContext = rawInput;
    if (knowledgeContext && knowledgeContext.length > 50) userContext += `\n\n[KNOWLEDGE]:\n${knowledgeContext}`;
    if (productResults.context) userContext += `\n\n[PRODUCTS]:\n${productResults.context}`;

    const enrichedMessages = [...messages];
    for (let i = enrichedMessages.length - 1; i >= 0; i--) {
        if (enrichedMessages[i].role === 'user') { enrichedMessages[i] = { ...enrichedMessages[i], content: userContext }; break; }
    }

    let response;
    if (cachedAnswer) {
        response = { ok: true, reply: cachedAnswer, provider: 'cache', model: 'cached', latency: 0 };
    } else {
        response = await sendMessage(enrichedMessages, systemPrompt, { maxTokens: 800 }, env);
    }

    let finalAnswer;
    if (response.reply && response.reply.trim()) {
        finalAnswer = response.reply.trim();
    } else {
        const rawDocs = searchRawDocuments(rawInput, { crop: intent.cropName, disease: null, season: intent.season, intent: intent.primaryIntent, limit: 5 });
        finalAnswer = generateKnowledgeAnswer(rawInput, rawDocs, productResults.context || '', lang);
    }

    if (!finalAnswer || !finalAnswer.trim()) {
        finalAnswer = getEmergencyFallback(lang);
    }

    const session = smartMemory.getSession(sessionId);
    try {
        smartMemory.updateFromMessage(sessionId, rawInput, intent, languageResult);
    } catch (memErr) {
        console.warn('Memory update failed:', memErr.message);
    }

    try {
        if (!cachedAnswer && response.ok) setCachedAnswer(cacheKey, finalAnswer, response.provider || 'knowledge');
    } catch (cacheErr) {
        console.warn('Cache write failed:', cacheErr.message);
    }

    return {
        reply: finalAnswer,
        language: lang,
        provider: response.provider || 'knowledge',
        model: response.model || 'knowledge-base',
        latency: response.latency || 0,
    };
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    try {
        const body = await request.json();
        const result = await handleChatRequest(body, env);
        return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error('Chat handler error:', error);
        const lang = 'bangla';
        return new Response(JSON.stringify({
            reply: getEmergencyFallback(lang), language: lang, provider: 'emergency-fallback', model: 'knowledge-base', source: 'error-handler',
        }), { status: 200, headers: corsHeaders });
    }
}
