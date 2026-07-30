// ======================================
// Invoice System
// Sowrov Fertilizer
// ======================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================================
// Get Order ID From URL
// ======================================

const params = new URLSearchParams(window.location.search);

const orderId = params.get("id");

if (!orderId) {

    alert("Invoice not found.");

    window.location.href = "orders.html";

}

// ======================================
// Load Invoice
// ======================================

async function loadInvoice() {

    try {
        // ===============================
// Load Company Information
// ===============================

const settingsSnap =
await getDocs(collection(db,"settings"));

settingsSnap.forEach((setting)=>{

const data = setting.data();

document.getElementById("companyAddress").innerText =
data.address || "Maheshkhali, Cox's Bazar";

document.getElementById("companyPhone").innerText =
data.phone || "-";

document.getElementById("companyEmail").innerText =
data.email || "-";

});

        const snap = await getDoc(

            doc(db, "orders", orderId)

        );

        if (!snap.exists()) {

            alert("Invoice not found.");

            return;

        }

        const order = snap.data();
        document.getElementById("verifyInvoiceId").innerText =
"Invoice ID : " + (order.orderNumber || orderId);

document.getElementById("qrcode").innerHTML = "";

new QRCode(
    document.getElementById("qrcode"),
    {
        text: window.location.href,
        width: 120,
        height: 120
    }
);
        

        document.getElementById("invoiceNumber").innerText =
            order.orderNumber || orderId;

        document.getElementById("customerName").innerText =
            order.customerName || "-";

        document.getElementById("customerPhone").innerText =
            order.phone || "-";

        document.getElementById("customerAddress").innerText =
            order.address || "-";

   const statusElement =
document.getElementById("paymentStatus");

statusElement.innerText =
order.status || "Pending";

statusElement.className =
"status-badge";

switch(order.status){

case "Pending":

statusElement.classList.add("status-pending");

break;

case "Approved":

statusElement.classList.add("status-approved");

break;

case "Packed":

statusElement.classList.add("status-packed");

break;

case "Shipped":

statusElement.classList.add("status-shipped");

break;

case "Delivered":

statusElement.classList.add("status-delivered");

break;

case "Cancelled":

statusElement.classList.add("status-cancelled");

break;

default:

statusElement.classList.add("status-pending");

}
document.getElementById("paymentMethod").innerText =
order.paymentMethod || "Cash On Delivery";

document.getElementById("invoiceDate").innerText =
order.createdAt
? order.createdAt.toDate().toLocaleString()
: "-";

document.getElementById("invoiceProductBody").innerHTML = `


<tr>

<td>

<img
src="${order.productImage || 'assets/images/default-product.png'}"
style="width:70px;height:70px;object-fit:cover;border-radius:8px;">

</td>

<td>

${order.productName}

</td>

<td>

৳${order.total / order.quantity}

</td>

<td>

${order.quantity} kg

</td>

<td>

৳${order.total}

</td>

</tr>

`;
document.getElementById("subTotal").innerText =
"৳" + (order.total || 0);

const subtotal = order.total || 0;
const delivery = order.deliveryCharge || 0;
const discount = order.discount || 0;

const grandTotal = subtotal + delivery - discount;

document.getElementById("subTotal").innerText = "৳" + subtotal;
document.getElementById("grandTotal").innerText = "৳" + grandTotal;
  document.getElementById("deliveryCharge").innerText =
"৳" + (order.deliveryCharge || 0);

document.getElementById("discountAmount").innerText =
"৳" + (order.discount || 0);          

    }

    catch (error) {

        console.error(error);

        alert("Failed to load invoice.");

    }

}

loadInvoice();

// ======================================
// Print
// ======================================

document.getElementById("printBtn")

.addEventListener("click", () => {

    window.print();

});

// ======================================
// Download PDF
// ======================================

document.getElementById("downloadBtn")

.addEventListener("click", () => {

    const invoice = document.getElementById("invoice");

    const options = {

        margin: 0.5,

        filename: "Invoice-" + orderId + ".pdf",

        image: {

            type: "jpeg",

            quality: 1

        },

        html2canvas: {

            scale: 2

        },

        jsPDF: {

            unit: "in",

            format: "a4",

            orientation: "portrait"

        }

    };

    html2pdf()

        .set(options)

        .from(invoice)

        .save();

});

console.log("Invoice Loaded");