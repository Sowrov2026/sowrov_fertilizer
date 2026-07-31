/**
 * Agriculture Knowledge Base — V8 RAG Engine
 * Pre-built structured knowledge from official Bangladesh agriculture sources
 * Indexed at build-time, retrieved at runtime via keyword matching + metadata filtering
 */

const KNOWLEDGE_BASE = [
    // ─────────────────────────────────────────────
    // TOMATO (টমেটো)
    // ─────────────────────────────────────────────
    {
        id: 'tom-001',
        title: 'টমেটো পাতা হলুদ রোগ',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'টমেটো',
        disease: 'পাতা হলুদ',
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'টমেটোতে পাতা হলুদ রোগ সাধারণত নিট্রোজেন অভাব বা ফাংগাল সংক্রমণে হয়। প্রথমে নিচের পাতা হলুদ হয়। ধীরে ধীরে উপরে ছড়িয়ে পড়ে। জৈব সমাধান: নিম পেস্ট, ট্রাইকোডার্মা। রাসায়নিক: ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার।',
    },
    {
        id: 'tom-002',
        title: 'টমেটোতে ইউরিয়া সার প্রয়োগ',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'টমেটো',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'টমেটোতে ইউরিয়া সার প্রয়োগ: মাশরুম ১০০-১২০ কেজি/একর। বীজ বপনের ৩০ দিন পর প্রথম শাখা-প্রশাখা গজানোর সময় এবং ফল ধরার সময় দিতে হয়। সপ্তাহে ১-২ বার পাতায় স্প্রে করতে হয়।',
    },
    {
        id: 'tom-003',
        title: 'টমেটো ফোমোপসিস লিফ স্পট',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'টমেটো',
        disease: 'পাতায় দাগ',
        season: 'বর্ষা',
        language: 'bangla',
        content: 'ফোমোপসিস লিফ স্পট রোগে পাতায় বৃত্তাকার বাদামি দাগ তৈরি হয়। কেন্দ্র মলিচ বর্ণের হয়। প্রতিরোধ: আক্রান্ত পাতা নষ্ট করে ফেলুন। বীজ শুকনো জায়গায় রাখুন। ম্যাঙ্কোজেব বা কপার অক্সিক্লোরাইড ব্যবহার করুন।',
    },
    {
        id: 'tom-004',
        title: 'টমেটো ব্যাকটেরিয়াল স্পট',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'টমেটো',
        disease: 'ব্যাকটেরিয়াল স্পট',
        season: 'বর্ষা',
        language: 'bangla',
        content: 'ব্যাকটেরিয়াল স্পটে পাতায় ছোট ছোট গোলাকার হলুদ দাগ তৈরি হয়। পানি লাগার পর ছড়িয়ে পড়ে। প্রতিরোধ: ভালো জল নিষ্কাশন। স্ট্রেপটোসাইক্লিন বা কপার হাইড্রক্সাইড ব্যবহার।',
    },
    {
        id: 'tom-005',
        title: 'টমেটো ফল পচা',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'টমেটো',
        disease: 'ফল পচা',
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'টমেটোর ফল পচা সাধারণত ক্যালসিয়াম অভাব বা ফাংগাল সংক্রমণে হয়। ফলের গোড়ায় কালো বা বাদামি দাগ তৈরি হয়। জৈব সমাধান: ক্যালসিয়াম সাপ্লিমেন্ট পাতায় স্প্রে। রাসায়নিক: ক্যালসিয়াম ক্লোরাইড ৫ গ্রাম/লিটার।',
    },

    // ─────────────────────────────────────────────
    // CHILI (মরিচ)
    // ─────────────────────────────────────────────
    {
        id: 'chi-001',
        title: 'মরিচের পাতা কুঁকড়ানো রোগ',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'মরিচ',
        disease: 'পাতা কুঁকড়ানো',
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'মরিচের পাতা কুঁকড়ানো রোগ সাধারণত থ্রিপ্স বা ভাইরাস সংক্রমণে হয়। পাতা উপরের দিকে কুঁকড়ে যায়। জৈব সমাধান: নিম তেল স্প্রে, থ্রিপ্স ধরতে নীল পণ্য। রাসায়নিক: ডাইমিথোয়েট ১ মিলি/লিটার।',
    },
    {
        id: 'chi-002',
        title: 'মরিচে ইউরিয়া সার প্রয়োগ',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'মরিচ',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'মরিচে ইউরিয়া সার: ৮০-১০০ কেজি/একর। বীজ বপনের ২৫-৩০ দিন পর প্রথম প্রয়োগ। ফুল ফোটার সময় দ্বিতীয় প্রয়োগ। পাতায় ২% ইউরিয়া স্প্রে করলে ফল বেশি ধরে।',
    },
    {
        id: 'chi-003',
        title: 'মরিচ অ্যানথ্রাকনোজ রোগ',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'মরিচ',
        disease: 'অ্যানথ্রাকনোজ',
        season: 'বর্ষা',
        language: 'bangla',
        content: 'অ্যানথ্রাকনোজে মরিচের ফলে ছোট গর্তযুক্ত দাগ তৈরি হয়। ফল গলে যায়। প্রতিরোধ: আক্রান্ত ফল তুলে ফেলুন। কপার অক্সিক্লোরাইড ব্যবহার। ভালো জল নিষ্কাশন রাখুন।',
    },

    // ─────────────────────────────────────────────
    // EGGPLANT (বেগুন)
    // ─────────────────────────────────────────────
    {
        id: 'egg-001',
        title: 'বেগুনের পাতা হলুদ রোগ',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'বেগুন',
        disease: 'পাতা হলুদ',
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'বেগুনের পাতা হলুদ রোগ ভার্টিসিলিয়াম ফাংগাসে হয়। প্রথমে নিচের পাতা হলুদ হয়। ধীরে ধীরে গাছ মরে যায়। জৈব সমাধান: ট্রাইকোডার্মা ৫ গ্রাম/লিটার। রাসায়নিক: কার্বেন্ডাজিম ১ গ্রাম/লিটার।',
    },
    {
        id: 'egg-002',
        title: 'বেগুন ফল বোরোর পোকা',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'বেগুন',
        disease: 'ফল বোরো',
        season: 'গ্রীষ্ম',
        language: 'bangla',
        content: 'ফল বোরোর পোকা বেগুনের ফলের ভেতরে পোকা দেয়। ফল ভেতর থেকে পচে। প্রতিরোধ: ফেরোমন ট্র্যাপ ব্যবহার। আক্রান্ত ফল তুলে ফেলুন। নিম তেল স্প্রে।',
    },

    // ─────────────────────────────────────────────
    // RICE (ধান)
    // ─────────────────────────────────────────────
    {
        id: 'ric-001',
        title: 'ধানের ব্লাস্ট রোগ',
        source: 'BRRI',
        url: 'https://brri.gov.bd',
        crop: 'ধান',
        disease: 'ব্লাস্ট',
        season: 'বর্ষা',
        language: 'bangla',
        content: 'ধানের ব্লাস্ট রোগ মাইক্রোজের ফাংগাসে হয়। পাতায় হলুদ-বাদামি ডায়মন্ড আকৃতির দাগ তৈরি হয়। প্রতিরোধ: ব্লাস্ট প্রতিরোধী জাত ব্যবহার। ট্রাইসাইক্লাজল ০.৬ গ্রাম/লিটার স্প্রে। জল পরিচালনা ভালো করুন।',
    },
    {
        id: 'ric-002',
        title: 'ধানে ইউরিয়া সার প্রয়োগ',
        source: 'BRRI',
        url: 'https://brri.gov.bd',
        crop: 'ধান',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'ধানে ইউরিয়া সার: আউস ধানে ৮০-১০০ কেজি/একর। বোরো ধানে ১০০-১২০ কেজি/একর। তিন ভাগে ভাগ করে প্রয়োগ: রোপার ৭ দিন পর, ৩০ দিন পর, ৫০ দিন পর।',
    },
    {
        id: 'ric-003',
        title: 'ধানের শিউথ ব্লাইট',
        source: 'BRRI',
        url: 'https://brri.gov.bd',
        crop: 'ধান',
        disease: 'শিউথ ব্লাইট',
        season: 'বর্ষা',
        language: 'bangla',
        content: 'শিউথ ব্লাইটে ধানের কাণ্ডের গোড়ায় সাদা দাগ তৈরি হয়। গাছ ভেঙে পড়ে। প্রতিরোধ: বীজ শোধন। ট্রাইসাইক্লাজল বীজ শোধনে ব্যবহার। ভালো জল পরিচালনা।',
    },

    // ─────────────────────────────────────────────
    // POTATO (আলু)
    // ─────────────────────────────────────────────
    {
        id: 'pot-001',
        title: 'আলুর লেট ব্লাইট',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'আলু',
        disease: 'লেট ব্লাইট',
        season: 'শীত',
        language: 'bangla',
        content: 'আলুর লেট ব্লাইট ফাংগাল রোগ। পাতায় কালো-বাদামি দাগ তৈরি হয়। কাণ্ড পচে। প্রতিরোধ: লেট ব্লাইট প্রতিরোধী জাত। ম্যাঙ্কোজেব ২.৫ গ্রাম/লিটার। ভালো জল নিষ্কাশন।',
    },

    // ─────────────────────────────────────────────
    // ONION (পেঁয়াজ)
    // ─────────────────────────────────────────────
    {
        id: 'oni-001',
        title: 'পেঁয়াজের ব্লাইট',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'পেঁয়াজ',
        disease: 'ব্লাইট',
        season: 'শীত',
        language: 'bangla',
        content: 'পেঁয়াজের ব্লাইটে পাতার ডগা থেকে শুরু করে হলুদ হয়ে মরে। প্রতিরোধ: ভালো জল নিষ্কাশন। ম্যাঙ্কোজেব বা কপার হাইড্রক্সাইড স্প্রে।',
    },

    // ─────────────────────────────────────────────
    // GENERAL FERTILIZER KNOWLEDGE
    // ─────────────────────────────────────────────
    {
        id: 'gen-fer-001',
        title: 'ইউরিয়া সারের ব্যবহার নির্দেশিকা',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'ইউরিয়া ৪৬% নাইট্রোজেন সমৃদ্ধ। পাতায় স্প্রে: ২% দ্রবণ (২০ গ্রাম/লিটার)। মাটিতে: ১০০-১২০ কেজি/একর (ফসল অনুযায়ী ভিন্ন)। ভেজা মাটিতে দিতে হয়। শুকনো মাটিতে দিলে গ্যাস হারিয়ে যায়।',
    },
    {
        id: 'gen-fer-002',
        title: 'ডিএপি সারের ব্যবহার',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'ডিএপি ১৮-৪৬-০ (নাইট্রোজেন-ফসফরাস-পটাশিয়াম)। প্রয়োগ: ২০০-২৫০ কেজি/একর। বীজ বপনের সময় বা তার আগে মাটিতে মিশিয়ে দিতে হয়।',
    },
    {
        id: 'gen-fer-003',
        title: 'কমপোস্ট খাদ্যের উপকারিতা',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'কমপোস্ট খাদ্য মাটির গঠন উন্নত করে। জল ধারণ ক্ষমতা বাড়ায়। মাটির জীবাণু সক্রিয় করে। ৩-৫ টন/একর হারে প্রয়োগ করতে হয়। ফসলের ধরন অনুযায়ী মাত্রা ভিন্ন হতে পারে।',
    },
    {
        id: 'gen-fer-004',
        title: 'ট্রাইকোডার্মা ব্যবহার নির্দেশিকা',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'ট্রাইকোডার্মা জৈব ছত্রাক দ্বারা রোগ প্রতিরোধ করে। বীজ শোধন: ৫ গ্রালিটার পানিতে ১০ মিনিট। মাটিতে: ২.৫ কেজি/একর। পাতায় স্প্রে: ৫ গ্রাম/লিটার। মাটির প্যাথোজেন দমন করে।',
    },
    {
        id: 'gen-fer-005',
        title: 'ভার্মিকমপোস্ট তৈরি ও ব্যবহার',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'ভার্মিকমপোস্ট পোকা দিয়ে তৈরি সার। পুষ্টি সমৃদ্ধ। ২-৩ টন/একর হারে প্রয়োগ। মাটির উর্বরতা বাড়ায়। জৈব চাষের জন্য সেরা। নিম খাদ্য মিশিয়ে দিলে পোকা নিয়ন্ত্রণও হয়।',
    },

    // ─────────────────────────────────────────────
    // GENERAL DISEASE KNOWLEDGE
    // ─────────────────────────────────────────────
    {
        id: 'gen-dis-001',
        title: 'ফাংগাল রোগের সাধারণ চিহ্নিতকরণ',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'সর্বজনীন',
        disease: 'ফাংগাল',
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'ফাংগাল রোগের চিহ্ন: পাতায় দাগ, কুঁকড়ানো, পচা, ছত্রাক জমা। প্রতিরোধ: ভালো জল নিষ্কাশন, আক্রান্ত অংশ কেটে ফেলা, ট্রাইকোডার্মা বা কপার সার ব্যবহার।',
    },
    {
        id: 'gen-dis-002',
        title: 'পোকা নিয়ন্ত্রণের জৈব পদ্ধতি',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'সর্বজনীন',
        disease: 'পোকা',
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'জৈব পোকা নিয়ন্ত্রণ: নিম তেল ৫ মিলি/লিটার। ট্রাইকোডার্মা ৫ গ্রাম/লিটার। নীল পণ্য। ফেরোমন ট্র্যাপ। মিত্র পোকা ব্যবহার (লেডিবার্ড, লেসিজিনিয়া)।',
    },

    // ─────────────────────────────────────────────
    // SEASONAL ADVICE
    // ─────────────────────────────────────────────
    {
        id: 'sea-001',
        title: 'বর্ষাকালে ফসল পরিচর্যা',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'বর্ষা',
        language: 'bangla',
        content: 'বর্ষাকালে ফসল পরিচর্যা: জল নিষ্কাশন ভালো রাখুন। ফাংগাল রোগের ঝুঁকি বেশি। প্রতিরোধমূলক কপার সার স্প্রে করুন। আক্রান্ত পাতা/ফল তুলে ফেলুন। ভালো বাতাস চলাচল রাখুন।',
    },
    {
        id: 'sea-002',
        title: 'গ্রীষ্মকালে সেচ ব্যবস্থাপনা',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'গ্রীষ্ম',
        language: 'bangla',
        content: 'গ্রীষ্মকালে সেচ: সকাল বা সন্ধ্যায় পানি দিন। দুপুরে দিলে গাছ ঝলকে যায়। মালচিং করলে পানি কম লাগে। ড্রিপ ইরিগেশন সেরা।',
    },
    {
        id: 'sea-003',
        title: 'শীতকালে ফসল রক্ষা',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'শীত',
        language: 'bangla',
        content: 'শীতকালে ফসল রক্ষা: কুমড়া, শসা জাতের গাছ ঢাকুন। রাতের তাপমাত্রা কমলে পলিথিন ব্যবহার। পানি কম দিন। সার প্রয়োগ কমান।',
    },

    // ─────────────────────────────────────────────
    // ORGANIC FARMING
    // ─────────────────────────────────────────────
    {
        id: 'org-001',
        title: 'জৈব চাষের মূলনীতি',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'জৈব চাষের মূলনীতি: রাসায়নিক সার ও পেস্টিসাইড ব্যবহার না করা। কমপোস্ট, ভার্মিকমপোস্ট, গোবর সার ব্যবহার। ফসল আবর্তন। মিশ্র চাষ। জৈব পোকা নিয়ন্ত্রণ। বীজ সংরক্ষণ।',
    },
    {
        id: 'org-002',
        title: 'নিম তেলের ব্যবহার',
        source: 'BARI',
        url: 'https://bari.gov.bd',
        crop: 'সর্বজনীন',
        disease: 'পোকা',
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'নিম তেল ৫ মিলি/লিটার পানিতে মিশিয়ে স্প্রে করুন। পোকা নিয়ন্ত্রণ ও ফাংগাল রোগ প্রতিরোধ করে। ফল ধরার ৭ দিন আগে বন্ধ করুন। জৈব চাষের জন্য নিরাপদ।',
    },

    // ─────────────────────────────────────────────
    // SOIL HEALTH
    // ─────────────────────────────────────────────
    {
        id: 'soil-001',
        title: 'মাটি পরীক্ষার গুরুত্ব',
        source: 'DAE',
        url: 'https://dae.gov.bd',
        crop: 'সর্বজনীন',
        disease: null,
        season: 'সর্বকালীন',
        language: 'bangla',
        content: 'মাটি পরীক্ষা করে সার মাত্রা নির্ধারণ করুন। DAE এর কাছে মাটি পরীক্ষার ব্যবস্থা আছে। pH ৬.০-৭.০ সবচেয়ে ভালো। জৈব পদার্থ ২-৩% থাকা উচিত।',
    },
];

