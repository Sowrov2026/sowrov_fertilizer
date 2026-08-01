import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

      await signInWithEmailAndPassword(auth, email, password);

      window.location.href = "admin-dashboard.html";

    } catch (error) {
      // V34 FIX: Show user-friendly error instead of raw Firebase error
      let msg = 'লগইন ব্যর্থ হয়েছে।';
      if (error.code === 'auth/user-not-found') {
        msg = 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।';
      } else if (error.code === 'auth/wrong-password') {
        msg = 'পাসওয়ার্ড সঠিক নয়।';
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

    onAuthStateChanged(auth, (user) => {

        if (!user) {

            window.location.href = "admin-login.html";

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
    window.location.href = "admin-login.html";
  }

};