const STORAGE_KEY = 'sf_monitor';
const MAX_ENTRIES = 500;

function loadData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return { errors: [], latency: [], aiResponses: [], searches: [], vision: [] };
}

function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { }
}

function trimArray(arr) {
    while (arr.length > MAX_ENTRIES) arr.shift();
}

export const SFMonitor = {
    init() {
        const data = loadData();
        ['errors', 'latency', 'aiResponses', 'searches', 'vision'].forEach(k => {
            if (!Array.isArray(data[k])) data[k] = [];
        });
        saveData(data);
        return this;
    },

    trackError(error, context = {}) {
        const data = loadData();
        data.errors.push({
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
            timestamp: new Date().toISOString(),
            message: error?.message || String(error),
            stack: error?.stack || null,
            context
        });
        trimArray(data.errors);
        saveData(data);
    },

    trackLatency(endpoint, duration, success) {
        const data = loadData();
        data.latency.push({
            timestamp: new Date().toISOString(),
            endpoint,
            duration,
            success
        });
        trimArray(data.latency);
        saveData(data);
    },

    trackAIResponse(responseTime, success, confidence = null) {
        const data = loadData();
        data.aiResponses.push({
            timestamp: new Date().toISOString(),
            responseTime,
            success,
            confidence
        });
        trimArray(data.aiResponses);
        saveData(data);
    },

    trackSearch(query, resultsCount, duration) {
        const data = loadData();
        data.searches.push({
            timestamp: new Date().toISOString(),
            query,
            resultsCount,
            duration
        });
        trimArray(data.searches);
        saveData(data);
    },

    trackVision(duration, success, diseaseFound = false) {
        const data = loadData();
        data.vision.push({
            timestamp: new Date().toISOString(),
            duration,
            success,
            diseaseFound
        });
        trimArray(data.vision);
        saveData(data);
    },

    getErrorLogs(limit = 100) {
        const data = loadData();
        return data.errors.slice(-limit);
    },

    getPerformanceMetrics() {
        const data = loadData();
        const latencies = data.latency.map(l => l.duration);
        const aiTimes = data.aiResponses.map(r => r.responseTime);
        const searchTimes = data.searches.map(s => s.duration);
        const visionTimes = data.vision.map(v => v.duration);

        const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const min = arr => arr.length ? Math.min(...arr) : 0;
        const max = arr => arr.length ? Math.max(...arr) : 0;

        return {
            totalErrors: data.errors.length,
            totalRequests: data.latency.length,
            avgLatency: avg(latencies),
            minLatency: min(latencies),
            maxLatency: max(latencies),
            avgAIResponseTime: avg(aiTimes),
            avgSearchDuration: avg(searchTimes),
            avgVisionDuration: avg(visionTimes),
            totalSearches: data.searches.length,
            totalVisionAnalyses: data.vision.length,
            successfulRequests: data.latency.filter(l => l.success).length,
            failedRequests: data.latency.filter(l => !l.success).length
        };
    },

    getUptime() {
        const data = loadData();
        if (!data.latency.length) return 100;
        const successCount = data.latency.filter(l => l.success).length;
        return ((successCount / data.latency.length) * 100).toFixed(2);
    },

    getAvgResponseTime() {
        const data = loadData();
        if (!data.latency.length) return 0;
        const total = data.latency.reduce((sum, l) => sum + l.duration, 0);
        return (total / data.latency.length).toFixed(2);
    },

    getFailureRate() {
        const data = loadData();
        if (!data.latency.length) return 0;
        const failCount = data.latency.filter(l => !l.success).length;
        return ((failCount / data.latency.length) * 100).toFixed(2);
    },

    createMonitoringDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const metrics = this.getPerformanceMetrics();
        const uptime = this.getUptime();
        const avgResp = this.getAvgResponseTime();
        const failRate = this.getFailureRate();
        const errors = this.getErrorLogs(10);

        container.innerHTML = `
            <style>
                .sf-monitor-dashboard {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #0f1923, #1a2a3a);
                    border-radius: 16px;
                    padding: 28px;
                    color: #e8f0fe;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
                    border: 1px solid rgba(255,255,255,0.06);
                    max-width: 1100px;
                    margin: 0 auto;
                }
                .sf-monitor-dashboard h2 {
                    text-align: center;
                    color: #00e5a0;
                    font-size: 1.6rem;
                    margin-bottom: 24px;
                    letter-spacing: 1px;
                }
                .sf-monitor-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 28px;
                }
                .sf-monitor-card {
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 20px;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.08);
                    transition: transform 0.2s;
                }
                .sf-monitor-card:hover { transform: translateY(-2px); }
                .sf-monitor-card .label {
                    font-size: 0.82rem;
                    color: #8aa4c8;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .sf-monitor-card .value {
                    font-size: 1.8rem;
                    font-weight: 700;
                }
                .sf-monitor-card .value.green { color: #00e5a0; }
                .sf-monitor-card .value.red { color: #ff5c7a; }
                .sf-monitor-card .value.yellow { color: #ffc857; }
                .sf-monitor-card .value.blue { color: #5cb8ff; }
                .sf-monitor-section {
                    margin-top: 24px;
                }
                .sf-monitor-section h3 {
                    font-size: 1.05rem;
                    color: #5cb8ff;
                    margin-bottom: 12px;
                    border-bottom: 1px solid rgba(92,184,255,0.2);
                    padding-bottom: 6px;
                }
                .sf-monitor-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 0.88rem;
                }
                .sf-monitor-table th {
                    text-align: left;
                    padding: 10px 12px;
                    background: rgba(0,229,160,0.1);
                    color: #00e5a0;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .sf-monitor-table td {
                    padding: 9px 12px;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                    color: #c8d8ee;
                }
                .sf-monitor-table tr:hover td {
                    background: rgba(255,255,255,0.03);
                }
                .sf-monitor-bar {
                    width: 100%;
                    height: 10px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 5px;
                    overflow: hidden;
                    margin-top: 4px;
                }
                .sf-monitor-bar-fill {
                    height: 100%;
                    border-radius: 5px;
                    transition: width 0.5s ease;
                }
                .sf-monitor-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 24px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                .sf-monitor-btn {
                    padding: 10px 22px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .sf-monitor-btn-export {
                    background: #00e5a0;
                    color: #0f1923;
                }
                .sf-monitor-btn-export:hover { background: #00ffb8; }
                .sf-monitor-btn-clear {
                    background: #ff5c7a;
                    color: #fff;
                }
                .sf-monitor-btn-clear:hover { background: #ff7a93; }
                .sf-monitor-btn-refresh {
                    background: #5cb8ff;
                    color: #0f1923;
                }
                .sf-monitor-btn-refresh:hover { background: #7ecaff; }
            </style>

            <div class="sf-monitor-dashboard">
                <h2>SF AI মনিটরিং ড্যাশবোর্ড</h2>

                <div class="sf-monitor-cards">
                    <div class="sf-monitor-card">
                        <div class="label">আপটাইম</div>
                        <div class="value green">${uptime}%</div>
                        <div class="sf-monitor-bar"><div class="sf-monitor-bar-fill" style="width:${uptime}%;background:#00e5a0"></div></div>
                    </div>
                    <div class="sf-monitor-card">
                        <div class="label">গড় রেসপন্স সময়</div>
                        <div class="value blue">${avgResp}ms</div>
                    </div>
                    <div class="sf-monitor-card">
                        <div class="label">ব্যর্থতার হার</div>
                        <div class="value red">${failRate}%</div>
                    </div>
                    <div class="sf-monitor-card">
                        <div class="label">মোট ত্রুটি</div>
                        <div class="value yellow">${metrics.totalErrors}</div>
                    </div>
                    <div class="sf-monitor-card">
                        <div class="label">মোট অনুরোধ</div>
                        <div class="value blue">${metrics.totalRequests}</div>
                    </div>
                    <div class="sf-monitor-card">
                        <div class="label">সফল অনুরোধ</div>
                        <div class="value green">${metrics.successfulRequests}</div>
                    </div>
                </div>

                <div class="sf-monitor-section">
                    <h3>সাম্প্রতিক ত্রুটি (শেষ ১০টি)</h3>
                    ${errors.length ? `
                        <table class="sf-monitor-table">
                            <thead><tr><th>সময়</th><th>বার্তা</th><th>ব্যাকগ্রাউন্ড</th></tr></thead>
                            <tbody>
                                ${errors.reverse().map(e => `
                                    <tr>
                                        <td>${new Date(e.timestamp).toLocaleString('bn-BD')}</td>
                                        <td>${e.message.substring(0, 80)}</td>
                                        <td>${e.context.page || e.context.action || '—'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="color:#8aa4c8;text-align:center">কোনো ত্রুটি নেই।</p>'}
                </div>

                <div class="sf-monitor-section">
                    <h3>পারফরম্যান্স পরিসংখ্যান</h3>
                    <table class="sf-monitor-table">
                        <tbody>
                            <tr><td>AI গড় রেসপন্স সময়</td><td>${metrics.avgAIResponseTime.toFixed(2)}ms</td></tr>
                            <tr><td>সার্চ গড় সময়</td><td>${metrics.avgSearchDuration.toFixed(2)}ms</td></tr>
                            <tr><td>ভিশন গড় সময়</td><td>${metrics.avgVisionDuration.toFixed(2)}ms</td></tr>
                            <tr><td>মোট সার্চ</td><td>${metrics.totalSearches}</td></tr>
                            <tr><td>মোট ভিশন বিশ্লেষণ</td><td>${metrics.totalVisionAnalyses}</td></tr>
                        </tbody>
                    </table>
                </div>

                <div class="sf-monitor-actions">
                    <button class="sf-monitor-btn sf-monitor-btn-refresh" id="sf-mon-refresh">রিফ্রেশ</button>
                    <button class="sf-monitor-btn sf-monitor-btn-export" id="sf-mon-export">লগ এক্সপোর্ট</button>
                    <button class="sf-monitor-btn sf-monitor-btn-clear" id="sf-mon-clear">লগ মুছুন</button>
                </div>
            </div>
        `;

        const self = this;
        document.getElementById('sf-mon-refresh')?.addEventListener('click', () => {
            self.createMonitoringDashboard(containerId);
        });
        document.getElementById('sf-mon-export')?.addEventListener('click', () => {
            self.exportLogs();
        });
        document.getElementById('sf-mon-clear')?.addEventListener('click', () => {
            if (confirm('সব লগ মুছে ফেলতে চান?')) {
                self.clearLogs();
                self.createMonitoringDashboard(containerId);
            }
        });
    },

    exportLogs() {
        const data = loadData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sf-monitor-logs-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    clearLogs() {
        localStorage.removeItem(STORAGE_KEY);
        this.init();
    }
};
