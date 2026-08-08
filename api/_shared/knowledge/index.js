import tomato from './crops/tomato.js';
import rice from './crops/rice.js';
import chili from './crops/chili.js';
import brinjal from './crops/brinjal.js';
import potato from './crops/potato.js';
import onion from './crops/onion.js';
import garlic from './crops/garlic.js';
import mango from './crops/mango.js';
import banana from './crops/banana.js';
import papaya from './crops/papaya.js';
import cucumber from './crops/cucumber.js';
import watermelon from './crops/watermelon.js';
import cabbage from './crops/cabbage.js';
import cauliflower from './crops/cauliflower.js';
import lau from './crops/lau.js';
import jackfruit from './crops/jackfruit.js';
import eggplant from './crops/eggplant.js';
import otherCrops from './crops/other.js';
import fungal from './diseases/fungal.js';
import bacterial from './diseases/bacterial.js';
import viral from './diseases/viral.js';
import nutrient from './diseases/nutrient.js';
import pestDiseases from './diseases/pest.js';
import organic from './fertilizers/organic.js';
import chemical from './fertilizers/chemical.js';
import insects from './insects/insects.js';
import weeds from './weeds/weeds.js';
import pests from './pests/pests.js';
import seasonal from './weather/seasonal.js';
import soil from './soil/soil.js';
import government from './government/government.js';
import faq from './faq/faq.js';
import faqDB from './faq/database.js';

const ALL_DOCUMENTS = [
    ...tomato,
    ...rice,
    ...chili,
    ...brinjal,
    ...potato,
    ...onion,
    ...garlic,
    ...mango,
    ...banana,
    ...papaya,
    ...cucumber,
    ...watermelon,
    ...cabbage,
    ...cauliflower,
    ...lau,
    ...jackfruit,
    ...eggplant,
    ...otherCrops,
    ...fungal,
    ...bacterial,
    ...viral,
    ...nutrient,
    ...pestDiseases,
    ...organic,
    ...chemical,
    ...insects,
    ...weeds,
    ...pests,
    ...seasonal,
    ...soil,
    ...government,
    ...faq,
    ...faqDB,
];

/**
 * Search knowledge base by keyword matching + metadata filtering
 * Priority 1: Internal Knowledge (this base)
 * Handles both V11 (title/content) and V12 (name/local_names) formats
 */
