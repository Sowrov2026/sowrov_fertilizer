// ======================================
// Edit Product
// ======================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/";
// ======================================
// Get Product ID
// ======================================

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");
if (!productId) {

    alert("No Product ID Found!");

    window.location.href = "/admin-products.html";

}

console.log("Product ID:", productId);
// ======================================
// Form Elements
// ======================================

const form = document.getElementById("productForm");

const productName = document.getElementById("productName");

const category = document.getElementById("category");

const wholesalePrice = document.getElementById("wholesalePrice");

const retailPrice = document.getElementById("retailPrice");

const stock = document.getElementById("stock");

const image = document.getElementById("image");

const description = document.getElementById("description");
// ======================================
// Load Product
// ======================================

async function loadProduct() {
    try {

    const productRef = doc(db, "products", productId);

    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {

        alert("Product not found");

        return;

    }

    const product = productSnap.data();

    productName.value = product.name;

    category.value = product.category;

    wholesalePrice.value = product.wholesalePrice;

    retailPrice.value = product.retailPrice;

    stock.value = product.stock;

    image.value = product.image;

    description.value = product.description;

}

catch (error) {

    console.error(error);

    alert("Failed to load product");
    }

}

loadProduct();
// ======================================
// Update Product
// ======================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

        await updateDoc(doc(db, "products", productId), {

            name: productName.value,

            category: category.value,

            wholesalePrice: Number(wholesalePrice.value),

            retailPrice: Number(retailPrice.value),

            stock: Number(stock.value),

            image: image.value,

            description: description.value

        });

        alert("✅ Product Updated Successfully!");

        window.location.href = "/admin-products.html";

    }

    catch (error) {

        console.error(error);

        alert("❌ Failed to Update Product");

    }

});