// SF AI V15 — Crop Calendar Module for Bangladesh Farming
// ES Module: SFCropCalendar

const SEASONS = {
    'গ্রীষ্ম': { months: [3, 4, 5], english: 'Summer', months_en: 'Mar-May' },
    'বর্ষা': { months: [6, 7, 8], english: 'Monsoon', months_en: 'Jun-Aug' },
    'শরৎ': { months: [9, 10, 11], english: 'Autumn', months_en: 'Sep-Nov' },
    'হেমন্ত': { months: [12, 1, 2], english: 'Late Autumn', months_en: 'Dec-Feb' },
    'শীত': { months: [12, 1, 2], english: 'Winter', months_en: 'Dec-Feb' },
    'বসন্ত': { months: [2, 3, 4], english: 'Spring', months_en: 'Feb-Apr' },
};

const MONTHS_BN = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
];

const CROP_CALENDAR = {
    'জানুয়ারি': {
        plant: ['আলু', 'পেঁয়াজ', 'রসুন', 'শাক', 'গাজর', 'মিষ্টি আলু'],
        avoid: ['ধান', 'জুট', 'ভুট্টা'],
        harvest: ['ধান (বোরো)', 'মূংফলি', 'মটরশুটি', 'টমেটো'],
        fertilize: ['ইউরিয়া ছিটানো', 'কমপোস্ট যোগ', 'এনপিকে দেওয়া'],
        irrigation: 'কম পানি লাগে, সপ্তাহে ১-২ বার',
        risk: 'পানির চাপ কম, রোগ কম, তাপমাত্রা কম',
    },
    'ফেব্রুয়ারি': {
        plant: ['আলু', 'পেঁয়াজ', 'রসুন', 'শাক', 'মটরশুটি', 'ফুলকপি', 'বাঁধাকপি'],
        avoid: ['ধান', 'জুট', 'ভুট্টা', 'সবুজ মরিচ'],
        harvest: ['ধান (বোরো)', 'মূংফলি', 'টমেটো', 'গাজর'],
        fertilize: ['ইউরিয়া দ্বিতীয় খোরাক', 'কমপোস্ট', 'জিবক'],
        irrigation: 'কম পানি লাগে, সপ্তাহে ১-২ বার',
        risk: 'শীতের প্রভাব, রোগ কম',
    },
    'মার্চ': {
        plant: ['বাঁধাকপি', 'ফুলকপি', 'টমেটো', 'মরিচ', 'শাক', 'পালং শাক'],
        avoid: ['ধান', 'জুট', 'ভুট্টা', 'সয়াবিন'],
        harvest: ['ধান (বোরো)', 'আলু', 'পেঁয়াজ', 'রসুন', 'মটরশুটি'],
        fertilize: ['ইউরিয়া', 'কমপোস্ট', 'এনপিকে', 'পোটাশ'],
        irrigation: 'মাঝারি পানি লাগে',
        risk: 'গরম শুরু, পোকার আক্রমণ বাড়ে',
    },
    'এপ্রিল': {
        plant: ['বেগুন', 'মরিচ', 'ঝিংগা', 'লাউ', 'ঢেঁড়স', 'করলা'],
        avoid: ['ধান', 'জুট', 'আলু', 'পেঁয়াজ'],
        harvest: ['বাঁধাকপি', 'ফুলকপি', 'টমেটো', 'শাক'],
        fertilize: ['ইউরিয়া', 'জিবক', 'কমপোস্ট', 'খাদ্য উপাদান'],
        irrigation: 'বেশি পানি লাগে, নিয়মিত সেচ',
        risk: 'তীব্র গরম, পানির অভাব, পোকা বেশি',
    },
    'মে': {
        plant: ['লাউ', 'ঢেঁড়স', 'করলা', 'চিচিঙ্গা', 'জিংগা', 'আখ'],
        avoid: ['ধান', 'জুট', 'ভুট্টা', 'আলু'],
        harvest: ['বেগুন', 'মরিচ', 'বাঁধাকপি', 'ফুলকপি'],
        fertilize: ['কমপোস্ট', 'জিবক', 'ইউরিয়া কম দিন'],
        irrigation: 'প্রচুর পানি লাগে, দৈনিক সেচ',
        risk: 'তীব্র গরম, খরা, পোকা বেশি',
    },
    'জুন': {
        plant: ['ধান (আমন)', 'জুট', 'পানি আলু', 'শাক', 'বেগুন'],
        avoid: ['আলু', 'পেঁয়াজ', 'রসুন', 'গাজর'],
        harvest: ['লাউ', 'ঢেঁড়স', 'করলা', 'চিচিঙ্গা'],
        fertilize: ['ইউরিয়া (ধান)', 'কমপোস্ট', 'এনপিকে'],
        irrigation: 'বৃষ্টির পানি, সেচ কম লাগে',
        risk: 'বন্যা, জলাবদ্ধতা, ধানে রোগ',
    },
    'জুলাই': {
        plant: ['ধান (আমন)', 'জুট', 'পানি আলু', 'বৈরি', 'বেগুন'],
        avoid: ['আলু', 'পেঁয়াজ', 'রসুন', 'গাজর'],
        harvest: ['ধান (আমন কিছু)', 'লাউ', 'ঢেঁড়স'],
        fertilize: ['ইউরিয়া (ধান দ্বিতীয়)', 'কমপোস্ট', 'জিবক'],
        irrigation: 'বৃষ্টির পানি, বন্যা হলে নিকাশ',
        risk: 'বন্যা, জলাবদ্ধতা, ধানে পাতা গুঁড়ি রোগ',
    },
    'আগস্ট': {
        plant: ['ধান (আমন)', 'জুট', 'পানি আলু', 'বেগুন', 'মরিচ'],
        avoid: ['আলু', 'পেঁয়াজ', 'রসুন'],
        harvest: ['ধান (আমন)', 'পানি আলু'],
        fertilize: ['ইউরিয়া (ধান তৃতীয়)', 'কমপোস্ট', 'পোটাশ'],
        irrigation: 'বৃষ্টির পানি, বন্যা পরিচালনা',
        risk: 'বন্যা, জলাবদ্ধতা, ধানে ব্লাস্ট রোগ',
    },
    'সেপ্টেম্বর': {
        plant: ['ধান (আমন)', 'জুট', 'মরিচ', 'টমেটো', 'বেগুন'],
        avoid: ['আলু', 'পেঁয়াজ', 'রসুন'],
        harvest: ['ধান (আমন)', 'পানি আলু'],
        fertilize: ['ইউরিয়া', 'কমপোস্ট', 'এনপিকে', 'জিবক'],
        irrigation: 'বৃষ্টি কমে, সেচ শুরু',
        risk: 'বন্যা শেষ, রোগ কমে',
    },
    'অক্টোবর': {
        plant: ['ধান (বোরো)', 'টমেটো', 'মরিচ', 'শাক', 'পেঁয়াজ', 'রসুন'],
        avoid: ['লাউ', 'ঢেঁড়স', 'করলা', 'জুট'],
        harvest: ['ধান (আমন)', 'জুট', 'বেগুন'],
        fertilize: ['ইউরিয়া', 'কমপোস্ট', 'এনপিকে', 'পোটাশ'],
        irrigation: 'সেচ প্রয়োজন, মাঝারি পানি',
        risk: 'বৃষ্টি কমে, তুষার এর আশঙ্কা',
    },
    'নভেম্বর': {
        plant: ['ধান (বোরো)', 'আলু', 'পেঁয়াজ', 'রসুন', 'টমেটো', 'মরিচ', 'শাক'],
        avoid: ['লাউ', 'ঢেঁড়স', 'করলা', 'জুট'],
        harvest: ['ধান (আমন)', 'টমেটো', 'মরিচ', 'শাক'],
        fertilize: ['ইউরিয়া', 'কমপোস্ট', 'এনপিকে'],
        irrigation: 'সেচ প্রয়োজন, নিয়মিত',
        risk: 'ঠান্ডা বাড়ে, রোগ কম',
    },
    'ডিসেম্বর': {
        plant: ['আলু', 'পেঁয়াজ', 'রসুন', 'শাক', 'গাজর', 'মিষ্টি আলু', 'মটরশুটি'],
        avoid: ['ধান', 'জুট', 'ভুট্টা', 'লাউ'],
        harvest: ['ধান (বোরো)', 'টমেটো', 'মরিচ', 'শাক'],
        fertilize: ['ইউরিয়া', 'কমপোস্ট', 'জিবক'],
        irrigation: 'কম পানি লাগে',
        risk: 'তুষার, ঠান্ডা, রোগ কম',
    },
};

