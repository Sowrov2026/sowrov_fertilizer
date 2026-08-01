// V19 Knowledge Suggestion Engine
// AI suggests new knowledge based on user interactions

export const SFSuggestions = {
    suggestions: [],
    stats: { total: 0, pending: 0, approved: 0, rejected: 0 },

    init() {
        this.loadFromStorage();
    },

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('sf_suggestions');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.suggestions = Array.isArray(parsed) ? parsed : [];
            }
            const statsStored = localStorage.getItem('sf_suggestion_stats');
            if (statsStored) {
                this.stats = JSON.parse(statsStored);
            }
            this.recalculateStats();
        } catch (e) {
            console.error('প্রস্তাব লোডে সমস্যা:', e);
        }
    },

    saveToStorage() {
        try {
            localStorage.setItem('sf_suggestions', JSON.stringify(this.suggestions.slice(-200)));
            this.recalculateStats();
            localStorage.setItem('sf_suggestion_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('প্রস্তাব সেভে সমস্যা:', e);
        }
    },

    recalculateStats() {
        this.stats.total = this.suggestions.length;
        this.stats.pending = this.suggestions.filter(s => s.status === 'pending').length;
        this.stats.approved = this.suggestions.filter(s => s.status === 'approved').length;
        this.stats.rejected = this.suggestions.filter(s => s.status === 'rejected').length;
    },

    createSuggestion(type, title, description, data = {}) {
        return {
            id: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type,
            title,
            description,
            data,
            status: 'pending',
            votes: 0,
            source: 'user',
            timestamp: new Date().toISOString()
        };
    },

    async analyzeSuggestions() {
        try {
            const res = await fetch('/api/v19/suggestions/analyze');
            if (res.ok) {
                const serverSuggestions = await res.json();
                if (Array.isArray(serverSuggestions)) {
                    serverSuggestions.forEach(sg => {
                        if (!this.suggestions.find(existing => existing.id === sg.id)) {
                            this.suggestions.push(sg);
                        }
                    });
                    this.saveToStorage();
                }
                return serverSuggestions;
            }
        } catch (e) {
            console.warn('বিশ্লেষণ সার্ভারে পাঠানো যায়নি');
        }
        return [];
    },

    async suggestFAQ(question, answer) {
        const suggestion = this.createSuggestion(
            'faq',
            question,
            answer,
            { question, answer }
        );

        this.suggestions.push(suggestion);
        this.saveToStorage();

        try {
            await fetch('/api/v19/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestion)
            });
        } catch (e) {
            console.warn('সার্ভারে প্রস্তাব পাঠানো যায়নি');
        }

        return suggestion;
    },

    async suggestCrop(cropName, details = {}) {
        const suggestion = this.createSuggestion(
            'crop',
            cropName,
            details.description || `নতুন ফসল: ${cropName}`,
            { cropName, ...details }
        );

        this.suggestions.push(suggestion);
        this.saveToStorage();

        try {
            await fetch('/api/v19/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestion)
            });
        } catch (e) {
            console.warn('সার্ভারে প্রস্তাব পাঠানো যায়নি');
        }

        return suggestion;
    },

    async suggestDisease(diseaseName, details = {}) {
        const suggestion = this.createSuggestion(
            'disease',
            diseaseName,
            details.description || `নতুন রোগ: ${diseaseName}`,
            { diseaseName, ...details }
        );

        this.suggestions.push(suggestion);
        this.saveToStorage();

        try {
            await fetch('/api/v19/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestion)
            });
        } catch (e) {
            console.warn('সার্ভারে প্রস্তাব পাঠানো যায়নি');
        }

        return suggestion;
    },

    async suggestChatgaiyaWord(word, meaning) {
        const suggestion = this.createSuggestion(
            'chatgaiya',
            word,
            `চাটগাইয়া শব্দ: ${word} = ${meaning}`,
            { word, meaning }
        );

        this.suggestions.push(suggestion);
        this.saveToStorage();

        try {
            await fetch('/api/v19/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestion)
            });
        } catch (e) {
            console.warn('সার্ভারে প্রস্তাব পাঠানো যায়নি');
        }

        return suggestion;
    },

    async suggestFertilizer(name, details = {}) {
        const suggestion = this.createSuggestion(
            'fertilizer',
            name,
            details.description || `নতুন সার: ${name}`,
            { name, ...details }
        );

        this.suggestions.push(suggestion);
        this.saveToStorage();

        try {
            await fetch('/api/v19/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestion)
            });
        } catch (e) {
            console.warn('সার্ভারে প্রস্তাব পাঠানো যায়নি');
        }

        return suggestion;
    },

    async suggestPest(name, details = {}) {
        const suggestion = this.createSuggestion(
            'pest',
            name,
            details.description || `নতুন পোকা: ${name}`,
            { name, ...details }
        );

        this.suggestions.push(suggestion);
        this.saveToStorage();

        try {
            await fetch('/api/v19/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(suggestion)
            });
        } catch (e) {
            console.warn('সার্ভারে প্রস্তাব পাঠানো যায়নি');
        }

        return suggestion;
    },

    async getSuggestions(filter = 'all') {
        try {
            const res = await fetch(`/api/v19/suggestions?filter=${filter}`);
            if (res.ok) {
                const serverSuggestions = await res.json();
                if (Array.isArray(serverSuggestions)) {
                    this.suggestions = serverSuggestions;
                    this.saveToStorage();
                    return serverSuggestions;
                }
            }
        } catch (e) {
            console.warn('সার্ভার থেকে প্রস্তাব আনা যায়নি');
        }

        if (filter === 'all') return [...this.suggestions];
        return this.suggestions.filter(s => s.status === filter);
    },

    getSuggestionStats() {
        this.recalculateStats();
        return { ...this.stats };
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    getStatusLabel(status) {
        const labels = {
            pending: 'অপেক্ষমান',
            approved: 'অনুমোদিত',
            rejected: 'প্রত্যাখ্যাত'
        };
        return labels[status] || status;
    },

    getStatusColor(status) {
        const colors = {
            pending: '#ff9800',
            approved: '#4caf50',
            rejected: '#f44336'
        };
        return colors[status] || '#999';
    },

    getTypeLabel(type) {
        const labels = {
            faq: 'প্রশ্নোত্তর',
            crop: 'ফসল',
            disease: 'রোগ',
            chatgaiya: 'চাটগাইয়া শব্দ',
            fertilizer: 'সার',
            pest: 'পোকা'
        };
        return labels[type] || type;
    },

    async voteSuggestion(id, direction) {
        const suggestion = this.suggestions.find(s => s.id === id);
        if (suggestion) {
            suggestion.votes = (suggestion.votes || 0) + (direction === 'up' ? 1 : -1);
            this.saveToStorage();
        }

        try {
            await fetch(`/api/v19/suggestions/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ direction })
            });
        } catch (e) {
            console.warn('ভোট পাঠানো যায়নি');
        }
    },

    async deleteSuggestion(id) {
        this.suggestions = this.suggestions.filter(s => s.id !== id);
        this.saveToStorage();

        try {
            await fetch(`/api/v19/suggestions/${id}`, { method: 'DELETE' });
        } catch (e) {
            console.warn('মুছে ফেলা যায়নি');
        }
    },

    createSuggestionsPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const stats = this.getSuggestionStats();
        const allSuggestions = [...this.suggestions].sort((a, b) => {
            const order = { pending: 0, approved: 1, rejected: 2 };
            return (order[a.status] || 3) - (order[b.status] || 3);
        });

        container.innerHTML = `
            <div style="font-family:sans-serif;direction:rtl;text-align:right;padding:16px;">
                <h3 style="margin-bottom:16px;color:#333;">জ্ঞান প্রস্তাব ইঞ্জিন</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;margin-bottom:20px;">
                    <div style="background:#f5f5f5;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#1976d2;">${stats.total}</div>
                        <div style="font-size:11px;color:#666;">মোট</div>
                    </div>
                    <div style="background:#fff3e0;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#ff9800;">${stats.pending}</div>
                        <div style="font-size:11px;color:#666;">অপেক্ষমান</div>
                    </div>
                    <div style="background:#e8f5e9;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#4caf50;">${stats.approved}</div>
                        <div style="font-size:11px;color:#666;">অনুমোদিত</div>
                    </div>
                    <div style="background:#ffebee;padding:12px;border-radius:8px;text-align:center;">
                        <div style="font-size:24px;font-weight:bold;color:#f44336;">${stats.rejected}</div>
                        <div style="font-size:11px;color:#666;">প্রত্যাখ্যাত</div>
                    </div>
                </div>
                <div id="sf-suggestions-list">
                    ${allSuggestions.length === 0 ? '<p style="color:#888;">কোনো প্রস্তাব নেই</p>' : allSuggestions.map(item => `
                        <div style="background:#fff;border:1px solid #e0e0e0;border-radius:8px;padding:12px;margin-bottom:8px;">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                                <div style="flex:1;">
                                    <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;background:${this.getStatusColor(item.status)}22;color:${this.getStatusColor(item.status)};border:1px solid ${this.getStatusColor(item.status)}44;">
                                        ${this.getStatusLabel(item.status)}
                                    </span>
                                    <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;background:#e3f2fd;color:#1976d2;margin-right:6px;">
                                        ${this.getTypeLabel(item.type)}
                                    </span>
                                </div>
                                <div style="font-size:11px;color:#aaa;">${item.timestamp ? new Date(item.timestamp).toLocaleDateString('bn-BD') : ''}</div>
                            </div>
                            <div style="font-weight:bold;margin-top:8px;">${this.escapeHtml(item.title)}</div>
                            <div style="font-size:13px;color:#555;margin-top:4px;">${this.escapeHtml(item.description)}</div>
                            <div style="display:flex;gap:6px;margin-top:8px;align-items:center;">
                                <button class="sf-sg-vote-up" data-id="${item.id}" style="padding:2px 8px;background:#e8f5e9;border:1px solid #c8e6c9;border-radius:4px;cursor:pointer;font-size:14px;" title="ভোট আপ">&#9650;</button>
                                <span style="font-size:12px;min-width:20px;text-align:center;">${item.votes || 0}</span>
                                <button class="sf-sg-vote-down" data-id="${item.id}" style="padding:2px 8px;background:#ffebee;border:1px solid #ffcdd2;border-radius:4px;cursor:pointer;font-size:14px;" title="ভোট ডাউন">&#9660;</button>
                                <button class="sf-sg-delete" data-id="${item.id}" style="margin-right:auto;padding:2px 8px;background:#f5f5f5;border:1px solid #ddd;border-radius:4px;cursor:pointer;font-size:12px;color:#f44336;" title="মুছুন">মুছুন</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
                    <button id="sf-analyze-btn" style="padding:8px 16px;background:#1976d2;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">বিশ্লেষণ করুন</button>
                    <button id="sf-export-sg-btn" style="padding:8px 16px;background:#666;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">এক্সপোর্ট</button>
                </div>
            </div>
        `;

        container.querySelectorAll('.sf-sg-vote-up').forEach(btn => {
            btn.addEventListener('click', () => {
                this.voteSuggestion(btn.dataset.id, 'up');
                this.createSuggestionsPanel(containerId);
            });
        });

        container.querySelectorAll('.sf-sg-vote-down').forEach(btn => {
            btn.addEventListener('click', () => {
                this.voteSuggestion(btn.dataset.id, 'down');
                this.createSuggestionsPanel(containerId);
            });
        });

        container.querySelectorAll('.sf-sg-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('আপনি কি এই প্রস্তাব মুছে ফেলতে চান?')) {
                    this.deleteSuggestion(btn.dataset.id);
                    this.createSuggestionsPanel(containerId);
                }
            });
        });

        document.getElementById('sf-analyze-btn')?.addEventListener('click', async () => {
            await this.analyzeSuggestions();
            this.createSuggestionsPanel(containerId);
        });

        document.getElementById('sf-export-sg-btn')?.addEventListener('click', () => {
            this.exportSuggestions();
        });
    },

    exportSuggestions() {
        const headers = ['আইডি', 'ধরন', 'শিরোনাম', 'বিবরণ', 'স্ট্যাটাস', 'ভোট', 'সময়'];
        const rows = this.suggestions.map(s => [
            s.id, this.getTypeLabel(s.type), s.title, s.description,
            this.getStatusLabel(s.status), s.votes || 0, s.timestamp
        ]);

        const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `suggestions_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

window.SFSuggestions = SFSuggestions;
