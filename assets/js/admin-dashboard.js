console.log("admin-dashboard.js loaded");
import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    onSnapshot,
    where
}from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
// ==========================
// Dashboard Statistics
// ==========================

async function loadDashboard() {

    // Products
    const productSnap = await getDocs(collection(db, "products"));
    // ==========================
// Inventory Analytics
// ==========================

let totalStock = 0;

let inventoryValue = 0;

let outStock = 0;

let lowStock = 0;


productSnap.forEach((doc)=>{


const product = doc.data();


const stock =
Number(product.stock || 0);


const price =
Number(product.retailPrice || 0);



totalStock += stock;


inventoryValue += stock * price;



if(stock === 0){

outStock++;

}


else if(stock <= 50){

lowStock++;

}


});


document.getElementById("totalStock").innerText =
totalStock + " kg";


document.getElementById("inventoryValue").innerText =
"৳" + inventoryValue;


document.getElementById("outStock").innerText =
outStock;


document.getElementById("lowStock").innerText =
lowStock;

    document.getElementById("totalProducts").textContent =
        productSnap.size;
        const ordersSnap =
    await getDocs(collection(db, "orders"));
    // ==========================
// Order Status Analytics
// ==========================


let pending = 0;
let approved = 0;
let shipped = 0;
let delivered = 0;
let cancelled = 0;


ordersSnap.forEach((doc)=>{


const order = doc.data();


switch(order.status){


case "Pending":
pending++;
break;


case "Approved":
approved++;
break;


case "Shipped":
shipped++;
break;


case "Delivered":
delivered++;
break;


case "Cancelled":
cancelled++;
break;


}


});



document.getElementById("pendingOrders").innerText =
pending;


document.getElementById("approvedOrders").innerText =
approved;


document.getElementById("shippedOrders").innerText =
shipped;


document.getElementById("deliveredOrders").innerText =
delivered;


document.getElementById("cancelledOrders").innerText =
cancelled;




document.getElementById("activeOrders").innerText =
pending + approved + shipped;

document.getElementById("totalOrders").textContent =
    ordersSnap.size;
    // ==========================
// Order Status Analytics
// ==========================

let pendingOrders = 0;

let approvedOrders = 0;

let deliveredOrders = 0;

let cancelledOrders = 0;


ordersSnap.forEach((doc)=>{

const order = doc.data();


if(order.status === "Pending"){

pendingOrders++;

}


if(order.status === "Approved"){

approvedOrders++;

}


if(order.status === "Delivered"){

deliveredOrders++;

}


if(order.status === "Cancelled"){

cancelledOrders++;

}

});


document.getElementById("pendingOrders").innerText =
pendingOrders;


document.getElementById("approvedOrders").innerText =
approvedOrders;


document.getElementById("deliveredOrders").innerText =
deliveredOrders;


document.getElementById("cancelledOrders").innerText =
cancelledOrders;

    // Sales
    const salesSnap = await getDocs(collection(db, "sales"));
    // ==========================
// Best Selling Product
// ==========================

let productSales = {};


salesSnap.forEach((doc)=>{


const sale = doc.data();


const name =
sale.productName;


const qty =
Number(sale.quantity || 0);



if(productSales[name]){

productSales[name] += qty;

}

else{

productSales[name] = qty;

}


});



let bestProduct = "-";

let bestQty = 0;



for(let product in productSales){


if(productSales[product] > bestQty){

bestQty =
productSales[product];

bestProduct =
product;

}


}



document.getElementById("bestProduct").innerText =
bestProduct;


document.getElementById("bestProductQty").innerText =
bestQty + " kg";

    document.getElementById("totalSales").textContent =
        salesSnap.size;

    let revenue = 0;

    salesSnap.forEach((doc) => {

        revenue += Number(doc.data().totalPrice);

    });
    // ==========================
// Today / Monthly Statistics
// ==========================

const today = new Date();

let todaySales = 0;

let todayRevenue = 0;

let monthRevenue = 0;

let lastMonthRevenue = 0;

salesSnap.forEach((doc)=>{

const sale = doc.data();

if(!sale.createdAt) return;

const date = sale.createdAt.toDate();

if(

date.getDate()===today.getDate()

&&

date.getMonth()===today.getMonth()

&&

date.getFullYear()===today.getFullYear()

){

todaySales++;

todayRevenue += Number(sale.totalPrice);

}

if(

date.getMonth()===today.getMonth()

){

monthRevenue += Number(sale.totalPrice);

}

if(

date.getMonth()===today.getMonth()-1

){

lastMonthRevenue += Number(sale.totalPrice);

}

});

document.getElementById("todaySales").innerText = todaySales;

document.getElementById("todayRevenue").innerText = "৳"+todayRevenue;

document.getElementById("monthRevenue").innerText = "৳"+monthRevenue;

let growth = 0;

if(lastMonthRevenue>0){

growth =

((monthRevenue-lastMonthRevenue)

/

lastMonthRevenue

*100)

.toFixed(1);

}

document.getElementById("growthRate").innerText = growth+"%";



    document.getElementById("totalRevenue").textContent =
        "৳" + revenue;
        // ==========================
// Low Stock Products
// ==========================

const lowStockBody =
    document.getElementById("lowStockBody");

if (lowStockBody) {

    lowStockBody.innerHTML = "";

    productSnap.forEach((doc) => {

        const product = doc.data();

        if (product.stock <= 50) {

            lowStockBody.innerHTML += `

<tr>

<td>${product.name}</td>

<td>${product.stock} kg</td>

<td>

${
product.stock == 0
? "🔴 Out of Stock"
: "🟡 Low Stock"
}

</td>

</tr>

`;

        }

    });

}

document.getElementById("todayRevenueBanner").innerText = "৳" + todayRevenue;

document.getElementById("todayOrderBanner").innerText = pending + approved + shipped + delivered;

document.getElementById("todaySaleBanner").innerText = todaySales;
}

