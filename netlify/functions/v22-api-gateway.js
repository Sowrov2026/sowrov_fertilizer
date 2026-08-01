// V22 API Gateway
// Production-ready API gateway with rate limiting, API keys, and OpenAPI documentation

const crypto = require('crypto');
const { verifyToken, hasPermission } = require('./v22-auth');

// API Keys storage (in production, use database)
const apiKeys = new Map();

// Rate limiting (in production, use Redis)
const rateLimits = new Map();

// Request logging
const requestLogs = [];

// Generate API key
function generateApiKey(userId, permissions = []) {
    const key = {
        id: crypto.randomBytes(16).toString('hex'),
        key: 'sf_' + crypto.randomBytes(32).toString('hex'),
        userId,
        permissions,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUsed: null,
        usageCount: 0,
        rateLimit: 100,
        expiresAt: null,
    };
    apiKeys.set(key.id, key);
    return key;
}

// Validate API key
function validateApiKey(key) {
    if (!key) return null;
    const apiKey = Array.from(apiKeys.values()).find(k => k.key === key);
    if (!apiKey || apiKey.status !== 'active') return null;
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) return null;
    apiKey.lastUsed = new Date().toISOString();
    apiKey.usageCount++;
    return apiKey;
}

// Revoke API key
function revokeApiKey(keyId) {
    const key = apiKeys.get(keyId);
    if (key) {
        key.status = 'revoked';
        return true;
    }
    return false;
}

// List API keys for user
function listApiKeys(userId) {
    const keys = [];
    for (const [, key] of apiKeys) {
        if (key.userId === userId) {
            keys.push({ ...key, key: key.key.slice(0, 10) + '...' });
        }
    }
    return keys;
}

// Check rate limit
function checkRateLimit(identifier, limit = 100, window = 60000) {
    const now = Date.now();
    if (!rateLimits.has(identifier)) {
        rateLimits.set(identifier, { count: 1, resetAt: now + window });
        return { allowed: true, remaining: limit - 1, resetAt: now + window };
    }

    const record = rateLimits.get(identifier);
    if (now > record.resetAt) {
        record.count = 1;
        record.resetAt = now + window;
        return { allowed: true, remaining: limit - 1, resetAt: record.resetAt };
    }

    if (record.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: record.resetAt, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
    }

    record.count++;
    return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

// Clear expired rate limits
function clearExpiredRateLimits() {
    const now = Date.now();
    for (const [id, record] of rateLimits) {
        if (now > record.resetAt) {
            rateLimits.delete(id);
        }
    }
}

// Log request
function logRequest(req, res, duration) {
    const log = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.headers?.['user-agent'] || 'unknown',
        apiKeyId: req.user?.id || null,
    };
    requestLogs.push(log);
    if (requestLogs.length > 1000) requestLogs.shift();
    return log;
}

// Validate request body
function validateBody(body, schema) {
    const errors = [];
    if (schema.required) {
        for (const field of schema.required) {
            if (body[field] === undefined || body[field] === null) {
                errors.push(`${field} is required`);
            }
        }
    }
    return errors;
}

// Sanitize input
function sanitizeInput(input) {
    if (typeof input === 'string') {
        return input.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '');
    }
    if (typeof input === 'object' && input !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    return input;
}

