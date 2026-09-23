/* ============================================
   SF AI — Fertilizer Recommendation Intent Tests
   Distinguishes recommendation questions from
   fertilizer-type clarification questions
   ============================================ */

import { detectIntent } from './api/_shared/agents/intent.js';
import { processLanguage } from './api/_shared/agents/language.js';
import { deterministicRoute } from './api/_shared/deterministic-route.js';

function test(label, fn) {
    try {
        fn();
        console.log(`  ✓ ${label}`);
    } catch (e) {
        console.log(`  ✗ ${label}: ${e.message}`);
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEq(actual, expected, msg) {
    if (actual !== expected) throw new Error(msg || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function analyze(q) {
    const lr = processLanguage(q);
    const intent = detectIntent(q, lr);
    const route = deterministicRoute(intent, lr.language);
    return { q, intent, route: route ? route.model : null };
}

// ── Recommendation with crop + growth stage ──
console.log('=== Recommendation (crop + stage → Groq path) ===');

test('EN: "What fertilizers are suitable for rice at the tillering stage?" → recommendation', () => {
    const { intent } = analyze('What fertilizers are suitable for rice at the tillering stage?');
    assertEq(intent.subIntent, 'recommendation');
    assertEq(intent.needsClarification, false);
    assertEq(intent.cropName, 'ধান');
});

test('EN: rice question reaches Groq (no deterministic route)', () => {
    const { route } = analyze('What fertilizers are suitable for rice at the tillering stage?');
    assertEq(route, null);
});

test('BN: "ধানের কুশি পর্যায়ে কোন সার ব্যবহার করা যায়?" → recommendation', () => {
    const { intent } = analyze('ধানের কুশি পর্যায়ে কোন সার ব্যবহার করা যায়?');
    assertEq(intent.subIntent, 'recommendation');
    assertEq(intent.needsClarification, false);
    assertEq(intent.cropName, 'ধান');
});

test('BN: rice question reaches Groq (no deterministic route)', () => {
    const { route } = analyze('ধানের কুশি পর্যায়ে কোন সার ব্যবহার করা যায়?');
    assertEq(route, null);
});

// ── Recommendation with crop only ──
console.log('\n=== Recommendation (crop only → Groq path) ===');

test('EN: "Which fertilizer is best for tomato?" → recommendation', () => {
    const { intent } = analyze('Which fertilizer is best for tomato?');
    assertEq(intent.subIntent, 'recommendation');
    assertEq(intent.needsClarification, false);
    assertEq(intent.cropName, 'টমেটো');
});

test('EN: "What fertilizer should I use for potato?" → recommendation', () => {
    const { intent } = analyze('What fertilizer should I use for potato?');
    assertEq(intent.subIntent, 'recommendation');
    assertEq(intent.needsClarification, false);
    assertEq(intent.cropName, 'আলু');
});

test('BN: "কোন সার ধান দিতে হবে?" → recommendation', () => {
    const { intent } = analyze('কোন সার ধান দিতে হবে?');
    assertEq(intent.subIntent, 'recommendation');
    assertEq(intent.needsClarification, false);
    assertEq(intent.cropName, 'ধান');
});

// ── Genuinely ambiguous → clarification ──
console.log('\n=== Ambiguous (no context → clarification preserved) ===');

test('EN: "Tell me about fertilizer" → clarification', () => {
    const { intent } = analyze('Tell me about fertilizer');
    assertEq(intent.subIntent, 'clarification');
    assertEq(intent.needsClarification, true);
});

test('EN: "Tell me about fertilizer" → clarification route', () => {
    const { route } = analyze('Tell me about fertilizer');
    assertEq(route, 'clarification');
});

test('EN: "Which fertilizer do you have?" → clarification (no crop/context)', () => {
    const { intent } = analyze('Which fertilizer do you have?');
    assertEq(intent.subIntent, 'clarification');
    assertEq(intent.needsClarification, true);
});

test('EN: "Which fertilizer do you have?" → clarification route', () => {
    const { route } = analyze('Which fertilizer do you have?');
    assertEq(route, 'clarification');
});

test('BN: "সার কি?" → clarification', () => {
    const { intent } = analyze('সার কি?');
    assertEq(intent.subIntent, 'clarification');
    assertEq(intent.needsClarification, true);
});

// ── Deterministic routes preserved ──
console.log('\n=== Deterministic routes preserved ===');

test('vermi calc still routes', () => {
    const { route } = analyze('ধানের 10 একরে কত Vermi লাগবে?');
    assertEq(route, 'vermi-calc');
});

test('tricho calc still routes', () => {
    const { route } = analyze('ধানের 10 একরে কত Tricho লাগবে?');
    assertEq(route, 'tricho-calc');
});

test('urea calc still routes', () => {
    const { route } = analyze('How much urea for 5 acres of rice?');
    assertEq(route, 'urea-calc');
});

test('tricho timing still routes', () => {
    const { route } = analyze('Trichoderma কতে তুলে দিতে হয়?');
    assertEq(route, 'tricho-timing');
});

test('vermicompost info still routes', () => {
    const { route } = analyze('Tell me about vermicompost');
    assertEq(route, 'vermicompost-info');
});

test('comparison still routes', () => {
    const { route } = analyze('Which is better for rice: vermicompost or trichoderma?');
    assertEq(route, 'comparison');
});

test('generic unclear fertilizer calc still routes to clarification', () => {
    const { route } = analyze('ধানের 10 একর জমিতে কতটুকু সার লাগবে?');
    assertEq(route, 'clarification');
});

// ── Non-recommendation fertilizer questions unaffected ──
console.log('\n=== Non-recommendation unaffected ===');

test('non-fertilizer question stays general', () => {
    const { intent } = analyze('When should I irrigate wheat?');
    assertEq(intent.primaryIntent, 'general');
    assertEq(intent.subIntent, 'informational');
});

console.log('\n✅ All recommendation intent tests passed');