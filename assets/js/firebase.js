// ==========================================
// Firebase Configuration — Dual Auth Architecture
// Customer: default app | Admin: named "sf-admin" app
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

import { initializeAppCheck, ReCaptchaEnterpriseProvider, getToken } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-check.js";

import { RECAPTCHA_SITE_KEY } from "./app-config.js";

const firebaseConfig = {

  apiKey: "AIzaSyCwD4knvy0O2KlGFte7qfHsAkiS8QeMRB8",

  authDomain: "sowrov-fertilizer-905de.firebaseapp.com",

  projectId: "sowrov-fertilizer-905de",

  storageBucket: "sowrov-fertilizer-905de.firebasestorage.app",

  messagingSenderId: "726860595005",

  appId: "1:726860595005:web:76b82c1d32a72e98c98f54"

};

// ==========================================
// Customer App (default) — used by customer pages
// ==========================================

const customerApp = initializeApp(firebaseConfig);

const customerAuth = getAuth(customerApp);

// ==========================================
// Admin App (named) — used by admin pages
// ==========================================

const adminApp = initializeApp(firebaseConfig, "sf-admin");

const adminAuth = getAuth(adminApp);

// ==========================================
// App Check — reCAPTCHA Enterprise
// ==========================================

let customerAppCheck = null;
let adminAppCheck = null;

if (RECAPTCHA_SITE_KEY) {
    try {
        customerAppCheck = initializeAppCheck(customerApp, {
            provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true
        });
        console.log("[App Check] Initialized for customerApp");
    } catch (err) {
        console.error("[App Check] Failed to initialize for customerApp:", err);
    }

    try {
        adminAppCheck = initializeAppCheck(adminApp, {
            provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
            isTokenAutoRefreshEnabled: true
        });
        console.log("[App Check] Initialized for adminApp");
    } catch (err) {
        console.error("[App Check] Failed to initialize for adminApp:", err);
    }
} else {
    console.warn("[App Check] RECAPTCHA_SITE_KEY not set — App Check skipped");
}

export async function verifyAppCheckToken(appCheckInstance, label) {
    try {
        const result = await getToken(appCheckInstance, true);
        console.log(`[App Check] ${label} token:`, result.token.substring(0, 20) + "...");
        return result;
    } catch (err) {
        console.error(`[App Check] ${label} token failed:`, err);
        return null;
    }
}

// ==========================================
// Shared services (same project, same Firestore)
// ==========================================

const db = getFirestore(customerApp);

const storage = getStorage(customerApp);

// ==========================================
// Exports
// auth = customerAuth (backward compatible for customer pages)
// adminAuth = for admin pages
// ==========================================

export {

    customerApp,

    customerAuth,

    adminApp,

    adminAuth,

    db,

    customerAppCheck,

    adminAppCheck

};
export { storage };
export const auth = customerAuth;
