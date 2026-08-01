export const SFSelfLearning = {
    STORAGE_KEYS: {
        UNKNOWN: 'sf_unknown_questions',
        POPULAR: 'sf_popular_questions',
        FEEDBACK: 'sf_feedback',
    },

    init() {
        this._ensureStorage();
        return this;
    },

    _ensureStorage() {
        Object.values(this.STORAGE_KEYS).forEach((key) => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    },

    _get(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    },

    _set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    _normalize(text) {
        return text.toLowerCase().replace(/[?।!.,;:'"()\[\]{}]/g, '').trim();
    },

    _wordOverlap(a, b) {
        const wordsA = new Set(this._normalize(a).split(/\s+/));
        const wordsB = new Set(this._normalize(b).split(/\s+/));
        let overlap = 0;
        wordsA.forEach((w) => { if (wordsB.has(w)) overlap++; });
        return overlap;
    },

    _findExistingIndex(array, question) {
        const norm = this._normalize(question);
        return array.findIndex((item) => this._normalize(item.question) === norm);
    },

    _findSimilarIndex(array, question) {
        return array.findIndex((item) => this._wordOverlap(item.question, question) > 3);
    },

    recordUnknownQuestion(question, context = '', language = 'bn') {
        const unknowns = this._get(this.STORAGE_KEYS.UNKNOWN);
        const similarIdx = this._findSimilarIndex(unknowns, question);
        const now = new Date().toISOString();

        if (similarIdx !== -1) {
            unknowns[similarIdx].count++;
            unknowns[similarIdx].lastSeen = now;
        } else {
            unknowns.push({ question, context, language, count: 1, lastSeen: now });
        }

        this._set(this.STORAGE_KEYS.UNKNOWN, unknowns);
    },

    recordSuccessfulQuestion(question, answer, confidence = 0) {
        if (confidence >= 0.7) {
            const populars = this._get(this.STORAGE_KEYS.POPULAR);
            const idx = this._findExistingIndex(populars, question);
            const now = new Date().toISOString();

            if (idx !== -1) {
                populars[idx].count++;
                populars[idx].totalConfidence += confidence;
                populars[idx].avgConfidence = populars[idx].totalConfidence / populars[idx].count;
                populars[idx].lastSeen = now;
            } else {
                populars.push({
                    question,
                    answer,
                    count: 1,
                    totalConfidence: confidence,
                    avgConfidence: confidence,
                    lastSeen: now,
                });
            }

            this._set(this.STORAGE_KEYS.POPULAR, populars);
        }

        if (confidence < 0.5) {
            this.recordUnknownQuestion(question, '', 'bn');
        }
    },

    recordFeedback(question, rating, comment = '') {
        const feedback = this._get(this.STORAGE_KEYS.FEEDBACK);
        feedback.push({
            question,
            rating,
            comment,
            timestamp: new Date().toISOString(),
        });
        this._set(this.STORAGE_KEYS.FEEDBACK, feedback);
    },

    getUnknownQuestions(limit = 20) {
        const unknowns = this._get(this.STORAGE_KEYS.UNKNOWN);
        return unknowns
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    getPopularQuestions(limit = 20) {
        const populars = this._get(this.STORAGE_KEYS.POPULAR);
        return populars
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    },

    getQuestionsNeedingImprovement(limit = 20) {
        const feedback = this._get(this.STORAGE_KEYS.FEEDBACK);
        const questionRatings = {};

        feedback.forEach((item) => {
            const key = this._normalize(item.question);
            if (!questionRatings[key]) {
                questionRatings[key] = { question: item.question, ratings: [], totalRating: 0 };
            }
            questionRatings[key].ratings.push(item.rating);
            questionRatings[key].totalRating += item.rating;
        });

        return Object.values(questionRatings)
            .map((item) => ({
                question: item.question,
                avgRating: item.totalRating / item.ratings.length,
                feedbackCount: item.ratings.length,
            }))
            .sort((a, b) => a.avgRating - b.avgRating)
            .slice(0, limit);
    },

    getStats() {
        const unknowns = this._get(this.STORAGE_KEYS.UNKNOWN);
        const populars = this._get(this.STORAGE_KEYS.POPULAR);
        const feedback = this._get(this.STORAGE_KEYS.FEEDBACK);

        const avgRating = feedback.length
            ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
            : 0;

        return {
            unknownCount: unknowns.length,
            unknownTotal: unknowns.reduce((sum, u) => sum + u.count, 0),
            popularCount: populars.length,
            popularTotal: populars.reduce((sum, p) => sum + p.count, 0),
            feedbackCount: feedback.length,
            avgRating: Math.round(avgRating * 100) / 100,
        };
    },

    mergeSimilarQuestions() {
        const unknowns = this._get(this.STORAGE_KEYS.UNKNOWN);
        const merged = [];
        const used = new Set();

        for (let i = 0; i < unknowns.length; i++) {
            if (used.has(i)) continue;

            const group = { ...unknowns[i] };

            for (let j = i + 1; j < unknowns.length; j++) {
                if (used.has(j)) continue;

                if (this._wordOverlap(group.question, unknowns[j].question) > 3) {
                    group.count += unknowns[j].count;
                    if (new Date(unknowns[j].lastSeen) > new Date(group.lastSeen)) {
                        group.lastSeen = unknowns[j].lastSeen;
                    }
                    used.add(j);
                }
            }

            merged.push(group);
        }

        this._set(this.STORAGE_KEYS.UNKNOWN, merged);
        return merged.length < unknowns.length;
    },

    getSuggestions() {
        const suggestions = [];
        const unknowns = this._get(this.STORAGE_KEYS.UNKNOWN);
        const populars = this._get(this.STORAGE_KEYS.POPULAR);
        const feedback = this._get(this.STORAGE_KEYS.FEEDBACK);

        const highCountUnknowns = unknowns
            .filter((u) => u.count >= 3)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        highCountUnknowns.forEach((item) => {
            suggestions.push({
                type: 'add_knowledge',
                priority: 'high',
                question: item.question,
                message: `"${item.question}" প্রশ্ন ${item.count} বার জিজ্ঞাসা করা হয়েছে কিন্তু উত্তর দেওয়া যায়নি।`,
            });
        });

        const lowRated = this.getQuestionsNeedingImprovement(5);
        lowRated.forEach((item) => {
            suggestions.push({
                type: 'improve_answer',
                priority: 'medium',
                question: item.question,
                message: `"${item.question}" এর গড় রেটিং ${item.avgRating.toFixed(1)} (${item.feedbackCount} টি ফিডব্যাক)।`,
            });
        });

        const popularNoFeedback = populars.filter((p) => {
            return !feedback.some((f) => this._normalize(f.question) === this._normalize(p.question));
        });

        popularNoFeedback.slice(0, 3).forEach((item) => {
            suggestions.push({
                type: 'collect_feedback',
                priority: 'low',
                question: item.question,
                message: `"${item.question}" জনপ্রিয় প্রশ্ন (${item.count} বার জিজ্ঞাসিত) কিন্তু কোনো ফিডব্যাক নেই।`,
            });
        });

        return suggestions.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 };
            return order[a.priority] - order[b.priority];
        });
    },

    exportData() {
        return JSON.stringify({
            unknownQuestions: this._get(this.STORAGE_KEYS.UNKNOWN),
            popularQuestions: this._get(this.STORAGE_KEYS.POPULAR),
            feedback: this._get(this.STORAGE_KEYS.FEEDBACK),
            exportedAt: new Date().toISOString(),
        }, null, 2);
    },

    createLearningDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const stats = this.getStats();
        const unknowns = this.getUnknownQuestions(10);
        const populars = this.getPopularQuestions(10);
        const suggestions = this.getSuggestions();

        container.innerHTML = `
            <div style="font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:16px;">
                <h2 style="margin-bottom:16px;">শেখার ড্যাশবোর্ড</h2>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:24px;">
                    <div style="background:#fee2e2;padding:16px;border-radius:8px;text-align:center;">
                        <div style="font-size:28px;font-weight:bold;">${stats.unknownCount}</div>
                        <div>অজানা প্রশ্ন</div>
                        <div style="font-size:12px;color:#666;">মোট ${stats.unknownTotal} বার জিজ্ঞাসিত</div>
                    </div>
                    <div style="background:#d1fae5;padding:16px;border-radius:8px;text-align:center;">
                        <div style="font-size:28px;font-weight:bold;">${stats.popularCount}</div>
                        <div>জনপ্রিয় প্রশ্ন</div>
                        <div style="font-size:12px;color:#666;">মোট ${stats.popularTotal} বার উত্তর দেওয়া</div>
                    </div>
                    <div style="background:#dbeafe;padding:16px;border-radius:8px;text-align:center;">
                        <div style="font-size:28px;font-weight:bold;">${stats.feedbackCount}</div>
                        <div>মোট ফিডব্যাক</div>
                        <div style="font-size:12px;color:#666;">গড় রেটিং: ${stats.avgRating}/5</div>
                    </div>
                </div>

                ${suggestions.length ? `
                    <div style="margin-bottom:24px;">
                        <h3>পরামর্শ</h3>
                        <div style="display:flex;flex-direction:column;gap:8px;">
                            ${suggestions.map((s) => `
                                <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:10px;border-radius:4px;">
                                    <span style="font-weight:bold;text-transform:uppercase;font-size:11px;background:#f59e0b;color:#fff;padding:2px 6px;border-radius:3px;">${s.priority === 'high' ? 'জরুরি' : s.priority === 'medium' ? 'গুরুত্বপূর্ণ' : 'সাধারণ'}</span>
                                    <span style="margin-left:8px;">${s.message}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
                    <div>
                        <h3>অজানা প্রশ্ন (শীর্ষ ১০)</h3>
                        ${unknowns.length ? `
                            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                                <thead><tr style="background:#f3f4f6;"><th style="padding:8px;text-align:left;">প্রশ্ন</th><th style="padding:8px;text-align:center;">বার</th><th style="padding:8px;">শেষবার</th></tr></thead>
                                <tbody>
                                ${unknowns.map((u) => `
                                    <tr style="border-bottom:1px solid #e5e7eb;">
                                        <td style="padding:8px;">${u.question}</td>
                                        <td style="padding:8px;text-align:center;">${u.count}</td>
                                        <td style="padding:8px;font-size:11px;">${new Date(u.lastSeen).toLocaleDateString('bn-BD')}</td>
                                    </tr>
                                `).join('')}
                                </tbody>
                            </table>
                        ` : '<p style="color:#999;">কোনো অজানা প্রশ্ন নেই।</p>'}
                    </div>
                    <div>
                        <h3>জনপ্রিয় প্রশ্ন (শীর্ষ ১০)</h3>
                        ${populars.length ? `
                            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                                <thead><tr style="background:#f3f4f6;"><th style="padding:8px;text-align:left;">প্রশ্ন</th><th style="padding:8px;text-align:center;">বার</th><th style="padding:8px;">সীমানা</th></tr></thead>
                                <tbody>
                                ${populars.map((p) => `
                                    <tr style="border-bottom:1px solid #e5e7eb;">
                                        <td style="padding:8px;">${p.question}</td>
                                        <td style="padding:8px;text-align:center;">${p.count}</td>
                                        <td style="padding:8px;font-size:11px;">${(p.avgConfidence * 100).toFixed(0)}%</td>
                                    </tr>
                                `).join('')}
                                </tbody>
                            </table>
                        ` : '<p style="color:#999;">কোনো জনপ্রিয় প্রশ্ন নেই।</p>'}
                    </div>
                </div>

                <div style="text-align:center;margin-top:16px;">
                    <button id="sf-export-data" style="background:#2563eb;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;">ডেটা ডাউনলোড</button>
                    <button id="sf-clear-data" style="background:#dc2626;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;margin-left:8px;">সব ডেটা মুছুন</button>
                </div>
            </div>
        `;

        document.getElementById('sf-export-data')?.addEventListener('click', () => {
            const blob = new Blob([this.exportData()], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sf-learning-data-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });

        document.getElementById('sf-clear-data')?.addEventListener('click', () => {
            if (confirm('আপনি কি নিশ্চিত সব শেখার ডেটা মুছে ফেলতে চান?')) {
                Object.values(this.STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
                this._ensureStorage();
                this.createLearningDashboard(containerId);
            }
        });
    },
};
