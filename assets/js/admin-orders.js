import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    serverTimestamp,
    doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// ==========================
// Elements
// ==========================
const orderSearch =
document.getElementById("orderSearch");

const statusFilter =
document.getElementById("statusFilter");
const exportOrdersBtn =
document.getElementById("exportOrdersBtn");
const downloadPdfBtn =
    document.getElementById("downloadPdfBtn");
const printInvoiceBtn =
    document.getElementById("printInvoiceBtn");

const tableBody = document.getElementById("ordersTableBody");
let allOrders = [];
// ======================================
// ORDER STATUS
// ======================================

const ORDER_STATUS = {

    PENDING: "Pending",

    APPROVED: "Approved",

    PACKED: "Packed",

    SHIPPED: "Shipped",

    DELIVERED: "Delivered",

    CANCELLED: "Cancelled"

};

// ======================================
// PAYMENT STATUS
// ======================================

const PAYMENT_STATUS = {

    UNPAID: "Unpaid",

    PAID: "Paid"

};
// ======================================
// UPDATE ORDER STATUS
// ======================================

async function updateOrderStatus(orderId,status){

    await updateDoc(

        doc(db,"orders",orderId),

        {

            status:status

        }

    );

}
// ======================================
// PAYMENT APPROVAL
// ======================================

async function approvePayment(orderId){

    await updateDoc(

        doc(db,"orders",orderId),

        {

            paymentStatus:

            PAYMENT_STATUS.PAID

        }

    );

}
// ======================================
// CUSTOMER NOTIFICATION
// ======================================

async function sendNotification(

    userId,

    title,

    message

){

    await addDoc(

        collection(db,"notifications"),

        {

            userId,

            title,

            message,

            read:false,

            createdAt:

            serverTimestamp()

        }

    );

}
// ======================================
// SALES ENTRY
// ======================================

async function createSale(order){

    await addDoc(

        collection(db,"sales"),

        {

            customerName:

            order.customerName,

            phone:

            order.phone,

            productId:

            order.productId,

            productName:

            order.productName,

            quantity:

            order.quantity,

            totalPrice:

            order.totalAmount,

            paymentMethod:

            order.paymentMethod,

            paymentStatus:

            order.paymentStatus,

            createdAt:

            serverTimestamp()

        }

    );

}
// ======================================
// STOCK UPDATE
// ======================================

async function reduceStock(order){

    const productRef =

    doc(

        db,

        "products",

        order.productId

    );

    const productSnap =

    await getDoc(productRef);

    if(!productSnap.exists()){

        throw new Error(

            "Product Not Found"

        );

    }

    const product =

    productSnap.data();

    const newStock =

        product.stock -

        Number(order.quantity);

    if(newStock<0){

        throw new Error(

            "Not Enough Stock"

        );

    }

    await updateDoc(

        productRef,

        {

            stock:newStock

        }

    );

}
// ======================================
// PROCESS ORDER
// ======================================

async function processOrder(orderId,newStatus){

    const orderRef = doc(db,"orders",orderId);

    const orderSnap = await getDoc(orderRef);

    if(!orderSnap.exists()){

        alert("Order Not Found");

        return;

    }

    const order = orderSnap.data();

    // COD ছাড়া Payment না হলে এগোবে না

    if(

        order.paymentMethod!="COD"

        &&

        order.paymentStatus!="Paid"

    ){

        alert("Payment Not Approved");

        return;

    }

    // Already Delivered

    if(order.status==="Delivered"){

        alert("Already Delivered");

        return;

    }

    // Status Update

    await updateOrderStatus(

        orderId,

        newStatus

    );

    // Only Delivered

    if(newStatus==="Delivered"){

        await reduceStock(order);

        await createSale(order);

    }

    await sendNotification(

        order.customerUid || "",

        "Order Updated",

        `Your Order ${order.orderId} is now ${newStatus}`

    );

    alert("✅ Order Updated");

    loadOrders();

}

// ==========================
// Load Orders
// ==========================

