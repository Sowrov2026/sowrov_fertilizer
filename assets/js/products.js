// ==========================================
// PRODUCTS PAGE
// Sowrov Fertilizer
// ==========================================

import { db } from "./firebase.js";

import {
 collection,
 getDocs,
 doc,
 getDoc,
 updateDoc,
 increment,
 setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const container = document.getElementById("productsContainer");

async function loadProducts() {

    try {

        container.innerHTML = "<h2>Loading Products...</h2>";

        const querySnapshot = await getDocs(collection(db, "products"));

        container.innerHTML = "";

        if (querySnapshot.empty) {

            container.innerHTML = `

            <div class="no-product">

                <h2>No Products Found</h2>

            </div>

            `;

            return;

        }

        querySnapshot.forEach((doc) => {

            const product = doc.data();

            container.innerHTML += `

            <div class="product-card">

                <div class="product-image">

                    <img src="${product.image}" alt="${product.name}">

                </div>

                <div class="product-content">

                    <span class="product-category">

                        ${product.category}

                    </span>

                    <h3>

                        ${product.name}

                    </h3>

                    <p>

                        ${product.description}

                    </p>

                    <div class="product-bottom">

                       <div class="product-prices">

    <p>

        <strong>Wholesale:</strong>

        ৳${product.wholesalePrice}/kg

    </p>

    <p>

        <strong>Retail:</strong>

        ৳${product.retailPrice}/kg

    </p>

</div>
<p>

    <strong>Stock:</strong>

    ${product.stock} kg

</p>

                        <a href="contact.html" class="btn">

                            Buy Now

                        </a>

                    </div>

                </div>

            </div>

            `;

        });

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `

        <div class="no-product">

            <h2>

                Failed to Load Products

            </h2>

            <p>

                ${error.message}

            </p>

        </div>

        `;

    }

}

loadProducts();
async function increaseWebsiteViews(){

const viewRef =
doc(db,"websiteStats","views");


const snap =
await getDoc(viewRef);


if(snap.exists()){


await updateDoc(viewRef,{

count: increment(1)

});


}

else{


await setDoc(viewRef,{

count:1

});


}


}


increaseWebsiteViews();