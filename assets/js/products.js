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

            const safeId = escapeHtml(String(doc.id));
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

                        <div class="product-footer">

                            <a href="product-details.html?id=${safeId}" class="btn">

                                View Details

                            </a>

                        </div>

                        <div class="product-buy-row">

                            <input
                                type="number"
                                class="product-qty"
                                data-id="${safeId}"
                                value="1"
                                min="1"
                                max="${safeStock}"
                                aria-label="Quantity"
                            >

                            <button
                                class="btn-outline add-cart"
                                data-id="${safeId}"
                                data-name="${safeName}"
                                data-price="${safeRetail}"
                                data-image="${safeImage}"
                                data-category="${safeCategory}">

                                Add To Cart

                            </button>

                            <button
                                class="btn order-now"
                                data-id="${safeId}"
                                data-name="${safeName}"
                                data-price="${safeRetail}"
                                data-image="${safeImage}"
                                data-category="${safeCategory}">

                                Order Now

                            </button>

                        </div>

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

// ==========================================
// Add To Cart / Order Now
// ==========================================

function getCardQty(card) {
    var qtyInput = card ? card.querySelector('.product-qty') : null;
    var qty = qtyInput ? Number(qtyInput.value) : 1;
    if (!qty || qty < 1) qty = 1;
    var max = qtyInput ? Number(qtyInput.max) : 0;
    if (max > 0 && qty > max) qty = max;
    return qty;
}

function addToCartFromButton(btn, qty) {
    var cart = JSON.parse(localStorage.getItem("cart")) || [];
    var id = btn.dataset.id;
    var existing = cart.find(function (item) { return item.id === id; });
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({
            id: id,
            name: btn.dataset.name || '',
            price: Number(btn.dataset.price) || 0,
            image: btn.dataset.image || '',
            category: btn.dataset.category || '',
            qty: qty
        });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    var badge = document.getElementById("cartCount");
    if (!badge) return;
    var cart = JSON.parse(localStorage.getItem("cart")) || [];
    var total = 0;
    cart.forEach(function (item) { total += Number(item.qty || 0); });
    badge.innerText = total;
}

document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest('.add-cart, .order-now') : null;
    if (!btn) return;
    var card = btn.closest ? btn.closest('.product-card') : null;
    var qty = getCardQty(card);
    addToCartFromButton(btn, qty);
    if (btn.classList.contains('order-now')) {
        window.location.href = '/cart.html';
        return;
    }
    alert("✅ Added To Cart");
});

updateCartBadge();

// ==========================================
// Website Views Counter
// ==========================================

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