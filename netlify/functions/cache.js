/**
 * Response Cache — V11 Enterprise Architecture
 * Caches: Knowledge, Products, Popular Questions
 */

const CACHE_MAX_SIZE = 500;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

class ResponseCache {
    constructor() {
        this.cache = new Map();
        this.accessOrder = [];
    }

    _evictOldest() {
        // V33 FIX: Evict before insert to prevent off-by-one
        while (this.cache.size >= CACHE_MAX_SIZE) {
            const oldest = this.accessOrder.shift();
            if (oldest !== undefined) {
                this.cache.delete(oldest);
            }
        }
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
            this.cache.delete(key);
            this.accessOrder = this.accessOrder.filter(k => k !== key);
            return null;
        }
        // Move to end (most recently accessed)
        this.accessOrder = this.accessOrder.filter(k => k !== key);
        this.accessOrder.push(key);
        return entry.value;
    }

    set(key, value) {
        this._evictOldest();
        this.cache.set(key, { value, timestamp: Date.now() });
        this.accessOrder = this.accessOrder.filter(k => k !== key);
        this.accessOrder.push(key);
    }

    // V33 FIX: has() should not modify access order (read-only check)
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) return false;
        return Date.now() - entry.timestamp <= CACHE_TTL_MS;
    }

    clear() {
        this.cache.clear();
        this.accessOrder = [];
    }

    size() {
        return this.cache.size;
    }
}

// Separate cache instances for different types
const knowledgeCache = new ResponseCache();
const productCache = new ResponseCache();
const questionCache = new ResponseCache();

/**
 * Generate cache key
 */
function getCacheKey(query, options = {}) {
    const normalized = (query || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const parts = [normalized];
    if (options.crop) parts.push(`crop:${options.crop}`);
    if (options.disease) parts.push(`disease:${options.disease}`);
    if (options.season) parts.push(`season:${options.season}`);
    if (options.type) parts.push(`type:${options.type}`);
    return parts.join('|');
}

/**
 * Get from knowledge cache
 */
function getCachedKnowledge(key) {
    return knowledgeCache.get(key);
}

/**
 * Set knowledge cache
 */
function setCachedKnowledge(key, value) {
    knowledgeCache.set(key, value);
}

/**
 * Get from product cache
 */
function getCachedProducts(key) {
    return productCache.get(key);
}

/**
 * Set product cache
 */
function setCachedProducts(key, value) {
    productCache.set(key, value);
}

/**
 * Get from question cache (popular questions)
 */
function getCachedQuestion(key) {
    return questionCache.get(key);
}

/**
 * Set question cache
 */
function setCachedQuestion(key, value) {
    questionCache.set(key, value);
}

module.exports = {
    ResponseCache,
    knowledgeCache,
    productCache,
    questionCache,
    getCacheKey,
    getCachedKnowledge,
    setCachedKnowledge,
    getCachedProducts,
    setCachedProducts,
    getCachedQuestion,
    setCachedQuestion,
};
