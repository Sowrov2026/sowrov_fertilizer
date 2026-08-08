export default [
    {
        id: 'pap-001',
        name: 'Papaya',
        scientific_name: 'Carica papaya',
        local_names: { bangla: 'পেঁপে', chatgaiya: 'পেঁপে', english: 'Papaya' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'সারা বছর (রোপণ ফেব্রুয়ারি-মার্চ, সেপ্টেম্বর-অক্টোবর)' },
        soil: { type: 'দোআঁশ বা বালুআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 38, optimal: 28, unit: '°C' },
        watering: { frequency: 'প্রতি ২-৩ দিন', method: 'ড্রিপ সেচ/ফোয়ারা সেচ', amount: 'প্রতি গাছে ১০-১৫ লিটার' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৫-৮ কেজি/গাছ' },
            { stage: '৩০ দিন', fertilizer: 'ইউরিয়া', amount: '১০০ গ্রাম/গাছ' },
            { stage: '৬০ দিন', fertilizer: 'ইউরিয়া + ডিএপি', amount: '১০০ গ্রাম + ১০০ গ্রাম/গাছ' },
            { stage: '৯০ দিন (ফুল ফোটা)', fertilizer: 'ইউরিয়া + কেসিএ', amount: '১৫০ গ্রাম + ১৫০ গ্রাম/গাছ' },
            { stage: '১২০ দিন (ফল ধরা)', fertilizer: 'কেসিএ', amount: '২০০ গ্রাম/গাছ' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার', 'ভার্মিকমপোস্ট', 'ইঁদুনের ছাই'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ', 'এমওপি'],
        diseases: ['পাপাইয়া রিং স্পট ভাইরাস', 'অ্যানথ্রাকনোজ', 'ফোমোপসিস', 'ব্লাইট', 'ফ্রুট রট'],
        insects: ['ফ্রুট ফ্লাই', 'এফিড', 'হোয়াইটফ্লাই', 'মিট', 'লিফ মাইনার'],
        yield: { per_plant: '২০-৩০ কেজি/গাছ', per_acre: '১৫-২৫ টন', harvest_days: '১৫০-১৮০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'হলুদ-কমলা বর্ণ (১/৪ পাকা)', storage: '১২-১৪°C তাপমাত্রায় ১ সপ্তাহ' },
        tips: ['১.৫x১.৫ মিটার দূরত্বে রোপণ', 'পুরুষ গাছ ১০% রাখুন', 'ফল নরম হলে তুলুন', 'গাছের চারপাশ পরিষ্কার রাখুন'],
        common_questions: [
            { q: 'পেঁপে গাছে কোন সার দেবো?', a: 'কমপোস্ট ৫-৮ কেজি/গাছ, ইউরিয়া ৩৫০ গ্রাম/গাছ, ডিএপি ১০০ গ্রাম/গাছ, কেসিএ ৩৫০ গ্রাম/গাছ' },
            { q: 'পেঁপে রিং স্পট ভাইরাস কীভাবে বন্ধ করবো?', a: 'ভাইরাস প্রতিরোধী জাত ব্যবহার করুন। এফিড নিয়ন্ত্রণ করুন। আক্রান্ত গাছ তুলে ফেলুন।' },
            { q: 'পেঁপে গাছ কখন ফল দেবে?', a: 'রোপণের ১৫০-১৮০ দিন পর। পুরুষ গাছ ১০% রাখতে হবে পরাগায়নের জন্য।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    },
    {
        id: 'pap-002',
        name: 'Papaya (Disease Guide)',
        scientific_name: 'Carica papaya',
        local_names: { bangla: 'পেঁপে', chatgaiya: 'পেঁপে', english: 'Papaya' },
        season: { rabi: true, kharif1: true, kharif2: true, best_months: 'সারা বছর' },
        soil: { type: 'দোআঁশ বা বালুআঁশ', pH: '6.0-7.0', drainage: 'ভালো নিষ্কাশন প্রয়োজন' },
        temperature: { min: 20, max: 38, optimal: 28, unit: '°C' },
        watering: { frequency: 'প্রতি ২-৩ দিন', method: 'ড্রিপ সেচ', amount: '১০-১৫ লিটার/গাছ' },
        fertilizer_schedule: [
            { stage: 'রোপণের সময়', fertilizer: 'কমপোস্ট', amount: '৫-৮ কেজি/গাছ' },
            { stage: '৩০ দিন', fertilizer: 'ইউরিয়া', amount: '১০০ গ্রাম/গাছ' },
            { stage: '৬০ দিন', fertilizer: 'ইউরিয়া + ডিএপি', amount: '১০০ গ্রাম + ১০০ গ্রাম/গাছ' }
        ],
        organic_fertilizer: ['কমপোস্ট', 'গোবর সার'],
        chemical_fertilizer: ['ইউরিয়া', 'ডিএপি', 'কেসিএ'],
        diseases: ['পাপাইয়া রিং স্পট ভাইরাস', 'অ্যানথ্রাকনোজ', 'ফোমোপসিস'],
        insects: ['ফ্রুট ফ্লাই', 'এফিড', 'হোয়াইটফ্লাই'],
        yield: { per_plant: '২০-৩০ কেজি/গাছ', per_acre: '১৫-২৫ টন', harvest_days: '১৫০-১৮০ দিন' },
        harvest: { method: 'হাতে তোলা', indicators: 'হলুদ-কমলা বর্ণ', storage: '১২-১৪°C' },
        tips: ['আক্রান্ত গাছ তুলে ফেলুন', 'এফিড নিয়ন্ত্রণ করুন', 'ভালো নিষ্কাশন রাখুন'],
        common_questions: [
            { q: 'পেঁপে রিং স্পট ভাইরাস কী?', a: 'পাতায় গোলাকার দাগ তৈরি হয়। ফল খাটো ও অপুষ্ট হয়। ভাইরাসে হয়।' },
            { q: 'পেঁপে অ্যানথ্রাকনোজ কীভাবে বন্ধ করবো?', a: 'কপার অক্সিক্লোরাইড ৩ গ্রাম/লিটার স্প্রে। আক্রান্ত ফল নষ্ট করুন।' }
        ],
        source: 'BARI',
        url: 'https://bari.gov.bd'
    }
];
