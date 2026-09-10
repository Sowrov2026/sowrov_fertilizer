// ======================================
// Admin Settings
// Sowrov Fertilizer
// ======================================


import {db} from "./firebase.js";


import {

doc,
getDoc,
setDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";



const siteName =
document.getElementById("siteName");


const phone =
document.getElementById("phone");


const email =
document.getElementById("email");


const address =
document.getElementById("address");


const about =
document.getElementById("about");



const adminName =
document.getElementById("adminName");


const adminRole =
document.getElementById("adminRole");


const adminImage =
document.getElementById("adminImage");



// Save buttons
const saveSettingsBtn =
document.getElementById("saveSettings");

const saveAdminBtn =
document.getElementById("saveAdmin");

// Save status elements (if they exist)
const settingsStatus =
document.getElementById("settingsStatus");

const adminStatus =
document.getElementById("adminStatus");

function showStatus(el, msg, isError) {
    if (!el) return;
    el.textContent = msg;
    el.style.color = isError ? '#dc2626' : '#0a8f3d';
    el.style.display = 'block';
    setTimeout(function() { el.style.display = 'none'; }, 3000);
}

function setBtnLoading(btn, loading, originalText) {
    if (!btn) return;
    if (loading) {
        btn.disabled = true;
        btn.textContent = '⏳ Saving...';
    } else {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}


// Load Settings


async function loadSettings(){

try {

const snap = await getDoc(

doc(db,"settings","website")

);



if(snap.exists()){


const data=snap.data();



siteName.value=data.siteName || "";

phone.value=data.phone || "";

email.value=data.email || "";

address.value=data.address || "";

about.value=data.about || "";



}



const adminSnap =
await getDoc(

doc(db,"settings","admin")

);



if(adminSnap.exists()){


const data=adminSnap.data();


adminName.value=data.name || "";

adminRole.value=data.role || "";

adminImage.value=data.image || "";

}

} catch (err) {
    console.error("Error loading settings:", err);
    showStatus(settingsStatus, "⚠️ Failed to load settings", true);
}

}



loadSettings();





// Save Website


if (saveSettingsBtn) {
saveSettingsBtn.onclick = async()=>{

setBtnLoading(saveSettingsBtn, true, '💾 Save Settings');

try {

await setDoc(

doc(db,"settings","website"),

{


siteName:siteName.value,

phone:phone.value,

email:email.value,

address:address.value,

about:about.value


}


);


showStatus(settingsStatus, "✅ Website Settings Saved", false);

} catch (err) {
    console.error("Error saving website settings:", err);
    showStatus(settingsStatus, "⚠️ Failed to save settings. Please try again.", true);
} finally {
    setBtnLoading(saveSettingsBtn, false, '💾 Save Settings');
}

};

}



// Save Admin


if (saveAdminBtn) {
saveAdminBtn.onclick = async()=>{

setBtnLoading(saveAdminBtn, true, 'Update Profile');

try {

await setDoc(

doc(db,"settings","admin"),

{


name:adminName.value,

role:adminRole.value,

image:adminImage.value


}


);


showStatus(adminStatus, "✅ Admin Profile Updated", false);

} catch (err) {
    console.error("Error saving admin profile:", err);
    showStatus(adminStatus, "⚠️ Failed to update profile. Please try again.", true);
} finally {
    setBtnLoading(saveAdminBtn, false, 'Update Profile');
}

};

}



console.log("✅ Admin Settings Loaded");
