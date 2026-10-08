// ======================================
// Order System — with Login Gate + Server API
// Sowrov Fertilizer
// ======================================

import { db, auth } from "./firebase.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================================
// Variables
// ======================================

let divisionsData = [];
let districtsData = [];
let upazilasData = [];
let unionsData = [];
let villagesData = [];
let currentUser = null;
let currentStock = 0;
let authReady = false;
let isSubmitting = false;

// ======================================
// Elements
// ======================================
const paymentMethod = document.getElementById("paymentMethod");
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

const onlinePaymentBox = document.getElementById("onlinePaymentBox");
const paymentNumber = document.getElementById("paymentNumber");
const transactionId = document.getElementById("transactionId");
const stockInfo = document.getElementById("stockInfo");
const codUpcomingNotice = document.getElementById("codUpcomingNotice");

const loginWarning = document.getElementById("loginWarning");
const orderErrorBox = document.getElementById("orderErrorBox");
const orderErrorMessage = document.getElementById("orderErrorMessage");
const successBox = document.getElementById("successBox");
const successMessage = document.getElementById("successMessage");

// ======================================
// Order Context Persistence (H1)
// ======================================

const ORDER_CONTEXT_KEY = 'sf-order-context';

function saveOrderContext() {
    try {
        var ctx = {
            productSelect: productSelect ? productSelect.value : '',
            orderType: orderType ? orderType.value : '',
            quantity: quantity ? quantity.value : '',
            division: division ? division.value : '',
            district: district ? district.value : '',
            upazila: upazila ? upazila.value : '',
            union: union ? union.value : '',
            village: village ? village.value : '',
            postOffice: postOffice ? postOffice.value : '',
            house: house ? house.value : '',
            paymentMethod: paymentMethod ? paymentMethod.value : '',
            timestamp: Date.now(),
        };
        sessionStorage.setItem(ORDER_CONTEXT_KEY, JSON.stringify(ctx));
    } catch (e) { /* ignore */ }
}

function restoreOrderContext() {
    try {
        var raw = sessionStorage.getItem(ORDER_CONTEXT_KEY);
        if (!raw) return false;
        var ctx = JSON.parse(raw);
        // Only restore if less than 30 minutes old
        if (!ctx.timestamp || (Date.now() - ctx.timestamp > 30 * 60 * 1000)) {
            sessionStorage.removeItem(ORDER_CONTEXT_KEY);
            return false;
        }
        sessionStorage.removeItem(ORDER_CONTEXT_KEY);
        if (productSelect && ctx.productSelect) productSelect.value = ctx.productSelect;
        if (orderType && ctx.orderType) orderType.value = ctx.orderType;
        if (quantity && ctx.quantity) quantity.value = ctx.quantity;
        if (division && ctx.division) division.value = ctx.division;
        if (district && ctx.district) district.value = ctx.district;
        if (upazila && ctx.upazila) upazila.value = ctx.upazila;
        if (union && ctx.union) union.value = ctx.union;
        if (village && ctx.village) village.value = ctx.village;
        if (postOffice && ctx.postOffice) postOffice.value = ctx.postOffice;
        if (house && ctx.house) house.value = ctx.house;
        if (paymentMethod && ctx.paymentMethod) {
            paymentMethod.value = ctx.paymentMethod;
            syncPaymentMethodFields();
        }
        return true;
    } catch (e) {
        sessionStorage.removeItem(ORDER_CONTEXT_KEY);
        return false;
    }
}

function clearOrderContext() {
    try { sessionStorage.removeItem(ORDER_CONTEXT_KEY); } catch (e) { /* ignore */ }
}

// ======================================
// Cart-Based Order Context (H1b)
// Pulls items from localStorage cart so
// the cart page and the checkout stay linked.
// ======================================

function getOrderCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch (e) {
        return [];
    }
}

