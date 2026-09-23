// ============================================
// SF — Track Order API (Server-Side)
// Verifies Firebase Auth + enforces order ownership
// Returns only the authenticated user's order data
// ============================================

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getAllowedOrigin } from './_shared/cors.js';

// ---- Firebase Admin Init ----

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
        console.error('[TrackOrderAPI] Failed to init Firebase Admin:', err.message);
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
        console.warn('[TrackOrderAPI] Token verify failed:', err.message);
        return null;
    }
}

// ---- Response Helpers ----

function jsonResponse(res, status, data) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.status(status).end(JSON.stringify(data));
}

// ---- Handler ----

export default async function handler(req, res) {
    // CORS
    const origin = getAllowedOrigin(req);
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return jsonResponse(res, 405, { message: 'Method not allowed' });
    }

    // Verify Firebase ID token
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!idToken) {
        return jsonResponse(res, 401, { message: 'Login required to track orders.' });
    }

    const user = await verifyIdToken(idToken);
    if (!user) {
        return jsonResponse(res, 401, { message: 'Invalid or expired session. Please log in again.' });
    }

    // Get order ID from query
    const orderId = (req.query.id || '').trim();
    if (!orderId) {
        return jsonResponse(res, 400, { message: 'Order ID is required.' });
    }

    const db = getDb();
    if (!db) {
        console.error('[TrackOrderAPI] Firestore not initialized');
        return jsonResponse(res, 500, { message: 'Server configuration error.' });
    }

    try {
        // Fetch the specific order document by ID
        const orderRef = db.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();

        if (!orderSnap.exists) {
            // Non-enumerating response: same message for "not found" and "not yours"
            return jsonResponse(res, 404, { message: 'Order not found.' });
        }

        const order = orderSnap.data();

        // Server-side ownership check
        const orderUid = order.userId || order.customerUid || '';
        if (orderUid !== user.uid) {
            // Non-enumerating: don't reveal that the order exists but belongs to someone else
            return jsonResponse(res, 404, { message: 'Order not found.' });
        }

        // Return sanitized order data — only safe fields for tracking
        return jsonResponse(res, 200, {
            orderNumber: order.orderNumber || order.orderId || orderId,
            productName: order.productName || 'Product',
            quantity: order.quantity || 0,
            total: order.total || order.totalAmount || 0,
            status: order.status || 'Pending',
            paymentMethod: order.paymentMethod || '',
            createdAt: order.createdAt || null,
        });

    } catch (err) {
        console.error('[TrackOrderAPI] Error:', err.message);
        return jsonResponse(res, 500, { message: 'Failed to fetch order.' });
    }
}
