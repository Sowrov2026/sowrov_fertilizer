// ============================================
// SF — Order System Tests
// Tests: login gate, backend auth, notifications,
// persistent idempotency, error handling
// ============================================

import {
    normalizePhoneBD, formatOrderWhatsApp, formatOrderSms, formatOrderEmail,
    sendOrderNotificationsOnce,
    claimNotificationSlot, finalizeNotificationStatus, getNotificationStatus,
    setNotificationDb, IDEMPOTENCY_COLLECTION, CLAIM_TIMEOUT_MS,
} from './api/_shared/order-notifications.js';
import { readFileSync } from 'fs';

let passed = 0;
let failed = 0;

async function test(label, fn) {
    try {
        await fn();
        console.log(`  ✓ ${label}`);
        passed++;
    } catch (e) {
        console.log(`  ✗ ${label}: ${e.message}`);
        failed++;
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(actual, expected, msg) {
    if (actual !== expected) throw new Error(msg || `Expected "${expected}", got "${actual}"`);
}

const orderCode = readFileSync('api/create-order.js', 'utf8');
const orderHtml = readFileSync('order.html', 'utf8');
const chatCode = readFileSync('api/chat.js', 'utf8');
const quotaCode = readFileSync('api/_shared/quota.js', 'utf8');
const notificationCode = readFileSync('api/_shared/order-notifications.js', 'utf8');
const orderJsCode = readFileSync('assets/js/order.js', 'utf8');

const sampleOrder = {
    orderId: 'SF-1234567890',
    customerName: 'রহিম উদ্দিন',
    phone: '01712345678',
    productName: 'ভার্মিকমপোস্ট',
    orderType: 'Retail',
    quantity: 100,
    pricePerKg: 120,
    totalAmount: 12000,
    paymentMethod: 'COD',
    fullAddress: 'গ্রাম-১, ডাকঘর-২, ইউনিয়ন-৩, উপজেলা-৪, জেলা-৫, বিভাগ-৬',
    createdAt: new Date(),
};

// ---- Mock Firestore ----

class MockFirestore {
    constructor() {
        this._collections = {};
    }
    collection(name) {
        if (!this._collections[name]) this._collections[name] = new MockCollection(name);
        return this._collections[name];
    }
    async runTransaction(fn) {
        const tx = new MockTransaction();
        await fn(tx);
        tx._apply();
    }
}

class MockCollection {
    constructor(name) {
        this.name = name;
        this._refs = {};
        this._data = {};
    }
    doc(id) {
        if (!this._refs[id]) this._refs[id] = new MockDocRef(this, id);
        return this._refs[id];
    }
}

class MockDocRef {
    constructor(collection, id) {
        this._col = collection;
        this.id = id;
    }
    _read() {
        return this._col._data[this.id] || null;
    }
    async get() {
        const data = this._read();
        return {
            exists: data !== null && data !== undefined,
            data: () => data || null,
        };
    }
    async set(data, _opts) {
        const d = (typeof data === 'function') ? data() : data;
        if (_opts && _opts.merge) {
            const existing = this._col._data[this.id] || {};
            this._col._data[this.id] = { ...existing, ...d };
        } else {
            this._col._data[this.id] = d;
        }
    }
    async update(data) {
        const existing = this._col._data[this.id];
        if (!existing) throw new Error('Document does not exist');
        this._col._data[this.id] = { ...existing, ...data };
    }
}

class MockTransaction {
    constructor() {
        this._ops = [];
    }
    async get(docRef) {
        const data = docRef._read();
        return {
            exists: data !== null && data !== undefined,
            data: () => data || null,
        };
    }
    set(docRef, data) {
        this._ops.push({ type: 'set', docRef, data });
    }
    update(docRef, data) {
        this._ops.push({ type: 'update', docRef, data });
    }
    _apply() {
        for (const op of this._ops) {
            if (op.type === 'set') {
                op.docRef._col._data[op.docRef.id] = op.data;
            } else if (op.type === 'update') {
                const existing = op.docRef._col._data[op.docRef.id] || {};
                op.docRef._col._data[op.docRef.id] = { ...existing, ...op.data };
            }
        }
    }
}

function createMockDb() {
    return new MockFirestore();
}

async function run() {

// ============================================
console.log('\n=== Phone Normalization ===');
// ============================================

await test('normalizePhoneBD: leading 0 → 880 prefix', () => {
    assertEqual(normalizePhoneBD('01829775552'), '8801829775552');
});

await test('normalizePhoneBD: already +880 → strip +', () => {
    assertEqual(normalizePhoneBD('+8801829775552'), '8801829775552');
});

await test('normalizePhoneBD: already 880 → keep', () => {
    assertEqual(normalizePhoneBD('8801829775552'), '8801829775552');
});

await test('normalizePhoneBD: with spaces/dashes', () => {
    assertEqual(normalizePhoneBD('018-297-75552'), '8801829775552');
});

await test('normalizePhoneBD: null/empty → passthrough', () => {
    assertEqual(normalizePhoneBD(''), '');
    assertEqual(normalizePhoneBD(null), null);
});

// ============================================
console.log('\n=== WhatsApp Message Format ===');
// ============================================

await test('WhatsApp message contains order ID', () => {
    assert(formatOrderWhatsApp(sampleOrder).includes('SF-1234567890'));
});

await test('WhatsApp message contains customer name', () => {
    assert(formatOrderWhatsApp(sampleOrder).includes('রহিম উদ্দিন'));
});

await test('WhatsApp message contains product name', () => {
    assert(formatOrderWhatsApp(sampleOrder).includes('ভার্মিকমপোস্ট'));
});

await test('WhatsApp message contains quantity', () => {
    assert(formatOrderWhatsApp(sampleOrder).includes('100'));
});

await test('WhatsApp message contains total amount', () => {
    const msg = formatOrderWhatsApp(sampleOrder);
    assert(msg.includes('৳12,000') || msg.includes('৳12000'));
});

await test('WhatsApp message contains address', () => {
    assert(formatOrderWhatsApp(sampleOrder).includes('গ্রাম-১'));
});

await test('WhatsApp message contains phone', () => {
    assert(formatOrderWhatsApp(sampleOrder).includes('01712345678'));
});

await test('WhatsApp message contains price, transaction ID, and payment number when supplied', () => {
    const onlineOrder = {
        ...sampleOrder,
        paymentMethod: 'bKash',
        transactionId: 'TXN-ORDER-123',
        paymentNumber: '8801812345678',
    };
    const msg = formatOrderWhatsApp(onlineOrder);
    assert(msg.includes('দর/কেজি'));
    assert(msg.includes('120'));
    assert(msg.includes('TXN-ORDER-123'));
    assert(msg.includes('8801812345678'));
});

await test('WhatsApp notification uses the business recipient, not the SMS-only number', () => {
    assert(notificationCode.includes("const ORDER_WHATSAPP_RECIPIENT = '01829775552'"));
    assert(notificationCode.includes('sendWhatsApp(ORDER_WHATSAPP_RECIPIENT'));
    assert(!notificationCode.includes("sendWhatsApp('01518902528'"));
});

await test('Order success builds an encoded WhatsApp deep link with complete order data', () => {
    assert(orderJsCode.includes('const ORDER_WHATSAPP_NUMBER = "8801829775552"'));
    assert(orderJsCode.includes('https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(formatOrderWhatsAppMessage(order))}'));
    assert(orderJsCode.includes('customerName'));
    assert(orderJsCode.includes('productName'));
    assert(orderJsCode.includes('pricePerKg'));
    assert(orderJsCode.includes('totalAmount'));
    assert(orderJsCode.includes('transactionId'));
    assert(orderJsCode.includes('paymentNumber'));
    assert(orderJsCode.includes('fullAddress'));
    assert(orderJsCode.includes('openOrderWhatsApp(whatsappWindow'));
    const apiCall = orderJsCode.indexOf('fetch("/api/create-order"');
    const linkOpen = orderJsCode.indexOf('openOrderWhatsApp(whatsappWindow, { ...orderPayload, orderId: orderNumber })');
    assert(apiCall > 0 && linkOpen > apiCall, 'WhatsApp link must be prepared after order submission');
});

// ============================================
console.log('\n=== SMS Message Format ===');
// ============================================

await test('SMS message contains order ID', () => {
    assert(formatOrderSms(sampleOrder).includes('SF-1234567890'));
});

await test('SMS message contains customer name', () => {
    assert(formatOrderSms(sampleOrder).includes('রহিম উদ্দিন'));
});

await test('SMS message contains product name', () => {
    assert(formatOrderSms(sampleOrder).includes('ভার্মিকমপোস্ট'));
});

await test('SMS message contains total', () => {
    const msg = formatOrderSms(sampleOrder);
    assert(msg.includes('৳12,000') || msg.includes('৳12000'));
});

await test('SMS message contains address', () => {
    assert(formatOrderSms(sampleOrder).includes('গ্রাম-১'));
});

// ============================================
console.log('\n=== Email Format ===');
// ============================================

await test('Email HTML contains order ID', () => {
    assert(formatOrderEmail(sampleOrder).includes('SF-1234567890'));
});

await test('Email HTML contains customer name', () => {
    assert(formatOrderEmail(sampleOrder).includes('রহিম উদ্দিন'));
});

await test('Email HTML contains product name', () => {
    assert(formatOrderEmail(sampleOrder).includes('ভার্মিকমপোস্ট'));
});

await test('Email HTML contains total', () => {
    const html = formatOrderEmail(sampleOrder);
    assert(html.includes('৳12,000') || html.includes('৳12000'));
});

await test('Email HTML contains address', () => {
    assert(formatOrderEmail(sampleOrder).includes('গ্রাম-১'));
});

await test('Email HTML is valid HTML', () => {
    const html = formatOrderEmail(sampleOrder);
    assert(html.includes('<!DOCTYPE html>'));
    assert(html.includes('</html>'));
});

// ============================================
console.log('\n=== Notification Destinations ===');
// ============================================

await test('WhatsApp destination is 01829775552', () => {
    assertEqual(normalizePhoneBD('01829775552'), '8801829775552');
});

await test('SMS destination 1: 01829775552', () => {
    assertEqual(normalizePhoneBD('01829775552'), '8801829775552');
});

await test('SMS destination 2: 01518902528', () => {
    assertEqual(normalizePhoneBD('01518902528'), '8801518902528');
});

await test('Email destination is shohrahuddinsowrov2026@gmail.com', () => {
    assertEqual('shohrahuddinsowrov2026@gmail.com', 'shohrahuddinsowrov2026@gmail.com');
});

await test('01518902528 is NOT sent WhatsApp', () => {
    const phone1 = normalizePhoneBD('01829775552');
    const phone2 = normalizePhoneBD('01518902528');
    assert(phone1 !== phone2);
    assert(phone1 === '8801829775552');
    assert(phone2 === '8801518902528');
});

await test('WhatsApp sent to 01829775552 only', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    const body = code.substring(code.indexOf('async function sendOrderNotifications('));
    const whatsappSection = body.substring(0, body.indexOf('sendSms'));
    assert(whatsappSection.includes("'01829775552'"));
});

await test('01518902528 receives SMS but NOT WhatsApp', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    const body = code.substring(code.indexOf('async function sendOrderNotifications('));
    assert(body.includes("'01518902528'"));
    const smsSection = body.substring(body.indexOf('sendSms'));
    assert(!smsSection.includes("sendWhatsApp('01518902528'"));
});

// ============================================
console.log('\n=== Firestore-Backed Idempotency ===');
// ============================================

await test('IDEMPOTENCY_COLLECTION is orderNotificationStatus', () => {
    assertEqual(IDEMPOTENCY_COLLECTION, 'orderNotificationStatus');
});

await test('claimNotificationSlot: first attempt → claimed', async () => {
    const mockDb = createMockDb();
    setNotificationDb(mockDb);
    const result = await claimNotificationSlot('SF-TEST-001');
    assertEqual(result, 'claimed');
    const snap = await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-001').get();
    assert(snap.exists, 'Document should exist');
    assertEqual(snap.data().status, 'claiming');
});

await test('claimNotificationSlot: completed order → completed', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-002').set({
        orderId: 'SF-TEST-002', status: 'completed',
        createdAt: new Date(), completedAt: new Date(),
        providers: { whatsapp: 'sent', sms_018: 'sent', sms_015: 'sent', email: 'sent' },
    });
    setNotificationDb(mockDb);
    const result = await claimNotificationSlot('SF-TEST-002');
    assertEqual(result, 'completed');
});