function renderCartSummary() {
    var box = document.getElementById("cartSummaryBox");
    var itemsEl = document.getElementById("cartSummaryItems");
    var totalEl = document.getElementById("cartSummaryTotal");
    if (!box || !itemsEl) return;

    var cart = getOrderCart();

    if (cart.length === 0) {
        box.style.display = "none";
        return;
    }

    var html = "";
    var total = 0;
    cart.forEach(function (item) {
        var lineTotal = Number(item.price || 0) * Number(item.qty || 1);
        total += lineTotal;
        html += '<div class="cart-summary-item">' +
            '<span class="cs-name">' + escapeHtml(String(item.name || "")) + '</span>' +
            '<span class="cs-qty">x' + escapeHtml(String(item.qty || 1)) + '</span>' +
            '<span class="cs-price">৳' + lineTotal.toLocaleString() + '</span>' +
            '</div>';
    });
    itemsEl.innerHTML = html;
    if (totalEl) totalEl.textContent = "৳" + total.toLocaleString();
    box.style.display = "block";
}

function prefillFromCart() {
    var cart = getOrderCart();
    if (cart.length === 0) return;
    var first = cart[0];
    if (productSelect) {
        var opts = productSelect.options;
        for (var i = 0; i < opts.length; i++) {
            if (opts[i].value === first.id) {
                productSelect.selectedIndex = i;
                break;
            }
        }
    }
    if (quantity && first.qty) quantity.value = first.qty;
    if (typeof updatePrice === "function") updatePrice();
}

function removeOrderedFromCart(productId) {
    try {
        var cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart = cart.filter(function (item) { return item.id !== productId; });
        localStorage.setItem("cart", JSON.stringify(cart));
        if (window.updateCartBadge) window.updateCartBadge();
    } catch (e) { /* ignore */ }
    renderCartSummary();
}

// ======================================
// Auth State — Login Gate
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

function showLoginWarning() {
    if (loginWarning) loginWarning.style.display = "block";
    if (orderErrorBox) orderErrorBox.style.display = "none";
}

function hideLoginWarning() {
    if (loginWarning) loginWarning.style.display = "none";
}

function showOrderError(message) {
    if (orderErrorBox) orderErrorBox.style.display = "block";
    if (orderErrorMessage) orderErrorMessage.textContent = message;
}

function hideOrderError() {
    if (orderErrorBox) orderErrorBox.style.display = "none";
}

(async function() {
    var user = await waitForAuthUser(5000);
    authReady = true;

    if (!user) {
        currentUser = null;
        showLoginWarning();
        return;
    }

    currentUser = user;
    hideLoginWarning();
    restoreOrderContext();

    try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!snap.exists()) return;
        const data = snap.data();
        customerName.value = data.name || "";
        phone.value = data.phone || "";
    } catch (error) {
        console.error(error);
    }
})();

// ======================================
// Load Products
// ======================================

async function loadProducts() {
    productSelect.innerHTML = "<option>Loading...</option>";
    try {
        const snapshot = await getDocs(collection(db, "products"));
        productSelect.innerHTML = "";
        snapshot.forEach((docSnap) => {
            const p = docSnap.data();
            if (p.retailPrice === undefined || p.wholesalePrice === undefined) return;
            productSelect.innerHTML += `
<option value="${escapeHtml(docSnap.id)}" data-retail="${escapeHtml(String(p.retailPrice))}" data-wholesale="${escapeHtml(String(p.wholesalePrice))}">
${escapeHtml(String(p.name))}
</option>`;
        });
        calculatePrice();
        updatePrice();
        renderCartSummary();
        prefillFromCart();
    } catch (error) {
        console.error(error);
    }
}

loadProducts();

function calculatePrice() {
    const option = productSelect.options[productSelect.selectedIndex];
    if (!option) return;
    let price = 0;
    if (orderType.value === "Wholesale") {
        price = Number(option.dataset.wholesale);
    } else {
        price = Number(option.dataset.retail);
    }
    pricePerKg.value = price;
    totalAmount.value = price * Number(quantity.value || 0);
}

orderType.addEventListener("change", calculatePrice);
quantity.addEventListener("input", calculatePrice);

// ======================================
// Update Price & Stock
// ======================================

