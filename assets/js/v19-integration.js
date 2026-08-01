(function() {
  'use strict';

  const API_BASE = '/.netlify/functions/v19-api';

  async function loadV19Modules() {
    const modules = [
      './v19-feedback.js',
      './v19-admin.js',
      './v19-suggestions.js',
      './v19-reference.js',
      './v19-report.js',
      './v19-health.js',
      './v19-logging.js',
    ];

    for (const mod of modules) {
      try {
        await import(mod);
      } catch (e) {
        console.warn('V19 load failed:', mod, e);
      }
    }
  }

  async function initV19() {
    await loadV19Modules();

    const modules = {
      'SFFeedback': window.SFFeedback,
      'SFAdmin': window.SFAdmin,
      'SFSuggestions': window.SFSuggestions,
      'SFReference': window.SFReference,
      'SFReport': window.SFReport,
      'SFHealth': window.SFHealth,
      'SFLogging': window.SFLogging,
    };

    for (const [name, mod] of Object.entries(modules)) {
      if (mod && typeof mod.init === 'function') {
        try {
          mod.init();
        } catch (e) {
          console.warn(name + ' init failed:', e);
        }
      }
    }

    hookIntoChat();
    addAdminButton();
    setupKeyboardShortcuts();

    console.log('SF AI V19 Self-Evolving Loaded');
  }

  function hookIntoChat() {
    const origFetch = window.fetch;
    window.fetch = async function() {
      const args = arguments;
      const url = args[0];
      const options = args[1];

      if (typeof url === 'string' && url.includes('/.netlify/functions/chat')) {
        const startTime = Date.now();
        let requestBody;
        try {
          requestBody = JSON.parse(options && options.body);
        } catch (e) {}

        const response = await origFetch.apply(this, args);
        const clone = response.clone();

        try {
          const data = await clone.json();
          const messages = requestBody && requestBody.messages;
          const lastMsg = messages && messages[messages.length - 1];
          const userMsg = lastMsg ? lastMsg.content || '' : '';

          trackChat(userMsg, data.reply, Date.now() - startTime);

          if (window.SFLogging) {
            window.SFLogging.logChat(userMsg, {
              response: data.reply ? data.reply.substring(0, 100) : '',
              responseTime: Date.now() - startTime,
              language: detectLanguage(userMsg),
            });
          }

          setTimeout(function() {
            var botMessages = document.querySelectorAll('.message-wrapper.bot-message-wrapper .message-content');
            var lastBotMsg = botMessages[botMessages.length - 1];
            if (lastBotMsg && window.SFFeedback) {
              window.SFFeedback.addFeedbackButtons(lastBotMsg, {
                question: userMsg,
                answer: data.reply,
              });
            }
          }, 500);
        } catch (e) {}

        return response;
      }

      return origFetch.apply(this, args);
    };
  }

  async function trackChat(question, answer, responseTime) {
    try {
      await fetch(API_BASE + '?action=track_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          response: answer,
          startTime: Date.now() - responseTime,
          intent: { primaryIntent: 'general', confidence: 50 },
          language: { language: detectLanguage(question) },
        }),
      });
    } catch (e) {}
  }

  function detectLanguage(text) {
    var banglaRegex = /[\u0980-\u09FF]/;
    if (banglaRegex.test(text)) return 'bangla';
    return 'english';
  }

  function addAdminButton() {
    setTimeout(function() {
      var headerActions = document.querySelector('.chat-header-actions');
      if (!headerActions) return;

      var adminBtn = document.createElement('button');
      adminBtn.className = 'header-btn';
      adminBtn.title = 'V19 Admin Panel';
      adminBtn.innerHTML = '<i class="fas fa-brain"></i>';
      adminBtn.onclick = function() { openAdminPanel(); };
      headerActions.appendChild(adminBtn);
    }, 2000);
  }

  function openAdminPanel() {
    var existing = document.getElementById('v19-admin-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.id = 'v19-admin-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;';

    var content = document.createElement('div');
    content.style.cssText = 'background:#0f172a;border-radius:16px;width:90%;max-width:900px;max-height:85vh;overflow:auto;padding:24px;';
    content.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
      '<h2 style="color:#10b981;margin:0;">V19 Self-Evolving Admin</h2>' +
      '<div style="display:flex;gap:8px;">' +
      '<button id="v19-tab-dashboard" class="v19-tab active" style="padding:6px 12px;border-radius:6px;border:1px solid #10b981;background:#10b981;color:white;cursor:pointer;font-size:12px;">ড্যাশবোর্ড</button>' +
      '<button id="v19-tab-report" class="v19-tab" style="padding:6px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;cursor:pointer;font-size:12px;">রিপোর্ট</button>' +
      '<button id="v19-tab-health" class="v19-tab" style="padding:6px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;cursor:pointer;font-size:12px;">স্বাস্থ্য</button>' +
      '<button id="v19-tab-logs" class="v19-tab" style="padding:6px 12px;border-radius:6px;border:1px solid #334155;background:#1e293b;color:#94a3b8;cursor:pointer;font-size:12px;">লগ</button>' +
      '<button onclick="document.getElementById(\'v19-admin-modal\').remove()" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>' +
      '</div></div>' +
      '<div id="v19-admin-content"></div>';

    modal.appendChild(content);
    document.body.appendChild(modal);

    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.remove();
    });

    setupAdminTabs();

    if (window.SFAdmin) {
      window.SFAdmin.createAdminPanel('v19-admin-content');
    } else {
      showDashboard('v19-admin-content');
    }
  }

  function setupAdminTabs() {
    var tabs = ['dashboard', 'report', 'health', 'logs'];
    tabs.forEach(function(tab) {
      var btn = document.getElementById('v19-tab-' + tab);
      if (btn) {
        btn.onclick = function() {
          document.querySelectorAll('.v19-tab').forEach(function(t) {
            t.style.background = '#1e293b';
            t.style.color = '#94a3b8';
            t.style.borderColor = '#334155';
          });
          btn.style.background = '#10b981';
          btn.style.color = 'white';
          btn.style.borderColor = '#10b981';

          if (tab === 'dashboard') showDashboard('v19-admin-content');
          else if (tab === 'report') showReport('v19-admin-content');
          else if (tab === 'health') showHealth('v19-admin-content');
          else if (tab === 'logs') showLogs('v19-admin-content');
        };
      }
    });
  }

  function showDashboard(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var stats = {};
    if (window.SFLogging) {
      stats = window.SFLogging.getLogStats();
    }

    container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;">' +
      '<div style="background:#1e293b;padding:16px;border-radius:12px;text-align:center;">' +
      '<div style="font-size:28px;font-weight:700;color:#10b981;">' + (stats.total || 0) + '</div>' +
      '<div style="font-size:12px;color:#94a3b8;">মোট লগ</div></div>' +
      '<div style="background:#1e293b;padding:16px;border-radius:12px;text-align:center;">' +
      '<div style="font-size:28px;font-weight:700;color:#ef4444;">' + ((stats.byType && stats.byType.error) || 0) + '</div>' +
      '<div style="font-size:12px;color:#94a3b8;">ত্রুটি</div></div>' +
      '<div style="background:#1e293b;padding:16px;border-radius:12px;text-align:center;">' +
      '<div style="font-size:28px;font-weight:700;color:#3b82f6;">' + ((stats.byType && stats.byType.chat) || 0) + '</div>' +
      '<div style="font-size:12px;color:#94a3b8;">চ্যাট</div></div>' +
      '<div style="background:#1e293b;padding:16px;border-radius:12px;text-align:center;">' +
      '<div style="font-size:28px;font-weight:700;color:#f59e0b;">' + ((stats.byType && stats.byType.warning) || 0) + '</div>' +
      '<div style="font-size:12px;color:#94a3b8;">সতর্কতা</div></div>' +
      '</div>' +
      '<div style="margin-top:16px;">' +
      '<button onclick="window.SFV19.openKnowledgeManager()" style="width:100%;padding:12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px;">' +
      '<i class="fas fa-book" style="color:#10b981;"></i> জ্ঞানভান্ডার ব্যবস্থাপনা</button>' +
      '</div>';
  }

  function showReport(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div id="v19-report-container"></div>';
    if (window.SFReport) {
      window.SFReport.createReportPanel('v19-report-container');
    }
  }

  function showHealth(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div id="v19-health-container"></div>';
    if (window.SFHealth) {
      window.SFHealth.createHealthDashboard('v19-health-container');
    }
  }

  function showLogs(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<div id="v19-logs-container"></div>';
    if (window.SFLogging) {
      window.SFLogging.createLoggingPanel('v19-logs-container');
    }
  }

  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        openAdminPanel();
      }
    });
  }

  function openKnowledgeManager() {
    var modal = document.getElementById('v19-admin-modal');
    if (modal) modal.remove();

    var newModal = document.createElement('div');
    newModal.id = 'v19-admin-modal';
    newModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:10000;display:flex;align-items:center;justify-content:center;';

    var content = document.createElement('div');
    content.style.cssText = 'background:#0f172a;border-radius:16px;width:90%;max-width:800px;max-height:85vh;overflow:auto;padding:24px;';
    content.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
      '<h2 style="color:#10b981;margin:0;">জ্ঞানভান্ডার ব্যবস্থাপনা</h2>' +
      '<button onclick="document.getElementById(\'v19-admin-modal\').remove()" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;">✕</button>' +
      '</div>' +
      '<div id="v19-km-content" style="color:#94a3b8;">' +
      '<p>জ্ঞানভান্ডার লোড হচ্ছে...</p>' +
      '</div>';

    newModal.appendChild(content);
    document.body.appendChild(newModal);

    loadKnowledgeManager('v19-km-content');
  }

  async function loadKnowledgeManager(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    try {
      var response = await fetch(API_BASE + '?action=get_knowledge');
      var data = await response.json();

      if (data.success && data.knowledge) {
        var html = '<div style="margin-bottom:12px;">' +
          '<input type="text" id="km-search" placeholder="জ্ঞান খুঁজুন..." style="width:100%;padding:8px 12px;border-radius:8px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;box-sizing:border-box;">' +
          '</div><div id="km-list">';

        Object.entries(data.knowledge).forEach(function(entry) {
          var key = entry[0];
          var value = entry[1];
          html += '<div style="padding:10px;margin-bottom:6px;background:#1e293b;border-radius:8px;border-left:3px solid #10b981;">' +
            '<div style="display:flex;justify-content:space-between;align-items:start;">' +
            '<div><strong style="color:#e2e8f0;">' + key + '</strong>' +
            '<p style="margin:4px 0 0;font-size:12px;color:#94a3b8;">' + (typeof value === 'string' ? value.substring(0, 100) : JSON.stringify(value).substring(0, 100)) + '...</p></div>' +
            '</div></div>';
        });

        html += '</div>';
        container.innerHTML = html;

        document.getElementById('km-search').oninput = function(e) {
          var query = e.target.value.toLowerCase();
          var items = container.querySelectorAll('#km-list > div');
          items.forEach(function(item) {
            var text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? 'block' : 'none';
          });
        };
      } else {
        container.innerHTML = '<p style="color:#ef4444;">জ্ঞানভান্ডার লোড করা যায়নি।</p>';
      }
    } catch (e) {
      container.innerHTML = '<p style="color:#ef4444;">ত্রুটি: ' + e.message + '</p>';
    }
  }

  window.SFV19 = {
    init: initV19,
    trackChat: trackChat,
    openAdminPanel: openAdminPanel,
    openKnowledgeManager: openKnowledgeManager,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initV19);
  } else {
    initV19();
  }
})();