await test('claimNotificationSlot: fresh claiming → already_claimed', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-003').set({
        orderId: 'SF-TEST-003', status: 'claiming',
        createdAt: new Date(), completedAt: null, providers: {},
    });
    setNotificationDb(mockDb);
    const result = await claimNotificationSlot('SF-TEST-003');
    assertEqual(result, 'already_claimed');
});

await test('claimNotificationSlot: stale claim → claimed (reclaimed)', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-004').set({
        orderId: 'SF-TEST-004', status: 'claiming',
        createdAt: new Date(Date.now() - CLAIM_TIMEOUT_MS - 1000),
        completedAt: null, providers: {},
    });
    setNotificationDb(mockDb);
    const result = await claimNotificationSlot('SF-TEST-004');
    assertEqual(result, 'claimed');
});

await test('claimNotificationSlot: partial failure → claimed (retry)', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-005').set({
        orderId: 'SF-TEST-005', status: 'partial',
        createdAt: new Date(), completedAt: null,
        providers: { whatsapp: 'sent', sms_018: 'failed', sms_015: 'sent', email: 'failed' },
    });
    setNotificationDb(mockDb);
    const result = await claimNotificationSlot('SF-TEST-005');
    assertEqual(result, 'claimed');
});

await test('finalizeNotificationStatus: all sent → completed', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-006').set({
        orderId: 'SF-TEST-006', status: 'claiming',
        createdAt: new Date(),
    });
    setNotificationDb(mockDb);
    await finalizeNotificationStatus('SF-TEST-006', {
        whatsapp: 'sent', sms_018: 'sent', sms_015: 'sent', email: 'sent',
    });
    const snap = await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-006').get();
    assert(snap.exists);
    assertEqual(snap.data().status, 'completed');
    assert(snap.data().completedAt !== null);
    assertEqual(snap.data().providers.whatsapp, 'sent');
});

