/* ============================================
   SF AI V35 — Groq + Knowledge Base Fallback
   Single Provider | Knowledge Fallback | Always Answer
   ============================================ */

// ─────────────────────────────────────────────
// PROVIDER: GROQ ONLY
// ─────────────────────────────────────────────
const GROQ_CONFIG = {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    fallbackModel: 'llama-3.1-8b-instant',
    apiKeyEnv: 'GROQ_API_KEY',
    timeout: 25000,
};

// ─────────────────────────────────────────────
// CIRCUIT BREAKER
// ─────────────────────────────────────────────
const circuitBreaker = {
    state: 'CLOSED',
    failures: 0,
    lastFailureTime: 0,
    totalRequests: 0,
    totalFailures: 0,
    failureThreshold: 5,
    timeoutMs: 5 * 60 * 1000,
};

function recordSuccess() {
    circuitBreaker.totalRequests++;
    circuitBreaker.failures = 0;
}

function recordFailure() {
    circuitBreaker.totalRequests++;
    circuitBreaker.totalFailures++;
    circuitBreaker.failures++;
    circuitBreaker.lastFailureTime = Date.now();
    if (circuitBreaker.failures >= circuitBreaker.failureThreshold) {
        circuitBreaker.state = 'OPEN';
    }
}

function isCircuitOpen() {
    if (circuitBreaker.state === 'CLOSED') return false;
    if (Date.now() - circuitBreaker.lastFailureTime > circuitBreaker.timeoutMs) {
        circuitBreaker.state = 'HALF_OPEN';
        return false;
    }
    return true;
}

// ─────────────────────────────────────────────
// ANSWER CACHE (24 hours)
// ─────────────────────────────────────────────
const answerCache = new Map();
const ANSWER_CACHE_TTL = 24 * 60 * 60 * 1000;
const ANSWER_CACHE_MAX = 2000;

function getAnswerCacheKey(rawInput, intent) {
    const normalized = rawInput.trim().toLowerCase().replace(/\s+/g, ' ');
    const crop = intent?.cropName || '';
    const type = intent?.primaryIntent || '';
    return `${normalized}::${crop}::${type}`;
}

function getCachedAnswer(key) {
    const entry = answerCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ANSWER_CACHE_TTL) {
        answerCache.delete(key);
        return null;
    }
    return entry.answer;
}

function setCachedAnswer(key, answer, source) {
    if (answerCache.size >= ANSWER_CACHE_MAX) {
        const oldest = answerCache.keys().next().value;
        answerCache.delete(oldest);
    }
    answerCache.set(key, { answer, timestamp: Date.now(), source });
}

function getAnswerCacheStats() {
    return { size: answerCache.size };
}

// ─────────────────────────────────────────────
// GROQ API CALL
// ─────────────────────────────────────────────
async function callGroq(messages, systemPrompt, options = {}) {
    const apiKey = process.env[GROQ_CONFIG.apiKeyEnv];
    if (!apiKey) throw { status: 401, message: 'GROQ_API_KEY not configured' };

    const model = options.model || GROQ_CONFIG.model;
    const maxTokens = options.maxTokens || 1200;

    const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content || '',
        })),
    ];

    const startTime = Date.now();
    const response = await fetch(GROQ_CONFIG.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            messages: apiMessages,
            max_tokens: maxTokens,
            temperature: 0.15,
            top_p: 0.9,
            stream: false,
        }),
        signal: AbortSignal.timeout(GROQ_CONFIG.timeout),
    });

    const latency = Date.now() - startTime;

    if (response.status === 429) {
        const err = new Error('Rate limited');
        err.status = 429;
        throw err;
    }

    if (response.status === 401 || response.status === 403) {
        const err = new Error('Invalid API key');
        err.status = response.status;
        throw err;
    }

    if (response.status === 402) {
        const err = new Error('Quota exceeded');
        err.status = 402;
        throw err;
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const err = new Error(errorData?.error?.message || `Groq error ${response.status}`);
        err.status = response.status;
        throw err;
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return {
        ok: true,
        reply,
        model,
        latency,
        usage: data.usage,
    };
}

