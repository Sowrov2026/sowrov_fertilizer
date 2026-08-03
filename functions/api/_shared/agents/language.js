import { normalizeChatgaiya, PRONOUNS, VERBS_FUTURE, VERBS_PAST, VERBS_PRESENT, VERBS_CAUSATIVE, COPULA, PARTICLES, QUESTIONS, AGRICULTURE } from '../chatgaiya/engine.js';

function detectLanguage(text) {
    if (!text) return 'unknown';
    const hasBangla = /[\u0980-\u09FF]/.test(text);
    const hasLatin = /[a-zA-Z]/.test(text);
    if (hasBangla && hasLatin) return 'mixed';
    if (hasBangla) return 'bangla';
    if (hasLatin) {
        const lower = text.toLowerCase();
        const banglishWords = ['ami', 'tumi', 'apni', 'dibo', 'kemon', 'ache', 'hobe', 'korte', 'valo',
            'tomato', 'begun', 'morich', 'dhan', 'sar', 'foshol', 'kivabe', 'koto', 'amar'];
        if (banglishWords.some(w => lower.includes(w))) return 'banglish';
        return 'english';
    }
    return 'unknown';
}

function isChittagonian(text) {
    if (!text) return false;
    const allDicts = [PRONOUNS, VERBS_FUTURE, VERBS_PAST, VERBS_PRESENT, VERBS_CAUSATIVE, COPULA, PARTICLES, QUESTIONS, AGRICULTURE];
    const allKeys = allDicts.flatMap(d => Object.keys(d));
    return allKeys.some(kw => text.includes(kw));
}

function detectDialect(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    if (/মহেশখালী|maheshkhali/.test(lower)) return 'maheshkhali';
    if (/কক্সবাজার|cox/.test(lower)) return 'coxs_bazar';
    if (/কুতুবদিয়া|kutubdia/.test(lower)) return 'kutubdia';
    if (/চাটগ্রাম|chattogram|chittagong/.test(lower)) return 'chattogram';
    if (isChittagonian(text)) return 'chittagonian';
    return null;
}

function processLanguage(text) {
    const language = detectLanguage(text);
    const dialect = detectDialect(text);
    const chittagonian = isChittagonian(text);
    const normalized = normalizeChatgaiya(text);

    return {
        language,
        dialect,
        normalized,
        isChittagonian: chittagonian,
    };
}

export {
    detectLanguage,
    isChittagonian,
    detectDialect,
    processLanguage,
};
