/**
 * SF AI V20 — Export Module (V20)
 * ES module for multi-format data export
 * PDF, CSV, JSON, Excel — সমস্ত ডেটা এক্সপোর্ট
 */

const V20_EXPORT_VERSION = '20.0';

function v20GetStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function v20SetStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch { /* full */ }
}

function v20EscapeCSV(val) {
    if (val === null || val === undefined) return '';
    const s = String(val);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

function v20DownloadBlob(content, filename, mime) {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function v20FormatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '৳০';
    return '৳' + num.toLocaleString('bn-BD');
}

function v20FormatDate(iso) {
    try {
        return new Date(iso).toLocaleDateString('bn-BD', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return iso || '';
    }
}

function v20GetFarmData(farmId) {
    const farms = v20GetStorage('sf_farms') || v20GetStorage('sf_farm_list') || [];
    if (farmId) {
        return farms.find(f => f.id === farmId || String(f.id) === String(farmId)) || null;
    }
    return farms;
}

function v20GetExpenses(farmId) {
    let expenses = v20GetStorage('sf_expenses') || [];
    if (farmId) {
        expenses = expenses.filter(e => e.farmId === farmId || String(e.farmId) === String(farmId));
    }
    return expenses;
}

function v20GetSales(farmId) {
    let sales = v20GetStorage('sf_sales') || v20GetStorage('sf_orders') || [];
    if (farmId) {
        sales = sales.filter(s => s.farmId === farmId || String(s.farmId) === String(farmId));
    }
    return sales;
}

function v20GetInventory() {
    return v20GetStorage('sf_inventory') || v20GetStorage('sf_products') || [];
}

function v20GetTasks(farmId) {
    let tasks = v20GetStorage('sf_tasks') || [];
    if (farmId) {
        tasks = tasks.filter(t => t.farmId === farmId || String(t.farmId) === String(farmId));
    }
    return tasks;
}

function v20FilterByDate(items, dateRange) {
    if (!dateRange || !dateRange.start || !dateRange.end) return items;
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).getTime();
    return items.filter(item => {
        const ts = new Date(item.date || item.createdAt || item.timestamp).getTime();
        return ts >= start && ts <= end;
    });
}

function v20Toast(message, type) {
    const existing = document.querySelector('.sf-v20-export-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'sf-v20-export-toast ' + (type || 'success');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '24px', right: '24px', padding: '14px 24px',
        borderRadius: '10px', color: '#fff', fontWeight: 'bold',
        fontFamily: 'inherit', zIndex: '100000',
        animation: 'sfV20ToastIn 0.3s ease',
        background: type === 'error' ? '#dc3545' : type === 'warning' ? '#f0ad4e' : '#28a745'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function v20InjectStyles() {
    if (document.getElementById('sf-v20-export-styles')) return;
    const style = document.createElement('style');
    style.id = 'sf-v20-export-styles';
    style.textContent = `
        @keyframes sfV20ToastIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .sf-v20-panel { font-family: 'Hind Siliguri','Kalpurush',sans-serif; max-width: 800px; margin: 0 auto; padding: 28px; background: linear-gradient(135deg,#f0f4ff,#e8f0fe); border-radius: 16px; border: 2px solid #1a56db; }
        .sf-v20-panel-title { text-align: center; font-size: 1.6em; color: #1a3a8a; margin-bottom: 24px; font-weight: bold; }
        .sf-v20-section { margin-bottom: 24px; }
        .sf-v20-section h3 { color: #1a3a8a; margin: 0 0 12px; font-size: 1.1em; border-bottom: 1px solid #ccc; padding-bottom: 8px; }
        .sf-v20-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .sf-v20-btn { padding: 14px; border: none; border-radius: 10px; font-size: 1em; font-weight: bold; font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .sf-v20-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .sf-v20-btn-pdf { background: #dc3545; color: #fff; }
        .sf-v20-btn-csv { background: #17a2b8; color: #fff; }
        .sf-v20-btn-json { background: #ffc107; color: #333; }
        .sf-v20-btn-excel { background: #28a745; color: #fff; }
        .sf-v20-btn-all { background: #6f42c1; color: #fff; grid-column: 1/-1; }
        .sf-v20-btn-secondary { background: #fff; color: #1a3a8a; border: 2px solid #1a3a8a; }
        .sf-v20-select { width: 100%; padding: 12px; border: 2px solid #aaa; border-radius: 8px; font-size: 1em; font-family: inherit; margin-bottom: 12px; background: #fff; }
        .sf-v20-select:focus { border-color: #1a56db; outline: none; }
        .sf-v20-date-row { display: flex; gap: 8px; margin-top: 12px; }
        .sf-v20-date-row input { flex: 1; padding: 10px; border: 2px solid #aaa; border-radius: 8px; font-family: inherit; font-size: 0.95em; }
        .sf-v20-date-row input:focus { border-color: #1a56db; outline: none; }
        .sf-v20-progress { width: 100%; height: 6px; background: #ddd; border-radius: 3px; margin-top: 8px; overflow: hidden; }
        .sf-v20-progress-bar { height: 100%; background: #1a56db; border-radius: 3px; transition: width 0.3s; }
        .sf-v20-status { text-align: center; margin-top: 16px; padding: 12px; background: #fff; border-radius: 8px; font-size: 0.95em; color: #555; }
    `;
    document.head.appendChild(style);
}

export const SFExportV20 = {
    init() {
        v20InjectStyles();
        return this;
    },

    async exportFarmData(farmId, format) {
        const farm = v20GetFarmData(farmId);
        if (!farm) { v20Toast('ফার্ম ডেটা পাওয়া যায়নি', 'error'); return; }
        const data = Array.isArray(farm) ? farm : [farm];
        const fname = farmId ? `farm_${farmId}_data` : 'farm_data';
        switch (format) {
            case 'pdf': this.downloadPDF(this._farmToHTML(data), fname); break;
            case 'csv': this.downloadCSV(data, fname); break;
            case 'json': this.downloadJSON(data, fname); break;
            case 'excel': this.downloadExcel(data, fname); break;
            default: this.downloadJSON(data, fname);
        }
        v20Toast('ফার্ম ডেটা এক্সপোর্ট সম্পন্ন!', 'success');
    },

    async exportExpenses(farmId, format, dateRange) {
        let expenses = v20GetExpenses(farmId);
        if (dateRange) expenses = v20FilterByDate(expenses, dateRange);
        if (expenses.length === 0) { v20Toast('কোনো খরচ পাওয়া যায়নি', 'warning'); return; }
        const fname = 'expenses_' + (dateRange ? 'filtered' : 'all');
        switch (format) {
            case 'pdf': this.downloadPDF(this._tableToHTML('খরচ তালিকা', expenses, ['date', 'category', 'amount', 'description']), fname); break;
            case 'csv': this.downloadCSV(expenses, fname); break;
            case 'json': this.downloadJSON(expenses, fname); break;
            case 'excel': this.downloadExcel(expenses, fname); break;
            default: this.downloadCSV(expenses, fname);
        }
        v20Toast('খরচ এক্সপোর্ট সম্পন্ন!', 'success');
    },

    async exportSales(farmId, format, dateRange) {
        let sales = v20GetSales(farmId);
        if (dateRange) sales = v20FilterByDate(sales, dateRange);
        if (sales.length === 0) { v20Toast('কোনো বিক্রয় পাওয়া যায়নি', 'warning'); return; }
        const fname = 'sales_' + (dateRange ? 'filtered' : 'all');
        switch (format) {
            case 'pdf': this.downloadPDF(this._tableToHTML('বিক্রয় তালিকা', sales, ['date', 'product', 'quantity', 'total', 'customer']), fname); break;
            case 'csv': this.downloadCSV(sales, fname); break;
            case 'json': this.downloadJSON(sales, fname); break;
            case 'excel': this.downloadExcel(sales, fname); break;
            default: this.downloadCSV(sales, fname);
        }
        v20Toast('বিক্রয় এক্সপোর্ট সম্পন্ন!', 'success');
    },

    async exportInventory(format) {
        const inventory = v20GetInventory();
        if (inventory.length === 0) { v20Toast('কোনো ইনভেন্টরি পাওয়া যায়নি', 'warning'); return; }
        const fname = 'inventory';
        switch (format) {
            case 'pdf': this.downloadPDF(this._tableToHTML('ইনভেন্টরি', inventory, ['name', 'category', 'stock', 'unit', 'price']), fname); break;
            case 'csv': this.downloadCSV(inventory, 'inventory'); break;
            case 'json': this.downloadJSON(inventory, 'inventory'); break;
            case 'excel': this.downloadExcel(inventory, 'inventory'); break;
            default: this.downloadCSV(inventory, 'inventory');
        }
        v20Toast('ইনভেন্টরি এক্সপোর্ট সম্পন্ন!', 'success');
    },

    async exportTasks(farmId, format, dateRange) {
        let tasks = v20GetTasks(farmId);
        if (dateRange) tasks = v20FilterByDate(tasks, dateRange);
        if (tasks.length === 0) { v20Toast('কোনো কাজ পাওয়া যায়নি', 'warning'); return; }
        const fname = 'tasks_' + (dateRange ? 'filtered' : 'all');
        switch (format) {
            case 'pdf': this.downloadPDF(this._tableToHTML('কাজের তালিকা', tasks, ['date', 'title', 'status', 'priority', 'farmId']), fname); break;
            case 'csv': this.downloadCSV(tasks, fname); break;
            case 'json': this.downloadJSON(tasks, fname); break;
            case 'excel': this.downloadExcel(tasks, fname); break;
            default: this.downloadCSV(tasks, fname);
        }
        v20Toast('কাজের তালিকা এক্সপোর্ট সম্পন্ন!', 'success');
    },

    async exportReport(reportData, format) {
        if (!reportData) { v20Toast('রিপোর্ট ডেটা পাওয়া যায়নি', 'error'); return; }
        const fname = 'report_' + (reportData.title || 'custom').replace(/\s+/g, '_');
        switch (format) {
            case 'pdf': this.downloadPDF(this._reportToHTML(reportData), fname); break;
            case 'csv': {
                const flat = Array.isArray(reportData.data) ? reportData.data : [reportData];
                this.downloadCSV(flat, fname);
                break;
            }
            case 'json': this.downloadJSON(reportData, fname); break;
            case 'excel': {
                const flat = Array.isArray(reportData.data) ? reportData.data : [reportData];
                this.downloadExcel(flat, fname);
                break;
            }
            default: this.downloadJSON(reportData, fname);
        }
        v20Toast('রিপোর্ট এক্সপোর্ট সম্পন্ন!', 'success');
    },

    async exportInvoice(orderId, format) {
        const orders = v20GetStorage('sf_orders') || v20GetStorage('sf_sales') || [];
        const order = orderId ? orders.find(o => o.id === orderId || String(o.id) === String(orderId)) : orders[0];
        if (!order) { v20Toast('ইনভয়েস পাওয়া যায়নি', 'error'); return; }
        const fname = 'invoice_' + (order.id || 'draft');
        switch (format) {
            case 'pdf': this.downloadPDF(this._invoiceToHTML(order), fname); break;
            case 'json': this.downloadJSON(order, fname); break;
            case 'csv': this.downloadCSV([order], fname); break;
            case 'excel': this.downloadExcel([order], fname); break;
            default: this.downloadPDF(this._invoiceToHTML(order), fname);
        }
        v20Toast('ইনভয়েস এক্সপোর্ট সম্পন্ন!', 'success');
    },

    async exportPosts(filter, format) {
        let posts = v20GetStorage('sf_community_posts') || v20GetStorage('sf_posts') || [];
        if (filter) {
            if (filter.category) posts = posts.filter(p => p.category === filter.category);
            if (filter.author) posts = posts.filter(p => p.author === filter.author);
        }
        if (posts.length === 0) { v20Toast('কোনো পোস্ট পাওয়া যায়নি', 'warning'); return; }
        const fname = 'community_posts';
        switch (format) {
            case 'pdf': this.downloadPDF(this._tableToHTML('কমিউনিটি পোস্ট', posts, ['title', 'author', 'date', 'category']), fname); break;
            case 'csv': this.downloadCSV(posts, fname); break;
            case 'json': this.downloadJSON(posts, fname); break;
            case 'excel': this.downloadExcel(posts, fname); break;
            default: this.downloadJSON(posts, fname);
        }
        v20Toast('পোস্ট এক্সপোর্ট সম্পন্ন!', 'success');
    },

    async exportExpertData(format) {
        const data = v20GetStorage('sf_experts') || v20GetStorage('sf_expert_consultations') || [];
        if (data.length === 0) { v20Toast('কোনো এক্সপার্ট ডেটা পাওয়া যায়নি', 'warning'); return; }
        const fname = 'expert_data';
        switch (format) {
            case 'pdf': this.downloadPDF(this._tableToHTML('এক্সপার্ট ডেটা', data, ['name', 'specialty', 'date', 'status']), fname); break;
            case 'csv': this.downloadCSV(data, fname); break;
            case 'json': this.downloadJSON(data, fname); break;
            case 'excel': this.downloadExcel(data, fname); break;
            default: this.downloadJSON(data, fname);
        }
        v20Toast('এক্সপার্ট ডেটা এক্সপোর্ট সম্পন্ন!', 'success');
    },

    async exportAllData(format) {
        const allData = {
            exportVersion: V20_EXPORT_VERSION,
            exportDate: new Date().toISOString(),
            farms: v20GetStorage('sf_farms') || v20GetStorage('sf_farm_list') || [],
            expenses: v20GetStorage('sf_expenses') || [],
            sales: v20GetStorage('sf_sales') || v20GetStorage('sf_orders') || [],
            inventory: v20GetStorage('sf_inventory') || v20GetStorage('sf_products') || [],
            tasks: v20GetStorage('sf_tasks') || [],
            community: v20GetStorage('sf_community_posts') || [],
            experts: v20GetStorage('sf_experts') || [],
            profile: v20GetStorage('sf_profile') || v20GetStorage('sf_farmer_profile') || {},
            chatHistory: v20GetStorage('sf_chat_history') || [],
            reminders: v20GetStorage('sf_reminders') || [],
            feedback: v20GetStorage('sf_feedback') || []
        };
        const fname = 'sowrov_backup_' + new Date().toISOString().slice(0, 10);
        switch (format) {
            case 'json': this.downloadJSON(allData, fname); break;
            case 'csv': {
                let csv = '';
                for (const [key, items] of Object.entries(allData)) {
                    if (Array.isArray(items) && items.length > 0) {
                        csv += `\n=== ${key} ===\n`;
                        const headers = Object.keys(items[0]);
                        csv += headers.map(v20EscapeCSV).join(',') + '\n';
                        items.forEach(row => {
                            csv += headers.map(h => v20EscapeCSV(row[h])).join(',') + '\n';
                        });
                    }
                }
                v20DownloadBlob('\ufeff' + csv, fname + '.csv', 'text/csv;charset=utf-8');
                break;
            }
            case 'excel': {
                const sheets = Object.entries(allData)
                    .filter(([, v]) => Array.isArray(v) && v.length > 0)
                    .map(([k, v]) => ({ name: k, data: v }));
                this._downloadMultiSheetExcel(sheets, fname);
                break;
            }
            case 'pdf': this.downloadPDF(this._fullBackupHTML(allData), fname); break;
            default: this.downloadJSON(allData, fname);
        }
        v20Toast('সম্পূর্ণ ব্যাকআপ এক্সপোর্ট সম্পন্ন!', 'success');
    },

    downloadCSV(data, filename) {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csv = '\ufeff' + headers.map(v20EscapeCSV).join(',') + '\n' +
            data.map(row => headers.map(h => v20EscapeCSV(row[h])).join(',')).join('\n');
        v20DownloadBlob(csv, (filename || 'export') + '.csv', 'text/csv;charset=utf-8');
    },

    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        v20DownloadBlob(json, (filename || 'export') + '.json', 'application/json');
    },

    downloadPDF(html, filename) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            setTimeout(() => { printWindow.print(); }, 600);
        } else {
            v20DownloadBlob(html, (filename || 'export') + '.html', 'text/html;charset=utf-8');
            v20Toast('পপ-আপ ব্লক করা হয়েছে — HTML হিসেবে সংরক্ষিত', 'warning');
        }
    },

    downloadExcel(data, filename) {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]);
        let html = '<html><head><meta charset="utf-8"><style>table{border-collapse:collapse}th,td{border:1px solid #333;padding:8px 12px;text-align:left}th{background:#2d7a2d;color:#fff;font-weight:bold}tr:nth-child(even){background:#f2f2f2}</style></head><body>';
        html += '<table border="1">';
        html += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
        data.forEach(row => {
            html += '<tr>' + headers.map(h => `<td>${row[h] !== undefined && row[h] !== null ? row[h] : ''}</td>`).join('') + '</tr>';
        });
        html += '</table></body></html>';
        const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (filename || 'export') + '.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    },

    generateCSV(headers, rows) {
        if (!headers || !rows) return '';
        let csv = '\ufeff' + headers.map(v20EscapeCSV).join(',') + '\n';
        csv += rows.map(row => headers.map(h => v20EscapeCSV(row[h])).join(',')).join('\n');
        return csv;
    },

    generateExcel(data, filename) {
        this.downloadExcel(data, filename);
    },

    createExportPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = `
            <div class="sf-v20-panel">
                <div class="sf-v20-panel-title">ডাটা এক্সপোর্ট সেন্টার (V20)</div>

                <div class="sf-v20-section">
                    <h3>ফার্ম ডেটা এক্সপোর্ট</h3>
                    <select class="sf-v20-select" id="sf-v20-farm-select">
                        <option value="">সকল ফার্ম</option>
                    </select>
                    <div class="sf-v20-grid">
                        <button class="sf-v20-btn sf-v20-btn-pdf" data-export="farm" data-format="pdf">PDF</button>
                        <button class="sf-v20-btn sf-v20-btn-csv" data-export="farm" data-format="csv">CSV</button>
                        <button class="sf-v20-btn sf-v20-btn-json" data-export="farm" data-format="json">JSON</button>
                        <button class="sf-v20-btn sf-v20-btn-excel" data-export="farm" data-format="excel">Excel</button>
                    </div>
                </div>

                <div class="sf-v20-section">
                    <h3>খরচ / বিক্রয় / কাজ এক্সপোর্ট</h3>
                    <div class="sf-v20-date-row">
                        <input type="date" id="sf-v20-date-start" placeholder="শুরুর তারিখ">
                        <input type="date" id="sf-v20-date-end" placeholder="শেষের তারিখ">
                    </div>
                    <div class="sf-v20-grid" style="margin-top:12px;">
                        <button class="sf-v20-btn sf-v20-btn-csv" data-export="expenses" data-format="csv">খরচ CSV</button>
                        <button class="sf-v20-btn sf-v20-btn-excel" data-export="expenses" data-format="excel">খরচ Excel</button>
                        <button class="sf-v20-btn sf-v20-btn-csv" data-export="sales" data-format="csv">বিক্রয় CSV</button>
                        <button class="sf-v20-btn sf-v20-btn-excel" data-export="sales" data-format="excel">বিক্রয় Excel</button>
                        <button class="sf-v20-btn sf-v20-btn-csv" data-export="tasks" data-format="csv">কাজ CSV</button>
                        <button class="sf-v20-btn sf-v20-btn-excel" data-export="tasks" data-format="excel">কাজ Excel</button>
                    </div>
                </div>

                <div class="sf-v20-section">
                    <h3>ইনভেন্টরি / ইনভয়েস / পোস্ট</h3>
                    <div class="sf-v20-grid">
                        <button class="sf-v20-btn sf-v20-btn-csv" data-export="inventory" data-format="csv">ইনভেন্টরি CSV</button>
                        <button class="sf-v20-btn sf-v20-btn-excel" data-export="inventory" data-format="excel">ইনভেন্টরি Excel</button>
                        <button class="sf-v20-btn sf-v20-btn-pdf" data-export="invoice" data-format="pdf">ইনভয়েস PDF</button>
                        <button class="sf-v20-btn sf-v20-btn-json" data-export="posts" data-format="json">পোস্ট JSON</button>
                    </div>
                </div>

                <div class="sf-v20-section">
                    <h3>সম্পূর্ণ ব্যাকআপ</h3>
                    <div class="sf-v20-grid">
                        <button class="sf-v20-btn sf-v20-btn-all" data-export="all" data-format="json">সম্পূর্ণ ব্যাকআপ (JSON)</button>
                        <button class="sf-v20-btn sf-v20-btn-all" data-export="all" data-format="csv" style="background:#138496;">সম্পূর্ণ ব্যাকআপ (CSV)</button>
                        <button class="sf-v20-btn sf-v20-btn-all" data-export="all" data-format="excel" style="background:#e67e22;">সম্পূর্ণ ব্যাকআপ (Excel)</button>
                    </div>
                </div>

                <div class="sf-v20-status" id="sf-v20-export-status">এক্সপোর্ট অপেক্ষমান</div>
            </div>
        `;

        this._populateFarmSelect();
        this._bindExportButtons(container);
        return { destroy() { container.innerHTML = ''; } };
    },

    _populateFarmSelect() {
        const select = document.getElementById('sf-v20-farm-select');
        if (!select) return;
        const farms = v20GetFarmData();
        if (Array.isArray(farms)) {
            farms.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id || '';
                opt.textContent = f.name || f.farmName || ('ফার্ম ' + (f.id || ''));
                select.appendChild(opt);
            });
        }
    },

    _bindExportButtons(container) {
        const self = this;
        container.querySelectorAll('[data-export]').forEach(btn => {
            btn.addEventListener('click', async function () {
                const type = this.dataset.export;
                const format = this.dataset.format;
                const farmId = document.getElementById('sf-v20-farm-select')?.value || '';
                const start = document.getElementById('sf-v20-date-start')?.value;
                const end = document.getElementById('sf-v20-date-end')?.value;
                const dateRange = (start && end) ? { start, end } : null;
                const status = document.getElementById('sf-v20-export-status');
                if (status) status.textContent = 'এক্সপোর্ট হচ্ছে...';

                try {
                    switch (type) {
                        case 'farm': await self.exportFarmData(farmId, format); break;
                        case 'expenses': await self.exportExpenses(farmId, format, dateRange); break;
                        case 'sales': await self.exportSales(farmId, format, dateRange); break;
                        case 'tasks': await self.exportTasks(farmId, format, dateRange); break;
                        case 'inventory': await self.exportInventory(format); break;
                        case 'invoice': await self.exportInvoice(null, format); break;
                        case 'posts': await self.exportPosts(null, format); break;
                        case 'all': await self.exportAllData(format); break;
                    }
                    if (status) status.textContent = 'এক্সপোর্ট সম্পন্ন ✓ ' + new Date().toLocaleTimeString('bn-BD');
                } catch (err) {
                    v20Toast('এক্সপোর্টে সমস্যা: ' + err.message, 'error');
                    if (status) status.textContent = 'ত্রুটি: ' + err.message;
                }
            });
        });
    },

    _tableToHTML(title, data, columns) {
        const cols = columns || (data.length > 0 ? Object.keys(data[0]) : []);
        let html = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>${title}</title>
        <style>
            body{font-family:'Hind Siliguri',sans-serif;max-width:900px;margin:0 auto;padding:20px;color:#333}
            h1{text-align:center;color:#2d7a2d;border-bottom:2px solid #2d7a2d;padding-bottom:10px}
            .meta{text-align:center;color:#666;margin-bottom:20px;font-size:0.9em}
            table{width:100%;border-collapse:collapse;margin-top:16px}
            th,td{border:1px solid #ccc;padding:10px 14px;text-align:left;font-size:0.95em}
            th{background:#2d7a2d;color:#fff;font-weight:bold}
            tr:nth-child(even){background:#f8f8f8}
            .footer{text-align:center;margin-top:24px;color:#999;font-size:0.85em}
        </style></head><body>
        <h1>${title}</h1>
        <div class="meta">মোট: ${data.length} টি রেকর্ড | তৈরি: ${new Date().toLocaleDateString('bn-BD')}</div>
        <table><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>`;
        data.forEach(row => {
            html += '<tr>' + cols.map(c => `<td>${row[c] !== undefined && row[c] !== null ? row[c] : ''}</td>`).join('') + '</tr>';
        });
        html += `</tbody></table>
        <div class="footer">সোভর্ভ সার — V${V20_EXPORT_VERSION} | তৈরি: ${new Date().toLocaleString('bn-BD')}</div>
        </body></html>`;
        return html;
    },

    _farmToHTML(farms) {
        let html = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>ফার্ম ডেটা</title>
        <style>
            body{font-family:'Hind Siliguri',sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#333}
            h1{text-align:center;color:#2d7a2d} .farm{border:1px solid #ccc;border-radius:8px;padding:16px;margin-bottom:16px}
            .farm h3{margin:0 0 8px;color:#1a56db} .label{font-weight:bold;color:#555}
        </style></head><body><h1>ফার্ম ডেটা</h1>`;
        const list = Array.isArray(farms) ? farms : [farms];
        list.forEach(f => {
            html += `<div class="farm"><h3>${f.name || f.farmName || 'ফার্ম'}</h3>`;
            for (const [k, v] of Object.entries(f)) {
                if (!['id', 'name', 'farmName'].includes(k)) {
                    html += `<p><span class="label">${k}:</span> ${typeof v === 'object' ? JSON.stringify(v) : v}</p>`;
                }
            }
            html += '</div>';
        });
        html += `<div class="footer">সোভর্ভ সার — V${V20_EXPORT_VERSION}</div></body></html>`;
        return html;
    },

    _reportToHTML(report) {
        let html = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>${report.title || 'রিপোর্ট'}</title>
        <style>
            body{font-family:'Hind Siliguri',sans-serif;max-width:800px;margin:0 auto;padding:20px;color:#333}
            h1{text-align:center;color:#2d7a2d} .section{margin-bottom:16px}
            .section h3{color:#1a56db;border-bottom:1px solid #ddd;padding-bottom:6px}
        </style></head><body>
        <h1>${report.title || 'রিপোর্ট'}</h1>
        <p style="text-align:center;color:#666">তৈরি: ${new Date().toLocaleString('bn-BD')}</p>`;
        if (report.summary) html += `<div class="section"><h3>সারসংক্ষেপ</h3><p>${report.summary}</p></div>`;
        if (report.data && Array.isArray(report.data)) {
            html += this._tableToHTML('রিপোর্ট ডেটা', report.data, null).replace(/<!DOCTYPE[\s\S]*?<body>/, '').replace(/<\/body><\/html>$/, '');
        }
        html += `<div class="footer">সোভর্ভ সার — V${V20_EXPORT_VERSION}</div></body></html>`;
        return html;
    },

    _invoiceToHTML(order) {
        const items = order.items || order.products || [];
        let html = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>ইনভয়েস #${order.id || ''}</title>
        <style>
            body{font-family:'Hind Siliguri',sans-serif;max-width:700px;margin:0 auto;padding:20px;color:#333}
            h1{text-align:center;color:#2d7a2d} .info{display:flex;justify-content:space-between;margin:16px 0}
            table{width:100%;border-collapse:collapse;margin:16px 0} th,td{border:1px solid #ccc;padding:10px;text-align:left}
            th{background:#2d7a2d;color:#fff} .total{text-align:right;font-size:1.2em;font-weight:bold;margin-top:16px}
        </style></head><body>
        <h1>ইনভয়েস</h1>
        <div class="info">
            <div><strong>ইনভয়েস #:</strong> ${order.id || 'N/A'}<br><strong>তারিখ:</strong> ${v20FormatDate(order.date || order.createdAt)}</div>
            <div><strong>গ্রাহক:</strong> ${order.customer || order.customerName || 'N/A'}<br><strong>যোগাযোগ:</strong> ${order.phone || order.contact || 'N/A'}</div>
        </div>`;
        if (items.length > 0) {
            html += `<table><thead><tr><th>পণ্য</th><th>পরিমাণ</th><th>মূল্য</th><th>মোট</th></tr></thead><tbody>`;
            items.forEach(item => {
                const qty = item.quantity || item.qty || 1;
                const price = item.price || item.unitPrice || 0;
                html += `<tr><td>${item.name || item.product || ''}</td><td>${qty}</td><td>${v20FormatCurrency(price)}</td><td>${v20FormatCurrency(price * qty)}</td></tr>`;
            });
            html += '</tbody></table>';
        }
        html += `<div class="total">মোট: ${v20FormatCurrency(order.total || order.totalAmount || 0)}</div>`;
        if (order.note || order.notes) html += `<p><strong>নোট:</strong> ${order.note || order.notes}</p>`;
        html += `<div class="footer" style="text-align:center;margin-top:24px;color:#999">সোভর্ভ সার — V${V20_EXPORT_VERSION}</div></body></html>`;
        return html;
    },

    _fullBackupHTML(data) {
        let html = `<!DOCTYPE html><html lang="bn"><head><meta charset="UTF-8"><title>সম্পূর্ণ ব্যাকআপ</title>
        <style>
            body{font-family:'Hind Siliguri',sans-serif;max-width:900px;margin:0 auto;padding:20px;color:#333}
            h1{text-align:center;color:#2d7a2d} h2{color:#1a56db;margin-top:32px}
            table{width:100%;border-collapse:collapse;margin:12px 0} th,td{border:1px solid #ccc;padding:8px;text-align:left;font-size:0.9em}
            th{background:#2d7a2d;color:#fff} .empty{color:#999;font-style:italic}
        </style></head><body>
        <h1>সোভর্ভ সার — সম্পূর্ণ ব্যাকআপ</h1>
        <p style="text-align:center">তৈরি: ${new Date().toLocaleString('bn-BD')} | V${V20_EXPORT_VERSION}</p>`;
        for (const [key, items] of Object.entries(data)) {
            if (key === 'exportVersion' || key === 'exportDate') continue;
            html += `<h2>${key}</h2>`;
            if (Array.isArray(items) && items.length > 0) {
                const cols = Object.keys(items[0]);
                html += '<table><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>';
                items.forEach(row => {
                    html += '<tr>' + cols.map(c => `<td>${row[c] !== undefined ? row[c] : ''}</td>`).join('') + '</tr>';
                });
                html += '</tbody></table>';
            } else if (typeof items === 'object' && !Array.isArray(items) && Object.keys(items).length > 0) {
                html += '<table><tr><th>কী</th><th>মান</th></tr>';
                for (const [k, v] of Object.entries(items)) {
                    html += `<tr><td>${k}</td><td>${typeof v === 'object' ? JSON.stringify(v) : v}</td></tr>`;
                }
                html += '</table>';
            } else {
                html += '<p class="empty">খালি</p>';
            }
        }
        html += '</body></html>';
        return html;
    },

    _downloadMultiSheetExcel(sheets, filename) {
        let html = '<html><head><meta charset="utf-8"><style>';
        html += 'table{border-collapse:collapse;margin-bottom:24px}th,td{border:1px solid #333;padding:8px 12px;text-align:left}th{background:#2d7a2d;color:#fff}tr:nth-child(even){background:#f2f2f2}h2{color:#1a56db;margin-bottom:8px}body{font-family:sans-serif;padding:20px}</style></head><body>';
        sheets.forEach(sheet => {
            if (sheet.data.length === 0) return;
            const headers = Object.keys(sheet.data[0]);
            html += `<h2>${sheet.name}</h2><table border="1">`;
            html += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
            sheet.data.forEach(row => {
                html += '<tr>' + headers.map(h => `<td>${row[h] !== undefined && row[h] !== null ? row[h] : ''}</td>`).join('') + '</tr>';
            });
            html += '</table>';
        });
        html += '</body></html>';
        const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = (filename || 'export') + '.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
};
