/**
 * SF AI V16 — Semantic Search Module
 * Client-side ES module for intelligent fertilizer knowledge search
 * Supports: Bangla, English, Banglish, Chatgaiya
 */

const SYNONYMS = {
    'ফসল': ['বালি', 'শস্য', 'ধান', 'ভুট্টা', 'আখ', 'পাট'],
    'সার': ['খাদ্য', 'পুষ্টি', 'NPK', 'ইউরিয়া', 'ডিএপি', 'ফসফরাস', 'পটাশ'],
    'রোগ': ['অসুখ', 'দুরারোগ্য', 'ব্যাধি', 'disease', 'fungal', 'viral'],
    'পোকা': ['কীট', 'পতঙ্গ', 'insect', 'pest', 'bug'],
    'মাটি': ['ভূমি', 'জমি', 'মাটির', 'soil', 'earth'],
    'জল': ['পানি', 'সেচ', 'irrigation', 'water'],
    'কাটা': ['তোলা', 'ফসল তোলা', 'harvest'],
    'রোপণ': ['বীজ রোপণ', 'চাষ', 'planting', 'sowing'],
    'তরমুজ': ['watermelon', 'টরমুজ'],
    'পেঁয়াজ': ['onion', 'পেয়াজ'],
    'রসুন': ['garlic', 'রশুন'],
    'ধান': ['rice', 'paddy', 'চাল'],
    'ভুট্টা': ['corn', 'maize', 'bhutta'],
    'আখ': ['sugarcane', 'গুড়'],
    'পাট': ['jute', 'পাটাল'],
    'সবজি': ['vegetable', 'তরকারি'],
    'ফল': ['fruit', 'বেরি'],
    'মৌসুম': ['season', 'সময়'],
    'বীজ': ['seed', 'শস্য'],
    'চাষ': ['farming', 'কৃষি', 'agriculture'],
    'জমি': ['farm', 'field', 'খেত'],
    'কৃষি': ['agriculture', 'farming'],
    'দুর্বল': ['weak', 'তুলতুলে'],
    'ক্ষয়': ['loss', 'damage'],
    'নষ্ট': ['destroy', 'মারা'],
    'বাড়ানো': ['increase', 'বৃদ্ধি'],
    'কমানো': ['decrease', 'হ্রাস'],
    'রাখা': ['store', 'সংরক্ষণ'],
    'বিক্রি': ['sell', 'বাজার', 'market'],
    'কেনা': ['buy', 'shopping'],
    'মূল্য': ['price', 'দাম'],
    'রোগের': ['disease', 'অসুস্থতা'],
    'পোকার': ['pest', 'insect'],
    'সুস্থ': ['healthy', 'স্বাস্থ্য'],
    'দুর্বলতা': ['weakness', 'অসুস্থতা'],
    'সেচ': ['irrigation', 'পানি'],
    'সারবস্তু': ['fertilizer', 'খাদ্য'],
    'বীজবপন': ['sowing', 'রোপণ'],
    'ফসল তোলা': ['harvesting', 'কাটা'],
    'কাদা': ['mud', 'sludge'],
    'তুলা': ['cotton', 'পাট'],
    'চা': ['tea'],
    'আদা': ['ginger'],
    'হলুদ': ['turmeric'],
    'মরিচ': ['chili'],
    'লঙ্কা': ['chili'],
    'বাঁধাকপি': ['cabbage'],
    'ফুলকপি': ['cauliflower'],
    'আলু': ['potato'],
    'গাজর': ['carrot'],
    'বেগুন': ['eggplant'],
    'ঝিঙা': ['gourd'],
    'লাউ': ['gourd'],
    'শাক': ['greens', 'পাতা'],
    'পুদিনা': ['mint'],
    'ধনিয়া': ['coriander'],
    'জিরা': ['cumin'],
    'মেথি': ['fenugreek'],
    'রেডিশ': ['radish', 'মূলা'],
    'নুন': ['salt', 'লবণ'],
    'চিনি': ['sugar'],
    'তেল': ['oil'],
    'পানি': ['water', 'জল'],
    'মাছ': ['fish'],
    'মাংস': ['meat'],
    'ডিম': ['egg'],
    'দুধ': ['milk'],
    'রুটি': ['bread'],
    'ভাত': ['rice'],
    'রোগী': ['patient'],
    'সুস্থি': ['health'],
    'প্রতিকার': ['cure', 'চিকিৎসা'],
    'ঔষধ': ['medicine', 'ওষুধ'],
    'রোগ প্রতিরোধ': ['prevention', 'প্রতিরোধ'],
    'পোকা মার': ['insecticide', 'pesticide'],
    'মশা': ['mosquito'],
    'মাছি': ['fly'],
    'পিঁপড়া': ['ant'],
    'গাছ': ['tree'],
    'লতা': ['vine'],
    'ফুল': ['flower'],
    'ফলমূল': ['fruit'],
    'মূল': ['root'],
    'কাণ্ড': ['stem'],
    'পাতা': ['leaf'],
    'বাকল': ['bark'],
    'শেকড়': ['root'],
    'অঙ্কুর': ['sprout'],
    'চারা': ['seedling'],
    'রোপা': ['planting', 'রোপণ'],
    'লম্বা': ['tall'],
    'খাটো': ['short'],
    'মোটা': ['thick'],
    'পাতলা': ['thin'],
    'গাঢ়': ['dense', 'ঘন'],
    'হালকা': ['light'],
    'ভারী': ['heavy'],
    'বড়': ['big'],
    'ছোট': ['small'],
    'নতুন': ['new'],
    'পুরানো': ['old'],
    'তাজা': ['fresh'],
    'সতেজ': ['fresh'],
    'শুষ্ক': ['dry'],
    'শক্ত': ['hard'],
    'নরম': ['soft'],
    'ঠান্ডা': ['cold'],
    'গরম': ['hot'],
    'বাতাস': ['wind'],
    'বৃষ্টি': ['rain'],
    'তুষার': ['frost'],
    'খরা': ['drought'],
    'বন্যা': ['flood'],
    'ঝড়': ['storm'],
    'কুয়াশা': ['fog'],
    'কৃষক': ['farmer'],
    'চাষী': ['farmer'],
    'বন': ['forest'],
    'গ্রাম': ['village'],
    'শহর': ['city'],
    'দেশ': ['country'],
    'বাংলাদেশ': ['Bangladesh'],
    'আবহাওয়া': ['weather', 'আবহাওয়া'],
    'পরিবেশ': ['environment'],
    'প্রকৃতি': ['nature'],
    'সময়': ['time'],
    'গ্রীষ্ম': ['summer'],
    'শীত': ['winter'],
    'বর্ষা': ['monsoon'],
    'বসন্ত': ['spring'],
    'কার্বনিক': ['organic', 'প্রাকৃতিক'],
    'রাসায়নিক': ['chemical'],
    'জৈব': ['organic'],
    'প্রাকৃতিক': ['natural']
};

