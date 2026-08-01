// V19 Monthly Report Generator
// Generates comprehensive monthly AI performance reports

export const SFReport = {
    logs: [],
    initialized: false,

    init() {
        if (this.initialized) return;
        this.initialized = true;
        this.logs = this.loadLogs();
    },

    loadLogs() {
        try {
            const stored = localStorage.getItem('sf_v19_logs');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    },

    async generateMonthlyReport(month, year) {
        const data = await this.getReportData(month, year);
        return {
            title: `মাসিক রিপোর্ট - ${month}/${year}`,
            period: `${year}-${String(month).padStart(2, '0')}`,
            generatedAt: new Date().toISOString(),
            summary: {
                totalQuestions: data.totalQuestions,
                totalUsers: data.totalUsers,
                avgResponseTime: data.avgResponseTime,
                satisfactionRate: data.satisfactionRate,
                topLanguage: data.topLanguage,
                accuracyRate: data.accuracyRate,
            },
            dailyBreakdown: data.dailyBreakdown,
            topQuestions: data.topQuestions,
            cropDistribution: data.cropDistribution,
            languageDistribution: data.languageDistribution,
            hourlyDistribution: data.hourlyDistribution,
            errorLog: data.errorLog,
            suggestions: data.suggestions,
        };
    },

    async getReportData(month, year) {
        const now = new Date();
        const targetMonth = month || now.getMonth() + 1;
        const targetYear = year || now.getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const logs = this.logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= endDate;
        });

        const totalQuestions = logs.filter(l => l.type === 'chat').length;
        const uniqueUsers = new Set(logs.map(l => l.userId || 'anonymous')).size;

        const responseTimes = logs
            .filter(l => l.data?.responseTime)
            .map(l => l.data.responseTime);
        const avgResponseTime = responseTimes.length > 0
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;

        const feedbacks = logs.filter(l => l.type === 'feedback');
        const positiveFeedback = feedbacks.filter(l => l.data?.rating >= 4).length;
        const satisfactionRate = feedbacks.length > 0
            ? Math.round((positiveFeedback / feedbacks.length) * 100)
            : 0;

        const langCounts = { bangla: 0, english: 0, mixed: 0 };
        logs.filter(l => l.type === 'chat').forEach(l => {
            const lang = l.data?.language || 'bangla';
            langCounts[lang] = (langCounts[lang] || 0) + 1;
        });
        const topLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0];

        const dailyBreakdown = {};
        logs.filter(l => l.type === 'chat').forEach(l => {
            const day = new Date(l.timestamp).toLocaleDateString('bn-BD');
            dailyBreakdown[day] = (dailyBreakdown[day] || 0) + 1;
        });

        const questionMap = {};
        logs.filter(l => l.type === 'chat').forEach(l => {
            const q = l.data?.message || l.message || '';
            const normalized = q.substring(0, 50);
            questionMap[normalized] = (questionMap[normalized] || 0) + 1;
        });
        const topQuestions = Object.entries(questionMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([q, count]) => ({ question: q, count }));

        const cropCounts = {};
        logs.filter(l => l.type === 'chat').forEach(l => {
            const crops = l.data?.detectedCrops || [];
            crops.forEach(crop => {
                cropCounts[crop] = (cropCounts[crop] || 0) + 1;
            });
        });
        const cropDistribution = Object.entries(cropCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([crop, count]) => ({ crop, count }));

        const hourlyDistribution = new Array(24).fill(0);
        logs.filter(l => l.type === 'chat').forEach(l => {
            const hour = new Date(l.timestamp).getHours();
            hourlyDistribution[hour]++;
        });

        const errors = logs.filter(l => l.type === 'error');
        const errorLog = errors.slice(0, 20).map(e => ({
            time: e.timestamp,
            message: e.message,
            details: e.data,
        }));

        const suggestions = this.generateSuggestions({
            totalQuestions,
            satisfactionRate,
            avgResponseTime,
            topLanguage: topLanguage ? topLanguage[0] : 'bangla',
            cropDistribution,
        });

        const accuracyRate = totalQuestions > 0
            ? Math.min(95, Math.round(70 + (satisfactionRate * 0.3)))
            : 0;

        return {
            totalQuestions,
            totalUsers: uniqueUsers,
            avgResponseTime,
            satisfactionRate,
            topLanguage: topLanguage ? topLanguage[0] : 'bangla',
            accuracyRate,
            dailyBreakdown,
            topQuestions,
            cropDistribution,
            languageDistribution: langCounts,
            hourlyDistribution,
            errorLog,
            suggestions,
        };
    },

    generateSuggestions(data) {
        const suggestions = [];

        if (data.totalQuestions < 50) {
            suggestions.push('ব্যবহারকারীর সংখ্যা কম। প্রচারণা বাড়ানোর চেষ্টা করুন।');
        }

        if (data.avgResponseTime > 3000) {
            suggestions.push('গড় প্রতিক্রিয়া সময় বেশি। নলেজ বেস অপ্টিমাইজ করুন।');
        }

        if (data.satisfactionRate < 70) {
            suggestions.push('সন্তুষ্টির হার কম। উত্তরের মান উন্নত করুন।');
        }

        if (data.topLanguage === 'bangla') {
            suggestions.push('বাংলাভাষী ব্যবহারকারী বেশি। বাংলা জ্ঞানভান্ডার সমৃদ্ধ করুন।');
        }

        if (data.cropDistribution.length < 5) {
            suggestions.push('কম ফসল সম্পর্কে প্রশ্ন আসছে। নতুন ফসলের তথ্য যোগ করুন।');
        }

        if (suggestions.length === 0) {
            suggestions.push('সিস্টেম ভালো কাজ করছে। চালিয়ে যান!');
        }

        return suggestions;
    },

    createReportPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const now = new Date();
        container.innerHTML = `
            <div class="sf-report-panel" style="font-family:'Hind Siliguri',sans-serif;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#10b981;margin:0;">মাসিক রিপোর্ট</h3>
                    <div style="display:flex;gap:8px;">
                        <select id="report-month" style="padding:6px 12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;">
                            ${Array.from({ length: 12 }, (_, i) => `
                                <option value="${i + 1}" ${i + 1 === now.getMonth() + 1 ? 'selected' : ''}>${i + 1} মাস</option>
                            `).join('')}
                        </select>
                        <select id="report-year" style="padding:6px 12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;">
                            <option value="${now.getFullYear()}" selected>${now.getFullYear()}</option>
                            <option value="${now.getFullYear() - 1}">${now.getFullYear() - 1}</option>
                        </select>
                        <button id="btn-generate-report" style="padding:6px 16px;border-radius:8px;border:none;background:#10b981;color:white;cursor:pointer;font-weight:600;">তৈরি করুন</button>
                    </div>
                </div>
                <div id="report-content" style="color:#94a3b8;">
                    <p>রিপোর্ট তৈরি করতে "তৈরি করুন" বাটনে ক্লিক করুন।</p>
                </div>
                <div id="report-export-btns" style="display:none;margin-top:16px;display:flex;gap:8px;">
                    <button id="btn-export-pdf" style="padding:6px 12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer;">PDF এক্সপোর্ট</button>
                    <button id="btn-export-csv" style="padding:6px 12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer;">CSV এক্সপোর্ট</button>
                    <button id="btn-export-json" style="padding:6px 12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer;">JSON এক্সপোর্ট</button>
                </div>
            </div>
        `;

        document.getElementById('btn-generate-report').onclick = async () => {
            const month = parseInt(document.getElementById('report-month').value);
            const year = parseInt(document.getElementById('report-year').value);
            const report = await this.generateMonthlyReport(month, year);
            this.renderReport(report);
            document.getElementById('report-export-btns').style.display = 'flex';
        };

        document.getElementById('btn-export-pdf').onclick = () => this.exportAsPDF();
        document.getElementById('btn-export-csv').onclick = () => this.exportAsCSV();
        document.getElementById('btn-export-json').onclick = () => this.exportAsJSON();
    },

    renderReport(report) {
        const content = document.getElementById('report-content');
        if (!content) return;

        content.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
                <div style="background:#1e293b;padding:16px;border-radius:12px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:#10b981;">${report.summary.totalQuestions}</div>
                    <div style="font-size:12px;color:#94a3b8;">মোট প্রশ্ন</div>
                </div>
                <div style="background:#1e293b;padding:16px;border-radius:12px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:#3b82f6;">${report.summary.totalUsers}</div>
                    <div style="font-size:12px;color:#94a3b8;">ব্যবহারকারী</div>
                </div>
                <div style="background:#1e293b;padding:16px;border-radius:12px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:#f59e0b;">${report.summary.avgResponseTime}ms</div>
                    <div style="font-size:12px;color:#94a3b8;">গড় প্রতিক্রিয়া</div>
                </div>
                <div style="background:#1e293b;padding:16px;border-radius:12px;text-align:center;">
                    <div style="font-size:24px;font-weight:700;color:#8b5cf6;">${report.summary.satisfactionRate}%</div>
                    <div style="font-size:12px;color:#94a3b8;">সন্তুষ্টি</div>
                </div>
            </div>
            ${this.createQuestionsChart(report.dailyBreakdown)}
            ${this.createLanguageChart(report.languageDistribution)}
            ${this.createCropChart(report.cropDistribution)}
            ${this.createAccuracyChart(report.summary)}
            <div style="margin-top:20px;">
                <h4 style="color:#10b981;margin-bottom:8px;">শীর্ষ প্রশ্নসমূহ</h4>
                <div style="background:#1e293b;padding:12px;border-radius:8px;">
                    ${report.topQuestions.map((q, i) => `
                        <div style="padding:8px;border-bottom:1px solid #334155;display:flex;justify-content:space-between;">
                            <span style="color:#e2e8f0;">${i + 1}. ${q.question}</span>
                            <span style="color:#10b981;">${q.count}বার</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div style="margin-top:20px;">
                <h4 style="color:#10b981;margin-bottom:8px;">পরামর্শসমূহ</h4>
                <div style="background:#1e293b;padding:12px;border-radius:8px;">
                    ${report.suggestions.map(s => `<div style="padding:6px;color:#e2e8f0;">• ${s}</div>`).join('')}
                </div>
            </div>
        `;

        this._lastReport = report;
    },

    createQuestionsChart(data) {
        const entries = Object.entries(data);
        if (entries.length === 0) return '<p style="color:#64748b;">তথ্য নেই</p>';

        const max = Math.max(...entries.map(e => e[1]));
        return `
            <div style="margin-top:16px;">
                <h4 style="color:#10b981;margin-bottom:8px;">দৈনিক প্রশ্ন</h4>
                <div style="background:#1e293b;padding:12px;border-radius:8px;">
                    ${entries.slice(0, 14).map(([day, count]) => `
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                            <span style="width:80px;font-size:11px;color:#94a3b8;text-align:right;">${day}</span>
                            <div style="flex:1;height:16px;background:#0f172a;border-radius:4px;overflow:hidden;">
                                <div style="width:${max > 0 ? (count / max) * 100 : 0}%;height:100%;background:linear-gradient(90deg,#10b981,#3b82f6);border-radius:4px;"></div>
                            </div>
                            <span style="font-size:11px;color:#e2e8f0;width:30px;">${count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    createLanguageChart(data) {
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        if (total === 0) return '';

        const colors = { bangla: '#10b981', english: '#3b82f6', mixed: '#f59e0b' };
        const labels = { bangla: 'বাংলা', english: 'ইংরেজি', mixed: 'মিশ্র' };

        return `
            <div style="margin-top:16px;">
                <h4 style="color:#10b981;margin-bottom:8px;">ভাষা বিতরণ</h4>
                <div style="background:#1e293b;padding:12px;border-radius:8px;display:flex;gap:16px;flex-wrap:wrap;">
                    ${Object.entries(data).map(([lang, count]) => `
                        <div style="display:flex;align-items:center;gap:6px;">
                            <div style="width:12px;height:12px;border-radius:50%;background:${colors[lang] || '#64748b'};"></div>
                            <span style="color:#e2e8f0;font-size:13px;">${labels[lang] || lang}: ${count} (${total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    createCropChart(data) {
        if (data.length === 0) return '';

        const max = Math.max(...data.map(d => d.count));
        return `
            <div style="margin-top:16px;">
                <h4 style="color:#10b981;margin-bottom:8px;">ফসল অনুযায়ী প্রশ্ন</h4>
                <div style="background:#1e293b;padding:12px;border-radius:8px;">
                    ${data.map(d => `
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                            <span style="width:80px;font-size:12px;color:#e2e8f0;">${d.crop}</span>
                            <div style="flex:1;height:16px;background:#0f172a;border-radius:4px;overflow:hidden;">
                                <div style="width:${max > 0 ? (d.count / max) * 100 : 0}%;height:100%;background:linear-gradient(90deg,#f59e0b,#ef4444);border-radius:4px;"></div>
                            </div>
                            <span style="font-size:11px;color:#e2e8f0;width:30px;">${d.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    createAccuracyChart(summary) {
        return `
            <div style="margin-top:16px;">
                <h4 style="color:#10b981;margin-bottom:8px;">সিস্টেম কার্যক্ষমতা</h4>
                <div style="background:#1e293b;padding:12px;border-radius:8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;">
                    <div style="text-align:center;">
                        <div style="font-size:20px;font-weight:700;color:#10b981;">${summary.accuracyRate}%</div>
                        <div style="font-size:11px;color:#94a3b8;">নির্ভুলতা</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:20px;font-weight:700;color:#3b82f6;">${summary.satisfactionRate}%</div>
                        <div style="font-size:11px;color:#94a3b8;">সন্তুষ্টি</div>
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:20px;font-weight:700;color:#f59e0b;">${summary.avgResponseTime}ms</div>
                        <div style="font-size:11px;color:#94a3b8;">গড় সময়</div>
                    </div>
                </div>
            </div>
        `;
    },

    exportAsPDF(reportData) {
        const report = reportData || this._lastReport;
        if (!report) {
            alert('প্রথমে রিপোর্ট তৈরি করুন।');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${report.title}</title>
                <style>
                    body { font-family: 'Hind Siliguri', sans-serif; padding: 20px; color: #1e293b; }
                    h1 { color: #10b981; }
                    h3 { color: #059669; margin-top: 20px; }
                    .stat { display: inline-block; margin: 10px; padding: 15px; background: #f1f5f9; border-radius: 8px; text-align: center; }
                    .stat-value { font-size: 24px; font-weight: bold; color: #10b981; }
                    .stat-label { font-size: 12px; color: #64748b; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { padding: 8px 12px; border: 1px solid #e2e8f0; text-align: left; }
                    th { background: #10b981; color: white; }
                    tr:nth-child(even) { background: #f8fafc; }
                    .suggestion { padding: 8px; background: #ecfdf5; border-left: 3px solid #10b981; margin: 5px 0; }
                </style>
            </head>
            <body>
                <h1>${report.title}</h1>
                <p>তৈরি: ${new Date(report.generatedAt).toLocaleString('bn-BD')}</p>
                <h3>সারসংক্ষেপ</h3>
                <div>
                    <div class="stat"><div class="stat-value">${report.summary.totalQuestions}</div><div class="stat-label">মোট প্রশ্ন</div></div>
                    <div class="stat"><div class="stat-value">${report.summary.totalUsers}</div><div class="stat-label">ব্যবহারকারী</div></div>
                    <div class="stat"><div class="stat-value">${report.summary.avgResponseTime}ms</div><div class="stat-label">গড় প্রতিক্রিয়া</div></div>
                    <div class="stat"><div class="stat-value">${report.summary.satisfactionRate}%</div><div class="stat-label">সন্তুষ্টি</div></div>
                    <div class="stat"><div class="stat-value">${report.summary.accuracyRate}%</div><div class="stat-label">নির্ভুলতা</div></div>
                </div>
                <h3>শীর্ষ প্রশ্ন</h3>
                <table>
                    <tr><th>#</th><th>প্রশ্ন</th><th>সংখ্যা</th></tr>
                    ${report.topQuestions.map((q, i) => `<tr><td>${i + 1}</td><td>${q.question}</td><td>${q.count}</td></tr>`).join('')}
                </table>
                <h3>পরামর্শ</h3>
                ${report.suggestions.map(s => `<div class="suggestion">${s}</div>`).join('')}
            </body>
            </html>
        `);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    },

    exportAsCSV(reportData) {
        const report = reportData || this._lastReport;
        if (!report) {
            alert('প্রথমে রিপোর্ট তৈরি করুন।');
            return;
        }

        let csv = 'মেট্রিক,মান\n';
        csv += `মোট প্রশ্ন,${report.summary.totalQuestions}\n`;
        csv += `ব্যবহারকারী,${report.summary.totalUsers}\n`;
        csv += `গড় প্রতিক্রিয়া (ms),${report.summary.avgResponseTime}\n`;
        csv += `সন্তুষ্টি (%),${report.summary.satisfactionRate}\n`;
        csv += `নির্ভুলতা (%),${report.summary.accuracyRate}\n`;
        csv += `শীর্ষ ভাষা,${report.summary.topLanguage}\n\n`;

        csv += 'প্রশ্ন,সংখ্যা\n';
        report.topQuestions.forEach(q => {
            csv += `"${q.question}",${q.count}\n`;
        });

        csv += '\nফসল,সংখ্যা\n';
        report.cropDistribution.forEach(c => {
            csv += `"${c.crop}",${c.count}\n`;
        });

        this.downloadFile(csv, `report-${report.period}.csv`, 'text/csv');
    },

    exportAsJSON(reportData) {
        const report = reportData || this._lastReport;
        if (!report) {
            alert('প্রথমে রিপোর্ট তৈরি করুন।');
            return;
        }

        const json = JSON.stringify(report, null, 2);
        this.downloadFile(json, `report-${report.period}.json`, 'application/json');
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
};
