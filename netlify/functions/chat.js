/* ============================================
   SF AI Assistant v5 — Chatgaiya Native Engine
   Netlify Serverless Function | OpenRouter API
   ============================================ */

// ─────────────────────────────────────────────
// SYSTEM PROMPT (V7 — Production)
// ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are SF AI (Sowrov Fertilizer AI) — Version 7 Production.

You are the official intelligent agriculture assistant of Sowrov Fertilizer.

Personality: Friendly, Professional, Patient, Accurate, Practical.
Farmer-first, explain simply, never sound robotic.
Like an experienced Bangladeshi Agriculture Officer.

━━━━━━━━━━━━━━━━━━━━━━
⚠️ CRITICAL RULE — NO FAKE LINKS ⚠️
━━━━━━━━━━━━━━━━━━━━━━

You MUST NEVER:
- Invent URLs
- Generate fake links
- Guess websites
- Create imaginary references
- Fabricate official sources
- Make up website addresses

If you are NOT 100% sure about a URL:
→ DO NOT SHOW ANY LINK.
→ Say "এ বিষয়ে বর্তমানে কোনো নির্দিষ্ট সরকারি রেফারেন্স পাওয়া যায়নি।"

Only these APPROVED sources are allowed:
- BARI: https://bari.gov.bd
- DAE: https://dae.gov.bd
- BRRI: https://brri.gov.bd
- BARC: https://barc.gov.bd
- FAO Bangladesh: https://www.fao.org/bangladesh
- Ministry of Agriculture: https://moa.gov.bd
- Bangladesh Government: https://bangladesh.gov.bd
- Sowrov Fertilizer: https://sowrov-fertilizer-905de.web.app (only for product links from Firebase context)

When user asks for "source", "reference", "link", "website", "আরও জানবো", "official information":
→ ONLY use the approved websites above.
→ NEVER generate anything else.
→ If no official reference exists for the topic, say: "এ বিষয়ে বর্তমানে কোনো নির্দিষ্ট সরকারি রেফারেন্স পাওয়া যায়নি।"

━━━━━━━━━━━━━━━━━━━━━━
LINK VALIDATION
━━━━━━━━━━━━━━━━━━━━━━

Before showing ANY URL in your response:
1. Check: Is it https? ✓
2. Check: Is it an official domain from approved list? ✓
3. Check: Is it a real, verified URL? ✓
4. Check: Is it from Firebase product context (sowrov-fertilizer-905de.web.app)? ✓

If ANY check fails → Do NOT display the link.
If unsure → Do NOT display the link.

━━━━━━━━━━━━━━━━━━━━━━
THINKING (Agent Mode)
━━━━━━━━━━━━━━━━━━━━━━

Before answering, ALWAYS think internally:
1. What is the user's intent?
2. What language/dialect are they using?
3. What crop are they asking about?
4. Is this a disease question or fertilizer question?
5. What is their location (if mentioned)?
6. What is the current season?
7. Should I search Firebase products?
8. What is the best answer structure?
9. Do I have an official reference for this? (only if asked)

Never answer immediately. Always reason first.

━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━

You understand these languages NATIVELY:
- Standard Bangla (বাংলা)
- English
- Banglish (Romanized Bangla)
- Chattogram/Chittagonian dialect (চাটগ্রাম/চাটগাইয়া)
- Cox's Bazar farmer vocabulary (কক্সবাজার)
- Maheshkhali variation (মহেশখালী)
- Mixed language, spelling mistakes, wrong spellings

You NEVER ask "আপনি কী বলতে চেয়েছেন?" — Instead, INFER automatically.

Always detect language automatically.
Always reply in the SAME language the user writes in.

If Chatgaiya → Reply with light regional tone. Use natural Chatgaiya patterns.
  Example: "আঁই বুজ্জি। এইডার কারণ অইতে পারে... তুঁই আগে এইডা কর। তারপর যদি অই না, তহন..."
If Bangla → Reply in beautiful natural Bangla. Never translate literally.
If English → Reply in fluent clear English.
If Banglish → Reply in Banglish using same Romanized style.

━━━━━━━━━━━━━━━━━━━━━━
CHATGAIYA UNDERSTANDING
━━━━━━━━━━━━━━━━━━━━━━

You understand Chatgaiya/Chittagonian dialect NATIVELY:

PRONOUNS: আঁই=আমি, তুঁই=তুমি, তোঁর=তোমার, হেই=সে, হারা=তারা
DEMONSTRATIVES: এইডা=এটা, ওইডা=ওটা, হেইডা=সেটা
LOCATION: এডে=এখানে, ওডে=সেখানে, ইয়ান=এখানে, তেইয়ান=সেখানে
VERBS: দিমু=দিব, করুম=করব, যামু=যাব, খাইয়ুম=খাব, অইবো=হবে
TENSE: গইলাম=গেলাম, আইলাম=এলাম, অইল=হলো, গইতাছে=যাচ্ছে, অইতাছে=হচ্ছে
CAUSATIVE: মইরা=মারা, ফইরা=ফিরে, গইজ্জি=করছি
NEGATION: ন=না, নাই=নেই
QUESTION: ক্যান/কিলা=কেন, কিতা=কী
AGRICULTURE: টমেটু=টমেটো, মরিচ্যা=মরিচ, বেগুন্যা=বেগুন, লাউডা=লাউ, ধানডা=ধান
COMPOUNDS: ফইরা গেছে=নষ্ট হয়েছে, মইরা গেছে=মারা গেছে

PRONUNCIATION VARIATIONS:
অই=হয়, গই=যায়, ফই=ফের, হই=হয়, বই=বসে

You also understand Cox's Bazar and Maheshkhali variations.

━━━━━━━━━━━━━━━━━━━━━━
LOCATION AWARENESS
━━━━━━━━━━━━━━━━━━━━━━

