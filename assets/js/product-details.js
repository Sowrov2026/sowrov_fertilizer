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

productName.innerHTML="Product Not Found";

return;

}

const p=snap.data();

currentProduct=p;

mainImage.src=p.image;

productName.innerHTML=p.name;

productPrice.innerHTML="৳"+p.retailPrice;

productDescription.innerHTML=p.description||"";

productStock.innerHTML=

p.stock>0

?

"🟢 In Stock"

:

"🔴 Out Of Stock";

// Gallery

thumbnailGallery.innerHTML="";

thumbnailGallery.innerHTML+=`

<img

src="${p.image}"

onclick="document.getElementById('mainImage').src='${p.image}'">

`;

// Features

featureList.innerHTML="";

const features=[

"100% Organic",

"Premium Quality",

"Fast Delivery",

"Bangladesh Made"

];

features.forEach(f=>{

featureList.innerHTML+=`

<li>${f}</li>

`;

});

// Specification

specTable.innerHTML=`

<tr>

<td>Category</td>

<td>${p.category||"-"}</td>

</tr>

<tr>

<td>Stock</td>

<td>${p.stock}</td>

</tr>

<tr>

<td>Wholesale</td>

<td>৳${p.wholesalePrice}</td>

</tr>

<tr>

<td>Retail</td>

<td>৳${p.retailPrice}</td>

</tr>

`;

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

relatedProducts.innerHTML+=`

<div class="product-card">

<img src="${p.image}">

<h3>${p.name}</h3>

<p>

৳${p.retailPrice}

</p>

<a

class="btn"

href="product-details.html?id=${docSnap.id}">

View

</a>

</div>

`;

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

window.location.href="cart.html";

}

console.log("Product Details Loaded");