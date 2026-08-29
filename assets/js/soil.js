/**
 * SFSoil — Soil Advisor Module (SF AI V15)
 * Client-side ES module for Bangladesh agriculture
 * No external dependencies
 */

const SOIL_TYPES = {
    'দোআঁশ': {
        en: 'Loam',
        ph: '6.0-7.0',
        drainage: 'Good',
        fertility: 'High',
        crops: ['ধান', 'পেঁয়াজ', 'রসুন', 'সবজি', 'মটরশুটি', 'ডাল'],
        description: 'মাটির সবচেয়ে উপযুক্ত ধরন — বালু, পলি ও কাদার ভারসাম্যপূর্ণ মিশ্রণ। পানি নিষ্কাশন ভালো এবং ফসলের জন্য উত্তম। বাংলাদেশের অধিকাংশ জেলায় পাওয়া যায়।',
        color: '#8B7355',
        region: 'পদ্মা-ব্রহ্মপুত্র অববাহিকা, মধ্যাঞ্চল'
    },
    'এঁটেল': {
        en: 'Clay',
        ph: '6.5-7.5',
        drainage: 'Poor',
        fertility: 'High',
        crops: ['ধান', 'জুট', 'পানির শাক', 'লাউ'],
        description: 'কাদাময় মাটি যা পানি ধরে রাখে। উর্বরতা ভালো হলেও পানি নিষ্কাশন খারাপ। ধান চাষের জন্য বিশেষ উপযুক্ত।',
        color: '#6B4226',
        region: 'নদীর তীরবর্তী অঞ্চল, লোয়াল্যান্ড'
    },
    'বেলে': {
        en: 'Sandy',
        ph: '5.5-6.5',
        drainage: 'Excellent',
        fertility: 'Low',
        crops: ['আলু', 'মূলা শাক', 'তরমুজ', 'শুক্তা', 'আদা'],
        description: 'বালুকণায় পূর্ণ মাটি — পানি নিষ্কাশন দ্রুত হয় কিন্তু পুষ্টি কম থাকে। সেচ ও জৈব সার প্রয়োজন।',
        color: '#D2B48C',
        region: 'বালুচর এলাকা, তীরবর্তী অঞ্চল'
    },
    'লাল মাটি': {
        en: 'Red Soil',
        ph: '5.0-6.0',
        drainage: 'Good',
        fertility: 'Medium',
        crops: ['আম', 'কাঁঠাল', 'চা', 'পাইনাপল', 'রাবার'],
        description: 'লোহিত রঙের মাটি যাতে আয়রন অক্সাইড বেশি থাকে। অম্লীয় প্রবণতা রয়েছে। গ্রামীণ পাহাড়ি এলাকায় বেশি দেখা যায়।',
        color: '#C04000',
        region: 'হাওর, চট্টগ্রাম পাহাড়ি, রাঙামাটি'
    },
    'কালু মাটি': {
        en: 'Dark Soil',
        ph: '6.0-7.5',
        drainage: 'Moderate',
        fertility: 'Medium',
        crops: ['তিল', 'মূংফলি', 'সরিষা', 'গম'],
        description: 'গাঢ় রঙের মাটি যাতে জৈব পদার্থের পরিমাণ মাঝারি। বর্ষাকালে পানিতে ডুবে যায়।',
        color: '#3E2723',
        region: 'বরেন্দ্র, রাজশাহী'
    },
    'বালুচর': {
        en: 'Saline Sandy',
        ph: '7.5-8.5',
        drainage: 'Good',
        fertility: 'Very Low',
        crops: ['বেটেল পাতা', 'নারিকেল', 'লবণাক্ত ধান', 'খেজুর'],
        description: 'লবণাক্ত ও বালুকণায় পূর্ণ মাটি। উপকূলীয় এলাকায় বেশি দেখা যায়। ফসল উৎপাদন কঠিন।',
        color: '#E8D5B7',
        region: 'কক্সবাজার, খুলনা, বরিশাল উপকূল'
    },
    'কাদাচর': {
        en: 'Tidal Flooded',
        ph: '5.5-6.5',
        drainage: 'Very Poor',
        fertility: 'Medium',
        crops: ['ধান', 'জুট', 'মাছ চাষ', 'নীপা খেজুর'],
        description: 'জোয়ারে প্লাবিত কাদাময় মাটি। বছরের অধিকাংশ সময় পানিতে ডুবে থাকে। জলজ কৃষির জন্য উপযুক্ত।',
        color: '#5D4037',
        region: 'সুন্দরবন, দক্ষিণ-পশ্চিমাঞ্চল'
    },
    'পাহাড়ি': {
        en: 'Hill Soil',
        ph: '5.0-6.0',
        drainage: 'Variable',
        fertility: 'Low',
        crops: ['চা', 'কাঁঠাল', 'বাঁশ', 'কলা', 'আনারস'],
        description: 'পাহাড়ি অঞ্চলের মাটি — পাথুরে ও অম্লীয়। উর্বরতা কম এবং ক্ষয়ের ঝুঁকি বেশি।',
        color: '#795548',
        region: 'চট্টগ্রাম পাহাড়ি, রাঙামাটি, বান্দরবান'
    },
    'অলুভিয়াল': {
        en: 'Alluvial',
        ph: '6.0-7.0',
        drainage: 'Good',
        fertility: 'Very High',
        crops: ['ধান', 'গম', 'সবজি', 'তরকারি', 'আখ'],
        description: 'নদী ক্ষয়জাত মাটি — বাংলাদেশের সবচেয়ে উর্বর মাটি। প্রতি বছর নতুন পলি জমে।',
        color: '#A0522D',
        region: 'পদ্মা, ব্রহ্মপুত্র, মেঘনা অববাহিকা'
    }
};

