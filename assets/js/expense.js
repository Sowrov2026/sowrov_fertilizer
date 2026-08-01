// ==========================================
// SF AI V20 — EXPENSE TRACKER MODULE
// Sowrov Fertilizer
// ==========================================

const STORAGE_KEY = 'sf_expenses';

const EXPENSE_CATEGORIES = {
    seed: 'বীজ',
    labor: 'শ্রমিক',
    fertilizer: 'সার',
    medicine: 'ওষুধ',
    transport: 'পরিবহন',
    equipment: 'যন্ত্রপাতি',
    water: 'পানি',
    other: 'অন্যান্য',
};

const CATEGORY_ICONS = {
    seed: '🌱',
    labor: '👷',
    fertilizer: '🧪',
    medicine: '💊',
    transport: '🚛',
    equipment: '🔧',
    water: '💧',
    other: '📦',
};

const STATUS_LABELS = {
    pending: 'অপেক্ষমাণ',
    paid: 'পরিশোধিত',
    overdue: 'বকেয়া',
};

const CATEGORY_COLORS = {
    seed: '#28a745',
    labor: '#007bff',
    fertilizer: '#fd7e14',
    medicine: '#dc3545',
    transport: '#6f42c1',
    equipment: '#17a2b8',
    water: '#20c997',
    other: '#6c757d',
};

