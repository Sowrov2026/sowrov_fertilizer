// ======================================
// i18n — Lightweight Language System
// Sowrov Fertilizer
// Supports: Bengali (bn) / English (en)
// ======================================

(function () {
    'use strict';

    var STORAGE_KEY = 'sf-lang';

    var translations = {
        bn: {
            // Navbar
            'nav_home': '\u09B9\u09B8\u09B8\u09BE\u09A8',
            'nav_login': '\u09B2\u0997\u0987\u09A8',
            'nav_dashboard': '\u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1',
            // Menu sections
            'menu_browse': '\u09AC\u09CD\u09B0\u09BE\u0989\u099C',
            'menu_shop': '\u09B8\u09A1\u09BC\u09B9\u09C7\u09B0',
            'menu_account': '\u09A6\u09C8\u09A8\u09CD\u09A4\u09BE',
            'menu_support': '\u09B8\u09AE\u09B0\u09CD\u09A5\u09A8',
            'menu_settings': '\u09B8\u09C7\u09A4\u09A4\u09C7',
            'menu_legal': '\u0986\u0987\u09A8\u09C7\u09A4\u09BF\u0995',
            // Browse
            'nav_products': '\u09AA\u09A3\u09CD\u09AF',
            'nav_gallery': '\u0997\u09CD\u09AF\u09be\u09B2\u09B0\u09BF',
            'nav_faq': '\u09B8\u09B9\u099C \u09B0 \u09B8\u09AE\u09BE\u09A7',
            'nav_contact': '\u09AF\u09CB\u0997\u09AF\u09CB\u0997',
            'nav_about': '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09AE\u09CD\u09AA\u09B0\u09CD\u0995\u09C7',
            // Shop
            'nav_cart': '\u0995\u09BE\u09B0\u09CD\u099F',
            'nav_orders': '\u09A4\u09A3\u09B8\u09C2\u09B9',
            'nav_track_order': '\u09A4\u09A3\u09B8 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995',
            // Account
            'nav_profile': '\u09AA\u09CD\u09B0\u09AB\u09BE\u0987\u09B2',
            'nav_customer_dashboard': '\u0995\u09CD\u09B0\u09BF\u09AF\u09BC\u09A8\u09CD\u09A4 \u09A1\u09CD\u09AF\u09BE\u09B6\u09AC\u09CB\u09B0\u09CD\u09A1',
            'nav_admin_login': '\u09A1\u09CD\u09A1\u09B6\u09B8 \u09B2\u0997\u09BF\u09A8',
            // Support
            'nav_whatsapp': '\u0993\u09AF\u09BC\u09BE\u09B9\u09CD\u09B8\u09CD\u09AF\u09BE\u09AA \u09B8\u09AE\u09B0\u09CD\u09A5\u09A8',
            'nav_help': '\u09B8\u09B9\u09BE\u09AF\u09BC \u09B8\u09AE\u09B0\u09CD\u09A5\u09A8',
            // Settings
            'nav_language': '\u09AD\u09BE\u09B7\u09BE',
            'nav_appearance': '\u099A\u09C7\u09B9\u09B0\u09BE',
            'theme_light': '\u09B9\u09B2\u0995\u09BE\u09B0 \u09AE\u09CB\u09A1',
            'theme_dark': '\u0997\u09BE\u09A1\u09BE\u09B0 \u09AE\u09CB\u09A1',
            'theme_system': '\u09B8\u09BF\u09B8\u09CD\u099F\u09C7\u09AE \u09A1\u09BF\u09AB\u09BE\u09B2\u09CD\u099F',
            // Legal
            'nav_privacy': '\u0997\u09CB\u09AA\u09A8\u09BF\u09AF\u09A4\u09BE \u09A8\u09A4\u09A4\u09CD\u09A4',
            'nav_terms': '\u09B6\u09B0\u09CD\u09A4\u09A4\u09BE \u09B6\u09B0\u09CD\u09A4\u09BE\u09A6\u09BF',
            'nav_return': '\u09AB\u09C7\u09B0\u09A4 \u09B6\u09A4\u09C7 \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u09A8\u09A4\u09A4\u09CD\u09A4',
            // Footer
            'footer_quick_links': '\u09A6\u09CD\u09B0\u09C1\u09A4 \u09B2\u09BF\u0999\u09CD\u0995',
            'footer_our_products': '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09A3\u09CD\u09AF',
            'footer_contact': '\u09AF\u09CB\u0997\u09AF\u09CB\u0997',
            'footer_login': '\u09B2\u0997\u09BF\u09A8',
            'footer_vermicompost': '\u09AD\u09BE\u09B0\u09CD\u09AE\u09BF\u0995\u09B8\u09AE\u09CD\u09AA\u09B8\u09CD\u099F',
            'footer_trichoderma': '\u099F\u09CD\u09B0\u09BE\u0987\u0995\u09CB\u09A1\u09B0\u09CD\u09AE\u09BE',
            'footer_organic': '\u099C\u09C8\u09B5 \u09B8\u09BE\u09B0',
            'footer_wholesale': '\u09AA\u09B8\u09CD\u099F\u09B0 \u09B8\u09B0\u09AC\u09B0\u09BE\u09B9\u09A4',
            'footer_rights': '\u00A9 2022 - 2026 \u09B8\u09B0\u09CD\u09B5\u09B8\u09CD\u09B5 \u09A5\u09A4\u09CD\u09A4\u09B8\u09AC\u09B0\u0995\u09B8\u09A4\u09B9 \u09B0\u09B9\u09B9\u09F7',
            // Help page
            'help_title': '\u09B8\u09B9\u09BE\u09AF\u09BC \u09B8\u09AE\u09B0\u09CD\u09A5\u09A8',
            'help_subtitle': '\u0986\u09AE\u09B0\u09BE \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09B9\u09BE\u09AF\u09BC \u0995\u09B0\u09A4\u09C7 \u09A4\u09B2\u09B0\u09F7',
            'help_faq_title': '\u09B8\u09B9\u099C \u09B0 \u09B8\u09AE\u09BE\u09A7',
            'help_faq_desc': '\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09AA\u09A3\u09CD\u09AF \u09A4\u09A4\u09A4\u09CD\u09A4 \u09B8\u09B9 \u09B8\u09C7\u09AC\u09BE \u099B\u09A1\u09BC\u09A4\u09C7 \u09A1\u09A8 \u09B8\u09AE\u09BE\u09A7 \u09AA\u09BE\u09A8\u09A8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF\u09CD\u09A1\u09A4\u09BE\u09B0 \u0996\u09C1\u099C\u09A8\u09A4\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u0995\u09B0\u09C7\u09A8\u09F7',
            'help_contact_title': '\u09B8\u09AE\u09B0\u09CD\u09A5\u09A8 \u09AF\u09CB\u0997\u09AF\u09CB\u0997',
            'help_contact_desc': '\u09A1\u09CD\u09AF\u09BE\u0995\u09CD\u09A4\u09BF\u0995 \u09B8\u09B9\u09BE\u09AF\u09BC\u09B0 \u099C\u09A8\u09CD\u09AF \u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B8\u09AE\u09B0\u09CD\u09A5\u09A8 \u09A6\u09B2\u09A4\u09BE \u09B8\u09A6\u09B9\u09B8\u09CD\u09AA\u09A4 \u09B9\u09A8\u09A4\u09C7 \u09AF\u09CB\u0997 \u09A6\u09BF\u09A8\u09CD\u09B8\u09B9\u09A8\u09B9\u09B8\u09CD\u09A4\u09CD\u09B0 \u09B8\u09C0\u09A8\u09E1',
            'help_whatsapp_title': '\u0993\u09AF\u09BC\u09BE\u09B9\u09CD\u09B8\u09CD\u09AF\u09BE\u09AA \u09B8\u09AE\u09B0\u09CD\u09A5\u09A8',
            'help_whatsapp_desc': '\u09A6\u09CD\u09B0\u09C1\u09A4\u09A4\u09CD\u09A1 \u09B8\u09AE\u09B0\u09CD\u09A5\u09A8\u09A6\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u09B8\u09B0\u09BE\u09B8\u09B0\u09BF \u0993\u09AF\u09BC\u09BE\u09B9\u09CD\u09B8\u09CD\u09AF\u09BE\u09AA\u09C7 \u0995\u09A5\u09BE \u09B9\u09A8\u09C7\u09B0 \u09B8\u09CD\u09A5\u09CD\u09A6 \u09A8\u09BF\u09A8\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7\u09B6 \u0995\u09B0\u09C7\u09A8\u09F7',
            'help_orders_title': '\u09A4\u09A3\u09B8 \u09B8\u09AE\u09B0\u09CD\u09A5\u09A8',
            'help_orders_desc': '\u0986\u09AA\u09A8\u09BE\u09B0 \u09A4\u09A3\u09B8 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995 \u0995\u09B0\u09C1\u09A8, \u09B8\u09CD\u09A5\u09BF\u09A4\u09BF \u09AA\u09B0\u09BF\u0995\u09CD\u09B7\u09BE \u09A5\u09BE\u0995\u09C1\u09A8 \u09A7\u09B0\u09A8\u09C7\u09B0 \u09B8\u09BE\u09A5\u09C7 \u09AA\u09B0\u09BF\u09A4\u09CD\u09AA\u09BE\u09B2\u09A8 \u09B8\u09B8\u09CD\u09A5\u09BE\u09AA\u09A8 \u0995\u09B0\u09C1\u09A8\u09F7',
            'help_track_title': '\u0986\u09AA\u09A8\u09BE\u09B0 \u09A4\u09A3\u09B8 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995 \u0995\u09B0\u09C1\u09A8',
            'help_track_desc': '\u0986\u09AA\u09A8\u09BE\u09B0 \u09A4\u09A3\u09B8 \u0986\u0986\u09B8 \u09A6\u09BF\u09AF\u09BC\u09C7 \u099F\u09C7\u09AA\u09C7 \u09A1\u09BF\u09B2\u09BF\u09AC\u09B0\u09CD\u09B0\u09A4\u09BE\u09B0 \u09AC\u09B0\u09CD\u09A4\u09AE\u09BE\u09A8 \u099A\u09C7\u0995 \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09C7\u09A8\u09F7',
            // Legal pages
            'privacy_title': '\u0997\u09CB\u09AA\u09A8\u09BF\u09AF\u09A4\u09BE \u09A8\u09A4\u09A4\u09CD\u09A4',
            'terms_title': '\u09B6\u09B0\u09CD\u09A4\u09A4\u09BE \u09B6\u09B0\u09CD\u09A4\u09A6\u09BF',
            'return_title': '\u09AB\u09C7\u09B0\u09A4 \u09B6\u09A4\u09C7 \u09B0\u09BF\u09AB\u09BE\u09A8\u09CD\u09A1 \u09A8\u09A4\u09A4\u09CD\u09A4',
            'last_updated': '\u09B6\u09C7\u09B7 \u09B8\u09B6\u09B8\u09B0\u09CD\u09A7\u09BF\u09A4',
            // Common
            'btn_learn_more': '\u09A4\u09A4\u09CD\u09A4\u09B8\u09B8\u09BE\u09A6 \u09A7\u09B0\u09A8',
            'btn_contact_now': '\u09AF\u09CB\u0997\u09AF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8',
            'btn_chat_now': '\u0995\u09A5\u09BE \u0995\u09B0\u09C1\u09A8',
            'btn_track_now': '\u09A4\u09A3\u09B8 \u099F\u09CD\u09B0\u09CD\u09AF\u09BE\u0995',
            'btn_view_faq': '\u09B8\u09B9\u099C \u09B0 \u09B8\u09AE\u09BE\u09A7 \u09A6\u09C7\u0996\u09C1\u09A8'
        },
        en: {
            // Navbar
            'nav_home': 'Home',
            'nav_login': 'Login',
            'nav_dashboard': 'Dashboard',
            // Menu sections
            'menu_browse': 'BROWSE',
            'menu_shop': 'SHOP',
            'menu_account': 'ACCOUNT',
            'menu_support': 'SUPPORT',
            'menu_settings': 'SETTINGS',
            'menu_legal': 'LEGAL',
            // Browse
            'nav_products': 'Products',
            'nav_gallery': 'Gallery',
            'nav_faq': 'FAQ',
            'nav_contact': 'Contact',
            'nav_about': 'About',
            // Shop
            'nav_cart': 'Cart',
            'nav_orders': 'Orders',
            'nav_track_order': 'Track Order',
            // Account
            'nav_profile': 'Profile',
            'nav_customer_dashboard': 'Customer Dashboard',
            'nav_admin_login': 'Admin Login',
            // Support
            'nav_whatsapp': 'WhatsApp Support',
            'nav_help': 'Help & Support',
            // Settings
            'nav_language': 'Language',
            'nav_appearance': 'Appearance',
            'theme_light': 'Light Mode',
            'theme_dark': 'Dark Mode',
            'theme_system': 'System Default',
            // Legal
            'nav_privacy': 'Privacy Policy',
            'nav_terms': 'Terms & Conditions',
            'nav_return': 'Return / Refund Policy',
            // Footer
            'footer_quick_links': 'Quick Links',
            'footer_our_products': 'Our Products',
            'footer_contact': 'Contact',
            'footer_login': 'Login',
            'footer_vermicompost': 'Vermicompost',
            'footer_trichoderma': 'Trichoderma',
            'footer_organic': 'Organic Fertilizer',
            'footer_wholesale': 'Wholesale Supply',
            'footer_rights': '\u00A9 2022 - 2026 All Rights Reserved.',
            // Help page
            'help_title': 'Help & Support',
            'help_subtitle': 'We are here to help you',
            'help_faq_title': 'Frequently Asked Questions',
            'help_faq_desc': 'Find answers to common questions about our products and services.',
            'help_contact_title': 'Contact Support',
            'help_contact_desc': 'Reach our support team for personalized assistance.',
            'help_whatsapp_title': 'WhatsApp Support',
            'help_whatsapp_desc': 'Chat with us directly on WhatsApp for quick support.',
            'help_orders_title': 'Order Help',
            'help_orders_desc': 'Track your orders, check status, and manage your purchases.',
            'help_track_title': 'Track Your Order',
            'help_track_desc': 'Enter your order ID to check the current status of your delivery.',
            // Legal pages
            'privacy_title': 'Privacy Policy',
            'terms_title': 'Terms & Conditions',
            'return_title': 'Return & Refund Policy',
            'last_updated': 'Last updated',
            // Common
            'btn_learn_more': 'Learn More',
            'btn_contact_now': 'Contact Now',
            'btn_chat_now': 'Chat Now',
            'btn_track_now': 'Track Order',
            'btn_view_faq': 'View FAQ'
        }
    };

    function getLang() {
        try { return localStorage.getItem(STORAGE_KEY) || 'bn'; } catch (e) { return 'bn'; }
    }

    function setLang(lang) {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
    }

    function t(key) {
        var lang = getLang();
        return (translations[lang] && translations[lang][key]) || (translations.en && translations.en[key]) || key;
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (key) {
                var text = t(key);
                if (el.tagName === 'INPUT' && el.type !== 'submit') {
                    el.placeholder = text;
                } else {
                    el.textContent = text;
                }
            }
        });
        document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-title');
            if (key) el.title = t(key);
        });
    }

    function updateLangIndicators() {
        var current = getLang();
        document.querySelectorAll('.sf-lang-option').forEach(function (opt) {
            var check = opt.querySelector('.lang-check');
            if (check) {
                check.textContent = opt.getAttribute('data-lang') === current ? '\u2713' : '';
            }
            if (opt.getAttribute('data-lang') === current) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    // Expose globally
    window.SFi18n = {
        getLang: getLang,
        setLang: setLang,
        t: t,
        applyTranslations: applyTranslations,
        updateLangIndicators: updateLangIndicators
    };

    // Auto-apply on load if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            applyTranslations();
            updateLangIndicators();
        });
    } else {
        applyTranslations();
        updateLangIndicators();
    }
})();