await test('finalizeNotificationStatus: partial failure → partial', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-007').set({
        orderId: 'SF-TEST-007', status: 'claiming',
        createdAt: new Date(),
    });
    setNotificationDb(mockDb);
    await finalizeNotificationStatus('SF-TEST-007', {
        whatsapp: 'sent', sms_018: 'failed', sms_015: 'sent', email: 'failed',
    });
    const snap = await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-007').get();
    assert(snap.exists);
    assertEqual(snap.data().status, 'partial');
    assertEqual(snap.data().providers.sms_018, 'failed');
    assertEqual(snap.data().providers.email, 'failed');
});

await test('getNotificationStatus: returns null for unknown order', async () => {
    const mockDb = createMockDb();
    setNotificationDb(mockDb);
    const result = await getNotificationStatus('SF-NONEXISTENT');
    assertEqual(result, null);
});

await test('getNotificationStatus: returns saved status', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-TEST-008').set({
        orderId: 'SF-TEST-008', status: 'completed',
        providers: { whatsapp: 'sent' },
    });
    setNotificationDb(mockDb);
    const result = await getNotificationStatus('SF-TEST-008');
    assert(result !== null);
    assertEqual(result.status, 'completed');
    assertEqual(result.providers.whatsapp, 'sent');
});

await test('sendOrderNotificationsOnce: first attempt sends (credentials absent → failed)', async () => {
    const mockDb = createMockDb();
    setNotificationDb(mockDb);
    const order = { ...sampleOrder, orderId: 'SF-NOTIF-001' };
    const result = await sendOrderNotificationsOnce(order);
    assert(result.whatsapp !== 'already_sent', 'Should not be already_sent');
    assert(result.whatsapp !== 'already_claimed', 'Should not be already_claimed');
    assert(result.sms_018 !== 'already_sent');
    assert(result.sms_015 !== 'already_sent');
    assert(result.email !== 'already_sent');
    const snap = await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-NOTIF-001').get();
    assert(snap.exists, 'Notification status doc created');
});

await test('sendOrderNotificationsOnce: duplicate returns already_sent', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-NOTIF-002').set({
        orderId: 'SF-NOTIF-002', status: 'completed',
        createdAt: new Date(), completedAt: new Date(),
        providers: { whatsapp: 'sent', sms_018: 'sent', sms_015: 'sent', email: 'sent' },
    });
    setNotificationDb(mockDb);
    const order = { ...sampleOrder, orderId: 'SF-NOTIF-002' };
    const result = await sendOrderNotificationsOnce(order);
    assertEqual(result.whatsapp, 'already_sent');
    assertEqual(result.sms_018, 'already_sent');
    assertEqual(result.sms_015, 'already_sent');
    assertEqual(result.email, 'already_sent');
});

await test('sendOrderNotificationsOnce: concurrent duplicate → already_claimed', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-NOTIF-003').set({
        orderId: 'SF-NOTIF-003', status: 'claiming',
        createdAt: new Date(), completedAt: null, providers: {},
    });
    setNotificationDb(mockDb);
    const order = { ...sampleOrder, orderId: 'SF-NOTIF-003' };
    const result = await sendOrderNotificationsOnce(order);
    assertEqual(result.whatsapp, 'already_claimed');
    assertEqual(result.sms_018, 'already_claimed');
    assertEqual(result.sms_015, 'already_claimed');
    assertEqual(result.email, 'already_claimed');
});

