const STORAGE_KEY = 'sf_push_settings';
const SUBSCRIPTION_KEY = 'sf_push_subscription';
const SCHEDULED_KEY = 'sf_push_scheduled';

const DEFAULT_SETTINGS = {
    enabled: true,
    fertilizer: true,
    irrigation: true,
    harvest: true,
    spray: true,
    weather: true,
    disease: true,
    offers: false,
    orders: true,
    price: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00',
};

const NOTIFICATION_TYPES = {
    fertilizer_reminder: { title: 'সার দেওয়ার রিমাইন্ডার', key: 'fertilizer' },
    irrigation_reminder: { title: 'সেচ দেওয়ার রিমাইন্ডার', key: 'irrigation' },
    harvest_reminder: { title: 'ফসল তোলার রিমাইন্ডার', key: 'harvest' },
    spray_reminder: { title: 'স্প্রে করার রিমাইন্ডার', key: 'spray' },
    weather_alert: { title: 'আবহাওয়া সতর্কতা', key: 'weather' },
    disease_alert: { title: 'রোগ সতর্কতা', key: 'disease' },
    product_offer: { title: 'পণ্য অফার', key: 'offers' },
    order_update: { title: 'অর্ডার আপডেট', key: 'orders' },
    price_alert: { title: 'মূল্য পরিবর্তন', key: 'price' },
};

function loadSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadScheduled() {
    try {
        const raw = localStorage.getItem(SCHEDULED_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveScheduled(list) {
    localStorage.setItem(SCHEDULED_KEY, JSON.stringify(list));
}

function isQuietHours(settings) {
    if (!settings.quietHoursStart || !settings.quietHoursEnd) return false;
    const now = new Date();
    const [sh, sm] = settings.quietHoursStart.split(':').map(Number);
    const [eh, em] = settings.quietHoursEnd.split(':').map(Number);
    const current = now.getHours() * 60 + now.getMinutes();
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (start > end) {
        return current >= start || current < end;
    }
    return current >= start && current < end;
}

export const SFPush = {
    async init() {
        this._settings = loadSettings();
        this._scheduledTimers = {};
        this._restoreScheduled();
        return this;
    },

    isSupported() {
        return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    },

    isGranted() {
        return this.isSupported() && Notification.permission === 'granted';
    },

    async requestPermission() {
        if (!this.isSupported()) {
            console.warn('SFPush: ব্রাউজার পুশ নোটিফিকেশন সমর্থন করে না');
            return false;
        }
        const result = await Notification.requestPermission();
        return result === 'granted';
    },

    async subscribe() {
        if (!this.isGranted()) {
            const granted = await this.requestPermission();
            if (!granted) return null;
        }
        try {
            const reg = await navigator.serviceWorker.ready;
            let subscription = await reg.pushManager.getSubscription();
            if (!subscription) {
                const vapidKey = await this._getVapidKey();
                subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: vapidKey,
                });
            }
            localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
            return subscription;
        } catch (err) {
            console.error('SFPush: সাবস্ক্রিপশন ত্রুটি', err);
            return null;
        }
    },

    async unsubscribe() {
        try {
            const reg = await navigator.serviceWorker.ready;
            const subscription = await reg.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
            }
            localStorage.removeItem(SUBSCRIPTION_KEY);
            return true;
        } catch (err) {
            console.error('SFPush: আনসাবস্ক্রিপশন ত্রুটি', err);
            return false;
        }
    },

    isSubscribed() {
        return localStorage.getItem(SUBSCRIPTION_KEY) !== null;
    },

    sendNotification(title, options = {}) {
        if (!this.isGranted()) return null;
        if (!this._settings.enabled) return null;
        if (isQuietHours(this._settings)) return null;

        const type = options.type || null;
        if (type && NOTIFICATION_TYPES[type]) {
            const key = NOTIFICATION_TYPES[type].key;
            if (!this._settings[key]) return null;
        }

        const notifOptions = {
            body: options.body || '',
            icon: options.icon || '/assets/images/icon-192.png',
            badge: options.badge || '/assets/images/badge-72.png',
            tag: options.tag || 'sf-default',
            data: options.data || {},
            ...options,
        };

        try {
            return new Notification(title, notifOptions);
        } catch (err) {
            console.error('SFPush: নোটিফিকেশন পাঠাতে ব্যর্থ', err);
            return null;
        }
    },

    scheduleNotification(title, body, delay, type = null) {
        const id = 'sf_notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        const scheduledAt = Date.now() + delay;

        const entry = { id, title, body, type, scheduledAt };
        const list = loadScheduled();
        list.push(entry);
        saveScheduled(list);

        this._scheduleTimer(entry);
        return id;
    },

    cancelNotification(id) {
        if (this._scheduledTimers[id]) {
            clearTimeout(this._scheduledTimers[id]);
            delete this._scheduledTimers[id];
        }
        const list = loadScheduled().filter((e) => e.id !== id);
        saveScheduled(list);
    },

    getSettings() {
        return { ...this._settings };
    },

    updateSettings(newSettings) {
        this._settings = { ...this._settings, ...newSettings };
        saveSettings(this._settings);
        return this._settings;
    },

    createNotificationSettings(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('SFPush: কন্টেইনার পাওয়া যায়নি:', containerId);
            return;
        }

        const settings = this.getSettings();

        container.innerHTML = `
            <div class="sf-push-settings">
                <h3>নোটিফিকেশন সেটিংস</h3>

                <div class="sf-push-toggle-row">
                    <label class="sf-push-label">সকল নোটিফিকেশন</label>
                    <label class="sf-push-switch">
                        <input type="checkbox" data-sf-push="enabled" ${settings.enabled ? 'checked' : ''}>
                        <span class="sf-push-slider"></span>
                    </label>
                </div>

                <div class="sf-push-types" style="${settings.enabled ? '' : 'opacity:0.4;pointer-events:none'}">
                    <div class="sf-push-toggle-row">
                        <label class="sf-push-label">সার দেওয়ার রিমাইন্ডার</label>
                        <label class="sf-push-switch">
                            <input type="checkbox" data-sf-push="fertilizer" ${settings.fertilizer ? 'checked' : ''}>
                            <span class="sf-push-slider"></span>
                        </label>
                    </div>
                    <div class="sf-push-toggle-row">
                        <label class="sf-push-label">সেচ দেওয়ার রিমাইন্ডার</label>
                        <label class="sf-push-switch">
                            <input type="checkbox" data-sf-push="irrigation" ${settings.irrigation ? 'checked' : ''}>
                            <span class="sf-push-slider"></span>
                        </label>
                    </div>
                    <div class="sf-push-toggle-row">
                        <label class="sf-push-label">ফসল তোলার রিমাইন্ডার</label>
                        <label class="sf-push-switch">
                            <input type="checkbox" data-sf-push="harvest" ${settings.harvest ? 'checked' : ''}>
                            <span class="sf-push-slider"></span>
                        </label>
                    </div>
                    <div class="sf-push-toggle-row">
                        <label class="sf-push-label">স্প্রে করার রিমাইন্ডার</label>
                        <label class="sf-push-switch">
                            <input type="checkbox" data-sf-push="spray" ${settings.spray ? 'checked' : ''}>
                            <span class="sf-push-slider"></span>
                        </label>
                    </div>
                    <div class="sf-push-toggle-row">
                        <label class="sf-push-label">আবহাওয়া সতর্কতা</label>
                        <label class="sf-push-switch">
                            <input type="checkbox" data-sf-push="weather" ${settings.weather ? 'checked' : ''}>
                            <span class="sf-push-slider"></span>
                        </label>
                    </div>
                    <div class="sf-push-toggle-row">
                        <label class="sf-push-label">রোগ সতর্কতা</label>
                        <label class="sf-push-switch">
                            <input type="checkbox" data-sf-push="disease" ${settings.disease ? 'checked' : ''}>
                            <span class="sf-push-slider"></span>
                        </label>
                    </div>
                    <div class="sf-push-toggle-row">
                        <label class="sf-push-label">পণ্য অফার</label>
                        <label class="sf-push-switch">
                            <input type="checkbox" data-sf-push="offers" ${settings.offers ? 'checked' : ''}>
                            <span class="sf-push-slider"></span>
                        </label>
                    </div>
                    <div class="sf-push-toggle-row">
                        <label class="sf-push-label">অর্ডার আপডেট</label>
                        <label class="sf-push-switch">
                            <input type="checkbox" data-sf-push="orders" ${settings.orders ? 'checked' : ''}>
                            <span class="sf-push-slider"></span>
                        </label>
                    </div>
                    <div class="sf-push-toggle-row">
                        <label class="sf-push-label">মূল্য পরিবর্তন</label>
                        <label class="sf-push-switch">
                            <input type="checkbox" data-sf-push="price" ${settings.price ? 'checked' : ''}>
                            <span class="sf-push-slider"></span>
                        </label>
                    </div>
                </div>

                <div class="sf-push-quiet-hours" style="${settings.enabled ? '' : 'opacity:0.4;pointer-events:none'}">
                    <h4>নীরব সময়</h4>
                    <div class="sf-push-time-row">
                        <label class="sf-push-label">শুরু</label>
                        <input type="time" data-sf-push="quietHoursStart" value="${settings.quietHoursStart}">
                    </div>
                    <div class="sf-push-time-row">
                        <label class="sf-push-label">শেষ</label>
                        <input type="time" data-sf-push="quietHoursEnd" value="${settings.quietHoursEnd}">
                    </div>
                </div>

                <div class="sf-push-actions">
                    <button class="sf-push-save-btn" data-sf-push-save>সেটিংস সংরক্ষণ করুন</button>
                    <button class="sf-push-permission-btn" data-sf-push-permission>নোটিফিকেশন চালু করুন</button>
                </div>
            </div>
        `;

        const typeInputs = container.querySelectorAll('.sf-push-types input[type="checkbox"]');
        const typeContainer = container.querySelector('.sf-push-types');
        const quietContainer = container.querySelector('.sf-push-quiet-hours');

        const enabledToggle = container.querySelector('[data-sf-push="enabled"]');
        enabledToggle.addEventListener('change', () => {
            const enabled = enabledToggle.checked;
            typeContainer.style.opacity = enabled ? '1' : '0.4';
            typeContainer.style.pointerEvents = enabled ? 'auto' : 'none';
            quietContainer.style.opacity = enabled ? '1' : '0.4';
            quietContainer.style.pointerEvents = enabled ? 'auto' : 'none';
        });

        container.querySelector('[data-sf-push-save]').addEventListener('click', () => {
            const updated = {};
            container.querySelectorAll('[data-sf-push]').forEach((input) => {
                const key = input.dataset.sfPush;
                if (key === 'enabled' || typeInputs.includes(input)) {
                    updated[key] = input.checked;
                } else {
                    updated[key] = input.value;
                }
            });
            this.updateSettings(updated);
            alert('সেটিংস সংরক্ষিত হয়েছে');
        });

        container.querySelector('[data-sf-push-permission]').addEventListener('click', async () => {
            const granted = await this.requestPermission();
            if (granted) {
                await this.subscribe();
                alert('নোটিফিকেশন সফলভাবে চালু হয়েছে');
            } else {
                alert('নোটিফিকেশন অনুমতি দেওয়া হয়নি');
            }
        });
    },

    async _getVapidKey() {
        if (this._vapidKey) return this._vapidKey;
        try {
            const resp = await fetch('/api/push/vapid-public-key');
            const data = await resp.json();
            this._vapidKey = this._urlBase64ToUint8Array(data.key);
            return this._vapidKey;
        } catch {
            return null;
        }
    },

    _urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const arr = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; i++) {
            arr[i] = rawData.charCodeAt(i);
        }
        return arr;
    },

    _restoreScheduled() {
        const list = loadScheduled();
        const now = Date.now();
        const active = [];
        for (const entry of list) {
            if (entry.scheduledAt <= now) {
                this.sendNotification(entry.title, { body: entry.body, type: entry.type });
            } else {
                this._scheduleTimer(entry);
                active.push(entry);
            }
        }
        saveScheduled(active);
    },

    _scheduleTimer(entry) {
        const delay = entry.scheduledAt - Date.now();
        if (delay <= 0) {
            this.sendNotification(entry.title, { body: entry.body, type: entry.type });
            return;
        }
        this._scheduledTimers[entry.id] = setTimeout(() => {
            this.sendNotification(entry.title, { body: entry.body, type: entry.type });
            delete this._scheduledTimers[entry.id];
            const list = loadScheduled().filter((e) => e.id !== entry.id);
            saveScheduled(list);
        }, delay);
    },
};