const PH_RANGES = {
    'অম্লীয়': {
        range: '< 5.5',
        problem: 'অ্যালুমিনিয়াম বিষাক্ততা, পুষ্টি শোষণ ব্যাহত',
        fix: 'চুন প্রয়োগ (২-৩ টন/একর), জৈব পদার্থ বৃদ্ধি',
        crops: ['ধান (অম্ল সহ্যশীল)', 'বেগুন', 'টমেটো'],
        urgency: 'বেশি'
    },
    'স্বাভাবিক': {
        range: '5.5-7.0',
        problem: 'কোনো সমস্যা নেই',
        fix: 'জৈব পদার্থ দিয়ে রক্ষণাবেক্ষণ করুন',
        crops: ['প্রায় সব ফসল'],
        urgency: 'নেই'
    },
    'ক্ষারীয়': {
        range: '7.5-8.5',
        problem: 'লৌহং, জিঙ্ক, ম্যাঙ্গানিজ অভাব',
        fix: 'গন্ধক প্রয়োগ (৫০-১০০ কেজি/একর), জিপসাম',
        crops: ['লবণ-সহ্যশীল জাত', 'বেটেল', 'নারিকেল'],
        urgency: 'মাঝারি'
    },
    'লবণাক্ত': {
        range: 'EC > 4 dS/m',
        problem: 'লবণ চাপ, পানির অভাব',
        fix: 'পানি ফ্লাশিং, জিপসাম, জৈব পদার্থ বৃদ্ধি',
        crops: ['লবণ-সহ্যশীল ফসল', 'খেজুর', 'বেটেল'],
        urgency: 'খুব বেশি'
    }
};

