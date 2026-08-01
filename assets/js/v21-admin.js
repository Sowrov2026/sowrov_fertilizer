/**
 * V21 Knowledge Admin Tools — SF AI Knowledge Universe
 * Bangla UI text throughout
 */
export const SFKAdmin = {
    _initialized: false,
    _entries: [],
    _versions: [],
    _containerId: null,

    init() {
        if (this._initialized) return;
        this._initialized = true;
        this._loadKnowledge();
        console.log('SFKAdmin initialized');
    },

    // ──────────── Knowledge Storage ────────────

    _loadKnowledge() {
        try {
            const raw = localStorage.getItem('sfk_knowledge_entries');
            this._entries = raw ? JSON.parse(raw) : [];
            const ver = localStorage.getItem('sfk_knowledge_versions');
            this._versions = ver ? JSON.parse(ver) : [];
        } catch {
            this._entries = [];
            this._versions = [];
        }
    },

    _saveKnowledge() {
        localStorage.setItem('sfk_knowledge_entries', JSON.stringify(this._entries));
        localStorage.setItem('sfk_knowledge_versions', JSON.stringify(this._versions));
    },

    _nextId() {
        return 'kb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    },

    // ──────────── Knowledge Editor ────────────

    createKnowledgeEditor(containerId) {
        this._containerId = containerId;
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
        <div style="display:grid;grid-template-columns:320px 1fr;gap:20px;height:70vh;">
            <div style="background:#1e293b;border-radius:12px;padding:16px;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <h3 style="color:#e2e8f0;margin:0;font-size:15px;">জ্ঞান এন্ট্রি</h3>
                    <button id="sfk-new-entry-btn" style="background:#8b5cf6;color:#fff;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13px;">নতুন</button>
                </div>
                <input id="sfk-entry-search" type="text" placeholder="অনুসন্ধান..." style="width:100%;padding:8px 12px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#e2e8f0;margin-bottom:12px;box-sizing:border-box;" />
                <div id="sfk-entry-list" style="display:flex;flex-direction:column;gap:6px;"></div>
            </div>
            <div style="background:#1e293b;border-radius:12px;padding:20px;overflow-y:auto;">
                <h3 style="color:#e2e8f0;margin:0 0 16px 0;font-size:16px;">সম্পাদনা</h3>
                <div id="sfk-editor-form">
                    <div style="text-align:center;padding:40px;color:#64748b;">একটি এন্ট্রি নির্বাচন করুন বা নতুন তৈরি করুন</div>
                </div>
            </div>
        </div>`;

        this._renderEntryList();
        document.getElementById('sfk-new-entry-btn')?.addEventListener('click', () => this._showEditor(null));
        document.getElementById('sfk-entry-search')?.addEventListener('input', (e) => {
            this._renderEntryList(e.target.value);
        });
    },

    _renderEntryList(filter = '') {
        const list = document.getElementById('sfk-entry-list');
        if (!list) return;

        const lower = filter.toLowerCase();
        const filtered = this._entries.filter(e =>
            !filter || e.title.toLowerCase().includes(lower) || (e.tags || []).some(t => t.toLowerCase().includes(lower))
        );

        if (!filtered.length) {
            list.innerHTML = '<div style="text-align:center;padding:20px;color:#64748b;">কোনো এন্ট্রি পাওয়া যায়নি</div>';
            return;
        }

        list.innerHTML = filtered.map(e => `
        <div class="sfk-entry-item" data-id="${e.id}" style="background:#0f172a;padding:10px 12px;border-radius:8px;cursor:pointer;border:1px solid #334155;">
            <div style="color:#e2e8f0;font-size:14px;font-weight:600;">${this._esc(e.title)}</div>
            <div style="color:#94a3b8;font-size:12px;margin-top:2px;">${this._esc((e.tags || []).join(', ')) || 'ট্যাগ নেই'}</div>
        </div>`).join('');

        list.querySelectorAll('.sfk-entry-item').forEach(item => {
            item.addEventListener('click', () => this._showEditor(item.dataset.id));
            item.addEventListener('mouseenter', () => item.style.borderColor = '#8b5cf6');
            item.addEventListener('mouseleave', () => item.style.borderColor = '#334155');
        });
    },

    _showEditor(id) {
        const form = document.getElementById('sfk-editor-form');
        if (!form) return;
        const entry = id ? this._entries.find(e => e.id === id) : { id: '', title: '', content: '', tags: [], source: '', category: 'general' };

        form.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:14px;">
            <input type="hidden" id="sfk-edit-id" value="${entry.id || ''}" />
            <div>
                <label style="color:#94a3b8;font-size:13px;display:block;margin-bottom:4px;">শিরোনাম *</label>
                <input id="sfk-edit-title" value="${this._esc(entry.title)}" style="width:100%;padding:10px 12px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#e2e8f0;box-sizing:border-box;" />
            </div>
            <div>
                <label style="color:#94a3b8;font-size:13px;display:block;margin-bottom:4px;">বিষয়বস্তু *</label>
                <textarea id="sfk-edit-content" rows="12" style="width:100%;padding:10px 12px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#e2e8f0;resize:vertical;font-size:13px;line-height:1.6;box-sizing:border-box;">${this._esc(entry.content)}</textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                    <label style="color:#94a3b8;font-size:13px;display:block;margin-bottom:4px;">ট্যাগ (কমা দিয়ে আলাদা)</label>
                    <input id="sfk-edit-tags" value="${this._esc((entry.tags || []).join(', '))}" style="width:100%;padding:10px 12px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#e2e8f0;box-sizing:border-box;" />
                </div>
                <div>
                    <label style="color:#94a3b8;font-size:13px;display:block;margin-bottom:4px;">উৎস</label>
                    <input id="sfk-edit-source" value="${this._esc(entry.source || '')}" style="width:100%;padding:10px 12px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#e2e8f0;box-sizing:border-box;" />
                </div>
            </div>
            <div>
                <label style="color:#94a3b8;font-size:13px;display:block;margin-bottom:4px;">ক্যাটাগরি</label>
                <select id="sfk-edit-category" style="width:100%;padding:10px 12px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#e2e8f0;box-sizing:border-box;">
                    <option value="general" ${entry.category === 'general' ? 'selected' : ''}>সাধারণ</option>
                    <option value="fertilizer" ${entry.category === 'fertilizer' ? 'selected' : ''}>সার</option>
                    <option value="crop" ${entry.category === 'crop' ? 'selected' : ''}>ফসল</option>
                    <option value="soil" ${entry.category === 'soil' ? 'selected' : ''}>মাটি</option>
                    <option value="pest" ${entry.category === 'pest' ? 'selected' : ''}>পোকা-মাকড়</option>
                    <option value="weather" ${entry.category === 'weather' ? 'selected' : ''}>আবহাওয়া</option>
                    <option value="market" ${entry.category === 'market' ? 'selected' : ''}>বাজার</option>
                    <option value="technique" ${entry.category === 'technique' ? 'selected' : ''}>কৌশল</option>
                </select>
            </div>
            <div style="display:flex;gap:10px;margin-top:8px;">
                <button id="sfk-save-btn" style="background:#22c55e;color:#fff;border:none;padding:10px 24px;border-radius:8px;cursor:pointer;font-weight:600;">সংরক্ষণ</button>
                ${id ? '<button id="sfk-delete-btn" style="background:#ef4444;color:#fff;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">মুছুন</button>' : ''}
                <button id="sfk-cancel-btn" style="background:#334155;color:#e2e8f0;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">বাতিল</button>
            </div>
            <div id="sfk-editor-msg" style="color:#22c55e;font-size:13px;min-height:20px;"></div>
        </div>`;

        document.getElementById('sfk-save-btn')?.addEventListener('click', () => {
            const data = {
                id: document.getElementById('sfk-edit-id').value || this._nextId(),
                title: document.getElementById('sfk-edit-title').value.trim(),
                content: document.getElementById('sfk-edit-content').value.trim(),
                tags: document.getElementById('sfk-edit-tags').value.split(',').map(s => s.trim()).filter(Boolean),
                source: document.getElementById('sfk-edit-source').value.trim(),
                category: document.getElementById('sfk-edit-category').value,
                updatedAt: Date.now()
            };
            if (!data.title || !data.content) {
                this._editorMsg('শিরোনাম এবং বিষয়বস্তু আবশ্যক');
                return;
            }
            this.saveEntry(data);
            this._editorMsg('সফলভাবে সংরক্ষিত হয়েছে!');
            this._renderEntryList();
        });

        document.getElementById('sfk-delete-btn')?.addEventListener('click', () => {
            if (confirm('আপনি কি নিশ্চিত এই এন্ট্রিটি মুছে ফেলতে চান?')) {
                this.deleteEntry(entry.id);
                this._renderEntryList();
                document.getElementById('sfk-editor-form').innerHTML = '<div style="text-align:center;padding:40px;color:#64748b;">একটি এন্ট্রি নির্বাচন করুন বা নতুন তৈরি করুন</div>';
            }
        });

        document.getElementById('sfk-cancel-btn')?.addEventListener('click', () => {
            document.getElementById('sfk-editor-form').innerHTML = '<div style="text-align:center;padding:40px;color:#64748b;">একটি এন্ট্রি নির্বাচন করুন বা নতুন তৈরি করুন</div>';
        });
    },

    _editorMsg(msg) {
        const el = document.getElementById('sfk-editor-msg');
        if (el) el.textContent = msg;
        setTimeout(() => { if (el) el.textContent = ''; }, 3000);
    },

    editEntry(entryId) {
        this._showEditor(entryId);
    },

    saveEntry(entry) {
        const idx = this._entries.findIndex(e => e.id === entry.id);
        if (idx >= 0) {
            this._versions.push({ ...this._entries[idx], savedAt: Date.now() });
            this._entries[idx] = entry;
        } else {
            entry.createdAt = Date.now();
            this._entries.push(entry);
        }
        this._saveKnowledge();
    },

    deleteEntry(entryId) {
        this._entries = this._entries.filter(e => e.id !== entryId);
        this._saveKnowledge();
    },

    // ──────────── Version Compare ────────────

    createVersionCompare(containerId, entryId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const versions = this._versions.filter(v => v.id === entryId);
        const current = this._entries.find(e => e.id === entryId);

        container.innerHTML = `
        <div style="padding:16px;">
            <h3 style="color:#e2e8f0;margin:0 0 12px;">সংস্করণ তুলনা — ${current ? this._esc(current.title) : entryId}</h3>
            ${versions.length === 0 ? '<p style="color:#64748b;">কোনো পূর্ববর্তী সংস্করণ নেই</p>' : ''}
            <div id="sfk-version-list" style="display:flex;flex-direction:column;gap:8px;"></div>
            <div id="sfk-version-diff" style="margin-top:16px;"></div>
        </div>`;

        const list = container.querySelector('#sfk-version-list');
        versions.slice(-10).reverse().forEach((v, i) => {
            const btn = document.createElement('button');
            btn.textContent = `সংস্করণ ${versions.length - i} — ${new Date(v.savedAt).toLocaleString('bn-BD')}`;
            btn.style.cssText = 'background:#1e293b;color:#e2e8f0;border:1px solid #334155;padding:8px 14px;border-radius:8px;cursor:pointer;text-align:left;';
            btn.addEventListener('click', () => {
                if (current) {
                    const diff = this.compareVersions(v, current);
                    document.getElementById('sfk-version-diff').innerHTML = diff;
                }
            });
            list.appendChild(btn);
        });
    },

    compareVersions(v1, v2) {
        let html = '<div style="background:#0f172a;border-radius:8px;padding:14px;">';
        if (v1.title !== v2.title) {
            html += `<div style="margin-bottom:8px;"><span style="color:#ef4444;">পুরাতন:</span> <span style="color:#e2e8f0;">${this._esc(v1.title)}</span> → <span style="color:#22c55e;">নতুন:</span> <span style="color:#e2e8f0;">${this._esc(v2.title)}</span></div>`;
        }
        if (v1.content !== v2.content) {
            const oldLines = v1.content.split('\n');
            const newLines = v2.content.split('\n');
            const max = Math.max(oldLines.length, newLines.length);
            for (let i = 0; i < max; i++) {
                const o = oldLines[i] || '';
                const n = newLines[i] || '';
                if (o !== n) {
                    if (o) html += `<div style="color:#ef4444;font-family:monospace;font-size:12px;">- ${this._esc(o)}</div>`;
                    if (n) html += `<div style="color:#22c55e;font-family:monospace;font-size:12px;">+ ${this._esc(n)}</div>`;
                }
            }
        } else {
            html += '<div style="color:#64748b;">বিষয়বস্তুতে কোনো পরিবর্তন নেই</div>';
        }
        html += '</div>';
        return html;
    },

    // ──────────── Duplicate Detection ────────────

    createDuplicateDetector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
        <div style="padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="color:#e2e8f0;margin:0;">ডুপ্লিকেট সনাক্তকরণ</h3>
                <button id="sfk-find-dupes" style="background:#f59e0b;color:#0f172a;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">খুঁজুন</button>
            </div>
            <div id="sfk-dupes-result" style="color:#94a3b8;">বোতাম চাপুন এবং ডুপ্লিকেট খুঁজুন...</div>
        </div>`;

        document.getElementById('sfk-find-dupes')?.addEventListener('click', async () => {
            const result = document.getElementById('sfk-dupes-result');
            result.innerHTML = '<span style="color:#f59e0b;">অনুসন্ধান করা হচ্ছে...</span>';
            const groups = await this.findDuplicates();
            if (!groups.length) {
                result.innerHTML = '<span style="color:#22c55e;">কোনো ডুপ্লিকেট পাওয়া যায়নি!</span>';
                return;
            }
            result.innerHTML = groups.map((g, gi) => `
            <div style="background:#0f172a;border-radius:8px;padding:12px;margin-bottom:10px;border-left:3px solid #f59e0b;">
                <div style="color:#f59e0b;font-size:14px;font-weight:600;margin-bottom:8px;">গ্রুপ ${gi + 1} (${g.length}টি সম্ভাব্য ডুপ্লিকেট)</div>
                ${g.map(e => `<div style="color:#e2e8f0;font-size:13px;padding:4px 0;">• ${this._esc(e.title)} <span style="color:#64748b;">(${e.id})</span></div>`).join('')}
                <button class="sfk-merge-btn" data-group="${gi}" style="background:#8b5cf6;color:#fff;border:none;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;margin-top:8px;">একীভূত করুন</button>
            </div>`).join('');

            result.querySelectorAll('.sfk-merge-btn').forEach(btn => {
                btn.addEventListener('click', () => this.mergeDuplicates(groups[parseInt(btn.dataset.group)]));
            });
        });
    },

    async findDuplicates() {
        const groups = [];
        const used = new Set();
        for (let i = 0; i < this._entries.length; i++) {
            if (used.has(i)) continue;
            const a = this._entries[i];
            const dupes = [a];
            for (let j = i + 1; j < this._entries.length; j++) {
                if (used.has(j)) continue;
                const b = this._entries[j];
                if (this._similarity(a.title, b.title) > 0.7 || this._similarity(a.content, b.content) > 0.85) {
                    dupes.push(b);
                    used.add(j);
                }
            }
            if (dupes.length > 1) {
                groups.push(dupes);
                used.add(i);
            }
        }
        return groups;
    },

    _similarity(a, b) {
        if (!a || !b) return 0;
        const wordsA = a.toLowerCase().split(/\s+/);
        const wordsB = b.toLowerCase().split(/\s+/);
        const setA = new Set(wordsA);
        const setB = new Set(wordsB);
        let inter = 0;
        setA.forEach(w => { if (setB.has(w)) inter++; });
        const union = new Set([...setA, ...setB]).size;
        return union ? inter / union : 0;
    },

    mergeDuplicates(group) {
        if (!group || group.length < 2) return;
        const keep = group[0];
        const removeIds = group.slice(1).map(e => e.id);
        let mergedContent = keep.content;
        for (let i = 1; i < group.length; i++) {
            if (group[i].content.length > mergedContent.length) {
                mergedContent = group[i].content;
            }
        }
        keep.content = mergedContent;
        keep.tags = [...new Set(group.flatMap(e => e.tags || []))];
        keep.updatedAt = Date.now();
        this.saveEntry(keep);
        this._entries = this._entries.filter(e => !removeIds.includes(e.id));
        this._saveKnowledge();
        alert(`${removeIds.length}টি ডুপ্লিকেট একীভূত করা হয়েছে।`);
    },

    // ──────────── Reference Checker ────────────

    createReferenceChecker(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
        <div style="padding:16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="color:#e2e8f0;margin:0;">ভাঙা রেফারেন্স সনাক্তকরণ</h3>
                <button id="sfk-find-refs" style="background:#ef4444;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">যাচাই করুন</button>
            </div>
            <div id="sfk-refs-result" style="color:#94a3b8;">বোতাম চাপুন এবং ভাঙা রেফারেন্স খুঁজুন...</div>
        </div>`;

        document.getElementById('sfk-find-refs')?.addEventListener('click', async () => {
            const result = document.getElementById('sfk-refs-result');
            result.innerHTML = '<span style="color:#ef4444;">যাচাই করা হচ্ছে...</span>';
            const broken = await this.findBrokenReferences();
            if (!broken.length) {
                result.innerHTML = '<span style="color:#22c55e;">সব রেফারেন্স সঠিক!</span>';
                return;
            }
            result.innerHTML = broken.map(ref => `
            <div style="background:#0f172a;border-radius:8px;padding:10px 12px;margin-bottom:8px;border-left:3px solid #ef4444;">
                <div style="color:#e2e8f0;font-size:13px;">${this._esc(ref.context)}</div>
                <div style="color:#ef4444;font-size:12px;margin-top:4px;">ভাঙা লিঙ্ক: ${this._esc(ref.brokenRef)}</div>
                <div style="display:flex;gap:6px;margin-top:6px;">
                    <input class="sfk-fix-ref" data-id="${ref.entryId}" placeholder="নতুন রেফারেন্স" style="flex:1;padding:6px 10px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#e2e8f0;font-size:12px;" />
                    <button class="sfk-fix-btn" data-id="${ref.entryId}" data-ref="${this._esc(ref.brokenRef)}" style="background:#22c55e;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px;">ঠিক করুন</button>
                </div>
            </div>`).join('');

            result.querySelectorAll('.sfk-fix-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const inp = result.querySelector(`.sfk-fix-ref[data-id="${btn.dataset.id}"]`);
                    if (inp && inp.value.trim()) {
                        this.fixBrokenReference(btn.dataset.id, btn.dataset.ref, inp.value.trim());
                        btn.closest('[style*="border-left"]').style.display = 'none';
                    }
                });
            });
        });
    },

    async findBrokenReferences() {
        const broken = [];
        const entryIds = new Set(this._entries.map(e => e.id));
        const urlPattern = /\[\[([^\]]+)\]\]/g;
        for (const entry of this._entries) {
            let match;
            while ((match = urlPattern.exec(entry.content)) !== null) {
                const ref = match[1];
                if (!entryIds.has(ref)) {
                    broken.push({
                        entryId: entry.id,
                        context: entry.title,
                        brokenRef: ref
                    });
                }
            }
        }
        return broken;
    },

    fixBrokenReference(refId, oldRef, newRef) {
        const entry = this._entries.find(e => e.id === refId);
        if (entry) {
            entry.content = entry.content.replace(new RegExp(`\\[\\[${this._escRegex(oldRef)}\\]\\]`, 'g'), `[[${newRef}]]`);
            entry.updatedAt = Date.now();
            this._saveKnowledge();
        }
    },

    // ──────────── Bulk Operations ────────────

    bulkImport(data) {
        if (!Array.isArray(data)) return 0;
        let count = 0;
        for (const item of data) {
            if (!item.title || !item.content) continue;
            const entry = {
                id: item.id || this._nextId(),
                title: item.title,
                content: item.content,
                tags: item.tags || [],
                source: item.source || 'bulk-import',
                category: item.category || 'general',
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            this._entries.push(entry);
            count++;
        }
        this._saveKnowledge();
        return count;
    },

    bulkExport(filter = {}) {
        let entries = [...this._entries];
        if (filter.category) entries = entries.filter(e => e.category === filter.category);
        if (filter.tags) {
            const t = filter.tags;
            entries = entries.filter(e => (e.tags || []).some(tag => t.includes(tag)));
        }
        if (filter.search) {
            const s = filter.search.toLowerCase();
            entries = entries.filter(e => e.title.toLowerCase().includes(s) || e.content.toLowerCase().includes(s));
        }
        return JSON.stringify(entries, null, 2);
    },

    bulkDelete(ids) {
        if (!Array.isArray(ids)) return 0;
        const before = this._entries.length;
        this._entries = this._entries.filter(e => !ids.includes(e.id));
        this._saveKnowledge();
        return before - this._entries.length;
    },

    // ──────────── Export ────────────

    exportKnowledge(filter = {}, format = 'json') {
        const data = this.bulkExport(filter);
        let blob, ext;
        if (format === 'csv') {
            const entries = JSON.parse(data);
            const rows = [['ID', 'Title', 'Category', 'Tags', 'Source', 'Content']];
            entries.forEach(e => rows.push([e.id, e.title, e.category, (e.tags || []).join(';'), e.source, e.content]));
            blob = new Blob([rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
            ext = 'csv';
        } else {
            blob = new Blob([data], { type: 'application/json' });
            ext = 'json';
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sfk-knowledge-export.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // ──────────── Helpers ────────────

    _esc(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    _escRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};
