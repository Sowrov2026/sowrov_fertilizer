// ======================================
// Order System
// Sowrov Fertilizer
// ======================================

import { db, auth } from "./firebase.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================================
// Variables
// ======================================

let divisionsData = [];
let districtsData = [];
let upazilasData = [];
let unionsData = [];
let villagesData = [];
let postOfficesData = [];
let currentUser = null;
let currentStock = 0;

// ======================================
// Elements
// ======================================
const paymentMethod =
    document.getElementById("paymentMethod");
const orderForm = document.getElementById("orderForm");

const customerName = document.getElementById("customerName");
const phone = document.getElementById("phone");

const division = document.getElementById("division");
const district = document.getElementById("district");
const upazila = document.getElementById("upazila");
const union = document.getElementById("union");
const village = document.getElementById("village");
const postOffice = document.getElementById("postOffice");
const house = document.getElementById("house");

const productSelect = document.getElementById("productSelect");
const orderType = document.getElementById("orderType");
const quantity = document.getElementById("quantity");

const pricePerKg = document.getElementById("pricePerKg");
const totalAmount = document.getElementById("totalAmount");


const onlinePaymentBox =
document.getElementById("onlinePaymentBox");

const paymentNumber =
document.getElementById("paymentNumber");

const transactionId =
document.getElementById("transactionId");
const stockInfo = document.getElementById("stockInfo");

// ======================================
// Auto Login
// ======================================

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href = "/customer-login.html";

        return;

    }

    currentUser=user;

    try{

        const snap=
        await getDoc(doc(db,"users",user.uid));

        if(!snap.exists()) return;

        const data=snap.data();

        customerName.value=data.name || "";

        phone.value=data.phone || "";

    }

    catch(error){

        console.error(error);

    }

});

// ======================================
// Load Products
// ======================================

async function loadProducts(){

    productSelect.innerHTML=
    "<option>Loading...</option>";

    try{

        const snapshot=
        await getDocs(collection(db,"products"));

        productSelect.innerHTML="";

        snapshot.forEach((docSnap)=>{

            const p=docSnap.data();

            if(

                p.retailPrice===undefined ||

                p.wholesalePrice===undefined

            ) return;

            productSelect.innerHTML+=`

<option
value="${docSnap.id}"
data-retail="${p.retailPrice}"
data-wholesale="${p.wholesalePrice}"
>

${p.name}

</option>

`;
console.log("Product:", p);

        });

        calculatePrice()

    }

    catch(error){

        console.error(error);

    }

}

loadProducts();
function calculatePrice(){

    const option =
    productSelect.options[
        productSelect.selectedIndex
    ];

    if(!option) return;


    let price = 0;


    if(orderType.value === "Wholesale"){

        price = Number(
            option.dataset.wholesale
        );

    }

    else{

        price = Number(
            option.dataset.retail
        );

    }


    pricePerKg.value = price;


    totalAmount.value =
    price *
    Number(quantity.value || 0);

}
productSelect.addEventListener(
"change",
calculatePrice
);


orderType.addEventListener(
"change",
calculatePrice
);


quantity.addEventListener(
"input",
calculatePrice
);
// ======================================
// Update Price & Stock
// ======================================

async function updatePrice() {

    const option =
        productSelect.options[
            productSelect.selectedIndex
        ];

    if (!option) return;

    try {

        const snap = await getDoc(
            doc(db, "products", option.value)
        );

        if (!snap.exists()) return;

        const product = snap.data();

        currentStock = Number(product.stock);

        let price = 0;

        if (orderType.value === "Wholesale") {

            price = Number(product.wholesalePrice);

        } else {

            price = Number(product.retailPrice);

        }

        pricePerKg.value = price;

        totalAmount.value =
            price * Number(quantity.value || 0);

        updateStockInfo();

    }

    catch (error) {

        console.error(error);

    }

}

// ======================================
// Stock Display
// ======================================

function updateStockInfo() {

    const qty = Number(quantity.value || 0);

    if (currentStock <= 0) {

        stockInfo.style.color = "red";

        stockInfo.innerHTML =
            "Out of Stock";

        return;

    }

    if (qty > currentStock) {

        stockInfo.style.color = "red";

        stockInfo.innerHTML =
            `Only ${currentStock} kg available`;

        return;

    }

    stockInfo.style.color = "green";

    stockInfo.innerHTML =
        `Available Stock : ${currentStock} kg`;

}

// ======================================
// Live Events
// ======================================

productSelect.addEventListener("change", updatePrice);

orderType.addEventListener("change", updatePrice);

quantity.addEventListener("input", () => {

    updatePrice();

});

// ======================================
// Load Bangladesh Address
// ======================================

