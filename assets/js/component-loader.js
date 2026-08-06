// ======================================
// Component Loader
// Sowrov Fertilizer — V22 Enterprise Platform
// ======================================

document.addEventListener("DOMContentLoaded", () => {

    // Load AI Assistant CSS
    if (!document.getElementById("ai-style")) {
        const css = document.createElement("link");
        css.id = "ai-style";
        css.rel = "stylesheet";
        css.href = "assets/css/ai.css";
        document.head.appendChild(css);
    }

    // Load AI Assistant JS
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

    // Load V15 Module Integration
    function loadV15Modules() {
        if (document.getElementById("v15-module")) return;
        const v15Script = document.createElement("script");
        v15Script.id = "v15-module";
        v15Script.type = "module";
        v15Script.src = "assets/js/v15-integration.js";
        v15Script.onload = () => console.log("V15 Smart Agriculture Loaded");
        document.body.appendChild(v15Script);
    }

    // Load V16 Enterprise Integration
    function loadV16Modules() {
        if (document.getElementById("v16-module")) return;
        const v16Script = document.createElement("script");
        v16Script.id = "v16-module";
        v16Script.type = "module";
        v16Script.src = "assets/js/v16-integration.js";
        v16Script.onload = () => console.log("V16 Enterprise Intelligence Loaded");
        document.body.appendChild(v16Script);
    }

    // Load V17 Ultimate Production
    function loadV17Modules() {
        if (document.getElementById("v17-module")) return;
        const v17Script = document.createElement("script");
        v17Script.id = "v17-module";
        v17Script.type = "module";
        v17Script.src = "assets/js/v17-integration.js";
        v17Script.onload = () => console.log("V17 Ultimate Production Loaded");
        document.body.appendChild(v17Script);
    }

    // Load V19 Self-Evolving AI
    function loadV19Modules() {
        if (document.getElementById("v19-module")) return;
        const v19Script = document.createElement("script");
        v19Script.id = "v19-module";
        v19Script.type = "module";
        v19Script.src = "assets/js/v19-integration.js";
        v19Script.onload = () => console.log("V19 Self-Evolving AI Loaded");
        document.body.appendChild(v19Script);
    }

    // Load V20 Commercial Ecosystem
    function loadV20Modules() {
        if (document.getElementById("v20-module")) return;
        const v20Script = document.createElement("script");
        v20Script.id = "v20-module";
        v20Script.type = "module";
        v20Script.src = "assets/js/v20-integration.js";
        v20Script.onload = () => console.log("V20 Commercial Ecosystem Loaded");
        document.body.appendChild(v20Script);
    }

    // Load V21 Knowledge Universe
    function loadV21Modules() {
        if (document.getElementById("v21-module")) return;
        const v21Script = document.createElement("script");
        v21Script.id = "v21-module";
        v21Script.type = "module";
        v21Script.src = "assets/js/v21-integration.js";
        v21Script.onload = () => console.log("V21 Knowledge Universe Loaded");
        document.body.appendChild(v21Script);
    }

    // Load V22 Enterprise Platform
    function loadV22Modules() {
        if (document.getElementById("v22-module")) return;
        const v22Script = document.createElement("script");
        v22Script.id = "v22-module";
        v22Script.type = "module";
        v22Script.src = "assets/js/v22-integration.js";
        v22Script.onload = () => console.log("V22 Enterprise Platform Loaded");
        document.body.appendChild(v22Script);
    }

    // Register Service Worker directly (fallback if V17 chain fails)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(reg => {
            console.log('[SW] Registered, scope:', reg.scope);
        }).catch(err => {
            console.warn('[SW] Registration failed:', err);
        });
    }

    console.log("Component Loader Loaded — V22 Enterprise Platform");
});
