import { auth } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const btn =
document.getElementById("trackBtn");

const result =
document.getElementById("trackingResult");

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

btn.addEventListener("click", async () => {

const id =
document.getElementById("trackOrderId").value.trim();

if (!id) {
    result.innerHTML = '<p style="color:red;">Enter Order ID.</p>';
    return;
}

result.innerHTML = '<p>Loading...</p>';

try {
    const user = await waitForAuthUser(5000);
    if (!user) {
        result.innerHTML = '<p style="color:red;">Please log in to track your order.</p>';
        return;
    }

    const idToken = await user.getIdToken();

    const response = await fetch("/api/track-order?id=" + encodeURIComponent(id), {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + idToken,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        result.innerHTML = '<p style="color:red;">' + (data.message || "Order not found.") + '</p>';
        return;
    }

    result.textContent = '';

    const fragment = document.createDocumentFragment();

    const h3 = document.createElement('h3');
    h3.textContent = 'Order Found';
    fragment.appendChild(h3);

    function addLine(label, value) {
        const p = document.createElement('p');
        const b = document.createElement('b');
        b.textContent = label;
        p.appendChild(b);
        p.appendChild(document.createTextNode(value === undefined || value === null ? '' : String(value)));
        fragment.appendChild(p);
    }

    addLine('Order No: ', data.orderNumber);
    addLine('Product: ', data.productName);
    addLine('Quantity: ', (data.quantity || 0) + ' kg');
    addLine('Total: ', '৳' + (data.total || 0));
    addLine('Payment: ', data.paymentMethod);
    addLine('Status: ', data.status);

    result.appendChild(fragment);

} catch (error) {
    console.error(error);
    result.innerHTML = '<p style="color:red;">Failed to track order. Please try again.</p>';
}
});
