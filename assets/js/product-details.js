// ======================================
// Product Details
// ======================================

import { db } from "./firebase.js";

import {
doc,
getDoc,
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// URL
const params=new URLSearchParams(window.location.search);
const id=params.get("id");

// Elements
const mainImage=document.getElementById("mainImage");
const thumbnailGallery=document.getElementById("thumbnailGallery");

const productName=document.getElementById("productName");
const productPrice=document.getElementById("productPrice");
const productDescription=document.getElementById("productDescription");
const productStock=document.getElementById("productStock");

const featureList=document.getElementById("featureList");
const specTable=document.getElementById("specTable");

const relatedProducts=document.getElementById("relatedProducts");

const qty=document.getElementById("qty");

let currentProduct=null;

// ======================================
// Utilities
// ======================================

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function showNotFound(msg) {
    if (productName) productName.textContent = msg || 'Product Not Found';
    if (productPrice) productPrice.textContent = '';
    if (productDescription) productDescription.textContent = '';
    if (productStock) productStock.textContent = '';
    if (mainImage) mainImage.style.display = 'none';
    if (thumbnailGallery) thumbnailGallery.innerHTML = '';
    if (featureList) featureList.innerHTML = '';
    if (specTable) specTable.innerHTML = '';
    if (relatedProducts) relatedProducts.innerHTML = '';
    var addCartBtn = document.getElementById('addCart');
    var buyNowBtn = document.getElementById('buyNow');
    if (addCartBtn) addCartBtn.style.display = 'none';
    if (buyNowBtn) buyNowBtn.style.display = 'none';
}

// ======================================
// Guard: Missing or Invalid ID
// ======================================

if (!id || id.trim() === '') {
    showNotFound('Product Not Found');
} else {

// ======================================
// Quantity
// ======================================

const plusBtn = document.getElementById("plusQty");
const minusBtn = document.getElementById("minusQty");
if(plusBtn) plusBtn.onclick=()=>{

qty.value=Number(qty.value)+1;

}

if(minusBtn) minusBtn.onclick=()=>{

if(Number(qty.value)>1){

qty.value=Number(qty.value)-1;

}

}

// ======================================
// Load Product
// ======================================

async function loadProduct(){

const snap=await getDoc(doc(db,"products",id));

if(!snap.exists()){

showNotFound('Product Not Found');
return;

}

const p=snap.data();

currentProduct=p;

mainImage.src=p.image || 'assets/images/default-product.png';

productName.textContent=p.name || 'Product';

productPrice.textContent="৳"+(p.retailPrice || '');

productDescription.textContent=p.description||"";

productStock.textContent=

p.stock>0

?

"🟢 In Stock"

:

"🔴 Out Of Stock";

// Gallery

thumbnailGallery.innerHTML="";

const galleryImg = document.createElement('img');
galleryImg.src = p.image;
galleryImg.onclick = function() { document.getElementById('mainImage').src = p.image; };
thumbnailGallery.appendChild(galleryImg);

// Features

featureList.innerHTML="";

const features=[

"100% Organic",

"Premium Quality",

"Fast Delivery",

"Bangladesh Made"

];

features.forEach(f=>{

const li = document.createElement('li');
li.textContent = f;
featureList.appendChild(li);

});

// Specification

specTable.innerHTML="";

const specData = [
    ['Category', p.category || '-'],
    ['Stock', String(p.stock || 0)],
    ['Wholesale', '৳' + String(p.wholesalePrice || 0)],
    ['Retail', '৳' + String(p.retailPrice || 0)],
];

specData.forEach(function(row) {
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    td1.textContent = row[0];
    const td2 = document.createElement('td');
    td2.textContent = row[1];
    tr.appendChild(td1);
    tr.appendChild(td2);
    specTable.appendChild(tr);
});

}

loadProduct();

// ======================================
// Related Products
// ======================================

async function loadRelated(){

const snapshot=await getDocs(collection(db,"products"));

relatedProducts.innerHTML="";

snapshot.forEach(docSnap=>{

if(docSnap.id===id) return;

const p=docSnap.data();

const card = document.createElement('div');
card.className = 'product-card';

const img = document.createElement('img');
img.src = p.image || 'assets/images/default-product.png';
card.appendChild(img);

const h3 = document.createElement('h3');
h3.textContent = p.name || 'Product';
card.appendChild(h3);

const priceP = document.createElement('p');
priceP.textContent = '৳' + String(p.retailPrice || '');
card.appendChild(priceP);

const link = document.createElement('a');
link.className = 'btn';
link.href = 'product-details.html?id=' + encodeURIComponent(docSnap.id);
link.textContent = 'View';
card.appendChild(link);

relatedProducts.appendChild(card);

});

}

loadRelated();

// ======================================
// Add To Cart
// ======================================

document.getElementById("addCart").onclick=()=>{

if(!currentProduct) return;

const cart=

JSON.parse(localStorage.getItem("cart"))||[];

const existing=

cart.find(item=>item.id===id);

if(existing){

existing.qty+=Number(qty.value);

}

else{

cart.push({

id:id,

name:currentProduct.name,

price:Number(currentProduct.retailPrice),

image:currentProduct.image,

category:currentProduct.category,

qty:Number(qty.value)

});

}

localStorage.setItem(

"cart",

JSON.stringify(cart)

);

alert("✅ Added To Cart");

}

// ======================================
// Buy Now
// ======================================

document.getElementById("buyNow").onclick=()=>{

document.getElementById("addCart").click();

window.location.href = "/cart.html";

}

} // end else (valid ID)

console.log("Product Details Loaded");
