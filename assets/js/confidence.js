/**
 * SF AI V15 — Confidence Score Module
 * Parse, analyze, and display AI response confidence
 * Client-side ES module with no external dependencies
 */

const CONFIDENCE_THRESHOLDS = {
    HIGH: 80,
    MEDIUM: 50,
    LOW: 20,
};

const CONFIDENCE_LABELS = {
    high: 'উচ্চ আত্মবিশ্বাস',
    medium: 'মাঝারি আত্মবিশ্বাস',
    low: 'কম আত্মবিশ্বাস',
    veryLow: 'খুব কম আত্মবিশ্বাস',
};

const CONFIDENCE_COLORS = {
    high: 'confidence-high',
    medium: 'confidence-medium',
    low: 'confidence-low',
    veryLow: 'confidence-very-low',
};

const CONFIDENCE_ICONS = {
    high: 'fa-check-circle',
    medium: 'fa-exclamation-triangle',
    low: 'fa-exclamation-circle',
    veryLow: 'fa-times-circle',
};

const NEED_MORE_INFO = {
    bangla: 'আপনি যদি একটি ছবি আপলোড করেন বা আরও তথ্য দেন, আমি আরও সঠিক উত্তর দিতে পারব।',
    english: 'Please upload an image or provide more information for a more accurate answer.',
    banglish: 'Please upload an image or provide more information for a more accurate answer.',
    chatgaiya: 'আপনি যদি একটি ছবি দিন বা আরও কিছু বলেন, আমি ভালো উত্তর দিতে পারুম।',
};

const UNCERTAINTY_MARKERS = [
    'I am not certain',
    'আমার জানা নেই',
    'I am not sure',
    'আমি নিশ্চিত নই',
    'I cannot be sure',
    'আমি নিশ্চিত পারি না',
    'It is hard to say',
    'বলা কঠিন',
    'unclear',
    'অস্পষ্ট',
];

const AUTHORITY_REFERENCES = [
    'BARI',
    'BRRI',
    'DAE',
    'বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট',
    'বাংলাদেশ ধান গবেষণা ইনস্টিটিউট',
    'কৃষি সম্প্রসারণ অধিদপ্তর',
];

const GENERAL_KNOWLEDGE_MARKERS = [
    'general knowledge',
    'সাধারণ জ্ঞান',
    'generally speaking',
    'সাধারণত',
    'in general',
];

/**
 * Parse an explicit confidence percentage from AI response text.
 * Looks for patterns like "Confidence: 85%" or "আত্মবিশ্বাস: ৮৫%".
 * @param {string} responseText - Raw AI response
 * @returns {number|null} Parsed confidence 0-100, or null if not found
 */
function parseConfidence(responseText) {
    if (!responseText || typeof responseText !== 'string') return null;

    const patterns = [
        /\*\*(?:Confidence|আত্মবিশ্বাস)\*\*[:\s]*(\d{1,3})\s*%/i,
        /(?:Confidence|আত্মবিশ্বাস)[:\s]*(\d{1,3})\s*%/i,
        /(\d{1,3})\s*%\s*(?:Confidence|আত্মবিশ্বাস)/i,
    ];

    for (const pattern of patterns) {
        const match = responseText.match(pattern);
        if (match) {
            const value = parseInt(match[1], 10);
            if (value >= 0 && value <= 100) return value;
        }
    }

    return null;
}

/**
 * Get the confidence level key from a numeric score.
 * @param {number} score - Confidence 0-100
 * @returns {'high'|'medium'|'low'|'veryLow'}
 */
