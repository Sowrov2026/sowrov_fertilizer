import { db } from "./firebase.js";

import {

collection,

getDocs

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const btn =
document.getElementById("trackBtn");

const result =
document.getElementById("trackingResult");

btn.addEventListener("click", async () => {

const id =
document.getElementById("trackOrderId").value.trim();

if (!id) {

alert("Enter Order ID");

return;

}

const snapshot =
await getDocs(collection(db, "orders"));

let found = false;

snapshot.forEach((doc) => {

const order = doc.data();

if (order.orderId === id) {

found = true;

result.innerHTML = `

<h3>Order Found</h3>

<p><b>Customer:</b>

${order.customerName}</p>

<p><b>Product:</b>

${order.productName}</p>

<p><b>Quantity:</b>

${order.quantity} kg</p>

<p><b>Total:</b>

৳${order.totalAmount}</p>

<p><b>Status:</b>

${order.status}</p>

`;

}

});

if (!found) {

result.innerHTML =

"<h3>Order Not Found</h3>";

}

});