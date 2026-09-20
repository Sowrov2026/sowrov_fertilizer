import { sendMessage } from './api/_shared/provider-router.js';
import { processLanguage } from './api/_shared/agents/language.js';
import { detectIntent } from './api/_shared/agents/intent.js';
import { buildFullKnowledgeContext, searchRawDocuments, generateKnowledgeAnswer } from './api/_shared/agents/knowledge.js';
import { searchAndRankProducts } from './api/_shared/agents/product.js';
import { deterministicRoute } from './api/_shared/deterministic-route.js';

const API_KEY = process.env.GROQ_API_KEY;
if (!API_KEY) { console.error('ERROR: GROQ_API_KEY not set.'); process.exit(1); }

const QUERIES = [
  { id: 1, q: '\u09A7\u09BE\u09A8\u09C7\u09B0 10 \u09AF\u09C7\u0995\u09B0 \u099C\u09AE\u09BF\u09A4\u09C7 \u0995\u09A4\u099F\u09C1\u0995\u09C1 \u09B8\u09BE\u09B0 \u09B2\u09BE\u0997\u09AC\u09C7?', expect: 'clarification: Vermi or Tricho', category: 'generic-fertilizer' },
  { id: 2, q: '\u09A7\u09BE\u09A8\u09C7\u09B0 10 \u09AF\u09C7\u0995\u09B0\u09C7 \u0995\u09A4 Vermi \u09B2\u09BE\u0997\u09AC\u09C7?', expect: 'calculation: 15-20 tons', category: 'vermi-calculation' },
  { id: 3, q: '\u09A7\u09BE\u09A8\u09C7\u09B0 10 \u09AF\u09C7\u0995\u09B0\u09C7 \u0995\u09A4 Tricho \u09B2\u09BE\u0997\u09AC\u09C7?', expect: 'calculation: 25 kg', category: 'tricho-calculation' },
  { id: 4, q: 'Trichoderma \u0995\u09A4\u09C7 \u09A4\u09C1\u09B2\u09C7 \u09A6\u09BF\u09A4\u09C7 \u09B9\u09DF\u09C7\u09A8?', expect: 'multiple timings', category: 'tricho-timing' },
  { id: 5, q: '\u09A7\u09BE\u09A8\u09C7\u09B0 \u09AC\u09CD\u09B2\u09BE\u09B8\u09CD\u099F \u09B0\u09CB\u0997\u09C7\u09B0 \u09B2\u0995\u09CD\u09B7\u09A3 \u0995\u09C0?', expect: 'disease-specific, no fertilizer', category: 'disease' },
  { id: 6, q: 'What is the capital of Bangladesh?', expect: 'Dhaka, no SF products', category: 'general-knowledge' },
  { id: 7, q: 'How much urea for 5 acres of rice?', expect: 'calculation with urea', category: 'urea-calculation' },
  { id: 8, q: '\u09B8\u09BE\u09B0 \u0995\u09A4 \u09A6\u09BF\u09AC?', expect: 'clarification needed', category: 'missing-info' },
  { id: 9, q: 'Tell me about vermicompost', expect: 'SF product info', category: 'english-product' },
  { id: 10, q: 'Which is better for rice: vermicompost or trichoderma?', expect: 'compares both', category: 'comparison' },
  { id: 11, q: '\u099F\u09AE\u09C7\u099F\u09CB \u0997\u09BE\u09B6\u09C7 \u09B9\u09B2\u09C1\u09A6\u09C7 \u0995\u09BF?', expect: 'disease only', category: 'disease-bangla' },
];

