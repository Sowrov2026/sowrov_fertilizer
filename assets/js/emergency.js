// V20 Emergency Mode
// Emergency types, helplines, alerts, and quick access

export const SFEmergency = {
    initialized: false,
    activeAlerts: [],
    STORAGE_KEY: 'sf_emergency_alerts',

    EMERGENCIES: {
        disease: {
            name: 'রোগ/অঙ্গনাঘাত',
            icon: '🦠',
            color: '#ef4444',
            actions: [
                'রোগের লক্ষণ পর্যবেক্ষণ করুন',
                'আক্রান্ত গাছ আলাদা করুন',
                'নির্ধারিত বীজাণুনাশক ব্যবহার করুন',
                'ডিই কার্যালয়ে জানান',
                'অন্যান্য গাছের সুরক্ষা নিশ্চিত করুন',
            ],
        },
        flood: {
            name: 'বন্যা',
            icon: '🌊',
            color: '#3b82f6',
            actions: [
                'নিরাপদ স্থানে যান',
                'প্রয়োজনীয় দ্রব্য সংগ্রহ করুন',
                'বৈদ্যুতিক সংযোগ বিচ্ছিন্ন করুন',
                'পশুপাখিকে উচ্চ স্থানে নিন',
                'বিপর্ত ব্যবস্থাপনায় যোগাযোগ করুন',
            ],
        },
        cyclone: {
            name: 'ঘূর্ণিঝড়',
            icon: '🌪️',
            color: '#8b5cf6',
            actions: [
                'শক্তিশালী কাঠামোতে আশ্রয় নিন',
                'জরুরি সামগ্রী প্রস্তুত করুন',
                'ফসল রক্ষার চেষ্টা করুন',
                'সমুদ্র থেকে দূরে থাকুন',
                'সতর্কতা মেনে চলুন',
            ],
        },
        storm: {
            name: 'ঝড়',
            icon: '⛈️',
            color: '#f59e0b',
            actions: [
                'নিরাপদ স্থানে আশ্রয় নিন',
                'বৃক্ষরক্ষা করুন',
                'জলজ ফসল রক্ষা করুন',
                'বাতাসের দিক পর্যবেক্ষণ করুন',
                'আবহাওয়া সতর্কতা অনুসরণ করুন',
            ],
        },
        drought: {
            name: 'খরা',
            icon: '☀️',
            color: '#f97316',
            actions: [
                'পানি সংরক্ষণ করুন',
                'খরাসহিষ্ণু ফসল বেছে নিন',
                'মালচিং প্রয়োগ করুন',
                'সেচ ব্যবস্থা চালু রাখুন',
                'কৃষি সম্প্রসারণ অধিদপ্তার সাথে যোগাযোগ করুন',
            ],
        },
        frost: {
            name: 'পালাপোড়া',
            icon: '❄️',
            color: '#06b6d4',
            actions: [
                'ফসলের আচ্ছাদন করুন',
                'স্প্রিংকলার ব্যবহার করুন',
                'ধূমিকরণ পদ্ধতি অবলম্বন করুন',
                'রাতের তাপমাত্রা পর্যবেক্ষণ করুন',
                'সংবেদনশীল ফসল সুরক্ষিত করুন',
            ],
        },
        pest: {
            name: 'পোকামাকড়',
            icon: '🐛',
            color: '#84cc16',
            actions: [
                'পোকার ধরন নির্ণয় করুন',
                'IPM পদ্ধতি অবলম্বন করুন',
                'জৈব নিয়ন্ত্রণ ব্যবহার করুন',
                'রাসায়নিক বীজাণুনাশক প্রয়োগ করুন',
                'কৃষি সম্প্রসারণ কর্মকর্তার পরামর্শ নিন',
            ],
        },
    },

    HELPLINES: [
        { name: 'DAE Helpline', phone: '16600', department: 'কৃষি সম্প্রসারণ অধিদপ্তার' },
        { name: 'BARI Helpline', phone: '16630', department: 'বাংলাদেশ কৃষি গবেষণা ইন্সটিটিউট' },
        { name: 'Fire Service', phone: '199', department: 'ফায়ার সার্ভিস' },
        { name: 'Police', phone: '999', department: 'পুলিশ' },
        { name: 'Ambulance', phone: '999', department: 'অ্যাম্বুলেন্স' },
        { name: 'Disaster Management', phone: '16000', department: 'বিপর্ত ব্যবস্থাপনা' },
    ],

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.loadFromStorage();
    },

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) this.activeAlerts = JSON.parse(stored);
        } catch (e) {
            console.error('জরুরি ডাটা লোডে সমস্যা:', e);
        }
    },

    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.activeAlerts));
        } catch (e) {
            console.error('জরুরি ডাটা সেভে সমস্যা:', e);
        }
    },

    // Emergency actions
    getEmergencyInfo(type) {
        return this.EMERGENCIES[type] || null;
    },

    getFirstAid(type) {
        const guides = {
            disease: 'রোগের প্রাথমিক চিকিৎসা: আক্রান্ত অংশ কেটে ফেলুন। বীজাণুনাশক প্রয়োগ করুন। পরিবেশ পরিষ্কার রাখুন।',
            flood: 'বন্যার প্রাথমিক চিকিৎসা: নিরাপদ স্থানে যান। পরিষ্কার পানি পান করুন। প্রয়োজনে চিকিৎসকের সাথে যোগাযোগ করুন।',
            cyclone: 'ঘূর্ণিঝড়ের প্রাথমিক চিকিৎসা: শক্তিশালী কাঠামোতে আশ্রয় নিন। আহত হলে প্রাথমিক চিকিৎসা দিন।',
            storm: 'ঝড়ের প্রাথমিক চিকিৎসা: নিরাপদ স্থানে থাকুন। আঘাতপ্রাপ্ত হলে প্রাথমিক চিকিৎসা প্রয়োগ করুন।',
            drought: 'খরার প্রাথমিক চিকিৎসা: পর্যাপ্ত পানি পান করুন। তাপঘাতের লক্ষণ হলে ছায়ায় নিয়ে যান।',
            frost: 'পালাপোড়ার প্রাথমিক চিকিৎসা: ফসলকে আচ্ছাদিত রাখুন। তুষারপাত হলে স্প্রিংকলার ব্যবহার করুন।',
            pest: 'পোকামাকড়ের প্রাথমিক চিকিৎসা: পোকার ধরন নির্ণয় করুন। উপযুক্ত নিয়ন্ত্রণ পদ্ধতি অবলম্বন করুন।',
        };
        return guides[type] || 'প্রাথমিক চিকিৎসা তথ্য পাওয়া যায়নি';
    },

    getPreventionTips(type) {
        const tips = {
            disease: ['নিয়মিত ফসল পর্যবেক্ষণ', 'প্রতিরোধমূলক বীজাণুনাশক ব্যবহার', 'বীজ শোধন করে বুনুন', 'ভারসাম্যপূর্ণ সার প্রয়োগ'],
            flood: ['উচ্চ স্থানে ফসল রোপণ', 'ড্রেনেজ ব্যবস্থা রাখুন', 'জরুরি সামগ্রী প্রস্তুত রাখুন', 'বিপর্ত প্রস্তুতি নিন'],
            cyclone: ['ঘূর্ণিঝড় পূর্বাভাস অনুসরণ', 'শক্তিশালী কাঠামো নির্মাণ', 'ফসল সংরক্ষণ', 'বীমা করান'],
            storm: ['আবহাওয়া সতর্কতা অনুসরণ', 'বৃক্ষরক্ষা', 'জলজ ফসল সুরক্ষা', 'নিরাপদ আশ্রয় প্রস্তুত'],
            drought: ['খরাসহিষ্ণু ফসল বেছে নিন', 'পানি সংরক্ষণ', 'মালচিং প্রয়োগ', 'সেচ ব্যবস্থা চালু রাখুন'],
            frost: ['ফসল আচ্ছাদন', 'স্প্রিংকলার ব্যবহার', 'ধূমিকরণ', 'তাপমাত্রা পর্যবেক্ষণ'],
            pest: ['IPM পদ্ধতি অবলম্বন', 'জৈব নিয়ন্ত্রণ', 'নিয়মিত পরিষ্কার-পরিচ্ছন্নতা', 'প্রতিরোধমূলক ব্যবস্থা'],
        };
        return tips[type] || [];
    },

    // Quick access
    triggerEmergency(type) {
        const info = this.getEmergencyInfo(type);
        if (!info) return false;
        const alert = {
            id: 'emg_' + Date.now(),
            type,
            name: info.name,
            icon: info.icon,
            color: info.color,
            timestamp: new Date().toISOString(),
            acknowledged: false,
        };
        this.activeAlerts.push(alert);
        this.saveToStorage();
        this.sendEmergencyAlert(type, `${info.name} জরুরি পরিস্থিতি সক্রিয় হয়েছে`);
        return alert;
    },

    getNearbyHelp(location) {
        return this.HELPLINES.map(h => ({
            ...h,
            action: () => { window.location.href = `tel:${h.phone}`; },
        }));
    },

    // Notifications
    sendEmergencyAlert(type, message) {
        const info = this.getEmergencyInfo(type);
        if (!info) return;
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${info.icon} ${info.name} - জরুরি সতর্কতা`, { body: message, icon: info.icon });
        }
        this.showToast(`${info.icon} ${message}`);
    },

    showToast(message) {
        let toast = document.getElementById('sf-emergency-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sf-emergency-toast';
            toast.style.cssText = 'position:fixed;top:20px;right:20px;padding:16px 24px;background:#ef4444;color:#fff;border-radius:8px;z-index:99999;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);max-width:400px;';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.display = 'block';
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 5000);
    },

    // UI
    createEmergencyDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const types = Object.entries(this.EMERGENCIES);
        container.innerHTML = `
            <div class="sf-emergency-dashboard">
                <h2>🚨 জরুরি সহায়তা কেন্দ্র</h2>
                <div class="sf-emergency-types">
                    ${types.map(([key, val]) => `
                        <div class="sf-emergency-card" style="border-left:4px solid ${val.color}" data-emergency-type="${key}">
                            <span class="sf-emg-icon">${val.icon}</span>
                            <div>
                                <strong>${val.name}</strong>
                                <div class="sf-emg-actions">
                                    ${val.actions.slice(0, 3).map(a => `<span class="sf-emg-action">${a}</span>`).join('')}
                                </div>
                            </div>
                        </div>`).join('')}
                </div>
                <div class="sf-emergency-active" id="sf-active-alerts"></div>
            </div>`;
        this.renderActiveAlerts();
        container.querySelectorAll('[data-emergency-type]').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.emergencyType;
                this.triggerEmergency(type);
                this.renderActiveAlerts();
            });
        });
    },

    renderActiveAlerts() {
        const box = document.getElementById('sf-active-alerts');
        if (!box) return;
        const active = this.activeAlerts.filter(a => !a.acknowledged);
        if (active.length === 0) {
            box.innerHTML = '<p>কোনো সক্রিয় জরুরি পরিস্থিতি নেই</p>';
            return;
        }
        box.innerHTML = `<h3>সক্রিয় সতর্কতা (${active.length})</h3>
            ${active.map(a => `
                <div class="sf-active-alert" style="border-left:4px solid ${a.color}">
                    <span>${a.icon} ${a.name}</span>
                    <small>${new Date(a.timestamp).toLocaleString('bn-BD')}</small>
                    <button class="sf-btn sf-btn-sm" onclick="this.closest('.sf-active-alert').remove()">বন্ধ করুন</button>
                </div>`).join('')}`;
    },

    createEmergencyButton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <button class="sf-emergency-trigger" id="sf-emergency-btn">
                🚨 জরুরি সাহায্য
            </button>`;
        document.getElementById('sf-emergency-btn')?.addEventListener('click', () => {
            this.requestNotificationPermission();
            const dash = document.getElementById('sf-emergency-dashboard');
            if (dash) {
                dash.style.display = dash.style.display === 'none' ? 'block' : 'none';
            }
        });
    },

    createHelplineList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="sf-helpline-list">
                <h3>📞 জরুরি হেল্পলাইন</h3>
                ${this.HELPLINES.map(h => `
                    <div class="sf-helpline-item">
                        <div>
                            <strong>${h.department}</strong>
                            <small>${h.name}</small>
                        </div>
                        <a href="tel:${h.phone}" class="sf-btn sf-btn-call">📞 ${h.phone}</a>
                    </div>`).join('')}
            </div>`;
    },

    createEmergencyInfo(containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const info = this.getEmergencyInfo(type);
        if (!info) {
            container.innerHTML = '<div class="sf-empty-state">তথ্য পাওয়া যায়নি</div>';
            return;
        }
        const tips = this.getPreventionTips(type);
        const firstAid = this.getFirstAid(type);
        container.innerHTML = `
            <div class="sf-emergency-info" style="border-top:4px solid ${info.color}">
                <h3>${info.icon} ${info.name}</h3>
                <div class="sf-emg-section">
                    <h4>প্রাথমিক পদক্ষেপ</h4>
                    <ul>${info.actions.map(a => `<li>${a}</li>`).join('')}</ul>
                </div>
                <div class="sf-emg-section">
                    <h4>প্রাথমিক চিকিৎসা</h4>
                    <p>${firstAid}</p>
                </div>
                ${tips.length ? `
                    <div class="sf-emg-section">
                        <h4>প্রতিরোধমূলক পরামর্শ</h4>
                        <ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>
                    </div>` : ''}
            </div>`;
    },

    createQuickAccess(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const types = Object.entries(this.EMERGENCIES);
        container.innerHTML = `
            <div class="sf-quick-access">
                <h3>⚡ দ্রুত প্রবেশ</h3>
                <div class="sf-quick-grid">
                    ${types.map(([key, val]) => `
                        <button class="sf-quick-btn" style="background:${val.color}20;border:1px solid ${val.color}" data-quick-type="${key}">
                            <span class="sf-quick-icon">${val.icon}</span>
                            <span>${val.name}</span>
                        </button>`).join('')}
                </div>
            </div>`;
        container.querySelectorAll('[data-quick-btn]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.quickType;
                this.triggerEmergency(type);
            });
        });
        container.querySelectorAll('[data-quick-type]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.quickType;
                this.triggerEmergency(type);
                this.renderActiveAlerts();
            });
        });
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    // Export
    exportEmergencyContacts() {
        const data = {
            helplines: this.HELPLINES,
            emergencies: Object.entries(this.EMERGENCIES).map(([k, v]) => ({
                type: k,
                name: v.name,
                actions: v.actions,
                firstAid: this.getFirstAid(k),
                prevention: this.getPreventionTips(k),
            })),
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sf-emergency-contacts-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
};
