/**
 * Knowledge Agent — V35 Enterprise
 * Responsibilities: Search RAG, Search Government Sources, Search Internal Knowledge, Return verified facts only
 * Search Order: Internal Knowledge → Government Knowledge → Firebase Products → LLM (last resort)
 * V35: Added generateKnowledgeAnswer for KB-only fallback
 */

const { searchKnowledge, buildKnowledgeContext, ALL_DOCUMENTS } = require('../knowledge/index');

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
 * Returns both context string and raw documents
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
 * Search and return raw documents (for KB fallback answer generation)
 */
function searchRawDocuments(query, options = {}) {
    const { crop, disease, season, intent, limit = 5 } = options;
    const internalDocs = searchInternalKnowledge(query, { crop, disease, season, intent, limit });
    let govDocs = [];
    if (internalDocs.length < limit) {
        govDocs = searchGovernmentKnowledge(query, { crop, disease, season, limit: limit - internalDocs.length });
    }
    const allDocs = [...internalDocs];
    const seenIds = new Set(internalDocs.map(d => d.id));
    for (const doc of govDocs) {
        if (!seenIds.has(doc.id)) {
            allDocs.push(doc);
            seenIds.add(doc.id);
        }
    }
    return allDocs.slice(0, limit);
}

/**
 * Generate structured answer from knowledge base documents (when LLM unavailable)
 * V35: Builds readable, actionable answer from raw docs
 */