const CROP_LIFECYCLES = {
    'টমেটো': {
        duration: '৯০-১২০ দিন',
        planting: 'অক্টোবর-নভেম্বর',
        harvest: 'জানুয়ারি-মার্চ',
        flowering: '৪৫-৬০ দিন',
        fruiting: '৬০-৭৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, ফুল: পোটাশ, ফল: ক্যালসিয়াম',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত রাখুন',
    },
    'ধান (বোরো)': {
        duration: '১২০-১৫০ দিন',
        planting: 'নভেম্বর-ডিসেম্বর',
        harvest: 'মার্চ-এপ্রিল',
        flowering: '৭৫-৯০ দিন',
        fruiting: '১০০-১২০ দিন',
        fertilizer: 'প্লান্টিং: এনপিকে, কাণ্ড: ইউরিয়া, ফল: পোটাশ',
        tips: 'জমিতে পানি রাখুন, পোকা দেখুন',
    },
    'ধান (আমন)': {
        duration: '১২০-১৫০ দিন',
        planting: 'জুন-জুলাই',
        harvest: 'সেপ্টেম্বর-অক্টোবর',
        flowering: '৬০-৭৫ দিন',
        fruiting: '৯০-১০৫ দিন',
        fertilizer: 'প্লান্টিং: এনপিকে, কাণ্ড: ইউরিয়া, ফল: পোটাশ',
        tips: 'বন্যা থেকে রক্ষা করুন, সেচ নিয়ন্ত্রণ করুন',
    },
    'মরিচ': {
        duration: '১২০-১৫০ দিন',
        planting: 'সেপ্টেম্বর-অক্টোবর',
        harvest: 'জানুয়ারি-মার্চ',
        flowering: '৪৫-৬০ দিন',
        fruiting: '৬০-৭৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, ফুল: পোটাশ, ফল: ক্যালসিয়াম',
        tips: 'মাটি ভালো জানুন, পোকা দেখুন, সেচ নিয়মিত',
    },
    'বেগুন': {
        duration: '১২০-১৫০ দিন',
        planting: 'সেপ্টেম্বর-অক্টোবর',
        harvest: 'জানুয়ারি-মার্চ',
        flowering: '৪৫-৬০ দিন',
        fruiting: '৬০-৭৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, ফুল: পোটাশ, ফল: ক্যালসিয়াম',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত, পোকা দেখুন',
    },
    'আলু': {
        duration: '৮০-১২০ দিন',
        planting: 'নভেম্বর-ডিসেম্বর',
        harvest: 'ফেব্রুয়ারি-মার্চ',
        flowering: '৩০-৪৫ দিন',
        fruiting: '৫০-৭০ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, গুঁড়ি: ইউরিয়া',
        tips: 'মাটি ভালো জানুন, সেচ কম রাখুন',
    },
    'পেঁয়াজ': {
        duration: '৯০-১২০ দিন',
        planting: 'অক্টোবর-নভেম্বর',
        harvest: 'জানুয়ারি-মার্চ',
        flowering: '৪৫-৬০ দিন',
        fruiting: '৬০-৭৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, বৃদ্ধি: ইউরিয়া',
        tips: 'মাটি ভালো জানুন, সেচ কম রাখুন',
    },
    'রসুন': {
        duration: '৯০-১২০ দিন',
        planting: 'অক্টোবর-নভেম্বর',
        harvest: 'জানুয়ারি-মার্চ',
        flowering: '৪৫-৬০ দিন',
        fruiting: '৬০-৭৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, বৃদ্ধি: ইউরিয়া',
        tips: 'মাটি ভালো জানুন, সেচ কম রাখুন',
    },
    'লাউ': {
        duration: '৭৫-৯০ দিন',
        planting: 'মার্চ-এপ্রিল',
        harvest: 'জুন-জুলাই',
        flowering: '৩০-৪৫ দিন',
        fruiting: '৪৫-৬০ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, ফুল: পোটাশ',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'ঢেঁড়স': {
        duration: '৬০-৯০ দিন',
        planting: 'মার্চ-এপ্রিল',
        harvest: 'জুন-জুলাই',
        flowering: '২৫-৩৫ দিন',
        fruiting: '৪০-৫৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, ফুল: পোটাশ',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'করলা': {
        duration: '৬০-৯০ দিন',
        planting: 'মার্চ-এপ্রিল',
        harvest: 'জুন-জুলাই',
        flowering: '২৫-৩৫ দিন',
        fruiting: '৪০-৫৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, ফুল: পোটাশ',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'ফুলকপি': {
        duration: '৯০-১২০ দিন',
        planting: 'অক্টোবর-নভেম্বর',
        harvest: 'জানুয়ারি-মার্চ',
        flowering: '৪৫-৬০ দিন',
        fruiting: '৬০-৭৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, ফুল: পোটাশ',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'বাঁধাকপি': {
        duration: '৯০-১২০ দিন',
        planting: 'অক্টোবর-নভেম্বর',
        harvest: 'জানুয়ারি-মার্চ',
        flowering: '৪৫-৬০ দিন',
        fruiting: '৬০-৭৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, ফুল: পোটাশ',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'জুট': {
        duration: '১২০-১৫০ দিন',
        planting: 'জুন-জুলাই',
        harvest: 'অক্টোবর-নভেম্বর',
        flowering: '৬০-৭৫ দিন',
        fruiting: '৯০-১০৫ দিন',
        fertilizer: 'প্লান্টিং: এনপিকে, কাণ্ড: ইউরিয়া',
        tips: 'বন্যা থেকে রক্ষা করুন, সেচ নিয়ন্ত্রণ করুন',
    },
    'ভুট্টা': {
        duration: '৯০-১২০ দিন',
        planting: 'মার্চ-এপ্রিল',
        harvest: 'জুন-জুলাই',
        flowering: '৪৫-৬০ দিন',
        fruiting: '৬০-৭৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে, ফুল: পোটাশ',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'মটরশুটি': {
        duration: '৬০-৭৫ দিন',
        planting: 'নভেম্বর-ডিসেম্বর',
        harvest: 'জানুয়ারি-ফেব্রুয়ারি',
        flowering: '২৫-৩৫ দিন',
        fruiting: '৪০-৫৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'শাক': {
        duration: '৩০-৪৫ দিন',
        planting: 'সারা বছর',
        harvest: 'সারা বছর',
        flowering: '১৫-২০ দিন',
        fruiting: '২৫-৩৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + ইউরিয়া',
        tips: 'সেচ নিয়মিত, পোকা দেখুন',
    },
    'আখ': {
        duration: '১০-১২ মাস',
        planting: 'ফেব্রুয়ারি-মার্চ',
        harvest: 'ডিসেম্বর-মার্চ',
        flowering: '৬-৮ মাস',
        fruiting: '৮-১০ মাস',
        fertilizer: 'প্লান্টিং: এনপিকে, বৃদ্ধি: ইউরিয়া + পোটাশ',
        tips: 'সেচ নিয়মিত, পোকা দেখুন',
    },
    'সয়াবিন': {
        duration: '৯০-১২০ দিন',
        planting: 'মার্চ-এপ্রিল',
        harvest: 'জুন-জুলাই',
        flowering: '৪৫-৬০ দিন',
        fruiting: '৬০-৭৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'গাজর': {
        duration: '৭০-৮০ দিন',
        planting: 'অক্টোবর-নভেম্বর',
        harvest: 'জানুয়ারি-ফেব্রুয়ারি',
        flowering: '৩০-৪০ দিন',
        fruiting: '৫০-৬০ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'মিষ্টি আলু': {
        duration: '৯০-১২০ দিন',
        planting: 'নভেম্বর-ডিসেম্বর',
        harvest: 'জানুয়ারি-মার্চ',
        flowering: '৩০-৪৫ দিন',
        fruiting: '৫০-৭০ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে',
        tips: 'মাটি ভালো জানুন, সেচ কম রাখুন',
    },
    'জিংগা': {
        duration: '৬০-৯০ দিন',
        planting: 'মার্চ-এপ্রিল',
        harvest: 'জুন-জুলাই',
        flowering: '২৫-৩৫ দিন',
        fruiting: '৪০-৫৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'চিচিঙ্গা': {
        duration: '৬০-৯০ দিন',
        planting: 'মার্চ-এপ্রিল',
        harvest: 'জুন-জুলাই',
        flowering: '২৫-৩৫ দিন',
        fruiting: '৪০-৫৫ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'পানি আলু': {
        duration: '৯০-১২০ দিন',
        planting: 'জুন-জুলাই',
        harvest: 'সেপ্টেম্বর-অক্টোবর',
        flowering: '৩০-৪৫ দিন',
        fruiting: '৫০-৭০ দিন',
        fertilizer: 'প্লান্টিং: কমপোস্ট + এনপিকে',
        tips: 'পানিতে জন্মায়, সেচ বেশি লাগে',
    },
};

const FERTILIZER_SCHEDULES = {
    'টমেটো': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'রোপণের ১৫ দিন পর', items: 'ইউরিয়া (১ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১.৫ কেজি/শতক)' },
        { time: 'ফল ধরার পর', items: 'ক্যালসিয়াম (১ কেজি/শতক)' },
    ],
    'ধান (বোরো)': [
        { time: 'রোপণের সময়', items: 'এনপিকে (৩ কেজি/শতক) + জিবক' },
        { time: 'রোপণের ২০ দিন পর', items: 'ইউরিয়া (২ কেজি/শতক)' },
        { time: 'রোপণের ৪০ দিন পর', items: 'ইউরিয়া (১.৫ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১ কেজি/শতক)' },
    ],
    'ধান (আমন)': [
        { time: 'রোপণের সময়', items: 'এনপিকে (৩ কেজি/শতক) + জিবক' },
        { time: 'রোপণের ২০ দিন পর', items: 'ইউরিয়া (২ কেজি/শতক)' },
        { time: 'রোপণের ৪০ দিন পর', items: 'ইউরিয়া (১.৫ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১ কেজি/শতক)' },
    ],
    'মরিচ': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'রোপণের ১৫ দিন পর', items: 'ইউরিয়া (১ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১.৫ কেজি/শতক)' },
        { time: 'ফল ধরার পর', items: 'ক্যালসিয়াম (১ কেজি/শতক)' },
    ],
    'বেগুন': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'রোপণের ১৫ দিন পর', items: 'ইউরিয়া (১ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১.৫ কেজি/শতক)' },
        { time: 'ফল ধরার পর', items: 'ক্যালসিয়াম (১ কেজি/শতক)' },
    ],
    'আলু': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'রোপণের ২০ দিন পর', items: 'ইউরিয়া (১.৫ কেজি/শতক)' },
        { time: 'গুঁড়ি বাঁধার সময়', items: 'ইউরিয়া (১ কেজি/শতক)' },
    ],
    'পেঁয়াজ': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'রোপণের ২০ দিন পর', items: 'ইউরিয়া (১ কেজি/শতক)' },
        { time: 'বৃদ্ধির সময়', items: 'ইউরিয়া (০.৫ কেজি/শতক)' },
    ],
    'রসুন': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'রোপণের ২০ দিন পর', items: 'ইউরিয়া (১ কেজি/শতক)' },
        { time: 'বৃদ্ধির সময়', items: 'ইউরিয়া (০.৫ কেজি/শতক)' },
    ],
    'লাউ': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১.৫ কেজি/শতক)' },
    ],
    'ঢেঁড়স': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১.৫ কেজি/শতক)' },
    ],
    'করলা': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১.৫ কেজি/শতক)' },
    ],
    'জুট': [
        { time: 'রোপণের সময়', items: 'এনপিকে (৩ কেজি/শতক)' },
        { time: 'রোপণের ৩০ দিন পর', items: 'ইউরিয়া (২ কেজি/শতক)' },
    ],
    'ভুট্টা': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১.৫ কেজি/শতক)' },
    ],
    'মটরশুটি': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
    ],
    'শাক': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৩ কেজি/শতক) + ইউরিয়া (০.৫ কেজি/শতক)' },
    ],
    'আখ': [
        { time: 'রোপণের সময়', items: 'এনপিকে (৫ কেজি/শতক)' },
        { time: '৩ মাস পর', items: 'ইউরিয়া (৩ কেজি/শতক) + পোটাশ (২ কেজি/শতক)' },
        { time: '৬ মাস পর', items: 'ইউরিয়া (২ কেজি/শতক) + পোটাশ (১ কেজি/শতক)' },
    ],
    'সয়াবিন': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
    ],
    'গাজর': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
    ],
    'মিষ্টি আলু': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
    ],
    'ফুলকপি': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১.৫ কেজি/শতক)' },
    ],
    'বাঁধাকপি': [
        { time: 'রোপণের সময়', items: 'কমপোস্ট (৫ কেজি/শতক) + এনপিকে (২ কেজি/শতক)' },
        { time: 'ফুল ধরার সময়', items: 'পোটাশ (১.৫ কেজি/শতক)' },
    ],
};

