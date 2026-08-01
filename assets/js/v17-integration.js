/**
 * SF AI V17 — Unified Integration Layer
 * Connects all V17 modules to the existing V15/V16 chat system.
 * Must be loaded AFTER v15-integration.js and v16-integration.js.
 */

import { SFPWA } from './pwa.js';
import { SFMarket } from './market.js';
import { SFPush } from './push.js';
import { SFMaps } from './maps.js';
import { SFMonitor } from './monitor.js';
import { SFBackup } from './backup.js';
import { SFExport } from './export.js';
import { SFA11y } from './a11y.js';
import { SFOffline } from './offline-mode.js';

const VERSION = 'SF AI V17';
const MODULES = { PWA: SFPWA, Market: SFMarket, Push: SFPush, Maps: SFMaps,
    Monitor: SFMonitor, Backup: SFBackup, Export: SFExport, A11y: SFA11y, Offline: SFOffline };

let ready = false;
let t0 = Date.now();
const log = (m) => console.log(`[V17] ${m}`);
const warn = (m, e) => console.warn(`[V17] ${m}`, e || '');
const safe = (fn) => { try { return fn(); } catch (e) { warn('op failed', e); return null; } };

/* ── Module init ──────────────────────────────────── */
async function initModules() {
    for (const [name, mod] of Object.entries(MODULES)) {
        if (!mod) { warn(`${name} not loaded`); continue; }
        try { if (typeof mod.init === 'function') await mod.init(); log(`${name} OK`); }
        catch (e) { warn(`${name} init failed`, e); }
    }
    ready = true;
}

/* ── Chat send hooks ──────────────────────────────── */
function hookChat() {
    const sf = window.SFChat;
    if (sf && typeof sf.send === 'function') {
        const orig = sf.send;
        sf.send = async function (msg) {
            const t = Date.now();
            if (SFMonitor) safe(() => SFMonitor.trackSearch(msg, 0, t));
            try {
                const r = await orig.call(this, msg);
                if (SFMonitor) safe(() => SFMonitor.trackLatency('chat', Date.now() - t, true));
                return r;
            } catch (err) {
                if (SFMonitor) { safe(() => SFMonitor.trackError(err, { action: 'chat' })); safe(() => SFMonitor.trackLatency('chat', Date.now() - t, false)); }
                throw err;
            }
        };
        log('Chat hook installed');
    }

    const raw = window._sfSendMessage;
    if (typeof raw === 'function') {
        window._sfSendMessage = async function (...a) {
            const t = Date.now();
            try { const r = await raw.apply(this, a); if (SFMonitor) safe(() => SFMonitor.trackLatency('internal', Date.now() - t, true)); return r; }
            catch (e) { if (SFMonitor) { safe(() => SFMonitor.trackError(e, { action: 'internal' })); safe(() => SFMonitor.trackLatency('internal', Date.now() - t, false)); } throw e; }
        };
        log('Internal hook installed');
    }
}

/* ── Toolbar buttons ──────────────────────────────── */
function addToolbar() {
    const tb = document.querySelector('.sf-toolbar, .ai-toolbar, .chat-header-actions');
    if (!tb) { setTimeout(addToolbar, 1500); return; }
    if (tb.querySelector('.v17-btn')) return;

    [
        { icon: '🏪', tip: 'বাজার মূল্য', fn: openMarket },
        { icon: '📍', tip: 'ডিলার খুঁজুন', fn: openDealers },
        { icon: '📤', tip: 'এক্সপোর্ট', fn: openExport },
        { icon: '💾', tip: 'ব্যাকআপ', fn: openBackup },
        { icon: '♿', tip: 'প্রবেশযোগ্যতা', fn: openA11y },
    ].forEach(b => {
        const el = document.createElement('button');
        el.className = 'header-btn v17-btn';
        el.title = b.tip;
        el.setAttribute('aria-label', b.tip);
        el.textContent = b.icon;
        el.addEventListener('click', b.fn);
        tb.appendChild(el);
    });
    log('Toolbar buttons added');
}

/* ── Panel helpers ────────────────────────────────── */
function getMsgs() { return document.getElementById('chat-messages'); }

function panel(html) {
    const el = getMsgs(); if (!el) return null;
    const w = document.createElement('div');
    w.className = 'message-wrapper bot-message-wrapper v17-panel-wrapper';
    w.innerHTML = `<div class="message-avatar bot-avatar"><i class="fas fa-leaf"></i></div>
        <div class="message-content"><div class="message-bubble bot-bubble v17-panel">${html}</div>
        <span class="message-time">${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span></div>`;
    el.appendChild(w);
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    return w;
}