const CHATGAIYA_MAP = {
    'নাই': 'নেই',
    'নাইক': 'নেই',
    'নাইকে': 'নেই',
    'কিসের': 'কীসের',
    'হই': 'হয়',
    'কই': 'কোথায়',
    'কি': 'কী',
    'কোনো': 'কোনো',
    'ভাই': 'ভাই',
    'বন্ধু': 'বন্ধু',
    'দাদা': 'দাদা',
    'দিদা': 'দিদা',
    'মামা': 'মামা',
    'খালা': 'খালা',
    'তোমার': 'তোমার',
    'আমার': 'আমার',
    'তার': 'তার',
    'তাদের': 'তাদের',
    'আমাদের': 'আমাদের',
    'এই': 'এই',
    'সেই': 'সেই',
    'এটা': 'এটা',
    'সেটা': 'সেটা',
    'ভালো': 'ভালো',
    'মন্দ': 'মন্দ',
    'এখন': 'এখন',
    'তখন': 'তখন',
    'সুবাবে': 'জন্য',
    'পাশে': 'পাশে',
    'সামনে': 'সামনে',
    'পেছনে': 'পেছনে',
    'ভেতরে': 'ভেতরে',
    'বাইরে': 'বাইরে',
    'ওপারে': 'ওপারে',
    'এপারে': 'এপারে',
    'কাছে': 'কাছে',
    'দূরে': 'দূরে',
    'মাঝখানে': 'মাঝখানে',
    'যেখানে': 'যেখানে',
    'সেখানে': 'সেখানে',
    'যেদিকে': 'যেদিকে',
    'সেদিকে': 'সেদিকে',
    'যেভাবে': 'যেভাবে',
    'সেভাবে': 'সেভাবে',
    'কতক্ষণ': 'কতক্ষণ',
    'কতদিন': 'কতদিন',
    'কতবার': 'কতবার',
    'যতক্ষণ': 'যতক্ষণ',
    'ততক্ষণ': 'ততক্ষণ',
    'যতবার': 'যতবার',
    'ততবার': 'ততবার',
    'যতদিন': 'যতদিন',
    'ততদিন': 'ততদিন',
    'কেউ': 'কেউ',
    'কিছু': 'কিছু',
    'সব': 'সব',
    'সকল': 'সকল',
    'প্রত্যেক': 'প্রত্যেক'
};

