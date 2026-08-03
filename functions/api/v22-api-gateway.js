import { verifyToken, hasPermission } from './_shared/v22-auth.js';

const apiKeys = new Map();
const rateLimits = new Map();
const requestLogs = [];

function generateApiKey(userId, permissions = []) {
    const idArr = new Uint8Array(16);
    crypto.getRandomValues(idArr);
    const keyArr = new Uint8Array(32);
    crypto.getRandomValues(keyArr);
    const key = {
        id: Array.from(idArr, b => b.toString(16).padStart(2, '0')).join(''),
        key: 'sf_' + Array.from(keyArr, b => b.toString(16).padStart(2, '0')).join(''),
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

function validateApiKey(key) {
    if (!key) return null;
    const apiKey = Array.from(apiKeys.values()).find(k => k.key === key);
    if (!apiKey || apiKey.status !== 'active') return null;
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) return null;
    apiKey.lastUsed = new Date().toISOString();
    apiKey.usageCount++;
    return apiKey;
}

function revokeApiKey(keyId) {
    const key = apiKeys.get(keyId);
    if (key) { key.status = 'revoked'; return true; }
    return false;
}

function checkRateLimit(userId, limit = 100) {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const userLimits = rateLimits.get(userId) || { count: 0, windowStart: now };
    if (now - userLimits.windowStart > windowMs) {
        userLimits.count = 0;
        userLimits.windowStart = now;
    }
    userLimits.count++;
    rateLimits.set(userId, userLimits);
    return userLimits.count <= limit;
}

function logRequest(method, path, userId, status, duration) {
    requestLogs.push({ timestamp: new Date().toISOString(), method, path, userId, status, duration });
    if (requestLogs.length > 10000) requestLogs.splice(0, requestLogs.length - 10000);
}

const routes = {
    'GET /api/health': { handler: () => ({ status: 'ok', version: 'v22' }) },
    'POST /api/auth/login': { handler: (body) => ({ message: 'Use Firebase Auth on client side' }) },
    'GET /api/users': { requiresAuth: true, requiresPermission: 'users:list', handler: () => ({ users: [] }) },
    'GET /api/products': { handler: () => ({ products: [] }) },
    'GET /api/orders': { requiresAuth: true, requiresPermission: 'orders:read', handler: () => ({ orders: [] }) },
    'GET /api/analytics/dashboard': { requiresAuth: true, requiresPermission: 'reports:view', handler: () => ({ dashboard: {} }) },
    'GET /api/docs': { handler: () => ({ openapi: '3.0.0', info: { title: 'SF AI Enterprise API', version: '22.0.0' } }) },
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
};

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const startTime = Date.now();
    const url = new URL(request.url);
    const routeKey = `${request.method} ${url.pathname}`;

    try {
        const authHeader = request.headers.get('authorization');
        const apiKeyHeader = request.headers.get('x-api-key');

        let userId = 'anonymous';
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const decoded = await verifyToken(token, env?.JWT_SECRET);
            if (decoded) userId = decoded.id;
        } else if (apiKeyHeader) {
            const apiKey = validateApiKey(apiKeyHeader);
            if (apiKey) userId = apiKey.userId;
        }

        if (!checkRateLimit(userId)) {
            return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: corsHeaders });
        }

        const route = routes[routeKey];
        if (route) {
            if (route.requiresAuth && userId === 'anonymous') {
                return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: corsHeaders });
            }
            const body = request.method !== 'GET' ? await request.json().catch(() => ({})) : {};
            const result = route.handler(body, { userId, env });
            logRequest(request.method, url.pathname, userId, 200, Date.now() - startTime);
            return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
        }

        if (url.pathname === '/api/api-keys' && request.method === 'POST') {
            const body = await request.json();
            const newKey = generateApiKey(body.userId, body.permissions);
            return new Response(JSON.stringify(newKey), { status: 201, headers: corsHeaders });
        }

        if (url.pathname === '/api/api-keys' && request.method === 'GET') {
            const keys = Array.from(apiKeys.values()).map(k => ({ id: k.id, userId: k.userId, status: k.status, usageCount: k.usageCount }));
            return new Response(JSON.stringify(keys), { status: 200, headers: corsHeaders });
        }

        if (url.pathname.startsWith('/api/api-keys/') && request.method === 'DELETE') {
            const keyId = url.pathname.split('/').pop();
            const revoked = revokeApiKey(keyId);
            return new Response(JSON.stringify({ success: revoked }), { status: revoked ? 200 : 404, headers: corsHeaders });
        }

        if (url.pathname === '/api/logs') {
            const limit = parseInt(url.searchParams.get('limit') || '100');
            return new Response(JSON.stringify(requestLogs.slice(-limit)), { status: 200, headers: corsHeaders });
        }

        return new Response(JSON.stringify({ error: 'Not found', availableEndpoints: Object.keys(routes) }), { status: 404, headers: corsHeaders });
    } catch (error) {
        logRequest(request.method, url.pathname, 'error', 500, Date.now() - startTime);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
}
