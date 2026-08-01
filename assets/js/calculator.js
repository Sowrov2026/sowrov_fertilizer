// ==========================================
// SF AI V15 — FERTILIZER CALCULATOR MODULE
// Sowrov Fertilizer
// ==========================================

const AREA_CONVERSIONS = {
    'বিঘা': { toBigha: 1, toShotok: 20, toAcre: 0.333, toKatha: 40, toSqm: 2508 },
    'শতক': { toBigha: 0.05, toShotok: 1, toAcre: 0.0167, toKatha: 2, toSqm: 125.4 },
    'একর': { toBigha: 3, toShotok: 60, toAcre: 1, toKatha: 120, toSqm: 4047 },
    'কাঠা': { toBigha: 0.025, toShotok: 0.5, toAcre: 0.0083, toKatha: 1, toSqm: 62.7 },
};

const UNIT_NAMES = {
    'bigha': 'বিঘা',
    'shotok': 'শতক',
    'acre': 'একর',
    'katha': 'কাঠা',
    'sqm': 'বর্গ মিটার',
};

const FERTILIZER_INFO = {
    'ট্রাইকোডার্মা': {
        type: 'জৈব ছত্রাক',
        purpose: 'মাটির রোগ নিয়ন্ত্রণ ও মূল গলা রোগ প্রতিরোধ',
        unit: 'গ্রাম',
        avgPrice: 200,
        priceUnit: 'প্রতি কেজি',
        description: 'মাটিতে ক্ষতিকর ছত্রাক ধ্বংস করে এবং গাছের মূল স্বাস্থ্য রক্ষা করে',
    },
    'NPK': {
        type: 'সুষম সার',
        purpose: 'নাইট্রোজেন, ফসফরাস ও পটাশিয়াম সরবরাহ',
        unit: 'কেজি',
        avgPrice: 60,
        priceUnit: 'প্রতি কেজি',
        description: 'তিনটি প্রধান উপাদানের সুষম মিশ্রণ — গাছের সর্বোমোট বৃদ্ধির জন্য',
    },
    'DAP': {
        type: 'ফসফরিক সার',
        purpose: 'মূল বিকাশ ও ফুল ফোটায় সহায়তা',
        unit: 'কেজি',
        avgPrice: 55,
        priceUnit: 'প্রতি কেজি',
        description: 'ডায়অ্যামোনিয়াম ফসফেট — মূল শক্তি ও ফলন বৃদ্ধির জন্য',
    },
    'পটাশ': {
        type: 'পটাশিয়াম সার',
        purpose: 'ফলের মান ও রঙ উন্নত করে',
        unit: 'কেজি',
        avgPrice: 50,
        priceUnit: 'প্রতি কেজি',
        description: 'ফলের আকার, রঙ ও স্বাদ উন্নত করে এবং রোগ প্রতিরোধ ক্ষমতা বাড়ায়',
    },
    'ইউরিয়া': {
        type: 'নাইট্রোজেন সার',
        purpose: 'পাতার বৃদ্ধি ও সবুজ রঙ বজায়',
        unit: 'কেজি',
        avgPrice: 30,
        priceUnit: 'প্রতি কেজি',
        description: 'নাইট্রোজেনের উচ্চ সমৃদ্ধ — দ্রুত বৃদ্ধি ও সবুজতা বজায়',
    },
    'কমপোস্ট': {
        type: 'জৈব সার',
        purpose: 'মাটির গঠন উন্নতি ও পুষ্টি সরবরাহ',
        unit: 'কেজি',
        avgPrice: 20,
        priceUnit: 'প্রতি কেজি',
        description: 'জৈব পদার্থ দিয়ে তৈরি — মাটির জল ধারণ ও উর্বরতা বৃদ্ধি',
    },
    'ভার্মিকমপোস্ট': {
        type: 'জৈব সার',
        purpose: 'সুষম পুষ্টি ও মাটির জীববৈচিত্র্য',
        unit: 'কেজি',
        avgPrice: 40,
        priceUnit: 'প্রতি কেজি',
        description: 'কৃমি দিয়ে প্রক্রিয়াকৃত জৈব সার — সমৃদ্ধ পুষ্টি ও উপকারী অণুবীক্ষণিক জীব',
    },
    'বেজোসার': {
        type: 'জৈব সার',
        purpose: 'নাইট্রোজেন স্থিরীকরণ ও মাটির উর্বরতা',
        unit: 'কেজি',
        avgPrice: 35,
        priceUnit: 'প্রতি কেজি',
        description: 'ব্যাকটেরিয়াল সার — বায়ুমণ্ডল থেকে নাইট্রোজেন স্থির করে',
    },
    'জিপসাম': {
        type: 'খনিজ সার',
        purpose: 'সালফার ও ক্যালসিয়াম সরবরাহ',
        unit: 'কেজি',
        avgPrice: 15,
        priceUnit: 'প্রতি কেজি',
        description: 'মাটির অম্লতা কমায় ও সালফার পুষ্টি সরবরাহ করে',
    },
};

