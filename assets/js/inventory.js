// ======================================
// V20 Inventory Management
// Sowrov Fertilizer ERP
// ======================================

const STORAGE_KEYS = {
    inventory: 'sf_inventory',
    suppliers: 'sf_suppliers',
    stockHistory: 'sf_stock_history'
};

const CURRENCY = '৳';

const CATEGORIES = {
    seed: 'বীজ',
    fertilizer: 'সার',
    pesticide: 'কীটনাশক',
    herbicide: 'তৃণনাশক',
    equipment: 'সরঞ্জাম',
    other: 'অন্যান্য'
};

const STATUS = {
    in_stock: 'স্টক আছে',
    low_stock: 'কম স্টক',
    out_of_stock: 'স্টক শেষ',
    expired: 'মেয়াদোত্তীর্ণ'
};

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

function getItemStatus(item) {
    const qty = Number(item.quantity || 0);
    const min = Number(item.minStock || 0);
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) return 'expired';
    if (qty <= 0) return 'out_of_stock';
    if (min > 0 && qty <= min) return 'low_stock';
    return 'in_stock';
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
    const text = STATUS[status] || status;
    const cls = { in_stock: 'badge-success', low_stock: 'badge-warning', out_of_stock: 'badge-danger', expired: 'badge-danger' }[status] || 'badge-secondary';
    return el('span', { className: `badge ${cls}`, textContent: text });
}

function catBadge(cat) {
    return el('span', { className: 'badge badge-info', textContent: CATEGORIES[cat] || cat });
}

// ======================================
// CRUD
// ======================================

function addItem(data) {
    const item = {
        id: generateId(),
        name: data.name || '',
        category: data.category || 'other',
        quantity: Number(data.quantity) || 0,
        unit: data.unit || 'কেজি',
        minStock: Number(data.minStock) || 0,
        price: Number(data.price) || 0,
        supplier: data.supplier || '',
        purchaseDate: data.purchaseDate || new Date().toISOString(),
        expiryDate: data.expiryDate || '',
        batchNumber: data.batchNumber || '',
        status: '',
        createdAt: new Date().toISOString()
    };
    item.status = getItemStatus(item);
    const list = loadData(STORAGE_KEYS.inventory);
    list.push(item);
    saveData(STORAGE_KEYS.inventory, list);
    if (item.quantity > 0) {
        addStockHistory(item.id, 'initial', item.quantity, item.price, 'প্রাথমিক স্টক');
    }
    return item;
}

function updateItem(id, data) {
    const list = loadData(STORAGE_KEYS.inventory);
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
    list[idx].status = getItemStatus(list[idx]);
    saveData(STORAGE_KEYS.inventory, list);
    return list[idx];
}

function deleteItem(id) {
    saveData(STORAGE_KEYS.inventory, loadData(STORAGE_KEYS.inventory).filter(i => i.id !== id));
    saveData(STORAGE_KEYS.stockHistory, loadData(STORAGE_KEYS.stockHistory).filter(h => h.itemId !== id));
}

function getItem(id) {
    const item = loadData(STORAGE_KEYS.inventory).find(i => i.id === id);
    return item ? { ...item, status: getItemStatus(item) } : null;
}

function getAllItems() {
    return loadData(STORAGE_KEYS.inventory).map(i => ({ ...i, status: getItemStatus(i) }));
}

// ======================================
// Stock Management
// ======================================

function addStockHistory(itemId, type, quantity, cost, notes) {
    const history = loadData(STORAGE_KEYS.stockHistory);
    history.push({
        id: generateId(), itemId, type,
        quantity: Number(quantity), cost: Number(cost) || 0,
        notes: notes || '', date: new Date().toISOString()
    });
    saveData(STORAGE_KEYS.stockHistory, history);
}

function addStock(itemId, quantity, cost) {
    const list = loadData(STORAGE_KEYS.inventory);
    const idx = list.findIndex(i => i.id === itemId);
    if (idx === -1) return null;
    list[idx].quantity = Number(list[idx].quantity || 0) + Number(quantity);
    if (cost) list[idx].price = Number(cost);
    list[idx].status = getItemStatus(list[idx]);
    list[idx].updatedAt = new Date().toISOString();
    saveData(STORAGE_KEYS.inventory, list);
    addStockHistory(itemId, 'in', quantity, cost, 'স্টক যোগ');
    return list[idx];
}

