// ======================================
// Floating Buttons — Lightweight Loader
// Loads AI Assistant + WhatsApp buttons
// For authenticated pages that don't use component-loader.js
// ======================================

(function () {
    'use strict';

    // ========================================
    // Load AI CSS
    // ========================================
    if (!document.getElementById('ai-style')) {
        var css = document.createElement('link');
        css.id = 'ai-style';
        css.rel = 'stylesheet';
        css.href = 'assets/css/ai.css';
        document.head.appendChild(css);
    }

    // ========================================
    // Load AI JS (creates chat-toggle button + chat window)
    // ========================================
    if (!document.getElementById('ai-script')) {
        var aiScript = document.createElement('script');
        aiScript.id = 'ai-script';
        aiScript.src = 'assets/js/ai.js';
        aiScript.onload = function () {
            console.log('AI Assistant Loaded (floating-buttons)');
        };
        document.body.appendChild(aiScript);
    }

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
