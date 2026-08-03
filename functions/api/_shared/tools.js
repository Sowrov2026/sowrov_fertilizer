/**
 * Tools Module — V11 Enterprise
 * Shared utility functions for all agents
 * Cloudflare Pages ES Module
 */

import { processLanguage } from './agents/language.js';
import { detectIntent } from './agents/intent.js';
import { searchInternalKnowledge, buildFullKnowledgeContext, verifyReferences } from './agents/knowledge.js';
import { searchAndRankProducts } from './agents/product.js';
import { processResponse, sanitizeResponseUrls } from './agents/reasoning.js';

function normalizeText(text) {
    return processLanguage(text);
}

function detectUserIntent(text, languageResult) {
    return detectIntent(text, languageResult);
}

async function searchKnowledge(query, options = {}) {
    return searchInternalKnowledge(query, options);
}

async function searchProducts(query, cropName, intent) {
    return searchAndRankProducts(query, cropName, intent);
}

function verifyResponseReferences(responseText) {
    return verifyReferences(responseText);
}

function generateResponse(responseText, context = {}) {
    return processResponse(responseText, context);
}

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

function isValidImageDataUrl(dataUrl) {
    if (typeof dataUrl !== 'string') return false;
    const regex = /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/]+=*$/;
    if (!regex.test(dataUrl)) return false;
    if (dataUrl.length > 5000000) return false;
    return true;
}

export {
    normalizeText,
    detectUserIntent,
    searchKnowledge,
    searchProducts,
    verifyResponseReferences,
    generateResponse,
    sanitizeInput,
    isValidImageDataUrl,
};
