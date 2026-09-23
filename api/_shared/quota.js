/* ============================================
   SF AI — Per-User Chat Quota
   20 provider-backed requests per 7-hour window
   Firestore-backed, race-condition safe
   ============================================ */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const QUOTA_MAX = 20;
const QUOTA_WINDOW_MS = 7 * 60 * 60 * 1000; // 7 hours

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
        console.warn('[Quota] Failed to init Firebase Admin:', err.message);
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

/**
 * Verify a Firebase Auth ID token. Returns { uid, email } or null.
 */
async function verifyIdToken(idToken) {
    const authAdmin = getAuthAdmin();
    if (!authAdmin || !idToken) return null;
    try {
        const decoded = await authAdmin.verifyIdToken(idToken);
        return { uid: decoded.uid, email: decoded.email || null };
    } catch (err) {
        console.warn('[Quota] Token verify failed:', err.message);
        return null;
    }
}

/**
 * Check if a user can make a chat request.
 * Returns { allowed: boolean, count: number, blockedUntil: number|null, retryMs: number|null }
 */
async function checkQuota(uid) {
    const db = getDb();
    if (!db) return { allowed: true, count: 0, blockedUntil: null, retryMs: null, adminAvailable: false };

    try {
        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();
        const data = userDoc.exists ? userDoc.data() : {};
        const quota = data.aiChatQuota || { count: 0, blockedUntil: null };

        const now = Date.now();

        // Check if currently blocked
        if (quota.blockedUntil) {
            const blockedUntilMs = quota.blockedUntil.toMillis
                ? quota.blockedUntil.toMillis()
                : new Date(quota.blockedUntil).getTime();

            if (blockedUntilMs > now) {
                return {
                    allowed: false,
                    count: quota.count || 0,
                    blockedUntil: blockedUntilMs,
                    retryMs: blockedUntilMs - now,
                    adminAvailable: true,
                };
            }
            // Block expired — reset count
            return { allowed: true, count: 0, blockedUntil: null, retryMs: null, adminAvailable: true };
        }

        // Check if at limit
        if ((quota.count || 0) >= QUOTA_MAX) {
            return {
                allowed: false,
                count: quota.count,
                blockedUntil: now + QUOTA_WINDOW_MS,
                retryMs: QUOTA_WINDOW_MS,
                adminAvailable: true,
            };
        }

        return {
            allowed: true,
            count: quota.count || 0,
            blockedUntil: null,
            retryMs: null,
            adminAvailable: true,
        };
    } catch (err) {
        console.warn('[Quota] Check failed:', err.message);
        return { allowed: true, count: 0, blockedUntil: null, retryMs: null, adminAvailable: true };
    }
}

/**
 * Record a successful provider-backed chat request.
 * Uses a Firestore transaction for race-condition safety.
 * Only increments count; does NOT set block (block is set on next checkQuota if at limit).
 */
async function recordUsage(uid) {
    const db = getDb();
    if (!db) return;

    try {
        const userRef = db.collection('users').doc(uid);
        await db.runTransaction(async (tx) => {
            const doc = await tx.get(userRef);
            const data = doc.exists ? doc.data() : {};
            const quota = data.aiChatQuota || { count: 0, blockedUntil: null };

            const now = Date.now();

            // If blocked, don't increment (shouldn't happen, but defensive)
            if (quota.blockedUntil) {
                const blockedMs = quota.blockedUntil.toMillis
                    ? quota.blockedUntil.toMillis()
                    : new Date(quota.blockedUntil).getTime();
                if (blockedMs > now) return;
            }

            const newCount = (quota.count || 0) + 1;
            const update = { count: newCount, blockedUntil: null };

            // If this push hits the limit, set the block
            if (newCount >= QUOTA_MAX) {
                update.blockedUntil = new Date(now + QUOTA_WINDOW_MS);
            }

            tx.set(userRef, { aiChatQuota: update }, { merge: true });
        });
    } catch (err) {
        console.warn('[Quota] Record failed:', err.message);
    }
}

export {
    QUOTA_MAX,
    QUOTA_WINDOW_MS,
    verifyIdToken,
    checkQuota,
    recordUsage,
};
