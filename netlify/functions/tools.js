/**
 * Tools Module — V11 Enterprise
 * Shared utility functions for all agents
 */

const { processLanguage } = require('./agents/language');
const { detectIntent } = require('./agents/intent');
const { searchInternalKnowledge, buildFullKnowledgeContext, verifyReferences } = require('./agents/knowledge');
const { searchAndRankProducts } = require('./agents/product');
const { processResponse, sanitizeResponseUrls } = require('./agents/reasoning');

/**
 * normalizeText() — Full NLP normalization pipeline
 */
function normalizeText(text) {
    return processLanguage(text);
}

/**
 * detectIntent() — Intent detection with context
 */
function detectUserIntent(text, languageResult) {
    return detectIntent(text, languageResult);
}

/**
 * searchKnowledge() — Knowledge search with priority order
 */
async function searchKnowledge(query, options = {}) {
    return searchInternalKnowledge(query, options);
}

/**
 * searchProducts() — Firebase product search + ranking
 */
async function searchProducts(query, cropName, intent) {
    return searchAndRankProducts(query, cropName, intent);
}

/**
 * verifyReferences() — Validate references in response
 */
function verifyResponseReferences(responseText) {
    return verifyReferences(responseText);
}

/**
 * generateResponse() — Full response processing pipeline
 */
function generateResponse(responseText, context = {}) {
    return processResponse(responseText, context);
}

/**
 * sanitizeInput() — Prevent XSS, injection attacks
 */
function sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
        .replace(/<embed\b[^<]*>/gi, '')
        .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:text\/html/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/expression\(/gi, '')
        .replace(/\x00/g, '')
        .trim();
}

/**
 * isValidImageDataUrl() — Validate base64 image data
 */
function isValidImageDataUrl(dataUrl) {
    if (typeof dataUrl !== 'string') return false;
    const regex = /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/;
    if (!regex.test(dataUrl)) return false;
    // V34 FIX: Netlify Functions have ~6MB limit, use 5MB as safe threshold
    if (dataUrl.length > 5000000) return false;
    return true;
}

module.exports = {
    normalizeText,
    detectUserIntent,
    searchKnowledge,
    searchProducts,
    verifyResponseReferences,
    generateResponse,
    sanitizeInput,
    isValidImageDataUrl,
};