// ─────────────────────────────────────────────
// KNOWLEDGE BASE FALLBACK
// Build answer from local knowledge when Groq fails
// ─────────────────────────────────────────────
function buildKnowledgeFallback(rawInput, knowledgeContext, productContext, intent, language) {
    const isEnglish = language === 'english';
    let answer = '';

    // Build answer from knowledge base
    if (knowledgeContext && knowledgeContext.length > 100) {
        answer = knowledgeContext;
    }

    // Add product recommendations
    if (productContext) {
        answer += '\n\n' + productContext;
    }

    // If no knowledge found, give generic helpful response
    if (!answer || answer.length < 50) {
        if (isEnglish) {
            answer = `Based on the information available in our agriculture knowledge base:

**Query:** ${rawInput}

**Recommendation:**
For accurate advice on this topic, I recommend:
1. Contact your local DAE (Department of Agricultural Extension) office
2. Visit BARI (Bangladesh Agricultural Research Institute) website: bari.gov.bd
3. Consult with a local agriculture officer

**General Tips:**
- Always use verified seeds from authorized dealers
- Follow recommended fertilizer schedules
- Practice integrated pest management (IPM)
- Monitor weather conditions before applying any treatments

*This answer is from our local knowledge base. For personalized advice, please consult your nearest agricultural extension office.*`;
        } else {
            answer = `আমাদের কৃষি জ্ঞান ভান্ডার থেকে পাওয়া তথ্য:

**আপনার প্রশ্ন:** ${rawInput}

**সুপারিশ:**
এই বিষয়ে সঠিক পরামর্শের জন্য আমি সুপারিশ করি:
১. আপনার নিকটস্থ কৃষি সম্প্রসারণ অফিসে (DAE) যোগাযোগ করুন
২. BARI ওয়েবসাইট দেখুন: bari.gov.bd
৩. স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন

**সাধারণ পরামর্শ:**
- সবসময় অনুমোদিত ডিলার থেকে যাচাইকৃত বীজ ব্যবহার করুন
- সুপারিশকৃত সারের সময়সূচি অনুসরণ করুন
- একীভূত পোকামাকড় ব্যবস্থাপনা (IPM) অনুশীলন করুন
- যেকোনো চিকিৎসা প্রয়োগের আগে আবহাওয়ার অবস্থা পর্যবেক্ষণ করুন

*এই উত্তরটি আমাদের স্থানীয় জ্ঞান ভান্ডার থেকে দেওয়া হয়েছে। ব্যক্তিগত পরামর্শের জন্য আপনার নিকটস্থ কৃষি সম্প্রসারণ অফিসে যোগাযোগ করুন।*`;
        }
    } else {
        // Add source note to existing knowledge
        const sourceNote = isEnglish
            ? '\n\n*This answer is based on our verified agriculture knowledge base (BARI, DAE, BRRI documents).*'
            : '\n\n*এই উত্তরটি আমাদের যাচাইকৃত কৃষি জ্ঞান ভান্ডার (BARI, DAE, BRRI নথি) থেকে দেওয়া হয়েছে।*';
        answer += sourceNote;
    }

    return answer;
}

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
function getHealthReport() {
    const hasKey = !!process.env[GROQ_CONFIG.apiKeyEnv];
    return {
        status: hasKey && circuitBreaker.state !== 'OPEN' ? 'operational' : 'degraded',
        timestamp: new Date().toISOString(),
        provider: {
            name: GROQ_CONFIG.name,
            model: GROQ_CONFIG.model,
            hasApiKey: hasKey,
            circuitState: circuitBreaker.state,
            totalRequests: circuitBreaker.totalRequests,
            totalFailures: circuitBreaker.totalFailures,
        },
        cache: getAnswerCacheStats(),
    };
}

function getProviderStatus() {
    return getHealthReport();
}

// ─────────────────────────────────────────────
// MAIN: SEND MESSAGE (Groq + Knowledge Fallback)
// ─────────────────────────────────────────────
async function sendMessage(messages, systemPrompt, options = {}) {
    const startTime = Date.now();
    const hasKey = !!process.env[GROQ_CONFIG.apiKeyEnv];

    // If no API key, use knowledge base only
    if (!hasKey) {
        console.log('No GROQ_API_KEY — using knowledge base only');
        return {
            ok: true,
            reply: null,
            provider: 'knowledge',
            model: 'knowledge-base',
            latency: 0,
            source: 'knowledge_base',
            attempts: 0,
        };
    }

    // If circuit is open, use knowledge base
    if (isCircuitOpen()) {
        console.log('Circuit breaker OPEN — using knowledge base fallback');
        return {
            ok: true,
            reply: null,
            provider: 'knowledge',
            model: 'knowledge-base',
            latency: 0,
            source: 'circuit_breaker_fallback',
            attempts: 0,
        };
    }

    // Try Groq with adaptive maxTokens
    let maxTokens = options.maxTokens || 1200;

    // First attempt with full tokens
    try {
        console.log(`Trying Groq (maxTokens: ${maxTokens})`);
        const result = await callGroq(messages, systemPrompt, { ...options, maxTokens });

        if (result.ok && result.reply) {
            recordSuccess();
            console.log(`Groq success: ${result.latency}ms, model: ${result.model}`);
            return {
                ok: true,
                reply: result.reply,
                provider: 'groq',
                model: result.model,
                latency: result.latency,
                usage: result.usage,
                attempts: 1,
            };
        }
    } catch (error) {
        console.warn(`Groq failed:`, error.message);
        recordFailure();

        // On 402/429, try with fewer tokens
        if (error.status === 402 || error.status === 429) {
            const reducedTokens = Math.floor(maxTokens * 0.5);
            try {
                console.log(`Retrying Groq with ${reducedTokens} tokens`);
                const result = await callGroq(messages, systemPrompt, { ...options, maxTokens: reducedTokens });
                if (result.ok && result.reply) {
                    recordSuccess();
                    return {
                        ok: true,
                        reply: result.reply,
                        provider: 'groq',
                        model: result.model,
                        latency: result.latency,
                        usage: result.usage,
                        attempts: 2,
                    };
                }
            } catch (retryError) {
                console.warn(`Groq retry failed:`, retryError.message);
                recordFailure();
            }
        }
    }

    // All Groq attempts failed — return null reply for knowledge base fallback
    const totalLatency = Date.now() - startTime;
    return {
        ok: true,
        reply: null,
        provider: 'knowledge',
        model: 'knowledge-base',
        latency: totalLatency,
        source: 'groq_failed_fallback',
        attempts: 0,
    };
}

// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
module.exports = {
    sendMessage,
    getHealthReport,
    getProviderStatus,
    getAnswerCacheKey,
    getCachedAnswer,
    setCachedAnswer,
    getAnswerCacheStats,
    buildKnowledgeFallback,
    GROQ_CONFIG,
};
