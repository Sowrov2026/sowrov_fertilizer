// ======================================
// Component Loader — SINGLE SHARED COMPONENT
// Sowrov Fertilizer — V22 Enterprise Platform
// Injects: Navbar, Footer, AI Chat, All Modules
// Consolidated Navigation + Theme + i18n
// ======================================

(function () {
    'use strict';

    var CURRENT_PAGE = window.location.pathname.split('/').pop() || 'index.html';

    // ========================================
    // THEME — Apply before paint to avoid flash
    // ========================================
    (function initThemeEarly() {
        try {
            var saved = localStorage.getItem('sf-theme');
            if (saved === 'dark') {
                document.documentElement.classList.add('dark');
            } else if (saved === 'light') {
                document.documentElement.classList.remove('dark');
            } else {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                }
            }
        } catch (e) { /* storage unavailable */ }
    })();

    // ========================================
    // NAVBAR — ONE source of truth
    // Dashboard dropdown = complete navigation
    // ========================================
    function buildNavbar() {
        return '<header class="header"><div class="container"><nav class="navbar"><a href="/" class="logo">Sowrov <span>Fertilizer</span></a><div class="dash-nav"><a href="/" class="dash-nav-home" data-i18n="nav_home">Home</a><a href="/customer-login.html" class="dash-nav-login" id="sf-nav-login" data-i18n="nav_login">Login</a><div class="dash-trigger" id="sf-nav-dashboard" style="display:none"><button class="dash-trigger-btn" aria-haspopup="true" aria-expanded="false"><span data-i18n="nav_dashboard">Dashboard</span> <span class="arrow">\u25BC</span></button><div class="dash-dropdown" role="menu"><div class="dash-dropdown-label" data-i18n="menu_browse">BROWSE</div><a href="/products.html"><span class="dd-icon">\uD83C\uDF31</span> <span data-i18n="nav_products">Products</span></a><a href="/gallery.html"><span class="dd-icon">\uD83D\uDDBC\uFE0F</span> <span data-i18n="nav_gallery">Gallery</span></a><a href="/faq.html"><span class="dd-icon">\u2753</span> <span data-i18n="nav_faq">FAQ</span></a><a href="/contact.html"><span class="dd-icon">\uD83D\uDCDE</span> <span data-i18n="nav_contact">Contact</span></a><a href="/about.html"><span class="dd-icon">\u2139\uFE0F</span> <span data-i18n="nav_about">About</span></a><div class="dd-sep"></div><div class="dash-dropdown-label" data-i18n="menu_shop">SHOP</div><a href="/cart.html"><span class="dd-icon">\uD83D\uDED2</span> <span data-i18n="nav_cart">Cart</span></a><a href="/customer-orders.html"><span class="dd-icon">\uD83D\uDCE6</span> <span data-i18n="nav_orders">Orders</span></a><a href="/track-order.html"><span class="dd-icon">\uD83D\uDD0E</span> <span data-i18n="nav_track_order">Track Order</span></a><div class="dd-sep"></div><div class="dash-dropdown-label" data-i18n="menu_account">ACCOUNT</div><a href="/profile.html"><span class="dd-icon">\uD83D\uDC64</span> <span data-i18n="nav_profile">Profile</span></a><a href="/customer-dashboard.html" id="sf-nav-cust-dash" style="display:none"><span class="dd-icon">\uD83D\uDCCA</span> <span data-i18n="nav_customer_dashboard">Customer Dashboard</span></a><a href="/admin-login.html" id="sf-nav-admin-login" style="display:none"><span class="dd-icon">\uD83D\uDD10</span> <span data-i18n="nav_admin_login">Admin Login</span></a><div class="dd-sep"></div><div class="dash-dropdown-label" data-i18n="menu_support">SUPPORT</div><a href="https://wa.me/8801829775552" target="_blank"><span class="dd-icon">\uD83D\uDCAC</span> <span data-i18n="nav_whatsapp">WhatsApp Support</span></a><a href="/help.html"><span class="dd-icon">\uD83D\uDE11</span> <span data-i18n="nav_help">Help & Support</span></a><div class="dd-sep"></div><div class="dash-dropdown-label" data-i18n="menu_settings">SETTINGS</div><div class="sf-dd-submenu-trigger" data-submenu="sf-lang-submenu"><span class="dd-icon">\uD83C\uDF10</span> <span data-i18n="nav_language">Language</span> <span class="dd-arrow">\u25B6</span></div><div class="sf-dd-submenu" id="sf-lang-submenu"><div class="sf-dd-submenu-item sf-lang-option" data-lang="bn"><span class="dd-icon">\uD83D\uDD12</span> \u09AC\u09BE\u0982\u09B2\u09BE <span class="lang-check"></span></div><div class="sf-dd-submenu-item sf-lang-option" data-lang="en"><span class="dd-icon">\uD83D\uDD11</span> English <span class="lang-check"></span></div></div><div class="sf-dd-submenu-trigger" id="sf-theme-toggle" data-submenu="sf-theme-submenu"><span class="dd-icon">\uD83C\uDF13</span> <span data-i18n="nav_appearance">Appearance</span> <span class="dd-arrow">\u25B6</span></div><div class="sf-dd-submenu" id="sf-theme-submenu"><div class="sf-dd-submenu-item sf-theme-select" data-theme="light"><span class="dd-icon">\u2600\uFE0F</span> <span data-i18n="theme_light">Light Mode</span> <span class="theme-check"></span></div><div class="sf-dd-submenu-item sf-theme-select" data-theme="dark"><span class="dd-icon">\uD83C\uDF19</span> <span data-i18n="theme_dark">Dark Mode</span> <span class="theme-check"></span></div><div class="sf-dd-submenu-item sf-theme-select" data-theme="system"><span class="dd-icon">\u2699\uFE0F</span> <span data-i18n="theme_system">System Default</span> <span class="theme-check"></span></div></div><div class="dd-sep"></div><div class="dash-dropdown-label" data-i18n="menu_legal">LEGAL</div><a href="/privacy.html"><span class="dd-icon">\uD83D\uDD12</span> <span data-i18n="nav_privacy">Privacy Policy</span></a><a href="/terms.html"><span class="dd-icon">\uD83D\uDCCB</span> <span data-i18n="nav_terms">Terms & Conditions</span></a><a href="/return-policy.html"><span class="dd-icon">\u21A9\uFE0F</span> <span data-i18n="nav_return">Return / Refund Policy</span></a></div></div></nav></div></header>';
    }

    // ========================================
    // FOOTER — ONE source of truth
    // ========================================
    function buildFooter() {
        return '<footer class="footer"><div class="container"><div class="footer-grid"><div class="footer-col"><h2>Sowrov <span>Fertilizer</span></h2><p>Premium organic fertilizer manufacturer based in Maheshkhali, Cox\'s Bazar. We provide high-quality Vermicompost and Trichoderma for sustainable agriculture across Bangladesh.</p></div><div class="footer-col"><h3 data-i18n="footer_quick_links">Quick Links</h3><ul><li><a href="/">Home</a></li><li><a href="/about.html">About</a></li><li><a href="/products.html">Products</a></li><li><a href="/contact.html">Contact</a></li><li><a href="/customer-login.html" data-i18n="footer_login">Login</a></li></ul></div><div class="footer-col"><h3 data-i18n="footer_our_products">Our Products</h3><ul><li><a href="/products.html">Vermicompost</a></li><li><a href="/products.html">Trichoderma</a></li><li><a href="/products.html">Organic Fertilizer</a></li><li><a href="/products.html">Wholesale Supply</a></li></ul></div><div class="footer-col"><h3 data-i18n="footer_contact">Contact</h3><p>\uD83D\uDCCD Maheshkhali, Cox\'s Bazar</p><p>\uD83D\uDCDE 01829775552</p><p>\uD83D\uDCDE 01518945262</p><p>\u2709\uFE0F shohrahuddinsowrov2026@gmail.com</p></div></div><div class="copyright">\u00A9 2022 - 2026 <strong>Sowrov Fertilizer</strong><br>All Rights Reserved.</div></div></footer><a href="https://wa.me/8801829775552" target="_blank" class="floating-btn whatsapp-btn-only" title="WhatsApp"><img src="assets/images/icons/whatsapp.png" alt="WhatsApp"></a>';
    }

    // ========================================
    // INJECT COMPONENTS
    // ========================================
    function injectComponents() {
        var navbarEl = document.getElementById('sf-navbar');
        if (navbarEl) {
            navbarEl.outerHTML = buildNavbar();
        }
        var footerEl = document.getElementById('sf-footer');
        if (footerEl) {
            footerEl.outerHTML = buildFooter();
        }
    }

    // ========================================
    // THEME SYSTEM
    // ========================================
    function getStoredTheme() {
        try { return localStorage.getItem('sf-theme') || 'system'; } catch (e) { return 'system'; }
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

    function initThemeSystem() {
        applyTheme(getStoredTheme());
        updateThemeCheckmarks();

        document.querySelectorAll('.sf-theme-select').forEach(function (opt) {
            opt.addEventListener('click', function (e) {
                e.stopPropagation();
                var theme = this.getAttribute('data-theme');
                try { localStorage.setItem('sf-theme', theme); } catch (e) { /* ignore */ }
                applyTheme(theme);
                updateThemeCheckmarks();
            });
        });

        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
                if (getStoredTheme() === 'system') {
                    applyTheme('system');
                }
            });
        }
    }

    // ========================================
    // LANGUAGE SYSTEM
    // ========================================
    function initLanguageSystem() {
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
                }
            });
        });
    }

    // ========================================
    // NAVBAR INTERACTIONS
    // ========================================
    function initNavbar() {
        // Desktop dropdown toggle
        var trigger = document.querySelector('.dash-trigger');
        if (trigger) {
            var btn = trigger.querySelector('.dash-trigger-btn');
            if (btn) {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    trigger.classList.toggle('open');
                });
            }
            document.addEventListener('click', function (e) {
                if (!trigger.contains(e.target)) {
                    trigger.classList.remove('open');
                }
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') trigger.classList.remove('open');
            });
        }

        // Dropdown submenu toggles (Language, Appearance)
        document.querySelectorAll('.sf-dd-submenu-trigger').forEach(function (toggle) {
            toggle.addEventListener('click', function (e) {
                e.stopPropagation();
                var submenuId = this.getAttribute('data-submenu');
                var submenu = document.getElementById(submenuId);
                var arrow = this.querySelector('.dd-arrow');
                if (submenu) {
                    submenu.classList.toggle('open');
                    if (arrow) arrow.classList.toggle('open');
                }
            });
        });

        // Mark active page in menu
        document.querySelectorAll('.dash-dropdown a[href]').forEach(function (link) {
            var href = link.getAttribute('href');
            if (href) {
                var page = href.split('/').pop();
                if (page === CURRENT_PAGE || (CURRENT_PAGE === '' && page === 'index.html') || (CURRENT_PAGE === '/' && page === '')) {
                    link.classList.add('active-page');
                }
            }
        });
    }

    // ========================================
    // LOAD i18n
    // ========================================
    function loadI18n() {
        if (!document.getElementById('i18n-script')) {
            var s = document.createElement('script');
            s.id = 'i18n-script';
            s.src = 'assets/js/i18n.js';
            document.head.appendChild(s);
        }
    }

    // ========================================
    // LOAD AI ASSISTANT
    // ========================================
    function loadAI() {
        if (!document.getElementById('ai-style')) {
            var css = document.createElement('link');
            css.id = 'ai-style';
            css.rel = 'stylesheet';
            css.href = 'assets/css/ai.css';
            document.head.appendChild(css);
        }
        if (!document.getElementById('ai-script')) {
            var script = document.createElement('script');
            script.id = 'ai-script';
            script.src = 'assets/js/ai.js';
            script.onload = function () {
                console.log('AI Assistant Loaded');
                loadV15Modules();
                loadV16Modules();
                loadV17Modules();
                loadV19Modules();
                loadV20Modules();
                loadV21Modules();
                loadV22Modules();
            };
            document.body.appendChild(script);
        }
    }

    // ========================================
    // V15-V22 MODULE LOADER
    // ========================================
    function loadV15Modules() {
        if (document.getElementById('v15-module')) return;
        var s = document.createElement('script');
        s.id = 'v15-module';
        s.type = 'module';
        s.src = 'assets/js/v15-integration.js';
        s.onload = function () { console.log('V15 Smart Agriculture Loaded'); };
        document.body.appendChild(s);
    }
    function loadV16Modules() {
        if (document.getElementById('v16-module')) return;
        var s = document.createElement('script');
        s.id = 'v16-module';
        s.type = 'module';
        s.src = 'assets/js/v16-integration.js';
        s.onload = function () { console.log('V16 Enterprise Intelligence Loaded'); };
        document.body.appendChild(s);
    }
    function loadV17Modules() {
        if (document.getElementById('v17-module')) return;
        var s = document.createElement('script');
        s.id = 'v17-module';
        s.type = 'module';
        s.src = 'assets/js/v17-integration.js';
        s.onload = function () { console.log('V17 Ultimate Production Loaded'); };
        document.body.appendChild(s);
    }
    function loadV19Modules() {
        if (document.getElementById('v19-module')) return;
        var s = document.createElement('script');
        s.id = 'v19-module';
        s.type = 'module';
        s.src = 'assets/js/v19-integration.js';
        s.onload = function () { console.log('V19 Self-Evolving AI Loaded'); };
        document.body.appendChild(s);
    }
    function loadV20Modules() {
        if (document.getElementById('v20-module')) return;
        var s = document.createElement('script');
        s.id = 'v20-module';
        s.type = 'module';
        s.src = 'assets/js/v20-integration.js';
        s.onload = function () { console.log('V20 Commercial Ecosystem Loaded'); };
        document.body.appendChild(s);
    }
    function loadV21Modules() {
        if (document.getElementById('v21-module')) return;
        var s = document.createElement('script');
        s.id = 'v21-module';
        s.type = 'module';
        s.src = 'assets/js/v21-integration.js';
        s.onload = function () { console.log('V21 Knowledge Universe Loaded'); };
        document.body.appendChild(s);
    }
    function loadV22Modules() {
        if (document.getElementById('v22-module')) return;
        var s = document.createElement('script');
        s.id = 'v22-module';
        s.type = 'module';
        s.src = 'assets/js/v22-integration.js';
        s.onload = function () { console.log('V22 Enterprise Platform Loaded'); };
        document.body.appendChild(s);
    }

    // ========================================
    // SERVICE WORKER
    // ========================================
    function registerSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(function (reg) {
                console.log('[SW] Registered, scope:', reg.scope);
            }).catch(function (err) {
                console.warn('[SW] Registration failed:', err);
            });
        }
    }

    // ========================================
    // FIREBASE AUTH STATE TO NAVBAR TOGGLE
    // ========================================
    function initAuth() {
        import('./firebase.js').then(function (firebase) {
            return import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js').then(function (fsMod) {
                listenAuth(firebase.customerAuth, firebase.adminAuth, firebase.db, fsMod);
            });
        }).catch(function (e) {
            console.warn('[Auth] Firebase init failed:', e);
        });

        function listenAuth(customerAuth, adminAuth, db, fsMod) {
            var loginEl = document.getElementById('sf-nav-login');
            var dashEl = document.getElementById('sf-nav-dashboard');
            var custDashEl = document.getElementById('sf-nav-cust-dash');
            var adminLoginEl = document.getElementById('sf-nav-admin-login');
            if (!loginEl || !dashEl) return;

            function applyNavState(isLoggedIn, isAdmin) {
                loginEl.style.display = isLoggedIn ? 'none' : '';
                dashEl.style.display = isLoggedIn ? '' : 'none';
                var custDash = isLoggedIn && !isAdmin;
                if (custDashEl) custDashEl.style.display = custDash ? '' : 'none';
                var showAdminLogin = !isAdmin;
                if (adminLoginEl) adminLoginEl.style.display = showAdminLogin ? '' : 'none';
            }

            customerAuth.onAuthStateChanged(function (user) {
                if (!user) {
                    applyNavState(false, false);
                    return;
                }
                loginEl.style.display = 'none';
                dashEl.style.display = '';
                fsMod.getDoc(fsMod.doc(db, 'users', user.uid)).then(function (snap) {
                    var data = snap.exists() ? snap.data() : null;
                    var isAdmin = data && (data.role === 'admin' || data.role === 'super_admin');
                    applyNavState(true, isAdmin);
                }).catch(function () {
                    applyNavState(true, false);
                });
            });

            adminAuth.onAuthStateChanged(function (adminUser) {
                if (!adminUser) return;
                if (CURRENT_PAGE === 'index.html' || CURRENT_PAGE === '' || CURRENT_PAGE === '/') {
                    adminAuth.signOut().catch(function () {});
                }
            });
        }
    }

    // ========================================
    // BOOT
    // ========================================
    var booted = false;
    function safeBoot() {
        if (booted) return;
        booted = true;
        boot();
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeBoot);
    } else {
        safeBoot();
    }
    window.addEventListener('load', safeBoot);

    function boot() {
        loadI18n();
        injectComponents();
        initNavbar();
        initThemeSystem();
        initLanguageSystem();
        initAuth();
        loadAI();
        registerSW();
        console.log('Component Loader - V22 Enterprise Platform | Consolidated Nav + Theme + i18n');
    }
})();
