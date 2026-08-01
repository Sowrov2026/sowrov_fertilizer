const STORAGE_KEY = 'sf_ai_memory';
const AUTO_SAVE_INTERVAL = 30000;

const MEMORY_SCHEMA = {
    profile: {
        name: null,
        district: null,
        upazila: null,
        village: null,
        farmSize: null,
        farmSizeUnit: 'বিঘা',
        landType: null,
    },
    preferences: {
        language: 'bangla',
        dialect: null,
        favoriteCrops: [],
        preferredProducts: [],
    },
    history: {
        crops: [],
        diseases: [],
        questions: [],
        purchases: [],
    },
    context: {
        lastConversation: null,
        lastCrop: null,
        lastDisease: null,
        lastLocation: null,
        conversationCount: 0,
        lastVisit: null,
    },
};

const DISTRICTS = [
    'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ',
    'কুমিল্লা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'যশোর', 'বগুড়া', 'দিনাজপুর', 'কক্সবাজার',
    'মাদারীপুর', 'ফরিদপুর', 'জামালপুর', 'লক্ষ্মীপুর', 'নোয়াখালী', 'ব্রাহ্মণবাড়িয়া',
    'চাঁদপুর', 'হবিগঞ্জ', 'মৌলভীবাজার', 'কিশোরগঞ্জ', 'নেত্রকোণা', 'শেরপুর', 'টাঙ্গাইল',
    'মানিকগঞ্জ', 'রাজবাড়ী', 'গোপালগঞ্জ', 'ভোলা', 'পটুয়াখালী', 'পিরোজপুর', 'বরগুনা',
    'সাতক্ষীরা', 'বাগেরহাট', 'নড়াইল', 'কুষ্টিয়া', 'মেহেরপুর', 'চুয়াডাঙ্গা', 'ঝিনাইদহ',
    'সিরাজগঞ্জ', 'পাবনা', 'নওগাঁ', 'চাঁপাইনবাবগঞ্জ', 'জয়পুরহাট', 'লালমনিরহাট',
    'নীলফামারী', 'কুড়িগ্রাম', 'গাইবান্ধা', 'ঠাকুরগাঁও', 'পঞ্চগড়', 'বান্দরবান',
    'রাঙ্গামাটি', 'খাগড়াছড়ি', 'ফেনী'
];

const CROPS = [
    'ধান', 'গম', 'ভুট্টা', 'পাট', 'তুলা', 'সরিষা', 'আলু', 'মিষ্টি আলু',
    'পেঁয়াজ', 'রসুন', 'মরিচ', 'বেগুন', 'টমেটো', 'শাকসবজি', 'পাকড়', 'ঢেঁড়স',
    'করলা', 'কুমড়া', 'লাউ', 'শিম', 'মটরশুটি', 'সয়াবিন', 'মুগ',
    'কলাই', 'চিনাবাদাম', 'সূর্যমুখী', 'আম', 'কাঁঠাল', 'পেঁপে', 'পেয়ারা',
    'জাম', 'তাল', 'নারিকেল', 'লেবু', 'কমলা', 'বাতাবি', 'ডুরিয়ান', 'জ্যাকফ্রুট',
    'ধনিয়া', 'জিরা', 'হলুদ', 'আদা', 'লঙ্কা', 'জলপাই', 'বাঁধাকপি', 'ফুলকপি',
    'পুঁই', 'কচু', 'কইল', 'পানির শাক', 'পুদিনা', 'ধুন্দুল', 'কাউল', 'সেম',
    'মাস', 'বরকল', 'কালাবাইঞ্জি', 'রাতালু', 'নারকেল', 'তিল'
];

const DISEASES = [
    'পাতার ঝলসানি', 'বাদামী পাতা', 'সাদা মাখি', 'লাল মাকি', 'কীটপতঙ্গ',
    'পোকা মাকড়', 'ছত্রাক রোগ', 'ব্যাকটেরিয়া রোগ', 'ভাইরাস রোগ',
    'নেমাটোড', 'মৃত্তিকা জনিত রোগ', 'বীজ জনিত রোগ', 'পুষ্প ঝরে যাওয়া',
    'ফল ঝরে যাওয়া', 'পাতা হলুদ হওয়া', 'গাছ শুকিয়ে যাওয়া',
    'মূল পচন', 'কাণ্ড পচন', 'দাগ পড়া', 'মরুচ্ছে', 'আগাছা',
    'গাংরু', 'মাছি', 'লাল পোকা', 'কালো পোকা', 'সেদ্ধ পোকা',
    'ফর্মালডিহাইড', 'রাসায়নিক দাগ', 'সারের অভাব', 'পানির অভাব'
];