async function loadAddress(){

try{


const [
divisions,
districts,
upazilas

] = await Promise.all([

fetch("assets/data/bd-address/divisions.json")
.then(r=>r.json()),

fetch("assets/data/bd-address/districts.json")
.then(r=>r.json()),

fetch("assets/data/bd-address/upazilas.json")
.then(r=>r.json())

]);

divisionsData = divisions;

districtsData = districts;

upazilasData = upazilas;




division.innerHTML =
'<option value="">Select Division</option>';



divisionsData.forEach(item=>{


division.innerHTML += `

<option value="${item.id}">
${item.name}
</option>

`;

});



}

catch(error){

console.error(
"Address Load Error:",
error
);

}


}

loadAddress();
console.log(divisionsData);
console.log(districtsData);
console.log(upazilasData);
// ======================================
// Load Districts
// ======================================

function loadDistricts() {

    district.innerHTML =
    '<option value="">Select District</option>';

    upazila.innerHTML =
    '<option value="">Select Upazila</option>';

    union.innerHTML =
    '<option value="">Select Union</option>';

    postOffice.innerHTML =
    '<option value="">Select Post Office</option>';

    const selectedDivisionId = Number(division.value);

    const filteredDistricts = districtsData.filter(
        item => item.division_id === selectedDivisionId
    );

    filteredDistricts.forEach(item => {

        district.innerHTML += `
            <option value="${item.id}">
                ${item.name}
            </option>
        `;

    });

}
//======================================
// Load Upazilas
// ======================================

function loadUpazilas() {

    upazila.innerHTML =
        '<option value="">Select Upazila</option>';

    union.innerHTML =
        '<option value="">Select Union</option>';

    postOffice.innerHTML =
        '<option value="">Select Post Office</option>';

    const selectedDistrictId = Number(district.value);

    const filteredUpazilas =
        upazilasData.filter(item =>
            item.district_id === selectedDistrictId
        );

    filteredUpazilas.forEach(item => {

        upazila.innerHTML += `
<option value="${item.id}">
    ${item.name}
</option>`;

    });

}
// ======================================
// Load Unions
// ======================================

async function loadUnions() {

    union.innerHTML =
    '<option value="">Select Union</option>';

    

    postOffice.innerHTML =
    '<option value="">Select Post Office</option>';

    if (unionsData.length === 0) {

        const response =
        await fetch("assets/data/bd-address/unions.json");

        unionsData =
        await response.json();

    }

    const selectedUpazilaId = Number(upazila.value);

const filteredUnions = unionsData.filter(
    item => Number(item.upazilla_id) === selectedUpazilaId
);
   filteredUnions.forEach(item => {

    union.innerHTML += `
        <option value="${item.id}">
            ${item.name}
        </option>
    `;

});

}
// ======================================
// Load Post Offices
// ======================================
async function loadVillagesAndPostOffices() {

    postOffice.innerHTML =
    '<option value="">Select Post Office</option>';

    if (postOfficesData.length === 0) {

        const response =
        await fetch("assets/data/bd-address/post-offices.json");

        postOfficesData =
        await response.json();

    }

    console.log("Selected Upazila:", upazila.value);
    console.log("First Post Office:", postOfficesData[0]);
    console.log("Total Post Offices:", postOfficesData.length);

    const selectedUpazilaId = Number(upazila.value);

    const filteredPostOffices =
    postOfficesData.filter(
        item => Number(item.upazilla_id) === selectedUpazilaId
    );

    console.log(filteredPostOffices);
filteredPostOffices.forEach(item => {

    postOffice.innerHTML += `
        <option value="${item.name}">
            ${item.name} (${item.postcode})
        </option>
    `;

});
}
// ======================================
// Payment Method
// ======================================

paymentMethod.addEventListener("change", () => {

    if (paymentMethod.value === "COD") {

        onlinePaymentBox.style.display = "none";

        paymentNumber.value = "";

        transactionId.value = "";

        return;

    }

    onlinePaymentBox.style.display = "block";

    if (paymentMethod.value === "bKash") {

        paymentNumber.value = "017XXXXXXXX";

    } else {

        paymentNumber.value = "018XXXXXXXX";

    }

});

// ======================================
// Division → District
// ======================================

division.addEventListener("change", loadDistricts);
// ======================================
// Place Order
// ======================================

orderForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    try {
        if (

paymentMethod.value !== "COD"

&&

transactionId.value.trim() === ""

){

alert("Please enter Transaction ID.");

return;

}

        if (!currentUser) {

            alert("Please login first.");

            return;

        }

        const option =
            productSelect.options[
                productSelect.selectedIndex
            ];

        if (!option) {

            alert("Please select a product.");

            return;

        }

        const qty = Number(quantity.value);

        if (qty <= 0) {

            alert("Invalid quantity.");

            return;

        }

        if (qty > currentStock) {

            alert(`Only ${currentStock} kg available.`);

            return;

        }

        const productRef =
            doc(db, "products", option.value);

        const productSnap =
            await getDoc(productRef);

        if (!productSnap.exists()) {

            alert("Product not found.");

            return;

        }

        const product = productSnap.data();

        const stockBefore = Number(product.stock);

        const stockAfter = stockBefore - qty;

        const orderNumber =
            "SF-" + Date.now();

        // =============================
        // Save Order
        // =============================

        console.log("Saving Order...");
        await addDoc(

            collection(db, "orders"),
            

            {

                orderId: orderNumber,

                userId: currentUser.uid,

                customerName: customerName.value.trim(),
                customerUid: auth.currentUser.uid,

                phone: phone.value.trim(),

                productId: option.value,

                productName: option.textContent.trim(),

                orderType: orderType.value,

                quantity: qty,

                pricePerKg: Number(pricePerKg.value),

                totalAmount: Number(totalAmount.value),

                division: division.value,

                district: district.value,

                upazila: upazila.value,

                union: union.value,

                village: village.value,

                postOffice: postOffice.value,

                house: house.value,
                fullAddress:
`${house.value.trim()}, ${village.value.trim()}, ${postOffice.options[postOffice.selectedIndex].text}, ${union.options[union.selectedIndex].text}, ${upazila.options[upazila.selectedIndex].text}, ${district.options[district.selectedIndex].text}, ${division.options[division.selectedIndex].text}`,
               paymentMethod: paymentMethod.value,

paymentStatus:
paymentMethod.value === "COD"
? "Pending"
: "Unpaid",

transactionId: transactionId.value.trim(),

                status: "Pending",

                createdAt: serverTimestamp()

            }
            

        );
        console.log("Order Saved Successfully");

        // =============================
        // Update Product Stock
        // =============================

        await updateDoc(

            productRef,

            {

                stock: stockAfter

            }

        );

        // =============================
        // Update User Statistics
        // =============================

        const userRef =
            doc(db, "users", currentUser.uid);

        const userSnap =
            await getDoc(userRef);

        if (userSnap.exists()) {

            const user = userSnap.data();

            await updateDoc(

                userRef,

                {

                    totalOrders:
                        (user.totalOrders || 0) + 1,

                    totalSpent:
                        (user.totalSpent || 0)
                        + Number(totalAmount.value)

                }

            );

        }

        // =============================
        // Save Stock History
        // =============================

        await addDoc(

            collection(db, "stockhistory"),

            {

                productName:
                    option.textContent.trim(),

                type: "ORDER",

                quantity: qty,

                stockBefore,

                stockAfter,

                note: orderNumber,

                createdAt:
                    serverTimestamp()

            }
            

        );
        await addDoc(collection(db,"notifications"),{
userId: currentUser.uid,

title:"New Order",

message:`${customerName.value} ordered ${option.textContent.trim()}`,

type:"NEW_ORDER",

isRead:false,

createdAt:serverTimestamp()

});
        

        // =============================
        // Success
        // =============================

        orderForm.style.display = "none";

        document.getElementById(
            "successBox"
        ).style.display = "block";

        document.getElementById("successMessage").innerHTML = `

<b>Order No:</b> ${orderNumber}<br><br>

<b>Customer:</b> ${customerName.value}<br>

<b>Phone:</b> ${phone.value}<br><br>

<b>Product:</b> ${option.textContent.trim()}<br>

<b>Order Type:</b> ${orderType.value}<br>

<b>Quantity:</b> ${qty} kg<br>

<b>Price / Kg:</b> ৳${Number(pricePerKg.value).toLocaleString()}<br>

<b>Total:</b> ৳${Number(totalAmount.value).toLocaleString()}<br><br>

<b>Payment:</b> ${paymentMethod.value}<br>

<b>Status:</b> Pending<br><br>

<b>Delivery Address:</b><br>

${house.value}<br>

${village.value}<br>

${postOffice.options[postOffice.selectedIndex].text}<br>

${union.options[union.selectedIndex].text}<br>

${upazila.options[upazila.selectedIndex].text}<br>

${district.options[district.selectedIndex].text}<br>

${division.options[division.selectedIndex].text}

`;
    }

    catch (error) {

    console.error(error);

    alert(error.message);

}

});
// ======================================
// District → Upazila
// ======================================

district.addEventListener("change", loadUpazilas);

// ======================================
// Upazila → Union
// ======================================

upazila.addEventListener("change", loadUnions);

// ======================================
// Union → Village & Post Office
// ======================================

union.addEventListener("change", loadVillagesAndPostOffices);
// ======================================
// Ready
// ======================================

console.log("Order System Ready");