async function updatePrice() {
    const option = productSelect.options[productSelect.selectedIndex];
    if (!option) return;
    try {
        const snap = await getDoc(doc(db, "products", option.value));
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
        totalAmount.value = price * Number(quantity.value || 0);
        updateStockInfo();
    } catch (error) {
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
        stockInfo.innerHTML = "Out of Stock";
        return;
    }
    if (qty > currentStock) {
        stockInfo.style.color = "red";
        stockInfo.innerHTML = `Only ${currentStock} kg available`;
        return;
    }
    stockInfo.style.color = "green";
    stockInfo.innerHTML = `Available Stock : ${currentStock} kg`;
}

// ======================================
// Live Events
// ======================================

productSelect.addEventListener("change", updatePrice);
orderType.addEventListener("change", updatePrice);
quantity.addEventListener("input", () => { updatePrice(); });

// ======================================
// Load Bangladesh Address
// ======================================

async function loadAddress() {
    try {
        const [divisions, districts, upazilas] = await Promise.all([
            fetch("assets/data/bd-address/divisions.json").then(r => r.json()),
            fetch("assets/data/bd-address/districts.json").then(r => r.json()),
            fetch("assets/data/bd-address/upazilas.json").then(r => r.json()),
        ]);
        divisionsData = divisions;
        districtsData = districts;
        upazilasData = upazilas;

        division.innerHTML = '<option value="">Select Division</option>';
        divisionsData.forEach(item => {
            division.innerHTML += `<option value="${item.id}">${item.name}</option>`;
        });
    } catch (error) {
        console.error("Address Load Error:", error);
    }
}

loadAddress();