/* ── Feature panels ───────────────────────────────── */
function openMarket() {
    const w = panel(`<h4 style="margin:0 0 8px">🏪 বাজার মূল্য</h4>
        <select id="v17-mkt-dist" style="padding:4px 8px;border:1px solid #ccc;border-radius:4px;width:100%;margin-bottom:8px"><option value="">জেলা বাছাই করুন</option></select>
        <div id="v17-mkt-tbl"></div>`);
    if (!w || !SFMarket) return;
    const sel = w.querySelector('#v17-mkt-dist'), tbl = w.querySelector('#v17-mkt-tbl');
    if (SFMarket._DISTRICT_MULTIPLIERS) Object.keys(SFMarket._DISTRICT_MULTIPLIERS).forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = d; sel.appendChild(o); });
    sel.addEventListener('change', async () => {
        if (!sel.value) return; tbl.innerHTML = '<p style="color:#888">লোড হচ্ছে...</p>';
        try {
            const p = await SFMarket.getDailyPrices(sel.value);
            tbl.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#d8f3dc">
                <th style="padding:4px 6px;text-align:left">ফসল</th><th style="padding:4px 6px;text-align:right">পাইকারি</th>
                <th style="padding:4px 6px;text-align:right">খুচরা</th><th style="padding:4px 6px;text-align:center">প্রবণতা</th></tr></thead>
                <tbody>${p.map((x, i) => `<tr style="background:${i % 2 ? '#f8f9fa' : '#fff'}">
                    <td style="padding:3px 6px;border-bottom:1px solid #eee">${x.name}</td>
                    <td style="padding:3px 6px;text-align:right;border-bottom:1px solid #eee">${x.wholesale}</td>
                    <td style="padding:3px 6px;text-align:right;border-bottom:1px solid #eee">${x.retail}</td>
                    <td style="padding:3px 6px;text-align:center;border-bottom:1px solid #eee">${x.trend}</td></tr>`).join('')}</tbody></table>`;
        } catch { tbl.innerHTML = '<p style="color:red">লোডে সমস্যা।</p>'; }
    });
    if (SFPush) SFMarket.getMarketAlerts('ঢাকা').then(a => { if (a.length) SFPush.sendNotification('বাজার সতর্কতা', { body: `${a.length}টি ফসলের দাম পরিবর্তিত`, type: 'price_alert' }); }).catch(() => {});
}

function openDealers() {
    const w = panel(`<h4 style="margin:0 0 8px">📍 ডিলার ও দোকান</h4>
        <div id="v17-map" style="height:300px;border-radius:8px;overflow:hidden;background:#e8f5e9"></div>
        <p id="v17-map-info" style="margin:8px 0 0;font-size:12px;color:#888">লোড হচ্ছে...</p>`);
    if (!w || !SFMaps) return;
    const cid = 'v17-map-' + Date.now(); w.querySelector('#v17-map').id = cid;
    const info = w.querySelector('#v17-map-info');
    SFMaps.getCurrentLocation().then(pos => {
        SFMaps.init({ containerId: cid, center: [pos.lat, pos.lon], zoom: 11 });
        SFMaps.searchNearbyDealers(pos.lat, pos.lon, 100).then(d => { info.textContent = `${d.length}টি ডিলার পাওয়া গেছে`; });
    }).catch(() => { if (!SFMaps.map) SFMaps.init({ containerId: cid }); info.textContent = 'GPS পাওয়া যায়নি; সকল ডিলার দেখানো হচ্ছে।'; });
}

function openExport() {
    const id = 'v17-exp-' + Date.now(); panel(`<div id="${id}" style="padding:4px"></div>`);
    if (SFExport) SFExport.createExportPanel(id);
}

function openBackup() {
    const id = 'v17-bkp-' + Date.now(); panel(`<div id="${id}" style="padding:4px"></div>`);
    if (SFBackup) SFBackup.createBackupUI(id);
}

function openA11y() {
    const id = 'v17-a11y-' + Date.now(); panel(`<div id="${id}" style="padding:4px"><h4 style="margin:0 0 8px">♿ প্রবেশযোগ্যতা</h4></div>`);
    if (SFA11y) SFA11y.createA11yToolbar(id);
}

/* ── Cross-module wiring ──────────────────────────── */
function connectModules() {
    window.addEventListener('online', () => { if (SFOffline) safe(() => SFOffline.processQueue()); if (SFPush) SFPush.sendNotification('সংযোগ ফিরে এসেছে', { body: 'ইন্টারনেট অনলাইন' }); });
    window.addEventListener('offline', () => { if (SFOffline) safe(() => SFOffline.showOfflineBanner()); });
    if (SFBackup) safe(() => SFBackup.autoBackup());
    if (SFA11y) safe(() => SFA11y.init());
}

/* ── API & error monitoring ───────────────────────── */
function setupMonitoring() {
    window.addEventListener('error', e => { if (SFMonitor) safe(() => SFMonitor.trackError(e.error || new Error(e.message), { page: location.pathname })); });
    window.addEventListener('unhandledrejection', e => { if (SFMonitor) safe(() => SFMonitor.trackError(e.reason || new Error('promise rejection'), { page: location.pathname })); });

    const _fetch = window.fetch;
    if (typeof _fetch === 'function') {
        window.fetch = async function (...a) {
            const t = Date.now(); const url = typeof a[0] === 'string' ? a[0] : a[0]?.url || 'unknown';
            try { const r = await _fetch.apply(this, a); if (SFMonitor) safe(() => SFMonitor.trackLatency(url, Date.now() - t, r.ok)); return r; }
            catch (e) { if (SFMonitor) { safe(() => SFMonitor.trackError(e, { url })); safe(() => SFMonitor.trackLatency(url, Date.now() - t, false)); } throw e; }
        };
    }

    const _open = XMLHttpRequest.prototype.open;
    if (_open) {
        XMLHttpRequest.prototype.open = function (m, url) {
            this._v17u = url; this._v17t = Date.now();
            this.addEventListener('loadend', () => { if (SFMonitor) safe(() => SFMonitor.trackLatency(this._v17u, Date.now() - this._v17t, this.status >= 200 && this.status < 400)); });
            return _open.apply(this, arguments);
        };
    }
    log('Monitoring installed');
}

/* ── Global API & bootstrap ───────────────────────── */
function expose() {
    window.SFV17 = {
        version: VERSION, init, openMarket, openDealers, openExport, openBackup, openA11y,
        isReady: () => ready, getUptime: () => Math.round((Date.now() - t0) / 1000), modules: MODULES,
    };
}

async function init() {
    log(`${VERSION} — starting`); expose(); setupMonitoring();
    await initModules(); hookChat(); connectModules(); setTimeout(addToolbar, 500);
    log(`${VERSION} — ready`);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

export default { init, MODULES, VERSION };