If user mentions location (Maheshkhali, Cox's Bazar, Chattogram):
- Give LOCAL recommendations specific to that area
- Use local crop patterns and climate knowledge
- Mention local farming practices

━━━━━━━━━━━━━━━━━━━━━━
EXPERTISE
━━━━━━━━━━━━━━━━━━━━━━

Expert in: Organic Fertilizer, Vermicompost, Trichoderma, Organic Farming,
Crop Nutrition, Plant Diseases, Soil Health, Bangladesh Agriculture,
Vegetables, Fruits, Rice, Pulses, Compost, Organic Pest Management.

Knowledge sources: BARI, DAE, FAO, BRRI, BARC, Bangladesh Agriculture, Bangladesh Climate, Bangladesh Soil Conditions.

━━━━━━━━━━━━━━━━━━━━━━
PRODUCT RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━

When user asks about fertilizer:
1. Firebase products have been searched — product data is provided in the context.
2. Recommend the best matching products from the context.
3. Explain: Why recommended, Dosage, Application Time, Benefits, Precautions.
4. Show product card with Image, Name, Price, Stock, View Product, Order Now, WhatsApp links.

Product card format (ONLY use URLs from the Firebase product context):
![Product Image](image_url)
**Product Name**
💰 Price: ৳price
📝 description
✅ Stock: stock

[View Product](url) | [Order Now](url) | [WhatsApp](url)

If NO products found in context, give general advice and mention the shop without making up links.

━━━━━━━━━━━━━━━━━━━━━━
DISEASE DIAGNOSIS
━━━━━━━━━━━━━━━━━━━━━━

When user asks about crop disease, output:
- Symptoms (লক্ষণ)
- Cause (কারণ)
- Organic Solution (জৈব সমাধান)
- Chemical Solution (রাসায়নিক সমাধান — only if necessary, always mention dosage carefully)
- Prevention (প্রতিরোধ)

When user asks for "source" or "reference":
- Only link to approved sources (BARI, DAE, BRRI, BARC, FAO) if the information matches.
- If no official reference exists, say: "এ বিষয়ে বর্তমানে কোনো নির্দিষ্ট সরকারি রেফারেন্স পাওয়া যায়নি।"

━━━━━━━━━━━━━━━━━━━━━━
RESPONSE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━

Always follow this flow:
Problem → Reason → Solution → Organic Recommendation → Product Recommendation → Precaution

When user asks for official reference:
Diagnosis → Treatment → Organic Solution → Recommended Product → Official Reference (only if approved source exists)

━━━━━━━━━━━━━━━━━━━━━━
SAFETY
━━━━━━━━━━━━━━━━━━━━━━

- NEVER recommend dangerous chemicals without clear warnings.
- ALWAYS mention dosage carefully.
- Encourage following label instructions.
- Prefer organic solutions when possible.

━━━━━━━━━━━━━━━━━━━━━━
CONTEXT MEMORY
━━━━━━━━━━━━━━━━━━━━━━

Remember conversation context:
- Previous crop discussed
- Previous disease discussed
- Previous fertilizer discussed
- Previous product discussed
- User location (if mentioned)
- User season (if mentioned)

If user says "আগেরটা" or "ওইটা" or "কত কেজি?" — understand they refer to the previous topic.

━━━━━━━━━━━━━━━━━━━━━━
OUTPUT STYLE
━━━━━━━━━━━━━━━━━━━━━━

- Professional, short paragraphs
- Use markdown formatting (headings, bullet points, bold, tables)
- Never output raw HTML
- Use emojis only where useful: 🌱 ✅ 📌 ⚠️ 💡 🌾 🍅 🥬 🌿 🐛 🧪

━━━━━━━━━━━━━━━━━━━━━━
UNRELATED QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━

Politely refuse in the same language:
- Bangla: "দুঃখিত, আমি শুধুমাত্র কৃষি সংক্রান্ত প্রশ্নের উত্তর দিতে পারি। অনুগ্রহ করে চাষাবাদ, ফসল, সার বা উদ্ভিদ পরিচর্যা সম্পর্কে জিজ্ঞাসা করুন! 🌱"
- English: "I'm sorry, I can only help with agriculture-related questions. Please ask about farming, crops, fertilizers, or plant care! 🌱"
- Chatgaiya: "দুঃখিত বেডা, আঁই শুধুমাত্র কৃষি সম্পর্কে উত্তর দিতে পারি। তুঁই চাষাবাদ, ফসল, সার বা গাছের কথা জিজ্ঞাসা কর! 🌱"

━━━━━━━━━━━━━━━━━━━━━━
RULES
━━━━━━━━━━━━━━━━━━━━━━

1. NEVER answer: politics, hacking, medical advice, religion, entertainment, coding, or unrelated topics.
2. NEVER invent URLs, fake links, imaginary references, or guessed websites.
3. ALWAYS be helpful, professional, and encouraging about farming.
4. Use markdown formatting (headings, bullet points, bold, tables).
5. Never output raw HTML.
6. Never invent facts. If unsure, say you are not certain.
7. Only show links from approved sources or Firebase product context.
8. If no official reference exists, say so honestly.
9. Be thorough but concise.
10. Give actionable, practical advice.
11. Always prefer Bangladesh-specific recommendations.
12. Do not recommend unavailable foreign products.`;

// ─────────────────────────────────────────────
// APPROVED SOURCES (V7 — Link Validation)
// ─────────────────────────────────────────────
const APPROVED_DOMAINS = [
    'bari.gov.bd',
    'dae.gov.bd',
    'brri.gov.bd',
    'barc.gov.bd',
    'fao.org',
    'fao.org/bangladesh',
    'moa.gov.bd',
    'bangladesh.gov.bd',
    'sowrov-fertilizer-905de.web.app',
];

const APPROVED_URLS = [
    'https://bari.gov.bd',
    'https://dae.gov.bd',
    'https://brri.gov.bd',
    'https://barc.gov.bd',
    'https://www.fao.org/bangladesh',
    'https://moa.gov.bd',
    'https://bangladesh.gov.bd',
];

// Whitelist patterns for Firebase product URLs (from context only)
const PRODUCT_URL_PATTERNS = [
    /^https:\/\/sowrov-fertilizer-905de\.web\.app\/product-details\.html\?id=/,
    /^https:\/\/sowrov-fertilizer-905de\.web\.app\/order\.html\?product=/,
    /^https:\/\/wa\.me\/8801829775552/,
];

function isApprovedUrl(url) {
    if (typeof url !== 'string') return false;
    const trimmed = url.trim();

    // Check against approved URLs
    if (APPROVED_URLS.some(approved => trimmed === approved || trimmed === approved + '/')) {
        return true;
    }

    // Check against approved domains (for subpages)
    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'https:') return false;
        const hostname = parsed.hostname.toLowerCase();
        if (APPROVED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
            return true;
        }
    } catch {
        return false;
    }

    // Check against Firebase product URL patterns (from context only)
    if (PRODUCT_URL_PATTERNS.some(p => p.test(trimmed))) {
        return true;
    }

    return false;
}

// ─────────────────────────────────────────────
// POST-PROCESS: Sanitize URLs in AI Response
// ─────────────────────────────────────────────
function sanitizeResponseUrls(text) {
    if (!text) return text;

    // Match markdown links: [text](url)
    const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    // Match bare URLs
    const bareUrlRegex = /(?<!\()(https?:\/\/[^\s<>)\]"']+)/g;

    let result = text;

    // Process markdown links — remove unapproved ones
    result = result.replace(markdownLinkRegex, (match, linkText, url) => {
        if (isApprovedUrl(url)) {
            return match;
        }
        // Remove the link but keep the text
        return linkText;
    });

    // Process bare URLs — remove unapproved ones
    result = result.replace(bareUrlRegex, (match, url) => {
        if (isApprovedUrl(url)) {
            return match;
        }
        return '';
    });

    // Clean up empty markdown artifacts
    result = result.replace(/\[\s*\]\s*\(\s*\)/g, '');
    result = result.replace(/\[\s*\]\(\)/g, '');
    // Remove double spaces left by removed URLs
    result = result.replace(/  +/g, ' ');

    return result.trim();
}

// ─────────────────────────────────────────────
// RATE LIMITING
// ─────────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(ip) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);
    if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return true;
    }
    record.count++;
    return record.count <= RATE_LIMIT_MAX;
}

setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap) {
        if (now - record.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
            rateLimitMap.delete(ip);
        }
    }
}, 120000);

// ─────────────────────────────────────────────
// INPUT SANITIZATION
// ─────────────────────────────────────────────
function sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/\x00/g, '')
        .trim();
}

function isValidImageDataUrl(dataUrl) {
    if (typeof dataUrl !== 'string') return false;
    const regex = /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/;
    if (!regex.test(dataUrl)) return false;
    if (dataUrl.length > 28000000) return false;
    return true;
}

// ─────────────────────────────────────────────
// LANGUAGE DETECTION
// ─────────────────────────────────────────────
function detectLanguage(text) {
    if (!text) return 'unknown';
    const hasBangla = /[\u0980-\u09FF]/.test(text);
    const hasLatin = /[a-zA-Z]/.test(text);
    if (hasBangla && hasLatin) return 'mixed';
    if (hasBangla) return 'bangla';
    if (hasLatin) {
        const lower = text.toLowerCase();
        const banglishWords = ['ami', 'tumi', 'apni', 'dibo', 'kemon', 'ache', 'hobe', 'korte', 'valo',
            'tomato', 'begun', 'morich', 'dhan', 'sar', 'foshol', 'kivabe', 'koto', 'amar'];
        if (banglishWords.some(w => lower.includes(w))) return 'banglish';
        return 'english';
    }
    return 'unknown';
}

// ─────────────────────────────────────────────
// CHATGAIYA NATIVE NLP ENGINE (V5)
// ─────────────────────────────────────────────

// ── SECTION 1: Pronouns & Demonstratives (100+ entries) ──
const CHITTAGONIAN_PRONOUNS = {
    // First person
    'আঁই': 'আমি', 'আই': 'আমি', 'আম্মি': 'আমি', 'মুই': 'আমি', 'মোই': 'আমি',
    'আঁইরা': 'আমরা', 'আইরা': 'আমরা', 'মুইরা': 'আমরা',
    'আঁয়ি': 'আমি', 'আইয়া': 'আমি',
    // Second person
    'তুঁই': 'তুমি', 'তুই': 'তুমি', 'তুঁইরা': 'তোমরা', 'তুইরা': 'তোমরা',
    'তোঁর': 'তোমার', 'তোর': 'তোমার', 'তোঁরা': 'তোমরা',
    'আপ্পা': 'আপনি', 'আপুনি': 'আপনি', 'আপ্পারা': 'আপনারা',
    // Third person
    'হেই': 'সে', 'হাই': 'সে', 'ওই': 'সে', 'সে': 'সে',
    'হেইরা': 'তারা', 'হারা': 'তারা', 'ওরা': 'তারা',
    'হেইড়': 'তার', 'হাড়': 'তার', 'ওড়': 'তার',
    // Possessives
    'আঁয়ার': 'আমার', 'আইয়ার': 'আমার', 'আম্মার': 'আমার',
    'তোঁয়ার': 'তোমার', 'তোয়ার': 'তোমার',
    'হেইয়ার': 'তার', 'হায়ার': 'তার', 'ওয়ার': 'তার',
    // Object forms
    'আঁকে': 'আমাকে', 'আকে': 'আমাকে', 'তোকে': 'তোমাকে', 'তোঁকে': 'তোমাকে',
    'হেকে': 'তাকে', 'হাকে': 'তাকে',
    // Reflexive
    'নিজে': 'নিজে', 'নিজ্জি': 'নিজে', 'নিজ্জার': 'নিজের',
};

// ── SECTION 2: Demonstratives & Pronouns (80+ entries) ──
const CHITTAGONIAN_DEMONSTRATIVES = {
    // This
    'এইডা': 'এটা', 'এডা': 'এটা', 'এইটা': 'এটা', 'এই': 'এটি',
    'এইডার': 'এটার', 'এডার': 'এটার',
    'এইডাকে': 'এটাকে', 'এডাকে': 'এটাকে',
    'এইদে': 'এদের', 'এডে': 'এদের',
    // That (nearby)
    'ওইডা': 'ওটা', 'ওডা': 'ওটা', 'ওইটা': 'ওটা', 'ওই': 'ওটি',
    'ওইডার': 'ওটার', 'ওডার': 'ওটার',
    'ওইডাকে': 'ওটাকে', 'ওডাকে': 'ওটাকে',
    'ওইদে': 'ওদের', 'ওডে': 'ওদের',
    // That (far)
    'হেইডা': 'সেটা', 'হাডা': 'সেটা', 'হেইটা': 'সেটা', 'হেই': 'সেটি',
    'হেইডার': 'সেটার', 'হাডার': 'সেটার',
    'হেইডাকে': 'সেটাকে', 'হাডাকে': 'সেটাকে',
    'হেইদে': 'সেদের', 'হেডে': 'সেদের',
    // Here
    'এডে': 'এখানে', 'ইয়ান': 'এখানে', 'ইয়া': 'এখানে',
    'এইদিকে': 'এদিকে', 'এইপাশে': 'এপাশে',
    // There (nearby)
    'ওডে': 'সেখানে', 'ওয়ান': 'সেখানে', 'ওয়া': 'সেখানে',
    'ওইদিকে': 'ওদিকে', 'ওইপাশে': 'ওপাশে',
    // There (far)
    'তেইয়ান': 'সেখানে', 'তেই': 'সেখানে', 'হেইয়ান': 'সেখানে',
    'হেইদিকে': 'সেদিকে', 'হেইপাশে': 'সেপাশে',
    // Which
    'কোনোডা': 'কোনটা', 'কোনডা': 'কোনটা', 'কোনটে': 'কোনটা',
    // What
    'কিতা': 'কী', 'কিডা': 'কী', 'কীটা': 'কী',
    // How much
    'কত্তে': 'কত', 'কত্তা': 'কত', 'কত': 'কত',
};

// ── SECTION 3: Verbs — Infinitive/Future (150+ entries) ──
const CHITTAGONIAN_VERBS_INFINITIVE = {
    // -মু/-মুন/-মূ pattern (I will/we will)
    'দিমু': 'দিব', 'দিমুন': 'দিব', 'দূমুন': 'দিব',
    'করুম': 'করব', 'করুমুন': 'করব', 'করমুন': 'করব',
    'যামু': 'যাব', 'যামুন': 'যাব', 'যাম': 'যাব',
    'খাইয়ুম': 'খাব', 'খামুন': 'খাব', 'খাম': 'খাব',
    'বলুম': 'বলব', 'বলুমুন': 'বলব', 'বলম': 'বলব',
    'হইমুন': 'হবে', 'হইমু': 'হবে', 'হৈমুন': 'হবে',
    'আইমুন': 'আসব', 'আইমু': 'আসব', 'আসমুন': 'আসব',
    'দেইমুন': 'দেখব', 'দেখুম': 'দেখব', 'দেখমুন': 'দেখব',
    'কইমুন': 'কিনব', 'কিনুম': 'কিনব', 'কিনমুন': 'কিনব',
    'পাইমুন': 'পাব', 'পামুন': 'পাব', 'পাম': 'পাব',
    'লইমুন': 'নেব', 'নিমুন': 'নেব', 'নিমু': 'নেব',
    'তুলিমুন': 'তুলব', 'তুলুম': 'তুলব',
    'দেইমু': 'দেখব', 'দেহুম': 'দেখব',
    'হইমু': 'হবে', 'হোমুন': 'হবে',
    'বইমুন': 'বসব', 'বসুম': 'বসব',
    'আইয়ুমুন': 'আনব', 'আনুম': 'আনব',
    'ফইরাইমুন': 'ফিরব', 'ফিরুম': 'ফিরব',
    'রাখুম': 'রাখব', 'রাখমুন': 'রাখব',
    'মইরাইমুন': 'মারব', 'মারুম': 'মারব',
    'কইমু': 'কিনব', 'কইনুম': 'কিনব',
    'পাইমু': 'পাব',
    'গইমুন': 'যাব', 'গামুন': 'যাব',
    'শুনুম': 'শুনব', 'শুনমুন': 'শুনব',
    'তৈমুন': 'তৈরি', 'তৈরীমুন': 'তৈরি',
    'বুজুম': 'বুঝব', 'বুজমুন': 'বুঝব',
    'জানুম': 'জানব', 'জানমুন': 'জানব',
    'চাইমুন': 'চাই', 'চামুন': 'চাই',
    'ভাইমুন': 'ভাই', 'ভাগুম': 'ভাগব',
    'ওইমুন': 'হবে', 'ওইমু': 'হবে',
    'কাইমুন': 'কাটব', 'কাটুম': 'কাটব',
    'ধইরুম': 'ধরব', 'ধরুম': 'ধরব',
    'ফইলুম': 'ফেলব', 'ফেলুম': 'ফেলব',
    'বাইজুম': 'বাজব', 'বাজমুন': 'বাজব',
    'গাইমুন': 'গাই', 'গামুন': 'যাব',
    'সইমুন': 'সইব', 'সইমু': 'সইব',
    'রইমুন': 'রব', 'রইমু': 'রব',
    'জাগুম': 'জাগব', 'জাগমুন': 'জাগব',
    'লাগুম': 'লাগব', 'লাগমুন': 'লাগব',
    'পড়ুম': 'পড়ব', 'পড়মুন': 'পড়ব',
    'উঠুম': 'উঠব', 'উঠমুন': 'উঠব',
    'বইলুম': 'বসলাম',
    'কইছুম': 'করছি', 'কইছমুন': 'করছি',
};

// ── SECTION 4: Verbs — Past Tense (120+ entries) ──
const CHITTAGONIAN_VERBS_PAST = {
    'গইলাম': 'গেলাম', 'গাইলাম': 'গেলাম', 'গইলাস': 'গেলে', 'গইল': 'গেল',
    'আইলাম': 'এলাম', 'আইলাস': 'এলে', 'আইল': 'এল',
    'অইল': 'হলো', 'হইল': 'হলো', 'হইলাম': 'হলাম',
    'দিলাম': 'দিলাম', 'দিলাস': 'দিলে', 'দিল': 'দিল',
    'করলাম': 'করলাম', 'করলাস': 'করলে', 'করল': 'করল',
    'বললাম': 'বললাম', 'বললাস': 'বললে', 'বলল': 'বলল',
    'খাইলাম': 'খেলাম', 'খাইলাস': 'খেলে', 'খাইল': 'খেল',
    'দেইলাম': 'দেখলাম', 'দেইলাস': 'দেখলে', 'দেইল': 'দেখল',
    'পাইলাম': 'পেলাম', 'পাইলাস': 'পেলে', 'পাইল': 'পেল',
    'শুনলাম': 'শুনলাম', 'শুনলাস': 'শুনলে', 'শুনল': 'শুনল',
    'নিলাম': 'নিলাম', 'নিলাস': 'নিলে', 'নিল': 'নিল',
    'তুললাম': 'তুললাম', 'তুললাস': 'তুললে',
    'রইলাম': 'রইলাম', 'রইলাস': 'রইলে', 'রইল': 'রইল',
    'পড়লাম': 'পড়লাম', 'পড়লাস': 'পড়লে', 'পড়ল': 'পড়ল',
    'উঠলাম': 'উঠলাম', 'উঠলাস': 'উঠলে',
    'লইলাম': 'নিলাম', 'লইলাস': 'নিলে',
    'কইলাম': 'কিনলাম', 'কইলাস': 'কিনলে',
    'ভাইলাম': 'ভেঙেছি', 'ভাইলাস': 'ভেঙেছে',
    'বইলাম': 'বসলাম', 'বইলাস': 'বসলে',
    'ফইরাইলাম': 'ফিরলাম', 'ফইরাইলাস': 'ফিরলে',
    'মইরাইলাম': 'মারলাম', 'মইরাইলাস': 'মারলে',
    'কাইলাম': 'কাটলাম', 'কাইলাস': 'কাটলে',
    'ধইরলাম': 'ধরলাম', 'ধইরলাস': 'ধরলে',
    'ফইললাম': 'ফেললাম', 'ফইললাস': 'ফেললে',
    'গইছিলাম': 'গিয়েছিলাম', 'আইছিলাম': 'এসেছিলাম',
    'অইছিল': 'হয়েছিল', 'করছিলাম': 'করেছিলাম',
    'দিছিলাম': 'দিয়েছিলাম', 'বলছিলাম': 'বলেছিলাম',
    'খাইছিলাম': 'খেয়েছিলাম', 'দেইছিলাম': 'দেখেছিলাম',
    'পাইছিলাম': 'পেয়েছিলাম', 'শুনছিলাম': 'শুনেছিলাম',
};

// ── SECTION 5: Verbs — Present/Progressive (100+ entries) ──
const CHITTAGONIAN_VERBS_PRESENT = {
    'গইতাছে': 'যাচ্ছে', 'গইতাছি': 'যাচ্ছি', 'গইতাছ': 'যাচ্ছ',
    'আইতাছে': 'আসছে', 'আইতাছি': 'আসছি', 'আইতাছ': 'আসছ',
    'অইতাছে': 'হচ্ছে', 'অইতাছি': 'হচ্ছি', 'অইতাছ': 'হচ্ছ',
    'কইতাছে': 'করছে', 'কইতাছি': 'করছি', 'কইতাছ': 'করছ',
    'দিতাছে': 'দিচ্ছে', 'দিতাছি': 'দিচ্ছি',
    'বলতাছে': 'বলছে', 'বলতাছি': 'বলছি',
    'খাইতাছে': 'খাচ্ছে', 'খাইতাছি': 'খাচ্ছি',
    'দেইতাছে': 'দেখছে', 'দেইতাছি': 'দেখছি',
    'পাইতাছে': 'পাচ্ছে', 'পাইতাছি': 'পাচ্ছি',
    'শুনতাছে': 'শুনছে', 'শুনতাছি': 'শুনছি',
    'নিতাছে': 'নিচ্ছে', 'নিতাছি': 'নিচ্ছি',
    'রইতাছে': 'রয়েছে', 'রইতাছি': 'রয়েছি',
    'পড়তাছে': 'পড়ছে', 'পড়তাছি': 'পড়ছি',
    'উঠতাছে': 'উঠছে', 'উঠতাছি': 'উঠছি',
    'বইতাছে': 'বসছে', 'বইতাছি': 'বসছি',
    'ফইরাইতাছে': 'ফিরছে', 'ফইরাইতাছি': 'ফিরছি',
    'মইরাইতাছে': 'মারছে', 'মইরাইতাছি': 'মারছি',
    'কাইতাছে': 'কাটছে', 'কাইতাছি': 'কাটছি',
    'ধইরতাছে': 'ধরছে', 'ধইরতাছি': 'ধরছি',
    'ফইলতাছে': 'ফেলছে', 'ফইলতাছি': 'ফেলছি',
    'লাগতাছে': 'লাগছে', 'লাগতাছি': 'লাগছি',
    'চইলতাছে': 'চলছে', 'চইলতাছি': 'চলছি',
    'কইছজ্জি': 'করছি', 'কইছজ্জে': 'করছে',
    'দিজ্জি': 'দিচ্ছি', 'দিজ্জে': 'দিচ্ছে',
    'বলজ্জি': 'বলছি', 'বলজ্জে': 'বলছে',
    'খাইজ্জি': 'খাচ্ছি', 'খাইজ্জে': 'খাচ্ছে',
    'দেইজ্জি': 'দেখছি', 'দেইজ্জে': 'দেখছে',
    'পাইজ্জি': 'পাচ্ছি', 'পাইজ্জে': 'পাচ্ছে',
    'শুনজ্জি': 'শুনছি', 'শুনজ্জে': 'শুনছে',
    'নিজ্জি': 'নিচ্ছি', 'নিজ্জে': 'নিচ্ছে',
    'পড়জ্জি': 'পড়ছি', 'পড়জ্জে': 'পড়ছে',
    'উঠজ্জি': 'উঠছি', 'উঠজ্জে': 'উঠছে',
    'রইজ্জি': 'রয়েছি', 'রইজ্জে': 'রয়েছে',
    'লাগজ্জি': 'লাগছি', 'লাগজ্জে': 'লাগছে',
    'চইলজ্জি': 'চলছি', 'চইলজ্জে': 'চলছে',
    'কইতাছুম': 'করছি', 'দিতাছুম': 'দিচ্ছি',
    'বলতাছুম': 'বলছি', 'খাইতাছুম': 'খাচ্ছি',
    'দেইতাছুম': 'দেখছি', 'পাইতাছুম': 'পাচ্ছি',
    'শুনতাছুম': 'শুনছি', 'নিতাছুম': 'নিচ্ছি',
};

// ── SECTION 6: Verbs — Causative/Special (80+ entries) ──
const CHITTAGONIAN_VERBS_CAUSATIVE = {
    'মইরা': 'মারা', 'মইরাই': 'মারা', 'মইরাইয়া': 'মারা',
    'ফইরা': 'ফিরে', 'ফইরাই': 'ফিরে', 'ফইরাইয়া': 'ফিরে',
    'কইরা': 'করে', 'কইরাই': 'করে', 'কইরাইয়া': 'করে',
    'দইরা': 'দিয়ে', 'দইরাই': 'দিয়ে',
    'বইরা': 'বসে', 'বইরাই': 'বসে',
    'গইরা': 'যায়', 'গইরাই': 'যায়',
    'আইরা': 'এসে', 'আইরাই': 'এসে',
    'অইরা': 'হয়ে', 'অইরাই': 'হয়ে',
    'লইরা': 'নিয়ে', 'লইরাই': 'নিয়ে',
    'পইরা': 'পেয়ে', 'পইরাই': 'পেয়ে',
    'শুইনা': 'শুনে', 'শুইনাই': 'শুনে',
    'দেইনা': 'দেখে', 'দেইনাই': 'দেখে',
    'কাইরা': 'কাটে', 'কাইরাই': 'কাটে',
    'ধইরা': 'ধরে', 'ধইরাই': 'ধরে',
    'ফইলা': 'ফেলে', 'ফইলাই': 'ফেলে',
    'তুইলা': 'তুলে', 'তুইলাই': 'তুলে',
    'রইলা': 'রেখে', 'রইলাই': 'রেখে',
    'পড়াইলা': 'পড়িয়ে', 'উঠাইলা': 'উঠিয়ে',
    'খাইলা': 'খেয়ে', 'বইলা': 'বসে',
    'গইলা': 'গিয়ে', 'আইলা': 'এসে',
    'অইলা': 'হয়ে', 'লইলা': 'নিয়ে',
    'পাইলা': 'পেয়ে', 'বলিলা': 'বলে',
    'কইলা': 'করে', 'দিলা': 'দিয়ে',
    'হইলা': 'হয়ে', 'সইলা': 'সইয়ে',
    'রইলা': 'রেখে', 'জাগিলা': 'জেগে',
    'লাগিলা': 'লাগিয়ে', 'চইলা': 'চলে',
    'ভইলা': 'ভেঙে', 'কইলা': 'করে',
    'মইলা': 'মারে', 'ফইলা': 'ফেলে',
    // Negative causative
    'মইরাইনা': 'মারে না', 'কইরাইনা': 'করে না',
    'গইরাইনা': 'যায় না', 'আইরাইনা': 'আসে না',
    'অইরাইনা': 'হয় না', 'দিইনা': 'দেয় না',
    'বলিনা': 'বলে না', 'খাইনা': 'খায় না',
    'পাইনা': 'পায় না', 'দেইনা': 'দেখে না',
    'শুনিনা': 'শুনে না', 'নিইনা': 'নেয় না',
};

// ── SECTION 7: Copula & Auxiliary Verbs (60+ entries) ──
const CHITTAGONIAN_COPULA = {
    'অই': 'হয়', 'হই': 'হয়', 'হয়': 'হয়',
    'অইনা': 'হয় না', 'হইনা': 'হয় না', 'হয়না': 'হয় না',
    'অইতে': 'হতে', 'হইতে': 'হতে',
    'অইয়া': 'হয়ে', 'হইয়া': 'হয়ে',
    'অইলে': 'হলে', 'হইলে': 'হলে',
    'অইত': 'হলে', 'হইত': 'হলে',
    'অইবার': 'হওয়ার', 'হইবার': 'হওয়ার',
    'অইবো': 'হবে', 'হইবো': 'হবে', 'হৈবো': 'হবে',
    'অইনি': 'হয়নি', 'হইনি': 'হয়নি',
    'অইছে': 'হয়েছে', 'হইছে': 'হয়েছে',
    'অইছিল': 'হয়েছিল', 'হইছিল': 'হয়েছিল',
    'অইয়াছে': 'হয়েছে', 'হইয়াছে': 'হয়েছে',
    'গই': 'যায়', 'গইনা': 'যায় না',
    'গইতে': 'যাওয়ার', 'গইবার': 'যাওয়ার',
    'গইবো': 'যাব', 'গইনি': 'যায়নি',
    'গইছে': 'গেছে', 'গইছিল': 'গিয়েছিল',
    'ফই': 'ফের', 'ফইনা': 'ফের না',
    'ফইতে': 'ফেরার', 'ফইবো': 'ফিরব',
    'ফইছে': 'ফিরেছে', 'ফইছিল': 'ফিরেছিল',
    'বই': 'বসে', 'বইনা': 'বসে না',
    'বইতে': 'বসার', 'বইবো': 'বসব',
    'বইছে': 'বসেছে', 'বইছিল': 'বসেছিল',
    'আই': 'আসে', 'আইনা': 'আসে না',
    'আইতে': 'আসার', 'আইবো': 'আসব',
    'আইছে': 'এসেছে', 'আইছিল': 'এসেছিল',
    'দই': 'দেয়', 'দইনা': 'দেয় না',
    'দইতে': 'দেওয়ার', 'দইবো': 'দেব',
    'দইছে': 'দিয়েছে', 'দইছিল': 'দিয়েছিল',
    'কই': 'করে', 'কইনা': 'করে না',
    'কইতে': 'করার', 'কইবো': 'করব',
    'কইছে': 'করেছে', 'কইছিল': 'করেছিল',
    'বলি': 'বলে', 'বলিনা': 'বলে না',
    'খাই': 'খায়', 'খাইনা': 'খায় না',
    'পাই': 'পায়', 'পাইনা': 'পায় না',
    'দেই': 'দেখে', 'দেইনা': 'দেখে না',
    'শুই': 'শুনে', 'শুইনা': 'শুনে না',
};

// ── SECTION 8: Particles, Conjunctions, Postpositions (80+ entries) ──
const CHITTAGONIAN_PARTICLES = {
    'লগে': 'সঙ্গে', 'লই': 'নিয়ে', 'লৈ': 'নিয়ে',
    'ন': 'না', 'নাই': 'নেই', 'নাহ': 'নেই',
    'তহন': 'তাহলে', 'তেহন': 'তাহলে', 'তাহন': 'তাহলে',
    'কিন্তু': 'কিন্তু', 'কিন্তা': 'কিন্তু', 'তাই': 'তাই',
    'যেহেতু': 'যেহেতু', 'যে': 'যে', 'যত': 'যত',
    'সুতরাং': 'সুতরাং', 'সেহেতু': 'সেহেতু',
    'আর': 'আর', 'ও': 'ও', 'বি': 'বি',
    'থেকে': 'থেকে', 'পর্যন্ত': 'পর্যন্ত', 'সম্পর্কে': 'সম্পর্কে',
    'জন্য': 'জন্য', 'জন্যে': 'জন্য', 'জন্যা': 'জন্য',
    'তে': 'তে', 'র': 'র', 'রে': 'র', 'দে': 'দে',
    'এ': 'এ', 'য়': 'য়', '�': 'ত',
    'বার': 'বার', 'বারে': 'বারে', 'বারা': 'বার',
    'পরা': 'পর', 'পরে': 'পর', 'পর্যন্ত': 'পর্যন্ত',
    'আগে': 'আগে', 'আগুন': 'আগে', 'আগলি': 'আগে',
    'পেছনে': 'পেছনে', 'পেছনা': 'পেছনে',
    'ওপরে': 'ওপরে', 'ওপরা': 'ওপরে',
    'নিচে': 'নিচে', 'নিচা': 'নিচে',
    'ভেতরে': 'ভেতরে', 'ভেতরা': 'ভেতরে',
    'বাইরে': 'বাইরে', 'বাইরা': 'বাইরে',
    'দিয়ে': 'দিয়ে', 'দিয়া': 'দিয়ে',
    'করে': 'করে', 'করিয়ে': 'করিয়ে',
    'হইয়া': 'হয়ে', 'হইতে': 'হতে',
    'কইতে': 'করতে', 'দিতে': 'দিতে',
    'বলিতে': 'বলতে', 'খাইতে': 'খেতে',
    'দেইতে': 'দেখতে', 'পাইতে': 'পেতে',
    'শুইতে': 'শুনতে', 'নিইতে': 'নিতে',
    'গইতে': 'যেতে', 'আইতে': 'আসতে',
    'ফইতে': 'ফিরতে', 'বইতে': 'বসতে',
    'মইরাইতে': 'মারতে', 'কাইতে': 'কাটতে',
    'ধইরতে': 'ধরতে', 'ফইলতে': 'ফেলতে',
    'লইতে': 'নিতে', 'পইতে': 'পেতে',
    'তুইলতে': 'তুলতে', 'রইতে': 'রাখতে',
    'কইরা': 'করে', 'দিয়া': 'দিয়ে',
    'বলিয়া': 'বলে', 'খাইয়া': 'খেয়ে',
    'দেইয়া': 'দেখে', 'পাইয়া': 'পেয়ে',
    'শুইয়া': 'শুনে', 'নিইয়া': 'নিয়ে',
    'গইয়া': 'গিয়ে', 'আইয়া': 'এসে',
    'ফইরাইয়া': 'ফিরে', 'বইয়া': 'বসে',
    'মইরাইয়া': 'মারে', 'কাইয়া': 'কাটে',
    'ধইরিয়া': 'ধরে', 'ফইলিয়া': 'ফেলে',
    'লইয়া': 'নিয়ে', 'পইয়া': 'পেয়ে',
    'রইয়া': 'রেখে', 'তুইলিয়া': 'তুলে',
};

// ── SECTION 9: Question Words (40+ entries) ──
const CHITTAGONIAN_QUESTIONS = {
    'ক্যান': 'কেন', 'কিলা': 'কেন', 'কেন্না': 'কেন',
    'কিতা': 'কী', 'কিডা': 'কী', 'কীটা': 'কী',
    'কিতা অইছে': 'কী হয়েছে', 'কিতা কইছে': 'কী করেছে',
    'কিতা দিমু': 'কী দিব', 'কিতা করুম': 'কী করব',
    'কিতা লইমুন': 'কী নেব', 'কিতা পাইমুন': 'কী পাব',
    'কোনোডা': 'কোনটা', 'কোনডা': 'কোনটা',
    'কোদিকা': 'কোনদিকে', 'কোদিক': 'কোনদিকে',
    'কোপাশা': 'কোনপাশে', 'কোপাশ': 'কোনপাশে',
    'কত্তে': 'কত', 'কত্তা': 'কত',
    'কতক্ষণ': 'কতক্ষণ', 'কতদিন': 'কতদিন',
    'কেমনে': 'কেমন', 'কেমনা': 'কেমন', 'কেম্মি': 'কেমন',
    'কোথায়': 'কোথায়', 'কোথা': 'কোথায়',
    'কোথায়া': 'কোথায়', 'কোথাই': 'কোথায়',
    'কে': 'কে', 'কার': 'কার', 'কাকে': 'কাকে',
    'কাহার': 'কার', 'কাহাকে': 'কাকে',
    'কখন': 'কখন', 'কখনা': 'কখন',
    'কতজন': 'কতজন', 'কতগুলা': 'কতগুলো',
    'কিরুপ': 'কী রকম', 'কিরকম': 'কী রকম',
    'কাই': 'কে', 'কায়': 'কে',
    'কোন': 'কোন', 'কোনটে': 'কোনটা',
    'কোনগুলা': 'কোনগুলো', 'কোনো': 'কোনো',
};

// ── SECTION 10: Negation Patterns (50+ entries) ──
const CHITTAGONIAN_NEGATION = {
    'নাই': 'নেই', 'নাহ': 'নেই', 'নাহা': 'নেই',
    'নাইকো': 'নেই', 'নাহো': 'নেই',
    'অইনা': 'হয় না', 'হইনা': 'হয় না',
    'দিনা': 'দেয় না', 'দিইনা': 'দেয় না',
    'কইনা': 'করে না', 'করিনা': 'করে না',
    'বলিনা': 'বলে না', 'বলিন্যা': 'বলে না',
    'খাইনা': 'খায় না', 'খাইন্যা': 'খায় না',
    'পাইনা': 'পায় না', 'পাইন্যা': 'পায় না',
    'দেইনা': 'দেখে না', 'দেইন্যা': 'দেখে না',
    'শুনিনা': 'শুনে না', 'শুনিন্যা': 'শুনে না',
    'নিইনা': 'নেয় না', 'নিইন্যা': 'নেয় না',
    'গইনা': 'যায় না', 'গইন্যা': 'যায় না',
    'আইনা': 'আসে না', 'আইন্যা': 'আসে না',
    'ফইনা': 'ফেরে না', 'ফইন্যা': 'ফেরে না',
    'বইনা': 'বসে না', 'বইন্যা': 'বসে না',
    'পড়িনা': 'পড়ে না', 'উঠিনা': 'উঠে না',
    'লাগিনা': 'লাগে না', 'চইলিনা': 'চলে না',
    'রইিনা': 'রয় না', 'জাগিনা': 'জাগে না',
    'কাইনা': 'কাটে না', 'ধইরিনা': 'ধরে না',
    'ফইলিনা': 'ফেলে না', 'তুইলিনা': 'তুলে না',
    'রইলিনা': 'রাখে না', 'মইরাইনা': 'মারে না',
    'কইরিনা': 'করে না', 'গইরিনা': 'যায় না',
    'আইরিনা': 'আসে না', 'ফইরিনা': 'ফিরে না',
    'পড়না': 'পড়ে না', 'উঠনা': 'উঠে না',
    'লাগনা': 'লাগে না', 'চইলনা': 'চলে না',
    'রইনা': 'রয় না', 'জাগনা': 'জাগে না',
    'কানা': 'কাটে না', 'ধইরনা': 'ধরে না',
    'ফইলনা': 'ফেলে না', 'তুইলনা': 'তুলে না',
    'রইলনা': 'রাখে না', 'মইরনা': 'মারে না',
    'বইনা': 'বসে না', 'নিইনা': 'নেয় না',
    'কইনা': 'করে না', 'দিনা': 'দেয় না',
};

// ── SECTION 11: Agriculture Vocabulary (150+ entries) ──
const CHITTAGONIAN_AGRICULTURE = {
    // Crops — Chatgaiya variations
    'টমেটু': 'টমেটো', 'টমেটূ': 'টমেটো', 'টমেটুতে': 'টমেটোতে',
    'খাট্টাবাইয়্যুন': 'টমেটো', 'খাট্টাবাইয়ান': 'টমেটো',
    'টমেটুতে': 'টমেটোতে', 'টমেটুর': 'টমেটোর',
    'মরিচ্যা': 'মরিচ', 'মরিচ্যাতে': 'মরিচে',
    'বেগুন্যা': 'বেগুন', 'বেগুন্যাতে': 'বেগুনে',
    'লাউডা': 'লাউ', 'লাউডাতে': 'লাউতে', 'লাউডার': 'লাউর',
    'কুমড়াডা': 'কুমড়া', 'কুমড়াডাতে': 'কুমড়াতে',
    'শসাডা': 'শসা', 'শসাডাতে': 'শসাতে',
    'ধানডা': 'ধান', 'ধানডাতে': 'ধানে', 'ধানডার': 'ধানের',
    'আলুডা': 'আলু', 'আলুডাতে': 'আলুতে', 'আলুডার': 'আলুর',
    'পাতাডা': 'পাতা', 'পাতাডাতে': 'পাতায়',
    'শিকড়ডা': 'শিকড়', 'শিকড়ডাতে': 'শিকড়ে',
    'গাছডা': 'গাছ', 'গাছডাতে': 'গাছে', 'গাছডার': 'গাছের',
    'ডালডা': 'ডাল', 'ডালডাতে': 'ডালে',
    'ফুলডা': 'ফুল', 'ফুলডাতে': 'ফুলে',
    'ফলডা': 'ফল', 'ফলডাতে': 'ফলে',
    'বীজডা': 'বীজ', 'বীজডাতে': 'বীজে',
    'মূলডা': 'মূল', 'মূলডাতে': 'মূলে',
    'কাণ্ডডা': 'কাণ্ড', 'কাণ্ডডাতে': 'কাণ্ডে',
    'পুষ্পডা': 'পুষ্প', 'পুষ্পডাতে': 'পুষ্পে',
    'ফসলডা': 'ফসল', 'ফসলডাতে': 'ফসলে',
    'জমিনডা': 'জমি', 'জমিনডাতে': 'জমিতে',
    'বালিডা': 'বালি', 'কাদাডা': 'কাদা',
    'পানিডা': 'পানি', 'পানিডাতে': 'পানিতে',
    'রোদডা': 'রোদ', 'রোদডাতে': 'রোদে',
    'ছায়াডা': 'ছায়া', 'বৃষ্টিডা': 'বৃষ্টি',
    'বাতাসডা': 'বাতাস', 'বাতাসডাতে': 'বাতাসে',
    'মাটিডা': 'মাটি', 'মাটিডাতে': 'মাটিতে',
    // Crop names
    'পেঁয়াজ': 'পেঁয়াজ', 'পেইয়াজ': 'পেঁয়াজ',
    'রসুন': 'রসুন', 'রশুন': 'রসুন',
    'আদা': 'আদা', 'আদাডা': 'আদা',
    'হলুদ': 'হলুদ', 'হলুদডা': 'হলুদ',
    'জিঞ্জিরা': 'জিঞ্জিরা', 'জিনজিরা': 'জিঞ্জিরা',
    'ধনিয়া': 'ধনিয়া', 'ধনে': 'ধনিয়া',
    'জিরা': 'জিরা', 'মেথি': 'মেথি',
    'রাই': 'রাই', 'সরিষা': 'সরিষা',
    'তিল': 'তিল', 'তিলডা': 'তিল',
    'সুজি': 'সুজি', 'সুজিরা': 'সুজি',
    'বাধার শাক': 'বাধার শাক', 'পুঁই': 'পুঁই',
    'ধুন্দা': 'ধুন্দা', 'কচু': 'কচু',
    'লাল শাক': 'লাল শাক', 'পালং': 'পালং',
    'নুনিয়া': 'নুনিয়া', 'পুদিনা': 'পুদিনা',
    'তেজপাতা': 'তেজপাতা', 'লবঙ্গ': 'লবঙ্গ',
    'দারুচিনি': 'দারুচিনি', 'কালোজিরা': 'কালোজিরা',
    'মরিচ গুঁড়া': 'মরিচ গুঁড়া',
    // Fertilizer vocabulary
    'সার': 'সার', 'সারডা': 'সার', 'সারে': 'সারে',
    'ইউরিয়া': 'ইউরিয়া', 'ইউরিয়াডা': 'ইউরিয়া',
    'ডিএপি': 'ডিএপি', 'ডিএপিডা': 'ডিএপি',
    'কেসিএ': 'কেসিএ', 'কেসিএডা': 'কেসিএ',
    'কমপোস্ট': 'কমপোস্ট', 'কমপোস্টডা': 'কমপোস্ট',
    'ভার্মিকমপোস্ট': 'ভার্মিকমপোস্ট', 'ভার্মি': 'ভার্মিকমপোস্ট',
    'ট্রাইকোডার্মা': 'ট্রাইকোডার্মা', 'ট্রাইকো': 'ট্রাইকোডার্মা',
    'বেজোসার': 'বেজোসার', 'খাদ্য': 'খাদ্য',
    'পুষ্টি': 'পুষ্টি', 'পুষ্টির': 'পুষ্টির',
    'জৈব সার': 'জৈব সার', 'রাসায়নিক সার': 'রাসায়নিক সার',
    'প্রাকৃতিক সার': 'প্রাকৃতিক সার',
    'নাইট্রোজেন': 'নাইট্রোজেন', 'ফসফরাস': 'ফসফরাস',
    'পটাশিয়াম': 'পটাশিয়াম',
    'সালফার': 'সালফার', 'ক্যালসিয়াম': 'ক্যালসিয়াম',
    'ম্যাগনেসিয়াম': 'ম্যাগনেসিয়াম',
    'আয়রন': 'আয়রন', 'জিঙ্ক': 'জিঙ্ক',
    'বোরন': 'বোরন', 'কপার': 'কপার',
    // Disease vocabulary
    'রোগ': 'রোগ', 'রোগডা': 'রোগ',
    'পোকা': 'পোকা', 'পোকাডা': 'পোকা',
    'কীট': 'কীট', 'কীটডা': 'কীট',
    'পোকার': 'পোকার', 'রোগের': 'রোগের',
    'ফাংগাস': 'ফাংগাস', 'ব্যাকটেরিয়া': 'ব্যাকটেরিয়া',
    'ভাইরাস': 'ভাইরাস',
    'দাগ': 'দাগ', 'দাগডা': 'দাগ',
    'ঝুড়ি': 'ঝুড়ি', 'ঝুড়িডা': 'ঝুড়ি',
    'পচা': 'পচা', 'পচাডা': 'পচা',
    'মরা': 'মরা', 'মরাডা': 'মরা',
    'মলিচ': 'মলিচ', 'মলিচডা': 'মলিচ',
    'হলুদ দাগ': 'হলুদ দাগ',
    'বাদামি দাগ': 'বাদামি দাগ',
    'কুঁকড়ানো': 'কুঁকড়ে গেছে',
    'কুকড়াইছে': 'কুকড়ে গেছে',
    'পাতা হলুদ': 'পাতা হলুদ',
    'পাতা কুকড়': 'পাতা কুকড়',
    'পাতা ঝরা': 'পাতা ঝরা',
    'পাতা পচা': 'পাতা পচা',
    'গলা': 'গলা', 'গলাডা': 'গলা',
    'ফাঁপা': 'ফাঁপা', 'ফাঁপাডা': 'ফাঁপা',
    'বাতাসা': 'বাতাসা', 'বাতাসাডা': 'বাতাসা',
    'ধুলো': 'ধুলো', 'ধুলোডা': 'ধুলো',
    'শুকনো': 'শুকনো', 'ভিজা': 'ভিজা',
    'তাপ': 'তাপ', 'তাপডা': 'তাপ',
    'রোদ': 'রোদ', 'রোদডা': 'রোদ',
    'বৃষ্টি': 'বৃষ্টি', 'বৃষ্টিডা': 'বৃষ্টি',
    // Farming actions
    'রোপা': 'রোপা', 'রোপাডা': 'রোপা',
    'সেচ': 'সেচ', 'সেচডা': 'সেচ',
    'কাটা': 'কাটা', 'কাটাডা': 'কাটা',
    'তোলা': 'তোলা', 'তোলাডা': 'তোলা',
    'বাজার': 'বাজার', 'বাজারডা': 'বাজার',
    'দোকান': 'দোকান', 'দোকানডা': 'দোকান',
    'বিক্রি': 'বিক্রি', 'ক্রয়': 'ক্রয়',
    'দাম': 'দাম', 'দামডা': 'দাম',
    'মূল্য': 'মূল্য', 'মূল্যডা': 'মূল্য',
    'কেজি': 'কেজি', 'গ্রাম': 'গ্রাম',
    'লিটার': 'লিটার', 'পিস': 'পিস',
    'অংশ': 'অংশ', 'ভাগ': 'ভাগ',
    'মাত্রা': 'মাত্রা', 'পরিমাণ': 'পরিমাণ',
    // Seasons
    'গ্রীষ্ম': 'গ্রীষ্ম', 'গ্রীষ্মকাল': 'গ্রীষ্মকাল',
    'বর্ষা': 'বর্ষা', 'বর্ষাকাল': 'বর্ষাকাল',
    'শীত': 'শীত', 'শীতকাল': 'শীতকাল',
    'হেমন্ত': 'হেমন্ত', 'হেমন্তকাল': 'হেমন্তকাল',
    'বসন্ত': 'বসন্ত', 'বসন্তকাল': 'বসন্তকাল',
    // Locations
    'মহেশখালী': 'মহেশখালী', 'কক্সবাজার': 'কক্সবাজার',
    'চাটগ্রাম': 'চাটগ্রাম', 'চট্টগ্রাম': 'চাটগ্রাম',
    'ঢাকা': 'ঢাকা', 'রাজশাহী': 'রাজশাহী',
    'খুলনা': 'খুলনা', 'বরিশাল': 'বরিশাল',
    'সিলেট': 'সিলেট', 'রংপুর': 'রংপুর',
    'ময়মনসিংহ': 'ময়মনসিংহ', 'কুমিল্লা': 'কুমিল্লা',
    // Time words
    'আজ': 'আজ', 'আজকে': 'আজকে',
    'কাল': 'কাল', 'কালকে': 'কালকে',
    'পরশু': 'পরশু', 'পরশুকে': 'পরশুকে',
    'গতকাল': 'গতকাল', 'আগামী': 'আগামী',
    'এখন': 'এখন', 'এখনো': 'এখনো',
    'আগে': 'আগে', 'পরে': 'পরে',
    'সকাল': 'সকাল', 'দুপুর': 'দুপুর',
    'বিকেল': 'বিকেল', 'সন্ধ্যা': 'সন্ধ্যা',
    'রাত': 'রাত', 'রাত্রি': 'রাত্রি',
};

// ── SECTION 12: Standard Bangla Spelling Fixes (50+ entries) ──
const BANGLA_SPELLING_FIXES = {
    'টমেটু': 'টমেটো', 'টমেটূ': 'টমেটো', 'টমেটুতে': 'টমেটোতে',
    'টমেটূতে': 'টমেটোতে', 'দিমো': 'দিব', 'দিমুন': 'দিব',
    'কিমু': 'কি', 'কিমুন': 'কি', 'মরিচে': 'মরিচ',
    'বেগুনে': 'বেগুন', 'পাতা হলদে': 'পাতা হলুদ',
    'পাতায় হলুদ': 'পাতা হলুদ', 'কুকড়াইছে': 'কুকড়ে গেছে',
    'কুকড়ানো': 'কুকড়ে গেছে', 'হইছে': 'হয়েছে',
    'ইউরীয়া': 'ইউরিয়া', 'ব্যবহার করবো': 'ব্যবহার করব',
    'করোনা': 'করুন', 'করুন': 'করুন',
    'কিভাবে': 'কিভাবে', 'কি করে': 'কীভাবে',
    'কি করতে': 'কীভাবে', 'কেমন করে': 'কীভাবে',
    'কত টাকা': 'কত টাকা', 'কত টাকার': 'কত টাকার',
    'কি লাগে': 'কী লাগে', 'কি লাগবে': 'কী লাগবে',
    'কি দরকার': 'কী দরকার', 'কি করতে হবে': 'কী করতে হবে',
};

// ── SECTION 13: Banglish → Bangla Dictionary (120+ entries) ──
const BANGLISH_MAP = {
    'ami': 'আমি', 'tumi': 'তুমি', 'apni': 'আপনি', 'ki': 'কি',
    'dibo': 'দিব', 'dibo?': 'দিব?', 'dibo na': 'দিব না',
    'kemon': 'কেমন', 'ache': 'আছে', 'nai': 'নেই', 'hobe': 'হবে',
    'korte': 'করতে', 'korse': 'করেছে', 'korlam': 'করলাম',
    'jante': 'জানতে', 'valo': 'ভালো', 'bhalo': 'ভালো',
    'khub': 'খুব', 'onek': 'অনেক', 'tomato': 'টমেটো',
    'begun': 'বেগুন', 'morich': 'মরিচ', 'dhan': 'ধান',
    'shak': 'শাক', 'pata': 'পাতা', 'phol': 'ফল',
    'fusfol': 'ফসল', 'foshol': 'ফসল', 'sar': 'সার',
    'ken': 'কেন', 'kivabe': 'কিভাবে', 'kobe': 'কখন',
    'kothay': 'কোথায়', 'koto': 'কত', 'amar': 'আমার',
    'tomar': 'তোমার', 'amar jonno': 'আমার জন্য',
    'dite': 'দিতে', 'lagbe': 'লাগবে', 'lagena': 'লাগেনি',
    'lagse': 'লাগেছে', 'hoyeche': 'হয়েছে', 'hocche': 'হচ্ছে',
    'dekhchi': 'দেখছি', 'pachi': 'পাচ্ছি', 'chai': 'চাই',
    'nasta': 'নষ্ট', 'shuru': 'শুরু', 'sesh': 'শেষ',
    'prochur': 'প্রচুর', 'kharap': 'খারাপ', 'thik': 'ঠিক',
    'dorkar': 'দরকার', 'jore': 'জোরে', 'mara': 'মারা',
    'jacche': 'যাচ্ছে', 'holud': 'হলুদ', 'kukre': 'কুঁকড়ে',
    'jomi': 'জমি', 'jomin': 'জমি', 'bari': 'বাড়ি',
    'shomoy': 'সময�', 'din': 'দিন', 'bochhor': 'বছর',
    'masa': 'মাস', 'saptaho': 'সপ্তাহ', 'ghonta': 'ঘণ্টা',
    'minute': 'মিনিট', 'age': 'আগে', 'pore': 'পরে',
    'ekhane': 'এখানে', 'okhane': 'ওখানে', 'kothay': 'কোথায়',
    'kibhabe': 'কিভাবে', 'kotota': 'কতটা', 'koydin': 'কতদিন',
    'koybar': 'কতবার', 'shob': 'সব', 'shobai': 'সবাই',
    'ekta': 'একটা', 'duta': 'দুটা', 'tinta': 'তিনটা',
    'chara': 'ছাড়া', 'charai': 'ছাড়াই', 'sathe': 'সাথে',
    'niye': 'নিয়ে', 'diye': 'দিয়ে', 'kore': 'করে',
    'hote': 'হতে', 'pore': 'পরে', 'age': 'আগে',
    'jodi': 'যদি', 'tahole': 'তাহলে', 'tarpore': 'তারপরে',
    'ekhono': 'এখনো', 'akhon': 'এখন', 'tokhon': 'তখন',
    'sobar': 'সবার', 'amader': 'আমাদের', 'toder': 'তোমাদের',
    'oder': 'তাদের', 'kader': 'কারা', 'karon': 'কারণ',
    'jonno': 'জন্য', 'sомporke': 'সম্পর্কে', 'somporke': 'সম্পর্কে',
    'niche': 'নিচে', 'upore': '�পরে', 'bhitore': 'ভেতরে',
    'baire': 'বাইরে', 'pashe': 'পাশে', 'dike': 'দিকে',
    'shuru': 'শুরু', 'sesh': 'শেষ', 'midde': 'মাঝে',
    'prothome': 'প্রথমে', 'sheshe': 'শেষে', 'motamuti': 'মোটামুটি',
    'thikthak': 'ঠিকঠাক', 'olpo': 'অল্প', 'beshi': 'বেশি',
    'tuku': 'টুকু', 'ektu': 'একটু', 'onektu': 'অনেকটু',
    'prochur': 'প্রচুর', 'kom': 'কম', 'beshi': 'বেশি',
    'soja': 'সোজা', 'ulto': 'উল্টো', 'alada': 'আলাদা',
    'ek': 'এক', 'dui': 'দুই', 'tini': 'তিন', 'char': 'চার',
    'pach': 'পাঁচ', 'chhoy': 'ছয়', 'saat': 'সাত',
    'aat': 'আট', 'noy': 'নয়', 'dosh': 'দশ',
    'aager': 'আগে', 'porer': 'পরে', 'eibar': 'এবার',
    'obar': 'ওবার', 'hobar': 'হবার', 'khawar': 'খাওয়ার',
    'darar': 'দাওয়ার', 'khar': 'খার', 'manush': 'মানুষ',
    'chhua': 'ছোঁয়া', 'chena': 'চেনা', 'jana': 'জানা',
    'bujha': 'বোঝা', 'mone': 'মনে', 'kotha': 'কথা',
    'bepar': 'বিষয়', 'shomossha': 'সমস্য', 'somadhan': 'সমাধান',
    'upokar': 'উপকার', 'khoti': 'ক্ষতি', 'laabh': 'লাভ',
    'faida': 'ফাইদা', 'nuksan': 'ক্ষতি', 'subidhe': 'সুবিধে',
    'asubidhe': 'অসুবিধে', 'sahaj': 'সহজ', 'kothin': 'কঠিন',
};

// ── SECTION 14: Verb Normalization Rules (60+ entries) ──
const VERB_RULES = [
    [/করবো/g, 'করব'], [/দিবো/g, 'দিব'], [/হবো/g, 'হব'],
    [/বলবো/g, 'বলব'], [/যাবো/g, 'যাব'], [/আসবো/g, 'আসব'],
    [/যাচ্ছো/g, 'যাচ্ছ'], [/করছো/g, 'করছ'], [/দিচ্ছো/g, 'দিচ্ছ'],
    [/বলছো/g, 'বলছ'], [/খাচ্ছো/g, 'খাচ্ছ'], [/দেখছো/g, 'দেখছ'],
    [/পাচ্ছো/g, 'পাচ্ছ'], [/শুনছো/g, 'শুনছ'], [/নিচ্ছো/g, 'নিচ্ছ'],
    [/পড়ছো/g, 'পড়ছ'], [/উঠছো/g, 'উঠছ'], [/বসছো/g, 'বসছ'],
    [/ফিরছো/g, 'ফিরছ'], [/মারছো/g, 'মারছ'], [/কাটছো/g, 'কাটছ'],
    [/ধরছো/g, 'ধরছ'], [/ফেলছো/g, 'ফেলছ'], [/রাখছো/g, 'রাখছ'],
    [/তুলছো/g, 'তুলছ'], [/আনছো/g, 'আনছ'], [/নেচ্ছো/g, 'নেচ্ছ'],
    [/কিনছো/g, 'কিনছ'], [/বুঝছো/g, 'বুঝছ'], [/জানছো/g, 'জানছ'],
    [/চাইছো/g, 'চাইছ'], [/সইছো/g, 'সইছ'], [/রইছো/g, 'রইছ'],
    [/জাগছো/g, 'জাগছ'], [/লাগছো/g, 'লাগছ'], [/চলছো/g, 'চলছ'],
    [/টমেটু/g, 'টমেটো'], [/টমেটূ/g, 'টমেটো'],
    [/বেগুন্যা/g, 'বেগুন'], [/মরিচ্যা/g, 'মরিচ'],
    [/কুকড়াইছে/g, 'কুকড়ে গেছে'], [/কুকড়ানো/g, 'কুকড়ে গেছে'],
    [/দিমু/g, 'দিব'], [/দিমো/g, 'দিব'],
    [/কি\s+দিমু/g, 'কি দিব'], [/কি\s+দিমো/g, 'কি দিব'],
    [/করুম/g, 'করব'], [/যামু/g, 'যাব'],
    [/খাইয়ুম/g, 'খাব'], [/বলুম/g, 'বলব'],
    [/পাইমুন/g, 'পাব'], [/নিমুন/g, 'নেব'],
    [/দেইমুন/g, 'দেখব'], [/শুনুম/g, 'শুনব'],
    [/আইমুন/g, 'আসব'], [/ফইরাইমুন/g, 'ফিরব'],
    [/মইরাইমুন/g, 'মারব'], [/কাইমুন/g, 'কাটব'],
    [/ধইরুম/g, 'ধরব'], [/ফইলুম/g, 'ফেলব'],
    [/রাখুম/g, 'রাখব'], [/তুলিমুন/g, 'তুলব'],
    [/কইমুন/g, 'কিনব'], [/বইমুন/g, 'বসব'],
    [/গইমুন/g, 'যাব'], [/আইয়ুমুন/g, 'আনব'],
    [/\s+/g, ' '],
];

// ─────────────────────────────────────────────
// MASTER NORMALIZATION FUNCTION
// ─────────────────────────────────────────────
function normalizeInput(text) {
    if (!text) return text;
    let normalized = text.trim();

    // Step 1: Check if Chittagonian dialect (any keyword match)
    const allChatgaiyaKeys = [
        ...Object.keys(CHITTAGONIAN_PRONOUNS),
        ...Object.keys(CHITTAGONIAN_DEMONSTRATIVES),
        ...Object.keys(CHITTAGONIAN_VERBS_INFINITIVE),
        ...Object.keys(CHITTAGONIAN_VERBS_PAST),
        ...Object.keys(CHITTAGONIAN_VERBS_PRESENT),
        ...Object.keys(CHITTAGONIAN_VERBS_CAUSATIVE),
        ...Object.keys(CHITTAGONIAN_COPULA),
        ...Object.keys(CHITTAGONIAN_PARTICLES),
        ...Object.keys(CHITTAGONIAN_QUESTIONS),
        ...Object.keys(CHITTAGONIAN_NEGATION),
        ...Object.keys(CHITTAGONIAN_AGRICULTURE),
    ];

    const isChittagonian = allChatgaiyaKeys.some(kw => normalized.includes(kw));

    if (isChittagonian) {
        // Apply all Chittagonian dictionaries (longest first to avoid partial matches)
        const allDicts = [
            CHITTAGONIAN_PRONOUNS,
            CHITTAGONIAN_DEMONSTRATIVES,
            CHITTAGONIAN_VERBS_INFINITIVE,
            CHITTAGONIAN_VERBS_PAST,
            CHITTAGONIAN_VERBS_PRESENT,
            CHITTAGONIAN_VERBS_CAUSATIVE,
            CHITTAGONIAN_COPULA,
            CHITTAGONIAN_PARTICLES,
            CHITTAGONIAN_QUESTIONS,
            CHITTAGONIAN_NEGATION,
            CHITTAGONIAN_AGRICULTURE,
        ];

        for (const dict of allDicts) {
            const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
            for (const key of sortedKeys) {
                normalized = normalized.split(key).join(dict[key]);
            }
        }
    }

    // Step 2: Check if Banglish
    const isBanglish = /^[a-zA-Z\s?!,.]+$/.test(normalized) &&
        Object.keys(BANGLISH_MAP).some(kw => normalized.toLowerCase().includes(kw));

    if (isBanglish) {
        let result = normalized;
        const sortedBanglish = Object.keys(BANGLISH_MAP).sort((a, b) => b.length - a.length);
        for (const banglish of sortedBanglish) {
            const regex = new RegExp('\\b' + banglish + '\\b', 'gi');
            result = result.replace(regex, BANGLISH_MAP[banglish]);
        }
        return result;
    }

    // Step 3: Apply Bangla spelling fixes + verb normalization
    const hasBangla = /[\u0980-\u09FF]/.test(normalized);
    if (hasBangla) {
        for (const [wrong, correct] of Object.entries(BANGLA_SPELLING_FIXES)) {
            normalized = normalized.split(wrong).join(correct);
        }
        for (const [pattern, replacement] of VERB_RULES) {
            normalized = normalized.replace(pattern, replacement);
        }
    }

    return normalized;
}

// ─────────────────────────────────────────────
// INTENT DETECTION
// ─────────────────────────────────────────────
function detectIntent(text) {
    const lower = (text || '').toLowerCase();
    const intents = {
        isFertilizerQuery: false,
        isDiseaseQuery: false,
        isProductQuery: false,
        cropName: null,
        location: null,
        season: null,
    };

    // Fertilizer keywords
    const fertKeywords = ['সার', 'fertilizer', 'dibo', 'দিব', 'ইউরিয়া', 'ডিএপি', 'কমপোস্ট',
        'vermicompost', 'ট্রাইকোডার্মা', 'trichoderma', 'খাদ্য', 'পুষ্টি', 'nutrition',
        'best fertilizer', 'কোন সার', 'কি দিব', 'কি দিমু', 'কি ব্যবহার',
        'ভার্মিকমপোস্ট', 'বেজোসার', 'কেসিএ', 'নাইট্রোজেন', 'ফসফরাস', 'পটাশিয়াম',
        'কিতা দিমু', 'কিতা করুম', 'কিতা লইমুন'];
    intents.isFertilizerQuery = fertKeywords.some(kw => lower.includes(kw));

    // Disease keywords
    const diseaseKeywords = ['রোগ', 'disease', 'পাতা হলুদ', 'পাতা কুকড়', 'মরা', 'মারা',
        'ক্ষতি', 'পোকা', 'pest', 'bug', 'insect', 'কুঁকড়ে', 'হলদে', 'বাদামি',
        'ধুলো', 'মলিচ', 'গলা', 'বাতাসা', 'ফাঁপা', 'দাগ', 'পচা', 'মরাডা',
        'ফাংগাস', 'ব্যাকটেরিয়া', 'ভাইরাস', 'মরিচ্যা মইরা', 'বেগুন্যা মইরা',
        'কুকড়াইছে', 'পাতা ঝরা', 'পাতা পচা'];
    intents.isDiseaseQuery = diseaseKeywords.some(kw => lower.includes(kw));

    // Product keywords
    const prodKeywords = ['product', 'কিনুন', 'দাম', 'মূল্য', 'price', 'buy', 'shop', 'order',
        'বাজার', 'দোকান', 'বিক্রি', 'ক্রয়', 'কিনতে', 'অর্ডার'];
    intents.isProductQuery = prodKeywords.some(kw => lower.includes(kw));

    // Crop detection — expanded with Chatgaiya variants
    const crops = {
        'টমেটো': ['টমেটো', 'টমেটু', 'টমেটূ', 'tomato', 'খাট্টাবাইয়্যুন', 'খাট্টাবাইয়ান'],
        'বেগুন': ['বেগুন', 'বেগুন্যা', 'begun', 'brinjal', 'eggplant'],
        'মরিচ': ['মরিচ', 'মরিচ্যা', 'morich', 'chili', 'pepper'],
        'ধান': ['ধান', 'ধানডা', 'dhan', 'rice', 'paddy'],
        'আলু': ['আলু', 'আলুডা', 'alu', 'potato'],
        'পেঁয়াজ': ['পেঁয়াজ', 'পেইয়াজ', 'peyaj', 'onion'],
        'রসুন': ['রসুন', 'রশুন', 'roshun', 'garlic'],
        'শাক': ['শাক', 'shak', 'spinach', 'পালং', 'ধুন্দা', 'কচু'],
        'লাউ': ['লাউ', 'লাউডা', 'lau', 'gourd'],
        'কুমড়া': ['কুমড়া', 'কুমড়াডা', 'kumra', 'pumpkin'],
        'বাঁধাকপি': ['বাঁধাকপি', 'bandhakopi', 'cabbage'],
        'ফুলফি': ['ফুলফি', 'phulfi', 'cauliflower'],
        'শিম': ['শিম', 'shim', 'bean'],
        'ঝিংগি': ['ঝিংগি', 'jhingi', 'ridge gourd'],
        'লোকি': ['লোকি', 'loki', 'bottle gourd'],
        'শসা': ['শসা', 'শসাডা', 'shosha', 'cucumber'],
        'কলা': ['কলা', 'kola', 'banana'],
        'পেপে': ['পেপে', 'pepe', 'papaya'],
        'লেবু': ['লেবু', 'lebu', 'lemon'],
        'আম': ['আম', 'aam', 'mango'],
        'জাম': ['জাম', 'jam', 'guava'],
        'কমলা': ['কমলা', 'komla', 'orange'],
        'তরমুজ': ['তরমুজ', 'tormuj', 'watermelon'],
        'মিষ্টি কুমড়া': ['মিষ্টি �কুমড়া', 'sweet pumpkin'],
        'ডাল': ['ডাল', 'ডালডা', 'dal', 'pulse', 'lentil'],
        'মসুর': ['মসুর', 'masur', 'red lentil'],
        'ছোলা': ['ছোলা', 'chhola', 'chickpea'],
        'মুগ': ['মুগ', 'mung', 'mung bean'],
        'বুট': ['বুট', 'but', 'black gram'],
        'খেসারি': ['খেসারি', 'khesari', 'lathyrus'],
        'সরিষা': ['সরিষা', 'shorisha', 'mustard'],
        'পাট': ['পাট', 'pat', 'jute'],
        'ভাটা': ['ভাটা', 'bhata', 'paddy'],
    };

    for (const [crop, aliases] of Object.entries(crops)) {
        if (aliases.some(alias => lower.includes(alias))) {
            intents.cropName = crop;
            break;
        }
    }

    // Location detection
    const locations = {
        'মহেশখালী': ['মহেশখালী', 'maheshkhali', 'মহেশখালীতে', 'মহেশখালীর'],
        'কক্সবাজার': ['কক্সবাজার', 'cox\'s bazar', 'কক্সবাজারে', 'কক্সবাজারের'],
        'চাটগ্রাম': ['চাটগ্রাম', 'চট্টগ্রাম', 'chattogram', 'chittagong', 'চাটগ্রামে', 'চাটগ্রামের'],
        'ঢাকা': ['ঢাকা', 'dhaka', 'ঢাকায়'],
        'রাজশাহী': ['রাজশাহী', 'rajshahi', 'রাজশাহীতে'],
        'খুলনা': ['খুলনা', 'khulna', 'খুলনায়'],
        'বরিশাল': ['বরিশাল', 'barishal', 'বরিশালে'],
        'সিলেট': ['সিলেট', 'sylhet', 'সিলেটে'],
        'রংপুর': ['রংপুর', 'rangpur', 'রংপুরে'],
    };

    for (const [loc, aliases] of Object.entries(locations)) {
        if (aliases.some(alias => lower.includes(alias))) {
            intents.location = loc;
            break;
        }
    }

    // Season detection
    const seasons = {
        'গ্রীষ্ম': ['গ্রীষ্ম', 'গ্রীষ্মকাল', 'গরম', 'summer'],
        'বর্ষা': ['বর্ষা', 'বর্ষাকাল', 'বর্ষার', 'monsoon', 'rainy'],
        'শীত': ['শীত', 'শীতকাল', 'শীতের', 'winter', 'cold'],
        'হেমন্ত': ['হেমন্ত', 'হেমন্তকাল'],
        'বসন্ত': ['বসন্ত', 'বসন্তকাল', 'spring'],
    };

    for (const [s, aliases] of Object.entries(seasons)) {
        if (aliases.some(alias => lower.includes(alias))) {
            intents.season = s;
            break;
        }
    }

    return intents;
}

// ─────────────────────────────────────────────
// CONVERSATION MEMORY (extract from messages)
// ─────────────────────────────────────────────
function extractContextFromMessages(messages) {
    const context = {
        previousCrop: null,
        previousDisease: null,
        previousFertilizer: null,
        location: null,
        season: null,
    };

    // Scan previous user messages for context
    const userMessages = messages.filter(m => m.role === 'user');
    for (const msg of userMessages) {
        const normalized = normalizeInput(msg.content || '');
        const intent = detectIntent(normalized);
        if (intent.cropName) context.previousCrop = intent.cropName;
        if (intent.location) context.location = intent.location;
        if (intent.season) context.season = intent.season;
    }

    return context;
}

// ─────────────────────────────────────────────
// FIREBASE PRODUCT SEARCH
// ─────────────────────────────────────────────
const FIREBASE_PROJECT_ID = 'sowrov-fertilizer-905de';
const SITE_BASE_URL = 'https://sowrov-fertilizer-905de.web.app';

async function searchProducts(keyword) {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/products`;
        const response = await fetch(url);
        if (!response.ok) return [];

        const data = await response.json();
        if (!data.documents) return [];

        const products = data.documents.map(doc => {
            const fields = doc.fields || {};
            return {
                name: fields.name?.stringValue || '',
                category: fields.category?.stringValue || '',
                description: fields.description?.stringValue || '',
                retailPrice: fields.retailPrice?.integerValue || fields.retailPrice?.doubleValue || 0,
                wholesalePrice: fields.wholesalePrice?.integerValue || fields.wholesalePrice?.doubleValue || 0,
                stock: fields.stock?.integerValue || 0,
                image: fields.image?.stringValue || '',
                docId: doc.name?.split('/').pop() || '',
            };
        });

        const lowerKeyword = keyword.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(lowerKeyword) ||
            p.category.toLowerCase().includes(lowerKeyword) ||
            p.description.toLowerCase().includes(lowerKeyword)
        );
    } catch (error) {
        console.error('Product search error:', error);
        return [];
    }
}

