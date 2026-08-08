import { getHealthReport, getProviderStatus, getAnswerCacheStats } from './_shared/provider-router.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }
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
