/**
 * SF AI V14 — Evaluation Scorer
 * Measures: Accuracy, Hallucination, Response Time, Source Correctness,
 *           Language Detection, Product Recommendation, RAG Retrieval
 */

const APPROVED_DOMAINS = [
    'bari.gov.bd', 'dae.gov.bd', 'brri.gov.bd', 'barc.gov.bd',
    'fao.org', 'moa.gov.bd', 'bangladesh.gov.bd',
    'sowrov-fertilizer-905de.web.app',
];

const APPROVED_URLS = [
    'https://bari.gov.bd', 'https://dae.gov.bd', 'https://brri.gov.bd',
    'https://barc.gov.bd', 'https://www.fao.org/bangladesh',
    'https://moa.gov.bd', 'https://bangladesh.gov.bd',
];

/**
 * Check if a URL is from an approved source
 */
function isApprovedUrl(url) {
    if (typeof url !== 'string') return false;
    const trimmed = url.trim();
    try {
        const parsed = new URL(trimmed);
        const hostname = parsed.hostname.toLowerCase();
        return APPROVED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
    } catch {
        return false;
    }
}

/**
 * Score language detection accuracy
 */
function scoreLanguageDetection(detected, expected) {
    if (!detected || !expected) return { score: 0, detail: 'missing' };
    const d = detected.toLowerCase().trim();
    const e = expected.toLowerCase().trim();
    if (d === e) return { score: 1, detail: 'exact_match' };
    if (e === 'chatgaiya' && (d === 'chittagonian' || d === 'dialect')) return { score: 1, detail: 'alias_match' };
    if (e === 'chatgaiya' && d === 'bangla') return { score: 0.7, detail: 'dialect_detected_as_parent' };
    if (e === 'banglish' && d === 'mixed') return { score: 0.8, detail: 'partial_match' };
    if (e === 'banglish' && d === 'english') return { score: 0.5, detail: 'weak_match' };
    if (e === 'banglish' && d === 'bangla') return { score: 0.3, detail: 'romanized_missed' };
    return { score: 0, detail: 'mismatch' };
}

/**
 * Score intent detection accuracy
 */
function scoreIntentDetection(detected, expected) {
    if (!detected || !expected) return { score: 0, detail: 'missing' };
    const d = detected.toLowerCase().trim();
    const e = expected.toLowerCase().trim();
    if (d === e) return { score: 1, detail: 'exact_match' };
    const aliases = {
        crop: ['crop_identification', 'crop'],
        disease: ['disease_diagnosis', 'disease'],
        fertilizer: ['fertilizer_recommendation', 'fertilizer'],
        organic: ['organic_farming', 'organic'],
        soil: ['soil_health', 'soil'],
        pest: ['pest_control', 'pest'],
        weather: ['weather_advice', 'weather'],
        product: ['product_recommendation', 'product'],
        government: ['government', 'govt'],
        general: ['general', 'faq'],
    };
    // Exact match
    for (const [key, vals] of Object.entries(aliases)) {
        if (vals.includes(e) && (d === key || vals.includes(d))) return { score: 1, detail: 'alias_match' };
    }
    // Relaxed: crop/disease/organic questions may be detected as general/fertilizer
    const relaxedMatches = {
        crop_identification: ['crop', 'general'],
        disease_diagnosis: ['disease', 'fertilizer', 'general'],
        fertilizer_recommendation: ['fertilizer', 'general'],
        organic_farming: ['fertilizer', 'organic', 'general'],
        soil_health: ['soil', 'fertilizer', 'general'],
        pest_control: ['disease', 'pest', 'general'],
        weather_advice: ['weather', 'general'],
        product_recommendation: ['product', 'general'],
        government: ['government', 'general'],
        general: ['general', 'faq'],
    };
    const relaxed = relaxedMatches[e];
    if (relaxed && relaxed.includes(d)) return { score: 0.6, detail: 'relaxed_match' };
    return { score: 0, detail: 'mismatch' };
}

/**
 * Score crop detection accuracy
 */
function scoreCropDetection(detected, expected) {
    if (!expected) return { score: 1, detail: 'no_crop_expected' };
    if (!detected) return { score: 0, detail: 'crop_not_detected' };
    const d = detected.toLowerCase().trim();
    const e = expected.toLowerCase().trim();
    if (d === e) return { score: 1, detail: 'exact_match' };
    if (e.includes(d) || d.includes(e)) return { score: 0.8, detail: 'partial_match' };
    const cropAliases = {
        'টমেটো': ['tomato', 'টমেটু'],
        'ধান': ['rice', 'paddy', 'ধানডা'],
        'মরিচ': ['chili', 'pepper', 'মরিচ্যা'],
        'বেগুন': ['brinjal', 'eggplant', 'বেগুন্যা'],
        'আলু': ['potato', 'আলুডা'],
        'পেঁয়াজ': ['onion', 'পেইয়াজ'],
        'রসুন': ['garlic', 'রশুন'],
        'কলা': ['banana', 'কলা'],
        'পেপে': ['papaya', 'পেপে'],
        'লাউ': ['gourd', 'লাউডা'],
        'শসা': ['cucumber', 'শসাডা'],
        'তরমুজ': ['watermelon', 'তরমুজ'],
        'আম': ['mango', 'আম'],
    };
    for (const [bn, aliases] of Object.entries(cropAliases)) {
        if (e === bn || aliases.includes(e)) {
            if (d === bn || aliases.includes(d) || d.includes(bn) || bn.includes(d)) {
                return { score: 1, detail: 'alias_match' };
            }
        }
    }
    return { score: 0, detail: 'mismatch' };
}

