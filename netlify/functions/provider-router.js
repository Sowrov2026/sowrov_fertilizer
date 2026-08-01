/* ============================================
   SF AI V31 — Intelligent AI Provider Router
   Multi-Provider Failover | Circuit Breaker
   Request Queue | Health Monitor | Smart Cache
   ============================================ */

// ─────────────────────────────────────────────
// PROVIDER CONFIGURATION
// ─────────────────────────────────────────────
const PROVIDERS = {
    groq: {
        name: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
        fallbackModel: 'llama-3.1-8b-instant',
        apiKeyEnv: 'GROQ_API_KEY',
        priority: 1,
        timeout: 30000,
        maxTokens: 8192,
        supportsStreaming: true,
        rateLimit: {
            maxRequests: 30,
            windowMs: 60000,
        },
    },
    gemini: {
        name: 'Gemini',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
        model: 'gemini-2.5-flash',
        fallbackModel: 'gemini-2.0-flash',
        apiKeyEnv: 'GEMINI_API_KEY',
        priority: 2,
        timeout: 60000,
        maxTokens: 8192,
        supportsStreaming: false,
        rateLimit: {
            maxRequests: 15,
            windowMs: 60000,
        },
    },
    huggingface: {
        name: 'HuggingFace',
        url: 'https://api-inference.huggingface.co/models/{model}',
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        fallbackModel: 'mistralai/Mistral-7B-Instruct-v0.3',
        apiKeyEnv: 'HUGGINGFACE_API_KEY',
        priority: 3,
        timeout: 120000,
        maxTokens: 4096,
        supportsStreaming: false,
        rateLimit: {
            maxRequests: 10,
            windowMs: 60000,
        },
    },
};

// ─────────────────────────────────────────────
// CIRCUIT BREAKER
// ─────────────────────────────────────────────
const circuitBreakers = {};
const CIRCUIT_BREAKER = {
    failureThreshold: 5,
    successThreshold: 2,
    timeoutMs: 5 * 60 * 1000, // 5 minutes
};

function getCircuitBreaker(providerId) {
    if (!circuitBreakers[providerId]) {
        circuitBreakers[providerId] = {
            state: 'CLOSED', // CLOSED = normal, OPEN = disabled, HALF_OPEN = testing
            failures: 0,
            successes: 0,
            lastFailureTime: 0,
            lastSuccessTime: 0,
            totalRequests: 0,
            totalFailures: 0,
        };
    }
    return circuitBreakers[providerId];
}

function recordSuccess(providerId) {
    const cb = getCircuitBreaker(providerId);
    cb.totalRequests++;
    cb.lastSuccessTime = Date.now();

    if (cb.state === 'HALF_OPEN') {
        cb.successes++;
        if (cb.successes >= CIRCUIT_BREAKER.successThreshold) {
            cb.state = 'CLOSED';
            cb.failures = 0;
            cb.successes = 0;
            console.log(`Circuit breaker CLOSED for ${providerId}`);
        }
    } else {
        cb.failures = 0;
    }
}

function recordFailure(providerId) {
    const cb = getCircuitBreaker(providerId);
    cb.totalRequests++;
    cb.totalFailures++;
    cb.failures++;
    cb.lastFailureTime = Date.now();

    if (cb.failures >= CIRCUIT_BREAKER.failureThreshold) {
        cb.state = 'OPEN';
        console.warn(`Circuit breaker OPEN for ${providerId} - disabled for ${CIRCUIT_BREAKER.timeoutMs / 1000}s`);
    }
}

function isCircuitOpen(providerId) {
    const cb = getCircuitBreaker(providerId);
    if (cb.state === 'CLOSED') return false;

    if (cb.state === 'OPEN') {
        if (Date.now() - cb.lastFailureTime > CIRCUIT_BREAKER.timeoutMs) {
            cb.state = 'HALF_OPEN';
            cb.successes = 0;
            console.log(`Circuit breaker HALF_OPEN for ${providerId} - testing`);
            return false;
        }
        return true;
    }

    // HALF_OPEN: allow one request
    return false;
}

// ─────────────────────────────────────────────
// PROVIDER HEALTH TRACKER
// ─────────────────────────────────────────────
const providerHealth = {};

function getProviderHealth(providerId) {
    if (!providerHealth[providerId]) {
        providerHealth[providerId] = {
            status: 'unknown',
            latency: 0,
            lastSuccess: null,
            lastFailure: null,
            requestsToday: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: [],
            dailyReset: Date.now(),
        };
    }
    const h = providerHealth[providerId];
    // Reset daily counter
    if (Date.now() - h.dailyReset > 24 * 60 * 60 * 1000) {
        h.requestsToday = 0;
        h.dailyReset = Date.now();
    }
    return h;
}