function removeStock(itemId, quantity, reason) {
    const list = loadData(STORAGE_KEYS.inventory);
    const idx = list.findIndex(i => i.id === itemId);
    if (idx === -1) return null;
    const removeQty = Number(quantity);
    if (list[idx].quantity < removeQty) return null;
    list[idx].quantity = Number(list[idx].quantity) - removeQty;
    list[idx].status = getItemStatus(list[idx]);
    list[idx].updatedAt = new Date().toISOString();
    saveData(STORAGE_KEYS.inventory, list);
    addStockHistory(itemId, 'out', removeQty, 0, reason || 'স্টক বিতরণ');
    return list[idx];
}

function getStockHistory(itemId) {
    return loadData(STORAGE_KEYS.stockHistory)
        .filter(h => h.itemId === itemId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ======================================
// Alerts
// ======================================

function getLowStockItems() {
    return getAllItems().filter(i => i.status === 'low_stock');
}

function getExpiringItems(withinDays = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    return getAllItems().filter(i => {
        if (!i.expiryDate) return false;
        const exp = new Date(i.expiryDate);
        return exp <= cutoff && exp >= new Date();
    });
}

function getOutOfStockItems() {
    return getAllItems().filter(i => i.status === 'out_of_stock');
}

// ======================================
// Suppliers
// ======================================

function addSupplier(data) {
    const supplier = {
        id: generateId(), name: data.name || '', phone: data.phone || '',
        address: data.address || '', products: data.products || [],
        createdAt: new Date().toISOString()
    };
    const list = loadData(STORAGE_KEYS.suppliers);
    list.push(supplier);
    saveData(STORAGE_KEYS.suppliers, list);
    return supplier;
}

function getSuppliers() {
    return loadData(STORAGE_KEYS.suppliers);
}

function deleteSupplier(id) {
    saveData(STORAGE_KEYS.suppliers, loadData(STORAGE_KEYS.suppliers).filter(s => s.id !== id));
}

// ======================================
// Statistics
// ======================================

function getInventoryStats() {
    const items = getAllItems();
    return {
        totalItems: items.length,
        totalQuantity: items.reduce((s, i) => s + Number(i.quantity || 0), 0),
        stockValue: items.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.price || 0), 0),
        lowStock: items.filter(i => i.status === 'low_stock').length,
        outOfStock: items.filter(i => i.status === 'out_of_stock').length,
        expired: items.filter(i => i.status === 'expired').length
    };
}

function getCategoryBreakdown() {
    const breakdown = {};
    Object.keys(CATEGORIES).forEach(k => breakdown[k] = { label: CATEGORIES[k], count: 0, value: 0 });
    getAllItems().forEach(i => {
        if (breakdown[i.category]) {
            breakdown[i.category].count++;
            breakdown[i.category].value += Number(i.quantity || 0) * Number(i.price || 0);
        }
    });
    return breakdown;
}

function getStockValue() {
    return getAllItems().reduce((s, i) => s + Number(i.quantity || 0) * Number(i.price || 0), 0);
}

// ======================================
// UI: Inventory List
// ======================================

