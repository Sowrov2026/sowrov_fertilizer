// ======================================
// Load Gallery
// Sowrov Fertilizer
// ======================================

import { db } from "./firebase.js";

import {

collection,
getDocs,
query,
orderBy

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const galleryGrid =
document.getElementById("galleryGrid");

async function loadGallery(){

    if(!galleryGrid) return;

    galleryGrid.innerHTML="";

    try{

        const q = query(

            collection(db,"gallery"),

            orderBy("createdAt","desc")

        );

        const snapshot =
        await getDocs(q);

        if(snapshot.empty){

            galleryGrid.innerHTML=`

            <div class="no-gallery">

                <h2>No Images Available</h2>

            </div>

            `;

            return;

        }

        snapshot.forEach((doc)=>{

            const image = doc.data();

            galleryGrid.innerHTML += `

            <div class="gallery-item">

                <img
                src="${image.url}"
                alt="${image.name}"

                loading="lazy">

            </div>

            `;

        });

    }

    catch(error){

        console.error(error);

    }

}

loadGallery();