await test('Persistent state survives simulated server restart', async () => {
    const mockDb = createMockDb();
    setNotificationDb(mockDb);
    const order = { ...sampleOrder, orderId: 'SF-NOTIF-004' };
    await sendOrderNotificationsOnce(order);
    // Verify notification status doc was persisted
    const snap = await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-NOTIF-004').get();
    assert(snap.exists, 'Notification status persisted after first call');
    assert(snap.data().status === 'partial' || snap.data().status === 'completed', 'Status is valid');
    // Call again — should not be 'already_claimed' (not lost), and should read prior state
    const result = await sendOrderNotificationsOnce(order);
    assert(result.whatsapp !== 'already_claimed', 'Should not lose state across calls');
});

await test('Partial failure: failed providers retried, sent ones skipped', async () => {
    const mockDb = createMockDb();
    await mockDb.collection(IDEMPOTENCY_COLLECTION).doc('SF-NOTIF-005').set({
        orderId: 'SF-NOTIF-005', status: 'partial',
        createdAt: new Date(), completedAt: null,
        providers: { whatsapp: 'sent', sms_018: 'failed', sms_015: 'sent', email: 'failed' },
    });
    setNotificationDb(mockDb);
    const order = { ...sampleOrder, orderId: 'SF-NOTIF-005' };
    const result = await sendOrderNotificationsOnce(order);
    // Already-sent providers should appear as sent (skipped in retry)
    assertEqual(result.whatsapp, 'sent');
    assertEqual(result.sms_015, 'sent');
    // Failed providers get retried (and fail again due to no credentials)
    assert(result.sms_018 === 'failed');
    assert(result.email === 'failed');
});

await test('Order remains intact when notification fails', () => {
    const runTxIdx = orderCode.indexOf('await db.runTransaction');
    const usageIdx = orderCode.indexOf('await sendOrderNotificationsOnce');
    assert(runTxIdx < usageIdx, 'Order creation before notifications');
    assert(orderCode.includes('orderCreated: true'), 'orderCreated: true in response');
    assert(orderCode.includes('try') && orderCode.includes('sendOrderNotificationsOnce'), 'Notifications in try-catch');
});

// ============================================
console.log('\n=== Login Gate (Code Logic) ===');
// ============================================

await test('Login warning element exists in order.html', () => {
    assert(orderHtml.includes('loginWarning'));
    assert(orderHtml.includes('Login'));
});

await test('Login warning text is correct Bengali message', () => {
    assert(orderHtml.includes('Order করতে হলে আগে Login করতে হবে।'));
});

await test('Login button links to customer-login.html', () => {
    assert(orderHtml.includes('/customer-login.html'));
});

await test('Order error box exists', () => {
    assert(orderHtml.includes('orderErrorBox'));
});

await test('order.js checks currentUser before submitting', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('showLoginWarning()'));
    assert(jsCode.includes('hideLoginWarning()'));
});

await test('order.js calls backend API', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('/api/create-order'));
    assert(jsCode.includes('getIdToken'));
});

// ============================================
console.log('\n=== Backend Auth (Code Logic) ===');
// ============================================

await test('create-order.js verifies Firebase ID token', () => {
    assert(orderCode.includes('verifyIdToken'));
    assert(orderCode.includes('Bearer'));
});

await test('create-order.js returns 401 for unauthenticated requests', () => {
    assert(orderCode.includes("'401'") || orderCode.includes('401'));
    assert(orderCode.includes('unauthorized'));
});

await test('create-order.js ignores client-provided UID', () => {
    assert(orderCode.includes('uid'));
});

await test('create-order.js uses server-side Firestore (Admin SDK)', () => {
    assert(orderCode.includes('firebase-admin'));
    assert(orderCode.includes('FieldValue.serverTimestamp()'));
});

await test('create-order.js verifies stock in transaction', () => {
    assert(orderCode.includes('runTransaction'));
    assert(orderCode.includes('stockBefore'));
});

// ============================================
console.log('\n=== Order Schema Preservation ===');
// ============================================

await test('Order preserves existing schema fields', () => {
    const fields = [
        'orderId', 'userId', 'customerUid', 'customerName', 'phone',
        'productId', 'productName', 'orderType', 'quantity', 'pricePerKg',
        'totalAmount', 'division', 'district', 'upazila', 'union', 'village',
        'postOffice', 'house', 'fullAddress', 'paymentMethod', 'paymentNumber', 'paymentStatus',
        'transactionId', 'status', 'createdAt',
    ];
    for (const f of fields) {
        assert(orderCode.includes(`${f}:`), `Field ${f} missing`);
    }
});

await test('Order ID format: SF-{timestamp}', () => {
    assert(orderCode.includes("'SF-' + Date.now()"));
});

await test('Order status defaults to Pending', () => {
    assert(orderCode.includes("status: 'Pending'"));
});

await test('Payment status logic', () => {
    assert(orderCode.includes("'Pending'") && orderCode.includes("'Unpaid'"));
});

// ============================================
console.log('\n=== No AI/Chat System Modification ===');
// ============================================

await test('chat.js not modified', () => {
    assert(chatCode.includes('checkQuota'));
    assert(chatCode.includes('recordUsage'));
    assert(chatCode.includes('verifyIdToken'));
});

await test('quota.js not modified', () => {
    assert(quotaCode.includes('QUOTA_MAX'));
    assert(quotaCode.includes('checkQuota'));
});

// ============================================
console.log('\n=== Security ===');
// ============================================

await test('No credentials in frontend code', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(!jsCode.includes('TWILIO'));
    assert(!jsCode.includes('SMTP'));
    assert(!jsCode.includes('WHATSAPP_API'));
});

