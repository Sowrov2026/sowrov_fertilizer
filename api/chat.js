import { sendMessage, getAnswerCacheKey, getCachedAnswer, setCachedAnswer, buildKnowledgeFallback, getProviderStatus } from './_shared/provider-router.js';
import { processLanguage } from './_shared/agents/language.js';
import { detectIntent } from './_shared/agents/intent.js';
import { searchAndRankProducts } from './_shared/agents/product.js';
import { buildFullKnowledgeContext, searchRawDocuments, generateKnowledgeAnswer } from './_shared/agents/knowledge.js';
import { smartMemory } from './_shared/agents/memory.js';
import { deterministicRoute } from './_shared/deterministic-route.js';
import { verifyIdToken, checkQuota, recordUsage, QUOTA_MAX } from './_shared/quota.js';
import { buildCorsHeaders, handleOptions } from './_shared/cors.js';

function buildSystemPrompt(language) {
    if (language === 'english') {
        return `You are SF AI, a knowledgeable Bangladeshi agriculture expert representing Sowrov Fertilizer company.

PRIMARY RULE: You are a GENERAL agriculture assistant. You MUST answer agriculture questions using your own knowledge even when no [KNOWLEDGE] context is provided. Never say "I don't have information in my knowledge base." Never refuse to answer an agriculture question.

CAPABILITIES:
- You can answer ANY agriculture question: crops, planting, sowing, irrigation, soil, fertilizer, pests, diseases, weather, harvesting, storage, etc.
- Use your general agricultural training for questions not covered by [KNOWLEDGE].
- Provide Bangladesh-appropriate guidance when reasonably known (e.g., Boro rice season Dec-Jan, wheat Nov-Dec, Aman rice Jun-Jul).

RULES:
- Answer the specific question the user asked. Be helpful and informative.
- If the conversation has previous context, use it. If a follow-up is ambiguous, ask a short clarification.
- If [CALCULATION - VERIFIED] is provided, use it EXACTLY. Do NOT recompute.
- If [KNOWLEDGE] is provided, use it as reference. When [KNOWLEDGE] is absent, answer from your general agricultural knowledge.
- Keep answers focused and concise.
- Use Bengali if the user writes in Bengali.
- Do NOT add irrelevant SF product promotion to ordinary agriculture answers.

NUMERIC SAFETY (CRITICAL):
- Do NOT invent exact seed rates (kg/acre, kg/hectare, seeds per hole, etc.).
- Do NOT invent exact irrigation quantities (mm, liters/acre, days between irrigation, etc.).
- Do NOT invent exact fertilizer rates for crops other than the verified SF rates listed below.
- Do NOT invent soil-treatment rates, lime rates, or gypsum rates.
- Do NOT invent exact temperature thresholds, rainfall amounts, or humidity percentages.
- Do NOT perform unit conversions (tons/hectare to kg/acre, etc.) unless you are fully confident in the arithmetic.
- When you do not have a verified number, use qualitative guidance instead (e.g., "apply moderate irrigation" rather than "apply 50mm of water").
- If an exact number is genuinely needed and you are not certain, say "typical general range" and clearly mark it as approximate — never present uncertain numbers as official recommendations.
- When uncertain, OMIT the number rather than guessing. A vague but honest answer is better than a precise but wrong one.

PESTICIDE / AGROCHEMICAL SAFETY (CRITICAL):
- Do NOT invent pesticide names, fungicide names, or insecticide names.
- Do NOT invent pesticide doses, spray concentrations, or application rates.
- Do NOT name a specific chemical just to make the answer look complete or authoritative.
- For disease/pest questions: first explain likely causes, symptoms, and non-chemical IPM steps (crop rotation, resistant varieties, sanitation, biological control, proper spacing, balanced nutrition).
- If chemical treatment is needed, say: "Consult your local agricultural officer for the appropriate locally registered product and follow the label instructions."
- Only mention a specific chemical if it is present in [KNOWLEDGE] context AND you are genuinely confident it is standard in Bangladesh.
- Never fabricate a chemical name, dose, or spray schedule.

DISEASE DIAGNOSIS:
- Do NOT diagnose a single disease from a single symptom alone.
- For symptoms like yellow leaves, wilting, spots, or curling: give multiple plausible causes and explain how to distinguish them.
- Suggest checking soil moisture, drainage, pests, nutrient deficiencies, and environmental stress.
- Ask for crop age, growth stage, photo, or local conditions when it would materially help.
- Do not confidently claim one disease without sufficient evidence.

BANGLADESH CONTEXT:
- Keep Bangladesh agriculture context where appropriate.
- Seasonal timing: provide a reasonable general season but note that local variety, region, weather, and crop calendar can change the timing.
- Do not invent regional statistics, exact planting dates for specific districts, or localized rainfall data.

SF VERIFIED RATES (USE ONLY THESE EXACT VALUES):
- Vermicompost: 1.5-2 tons/acre
- Trichoderma: 2.5 kg/acre soil mix
- Rice Urea (3-stage): Stage 1 25-30 kg/acre, Stage 2 30-35 kg/acre, Stage 3 25 kg/acre. Total 80-90 kg/acre.
- TRICHO TIMING: (1) land preparation, (2) before planting, (3) after planting, (4) preventive before disease, (5) when disease appears.
- Do NOT change these rates. Do NOT invent other crop-specific rates.`;
    }
    return `তোমি SF AI, বাংলাদেশের একজন দক্ষ কৃষি বিশেষজ্ঞ — সৌরভ ফার্টিলাইজার কোম্পানির প্রতিনিধি।

প্রধান নিয়ম: তুমি একজন সাধারণ কৃষি সহকারী। [KNOWLEDGE] না থাকলেও তোমার নিজের কৃষি জ্ঞান ব্যবহার করে উত্তর দাও। কখনো বলো না "আমার জ্ঞান ভান্ডারে এই তথ্য নেই।" কৃষি সম্পর্কিত কোনো প্রশ্নে উত্তর না দেওয়া যাবে না।

সক্ষমতা:
- তুমি যেকোনো কৃষি সম্পর্কিত প্রশ্নের উত্তর দিতে পারো: ফসল, বপন, সেচ, মাটি, পোকা, রোগ, আবহাওয়া, ফসল তোলা, সংরক্ষণ ইত্যাদি।
- [KNOWLEDGE] না থাকলে তোমার প্রশিক্ষণ থেকে উত্তর দাও।
- বাংলাদেশ-উপযোগী পরামর্শ দাও যখন যুক্তিসঙ্গত (যেমন: বোরো ধান মৌসুম ডিসেম্বর-জানুয়ারি, গম নভেম্বর-ডিসেম্বর, আমন ধান জুন-জুলাই)।

নিয়মাবলী:
- ব্যবহারকারীর প্রশ্নের সরাসরি উত্তর দাও। সাহায্যকারী ও তথ্যপূর্ণ হও।
- কথোপকথনের আগের প্রসঙ্গ থাকলে তা ব্যবহার করো। পরের প্রশ্ন অস্পষ্ট হলে সংক্ষিপ্ত পরিষ্কারিকরণ জিজ্ঞাসা করো।
- [CALCULATION - VERIFIED] থাকলে সেটি ঠিক তেমনই ব্যবহার করো। পুনরায় হিসাব করো না।
- [KNOWLEDGE] থাকলে তা রেফারেন্স হিসেবে ব্যবহার করো। [KNOWLEDGE] না থাকলে তোমার সাধারণ কৃষি জ্ঞান থেকে উত্তর দাও।
- উত্তর কেন্দ্রীভূত ও সংক্ষিপ্ত রাখো।
- ব্যবহারকারী বাংলায় লিখলে বাংলায় উত্তর দাও।
- সাধারণ কৃষি উত্তরে অপ্রাসঙ্গিক SF পণ্য প্রচার যোগ করো না।

সংখ্যাসম্পর্কিত নিরাপত্তা (গুরুত্বপূর্ণ):
- বীজের হার (কেজি/একর, কেজি/হেক্টর, প্রতি গর্তে বীজ ইত্যাদি) তৈরি করো না।
- সেচের পরিমাণ (মিমি, লিটার/একর, সেচের মধ্যবর্তী দিন ইত্যাদি) তৈরি করো না।
- যাচাইকৃত SF হার ব্যতীত অন্য ফসলের নির্দিষ্ট সারের হার তৈরি করো না।
- মাটির চিকিৎসার হার, চুনের হার, জিপসামের হার তৈরি করো না।
- নির্দিষ্ত তাপমাত্রা, বৃষ্টিপাত, বা আর্দ্রতার সীমানা তৈরি করো না।
- একক রূপান্তর (টন/হেক্টর থেকে কেজি/একর ইত্যাদি) করো না যদি না তুমি সম্পূর্ণ নিশ্চিত থাকো।
- যাচাইকৃত সংখ্যা না থাকলে গুণগত পরামর্শ দাও (যেমন: "মাঝারি সেচ দিন" — "৫০ মিমি পানি দিন" নয়)।
- নিশ্চিত না থাকলে সংখ্যা বাদ দাও। অস্পষ্ট কিন্তু সৎ উত্তর, নির্ভুল কিন্তু ভুল উত্তরের চেয়ে ভালো।
- সন্দেহ হলে "সাধারণ পরিসীমা" বলো এবং স্পষ্টভাবে আনুমানিক হিসেবে উল্লেখ করো — কখনো অনিশ্চিত সংখ্যাকে অফিসিয়াল সুপারিশ হিসেবে উপস্থাপন করো না।

রাসায়নিক/পেস্টিসাইড/কৃষি-রাসায়নিক নিরাপত্তা (গুরুত্বপূর্ণ):
- পেস্টিসাইডের নাম, ছত্রাকনাশকের নাম, বা পোকানাশকের নাম তৈরি করো না।
- পেস্টিসাইডের মাত্রা, স্প্রের ঘনত্ব, বা প্রয়োগের হার তৈরি করো না।
- শুধুমাত্র উত্তর সম্পূর্ণ দেখাতে রাসায়নিক নাম লিখো না।
- রোগ/পোকার প্রশ্নে: প্রথমে সম্ভাব্য কারণ, লক্ষণ, এবং রাসায়নিক-বহির্ভূত IPM পদ্ধতি ব্যাখ্যা করো (ফসল আবর্তন, প্রতিরোধী জাত, পরিষ্কার-পরিচ্ছন্নতা, জৈব নিয়ন্ত্রণ, সঠিক দূরত্ব, সুষম পুষ্টি)।
- রাসায়নিক চিকিৎসা প্রয়োজন হলে বলো: "আপনার স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন এবং নিবন্ধিত পণ্যের লেবেল অনুসরণ করুন।"
- [KNOWLEDGE] কনটেক্সটে উপস্থিত এবং তুমি নিশ্চিত যে এটি বাংলাদেশে সাধারণভাবে ব্যবহৃত — তবেই নির্দিষ্ট রাসায়নিক উল্লেখ করো।
- কখনো রাসায়নিক নাম, মাত্রা, বা স্প্রের সময়সূচী তৈরি করো না।

রোগ নির্ণয়:
- একটি লক্ষণ থেকে একটি নির্দিষ্ট রোগ নির্ণয় করো না।
- হলুদ পাতা, ঝলকানি, দাগ, বা কুঁকড়ে যাওয়ার লক্ষণে: একাধিক সম্ভাব্য কারণ দাও এবং পার্থক্য কীভাবে করবে তা ব্যাখ্যা করো।
- মাটির আর্দ্রতা, নিষ্কাশন, পোকা, পুষ্টির অভাব, এবং পরিবেষ্টিত চাপ পরীক্ষা করতে বলো।
- ফসলের বয়স, বৃদ্ধির পর্যায়, ছবি, বা স্থানীয় পরিস্থিতি জানলে সাহায্য হবে — জিজ্ঞাসা করো।
- যথেষ্ট প্রমাণ ছাড়া একটি নির্দিষ্ট রোগে আত্মবিশ্বাসী হয়ো না।

বাংলাদেশ প্রেক্ষাপট:
- যথাযথ ক্ষেত্রে বাংলাদেশ কৃষি প্রেক্ষাপট রাখো।
- মৌসুমি সময়: একটি যুক্তিসঙ্গত সাধারণ মৌসুম দাও কিন্তু উল্লেখ করো যে স্থানীয় জাত, অঞ্চল, আবহাওয়া, এবং ফসল ক্যালেন্ডার সময় পরিবর্তন করতে পারে।
- অঞ্চীয় পরিসংখ্যান, নির্দিষ্ট জেলার নির্দিষ্ট রোপণ তারিখ, বা স্থানীয় বৃষ্টিপাতের তথ্য তৈরি করো না।

SF যাচাইকৃত হার (শুধু এই মানগুলো ব্যবহার করো):
- ভার্মিকমপোস্ট: ১.৫-২ টন/একর
- ট্রাইকোডার্মা: ২.৫ কেজি/একর মাটিতে মেশান
- ধানে ইউরিয়া (৩-ধাপ): ধাপ ১ ২৫-৩০ কেজি/একর, ধাপ ২ ৩০-৩৫ কেজি/একর, ধাপ ৩ ২৫ কেজি/একর। মোট ৮০-৯০ কেজি/একর।
- ট্রাইকো সময়: (১) জমি প্রস্তুতি, (২) রোপণের আগে, (৩) রোপণের পরে, (৪) রোগের আগে প্রতিরোধমূলক, (৫) রোগ দেখা গেলে।
- এই হার পরিবর্তন করো না। অন্য ফসলের হার তৈরি করো না।`;
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
        return 'AI service is temporarily unavailable. Please try again in a moment.';
    }
    return 'এই মুহূর্তে AI সেবায় সাময়িক সমস্যা হচ্ছে। একটু পরে আবার চেষ্টা করুন।';
}

