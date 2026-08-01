const STORAGE_KEY = 'sf_reports';

const REPORT_TYPES = {
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    CROP: 'crop',
    EXPENSE: 'expense',
    YIELD: 'yield',
    SALES: 'sales',
    PROFIT_LOSS: 'profit_loss',
    INVENTORY: 'inventory',
    TASK: 'task'
};

const REPORT_LABELS = {
    weekly: 'সাপ্তাহিক রিপোর্ট',
    monthly: 'মাসিক রিপোর্ট',
    crop: 'ফসল রিপোর্ট',
    expense: 'খরচ রিপোর্ট',
    yield: 'উৎপাদন রিপোর্ট',
    sales: 'বিক্রয় রিপোর্ট',
    profit_loss: 'লাভ-ক্ষতি রিপোর্ট',
    inventory: 'ইনভেন্টরি রিপোর্ট',
    task: 'কাজের রিপোর্ট'
};

function generateId() {
    return 'rpt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
}

function loadCache() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveCache(reports) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (e) {
        console.error('রিপোর্ট সংরক্ষণে ত্রুটি:', e);
    }
}

function getLocalData(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function formatDateBn(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return '৳' + num.toLocaleString('bn-BD', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d);
    start.setDate(diff);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

function getMonthRange(month, year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
}

function renderTable(headers, rows) {
    let html = '<table class="sf-report-table"><thead><tr>';
    headers.forEach(h => { html += `<th>${h}</th>`; });
    html += '</tr></thead><tbody>';
    if (rows.length === 0) {
        html += `<tr><td colspan="${headers.length}" style="text-align:center">কোনো তথ্য পাওয়া যায়নি</td></tr>`;
    }
    rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => { html += `<td>${cell}</td>`; });
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

function renderSummary(items) {
    let html = '<div class="sf-report-summary">';
    items.forEach(item => {
        html += `<div class="sf-report-summary-item"><span class="sf-report-summary-label">${item.label}</span><span class="sf-report-summary-value">${item.value}</span></div>`;
    });
    html += '</div>';
    return html;
}

export const SFReports = {
    init() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, '[]');
        }
    },

    generateWeeklyReport(farmId, weekStart) {
        const range = weekStart ? getWeekRange(weekStart) : getWeekRange(new Date());
        const farmData = this.collectFarmData(farmId);
        const expenses = this.collectExpenseData(farmId, range.start, range.end);
        const tasks = this.collectTaskData(farmId, range.start, range.end);
        const totalExpense = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const report = {
            id: generateId(),
            type: REPORT_TYPES.WEEKLY,
            title: `সাপ্তাহিক রিপোর্ট (${formatDateBn(range.start)} - ${formatDateBn(range.end)})`,
            farmId,
            period: range,
            generatedAt: new Date().toISOString(),
            data: {
                farm: farmData,
                totalExpense,
                expenseCount: expenses.length,
                tasks: tasks.length,
                completedTasks,
                pendingTasks: tasks.length - completedTasks,
                expenses: expenses.slice(0, 20),
                taskList: tasks.slice(0, 20)
            }
        };
        this._cacheReport(report);
        return report;
    },

    generateMonthlyReport(farmId, month, year) {
        const now = new Date();
        const m = month || (now.getMonth() + 1);
        const y = year || now.getFullYear();
        const range = getMonthRange(m, y);
        const expenses = this.collectExpenseData(farmId, range.start, range.end);
        const sales = this.collectSalesData(farmId, range.start, range.end);
        const tasks = this.collectTaskData(farmId, range.start, range.end);
        const totalExpense = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const totalSales = sales.reduce((s, sale) => s + (parseFloat(sale.amount) || 0), 0);
        const expenseByCategory = {};
        expenses.forEach(e => {
            const cat = e.category || 'অন্যান্য';
            expenseByCategory[cat] = (expenseByCategory[cat] || 0) + (parseFloat(e.amount) || 0);
        });
        const report = {
            id: generateId(),
            type: REPORT_TYPES.MONTHLY,
            title: `মাসিক রিপোর্ট - ${m}/${y}`,
            farmId,
            period: range,
            generatedAt: new Date().toISOString(),
            data: {
                totalExpense,
                totalSales,
                profit: totalSales - totalExpense,
                expenseCount: expenses.length,
                salesCount: sales.length,
                expenseByCategory,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                totalTasks: tasks.length,
                expenses: expenses.slice(0, 30),
                sales: sales.slice(0, 30)
            }
        };
        this._cacheReport(report);
        return report;
    },

    generateCropReport(farmId, cropName) {
        const yields = this.collectYieldData(farmId, cropName);
        const expenses = this.collectExpenseData(farmId);
        const cropExpenses = expenses.filter(e => e.cropName === cropName || e.crop === cropName);
        const totalYield = yields.reduce((s, y) => s + (parseFloat(y.quantity) || 0), 0);
        const totalExpense = cropExpenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const report = {
            id: generateId(),
            type: REPORT_TYPES.CROP,
            title: `ফসল রিপোর্ট - ${cropName}`,
            farmId,
            generatedAt: new Date().toISOString(),
            data: {
                cropName,
                totalYield,
                yieldCount: yields.length,
                totalExpense,
                yieldDetails: yields.slice(0, 20),
                expenses: cropExpenses.slice(0, 20),
                costPerUnit: totalYield > 0 ? (totalExpense / totalYield).toFixed(2) : 0
            }
        };
        this._cacheReport(report);
        return report;
    },

    generateExpenseReport(farmId, startDate, endDate) {
        const expenses = this.collectExpenseData(farmId, startDate, endDate);
        const total = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const byCategory = {};
        expenses.forEach(e => {
            const cat = e.category || 'অন্যান্য';
            if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0 };
            byCategory[cat].total += (parseFloat(e.amount) || 0);
            byCategory[cat].count++;
        });
        const report = {
            id: generateId(),
            type: REPORT_TYPES.EXPENSE,
            title: `খরচ রিপোর্ট (${formatDateBn(startDate)} - ${formatDateBn(endDate)})`,
            farmId,
            period: { start: startDate, end: endDate },
            generatedAt: new Date().toISOString(),
            data: {
                totalExpense: total,
                expenseCount: expenses.length,
                byCategory,
                averageExpense: expenses.length > 0 ? (total / expenses.length).toFixed(2) : 0,
                expenses
            }
        };
        this._cacheReport(report);
        return report;
    },

    generateYieldReport(farmId, cropName) {
        const yields = this.collectYieldData(farmId, cropName);
        const total = yields.reduce((s, y) => s + (parseFloat(y.quantity) || 0), 0);
        const byMonth = {};
        yields.forEach(y => {
            const d = new Date(y.date || y.harvestDate);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            byMonth[key] = (byMonth[key] || 0) + (parseFloat(y.quantity) || 0);
        });
        const report = {
            id: generateId(),
            type: REPORT_TYPES.YIELD,
            title: `উৎপাদন রিপোর্ট - ${cropName || 'সকল ফসল'}`,
            farmId,
            generatedAt: new Date().toISOString(),
            data: {
                cropName: cropName || 'সকল',
                totalYield: total,
                yieldCount: yields.length,
                byMonth,
                yields
            }
        };
        this._cacheReport(report);
        return report;
    },

    generateSalesReport(farmId, startDate, endDate) {
        const sales = this.collectSalesData(farmId, startDate, endDate);
        const total = sales.reduce((s, sale) => s + (parseFloat(sale.amount) || 0), 0);
        const byCrop = {};
        sales.forEach(sale => {
            const crop = sale.cropName || sale.crop || 'অন্যান্য';
            if (!byCrop[crop]) byCrop[crop] = { total: 0, count: 0 };
            byCrop[crop].total += (parseFloat(sale.amount) || 0);
            byCrop[crop].count++;
        });
        const report = {
            id: generateId(),
            type: REPORT_TYPES.SALES,
            title: `বিক্রয় রিপোর্ট (${formatDateBn(startDate)} - ${formatDateBn(endDate)})`,
            farmId,
            period: { start: startDate, end: endDate },
            generatedAt: new Date().toISOString(),
            data: {
                totalSales: total,
                salesCount: sales.length,
                byCrop,
                averageSale: sales.length > 0 ? (total / sales.length).toFixed(2) : 0,
                sales
            }
        };
        this._cacheReport(report);
        return report;
    },

    generateProfitLossReport(farmId, startDate, endDate) {
        const expenses = this.collectExpenseData(farmId, startDate, endDate);
        const sales = this.collectSalesData(farmId, startDate, endDate);
        const totalExpense = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
        const totalSales = sales.reduce((s, sale) => s + (parseFloat(sale.amount) || 0), 0);
        const profit = totalSales - totalExpense;
        const margin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0;
        const report = {
            id: generateId(),
            type: REPORT_TYPES.PROFIT_LOSS,
            title: `লাভ-ক্ষতি রিপোর্ট (${formatDateBn(startDate)} - ${formatDateBn(endDate)})`,
            farmId,
            period: { start: startDate, end: endDate },
            generatedAt: new Date().toISOString(),
            data: {
                totalIncome: totalSales,
                totalExpense,
                profit,
                margin: parseFloat(margin),
                expenseCount: expenses.length,
                salesCount: sales.length,
                isProfit: profit >= 0
            }
        };
        this._cacheReport(report);
        return report;
    },

    generateInventoryReport() {
        const items = getLocalData('sf_inventory');
        const fertilizers = items.filter(i => i.type === 'fertilizer' || i.category === 'fertilizer');
        const seeds = items.filter(i => i.type === 'seed' || i.category === 'seed');
        const tools = items.filter(i => i.type === 'tool' || i.category === 'tool');
        const lowStock = items.filter(i => {
            const qty = parseFloat(i.quantity) || 0;
            const min = parseFloat(i.minQuantity || i.reorderLevel) || 5;
            return qty <= min;
        });
        const totalValue = items.reduce((s, i) => s + ((parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice || i.price) || 0)), 0);
        const report = {
            id: generateId(),
            type: REPORT_TYPES.INVENTORY,
            title: 'ইনভেন্টরি রিপোর্ট',
            generatedAt: new Date().toISOString(),
            data: {
                totalItems: items.length,
                fertilizers: fertilizers.length,
                seeds: seeds.length,
                tools: tools.length,
                lowStockCount: lowStock.length,
                totalValue,
                lowStockItems: lowStock.slice(0, 15),
                items
            }
        };
        this._cacheReport(report);
        return report;
    },

    generateTaskReport(farmId, startDate, endDate) {
        const tasks = this.collectTaskData(farmId, startDate, endDate);
        const completed = tasks.filter(t => t.status === 'completed');
        const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
        const overdue = tasks.filter(t => {
            if (t.status === 'completed') return false;
            const due = new Date(t.dueDate || t.deadline);
            return due < new Date();
        });
        const byType = {};
        tasks.forEach(t => {
            const type = t.type || t.category || 'অন্যান্য';
            if (!byType[type]) byType[type] = { total: 0, completed: 0 };
            byType[type].total++;
            if (t.status === 'completed') byType[type].completed++;
        });
        const report = {
            id: generateId(),
            type: REPORT_TYPES.TASK,
            title: `কাজের রিপোর্ট (${formatDateBn(startDate)} - ${formatDateBn(endDate)})`,
            farmId,
            period: { start: startDate, end: endDate },
            generatedAt: new Date().toISOString(),
            data: {
                totalTasks: tasks.length,
                completedCount: completed.length,
                pendingCount: pending.length,
                overdueCount: overdue.length,
                completionRate: tasks.length > 0 ? ((completed.length / tasks.length) * 100).toFixed(1) : 0,
                byType,
                tasks
            }
        };
        this._cacheReport(report);
        return report;
    },

    collectFarmData(farmId) {
        const farms = getLocalData('sf_farms');
        return farms.find(f => f.id === farmId) || { id: farmId, name: 'ফার্ম' };
    },

    collectExpenseData(farmId, startDate, endDate) {
        let expenses = getLocalData('sf_expenses');
        if (farmId) expenses = expenses.filter(e => e.farmId === farmId);
        if (startDate) expenses = expenses.filter(e => (e.date || e.createdAt) >= startDate);
        if (endDate) expenses = expenses.filter(e => (e.date || e.createdAt) <= endDate);
        return expenses;
    },

    collectSalesData(farmId, startDate, endDate) {
        let sales = getLocalData('sf_sales');
        if (farmId) sales = sales.filter(s => s.farmId === farmId);
        if (startDate) sales = sales.filter(s => (s.date || s.createdAt) >= startDate);
        if (endDate) sales = sales.filter(s => (s.date || s.createdAt) <= endDate);
        return sales;
    },

    collectTaskData(farmId, startDate, endDate) {
        let tasks = getLocalData('sf_tasks');
        if (farmId) tasks = tasks.filter(t => t.farmId === farmId);
        if (startDate) tasks = tasks.filter(t => (t.createdAt || t.date) >= startDate);
        if (endDate) tasks = tasks.filter(t => (t.createdAt || t.date) <= endDate);
        return tasks;
    },

    collectYieldData(farmId, cropName) {
        let yields = getLocalData('sf_yields');
        if (farmId) yields = yields.filter(y => y.farmId === farmId);
        if (cropName) yields = yields.filter(y => y.cropName === cropName || y.crop === cropName);
        return yields;
    },

    formatReport(data, type) {
        const title = REPORT_LABELS[type] || 'রিপোর্ট';
        let html = `<div class="sf-report sf-report-${type}">`;
        html += `<div class="sf-report-header"><h2>${title}</h2>`;
        html += `<p class="sf-report-date">তৈরি: ${formatDateBn(data.generatedAt)}</p></div>`;
        html += '<div class="sf-report-body">';
        if (type === REPORT_TYPES.WEEKLY || type === REPORT_TYPES.MONTHLY) {
            html += renderSummary([
                { label: 'মোট খরচ', value: formatCurrency(data.data.totalExpense) },
                { label: 'মোট বিক্রয়', value: formatCurrency(data.data.totalSales || 0) },
                { label: 'লাভ', value: formatCurrency((data.data.totalSales || 0) - data.data.totalExpense) },
                { label: 'কাজ সম্পন্ন', value: `${data.data.completedTasks || 0}/${data.data.totalTasks || data.data.tasks || 0}` }
            ]);
        } else if (type === REPORT_TYPES.EXPENSE) {
            html += renderSummary([
                { label: 'মোট খরচ', value: formatCurrency(data.data.totalExpense) },
                { label: 'খরচের সংখ্যা', value: data.data.expenseCount },
                { label: 'গড় খরচ', value: formatCurrency(data.data.averageExpense) }
            ]);
            if (data.data.byCategory) {
                html += '<h3>ক্যাটাগরি অনুযায়ী খরচ</h3>';
                const catRows = Object.entries(data.data.byCategory).map(([cat, info]) => [cat, info.count, formatCurrency(info.total)]);
                html += renderTable(['ক্যাটাগরি', 'সংখ্যা', 'পরিমাণ'], catRows);
            }
        } else if (type === REPORT_TYPES.SALES) {
            html += renderSummary([
                { label: 'মোট বিক্রয়', value: formatCurrency(data.data.totalSales) },
                { label: 'বিক্রয় সংখ্যা', value: data.data.salesCount },
                { label: 'গড় বিক্রয়', value: formatCurrency(data.data.averageSale) }
            ]);
        } else if (type === REPORT_TYPES.PROFIT_LOSS) {
            const profitClass = data.data.isProfit ? 'sf-profit' : 'sf-loss';
            html += renderSummary([
                { label: 'মোট আয়', value: formatCurrency(data.data.totalIncome) },
                { label: 'মোট খরচ', value: formatCurrency(data.data.totalExpense) },
                { label: 'নাফা/ক্ষতি', value: `<span class="${profitClass}">${formatCurrency(data.data.profit)}</span>` },
                { label: 'মার্জিন', value: `${data.data.margin}%` }
            ]);
        } else if (type === REPORT_TYPES.INVENTORY) {
            html += renderSummary([
                { label: 'মোট আইটেম', value: data.data.totalItems },
                { label: 'সার', value: data.data.fertilizers },
                { label: 'বীজ', value: data.data.seeds },
                { label: 'কম স্টক', value: `<span class="sf-warning">${data.data.lowStockCount}</span>` },
                { label: 'মোট মূল্য', value: formatCurrency(data.data.totalValue) }
            ]);
            if (data.data.lowStockItems && data.data.lowStockItems.length > 0) {
                html += '<h3>কম স্টক আইটেম</h3>';
                const rows = data.data.lowStockItems.map(i => [i.name, i.quantity || 0, i.unit || '' ]);
                html += renderTable(['আইটেম', 'পরিমাণ', 'একক'], rows);
            }
        } else if (type === REPORT_TYPES.TASK) {
            html += renderSummary([
                { label: 'মোট কাজ', value: data.data.totalTasks },
                { label: 'সম্পন্ন', value: data.data.completedCount },
                { label: 'বাকি', value: data.data.pendingCount },
                { label: 'বিলম্বিত', value: `<span class="sf-danger">${data.data.overdueCount}</span>` },
                { label: 'সম্পন্নের হার', value: `${data.data.completionRate}%` }
            ]);
        } else if (type === REPORT_TYPES.CROP) {
            html += renderSummary([
                { label: 'ফসল', value: data.data.cropName },
                { label: 'মোট উৎপাদন', value: `${data.data.totalYield} একক` },
                { label: 'মোট খরচ', value: formatCurrency(data.data.totalExpense) },
                { label: 'একক খরচ', value: formatCurrency(data.data.costPerUnit) }
            ]);
        } else if (type === REPORT_TYPES.YIELD) {
            html += renderSummary([
                { label: 'ফসল', value: data.data.cropName },
                { label: 'মোট উৎপাদন', value: `${data.data.totalYield} একক` },
                { label: 'উৎপাদনের সংখ্যা', value: data.data.yieldCount }
            ]);
        }
        html += '</div></div>';
        return html;
    },

    createReportDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const cached = loadCache();
        let html = '<div class="sf-reports-dashboard">';
        html += '<div class="sf-reports-header"><h2>📊 স্মার্ট রিপোর্ট ড্যাশবোর্ড</h2>';
        html += '<button class="sf-btn sf-btn-primary" id="sf-clear-reports">রিপোর্ট পরিষ্কার করুন</button></div>';
        html += '<div id="sf-report-selector"></div>';
        html += '<div id="sf-report-preview"></div>';
        html += '<div class="sf-recent-reports"><h3>সাম্প্রতিক রিপোর্ট</h3>';
        if (cached.length === 0) {
            html += '<p>কোনো রিপোর্ট তৈরি হয়নি।</p>';
        } else {
            html += '<div class="sf-report-list">';
            cached.slice(-10).reverse().forEach(r => {
                html += `<div class="sf-report-item" data-id="${r.id}">`;
                html += `<span class="sf-report-type">${REPORT_LABELS[r.type] || r.type}</span>`;
                html += `<span class="sf-report-title">${r.title}</span>`;
                html += `<span class="sf-report-time">${formatDateBn(r.generatedAt)}</span>`;
                html += `<button class="sf-btn sf-btn-sm sf-report-view" data-id="${r.id}">দেখুন</button>`;
                html += `<button class="sf-btn sf-btn-sm sf-btn-danger sf-report-delete" data-id="${r.id}">মুছুন</button>`;
                html += '</div>';
            });
            html += '</div>';
        }
        html += '</div></div>';
        container.innerHTML = html;
        this.createReportSelector('sf-report-selector');
        document.getElementById('sf-clear-reports')?.addEventListener('click', () => {
            if (confirm('সব রিপোর্ট মুছে ফেলতে চান?')) {
                saveCache([]);
                this.createReportDashboard(containerId);
            }
        });
        container.querySelectorAll('.sf-report-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const report = cached.find(r => r.id === id);
                if (report) this.createReportPreview('sf-report-preview', report);
            });
        });
        container.querySelectorAll('.sf-report-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const updated = cached.filter(r => r.id !== id);
                saveCache(updated);
                this.createReportDashboard(containerId);
            });
        });
    },

    createReportSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        let html = '<div class="sf-report-selector">';
        html += '<h3>নতুন রিপোর্ট তৈরি করুন</h3>';
        html += '<div class="sf-report-form">';
        html += '<div class="sf-form-row">';
        html += '<label>ফসলের ধরন:</label>';
        html += '<select id="sf-report-type">';
        Object.entries(REPORT_LABELS).forEach(([key, label]) => {
            html += `<option value="${key}">${label}</option>`;
        });
        html += '</select></div>';
        html += '<div class="sf-form-row">';
        html += '<label>শুরুর তারিখ:</label>';
        html += '<input type="date" id="sf-report-start">';
        html += '</div>';
        html += '<div class="sf-form-row">';
        html += '<label>শেষ তারিখ:</label>';
        html += '<input type="date" id="sf-report-end">';
        html += '</div>';
        html += '<div class="sf-form-row">';
        html += '<label>ফসলের নাম (ঐচ্ছিক):</label>';
        html += '<input type="text" id="sf-report-crop" placeholder="ফসলের নাম">';
        html += '</div>';
        html += '<button class="sf-btn sf-btn-primary" id="sf-generate-report">রিপোর্ট তৈরি করুন</button>';
        html += '</div></div>';
        container.innerHTML = html;
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        document.getElementById('sf-report-start').value = firstDay.toISOString().split('T')[0];
        document.getElementById('sf-report-end').value = now.toISOString().split('T')[0];
        document.getElementById('sf-generate-report')?.addEventListener('click', () => {
            const type = document.getElementById('sf-report-type').value;
            const start = document.getElementById('sf-report-start').value;
            const end = document.getElementById('sf-report-end').value;
            const crop = document.getElementById('sf-report-crop').value.trim();
            let report;
            switch (type) {
                case 'weekly': report = this.generateWeeklyReport(null, start); break;
                case 'monthly': {
                    const d = new Date(start);
                    report = this.generateMonthlyReport(null, d.getMonth() + 1, d.getFullYear());
                    break;
                }
                case 'crop': report = this.generateCropReport(null, crop || 'সকল'); break;
                case 'expense': report = this.generateExpenseReport(null, start, end); break;
                case 'yield': report = this.generateYieldReport(null, crop); break;
                case 'sales': report = this.generateSalesReport(null, start, end); break;
                case 'profit_loss': report = this.generateProfitLossReport(null, start, end); break;
                case 'inventory': report = this.generateInventoryReport(); break;
                case 'task': report = this.generateTaskReport(null, start, end); break;
            }
            if (report) {
                this.createReportPreview('sf-report-preview', report);
                this.createReportDashboard(document.querySelector('.sf-reports-dashboard')?.parentElement?.id || 'sf-reports-container');
            }
        });
    },

    createReportPreview(containerId, reportData) {
        const container = document.getElementById(containerId);
        if (!container || !reportData) return;
        let html = '<div class="sf-report-preview">';
        html += '<div class="sf-preview-actions">';
        html += `<button class="sf-btn sf-btn-primary" id="sf-export-pdf">PDF এ ডাউনলোড</button>`;
        html += `<button class="sf-btn sf-btn-secondary" id="sf-export-csv">CSV এ ডাউনলোড</button>`;
        html += `<button class="sf-btn sf-btn-secondary" id="sf-export-json">JSON এ ডাউনলোড</button>`;
        html += `<button class="sf-btn sf-btn-secondary" id="sf-print-report">প্রিন্ট করুন</button>`;
        html += '</div>';
        html += '<div class="sf-report-content">';
        html += this.formatReport(reportData, reportData.type);
        html += '</div></div>';
        container.innerHTML = html;
        document.getElementById('sf-export-pdf')?.addEventListener('click', () => this.exportReport(reportData, 'pdf'));
        document.getElementById('sf-export-csv')?.addEventListener('click', () => this.exportReport(reportData, 'csv'));
        document.getElementById('sf-export-json')?.addEventListener('click', () => this.exportReport(reportData, 'json'));
        document.getElementById('sf-print-report')?.addEventListener('click', () => this.printReport(reportData));
    },

    exportReport(reportData, format) {
        let content, filename, mimeType;
        const baseName = reportData.title.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
        switch (format) {
            case 'csv': {
                const rows = [['ক্ষেত্র', 'মান']];
                const flatten = (obj, prefix = '') => {
                    Object.entries(obj).forEach(([key, val]) => {
                        const fullKey = prefix ? `${prefix}.${key}` : key;
                        if (val && typeof val === 'object' && !Array.isArray(val)) {
                            flatten(val, fullKey);
                        } else if (Array.isArray(val)) {
                            rows.push([fullKey, `${val.length} আইটেম`]);
                        } else {
                            rows.push([fullKey, String(val ?? '')]);
                        }
                    });
                };
                flatten(reportData);
                content = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
                filename = `${baseName}.csv`;
                mimeType = 'text/csv;charset=utf-8';
                break;
            }
            case 'json': {
                content = JSON.stringify(reportData, null, 2);
                filename = `${baseName}.json`;
                mimeType = 'application/json;charset=utf-8';
                break;
            }
            case 'pdf':
            default: {
                const printWindow = window.open('', '_blank');
                if (!printWindow) { alert('পপআপ ব্লকার বন্ধ করুন'); return; }
                printWindow.document.write('<!DOCTYPE html><html><head><meta charset="utf-8">');
                printWindow.document.write('<title>রিপোর্ট</title>');
                printWindow.document.write('<style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin:10px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.sf-report-summary{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0}.sf-report-summary-item{border:1px solid #ddd;padding:10px;border-radius:6px;min-width:120px}.sf-report-summary-label{display:block;font-size:12px;color:#666}.sf-report-summary-value{font-size:18px;font-weight:bold}</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(this.formatReport(reportData, reportData.type));
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
                return;
            }
        }
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    printReport(reportData) {
        this.exportReport(reportData, 'pdf');
    },

    _cacheReport(report) {
        const cached = loadCache();
        cached.push(report);
        if (cached.length > 50) cached.splice(0, cached.length - 50);
        saveCache(cached);
    }
};