function createInventoryList(containerId, filter = {}) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    let items = getAllItems();
    if (filter.category) items = items.filter(i => i.category === filter.category);
    if (filter.status) items = items.filter(i => i.status === filter.status);
    if (filter.search) {
        const q = filter.search.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(q) || i.batchNumber?.toLowerCase().includes(q));
    }

    c.appendChild(el('div', { className: 'sf-list-header' }, [
        el('h3', { textContent: 'ইনভেন্টরি তালিকা' }),
        el('button', { className: 'btn btn-primary', textContent: '+ নতুন পণ্য',
            onClick: () => createItemForm(containerId) })
    ]));

    const filterBar = el('div', { className: 'sf-filter-bar' });
    const catSel = el('select', { className: 'form-control' });
    catSel.appendChild(el('option', { value: '', textContent: 'সব ক্যাটাগরি' }));
    Object.entries(CATEGORIES).forEach(([k, v]) => catSel.appendChild(el('option', { value: k, textContent: v })));
    if (filter.category) catSel.value = filter.category;
    catSel.addEventListener('change', () => createInventoryList(containerId, { ...filter, category: catSel.value }));
    filterBar.appendChild(catSel);

    const statusSel = el('select', { className: 'form-control' });
    statusSel.appendChild(el('option', { value: '', textContent: 'সব স্ট্যাটাস' }));
    Object.entries(STATUS).forEach(([k, v]) => statusSel.appendChild(el('option', { value: k, textContent: v })));
    if (filter.status) statusSel.value = filter.status;
    statusSel.addEventListener('change', () => createInventoryList(containerId, { ...filter, status: statusSel.value }));
    filterBar.appendChild(statusSel);

    const searchIn = el('input', { type: 'text', className: 'form-control', placeholder: 'পণ্য খুঁজুন...', value: filter.search || '' });
    let timeout;
    searchIn.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => createInventoryList(containerId, { ...filter, search: searchIn.value }), 300);
    });
    filterBar.appendChild(searchIn);
    c.appendChild(filterBar);

    if (!items.length) {
        c.appendChild(el('div', { className: 'sf-empty', textContent: 'কোনো পণ্য পাওয়া যায়নি' }));
        return;
    }

    const t = el('table', { className: 'sf-table' });
    t.appendChild(el('thead', {}, [el('tr', {}, [
        el('th', { textContent: 'নাম' }), el('th', { textContent: 'ক্যাটাগরি' }),
        el('th', { textContent: 'স্টক' }), el('th', { textContent: 'একক মূল্য' }),
        el('th', { textContent: 'মোট মূল্য' }), el('th', { textContent: 'মেয়াদ' }),
        el('th', { textContent: 'স্ট্যাটাস' }), el('th', { textContent: 'কার্যক্রম' })
    ])]));
    const tb = el('tbody');
    items.forEach(item => {
        const tv = Number(item.quantity || 0) * Number(item.price || 0);
        tb.appendChild(el('tr', {}, [
            el('td', {}, [
                el('strong', { textContent: item.name }),
                item.batchNumber ? el('small', { textContent: ` ব্যাচ: ${item.batchNumber}`, style: { display: 'block', color: '#888' } }) : null
            ]),
            el('td', {}, [catBadge(item.category)]),
            el('td', { textContent: `${item.quantity} ${item.unit}` }),
            el('td', { textContent: fmtCur(item.price) }),
            el('td', { textContent: fmtCur(tv) }),
            el('td', { textContent: item.expiryDate ? fmtDate(item.expiryDate) : '-' }),
            el('td', {}, [badge(item.status)]),
            el('td', {}, [
                el('button', { className: 'btn btn-sm btn-info', textContent: 'স্টক +',
                    onClick: () => createStockAdjustment(containerId, item.id) }),
                el('button', { className: 'btn btn-sm btn-secondary', textContent: 'এডিট',
                    onClick: () => createItemForm(containerId, item.id) }),
                el('button', { className: 'btn btn-sm btn-danger', textContent: 'মুছুন',
                    onClick: () => { if (confirm('পণ্য মুছে ফেলতে চান?')) { deleteItem(item.id); createInventoryList(containerId, filter); } } })
            ])
        ]));
    });
    t.appendChild(tb);
    c.appendChild(t);
}

// ======================================
// UI: Item Form
// ======================================

