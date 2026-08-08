export default [
    {
        id: 'tom-001',
        name: 'Tomato',
        scientific_name: 'Solanum lycopersicum',
        local_names: { bangla: 'টমেটো', chatgaiya: 'টমেটু', english: 'Tomato' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 15, max: 35, optimal: 25, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ/ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৩-৫ টন/একর' },
            { stage: '১৫-২০ দিন (প্রথম শাখা)', fertilizer: 'ইউরিয়া', amount: '৩০ কেজি/একর' },
            { stage: '৩০-৩৫ দিন (ফুল ফোটা)', fertilizer: 'ইউরিয়া + ডিএপি', amount: '৩০ কেজি + ২৫ কেজি/একর' },
            { stage: '৫০-৬০ দিন (ফল ধরা)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '২০ কেজি + ২০ কেজি/একর' },
            { stage: 'ফল তোলার সময়', fertilizer: 'এমওপি', amount: '২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার', 'নিম খাদ্য', 'বনেমা'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি', 'তুমসালফ'],
        diseases: ['লিফ মোল্ড', 'লেট ব্লাইট', 'ব্লাস্ট', 'ফল পচা', 'ফোমোপসিস লিফ স্পট', 'ব্যাকটেরিয়াল স্পট', 'ভাইরাস মোজাইক'],
        insects: ['হর্নওয়ার্ম', 'আফিড', 'হোয়াইটফ্লাই', 'ফ্রুট বোরার', 'থ্রিপস'],
        yield: { per_plant: '১-২ কেজি', per_acre: '১০-১৫ টন', harvest_days: '৭৫-৯০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'গাঢ় লাল বর্ণ, পরিপক্বতা', storage: '১০-১২°C তাপমাত্রায় ৭-১০ দিন সংরক্ষণ' },
        tips: ['উন্নত জাতের বীজ ব্যবহার করুন (BARI টমেটো-২, ৩, ৪)', '২৫-৩০ সেমি দূরত্বে রোপণ করুন', 'মালচিং করলে আর্দ্রতা ধরে থাকে', 'নিয়মিত দোলা দিন এবং শাখা বাঁধুন'],
        common_questions: [
            { q: 'টমেটোতে কোন সার দেবো?', a: 'কমপোস্ট ৩-৫ টন/একর, ইউরিয়া ১০০-১২০ কেজি/একর, ডিএপি ৫০-৬০ কেজি/একর, কেসিএ ৪০-৫০ কেজি/একর' },
            { q: 'টমেটোতে ফল পচা রোগ কীভাবে বন্ধ করবো?', a: 'ক্যালসিয়াম ক্লোরাইড ৫ গ্রাম/লিটার পাতায় স্প্রে করুন। কমপোস্ট সার বেশি দিন।' },
            { q: 'টমেটোর সেচ কীভাবে দেবো?', a: 'ড্রিপ সেচ সবচেয়ে ভালো। প্রতিদিন সকালে পানি দিন। ফুল ফোটার সময় বেশি পানি দিতে হয়।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'tom-002',
        name: 'Tomato (Disease Guide)',
        scientific_name: 'Solanum lycopersicum',
        local_names: { bangla: 'টমেটো', chatgaiya: 'টমেটু', english: 'Tomato' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 15, max: 35, optimal: 25, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৩-৫ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '৩০ কেজি/একর' },
            { stage: '৩০-৩৫ দিন', fertilizer: 'ইউরিয়া + ডিএপি', amount: '৩০ কেজি + ২৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['লিফ মোল্ড', 'লেট ব্লাইট', 'ব্লাস্ট', 'ফল পচা', 'ফোমোপসিস লিফ স্পট'],
        insects: ['হর্নওয়ার্ম', 'আফিড', 'হোয়াইটফ্লাই'],
        yield: { per_plant: '১-২ কেজি', per_acre: '১০-১৫ টন', harvest_days: '৭৫-৯০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'গাঢ় লাল বর্ণ', storage: '১০-১২°C' },
        tips: ['আক্রান্ত পাতা নষ্ট করে ফেলুন', 'বীজ শুকনো জায়গায় রাখুন', 'ভালো জল নিষ্কাশন রাখুন'],
        common_questions: [
            { q: 'টমেটোতে লিফ মোল্ড কীভাবে বন্ধ করবো?', a: 'নিম পেস্ট স্প্রে করুন। ট্রাইকোডার্মা ব্যবহার করুন। ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার স্প্রে।' },
            { q: 'টমেটোর ফল পচা রোগ কী?', a: 'ফলের গোড়ায় কালো বা বাদামি দাগ তৈরি হয়। ক্যালসিয়াম অভাবে হয়। ক্যালসিয়াম ক্লোরাইড ৫ গ্রাম/লিটার স্প্রে।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'tom-003',
        name: 'Tomato (Organic Farming)',
        scientific_name: 'Solanum lycopersicum',
        local_names: { bangla: 'টমেটো', chatgaiya: 'টমেটু', english: 'Tomato' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 15, max: 35, optimal: 25, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'ভার্মিকমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'জীবাণুমুক্ত গোবর', amount: '৫০০ কেজি/একর' },
            { stage: '৩০-৩৫ দিন', fertilizer: 'নিম খাদ্য', amount: '১০০ কেজি/একর' },
            { stage: '৫০-৬০ দিন', fertilizer: 'পঞ্চগব্য', amount: '১০ লিটার/একর' }
        ],
        organic_fertilizer: ['ভার্মিকমপোস্ট', 'জীবাণুমুক্ত গোবর', 'নিম খাদ্য', 'পঞ্চগব্য', 'বনেমা'],
        chemical_fertilizer: [],
        diseases: ['লিফ মোল্ড', 'লেট ব্লাইট', 'ফল পচা'],
        insects: ['হর্নওয়ার্ম', 'আফিড', 'হোয়াইটফ্লাই'],
        yield: { per_plant: '০.৮-১.৫ কেজি', per_acre: '৮-১২ টন', harvest_days: '৮০-৯৫ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'গাঢ় লাল বর্ণ', storage: '১০-১২°C' },
        tips: ['জৈব চাষে রোগ প্রতিরোধ গুরুত্বপূর্ণ', 'নিম তেল ৫ মিলি/লিটার পোকা নিয়ন্ত্রণে', 'ট্রাইকোডার্মা মাটিতে মেশান', 'প্রাকৃতিক শত্রু সংরক্ষণ করুন'],
        common_questions: [
            { q: 'জৈব পদ্ধতিতে টমেটো চাষ কীভাবে করবো?', a: 'ভার্মিকমপোস্ট ৪-৬ টন/একর দিন। নিম তেল স্প্রে করুন। পঞ্চগব্য ব্যবহার করুন।' },
            { q: 'জৈব চাষে পোকা নিয়ন্ত্রণ কীভাবে?', a: 'নিম তেল ৫ মিলি/লিটার স্প্রে। স্টিকি ট্র্যাপ ব্যবহার। প্রাকৃতিক শত্রু যেমন লেডিবাগ সংরক্ষণ।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
