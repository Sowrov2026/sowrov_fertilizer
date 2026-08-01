// ==========================================
// SF AI V15 — SMART REMINDER MODULE
// Sowrov Fertilizer
// ==========================================

const STORAGE_KEY = 'sf_reminders';

const REMINDER_TEMPLATES = {
    'fertilizer': [
        { title: 'ইউরিয়া ছিটানো', description: 'ইউরিয়া 2-3kg/বিঘা', time: '06:00' },
        { title: 'কমপোস্ট যোগ', description: 'কমপোস্ট 50kg/বিঘা', time: '08:00' },
        { title: 'ডিএপি প্রয়োগ', description: 'DAP 2-3kg/বিঘা', time: '07:00' },
    ],
    'spray': [
        { title: 'পোকা নিয়ন্ত্রণ স্প্রে', description: 'প্রয়োজনীয় পেস্টিসাইড', time: '16:00' },
        { title: 'রোগ নিয়ন্ত্রণ স্প্রে', description: 'ছত্রাকনাশক প্রয়োগ', time: '07:00' },
    ],
    'irrigation': [
        { title: 'সেচ দিন', description: 'পর্যাপ্ত পানি দিন', time: '06:00' },
    ],
    'harvest': [
        { title: 'ফসল তোলার সময়', description: 'ফসল পরিপক্ব হয়েছে', time: '07:00' },
    ],
    'planting': [
        { title: 'বীজ রোপণ', description: 'নির্ধারিত সময়ে রোপণ', time: '08:00' },
    ],
};

const TYPE_LABELS = {
    'fertilizer': 'সার প্রয়োগ',
    'spray': 'স্প্রে',
    'irrigation': 'সেচ',
    'harvest': 'ফসল তোলা',
    'planting': 'রোপণ',
    'other': 'অন্যান্য',
};

const PRIORITY_LABELS = {
    'low': 'কম',
    'medium': 'মাঝারি',
    'high': 'বেশি',
};

const RECURRING_LABELS = {
    'daily': 'প্রতিদিন',
    'weekly': 'সাপ্তাহিক',
    'biweekly': 'পাক্ষিক',
    'monthly': 'মাসিক',
};

const REMINDER_TYPES = Object.keys(REMINDER_TEMPLATES);

