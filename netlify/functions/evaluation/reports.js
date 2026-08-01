/**
 * SF AI V14 — Report Generator
 * Generates: benchmark-report.json, benchmark-report.md, dashboard-summary.json
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, 'reports');

/**
 * Find weak areas (categories below threshold)
 */
function findWeakAreas(aggregation, threshold = 0.6) {
    const weak = [];
    if (aggregation.byCategory) {
        for (const [cat, data] of Object.entries(aggregation.byCategory)) {
            if (data.accuracy < threshold) {
                weak.push({
                    type: 'category',
                    name: cat,
                    accuracy: data.accuracy,
                    avgScore: data.avgScore,
                    total: data.total,
                    passed: data.passed,
                });
            }
        }
    }
    if (aggregation.byLanguage) {
        for (const [lang, data] of Object.entries(aggregation.byLanguage)) {
            if (data.accuracy < threshold) {
                weak.push({
                    type: 'language',
                    name: lang,
                    accuracy: data.accuracy,
                    avgScore: data.avgScore,
                    total: data.total,
                    passed: data.passed,
                });
            }
        }
    }
    if (aggregation.byDifficulty) {
        for (const [diff, data] of Object.entries(aggregation.byDifficulty)) {
            if (data.accuracy < threshold) {
                weak.push({
                    type: 'difficulty',
                    name: diff,
                    accuracy: data.accuracy,
                    avgScore: data.avgScore,
                    total: data.total,
                    passed: data.passed,
                });
            }
        }
    }
    return weak.sort((a, b) => a.accuracy - b.accuracy);
}

/**
 * Generate improvement suggestions based on benchmark results
 */