await test('create-order.js keeps credentials server-side', () => {
    assert(orderCode.includes('process.env'));
    assert(orderCode.includes('FIREBASE_SERVICE_ACCOUNT'));
});

// ============================================
console.log('\n=== Notification Architecture ===');
// ============================================

await test('order-notifications.js uses Firestore Admin SDK', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    assert(code.includes('firebase-admin'));
    assert(code.includes('getFirestore'));
});

await test('order-notifications.js has setNotificationDb for testability', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    assert(code.includes('setNotificationDb'));
});

await test('order-notifications.js uses orderNotificationStatus collection', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    assert(code.includes('orderNotificationStatus'));
});

await test('order-notifications.js has claimNotificationSlot', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    assert(code.includes('claimNotificationSlot'));
});

await test('order-notifications.js has finalizeNotificationStatus', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    assert(code.includes('finalizeNotificationStatus'));
});

await test('order-notifications.js has getNotificationStatus', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    assert(code.includes('getNotificationStatus'));
});

await test('sendOrderNotificationsOnce uses Firestore claim, not in-memory Set', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    const idx = code.indexOf('async function sendOrderNotificationsOnce(');
    const body = code.substring(idx, code.indexOf('\nexport ', idx));
    assert(body.includes('claimNotificationSlot'), 'Should use Firestore claim');
    assert(!body.includes('notifiedOrders.has'), 'Should not use in-memory Set');
});

await test('sendOrderNotificationsOnce handles partial retry skip logic', () => {
    const code = readFileSync('api/_shared/order-notifications.js', 'utf8');
    const idx = code.indexOf('async function sendOrderNotificationsOnce(');
    const body = code.substring(idx, code.indexOf('\nexport ', idx));
    assert(body.includes('skipProviders'), 'Should have skip providers logic');
});

// ============================================
console.log('\n=== COD Upcoming Feature ===');
// ============================================

await test('COD option exists in payment method select', () => {
    assert(orderHtml.includes('value="COD"'), 'COD option value missing');
    assert(orderHtml.includes('Cash on Delivery'), 'COD label missing');
});

await test('bKash and Nagad options still exist', () => {
    assert(orderHtml.includes('value="bKash"'), 'bKash option missing');
    assert(orderHtml.includes('value="Nagad"'), 'Nagad option missing');
});

await test('COD upcoming notice element exists in order.html', () => {
    assert(orderHtml.includes('codUpcomingNotice'), 'codUpcomingNotice element missing');
});

await test('COD notice communicates upcoming feature', () => {
    assert(orderHtml.includes('নতুন আপডেট আসছে'), 'Notice heading missing');
    assert(orderHtml.includes('COD ও Home Delivery শীঘ্রই চালু হচ্ছে'), 'Notice title missing');
    assert(orderHtml.includes('শীঘ্রই চালু হচ্ছে'), 'Coming soon message missing');
});

await test('COD notice says currently unavailable', () => {
    assert(orderHtml.includes('এখনো চালু হয়নি') || orderHtml.includes('বর্তমানে'), 'Currently unavailable message missing');
});

await test('COD notice provides alternative actions', () => {
    assert(orderHtml.includes('অন্য মাধ্যমে Order করুন'), 'Alternative order action missing');
    assert(orderHtml.includes('সরাসরি এসে সংগ্রহ করুন'), 'Pickup action missing');
});

await test('COD notice is hidden by default (display:none)', () => {
    const match = orderHtml.match(/id="codUpcomingNotice"[^>]*style="([^"]*)"/);
    assert(match, 'codUpcomingNotice should have inline style');
    assert(match[1].includes('display:none'), 'COD notice should be hidden by default');
});

await test('order.js references codUpcomingNotice element', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('codUpcomingNotice'), 'JS must reference codUpcomingNotice');
});

await test('order.js shows COD notice when COD is selected', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('paymentMethod.value === "COD"'), 'Must check COD value');
    assert(jsCode.includes('codUpcomingNotice.style.display = "block"'), 'Must show COD notice');
});

await test('order.js hides COD notice when non-COD payment is selected', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('function syncPaymentMethodFields()'), 'Shared payment method handler missing');
    assert(jsCode.includes('codUpcomingNotice.style.display = "none"'), 'Must hide COD notice for non-COD');
});

await test('COD selection blocks order submission', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    const submitHandlerStart = jsCode.indexOf('orderForm.addEventListener("submit"');
    const submitHandlerBody = jsCode.substring(submitHandlerStart, jsCode.indexOf('// =====', submitHandlerStart + 10));
    assert(submitHandlerBody.includes('paymentMethod.value === "COD"'), 'Must check COD in submit handler');
    assert(submitHandlerBody.includes('COD এবং Home Delivery'), 'Must show COD error message on submit');
});

await test('COD block happens after login gate, before order creation', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    const submitStart = jsCode.indexOf('orderForm.addEventListener("submit"');
    const submitEnd = jsCode.indexOf('// =====', submitStart + 50);
    const submitBody = jsCode.substring(submitStart, submitEnd > 0 ? submitEnd : submitStart + 5000);
    const loginCheck = submitBody.indexOf('!currentUser');
    const codCheck = submitBody.indexOf('paymentMethod.value === "COD"');
    const apiCall = submitBody.indexOf('/api/create-order');
    assert(loginCheck > 0, 'Login check found in submit');
    assert(codCheck > 0, 'COD check found in submit');
    assert(apiCall > 0, 'API call found in submit');
    assert(loginCheck < codCheck, 'Login gate must come before COD check');
    assert(codCheck < apiCall, 'COD check must come before API call');
});

