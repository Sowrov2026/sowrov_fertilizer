import { runBenchmark, ensureDirs } from './_shared/evaluation/runner.js';
import { generateBenchmarkReport, generateMarkdownReport, generateDashboardSummary } from './_shared/evaluation/reports.js';
import { ALL_DOCUMENTS } from './_shared/knowledge/index.js';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

export async function onRequest(context) {
    const { request } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), { status: 405, headers: corsHeaders });
    }

    try {
        const body = await request.json();
        const { dataset = 'all', maxCases = 50 } = body;

        const VALID_DATASETS = ['bangla', 'english', 'banglish', 'chatgaiya', 'maheshkhali', 'all'];
        if (!VALID_DATASETS.includes(dataset)) {
            return new Response(JSON.stringify({ error: `Invalid dataset. Valid: ${VALID_DATASETS.join(', ')}` }), { status: 400, headers: corsHeaders });
        }

        ensureDirs();

        const DATASETS = ['bangla', 'english', 'banglish', 'chatgaiya', 'maheshkhali'];
        const datasetsToRun = dataset === 'all' ? DATASETS : [dataset];
        const allResults = [];

        for (const ds of datasetsToRun) {
            const result = runBenchmark(ds, { maxCases });
            allResults.push(result);
        }

        const report = generateBenchmarkReport(allResults);
        generateMarkdownReport(report);
        generateDashboardSummary(report);

        return new Response(JSON.stringify({
            status: 'ok',
            summary: report.summary,
            weakAreas: report.weakAreas,
            suggestions: report.suggestions,
            reportUrl: '/evaluation/reports/benchmark-report.json',
            dashboardUrl: '/evaluation/reports/dashboard-summary.json',
        }), { status: 200, headers: corsHeaders });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message, stack: err.stack }), { status: 500, headers: corsHeaders });
    }
}
