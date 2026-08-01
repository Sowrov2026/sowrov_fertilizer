/**
 * SF AI V16 — Analytics Module
 * Track user interactions and generate usage analytics
 * Client-side ES module with localStorage persistence
 */

const STORAGE_KEY = 'sf_ai_analytics';
const MAX_EVENTS = 1000;

let events = [];

function load() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        events = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(events)) events = [];
    } catch {
        events = [];
    }
}

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
        console.error('বিশ্লেষণ সংরক্ষণে সমস্যা:', e);
    }
}

function addEvent(category, action, label, value) {
    events.push({
        timestamp: new Date().toISOString(),
        category: category || '',
        action: action || '',
        label: label || '',
        value: value !== undefined ? value : null,
    });

    if (events.length > MAX_EVENTS) {
        events = events.slice(-MAX_EVENTS);
    }

    save();
}

function countBy(key, limit) {
    const counts = {};
    for (const e of events) {
        const val = e[key];
        if (val) {
            counts[val] = (counts[val] || 0) + 1;
        }
    }
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit || 10)
        .map(([name, count]) => ({ name, count }));
}

function getDateKey(dateStr) {
    return dateStr ? dateStr.slice(0, 10) : '';
}

export const SFAnalytics = {
    init() {
        load();
        return this;
    },

    // ── Track Events ───────────────────────────

    trackEvent(category, action, label, value) {
        addEvent(category, action, label, value);
    },

    trackQuestion(question, responseTime, confidence) {
        addEvent('question', question, null, {
            responseTime: responseTime || 0,
            confidence: confidence || 0,
        });
    },

    trackProductClick(productId, productName) {
        addEvent('product', 'click', productName, productId);
    },

    trackLanguage(language) {
        addEvent('language', 'switch', language);
    },

    trackCrop(cropName) {
        addEvent('crop', 'query', cropName);
    },

    trackDisease(diseaseName) {
        addEvent('disease', 'query', diseaseName);
    },

    trackLocation(district) {
        addEvent('location', 'set', district);
    },

    // ── Get Analytics ──────────────────────────

    getTopQuestions(limit) {
        return countBy('action', limit).filter(e =>
            events.some(ev => ev.category === 'question' && ev.action === e.name)
        );
    },

    getTopCrops(limit) {
        return countBy('label', limit).filter(e =>
            events.some(ev => ev.category === 'crop' && ev.label === e.name)
        );
    },

    getTopDiseases(limit) {
        return countBy('label', limit).filter(e =>
            events.some(ev => ev.category === 'disease' && ev.label === e.name)
        );
    },

    getTopLocations(limit) {
        return countBy('label', limit).filter(e =>
            events.some(ev => ev.category === 'location' && ev.label === e.name)
        );
    },

    getLanguageDistribution() {
        const dist = {};
        for (const e of events) {
            if (e.category === 'language') {
                dist[e.label] = (dist[e.label] || 0) + 1;
            }
        }
        return dist;
    },

    getConfidenceDistribution() {
        const dist = { high: 0, medium: 0, low: 0, veryLow: 0 };
        for (const e of events) {
            if (e.category === 'question' && e.value && e.value.confidence !== undefined) {
                const c = e.value.confidence;
                if (c >= 80) dist.high++;
                else if (c >= 50) dist.medium++;
                else if (c >= 20) dist.low++;
                else dist.veryLow++;
            }
        }
        return dist;
    },

    getAverageResponseTime() {
        let total = 0;
        let count = 0;
        for (const e of events) {
            if (e.category === 'question' && e.value && e.value.responseTime) {
                total += e.value.responseTime;
                count++;
            }
        }
        return count > 0 ? Math.round(total / count) : 0;
    },

    getUsageByDate(days) {
        const result = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const count = events.filter(e => getDateKey(e.timestamp) === key).length;
            result.push({ date: key, count });
        }
        return result;
    },

    getDailyStats() {
        const daily = {};
        for (const e of events) {
            const day = getDateKey(e.timestamp);
            if (!day) continue;
            if (!daily[day]) {
                daily[day] = { total: 0, categories: {} };
            }
            daily[day].total++;
            daily[day].categories[e.category] =
                (daily[day].categories[e.category] || 0) + 1;
        }
        return daily;
    },

    // ── Dashboard ──────────────────────────────

    createAnalyticsDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const total = events.length;
        const questions = events.filter(e => e.category === 'question').length;
        const products = events.filter(e => e.category === 'product').length;
        const avgResponse = this.getAverageResponseTime();
        const topCrops = this.getTopCrops(5);
        const topDiseases = this.getTopDiseases(5);
        const topLocations = this.getTopLocations(5);
        const langDist = this.getLanguageDistribution();
        const confDist = this.getConfidenceDistribution();
        const usage = this.getUsageByDate(7);

        let html = `
        <div class="analytics-dashboard">
            <h3>বিশ্লেষণ ড্যাশবোর্ড</h3>

            <div class="analytics-summary">
                <div class="stat-card">
                    <span class="stat-value">${total}</span>
                    <span class="stat-label">মোট ইভেন্ট</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${questions}</span>
                    <span class="stat-label">প্রশ্ন</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${products}</span>
                    <span class="stat-label">প্রোডাক্ট ক্লিক</span>
                </div>
                <div class="stat-card">
                    <span class="stat-value">${avgResponse}ms</span>
                    <span class="stat-label">গড় প্রতিক্রিয়া সময়</span>
                </div>
            </div>

            <div class="analytics-section">
                <h4>শীর্ষ ফসল</h4>
                <ul>${topCrops.map(c => `<li>${c.name}: ${c.count} বার</li>`).join('') || '<li>তথ্য নেই</li>'}</ul>
            </div>

            <div class="analytics-section">
                <h4>শীর্ষ রোগ</h4>
                <ul>${topDiseases.map(d => `<li>${d.name}: ${d.count} বার</li>`).join('') || '<li>তথ্য নেই</li>'}</ul>
            </div>

            <div class="analytics-section">
                <h4>শীর্ষ অবস্থান</h4>
                <ul>${topLocations.map(l => `<li>${l.name}: ${l.count} বার</li>`).join('') || '<li>তথ্য নেই</li>'}</ul>
            </div>

            <div class="analytics-section">
                <h4>ভাষা বিতরণ</h4>
                <ul>${Object.entries(langDist).map(([k, v]) => `<li>${k}: ${v} বার</li>`).join('') || '<li>তথ্য নেই</li>'}</ul>
            </div>

            <div class="analytics-section">
                <h4>আত্মবিশ্বাস বিতরণ</h4>
                <ul>
                    <li>উচ্চ: ${confDist.high} বার</li>
                    <li>মাঝারি: ${confDist.medium} বার</li>
                    <li>কম: ${confDist.low} বার</li>
                    <li>খুব কম: ${confDist.veryLow} বার</li>
                </ul>
            </div>

            <div class="analytics-section">
                <h4>গত ৭ দিনের ব্যবহার</h4>
                <ul>${usage.map(u => `<li>${u.date}: ${u.count} ইভেন্ট</li>`).join('')}</ul>
            </div>
        </div>`;

        container.innerHTML = html;
    },

    generateReport() {
        const total = events.length;
        const questions = events.filter(e => e.category === 'question').length;
        const crops = this.getTopCrops(5);
        const diseases = this.getTopDiseases(5);
        const locations = this.getTopLocations(5);
        const avgResponse = this.getAverageResponseTime();
        const confDist = this.getConfidenceDistribution();

        return {
            totalEvents: total,
            totalQuestions: questions,
            averageResponseTime: avgResponse,
            topCrops: crops,
            topDiseases: diseases,
            topLocations: locations,
            confidenceDistribution: confDist,
            languageDistribution: this.getLanguageDistribution(),
            dailyStats: this.getDailyStats(),
            generatedAt: new Date().toISOString(),
        };
    },

    // ── Export ─────────────────────────────────

    exportData() {
        return JSON.stringify({
            events,
            exportedAt: new Date().toISOString(),
            totalEvents: events.length,
        }, null, 2);
    },

    clearData() {
        events = [];
        save();
    },
};

export default SFAnalytics;
