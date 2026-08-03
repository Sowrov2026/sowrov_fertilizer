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

function detectIntent(text, languageResult = {}) {
    const lower = (text || '').toLowerCase();
    const normalized = (languageResult.normalized || text || '').toLowerCase();

    const intents = {
        primaryIntent: 'general',
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
        cropName: null,
        location: null,
        season: null,
        confidence: 0,
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
        'কমপোস্ট', 'compost', 'vermicompost', 'ট্রাইকোডার্মা', 'trichoderma',
        'পুষ্টি', 'nutrition', 'নাইট্রোজেন', 'nitrogen', 'ফসফরাস', 'phosphorus',
        'পটাশিয়াম', 'potassium', 'ভার্মিকমপোস্ট', 'বেজোসার', 'কেসিএ', 'npk',
        'সার দিব', 'সার কি', 'কোন সার', 'কি সার', 'কী সার',
        'what fertilizer', 'which fertilizer', 'fertilizer recommend',
        'সারের পরিমাণ', 'fertilizer dose', 'সার ব্যবহার'];
    intents.isFertilizerQuery = fertKeywords.some(kw => lower.includes(kw) || normalized.includes(kw));
    if (intents.isFertilizerQuery) intentScores.fertilizer = 10;

    const diseaseKeywords = ['রোগ', 'disease', 'পাতা হলুদ', 'পাতা কুকড়', 'মরা', 'মারা',
        'ক্ষতি', 'কুঁকড়ে', 'হলদে', 'বাদামি', 'ধুলো', 'মলিচ', 'গলা',
        'ফাঁপা', 'দাগ', 'পচা', 'মরাডা', 'ফাংগাস', 'ব্যাকটেরিয়া', 'ভাইরাস',
        'মরিচ্যা মইরা', 'বেগুন্যা মইরা', 'কুকড়াইছে', 'পাতা ঝরা', 'পাতা পচা',
        'কী হয়েছে', 'কী হইছে', 'হলুদ হইছে', 'মরে গেছে', 'পচে গেছে',
        'what happened', 'leaf yellow', 'leaf curl', 'spot', 'blight', 'wilt',
        'লক্ষণ', 'symptom', 'নষ্ট', 'damaged'];
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
        'মাটির', 'জমি', 'কাদা', 'বালি', 'মাটি পরীক্ষা'];
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
        'কখন দিব', 'কখন লাগাব', 'when to', 'কেন হয়', 'why does',
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
            if (alias.length <= 2 && /[\u0980-\u09FF]/.test(alias)) {
                return matchesWithBoundary(normalized, alias) || matchesWithBoundary(lower, alias);
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

    return intents;
}

export { detectIntent };