function recommendProduct(products, cropName) {
    if (!products || products.length === 0) return null;
    const matched = products.find(p =>
        p.name.toLowerCase().includes((cropName || '').toLowerCase())
    );
    return matched || products[0];
}

function formatProductsForPrompt(products) {
    if (!products || products.length === 0) return '';

    let text = '\n\n📦 SOUROV FERTILIZER PRODUCTS FOUND:\n\n';

    products.forEach((p, i) => {
        const productUrl = `${SITE_BASE_URL}/product-details.html?id=${p.docId}`;
        const orderUrl = `${SITE_BASE_URL}/order.html?product=${p.docId}`;
        const whatsappUrl = `https://wa.me/8801829775552?text=I%20want%20to%20order%20${encodeURIComponent(p.name)}`;

        text += `Product ${i + 1}:\n`;
        text += `- Name: ${p.name}\n`;
        text += `- Category: ${p.category}\n`;
        text += `- Description: ${p.description}\n`;
        text += `- Retail Price: ৳${p.retailPrice}\n`;
        text += `- Wholesale Price: ৳${p.wholesalePrice}\n`;
        text += `- Stock: ${p.stock}\n`;
        text += `- Image: ${p.image}\n`;
        text += `- Product URL: ${productUrl}\n`;
        text += `- Order URL: ${orderUrl}\n`;
        text += `- WhatsApp: ${whatsappUrl}\n\n`;
    });

    return text;
}

