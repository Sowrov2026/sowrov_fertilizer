export const SFOffline = {
    _queue: [],
    _offlineData: {},
    _bannerElement: null,
    _indicatorElement: null,
    _cachedResponses: [],
    _maxCacheSize: 50,
    _maxQueueSize: 20,
    _bannerTimeout: null,

    init() {
        this._loadPersistedData();
        this._bindEvents();
        if (!navigator.onLine) {
            this._applyOfflineState();
        }
    },

    isOnline() {
        return navigator.onLine;
    },

    getStatus() {
        return {
            online: navigator.onLine,
            queuedRequests: this._queue.length,
            cachedResponses: this._cachedResponses.length,
            offlineTopics: Object.keys(this._offlineData),
        };
    },

    queueRequest(request) {
        if (!request || typeof request !== 'object') return false;
        if (this._queue.length >= this._maxQueueSize) {
            this._queue.shift();
        }
        const entry = {
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            url: request.url || '',
            method: request.method || 'GET',
            headers: request.headers || {},
            body: request.body || null,
            timestamp: Date.now(),
            retries: 0,
            maxRetries: request.maxRetries || 3,
        };
        this._queue.push(entry);
        this._persistQueue();
        return entry.id;
    },

    async processQueue() {
        if (!navigator.onLine || this._queue.length === 0) return;
        const failed = [];
        while (this._queue.length > 0) {
            const req = this._queue.shift();
            try {
                const options = {
                    method: req.method,
                    headers: { ...req.headers, 'Content-Type': 'application/json' },
                };
                if (req.body && req.method !== 'GET') {
                    options.body = JSON.stringify(req.body);
                }
                const response = await fetch(req.url, options);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
            } catch (err) {
                req.retries++;
                if (req.retries < req.maxRetries) {
                    failed.push(req);
                }
            }
        }
        this._queue = failed;
        this._persistQueue();
        if (this._queue.length === 0 && !navigator.onLine) {
            this._applyOfflineState();
        }
    },

    getOfflineData(topic) {
        if (!topic) return null;
        const key = topic.toLowerCase().trim();
        if (this._offlineData[key]) return { ...this._offlineData[key] };
        for (const t of Object.keys(this._offlineData)) {
            if (key.includes(t) || t.includes(key)) {
                return { ...this._offlineData[t] };
            }
        }
        return this._offlineData['general'] ? { ...this._offlineData['general'] } : null;
    },

    saveOfflineData(topic, data) {
        if (!topic || !data) return false;
        const key = topic.toLowerCase().trim();
        this._offlineData[key] = {
            ...data,
            savedAt: Date.now(),
        };
        this._persistOfflineData();
        return true;
    },

    showOfflineBanner() {
        if (this._bannerElement) return;
        const banner = document.createElement('div');
        banner.id = 'sf-offline-banner';
        banner.setAttribute('role', 'alert');
        banner.setAttribute('aria-live', 'assertive');
        banner.style.cssText = [
            'position:fixed',
            'top:0',
            'left:0',
            'right:0',
            'z-index:99999',
            'background:linear-gradient(135deg,#dc3545,#c82333)',
            'color:#fff',
            'text-align:center',
            'padding:10px 16px',
            'font-size:14px',
            'font-family:sans-serif',
            'box-shadow:0 2px 8px rgba(0,0,0,0.25)',
            'transform:translateY(-100%)',
            'transition:transform 0.3s ease',
        ].join(';');
        banner.innerHTML = '<strong>ইন্টারনেট সংযোগ নেই।</strong> অফলাইন মোডে কাজ করছে।';
        document.body.appendChild(banner);
        this._bannerElement = banner;
        requestAnimationFrame(() => {
            banner.style.transform = 'translateY(0)';
        });
    },

    hideOfflineBanner() {
        if (!this._bannerElement) return;
        const banner = this._bannerElement;
        banner.style.transform = 'translateY(-100%)';
        this._bannerTimeout = setTimeout(() => {
            banner.remove();
            this._bannerElement = null;
        }, 350);
    },

    showReconnectToast() {
        const existing = document.getElementById('sf-reconnect-toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = 'sf-reconnect-toast';
        toast.setAttribute('role', 'status');
        toast.style.cssText = [
            'position:fixed',
            'bottom:24px',
            'right:24px',
            'z-index:99999',
            'background:#28a745',
            'color:#fff',
            'padding:12px 20px',
            'border-radius:8px',
            'font-size:14px',
            'font-family:sans-serif',
            'box-shadow:0 4px 12px rgba(0,0,0,0.3)',
            'opacity:0',
            'transition:opacity 0.3s ease',
        ].join(';');
        toast.textContent = 'ইন্টারনেট সংযোগ ফিরে এসেছে।';
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 350);
        }, 3000);
    },

    createOfflineIndicator(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        if (this._indicatorElement) this._indicatorElement.remove();
        const indicator = document.createElement('div');
        indicator.id = 'sf-offline-indicator';
        indicator.style.cssText = [
            'display:inline-flex',
            'align-items:center',
            'gap:6px',
            'padding:4px 10px',
            'border-radius:12px',
            'font-size:12px',
            'font-family:sans-serif',
            'font-weight:600',
            'transition:background 0.3s, color 0.3s',
        ].join(';');
        const dot = document.createElement('span');
        dot.style.cssText = 'width:8px;height:8px;border-radius:50%;transition:background 0.3s;';
        const label = document.createElement('span');
        indicator.appendChild(dot);
        indicator.appendChild(label);
        container.appendChild(indicator);
        this._indicatorElement = indicator;
        this._updateIndicatorState(dot, label);
        return indicator;
    },

    getCachedResponses() {
        return this._cachedResponses.map((r) => ({ ...r }));
    },

    cacheChatResponse(query, response) {
        if (!query || !response) return false;
        const entry = {
            query: String(query).trim(),
            response: typeof response === 'string' ? response : JSON.stringify(response),
            timestamp: Date.now(),
        };
        this._cachedResponses.push(entry);
        if (this._cachedResponses.length > this._maxCacheSize) {
            this._cachedResponses.splice(0, this._cachedResponses.length - this._maxCacheSize);
        }
        this._persistCachedResponses();
        return true;
    },

    queueMessage(message) {
        if (!message || typeof message !== 'object') return false;
        const entry = {
            id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            text: message.text || message.content || '',
            sender: message.sender || 'user',
            timestamp: Date.now(),
            retries: 0,
        };
        this._queue.push({
            id: entry.id,
            url: message.url || '/api/chat',
            method: 'POST',
            headers: {},
            body: { message: entry.text, sender: entry.sender },
            timestamp: entry.timestamp,
            retries: 0,
            maxRetries: 3,
            _messageEntry: entry,
        });
        this._persistQueue();
        return entry.id;
    },

    _bindEvents() {
        window.addEventListener('online', () => {
            this.hideOfflineBanner();
            this.showReconnectToast();
            this._updateIndicatorOnline();
            this.processQueue();
        });
        window.addEventListener('offline', () => {
            this._applyOfflineState();
        });
    },

    _applyOfflineState() {
        this.showOfflineBanner();
        this._updateIndicatorOffline();
    },

    _updateIndicatorOnline() {
        if (!this._indicatorElement) return;
        const dot = this._indicatorElement.querySelector('span:first-child');
        const label = this._indicatorElement.querySelector('span:last-child');
        this._updateIndicatorState(dot, label);
    },

    _updateIndicatorOffline() {
        if (!this._indicatorElement) return;
        const dot = this._indicatorElement.querySelector('span:first-child');
        const label = this._indicatorElement.querySelector('span:last-child');
        this._updateIndicatorState(dot, label);
    },

    _updateIndicatorState(dot, label) {
        if (!dot || !label) return;
        if (navigator.onLine) {
            dot.style.background = '#28a745';
            this._indicatorElement.style.background = '#d4edda';
            this._indicatorElement.style.color = '#155724';
            label.textContent = 'অনলাইন';
        } else {
            dot.style.background = '#dc3545';
            this._indicatorElement.style.background = '#f8d7da';
            this._indicatorElement.style.color = '#721c24';
            label.textContent = 'অফলাইন';
        }
    },

    _loadPersistedData() {
        try {
            const queue = localStorage.getItem('sf_offline_queue');
            if (queue) this._queue = JSON.parse(queue);
        } catch (e) { /* ignore */ }
        try {
            const cache = localStorage.getItem('sf_offline_cache');
            if (cache) this._cachedResponses = JSON.parse(cache);
        } catch (e) { /* ignore */ }
        try {
            const offline = localStorage.getItem('sf_offline_data');
            if (offline) this._offlineData = JSON.parse(offline);
        } catch (e) { /* ignore */ }
        if (Object.keys(this._offlineData).length === 0) {
            this._offlineData = { ...OFFLINE_DATA };
        }
    },

    _persistQueue() {
        try {
            localStorage.setItem('sf_offline_queue', JSON.stringify(this._queue));
        } catch (e) { /* storage full or unavailable */ }
    },

    _persistCachedResponses() {
        try {
            localStorage.setItem('sf_offline_cache', JSON.stringify(this._cachedResponses));
        } catch (e) { /* storage full or unavailable */ }
    },

    _persistOfflineData() {
        try {
            localStorage.setItem('sf_offline_data', JSON.stringify(this._offlineData));
        } catch (e) { /* storage full or unavailable */ }
    },
};

