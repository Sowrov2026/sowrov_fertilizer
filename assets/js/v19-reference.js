// V19 Reference Validation
// Ensures only trusted sources are referenced

export const SFReference = {
    TRUSTED_SOURCES: [
        { name: 'BARI', domain: 'bari.gov.bd', priority: 1 },
        { name: 'BRRI', domain: 'brri.gov.bd', priority: 2 },
        { name: 'DAE', domain: 'dae.gov.bd', priority: 3 },
        { name: 'BARC', domain: 'barc.gov.bd', priority: 4 },
        { name: 'FAO Bangladesh', domain: 'fao.org', priority: 5 },
        { name: 'Bangladesh Government', domain: 'gov.bd', priority: 6 },
        { name: 'IRRI', domain: 'irri.org', priority: 7 },
        { name: 'Wikipedia', domain: 'wikipedia.org', priority: 8 },
        { name: 'BMKMP', domain: 'bmjmp.gov.bd', priority: 9 },
        { name: 'DIFE', domain: 'dife.gov.bd', priority: 10 }
    ],

    validationLog: [],

    init() {
        this.loadFromStorage();
    },

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('sf_reference_log');
            if (stored) {
                this.validationLog = JSON.parse(stored);
            }
        } catch (e) {
            console.error('রেফারেন্স লগ লোডে সমস্যা:', e);
        }
    },

    saveToStorage() {
        try {
            localStorage.setItem('sf_reference_log', JSON.stringify(this.validationLog.slice(-200)));
        } catch (e) {
            console.error('রেফারেন্স লগ সেভে সমস্যা:', e);
        }
    },

    validateURL(url) {
        if (!url || typeof url !== 'string') {
            return { valid: false, reason: 'URL খালি বা ভুল ধরনের' };
        }

        let parsed;
        try {
            parsed = new URL(url);
        } catch (e) {
            return { valid: false, reason: 'URL ফরম্যাট সঠিক নয়' };
        }

        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { valid: false, reason: 'শুধুমাত্র HTTP/HTTPS URL গ্রহণযোগ্য' };
        }

        const hostname = parsed.hostname.toLowerCase();
        const matchedSource = this.TRUSTED_SOURCES.find(s =>
            hostname === s.domain || hostname.endsWith('.' + s.domain)
        );

        if (matchedSource) {
            return {
                valid: true,
                trusted: true,
                source: matchedSource.name,
                priority: matchedSource.priority,
                reason: `বিশ্বস্ত উৎস: ${matchedSource.name}`
            };
        }

        return {
            valid: true,
            trusted: false,
            source: null,
            priority: 999,
            reason: 'অপরিচিত উৎস - যাচাই প্রয়োজন'
        };
    },

    validateText(text) {
        if (!text || typeof text !== 'string') {
            return { valid: true, references: [], warnings: [] };
        }

        const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
        const urls = text.match(urlPattern) || [];

        const results = urls.map(url => {
            const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
            return {
                url: cleanUrl,
                ...this.validateURL(cleanUrl)
            };
        });

        const validRefs = results.filter(r => r.valid && r.trusted);
        const warnings = results.filter(r => r.valid && !r.trusted);
        const invalids = results.filter(r => !r.valid);

        this.logValidation(text, results);

        return {
            valid: invalids.length === 0,
            references: results,
            validCount: validRefs.length,
            warningCount: warnings.length,
            invalidCount: invalids.length,
            warnings: warnings.map(w => `অপরিচিত উৎস: ${w.url}`),
            invalids: invalids.map(i => `ভুল URL: ${i.url} - ${i.reason}`)
        };
    },

    getSourcePriority(url) {
        const result = this.validateURL(url);
        return result.trusted ? result.priority : 999;
    },

    extractValidReferences(text) {
        const validation = this.validateText(text);
        return validation.references
            .filter(r => r.trusted)
            .sort((a, b) => a.priority - b.priority)
            .map(r => ({
                url: r.url,
                source: r.source,
                priority: r.priority
            }));
    },

    isTrustedSource(url) {
        const result = this.validateURL(url);
        return result.trusted === true;
    },

    cleanResponse(text) {
        if (!text) return text;

        const validation = this.validateText(text);
        let cleaned = text;

        validation.references.forEach(ref => {
            if (!ref.valid || !ref.trusted) {
                const escapedUrl = ref.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\[?\\(?${escapedUrl}\\)?\\]?|${escapedUrl}`, 'gi');
                cleaned = cleaned.replace(regex, '');
            }
        });

        cleaned = cleaned.replace(/\[\s*,\s*\]/g, '');
        cleaned = cleaned.replace(/\(\s*,\s*\)/g, '');
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        cleaned = cleaned.trim();

        return cleaned;
    },

    logValidation(text, results) {
        const entry = {
            timestamp: new Date().toISOString(),
            textPreview: text.substring(0, 100),
            resultCount: results.length,
            trustedCount: results.filter(r => r.trusted).length,
            untrustedCount: results.filter(r => r.valid && !r.trusted).length
        };
        this.validationLog.push(entry);
        if (this.validationLog.length > 200) {
            this.validationLog = this.validationLog.slice(-200);
        }
        this.saveToStorage();
    },

    addTrustedSource(name, domain, priority) {
        if (!name || !domain) return false;

        const exists = this.TRUSTED_SOURCES.find(s => s.domain === domain);
        if (exists) {
            exists.name = name;
            exists.priority = priority || exists.priority;
            return true;
        }

        this.TRUSTED_SOURCES.push({
            name,
            domain: domain.toLowerCase(),
            priority: priority || this.TRUSTED_SOURCES.length + 1
        });

        this.TRUSTED_SOURCES.sort((a, b) => a.priority - b.priority);
        return true;
    },

    removeTrustedSource(domain) {
        const idx = this.TRUSTED_SOURCES.findIndex(s => s.domain === domain.toLowerCase());
        if (idx !== -1) {
            this.TRUSTED_SOURCES.splice(idx, 1);
            return true;
        }
        return false;
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    createReferencePanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const log = [...this.validationLog].reverse().slice(0, 50);
        const totalValidations = this.validationLog.length;
        const totalTrusted = this.validationLog.reduce((sum, l) => sum + l.trustedCount, 0);
        const totalUntrusted = this.validationLog.reduce((sum, l) => sum + l.untrustedCount, 0);

        container.innerHTML = `
            <div style="font-family:sans-serif;direction:rtl;text-align:right;padding:16px;">
                <h3 style="margin-bottom:16px;color:#333;">রেফারেন্স যাচাই প্যানেল</h3>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:20px;">
                    <div style="background:#e8f5e9;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#4caf50;">${totalTrusted}</div>
                        <div style="font-size:11px;color:#666;">বিশ্বস্ত</div>
                    </div>
                    <div style="background:#fff3e0;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#ff9800;">${totalUntrusted}</div>
                        <div style="font-size:11px;color:#666;">অপরিচিত</div>
                    </div>
                    <div style="background:#e3f2fd;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#1976d2;">${this.TRUSTED_SOURCES.length}</div>
                        <div style="font-size:11px;color:#666;">বিশ্বস্ত উৎস</div>
                    </div>
                    <div style="background:#f3e5f5;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#9c27b0;">${totalValidations}</div>
                        <div style="font-size:11px;color:#666;">মোট যাচাই</div>
                    </div>
                </div>

                <h4 style="margin-bottom:8px;color:#555;">বিশ্বস্ত উৎসসমূহ</h4>
                <div style="margin-bottom:20px;">
                    ${this.TRUSTED_SOURCES.map(s => `
                        <div style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:#e8f5e9;border:1px solid #c8e6c9;border-radius:16px;margin:3px;font-size:12px;">
                            <span style="color:#4caf50;">&#10003;</span>
                            <span style="font-weight:bold;">${s.name}</span>
                            <span style="color:#888;">${s.domain}</span>
                            <span style="background:#fff;border-radius:50%;width:18px;height:18px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#4caf50;">P${s.priority}</span>
                        </div>
                    `).join('')}
                </div>

                <h4 style="margin-bottom:8px;color:#555;">নতুন উৎস যোগ করুন</h4>
                <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
                    <input id="sf-ref-name" placeholder="নাম (যেমন: BADC)" style="padding:6px 10px;border:1px solid #ddd;border-radius:4px;width:120px;font-size:13px;" />
                    <input id="sf-ref-domain" placeholder="ডোমেইন (যেমন: badc.gov.bd)" style="padding:6px 10px;border:1px solid #ddd;border-radius:4px;width:200px;font-size:13px;" />
                    <input id="sf-ref-priority" type="number" placeholder="অগ্রাধিকার" style="padding:6px 10px;border:1px solid #ddd;border-radius:4px;width:80px;font-size:13px;" />
                    <button id="sf-ref-add-btn" style="padding:6px 14px;background:#4caf50;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">যোগ করুন</button>
                </div>

                <h4 style="margin-bottom:8px;color:#555;">টেক্সট যাচাই করুন</h4>
                <textarea id="sf-ref-test-text" rows="3" placeholder="এখানে একটি টেক্সট লিখুন যাতে URL আছে..." style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;resize:vertical;font-size:13px;margin-bottom:8px;"></textarea>
                <div style="display:flex;gap:8px;margin-bottom:12px;">
                    <button id="sf-ref-validate-btn" style="padding:6px 14px;background:#1976d2;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">যাচাই করুন</button>
                    <button id="sf-ref-clean-btn" style="padding:6px 14px;background:#ff9800;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:13px;">পরিষ্কার করুন</button>
                </div>
                <div id="sf-ref-test-result" style="background:#f5f5f5;padding:12px;border-radius:6px;display:none;font-size:13px;margin-bottom:16px;"></div>

                <h4 style="margin-bottom:8px;color:#555;">সাম্প্রতিক যাচাই লগ</h4>
                <div id="sf-ref-log" style="max-height:300px;overflow-y:auto;">
                    ${log.length === 0 ? '<p style="color:#888;">এখনো কোনো যাচাই হয়নি</p>' : log.map(entry => `
                        <div style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:6px;padding:8px;margin-bottom:6px;font-size:12px;">
                            <div style="display:flex;justify-content:space-between;">
                                <span>বিশ্বস্ত: <strong style="color:#4caf50;">${entry.trustedCount}</strong> | অপরিচিত: <strong style="color:#ff9800;">${entry.untrustedCount}</strong></span>
                                <span style="color:#aaa;">${entry.timestamp ? new Date(entry.timestamp).toLocaleString('bn-BD') : ''}</span>
                            </div>
                            <div style="color:#666;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this.escapeHtml(entry.textPreview)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('sf-ref-add-btn')?.addEventListener('click', () => {
            const name = document.getElementById('sf-ref-name').value.trim();
            const domain = document.getElementById('sf-ref-domain').value.trim();
            const priority = parseInt(document.getElementById('sf-ref-priority').value) || this.TRUSTED_SOURCES.length + 1;
            if (name && domain) {
                this.addTrustedSource(name, domain, priority);
                this.createReferencePanel(containerId);
            }
        });

        document.getElementById('sf-ref-validate-btn')?.addEventListener('click', () => {
            const text = document.getElementById('sf-ref-test-text').value;
            const result = this.validateText(text);
            const resultEl = document.getElementById('sf-ref-test-result');
            resultEl.style.display = 'block';

            const refList = result.references.map(r =>
                `<div style="padding:3px 0;">${r.trusted ? '✅' : '⚠️'} ${this.escapeHtml(r.url)} - ${r.reason}</div>`
            ).join('');

            resultEl.innerHTML = `
                <div style="margin-bottom:8px;"><strong>ফলাফল:</strong> ${result.valid ? '✅ সব URL বৈধ' : '❌ সমস্যা আছে'}</div>
                <div>বিশ্বস্ত: ${result.validCount} | অপরিচিত: ${result.warningCount} | ভুল: ${result.invalidCount}</div>
                <div style="margin-top:8px;">${refList || '<span style="color:#888;">কোনো URL পাওয়া যায়নি</span>'}</div>
            `;
        });

        document.getElementById('sf-ref-clean-btn')?.addEventListener('click', () => {
            const text = document.getElementById('sf-ref-test-text').value;
            const cleaned = this.cleanResponse(text);
            document.getElementById('sf-ref-test-text').value = cleaned;
        });
    }
};

window.SFReference = SFReference;
