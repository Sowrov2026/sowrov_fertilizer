console.log("customer-orders.js Loaded");
// ======================================
// Customer Orders
// Sowrov Fertilizer
// ======================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const table =
document.getElementById("customerOrdersTable");

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function safeClass(str) {
    return escapeHtml(String(str || '')).toLowerCase();
}

// Backend status -> friendly display label
const STATUS_LABELS = {
    Pending: "Placed",
    Approved: "Confirmed",
    Packed: "Processing",
    Shipped: "Shipped",
    Delivered: "Delivered",
    Cancelled: "Cancelled"
};

function friendlyStatus(status) {
    return STATUS_LABELS[status] || status;
}

function waitForAuthUser(timeoutMs) {
    return new Promise(function(resolve) {
        if (auth.currentUser) { resolve(auth.currentUser); return; }
        var done = false;
        var unsub = onAuthStateChanged(auth, function(u) {
            if (!done && u) { done = true; unsub(); resolve(u); }
        });
        setTimeout(function() {
            if (!done) { done = true; unsub(); resolve(auth.currentUser); }
        }, timeoutMs);
    });
}

(async function() {

var user = await waitForAuthUser(5000);
if (!user) { window.location.href = "/customer-login.html"; return; }

    try{

        const q = query(

    collection(db, "orders"),

    where("userId", "==", user.uid)

);
console.log("Query created successfully");

        onSnapshot(q, (snapshot) => {
            console.log("Logged User UID:", user.uid);
console.log("Total Orders:", snapshot.size);
console.log(snapshot.docs.map(doc => doc.data()));

    table.innerHTML = "";

    let totalOrders = 0;

    snapshot.forEach((doc) => {

        const order = doc.data();

        totalOrders++;

        table.innerHTML += `

<tr>

<td>${escapeHtml(String(order.orderId || order.orderNumber || ''))}</td>

<td>${escapeHtml(String(order.productName))}</td>

<td>${escapeHtml(String(order.quantity))} kg</td>

<td>৳${Number(order.totalAmount || order.total || 0).toLocaleString()}</td>

<td>${escapeHtml(String(order.paymentMethod))}</td>

<td>
<span class="status-badge">
${escapeHtml(String(order.paymentStatus))}
</span>
</td>

<td>
<span class="status-badge ${safeClass(order.status)}">
${escapeHtml(friendlyStatus(order.status))}
</span>
</td>

<td>
<button
class="btn trackBtn"
data-status="${escapeHtml(String(order.status))}">
Track
</button>
<button
class="btn detailsBtn"
data-id="${escapeHtml(String(doc.id))}">

View

</button>
<button
class="btn reorderBtn"
data-product-id="${escapeHtml(String(order.productId || ""))}"
data-product-name="${escapeHtml(String(order.productName || ""))}"
data-qty="${escapeHtml(String(order.quantity || 1))}">

Reorder

</button>
</td>
</tr>

`;

    });

});

    }

    catch(error){

        console.error(error);

    }

})(); // async IIFE


// ======================================
// Tracking Timeline
// ======================================

document.addEventListener("click",(e)=>{

    if(!e.target.classList.contains("trackBtn")) return;

    const status =
    e.target.dataset.status;

    const steps = [

        "Pending",

        "Approved",

        "Packed",

        "Shipped",

        "Delivered"

    ];

    let html="";

    let active = true;

    steps.forEach(step=>{

        html += `

<div class="${
active
?
"timeline-active"
:
"timeline"
}">

${friendlyStatus(step)}

</div>

`;

        if(step===status){

            active=false;

        }

    });

    document.getElementById("trackingTimeline").innerHTML=html;

    document.getElementById("trackModal").style.display="block";

});



// ======================================
// Close Modal
// ======================================

window.closeTracking = ()=>{

document.getElementById("trackModal").style.display="none";

};
document.addEventListener("click",async(e)=>{
if(!e.target.classList.contains("detailsBtn")) return;

const id = e.target.dataset.id;

const orderSnap =
await getDoc(doc(db,"orders",id));

if(!orderSnap.exists()){

    alert("Order not found");

    return;

}

const order = orderSnap.data();
document.getElementById("orderDetails").innerHTML=`

<b>Order No:</b> ${escapeHtml(String(order.orderId || order.orderNumber || ''))}<br><br>

<b>Customer:</b> ${escapeHtml(String(order.customerName))}<br>

<b>Phone:</b> ${escapeHtml(String(order.phone))}<br><br>

<b>Product:</b> ${escapeHtml(String(order.productName))}<br>

<b>Quantity:</b> ${escapeHtml(String(order.quantity))} Kg<br>

<b>Price/Kg:</b> ৳${Number(order.pricePerKg || 0).toLocaleString()}<br>

<b>Total:</b> ৳${Number(order.totalAmount || order.total || 0).toLocaleString()}<br><br>

<b>Payment:</b> ${escapeHtml(String(order.paymentMethod))}<br>

<b>Payment Status:</b> ${escapeHtml(String(order.paymentStatus))}<br>

<b>Status:</b> ${escapeHtml(friendlyStatus(order.status))}<br><br>

<b>Address:</b><br>

${escapeHtml(String(order.fullAddress))}

`;

document.getElementById("detailsModal").style.display="block";

});

window.closeDetails=()=>{

document.getElementById("detailsModal").style.display="none";

};

// ======================================
// Reorder — add the last ordered product back to the cart
// ======================================

document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("reorderBtn")) return;

    const productId = e.target.dataset.productId;
    const fallbackName = e.target.dataset.productName || "Product";
    const qty = Number(e.target.dataset.qty) || 1;

    if (!productId) {
        alert("Product not found for reorder.");
        return;
    }

    try {
        const productSnap = await getDoc(doc(db, "products", productId));
        if (!productSnap.exists()) {
            alert("This product is no longer available.");
            return;
        }
        const product = productSnap.data();

        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existing = cart.find((item) => item.id === productId);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({
                id: productId,
                name: product.name || fallbackName,
                price: Number(product.retailPrice || 0),
                image: product.image || "",
                category: product.category || "",
                qty: qty
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));

        const badge = document.getElementById("cartCount");
        if (badge) {
            let total = 0;
            cart.forEach((item) => { total += Number(item.qty || 0); });
            badge.innerText = total;
        }

        window.location.href = "/cart.html";
    } catch (error) {
        console.error(error);
        alert("Failed to reorder. Please try again.");
    }
});

// ======================================
// Logout (used by the dashboard topbar)
// ======================================

window.customerLogout = async function () {
    try {
        await signOut(auth);
        alert("Logged Out Successfully");
        window.location.href = "/customer-login.html";
    } catch (error) {
        console.error(error);
        alert("Logout Failed");
    }
};