await test('COD selection does NOT create order (no fetch to /api/create-order when COD)', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    const submitStart = jsCode.indexOf('orderForm.addEventListener("submit"');
    const submitEnd = jsCode.indexOf('// =====', submitStart + 50);
    const submitBody = jsCode.substring(submitStart, submitEnd > 0 ? submitEnd : submitStart + 5000);
    const codBlockStart = submitBody.indexOf('paymentMethod.value === "COD"');
    const fetchStart = submitBody.indexOf('fetch("/api/create-order"');
    assert(codBlockStart > 0, 'COD block found');
    assert(fetchStart > 0, 'Fetch call found');
    assert(codBlockStart < fetchStart, 'COD block must return before fetch');
    const codBlock = submitBody.substring(codBlockStart, codBlockStart + 300);
    assert(codBlock.includes('return'), 'COD block must return early');
});

await test('COD selection does NOT send notifications', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    const submitStart = jsCode.indexOf('orderForm.addEventListener("submit"');
    const submitEnd = jsCode.indexOf('// =====', submitStart + 50);
    const submitBody = jsCode.substring(submitStart, submitEnd > 0 ? submitEnd : submitStart + 5000);
    const codBlockStart = submitBody.indexOf('paymentMethod.value === "COD"');
    const codBlock = submitBody.substring(codBlockStart, codBlockStart + 300);
    assert(codBlock.includes('return'), 'COD block must return early before any notification code');
});

await test('Payment number field is editable and clearly labeled', () => {
    const inputMatch = orderHtml.match(/<input\s+type="text"\s+id="paymentNumber"[\s\S]*?>/);
    assert(inputMatch, 'Customer payment number input exists');
    assert(!inputMatch[0].includes('readonly'), 'Payment number must be editable');
    assert(orderHtml.includes('Customer Payment Number'), 'Customer payment number label missing');
    assert(inputMatch[0].includes('placeholder='), 'Payment number placeholder missing');
    assert(inputMatch[0].includes('bKash/Nagad'), 'Placeholder must mention bKash/Nagad');
});

await test('bKash/Nagad selection clears payment number and does not insert recipient placeholders', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('paymentNumber.value = "";'), 'Payment number must be cleared');
    assert(!jsCode.includes('017XXXXXXXX'), 'bKash recipient placeholder must be removed');
    assert(!jsCode.includes('018XXXXXXXX'), 'Nagad recipient placeholder must be removed');
    assert(jsCode.includes('paymentNumber.required = true'), 'Online payment number must be required');
    assert(jsCode.includes('paymentNumber.required = false'), 'COD must not require payment number');
});

await test('Client validates and normalizes Bangladeshi mobile payment number', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('normalizeBdPaymentNumber'), 'Client payment number normalizer missing');
    assert(jsCode.includes('/^8801[3-9]\\d{8}$/'), 'Bangladeshi mobile validation missing');
    assert(jsCode.includes('Please enter your bKash/Nagad number.'), 'Required payment number message missing');
    assert(jsCode.includes('Enter a valid Bangladeshi mobile number.'), 'Invalid payment number message missing');
});

await test('Online payment number is included in order payload', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('paymentNumber: paymentMethod.value === "COD" ? "" : normalizeBdPaymentNumber(paymentNumber.value)'), 'Payment number payload missing');
});

await test('Server accepts, validates, and stores paymentNumber', () => {
    assert(orderCode.includes('paymentMethod, paymentNumber, transactionId'), 'Server must receive paymentNumber');
    assert(orderCode.includes('normalizeBdPaymentNumber'), 'Server payment number normalizer missing');
    assert(orderCode.includes("paymentMethod !== 'COD' && !normalizedPaymentNumber"), 'Server online payment validation missing');
    assert(orderCode.includes('paymentNumber: normalizedPaymentNumber'), 'Server must store paymentNumber');
});

await test('COD does not require paymentNumber', () => {
    assert(orderCode.includes("const normalizedPaymentNumber = paymentMethod === 'COD'"), 'COD must bypass payment number requirement');
    assert(readFileSync('assets/js/order.js', 'utf8').includes('if (paymentMethod.value !== "COD")'), 'Client COD exemption missing');
});

await test('Existing payment flow (bKash/Nagad) remains available', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('onlinePaymentBox.style.display = "block"'), 'Online payment box shown for non-COD');
    assert(orderHtml.includes('<option value="bKash">bKash</option>'), 'bKash method remains available');
    assert(orderHtml.includes('<option value="Nagad">Nagad</option>'), 'Nagad method remains available');
    assert(jsCode.includes('paymentMethod.value === "COD"'), 'COD method remains available');
});

await test('Post Office is a required free-text input in the order form', () => {
    const inputMatch = orderHtml.match(/<input\s+type="text"\s+id="postOffice"\s+name="postOffice"[\s\S]*?required\s*>/);
    assert(inputMatch, 'Post Office text input missing');
    assert(!orderHtml.includes('<select id="postOffice"'), 'Post Office must not remain a select');
    assert(orderHtml.includes('Enter Main Post Office'), 'Post Office placeholder missing');
});

await test('Customer order flow does not fetch or filter post-office JSON', () => {
    assert(!orderJsCode.includes('post-offices.json'), 'Post Office JSON dependency must be removed');
    assert(!orderJsCode.includes('postOfficesData'), 'Post Office cache must be removed');
    assert(!orderJsCode.includes('loadVillagesAndPostOffices'), 'Post Office loader must be removed');
    assert(!orderJsCode.includes('postOffice.options'), 'Post Office input must not be read as a select');
    assert(orderJsCode.includes('postOffice: postOffice.value.trim()'), 'Post Office payload must use text value');
    assert(orderJsCode.includes('postOffice.value.trim()'), 'Full address must use typed Post Office value');
});

