// ======================================
// Admin Products
// ======================================

import { db } from "./firebase.js";

import {

    collection,

    getDocs,

    deleteDoc,

    doc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const tableBody = document.getElementById("productsTableBody");
console.log("Table Body:", tableBody);
// ======================================
// Load Products
// ======================================

async function loadProducts() {

    try {

        tableBody.innerHTML = "";

        const querySnapshot = await getDocs(collection(db, "products"));

        querySnapshot.forEach((doc) => {

            const product = doc.data();

            tableBody.innerHTML += `

            <tr>

                <td>

                    <img src="${product.image}" width="60">

                </td>

                <td>${product.name}</td>

                <td>${product.category}</td>

                <td>

                    Wholesale: ৳${product.wholesalePrice}<br>

                    Retail: ৳${product.retailPrice}

                </td>

                <td>

    ${
        product.stock > 100
        ? `<span class="status active-status">
                In Stock (${product.stock} kg)
           </span>`

        : product.stock > 0
        ? `<span class="status pending-status">
                Low Stock (${product.stock} kg)
           </span>`

        : `<span class="status inactive-status">
                Out of Stock
           </span>`
    }

</td>

                <td>

   <a
    href="admin-product-edit.html?id=${doc.id}"
    class="edit-btn">

    Edit

</a>

    <button
        class="delete-btn"
        data-id="${doc.id}">

        Delete

    </button>

</td>

            </tr>

            `;

        });

    }

    catch (error) {

        console.error(error);

    }

}
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
// ======================================
// Delete Product
// ======================================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("delete-btn")) return;

    const id = e.target.dataset.id;

    const confirmDelete = confirm("Delete this product?");

    if (!confirmDelete) return;

    try {

        await deleteDoc(doc(db, "products", id));

        alert("✅ Product Deleted Successfully");

        loadProducts();

    }

    catch (error) {

        console.error(error);

        alert("❌ Failed to Delete Product");

    }

});