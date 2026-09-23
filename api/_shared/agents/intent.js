function matchesWithBoundary(text, keyword) {
    if (keyword.length <= 3) {
        const regex = new RegExp(`(?:^|[\\s,।!?.])${escapeRegex(keyword)}(?:[\\s,।!?.]|$)`, 'i');
        return regex.test(text);
    }
    return text.includes(keyword);
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const BANGLA_DIGITS = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };

function parseBanglaNumber(str) {
    if (!str) return NaN;
    let normalized = str.trim();
    for (const [bn, en] of Object.entries(BANGLA_DIGITS)) {
        normalized = normalized.replaceAll(bn, en);
    }
    return Number(normalized);
}

function extractQuantity(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    const units = [
        { bangla: 'একর', english: 'acre', aliases: ['একরে', 'একরজুড়ে', 'একর জমি', 'যেকর', 'যেকরে', 'যেকরেতে', 'একরেতে'] },
        { bangla: 'শতক', english: 'shatak', aliases: ['শতকে'] },
        { bangla: 'বিঘা', english: 'bigha', aliases: ['বিঘায়', 'বিঘা জমি'] },
        { bangla: 'কেজি', english: 'kg', aliases: ['কেজিতে', 'কেজির'] },
        { bangla: 'গ্রাম', english: 'gram', aliases: ['গ্রামে'] },
        { bangla: 'লিটার', english: 'liter', aliases: ['লিটারে', 'লিটারি'] },
        { bangla: 'টন', english: 'ton', aliases: ['টনে'] },
    ];

    for (const unit of units) {
        const allNames = [unit.bangla, unit.english, ...unit.aliases];
        for (const name of allNames) {
            const idx = lower.indexOf(name);
            if (idx === -1) continue;
            const before = text.substring(0, idx).trim();
            const numMatch = before.match(/[\d০-৯.,]+$/);
            if (numMatch) {
                const num = parseBanglaNumber(numMatch[0].replace(/,/g, ''));
                if (!isNaN(num) && num > 0) {
                    return { quantity: num, unit: unit.bangla, unitEnglish: unit.english };
                }
            }
        }
    }
    return null;
}