function recordProviderSuccess(providerId, latencyMs) {
    const h = getProviderHealth(providerId);
    h.status = 'healthy';
    h.latency = latencyMs;
    h.lastSuccess = Date.now();
    h.requestsToday++;
}

function recordProviderFailure(providerId, error) {
    const h = getProviderHealth(providerId);
    h.status = 'degraded';
    h.lastFailure = Date.now();
    h.requestsToday++;
    h.errors.push({ time: Date.now(), message: error });
    if (h.errors.length > 50) h.errors.shift();
}

function recordCacheHit(providerId) {
    const h = getProviderHealth(providerId);
    h.cacheHits++;
}

function recordCacheMiss(providerId) {
    const h = getProviderHealth(providerId);
    h.cacheMisses++;
}

// ─────────────────────────────────────────────
// REQUEST QUEUE (for rate limit handling)
// ─────────────────────────────────────────────
const requestQueues = {};

function getQueue(providerId) {
    if (!requestQueues[providerId]) {
        requestQueues[providerId] = [];
    }
    return requestQueues[providerId];
}

function enqueueRequest(providerId, requestFn) {
    return new Promise((resolve, reject) => {
        const queue = getQueue(providerId);
        queue.push({ requestFn, resolve, reject, timestamp: Date.now() });

        // Process queue if not already processing
        if (queue.length === 1) {
            processQueue(providerId);
        }
    });
}

async function processQueue(providerId) {
    const queue = getQueue(providerId);
    if (queue.length === 0) return;

    const item = queue[0];

    // Skip stale requests (>30s old)
    if (Date.now() - item.timestamp > 30000) {
        queue.shift();
        item.reject(new Error('Request expired in queue'));
        processQueue(providerId);
        return;
    }

    try {
        const result = await item.requestFn();
        queue.shift();
        item.resolve(result);
    } catch (error) {
        if (error.status === 429) {
            // Re-queue with delay
            const retryAfter = error.retryAfter || 2000;
            setTimeout(() => processQueue(providerId), retryAfter);
            return;
        }
        queue.shift();
        item.reject(error);
    }

    // Process next
    if (queue.length > 0) {
        setTimeout(() => processQueue(providerId), 100);
    }
}

// ─────────────────────────────────────────────
// SMART ANSWER CACHE (24 hours)
// ─────────────────────────────────────────────
const answerCache = new Map();
const ANSWER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
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

function setCachedAnswer(key, answer, providerId) {
    if (answerCache.size >= ANSWER_CACHE_MAX) {
        // Evict oldest
        const oldest = answerCache.keys().next().value;
        answerCache.delete(oldest);
    }
    answerCache.set(key, { answer, timestamp: Date.now(), provider: providerId });
}

function getAnswerCacheStats() {
    let totalHits = 0;
    let totalMisses = 0;
    for (const h of Object.values(providerHealth)) {
        totalHits += h.cacheHits;
        totalMisses += h.cacheMisses;
    }
    return {
        size: answerCache.size,
        totalHits,
        totalMisses,
        hitRate: totalHits + totalMisses > 0
            ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1) + '%'
            : '0%',
    };
}

// ─────────────────────────────────────────────
// EXPONENTIAL BACKOFF
// ─────────────────────────────────────────────
function getBackoffDelay(attempt, baseMs = 1000, maxMs = 30000) {
    const delay = Math.min(baseMs * Math.pow(2, attempt), maxMs);
    const jitter = delay * 0.1 * Math.random();
    return Math.floor(delay + jitter);
}

// ─────────────────────────────────────────────
// PROVIDER API CALLERS
// ─────────────────────────────────────────────

// ── Groq ──
async function callGroq(messages, systemPrompt, options = {}) {
    const apiKey = process.env[PROVIDERS.groq.apiKeyEnv];
    if (!apiKey) throw { status: 401, message: 'GROQ_API_KEY not configured' };

    const model = options.model || PROVIDERS.groq.model;
    const maxTokens = options.maxTokens || 2500;

    const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content || '',
        })),
    ];

    const startTime = Date.now();
    const response = await fetch(PROVIDERS.groq.url, {
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
        signal: AbortSignal.timeout(PROVIDERS.groq.timeout),
    });

    const latency = Date.now() - startTime;

    if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const err = new Error('Rate limited');
        err.status = 429;
        err.retryAfter = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
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
        provider: 'groq',
        latency,
        usage: data.usage,
    };
}

