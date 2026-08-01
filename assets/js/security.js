/**
 * SF Security Module v15
 * Client-side security utilities for input sanitization,
 * prompt injection detection, rate limiting, and image validation.
 */

const RATE_LIMIT_DEFAULTS = {
    chat: { maxRequests: 15, windowMs: 60000 },
    image: { maxRequests: 5, windowMs: 60000 },
    search: { maxRequests: 30, windowMs: 60000 }
};

const RATE_LIMIT_KEY = 'sf_rate_limits';

const MAX_INPUT_LENGTH = 2000;

const PROMPT_INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /ignore\s+all\s+prior\s+instructions/i,
    /disregard\s+(all\s+)?previous\s+instructions/i,
    /system\s*prompt/i,
    /you\s+are\s+now/i,
    /you\s+are\s+now\s+(a|an|the)/i,
    /forget\s+everything/i,
    /forget\s+(all\s+)?(your|previous|prior)\s+(instructions|rules|guidelines)/i,
    /new\s+instructions/i,
    /new\s+system\s+prompt/i,
    /override\s+(all\s+)?(previous|prior|existing)\s+(instructions|rules)/i,
    /override\s+instructions/i,
    /jailbreak/i,
    /dan\s+mode/i,
    /do\s+anything\s+now/i,
    /act\s+as\s+(?:a\s+)?(?:different|new)\s+(?:system|AI)/i,
    /pretend\s+you\s+(?:are|have)\s+no\s+(?:rules|restrictions|limitations)/i,
    /you\s+(?:must|will|should)\s+(?:now\s+)?(?:always|never)/i,
    /bypass\s+(all\s+)?(?:safety|content|security)\s+(?:filters|rules|guidelines)/i,
    // Bangla patterns
    /আগের\s+নির্দেশনা\s+উপেক্ষা\s+কর/i,
    /সব\s+নির্দেশনা\s+ভুলে\s+যাও/i,
    /নতুন\s+নির্দেশনা/i,
    /সিস্টেম\s+প্রম্পট/i,
    /তুমি\s+এখন/i,
    /সবকিছু\s+ভুলে\s+যাও/i,
    /নির্দেশনা\s+ওভাররাইড/i
];

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DIMENSION = 4096;

function getStoredRateLimits() {
    try {
        const stored = localStorage.getItem(RATE_LIMIT_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

function saveRateLimits(limits) {
    try {
        localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(limits));
    } catch {
        // localStorage full or unavailable
    }
}

function cleanExpiredEntries(limits, now) {
    const cleaned = {};
    for (const [action, entries] of Object.entries(limits)) {
        cleaned[action] = entries.filter(timestamp => timestamp > now);
        if (cleaned[action].length === 0) {
            delete cleaned[action];
        }
    }
    return cleaned;
}

function sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    let cleaned = text.substring(0, MAX_INPUT_LENGTH);
    cleaned = cleaned
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/data\s*:/gi, '')
        .replace(/vbscript\s*:/gi, '')
        .replace(/expression\s*\(/gi, '')
        .replace(/<object[\s\S]*?<\/object>/gi, '')
        .replace(/<embed[\s\S]*?>/gi, '')
        .replace(/<applet[\s\S]*?<\/applet>/gi, '');
    return cleaned.trim();
}

function detectPromptInjection(text) {
    if (typeof text !== 'string') return { detected: false, matches: [] };
    const matches = [];
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
        const result = text.match(pattern);
        if (result) {
            matches.push({ pattern: pattern.source, match: result[0] });
        }
    }
    return { detected: matches.length > 0, matches };
}

function checkRateLimit(action, maxRequests = null, windowMs = null) {
    const config = RATE_LIMIT_DEFAULTS[action] || { maxRequests: 15, windowMs: 60000 };
    const effectiveMax = maxRequests ?? config.maxRequests;
    const effectiveWindow = windowMs ?? config.windowMs;
    const now = Date.now();
    const limits = getStoredRateLimits();
    const entries = (limits[action] || []).filter(ts => ts > now - effectiveWindow);
    const remaining = Math.max(0, effectiveMax - entries.length);
    const allowed = remaining > 0;
    let resetIn = 0;
    if (entries.length >= effectiveMax) {
        const oldest = Math.min(...entries);
        resetIn = Math.ceil((oldest + effectiveWindow - now) / 1000);
    }
    if (allowed) {
        entries.push(now);
        limits[action] = entries;
        saveRateLimits(limits);
    }
    return { allowed, remaining, resetIn };
}

function validateImage(file, options = {}) {
    const { maxSize = MAX_FILE_SIZE, maxDimension = MAX_DIMENSION, allowedTypes = ALLOWED_IMAGE_TYPES } = options;
    if (!file || !(file instanceof File)) {
        return { valid: false, error: 'No file provided' };
    }
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` };
    }
    if (file.size > maxSize) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
        return { valid: false, error: `File too large. Maximum size: ${maxMB}MB` };
    }
    return new Promise(resolve => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            if (img.width > maxDimension || img.height > maxDimension) {
                resolve({
                    valid: false,
                    error: `Image dimensions too large. Maximum: ${maxDimension}x${maxDimension}px`
                });
            } else {
                resolve({ valid: true, width: img.width, height: img.height });
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ valid: false, error: 'Failed to load image for validation' });
        };
        img.src = objectUrl;
    });
}

function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
    return text.replace(/[&<>"'/]/g, char => map[char]);
}

function sanitizeUrl(url) {
    if (typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (/^(javascript|data|vbscript)\s*:/i.test(trimmed)) return '';
    if (/^\/\//.test(trimmed)) return trimmed;
    try {
        const parsed = new URL(trimmed, window.location.origin);
        if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) return '';
        return parsed.href;
    } catch {
        return '';
    }
}

function getRateLimitStatus(action) {
    const config = RATE_LIMIT_DEFAULTS[action] || { maxRequests: 15, windowMs: 60000 };
    const now = Date.now();
    const limits = getStoredRateLimits();
    const entries = (limits[action] || []).filter(ts => ts > now - config.windowMs);
    const remaining = Math.max(0, config.maxRequests - entries.length);
    let resetIn = 0;
    if (entries.length >= config.maxRequests) {
        const oldest = Math.min(...entries);
        resetIn = Math.ceil((oldest + config.windowMs - now) / 1000);
    }
    return { allowed: remaining > 0, remaining, resetIn, maxRequests: config.maxRequests };
}

function resetRateLimits() {
    try {
        localStorage.removeItem(RATE_LIMIT_KEY);
    } catch {
        // ignore
    }
}

export const SFSecurity = {
    sanitizeInput,
    detectPromptInjection,
    checkRateLimit,
    validateImage,
    escapeHtml,
    sanitizeUrl,
    getRateLimitStatus,
    resetRateLimits
};
