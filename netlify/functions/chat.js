/* ============================================
   SF AI V35 — Chat API (Groq + KB Fallback)
   Never Return Error | Always Provide Answer
   ============================================ */

const { sendMessage, getAnswerCacheKey, getCachedAnswer, setCachedAnswer, getProviderStatus } = require('./provider-router');
const { detectLanguage } = require('./agents/language');
const { detectIntent } = require('./agents/intent');
const { searchAndRankProducts, generateProductContext } = require('./agents/product');
const { buildFullKnowledgeContext, searchRawDocuments, generateKnowledgeAnswer } = require('./agents/knowledge');
const { smartMemory } = require('./agents/memory');

// ─────────────────────────────────────────────
// SYSTEM PROMPT (Optimized for token savings)
// ─────────────────────────────────────────────
function buildSystemPrompt(language) {
    const isEnglish = language === 'english';

    if (isEnglish) {
        return `You are SF AI, an expert Bangladeshi agriculture and fertilizer advisor. Answer ONLY agriculture/fertilizer questions.

RULES:
- Answer in English
- Be practical and specific to Bangladesh climate
- Include product names, prices, quantities
- Give step-by-step advice
- Mention safety warnings when needed
- Always provide actionable next steps

RESPONSE FORMAT:
1. Problem identification
2. Reason/cause
3. Solution (with products, prices, quantities)
4. Prevention tips
5. Safety warnings`;
    }

    return `তোমি SF AI, একজন বিশেষজ্ঞ বাংলাদেশ কৃষি ও সার পরামর্শদাতা। শুধুমাত্র কৃষি/সার সম্পর্কিত প্রশ্নের উত্তর দাও।

নিয়ম:
- বাংলায় উত্তর দাও
- বাংলাদেশের জলবায়ু অনুযায়ী ব্যবহারিক পরামর্শ দাও
- পণ্যের নাম, দাম, পরিমাণ উল্লেখ করো
- ধাপে ধাপে পরামর্শ দাও
- নিরাপত্তা সতর্কতা দাও
- সবসময় পরবর্তী পদক্ষেপ জানাও

উত্তর ফরম্যাট:
১. সমস্যা চিহ্নিতকরণ
২. কারণ
৩. সমাধান (পণ্য, দাম, পরিমাণ)
৪. প্রতিরোধ
৫. নিরাপত্তা সতর্কতা`;
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
async function handleChatRequest(body) {
    const { messages = [], sessionId = 'default' } = body;

    // Extract user input
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    const rawInput = lastUserMsg?.content || '';

    // 1. Detect language
    const language = detectLanguage(rawInput);

    // 2. Detect intent
    const intent = detectIntent(rawInput, { language });

    // 3. Product search (only if intent suggests product need)
    let productResults = { products: [], context: '' };
    if (intent.needsProduct || intent.type === 'product' || intent.type === 'fertilizer') {
        productResults = await searchAndRankProducts(rawInput, intent, { language });
    }

    // 4. Knowledge retrieval
    const knowledgeContext = buildFullKnowledgeContext(rawInput, {
        crop: intent.cropName,
        disease: intent.diseaseName,
        season: intent.season,
        intent: intent.type,
        limit: 8,
    });

    // 5. Check cache
    const cacheKey = getAnswerCacheKey(rawInput, intent);
    const cachedAnswer = getCachedAnswer(cacheKey);

    // 6. Build system prompt
    const systemPrompt = buildSystemPrompt(language);

    // 7. Build user message context
    let userContext = rawInput;
    if (knowledgeContext && knowledgeContext.length > 50) {
        userContext += `\n\n[KNOWLEDGE_BASE]:\n${knowledgeContext}`;
    }
    if (productResults.context) {
        userContext += `\n\n[PRODUCTS]:\n${productResults.context}`;
    }

    // Replace last user message with enriched context
    const enrichedMessages = [...messages];
    for (let i = enrichedMessages.length - 1; i >= 0; i--) {
        if (enrichedMessages[i].role === 'user') {
            enrichedMessages[i] = { ...enrichedMessages[i], content: userContext };
            break;
        }
    }

    // 8. Get response (Groq + KB fallback)
    let response;
    if (cachedAnswer) {
        response = {
            ok: true,
            reply: cachedAnswer,
            provider: 'cache',
            model: 'cached',
            latency: 0,
        };
    } else {
        response = await sendMessage(enrichedMessages, systemPrompt, {
            maxTokens: 1200,
        });
    }

    // 9. Build final answer
    let finalAnswer;

    if (response.reply) {
        // Groq or cache gave us an answer
        finalAnswer = response.reply;
    } else {
        // Groq failed — use knowledge base fallback with structured answer
        const rawDocs = searchRawDocuments(rawInput, {
            crop: intent.cropName,
            disease: intent.diseaseName,
            season: intent.season,
            intent: intent.type,
            limit: 5,
        });
        finalAnswer = generateKnowledgeAnswer(rawInput, rawDocs, productResults.context || '', language);
    }

    // 10. Handle memory
    const session = smartMemory.getSession(sessionId);
    smartMemory.updateSession(sessionId, {
        lastIntent: intent.type,
        crop: intent.cropName || session.crop,
        language,
        lastActivity: Date.now(),
    });

    // 11. Cache the answer
    if (!cachedAnswer && response.ok) {
        setCachedAnswer(cacheKey, finalAnswer, response.provider || 'knowledge');
    }

    return {
        reply: finalAnswer,
        language,
        intent,
        productCount: productResults.products?.length || 0,
        cached: !!cachedAnswer,
        provider: response.provider || 'knowledge',
        model: response.model || 'knowledge-base',
        latency: response.latency || 0,
        source: 'chat-api',
    };
}

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
module.exports = { handleChatRequest, getProviderStatus };

// ─────────────────────────────────────────────
// NETLIFY FUNCTIONS HANDLER
// ─────────────────────────────────────────────
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const result = await handleChatRequest(body);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Chat handler error:', error);

        // V35: NEVER return error to user — always provide a fallback answer
        const isEnglish = false;
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                reply: `আমি এখন সাময়িক সমস্যার সম্মুখীন হচ্ছি। তবে আমাদের কৃষি জ্ঞান ভান্ডার থেকে আপনি তথ্য পেতে পারেন।

**সাধারণ পরামর্শ:**
- আপনার স্থানীয় কৃষি সম্প্রসারণ অফিসে (DAE) যোগাযোগ করুন
- BARI ওয়েবসাইট: bari.gov.bd
- স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন

*আবার চেষ্টা করুন অথবা আমাদের হটলাইনে কল করুন: 01829-775552*`,
                language: 'bangla',
                provider: 'emergency-fallback',
                model: 'knowledge-base',
                source: 'error-handler',
            }),
        };
    }
};
