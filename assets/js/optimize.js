/**
 * SF AI V20 — Production Optimization Module
 * ES module for performance monitoring, caching, lazy loading, memory management
 * ক্যাশিং, লেজি লোডিং, মেমরি ব্যবস্থাপনা, নেটওয়ার্ক অপ্টিমাইজেশন
 */

const OPT_CACHE_KEY = 'sf_opt_cache';
const OPT_PERF_KEY = 'sf_opt_perf';
const OPT_VERSION = '20.0';
const MAX_CACHE_ITEMS = 200;
const DEFAULT_TTL = 30 * 60 * 1000;

function optGetStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function optSetStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch { /* quota */ }
}

function optToast(message, type) {
    const existing = document.querySelector('.sf-opt-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'sf-opt-toast ' + (type || 'success');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '24px', right: '24px', padding: '14px 24px',
        borderRadius: '10px', color: '#fff', fontWeight: 'bold',
        fontFamily: 'inherit', zIndex: '100001', animation: 'sfOptToastIn 0.3s ease',
        background: type === 'error' ? '#dc3545' : type === 'warning' ? '#f0ad4e' : '#28a745'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function optInjectStyles() {
    if (document.getElementById('sf-opt-styles')) return;
    const style = document.createElement('style');
    style.id = 'sf-opt-styles';
    style.textContent = `
        @keyframes sfOptToastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .sf-opt-panel { font-family: 'Hind Siliguri','Kalpurush',sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; background: linear-gradient(135deg,#f0fdf4,#dcfce7); border-radius: 16px; border: 2px solid #16a34a; }
        .sf-opt-title { text-align: center; font-size: 1.5em; color: #166534; margin-bottom: 20px; font-weight: bold; }
        .sf-opt-section { margin-bottom: 20px; padding: 16px; background: #fff; border-radius: 12px; border: 1px solid #e0e0e0; }
        .sf-opt-section h3 { margin: 0 0 12px; color: #166534; font-size: 1.05em; }
        .sf-opt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .sf-opt-btn { padding: 12px 16px; border: none; border-radius: 8px; font-size: 0.95em; font-weight: bold; font-family: inherit; cursor: pointer; transition: all 0.2s; }
        .sf-opt-btn:hover { transform: translateY(-2px); box-shadow: 0 3px 8px rgba(0,0,0,0.15); }
        .sf-opt-btn-primary { background: #16a34a; color: #fff; grid-column: 1/-1; }
        .sf-opt-btn-success { background: #198754; color: #fff; }
        .sf-opt-btn-outline { background: #fff; color: #16a34a; border: 2px solid #16a34a; }
        .sf-opt-btn-danger { background: #dc3545; color: #fff; }
        .sf-opt-btn-info { background: #0d6efd; color: #fff; }
        .sf-opt-stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .sf-opt-stat:last-child { border-bottom: none; }
        .sf-opt-stat-label { color: #666; }
        .sf-opt-stat-value { font-weight: bold; color: #333; }
        .sf-opt-bar { width: 100%; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; margin: 8px 0; }
        .sf-opt-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.75em; font-weight: bold; }
        .sf-opt-metric { padding: 10px; margin-bottom: 8px; border-radius: 8px; background: #f8f8f8; }
        .sf-opt-metric-name { font-weight: bold; color: #166534; }
        .sf-opt-metric-value { font-size: 1.2em; color: #333; }
        .sf-opt-table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
        .sf-opt-table th, .sf-opt-table td { padding: 8px 12px; border: 1px solid #ddd; text-align: left; }
        .sf-opt-table th { background: #16a34a; color: #fff; }
        .sf-opt-table tr:nth-child(even) { background: #f9f9f9; }
    `;
    document.head.appendChild(style);
}

function optMeasureStorageSize() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            const value = localStorage.getItem(key);
            total += (key.length + (value ? value.length : 0)) * 2;
        }
    }
    return total;
}

function optFormatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const SFOptimize = {
    _metrics: [],
    _observers: new Map(),
    _prefetches: new Set(),

    init() {
        optInjectStyles();
        this._loadMetrics();
        return this;
    },

    measurePerformance(name, fn) {
        const start = performance.now();
        let result;
        try {
            result = fn();
        } catch (err) {
            this._recordMetric(name, performance.now() - start, false, err.message);
            throw err;
        }
        const duration = performance.now() - start;
        this._recordMetric(name, duration, true);
        return result;
    },

    async measureAsyncPerformance(name, fn) {
        const start = performance.now();
        try {
            const result = await fn();
            this._recordMetric(name, performance.now() - start, true);
            return result;
        } catch (err) {
            this._recordMetric(name, performance.now() - start, false, err.message);
            throw err;
        }
    },

    _recordMetric(name, duration, success, error) {
        this._metrics.push({
            name, duration: parseFloat(duration.toFixed(2)),
            success, error: error || null,
            timestamp: Date.now()
        });
        if (this._metrics.length > 500) this._metrics.splice(0, 100);
        this._saveMetrics();
    },

    getPerformanceMetrics() {
        if (this._metrics.length === 0) return { count: 0, avgDuration: 0, successRate: 0 };
        const total = this._metrics.length;
        const successCount = this._metrics.filter(m => m.success).length;
        const avgDuration = this._metrics.reduce((a, b) => a + b.duration, 0) / total;
        const slowest = [...this._metrics].sort((a, b) => b.duration - a.duration).slice(0, 5);
        const fastest = [...this._metrics].sort((a, b) => a.duration - b.duration).slice(0, 5);
        return {
            count: total,
            avgDuration: avgDuration.toFixed(2),
            successRate: ((successCount / total) * 100).toFixed(1),
            slowest, fastest
        };
    },

    _saveMetrics() {
        optSetStorage(OPT_PERF_KEY, this._metrics);
    },

    _loadMetrics() {
        this._metrics = optGetStorage(OPT_PERF_KEY) || [];
    },

    lazyLoad(selector, callback) {
        const elements = document.querySelectorAll(selector);
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        callback(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '100px' });
            elements.forEach(el => observer.observe(el));
            this._observers.set(selector, observer);
        } else {
            elements.forEach(el => callback(el));
        }
    },

    lazyLoadImages() {
        this.lazyLoad('img[data-src]', (img) => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.add('sf-opt-loaded');
            }
        });
        this.lazyLoad('img[data-lazy]', (img) => {
            if (img.dataset.lazy) {
                img.src = img.dataset.lazy;
                img.removeAttribute('data-lazy');
                img.classList.add('sf-opt-loaded');
            }
        });
    },

    cache(key, data, ttl) {
        const cache = optGetStorage(OPT_CACHE_KEY) || {};
        const effectiveTTL = ttl || DEFAULT_TTL;
        cache[key] = {
            data, ttl: effectiveTTL,
            timestamp: Date.now(),
            expires: Date.now() + effectiveTTL
        };
        const keys = Object.keys(cache);
        if (keys.length > MAX_CACHE_ITEMS) {
            const sorted = keys.sort((a, b) => (cache[a].timestamp || 0) - (cache[b].timestamp || 0));
            const removeCount = Math.ceil(MAX_CACHE_ITEMS * 0.2);
            for (let i = 0; i < removeCount; i++) {
                delete cache[sorted[i]];
            }
        }
        optSetStorage(OPT_CACHE_KEY, cache);
    },

    getCached(key) {
        const cache = optGetStorage(OPT_CACHE_KEY) || {};
        const entry = cache[key];
        if (!entry) return null;
        if (Date.now() > entry.expires) {
            delete cache[key];
            optSetStorage(OPT_CACHE_KEY, cache);
            return null;
        }
        return entry.data;
    },

    clearCache() {
        optSetStorage(OPT_CACHE_KEY, {});
        optToast('সমস্ত ক্যাশে পরিষ্কার হয়েছে', 'success');
    },

    getCacheSize() {
        const cache = optGetStorage(OPT_CACHE_KEY) || {};
        const entries = Object.keys(cache).length;
        const size = new Blob([JSON.stringify(cache)]).size;
        return { entries, size, sizeFormatted: optFormatBytes(size) };
    },

    debounce(fn, delay) {
        let timeoutId;
        const debounced = function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
        debounced.cancel = () => clearTimeout(timeoutId);
        return debounced;
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

    optimizeImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve, reject) => {
            if (!file || !(file instanceof File)) {
                reject(new Error('বৈধ ফাইল দেওয়া হয়নি'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width;
                    let h = img.height;
                    if (w > maxWidth) {
                        h = (maxWidth / w) * h;
                        w = maxWidth;
                    }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob(
                        (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })),
                        'image/jpeg', quality
                    );
                };
                img.onerror = () => reject(new Error('ছবি লোড করতে ব্যর্থ'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ'));
            reader.readAsDataURL(file);
        });
    },

    resizeImage(file, maxWidth = 800, maxHeight = 600) {
        return new Promise((resolve, reject) => {
            if (!file || !(file instanceof File)) {
                reject(new Error('বৈধ ফাইল প্রয়োজন'));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width;
                    let h = img.height;
                    if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
                    if (h > maxHeight) { w = (maxHeight / h) * w; h = maxHeight; }
                    canvas.width = Math.round(w);
                    canvas.height = Math.round(h);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(
                        (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })),
                        'image/jpeg', 0.85
                    );
                };
                img.onerror = () => reject(new Error('ছবি প্রক্রিয়াকরণে ত্রুটি'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ'));
            reader.readAsDataURL(file);
        });
    },

    compressImage(file, quality = 0.7) {
        return this.optimizeImage(file, 1200, quality);
    },

    checkMemory() {
        if (performance && performance.memory) {
            return {
                usedJSHeapSize: optFormatBytes(performance.memory.usedJSHeapSize),
                totalJSHeapSize: optFormatBytes(performance.memory.totalJSHeapSize),
                jsHeapSizeLimit: optFormatBytes(performance.memory.jsHeapSizeLimit),
                percentage: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(1)
            };
        }
        return { usedJSHeapSize: 'অজ্ঞাত', totalJSHeapSize: 'অজ্ঞাত', jsHeapSizeLimit: 'অজ্ঞাত', percentage: 'N/A' };
    },

    cleanupMemory() {
        if ('gc' in window) {
            try { window.gc(); } catch { /* */ }
        }
        document.querySelectorAll('img.sf-opt-unloaded').forEach(img => img.remove());
        this.cleanupOldStorage(30);
        optToast('মেমরি পরিষ্কার করা হয়েছে', 'success');
    },

    getMemoryUsage() {
        const cacheInfo = this.getCacheSize();
        const storageInfo = { totalSize: optFormatBytes(optMeasureStorageSize()) };
        const perf = this.checkMemory();
        return { cache: cacheInfo, storage: storageInfo, memory: perf };
    },

    prefetch(url) {
        if (this._prefetches.has(url)) return;
        this._prefetches.add(url);
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    },

    preloadCritical() {
        const critical = [
            { href: 'assets/css/style.css', as: 'style' },
            { href: 'assets/js/config.js', as: 'script' },
            { href: 'assets/js/firebase.js', as: 'script' }
        ];
        critical.forEach(res => {
            if (!document.querySelector(`link[href="${res.href}"]`)) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = res.href;
                link.as = res.as;
                document.head.appendChild(link);
            }
        });
    },

    getNetworkStatus() {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (conn) {
            return {
                effectiveType: conn.effectiveType || 'unknown',
                downlink: conn.downlink || 'unknown',
                rtt: conn.rtt || 'unknown',
                saveData: conn.saveData || false,
                online: navigator.onLine
            };
        }
        return { effectiveType: 'unknown', online: navigator.onLine };
    },

    optimizeStorage() {
        const keysToCheck = ['sf_cache_', 'sf_opt_', 'sf_tmp_', 'sf_draft_'];
        let cleaned = 0;
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (!key) continue;
            for (const prefix of keysToCheck) {
                if (key.startsWith(prefix) && key !== OPT_CACHE_KEY && key !== OPT_PERF_KEY) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data && data.expires && Date.now() > data.expires) {
                            localStorage.removeItem(key);
                            cleaned++;
                        }
                    } catch { /* */ }
                }
            }
        }
        optToast(`${cleaned}টি পুরানো এন্ট্রি মুছে ফেলা হয়েছে`, 'success');
        return cleaned;
    },

    getStorageUsage() {
        const total = optMeasureStorageSize();
        const breakdown = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                const prefix = key.split('_').slice(0, 2).join('_');
                const value = localStorage.getItem(key);
                const size = (key.length + (value ? value.length : 0)) * 2;
                breakdown[prefix] = (breakdown[prefix] || 0) + size;
            }
        }
        const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
        return {
            total, totalFormatted: optFormatBytes(total),
            breakdown: sorted.slice(0, 10).map(([k, v]) => ({ prefix: k, size: v, formatted: optFormatBytes(v) }))
        };
    },

    cleanupOldStorage(days = 30) {
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
        let cleaned = 0;
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (!key) continue;
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && typeof data === 'object') {
                    const ts = data.timestamp || data.createdAt || data.cachedAt;
                    if (ts && new Date(ts).getTime() < cutoff) {
                        localStorage.removeItem(key);
                        cleaned++;
                    }
                }
            } catch { /* */ }
        }
        return cleaned;
    },

    analyzeModules() {
        const scripts = performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script');
        return scripts.map(s => ({
            name: s.name.split('/').pop(),
            duration: s.duration.toFixed(2),
            size: s.transferSize ? optFormatBytes(s.transferSize) : 'অজ্ঞাত',
            type: 'script'
        }));
    },

    getModuleSize() {
        const scripts = performance.getEntriesByType('resource').filter(r => r.initiatorType === 'script');
        let totalTransfer = 0;
        scripts.forEach(s => { totalTransfer += s.transferSize || 0; });
        return {
            count: scripts.length,
            totalTransfer,
            totalFormatted: optFormatBytes(totalTransfer),
            modules: this.analyzeModules()
        };
    },

    createPerformanceDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const metrics = this.getPerformanceMetrics();
        const mem = this.checkMemory();
        const net = this.getNetworkStatus();

        container.innerHTML = `
            <div class="sf-opt-panel">
                <div class="sf-opt-title">পারফরম্যান্স ড্যাশবোর্ড (V20)</div>

                <div class="sf-opt-section">
                    <h3>পারফরম্যান্স মেট্রিক্স</h3>
                    <div class="sf-opt-metric">
                        <div class="sf-opt-metric-name">মোট মাপার সংখ্যা</div>
                        <div class="sf-opt-metric-value">${metrics.count}</div>
                    </div>
                    <div class="sf-opt-metric">
                        <div class="sf-opt-metric-name">গড় সময়কাল</div>
                        <div class="sf-opt-metric-value">${metrics.avgDuration}ms</div>
                    </div>
                    <div class="sf-opt-metric">
                        <div class="sf-opt-metric-name">সফলতার হার</div>
                        <div class="sf-opt-metric-value">${metrics.successRate}%</div>
                        <div class="sf-opt-bar"><div class="sf-opt-bar-fill" style="width:${metrics.successRate}%;background:${parseFloat(metrics.successRate) > 90 ? '#16a34a' : parseFloat(metrics.successRate) > 70 ? '#f59e0b' : '#dc3545'}">${metrics.successRate}%</div></div>
                    </div>
                    ${metrics.slowest && metrics.slowest.length > 0 ? `
                    <h4 style="margin:12px 0 8px;color:#166534">ধীরতম অপারেশন:</h4>
                    ${metrics.slowest.map(m => `
                        <div class="sf-opt-stat">
                            <span class="sf-opt-stat-label">${m.name}</span>
                            <span class="sf-opt-stat-value">${m.duration}ms</span>
                        </div>
                    `).join('')}
                    ` : ''}
                </div>

                <div class="sf-opt-section">
                    <h3>মেমরি ও নেটওয়ার্ক</h3>
                    <div class="sf-opt-stat">
                        <span class="sf-opt-stat-label">JS হিপ ব্যবহার:</span>
                        <span class="sf-opt-stat-value">${mem.usedJSHeapSize}</span>
                    </div>
                    <div class="sf-opt-stat">
                        <span class="sf-opt-stat-label">সংযোগ:</span>
                        <span class="sf-opt-stat-value">${net.online ? 'অনলাইন' : 'অফলাইন'} (${net.effectiveType})</span>
                    </div>
                    <div class="sf-opt-bar"><div class="sf-opt-bar-fill" style="width:${mem.percentage || 0}%;background:#0d6efd">${mem.percentage || 0}%</div></div>
                </div>

                <div class="sf-opt-section">
                    <h3>পরিচালনা</h3>
                    <div class="sf-opt-grid">
                        <button class="sf-opt-btn sf-opt-btn-primary" id="sf-opt-refresh">রিফ্রেশ মেট্রিক্স</button>
                        <button class="sf-opt-btn sf-opt-btn-success" id="sf-opt-cleanup">মেমরি পরিষ্কার</button>
                        <button class="sf-opt-btn sf-opt-btn-outline" id="sf-opt-preload">ক্রিটিকাল প্রিলোড</button>
                    </div>
                </div>
            </div>
        `;

        const self = this;
        document.getElementById('sf-opt-refresh').addEventListener('click', function () {
            self.createPerformanceDashboard(containerId);
            optToast('মেট্রিক্স রিফ্রেশ হয়েছে', 'success');
        });

        document.getElementById('sf-opt-cleanup').addEventListener('click', function () {
            self.cleanupMemory();
            self.createPerformanceDashboard(containerId);
        });

        document.getElementById('sf-opt-preload').addEventListener('click', function () {
            self.preloadCritical();
            optToast('ক্রিটিকাল রিসোর্স প্রিলোড শুরু হয়েছে', 'success');
        });

        return { destroy() { container.innerHTML = ''; } };
    },

    createCacheManager(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const cacheInfo = this.getCacheSize();
        const storageInfo = this.getStorageUsage();

        container.innerHTML = `
            <div class="sf-opt-panel">
                <div class="sf-opt-title">ক্যাশে ব্যবস্থাপক (V20)</div>

                <div class="sf-opt-section">
                    <h3>ক্যাশে তথ্য</h3>
                    <div class="sf-opt-stat">
                        <span class="sf-opt-stat-label">মোট এন্ট্রি:</span>
                        <span class="sf-opt-stat-value">${cacheInfo.entries}</span>
                    </div>
                    <div class="sf-opt-stat">
                        <span class="sf-opt-stat-label">আকার:</span>
                        <span class="sf-opt-stat-value">${cacheInfo.sizeFormatted}</span>
                    </div>
                </div>

                <div class="sf-opt-section">
                    <h3>স্টোরেজ ব্যবহার</h3>
                    <div class="sf-opt-stat">
                        <span class="sf-opt-stat-label">মোট স্টোরেজ:</span>
                        <span class="sf-opt-stat-value">${storageInfo.totalFormatted}</span>
                    </div>
                    ${storageInfo.breakdown.map(b => `
                        <div class="sf-opt-stat">
                            <span class="sf-opt-stat-label">${b.prefix}:</span>
                            <span class="sf-opt-stat-value">${b.formatted}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="sf-opt-section">
                    <h3>ক্যাশে পরিচালনা</h3>
                    <div class="sf-opt-grid">
                        <button class="sf-opt-btn sf-opt-btn-danger" id="sf-cache-clear" style="grid-column:1/-1">সমস্ত ক্যাশে মুছুন</button>
                        <button class="sf-opt-btn sf-opt-btn-outline" id="sf-cache-optimize">অপ্টিমাইজ স্টোরেজ</button>
                        <button class="sf-opt-btn sf-opt-btn-outline" id="sf-cache-old">পুরানো ডেটা মুছুন (৩০ দিন)</button>
                    </div>
                </div>
            </div>
        `;

        const self = this;
        document.getElementById('sf-cache-clear').addEventListener('click', function () {
            if (confirm('সমস্ত ক্যাশে মুছে ফেলতে চান?')) {
                self.clearCache();
                self.createCacheManager(containerId);
            }
        });

        document.getElementById('sf-cache-optimize').addEventListener('click', function () {
            const cleaned = self.optimizeStorage();
            self.createCacheManager(containerId);
        });

        document.getElementById('sf-cache-old').addEventListener('click', function () {
            const cleaned = self.cleanupOldStorage(30);
            optToast(`${cleaned}টি পুরানো ডেটা মুছে ফেলা হয়েছে`, 'success');
            self.createCacheManager(containerId);
        });

        return { destroy() { container.innerHTML = ''; } };
    }
};