function createItemForm(containerId, editId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const existing = editId ? getItem(editId) : null;
    const form = el('form', { className: 'sf-form' });
    form.appendChild(el('h3', { textContent: existing ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ' }));

    [['পণ্যের নাম', 'name', existing?.name],
     ['ব্যাচ নম্বর', 'batchNumber', existing?.batchNumber]].forEach(([label, name, value]) => {
        form.appendChild(el('div', { className: 'form-group' }, [
            el('label', { textContent: label }),
            el('input', { type: 'text', name, value: value || '', className: 'form-control' })
        ]));
    });

    [['পরিমাণ', 'quantity', existing?.quantity || '0'],
     ['সর্বনিম্ন স্টক', 'minStock', existing?.minStock || '0'],
     ['একক মূল্য', 'price', existing?.price || '0']].forEach(([label, name, value]) => {
        form.appendChild(el('div', { className: 'form-group' }, [
            el('label', { textContent: `${label} (${CURRENCY})` }),
            el('input', { type: 'number', name, value, className: 'form-control', min: '0' })
        ]));
    });

    [['একক', 'unit', existing?.unit || 'কেজি'],
     ['সরবরাহকারী', 'supplier', existing?.supplier]].forEach(([label, name, value]) => {
        form.appendChild(el('div', { className: 'form-group' }, [
            el('label', { textContent: label }),
            el('input', { type: 'text', name, value: value || '', className: 'form-control' })
        ]));
    });

    [['ক্রয়ের তারিখ', 'purchaseDate', existing?.purchaseDate?.split('T')[0]],
     ['মেয়াদ উত্তীর্ণ', 'expiryDate', existing?.expiryDate?.split('T')[0]]].forEach(([label, name, value]) => {
        form.appendChild(el('div', { className: 'form-group' }, [
            el('label', { textContent: label }),
            el('input', { type: 'date', name, value: value || '', className: 'form-control' })
        ]));
    });

    const catGrp = el('div', { className: 'form-group' });
    catGrp.appendChild(el('label', { textContent: 'ক্যাটাগরি' }));
    const catSel = el('select', { name: 'category', className: 'form-control' });
    Object.entries(CATEGORIES).forEach(([k, v]) => {
        const o = el('option', { value: k, textContent: v });
        if (existing?.category === k) o.selected = true;
        catSel.appendChild(o);
    });
    catGrp.appendChild(catSel);
    form.appendChild(catGrp);

    form.appendChild(el('div', { className: 'form-actions' }, [
        el('button', { type: 'submit', className: 'btn btn-primary', textContent: existing ? 'আপডেট' : 'সংরক্ষণ' }),
        el('button', { type: 'button', className: 'btn btn-secondary', textContent: 'বাতিল',
            onClick: () => createInventoryList(containerId) })
    ]));

    form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        const data = {
            name: fd.get('name'), category: fd.get('category'),
            quantity: Number(fd.get('quantity')), unit: fd.get('unit'),
            minStock: Number(fd.get('minStock')), price: Number(fd.get('price')),
            supplier: fd.get('supplier'), purchaseDate: fd.get('purchaseDate'),
            expiryDate: fd.get('expiryDate'), batchNumber: fd.get('batchNumber')
        };
        if (!data.name) { alert('পণ্যের নাম আবশ্যক'); return; }
        existing ? updateItem(editId, data) : addItem(data);
        createInventoryList(containerId);
    });
    c.appendChild(form);
}

// ======================================
// UI: Stock Adjustment
// ======================================

function createStockAdjustment(containerId, itemId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const item = getItem(itemId);
    if (!item) {
        c.appendChild(el('div', { className: 'sf-error', textContent: 'পণ্য পাওয়া যায়নি' }));
        return;
    }

    const wrapper = el('div', { className: 'sf-form' });
    wrapper.appendChild(el('h3', { textContent: `স্টক সমন্বয়: ${item.name}` }));
    wrapper.appendChild(el('p', { textContent: `বর্তমান স্টক: ${item.quantity} ${item.unit}` }));

    const form = el('form');
    const ag = el('div', { className: 'form-group' });
    ag.appendChild(el('label', { textContent: 'কার্যক্রম' }));
    const actionSel = el('select', { name: 'action', className: 'form-control' });
    actionSel.appendChild(el('option', { value: 'in', textContent: 'স্টক যোগ' }));
    actionSel.appendChild(el('option', { value: 'out', textContent: 'স্টক বিতরণ' }));
    ag.appendChild(actionSel);
    form.appendChild(ag);

    form.appendChild(el('div', { className: 'form-group' }, [
        el('label', { textContent: 'পরিমাণ' }),
        el('input', { type: 'number', name: 'quantity', className: 'form-control', min: '1', value: '1', required: true })
    ]));

    const costGrp = el('div', { className: 'form-group' }, [
        el('label', { textContent: `একক মূল্য (${CURRENCY})` }),
        el('input', { type: 'number', name: 'cost', className: 'form-control', min: '0', value: String(item.price || 0) })
    ]);
    form.appendChild(costGrp);

    form.appendChild(el('div', { className: 'form-group' }, [
        el('label', { textContent: 'কারণ' }),
        el('input', { type: 'text', name: 'reason', className: 'form-control', placeholder: 'কারণ লিখুন...' })
    ]));

    actionSel.addEventListener('change', () => {
        costGrp.style.display = actionSel.value === 'in' ? '' : 'none';
    });

    const history = getStockHistory(itemId);
    if (history.length) {
        wrapper.appendChild(el('h4', { textContent: 'স্টক ইতিহাস' }));
        const ht = el('table', { className: 'sf-table' });
        ht.appendChild(el('thead', {}, [el('tr', {}, [
            el('th', { textContent: 'তারিখ' }), el('th', { textContent: 'ধরন' }),
            el('th', { textContent: 'পরিমাণ' }), el('th', { textContent: 'নোট' })
        ])]));
        const hb = el('tbody');
        history.slice(0, 10).forEach(h => {
            hb.appendChild(el('tr', {}, [
                el('td', { textContent: fmtDate(h.date) }),
                el('td', { textContent: h.type === 'in' ? 'যোগ' : 'বিতরণ' }),
                el('td', { textContent: `${h.type === 'in' ? '+' : '-'}${h.quantity}` }),
                el('td', { textContent: h.notes || '-' })
            ]));
        });
        ht.appendChild(hb);
        wrapper.appendChild(ht);
    }

    form.appendChild(el('div', { className: 'form-actions' }, [
        el('button', { type: 'submit', className: 'btn btn-primary', textContent: 'সমন্বয় করুন' }),
        el('button', { type: 'button', className: 'btn btn-secondary', textContent: 'বাতিল',
            onClick: () => createInventoryList(containerId) })
    ]));

    form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        const action = fd.get('action');
        const qty = Number(fd.get('quantity'));
        const cost = Number(fd.get('cost'));
        const reason = fd.get('reason');
        if (qty <= 0) { alert('পরিমাণ ০ বেশি হতে হবে'); return; }
        if (action === 'in') {
            if (!addStock(itemId, qty, cost)) { alert('স্টক যোগ করা যায়নি'); return; }
        } else {
            if (!removeStock(itemId, qty, reason)) { alert('পর্যাপ্ত স্টক নেই'); return; }
        }
        createInventoryList(containerId);
    });

    wrapper.appendChild(form);
    c.appendChild(wrapper);
}

