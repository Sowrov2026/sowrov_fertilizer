module.exports = [
    {
        id: 'gar-001',
        name: 'Garlic',
        scientific_name: 'Allium sativum',
        local_names: { bangla: 'রসুন', chatgaiya: 'রসুন', english: 'Garlic' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-ফেব্রুয়ারি' },
        soil: { type: 'বালুআঁশ বা দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 10, max: 30, optimal: 20, unit: '°C' },
        watering: { frequency: 'প্রতি ৩-৪ দিন', method: 'ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৩০-৪০ কেজি/একর' },
            { stage: '২০-২৫ দিন', fertilizer: 'ইউরিয়া', amount: '১৫-২০ কেজি/একর' },
            { stage: '৪০-৪৫ দিন (কান্ড গঠন)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '১০ কেজি + ১৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার', 'বনেমা'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['সোডাল ব্লাইট', 'ডাউনি মিলডিউ', 'রাইজোপাস', 'বোটরাইটিস'],
        insects: ['থ্রিপস', 'এফিড', 'লিফ মাইনার'],
        yield: { per_plant: 'N/A', per_acre: '৩-৫ টন', harvest_days: '১১০-১৩০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'পাতা হলুদ হয়ে ঝরে পড়া, কান্ড নরম', storage: '০-২°C তাপমাত্রায় ৩-৪ মাস' },
        tips: ['উন্নত জাত ব্যবহার করুন (BARI রসুন-১)', '১০x১০ সেমি দূরত্বে রোপণ', 'এক কলি থেকে গাছ হয়', 'পাতা শুকনো হলে সেচ বন্ধ করুন'],
        common_questions: [
            { q: 'রসুনে কোন সার দেবো?', a: 'কমপোস্ট ৪-৬ টন/একর, ডিএপি ৩০-৪০ কেজি/একর, ইউরিয়া ২৫-৩০ কেজি/একর' },
            { q: 'রসুনে সোডাল ব্লাইট রোগ কীভাবে বন্ধ করবো?', a: 'ভালো নিষ্কাশন রাখুন। বীজ শোধন করুন। ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার স্প্রে।' },
            { q: 'রসুন কখন তুলবো?', a: 'পাতা হলুদ হয়ে ঝরে পড়লে তুলুন। সাধারণত রোপণের ১১০-১৩০ দিন পর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'gar-002',
        name: 'Garlic (Disease Guide)',
        scientific_name: 'Allium sativum',
        local_names: { bangla: 'রসুন', chatgaiya: 'রসুন', english: 'Garlic' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-ফেব্রুয়ারি' },
        soil: { type: 'বালুআঁশ বা দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 10, max: 30, optimal: 20, unit: '°C' },
        watering: { frequency: 'প্রতি ৩-৪ দিন', method: 'ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৩০-৪০ কেজি/একর' },
            { stage: '২০-২৫ দিন', fertilizer: 'ইউরিয়া', amount: '১৫-২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['সোডাল ব্লাইট', 'ডাউনি মিলডিউ', 'রাইজোপাস'],
        insects: ['থ্রিপস', 'এফিড'],
        yield: { per_plant: 'N/A', per_acre: '৩-৫ টন', harvest_days: '১১০-১৩০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'পাতা হলুদ হয়ে ঝরে পড়া', storage: '০-২°C' },
        tips: ['আক্রান্ত পাতা নষ্ট করুন', 'ভালো নিষ্কাশন রাখুন', 'ফসল পরিবর্তন করুন'],
        common_questions: [
            { q: 'রসুনে সোডাল ব্লাইট কী?', a: 'কান্ডের গোড়ায় সাদা আবরণ তৈরি হয়। ফাংগাসে হয়। আর্দ্র আবহাওয়ায় বেশি ছড়ায়।' },
            { q: 'রসুনে রাইজোপাস রোগ কীভাবে বন্ধ করবো?', a: 'ভালো নিষ্কাশন রাখুন। আক্রান্ত গাছ তুলে ফেলুন। ফসল পরিবর্তন করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
