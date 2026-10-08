/* ============================================
   SF AI — BD Address Data Validation Tests
   Deterministic checks for assets/data/bd-address
   ============================================ */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), 'assets', 'data', 'bd-address');
const load = (name) => JSON.parse(readFileSync(join(DATA_DIR, name), 'utf8'));

const divisions = load('divisions.json');
const districts = load('districts.json');
const upazilas = load('upazilas.json');
const unions = load('unions.json');

let passed = 0;
let failed = 0;

function test(label, fn) {
    try {
        fn();
        passed++;
        console.log(`  \u2713 ${label}`);
    } catch (e) {
        failed++;
        console.log(`  \u2717 ${label}: ${e.message}`);
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEq(actual, expected, msg) {
    if (actual !== expected) throw new Error(msg || `Expected ${expected}, got ${actual}`);
}

function assertSetEq(actual, expected, label) {
    const a = [...actual].sort();
    const e = [...expected].sort();
    assertEq(a.join('|'), e.join('|'), `${label}: got [${a.join(', ')}]`);
}

const divisionById = new Map(divisions.map(d => [d.id, d]));
const districtById = new Map(districts.map(d => [d.id, d]));
const upazilaById = new Map(upazilas.map(u => [u.id, u]));
const unionsByUpazila = new Map();
for (const u of unions) {
    if (!unionsByUpazila.has(u.upazilla_id)) unionsByUpazila.set(u.upazilla_id, []);
    unionsByUpazila.get(u.upazilla_id).push(u.name);
}

function findUpazila(name, districtName) {
    let hits = upazilas.filter(u => u.name === name);
    if (districtName) {
        const dist = districts.find(d => d.name === districtName);
        assert(dist, `district "${districtName}" missing`);
        hits = hits.filter(u => u.district_id === dist.id);
    }
    assertEq(hits.length, 1, `upazila "${name}"${districtName ? ' in ' + districtName : ''} must exist exactly once`);
    return hits[0];
}

function unionNames(name, districtName) {
    return unionsByUpazila.get(findUpazila(name, districtName).id) || [];
}

// ── Structure ──
console.log('=== BD Address Structure ===');

test('divisions count is 8', () => assertEq(divisions.length, 8));
test('districts count is 64', () => assertEq(districts.length, 64));
test('upazilas count is 500 (official Bangladesh total)', () => assertEq(upazilas.length, 500));

test('division ids are unique and sorted', () => {
    const ids = divisions.map(d => d.id);
    assertEq(new Set(ids).size, ids.length, 'duplicate division ids');
    assert(ids.every((id, i) => i === 0 || ids[i - 1] < id), 'division ids not ascending');
});

test('district ids are unique, sorted, and FK-valid', () => {
    const ids = districts.map(d => d.id);
    assertEq(new Set(ids).size, ids.length, 'duplicate district ids');
    assert(ids.every((id, i) => i === 0 || ids[i - 1] < id), 'district ids not ascending');
    for (const d of districts) assert(divisionById.has(d.division_id), `district ${d.id} -> missing division ${d.division_id}`);
});

test('upazila ids are unique, sorted, and FK-valid', () => {
    const ids = upazilas.map(u => u.id);
    assertEq(new Set(ids).size, ids.length, 'duplicate upazila ids');
    assert(ids.every((id, i) => i === 0 || ids[i - 1] < id), 'upazila ids not ascending');
    for (const u of upazilas) assert(districtById.has(u.district_id), `upazila ${u.id} -> missing district ${u.district_id}`);
});

test('union ids are unique, sorted, and FK-valid', () => {
    const ids = unions.map(u => u.id);
    assertEq(new Set(ids).size, ids.length, 'duplicate union ids');
    assert(ids.every((id, i) => i === 0 || ids[i - 1] < id), 'union ids not ascending');
    for (const u of unions) assert(upazilaById.has(u.upazilla_id), `union ${u.id} -> missing upazila ${u.upazilla_id}`);
});

test('all names are non-empty strings', () => {
    for (const [label, rows] of [['division', divisions], ['district', districts], ['upazila', upazilas], ['union', unions]]) {
        for (const r of rows) assert(typeof r.name === 'string' && r.name.trim().length > 0, `${label} ${r.id} has empty name`);
    }
});

test('every upazila has at least one union (no empty upazilas)', () => {
    const empty = upazilas.filter(u => !unionsByUpazila.has(u.id) || unionsByUpazila.get(u.id).length === 0);
    assertEq(empty.length, 0, `empty upazilas: ${empty.map(u => u.id + ':' + u.name).join(', ')}`);
});

// ── Reconciled hierarchy: exact membership ──
console.log('=== Reconciled Upazila Union Sets ===');

const exactSets = {
    Guimara: ['Hafchari', 'Guimara', 'Sindukchari'],
    Eidgaon: ['Eidgaon', 'Islampur', 'Jalalabad', 'Islamabad', 'Pokkhali'],
    Naldanga: ['Brahmapur', 'Madhnagar', 'Khajura', 'Piprul', 'Biprobelghoria'],
    Dasar: ['Gopalpur', 'Baligram', 'Dashar', 'Kazibakai', 'Nabogram'],
    Madhyanagar: ['Bongshikunda North', 'Bongshikunda South', 'Chamordani', 'Madhyanagar'],
    Mokamtala: ['Moidanhatta', 'Shibganj', 'Deuly', 'Sayedpur', 'Mokamtala'],
    Shayestaganj: ['Shayestaganj', 'Nurpur', 'Brahmandura'],
    Chandraganj: ['Dattapara', 'Basikpur', 'Chandrogonj', 'Nourthjoypur', 'Hazirpara', 'Charshahi', 'Digli', 'Kusakhali', 'Mandari'],
    Ruhia: ['Ruhea', 'Akhanagar', 'Rajagaon', 'Ruhia Pashchim', 'Dholarhat', 'Senua'],
    Bhulli: ['Baragaon', 'Balia', 'Auliapur', 'Debipur', 'Sukhanpukhari'],
    Matamuhuri: ['Konakhali', 'Demusia', 'Paschim Bara Bheola', 'Badarkhali', 'Bheola Manik Char', 'Saharbil', 'Purba Bara Bheola'],
    Shantiganj: ['Shimulbak', 'Paschim Pagla', 'Joykalash', 'Purba Pagla', 'Patharia', 'Purba Birgaon', 'Dargapasha', 'Paschim Birgaon'],
};
for (const [name, expected] of Object.entries(exactSets)) {
    test(`${name} unions match official set (${expected.length})`, () => assertSetEq(unionNames(name), expected, name));
}

// ── Reconciled hierarchy: source upazila counts after splits ──
console.log('=== Source Upazila Counts After Reconciliation ===');

const expectedCounts = [
    ['Coxsbazar Sadar', "Cox's Bazar", 5],
    ['Ramgarh', 'Khagrachhari', 2],
    ['Matiranga', 'Khagrachhari', 7],
    ['Natore Sadar', 'Natore', 7],
    ['Kalkini', 'Madaripur', 10],
    ['Dharmapasha', 'Sunamganj', 6],
    ['Shibganj', 'Bogura', 7],
    ['Habiganj Sadar', 'Habiganj', 8],
    ['Lakshmipur Sadar', 'Lakshmipur', 12],
    ['Thakurgaon Sadar', 'Thakurgaon', 11],
    ['Chakaria', "Cox's Bazar", 11],
];
for (const [name, district, want] of expectedCounts) {
    test(`${name} (${district}) has ${want} unions`, () => assertEq(unionNames(name, district).length, want, `${name} count`));
}

// ── Targeted regressions for the original zero-child bug ──
console.log('=== Original Bug Targets ===');

test('five original zero-child upazilas exist with correct ids', () => {
    assertEq(findUpazila('Guimara').id, 96);
    assertEq(findUpazila('Naldanga').id, 149);
    assertEq(findUpazila('Eidgaon').id, 492);
    assertEq(findUpazila('Madhyanagar').id, 493);
    assertEq(findUpazila('Dasar').id, 494);
});

test('six newly added upazilas exist (495-500)', () => {
    assertEq(findUpazila('Chandraganj').id, 495);
    assertEq(findUpazila('Shayestaganj').id, 496);
    assertEq(findUpazila('Mokamtala').id, 497);
    assertEq(findUpazila('Ruhia').id, 498);
    assertEq(findUpazila('Bhulli').id, 499);
    assertEq(findUpazila('Matamuhuri').id, 500);
});

test('South Sunamganj was renamed to Shantiganj (id 301)', () => {
    assertEq(findUpazila('Shantiganj').id, 301);
    assertEq(upazilas.filter(u => u.name === 'South Sunamganj').length, 0);
});

test('seven reconciled unions added (4541-4547)', () => {
    const byId = new Map(unions.map(u => [u.id, u]));
    const expected = {
        4541: ['Sindukchari', findUpazila('Guimara').id],
        4542: ['Mandari', findUpazila('Chandraganj').id],
        4543: ['Purbo Enayetnagor', findUpazila('Kalkini').id],
        4544: ['Brahmandura', findUpazila('Shayestaganj').id],
        4545: ['Senua', findUpazila('Ruhia').id],
        4546: ['Purba Bara Bheola', findUpazila('Matamuhuri').id],
        4547: ['Lakshyar Char', findUpazila('Chakaria').id],
    };
    for (const [id, [name, parent]] of Object.entries(expected)) {
        const u = byId.get(Number(id));
        assert(u, `union ${id} missing`);
        assertEq(u.name, name, `union ${id} name`);
        assertEq(u.upazilla_id, parent, `union ${id} parent`);
    }
});

// ── Official reconciliation ledger ──
console.log('=== Official Reconciliation Ledger ===');

test('unions count is 4601 after official reconciliation', () => assertEq(unions.length, 4601));

test('upazila name fixes: Burhanuddin (Bhola, 260), Roypura (Narsingdi, 315)', () => {
    assertEq(findUpazila('Burhanuddin', 'Bhola').id, 260);
    assertEq(findUpazila('Roypura', 'Narsingdi').id, 315);
    assertEq(upazilas.filter(u => u.name === 'Borhan Sddin' || u.name === 'Raipura').length, 0);
});

const unionRenames = {
    943: ['Paindu', 'Ruma', 'Bandarban'],
    948: ['Tindu', 'Thanchi', 'Bandarban'],
    242: ['Natais', 'Brahmanbaria Sadar', 'Brahmanbaria'],
    243: ['Natain', 'Brahmanbaria Sadar', 'Brahmanbaria'],
    482: ['Palakhal Model', 'Kachua', 'Chandpur'],
    702: ['Silkup', 'Banshkhali', 'Chattogram'],
    776: ['Burischar', 'Hathazari', 'Chattogram'],
    157: ['Goliara (North)', 'Sadarsouth', 'Cumilla'],
    178: ['Bharella (North)', 'Burichang', 'Cumilla'],
    71: ['Maligaon', 'Daudkandi', 'Cumilla'],
    89: ['Mudafargonj (North)', 'Laksam', 'Cumilla'],
    119: ['Raykot (North)', 'Nangalkot', 'Cumilla'],
    123: ['Adra (North)', 'Nangalkot', 'Cumilla'],
    1361: ['Bambu', 'Joypurhat Sadar', 'Joypurhat'],
    3258: ['Kalia', 'Doulatpur', 'Manikganj'],
    3474: ['Bhadrasan', 'Shibchar', 'Madaripur'],
    3369: ['Jainsar', 'Sirajdikhan', 'Munshiganj'],
    3392: ['Arial', 'Tongibari', 'Munshiganj'],
    3896: ['Chapra Saramjani', 'Nilphamari Sadar', 'Nilphamari'],
    2687: ['Kurbannagar', 'Sunamganj Sadar', 'Sunamganj'],
    1271: ['Dwippur', 'Bagmara', 'Rajshahi'],
    1280: ['Jhikra', 'Bagmara', 'Rajshahi'],
    4234: ['Kangsha', 'Jhenaigati', 'Sherpur'],
    3063: ['Bahuria', 'Sakhipur', 'Tangail'],
    2494: ['Purbo Alirgaon', 'Gowainghat', 'Sylhet'],
    2353: ['Ahmedpur', 'Charfesson', 'Bhola'],
};
test('26 union renames applied with correct parents', () => {
    for (const [id, [name, uz, dn]] of Object.entries(unionRenames)) {
        const u = unions.find(x => x.id === Number(id));
        assert(u, `union ${id} exists`);
        assertEq(u.name, name, `union ${id} name`);
        assertEq(u.upazilla_id, findUpazila(uz, dn).id, `union ${id} parent`);
    }
});

test('15 unions removed (8 Cumilla dups, 5 re-parented to Karnafuli, 2 name dups)', () => {
    for (const id of [159, 160, 161, 162, 163, 164, 165, 166, 665, 666, 670, 673, 676, 2546, 3686]) {
        assert(!unions.find(u => u.id === id), `union ${id} must be removed`);
    }
});

test('69 added unions occupy ids 4548-4616', () => {
    const added = unions.filter(u => u.id >= 4548);
    assertEq(added.length, 69, 'added count');
    assert(added.every(u => u.id >= 4548 && u.id <= 4616), 'added ids in range 4548-4616');
    assert(added.every(u => upazilaById.has(u.upazilla_id)), 'added unions FK-valid');
});

const hasUnion = (name, uz, dn) => {
    const zid = findUpazila(uz, dn).id;
    assert(unions.some(u => u.upazilla_id === zid && u.name === name), `missing ${name} @${dn}/${uz}`);
};
test('key added unions present', () => {
    hasUnion('Jamchari', 'Bandarban Sadar', 'Bandarban');
    hasUnion('Nayapara', 'Alikadam', 'Bandarban');
    hasUnion('Kurukpata', 'Alikadam', 'Bandarban');
    hasUnion('Dakshin Ullania', 'Mehendiganj', 'Barishal');
    hasUnion('Gongapur', 'Burhanuddin', 'Bhola');
    hasUnion('Sukhanpukur', 'Gabtali', 'Bogura');
    hasUnion('Dharmapur', 'Satkania', 'Chattogram');
    hasUnion('Padua', 'Rangunia', 'Chattogram');
    hasUnion('KDK', 'Jibannagar', 'Chuadanga');
    hasUnion('Makhaldanga', 'Chuadanga Sadar', 'Chuadanga');
    hasUnion('Natudah', 'Damurhuda', 'Chuadanga');
    hasUnion('Mudafargonj (South)', 'Laksam', 'Cumilla');
    hasUnion('Bakoi (North)', 'Lalmai', 'Cumilla');
    hasUnion('Goliara (South)', 'Sadarsouth', 'Cumilla');
    hasUnion('Bharella (South)', 'Burichang', 'Cumilla');
    hasUnion('Palashbari', 'Birol', 'Dinajpur');
    hasUnion('Arpara', 'Madhukhali', 'Faridpur');
    hasUnion('Ultachari', 'Panchari', 'Khagrachhari');
    hasUnion('Char Shoulemari', 'Rowmari', 'Kurigram');
    hasUnion('Baligaon', 'Tongibari', 'Munshiganj');
    hasUnion('Mirzapur', 'Roypura', 'Narsingdi');
    hasUnion('Charoborhan', 'Dashmina', 'Patuakhali');
    hasUnion('Indurkani Sadar', 'Zianagar', 'Pirojpur');
    hasUnion('Barathali', 'Belaichari', 'Rangamati');
    hasUnion('Jamalganj North', 'Jamalganj', 'Sunamganj');
    hasUnion('Gowainghat Sadar', 'Gowainghat', 'Sylhet');
    hasUnion('Bagha', 'Golapganj', 'Sylhet');
    hasUnion('Mahishmara', 'Madhupur', 'Tangail');
    hasUnion('Hatea Rajbari', 'Sakhipur', 'Tangail');
});

test('per-upazila counts match official after reconciliation', () => {
    const counts = [
        ['Burhanuddin', 'Bhola', 9], ['Charfesson', 'Bhola', 20],
        ['Roypura', 'Narsingdi', 24], ['Gowainghat', 'Sylhet', 11],
        ['Mehendiganj', 'Barishal', 16], ['Jibannagar', 'Chuadanga', 8],
        ['Chuadanga Sadar', 'Chuadanga', 9], ['Damurhuda', 'Chuadanga', 8],
        ['Patiya', 'Chattogram', 17], ['Sadarsouth', 'Cumilla', 7],
        ['Lalmai', 'Cumilla', 9], ['Dashmina', 'Patuakhali', 7],
        ['Rangabali', 'Patuakhali', 6], ['Jamalganj', 'Sunamganj', 6],
        ['Zianagar', 'Pirojpur', 5], ['Barlekha', 'Moulvibazar', 10],
        ['Tetulia', 'Panchagarh', 7], ['Tongibari', 'Munshiganj', 13],
    ];
    for (const [uz, dn, want] of counts) assertEq(unionNames(uz, dn).length, want, `${dn}/${uz} count`);
});

test('district totals match official after reconciliation', () => {
    const totals = [
        ['Cumilla', 193], ['Chattogram', 193], ['Chuadanga', 40], ['Bhola', 69],
        ['Moulvibazar', 67], ['Panchagarh', 43], ['Barishal', 88], ['Tangail', 120],
        ['Sylhet', 107], ['Sunamganj', 88], ['Patuakhali', 77],
    ];
    for (const [dn, want] of totals) {
        const d = districts.find(x => x.name === dn);
        assert(d, `district ${dn}`);
        const got = unions.filter(u => upazilaById.get(u.upazilla_id).district_id === d.id).length;
        assertEq(got, want, `${dn} total`);
    }
});

test('no duplicate union names within an upazila', () => {
    const seen = new Set();
    for (const u of unions) {
        const k = u.upazilla_id + '|' + u.name.toLowerCase();
        assert(!seen.has(k), `duplicate name in upazila ${u.upazilla_id}: ${u.name}`);
        seen.add(k);
    }
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
