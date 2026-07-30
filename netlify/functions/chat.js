/* ============================================
   SF AI Assistant - Netlify Serverless Function
   OpenAI Responses API | Backend Only
   ============================================ */

// System Prompt for Sowrov Fertilizer AI
const SYSTEM_PROMPT = `You are SF AI Assistant, the official AI assistant of Sowrov Fertilizer.

You are an expert Agricultural Consultant. You answer ONLY agriculture related questions.

CORE EXPERTISE:
- Organic Fertilizer & Vermicompost
- Trichoderma & Bio Fertilizer
- Organic Compost & Soil Health
- Crop Nutrition & Disease Management
- Pest Management & Organic Farming
- Vegetable Farming, Fruit Farming, Rice Farming
- Bangladesh Agriculture & Plant Care
- Seed Treatment & Composting
- Agricultural Technology

RULES:
1. If user asks anything UNRELATED to agriculture, politely refuse. Say: "I'm sorry, I can only help with agriculture-related questions. Please ask me about farming, crops, fertilizers, or plant care! 🌱"
2. NEVER answer: politics, hacking, medical advice, religion, entertainment, coding, or unrelated topics.
3. Always be helpful, professional, and encouraging about farming.
4. Use beautiful formatting with emojis: 🌱 ✅ 📌 ⚠️ 💡 🌾 🍅 🥬 🌿 🐛 🧪

FERTILIZER RECOMMENDATIONS - When users ask about best fertilizer for any crop, ALWAYS provide:
- Recommended fertilizer name
- Why it is recommended
- Dosage/Quantity
- Application Time
- Benefits
- Precautions
- Expected Result
- Extra Tips

IMAGE ANALYSIS - When users share a crop image, analyze:
- Possible Disease (if any)
- Cause of the disease
- Organic Solution
- Chemical Solution
- Prevention tips

LANGUAGE RULES:
- If user writes in Bangla (বাংলা), reply in Bangla ONLY.
- If user writes in English, reply in English ONLY.
- NEVER mix two languages in one response.
- Detect language from the first message and maintain consistency.

RESPONSE STYLE:
- Use markdown formatting (headings, lists, tables, bold).
- Always include emojis for visual appeal.
- Be thorough but concise.
- Give actionable, practical advice.`;

// In-memory rate limiting (resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

function checkRateLimit(ip) {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { windowStart: now, count: 1 });
        return true;
    }

    record.count++;
    if (record.count > RATE_LIMIT_MAX) {
        return false;
    }

    return true;
}

// Clean up old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap) {
        if (now - record.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
            rateLimitMap.delete(ip);
        }
    }
}, 120000);

// Input sanitization
function sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    // Remove potential injection patterns
    let cleaned = text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/\x00/g, '')
        .trim();
    return cleaned;
}

// Validate image data URL
function isValidImageDataUrl(dataUrl) {
    if (typeof dataUrl !== 'string') return false;
    const regex = /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/;
    if (!regex.test(dataUrl)) return false;
    // Max 20MB base64 string roughly
    if (dataUrl.length > 28000000) return false;
    return true;
}

// Build OpenAI Responses API request
function buildRequestBody(messages, imageDataUrl) {
    const input = [];

    // System instructions
    input.push({
        role: 'developer',
        content: SYSTEM_PROMPT,
    });

    // Conversation history (keep last 20 messages to control token usage)
    const recentMessages = messages.slice(-20);

    for (const msg of recentMessages) {
        const role = msg.role === 'assistant' ? 'assistant' : 'user';
        const content = sanitizeInput(msg.content || '');

        if (!content) continue;

        if (role === 'user' && imageDataUrl && isValidImageDataUrl(imageDataUrl)) {
            // Last user message with image
            input.push({
                role: 'user',
                content: [
                    {
                        type: 'input_image',
                        image_url: imageDataUrl,
                    },
                    {
                        type: 'input_text',
                        text: content,
                    },
                ],
            });
        } else {
            input.push({
                role: role,
                content: content,
            });
        }
    }

    return {
        model: 'gpt-4o',
        input: input,
        max_output_tokens: 2048,
        temperature: 0.7,
    };
}

// Main handler
exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers,
            body: '',
        };
    }

    // Only POST allowed
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Rate limiting
    const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(clientIP)) {
        return {
            statusCode: 429,
            headers,
            body: JSON.stringify({
                error: 'Too many requests. Please wait a moment and try again.',
            }),
        };
    }

    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error('OPENAI_API_KEY is not configured');
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'AI service is not configured. Please contact support.',
            }),
        };
    }

    try {
        // Parse request body
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch (e) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid request body' }),
            };
        }

        const { messages, image } = body;

        // Validate messages
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Messages array is required' }),
            };
        }

        // Validate image if provided
        if (image && !isValidImageDataUrl(image)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid image data' }),
            };
        }

        // Build request
        const requestBody = buildRequestBody(messages, image);

        // Call OpenAI Responses API
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('OpenAI API error:', response.status, errorData);

            if (response.status === 429) {
                return {
                    statusCode: 429,
                    headers,
                    body: JSON.stringify({
                        error: 'AI service is busy. Please try again in a moment.',
                    }),
                };
            }

            if (response.status === 401) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        error: 'AI service authentication failed. Please contact support.',
                    }),
                };
            }

            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    error: 'AI service is temporarily unavailable. Please try again.',
                }),
            };
        }

        const data = await response.json();

        // Extract response text from Responses API format
        let reply = '';

        if (data.output && Array.isArray(data.output)) {
            for (const item of data.output) {
                if (item.type === 'message' && item.content) {
                    for (const content of item.content) {
                        if (content.type === 'output_text' && content.text) {
                            reply += content.text;
                        }
                    }
                }
            }
        }

        if (!reply) {
            // Fallback: try other response formats
            if (data.choices && data.choices[0]) {
                reply = data.choices[0].message?.content || '';
            } else if (data.result) {
                reply = typeof data.result === 'string' ? data.result : '';
            }
        }

        if (!reply) {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    error: 'Could not generate a response. Please try again.',
                }),
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
            body: JSON.stringify({
                error: 'An unexpected error occurred. Please try again later.',
            }),
        };
    }
};