function generateId() {
    return 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function loadExpenses() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(n) {
    return Number(n).toLocaleString('bn-BD') + ' ৳';
}

function monthKey(dateStr) {
    return dateStr ? dateStr.substring(0, 7) : null;
}

function matchesFilter(exp, filter) {
    if (!filter) return true;
    if (filter.category && exp.category !== filter.category) return false;
    if (filter.status && exp.status !== filter.status) return false;
    if (filter.fieldId && exp.fieldId !== filter.fieldId) return false;
    if (filter.start && exp.date < filter.start) return false;
    if (filter.end && exp.date > filter.end) return false;
    return true;
}

function getMonthName(month) {
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    return months[month - 1] || '';
}

export const SFExpense = {
    init() {
        loadExpenses();
    },

    createExpense(data) {
        const expenses = loadExpenses();
        const expense = {
            id: generateId(),
            farmId: data.farmId || null,
            fieldId: data.fieldId || null,
            category: data.category || 'other',
            amount: Number(data.amount) || 0,
            description: data.description || '',
            date: data.date || todayStr(),
            receipt: data.receipt || null,
            vendor: data.vendor || '',
            status: 'paid',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        expenses.push(expense);
        saveExpenses(expenses);
        return expense;
    },

    updateExpense(id, data) {
        const expenses = loadExpenses();
        const idx = expenses.findIndex(e => e.id === id);
        if (idx === -1) return null;
        Object.assign(expenses[idx], data, { updatedAt: new Date().toISOString() });
        saveExpenses(expenses);
        return expenses[idx];
    },

    deleteExpense(id) {
        const expenses = loadExpenses();
        const filtered = expenses.filter(e => e.id !== id);
        if (filtered.length === expenses.length) return false;
        saveExpenses(filtered);
        return true;
    },

    getExpense(id) {
        return loadExpenses().find(e => e.id === id) || null;
    },

    getFarmExpenses(farmId, filter) {
        return loadExpenses().filter(e => e.farmId === farmId && matchesFilter(e, filter));
    },

    getFieldExpenses(fieldId, filter) {
        return loadExpenses().filter(e => e.fieldId === fieldId && matchesFilter(e, filter));
    },

    getExpensesByCategory(farmId) {
        const expenses = farmId ? loadExpenses().filter(e => e.farmId === farmId) : loadExpenses();
        const result = {};
        Object.keys(EXPENSE_CATEGORIES).forEach(cat => { result[cat] = 0; });
        expenses.forEach(e => { result[e.category] = (result[e.category] || 0) + e.amount; });
        return result;
    },

    getExpensesByDateRange(farmId, start, end) {
        const expenses = farmId ? loadExpenses().filter(e => e.farmId === farmId) : loadExpenses();
        return expenses.filter(e => e.date >= start && e.date <= end);
    },

    getExpensesByMonth(farmId, month, year) {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        const expenses = farmId ? loadExpenses().filter(e => e.farmId === farmId) : loadExpenses();
        return expenses.filter(e => e.date && e.date.startsWith(prefix));
    },

    getTotalExpenses(farmId) {
        const expenses = farmId ? loadExpenses().filter(e => e.farmId === farmId) : loadExpenses();
        return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    },

    getCategoryTotals(farmId) {
        return this.getExpensesByCategory(farmId);
    },

    getMonthlyTotal(farmId, month, year) {
        return this.getExpensesByMonth(farmId, month, year).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    },

    getDailyAverage(farmId) {
        const expenses = farmId ? loadExpenses().filter(e => e.farmId === farmId) : loadExpenses();
        if (expenses.length === 0) return 0;
        const dates = expenses.map(e => e.date).filter(Boolean);
        if (dates.length === 0) return 0;
        const sorted = [...new Set(dates)].sort();
        const days = Math.max(1, Math.round((new Date(sorted[sorted.length - 1]) - new Date(sorted[0])) / 86400000) + 1);
        const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        return Math.round(total / days);
    },

    calculateProfit(farmId) {
        const totalExpenses = this.getTotalExpenses(farmId);
        let totalRevenue = 0;
        try {
            const salesRaw = localStorage.getItem('sf_sales');
            if (salesRaw) {
                const sales = JSON.parse(salesRaw);
                const filtered = farmId ? sales.filter(s => s.farmId === farmId) : sales;
                totalRevenue = filtered.reduce((sum, s) => sum + (Number(s.amount) || Number(s.total) || 0), 0);
            }
        } catch { }
        return { revenue: totalRevenue, expenses: totalExpenses, profit: totalRevenue - totalExpenses };
    },

    getCropProfitability(farmId, cropName) {
        const expenses = loadExpenses().filter(e => {
            if (farmId && e.farmId !== farmId) return false;
            if (e.description && e.description.toLowerCase().includes(cropName.toLowerCase())) return true;
            if (e.category === 'fertilizer' || e.category === 'seed' || e.category === 'medicine') return true;
            return false;
        });
        const totalExp = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        return { cropName, totalExpenses: totalExp, expenseCount: expenses.length };
    },

    createExpenseList(containerId, farmId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const expenses = farmId ? this.getFarmExpenses(farmId) : loadExpenses();
        expenses.sort((a, b) => (b.date || '') > (a.date || '') ? 1 : -1);
        if (expenses.length === 0) {
            container.innerHTML = '<div class="sf-empty">কোনো খরচ পাওয়া যায়নি</div>';
            return;
        }
        const html = expenses.map(e => {
            const icon = CATEGORY_ICONS[e.category] || '📦';
            const catLabel = EXPENSE_CATEGORIES[e.category] || e.category;
            const statusLabel = STATUS_LABELS[e.status] || e.status;
            const color = CATEGORY_COLORS[e.category] || '#6c757d';
            return `<div class="sf-expense-card" data-id="${e.id}" style="border-left:4px solid ${color}">
                <div class="sf-expense-header">
                    <span class="sf-expense-icon">${icon}</span>
                    <span class="sf-expense-category">${catLabel}</span>
                    <span class="sf-expense-status sf-status-${e.status}">${statusLabel}</span>
                </div>
                <div class="sf-expense-amount">${formatCurrency(e.amount)}</div>
                ${e.description ? `<div class="sf-expense-desc">${e.description}</div>` : ''}
                <div class="sf-expense-meta">
                    <span>📅 ${formatDate(e.date)}</span>
                    ${e.vendor ? `<span>🏪 ${e.vendor}</span>` : ''}
                </div>
                <div class="sf-expense-actions">
                    <button class="btn-sm btn-edit" onclick="SFExpense.showEditForm('${e.id}', '${containerId}', '${farmId || ''}')">সম্পাদনা</button>
                    <button class="btn-sm btn-delete" onclick="SFExpense.deleteExpense('${e.id}'); SFExpense.createExpenseList('${containerId}', '${farmId || ''}')">মুছুন</button>
                </div>
            </div>`;
        }).join('');
        container.innerHTML = `<div class="sf-expense-list">${html}</div>`;
    },

    createExpenseForm(containerId, farmId, fieldId, editId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const existing = editId ? this.getExpense(editId) : null;
        const catOptions = Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => `<option value="${k}" ${existing && existing.category === k ? 'selected' : ''}>${v}</option>`).join('');
        container.innerHTML = `<div class="sf-expense-form">
            <h3>${existing ? 'খরচ সম্পাদনা' : 'নতুন খরচ যোগ করুন'}</h3>
            <form id="sfExpenseForm">
                <input type="hidden" name="farmId" value="${farmId || ''}">
                <input type="hidden" name="fieldId" value="${fieldId || ''}">
                <input type="hidden" name="editId" value="${editId || ''}">
                <div class="sf-form-group">
                    <label>খরচের ধরন</label>
                    <select name="category" required>${catOptions}</select>
                </div>
                <div class="sf-form-group">
                    <label>পরিমাণ (৳)</label>
                    <input type="number" name="amount" value="${existing ? existing.amount : ''}" placeholder="0" min="0" step="0.01" required>
                </div>
                <div class="sf-form-group">
                    <label>তারিখ</label>
                    <input type="date" name="date" value="${existing ? existing.date : todayStr()}" required>
                </div>
                <div class="sf-form-group">
                    <label>বিক্রেতা/সরবরাহকারী</label>
                    <input type="text" name="vendor" value="${existing ? existing.vendor : ''}" placeholder="নাম লিখুন">
                </div>
                <div class="sf-form-group">
                    <label>বিবরণ</label>
                    <textarea name="description" placeholder="বিস্তারিত লিখুন">${existing ? existing.description : ''}</textarea>
                </div>
                <div class="sf-form-actions">
                    <button type="submit" class="btn-primary">${existing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</button>
                    <button type="button" class="btn-secondary" onclick="document.getElementById('${containerId}').innerHTML=''">বাতিল</button>
                </div>
            </form>
        </div>`;
        document.getElementById('sfExpenseForm').addEventListener('submit', e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = {
                farmId: fd.get('farmId') || farmId,
                fieldId: fd.get('fieldId') || fieldId,
                category: fd.get('category'),
                amount: fd.get('amount'),
                description: fd.get('description'),
                date: fd.get('date'),
                vendor: fd.get('vendor'),
            };
            if (fd.get('editId')) {
                this.updateExpense(fd.get('editId'), data);
            } else {
                this.createExpense(data);
            }
            container.innerHTML = '';
            const event = new CustomEvent('sf-expense-saved');
            document.dispatchEvent(event);
        });
    },

    createExpenseStats(containerId, farmId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const total = this.getTotalExpenses(farmId);
        const dailyAvg = this.getDailyAverage(farmId);
        const catTotals = this.getCategoryTotals(farmId);
        const now = new Date();
        const monthTotal = this.getMonthlyTotal(farmId, now.getMonth() + 1, now.getFullYear());
        const profitData = this.calculateProfit(farmId);
        const catHtml = Object.entries(catTotals).map(([cat, amt]) => {
            if (amt === 0) return '';
            const color = CATEGORY_COLORS[cat] || '#6c757d';
            const label = EXPENSE_CATEGORIES[cat] || cat;
            const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
            return `<div class="sf-cat-row">
                <span class="sf-cat-label" style="color:${color}">● ${label}</span>
                <span class="sf-cat-amount">${formatCurrency(amt)}</span>
                <span class="sf-cat-pct">${pct}%</span>
            </div>`;
        }).filter(Boolean).join('');
        container.innerHTML = `<div class="sf-expense-stats">
            <h3>খরচের পরিসংখ্যান</h3>
            <div class="sf-stats-grid">
                <div class="sf-stat-card">
                    <div class="sf-stat-number">${formatCurrency(total)}</div>
                    <div class="sf-stat-label">মোট খরচ</div>
                </div>
                <div class="sf-stat-card">
                    <div class="sf-stat-number">${formatCurrency(monthTotal)}</div>
                    <div class="sf-stat-label">${getMonthName(now.getMonth() + 1)} খরচ</div>
                </div>
                <div class="sf-stat-card">
                    <div class="sf-stat-number">${formatCurrency(dailyAvg)}</div>
                    <div class="sf-stat-label">দৈনিক গড়</div>
                </div>
                <div class="sf-stat-card ${profitData.profit >= 0 ? 'sf-stat-profit' : 'sf-stat-loss'}">
                    <div class="sf-stat-number">${formatCurrency(profitData.profit)}</div>
                    <div class="sf-stat-label">${profitData.profit >= 0 ? 'লাভ' : 'ক্ষতি'}</div>
                </div>
            </div>
            ${catHtml ? `<div class="sf-cat-breakdown"><h4>ধরন অনুযায়ী খরচ</h4>${catHtml}</div>` : ''}
        </div>`;
    },

    createExpenseChart(containerId, farmId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const catTotals = this.getCategoryTotals(farmId);
        const total = Object.values(catTotals).reduce((a, b) => a + b, 0);
        if (total === 0) {
            container.innerHTML = '<div class="sf-empty">পর্যাপ্ত তথ্য নেই</div>';
            return;
        }
        const bars = Object.entries(catTotals).map(([cat, amt]) => {
            if (amt === 0) return '';
            const color = CATEGORY_COLORS[cat] || '#6c757d';
            const label = EXPENSE_CATEGORIES[cat] || cat;
            const pct = Math.round((amt / total) * 100);
            return `<div class="sf-chart-bar-row">
                <span class="sf-chart-label">${label}</span>
                <div class="sf-chart-bar-track">
                    <div class="sf-chart-bar-fill" style="width:${pct}%;background:${color}"></div>
                </div>
                <span class="sf-chart-pct">${pct}%</span>
            </div>`;
        }).filter(Boolean).join('');
        container.innerHTML = `<div class="sf-expense-chart">
            <h3>খরচের চার্ট</h3>
            <div class="sf-chart-container">${bars}</div>
        </div>`;
    },

    showEditForm(id, containerId, farmId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        this.createExpenseForm(containerId, farmId, null, id);
    },

    exportExpenses(farmId, format) {
        const expenses = farmId ? this.getFarmExpenses(farmId) : loadExpenses();
        const csvHeader = 'তারিখ,ধরন,পরিমাণ,বিক্রেতা,বিবরণ,অবস্থা';
        const csvRows = expenses.map(e => {
            return [
                e.date || '',
                EXPENSE_CATEGORIES[e.category] || e.category,
                e.amount,
                `"${(e.vendor || '').replace(/"/g, '""')}"`,
                `"${(e.description || '').replace(/"/g, '""')}"`,
                STATUS_LABELS[e.status] || e.status,
            ].join(',');
        });
        const csv = csvHeader + '\n' + csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khorcha-talika-${todayStr()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },
};
