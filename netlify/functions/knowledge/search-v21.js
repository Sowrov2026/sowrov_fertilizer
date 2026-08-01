const SYNONYMS = {
    'ধান': ['rice', 'paddy', 'pola', 'bighi', 'dhan'],
    'রোগ': ['disease', 'rog', 'jalo', 'amog'],
    'পোকা': ['pest', 'insect', 'poka', 'keet', 'shakto'],
    'সার': ['fertilizer', 'sar', 'khaddar', 'poshak'],
    'কীট': ['insect', 'poka', 'keet', 'bug'],
    'ছত্রাক': ['fungus', 'fungal', 'chotraak'],
    'ভাইরাস': ['virus', 'viral'],
    'ব্যাকটেরিয়া': ['bacteria', 'bacterial'],
    'মাটি': ['soil', 'mati', 'buni'],
    'পানি': ['water', 'pani', 'jal'],
    'সেচ': ['irrigation', 'shech', 'pani'],
    'ফসল': ['crop', 'foshal', 'shosho'],
    'বীজ': ['seed', 'bij', 'bish'],
    'সারা': ['fertilizer', 'sar'],
    'জৈব': ['organic', 'joibo', 'prakritik'],
    'রাসায়নিক': ['chemical', 'rasayonik'],
    'প্রতিরোধ': ['prevention', 'protirodh', 'sonrakshan'],
    'নিয়ন্ত্রণ': ['control', 'niontron', 'niyantron'],
    'লবণ': ['salt', 'lobon', 'noon'],
    'নাইট্রোজেন': ['nitrogen', 'N'],
    'ফসফরাস': ['phosphorus', 'P', 'phosphorus'],
    'পটাশিয়াম': ['potassium', 'K', 'potash'],
    'পুষ্টি': ['nutrition', 'pushitio', 'poshan'],
    'পুষ্টির': ['nutrient', 'pushitio', 'poshan'],
    'ইউরিয়া': ['urea'],
    'ডাব': ['dap'],
    'টিএসপি': ['tsp'],
    'গোবর': ['cow dung', 'gobor', 'gobar'],
    'কম্পোস্ট': ['compost', 'kompost'],
    'বর্জ্য': ['waste', 'borjjo', 'aboshesh'],
    'মল্লিকা': ['manure', 'malika'],
    'সেচ': ['irrigation', 'shech'],
    'বৃষ্টি': ['rain', 'brishti', 'bristi'],
    'খরা': ['drought', 'korka', 'khora'],
    'বন্যা': ['flood', 'bonny', 'bonna'],
    'তাপমাত্রা': ['temperature', 'tapmatra', 'ushno'],
    'আর্দ্রতা': ['humidity', 'ardrata', 'sekelo'],
    'মালিচ': ['mulch', 'malich', 'ghola'],
    'কাটা': ['cutting', 'kata', 'chop'],
    'চাষ': ['cultivation', 'chash', 'krishi'],
    'ফল': ['fruit', 'fol', 'phol'],
    'ফুল': ['flower', 'phul'],
    'পাতা': ['leaf', 'pata', 'pata'],
    'কাণ্ড': ['stem', 'kond', 'guthi'],
    'মূল': ['root', 'mul'],
    'বাগান': ['garden', 'bagan', 'bagicha'],
    'খামার': ['farm', 'khamar', 'buri'],
    'ক্ষেত': ['field', 'khet'],
    'জমি': ['land', 'jomi', 'bhusa'],
    'চাল': ['rice', 'chal', 'bhat'],
    'ধান': ['paddy', 'dhan'],
    'গম': ['wheat', 'gom'],
    'ভুট্টা': ['maize', 'bhutta'],
    'সয়াবিন': ['soybean', 'soya'],
    'সরিষা': ['mustard', 'shorisha'],
    'আলু': ['potato', 'alu'],
    'পেঁয়াজ': ['onion', 'peyaj'],
    'রসুন': ['garlic', 'roshun'],
    'লঙ্কা': ['chili', 'lanka'],
    'টমেটো': ['tomato', 'tomator'],
    'বেগুন': ['brinjal', 'begun'],
    'শাক': ['spinach', 'shak'],
    'কচু': ['taro', 'kochu'],
    'কলা': ['banana', 'kola'],
    'আম': ['mango', 'aam'],
    'লেবু': ['lemon', 'lebu'],
    'জাম': ['guava', 'jam'],
    'পেপে': ['papaya', 'pepe'],
    'নারিকেল': ['coconut', 'narkel'],
    'কমলা': ['orange', 'komla'],
    'আঙুর': ['grape', 'angur'],
    'তরমুজ': ['watermelon', 'tomuj'],
    'লাউ': ['gourd', 'lau'],
    'ঢেঁড়স': ['okra', 'dhendsh'],
    'শিম': ['bean', 'shim'],
    'করলা': ['bitter gourd', 'korla'],
    'পটল': ['pointed gourd', 'potol'],
    'চিচিঙ্গা': ['snake gourd', 'chichinga'],
    'জুঁই': ['marigold', 'jui'],
    'গাজর': ['carrot', 'gajar'],
    'মূলা': ['radish', 'mula'],
    'বাঁধাকপি': ['cabbage', 'bandhakopi'],
    'ফুলকপি': ['cauliflower', 'phulkopi'],
    'সেম': ['bean', 'sem'],
    'কুমড়া': ['pumpkin', 'kumra'],
    'বেড়ানা': ['olive', 'berana'],
    'তিল': ['sesame', 'til'],
    'সূর্যমুখী': ['sunflower', 'surjomukhi'],
    'অর্কিড': ['orchid', 'orchid'],
    'জারবেরা': ['gerbera', 'gerbera'],
    'গোলাপ': ['rose', 'golap'],
    'জুনিপার': ['juniper', 'juniper'],
    'নিম': ['neem', 'nim'],
    'প্রজাপতি': ['butterfly', 'projapoti'],
    'মৌমাছি': ['bee', 'moumachi'],
    'মাকড়সা': ['spider', 'makrasha'],
    'পিঁপড়া': ['ant', 'pipra'],
    'ঝিঁঝিঁ': ['mosquito', 'jhijh'],
    'গাছ': ['tree', 'gach'],
    'লতা': ['vine', 'lota'],
    'গুল্ম': ['shrub', 'gulma'],
    'তৃণ': ['grass', 'trin'],
    'ধীরে': ['slow', 'dhire'],
    'দ্রুত': ['fast', 'druto'],
    'বেশি': ['more', 'beshi'],
    'কম': ['less', 'kom'],
    'ভালো': ['good', 'balo'],
    'খারাপ': ['bad', 'kharap'],
    'সবুজ': ['green', 'shobuj'],
    'হলুদ': ['yellow', 'holud'],
    'লাল': ['red', 'lal'],
    'কালো': ['black', 'kalo'],
    'সাদা': ['white', 'sada'],
    'সপ্তাহ': ['week', 'saptah'],
    'মাস': ['month', 'mas'],
    'দিন': ['day', 'din'],
    'রাত': ['night', 'rat'],
    'সকাল': ['morning', 'shokal'],
    'বিকাল': ['afternoon', 'bikal'],
    'সন্ধ্যা': ['evening', 'shondhya'],
    'প্রথম': ['first', 'prothom'],
    'দ্বিতীয়': ['second', 'ditiyo'],
    'তৃতীয়': ['third', 'tritiyo'],
    'শেষ': ['last', 'shes'],
    'মধ্য': ['middle', 'moddho'],
};

