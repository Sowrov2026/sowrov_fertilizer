/**
 * Response Cache — V8 RAG Engine
 * Caches retrieved documents and frequent question answers
 */

const CACHE_MAX_SIZE = 200;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

class ResponseCache {
    constructor() {
        this.cache = new Map();
        this.accessOrder = [];
    }

    _evictOldest() {
        if (this.accessOrder.length > CACHE_MAX_SIZE) {
            const oldest = this.accessOrder.shift();
            this.cache.delete(oldest);
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
        // Move to end (most recently used)
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

    has(key) {
        return this.get(key) !== null;
    }

    clear() {
        this.cache.clear();
        this.accessOrder = [];
    }

    size() {
        return this.cache.size;
    }
}

// Singleton cache instance
const queryCache = new ResponseCache();

/**
 * Generate cache key from query + options
 */
function getCacheKey(query, options = {}) {
    const normalized = (query || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const parts = [normalized];
    if (options.crop) parts.push(`crop:${options.crop}`);
    if (options.disease) parts.push(`disease:${options.disease}`);
    if (options.season) parts.push(`season:${options.season}`);
    return parts.join('|');
}

module.exports = {
    queryCache,
    getCacheKey,
};
