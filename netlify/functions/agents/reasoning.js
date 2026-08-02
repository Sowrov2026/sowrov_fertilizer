/**
 * Reasoning Agent — V33 AI Reasoning Engine
 * 
 * 10-Step Thinking Pipeline:
 * 1. Understand user intent
 * 2. Break problem into smaller parts
 * 3. Search Knowledge → Product → Disease → Weather → Crop
 * 4. Compare multiple possible answers
 * 5. Choose the BEST answer
 * 6. Explain WHY
 * 7. Suggest NEXT STEP
 * 8. Predict possible future problems
 * 9. Recommend prevention
 * 10. Recommend suitable products
 * 
 * Output Format:
 * Problem → Reason → Solution → Organic → Chemical → Products → Prevention → Notes
 */

const APPROVED_DOMAINS = [
    'bari.gov.bd', 'dae.gov.bd', 'brri.gov.bd', 'barc.gov.bd',
    'fao.org', 'fao.org/bangladesh', 'moa.gov.bd', 'bangladesh.gov.bd',
    'irri.org', 'irrigation.gov.bd', 'bmd.gov.bd',
    'sowrov-fertilizer-905de.web.app',
];

const APPROVED_URLS = [
    'https://bari.gov.bd', 'https://dae.gov.bd', 'https://brri.gov.bd',
    'https://barc.gov.bd', 'https://www.fao.org/bangladesh',
    'https://moa.gov.bd', 'https://bangladesh.gov.bd',
    'https://www.irri.org', 'https://irrigation.gov.bd',
    'https://bmd.gov.bd',
];

const PRODUCT_URL_PATTERNS = [
    /^https:\/\/sowrov-fertilizer-905de\.web\.app\/product-details\.html\?id=/,
    /^https:\/\/sowrov-fertilizer-905de\.web\.app\/order\.html\?product=/,
    /^https:\/\/wa\.me\/8801829775552/,
];

const APPROVED_REFERENCES = {
    BARI: {
        name: 'Bangladesh Agricultural Research Institute',
        shortName: 'BARI',
        url: 'https://bari.gov.bd',
        publications: [
            'BARI Crop Guide', 'BARI Fertilizer Recommendation',
            'BARI Pest Management', 'BARI Disease Management',
            'BARI Organic Farming', 'BARI IPM Guide',
        ],
    },
    BRRI: {
        name: 'Bangladesh Rice Research Institute',
        shortName: 'BRRI',
        url: 'https://brri.gov.bd',
        publications: [
            'BRRI Rice varieties', 'BRRI Cultivation Guide',
            'BRRI Fertilizer Schedule', 'BRRI Pest Management',
        ],
    },
    DAE: {
        name: 'Department of Agricultural Extension',
        shortName: 'DAE',
        url: 'https://dae.gov.bd',
        publications: [
            'DAE Crop Calendar', 'DAE Fertilizer Recommendation',
            'DAE Pest Alert', 'DAE Seasonal Guide',
        ],
    },
    FAO: {
        name: 'Food and Agriculture Organization',
        shortName: 'FAO',
        url: 'https://www.fao.org/bangladesh',
        publications: [
            'FAO Bangladesh Report', 'FAO Crop Protection',
            'FAO Sustainable Agriculture', 'FAO Climate Smart Agriculture',
        ],
    },
    IRRI: {
        name: 'International Rice Research Institute',
        shortName: 'IRRI',
        url: 'https://www.irri.org',
        publications: [
            'IRRI Rice Knowledge Bank', 'IRRI Varieties',
            'IRRI Best Practices',
        ],
    },
};

const CONFIDENCE = {
    HIGH: { min: 80, label: 'high', labelBn: 'উচ্চ' },
    MEDIUM: { min: 60, label: 'medium', labelBn: 'মাঝারি' },
    LOW: { min: 0, label: 'low', labelBn: 'কম' },
};

