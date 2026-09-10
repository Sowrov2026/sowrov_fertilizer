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
            'nav_home': 'হোম',
            'nav_login': 'লগইন',
            'nav_dashboard': 'ড্যাশবোর্ড',
            // Menu sections
            'menu_browse': 'ব্রাউজ',
            'menu_shop': 'শপ',
            'menu_account': 'অ্যাকাউন্ট',
            'menu_support': 'সাপোর্ট',
            'menu_settings': 'সেটিংস',
            'menu_legal': 'আইনি',
            // Browse
            'nav_products': 'পণ্য',
            'nav_gallery': 'গ্যালারি',
            'nav_faq': 'সাধারণ জিজ্ঞাসা',
            'nav_contact': 'যোগাযোগ',
            'nav_about': 'আমাদের সম্পর্কে',
            // Shop
            'nav_cart': 'কার্ট',
            'nav_orders': 'অর্ডার',
            'nav_track_order': 'অর্ডার ট্র্যাক করুন',
            // Account
            'nav_profile': 'প্রোফাইল',
            'nav_customer_dashboard': 'গ্রাহক ড্যাশবোর্ড',
            'nav_admin_login': 'অ্যাডমিন লগইন',
            // Support
            'nav_whatsapp': 'WhatsApp সহায়তা',
            'nav_help': 'সহায়তা ও সাপোর্ট',
            // Settings
            'nav_language': 'ভাষা',
            'nav_appearance': 'প্রদর্শন',
            'theme_light': 'লাইট মোড',
            'theme_dark': 'ডার্ক মোড',
            'theme_system': 'সিস্টেম ডিফল্ট',
            // Legal
            'nav_privacy': 'গোপনীয়তা নীতি',
            'nav_terms': 'শর্তাবলি',
            'nav_return': 'রিটার্ন / রিফান্ড নীতি',
            // Footer
            'footer_quick_links': 'দ্রুত লিঙ্ক',
            'footer_our_products': 'আমাদের পণ্য',
            'footer_contact': 'যোগাযোগ',
            'footer_login': 'লগইন',
            'footer_vermicompost': 'ভার্মিকমস্ট',
            'footer_trichoderma': 'ট্রাইকোডার্মা',
            'footer_organic': 'জৈব সার',
            'footer_wholesale': 'পাইকারি সরবরাহ',
            'footer_rights': '\u00A9 2022 - 2026 সর্বস্ব অধিকার সংরক্ষিত।',
            // Help page
            'help_title': 'সহায়তা ও সাপোর্ট',
            'help_subtitle': 'আমরা আপনাকে সাহায্য করতে প্রস্তুত',
            'help_faq_title': 'সাধারণ জিজ্ঞাসা',
            'help_faq_desc': 'আমাদের পণ্য ও সেবা সম্পর্কে সাধারণ প্রশ্নের উত্তর খুঁজুন।',
            'help_contact_title': 'সাপোর্টে যোগাযোগ',
            'help_contact_desc': 'ব্যক্তিগত সহায়তার জন্য আমাদের সাপোর্ট দলের সাথে যোগাযোগ করুন।',
            'help_whatsapp_title': 'WhatsApp সহায়তা',
            'help_whatsapp_desc': 'দ্রুত সহায়তার জন্য WhatsApp-এ সরাসরি আমাদের সাথে কথা বলুন।',
            'help_orders_title': 'অর্ডার সহায়তা',
            'help_orders_desc': 'আপনার অর্ডার ট্র্যাক করুন, অবস্থা পরীক্ষা করুন এবং কেনাকাটা পরিচালনা করুন।',
            'help_track_title': 'আপনার অর্ডার ট্র্যাক করুন',
            'help_track_desc': 'আপনার অর্ডার আইডি লিখে ডেলিভারির বর্তমান অবস্থা দেখুন।',
            // Legal pages
            'privacy_title': 'গোপনীয়তা নীতি',
            'terms_title': 'শর্তাবলি',
            'return_title': 'রিটার্ন ও রিফান্ড নীতি',
            'last_updated': 'শেষ হালনাগাদ',
            // Common
            'btn_learn_more': 'আরও জানুন',
            'btn_contact_now': 'এখনই যোগাযোগ করুন',
            'btn_chat_now': 'এখনই কথা বলুন',
            'btn_track_now': 'অর্ডার ট্র্যাক করুন',
            'btn_view_faq': 'সাধারণ জিজ্ঞাসা দেখুন',
            // Admin sidebar
            'admin_nav_dashboard': 'ড্যাশবোর্ড',
            'admin_nav_products': 'পণ্য',
            'admin_nav_gallery': 'গ্যালারি',
            'admin_nav_sales': 'বিক্রয়',
            'admin_nav_reviews': 'রিভিউ',
            'admin_nav_orders': 'অর্ডার',
            'admin_nav_users': 'ব্যবহারকারী',
            'admin_nav_reports': 'রিপোর্ট',
            'admin_nav_settings': 'সেটিংস',
            'admin_nav_logout': 'লগআউট',
            // Admin topbar
            'admin_topbar_home': 'হোম',
            'admin_topbar_dashboard': 'ড্যাশবোর্ড',
            'admin_topbar_settings': 'সেটিংস',
            'admin_topbar_logout': 'লগআউট',
            // Admin settings page
            'admin_settings_title': 'ওয়েবসাইট সেটিংস',
            'admin_settings_subtitle': 'আপনার ব্যবসায়িক তথ্য পরিচালনা করুন',
            'admin_settings_website': 'ওয়েবসাইট তথ্য',
            'admin_settings_admin_profile': 'অ্যাডমিন প্রোফাইল',
            'admin_settings_site_name': 'ওয়েবসাইটের নাম',
            'admin_settings_phone': 'ফোন',
            'admin_settings_email': 'ইমেইল',
            'admin_settings_address': 'ঠিকানা',
            'admin_settings_about': 'ওয়েবসাইট সম্পর্কে',
            'admin_settings_save': 'সেটিংস সংরক্ষণ করুন',
            'admin_settings_admin_name': 'অ্যাডমিনের নাম',
            'admin_settings_role': 'ভূমিকা',
            'admin_settings_image_url': 'প্রোফাইল ছবির URL',
            'admin_settings_update': 'প্রোফাইল আপডেট করুন',
            'admin_settings_saved': 'সংরক্ষিত হয়েছে',
            'admin_settings_updated': 'আপডেট হয়েছে',
            'admin_settings_error': 'সংরক্ষণে ত্রুটি',
            // Admin sidebar (duplicate for customer pages reuse)
            'cust_nav_dashboard': 'ড্যাশবোর্ড',
            'cust_nav_profile': 'প্রোফাইল',
            'cust_nav_orders': 'আমার অর্ডার',
            'cust_nav_reviews': 'আমার রিভিউ',
            'cust_nav_settings': 'সেটিংস',
            'cust_nav_logout': 'লগআউট',
            // Customer topbar
            'cust_topbar_home': 'হোম',
            'cust_topbar_dashboard': 'ড্যাশবোর্ড',
            'cust_topbar_profile': 'প্রোফাইল',
            'cust_topbar_logout': 'লগআউট',
            // Profile page
            'profile_title': 'আমার প্রোফাইল',
            'profile_name': 'নাম',
            'profile_email': 'ইমেইল',
            'profile_phone': 'ফোন',
            'profile_address': 'ঠিকানা',
            'profile_save': 'পরিবর্তন সংরক্ষণ করুন',
            'profile_saved': 'সংরক্ষিত হয়েছে',
            'profile_photo': 'প্রোফাইল ছবি',
            'profile_photo_upload': 'ছবি আপলোড করুন',
            'profile_change_password': 'পাসওয়ার্ড পরিবর্তন করুন',
            'profile_new_password': 'নতুন পাসওয়ার্ড',
            'profile_orders': 'মোট অর্ডার',
            'profile_spent': 'মোট ক্রয়',
            'profile_status': 'অবস্থা',
            'profile_active': 'সক্রিয়',
            // Settings controls (shared)
            'settings_appearance': 'প্রদর্শন',
            'settings_language': 'ভাষা',
            'settings_light_mode': 'লাইট মোড',
            'settings_dark_mode': 'ডার্ক মোড',
            'settings_system_default': 'সিস্টেম ডিফল্ট',
            'settings_english': 'English',
            'settings_bengali': 'বাংলা',
            'settings_save_success': 'সেটিংস সংরক্ষিত হয়েছে',
            'settings_save_error': 'সেটিংস সংরক্ষণে ত্রুটি',
            // Customer dashboard
            'cust_dashboard_title': 'গ্রাহক ড্যাশবোর্ড',
            'cust_dashboard_welcome': 'স্বাগতম',
            'cust_dashboard_total_orders': 'মোট অর্ডার',
            'cust_dashboard_total_spent': 'মোট ক্রয়',
            'cust_dashboard_status': 'অবস্থা',
            'cust_dashboard_recent_orders': 'সাম্প্রতিক অর্ডার',
            'cust_dashboard_quick_actions': 'দ্রুত পদক্ষেপ'
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
            'btn_view_faq': 'View FAQ',
            // Admin sidebar
            'admin_nav_dashboard': 'Dashboard',
            'admin_nav_products': 'Products',
            'admin_nav_gallery': 'Gallery',
            'admin_nav_sales': 'Sales',
            'admin_nav_reviews': 'Reviews',
            'admin_nav_orders': 'Orders',
            'admin_nav_users': 'Users',
            'admin_nav_reports': 'Reports',
            'admin_nav_settings': 'Settings',
            'admin_nav_logout': 'Logout',
            // Admin topbar
            'admin_topbar_home': 'Home',
            'admin_topbar_dashboard': 'Dashboard',
            'admin_topbar_settings': 'Settings',
            'admin_topbar_logout': 'Logout',
            // Admin settings page
            'admin_settings_title': 'Website Settings',
            'admin_settings_subtitle': 'Manage your business information',
            'admin_settings_website': 'Website Information',
            'admin_settings_admin_profile': 'Admin Profile',
            'admin_settings_site_name': 'Website Name',
            'admin_settings_phone': 'Phone',
            'admin_settings_email': 'Email',
            'admin_settings_address': 'Address',
            'admin_settings_about': 'About Website',
            'admin_settings_save': 'Save Settings',
            'admin_settings_admin_name': 'Admin Name',
            'admin_settings_role': 'Role',
            'admin_settings_image_url': 'Profile Image URL',
            'admin_settings_update': 'Update Profile',
            'admin_settings_saved': 'Saved successfully',
            'admin_settings_updated': 'Updated successfully',
            'admin_settings_error': 'Error saving',
            // Customer sidebar
            'cust_nav_dashboard': 'Dashboard',
            'cust_nav_profile': 'Profile',
            'cust_nav_orders': 'My Orders',
            'cust_nav_reviews': 'My Reviews',
            'cust_nav_settings': 'Settings',
            'cust_nav_logout': 'Logout',
            // Customer topbar
            'cust_topbar_home': 'Home',
            'cust_topbar_dashboard': 'Dashboard',
            'cust_topbar_profile': 'Profile',
            'cust_topbar_logout': 'Logout',
            // Profile page
            'profile_title': 'My Profile',
            'profile_name': 'Name',
            'profile_email': 'Email',
            'profile_phone': 'Phone',
            'profile_address': 'Address',
            'profile_save': 'Save Changes',
            'profile_saved': 'Saved successfully',
            'profile_photo': 'Profile Photo',
            'profile_photo_upload': 'Upload Photo',
            'profile_change_password': 'Change Password',
            'profile_new_password': 'New Password',
            'profile_orders': 'Total Orders',
            'profile_spent': 'Total Spent',
            'profile_status': 'Status',
            'profile_active': 'Active',
            // Settings controls (shared)
            'settings_appearance': 'Appearance',
            'settings_language': 'Language',
            'settings_light_mode': 'Light Mode',
            'settings_dark_mode': 'Dark Mode',
            'settings_system_default': 'System Default',
            'settings_english': 'English',
            'settings_bengali': 'বাংলা',
            'settings_save_success': 'Settings saved successfully',
            'settings_save_error': 'Error saving settings',
            // Customer dashboard
            'cust_dashboard_title': 'Customer Dashboard',
            'cust_dashboard_welcome': 'Welcome',
            'cust_dashboard_total_orders': 'Total Orders',
            'cust_dashboard_total_spent': 'Total Spent',
            'cust_dashboard_status': 'Status',
            'cust_dashboard_recent_orders': 'Recent Orders',
            'cust_dashboard_quick_actions': 'Quick Actions'
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
