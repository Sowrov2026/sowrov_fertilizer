import { deterministicRoute } from './api/_shared/deterministic-route.js';
import { detectIntent } from './api/_shared/agents/intent.js';
import { processLanguage } from './api/_shared/agents/language.js';

function testRoute(q) {
  const lr = processLanguage(q);
  const intent = detectIntent(q, lr);
  return { intent, route: deterministicRoute(intent, lr.language) };
}

const tests = [
  { id: 1, q: 'ধানের 10 একর জমিতে কতটুকু সার লাগবে?', expectModel: 'clarification' },
  { id: 2, q: 'ধানের 10 একরে কত Vermi লাগবে?', expectModel: 'vermi-calc' },
  { id: 3, q: 'ধানের 10 একরে কত Tricho লাগবে?', expectModel: 'tricho-calc' },
  { id: 4, q: 'Trichoderma কতে তুলে দিতে হয়?', expectModel: 'tricho-timing' },
  { id: 5, q: 'ধানের ব্লাস্ট রোগের লক্ষণ কী?', expectModel: null },
  { id: 6, q: 'What is the capital of Bangladesh?', expectModel: null },
  { id: 7, q: 'How much urea for 5 acres of rice?', expectModel: 'urea-calc' },
  { id: 8, q: 'সার কত দিব?', expectModel: 'clarification' },
  { id: 9, q: 'Tell me about vermicompost', expectModel: 'vermicompost-info' },
  { id: 10, q: 'Which is better for rice: vermicompost or trichoderma?', expectModel: 'comparison' },
  { id: 11, q: 'টমেটোর গাছে হলুদে কেন?', expectModel: null },
  { id: 12, q: 'গম কখন বপন ভালো?', expectModel: null },
  { id: 13, q: 'টমেটোর পাতা হলুদে কেন?', expectModel: null },
  { id: 14, q: 'When should I irrigate wheat?', expectModel: null },
  { id: 15, q: 'ভুট্টার জমি কীভাবে প্রস্তুত করব?', expectModel: null },
  { id: 16, q: 'ধানের ব্লাস্ট রোগের লক্ষণ কী?', expectModel: null },
  { id: 17, q: 'ধানে তেলা পানি কতদিন রাখনে হয়?', expectModel: null },
];

let pass = 0;
for (const t of tests) {
  const { intent, route } = testRoute(t.q);
  const model = route ? route.model : null;
  const ok = model === t.expectModel;
  if (ok) pass++;
  console.log('Test ' + t.id + ': ' + (ok ? 'PASS' : 'FAIL') + ' | expected=' + t.expectModel + ' got=' + model + ' | ' + t.q);
}
console.log('\n' + pass + '/' + tests.length + ' routes correct');
