import { sendMessage, getAnswerCacheKey, getCachedAnswer, setCachedAnswer, buildKnowledgeFallback, getProviderStatus } from './_shared/provider-router.js';
import { processLanguage } from './_shared/agents/language.js';
import { detectIntent } from './_shared/agents/intent.js';
import { searchAndRankProducts } from './_shared/agents/product.js';
import { buildFullKnowledgeContext, searchRawDocuments, generateKnowledgeAnswer } from './_shared/agents/knowledge.js';
import { smartMemory } from './_shared/agents/memory.js';

function buildSystemPrompt(language) {
    if (language === 'english') {
        return `You are SF AI, Bangladeshi agriculture expert.

RULES:
- Answer ONLY the specific question the user asked.
- Do NOT summarize all retrieved knowledge. Use only what directly answers the question.
- If the question is about fertilizer, answer ONLY fertilizer information. Do NOT include disease information.
- If the question is about disease, answer ONLY disease information. Do NOT include fertilizer schedules.
- If a calculation result is provided in [CALCULATION], use that exact result. Do NOT recompute or invent numbers.
- If you do not have enough information to answer, ask a short clarification question.
- Keep answers focused and concise.
- Use Bengali if the user writes in Bengali.
- Never invent fertilizer rates or sources not shown in the knowledge base.`;
    }
    return `তোমি SF AI, বাংলাদেশ কৃষি বিশেষজ্ঞ।

নিয়মাবলী:
- শুধুমাত্র ব্যবহারকারীর জিজ্ঞাসার সরাসরি উত্তর দাও।
- সমস্ত জ্ঞান ভান্ডার সারসংক্ষেপ করো না। শুধু প্রাসঙ্গিক তথ্য ব্যবহার করো।
- সার সম্পর্কিত প্রশ্নে শুধু সার সম্পর্কিত তথ্য দাও। রোগের তথ্য যোগ করো না।
- রোগ সম্পর্কিত প্রশ্নে শুধু রোগের তথ্য দাও। সারের সময়সূচি যোগ করো না।
- [CALCULATION] তে দেওয়া হিসাব ব্যবহার করো। নতুন হিসাব করো না বা সংখ্যা তৈরি করো না।
- পর্যাপ্ত তথ্য না থাকলে সংক্ষিপ্ত পরিষ্কারিকরণ প্রশ্ন করো।
- উত্তর কেন্দ্রীভূত ও সংক্ষিপ্ত রাখো।
- ব্যবহারকারী বাংলায় লিখলে বাংলায় উত্তর দাও।
- জ্ঞান ভান্ডারে না থাকা সারের হার বা উৎস তৈরি করো না।`;
}

const BN_DIGITS = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };

function normalizeBanglaDigits(text) {
    if (!text) return text;
    let out = text;
    for (const [bn, en] of Object.entries(BN_DIGITS)) {
        out = out.replaceAll(bn, en);
    }
    return out;
}

function parseFertilizerRate(text) {
    if (!text) return null;
    const normalized = normalizeBanglaDigits(text);
    const patterns = [
        /(\d+[\.,]?\d*)\s*[-–—]\s*(\d+[\.,]?\d*)\s*(?:কেজি|kg|গ্রাম|g)/i,
        /(\d+[\.,]?\d*)\s*(?:কেজি|kg|গ্রাম|g)\s*\/\s*(?:একর|acre|শতক|বিঘা)/i,
        /(\d+[\.,]?\d*)\s*[-–—]\s*(\d+[\.,]?\d*)/,
    ];
    for (const pat of patterns) {
        const m = normalized.match(pat);
        if (m) {
            const n1 = parseFloat(m[1].replace(',', '.'));
            const n2 = m[2] ? parseFloat(m[2].replace(',', '.')) : n1;
            if (!isNaN(n1) && n1 > 0) return { min: n1, max: n2 };
        }
    }
    return null;
}

