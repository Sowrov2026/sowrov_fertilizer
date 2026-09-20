/**
 * Shared deterministic routing for verified SF knowledge.
 * Used by both api/chat.js (production) and test-llm-acceptance.mjs.
 *
 * Returns { reply, lang, model } if a deterministic answer is available.
 * Returns null if the query should be sent to Groq.
 */
function deterministicRoute(intent, lang) {
    const fert = intent.normalizedFertilizerType;
    const q = lang === 'english';

    // 1. Clarification: fertilizer query with no type specified
    if (intent.isFertilizerQuery && !fert && !intent.isDiseaseQuery) {
        return {
            reply: q
                ? 'Which fertilizer do you need: Vermicompost (organic) or Trichoderma (biocontrol)?'
                : 'কোন সার সম্পর্কে জানতে চান? ভার্মিকমপোস্ট (জৈব সার) নাকি ট্রাইকোডার্মা (জৈব ছত্রাক)?',
            lang,
            model: 'clarification',
        };
    }

    // 2. Verified Trichoderma timing — no quantity → timing info
    if (intent.isTrichodermaTiming) {
        return {
            reply: q
                ? 'Trichoderma (Tricho) application timings (SF verified):\n1. Land preparation\n2. Before planting/transplanting\n3. After planting/transplanting\n4. Preventive application before disease appears\n5. When disease symptoms appear\n\nSF rate: 2.5 kg/acre soil mix'
                : 'ট্রাইকোডার্মা (ট্রাইকো) প্রয়োগ সময় (SF যাচাইকৃত):\n১. জমি প্রস্তুতি\n২. রোপণ/চারা লাগানোর আগে\n৩. রোপণ/চারা লাগানোর পরে\n৪. রোগ হওয়ার আগে প্রতিরোধমূলক\n৫. রোগের লক্ষণ দেখা গেলে\n\nSF হার: ২.৫ কেজি/একর মাটিতে মেশান',
            lang,
            model: 'tricho-timing',
        };
    }

    // 3. Verified calculation: vermicompost
    if (intent.isCalculationQuery && fert === 'vermicompost' && intent.quantity) {
        const qty = intent.quantity;
        const low = Math.round(qty * 1.5 * 10) / 10;
        const high = Math.round(qty * 2 * 10) / 10;
        const unitLabel = intent.quantityUnit === 'একর' ? 'acre' : (intent.quantityUnit || 'acre');
        return {
            reply: q
                ? `Vermicompost needed: ${low}-${high} tons for ${qty} ${unitLabel}\n\nSF verified rate: 1.5-2 tons/acre (field)`
                : `প্রয়োজনীয় ভার্মিকমপোস্ট: ${qty} ${unitLabel || 'একর'} জমিতে ${low}-${high} টন\n\nSF যাচাইকৃত হার: ১.৫-২ টন/একর (মাঠ)`,
            lang,
            model: 'vermi-calc',
        };
    }

    // 4. Verified calculation: trichoderma
    if (intent.isCalculationQuery && fert === 'trichoderma' && intent.quantity) {
        const qty = intent.quantity;
        const total = qty * 2.5;
        return {
            reply: q
                ? `Trichoderma needed: ${total} kg for ${qty} acres\n\nSF verified rate: 2.5 kg/acre soil mix`
                : `প্রয়োজনীয় ট্রাইকোডার্মা: ${qty} একর জমিতে ${total} কেজি\n\nSF যাচাইকৃত হার: ২.৫ কেজি/একর মাটিতে মেশান`,
            lang,
            model: 'tricho-calc',
        };
    }

    // 5. Verified calculation: urea (3-stage, rice)
    if (intent.isCalculationQuery && fert === 'urea' && intent.quantity) {
        const qty = intent.quantity;
        const low = qty * 80;
        const high = qty * 90;
        return {
            reply: q
                ? `Urea needed for ${qty} acres of rice: ${low}-${high} kg total\n\n3-stage split:\nStage 1 (basal): 25-30 kg/acre\nStage 2 (tillering): 30-35 kg/acre\nStage 3 (panicle): 25 kg/acre\nTotal: 80-90 kg/acre`
                : `ধানের ${qty} একর জমিতে প্রয়োজনীয় ইউরিয়া: ${low}-${high} কেজি (মোট)\n\n৩-ধাপ বিভাজন:\nধাপ ১ (প্রাথমিক): ২৫-৩০ কেজি/একর\nধাপ ২ (শাখা গঠন): ৩০-৩৫ কেজি/একর\nধাপ ৩ (শীর্ষ গঠন): ২৫ কেজি/একর\nমোট: ৮০-৯০ কেজি/একর`,
            lang,
            model: 'urea-calc',
        };
    }

    // 6. Neutral comparison: vermicompost vs trichoderma
    if (intent.isFertilizerComparison) {
        return {
            reply: q
                ? 'Vermicompost and Trichoderma serve different roles:\n\n- Vermicompost: organic matter and nutrient-support role. Improves soil structure and nutrient availability.\n- Trichoderma: beneficial microorganism. Biological disease-suppression role. Suppresses soil-borne fungal diseases.\n\nThey are complementary and can be used together.\nSF rates: Vermi 1.5-2 tons/acre, Tricho 2.5 kg/acre'
                : 'ভার্মিকমপোস্ট ও ট্রাইকোডার্মা ভিন্ন ভূমিকা পালন করে:\n\n- ভার্মিকমপোস্ট: জৈব উপাদান ও পুষ্টি-সহায়ক ভূমিকা। মাটির গঠন ও পুষ্টি উপলব্ধতা উন্নত করে।\n- ট্রাইকোডার্মা: উপকারী অণুজীব। জৈব রোগ-প্রতিরোধক ভূমিকা। মাটিজনিত ছত্রাকজনিত রোগ দমন করে।\n\nতারা পরস্পর পূরক একসাথে ব্যবহার করা যায়।\nSF হার: ভার্মি ১.৫-২ টন/একর, ট্রাইকো ২.৫ কেজি/একর',
            lang,
            model: 'comparison',
        };
    }

    // 7. Disease-only contract: strip everything except disease info
    if (intent.isDiseaseQuery) {
        const cropName = intent.cropName || (lang === 'english' ? 'your crop' : 'আপনার ফসল');
        return {
            reply: q
                ? `Based on your description, this appears to be a disease issue on ${cropName}. Please consult with your local agricultural officer for accurate diagnosis and treatment. Focus on disease symptoms and prevention.`
                : `আপনার বর্ণনা অনুযায়ী, ${cropName}-এ রোগের সমস্যা বলে মনে হচ্ছে। সঠিক নির্ণয় ও চিকিৎসার জন্য স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন। শুধুমাত্র রোগের লক্ষণ ও প্রতিরোধে মনোযোগ দিন।`,
            lang,
            model: 'disease-only',
        };
    }

    // 8. Vermicompost / Trichoderma product info (non-calculation)
    if ((fert === 'vermicompost' || fert === 'trichoderma') && !intent.isCalculationQuery && !intent.isTrichodermaTiming && !intent.isDiseaseQuery) {
        const INFO = {
            vermicompost: q
                ? 'Vermicompost (Vermi) is an organic fertilizer produced by earthworms.\n- Improves soil structure and nutrient availability\n- Suitable for all crop land\n- SF verified rate: 1.5-2 tons/acre (field)\n- For garden: 0.5-1 kg/plant'
                : 'ভার্মিকমপোস্ট (ভার্মি) কৃমি দ্বারা উৎপাদিত জৈব সার।\n- মাটির গঠন ও পুষ্টি উপলব্ধতা উন্নত করে\n- সকল ধরনের ফসলের জমিতে প্রযোজ্য\n- SF যাচাইকৃত হার: ১.৫-২ টন/একর (মাঠ)\n- বাগানে: ০.৫-১ কেজি/গাছ',
            trichoderma: q
                ? 'Trichoderma (Tricho) is a biocontrol fungal agent.\n- Prevents and controls soil-borne fungal diseases\n- SF verified rate: 2.5 kg/acre soil mix\n- Spray: 5 g/L water for disease control\n- Timing: land preparation, before/after planting, preventive or when disease appears'
                : 'ট্রাইকোডার্মা (ট্রাইকো) জৈব ছত্রাক নিয়ন্ত্রক।\n- মাটি জনিত ছত্রাকজনিত রোগ প্রতিরোধ ও নিয়ন্ত্রণ করে\n- SF যাচাইকৃত হার: ২.৫ কেজি/একর মাটিতে মেশান\n- স্প্রে: ৫ গ্রাম/লিটার পানি\n- সময়: জমি প্রস্তুতি, রোপণের আগে/পরে, প্রতিরোধমূলক বা রোগ দেখা গেলে',
        };
        return { reply: INFO[fert], lang, model: fert + '-info' };
    }

    // 9. Urea info (non-calculation)
    if (fert === 'urea' && !intent.isCalculationQuery) {
        return {
            reply: q
                ? 'Urea is a high-nitrogen fertilizer (46% N). For rice: split into 3 stages — basal 25-30 kg/acre, tillering 30-35 kg/acre, panicle 25 kg/acre. Total 80-90 kg/acre.'
                : 'ইউরিয়া একটি উচ্চ-নাইট্রোজেন সার (৪৬% N)। ধানে: ৩ ধাপে বিভক্ত — প্রাথমিক ২৫-৩০ কেজি/একর, শাখা গঠন ৩০-৩৫ কেজি/একর, শীর্ষ গঠন ২৫ কেজি/একর। মোট ৮০-৯০ কেজি/একর।',
            lang,
            model: 'urea-info',
        };
    }

    return null;
}

export { deterministicRoute };
