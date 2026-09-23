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

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

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

            const safeImage = escapeHtml(String(product.image || ''));
            const safeName = escapeHtml(String(product.name || ''));
            const safeCategory = escapeHtml(String(product.category || ''));
            const safeDesc = escapeHtml(String(product.description || ''));
            const safeWholesale = escapeHtml(String(product.wholesalePrice || 0));
            const safeRetail = escapeHtml(String(product.retailPrice || 0));
            const safeStock = escapeHtml(String(product.stock || 0));

            container.innerHTML += `

            <div class="product-card">

                <div class="product-image">

                    <img src="${safeImage}" alt="${safeName}">

                </div>

                <div class="product-content">

                    <span class="product-category">

                        ${safeCategory}

                    </span>

                    <h3>

                        ${safeName}

                    </h3>

                    <p>

                        ${safeDesc}

                    </p>

                    <div class="product-bottom">

                       <div class="product-prices">

    <p>

        <strong>Wholesale:</strong>

        ৳${safeWholesale}/kg

    </p>

    <p>

        <strong>Retail:</strong>

        ৳${safeRetail}/kg

    </p>

</div>
<p>

    <strong>Stock:</strong>

    ${safeStock} kg

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