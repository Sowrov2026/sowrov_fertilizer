export default [
    {
        id: 'pot-001',
        name: 'Potato',
        scientific_name: 'Solanum tuberosum',
        local_names: { bangla: 'আলু', chatgaiya: 'আলু', english: 'Potato' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-ফেব্রুয়ারি' },
        soil: { type: 'বালুআঁশ', pH: '5.5-6.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 10, max: 28, optimal: 20, unit: '°C' },
        watering: { frequency: 'প্রতি ৩-৪ দিন', method: 'ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৫-৮ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৫০-৬০ কেজি/একর' },
            { stage: '১৫-২০ দিন (মাটি আউচি)', fertilizer: 'ইউরিয়া', amount: '৪০-৫০ কেজি/একর' },
            { stage: '৩৫-৪০ দিন (দ্বিতীয় আউচি)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '৩০ কেজি + ২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার', 'বনেমা'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['লেট ব্লাইট', 'আরলি ব্লাইট', 'স্ক্যাব', 'রাইজোকটোনিয়া', 'ভাইরাস মোজাইক'],
        insects: ['কাট ওয়ার্ম', 'কলোরাডো বিটল', 'এফিড', 'থ্রিপস', 'নিমাটোড'],
        yield: { per_plant: '০.৫-১ কেজি', per_acre: '৮-১২ টন', harvest_days: '৮০-১০০ দিন' },
        harvest: { method: 'কাঠি দিয়ে তোলা', indicators: 'পাতা হলুদ হয়ে ঝরে পড়া', storage: '৪-১০°C তাপমাত্রায় ২-৩ মাস' },
        tips: ['উন্নত জাত ব্যবহার করুন (BARI আলু-১, ২, ৩, ৪)', '২০x১০ সেমি দূরত্বে রোপণ', 'মাটি আউচি দুইবার দিন', 'বীজ আলু ২০-৩০ গ্রাম ওজনের হতে হবে'],
        common_questions: [
            { q: 'আলুতে কোন সার দেবো?', a: 'কমপোস্ট ৫-৮ টন/একর, ডিএপি ৫০-৬০ কেজি/একর, ইউরিয়া ৭০-৮০ কেজি/একর' },
            { q: 'আলুতে লেট ব্লাইট রোগ কীভাবে বন্ধ করবো?', a: 'ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার স্প্রে। আক্রান্ত পাতা নষ্ট করুন। ভালো নিষ্কাশন রাখুন।' },
            { q: 'আলু কখন তুলবো?', a: 'পাতা হলুদ হয়ে ঝরে পড়লে তুলুন। সাধারণত রোপণের ৮০-১০০ দিন পর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'pot-002',
        name: 'Potato (Disease Guide)',
        scientific_name: 'Solanum tuberosum',
        local_names: { bangla: 'আলু', chatgaiya: 'আলু', english: 'Potato' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'অক্টোবর-ফেব্রুয়ারি' },
        soil: { type: 'বালুআঁশ', pH: '5.5-6.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 10, max: 28, optimal: 20, unit: '°C' },
        watering: { frequency: 'প্রতি ৩-৪ দিন', method: 'ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৫-৮ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৫০-৬০ কেজি/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '৪০-৫০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['লেট ব্লাইট', 'আরলি ব্লাইট', 'স্ক্যাব', 'রাইজোকটোনিয়া'],
        insects: ['কাট ওয়ার্ম', 'কলোরাডো বিটল', 'এফিড'],
        yield: { per_plant: '০.৫-১ কেজি', per_acre: '৮-১২ টন', harvest_days: '৮০-১০০ দিন' },
        harvest: { method: 'কাঠি দিয়ে তোলা', indicators: 'পাতা হলুদ হয়ে ঝরে পড়া', storage: '৪-১০°C' },
        tips: ['আক্রান্ত পাতা নষ্ট করুন', 'ভালো নিষ্কাশন রাখুন', 'ফসল পরিবর্তন করুন'],
        common_questions: [
            { q: 'আলুতে লেট ব্লাইট কী?', a: 'পাতায় কালো-বাদামি দাগ তৈরি হয়। ফাংগাসে হয়। আর্দ্র আবহাওয়ায় বেশি ছড়ায়।' },
            { q: 'আলুতে স্ক্যাব রোগ কীভাবে বন্ধ করবো?', a: 'অম্লীয় মাটি এড়িয়ে চলুন। বীজ শোধন করুন। ম্যাঙ্কোজেব ব্যবহার করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