loadDashboard();

// ==========================
// Recent Products
// ==========================


async function loadRecentProducts(){


const snap = await getDocs(
    collection(db,"products")
);


const body =
document.getElementById("recentProductsBody");


if(!body) return;


body.innerHTML="";


let count = 0;


snap.forEach((doc)=>{


if(count >= 5) return;


const product = doc.data();



body.innerHTML += `


<tr>


<td>

<img 
src="${product.image || 'assets/images/logo/logo.png'}"

width="50"

height="50"

style="
border-radius:10px;
object-fit:cover;
">

</td>


<td>

<strong>
${product.name}
</strong>

</td>



<td>

৳${product.retailPrice}

</td>



<td>

${product.stock} kg

</td>



<td>

<span class="status-active">

🟢 Available

</span>


</td>


<td>


<button class="view-btn">

View

</button>


</td>


</tr>


`;


count++;


});


}


loadRecentProducts();
// ==========================
// Website Views
// ==========================


const viewsSnap =
await getDocs(collection(db,"websiteStats"));


let views = 0;


viewsSnap.forEach((doc)=>{

if(doc.id==="views"){

views =
doc.data().count || 0;

}

});


document.getElementById("totalViews").innerText =
views;

// ==========================
// Realtime Notifications
// ==========================

function loadNotifications(){

    const notificationList =
    document.getElementById("notificationList");

    const notificationCount =
    document.getElementById("notificationCount");

    if(!notificationList) return;

    const q = query(

        collection(db,"notifications"),

        orderBy("createdAt","desc"),

        limit(10)

    );

    onSnapshot(q,(snapshot)=>{

        notificationList.innerHTML="";

        notificationCount.innerText =
        snapshot.size;

        if(snapshot.empty){

            notificationList.innerHTML=`

<p>No Notifications</p>

`;

            return;

        }

        snapshot.forEach((doc)=>{

            const data = doc.data();

            notificationList.innerHTML += `

<div class="notification-item">

<strong>${data.title}</strong>

<br>

${data.message}

</div>

`;

        });

    });

}

loadNotifications();
const notificationBtn =
document.getElementById("notificationBtn");

const notificationPanel =
document.getElementById("notificationPanel");

if(notificationBtn){

notificationBtn.onclick=()=>{

notificationPanel.style.display=

notificationPanel.style.display==="block"

?

"none"

:

"block";

};

}
document.addEventListener("click",(e)=>{

const panel =
document.getElementById("notificationPanel");

const btn =
document.getElementById("notificationBtn");

if(!panel || !btn) return;

if(

!panel.contains(e.target)

&&

!btn.contains(e.target)

){

panel.style.display="none";

}

});
// ==========================
// Sales Chart
// ==========================

