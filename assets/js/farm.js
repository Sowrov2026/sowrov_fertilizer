/**
 * SFFarm - V20 Digital Farm Management Module
 * ES Module for farm CRUD with localStorage persistence
 */

const STORAGE_KEY = 'sf_farms';

const SOIL_TYPES = ['দোআশ', 'দোমাটি', 'পলি', 'বালুকামাটি', 'চিকনকামাটি', 'কালোপলি'];
const WATER_SOURCES = ['নদী', 'কূপ', 'নলকূপ', 'বৃষ্টি', 'পুকুর', 'খাল'];

function generateId() {
    return 'farm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function generateImageId() {
    return 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function loadFarms() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('ফার্ম ডেটা লোড করতে সমস্যা:', e);
        return [];
    }
}

function saveFarms(farms) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(farms));
        return true;
    } catch (e) {
        console.error('ফার্ম ডেটা সংরক্ষণ করতে সমস্যা:', e);
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

export const SFFarm = {
    /**
     * Initialize the farm module
     */
    init() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        }
    },

    // ─── CRUD Operations ───────────────────────────────────────────────

    /**
     * Create a new farm
     * @param {Object} data - Farm data
     * @returns {Object} Created farm object
     */
    createFarm(data = {}) {
        const farms = loadFarms();
        const farm = {
            id: generateId(),
            name: data.name || 'নতুন ফার্ম',
            location: data.location || '',
            area: parseFloat(data.area) || 0,
            soilType: data.soilType || SOIL_TYPES[0],
            waterSource: data.waterSource || WATER_SOURCES[0],
            cropHistory: [],
            currentCrops: [],
            images: [],
            notes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        farms.push(farm);
        saveFarms(farms);
        return farm;
    },

    /**
     * Update an existing farm
     * @param {string} id - Farm ID
     * @param {Object} data - Updated data
     * @returns {Object|null} Updated farm or null
     */
    updateFarm(id, data = {}) {
        const farms = loadFarms();
        const index = farms.findIndex(f => f.id === id);
        if (index === -1) return null;

        farms[index] = {
            ...farms[index],
            ...data,
            id: farms[index].id,
            createdAt: farms[index].createdAt,
            updatedAt: new Date().toISOString()
        };
        saveFarms(farms);
        return farms[index];
    },

    /**
     * Delete a farm
     * @param {string} id - Farm ID
     * @returns {boolean} Success status
     */
    deleteFarm(id) {
        const farms = loadFarms();
        const filtered = farms.filter(f => f.id !== id);
        if (filtered.length === farms.length) return false;
        saveFarms(filtered);

        // Clean up associated fields
        try {
            const fieldsData = localStorage.getItem('sf_fields');
            if (fieldsData) {
                const fields = JSON.parse(fieldsData);
                const remaining = fields.filter(f => f.farmId !== id);
                localStorage.setItem('sf_fields', JSON.stringify(remaining));
            }
        } catch (e) {
            console.error('মাঠ ডেটা পরিষ্কার করতে সমস্যা:', e);
        }
        return true;
    },

    /**
     * Get a single farm by ID
     * @param {string} id - Farm ID
     * @returns {Object|null} Farm object or null
     */
    getFarm(id) {
        const farms = loadFarms();
        return farms.find(f => f.id === id) || null;
    },

    /**
     * Get all farms
     * @returns {Array} Array of farm objects
     */
    getAllFarms() {
        return loadFarms();
    },

    // ─── Field Management (delegates to SFField) ────────────────────────

    /**
     * Get all fields for a farm
     * @param {string} farmId - Farm ID
     * @returns {Array} Array of field objects
     */
    getFarmFields(farmId) {
        try {
            const fieldsData = localStorage.getItem('sf_fields');
            if (!fieldsData) return [];
            const fields = JSON.parse(fieldsData);
            return fields.filter(f => f.farmId === farmId);
        } catch (e) {
            console.error('মাঠ ডেটা লোড করতে সমস্যা:', e);
            return [];
        }
    },

    // ─── Crop History ───────────────────────────────────────────────────

    /**
     * Add crop to farm history
     * @param {string} farmId - Farm ID
     * @param {Object} crop - Crop data {name, year, yield, notes}
     * @returns {Object|null} Updated farm or null
     */
    addCropHistory(farmId, crop = {}) {
        const farms = loadFarms();
        const index = farms.findIndex(f => f.id === farmId);
        if (index === -1) return null;

        const cropEntry = {
            id: 'crp_' + Date.now(),
            name: crop.name || 'অজানা ফসল',
            year: crop.year || new Date().getFullYear(),
            yield: crop.yield || '',
            area: crop.area || 0,
            notes: crop.notes || '',
            addedAt: new Date().toISOString()
        };

        farms[index].cropHistory.push(cropEntry);
        farms[index].updatedAt = new Date().toISOString();
        saveFarms(farms);
        return farms[index];
    },

    /**
     * Get crop history for a farm
     * @param {string} farmId - Farm ID
     * @returns {Array} Array of crop history entries
     */
    getCropHistory(farmId) {
        const farm = this.getFarm(farmId);
        return farm ? farm.cropHistory : [];
    },

    // ─── Image Management ───────────────────────────────────────────────

    /**
     * Add an image to a farm
     * @param {string} farmId - Farm ID
     * @param {Object} imageData - Image data {url, caption, type}
     * @returns {Object|null} Updated farm or null
     */
    addFarmImage(farmId, imageData = {}) {
        const farms = loadFarms();
        const index = farms.findIndex(f => f.id === farmId);
        if (index === -1) return null;

        const image = {
            id: generateImageId(),
            url: imageData.url || '',
            caption: imageData.caption || '',
            type: imageData.type || 'general',
            addedAt: new Date().toISOString()
        };

        farms[index].images.push(image);
        farms[index].updatedAt = new Date().toISOString();
        saveFarms(farms);
        return farms[index];
    },

    /**
     * Remove an image from a farm
     * @param {string} farmId - Farm ID
     * @param {string} imageId - Image ID
     * @returns {Object|null} Updated farm or null
     */
    removeFarmImage(farmId, imageId) {
        const farms = loadFarms();
        const index = farms.findIndex(f => f.id === farmId);
        if (index === -1) return null;

        farms[index].images = farms[index].images.filter(img => img.id !== imageId);
        farms[index].updatedAt = new Date().toISOString();
        saveFarms(farms);
        return farms[index];
    },

    // ─── Statistics ─────────────────────────────────────────────────────

    /**
     * Get statistics for a farm
     * @param {string} farmId - Farm ID
     * @returns {Object} Farm statistics
     */
    getFarmStats(farmId) {
        const farm = this.getFarm(farmId);
        if (!farm) return null;

        const fields = this.getFarmFields(farmId);
        const activeFields = fields.filter(f => f.status === 'active');
        const harvestedFields = fields.filter(f => f.status === 'harvested');

        return {
            totalArea: farm.area,
            fieldCount: fields.length,
            activeFieldCount: activeFields.length,
            harvestedFieldCount: harvestedFields.length,
            cropHistoryCount: farm.cropHistory.length,
            imageCount: farm.images.length,
            notesCount: farm.notes.length,
            lastUpdated: farm.updatedAt
        };
    },

    /**
     * Get total area across all farms
     * @returns {number} Total area in acres
     */
    getTotalArea() {
        const farms = loadFarms();
        return farms.reduce((total, farm) => total + (farm.area || 0), 0);
    },

    // ─── UI Components ──────────────────────────────────────────────────

    /**
     * Create a farm list UI in a container
     * @param {string} containerId - Container element ID
     * @returns {HTMLElement|null} Container element or null
     */
    createFarmList(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const farms = this.getAllFarms();
        container.innerHTML = '';

        if (farms.length === 0) {
            container.innerHTML = `
                <div class="sf-empty-state">
                    <div class="sf-empty-icon">🌾</div>
                    <h3>কোনো ফার্ম নেই</h3>
                    <p>আপনার প্রথম ফার্ম তৈরি করুন</p>
                    <button class="sf-btn sf-btn-primary" id="sf-create-first-farm">ফার্ম তৈরি করুন</button>
                </div>`;
            return container;
        }

        const listHTML = `
            <div class="sf-farm-list-header">
                <h2>ফার্ম তালিকা</h2>
                <button class="sf-btn sf-btn-primary" id="sf-add-farm-btn">+ নতুন ফার্ম</button>
            </div>
            <div class="sf-farm-grid">
                ${farms.map(farm => `
                    <div class="sf-farm-card" data-farm-id="${farm.id}">
                        <div class="sf-farm-card-header">
                            <h3>${farm.name}</h3>
                            <span class="sf-farm-area">${formatArea(farm.area)}</span>
                        </div>
                        <div class="sf-farm-card-body">
                            <p class="sf-farm-location">📍 ${farm.location || 'লোকেশন নেই'}</p>
                            <p class="sf-farm-soil">🌿 ${farm.soilType}</p>
                            <p class="sf-farm-water">💧 ${farm.waterSource}</p>
                        </div>
                        <div class="sf-farm-card-footer">
                            <button class="sf-btn sf-btn-sm sf-btn-view" data-action="view" data-id="${farm.id}">দেখুন</button>
                            <button class="sf-btn sf-btn-sm sf-btn-edit" data-action="edit" data-id="${farm.id}">সম্পাদনা</button>
                            <button class="sf-btn sf-btn-sm sf-btn-delete" data-action="delete" data-id="${farm.id}">মুছুন</button>
                        </div>
                    </div>
                `).join('')}
            </div>`;

        container.innerHTML = listHTML;

        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                if (action === 'view') {
                    container.dispatchEvent(new CustomEvent('farm:view', { detail: { id } }));
                } else if (action === 'edit') {
                    this.createFarmForm(containerId, id);
                } else if (action === 'delete') {
                    if (confirm('আপনি কি নিশ্চিত এই ফার্ম মুছে ফেলতে চান?')) {
                        this.deleteFarm(id);
                        this.createFarmList(containerId);
                    }
                }
            });
        });

        const addBtn = container.querySelector('#sf-add-farm-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.createFarmForm(containerId));
        }

        return container;
    },

    /**
     * Create a farm form for create/edit
     * @param {string} containerId - Container element ID
     * @param {string} editId - Farm ID for editing (null for create)
     * @returns {HTMLElement|null} Container element or null
     */
    createFarmForm(containerId, editId = null) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const farm = editId ? this.getFarm(editId) : null;
        const isEdit = !!farm;

        container.innerHTML = `
            <div class="sf-form-container">
                <div class="sf-form-header">
                    <h2>${isEdit ? 'ফার্ম সম্পাদনা' : 'নতুন ফার্ম তৈরি'}</h2>
                    <button class="sf-btn sf-btn-close" id="sf-cancel-form">&times;</button>
                </div>
                <form id="sf-farm-form" class="sf-form">
                    <div class="sf-form-group">
                        <label for="sf-farm-name">ফার্মের নাম *</label>
                        <input type="text" id="sf-farm-name" value="${farm ? farm.name : ''}" required>
                    </div>
                    <div class="sf-form-group">
                        <label for="sf-farm-location">লোকেশন</label>
                        <input type="text" id="sf-farm-location" value="${farm ? farm.location : ''}">
                    </div>
                    <div class="sf-form-group">
                        <label for="sf-farm-area">আয়তন (একর)</label>
                        <input type="number" id="sf-farm-area" step="0.01" min="0" value="${farm ? farm.area : ''}">
                    </div>
                    <div class="sf-form-group">
                        <label for="sf-farm-soil">মাটির ধরন</label>
                        <select id="sf-farm-soil">
                            ${SOIL_TYPES.map(s => `<option value="${s}" ${farm && farm.soilType === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sf-form-group">
                        <label for="sf-farm-water">পানির উৎস</label>
                        <select id="sf-farm-water">
                            ${WATER_SOURCES.map(w => `<option value="${w}" ${farm && farm.waterSource === w ? 'selected' : ''}>${w}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sf-form-actions">
                        <button type="button" class="sf-btn sf-btn-secondary" id="sf-cancel-form-btn">বাতিল</button>
                        <button type="submit" class="sf-btn sf-btn-primary">${isEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}</button>
                    </div>
                </form>
            </div>`;

        const form = container.querySelector('#sf-farm-form');
        const cancelBtns = container.querySelectorAll('#sf-cancel-form, #sf-cancel-form-btn');

        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => this.createFarmList(containerId));
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                name: container.querySelector('#sf-farm-name').value.trim(),
                location: container.querySelector('#sf-farm-location').value.trim(),
                area: parseFloat(container.querySelector('#sf-farm-area').value) || 0,
                soilType: container.querySelector('#sf-farm-soil').value,
                waterSource: container.querySelector('#sf-farm-water').value
            };

            if (!formData.name) {
                alert('ফার্মের নাম আবশ্যক');
                return;
            }

            if (isEdit) {
                this.updateFarm(editId, formData);
            } else {
                this.createFarm(formData);
            }
            this.createFarmList(containerId);
        });

        return container;
    },

    /**
     * Create a farm detail view
     * @param {string} containerId - Container element ID
     * @param {string} farmId - Farm ID
     * @returns {HTMLElement|null} Container element or null
     */
    createFarmDetail(containerId, farmId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const farm = this.getFarm(farmId);
        if (!farm) {
            container.innerHTML = '<div class="sf-error">ফার্ম পাওয়া যায়নি</div>';
            return container;
        }

        const fields = this.getFarmFields(farmId);
        const stats = this.getFarmStats(farmId);

        container.innerHTML = `
            <div class="sf-farm-detail">
                <div class="sf-detail-header">
                    <button class="sf-btn sf-btn-back" id="sf-back-list">← তালিকায় ফিরুন</button>
                    <div class="sf-detail-title">
                        <h1>${farm.name}</h1>
                        <span class="sf-detail-date">তৈরি: ${formatDate(farm.createdAt)}</span>
                    </div>
                    <div class="sf-detail-actions">
                        <button class="sf-btn sf-btn-edit" id="sf-edit-farm">সম্পাদনা</button>
                        <button class="sf-btn sf-btn-export" id="sf-export-farm">এক্সপোর্ট</button>
                    </div>
                </div>
                <div class="sf-detail-grid">
                    <div class="sf-detail-card">
                        <h3>📍 লোকেশন</h3>
                        <p>${farm.location || 'নির্ধারিত নেই'}</p>
                    </div>
                    <div class="sf-detail-card">
                        <h3>🌿 মাটির ধরন</h3>
                        <p>${farm.soilType}</p>
                    </div>
                    <div class="sf-detail-card">
                        <h3>💧 পানির উৎস</h3>
                        <p>${farm.waterSource}</p>
                    </div>
                    <div class="sf-detail-card">
                        <h3>📏 আয়তন</h3>
                        <p>${formatArea(farm.area)}</p>
                    </div>
                </div>
                <div class="sf-stats-section">
                    <h2>পরিসংখ্যান</h2>
                    <div class="sf-stats-grid">
                        <div class="sf-stat-item"><span class="sf-stat-number">${stats.fieldCount}</span><span class="sf-stat-label">মোট মাঠ</span></div>
                        <div class="sf-stat-item"><span class="sf-stat-number">${stats.activeFieldCount}</span><span class="sf-stat-label">সক্রিয় মাঠ</span></div>
                        <div class="sf-stat-item"><span class="sf-stat-number">${stats.cropHistoryCount}</span><span class="sf-stat-label">ফসলের ইতিহাস</span></div>
                        <div class="sf-stat-item"><span class="sf-stat-number">${stats.imageCount}</span><span class="sf-stat-label">ছবি</span></div>
                    </div>
                </div>
                <div class="sf-fields-section">
                    <div class="sf-section-header">
                        <h2>মাঠ সমূহ</h2>
                        <button class="sf-btn sf-btn-primary" id="sf-add-field">+ নতুন মাঠ</button>
                    </div>
                    <div id="sf-fields-container" class="sf-fields-list"></div>
                </div>
                <div class="sf-history-section">
                    <h2>ফসলের ইতিহাস</h2>
                    ${farm.cropHistory.length === 0 ? '<p class="sf-no-data">কোনো ইতিহাস নেই</p>' :
                        `<div class="sf-history-list">
                            ${farm.cropHistory.map(c => `
                                <div class="sf-history-item">
                                    <strong>${c.name}</strong> - ${c.year}
                                    ${c.yield ? `<span>ফলন: ${c.yield}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>`}
                    <button class="sf-btn sf-btn-sm sf-btn-secondary" id="sf-add-history">+ ফসল যোগ করুন</button>
                </div>
            </div>`;

        container.querySelector('#sf-back-list').addEventListener('click', () => this.createFarmList(containerId));
        container.querySelector('#sf-edit-farm').addEventListener('click', () => this.createFarmForm(containerId, farmId));
        container.querySelector('#sf-export-farm').addEventListener('click', () => {
            const data = this.exportFarmData(farmId);
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${farm.name}_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        });

        const addFieldBtn = container.querySelector('#sf-add-field');
        if (addFieldBtn) {
            addFieldBtn.addEventListener('click', () => {
                container.dispatchEvent(new CustomEvent('field:create', { detail: { farmId } }));
            });
        }

        container.querySelector('#sf-add-history').addEventListener('click', () => {
            const name = prompt('ফসলের নাম:');
            if (name) {
                const year = prompt('বছর:', new Date().getFullYear());
                const yieldVal = prompt('ফলন:');
                this.addCropHistory(farmId, { name, year: parseInt(year), yield: yieldVal });
                this.createFarmDetail(containerId, farmId);
            }
        });

        return container;
    },

    /**
     * Create farm statistics display
     * @param {string} containerId - Container element ID
     * @returns {HTMLElement|null} Container element or null
     */
    createFarmStats(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const farms = this.getAllFarms();
        const totalArea = this.getTotalArea();
        const totalFields = farms.reduce((sum, f) => sum + this.getFarmFields(f.id).length, 0);

        container.innerHTML = `
            <div class="sf-stats-overview">
                <h2>সামগ্রিক পরিসংখ্যান</h2>
                <div class="sf-stats-grid sf-stats-main">
                    <div class="sf-stat-card">
                        <span class="sf-stat-number">${farms.length}</span>
                        <span class="sf-stat-label">মোট ফার্ম</span>
                    </div>
                    <div class="sf-stat-card">
                        <span class="sf-stat-number">${formatArea(totalArea)}</span>
                        <span class="sf-stat-label">মোট আয়তন</span>
                    </div>
                    <div class="sf-stat-card">
                        <span class="sf-stat-number">${totalFields}</span>
                        <span class="sf-stat-label">মোট মাঠ</span>
                    </div>
                </div>
                <div class="sf-farm-summary-list">
                    ${farms.map(farm => {
                        const stats = this.getFarmStats(farm.id);
                        return `
                            <div class="sf-summary-item">
                                <strong>${farm.name}</strong>
                                <span>${formatArea(farm.area)} | ${stats.activeFieldCount} সক্রিয় মাঠ</span>
                            </div>`;
                    }).join('')}
                </div>
            </div>`;

        return container;
    },

    // ─── Export ──────────────────────────────────────────────────────────

    /**
     * Export farm data as JSON
     * @param {string} farmId - Farm ID
     * @returns {Object} Farm data with fields
     */
    exportFarmData(farmId) {
        const farm = this.getFarm(farmId);
        if (!farm) return null;

        const fields = this.getFarmFields(farmId);
        return {
            exportDate: new Date().toISOString(),
            farm: farm,
            fields: fields,
            statistics: this.getFarmStats(farmId)
        };
    }
};

export default SFFarm;
