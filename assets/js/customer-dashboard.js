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


onAuthStateChanged(auth, async(user)=>{


    if(!user){


        window.location.href =
        "customer-login.html";


        return;


    }



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

document.getElementById("welcomeText").innerHTML =
`Welcome ${customer.name || "Customer"} 👋`;

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
${order.orderNumber}
</td>

<td>
${order.productName}
</td>

<td>
${order.quantity} kg
</td>

<td>
৳${order.total}
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



});




// ======================================
// View Order Details
// ======================================

window.viewOrder = async function(id){

    try{

        const snap = await getDoc(
            doc(db,"orders",id)
        );


        if(!snap.exists()){

            alert("Order not found");

            return;

        }


        const order = snap.data();


        const modal =
        document.getElementById("orderModal");


        const details =
        document.getElementById("orderDetails");



        details.innerHTML = `

        <div class="order-item">

            <img 
            src="${order.productImage || 'assets/images/default-product.png'}">

            <div>

                <h3>
                ${order.productName || "Product"}
                </h3>

                <p>
                Quantity:
                ${order.quantity || 0} kg
                </p>

                <p>
                Price:
                ৳${order.total || 0}
                </p>

            </div>

        </div>


        <hr>


        <p>
        <b>Order ID:</b>
        ${order.orderNumber || id}
        </p>


        <p>
        <b>Status:</b>
        ${order.status || "Pending"}
        </p>


        <p>
        <b>Customer Name:</b>
        ${order.name || "-"}
        </p>


        <p>
        <b>Phone:</b>
        ${order.phone || "-"}
        </p>


        <p>
        <b>Address:</b>
        ${order.address || "-"}
        </p>


        `;


        modal.style.display="block";


    }

    catch(error){

        console.error(error);

        alert("Failed to load order details");

    }

};



// ======================================
// Close Modal
// ======================================


document.getElementById("closeModal")
.onclick=function(){

    document.getElementById("orderModal")
    .style.display="none";

};



window.onclick=function(e){

    const modal =
    document.getElementById("orderModal");


    if(e.target === modal){

        modal.style.display="none";

    }

};
console.log(
"Customer Dashboard Loaded"
);
window.trackOrder = async function(id){


const snap =
await getDoc(
doc(db,"orders",id)
);


if(!snap.exists()) return;


const order =
snap.data();


// window.trackOrder = ...document.getElementById("trackingBox").style.display="block";



const steps = [

"Pending",
"Approved",
"Packed",
"Shipped",
"Delivered"

];


steps.forEach(step=>{


const element =
document.getElementById(
step.toLowerCase()+"Step"
);



element.classList.remove("active");



if(
steps.indexOf(step)
<=
steps.indexOf(order.status)
)

{

element.classList.add("active");

}


});


}
window.trackOrder = async function(id){

const snap = await getDoc(doc(db,"orders",id));

if(!snap.exists()) return;

const order = snap.data();

document.getElementById("trackingBox").style.display="block";

const steps=[

"Pending",

"Approved",

"Packed",

"Shipped",

"Delivered"

];

steps.forEach(step=>{

const element=document.getElementById(step.toLowerCase()+"Step");

element.classList.remove("active");

if(

steps.indexOf(step)<=steps.indexOf(order.status)

){

element.classList.add("active");

}

});

window.scrollTo({

top:document.getElementById("trackingBox").offsetTop-80,

behavior:"smooth"

});

}
import {
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

window.customerLogout = async function () {

    try {

        await signOut(auth);

        alert("Logged Out Successfully");

        window.location.href = "customer-login.html";

    } catch (error) {

        console.error(error);

        alert("Logout Failed");

    }

};
