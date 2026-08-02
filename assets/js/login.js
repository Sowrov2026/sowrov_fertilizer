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
// ======================================
// Elements
// ======================================

const form = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

// ======================================
// Login
// ======================================

if (form) {

form.addEventListener("submit", async (e) => {

e.preventDefault();

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

window.location.href="customer-dashboard.html";
}

catch(error){

console.error(error);

alert(error.message);

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

window.location.href="customer-login.html";

}

});

}

// ======================================
// Logout
// ======================================

window.customerLogout = async ()=>{
try{
await signOut(auth);
window.location.href="customer-login.html";
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

            }

            window.location.href = "customer-dashboard.html";

        }

        catch (error) {

            console.error(error);

            console.log(error.code);

            alert(error.code);

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