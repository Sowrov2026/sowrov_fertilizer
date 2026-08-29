// ==========================================
// Firebase Configuration — Dual Auth Architecture
// Customer: default app | Admin: named "sf-admin" app
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth, initializeAuth, inMemoryPersistence } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

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
// Uses inMemory persistence to avoid IndexedDB collision with customerAuth
// Admin must re-login after page refresh (acceptable trade-off)
// ==========================================

const adminApp = initializeApp(firebaseConfig, "sf-admin");

const adminAuth = initializeAuth(adminApp, { persistence: inMemoryPersistence });

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

    auth: customerAuth,

    db

};
export { storage };
