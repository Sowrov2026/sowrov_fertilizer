import { searchKnowledge, buildKnowledgeContext, ALL_DOCUMENTS } from '../knowledge/index.js';

function searchInternalKnowledge(query, options = {}) {
    return searchKnowledge(query, options);
}

function searchGovernmentKnowledge(query, options = {}) {
    return searchKnowledge(query, { ...options, intent: 'government' });
}

function buildFullKnowledgeContext(query, options = {}) {
    const { crop, disease, season, intent, subIntent, limit = 5 } = options;

    const internalDocs = searchInternalKnowledge(query, { crop, disease, season, intent, subIntent, limit });

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

    return buildKnowledgeContext(allDocs.slice(0, limit), { intent, subIntent });
}

function searchRawDocuments(query, options = {}) {
    const { crop, disease, season, intent, subIntent, limit = 5 } = options;
    const internalDocs = searchInternalKnowledge(query, { crop, disease, season, intent, subIntent, limit });
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

function generateKnowledgeAnswer(query, rawDocs, productContext, language, options = {}) {
    const isEnglish = language === 'english';
    const { intent = 'general', subIntent = 'informational', calculationResult = null } = options;

    if (!rawDocs || rawDocs.length === 0) {
        return isEnglish
            ? `Based on our agriculture knowledge base, I couldn't find specific information about: ${query}

**General Recommendation:**
1. Contact your local DAE (Department of Agricultural Extension) office
2. Visit BARI website: bari.gov.bd
3. Consult with a local agriculture officer

*For personalized advice, please consult your nearest agricultural extension office.*`
            : `আমাদের কৃষি জ্ঞান ভান্ডার থেকে "${query}" সম্পর্কে নির্দিষ্ট তথ্য পাওয়া যায়নি।

**সাধারণ সুপারিশ:**
১. আপনার নিকটস্থ কৃষি সম্প্রসারণ অফিসে (DAE) যোগাযোগ করুন
২. BARI ওয়েবসাইট দেখুন: bari.gov.bd
৩. স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন

*ব্যক্তিগত পরামর্শের জন্য আপনার নিকটস্থ কৃষি সম্প্রসারণ অফিসে যোগাযোগ করুন।*`;
    }

    let answer = '';

    if (calculationResult && calculationResult.type === 'calculated') {
        answer += isEnglish
            ? `**Calculation Result:**\n${calculationResult.resultText}\n\n`
            : `**হিসাবের ফলাফল:**\n${calculationResult.resultText}\n\n`;
    }

    const topDoc = rawDocs[0];
    const title = topDoc.title || topDoc.name || '';
    const localNames = topDoc.local_names || {};
    const banglaName = localNames.bangla || '';
    const displayName = isEnglish ? title : (banglaName || title);

    if (intent === 'fertilizer') {
        const hasFertData = topDoc.fertilizer_schedule?.length || topDoc.organic_fertilizer?.length || topDoc.chemical_fertilizer?.length;
        if (hasFertData) {
            answer += isEnglish ? `**${title} - Fertilizer Guide**\n` : `**${displayName} - সার নির্দেশিকা**\n`;
            if (topDoc.fertilizer_schedule?.length) {
                topDoc.fertilizer_schedule.forEach(f => {
                    answer += `- ${f.stage}: ${f.fertilizer} ${f.amount}\n`;
                });
            }
            if (topDoc.organic_fertilizer?.length) answer += isEnglish ? `Organic: ${topDoc.organic_fertilizer.join(', ')}\n` : `জৈব সার: ${topDoc.organic_fertilizer.join(', ')}\n`;
            if (topDoc.chemical_fertilizer?.length) answer += isEnglish ? `Chemical: ${topDoc.chemical_fertilizer.join(', ')}\n` : `রাসায়নিক সার: ${topDoc.chemical_fertilizer.join(', ')}\n`;
            answer += '\n';
        }
        if (topDoc.tips?.length) {
            answer += isEnglish ? `**Tips:**\n` : `**পরামর্শ:**\n`;
            topDoc.tips.forEach(tip => { answer += `- ${tip}\n`; });
            answer += '\n';
        }
        const fertQA = (topDoc.common_questions || []).filter(q =>
            /সার|fertilizer|ইউরিয়া|urea|ডিএপি|dap|কেসিএ|এমওপি|রেট|rate/i.test(q.q)
        );
        if (fertQA.length) {
            fertQA.slice(0, 1).forEach(q => {
                answer += isEnglish ? `**Q: ${q.q}**\nA: ${q.a}\n\n` : `**প্রশ্ন: ${q.q}**\nউত্তর: ${q.a}\n\n`;
            });
        }
    } else if (intent === 'disease') {
        if (topDoc.disease || topDoc.type === 'fungal' || topDoc.type === 'bacterial' || topDoc.type === 'viral') {
            answer += isEnglish ? `**${title}**\n` : `**${displayName}**\n`;
            if (topDoc.cause) answer += isEnglish ? `Cause: ${topDoc.cause}\n` : `কারণ: ${topDoc.cause}\n`;
            if (topDoc.symptoms) {
                if (topDoc.symptoms.early) answer += isEnglish ? `Early Symptoms: ${topDoc.symptoms.early}\n` : `প্রাথমিক লক্ষণ: ${topDoc.symptoms.early}\n`;
                if (topDoc.symptoms.late) answer += isEnglish ? `Late Symptoms: ${topDoc.symptoms.late}\n` : `উন্নত লক্ষণ: ${topDoc.symptoms.late}\n`;
            }
            if (topDoc.organic_control?.length) answer += isEnglish ? `Organic Treatment: ${topDoc.organic_control.join(', ')}\n` : `জৈব চিকিৎসা: ${topDoc.organic_control.join(', ')}\n`;
            if (topDoc.chemical_control?.length) answer += isEnglish ? `Chemical Treatment: ${topDoc.chemical_control.join(', ')}\n` : `রাসায়নিক চিকিৎসা: ${topDoc.chemical_control.join(', ')}\n`;
            if (topDoc.prevention?.length) answer += isEnglish ? `Prevention: ${topDoc.prevention.join(', ')}\n` : `প্রতিরোধ: ${topDoc.prevention.join(', ')}\n`;
            answer += '\n';
        }
        if (topDoc.tips?.length) {
            answer += isEnglish ? `**Tips:**\n` : `**পরামর্শ:**\n`;
            topDoc.tips.forEach(tip => { answer += `- ${tip}\n`; });
            answer += '\n';
        }
        const diseaseQA = (topDoc.common_questions || []).filter(q =>
            /রোগ|disease|blight|symptom|লক্ষণ/i.test(q.q)
        );
        if (diseaseQA.length) {
            diseaseQA.slice(0, 1).forEach(q => {
                answer += isEnglish ? `**Q: ${q.q}**\nA: ${q.a}\n\n` : `**প্রশ্ন: ${q.q}**\nউত্তর: ${q.a}\n\n`;
            });
        }
    } else {
        if (topDoc.fertilizer_schedule?.length || topDoc.organic_fertilizer?.length || topDoc.chemical_fertilizer?.length) {
            answer += isEnglish ? `**${title} - Fertilizer Guide**\n` : `**${displayName} - সার নির্দেশিকা**\n`;
            if (topDoc.fertilizer_schedule?.length) {
                topDoc.fertilizer_schedule.forEach(f => {
                    answer += `- ${f.stage}: ${f.fertilizer} ${f.amount}\n`;
                });
            }
            answer += '\n';
        }
        if (topDoc.tips?.length) {
            answer += isEnglish ? `**Tips:**\n` : `**পরামর্শ:**\n`;
            topDoc.tips.forEach(tip => { answer += `- ${tip}\n`; });
            answer += '\n';
        }
        if (topDoc.common_questions?.length) {
            topDoc.common_questions.slice(0, 1).forEach(q => {
                answer += isEnglish ? `**Q: ${q.q}**\nA: ${q.a}\n\n` : `**প্রশ্ন: ${q.q}**\nউত্তর: ${q.a}\n\n`;
            });
        }
    }

    if (productContext) {
        answer += productContext + '\n\n';
    }

    const sources = [...new Set(rawDocs.slice(0, 1).map(d => d.source).filter(Boolean))];
    if (sources.length > 0) {
        answer += isEnglish
            ? `*Sources: ${sources.join(', ')}*\n*For more details, visit bari.gov.bd or dae.gov.bd*`
            : `*তথ্যসূত্র: ${sources.join(', ')}*\n*আরও তথ্যের জন্য bari.gov.bd অথবা dae.gov.bd দেখুন*`;
    }

    if (!answer.trim()) {
        answer = isEnglish
            ? `I found some relevant information related to your query.\n\n**General Advice:**\n- Consult your local agriculture officer for specific guidance\n- Visit bari.gov.bd for verified crop information\n- Call our hotline: 01829-775552`
            : `আপনার প্রশ্নের সাথে সম্পর্কিত কিছু তথ্য পাওয়া গেছে।\n\n**সাধারণ পরামর্শ:**\n- নির্দিষ্ট নির্দেশনার জন্য আপনার স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন\n- যাচাইকৃত ফসলের তথ্যের জন্য bari.gov.bd দেখুন\n- আমাদের হটলাইনে কল করুন: 01829-775552`;
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