function detectFertilizerType(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    const types = [
        { name: 'ইউরিয়া', aliases: ['ইউরিয়া', 'urea'] },
        { name: 'ডিএপি', aliases: ['ডিএপি', 'dap', 'ডাই অ্যামোনিয়াম'] },
        { name: 'কেসিএ', aliases: ['কেসিএ', 'kca', 'ক্যালসিয়াম অ্যামোনিয়াম'] },
        { name: 'এমওপি', aliases: ['এমওপি', 'mop', 'মিউরিয়েট'] },
        { name: 'কমপোস্ট', aliases: ['কমপোস্ট', 'compost'] },
        { name: 'জিপসাম', aliases: ['জিপসাম', 'gypsum'] },
    ];
    for (const t of types) {
        if (t.aliases.some(a => lower.includes(a))) return t.name;
    }
    return null;
}

function extractRateFromKnowledge(rawDocs, fertType) {
    if (!rawDocs || !fertType) return null;
    const fertLower = fertType.toLowerCase();
    for (const doc of rawDocs) {
        const cqs = doc.common_questions || [];
        for (const cq of cqs) {
            const qLower = (cq.q || '').toLowerCase();
            const aLower = (cq.a || '').toLowerCase();
            if (qLower.includes(fertLower) || aLower.includes(fertLower)) {
                const rate = parseFertilizerRate(cq.a);
                if (rate) return { source: cq.a, rate, fertType };
            }
        }
        // Also check fertilizer_schedule
        if (doc.fertilizer_schedule) {
            for (const fs of doc.fertilizer_schedule) {
                const fsFert = (fs.fertilizer || '').toLowerCase();
                const fertLower = fertType.toLowerCase();
                if (fsFert.includes(fertLower) || fertLower.includes(fsFert)) {
                    const rate = parseFertilizerRate(fs.amount);
                    if (rate) return { source: `${fs.stage}: ${fs.fertilizer} ${fs.amount}`, rate, fertType };
                }
            }
        }
    }
    return null;
}

function performCalculation(rawInput, rawDocs, intent) {
    if (!intent.isCalculationQuery || !intent.quantity) return null;

    const fertType = detectFertilizerType(rawInput);
    if (!fertType) {
        return {
            type: 'clarification_needed',
            message: 'কোন সার—ইউরিয়া, DAP, MOP, কেসিএ, নাকি মোট সার—এর হিসাব চান?',
            messageEn: 'Which fertilizer do you want to calculate—Urea, DAP, MOP, KCA, or total?',
        };
    }

    const extracted = extractRateFromKnowledge(rawDocs, fertType);
    if (!extracted) return null;

    const { rate, source } = extracted;
    const qty = intent.quantity;
    const unit = intent.quantityUnit || 'একর';

    let resultText;
    if (rate.min === rate.max) {
        const total = rate.min * qty;
        resultText = `${qty} ${unit} ${fertType}: ${source}\n= ${total} কেজি`;
    } else {
        const totalMin = rate.min * qty;
        const totalMax = rate.max * qty;
        resultText = `${qty} ${unit} ${fertType}: ${source}\n= ${totalMin}-${totalMax} কেজি`;
    }

    return {
        type: 'calculated',
        fertType,
        rate,
        quantity: qty,
        unit,
        resultText,
        source,
    };
}

function getEmergencyFallback(language) {
    if (language === 'english') {
        return `I'm experiencing a temporary issue, but I can still help you with agriculture advice.\n\n**General Recommendations:**\n1. Contact your local DAE office\n2. Visit BARI website: bari.gov.bd\n3. Consult with a local agriculture officer\n\n**Quick Tips:**\n- Use verified seeds from authorized dealers\n- Follow recommended fertilizer schedules\n- Practice integrated pest management (IPM)\n\n*For immediate help, call our hotline: 01829-775552*`;
    }
    return `আমি সাময়িক সমস্যার সম্মুখীন হচ্ছি, তবে কৃষি পরামর্শ দিতে পারছি।\n\n**সাধারণ পরামর্শ:**\n১. আপনার নিকটস্থ কৃষি সম্প্রসারণ অফিসে (DAE) যোগাযোগ করুন\n২. BARI ওয়েবসাইট: bari.gov.bd\n৩. স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন\n\n**দ্রুত পরামর্শ:**\n- অনুমোদিত ডিলার থেকে যাচাইকৃত বীজ ব্যবহার করুন\n- সুপারিশকৃত সারের সময়সূচি অনুসরণ করুন\n- একীভূত পোকামাকড় ব্যবস্থাপনা (IPM) অনুশীলন করুন\n\n*জরুরি সহায়তায় কল করুন: 01829-775552*`;
}

