import { sendMessage, getAnswerCacheKey, getCachedAnswer, setCachedAnswer, buildKnowledgeFallback, getProviderStatus } from './_shared/provider-router.js';
import { processLanguage } from './_shared/agents/language.js';
import { detectIntent } from './_shared/agents/intent.js';
import { searchAndRankProducts } from './_shared/agents/product.js';
import { buildFullKnowledgeContext, searchRawDocuments, generateKnowledgeAnswer } from './_shared/agents/knowledge.js';
import { smartMemory } from './_shared/agents/memory.js';
import { deterministicRoute } from './_shared/deterministic-route.js';

function buildSystemPrompt(language) {
    if (language === 'english') {
        return `You are SF AI, Bangladeshi agriculture expert representing Sowrov Fertilizer company.

RULES:
- Answer ONLY the specific question the user asked.
- Do NOT summarize all retrieved knowledge. Use only what directly answers the question.
- If the question is about fertilizer, answer ONLY fertilizer information. Do NOT include disease information.
- If the question is about disease, answer ONLY disease information. Do NOT include fertilizer schedules or product promotions.
- If [CALCULATION - VERIFIED] is provided, that is the ONLY correct answer. Use it EXACTLY. Do NOT recompute. Do NOT use any other rate from [KNOWLEDGE]. Do NOT suggest alternative products.
- If you do not have enough information to answer, ask a short clarification question.
- Keep answers focused and concise.
- Use Bengali if the user writes in Bengali.
- Never invent fertilizer rates or sources not shown in the knowledge base.
- When a user asks about a SPECIFIC fertilizer (e.g. urea, DAP, Vermi, Tricho), answer ONLY about that specific product. Do NOT append other product recommendations, dosages, or promotions. If the user wants alternatives, they will ask.
- When a user asks a disease question, answer ONLY about the disease. Do NOT append fertilizer recommendations or product promotions.
- SOWROV PRODUCTS: Vermicompost and Trichoderma. Only recommend for generic fertilizer questions, NOT for disease/specific-fertilizer queries.
- SF VERIFIED RATES ALWAYS OVERRIDE [KNOWLEDGE] rates: Vermi = 1.5-2 tons/acre, Tricho = 2.5 kg/acre. Never use 6-8 tons/acre or 2.5-3 tons/acre from KB for SF products.
- VERMI SF RATE: 1.5-2 tons/acre (field). For 10 acres = 15-20 tons.
- TRICHO SF RATE: 2.5 kg/acre soil mix. For 10 acres = 25 kg.
- TRICHO TIMING (VERIFIED ONLY): (1) land preparation, (2) before planting/transplanting, (3) after planting/transplanting, (4) preventive application before disease appears, (5) when disease symptoms appear. Do NOT invent seed treatment rates, water volumes, repeat intervals, flower/fruit timing, or number of applications.
- Vermicompost = organic fertilizer for nutrition. Trichoderma = biocontrol for disease prevention.
- For product comparisons: explain functional differences (Vermi=nutrition, Tricho=disease control). Do NOT declare a winner. They serve different purposes and can be used together. Use ONLY verified SF rates if mentioning rates.
- Keep Vermi and Tricho facts clearly separated. Never mix them.`;
    }
    return `তোমি SF AI, বাংলাদেশ কৃষি বিশেষজ্ঞ — সৌরভ ফার্টিলাইজার কোম্পানির প্রতিনিধি।

নিয়মাবলী:
- শুধুমাত্র ব্যবহারকারীর জিজ্ঞাসার সরাসরি উত্তর দাও।
- সমস্ত জ্ঞান ভান্ডার সারসংক্ষেপ করো না। শুধু প্রাসঙ্গিক তথ্য ব্যবহার করো।
- সার সম্পর্কিত প্রশ্নে শুধু সার সম্পর্কিত তথ্য দাও। রোগের তথ্য যোগ করো না।
- রোগ সম্পর্কিত প্রশ্নে শুধু রোগের তথ্য দাও। সারের সময়সূচি বা পণ্য প্রচার যোগ করো না।
- [CALCULATION - VERIFIED] থাকলে সেটিই একমাত্র সঠিক উত্তর। এটি ঠিক তেমনই ব্যবহার করো। পুনরায় হিসাব করো না। [KNOWLEDGE] থেকে অন্য কোনো হার ব্যবহার করো না। অন্য পণ্য সুপারিশ করো না।
- পর্যাপ্ত তথ্য না থাকলে সংক্ষিপ্ত পরিষ্কারিকরণ প্রশ্ন করো।
- উত্তর কেন্দ্রীভূত ও সংক্ষিপ্ত রাখো।
- ব্যবহারকারী বাংলায় লিখলে বাংলায় উত্তর দাও।
- জ্ঞান ভান্ডারে না থাকা সারের হার বা উৎস তৈরি করো না।
- ব্যবহারকারী যদি নির্দিষ্ট সার (যেমন ইউরিয়া, DAP, ভার্মি, ট্রাইকো) সম্পর্কে জিজ্ঞাসা করে, শুধু সেই পণ্য সম্পর্কে উত্তর দাও। অন্য পণ্যের সুপারিশ, ডোজ বা প্রচার যোগ করো না।
- রোগ সম্পর্কিত প্রশ্নে শুধু রোগ সম্পর্কে উত্তর দাও। সারের সুপারিশ বা পণ্য প্রচার যোগ করো না।
- আমাদের পণ্য: ভার্মিকমপোস্ট ও ট্রাইকোডার্মা। শুধু সাধারণ সার প্রশ্নে সুপারিশ করো।
- SF যাচাইকৃত হার সবসময় [KNOWLEDGE] হারকে ওভাররাইড করে: ভার্মি = ১.৫-২ টন/একর, ট্রাইকো = ২.৫ কেজি/একর। KB থেকে ৬-৮ টন/একর বা ২.৫-৩ টন/একর ব্যবহার করো না।
- ভার্মি SF হার: ১.৫-২ টন/একর (মাঠ)। ১০ একর = ১৫-২০ টন।
- ট্রাইকো SF হার: ২.৫ কেজি/একর মাটিতে মেশান। ১০ একর = ২৫ কেজি।
- ট্রাইকো সময় (শুধু যাচাইকৃত): (১) জমি প্রস্তুতি, (২) রোপণ/চারা লাগানোর আগে, (৩) রোপণ/চারা লাগানোর পরে, (৪) রোগ হওয়ার আগে প্রতিরোধমূলক, (৫) রোগের লক্ষণ দেখা গেলে। বীজ আচ্ছাদন হার, পানির পরিমাণ, পুনরাবৃত্তি ব্যবধান, ফুল/ফল পর্যায় বা আবেদন সংখ্যা তৈরি করো না।
- ভার্মিকমপোস্ট জৈব সার — পুষ্টি সরবরাহ করে। ট্রাইকোডার্মা জৈব ছত্রাক — রোগ প্রতিরোধ করে।
- পণ্য তুলনায়: কার্যগত পার্থক্য ব্যাখ্যা করো (ভার্মি=পুষ্টি, ট্রাইকো=রোগ নিয়ন্ত্রণ)। কোনোটিকে সেরা বলো না। শুধু যাচাইকৃত SF হার ব্যবহার করো।
- ভার্মি ও ট্রাইকোর তথ্য আলাদা রাখো। কখনো মিশিয়ো না।`;
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
        { re: /(\d+[\.,]?\d*)\s*[-–—]\s*(\d+[\.,]?\d*)\s*(টন|ton|কেজি|kg|গ্রাম|g)/i, unitFromMatch: (m) => (m[3] || '').toLowerCase() },
        { re: /(\d+[\.,]?\d*)\s*(?:টন|ton|কেজি|kg|গ্রাম|g)\s*\/\s*(?:একর|acre|শতক|বিঘা)/i, unitFromMatch: (m) => { const u = m[0].match(/(টন|ton|কেজি|kg|গ্রাম|g)/i); return u ? u[1].toLowerCase() : ''; } },
        { re: /(\d+[\.,]?\d*)\s*[-–—]\s*(\d+[\.,]?\d*)/, unitFromMatch: () => null },
    ];
    for (const { re, unitFromMatch } of patterns) {
        const m = normalized.match(re);
        if (m) {
            const n1 = parseFloat(m[1].replace(',', '.'));
            const n2 = m[2] ? parseFloat(m[2].replace(',', '.')) : n1;
            const unit = unitFromMatch(m);
            if (!isNaN(n1) && n1 > 0) return { min: n1, max: n2, unit };
        }
    }
    return null;
}

