/**
 * V21 Integration Script — SF AI Knowledge Universe
 * Connects all V21 knowledge modules together
 */
(function() {
  'use strict';

  const V21_LOG = '[SF V21]';
  const V21_COLOR = '#8b5cf6';

  async function loadV21Modules() {
    const modules = ['./v21-admin.js', './v21-report.js'];
    for (const mod of modules) {
      try {
        await import(mod);
      } catch (e) {
        console.warn(V21_LOG, 'Module load failed:', mod, e);
      }
    }
  }

  async function initV21() {
    await loadV21Modules();

    const modules = {
      'SFKAdmin': window.SFKAdmin,
      'SFKReport': window.SFKReport
    };

    for (const [name, mod] of Object.entries(modules)) {
      if (mod && typeof mod.init === 'function') {
        try {
          mod.init();
          console.log(V21_LOG, `${name} initialized`);
        } catch (e) {
          console.warn(V21_LOG, `${name} init failed:`, e);
        }
      }
    }

    hookKnowledgeSearch();
    addKnowledgeAdminButton();
    addV21Styles();

    console.log(V21_LOG, 'SF AI V21 Knowledge Universe Loaded');
  }

  // ──────────── Knowledge Search Hook ────────────

  function hookKnowledgeSearch() {
    const origFetch = window.fetch;
    window.fetch = async function(...args) {
      const response = await origFetch.apply(this, args);

      try {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
        if (url.includes('/api/chat') || url.includes('/api/message')) {
          const cloned = response.clone();
          const body = await cloned.json().catch(() => null);

          if (body && body.reply) {
            const enriched = await enrichWithKnowledge(body.reply);
            if (enriched) {
              body.reply = enriched;
              return new Response(JSON.stringify(body), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
              });
            }
          }
        }
      } catch (e) {
        // Silent fail — don't break original request
      }

      return response;
    };
  }

  async function enrichWithKnowledge(reply) {
    try {
      const entries = JSON.parse(localStorage.getItem('sfk_knowledge_entries') || '[]');
      if (!entries.length) return null;

      const keywords = extractKeywords(reply);
      const relevant = entries.filter(e => {
        const text = (e.title + ' ' + e.content).toLowerCase();
        return keywords.some(k => text.includes(k));
      }).slice(0, 3);

      if (relevant.length === 0) return null;

      const knowledgeNote = '\n\n📚 **জ্ঞান ভান্ডার থেকে:**\n' +
        relevant.map(e => `• **${e.title}**: ${e.content.substring(0, 120)}...`).join('\n');

      return reply + knowledgeNote;
    } catch {
      return null;
    }
  }

  function extractKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\u0980-\u09FFa-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const stopWords = new Set(['এবং', 'একটি', 'হয়', 'কি', 'যে', 'তার', 'সে', 'এই', 'ও', 'আমি', 'আপনি', 'আমরা', 'the', 'and', 'for', 'that', 'with']);
    return [...new Set(words.filter(w => !stopWords.has(w)))].slice(0, 10);
  }

  // ──────────── Knowledge Admin Button ────────────

  function addKnowledgeAdminButton() {
    setTimeout(() => {
      const headerActions = document.querySelector('.chat-header-actions');
      if (!headerActions) return;

      const btn = document.createElement('button');
      btn.className = 'header-btn';
      btn.title = 'V21 Knowledge Admin';
      btn.innerHTML = '<i class="fas fa-book"></i>';
      btn.style.color = V21_COLOR;
      btn.addEventListener('click', () => openKnowledgeAdmin());
      headerActions.appendChild(btn);
    }, 2000);
  }

  // ──────────── V21 Styles ────────────

  function addV21Styles() {
    if (document.getElementById('v21-styles')) return;

    const style = document.createElement('style');
    style.id = 'v21-styles';
    style.textContent = `
      #v21-admin-modal { animation: v21 fadeIn 0.2s ease; }
      @keyframes v21 fadeIn { from { opacity: 0; } to { opacity: 1; } }
      #v21-admin-modal > div:first-child { animation: v21 slideUp 0.25s ease; }
      @keyframes v21 slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .sfk-entry-item { transition: border-color 0.15s, transform 0.15s; }
      .sfk-entry-item:hover { transform: translateX(2px); }
    `;
    document.head.appendChild(style);
  }

  // ──────────── Knowledge Admin Modal ────────────

  function openKnowledgeAdmin() {
    const existing = document.getElementById('v21-admin-modal');
    if (existing) { existing.remove(); return; }

    const modal = document.createElement('div');
    modal.id = 'v21-admin-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10003;display:flex;align-items:center;justify-content:center;';

    const content = document.createElement('div');
    content.style.cssText = 'background:#0f172a;border-radius:16px;width:95%;max-width:1000px;max-height:90vh;overflow:auto;padding:24px;';
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="color:${V21_COLOR};margin:0;font-size:20px;">V21 Knowledge Universe — Admin</h2>
        <button id="v21-admin-close" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:4px 8px;">✕</button>
      </div>
      <div id="v21-admin-tabs" style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
        <button class="v21-tab active" data-tab="editor" style="background:#8b5cf6;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">সম্পাদক</button>
        <button class="v21-tab" data-tab="duplicates" style="background:#1e293b;color:#94a3b8;border:1px solid #334155;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">ডুপ্লিকেট</button>
        <button class="v21-tab" data-tab="refs" style="background:#1e293b;color:#94a3b8;border:1px solid #334155;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">রেফারেন্স</button>
        <button class="v21-tab" data-tab="versions" style="background:#1e293b;color:#94a3b8;border:1px solid #334155;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">সংস্করণ</button>
        <button class="v21-tab" data-tab="report" style="background:#1e293b;color:#94a3b8;border:1px solid #334155;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">রিপোর্ট</button>
      </div>
      <div id="v21-admin-content" style="min-height:400px;"></div>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
        <button id="v21-export-btn" style="background:#22c55e;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">ডাটা এক্সপোর্ট</button>
        <button id="v21-import-btn" style="background:#3b82f6;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px;">ডাটা ইমপোর্ট</button>
      </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById('v21-admin-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

    const container = content.querySelector('#v21-admin-content');
    setupTabs(content, container);
    showTab(container, 'editor');

    document.getElementById('v21-export-btn')?.addEventListener('click', () => {
      if (window.SFKAdmin) window.SFKAdmin.exportKnowledge({}, 'json');
    });

    document.getElementById('v21-import-btn')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            const count = window.SFKAdmin ? window.SFKAdmin.bulkImport(data) : 0;
            alert(`${count}টি এন্ট্রি ইমপোর্ট করা হয়েছে।`);
            showTab(container, 'editor');
          } catch (err) {
            alert('ইমপোর্টে সমস্যা হয়েছে: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });
  }

  // ──────────── Tab System ────────────

  function setupTabs(content, container) {
    const tabs = content.querySelectorAll('.v21-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.style.background = '#1e293b';
          t.style.color = '#94a3b8';
          t.style.border = '1px solid #334155';
          t.classList.remove('active');
        });
        tab.style.background = V21_COLOR;
        tab.style.color = '#fff';
        tab.style.border = 'none';
        tab.classList.add('active');
        showTab(container, tab.dataset.tab);
      });
    });
  }

  function showTab(container, tabName) {
    if (!container) return;
    container.innerHTML = '';

    switch (tabName) {
      case 'editor':
        if (window.SFKAdmin) window.SFKAdmin.createKnowledgeEditor(container.id);
        break;
      case 'duplicates':
        if (window.SFKAdmin) window.SFKAdmin.createDuplicateDetector(container.id);
        break;
      case 'refs':
        if (window.SFKAdmin) window.SFKAdmin.createReferenceChecker(container.id);
        break;
      case 'versions':
        container.innerHTML = '<div style="padding:16px;color:#94a3b8;">একটি এন্ট্রি নির্বাচন করুন, তারপর সংস্করণ দেখুন।</div>';
        break;
      case 'report':
        if (window.SFKReport) window.SFKReport.createFullReport(container.id);
        break;
      default:
        container.innerHTML = '<div style="padding:40px;text-align:center;color:#64748b;">অজ্ঞাত ট্যাব</div>';
    }
  }

  // ──────────── Public API ────────────

  window.SFV21 = {
    init: initV21,
    openKnowledgeAdmin,
    reloadModules: loadV21Modules
  };

  // ──────────── Auto-Init ────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initV21);
  } else {
    initV21();
  }
})();
