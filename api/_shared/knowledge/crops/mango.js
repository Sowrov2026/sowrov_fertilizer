export default [
    {
        id: 'man-001',
        name: 'Mango',
        scientific_name: 'Mangifera indica',
        local_names: { bangla: 'আম', chatgaiya: 'আম', english: 'Mango' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'মার্চ-জুন (ফুল ফোটা), মে-সেপ্টেম্বর (ফল)' },
        soil: { type: 'দোআঁশ বা বালুআঁশ', pH: '5.5-7.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 40, optimal: 28, unit: '°C' },
        watering: { frequency: 'সপ্তাহে ১-২ বার', method: 'পরিবাহী সেচ', amount: 'গাছের বয়স অনুযায়ী ৫০-২০০ লিটার' },
        fertilizer_schedule: [
            { stage: 'ফুল ফোটার আগে (জানুয়ারি)', fertilizer: 'ইউরিয়া', amount: '১-২ কেজি/গাছ (বয়স অনুযায়ী)' },
            { stage: 'ফল ধরার পর (মে)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '১ কেজি + ০.৫ কেজি/গাছ' },
            { stage: 'ফল তোলার পর (জুলাই)', fertilizer: 'কমপোস্ট', amount: '১০-২০ কেজি/গাছ' },
            { stage: 'বর্ষায়', fertilizer: 'ফসল পরিবর্তনের জন্য গোবর সার', amount: '২০-৩০ কেজি/গাছ' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার', 'ভার্মিকমপোস্ট', 'ইঁদুনের ছাই'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['অ্যানথ্রাকনোজ', 'পাওডারি মিলডিউ', 'গাম মোসাইক', 'ব্যাকটেরিয়াল ক্যানকার', 'সোর্ট রট'],
        insects: ['ম্যাংগো ফ্রুট ফ্লাই', 'শুট বোরার', 'এফিড', 'মিট', 'সেফালোনায়ের'],
        yield: { per_plant: '৫০-১০০ কেজি/গাছ', per_acre: '১০-১৫ টন (বয়স্ক গাছ)', harvest_days: 'ফুল ফোটার ৯০-১২০ দিন পর' },
        harvest: { method: 'হাতে তোলা', indicators: 'গাঢ় হলুদ-কমলা বর্ণ, গন্ধ তৈরি', storage: '১২-১৪°C তাপমাত্রায় ১-২ সপ্তাহ' },
        tips: ['৫-৬ বছর বয়স থেকে ফল দেয়', 'নতুন গাছে একটি ফল রাখুন', 'গাছের চারপাশ পরিষ্কার রাখুন', 'ডার্ক স্পট হলে ফল তুলে নিন'],
        common_questions: [
            { q: 'আমের গাছে কোন সার দেবো?', a: 'কমপোস্ট ১০-২০ কেজি/গাছ, ইউরিয়া ১-২ কেজি/গাছ, কেসিএ ০.৫-১ কেজি/গাছ। ফুল ফোটার আগে দিন।' },
            { q: 'আমের গাছে অ্যানথ্রাকনোজ রোগ কীভাবে বন্ধ করবো?', a: 'কপার অক্সিক্লোরাইড ৩ গ্রাম/লিটার স্প্রে। আক্রান্ত ফল নষ্ট করুন। পাতা ঝরে পড়লে নিষ্কাশন করুন।' },
            { q: 'আম গাছ কখন ফল দেবে?', a: 'বীজ থেকে গাছ ৫-৭ বছরে, কলম থেকে ৩-৪ বছরে। ফলের মৌসুম মে-সেপ্টেম্বর।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'man-002',
        name: 'Mango (Disease Guide)',
        scientific_name: 'Mangifera indica',
        local_names: { bangla: 'আম', chatgaiya: 'আম', english: 'Mango' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'মার্চ-সেপ্টেম্বর' },
        soil: { type: 'দোআঁশ বা বালুআঁশ', pH: '5.5-7.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 40, optimal: 28, unit: '°C' },
        watering: { frequency: 'সপ্তাহে ১-২ বার', method: 'পরিবাহী সেচ', amount: '৫০-২০০ লিটার/গাছ' },
        fertilizer_schedule: [
            { stage: 'ফুল ফোটার আগে', fertilizer: 'ইউরিয়া', amount: '১-২ কেজি/গাছ' },
            { stage: 'ফল ধরার পর', fertilizer: 'ইউরিয়া + কেসিএ', amount: '১ কেজি + ০.৫ কেজি/গাছ' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['অ্যানথ্রাকনোজ', 'পাওডারি মিলডিউ', 'গাম মোসাইক', 'সোর্ট রট'],
        insects: ['ম্যাংগো ফ্রুট ফ্লাই', 'শুট বোরার', 'এফিড'],
        yield: { per_plant: '৫০-১০০ কেজি/গাছ', per_acre: '১০-১৫ টন', harvest_days: '৯০-১২০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'গাঢ় হলুদ-কমলা বর্ণ', storage: '১২-১৪°C' },
        tips: ['আক্রান্ত ফল নষ্ট করুন', 'পাতা ঝরে পড়লে নিষ্কাশন করুন', 'গাছের চারপাশ পরিষ্কার রাখুন'],
        common_questions: [
            { q: 'আমে অ্যানথ্রাকনোজ কী?', a: 'ফলে কালো দাগ তৈরি হয়। ফল পচে যায়। ফাংগাসে হয়।' },
            { q: 'আমে পাওডারি মিলডিউ কীভাবে বন্ধ করবো?', a: 'সালফার ৩ গ্রাম/লিটার স্প্রে। আক্রান্ত পাতা নষ্ট করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'man-003',
        name: 'Mango (Organic Farming)',
        scientific_name: 'Mangifera indica',
        local_names: { bangla: 'আম', chatgaiya: 'আম', english: 'Mango' },
        season: { rabi: true, kharif1: true, kharif2: false, best_months: 'মার্চ-সেপ্টেম্বর' },
        soil: { type: 'দোআঁশ বা বালুআঁশ', pH: '5.5-7.5', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 40, optimal: 28, unit: '°C' },
        watering: { frequency: 'সপ্তাহে ১-২ বার', method: 'পরিবাহী সেচ', amount: '৫০-২০০ লিটার/গাছ' },
        fertilizer_schedule: [
            { stage: 'ফুল ফোটার আগে', fertilizer: 'ভার্মিকমপোস্ট', amount: '১৫-২০ কেজি/গাছ' },
            { stage: 'ফল ধরার পর', fertilizer: 'জীবাণুমুক্ত গোবর', amount: '১০-১৫ কেজি/গাছ' },
            { stage: 'ফল তোলার পর', fertilizer: 'পঞ্চগব্য', amount: '৫ লিটার/গাছ' }
        ],
        organic_fertilizer: ['ভার্মিকমপোস্ট', 'জীবাণুমুক্ত গোবর', 'পঞ্চগব্য', 'ইঁদুনের ছাই'],
        chemical_fertilizer: [],
        diseases: ['অ্যানথ্রাকনোজ', 'পাওডারি মিলডিউ'],
        insects: ['ম্যাংগো ফ্রুট ফ্লাই', 'শুট বোরার'],
        yield: { per_plant: '৪০-৮০ কেজি/গাছ', per_acre: '৮-১২ টন', harvest_days: '৯০-১২০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'গাঢ় হলুদ-কমলা বর্ণ', storage: '১২-১৪°C' },
        tips: ['জৈব চাষে রোগ প্রতিরোধ গুরুত্বপূর্ণ', 'নিম তেল স্প্রে করুন', 'প্রাকৃতিক শত্রু সংরক্ষণ'],
        common_questions: [
            { q: 'জৈব পদ্ধতিতে আম চাষ কীভাবে করবো?', a: 'ভার্মিকমপোস্ট ১৫-২০ কেজি/গাছ দিন। নিম তেল স্প্রে করুন। পঞ্চগব্য ব্যবহার করুন।' },
            { q: 'জৈব চাষে পোকা নিয়ন্ত্রণ কীভাবে?', a: 'নিম তেল ৫ মিলি/লিটার স্প্রে। ফেরোমন ট্র্যাপ ব্যবহার। প্রাকৃতিক শত্রু সংরক্ষণ।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
