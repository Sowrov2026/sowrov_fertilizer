// ======================================
// Floating Buttons — Lightweight Loader
// Creates WhatsApp floating button
// For authenticated pages that don't use component-loader.js
// ======================================

(function () {
    'use strict';

    // ========================================
    // Create WhatsApp Floating Button
    // ========================================
    if (!document.querySelector('.whatsapp-btn-only')) {
        var wa = document.createElement('a');
        wa.href = 'https://wa.me/8801829775552';
        wa.target = '_blank';
        wa.className = 'floating-btn whatsapp-btn-only';
        wa.title = 'WhatsApp';
        wa.innerHTML = '<img src="assets/images/icons/whatsapp.png" alt="WhatsApp">';
        document.body.appendChild(wa);
    }
})();