// ── Gemini ──
async function callGemini(messages, systemPrompt, options = {}) {
    const apiKey = process.env[PROVIDERS.gemini.apiKeyEnv];
    if (!apiKey) throw { status: 401, message: 'GEMINI_API_KEY not configured' };

    const model = options.model || PROVIDERS.gemini.model;
    const maxTokens = options.maxTokens || 2500;

    // Build Gemini-format request
    const contents = [];
    for (const msg of messages) {
        if (msg.role === 'user') {
            contents.push({ role: 'user', parts: [{ text: msg.content || '' }] });
        } else if (msg.role === 'assistant') {
            contents.push({ role: 'model', parts: [{ text: msg.content || '' }] });
        }
    }

    const url = PROVIDERS.gemini.url.replace('{model}', model);

    const startTime = Date.now();
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: 0.15,
                topP: 0.9,
            },
        }),
        signal: AbortSignal.timeout(PROVIDERS.gemini.timeout),
    });

    const latency = Date.now() - startTime;

    if (response.status === 429) {
        const err = new Error('Rate limited');
        err.status = 429;
        err.retryAfter = 3000;
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
        const err = new Error(errorData?.error?.message || `Gemini error ${response.status}`);
        err.status = response.status;
        throw err;
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
        ok: true,
        reply,
        model,
        provider: 'gemini',
        latency,
        usage: data.usageMetadata,
    };
}