// OpenAPI documentation
function getOpenAPISpec() {
    return {
        openapi: '3.0.3',
        info: {
            title: 'SF AI Enterprise API',
            version: '22.0.0',
            description: 'Bangladesh Agriculture Enterprise Platform API - Complete backend for farm management, e-commerce, and AI-powered insights',
            contact: {
                name: 'SF AI Enterprise',
                email: 'api@sfaienterprise.com',
            },
            license: {
                name: 'Proprietary',
            },
        },
        servers: [
            { url: '/.netlify/functions', description: 'Netlify Functions' },
            { url: 'https://sfaienterprise.netlify.app', description: 'Production' },
        ],
        paths: {
            '/v22-auth': {
                get: {
                    summary: 'Get current user',
                    tags: ['Auth'],
                    security: [{ bearerAuth: [] }],
                },
                post: {
                    summary: 'Authenticate user',
                    tags: ['Auth'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string', minLength: 6 },
                                    },
                                },
                            },
                        },
                    },
                },
                put: {
                    summary: 'Update user profile',
                    tags: ['Auth'],
                    security: [{ bearerAuth: [] }],
                },
            },
            '/v22-order': {
                get: {
                    summary: 'List orders',
                    tags: ['Orders'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered'] } },
                    ],
                },
                post: {
                    summary: 'Create order',
                    tags: ['Orders'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['items', 'shippingAddress'],
                                    properties: {
                                        items: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                required: ['productId', 'quantity'],
                                                properties: {
                                                    productId: { type: 'string' },
                                                    quantity: { type: 'integer', minimum: 1 },
                                                },
                                            },
                                        },
                                        shippingAddress: { type: 'object' },
                                        paymentMethod: { type: 'string', enum: ['cod', 'bkash', 'nagad', 'card'] },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '/v22-payment': {
                post: {
                    summary: 'Create payment',
                    tags: ['Payments'],
                    security: [{ bearerAuth: [] }],
                },
                get: {
                    summary: 'List payments',
                    tags: ['Payments'],
                    security: [{ bearerAuth: [] }],
                },
            },
            '/v22-notification': {
                get: {
                    summary: 'Get notifications',
                    tags: ['Notifications'],
                    security: [{ bearerAuth: [] }],
                },
                post: {
                    summary: 'Create notification',
                    tags: ['Notifications'],
                    security: [{ bearerAuth: [] }],
                },
            },
            '/v22-analytics': {
                get: {
                    summary: 'Get analytics',
                    tags: ['Analytics'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'action', in: 'query', required: true, schema: { type: 'string', enum: ['dashboard', 'sales', 'users', 'products', 'revenue'] } },
                        { name: 'period', in: 'query', schema: { type: 'string', enum: ['day', 'week', 'month', 'year'] } },
                    ],
                },
            },
            '/v22-insights': {
                post: {
                    summary: 'Get AI insights',
                    tags: ['AI'],
                    security: [{ bearerAuth: [] }],
                },
            },
            '/v22-api-gateway': {
                get: {
                    summary: 'API gateway info and OpenAPI spec',
                    tags: ['Gateway'],
                },
            },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                apiKey: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'X-API-Key',
                },
            },
            schemas: {
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        items: { type: 'array' },
                        total: { type: 'number' },
                        status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' },
                        code: { type: 'string' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Auth', description: 'Authentication and user management' },
            { name: 'Orders', description: 'Order management' },
            { name: 'Payments', description: 'Payment processing' },
            { name: 'Notifications', description: 'Push notifications' },
            { name: 'Analytics', description: 'Business analytics' },
            { name: 'AI', description: 'AI-powered insights' },
            { name: 'Gateway', description: 'API gateway management' },
        ],
    };
}

// API middleware
function apiMiddleware(req, res, next) {
    const startTime = Date.now();
    const apiKey = req.headers['x-api-key'];
    const authHeader = req.headers.authorization;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://sowrov2026.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Authentication
    if (apiKey) {
        const validKey = validateApiKey(apiKey);
        if (!validKey) {
            return res.status(401).json({ error: 'Invalid API key', code: 'INVALID_API_KEY' });
        }
        req.user = validKey;
        req.authMethod = 'api_key';
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        // Actually verify JWT token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
        }
        req.user = decoded;
        req.authMethod = 'jwt';
    } else {
        // Allow unauthenticated access to public endpoints
        if (!req.path.includes('openapi') && !req.path.includes('health')) {
            return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
        }
    }

    // Rate limiting
    const identifier = apiKey || req.ip || 'unknown';
    const rateLimit = req.user?.rateLimit || 100;
    const rateCheck = checkRateLimit(identifier, rateLimit);

    res.setHeader('X-RateLimit-Limit', rateLimit);
    res.setHeader('X-RateLimit-Remaining', rateCheck.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateCheck.resetAt / 1000));

    if (!rateCheck.allowed) {
        res.setHeader('Retry-After', rateCheck.retryAfter);
        return res.status(429).json({
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: rateCheck.retryAfter,
        });
    }

    // Permission check
    if (req.requiredPermission && req.user?.permissions) {
        if (!req.user.permissions.includes(req.requiredPermission)) {
            return res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
        }
    }

    // Add timing header
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - startTime;
        res.setHeader('X-Response-Time', `${duration}ms`);
        logRequest(req, res, duration);
        originalEnd.apply(res, args);
    };

    next();
}