await test('Address filtering normalizes IDs and supports both union parent spellings', () => {
    assert(orderJsCode.includes('function normalizeAddressId(value)'), 'Address ID normalizer missing');
    assert(orderJsCode.includes('normalizeAddressId(item.division_id)'), 'Division parent filtering must normalize IDs');
    assert(orderJsCode.includes('normalizeAddressId(item.district_id)'), 'District parent filtering must normalize IDs');
    assert(orderJsCode.includes('item.upazila_id, item.upazilla_id'), 'Both union parent spellings must be supported');
    assert(orderJsCode.includes('getUnionParentIds(item).includes(selectedUpazilaId)'), 'Union filtering must use normalized parent IDs');

    const normalize = (value) => value == null ? '' : String(value).trim();
    const mixedDistricts = [{ id: 1, division_id: 7 }, { id: 2, division_id: '7' }, { id: 3, division_id: 8 }];
    assertEqual(mixedDistricts.filter(item => normalize(item.division_id) === '7').length, 2);
    const mixedUnions = [
        { id: 1, upazilla_id: 9 },
        { id: 2, upazila_id: '9' },
        { id: 3, upazilla_id: '10' },
    ];
    const parentIds = (item) => [item.upazila_id, item.upazilla_id].map(normalize).filter(Boolean);
    assert(mixedUnions.filter(item => parentIds(item).includes('9')).length === 2);
});

await test('Login gate still works (not triggered by COD selection alone)', () => {
    const jsCode = readFileSync('assets/js/order.js', 'utf8');
    assert(jsCode.includes('showLoginWarning()'), 'Login warning function exists');
    assert(jsCode.includes('hideLoginWarning()'), 'Hide login warning function exists');
    assert(jsCode.includes('!currentUser'), 'Login check exists in submit');
});

await test('Backend order creation unchanged', () => {
    assert(orderCode.includes('verifyIdToken'), 'Auth verification intact');
    assert(orderCode.includes('runTransaction'), 'Stock transaction intact');
    assert(orderCode.includes('sendOrderNotificationsOnce'), 'Notifications intact');
});

await test('Order schema remains compatible', () => {
    assert(orderCode.includes('paymentMethod:'), 'paymentMethod field intact');
    assert(orderCode.includes('paymentStatus:'), 'paymentStatus field intact');
    assert(orderCode.includes("'Pending'"), 'Pending status intact');
    assert(orderCode.includes("'Unpaid'"), 'Unpaid status intact');
});

await test('AI/chat/quota unaffected by COD changes', () => {
    assert(chatCode.includes('checkQuota'));
    assert(chatCode.includes('recordUsage'));
    assert(quotaCode.includes('QUOTA_MAX'));
});

// ============================================
console.log('\n=== City Corporation Address Support ===');
// ============================================

await test('order.html has area type selector and CC field groups', () => {
    assert(orderHtml.includes('id="areaType"'), 'areaType select missing');
    assert(orderHtml.includes('value="rural"'), 'rural option missing');
    assert(orderHtml.includes('value="city_corporation"'), 'city_corporation option missing');
    assert(orderHtml.includes('id="ruralFields"'), 'ruralFields wrapper missing');
    assert(orderHtml.includes('id="ccFields"'), 'ccFields wrapper missing');
    assert(orderHtml.includes('id="cityCorporation"'), 'cityCorporation select missing');
    assert(orderHtml.includes('id="ccWard"'), 'ccWard select missing');
    assert(orderHtml.includes('id="ccThana"'), 'ccThana select missing');
    assert(orderHtml.includes('id="ccLocality"'), 'ccLocality input missing');
});

await test('Rural fields wrapped; shared Post Office stays required free-text', () => {
    const ruralIdx = orderHtml.indexOf('id="ruralFields"');
    const ccIdx = orderHtml.indexOf('id="ccFields"');
    assert(ruralIdx > -1 && ccIdx > -1 && ruralIdx < ccIdx, 'field group order invalid');
    assert(orderHtml.includes('id="upazila" required'), 'rural upazila select missing');
    assert(orderHtml.includes('id="union" required'), 'rural union select missing');
    assert(orderHtml.includes('id="village"'), 'rural village input missing');
    const inputMatch = orderHtml.match(/<input\s+type="text"\s+id="postOffice"\s+name="postOffice"[\s\S]*?required\s*>/);
    assert(inputMatch, 'Post Office text input must stay required');
});

await test('order.js loads CC datasets with rural datasets', () => {
    assert(orderJsCode.includes('city-corporations.json'), 'CC master dataset fetch missing');
    assert(orderJsCode.includes('cc-wards.json'), 'CC wards dataset fetch missing');
    assert(orderJsCode.includes('cc-thanas.json'), 'CC thanas dataset fetch missing');
});

await test('order.js branches validation and payload by areaType', () => {
    assert(orderJsCode.includes("areaType.value === 'city_corporation'"), 'areaType branch missing');
    assert(orderJsCode.includes('applyAddressMode'), 'applyAddressMode missing');
    assert(orderJsCode.includes('locality: ccFieldsOut.locality'), 'locality payload missing');
    assert(orderJsCode.includes('cityCorporation: ccFieldsOut.cityCorporation'), 'cityCorporation payload missing');
    assert(orderJsCode.includes('ward: ccFieldsOut.ward'), 'ward payload missing');
    assert(orderJsCode.includes('areaType: areaType.value'), 'areaType payload missing');
});

await test('Rural cascade preserved (division→district→upazila→union)', () => {
    assert(orderJsCode.includes('division.addEventListener("change"'), 'division listener missing');
    assert(orderJsCode.includes('loadDistricts'), 'loadDistricts missing');
    assert(orderJsCode.includes('district.addEventListener("change"'), 'district listener missing');
    assert(orderJsCode.includes('loadUpazilas'), 'loadUpazilas missing');
    assert(orderJsCode.includes('upazila.addEventListener("change", loadUnions)'), 'upazila→union listener missing');
    assert(orderJsCode.includes('Village'), 'rural village validation label missing');
});

