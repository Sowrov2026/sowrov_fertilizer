/**
 * SF AI V20 — Security & Encryption Module
 * ES module for Web Crypto API encryption, session management, password auth
 * AES-GCM এনক্রিপশন, পাসওয়ার্ড যাচাই, সেশন ব্যবস্থাপনা
 */

const SECURITY_KEY = 'sf_security_key';
const SESSION_KEY = 'sf_session';
const SECURITY_VERSION = '20.0';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

function secGetStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function secSetStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch { /* quota */ }
}

function secRemoveStorage(key) {
    try { localStorage.removeItem(key); } catch { /* */ }
}

function secId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function secToast(message, type) {
    const existing = document.querySelector('.sf-sec-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'sf-sec-toast ' + (type || 'success');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '24px', right: '24px', padding: '14px 24px',
        borderRadius: '10px', color: '#fff', fontWeight: 'bold',
        fontFamily: 'inherit', zIndex: '100001', animation: 'sfSecToastIn 0.3s ease',
        background: type === 'error' ? '#dc3545' : type === 'warning' ? '#f0ad4e' : '#28a745'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function secInjectStyles() {
    if (document.getElementById('sf-sec-styles')) return;
    const style = document.createElement('style');
    style.id = 'sf-sec-styles';
    style.textContent = `
        @keyframes sfSecToastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .sf-sec-panel { font-family: 'Hind Siliguri','Kalpurush',sans-serif; max-width: 700px; margin: 0 auto; padding: 24px; background: linear-gradient(135deg,#fef3f2,#fee2e2); border-radius: 16px; border: 2px solid #dc3545; }
        .sf-sec-title { text-align: center; font-size: 1.5em; color: #991b1b; margin-bottom: 20px; font-weight: bold; }
        .sf-sec-section { margin-bottom: 20px; padding: 16px; background: #fff; border-radius: 12px; border: 1px solid #e0e0e0; }
        .sf-sec-section h3 { margin: 0 0 12px; color: #991b1b; font-size: 1.05em; }
        .sf-sec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .sf-sec-btn { padding: 12px 16px; border: none; border-radius: 8px; font-size: 0.95em; font-weight: bold; font-family: inherit; cursor: pointer; transition: all 0.2s; }
        .sf-sec-btn:hover { transform: translateY(-2px); box-shadow: 0 3px 8px rgba(0,0,0,0.15); }
        .sf-sec-btn-primary { background: #dc3545; color: #fff; grid-column: 1/-1; }
        .sf-sec-btn-success { background: #198754; color: #fff; }
        .sf-sec-btn-outline { background: #fff; color: #dc3545; border: 2px solid #dc3545; }
        .sf-sec-btn-danger { background: #6c757d; color: #fff; }
        .sf-sec-input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 1em; font-family: inherit; margin-bottom: 10px; box-sizing: border-box; }
        .sf-sec-input:focus { border-color: #dc3545; outline: none; }
        .sf-sec-stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .sf-sec-stat:last-child { border-bottom: none; }
        .sf-sec-stat-label { color: #666; }
        .sf-sec-stat-value { font-weight: bold; }
        .sf-sec-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
        .sf-sec-badge-active { background: #d1e7dd; color: #0f5132; }
        .sf-sec-badge-inactive { background: #f8d7da; color: #842029; }
        .sf-sec-empty { text-align: center; color: #999; padding: 12px; font-style: italic; }
    `;
    document.head.appendChild(style);
}

async function secHashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const SFSecurityV20 = {
    init() {
        secInjectStyles();
        return this;
    },

    async generateKey() {
        const key = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        const exported = await crypto.subtle.exportKey('raw', key);
        const keyArray = Array.from(new Uint8Array(exported));
        const keyBase64 = btoa(String.fromCharCode(...keyArray));
        secSetStorage(SECURITY_KEY, { key: keyBase64, created: new Date().toISOString(), version: SECURITY_VERSION });
        return keyBase64;
    },

    async encrypt(data, key) {
        if (!data || !key) throw new Error('ডেটা এবং কী প্রয়োজন');
        const keyBytes = Uint8Array.from(atob(key), c => c.charCodeAt(0));
        const cryptoKey = await crypto.subtle.importKey(
            'raw', keyBytes,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const encoded = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data));
        const ciphertext = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            encoded
        );
        const result = {
            iv: btoa(String.fromCharCode(...iv)),
            data: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
            algorithm: 'AES-GCM',
            timestamp: new Date().toISOString()
        };
        return result;
    },

    async decrypt(encryptedData, key) {
        if (!encryptedData || !key) throw new Error('এনক্রিপ্ট করা ডেটা এবং কী প্রয়োজন');
        const keyBytes = Uint8Array.from(atob(key), c => c.charCodeAt(0));
        const cryptoKey = await crypto.subtle.importKey(
            'raw', keyBytes,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
        const ciphertext = Uint8Array.from(atob(encryptedData.data), c => c.charCodeAt(0));
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            cryptoKey,
            ciphertext
        );
        const decoder = new TextDecoder();
        const decoded = decoder.decode(decryptedBuffer);
        try { return JSON.parse(decoded); } catch { return decoded; }
    },

    async hash(data) {
        if (!data) throw new Error('হ্যাশ করার জন্য ডেটা প্রয়োজন');
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        return await secHashString(str);
    },

    async secureStore(key, data) {
        const storedKey = secGetStorage(SECURITY_KEY)?.key;
        if (!storedKey) {
            await this.generateKey();
        }
        const currentKey = secGetStorage(SECURITY_KEY)?.key;
        const encrypted = await this.encrypt(data, currentKey);
        secSetStorage(`sf_secure_${key}`, encrypted);
    },

    async secureRetrieve(key) {
        const encrypted = secGetStorage(`sf_secure_${key}`);
        if (!encrypted) return null;
        const storedKey = secGetStorage(SECURITY_KEY)?.key;
        if (!storedKey) return null;
        try {
            return await this.decrypt(encrypted, storedKey);
        } catch { return null; }
    },

    async encryptFarmData(farmId) {
        const farmData = secGetStorage('sf_farms') || secGetStorage('sf_farm_list') || [];
        const farm = farmId ? farmData.find(f => f.id === farmId) : farmData;
        if (!farm) { secToast('ফার্ম ডেটা পাওয়া যায়নি', 'error'); return; }
        await this.secureStore(`farm_${farmId || 'all'}`, farm);
        secToast('ফার্ম ডেটা এনক্রিপ্ট হয়েছে', 'success');
    },

    async decryptFarmData(farmId) {
        const data = await this.secureRetrieve(`farm_${farmId || 'all'}`);
        if (!data) { secToast('ডিক্রিপ্ট করা সম্ভব হয়নি', 'error'); return null; }
        secToast('ফার্ম ডেটা ডিক্রিপ্ট হয়েছে', 'success');
        return data;
    },

    async encryptReport(reportId) {
        const reports = secGetStorage('sf_reports') || [];
        const report = reports.find(r => r.id === reportId);
        if (!report) { secToast('রিপোর্ট পাওয়া যায়নি', 'error'); return; }
        await this.secureStore(`report_${reportId}`, report);
        secToast('রিপোর্ট এনক্রিপ্ট হয়েছে', 'success');
    },

    async decryptReport(reportId) {
        const data = await this.secureRetrieve(`report_${reportId}`);
        if (!data) { secToast('ডিক্রিপ্ট ব্যর্থ', 'error'); return null; }
        secToast('রিপোর্ট ডিক্রিপ্ট হয়েছে', 'success');
        return data;
    },

    async encryptInvoice(invoiceId) {
        const invoices = secGetStorage('sf_invoices') || secGetStorage('sf_orders') || [];
        const invoice = invoices.find(i => i.id === invoiceId);
        if (!invoice) { secToast('ইনভয়েস পাওয়া যায়নি', 'error'); return; }
        await this.secureStore(`invoice_${invoiceId}`, invoice);
        secToast('ইনভয়েস এনক্রিপ্ট হয়েছে', 'success');
    },

    async decryptInvoice(invoiceId) {
        const data = await this.secureRetrieve(`invoice_${invoiceId}`);
        if (!data) { secToast('ডিক্রিপ্ট ব্যর্থ', 'error'); return null; }
        secToast('ইনভয়েস ডিক্রিপ্ট হয়েছে', 'success');
        return data;
    },

    async verifyUser(password) {
        const stored = secGetStorage(SESSION_KEY);
        if (!stored || !stored.passwordHash) return false;
        const inputHash = await secHashString(password);
        return inputHash === stored.passwordHash;
    },

    async setPassword(password) {
        if (!password || password.length < 4) {
            secToast('পাসওয়ার্ড কমপক্ষে ৪ অক্ষর হতে হবে', 'error');
            return false;
        }
        const hash = await secHashString(password);
        const session = secGetStorage(SESSION_KEY) || {};
        session.passwordHash = hash;
        session.setPassword = true;
        session.createdAt = new Date().toISOString();
        secSetStorage(SESSION_KEY, session);
        secToast('পাসওয়ার্ড সেট হয়েছে', 'success');
        return true;
    },

    async checkPassword(password) {
        if (!password) return false;
        const stored = secGetStorage(SESSION_KEY);
        if (!stored || !stored.passwordHash) return true;
        const inputHash = await secHashString(password);
        return inputHash === stored.passwordHash;
    },

    createSession() {
        const sessionData = {
            id: secId(),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + SESSION_TIMEOUT).toISOString(),
            lastActivity: new Date().toISOString(),
            userAgent: navigator.userAgent,
            authenticated: true
        };
        secSetStorage(SESSION_KEY, {
            ...secGetStorage(SESSION_KEY),
            ...sessionData
        });
        return sessionData;
    },

    validateSession() {
        const session = secGetStorage(SESSION_KEY);
        if (!session || !session.id) return false;
        if (!session.expiresAt) return true;
        const expiry = new Date(session.expiresAt).getTime();
        if (Date.now() > expiry) {
            this.destroySession();
            return false;
        }
        session.lastActivity = new Date().toISOString();
        secSetStorage(SESSION_KEY, session);
        return true;
    },

    destroySession() {
        const session = secGetStorage(SESSION_KEY) || {};
        delete session.id;
        delete session.expiresAt;
        delete session.lastActivity;
        delete session.authenticated;
        session.authenticated = false;
        secSetStorage(SESSION_KEY, session);
    },

    createSecurityPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const session = secGetStorage(SESSION_KEY) || {};
        const hasPassword = !!session.passwordHash;
        const isActive = this.validateSession();

        container.innerHTML = `
            <div class="sf-sec-panel">
                <div class="sf-sec-title">নিরাপত্তা সেন্টার (V20)</div>

                <div class="sf-sec-section">
                    <h3>সেশন তথ্য</h3>
                    <div class="sf-sec-stat">
                        <span class="sf-sec-stat-label">সেশন স্ট্যাটাস:</span>
                        <span class="sf-sec-badge ${isActive ? 'sf-sec-badge-active' : 'sf-sec-badge-inactive'}">${isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                    </div>
                    <div class="sf-sec-stat">
                        <span class="sf-sec-stat-label">পাসওয়ার্ড সেট আছে:</span>
                        <span class="sf-sec-stat-value">${hasPassword ? 'হ্যাঁ ✓' : 'না'}</span>
                    </div>
                    <div class="sf-sec-stat">
                        <span class="sf-sec-stat-label">সেশন আইডি:</span>
                        <span class="sf-sec-stat-value" style="font-size:0.85em">${session.id || 'নেই'}</span>
                    </div>
                    <div class="sf-sec-stat">
                        <span class="sf-sec-stat-label">সময়কাল:</span>
                        <span class="sf-sec-stat-value">${session.expiresAt ? new Date(session.expiresAt).toLocaleString('bn-BD') : 'অসীমিত'}</span>
                    </div>
                </div>

                <div class="sf-sec-section">
                    <h3>এনক্রিপশন</h3>
                    <div class="sf-sec-grid">
                        <button class="sf-sec-btn sf-sec-btn-success" id="sf-sec-gen-key">নতুন কী তৈরি করুন</button>
                        <button class="sf-sec-btn sf-sec-btn-outline" id="sf-sec-export-key">কী ডাউনলোড</button>
                        <button class="sf-sec-btn sf-sec-btn-outline" id="sf-sec-encrypt-farm" style="grid-column:1/-1">ফার্ম ডেটা এনক্রিপ্ট</button>
                        <button class="sf-sec-btn sf-sec-btn-outline" id="sf-sec-decrypt-farm" style="grid-column:1/-1">ফার্ম ডেটা ডিক্রিপ্ট</button>
                    </div>
                </div>

                <div class="sf-sec-section">
                    <h3>পাসওয়ার্ড ব্যবস্থাপনা</h3>
                    <input type="password" class="sf-sec-input" id="sf-sec-pw-input" placeholder="পাসওয়ার্ড লিখুন">
                    <div class="sf-sec-grid">
                        <button class="sf-sec-btn sf-sec-btn-primary" id="sf-sec-set-pw" style="grid-column:1/-1">পাসওয়ার্ড সেট করুন</button>
                        <button class="sf-sec-btn sf-sec-btn-outline" id="sf-sec-check-pw">যাচাই করুন</button>
                        <button class="sf-sec-btn sf-sec-btn-danger" id="sf-sec-destroy-session">সেশন ধ্বংস</button>
                    </div>
                </div>
            </div>
        `;

        const self = this;

        document.getElementById('sf-sec-gen-key').addEventListener('click', async function () {
            const key = await self.generateKey();
            secToast('নতুন এনক্রিপশন কী তৈরি হয়েছে!', 'success');
            self.createSecurityPanel(containerId);
        });

        document.getElementById('sf-sec-export-key').addEventListener('click', function () {
            const stored = secGetStorage(SECURITY_KEY);
            if (!stored?.key) { secToast('কী পাওয়া যায়নি', 'error'); return; }
            const blob = new Blob([JSON.stringify(stored, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sf_encryption_key.json';
            a.click();
            URL.revokeObjectURL(url);
            secToast('কী ডাউনলোড হয়েছে', 'success');
        });

        document.getElementById('sf-sec-encrypt-farm').addEventListener('click', async function () {
            await self.encryptFarmData();
        });

        document.getElementById('sf-sec-decrypt-farm').addEventListener('click', async function () {
            const data = await self.decryptFarmData();
            if (data) secToast('ফার্ম ডেটা পাঠনো হয়েছে', 'success');
        });

        document.getElementById('sf-sec-set-pw').addEventListener('click', async function () {
            const pw = document.getElementById('sf-sec-pw-input').value;
            await self.setPassword(pw);
            document.getElementById('sf-sec-pw-input').value = '';
            self.createSecurityPanel(containerId);
        });

        document.getElementById('sf-sec-check-pw').addEventListener('click', async function () {
            const pw = document.getElementById('sf-sec-pw-input').value;
            const ok = await self.checkPassword(pw);
            secToast(ok ? 'পাসওয়ার্ড সঠিক ✓' : 'পাসওয়ার্ড ভুল!', ok ? 'success' : 'error');
            document.getElementById('sf-sec-pw-input').value = '';
        });

        document.getElementById('sf-sec-destroy-session').addEventListener('click', function () {
            self.destroySession();
            secToast('সেশন ধ্বংস হয়েছে', 'warning');
            self.createSecurityPanel(containerId);
        });

        return { destroy() { container.innerHTML = ''; } };
    },

    createPasswordDialog(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const session = secGetStorage(SESSION_KEY) || {};
        const hasPassword = !!session.passwordHash;

        container.innerHTML = `
            <div class="sf-sec-panel" style="max-width:400px;">
                <div class="sf-sec-title">${hasPassword ? 'পাসওয়ার্ড দিন' : 'পাসওয়ার্ড সেট করুন'}</div>
                <div class="sf-sec-section">
                    <input type="password" class="sf-sec-input" id="sf-sec-dialog-pw" placeholder="পাসওয়ার্ড লিখুন">
                    <button class="sf-sec-btn sf-sec-btn-primary" id="sf-sec-dialog-submit" style="width:100%">${hasPassword ? 'লগইন' : 'সেট করুন'}</button>
                </div>
            </div>
        `;

        const self = this;
        document.getElementById('sf-sec-dialog-submit').addEventListener('click', async function () {
            const pw = document.getElementById('sf-sec-dialog-pw').value;
            if (!pw) { secToast('পাসওয়ার্ড লিখুন', 'error'); return; }
            if (hasPassword) {
                const ok = await self.checkPassword(pw);
                if (ok) {
                    self.createSession();
                    secToast('লগইন সফল!', 'success');
                } else {
                    secToast('পাসওয়ার্ড ভুল!', 'error');
                }
            } else {
                await self.setPassword(pw);
                self.createSession();
            }
            document.getElementById('sf-sec-dialog-pw').value = '';
        });

        return { destroy() { container.innerHTML = ''; } };
    },

    createEncryptionStatus(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const keyData = secGetStorage(SECURITY_KEY);
        const hasKey = !!keyData?.key;

        container.innerHTML = `
            <div class="sf-sec-panel" style="padding:16px;">
                <div class="sf-sec-section" style="margin:0;border:none;padding:0;">
                    <div class="sf-sec-stat">
                        <span class="sf-sec-stat-label">এনক্রিপশন স্ট্যাটাস:</span>
                        <span class="sf-sec-badge ${hasKey ? 'sf-sec-badge-active' : 'sf-sec-badge-inactive'}">${hasKey ? 'সক্রিয় ✓' : 'নিষ্ক্রিয়'}</span>
                    </div>
                    ${hasKey ? `
                    <div class="sf-sec-stat">
                        <span class="sf-sec-stat-label">অ্যালগরিদম:</span>
                        <span class="sf-sec-stat-value">AES-256-GCM</span>
                    </div>
                    <div class="sf-sec-stat">
                        <span class="sf-sec-stat-label">কী তৈরি:</span>
                        <span class="sf-sec-stat-value">${keyData.created ? new Date(keyData.created).toLocaleDateString('bn-BD') : 'অজ্ঞাত'}</span>
                    </div>
                    <div class="sf-sec-stat">
                        <span class="sf-sec-stat-label">ভার্সন:</span>
                        <span class="sf-sec-stat-value">V${keyData.version || SECURITY_VERSION}</span>
                    </div>
                    ` : '<div class="sf-sec-empty">এনক্রিপশন সক্রিয় করতে কী তৈরি করুন</div>'}
                </div>
            </div>
        `;

        return { destroy() { container.innerHTML = ''; } };
    }
};
