// ======================================
// Sales
// Sowrov Fertilizer
// ======================================

import { db } from "./firebase.js";
console.log("ADMIN SALES JS LOADED");

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// ======================================
// Elements
// ======================================


const searchSale = document.getElementById("searchSale");
const totalRevenue = document.getElementById("totalRevenue");

const totalSales = document.getElementById("totalSales");

const totalQuantity = document.getElementById("totalQuantity");
const salesTableBody = document.getElementById("salesTableBody");
const form = document.getElementById("salesForm");

const customerName = document.getElementById("customerName");
const productSelect = document.getElementById("productSelect");
const saleType = document.getElementById("saleType");

const quantity = document.getElementById("quantity");

const totalPrice = document.getElementById("totalPrice");
// ======================================
// Load Products
// ======================================

async function loadProducts() {

    try {

        productSelect.innerHTML = "<option>Loading...</option>";

        const querySnapshot = await getDocs(collection(db, "products"));

        productSelect.innerHTML = "";

       querySnapshot.forEach((doc) => {

    const product = doc.data();

    // যেসব Product-এ wholesalePrice বা retailPrice নেই, সেগুলো Skip করবে
    if (
        product.wholesalePrice === undefined ||
        product.retailPrice === undefined
    ) {
        return;
    }

    productSelect.innerHTML += `
        <option
            value="${doc.id}"
            data-wholesale="${product.wholesalePrice}"
            data-retail="${product.retailPrice}">
            ${product.name}
        </option>
    `;

});

    }

    catch (error) {

        console.error(error);

        alert("Failed to load products");

    }

}

loadProducts();
// ======================================
// Calculate Total Price
// ======================================

function calculatePrice() {
    

    const selectedOption = productSelect.options[productSelect.selectedIndex];
    console.log(selectedOption);

console.log(selectedOption.dataset);

console.log(selectedOption.dataset.wholesale);

    if (!selectedOption || !selectedOption.dataset.wholesale) {

        totalPrice.value = "";

        return;

    }

    let price = 0;

    if (saleType.value === "Wholesale") {

        price = Number(selectedOption.dataset.wholesale);

    }

    else {

        price = Number(selectedOption.dataset.retail);

    }

    totalPrice.value = price * Number(quantity.value || 0);

}
productSelect.addEventListener("change", calculatePrice);

saleType.addEventListener("change", calculatePrice);

quantity.addEventListener("input", calculatePrice);

// ======================================
// Save Sale
// ======================================

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        // এখানে তোমার আগের পুরো submit code থাকবে

    });

}
// ======================================
// Load Sales History
// ======================================

async function loadSales(keyword = "") {

    try {
        let revenue = 0;

let salesCount = 0;

let quantitySold = 0;

        salesTableBody.innerHTML = "";

        const querySnapshot = await getDocs(collection(db, "sales"));

        querySnapshot.forEach((doc) => {

            const sale = doc.data();
            if (
    keyword &&
    !sale.customerName.toLowerCase().includes(keyword.toLowerCase())
) {
    return;
}
            revenue += Number(sale.totalPrice);

salesCount++;

quantitySold += Number(sale.quantity);

            salesTableBody.innerHTML += `

            <tr>

                <td>${sale.customerName}</td>

                <td>${sale.productName}</td>

                <td>${sale.saleType}</td>

                <td>${sale.quantity} kg</td>

                <td>৳${sale.totalPrice}</td>

                <td>
                    ${
                        sale.createdAt
                        ? new Date(
                            sale.createdAt.seconds * 1000
                          ).toLocaleDateString()
                        : "-"
                    }
                </td>
                <td>

    <button
        class="delete-sale-btn"
        data-id="${doc.id}">

        Delete

    </button>

</td>

            </tr>

            `;

        });
        totalRevenue.textContent = `৳${revenue}`;

totalSales.textContent = salesCount;

totalQuantity.textContent = `${quantitySold} kg`;

    }

    catch (error) {

        console.error(error);

    }

}

loadSales();
searchSale.addEventListener("input", () => {

    loadSales(searchSale.value);

});
// ======================================
// Delete Sale
// ======================================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("delete-sale-btn")) return;

    const id = e.target.dataset.id;

    if (!confirm("Delete this sale?")) return;

    try {

        await deleteDoc(doc(db, "sales", id));

        alert("✅ Sale Deleted");

        loadSales();

    }

    catch (error) {

        console.error(error);

        alert("❌ Failed to Delete Sale");

    }

});
