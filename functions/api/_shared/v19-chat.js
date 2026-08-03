// V19 Self-Evolving Chat Integration
// Cloudflare Pages ES Module

import {
    storeUnanswered,
    trackPopular,
    storeQualityScore,
    storeLog,
    storeSuggestion,
} from './v19-data.js';

const V19_CONFIG = {
    UNKNOWN_CONFIDENCE_THRESHOLD: 80,
    MIN_SUGGESTION_CONFIDENCE: 70,
    LOG_ALL_CHATS: true,
    TRACK_POPULAR: true,
};

function processChatResponse(userMessage, response, intent, language, startTime) {
    const responseTime = Date.now() - startTime;
    try {
        if (V19_CONFIG.TRACK_POPULAR) {
            trackPopular(userMessage, {
                crop: intent?.cropName || '',
                intent: intent?.primaryIntent || 'general',
                language: language?.language || 'unknown',
                category: getCategory(intent),
            });
        }
        storeQualityScore({
            question: userMessage,
            accuracy: estimateAccuracy(response, intent),
            confidence: intent?.confidence || 0,
            knowledgeSource: extractKnowledgeSource(response),
            languageScore: language?.confidence || 0,
            responseTime,
            intent: intent?.primaryIntent || 'general',
            language: language?.language || 'unknown',
        });
        storeLog({
            type: 'chat',
            message: `Chat: ${userMessage.substring(0, 100)}`,
            data: {
                language: language?.language,
                intent: intent?.primaryIntent,
                confidence: intent?.confidence,
                responseTime,
            },
        });
    } catch (e) {
        console.error('V19 tracking error:', e.message);
    }
}

function checkUnknownQuestion(userMessage, intent, knowledgeContext) {
    if ((intent?.confidence || 0) < V19_CONFIG.UNKNOWN_CONFIDENCE_THRESHOLD) return true;
    if (!knowledgeContext || knowledgeContext.trim().length === 0) return true;
    return false;
}

function handleUnknownQuestion(userMessage, intent, language) {
    storeUnanswered({
        question: userMessage,
        language: language?.language || 'unknown',
        location: '',
        confidence: intent?.confidence || 0,
        intent: intent?.primaryIntent || 'general',
    });
}

function generateSuggestions(userMessage, intent, response) {
    if ((intent?.confidence || 0) < V19_CONFIG.MIN_SUGGESTION_CONFIDENCE) {
        storeSuggestion({
            type: 'faq',
            question: userMessage,
            content: response?.substring(0, 200) || '',
            source: 'ai',
            language: intent?.language || 'unknown',
            frequency: 1,
        });
    }
    if (intent?.cropName && !knowledgeExists(intent.cropName)) {
        storeSuggestion({
            type: 'crop',
            content: `Add knowledge for: ${intent.cropName}`,
            source: 'ai',
            language: intent?.language || 'unknown',
        });
    }
    if (intent?.diseaseName) {
        storeSuggestion({
            type: 'disease',
            content: `Add knowledge for disease: ${intent.diseaseName}`,
            source: 'ai',
            language: intent?.language || 'unknown',
        });
    }
}

function getCategory(intent) {
    if (intent?.isDiseaseQuery) return 'disease';
    if (intent?.isFertilizerQuery) return 'fertilizer';
    if (intent?.isProductQuery) return 'product';
    if (intent?.primaryIntent === 'weather') return 'weather';
    if (intent?.primaryIntent === 'soil') return 'soil';
    return 'general';
}

function estimateAccuracy(response, intent) {
    let score = 50;
    if (intent?.confidence > 80) score += 30;
    else if (intent?.confidence > 50) score += 15;
    if (intent?.cropName) score += 10;
    if (intent?.diseaseName) score += 10;
    return Math.min(100, score);
}

function extractKnowledgeSource(response) {
    if (!response) return 'none';
    const text = response.toLowerCase();
    if (text.includes('বরি') || text.includes('bari')) return 'BARI';
    if (text.includes('ব্রি') || text.includes('brri')) return 'BRRI';
    if (text.includes('ডিএই') || text.includes('dae')) return 'DAE';
    if (text.includes('ফাও') || text.includes('fao')) return 'FAO';
    if (text.includes('সাধারণ জ্ঞান') || text.includes('general knowledge')) return 'llm';
    return 'internal';
}

function knowledgeExists(cropName) {
    const knownCrops = ['ধান', 'গম', 'পাট', 'ভুট্টা', 'আলু', 'মরিচ', 'বেগুন', 'টমেটো', 'কলা'];
    return knownCrops.some(c => cropName.includes(c));
}

export {
    V19_CONFIG,
    processChatResponse,
    checkUnknownQuestion,
    handleUnknownQuestion,
    generateSuggestions,
};