const FERTILIZER_DATA = {
    'টমেটো': {
        nameEn: 'Tomato',
        emoji: '🍅',
        basePerBigha: { 'ইউরিয়া': 2, 'DAP': 3, 'পটাশ': 2.5, 'কমপোস্ট': 50, 'ট্রাইকোডার্মা': 0.5 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৫০ কেজি/বিঘা', 'ট্রাইকোডার্মা ৫০০ গ্রাম/বিঘা'] },
            { name: 'রোপণের সময়', timing: 'রোপণের দিন', fertilizers: ['DAP ৩ কেজি/বিঘা'] },
            { name: '১৫ দিন পর', timing: 'রোপণের ১৫ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা'] },
            { name: 'ফুল ফোটার সময়', timing: 'ফুল ফোটার সময়', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা', 'পটাশ ১.৫ কেজি/বিঘা'] },
            { name: 'ফল ধরার সময়', timing: 'ফল ধরার সময়', fertilizers: ['পটাশ ১ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'প্রতি ১৫ দিন পর পুনরায় ইউরিয়া দিতে হবে',
    },
    'ধান': {
        nameEn: 'Rice',
        emoji: '🌾',
        basePerBigha: { 'ইউরিয়া': 3, 'DAP': 2, 'পটাশ': 1.5, 'জিপসাম': 10 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৫০ কেজি/বিঘা'] },
            { name: 'রোপণের সময়', timing: 'রোপণের দিন', fertilizers: ['DAP ২ কেজি/বিঘা', 'জিপসাম ১০ কেজি/বিঘা'] },
            { name: '২০ দিন পর', timing: 'রোপণের ২০ দিন পর', fertilizers: ['ইউরিয়া ১.৫ কেজি/বিঘা'] },
            { name: '৪০ দিন পর', timing: 'রোপণের ৪০ দিন পর', fertilizers: ['ইউরিয়া ১.৫ কেজি/বিঘা', 'পটাশ ১.৫ কেজি/বিঘা'] },
        ],
        method: 'পানিতে মিশিয়ে ছিটিয়ে দিতে হবে',
        notes: 'পানির উচ্চতা ৫-৭ সেমি রাখতে হবে',
    },
    'মরিচ': {
        nameEn: 'Chili',
        emoji: '🌶️',
        basePerBigha: { 'ইউরিয়া': 2.5, 'DAP': 2, 'পটাশ': 2, 'কমপোস্ট': 40, 'ট্রাইকোডার্মা': 500 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৪০ কেজি/বিঘা', 'ট্রাইকোডার্মা ৫০০ গ্রাম/বিঘা'] },
            { name: 'রোপণের সময়', timing: 'রোপণের দিন', fertilizers: ['DAP ২ কেজি/বিঘা'] },
            { name: '১৫ দিন পর', timing: 'রোপণের ১৫ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা'] },
            { name: 'ফুল ফোটার সময়', timing: 'ফুল ফোটার সময়', fertilizers: ['ইউরিয়া ১.৫ কেজি/বিঘা', 'পটাশ ১ কেজি/বিঘা'] },
            { name: 'ফল ধরার সময়', timing: 'ফল ধরার সময়', fertilizers: ['পটাশ ১ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'ফুল ফোটার সময় বেশি পটাশ প্রয়োজন',
    },
    'বেগুন': {
        nameEn: 'Brinjal',
        emoji: '🍆',
        basePerBigha: { 'ইউরিয়া': 2, 'DAP': 2.5, 'পটাশ': 1.5, 'কমপোস্ট': 45, 'ট্রাইকোডার্মা': 500 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৪৫ কেজি/বিঘা', 'ট্রাইকোডার্মা ৫০০ গ্রাম/বিঘা'] },
            { name: 'রোপণের সময়', timing: 'রোপণের দিন', fertilizers: ['DAP ২.৫ কেজি/বিঘা'] },
            { name: '২০ দিন পর', timing: 'রোপণের ২০ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা'] },
            { name: 'ফুল ফোটার সময়', timing: 'ফুল ফোটার সময়', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা', 'পটাশ ১.৫ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'মালচিং করলে ভালো ফলন হয়',
    },
    'আলু': {
        nameEn: 'Potato',
        emoji: '🥔',
        basePerBigha: { 'ইউরিয়া': 3, 'DAP': 3, 'পটাশ': 2, 'কমপোস্ট': 40 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'বীজ বোনার ৭ দিন আগে', fertilizers: ['কমপোস্ট ৪০ কেজি/বিঘা'] },
            { name: 'বীজ বোনার সময়', timing: 'বীজ বোনার দিন', fertilizers: ['DAP ৩ কেজি/বিঘা', 'পটাশ ১ কেজি/বিঘা'] },
            { name: '৩০ দিন পর', timing: 'বীজ বোনার ৩০ দিন পর', fertilizers: ['ইউরিয়া ২ কেজি/বিঘা'] },
            { name: '৫০ দিন পর', timing: 'বীজ বোনার ৫০ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা', 'পটাশ ১ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'বীজ বোনার সময় কূপায় সার দিতে হবে',
    },
    'পেঁয়াজ': {
        nameEn: 'Onion',
        emoji: '🧅',
        basePerBigha: { 'ইউরিয়া': 2, 'DAP': 2, 'পটাশ': 2, 'কমপোস্ট': 30 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'চারা রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৩০ কেজি/বিঘা'] },
            { name: 'চারা রোপণের সময়', timing: 'চারা রোপণের দিন', fertilizers: ['DAP ২ কেজি/বিঘা'] },
            { name: '২০ দিন পর', timing: 'রোপণের ২০ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা'] },
            { name: '৪৫ দিন পর', timing: 'রোপণের ৪৫ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা', 'পটাশ ২ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'পানি জমানো যাবে না, মালচিং করতে হবে',
    },
    'রসুন': {
        nameEn: 'Garlic',
        emoji: '🧄',
        basePerBigha: { 'ইউরিয়া': 1.5, 'DAP': 2, 'পটাশ': 1.5, 'কমপোস্ট': 35 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'ক্ষুদ্র রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৩৫ কেজি/বিঘা'] },
            { name: 'ক্ষুদ্র রোপণের সময়', timing: 'ক্ষুদ্র রোপণের দিন', fertilizers: ['DAP ২ কেজি/বিঘা'] },
            { name: '২৫ দিন পর', timing: 'রোপণের ২৫ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা'] },
            { name: '৫০ দিন পর', timing: 'রোপণের ৫০ দিন পর', fertilizers: ['পটাশ ১.৫ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'পানি কম দিতে হবে',
    },
    'কলা': {
        nameEn: 'Banana',
        emoji: '🍌',
        basePerBigha: { 'ইউরিয়া': 4, 'DAP': 2, 'পটাশ': 3, 'কমপোস্ট': 60 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'চারা রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৬০ কেজি/বিঘা'] },
            { name: 'চারা রোপণের সময়', timing: 'চারা রোপণের দিন', fertilizers: ['DAP ২ কেজি/বিঘা'] },
            { name: '১ মাস পর', timing: 'রোপণের ১ মাস পর', fertilizers: ['ইউরিয়া ২ কেজি/বিঘা'] },
            { name: '৩ মাস পর', timing: 'রোপণের ৩ মাস পর', fertilizers: ['ইউরিয়া ২ কেজি/বিঘা', 'পটাশ ৩ কেজি/বিঘা'] },
            { name: 'ফল ধরার সময়', timing: 'ফল ধরার সময়', fertilizers: ['পটাশ ১ কেজি/বিঘা'] },
        ],
        method: 'গাছের গোড়ায় মাটি তুলে দিতে হবে',
        notes: 'প্রতিটি গাছের জন্য আলাদাভাবে সার দিতে হবে',
    },
    'পেপে': {
        nameEn: 'Papaya',
        emoji: '🍈',
        basePerBigha: { 'ইউরিয়া': 3, 'DAP': 2.5, 'পটাশ': 2, 'কমপোস্ট': 50 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'চারা রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৫০ কেজি/বিঘা'] },
            { name: 'চারা রোপণের সময়', timing: 'চারা রোপণের দিন', fertilizers: ['DAP ২.৫ কেজি/বিঘা'] },
            { name: '২ মাস পর', timing: 'রোপণের ২ মাস পর', fertilizers: ['ইউরিয়া ১.৫ কেজি/বিঘা'] },
            { name: '৪ মাস পর', timing: 'রোপণের ৪ মাস পর', fertilizers: ['ইউরিয়া ১.৫ কেজি/বিঘা', 'পটাশ ২ কেজি/বিঘা'] },
        ],
        method: 'গাছের গোড়ায় মাটি তুলে দিতে হবে',
        notes: 'ফল ধরার পর বেশি পটাশ প্রয়োজন',
    },
    'লাউ': {
        nameEn: 'Gourd',
        emoji: '🥬',
        basePerBigha: { 'ইউরিয়া': 2, 'DAP': 2, 'পটাশ': 1.5, 'কমপোস্ট': 40 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'বীজ বোনার ৭ দিন আগে', fertilizers: ['কমপোস্ট ৪০ কেজি/বিঘা'] },
            { name: 'বীজ বোনার সময়', timing: 'বীজ বোনার দিন', fertilizers: ['DAP ২ কেজি/বিঘা'] },
            { name: '১৫ দিন পর', timing: 'বীজ বোনার ১৫ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা'] },
            { name: 'ফুল ফোটার সময়', timing: 'ফুল ফোটার সময়', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা', 'পটাশ ১.৫ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'জাল দিয়ে চড়ানো যায়',
    },
    'শসা': {
        nameEn: 'Cucumber',
        emoji: '🥒',
        basePerBigha: { 'ইউরিয়া': 2, 'DAP': 2, 'পটাশ': 1.5, 'কমপোস্ট': 35 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'বীজ বোনার ৭ দিন আগে', fertilizers: ['কমপোস্ট ৩৫ কেজি/বিঘা'] },
            { name: 'বীজ বোনার সময়', timing: 'বীজ বোনার দিন', fertilizers: ['DAP ২ কেজি/বিঘা'] },
            { name: '১৫ দিন পর', timing: 'বীজ বোনার ১৫ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা'] },
            { name: 'ফুল ফোটার সময়', timing: 'ফুল ফোটার সময়', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা', 'পটাশ ১.৫ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'নিয়মিত পানি দিতে হবে',
    },
    'তরমুজ': {
        nameEn: 'Watermelon',
        emoji: '🍉',
        basePerBigha: { 'ইউরিয়া': 2.5, 'DAP': 2.5, 'পটাশ': 2, 'কমপোস্ট': 45 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'বীজ বোনার ৭ দিন আগে', fertilizers: ['কমপোস্ট ৪৫ কেজি/বিঘা'] },
            { name: 'বীজ বোনার সময়', timing: 'বীজ বোনার দিন', fertilizers: ['DAP ২.৫ কেজি/বিঘা'] },
            { name: '২০ দিন পর', timing: 'বীজ বোনার ২০ দিন পর', fertilizers: ['ইউরিয়া ১.৫ কেজি/বিঘা'] },
            { name: 'ফল ধরার সময়', timing: 'ফল ধরার সময়', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা', 'পটাশ ২ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'বালুকাময় মাটিতে ভালো ফলন হয়',
    },
    'বাঁধাকপি': {
        nameEn: 'Cabbage',
        emoji: '🥬',
        basePerBigha: { 'ইউরিয়া': 2.5, 'DAP': 2, 'পটাশ': 1.5, 'কমপোস্ট': 40 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'চারা রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৪০ কেজি/বিঘা'] },
            { name: 'চারা রোপণের সময়', timing: 'চারা রোপণের দিন', fertilizers: ['DAP ২ কেজি/বিঘা'] },
            { name: '১৫ দিন পর', timing: 'রোপণের ১৫ দিন পর', fertilizers: ['ইউরিয়া ১.৫ কেজি/বিঘা'] },
            { name: '৩০ দিন পর', timing: 'রোপণের ৩০ দিন পর', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা', 'পটাশ ১.৫ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'পোকা নিয়ন্ত্রণ প্রয়োজন',
    },
    'ফুলফি': {
        nameEn: 'Cauliflower',
        emoji: '🥦',
        basePerBigha: { 'ইউরিয়া': 2.5, 'DAP': 2, 'পটাশ': 1.5, 'কমপোস্ট': 40 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'চারা রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৪০ কেজি/বিঘা'] },
            { name: 'চারা রোপণের সময়', timing: 'চারা রোপণের দিন', fertilizers: ['DAP ২ কেজি/বিঘা'] },
            { name: '১৫ দিন পর', timing: 'রোপণের ১৫ দিন পর', fertilizers: ['ইউরিয়া ১.৫ কেজি/বিঘা'] },
            { name: 'ফুল তৈরির সময়', timing: 'ফুল তৈরির সময়', fertilizers: ['ইউরিয়া ১ কেজি/বিঘা', 'পটাশ ১.৫ কেজি/বিঘা'] },
        ],
        method: 'মাটির সাথে মিশিয়ে দিতে হবে',
        notes: 'ফুল ঢাকা লাগালে সাদা থাকে',
    },
    'আম': {
        nameEn: 'Mango',
        emoji: '🥭',
        basePerBigha: { 'ইউরিয়া': 1.5, 'DAP': 1, 'পটাশ': 1.5, 'কমপোস্ট': 30 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'গাছ রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ৩০ কেজি/বিঘা'] },
            { name: 'গাছ রোপণের সময়', timing: 'গাছ রোপণের দিন', fertilizers: ['DAP ১ কেজি/বিঘা'] },
            { name: '২ মাস পর', timing: 'রোপণের ২ মাস পর', fertilizers: ['ইউরিয়া ০.৭৫ কেজি/বিঘা'] },
            { name: 'ফুল ফোটার সময়', timing: 'ফুল ফোটার সময়', fertilizers: ['ইউরিয়া ০.৭৫ কেজি/বিঘা', 'পটাশ ১.৫ কেজি/বিঘা'] },
        ],
        method: 'গাছের গোড়ায় মাটি তুলে দিতে হবে',
        notes: 'পুরনো গাছে বেশি সার প্রয়োজন',
    },
    'কাঁঠাল': {
        nameEn: 'Jackfruit',
        emoji: '🫒',
        basePerBigha: { 'ইউরিয়া': 1, 'DAP': 1, 'পটাশ': 1, 'কমপোস্ট': 25 },
        stages: [
            { name: 'জমি প্রস্তুতি', timing: 'গাছ রোপণের ৭ দিন আগে', fertilizers: ['কমপোস্ট ২৫ কেজি/বিঘা'] },
            { name: 'গাছ রোপণের সময়', timing: 'গাছ রোপণের দিন', fertilizers: ['DAP ১ কেজি/বিঘা'] },
            { name: '৩ মাস পর', timing: 'রোপণের ৩ মাস পর', fertilizers: ['ইউরিয়া ০.৫ কেজি/বিঘা'] },
            { name: 'ফল ধরার সময়', timing: 'ফল ধরার সময়', fertilizers: ['ইউরিয়া ০.৫ কেজি/বিঘা', 'পটাশ ১ কেজি/বিঘা'] },
        ],
        method: 'গাছের গোড়ায় মাটি তুলে দিতে হবে',
        notes: 'কাঁঠাল গাছে কম সার প্রয়োজন',
    },
};