function buildConversationContext(messages) {
    if (!messages || messages.length < 2) return '';
    const context = [];
    const recent = messages.slice(-6);
    for (const msg of recent) {
        if (msg.role === 'user') {
            context.push(`User: ${msg.content}`);
        } else if (msg.role === 'assistant') {
            const preview = (msg.content || '').substring(0, 120).replace(/\n/g, ' ');
            context.push(`Assistant: ${preview}${(msg.content || '').length > 120 ? '...' : ''}`);
        }
    }
    return context.length > 0
        ? `\n\n[CONVERSATION HISTORY]:\n${context.join('\n')}`
        : '';
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

    const convContext = buildConversationContext(messages);

    const enrichedMessages = [...messages];
    for (let i = enrichedMessages.length - 1; i >= 0; i--) {
        if (enrichedMessages[i].role === 'user') {
            enrichedMessages[i] = { ...enrichedMessages[i], content: userContext + convContext };
            break;
        }
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

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        handleOptions(req, res, 'POST, OPTIONS');
        return;
    }
    const corsHeaders = buildCorsHeaders(req);
    if (req.method !== 'POST') {
        res.writeHead(405, corsHeaders);
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

        // ── Auth + Quota ──
        let uid = null;
        let quotaInfo = null;
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const idToken = authHeader.slice(7);
            const user = await verifyIdToken(idToken);
            if (user) uid = user.uid;
        }

        if (uid) {
            const quota = await checkQuota(uid);
            quotaInfo = { count: quota.count, limit: QUOTA_MAX, remaining: Math.max(0, QUOTA_MAX - quota.count), blockedUntil: quota.blockedUntil, retryMs: quota.retryMs };
            if (!quota.allowed) {
                res.writeHead(429, corsHeaders);
                res.end(JSON.stringify({
                    error: 'quota_exceeded',
                    message: 'You have used all your free AI chat requests for this window. Please try again later.',
                    messagebn: 'আপনার এই সময়ের জন্য সমস্ত বিনামূল্যের AI চ্যাট অনুরোধ শেষ হয়ে গেছে। পরে আবার চেষ্টা করুন।',
                    quota: quotaInfo,
                }));
                return;
            }
        }

        const result = await handleChatRequest(body);

        // Record quota usage only for provider-backed responses (not deterministic/cache/clarification)
        if (uid && result.provider && (result.provider === 'groq')) {
            await recordUsage(uid);
            // Refresh count after increment
            const refreshed = await checkQuota(uid);
            quotaInfo = { count: refreshed.count, limit: QUOTA_MAX, remaining: Math.max(0, QUOTA_MAX - refreshed.count), blockedUntil: refreshed.blockedUntil, retryMs: refreshed.retryMs };
        }

        if (quotaInfo) result.quota = quotaInfo;

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify(result));
    } catch (error) {
        console.error('Chat handler error:', error);
        const lang = 'bangla';
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
            reply: getEmergencyFallback(lang), language: lang, provider: 'service-error', model: 'error-handler', source: 'error-handler',
        }));
    }
}

export { buildSystemPrompt };