function generateKnowledgeAnswer(query, rawDocs, productContext, language) {
    const isEnglish = language === 'english';

    if (!rawDocs || rawDocs.length === 0) {
        return isEnglish
            ? `Based on our agriculture knowledge base, I couldn't find specific information about: ${query}

**General Recommendation:**
1. Contact your local DAE (Department of Agricultural Extension) office
2. Visit BARI website: bari.gov.bd
3. Consult with a local agriculture officer

**General Tips:**
- Always use verified seeds from authorized dealers
- Follow recommended fertilizer schedules
- Practice integrated pest management (IPM)
- Monitor weather conditions before applying any treatments

*For personalized advice, please consult your nearest agricultural extension office.*`
            : `আমাদের কৃষি জ্ঞান ভান্ডার থেকে "${query}" সম্পর্কে নির্দিষ্ট তথ্য পাওয়া যায়নি।

**সাধারণ সুপারিশ:**
১. আপনার নিকটস্থ কৃষি সম্প্রসারণ অফিসে (DAE) যোগাযোগ করুন
২. BARI ওয়েবসাইট দেখুন: bari.gov.bd
৩. স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন

**সাধারণ পরামর্শ:**
- সবসময় অনুমোদিত ডিলার থেকে যাচাইকৃত বীজ ব্যবহার করুন
- সুপারিশকৃত সারের সময়সূচি অনুসরণ করুন
- একীভূত পোকামাকড় ব্যবস্থাপনা (IPM) অনুশীলন করুন

*ব্যক্তিগত পরামর্শের জন্য আপনার নিকটস্থ কৃষি সম্প্রসারণ অফিসে যোগাযোগ করুন।*`;
    }

    let answer = '';

    // Process each document
    for (const doc of rawDocs.slice(0, 3)) {
        const title = doc.title || doc.name || '';
        const localNames = doc.local_names || {};
        const banglaName = localNames.bangla || '';
        const displayName = isEnglish ? title : (banglaName || title);

        // Disease info
        if (doc.disease || doc.type === 'fungal' || doc.type === 'bacterial' || doc.type === 'viral') {
            answer += isEnglish ? `**${title}**\n` : `**${displayName}**\n`;

            if (doc.cause) answer += isEnglish ? `Cause: ${doc.cause}\n` : `কারণ: ${doc.cause}\n`;
            if (doc.symptoms) {
                if (doc.symptoms.early) answer += isEnglish ? `Early Symptoms: ${doc.symptoms.early}\n` : `প্রাথমিক লক্ষণ: ${doc.symptoms.early}\n`;
                if (doc.symptoms.late) answer += isEnglish ? `Late Symptoms: ${doc.symptoms.late}\n` : `উন্নত লক্ষণ: ${doc.symptoms.late}\n`;
            }
            if (doc.organic_control?.length) answer += isEnglish ? `Organic Treatment: ${doc.organic_control.join(', ')}\n` : `জৈব চিকিৎসা: ${doc.organic_control.join(', ')}\n`;
            if (doc.chemical_control?.length) answer += isEnglish ? `Chemical Treatment: ${doc.chemical_control.join(', ')}\n` : `রাসায়নিক চিকিৎসা: ${doc.chemical_control.join(', ')}\n`;
            if (doc.prevention?.length) answer += isEnglish ? `Prevention: ${doc.prevention.join(', ')}\n` : `প্রতিরোধ: ${doc.prevention.join(', ')}\n`;
            answer += '\n';
        }

        // Fertilizer info
        if (doc.fertilizer_schedule?.length || doc.organic_fertilizer?.length || doc.chemical_fertilizer?.length) {
            answer += isEnglish ? `**${title} - Fertilizer Guide**\n` : `**${displayName} - সার নির্দেশিকা**\n`;

            if (doc.fertilizer_schedule?.length) {
                doc.fertilizer_schedule.forEach(f => {
                    answer += `- ${f.stage}: ${f.fertilizer} ${f.amount}\n`;
                });
            }
            if (doc.organic_fertilizer?.length) answer += isEnglish ? `Organic: ${doc.organic_fertilizer.join(', ')}\n` : `জৈব সার: ${doc.organic_fertilizer.join(', ')}\n`;
            if (doc.chemical_fertilizer?.length) answer += isEnglish ? `Chemical: ${doc.chemical_fertilizer.join(', ')}\n` : `রাসায়নিক সার: ${doc.chemical_fertilizer.join(', ')}\n`;
            answer += '\n';
        }

        // General tips
        if (doc.tips?.length) {
            answer += isEnglish ? `**Tips:**\n` : `**পরামর্শ:**\n`;
            doc.tips.forEach(tip => { answer += `- ${tip}\n`; });
            answer += '\n';
        }

        // Common questions
        if (doc.common_questions?.length) {
            doc.common_questions.slice(0, 2).forEach(q => {
                answer += isEnglish ? `**Q: ${q.q}**\nA: ${q.a}\n\n` : `**প্রশ্ন: ${q.q}**\nউত্তর: ${q.a}\n\n`;
            });
        }
    }

    // Add product context
    if (productContext) {
        answer += productContext + '\n\n';
    }

    // Add source
    const sources = [...new Set(rawDocs.map(d => d.source).filter(Boolean))];
    if (sources.length > 0) {
        answer += isEnglish
            ? `*Sources: ${sources.join(', ')}*\n*For more details, visit bari.gov.bd or dae.gov.bd*`
            : `*তথ্যসূত্র: ${sources.join(', ')}*\n*আরও তথ্যের জন্য bari.gov.bd অথবা dae.gov.bd দেখুন*`;
    }

    return answer;
}

/**
 * Verify that references in the response are valid
 * Only allows references that exist in our knowledge base
 * V33 FIX: Use hostname check instead of startsWith to prevent domain spoofing
 */
function verifyReferences(responseText) {
    if (!responseText) return { valid: true, text: responseText };

    const approvedUrls = ALL_DOCUMENTS.filter(d => d.url).map(d => d.url);

    // V33 FIX: Extract hostnames from approved URLs for proper comparison
    const approvedHostnames = approvedUrls.map(url => {
        try { return new URL(url).hostname; } catch { return null; }
    }).filter(Boolean);

    // Check for any URLs in the response
    const urlRegex = /https?:\/\/[^\s<>)\]"']+/g;
    const urls = responseText.match(urlRegex) || [];

    let text = responseText;
    let hasInvalid = false;

    for (const url of urls) {
        let isValid = false;
        try {
            const parsed = new URL(url);
            const hostname = parsed.hostname.toLowerCase();
            // V33 FIX: Exact hostname match or subdomain match
            isValid = approvedHostnames.some(approved =>
                hostname === approved || hostname.endsWith('.' + approved)
            );
        } catch {
            isValid = false;
        }

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
    searchRawDocuments,
    generateKnowledgeAnswer,
    verifyReferences,
};
