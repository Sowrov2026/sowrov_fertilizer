// ==========================================
// SF AI V20 — TASK MANAGER MODULE
// Sowrov Fertilizer
// ==========================================

const STORAGE_KEY = 'sf_tasks';

const TASK_TYPES = {
    fertilizer: 'সার প্রয়োগ',
    spray: 'স্প্রে',
    water: 'সেচ',
    harvest: 'ফসল তোলা',
    sowing: 'বীজ বোনা',
    plowing: 'জমি চাষ',
    weeding: 'আগাছা পরিষ্কার',
    other: 'অন্যান্য',
};

const STATUS_LABELS = {
    pending: 'অপেক্ষমাণ',
    in_progress: 'চলমান',
    completed: 'সম্পন্ন',
    overdue: 'বিলম্বিত',
    cancelled: 'বাতিল',
};

const PRIORITY_LABELS = {
    low: 'কম',
    medium: 'মাঝারি',
    high: 'বেশি',
    urgent: 'জরুরি',
};

const PRIORITY_COLORS = {
    urgent: '#dc3545',
    high: '#fd7e14',
    medium: '#ffc107',
    low: '#28a745',
};

const RECURRENCE_OPTIONS = {
    daily: 'প্রতিদিন',
    weekly: 'সাপ্তাহিক',
    biweekly: 'পাক্ষিক',
    monthly: 'মাসিক',
};

function generateId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function daysBetween(a, b) {
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((db - da) / 86400000);
}

function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function matchesFilter(task, filter) {
    if (!filter) return true;
    if (filter.status && task.status !== filter.status) return false;
    if (filter.type && task.type !== filter.type) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.farmId && task.farmId !== filter.farmId) return false;
    if (filter.fieldId && task.fieldId !== filter.fieldId) return false;
    return true;
}