async function loadSalesChart(){

const salesSnap =
await getDocs(collection(db,"sales"));

const monthly = [

0,0,0,0,0,0,

0,0,0,0,0,0

];

salesSnap.forEach((doc)=>{

const sale = doc.data();

if(!sale.createdAt) return;

const date =
sale.createdAt.toDate();

const month =
date.getMonth();

monthly[month] +=
Number(sale.totalPrice);

});

new Chart(

document.getElementById("salesChart"),

{

type:"bar",

data:{

labels:[

"Jan","Feb","Mar","Apr",

"May","Jun","Jul","Aug",

"Sep","Oct","Nov","Dec"

],

datasets:[{

label:"Revenue",

data:monthly,

borderWidth:2

}]

},

options:{

responsive:true,

plugins:{

legend:{

display:true

}

}

}

}

);

}

loadSalesChart();
async function loadRecentActivities(){

    const activityList = document.getElementById("activityList");

    if(!activityList) return;

    activityList.innerHTML = "";

    const orders = await getDocs(query(
        collection(db,"orders"),
        orderBy("createdAt","desc"),
        limit(5)
    ));

    orders.forEach(doc=>{

        const order = doc.data();

        activityList.innerHTML += `

        <div class="activity-item">

            <div class="activity-icon">📦</div>

            <div class="activity-content">

                <strong>
                    New Order from ${order.customerName || "Customer"}
                </strong>

                <small>
                    ${order.status}
                </small>

            </div>

        </div>

        `;

    });

}

loadRecentActivities();
/* =========================
   QUICK ACTIONS
========================= */

const addProductBtn = document.getElementById("addProductBtn");
const addSaleBtn = document.getElementById("addSaleBtn");
const ordersBtn = document.getElementById("ordersBtn");
const usersBtn = document.getElementById("usersBtn");
const reportsBtn = document.getElementById("reportsBtn");

if(addProductBtn){

    addProductBtn.onclick = () => {

        window.location.href = "/admin-products.html";

    };

}

if(addSaleBtn){

    addSaleBtn.onclick = () => {

        window.location.href = "/admin-sales.html";

    };

}

if(ordersBtn){

    ordersBtn.onclick = () => {

        window.location.href = "/admin-orders.html";

    };

}

if(usersBtn){

    usersBtn.onclick = () => {

        window.location.href = "/admin-users.html";

    };

}

if(reportsBtn){

    reportsBtn.onclick = () => {

        window.location.href = "/admin-reports.html";

    };

}

// ==========================
// Quick Action Buttons
// ==========================

document.getElementById("addProductBtn")?.addEventListener("click", () => {
    window.location.href = "/admin-products.html";
});

document.getElementById("addSaleBtn")?.addEventListener("click", () => {
    window.location.href = "/admin-sales.html";
});

document.getElementById("ordersBtn")?.addEventListener("click", () => {
    window.location.href = "/admin-orders.html";
});

document.getElementById("usersBtn")?.addEventListener("click", () => {
    window.location.href = "/admin-users.html";
});

document.getElementById("reportsBtn")?.addEventListener("click", () => {
    alert("Reports page is under development.");
    // পরে এটা হবে:
    // window.location.href = "/admin-reports.html";
});
// ==========================
// QUICK ACTION BUTTONS
// ==========================

window.addEventListener("DOMContentLoaded", () => {

    document.getElementById("addProductBtn")?.addEventListener("click", () => {
        window.location.href = "/admin-products.html";
    });

    document.getElementById("addSaleBtn")?.addEventListener("click", () => {
        window.location.href = "/admin-sales.html";
    });

    document.getElementById("ordersBtn")?.addEventListener("click", () => {
        window.location.href = "/admin-orders.html";
    });

    document.getElementById("usersBtn")?.addEventListener("click", () => {
        window.location.href = "/admin-users.html";
    });

    document.getElementById("reportsBtn")?.addEventListener("click", () => {
        alert("Reports Page Coming Soon");
    });

});