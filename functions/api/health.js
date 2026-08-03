import { getHealthReport, getProviderStatus, getAnswerCacheStats } from './_shared/provider-router.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
};

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'GET') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    try {
        const report = getHealthReport(env);
        const status = report.status === 'operational' ? 200 : 503;
        return new Response(JSON.stringify(report, null, 2), { status, headers: corsHeaders });
    } catch (error) {
        console.error('Health check error:', error);
        return new Response(JSON.stringify({
            status: 'error', error: 'Health check failed', timestamp: new Date().toISOString(),
        }), { status: 500, headers: corsHeaders });
    }
}
