module.exports = [
    {
        id: 'jac-001',
        name: 'Jackfruit',
        scientific_name: 'Artocarpus heterophyllus',
        local_names: { bangla: 'কাঁঠাল', chatgaiya: 'কাঁঠাল', english: 'Jackfruit' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'ফেব্রুয়ারি-জুন (ফুল ফোটা), মে-আগস্ট (ফল)' },
        soil: { type: 'দোআঁশ বা বালুআঁশ', pH: '6.0-7.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 40, optimal: 28, unit: '°C' },
        watering: { frequency: 'সপ্তাহে ১-২ বার', method: 'পরিবাহী সেচ', amount: 'গাছের বয়স অনুযায়ী ৫০-২০০ লিটার' },
        fertilizer_schedule: [
            { stage: 'ফুল ফোটার আগে', fertilizer: 'ইউরিয়া', amount: '০.৫-১ কেজি/গাছ' },
            { stage: 'ফল ধরার পর', fertilizer: 'ইউরিয়া + কেসিএ', amount: '০.৫ কেজি + ০.৫ কেজি/গাছ' },
            { stage: 'ফল তোলার পর', fertilizer: 'কমপোস্ট', amount: '১০-১৫ কেজি/গাছ' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার', 'ভার্মিকমপোস্ট', 'ইঁদুনের ছাই'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['স্টেম ক্যানকার', 'অ্যানথ্রাকনোজ', 'সোর্ট রট', 'পাউডারি মিলডিউ'],
        insects: ['কাঁঠাল বোরার', 'মিট', 'এফিড', 'থ্রিপস', 'ম্যাংগো ফ্রুট ফ্লাই'],
        yield: { per_plant: '১০০-২০০ কেজি/গাছ', per_acre: '১৫-২৫ টন (বয়স্ক গাছ)', harvest_days: 'ফুল ফোটার ১২০-১৫০ দিন পর' },
        harvest: { method: 'হাতে কাটা', indicators: 'কাঁটা নরম, সোনালী বর্ণ, গন্ধ', storage: '১২-১৪°C তাপমাত্রায় ৩-৫ দিন' },
        tips: ['৮-১০ মিটার দূরত্বে রোপণ', '৫-৬ বছর বয়স থেকে ফল দেয়', 'গাছের চারপাশ পরিষ্কার রাখুন', 'অতিরিক্ত ফল ঝরে দিন'],
        common_questions: [
            { q: 'কাঁঠাল গাছে কোন সার দেবো?', a: 'কমপোস্ট ১০-১৫ কেজি/গাছ, ইউরিয়া ০.৫-১ কেজি/গাছ, কেসিএ ০.৫-১ কেজি/গাছ। ফুল ফোটার আগে দিন।' },
            { q: 'কাঁঠালে স্টেম ক্যানকার রোগ কীভাবে বন্ধ করবো?', a: 'কপার অক্সিক্লোরাইড ৩ গ্রাম/লিটার স্প্রে। আক্রান্ত কাণ্ড কেটে ফেলুন।' },
            { q: 'কাঁঠাল গাছ কখন ফল দেবে?', a: 'বীজ থেকে ৫-৭ বছরে, কলম থেকে ৩-৪ বছরে। ফলের মৌসুম মে-আগস্ট।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'jac-002',
        name: 'Jackfruit (Disease Guide)',
        scientific_name: 'Artocarpus heterophyllus',
        local_names: { bangla: 'কাঁঠাল', chatgaiya: 'কাঁঠাল', english: 'Jackfruit' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'ফেব্রুয়ারি-আগস্ট' },
        soil: { type: 'দোআঁশ বা বালুআঁশ', pH: '6.0-7.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 40, optimal: 28, unit: '°C' },
        watering: { frequency: 'সপ্তাহে ১-২ বার', method: 'পরিবাহী সেচ', amount: '৫০-২০০ লিটার/গাছ' },
        fertilizer_schedule: [
            { stage: 'ফুল ফোটার আগে', fertilizer: 'ইউরিয়া', amount: '০.৫-১ কেজি/গাছ' },
            { stage: 'ফল ধরার পর', fertilizer: 'ইউরিয়া + কেসিএ', amount: '০.৫ কেজি + ০.৫ কেজি/গাছ' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['স্টেম ক্যানকার', 'অ্যানথ্রাকনোজ', 'সোর্ট রট'],
        insects: ['কাঁঠাল বোরার', 'মিট', 'এফিড'],
        yield: { per_plant: '১০০-২০০ কেজি/গাছ', per_acre: '১৫-২৫ টন', harvest_days: '১২০-১৫০ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'কাঁটা নরম, সোনালী বর্ণ', storage: '১২-১৪°C' },
        tips: ['আক্রান্ত কাণ্ড কেটে ফেলুন', 'গাছের চারপাশ পরিষ্কার রাখুন', 'ভালো নিষ্কাশন রাখুন'],
        common_questions: [
            { q: 'কাঁঠালে স্টেম ক্যানকার কী?', a: 'কাণ্ডে কালো দাগ তৈরি হয়। কাণ্ড শুকিয়ে যায়। ফাংগাসে হয়।' },
            { q: 'কাঁঠালে কাঁঠাল বোরার কীভাবে বন্ধ করবো?', a: 'আক্রান্ত ফল তুলে ফেলুন। ফেরোমন ট্র্যাপ ব্যবহার করুন। নিম তেল স্প্রে করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'jac-003',
        name: 'Jackfruit (Organic Farming)',
        scientific_name: 'Artocarpus heterophyllus',
        local_names: { bangla: 'কাঁঠাল', chatgaiya: 'কাঁঠাল', english: 'Jackfruit' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'ফেব্রুয়ারি-আগস্ট' },
        soil: { type: 'দোআঁশ বা বালুআঁশ', pH: '6.0-7.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 40, optimal: 28, unit: '°C' },
        watering: { frequency: 'সপ্তাহে ১-২ বার', method: 'পরিবাহী সেচ', amount: '৫০-২০০ লিটার/গাছ' },
        fertilizer_schedule: [
            { stage: 'ফুল ফোটার আগে', fertilizer: 'ভার্মিকমপোস্ট', amount: '১৫-২০ কেজি/গাছ' },
            { stage: 'ফল ধরার পর', fertilizer: 'জীবাণুমুক্ত গোবর', amount: '১০-১৫ কেজি/গাছ' },
            { stage: 'ফল তোলার পর', fertilizer: 'পঞ্চগব্য', amount: '৫ লিটার/গাছ' }
        ],
        organic_fertilizer: ['ভার্মিকমপোস্ট', 'জীবাণুমুক্ত গোবর', 'পঞ্চগব্য', 'ইঁদুনের ছাই'],
        chemical_fertilizer: [],
        diseases: ['স্টেম ক্যানকার', 'অ্যানথ্রাকনোজ'],
        insects: ['কাঁঠাল বোরার', 'মিট'],
        yield: { per_plant: '৮০-১৫০ কেজি/গাছ', per_acre: '১২-২০ টন', harvest_days: '১২০-১৫০ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'কাঁটা নরম, সোনালী বর্ণ', storage: '১২-১৪°C' },
        tips: ['জৈব চাষে রোগ প্রতিরোধ গুরুত্বপূর্ণ', 'নিম তেল স্প্রে করুন', 'প্রাকৃতিক শত্রু সংরক্ষণ'],
        common_questions: [
            { q: 'জৈব পদ্ধতিতে কাঁঠাল চাষ কীভাবে করবো?', a: 'ভার্মিকমপোস্ট ১৫-২০ কেজি/গাছ দিন। নিম তেল স্প্রে করুন। পঞ্চগব্য ব্যবহার করুন।' },
            { q: 'জৈব চাষে পোকা নিয়ন্ত্রণ কীভাবে?', a: 'নিম তেল ৫ মিলি/লিটার স্প্রে। ফেরোমন ট্র্যাপ ব্যবহার। প্রাকৃতিক শত্রু সংরক্ষণ।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