function generateId() {
    return 'rem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function loadReminders() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveReminders(reminders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

function normalizeDate(date) {
    if (!date) return null;
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return String(date).split('T')[0];
}

function addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

function getNextRecurringDate(dateStr, recurring) {
    if (!recurring) return null;
    switch (recurring) {
        case 'daily': return addDays(dateStr, 1);
        case 'weekly': return addDays(dateStr, 7);
        case 'biweekly': return addDays(dateStr, 14);
        case 'monthly': {
            const d = new Date(dateStr + 'T00:00:00');
            d.setMonth(d.getMonth() + 1);
            return d.toISOString().split('T')[0];
        }
        default: return null;
    }
}

function isToday(dateStr) {
    return dateStr === new Date().toISOString().split('T')[0];
}

function isPast(dateStr) {
    return dateStr < new Date().toISOString().split('T')[0];
}

function daysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

export const SFReminder = {

    addReminder({ title, description, date, time, type, recurring, cropName, areaInfo, priority }) {
        if (!title || !date) return null;

        const reminder = {
            id: generateId(),
            title: title,
            description: description || '',
            date: normalizeDate(date),
            time: time || '08:00',
            type: REMINDER_TYPES.includes(type) ? type : 'other',
            recurring: recurring || null,
            cropName: cropName || null,
            areaInfo: areaInfo || null,
            priority: ['low', 'high'].includes(priority) ? priority : 'medium',
            completed: false,
            createdAt: new Date().toISOString(),
            notified: false,
        };

        const reminders = loadReminders();
        reminders.push(reminder);
        saveReminders(reminders);

        return reminder;
    },

    getReminders(filter) {
        let reminders = loadReminders();

        if (filter) {
            if (filter.completed !== undefined) {
                reminders = reminders.filter(r => r.completed === filter.completed);
            }
            if (filter.type) {
                reminders = reminders.filter(r => r.type === filter.type);
            }
            if (filter.priority) {
                reminders = reminders.filter(r => r.priority === filter.priority);
            }
            if (filter.date) {
                const filterDate = normalizeDate(filter.date);
                reminders = reminders.filter(r => r.date === filterDate);
            }
            if (filter.dateFrom) {
                const from = normalizeDate(filter.dateFrom);
                reminders = reminders.filter(r => r.date >= from);
            }
            if (filter.dateTo) {
                const to = normalizeDate(filter.dateTo);
                reminders = reminders.filter(r => r.date <= to);
            }
            if (filter.cropName) {
                reminders = reminders.filter(r => r.cropName === filter.cropName);
            }
            if (filter.search) {
                const q = filter.search.toLowerCase();
                reminders = reminders.filter(r =>
                    r.title.toLowerCase().includes(q) ||
                    r.description.toLowerCase().includes(q) ||
                    (r.cropName && r.cropName.toLowerCase().includes(q))
                );
            }
        }

        reminders.sort((a, b) => {
            const dateA = a.date + ' ' + a.time;
            const dateB = b.date + ' ' + b.time;
            return dateA.localeCompare(dateB);
        });

        return reminders;
    },

    getUpcoming(days) {
        const d = days || 7;
        const today = new Date().toISOString().split('T')[0];
        const endDate = addDays(today, d);

        return loadReminders()
            .filter(r => !r.completed && r.date >= today && r.date <= endDate)
            .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    },

    completeReminder(id) {
        const reminders = loadReminders();
        const idx = reminders.findIndex(r => r.id === id);
        if (idx === -1) return null;

        const reminder = reminders[idx];
        reminder.completed = true;

        if (reminder.recurring && !isPast(reminder.date)) {
            const nextDate = getNextRecurringDate(reminder.date, reminder.recurring);
            if (nextDate) {
                const next = { ...reminder };
                next.id = generateId();
                next.date = nextDate;
                next.completed = false;
                next.notified = false;
                next.createdAt = new Date().toISOString();
                reminders.push(next);
            }
        }

        saveReminders(reminders);
        return reminder;
    },

    deleteReminder(id) {
        const reminders = loadReminders();
        const idx = reminders.findIndex(r => r.id === id);
        if (idx === -1) return false;

        reminders.splice(idx, 1);
        saveReminders(reminders);
        return true;
    },

    updateReminder(id, updates) {
        const reminders = loadReminders();
        const idx = reminders.findIndex(r => r.id === id);
        if (idx === -1) return null;

        const reminder = reminders[idx];
        if (updates.title !== undefined) reminder.title = updates.title;
        if (updates.description !== undefined) reminder.description = updates.description;
        if (updates.date !== undefined) reminder.date = normalizeDate(updates.date);
        if (updates.time !== undefined) reminder.time = updates.time;
        if (updates.type !== undefined && REMINDER_TYPES.includes(updates.type)) reminder.type = updates.type;
        if (updates.recurring !== undefined) reminder.recurring = updates.recurring;
        if (updates.cropName !== undefined) reminder.cropName = updates.cropName;
        if (updates.areaInfo !== undefined) reminder.areaInfo = updates.areaInfo;
        if (updates.priority !== undefined && ['low', 'medium', 'high'].includes(updates.priority)) reminder.priority = updates.priority;
        if (updates.completed !== undefined) reminder.completed = updates.completed;
        if (updates.notified !== undefined) reminder.notified = updates.notified;

        saveReminders(reminders);
        return reminder;
    },

    clearCompleted() {
        const reminders = loadReminders().filter(r => !r.completed);
        saveReminders(reminders);
        return reminders;
    },

    async requestNotificationPermission() {
        if (!('Notification' in window)) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;

        const result = await Notification.requestPermission();
        return result === 'granted';
    },

    scheduleNotification(reminder) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        if (reminder.notified || reminder.completed) return;

        const now = new Date();
        const [h, m] = reminder.time.split(':').map(Number);
        const target = new Date(reminder.date + 'T00:00:00');
        target.setHours(h, m, 0, 0);

        const delay = target.getTime() - now.getTime();
        if (delay < 0) return;

        const maxDelay = 2147483647;
        if (delay > maxDelay) return;

        setTimeout(() => {
            const updated = loadReminders().find(r => r.id === reminder.id);
            if (!updated || updated.completed || updated.notified) return;

            const typeLabel = TYPE_LABELS[updated.type] || 'অন্যান্য';
            const body = [
                updated.description,
                updated.cropName ? `ফসল: ${updated.cropName}` : '',
                updated.areaInfo ? `এলাকা: ${updated.areaInfo}` : '',
            ].filter(Boolean).join('\n');

            new Notification(`${typeLabel} — ${updated.title}`, {
                body: body || 'আপনার কৃষি কাজের রিমাইন্ডার',
                icon: '/assets/images/logo.png',
                tag: updated.id,
            });

            SFReminder.updateReminder(updated.id, { notified: true });
        }, delay);
    },

    getTemplates(type) {
        if (type && REMINDER_TEMPLATES[type]) {
            return REMINDER_TEMPLATES[type];
        }
        return REMINDER_TEMPLATES;
    },

    getStats() {
        const reminders = loadReminders();
        const today = new Date().toISOString().split('T')[0];
        const upcoming = SFReminder.getUpcoming(7);

        return {
            total: reminders.length,
            completed: reminders.filter(r => r.completed).length,
            pending: reminders.filter(r => !r.completed).length,
            overdue: reminders.filter(r => !r.completed && r.date < today).length,
            today: reminders.filter(r => !r.completed && r.date === today).length,
            upcoming: upcoming.length,
            byType: REMINDER_TYPES.reduce((acc, type) => {
                acc[type] = reminders.filter(r => r.type === type && !r.completed).length;
                return acc;
            }, {}),
            byPriority: ['low', 'medium', 'high'].reduce((acc, p) => {
                acc[p] = reminders.filter(r => r.priority === p && !r.completed).length;
                return acc;
            }, {}),
        };
    },

    createReminderWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const types = REMINDER_TYPES;
        const priorities = ['low', 'medium', 'high'];
        const recurringOptions = [null, 'daily', 'weekly', 'biweekly', 'monthly'];

        container.innerHTML = `
            <style>
                .sf-reminder-widget {
                    font-family: 'Hind Siliguri', 'Kalpurush', sans-serif;
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 24px;
                    background: #f0f8f0;
                    border-radius: 16px;
                    border: 2px solid #2d7a2d;
                }
                .sf-reminder-title {
                    text-align: center;
                    font-size: 1.5em;
                    color: #1a5c1a;
                    margin-bottom: 24px;
                    font-weight: bold;
                }
                .sf-reminder-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }
                .sf-reminder-group {
                    flex: 1;
                    min-width: 140px;
                }
                .sf-reminder-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-weight: bold;
                    color: #333;
                    font-size: 0.95em;
                }
                .sf-reminder-group select,
                .sf-reminder-group input,
                .sf-reminder-group textarea {
                    width: 100%;
                    padding: 10px 12px;
                    border: 2px solid #aaa;
                    border-radius: 8px;
                    font-size: 1em;
                    font-family: inherit;
                    box-sizing: border-box;
                    resize: vertical;
                }
                .sf-reminder-group select:focus,
                .sf-reminder-group input:focus,
                .sf-reminder-group textarea:focus {
                    border-color: #2d7a2d;
                    outline: none;
                }
                .sf-reminder-btn {
                    display: block;
                    width: 100%;
                    padding: 14px;
                    background: #2d7a2d;
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.15em;
                    font-weight: bold;
                    font-family: inherit;
                    cursor: pointer;
                    margin-top: 8px;
                }
                .sf-reminder-btn:hover { background: #1a5c1a; }
                .sf-reminder-btn-secondary {
                    background: #6c757d;
                }
                .sf-reminder-btn-secondary:hover { background: #5a6268; }
                .sf-reminder-list {
                    margin-top: 24px;
                }
                .sf-reminder-list h3 {
                    color: #1a5c1a;
                    margin: 0 0 12px 0;
                }
                .sf-reminder-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 14px;
                    background: #fff;
                    border-radius: 10px;
                    border: 1px solid #ddd;
                    margin-bottom: 10px;
                    border-left: 4px solid #2d7a2d;
                }
                .sf-reminder-item.priority-high { border-left-color: #dc3545; }
                .sf-reminder-item.priority-low { border-left-color: #6c757d; }
                .sf-reminder-item.completed { opacity: 0.5; }
                .sf-reminder-item.overdue { border-left-color: #dc3545; background: #fff5f5; }
                .sf-reminder-check {
                    width: 20px;
                    height: 20px;
                    margin-top: 2px;
                    cursor: pointer;
                    flex-shrink: 0;
                }
                .sf-reminder-info { flex: 1; }
                .sf-reminder-info .title {
                    font-weight: bold;
                    color: #333;
                    font-size: 1.05em;
                }
                .sf-reminder-info .desc {
                    font-size: 0.9em;
                    color: #666;
                    margin-top: 2px;
                }
                .sf-reminder-info .meta {
                    font-size: 0.85em;
                    color: #888;
                    margin-top: 4px;
                }
                .sf-reminder-meta-tag {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.8em;
                    margin-right: 4px;
                    background: #e8f5e9;
                    color: #2d7a2d;
                }
                .sf-reminder-meta-tag.type-tag { background: #e3f2fd; color: #1565c0; }
                .sf-reminder-meta-tag.priority-tag { background: #fff3cd; color: #856404; }
                .sf-reminder-meta-tag.priority-high-tag { background: #f8d7da; color: #721c24; }
                .sf-reminder-meta-tag.recurring-tag { background: #f3e5f5; color: #7b1fa2; }
                .sf-reminder-actions {
                    display: flex;
                    gap: 6px;
                    flex-shrink: 0;
                }
                .sf-reminder-actions button {
                    padding: 6px 10px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    background: #fff;
                    cursor: pointer;
                    font-size: 0.85em;
                    font-family: inherit;
                }
                .sf-reminder-actions button:hover { background: #f0f0f0; }
                .sf-reminder-actions .delete-btn { color: #dc3545; border-color: #dc3545; }
                .sf-reminder-stats {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .sf-reminder-stat {
                    flex: 1;
                    min-width: 80px;
                    text-align: center;
                    padding: 12px;
                    background: #fff;
                    border-radius: 10px;
                    border: 1px solid #ddd;
                }
                .sf-reminder-stat .stat-num {
                    font-size: 1.5em;
                    font-weight: bold;
                    color: #2d7a2d;
                }
                .sf-reminder-stat .stat-label {
                    font-size: 0.8em;
                    color: #666;
                    margin-top: 2px;
                }
                .sf-reminder-filter {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }
                .sf-reminder-filter button {
                    padding: 6px 14px;
                    border: 2px solid #2d7a2d;
                    border-radius: 8px;
                    background: #fff;
                    color: #2d7a2d;
                    font-family: inherit;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 0.9em;
                }
                .sf-reminder-filter button.active {
                    background: #2d7a2d;
                    color: #fff;
                }
                .sf-reminder-empty {
                    text-align: center;
                    padding: 30px;
                    color: #888;
                    font-size: 1.1em;
                }
                .sf-reminder-template-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .sf-reminder-template-btn {
                    padding: 8px 14px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    background: #fff;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.9em;
                    transition: all 0.2s;
                }
                .sf-reminder-template-btn:hover {
                    border-color: #2d7a2d;
                    background: #e8f5e9;
                }
            </style>

            <div class="sf-reminder-widget">
                <div class="sf-reminder-title">স্মার্ট রিমাইন্ডার</div>

                <div class="sf-reminder-stats" id="sf-reminder-stats"></div>

                <div id="sf-reminder-form-section">
                    <div class="sf-reminder-template-list" id="sf-reminder-templates"></div>

                    <div class="sf-reminder-row">
                        <div class="sf-reminder-group" style="flex:2;">
                            <label>শিরোনাম</label>
                            <input type="text" id="sf-rem-title" placeholder="যেমন: সার দিন">
                        </div>
                        <div class="sf-reminder-group">
                            <label>ধরন</label>
                            <select id="sf-rem-type">
                                ${types.map(t => `<option value="${t}">${TYPE_LABELS[t]}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="sf-reminder-row">
                        <div class="sf-reminder-group">
                            <label>বিবরণ</label>
                            <textarea id="sf-rem-desc" rows="2" placeholder="যেমন: ইউরিয়া 2kg/বিঘা"></textarea>
                        </div>
                    </div>

                    <div class="sf-reminder-row">
                        <div class="sf-reminder-group">
                            <label>তারিখ</label>
                            <input type="date" id="sf-rem-date">
                        </div>
                        <div class="sf-reminder-group">
                            <label>সময়</label>
                            <input type="time" id="sf-rem-time" value="08:00">
                        </div>
                        <div class="sf-reminder-group">
                            <label>অগ্রাধিকার</label>
                            <select id="sf-rem-priority">
                                ${priorities.map(p => `<option value="${p}" ${p === 'medium' ? 'selected' : ''}>${PRIORITY_LABELS[p]}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="sf-reminder-row">
                        <div class="sf-reminder-group">
                            <label>পুনরাবৃত্তি</label>
                            <select id="sf-rem-recurring">
                                <option value="">নেই</option>
                                ${recurringOptions.filter(Boolean).map(r => `<option value="${r}">${RECURRING_LABELS[r]}</option>`).join('')}
                            </select>
                        </div>
                        <div class="sf-reminder-group">
                            <label>ফসলের নাম (ঐচ্ছিক)</label>
                            <input type="text" id="sf-rem-crop" placeholder="যেমন: ধান">
                        </div>
                        <div class="sf-reminder-group">
                            <label>এলাকা (ঐচ্ছিক)</label>
                            <input type="text" id="sf-rem-area" placeholder="যেমন: ২ বিঘা">
                        </div>
                    </div>

                    <button class="sf-reminder-btn" id="sf-rem-add">রিমাইন্ডার যোগ করুন</button>
                </div>

                <div class="sf-reminder-list">
                    <div class="sf-reminder-filter" id="sf-reminder-filters">
                        <button class="active" data-filter="all">সব</button>
                        <button data-filter="pending">বাকি</button>
                        <button data-filter="today">আজ</button>
                        <button data-filter="upcoming">আসন্ন</button>
                        <button data-filter="completed">সম্পন্ন</button>
                    </div>
                    <div id="sf-reminder-list-items"></div>
                </div>
            </div>
        `;

        const self = this;

        function refreshStats() {
            const stats = self.getStats();
            document.getElementById('sf-reminder-stats').innerHTML = `
                <div class="sf-reminder-stat"><div class="stat-num">${stats.total}</div><div class="stat-label">মোট</div></div>
                <div class="sf-reminder-stat"><div class="stat-num">${stats.pending}</div><div class="stat-label">বাকি</div></div>
                <div class="sf-reminder-stat"><div class="stat-num">${stats.today}</div><div class="stat-label">আজ</div></div>
                <div class="sf-reminder-stat"><div class="stat-num">${stats.overdue}</div><div class="stat-label">বিলম্বিত</div></div>
                <div class="sf-reminder-stat"><div class="stat-num">${stats.completed}</div><div class="stat-label">সম্পন্ন</div></div>
            `;
        }

        function refreshList(filter) {
            const listEl = document.getElementById('sf-reminder-list-items');
            let reminders;

            if (filter === 'pending') {
                reminders = self.getReminders({ completed: false });
            } else if (filter === 'today') {
                reminders = self.getReminders({ completed: false }).filter(r => isToday(r.date));
            } else if (filter === 'upcoming') {
                reminders = self.getUpcoming(7);
            } else if (filter === 'completed') {
                reminders = self.getReminders({ completed: true });
            } else {
                reminders = self.getReminders();
            }

            if (reminders.length === 0) {
                listEl.innerHTML = '<div class="sf-reminder-empty">কোনো রিমাইন্ডার নেই</div>';
                return;
            }

            listEl.innerHTML = reminders.map(r => {
                const typeLabel = TYPE_LABELS[r.type] || 'অন্যান্য';
                const priorityLabel = PRIORITY_LABELS[r.priority] || 'মাঝারি';
                const classes = ['sf-reminder-item'];
                if (r.completed) classes.push('completed');
                if (r.priority === 'high') classes.push('priority-high');
                else if (r.priority === 'low') classes.push('priority-low');
                if (!r.completed && isPast(r.date)) classes.push('overdue');

                const priorityTagClass = r.priority === 'high' ? 'priority-high-tag' : '';

                let metaHtml = '';
                metaHtml += `<span class="sf-reminder-meta-tag type-tag">${typeLabel}</span>`;
                metaHtml += `<span class="sf-reminder-meta-tag priority-tag ${priorityTagClass}">${priorityLabel}</span>`;
                if (r.recurring) metaHtml += `<span class="sf-reminder-meta-tag recurring-tag">${RECURRING_LABELS[r.recurring]}</span>`;
                if (r.cropName) metaHtml += `<span class="sf-reminder-meta-tag">${r.cropName}</span>`;
                if (r.areaInfo) metaHtml += `<span class="sf-reminder-meta-tag">${r.areaInfo}</span>`;

                const days = daysUntil(r.date);
                let dateLabel = r.date;
                if (days === 0) dateLabel = 'আজ';
                else if (days === 1) dateLabel = 'আগামীকাল';
                else if (days === -1) dateLabel = 'গতকাল';
                else if (days < 0) dateLabel = `${Math.abs(days)} দিন আগে`;

                return `
                    <div class="${classes.join(' ')}" data-id="${r.id}">
                        <input type="checkbox" class="sf-reminder-check" ${r.completed ? 'checked' : ''} data-id="${r.id}">
                        <div class="sf-reminder-info">
                            <div class="title">${r.title}${r.completed ? ' ✓' : ''}</div>
                            ${r.description ? `<div class="desc">${r.description}</div>` : ''}
                            <div class="meta">${metaHtml}</div>
                            <div class="meta">${dateLabel} — ${r.time}${!r.completed && isPast(r.date) && !isToday(r.date) ? ' (বিলম্বিত!)' : ''}</div>
                        </div>
                        <div class="sf-reminder-actions">
                            <button class="edit-btn" data-id="${r.id}" title="সম্পাদনা">✏️</button>
                            <button class="delete-btn" data-id="${r.id}" title="মুছুন">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');

            listEl.querySelectorAll('.sf-reminder-check').forEach(cb => {
                cb.addEventListener('change', function () {
                    if (this.checked) {
                        self.completeReminder(this.dataset.id);
                    } else {
                        self.updateReminder(this.dataset.id, { completed: false });
                    }
                    refreshStats();
                    refreshList(currentFilter);
                });
            });

            listEl.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    if (confirm('আপনি কি নিশ্চিত?')) {
                        self.deleteReminder(this.dataset.id);
                        refreshStats();
                        refreshList(currentFilter);
                    }
                });
            });

            listEl.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.dataset.id;
                    const reminder = self.getReminders().find(r => r.id === id);
                    if (!reminder) return;

                    document.getElementById('sf-rem-title').value = reminder.title;
                    document.getElementById('sf-rem-desc').value = reminder.description;
                    document.getElementById('sf-rem-date').value = reminder.date;
                    document.getElementById('sf-rem-time').value = reminder.time;
                    document.getElementById('sf-rem-type').value = reminder.type;
                    document.getElementById('sf-rem-priority').value = reminder.priority;
                    document.getElementById('sf-rem-recurring').value = reminder.recurring || '';
                    document.getElementById('sf-rem-crop').value = reminder.cropName || '';
                    document.getElementById('sf-rem-area').value = reminder.areaInfo || '';

                    self.deleteReminder(id);
                    refreshStats();
                    refreshList(currentFilter);
                    document.getElementById('sf-rem-title').focus();
                });
            });
        }

        let currentFilter = 'all';

        document.getElementById('sf-reminder-filters').addEventListener('click', function (e) {
            if (e.target.tagName !== 'BUTTON') return;
            this.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            refreshList(currentFilter);
        });

        document.getElementById('sf-rem-add').addEventListener('click', function () {
            const title = document.getElementById('sf-rem-title').value.trim();
            const desc = document.getElementById('sf-rem-desc').value.trim();
            const date = document.getElementById('sf-rem-date').value;
            const time = document.getElementById('sf-rem-time').value;
            const type = document.getElementById('sf-rem-type').value;
            const priority = document.getElementById('sf-rem-priority').value;
            const recurring = document.getElementById('sf-rem-recurring').value || null;
            const crop = document.getElementById('sf-rem-crop').value.trim() || null;
            const area = document.getElementById('sf-rem-area').value.trim() || null;

            if (!title) { alert('শিরোনাম দিন'); return; }
            if (!date) { alert('তারিখ দিন'); return; }

            self.addReminder({
                title, description: desc, date, time, type,
                recurring, cropName: crop, areaInfo: area, priority
            });

            document.getElementById('sf-rem-title').value = '';
            document.getElementById('sf-rem-desc').value = '';
            document.getElementById('sf-rem-date').value = '';
            document.getElementById('sf-rem-time').value = '08:00';
            document.getElementById('sf-rem-recurring').value = '';
            document.getElementById('sf-rem-crop').value = '';
            document.getElementById('sf-rem-area').value = '';

            refreshStats();
            refreshList(currentFilter);
        });

        const templatesContainer = document.getElementById('sf-reminder-templates');
        for (const [type, items] of Object.entries(REMINDER_TEMPLATES)) {
            items.forEach(tpl => {
                const btn = document.createElement('button');
                btn.className = 'sf-reminder-template-btn';
                btn.textContent = `${TYPE_LABELS[type]}: ${tpl.title}`;
                btn.addEventListener('click', function () {
                    document.getElementById('sf-rem-title').value = tpl.title;
                    document.getElementById('sf-rem-desc').value = tpl.description;
                    document.getElementById('sf-rem-type').value = type;
                    document.getElementById('sf-rem-time').value = tpl.time;
                });
                templatesContainer.appendChild(btn);
            });
        }

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sf-rem-date').value = today;

        self.scheduleAllNotifications();
        refreshStats();
        refreshList(currentFilter);

        return {
            refresh() { refreshStats(); refreshList(currentFilter); },
            destroy() { container.innerHTML = ''; },
        };
    },

    scheduleAllNotifications() {
        const upcoming = this.getUpcoming(7);
        upcoming.forEach(r => this.scheduleNotification(r));
    },
};
