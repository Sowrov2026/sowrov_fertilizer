// ======================================
// Stock Management
// Sowrov Fertilizer ERP
// ======================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// =========================
// Elements
// =========================
const stockModal =
document.getElementById("stockModal");

const stockAction =
document.getElementById("stockAction");

const stockQty =
document.getElementById("stockQty");

const stockNote =
document.getElementById("stockNote");

const saveStockBtn =
document.getElementById("saveStockBtn");

const closeStockBtn =
document.getElementById("closeStockBtn");

let selectedProductId=null;

const historyTableBody =
document.getElementById("historyTableBody");

const stockProducts =
document.getElementById("stockProducts");

const stockQuantity =
document.getElementById("stockQuantity");

const lowStockCount =
document.getElementById("lowStockCount");

const stockTableBody =
document.getElementById("stockTableBody");

const searchStock =
document.getElementById("searchStock");

// =========================

let products = [];

// =========================
// Load Stock
// =========================

async function loadStock(keyword=""){

    try{

        stockTableBody.innerHTML="";

        const snapshot =
        await getDocs(collection(db,"products"));

        products=[];

        let totalStock=0;

        let lowStock=0;

        snapshot.forEach(doc=>{

            const product={
                id:doc.id,
                ...doc.data()
            };

            products.push(product);

        });

        const filtered = products.filter(product=>{

            if(keyword==="") return true;

            return product.name
            .toLowerCase()
            .includes(keyword.toLowerCase());

        });

        filtered.forEach(product=>{

            totalStock += Number(product.stock||0);

            if(product.stock<=50){

                lowStock++;

            }

            stockTableBody.innerHTML+=`

<tr>

<td>${product.name}</td>

<td>${product.stock} kg</td>

<td>${stockStatus(product.stock)}</td>

<td>

<button
class="edit-stock-btn"
data-id="${product.id}">

Update

</button>

</td>

</tr>

`;

        });

        stockProducts.textContent=
        filtered.length;

        stockQuantity.textContent=
        totalStock+" kg";

        lowStockCount.textContent=
        lowStock;

    }

    catch(error){

        console.error(error);

    }

}

loadStock();

// =========================
// Search
// =========================

if(searchStock){

searchStock.addEventListener("input",()=>{

    loadStock(searchStock.value);

});

}

// =========================
// Status
// =========================

function stockStatus(stock){

    if(stock<=0){

        return `
<span class="inactive-status">
Out of Stock
</span>`;

    }

    if(stock<=50){

        return `
<span class="pending-status">
Low Stock
</span>`;

    }

    return `
<span class="active-status">
In Stock
</span>`;

}
// ======================================
// Update Stock
// ======================================

import {
    doc,
    getDoc,
    updateDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("edit-stock-btn")) return;

    const id = e.target.dataset.id;

    try {

        const productRef = doc(db, "products", id);

        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {

            alert("Product not found");

            return;

        }

        const product = productSnap.data();

       selectedProductId=id;

stockModal.style.display="flex";
        if (!qty || qty <= 0) {

            alert("Invalid Quantity");

            return;

        }

        let newStock = product.stock;

        let historyType = "";

        if (action.toUpperCase() === "ADD") {

            newStock += qty;

            historyType = "ADD";

        }

        else if (action.toUpperCase() === "REMOVE") {

            if (qty > product.stock) {

                alert("Not enough stock");

                return;

            }

            newStock -= qty;

            historyType = "REMOVE";

        }

        else {

            alert("Invalid Action");

            return;

        }

        await updateDoc(productRef, {

            stock: newStock

        });

        await addDoc(collection(db, "stockHistory"), {

            productId: id,

            productName: product.name,

            type: historyType,

            quantity: qty,

            stockBefore: product.stock,

            stockAfter: newStock,

            note: "Manual Stock Update",

            createdAt: serverTimestamp()

        });

        alert("✅ Stock Updated");

        loadStock(searchStock.value);
        loadHistory();

    }

    catch (error) {

        console.error(error);

        alert("Update Failed");

    }

});

// ======================================
// Load Stock History
// ======================================

async function loadHistory(){

    try{

        historyTableBody.innerHTML="";

        const snapshot=
        await getDocs(
            collection(db,"stockHistory")
        );

        snapshot.forEach(doc=>{

            const item=doc.data();

            historyTableBody.innerHTML+=`

<tr>

<td>${item.productName}</td>

<td>${item.type}</td>

<td>${item.quantity} kg</td>

<td>${item.stockBefore}</td>

<td>${item.stockAfter}</td>

<td>

${
item.createdAt
?

new Date(
item.createdAt.seconds*1000
).toLocaleDateString()

:"-"
}

</td>

</tr>

`;

        });

    }

    catch(error){

        console.error(error);

    }

}

loadHistory();
closeStockBtn.onclick=()=>{

stockModal.style.display="none";

};
saveStockBtn.onclick=async()=>{
    const qty = Number(stockQty.value);

if (!qty || qty <= 0) {

    alert("Please enter a valid quantity.");

    return;

}

if (
    stockAction.value === "REMOVE" &&
    qty > product.stock
) {

    alert("Not enough stock!");

    return;

}

const productRef=
doc(db,"products",selectedProductId);

const productSnap=
await getDoc(productRef);

const product=productSnap.data();

const qty=
Number(stockQty.value);

let newStock =
    stockAction.value === "ADD"
    ? product.stock + qty
    : product.stock - qty;

await updateDoc(productRef,{

stock:newStock

});

await addDoc(collection(db,"stockHistory"),{

productId:selectedProductId,

productName:product.name,

type:stockAction.value,

quantity:qty,

stockBefore:product.stock,

stockAfter:newStock,

note:stockNote.value,

createdAt:serverTimestamp()

});

stockModal.style.display="none";

stockQty.value="";

stockNote.value="";

loadStock();

loadHistory();
alert("✅ Stock Updated Successfully");
stockAction.value = "ADD";

stockQty.value = "";

stockNote.value = "";

selectedProductId = null;

};