const FERTILIZER_BASE = {
    'ধান': {
        N: 120, P: 60, K: 60, S: 30,
        timing: ['বীজ প্রস্তুতির সময়', 'রোপার ২১ দিন পর', 'পুষ্পি পর্বে'],
        organic: '২-৩ টন গোবর খাদ্য/একর',
        notes: 'জিঙ্ক সার (১০ কেজি/একর) প্রয়োজন হতে পারে'
    },
    'গম': {
        N: 100, P: 50, K: 40, S: 20,
        timing: ['বীজ প্রস্তুতির সময়', 'প্রথম সেচ পর্বে'],
        organic: '১.৫-২ টন পশু খাদ্য/একর',
        notes: 'বোরন প্রয়োগ করুন (১-২ কেজি/একর)'
    },
    'পেঁয়াজ': {
        N: 80, P: 60, K: 80, S: 20,
        timing: ['রোপার সময়', 'পাতা বৃদ্ধির সময়'],
        organic: '১-২ টন গোবর খাদ্য/একর',
        notes: 'ক্লোরাইড কম সার ব্যবহার করুন'
    },
    'রসুন': {
        N: 60, P: 50, K: 60, S: 15,
        timing: ['রোপার সময়', 'পাতা বৃদ্ধির সময়'],
        organic: '১ টন গোবর খাদ্য/একর',
        notes: 'অতিরিক্ত নাইট্রোজন এড়িয়ে চলুন'
    },
    'আলু': {
        N: 120, P: 80, K: 100, S: 20,
        timing: ['রোপার সময়', 'কন্দ গঠনের সময়'],
        organic: '২-৩ টন গোবর খাদ্য/একর',
        notes: 'ক্লোরাইড সংবেদনশীল — সালফেট ভিত্তিক সার ব্যবহার করুন'
    },
    'সবজি': {
        N: 100, P: 50, K: 50, S: 20,
        timing: ['রোপার সময়', 'বৃদ্ধির মধ্যবর্তী সময়'],
        organic: '২-৩ টন গোবর খাদ্য/একর',
        notes: 'জৈব পদার্থের পরিমাণ বাড়ান'
    },
    'ভুট্টা': {
        N: 150, P: 60, K: 60, S: 25,
        timing: ['বীজ প্রস্তুতির সময়', '৪-৬ পাতা অবস্থায়'],
        organic: '২ টন গোবর খাদ্য/একর',
        notes: 'নাইট্রোজন বেশি প্রয়োজন'
    },
    'সরিষা': {
        N: 60, P: 40, K: 30, S: 15,
        timing: ['রোপার সময়', 'ফুল ফোটার আগে'],
        organic: '১-২ টন গোবর খাদ্য/একর',
        notes: 'সালফার ভিত্তিক সার উপযুক্ত'
    },
    'তিল': {
        N: 50, P: 30, K: 30, S: 15,
        timing: ['রোপার সময়', 'ফুল ফোটার সময়'],
        organic: '১ টন গোবর খাদ্য/একর',
        notes: 'কম পুষ্টি প্রয়োজনীয় ফসল'
    },
    'মূংফলি': {
        N: 40, P: 50, K: 60, S: 20,
        timing: ['রোপার সময়', 'ফুল ফোটার সময়'],
        organic: '১-১.৫ টন গোবর খাদ্য/একর',
        notes: 'নাইট্রোজন ফিক্সেশনে সাহায্য করে'
    },
    'জুট': {
        N: 80, P: 40, K: 40, S: 15,
        timing: ['রোপার সময়', 'পাতা বৃদ্ধির সময়'],
        organic: '১.৫-২ টন গোবর খাদ্য/একর',
        notes: 'পানি নিষ্কাশন ভালো রাখুন'
    },
    'আম': {
        N: 100, P: 50, K: 80, S: 20,
        timing: ['বসন্তের শেষে', 'ফল ধরার সময়'],
        organic: '৩-৫ টন গোবর খাদ্য/গাছ',
        notes: 'ক্যালসিয়াম প্রয়োগ করুন'
    },
    'কাঁঠাল': {
        N: 120, P: 60, K: 100, S: 25,
        timing: ['বৃষ্টির শুরুতে', 'ফল ধরার সময়'],
        organic: '৫-৮ টন গোবর খাদ্য/গাছ',
        notes: 'বৃহৎ গাছে বেশি পুষ্টি প্রয়োজন'
    },
    'চা': {
        N: 80, P: 30, K: 40, S: 15,
        timing: ['বসন্তে', 'বর্ষায়', 'শরতে'],
        organic: '২-৩ টন গোবর খাদ্য/একর',
        notes: 'অম্লীয় মাটি পছন্দ করে'
    },
    'কলা': {
        N: 150, P: 60, K: 120, S: 30,
        timing: ['রোপার সময়', 'প্রতি ২ মাস পর'],
        organic: '৩-৪ টন গোবর খাদ্য/একর',
        notes: 'প্রচুর পানি ও পুষ্টি প্রয়োজন'
    },
    'নারিকেল': {
        N: 100, P: 50, K: 100, S: 20,
        timing: ['বর্ষার শুরুতে', 'শুষ্ক মৌসুমে'],
        organic: '১০-১৫ কেজি গোবর খাদ্য/গাছ/বছর',
        notes: 'ক্লোরাইড সহ্যশীল'
    }
};

