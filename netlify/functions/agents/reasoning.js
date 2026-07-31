/**
 * Reasoning Agent — V11 Enterprise
 * Responsibilities: Think internally, Generate answer, Verify answer, Check hallucination
 */

const APPROVED_DOMAINS = [
    'bari.gov.bd', 'dae.gov.bd', 'brri.gov.bd', 'barc.gov.bd',
    'fao.org', 'fao.org/bangladesh', 'moa.gov.bd', 'bangladesh.gov.bd',
    'sowrov-fertilizer-905de.web.app',
];

const APPROVED_URLS = [
    'https://bari.gov.bd', 'https://dae.gov.bd', 'https://brri.gov.bd',
    'https://barc.gov.bd', 'https://www.fao.org/bangladesh',
    'https://moa.gov.bd', 'https://bangladesh.gov.bd',
];

const PRODUCT_URL_PATTERNS = [
    /^https:\/\/sowrov-fertilizer-905de\.web\.app\/product-details\.html\?id=/,
    /^https:\/\/sowrov-fertilizer-905de\.web\.app\/order\.html\?product=/,
    /^https:\/\/wa\.me\/8801829775552/,
];

/**
 * Check if a URL is from an approved source
 */
function isApprovedUrl(url) {
    if (typeof url !== 'string') return false;
    const trimmed = url.trim();

    if (APPROVED_URLS.some(approved => trimmed === approved || trimmed === approved + '/')) {
        return true;
    }

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'https:') return false;
        const hostname = parsed.hostname.toLowerCase();
        if (APPROVED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
            return true;
        }
    } catch {
        return false;
    }

    if (PRODUCT_URL_PATTERNS.some(p => p.test(trimmed))) {
        return true;
    }

    return false;
}

/**
 * Sanitize URLs in AI response — remove unapproved links
 */
function sanitizeResponseUrls(text) {
    if (!text) return text;

    const markdownLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    const bareUrlRegex = /(?<!\()(https?:\/\/[^\s<>)\]"']+)/g;

    let result = text;

    result = result.replace(markdownLinkRegex, (match, linkText, url) => {
        if (isApprovedUrl(url)) return match;
        return linkText;
    });

    result = result.replace(bareUrlRegex, (match, url) => {
        if (isApprovedUrl(url)) return match;
        return '';
    });

    result = result.replace(/\[\s*\]\s*\(\s*\)/g, '');
    result = result.replace(/\[\s*\]\(\)/g, '');
    result = result.replace(/  +/g, ' ');

    return result.trim();
}

/**
 * Self-check: Verify response quality before sending
 * Returns: { passed, issues[], correctedText }
 */
function selfCheck(responseText, context = {}) {
    const issues = [];
    let text = responseText;

    // 1. Hallucination check — no invented URLs
    const urlRegex = /https?:\/\/[^\s<>)\]"']+/g;
    const urls = text.match(urlRegex) || [];
    for (const url of urls) {
        if (!isApprovedUrl(url)) {
            issues.push('invalid_url');
            text = text.replace(url, '').trim();
        }
    }

    // 2. Empty response check
    if (!text || text.trim().length < 5) {
        issues.push('empty_response');
    }

    // 3. Generic response check (too short for a complex question)
    if (context.isComplexQuestion && text.length < 100) {
        issues.push('too_short');
    }

    // 4. Language consistency check
    if (context.expectedLanguage === 'bangla' && /^[a-zA-Z\s?!,.]+$/.test(text)) {
        issues.push('language_mismatch');
    }

    // Clean up artifacts
    text = text.replace(/\[\s*\]\s*\(\s*\)/g, '');
    text = text.replace(/\[\s*\]\(\)/g, '');
    text = text.replace(/  +/g, ' ');

    return {
        passed: issues.length === 0,
        issues,
        correctedText: text.trim(),
    };
}

/**
 * Full reasoning pipeline: verify + sanitize + self-check
 */
function processResponse(responseText, context = {}) {
    // Step 1: Sanitize URLs
    let processed = sanitizeResponseUrls(responseText);

    // Step 2: Self-check
    const checkResult = selfCheck(processed, context);

    return {
        text: checkResult.correctedText,
        passed: checkResult.passed,
        issues: checkResult.issues,
    };
}

module.exports = {
    isApprovedUrl,
    sanitizeResponseUrls,
    selfCheck,
    processResponse,
    APPROVED_DOMAINS,
    APPROVED_URLS,
    PRODUCT_URL_PATTERNS,
};
