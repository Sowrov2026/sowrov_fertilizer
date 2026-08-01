export const SFErrorHandler = {
    _errors: [],
    _maxLogSize: 500,
    _retryDelay: 1000,

    init() {
        this.setupGlobalHandlers();
        return this;
    },

    async safeAsync(fn, fallback = null) {
        try {
            return await fn();
        } catch (error) {
            this.logError(error, { type: 'safeAsync' });
            if (typeof fallback === 'function') {
                return fallback(error);
            }
            return fallback;
        }
    },

    safeSync(fn, fallback = null) {
        try {
            return fn();
        } catch (error) {
            this.logError(error, { type: 'safeSync' });
            if (typeof fallback === 'function') {
                return fallback(error);
            }
            return fallback;
        }
    },

    logError(error, context = {}) {
        const entry = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            timestamp: new Date().toISOString(),
            message: error?.message || String(error),
            name: error?.name || 'Error',
            context,
            handled: true,
        };

        this._errors.unshift(entry);

        if (this._errors.length > this._maxLogSize) {
            this._errors.length = this._maxLogSize;
        }

        if (typeof console !== 'undefined' && console.error) {
            console.error(`[SF Error] ${entry.message}`, context);
        }

        return entry;
    },

    getErrors(limit = 50) {
        return this._errors.slice(0, limit);
    },

    getErrorStats() {
        const stats = {
            total: this._errors.length,
            byContext: {},
            byTime: { lastHour: 0, lastDay: 0 },
            recent: this._errors.slice(0, 10),
        };

        const now = Date.now();
        const hourAgo = now - 3600000;
        const dayAgo = now - 86400000;

        for (const err of this._errors) {
            const ctx = err.context?.type || 'unknown';
            stats.byContext[ctx] = (stats.byContext[ctx] || 0) + 1;

            const ts = new Date(err.timestamp).getTime();
            if (ts > hourAgo) stats.byTime.lastHour++;
            if (ts > dayAgo) stats.byTime.lastDay++;
        }

        return stats;
    },

    clearErrors() {
        const count = this._errors.length;
        this._errors = [];
        return count;
    },

    async retryRequest(url, options = {}, maxRetries = 3) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(url, options);

                if (response.ok) {
                    return response;
                }

                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
                lastError.status = response.status;
                lastError.response = response;

                if (response.status === 429) {
                    const retryAfter = response.headers?.get('Retry-After');
                    const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : this._retryDelay * attempt;
                    await this._wait(delay);
                    continue;
                }

                if (response.status >= 500 && attempt < maxRetries) {
                    await this._wait(this._retryDelay * attempt);
                    continue;
                }

                throw lastError;
            } catch (error) {
                lastError = error;

                if (error.name === 'AbortError') {
                    throw error;
                }

                if (attempt < maxRetries) {
                    await this._wait(this._retryDelay * attempt);
                    continue;
                }
            }
        }

        this.logError(lastError, { type: 'retryRequest', url, attempts: maxRetries });
        throw lastError;
    },

    getUserMessage(error) {
        if (!error) {
            return 'কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
        }

        const status = error.status || error?.response?.status;

        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে সংযোগ পুনরুদ্ধার করুন।';
        }

        if (!navigator.onLine) {
            return 'ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে সংযোগ পুনরুদ্ধার করুন।';
        }

        if (status === 429) {
            return 'অনেক বেশি অনুরোধ। কিছুক্ষণ অপেক্ষা করুন।';
        }

        if (status >= 500) {
            return 'সার্ভার সমস্যা। কিছুক্ষণ পর আবার চেষ্টা করুন।';
        }

        if (status === 400 || status === 422) {
            return 'তথ্য সঠিক নয়। অনুগ্রহ করে আবার দেখুন।';
        }

        if (status === 401 || status === 403) {
            return 'অনুমতি নেই। অনুগ্রহ করে আবার লগইন করুন।';
        }

        if (status === 404) {
            return 'তথ্য পাওয়া যায়নি।';
        }

        return 'কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    },

    showErrorToast(message, duration = 5000) {
        const existing = document.querySelector('.sf-error-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'sf-error-toast';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');

        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#dc2626',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            zIndex: '99999',
            maxWidth: '90vw',
            textAlign: 'center',
            opacity: '0',
            transition: 'opacity 0.3s ease',
        });

        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        const dismiss = () => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        };

        setTimeout(dismiss, duration);
        toast.addEventListener('click', dismiss, { once: true });
    },

    showChatError(message) {
        const chatContainer = document.querySelector('.chat-messages, .chat-container, #chat-messages');
        if (!chatContainer) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'chat-message chat-error';

        Object.assign(errorDiv.style, {
            padding: '10px 16px',
            margin: '8px 0',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '14px',
        });

        errorDiv.textContent = message;
        chatContainer.appendChild(errorDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    },

    setupGlobalHandlers() {
        if (typeof window === 'undefined') return;

        window.addEventListener('error', (event) => {
            this.logError(event.error || new Error(event.message), {
                type: 'global',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason instanceof Error
                ? event.reason
                : new Error(String(event.reason));

            this.logError(error, { type: 'unhandledRejection' });
        });
    },

    handleNetworkError(error) {
        this.logError(error, { type: 'network' });
        const message = 'ইন্টারনেট সংযোগ নেই। অনুগ্রহ করে সংযোগ পুনরুদ্ধার করুন।';
        this.showErrorToast(message);
        this.showChatError(message);
        return message;
    },

    handleAPIError(error) {
        this.logError(error, { type: 'api' });

        if (error?.status === 429) {
            const message = 'অনেক বেশি অনুরোধ। কিছুক্ষণ অপেক্ষা করুন।';
            this.showErrorToast(message);
            return message;
        }

        const message = 'সার্ভার সমস্যা। কিছুক্ষণ পর আবার চেষ্টা করুন।';
        this.showErrorToast(message);
        return message;
    },

    handleValidationError(error) {
        this.logError(error, { type: 'validation' });
        const message = 'তথ্য সঠিক নয়। অনুগ্রহ করে আবার দেখুন।';
        this.showErrorToast(message);
        return message;
    },

    exportErrorLog() {
        const data = {
            exported: new Date().toISOString(),
            userAgent: navigator?.userAgent || 'unknown',
            errors: this._errors,
            stats: this.getErrorStats(),
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `sf-error-log-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    },

    _wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
};
