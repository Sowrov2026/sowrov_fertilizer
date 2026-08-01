module.exports = [
    {
        id: 'cab-001',
        name: 'Cabbage',
        scientific_name: 'Brassica oleracea var. capitata',
        local_names: { bangla: 'বাঁধাকপি', chatgaiya: 'বাঁধাকপি', english: 'Cabbage' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 10, max: 25, optimal: 18, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৫০-৬০ কেজি/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২৫-৩০ কেজি/একর' },
            { stage: '৩৫-৪০ দিন (কোল গঠন)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '২০ কেজি + ২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার', 'ইঁদুনের ছাই'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['ডাউনি মিলডিউ', 'ব্ল্যাক রট', 'অ্যাল্টারনারিয়া', 'ব্যাকটেরিয়াল সফট রট', 'ফুজারিয়াম উইল্ট'],
        insects: ['ডায়মন্ড ব্যাক মথ', 'ক্যাবেজ লুপার', 'এফিড', 'থ্রিপস', 'কাট ওয়ার্ম'],
        yield: { per_plant: '১-২ কেজি', per_acre: '১০-১৫ টন', harvest_days: '৭০-৯০ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'কোল শক্ত ও পরিপক্ব', storage: '০-২°C তাপমাত্রায় ২-৩ মাস' },
        tips: ['৩০x৩০ সেমি দূরত্বে রোপণ', 'শীতকালীন সবজি', 'পানি বেশি দিলে কোল ফাটে', 'নিয়মিত আগাছা পরিষ্কার করুন'],
        common_questions: [
            { q: 'বাঁধাকপিতে কোন সার দেবো?', a: 'কমপোস্ট ৪-৬ টন/একর, ডিএপি ৫০-৬০ কেজি/একর, ইউরিয়া ৪৫-৫০ কেজি/একর' },
            { q: 'বাঁধাকপিতে ডায়মন্ড ব্যাক মথ কীভাবে বন্ধ করবো?', a: 'Bt স্প্রে ব্যবহার করুন। স্টিকি ট্র্যাপ ব্যবহার করুন। নিম তেল ৫ মিলি/লিটার স্প্রে।' },
            { q: 'বাঁধাকপি কখন তুলবো?', a: 'কোল শক্ত হলে তুলুন। সাধারণত রোপণের ৭০-৯০ দিন পর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'cab-002',
        name: 'Cabbage (Disease Guide)',
        scientific_name: 'Brassica oleracea var. capitata',
        local_names: { bangla: 'বাঁধাকপি', chatgaiya: 'বাঁধাকপি', english: 'Cabbage' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 10, max: 25, optimal: 18, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৫০-৬০ কেজি/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২৫-৩০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['ডাউনি মিলডিউ', 'ব্ল্যাক রট', 'অ্যাল্টারনারিয়া'],
        insects: ['ডায়মন্ড ব্যাক মথ', 'ক্যাবেজ লুপার', 'এফিড'],
        yield: { per_plant: '১-২ কেজি', per_acre: '১০-১৫ টন', harvest_days: '৭০-৯০ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'কোল শক্ত ও পরিপক্ব', storage: '০-২°C' },
        tips: ['আক্রান্ত পাতা নষ্ট করুন', 'ভালো নিষ্কাশন রাখুন', 'ফসল পরিবর্তন করুন'],
        common_questions: [
            { q: 'বাঁধাকপিতে ডাউনি মিলডিউ কী?', a: 'পাতার নিচে ধূসর আবরণ তৈরি হয়। ফাংগাসে হয়।' },
            { q: 'বাঁধাকপিতে ব্ল্যাক রট কীভাবে বন্ধ করবো?', a: 'ভালো নিষ্কাশন রাখুন। আক্রান্ত গাছ তুলে ফেলুন। ফসল পরিবর্তন করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