function normalizeAddressId(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function getUnionParentIds(item) {
    return [item.upazila_id, item.upazilla_id]
        .map(normalizeAddressId)
        .filter(Boolean);
}

function getSelectedOptionText(select) {
    const option = select.options[select.selectedIndex];
    return option ? option.textContent.trim() : "";
}

// ======================================
// Load Districts
// ======================================

function loadDistricts() {
    district.innerHTML = '<option value="">Select District</option>';
    upazila.innerHTML = '<option value="">Select Upazila</option>';
    union.innerHTML = '<option value="">Select Union</option>';

    const selectedDivisionId = normalizeAddressId(division.value);
    const filteredDistricts = districtsData.filter(item => normalizeAddressId(item.division_id) === selectedDivisionId);
    filteredDistricts.forEach(item => {
        district.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

// ======================================
// Load Upazilas
// ======================================

function loadUpazilas() {
    upazila.innerHTML = '<option value="">Select Upazila</option>';
    union.innerHTML = '<option value="">Select Union</option>';

    const selectedDistrictId = normalizeAddressId(district.value);
    const filteredUpazilas = upazilasData.filter(item => normalizeAddressId(item.district_id) === selectedDistrictId);
    filteredUpazilas.forEach(item => {
        upazila.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

// ======================================
// Load Unions
// ======================================

async function loadUnions() {
    union.innerHTML = '<option value="">Select Union</option>';

    if (unionsData.length === 0) {
        const response = await fetch("assets/data/bd-address/unions.json");
        unionsData = await response.json();
    }

    const selectedUpazilaId = normalizeAddressId(upazila.value);
    const filteredUnions = unionsData.filter(item => getUnionParentIds(item).includes(selectedUpazilaId));
    filteredUnions.forEach(item => {
        union.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

// ======================================
// Payment Method
// ======================================

function normalizeBdPaymentNumber(value) {
    let compact = String(value || "").trim().replace(/[\s\-()]/g, "");
    if (compact.startsWith("+880")) {
        compact = compact.slice(1);
    } else if (compact.startsWith("0")) {
        compact = "880" + compact.slice(1);
    } else if (!compact.startsWith("880")) {
        compact = "880" + compact;
    }
    return /^8801[3-9]\d{8}$/.test(compact) ? compact : "";
}

function syncPaymentMethodFields() {
    const isCod = paymentMethod.value === "COD";
    if (isCod) {
        onlinePaymentBox.style.display = "none";
        paymentNumber.value = "";
        paymentNumber.required = false;
        transactionId.value = "";
        if (codUpcomingNotice) codUpcomingNotice.style.display = "block";
        return;
    }
    if (codUpcomingNotice) codUpcomingNotice.style.display = "none";
    onlinePaymentBox.style.display = "block";
    paymentNumber.value = "";
    paymentNumber.required = true;
}

const ORDER_WHATSAPP_NUMBER = "8801829775552";

function formatOrderAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? `৳${amount.toLocaleString()}` : "N/A";
}

function formatOrderWhatsAppMessage(order) {
    const lines = [
        "🛒 *নতুন অর্ডার — Sowrov Fertilizer*",
        "",
    ];

    if (order.orderId) {
        lines.push(`📋 অর্ডার নম্বর: ${order.orderId}`);
    }
    lines.push(
        `👤 কাস্টমার: ${order.customerName || "N/A"}`,
        `📱 ফোন: ${order.phone || "N/A"}`,
        `📦 পণ্য: ${order.productName || "N/A"}`,
        `🏷️ অর্ডার টাইপ: ${order.orderType || "N/A"}`,
        `⚖️ পরিমাণ: ${order.quantity} কেজি`,
        `💰 দর/কেজি: ${formatOrderAmount(order.pricePerKg)}`,
        `💵 মোট: ${formatOrderAmount(order.totalAmount)}`,
        `💳 পেমেন্ট: ${order.paymentMethod || "N/A"}`,
    );
    if (order.transactionId) {
        lines.push(`🧾 ট্রানজ্যাকশন ID: ${order.transactionId}`);
    }
    if (order.paymentNumber) {
        lines.push(`📱 পেমেন্ট নম্বর: ${order.paymentNumber}`);
    }
    lines.push(
        `📍 ঠিকানা: ${order.fullAddress || "N/A"}`,
        `🕐 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}`,
    );
    return lines.join('\n');
}

function buildOrderWhatsAppUrl(order) {
    return `https://wa.me/${ORDER_WHATSAPP_NUMBER}?text=${encodeURIComponent(formatOrderWhatsAppMessage(order))}`;
}

function closeOrderWhatsAppWindow(whatsappWindow) {
    if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.close();
    }
}

function openOrderWhatsApp(whatsappWindow, order) {
    const url = buildOrderWhatsAppUrl(order);
    if (whatsappWindow && !whatsappWindow.closed) {
        whatsappWindow.opener = null;
        whatsappWindow.location.href = url;
        return;
    }
    const fallbackWindow = window.open(url, "_blank");
    if (fallbackWindow) {
        fallbackWindow.opener = null;
    } else {
        window.location.href = url;
    }
}

paymentMethod.addEventListener("change", syncPaymentMethodFields);
syncPaymentMethodFields();

// ======================================
// Division → District
// ======================================

division.addEventListener("change", loadDistricts);

// ======================================
// Place Order — with Login Gate + Backend API
// ======================================

orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    hideOrderError();
    hideLoginWarning();

    // ---- LOGIN GATE (Frontend) ----
    if (!authReady) {
        showOrderError("অনুগ্রহ করে অপেক্ষা করুন...");
        return;
    }

    if (!currentUser) {
        saveOrderContext();
        showLoginWarning();
        return;
    }

    // ---- COD UPCOMING FEATURE BLOCK ----
    if (paymentMethod.value === "COD") {
        if (codUpcomingNotice) codUpcomingNotice.style.display = "block";
        showOrderError("COD এবং Home Delivery শীঘ্রই চালু হচ্ছে। বর্তমানে bKash অথবা Nagad ব্যবহার করুন।");
        return;
    }

    let whatsappWindow = null;

        try {
            if (paymentMethod.value !== "COD") {
                const paymentNumberValue = paymentNumber.value.trim();
                if (!paymentNumberValue) {
                    showOrderError("Please enter your bKash/Nagad number.");
                    return;
                }
                if (!normalizeBdPaymentNumber(paymentNumberValue)) {
                    showOrderError("Enter a valid Bangladeshi mobile number.");
                    return;
                }
            }

            if (paymentMethod.value !== "COD" && transactionId.value.trim() === "") {
                showOrderError("Please enter Transaction ID.");
                return;
            }

            if (paymentMethod.value !== "COD") {
                const txnRaw = transactionId.value;
                const txnTrimmed = txnRaw.trim();
                if (txnTrimmed.length === 0) {
                    showOrderError("Transaction ID cannot be empty or whitespace.");
                    return;
                }
                if (txnTrimmed.length > 50) {
                    showOrderError("Transaction ID is too long (max 50 characters).");
                    return;
                }
                if (/[\x00-\x08\x0E-\x1F]/.test(txnTrimmed)) {
                    showOrderError("Transaction ID contains invalid characters.");
                    return;
                }
            }

        const option = productSelect.options[productSelect.selectedIndex];
        if (!option || !option.value) {
            showOrderError("Please select a product.");
            return;
        }

        const qty = Number(quantity.value);
        if (qty <= 0) {
            showOrderError("Invalid quantity.");
            return;
        }

        if (qty > currentStock) {
            showOrderError(`Only ${currentStock} kg available.`);
            return;
        }

        // ---- ADDRESS VALIDATION ----
        const addressFields = [
            { el: division, label: 'Division' },
            { el: district, label: 'District' },
            { el: upazila, label: 'Upazila' },
            { el: village, label: 'Village' },
            { el: postOffice, label: 'Post Office', action: 'enter' },
        ];
        for (const af of addressFields) {
            const val = af.el ? af.el.value.trim() : '';
            if (!val) {
                const action = af.action || 'select';
                showOrderError(`Please ${action} a valid ${af.label}.`);
                return;
            }
        }

        isSubmitting = true;
        const submitBtn = orderForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Processing...";
        }

        whatsappWindow = window.open("", "_blank");

        // ---- Get Firebase ID Token ----
        const idToken = await currentUser.getIdToken();

        // ---- Compute full address ----
        const fullAddr = `${house.value.trim()}, ${village.value.trim()}, ${postOffice.value.trim()}, ${getSelectedOptionText(union)}, ${getSelectedOptionText(upazila)}, ${getSelectedOptionText(district)}, ${getSelectedOptionText(division)}`;

        // ---- Send to Backend API ----
        const orderPayload = {
            customerName: customerName.value.trim(),
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
            postOffice: postOffice.value.trim(),
            house: house.value,
            fullAddress: fullAddr,
            paymentMethod: paymentMethod.value,
            paymentNumber: paymentMethod.value === "COD" ? "" : normalizeBdPaymentNumber(paymentNumber.value),
            transactionId: transactionId.value.trim(),
        };

        const response = await fetch("/api/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
            },
            body: JSON.stringify(orderPayload),
        });

        const result = await response.json();

        if (!response.ok) {
            closeOrderWhatsAppWindow(whatsappWindow);
            if (response.status === 401) {
                currentUser = null;
                showLoginWarning();
                return;
            }
            showOrderError(result.message || "অর্ডার তৈরিতে সমস্যা হয়েছে।");
            return;
        }

        // ---- Success ----
        orderForm.style.display = "none";
        if (loginWarning) loginWarning.style.display = "none";
        clearOrderContext();

        const orderNumber = result.orderId || "SF-" + Date.now();

        try {
            openOrderWhatsApp(whatsappWindow, { ...orderPayload, orderId: orderNumber });
        } catch (error) {
            closeOrderWhatsAppWindow(whatsappWindow);
            console.error("WhatsApp link open failed:", error);
        }

        let notifInfo = "";
        if (result.notifications) {
            const n = result.notifications;
            const parts = [];
            if (n.whatsapp) parts.push('WhatsApp: ' + (n.whatsapp === 'sent' ? '✅' : '⏳'));
            if (n.sms_018) parts.push('SMS(018): ' + (n.sms_018 === 'sent' ? '✅' : '⏳'));
            if (n.sms_015) parts.push('SMS(015): ' + (n.sms_015 === 'sent' ? '✅' : '⏳'));
            if (n.email) parts.push('Email: ' + (n.email === 'sent' ? '✅' : '⏳'));
            if (parts.length > 0) {
                notifInfo = 'Notifications: ' + parts.join(', ');
            }
        }

        successBox.style.display = "block";

        removeOrderedFromCart(option.value);

        // Best-effort deep links to Track Order + Invoice.
        // They need the Firestore document id, so we look it up by order number.
        var successActions = document.getElementById("successActions");
        var trackLink = document.getElementById("trackOrderLink");
        var invoiceLink = document.getElementById("invoiceLink");
        if (successActions) successActions.style.display = "block";
        if (trackLink) trackLink.href = "/customer-orders.html";
        if (invoiceLink) invoiceLink.href = "/products.html";
        try {
            getDocs(query(collection(db, "orders"), where("orderId", "==", orderNumber))).then(function (snap) {
                if (snap.empty) return;
                var docId = snap.docs[0].id;
                if (trackLink) trackLink.href = "/track-order.html?id=" + encodeURIComponent(docId);
                if (invoiceLink) invoiceLink.href = "/invoice.html?id=" + encodeURIComponent(docId);
            }).catch(function () { /* fall back to customer-orders.html */ });
        } catch (e) { /* ignore */ }

        successMessage.textContent = '';

        const frag = document.createDocumentFragment();

        function addBoldLine(parent, label, value) {
            const b = document.createElement('b');
            b.textContent = label;
            parent.appendChild(b);
            parent.appendChild(document.createTextNode(value));
            parent.appendChild(document.createElement('br'));
        }

        addBoldLine(frag, 'Order No: ', orderNumber);
        frag.appendChild(document.createElement('br'));

        addBoldLine(frag, 'Customer: ', customerName.value);
        addBoldLine(frag, 'Phone: ', phone.value);
        frag.appendChild(document.createElement('br'));

        addBoldLine(frag, 'Product: ', option.textContent.trim());
        addBoldLine(frag, 'Order Type: ', orderType.value);
        addBoldLine(frag, 'Quantity: ', qty + ' kg');
        addBoldLine(frag, 'Price / Kg: ', '৳' + Number(pricePerKg.value).toLocaleString());
        addBoldLine(frag, 'Total: ', '৳' + Number(totalAmount.value).toLocaleString());
        frag.appendChild(document.createElement('br'));

        addBoldLine(frag, 'Payment: ', paymentMethod.value);
        addBoldLine(frag, 'Status: ', 'Pending');
        frag.appendChild(document.createElement('br'));

        const addrB = document.createElement('b');
        addrB.textContent = 'Delivery Address: ';
        frag.appendChild(addrB);
        frag.appendChild(document.createElement('br'));
        frag.appendChild(document.createTextNode(house.value));
        frag.appendChild(document.createElement('br'));
        frag.appendChild(document.createTextNode(village.value));
        frag.appendChild(document.createElement('br'));
        frag.appendChild(document.createTextNode(postOffice.value.trim()));
        frag.appendChild(document.createElement('br'));
        frag.appendChild(document.createTextNode(union.options[union.selectedIndex].text));
        frag.appendChild(document.createElement('br'));
        frag.appendChild(document.createTextNode(upazila.options[upazila.selectedIndex].text));
        frag.appendChild(document.createElement('br'));
        frag.appendChild(document.createTextNode(district.options[district.selectedIndex].text));
        frag.appendChild(document.createElement('br'));
        frag.appendChild(document.createTextNode(division.options[division.selectedIndex].text));

        if (notifInfo) {
            const small = document.createElement('small');
            small.style.color = '#666';
            small.textContent = notifInfo;
            frag.appendChild(document.createElement('br'));
            frag.appendChild(document.createElement('br'));
            frag.appendChild(small);
        }

        successMessage.appendChild(frag);

    } catch (error) {
        closeOrderWhatsAppWindow(whatsappWindow);
        console.error(error);
        showOrderError(error.message || "অর্ডার তৈরিতে সমস্যা হয়েছে।");
    } finally {
        isSubmitting = false;
        const submitBtn = orderForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Place Order";
        }
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
// Ready
// ======================================

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

console.log("Order System Ready");