// ======================================
// UI: Dashboard
// ======================================

function createInventoryDashboard(containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const stats = getInventoryStats();
    const breakdown = getCategoryBreakdown();

    c.appendChild(el('div', { className: 'sf-stats-grid' }, [
        el('div', { className: 'sf-stat-card' }, [el('div', { className: 'sf-stat-value', textContent: String(stats.totalItems) }), el('div', { className: 'sf-stat-label', textContent: 'মোট পণ্য' })]),
        el('div', { className: 'sf-stat-card' }, [el('div', { className: 'sf-stat-value', textContent: String(stats.totalQuantity) }), el('div', { className: 'sf-stat-label', textContent: 'মোট পরিমাণ' })]),
        el('div', { className: 'sf-stat-card' }, [el('div', { className: 'sf-stat-value', textContent: fmtCur(stats.stockValue) }), el('div', { className: 'sf-stat-label', textContent: 'মোট মূল্য' })]),
        el('div', { className: 'sf-stat-card sf-stat-warning' }, [el('div', { className: 'sf-stat-value', textContent: String(stats.lowStock) }), el('div', { className: 'sf-stat-label', textContent: 'কম স্টক' })]),
        el('div', { className: 'sf-stat-card sf-stat-danger' }, [el('div', { className: 'sf-stat-value', textContent: String(stats.outOfStock) }), el('div', { className: 'sf-stat-label', textContent: 'স্টক শেষ' })]),
        el('div', { className: 'sf-stat-card sf-stat-danger' }, [el('div', { className: 'sf-stat-value', textContent: String(stats.expired) }), el('div', { className: 'sf-stat-label', textContent: 'মেয়াদোত্তীর্ণ' })])
    ]));

    const cs = el('div', { className: 'sf-section' });
    cs.appendChild(el('h3', { textContent: 'ক্যাটাগরি ভিত্তিক বিশ্লেষণ' }));
    const list = el('div', { className: 'sf-list' });
    Object.values(breakdown).forEach(cat => {
        if (cat.count > 0) {
            list.appendChild(el('div', { className: 'sf-list-item' }, [
                el('span', { textContent: `${cat.label} (${cat.count}টি)` }),
                el('span', { textContent: fmtCur(cat.value) })
            ]));
        }
    });
    cs.appendChild(list);
    c.appendChild(cs);
}

// ======================================
// UI: Low Stock Alert
// ======================================

