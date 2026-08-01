// ======================================
// V20 Sales Manager
// Sowrov Fertilizer ERP
// ======================================

const STORAGE_KEYS = {
    customers: 'sf_customers',
    orders: 'sf_orders',
    payments: 'sf_payments'
};

const CURRENCY = '৳';

function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function loadData(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function fmtDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

function fmtCur(amount) {
    return CURRENCY + Number(amount || 0).toLocaleString('bn-BD');
}

function orderTotal(order) {
    return (order.items || []).reduce((s, i) => s + Number(i.qty) * Number(i.price), 0);
}

function paidTotal(orderId) {
    return loadData(STORAGE_KEYS.payments)
        .filter(p => p.orderId === orderId)
        .reduce((s, p) => s + Number(p.amount || 0), 0);
}

function genInvNo() {
    const d = new Date();
    const seq = String(loadData(STORAGE_KEYS.orders).length + 1).padStart(4, '0');
    return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${seq}`;
}

function dlFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'className') e.className = v;
        else if (k === 'textContent') e.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
        else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
        else e.setAttribute(k, v);
    });
    children.forEach(c => {
        if (typeof c === 'string') e.appendChild(document.createTextNode(c));
        else if (c) e.appendChild(c);
    });
    return e;
}

function badge(status) {
    const map = {
        pending: ['অপেক্ষমান', 'badge-warning'],
        confirmed: ['নিশ্চিত', 'badge-info'],
        delivered: ['ডেলিভারি সম্পন্ন', 'badge-success'],
        cancelled: ['বাতিল', 'badge-danger'],
        paid: ['পরিশোধিত', 'badge-success'],
        partial: ['আংশিক', 'badge-warning'],
        unpaid: ['অপরিশোধিত', 'badge-danger']
    };
    const [text, cls] = map[status] || [status, 'badge-secondary'];
    return el('span', { className: `badge ${cls}`, textContent: text });
}

// ======================================
// Customer CRUD
// ======================================

function createCustomer(data) {
    const customer = {
        id: generateId(),
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        type: data.type || 'farmer',
        createdAt: new Date().toISOString()
    };
    const list = loadData(STORAGE_KEYS.customers);
    list.push(customer);
    saveData(STORAGE_KEYS.customers, list);
    return customer;
}

function updateCustomer(id, data) {
    const list = loadData(STORAGE_KEYS.customers);
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    saveData(STORAGE_KEYS.customers, list);
    return list[idx];
}

function deleteCustomer(id) {
    saveData(STORAGE_KEYS.customers, loadData(STORAGE_KEYS.customers).filter(c => c.id !== id));
}

function getCustomer(id) {
    return loadData(STORAGE_KEYS.customers).find(c => c.id === id) || null;
}

function getAllCustomers() {
    return loadData(STORAGE_KEYS.customers);
}

// ======================================
// Order CRUD
// ======================================

function createOrder(data) {
    const order = {
        id: generateId(),
        customerId: data.customerId || '',
        farmId: data.farmId || '',
        items: data.items || [],
        date: data.date || new Date().toISOString(),
        status: data.status || 'pending',
        paymentStatus: 'unpaid',
        notes: data.notes || '',
        invoiceNumber: genInvNo(),
        createdAt: new Date().toISOString()
    };
    order.total = orderTotal(order);
    const list = loadData(STORAGE_KEYS.orders);
    list.push(order);
    saveData(STORAGE_KEYS.orders, list);
    return order;
}

function updateOrder(id, data) {
    const list = loadData(STORAGE_KEYS.orders);
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) return null;
    if (data.items) data.total = orderTotal({ items: data.items });
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    const paid = paidTotal(id);
    list[idx].paymentStatus = paid >= list[idx].total ? 'paid'
        : paid > 0 ? 'partial' : 'unpaid';
    saveData(STORAGE_KEYS.orders, list);
    return list[idx];
}

function deleteOrder(id) {
    saveData(STORAGE_KEYS.orders, loadData(STORAGE_KEYS.orders).filter(o => o.id !== id));
    saveData(STORAGE_KEYS.payments, loadData(STORAGE_KEYS.payments).filter(p => p.orderId !== id));
}

function getOrder(id) {
    const order = loadData(STORAGE_KEYS.orders).find(o => o.id === id);
    if (!order) return null;
    const paid = paidTotal(id);
    order.totalPaid = paid;
    order.dueAmount = Math.max(0, orderTotal(order) - paid);
    return order;
}

// ======================================
// Invoice & Payments
// ======================================

function generateInvoice(orderId) {
    const order = getOrder(orderId);
    if (!order) return null;
    const customer = getCustomer(order.customerId);
    return {
        invoiceNumber: order.invoiceNumber,
        orderId: order.id,
        date: order.date,
        customer: customer || { name: 'অজানা', phone: '-', address: '-' },
        items: order.items,
        subtotal: order.total,
        totalPaid: order.totalPaid,
        dueAmount: order.dueAmount,
        paymentStatus: order.paymentStatus
    };
}

function getInvoice(invoiceId) {
    const order = loadData(STORAGE_KEYS.orders).find(o => o.invoiceNumber === invoiceId);
    return order ? generateInvoice(order.id) : null;
}

function recordPayment(orderId, payment) {
    const entry = {
        id: generateId(),
        orderId,
        amount: Number(payment.amount) || 0,
        method: payment.method || 'cash',
        date: payment.date || new Date().toISOString(),
        reference: payment.reference || '',
        createdAt: new Date().toISOString()
    };
    const list = loadData(STORAGE_KEYS.payments);
    list.push(entry);
    saveData(STORAGE_KEYS.payments, list);
    updateOrder(orderId, {});
    return entry;
}

function getPayments(orderId) {
    return loadData(STORAGE_KEYS.payments).filter(p => p.orderId === orderId);
}

function getOutstanding(customerId) {
    return loadData(STORAGE_KEYS.orders)
        .filter(o => o.customerId === customerId)
        .reduce((s, o) => s + Math.max(0, orderTotal(o) - paidTotal(o.id)), 0);
}

function getOutstandingTotal() {
    return loadData(STORAGE_KEYS.orders)
        .reduce((s, o) => s + Math.max(0, orderTotal(o) - paidTotal(o.id)), 0);
}

// ======================================
// Statistics
// ======================================

function getSalesStats(farmId) {
    let orders = loadData(STORAGE_KEYS.orders);
    if (farmId) orders = orders.filter(o => o.farmId === farmId);
    return {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s, o) => s + orderTotal(o), 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length
    };
}

function getMonthlySales(month, year) {
    const orders = loadData(STORAGE_KEYS.orders).filter(o => {
        const d = new Date(o.date);
        return d.getMonth() === month && d.getFullYear() === year;
    });
    return {
        month, year,
        orderCount: orders.length,
        totalSales: orders.reduce((s, o) => s + orderTotal(o), 0)
    };
}

function getTopCustomers(limit = 10) {
    const map = {};
    const customers = loadData(STORAGE_KEYS.customers);
    loadData(STORAGE_KEYS.orders).forEach(o => {
        if (!map[o.customerId]) map[o.customerId] = { count: 0, total: 0 };
        map[o.customerId].count++;
        map[o.customerId].total += orderTotal(o);
    });
    return Object.entries(map)
        .map(([id, d]) => ({ id, name: customers.find(c => c.id === id)?.name || 'অজানা', ...d }))
        .sort((a, b) => b.total - a.total).slice(0, limit);
}

function getSalesByProduct() {
    const map = {};
    loadData(STORAGE_KEYS.orders).forEach(o => {
        (o.items || []).forEach(item => {
            if (!map[item.name]) map[item.name] = { qty: 0, revenue: 0 };
            map[item.name].qty += Number(item.qty);
            map[item.name].revenue += Number(item.qty) * Number(item.price);
        });
    });
    return Object.entries(map)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.revenue - a.revenue);
}

// ======================================
// UI: Customer List
// ======================================

function createCustomerList(containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const customers = getAllCustomers();
    c.appendChild(el('div', { className: 'sf-list-header' }, [
        el('h3', { textContent: 'গ্রাহক তালিকা' }),
        el('button', { className: 'btn btn-primary', textContent: '+ নতুন গ্রাহক',
            onClick: () => createCustomerForm(containerId) })
    ]));

    if (!customers.length) {
        c.appendChild(el('div', { className: 'sf-empty', textContent: 'কোনো গ্রাহক পাওয়া যায়নি' }));
        return;
    }

    const tl = { dealer: 'ডিলার', retailer: 'রিটেইলার', farmer: 'কৃষক' };
    const t = el('table', { className: 'sf-table' });
    t.appendChild(el('thead', {}, [el('tr', {}, [
        el('th', { textContent: 'নাম' }), el('th', { textContent: 'ফোন' }),
        el('th', { textContent: 'ধরন' }), el('th', { textContent: 'ঠিকানা' }),
        el('th', { textContent: 'বকেয়' }), el('th', { textContent: 'কার্যক্রম' })
    ])]));
    const tb = el('tbody');
    customers.forEach(cu => {
        tb.appendChild(el('tr', {}, [
            el('td', { textContent: cu.name }),
            el('td', { textContent: cu.phone }),
            el('td', { textContent: tl[cu.type] || cu.type }),
            el('td', { textContent: cu.address }),
            el('td', { textContent: fmtCur(getOutstanding(cu.id)) }),
            el('td', {}, [
                el('button', { className: 'btn btn-sm btn-secondary', textContent: 'এডিট',
                    onClick: () => createCustomerForm(containerId, cu.id) }),
                el('button', { className: 'btn btn-sm btn-danger', textContent: 'মুছুন',
                    onClick: () => { if (confirm('গ্রাহক মুছে ফেলতে চান?')) { deleteCustomer(cu.id); createCustomerList(containerId); } } })
            ])
        ]));
    });
    t.appendChild(tb);
    c.appendChild(t);
}

// ======================================
// UI: Customer Form
// ======================================

function createCustomerForm(containerId, editId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const existing = editId ? getCustomer(editId) : null;
    const form = el('form', { className: 'sf-form' });
    form.appendChild(el('h3', { textContent: existing ? 'গ্রাহক সম্পাদনা' : 'নতুন গ্রাহক যোগ' }));

    [['নাম', 'name', existing?.name], ['ফোন', 'phone', existing?.phone], ['ঠিকানা', 'address', existing?.address]]
        .forEach(([label, name, value]) => {
            form.appendChild(el('div', { className: 'form-group' }, [
                el('label', { textContent: label }),
                el('input', { type: 'text', name, value: value || '', className: 'form-control' })
            ]));
        });

    const tg = el('div', { className: 'form-group' });
    tg.appendChild(el('label', { textContent: 'ধরন' }));
    const sel = el('select', { name: 'type', className: 'form-control' });
    [['farmer', 'কৃষক'], ['retailer', 'রিটেইলার'], ['dealer', 'ডিলার']].forEach(([v, t]) => {
        const o = el('option', { value: v, textContent: t });
        if (existing?.type === v) o.selected = true;
        sel.appendChild(o);
    });
    tg.appendChild(sel);
    form.appendChild(tg);

    form.appendChild(el('div', { className: 'form-actions' }, [
        el('button', { type: 'submit', className: 'btn btn-primary', textContent: existing ? 'আপডেট' : 'সংরক্ষণ' }),
        el('button', { type: 'button', className: 'btn btn-secondary', textContent: 'বাতিল',
            onClick: () => createCustomerList(containerId) })
    ]));

    form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        const data = { name: fd.get('name'), phone: fd.get('phone'), address: fd.get('address'), type: fd.get('type') };
        if (!data.name) { alert('নাম আবশ্যক'); return; }
        existing ? updateCustomer(editId, data) : createCustomer(data);
        createCustomerList(containerId);
    });
    c.appendChild(form);
}

// ======================================
// UI: Order List
// ======================================

function createOrderList(containerId, filter = {}) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    let orders = loadData(STORAGE_KEYS.orders);
    if (filter.customerId) orders = orders.filter(o => o.customerId === filter.customerId);
    if (filter.status) orders = orders.filter(o => o.status === filter.status);
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));

    c.appendChild(el('div', { className: 'sf-list-header' }, [
        el('h3', { textContent: 'অর্ডার তালিকা' }),
        el('button', { className: 'btn btn-primary', textContent: '+ নতুন অর্ডার',
            onClick: () => createOrderForm(containerId) })
    ]));

    if (!orders.length) {
        c.appendChild(el('div', { className: 'sf-empty', textContent: 'কোনো অর্ডার নেই' }));
        return;
    }

    const t = el('table', { className: 'sf-table' });
    t.appendChild(el('thead', {}, [el('tr', {}, [
        el('th', { textContent: 'ইনভয়েস' }), el('th', { textContent: 'গ্রাহক' }),
        el('th', { textContent: 'তারিখ' }), el('th', { textContent: 'মোট' }),
        el('th', { textContent: 'পরিশোধ' }), el('th', { textContent: 'স্ট্যাটাস' }),
        el('th', { textContent: 'কার্যক্রম' })
    ])]));
    const tb = el('tbody');
    orders.forEach(o => {
        const cu = getCustomer(o.customerId);
        const tot = orderTotal(o);
        const pd = paidTotal(o.id);
        tb.appendChild(el('tr', {}, [
            el('td', { textContent: o.invoiceNumber }),
            el('td', { textContent: cu?.name || 'অজানা' }),
            el('td', { textContent: fmtDate(o.date) }),
            el('td', { textContent: fmtCur(tot) }),
            el('td', {}, [el('span', { textContent: fmtCur(pd) + ' ' }), badge(o.paymentStatus)]),
            el('td', {}, [badge(o.status)]),
            el('td', {}, [
                el('button', { className: 'btn btn-sm btn-info', textContent: 'ইনভয়েস',
                    onClick: () => createInvoicePreview(containerId, o.id) }),
                el('button', { className: 'btn btn-sm btn-secondary', textContent: 'এডিট',
                    onClick: () => createOrderForm(containerId, o.customerId, o.id) }),
                el('button', { className: 'btn btn-sm btn-danger', textContent: 'মুছুন',
                    onClick: () => { if (confirm('অর্ডার মুছে ফেলতে চান?')) { deleteOrder(o.id); createOrderList(containerId, filter); } } })
            ])
        ]));
    });
    t.appendChild(tb);
    c.appendChild(t);
}

// ======================================
// UI: Order Form
// ======================================

function createOrderForm(containerId, customerId, editId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const existing = editId ? getOrder(editId) : null;
    const customers = getAllCustomers();
    const form = el('form', { className: 'sf-form' });
    form.appendChild(el('h3', { textContent: existing ? 'অর্ডার সম্পাদনা' : 'নতুন অর্ডার' }));

    const cg = el('div', { className: 'form-group' });
    cg.appendChild(el('label', { textContent: 'গ্রাহক' }));
    const cs = el('select', { name: 'customerId', className: 'form-control' });
    cs.appendChild(el('option', { value: '', textContent: '-- গ্রাহক নির্বাচন --' }));
    customers.forEach(cu => {
        const o = el('option', { value: cu.id, textContent: `${cu.name} (${cu.phone})` });
        if ((existing?.customerId === cu.id) || customerId === cu.id) o.selected = true;
        cs.appendChild(o);
    });
    cg.appendChild(cs);
    form.appendChild(cg);

    form.appendChild(el('div', { className: 'form-group' }, [
        el('label', { textContent: 'তারিখ' }),
        el('input', { type: 'date', name: 'date',
            value: existing?.date?.split('T')[0] || new Date().toISOString().split('T')[0],
            className: 'form-control' })
    ]));

    const is = el('div', { className: 'sf-items-section' });
    is.appendChild(el('label', { textContent: 'পণ্য' }));
    const ic = el('div', { className: 'sf-items-list' });
    let ci = existing?.items?.length ? [...existing.items] : [{ name: '', qty: 1, price: 0, unit: '' }];

    function ri(items) {
        ic.innerHTML = '';
        items.forEach((it, idx) => {
            ic.appendChild(el('div', { className: 'sf-item-row' }, [
                el('input', { type: 'text', placeholder: 'পণ্যের নাম', value: it.name, className: 'form-control item-name' }),
                el('input', { type: 'number', placeholder: 'পরিমাণ', value: it.qty, className: 'form-control item-qty', min: '0' }),
                el('input', { type: 'text', placeholder: 'একক', value: it.unit || '', className: 'form-control item-unit' }),
                el('input', { type: 'number', placeholder: 'মূল্য', value: it.price, className: 'form-control item-price', min: '0' }),
                el('button', { type: 'button', className: 'btn btn-sm btn-danger', textContent: '×',
                    onClick: () => { ci.splice(idx, 1); ri(ci); } })
            ]));
        });
    }
    ri(ci);

    is.appendChild(ic);
    is.appendChild(el('button', { type: 'button', className: 'btn btn-sm btn-secondary',
        textContent: '+ পণ্য যোগ', onClick: () => { ci.push({ name: '', qty: 1, price: 0, unit: '' }); ri(ci); } }));
    form.appendChild(is);

    if (existing) {
        const sg = el('div', { className: 'form-group' });
        sg.appendChild(el('label', { textContent: 'স্ট্যাটাস' }));
        const ss = el('select', { name: 'status', className: 'form-control' });
        [['pending', 'অপেক্ষমান'], ['confirmed', 'নিশ্চিত'], ['delivered', 'ডেলিভারি সম্পন্ন'], ['cancelled', 'বাতিল']]
            .forEach(([v, t]) => {
                const o = el('option', { value: v, textContent: t });
                if (existing.status === v) o.selected = true;
                ss.appendChild(o);
            });
        sg.appendChild(ss);
        form.appendChild(sg);
    }

    form.appendChild(el('div', { className: 'form-actions' }, [
        el('button', { type: 'submit', className: 'btn btn-primary', textContent: existing ? 'আপডেট' : 'সংরক্ষণ' }),
        el('button', { type: 'button', className: 'btn btn-secondary', textContent: 'বাতিল',
            onClick: () => createOrderList(containerId) })
    ]));

    form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        const items = [];
        ic.querySelectorAll('.sf-item-row').forEach(row => {
            const name = row.querySelector('.item-name').value.trim();
            const qty = Number(row.querySelector('.item-qty').value) || 0;
            const price = Number(row.querySelector('.item-price').value) || 0;
            const unit = row.querySelector('.item-unit').value.trim();
            if (name && qty > 0) items.push({ name, qty, price, unit });
        });
        const data = { customerId: fd.get('customerId'), date: fd.get('date'), items, status: fd.get('status') || existing?.status || 'pending' };
        if (!data.customerId) { alert('গ্রাহক নির্বাচন করুন'); return; }
        if (!items.length) { alert('কমপক্ষে একটি পণ্য যোগ করুন'); return; }
        existing ? updateOrder(editId, data) : createOrder(data);
        createOrderList(containerId);
    });
    c.appendChild(form);
}

// ======================================
// UI: Invoice Preview
// ======================================

function createInvoicePreview(containerId, orderId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const inv = generateInvoice(orderId);
    if (!inv) { c.appendChild(el('div', { className: 'sf-error', textContent: 'ইনভয়েস পাওয়া যায়নি' })); return; }

    const w = el('div', { className: 'sf-invoice-preview' });
    w.appendChild(el('div', { className: 'sf-invoice-header' }, [
        el('h2', { textContent: 'সৌরভ ফার্টিলাইজার' }),
        el('p', { textContent: 'ইনভয়েস নং: ' + inv.invoiceNumber }),
        el('p', { textContent: 'তারিখ: ' + fmtDate(inv.date) })
    ]));
    w.appendChild(el('div', { className: 'sf-invoice-customer' }, [
        el('h4', { textContent: 'গ্রাহক তথ্য' }),
        el('p', { textContent: `নাম: ${inv.customer.name}` }),
        el('p', { textContent: `ফোন: ${inv.customer.phone}` }),
        el('p', { textContent: `ঠিকানা: ${inv.customer.address}` })
    ]));

    const t = el('table', { className: 'sf-table sf-invoice-table' });
    t.appendChild(el('thead', {}, [el('tr', {}, [
        el('th', { textContent: '#' }), el('th', { textContent: 'পণ্য' }),
        el('th', { textContent: 'পরিমাণ' }), el('th', { textContent: 'একক' }),
        el('th', { textContent: 'মূল্য' }), el('th', { textContent: 'মোট' })
    ])]));
    const tb = el('tbody');
    inv.items.forEach((item, idx) => {
        tb.appendChild(el('tr', {}, [
            el('td', { textContent: String(idx + 1) }),
            el('td', { textContent: item.name }),
            el('td', { textContent: String(item.qty) }),
            el('td', { textContent: item.unit || '-' }),
            el('td', { textContent: fmtCur(item.price) }),
            el('td', { textContent: fmtCur(item.qty * item.price) })
        ]));
    });
    t.appendChild(tb);
    w.appendChild(t);

    w.appendChild(el('div', { className: 'sf-invoice-summary' }, [
        el('div', { className: 'sf-summary-row' }, [el('span', { textContent: 'মোট:' }), el('strong', { textContent: fmtCur(inv.subtotal) })]),
        el('div', { className: 'sf-summary-row' }, [el('span', { textContent: 'পরিশোধিত:' }), el('span', { textContent: fmtCur(inv.totalPaid) })]),
        el('div', { className: 'sf-summary-row sf-due' }, [el('span', { textContent: 'বকেয়:' }), el('strong', { textContent: fmtCur(inv.dueAmount) })]),
        el('div', { className: 'sf-summary-row' }, [el('span', { textContent: 'পরিশোধ স্ট্যাটাস:' }), badge(inv.paymentStatus)])
    ]));

    w.appendChild(el('div', { className: 'form-actions', style: 'margin-top:1rem' }, [
        el('button', { className: 'btn btn-secondary', textContent: '← তালিকায় ফিরুন', onClick: () => createOrderList(containerId) }),
        el('button', { className: 'btn btn-primary', textContent: 'প্রিন্ট', onClick: () => window.print() })
    ]));
    c.appendChild(w);
}

// ======================================
// UI: Sales Dashboard
// ======================================

function createSalesDashboard(containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const stats = getSalesStats();
    const outstanding = getOutstandingTotal();
    const topCust = getTopCustomers(5);
    const topProd = getSalesByProduct().slice(0, 5);

    c.appendChild(el('div', { className: 'sf-stats-grid' }, [
        el('div', { className: 'sf-stat-card' }, [el('div', { className: 'sf-stat-value', textContent: String(stats.totalOrders) }), el('div', { className: 'sf-stat-label', textContent: 'মোট অর্ডার' })]),
        el('div', { className: 'sf-stat-card' }, [el('div', { className: 'sf-stat-value', textContent: fmtCur(stats.totalRevenue) }), el('div', { className: 'sf-stat-label', textContent: 'মোট আয়' })]),
        el('div', { className: 'sf-stat-card' }, [el('div', { className: 'sf-stat-value', textContent: fmtCur(outstanding) }), el('div', { className: 'sf-stat-label', textContent: 'মোট বকেয়' })]),
        el('div', { className: 'sf-stat-card' }, [el('div', { className: 'sf-stat-value', textContent: String(stats.pendingOrders) }), el('div', { className: 'sf-stat-label', textContent: 'অপেক্ষমান' })])
    ]));

    const cs = el('div', { className: 'sf-section' });
    cs.appendChild(el('h3', { textContent: 'শীর্ষ গ্রাহক' }));
    if (topCust.length) {
        const list = el('div', { className: 'sf-list' });
        topCust.forEach((cu, i) => list.appendChild(el('div', { className: 'sf-list-item' }, [
            el('span', { textContent: `${i + 1}. ${cu.name}` }),
            el('span', { textContent: `${cu.count} অর্ডার | ${fmtCur(cu.total)}` })
        ])));
        cs.appendChild(list);
    } else cs.appendChild(el('p', { textContent: 'কোনো তথ্য নেই' }));
    c.appendChild(cs);

    const ps = el('div', { className: 'sf-section' });
    ps.appendChild(el('h3', { textContent: 'শীর্ষ পণ্য' }));
    if (topProd.length) {
        const list = el('div', { className: 'sf-list' });
        topProd.forEach((p, i) => list.appendChild(el('div', { className: 'sf-list-item' }, [
            el('span', { textContent: `${i + 1}. ${p.name}` }),
            el('span', { textContent: `${p.qty} একক | ${fmtCur(p.revenue)}` })
        ])));
        ps.appendChild(list);
    } else ps.appendChild(el('p', { textContent: 'কোনো তথ্য নেই' }));
    c.appendChild(ps);
}

// ======================================
// UI: Outstanding Report
// ======================================

function createOutstandingReport(containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const oc = getAllCustomers()
        .map(cu => ({ ...cu, outstanding: getOutstanding(cu.id) }))
        .filter(cu => cu.outstanding > 0)
        .sort((a, b) => b.outstanding - a.outstanding);

    c.appendChild(el('h3', { textContent: 'বকেয় রিপোর্ট' }));
    c.appendChild(el('div', { className: 'sf-summary-row sf-total-outstanding' }, [
        el('span', { textContent: 'মোট বকেয়:' }),
        el('strong', { textContent: fmtCur(oc.reduce((s, cu) => s + cu.outstanding, 0)) })
    ]));

    if (!oc.length) {
        c.appendChild(el('div', { className: 'sf-empty', textContent: 'কোনো বকেয় নেই' }));
        return;
    }

    const tl = { dealer: 'ডিলার', retailer: 'রিটেইলার', farmer: 'কৃষক' };
    const t = el('table', { className: 'sf-table' });
    t.appendChild(el('thead', {}, [el('tr', {}, [
        el('th', { textContent: '#' }), el('th', { textContent: 'নাম' }),
        el('th', { textContent: 'ফোন' }), el('th', { textContent: 'ধরন' }),
        el('th', { textContent: 'বকেয়' })
    ])]));
    const tb = el('tbody');
    oc.forEach((cu, i) => {
        tb.appendChild(el('tr', {}, [
            el('td', { textContent: String(i + 1) }),
            el('td', { textContent: cu.name }),
            el('td', { textContent: cu.phone }),
            el('td', { textContent: tl[cu.type] || cu.type }),
            el('td', { textContent: fmtCur(cu.outstanding) })
        ]));
    });
    t.appendChild(tb);
    c.appendChild(t);
}

// ======================================
// Export
// ======================================

function exportSales(farmId, format = 'csv') {
    let orders = loadData(STORAGE_KEYS.orders);
    if (farmId) orders = orders.filter(o => o.farmId === farmId);

    if (format === 'csv') {
        const headers = ['ইনভয়েস', 'গ্রাহক', 'তারিখ', 'মোট', 'পরিশোধ', 'স্ট্যাটাস'];
        const rows = orders.map(o => [o.invoiceNumber, getCustomer(o.customerId)?.name || '', fmtDate(o.date), orderTotal(o), paidTotal(o.id), o.status]);
        dlFile([headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n'), 'sales_export.csv', 'text/csv');
    } else {
        const data = orders.map(o => ({ ...o, customer: getCustomer(o.customerId), total: orderTotal(o), paid: paidTotal(o.id) }));
        dlFile(JSON.stringify(data, null, 2), 'sales_export.json', 'application/json');
    }
}

function exportInvoice(orderId, format = 'print') {
    if (format === 'print') { window.print(); return; }
    const inv = generateInvoice(orderId);
    if (!inv) return;
    const lines = [
        'সৌরভ ফার্টিলাইজার',
        `ইনভয়েস নং: ${inv.invoiceNumber}`,
        `তারিখ: ${fmtDate(inv.date)}`,
        '', `গ্রাহক: ${inv.customer.name}`,
        `ফোন: ${inv.customer.phone}`,
        `ঠিকানা: ${inv.customer.address}`,
        '', '--- পণ্য ---',
        ...inv.items.map((i, n) => `${n + 1}. ${i.name} | ${i.qty} ${i.unit || ''} | ${fmtCur(i.price)} | ${fmtCur(i.qty * i.price)}`),
        '', `মোট: ${fmtCur(inv.subtotal)}`,
        `পরিশোধিত: ${fmtCur(inv.totalPaid)}`,
        `বকেয়: ${fmtCur(inv.dueAmount)}`
    ];
    dlFile(lines.join('\n'), `invoice_${inv.invoiceNumber}.txt`, 'text/plain');
}

// ======================================
// Public API
// ======================================

export const SFSale = {
    init() {},
    createCustomer, updateCustomer, deleteCustomer, getCustomer, getAllCustomers,
    createOrder, updateOrder, deleteOrder, getOrder,
    generateInvoice, getInvoice,
    recordPayment, getPayments, getOutstanding, getOutstandingTotal,
    getSalesStats, getMonthlySales, getTopCustomers, getSalesByProduct,
    createCustomerList, createCustomerForm,
    createOrderList, createOrderForm, createInvoicePreview,
    createSalesDashboard, createOutstandingReport,
    exportSales, exportInvoice
};