function searchKnowledge(query, options = {}) {
    if (!query || typeof query !== 'string') return [];

    const { crop, disease, season, intent, limit = 5 } = options;
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    const scored = ALL_DOCUMENTS.map(doc => {
        let score = 0;

        // Handle both V11 and V12 formats
        const title = doc.title || doc.name || '';
        const content = doc.content || '';
        const localNames = doc.local_names || {};
        const banglaName = localNames.bangla || '';
        const englishName = localNames.english || '';
        const chatgaiyaName = localNames.chatgaiya || '';
        const titleLower = title.toLowerCase();
        const contentLower = content.toLowerCase();
        const banglaLower = banglaName.toLowerCase();

        // FAQ-specific fields
        const faqQuestion = doc.question?.bangla || doc.question?.english || doc.question?.chatgaiya || '';
        const faqAnswer = doc.answer?.bangla || doc.answer?.english || '';
        const faqKeywords = (doc.keywords || []).join(' ');

        // Build searchable text from all fields
        const allText = [title, content, banglaName, englishName, chatgaiyaName,
            faqQuestion, faqAnswer, faqKeywords,
            doc.cause || '', doc.symptoms?.early || '', doc.symptoms?.late || '',
            ...(doc.organic_control || []), ...(doc.chemical_control || []),
            ...(doc.prevention || []), ...(doc.tips || []),
            ...(doc.common_questions || []).map(q => q.q + ' ' + q.a),
            ...(doc.keywords || []),
            ...(doc.fertilizer_schedule || []).map(f => f.fertilizer),
            ...(doc.organic_fertilizer || []),
            ...(doc.chemical_fertilizer || []),
            doc.source || ''
        ].join(' ').toLowerCase();

        // Title exact match (highest score)
        if (titleLower.includes(queryLower) || banglaLower.includes(queryLower)) score += 15;

        // FAQ title/question exact match
        const faqTitleLower = faqQuestion.toLowerCase();
        if (faqTitleLower.includes(queryLower)) score += 12;

        // Content keyword matching
        for (const word of queryWords) {
            if (allText.includes(word)) score += 2;
            if (titleLower.includes(word)) score += 4;
            if (banglaLower.includes(word)) score += 3;
        }

        // Intent-based boosting
        if (intent === 'disease' && (doc.disease || doc.type === 'fungal' || doc.type === 'bacterial' || doc.type === 'viral')) score += 5;
        if (intent === 'fertilizer' && (doc.organic_control || doc.chemical_control || doc.fertilizer_schedule)) score += 5;
        if (intent === 'government' && doc.source !== 'SF') score += 3;
        if (intent === 'weather' && doc.weather) score += 5;
        if (intent === 'soil' && doc.soil) score += 5;
        if (intent === 'product' && doc.url && doc.url.includes('firebase')) score += 5;

        // Crop filter
        const docCrop = doc.crop || banglaName || englishName || '';
        if (crop && (docCrop.includes(crop) || banglaName.includes(crop))) score += 8;
        else if (crop && docCrop !== 'সর্বজনীন' && !docCrop.includes(crop)) score -= 5;

        // Disease filter
        const docDisease = doc.disease || doc.name || '';
        if (disease && (docDisease.includes(disease) || disease.includes(docDisease))) score += 8;

        // Season filter
        const docSeason = doc.season || (doc.seasonal?.rabi ? 'রবি' : doc.seasonal?.kharif ? 'খরিফ' : 'সর্বকালীন');
        if (season && docSeason === season) score += 4;
        else if (season && docSeason !== 'সর্বকালীন') score -= 3;

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
 * Handles both V11 and V12 formats
 */
function buildKnowledgeContext(docs) {
    if (!docs || docs.length === 0) return '';

    let context = '\n\n📚 INTERNAL KNOWLEDGE BASE (Verified Sources):\n\n';

    docs.forEach((doc, i) => {
        context += `Document ${i + 1}:\n`;
        const title = doc.title || doc.name || 'Unknown';
        const localNames = doc.local_names || {};
        context += `- Title: ${title}\n`;
        if (localNames.bangla) context += `- Bangla: ${localNames.bangla}\n`;
        if (localNames.chatgaiya) context += `- Chatgaiya: ${localNames.chatgaiya}\n`;
        if (localNames.english) context += `- English: ${localNames.english}\n`;
        context += `- Source: ${doc.source}\n`;
        if (doc.url) context += `- URL: ${doc.url}\n`;
        if (doc.crop) context += `- Crop: ${doc.crop}\n`;
        if (doc.disease) context += `- Disease: ${doc.disease}\n`;
        if (doc.season) context += `- Season: ${doc.season}\n`;
        if (doc.type) context += `- Type: ${doc.type}\n`;
        if (doc.severity) context += `- Severity: ${doc.severity}\n`;
        if (doc.cause) context += `- Cause: ${doc.cause}\n`;
        if (doc.symptoms) context += `- Symptoms: ${doc.symptoms.early || ''} ${doc.symptoms.late || ''}\n`;
        if (doc.organic_control) context += `- Organic Control: ${doc.organic_control.join(', ')}\n`;
        if (doc.chemical_control) context += `- Chemical Control: ${doc.chemical_control.join(', ')}\n`;
        if (doc.prevention) context += `- Prevention: ${doc.prevention.join(', ')}\n`;
        if (doc.fertilizer_schedule) context += `- Fertilizer Schedule: ${doc.fertilizer_schedule.map(f => f.stage + ': ' + f.fertilizer + ' ' + f.amount).join('; ')}\n`;
        if (doc.tips) context += `- Tips: ${doc.tips.join('; ')}\n`;
        if (doc.common_questions) context += `- Common Q: ${doc.common_questions.map(q => q.q + ' → ' + q.a).join('; ')}\n`;
        if (doc.soil) context += `- Soil: pH ${doc.soil.pH || ''}, Type: ${doc.soil.type || ''}\n`;
        if (doc.temperature) context += `- Temperature: ${doc.temperature.min}-${doc.temperature.max}°C (optimal: ${doc.temperature.optimal}°C)\n`;
        if (doc.watering) context += `- Watering: ${doc.watering.frequency || ''}, ${doc.watering.method || ''}\n`;
        if (doc.yield) context += `- Yield: ${doc.yield.per_acre || ''}\n`;
        if (doc.harvest) context += `- Harvest: ${doc.harvest.method || ''}, ${doc.harvest.indicators || ''}\n`;
        const content = doc.content || '';
        if (content) context += `- Content: ${content}\n`;
        context += '\n';
    });

    context += '\n⚠️ INSTRUCTIONS: Use these verified internal documents to answer. Reference sources when relevant. Never invent references not shown above.\n';

    return context;
}

export { ALL_DOCUMENTS, searchKnowledge, buildKnowledgeContext };
