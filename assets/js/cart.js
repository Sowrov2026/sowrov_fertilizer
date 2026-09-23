// ======================================
// Shopping Cart
// Sowrov Fertilizer
// ======================================

const cartContainer =
document.getElementById("cartItems");

const subtotal =
document.getElementById("subtotal");

const grandTotal =
document.getElementById("grandTotal");

const clearCart =
document.getElementById("clearCart");

let cart = JSON.parse(
localStorage.getItem("cart")
) || [];

function escapeHtml(str){
    if(str===null||str===undefined) return '';
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;')
        .replace(/'/g,'&#039;');
}

function saveCart(){

localStorage.setItem(
"cart",
JSON.stringify(cart)
);

}

function loadCart(){

if(cart.length===0){

cartContainer.innerHTML=`

<div class="empty-cart">

<h2>Your Cart is Empty</h2>

<p>Add some products first.</p>

<a href="index.html#products"
class="btn">

Continue Shopping

</a>

</div>

`;

subtotal.innerText="৳0";

grandTotal.innerText="৳0";

return;

}

let total=0;

cartContainer.innerHTML="";

cart.forEach((item,index)=>{

const itemTotal=
item.price*item.qty;

total+=itemTotal;

cartContainer.innerHTML+=`

<div class="cart-item">

<img src="${escapeHtml(String(item.image||''))}">

<div class="cart-info">

<h3>${escapeHtml(String(item.name||''))}</h3>

<p>${escapeHtml(String(item.category||""))}</p>

<div class="cart-price">

৳${item.price}

</div>

<div class="qty-box">

<button
class="qty-btn"
onclick="changeQty(${index},-1)">

-

</button>

<div class="qty-value">

${item.qty}

</div>

<button
class="qty-btn"
onclick="changeQty(${index},1)">

+

</button>

</div>

<button
class="remove-btn"
onclick="removeItem(${index})">

Remove

</button>

</div>

</div>

`;

});

subtotal.innerText=
"৳"+total;

grandTotal.innerText=
"৳"+(total+100);

}

window.changeQty=function(index,value){

cart[index].qty+=value;

if(cart[index].qty<=0){

cart[index].qty=1;

}

saveCart();

loadCart();

}

window.removeItem=function(index){

cart.splice(index,1);

saveCart();

loadCart();

}

if(clearCart) clearCart.onclick=()=>{

if(confirm("Clear Cart?")){

cart=[];

saveCart();

loadCart();

}

}

loadCart();

console.log("✅ Cart Loaded");
// ======================================
// Cart Badge Sync
// ======================================

function updateBadge(){

const badge=

document.getElementById("cartCount");

if(!badge) return;

let total=0;

cart.forEach(item=>{

total+=item.qty;

});

badge.innerText=total;

}

updateBadge();

loadCart=(()=>{

const oldLoad=loadCart;

return function(){

oldLoad();

updateBadge();

};

})();