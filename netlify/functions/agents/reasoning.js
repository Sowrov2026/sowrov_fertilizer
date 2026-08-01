/**
 * Reasoning Agent — V32 Self Check & Fact Verification Engine
 * 
 * Pipeline:
 * 1. Understand (Language, Intent, Crop, Disease, etc.)
 * 2. Generate answer
 * 3. Self Review (correct, complete, safe, relevant, Bangladesh specific)
 * 4. Fact Check (Internal Knowledge, BARI, BRRI, DAE, FAO, IRRI)
 * 5. Confidence scoring (High/Medium/Low)
 * 6. Product verification (Firebase database)
 * 7. Reference validation (no fabrication)
 * 8. Language consistency
 * 9. Quality scoring (Accuracy, Completeness, Safety, Language)
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

// ─────────────────────────────────────────────
// APPROVED REFERENCES (BARI, BRRI, DAE, FAO, IRRI)
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// INTENT CATEGORIES
// ─────────────────────────────────────────────
const INTENT_CATEGORIES = {
    CROP: 'crop',
    DISEASE: 'disease',
    FERTILIZER: 'fertilizer',
    WEATHER: 'weather',
    MARKET: 'market',
    GENERAL: 'general',
    LIVESTOCK: 'livestock',
    EMERGENCY: 'emergency',
};

// ─────────────────────────────────────────────
// CONFIDENCE THRESHOLDS
// ─────────────────────────────────────────────
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
function analyzeInput(responseText, context = {}) {
    const analysis = {
        language: context.expectedLanguage || 'unknown',
        intent: context.intent || INTENT_CATEGORIES.GENERAL,
        crop: context.cropName || null,
        disease: context.isDiseaseQuery || false,
        fertilizer: context.isFertilizerQuery || false,
        weather: context.isWeatherQuery || false,
        market: context.isMarketQuery || false,
        isEmergency: context.isEmergency || false,
        isComplexQuestion: context.isComplexQuestion || false,
    };

    // Detect language from response text if not provided
    if (analysis.language === 'unknown') {
        if (/[\u0980-\u09FF]/.test(responseText)) {
            analysis.language = 'bangla';
        } else if (/^[a-zA-Z\s]+$/.test(responseText)) {
            analysis.language = 'english';
        } else {
            analysis.language = 'mixed';
        }
    }

    return analysis;
}

// ─────────────────────────────────────────────
// STEP 3: SELF REVIEW
// ─────────────────────────────────────────────
function selfReview(text, analysis) {
    const issues = [];
    const warnings = [];

    // 1. Correctness check
    if (!text || text.trim().length < 10) {
        issues.push({ type: 'correctness', message: 'Response too short or empty' });
    }

    // 2. Completeness check
    if (analysis.isComplexQuestion && text.length < 150) {
        warnings.push({ type: 'completeness', message: 'Complex question may need more detail' });
    }

    // 3. Safety check
    const dangerousPatterns = [
        /বিষাক্ত|বিষ|toxic|poisonous|dangerous/i,
        /মারাত্মক|fatal|deadly/i,
        /আগুন|fire|explosion/i,
    ];
    for (const pattern of dangerousPatterns) {
        if (pattern.test(text) && !text.includes('সতর্কতা') && !text.includes('warning')) {
            warnings.push({ type: 'safety', message: 'Potentially dangerous advice without warning' });
        }
    }

    // 4. Relevance check
    if (analysis.crop && !text.toLowerCase().includes(analysis.crop.toLowerCase())) {
        warnings.push({ type: 'relevance', message: 'Response may not address the specific crop' });
    }

    // 5. Bangladesh relevance check
    const bangladeshKeywords = [
        'বাংলাদেশ', 'bangladesh', 'চাটগ্রাম', 'chittagong', 'ঢাকা', 'dhaka',
        'খুলনা', 'khulna', 'রাজশাহী', 'rajshahi', 'সিলেট', 'sylhet',
        'বরিশাল', 'barisal', 'রংপুর', 'rangpur', 'ময়মনসিংহ', 'mymensingh',
        'কক্সবাজার', 'cox', 'bazar',
    ];
    const hasBangladeshContext = bangladeshKeywords.some(kw => text.toLowerCase().includes(kw));
    if (!hasBangladeshContext && analysis.language === 'bangla') {
        warnings.push({ type: 'relevance', message: 'Response may lack Bangladesh-specific context' });
    }

    return { issues, warnings, passed: issues.length === 0 };
}

// ─────────────────────────────────────────────
// STEP 4: FACT CHECK
// ─────────────────────────────────────────────
function factCheck(text, analysis, knowledgeContext = '') {
    const verified = [];
    const unverified = [];
    const references = [];

    // Extract claims from text (simple pattern matching)
    const claims = extractClaims(text);

    // Check against knowledge base
    for (const claim of claims) {
        const isVerified = verifyClaim(claim, knowledgeContext, analysis);
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
    const referencePatterns = [
        /BARI\s+guide/i,
        /BRRI\s+recommendation/i,
        /DAE\s+advisory/i,
        /FAO\s+report/i,
        /IRRI\s+study/i,
    ];

    const textReferences = [];
    for (const pattern of referencePatterns) {
        if (pattern.test(text)) {
            const match = text.match(pattern);
            textReferences.push(match[0]);
        }
    }

    // Verify text references are real
    for (const ref of textReferences) {
        const isValid = APPROVED_REFERENCES[ref.split(' ')[0]]?.publications.some(
            pub => ref.toLowerCase().includes(pub.toLowerCase().split(' ')[0])
        );
        if (!isValid) {
            unverified.push({ type: 'reference', text: ref });
        } else {
            verified.push({ type: 'reference', text: ref });
            const org = ref.split(' ')[0];
            if (APPROVED_REFERENCES[org]) {
                references.push({
                    name: APPROVED_REFERENCES[org].name,
                    url: APPROVED_REFERENCES[org].url,
                    publication: ref,
                });
            }
        }
    }

    return { verified, unverified, references };
}

function extractClaims(text) {
    const claims = [];

    // Fertilizer recommendations
    const fertilizerPatterns = [
        /(?:সার|fertilizer|পুষ্টি|nutrient)\s+(?:ব্যবহার|use|apply)/gi,
        /(?:ইউরিয়া|urea|ডাই অ্যামোনিয়ম|DAP|মিউরিয়েট অফ পটাশ|MOP)/gi,
        /(?:টন|kg|কেজি|প্রতি)\s+(?:প্রতি\s+)?(?:একর|acre|হেক্টর|hectare)/gi,
    ];

    // Disease recommendations
    const diseasePatterns = [
        /(?:রোগ|disease|পোকা|pest|কীটপতঙ্গ|insect)\s+(?:নিয়ন্ত্রণ|control|management)/gi,
        /(?:ছত্রাকনাশক|fungicide|কীটনাশক|insecticide|তেল|oil)/gi,
    ];

    // Crop recommendations
    const cropPatterns = [
        /(?:ধান|rice|টমেটো|tomato|মরিচ|chili|বেগুন|brinjal)/gi,
        /(?:আলু|potato|পেঁয়াজ|onion|রসুন|garlic|আম|mango)/gi,
    ];

    const allPatterns = [...fertilizerPatterns, ...diseasePatterns, ...cropPatterns];

    for (const pattern of allPatterns) {
        const matches = text.match(pattern) || [];
        for (const match of matches) {
            claims.push({ type: 'fact', text: match, context: text.substring(0, 200) });
        }
    }

    return claims.slice(0, 10); // Limit to 10 claims
}

function verifyClaim(claim, knowledgeContext, analysis) {
    const claimLower = claim.text.toLowerCase();

    // Check if claim matches knowledge context
    if (knowledgeContext) {
        const contextLower = knowledgeContext.toLowerCase();

        // Check for specific crop mentions
        if (analysis.crop && contextLower.includes(analysis.crop.toLowerCase())) {
            return {
                verified: true,
                source: { type: 'knowledge', name: 'Internal Knowledge Base' },
            };
        }

        // Check for fertilizer mentions
        const fertilizers = ['ইউরিয়া', 'urea', 'ডাই অ্যামোনিয়ম', 'DAP', 'মিউরিয়েট অফ পটাশ', 'MOP'];
        for (const fert of fertilizers) {
            if (claimLower.includes(fert.toLowerCase()) && contextLower.includes(fert.toLowerCase())) {
                return {
                    verified: true,
                    source: { type: 'knowledge', name: 'Internal Knowledge Base' },
                };
            }
        }

        // Check for disease mentions
        const diseases = ['ছত্রাক', 'fungal', 'ব্যাকটেরিয়া', 'bacterial', 'ভাইরাস', 'viral'];
        for (const disease of diseases) {
            if (claimLower.includes(disease) && contextLower.includes(disease)) {
                return {
                    verified: true,
                    source: { type: 'knowledge', name: 'Internal Knowledge Base' },
                };
            }
        }
    }

    // Default: unverified
    return { verified: false, source: null };
}

// ─────────────────────────────────────────────
// STEP 5: CONFIDENCE SCORING
// ─────────────────────────────────────────────
function calculateConfidence(text, analysis, factCheckResult, selfReviewResult) {
    let score = 50; // Base score

    // Knowledge base verification bonus
    if (factCheckResult.verified.length > 0) {
        score += Math.min(factCheckResult.verified.length * 10, 30);
    }

    // Unverified claims penalty
    if (factCheckResult.unverified.length > 0) {
        score -= factCheckResult.unverified.length * 5;
    }

    // Self review issues penalty
    if (selfReviewResult.issues.length > 0) {
        score -= selfReviewResult.issues.length * 10;
    }

    // Self review warnings penalty
    if (selfReviewResult.warnings.length > 0) {
        score -= selfReviewResult.warnings.length * 3;
    }

    // Bangladesh context bonus
    const bangladeshKeywords = ['বাংলাদেশ', 'bangladesh', 'চাটগ্রাম', 'chittagong'];
    if (bangladeshKeywords.some(kw => text.toLowerCase().includes(kw))) {
        score += 5;
    }

    // Reference bonus
    if (factCheckResult.references.length > 0) {
        score += Math.min(factCheckResult.references.length * 5, 15);
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    // Determine level
    let level;
    if (score >= CONFIDENCE.HIGH.min) {
        level = CONFIDENCE.HIGH;
    } else if (score >= CONFIDENCE.MEDIUM.min) {
        level = CONFIDENCE.MEDIUM;
    } else {
        level = CONFIDENCE.LOW;
    }

    return { score, level, label: level.label, labelBn: level.labelBn };
}

// ─────────────────────────────────────────────
// STEP 6: PRODUCT CHECK
// ─────────────────────────────────────────────
function verifyProducts(text, productContext = '') {
    const productMentions = [];
    const verifiedProducts = [];
    const unverifiedProducts = [];

    // Extract product mentions from text
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

    // Check against product context
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
        // No product context available
        unverifiedProducts.push(...productMentions);
    }

    return { verifiedProducts, unverifiedProducts, total: productMentions.length };
}

// ─────────────────────────────────────────────
// STEP 7: REFERENCE VALIDATION
// ─────────────────────────────────────────────
function validateReferences(text) {
    const references = [];
    const fabricated = [];

    // Check for organization mentions
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

    // Check for publication mentions
    for (const [org, data] of Object.entries(APPROVED_REFERENCES)) {
        for (const pub of data.publications) {
            if (text.toLowerCase().includes(pub.toLowerCase())) {
                const existingRef = references.find(r => r.shortName === org);
                if (existingRef) {
                    existingRef.publications = existingRef.publications || [];
                    existingRef.publications.push(pub);
                }
            }
        }
    }

    // Check for fabricated references
    const fabricatedPatterns = [
        /(?:according to|ধরনে|মতে)\s+(?:a\s+)?(?:recent|নতুন)\s+(?:study|গবেষণা|report|প্রতিবেদন)/gi,
        /(?:research|গবেষণা)\s+(?:shows|দেখায়|proves|প্রমাণ)/gi,
    ];

    for (const pattern of fabricatedPatterns) {
        if (pattern.test(text)) {
            fabricated.push({ type: 'vague_reference', text: text.match(pattern)?.[0] });
        }
    }

    return { references, fabricated, hasValidReferences: references.length > 0 };
}

// ─────────────────────────────────────────────
// STEP 8: LANGUAGE CONSISTENCY
// ─────────────────────────────────────────────
function checkLanguageConsistency(text, expectedLanguage) {
    const issues = [];

    // Check if text matches expected language
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
// STEP 9: QUALITY SCORING
// ─────────────────────────────────────────────
function calculateQualityScore(text, analysis, factCheckResult, selfReviewResult, confidence, productResult, referenceResult, languageResult) {
    const scores = {
        accuracy: 100,
        completeness: 100,
        safety: 100,
        language: 100,
    };

    // Accuracy scoring
    if (factCheckResult.unverified.length > 0) {
        scores.accuracy -= factCheckResult.unverified.length * 15;
    }
    if (productResult.unverifiedProducts.length > 0) {
        scores.accuracy -= productResult.unverifiedProducts.length * 10;
    }
    if (referenceResult.fabricated.length > 0) {
        scores.accuracy -= referenceResult.fabricated.length * 20;
    }

    // Completeness scoring
    if (analysis.isComplexQuestion && text.length < 200) {
        scores.completeness -= 30;
    }
    if (analysis.isDiseaseQuery && !text.includes('প্রতিরোধ') && !text.includes('prevention')) {
        scores.completeness -= 10;
    }
    if (analysis.isFertilizerQuery && !text.includes('পরিমাণ') && !text.includes('dosage')) {
        scores.completeness -= 10;
    }

    // Safety scoring
    if (selfReviewResult.warnings.some(w => w.type === 'safety')) {
        scores.safety -= 20;
    }
    if (text.includes('বিষাক্ত') && !text.includes('সতর্কতা')) {
        scores.safety -= 15;
    }

    // Language scoring
    if (!languageResult.passed) {
        scores.language -= 30;
    }

    // Calculate total score
    const total = Math.round(
        (scores.accuracy * 0.4) +
        (scores.completeness * 0.25) +
        (scores.safety * 0.25) +
        (scores.language * 0.1)
    );

    return { scores, total, acceptable: total >= 70 };
}

// ─────────────────────────────────────────────
// MAIN: V32 SELF CHECK PIPELINE
// ─────────────────────────────────────────────
function selfCheckPipeline(responseText, context = {}) {
    const startTime = Date.now();

    // Step 1: Understand
    const analysis = analyzeInput(responseText, context);

    // Step 2: (Answer already generated by LLM)

    // Step 3: Self Review
    const review = selfReview(responseText, analysis);

    // Step 4: Fact Check
    const factCheckResult = factCheck(responseText, analysis, context.knowledgeContext || '');

    // Step 5: Confidence
    const confidence = calculateConfidence(responseText, analysis, factCheckResult, review);

    // Step 6: Product Check
    const productResult = verifyProducts(responseText, context.productContext || '');

    // Step 7: Reference Validation
    const referenceResult = validateReferences(responseText);

    // Step 8: Language Check
    const languageResult = checkLanguageConsistency(responseText, analysis.language);

    // Step 9: Quality Score
    const quality = calculateQualityScore(
        responseText, analysis, factCheckResult, review,
        confidence, productResult, referenceResult, languageResult
    );

    const processingTime = Date.now() - startTime;

    return {
        passed: quality.acceptable && review.passed && confidence.score >= 60,
        confidence,
        quality,
        review,
        factCheck: {
            verified: factCheckResult.verified.length,
            unverified: factCheckResult.unverified.length,
            references: factCheckResult.references,
        },
        products: {
            verified: productResult.verifiedProducts,
            unverified: productResult.unverifiedProducts,
        },
        references: referenceResult.references,
        fabricated: referenceResult.fabricated,
        language: languageResult,
        processingTime,
    };
}

// ─────────────────────────────────────────────
// SELF-CHECK WRAPPER (for backward compatibility)
// ─────────────────────────────────────────────
function selfCheck(responseText, context = {}) {
    const result = selfCheckPipeline(responseText, context);
    return {
        passed: result.passed,
        issues: [
            ...result.review.issues.map(i => i.message),
            ...result.language.issues.map(i => i.message),
        ],
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

    // Step 2: V32 Self Check Pipeline
    const checkResult = selfCheckPipeline(processed, context);

    // Step 3: Add confidence note if low
    let finalText = processed;
    if (checkResult.confidence.score < 60) {
        const confidenceNote = context.expectedLanguage === 'english'
            ? '\n\n*Note: My knowledge on this topic is limited. Please consult your local DAE office for more accurate advice.*'
            : '\n\n*এই বিষয়ে আমার নিশ্চিত তথ্য সীমিত। নিকটস্থ কৃষি কর্মকর্তার পরামর্শ নেওয়া ভালো।*';
        finalText += confidenceNote;
    }

    return {
        text: finalText,
        passed: checkResult.passed,
        issues: [
            ...checkResult.review.issues.map(i => i.message),
            ...checkResult.language.issues.map(i => i.message),
        ],
        confidence: checkResult.confidence,
        quality: checkResult.quality,
        factCheck: checkResult.factCheck,
        products: checkResult.products,
        references: checkResult.references,
    };
}

module.exports = {
    isApprovedUrl,
    sanitizeResponseUrls,
    selfCheck,
    selfCheckPipeline,
    processResponse,
    APPROVED_DOMAINS,
    APPROVED_URLS,
    PRODUCT_URL_PATTERNS,
    APPROVED_REFERENCES,
    CONFIDENCE,
};
