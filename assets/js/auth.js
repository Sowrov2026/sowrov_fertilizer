import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =========================
// Admin Login
// =========================

const loginForm = document.getElementById("adminLoginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (!userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
        await signOut(auth);
        alert('এই অ্যাকাউন্টটি অ্যাডমিন অ্যাক্সেস পায়নি।');
        return;
      }

      // Save admin session for isolation
      localStorage.setItem('sf_admin_session', JSON.stringify({ uid: user.uid, email: user.email || "" }));

      window.location.href = "/admin-dashboard.html";

    } catch (error) {
      let msg = 'লগইন ব্যর্থ হয়েছে।';
      if (error.code === 'auth/user-not-found') {
        msg = 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg = 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'অনেক বেশি চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'ইমেইল ঠিক নয়।';
      }
      alert(msg);
    }

  });

}

// =========================
// Protect All Admin Pages
// V34 FIX: Check for admin- prefix instead of listing each page
// =========================

const currentPage = window.location.pathname;
const isAdminPage = currentPage.includes("admin-") && !currentPage.includes("admin-login");

if (isAdminPage) {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {
            window.location.href = "/admin-login.html";
            return;
        }

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;
            if (!userData || (userData.role !== "admin" && userData.role !== "super_admin")) {
                await signOut(auth);
                window.location.href = "/admin-login.html";
            }
        } catch (e) {
            console.error("Admin role check failed:", e);
        }

    });

}

// =========================
// Logout
// V34 FIX: Add error handling
// =========================

window.adminLogout = async function () {

  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('sf_admin_session');
    window.location.href = "/admin-login.html";
  }

};