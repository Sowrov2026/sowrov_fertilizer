// V19 Logging System
// Client-side logging with export capabilities

export const SFLogging = {
    logs: [],
    maxLogs: 5000,
    initialized: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.logs = this.loadLogs();
        this.startPeriodicSave();
    },

    loadLogs() {
        try {
            const stored = localStorage.getItem('sf_v19_logs');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    saveLogs() {
        try {
            const trimmed = this.logs.slice(-this.maxLogs);
            localStorage.setItem('sf_v19_logs', JSON.stringify(trimmed));
            this.logs = trimmed;
        } catch {}
    },

    startPeriodicSave() {
        setInterval(() => this.saveLogs(), 60000);
    },

    log(type, message, data = {}) {
        const entry = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            type,
            message,
            data,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100),
        };

        this.logs.push(entry);

        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        this.persistLog(entry);
        return entry;
    },

    persistLog(entry) {
        try {
            const existing = JSON.parse(localStorage.getItem('sf_v19_logs') || '[]');
            existing.push(entry);
            if (existing.length > this.maxLogs) {
                existing.splice(0, existing.length - this.maxLogs);
            }
            localStorage.setItem('sf_v19_logs', JSON.stringify(existing));
        } catch {}
    },

    logError(message, data = {}) {
        return this.log('error', message, { ...data, level: 'error' });
    },

    logWarning(message, data = {}) {
        return this.log('warning', message, { ...data, level: 'warning' });
    },

    logInfo(message, data = {}) {
        return this.log('info', message, { ...data, level: 'info' });
    },

    logChat(message, metadata = {}) {
        return this.log('chat', message, {
            ...metadata,
            language: metadata.language || this.detectLanguage(message),
            messageLength: message.length,
        });
    },

    logUserAction(action, details = {}) {
        return this.log('user_action', action, details);
    },

    detectLanguage(text) {
        const banglaRegex = /[\u0980-\u09FF]/;
        if (banglaRegex.test(text)) return 'bangla';
        return 'english';
    },

    getLogs(filter = {}) {
        let result = [...this.logs];

        if (filter.type) {
            result = result.filter(l => l.type === filter.type);
        }

        if (filter.level) {
            result = result.filter(l => l.data?.level === filter.level);
        }

        if (filter.startDate) {
            const start = new Date(filter.startDate);
            result = result.filter(l => new Date(l.timestamp) >= start);
        }

        if (filter.endDate) {
            const end = new Date(filter.endDate);
            result = result.filter(l => new Date(l.timestamp) <= end);
        }

        if (filter.search) {
            const q = filter.search.toLowerCase();
            result = result.filter(l =>
                l.message.toLowerCase().includes(q) ||
                JSON.stringify(l.data).toLowerCase().includes(q)
            );
        }

        if (filter.limit) {
            result = result.slice(-filter.limit);
        }

        return result;
    },

    getLogStats() {
        const total = this.logs.length;
        const byType = {};
        const byLevel = {};
        const byHour = new Array(24).fill(0);
        const byDay = {};

        this.logs.forEach(log => {
            byType[log.type] = (byType[log.type] || 0) + 1;
            if (log.data?.level) {
                byLevel[log.data.level] = (byLevel[log.data.level] || 0) + 1;
            }
            const hour = new Date(log.timestamp).getHours();
            byHour[hour]++;
            const day = new Date(log.timestamp).toLocaleDateString('bn-BD');
            byDay[day] = (byDay[day] || 0) + 1;
        });

        const recentErrors = this.logs
            .filter(l => l.type === 'error')
            .slice(-5);

        const avgMessageLength = total > 0
            ? Math.round(this.logs.reduce((sum, l) => sum + (l.message?.length || 0), 0) / total)
            : 0;

        return {
            total,
            byType,
            byLevel,
            byHour,
            byDay,
            recentErrors,
            avgMessageLength,
            oldestLog: this.logs.length > 0 ? this.logs[0].timestamp : null,
            newestLog: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null,
        };
    },

    exportAsCSV(logs) {
        const data = logs || this.logs;
        if (data.length === 0) {
            alert('এক্সপোর্ট করার মতো লগ নেই।');
            return;
        }

        let csv = 'ID,সময়,ধরন,মেসেজ,লেভেল,URL\n';
        data.forEach(log => {
            const row = [
                log.id,
                log.timestamp,
                log.type,
                `"${(log.message || '').replace(/"/g, '""')}"`,
                log.data?.level || '',
                log.url || '',
            ];
            csv += row.join(',') + '\n';
        });

        this.downloadFile(csv, `logs-${Date.now()}.csv`, 'text/csv');
    },

    exportAsJSON(logs) {
        const data = logs || this.logs;
        if (data.length === 0) {
            alert('এক্সপোর্ট করার মতো লগ নেই।');
            return;
        }

        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, `logs-${Date.now()}.json`, 'application/json');
    },

    downloadFile(content, filename, mimeType) {
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

    clearOldLogs(days) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const before = this.logs.length;
        this.logs = this.logs.filter(l => new Date(l.timestamp) >= cutoff);
        this.saveLogs();
        return before - this.logs.length;
    },

    createLoggingPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const stats = this.getLogStats();
        const typeColors = {
            chat: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            user_action: '#8b5cf6',
        };
        const typeLabels = {
            chat: 'চ্যাট',
            error: 'ত্রুটি',
            warning: 'সতর্কতা',
            info: 'তথ্য',
            user_action: 'ব্যবহারকারী',
        };

        container.innerHTML = `
            <div class="sf-logging-panel" style="font-family:'Hind Siliguri',sans-serif;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                    <h3 style="color:#10b981;margin:0;">লগিং সিস্টেম</h3>
                    <div style="display:flex;gap:8px;">
                        <button id="btn-export-logs-csv" style="padding:4px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer;font-size:12px;">CSV</button>
                        <button id="btn-export-logs-json" style="padding:4px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer;font-size:12px;">JSON</button>
                        <button id="btn-clear-old-logs" style="padding:4px 12px;border-radius:6px;border:1px solid #ef4444;background:#1e293b;color:#ef4444;cursor:pointer;font-size:12px;">পুরাতন মুছুন</button>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-bottom:16px;">
                    ${Object.entries(stats.byType).map(([type, count]) => `
                        <div style="background:#1e293b;padding:10px;border-radius:8px;text-align:center;">
                            <div style="font-size:18px;font-weight:700;color:${typeColors[type] || '#94a3b8'};">${count}</div>
                            <div style="font-size:10px;color:#94a3b8;">${typeLabels[type] || type}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-bottom:12px;">
                    <input id="log-search" type="text" placeholder="লগ খুঁজুন..." style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;box-sizing:border-box;">
                </div>
                <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
                    <select id="log-filter-type" style="padding:4px 8px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:12px;">
                        <option value="">সব ধরন</option>
                        <option value="chat">চ্যাট</option>
                        <option value="error">ত্রুটি</option>
                        <option value="warning">সতর্কতা</option>
                        <option value="info">তথ্য</option>
                        <option value="user_action">ব্যবহারকারী</option>
                    </select>
                    <select id="log-filter-level" style="padding:4px 8px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:12px;">
                        <option value="">সব লেভেল</option>
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                    </select>
                    <select id="log-limit" style="padding:4px 8px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;font-size:12px;">
                        <option value="50">৫০টি</option>
                        <option value="100" selected>১০০টি</option>
                        <option value="500">৫০০টি</option>
                        <option value="0">সব</option>
                    </select>
                </div>
                <div id="log-entries" style="max-height:400px;overflow-y:auto;background:#0f172a;border-radius:8px;padding:8px;">
                    ${this.renderLogEntries(this.logs.slice(-100))}
                </div>
                <div style="margin-top:8px;text-align:center;font-size:11px;color:#64748b;">
                    মোট ${stats.total}টি লগ
                </div>
            </div>
        `;

        document.getElementById('log-search').oninput = () => this.filterLogs(containerId);
        document.getElementById('log-filter-type').onchange = () => this.filterLogs(containerId);
        document.getElementById('log-filter-level').onchange = () => this.filterLogs(containerId);
        document.getElementById('log-limit').onchange = () => this.filterLogs(containerId);

        document.getElementById('btn-export-logs-csv').onclick = () => this.exportAsCSV();
        document.getElementById('btn-export-logs-json').onclick = () => this.exportAsJSON();
        document.getElementById('btn-clear-old-logs').onclick = () => {
            if (confirm('৭ দিনের পুরাতন লগ মুছে ফেলবেন?')) {
                const removed = this.clearOldLogs(7);
                alert(`${removed}টি লগ মুছে ফেলা হয়েছে।`);
                this.createLoggingPanel(containerId);
            }
        };
    },

    filterLogs(containerId) {
        const search = document.getElementById('log-search')?.value || '';
        const type = document.getElementById('log-filter-type')?.value || '';
        const level = document.getElementById('log-filter-level')?.value || '';
        const limit = parseInt(document.getElementById('log-limit')?.value || '100');

        const filtered = this.getLogs({ search, type, level, limit: limit || undefined });
        const entries = document.getElementById('log-entries');
        if (entries) {
            entries.innerHTML = this.renderLogEntries(filtered);
        }
    },

    renderLogEntries(logs) {
        if (logs.length === 0) {
            return '<p style="color:#64748b;text-align:center;padding:16px;">কোনো লগ পাওয়া যায়নি।</p>';
        }

        const typeColors = {
            chat: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6',
            user_action: '#8b5cf6',
        };

        return logs.slice().reverse().map(log => `
            <div style="padding:6px 8px;margin-bottom:4px;background:#1e293b;border-radius:6px;border-left:3px solid ${typeColors[log.type] || '#64748b'};">
                <div style="display:flex;justify-content:space-between;align-items:start;">
                    <span style="color:#e2e8f0;font-size:12px;flex:1;">${this.escapeHtml(log.message)}</span>
                    <span style="font-size:10px;color:#64748b;white-space:nowrap;margin-left:8px;">${new Date(log.timestamp).toLocaleTimeString('bn-BD')}</span>
                </div>
                <div style="display:flex;gap:8px;margin-top:2px;">
                    <span style="font-size:10px;color:${typeColors[log.type] || '#64748b'};">${log.type}</span>
                    ${log.data?.level ? `<span style="font-size:10px;color:#94a3b8;">${log.data.level}</span>` : ''}
                </div>
            </div>
        `).join('');
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
};