const SEASONAL_FERTILIZER = {
    'গ্রীষ্ম': {
        focus: 'বৃষ্টির আগে সার দিন, পানি জমানো যাবে না',
        items: 'কমপোস্ট + এনপিকে, ইউরিয়া কম দিন',
        tips: 'বৃষ্টির আগে সার দিন, পরে দেওয়া যাবে না',
    },
    'বর্ষা': {
        focus: 'বৃষ্টির পানিতে সার ক্ষয় হয়, বারবার দিতে হবে',
        items: 'কমপোস্ট + জিবক, ইউরিয়া কম দিন',
        tips: 'বৃষ্টির পর সার দিন, পানি জমানো যাবে না',
    },
    'শরৎ': {
        focus: 'বৃষ্টি কমে যাচ্ছে, সেচ শুরু করুন',
        items: 'কমপোস্ট + এনপিকে + ইউরিয়া',
        tips: 'নিয়মিত সেচ দিন, পোকা দেখুন',
    },
    'হেমন্ত': {
        focus: 'ঠান্ডা বাড়ছে, শীতকালীন ফসল শুরু',
        items: 'কমপোস্ট + এনপিকে + জিবক',
        tips: 'মাটি ভালো জানুন, সেচ নিয়মিত',
    },
    'শীত': {
        focus: 'ঠান্ডা বেশি, শীতকালীন ফসল চলছে',
        items: 'কমপোস্ট + এনপিকে + জিবক',
        tips: 'তুষার থেকে রক্ষা করুন, সেচ কম রাখুন',
    },
    'বসন্ত': {
        focus: 'গরম শুরু হচ্ছে, গ্রীষ্মকালীন ফসলের প্রস্তুতি',
        items: 'কমপোস্ট + এনপিকে + পোটাশ',
        tips: 'গরমের আগে সার দিন, সেচ বাড়ান',
    },
};