const LAND_TYPES = [
    'পলি মাটি', 'কালো মাটি', 'লাল মাটি', 'বালু মাটি', 'দোআঁশ মাটি',
    'চিকন মাটি', 'ম্যাট মাটি', 'জলোচ্ছ্বাস মাটি', 'পাহাড়ি মাটি',
    'জলাভূমি', 'পুরাতন বনভূমি', 'নতুন বনভূমি', 'ম্যানগ্রোভ'
];

let memory = null;
let autoSaveTimer = null;

function createDefaultMemory() {
    return JSON.parse(JSON.stringify(MEMORY_SCHEMA));
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            } else if (source[key] !== undefined) {
                result[key] = source[key];
            }
        }
    }
    return result;
}

function getByPath(obj, path) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
        if (current === null || current === undefined) return undefined;
        current = current[key];
    }
    return current;
}

function setByPath(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
}

function isUniqueInHistory(history, type, item) {
    if (!Array.isArray(history[type])) return true;
    const normalized = item.toLowerCase().trim();
    return !history[type].some(
        (existing) => existing.toLowerCase().trim() === normalized
    );
}

function normalizeCropName(text) {
    const cropMap = {
        'rice': 'ধান', 'paddy': 'ধান', 'dhan': 'ধান',
        'wheat': 'গম', 'gom': 'গম',
        'corn': 'ভুট্টা', 'maize': 'ভুট্টা', 'bhutta': 'ভুট্টা',
        'jute': 'পাট', 'pat': 'পাট', 'paat': 'পাট',
        'cotton': 'তুলা', 'tula': 'তুলা', 'tulaa': 'তুলা',
        'mustard': 'সরিষা', 'shorisha': 'সরিষা', 'shorshe': 'সরিষা',
        'potato': 'আলু', 'aaloo': 'আলু', 'alu': 'আলু',
        'onion': 'পেঁয়াজ', 'peyaj': 'পেঁয়াজ', 'piyaj': 'পেঁয়াজ',
        'garlic': 'রসুন', 'roshun': 'রসুন', 'rasun': 'রসুন',
        'chili': 'মরিচ', 'morich': 'মরিচ', 'mirch': 'মরিচ',
        'tomato': 'টমেটো', 'tomota': 'টমেটো', 'tmat': 'টমেটো',
        'brinjal': 'বেগুন', 'begun': 'বেগুন',
        'pumpkin': 'কুমড়া', 'kumra': 'কুমড়া',
        'gourd': 'লাউ', 'lau': 'লাউ',
        'okra': 'ঢেঁড়স', 'dhendosh': 'ঢেঁড়স',
        'bitter gourd': 'করলা', 'korla': 'করলা',
        'cucumber': 'শিম', 'shim': 'শিম',
        'mango': 'আম', 'aam': 'আম',
        'jackfruit': 'কাঁঠাল', 'kathal': 'কাঁঠাল', 'kathal': 'কাঁঠাল',
        'banana': 'কলা', 'kola': 'কলা',
        'guava': 'পেয়ারা', 'peyara': 'পেয়ারা',
        'orange': 'কমলা', 'komla': 'কমলা', 'kamla': 'কমলা',
        'lemon': 'লেবু', 'lebu': 'লেবু',
        'coconut': 'নারিকেল', 'narikel': 'নারিকেল',
        'soybean': 'সয়াবিন', 'soyabean': 'সয়াবিন',
        'mung': 'মুগ', 'mung bean': 'মুগ',
        'lentil': 'মসুর', 'masoor': 'মসুর',
        'chickpea': 'ছোলা', 'chola': 'ছোলা',
        'peanut': 'চিনাবাদাম', 'chinabadam': 'চিনাবাদাম',
        'sunflower': 'সূর্যমুখী', 'surjamukhi': 'সূর্যমুখী',
        'papaya': 'পেঁপে', 'pepe': 'পেঁপে',
        'pineapple': 'আনারস', 'anaras': 'আনারস',
        'watermelon': 'তরমুজ', 'tormuj': 'তরমুজ',
        'spinach': 'পালং শাক', 'palong': 'পালং শাক',
        'cabbage': 'বাঁধাকপি', 'bandhakopi': 'বাঁধাকপি',
        'cauliflower': 'ফুলকপি', 'phulkopi': 'ফুলকপি',
        'radish': 'মূলা', 'mula': 'মূলা',
        'carrot': 'গাজর', 'gajor': 'গাজর',
        'bean': 'শিম', 'sheem': 'শিম',
        'peas': 'মটরশুটি', 'motorshuti': 'মটরশুটি',
        'turmeric': 'হলুদ', 'holud': 'হলুদ',
        'ginger': 'আদা', 'ada': 'আদা',
        'coriander': 'ধনিয়া', 'dhonia': 'ধনিয়া',
        'cumin': 'জিরা', 'jira': 'জিরা',
        'sesame': 'তিল', 'til': 'তিল',
    };
    const normalized = text.toLowerCase().trim();
    return cropMap[normalized] || text;
}

