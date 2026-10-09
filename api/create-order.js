// ============================================
// SF — Create Order API (Server-Side)
// Verifies Firebase Auth, creates order in
// Firestore, sends notifications
// ============================================

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { sendOrderNotificationsOnce } from './_shared/order-notifications.js';
import { buildCorsHeaders, handleOptions } from './_shared/cors.js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// ---- Bangladesh Address Datasets (City Corporation support) ----

const AREA_TYPES = new Set(['rural', 'city_corporation']);

let _ccDatasets = null;

function loadCcDatasets() {
    if (_ccDatasets) return _ccDatasets;
    try {
        const base = join(process.cwd(), 'assets', 'data', 'bd-address');
        const divisions = JSON.parse(readFileSync(join(base, 'divisions.json'), 'utf8'));
        const districts = JSON.parse(readFileSync(join(base, 'districts.json'), 'utf8'));
        const ccs = JSON.parse(readFileSync(join(base, 'city-corporations.json'), 'utf8'));
        const wards = JSON.parse(readFileSync(join(base, 'cc-wards.json'), 'utf8'));
        const thanas = JSON.parse(readFileSync(join(base, 'cc-thanas.json'), 'utf8'));
        const wardsByCc = new Map();
        for (const w of wards) {
            if (!wardsByCc.has(w.cc_id)) wardsByCc.set(w.cc_id, []);
            wardsByCc.get(w.cc_id).push(w);
        }
        const thanasById = new Map(thanas.map(t => [t.id, t]));
        _ccDatasets = {
            ccsById: new Map(ccs.map(c => [c.id, c])),
            wardsById: new Map(wards.map(w => [w.id, w])),
            wardsByCc,
            thanasById,
            districtsById: new Map(districts.map(d => [String(d.id), d.name])),
            divisionsById: new Map(divisions.map(d => [String(d.id), d.name])),
        };
        return _ccDatasets;
    } catch (err) {
        console.error('[OrderAPI] Failed to load CC address datasets:', err.message);
        return null;
    }
}

function validateCcOrder(body) {
    const { division, district, cityCorporation, ward, wardNumber, thana, locality } = body;
    const ds = loadCcDatasets();
    if (!ds) {
        return { error: 'City Corporation address data is unavailable. Please try again later.' };
    }
    if (!cityCorporation || !String(cityCorporation).trim()) {
        return { error: 'Please select a valid City Corporation.' };
    }
    const cc = ds.ccsById.get(String(cityCorporation).trim());
    if (!cc) {
        return { error: 'Please select a valid City Corporation.' };
    }
    if (!division || String(division).trim() !== String(cc.division_id)) {
        return { error: 'Division does not match the selected City Corporation.' };
    }
    if (!district || String(district).trim() !== String(cc.district_id)) {
        return { error: 'District does not match the selected City Corporation.' };
    }
    if (!ward || !String(ward).trim()) {
        return { error: 'Please select a valid Ward.' };
    }
    const wardId = String(ward).trim();
    const wardRec = ds.wardsById.get(wardId);
    if (!wardRec || wardRec.cc_id !== cc.id) {
        return { error: 'Please select a valid Ward.' };
    }
    if (wardNumber !== undefined && wardNumber !== null && String(wardNumber).trim() !== String(wardRec.ward_number)) {
        return { error: 'Ward number does not match the selected Ward.' };
    }
    let thanaRec = null;
    if (thana && String(thana).trim()) {
        thanaRec = ds.thanasById.get(String(thana).trim());
        if (!thanaRec || !Array.isArray(thanaRec.cc_ids) || !thanaRec.cc_ids.includes(cc.id)) {
            return { error: 'Please select a valid Thana for this City Corporation.' };
        }
    }
    if (!locality || !String(locality).trim()) {
        return { error: 'Please enter a valid Locality / Mahalla.' };
    }
    const districtName = ds.districtsById.get(String(cc.district_id)) || '';
    const divisionName = ds.divisionsById.get(String(cc.division_id)) || '';
    const parts = [
        String(body.house || '').trim(),
        String(locality).trim(),
        wardRec.name,
        thanaRec ? thanaRec.name : '',
        cc.name,
        districtName,
        divisionName,
    ].filter(Boolean);
    return {
        cc,
        wardRec,
        thanaRec,
        locality: String(locality).trim(),
        fullAddress: parts.join(', '),
    };
}

// ---- Firebase Admin Init (reuse pattern from quota.js) ----

let _adminApp = null;
let _db = null;
let _auth = null;

function getAdminApp() {
    if (_adminApp) return _adminApp;
    const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!saJson) return null;
    try {
        const serviceAccount = typeof saJson === 'string' ? JSON.parse(saJson) : saJson;
        const existing = getApps().find(a => a.name === '(default)');
        if (existing) {
            _adminApp = existing;
        } else {
            _adminApp = initializeApp({ credential: cert(serviceAccount) });
        }
        _db = getFirestore(_adminApp);
        _auth = getAuth(_adminApp);
        return _adminApp;
    } catch (err) {
        console.error('[OrderAPI] Failed to init Firebase Admin:', err.message);
        return null;
    }
}

