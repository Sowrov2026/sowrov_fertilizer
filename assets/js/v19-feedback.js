// V19 User Feedback Learning
// Adds thumbs up/down buttons to bot messages

export const SFFeedback = {
    feedbackHistory: [],
    stats: { total: 0, positive: 0, negative: 0 },

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
    },

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('sf_feedback_history');
            if (stored) {
                this.feedbackHistory = JSON.parse(stored);
            }
            const statsStored = localStorage.getItem('sf_feedback_stats');
            if (statsStored) {
                this.stats = JSON.parse(statsStored);
            }
        } catch (e) {
            console.error('ফিডব্যাক লোডে সমস্যা:', e);
        }
    },

    saveToStorage() {
        try {
            localStorage.setItem('sf_feedback_history', JSON.stringify(this.feedbackHistory.slice(-500)));
            localStorage.setItem('sf_feedback_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('ফিডব্যাক সেভে সমস্যা:', e);
        }
    },

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.sf-feedback-btn');
            if (!btn) return;

            const rating = btn.dataset.rating;
            const messageEl = btn.closest('.sf-bot-message, .chat-message');
            if (!messageEl) return;

            const questionData = {
                question: messageEl.dataset.question || '',
                answer: messageEl.querySelector('.message-text')?.textContent || '',
                rating: rating,
                language: messageEl.dataset.language || 'bn',
                crop: messageEl.dataset.crop || '',
                confidence: parseFloat(messageEl.dataset.confidence) || 0,
                timestamp: new Date().toISOString()
            };

            this.submitFeedback(
                questionData.question,
                questionData.answer,
                rating,
                questionData
            );

            btn.closest('.sf-feedback-buttons')?.querySelectorAll('.sf-feedback-btn').forEach(b => {
                b.classList.remove('active');
                b.disabled = true;
            });
            btn.classList.add('active');

            const thankEl = document.createElement('span');
            thankEl.className = 'sf-feedback-thanks';
            thankEl.textContent = 'ধন্যবাদ!';
            thankEl.style.cssText = 'color:#4caf50;margin-left:8px;font-size:13px;';
            btn.parentNode.appendChild(thankEl);
        });
    },

    addFeedbackButtons(messageElement, questionData = {}) {
        if (!messageElement || messageElement.querySelector('.sf-feedback-buttons')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'sf-feedback-buttons';
        wrapper.style.cssText = 'display:flex;align-items:center;gap:6px;margin-top:8px;';

        const btnUp = document.createElement('button');
        btnUp.className = 'sf-feedback-btn';
        btnUp.dataset.rating = 'positive';
        btnUp.innerHTML = '&#128077;';
        btnUp.title = 'ভালো উত্তর';
        btnUp.style.cssText = 'background:none;border:1px solid #ccc;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;transition:all .2s;';

        const btnDown = document.createElement('button');
        btnDown.className = 'sf-feedback-btn';
        btnDown.dataset.rating = 'negative';
        btnDown.innerHTML = '&#128078;';
        btnDown.title = 'খারাপ উত্তর';
        btnDown.style.cssText = 'background:none;border:1px solid #ccc;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;transition:all .2s;';

        if (questionData.question) {
            messageElement.dataset.question = questionData.question;
        }
        if (questionData.language) {
            messageElement.dataset.language = questionData.language;
        }
        if (questionData.crop) {
            messageElement.dataset.crop = questionData.crop;
        }
        if (questionData.confidence) {
            messageElement.dataset.confidence = questionData.confidence;
        }

        wrapper.appendChild(btnUp);
        wrapper.appendChild(btnDown);
        messageElement.appendChild(wrapper);

        const hoverStyle = 'background:#e8f5e9;border-color:#4caf50;';
        [btnUp, btnDown].forEach(btn => {
            btn.addEventListener('mouseenter', () => btn.style.cssText += hoverStyle);
            btn.addEventListener('mouseleave', () => {
                if (!btn.classList.contains('active')) {
                    btn.style.cssText = 'background:none;border:1px solid #ccc;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;transition:all .2s;';
                }
            });
        });
    },

    async submitFeedback(question, answer, rating, metadata = {}) {
        const feedbackEntry = {
            id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            question,
            answer,
            rating,
            language: metadata.language || 'bn',
            crop: metadata.crop || '',
            confidence: metadata.confidence || 0,
            timestamp: new Date().toISOString(),
            sent: false
        };

        this.feedbackHistory.push(feedbackEntry);
        this.stats.total++;
        if (rating === 'positive') this.stats.positive++;
        if (rating === 'negative') this.stats.negative++;
        this.saveToStorage();

        try {
            const response = await fetch('/api/v19/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackEntry)
            });
            if (response.ok) {
                feedbackEntry.sent = true;
                this.saveToStorage();
            }
        } catch (e) {
            console.warn('ফিডব্যাক পাঠানো যায়নি, পরে আবার চেষ্টা করা হবে');
        }

        return feedbackEntry;
    },

    getFeedbackHistory() {
        return [...this.feedbackHistory];
    },

    async getSatisfactionStats() {
        const localStats = {
            total: this.stats.total,
            positive: this.stats.positive,
            negative: this.stats.negative,
            satisfactionRate: this.stats.total > 0
                ? Math.round((this.stats.positive / this.stats.total) * 100)
                : 0,
            unsent: this.feedbackHistory.filter(f => !f.sent).length
        };

        try {
            const response = await fetch('/api/v19/feedback/stats');
            if (response.ok) {
                const serverStats = await response.json();
                return { ...localStats, ...serverStats };
            }
        } catch (e) {
            console.warn('সার্ভার থেকে পরিসংখ্যান আনা যায়নি');
        }

        return localStats;
    },

    async retryUnsentFeedback() {
        const unsent = this.feedbackHistory.filter(f => !f.sent);
        for (const fb of unsent) {
            try {
                const response = await fetch('/api/v19/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fb)
                });
                if (response.ok) fb.sent = true;
            } catch (e) {
                break;
            }
        }
        this.saveToStorage();
    },

    async createFeedbackStatsPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const stats = await this.getSatisfactionStats();

        container.innerHTML = `
            <div style="font-family:sans-serif;direction:rtl;text-align:right;padding:16px;">
                <h3 style="margin-bottom:16px;color:#333;">ফিডব্যাক পরিসংখ্যান</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
                    <div style="background:#f5f5f5;padding:14px;border-radius:8px;text-align:center;">
                        <div style="font-size:28px;font-weight:bold;color:#1976d2;">${stats.total}</div>
                        <div style="font-size:13px;color:#666;">মোট ফিডব্যাক</div>
                    </div>
                    <div style="background:#e8f5e9;padding:14px;border-radius:8px;text-align:center;">
                        <div style="font-size:28px;font-weight:bold;color:#4caf50;">${stats.positive}</div>
                        <div style="font-size:13px;color:#666;">ভালো (${stats.satisfactionRate}%)</div>
                    </div>
                    <div style="background:#ffebee;padding:14px;border-radius:8px;text-align:center;">
                        <div style="font-size:28px;font-weight:bold;color:#f44336;">${stats.negative}</div>
                        <div style="font-size:13px;color:#666;">খারাপ</div>
                    </div>
                    <div style="background:#fff3e0;padding:14px;border-radius:8px;text-align:center;">
                        <div style="font-size:28px;font-weight:bold;color:#ff9800;">${stats.unsent || 0}</div>
                        <div style="font-size:13px;color:#666;">অপ্রেরিত</div>
                    </div>
                </div>
                <div style="margin-bottom:16px;">
                    <div style="background:#e0e0e0;border-radius:10px;height:24px;overflow:hidden;">
                        <div style="background:linear-gradient(90deg,#4caf50,#81c784);height:100%;width:${stats.satisfactionRate}%;border-radius:10px;transition:width .5s;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;">
                            ${stats.satisfactionRate}%
                        </div>
                    </div>
                    <div style="text-align:center;margin-top:4px;font-size:12px;color:#888;">সন্তুষ্টির হার</div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button id="sf-retry-unsent" style="padding:8px 16px;background:#1976d2;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
                        অপ্রেরিত আবার পাঠান
                    </button>
                    <button id="sf-export-feedback" style="padding:8px 16px;background:#666;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
                        CSV ডাউনলোড
                    </button>
                    <button id="sf-clear-feedback" style="padding:8px 16px;background:#f44336;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
                        সব মুছুন
                    </button>
                </div>
            </div>
        `;

        document.getElementById('sf-retry-unsent')?.addEventListener('click', async () => {
            await this.retryUnsentFeedback();
            this.createFeedbackStatsPanel(containerId);
        });

        document.getElementById('sf-export-feedback')?.addEventListener('click', () => {
            this.exportFeedbackCSV();
        });

        document.getElementById('sf-clear-feedback')?.addEventListener('click', () => {
            if (confirm('আপনি কি সব ফিডব্যাক মুছে ফেলতে চান?')) {
                this.feedbackHistory = [];
                this.stats = { total: 0, positive: 0, negative: 0 };
                this.saveToStorage();
                this.createFeedbackStatsPanel(containerId);
            }
        });
    },

    exportFeedbackCSV() {
        const headers = ['আইডি', 'প্রশ্ন', 'উত্তর', 'রেটিং', 'ভাষা', 'ফসল', 'কনফিডেন্স', 'সময়'];
        const rows = this.feedbackHistory.map(f => [
            f.id, f.question, f.answer, f.rating === 'positive' ? 'ভালো' : 'খারাপ',
            f.language, f.crop, f.confidence, f.timestamp
        ]);

        const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
};