// Health check
function healthCheck() {
    return {
        status: 'healthy',
        version: '22.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        apiKeys: apiKeys.size,
        rateLimits: rateLimits.size,
        requestLogs: requestLogs.length,
    };
}

// Get API usage stats
function getUsageStats() {
    clearExpiredRateLimits();
    return {
        totalApiKeys: apiKeys.size,
        activeApiKeys: Array.from(apiKeys.values()).filter(k => k.status === 'active').length,
        totalRequests: requestLogs.length,
        recentRequests: requestLogs.slice(-100),
        rateLimits: rateLimits.size,
    };
}

// Netlify function handler
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Content-Type': 'application/json',
    };

    try {
        if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
        }

        const params = new URLSearchParams(event.queryStringParameters || {});
        const action = params.get('action') || 'info';
        const body = JSON.parse(event.body || '{}');

        let result;

        switch (action) {
            case 'info':
                result = {
                    name: 'SF AI Enterprise API Gateway',
                    version: '22.0.0',
                    endpoints: {
                        auth: '/.netlify/functions/v22-auth',
                        order: '/.netlify/functions/v22-order',
                        payment: '/.netlify/functions/v22-payment',
                        notification: '/.netlify/functions/v22-notification',
                        analytics: '/.netlify/functions/v22-analytics',
                        insights: '/.netlify/functions/v22-insights',
                        gateway: '/.netlify/functions/v22-api-gateway',
                    },
                    documentation: '/.netlify/functions/v22-api-gateway?action=openapi',
                    health: '/.netlify/functions/v22-api-gateway?action=health',
                };
                break;

            case 'openapi':
                return {
                    statusCode: 200,
                    headers: { ...headers, 'Content-Type': 'application/yaml' },
                    body: JSON.stringify(getOpenAPISpec()),
                };

            case 'health':
                result = healthCheck();
                break;

            case 'usage':
                result = getUsageStats();
                break;

            case 'generateKey':
                if (event.httpMethod !== 'POST') {
                    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST required' }) };
                }
                if (!body.userId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'userId is required' }) };
                }
                result = generateApiKey(body.userId, body.permissions || []);
                break;

            case 'validateKey':
                if (!body.key) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'key is required' }) };
                }
                const validKey = validateApiKey(body.key);
                result = validKey ? { valid: true, key: { ...validKey, key: validKey.key.slice(0, 10) + '...' } } : { valid: false };
                break;

            case 'revokeKey':
                if (event.httpMethod !== 'POST') {
                    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST required' }) };
                }
                if (!body.keyId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'keyId is required' }) };
                }
                result = { revoked: revokeApiKey(body.keyId) };
                break;

            case 'listKeys':
                if (!body.userId) {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'userId is required' }) };
                }
                result = listApiKeys(body.userId);
                break;

            case 'clearRateLimits':
                if (event.httpMethod !== 'POST') {
                    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST required' }) };
                }
                clearExpiredRateLimits();
                result = { cleared: true, remaining: rateLimits.size };
                break;

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: `Unknown action: ${action}`,
                        availableActions: ['info', 'openapi', 'health', 'usage', 'generateKey', 'validateKey', 'revokeKey', 'listKeys', 'clearRateLimits'],
                    }),
                };
        }

        return { statusCode: 200, headers, body: JSON.stringify(result) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};

module.exports = {
    generateApiKey,
    validateApiKey,
    revokeApiKey,
    listApiKeys,
    checkRateLimit,
    clearExpiredRateLimits,
    getOpenAPISpec,
    apiMiddleware,
    healthCheck,
    getUsageStats,
    sanitizeInput,
    validateBody,
};
