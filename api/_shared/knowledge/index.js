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

    const { crop, disease, season, intent, subIntent, limit = 5 } = options;
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
        const banglaLower = banglaName.toLowerCase();

        // FAQ-specific fields
        const faqQuestion = doc.question?.bangla || doc.question?.english || doc.question?.chatgaiya || '';

        // Build searchable text from all fields
        const allText = [title, content, banglaName, englishName, chatgaiyaName,
            faqQuestion,
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

        // ── Intent-based boosting (refined) ──
        const isDiseaseDoc = !!(doc.disease || doc.type === 'fungal' || doc.type === 'bacterial' || doc.type === 'viral');
        const isFertilizerDoc = !!(doc.fertilizer_schedule?.length || doc.organic_fertilizer?.length || doc.chemical_fertilizer?.length);
        const isCropGeneralDoc = !!(doc.fertilizer_schedule && !doc.disease && !doc.organic_control && !doc.chemical_control);
        const titleLooksLikeDisease = /disease|রোগ|guide/i.test(title);

        // Extract docCrop early (needed for disease-name matching)
        const docCrop = doc.crop || banglaName || englishName || '';

        // ── Disease-name-specific matching ──
        // When intent is disease, detect specific disease names in the query
        // and strongly boost documents that contain that exact disease.
        if (intent === 'disease') {
            const BANGLA_DISEASE_NAMES = [
                { names: ['ব্লাস্ট', 'blast', 'ব্লাস্ট রোগ'], docPatterns: ['ব্লাস্ট', 'blast', 'Pyricularia'] },
                { names: ['টুংরো', 'tungro', 'টাঙ্গরো', 'tangro'], docPatterns: ['টুংরো', 'tungro', 'টাঙ্গরো', 'tangro'] },
                { names: ['শিউথ', 'sheath', 'শিউথ ব্লাইট'], docPatterns: ['শিউথ', 'sheath'] },
                { names: ['ব্লাইট', 'blight'], docPatterns: ['ব্লাইট', 'blight'] },
                { names: ['হরিতকী', 'haritoki', 'গাছ পুড়ে যাওয়া'], docPatterns: ['হরিতকী', 'haritoki'] },
                { names: ['ব্রাউন স্পট', 'brown spot'], docPatterns: ['ব্রাউন স্পট', 'brown spot'] },
                { names: ['তিলা', 'tela', 'ব্যাকটেরিয়াল ব্লাইট'], docPatterns: ['তিলা', 'tela'] },
                { names: ['পাতা হলুদ', 'leaf yellow', 'পিঁচড়া'], docPatterns: ['পাতা হলুদ', 'leaf yellow', 'পিঁচড়া'] },
                { names: ['দাগ', 'spot', 'লিফ স্পট'], docPatterns: ['দাগ', 'spot', 'লিফ স্পট'] },
                { names: ['পচা', 'rot', 'গলা', 'wilt'], docPatterns: ['পচা', 'rot', 'গলা', 'wilt'] },
                { names: ['মলদ্রব', 'bacterial ooze'], docPatterns: ['মলদ্রব', 'bacterial ooze'] },
                { names: ['ফাংগাস', 'fungus', 'ছত্রাক'], docPatterns: ['ফাংগাস', 'fungus', 'ছত্রাক'] },
                { names: ['পোকা', 'insect', 'pest'], docPatterns: ['পোকা', 'insect', 'pest'] },
            ];
            const queryLower = query.toLowerCase();
            for (const dn of BANGLA_DISEASE_NAMES) {
                if (dn.names.some(n => queryLower.includes(n))) {
                    const docNameLower = (doc.name || '').toLowerCase();
                    const docBanglaLower = banglaName.toLowerCase();
                    const docDiseases = (doc.diseases || []).map(d => d.toLowerCase());
                    const docAffected = (doc.affected_crops || []).map(c => c.toLowerCase());
                    const nameMatch = dn.docPatterns.some(p => docNameLower.includes(p) || docBanglaLower.includes(p));
                    const diseasesArrayMatch = dn.docPatterns.some(p => docDiseases.some(d => d.includes(p)));
                    const allTextMatch = dn.docPatterns.some(p => allText.includes(p));
                    if (nameMatch) score += 20;
                    else if (diseasesArrayMatch) score += 15;
                    else if (allTextMatch && crop && docAffected.some(c => c.includes(crop))) score += 10;
                    break;
                }
            }
        }

        if (intent === 'fertilizer') {
            if (isFertilizerDoc && !isDiseaseDoc && !titleLooksLikeDisease) score += 8;
            else if (isFertilizerDoc && isDiseaseDoc) score += 2;
            else if (isDiseaseDoc && !isFertilizerDoc) score -= 10;
            else if (titleLooksLikeDisease && !isFertilizerDoc) score -= 8;
        }
        if (intent === 'disease') {
            if (isDiseaseDoc) score += 8;
            if (isFertilizerDoc && !isDiseaseDoc) score -= 5;
        }
        if (intent === 'government' && doc.source !== 'SF') score += 3;
        if (intent === 'weather' && doc.weather) score += 5;
        if (intent === 'soil' && doc.soil) score += 5;
        if (intent === 'product' && doc.url && doc.url.includes('firebase')) score += 5;

        // Crop filter
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
 * Intent-aware: only includes fields relevant to the detected intent
 */
function buildKnowledgeContext(docs, options = {}) {
    if (!docs || docs.length === 0) return '';

    const { intent = 'general', subIntent = 'informational' } = options;
    let context = '\n\n📚 SUPPLEMENTAL REFERENCE (Verified Sources — use as additional context, not exclusive source):\n\n';

    docs.forEach((doc, i) => {
        context += `Document ${i + 1}:\n`;
        const title = doc.title || doc.name || 'Unknown';
        const localNames = doc.local_names || {};
        context += `- Title: ${title}\n`;
        if (localNames.bangla) context += `- Bangla: ${localNames.bangla}\n`;
        if (localNames.english) context += `- English: ${localNames.english}\n`;
        context += `- Source: ${doc.source}\n`;
        if (doc.crop) context += `- Crop: ${doc.crop}\n`;

        if (intent === 'fertilizer') {
            if (doc.fertilizer_schedule) context += `- Fertilizer Schedule: ${doc.fertilizer_schedule.map(f => f.stage + ': ' + f.fertilizer + ' ' + f.amount).join('; ')}\n`;
            if (doc.organic_fertilizer?.length) context += `- Organic Fertilizer: ${doc.organic_fertilizer.join(', ')}\n`;
            if (doc.chemical_fertilizer?.length) context += `- Chemical Fertilizer: ${doc.chemical_fertilizer.join(', ')}\n`;
            if (subIntent === 'calculation') {
                const fertQA = (doc.common_questions || []).filter(q =>
                    /সার|fertilizer|ইউরিয়া|urea|ডিএপি|dap|কেসিএ|এমওপি/i.test(q.q) && /\d/.test(q.a)
                );
                if (fertQA.length) context += `- Fertilizer Rates: ${fertQA.map(q => q.q + ' → ' + q.a).join('; ')}\n`;
            } else {
                const fertQA = (doc.common_questions || []).filter(q =>
                    /সার|fertilizer/i.test(q.q)
                );
                if (fertQA.length) context += `- Common Q: ${fertQA.slice(0, 2).map(q => q.q + ' → ' + q.a).join('; ')}\n`;
            }
            if (doc.tips) context += `- Tips: ${doc.tips.join('; ')}\n`;
        } else if (intent === 'disease') {
            if (doc.disease || doc.type === 'fungal' || doc.type === 'bacterial' || doc.type === 'viral') {
                if (doc.cause) context += `- Cause: ${doc.cause}\n`;
                if (doc.symptoms) context += `- Symptoms: ${doc.symptoms.early || ''} ${doc.symptoms.late || ''}\n`;
                if (doc.organic_control?.length) context += `- Organic Treatment: ${doc.organic_control.join(', ')}\n`;
                if (doc.chemical_control?.length) context += `- Chemical Treatment: ${doc.chemical_control.join(', ')}\n`;
                if (doc.prevention?.length) context += `- Prevention: ${doc.prevention.join(', ')}\n`;
                if (doc.severity) context += `- Severity: ${doc.severity}\n`;
            }
            if (doc.tips) context += `- Tips: ${doc.tips.join('; ')}\n`;
            const diseaseQA = (doc.common_questions || []).filter(q =>
                /রোগ|disease|blight|symptom|লক্ষণ/i.test(q.q)
            );
            if (diseaseQA.length) context += `- Common Q: ${diseaseQA.slice(0, 2).map(q => q.q + ' → ' + q.a).join('; ')}\n`;
        } else {
            // General: include a compact set of fields
            if (doc.type) context += `- Type: ${doc.type}\n`;
            if (doc.fertilizer_schedule) context += `- Fertilizer Schedule: ${doc.fertilizer_schedule.map(f => f.stage + ': ' + f.fertilizer + ' ' + f.amount).join('; ')}\n`;
            if (doc.organic_fertilizer?.length) context += `- Organic Fertilizer: ${doc.organic_fertilizer.join(', ')}\n`;
            if (doc.chemical_fertilizer?.length) context += `- Chemical Fertilizer: ${doc.chemical_fertilizer.join(', ')}\n`;
            if (doc.tips) context += `- Tips: ${doc.tips.join('; ')}\n`;
            if (doc.common_questions) context += `- Common Q: ${doc.common_questions.slice(0, 2).map(q => q.q + ' → ' + q.a).join('; ')}\n`;
        }

        context += '\n';
    });

    context += '\n📌 NOTE: The above are supplemental reference documents from verified sources. Use them when relevant, but you may also answer from your general agricultural knowledge when these documents do not cover the question.\n';

    return context;
}

export { ALL_DOCUMENTS, searchKnowledge, buildKnowledgeContext };
