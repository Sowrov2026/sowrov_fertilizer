module.exports = [
    {
        id: 'cuc-001',
        name: 'Cucumber',
        scientific_name: 'Cucumis sativus',
        local_names: { bangla: 'শসা', chatgaiya: 'শসা', english: 'Cucumber' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 15, max: 35, optimal: 25, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ/ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৩-৫ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' },
            { stage: '৩০-৩৫ দিন (ফুল ফোটা)', fertilizer: 'ইউরিয়া + ডিএপি', amount: '২৫ কেজি + ২০ কেজি/একর' },
            { stage: '৫০-৫৫ দিন (ফল ধরা)', fertilizer: 'কেসিএ + এমওপি', amount: '২০ কেজি + ১৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['ডাউনি মিলডিউ', 'পাউডারি মিলডিউ', 'অ্যানথ্রাকনোজ', 'ভাইরাস মোজাইক', 'গাম মোসাইক'],
        insects: ['এফিড', 'থ্রিপস', 'হোয়াইটফ্লাই', 'ফ্রুট বোরার', 'কাট ওয়ার্ম'],
        yield: { per_plant: '৩-৫ কেজি', per_acre: '৮-১২ টন', harvest_days: '৫০-৬৫ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'সবুজ, নরম, ১৫-২০ সেমি লম্বা', storage: '১০-১২°C তাপমাত্রায় ১ সপ্তাহ' },
        tips: ['উন্নত জাত ব্যবহার করুন', '৩০x৩০ সেমি দূরত্বে রোপণ', 'ত্রিশল বা ট্রেলিস দিতে হয়', 'নিয়মিত ফল তুলে নিন'],
        common_questions: [
            { q: 'শসায় কোন সার দেবো?', a: 'কমপোস্ট ৩-৫ টন/একর, ইউরিয়া ৬৫-৭০ কেজি/একর, ডিএপি ৪০-৫০ কেজি/একর' },
            { q: 'শসায় ডাউনি মিলডিউ রোগ কীভাবে বন্ধ করবো?', a: 'ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার স্প্রে। ভালো নিষ্কাশন রাখুন। পাতায় পানি লাগানো এড়িয়ে চলুন।' },
            { q: 'শসা কখন তুলবো?', a: 'সবুজ ও নরম হলে তুলুন। সাধারণত ফুল ফোটার ৫০-৬৫ দিন পর। প্রতিদিন তুলতে হবে।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'cuc-002',
        name: 'Cucumber (Disease Guide)',
        scientific_name: 'Cucumis sativus',
        local_names: { bangla: 'শসা', chatgaiya: 'শসা', english: 'Cucumber' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 15, max: 35, optimal: 25, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৩-৫ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' },
            { stage: '৩০-৩৫ দিন', fertilizer: 'ইউরিয়া + ডিএপি', amount: '২৫ কেজি + ২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['ডাউনি মিলডিউ', 'পাউডারি মিলডিউ', 'অ্যানথ্রাকনোজ'],
        insects: ['এফিড', 'থ্রিপস', 'হোয়াইটফ্লাই'],
        yield: { per_plant: '৩-৫ কেজি', per_acre: '৮-১২ টন', harvest_days: '৫০-৬৫ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'সবুজ, নরম', storage: '১০-১২°C' },
        tips: ['আক্রান্ত পাতা নষ্ট করুন', 'ভালো নিষ্কাশন রাখুন', 'পাতায় পানি লাগানো এড়িয়ে চলুন'],
        common_questions: [
            { q: 'শসায় ডাউনি মিলডিউ কী?', a: 'পাতার উপরে হলুদ, নিচে ধূসর আবরণ তৈরি হয়। ফাংগাসে হয়।' },
            { q: 'শসায় পাউডারি মিলডিউ কীভাবে বন্ধ করবো?', a: 'সালফার ৩ গ্রাম/লিটার স্প্রে। ভালো বাতাস চলাচল রাখুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
