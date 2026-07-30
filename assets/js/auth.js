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

      alert(error.message);

    }

  });

}

// =========================
// Protect All Admin Pages
// =========================

const currentPage = window.location.pathname;

if (
    currentPage.includes("admin-dashboard") ||
    currentPage.includes("admin-products") ||
    currentPage.includes("admin-product-add") ||
    currentPage.includes("admin-gallery") ||
    currentPage.includes("admin-orders") ||
    currentPage.includes("admin-users") ||
    currentPage.includes("admin-settings") ||
    currentPage.includes("admin-reviews")
) {

    onAuthStateChanged(auth, (user) => {

        if (!user) {

            window.location.href = "admin-login.html";

        }

    });

}

// =========================
// Logout
// =========================

window.adminLogout = async function () {

  await signOut(auth);

  window.location.href = "admin-login.html";

};