/**
 * SF AI V20 — Cloud/Offline Sync Module
 * ES module for data synchronization with conflict resolution
 * অফলাইন কিউ, ক্লাউড সিঙ্ক, কনফ্লিক্ট রেজোলিউশন
 */

const SYNC_QUEUE_KEY = 'sf_sync_queue';
const SYNC_LOG_KEY = 'sf_sync_log';
const CONFLICTS_KEY = 'sf_conflicts';
const LAST_SYNC_KEY = 'sf_last_sync';
const SYNC_VERSION = '20.0';
const MAX_QUEUE_SIZE = 500;
const MAX_LOG_ENTRIES = 100;

function syncGetStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function syncSetStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch { /* quota */ }
}

function syncRemoveStorage(key) {
    try { localStorage.removeItem(key); } catch { /* */ }
}

function syncId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function syncNow() {
    return new Date().toISOString();
}

function syncToast(message, type) {
    const existing = document.querySelector('.sf-sync-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'sf-sync-toast ' + (type || 'success');
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        padding: '14px 28px', borderRadius: '10px', color: '#fff', fontWeight: 'bold',
        fontFamily: 'inherit', zIndex: '100000', animation: 'sfSyncToastIn 0.3s ease',
        background: type === 'error' ? '#dc3545' : type === 'warning' ? '#f0ad4e' : '#28a745'
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function syncInjectStyles() {
    if (document.getElementById('sf-sync-styles')) return;
    const style = document.createElement('style');
    style.id = 'sf-sync-styles';
    style.textContent = `
        @keyframes sfSyncToastIn { from { transform: translate(-50%,20px); opacity: 0; } to { transform: translate(-50%,0); opacity: 1; } }
        .sf-sync-panel { font-family: 'Hind Siliguri','Kalpurush',sans-serif; max-width: 750px; margin: 0 auto; padding: 24px; background: linear-gradient(135deg,#f0f9ff,#e0f0fe); border-radius: 16px; border: 2px solid #0d6efd; }
        .sf-sync-title { text-align: center; font-size: 1.5em; color: #0a3d7c; margin-bottom: 20px; font-weight: bold; }
        .sf-sync-section { margin-bottom: 20px; padding: 16px; background: #fff; border-radius: 12px; border: 1px solid #e0e0e0; }
        .sf-sync-section h3 { margin: 0 0 12px; color: #0d6efd; font-size: 1.05em; }
        .sf-sync-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .sf-sync-btn { padding: 12px 16px; border: none; border-radius: 8px; font-size: 0.95em; font-weight: bold; font-family: inherit; cursor: pointer; transition: all 0.2s; }
        .sf-sync-btn:hover { transform: translateY(-2px); box-shadow: 0 3px 8px rgba(0,0,0,0.15); }
        .sf-sync-btn-primary { background: #0d6efd; color: #fff; grid-column: 1/-1; }
        .sf-sync-btn-success { background: #198754; color: #fff; }
        .sf-sync-btn-warning { background: #ffc107; color: #333; }
        .sf-sync-btn-danger { background: #dc3545; color: #fff; }
        .sf-sync-btn-outline { background: #fff; color: #0d6efd; border: 2px solid #0d6efd; }
        .sf-sync-status-box { padding: 14px; border-radius: 8px; margin-bottom: 12px; font-size: 0.95em; }
        .sf-sync-online { background: #d1e7dd; color: #0f5132; border: 1px solid #badbcc; }
        .sf-sync-offline { background: #f8d7da; color: #842029; border: 1px solid #f5c2c7; }
        .sf-sync-stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .sf-sync-stat:last-child { border-bottom: none; }
        .sf-sync-stat-label { color: #666; }
        .sf-sync-stat-value { font-weight: bold; color: #333; }
        .sf-sync-history { max-height: 200px; overflow-y: auto; font-size: 0.9em; }
        .sf-sync-history-item { padding: 8px; border-bottom: 1px solid #eee; }
        .sf-sync-history-time { color: #999; font-size: 0.85em; }
        .sf-sync-conflict-item { padding: 12px; margin-bottom: 8px; border: 1px solid #ffc107; border-radius: 8px; background: #fff8e1; }
        .sf-sync-conflict-type { font-weight: bold; color: #e65100; }
        .sf-sync-progress { width: 100%; height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden; margin-top: 8px; }
        .sf-sync-progress-bar { height: 100%; background: #0d6efd; border-radius: 3px; transition: width 0.4s; }
        .sf-sync-empty { text-align: center; color: #999; padding: 16px; font-style: italic; }
    `;
    document.head.appendChild(style);
}

function syncAddLog(entry) {
    const logs = syncGetStorage(SYNC_LOG_KEY) || [];
    logs.unshift({
        id: syncId(),
        timestamp: syncNow(),
        ...entry
    });
    if (logs.length > MAX_LOG_ENTRIES) logs.length = MAX_LOG_ENTRIES;
    syncSetStorage(SYNC_LOG_KEY, logs);
}

export const SFSync = {
    _syncing: false,
    _listeners: [],

    init() {
        syncInjectStyles();
        window.addEventListener('online', () => this._onOnline());
        window.addEventListener('offline', () => this._onOffline());
        return this;
    },

    isOnline() {
        return navigator.onLine;
    },

    isSyncing() {
        return this._syncing;
    },

    getLastSyncTime() {
        return syncGetStorage(LAST_SYNC_KEY) || null;
    },

    getSyncStatus() {
        const queueSize = this.getQueueSize();
        const conflicts = this.getConflicts();
        const lastSync = this.getLastSyncTime();
        return {
            online: this.isOnline(),
            syncing: this._syncing,
            queueSize,
            conflicts: conflicts.length,
            lastSync,
            status: this._syncing ? 'সিঙ্ক হচ্ছে' : (!this.isOnline() ? 'অফলাইন' : (queueSize > 0 ? `${queueSize}টি অপেক্ষমান` : 'সিঙ্ক সম্পন্ন'))
        };
    },

    async pushToCloud(data) {
        if (!this.isOnline()) {
            this.queueOperation({ type: 'push', data, timestamp: syncNow() });
            return { success: false, reason: 'অফলাইন — কিউতে যোগ করা হয়েছে' };
        }
        this._syncing = true;
        syncAddLog({ action: 'push', status: 'শুরু', dataType: data?.type || 'unknown' });
        try {
            // Simulate cloud push — replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 800));
            syncSetStorage(LAST_SYNC_KEY, syncNow());
            syncAddLog({ action: 'push', status: 'সফল', dataType: data?.type || 'unknown' });
            this._syncing = false;
            return { success: true, timestamp: syncNow() };
        } catch (err) {
            syncAddLog({ action: 'push', status: 'ব্যর্থ', error: err.message });
            this._syncing = false;
            return { success: false, error: err.message };
        }
    },

    async pushAllData() {
        const types = ['farms', 'fields', 'tasks', 'expenses', 'sales', 'inventory', 'community', 'feedback'];
        const results = {};
        for (const type of types) {
            const key = `sf_${type}`;
            const data = syncGetStorage(key);
            if (data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0)) {
                results[type] = await this.pushToCloud({ type, payload: data });
            }
        }
        return results;
    },

    async pullFromCloud() {
        if (!this.isOnline()) {
            return { success: false, reason: 'অফলাইনে ক্লাউড থেকে তথ্য আনা সম্ভব নয়' };
        }
        this._syncing = true;
        syncAddLog({ action: 'pull', status: 'শুরু' });
        try {
            // Simulate cloud pull — replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            const data = {};
            syncSetStorage(LAST_SYNC_KEY, syncNow());
            syncAddLog({ action: 'pull', status: 'সফল' });
            this._syncing = false;
            return { success: true, data, timestamp: syncNow() };
        } catch (err) {
            syncAddLog({ action: 'pull', status: 'ব্যর্থ', error: err.message });
            this._syncing = false;
            return { success: false, error: err.message };
        }
    },

    async pullAllData() {
        if (!this.isOnline()) {
            return { success: false, reason: 'অফলাইন' };
        }
        this._syncing = true;
        try {
            const types = this.SYNC_TYPES;
            for (const type of types) {
                // Simulated pull per type
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            syncSetStorage(LAST_SYNC_KEY, syncNow());
            this._syncing = false;
            return { success: true, timestamp: syncNow() };
        } catch (err) {
            this._syncing = false;
            return { success: false, error: err.message };
        }
    },

    async resolveConflict(local, remote) {
        if (!local || !remote) return null;
        const localTime = new Date(local.updatedAt || local.timestamp || 0).getTime();
        const remoteTime = new Date(remote.updatedAt || remote.timestamp || 0).getTime();
        if (localTime >= remoteTime) {
            syncAddLog({ action: 'conflict_resolve', winner: 'local', type: local.type });
            return { ...local, _resolved: true, _resolvedAt: syncNow() };
        } else {
            syncAddLog({ action: 'conflict_resolve', winner: 'remote', type: remote.type });
            return { ...remote, _resolved: true, _resolvedAt: syncNow() };
        }
    },

    getConflicts() {
        return syncGetStorage(CONFLICTS_KEY) || [];
    },

    resolveAllConflicts(strategy) {
        const conflicts = this.getConflicts();
        if (conflicts.length === 0) return { resolved: 0 };
        let resolved = 0;
        const remaining = [];
        for (const conflict of conflicts) {
            let winner;
            switch (strategy) {
                case 'local': winner = conflict.local; break;
                case 'remote': winner = conflict.remote; break;
                case 'newest':
                default: {
                    const lt = new Date(conflict.local?.updatedAt || conflict.local?.timestamp || 0).getTime();
                    const rt = new Date(conflict.remote?.updatedAt || conflict.remote?.timestamp || 0).getTime();
                    winner = lt >= rt ? conflict.local : conflict.remote;
                }
            }
            if (winner) {
                const key = `sf_${conflict.type}`;
                const items = syncGetStorage(key) || [];
                const idx = items.findIndex(i => i.id === winner.id);
                if (idx >= 0) items[idx] = winner; else items.push(winner);
                syncSetStorage(key, items);
                resolved++;
            }
        }
        syncSetStorage(CONFLICTS_KEY, remaining);
        syncAddLog({ action: 'resolve_all', strategy, resolved });
        return { resolved, remaining: remaining.length };
    },

    queueOperation(operation) {
        const queue = syncGetStorage(SYNC_QUEUE_KEY) || [];
        if (queue.length >= MAX_QUEUE_SIZE) {
            queue.splice(0, Math.ceil(MAX_QUEUE_SIZE * 0.2));
        }
        queue.push({
            id: syncId(),
            ...operation,
            queuedAt: syncNow()
        });
        syncSetStorage(SYNC_QUEUE_KEY, queue);
        return queue.length;
    },

    async processQueue() {
        const queue = syncGetStorage(SYNC_QUEUE_KEY) || [];
        if (queue.length === 0) return { processed: 0 };
        if (!this.isOnline()) return { processed: 0, reason: 'অফলাইন' };
        this._syncing = true;
        let processed = 0;
        const failed = [];
        for (const op of queue) {
            try {
                await this.pushToCloud(op);
                processed++;
            } catch {
                failed.push(op);
            }
        }
        syncSetStorage(SYNC_QUEUE_KEY, failed);
        syncAddLog({ action: 'process_queue', processed, failed: failed.length });
        this._syncing = false;
        return { processed, failed: failed.length };
    },

    getQueueSize() {
        const queue = syncGetStorage(SYNC_QUEUE_KEY) || [];
        return queue.length;
    },

    clearQueue() {
        syncSetStorage(SYNC_QUEUE_KEY, []);
        syncAddLog({ action: 'clear_queue' });
    },

    SYNC_TYPES: ['farms', 'fields', 'tasks', 'expenses', 'sales', 'inventory', 'community', 'feedback'],

    async fullSync() {
        if (!this.isOnline()) {
            syncToast('অফলাইনে সিঙ্ক সম্ভব নয়', 'warning');
            return { success: false, reason: 'অফলাইন' };
        }
        this._syncing = true;
        syncAddLog({ action: 'full_sync', status: 'শুরু' });
        syncToast('সম্পূর্ণ সিঙ্ক শুরু হয়েছে...', 'success');
        try {
            const pushResults = await this.pushAllData();
            const pullResult = await this.pullAllData();
            const queueResult = await this.processQueue();
            syncSetStorage(LAST_SYNC_KEY, syncNow());
            syncAddLog({ action: 'full_sync', status: 'সফল' });
            this._syncing = false;
            syncToast('সম্পূর্ণ সিঙ্ক সম্পন্ন!', 'success');
            return { success: true, push: pushResults, pull: pullResult, queue: queueResult, timestamp: syncNow() };
        } catch (err) {
            syncAddLog({ action: 'full_sync', status: 'ব্যর্থ', error: err.message });
            this._syncing = false;
            syncToast('সিঙ্কে ত্রুটি: ' + err.message, 'error');
            return { success: false, error: err.message };
        }
    },

    async incrementalSync() {
        if (!this.isOnline()) {
            return { success: false, reason: 'অফলাইন' };
        }
        this._syncing = true;
        syncAddLog({ action: 'incr_sync', status: 'শুরু' });
        try {
            const lastSync = this.getLastSyncTime();
            const queueResult = await this.processQueue();
            syncSetStorage(LAST_SYNC_KEY, syncNow());
            syncAddLog({ action: 'incr_sync', status: 'সফল' });
            this._syncing = false;
            return { success: true, queue: queueResult, lastSync, timestamp: syncNow() };
        } catch (err) {
            this._syncing = false;
            syncAddLog({ action: 'incr_sync', status: 'ব্যর্থ', error: err.message });
            return { success: false, error: err.message };
        }
    },

    createSyncStatus(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const status = this.getSyncStatus();
        container.innerHTML = `
            <div class="sf-sync-panel">
                <div class="sf-sync-title">সিঙ্ক স্ট্যাটাস</div>
                <div class="sf-sync-section">
                    <div class="sf-sync-status-box ${status.online ? 'sf-sync-online' : 'sf-sync-offline'}">
                        ${status.online ? 'অনলাইন' : 'অফলাইন'} — ${status.status}
                    </div>
                    <div class="sf-sync-stat">
                        <span class="sf-sync-stat-label">কিউতে অপেক্ষমান:</span>
                        <span class="sf-sync-stat-value">${status.queueSize}টি</span>
                    </div>
                    <div class="sf-sync-stat">
                        <span class="sf-sync-stat-label">কনফ্লিক্ট:</span>
                        <span class="sf-sync-stat-value">${status.conflicts}টি</span>
                    </div>
                    <div class="sf-sync-stat">
                        <span class="sf-sync-stat-label">শেষ সিঙ্ক:</span>
                        <span class="sf-sync-stat-value">${status.lastSync ? new Date(status.lastSync).toLocaleString('bn-BD') : 'কখনো নয়'}</span>
                    </div>
                </div>
            </div>
        `;
        return { destroy() { container.innerHTML = ''; } };
    },

    createSyncButton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = `
            <div class="sf-sync-panel">
                <div class="sf-sync-title">ডেটা সিঙ্ক</div>
                <div class="sf-sync-section">
                    <div class="sf-sync-grid">
                        <button class="sf-sync-btn sf-sync-btn-primary" id="sf-sync-full">সম্পূর্ণ সিঙ্ক</button>
                        <button class="sf-sync-btn sf-sync-btn-success" id="sf-sync-push">ক্লাউডে পাঠান</button>
                        <button class="sf-sync-btn sf-sync-btn-outline" id="sf-sync-pull">ক্লাউড থেকে আনুন</button>
                        <button class="sf-sync-btn sf-sync-btn-warning" id="sf-sync-queue">কিউ প্রসেস</button>
                        <button class="sf-sync-btn sf-sync-btn-danger" id="sf-sync-clear">কিউ মুছুন</button>
                    </div>
                    <div class="sf-sync-progress" id="sf-sync-progress" style="display:none;">
                        <div class="sf-sync-progress-bar" id="sf-sync-progress-bar" style="width:0%"></div>
                    </div>
                </div>
            </div>
        `;

        const self = this;
        const progressBar = document.getElementById('sf-sync-progress');
        const bar = document.getElementById('sf-sync-progress-bar');

        function showProgress(pct) {
            progressBar.style.display = 'block';
            bar.style.width = pct + '%';
        }

        document.getElementById('sf-sync-full').addEventListener('click', async function () {
            showProgress(30);
            const result = await self.fullSync();
            showProgress(100);
            setTimeout(() => { progressBar.style.display = 'none'; }, 1500);
        });

        document.getElementById('sf-sync-push').addEventListener('click', async function () {
            showProgress(40);
            const result = await self.pushAllData();
            showProgress(100);
            setTimeout(() => { progressBar.style.display = 'none'; }, 1500);
        });

        document.getElementById('sf-sync-pull').addEventListener('click', async function () {
            showProgress(40);
            const result = await self.pullAllData();
            showProgress(100);
            setTimeout(() => { progressBar.style.display = 'none'; }, 1500);
        });

        document.getElementById('sf-sync-queue').addEventListener('click', async function () {
            showProgress(50);
            const result = await self.processQueue();
            showProgress(100);
            syncToast(`${result.processed}টি অপারেশন প্রসেস হয়েছে`, 'success');
            setTimeout(() => { progressBar.style.display = 'none'; }, 1500);
        });

        document.getElementById('sf-sync-clear').addEventListener('click', function () {
            if (confirm('সমস্ত কিউ মুছে ফেলতে চান?')) {
                self.clearQueue();
                syncToast('কিউ পরিষ্কার হয়েছে', 'success');
            }
        });

        return { destroy() { container.innerHTML = ''; } };
    },

    createConflictResolver(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const conflicts = this.getConflicts();
        container.innerHTML = `
            <div class="sf-sync-panel">
                <div class="sf-sync-title">কনফ্লিক্ট সমাধান</div>
                <div class="sf-sync-section">
                    <h3>সমাধান পদ্ধতি</h3>
                    <div class="sf-sync-grid">
                        <button class="sf-sync-btn sf-sync-btn-success" id="sf-resolve-local">স্থানীয় ব্যবহার করুন</button>
                        <button class="sf-sync-btn sf-sync-btn-outline" id="sf-resolve-remote">রিমোট ব্যবহার করুন</button>
                        <button class="sf-sync-btn sf-sync-btn-primary" id="sf-resolve-newest">নতুনতম ব্যবহার করুন</button>
                    </div>
                </div>
                <div class="sf-sync-section">
                    <h3>অমীমাংসিত কনফ্লিক্ট (${conflicts.length})</h3>
                    <div id="sf-conflict-list">
                        ${conflicts.length === 0
                            ? '<div class="sf-sync-empty">কোনো কনফ্লিক্ট নেই ✓</div>'
                            : conflicts.map(c => `
                                <div class="sf-sync-conflict-item">
                                    <div class="sf-sync-conflict-type">${c.type || 'অজ্ঞাত'} — ID: ${c.local?.id || c.remote?.id || '?'}</div>
                                    <div style="font-size:0.85em;color:#666;margin-top:4px;">স্থানীয়: ${new Date(c.local?.updatedAt || 0).toLocaleString('bn-BD')} | রিমোট: ${new Date(c.remote?.updatedAt || 0).toLocaleString('bn-BD')}</div>
                                </div>
                            `).join('')}
                    </div>
                </div>
            </div>
        `;

        const self = this;
        function handleResolve(strategy) {
            const result = self.resolveAllConflicts(strategy);
            syncToast(`${result.resolved}টি কনফ্লিক্ট সমাধান হয়েছে`, 'success');
            self.createConflictResolver(containerId);
        }

        document.getElementById('sf-resolve-local').addEventListener('click', () => handleResolve('local'));
        document.getElementById('sf-resolve-remote').addEventListener('click', () => handleResolve('remote'));
        document.getElementById('sf-resolve-newest').addEventListener('click', () => handleResolve('newest'));

        return { destroy() { container.innerHTML = ''; } };
    },

    createSyncHistory(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const logs = syncGetStorage(SYNC_LOG_KEY) || [];
        container.innerHTML = `
            <div class="sf-sync-panel">
                <div class="sf-sync-title">সিঙ্ক ইতিহাস</div>
                <div class="sf-sync-section">
                    <div class="sf-sync-history">
                        ${logs.length === 0
                            ? '<div class="sf-sync-empty">এখনো কোনো সিঙ্ক হয়নি</div>'
                            : logs.map(log => `
                                <div class="sf-sync-history-item">
                                    <strong>${log.action === 'push' ? 'পুশ' : log.action === 'pull' ? 'পুল' : log.action === 'full_sync' ? 'সম্পূর্ণ সিঙ্ক' : log.action === 'incr_sync' ? 'ইনক্রিমেন্টাল' : log.action === 'conflict_resolve' ? 'কনফ্লিক্ট' : log.action === 'process_queue' ? 'কিউ প্রসেস' : log.action}</strong>
                                    — ${log.status}
                                    ${log.error ? `<span style="color:#dc3545"> (${log.error})</span>` : ''}
                                    <div class="sf-sync-history-time">${new Date(log.timestamp).toLocaleString('bn-BD')}</div>
                                </div>
                            `).join('')}
                    </div>
                </div>
                <div class="sf-sync-section">
                    <button class="sf-sync-btn sf-sync-btn-danger" id="sf-clear-history" style="width:100%">ইতিহাস পরিষ্কার করুন</button>
                </div>
            </div>
        `;

        document.getElementById('sf-clear-history').addEventListener('click', function () {
            syncSetStorage(SYNC_LOG_KEY, []);
            syncToast('ইতিহাস পরিষ্কার হয়েছে', 'success');
            container.innerHTML = '';
        });

        return { destroy() { container.innerHTML = ''; } };
    },

    exportSyncLog() {
        const logs = syncGetStorage(SYNC_LOG_KEY) || [];
        if (logs.length === 0) { syncToast('কোনো সিঙ্ক লগ নেই', 'warning'); return; }
        const json = JSON.stringify(logs, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sf_sync_log_' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        syncToast('সিঙ্ক লগ ডাউনলোড হয়েছে', 'success');
    },

    _onOnline() {
        syncToast('ইন্টারনেট সংযোগ ফিরে এসেছে!', 'success');
        const queueSize = this.getQueueSize();
        if (queueSize > 0) {
            syncToast(`${queueSize}টি অপারেশন প্রসেস হচ্ছে...`, 'success');
            this.processQueue();
        }
        this._notifyListeners('online');
    },

    _onOffline() {
        syncToast('ইন্টারনেট সংযোগ বিচ্ছিন্ন!', 'warning');
        this._notifyListeners('offline');
    },

    _notifyListeners(event) {
        this._listeners.forEach(l => {
            if (l.event === event) l.callback();
        });
    },

    onSyncEvent(event, callback) {
        this._listeners.push({ event, callback });
    }
};
