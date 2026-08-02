/**
 * SF AI V14 — Benchmark Netlify Function
 * Endpoint: /.netlify/functions/benchmark
 * Method: POST
 * Body: { "dataset": "bangla|english|banglish|chatgaiya|maheshkhali|all", "maxCases": 100 }
 */

const { runBenchmark, ensureDirs } = require('./evaluation/runner');
const { generateBenchmarkReport, generateMarkdownReport, generateDashboardSummary } = require('./evaluation/reports');
const { ALL_DOCUMENTS } = require('./knowledge/index');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { dataset = 'all', maxCases = 50 } = body;

        const VALID_DATASETS = ['bangla', 'english', 'banglish', 'chatgaiya', 'maheshkhali', 'all'];
        if (!VALID_DATASETS.includes(dataset)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: `Invalid dataset. Valid: ${VALID_DATASETS.join(', ')}` }),
            };
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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status: 'ok',
                summary: report.summary,
                weakAreas: report.weakAreas,
                suggestions: report.suggestions,
                reportUrl: '/evaluation/reports/benchmark-report.json',
                dashboardUrl: '/evaluation/reports/dashboard-summary.json',
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: err.message, stack: err.stack }),
        };
    }
};