function createLowStockAlert(containerId) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const items = getLowStockItems();
    c.appendChild(el('h3', { textContent: `কম স্টক সতর্কতা (${items.length}টি)` }));

    if (!items.length) {
        c.appendChild(el('div', { className: 'sf-empty sf-success', textContent: 'সব পণ্যের স্টক পর্যাপ্ত আছে' }));
        return;
    }

    const t = el('table', { className: 'sf-table' });
    t.appendChild(el('thead', {}, [el('tr', {}, [
        el('th', { textContent: 'পণ্য' }), el('th', { textContent: 'বর্তমান স্টক' }),
        el('th', { textContent: 'সর্বনিম্ন' }), el('th', { textContent: 'অভাব' }),
        el('th', { textContent: 'কার্যক্রম' })
    ])]));
    const tb = el('tbody');
    items.forEach(item => {
        const deficit = Number(item.minStock) - Number(item.quantity);
        tb.appendChild(el('tr', {}, [
            el('td', { textContent: item.name }),
            el('td', { textContent: `${item.quantity} ${item.unit}` }),
            el('td', { textContent: `${item.minStock} ${item.unit}` }),
            el('td', { textContent: `${deficit} ${item.unit}` }),
            el('td', {}, [el('button', { className: 'btn btn-sm btn-primary', textContent: 'স্টক যোগ',
                onClick: () => createStockAdjustment(containerId, item.id) })])
        ]));
    });
    t.appendChild(tb);
    c.appendChild(t);
}

// ======================================
// UI: Expiry Alert
// ======================================

function createExpiryAlert(containerId, withinDays = 30) {
    const c = document.getElementById(containerId);
    if (!c) return;
    c.innerHTML = '';

    const items = getExpiringItems(withinDays);
    c.appendChild(el('h3', { textContent: `মেয়াদোত্তীর্ণ সতর্কতা (${withinDays} দিন - ${items.length}টি)` }));

    if (!items.length) {
        c.appendChild(el('div', { className: 'sf-empty sf-success', textContent: 'কোনো পণ্য মেয়াদোত্তীর্ণ হচ্ছে না' }));
        return;
    }

    const t = el('table', { className: 'sf-table' });
    t.appendChild(el('thead', {}, [el('tr', {}, [
        el('th', { textContent: 'পণ্য' }), el('th', { textContent: 'ক্যাটাগরি' }),
        el('th', { textContent: 'স্টক' }), el('th', { textContent: 'মেয়াদ শেষ' }),
        el('th', { textContent: 'বাকি দিন' }), el('th', { textContent: 'কার্যক্রম' })
    ])]));
    const tb = el('tbody');
    items.forEach(item => {
        const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / 864e5);
        const isUrgent = daysLeft <= 7;
        tb.appendChild(el('tr', { className: isUrgent ? 'sf-row-danger' : 'sf-row-warning' }, [
            el('td', { textContent: item.name }),
            el('td', {}, [catBadge(item.category)]),
            el('td', { textContent: `${item.quantity} ${item.unit}` }),
            el('td', { textContent: fmtDate(item.expiryDate) }),
            el('td', { textContent: `${daysLeft} দিন` }),
            el('td', {}, [el('button', { className: 'btn btn-sm btn-danger', textContent: 'বিতরণ করুন',
                onClick: () => createStockAdjustment(containerId, item.id) })])
        ]));
    });
    t.appendChild(tb);
    c.appendChild(t);
}

// ======================================
// Export
// ======================================

function exportInventory(format = 'csv') {
    const items = getAllItems();
    if (format === 'csv') {
        const headers = ['নাম', 'ক্যাটাগরি', 'স্টক', 'একক', 'একক মূল্য', 'মোট মূল্য', 'মেয়াদ', 'স্ট্যাটাস', 'ব্যাচ', 'সরবরাহকারী'];
        const rows = items.map(i => [
            i.name, CATEGORIES[i.category] || i.category, i.quantity, i.unit, i.price,
            Number(i.quantity || 0) * Number(i.price || 0),
            i.expiryDate ? fmtDate(i.expiryDate) : '-',
            STATUS[i.status] || i.status, i.batchNumber || '-', i.supplier || '-'
        ]);
        dlFile([headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n'), 'inventory_export.csv', 'text/csv');
    } else {
        dlFile(JSON.stringify(items, null, 2), 'inventory_export.json', 'application/json');
    }
}

// ======================================
// Public API
// ======================================

export const SFInventory = {
    init() {},
    addItem, updateItem, deleteItem, getItem, getAllItems,
    addStock, removeStock, getStockHistory,
    getLowStockItems, getExpiringItems, getOutOfStockItems,
    addSupplier, getSuppliers,
    getInventoryStats, getCategoryBreakdown, getStockValue,
    createInventoryList, createItemForm, createStockAdjustment,
    createInventoryDashboard, createLowStockAlert, createExpiryAlert,
    exportInventory
};
