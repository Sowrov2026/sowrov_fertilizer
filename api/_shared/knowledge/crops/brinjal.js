export default [
    {
        id: 'brn-001',
        name: 'Brinjal (Eggplant)',
        scientific_name: 'Solanum melongena',
        local_names: { bangla: 'বেগুন', chatgaiya: 'বেগুন', english: 'Brinjal/Eggplant' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'ফেব্রুয়ারি-নভেম্বর' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 35, optimal: 28, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ/ফোয়ারা সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৫-৮ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২৫-৩০ কেজি/একর' },
            { stage: '৩৫-৪০ দিন (ফুল ফোটা)', fertilizer: 'ইউরিয়া + ডিএপি', amount: '৩০ কেজি + ২৫ কেজি/একর' },
            { stage: '৫৫-৬০ দিন (ফল ধরা)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '২০ কেজি + ২০ কেজি/একর' },
            { stage: 'ফল তোলার সময়', fertilizer: 'এমওপি', amount: '২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট', 'গোবর সার', 'নিম খাদ্য', 'বনেমা'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['ফসারিয়াম উইল্ট', 'লিটল লিফ', 'ভাইরাস মোজাইক', 'শুকো পাতা', 'ব্লাইট'],
        insects: ['ফ্রুট বোরার', 'এফিড', 'হোয়াইটফ্লাই', 'মিট', 'জাপানিজ বিটল'],
        yield: { per_plant: '২-৩ কেজি', per_acre: '১২-১৮ টন', harvest_days: '৬০-৭৫ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'চকচকে গাঢ় বেগুনি বর্ণ, নরম', storage: '১০-১২°C তাপমাত্রায় ৫-৭ দিন' },
        tips: ['উন্নত জাত ব্যবহার করুন (BARI বেগুন-১, ২, ৩)', '৪০-৪৫ সেমি দূরত্বে রোপণ', 'নিয়মিত ফল তুলে নিন', 'শাখা কাটা ও দোলা দিন'],
        common_questions: [
            { q: 'বেগুনে কোন সার দেবো?', a: 'কমপোস্ট ৫-৮ টন/একর, ইউরিয়া ১০০-১২০ কেজি/একর, ডিএপি ৫০-৬০ কেজি/একর' },
            { q: 'বেগুনে ফসারিয়াম উইল্ট রোগ কীভাবে বন্ধ করবো?', a: 'ফসল পরিবর্তন করুন। আক্রান্ত গাছ তুলে ফেলুন। ভালো জল নিষ্কাশন রাখুন।' },
            { q: 'বেগুন কখন তুলবো?', a: 'চকচকে গাঢ় বেগুনি বর্ণ হলে তুলুন। ফুল ফোটার ৬০-৭৫ দিন পর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'brn-002',
        name: 'Brinjal (Disease Guide)',
        scientific_name: 'Solanum melongena',
        local_names: { bangla: 'বেগুন', chatgaiya: 'বেগুন', english: 'Brinjal/Eggplant' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'ফেব্রুয়ারি-নভেম্বর' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 35, optimal: 28, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৫-৮ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'ইউরিয়া', amount: '২৫-৩০ কেজি/একর' },
            { stage: '৩৫-৪০ দিন', fertilizer: 'ইউরিয়া + ডিএপি', amount: '৩০ কেজি + ২৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'ভার্মিকমপোস্ট'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['ফসারিয়াম উইল্ট', 'লিটল লিফ', 'ভাইরাস মোজাইক', 'শুকো পাতা'],
        insects: ['ফ্রুট বোরার', 'এফিড', 'হোয়াইটফ্লাই'],
        yield: { per_plant: '২-৩ কেজি', per_acre: '১২-১৮ টন', harvest_days: '৬০-৭৫ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'চকচকে গাঢ় বেগুনি বর্ণ', storage: '১০-১২°C' },
        tips: ['আক্রান্ত গাছ তুলে ফেলুন', 'ভালো জল নিষ্কাশন রাখুন', 'ফসল পরিবর্তন করুন'],
        common_questions: [
            { q: 'বেগুনে ফসারিয়াম উইল্ট কী?', a: 'গাছ হঠাৎ ঝরে পড়ে। কাণ্ডের ভেতরে বাদামি বর্ণ থাকে। মাটির ফাংগাসে হয়।' },
            { q: 'বেগুনে ফ্রুট বোরার কীভাবে বন্ধ করবো?', a: 'আক্রান্ত ফল তুলে ফেলুন। ফেরোমন ট্র্যাপ ব্যবহার করুন। নিম তেল স্প্রে করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'brn-003',
        name: 'Brinjal (Organic Farming)',
        scientific_name: 'Solanum melongena',
        local_names: { bangla: 'বেগুন', chatgaiya: 'বেগুন', english: 'Brinjal/Eggplant' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'ফেব্রুয়ারি-নভেম্বর' },
        soil: { type: 'দোআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 35, optimal: 28, unit: '°C' },
        watering: { frequency: 'প্রতিদিন', method: 'ড্রিপ সেচ', amount: 'মাটি ভেজা রাখুন' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'ভার্মিকমপোস্ট', amount: '৬-৮ টন/একর' },
            { stage: '১৫-২০ দিন', fertilizer: 'জীবাণুমুক্ত গোবর', amount: '৫০০ কেজি/একর' },
            { stage: '৩৫-৪০ দিন', fertilizer: 'নিম খাদ্য', amount: '১০০ কেজি/একর' },
            { stage: '৫৫-৬০ দিন', fertilizer: 'পঞ্চগব্য', amount: '১০ লিটার/একর' }
        ],
        organic_fertilizer: ['ভার্মিকমপোস্ট', 'জীবাণুমুক্ত গোবর', 'নিম খাদ্য', 'পঞ্চগব্য'],
        chemical_fertilizer: [],
        diseases: ['ফসারিয়াম উইল্ট', 'লিটল লিফ'],
        insects: ['ফ্রুট বোরার', 'এফিড', 'হোয়াইটফ্লাই'],
        yield: { per_plant: '১.৫-২.৫ কেজি', per_acre: '১০-১৫ টন', harvest_days: '৬৫-৮০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'চকচকে গাঢ় বেগুনি বর্ণ', storage: '১০-১২°C' },
        tips: ['জৈব চাষে রোগ প্রতিরোধ গুরুত্বপূর্ণ', 'নিম তেল স্প্রে করুন', 'প্রাকৃতিক শত্রু সংরক্ষণ'],
        common_questions: [
            { q: 'জৈব পদ্ধতিতে বেগুন চাষ কীভাবে করবো?', a: 'ভার্মিকমপোস্ট ৬-৮ টন/একর দিন। নিম তেল স্প্রে করুন। পঞ্চগব্য ব্যবহার করুন।' },
            { q: 'জৈব চাষে পোকা নিয়ন্ত্রণ কীভাবে?', a: 'নিম তেল ৫ মিলি/লিটার স্প্রে। স্টিকি ট্র্যাপ ব্যবহার। প্রাকৃতিক শত্রু সংরক্ষণ।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
