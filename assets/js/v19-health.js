// V19 Self Health Check
// Checks system health and reports issues

export const SFHealth = {
    initialized: false,
    lastCheck: null,
    issues: [],

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.issues = this.loadIssues();
    },

    loadIssues() {
        try {
            const stored = localStorage.getItem('sf_v19_health_issues');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    saveIssues() {
        try {
            localStorage.setItem('sf_v19_health_issues', JSON.stringify(this.issues));
        } catch {}
    },

    async runFullCheck() {
        this.issues = [];
        this.lastCheck = new Date().toISOString();

        const checks = [
            { name: 'বিচ্ছিন্ন জ্ঞান', fn: () => this.checkBrokenKnowledge() },
            { name: 'ডুপ্লিকেট জ্ঞান', fn: () => this.checkDuplicateKnowledge() },
            { name: 'বিচ্ছিন্ন রেফারেন্স', fn: () => this.checkBrokenReferences() },
            { name: 'অব্যবহৃত ফাইল', fn: () => this.checkUnusedFiles() },
            { name: 'অনুপস্থিত ছবি', fn: () => this.checkMissingImages() },
            { name: 'বিচ্ছিন্ন পণ্য লিঙ্ক', fn: () => this.checkBrokenProductLinks() },
        ];

        for (const check of checks) {
            try {
                const results = await check.fn();
                results.forEach(issue => {
                    this.issues.push({
                        ...issue,
                        category: check.name,
                        detectedAt: new Date().toISOString(),
                    });
                });
            } catch (e) {
                this.issues.push({
                    category: check.name,
                    severity: 'error',
                    message: `চেক চলাকালে ত্রুটি: ${e.message}`,
                    fixable: false,
                });
            }
        }

        this.saveIssues();
        return this.issues;
    },

    async checkBrokenKnowledge() {
        const issues = [];
        const selectors = [
            '.knowledge-item',
            '[data-knowledge-id]',
            '.faq-item',
            '.chatgaiya-entry',
        ];

        selectors.forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                const id = el.dataset.knowledgeId || el.dataset.id;
                if (id && !el.textContent.trim()) {
                    issues.push({
                        severity: 'warning',
                        message: `বিচ্ছিন্ন জ্ঞান আইটেম: ${id}`,
                        element: sel,
                        fixable: true,
                        fixType: 'remove_empty',
                    });
                }
            });
        });

        const knowledgeStore = this.getKnowledgeStore();
        if (knowledgeStore) {
            Object.keys(knowledgeStore).forEach(key => {
                const entry = knowledgeStore[key];
                if (!entry || !entry.content || entry.content.trim().length === 0) {
                    issues.push({
                        severity: 'warning',
                        message: `খালি জ্ঞান এন্ট্রি: ${key}`,
                        fixable: true,
                        fixType: 'remove_empty_entry',
                    });
                }
            });
        }

        return issues;
    },

    async checkDuplicateKnowledge() {
        const issues = [];
        const knowledgeStore = this.getKnowledgeStore();

        if (knowledgeStore) {
            const contentMap = {};
            Object.entries(knowledgeStore).forEach(([key, entry]) => {
                if (entry && entry.content) {
                    const normalized = entry.content.toLowerCase().trim().replace(/\s+/g, ' ');
                    if (contentMap[normalized]) {
                        issues.push({
                            severity: 'info',
                            message: `ডুপ্লিকেট: "${key}" এবং "${contentMap[normalized]}"`,
                            fixable: true,
                            fixType: 'merge_duplicates',
                        });
                    } else {
                        contentMap[normalized] = key;
                    }
                }
            });
        }

        const faqItems = document.querySelectorAll('.faq-item');
        const faqTexts = {};
        faqItems.forEach(item => {
            const text = item.textContent.toLowerCase().trim();
            if (faqTexts[text]) {
                issues.push({
                    severity: 'info',
                    message: `ডুপ্লিকেট FAQ আইটেম পাওয়া গেছে`,
                    fixable: false,
                });
            } else {
                faqTexts[text] = true;
            }
        });

        return issues;
    },

    async checkBrokenReferences() {
        const issues = [];

        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('/') || href.startsWith('./'))) {
                if (!href.endsWith('.html') && !href.endsWith('.js') && !href.endsWith('.css')) {
                    if (!document.querySelector(`[data-page="${href}"]`)) {
                        issues.push({
                            severity: 'warning',
                            message: `বিচ্ছিন্ন লিঙ্ক: ${href}`,
                            fixable: false,
                        });
                    }
                }
            }
        });

        document.querySelectorAll('[data-ref]').forEach(el => {
            const ref = el.dataset.ref;
            if (ref && !document.getElementById(ref) && !document.querySelector(`[data-id="${ref}"]`)) {
                issues.push({
                    severity: 'warning',
                    message: `বিচ্ছিন্ন রেফারেন্স: ${ref}`,
                    fixable: true,
                    fixType: 'remove_orphan_ref',
                });
            }
        });

        return issues;
    },

    async checkUnusedFiles() {
        const issues = [];

        try {
            const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => {
                const src = s.getAttribute('src');
                return src ? src.split('/').pop() : null;
            }).filter(Boolean);

            const links = Array.from(document.querySelectorAll('link[href]')).map(l => {
                const href = l.getAttribute('href');
                return href ? href.split('/').pop() : null;
            }).filter(Boolean);

            const allRefs = new Set([...scripts, ...links]);

            const knownFiles = [
                'v19-feedback.js', 'v19-admin.js', 'v19-suggestions.js',
                'v19-reference.js', 'v19-report.js', 'v19-health.js',
                'v19-logging.js', 'v19-integration.js',
            ];

            knownFiles.forEach(file => {
                if (!allRefs.has(file)) {
                    issues.push({
                        severity: 'info',
                        message: `অব্যবহৃত ফাইল: ${file}`,
                        fixable: false,
                    });
                }
            });
        } catch {}

        return issues;
    },

    async checkMissingImages() {
        const issues = [];

        document.querySelectorAll('img').forEach(img => {
            if (!img.complete || img.naturalHeight === 0) {
                issues.push({
                    severity: 'error',
                    message: `অনুপস্থিত ছবি: ${img.src || img.dataset.src || 'অজ্ঞাত'}`,
                    fixable: true,
                    fixType: 'placeholder_image',
                });
            }
        });

        document.querySelectorAll('[style*="background-image"]').forEach(el => {
            const style = el.getAttribute('style');
            const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (match) {
                const url = match[1];
                if (url && !url.startsWith('data:')) {
                    const img = new Image();
                    img.src = url;
                    if (!img.complete) {
                        issues.push({
                            severity: 'warning',
                            message: `সম্ভাব্য অনুপস্থিত ব্যাকগ্রাউন্ড ছবি: ${url}`,
                            fixable: false,
                        });
                    }
                }
            }
        });

        return issues;
    },

    async checkBrokenProductLinks() {
        const issues = [];

        document.querySelectorAll('[data-product-id], [data-product]').forEach(el => {
            const productId = el.dataset.productId || el.dataset.product;
            const link = el.querySelector('a') || el.closest('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('/')) {
                    issues.push({
                        severity: 'warning',
                        message: `সম্ভাব্য বিচ্ছিন্ন পণ্য লিঙ্ক: ${productId}`,
                        fixable: false,
                    });
                }
            }
        });

        const cartButtons = document.querySelectorAll('[data-cart-action]');
        cartButtons.forEach(btn => {
            const product = btn.dataset.product || btn.dataset.productId;
            if (product && !document.querySelector(`[data-product-id="${product}"]`)) {
                issues.push({
                    severity: 'warning',
                    message: `কার্ট বাটনের পণ্য পাওয়া যায়নি: ${product}`,
                    fixable: false,
                });
            }
        });

        return issues;
    },

    getKnowledgeStore() {
        try {
            const stored = localStorage.getItem('sf_knowledge_store');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    },

    getHealthScore() {
        if (this.issues.length === 0) return 100;

        let deductions = 0;
        this.issues.forEach(issue => {
            switch (issue.severity) {
                case 'error': deductions += 15; break;
                case 'warning': deductions += 8; break;
                case 'info': deductions += 3; break;
            }
        });

        return Math.max(0, Math.min(100, 100 - deductions));
    },

    createHealthDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const score = this.getHealthScore();
        const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
        const scoreLabel = score >= 80 ? 'ভালো' : score >= 50 ? 'গড়' : 'খারাপ';

        container.innerHTML = `
            <div class="sf-health-dashboard" style="font-family:'Hind Siliguri',sans-serif;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#10b981;margin:0;">সিস্টেম স্বাস্থ্য</h3>
                    <button id="btn-run-health-check" style="padding:6px 16px;border-radius:8px;border:none;background:#10b981;color:white;cursor:pointer;font-weight:600;">চেক চালান</button>
                </div>
                <div style="display:flex;gap:20px;align-items:center;margin-bottom:20px;">
                    <div style="width:100px;height:100px;border-radius:50%;background:conic-gradient(${scoreColor} ${score}%, #1e293b ${score}%);display:flex;align-items:center;justify-content:center;">
                        <div style="width:80px;height:80px;border-radius:50%;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                            <span style="font-size:24px;font-weight:700;color:${scoreColor};">${score}</span>
                            <span style="font-size:10px;color:#94a3b8;">স্কোর</span>
                        </div>
                    </div>
                    <div>
                        <div style="font-size:18px;font-weight:600;color:${scoreColor};">${scoreLabel}</div>
                        <div style="font-size:13px;color:#94a3b8;">${this.issues.length}টি সমস্যা পাওয়া গেছে</div>
                        ${this.lastCheck ? `<div style="font-size:11px;color:#64748b;">শেষ চেক: ${new Date(this.lastCheck).toLocaleString('bn-BD')}</div>` : ''}
                    </div>
                </div>
                <div id="health-issues-list" style="max-height:300px;overflow-y:auto;">
                    ${this.issues.length === 0
                        ? '<p style="color:#64748b;text-align:center;padding:20px;">কোনো সমস্যা পাওয়া যায়নি। সিস্টেম সুস্থ!</p>'
                        : this.renderIssuesList()
                    }
                </div>
                ${this.issues.some(i => i.fixable) ? `
                    <div style="margin-top:16px;text-align:center;">
                        <button id="btn-auto-fix" style="padding:8px 20px;border-radius:8px;border:none;background:#f59e0b;color:#0f172a;cursor:pointer;font-weight:600;">স্বয়ংক্রিয় সংশোধন (${this.issues.filter(i => i.fixable).length}টি)</button>
                    </div>
                ` : ''}
            </div>
        `;

        document.getElementById('btn-run-health-check').onclick = async () => {
            const list = document.getElementById('health-issues-list');
            list.innerHTML = '<p style="color:#94a3b8;text-align:center;">চেক চলছে...</p>';
            await this.runFullCheck();
            this.createHealthDashboard(containerId);
        };

        const fixBtn = document.getElementById('btn-auto-fix');
        if (fixBtn) {
            fixBtn.onclick = async () => {
                const fixable = this.issues.filter(i => i.fixable);
                await this.autoFixIssues(fixable);
                this.createHealthDashboard(containerId);
            };
        }
    },

    renderIssuesList() {
        const severityIcons = {
            error: '🔴',
            warning: '🟡',
            info: '🔵',
        };
        const severityColors = {
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
        };

        return this.issues.map(issue => `
            <div style="padding:10px;margin-bottom:6px;background:#1e293b;border-radius:8px;border-left:3px solid ${severityColors[issue.severity] || '#64748b'};">
                <div style="display:flex;justify-content:space-between;align-items:start;">
                    <div>
                        <span style="margin-right:6px;">${severityIcons[issue.severity] || '⚪'}</span>
                        <span style="color:#e2e8f0;font-size:13px;">${issue.message}</span>
                    </div>
                    <span style="font-size:11px;color:#64748b;white-space:nowrap;margin-left:8px;">${issue.category}</span>
                </div>
                ${issue.fixable ? '<span style="font-size:11px;color:#10b981;">সংশোধনযোগ্য</span>' : ''}
            </div>
        `).join('');
    },

    async autoFixIssues(issues) {
        let fixed = 0;

        for (const issue of issues) {
            try {
                switch (issue.fixType) {
                    case 'remove_empty':
                        document.querySelectorAll(issue.element).forEach(el => {
                            if (!el.textContent.trim()) el.remove();
                        });
                        fixed++;
                        break;

                    case 'remove_empty_entry': {
                        const store = this.getKnowledgeStore();
                        if (store) {
                            const key = issue.message.match(/: (.+)$/)?.[1];
                            if (key && store[key] && (!store[key].content || !store[key].content.trim())) {
                                delete store[key];
                                localStorage.setItem('sf_knowledge_store', JSON.stringify(store));
                                fixed++;
                            }
                        }
                        break;
                    }

                    case 'remove_orphan_ref': {
                        const ref = issue.message.match(/: (.+)$/)?.[1];
                        if (ref) {
                            const el = document.querySelector(`[data-ref="${ref}"]`);
                            if (el) {
                                el.remove();
                                fixed++;
                            }
                        }
                        break;
                    }

                    case 'placeholder_image':
                        document.querySelectorAll('img').forEach(img => {
                            if (!img.complete || img.naturalHeight === 0) {
                                img.style.background = '#1e293b';
                                img.style.minHeight = '100px';
                                img.alt = img.alt || 'ছবি পাওয়া যায়নি';
                            }
                        });
                        fixed++;
                        break;

                    default:
                        break;
                }
            } catch {}
        }

        this.issues = this.issues.filter(i => !i.fixable || !issues.includes(i));
        this.saveIssues();
        return fixed;
    },
};
