(function() {
  'use strict';
  
  // ── V20 Module Loader ──
  async function loadV20Modules() {
    const modules = [
      './farm.js', './field.js', './tasks.js', './expense.js',
      './sales.js', './inventory.js', './reports.js', './community.js',
      './expert.js', './emergency.js', './export-v20.js', './sync.js',
      './security-v20.js', './optimize.js',
    ];
    
    const loaded = {};
    for (const mod of modules) {
      try {
        const imported = await import(mod);
        const name = Object.keys(imported)[0];
        loaded[name] = imported[name];
      } catch (e) {
        console.warn('V20 load failed:', mod, e);
      }
    }
    return loaded;
  }
  
  // ── V20 Hub (main navigation) ──
  const SFHub = {
    modules: {},
    currentView: null,
    
    async init() {
      this.modules = await this.loadModules();
      this.initAll();
      this.addHubButton();
      this.setupSync();
      this.setupPerformance();
      console.log('SF AI V20 Commercial Ecosystem Loaded');
    },
    
    async loadModules() {
      return await loadV20Modules();
    },
    
    initAll() {
      const initMap = {
        SFFarm: 'init', SFField: 'init', SFTask: 'init', SFExpense: 'init',
        SFSale: 'init', SFInventory: 'init', SFReports: 'init', SFCommunity: 'init',
        SFExpert: 'init', SFEmergency: 'init', SFExportV20: 'init', SFSync: 'init',
        SFSecurityV20: 'init', SFOptimize: 'init',
      };
      
      for (const [name, method] of Object.entries(initMap)) {
        const mod = this.modules[name] || window[name];
        if (mod && typeof mod[method] === 'function') {
          try { mod[method](); } catch(e) { console.warn(`${name} init failed:`, e); }
        }
      }
    },
    
    addHubButton() {
      setTimeout(() => {
        const headerActions = document.querySelector('.chat-header-actions');
        if (!headerActions) return;
        
        const hubBtn = document.createElement('button');
        hubBtn.className = 'header-btn';
        hubBtn.title = 'V20 Farm Hub';
        hubBtn.innerHTML = '<i class="fas fa-seedling"></i>';
        hubBtn.style.color = '#10b981';
        hubBtn.onclick = () => this.openHub();
        headerActions.insertBefore(hubBtn, headerActions.firstChild);
      }, 2000);
    },
    
    openHub() {
      const existing = document.getElementById('v20-hub-modal');
      if (existing) { existing.remove(); return; }
      
      const modal = document.createElement('div');
      modal.id = 'v20-hub-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10001;display:flex;align-items:center;justify-content:center;';
      
      const content = document.createElement('div');
      content.style.cssText = 'background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:20px;width:95%;max-width:1000px;max-height:90vh;overflow:auto;padding:30px;border:1px solid rgba(16,185,129,0.3);';
      content.innerHTML = this.getHubHTML();
      
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      // Bind button clicks
      content.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          modal.remove();
          this.openModule(action);
        });
      });
      
      // Close on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
    },
    
    getHubHTML() {
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <h2 style="color:#10b981;margin:0;font-size:24px;">SF AI V20 — কৃষি ইকোসিস্টেম</h2>
          <button onclick="document.getElementById('v20-hub-modal').remove()" style="background:none;border:none;color:#94a3b8;font-size:24px;cursor:pointer;">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
          ${this.getHubButton('farm', '🏭', 'ডিজিটাল খামার', 'খামার তৈরি ও পরিচালনা')}
          ${this.getHubButton('field', '🌾', 'ক্ষেত ব্যবস্থাপনা', 'ফসল ও ক্ষেত ট্র্যাকিং')}
          ${this.getHubButton('tasks', '📋', 'কাজের তালিকা', 'কৃষি কাজ পরিচালনা')}
          ${this.getHubButton('expense', '💰', 'খরচ হিসাব', 'খরচ ও লাভের হিসাব')}
          ${this.getHubButton('sales', '🛒', 'বিক্রয় ব্যবস্থাপনা', 'অর্ডার ও বিক্রয়')}
          ${this.getHubButton('inventory', '📦', 'ইনভেন্টরি', 'স্টক ব্যবস্থাপনা')}
          ${this.getHubButton('reports', '📊', 'স্মার্ট রিপোর্ট', 'বিস্তারিত রিপোর্ট')}
          ${this.getHubButton('community', '👥', 'কমিউনিটি', 'কৃষক ফোরাম')}
          ${this.getHubButton('expert', '👨‍🔬', 'এক্সপার্ট সংযোগ', 'বিশেষজ্ঞ পরামর্শ')}
          ${this.getHubButton('emergency', '🚨', 'জরুরি মোড', 'জরুরি সহায়তা')}
          ${this.getHubButton('export', '📤', 'ডাটা এক্সপোর্ট', 'PDF, Excel, CSV')}
          ${this.getHubButton('sync', '🔄', 'ক্লাউড সিঙ্ক', 'অনলাইন/অফলাইন সিঙ্ক')}
          ${this.getHubButton('security', '🔒', 'নিরাপত্তা', 'ডাটা এনক্রিপশন')}
          ${this.getHubButton('optimize', '⚡', 'পারফরম্যান্স', 'স্পিড অপটিমাইজেশন')}
        </div>
        <div style="margin-top:24px;padding:16px;background:rgba(16,185,129,0.1);border-radius:12px;">
          <div style="color:#94a3b8;font-size:14px;">
            <strong style="color:#10b981;">V20 Status:</strong>
            <span id="v20-hub-status">সিস্টেম সাধারণ</span> | 
            <span id="v20-hub-farms">খামার: 0</span> | 
            <span id="v20-hub-tasks">আজকের কাজ: 0</span> |
            <span id="v20-hub-sync">সিঙ্ক: অনলাইন</span>
          </div>
        </div>`;
    },
    
    getHubButton(action, icon, title, desc) {
      return `<button data-action="${action}" style="background:rgba(30,41,59,0.8);border:1px solid rgba(148,163,184,0.2);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;align-items:center;gap:8px;" onmouseover="this.style.borderColor='#10b981';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='rgba(148,163,184,0.2)';this.style.transform='none'">
        <span style="font-size:32px;">${icon}</span>
        <span style="color:#f1f5f9;font-weight:600;font-size:14px;">${title}</span>
        <span style="color:#94a3b8;font-size:12px;">${desc}</span>
      </button>`;
    },
    
    openModule(module) {
      const modal = document.createElement('div');
      modal.id = 'v20-module-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:10002;display:flex;align-items:center;justify-content:center;';
      
      const content = document.createElement('div');
      content.style.cssText = 'background:#0f172a;border-radius:16px;width:95%;max-width:1000px;max-height:90vh;overflow:auto;padding:24px;';
      content.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="color:#10b981;margin:0;"></h2>
          <button onclick="document.getElementById('v20-module-modal').remove()" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>
        </div>
        <div id="v20-module-content"></div>`;
      
      modal.appendChild(content);
      document.body.appendChild(modal);
      
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
      });
      
      // Load module content
      const container = content.querySelector('#v20-module-content');
      this.loadModuleContent(module, container, content.querySelector('h2'));
    },
    
    loadModuleContent(module, container, title) {
      const moduleMap = {
        farm: { mod: 'SFFarm', method: 'createFarmList', label: 'ডিজিটাল খামার' },
        field: { mod: 'SFField', method: 'createFieldList', label: 'ক্ষেত ব্যবস্থাপনা' },
        tasks: { mod: 'SFTask', method: 'createTaskList', label: 'কাজের তালিকা' },
        expense: { mod: 'SFExpense', method: 'createExpenseList', label: 'খরচ হিসাব' },
        sales: { mod: 'SFSale', method: 'createSalesDashboard', label: 'বিক্রয় ব্যবস্থাপনা' },
        inventory: { mod: 'SFInventory', method: 'createInventoryDashboard', label: 'ইনভেন্টরি' },
        reports: { mod: 'SFReports', method: 'createReportDashboard', label: 'স্মার্ট রিপোর্ট' },
        community: { mod: 'SFCommunity', method: 'createForumHome', label: 'কমিউনিটি' },
        expert: { mod: 'SFExpert', method: 'createExpertList', label: 'এক্সপার্ট সংযোগ' },
        emergency: { mod: 'SFEmergency', method: 'createEmergencyDashboard', label: 'জরুরি মোড' },
        export: { mod: 'SFExportV20', method: 'createExportPanel', label: 'ডাটা এক্সপোর্ট' },
        sync: { mod: 'SFSync', method: 'createSyncStatus', label: 'ক্লাউড সিঙ্ক' },
        security: { mod: 'SFSecurityV20', method: 'createSecurityPanel', label: 'নিরাপত্তা' },
        optimize: { mod: 'SFOptimize', method: 'createPerformanceDashboard', label: 'পারফরম্যান্স' },
      };
      
      const config = moduleMap[module];
      if (!config) return;
      
      title.textContent = config.label;
      
      const mod = this.modules[config.mod] || window[config.mod];
      if (mod && typeof mod[config.method] === 'function') {
        mod[config.method](container.id);
      } else {
        container.innerHTML = '<p style="color:#94a3b8;">মডিউল লোড হচ্ছে...</p>';
        // Retry after a short delay
        setTimeout(() => {
          const mod2 = window[config.mod];
          if (mod2 && typeof mod2[config.method] === 'function') {
            mod2[config.method](container.id);
          } else {
            container.innerHTML = '<p style="color:#ef4444;">মডিউল লোড করা যায়নি।</p>';
          }
        }, 1000);
      }
    },
    
    setupSync() {
      const syncMod = this.modules.SFSync || window.SFSync;
      if (syncMod) {
        setInterval(() => {
          if (navigator.onLine && syncMod.isOnline) {
            syncMod.processQueue?.();
          }
        }, 30000);
      }
    },
    
    setupPerformance() {
      const optMod = this.modules.SFOptimize || window.SFOptimize;
      if (optMod) {
        optMod.lazyLoadImages?.();
      }
    },
  };
  
  // Expose globally
  window.SFHub = SFHub;
  window.SFV20 = SFHub;
  
  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SFHub.init());
  } else {
    SFHub.init();
  }
})();