function getMonthNumber(monthName) {
    const idx = MONTHS_BN.indexOf(monthName);
    return idx >= 0 ? idx + 1 : new Date().getMonth() + 1;
}

export const SFCropCalendar = {
    getCurrentSeason() {
        const now = new Date();
        const month = now.getMonth() + 1;
        for (const [name, data] of Object.entries(SEASONS)) {
            if (data.months.includes(month)) {
                return { name, ...data };
            }
        }
        return { name: 'অজানা', english: 'Unknown', months_en: '' };
    },

    getCurrentMonth() {
        const now = new Date();
        return MONTHS_BN[now.getMonth()];
    },

    getPlantThisMonth(month) {
        const monthName = month || this.getCurrentMonth();
        const data = CROP_CALENDAR[monthName];
        if (!data) return null;
        return {
            month: monthName,
            plant: data.plant,
            avoid: data.avoid,
            irrigation: data.irrigation,
            risk: data.risk,
        };
    },

    getHarvestThisMonth(month) {
        const monthName = month || this.getCurrentMonth();
        const data = CROP_CALENDAR[monthName];
        if (!data) return null;
        return {
            month: monthName,
            harvest: data.harvest,
            fertilize: data.fertilize,
        };
    },

    getFertilizerSchedule(cropName) {
        const schedule = FERTILIZER_SCHEDULES[cropName];
        if (!schedule) return null;
        return { crop: cropName, schedule };
    },

    getCropLifecycle(cropName) {
        const lifecycle = CROP_LIFECYCLES[cropName];
        if (!lifecycle) return null;
        return { crop: cropName, ...lifecycle };
    },

    getSeasonOverview(season) {
        const seasonName = season || this.getCurrentSeason().name;
        const seasonData = SEASONS[seasonName];
        const fertData = SEASONAL_FERTILIZER[seasonName];
        if (!seasonData) return null;

        const months = seasonData.months.map((m) => MONTHS_BN[m - 1]);
        const allPlants = [];
        const allHarvest = [];
        months.forEach((m) => {
            const d = CROP_CALENDAR[m];
            if (d) {
                d.plant.forEach((p) => { if (!allPlants.includes(p)) allPlants.push(p); });
                d.harvest.forEach((h) => { if (!allHarvest.includes(h)) allHarvest.push(h); });
            }
        });

        return {
            season: seasonName,
            english: seasonData.english,
            months_en: seasonData.months_en,
            months_bn: months,
            plants: allPlants,
            harvest: allHarvest,
            fertilizer: fertData || null,
        };
    },

    getMonthCalendar(month) {
        const monthName = month || this.getCurrentMonth();
        const data = CROP_CALENDAR[monthName];
        if (!data) return null;

        let seasonName = 'অজানা';
        const monthNum = getMonthNumber(monthName);
        for (const [name, sData] of Object.entries(SEASONS)) {
            if (sData.months.includes(monthNum)) {
                seasonName = name;
                break;
            }
        }

        return {
            month: monthName,
            season: seasonName,
            plant: data.plant,
            avoid: data.avoid,
            harvest: data.harvest,
            fertilize: data.fertilize,
            irrigation: data.irrigation,
            risk: data.risk,
        };
    },

    getUpcomingPlan() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const plan = [];
        for (let i = 0; i < 3; i++) {
            const idx = (currentMonth + i) % 12;
            const monthName = MONTHS_BN[idx];
            const data = CROP_CALENDAR[monthName];
            if (data) {
                plan.push({
                    month: monthName,
                    plant: data.plant,
                    harvest: data.harvest,
                    fertilize: data.fertilize,
                    irrigation: data.irrigation,
                });
            }
        }
        return plan;
    },

    createCalendarWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const currentMonth = this.getCurrentMonth();
        const currentSeason = this.getCurrentSeason();
        const calendar = this.getMonthCalendar(currentMonth);
        const upcoming = this.getUpcomingPlan();

        let html = `<div class="sf-crop-calendar">`;
        html += `<div class="sf-calendar-header">`;
        html += `<h3>ফসল পাত্র — ${currentMonth}</h3>`;
        html += `<p>মৌসুম: ${currentSeason.name} (${currentSeason.english})</p>`;
        html += `</div>`;

        if (calendar) {
            html += `<div class="sf-calendar-section">`;
            html += `<h4>এই মাসে কী রোপণ করবেন</h4>`;
            html += `<div class="sf-tag-list sf-tag-plant">`;
            calendar.plant.forEach((item) => {
                html += `<span class="sf-tag">${item}</span>`;
            });
            html += `</div></div>`;

            html += `<div class="sf-calendar-section">`;
            html += `<h4>এই মাসে এড়িয়ে চলুন</h4>`;
            html += `<div class="sf-tag-list sf-tag-avoid">`;
            calendar.avoid.forEach((item) => {
                html += `<span class="sf-tag sf-tag-warn">${item}</span>`;
            });
            html += `</div></div>`;

            html += `<div class="sf-calendar-section">`;
            html += `<h4>ফসল তোলা</h4>`;
            html += `<div class="sf-tag-list sf-tag-harvest">`;
            calendar.harvest.forEach((item) => {
                html += `<span class="sf-tag sf-tag-success">${item}</span>`;
            });
            html += `</div></div>`;

            html += `<div class="sf-calendar-section">`;
            html += `<h4>সার দেওয়ার সময়সূচি</h4>`;
            html += `<ul class="sf-fertilizer-list">`;
            calendar.fertilize.forEach((item) => {
                html += `<li>${item}</li>`;
            });
            html += `</ul></div>`;

            html += `<div class="sf-calendar-section">`;
            html += `<h4>সেচ ও ঝুঁকি</h4>`;
            html += `<p><strong>সেচ:</strong> ${calendar.irrigation}</p>`;
            html += `<p><strong>ঝুঁকি:</strong> ${calendar.risk}</p>`;
            html += `</div>`;
        }

        html += `<div class="sf-calendar-section sf-upcoming">`;
        html += `<h4>আগামী ৩ মাসের পরিকল্পনা</h4>`;
        html += `<div class="sf-upcoming-list">`;
        upcoming.forEach((item) => {
            html += `<div class="sf-upcoming-item">`;
            html += `<h5>${item.month}</h5>`;
            html += `<p><strong>রোপণ:</strong> ${item.plant.join(', ')}</p>`;
            html += `<p><strong>তোলা:</strong> ${item.harvest.join(', ')}</p>`;
            html += `</div>`;
        });
        html += `</div></div>`;

        html += `</div>`;

        container.innerHTML = html;
        return container;
    },
};
