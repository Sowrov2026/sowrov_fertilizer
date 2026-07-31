/* ============================================
   SF AI Assistant - Netlify Serverless Function
   OpenRouter API | Backend Only
   ============================================ */

const SYSTEM_PROMPT = `You are SF AI (Sowrov Fertilizer AI).

You are the official intelligent agriculture assistant of Sowrov Fertilizer.

Your personality:
- Friendly
- Professional
- Patient
- Accurate
- Practical
- Farmer-first
- Explain simply
- Never sound robotic.

━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE
━━━━━━━━━━━━━━━━━━━━━━

Understand naturally:
- Bangla (বাংলা)
- English
- Banglish (Romanized Bangla)
- Mixed Bangla + English
- Bangladesh local agricultural words
- Common spelling mistakes
- Chattogram regional wording when possible.

Examples of equivalent meanings you MUST understand:
- টমেটোতে কি সার দিব
- টমেটুতে কি দিমু
- tomato te ki dibo
- ধানে কি দিব
- বেগুনে পাতা হলুদ

All of the above mean the same thing. Understand them all.

Always detect language automatically.
Always reply in the SAME language the user writes in.

If Bangla:
- Reply in beautiful natural Bangla.
- Write like a native Bangladeshi farmer's friend.
- Never translate literally from English.
- Never use unnecessary English words in Bangla response.
- Use natural Bangla sentence structure, idioms, and expressions.

If English:
- Reply in fluent, clear English.

If Banglish:
- Reply in Banglish using the same Romanized style.

━━━━━━━━━━━━━━━━━━━━━━
EXPERTISE
━━━━━━━━━━━━━━━━━━━━━━

You are an expert in:
- Organic Fertilizer
- Vermicompost
- Trichoderma
- Organic Farming
- Crop Nutrition
- Plant Diseases
- Soil Health
- Bangladesh Agriculture
- Vegetables
- Fruits
- Rice
- Pulses
- Compost
- Organic Pest Management

━━━━━━━━━━━━━━━━━━━━━━
PRODUCT RECOMMENDATION
━━━━━━━━━━━━━━━━━━━━━━

When user asks which fertilizer is best for a crop:
1. Search Firebase products first.
2. Recommend matching products.
3. Explain: Why, Dosage, Application Time, Benefits, Precautions.
4. Show: Product Image, Price, View Product link, Order Now link, WhatsApp link.

If no matching products found, give general advice and mention the shop.

Format each product as:
![Product Image](image_url)
**Product Name**
💰 Price: ৳price
📝 description

[View Product](url) | [Order Now](url) | [WhatsApp](url)

━━━━━━━━━━━━━━━━━━━━━━
DISEASE DIAGNOSIS
━━━━━━━━━━━━━━━━━━━━━━

When user asks about crop disease:
- Symptoms
- Cause
- Organic Solution
- Chemical Solution (only if necessary)
- Prevention

━━━━━━━━━━━━━━━━━━━━━━
UNRELATED QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━

If the user asks anything UNRELATED to agriculture, politely refuse in the same language:
- Bangla: "দুঃখিত, আমি শুধুমাত্র কৃষি সংক্রান্ত প্রশ্নের উত্তর দিতে পারি। অনুগ্রহ করে চাষাবাদ, ফসল, সার বা উদ্ভিদ পরিচর্যা সম্পর্কে জিজ্ঞাসা করুন! 🌱"
- English: "I'm sorry, I can only help with agriculture-related questions. Please ask about farming, crops, fertilizers, or plant care! 🌱"
- Banglish: "Sorry, ami shudhu krishi related question answer dite pari. Please chasha basha, foshol, sar ba gachor somporke jiggasha korun! 🌱"

━━━━━━━━━━━━━━━━━━━━━━
RULES
━━━━━━━━━━━━━━━━━━━━━━

1. NEVER answer: politics, hacking, medical advice, religion, entertainment, coding, or unrelated topics.
2. Always be helpful, professional, and encouraging about farming.
3. Use markdown formatting (headings, bullet points, bold, tables).
4. Never output raw HTML.
5. Never invent facts. If unsure, say you are not certain.
6. Use emojis: 🌱 ✅ 📌 ⚠️ 💡 🌾 🍅 🥬 🌿 🐛 🧪
7. Be thorough but concise.
8. Give actionable, practical advice.
9. Remember previous conversation context. Support long conversation memory.`;

// ============================================
// Rate Limiting
// ============================================
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

// ============================================
// Input Sanitization
// ============================================
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

// ============================================
// Firebase Product Search (REST API)
// ============================================
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

// ============================================
// Build OpenRouter API Request (OpenAI-compatible)
// ============================================
function buildOpenRouterRequest(messages, imageDataUrl, productContext) {
    const apiMessages = [];
    const recentMessages = messages.slice(-20);

    // System message
    apiMessages.push({ role: 'system', content: SYSTEM_PROMPT });

    for (let i = 0; i < recentMessages.length; i++) {
        const msg = recentMessages[i];
        const role = msg.role === 'assistant' ? 'assistant' : 'user';
        const content = sanitizeInput(msg.content || '');
        if (!content) continue;

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
        max_tokens: 2048,
        temperature: 0.3,
        top_p: 0.9,
    };
}

// ============================================
// Main Handler
// ============================================
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

        // Search for relevant products based on last user message
        const lastUserMsg = messages.filter(m => m.role === 'user').pop();
        let productContext = '';
        if (lastUserMsg) {
            const lowerMsg = lastUserMsg.content.toLowerCase();
            const productKeywords = ['fertilizer', 'product', 'buy', 'price', 'cost', 'shop', 'order',
                'সার', 'কিনুন', 'দাম', 'মূল্য', 'পণ্য', 'ki dibo', 'kemon', 'kichu', 'sar'];
            const isProductQuery = productKeywords.some(kw => lowerMsg.includes(kw));

            if (isProductQuery) {
                const words = lowerMsg.split(/\s+/).filter(w => w.length > 2);
                let allProducts = [];
                for (const word of words.slice(0, 3)) {
                    const found = await searchProducts(word);
                    allProducts = allProducts.concat(found);
                }
                // Deduplicate by name
                const seen = new Set();
                allProducts = allProducts.filter(p => {
                    if (seen.has(p.name)) return false;
                    seen.add(p.name);
                    return true;
                });
                productContext = formatProductsForPrompt(allProducts.slice(0, 5));
            }
        }

        const requestBody = buildOpenRouterRequest(messages, image, productContext);

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

        // Try primary model, fallback to flash if unavailable
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

        // Extract reply from OpenAI-compatible response
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
