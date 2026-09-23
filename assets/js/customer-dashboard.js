// ======================================
// Customer Dashboard
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
getDocs

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




// ======================================
// Load Customer Dashboard
// ======================================


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

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

(async function() {

var user = await waitForAuthUser(5000);
if (!user) { window.location.href = "/customer-login.html"; return; }

    const uid = user.uid;




    try{


        // ==========================
        // Load Profile
        // ==========================


        const userSnap = await getDoc(doc(db, "users", uid));

if (!userSnap.exists()) {

    alert("User profile not found.");

    return;

}

const customer = userSnap.data();

const customerPhone = customer.phone || "";

document.getElementById("welcomeText").textContent =
"Welcome " + (customer.name || "Customer") + " 👋";

document.getElementById("profileName").innerText =
customer.name || "-";

document.getElementById("profileEmail").innerText =
customer.email || "-";

document.getElementById("profilePhone").innerText =
customer.phone || "-";

document.getElementById("profileAddress").innerText =
customer.address || "-";




        // ==========================
        // Load Orders
        // ==========================



        const orderQuery = query(

collection(db,"orders"),

where(
"phone",
"==",
customerPhone
)

);



        const orderSnap =
        await getDocs(orderQuery);





        const orderBody =
        document.getElementById(
            "customerOrdersBody"
        );



        let totalOrders = 0;

        let totalSpent = 0;

        let pending = 0;

        let delivered = 0;
        let selectedOrderStatus = "";




        orderBody.innerHTML="";



        orderSnap.forEach((doc)=>{


            const order =
            doc.data();



            totalOrders++;



           totalSpent +=
Number(order.total || 0);



            if(order.status==="Pending"){

                pending++;

            }



            if(order.status==="Delivered"){

                delivered++;

            }




          orderBody.innerHTML += `
<tr>

<td>
${escapeHtml(String(order.orderNumber))}
</td>

<td>
${escapeHtml(String(order.productName))}
</td>

<td>
${escapeHtml(String(order.quantity))} kg
</td>

<td>
৳${escapeHtml(String(order.total))}
</td>

<td>

<div class="order-actions">

<button
class="btn"
onclick="viewOrder('${doc.id}')">

Details

</button>

<button
class="btn"
onclick="trackOrder('${doc.id}')">

Track

</button>

<a
href="invoice.html?id=${doc.id}"
class="btn">

Invoice

</a>

</div>

</td>

</tr>
`;



        });






        // ==========================
        // Statistics
        // ==========================


        document.getElementById(
            "customerOrders"
        ).innerText =
        totalOrders;




        document.getElementById(
            "customerSpent"
        ).innerText =
        "৳"+totalSpent;




        document.getElementById(
            "pendingOrders"
        ).innerText =
        pending;




        document.getElementById(
            "deliveredOrders"
        ).innerText =
        delivered;




    }


    catch(error){


        console.error(error);


        alert(error.message);


    }

})(); // async IIFE




// ======================================
// View Order Details (H7: Server-Side Authorization)
// ======================================

window.viewOrder = async function(id){

    try{
        if (!auth.currentUser) {
            alert("Please log in.");
            return;
        }
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch("/api/track-order?id=" + encodeURIComponent(id), {
            method: "GET",
            headers: { "Authorization": "Bearer " + idToken },
        });
        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Order not found.");
            return;
        }

        const modal = document.getElementById("orderModal");
        const details = document.getElementById("orderDetails");
        if (!modal || !details) return;

        details.textContent = '';

        const frag = document.createDocumentFragment();

        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        const img = document.createElement('img');
        img.src = 'assets/images/default-product.png';
        orderItem.appendChild(img);

        const info = document.createElement('div');
        const h3 = document.createElement('h3');
        h3.textContent = data.productName || 'Product';
        info.appendChild(h3);

        const qtyP = document.createElement('p');
        qtyP.textContent = 'Quantity: ' + (data.quantity || 0) + ' kg';
        info.appendChild(qtyP);

        const priceP = document.createElement('p');
        priceP.textContent = 'Price: ৳' + (data.total || 0);
        info.appendChild(priceP);

        orderItem.appendChild(info);
        frag.appendChild(orderItem);

        frag.appendChild(document.createElement('hr'));

        function addInfoLine(parent, label, value) {
            const p = document.createElement('p');
            const b = document.createElement('b');
            b.textContent = label;
            p.appendChild(b);
            p.appendChild(document.createTextNode(value));
            parent.appendChild(p);
        }

        addInfoLine(frag, 'Order ID: ', data.orderNumber || id);
        addInfoLine(frag, 'Status: ', data.status || 'Pending');

        details.appendChild(frag);
        if (modal) modal.style.display="flex";

    }
    catch(error){
        console.error(error);
        alert("Failed to load order details");
    }

};



// ======================================
// Close Modal
// ======================================


var closeModalBtn = document.getElementById("closeModal");
if (closeModalBtn) {
    closeModalBtn.onclick = function(){
        var orderModal = document.getElementById("orderModal");
        if (orderModal) orderModal.style.display = "none";
    };
}



window.onclick=function(e){

    const modal =
    document.getElementById("orderModal");


    if(modal && e.target === modal){

        modal.style.display="none";

    }

};

// ======================================
// Track Order (H7: Server-Side Authorization)
// ======================================

window.trackOrder = async function(id){

    try {
        if (!auth.currentUser) {
            alert("Please log in.");
            return;
        }
        const idToken = await auth.currentUser.getIdToken();
        const response = await fetch("/api/track-order?id=" + encodeURIComponent(id), {
            method: "GET",
            headers: { "Authorization": "Bearer " + idToken },
        });
        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Order not found.");
            return;
        }

        document.getElementById("trackingBox").style.display="block";

        const steps=["Pending","Approved","Packed","Shipped","Delivered"];

        steps.forEach(step=>{
            const element=document.getElementById(step.toLowerCase()+"Step");
            if (!element) return;
            element.classList.remove("active");
            if(steps.indexOf(step)<=steps.indexOf(data.status)){
                element.classList.add("active");
            }
        });

        window.scrollTo({
            top:document.getElementById("trackingBox").offsetTop-80,
            behavior:"smooth"
        });

    } catch(error) {
        console.error(error);
    }

}

import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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

console.log(
"Customer Dashboard Loaded"
);
