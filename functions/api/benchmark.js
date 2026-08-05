import { ALL_DOCUMENTS, searchKnowledge } from './_shared/knowledge/index.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export async function onRequest(context) {
    const { request } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const url = new URL(request.url);
        const dataset = url.searchParams.get('dataset') || 'all';
        const query = url.searchParams.get('query') || '';

        const stats = {
            totalDocuments: ALL_DOCUMENTS.length,
            categories: {},
            sampleSearch: null,
        };

        const categories = {};
        for (const doc of ALL_DOCUMENTS) {
            const cat = doc.source || doc.type || doc.category || 'unknown';
            categories[cat] = (categories[cat] || 0) + 1;
        }
        stats.categories = categories;

        if (query) {
            const results = searchKnowledge(query, { limit: 5 });
            stats.sampleSearch = {
                query,
                resultCount: results.length,
                results: results.map(r => ({
                    id: r.id,
                    title: r.title || r.name || 'Unknown',
                    score: r.score,
                    source: r.source,
                })),
            };
        }

        return new Response(JSON.stringify({
            status: 'ok',
            stats,
            note: 'Benchmark evaluation requires Node.js runtime. Run locally: node evaluation/runner.js',
        }), { status: 200, headers: corsHeaders });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
}