const BANGLISH_MAP = {
    'ami': 'আমি',
    'tumi': 'তুমি',
    'se': 'সে',
    'amake': 'আমাকে',
    'tomake': 'তোমাকে',
    'take': 'তাকে',
    'amar': 'আমার',
    'tomar': 'তোমার',
    'tar': 'তার',
    'kemon': 'কেমন',
    'kivabe': 'কীভাবে',
    'kothay': 'কোথায়',
    'khub': 'খুব',
    'bhalo': 'ভালো',
    'kharap': 'খারাপ',
    'bashi': 'বেশি',
    'kom': 'কম',
    'notun': 'নতুন',
    'purano': 'পুরানো',
    'boro': 'বড়',
    'choto': 'ছোট',
    'lomba': 'লম্বা',
    'fertilizer': 'সার',
    'shar': 'সার',
    'paani': 'পানি',
    'pani': 'পানি',
    'maati': 'মাটি',
    'mati': 'মাটি',
    'fashal': 'ফসল',
    'shossho': 'শস্য',
    'dhan': 'ধান',
    'bhutta': 'ভুট্টা',
    'peyaj': 'পেঁয়াজ',
    'roshun': 'রসুন',
    'ada': 'আদা',
    'holud': 'হলুদ',
    'morich': 'মরিচ',
    'shak': 'শাক',
    'shobji': 'সবজি',
    'phol': 'ফল',
    'gach': 'গাছ',
    'bich': 'বীজ',
    'rog': 'রোগ',
    'poka': 'পোকা',
    'jomi': 'জমি',
    'chashi': 'চাষী',
    'krishi': 'কৃষি',
    'sech': 'সেচ',
    'jol': 'জল',
    'baari': 'বাড়ি',
    'bari': 'বাড়ি',
    'sor': 'সার',
    'shor': 'সার',
    'khabar': 'খাবার',
    'poshuti': 'পুষ্টি',
    'sustho': 'সুস্থ',
    'valo': 'ভালো',
    'baje': 'খারাপ',
    'thik': 'ঠিক',
    'bhitore': 'ভেতরে',
    'baire': 'বাইরে',
    'upore': 'উপরে',
    'niche': 'নিচে',
    'samne': 'সামনে',
    'pechone': 'পেছনে',
    'pashay': 'পাশে',
    'sathe': 'সাথে',
    'theke': 'থেকে',
    'jonno': 'জন্য',
    'shuru': 'শুরু',
    'shesh': 'শেষ',
    'age': 'আগে',
    'pore': 'পরে',
    'ekhane': 'এখানে',
    'sekhan': 'সেখানে',
    'jekhane': 'যেখানে',
    'kotha': 'কথা',
    'somoy': 'সময়',
    'din': 'দিন',
    'raat': 'রাত',
    'sokal': 'সকাল',
    'dupur': 'দুপুর',
    'bikal': 'বিকেল',
    'sandhya': 'সন্ধ্যা',
    'kore': 'করে',
    'diye': 'দিয়ে',
    'niye': 'নিয়ে',
    'giye': 'গিয়ে',
    'khuje': 'খুঁজে',
    'pawa': 'পাওয়া',
    'jaoya': 'যাওয়া',
    'kora': 'করা',
    'hoya': 'হওয়া',
    'dekha': 'দেখা',
    'shona': 'শোনা',
    'bujha': 'বোঝা',
    'tola': 'তোলা',
    'fela': 'ফেলা',
    'rakha': 'রাখা',
    'dewa': 'দেওয়া',
    'kheye': 'খেয়ে',
    'bosh': 'বস',
    'ja': 'যা',
    'ao': 'আও',
    'dekho': 'দেখো',
    'shuno': 'শোনো',
    'bolo': 'বলো',
    'koro': 'করো',
    'khujo': 'খুঁজো',
    'pao': 'পাও',
    'dao': 'দাও',
    'kheo': 'খাও'
};

