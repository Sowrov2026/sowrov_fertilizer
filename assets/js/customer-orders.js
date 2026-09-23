console.log("customer-orders.js Loaded");
// ======================================
// Customer Orders
// Sowrov Fertilizer
// ======================================

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
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
${escapeHtml(String(order.status))}
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

${step}

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

<b>Status:</b> ${escapeHtml(String(order.status))}<br><br>

<b>Address:</b><br>

${escapeHtml(String(order.fullAddress))}

`;

document.getElementById("detailsModal").style.display="block";

});

window.closeDetails=()=>{

document.getElementById("detailsModal").style.display="none";

};