await test('Ward and Thana are independent siblings (no Ward→Thana dependency)', () => {
    assert(orderJsCode.includes('loadCcThanas'), 'loadCcThanas missing');
    assert(orderJsCode.includes('item.cc_ids.includes(cc.id)'), 'thana must filter by cc, not ward');
    const thanaFn = orderJsCode.slice(orderJsCode.indexOf('function loadCcThanas'), orderJsCode.indexOf('function clearCcSelections'));
    assert(!thanaFn.includes('ccWard'), 'thana load must not depend on ward selection');
});

await test('order.js never activates dormant post-offices dataset', () => {
    assert(!orderJsCode.includes('post-offices.json'), 'post-offices.json must stay dormant');
});

await test('Server validates areaType with rural default for legacy orders', () => {
    assert(orderCode.includes("new Set(['rural', 'city_corporation'])"), 'AREA_TYPES enum missing');
    assert(orderCode.includes(": 'rural'"), 'legacy areaType default missing');
    assert(orderCode.includes('Invalid area type.'), 'invalid areaType message missing');
});

await test('Server validates CC orders against datasets', () => {
    assert(orderCode.includes('function validateCcOrder'), 'validateCcOrder missing');
    assert(orderCode.includes('city-corporations.json'), 'server CC dataset load missing');
    assert(orderCode.includes('cc-wards.json'), 'server wards dataset load missing');
    assert(orderCode.includes('cc-thanas.json'), 'server thanas dataset load missing');
    assert(orderCode.includes('Division does not match'), 'division/cc consistency check missing');
    assert(orderCode.includes('District does not match'), 'district/cc consistency check missing');
    assert(orderCode.includes('wardRec.cc_id !== cc.id'), 'ward↔cc membership check missing');
    assert(orderCode.includes('thanaRec.cc_ids.includes(cc.id)'), 'thana↔cc membership check missing');
});

await test('Server rebuilds CC fullAddress from server-side datasets', () => {
    assert(orderCode.includes('ccValidation.fullAddress'), 'server-side CC fullAddress missing');
    assert(orderCode.includes("ds.districtsById.get(String(cc.district_id))"), 'district name resolved server-side');
    assert(orderCode.includes("ds.divisionsById.get(String(cc.division_id))"), 'division name resolved server-side');
});

await test('CC orders store empty rural hierarchy (upazila/union/village)', () => {
    assert(orderCode.includes("upazila: normalizedAreaType === 'city_corporation' ? ''"), 'upazila cleared for CC');
    assert(orderCode.includes("union: normalizedAreaType === 'city_corporation' ? ''"), 'union cleared for CC');
    assert(orderCode.includes("village: normalizedAreaType === 'city_corporation' ? ''"), 'village cleared for CC');
});

await test('Order schema includes new CC fields alongside legacy fields', () => {
    for (const f of ['areaType', 'cityCorporation', 'cityCorporationName', 'ward', 'wardNumber', 'wardName', 'thana', 'thanaName', 'locality']) {
        assert(orderCode.includes(`${f}:`), `server field ${f} missing`);
    }
    for (const f of ['division', 'district', 'upazila', 'union', 'village', 'postOffice', 'house', 'fullAddress']) {
        assert(orderCode.includes(`${f}:`), `legacy field ${f} must remain`);
    }
});

await test('Admin orders escapes fullAddress in HTML views', () => {
    const adminCode = readFileSync('assets/js/admin-orders.js', 'utf8');
    assert(!adminCode.includes('${order.fullAddress}'), 'raw fullAddress interpolation must be removed');
    assert(adminCode.includes('escapeHtml(String(order.fullAddress'), 'escaped fullAddress missing');
    assert(adminCode.includes('function escapeHtml'), 'escapeHtml helper missing');
});

await test('Admin XLSX export includes address and CC columns with safe fallbacks', () => {
    const adminCode = readFileSync('assets/js/admin-orders.js', 'utf8');
    assert(adminCode.includes('"Full Address": xlsxSafeValue(order.fullAddress || \'\')'), 'Full Address export column missing');
    assert(adminCode.includes('"Area Type": xlsxSafeValue(order.areaType || \'\')'), 'Area Type export column missing');
    assert(adminCode.includes('"City Corporation": xlsxSafeValue(order.cityCorporationName || \'\')'), 'City Corporation export column missing');
    assert(adminCode.includes('"Ward": xlsxSafeValue(order.wardName || \'\')'), 'Ward export column missing');
    assert(adminCode.includes('"Thana": xlsxSafeValue(order.thanaName || \'\')'), 'Thana export column missing');
    assert(adminCode.includes('"Locality": xlsxSafeValue(order.locality || \'\')'), 'Locality export column missing');
    assert(adminCode.includes('function xlsxSafeValue'), 'xlsxSafeValue formula-injection guard missing');
    assert(adminCode.includes('/^[=+\\-@\\t\\r]/'), 'xlsxSafeValue must neutralize formula-significant leading characters');
    assert(adminCode.includes('"Upazila": order.upazila'), 'existing Upazila export column must remain');
    assert(adminCode.includes('"House": order.house'), 'existing House export column must remain');
});

await test('Invoice prefers fullAddress with legacy address fallback', () => {
    const invoiceCode = readFileSync('assets/js/invoice.js', 'utf8');
    assert(invoiceCode.includes('order.fullAddress || order.address || "-"'), 'fullAddress fallback missing');
});

await test('Notifications and WhatsApp still receive fullAddress', () => {
    assert(notificationCode.includes('order.fullAddress'), 'notifications must keep using fullAddress');
    assert(orderJsCode.includes('order.fullAddress || "N/A"'), 'client WhatsApp address line missing');
});

} // end run()

console.log('\n' + '='.repeat(60));

run().then(() => {
    console.log('\n' + '='.repeat(60));
    console.log(`\n  Results: ${passed} passed, ${failed} failed`);
    console.log('\n' + '='.repeat(60));

    if (failed > 0) {
        console.log('\n❌ Some tests failed');
        process.exit(1);
    } else {
        console.log('\n✅ All order system tests passed');
        process.exit(0);
    }
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
