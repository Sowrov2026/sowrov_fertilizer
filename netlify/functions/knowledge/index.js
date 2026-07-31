/**
 * Knowledge Base Index — V11 Enterprise Architecture
 * Aggregates all knowledge modules into unified searchable database
 */

const tomato = require('./crops/tomato');
const rice = require('./crops/rice');
const chili = require('./crops/chili');
const eggplant = require('./crops/eggplant');
const potato = require('./crops/potato');
const onion = require('./crops/onion');
const otherCrops = require('./crops/other');
const fungal = require('./diseases/fungal');
const bacterial = require('./diseases/bacterial');
const viral = require('./diseases/viral');
const pest = require('./diseases/pest');
const organic = require('./fertilizers/organic');
const chemical = require('./fertilizers/chemical');
const seasonal = require('./weather/seasonal');
const soil = require('./soil/soil');
const government = require('./government/government');
const faq = require('./faq/faq');

const ALL_DOCUMENTS = [
    ...tomato,
    ...rice,
    ...chili,
    ...eggplant,
    ...potato,
    ...onion,
    ...otherCrops,
    ...fungal,
    ...bacterial,
    ...viral,
    ...pest,
    ...organic,
    ...chemical,
    ...seasonal,
    ...soil,
    ...government,
    ...faq,
];

/**
 * Search knowledge base by keyword matching + metadata filtering
 * Priority 1: Internal Knowledge (this base)
 */
function searchKnowledge(query, options = {}) {
    if (!query || typeof query !== 'string') return [];

    const { crop, disease, season, intent, limit = 5 } = options;
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    const scored = ALL_DOCUMENTS.map(doc => {
        let score = 0;
        const contentLower = doc.content.toLowerCase();
        const titleLower = doc.title.toLowerCase();

        // Title exact match (highest score)
        if (titleLower.includes(queryLower)) score += 15;

        // Content keyword matching
        for (const word of queryWords) {
            if (contentLower.includes(word)) score += 2;
            if (titleLower.includes(word)) score += 4;
        }

        // Intent-based boosting
        if (intent === 'disease' && doc.disease) score += 5;
        if (intent === 'fertilizer' && !doc.disease) score += 5;
        if (intent === 'government' && doc.source !== 'SF') score += 3;

        // Crop filter
        if (crop && doc.crop === crop) score += 8;
        else if (crop && doc.crop !== 'সর্বজনীন' && doc.crop !== crop) score -= 5;

        // Disease filter
        if (disease && doc.disease) {
            if (doc.disease.includes(disease) || disease.includes(doc.disease)) score += 8;
        }

        // Season filter
        if (season && doc.season === season) score += 4;
        else if (season && doc.season !== 'সর্বকালীন') score -= 3;

        // Source priority
        if (doc.source === 'BARI') score += 2;
        else if (doc.source === 'BRRI') score += 2;
        else if (doc.source === 'DAE') score += 1;

        return { ...doc, score };
    });

    return scored
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * Build context string from retrieved documents for LLM
 */
function buildKnowledgeContext(docs) {
    if (!docs || docs.length === 0) return '';

    let context = '\n\n📚 INTERNAL KNOWLEDGE BASE (Verified Sources):\n\n';

    docs.forEach((doc, i) => {
        context += `Document ${i + 1}:\n`;
        context += `- Title: ${doc.title}\n`;
        context += `- Source: ${doc.source}\n`;
        if (doc.url) context += `- URL: ${doc.url}\n`;
        context += `- Crop: ${doc.crop}\n`;
        if (doc.disease) context += `- Disease: ${doc.disease}\n`;
        if (doc.season) context += `- Season: ${doc.season}\n`;
        context += `- Content: ${doc.content}\n\n`;
    });

    context += '\n⚠️ INSTRUCTIONS: Use these verified internal documents to answer. Reference sources when relevant. Never invent references not shown above.\n';

    return context;
}

module.exports = {
    ALL_DOCUMENTS,
    searchKnowledge,
    buildKnowledgeContext,
};
