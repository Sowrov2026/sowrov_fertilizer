/**
 * SF AI V17 — Auto Backup Module
 * LocalStorage backup/restore/export/import
 * ES module for Sowrov Fertilizer
 */

const BACKUP_KEY = 'sf_backups';
const MAX_BACKUPS = 10;
const AUTO_BACKUP_DAYS = 7;
const LAST_AUTO_BACKUP_KEY = 'sf_last_auto_backup';

const STORAGE_KEYS_TO_BACKUP = [
    'sf_ai_memory',
    'sf_reminders',
    'sf_ai_analytics',
    'sf_rate_limits',
    'sf_chat_history',
    'sf_user_favorites',
    'sf_crop_calendar',
    'sf_search_history',
    'sf_calculations',
    'sf_product_views',
    'sf_voice_history',
    'sf_self_learning',
    'sf_ai_v17_memory',
    'sf_ai_v17_context',
    'sf_ai_v17_chat',
];

function generateId() {
    return 'bkp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

function loadBackups() {
    try {
        const raw = localStorage.getItem(BACKUP_KEY);
        const backups = raw ? JSON.parse(raw) : [];
        return Array.isArray(backups) ? backups : [];
    } catch {
        return [];
    }
}

function saveBackups(backups) {
    try {
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
    } catch (e) {
        console.error('ব্যাকআপ সংরক্ষণে সমস্যা:', e);
    }
}

function collectAllData() {
    const data = {};
    for (const key of STORAGE_KEYS_TO_BACKUP) {
        try {
            const val = localStorage.getItem(key);
            if (val !== null) {
                data[key] = JSON.parse(val);
            }
        } catch {
            const val = localStorage.getItem(key);
            if (val !== null) {
                data[key] = val;
            }
        }
    }
    return data;
}

function collectUserData() {
    const data = {};
    const userKeys = [
        'sf_ai_memory',
        'sf_ai_v17_memory',
        'sf_ai_v17_context',
        'sf_calculations',
        'sf_product_views',
        'sf_user_favorites',
    ];
    for (const key of userKeys) {
        try {
            const val = localStorage.getItem(key);
            if (val !== null) {
                data[key] = JSON.parse(val);
            }
        } catch {
            const val = localStorage.getItem(key);
            if (val !== null) {
                data[key] = val;
            }
        }
    }
    return data;
}

function collectChatHistory() {
    const data = {};
    const chatKeys = [
        'sf_chat_history',
        'sf_ai_v17_chat',
        'sf_search_history',
        'sf_voice_history',
    ];
    for (const key of chatKeys) {
        try {
            const val = localStorage.getItem(key);
            if (val !== null) {
                data[key] = JSON.parse(val);
            }
        } catch {
            const val = localStorage.getItem(key);
            if (val !== null) {
                data[key] = val;
            }
        }
    }
    return data;
}

function calculateSize(obj) {
    const str = JSON.stringify(obj);
    const bytes = new Blob([str]).size;
    return Math.round((bytes / 1024) * 100) / 100;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (
                source[key] &&
                typeof source[key] === 'object' &&
                !Array.isArray(source[key]) &&
                target[key] &&
                typeof target[key] === 'object' &&
                !Array.isArray(target[key])
            ) {
                result[key] = deepMerge(target[key], source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    return result;
}

export const SFBackup = {
    init() {
        this.autoBackup();
        return this;
    },

    async createBackup() {
        const data = collectAllData();
        const size = calculateSize(data);
        const backup = {
            id: generateId(),
            date: new Date().toISOString(),
            size: size,
            data: data,
            type: 'full',
        };

        const backups = loadBackups();
        backups.push(backup);

        if (backups.length > MAX_BACKUPS) {
            backups.splice(0, backups.length - MAX_BACKUPS);
        }

        saveBackups(backups);
        return backup;
    },

    async restoreBackup(json) {
        try {
            const backupData = typeof json === 'string' ? JSON.parse(json) : json;
            const data = backupData.data || backupData;

            let restored = 0;
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    try {
                        const value = typeof data[key] === 'object'
                            ? JSON.stringify(data[key])
                            : data[key];
                        localStorage.setItem(key, value);
                        restored++;
                    } catch (e) {
                        console.error(`কী ${key} পুনরুদ্ধার করতে ব্যর্থ:`, e);
                    }
                }
            }

            return { success: true, restored: restored };
        } catch (e) {
            console.error('ব্যাকআপ পুনরুদ্ধারে সমস্যা:', e);
            return { success: false, error: e.message };
        }
    },

    exportUserData() {
        const data = collectUserData();
        return JSON.stringify(data, null, 2);
    },

    exportChatHistory() {
        const data = collectChatHistory();
        return JSON.stringify(data, null, 2);
    },

    importData(json) {
        try {
            const imported = typeof json === 'string' ? JSON.parse(json) : json;

            if (!imported || typeof imported !== 'object') {
                return { success: false, error: 'অবৈধ ডেটা ফরম্যাট' };
            }

            let merged = 0;
            let added = 0;

            for (const key in imported) {
                if (imported.hasOwnProperty(key)) {
                    try {
                        const existing = localStorage.getItem(key);
                        if (existing) {
                            const existingData = JSON.parse(existing);
                            const importedData = typeof imported[key] === 'string'
                                ? JSON.parse(imported[key])
                                : imported[key];

                            if (
                                typeof existingData === 'object' &&
                                typeof importedData === 'object' &&
                                !Array.isArray(existingData) &&
                                !Array.isArray(importedData)
                            ) {
                                const mergedData = deepMerge(existingData, importedData);
                                localStorage.setItem(key, JSON.stringify(mergedData));
                                merged++;
                            } else {
                                localStorage.setItem(key, JSON.stringify(importedData));
                                added++;
                            }
                        } else {
                            const value = typeof imported[key] === 'object'
                                ? JSON.stringify(imported[key])
                                : imported[key];
                            localStorage.setItem(key, value);
                            added++;
                        }
                    } catch (e) {
                        console.error(`কী ${key} ইমপোর্ট করতে ব্যর্থ:`, e);
                    }
                }
            }

            return { success: true, merged: merged, added: added };
        } catch (e) {
            console.error('ডেটা ইমপোর্টে সমস্যা:', e);
            return { success: false, error: e.message };
        }
    },

    getBackupSize() {
        const data = collectAllData();
        return calculateSize(data);
    },

    listBackups() {
        return loadBackups().map(b => ({
            id: b.id,
            date: b.date,
            size: b.size,
            type: b.type || 'full',
            formattedDate: formatDate(b.date),
        }));
    },

    autoBackup() {
        try {
            const lastAutoBackup = localStorage.getItem(LAST_AUTO_BACKUP_KEY);
            const now = new Date();

            if (lastAutoBackup) {
                const lastDate = new Date(lastAutoBackup);
                const diffDays = (now - lastDate) / (1000 * 60 * 60 * 24);
                if (diffDays < AUTO_BACKUP_DAYS) {
                    return null;
                }
            }

            const backup = this.createBackup();
            localStorage.setItem(LAST_AUTO_BACKUP_KEY, now.toISOString());
            return backup;
        } catch {
            return null;
        }
    },

    createBackupUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const backups = this.listBackups();
        const currentSize = this.getBackupSize();

        container.innerHTML = `
            <style>
                .sf-backup-panel {
                    font-family: 'Hind Siliguri', 'Kalpurush', sans-serif;
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 24px;
                    background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e9 100%);
                    border-radius: 16px;
                    border: 2px solid #2d7a2d;
                }
                .sf-backup-title {
                    text-align: center;
                    font-size: 1.5em;
                    color: #1a5c1a;
                    margin-bottom: 24px;
                    font-weight: bold;
                }
                .sf-backup-stats {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .sf-backup-stat {
                    flex: 1;
                    min-width: 120px;
                    text-align: center;
                    padding: 16px;
                    background: #fff;
                    border-radius: 12px;
                    border: 1px solid #ddd;
                }
                .sf-backup-stat .stat-num {
                    font-size: 1.4em;
                    font-weight: bold;
                    color: #2d7a2d;
                }
                .sf-backup-stat .stat-label {
                    font-size: 0.85em;
                    color: #666;
                    margin-top: 4px;
                }
                .sf-backup-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .sf-backup-btn {
                    padding: 14px;
                    border: none;
                    border-radius: 10px;
                    font-size: 1.05em;
                    font-weight: bold;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .sf-backup-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                .sf-backup-btn-primary { background: #2d7a2d; color: #fff; }
                .sf-backup-btn-primary:hover { background: #1a5c1a; }
                .sf-backup-btn-secondary { background: #fff; color: #2d7a2d; border: 2px solid #2d7a2d; }
                .sf-backup-btn-secondary:hover { background: #e8f5e9; }
                .sf-backup-btn-danger { background: #fff; color: #dc3545; border: 2px solid #dc3545; }
                .sf-backup-btn-danger:hover { background: #fff5f5; }
                .sf-backup-btn-info { background: #17a2b8; color: #fff; }
                .sf-backup-btn-info:hover { background: #138496; }
                .sf-backup-list {
                    margin-top: 16px;
                }
                .sf-backup-list h3 {
                    color: #1a5c1a;
                    margin: 0 0 12px 0;
                    font-size: 1.1em;
                }
                .sf-backup-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #fff;
                    border-radius: 10px;
                    border: 1px solid #ddd;
                    margin-bottom: 8px;
                }
                .sf-backup-item-info { flex: 1; }
                .sf-backup-item-info .date {
                    font-weight: bold;
                    color: #333;
                }
                .sf-backup-item-info .meta {
                    font-size: 0.85em;
                    color: #888;
                    margin-top: 2px;
                }
                .sf-backup-item-actions {
                    display: flex;
                    gap: 6px;
                }
                .sf-backup-item-actions button {
                    padding: 6px 12px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    background: #fff;
                    cursor: pointer;
                    font-size: 0.85em;
                    font-family: inherit;
                    transition: all 0.2s;
                }
                .sf-backup-item-actions button:hover { background: #f0f0f0; }
                .sf-backup-item-actions .restore-btn { color: #2d7a2d; border-color: #2d7a2d; }
                .sf-backup-item-actions .restore-btn:hover { background: #e8f5e9; }
                .sf-backup-item-actions .delete-btn { color: #dc3545; border-color: #dc3545; }
                .sf-backup-item-actions .delete-btn:hover { background: #fff5f5; }
                .sf-backup-item-actions .download-btn { color: #17a2b8; border-color: #17a2b8; }
                .sf-backup-item-actions .download-btn:hover { background: #e3f2fd; }
                .sf-backup-empty {
                    text-align: center;
                    padding: 30px;
                    color: #888;
                    font-size: 1.05em;
                }
                .sf-backup-import-zone {
                    border: 2px dashed #2d7a2d;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin-top: 16px;
                    background: #fff;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .sf-backup-import-zone:hover { background: #e8f5e9; }
                .sf-backup-import-zone.dragover { background: #d4edda; border-color: #1a5c1a; }
                .sf-backup-import-zone p {
                    margin: 0;
                    color: #666;
                    font-size: 0.95em;
                }
                .sf-backup-toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    padding: 14px 24px;
                    border-radius: 10px;
                    color: #fff;
                    font-weight: bold;
                    font-family: inherit;
                    z-index: 10000;
                    animation: sfBackupToastIn 0.3s ease;
                }
                .sf-backup-toast.success { background: #28a745; }
                .sf-backup-toast.error { background: #dc3545; }
                @keyframes sfBackupToastIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>

            <div class="sf-backup-panel">
                <div class="sf-backup-title">ব্যাকআপ ও পুনরুদ্ধার</div>

                <div class="sf-backup-stats" id="sf-backup-stats">
                    <div class="sf-backup-stat">
                        <div class="stat-num" id="sf-backup-current-size">${currentSize} KB</div>
                        <div class="stat-label">বর্তমান ডেটা</div>
                    </div>
                    <div class="sf-backup-stat">
                        <div class="stat-num" id="sf-backup-total-count">${backups.length}</div>
                        <div class="stat-label">মোট ব্যাকআপ</div>
                    </div>
                    <div class="sf-backup-stat">
                        <div class="stat-num" id="sf-backup-total-size">${backups.reduce((sum, b) => sum + (b.size || 0), 0).toFixed(1)} KB</div>
                        <div class="stat-label">ব্যাকআপ সাইজ</div>
                    </div>
                </div>

                <div class="sf-backup-actions">
                    <button class="sf-backup-btn sf-backup-btn-primary" id="sf-backup-create">
                        সম্পূর্ণ ব্যাকআপ তৈরি করুন
                    </button>
                    <button class="sf-backup-btn sf-backup-btn-secondary" id="sf-backup-export-user">
                        ব্যবহারকারী ডেটা এক্সপোর্ট
                    </button>
                    <button class="sf-backup-btn sf-backup-btn-info" id="sf-backup-export-chat">
                        চ্যাট হিস্ট্রি এক্সপোর্ট
                    </button>
                    <button class="sf-backup-btn sf-backup-btn-secondary" id="sf-backup-download-file">
                        ফাইল হিসেবে ডাউনলোড
                    </button>
                </div>

                <div class="sf-backup-import-zone" id="sf-backup-import-zone">
                    <p>ফাইল এখানে ড্র্যাগ করুন অথবা ক্লিক করে ফাইল নির্বাচন করুন</p>
                    <input type="file" id="sf-backup-file-input" accept=".json" style="display:none">
                </div>

                <div class="sf-backup-list">
                    <h3>সাম্প্রতিক ব্যাকআপ</h3>
                    <div id="sf-backup-list-items">
                        ${backups.length === 0
                            ? '<div class="sf-backup-empty">কোনো ব্যাকআপ নেই। প্রথম ব্যাকআপ তৈরি করুন।</div>'
                            : backups.slice().reverse().map(b => `
                                <div class="sf-backup-item" data-id="${b.id}">
                                    <div class="sf-backup-item-info">
                                        <div class="date">${formatDate(b.date)}</div>
                                        <div class="meta">${b.size || 0} KB — ${b.type === 'full' ? 'সম্পূর্ণ' : 'আংশিক'}</div>
                                    </div>
                                    <div class="sf-backup-item-actions">
                                        <button class="download-btn" data-id="${b.id}" title="ডাউনলোড">ডাউনলোড</button>
                                        <button class="restore-btn" data-id="${b.id}" title="পুনরুদ্ধার">পুনরুদ্ধার</button>
                                        <button class="delete-btn" data-id="${b.id}" title="মুছুন">মুছুন</button>
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                </div>
            </div>
        `;

        const self = this;

        function showToast(message, type) {
            const existing = document.querySelector('.sf-backup-toast');
            if (existing) existing.remove();
            const toast = document.createElement('div');
            toast.className = `sf-backup-toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        function refreshStats() {
            const currentSize = self.getBackupSize();
            const backups = self.listBackups();
            document.getElementById('sf-backup-current-size').textContent = currentSize + ' KB';
            document.getElementById('sf-backup-total-count').textContent = backups.length;
            document.getElementById('sf-backup-total-size').textContent =
                backups.reduce((sum, b) => sum + (b.size || 0), 0).toFixed(1) + ' KB';
        }

        function refreshList() {
            const backups = self.listBackups();
            const listEl = document.getElementById('sf-backup-list-items');
            if (backups.length === 0) {
                listEl.innerHTML = '<div class="sf-backup-empty">কোনো ব্যাকআপ নেই। প্রথম ব্যাকআপ তৈরি করুন।</div>';
                return;
            }
            listEl.innerHTML = backups.slice().reverse().map(b => `
                <div class="sf-backup-item" data-id="${b.id}">
                    <div class="sf-backup-item-info">
                        <div class="date">${formatDate(b.date)}</div>
                        <div class="meta">${b.size || 0} KB — ${b.type === 'full' ? 'সম্পূর্ণ' : 'আংশিক'}</div>
                    </div>
                    <div class="sf-backup-item-actions">
                        <button class="download-btn" data-id="${b.id}" title="ডাউনলোড">ডাউনলোড</button>
                        <button class="restore-btn" data-id="${b.id}" title="পুনরুদ্ধার">পুনরুদ্ধার</button>
                        <button class="delete-btn" data-id="${b.id}" title="মুছুন">মুছুন</button>
                    </div>
                </div>
            `).join('');
            attachListEvents();
        }

        function attachListEvents() {
            document.querySelectorAll('#sf-backup-list-items .download-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.dataset.id;
                    const backup = loadBackups().find(b => b.id === id);
                    if (backup) {
                        self.downloadBackup(`backup_${backup.date.split('T')[0]}.json`, backup);
                        showToast('ডাউনলোড শুরু হয়েছে!', 'success');
                    }
                });
            });

            document.querySelectorAll('#sf-backup-list-items .restore-btn').forEach(btn => {
                btn.addEventListener('click', async function () {
                    if (!confirm('আপনি কি নিশ্চিত? এটি বর্তমান ডেটা মুছে পুনরুদ্ধার করবে।')) return;
                    const id = this.dataset.id;
                    const backup = loadBackups().find(b => b.id === id);
                    if (backup) {
                        const result = await self.restoreBackup(backup);
                        if (result.success) {
                            showToast(`${result.restored}টি কী পুনরুদ্ধার হয়েছে!`, 'success');
                        } else {
                            showToast('পুনরুদ্ধারে সমস্যা: ' + result.error, 'error');
                        }
                    }
                });
            });

            document.querySelectorAll('#sf-backup-list-items .delete-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    if (!confirm('আপনি কি নিশ্চিত? এই ব্যাকআপ মুছে ফেলতে চান?')) return;
                    const id = this.dataset.id;
                    const backups = loadBackups().filter(b => b.id !== id);
                    saveBackups(backups);
                    refreshList();
                    refreshStats();
                    showToast('ব্যাকআপ মুছে ফেলা হয়েছে', 'success');
                });
            });
        }

        document.getElementById('sf-backup-create').addEventListener('click', async function () {
            this.disabled = true;
            this.textContent = 'তৈরি হচ্ছে...';
            const backup = await self.createBackup();
            this.disabled = false;
            this.textContent = 'সম্পূর্ণ ব্যাকআপ তৈরি করুন';
            refreshStats();
            refreshList();
            showToast(`ব্যাকআপ তৈরি হয়েছে! (${backup.size} KB)`, 'success');
        });

        document.getElementById('sf-backup-export-user').addEventListener('click', function () {
            const json = self.exportUserData();
            self.downloadFile(json, 'sf_user_data.json', 'application/json');
            showToast('ব্যবহারকারী ডেটা এক্সপোর্ট হয়েছে!', 'success');
        });

        document.getElementById('sf-backup-export-chat').addEventListener('click', function () {
            const json = self.exportChatHistory();
            self.downloadFile(json, 'sf_chat_history.json', 'application/json');
            showToast('চ্যাট হিস্ট্রি এক্সপোর্ট হয়েছে!', 'success');
        });

        document.getElementById('sf-backup-download-file').addEventListener('click', async function () {
            const backup = await self.createBackup();
            self.downloadBackup(`sf_full_backup_${new Date().toISOString().split('T')[0]}.json`, backup);
            showToast('সম্পূর্ণ ব্যাকআপ ডাউনলোড হচ্ছে!', 'success');
        });

        const importZone = document.getElementById('sf-backup-import-zone');
        const fileInput = document.getElementById('sf-backup-file-input');

        importZone.addEventListener('click', () => fileInput.click());

        importZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            importZone.classList.add('dragover');
        });

        importZone.addEventListener('dragleave', () => {
            importZone.classList.remove('dragover');
        });

        importZone.addEventListener('drop', (e) => {
            e.preventDefault();
            importZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) self.uploadBackup(file, showToast, refreshStats);
        });

        fileInput.addEventListener('change', function () {
            if (this.files[0]) {
                self.uploadBackup(this.files[0], showToast, refreshStats);
                this.value = '';
            }
        });

        attachListEvents();

        return {
            refresh() { refreshStats(); refreshList(); },
            destroy() { container.innerHTML = ''; },
        };
    },

    downloadBackup(filename, backupData) {
        const content = JSON.stringify(backupData, null, 2);
        this.downloadFile(content, filename, 'application/json');
    },

    uploadBackup(file, showToastFn, refreshFn) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const json = e.target.result;
                const result = await this.restoreBackup(json);
                if (result.success) {
                    if (showToastFn) showToastFn(`${result.restored}টি কী পুনরুদ্ধার হয়েছে!`, 'success');
                    if (refreshFn) refreshFn();
                } else {
                    if (showToastFn) showToastFn('ইমপোর্টে সমস্যা: ' + result.error, 'error');
                }
            } catch (err) {
                if (showToastFn) showToastFn('ফাইল পড়তে সমস্যা: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    },

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType || 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    deleteBackup(id) {
        const backups = loadBackups().filter(b => b.id !== id);
        saveBackups(backups);
        return true;
    },

    clearAllBackups() {
        saveBackups([]);
        return true;
    },
};
