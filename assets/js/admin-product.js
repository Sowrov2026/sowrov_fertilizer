// ======================================
// Product Add
// Sowrov Fertilizer
// ======================================

import { db } from "./firebase.js";

import {

    collection,

    addDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// ======================================
// Form
// ======================================

const form = document.getElementById("productForm");
// ======================================
// Inputs
// ======================================

const productName = document.getElementById("productName");

const category = document.getElementById("category");

const wholesalePrice = document.getElementById("wholesalePrice");

const retailPrice = document.getElementById("retailPrice");

const stock = document.getElementById("stock");

const image = document.getElementById("image");

const description = document.getElementById("description");
// ======================================
// Submit Form
// ======================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {

    await addDoc(collection(db, "products"), {

        name: productName.value,

        category: category.value,

        wholesalePrice: Number(wholesalePrice.value),

        retailPrice: Number(retailPrice.value),

        stock: Number(stock.value),

        image: image.value,

        description: description.value,

        createdAt: new Date()

    });

    alert("✅ Product Added Successfully!");

    form.reset();

}

catch (error) {

    console.error(error);

    alert("❌ Failed to Add Product");

}

});
