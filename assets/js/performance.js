/**
 * SF AI V16 — পারফরম্যান্স মডিউল
 * ক্লায়েন্ট-সাইড ES মডিউল — ক্যাশিং, লেজি লোডিং, কম্প্রেশন, পারফরম্যান্স ট্র্যাকিং
 */

export const SFPerformance = {
    _responseCache: new Map(),
    _knowledgeCache: new Map(),
    _moduleCache: new Map(),
    _stats: {
        apiCalls: 0,
        totalDuration: 0,
        successfulCalls: 0,
        failedCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        moduleLoadTimes: []
    },
    _maxCacheSize: 5 * 1024 * 1024,
    _defaultTTL: 30 * 60 * 1000,

    init() {
        this._loadCacheFromStorage();
        this._setupPeriodicCleanup();
        return this;
    },

    async lazyLoad(modulePath) {
        if (this._moduleCache.has(modulePath)) {
            return this._moduleCache.get(modulePath);
        }
        const startTime = performance.now();
        try {
            const module = await import(modulePath);
            const loadTime = performance.now() - startTime;
            this._stats.moduleLoadTimes.push({ path: modulePath, time: loadTime });
            this._moduleCache.set(modulePath, module);
            return module;
        } catch (error) {
            console.error(`মডিউল লোড করতে ব্যর্থ: ${modulePath}`, error);
            throw error;
        }
    },

    cacheResponse(key, data, ttl = this._defaultTTL) {
        const cacheKey = `sf_cache_${key}`;
        const cacheItem = {
            data,
            timestamp: Date.now(),
            ttl
        };
        const serialized = JSON.stringify(cacheItem);
        if (this._getCacheSize() + serialized.length > this._maxCacheSize) {
            this._evictOldestCache();
        }
        try {
            localStorage.setItem(cacheKey, serialized);
            this._responseCache.set(key, cacheItem);
        } catch (error) {
            console.error('ক্যাশে সংরক্ষণে ব্যর্থ:', error);
        }
    },

    getCached(key) {
        const cacheKey = `sf_cache_${key}`;
        const cacheItem = this._responseCache.get(key) || this._getFromStorage(cacheKey);
        if (!cacheItem) {
            this._stats.cacheMisses++;
            return null;
        }
        if (this._isExpired(cacheItem)) {
            this._removeCached(key);
            this._stats.cacheMisses++;
            return null;
        }
        this._stats.cacheHits++;
        return cacheItem.data;
    },

    isCacheFresh(key) {
        const cacheKey = `sf_cache_${key}`;
        const cacheItem = this._responseCache.get(key) || this._getFromStorage(cacheKey);
        if (!cacheItem) return false;
        return !this._isExpired(cacheItem);
    },

    clearExpiredCache() {
        const now = Date.now();
        const keysToRemove = [];
        this._responseCache.forEach((item, key) => {
            if (this._isExpired(item)) {
                keysToRemove.push(key);
            }
        });
        keysToRemove.forEach(key => this._removeCached(key));
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const storageKey = localStorage.key(i);
            if (storageKey && storageKey.startsWith('sf_cache_')) {
                try {
                    const item = JSON.parse(localStorage.getItem(storageKey));
                    if (item && this._isExpired(item)) {
                        localStorage.removeItem(storageKey);
                    }
                } catch (e) {
                    localStorage.removeItem(storageKey);
                }
            }
        }
    },

    cacheKnowledge(key, data) {
        this._knowledgeCache.set(key, {
            data,
            timestamp: Date.now()
        });
    },

    getCachedKnowledge(key) {
        const item = this._knowledgeCache.get(key);
        if (!item) return null;
        if (Date.now() - item.timestamp > this._defaultTTL) {
            this._knowledgeCache.delete(key);
            return null;
        }
        return item.data;
    },

    debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    throttle(fn, limit) {
        let inThrottle = false;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    async compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => {
                            resolve(new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            }));
                        },
                        'image/jpeg',
                        quality
                    );
                };
                img.onerror = () => reject(new Error('ছবি লোড করতে ব্যর্থ'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ'));
            reader.readAsDataURL(file);
        });
    },

    preloadResources(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            if (url.endsWith('.js')) {
                link.as = 'script';
            } else if (url.endsWith('.css')) {
                link.as = 'style';
            } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                link.as = 'image';
            }
            document.head.appendChild(link);
        });
    },

    getStats() {
        const avgDuration = this._stats.apiCalls > 0
            ? this._stats.totalDuration / this._stats.apiCalls
            : 0;
        const successRate = this._stats.apiCalls > 0
            ? (this._stats.successfulCalls / this._stats.apiCalls) * 100
            : 0;
        const cacheHitRate = (this._stats.cacheHits + this._stats.cacheMisses) > 0
            ? (this._stats.cacheHits / (this._stats.cacheHits + this._stats.cacheMisses)) * 100
            : 0;
        const avgModuleLoadTime = this._stats.moduleLoadTimes.length > 0
            ? this._stats.moduleLoadTimes.reduce((a, b) => a + b.time, 0) / this._stats.moduleLoadTimes.length
            : 0;
        return {
            apiCalls: this._stats.apiCalls,
            averageDuration: avgDuration.toFixed(2),
            successRate: successRate.toFixed(2),
            cacheHits: this._stats.cacheHits,
            cacheMisses: this._stats.cacheMisses,
            cacheHitRate: cacheHitRate.toFixed(2),
            modulesLoaded: this._stats.moduleLoadTimes.length,
            averageModuleLoadTime: avgModuleLoadTime.toFixed(2),
            totalCacheSize: this._getCacheSize()
        };
    },

    trackAPICall(endpoint, duration, success) {
        this._stats.apiCalls++;
        this._stats.totalDuration += duration;
        if (success) {
            this._stats.successfulCalls++;
        } else {
            this._stats.failedCalls++;
        }
    },

    getCacheHitRate() {
        const total = this._stats.cacheHits + this._stats.cacheMisses;
        if (total === 0) return '0.00';
        return ((this._stats.cacheHits / total) * 100).toFixed(2);
    },

    clearAllCaches() {
        this._responseCache.clear();
        this._knowledgeCache.clear();
        this._moduleCache.clear();
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sf_cache_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        this._stats = {
            apiCalls: 0,
            totalDuration: 0,
            successfulCalls: 0,
            failedCalls: 0,
            cacheHits: 0,
            cacheMisses: 0,
            moduleLoadTimes: []
        };
    },

    _isExpired(item) {
        return Date.now() - item.timestamp > item.ttl;
    },

    _removeCached(key) {
        const cacheKey = `sf_cache_${key}`;
        this._responseCache.delete(key);
        localStorage.removeItem(cacheKey);
    },

    _getFromStorage(cacheKey) {
        try {
            const raw = localStorage.getItem(cacheKey);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    },

    _getCacheSize() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sf_cache_')) {
                const value = localStorage.getItem(key);
                total += (key.length + (value ? value.length : 0)) * 2;
            }
        }
        return total;
    },

    _evictOldestCache() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, item] of this._responseCache.entries()) {
            if (item.timestamp < oldestTime) {
                oldestTime = item.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this._removeCached(oldestKey);
        }
    },

    _setupPeriodicCleanup() {
        setInterval(() => this.clearExpiredCache(), 5 * 60 * 1000);
    },

    _loadCacheFromStorage() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('sf_cache_')) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item && !this._isExpired(item)) {
                        const cacheKey = key.replace('sf_cache_', '');
                        this._responseCache.set(cacheKey, item);
                    } else {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    localStorage.removeItem(key);
                }
            }
        }
    }
};