// ─────────────────────────────────────────────
// URL VALIDATION
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// STEP 1: UNDERSTAND
// ─────────────────────────────────────────────
function understandIntent(text, context = {}) {
    return {
        language: context.expectedLanguage || detectLanguage(text),
        intent: context.intent || 'general',
        crop: context.cropName || null,
        disease: context.isDiseaseQuery || false,
        fertilizer: context.isFertilizerQuery || false,
        weather: context.isWeatherQuery || false,
        market: context.isMarketQuery || false,
        isEmergency: context.isEmergency || false,
        isComplexQuestion: context.isComplexQuestion || false,
        hasKnowledgeBase: !!(context.knowledgeContext && context.knowledgeContext.length > 100),
        hasProducts: !!(context.productContext && context.productContext.length > 100),
    };
}

function detectLanguage(text) {
    if (!text || typeof text !== 'string') return 'unknown';
    if (/[\u0980-\u09FF]/.test(text)) return 'bangla';
    if (/^[a-zA-Z0-9\s.,!?;:'"()-]+$/.test(text)) return 'english';
    return 'mixed';
}

// ─────────────────────────────────────────────
// STEP 2: BREAK DOWN PROBLEM
// ─────────────────────────────────────────────
function breakDownProblem(text, analysis) {
    const parts = [];

    // Extract problem components
    if (analysis.disease) {
        parts.push({ type: 'disease', keywords: extractDiseaseKeywords(text) });
    }
    if (analysis.fertilizer) {
        parts.push({ type: 'fertilizer', keywords: extractFertilizerKeywords(text) });
    }
    if (analysis.crop) {
        parts.push({ type: 'crop', name: analysis.crop });
    }
    if (analysis.weather) {
        parts.push({ type: 'weather', keywords: extractWeatherKeywords(text) });
    }

    // General problem extraction
    if (parts.length === 0) {
        parts.push({ type: 'general', keywords: text.split(/\s+/).slice(0, 5) });
    }

    return parts;
}

function extractDiseaseKeywords(text) {
    const diseases = [
        'ফাঁপা', 'blight', 'মলড', 'mildew', 'রোগ', 'disease',
        'পোকা', 'pest', 'কীট', 'insect', 'ছত্রাক', 'fungal',
        'ব্যাকটেরিয়া', 'bacterial', 'ভাইরাস', 'viral',
        'দাগ', 'spot', 'পচন', 'rot', 'মরবৃত্তি', 'wilt',
    ];
    return diseases.filter(d => text.toLowerCase().includes(d.toLowerCase()));
}

function extractFertilizerKeywords(text) {
    const fertilizers = [
        'সার', 'fertilizer', 'ইউরিয়া', 'urea', 'DAP', 'MOP',
        'পুষ্টি', 'nutrient', 'কমপোস্ট', 'compost',
        'জৈবসার', 'organic', 'খাদ্য', 'food',
    ];
    return fertilizers.filter(f => text.toLowerCase().includes(f.toLowerCase()));
}

function extractWeatherKeywords(text) {
    const weather = [
        'বৃষ্টি', 'rain', 'খরা', 'drought', 'বন্যা', 'flood',
        'তাপমাত্রা', 'temperature', 'আর্দ্রতা', 'humidity',
        'শীত', 'winter', 'গ্রীষ্ম', 'summer', 'বর্ষা', 'monsoon',
    ];
    return weather.filter(w => text.toLowerCase().includes(w.toLowerCase()));
}

// ─────────────────────────────────────────────
// STEP 3: SEARCH KNOWLEDGE
// ─────────────────────────────────────────────
function searchAllDatabases(text, analysis, context) {
    const results = {
        knowledge: context.knowledgeContext || '',
        products: context.productContext || '',
        disease: '',
        weather: '',
        crop: '',
    };

    // Extract disease info from knowledge
    if (analysis.disease && results.knowledge) {
        results.disease = extractSection(results.knowledge, ['disease', 'রোগ', 'সমস্যা']);
    }

    // Extract weather info
    if (analysis.weather && results.knowledge) {
        results.weather = extractSection(results.knowledge, ['weather', 'আবহাওয়া', 'মৌসুম']);
    }

    // Extract crop info
    if (analysis.crop && results.knowledge) {
        results.crop = extractSection(results.knowledge, [analysis.crop]);
    }

    return results;
}

function extractSection(text, keywords) {
    if (!text) return '';
    const lines = text.split('\n');
    const relevant = [];
    let capturing = false;

    for (const line of lines) {
        const lower = line.toLowerCase();
        if (keywords.some(kw => lower.includes(kw.toLowerCase()))) {
            capturing = true;
        }
        if (capturing) {
            relevant.push(line);
            if (relevant.length > 20) break; // Limit section length
        }
    }

    return relevant.join('\n');
}

// ─────────────────────────────────────────────
// STEP 4: COMPARE ANSWERS
// ─────────────────────────────────────────────
function compareAnswers(text, analysis, searchResults) {
    const possibleApproaches = [];

    // Approach 1: Knowledge-based answer
    if (searchResults.knowledge) {
        possibleApproaches.push({
            type: 'knowledge',
            confidence: 85,
            source: 'Internal Knowledge Base',
        });
    }

    // Approach 2: Product-based answer
    if (searchResults.products) {
        possibleApproaches.push({
            type: 'product',
            confidence: 75,
            source: 'Product Database',
        });
    }

    // Approach 3: General LLM answer
    possibleApproaches.push({
        type: 'general',
        confidence: 50,
        source: 'General Knowledge',
    });

    return possibleApproaches;
}

// ─────────────────────────────────────────────
// STEP 5: CHOOSE BEST ANSWER
// ─────────────────────────────────────────────
function chooseBestAnswer(possibleAnswers, analysis) {
    // Sort by confidence (create copy to avoid mutating input)
    const sorted = [...possibleAnswers].sort((a, b) => b.confidence - a.confidence);
    const best = sorted[0];

    // Adjust based on context
    if (analysis.disease && best.type !== 'knowledge') {
        // Disease queries should prefer knowledge-based answers
        const knowledgeAnswer = sorted.find(a => a.type === 'knowledge');
        if (knowledgeAnswer && knowledgeAnswer.confidence >= 60) {
            return knowledgeAnswer;
        }
    }

    return best;
}

// ─────────────────────────────────────────────
// STEP 6: EXPLAIN WHY
// ─────────────────────────────────────────────
function explainWhy(bestAnswer, analysis) {
    const explanations = [];

    if (bestAnswer.type === 'knowledge') {
        explanations.push('এই উত্তরটি আমাদের অভ্যন্তরীণ জ্ঞান ভান্ডার থেকে যাচাই করা হয়েছে।');
        explanations.push('This answer is verified from our internal knowledge base.');
    } else if (bestAnswer.type === 'product') {
        explanations.push('এই পণ্যগুলো আমাদের ডাটাবেজে নিশ্চিত।');
        explanations.push('These products are confirmed in our database.');
    } else {
        explanations.push('এই উত্তরটি সাধারণ কৃষি জ্ঞানের উপর ভিত্তি করে তৈরি।');
        explanations.push('This answer is based on general agricultural knowledge.');
    }

    return explanations;
}

// ─────────────────────────────────────────────
// STEP 7: SUGGEST NEXT STEP
// ─────────────────────────────────────────────
function suggestNextStep(text, analysis) {
    const suggestions = [];

    if (analysis.disease) {
        suggestions.push('প্রথমে রোগের লক্ষণ সঠিকভাবে নির্ণয় করুন।');
        suggestions.push('First, correctly diagnose the disease symptoms.');
        suggestions.push('নিকটস্থ কৃষি সম্প্রসারণ অফিসে (DAE) যোগাযোগ করুন।');
    } else if (analysis.fertilizer) {
        suggestions.push('মাটি পরীক্ষা করান।');
        suggestions.push('Get a soil test done.');
        suggestions.push('স্থানীয় কৃষি কর্মকর্তার পরামর্শ নিন।');
    } else {
        suggestions.push('বিস্তারিত জানতে আপনার নিকটস্থ DAE অফিসে যোগাযোগ করুন।');
        suggestions.push('Contact your nearest DAE office for more details.');
    }

    return suggestions;
}

// ─────────────────────────────────────────────
// STEP 8: PREDICT FUTURE PROBLEMS
// ─────────────────────────────────────────────
function predictFutureProblems(text, analysis) {
    const predictions = [];

    if (analysis.disease) {
        predictions.push('রোগ ছড়িয়ে পড়তে পারে যদি সঠিক সময়ে ব্যবস্থা নেওয়া না হয়।');
        predictions.push('Disease may spread if timely action is not taken.');
    }

    if (analysis.fertilizer) {
        predictions.push('অতিরিক্ত সার ব্যবহার মাটির গুণাগুণ নষ্ট করতে পারে।');
        predictions.push('Excessive fertilizer can damage soil quality.');
    }

    if (analysis.crop) {
        predictions.push('আবহাওয়ার পরিবর্তন ফসলের উপর প্রভাব ফেলতে পারে।');
        predictions.push('Weather changes may affect the crop.');
    }

    return predictions;
}

// ─────────────────────────────────────────────
// STEP 9: RECOMMEND PREVENTION
// ─────────────────────────────────────────────
function recommendPrevention(text, analysis) {
    const preventions = [];

    if (analysis.disease) {
        preventions.push('নিয়মিত ক্ষেত পরিদর্শন করুন।');
        preventions.push('Regular field inspection.');
        preventions.push('উন্নত জাতের বীজ ব্যবহার করুন।');
        preventions.push('Use improved seed varieties.');
        preventions.push('সঠিক জলবিদ্যুত ব্যবস্থাপনা করুন।');
        preventions.push('Proper water management.');
    } else if (analysis.fertilizer) {
        preventions.push('মাটি পরীক্ষার ভিত্তিতে সার প্রয়োগ করুন।');
        preventions.push('Apply fertilizer based on soil test.');
        preventions.push('জৈব সার ব্যবহারকে অগ্রাধিকার দিন।');
        preventions.push('Prioritize organic fertilizers.');
    } else {
        preventions.push('নিয়মিত কৃষি সম্প্রসারণ সেবা গ্রহণ করুন।');
        preventions.push('Regularly use agricultural extension services.');
    }

    return preventions;
}

// ─────────────────────────────────────────────
// STEP 10: RECOMMEND PRODUCTS
// ─────────────────────────────────────────────
function recommendProducts(text, analysis, productContext) {
    const recommendations = [];

    if (productContext) {
        // Extract product names from context
        const productMatches = productContext.match(/(?:নাম|name|পণ্য|product)\s*[:=]\s*([^\n,]+)/gi);
        if (productMatches) {
            for (const match of productMatches.slice(0, 3)) {
                const name = match.split(/[:=]/)[1]?.trim();
                if (name) {
                    recommendations.push({
                        name,
                        verified: true,
                        source: 'Product Database',
                    });
                }
            }
        }
    }

    if (recommendations.length === 0 && analysis.disease) {
        recommendations.push({
            name: 'স্থানীয় কৃষি কেন্দ্র থেকে উপযুক্ত কীটনাশক কিনুন',
            verified: false,
            source: 'General Advice',
        });
    }

    return recommendations;
}

// ─────────────────────────────────────────────
// FACT CHECKING (Enhanced)
// ─────────────────────────────────────────────
function factCheck(text, analysis, knowledgeContext = '') {
    const verified = [];
    const unverified = [];
    const references = [];

    // Check for specific factual claims
    const claims = extractFactualClaims(text);

    for (const claim of claims) {
        const isVerified = verifyFactualClaim(claim, knowledgeContext, analysis);
        if (isVerified.verified) {
            verified.push(claim);
            if (isVerified.source) {
                references.push(isVerified.source);
            }
        } else {
            unverified.push(claim);
        }
    }

    // Check for invented references
    const orgs = ['BARI', 'BRRI', 'DAE', 'FAO', 'IRRI'];
    for (const org of orgs) {
        if (text.includes(org)) {
            const orgData = APPROVED_REFERENCES[org];
            if (orgData) {
                references.push({
                    organization: orgData.name,
                    shortName: org,
                    url: orgData.url,
                });
            }
        }
    }

    // Check for fabricated vague references (reset lastIndex to avoid stale state)
    const fabricatedPatterns = [
        /(?:according to|ধরনে|মতে)\s+(?:a\s+)?(?:recent|নতুন)\s+(?:study|গবেষণা|report|প্রতিবেদন)/i,
        /(?:research|গবেষণা)\s+(?:shows|দেখায়|proves|প্রমাণ)/i,
    ];

    const fabricated = [];
    for (const pattern of fabricatedPatterns) {
        if (pattern.test(text)) {
            fabricated.push({ type: 'vague_reference', text: text.match(pattern)?.[0] });
        }
    }

    return { verified, unverified, references, fabricated };
}

function extractFactualClaims(text) {
    const claims = [];

    const patterns = [
        /(?:ইউরিয়া|urea|ডাই অ্যামোনিয়ম|DAP|মিউরিয়েট অফ পটাশ|MOP)/gi,
        /(?:টন|kg|কেজি|প্রতি)\s+(?:প্রতি\s+)?(?:একর|acre|হেক্টর|hectare)/gi,
        /(?:ছত্রাকনাশক|fungicide|কীটনাশক|insecticide)/gi,
        /(?:ধান|rice|টমেটো|tomato|মরিচ|chili|বেগুন|brinjal)/gi,
    ];

    for (const pattern of patterns) {
        const matches = text.match(pattern) || [];
        for (const match of matches) {
            claims.push({ type: 'fact', text: match, context: text.substring(0, 200) });
        }
    }

    return claims.slice(0, 10);
}

function verifyFactualClaim(claim, knowledgeContext, analysis) {
    if (!knowledgeContext) return { verified: false, source: null };

    const claimLower = claim.text.toLowerCase();
    const contextLower = knowledgeContext.toLowerCase();

    // Check if claim appears in knowledge context
    if (contextLower.includes(claimLower)) {
        return {
            verified: true,
            source: { type: 'knowledge', name: 'Internal Knowledge Base' },
        };
    }

    return { verified: false, source: null };
}

// ─────────────────────────────────────────────
// CONFIDENCE SCORING
// ─────────────────────────────────────────────
function calculateConfidence(text, analysis, factCheckResult, searchResults) {
    let score = 50;

    // Knowledge base bonus
    if (analysis.hasKnowledgeBase) score += 15;
    if (analysis.hasProducts) score += 10;

    // Verified claims bonus
    if (factCheckResult.verified.length > 0) {
        score += Math.min(factCheckResult.verified.length * 8, 25);
    }

    // Unverified claims penalty
    if (factCheckResult.unverified.length > 0) {
        score -= factCheckResult.unverified.length * 5;
    }

    // Fabricated references penalty
    if (factCheckResult.fabricated.length > 0) {
        score -= factCheckResult.fabricated.length * 15;
    }

    // Bangladesh context bonus
    const bangladeshKeywords = ['বাংলাদেশ', 'bangladesh', 'চাটগ্রাম', 'chittagong'];
    if (bangladeshKeywords.some(kw => text.toLowerCase().includes(kw))) {
        score += 5;
    }

    // Reference bonus
    if (factCheckResult.references.length > 0) {
        score += Math.min(factCheckResult.references.length * 3, 10);
    }

    score = Math.max(0, Math.min(100, score));

    let level;
    if (score >= CONFIDENCE.HIGH.min) level = CONFIDENCE.HIGH;
    else if (score >= CONFIDENCE.MEDIUM.min) level = CONFIDENCE.MEDIUM;
    else level = CONFIDENCE.LOW;

    return { score, level, label: level.label, labelBn: level.labelBn };
}

// ─────────────────────────────────────────────
// PRODUCT VERIFICATION
// ─────────────────────────────────────────────
function verifyProducts(text, productContext = '') {
    const productMentions = [];
    const verifiedProducts = [];
    const unverifiedProducts = [];

    const productPatterns = [
        /(?:পণ্য|product|সার|fertilizer|কীটনাশক|insecticide|ছত্রাকনাশক|fungicide)\s*[:\-]?\s*([^\n,.]+)/gi,
        /(?:SF|Sowrov)\s+([A-Za-z0-9\s]+)/gi,
    ];

    for (const pattern of productPatterns) {
        const matches = text.match(pattern) || [];
        for (const match of matches) {
            productMentions.push(match.trim());
        }
    }

    if (productContext) {
        for (const mention of productMentions) {
            const mentionLower = mention.toLowerCase();
            if (productContext.toLowerCase().includes(mentionLower) ||
                productContext.toLowerCase().includes(mentionLower.split(' ').pop())) {
                verifiedProducts.push(mention);
            } else {
                unverifiedProducts.push(mention);
            }
        }
    } else {
        unverifiedProducts.push(...productMentions);
    }

    return { verifiedProducts, unverifiedProducts, total: productMentions.length };
}

// ─────────────────────────────────────────────
// REFERENCE VALIDATION
// ─────────────────────────────────────────────
function validateReferences(text) {
    const references = [];
    const fabricated = [];

    const orgs = ['BARI', 'BRRI', 'DAE', 'FAO', 'IRRI'];
    for (const org of orgs) {
        if (text.includes(org)) {
            const orgData = APPROVED_REFERENCES[org];
            if (orgData) {
                references.push({
                    organization: orgData.name,
                    shortName: org,
                    url: orgData.url,
                });
            }
        }
    }

    return { references, fabricated, hasValidReferences: references.length > 0 };
}

// ─────────────────────────────────────────────
// LANGUAGE CHECK
// ─────────────────────────────────────────────
function checkLanguageConsistency(text, expectedLanguage) {
    const issues = [];

    if (expectedLanguage === 'bangla') {
        const banglaChars = (text.match(/[\u0980-\u09FF]/g) || []).length;
        const totalChars = text.replace(/\s/g, '').length;
        const banglaRatio = totalChars > 0 ? banglaChars / totalChars : 0;

        if (banglaRatio < 0.3 && text.length > 20) {
            issues.push({ type: 'language', message: 'Response should be in Bangla' });
        }
    }

    if (expectedLanguage === 'english') {
        const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
        const totalChars = text.replace(/\s/g, '').length;
        const englishRatio = totalChars > 0 ? englishChars / totalChars : 0;

        if (englishRatio < 0.5 && text.length > 20) {
            issues.push({ type: 'language', message: 'Response should be in English' });
        }
    }

    return { issues, passed: issues.length === 0 };
}

// ─────────────────────────────────────────────
// QUALITY SCORING
// ─────────────────────────────────────────────
function calculateQualityScore(text, analysis, factCheckResult, confidence, productResult, referenceResult, languageResult) {
    const scores = {
        accuracy: 100,
        completeness: 100,
        safety: 100,
        language: 100,
    };

    // Accuracy
    if (factCheckResult.unverified.length > 0) scores.accuracy -= factCheckResult.unverified.length * 15;
    if (productResult.unverifiedProducts.length > 0) scores.accuracy -= productResult.unverifiedProducts.length * 10;
    if (factCheckResult.fabricated.length > 0) scores.accuracy -= factCheckResult.fabricated.length * 20;

    // Completeness
    if (analysis.isComplexQuestion && text.length < 200) scores.completeness -= 30;
    if (analysis.disease && !text.includes('প্রতিরোধ') && !text.includes('prevention')) scores.completeness -= 10;
    if (analysis.fertilizer && !text.includes('পরিমাণ') && !text.includes('dosage')) scores.completeness -= 10;

    // Language
    if (!languageResult.passed) scores.language -= 30;

    const total = Math.round(
        (scores.accuracy * 0.4) +
        (scores.completeness * 0.25) +
        (scores.safety * 0.25) +
        (scores.language * 0.1)
    );

    return { scores, total, acceptable: total >= 70 };
}

// ─────────────────────────────────────────────
// V33: MAIN REASONING PIPELINE
// ─────────────────────────────────────────────
function v33ReasoningPipeline(responseText, context = {}) {
    const startTime = Date.now();

    // Step 1: Understand
    const analysis = understandIntent(responseText, context);

    // Step 2: Break down problem
    const problemParts = breakDownProblem(responseText, analysis);

    // Step 3: Search all databases
    const searchResults = searchAllDatabases(responseText, analysis, context);

    // Step 4: Compare possible answers
    const possibleAnswers = compareAnswers(responseText, analysis, searchResults);

    // Step 5: Choose best answer
    const bestAnswer = chooseBestAnswer(possibleAnswers, analysis);

    // Step 6: Explain why
    const explanations = explainWhy(bestAnswer, analysis);

    // Step 7: Suggest next step
    const nextSteps = suggestNextStep(responseText, analysis);

    // Step 8: Predict future problems
    const futureProblems = predictFutureProblems(responseText, analysis);

    // Step 9: Recommend prevention
    const prevention = recommendPrevention(responseText, analysis);

    // Step 10: Recommend products
    const productRecommendations = recommendProducts(responseText, analysis, context.productContext || '');

    // Fact checking
    const factCheckResult = factCheck(responseText, analysis, context.knowledgeContext || '');

    // Confidence
    const confidence = calculateConfidence(responseText, analysis, factCheckResult, searchResults);

    // Product verification
    const productResult = verifyProducts(responseText, context.productContext || '');

    // Reference validation
    const referenceResult = validateReferences(responseText);

    // Language check
    const languageResult = checkLanguageConsistency(responseText, analysis.language);

    // Quality score
    const quality = calculateQualityScore(
        responseText, analysis, factCheckResult, confidence,
        productResult, referenceResult, languageResult
    );

    const processingTime = Date.now() - startTime;

    return {
        // V33 Reasoning Results
        analysis,
        problemParts,
        searchResults,
        possibleAnswers,
        bestAnswer,
        explanations,
        nextSteps,
        futureProblems,
        prevention,
        productRecommendations,

        // V32 Verification Results
        confidence,
        quality,
        factCheck: {
            verified: factCheckResult.verified.length,
            unverified: factCheckResult.unverified.length,
            references: factCheckResult.references,
            fabricated: factCheckResult.fabricated,
        },
        products: {
            verified: productResult.verifiedProducts,
            unverified: productResult.unverifiedProducts,
        },
        references: referenceResult.references,
        language: languageResult,
        processingTime,

        passed: quality.acceptable && confidence.score >= 60,
    };
}

// ─────────────────────────────────────────────
// SELF-CHECK WRAPPER
// ─────────────────────────────────────────────
function selfCheck(responseText, context = {}) {
    const result = v33ReasoningPipeline(responseText, context);
    return {
        passed: result.passed,
        issues: result.language.issues.map(i => i.message),
        correctedText: responseText,
        confidence: result.confidence,
        quality: result.quality,
    };
}

// ─────────────────────────────────────────────
// FULL PROCESSING PIPELINE
// ─────────────────────────────────────────────
function processResponse(responseText, context = {}) {
    // Step 1: Sanitize URLs
    let processed = sanitizeResponseUrls(responseText);

    // Step 2: V33 Reasoning Pipeline
    const result = v33ReasoningPipeline(processed, context);

    // Step 3: V36 — Never show confidence/limited-knowledge notes to user
    let finalText = processed;

    return {
        text: finalText,
        passed: result.passed,
        issues: result.language.issues.map(i => i.message),
        confidence: result.confidence,
        quality: result.quality,
        factCheck: result.factCheck,
        products: result.products,
        references: result.references,
        // V33 reasoning metadata
        reasoning: {
            bestAnswer: result.bestAnswer,
            explanations: result.explanations,
            nextSteps: result.nextSteps,
            futureProblems: result.futureProblems,
            prevention: result.prevention,
            productRecommendations: result.productRecommendations,
        },
    };
}

module.exports = {
    isApprovedUrl,
    sanitizeResponseUrls,
    selfCheck,
    v33ReasoningPipeline,
    processResponse,
    APPROVED_DOMAINS,
    APPROVED_URLS,
    PRODUCT_URL_PATTERNS,
    APPROVED_REFERENCES,
    CONFIDENCE,
};