export const SFCalculator = {

    convertArea(value, fromUnit, toUnit) {
        if (!value || value <= 0) return 0;
        if (fromUnit === toUnit) return value;

        const from = AREA_CONVERSIONS[fromUnit];
        const to = AREA_CONVERSIONS[toUnit];
        if (!from || !to) return 0;

        const bighaValue = value * from.toBigha;
        return parseFloat((bighaValue / to.toBigha).toFixed(4));
    },

    calculateFertilizer(cropName, areaValue, areaUnit) {
        const crop = FERTILIZER_DATA[cropName];
        if (!crop) return null;

        const areaInBigha = this.convertArea(areaValue, areaUnit, 'বিঘা');
        if (areaInBigha <= 0) return null;

        const result = {
            crop: cropName,
            cropEn: crop.nameEn,
            emoji: crop.emoji,
            area: areaValue,
            areaUnit: areaUnit,
            areaInBigha: parseFloat(areaInBigha.toFixed(4)),
            areaInShotok: parseFloat(this.convertArea(areaValue, areaUnit, 'শতক').toFixed(4)),
            areaInAcre: parseFloat(this.convertArea(areaValue, areaUnit, 'একর').toFixed(4)),
            areaInKatha: parseFloat(this.convertArea(areaValue, areaUnit, 'কাঠা').toFixed(4)),
            fertilizers: {},
            totalItems: 0,
        };

        for (const [name, perBigha] of Object.entries(crop.basePerBigha)) {
            const amount = parseFloat((perBigha * areaInBigha).toFixed(2));
            const info = FERTILIZER_INFO[name] || {};
            result.fertilizers[name] = {
                amount: amount,
                unit: info.unit || 'কেজি',
                pricePerUnit: info.avgPrice || 0,
                totalCost: parseFloat((amount * (info.avgPrice || 0)).toFixed(2)),
                type: info.type || 'সার',
                purpose: info.purpose || '',
            };
            result.totalItems++;
        }

        result.totalEstimatedCost = Object.values(result.fertilizers)
            .reduce((sum, f) => sum + f.totalCost, 0);

        return result;
    },

    getApplicationSchedule(cropName, areaValue, areaUnit) {
        const crop = FERTILIZER_DATA[cropName];
        if (!crop) return null;

        const areaInBigha = this.convertArea(areaValue, areaUnit, 'বিঘা');
        if (areaInBigha <= 0) return null;

        const schedule = crop.stages.map(stage => ({
            name: stage.name,
            timing: stage.timing,
            fertilizers: stage.fertilizers.map(f => {
                const parts = f.split(' ');
                const fertName = parts[0];
                const amountStr = parts.slice(1).join(' ');
                const match = amountStr.match(/([\d.]+)/);
                if (match) {
                    const baseAmount = parseFloat(match[1]);
                    const scaledAmount = parseFloat((baseAmount * areaInBigha).toFixed(2));
                    return `${fertName} ${scaledAmount} ${parts[parts.length - 1]}`;
                }
                return f;
            }),
        }));

        return {
            crop: cropName,
            emoji: crop.emoji,
            method: crop.method,
            notes: crop.notes,
            stages: schedule,
        };
    },

    getCostEstimate(cropName, areaValue, areaUnit) {
        const calculation = this.calculateFertilizer(cropName, areaValue, areaUnit);
        if (!calculation) return null;

        const costBreakdown = Object.entries(calculation.fertilizers).map(([name, data]) => ({
            name: name,
            amount: data.amount,
            unit: data.unit,
            pricePerUnit: data.pricePerUnit,
            totalCost: data.totalCost,
        }));

        return {
            crop: calculation.crop,
            emoji: calculation.emoji,
            area: `${calculation.area} ${calculation.areaUnit}`,
            costBreakdown: costBreakdown,
            totalCost: calculation.totalEstimatedCost,
            currency: 'টাকা',
            note: 'প্রায়িক মূল্য — বাজারের দাম ভিন্ন হতে পারে',
        };
    },

    getSupportedCrops() {
        return Object.entries(FERTILIZER_DATA).map(([name, data]) => ({
            name: name,
            nameEn: data.nameEn,
            emoji: data.emoji,
            fertilizerCount: Object.keys(data.basePerBigha).length,
            stageCount: data.stages.length,
        }));
    },

    getFertilizerInfo(fertilizerName) {
        return FERTILIZER_INFO[fertilizerName] || null;
    },

    formatResult(result) {
        if (!result) return 'ত্রুটি: তথ্য পাওয়া যায়নি';

        const lines = [];
        lines.push(`${result.emoji} ${result.crop} (${result.cropEn})`);
        lines.push(`জমির পরিমাণ: ${result.area} ${result.areaUnit}`);
        lines.push(`সমতুল্য: ${result.areaInShotok} শতক / ${result.areaInAcre} একর / ${result.areaInKatha} কাঠা`);
        lines.push('');
        lines.push('--- সারের পরিমাণ ---');

        for (const [name, data] of Object.entries(result.fertilizers)) {
            lines.push(`${name}: ${data.amount} ${data.unit} (প্রায়িক: ${data.totalCost} টাকা)`);
        }

        lines.push('');
        lines.push(`মোট প্রায়িক খরচ: ${result.totalEstimatedCost} টাকা`);

        return lines.join('\n');
    },

    createCalculatorUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const crops = this.getSupportedCrops();
        const units = Object.keys(AREA_CONVERSIONS);

        container.innerHTML = `
            <style>
                .sf-calc-container {
                    font-family: 'Hind Siliguri', 'Kalpurush', sans-serif;
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 24px;
                    background: #f0f8f0;
                    border-radius: 16px;
                    border: 2px solid #2d7a2d;
                }
                .sf-calc-title {
                    text-align: center;
                    font-size: 1.5em;
                    color: #1a5c1a;
                    margin-bottom: 24px;
                    font-weight: bold;
                }
                .sf-calc-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }
                .sf-calc-group {
                    flex: 1;
                    min-width: 140px;
                }
                .sf-calc-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: bold;
                    color: #333;
                    font-size: 0.95em;
                }
                .sf-calc-group select,
                .sf-calc-group input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 2px solid #aaa;
                    border-radius: 8px;
                    font-size: 1em;
                    font-family: inherit;
                    box-sizing: border-box;
                }
                .sf-calc-group select:focus,
                .sf-calc-group input:focus {
                    border-color: #2d7a2d;
                    outline: none;
                }
                .sf-calc-btn {
                    display: block;
                    width: 100%;
                    padding: 14px;
                    background: #2d7a2d;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.15em;
                    font-weight: bold;
                    font-family: inherit;
                    cursor: pointer;
                    margin-top: 8px;
                }
                .sf-calc-btn:hover { background: #1a5c1a; }
                .sf-calc-result {
                    margin-top: 24px;
                    padding: 20px;
                    background: #fff;
                    border-radius: 12px;
                    border: 1px solid #ccc;
                    display: none;
                }
                .sf-calc-result h3 {
                    color: #1a5c1a;
                    margin: 0 0 12px 0;
                }
                .sf-calc-result table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 8px;
                }
                .sf-calc-result th,
                .sf-calc-result td {
                    padding: 8px 10px;
                    border-bottom: 1px solid #e0e0e0;
                    text-align: left;
                    font-size: 0.95em;
                }
                .sf-calc-result th {
                    background: #f0f8f0;
                    color: #1a5c1a;
                    font-weight: bold;
                }
                .sf-calc-result .total-row {
                    font-weight: bold;
                    background: #e8f5e9;
                    color: #1a5c1a;
                }
                .sf-calc-schedule {
                    margin-top: 20px;
                }
                .sf-calc-schedule h4 {
                    color: #1a5c1a;
                    margin: 0 0 10px 0;
                }
                .sf-calc-stage {
                    background: #f9fdf9;
                    border-left: 4px solid #2d7a2d;
                    padding: 10px 14px;
                    margin-bottom: 10px;
                    border-radius: 0 8px 8px 0;
                }
                .sf-calc-stage .stage-name {
                    font-weight: bold;
                    color: #2d7a2d;
                }
                .sf-calc-stage .stage-time {
                    font-size: 0.9em;
                    color: #666;
                }
                .sf-calc-stage .stage-ferts {
                    margin-top: 4px;
                    font-size: 0.95em;
                }
                .sf-calc-note {
                    margin-top: 12px;
                    padding: 10px;
                    background: #fff3cd;
                    border-radius: 8px;
                    font-size: 0.9em;
                    color: #856404;
                }
                .sf-calc-conversions {
                    margin-top: 12px;
                    font-size: 0.9em;
                    color: #555;
                }
            </style>

            <div class="sf-calc-container">
                <div class="sf-calc-title">সার ক্যালকুলেটর</div>

                <div class="sf-calc-row">
                    <div class="sf-calc-group">
                        <label for="sf-calc-crop">ফসল নির্বাচন</label>
                        <select id="sf-calc-crop">
                            <option value="">-- ফসল বাছাই করুন --</option>
                            ${crops.map(c => `<option value="${c.name}">${c.emoji} ${c.name} (${c.nameEn})</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="sf-calc-row">
                    <div class="sf-calc-group">
                        <label for="sf-calc-area">জমির পরিমাণ</label>
                        <input type="number" id="sf-calc-area" min="0" step="0.01" placeholder="যেমন: ২">
                    </div>
                    <div class="sf-calc-group">
                        <label for="sf-calc-unit">একক</label>
                        <select id="sf-calc-unit">
                            ${units.map(u => `<option value="${u}">${u}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <button class="sf-calc-btn" id="sf-calc-submit">হিসাব করুন</button>

                <div class="sf-calc-result" id="sf-calc-result"></div>
            </div>
        `;

        const submitBtn = document.getElementById('sf-calc-submit');
        const resultDiv = document.getElementById('sf-calc-result');
        const self = this;

        submitBtn.addEventListener('click', () => {
            const cropName = document.getElementById('sf-calc-crop').value;
            const areaValue = parseFloat(document.getElementById('sf-calc-area').value);
            const areaUnit = document.getElementById('sf-calc-unit').value;

            if (!cropName) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = '<p style="color:#c00;">অনুগ্রহ করে একটি ফসল নির্বাচন করুন।</p>';
                return;
            }
            if (!areaValue || areaValue <= 0) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = '<p style="color:#c00;">অনুগ্রহ করে জমির পরিমাণ দিন।</p>';
                return;
            }

            const calculation = self.calculateFertilizer(cropName, areaValue, areaUnit);
            const schedule = self.getApplicationSchedule(cropName, areaValue, areaUnit);
            const cost = self.getCostEstimate(cropName, areaValue, areaUnit);

            if (!calculation || !schedule || !cost) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = '<p style="color:#c00;">হিসাব করা সম্ভব হয়নি।</p>';
                return;
            }

            let html = `<h3>${calculation.emoji} ${calculation.crop} — হিসাবের ফলাফল</h3>`;
            html += `<p><strong>জমি:</strong> ${calculation.area} ${calculation.areaUnit} = ${calculation.areaInShotok} শতক = ${calculation.areaInAcre} একর = ${calculation.areaInKatha} কাঠা</p>`;

            html += '<table><thead><tr><th>সারের নাম</th><th>পরিমাণ</th><th>একক</th><th>প্রায়িক মূল্য (টাকা)</th></tr></thead><tbody>';
            for (const [name, data] of Object.entries(calculation.fertilizers)) {
                html += `<tr><td>${name}</td><td>${data.amount}</td><td>${data.unit}</td><td>${data.totalCost}</td></tr>`;
            }
            html += `<tr class="total-row"><td colspan="3">মোট</td><td>${calculation.totalEstimatedCost} টাকা</td></tr>`;
            html += '</tbody></table>';

            html += '<div class="sf-calc-schedule"><h4>প্রয়োগের সময়সূচি</h4>';
            for (const stage of schedule.stages) {
                html += `<div class="sf-calc-stage">`;
                html += `<div class="stage-name">${stage.name}</div>`;
                html += `<div class="stage-time">${stage.timing}</div>`;
                html += `<div class="stage-ferts">${stage.fertilizers.map(f => `<span style="display:inline-block;margin:2px 4px;padding:2px 8px;background:#e8f5e9;border-radius:4px;">${f}</span>`).join('')}</div>`;
                html += '</div>';
            }
            html += '</div>';

            html += `<div class="sf-calc-note"><strong>প্রয়োগ পদ্ধতি:</strong> ${schedule.method}</div>`;
            html += `<div class="sf-calc-note"><strong>টিপস:</strong> ${schedule.notes}</div>`;
            html += `<p class="sf-calc-conversions">${cost.note}</p>`;

            resultDiv.style.display = 'block';
            resultDiv.innerHTML = html;
        });

        return {
            recalculate() {
                document.getElementById('sf-calc-submit').click();
            },
            destroy() {
                container.innerHTML = '';
            },
        };
    },
};
