export default [
    {
        id: 'caf-001',
        name: 'Cauliflower',
        scientific_name: 'Brassica oleracea var. botrytis',
        local_names: { bangla: 'ফুলকপি', chatgaiya: 'ফুলকপি', english: 'Cauliflower' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-মার্চ' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 10, max: 25, optimal: 18, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৫০-৬০ কেজি/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২৫-৩০ কেজি/একর' },
            { stage: '৩৫-৪০ দিন (ফুল গঠন)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '২০ কেজি + ২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার', 'ইঁদুনের ছাই'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি', 'বোরন'],
        diseases: ['ডাউনি মিলডিউ', 'ব্ল্যাক রট', 'অ্যাল্টারনারিয়া', 'হলুদ ফুল', 'ব্যাকটেরিয়াল ব্লাইট'],
        insects: ['ডায়মন্ড ব্যাক মথ', 'ক্যাবেজ লুপার', 'এফিড', 'থ্রিপস', 'কাট ওয়ার্ম'],
        yield: { per_plant: '০.৫-১.৫ কেজি', per_acre: '৮-১২ টন', harvest_days: '৭০-৯০ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'ফুল সাদা ও শক্ত, সুন্দর আকৃতি', storage: '০-২°C তাপমাত্রায় ২-৩ সপ্তাহ' },
        tips: ['৩০x৩০ সেমি দূরত্বে রোপণ', 'ফুল সাদা রাখতে পাতা বাঁধুন', 'বোরন সার দিন', 'নিয়মিত আগাছা পরিষ্কার করুন'],
        common_questions: [
            { q: 'ফুলকপিতে কোন সার দেবো?', a: 'কমপোস্ট ৪-৬ টন/একর, ডিএপি ৫০-৬০ কেজি/একর, ইউরিয়া ৪৫-৫০ কেজি/একর, বোরন ১০ কেজি/একর' },
            { q: 'ফুলকপিতে হলুদ ফুল রোগ কীভাবে বন্ধ করবো?', a: 'বোরন সার দিন। পাতায় ফুল ঢাকুন। নিয়মিত সেচ দিন।' },
            { q: 'ফুলকপি কখন তুলবো?', a: 'ফুল সাদা ও শক্ত হলে তুলুন। সাধারণত রোপণের ৭০-৯০ দিন পর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'caf-002',
        name: 'Cauliflower (Disease Guide)',
        scientific_name: 'Brassica oleracea var. botrytis',
        local_names: { bangla: 'ফুলকপি', chatgaiya: 'ফুলকপি', english: 'Cauliflower' },
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
        yield: { per_plant: '০.৫-১.৫ কেজি', per_acre: '৮-১২ টন', harvest_days: '৭০-৯০ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'ফুল সাদা ও শক্ত', storage: '০-২°C' },
        tips: ['আক্রান্ত পাতা নষ্ট করুন', 'ভালো নিষ্কাশন রাখুন', 'ফসল পরিবর্তন করুন'],
        common_questions: [
            { q: 'ফুলকপিতে ডাউনি মিলডিউ কী?', a: 'পাতার নিচে ধূসর আবরণ তৈরি হয়। ফাংগাসে হয়।' },
            { q: 'ফুলকপিতে ব্ল্যাক রট কীভাবে বন্ধ করবো?', a: 'ভালো নিষ্কাশন রাখুন। আক্রান্ত গাছ তুলে ফেলুন। ফসল পরিবর্তন করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