const SOIL_FERTILIZER_MODIFIER = {
    'দোআঁশ': { modifier: 1.0, note: 'স্বাভাবিক পরিমাণ প্রয়োগ করুন' },
    'এঁটেল': { modifier: 0.9, note: 'কাদাময় মাটিতে সার ধীরে কাজ করে, বিভাজিত প্রয়োগ করুন' },
    'বেলে': { modifier: 1.2, note: 'পানি নিষ্কাশন বেশি হওয়ায় সার বেশি প্রয়োজন' },
    'লাল মাটি': { modifier: 1.1, note: 'অম্লীয় মাটি — চুন প্রয়োগ করুন' },
    'কালু মাটি': { modifier: 1.0, note: 'স্বাভাবিক পরিমাণ প্রয়োগ করুন' },
    'বালুচর': { modifier: 1.3, note: 'লবণাক্ত মাটিতে বেশি সার প্রয়োজন' },
    'কাদাচর': { modifier: 1.1, note: 'পানিতে ডুবে থাকায় সার ক্ষয় বেশি হয়' },
    'পাহাড়ি': { modifier: 1.2, note: 'অম্লীয় ও কম উর্বর — বেশি সার প্রয়োজন' },
    'অলুভিয়াল': { modifier: 0.95, note: 'উর্বর মাটি — সামান্য কম সার যথেষ্ট' }
};

const SEASONAL_ADVICE = {
    'গ্রীষ্ম': {
        name: 'গ্রীষ্ম (মার্চ-জুন)',
        tips: [
            'পানির ব্যবস্থাপনা গুরুত্বপূর্ণ',
            'মাটি ঢেকে রাখুন (মাল্চিং)',
            'রাতের বেলায় সেচ দিন',
            'খরা-সহ্যশীল ফসল নির্বাচন করুন',
            'লবণাক্ত মাটিতে পানি ফ্লাশিং করুন'
        ],
        crops: ['তরমুজ', 'শুক্তা', 'খরমুখী', 'আদা', 'হলুদ']
    },
    'বর্ষা': {
        name: 'বর্ষা (জুন-অক্টোবর)',
        tips: [
            'পানি নিষ্কাশন ব্যবস্থা পরিষ্কার করুন',
            'অতিরিক্ত পানি দূর করুন',
            'পোকামাকড় পরিষ্কার রাখুন',
            'মাটি ক্ষয় রোধ করুন',
            'জৈব পদার্থ বেশি প্রয়োগ করুন'
        ],
        crops: ['ধান', 'জুট', 'পানির শাক', 'লাউ', 'করলা']
    },
    'শরৎ': {
        name: 'শরৎ (অক্টোবর-ডিসেম্বর)',
        tips: [
            'শীতকালীন ফসল রোপণের সময়',
            'মাটি প্রস্তুত করুন',
            'গোবর খাদ্য মিশিয়ে দিন',
            'সেচ ব্যবস্থা চেক করুন',
            'বীজ নির্বাচন শুরু করুন'
        ],
        crops: ['গম', 'সরিষা', 'তিল', 'পেঁয়াজ', 'রসুন']
    },
    'হেমন্ত': {
        name: 'হেমন্ত (ডিসেম্বর-ফেব্রুয়ারি)',
        tips: [
            'শীত সহ্যশীল ফসল রোপণ',
            'পানির প্রয়োজন কম',
            'মাটির আর্দ্রতা বজায় রাখুন',
            'জৈব পদার্থ প্রয়োগ করুন',
            'পরবর্তী মৌসুমের প্রস্তুতি নিন'
        ],
        crops: ['আলু', 'মটরশুটি', 'ডাল', 'শাকসবজি', 'গাজর']
    }
};