/**
 * Search knowledge base by keyword matching + metadata filtering
 * Returns top results sorted by relevance
 */
function searchKnowledgeBase(query, options = {}) {
    if (!query || typeof query !== 'string') return [];

    const { crop, disease, season, limit = 5 } = options;
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    const scored = KNOWLEDGE_BASE.map(doc => {
        let score = 0;
        const contentLower = doc.content.toLowerCase();
        const titleLower = doc.title.toLowerCase();

        // Title exact match (high score)
        if (titleLower.includes(queryLower)) score += 10;

        // Content keyword matching
        for (const word of queryWords) {
            if (contentLower.includes(word)) score += 2;
            if (titleLower.includes(word)) score += 3;
        }

        // Crop filter (boost if matches)
        if (crop && doc.crop === crop) score += 5;
        else if (crop && doc.crop !== 'সর্বজনীন' && doc.crop !== crop) score -= 3;

        // Disease filter
        if (disease && doc.disease) {
            if (doc.disease.includes(disease) || disease.includes(doc.disease)) score += 5;
        }

        // Season filter
        if (season && doc.season === season) score += 3;
        else if (season && doc.season !== 'সর্বকালীন') score -= 2;

        return { ...doc, score };
    });

    return scored
        .filter(doc => doc.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

/**
 * Build context string from retrieved documents for LLM
 */
function buildRAGContext(docs) {
    if (!docs || docs.length === 0) return '';

    let context = '\n\n📚 AGRICULTURE KNOWLEDGE BASE (Official Sources):\n\n';

    docs.forEach((doc, i) => {
        context += `Document ${i + 1}:\n`;
        context += `- Title: ${doc.title}\n`;
        context += `- Source: ${doc.source}\n`;
        context += `- URL: ${doc.url}\n`;
        context += `- Crop: ${doc.crop}\n`;
        if (doc.disease) context += `- Disease: ${doc.disease}\n`;
        if (doc.season) context += `- Season: ${doc.season}\n`;
        context += `- Content: ${doc.content}\n\n`;
    });

    context += '\n⚠️ INSTRUCTIONS: Use these official documents to answer. Reference the sources when relevant. Only cite documents actually retrieved above. Never invent references.\n';

    return context;
}

module.exports = {
    KNOWLEDGE_BASE,
    searchKnowledgeBase,
    buildRAGContext,
};
