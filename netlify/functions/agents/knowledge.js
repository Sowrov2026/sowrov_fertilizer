/**
 * Knowledge Agent — V11 Enterprise
 * Responsibilities: Search RAG, Search Government Sources, Search Internal Knowledge, Return verified facts only
 * Search Order: Internal Knowledge → Government Knowledge → Firebase Products → LLM (last resort)
 */

const { searchKnowledge, buildKnowledgeContext } = require('../knowledge/index');

/**
 * Search internal knowledge base
 * Priority 1: Internal Knowledge
 */
function searchInternalKnowledge(query, options = {}) {
    return searchKnowledge(query, options);
}

/**
 * Search government sources (subset of knowledge base)
 * Priority 2: Government Knowledge
 */
function searchGovernmentKnowledge(query, options = {}) {
    return searchKnowledge(query, { ...options, intent: 'government' });
}

/**
 * Build comprehensive knowledge context for LLM
 * Combines internal + government sources
 */
function buildFullKnowledgeContext(query, options = {}) {
    const { crop, disease, season, intent, limit = 5 } = options;

    // Priority 1: Internal Knowledge
    const internalDocs = searchInternalKnowledge(query, { crop, disease, season, intent, limit });

    // Priority 2: Government Knowledge (if not enough internal docs)
    let govDocs = [];
    if (internalDocs.length < limit) {
        govDocs = searchGovernmentKnowledge(query, { crop, disease, season, limit: limit - internalDocs.length });
    }

    // Merge and deduplicate
    const allDocs = [...internalDocs];
    const seenIds = new Set(internalDocs.map(d => d.id));
    for (const doc of govDocs) {
        if (!seenIds.has(doc.id)) {
            allDocs.push(doc);
            seenIds.add(doc.id);
        }
    }

    return buildKnowledgeContext(allDocs.slice(0, limit));
}

/**
 * Verify that references in the response are valid
 * Only allows references that exist in our knowledge base
 */
function verifyReferences(responseText) {
    if (!responseText) return { valid: true, text: responseText };

    const { ALL_DOCUMENTS } = require('../knowledge/index');
    const approvedUrls = ALL_DOCUMENTS.filter(d => d.url).map(d => d.url);

    // Check for any URLs in the response
    const urlRegex = /https?:\/\/[^\s<>)\]"']+/g;
    const urls = responseText.match(urlRegex) || [];

    let text = responseText;
    let hasInvalid = false;

    for (const url of urls) {
        const isValid = approvedUrls.some(approved => url.startsWith(approved));
        if (!isValid) {
            // Remove invalid URL but keep text
            text = text.replace(url, '').trim();
            hasInvalid = true;
        }
    }

    // Clean up empty markdown artifacts
    text = text.replace(/\[\s*\]\s*\(\s*\)/g, '');
    text = text.replace(/\[\s*\]\(\)/g, '');
    text = text.replace(/  +/g, ' ');

    return {
        valid: !hasInvalid,
        text: text.trim(),
    };
}

module.exports = {
    searchInternalKnowledge,
    searchGovernmentKnowledge,
    buildFullKnowledgeContext,
    verifyReferences,
};