function autoOverdue(tasks) {
    const today = todayStr();
    let changed = false;
    tasks.forEach(t => {
        if (t.status !== 'completed' && t.status !== 'cancelled' && t.dueDate && t.dueDate < today) {
            t.status = 'overdue';
            changed = true;
        }
    });
    if (changed) saveTasks(tasks);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(n) {
    return Number(n).toLocaleString('bn-BD') + ' ৳';
}

export const SFTask = {
    init() {
        const tasks = loadTasks();
        autoOverdue(tasks);
    },

    createTask(data) {
        const tasks = loadTasks();
        const task = {
            id: generateId(),
            farmId: data.farmId || null,
            fieldId: data.fieldId || null,
            type: data.type || 'other',
            title: data.title || '',
            description: data.description || '',
            dueDate: data.dueDate || null,
            priority: data.priority || 'medium',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        tasks.push(task);
        saveTasks(tasks);
        return task;
    },

    updateTask(id, data) {
        const tasks = loadTasks();
        const idx = tasks.findIndex(t => t.id === id);
        if (idx === -1) return null;
        Object.assign(tasks[idx], data, { updatedAt: new Date().toISOString() });
        saveTasks(tasks);
        return tasks[idx];
    },

    deleteTask(id) {
        const tasks = loadTasks();
        const filtered = tasks.filter(t => t.id !== id);
        if (filtered.length === tasks.length) return false;
        saveTasks(filtered);
        return true;
    },

    getTask(id) {
        return loadTasks().find(t => t.id === id) || null;
    },

    getFarmTasks(farmId, filter) {
        const tasks = loadTasks();
        autoOverdue(tasks);
        return tasks.filter(t => t.farmId === farmId && matchesFilter(t, filter));
    },

    getFieldTasks(fieldId, filter) {
        const tasks = loadTasks();
        autoOverdue(tasks);
        return tasks.filter(t => t.fieldId === fieldId && matchesFilter(t, filter));
    },

    getOverdueTasks() {
        const tasks = loadTasks();
        autoOverdue(tasks);
        return tasks.filter(t => t.status === 'overdue');
    },

    getUpcomingTasks(days = 7) {
        const tasks = loadTasks();
        autoOverdue(tasks);
        const today = todayStr();
        const limit = addDays(today, days);
        return tasks.filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= limit && t.status !== 'completed' && t.status !== 'cancelled');
    },

    getCompletedTasks(farmId) {
        const tasks = loadTasks();
        return tasks.filter(t => t.status === 'completed' && (!farmId || t.farmId === farmId));
    },

    getTasksByType(type) {
        return loadTasks().filter(t => t.type === type);
    },

    completeTask(id) {
        return this.updateTask(id, { status: 'completed', completedAt: new Date().toISOString() });
    },

    cancelTask(id) {
        return this.updateTask(id, { status: 'cancelled' });
    },

    startTask(id) {
        return this.updateTask(id, { status: 'in_progress' });
    },

    createRecurringTask(data, recurrence) {
        const base = this.createTask({ ...data, recurrence });
        const baseDate = base.dueDate || todayStr();
        const recurringTasks = [base];
        let nextDate = baseDate;
        for (let i = 1; i <= 12; i++) {
            if (recurrence === 'daily') nextDate = addDays(nextDate, 1);
            else if (recurrence === 'weekly') nextDate = addDays(nextDate, 7);
            else if (recurrence === 'biweekly') nextDate = addDays(nextDate, 14);
            else if (recurrence === 'monthly') {
                const d = new Date(nextDate + 'T00:00:00');
                d.setMonth(d.getMonth() + 1);
                nextDate = d.toISOString().split('T')[0];
            }
            recurringTasks.push(this.createTask({ ...data, dueDate: nextDate, recurrence, recurringParent: base.id }));
        }
        return recurringTasks;
    },

    getTaskStats(farmId) {
        const tasks = loadTasks();
        const filtered = farmId ? tasks.filter(t => t.farmId === farmId) : tasks;
        const total = filtered.length;
        const completed = filtered.filter(t => t.status === 'completed').length;
        const pending = filtered.filter(t => t.status === 'pending').length;
        const inProgress = filtered.filter(t => t.status === 'in_progress').length;
        const overdue = filtered.filter(t => t.status === 'overdue').length;
        const cancelled = filtered.filter(t => t.status === 'cancelled').length;
        const byType = {};
        const byPriority = { urgent: 0, high: 0, medium: 0, low: 0 };
        filtered.forEach(t => {
            byType[t.type] = (byType[t.type] || 0) + 1;
            if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
        });
        return { total, completed, pending, inProgress, overdue, cancelled, byType, byPriority };
    },

    getCompletionRate(farmId) {
        const stats = this.getTaskStats(farmId);
        if (stats.total === 0) return 0;
        return Math.round((stats.completed / stats.total) * 100);
    },

    createTaskList(containerId, filter) {
        const container = document.getElementById(containerId);
        if (!container) return;
        autoOverdue(loadTasks());
        let tasks;
        if (filter && filter.farmId) tasks = this.getFarmTasks(filter.farmId, filter);
        else if (filter && filter.fieldId) tasks = this.getFieldTasks(filter.fieldId, filter);
        else tasks = loadTasks().filter(t => matchesFilter(t, filter));
        tasks.sort((a, b) => (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : 1);
        if (tasks.length === 0) {
            container.innerHTML = '<div class="sf-empty">কোনো কাজ পাওয়া যায়নি</div>';
            return;
        }
        const html = tasks.map(t => {
            const priorityColor = PRIORITY_COLORS[t.priority] || '#999';
            const statusLabel = STATUS_LABELS[t.status] || t.status;
            const typeLabel = TASK_TYPES[t.type] || t.type;
            return `<div class="sf-task-card" data-id="${t.id}" style="border-left:4px solid ${priorityColor}">
                <div class="sf-task-header">
                    <span class="sf-task-type">${typeLabel}</span>
                    <span class="sf-task-status sf-status-${t.status}">${statusLabel}</span>
                </div>
                <div class="sf-task-title">${t.title || 'শিরোনাহহীন'}</div>
                ${t.description ? `<div class="sf-task-desc">${t.description}</div>` : ''}
                <div class="sf-task-meta">
                    <span>📅 ${formatDate(t.dueDate)}</span>
                    <span class="sf-task-priority" style="color:${priorityColor}">● ${PRIORITY_LABELS[t.priority]}</span>
                </div>
                <div class="sf-task-actions">
                    ${t.status === 'pending' ? `<button class="btn-sm btn-start" onclick="SFTask.startTask('${t.id}')">শুরু করুন</button>` : ''}
                    ${t.status === 'in_progress' ? `<button class="btn-sm btn-complete" onclick="SFTask.completeTask('${t.id}')">সম্পন্ন</button>` : ''}
                    ${t.status !== 'completed' && t.status !== 'cancelled' ? `<button class="btn-sm btn-cancel" onclick="SFTask.cancelTask('${t.id}')">বাতিল</button>` : ''}
                    <button class="btn-sm btn-delete" onclick="SFTask.deleteTask('${t.id}'); SFTask.createTaskList('${containerId}', ${JSON.stringify(filter || {})})">মুছুন</button>
                </div>
            </div>`;
        }).join('');
        container.innerHTML = `<div class="sf-task-list">${html}</div>`;
    },

    createTaskForm(containerId, farmId, fieldId, editId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const existing = editId ? this.getTask(editId) : null;
        const typeOptions = Object.entries(TASK_TYPES).map(([k, v]) => `<option value="${k}" ${existing && existing.type === k ? 'selected' : ''}>${v}</option>`).join('');
        const priorityOptions = Object.entries(PRIORITY_LABELS).map(([k, v]) => `<option value="${k}" ${existing && existing.priority === k ? 'selected' : ''}>${v}</option>`).join('');
        container.innerHTML = `<div class="sf-task-form">
            <h3>${existing ? 'কাজ সম্পাদনা' : 'নতুন কাজ যোগ করুন'}</h3>
            <form id="sfTaskForm">
                <input type="hidden" name="farmId" value="${farmId || ''}">
                <input type="hidden" name="fieldId" value="${fieldId || ''}">
                <input type="hidden" name="editId" value="${editId || ''}">
                <div class="sf-form-group">
                    <label>কাজের ধরন</label>
                    <select name="type" required>${typeOptions}</select>
                </div>
                <div class="sf-form-group">
                    <label>শিরোনাহ</label>
                    <input type="text" name="title" value="${existing ? existing.title : ''}" placeholder="কাজের শিরোনাহ" required>
                </div>
                <div class="sf-form-group">
                    <label>বিবরণ</label>
                    <textarea name="description" placeholder="বিস্তারিত লিখুন">${existing ? existing.description : ''}</textarea>
                </div>
                <div class="sf-form-row">
                    <div class="sf-form-group">
                        <label>শেষ তারিখ</label>
                        <input type="date" name="dueDate" value="${existing && existing.dueDate ? existing.dueDate : ''}">
                    </div>
                    <div class="sf-form-group">
                        <label>অগ্রাধিকার</label>
                        <select name="priority">${priorityOptions}</select>
                    </div>
                </div>
                <div class="sf-form-actions">
                    <button type="submit" class="btn-primary">${existing ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</button>
                    <button type="button" class="btn-secondary" onclick="document.getElementById('${containerId}').innerHTML=''">বাতিল</button>
                </div>
            </form>
        </div>`;
        document.getElementById('sfTaskForm').addEventListener('submit', e => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const data = {
                farmId: fd.get('farmId') || farmId,
                fieldId: fd.get('fieldId') || fieldId,
                type: fd.get('type'),
                title: fd.get('title'),
                description: fd.get('description'),
                dueDate: fd.get('dueDate'),
                priority: fd.get('priority'),
            };
            if (fd.get('editId')) {
                this.updateTask(fd.get('editId'), data);
            } else {
                this.createTask(data);
            }
            container.innerHTML = '';
            const event = new CustomEvent('sf-task-saved');
            document.dispatchEvent(event);
        });
    },

    createTaskCalendar(containerId, farmId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const tasks = farmId ? this.getFarmTasks(farmId) : loadTasks();
        autoOverdue(loadTasks());
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const monthName = now.toLocaleDateString('bn-BD', { month: 'long', year: 'numeric' });
        const dayTasks = {};
        tasks.forEach(t => {
            if (t.dueDate) {
                if (!dayTasks[t.dueDate]) dayTasks[t.dueDate] = [];
                dayTasks[t.dueDate].push(t);
            }
        });
        let cells = '';
        for (let i = 0; i < firstDay; i++) cells += '<div class="sf-cal-empty"></div>';
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayT = dayTasks[dateStr] || [];
            const hasTask = dayT.length > 0;
            const isToday = d === now.getDate();
            cells += `<div class="sf-cal-day ${hasTask ? 'sf-cal-has-task' : ''} ${isToday ? 'sf-cal-today' : ''}">
                <span class="sf-cal-date">${d}</span>
                ${hasTask ? `<span class="sf-cal-count">${dayT.length}</span>` : ''}
            </div>`;
        }
        container.innerHTML = `<div class="sf-task-calendar">
            <h3>📅 ${monthName}</h3>
            <div class="sf-cal-grid">
                <div class="sf-cal-header">রবি</div>
                <div class="sf-cal-header">সোম</div>
                <div class="sf-cal-header">মঙ্গল</div>
                <div class="sf-cal-header">বুধ</div>
                <div class="sf-cal-header">বৃহ</div>
                <div class="sf-cal-header">শুক্র</div>
                <div class="sf-cal-header">শনি</div>
                ${cells}
            </div>
        </div>`;
    },

    createTaskStats(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const stats = this.getTaskStats();
        const rate = this.getCompletionRate();
        const overdueTasks = this.getOverdueTasks();
        const upcoming = this.getUpcomingTasks(7);
        container.innerHTML = `<div class="sf-task-stats">
            <h3>কাজের পরিসংখ্যান</h3>
            <div class="sf-stats-grid">
                <div class="sf-stat-card">
                    <div class="sf-stat-number">${stats.total}</div>
                    <div class="sf-stat-label">মোট কাজ</div>
                </div>
                <div class="sf-stat-card sf-stat-completed">
                    <div class="sf-stat-number">${stats.completed}</div>
                    <div class="sf-stat-label">সম্পন্ন</div>
                </div>
                <div class="sf-stat-card sf-stat-progress">
                    <div class="sf-stat-number">${stats.inProgress}</div>
                    <div class="sf-stat-label">চলমান</div>
                </div>
                <div class="sf-stat-card sf-stat-overdue">
                    <div class="sf-stat-number">${stats.overdue}</div>
                    <div class="sf-stat-label">বিলম্বিত</div>
                </div>
            </div>
            <div class="sf-stat-bar">
                <div class="sf-stat-bar-label">সম্পন্নের হার: ${rate}%</div>
                <div class="sf-stat-bar-track"><div class="sf-stat-bar-fill" style="width:${rate}%"></div></div>
            </div>
            ${overdueTasks.length > 0 ? `<div class="sf-overdue-list">
                <h4>⚠️ বিলম্বিত কাজ</h4>
                ${overdueTasks.slice(0, 5).map(t => `<div class="sf-overdue-item"><span>${t.title || 'শিরোনাহহীন'}</span><span>${formatDate(t.dueDate)}</span></div>`).join('')}
            </div>` : ''}
            ${upcoming.length > 0 ? `<div class="sf-upcoming-list">
                <h4>📅 আসন্ন ৭ দিনের কাজ</h4>
                ${upcoming.slice(0, 5).map(t => `<div class="sf-upcoming-item"><span>${t.title || 'শিরোনাহহীন'}</span><span>${formatDate(t.dueDate)}</span></div>`).join('')}
            </div>` : ''}
        </div>`;
    },

    exportTasks(farmId, format) {
        const tasks = farmId ? this.getFarmTasks(farmId) : loadTasks();
        const csvHeader = 'শিরোনাহ,ধরন,শেষ তারিখ,অগ্রাধিকার,অবস্থা,বিবরণ';
        const csvRows = tasks.map(t => {
            return [
                `"${t.title || ''}"`,
                TASK_TYPES[t.type] || t.type,
                t.dueDate || '',
                PRIORITY_LABELS[t.priority] || t.priority,
                STATUS_LABELS[t.status] || t.status,
                `"${(t.description || '').replace(/"/g, '""')}"`,
            ].join(',');
        });
        const csv = csvHeader + '\n' + csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kaj-talika-${todayStr()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },
};
