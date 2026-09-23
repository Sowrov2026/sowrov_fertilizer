// ======================================
// Load Products
// Sowrov Fertilizer
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productGrid =
document.getElementById("productGrid");

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

async function loadProducts(){

    if(!productGrid) return;

    productGrid.innerHTML="";

    try{

        const q = query(

    collection(db,"products"),

    orderBy("createdAt","desc")

);

const snapshot = await getDocs(q);

let products = [];

snapshot.forEach((doc)=>{

    products.push({

        id: doc.id,

        ...doc.data()

    });

});

if(products.length===0){

    productGrid.innerHTML=`

    <div class="no-product">

        <h2>No Products Available</h2>

    </div>

    `;
    window._sfProducts = [];
    return;

}

window._sfProducts = products;
renderProducts(products);

       
    }

    catch(error){

        console.error(error);

    }

}

loadProducts();
// ======================================
// Add To Cart
// ======================================

document.addEventListener("click",(e)=>{

if(!e.target.classList.contains("add-cart")) return;

const cart=
JSON.parse(localStorage.getItem("cart"))||[];

const id=
e.target.dataset.id;

const existing=
cart.find(item=>item.id===id);

if(existing){

existing.qty++;

}

else{

cart.push({

id:id,

name:e.target.dataset.name,

price:Number(e.target.dataset.price),

image:e.target.dataset.image,

category:e.target.dataset.category,

qty:1

});

}

localStorage.setItem(

"cart",

JSON.stringify(cart)

);
updateCartBadge();

alert("✅ Added To Cart");

});
// ======================================
// Update Cart Badge
// ======================================

function updateCartBadge(){

const badge=

document.getElementById("cartCount");

if(!badge) return;

const cart=

JSON.parse(localStorage.getItem("cart"))||[];

let total=0;

cart.forEach(item=>{

total+=item.qty;

});

badge.innerText=total;

}

updateCartBadge();
function renderProducts(products){

    productGrid.innerHTML = "";

    if(products.length===0){

        productGrid.innerHTML = `
        <div class="no-product">
            <h2>No Products Found</h2>
        </div>
        `;

        return;

    }

    products.forEach(product=>{

    let badge = "";

    if(product.stock <= 0){

        badge = `<span class="stock-badge out">Out of Stock</span>`;

    }
    else if(product.discount > 0){

        badge = `<span class="stock-badge discount">
            ${escapeHtml(String(product.discount))}% OFF
        </span>`;

    }
    else{

        badge = `<span class="stock-badge new">
            NEW
        </span>`;

    }

        const safeName = escapeHtml(product.name);
        const safeImage = escapeHtml(product.image);
        const safeCategory = escapeHtml(product.category || 'Organic');
        const safeDesc = escapeHtml(product.description || '');
        const safeId = escapeHtml(product.id);

        productGrid.innerHTML += `

        <div class="product-card">
        

            <img src="${safeImage}" alt="${safeName}">
            ${badge}

            <div class="product-content">
            

                <span class="product-badge">
                    ${safeCategory}
                </span>

                <h3>${safeName}</h3>

                <p>${safeDesc}</p>

                <h4>৳${escapeHtml(String(product.retailPrice))}</h4>

                <small>
                Stock : ${escapeHtml(String(product.stock))} kg
                </small>

                <div class="product-footer">

                    <a
                    class="btn"
                    href="product-details.html?id=${safeId}">
                    View Details
                    </a>

                    <button
                    class="btn-outline add-cart"
                    data-id="${safeId}"
                    data-name="${safeName}"
                    data-price="${escapeHtml(String(product.retailPrice))}"
                    data-image="${safeImage}"
                    data-category="${safeCategory}">
                    Add To Cart
                    </button>

                </div>

            </div>

        </div>

        `;

    });

}
