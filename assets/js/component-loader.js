// ======================================
// Component Loader — SINGLE SHARED COMPONENT
// Sowrov Fertilizer — V22 Enterprise Platform
// Injects: Navbar, Footer, AI Chat, All Modules
// ======================================

(function () {
    'use strict';

    const CURRENT_PAGE = window.location.pathname.split('/').pop() || 'index.html';

    // ========================================
    // NAVBAR — ONE source of truth
    // ========================================
    function buildNavbar() {
        return `<header class="header">
    <div class="container">
        <nav class="navbar">
            <a href="/" class="logo">Sowrov <span>Fertilizer</span></a>
            <div class="dash-nav">
                <a href="/" class="dash-nav-home">Home</a>
                <a href="/customer-login.html" class="dash-nav-login" id="sf-nav-login">Login</a>
                <div class="dash-trigger" id="sf-nav-dashboard" style="display:none">
                    <button class="dash-trigger-btn" aria-haspopup="true" aria-expanded="false">Dashboard <span class="arrow">▼</span></button>
                    <div class="dash-dropdown" role="menu">
                        <div class="dash-dropdown-label">Browse</div>
                        <a href="/products.html" class="dd-icon">📦</a><a href="/products.html">Products</a>
                        <a href="/gallery.html" class="dd-icon">🖼️</a><a href="/gallery.html">Gallery</a>
                        <a href="/faq.html" class="dd-icon">❓</a><a href="/faq.html">FAQ</a>
                        <a href="/contact.html" class="dd-icon">📞</a><a href="/contact.html">Contact</a>
                        <a href="/about.html" class="dd-icon">ℹ️</a><a href="/about.html">About</a>
                        <div class="dd-sep"></div>
                        <div class="dash-dropdown-label">Dashboards</div>
                        <a href="/customer-dashboard.html" class="dd-icon" id="sf-nav-cust-dash" style="display:none">👤</a><a href="/customer-dashboard.html" id="sf-nav-cust-dash-text" style="display:none">Customer Dashboard</a>
                        <a href="/admin-login.html" class="dd-icon" id="sf-nav-admin-login" style="display:none">🔑</a><a href="/admin-login.html" id="sf-nav-admin-login-text" style="display:none">Admin Login</a>
                        <a href="/admin-dashboard.html" class="dd-icon" id="sf-nav-admin-dashboard" style="display:none">🔧</a><a href="/admin-dashboard.html" id="sf-nav-admin-dashboard-text" style="display:none">Admin Dashboard</a>
                        <div class="dd-sep"></div>
                        <div class="dash-dropdown-label">Activity</div>
                        <a href="/customer-orders.html" class="dd-icon">📋</a><a href="/customer-orders.html">Orders</a>
                        <a href="/admin-reviews.html" class="dd-icon" id="sf-nav-admin-reviews" style="display:none">⭐</a><a href="/admin-reviews.html" id="sf-nav-admin-reviews-text" style="display:none">Reviews</a>
                        <div class="dd-sep"></div>
                        <div class="dash-dropdown-label">Account</div>
                        <a href="/profile.html" class="dd-icon">🧑</a><a href="/profile.html">Profile</a>
                        <a href="/admin-settings.html" class="dd-icon" id="sf-nav-admin-settings" style="display:none">⚙️</a><a href="/admin-settings.html" id="sf-nav-admin-settings-text" style="display:none">Settings</a>
                        <div class="dd-sep"></div>
                        <div id="sf-nav-admin-section" style="display:none"><div class="dash-dropdown-label">Admin</div>
                        <a href="/admin-reports.html" class="dd-icon">📈</a><a href="/admin-reports.html">Reports</a></div>
                        <div class="dd-sep"></div>
                        <div class="dash-dropdown-label">Support</div>
                        <a href="https://wa.me/8801829775552" target="_blank" class="dd-icon">💬</a><a href="https://wa.me/8801829775552" target="_blank">WhatsApp Support</a>
                    </div>
                </div>
            </div>
            <div class="mobile-toggle" aria-label="Open menu">☰</div>
        </nav>
    </div>
</header>
<div class="dash-slide-overlay"></div>
<div class="dash-slide-panel">
    <div class="dash-slide-header">
        <h3>Menu</h3>
        <button class="dash-slide-close" aria-label="Close menu">✕</button>
    </div>
    <div class="dash-slide-body">
        <a href="/customer-login.html" class="btn" id="sf-nav-login-mobile" style="display:none;width:100%;text-align:center;margin-bottom:12px">Login</a>
        <div id="sf-nav-dashboard-mobile" style="display:none">
            <div class="dash-slide-label">Dashboards</div>
            <a href="/customer-dashboard.html" id="sf-nav-cust-dash-mobile" style="display:none"><span class="dd-icon">👤</span> Customer Dashboard</a>
            <a href="/admin-login.html" id="sf-nav-admin-login-mobile" style="display:none"><span class="dd-icon">🔑</span> Admin Login</a>
            <a href="/admin-dashboard.html" id="sf-nav-admin-dashboard-mobile" style="display:none"><span class="dd-icon">🔧</span> Admin Dashboard</a>
            <div class="dd-sep"></div>
        </div>
        <div class="dash-slide-label">Browse</div>
        <a href="/products.html"><span class="dd-icon">📦</span> Products</a>
        <a href="/gallery.html"><span class="dd-icon">🖼️</span> Gallery</a>
        <a href="/faq.html"><span class="dd-icon">❓</span> FAQ</a>
        <a href="/contact.html"><span class="dd-icon">📞</span> Contact</a>
        <a href="/about.html"><span class="dd-icon">ℹ️</span> About</a>
        <div class="dd-sep"></div>
        <div class="dash-slide-label">Activity</div>
        <a href="/customer-orders.html"><span class="dd-icon">📋</span> Orders</a>
        <a href="/admin-reviews.html" id="sf-nav-admin-reviews-mobile" style="display:none"><span class="dd-icon">⭐</span> Reviews</a>
        <div class="dd-sep"></div>
        <div class="dash-slide-label">Account</div>
        <a href="/profile.html"><span class="dd-icon">🧑</span> Profile</a>
        <a href="/admin-settings.html" id="sf-nav-admin-settings-mobile" style="display:none"><span class="dd-icon">⚙️</span> Settings</a>
        <div class="dd-sep"></div>
        <div id="sf-nav-admin-section-mobile" style="display:none"><div class="dash-slide-label">Admin</div>
        <a href="/admin-reports.html"><span class="dd-icon">📈</span> Reports</a></div>
        <div class="dd-sep"></div>
        <div class="dash-slide-label">Support</div>
        <a href="https://wa.me/8801829775552" target="_blank"><span class="dd-icon">💬</span> WhatsApp Support</a>
    </div>
</div>`;
    }

    // ========================================
    // FOOTER — ONE source of truth
    // ========================================
    function buildFooter() {
        return `<footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-col">
                    <h2>Sowrov <span>Fertilizer</span></h2>
                    <p>Premium organic fertilizer manufacturer based in Maheshkhali, Cox's Bazar. We provide high-quality Vermicompost and Trichoderma for sustainable agriculture across Bangladesh.</p>
                </div>
                <div class="footer-col">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/about.html">About</a></li>
                        <li><a href="/products.html">Products</a></li>
                        <li><a href="/contact.html">Contact</a></li>
                        <li><a href="/customer-login.html">Login</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Our Products</h3>
                    <ul>
                        <li><a href="/products.html">Vermicompost</a></li>
                        <li><a href="/products.html">Trichoderma</a></li>
                        <li><a href="/products.html">Organic Fertilizer</a></li>
                        <li><a href="/products.html">Wholesale Supply</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Contact</h3>
                    <p>📍 Maheshkhali, Cox's Bazar</p>
                    <p>📞 01829775552</p>
                    <p>📞 01518945262</p>
                    <p>✉️ shohrahuddinsowrov2026@gmail.com</p>
                </div>
            </div>
            <div class="copyright">© 2022 - 2026 <strong>Sowrov Fertilizer</strong><br>All Rights Reserved.</div>
        </div>
    </footer>

    <!-- WhatsApp Floating Button -->
    <a href="https://wa.me/8801829775552" target="_blank" class="floating-btn whatsapp-btn-only" title="WhatsApp">
        <img src="assets/images/icons/whatsapp.png" alt="WhatsApp">
    </a>`;
    }

    // ========================================
    // INJECT COMPONENTS
    // ========================================
    function injectComponents() {
        // Inject navbar if placeholder exists
        const navbarEl = document.getElementById('sf-navbar');
        if (navbarEl) {
            navbarEl.outerHTML = buildNavbar();
        }

        // Inject footer if placeholder exists
        const footerEl = document.getElementById('sf-footer');
        if (footerEl) {
            footerEl.outerHTML = buildFooter();
        }
    }

    // ========================================
    // NAVBAR INTERACTIONS (dropdown, mobile, active page)
    // ========================================
    function initNavbar() {
        // Desktop dropdown toggle
        const trigger = document.querySelector('.dash-trigger');
        if (trigger) {
            const btn = trigger.querySelector('.dash-trigger-btn');
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

        // Mobile slide panel
        const overlay = document.querySelector('.dash-slide-overlay');
        const panel = document.querySelector('.dash-slide-panel');
        const closeBtn = document.querySelector('.dash-slide-close');
        const mobileToggle = document.querySelector('.mobile-toggle');

        function openSlide() {
            if (overlay) overlay.classList.add('open');
            if (panel) panel.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        function closeSlide() {
            if (overlay) overlay.classList.remove('open');
            if (panel) panel.classList.remove('open');
            document.body.style.overflow = '';
        }

        if (mobileToggle) mobileToggle.addEventListener('click', openSlide);
        if (closeBtn) closeBtn.addEventListener('click', closeSlide);
        if (overlay) overlay.addEventListener('click', closeSlide);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeSlide();
        });

        // Mark active page in dropdowns
        document.querySelectorAll('.dash-dropdown a[href], .dash-slide-body a[href]').forEach(function (link) {
            const href = link.getAttribute('href');
            if (href) {
                const page = href.split('/').pop();
                if (page === CURRENT_PAGE || (CURRENT_PAGE === '' && page === 'index.html') || (CURRENT_PAGE === '/' && page === '')) {
                    link.classList.add('active-page');
                }
            }
        });
    }

    // ========================================
    // LOAD AI ASSISTANT
    // ========================================
    function loadAI() {
        // Load CSS
        if (!document.getElementById("ai-style")) {
            const css = document.createElement("link");
            css.id = "ai-style";
            css.rel = "stylesheet";
            css.href = "assets/css/ai.css";
            document.head.appendChild(css);
        }

        // Load JS
        if (!document.getElementById("ai-script")) {
            const script = document.createElement("script");
            script.id = "ai-script";
            script.src = "assets/js/ai.js";
            script.onload = () => {
                console.log("AI Assistant Loaded");
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
    // V15–V22 MODULE LOADER
    // ========================================
    function loadV15Modules() {
        if (document.getElementById("v15-module")) return;
        const s = document.createElement("script");
        s.id = "v15-module";
        s.type = "module";
        s.src = "assets/js/v15-integration.js";
        s.onload = () => console.log("V15 Smart Agriculture Loaded");
        document.body.appendChild(s);
    }
    function loadV16Modules() {
        if (document.getElementById("v16-module")) return;
        const s = document.createElement("script");
        s.id = "v16-module";
        s.type = "module";
        s.src = "assets/js/v16-integration.js";
        s.onload = () => console.log("V16 Enterprise Intelligence Loaded");
        document.body.appendChild(s);
    }
    function loadV17Modules() {
        if (document.getElementById("v17-module")) return;
        const s = document.createElement("script");
        s.id = "v17-module";
        s.type = "module";
        s.src = "assets/js/v17-integration.js";
        s.onload = () => console.log("V17 Ultimate Production Loaded");
        document.body.appendChild(s);
    }
    function loadV19Modules() {
        if (document.getElementById("v19-module")) return;
        const s = document.createElement("script");
        s.id = "v19-module";
        s.type = "module";
        s.src = "assets/js/v19-integration.js";
        s.onload = () => console.log("V19 Self-Evolving AI Loaded");
        document.body.appendChild(s);
    }
    function loadV20Modules() {
        if (document.getElementById("v20-module")) return;
        const s = document.createElement("script");
        s.id = "v20-module";
        s.type = "module";
        s.src = "assets/js/v20-integration.js";
        s.onload = () => console.log("V20 Commercial Ecosystem Loaded");
        document.body.appendChild(s);
    }
    function loadV21Modules() {
        if (document.getElementById("v21-module")) return;
        const s = document.createElement("script");
        s.id = "v21-module";
        s.type = "module";
        s.src = "assets/js/v21-integration.js";
        s.onload = () => console.log("V21 Knowledge Universe Loaded");
        document.body.appendChild(s);
    }
    function loadV22Modules() {
        if (document.getElementById("v22-module")) return;
        const s = document.createElement("script");
        s.id = "v22-module";
        s.type = "module";
        s.src = "assets/js/v22-integration.js";
        s.onload = () => console.log("V22 Enterprise Platform Loaded");
        document.body.appendChild(s);
    }

    // ========================================
    // SERVICE WORKER
    // ========================================
    function registerSW() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').then(reg => {
                console.log('[SW] Registered, scope:', reg.scope);
            }).catch(err => {
                console.warn('[SW] Registration failed:', err);
            });
        }
    }

    // ========================================
    // FIREBASE AUTH STATE → NAVBAR TOGGLE
    // ========================================
    function initAuth() {
        if (!window.firebase) {
            import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js')
                .then(function (appMod) {
                    return Promise.all([
                        import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'),
                        import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js')
                    ]).then(function (mods) {
                        var authMod = mods[0];
                        var fsMod = mods[1];
                        var cfg = {
                            apiKey: "AIzaSyCwD4knvy0O2KlGFte7qfHsAkiS8QeMRB8",
                            authDomain: "sowrov-fertilizer-905de.firebaseapp.com",
                            projectId: "sowrov-fertilizer-905de",
                            storageBucket: "sowrov-fertilizer-905de.firebasestorage.app",
                            messagingSenderId: "726860595005",
                            appId: "1:726860595005:web:76b82c1d32a72e98c98f54"
                        };
                        var app = appMod.initializeApp(cfg);
                        var auth = authMod.getAuth(app);
                        var db = fsMod.getFirestore(app);
                        window.firebase = { app: app, auth: auth, db: db, fsMod: fsMod };
                        listenAuth(auth, db, fsMod);
                    });
                })
                .catch(function (e) { console.warn('[Auth] Firebase init failed:', e); });
        } else {
            listenAuth(window.firebase.auth, window.firebase.db, window.firebase.fsMod);
        }

        function listenAuth(auth, db, fsMod) {
            var loginEl = document.getElementById('sf-nav-login');
            var dashEl = document.getElementById('sf-nav-dashboard');
            var loginMobile = document.getElementById('sf-nav-login-mobile');
            var dashMobile = document.getElementById('sf-nav-dashboard-mobile');
            var custDashEl = document.getElementById('sf-nav-cust-dash');
            var custDashTextEl = document.getElementById('sf-nav-cust-dash-text');
            var custDashMobile = document.getElementById('sf-nav-cust-dash-mobile');
            var adminLoginEl = document.getElementById('sf-nav-admin-login');
            var adminLoginTextEl = document.getElementById('sf-nav-admin-login-text');
            var adminLoginMobile = document.getElementById('sf-nav-admin-login-mobile');
            var adminDashEl = document.getElementById('sf-nav-admin-dashboard');
            var adminDashTextEl = document.getElementById('sf-nav-admin-dashboard-text');
            var adminDashMobile = document.getElementById('sf-nav-admin-dashboard-mobile');
            var adminSectionEl = document.getElementById('sf-nav-admin-section');
            var adminSectionMobile = document.getElementById('sf-nav-admin-section-mobile');
            var adminReviewsEl = document.getElementById('sf-nav-admin-reviews');
            var adminReviewsTextEl = document.getElementById('sf-nav-admin-reviews-text');
            var adminReviewsMobile = document.getElementById('sf-nav-admin-reviews-mobile');
            var adminSettingsEl = document.getElementById('sf-nav-admin-settings');
            var adminSettingsTextEl = document.getElementById('sf-nav-admin-settings-text');
            var adminSettingsMobile = document.getElementById('sf-nav-admin-settings-mobile');
            if (!loginEl || !dashEl) return;

            function applyNavState(isLoggedIn, isAdmin) {
                loginEl.style.display = isLoggedIn ? 'none' : '';
                if (loginMobile) loginMobile.style.display = isLoggedIn ? 'none' : '';
                dashEl.style.display = isLoggedIn ? '' : 'none';
                if (dashMobile) dashMobile.style.display = isLoggedIn ? '' : 'none';
                var custDash = isLoggedIn && !isAdmin;
                if (custDashEl) custDashEl.style.display = custDash ? '' : 'none';
                if (custDashTextEl) custDashTextEl.style.display = custDash ? '' : 'none';
                if (custDashMobile) custDashMobile.style.display = custDash ? '' : 'none';
                var showAdminLogin = !isAdmin;
                if (adminLoginEl) adminLoginEl.style.display = showAdminLogin ? '' : 'none';
                if (adminLoginTextEl) adminLoginTextEl.style.display = showAdminLogin ? '' : 'none';
                if (adminLoginMobile) adminLoginMobile.style.display = showAdminLogin ? '' : 'none';
                if (adminDashEl) adminDashEl.style.display = isAdmin ? '' : 'none';
                if (adminDashTextEl) adminDashTextEl.style.display = isAdmin ? '' : 'none';
                if (adminDashMobile) adminDashMobile.style.display = isAdmin ? '' : 'none';
                if (adminSectionEl) adminSectionEl.style.display = isAdmin ? '' : 'none';
                if (adminSectionMobile) adminSectionMobile.style.display = isAdmin ? '' : 'none';
                if (adminReviewsEl) adminReviewsEl.style.display = isAdmin ? '' : 'none';
                if (adminReviewsTextEl) adminReviewsTextEl.style.display = isAdmin ? '' : 'none';
                if (adminReviewsMobile) adminReviewsMobile.style.display = isAdmin ? '' : 'none';
                if (adminSettingsEl) adminSettingsEl.style.display = isAdmin ? '' : 'none';
                if (adminSettingsTextEl) adminSettingsTextEl.style.display = isAdmin ? '' : 'none';
                if (adminSettingsMobile) adminSettingsMobile.style.display = isAdmin ? '' : 'none';
            }

            auth.onAuthStateChanged(function (user) {
                if (!user) {
                    applyNavState(false, false);
                    return;
                }
                loginEl.style.display = 'none';
                if (loginMobile) loginMobile.style.display = 'none';
                dashEl.style.display = '';
                if (dashMobile) dashMobile.style.display = '';
                fsMod.getDoc(fsMod.doc(db, 'users', user.uid)).then(function (snap) {
                    var data = snap.exists() ? snap.data() : null;
                    var isAdmin = data && (data.role === 'admin' || data.role === 'super_admin');
                    applyNavState(true, isAdmin);
                }).catch(function () {
                    applyNavState(true, false);
                });
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
        injectComponents();
        initNavbar();
        initAuth();
        loadAI();
        registerSW();
        console.log("Component Loader — V22 Enterprise Platform");
    }
})();
