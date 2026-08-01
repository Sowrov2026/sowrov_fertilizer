/**
 * SF AI V16 — Offline AI Module
 * Client-side ES module for offline support
 */
export const SFOffline = {
    _cacheKey: 'sf_offline_cache',
    _maxCacheSize: 5 * 1024 * 1024,
    _maxCachedPairs: 100,
    _indicatorId: 'sf-offline-indicator',

    init() {
        if (!this._getCache()) {
            this._setCache({ pairs: {}, knowledge: [], popular: [], stats: { hits: 0, misses: 0 } });
        }
        this._createIndicatorElement();
        this._setupNetworkListeners();
        if (!this.isOnline()) {
            this.showOfflineIndicator();
        }
        this._loadEssentialKnowledge();
    },

    isOnline() {
        return navigator.onLine;
    },

    cacheQA(question, answer, metadata = {}) {
        const cache = this._getCache();
        if (!cache) return;
        const key = this._normalizeKey(question);
        cache.pairs[key] = {
            question,
            answer,
            metadata,
            timestamp: Date.now(),
            accessCount: 0
        };
        this._enforceCacheLimit(cache);
        this._setCache(cache);
    },

    searchCache(query, limit = 5) {
        const cache = this._getCache();
        if (!cache || !cache.pairs) return [];
        const q = query.toLowerCase();
        const results = [];
        for (const key in cache.pairs) {
            const pair = cache.pairs[key];
            const ql = pair.question.toLowerCase();
            let score = 0;
            if (ql === q) { score = 100; }
            else if (ql.includes(q)) { score = 50; }
            else if (this._containsWords(ql, q)) { score = 20; }
            if (score > 0) {
                results.push({ ...pair, score });
            }
        }
        if (results.length > 0) {
            cache.stats.hits++;
        } else {
            cache.stats.misses++;
        }
        this._setCache(cache);
        return results.sort((a, b) => b.score - a.score).slice(0, limit);
    },

    async getOfflineAnswer(question) {
        const cached = this.searchCache(question, 1);
        if (cached.length > 0) {
            return {
                text: cached[0].answer,
                source: 'cache',
                confidence: cached[0].metadata?.confidence || 0.8,
                timestamp: cached[0].timestamp
            };
        }
        const knowledgeMatch = this._searchKnowledge(question);
        if (knowledgeMatch) {
            return {
                text: knowledgeMatch.answer,
                source: 'knowledge',
                confidence: knowledgeMatch.confidence || 0.6,
                timestamp: Date.now()
            };
        }
        return {
            text: '\u09A6\u09C1\u0996\u09BF\u09A4, \u098F\u0987 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7\u09B0 \u0989\u09A4\u09CD\u09A4\u09B0 \u0985\u09AB\u09B2\u09BE\u0987\u09A8\u09C7 \u09AA\u09BE\u0993\u09AF\u09BC\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BF\u0964 \u0987\u09A8\u09CD\u099F\u09BE\u09B0\u09A8\u09C7\u099F \u09B8\u0982\u09AF\u09C1\u0997 \u09AA\u09C1\u09A8\u09B0\u09C1\u09A6\u09CD\u09A7\u09BE\u09B0 \u0995\u09B0\u09C7 \u0986\u09AC\u09BE\u09B0 \u099A\u09C7\u09B7\u09CD\u099F\u09BE \u0995\u09B0\u09C1\u09A8\u0964',
            source: 'fallback',
            confidence: 0,
            timestamp: Date.now()
        };
    },

    cacheKnowledgeBase(documents) {
        const cache = this._getCache();
        if (!cache) return;
        cache.knowledge = documents.map(doc => ({ ...doc, cachedAt: Date.now() }));
        this._setCache(cache);
    },

    getCachedKnowledge() {
        const cache = this._getCache();
        return cache?.knowledge || [];
    },

    clearOldCache(days = 7) {
        const cache = this._getCache();
        if (!cache) return;
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        for (const key in cache.pairs) {
            if (cache.pairs[key].timestamp < cutoff) delete cache.pairs[key];
        }
        if (cache.knowledge) {
            cache.knowledge = cache.knowledge.filter(doc => doc.cachedAt >= cutoff);
        }
        this._setCache(cache);
    },

    getCacheStats() {
        const cache = this._getCache();
        if (!cache) return { pairsCount: 0, knowledgeCount: 0, sizeBytes: 0, sizeMB: 0, stats: { hits: 0, misses: 0 } };
        const pairsCount = Object.keys(cache.pairs).length;
        const knowledgeCount = (cache.knowledge || []).length;
        const sizeBytes = new Blob([JSON.stringify(cache)]).size;
        return {
            pairsCount,
            knowledgeCount,
            sizeBytes,
            sizeMB: parseFloat((sizeBytes / (1024 * 1024)).toFixed(2)),
            stats: cache.stats || { hits: 0, misses: 0 }
        };
    },

    showOfflineIndicator() {
        const el = document.getElementById(this._indicatorId);
        if (el) el.style.display = 'flex';
    },

    hideOfflineIndicator() {
        const el = document.getElementById(this._indicatorId);
        if (el) el.style.display = 'none';
    },

    preCachePopular() {
        const popular = this._getEssentialKnowledge();
        const cache = this._getCache();
        if (!cache) return;
        cache.popular = popular.slice(0, this._maxCachedPairs).map(item => ({
            ...item,
            cachedAt: Date.now()
        }));
        this._setCache(cache);
    },

    _getCache() {
        try {
            const raw = localStorage.getItem(this._cacheKey);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    },

    _setCache(data) {
        try {
            const json = JSON.stringify(data);
            if (new Blob([json]).size > this._maxCacheSize) {
                this._trimCache(data);
            }
            localStorage.setItem(this._cacheKey, json);
        } catch (e) {
            console.warn('SFOffline: Cache write failed', e);
        }
    },

    _trimCache(data) {
        const keys = Object.keys(data.pairs || {});
        const sorted = keys.sort((a, b) => (data.pairs[a].accessCount || 0) - (data.pairs[b].accessCount || 0));
        const removeCount = Math.ceil(sorted.length * 0.2);
        for (let i = 0; i < removeCount; i++) {
            delete data.pairs[sorted[i]];
        }
    },

    _enforceCacheLimit(data) {
        const keys = Object.keys(data.pairs || {});
        if (keys.length > this._maxCachedPairs) {
            const sorted = keys.sort((a, b) => (data.pairs[a].timestamp || 0) - (data.pairs[b].timestamp || 0));
            while (sorted.length > this._maxCachedPairs) {
                delete data.pairs[sorted.shift()];
            }
        }
    },

    _normalizeKey(text) {
        return text.toLowerCase().replace(/[^a-z0-9\u0980-\u09FF]+/g, '_').trim();
    },

    _containsWords(text, query) {
        const words = query.split(/\s+/).filter(w => w.length > 1);
        return words.every(w => text.includes(w));
    },

    _searchKnowledge(question) {
        const cache = this._getCache();
        if (!cache) return null;
        const sources = [cache.knowledge || [], cache.popular || []];
        const q = question.toLowerCase();
        let best = null;
        let bestScore = 0;
        for (const list of sources) {
            for (const item of list) {
                const ql = (item.question || '').toLowerCase();
                let score = 0;
                if (ql === q) score = 100;
                else if (ql.includes(q)) score = 60;
                else if (this._containsWords(ql, q)) score = 30;
                if (score > bestScore) {
                    bestScore = score;
                    best = item;
                }
            }
        }
        return best && bestScore > 0 ? best : null;
    },

    _createIndicatorElement() {
        if (document.getElementById(this._indicatorId)) return;
        const banner = document.createElement('div');
        banner.id = this._indicatorId;
        banner.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,#e67e22,#d35400);color:#fff;text-align:center;padding:10px 16px;font-family:sans-serif;font-size:14px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.3);';
        banner.textContent = '\u0985\u09AB\u09B2\u09BE\u0987\u09A8 \u09AE\u09CB\u09A1 \u2014 \u09B8\u09C0\u09AE\u09BF\u09A4 \u0989\u09A4\u09CD\u09A4\u09B0 \u09AA\u09CD\u09B0\u09A6\u09BE\u09A8 \u0995\u09B0\u09BE \u09B9\u099A\u09CD\u099B\u09C7';
        document.body.appendChild(banner);
    },

    _setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.hideOfflineIndicator();
        });
        window.addEventListener('offline', () => {
            this.showOfflineIndicator();
        });
    },

    _loadEssentialKnowledge() {
        const cache = this._getCache();
        if (cache && cache.knowledge && cache.knowledge.length > 0) return;
        const essential = this._getEssentialKnowledge();
        this.cacheKnowledgeBase(essential);
    },

    _getEssentialKnowledge() {
        return [
            { question: '\u0987\u09A8\u09CD\u09A1\u09C7 \u0995\u09C0 \u09B8\u09BE\u09B0 \u09B2\u09BE\u0997\u09C7?', answer: '\u0987\u09A8\u09CD\u09A1\u09C7 \u0995\u09C0 \u09B8\u09BE\u09B0 \u09B2\u09BE\u0997\u09C7 \u09A4\u09BE \u09A1\u09C7\u09A8\u09CD\u09A4\u09A8\u09A4\u09BE\u09B0 \u09B6\u09B8\u09CD\u09AF \u09B8\u09B9 \u09A8\u09BF\u09B0\u09CD\u09A6\u09BE\u09B9\u09BF\u09A4 \u09A4\u09A5\u09CD\u09A5\u09A6\u09C7\u09B6 \u09A6\u09C7\u0996\u09A4\u09C7 \u09B9\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09B8\u09BE\u09B0', confidence: 0.9 },
            { question: '\u09A7\u09BE\u09A8\u09C7\u09B0 \u09AC\u09C0\u099C\u09C7 \u0995\u09C0 \u0997\u09C1\u09A3\u0997\u09A4 \u09B8\u09C7\u09B0\u09A8\u09C7\u09B0 \u09AE\u09BE\u09A8 \u0995\u09C0?', answer: '\u09AD\u09BE\u09B2\u09CB \u09A7\u09BE\u09A8\u09C7\u09B0 \u09AC\u09C0\u099C \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0, \u09B0\u09CB\u0997\u09AE\u09C1\u0995\u09CD\u09A4, \u09A7\u09BE\u09B0\u09B8\u09CD\u09A4 \u0995\u09CD\u09B7\u09AE\u09A4\u09BE \u09A5\u09C7\u0995\u09A4\u09C7 \u09B9\u09AC\u09C7 \u09B8\u09A4\u09C7\u09B0\u09A4\u09BE \u09A5\u09C7\u0995\u09A4\u09C7 \u0995\u09AE \u09A4\u09A5\u09C7 \u09B9\u09B8\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09A8\u09B0\u09CD\u09B8\u09BE\u09B0\u09BF\u09A6', confidence: 0.85 },
            { question: '\u09AE\u09BE\u099F\u09BF \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u0995\u09C7\u09A8 \u099C\u09B0\u09C1\u09B0\u09BF?', answer: '\u09AE\u09BE\u099F\u09BF \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE\u09AF\u09BC\u09C7 \u09AE\u09BE\u099F\u09BF\u09B0 \u09AA\u09C1\u09B7\u09CD\u09A4\u09BF \u0989\u09AA\u09BE\u09A6\u09BE\u09A8, pH, \u09A7\u09BE\u09B0\u09CD\u09AE\u09BE\u09A4\u09CD\u09B0, \u098F\u09AC\u0982 \u099C\u09C8\u09AC\u09BF\u0995 \u09AA\u09A6\u09BE\u09B0\u09CD\u09A5\u09C7\u09B0 \u09AA\u09B0\u09BF\u09AE\u09BE\u09A3 \u099C\u09BE\u09A8\u09BE \u09AF\u09BE\u09AF\u09BC\u09A8\u09BE\u09B0\u09BF\u099F\u09BF\u09B8\u099F\u09BF \u09B8\u09AE\u09CD\u09AD\u09AC\u09C7\u09B0\u09CD\u09AC \u0995\u09B0\u09A8\u09CB\u09B0 \u099C\u09A8\u09CD\u09AE\u09B8\u09A4\u09CD\u09B0\u09C7\u09B0\u09B8\u09B9\u09BE\u09A4\u09B0\u09B8\u09CD\u09A4\u09A4\u09CD\u09B5 \u09B9\u09A4\u09C7\u09B0\u09A4\u09C7 \u09B9\u09AB\u09B8\u09A8\u09C7 \u09B8\u09B9\u09BE\u09AF\u09A4\u09C7\u09B0 \u09A8\u09C7\u09A8\u0964', category: '\u09AE\u09BE\u099F\u09BF \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE', confidence: 0.9 },
            { question: '\u099F\u09B2\u09C7\u09B0\u09A4\u09C7 \u0995\u09CB\u09A8 \u09B8\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8?', answer: '\u099F\u09B2\u09C7\u09B0\u09A4\u09C7 \u09A1\u09BF\u09AF\u09BC\u09C7\u09AA\u09BF\u099A\u09BF, \u099F\u09BF\u098F\u09B8\u09C1\u09AA\u09BF\u099A\u09BF, \u099C\u09BF\u09AA\u09B8\u09BE\u09AE, \u098F\u09AC\u0982 \u09AC\u09CB\u09B0\u09A8 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\u0964 \u09AB\u09C1\u09B2 \u09A7\u09B0\u09BE\u09B0 \u09B8\u09AE\u09AF\u09BC\u09A4 \u09AA\u099F\u09BE\u09B6\u09BF\u09AF\u09BC\u09A4\u09CD\u09A4\u09A4\u09CD\u09AC \u09AC\u09BE\u09A1\u09BC\u09C7\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09B6\u09B8\u09CD\u09AF \u099A\u09BF\u0995\u09BF\u09A4\u09CD\u09B8\u09BE', confidence: 0.85 },
            { question: '\u09B8\u09C1\u09A8\u09B0 \u09A8\u09B8\u09BE \u0995\u09A8?', answer: '\u09B8\u09C1\u09A8\u09B0 \u09A8\u09B8\u09BE \u09B9\u09B2 \u09A4\u09C7\u09B2\u09C7 \u09A6\u09C1\u0996\u09C0 \u09A4\u09BE\u09A4\u09C7\u09B0\u09A4\u09C7 \u099B\u09A1\u09BC\u09C7 \u09B0\u09B9\u09B8\u09CD\u09A4\u09A4\u09BE \u09AA\u09B0\u09BF\u09AC\u09B0\u09CD\u09A4\u09A8 \u0995\u09B0\u09C7\u099F\u09B8\u09C7\u09A8\u09C0\u09B9\u09C7\u09B0 \u09B8\u09B0\u09C7\u09B8\u09CD\u099F \u099A\u09B2\u09A4\u09CD\u09B9\u09C7\u09B0 \u09AA\u09B0 \u09A8\u09BF\u09B0\u09CD\u09AD\u09B0 \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6\u09C0\u09B0 \u09AC\u09A8\u09A4\u09CD\u09A4 \u09B9\u09A4\u09C7\u09B0\u09A4\u09C7 \u09B9\u09AF\u09BC\u09B8\u09A4 \u09A4\u09C7\u09B2\u09C7\u09B0 \u09AE\u09BE\u09A8\u09B8\u09B9\u09C7\u09B0\u09BE \u09B9\u09B8\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964 \u09A6\u09C0\u09B0\u09CD\u0998\u09C7\u09B0 \u09A4\u09C7\u09B2\u09C7 \u09B8\u09C1\u09A8\u09B0 \u09A8\u09A4\u09BE\u0995\u09B0\u09A4\u09A4\u09BE \u0995\u09AE \u0995\u09B0\u09C7\u09A8\u09A4\u09A4\u09B9\u09BE\u09B0\u09BE \u09A8\u09C7\u09B8\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09B8\u09C7\u09A4\u09C1', confidence: 0.9 },
            { question: '\u09AA\u09C7\u09B8\u09CD\u099F\u09BF\u09B8\u09BE\u0987\u09A1 \u0995\u09BF \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6?', answer: '\u09A8\u09BF\u09B0\u09CD\u09A7\u09BE\u09B0\u09BF\u09A4 \u09AE\u09BE\u09A4\u09CD\u09B0\u09BE\u09AF\u09BC \u098F\u09AC\u0982 \u09B8\u09B9\u09C0 \u09A1\u09CD\u09B0\u0995 \u09A8\u09BF\u09B0\u09CD\u09A7\u09BE\u09B0\u09A3 \u09AA\u09B2\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09B2\u09C7 \u09AA\u09C7\u09B8\u09CD\u099F\u09BF\u09B8\u09BE\u0987\u09A1 \u09A8\u09BF\u09B0\u09BE\u09AA\u09A6\u0964', category: '\u09B8\u09A6\u09A8\u09CD\u09A7\u09B0\u09CD\u09A3', confidence: 0.7 },
            { question: '\u0987\u09A8\u09CD\u09A1\u09C7 \u09A8\u09A8\u09B0\u09C7\u09B0 \u09B8\u09BE\u09B0 \u09B2\u09BE\u0997\u09C7?', answer: '\u09A8\u09A8\u09B0\u09C7\u09B0 \u09B8\u09BE\u09B0\u09A4\u09C7 \u09AB\u09B2\u09A8 \u09A6\u09C0\u09A4\u09C7\u09B0 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09A7\u09BE\u09A8\u09C7 \u09B9\u09B8\u09B9\u09C7\u09B0 \u09A5\u09C7\u0995\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09B8\u09BE\u09B0', confidence: 0.85 },
            { question: '\u099C\u09C8\u09AC\u09BF\u0995 \u09B8\u09BE\u09B0 \u09A4\u09A5\u09CD\u09A5 \u0995\u09C0?', answer: '\u099C\u09C8\u09AC\u09BF\u0995 \u09B8\u09BE\u09B0 \u09B9\u09B2 \u09AE\u09BE\u099F\u09BF\u09B0 \u09A6\u09C7\u09A4\u09A4\u09CD\u09B5 \u0995\u09CD\u09B0\u09A1\u09B6 \u09B8\u09C3\u099C\u09A8\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09A4\u09CD\u09A4\u09A4\u09BE \u09AC\u09C3\u09A6\u09CD\u09A7 \u0995\u09B0\u09C7\u0964 \u099C\u09C8\u09A8\u09B8\u09BF\u09B8, \u09AC\u09B9\u09C1\u09B2, \u09B8\u09BF\u09AB\u09A8, \u09B0\u09B9\u09C7\u09B0 \u099C\u09CD\u09A8\u09BF\u09A4 \u09A6\u09C7\u09AF\u09BC \u09B8\u099F\u09CD\u09A6 \u09A5\u09BE\u0995\u09C7\u09B0\u0964', category: '\u09B8\u09BE\u09B0', confidence: 0.9 },
            { question: '\u09B6\u09B8\u09CD\u09AF\u09C7 \u09B0\u09CB\u0997 \u09AA\u09B0\u09BF\u09B9\u09BE\u09B0 \u0995\u09B0\u09AC\u09C7\u09A8?', answer: '\u09B6\u09B8\u09CD\u09AF\u09C7 \u09B0\u09CB\u0997 \u09A6\u09C7\u0996\u09A4\u09C7 \u09B9\u09B2\u09C7, \u09A4\u09BE\u09B9\u09B8\u09C7 \u09B0\u09CB\u0997\u09B0 \u09B2\u0995\u09CD\u09B7\u09A3\u09AA\u09B8\u09CD\u09A4\u09C1\u09B7\u099F \u099A\u09BF\u09B9\u09CD\u09A8\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8\u0964 \u09AA\u09A4\u09C7\u09B0 \u09B6\u09B8\u09CD\u09AF\u09C7 \u09B0\u09CB\u0997 \u09AE\u09C1\u0996\u09CD\u09A4\u09C7 \u09B6\u09BF\u09B6\u09C1 \u09B8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u0997 \u09A4\u09A5\u09A4\u09CD\u09A5\u09BF\u09C7\u09B0 \u09B8\u09A8\u09CD\u09A4\u09BE\u09AA\u09A8 \u09AC\u09C7\u09B7 \u09A6\u09BF\u09A8\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09B6\u09B8\u09CD\u09AF \u09B0\u09B8\u09CD\u09A1\u09A8', confidence: 0.85 },
            { question: '\u09B9\u09B2\u09A6\u09A8\u09C7\u09B0 \u09A8\u09A4\u09C2\u09A8 \u0995\u09B0\u09A4\u09C7 \u09B9\u09A4\u09B8\u09C7\u09A8\u09C0?', answer: '\u09A7\u09BE\u09A8\u09C7\u09B0 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u09A8\u09B8\u09A4 \u0995\u09B0\u09A4\u09C7 \u09A6\u09C1\u09A6\u09C1 \u09B6\u09B8\u09C7\u09B0 \u099A\u09C7\u09B9\u09B8\u09CD\u099F\u09C7 \u09B0\u09BE\u0996\u09A8\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964 \u0987\u09A8\u09CD\u099F\u09B0\u09C1\u09A8\u09C7\u099F \u09B8\u09C0\u09B2\u09BE \u09A8\u09C7\u09A8\u09A4\u09C7 \u09B9\u09C8\u09B2\u09C7\u09A8\u09A4\u09CD\u09A4\u09A6\u09B6\u09CD\u09B0\u09A7\u09BF\u09A4 \u0995\u09B0\u09C1\u09A8\u0964', category: '\u09B8\u09A8\u09CD\u09A1\u09B0\u09CD\u09A8', confidence: 0.9 },
            { question: '\u09AC\u09BE\u099C\u09B0 \u0995\u09BF\u09B8\u09C7 \u0995\u09BF\u09A8\u09CD\u09A1 \u09B2\u09BE\u0997\u09C7?', answer: '\u09AC\u09BE\u099C\u09B0 \u0995\u09BF\u09B8\u09C7 \u09A8\u09BF\u09B0\u09CD\u09A8\u09A4 \u09B2\u0995\u09CD\u09B7\u09A3\u09AA \u0995\u09C0\u09A4\u09C1 \u09B8\u09BE\u09B0 \u09B0\u09A4\u09CD\u09A4 \u0986\u09B9\u09B2\u09BE\u09A6 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964 \u09B6\u09B8\u09CD\u09AF \u09B2\u09B2\u09A8\u09C7\u09B0 \u09B8\u09AE\u09AF\u09BC \u09A6\u09C1\u0995\u09B9\u09C7\u09A8\u09B8 \u09B8\u09C0\u09B0\u09C7 \u09A6\u09C7\u09A8\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09B6\u09B8\u09CD\u09AF \u099A\u09BF\u0995\u09BF\u09A4\u09CD\u09B8\u09BE', confidence: 0.85 },
            { question: '\u09B9\u09B2\u09A6\u09BF\u09B8\u09CD\u09A4\u09BE \u0995\u09B8\u09CD\u09A4\u09B5\u09BF\u09A6\u09CD\u09A7 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7?', answer: '\u09A7\u09BE\u09A8\u09C7\u09B0 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u09B8\u09A8\u09CD\u09A1\u09B0\u09CD\u09A8 \u09A8\u09B8\u09A4\u09C7\u09B0 \u09A6\u09C7\u09B6\u09C7\u09B0 \u09A8\u09C0\u09B0\u09C0\u0995\u09B7\u09A3 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u09A8\u09A4\u09C2\u09A8 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964 \u09AE\u09C3\u09A4\u09CD\u09A4 \u09AA\u09A4\u09CD\u09B0 \u0985\u09A8\u09C1\u09B8\u09A8\u09CD\u09A7\u09BE\u09A8 \u09A7\u09BE\u09B0\u09BE \u09A4\u09BE\u09B2 \u09AA\u09C7\u09B2\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09B8\u09A8\u09CD\u09A1\u09B0\u09CD\u09A8', confidence: 0.9 },
            { question: '\u09B8\u09BE\u09B0\u09A4\u09C7 \u0995\u09A8 \u09B9\u09B2\u09C7?', answer: '\u09B8\u09BE\u09B0\u09A4\u09C7 \u09B6\u09B8\u09CD\u09AF\u09C7\u09B0 \u09AA\u09B8\u09CD\u09A4\u09BF\u09B6\u09BF\u09B7\u09CD\u09A4\u09BF \u09A6\u09B0\u0995\u09BE\u09B0\u09A4\u09BE \u09A6\u09C7\u09A8\u09A4\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09A4\u09CD\u09A4\u09A4\u09BE \u09AC\u09C3\u09A6\u09CD\u09A7 \u0995\u09B0\u09C7\u0964', category: '\u09B8\u09BE\u09B0', confidence: 0.95 },
            { question: '\u09A4\u09B0\u09A4\u09C1\u09B7\u09C7\u09B0 \u09B6\u09B8\u09C7 \u0995\u09BF \u0995\u09B0\u09A4\u09C7 \u09B9\u09AF\u09BC?', answer: '\u09A4\u09B0\u09A4\u09C1\u09B6\u09C7\u09B0 \u09B6\u09B8\u09C7 \u09A8\u09BF\u09B0\u09CD\u09A7\u09BE\u09B0 \u09A6\u09C7\u09A8\u09A4\u09C7 \u09B0\u09A6\u099A \u09A4\u09C7\u09B2\u09C7 \u09AE\u09BE\u09B0\u09CD\u09A4 \u09B9\u09AC\u09C7\u0964 \u09A6\u09C7\u09B6\u09C7 \u09A4\u09B0\u09A4\u09C1\u09B6\u09C7\u09B0\u09B0\u09A4\u09BE \u0989\u09B2\u09CD\u09BB\u09A8\u09BF\u09B0 \u09A6\u09A8\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09B6\u09B8\u09CD\u09AF \u09B8\u09C0\u09B0\u09CD\u09B8', confidence: 0.85 },
            { question: '\u09B0\u09B8\u09C6\u09A8\u09B8 \u0995\u09C7 \u09A8\u09C0\u09B0\u09C7 \u09A6\u09B0\u0995\u09BE\u09B0\u09C7\u09A8?', answer: '\u09B0\u09B8\u09C6\u09A8\u09B8 \u09A8\u09BF\u09B0\u09CD\u09A6\u09B8\u09C7\u09B0 \u099A\u09CD\u09A4\u09C1\u09B0 \u09B0\u09A4\u09B8\u09CD\u09A5\u09BE\u09A8 \u09B8\u09A4\u09CD\u09A4 \u09AA\u09B0\u09BF\u09B7\u09C2\u09A4\u09BF \u09B8\u09C1\u09A8\u09A4\u09B0\u09CD\u09A4 \u0995\u09B0\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964 \u09B8\u09B8\u09CD\u09A4 \u09A4\u09B5\u09B0 \u099A\u09B2\u09A8\u09C7 \u09B9\u09B2\u09C7 \u09A4\u09A4\u09CD\u09A5\u09C7 \u09B8\u09BE\u09B0 \u09B0\u09B6\u09BF \u099A\u09B2\u09C7\u09A8\u09A4\u09C7 \u09B9\u09AC\u09C7\u0964', category: '\u09B8\u09A8\u09CD\u09A1\u09B0\u09CD\u09A8', confidence: 0.85 }
        ];
    }
};