const INTENT_KEYWORDS = {
    crop: [
        'ফসল', 'ধান', 'ভুট্টা', 'আখ', 'পাট', 'পেঁয়াজ', 'রসুন',
        'সবজি', 'তরকারি', 'ফল', 'চাষ', 'রোপণ', 'বীজ', 'জমি',
        'কৃষি', 'কৃষক', 'চাষী', 'crop', 'farming', 'plant',
        'ধান', 'গম', 'ভাত', 'চাল', 'আদা', 'হলুদ', 'মরিচ',
        'তরমুজ', 'কলা', 'পানির ফল', 'লাউ', 'ঝিঙা', 'কচু',
        'তরকারি', 'শাক', 'পালং', 'বেগুন', 'লেবু', 'পেয়ারা'
    ],
    disease: [
        'রোগ', 'অসুখ', 'পোকা', 'কীট', 'পতঙ্গ', 'নষ্ট', 'ক্ষয়',
        'দুরারোগ্য', 'ব্যাধি', 'disease', 'pest', 'insect', 'bug',
        'ফাঙ্গাস', 'ভাইরাস', 'ব্যাকটেরিয়া', 'রোগী', 'ঔষধ', 'প্রতিকার',
        'পোকা মার', 'কীটনাশক', 'রোগ প্রতিরোধ', 'মলিচ', 'বাদাম',
        'মাকড়সা', 'পুরুষ', 'তেলাপোকা', 'মশা', 'মাছি', 'পিঁপড়া',
        'নেমাটোড', 'গাছ পোড়া', 'পাতা ঝলসানো', 'মূল পচা', 'কাণ্ড পচা'
    ],
    fertilizer: [
        'সার', 'NPK', 'ইউরিয়া', 'ডিএপি', 'ফসফরাস', 'পটাশ',
        'পুষ্টি', 'খাদ্য', 'সারবস্তু', 'fertilizer', 'nutrition', 'organic',
        'জৈব সার', 'কেমিক্যাল সার', 'খাদ্য উপাদান', 'ম্যাঙ্গানিজ',
        'জিঙ্ক', 'আয়রন', 'কপার', 'বোরন', 'ক্যালসিয়াম', 'ম্যাগনেসিয়াম',
        'ভের্মিকম্পোস্ট', 'কম্পোস্ট', 'পশুর পৌষ্টিক', 'নীম খাদ্য',
        'সুপার ফসফেট', 'পোটাশ সালফেট', 'অ্যামোনিয়াম সালফেট'
    ],
    weather: [
        'আবহাওয়া', 'বৃষ্টি', 'খরা', 'বন্যা', 'ঝড়', 'তুষার',
        'গরম', 'ঠান্ডা', 'বাতাস', 'কুয়াশা', 'weather', 'rain', 'drought',
        'মৌসুম', 'সেচ', 'পানি', 'জল', 'সেচকার্য', 'আর্দ্রতা',
        'তাপমাত্রা', 'হালকা বৃষ্টি', 'প্রবল বৃষ্টি', 'শুষ্ক মৌসুম'
    ],
    product: [
        'মূল্য', 'দাম', 'বিক্রি', 'কেনা', 'শপিং', 'অর্ডার',
        'ডেলিভারি', 'পণ্য', 'স্টক', 'বাজার', 'price', 'buy', 'sell',
        'অনলাইন', 'দোকান', 'সেবা', 'অ্যাপ', 'ওয়েবসাইট', 'লগইন',
        'রেজিস্ট্রেশন', 'প্রোফাইল', 'সাবস্ক্রিপশন', 'পেমেন্ট'
    ],
    general: []
};

