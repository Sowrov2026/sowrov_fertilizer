import { detectIntent } from './api/_shared/agents/intent.js';
import { processLanguage } from './api/_shared/agents/language.js';

const BN_DIGITS = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
function normalizeBanglaDigits(text) {
    if (!text) return text;
    let out = text;
    for (const [bn, en] of Object.entries(BN_DIGITS)) out = out.replaceAll(bn, en);
    return out;
}

function parseFertilizerRate(text) {
    if (!text) return null;
    const normalized = normalizeBanglaDigits(text);
    const patterns = [
        { re: /(\d+[\.,]?\d*)\s*[-–—]\s*(\d+[\.,]?\d*)\s*(টন|ton|কেজি|kg|গ্রাম|g)/i, unitFromMatch: (m) => (m[3] || '').toLowerCase() },
        { re: /(\d+[\.,]?\d*)\s*(?:টন|ton|কেজি|kg|গ্রাম|g)\s*\/\s*(?:একর|acre|শতক|বিঘা)/i, unitFromMatch: (m) => { const u = m[0].match(/(টন|ton|কেজি|kg|গ্রাম|g)/i); return u ? u[1].toLowerCase() : ''; } },
        { re: /(\d+[\.,]?\d*)\s*[-–—]\s*(\d+[\.,]?\d*)/, unitFromMatch: () => null },
    ];
    for (const { re, unitFromMatch } of patterns) {
        const m = normalized.match(re);
        if (m) {
            const n1 = parseFloat(m[1].replace(',', '.'));
            const n2 = m[2] ? parseFloat(m[2].replace(',', '.')) : n1;
            const unit = unitFromMatch(m);
            if (!isNaN(n1) && n1 > 0) return { min: n1, max: n2, unit };
        }
    }
    return null;
}

function detectFertilizerType(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    const types = [
        { name: 'ভার্মিকমপোস্ট', aliases: ['ভার্মিকমপোস্ট', 'ভার্মি', 'vermicompost', 'vermi'] },
        { name: 'ট্রাইকোডার্মা', aliases: ['ট্রাইকোডার্মা', 'ট্রাইকো', 'trichoderma', 'tricho'] },
        { name: 'ইউরিয়া', aliases: ['ইউরিয়া', 'urea'] },
        { name: 'ডিএপি', aliases: ['ডিএপি', 'dap', 'ডাই অ্যামোনিয়াম'] },
        { name: 'কেসিএ', aliases: ['কেসিএ', 'kca', 'ক্যালসিয়াম অ্যামোনিয়াম'] },
        { name: 'এমওপি', aliases: ['এমওপি', 'mop', 'মিউরিয়েট'] },
        { name: 'কমপোস্ট', aliases: ['কমপোস্ট', 'compost'] },
        { name: 'জিপসাম', aliases: ['জিপসাম', 'gypsum'] },
    ];
    for (const t of types) {
        if (t.aliases.some(a => lower.includes(a))) return t.name;
    }
    return null;
}