async function simulateChat(rawInput) {
  const langResult = processLanguage(rawInput);
  const intent = detectIntent(rawInput, langResult);
  const lang = langResult.language;

  // ── Deterministic routing BEFORE Groq (shared module) ──
  const detRoute = deterministicRoute(intent, lang);
  if (detRoute) {
    return {
      intent: intent.primaryIntent, subIntent: intent.subIntent,
      cropName: intent.cropName, fertType: intent.normalizedFertilizerType,
      quantity: intent.quantity, quantityUnit: intent.quantityUnit,
      calcResult: null, provider: 'deterministic', model: detRoute.model,
      latency: 0, answer: detRoute.reply, lang,
    };
  }

  // ── Clarification (no fertilizer type for generic query) ──
  let clarification = null;
  if (intent.isFertilizerQuery && !intent.normalizedFertilizerType && !intent.isDiseaseQuery && !intent.isCalculationQuery) {
    clarification = lang === 'english'
      ? 'Which fertilizer do you need: Vermicompost (organic) or Trichoderma (biocontrol)?'
      : '\u0995\u09CB\u09A8 \u09B8\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u09A4\u09C7 \u099C\u09BE\u09A8\u09A4\u09C7 \u099A\u09BE\u09A8? \u09AD\u09BE\u09B0\u09CD\u09AE\u09BF\u0995\u09AE\u09AA\u09CB\u09B8\u09CD\u09A4 (\u099C\u09C8\u09AC \u09B8\u09BE\u09B0) \u09A8\u09BE\u0995\u09BF \u099F\u09CD\u09B0\u09BE\u0987\u0995\u09CB\u09A1\u09BE\u09B0\u09CD\u09AE\u09BE (\u099C\u09C8\u09AC \u099B\u09A4\u09CD\u09B0\u09BE\u0995)?';
  }

  // ── Send to Groq ──
  let productResults = { products: [], context: '' };
  if (intent.isProductQuery || intent.isFertilizerQuery || intent.primaryIntent === 'product' || intent.primaryIntent === 'fertilizer') {
    productResults = await searchAndRankProducts(rawInput, intent.cropName, intent.primaryIntent);
  }
  const knowledgeContext = buildFullKnowledgeContext(rawInput, {
    crop: intent.cropName, disease: null, season: intent.season,
    intent: intent.primaryIntent, subIntent: intent.subIntent, limit: 6,
  });

  const sp = lang === 'english'
    ? "You are SF AI, Bangladeshi agriculture expert representing Sowrov Fertilizer company.\n\nRULES:\n- Answer ONLY the specific question.\n- Fertilizer questions: only fertilizer info.\n- Disease questions: only disease info.\n- Use [CALCULATION] if provided. Do NOT recompute.\n- Ask clarification if info missing.\n- Keep answers concise.\n- Use Bengali if user writes in Bengali.\n- Never invent rates.\n- OUR PRODUCTS: Vermicompost and Trichoderma. Recommend our products first for generic fertilizer questions.\n- Vermicompost: 1.5-2 tons/acre field, 0.5-1 kg/plant garden.\n- Trichoderma: 2.5 kg/acre soil mix, 5 g/L spray.\n- Vermicompost = organic fertilizer for nutrition. Trichoderma = biocontrol for disease.\n- Keep them separated."
    : "\u09A4\u09CB\u09AE\u09BF SF AI, \u09AC\u09BE\u0982\u09B2\u09BE\u09A6\u09C7\u09B6 \u0995\u09C3\u09B7\u09BF \u09AC\u09BF\u09B6\u09C7\u09B7\u099C\u09CD\u099E \u2014 \u09B8\u09CC\u09B0\u09AD \u09AB\u09BE\u09B0\u09CD\u099F\u09BF\u09B2\u09BE\u0987\u099C\u09BE\u09B0 \u0995\u09CB\u09AE\u09CD\u09AA\u09BE\u09A8\u09BF\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09A8\u09C7\u09A7\u09BF\u09A4\u09C7\u09B2\u09BF\u099A\u09BF\u09A4\u09CD\u09A4\u09C1\u09B9\u09BE\u09B0\u09C7\u09A8\u0964\n\n\u09A8\u09BF\u09AF\u09BC\u09AE\u09BE\u09AC\u09B2\u09C0:\n- \u09B6\u09C1\u09A7\u09C1\u09AE\u09BE\u09A4\u09CD\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u0995\u09BE\u09B0\u09C0\u09B0 \u09A1\u09BF\u099C\u09BE\u09B8\u09BE\u09B0 \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0989\u09A4\u09CD\u09A4\u09B0 \u09A6\u09C7\u09A1\u09BC\u09CB\u09A4\u099C\u09C7\u09B6\u09A8\u09B9\u09BE\u09B0\u09C7\u09A8\u0964\n- \u09B8\u09B8\u09CD\u09A4 \u099C\u09CD\u09A8\u09BE\u09A8 \u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA \u0995\u09B0\u09CB \u09A8\u09BE\u0996\u09A8\u0964\n- \u09B8\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u09A4\u09BF\u09A4 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7 \u09B6\u09C1\u09A7\u09C1 \u09AC\u09CD\u09A4\u09A4\u09BE \u09A6\u09BF\u09A8\u0964\n- \u09B0\u09CB\u0997 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u09A4\u09BF\u09A4 \u09AA\u09CD\u09B0\u09B6\u09CD\u09A8\u09C7 \u09B6\u09C1\u09A7\u09C1 \u09B0\u09CB\u0997 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u09A4\u09BF\u09A4\u0964\n- [CALCULATION] \u09A4\u099A\u09B2\u09A4 \u09B9\u09B2\u09C7 \u09B8\u09C7\u09A4\u09A4 \u09A6\u09BF\u09A8\u0964 \u09AA\u09C1\u09A8\u09B0\u09BE\u09AF\u09BC \u09B9\u09BF\u09B8\u09BE\u09AC \u09A8\u09C7\u09B9\u09C7\u09A8\u0964\n- \u09B8\u09BE\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u09A4\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09A7\u09BE\u09A8 \u09A8\u09BE\u09AE\u09A6\u09BE\u09A8\u09C7\u09B6\u09A8\u0964\n- \u09B8\u09C1\u09B8\u09CD\u09A4 \u09A6\u09C7\u09A8\u09A4\u09A4\u09A4\u09CD\u09AC \u09B0\u09BE\u0996\u09C1\u09A8\u0964\n- \u09AA\u09B0\u09BF\u09B7\u09BF\u09A4\u09AC\u09B2\u09BE \u09B2\u09BF\u0996\u09C7\u09A8 \u099B\u09C7\u09B2\u09C7 \u09AE\u09B8\u09CD\u09A4\u099A\u09A7\u09CD\u09B0\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u098B\u0999\u09CD\u0997\u09B0\u09A4\u09AC\u09A8\u09C7 \u09B9\u09A8\u09A4\u09C7 \u09A8\u09C0\u09B0\u09C1\u09A4\u09CD\u09B5\u09C7\u09B0 \u09A6\u09C7\u09A8\u09A4\u09A4\u09A4\u09CD\u09AC\u09B0\u09A8\u09CD\u09A4\u09B0 \u09A8\u09C7\u09B9\u09A8\u0964\n- \u09A4\u09A8\u09B0\u09BE \u09B0\u09C7\u099F \u09B8\u09A8\u09A1\u09CD\u09A4\u09B0\u09AC\u09B2\u09C7 \u099B\u09A1\u09BC\u09A4\u09A4 \u0995\u09B0\u09BF\u09A4\u09A6\u09A8\u09BE \u09A8\u09BF\u09B7\u09C7\u09A6 \u09A3\u09C7\u09B6\u09A8\u0964";

  let ctx = rawInput;
  if (knowledgeContext && knowledgeContext.length > 50) ctx += '\n\n[KNOWLEDGE]:\n' + knowledgeContext;
  if (productResults.context) ctx += '\n\n[PRODUCTS]:\n' + productResults.context;

  const resp = await sendMessage([{ role: 'user', content: ctx }], sp, { maxTokens: 800 });

  let answer = '';
  let provider = resp.provider || 'unknown';
  let model = resp.model || 'unknown';
  let latency = resp.latency || 0;

  if (clarification) {
    answer = clarification;
    provider = 'clarification';
    model = 'intent';
  } else if (resp.reply && resp.reply.trim()) {
    answer = resp.reply.trim();
  } else {
    answer = lang === 'english'
      ? 'Please consult a local agriculture officer for assistance.'
      : '\u09B8\u09B9\u09BE\u09AF\u09CB\u09A4\u09CD\u09A4\u09B0\u09B8\u09BE\u09A6\u09A6\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8\u0964';
    provider = 'emergency-fallback';
  }

  return {
    intent: intent.primaryIntent, subIntent: intent.subIntent,
    cropName: intent.cropName, fertType: intent.normalizedFertilizerType,
    quantity: intent.quantity, quantityUnit: intent.quantityUnit,
    calcResult: null, provider, model, latency, answer, lang,
  };
}

