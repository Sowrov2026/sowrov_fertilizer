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




// Load Settings


async function loadSettings(){


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



}



loadSettings();




// Save Website


document
.getElementById("saveSettings")
.onclick = async()=>{


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


alert("✅ Website Settings Saved");


};




// Save Admin


document
.getElementById("saveAdmin")
.onclick = async()=>{


await setDoc(

doc(db,"settings","admin"),

{


name:adminName.value,

role:adminRole.value,

image:adminImage.value


}


);



alert("✅ Admin Profile Updated");


};



console.log("✅ Admin Settings Loaded");