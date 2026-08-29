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

onAuthStateChanged(auth, async(user)=>{

    if(!user){
        // Check localStorage for customer session as fallback
        const saved = localStorage.getItem('sf_customer_session');
        if (saved) {
            const savedSession = JSON.parse(saved);
            // Use saved UID to load orders
            try {
                const q = query(collection(db, "orders"), where("userId", "==", savedSession.uid));
                console.log("Logged User UID (fallback):", savedSession.uid);
                onSnapshot(q, (snapshot) => {
                    console.log("Total Orders:", snapshot.size);
                    table.innerHTML = "";
                    snapshot.forEach((doc) => {
                        const order = doc.data();
                        table.innerHTML += `
<tr>
<td>${order.orderId}</td>
<td>${order.productName}</td>
<td>${order.quantity} kg</td>
<td>৳${Number(order.totalAmount).toLocaleString()}</td>
<td>${order.paymentMethod}</td>
<td><span class="status-badge">${order.paymentStatus}</span></td>
<td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
<td>
<button class="btn trackBtn" data-status="${order.status}">Track</button>
<button class="btn detailsBtn" data-id="${doc.id}">View</button>
</td>
</tr>
`;
                    });
                });
            } catch (error) {
                console.error(error);
            }
            return;
        }
        window.location.href = "/customer-login.html";
        return;
    }

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

<td>${order.orderId}</td>

<td>${order.productName}</td>

<td>${order.quantity} kg</td>

<td>৳${Number(order.totalAmount).toLocaleString()}</td>

<td>${order.paymentMethod}</td>

<td>
<span class="status-badge">
${order.paymentStatus}
</span>
</td>

<td>
<span class="status-badge ${order.status.toLowerCase()}">
${order.status}
</span>
</td>

<td>
<button
class="btn trackBtn"
data-status="${order.status}">
Track
</button>
<button
class="btn detailsBtn"
data-id="${doc.id}">

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

});



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

<b>Order No:</b> ${order.orderId}<br><br>

<b>Customer:</b> ${order.customerName}<br>

<b>Phone:</b> ${order.phone}<br><br>

<b>Product:</b> ${order.productName}<br>

<b>Quantity:</b> ${order.quantity} Kg<br>

<b>Price/Kg:</b> ৳${Number(order.pricePerKg).toLocaleString()}<br>

<b>Total:</b> ৳${Number(order.totalAmount).toLocaleString()}<br><br>

<b>Payment:</b> ${order.paymentMethod}<br>

<b>Payment Status:</b> ${order.paymentStatus}<br>

<b>Status:</b> ${order.status}<br><br>

<b>Address:</b><br>

${order.fullAddress}

`;

document.getElementById("detailsModal").style.display="block";

});

window.closeDetails=()=>{

document.getElementById("detailsModal").style.display="none";

};