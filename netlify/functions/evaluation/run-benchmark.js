/**
 * SF AI V14 — Main Benchmark Runner
 * Usage: node run-benchmark.js [dataset] [maxCases]
 * Examples:
 *   node run-benchmark.js all          — Run all 5 datasets
 *   node run-benchmark.js bangla 100   — Run 100 Bangla cases
 *   node run-benchmark.js english      — Run all English cases
 *   node run-benchmark.js chatgaiya    — Run all Chatgaiya cases
 *   node run-benchmark.js maheshkhali  — Run all Maheshkhali cases
 */

const path = require('path');
const fs = require('fs');
const { runBenchmark, ensureDirs } = require('./runner');
const { generateBenchmarkReport, generateMarkdownReport, generateDashboardSummary } = require('./reports');
const { ALL_DOCUMENTS } = require('../knowledge/index');

const DATASETS = ['bangla', 'english', 'banglish', 'chatgaiya', 'maheshkhali'];

function parseArgs() {
    const args = process.argv.slice(2);
    const dataset = args[0] || 'all';
    const maxCases = args[1] ? parseInt(args[1], 10) : undefined;
    return { dataset, maxCases };
}

function main() {
    const { dataset, maxCases } = parseArgs();

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║     SF AI V14 — AI EVALUATION & BENCHMARK SYSTEM    ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log(`  Date: ${new Date().toISOString()}`);
    console.log(`  Knowledge Base: ${ALL_DOCUMENTS.length} documents`);

    ensureDirs();

    const datasetsToRun = dataset === 'all' ? DATASETS : [dataset];
    const allResults = [];

    for (const ds of datasetsToRun) {
        try {
            const result = runBenchmark(ds, { maxCases });
            allResults.push(result);
        } catch (err) {
            console.error(`  ERROR running ${ds}: ${err.message}`);
        }
    }

    if (allResults.length > 0) {
        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║            GENERATING REPORTS                        ║');
        console.log('╚══════════════════════════════════════════════════════╝');

        const report = generateBenchmarkReport(allResults);
        console.log('  ✓ benchmark-report.json');

        generateMarkdownReport(report);
        console.log('  ✓ benchmark-report.md');

        generateDashboardSummary(report);
        console.log('  ✓ dashboard-summary.json');

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║            FINAL SUMMARY                             ║');
        console.log('╚══════════════════════════════════════════════════════╝');
        console.log(`  Total Tests: ${report.summary.totalTestCases}`);
        console.log(`  Passed: ${report.summary.totalPassed}`);
        console.log(`  Failed: ${report.summary.totalFailed}`);
        console.log(`  Overall Accuracy: ${(report.summary.overallAccuracy * 100).toFixed(2)}%`);
        console.log(`  Avg Latency: ${report.summary.avgLatency.toFixed(1)}ms`);
        console.log(`  Hallucination Rate: ${(report.summary.hallucinationRate * 100).toFixed(2)}%`);
        console.log(`  Language Accuracy: ${(report.summary.avgLanguageAccuracy * 100).toFixed(2)}%`);
        console.log(`  Status: ${report.summary.overallAccuracy >= 0.7 ? '✅ PASS' : report.summary.overallAccuracy >= 0.5 ? '⚠️ NEEDS_WORK' : '❌ FAIL'}`);

        if (report.suggestions.length > 0) {
            console.log('\n  TOP RECOMMENDATIONS:');
            report.suggestions.slice(0, 3).forEach((s, i) => {
                console.log(`  ${i + 1}. [${s.priority.toUpperCase()}] ${s.suggestion}`);
            });
        }

        console.log('\n  Reports saved to: evaluation/reports/');
        console.log('  Logs saved to: evaluation/logs/');
    }

    console.log('\n  Benchmark complete.');
}

main();
