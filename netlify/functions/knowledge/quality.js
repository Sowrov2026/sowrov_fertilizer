const RULES = {
    requiredFields: ['id', 'name', 'nameEn', 'scientificName', 'reference'],
    recommendedFields: ['symptoms', 'cause', 'solution', 'organicMethods', 'chemicalSolutions'],
    minConfidence: 70,
    maxDuplicateSimilarity: 0.9,
    minTitleLength: 2,
    maxTitleLength: 200,
    minSummaryLength: 10,
    maxSummaryLength: 500,
};

function levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }
    return dp[m][n];
}

function textSimilarity(a, b) {
    if (!a || !b) return 0;
    const strA = a.toLowerCase().trim();
    const strB = b.toLowerCase().trim();

    if (strA === strB) return 1;
    if (strA.length === 0 || strB.length === 0) return 0;

    const maxLen = Math.max(strA.length, strB.length);
    const distance = levenshteinDistance(strA, strB);
    return 1 - distance / maxLen;
}

function fieldWeight(field) {
    const weights = {
        name: 10,
        nameEn: 10,
        scientificName: 8,
        symptoms: 7,
        cause: 7,
        solution: 8,
        reference: 5,
        organicMethods: 6,
        chemicalSolutions: 6,
        summary: 4,
        description: 4,
        id: 0,
    };
    return weights[field] || 2;
}

function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
}