// ─────────────────────────────────────────────
// BUILD OPENROUTER API REQUEST
// ─────────────────────────────────────────────
function buildOpenRouterRequest(messages, imageDataUrl, productContext, conversationContext) {
    const apiMessages = [];
    const recentMessages = messages.slice(-20);

    // Build enhanced system prompt with context
    let contextInjection = '';
    if (conversationContext) {
        if (conversationContext.previousCrop) {
            contextInjection += `\nPreviously discussed crop: ${conversationContext.previousCrop}`;
        }
        if (conversationContext.location) {
            contextInjection += `\nUser location: ${conversationContext.location} (give local recommendations for this area)`;
        }
        if (conversationContext.season) {
            contextInjection += `\nCurrent season mentioned: ${conversationContext.season}`;
        }
    }

    const finalSystemPrompt = SYSTEM_PROMPT + contextInjection;
    apiMessages.push({ role: 'system', content: finalSystemPrompt });

    for (let i = 0; i < recentMessages.length; i++) {
        const msg = recentMessages[i];
        const role = msg.role === 'assistant' ? 'assistant' : 'user';
        let content = sanitizeInput(msg.content || '');
        if (!content) continue;

        // Normalize user messages through the full pipeline
        if (role === 'user') {
            content = normalizeInput(content);
        }

        const isLastUserMsg = role === 'user' && i === recentMessages.length - 1;

        if (isLastUserMsg && imageDataUrl && isValidImageDataUrl(imageDataUrl)) {
            const textContent = productContext ? content + productContext : content;
            apiMessages.push({
                role: 'user',
                content: [
                    { type: 'text', text: textContent },
                    { type: 'image_url', image_url: { url: imageDataUrl } },
                ],
            });
        } else if (isLastUserMsg && productContext) {
            apiMessages.push({ role: 'user', content: content + productContext });
        } else {
            apiMessages.push({ role, content });
        }
    }

    return {
        model: 'google/gemini-2.5-pro',
        messages: apiMessages,
        max_tokens: 2500,
        temperature: 0.15,
        top_p: 0.9,
    };
}