function generateSuggestions(aggregation, weakAreas) {
    const suggestions = [];
    for (const weak of weakAreas) {
        if (weak.type === 'category') {
            switch (weak.name) {
                case 'crop_identification':
                    suggestions.push({
                        area: 'crop_identification',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on crop identification`,
                        suggestion: 'Improve crop alias mapping in intent.js. Add more Chatgaiya/Banglish crop name aliases.',
                        priority: weak.accuracy < 0.4 ? 'critical' : 'high',
                    });
                    break;
                case 'disease_diagnosis':
                    suggestions.push({
                        area: 'disease_diagnosis',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on disease diagnosis`,
                        suggestion: 'Expand disease symptom keywords in knowledge base. Add more Bangla disease terminology.',
                        priority: weak.accuracy < 0.4 ? 'critical' : 'high',
                    });
                    break;
                case 'fertilizer_recommendation':
                    suggestions.push({
                        area: 'fertilizer_recommendation',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on fertilizer recommendation`,
                        suggestion: 'Add more fertilizer-crop mapping data. Include seasonal fertilizer schedules.',
                        priority: weak.accuracy < 0.4 ? 'critical' : 'high',
                    });
                    break;
                case 'organic_farming':
                    suggestions.push({
                        area: 'organic_farming',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on organic farming`,
                        suggestion: 'Expand organic farming knowledge base. Add more organic method entries.',
                        priority: 'medium',
                    });
                    break;
                case 'soil_health':
                    suggestions.push({
                        area: 'soil_health',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on soil health`,
                        suggestion: 'Add regional soil data for Chattogram/Maheshkhali coastal areas.',
                        priority: 'medium',
                    });
                    break;
                case 'pest_control':
                    suggestions.push({
                        area: 'pest_control',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on pest control`,
                        suggestion: 'Expand pest identification data. Add seasonal pest patterns.',
                        priority: weak.accuracy < 0.4 ? 'critical' : 'high',
                    });
                    break;
                case 'weather_advice':
                    suggestions.push({
                        area: 'weather_advice',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on weather advice`,
                        suggestion: 'Add seasonal weather-crop mapping. Include Kharif/Rabi season data.',
                        priority: 'medium',
                    });
                    break;
                case 'product_recommendation':
                    suggestions.push({
                        area: 'product_recommendation',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on product recommendation`,
                        suggestion: 'Improve product-crop matching in product agent. Add more product metadata.',
                        priority: 'high',
                    });
                    break;
            }
        } else if (weak.type === 'language') {
            switch (weak.name) {
                case 'chatgaiya':
                    suggestions.push({
                        area: 'chatgaiya_detection',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on Chatgaiya language detection`,
                        suggestion: 'Expand Chatgaiya dictionary in engine.js. Add more Chittagonian dialect keywords.',
                        priority: weak.accuracy < 0.4 ? 'critical' : 'high',
                    });
                    break;
                case 'banglish':
                    suggestions.push({
                        area: 'banglish_detection',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on Banglish detection`,
                        suggestion: 'Improve Banglish word list in language.js. Add more romanized Bangla words.',
                        priority: 'high',
                    });
                    break;
                case 'mixed':
                    suggestions.push({
                        area: 'mixed_language',
                        issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on mixed language handling`,
                        suggestion: 'Improve mixed language detection logic. Handle code-switching better.',
                        priority: 'medium',
                    });
                    break;
            }
        } else if (weak.type === 'difficulty') {
            suggestions.push({
                area: `difficulty_${weak.name}`,
                issue: `Accuracy ${(weak.accuracy * 100).toFixed(1)}% on ${weak.name} questions`,
                suggestion: `Add more knowledge entries for ${weak.name}-level questions.`,
                priority: weak.name === 'hard' ? 'high' : 'medium',
            });
        }
    }
    if (aggregation.avgLatency > 1000) {
        suggestions.push({
            area: 'performance',
            issue: `Average latency ${aggregation.avgLatency.toFixed(0)}ms is above 1000ms target`,
            suggestion: 'Optimize knowledge search. Consider pre-computing search indexes. Cache frequent queries.',
            priority: aggregation.avgLatency > 2000 ? 'critical' : 'high',
        });
    }
    if (aggregation.hallucinationRate > 0.05) {
        suggestions.push({
            area: 'hallucination',
            issue: `Hallucination rate ${(aggregation.hallucinationRate * 100).toFixed(1)}% exceeds 5% threshold`,
            suggestion: 'Strengthen URL validation. Add more verified knowledge entries. Improve source verification.',
            priority: aggregation.hallucinationRate > 0.1 ? 'critical' : 'high',
        });
    }
    return suggestions.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
    });
}

/**
 * Generate benchmark-report.json
 */
function generateBenchmarkReport(benchmarkResults) {
    const allAggregations = benchmarkResults.map(b => ({
        dataset: b.dataset,
        aggregation: b.aggregation,
    }));
    const totalCases = benchmarkResults.reduce((s, b) => s + b.aggregation.total, 0);
    const totalPassed = benchmarkResults.reduce((s, b) => s + b.aggregation.passed, 0);
    const overallAccuracy = totalCases > 0 ? totalPassed / totalCases : 0;
    const avgLatency = benchmarkResults.reduce((s, b) => s + b.aggregation.avgLatency * b.aggregation.total, 0) / (totalCases || 1);
    const avgHallucination = benchmarkResults.reduce((s, b) => s + b.aggregation.hallucinationRate * b.aggregation.total, 0) / (totalCases || 1);
    const avgLangScore = benchmarkResults.reduce((s, b) => s + b.aggregation.avgLanguageScore * b.aggregation.total, 0) / (totalCases || 1);
    const weakAreas = [];
    for (const b of benchmarkResults) {
        weakAreas.push(...findWeakAreas(b.aggregation, 0.6));
    }
    const suggestions = generateSuggestions(
        { avgLatency, hallucinationRate: avgHallucination },
        weakAreas
    );
    const report = {
        version: 'SF AI V14 Benchmark',
        timestamp: new Date().toISOString(),
        summary: {
            totalTestCases: totalCases,
            totalPassed,
            totalFailed: totalCases - totalPassed,
            overallAccuracy,
            avgLatency,
            hallucinationRate: avgHallucination,
            avgLanguageAccuracy: avgLangScore,
        },
        datasets: allAggregations,
        weakAreas,
        suggestions,
    };
    const filePath = path.join(REPORTS_DIR, 'benchmark-report.json');
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    return report;
}

/**
 * Generate benchmark-report.md
 */
function generateMarkdownReport(report) {
    const lines = [];
    lines.push(`# SF AI V14 Benchmark Report`);
    lines.push(`> Generated: ${report.timestamp}\n`);
    lines.push(`## Summary\n`);
    lines.push(`| Metric | Value |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total Test Cases | ${report.summary.totalTestCases} |`);
    lines.push(`| Passed | ${report.summary.totalPassed} |`);
    lines.push(`| Failed | ${report.summary.totalFailed} |`);
    lines.push(`| Overall Accuracy | ${(report.summary.overallAccuracy * 100).toFixed(2)}% |`);
    lines.push(`| Avg Latency | ${report.summary.avgLatency.toFixed(1)}ms |`);
    lines.push(`| Hallucination Rate | ${(report.summary.hallucinationRate * 100).toFixed(2)}% |`);
    lines.push(`| Language Accuracy | ${(report.summary.avgLanguageAccuracy * 100).toFixed(2)}% |`);
    lines.push('');
    lines.push(`## Dataset Results\n`);
    for (const ds of report.datasets) {
        lines.push(`### ${ds.dataset.toUpperCase()}`);
        lines.push(`- Total: ${ds.aggregation.total} | Passed: ${ds.aggregation.passed} | Failed: ${ds.aggregation.failed}`);
        lines.push(`- Accuracy: ${(ds.aggregation.accuracy * 100).toFixed(2)}%`);
        lines.push(`- Avg Latency: ${ds.aggregation.avgLatency.toFixed(1)}ms`);
        lines.push('');
        if (ds.aggregation.byCategory) {
            lines.push(`| Category | Accuracy | Avg Score |`);
            lines.push(`|----------|----------|-----------|`);
            for (const [cat, data] of Object.entries(ds.aggregation.byCategory)) {
                lines.push(`| ${cat} | ${(data.accuracy * 100).toFixed(1)}% | ${(data.avgScore * 100).toFixed(1)}% |`);
            }
            lines.push('');
        }
        if (ds.aggregation.byLanguage) {
            lines.push(`| Language | Accuracy | Avg Score |`);
            lines.push(`|----------|----------|-----------|`);
            for (const [lang, data] of Object.entries(ds.aggregation.byLanguage)) {
                lines.push(`| ${lang} | ${(data.accuracy * 100).toFixed(1)}% | ${(data.avgScore * 100).toFixed(1)}% |`);
            }
            lines.push('');
        }
    }
    if (report.weakAreas.length > 0) {
        lines.push(`## Weak Areas\n`);
        lines.push(`| Type | Name | Accuracy | Status |`);
        lines.push(`|------|------|----------|--------|`);
        for (const w of report.weakAreas) {
            lines.push(`| ${w.type} | ${w.name} | ${(w.accuracy * 100).toFixed(1)}% | ${w.accuracy < 0.4 ? 'CRITICAL' : 'NEEDS IMPROVEMENT'} |`);
        }
        lines.push('');
    }
    if (report.suggestions.length > 0) {
        lines.push(`## Improvement Suggestions\n`);
        for (const s of report.suggestions) {
            lines.push(`### [${s.priority.toUpperCase()}] ${s.area}`);
            lines.push(`- **Issue:** ${s.issue}`);
            lines.push(`- **Suggestion:** ${s.suggestion}`);
            lines.push('');
        }
    }
    lines.push(`## Approval Sources Used`);
    lines.push(`- BARI: https://bari.gov.bd`);
    lines.push(`- BRRI: https://brri.gov.bd`);
    lines.push(`- DAE: https://dae.gov.bd`);
    lines.push(`- BARC: https://barc.gov.bd`);
    lines.push(`- FAO Bangladesh: https://www.fao.org/bangladesh`);
    lines.push('');
    lines.push(`---`);
    lines.push(`*Report generated by SF AI V14 Evaluation System*`);
    const filePath = path.join(REPORTS_DIR, 'benchmark-report.md');
    fs.writeFileSync(filePath, lines.join('\n'));
    return lines.join('\n');
}

/**
 * Generate dashboard-summary.json
 */
function generateDashboardSummary(report) {
    const dashboard = {
        version: 'SF AI V14',
        generated: new Date().toISOString(),
        status: report.summary.overallAccuracy >= 0.7 ? 'PASS' : report.summary.overallAccuracy >= 0.5 ? 'NEEDS_WORK' : 'FAIL',
        overall_accuracy: report.summary.overallAccuracy,
        avg_response_time: report.summary.avgLatency,
        hallucination_rate: report.summary.hallucinationRate,
        language_accuracy: report.summary.avgLanguageAccuracy,
        total_tests: report.summary.totalTestCases,
        pass_rate: report.summary.overallAccuracy,
        weak_areas: report.weakAreas.slice(0, 5).map(w => ({
            name: w.name,
            accuracy: w.accuracy,
        })),
        recommendations: report.suggestions.slice(0, 5).map(s => ({
            area: s.area,
            priority: s.priority,
            suggestion: s.suggestion,
        })),
        knowledge_base: {
            total_documents: 0,
            categories: [],
        },
    };
    const filePath = path.join(REPORTS_DIR, 'dashboard-summary.json');
    fs.writeFileSync(filePath, JSON.stringify(dashboard, null, 2));
    return dashboard;
}

module.exports = {
    generateBenchmarkReport,
    generateMarkdownReport,
    generateDashboardSummary,
    findWeakAreas,
    generateSuggestions,
};
