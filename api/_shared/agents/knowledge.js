import { searchKnowledge, buildKnowledgeContext, ALL_DOCUMENTS } from '../knowledge/index.js';

function searchInternalKnowledge(query, options = {}) {
    return searchKnowledge(query, options);
}

function searchGovernmentKnowledge(query, options = {}) {
    return searchKnowledge(query, { ...options, intent: 'government' });
}

function buildFullKnowledgeContext(query, options = {}) {
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

    return buildKnowledgeContext(allDocs.slice(0, limit));
}

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

    for (const doc of rawDocs.slice(0, 3)) {
        const title = doc.title || doc.name || '';
        const localNames = doc.local_names || {};
        const banglaName = localNames.bangla || '';
        const displayName = isEnglish ? title : (banglaName || title);

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

        if (doc.tips?.length) {
            answer += isEnglish ? `**Tips:**\n` : `**পরামর্শ:**\n`;
            doc.tips.forEach(tip => { answer += `- ${tip}\n`; });
            answer += '\n';
        }

        if (doc.common_questions?.length) {
            doc.common_questions.slice(0, 2).forEach(q => {
                answer += isEnglish ? `**Q: ${q.q}**\nA: ${q.a}\n\n` : `**প্রশ্ন: ${q.q}**\nউত্তর: ${q.a}\n\n`;
            });
        }
    }

    if (productContext) {
        answer += productContext + '\n\n';
    }

    const sources = [...new Set(rawDocs.map(d => d.source).filter(Boolean))];
    if (sources.length > 0) {
        answer += isEnglish
            ? `*Sources: ${sources.join(', ')}*\n*For more details, visit bari.gov.bd or dae.gov.bd*`
            : `*তথ্যসূত্র: ${sources.join(', ')}*\n*আরও তথ্যের জন্য bari.gov.bd অথবা dae.gov.bd দেখুন*`;
    }

    if (!answer.trim()) {
        const titles = rawDocs.slice(0, 3).map(d => d.title || d.name || '').filter(Boolean);
        answer = isEnglish
            ? `I found some relevant information related to your query:\n${titles.length ? titles.map(t => '- ' + t).join('\n') : ''}\n\n**General Advice:**\n- Consult your local agriculture officer for specific guidance\n- Visit bari.gov.bd for verified crop information\n- Call our hotline: 01829-775552`
            : `আপনার প্রশ্নের সাথে সম্পর্কিত কিছু তথ্য পাওয়া গেছে:\n${titles.length ? titles.map(t => '- ' + t).join('\n') : ''}\n\n**সাধারণ পরামর্শ:**\n- নির্দিষ্ট নির্দেশনার জন্য আপনার স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন\n- যাচাইকৃত ফসলের তথ্যের জন্য bari.gov.bd দেখুন\n- আমাদের হটলাইনে কল করুন: 01829-775552`;
    }

    return answer;
}

function verifyReferences(responseText) {
    if (!responseText) return { valid: true, text: responseText };

    const approvedUrls = ALL_DOCUMENTS.filter(d => d.url).map(d => d.url);

    const approvedHostnames = approvedUrls.map(url => {
        try { return new URL(url).hostname; } catch { return null; }
    }).filter(Boolean);

    const urlRegex = /https?:\/\/[^\s<>)\]"']+/g;
    const urls = responseText.match(urlRegex) || [];

    let text = responseText;
    let hasInvalid = false;

    for (const url of urls) {
        let isValid = false;
        try {
            const parsed = new URL(url);
            const hostname = parsed.hostname.toLowerCase();
            isValid = approvedHostnames.some(approved =>
                hostname === approved || hostname.endsWith('.' + approved)
            );
        } catch {
            isValid = false;
        }

        if (!isValid) {
            text = text.replace(url, '').trim();
            hasInvalid = true;
        }
    }

    text = text.replace(/\[\s*\]\s*\(\s*\)/g, '');
    text = text.replace(/\[\s*\]\(\)/g, '');
    text = text.replace(/  +/g, ' ');

    return {
        valid: !hasInvalid,
        text: text.trim(),
    };
}

export {
    searchInternalKnowledge,
    searchGovernmentKnowledge,
    buildFullKnowledgeContext,
    searchRawDocuments,
    generateKnowledgeAnswer,
    verifyReferences,
};