export const SFSemanticSearch = {
    _index: null,
    _documents: [],

    init() {
        this._index = new Map();
        this._documents = [];
        return this;
    },

    buildIndex(documents) {
        this._documents = documents;
        this._index.clear();

        documents.forEach((doc, idx) => {
            const content = doc.content || doc.text || '';
            const tokens = this._tokenize(content);
            const uniqueTokens = [...new Set(tokens)];

            uniqueTokens.forEach(token => {
                const normalized = this.normalize(token);
                if (!this._index.has(normalized)) {
                    this._index.set(normalized, []);
                }
                this._index.get(normalized).push({
                    docIndex: idx,
                    original: token,
                    document: doc
                });
            });
        });

        return this._index;
    },

    search(query, options = {}) {
        const {
            limit = 10,
            threshold = 0.3,
            includeSynonyms = true,
            intentBoost = true,
            fuzzyThreshold = 2
        } = options;

        const normalizedQuery = this.normalize(query);
        const expandedTerms = includeSynonyms
            ? this.expandQuery(query)
            : [normalizedQuery];
        const intent = this.detectIntent(query);

        let results = [];
        const seenDocs = new Set();

        expandedTerms.forEach(term => {
            const normalizedTerm = this.normalize(term);
            const exactMatches = this._index.get(normalizedTerm) || [];

            exactMatches.forEach(match => {
                if (!seenDocs.has(match.docIndex)) {
                    seenDocs.add(match.docIndex);
                    const docContent = match.document.content || match.document.text || '';
                    results.push({
                        document: match.document,
                        score: this.similarity(query, docContent),
                        matchType: 'exact',
                        matchedTerm: term,
                        intent
                    });
                }
            });
        });

        this._documents.forEach((doc, idx) => {
            if (seenDocs.has(idx)) return;

            const docContent = doc.content || doc.text || '';
            const docTokens = this._tokenize(docContent);
            let bestFuzzyScore = 0;
            let bestFuzzyTerm = '';

            expandedTerms.forEach(term => {
                const normalizedTerm = this.normalize(term);

                docTokens.forEach(docToken => {
                    const normalizedDocToken = this.normalize(docToken);
                    const fuzzyScore = this.fuzzyMatch(normalizedTerm, normalizedDocToken);
                    if (fuzzyScore > bestFuzzyScore) {
                        bestFuzzyScore = fuzzyScore;
                        bestFuzzyTerm = term;
                    }
                });

                const fullDocScore = this.fuzzyMatch(normalizedTerm, this.normalize(docContent));
                if (fullDocScore > bestFuzzyScore) {
                    bestFuzzyScore = fullDocScore;
                    bestFuzzyTerm = term;
                }
            });

            const maxDist = query.length <= 3 ? 1 : (query.length <= 6 ? 2 : 3);
            if (bestFuzzyScore > threshold || (1 - bestFuzzyScore) <= maxDist / Math.max(1, query.length)) {
                results.push({
                    document: doc,
                    score: bestFuzzyScore * 0.9,
                    matchType: 'fuzzy',
                    matchedTerm: bestFuzzyTerm,
                    intent
                });
            }
        });

        if (intentBoost && intent !== 'general') {
            results.forEach(result => {
                if (result.document.category === intent ||
                    (result.document.tags && result.document.tags.includes(intent))) {
                    result.score *= 1.2;
                }
            });
        }

        results = this.rankResults(query, results);

        return results
            .filter(r => r.score >= threshold)
            .slice(0, limit);
    },

    fuzzyMatch(query, target) {
        if (!query || !target) return 0;

        const queryLower = query.toLowerCase();
        const targetLower = target.toLowerCase();

        if (queryLower === targetLower) return 1;

        if (targetLower.includes(queryLower)) {
            return 0.8 + (0.2 * queryLower.length / targetLower.length);
        }

        const words = targetLower.split(/\s+/);
        let bestWordScore = 0;
        words.forEach(word => {
            const score = this._singleWordFuzzy(queryLower, word);
            if (score > bestWordScore) bestWordScore = score;
        });
        if (bestWordScore > 0.5) return bestWordScore;

        const distance = this._levenshteinDistance(queryLower, targetLower);
        const maxLen = Math.max(queryLower.length, targetLower.length);
        if (maxLen === 0) return 1;

        const maxAllowedDist = queryLower.length <= 3 ? 1 : (queryLower.length <= 6 ? 2 : 3);
        if (distance > maxAllowedDist + Math.floor(maxLen / 5)) return 0;

        return Math.max(0, 1 - (distance / maxLen));
    },

    _singleWordFuzzy(query, word) {
        if (query === word) return 1;
        if (word.includes(query)) return 0.85;

        const distance = this._levenshteinDistance(query, word);
        const maxLen = Math.max(query.length, word.length);
        if (maxLen === 0) return 1;

        const maxAllowed = query.length <= 3 ? 1 : (query.length <= 6 ? 2 : 3);
        if (distance > maxAllowed) return 0;

        return Math.max(0, 1 - (distance / maxLen));
    },

    _levenshteinDistance(s1, s2) {
        const len1 = s1.length;
        const len2 = s2.length;

        if (len1 === 0) return len2;
        if (len2 === 0) return len1;

        const matrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return matrix[len1][len2];
    },

    expandQuery(query) {
        const words = this._tokenize(query);
        const expanded = new Set(words);

        words.forEach(word => {
            const normalizedWord = this.normalize(word);

            Object.keys(SYNONYMS).forEach(synKey => {
                const normalizedKey = this.normalize(synKey);
                if (normalizedKey === normalizedWord) {
                    SYNONYMS[synKey].forEach(syn => expanded.add(syn));
                }

                SYNONYMS[synKey].forEach(syn => {
                    if (this.normalize(syn) === normalizedWord) {
                        expanded.add(synKey);
                        SYNONYMS[synKey].forEach(s => expanded.add(s));
                    }
                });
            });

            const chatgaiyaNorm = this.normalizeChatgaiya(word);
            if (chatgaiyaNorm !== word) expanded.add(chatgaiyaNorm);

            const banglishNorm = this.normalizeBanglish(word);
            if (banglishNorm !== word) expanded.add(banglishNorm);

            const reverseBanglish = this._reverseBanglish(word);
            if (reverseBanglish && reverseBanglish !== word) expanded.add(reverseBanglish);
        });

        return [...expanded];
    },

    detectIntent(query) {
        const normalizedQuery = this.normalize(query.toLowerCase());
        const words = this._tokenize(normalizedQuery);

        const scores = {};
        Object.keys(INTENT_KEYWORDS).forEach(intent => {
            scores[intent] = 0;
        });

        words.forEach(word => {
            Object.entries(INTENT_KEYWORDS).forEach(([intent, keywords]) => {
                keywords.forEach(keyword => {
                    const normalizedKeyword = this.normalize(keyword.toLowerCase());
                    if (normalizedWord === normalizedKeyword ||
                        normalizedWord.includes(normalizedKeyword) ||
                        normalizedKeyword.includes(normalizedWord)) {
                        scores[intent] += 2;
                    } else if (this.fuzzyMatch(normalizedWord, normalizedKeyword) > 0.7) {
                        scores[intent] += 1;
                    }
                });
            });
        });

        Object.keys(SYNONYMS).forEach(synKey => {
            const normalizedKey = this.normalize(synKey.toLowerCase());
            words.forEach(word => {
                const normalizedWord = this.normalize(word.toLowerCase());
                if (normalizedWord === normalizedKey) {
                    SYNONYMS[synKey].forEach(syn => {
                        const synLower = syn.toLowerCase();
                        Object.entries(INTENT_KEYWORDS).forEach(([intent, keywords]) => {
                            keywords.forEach(keyword => {
                                if (synLower.includes(keyword.toLowerCase()) ||
                                    keyword.toLowerCase().includes(synLower)) {
                                    scores[intent] += 1;
                                }
                            });
                        });
                    });
                }
            });
        });

        let maxScore = 0;
        let detectedIntent = 'general';
        Object.entries(scores).forEach(([intent, score]) => {
            if (score > maxScore) {
                maxScore = score;
                detectedIntent = intent;
            }
        });

        return maxScore >= 2 ? detectedIntent : 'general';
    },

    normalize(text) {
        if (!text) return '';

        let normalized = text
            .toLowerCase()
            .trim()
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/\s+/g, ' ')
            .replace(/["""]+/g, '"')
            .replace(/['']+*/g, "'");

        const bengaliNormMap = {
            '\u09CD': '',
            '\u09A3\u09CD': '\u09A3',
            '\u09B6\u09CD': '\u09B6',
            '\u09B8\u09CD': '\u09B8',
            '\u09A4\u09CD': '\u09A4',
            '\u09C7': '\u09C7',
            '\u09C8': '\u09C7',
            '\u09BE': '\u09BE',
            '\u09BF': '\u09BF',
            '\u09C0': '\u09BF',
            '\u09C1': '\u09C1',
            '\u09C2': '\u09C2',
            '\u09C3': '\u09C3',
            '\u09C4': '\u09C4',
            '\u09DC': '\u09B0',
            '\u09DD': '\u09B9',
            '\u09DF': '\u09AF',
        };

        Object.entries(bengaliNormMap).forEach(([from, to]) => {
            normalized = normalized.split(from).join(to);
        });

        normalized = normalized
            .replace(/[া]/g, '')
            .replace(/[ি]/g, '')
            .replace(/[ী]/g, '')
            .replace(/[ু]/g, '')
            .replace(/[ূ]/g, '')
            .replace(/[ৃ]/g, '')
            .replace(/[ে]/g, '')
            .replace(/[ৈ]/g, '')
            .replace(/[ো]/g, '')
            .replace(/[ৌ]/g, '')
            .replace(/[্]/g, '');

        normalized = normalized
            .replace(/[.,\/#!$%\^&\*;:{}=\_`~()]/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        return normalized;
    },

    similarity(text1, text2) {
        if (!text1 || !text2) return 0;

        const norm1 = this.normalize(text1);
        const norm2 = this.normalize(text2);

        if (norm1 === norm2) return 1;

        const words1 = new Set(this._tokenize(norm1));
        const words2 = new Set(this._tokenize(norm2));

        if (words1.size === 0 || words2.size === 0) return 0;

        let intersection = 0;
        words1.forEach(word => {
            if (words2.has(word)) {
                intersection++;
            } else {
                words2.forEach(word2 => {
                    if (this.fuzzyMatch(word, word2) > 0.8) {
                        intersection += 0.5;
                    }
                });
            }
        });

        const union = new Set([...words1, ...words2]).size;
        const jaccard = union > 0 ? intersection / union : 0;

        const distance = this._levenshteinDistance(norm1, norm2);
        const maxLen = Math.max(norm1.length, norm2.length);
        const editSim = maxLen > 0 ? 1 - (distance / maxLen) : 1;

        const shorterInLonger = norm1.length > norm2.length
            ? (norm1.includes(norm2) ? 0.9 : 0)
            : (norm2.includes(norm1) ? 0.9 : 0);

        return Math.max(jaccard, editSim * 0.8, shorterInLonger);
    },

    getSynonyms(word) {
        const normalizedWord = this.normalize(word);
        const synonyms = new Set();

        Object.keys(SYNONYMS).forEach(synKey => {
            const normalizedKey = this.normalize(synKey);
            if (normalizedKey === normalizedWord) {
                SYNONYMS[synKey].forEach(syn => synonyms.add(syn));
            }
            SYNONYMS[synKey].forEach(syn => {
                if (this.normalize(syn) === normalizedWord) {
                    synonyms.add(synKey);
                    SYNONYMS[synKey].forEach(s => synonyms.add(s));
                }
            });
        });

        return [...synonyms];
    },

    normalizeChatgaiya(text) {
        if (!text) return '';

        let normalized = text;
        const words = text.split(/\s+/);

        const normalizedWords = words.map(word => {
            return CHATGAIYA_MAP[word] || word;
        });

        return normalizedWords.join(' ');
    },

    normalizeBanglish(text) {
        if (!text) return '';

        let normalized = text;
        const words = text.split(/\s+/);

        const normalizedWords = words.map(word => {
            const lower = word.toLowerCase();
            return BANGLISH_MAP[lower] || word;
        });

        return normalizedWords.join(' ');
    },

    _reverseBanglish(word) {
        const lower = word.toLowerCase();
        const normalized = this.normalize(word);

        if (normalized !== lower) return null;

        return null;
    },

    rankResults(query, results) {
        const normalizedQuery = this.normalize(query);

        return results.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;

            if (a.matchType === 'exact' && b.matchType !== 'exact') return -1;
            if (b.matchType === 'exact' && a.matchType !== 'exact') return 1;

            const aTitleBoost = (a.document.title &&
                this.normalize(a.document.title).includes(normalizedQuery)) ? 0.1 : 0;
            const bTitleBoost = (b.document.title &&
                this.normalize(b.document.title).includes(normalizedQuery)) ? 0.1 : 0;

            return (b.score + bTitleBoost) - (a.score + aTitleBoost);
        });
    },

    getSuggestions(query) {
        if (!query || query.length < 2) return [];

        const normalizedQuery = this.normalize(query);
        const suggestions = new Set();
        const maxSuggestions = 5;

        const expandedTerms = this.expandQuery(query);
        expandedTerms.slice(0, maxSuggestions).forEach(term => {
            if (term !== query) suggestions.add(term);
        });

        Object.keys(SYNONYMS).forEach(synKey => {
            if (suggestions.size >= maxSuggestions) return;

            const normalizedKey = this.normalize(synKey);
            if (normalizedKey.includes(normalizedQuery) ||
                normalizedQuery.includes(normalizedKey)) {
                suggestions.add(synKey);
                SYNONYMS[synKey].slice(0, 2).forEach(syn => suggestions.add(syn));
            }
        });

        if (suggestions.size < maxSuggestions) {
            this._documents.forEach(doc => {
                if (suggestions.size >= maxSuggestions) return;

                const title = doc.title || '';
                const normalizedTitle = this.normalize(title);
                if (normalizedTitle.includes(normalizedQuery) ||
                    normalizedQuery.includes(normalizedTitle)) {
                    suggestions.add(title);
                }
            });
        }

        return [...suggestions].slice(0, maxSuggestions);
    },

    _tokenize(text) {
        if (!text) return [];

        return text
            .split(/[\s,;.!?\-_\s]+/)
            .map(t => t.trim())
            .filter(t => t.length > 0);
    }
};

export default SFSemanticSearch;
