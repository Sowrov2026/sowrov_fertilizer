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

    return;

}

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
            ${product.discount}% OFF
        </span>`;

    }
    else{

        badge = `<span class="stock-badge new">
            NEW
        </span>`;

    }

        productGrid.innerHTML += `

        <div class="product-card">
        

            <img src="${product.image}" alt="${product.name}">
            ${badge}

            <div class="product-content">
            
            

                <span class="product-badge">
                    ${product.category || "Organic"}
                </span>

                <h3>${product.name}</h3>

                <p>${product.description || ""}</p>

                <h4>৳${product.retailPrice}</h4>

                <small>
                Stock : ${product.stock} kg
                </small>

                <div class="product-footer">

                    <a
                    class="btn"
                    href="product-details.html?id=${product.id}">
                    View Details
                    </a>

                    <button
                    class="btn-outline add-cart"
                    data-id="${product.id}"
                    data-name="${product.name}"
                    data-price="${product.retailPrice}"
                    data-image="${product.image}"
                    data-category="${product.category}">
                    Add To Cart
                    </button>

                </div>

            </div>

        </div>

        `;

    });

}