// ─────────────────────────────────────────────
// MAIN HANDLER — AGENT PIPELINE
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

    const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(clientIP)) {
        return {
            statusCode: 429,
            headers,
            body: JSON.stringify({ error: 'Too many requests. Please wait a moment and try again.' }),
        };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('OPENROUTER_API_KEY is not configured');
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'OPENROUTER_API_KEY is not configured.' }),
        };
    }

    try {
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch (e) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
        }

        const { messages, image } = body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Messages array is required' }) };
        }

        if (image && !isValidImageDataUrl(image)) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid image data' }) };
        }

        // ── AGENT PIPELINE ──────────────────────────────

        // Step 1: Get last user message
        const lastUserMsg = messages.filter(m => m.role === 'user').pop();

        // Step 2: Normalize input through full NLP pipeline
        const normalizedText = lastUserMsg ? normalizeInput(lastUserMsg.content || '') : '';

        // Step 3: Detect language
        const detectedLang = detectLanguage(lastUserMsg?.content || '');

        // Step 4: Detect intent (with location, season, crop)
        const intent = detectIntent(normalizedText);

        // Step 5: Extract conversation context (memory)
        const conversationContext = extractContextFromMessages(messages);

        // Step 6: Merge location/season from current message into context
        if (intent.location) conversationContext.location = intent.location;
        if (intent.season) conversationContext.season = intent.season;

        // Step 7: Search Firebase products if needed
        let productContext = '';
        if (intent.isFertilizerQuery || intent.isProductQuery || intent.cropName) {
            const searchTerms = [];
            if (intent.cropName) searchTerms.push(intent.cropName);
            const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
            searchTerms.push(...words.slice(0, 3));

            let allProducts = [];
            for (const term of searchTerms) {
                const found = await searchProducts(term);
                allProducts = allProducts.concat(found);
            }

            // Deduplicate
            const seen = new Set();
            allProducts = allProducts.filter(p => {
                if (seen.has(p.name)) return false;
                seen.add(p.name);
                return true;
            });

            productContext = formatProductsForPrompt(allProducts.slice(0, 5));
        }

        // Step 8: Build and send request
        const requestBody = buildOpenRouterRequest(messages, image, productContext, conversationContext);
        const siteUrl = event.headers.origin || 'https://sowrov-fertilizer-905de.web.app';

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': siteUrl,
                'X-Title': 'Sowrov Fertilizer',
            },
        };

        // Try primary model, fallback to flash
        let response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            ...fetchOptions,
            body: JSON.stringify(requestBody),
        });

        if (response.status === 404 || response.status === 429) {
            console.warn(`Model ${requestBody.model} unavailable, falling back to google/gemini-2.5-flash`);
            requestBody.model = 'google/gemini-2.5-flash';
            response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                ...fetchOptions,
                body: JSON.stringify(requestBody),
            });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('OpenRouter API error:', response.status, errorData);

            if (response.status === 429) {
                return {
                    statusCode: 429,
                    headers,
                    body: JSON.stringify({ error: 'AI service is busy. Please try again in a moment.' }),
                };
            }

            if (response.status === 401 || response.status === 403) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'AI service authentication failed. Please check OPENROUTER_API_KEY.' }),
                };
            }

            const detail = errorData?.error?.message || 'AI service is temporarily unavailable. Please try again.';
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: detail }),
            };
        }

        const data = await response.json();

        let reply = '';
        if (data.choices && data.choices[0] && data.choices[0].message) {
            reply = data.choices[0].message.content || '';
        }

        if (!reply) {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({ error: 'Could not generate a response. Please try again.' }),
            };
        }

        // ── V7: Sanitize URLs in AI response (prevent fake links) ──
        reply = sanitizeResponseUrls(reply);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply }),
        };
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'An unexpected error occurred. Please try again later.' }),
        };
    }
};
