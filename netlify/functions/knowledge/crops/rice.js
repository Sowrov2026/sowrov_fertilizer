module.exports = [
    {
        id: 'ric-001',
        name: 'Rice',
        scientific_name: 'Oryza sativa',
        local_names: { bangla: 'ধান', chatgaiya: 'ধান', english: 'Rice' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'সারা বছর (আউস, বোরো, অমন)' },
        soil: { type: 'কাদা মাটি', pH: '5.5-6.5', drainage: 'জলাবদ্ধ মাটি উপযোগী' },
        temperature: { min: 20, max: 35, optimal: 28, unit: '°C' },
        watering: { frequency: 'সারা বছর', method: 'পলাবদ্ধ সেচ', amount: '৫-১০ সেমি পানি স্তর' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট/গোবর', amount: '৫-৮ টন/একর' },
            { stage: 'রোপণের ৭ দিন পর', fertilizer: 'ইউরিয়া', amount: '২৫-৩০ কেজি/একর' },
            { stage: '৩০ দিন (শাখা-প্রশাখা)', fertilizer: 'ইউরিয়া', amount: '৩০-৩৫ কেজি/একর' },
            { stage: '৫০-৫৫ দিন (বোঁটা ফোটা)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '২৫ কেজি + ২০ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার', 'পঞ্চগব্য', 'কমপোস্ট চা', 'বনেমা'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি', 'জিপসাম'],
        diseases: ['ব্লাস্ট', 'শিউথ ব্লাইট', 'হরিতকী', 'ব্রাউন স্পট', 'গ্র্যান ব্লাস্ট', 'ব্যাকটেরিয়াল ব্লাইট'],
        insects: ['ব্রাউন প্লান্ট হোপার', 'স্টেম বোরার', 'গল্ডেন স্নেইল', 'কাট ওয়ার্ম', 'লিফ ফোল্ডার'],
        yield: { per_plant: 'N/A', per_acre: '৩-৫ টন', harvest_days: '১২০-১৫০ দিন (জাত অনুযায়ী)' },
        harvest: { method: 'হাতে কাটা/মেশিন', indicators: 'শস্যের হলুদ বর্ণ, দানা শক্ত', storage: 'শুকনো জায়গায়, ১০-১২% আর্দ্রতা' },
        tips: ['উন্নত জাত ব্যবহার করুন (BRRI, BR সিরিজ)', 'বীজ শোধন অবশ্যই করুন', 'জল পরিচালনা ভালো করুন', 'অপ্রয়োজনীয় আগাছা দূর করুন'],
        common_questions: [
            { q: 'ধানে কোন সার দেবো?', a: 'ইউরিয়া ৮০-১০০ কেজি/একর, ডিএপি ৪০-৫০ কেজি/একর, কেসিএ ৩০-৪০ কেজি/একর। তিন ভাগে ভাগ করে প্রয়োগ।' },
            { q: 'ধানে ব্লাস্ট রোগ কীভাবে বন্ধ করবো?', a: 'ব্লাস্ট প্রতিরোধী জাত ব্যবহার করুন। ট্রাইসাইক্লাজল ০.৬ গ্রাম/লিটার স্প্রে। জল পরিচালনা ভালো করুন।' },
            { q: 'বোরো ধান কখন রোপণ করবো?', a: 'নভেম্বর-ডিসেম্বরে বীজ বপন। ডিসেম্বরের শেষ থেকে জানুয়ারিতে রোপণ।' }
        ],
        source: 'BRRI',
        url: 'https://brri.gov.bd'
    },
    {
        id: 'ric-002',
        name: 'Rice (Disease Guide)',
        scientific_name: 'Oryza sativa',
        local_names: { bangla: 'ধান', chatgaiya: 'ধান', english: 'Rice' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'সারা বছর' },
        soil: { type: 'কাদা মাটি', pH: '5.5-6.5', drainage: 'জলাবদ্ধ' },
        temperature: { min: 20, max: 35, optimal: 28, unit: '°C' },
        watering: { frequency: 'সারা বছর', method: 'পলাবদ্ধ সেচ', amount: '৫-১০ সেমি' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'গোবর সার', amount: '৫-৮ টন/একর' },
            { stage: 'রোপণের ৭ দিন পর', fertilizer: 'ইউরিয়া', amount: '২৫-৩০ কেজি/একর' },
            { stage: '৩০ দিন', fertilizer: 'ইউরিয়া', amount: '৩০-৩৫ কেজি/একর' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['ব্লাস্ট', 'শিউথ ব্লাইট', 'হরিতকী', 'ব্রাউন স্পট', 'গ্র্যান ব্লাস্ট'],
        insects: ['ব্রাউন প্লান্ট হোপার', 'স্টেম বোরার'],
        yield: { per_plant: 'N/A', per_acre: '৩-৫ টন', harvest_days: '১২০-১৫০ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'হলুদ বর্ণ', storage: 'শুকনো জায়গায়' },
        tips: ['আক্রান্ত পাতা নষ্ট করুন', 'বীজ শোধন করুন', 'জল পরিচালনা ভালো করুন'],
        common_questions: [
            { q: 'ধানে ব্লাস্ট রোগ কী?', a: 'পাতায় হলুদ-বাদামি ডায়মন্ড আকৃতির দাগ তৈরি হয়। মাইক্রোজের ফাংগাসে হয়।' },
            { q: 'ধানে হরিতকী রোগ কীভাবে বন্ধ করবো?', a: 'পরিষ্কার বীজ ব্যবহার করুন। বীজ শোধন করুন। হরিতকী প্রতিরোধী জাত ব্যবহার করুন।' }
        ],
        source: 'BRRI',
        url: 'https://brri.gov.bd'
    },
    {
        id: 'ric-003',
        name: 'Rice (Organic Farming)',
        scientific_name: 'Oryza sativa',
        local_names: { bangla: 'ধান', chatgaiya: 'ধান', english: 'Rice' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'সারা বছর' },
        soil: { type: 'কাদা মাটি', pH: '5.5-6.5', drainage: 'জলাবদ্ধ' },
        temperature: { min: 20, max: 35, optimal: 28, unit: '°C' },
        watering: { frequency: 'সারা বছর', method: 'পলাবদ্ধ সেচ', amount: '৫-১০ সেমি' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'ভার্মিকমপোস্ট', amount: '৬-৮ টন/একর' },
            { stage: 'রোপণের ৭ দিন পর', fertilizer: 'জীবাণুমুক্ত গোবর', amount: '৫০০ কেজি/একর' },
            { stage: '৩০ দিন', fertilizer: 'পঞ্চগব্য', amount: '১০ লিটার/একর' },
            { stage: '৫০ দিন', fertilizer: 'কমপোস্ট চা', amount: '৫ লিটার/একর' }
        ],
        organic_fertilizer: ['ভার্মিকমপোস্ট', 'জীবাণুমুক্ত গোবর', 'পঞ্চগব্য', 'কমপোস্ট চা'],
        chemical_fertilizer: [],
        diseases: ['ব্লাস্ট', 'শিউথ ব্লাইট'],
        insects: ['ব্রাউন প্লান্ট হোপার', 'গল্ডেন স্নেইল'],
        yield: { per_plant: 'N/A', per_acre: '২.৫-৪ টন', harvest_days: '১৩০-১৬০ দিন' },
        harvest: { method: 'হাতে কাটা', indicators: 'হলুদ বর্ণ', storage: 'শুকনো জায়গায়' },
        tips: ['জৈব চাষে রোগ প্রতিরোধ গুরুত্বপূর্ণ', 'নিম তেল স্প্রে করুন', 'প্রাকৃতিক শত্রু সংরক্ষণ'],
        common_questions: [
            { q: 'জৈব পদ্ধতিতে ধান চাষ কীভাবে করবো?', a: 'ভার্মিকমপোস্ট ৬-৮ টন/একর দিন। পঞ্চগব্য স্প্রে করুন। জীবাণুমুক্ত গোবর ব্যবহার করুন।' },
            { q: 'জৈব চাষে পোকা নিয়ন্ত্রণ কীভাবে?', a: 'নিম তেল ৫ মিলি/লিটার স্প্রে। স্টিকি ট্র্যাপ ব্যবহার। প্রাকৃতিক শত্রু সংরক্ষণ।' }
        ],
        source: 'BRRI',
        url: 'https://brri.gov.bd'
    }
];
