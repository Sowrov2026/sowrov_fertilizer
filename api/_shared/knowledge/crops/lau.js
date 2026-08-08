export default [
    {
        id: 'lau-001',
        name: 'Bottle Gourd',
        scientific_name: 'Lagenaria siceraria',
        local_names: { bangla: 'লাউ', chatgaiya: 'লাউ', english: 'Bottle Gourd' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'মার্চ-সেপ্টেম্বর' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 38, optimal: 28, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ/ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৪০-৫০ কেজি/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' },
            { stage: '৩০-৩৫ দিন (ফুল ফোটা)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '২০ কেজি + ১৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['ডাউনি মিলডিউ', 'পাউডারি মিলডিউ', 'অ্যানথ্রাকনোজ', 'ভাইরাস মোজাইক', 'গাম মোসাইক'],
        insects: ['এফিড', 'থ্রিপস', 'ফ্রুট বোরার', 'কাট ওয়ার্ম', 'হোয়াইটফ্লাই'],
        yield: { per_plant: '৫-১০ কেজি', per_acre: '১০-১৫ টন', harvest_days: '৪৫-৬০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'সবুজ, নরম, ৩০-৪০ সেমি লম্বা', storage: '১০-১২°C তাপমাত্রায় ১ সপ্তাহ' },
        tips: ['ত্রিশল বা ট্রেলিস দিতে হয়', '২x২ মিটার দূরত্বে রোপণ', 'নিয়মিত ফল তুলে নিন', 'পুরুষ ফুল ১০% রাখুন'],
        common_questions: [
            { q: 'লাউয়ে কোন সার দেবো?', a: 'কমপোস্ট ৪-৬ টন/একর, ডিএপি ৪০-৫০ কেজি/একর, ইউরিয়া ৪০-৪৫ কেজি/একর' },
            { q: 'লাউয়ে ডাউনি মিলডিউ রোগ কীভাবে বন্ধ করবো?', a: 'ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার স্প্রে। ভালো নিষ্কাশন রাখুন। পাতায় পানি লাগানো এড়িয়ে চলুন।' },
            { q: 'লাউ কখন তুলবো?', a: 'সবুজ ও নরম হলে তুলুন। সাধারণত ফুল ফোটার ৪৫-৬০ দিন পর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'lau-002',
        name: 'Bottle Gourd (Disease Guide)',
        scientific_name: 'Lagenaria siceraria',
        local_names: { bangla: 'লাউ', chatgaiya: 'লাউ', english: 'Bottle Gourd' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'মার্চ-সেপ্টেম্বর' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 38, optimal: 28, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৪০-৫০ কেজি/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['ডাউনি মিলডিউ', 'পাউডারি মিলডিউ', 'অ্যানথ্রাকনোজ'],
        insects: ['এফিড', 'থ্রিপস', 'ফ্রুট বোরার'],
        yield: { per_plant: '৫-১০ কেজি', per_acre: '১০-১৫ টন', harvest_days: '৪৫-৬০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'সবুজ, নরম', storage: '১০-১২°C' },
        tips: ['আক্রান্ত পাতা নষ্ট করুন', 'ভালো নিষ্কাশন রাখুন', 'পাতায় পানি লাগানো এড়িয়ে চলুন'],
        common_questions: [
            { q: 'লাউয়ে ডাউনি মিলডিউ কী?', a: 'পাতার নিচে ধূসর আবরণ তৈরি হয়। ফাংগাসে হয়।' },
            { q: 'লাউয়ে পাউডারি মিলডিউ কীভাবে বন্ধ করবো?', a: 'সালফার ৩ গ্রাম/লিটার স্প্রে। ভালো বাতাস চলাচল রাখুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