async function loadOrders() {

    try {

        tableBody.innerHTML = "";

        const querySnapshot =
            await getDocs(collection(db, "orders"));
            allOrders = [];

querySnapshot.forEach((doc)=>{

allOrders.push({

id:doc.id,

...doc.data()

});

});


displayOrders(allOrders);

        querySnapshot.forEach((orderDoc) => {

            const order = orderDoc.data();

            tableBody.innerHTML += `

<tr>

<td>${order.orderId || "-"}</td>

<td>${order.customerName}</td>

<td>${order.phone}</td>

<td>${order.productName}</td>

<td>${order.orderType}</td>

<td>${order.quantity} kg</td>

<td>৳${order.totalAmount}</td>
<td>

${order.paymentMethod || "-"}

</td>

<td>

${order.paymentStatus || "-"}

</td>
<td>${order.status}</td>
<td>

<td>

<select
class="status-select"
data-id="${orderDoc.id}">

<option value="Pending"
${order.status=="Pending"?"selected":""}>

Pending

</option>

<option value="Approved"
${order.status=="Approved"?"selected":""}>

Approved

</option>

<option value="Packed"
${order.status=="Packed"?"selected":""}>

Packed

</option>

<option value="Shipped"
${order.status=="Shipped"?"selected":""}>

Shipped

</option>

<option value="Delivered"
${order.status=="Delivered"?"selected":""}>

Delivered

</option>

<option value="Cancelled"
${order.status=="Cancelled"?"selected":""}>

Cancelled

</option>

</select>

</td>

</td>

<td>

<button
class="view-btn"
data-id="${orderDoc.id}">

View

</button>

${
order.status==="Pending"

?

`<button
class="approve-btn"
data-id="${orderDoc.id}">

Approve

</button>`

:

`<button disabled>

Approved

</button>`

}
<button
class="payment-btn"
data-id="${orderDoc.id}">

Approve Payment

</button>

<button
class="delete-btn"
data-id="${orderDoc.id}">

Delete

</button>



</td>
</tr>

`;

        });

    }

    catch(error){

        console.error(error);

    }

}

loadOrders();
function displayOrders(orders){

tableBody.innerHTML="";


orders.forEach(order=>{


tableBody.innerHTML += `

<tr>

<td>${order.orderId}</td>

<td>${order.customerName}</td>

<td>${order.productName}</td>

<td>${order.quantity} kg</td>

<td>৳${order.totalAmount}</td>

<td>${order.paymentMethod}</td>

<td>${order.paymentStatus}</td>

<td>${order.status}</td>

<td>

<button
class="view-btn"
data-id="${order.id}">

View

</button>


<select
class="status-select"
data-id="${order.id}">

<option>${order.status}</option>

</select>


</td>

</tr>

`;

});

}

// ======================================
// Approve Order
// ======================================
document.addEventListener("click",async(e)=>{

    if(

        !e.target.classList.contains(

            "approve-btn"

        )

    ) return;

    await processOrder(

        e.target.dataset.id,

        ORDER_STATUS.APPROVED

    );

});

// ==========================
// Delete Order
// ==========================

document.addEventListener("click",async(e)=>{

if(!e.target.classList.contains("delete-btn")) return;

const id=e.target.dataset.id;

if(!confirm("Delete this order?")) return;

await deleteDoc(doc(db,"orders",id));

alert("Order Deleted");

loadOrders();

});

function getStatusClass(status){

    switch(status){

        case "Approved":
            return "active-status";

        case "Delivered":
            return "active-status";

        case "Cancelled":
            return "inactive-status";

        default:
            return "pending-status";

    }

}
window.closeOrderModal = function(){

document.getElementById("orderModal").style.display="none";

}
// ======================================
// Approve Payment
// ======================================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("payment-btn"))

        return;

    const id = e.target.dataset.id;

    try {

        document.addEventListener(

"change",

async(e)=>{

if(

!e.target.classList.contains(

"status-select"

)

) return;

await processOrder(

e.target.dataset.id,

e.target.value

);

});

        alert("Payment Approved");

        loadOrders();

    }

    catch (error) {

        console.error(error);

    }

});

