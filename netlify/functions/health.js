/* ============================================
   SF AI V31 — Provider Health Monitor API
   GET /api/health
   ============================================ */

const { getHealthReport, getProviderStatus, getAnswerCacheStats } = require('./provider-router');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': 'https://sowrov2026.github.io',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const report = getHealthReport();

        const statusCode = report.status === 'operational' ? 200 : 503;

        return {
            statusCode,
            headers,
            body: JSON.stringify(report, null, 2),
        };
    } catch (error) {
        console.error('Health check error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                status: 'error',
                error: 'Health check failed',
                timestamp: new Date().toISOString(),
            }),
        };
    }
};
