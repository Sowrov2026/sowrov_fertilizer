// V19 Self-Evolving Data Store
// In-memory storage (Cloudflare Workers cannot use filesystem)
// Cloudflare Pages ES Module

const DATA = {
    unanswered: [],
    popular: [],
    feedback: [],
    flagged: [],
    suggestions: [],
    logs: [],
    quality: [],
};

function storeUnanswered(question) {
    const existing = DATA.unanswered.find(q =>
        q.question.toLowerCase() === question.question.toLowerCase()
    );
    if (existing) {
        existing.count = (existing.count || 1) + 1;
        existing.lastSeen = new Date().toISOString();
    } else {
        DATA.unanswered.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            question: question.question,
            language: question.language || 'unknown',
            location: question.location || '',
            timestamp: new Date().toISOString(),
            confidence: question.confidence || 0,
            intent: question.intent || 'general',
            count: 1,
            status: 'pending',
        });
    }
    return true;
}

function getUnanswered(filter = {}) {
    let data = DATA.unanswered;
    if (filter.status) data = data.filter(q => q.status === filter.status);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function updateUnansweredStatus(id, status) {
    const item = DATA.unanswered.find(q => q.id === id);
    if (item) {
        item.status = status;
        item.reviewedAt = new Date().toISOString();
        return true;
    }
    return false;
}

function trackPopular(question, metadata = {}) {
    const normalized = question.trim().toLowerCase();
    const existing = DATA.popular.find(q => q.normalized === normalized);
    if (existing) {
        existing.count++;
        existing.lastSeen = new Date().toISOString();
        if (metadata.crop && !existing.crops.includes(metadata.crop)) {
            existing.crops.push(metadata.crop);
        }
        if (metadata.intent && !existing.intents.includes(metadata.intent)) {
            existing.intents.push(metadata.intent);
        }
    } else {
        DATA.popular.push({
            normalized,
            question: question,
            count: 1,
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            crops: metadata.crop ? [metadata.crop] : [],
            intents: metadata.intent ? [metadata.intent] : [],
            languages: metadata.language ? [metadata.language] : [],
            category: metadata.category || 'general',
        });
    }
    return true;
}

function getPopular(filter = {}) {
    let data = [...DATA.popular].sort((a, b) => b.count - a.count);
    if (filter.limit) data = data.slice(0, filter.limit);
    if (filter.category) data = data.filter(q => q.category === filter.category);
    return data;
}

function storeFeedback(feedback) {
    DATA.feedback.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        question: feedback.question,
        answer: feedback.answer,
        rating: feedback.rating,
        language: feedback.language || 'unknown',
        crop: feedback.crop || '',
        confidence: feedback.confidence || 0,
        intent: feedback.intent || '',
        timestamp: new Date().toISOString(),
        needsReview: feedback.rating === 'down' && (feedback.confidence || 0) < 80,
    });
    if (feedback.rating === 'down') {
        flagForReview(feedback);
    }
    return true;
}

function getFeedback(filter = {}) {
    let data = DATA.feedback;
    if (filter.rating) data = data.filter(f => f.rating === filter.rating);
    if (filter.needsReview) data = data.filter(f => f.needsReview);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function getFeedbackStats() {
    const total = DATA.feedback.length;
    const positive = DATA.feedback.filter(f => f.rating === 'up').length;
    const negative = DATA.feedback.filter(f => f.rating === 'down').length;
    const needsReview = DATA.feedback.filter(f => f.needsReview).length;
    return {
        total,
        positive,
        negative,
        needsReview,
        satisfactionRate: total > 0 ? Math.round((positive / total) * 100) : 0,
    };
}

function flagForReview(feedback) {
    const existing = DATA.flagged.find(f =>
        f.question.toLowerCase() === feedback.question.toLowerCase()
    );
    if (existing) {
        existing.flagCount++;
        existing.lastFlagged = new Date().toISOString();
        existing.lastAnswer = feedback.answer;
    } else {
        DATA.flagged.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            question: feedback.question,
            lastAnswer: feedback.answer,
            flagCount: 1,
            firstFlagged: new Date().toISOString(),
            lastFlagged: new Date().toISOString(),
            status: 'pending',
            language: feedback.language,
            crop: feedback.crop,
        });
    }
    return true;
}

function getFlagged(filter = {}) {
    let data = DATA.flagged;
    if (filter.status) data = data.filter(f => f.status === filter.status);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function updateFlaggedStatus(id, status) {
    const item = DATA.flagged.find(f => f.id === id);
    if (item) {
        item.status = status;
        item.reviewedAt = new Date().toISOString();
        return true;
    }
    return false;
}

function storeSuggestion(suggestion) {
    DATA.suggestions.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        type: suggestion.type,
        question: suggestion.question || '',
        content: suggestion.content || '',
        suggestedBy: suggestion.source || 'ai',
        language: suggestion.language || 'unknown',
        timestamp: new Date().toISOString(),
        status: 'pending',
        frequency: suggestion.frequency || 1,
    });
    return true;
}