function findSoilKey(input) {
    if (!input) return null;
    const normalized = input.trim().toLowerCase();
    for (const key of Object.keys(SOIL_TYPES)) {
        if (key === input.trim() || SOIL_TYPES[key].en.toLowerCase() === normalized) {
            return key;
        }
    }
    return null;
}

function findCropKey(input) {
    if (!input) return null;
    const normalized = input.trim();
    for (const key of Object.keys(FERTILIZER_BASE)) {
        if (key === normalized) return key;
    }
    return null;
}

export const SFSoil = {
    getSoilTypes() {
        const result = {};
        for (const [key, val] of Object.entries(SOIL_TYPES)) {
            result[key] = {
                name: key,
                en: val.en,
                ph: val.ph,
                drainage: val.drainage,
                fertility: val.fertility,
                region: val.region,
                cropCount: val.crops.length
            };
        }
        return result;
    },

    getSoilInfo(soilName) {
        const key = findSoilKey(soilName);
        if (!key) return null;
        return { name: key, ...SOIL_TYPES[key] };
    },

    getSuitableCrops(soilName) {
        const key = findSoilKey(soilName);
        if (!key) return null;
        const soil = SOIL_TYPES[key];
        return {
            soil: key,
            soilEn: soil.en,
            fertility: soil.fertility,
            drainage: soil.drainage,
            crops: soil.crops.map(crop => ({
                name: crop,
                hasFertilizerData: !!FERTILIZER_BASE[crop]
            }))
        };
    },

    getFertilizerRecommendation(soilName, cropName, areaInKatha = 1) {
        const soilKey = findSoilKey(soilName);
        const cropKey = findCropKey(cropName);
        if (!soilKey || !cropKey) {
            return {
                error: true,
                message: !soilKey
                    ? `"${soilName}" সঠিক মাটির ধরন নয়।`
                    : `"${cropName}" ফসলের জন্য সার তালিকা পাওয়া যায়নি।`
            };
        }

        const base = FERTILIZER_BASE[cropKey];
        const modifier = SOIL_FERTILIZER_MODIFIER[soilKey];
        const areaAcre = areaInKatha / 20;
        const m = modifier.modifier;

        const calcN = Math.round(base.N * m * areaAcre);
        const calcP = Math.round(base.P * m * areaAcre);
        const calcK = Math.round(base.K * m * areaAcre);
        const calcS = Math.round(base.S * m * areaAcre);
        const totalFertilizerKg = calcN + calcP + calcK + calcS;

        const dapKg = Math.round(calcP / 0.46);
        const ureaKg = Math.round((calcN - dapKg * 0.46) / 0.46);
        const mopKg = Math.round(calcK / 0.60);
        constypsumKg = Math.round(calcS / 0.18);

        return {
            soil: soilKey,
            crop: cropKey,
            areaKatha: areaInKatha,
            areaAcre: parseFloat(areaAcre.toFixed(3)),
            modifier: m,
            modifierNote: modifier.note,
            nutrients: {
                nitrogen: calcN,
                phosphorus: calcP,
                potassium: calcK,
                sulfur: calcS,
                unit: 'kg'
            },
            fertilizers: {
                dap: { name: 'ডিএপি (১৮-৪৬-০)', kg: Math.max(0, dapKg) },
                urea: { name: 'ইউরিয়া (৪৬-০-০)', kg: Math.max(0, ureaKg) },
                mop: { name: 'এমওপি (০-০-৬০)', kg: Math.max(0, mopKg) },
                gypsum: { name: 'জিপসাম', kg: Math.max(0, gypsumKg) }
            },
            totalFertilizerKg,
            organic: base.organic,
            timing: base.timing,
            notes: base.notes
        };
    },

    getpHAdvice(currentPH, targetPH = 6.5) {
        const ph = parseFloat(currentPH);
        const target = parseFloat(targetPH);

        if (isNaN(ph)) {
            return { error: true, message: 'সঠিক pH মান দিন (যেমন: 5.5, 7.0)' };
        }

        let category;
        if (ph < 5.5) category = 'অম্লীয়';
        else if (ph <= 7.0) category = 'স্বাভাবিক';
        else if (ph <= 8.5) category = 'ক্ষারীয়';
        else category = 'লবণাক্ত';

        const advice = PH_RANGES[category];
        const gap = target - ph;
        let limeNeededKg = 0;

        if (gap > 0) {
            limeNeededKg = Math.round(gap * 500);
        }

        return {
            currentPH: ph,
            targetPH: target,
            category,
            categoryEn: category === 'অম্লীয়' ? 'Acidic' : category === 'স্বাভাবিক' ? 'Normal' : category === 'ক্ষারীয়' ? 'Alkaline' : 'Saline',
            range: advice.range,
            problem: advice.problem,
            solution: advice.fix,
            urgency: advice.urgency,
            suitableCrops: advice.crops,
            limeNeededKgPerAcre: limeNeededKg,
            gap: parseFloat(gap.toFixed(2)),
            recommendation: gap > 0.5
                ? 'চুন প্রয়োগ প্রয়োজন'
                : gap < -0.5
                    ? 'গন্ধক/জিপসাম প্রয়োগ প্রয়োজন'
                    : 'pH স্বাভাবিক পরিসীমায় আছে'
        };
    },

    analyzeSoil(soilType, cropName, area = 1) {
        const soil = this.getSoilInfo(soilType);
        if (!soil) {
            return { error: true, message: `"${soilType}" সঠিক মাটির ধরন নয়।` };
        }

        const suitableCrops = this.getSuitableCrops(soilType);
        const phAdvice = this.getpHAdvice(soil.ph.split('-')[0]);
        const fertRec = this.getFertilizerRecommendation(soilType, cropName, area);

        return {
            soil: {
                name: soil.name,
                en: soil.en,
                ph: soil.ph,
                drainage: soil.drainage,
                fertility: soil.fertility,
                description: soil.description,
                region: soil.region
            },
            crop: cropName,
            suitableCrops: suitableCrops.crops,
            isCropSuitable: soil.crops.includes(cropName),
            phAdvice,
            fertilizer: fertRec,
            overallAdvice: {
                soilHealth: soil.fertility,
                drainageIssue: soil.drainage === 'Poor' || soil.drainage === 'Very Poor',
                needsDrainage: soil.drainage === 'Poor' || soil.drainage === 'Very Poor',
                needsLiming: phAdvice.gap > 0.5,
                needsOrganicMatter: soil.fertility === 'Low' || soil.fertility === 'Very Low'
            }
        };
    },

    getSeasonalAdvice(soilName, season) {
        const soil = this.getSoilInfo(soilName);
        const seasonKey = season;
        const advice = SEASONAL_ADVICE[seasonKey];

        if (!advice) {
            return {
                error: true,
                message: `"${season}" সঠিক মৌসুম নয়। বিকল্প: গ্রীষ্ম, বর্ষা, শরৎ, হেমন্ত`
            };
        }

        const result = {
            season: advice.name,
            soilType: soil ? soil.name : soilName,
            soilEn: soil ? soil.en : 'Unknown',
            tips: [...advice.tips],
            recommendedCrops: advice.crops,
            soilSpecificTips: []
        };

        if (soil) {
            if (soil.drainage === 'Poor' || soil.drainage === 'Very Poor') {
                result.soilSpecificTips.push('পানি নিষ্কাশন ব্যবস্থা শক্তিশালী করুন');
            }
            if (soil.fertility === 'Low' || soil.fertility === 'Very Low') {
                result.soilSpecificTips.push('জৈব পদার্থ বেশি প্রয়োগ করুন');
            }
            if (seasonKey === 'বর্ষা' && soil.drainage === 'Very Poor') {
                result.soilSpecificTips.push('প্লাবন ঝুঁকি বেশি — উচ্চস্থানে ফসল রোপণ বিবেচনা করুন');
            }
            if (seasonKey === 'গ্রীষ্ম' && soil.en === 'Sandy') {
                result.soilSpecificTips.push('বালুকণায় পানি দ্রুত শোষিত হয় — ঘন ঘন সেচ দিন');
            }
        }

        return result;
    },

    generateReport(soilType, cropName, area = 1) {
        const soil = this.getSoilInfo(soilType);
        if (!soil) {
            return { error: true, message: `"${soilType}" সঠিক মাটির ধরন নয়।` };
        }

        const fertRec = this.getFertilizerRecommendation(soilType, cropName, area);
        const phAdvice = this.getpHAdvice(soil.ph.split('-')[0]);
        const suitableCrops = this.getSuitableCrops(soilType);

        const currentMonth = new Date().getMonth();
        let currentSeason;
        if (currentMonth >= 2 && currentMonth <= 5) currentSeason = 'গ্রীষ্ম';
        else if (currentMonth >= 5 && currentMonth <= 9) currentSeason = 'বর্ষা';
        else if (currentMonth >= 9 && currentMonth <= 11) currentSeason = 'শরৎ';
        else currentSeason = 'হেমন্ত';

        const seasonalAdvice = this.getSeasonalAdvice(soilType, currentSeason);

        return {
            reportTitle: 'মাটি বিশ্লেষণ ও সার সুপারিশ রিপোর্ট',
            generatedAt: new Date().toLocaleString('bn-BD'),
            soil: {
                name: soil.name,
                en: soil.en,
                ph: soil.ph,
                drainage: soil.drainage,
                fertility: soil.fertility,
                description: soil.description,
                region: soil.region,
                color: soil.color
            },
            crop: cropName,
            area: {
                katha: area,
                acre: parseFloat((area / 20).toFixed(3))
            },
            isCropSuitable: soil.crops.includes(cropName),
            alternativeCrops: soil.crops.filter(c => c !== cropName).slice(0, 5),
            soilHealth: {
                fertility: soil.fertility,
                drainage: soil.drainage,
                phStatus: phAdvice.category,
                overallRating: soil.fertility === 'High' || soil.fertility === 'Very High'
                    ? 'ভালো'
                    : soil.fertility === 'Medium'
                        ? 'মাঝারি'
                        : 'দুর্বল'
            },
            fertilizerPlan: fertRec.error ? null : {
                nutrients: fertRec.nutrients,
                fertilizers: fertRec.fertilizers,
                totalFertilizerKg: fertRec.totalFertilizerKg,
                organic: fertRec.organic,
                timing: fertRec.timing,
                notes: fertRec.notes,
                modifierNote: fertRec.modifierNote
            },
            phAdvice: {
                current: phAdvice.currentPH,
                range: phAdvice.range,
                category: phAdvice.category,
                problem: phAdvice.problem,
                solution: phAdvice.solution,
                limeNeededKgPerAcre: phAdvice.limeNeededKgPerAcre,
                recommendation: phAdvice.recommendation
            },
            seasonalAdvice,
            recommendations: {
                immediate: [],
                shortTerm: [],
                longTerm: []
            }
        };
    }
};