const KnowledgeQuality = {
    RULES,

    init() {
        return this;
    },

    validateEntry(entry) {
        const issues = [];
        let score = 100;

        const missingRequired = RULES.requiredFields.filter(f => isEmpty(entry[f]));
        if (missingRequired.length > 0) {
            missingRequired.forEach(field => {
                issues.push({
                    type: 'missing_required',
                    severity: 'error',
                    field,
                    message: `Required field "${field}" is missing or empty`,
                });
            });
            score -= missingRequired.length * 15;
        }

        const missingRecommended = RULES.recommendedFields.filter(f => isEmpty(entry[f]));
        if (missingRecommended.length > 0) {
            missingRecommended.forEach(field => {
                issues.push({
                    type: 'missing_recommended',
                    severity: 'warning',
                    field,
                    message: `Recommended field "${field}" is missing or empty`,
                });
            });
            score -= missingRecommended.length * 5;
        }

        if (entry.name && entry.name.length < RULES.minTitleLength) {
            issues.push({
                type: 'title_too_short',
                severity: 'warning',
                field: 'name',
                message: `Title is too short (${entry.name.length} chars, min: ${RULES.minTitleLength})`,
            });
            score -= 5;
        }

        if (entry.name && entry.name.length > RULES.maxTitleLength) {
            issues.push({
                type: 'title_too_long',
                severity: 'warning',
                field: 'name',
                message: `Title is too long (${entry.name.length} chars, max: ${RULES.maxTitleLength})`,
            });
            score -= 5;
        }

        if (entry.summary && entry.summary.length < RULES.minSummaryLength) {
            issues.push({
                type: 'summary_too_short',
                severity: 'warning',
                field: 'summary',
                message: `Summary is too short (${entry.summary.length} chars, min: ${RULES.minSummaryLength})`,
            });
            score -= 3;
        }

        if (entry.reference) {
            const refs = Array.isArray(entry.reference) ? entry.reference : [entry.reference];
            refs.forEach(ref => {
                if (typeof ref === 'string' && ref.startsWith('http')) {
                    try {
                        new URL(ref);
                    } catch {
                        issues.push({
                            type: 'invalid_url',
                            severity: 'warning',
                            field: 'reference',
                            message: `Invalid URL: ${ref}`,
                        });
                        score -= 2;
                    }
                }
            });
        }

        if (entry.confidence !== undefined && entry.confidence < RULES.minConfidence) {
            issues.push({
                type: 'low_confidence',
                severity: 'warning',
                field: 'confidence',
                message: `Confidence ${entry.confidence}% is below threshold ${RULES.minConfidence}%`,
            });
            score -= 10;
        }

        score = Math.max(0, Math.min(100, score));
        const passed = missingRequired.length === 0 && score >= 50;

        return { score, issues, passed };
    },

    checkCompleteness(entry) {
        const allFields = [...RULES.requiredFields, ...RULES.recommendedFields];
        const present = allFields.filter(f => !isEmpty(entry[f]));
        const missing = allFields.filter(f => isEmpty(entry[f]));
        const percentage = allFields.length > 0 ? (present.length / allFields.length) * 100 : 0;

        return {
            score: Math.round(percentage),
            present,
            missing,
            total: allFields.length,
        };
    },

    checkAccuracy(entry) {
        const warnings = [];

        if (entry.scientificName) {
            const sciName = entry.scientificName.trim();
            const parts = sciName.split(/\s+/);
            if (parts.length < 2) {
                warnings.push({
                    type: 'scientific_name_format',
                    message: 'Scientific name should have at least two words (genus + species)',
                });
            }
            const genus = parts[0];
            if (genus && genus[0] !== genus[0].toUpperCase()) {
                warnings.push({
                    type: 'scientific_name_capitalization',
                    message: 'Genus name should be capitalized',
                });
            }
        }

        if (entry.name && entry.nameEn) {
            const similarity = textSimilarity(entry.name, entry.nameEn);
            if (similarity > 0.8 && entry.name !== entry.nameEn) {
                warnings.push({
                    type: 'name_overlap',
                    message: 'Bangla and English names are very similar - verify correctness',
                });
            }
        }

        if (entry.symptoms && entry.symptoms.length < 20) {
            warnings.push({
                type: 'symptoms_too_brief',
                message: 'Symptoms description is very brief - consider expanding',
            });
        }

        if (entry.solution && entry.solution.length < 20) {
            warnings.push({
                type: 'solution_too_brief',
                message: 'Solution description is very brief - consider expanding',
            });
        }

        return {
            accurate: warnings.length === 0,
            warnings,
            confidence: Math.max(0, 100 - warnings.length * 10),
        };
    },

    findDuplicates(entries) {
        const groups = [];
        const processed = new Set();

        for (let i = 0; i < entries.length; i++) {
            if (processed.has(entries[i].id)) continue;

            const group = [entries[i]];
            processed.add(entries[i].id);

            for (let j = i + 1; j < entries.length; j++) {
                if (processed.has(entries[j].id)) continue;

                const nameSim = textSimilarity(entries[i].name, entries[j].name);
                const sciSim = entries[i].scientificName && entries[j].scientificName
                    ? textSimilarity(entries[i].scientificName, entries[j].scientificName)
                    : 0;
                const enSim = entries[i].nameEn && entries[j].nameEn
                    ? textSimilarity(entries[i].nameEn, entries[j].nameEn)
                    : 0;

                const maxSim = Math.max(nameSim, sciSim, enSim);
                if (maxSim >= RULES.maxDuplicateSimilarity) {
                    group.push(entries[j]);
                    processed.add(entries[j].id);
                }
            }

            if (group.length > 1) {
                groups.push({
                    entries: group.map(e => ({ id: e.id, name: e.name })),
                    similarity: 'high',
                    count: group.length,
                });
            }
        }

        return groups;
    },

    findBrokenReferences(entries) {
        const broken = [];

        for (const entry of entries) {
            if (!entry.reference) continue;

            const refs = Array.isArray(entry.reference) ? entry.reference : [entry.reference];

            for (const ref of refs) {
                if (typeof ref === 'string' && ref.startsWith('http')) {
                    try {
                        new URL(ref);
                    } catch {
                        broken.push({
                            entryId: entry.id,
                            entryName: entry.name,
                            reference: ref,
                            issue: 'Invalid URL format',
                        });
                    }
                }
            }

            if (entry.sourceIds && Array.isArray(entry.sourceIds)) {
                for (const sourceId of entry.sourceIds) {
                    const exists = entries.some(e => e.id === sourceId);
                    if (!exists) {
                        broken.push({
                            entryId: entry.id,
                            entryName: entry.name,
                            reference: sourceId,
                            issue: 'Referenced entry not found',
                        });
                    }
                }
            }
        }

        return broken;
    },

    findMissingTopics(entries, cropList = []) {
        const existingTopics = new Set(entries.map(e => (e.nameEn || '').toLowerCase().trim()));
        const existingNames = new Set(entries.map(e => (e.name || '').toLowerCase().trim()));
        const missing = [];

        for (const crop of cropList) {
            const cropLower = crop.toLowerCase().trim();
            if (!existingTopics.has(cropLower) && !existingNames.has(cropLower)) {
                missing.push({
                    topic: crop,
                    type: 'missing_entry',
                    message: `No knowledge entry found for "${crop}"`,
                });
            }
        }

        const categoryCoverage = {};
        const categories = ['disease', 'pest', 'nutrient', 'management'];

        for (const cat of categories) {
            const count = entries.filter(e => {
                const tags = e.tags || e.categories || [];
                if (Array.isArray(tags)) {
                    return tags.some(t => t.toLowerCase().includes(cat));
                }
                return false;
            }).length;

            categoryCoverage[cat] = {
                count,
                percentage: entries.length > 0 ? Math.round((count / entries.length) * 100) : 0,
            };
        }

        const underrepresented = Object.entries(categoryCoverage)
            .filter(([, data]) => data.count < 3)
            .map(([cat]) => ({
                topic: cat,
                type: 'underrepresented',
                message: `Category "${cat}" has very few entries`,
            }));

        return [...missing, ...underrepresented];
    },

    calculateQualityScore(entry) {
        let score = 0;
        let maxScore = 0;

        for (const field of RULES.requiredFields) {
            maxScore += fieldWeight(field);
            if (!isEmpty(entry[field])) {
                score += fieldWeight(field);
            }
        }

        for (const field of RULES.recommendedFields) {
            maxScore += fieldWeight(field);
            if (!isEmpty(entry[field])) {
                score += fieldWeight(field);
            }
        }

        if (entry.symptoms && entry.symptoms.length > 50) {
            score += 5;
        }
        if (entry.solution && entry.solution.length > 50) {
            score += 5;
        }
        if (entry.organicMethods && (Array.isArray(entry.organicMethods) ? entry.organicMethods.length : entry.organicMethods.length > 20)) {
            score += 3;
        }
        if (entry.chemicalSolutions && (Array.isArray(entry.chemicalSolutions) ? entry.chemicalSolutions.length : entry.chemicalSolutions.length > 20)) {
            score += 3;
        }
        maxScore += 16;

        if (entry.confidence !== undefined) {
            const confBonus = Math.round((entry.confidence / 100) * 5);
            score += confBonus;
            maxScore += 5;
        }

        return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    },

    generateQualityReport(entries) {
        const totalEntries = entries.length;
        const validationResults = entries.map(e => this.validateEntry(e));
        const passed = validationResults.filter(r => r.passed).length;
        const failed = totalEntries - passed;

        const avgScore = totalEntries > 0
            ? Math.round(validationResults.reduce((sum, r) => sum + r.score, 0) / totalEntries)
            : 0;

        const scoreDistribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
        validationResults.forEach(r => {
            if (r.score >= 90) scoreDistribution.excellent++;
            else if (r.score >= 70) scoreDistribution.good++;
            else if (r.score >= 50) scoreDistribution.fair++;
            else scoreDistribution.poor++;
        });

        const issueTypes = {};
        validationResults.forEach(r => {
            r.issues.forEach(issue => {
                if (!issueTypes[issue.type]) {
                    issueTypes[issue.type] = { count: 0, severity: issue.severity };
                }
                issueTypes[issue.type].count++;
            });
        });

        const topIssues = Object.entries(issueTypes)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 10)
            .map(([type, data]) => ({ type, ...data }));

        const duplicates = this.findDuplicates(entries);
        const brokenRefs = this.findBrokenReferences(entries);

        const completenessScores = entries.map(e => this.checkCompleteness(e));
        const avgCompleteness = completenessScores.length > 0
            ? Math.round(completenessScores.reduce((sum, c) => sum + c.score, 0) / completenessScores.length)
            : 0;

        return {
            summary: {
                totalEntries,
                passed,
                failed,
                avgScore,
                avgCompleteness,
                duplicateGroups: duplicates.length,
                brokenReferences: brokenRefs.length,
            },
            scoreDistribution,
            topIssues,
            duplicates,
            brokenReferences: brokenRefs.slice(0, 20),
            generatedAt: new Date().toISOString(),
        };
    },

    autoFix(entry, issues) {
        const fixed = { ...entry };
        const fixes = [];

        for (const issue of issues) {
            if (issue.type === 'title_too_short' && fixed.name) {
                fixes.push({ field: 'name', action: 'trimmed', before: fixed.name });
            }

            if (issue.type === 'missing_required' || issue.type === 'missing_recommended') {
                const field = issue.field;
                if (isEmpty(fixed[field])) {
                    const defaults = {
                        summary: '',
                        symptoms: '',
                        cause: '',
                        solution: '',
                        organicMethods: [],
                        chemicalSolutions: [],
                        reference: [],
                        tags: [],
                    };
                    if (field in defaults) {
                        fixed[field] = defaults[field];
                        fixes.push({ field, action: 'defaulted', value: defaults[field] });
                    }
                }
            }
        }

        if (fixed.name && fixed.name.length > RULES.maxTitleLength) {
            fixed.name = fixed.name.substring(0, RULES.maxTitleLength).trim();
            fixes.push({ field: 'name', action: 'truncated', maxLength: RULES.maxTitleLength });
        }

        return { entry: fixed, fixes };
    },
};

module.exports = { KnowledgeQuality };
