// V19 Admin Review Panel
// Comprehensive admin dashboard for AI self-learning review

export const SFAdmin = {
    currentTab: 'pending',
    data: {
        pending: [],
        wrongAnswers: [],
        popular: [],
        missing: [],
        feedback: [],
        suggestions: [],
        health: null,
        monthly: null
    },

    async init() {
        await this.loadDashboard();
    },

    async loadDashboard() {
        try {
            const [pendingRes, wrongRes, popularRes, missingRes, feedbackRes, healthRes] = await Promise.allSettled([
                fetch('/api/v19-api?action=get_unanswered&status=pending'),
                fetch('/api/v19-api?action=get_unanswered&status=wrong'),
                fetch('/api/v19-api?action=get_popular'),
                fetch('/api/v19-api?action=get_unanswered&status=missing'),
                fetch('/api/v19-api?action=feedback_stats'),
                fetch('/api/v19-api?action=health_check')
            ]);

            if (pendingRes.status === 'fulfilled' && pendingRes.value.ok) {
                this.data.pending = await pendingRes.value.json();
            }
            if (wrongRes.status === 'fulfilled' && wrongRes.value.ok) {
                this.data.wrongAnswers = await wrongRes.value.json();
            }
            if (popularRes.status === 'fulfilled' && popularRes.value.ok) {
                this.data.popular = await popularRes.value.json();
            }
            if (missingRes.status === 'fulfilled' && missingRes.value.ok) {
                this.data.missing = await missingRes.value.json();
            }
            if (feedbackRes.status === 'fulfilled' && feedbackRes.value.ok) {
                this.data.feedback = await feedbackRes.value.json();
            }
            if (healthRes.status === 'fulfilled' && healthRes.value.ok) {
                this.data.health = await healthRes.value.json();
            }
        } catch (e) {
            console.error('ড্যাশবোর্ড লোডে সমস্যা:', e);
        }
    },

    async loadPendingQuestions() {
        try {
            const res = await fetch('/api/v19-api?action=get_unanswered&status=pending');
            if (res.ok) this.data.pending = await res.json();
        } catch (e) { console.error(e); }
        return this.data.pending;
    },

    async loadWrongAnswers() {
        try {
            const res = await fetch('/api/v19-api?action=get_unanswered&status=wrong');
            if (res.ok) this.data.wrongAnswers = await res.json();
        } catch (e) { console.error(e); }
        return this.data.wrongAnswers;
    },

    async loadPopularQuestions() {
        try {
            const res = await fetch('/api/v19-api?action=get_popular');
            if (res.ok) this.data.popular = await res.json();
        } catch (e) { console.error(e); }
        return this.data.popular;
    },

    async loadMissingKnowledge() {
        try {
            const res = await fetch('/api/v19-api?action=get_unanswered&status=missing');
            if (res.ok) this.data.missing = await res.json();
        } catch (e) { console.error(e); }
        return this.data.missing;
    },

    async loadFeedbackDashboard() {
        try {
            const res = await fetch('/api/v19-api?action=feedback_stats');
            if (res.ok) this.data.feedback = await res.json();
        } catch (e) { console.error(e); }
        return this.data.feedback;
    },

    async loadKnowledgeSuggestions() {
        try {
            const res = await fetch('/api/v19-api?action=get_suggestions');
            if (res.ok) this.data.suggestions = await res.json();
        } catch (e) { console.error(e); }
        return this.data.suggestions;
    },

    async loadHealthCheck() {
        try {
            const res = await fetch('/api/v19-api?action=health_check');
            if (res.ok) this.data.health = await res.json();
        } catch (e) { console.error(e); }
        return this.data.health;
    },

    async loadMonthlyReport() {
        try {
            const res = await fetch('/api/v19-api?action=monthly_report');
            if (res.ok) this.data.monthly = await res.json();
        } catch (e) { console.error(e); }
        return this.data.monthly;
    },

    async reviewSuggestion(id, status) {
        try {
            const res = await fetch('/api/v19-api?action=update_suggestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                this.data.suggestions = this.data.suggestions.filter(s => s.id !== id);
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    },

    async markAnswered(id) {
        try {
            const res = await fetch('/api/v19-api?action=update_unanswered', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'answered' })
            });
            if (res.ok) {
                this.data.pending = this.data.pending.filter(p => p.id !== id);
                return true;
            }
        } catch (e) { console.error(e); }
        return false;
    },

    exportData(type) {
        let data, filename;
        switch (type) {
            case 'pending':
                data = this.data.pending;
                filename = 'pending-questions';
                break;
            case 'wrong':
                data = this.data.wrongAnswers;
                filename = 'wrong-answers';
                break;
            case 'popular':
                data = this.data.popular;
                filename = 'popular-questions';
                break;
            case 'missing':
                data = this.data.missing;
                filename = 'missing-knowledge';
                break;
            case 'suggestions':
                data = this.data.suggestions;
                filename = 'suggestions';
                break;
            case 'feedback':
                data = this.data.feedback;
                filename = 'feedback-stats';
                break;
            default:
                data = this.data;
                filename = 'full-export';
        }

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `v19-${filename}-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    createAdminPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tabs = [
            { id: 'pending', label: 'অপেক্ষমান প্রশ্ন' },
            { id: 'wrong', label: 'ভুল উত্তর' },
            { id: 'popular', label: 'জনপ্রিয় প্রশ্ন' },
            { id: 'missing', label: 'অনুপস্থিত জ্ঞান' },
            { id: 'feedback', label: 'ফিডব্যাক' },
            { id: 'suggestions', label: 'জ্ঞান প্রস্তাব' },
            { id: 'health', label: 'স্বাস্থ্য পরীক্ষা' },
            { id: 'monthly', label: 'মাসিক রিপোর্ট' }
        ];

        container.innerHTML = `
            <div style="font-family:sans-serif;direction:rtl;text-align:right;padding:16px;">
                <h2 style="margin-bottom:16px;color:#333;">V19 অ্যাডমিন প্যানেল</h2>
                <div class="sf-admin-tabs" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px;border-bottom:2px solid #e0e0e0;padding-bottom:8px;">
                    ${tabs.map(t => `
                        <button class="sf-admin-tab" data-tab="${t.id}"
                            style="padding:8px 14px;border:1px solid #ccc;border-radius:6px 6px 0 0;background:${this.currentTab === t.id ? '#1976d2' : '#f5f5f5'};
                            color:${this.currentTab === t.id ? '#fff' : '#333'};cursor:pointer;font-size:13px;transition:all .2s;">
                            ${t.label}
                        </button>
                    `).join('')}
                </div>
                <div id="sf-admin-content" style="min-height:400px;"></div>
            </div>
        `;

        container.querySelectorAll('.sf-admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentTab = tab.dataset.tab;
                container.querySelectorAll('.sf-admin-tab').forEach(t => {
                    t.style.background = '#f5f5f5';
                    t.style.color = '#333';
                });
                tab.style.background = '#1976d2';
                tab.style.color = '#fff';
                this.renderTabContent();
            });
        });

        this.renderTabContent();
    },

    renderTabContent() {
        const content = document.getElementById('sf-admin-content');
        if (!content) return;

        switch (this.currentTab) {
            case 'pending':
                this.renderPendingPanel(content);
                break;
            case 'wrong':
                this.renderWrongPanel(content);
                break;
            case 'popular':
                this.renderPopularPanel(content);
                break;
            case 'missing':
                this.renderMissingPanel(content);
                break;
            case 'feedback':
                this.renderFeedbackPanel(content);
                break;
            case 'suggestions':
                this.renderSuggestionsPanel(content);
                break;
            case 'health':
                this.renderHealthPanel(content);
                break;
            case 'monthly':
                this.renderMonthlyPanel(content);
                break;
        }
    },

    renderPendingPanel(content) {
        const items = this.data.pending;
        if (!items.length) {
            content.innerHTML = '<p style="color:#888;">কোনো অপেক্ষমান প্রশ্ন নেই</p>';
            return;
        }
        content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-weight:bold;">${items.length}টি প্রশ্ন অপেক্ষমান</span>
                <button onclick="SFAdmin.exportData('pending')" style="padding:6px 12px;background:#666;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">এক্সপোর্ট</button>
            </div>
            ${items.map(item => `
                <div class="sf-admin-card" style="background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;padding:12px;margin-bottom:8px;">
                    <div style="font-weight:bold;margin-bottom:4px;">${this.escapeHtml(item.question)}</div>
                    <div style="font-size:12px;color:#888;">${item.timestamp || 'সময় নেই'} | ভাষা: ${item.language || 'bn'}</div>
                    <div style="margin-top:8px;display:flex;gap:6px;">
                        <button class="sf-mark-answered" data-id="${item.id}" style="padding:4px 10px;background:#4caf50;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">উত্তর দেওয়া হয়েছে</button>
                    </div>
                </div>
            `).join('')}
        `;
        content.querySelectorAll('.sf-mark-answered').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (await this.markAnswered(id)) {
                    this.renderPendingPanel(content);
                }
            });
        });
    },

    renderWrongPanel(content) {
        const items = this.data.wrongAnswers;
        if (!items.length) {
            content.innerHTML = '<p style="color:#888;">কোনো ভুল উত্তর নেই</p>';
            return;
        }
        content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-weight:bold;">${items.length}টি ভুল উত্তর</span>
                <button onclick="SFAdmin.exportData('wrong')" style="padding:6px 12px;background:#666;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">এক্সপোর্ট</button>
            </div>
            ${items.map(item => `
                <div style="background:#fff3e0;border:1px solid #ffe0b2;border-radius:8px;padding:12px;margin-bottom:8px;">
                    <div style="font-weight:bold;color:#e65100;">প্রশ্ন: ${this.escapeHtml(item.question)}</div>
                    <div style="color:#d32f2f;margin-top:4px;">ভুল উত্তর: ${this.escapeHtml(item.wrongAnswer || '')}</div>
                    <div style="color:#4caf50;margin-top:4px;">সঠিক উত্তর: ${this.escapeHtml(item.correctAnswer || 'নির্ধারিত হয়নি')}</div>
                    <div style="font-size:12px;color:#888;margin-top:4px;">বারবার জিজ্ঞাসা: ${item.askCount || 1} বার</div>
                </div>
            `).join('')}
        `;
    },

    renderPopularPanel(content) {
        const items = this.data.popular;
        if (!items.length) {
            content.innerHTML = '<p style="color:#888;">তথ্য পাওয়া যায়নি</p>';
            return;
        }
        content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-weight:bold;">জনপ্রিয় প্রশ্নসমূহ</span>
                <button onclick="SFAdmin.exportData('popular')" style="padding:6px 12px;background:#666;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">এক্সপোর্ট</button>
            </div>
            ${items.map((item, i) => `
                <div style="background:#e3f2fd;border:1px solid #bbdefb;border-radius:8px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">
                    <div style="background:#1976d2;color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:bold;flex-shrink:0;">${i + 1}</div>
                    <div style="flex:1;">
                        <div style="font-weight:bold;">${this.escapeHtml(item.question)}</div>
                        <div style="font-size:12px;color:#888;">${item.count || 0} বার জিজ্ঞাসা</div>
                    </div>
                </div>
            `).join('')}
        `;
    },

    renderMissingPanel(content) {
        const items = this.data.missing;
        if (!items.length) {
            content.innerHTML = '<p style="color:#888;">অনুপস্থিত জ্ঞান নেই</p>';
            return;
        }
        content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-weight:bold;">${items.length}টি অনুপস্থিত জ্ঞান</span>
                <button onclick="SFAdmin.exportData('missing')" style="padding:6px 12px;background:#666;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">এক্সপোর্ট</button>
            </div>
            ${items.map(item => `
                <div style="background:#fce4ec;border:1px solid #f8bbd0;border-radius:8px;padding:12px;margin-bottom:8px;">
                    <div style="font-weight:bold;">${this.escapeHtml(item.topic || item.question)}</div>
                    <div style="font-size:12px;color:#888;">${item.count || 1} বার অনুরোধ</div>
                    <div style="font-size:12px;color:#666;margin-top:4px;">শ্রেণী: ${item.category || 'অজানা'}</div>
                </div>
            `).join('')}
        `;
    },

    renderFeedbackPanel(content) {
        const stats = this.data.feedback;
        content.innerHTML = `
            <div style="font-weight:bold;margin-bottom:12px;">ফিডব্যাক সারসংক্ষেপ</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:16px;">
                <div style="background:#e8f5e9;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:24px;font-weight:bold;color:#4caf50;">${stats.positive || 0}</div>
                    <div style="font-size:12px;">ভালো</div>
                </div>
                <div style="background:#ffebee;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:24px;font-weight:bold;color:#f44336;">${stats.negative || 0}</div>
                    <div style="font-size:12px;">খারাপ</div>
                </div>
                <div style="background:#e3f2fd;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:24px;font-weight:bold;color:#1976d2;">${stats.total || 0}</div>
                    <div style="font-size:12px;">মোট</div>
                </div>
                <div style="background:#fff3e0;padding:12px;border-radius:8px;text-align:center;">
                    <div style="font-size:24px;font-weight:bold;color:#ff9800;">${stats.satisfactionRate || 0}%</div>
                    <div style="font-size:12px;">সন্তুষ্টি</div>
                </div>
            </div>
        `;
    },

    async renderSuggestionsPanel(content) {
        await this.loadKnowledgeSuggestions();
        const items = this.data.suggestions;
        content.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="font-weight:bold;">${items.length}টি জ্ঞান প্রস্তাব</span>
                <button onclick="SFAdmin.exportData('suggestions')" style="padding:6px 12px;background:#666;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">এক্সপোর্ট</button>
            </div>
            ${items.length === 0 ? '<p style="color:#888;">নতুন প্রস্তাব নেই</p>' : items.map(item => `
                <div style="background:#f3e5f5;border:1px solid #ce93d8;border-radius:8px;padding:12px;margin-bottom:8px;">
                    <div style="font-weight:bold;">${this.escapeHtml(item.title || item.question)}</div>
                    <div style="font-size:13px;color:#555;margin-top:4px;">${this.escapeHtml(item.description || '')}</div>
                    <div style="font-size:12px;color:#888;margin-top:4px;">ধরন: ${item.type || 'অজানা'} | ${item.timestamp || ''}</div>
                    <div style="margin-top:8px;display:flex;gap:6px;">
                        <button class="sf-approve-suggestion" data-id="${item.id}" style="padding:4px 10px;background:#4caf50;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">অনুমোদন</button>
                        <button class="sf-reject-suggestion" data-id="${item.id}" style="padding:4px 10px;background:#f44336;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">বাতিল</button>
                    </div>
                </div>
            `).join('')}
        `;
        content.querySelectorAll('.sf-approve-suggestion').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (await this.reviewSuggestion(btn.dataset.id, 'approved')) {
                    this.renderSuggestionsPanel(content);
                }
            });
        });
        content.querySelectorAll('.sf-reject-suggestion').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (await this.reviewSuggestion(btn.dataset.id, 'rejected')) {
                    this.renderSuggestionsPanel(content);
                }
            });
        });
    },

    renderHealthPanel(content) {
        const h = this.data.health;
        const statusColor = h && h.status === 'healthy' ? '#4caf50' : '#f44336';
        content.innerHTML = `
            <div style="font-weight:bold;margin-bottom:12px;">সিস্টেম স্বাস্থ্য</div>
            ${h ? `
                <div style="background:${statusColor}15;border:2px solid ${statusColor};border-radius:8px;padding:16px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                        <div style="width:12px;height:12px;border-radius:50%;background:${statusColor};"></div>
                        <span style="font-weight:bold;font-size:16px;">${h.status === 'healthy' ? 'স্বাস্থ্যবিধি' : 'সমস্যা আছে'}</span>
                    </div>
                    <div style="font-size:13px;">
                        <div>নলেজ সাইজ: ${h.knowledgeSize || 'অজানা'} এনট্রি</div>
                        <div>শেষ আপডেট: ${h.lastUpdate || 'অজানা'}</div>
                        <div>API স্ট্যাটাস: ${h.apiStatus || 'অজানা'}</div>
                        <div>ডাটাবেজ: ${h.dbStatus || 'অজানা'}</div>
                        <div>মেমরি ব্যবহার: ${h.memoryUsage || 'অজানা'}</div>
                    </div>
                </div>
            ` : '<p style="color:#888;">স্বাস্থ্য তথ্য লোড হয়নি</p>'}
        `;
    },

    renderMonthlyPanel(content) {
        const m = this.data.monthly;
        content.innerHTML = `
            <div style="font-weight:bold;margin-bottom:12px;">মাসিক রিপোর্ট</div>
            ${m ? `
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
                    <div style="background:#e3f2fd;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:22px;font-weight:bold;color:#1976d2;">${m.totalQuestions || 0}</div>
                        <div style="font-size:12px;">মোট প্রশ্ন</div>
                    </div>
                    <div style="background:#e8f5e9;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:22px;font-weight:bold;color:#4caf50;">${m.answered || 0}</div>
                        <div style="font-size:12px;">উত্তর দেওয়া</div>
                    </div>
                    <div style="background:#fff3e0;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:22px;font-weight:bold;color:#ff9800;">${m.unanswered || 0}</div>
                        <div style="font-size:12px;">উত্তরহীন</div>
                    </div>
                    <div style="background:#f3e5f5;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:22px;font-weight:bold;color:#9c27b0;">${m.suggestionsMade || 0}</div>
                        <div style="font-size:12px;">প্রস্তাব</div>
                    </div>
                </div>
                <div style="margin-top:16px;">
                    <div style="font-weight:bold;margin-bottom:8px;">শীর্ষ ফসল</div>
                    ${(m.topCrops || []).map(c => `<div style="padding:4px 0;font-size:13px;">${c.name}: ${c.count} বার</div>`).join('') || '<div style="color:#888;font-size:13px;">তথ্য নেই</div>'}
                </div>
            ` : '<p style="color:#888;">রিপোর্ট লোড হয়নি</p>'}
        `;
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

window.SFAdmin = SFAdmin;