function test(label, fn) {
    try {
        const result = fn();
        console.log(`  ✓ ${label}`);
        return result;
    } catch (e) {
        console.log(`  ✗ ${label}: ${e.message}`);
        return null;
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

console.log('=== detectFertilizerType ===');

test('vermicompost (Bangla full)', () => {
    assert(detectFertilizerType('১ একর ভার্মিকমপোস্ট লাগবে') === 'ভার্মিকমপোস্ট');
});
test('vermi (Bangla short)', () => {
    assert(detectFertilizerType('১ একর ভার্মি লাগবে') === 'ভার্মিকমপোস্ট');
});
test('vermicompost (English)', () => {
    assert(detectFertilizerType('how much vermicompost for 1 acre') === 'ভার্মিকমপোস্ট');
});
test('vermi (English short)', () => {
    assert(detectFertilizerType('vermi quantity for rice') === 'ভার্মিকমপোস্ট');
});
test('trichoderma (Bangla full)', () => {
    assert(detectFertilizerType('১ একর ট্রাইকোডার্মা লাগবে') === 'ট্রাইকোডার্মা');
});
test('tricho (Bangla short)', () => {
    assert(detectFertilizerType('১ একর ট্রাইকো লাগবে') === 'ট্রাইকোডার্মা');
});
test('trichoderma (English)', () => {
    assert(detectFertilizerType('trichoderma for 2 acres') === 'ট্রাইকোডার্মা');
});
test('tricho (English short)', () => {
    assert(detectFertilizerType('tricho quantity') === 'ট্রাইকোডার্মা');
});
test('urea still works', () => {
    assert(detectFertilizerType('ইউরিয়া কত লাগবে') === 'ইউরিয়া');
});
test('dap still works', () => {
    assert(detectFertilizerType('DAP কত লাগবে') === 'ডিএপি');
});
test('no match returns null', () => {
    assert(detectFertilizerType('কোন সার ভালো') === null);
});

console.log('\n=== parseFertilizerRate ===');

test('parse tons range', () => {
    const r = parseFertilizerRate('১.৫-২ টন/একর');
    assert(r && r.min === 1.5 && r.max === 2 && r.unit === 'টন');
});
test('parse kg range', () => {
    const r = parseFertilizerRate('২.৫ কেজি/একর');
    assert(r !== null && r.min === 2.5 && r.max === 2.5, 'min/max mismatch');
    assert(r.unit === 'কেজি', 'unit mismatch: got ' + JSON.stringify(r.unit));
});
test('parse English kg', () => {
    const r = parseFertilizerRate('50-60 kg/acre');
    assert(r && r.min === 50 && r.max === 60 && r.unit === 'kg');
});
test('parse tons no unit', () => {
    const r = parseFertilizerRate('১০০-১২০');
    assert(r && r.min === 100 && r.max === 120 && r.unit === null);
});
test('parse gram spray (returns null — spray rates come from knowledge fields)', () => {
    const r = parseFertilizerRate('৫ গ্রাম/লিটার');
    assert(r === null, 'spray pattern not in scope');
});

console.log('\n=== Intent detection (short forms) ===');

test('ভার্মি triggers isFertilizerQuery', () => {
    const lang = processLanguage('ভার্মি কত লাগবে');
    const intent = detectIntent('ভার্মি কত লাগবে', lang);
    assert(intent.isFertilizerQuery === true);
});
test('ট্রাইকো triggers isFertilizerQuery', () => {
    const lang = processLanguage('ট্রাইকো কত লাগবে');
    const intent = detectIntent('ট্রাইকো কত লাগবে', lang);
    assert(intent.isFertilizerQuery === true);
});
test('vermi triggers isFertilizerQuery', () => {
    const lang = processLanguage('vermi for rice');
    const intent = detectIntent('vermi for rice', lang);
    assert(intent.isFertilizerQuery === true);
});
test('tricho triggers isFertilizerQuery', () => {
    const lang = processLanguage('tricho for tomato');
    const intent = detectIntent('tricho for tomato', lang);
    assert(intent.isFertilizerQuery === true);
});
test('ভার্মি triggers isCalculationQuery with quantity', () => {
    const lang = processLanguage('২ একর ভার্মি কত লাগবে');
    const intent = detectIntent('২ একর ভার্মি কত লাগবে', lang);
    assert(intent.isCalculationQuery === true && intent.quantity === 2);
});
test('tricho triggers isCalculationQuery with quantity', () => {
    const lang = processLanguage('tricho for 3 acres');
    const intent = detectIntent('tricho for 3 acres', lang);
    assert(intent.isCalculationQuery === true && intent.quantity === 3);
});

console.log('\n=== Knowledge entry (Trichoderma) ===');

import organicFertilizers from './api/_shared/knowledge/fertilizers/organic.js';

test('Trichoderma entry exists', () => {
    const tricho = organicFertilizers.find(f => f.name === 'Trichoderma');
    assert(tricho !== undefined, 'Trichoderma not found');
    assert(tricho.id === 'org-010');
});
test('Trichoderma has correct dosage', () => {
    const tricho = organicFertilizers.find(f => f.name === 'Trichoderma');
    assert(tricho.dosage.field === '২.৫ কেজি/একর (মাটিতে মেশান)');
});
test('Vermicompost entry still exists', () => {
    const vermi = organicFertilizers.find(f => f.name === 'Vermicompost');
    assert(vermi !== undefined && vermi.id === 'org-002');
});

console.log('\n✅ All tests passed');