const OFFLINE_DATA = {
    general: {
        title: 'সাধারণ তথ্য',
        content: 'অফলাইন মোডে সীমিত তথ্য উপলব্ধ। ইন্টারনেট সংযোগ ফিরে এলে সম্পূর্ণ তথ্য পাওয়া যাবে।',
    },
    fertilizer: {
        title: 'সার ব্যবহার',
        content: 'ফসলের জন্য প্রয়োজনীয় সার: ইউরিয়া (N), টিএসপি (P), এমওপি (K)। মাটির পরীক্ষার রিপোর্ট অনুযায়ী সার ব্যবহার করুন। প্রতি কেজি ফসলের জন্য গড়ে ২-৪ কেজি সার প্রয়োজন।',
    },
    disease: {
        title: 'প্রধান রোগ',
        content: 'ধানের ব্লাস্ট, ব্যাকটেরিয়াল ব্লাইট, শিথ ব্লাইট। আমনের বৃজ্রানীল, পাতামোড়া। প্রতিরোধমূলক বীজ শোধন এবং পর্যায়ক্রমে ছত্রাকনাশক ব্যবহার করুন।',
    },
    weather: {
        title: 'আবহাওয়া',
        content: 'বর্তমানে অফলাইন মোডে আবহাওয়ার তথ্য আপডেট হচ্ছে না। সর্বশেষ তথ্য দেখতে অনলাইনে যুক্ত হোন।',
    },
    seed: {
        title: 'বীজ',
        content: 'বীজ নির্বাচনে মাটির ধরন ও আবহাওয়া বিবেচনা করুন। ভালো মানের সনদপ্রাপ্ত বীজ ব্যবহার করুন। বীজের হার: ধান ২০-২৫ কেজি/একর।',
    },
};
