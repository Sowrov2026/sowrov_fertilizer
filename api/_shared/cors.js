// ============================================
// Shared CORS Helper
// Restricts origins to trusted domains
// ============================================

const ALLOWED_ORIGINS = [
    'https://sowrov-fertilizer.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
];

function getAllowedOrigin(req) {
    const origin = req && req.headers && req.headers.origin;
    if (origin && ALLOWED_ORIGINS.indexOf(origin) !== -1) {
        return origin;
    }
    return null;
}

function buildCorsHeaders(req, extra) {
    const allowed = getAllowedOrigin(req);
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
    };
    if (allowed) {
        headers['Access-Control-Allow-Origin'] = allowed;
        headers['Vary'] = 'Origin';
    }
    if (extra) {
        Object.assign(headers, extra);
    }
    return headers;
}

function handleOptions(req, res, allowedMethods) {
    const allowed = getAllowedOrigin(req);
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': allowedMethods || 'GET, POST, OPTIONS',
    };
    if (allowed) {
        headers['Access-Control-Allow-Origin'] = allowed;
        headers['Vary'] = 'Origin';
    }
    res.writeHead(204, headers);
    res.end();
    return true;
}

export { getAllowedOrigin, buildCorsHeaders, handleOptions, ALLOWED_ORIGINS };
