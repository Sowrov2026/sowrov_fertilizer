/**
 * V21 Knowledge Reports — SF AI Knowledge Universe
 * Bangla UI text throughout
 */
export const SFKReport = {
    _initialized: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;
        console.log('SFKReport initialized');
    },

    // ──────────── Knowledge Stats ────────────

    async getKnowledgeStats() {
        const entries = this._getEntries();
        const categories = {};
        const tagMap = {};
        let totalWords = 0;

        for (const e of entries) {
            categories[e.category || 'general'] = (categories[e.category || 'general'] || 0) + 1;
            totalWords += (e.content || '').split(/\s+/).filter(Boolean).length;
            (e.tags || []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; });
        }

        const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 20);
        const avgWords = entries.length ? Math.round(totalWords / entries.length) : 0;

        return {
            totalEntries: entries.length,
            totalWords,
            avgWordsPerEntry: avgWords,
            categories,
            topTags,
            lastUpdated: entries.reduce((max, e) => Math.max(max, e.updatedAt || 0), 0)
        };
    },

    createStatsPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div style="padding:20px;color:#94a3b8;">পরিসংখ্যান লোড হচ্ছে...</div>';

        this.getKnowledgeStats().then(stats => {
            const catColors = {
                general: '#6366f1', fertilizer: '#22c55e', crop: '#eab308',
                soil: '#a16207', pest: '#ef4444', weather: '#3b82f6',
                market: '#f59e0b', technique: '#8b5cf6'
            };
            const catNames = {
                general: 'সাধারণ', fertilizer: 'সার', crop: 'ফসল',
                soil: 'মাটি', pest: 'পোকা-মাকড়', weather: 'আবহাওয়া',
                market: 'বাজার', technique: 'কৌশল'
            };

            container.innerHTML = `
            <div style="padding:20px;">
                <h3 style="color:#e2e8f0;margin:0 0 20px;">জ্ঞান ভান্ডার — পরিসংখ্যান</h3>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px;">
                    <div style="background:#0f172a;padding:18px;border-radius:12px;text-align:center;">
                        <div style="color:#8b5cf6;font-size:28px;font-weight:700;">${stats.totalEntries}</div>
                        <div style="color:#94a3b8;font-size:13px;margin-top:4px;">মোট এন্ট্রি</div>
                    </div>
                    <div style="background:#0f172a;padding:18px;border-radius:12px;text-align:center;">
                        <div style="color:#22c55e;font-size:28px;font-weight:700;">${stats.totalWords.toLocaleString()}</div>
                        <div style="color:#94a3b8;font-size:13px;margin-top:4px;">মোট শব্দ</div>
                    </div>
                    <div style="background:#0f172a;padding:18px;border-radius:12px;text-align:center;">
                        <div style="color:#f59e0b;font-size:28px;font-weight:700;">${stats.avgWordsPerEntry}</div>
                        <div style="color:#94a3b8;font-size:13px;margin-top:4px;">গড় শব্দ/এন্ট্রি</div>
                    </div>
                    <div style="background:#0f172a;padding:18px;border-radius:12px;text-align:center;">
                        <div style="color:#ef4444;font-size:28px;font-weight:700;">${stats.topTags.length}</div>
                        <div style="color:#94a3b8;font-size:13px;margin-top:4px;">বিশিষ্ট ট্যাগ</div>
                    </div>
                </div>
                <h4 style="color:#e2e8f0;margin:0 0 12px;">ক্যাটাগরি অনুযায়ী বণ্টন</h4>
                <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:24px;">
                    ${Object.entries(stats.categories).map(([cat, count]) => {
                        const pct = stats.totalEntries ? Math.round(count / stats.totalEntries * 100) : 0;
                        const color = catColors[cat] || '#6366f1';
                        return `<div style="display:flex;align-items:center;gap:12px;">
                            <div style="width:100px;text-align:right;color:#94a3b8;font-size:13px;">${catNames[cat] || cat}</div>
                            <div style="flex:1;background:#1e293b;border-radius:6px;height:24px;overflow:hidden;">
                                <div style="width:${pct}%;background:${color};height:100%;border-radius:6px;transition:width 0.5s;"></div>
                            </div>
                            <div style="width:60px;color:#e2e8f0;font-size:13px;font-weight:600;">${count} (${pct}%)</div>
                        </div>`;
                    }).join('')}
                </div>
                <h4 style="color:#e2e8f0;margin:0 0 12px;">শীর্ষ ট্যাগ</h4>
                <div style="display:flex;flex-wrap:wrap;gap:8px;">
                    ${stats.topTags.map(([tag, count]) => `
                        <span style="background:#1e293b;color:#e2e8f0;padding:6px 12px;border-radius:20px;font-size:13px;">
                            ${this._esc(tag)} <span style="color:#8b5cf6;">(${count})</span>
                        </span>`).join('')}
                </div>
                ${stats.lastUpdated ? `<div style="color:#64748b;font-size:12px;margin-top:20px;">শেষ আপডেট: ${new Date(stats.lastUpdated).toLocaleString('bn-BD')}</div>` : ''}
            </div>`;
        });
    },

    // ──────────── Coverage Report ────────────

    async getCoverageReport() {
        const entries = this._getEntries();
        const topicHints = [
            'সার', 'NPK', 'ইউরিয়া', 'ডাবল সুপার ফসফেট', 'পটাশ',
            'ধান', 'গম', 'ভুটিয়া', 'সরিষা', 'পাট',
            'মাটি পরীক্ষা', 'pH', 'কম্পোস্ট', 'বর্জ্য',
            'পোকা', 'রোগ', 'কীটনাশক', 'ছত্রাকনাশক',
            'আবহাওয়া', 'বৃষ্টি', 'সেচ', 'পানি',
            'বাজার', 'মূল্য', 'রপ্তানি', 'তালিকা',
            'FYM', 'জৈব সার', 'মাইকোরাইজা', 'রাইজোবিয়াম'
        ];
        const covered = {};
        const contentLower = entries.map(e => (e.content + ' ' + e.title).toLowerCase());

        for (const hint of topicHints) {
            const lower = hint.toLowerCase();
            covered[hint] = contentLower.some(c => c.includes(lower));
        }

        const total = topicHints.length;
        const coveredCount = Object.values(covered).filter(Boolean).length;
        return { total, coveredCount, percentage: total ? Math.round(coveredCount / total * 100) : 0, details: covered };
    },

    createCoveragePanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div style="padding:20px;color:#94a3b8;">কভারেজ রিপোর্ট তৈরি হচ্ছে...</div>';

        this.getCoverageReport().then(report => {
            container.innerHTML = `
            <div style="padding:20px;">
                <h3 style="color:#e2e8f0;margin:0 0 16px;">বিষয় কভারেজ রিপোর্ট</h3>
                <div style="background:#0f172a;padding:20px;border-radius:12px;margin-bottom:20px;text-align:center;">
                    <div style="font-size:42px;font-weight:700;color:${report.percentage >= 70 ? '#22c55e' : report.percentage >= 40 ? '#f59e0b' : '#ef4444'};">${report.percentage}%</div>
                    <div style="color:#94a3b8;font-size:14px;margin-top:4px;">${report.coveredCount} / ${report.total} বিষয় কভার করা হয়েছে</div>
                    <div style="width:100%;background:#1e293b;border-radius:8px;height:12px;margin-top:12px;overflow:hidden;">
                        <div style="width:${report.percentage}%;background:${report.percentage >= 70 ? '#22c55e' : report.percentage >= 40 ? '#f59e0b' : '#ef4444'};height:100%;border-radius:8px;"></div>
                    </div>
                </div>
                <h4 style="color:#e2e8f0;margin:0 0 12px;">বিষয় অনুযায়ী অবস্থা</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
                    ${Object.entries(report.details).map(([topic, ok]) => `
                        <div style="background:#0f172a;padding:10px 14px;border-radius:8px;display:flex;align-items:center;gap:8px;border-left:3px solid ${ok ? '#22c55e' : '#ef4444'};">
                            <span style="color:${ok ? '#22c55e' : '#ef4444'};">${ok ? '✓' : '✗'}</span>
                            <span style="color:#e2e8f0;font-size:13px;">${this._esc(topic)}</span>
                        </div>`).join('')}
                </div>
            </div>`;
        });
    },

    // ──────────── Missing Topics ────────────

    async findMissingTopics() {
        const report = await this.getCoverageReport();
        return Object.entries(report.details).filter(([, covered]) => !covered).map(([topic]) => topic);
    },

    createMissingPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div style="padding:20px;color:#94a3b8;">অনুপস্থিত বিষয় খুঁজে বের করা হচ্ছে...</div>';

        this.findMissingTopics().then(topics => {
            container.innerHTML = `
            <div style="padding:20px;">
                <h3 style="color:#e2e8f0;margin:0 0 16px;">অনুপস্থিত বিষয়</h3>
                ${topics.length === 0
                    ? '<div style="background:#0f172a;padding:20px;border-radius:12px;text-align:center;color:#22c55e;">সকল প্রধান বিষয় কভার করা হয়েছে!</div>'
                    : `<div style="background:#0f172a;padding:16px;border-radius:12px;border-left:3px solid #ef4444;">
                        <p style="color:#e2e8f0;margin:0 0 12px;font-size:14px;">নিম্নলিখিত ${topics.length}টি বিষয় জ্ঞান ভান্ডারে অনুপস্থিত:</p>
                        <div style="display:flex;flex-wrap:wrap;gap:8px;">
                            ${topics.map(t => `<span style="background:#1e293b;color:#ef4444;padding:6px 14px;border-radius:20px;font-size:13px;">${this._esc(t)}</span>`).join('')}
                        </div>
                       </div>
                       <div style="margin-top:16px;color:#64748b;font-size:13px;">এই বিষয়গুলো সম্পর্কে জ্ঞান যোগ করলে সিস্টেম আরও কার্যকর হবে।</div>`
                }
            </div>`;
        });
    },

    // ──────────── Duplicate Topics ────────────

    async findDuplicateTopics() {
        const entries = this._getEntries();
        const dupes = [];
        const used = new Set();

        for (let i = 0; i < entries.length; i++) {
            if (used.has(i)) continue;
            const a = entries[i];
            for (let j = i + 1; j < entries.length; j++) {
                if (used.has(j)) continue;
                const b = entries[j];
                if (this._titleSimilarity(a.title, b.title) > 0.6) {
                    dupes.push({ pair: [a, b], similarity: Math.round(this._titleSimilarity(a.title, b.title) * 100) });
                    used.add(i);
                    used.add(j);
                }
            }
        }
        return dupes;
    },

    createDuplicatePanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div style="padding:20px;color:#94a3b8;">ডুপ্লিকেট বিষয় খুঁজে বের করা হচ্ছে...</div>';

        this.findDuplicateTopics().then(dupes => {
            container.innerHTML = `
            <div style="padding:20px;">
                <h3 style="color:#e2e8f0;margin:0 0 16px;">সম্ভাব্য ডুপ্লিকেট বিষয়</h3>
                ${dupes.length === 0
                    ? '<div style="background:#0f172a;padding:20px;border-radius:12px;text-align:center;color:#22c55e;">কোনো ডুপ্লিকেট পাওয়া যায়নি!</div>'
                    : dupes.map(d => `
                        <div style="background:#0f172a;padding:14px;border-radius:12px;margin-bottom:10px;border-left:3px solid #f59e0b;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span style="color:#f59e0b;font-size:13px;font-weight:600;">${d.similarity}% মিল</span>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                                    <div style="color:#ef4444;font-size:12px;margin-bottom:4px;">এন্ট্রি ১</div>
                                    <div style="color:#e2e8f0;font-size:13px;">${this._esc(d.pair[0].title)}</div>
                                    <div style="color:#64748b;font-size:11px;">${d.pair[0].id}</div>
                                </div>
                                <div style="background:#1e293b;padding:10px;border-radius:8px;">
                                    <div style="color:#22c55e;font-size:12px;margin-bottom:4px;">এন্ট্রি ২</div>
                                    <div style="color:#e2e8f0;font-size:13px;">${this._esc(d.pair[1].title)}</div>
                                    <div style="color:#64748b;font-size:11px;">${d.pair[1].id}</div>
                                </div>
                            </div>
                        </div>`).join('')
                }
            </div>`;
        });
    },

    // ──────────── Source Distribution ────────────

    async getSourceDistribution() {
        const entries = this._getEntries();
        const sources = {};
        for (const e of entries) {
            const src = e.source || 'অজ্ঞাত';
            sources[src] = (sources[src] || 0) + 1;
        }
        return Object.entries(sources).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count }));
    },

    createSourcePanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div style="padding:20px;color:#94a3b8;">উৎস পরিসংখ্যান লোড হচ্ছে...</div>';

        this.getSourceDistribution().then(sources => {
            const total = sources.reduce((s, d) => s + d.count, 0);
            const colors = ['#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#6366f1'];

            container.innerHTML = `
            <div style="padding:20px;">
                <h3 style="color:#e2e8f0;margin:0 0 16px;">উৎস বণ্টন</h3>
                ${sources.length === 0
                    ? '<div style="background:#0f172a;padding:20px;border-radius:12px;text-align:center;color:#64748b;">কোনো ডাটা নেই</div>'
                    : `<div style="background:#0f172a;padding:20px;border-radius:12px;">
                        ${sources.map((s, i) => {
                            const pct = total ? Math.round(s.count / total * 100) : 0;
                            return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
                                <div style="width:120px;text-align:right;color:#94a3b8;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${this._esc(s.source)}">${this._esc(s.source)}</div>
                                <div style="flex:1;background:#1e293b;border-radius:6px;height:22px;overflow:hidden;">
                                    <div style="width:${pct}%;background:${colors[i % colors.length]};height:100%;border-radius:6px;"></div>
                                </div>
                                <div style="width:80px;color:#e2e8f0;font-size:13px;font-weight:600;">${s.count} (${pct}%)</div>
                            </div>`;
                        }).join('')}
                       </div>`
                }
            </div>`;
        });
    },

    // ──────────── Full Report ────────────

    async generateFullReport() {
        const [stats, coverage, missing, dupes, sources] = await Promise.all([
            this.getKnowledgeStats(),
            this.getCoverageReport(),
            this.findMissingTopics(),
            this.findDuplicateTopics(),
            this.getSourceDistribution()
        ]);
        return { generatedAt: new Date().toISOString(), stats, coverage, missing, duplicates: dupes, sources };
    },

    createFullReport(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;"><div style="font-size:18px;margin-bottom:8px;">সম্পূর্ণ রিপোর্ট তৈরি হচ্ছে...</div><div style="color:#64748b;">অনুগ্রহ করে অপেক্ষা করুন</div></div>';

        this.generateFullReport().then(report => {
            container.innerHTML = `
            <div style="padding:24px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
                    <h2 style="color:#8b5cf6;margin:0;">সম্পূর্ণ জ্ঞান রিপোর্ট</h2>
                    <div style="display:flex;gap:8px;">
                        <button id="sfk-export-json" style="background:#22c55e;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">JSON</button>
                        <button id="sfk-export-csv" style="background:#3b82f6;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">CSV</button>
                        <button id="sfk-export-print" style="background:#f59e0b;color:#0f172a;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">প্রিন্ট</button>
                    </div>
                </div>
                <div style="color:#64748b;font-size:12px;margin-bottom:20px;">তৈরি: ${new Date(report.generatedAt).toLocaleString('bn-BD')}</div>

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
                    <div style="background:#0f172a;padding:16px;border-radius:10px;text-align:center;">
                        <div style="color:#8b5cf6;font-size:26px;font-weight:700;">${report.stats.totalEntries}</div>
                        <div style="color:#94a3b8;font-size:12px;">মোট এন্ট্রি</div>
                    </div>
                    <div style="background:#0f172a;padding:16px;border-radius:10px;text-align:center;">
                        <div style="color:#22c55e;font-size:26px;font-weight:700;">${report.coverage.percentage}%</div>
                        <div style="color:#94a3b8;font-size:12px;">কভারেজ</div>
                    </div>
                    <div style="background:#0f172a;padding:16px;border-radius:10px;text-align:center;">
                        <div style="color:#ef4444;font-size:26px;font-weight:700;">${report.missing.length}</div>
                        <div style="color:#94a3b8;font-size:12px;">অনুপস্থিত বিষয়</div>
                    </div>
                    <div style="background:#0f172a;padding:16px;border-radius:10px;text-align:center;">
                        <div style="color:#f59e0b;font-size:26px;font-weight:700;">${report.duplicates.length}</div>
                        <div style="color:#94a3b8;font-size:12px;">ডুপ্লিকেট</div>
                    </div>
                </div>

                <div style="margin-bottom:20px;">
                    <h4 style="color:#e2e8f0;margin:0 0 10px;">ক্যাটাগরি বণ্টন</h4>
                    <div style="background:#0f172a;padding:14px;border-radius:10px;display:flex;gap:12px;flex-wrap:wrap;">
                        ${Object.entries(report.stats.categories).map(([c, n]) => `<span style="background:#1e293b;color:#e2e8f0;padding:6px 14px;border-radius:20px;font-size:13px;">${this._esc(c)}: <strong>${n}</strong></span>`).join('')}
                    </div>
                </div>

                ${report.missing.length ? `
                <div style="margin-bottom:20px;">
                    <h4 style="color:#ef4444;margin:0 0 10px;">অনুপস্থিত বিষয় (${report.missing.length})</h4>
                    <div style="background:#0f172a;padding:14px;border-radius:10px;display:flex;gap:8px;flex-wrap:wrap;">
                        ${report.missing.map(t => `<span style="background:#1e293b;color:#ef4444;padding:5px 12px;border-radius:16px;font-size:12px;">${this._esc(t)}</span>`).join('')}
                    </div>
                </div>` : ''}

                ${report.duplicates.length ? `
                <div style="margin-bottom:20px;">
                    <h4 style="color:#f59e0b;margin:0 0 10px;">ডুপ্লিকেট জুটি (${report.duplicates.length})</h4>
                    ${report.duplicates.map(d => `
                        <div style="background:#0f172a;padding:10px 14px;border-radius:8px;margin-bottom:6px;border-left:3px solid #f59e0b;">
                            <span style="color:#e2e8f0;font-size:13px;">${this._esc(d.pair[0].title)}</span>
                            <span style="color:#64748b;font-size:12px;"> ↔ </span>
                            <span style="color:#e2e8f0;font-size:13px;">${this._esc(d.pair[1].title)}</span>
                            <span style="color:#f59e0b;font-size:11px;margin-left:6px;">(${d.similarity}% মিল)</span>
                        </div>`).join('')}
                </div>` : ''}

                <div>
                    <h4 style="color:#e2e8f0;margin:0 0 10px;">উৎস বণ্টন</h4>
                    <div style="background:#0f172a;padding:14px;border-radius:10px;">
                        ${report.sources.map(s => `
                            <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #1e293b;">
                                <span style="color:#94a3b8;font-size:13px;">${this._esc(s.source)}</span>
                                <span style="color:#e2e8f0;font-size:13px;font-weight:600;">${s.count}</span>
                            </div>`).join('')}
                    </div>
                </div>
            </div>`;

            document.getElementById('sfk-export-json')?.addEventListener('click', () => this.exportReport(report, 'json'));
            document.getElementById('sfk-export-csv')?.addEventListener('click', () => this.exportReport(report, 'csv'));
            document.getElementById('sfk-export-print')?.addEventListener('click', () => window.print());
        });
    },

    // ──────────── Export ────────────

    exportReport(reportData, format) {
        let blob, ext;
        if (format === 'csv') {
            const rows = [['Section', 'Key', 'Value']];
            const push = (s, k, v) => rows.push([s, k, String(v)]);
            push('Stats', 'Total Entries', reportData.stats.totalEntries);
            push('Stats', 'Total Words', reportData.stats.totalWords);
            push('Stats', 'Avg Words/Entry', reportData.stats.avgWordsPerEntry);
            push('Coverage', 'Percentage', reportData.coverage.percentage + '%');
            push('Coverage', 'Missing Count', reportData.missing.length);
            push('Duplicates', 'Count', reportData.duplicates.length);
            for (const [cat, count] of Object.entries(reportData.stats.categories)) {
                push('Category', cat, count);
            }
            for (const t of reportData.missing) {
                push('Missing', t, 'N/A');
            }
            blob = new Blob([rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
            ext = 'csv';
        } else {
            blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
            ext = 'json';
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sfk-knowledge-report.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // ──────────── Helpers ────────────

    _getEntries() {
        try {
            return JSON.parse(localStorage.getItem('sfk_knowledge_entries') || '[]');
        } catch {
            return [];
        }
    },

    _titleSimilarity(a, b) {
        if (!a || !b) return 0;
        const wa = a.toLowerCase().split(/\s+/);
        const wb = b.toLowerCase().split(/\s+/);
        const sa = new Set(wa);
        const sb = new Set(wb);
        let inter = 0;
        sa.forEach(w => { if (sb.has(w)) inter++; });
        const union = new Set([...sa, ...sb]).size;
        return union ? inter / union : 0;
    },

    _esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }
};