const SEARCH_INDEX_KEY = 'sf_search_index';

function normalizeText(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s\u0980-\u09FF]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(text) {
    const normalized = normalizeText(text);
    return normalized.split(/\s+/).filter(t => t.length > 0);
}

function computeTF(tokens) {
    const tf = {};
    for (const token of tokens) {
        tf[token] = (tf[token] || 0) + 1;
    }
    const maxCount = Math.max(...Object.values(tf), 1);
    for (const key of Object.keys(tf)) {
        tf[key] = 0.5 + 0.5 * (tf[key] / maxCount);
    }
    return tf;
}

function computeIDF(documents) {
    const df = {};
    const totalDocs = documents.length;

    for (const doc of documents) {
        const uniqueTokens = new Set(doc);
        for (const token of uniqueTokens) {
            df[token] = (df[token] || 0) + 1;
        }
    }

    const idf = {};
    for (const [term, count] of Object.entries(df)) {
        idf[term] = Math.log((totalDocs + 1) / (count + 1)) + 1;
    }
    return idf;
}

function buildEntryText(entry) {
    const parts = [
        entry.name,
        entry.nameEn,
        entry.scientificName,
        entry.summary,
        entry.symptoms,
        entry.cause,
        entry.solution,
        entry.description,
        ...(Array.isArray(entry.organicMethods) ? entry.organicMethods : []),
        ...(Array.isArray(entry.chemicalSolutions) ? entry.chemicalSolutions : []),
        ...(Array.isArray(entry.tags) ? entry.tags : []),
    ];
    return parts.filter(Boolean).join(' ');
}

