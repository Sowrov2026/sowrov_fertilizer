export default [
    {
        id: 'wrm-001',
        name: 'Watermelon',
        scientific_name: 'Citrullus lanatus',
        local_names: { bangla: 'তরমুজ', chatgaiya: 'তরমুজ', english: 'Watermelon' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'জানুয়ারি-মার্চ' },
        soil: { type: 'বালুআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 18, max: 38, optimal: 28, unit: '°C' },
        watering: { frequency: 'প্রতি ২-৩ দিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৩-৫ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৪০-৫০ কেজি/একর' },
            { stage: '১৫-২০ দিন (শাখা-প্রশাখা)', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' },
            { stage: '৩০-৩৫ দিন (ফুল ফোটা)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '১৫ কেজি + ২০ কেজি/একর' },
            { stage: '৪৫-৫০ দিন (ফল গঠন)', fertilizer: 'কেসিএ', amount: '২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['অ্যানথ্রাকনোজ', 'ডাউনি মিলডিউ', 'ফাসারিয়াম উইল্ট', 'ভাইরাস মোজাইক', 'গাম মোসাইক'],
        insects: ['এফিড', 'থ্রিপস', 'কাট ওয়ার্ম', 'ফ্রুট ফ্লাই', 'মিট'],
        yield: { per_plant: '৫-১০ কেজি', per_acre: '১০-১৫ টন', harvest_days: '৭০-৮৫ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'গাঢ় সবুজ বর্ণ, টুকরো করলে গুড় শব্দ', storage: '১০-১৫°C তাপমাত্রায় ২-৩ সপ্তাহ' },
        tips: ['বালুআঁশ মাটি সবচেয়ে উপযোগী', '২x২ মিটার দূরত্বে রোপণ', 'ফল ঘুরিয়ে দিন', 'পানি বেশি দিলে ফল ফাটে'],
        common_questions: [
            { q: 'তরমুজে কোন সার দেবো?', a: 'কমপোস্ট ৩-৫ টন/একর, ডিএপি ৪০-৫০ কেজি/একর, ইউরিয়া ৩৫-৪০ কেজি/একর' },
            { q: 'তরমুজে অ্যানথ্রাকনোজ রোগ কীভাবে বন্ধ করবো?', a: 'কপার অক্সিক্লোরাইড ৩ গ্রাম/লিটার স্প্রে। আক্রান্ত লতা নষ্ট করুন। ভালো নিষ্কাশন রাখুন।' },
            { q: 'তরমুজ কখন তুলবো?', a: 'টুকরো করলে গুড় শব্দ আসলে তুলুন। সাধারণত ফুল ফোটার ৭০-৮৫ দিন পর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'wrm-002',
        name: 'Watermelon (Disease Guide)',
        scientific_name: 'Citrullus lanatus',
        local_names: { bangla: 'তরমুজ', chatgaiya: 'তরমুজ', english: 'Watermelon' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'জানুয়ারি-মার্চ' },
        soil: { type: 'বালুআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 18, max: 38, optimal: 28, unit: '°C' },
        watering: { frequency: 'প্রতি ২-৩ দিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৩-৫ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৪০-৫০ কেজি/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['অ্যানথ্রাকনোজ', 'ডাউনি মিলডিউ', 'ফাসারিয়াম উইল্ট', 'ভাইরাস মোজাইক'],
        insects: ['এফিড', 'থ্রিপস', 'কাট ওয়ার্ম'],
        yield: { per_plant: '৫-১০ কেজি', per_acre: '১০-১৫ টন', harvest_days: '৭০-৮৫ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'গাঢ় সবুজ বর্ণ', storage: '১০-১৫°C' },
        tips: ['আক্রান্ত লতা নষ্ট করুন', 'ভালো নিষ্কাশন রাখুন', 'ফসল পরিবর্তন করুন'],
        common_questions: [
            { q: 'তরমুজে অ্যানথ্রাকনোজ কী?', a: 'লতায় কালো দাগ তৈরি হয়। ফল পচে যায়। ফাংগাসে হয়।' },
            { q: 'তরমুজে ফাসারিয়াম উইল্ট কীভাবে বন্ধ করবো?', a: 'ফসল পরিবর্তন করুন। আক্রান্ত লতা তুলে ফেলুন। ভালো নিষ্কাশন রাখুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