/**
 * Score RAG retrieval accuracy
 */
function scoreRAGRetrieval(retrievedDocs, expectedKeywords) {
    if (!retrievedDocs || retrievedDocs.length === 0) return { score: 0, detail: 'no_docs_retrieved' };
    if (!expectedKeywords || expectedKeywords.length === 0) return { score: 1, detail: 'no_keywords_expected' };
    const allText = retrievedDocs.map(d => {
        const title = d.title || d.name || '';
        const content = d.content || '';
        const bangla = d.local_names?.bangla || '';
        return `${title} ${content} ${bangla}`.toLowerCase();
    }).join(' ');
    let matched = 0;
    for (const kw of expectedKeywords) {
        if (allText.includes(kw.toLowerCase())) matched++;
    }
    const ratio = matched / expectedKeywords.length;
    return { score: ratio, detail: `${matched}/${expectedKeywords.length} keywords matched` };
}

/**
 * Score source correctness — check response references against knowledge base
 */
function scoreSourceCorrectness(responseText, expectedSource) {
    if (!responseText) return { score: 0, detail: 'no_response' };
    if (!expectedSource || expectedSource === 'any') return { score: 1, detail: 'any_source_ok' };
    const urlRegex = /https?:\/\/[^\s<>)\]"']+/g;
    const urls = responseText.match(urlRegex) || [];
    const hasSourceMention = responseText.toLowerCase().includes(expectedSource.toLowerCase());
    if (urls.length === 0 && !hasSourceMention) return { score: 0.5, detail: 'no_url_no_source_mention' };
    if (urls.length > 0) {
        const validUrls = urls.filter(u => isApprovedUrl(u));
        if (validUrls.length > 0) return { score: 1, detail: 'valid_approved_urls' };
        return { score: 0.3, detail: 'invalid_urls_found' };
    }
    if (hasSourceMention) return { score: 0.8, detail: 'source_mentioned' };
    return { score: 0.5, detail: 'unclear' };
}

/**
 * Score hallucination — check for invented URLs, facts, or references
 */
function scoreHallucination(responseText, knowledgeDocs) {
    if (!responseText) return { score: 1, detail: 'empty_response' };
    const issues = [];
    const urlRegex = /https?:\/\/[^\s<>)\]"']+/g;
    const urls = responseText.match(urlRegex) || [];
    const invalidUrls = urls.filter(u => !isApprovedUrl(u));
    if (invalidUrls.length > 0) {
        issues.push(`invalid_urls:${invalidUrls.length}`);
    }
    const hallucinationPhrases = [
        'according to my knowledge', 'i think', 'i believe',
        'সাধারণত', 'আমার জানা', 'আমার মতে',
    ];
    const hasHallucinationMarkers = hallucinationPhrases.some(p =>
        responseText.toLowerCase().includes(p)
    );
    if (hasHallucinationMarkers && knowledgeDocs && knowledgeDocs.length > 0) {
        issues.push('hallucination_marker_with_docs_available');
    }
    if (invalidUrls.length > 0) return { score: 0, detail: issues.join('; ') };
    if (issues.length > 0) return { score: 0.5, detail: issues.join('; ') };
    return { score: 1, detail: 'clean' };
}

/**
 * Score response quality (relevance, completeness)
 */
function scoreResponseQuality(responseText, expectedKeywords) {
    if (!responseText) return { score: 0, detail: 'empty' };
    const len = responseText.length;
    let lengthScore = 0;
    if (len < 10) lengthScore = 0.1;
    else if (len < 50) lengthScore = 0.3;
    else if (len < 100) lengthScore = 0.5;
    else if (len < 500) lengthScore = 0.8;
    else lengthScore = 1.0;
    if (!expectedKeywords || expectedKeywords.length === 0) return { score: lengthScore, detail: 'length_based' };
    const lower = responseText.toLowerCase();
    let matched = 0;
    for (const kw of expectedKeywords) {
        if (lower.includes(kw.toLowerCase())) matched++;
    }
    const kwScore = matched / expectedKeywords.length;
    const combined = (lengthScore * 0.3 + kwScore * 0.7);
    return { score: Math.min(combined, 1), detail: `${matched}/${expectedKeywords.length} keywords, len=${len}` };
}

/**
 * Score product recommendation accuracy
 */
