// V20 Expert Connect
// Expert profiles, answers, verification, and ratings

export const SFExpert = {
    initialized: false,
    experts: [],
    answers: [],
    STORAGE_KEY_EXPERTS: 'sf_experts',
    STORAGE_KEY_ANSWERS: 'sf_expert_answers',

    SPECIALIZATIONS: {
        crop: { name: 'ফসল ব্যবস্থাপনা', icon: '🌾' },
        disease: { name: 'রোগ নির্ণয়', icon: '🦠' },
        fertilizer: { name: 'সার ও পুষ্টি', icon: '🧪' },
        pest: { name: 'পোকামাকড় নিয়ন্ত্রণ', icon: '🐛' },
        soil: { name: 'মাটি বিশ্লেষণ', icon: '🏔️' },
        organic: { name: 'জৈব কৃষি', icon: '🌿' },
        irrigation: { name: 'সেচ ব্যবস্থা', icon: '💧' },
        marketing: { name: 'বাজারজাতকরণ', icon: '📊' },
    },

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.loadFromStorage();
        this.setupEventListeners();
    },

    loadFromStorage() {
        try {
            const experts = localStorage.getItem(this.STORAGE_KEY_EXPERTS);
            if (experts) this.experts = JSON.parse(experts);
            const answers = localStorage.getItem(this.STORAGE_KEY_ANSWERS);
            if (answers) this.answers = JSON.parse(answers);
        } catch (e) {
            console.error('এক্সপার্ট ডাটা লোডে সমস্যা:', e);
        }
    },

    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY_EXPERTS, JSON.stringify(this.experts));
            localStorage.setItem(this.STORAGE_KEY_ANSWERS, JSON.stringify(this.answers));
        } catch (e) {
            console.error('এক্সপার্ট ডাটা সেভে সমস্যা:', e);
        }
    },

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-expert-action]');
            if (!btn) return;
            const action = btn.dataset.expertAction;
            const id = btn.dataset.expertId;
            if (action === 'verify') this.verifyExpert(id);
            if (action === 'unverify') this.unverifyExpert(id);
            if (action === 'rate') this.handleRateClick(btn);
        });
    },

    handleRateClick(btn) {
        const expertId = btn.dataset.expertId;
        const rating = parseInt(btn.dataset.rating);
        if (expertId && rating) {
            this.rateExpert(expertId, rating, '');
            const container = btn.closest('.sf-expert-rating');
            if (container) {
                container.querySelectorAll('.sf-star').forEach((s, i) => {
                    s.classList.toggle('active', i < rating);
                });
            }
        }
    },

    // Expert profiles
    createExpertProfile(data) {
        const expert = {
            id: 'exp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            name: data.name || 'অজ্ঞাত এক্সপার্ট',
            specialization: data.specialization || 'crop',
            credentials: data.credentials || '',
            verified: data.verified || false,
            rating: 0,
            totalRatings: 0,
            answerCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.experts.push(expert);
        this.saveToStorage();
        return expert;
    },

    updateExpertProfile(id, data) {
        const idx = this.experts.findIndex(e => e.id === id);
        if (idx === -1) return null;
        this.experts[idx] = { ...this.experts[idx], ...data, updatedAt: new Date().toISOString() };
        this.saveToStorage();
        return this.experts[idx];
    },

    getExpert(id) {
        return this.experts.find(e => e.id === id) || null;
    },

    getAllExperts() {
        return [...this.experts];
    },

    getVerifiedExperts() {
        return this.experts.filter(e => e.verified);
    },

    getExpertsBySpecialization(spec) {
        return this.experts.filter(e => e.specialization === spec);
    },

    // Expert answers
    answerQuestion(questionId, answer, expertId) {
        const expert = this.getExpert(expertId);
        if (!expert) return null;
        const entry = {
            id: 'ans_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
            questionId,
            expertId,
            expertName: expert.name,
            answer,
            helpful: 0,
            createdAt: new Date().toISOString(),
        };
        this.answers.push(entry);
        expert.answerCount = (expert.answerCount || 0) + 1;
        this.saveToStorage();
        return entry;
    },

    getExpertAnswers(expertId) {
        return this.answers.filter(a => a.expertId === expertId);
    },

    getQuestionAnswers(questionId) {
        return this.answers.filter(a => a.questionId === questionId);
    },

    // Verification
    verifyExpert(id) {
        const expert = this.getExpert(id);
        if (!expert) return false;
        expert.verified = true;
        expert.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return true;
    },

    unverifyExpert(id) {
        const expert = this.getExpert(id);
        if (!expert) return false;
        expert.verified = false;
        expert.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return true;
    },

    // Ratings
    rateExpert(expertId, rating, review) {
        const expert = this.getExpert(expertId);
        if (!expert || rating < 1 || rating > 5) return false;
        const total = expert.rating * expert.totalRatings;
        expert.totalRatings += 1;
        expert.rating = parseFloat(((total + rating) / expert.totalRatings).toFixed(1));
        expert.updatedAt = new Date().toISOString();
        this.saveToStorage();
        return true;
    },

    getExpertRating(expertId) {
        const expert = this.getExpert(expertId);
        if (!expert) return { rating: 0, total: 0 };
        return { rating: expert.rating, total: expert.totalRatings };
    },

    // UI
    createExpertList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const experts = this.getAllExperts();
        if (experts.length === 0) {
            container.innerHTML = '<div class="sf-empty-state">কোনো এক্সপার্ট পাওয়া যায়নি</div>';
            return;
        }
        container.innerHTML = `
            <div class="sf-expert-list">
                <h3>এক্সপার্ট তালিকা (${experts.length} জন)</h3>
                <div class="sf-expert-grid">
                    ${experts.map(e => this.renderExpertCard(e)).join('')}
                </div>
            </div>`;
    },

    renderExpertCard(expert) {
        const spec = this.SPECIALIZATIONS[expert.specialization] || this.SPECIALIZATIONS.crop;
        return `
            <div class="sf-expert-card" data-expert-id="${expert.id}">
                <div class="sf-expert-header">
                    <span class="sf-expert-icon">${spec.icon}</span>
                    <div>
                        <strong>${this.escapeHtml(expert.name)}</strong>
                        ${expert.verified ? '<span class="sf-verified-badge">✓ যাচাইকৃত</span>' : ''}
                    </div>
                </div>
                <div class="sf-expert-meta">
                    <span>${spec.name}</span>
                    <span>উত্তর: ${expert.answerCount || 0}</span>
                    <span>${this.renderStars(expert.rating)} (${expert.totalRatings})</span>
                </div>
                ${expert.credentials ? `<p class="sf-expert-creds">${this.escapeHtml(expert.credentials)}</p>` : ''}
            </div>`;
    },

    createExpertProfileUI(containerId, expertId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const expert = this.getExpert(expertId);
        if (!expert) {
            container.innerHTML = '<div class="sf-empty-state">এক্সপার্ট পাওয়া যায়নি</div>';
            return;
        }
        const spec = this.SPECIALIZATIONS[expert.specialization] || this.SPECIALIZATIONS.crop;
        const answers = this.getExpertAnswers(expertId);
        container.innerHTML = `
            <div class="sf-expert-profile">
                <div class="sf-expert-profile-header">
                    <span class="sf-expert-avatar">${spec.icon}</span>
                    <h2>${this.escapeHtml(expert.name)}</h2>
                    ${expert.verified ? '<span class="sf-verified-badge">✓ যাচাইকৃত এক্সপার্ট</span>' : ''}
                </div>
                <div class="sf-expert-details">
                    <p><strong>বিশেষত্ব:</strong> ${spec.name}</p>
                    ${expert.credentials ? `<p><strong>যোগ্যতা:</strong> ${this.escapeHtml(expert.credentials)}</p>` : ''}
                    <p><strong>মোট উত্তর:</strong> ${expert.answerCount || 0}</p>
                    <p><strong>রেটিং:</strong> ${this.renderStars(expert.rating)} (${expert.totalRatings} জন থেকে)</p>
                </div>
                <h3>সাম্প্রতিক উত্তরসমূহ</h3>
                <div class="sf-expert-answers-list">
                    ${answers.length === 0 ? '<p>এখনো কোনো উত্তর দেননি</p>' :
                        answers.slice(-5).reverse().map(a => `
                            <div class="sf-answer-item">
                                <p>${this.escapeHtml(a.answer)}</p>
                                <small>${new Date(a.createdAt).toLocaleDateString('bn-BD')}</small>
                            </div>`).join('')}
                </div>
            </div>`;
    },

    createExpertForm(containerId, editId = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const existing = editId ? this.getExpert(editId) : null;
        const specs = Object.entries(this.SPECIALIZATIONS).map(([k, v]) =>
            `<option value="${k}" ${existing && existing.specialization === k ? 'selected' : ''}>${v.icon} ${v.name}</option>`
        ).join('');
        container.innerHTML = `
            <form class="sf-expert-form" id="sf-expert-form">
                <h3>${existing ? 'এক্সপার্ট প্রোফাইল সম্পাদনা' : 'নতুন এক্সপার্ট যোগ করুন'}</h3>
                <input type="hidden" name="editId" value="${editId || ''}">
                <div class="sf-form-group">
                    <label>নাম *</label>
                    <input type="text" name="name" required value="${existing ? this.escapeHtml(existing.name) : ''}">
                </div>
                <div class="sf-form-group">
                    <label>বিশেষত্ব *</label>
                    <select name="specialization" required>${specs}</select>
                </div>
                <div class="sf-form-group">
                    <label>যোগ্যতা ও অভিজ্ঞতা</label>
                    <textarea name="credentials" rows="3">${existing ? this.escapeHtml(existing.credentials) : ''}</textarea>
                </div>
                <button type="submit" class="sf-btn sf-btn-primary">
                    ${existing ? 'সংরক্ষণ করুন' : 'এক্সপার্ট যোগ করুন'}
                </button>
            </form>`;
        const form = container.querySelector('#sf-expert-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(form);
            const data = {
                name: fd.get('name'),
                specialization: fd.get('specialization'),
                credentials: fd.get('credentials'),
            };
            if (editId) {
                this.updateExpertProfile(editId, data);
            } else {
                this.createExpertProfile(data);
            }
            if (typeof this.onFormSubmit === 'function') this.onFormSubmit();
        });
    },

    createExpertAnswers(containerId, expertId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const answers = this.getExpertAnswers(expertId).reverse();
        container.innerHTML = `
            <div class="sf-expert-answers">
                <h3>এক্সপার্টের উত্তরসমূহ (${answers.length})</h3>
                ${answers.length === 0 ? '<p>কোনো উত্তর পাওয়া যায়নি</p>' :
                    answers.map(a => `
                        <div class="sf-answer-card">
                            <p class="sf-answer-text">${this.escapeHtml(a.answer)}</p>
                            <div class="sf-answer-meta">
                                <span>প্রশ্ন: ${a.questionId}</span>
                                <span>${new Date(a.createdAt).toLocaleDateString('bn-BD')}</span>
                                <span>সাহায্যকর: ${a.helpful}</span>
                            </div>
                        </div>`).join('')}
            </div>`;
    },

    createExpertSearch(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const specs = Object.entries(this.SPECIALIZATIONS).map(([k, v]) =>
            `<option value="${k}">${v.icon} ${v.name}</option>`
        ).join('');
        container.innerHTML = `
            <div class="sf-expert-search">
                <div class="sf-search-row">
                    <input type="text" id="sf-expert-search-input" placeholder="এক্সপার্ট খুঁজুন...">
                    <select id="sf-expert-search-spec">
                        <option value="">সব বিশেষত্ব</option>
                        ${specs}
                    </select>
                    <label><input type="checkbox" id="sf-expert-search-verified"> শুধু যাচাইকৃত</label>
                </div>
                <div id="sf-expert-search-results" class="sf-expert-grid"></div>
            </div>`;
        const searchFn = () => {
            const q = document.getElementById('sf-expert-search-input')?.value.toLowerCase() || '';
            const spec = document.getElementById('sf-expert-search-spec')?.value || '';
            const verifiedOnly = document.getElementById('sf-expert-search-verified')?.checked || false;
            let results = this.getAllExperts();
            if (q) results = results.filter(e => e.name.toLowerCase().includes(q) || (e.credentials && e.credentials.toLowerCase().includes(q)));
            if (spec) results = results.filter(e => e.specialization === spec);
            if (verifiedOnly) results = results.filter(e => e.verified);
            const box = document.getElementById('sf-expert-search-results');
            if (box) box.innerHTML = results.length === 0 ? '<p>কোনো ফলাফল পাওয়া যায়নি</p>' : results.map(e => this.renderExpertCard(e)).join('');
        };
        container.querySelector('#sf-expert-search-input')?.addEventListener('input', searchFn);
        container.querySelector('#sf-expert-search-spec')?.addEventListener('change', searchFn);
        container.querySelector('#sf-expert-search-verified')?.addEventListener('change', searchFn);
        searchFn();
    },

    createVerifyBadge(expert) {
        if (!expert || !expert.verified) return '';
        return '<span class="sf-verified-badge" title="যাচাইকৃত এক্সপার্ট">✓ যাচাইকৃত</span>';
    },

    renderStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
    },

    escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    },

    // Export
    exportExpertData() {
        const data = {
            experts: this.experts,
            answers: this.answers,
            exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sf-expert-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
};