async function handleChatRequest(body) {
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
        crop: intent.cropName, disease: null, season: intent.season,
        intent: intent.primaryIntent, subIntent: intent.subIntent, limit: 6,
    });

    // ── Calculation handling ──
    let calculationResult = null;
    let clarificationMessage = null;

    // BUG 5: If fertilizer query but no crop detected, ask for crop
    if (intent.isFertilizerQuery && !intent.cropName && !clarificationMessage) {
        clarificationMessage = lang === 'english'
            ? 'Which crop do you need fertilizer information for? For example: rice, wheat, or tomato.'
            : 'কোন ফসলের জন্য সার সম্পর্কে জানতে চান? যেমন ধান, গম বা টমেটো।';
    }

    if (intent.isCalculationQuery && intent.primaryIntent === 'fertilizer' && !clarificationMessage) {
        const rawDocs = searchRawDocuments(rawInput, {
            crop: intent.cropName, disease: null, season: intent.season,
            intent: intent.primaryIntent, subIntent: intent.subIntent, limit: 6,
        });
        calculationResult = performCalculation(rawInput, rawDocs, intent);
        if (calculationResult && calculationResult.type === 'clarification_needed') {
            clarificationMessage = lang === 'english' ? calculationResult.messageEn : calculationResult.message;
        }
    }

    const cacheKey = getAnswerCacheKey(rawInput, intent);
    const cachedAnswer = clarificationMessage ? null : getCachedAnswer(cacheKey);
    const systemPrompt = buildSystemPrompt(lang);

    let userContext = rawInput;
    if (knowledgeContext && knowledgeContext.length > 50) userContext += `\n\n[KNOWLEDGE]:\n${knowledgeContext}`;
    if (productResults.context) userContext += `\n\n[PRODUCTS]:\n${productResults.context}`;
    if (calculationResult && calculationResult.type === 'calculated') {
        userContext += `\n\n[CALCULATION]:\n${calculationResult.resultText}\nSource: ${calculationResult.source}\nUse this verified calculation result in your answer. Do NOT recompute.`;
    }

    const enrichedMessages = [...messages];
    for (let i = enrichedMessages.length - 1; i >= 0; i--) {
        if (enrichedMessages[i].role === 'user') { enrichedMessages[i] = { ...enrichedMessages[i], content: userContext }; break; }
    }

    let response;
    let finalAnswer;

    if (clarificationMessage) {
        finalAnswer = clarificationMessage;
        response = { ok: true, reply: clarificationMessage, provider: 'clarification', model: 'intent', latency: 0 };
    } else if (cachedAnswer) {
        response = { ok: true, reply: cachedAnswer, provider: 'cache', model: 'cached', latency: 0 };
        finalAnswer = cachedAnswer;
    } else {
        response = await sendMessage(enrichedMessages, systemPrompt, { maxTokens: 800 });

        if (response.reply && response.reply.trim()) {
            finalAnswer = response.reply.trim();
        } else {
            const rawDocs = searchRawDocuments(rawInput, {
                crop: intent.cropName, disease: null, season: intent.season,
                intent: intent.primaryIntent, subIntent: intent.subIntent, limit: 5,
            });
            finalAnswer = generateKnowledgeAnswer(rawInput, rawDocs, productResults.context || '', lang, {
                intent: intent.primaryIntent, subIntent: intent.subIntent, calculationResult,
            });
        }
    }

    if (!finalAnswer || !finalAnswer.trim()) {
        finalAnswer = getEmergencyFallback(lang);
    }

    try {
        smartMemory.updateFromMessage(sessionId, rawInput, intent, languageResult);
    } catch (memErr) {
        console.warn('Memory update failed:', memErr.message);
    }

    try {
        if (!clarificationMessage && !cachedAnswer && response.ok) setCachedAnswer(cacheKey, finalAnswer, response.provider || 'knowledge');
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
    'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }
    if (req.method !== 'POST') {
        res.writeHead(405, corsHeaders);
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const result = await handleChatRequest(body);
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify(result));
    } catch (error) {
        console.error('Chat handler error:', error);
        const lang = 'bangla';
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
            reply: getEmergencyFallback(lang), language: lang, provider: 'emergency-fallback', model: 'knowledge-base', source: 'error-handler',
        }));
    }
}