function scoreProductRecommendation(responseText, intent) {
    if (!responseText) return { score: 0, detail: 'empty' };
    if (intent !== 'product') return { score: 1, detail: 'not_product_intent' };
    const hasProductUrl = /sowrov-fertilizer-905de\.web\.app/.test(responseText);
    const hasPrice = /৳\d+|Tk\.?\s*\d+|price|দাম|মূল্য/.test(responseText.toLowerCase());
    const hasOrderLink = /order|কিনুন|অর্ডার/.test(responseText.toLowerCase());
    let score = 0;
    if (hasProductUrl) score += 0.5;
    if (hasPrice) score += 0.25;
    if (hasOrderLink) score += 0.25;
    return { score, detail: `url=${hasProductUrl}, price=${hasPrice}, order=${hasOrderLink}` };
}

/**
 * Combined score for a single test case
 */
function scoreTestCase(testCase, result) {
    const scores = {};
    scores.language = scoreLanguageDetection(result.language, testCase.expected_language);
    scores.intent = scoreIntentDetection(result.intent, testCase.expected_intent);
    scores.crop = scoreCropDetection(result.crop, testCase.expected_crop);
    scores.rag = scoreRAGRetrieval(result.retrievedDocs, testCase.expected_answer_keywords);
    scores.source = scoreSourceCorrectness(result.response, testCase.expected_source);
    scores.hallucination = scoreHallucination(result.response, result.retrievedDocs);
    scores.quality = scoreResponseQuality(result.response, testCase.expected_answer_keywords);
    scores.product = scoreProductRecommendation(result.response, testCase.expected_intent);
    scores.latency = { score: result.latency < 2000 ? 1 : result.latency < 5000 ? 0.7 : 0.3, detail: `${result.latency}ms` };

    const weights = {
        language: 0.10, intent: 0.12, crop: 0.12, rag: 0.18,
        source: 0.12, hallucination: 0.15, quality: 0.10, product: 0.06, latency: 0.05,
    };
    let totalScore = 0;
    let totalWeight = 0;
    for (const [key, weight] of Object.entries(weights)) {
        if (scores[key]) {
            totalScore += scores[key].score * weight;
            totalWeight += weight;
        }
    }
    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    return {
        testCaseId: testCase.id,
        overallScore,
        scores,
        passed: overallScore >= 0.6,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Aggregate results for a test suite
 */
function aggregateResults(results) {
    const total = results.length;
    if (total === 0) return { total: 0, passed: 0, failed: 0, accuracy: 0 };
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / total;
    const byCategory = {};
    const byLanguage = {};
    const byDifficulty = {};
    const byIntent = {};
    for (const r of results) {
        const cat = r.category || 'unknown';
        const lang = r.language || 'unknown';
        const diff = r.difficulty || 'unknown';
        const intent = r.intent || 'unknown';
        if (!byCategory[cat]) byCategory[cat] = { total: 0, passed: 0, scores: [] };
        byCategory[cat].total++;
        if (r.passed) byCategory[cat].passed++;
        byCategory[cat].scores.push(r.overallScore);
        if (!byLanguage[lang]) byLanguage[lang] = { total: 0, passed: 0, scores: [] };
        byLanguage[lang].total++;
        if (r.passed) byLanguage[lang].passed++;
        byLanguage[lang].scores.push(r.overallScore);
        if (!byDifficulty[diff]) byDifficulty[diff] = { total: 0, passed: 0, scores: [] };
        byDifficulty[diff].total++;
        if (r.passed) byDifficulty[diff].passed++;
        byDifficulty[diff].scores.push(r.overallScore);
        if (!byIntent[intent]) byIntent[intent] = { total: 0, passed: 0, scores: [] };
        byIntent[intent].total++;
        if (r.passed) byIntent[intent].passed++;
        byIntent[intent].scores.push(r.overallScore);
    }
    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    for (const obj of [byCategory, byLanguage, byDifficulty, byIntent]) {
        for (const key of Object.keys(obj)) {
            obj[key].accuracy = obj[key].passed / obj[key].total;
            obj[key].avgScore = avg(obj[key].scores);
            delete obj[key].scores;
        }
    }
    const avgLatency = results.reduce((s, r) => s + (r.latency || 0), 0) / total;
    const hallucinationRate = results.filter(r => r.scores?.hallucination?.score < 0.5).length / total;
    const avgLanguageScore = avg(results.map(r => r.scores?.language?.score || 0));
    const avgIntentScore = avg(results.map(r => r.scores?.intent?.score || 0));
    const avgCropScore = avg(results.map(r => r.scores?.crop?.score || 0));
    const avgRAGScore = avg(results.map(r => r.scores?.rag?.score || 0));
    const avgSourceScore = avg(results.map(r => r.scores?.source?.score || 0));
    return {
        total, passed, failed,
        accuracy: passed / total,
        avgScore, avgLatency,
        hallucinationRate,
        avgLanguageScore, avgIntentScore, avgCropScore, avgRAGScore, avgSourceScore,
        byCategory, byLanguage, byDifficulty, byIntent,
    };
}

module.exports = {
    scoreLanguageDetection,
    scoreIntentDetection,
    scoreCropDetection,
    scoreRAGRetrieval,
    scoreSourceCorrectness,
    scoreHallucination,
    scoreResponseQuality,
    scoreProductRecommendation,
    scoreTestCase,
    aggregateResults,
    isApprovedUrl,
    APPROVED_DOMAINS,
    APPROVED_URLS,
};
