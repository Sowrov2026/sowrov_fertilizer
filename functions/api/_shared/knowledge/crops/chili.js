export default [
    {
        id: 'chi-001',
        name: 'Chili',
        scientific_name: 'Capsicum annuum',
        local_names: { bangla: 'মরিচ', chatgaiya: 'মরিচ', english: 'Chili' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'সেপ্টেম্বর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 18, max: 35, optimal: 25, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' },
            { stage: '৩০-৩৫ দিন (ফুল ফোটা)', fertilizer: 'ইউরিয়া + ডিএপি', amount: '২৫ কেজি + ২০ কেজি/একর' },
            { stage: '৫০-৬০ দিন (ফল ধরা)', fertilizer: 'কেসিএ + এমওপি', amount: '২০ কেজি + ১৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার', 'নিম খাদ্য'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['ডাচ ওয়িল্ট', 'অ্যানথ্রাকনোজ', 'সিরকোস্পোরিয়া লিফ স্পট', 'ভাইরাস মোজাইক', 'পাউডারি মিলডিউ'],
        insects: ['এফিড', 'থ্রিপস', 'হোয়াইটফ্লাই', 'ফ্রুট বোরার', 'কাট ওয়ার্ম'],
        yield: { per_plant: '০.৫-১ কেজি', per_acre: '৪-৮ টন', harvest_days: '৭০-৯০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'লাল বর্ণ পরিপক্ব', storage: '১০-১২°C তাপমাত্রায় শুকনো জায়গায়' },
        tips: ['উন্নত জাত ব্যবহার করুন (BARI মরিচ-২, ৩)', '২০-২৫ সেমি দূরত্বে রোপণ', 'নিয়মিত সেচ ও নিষ্কাশন', 'পাতায় পানি লাগানো এড়িয়ে চলুন'],
        common_questions: [
            { q: 'মরিচে কোন সার দেবো?', a: 'কমপোস্ট ৪-৬ টন/একর, ইউরিয়া ৭০-৮০ কেজি/একর, ডিএপি ৪০-৫০ কেজি/একর' },
            { q: 'মরিচে ডাচ ওয়িল্ট রোগ কীভাবে বন্ধ করবো?', a: 'জল নিষ্কাশন ভালো করুন। আক্রান্ত গাছ তুলে ফেলুন। ফসল পরিবর্তন করুন।' },
            { q: 'মরিচ কখন তুলবো?', a: 'লাল বর্ণ হলে তুলুন। সাধারণত ফুল ফোটার ৭০-৯০ দিন পর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'chi-002',
        name: 'Chili (Disease Guide)',
        scientific_name: 'Capsicum annuum',
        local_names: { bangla: 'মরিচ', chatgaiya: 'মরিচ', english: 'Chili' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'সেপ্টেম্বর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 18, max: 35, optimal: 25, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' },
            { stage: '৩০-৩৫ দিন', fertilizer: 'ইউরিয়া + ডিএপি', amount: '২৫ কেজি + ২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['ডাচ ওয়িল্ট', 'অ্যানথ্রাকনোজ', 'সিরকোস্পোরিয়া লিফ স্পট', 'ভাইরাস মোজাইক'],
        insects: ['এফিড', 'থ্রিপস', 'হোয়াইটফ্লাই'],
        yield: { per_plant: '০.৫-১ কেজি', per_acre: '৪-৮ টন', harvest_days: '৭০-৯০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'লাল বর্ণ', storage: 'শুকনো জায়গায়' },
        tips: ['আক্রান্ত গাছ তুলে ফেলুন', 'ভালো জল নিষ্কাশন রাখুন', 'ফসল পরিবর্তন করুন'],
        common_questions: [
            { q: 'মরিচে ডাচ ওয়িল্ট কী?', a: 'গাছ হঠাৎ ঝরে পড়ে। কাণ্ডের ভেতরে বাদামি বর্ণ থাকে। ব্যাকটেরিয়ায় হয়।' },
            { q: 'মরিচে ভাইরাস মোজাইক কীভাবে বন্ধ করবো?', a: 'ভাইরাস প্রতিরোধী জাত ব্যবহার করুন। এফিড নিয়ন্ত্রণ করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'chi-003',
        name: 'Chili (Organic Farming)',
        scientific_name: 'Capsicum annuum',
        local_names: { bangla: 'মরিচ', chatgaiya: 'মরিচ', english: 'Chili' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'সেপ্টেম্বর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 18, max: 35, optimal: 25, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'ভার্মিকমপোস্ট', amount: '৫-৭ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'জীবাণুমুক্ত গোবর', amount: '৫০০ কেজি/একর' },
            { stage: '৩০-৩৫ দিন', fertilizer: 'নিম খাদ্য', amount: '১০০ কেজি/একর' },
            { stage: '৫০-৬০ দিন', fertilizer: 'পঞ্চগব্য', amount: '১০ লিটার/একর' }
        ],
        organic_fertilizer: ['ভার্মিকমপোস্ট', 'জীবাণুমুক্ত গোবর', 'নিম খাদ্য', 'পঞ্চগব্য'],
        chemical_fertilizer: [],
        diseases: ['ডাচ ওয়িল্ট', 'অ্যানথ্রাকনোজ'],
        insects: ['এফিড', 'থ্রিপস', 'হোয়াইটফ্লাই'],
        yield: { per_plant: '০.৩-০.৮ কেজি', per_acre: '৩-৬ টন', harvest_days: '৭৫-৯৫ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'লাল বর্ণ', storage: 'শুকনো জায়গায়' },
        tips: ['জৈব চাষে রোগ প্রতিরোধ গুরুত্বপূর্ণ', 'নিম তেল স্প্রে করুন', 'প্রাকৃতিক শত্রু সংরক্ষণ'],
        common_questions: [
            { q: 'জৈব পদ্ধতিতে মরিচ চাষ কীভাবে করবো?', a: 'ভার্মিকমপোস্ট ৫-৭ টন/একর দিন। নিম তেল স্প্রে করুন। পঞ্চগব্য ব্যবহার করুন।' },
            { q: 'জৈব চাষে পোকা নিয়ন্ত্রণ কীভাবে?', a: 'নিম তেল ৫ মিলি/লিটার স্প্রে। স্টিকি ট্র্যাপ ব্যবহার। প্রাকৃতিক শত্রু সংরক্ষণ।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
