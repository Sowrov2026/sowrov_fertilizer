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
    'POST /api/auth/login': { handler: () => ({ message: 'Use Firebase Auth on client side' }) },
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
    'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    const startTime = Date.now();
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const routeKey = `${req.method} ${url.pathname}`;

    try {
        const authHeader = req.headers['authorization'];
        const apiKeyHeader = req.headers['x-api-key'];

        let userId = 'anonymous';
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const decoded = await verifyToken(token, process.env.JWT_SECRET);
            if (decoded) userId = decoded.id;
        } else if (apiKeyHeader) {
            const apiKey = validateApiKey(apiKeyHeader);
            if (apiKey) userId = apiKey.userId;
        }

        if (!checkRateLimit(userId)) {
            res.writeHead(429, corsHeaders);
            res.end(JSON.stringify({ error: 'Rate limit exceeded' }));
            return;
        }

        const route = routes[routeKey];
        if (route) {
            if (route.requiresAuth && userId === 'anonymous') {
                res.writeHead(401, corsHeaders);
                res.end(JSON.stringify({ error: 'Authentication required' }));
                return;
            }
            let body = {};
            if (req.method !== 'GET') {
                body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
            }
            const result = route.handler(body, { userId });
            logRequest(req.method, url.pathname, userId, 200, Date.now() - startTime);
            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify(result));
            return;
        }

        if (url.pathname === '/api/api-keys' && req.method === 'POST') {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
                const newKey = generateApiKey(body.userId, body.permissions);
            res.writeHead(201, corsHeaders);
            res.end(JSON.stringify(newKey));
            return;
        }

        if (url.pathname === '/api/api-keys' && req.method === 'GET') {
            const keys = Array.from(apiKeys.values()).map(k => ({ id: k.id, userId: k.userId, status: k.status, usageCount: k.usageCount }));
            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify(keys));
            return;
        }

        if (url.pathname.startsWith('/api/api-keys/') && req.method === 'DELETE') {
            const keyId = url.pathname.split('/').pop();
            const revoked = revokeApiKey(keyId);
            res.writeHead(revoked ? 200 : 404, corsHeaders);
            res.end(JSON.stringify({ success: revoked }));
            return;
        }

        if (url.pathname === '/api/logs') {
            const limit = parseInt(url.searchParams.get('limit') || '100');
            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify(requestLogs.slice(-limit)));
            return;
        }

        res.writeHead(404, corsHeaders);
        res.end(JSON.stringify({ error: 'Not found', availableEndpoints: Object.keys(routes) }));
    } catch (error) {
        logRequest(req.method, url.pathname, 'error', 500, Date.now() - startTime);
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({ error: error.message }));
    }
}
