export default [
    {
        id: 'ban-001',
        name: 'Banana',
        scientific_name: 'Musa acuminata',
        local_names: { bangla: 'কলা', chatgaiya: 'কলা', english: 'Banana' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'সারা বছর (বীজ রোপণ সেপ্টেম্বর-নভেম্বর)' },
        soil: { type: 'দোআঁশ বা কাদা মাটি', pH: '6.0-7.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 15, max: 38, optimal: 27, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ/ফোয়ারা সেচ', amount: 'প্রতি গাছে ২০-২৫ লিটার/দিন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '১০-১৫ কেজি/গাছ' },
            { stage: '৩০ দিন', fertilizer: 'ইউরিয়া', amount: '২০০ গ্রাম/গাছ' },
            { stage: '৬০ দিন', fertilizer: 'ইউরিয়া + ডিএপি', amount: '২০০ গ্রাম + ১৫০ গ্রাম/গাছ' },
            { stage: '৯০ দিন', fertilizer: 'ইউরিয়া + কেসিএ', amount: '১৫০ গ্রাম + ২০০ গ্রাম/গাছ' },
            { stage: '১২০ দিন', fertilizer: 'কেসিএ', amount: '২০০ গ্রাম/গাছ' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার', 'ভার্মিকমপোস্ট', 'ইঁদুনের ছাই'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['পানামা রোগ', 'সিগাটোকা', 'ব্ল্যাক সিগাটোকা', 'ব্যাকটেরিয়াল ওয়িল্ট', 'ফোকাল স্পট'],
        insects: ['ব্যানানা সাপ', 'থ্রিপস', 'এফিড', 'মিট', 'করোরা'],
        yield: { per_plant: '১৫-২০ কেজি/গাছ', per_acre: '১৫-২৫ টন', harvest_days: '৩০০-৩৬৫ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'ফল নরম, হলুদ বর্ণ', storage: '১৩-১৪°C তাপমাত্রায় ১-২ সপ্তাহ' },
        tips: ['২x২ মিটার দূরত্বে রোপণ', 'মূল গাছের পাশে ১-২টি কলম রাখুন', 'কান্ড ১.৫ মিটার উঁচু করে মাটি ঢালুন', 'প্রতি গাছে ১২-১৫টি কল রাখুন'],
        common_questions: [
            { q: 'কলা গাছে কোন সার দেবো?', a: 'কমপোস্ট ১০-১৫ কেজি/গাছ, ইউরিয়া ৫৫০ গ্রাম/গাছ, ডিএপি ১৫০ গ্রাম/গাছ, কেসিএ ৪০০ গ্রাম/গাছ' },
            { q: 'কলায় পানামা রোগ কীভাবে বন্ধ করবো?', a: 'আক্রান্ত গাছ তুলে ফেলুন। কলম শোধন করুন। ভালো নিষ্কাশন রাখুন।' },
            { q: 'কলা গাছ কখন ফল দেবে?', a: 'রোপণের ৩০০-৩৬৫ দিন পর। ফল ধরলে ৯০-১২০ দিনে পাকবে।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'ban-002',
        name: 'Banana (Disease Guide)',
        scientific_name: 'Musa acuminata',
        local_names: { bangla: 'কলা', chatgaiya: 'কলা', english: 'Banana' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'সারা বছর' },
        soil: { type: 'দোআঁশ বা কাদা মাটি', pH: '6.0-7.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 15, max: 38, optimal: 27, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: '২০-২৫ লিটার/দিন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '১০-১৫ কেজি/গাছ' },
            { stage: '৩০ দিন', fertilizer: 'ইউরিয়া', amount: '২০০ গ্রাম/গাছ' },
            { stage: '৬০ দিন', fertilizer: 'ইউরিয়া + ডিএপি', amount: '২০০ গ্রাম + ১৫০ গ্রাম/গাছ' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['পানামা রোগ', 'সিগাটোকা', 'ব্ল্যাক সিগাটোকা', 'ব্যাকটেরিয়াল ওয়িল্ট'],
        insects: ['ব্যানানা সাপ', 'থ্রিপস', 'এফিড'],
        yield: { per_plant: '১৫-২০ কেজি/গাছ', per_acre: '১৫-২৫ টন', harvest_days: '৩০০-৩৬৫ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'ফল নরম, হলুদ বর্ণ', storage: '১৩-১৪°C' },
        tips: ['আক্রান্ত গাছ তুলে ফেলুন', 'কলম শোধন করুন', 'ভালো নিষ্কাশন রাখুন'],
        common_questions: [
            { q: 'কলায় পানামা রোগ কী?', a: 'পাতা হলুদ হয়ে ঝরে পড়ে। কান্ডের ভেতরে কালো দাগ থাকে। মাটির ফাংগাসে হয়।' },
            { q: 'কলায় সিগাটোকা রোগ কীভাবে বন্ধ করবো?', a: 'কপার অক্সিক্লোরাইড ৩ গ্রাম/লিটার স্প্রে। আক্রান্ত পাতা নষ্ট করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
