// ======================================
// Customer Profile
// Sowrov Fertilizer
// ======================================

import { auth, db, storage } from "./firebase.js";
import {
    onAuthStateChanged,
signOut,
updatePassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
// ======================================
// Elements
// ======================================
const newPassword =
document.getElementById("newPassword");

const changePasswordBtn =
document.getElementById("changePasswordBtn");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileAddress = document.getElementById("profileAddress");

const profileOrders =
document.getElementById("customerOrders");

const profileSpent =
document.getElementById("customerSpent");
const profileStatus = document.getElementById("profileStatus");

const saveProfileBtn = document.getElementById("saveProfileBtn");
const profilePreview = document.getElementById("profilePreview");
const photoInput = document.getElementById("photoInput");
let currentUID = null;

// ======================================
// Load Profile
// ======================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "customer-login.html";

        return;

    }

    currentUID = user.uid;

    try {

        const snap = await getDoc(doc(db, "users", currentUID));

        if (!snap.exists()) {

            alert("User not found.");

            return;

        }

        const data = snap.data();

        profileName.value = data.name || "";
        profileEmail.value = data.email || "";
        profilePhone.value = data.phone || "";
        profileAddress.value = data.address || "";
        if (data.photo) {

    profilePreview.src = data.photo;

}

        profileOrders.textContent = data.totalOrders || 0;

        profileSpent.textContent =
            "৳" + (data.totalSpent || 0);

        profileStatus.textContent =
            data.status || "active";

document.getElementById("profileLoading").style.display = "none";

    }

    catch (error) {

        console.error(error);

        alert("Failed to load profile.");

    }

});

// ======================================
// Update Profile
// ======================================

saveProfileBtn.addEventListener("click", async () => {

    if (!currentUID) return;

    try {

        await updateDoc(

            doc(db, "users", currentUID),

            {

                name: profileName.value.trim(),

                phone: profilePhone.value.trim(),

                address: profileAddress.value.trim()

            }

        );

        saveProfileBtn.innerText="Saved ✓";

saveProfileBtn.style.background="#28a745";

setTimeout(()=>{

saveProfileBtn.innerText="Save Changes";

saveProfileBtn.style.background="";

},2000);

    }

    catch (error) {

        console.error(error);

        alert("Failed to update profile.");

    }

});

photoInput.addEventListener("change", async () => {

    if (!currentUID) return;

    const file = photoInput.files[0];

    if (!file) return;

    // ======================
    // Image Validation
    // ======================

    if(file.size > 2 * 1024 * 1024){

        alert("Maximum 2MB image.");

        return;

    }

    if(!file.type.startsWith("image/")){

        alert("Please select an image.");

        return;

    }

    try {

        profilePreview.src = URL.createObjectURL(file);

        const storageRef = ref(
            storage,
            `users/${currentUID}/profile.jpg`
        );

        await uploadBytes(storageRef, file);

        const url = await getDownloadURL(storageRef);

        await updateDoc(
            doc(db, "users", currentUID),
            {
                photo: url
            }
        );

        profilePreview.src = url;

        profilePreview.style.border="4px solid #28a745";

setTimeout(()=>{

profilePreview.style.border="";

},1500);

    }

    catch (error) {

        console.error(error);

        alert("Photo upload failed.");

    }

});

changePasswordBtn.addEventListener("click",

async ()=>{

const password =
newPassword.value.trim();

if(password.length<6){

alert("Password must be at least 6 characters.");

return;

}

try{

await updatePassword(

auth.currentUser,

password

);

newPassword.value="";

alert("✅ Password Changed Successfully");

}

catch(error){

console.error(error);

alert(error.message);

}

});

// ======================================
// Logout
// ======================================

window.customerLogout = async () => {
    try {
        await signOut(auth);
        window.location.href = "customer-login.html";
    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    }
};

console.log("Customer Profile Loaded");