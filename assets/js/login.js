// ======================================
// Customer Login
// Sowrov Fertilizer
// ======================================

import { auth, db } from "./firebase.js";

import {

signInWithEmailAndPassword,
signOut,
onAuthStateChanged,

GoogleAuthProvider,
signInWithPopup,
OAuthProvider,
sendPasswordResetEmail

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

doc,
getDoc,
setDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { renderWidget, getToken, resetWidget } from "./recaptcha-widget.js";
// ======================================
// Elements
// ======================================

const form = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

// ======================================
// Initialize reCAPTCHA Widget
// ======================================

renderWidget("customer-recaptcha");

// ======================================
// Login
// ======================================

if (form) {

form.addEventListener("submit", async (e) => {

e.preventDefault();

const recaptchaToken = getToken("customer-recaptcha");
if (!recaptchaToken) {
    const errEl = document.querySelector("#customer-recaptcha").closest(".recaptcha-group").querySelector(".recaptcha-error");
    if (errEl) errEl.style.display = "block";
    return;
}

try {

const userCredential =
await signInWithEmailAndPassword(

auth,

email.value.trim(),

password.value

);

const uid = userCredential.user.uid;

const snap = await getDoc(

doc(db,"users",uid)

);

if(!snap.exists()){

    alert("User profile not found.");

    await signOut(auth);

    return;

}

const user = snap.data();

// Check Role
if(user.role !== "customer"){

    alert("Access denied.");

    await signOut(auth);

    return;

}

// Check Status
if(user.status === "blocked"){

    alert("Your account has been blocked.");

    await signOut(auth);

    return;

}

alert("✅ Login Successful");

window.location.href = "/customer-dashboard.html";
}

catch(error){

console.error(error);

let msg = 'লগইন ব্যর্থ হয়েছে।';
if (error.code === 'auth/user-not-found') {
    msg = 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।';
} else if (error.code === 'auth/wrong-password') {
    msg = 'পাসওয়ার্ড সঠিক নয়।';
} else if (error.code === 'auth/too-many-requests') {
    msg = 'অনেক বেশি চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
} else if (error.code === 'auth/invalid-email') {
    msg = 'ইমেইল ঠিক নয়।';
} else if (error.code === 'auth/invalid-credential') {
    msg = 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।';
}
alert(msg);
resetWidget("customer-recaptcha");

}

});

}

// ======================================
// Protect Customer Pages
// ======================================

const path = window.location.pathname;

if(

path.includes("profile") ||

path.includes("customer-dashboard") ||

path.includes("customer-orders")

){

onAuthStateChanged(auth,(user)=>{

if(!user){

window.location.href = "/customer-login.html";

}

});

}

// ======================================
// Logout
// ======================================

window.customerLogout = async ()=>{
try{
await signOut(auth);
window.location.href = "/customer-login.html";
}catch(error){
console.error("Logout error:",error);
alert("Logout failed. Please try again.");
}
};
// ======================================
// Google Login
// ======================================

const googleLoginBtn = document.getElementById("googleLoginBtn");

if (googleLoginBtn) {

    googleLoginBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        try {

            const provider = new GoogleAuthProvider();

            const result = await signInWithPopup(auth, provider);

            const firebaseUser = result.user;

            const userRef = doc(db, "users", firebaseUser.uid);

            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {

                await setDoc(userRef, {

                    uid: firebaseUser.uid,

                    name: firebaseUser.displayName || "",

                    email: firebaseUser.email || "",

                    phone: "",

                    address: "",

                    photo: firebaseUser.photoURL || "",

                    role: "customer",

                    status: "active",

                    provider: "google",

                    totalOrders: 0,

                    totalSpent: 0,

                    createdAt: new Date()

                });

            } else {
                const userData = userSnap.data();
                if (userData.status === "blocked") {
                    await signOut(auth);
                    alert("Your account has been blocked. Please contact support.");
                    return;
                }
                if (userData.role !== "customer") {
                    await signOut(auth);
                    alert("Access denied.");
                    return;
                }
            }

            window.location.href = "/customer-dashboard.html";

        }

        catch (error) {

            console.error(error);

            let msg = 'লগইন ব্যর্থ হয়েছে।';
            if (error.code === 'auth/popup-closed-by-user') {
                msg = 'লগইন উইন্ডু বন্ধ করা হয়েছে।';
            } else if (error.code === 'auth/network-request-failed') {
                msg = 'নেটওয়ার্ক সমস্যা। আবার চেষ্টা করুন।';
            } else if (error.code === 'auth/too-many-requests') {
                msg = 'অনেক বেশি চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
            }
            alert(msg);

        }

    });

}

// ======================================
// Forgot Password
// ======================================

const forgotPasswordBtn =
document.getElementById("forgotPasswordBtn");

if(forgotPasswordBtn){

forgotPasswordBtn.addEventListener("click",

async(e)=>{

e.preventDefault();

const userEmail =

prompt("Enter your registered email");

if(!userEmail) return;

try{

await sendPasswordResetEmail(

auth,

userEmail

);

alert(

"Password reset link has been sent to your email."

);

}

catch(error){

console.error(error);

alert(error.message);

}

});

}

console.log("Customer Login Loaded");