// ======================================
// View Order Details
// ======================================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("view-btn")) return;

    const id = e.target.dataset.id;

    try {

        const orderSnap = await getDoc(doc(db, "orders", id));

        if (!orderSnap.exists()) {

            alert("Order not found");

            return;

        }

        const order = orderSnap.data();

        document.getElementById("orderDetails").innerHTML = `
        

<p><b>Order ID:</b> ${order.orderId}</p>

<p><b>Customer:</b> ${order.customerName}</p>

<p><b>Phone:</b> ${order.phone}</p>

<p><b>Product:</b> ${order.productName}</p>

<p><b>Order Type:</b> ${order.orderType}</p>

<p><b>Quantity:</b> ${order.quantity} kg</p>

<p><b>Price / kg:</b> ৳${order.pricePerKg}</p>

<p><b>Total:</b> ৳${order.totalAmount}</p>

<p><b>Status:</b> ${order.status}</p>
<p><b>Payment Method:</b> ${order.paymentMethod}</p>

<p><b>Payment Status :</b>

<span style="color:${order.paymentStatus==="Paid" ? "green" : "red"}; font-weight:bold;">

${order.paymentStatus}

</span>

</p>

${order.paymentStatus}

</span>

</p>
<p><b>Delivery Address:</b></p>

<p>

${order.fullAddress}

</p>

`;
downloadPdfBtn.onclick = () => {

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    pdf.setFontSize(20);
    pdf.text("Sowrov Fertilizer", 20, 20);

    pdf.setFontSize(14);
    pdf.text("Order Invoice", 20, 32);

    pdf.setFontSize(11);

    let y = 50;

    const rows = [

        ["Order ID", order.orderId],

        ["Customer", order.customerName],

        ["Phone", order.phone],

        ["Product", order.productName],

        ["Order Type", order.orderType],

        ["Quantity", order.quantity + " kg"],

        ["Price / kg", "৳" + order.pricePerKg],

        ["Total", "৳" + order.totalAmount],

        ["Status", order.status],

        ["Division", order.division],

        ["District", order.district],

        ["Upazila", order.upazila],

        ["Union", order.union],

        ["Village", order.village],

        ["Post Office", order.postOffice],

        ["House", order.house]

    ];

    rows.forEach(item => {

        pdf.text(item[0] + " :", 20, y);

        pdf.text(String(item[1]), 70, y);

        y += 10;

    });

    pdf.save(order.orderId + ".pdf");

};
printInvoiceBtn.onclick = () => {

    const invoiceWindow =
        window.open("", "_blank");

    invoiceWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

<title>Invoice</title>

<style>

body{

font-family:Arial;

padding:40px;

}

h1{

text-align:center;

color:#2e7d32;

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

td{

padding:10px;

border:1px solid #ccc;

}

.footer{

margin-top:40px;

text-align:center;

color:gray;

}

</style>

</head>

<body>

<h1>Sowrov Fertilizer</h1>

<h3 style="text-align:center">

Order Invoice

</h3>

<table>

<tr>

<td>Order ID</td>

<td>${order.orderId}</td>

</tr>

<tr>

<td>Customer</td>

<td>${order.customerName}</td>

</tr>

<tr>

<td>Phone</td>

<td>${order.phone}</td>

</tr>

<tr>

<td>Product</td>

<td>${order.productName}</td>

</tr>

<tr>

<td>Order Type</td>

<td>${order.orderType}</td>

</tr>

<tr>

<td>Quantity</td>

<td>${order.quantity} kg</td>

</tr>

<tr>

<td>Price / kg</td>

<td>৳${order.pricePerKg}</td>

</tr>

<tr>

<td>Total</td>

<td>৳${order.totalAmount}</td>

</tr>

<tr>

<td>Status</td>

<td>${order.status}</td>

</tr>

<tr>

<td>Address</td>

<td>

${order.fullAddress}

</td>

</tr>

</table>

<div class="footer">

Generated by Sowrov Fertilizer ERP

</div>

</body>

</html>

`);

    invoiceWindow.document.close();

    invoiceWindow.print();

};

        document.getElementById("orderModal").style.display = "block";

    }

    catch (error) {

        console.error(error);

    }

});

document.addEventListener("change", async (e) => {

    if (!e.target.classList.contains("status-select")) return;
    console.log("View Button Clicked");

    const id = e.target.dataset.id;

    const status = e.target.value;
    const orderSnap = await getDoc(doc(db, "orders", id));

const order = orderSnap.data();

    try {

        await updateDoc(doc(db, "orders", id), {

            status: status

        });
        await addDoc(
collection(db,"notifications"),
{
    userId: order.customerUid || "",

    title:"Order Status Updated",

    message:
    `Your order ${order.orderId} is now ${status}`,

    read:false,

    createdAt:serverTimestamp()
}
);

        alert("✅ Status Updated");

        loadOrders();

    }

    catch (error) {

        console.error(error);


    }

});// ======================================
// Export Orders to Excel
// ======================================

exportOrdersBtn.addEventListener("click", async () => {

    try {

        const snapshot =
            await getDocs(collection(db, "orders"));

        const data = [];

        snapshot.forEach((doc) => {

            const order = doc.data();

            data.push({

                "Order ID": order.orderId,

                "Customer": order.customerName,

                "Phone": order.phone,

                "Product": order.productName,

                "Order Type": order.orderType,

                "Quantity (kg)": order.quantity,

                "Price / kg": order.pricePerKg,

                "Total": order.totalAmount,

                "Division": order.division,

                "District": order.district,

                "Upazila": order.upazila,

                "Union": order.union,

                "Village": order.village,

                "Post Office": order.postOffice,

                "House": order.house,

                "Payment Method": order.paymentMethod,

"Payment Status": order.paymentStatus,

"Transaction ID": order.transactionId,
                "Status": order.status

            });

        });

        const worksheet =
            XLSX.utils.json_to_sheet(data);

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            "Orders"

        );

        XLSX.writeFile(

            workbook,

            "Sowrov-Fertilizer-Orders.xlsx"

        );

    }

    catch (error) {

        console.error(error);

        alert("Export Failed");

    }

});
function filterOrders(){

const search =
orderSearch.value.toLowerCase();


const status =
statusFilter.value;


const filtered =
allOrders.filter(order=>{


const matchSearch =

order.orderId.toLowerCase().includes(search)

||

order.customerName.toLowerCase().includes(search)

||

order.phone.includes(search)

||

order.productName.toLowerCase().includes(search);



const matchStatus =

status==="All"

||

order.status===status;



return matchSearch && matchStatus;


});


displayOrders(filtered);

}


orderSearch.addEventListener(
"input",
filterOrders
);


statusFilter.addEventListener(
"change",
filterOrders
);