function getConfidenceLevel(score) {
    const clamped = Math.min(100, Math.max(0, Math.round(score)));
    if (clamped >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
    if (clamped >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
    if (clamped >= CONFIDENCE_THRESHOLDS.LOW) return 'low';
    return 'veryLow';
}

/**
 * Get the CSS class for a confidence score.
 * @param {number} score - Confidence 0-100
 * @returns {string} CSS class name
 */
function getConfidenceColor(score) {
    return CONFIDENCE_COLORS[getConfidenceLevel(score)];
}

/**
 * Get the Font Awesome icon class for a confidence score.
 * @param {number} score - Confidence 0-100
 * @returns {string} Icon class
 */
function getConfidenceIcon(score) {
    return CONFIDENCE_ICONS[getConfidenceLevel(score)];
}

/**
 * Determine if the user should provide more information.
 * @param {number} score - Confidence 0-100
 * @returns {boolean} True if confidence is below high threshold
 */
function shouldRequestMoreInfo(score) {
    return score < CONFIDENCE_THRESHOLDS.HIGH;
}

/**
 * Get the "need more info" message in the detected language.
 * @param {string} [language='bangla'] - Language key
 * @returns {string} Localized message
 */
function getNeedMoreInfoMessage(language) {
    const lang = (language || 'bangla').toLowerCase();
    return NEED_MORE_INFO[lang] || NEED_MORE_INFO.bangla;
}

/**
 * Create a confidence badge HTML element string.
 * @param {number} score - Confidence 0-100
 * @returns {string} HTML string for the badge
 */
function createConfidenceBadge(score) {
    const level = getConfidenceLevel(score);
    const label = CONFIDENCE_LABELS[level];
    const colorClass = CONFIDENCE_COLORS[level];
    const iconClass = CONFIDENCE_ICONS[level];
    const clamped = Math.min(100, Math.max(0, Math.round(score)));

    return (
        '<span class="confidence-badge ' + colorClass + '">' +
        '<i class="fas ' + iconClass + '"></i> ' +
        '<span class="confidence-value">' + clamped + '%</span> ' +
        '<span class="confidence-label">' + label + '</span>' +
        '</span>'
    );
}

/**
 * Calculate base confidence from response context.
 * @param {string} responseText - Raw AI response
 * @param {boolean} hasImage - Whether an image was analyzed
 * @param {boolean} hasKnowledgeDoc - Whether knowledge docs were found
 * @returns {number} Base confidence score
 */
function calculateBaseScore(responseText, hasImage, hasKnowledgeDoc) {
    let score = 50;

    if (hasImage) score += 30;
    if (hasKnowledgeDoc) score += 20;

    return score;
}

/**
 * Apply response content adjustments to confidence score.
 * @param {number} score - Current score
 * @param {string} responseText - Raw AI response
 * @returns {number} Adjusted score
 */
function applyContentAdjustments(score, responseText) {
    if (!responseText) return score;

    const lowerText = responseText.toLowerCase();

    for (const marker of UNCERTAINTY_MARKERS) {
        if (lowerText.includes(marker.toLowerCase())) {
            score -= 30;
            break;
        }
    }

    if (/\d+[\.,]?\d*\s*(kg|মণ|বোতল|লিটার|টন|কেজি|ml|%)/i.test(responseText)) {
        score += 10;
    }

    const hasAuthority = AUTHORITY_REFERENCES.some(ref =>
        responseText.includes(ref)
    );
    if (hasAuthority) score += 10;

    if (responseText.length < 50) {
        score -= 20;
    }

    const hasGeneralMarker = GENERAL_KNOWLEDGE_MARKERS.some(marker =>
        lowerText.includes(marker.toLowerCase())
    );
    if (hasGeneralMarker) score -= 15;

    return score;
}

/**
 * Analyze a response and return a full confidence object.
 * @param {string} responseText - Raw AI response text
 * @param {boolean} [hasImage=false] - Whether an image was analyzed
 * @param {boolean} [hasKnowledgeDoc=false] - Whether knowledge docs were found
 * @returns {object} Confidence analysis result
 */
function analyzeResponse(responseText, hasImage = false, hasKnowledgeDoc = false) {
    const explicitScore = parseConfidence(responseText);

    let score;
    if (explicitScore !== null) {
        score = explicitScore;
    } else {
        score = calculateBaseScore(responseText, hasImage, hasKnowledgeDoc);
        score = applyContentAdjustments(score, responseText);
    }

    score = Math.min(100, Math.max(0, Math.round(score)));

    const level = getConfidenceLevel(score);
    const shouldRequest = shouldRequestMoreInfo(score);

    return {
        score,
        level,
        label: CONFIDENCE_LABELS[level],
        colorClass: CONFIDENCE_COLORS[level],
        iconClass: CONFIDENCE_ICONS[level],
        badge: createConfidenceBadge(score),
        shouldRequestMoreInfo: shouldRequest,
        hasExplicitScore: explicitScore !== null,
    };
}

/* ──────────────────────────────────────────────
   Public API
   ────────────────────────────────────────────── */

export const SFConfidence = {
    parseConfidence,

    getConfidenceLevel(score) {
        return CONFIDENCE_LABELS[getConfidenceLevel(score)];
    },

    getConfidenceColor,

    getConfidenceIcon,

    shouldRequestMoreInfo,

    getNeedMoreInfoMessage,

    createConfidenceBadge,

    analyzeResponse,
};

export default SFConfidence;