const KnowledgeSearchV21 = {
    SYNONYMS,
    index: null,

    init() {
        this.index = this.loadIndex();
        return this;
    },

    async search(query, options = {}) {
        const {
            type = 'hybrid',
            limit = 20,
            language = 'all',
            confidence = 0,
        } = options;

        const normalizedQuery = this.normalizeQuery(query);
        const expandedQuery = this.expandSynonyms(normalizedQuery);
        const lang = this.detectLanguage(query);

        let entries = this.index ? this.index.entries : [];

        if (language !== 'all') {
            entries = entries.filter(e => {
                if (language === 'bn') return /[\u0980-\u09FF]/.test(e.name || '');
                if (language === 'en') return /^[a-zA-Z\s]+$/.test(e.nameEn || e.name || '');
                return true;
            });
        }

        if (confidence > 0) {
            entries = entries.filter(e => (e.confidence || 0) >= confidence);
        }

        let results;

        switch (type) {
            case 'keyword':
                results = this.keywordSearch(expandedQuery, entries);
                break;
            case 'semantic':
                results = this.semanticSearch(expandedQuery, entries);
                break;
            case 'rag':
                return this.ragSearch(expandedQuery, entries, limit);
            case 'hybrid':
            default:
                const keywordResults = this.keywordSearch(expandedQuery, entries);
                const semanticResults = this.semanticSearch(expandedQuery, entries);
                results = this.mergeResults(keywordResults, semanticResults);
                break;
        }

        return results.slice(0, limit);
    },

    keywordSearch(query, entries) {
        const queryTokens = tokenize(query);
        if (queryTokens.length === 0) return [];

        const results = [];
        for (const entry of entries) {
            const entryText = normalizeText(buildEntryText(entry));
            let score = 0;

            for (const token of queryTokens) {
                if (entryText.includes(token)) {
                    score += 1;
                    const exactMatch = new RegExp(`\\b${token}\\b`, 'i').test(entryText);
                    if (exactMatch) score += 0.5;
                }

                const nameEn = (entry.nameEn || '').toLowerCase();
                const name = (entry.name || '');
                if (nameEn.includes(token) || name.includes(token)) {
                    score += 2;
                }

                const sciName = (entry.scientificName || '').toLowerCase();
                if (sciName.includes(token)) {
                    score += 1.5;
                }
            }

            if (score > 0) {
                results.push({
                    entry,
                    score,
                    matchType: 'keyword',
                    matchedTerms: queryTokens.filter(t => entryText.includes(t)),
                });
            }
        }

        return results.sort((a, b) => b.score - a.score);
    },

    semanticSearch(query, entries) {
        const queryTokens = tokenize(query);
        if (queryTokens.length === 0 || entries.length === 0) return [];

        const docTokenLists = entries.map(e => tokenize(buildEntryText(e)));
        const idf = computeIDF(docTokenLists);
        const queryTF = computeTF(queryTokens);

        const queryVector = {};
        for (const [token, tf] of Object.entries(queryTF)) {
            queryVector[token] = tf * (idf[token] || 1);
        }

        const results = [];

        for (let i = 0; i < entries.length; i++) {
            const docTokens = docTokenLists[i];
            if (docTokens.length === 0) continue;

            const docTF = computeTF(docTokens);

            let dotProduct = 0;
            let queryMag = 0;
            let docMag = 0;

            for (const [token, qVal] of Object.entries(queryVector)) {
                const dVal = (docTF[token] || 0) * (idf[token] || 1);
                dotProduct += qVal * dVal;
                queryMag += qVal * qVal;
            }

            for (const val of Object.values(docTF)) {
                docMag += val * val;
            }

            queryMag = Math.sqrt(queryMag);
            docMag = Math.sqrt(docMag);

            const similarity = (queryMag > 0 && docMag > 0)
                ? dotProduct / (queryMag * docMag)
                : 0;

            if (similarity > 0.01) {
                results.push({
                    entry: entries[i],
                    score: similarity * 100,
                    matchType: 'semantic',
                    similarity,
                });
            }
        }

        return results.sort((a, b) => b.score - a.score);
    },

    ragSearch(query, entries, limit = 5) {
        const keywordResults = this.keywordSearch(query, entries);
        const semanticResults = this.semanticSearch(query, entries);
        const merged = this.mergeResults(keywordResults, semanticResults);

        const topResults = merged.slice(0, limit);

        const context = topResults.map(r => ({
            entryId: r.entry.id,
            name: r.entry.name,
            nameEn: r.entry.nameEn,
            scientificName: r.entry.scientificName,
            summary: r.entry.summary,
            symptoms: r.entry.symptoms,
            cause: r.entry.cause,
            solution: r.entry.solution,
            score: r.score,
        }));

        return {
            context,
            totalMatches: merged.length,
            query,
            ragPrompt: this.buildRAGPrompt(query, context),
        };
    },

    buildRAGPrompt(query, context) {
        const contextStr = context.map((c, i) =>
            `[${i + 1}] ${c.name} (${c.nameEn || 'N/A'}) - ${c.scientificName || 'N/A'}\n` +
            `    Symptoms: ${c.symptoms || 'N/A'}\n` +
            `    Cause: ${c.cause || 'N/A'}\n` +
            `    Solution: ${c.solution || 'N/A'}`
        ).join('\n\n');

        return `You are a Bangladeshi agricultural expert. Answer the following question about crops, diseases, or pests based on the provided knowledge base context.\n\n` +
            `Context from knowledge base:\n${contextStr}\n\n` +
            `Question: ${query}\n\n` +
            `Please provide a comprehensive answer in the same language as the question. Include both organic and chemical solutions when available.`;
    },

    fuzzyMatch(query, text) {
        if (!query || !text) return { matched: false, score: 0 };

        const qTokens = tokenize(query);
        const tTokens = tokenize(text);

        if (qTokens.length === 0 || tTokens.length === 0) {
            return { matched: false, score: 0 };
        }

        let totalScore = 0;
        const matchedTokens = [];

        for (const qToken of qTokens) {
            let bestMatch = { token: null, score: 0 };

            for (const tToken of tTokens) {
                if (qToken === tToken) {
                    bestMatch = { token: tToken, score: 1 };
                    break;
                }

                if (tToken.includes(qToken) || qToken.includes(tToken)) {
                    const len = Math.min(qToken.length, tToken.length);
                    const maxLen = Math.max(qToken.length, tToken.length);
                    const score = len / maxLen * 0.9;
                    if (score > bestMatch.score) {
                        bestMatch = { token: tToken, score };
                    }
                    continue;
                }

                const dist = levenshteinDistance(qToken, tToken);
                const maxLen = Math.max(qToken.length, tToken.length);
                const score = 1 - dist / maxLen;
                if (score > bestMatch.score && score > 0.6) {
                    bestMatch = { token: tToken, score };
                }
            }

            totalScore += bestMatch.score;
            if (bestMatch.score > 0.5) {
                matchedTokens.push(bestMatch.token);
            }
        }

        const avgScore = qTokens.length > 0 ? totalScore / qTokens.length : 0;

        return {
            matched: avgScore > 0.5,
            score: avgScore,
            matchedTokens,
        };
    },

    expandSynonyms(query) {
        const tokens = tokenize(query);
        const expanded = new Set(tokens);

        for (const token of tokens) {
            for (const [key, syns] of Object.entries(SYNONYMS)) {
                const keyNorm = normalizeText(key);
                const synNorms = syns.map(normalizeText);

                if (keyNorm === token || synNorms.includes(token)) {
                    expanded.add(keyNorm);
                    synNorms.forEach(s => expanded.add(s));
                }
            }
        }

        return [...expanded].join(' ');
    },

    detectLanguage(text) {
        if (!text) return 'unknown';

        const banglaRange = /[\u0980-\u09FF]/;
        const englishRange = /^[a-zA-Z\s]+$/;

        const hasBangla = banglaRange.test(text);
        const hasEnglish = englishRange.test(text.replace(/\s/g, ''));

        if (hasBangla && hasEnglish) return 'banglish';
        if (hasBangla) return 'bangla';
        if (hasEnglish) return 'english';
        return 'unknown';
    },

    normalizeQuery(text) {
        if (!text) return '';

        const banglishMap = {
            'dhaan': 'ধান',
            'dhan': 'ধান',
            'polao': 'পোলাও',
            'shosho': 'ফসল',
            'foshal': 'ফসল',
            'rog': 'রোগ',
            'poka': 'পোকা',
            'keet': 'কীট',
            'sar': 'সার',
            'khaddar': 'সার',
            'mati': 'মাটি',
            'pani': 'পানি',
            'bagan': 'বাগান',
            'khamar': 'খামার',
            'khet': 'ক্ষেত',
            'gobor': 'গোবর',
            'kompost': 'কম্পোস্ট',
            'shech': 'সেচ',
        };

        let normalized = text;

        for (const [en, bn] of Object.entries(banglishMap)) {
            const regex = new RegExp(`\\b${en}\\b`, 'gi');
            normalized = normalized.replace(regex, bn);
        }

        normalized = normalizeText(normalized);

        return normalized;
    },

    getSuggestions(partial) {
        if (!partial || partial.length < 2) return [];

        const normalizedPartial = normalizeText(partial);
        const suggestions = [];
        const seen = new Set();

        const entries = this.index ? this.index.entries : [];

        for (const entry of entries) {
            const names = [entry.name, entry.nameEn, entry.scientificName].filter(Boolean);

            for (const name of names) {
                const normalizedName = normalizeText(name);
                if (normalizedName.includes(normalizedPartial) && !seen.has(normalizedName)) {
                    seen.add(normalizedName);
                    suggestions.push({
                        text: name,
                        entryId: entry.id,
                        entryName: entry.name,
                        type: 'entry',
                    });
                }
            }
        }

        for (const [key, syns] of Object.entries(SYNONYMS)) {
            const allTerms = [key, ...syns];
            for (const term of allTerms) {
                const normalizedTerm = normalizeText(term);
                if (normalizedTerm.includes(normalizedPartial) && !seen.has(normalizedTerm)) {
                    seen.add(normalizedTerm);
                    suggestions.push({
                        text: term,
                        type: 'synonym',
                        relatedTo: key,
                    });
                }
            }
        }

        return suggestions.slice(0, 10);
    },

    getSearchStats() {
        if (!this.index) {
            return { indexed: false, totalEntries: 0 };
        }

        const entries = this.index.entries;
        const stats = {
            indexed: true,
            totalEntries: entries.length,
            lastBuilt: this.index.builtAt,
            banglaEntries: entries.filter(e => /[\u0980-\u09FF]/.test(e.name || '')).length,
            englishEntries: entries.filter(e => e.nameEn).length,
            avgConfidence: entries.length > 0
                ? Math.round(entries.reduce((sum, e) => sum + (e.confidence || 0), 0) / entries.length)
                : 0,
            withSymptoms: entries.filter(e => e.symptoms).length,
            withSolution: entries.filter(e => e.solution).length,
        };

        return stats;
    },

    rebuildIndex() {
        const storedData = this.loadRawEntries();
        this.index = {
            entries: storedData,
            builtAt: new Date().toISOString(),
            version: '2.1',
        };
        this.saveIndex();
        return this.index;
    },

    mergeResults(keywordResults, semanticResults) {
        const scores = new Map();

        for (const r of keywordResults) {
            scores.set(r.entry.id, {
                entry: r.entry,
                keywordScore: r.score,
                semanticScore: 0,
                matchTypes: new Set(['keyword']),
            });
        }

        for (const r of semanticResults) {
            if (scores.has(r.entry.id)) {
                const existing = scores.get(r.entry.id);
                existing.semanticScore = r.score;
                existing.matchTypes.add('semantic');
            } else {
                scores.set(r.entry.id, {
                    entry: r.entry,
                    keywordScore: 0,
                    semanticScore: r.score,
                    matchTypes: new Set(['semantic']),
                });
            }
        }

        const merged = [];
        for (const [, data] of scores) {
            const combinedScore = (data.keywordScore * 0.4) + (data.semanticScore * 0.6);
            merged.push({
                entry: data.entry,
                score: combinedScore,
                matchType: data.matchTypes.has('keyword') && data.matchTypes.has('semantic')
                    ? 'hybrid'
                    : [...data.matchTypes][0],
                keywordScore: data.keywordScore,
                semanticScore: data.semanticScore,
            });
        }

        return merged.sort((a, b) => b.score - a.score);
    },

    loadIndex() {
        try {
            if (typeof globalThis !== 'undefined' && globalThis[SEARCH_INDEX_KEY]) {
                return globalThis[SEARCH_INDEX_KEY];
            }
        } catch (e) {
            // ignore
        }
        return null;
    },

    saveIndex() {
        try {
            if (typeof globalThis !== 'undefined') {
                globalThis[SEARCH_INDEX_KEY] = this.index;
            }
        } catch (e) {
            // ignore
        }
    },

    loadRawEntries() {
        try {
            if (typeof globalThis !== 'undefined' && globalThis.sf_knowledge_data) {
                return Array.isArray(globalThis.sf_knowledge_data)
                    ? globalThis.sf_knowledge_data
                    : [];
            }
        } catch (e) {
            // ignore
        }
        return [];
    },
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

module.exports = { KnowledgeSearchV21 };
