// V22 Enterprise Monitoring
export const SFMonitorEnterprise = {
    init() {
        this.apiMetrics = new Map();
        this.crashReports = [];
        this.usageStats = new Map();
        this.performanceMetrics = new Map();
        this.healthStatus = 'healthy';
        this.lastHealthCheck = Date.now();
        this.maxCrashReports = 100;
        this.maxMetrics = 1000;
        
        this.startHealthCheck();
        this.setupErrorHandlers();
    },
    
    startHealthCheck() {
        setInterval(() => this.healthCheck(), 300000); // Every 5 minutes
    },
    
    setupErrorHandlers() {
        if (typeof window !== 'undefined') {
            window.addEventListener('error', (e) => {
                this.captureError(e.error, { type: 'window_error', filename: e.filename });
            });
            
            window.addEventListener('unhandledrejection', (e) => {
                this.captureError(e.reason, { type: 'unhandled_rejection' });
            });
        }
    },
    
    async healthCheck() {
        const checks = {
            timestamp: Date.now(),
            api: await this.checkAPIHealth(),
            memory: this.checkMemoryHealth(),
            storage: this.checkStorageHealth(),
            network: this.checkNetworkHealth()
        };
        
        const allHealthy = Object.values(checks).every(check => 
            check === true || (typeof check === 'object' && check.status === 'healthy')
        );
        
        this.healthStatus = allHealthy ? 'healthy' : 'degraded';
        this.lastHealthCheck = Date.now();
        
        this.trackPerformance('health_check', checks);
        
        return checks;
    },
    
    async checkAPIHealth() {
        try {
            const start = Date.now();
            const response = await fetch('/api/health', { 
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            const duration = Date.now() - start;
            
            return {
                status: response.ok ? 'healthy' : 'unhealthy',
                statusCode: response.status,
                responseTime: duration
            };
        } catch (error) {
            return { status: 'unreachable', error: error.message };
        }
    },
    
    checkMemoryHealth() {
        if (typeof performance !== 'undefined' && performance.memory) {
            const usage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            return {
                status: usage < 0.8 ? 'healthy' : 'warning',
                usage: Math.round(usage * 100),
                heapSize: performance.memory.usedJSHeapSize
            };
        }
        return { status: 'unknown' };
    },
    
    checkStorageHealth() {
        try {
            localStorage.setItem('health_check', 'test');
            localStorage.removeItem('health_check');
            return { status: 'healthy' };
        } catch (error) {
            return { status: 'unavailable', error: error.message };
        }
    },
    
    checkNetworkHealth() {
        if (typeof navigator !== 'undefined' && navigator.onLine !== undefined) {
            return {
                status: navigator.onLine ? 'healthy' : 'offline',
                online: navigator.onLine,
                connection: navigator.connection ? {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink
                } : null
            };
        }
        return { status: 'unknown' };
    },
    
    trackAPI(endpoint, duration, status) {
        if (this.apiMetrics.size >= this.maxMetrics) {
            this.apiMetrics.clear();
        }
        
        const key = `${endpoint}:${status}`;
        const existing = this.apiMetrics.get(key) || {
            count: 0,
            totalDuration: 0,
            minDuration: Infinity,
            maxDuration: 0,
            lastSeen: Date.now()
        };
        
        this.apiMetrics.set(key, {
            count: existing.count + 1,
            totalDuration: existing.totalDuration + duration,
            minDuration: Math.min(existing.minDuration, duration),
            maxDuration: Math.max(existing.maxDuration, duration),
            avgDuration: (existing.totalDuration + duration) / (existing.count + 1),
            lastSeen: Date.now()
        });
    },
    
    getAPIMetrics() {
        const metrics = {};
        for (const [key, value] of this.apiMetrics) {
            const [endpoint, status] = key.split(':');
            if (!metrics[endpoint]) metrics[endpoint] = {};
            metrics[endpoint][status] = value;
        }
        return metrics;
    },
    
    captureError(error, context = {}) {
        if (this.crashReports.length >= this.maxCrashReports) {
            this.crashReports.shift();
        }
        
        const report = {
            id: this.generateId(),
            timestamp: Date.now(),
            message: error.message || String(error),
            stack: error.stack,
            context,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown'
        };
        
        this.crashReports.push(report);
        this.sendErrorReport(report);
        
        return report.id;
    },
    
    async sendErrorReport(report) {
        try {
            await fetch('/api/errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report)
            });
        } catch (e) {
            console.warn('Failed to send error report:', e);
        }
    },
    
    getCrashReports() {
        return [...this.crashReports];
    },
    
    trackUsage(feature, userId = 'anonymous') {
        const key = `${feature}:${userId}`;
        const existing = this.usageStats.get(key) || { count: 0, firstUsed: Date.now() };
        
        this.usageStats.set(key, {
            ...existing,
            count: existing.count + 1,
            lastUsed: Date.now()
        });
    },
    
    getUsageStats() {
        const stats = {};
        for (const [key, value] of this.usageStats) {
            const [feature, userId] = key.split(':');
            if (!stats[feature]) stats[feature] = { totalUsers: 0, totalUsage: 0 };
            stats[feature].totalUsers++;
            stats[feature].totalUsage += value.count;
        }
        return stats;
    },
    
    trackPerformance(metric, value) {
        if (this.performanceMetrics.size >= this.maxMetrics) {
            this.performanceMetrics.clear();
        }
        
        const existing = this.performanceMetrics.get(metric) || {
            values: [],
            count: 0
        };
        
        existing.values.push({ value, timestamp: Date.now() });
        if (existing.values.length > 100) existing.values.shift();
        
        this.performanceMetrics.set(metric, {
            ...existing,
            count: existing.count + 1,
            latest: value,
            avg: existing.values.reduce((a, b) => a + b.value, 0) / existing.values.length
        });
    },
    
    getPerformanceReport() {
        const report = {};
        for (const [metric, data] of this.performanceMetrics) {
            report[metric] = {
                count: data.count,
                latest: data.latest,
                avg: data.avg,
                min: Math.min(...data.values.map(v => v.value)),
                max: Math.max(...data.values.map(v => v.value))
            };
        }
        return report;
    },
    
    createDashboard(containerId) {
        if (typeof document === 'undefined') return null;
        
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        const dashboard = document.createElement('div');
        dashboard.className = 'sf-monitor-dashboard';
        dashboard.innerHTML = `
            <style>
                .sf-monitor-dashboard {
                    font-family: monospace;
                    padding: 20px;
                    background: #1a1a1a;
                    color: #0f0;
                    border-radius: 8px;
                    max-width: 800px;
                }
                .sf-monitor-section {
                    margin-bottom: 20px;
                    padding: 15px;
                    background: #2a2a2a;
                    border-radius: 4px;
                }
                .sf-monitor-title {
                    color: #0ff;
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                .sf-monitor-status {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                }
                .sf-monitor-status.healthy { background: #0f0; color: #000; }
                .sf-monitor-status.degraded { background: #ff0; color: #000; }
                .sf-monitor-status.unhealthy { background: #f00; color: #fff; }
            </style>
            <div class="sf-monitor-section">
                <div class="sf-monitor-title">System Health</div>
                <span class="sf-monitor-status ${this.healthStatus}">${this.healthStatus}</span>
                <div>Last check: ${new Date(this.lastHealthCheck).toLocaleTimeString()}</div>
            </div>
            <div class="sf-monitor-section">
                <div class="sf-monitor-title">API Metrics</div>
                <div id="sf-api-metrics"></div>
            </div>
            <div class="sf-monitor-section">
                <div class="sf-monitor-title">Recent Errors</div>
                <div id="sf-crash-reports"></div>
            </div>
            <div class="sf-monitor-section">
                <div class="sf-monitor-title">Usage Statistics</div>
                <div id="sf-usage-stats"></div>
            </div>
        `;
        
        container.appendChild(dashboard);
        this.updateDashboard(dashboard);
        
        setInterval(() => this.updateDashboard(dashboard), 30000);
        
        return dashboard;
    },
    
    updateDashboard(dashboard) {
        const apiMetrics = this.getAPIMetrics();
        const crashReports = this.getCrashReports().slice(-5);
        const usageStats = this.getUsageStats();
        
        const apiDiv = dashboard.querySelector('#sf-api-metrics');
        if (apiDiv) {
            apiDiv.innerHTML = Object.entries(apiMetrics).map(([endpoint, statuses]) => `
                <div><strong>${endpoint}</strong></div>
                ${Object.entries(statuses).map(([status, data]) => 
                    `<div>${status}: ${data.count} calls, avg ${data.avgDuration.toFixed(0)}ms</div>`
                ).join('')}
            `).join('') || '<div>No API metrics yet</div>';
        }
        
        const crashDiv = dashboard.querySelector('#sf-crash-reports');
        if (crashDiv) {
            crashDiv.innerHTML = crashReports.map(report => `
                <div style="margin-bottom: 8px; padding: 8px; background: #3a2a2a; border-radius: 3px;">
                    <div>${new Date(report.timestamp).toLocaleTimeString()}</div>
                    <div>${report.message}</div>
                </div>
            `).join('') || '<div>No errors recorded</div>';
        }
        
        const usageDiv = dashboard.querySelector('#sf-usage-stats');
        if (usageDiv) {
            usageDiv.innerHTML = Object.entries(usageStats).map(([feature, data]) => `
                <div>${feature}: ${data.totalUsage} uses across ${data.totalUsers} users</div>
            `).join('') || '<div>No usage data yet</div>';
        }
    },
    
    exportReport(format = 'json') {
        const report = {
            timestamp: Date.now(),
            healthStatus: this.healthStatus,
            apiMetrics: this.getAPIMetrics(),
            crashReports: this.getCrashReports(),
            usageStats: this.getUsageStats(),
            performanceReport: this.getPerformanceReport()
        };
        
        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(report);
        }
        
        return report;
    },
    
    convertToCSV(data) {
        const rows = [];
        rows.push('Metric,Value');
        
        rows.push(`Health Status,${data.healthStatus}`);
        rows.push(`Timestamp,${new Date(data.timestamp).toISOString()}`);
        
        for (const [endpoint, statuses] of Object.entries(data.apiMetrics)) {
            for (const [status, metrics] of Object.entries(statuses)) {
                rows.push(`${endpoint} (${status}),${metrics.count} calls, avg ${metrics.avgDuration}ms`);
            }
        }
        
        return rows.join('\n');
    },
    
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    getSummary() {
        return {
            healthStatus: this.healthStatus,
            lastHealthCheck: this.lastHealthCheck,
            totalErrors: this.crashReports.length,
            totalAPICalls: Array.from(this.apiMetrics.values())
                .reduce((sum, m) => sum + m.count, 0),
            totalFeaturesTracked: this.usageStats.size
        };
    }
};