function detectFertilizerType(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    const types = [
        { name: 'ভার্মিকমপোস্ট', aliases: ['ভার্মিকমপোস্ট', 'ভার্মিকম্পোস্ট', 'ভার্মিকমপোস্ত', 'ভার্মি', 'vermicompost', 'vermi'] },
        { name: 'ট্রাইকোডার্মা', aliases: ['ট্রাইকোডার্মা', 'ট্রাইকো', 'trichoderma', 'tricho'] },
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
            message: 'আপনার কোন সারের হিসাব দরকার—ভার্মিকমপোস্ট নাকি ট্রাইকোডার্মা? অন্য কোনো সার হলে নাম বলুন।',
            messageEn: 'Which SF product do you need—the quantity for Vermicompost or Trichoderma? If another fertilizer, please specify.',
        };
    }

    const SF_RATES = {
        'ভার্মিকমপোস্ট': { min: 1.5, max: 2, unit: 'টন', source: 'ভার্মিকমপোস্ট ১.৫-২ টন/একর (SF verified rate)' },
        'ট্রাইকোডার্মা': { min: 2.5, max: 2.5, unit: 'কেজি', source: 'ট্রাইকোডার্মা ২.৫ কেজি/একর মাটিতে মেশান (SF verified rate)' },
    };
    const sfRate = SF_RATES[fertType];
    if (sfRate) {
        const qty = intent.quantity;
        const inputUnit = intent.quantityUnit || 'একর';
        let resultText;
        if (sfRate.min === sfRate.max) {
            const total = sfRate.min * qty;
            resultText = `${qty} ${inputUnit} ${fertType}: ${sfRate.source}\n= ${total} ${sfRate.unit}`;
        } else {
            const totalMin = sfRate.min * qty;
            const totalMax = sfRate.max * qty;
            resultText = `${qty} ${inputUnit} ${fertType}: ${sfRate.source}\n= ${totalMin}-${totalMax} ${sfRate.unit}`;
        }
        return { type: 'calculated', fertType, rate: sfRate, quantity: qty, unit: inputUnit, resultText, source: sfRate.source };
    }

    const extracted = extractRateFromKnowledge(rawDocs, fertType);
    if (!extracted) return null;

    const { rate, source } = extracted;
    const qty = intent.quantity;
    const inputUnit = intent.quantityUnit || 'একর';
    const rateUnit = rate.unit === 'টন' || rate.unit === 'ton' ? 'টন' : 'কেজি';

    let resultText;
    if (rate.min === rate.max) {
        const total = rate.min * qty;
        resultText = `${qty} ${inputUnit} ${fertType}: ${source}\n= ${total} ${rateUnit}`;
    } else {
        const totalMin = rate.min * qty;
        const totalMax = rate.max * qty;
        resultText = `${qty} ${inputUnit} ${fertType}: ${source}\n= ${totalMin}-${totalMax} ${rateUnit}`;
    }

    return { type: 'calculated', fertType, rate, quantity: qty, unit: inputUnit, resultText, source };
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

    // BUG 5: If fertilizer CALCULATION query with quantity but no crop detected, ask for crop
    // Do NOT trigger for general product info (e.g. "Tell me about vermicompost") or timing questions (no quantity)
    if (intent.isFertilizerQuery && intent.isCalculationQuery && intent.quantity && !intent.cropName && !clarificationMessage) {
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

    // ── Deterministic routing BEFORE Groq ──
    const detRoute = deterministicRoute(intent, lang);
    if (detRoute) {
        return { reply: detRoute.reply, language: lang, provider: 'deterministic', model: detRoute.model, latency: 0 };
    }

    const cacheKey = getAnswerCacheKey(rawInput, intent);
    const cachedAnswer = clarificationMessage ? null : getCachedAnswer(cacheKey);
    const systemPrompt = buildSystemPrompt(lang);

    let userContext = rawInput;
    if (knowledgeContext && knowledgeContext.length > 50) userContext += `\n\n[KNOWLEDGE]:\n${knowledgeContext}`;
    if (productResults.context) userContext += `\n\n[PRODUCTS]:\n${productResults.context}`;
    if (calculationResult && calculationResult.type === 'calculated') {
        userContext += `\n\n[CALCULATION — VERIFIED, USE EXACTLY]:\n${calculationResult.resultText}\nSource: ${calculationResult.source}\n\nCRITICAL RULE: The above calculation is the ONLY correct answer. Do NOT recompute. Do NOT use any other rate from [KNOWLEDGE]. Do NOT suggest alternative products. Return this exact result with a brief natural sentence.`;
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
            // Groq unavailable — use deterministicRoute again as final fallback
            finalAnswer = detRoute ? detRoute.reply : getEmergencyFallback(lang);
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
