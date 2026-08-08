import { ALL_DOCUMENTS, searchKnowledge } from './_shared/knowledge/index.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    try {
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
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

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
            status: 'ok',
            stats,
            note: 'Benchmark evaluation requires Node.js runtime. Run locally: node evaluation/runner.js',
        }));
    } catch (err) {
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({ error: err.message }));
    }
}