export const SFMemory = {
    init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                memory = deepMerge(createDefaultMemory(), JSON.parse(saved));
            } catch {
                memory = createDefaultMemory();
            }
        } else {
            memory = createDefaultMemory();
        }
        memory.context.conversationCount++;
        memory.context.lastVisit = new Date().toISOString();
        this._save();
        this.startAutoSave();
        return this;
    },

    getAll() {
        if (!memory) this.init();
        return JSON.parse(JSON.stringify(memory));
    },

    get(path) {
        if (!memory) this.init();
        return getByPath(memory, path);
    },

    set(path, value) {
        if (!memory) this.init();
        setByPath(memory, path, value);
        this._save();
    },

    updateProfile(data) {
        if (!memory) this.init();
        for (const key in data) {
            if (data.hasOwnProperty(key) && memory.profile.hasOwnProperty(key)) {
                memory.profile[key] = data[key];
            }
        }
        this._save();
    },

    addToHistory(type, item) {
        if (!memory) this.init();
        if (!item || typeof item !== 'string') return;
        if (!memory.history[type]) return;
        if (!Array.isArray(memory.history[type])) {
            memory.history[type] = [];
        }
        const trimmed = item.trim();
        if (trimmed && isUniqueInHistory(memory.history, type, trimmed)) {
            memory.history[type].push(trimmed);
            if (memory.history[type].length > 100) {
                memory.history[type] = memory.history[type].slice(-100);
            }
        }
        this._save();
    },

    extractInfo(text) {
        if (!text) return [];
        const extracted = [];

        const nameResult = this.extractName(text);
        if (nameResult) {
            this.set('profile.name', nameResult);
            extracted.push({ type: 'name', value: nameResult });
        }

        const locationResults = this.extractLocation(text);
        for (const loc of locationResults) {
            extracted.push(loc);
        }

        const cropResult = this.extractCrop(text);
        if (cropResult) {
            this.addToHistory('crops', cropResult);
            this.set('context.lastCrop', cropResult);
            extracted.push({ type: 'crop', value: cropResult });
        }

        const farmSizeResult = this.extractFarmSize(text);
        if (farmSizeResult) {
            this.set('profile.farmSize', farmSizeResult.size);
            if (farmSizeResult.unit) {
                this.set('profile.farmSizeUnit', farmSizeResult.unit);
            }
            extracted.push({ type: 'farmSize', value: farmSizeResult.size });
        }

        const landTypeResult = this.extractLandType(text);
        if (landTypeResult) {
            this.set('profile.landType', landTypeResult);
            extracted.push({ type: 'landType', value: landTypeResult });
        }

        this._save();
        return extracted;
    },

    extractName(text) {
        const patterns = [
            /আমার\s*(?:নাম|নাম\s*হলো|নাম\s*হয়)\s*([আ-ৰA-Za-z\s]{2,30})/i,
            /(?:আমি|মি|মুই)\s*([আ-ৰA-Za-z\s]{2,30})(?:\s*বলছি|\s*কথা বলছি|\s*হিসেবে)/i,
            /(?:name\s*is|i['']?m|i\s*am)\s*([A-Za-z\s]{2,30})/i,
            /(?:আমাকে|আমার\s*সাথে)\s*([আ-ৰA-Za-z\s]{2,30})\s*বলো/i,
            /(?:নাম)\s*[:=]?\s*([আ-ৰA-Za-z\s]{2,30})/i,
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const name = match[1].trim();
                if (name.length >= 2 && name.length <= 30) {
                    const banglaNamePattern = /^[আ-ৰA-Za-z\s.]+$/;
                    if (banglaNamePattern.test(name)) {
                        return name;
                    }
                }
            }
        }

        return null;
    },

    extractLocation(text) {
        const results = [];

        const districtPatterns = [
            /(?:জেলা|district|জেলায়|জেলা\s*থেকে|জেলা\s*বাসি)\s*[:=]?\s*([^\n]{3,30})/i,
            /([^\n]{3,30})\s*(?:জেলা|district)/i,
        ];

        for (const pattern of districtPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const district = match[1].trim();
                const foundDistrict = DISTRICTS.find(
                    (d) => d === district || d.includes(district) || district.includes(d)
                );
                if (foundDistrict) {
                    this.set('profile.district', foundDistrict);
                    results.push({ type: 'district', value: foundDistrict });
                    break;
                }
            }
        }

        const upazilaPattern = /(?:উপজেলা|upazila|সাবডিভিশন)\s*[:=]?\s*([^\n]{3,30})/i;
        const upazilaMatch = text.match(upazilaPattern);
        if (upazilaMatch && upazilaMatch[1]) {
            const upazila = upazilaMatch[1].trim();
            this.set('profile.upazila', upazila);
            results.push({ type: 'upazila', value: upazila });
        }

        const villagePattern = /(?:গ্রাম|village|মৌজা)\s*[:=]?\s*([^\n]{3,40})/i;
        const villageMatch = text.match(villagePattern);
        if (villageMatch && villageMatch[1]) {
            const village = villageMatch[1].trim();
            this.set('profile.village', village);
            results.push({ type: 'village', value: village });
        }

        if (results.length > 0) {
            this.set(
                'context.lastLocation',
                results.map((r) => r.value).join(', ')
            );
        }

        return results;
    },

    extractCrop(text) {
        const normalizedText = text.toLowerCase();

        for (const crop of CROPS) {
            if (normalizedText.includes(crop.toLowerCase())) {
                return crop;
            }
        }

        const englishPatterns = [
            /(?:grow|growing|cultivating|farming|planting|cropped|crop)\s+(\w+)/gi,
            /(\w+)\s+(?:farm|crop|field|garden|plant|grow|cultivat)/gi,
        ];

        for (const pattern of englishPatterns) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                const cropName = normalizeCropName(match[1]);
                if (cropName && cropName !== match[1].toLowerCase()) {
                    return cropName;
                }
            }
        }

        const banglishPatterns = [
            /(?:ami|amra|ami\s+ta)\s+(\w+)\s+(?:lagabo|lagacchi|lagchi|lagaisi|lagaisen)/i,
            /(\w+)\s+(?:lagabo|lagacchi|lagchi|lagaisi|lagaisen|lagan)/i,
        ];

        for (const pattern of banglishPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const cropName = normalizeCropName(match[1]);
                if (cropName) return cropName;
            }
        }

        return null;
    },

    extractFarmSize(text) {
        const patterns = [
            /(\d+(?:\.\d+)?)\s*(?:বিঘা|bigha|বিঘায়|বিঘা\s*জমি)/i,
            /(\d+(?:\.\d+)?)\s*(acre|একর)/i,
            /(\d+(?:\.\d+)?)\s*(hectare|হেক্টর)/i,
            /(\d+(?:\.\d+)?)\s*(কানি|kanee|কানিতে)/i,
            /(\d+(?:\.\d+)?)\s*(শতক|shotok)/i,
            /(?:জমি|land|farm|খেত)\s*(?:আছে| ache|ase)?\s*(\d+(?:\.\d+)?)\s*(বিঘা|bigha|acre|একর|hectare|হেক্টর|কানি|kanee)/i,
            /(?:আমার|আমি)\s*(\d+(?:\.\d+)?)\s*(বিঘা|bigha|acre|একর|hectare|হেক্টর|কানি|kanee)/i,
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const size = parseFloat(match[1]);
                let unit = 'বিঘা';

                if (match[2]) {
                    const unitStr = match[2].toLowerCase();
                    if (unitStr.includes('acre') || unitStr.includes('একর')) {
                        unit = 'একর';
                    } else if (unitStr.includes('hectare') || unitStr.includes('হেক্টর')) {
                        unit = 'হেক্টর';
                    } else if (unitStr.includes('কানি')) {
                        unit = 'কানি';
                    } else if (unitStr.includes('শতক')) {
                        unit = 'শতক';
                    }
                }

                if (size > 0 && size < 10000) {
                    return { size, unit };
                }
            }
        }

        return null;
    },

    extractLandType(text) {
        const normalizedText = text.toLowerCase();
        for (const landType of LAND_TYPES) {
            if (normalizedText.includes(landType.toLowerCase())) {
                return landType;
            }
        }
        return null;
    },

    getGreeting() {
        if (!memory) this.init();
        const name = memory.profile.name;
        const hour = new Date().getHours();
        let timeGreeting = '';

        if (hour >= 4 && hour < 12) {
            timeGreeting = 'সুপ্রভাত';
        } else if (hour >= 12 && hour < 17) {
            timeGreeting = 'শুভ অপরাহ্ন';
        } else if (hour >= 17 && hour < 20) {
            timeGreeting = 'শুভ সন্ধ্যা';
        } else {
            timeGreeting = 'শুভ রাত্রি';
        }

        if (name) {
            return `${timeGreeting}, ${name} ভাই! 🌾`;
        }

        const greetings = [
            `${timeGreeting}! 🌾 আমি SF AI সহকারী। কেমন আছেন?`,
            `${timeGreeting}! 🌾 কৃষি পরামর্শে স্বাগতম। আপনার নাম কী?`,
            `${timeGreeting}! 🌾 আমাকে আপনার পরিচয় দিন। আমি আপনাকে কীভাবে সাহায্য করতে পারি?`,
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    },

    getContextPrompt() {
        if (!memory) this.init();

        const parts = [];
        const p = memory.profile;

        if (p.name || p.district || p.upazila || p.village) {
            const location = [p.village, p.upazila, p.district]
                .filter(Boolean)
                .join(', ');
            parts.push(
                `ব্যবহারকারী: ${p.name || 'অজ্ঞাত'}, অবস্থান: ${location || 'অজ্ঞাত'}`
            );
        }

        if (p.farmSize) {
            parts.push(`জমির পরিমাণ: ${p.farmSize} ${p.farmSizeUnit}`);
        }
        if (p.landType) {
            parts.push(`মাটির ধরন: ${p.landType}`);
        }

        const h = memory.history;
        if (h.crops && h.crops.length > 0) {
            parts.push(`আগের ফসল: ${h.crops.slice(-5).join(', ')}`);
        }
        if (h.diseases && h.diseases.length > 0) {
            parts.push(`আগের সমস্যা: ${h.diseases.slice(-3).join(', ')}`);
        }
        if (h.questions && h.questions.length > 0) {
            parts.push(`আগের প্রশ্ন: ${h.questions.slice(-3).join('; ')}`);
        }

        const c = memory.context;
        if (c.lastCrop) {
            parts.push(`সর্বশেষ ফসল: ${c.lastCrop}`);
        }
        if (c.lastDisease) {
            parts.push(`সর্বশেষ সমস্যা: ${c.lastDisease}`);
        }
        if (c.conversationCount > 1) {
            parts.push(`আলোচনার সংখ্যা: ${c.conversationCount}`);
        }

        if (parts.length === 0) return '';

        return `[ব্যবহারকারীর মনের তথ্য: ${parts.join('; ')}]`;
    },

    getStats() {
        if (!memory) this.init();

        const fieldsSet = Object.values(memory.profile).filter(
            (v) => v !== null && v !== undefined
        ).length;
        const totalFields = Object.keys(memory.profile).length;

        return {
            profileCompleteness: Math.round((fieldsSet / totalFields) * 100),
            totalConversations: memory.context.conversationCount,
            cropsCount: memory.history.crops.length,
            diseasesCount: memory.history.diseases.length,
            questionsCount: memory.history.questions.length,
            purchasesCount: memory.history.purchases.length,
            lastVisit: memory.context.lastVisit,
            hasLocation: !!(memory.profile.district || memory.profile.upazila),
            hasName: !!memory.profile.name,
        };
    },

    clearAll() {
        memory = createDefaultMemory();
        this._save();
    },

    exportMemory() {
        if (!memory) this.init();
        return JSON.stringify(memory, null, 2);
    },

    importMemory(json) {
        try {
            const data = typeof json === 'string' ? JSON.parse(json) : json;
            memory = deepMerge(createDefaultMemory(), data);
            this._save();
            return true;
        } catch {
            return false;
        }
    },

    startAutoSave() {
        if (autoSaveTimer) clearInterval(autoSaveTimer);
        autoSaveTimer = setInterval(() => {
            this._save();
        }, AUTO_SAVE_INTERVAL);
    },

    stopAutoSave() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
            autoSaveTimer = null;
        }
    },

    _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
        } catch (e) {
            console.error('মেমরি সংরক্ষণে সমস্যা:', e);
        }
    },

    autoSave() {
        this._save();
    },
};
