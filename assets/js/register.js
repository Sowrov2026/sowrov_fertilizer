// ======================================
// Customer Register
// Sowrov Fertilizer
// ======================================

import { auth, db, storage } from "./firebase.js";

import {

createUserWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

doc,
setDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {

ref,
uploadBytes,
getDownloadURL

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
// ======================================
// Elements
// ======================================
const photo = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");
const form = document.getElementById("registerForm");

const name = document.getElementById("name");

const email = document.getElementById("email");

const phone = document.getElementById("phone");

const address = document.getElementById("address");

const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

// ======================================
// Register
// ======================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (password.value !== confirmPassword.value) {

        alert("Passwords do not match.");

        return;

    }
    if(password.value.length < 6){

    alert("Password must be at least 6 characters.");

    return;

}

    try {

        const userCredential = await createUserWithEmailAndPassword(

            auth,

            email.value.trim(),

            password.value

        );

        const user = userCredential.user;

        await setDoc(

            doc(db, "users", user.uid),

            {

                uid: user.uid,

                name: name.value.trim(),

                email: email.value.trim(),

                phone: phone.value.trim(),

                address: address.value.trim(),

                photo: "",

                role: "customer",

                status: "active",

                totalOrders: 0,

                totalSpent: 0,

                createdAt: serverTimestamp()

            }

        );

        alert("✅ Account Created Successfully");

        window.location.href = "customer-login.html";

    }

    catch (error) {

    console.error(error);


    if(error.code === "auth/email-already-in-use"){

        alert("This email is already registered.");

    }

    else if(error.code === "auth/invalid-email"){

        alert("Invalid email address.");

    }

    else{

        alert(error.message);

    }

}

});
photo.addEventListener("change", () => {

const file = photo.files[0];

if(file){

photoPreview.src = URL.createObjectURL(file);

}

});