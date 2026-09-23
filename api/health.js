import { getHealthReport, getProviderStatus, getAnswerCacheStats } from './_shared/provider-router.js';
import { buildCorsHeaders, handleOptions } from './_shared/cors.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        handleOptions(req, res, 'GET, OPTIONS');
        return;
    }
    const corsHeaders = buildCorsHeaders(req);
    if (req.method !== 'GET') {
        res.writeHead(405, corsHeaders);
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    try {
        const report = getHealthReport();
        const status = report.status === 'operational' ? 200 : 503;
        res.writeHead(status, corsHeaders);
        res.end(JSON.stringify(report, null, 2));
    } catch (error) {
        console.error('Health check error:', error);
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({
            status: 'error', error: 'Health check failed', timestamp: new Date().toISOString(),
        }));
    }
}
