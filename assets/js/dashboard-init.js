// ======================================
// Dashboard Init — Theme + i18n for Admin/Customer pages
// Sowrov Fertilizer
// ======================================
(function () {
    'use strict';

    var THEME_KEY = 'sf-theme';

    function getStoredTheme() {
        try { return localStorage.getItem(THEME_KEY) || 'system'; } catch (e) { return 'system'; }
    }

    function applyTheme(theme) {
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            if (document.body) document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            if (document.body) document.body.classList.remove('dark');
        }
    }

    function updateThemeCheckmarks() {
        var stored = getStoredTheme();
        document.querySelectorAll('.sf-theme-select').forEach(function (opt) {
            var check = opt.querySelector('.theme-check');
            if (check) {
                check.textContent = opt.getAttribute('data-theme') === stored ? '\u2713' : '';
            }
            if (opt.getAttribute('data-theme') === stored) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    function initThemeControls() {
        applyTheme(getStoredTheme());
        updateThemeCheckmarks();

        document.querySelectorAll('.sf-theme-select').forEach(function (opt) {
            opt.addEventListener('click', function (e) {
                e.stopPropagation();
                var theme = this.getAttribute('data-theme');
                try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
                applyTheme(theme);
                updateThemeCheckmarks();
                if (window.SFi18n) window.SFi18n.updateLangIndicators();
            });
        });

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
                if (getStoredTheme() === 'system') applyTheme('system');
            });
        }
    }

    function initLanguageControls() {
        if (window.SFi18n) {
            window.SFi18n.applyTranslations();
            window.SFi18n.updateLangIndicators();
        }

        document.querySelectorAll('.sf-lang-option').forEach(function (opt) {
            opt.addEventListener('click', function (e) {
                e.stopPropagation();
                var lang = this.getAttribute('data-lang');
                if (window.SFi18n) {
                    window.SFi18n.setLang(lang);
                    window.SFi18n.applyTranslations();
                    window.SFi18n.updateLangIndicators();
                    updateThemeCheckmarks();
                }
            });
        });
    }

    function loadI18n(callback) {
        if (window.SFi18n) { callback(); return; }
        var s = document.createElement('script');
        s.src = 'assets/js/i18n.js';
        s.onload = callback;
        s.onerror = callback;
        document.head.appendChild(s);
    }

    function boot() {
        initThemeControls();
        loadI18n(function () {
            initLanguageControls();
        });
        console.log('Dashboard Init — Theme + i18n loaded');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
