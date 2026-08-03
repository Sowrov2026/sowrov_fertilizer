export default [
    {
        id: 'oni-001',
        name: 'Onion',
        scientific_name: 'Allium cepa',
        local_names: { bangla: 'পেঁয়াজ', chatgaiya: 'পিঁয়াজ', english: 'Onion' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'নভেম্বর-মার্চ' },
        soil: { type: 'বালুআঁশ বা দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 12, max: 30, optimal: 22, unit: '°C' },
        watering: { frequency: 'প্রতি ২-৩ দিন', method: 'ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৪০-৫০ কেজি/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' },
            { stage: '৩০-৩৫ দিন (বালি গঠন)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '১৫ কেজি + ১৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার', 'বনেমা'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি', 'সালফার'],
        diseases: ['ডাউনি মিলডিউ', 'সোডাল ব্লাইট', 'স্টেম ফ্লাই', 'অ্যানথ্রাকনোজ', 'রাইজোপাস'],
        insects: ['থ্রিপস', 'এফিড', 'লিফ মাইনার', 'স্টেম বোরার'],
        yield: { per_plant: 'N/A', per_acre: '৫-৮ টন', harvest_days: '১০০-১২০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'পাতা হলুদ হয়ে ঝরে পড়া, বালি শক্ত', storage: '০-২°C তাপমাত্রায় ২-৩ মাস' },
        tips: ['উন্নত জাত ব্যবহার করুন (BARI পেঁয়াজ-১, ২)', '১০x১০ সেমি দূরত্বে রোপণ', 'মালচিং করলে আর্দ্রতা ধরে থাকে', 'পাতা শুকনো হলে সেচ বন্ধ করুন'],
        common_questions: [
            { q: 'পেঁয়াজে কোন সার দেবো?', a: 'কমপোস্ট ৪-৬ টন/একর, ডিএপি ৪০-৫০ কেজি/একর, ইউরিয়া ৩৫-৪০ কেজি/একর' },
            { q: 'পেঁয়াজে ডাউনি মিলডিউ রোগ কীভাবে বন্ধ করবো?', a: 'ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার স্প্রে। ভালো নিষ্কাশন রাখুন। পাতায় পানি লাগানো এড়িয়ে চলুন।' },
            { q: 'পেঁয়াজ কখন তুলবো?', a: 'পাতা হলুদ হয়ে ঝরে পড়লে তুলুন। সাধারণত রোপণের ১০০-১২০ দিন পর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'oni-002',
        name: 'Onion (Disease Guide)',
        scientific_name: 'Allium cepa',
        local_names: { bangla: 'পেঁয়াজ', chatgaiya: 'পিঁয়াজ', english: 'Onion' },
        season: { rabi: true, kharif1: false, kharif2: false, best_months: 'নভেম্বর-মার্চ' },
        soil: { type: 'বালুআঁশ বা দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 12, max: 30, optimal: 22, unit: '°C' },
        watering: { frequency: 'প্রতি ২-৩ দিন', method: 'ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৪-৬ টন/একর' },
            { stage: 'রোপণের সময়', fertilizer: 'ডিএপি', amount: '৪০-৫০ কেজি/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২০-২৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['ডাউনি মিলডিউ', 'সোডাল ব্লাইট', 'স্টেম ফ্লাই'],
        insects: ['থ্রিপস', 'এফিড', 'লিফ মাইনার'],
        yield: { per_plant: 'N/A', per_acre: '৫-৮ টন', harvest_days: '১০০-১২০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'পাতা হলুদ হয়ে ঝরে পড়া', storage: '০-২°C' },
        tips: ['আক্রান্ত পাতা নষ্ট করুন', 'ভালো নিষ্কাশন রাখুন', 'ফসল পরিবর্তন করুন'],
        common_questions: [
            { q: 'পেঁয়াজে ডাউনি মিলডিউ কী?', a: 'পাতায় সাদা-ধূসর আবরণ তৈরি হয়। ফাংগাসে হয়। আর্দ্র আবহাওয়ায় বেশি ছড়ায়।' },
            { q: 'পেঁয়াজে সোডাল ব্লাইট কীভাবে বন্ধ করবো?', a: 'ভালো নিষ্কাশন রাখুন। বীজ শোধন করুন। ফসল পরিবর্তন করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