function getSuggestions(filter = {}) {
    let data = DATA.suggestions;
    if (filter.type) data = data.filter(s => s.type === filter.type);
    if (filter.status) data = data.filter(s => s.status === filter.status);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function updateSuggestionStatus(id, status) {
    const item = DATA.suggestions.find(s => s.id === id);
    if (item) {
        item.status = status;
        item.reviewedAt = new Date().toISOString();
        return true;
    }
    return false;
}

function storeLog(entry) {
    DATA.logs.push({
        timestamp: new Date().toISOString(),
        type: entry.type || 'info',
        message: entry.message,
        data: entry.data || {},
    });
    if (DATA.logs.length > 10000) {
        DATA.logs.splice(0, DATA.logs.length - 10000);
    }
    return true;
}

function getLogs(filter = {}) {
    let data = DATA.logs;
    if (filter.type) data = data.filter(l => l.type === filter.type);
    if (filter.startDate) data = data.filter(l => l.timestamp >= filter.startDate);
    if (filter.endDate) data = data.filter(l => l.timestamp <= filter.endDate);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function getLogStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = DATA.logs.filter(l => l.timestamp.startsWith(today));
    const errorLogs = DATA.logs.filter(l => l.type === 'error');
    const warningLogs = DATA.logs.filter(l => l.type === 'warning');
    return {
        total: DATA.logs.length,
        today: todayLogs.length,
        errors: errorLogs.length,
        warnings: warningLogs.length,
        lastLog: DATA.logs.length > 0 ? DATA.logs[DATA.logs.length - 1] : null,
    };
}

function storeQualityScore(score) {
    DATA.quality.push({
        timestamp: new Date().toISOString(),
        question: score.question,
        accuracy: score.accuracy || 0,
        confidence: score.confidence || 0,
        knowledgeSource: score.knowledgeSource || 'unknown',
        languageScore: score.languageScore || 0,
        responseTime: score.responseTime || 0,
        intent: score.intent || '',
        language: score.language || 'unknown',
    });
    if (DATA.quality.length > 5000) {
        DATA.quality.splice(0, DATA.quality.length - 5000);
    }
    return true;
}

function getQualityStats() {
    if (DATA.quality.length === 0) {
        return { total: 0, avgAccuracy: 0, avgConfidence: 0, avgResponseTime: 0 };
    }
    const total = DATA.quality.length;
    const avgAccuracy = DATA.quality.reduce((sum, d) => sum + d.accuracy, 0) / total;
    const avgConfidence = DATA.quality.reduce((sum, d) => sum + d.confidence, 0) / total;
    const avgResponseTime = DATA.quality.reduce((sum, d) => sum + d.responseTime, 0) / total;
    return {
        total,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
    };
}

function generateMonthlyReport() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthLogs = DATA.logs.filter(l => l.timestamp >= monthStart);
    const monthFeedback = DATA.feedback.filter(f => f.timestamp >= monthStart);
    const monthUnanswered = DATA.unanswered.filter(q => q.timestamp >= monthStart);
    const monthQuality = DATA.quality.filter(q => q.timestamp >= monthStart);

    const cropCounts = {};
    DATA.popular.forEach(p => {
        p.crops.forEach(c => {
            cropCounts[c] = (cropCounts[c] || 0) + p.count;
        });
    });
    const topCrops = Object.entries(cropCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([crop, count]) => ({ crop, count }));

    const langCounts = {};
    monthFeedback.forEach(f => {
        langCounts[f.language] = (langCounts[f.language] || 0) + 1;
    });
    const topLanguages = Object.entries(langCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, count]) => ({ lang, count }));

    const questionsAnswered = monthLogs.filter(l => l.type === 'chat').length;
    const avgAccuracy = monthQuality.length > 0
        ? monthQuality.reduce((sum, q) => sum + q.accuracy, 0) / monthQuality.length
        : 0;
    const avgResponseTime = monthQuality.length > 0
        ? monthQuality.reduce((sum, q) => sum + q.responseTime, 0) / monthQuality.length
        : 0;

    return {
        period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        questionsAnswered,
        totalFeedback: monthFeedback.length,
        positiveFeedback: monthFeedback.filter(f => f.rating === 'up').length,
        negativeFeedback: monthFeedback.filter(f => f.rating === 'down').length,
        unknownTopics: monthUnanswered.length,
        topCrops,
        topLanguages,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        generatedAt: new Date().toISOString(),
    };
}

function runHealthCheck() {
    const issues = [];
    const seen = new Set();
    DATA.unanswered.forEach(q => {
        const key = q.question.toLowerCase().trim();
        if (seen.has(key)) {
            issues.push({ type: 'duplicate', file: 'unanswered', question: q.question });
        }
        seen.add(key);
    });
    for (const [key, arr] of Object.entries(DATA)) {
        if (arr.length === 0) {
            issues.push({ type: 'empty', file: `${key}` });
        }
    }
    return {
        healthy: issues.length === 0,
        issues,
        checkedAt: new Date().toISOString(),
        filesChecked: Object.keys(DATA).length,
    };
}

export {
    DATA,
    storeUnanswered,
    getUnanswered,
    updateUnansweredStatus,
    trackPopular,
    getPopular,
    storeFeedback,
    getFeedback,
    getFeedbackStats,
    flagForReview,
    getFlagged,
    updateFlaggedStatus,
    storeSuggestion,
    getSuggestions,
    updateSuggestionStatus,
    storeLog,
    getLogs,
    getLogStats,
    storeQualityScore,
    getQualityStats,
    generateMonthlyReport,
    runHealthCheck,
};
