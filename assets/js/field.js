/**
 * SFField - V20 Field Management Module
 * ES Module for field CRUD, scheduling, and crop tracking
 */

const STORAGE_KEY = 'sf_fields';
const CROP_LIFECYCLE = ['seedling', 'growing', 'flowering', 'harvesting', 'harvested'];
const CROP_STATUS_BN = {
    seedling: 'চারা',
    growing: 'বৃদ্ধি',
    flowering: 'ফুল',
    harvesting: 'কাটা',
    harvested: 'কাটা হয়েছে'
};

function generateId() {
    return 'field_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function generateScheduleId() {
    return 'sch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function loadFields() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('মাঠ ডেটা লোড করতে সমস্যা:', e);
        return [];
    }
}

function saveFields(fields) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
        return true;
    } catch (e) {
        console.error('মাঠ ডেটা সংরক্ষণ করতে সমস্যা:', e);
        return false;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatArea(acres) {
    if (acres === undefined || acres === null) return '০ একর';
    return acres + ' একর';
}

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
}

export const SFField = {
    /**
     * Initialize the field module
     */
    init() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
    },

    // ─── CRUD Operations ───────────────────────────────────────────────

    /**
     * Create a new field
     * @param {string} farmId - Parent farm ID
     * @param {Object} data - Field data
     * @returns {Object} Created field object
     */
    createField(farmId, data = {}) {
        const fields = loadFields();
        const field = {
            id: generateId(),
            farmId: farmId,
            name: data.name || 'নতুন মাঠ',
            crop: data.crop || '',
            area: parseFloat(data.area) || 0,
            plantingDate: data.plantingDate || null,
            expectedHarvest: data.expectedHarvest || null,
            fertilizerSchedule: [],
            diseaseHistory: [],
            waterSchedule: [],
            status: data.status || 'active',
            notes: [],
            createdAt: new Date().toISOString()
        };
        fields.push(field);
        saveFields(fields);
        return field;
    },

    /**
     * Update an existing field
     * @param {string} fieldId - Field ID
     * @param {Object} data - Updated data
     * @returns {Object|null} Updated field or null
     */
    updateField(fieldId, data = {}) {
        const fields = loadFields();
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return null;

        fields[index] = {
            ...fields[index],
            ...data,
            id: fields[index].id,
            farmId: fields[index].farmId,
            createdAt: fields[index].createdAt
        };
        saveFields(fields);
        return fields[index];
    },

    /**
     * Delete a field
     * @param {string} fieldId - Field ID
     * @returns {boolean} Success status
     */
    deleteField(fieldId) {
        const fields = loadFields();
        const filtered = fields.filter(f => f.id !== fieldId);
        if (filtered.length === fields.length) return false;
        saveFields(filtered);
        return true;
    },

    /**
     * Get a single field by ID
     * @param {string} fieldId - Field ID
     * @returns {Object|null} Field object or null
     */
    getField(fieldId) {
        const fields = loadFields();
        return fields.find(f => f.id === fieldId) || null;
    },

    /**
     * Get all fields for a farm
     * @param {string} farmId - Farm ID
     * @returns {Array} Array of field objects
     */
    getFarmFields(farmId) {
        const fields = loadFields();
        return fields.filter(f => f.farmId === farmId);
    },

    // ─── Crop Tracking ─────────────────────────────────────────────────

    /**
     * Set current crop for a field
     * @param {string} fieldId - Field ID
     * @param {Object} crop - Crop data {name, variety, plantingDate, expectedHarvest}
     * @returns {Object|null} Updated field or null
     */
    setCurrentCrop(fieldId, crop = {}) {
        const fields = loadFields();
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return null;

        fields[index].crop = crop.name || '';
        fields[index].plantingDate = crop.plantingDate || new Date().toISOString();
        fields[index].expectedHarvest = crop.expectedHarvest || null;
        fields[index].status = 'active';

        // Add to crop history
        if (!fields[index].notes) fields[index].notes = [];
        fields[index].notes.push({
            type: 'crop_set',
            text: `ফসল নির্ধারিত: ${crop.name}`,
            date: new Date().toISOString()
        });

        saveFields(fields);
        return fields[index];
    },

    /**
     * Mark crop as harvested
     * @param {string} fieldId - Field ID
     * @returns {Object|null} Updated field or null
     */
    harvestCrop(fieldId) {
        const fields = loadFields();
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return null;

        const previousCrop = fields[index].crop;
        fields[index].status = 'harvested';
        fields[index].notes.push({
            type: 'harvest',
            text: `ফসল কাটা হয়েছে: ${previousCrop}`,
            date: new Date().toISOString()
        });

        saveFields(fields);
        return fields[index];
    },

    // ─── Fertilizer Schedule ───────────────────────────────────────────

    /**
     * Add a fertilizer schedule
     * @param {string} fieldId - Field ID
     * @param {Object} schedule - Schedule data
     * @returns {Object|null} Updated field or null
     */
    addFertilizerSchedule(fieldId, schedule = {}) {
        const fields = loadFields();
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return null;

        const entry = {
            id: generateScheduleId(),
            type: schedule.type || 'সাধারণ',
            fertilizer: schedule.fertilizer || '',
            quantity: schedule.quantity || '',
            date: schedule.date || new Date().toISOString(),
            time: schedule.time || '',
            notes: schedule.notes || '',
            completed: false,
            completedAt: null
        };

        fields[index].fertilizerSchedule.push(entry);
        saveFields(fields);
        return fields[index];
    },

    /**
     * Get fertilizer schedule for a field
     * @param {string} fieldId - Field ID
     * @returns {Array} Array of schedule entries
     */
    getFertilizerSchedule(fieldId) {
        const field = this.getField(fieldId);
        return field ? field.fertilizerSchedule : [];
    },

    /**
     * Mark a fertilizer task as completed
     * @param {string} fieldId - Field ID
     * @param {string} scheduleId - Schedule ID
     * @returns {Object|null} Updated field or null
     */
    completeFertilizerTask(fieldId, scheduleId) {
        const fields = loadFields();
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return null;

        const task = fields[index].fertilizerSchedule.find(s => s.id === scheduleId);
        if (!task) return null;

        task.completed = true;
        task.completedAt = new Date().toISOString();
        saveFields(fields);
        return fields[index];
    },

    // ─── Disease History ────────────────────────────────────────────────

    /**
     * Add a disease record
     * @param {string} fieldId - Field ID
     * @param {Object} record - Disease data
     * @returns {Object|null} Updated field or null
     */
    addDiseaseRecord(fieldId, record = {}) {
        const fields = loadFields();
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return null;

        const entry = {
            id: generateScheduleId(),
            name: record.name || 'অজানা রোগ',
            severity: record.severity || 'মাঝারি',
            dateDetected: record.dateDetected || new Date().toISOString(),
            treatment: record.treatment || '',
            resolved: record.resolved || false,
            resolvedDate: record.resolvedDate || null,
            notes: record.notes || ''
        };

        fields[index].diseaseHistory.push(entry);
        saveFields(fields);
        return fields[index];
    },

    /**
     * Get disease history for a field
     * @param {string} fieldId - Field ID
     * @returns {Array} Array of disease records
     */
    getDiseaseHistory(fieldId) {
        const field = this.getField(fieldId);
        return field ? field.diseaseHistory : [];
    },

    // ─── Water Schedule ────────────────────────────────────────────────

    /**
     * Add a water schedule
     * @param {string} fieldId - Field ID
     * @param {Object} schedule - Water schedule data
     * @returns {Object|null} Updated field or null
     */
    addWaterSchedule(fieldId, schedule = {}) {
        const fields = loadFields();
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return null;

        const entry = {
            id: generateScheduleId(),
            frequency: schedule.frequency || 'প্রতিদিন',
            amount: schedule.amount || '',
            time: schedule.time || 'সকাল',
            startDate: schedule.startDate || new Date().toISOString(),
            endDate: schedule.endDate || null,
            notes: schedule.notes || '',
            completed: false,
            completedAt: null
        };

        fields[index].waterSchedule.push(entry);
        saveFields(fields);
        return fields[index];
    },

    /**
     * Get water schedule for a field
     * @param {string} fieldId - Field ID
     * @returns {Array} Array of water schedules
     */
    getWaterSchedule(fieldId) {
        const field = this.getField(fieldId);
        return field ? field.waterSchedule : [];
    },

    /**
     * Mark a water task as completed
     * @param {string} fieldId - Field ID
     * @param {string} scheduleId - Schedule ID
     * @returns {Object|null} Updated field or null
     */
    completeWaterTask(fieldId, scheduleId) {
        const fields = loadFields();
        const index = fields.findIndex(f => f.id === fieldId);
        if (index === -1) return null;

        const task = fields[index].waterSchedule.find(s => s.id === scheduleId);
        if (!task) return null;

        task.completed = true;
        task.completedAt = new Date().toISOString();
        saveFields(fields);
        return fields[index];
    },

    // ─── Statistics ─────────────────────────────────────────────────────

    /**
     * Get statistics for a field
     * @param {string} fieldId - Field ID
     * @returns {Object} Field statistics
     */
    getFieldStats(fieldId) {
        const field = this.getField(fieldId);
        if (!field) return null;

        const pendingFertilizer = field.fertilizerSchedule.filter(s => !s.completed).length;
        const completedFertilizer = field.fertilizerSchedule.filter(s => s.completed).length;
        const pendingWater = field.waterSchedule.filter(s => !s.completed).length;
        const activeDiseases = field.diseaseHistory.filter(d => !d.resolved).length;

        return {
            area: field.area,
            status: field.status,
            crop: field.crop || 'কোনো ফসল নেই',
            pendingFertilizer,
            completedFertilizer,
            pendingWater,
            activeDiseases,
            totalDiseases: field.diseaseHistory.length,
            daysUntilHarvest: daysUntil(field.expectedHarvest)
        };
    },

    /**
     * Get upcoming tasks for a field
     * @param {string} fieldId - Field ID
     * @returns {Array} Array of upcoming tasks
     */
    getUpcomingTasks(fieldId) {
        const field = this.getField(fieldId);
        if (!field) return [];

        const tasks = [];
        const now = new Date();

        field.fertilizerSchedule.filter(s => !s.completed).forEach(s => {
            const taskDate = new Date(s.date);
            if (taskDate >= now) {
                tasks.push({
                    type: 'fertilizer',
                    id: s.id,
                    title: `সার: ${s.fertilizer}`,
                    date: s.date,
                    daysUntil: daysUntil(s.date)
                });
            }
        });

        field.waterSchedule.filter(s => !s.completed).forEach(s => {
            const endDate = s.endDate ? new Date(s.endDate) : null;
            if (!endDate || endDate >= now) {
                tasks.push({
                    type: 'water',
                    id: s.id,
                    title: `পানি: ${s.frequency}`,
                    date: s.startDate,
                    daysUntil: daysUntil(s.startDate)
                });
            }
        });

        return tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    // ─── UI Components ──────────────────────────────────────────────────

    /**
     * Create a field list UI
     * @param {string} containerId - Container element ID
     * @param {string} farmId - Farm ID
     * @returns {HTMLElement|null} Container element or null
     */
    createFieldList(containerId, farmId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const fields = this.getFarmFields(farmId);
        container.innerHTML = '';

        if (fields.length === 0) {
            container.innerHTML = `
                <div class="sf-empty-state">
                    <div class="sf-empty-icon">🌱</div>
                    <h3>কোনো মাঠ নেই</h3>
                    <p>এই ফার্মে প্রথম মাঠ তৈরি করুন</p>
                    <button class="sf-btn sf-btn-primary" id="sf-create-first-field">মাঠ তৈরি করুন</button>
                </div>`;
            return container;
        }

        container.innerHTML = `
            <div class="sf-field-list">
                <div class="sf-list-header">
                    <h2>মাঠ তালিকা</h2>
                    <button class="sf-btn sf-btn-primary" id="sf-add-field-btn">+ নতুন মাঠ</button>
                </div>
                <div class="sf-field-grid">
                    ${fields.map(field => `
                        <div class="sf-field-card ${field.status}" data-field-id="${field.id}">
                            <div class="sf-field-card-header">
                                <h3>${field.name}</h3>
                                <span class="sf-field-status sf-status-${field.status}">${field.status === 'active' ? 'সক্রিয়' : field.status === 'harvested' ? 'কাটা হয়েছে' : 'অব্যবহৃত'}</span>
                            </div>
                            <div class="sf-field-card-body">
                                <p>🌾 ${field.crop || 'ফসল নির্ধারিত নেই'}</p>
                                <p>📏 ${formatArea(field.area)}</p>
                                ${field.expectedHarvest ? `<p>📅 প্রত্যাশিত ফসল: ${formatDate(field.expectedHarvest)}</p>` : ''}
                            </div>
                            <div class="sf-field-card-footer">
                                <button class="sf-btn sf-btn-sm sf-btn-view" data-action="view" data-id="${field.id}">দেখুন</button>
                                <button class="sf-btn sf-btn-sm sf-btn-edit" data-action="edit" data-id="${field.id}">সম্পাদনা</button>
                                <button class="sf-btn sf-btn-sm sf-btn-delete" data-action="delete" data-id="${field.id}">মুছুন</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;

        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                if (action === 'view') {
                    this.createFieldDetail(containerId, id);
                } else if (action === 'edit') {
                    this.createFieldForm(containerId, farmId, id);
                } else if (action === 'delete') {
                    if (confirm('আপনি কি নিশ্চিত এই মাঠ মুছে ফেলতে চান?')) {
                        this.deleteField(id);
                        this.createFieldList(containerId, farmId);
                    }
                }
            });
        });

        const addBtn = container.querySelector('#sf-add-field-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.createFieldForm(containerId, farmId));
        }

        return container;
    },

    /**
     * Create a field form for create/edit
     * @param {string} containerId - Container element ID
     * @param {string} farmId - Farm ID
     * @param {string} editId - Field ID for editing
     * @returns {HTMLElement|null} Container element or null
     */
    createFieldForm(containerId, farmId, editId = null) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const field = editId ? this.getField(editId) : null;
        const isEdit = !!field;

        container.innerHTML = `
            <div class="sf-form-container">
                <div class="sf-form-header">
                    <h2>${isEdit ? 'মাঠ সম্পাদনা' : 'নতুন মাঠ তৈরি'}</h2>
                    <button class="sf-btn sf-btn-close" id="sf-cancel-field-form">&times;</button>
                </div>
                <form id="sf-field-form" class="sf-form">
                    <div class="sf-form-group">
                        <label for="sf-field-name">মাঠের নাম *</label>
                        <input type="text" id="sf-field-name" value="${field ? field.name : ''}" required>
                    </div>
                    <div class="sf-form-group">
                        <label for="sf-field-crop">ফসল</label>
                        <input type="text" id="sf-field-crop" value="${field ? field.crop : ''}">
                    </div>
                    <div class="sf-form-group">
                        <label for="sf-field-area">আয়তন (একর)</label>
                        <input type="number" id="sf-field-area" step="0.01" min="0" value="${field ? field.area : ''}">
                    </div>
                    <div class="sf-form-group">
                        <label for="sf-field-planting">রোপণের তারিখ</label>
                        <input type="date" id="sf-field-planting" value="${field && field.plantingDate ? field.plantingDate.split('T')[0] : ''}">
                    </div>
                    <div class="sf-form-group">
                        <label for="sf-field-harvest">প্রত্যাশিত ফসল</label>
                        <input type="date" id="sf-field-harvest" value="${field && field.expectedHarvest ? field.expectedHarvest.split('T')[0] : ''}">
                    </div>
                    <div class="sf-form-group">
                        <label for="sf-field-status">অবস্থা</label>
                        <select id="sf-field-status">
                            <option value="active" ${field && field.status === 'active' ? 'selected' : ''}>সক্রিয়</option>
                            <option value="fallow" ${field && field.status === 'fallow' ? 'selected' : ''}>অব্যবহৃত</option>
                            <option value="harvested" ${field && field.status === 'harvested' ? 'selected' : ''}>কাটা হয়েছে</option>
                        </select>
                    </div>
                    <div class="sf-form-actions">
                        <button type="button" class="sf-btn sf-btn-secondary" id="sf-cancel-field-btn">বাতিল</button>
                        <button type="submit" class="sf-btn sf-btn-primary">${isEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</button>
                    </div>
                </form>
            </div>`;

        const form = container.querySelector('#sf-field-form');
        const cancelBtns = container.querySelectorAll('#sf-cancel-field-form, #sf-cancel-field-btn');

        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => this.createFieldList(containerId, farmId));
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                name: container.querySelector('#sf-field-name').value.trim(),
                crop: container.querySelector('#sf-field-crop').value.trim(),
                area: parseFloat(container.querySelector('#sf-field-area').value) || 0,
                plantingDate: container.querySelector('#sf-field-planting').value || null,
                expectedHarvest: container.querySelector('#sf-field-harvest').value || null,
                status: container.querySelector('#sf-field-status').value
            };

            if (!formData.name) {
                alert('মাঠের নাম আবশ্যক');
                return;
            }

            if (isEdit) {
                this.updateField(editId, formData);
            } else {
                this.createField(farmId, formData);
            }
            this.createFieldList(containerId, farmId);
        });

        return container;
    },

    /**
     * Create a field detail view
     * @param {string} containerId - Container element ID
     * @param {string} fieldId - Field ID
     * @returns {HTMLElement|null} Container element or null
     */
    createFieldDetail(containerId, fieldId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const field = this.getField(fieldId);
        if (!field) {
            container.innerHTML = '<div class="sf-error">মাঠ পাওয়া যায়নি</div>';
            return container;
        }

        const stats = this.getFieldStats(fieldId);
        const upcomingTasks = this.getUpcomingTasks(fieldId);

        container.innerHTML = `
            <div class="sf-field-detail">
                <div class="sf-detail-header">
                    <button class="sf-btn sf-btn-back" id="sf-back-fields">← মাঠ তালিকায় ফিরুন</button>
                    <div class="sf-detail-title">
                        <h1>${field.name}</h1>
                        <span class="sf-field-status sf-status-${field.status}">${field.status === 'active' ? 'সক্রিয়' : field.status === 'harvested' ? 'কাটা হয়েছে' : 'অব্যবহৃত'}</span>
                    </div>
                    <div class="sf-detail-actions">
                        <button class="sf-btn sf-btn-edit" id="sf-edit-field">সম্পাদনা</button>
                        <button class="sf-btn sf-btn-export" id="sf-export-field">এক্সপোর্ট</button>
                    </div>
                </div>
                <div class="sf-detail-grid">
                    <div class="sf-detail-card">
                        <h3>🌾 ফসল</h3>
                        <p>${field.crop || 'নির্ধারিত নেই'}</p>
                    </div>
                    <div class="sf-detail-card">
                        <h3>📏 আয়তন</h3>
                        <p>${formatArea(field.area)}</p>
                    </div>
                    <div class="sf-detail-card">
                        <h3>📅 রোপণের তারিখ</h3>
                        <p>${formatDate(field.plantingDate) || 'নির্ধারিত নেই'}</p>
                    </div>
                    <div class="sf-detail-card">
                        <h3>📅 প্রত্যাশিত ফসল</h3>
                        <p>${formatDate(field.expectedHarvest) || 'নির্ধারিত নেই'}</p>
                        ${stats.daysUntilHarvest !== null ? `<span class="sf-days-info">${stats.daysUntilHarvest > 0 ? stats.daysUntilHarvest + ' দিন বাকি' : 'ফসলের সময় হয়েছে'}</span>` : ''}
                    </div>
                </div>
                <div class="sf-stats-section">
                    <h2>পরিসংখ্যান</h2>
                    <div class="sf-stats-grid">
                        <div class="sf-stat-item"><span class="sf-stat-number">${stats.pendingFertilizer}</span><span class="sf-stat-label">বাকি সার</span></div>
                        <div class="sf-stat-item"><span class="sf-stat-number">${stats.completedFertilizer}</span><span class="sf-stat-label">সম্পন্ন সার</span></div>
                        <div class="sf-stat-item"><span class="sf-stat-number">${stats.pendingWater}</span><span class="sf-stat-label">বাকি পানি</span></div>
                        <div class="sf-stat-item"><span class="sf-stat-number">${stats.activeDiseases}</span><span class="sf-stat-label">সক্রিয় রোগ</span></div>
                    </div>
                </div>
                ${upcomingTasks.length > 0 ? `
                <div class="sf-tasks-section">
                    <h2>আসন্ন কাজ</h2>
                    <div class="sf-tasks-list">
                        ${upcomingTasks.map(task => `
                            <div class="sf-task-item sf-task-${task.type}">
                                <span class="sf-task-type">${task.type === 'fertilizer' ? '🧪' : '💧'}</span>
                                <span class="sf-task-title">${task.title}</span>
                                <span class="sf-task-date">${task.daysUntil !== null ? (task.daysUntil + ' দিন') : 'নির্ধারিত নেই'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
                <div class="sf-schedule-section">
                    <div class="sf-section-header">
                        <h2>🧪 সার সূচি</h2>
                        <button class="sf-btn sf-btn-sm sf-btn-primary" id="sf-add-fertilizer">+ যোগ করুন</button>
                    </div>
                    <div id="sf-fertilizer-list" class="sf-schedule-list">
                        ${field.fertilizerSchedule.length === 0 ? '<p class="sf-no-data">কোনো সূচি নেই</p>' :
                            field.fertilizerSchedule.map(s => `
                                <div class="sf-schedule-item ${s.completed ? 'completed' : ''}">
                                    <div class="sf-schedule-info">
                                        <strong>${s.fertilizer || s.type}</strong>
                                        <span>${formatDate(s.date)}</span>
                                        ${s.quantity ? `<span>পরিমাণ: ${s.quantity}</span>` : ''}
                                    </div>
                                    ${!s.completed ? `<button class="sf-btn sf-btn-sm sf-btn-success sf-complete-task" data-type="fertilizer" data-id="${s.id}">সম্পন্ন</button>` : '<span class="sf-completed-badge">✓</span>'}
                                </div>
                            `).join('')}
                    </div>
                </div>
                <div class="sf-schedule-section">
                    <div class="sf-section-header">
                        <h2>💧 পানির সূচি</h2>
                        <button class="sf-btn sf-btn-sm sf-btn-primary" id="sf-add-water">+ যোগ করুন</button>
                    </div>
                    <div id="sf-water-list" class="sf-schedule-list">
                        ${field.waterSchedule.length === 0 ? '<p class="sf-no-data">কোনো সূচি নেই</p>' :
                            field.waterSchedule.map(s => `
                                <div class="sf-schedule-item ${s.completed ? 'completed' : ''}">
                                    <div class="sf-schedule-info">
                                        <strong>${s.frequency}</strong>
                                        <span>${s.time}</span>
                                        ${s.amount ? `<span>পরিমাণ: ${s.amount}</span>` : ''}
                                    </div>
                                    ${!s.completed ? `<button class="sf-btn sf-btn-sm sf-btn-success sf-complete-task" data-type="water" data-id="${s.id}">সম্পন্ন</button>` : '<span class="sf-completed-badge">✓</span>'}
                                </div>
                            `).join('')}
                    </div>
                </div>
                <div class="sf-disease-section">
                    <div class="sf-section-header">
                        <h2>🦠 রোগের ইতিহাস</h2>
                        <button class="sf-btn sf-btn-sm sf-btn-primary" id="sf-add-disease">+ যোগ করুন</button>
                    </div>
                    <div id="sf-disease-list" class="sf-disease-list">
                        ${field.diseaseHistory.length === 0 ? '<p class="sf-no-data">কোনো রোগ নেই</p>' :
                            field.diseaseHistory.map(d => `
                                <div class="sf-disease-item ${d.resolved ? 'resolved' : ''}">
                                    <div class="sf-disease-info">
                                        <strong>${d.name}</strong>
                                        <span class="sf-severity sf-severity-${d.severity}">${d.severity}</span>
                                        <span>${formatDate(d.dateDetected)}</span>
                                    </div>
                                    ${d.treatment ? `<p class="sf-treatment">চিকিৎসা: ${d.treatment}</p>` : ''}
                                </div>
                            `).join('')}
                    </div>
                </div>
            </div>`;

        // Event listeners
        container.querySelector('#sf-back-fields').addEventListener('click', () => {
            const farmId = field.farmId;
            this.createFieldList(containerId, farmId);
        });

        container.querySelector('#sf-edit-field').addEventListener('click', () => {
            this.createFieldForm(containerId, field.farmId, fieldId);
        });

        container.querySelector('#sf-export-field').addEventListener('click', () => {
            const data = this.exportFieldData(fieldId);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${field.name}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });

        container.querySelector('#sf-add-fertilizer').addEventListener('click', () => {
            const fert = prompt('সারের ধরন:');
            if (fert) {
                const qty = prompt('পরিমাণ:');
                const date = prompt('তারিখ (YYYY-MM-DD):');
                this.addFertilizerSchedule(fieldId, { fertilizer: fert, quantity: qty, date });
                this.createFieldDetail(containerId, fieldId);
            }
        });

        container.querySelector('#sf-add-water').addEventListener('click', () => {
            const freq = prompt('পানির ঘনত্ব (যেমন: প্রতিদিন, প্রতি ২ দিন):');
            if (freq) {
                const amt = prompt('পানির পরিমাণ:');
                const time = prompt('সময় (সকাল/বিকাল/সন্ধ্যা):');
                this.addWaterSchedule(fieldId, { frequency: freq, amount: amt, time });
                this.createFieldDetail(containerId, fieldId);
            }
        });

        container.querySelector('#sf-add-disease').addEventListener('click', () => {
            const name = prompt('রোগের নাম:');
            if (name) {
                const severity = prompt('তীব্রতা (কম/মাঝারি/বেশি):');
                const treatment = prompt('চিকিৎসা:');
                this.addDiseaseRecord(fieldId, { name, severity, treatment });
                this.createFieldDetail(containerId, fieldId);
            }
        });

        container.querySelectorAll('.sf-complete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const id = e.target.dataset.id;
                if (type === 'fertilizer') {
                    this.completeFertilizerTask(fieldId, id);
                } else if (type === 'water') {
                    this.completeWaterTask(fieldId, id);
                }
                this.createFieldDetail(containerId, fieldId);
            });
        });

        return container;
    },

    /**
     * Create a schedule calendar view
     * @param {string} containerId - Container element ID
     * @param {string} fieldId - Field ID
     * @returns {HTMLElement|null} Container element or null
     */
    createScheduleCalendar(containerId, fieldId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const field = this.getField(fieldId);
        if (!field) return null;

        const allTasks = [
            ...field.fertilizerSchedule.map(s => ({ ...s, taskType: 'fertilizer' })),
            ...field.waterSchedule.map(s => ({ ...s, taskType: 'water' }))
        ].sort((a, b) => new Date(a.date || a.startDate) - new Date(b.date || b.startDate));

        container.innerHTML = `
            <div class="sf-calendar-container">
                <h2>📅 সূচির ক্যালেন্ডার</h2>
                <div class="sf-calendar-list">
                    ${allTasks.length === 0 ? '<p class="sf-no-data">কোনো সূচি নেই</p>' :
                        allTasks.map(task => `
                            <div class="sf-calendar-item ${task.completed ? 'completed' : ''}">
                                <div class="sf-cal-icon">${task.taskType === 'fertilizer' ? '🧪' : '💧'}</div>
                                <div class="sf-cal-info">
                                    <strong>${task.fertilizer || task.frequency || 'সূচি'}</strong>
                                    <span>${formatDate(task.date || task.startDate)}</span>
                                </div>
                                <span class="sf-cal-status">${task.completed ? '✓ সম্পন্ন' : 'বাকি'}</span>
                            </div>
                        `).join('')}
                </div>
            </div>`;

        return container;
    },

    // ─── Export ──────────────────────────────────────────────────────────

    /**
     * Export field data as JSON
     * @param {string} fieldId - Field ID
     * @returns {Object} Complete field data
     */
    exportFieldData(fieldId) {
        const field = this.getField(fieldId);
        if (!field) return null;

        return {
            exportDate: new Date().toISOString(),
            field: field,
            statistics: this.getFieldStats(fieldId),
            upcomingTasks: this.getUpcomingTasks(fieldId)
        };
    }
};

export default SFField;
