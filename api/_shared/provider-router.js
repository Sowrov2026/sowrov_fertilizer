/* ============================================
   SF AI V36 — Groq + Knowledge Base Fallback
   Never Error | Always Answer | Reduced Tokens
   Cloudflare Pages ES Module
   ============================================ */

const GROQ_CONFIG = {
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'openai/gpt-oss-120b',
    fallbackModel: 'openai/gpt-oss-20b',
    apiKeyEnv: 'GROQ_API_KEY',
    timeout: 20000,
};

// ─── Circuit Breaker ───────────────────────
const circuitBreaker = {
    state: 'CLOSED', failures: 0, lastFailureTime: 0,
    totalRequests: 0, totalFailures: 0,
    failureThreshold: 5, timeoutMs: 5 * 60 * 1000,
};

function recordSuccess() { circuitBreaker.totalRequests++; circuitBreaker.failures = 0; }
function recordFailure() {
    circuitBreaker.totalRequests++; circuitBreaker.totalFailures++;
    circuitBreaker.failures++; circuitBreaker.lastFailureTime = Date.now();
    if (circuitBreaker.failures >= circuitBreaker.failureThreshold) circuitBreaker.state = 'OPEN';
}
function isCircuitOpen() {
    if (circuitBreaker.state === 'CLOSED') return false;
    if (Date.now() - circuitBreaker.lastFailureTime > circuitBreaker.timeoutMs) { circuitBreaker.state = 'HALF_OPEN'; return false; }
    return true;
}

// ─── Answer Cache (24h) ────────────────────
const answerCache = new Map();
const ANSWER_CACHE_TTL = 24 * 60 * 60 * 1000;
const ANSWER_CACHE_MAX = 2000;

function getAnswerCacheKey(rawInput, intent) {
    const normalized = rawInput.trim().toLowerCase().replace(/\s+/g, ' ');
    return `${normalized}::${intent?.cropName || ''}::${intent?.primaryIntent || ''}`;
}
function getCachedAnswer(key) {
    const entry = answerCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > ANSWER_CACHE_TTL) { answerCache.delete(key); return null; }
    return entry.answer;
}
function setCachedAnswer(key, answer, source) {
    if (answerCache.size >= ANSWER_CACHE_MAX) { answerCache.delete(answerCache.keys().next().value); }
    answerCache.set(key, { answer, timestamp: Date.now(), source });
}
function getAnswerCacheStats() { return { size: answerCache.size }; }

// ─── Groq API Call ─────────────────────────
async function callGroq(messages, systemPrompt, options = {}, apiKey) {
    if (!apiKey) throw { status: 401, message: 'NO_KEY' };

    const model = options.model || GROQ_CONFIG.model;
    const maxTokens = options.maxTokens || 800;

    const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content || '' })),
    ];

    const startTime = Date.now();
    const response = await fetch(GROQ_CONFIG.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: apiMessages, max_tokens: maxTokens, temperature: 0.15, top_p: 0.9, stream: false }),
        signal: AbortSignal.timeout(GROQ_CONFIG.timeout),
    });

    const latency = Date.now() - startTime;

    if (response.status === 429) { const e = new Error('Rate limited'); e.status = 429; throw e; }
    if (response.status === 401 || response.status === 403) { const e = new Error('Invalid key'); e.status = response.status; throw e; }
    if (response.status === 402) { const e = new Error('Quota exceeded'); e.status = 402; throw e; }
    if (!response.ok) { const d = await response.json().catch(() => null); const e = new Error(d?.error?.message || `Error ${response.status}`); e.status = response.status; throw e; }

    const data = await response.json();
    const reply = (data.choices?.[0]?.message?.content || '').trim();

    return { ok: true, reply, model, latency, usage: data.usage };
}

// ─── Knowledge Base Fallback Answer ────────
function buildKnowledgeFallback(rawInput, knowledgeContext, productContext, intent, language) {
    const isEnglish = language === 'english';
    let answer = '';

    if (knowledgeContext && knowledgeContext.length > 100) answer = knowledgeContext;
    if (productContext) answer += '\n\n' + productContext;

    if (!answer || answer.length < 50) {
        return null;
    } else {
        const sourceNote = isEnglish
            ? '\n\n*Based on BARI, DAE, BRRI verified sources.*'
            : '\n\n*BARI, DAE, BRRI যাচাইকৃত তথ্য থেকে।*';
        answer += sourceNote;
    }
    return answer;
}

// ─── Health Check ──────────────────────────
function getHealthReport(env) {
    const e = env || process.env;
    const hasKey = !!(e && e[GROQ_CONFIG.apiKeyEnv]);
    return {
        status: hasKey && circuitBreaker.state !== 'OPEN' ? 'operational' : 'degraded',
        timestamp: new Date().toISOString(),
        provider: { name: GROQ_CONFIG.name, model: GROQ_CONFIG.model, hasApiKey: hasKey, circuitState: circuitBreaker.state, totalRequests: circuitBreaker.totalRequests, totalFailures: circuitBreaker.totalFailures },
        cache: getAnswerCacheStats(),
    };
}
function getProviderStatus(env) { return getHealthReport(env); }

// ─── MAIN: SEND MESSAGE ────────────────────
async function sendMessage(messages, systemPrompt, options = {}, env) {
    const startTime = Date.now();
    const e = env || process.env;
    const apiKey = e ? e[GROQ_CONFIG.apiKeyEnv] : undefined;
    const hasKey = !!apiKey;

    if (!hasKey || isCircuitOpen()) {
        return { ok: true, reply: null, provider: 'knowledge', model: 'knowledge-base', latency: 0, source: hasKey ? 'circuit_breaker' : 'no_key', attempts: 0 };
    }

    const maxTokens = options.maxTokens || 800;

    // Attempt 1: Primary model
    try {
        const result = await callGroq(messages, systemPrompt, { ...options, maxTokens }, apiKey);
        if (result.ok && result.reply) {
            recordSuccess();
            return { ok: true, reply: result.reply, provider: 'groq', model: result.model, latency: result.latency, usage: result.usage, attempts: 1 };
        }
    } catch (error) {
        console.warn(`Groq primary failed:`, error.message);
        recordFailure();

        // Attempt 2: Reduced tokens on rate limit
        if (error.status === 402 || error.status === 429) {
            try {
                const result = await callGroq(messages, systemPrompt, { ...options, maxTokens: Math.floor(maxTokens * 0.5) }, apiKey);
                if (result.ok && result.reply) { recordSuccess(); return { ok: true, reply: result.reply, provider: 'groq', model: result.model, latency: result.latency, attempts: 2 }; }
            } catch (e) { console.warn(`Groq retry failed:`, e.message); recordFailure(); }
        }

        // Attempt 3: Fallback model
        try {
            const result = await callGroq(messages, systemPrompt, { ...options, model: GROQ_CONFIG.fallbackModel, maxTokens: Math.floor(maxTokens * 0.7) }, apiKey);
            if (result.ok && result.reply) { recordSuccess(); return { ok: true, reply: result.reply, provider: 'groq', model: result.model, latency: result.latency, attempts: 3 }; }
        } catch (e) { console.warn(`Groq fallback model failed:`, e.message); recordFailure(); }
    }

    // All attempts failed — signal caller to use knowledge base
    return { ok: true, reply: null, provider: 'knowledge', model: 'knowledge-base', latency: Date.now() - startTime, source: 'all_providers_failed', attempts: 0 };
}

export { sendMessage, getHealthReport, getProviderStatus, getAnswerCacheKey, getCachedAnswer, setCachedAnswer, getAnswerCacheStats, buildKnowledgeFallback, GROQ_CONFIG };