function getDb() {
    if (!_db) getAdminApp();
    return _db;
}

function getAuthAdmin() {
    if (!_auth) getAdminApp();
    return _auth;
}

async function verifyIdToken(idToken) {
    const authAdmin = getAuthAdmin();
    if (!authAdmin || !idToken) return null;
    try {
        const decoded = await authAdmin.verifyIdToken(idToken);
        return { uid: decoded.uid, email: decoded.email || null };
    } catch (err) {
        console.warn('[OrderAPI] Token verify failed:', err.message);
        return null;
    }
}

function normalizeBdPaymentNumber(value) {
    let compact = String(value || '').trim().replace(/[\s\-()]/g, '');
    if (compact.startsWith('+880')) {
        compact = compact.slice(1);
    } else if (compact.startsWith('0')) {
        compact = '880' + compact.slice(1);
    } else if (!compact.startsWith('880')) {
        compact = '880' + compact;
    }
    return /^8801[3-9]\d{8}$/.test(compact) ? compact : null;
}

// ---- CORS ----

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        handleOptions(req, res, 'POST, OPTIONS');
        return;
    }
    if (req.method !== 'POST') {
        res.writeHead(405, buildCorsHeaders(req));
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
    const corsHeaders = buildCorsHeaders(req);

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

        // ---- Verify Auth ----
        let uid = null;
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const idToken = authHeader.slice(7);
            const user = await verifyIdToken(idToken);
            if (user) uid = user.uid;
        }

        if (!uid) {
            res.writeHead(401, corsHeaders);
            res.end(JSON.stringify({
                error: 'unauthorized',
                message: 'আপনি লগইন করেননি। অর্ডার করতে আগে লগইন করুন।',
            }));
            return;
        }

        // ---- Validate required fields ----
        const {
            customerName, phone, productId, productName,
            orderType, quantity, pricePerKg, totalAmount,
            division, district, upazila, union, village, postOffice, house,
            fullAddress, paymentMethod, paymentNumber, transactionId,
            areaType, cityCorporation, ward, wardNumber, thana, locality,
        } = body;

        if (!customerName || !phone || !productId || !productName || !orderType || !quantity || !pricePerKg || !totalAmount) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({ error: 'bad_request', message: 'Missing required order fields.' }));
            return;
        }

        // ---- Validate area type (missing => rural, legacy compatible) ----
        const normalizedAreaType = (areaType && String(areaType).trim()) ? String(areaType).trim() : 'rural';
        if (!AREA_TYPES.has(normalizedAreaType)) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({ error: 'bad_request', message: 'Invalid area type.' }));
            return;
        }

        // ---- Validate required address fields ----
        let ccValidation = null;
        if (normalizedAreaType === 'city_corporation') {
            ccValidation = validateCcOrder({ ...body, house: String(house || '') });
            if (ccValidation.error) {
                res.writeHead(400, corsHeaders);
                res.end(JSON.stringify({ error: 'bad_request', message: ccValidation.error }));
                return;
            }
        } else {
            const requiredAddressFields = [
                { value: division, name: 'Division' },
                { value: district, name: 'District' },
                { value: upazila, name: 'Upazila' },
                { value: village, name: 'Village' },
            ];
            for (const af of requiredAddressFields) {
                if (!af.value || !String(af.value).trim()) {
                    res.writeHead(400, corsHeaders);
                    res.end(JSON.stringify({ error: 'bad_request', message: `Please select a valid ${af.name}.` }));
                    return;
                }
            }
        }

        const normalizedPaymentNumber = paymentMethod === 'COD'
            ? ''
            : normalizeBdPaymentNumber(paymentNumber);

        if (paymentMethod !== 'COD' && !normalizedPaymentNumber) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({ error: 'bad_request', message: 'A valid Bangladeshi bKash/Nagad payment number is required.' }));
            return;
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({ error: 'bad_request', message: 'Invalid quantity.' }));
            return;
        }

        if (paymentMethod !== 'COD') {
            const txnTrimmed = String(transactionId || '').trim();
            if (txnTrimmed.length === 0) {
                res.writeHead(400, corsHeaders);
                res.end(JSON.stringify({ error: 'bad_request', message: 'Transaction ID is required for online payment.' }));
                return;
            }
            if (txnTrimmed.length > 50) {
                res.writeHead(400, corsHeaders);
                res.end(JSON.stringify({ error: 'bad_request', message: 'Transaction ID is too long (max 50 characters).' }));
                return;
            }
            if (/[\x00-\x08\x0E-\x1F]/.test(txnTrimmed)) {
                res.writeHead(400, corsHeaders);
                res.end(JSON.stringify({ error: 'bad_request', message: 'Transaction ID contains invalid characters.' }));
                return;
            }
        }

        const db = getDb();
        if (!db) {
            res.writeHead(500, corsHeaders);
            res.end(JSON.stringify({ error: 'server_error', message: 'Server configuration error.' }));
            return;
        }

        // ---- Verify product stock server-side ----
        const productRef = db.collection('products').doc(productId);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            res.writeHead(404, corsHeaders);
            res.end(JSON.stringify({ error: 'not_found', message: 'Product not found.' }));
            return;
        }

        const productData = productSnap.data();
        const stockBefore = Number(productData.stock);
        const stockAfter = stockBefore - qty;

        if (stockAfter < 0) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({ error: 'insufficient_stock', message: `Only ${stockBefore} kg available.` }));
            return;
        }

        // ---- Create Order ----
        const orderNumber = 'SF-' + Date.now();

        const orderData = {
            orderId: orderNumber,
            userId: uid,
            customerUid: uid,
            customerName: String(customerName).trim(),
            phone: String(phone).trim(),
            productId: String(productId),
            productName: String(productName).trim(),
            orderType: String(orderType),
            quantity: qty,
            pricePerKg: Number(pricePerKg),
            totalAmount: Number(totalAmount),
            division: String(division || ''),
            district: String(district || ''),
            upazila: normalizedAreaType === 'city_corporation' ? '' : String(upazila || ''),
            union: normalizedAreaType === 'city_corporation' ? '' : String(union || ''),
            village: normalizedAreaType === 'city_corporation' ? '' : String(village || ''),
            postOffice: String(postOffice || ''),
            house: String(house || ''),
            areaType: normalizedAreaType,
            cityCorporation: ccValidation ? ccValidation.cc.id : '',
            cityCorporationName: ccValidation ? ccValidation.cc.name : '',
            ward: ccValidation ? ccValidation.wardRec.id : '',
            wardNumber: ccValidation ? String(ccValidation.wardRec.ward_number) : '',
            wardName: ccValidation ? ccValidation.wardRec.name : '',
            thana: ccValidation && ccValidation.thanaRec ? ccValidation.thanaRec.id : '',
            thanaName: ccValidation && ccValidation.thanaRec ? ccValidation.thanaRec.name : '',
            locality: ccValidation ? ccValidation.locality : '',
            fullAddress: ccValidation ? ccValidation.fullAddress : String(fullAddress || ''),
            paymentMethod: String(paymentMethod || 'COD'),
            paymentNumber: normalizedPaymentNumber,
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Unpaid',
            transactionId: String(transactionId || '').trim(),
            status: 'Pending',
            createdAt: FieldValue.serverTimestamp(),
        };

        // Use a Firestore transaction for atomicity
        await db.runTransaction(async (tx) => {
            // Re-check stock inside transaction
            const freshProduct = await tx.get(productRef);
            if (!freshProduct.exists) throw new Error('Product not found');
            const freshStock = Number(freshProduct.data().stock);
            if (freshStock < qty) throw new Error(`Only ${freshStock} kg available`);

            // Write order
            const orderRef = db.collection('orders').doc();
            tx.set(orderRef, orderData);

            // Decrement stock
            tx.update(productRef, { stock: freshStock - qty });

            // Update user stats
            const userRef = db.collection('users').doc(uid);
            const userSnap = await tx.get(userRef);
            if (userSnap.exists) {
                const userData = userSnap.data();
                tx.update(userRef, {
                    totalOrders: (userData.totalOrders || 0) + 1,
                    totalSpent: (userData.totalSpent || 0) + Number(totalAmount),
                });
            }

            // Stock history
            const stockHistoryRef = db.collection('stockhistory').doc();
            tx.set(stockHistoryRef, {
                productName: String(productName).trim(),
                type: 'ORDER',
                quantity: qty,
                stockBefore,
                stockAfter,
                note: orderNumber,
                createdAt: FieldValue.serverTimestamp(),
            });

            // In-app notification
            const notifRef = db.collection('notifications').doc();
            tx.set(notifRef, {
                userId: uid,
                title: 'New Order',
                message: `${customerName} ordered ${productName}`,
                type: 'NEW_ORDER',
                isRead: false,
                createdAt: FieldValue.serverTimestamp(),
            });
        });

        console.log(`[OrderAPI] Order created: ${orderNumber} by ${uid}`);

        // ---- Send notifications (after order is confirmed) ----
        let notifications = { whatsapp: 'skipped', sms_018: 'skipped', sms_015: 'skipped', email: 'skipped' };
        try {
            notifications = await sendOrderNotificationsOnce(orderData);
        } catch (notifErr) {
            console.error('[OrderAPI] Notification error (order still created):', notifErr.message);
        }

        // ---- Response ----
        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({
            success: true,
            orderCreated: true,
            orderId: orderNumber,
            notifications,
            message: 'অর্ডার সফলভাবে সম্পন্ন হয়েছে।',
        }));

    } catch (error) {
        console.error('[OrderAPI] Handler error:', error);

        if (error.message && error.message.includes('Only') && error.message.includes('available')) {
            res.writeHead(400, corsHeaders);
            res.end(JSON.stringify({ error: 'insufficient_stock', message: error.message }));
            return;
        }

        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({ error: 'server_error', message: 'অর্ডার তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।' }));
    }
}
