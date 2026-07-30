// ==========================================
// Firebase Configuration
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

// Initialize Firebase

const app = initializeApp(firebaseConfig);

// Firebase Services

const auth = getAuth(app);

const db = getFirestore(app);

// Export

export {

    app,

    auth,

    db

};
export const storage = getStorage(app);