function detectIntent(text, languageResult = {}) {
    const lower = (text || '').toLowerCase();
    const normalized = (languageResult.normalized || text || '').toLowerCase();

    const intents = {
        primaryIntent: 'general',
        subIntent: 'informational',
        isFertilizerQuery: false,
        isDiseaseQuery: false,
        isProductQuery: false,
        isWeatherQuery: false,
        isSoilQuery: false,
        isGovernmentQuery: false,
        isFaqQuery: false,
        isOrganicQuery: false,
        isPestQuery: false,
        isCropIdQuery: false,
        isEmergency: false,
        isCalculationQuery: false,
        needsClarification: false,
        quantity: null,
        quantityUnit: null,
        cropName: null,
        location: null,
        season: null,
        confidence: 0,
        normalizedFertilizerType: null,
        isTrichodermaTiming: false,
        isFertilizerComparison: false,
    };

    const intentScores = {
        emergency: 0,
        disease: 0,
        pest: 0,
        fertilizer: 0,
        product: 0,
        weather: 0,
        soil: 0,
        government: 0,
        faq: 0,
        organic: 0,
        crop: 0,
        general: 1,
    };

    const emergencyKeywords = ['জরুরি', 'emergency', 'অতি জরুরি', 'তাৎক্ষণিক', 'urgent',
        'সঙ্গে সঙ্গে', 'ছড়িয়ে পড়ছে', 'সব মরে গেছে',
        'তাৎক্ষণিক ব্যবস্থা', 'urgent action', 'মরে গেছে', 'পচে গেছে'];
    intents.isEmergency = emergencyKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isEmergency) intentScores.emergency = 20;

    const fertKeywords = ['সার', 'fertilizer', 'ইউরিয়া', 'urea', 'ডিএপি', 'dap',
        'কমপোস্ট', 'compost', 'vermicompost', 'vermi', 'ভার্মি',
        'ট্রাইকোডার্মা', 'trichoderma', 'tricho', 'ট্রাইকো',
        'পুষ্টি', 'nutrition', 'নাইট্রোজেন', 'nitrogen', 'ফসফরাস', 'phosphorus',
        'পটাশিয়াম', 'potassium', 'ভার্মিকমপোস্ট', 'বেজোসার', 'কেসিএ', 'npk',
        'সার দিব', 'সার কি', 'কোন সার', 'কি সার', 'কী সার',
        'what fertilizer', 'which fertilizer', 'fertilizer recommend',
        'সারের পরিমাণ', 'fertilizer dose', 'সার ব্যবহার'];
    intents.isFertilizerQuery = fertKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isFertilizerQuery) intentScores.fertilizer = 10;

    const diseaseKeywords = ['রোগ', 'disease', 'পাতা হলুদ', 'পাতা কুকড়', 'মরা', 'মারা',
        'ক্ষতি', 'কুঁকড়ে', 'হলদে', 'হলুদে', 'হলুদ হয়েছে', 'বাদামি', 'ধুলো', 'মলিচ', 'গলা',
        'ফাঁপা', 'দাগ', 'পচা', 'পচে', 'মরাডা', 'ফাংগাস', 'ব্যাকটেরিয়া', 'ভাইরাস',
        'মরিচ্যা মইরা', 'বেগুন্যা মইরা', 'কুকড়াইছে', 'পাতা ঝরা', 'পাতা পচা',
        'কী হয়েছে', 'কী হইছে', 'কি হয়েছে', 'কি হইছে', 'হলুদ হইছে', 'মরে গেছে', 'পচে গেছে',
        'হলুদ কেন', 'কেন হলুদ', 'কেন মরে', 'কেন পচে', 'কেন হয়েছে',
        'what happened', 'leaf yellow', 'yellowing', 'leaf curl', 'spot', 'blight', 'wilt',
        'rot', 'rust', 'mildew', 'blotch',
        'লক্ষণ', 'symptom', 'নষ্ট', 'damaged', 'আক্রান্ত', 'affected'];
    intents.isDiseaseQuery = diseaseKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isDiseaseQuery) intentScores.disease = 12;

    const pestKeywords = ['পোকা', 'পোকা মারা', 'পোকা নিয়ন্ত্রণ', 'insect', 'pest', 'bug',
        'অ্যাফিড', 'aphid', 'মশা', 'whitefly', 'সাদা মাছি', 'তেলাপোকা',
        'লাল মাকড়', 'spider mite', 'কীটপতঙ্গ', 'কীট', 'কীটনাশক', 'insecticide'];
    intents.isPestQuery = pestKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isPestQuery) intentScores.pest = 11;

    const prodKeywords = ['product', 'কিনুন', 'দাম', 'মূল্য', 'price', 'buy', 'shop', 'order',
        'বাজার', 'দোকান', 'বিক্রি', 'ক্রয়', 'কিনতে', 'অর্ডার', 'স্টক',
        'cost', 'how much', 'কত টাকা', 'কত দাম', 'available', 'আছে কি'];
    intents.isProductQuery = prodKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isProductQuery) intentScores.product = 8;

    const weatherKeywords = ['আবহাওয়া', 'weather', 'বৃষ্টি', 'রোদ', 'গরম', 'শীত',
        'বাতাস', 'ঝড়', 'বন্যা', 'খরা', 'মৌসুম', 'season',
        'বর্ষা', 'গ্রীষ্ম', 'শীতকাল', 'monsoon', 'rain', 'sun', 'cold'];
    intents.isWeatherQuery = weatherKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isWeatherQuery) intentScores.weather = 7;

    const soilKeywords = ['মাটি', 'soil', 'pH', 'উর্বরতা', 'লবণাক্ত', 'salinity',
        'মাটির', 'কাদা', 'বালি', 'মাটি পরীক্ষা'];
    intents.isSoilQuery = soilKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isSoilQuery) intentScores.soil = 7;

    const govKeywords = ['সরকারি', 'government', 'DAE', 'BARI', 'BRRI', 'সাবসিডি',
        'সরকার', 'অধিদপ্তর', 'গবেষণা', 'নীতিমালা'];
    intents.isGovernmentQuery = govKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isGovernmentQuery) intentScores.government = 6;

    const organicKeywords = ['জৈব', 'organic', 'কমপোস্ট', 'compost', 'ভার্মিকমপোস্ট', 'vermicompost',
        'জৈব সার', 'জৈব কৃষি', 'প্রাকৃতিক', 'natural', 'নীম', 'neem', 'পাতা খাদ্য',
        'বর্মি', 'পংক্তি চাষ', 'মিশ্র চাষ', 'সবুজ সার'];
    intents.isOrganicQuery = organicKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isOrganicQuery) intentScores.organic = 6;

    const cropIdKeywords = ['চেনা', 'পরিচয়', 'identify', 'কী ফসল', 'কোন ফসল', 'নাম',
        'কি ধরনের', 'কোন জাত', 'জাত'];
    intents.isCropIdQuery = cropIdKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isCropIdQuery) intentScores.crop = 6;

    const faqKeywords = ['কীভাবে', 'কিভাবে', 'how to', 'কোথায় পাই', 'কোথায় পাব', 'where to',
        'কখন দিব', 'কখন লাগাব', 'কখন দেব', 'কখন ব্যবহার', 'কতে', 'কতে দিতে', 'কতে লাগাতে',
        'when to', 'কেন হয়', 'why does',
        'কত টাকা', 'কত দাম', 'how much', 'কোনটি ভালো', 'which is better'];
    intents.isFaqQuery = faqKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isFaqQuery) intentScores.faq = 3;

    const priorityOrder = ['emergency', 'disease', 'pest', 'fertilizer', 'product', 'weather', 'soil', 'government', 'organic', 'crop', 'faq', 'general'];
    let maxScore = 0;
    let maxIntent = 'general';

    for (const intent of priorityOrder) {
        if (intentScores[intent] > maxScore) {
            maxScore = intentScores[intent];
            maxIntent = intent;
        }
    }

    intents.primaryIntent = maxIntent;
    intents.confidence = maxScore;

    // ── Sub-intent detection ──
    const calcKeywords = ['কতটুকু', 'কত লাগবে', 'কত দিতে হবে', 'কত কেজি', 'কত গ্রাম',
        'কত লিটার', 'কত টন', 'how much', 'how many', 'কত পরিমাণ', 'পরিমাণ কত',
        'কত হবে', 'হিসাব দাও', 'হিসাব কর', 'calculate', 'quantity'];
    const isCalcKeyword = calcKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    const qty = extractQuantity(text);
    intents.isCalculationQuery = isCalcKeyword || (qty !== null && (intents.isFertilizerQuery || intents.isProductQuery));
    intents.quantity = qty?.quantity || null;
    intents.quantityUnit = qty?.unit || null;

    const fertTypeNames = ['ইউরিয়া', 'urea', 'ডিএপি', 'dap', 'কেসিএ', 'kca',
        'এমওপি', 'mop', 'কমপোস্ট', 'compost', 'npk', 'জিপসাম', 'gypsum',
        'ভার্মিকমপোস্ট', 'vermicompost', 'ভার্মি', 'vermi',
        'ট্রাইকোডার্মা', 'trichoderma', 'ট্রাইকো', 'tricho',
        'টিএসপি', 'tsp'];
    const hasFertType = fertTypeNames.some(ft => lower.includes(ft) || normalized.includes(ft));

    // ── Normalized fertilizer type (canonical names) ──
    const vn = (lower + ' ' + normalized);
    if (/ভার্মিকমপোস[্টত]|ভার্মিকমপোস[্টত]ে|vermicompost|vermi\b/.test(vn)) {
        intents.normalizedFertilizerType = 'vermicompost';
    } else if (/ট্রাইকোডার্মা|trichoderma|ট্রাইকো|tricho\b/.test(vn)) {
        intents.normalizedFertilizerType = 'trichoderma';
    } else if (/ইউরিয়া|urea\b/.test(vn)) {
        intents.normalizedFertilizerType = 'urea';
    } else if (/ডিএপি|dap\b/.test(vn)) {
        intents.normalizedFertilizerType = 'dap';
    }

    // ── Trichoderma timing (timing keywords, no quantity) ──
    const hasTimingKeywords = /কতে|কবে|কখন|কেন|দিতে|লাগাতে|ব্যবহার|প্রয়োগ|তুলে|when to|how to|কীভাবে|কিভাবে/.test(vn);
    intents.isTrichodermaTiming = intents.normalizedFertilizerType === 'trichoderma' && hasTimingKeywords && !intents.quantity;

    // ── Fertilizer comparison (two products mentioned) ──
    const hasTwoProducts = /vermicompost.*trichoderma|trichoderma.*vermicompost|ভার্মি.*ট্রাইকো|ট্রাইকো.*ভার্মি|ভার্মিকমপোস[্টত].*ট্রাইকো|ট্রাইকো.*ভার্মিকমপোস[্টত]/i.test(vn);
    const hasComparisonWords = /better|best|which|compare|comparison|কোন|ভালো|শ্রেষ্ঠ|তুলনা|কোনটি|কোনটা|কোনটি ভালো|which is better/i.test(vn);
    intents.isFertilizerComparison = hasTwoProducts && hasComparisonWords;

    const crops = {
        'টমেটো': ['টমেটো', 'টমেটু', 'টমেটূ', 'tomato', 'খাট্টাবাইয়্যুন', 'খাট্টাবাইয়ান'],
        'বেগুন': ['বেগুন', 'বেগুন্যা', 'begun', 'brinjal', 'eggplant'],
        'মরিচ': ['মরিচ', 'মরিচ্যা', 'morich', 'chili', 'pepper'],
        'ধান': ['ধান', 'ধানডা', 'dhan', 'rice', 'paddy'],
        'আলু': ['আলু', 'আলুডা', 'alu', 'potato'],
        'পেঁয়াজ': ['পেঁয়াজ', 'পেইয়াজ', 'peyaj', 'onion'],
        'রসুন': ['রসুন', 'রশুন', 'roshun', 'garlic'],
        'শাক': ['শাক', 'shak', 'spinach', 'পালং', 'ধুন্দা', 'কচু'],
        'লাউ': ['লাউ', 'লাউডা', 'lau', 'gourd'],
        'কুমড়া': ['কুমড়া', 'কুমড়াডা', 'kumra', 'pumpkin'],
        'বাঁধাকপি': ['বাঁধাকপি', 'bandhakopi', 'cabbage'],
        'ফুলফি': ['ফুলফি', 'phulfi', 'cauliflower'],
        'শিম': ['শিম', 'shim', 'bean'],
        'ঝিংগি': ['ঝিংগি', 'jhingi', 'ridge gourd'],
        'লোকি': ['লোকি', 'loki', 'bottle gourd'],
        'শসা': ['শসা', 'শসাডা', 'shosha', 'cucumber'],
        'কলা': ['কলা', 'kola', 'banana'],
        'পেপে': ['পেপে', 'pepe', 'papaya'],
        'লেবু': ['লেবু', 'lebu', 'lemon'],
        'আম': ['আম', 'aam', 'mango'],
        'জাম': ['জাম', 'jam', 'guava'],
        'কমলা': ['কমলা', 'komla', 'orange'],
        'তরমুজ': ['তরমুজ', 'tormuj', 'watermelon'],
        'ডাল': ['ডাল', 'ডালডা', 'dal', 'pulse', 'lentil'],
        'মসুর': ['মসুর', 'masur', 'red lentil'],
        'ছোলা': ['ছোলা', 'chhola', 'chickpea'],
        'মুগ': ['মুগ', 'mung', 'mung bean'],
        'বুট': ['বুট', 'but', 'black gram'],
        'খেসারি': ['খেসারি', 'khesari', 'lathyrus'],
        'সরিষা': ['সরিষা', 'shorisha', 'mustard'],
        'পাট': ['পাট', 'pat', 'jute'],
    };

    for (const [crop, aliases] of Object.entries(crops)) {
        const matched = aliases.some(alias => {
            if (/[\u0980-\u09FF]/.test(alias)) {
                const suffixPattern = 'ের|ে|তে|র|টা|গুলো|টি|দের|না|ও|য়|সহ|বিহীন|মূলক|ক্ষেত্র|নির্ভর';
                const boundaryRegex = new RegExp(`(?:^|[\\s,।!?.])${escapeRegex(alias)}(?:[\\s,।!?.]|$|${suffixPattern})`, 'i');
                return boundaryRegex.test(normalized) || boundaryRegex.test(lower);
            }
            return lower.includes(alias) || normalized.includes(alias);
        });
        if (matched) {
            intents.cropName = crop;
            break;
        }
    }

    const locations = {
        'মহেশখালী': ['মহেশখালী', 'maheshkhali'],
        'কক্সবাজার': ['কক্সবাজার', "cox's bazar", 'cox'],
        'চাটগ্রাম': ['চাটগ্রাম', 'চট্টগ্রাম', 'chattogram', 'chittagong'],
        'ঢাকা': ['ঢাকা', 'dhaka'],
        'রাজশাহী': ['রাজশাহী', 'rajshahi'],
        'খুলনা': ['খুলনা', 'khulna'],
        'বরিশাল': ['বরিশাল', 'barishal'],
        'সিলেট': ['সিলেট', 'sylhet'],
        'রংপুর': ['রংপুর', 'rangpur'],
        'কুতুবদিয়া': ['কুতুবদিয়া', 'kutubdia'],
        'পেকুয়া': ['পেকুয়া', 'pekua'],
        'আনোয়ারা': ['আনোয়ারা', 'anwara'],
        'সীতাকুণ্ড': ['সীতাকুণ্ড', 'sitakunda'],
        'রাঙ্গুনিয়া': ['রাঙ্গুনিয়া', 'rangunia'],
        'বোয়ালখালী': ['বোয়ালখালী', 'boalkhali'],
        'বাঁশখালী': ['বাঁশখালী', 'banshkhali'],
    };

    for (const [loc, aliases] of Object.entries(locations)) {
        if (aliases.some(alias => lower.includes(alias) || normalized.includes(alias))) {
            intents.location = loc;
            break;
        }
    }

    const seasons = {
        'গ্রীষ্ম': ['গ্রীষ্ম', 'গ্রীষ্মকাল', 'গরম', 'summer'],
        'বর্ষা': ['বর্ষা', 'বর্ষাকাল', 'বর্ষার', 'monsoon', 'rainy'],
        'শীত': ['শীত', 'শীতকাল', 'শীতের', 'winter', 'cold'],
        'হেমন্ত': ['হেমন্ত', 'হেমন্তকাল'],
        'বসন্ত': ['বসন্ত', 'বসন্তকাল', 'spring'],
    };

    for (const [s, aliases] of Object.entries(seasons)) {
        if (aliases.some(alias => lower.includes(alias) || normalized.includes(alias))) {
            intents.season = s;
            break;
        }
    }

    // ── Fertilizer recommendation vs clarification ──
    // Recommendation language: which/what fertilizer, suitable, recommended, কোন সার, কী সার, কোনটা...
    const recKeywords = ['কোন', 'ভালো', 'কোনটি', 'কোনটা', 'best', 'which', 'recommend', 'recommended', 'সুপারিশ', 'সুপারিশকৃত', 'what fertilizer', 'suitable', 'কোন সার', 'কী সার', 'কি সার'];
    const recPhraseRe = /(?:what|which)\s+fertilizers?\b|fertilizer\s+recommend|suitable\s+fertilizer\b|recommended\s+fertilizer\b/i;
    const isRecommendation = recPhraseRe.test(vn) || recKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));

    // Agricultural context: detected crop, growth stage/timing, season, or location
    const stageKeywords = ['পর্যায়', 'কুশি', 'বীজতলা', 'চারা', 'শাখা গঠন', 'শীর্ষ', 'ফুল', 'দানা', 'পাকা',
        'stage', 'tillering', 'seedling', 'flowering', 'panicle', 'vegetative', 'reproductive',
        'maturity', 'grain filling', 'grain-filling', 'ripening', 'booting', 'germination', 'emergence'];
    const hasStageKeyword = stageKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    const hasAgriculturalContext = intents.cropName !== null || hasStageKeyword || intents.season !== null || intents.location !== null;

    intents.needsClarification = false;
    if (intents.isFertilizerQuery && !hasFertType && !intents.isCalculationQuery && !(isRecommendation && hasAgriculturalContext)) {
        intents.needsClarification = true;
    }

    if (intents.isCalculationQuery) {
        intents.subIntent = 'calculation';
    } else if (intents.needsClarification) {
        intents.subIntent = 'clarification';
    } else if ((maxIntent === 'fertilizer' || maxIntent === 'product') && isRecommendation && hasAgriculturalContext) {
        intents.subIntent = 'recommendation';
    } else if (maxIntent === 'fertilizer' || maxIntent === 'product') {
        intents.subIntent = 'informational';
    } else {
        intents.subIntent = 'informational';
    }

    return intents;
}

export { detectIntent };
