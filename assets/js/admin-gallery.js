console.log("🔥 Admin Gallery JS Loaded");
// ======================================
// Admin Gallery
// Sowrov Fertilizer
// ======================================


import { db } from "./firebase.js";


import {

collection,
getDocs,
addDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {

ref,
uploadBytes,
getDownloadURL

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


import {

storage

} from "./firebase.js";

console.log("Admin Gallery Loaded");
const galleryGrid =
document.getElementById("galleryGrid");


const gallerySearch =
document.getElementById("gallerySearch");


const galleryCategory =
document.getElementById("galleryCategory");


const uploadImageBtn =
document.getElementById("uploadImageBtn");

const galleryFile =
document.getElementById("galleryFile");

uploadImageBtn.onclick = () => {

    galleryFile.click();

};
galleryFile.onchange = async ()=>{


const file =
galleryFile.files[0];


if(!file){

return;

}



try{


const fileName =
Date.now()+"_"+file.name;



const storageRef =
ref(
storage,
"gallery/"+fileName
);



await uploadBytes(
storageRef,
file
);



const imageURL =
await getDownloadURL(storageRef);



await addDoc(

collection(db,"gallery"),

{

name:file.name,

url:imageURL,

category:"Gallery",

createdAt:new Date()

}

);



alert("✅ Image Uploaded");


loadGallery();



}


catch(error){


console.error(error);


alert(
"❌ Upload Failed"
);


}


};


async function loadGallery(){


    if(!galleryGrid) return;


    galleryGrid.innerHTML="";


    const snapshot =
    await getDocs(
        collection(db,"gallery")
    );


    if(snapshot.empty){


        galleryGrid.innerHTML = `

        <div class="empty-gallery">

        No Images Found

        </div>

        `;


        return;

    }



    snapshot.forEach((doc)=>{


        const image = doc.data();



        galleryGrid.innerHTML += `


        <div class="gallery-card">


            <img 

            src="${image.url}"

            >



            <h3>

            ${image.name || "Image"}

            </h3>



            <button>

            🗑 Delete

            </button>



        </div>


        `;


    });


}



loadGallery();