// ── HuggingFace ──
async function callHuggingFace(messages, systemPrompt, options = {}) {
    const apiKey = process.env[PROVIDERS.huggingface.apiKeyEnv];
    if (!apiKey) throw { status: 401, message: 'HUGGINGFACE_API_KEY not configured' };

    const model = options.model || PROVIDERS.huggingface.model;
    const maxTokens = options.maxTokens || 2000;

    // Build HuggingFace messages format
    const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content || '',
        })),
    ];

    const url = PROVIDERS.huggingface.url.replace('{model}', model);

    const startTime = Date.now();
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            messages: formattedMessages,
            max_tokens: maxTokens,
            temperature: 0.15,
            top_p: 0.9,
        }),
        signal: AbortSignal.timeout(PROVIDERS.huggingface.timeout),
    });

    const latency = Date.now() - startTime;

    if (response.status === 429) {
        const err = new Error('Rate limited');
        err.status = 429;
        err.retryAfter = 5000;
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

    if (response.status === 503) {
        // Model loading
        const err = new Error('Model loading');
        err.status = 503;
        err.retryAfter = 10000;
        throw err;
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const err = new Error(errorData?.error || `HuggingFace error ${response.status}`);
        err.status = response.status;
        throw err;
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return {
        ok: true,
        reply,
        model,
        provider: 'huggingface',
        latency,
        usage: data.usage,
    };
}

// ─────────────────────────────────────────────
// PROVIDER ROUTER
// ─────────────────────────────────────────────
const PROVIDER_CALLERS = {
    groq: callGroq,
    gemini: callGemini,
    huggingface: callHuggingFace,
};

function getAvailableProviders() {
    return Object.entries(PROVIDERS)
        .filter(([id, config]) => {
            const hasKey = !!process.env[config.apiKeyEnv];
            const cb = getCircuitBreaker(id);
            const isOpen = isCircuitOpen(id);
            return hasKey && !isOpen;
        })
        .sort((a, b) => a[1].priority - b[1].priority)
        .map(([id]) => id);
}

function getProviderStatus() {
    return Object.entries(PROVIDERS).map(([id, config]) => {
        const cb = getCircuitBreaker(id);
        const h = getProviderHealth(id);
        const hasKey = !!process.env[config.apiKeyEnv];
        const isOpen = isCircuitOpen(id);

        let status = 'unknown';
        if (!hasKey) status = 'no_key';
        else if (isOpen) status = 'circuit_open';
        else if (h.status === 'degraded') status = 'degraded';
        else if (h.status === 'healthy') status = 'healthy';
        else status = 'standby';

        return {
            provider: config.name,
            providerId: id,
            status,
            latency: h.latency || 0,
            lastSuccess: h.lastSuccess ? new Date(h.lastSuccess).toISOString() : null,
            lastFailure: h.lastFailure ? new Date(h.lastFailure).toISOString() : null,
            requestsToday: h.requestsToday,
            totalRequests: cb.totalRequests,
            totalFailures: cb.totalFailures,
            circuitState: cb.state,
            cacheHitRate: h.cacheHits + h.cacheMisses > 0
                ? ((h.cacheHits / (h.cacheHits + h.cacheMisses)) * 100).toFixed(1) + '%'
                : 'N/A',
            model: config.model,
            hasApiKey: hasKey,
        };
    });
}

// ─────────────────────────────────────────────
// MAIN: SEND MESSAGE WITH FAILOVER
// ─────────────────────────────────────────────
async function sendMessage(messages, systemPrompt, options = {}) {
    const startTime = Date.now();
    const available = getAvailableProviders();

    if (available.length === 0) {
        return {
            ok: false,
            status: 503,
            error: 'সব AI প্রোভাইডার এখন অনুপলব্ধ। অনুগ্রহ করে পরে চেষ্টা করুন।',
            errorEn: 'All AI providers are currently unavailable.',
        };
    }

    const maxTokens = options.maxTokens || 2500;
    let lastError = null;

    for (let attempt = 0; attempt < available.length; attempt++) {
        const providerId = available[attempt];
        const config = PROVIDERS[providerId];
        const caller = PROVIDER_CALLERS[providerId];

        try {
            console.log(`Trying provider: ${config.name} (attempt ${attempt + 1}/${available.length})`);

            const result = await caller(messages, systemPrompt, {
                ...options,
                maxTokens,
            });

            if (result.ok && result.reply) {
                recordSuccess(providerId);
                recordProviderSuccess(providerId, result.latency);

                console.log(`Success with ${config.name}: ${result.latency}ms, model: ${result.model}`);

                return {
                    ok: true,
                    reply: result.reply,
                    provider: providerId,
                    model: result.model,
                    latency: result.latency,
                    usage: result.usage,
                    attempts: attempt + 1,
                };
            }
        } catch (error) {
            lastError = error;
            recordFailure(providerId);
            recordProviderFailure(providerId, error.message);

            console.warn(`Provider ${config.name} failed:`, error.message, `status: ${error.status}`);

            // If rate limited, queue and retry
            if (error.status === 429) {
                try {
                    console.log(`Queueing request for ${config.name} after rate limit`);
                    const queuedResult = await enqueueRequest(providerId, () =>
                        caller(messages, systemPrompt, { ...options, maxTokens })
                    );
                    if (queuedResult.ok && queuedResult.reply) {
                        recordSuccess(providerId);
                        recordProviderSuccess(providerId, queuedResult.latency);
                        return {
                            ok: true,
                            reply: queuedResult.reply,
                            provider: providerId,
                            model: queuedResult.model,
                            latency: queuedResult.latency,
                            usage: queuedResult.usage,
                            attempts: attempt + 1,
                            queued: true,
                        };
                    }
                } catch (queueError) {
                    console.warn(`Queued request also failed for ${config.name}:`, queueError.message);
                }
            }

            // Continue to next provider
            if (attempt < available.length - 1) {
                const backoff = getBackoffDelay(attempt);
                console.log(`Backing off ${backoff}ms before next provider...`);
                await new Promise(r => setTimeout(r, backoff));
            }
        }
    }

    // All providers failed
    const totalLatency = Date.now() - startTime;
    return {
        ok: false,
        status: 502,
        error: 'AI সেবা এখন সমস্যায় আছে। কিছুক্ষণ পর আবার চেষ্টা করুন।',
        errorEn: 'AI service is experiencing issues. Please try again shortly.',
        latency: totalLatency,
        attempts: available.length,
    };
}

// ─────────────────────────────────────────────
// HEALTH CHECK ENDPOINT DATA
// ─────────────────────────────────────────────
function getHealthReport() {
    const providers = getProviderStatus();
    const cacheStats = getAnswerCacheStats();

    const healthyCount = providers.filter(p => p.status === 'healthy').length;
    const totalCount = providers.length;

    return {
        status: healthyCount > 0 ? 'operational' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        providers,
        cache: cacheStats,
        queues: Object.entries(requestQueues).map(([id, queue]) => ({
            provider: id,
            pending: queue.length,
        })),
        summary: {
            totalProviders: totalCount,
            healthyProviders: healthyCount,
            circuitBreakers: Object.entries(circuitBreakers).map(([id, cb]) => ({
                provider: id,
                state: cb.state,
                failures: cb.failures,
                totalRequests: cb.totalRequests,
            })),
        },
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
    PROVIDERS,
    getCircuitBreaker,
    isCircuitOpen,
};
