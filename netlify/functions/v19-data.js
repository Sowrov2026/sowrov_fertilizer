// V19 Self-Evolving Data Store
// Uses JSON file storage (can be replaced with Firebase/Firestore later)

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const FILES = {
    unanswered: path.join(DATA_DIR, 'unanswered.json'),
    popular: path.join(DATA_DIR, 'popular.json'),
    feedback: path.join(DATA_DIR, 'feedback.json'),
    flagged: path.join(DATA_DIR, 'flagged.json'),
    suggestions: path.join(DATA_DIR, 'suggestions.json'),
    logs: path.join(DATA_DIR, 'logs.json'),
    quality: path.join(DATA_DIR, 'quality.json'),
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize empty files
function initFiles() {
    for (const [key, filePath] of Object.entries(FILES)) {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '[]', 'utf8');
        }
    }
}
initFiles();

// Generic read/write
function readData(key) {
    try {
        const raw = fs.readFileSync(FILES[key], 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

function writeData(key, data) {
    fs.writeFileSync(FILES[key], JSON.stringify(data, null, 2), 'utf8');
}

// ── Unknown Questions ──
function storeUnanswered(question) {
    const data = readData('unanswered');
    // Check if question already exists
    const existing = data.find(q => 
        q.question.toLowerCase() === question.question.toLowerCase()
    );
    if (existing) {
        existing.count = (existing.count || 1) + 1;
        existing.lastSeen = new Date().toISOString();
    } else {
        data.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            question: question.question,
            language: question.language || 'unknown',
            location: question.location || '',
            timestamp: new Date().toISOString(),
            confidence: question.confidence || 0,
            intent: question.intent || 'general',
            count: 1,
            status: 'pending', // pending, reviewed, answered, ignored
        });
    }
    writeData('unanswered', data);
    return true;
}

function getUnanswered(filter = {}) {
    let data = readData('unanswered');
    if (filter.status) data = data.filter(q => q.status === filter.status);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function updateUnansweredStatus(id, status) {
    const data = readData('unanswered');
    const item = data.find(q => q.id === id);
    if (item) {
        item.status = status;
        item.reviewedAt = new Date().toISOString();
        writeData('unanswered', data);
        return true;
    }
    return false;
}

// ── Popular Questions ──
function trackPopular(question, metadata = {}) {
    const data = readData('popular');
    const normalized = question.trim().toLowerCase();
    
    const existing = data.find(q => q.normalized === normalized);
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
        data.push({
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
    writeData('popular', data);
    return true;
}

function getPopular(filter = {}) {
    let data = readData('popular');
    data.sort((a, b) => b.count - a.count);
    if (filter.limit) data = data.slice(0, filter.limit);
    if (filter.category) data = data.filter(q => q.category === filter.category);
    return data;
}

// ── Feedback ──
function storeFeedback(feedback) {
    const data = readData('feedback');
    data.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        question: feedback.question,
        answer: feedback.answer,
        rating: feedback.rating, // 'up' or 'down'
        language: feedback.language || 'unknown',
        crop: feedback.crop || '',
        confidence: feedback.confidence || 0,
        intent: feedback.intent || '',
        timestamp: new Date().toISOString(),
        needsReview: feedback.rating === 'down' && (feedback.confidence || 0) < 80,
    });
    writeData('feedback', data);
    
    // If negative feedback on low confidence, flag for review
    if (feedback.rating === 'down') {
        flagForReview(feedback);
    }
    
    return true;
}

function getFeedback(filter = {}) {
    let data = readData('feedback');
    if (filter.rating) data = data.filter(f => f.rating === filter.rating);
    if (filter.needsReview) data = data.filter(f => f.needsReview);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function getFeedbackStats() {
    const data = readData('feedback');
    const total = data.length;
    const positive = data.filter(f => f.rating === 'up').length;
    const negative = data.filter(f => f.rating === 'down').length;
    const needsReview = data.filter(f => f.needsReview).length;
    return {
        total,
        positive,
        negative,
        needsReview,
        satisfactionRate: total > 0 ? Math.round((positive / total) * 100) : 0,
    };
}

// ── Flagged Answers ──
function flagForReview(feedback) {
    const data = readData('flagged');
    // Check if already flagged for same question
    const existing = data.find(f => 
        f.question.toLowerCase() === feedback.question.toLowerCase()
    );
    if (existing) {
        existing.flagCount++;
        existing.lastFlagged = new Date().toISOString();
        existing.lastAnswer = feedback.answer;
    } else {
        data.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            question: feedback.question,
            lastAnswer: feedback.answer,
            flagCount: 1,
            firstFlagged: new Date().toISOString(),
            lastFlagged: new Date().toISOString(),
            status: 'pending', // pending, reviewed, fixed, ignored
            language: feedback.language,
            crop: feedback.crop,
        });
    }
    writeData('flagged', data);
    return true;
}

function getFlagged(filter = {}) {
    let data = readData('flagged');
    if (filter.status) data = data.filter(f => f.status === filter.status);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function updateFlaggedStatus(id, status) {
    const data = readData('flagged');
    const item = data.find(f => f.id === id);
    if (item) {
        item.status = status;
        item.reviewedAt = new Date().toISOString();
        writeData('flagged', data);
        return true;
    }
    return false;
}

// ── Knowledge Suggestions ──
function storeSuggestion(suggestion) {
    const data = readData('suggestions');
    data.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        type: suggestion.type, // faq, crop, disease, word, fertilizer, pest
        question: suggestion.question || '',
        content: suggestion.content || '',
        suggestedBy: suggestion.source || 'ai',
        language: suggestion.language || 'unknown',
        timestamp: new Date().toISOString(),
        status: 'pending', // pending, approved, rejected
        frequency: suggestion.frequency || 1,
    });
    writeData('suggestions', data);
    return true;
}