console.log('='.repeat(80));
console.log('SF AI - REAL LLM/GROQ ACCEPTANCE TEST');
console.log('Model: openai/gpt-oss-120b (primary) / openai/gpt-oss-20b (fallback)');
console.log('Timestamp: ' + new Date().toISOString());
console.log('='.repeat(80));

for (let i = 0; i < QUERIES.length; i++) {
  const { id, q, expect: exp, category } = QUERIES[i];
  console.log('\n' + '-'.repeat(80));
  console.log('TEST ' + id + ' [' + category + ']: ' + q);
  console.log('Expected: ' + exp);
  console.log('-'.repeat(80));
  try {
    const r = await simulateChat(q);
    console.log('Provider:    ' + r.provider + ' (' + r.model + ')');
    console.log('Latency:     ' + r.latency + 'ms');
    console.log('Intent:      ' + r.intent + ' / ' + r.subIntent);
    console.log('Crop:        ' + (r.cropName || 'none'));
    console.log('FertType:    ' + (r.fertType || 'none'));
    console.log('Quantity:    ' + (r.quantity || 'none') + ' ' + (r.quantityUnit || ''));
    console.log('Lang:        ' + r.lang);
    console.log('--- ANSWER ---');
    console.log(r.answer);
    console.log('--- END ---');
  } catch (err) {
    console.error('ERROR: ' + err.message);
  }
  if (i < QUERIES.length - 1) await new Promise(r => setTimeout(r, 2000));
}

console.log('\n' + '='.repeat(80));
console.log('ALL TESTS COMPLETE');
console.log('='.repeat(80));