function getSuggestions(filter = {}) {
    let data = readData('suggestions');
    if (filter.type) data = data.filter(s => s.type === filter.type);
    if (filter.status) data = data.filter(s => s.status === filter.status);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function updateSuggestionStatus(id, status) {
    const data = readData('suggestions');
    const item = data.find(s => s.id === id);
    if (item) {
        item.status = status;
        item.reviewedAt = new Date().toISOString();
        writeData('suggestions', data);
        return true;
    }
    return false;
}

// ── Logs ──
function storeLog(entry) {
    const data = readData('logs');
    data.push({
        timestamp: new Date().toISOString(),
        type: entry.type || 'info',
        message: entry.message,
        data: entry.data || {},
    });
    // Keep last 10000 logs
    if (data.length > 10000) {
        data.splice(0, data.length - 10000);
    }
    writeData('logs', data);
    return true;
}

function getLogs(filter = {}) {
    let data = readData('logs');
    if (filter.type) data = data.filter(l => l.type === filter.type);
    if (filter.startDate) data = data.filter(l => l.timestamp >= filter.startDate);
    if (filter.endDate) data = data.filter(l => l.timestamp <= filter.endDate);
    if (filter.limit) data = data.slice(-filter.limit);
    return data;
}

function getLogStats() {
    const data = readData('logs');
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = data.filter(l => l.timestamp.startsWith(today));
    const errorLogs = data.filter(l => l.type === 'error');
    const warningLogs = data.filter(l => l.type === 'warning');
    return {
        total: data.length,
        today: todayLogs.length,
        errors: errorLogs.length,
        warnings: warningLogs.length,
        lastLog: data.length > 0 ? data[data.length - 1] : null,
    };
}

// ── Quality Scores ──
function storeQualityScore(score) {
    const data = readData('quality');
    data.push({
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
    // Keep last 5000 scores
    if (data.length > 5000) {
        data.splice(0, data.length - 5000);
    }
    writeData('quality', data);
    return true;
}

function getQualityStats() {
    const data = readData('quality');
    if (data.length === 0) {
        return { total: 0, avgAccuracy: 0, avgConfidence: 0, avgResponseTime: 0 };
    }
    const total = data.length;
    const avgAccuracy = data.reduce((sum, d) => sum + d.accuracy, 0) / total;
    const avgConfidence = data.reduce((sum, d) => sum + d.confidence, 0) / total;
    const avgResponseTime = data.reduce((sum, d) => sum + d.responseTime, 0) / total;
    return {
        total,
        avgAccuracy: Math.round(avgAccuracy * 100) / 100,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
    };
}

// ── Monthly Report ──
function generateMonthlyReport() {
    const logs = readData('logs');
    const feedback = readData('feedback');
    const popular = readData('popular');
    const unanswered = readData('unanswered');
    const quality = readData('quality');
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const monthLogs = logs.filter(l => l.timestamp >= monthStart);
    const monthFeedback = feedback.filter(f => f.timestamp >= monthStart);
    const monthUnanswered = unanswered.filter(q => q.timestamp >= monthStart);
    const monthQuality = quality.filter(q => q.timestamp >= monthStart);
    
    // Top crops
    const cropCounts = {};
    popular.forEach(p => {
        p.crops.forEach(c => {
            cropCounts[c] = (cropCounts[c] || 0) + p.count;
        });
    });
    const topCrops = Object.entries(cropCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([crop, count]) => ({ crop, count }));
    
    // Top languages
    const langCounts = {};
    monthFeedback.forEach(f => {
        langCounts[f.language] = (langCounts[f.language] || 0) + 1;
    });
    const topLanguages = Object.entries(langCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([lang, count]) => ({ lang, count }));
    
    // Questions answered
    const questionsAnswered = monthLogs.filter(l => l.type === 'chat').length;
    
    // Accuracy
    const avgAccuracy = monthQuality.length > 0
        ? monthQuality.reduce((sum, q) => sum + q.accuracy, 0) / monthQuality.length
        : 0;
    
    // Avg response time
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

// ── Health Check ──
function runHealthCheck() {
    const issues = [];
    
    // Check for duplicate unanswered questions
    const unanswered = readData('unanswered');
    const seen = new Set();
    unanswered.forEach(q => {
        const key = q.question.toLowerCase().trim();
        if (seen.has(key)) {
            issues.push({ type: 'duplicate', file: 'unanswered.json', question: q.question });
        }
        seen.add(key);
    });
    
    // Check for empty data files
    for (const [key, filePath] of Object.entries(FILES)) {
        const data = readData(key);
        if (data.length === 0) {
            issues.push({ type: 'empty', file: `${key}.json` });
        }
    }
    
    // Check for broken references in knowledge
    const knowledgeDir = path.join(__dirname, 'knowledge');
    if (fs.existsSync(knowledgeDir)) {
        const knowledgeFiles = fs.readdirSync(knowledgeDir);
        knowledgeFiles.forEach(file => {
            if (file.endsWith('.js')) {
                try {
                    require(path.join(knowledgeDir, file));
                } catch (e) {
                    issues.push({ type: 'broken', file: `knowledge/${file}`, error: e.message });
                }
            }
        });
    }
    
    return {
        healthy: issues.length === 0,
        issues,
        checkedAt: new Date().toISOString(),
        filesChecked: Object.keys(FILES).length,
    };
}

// ── Export ──
module.exports = {
    FILES,
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
    readData,
    writeData,
};
