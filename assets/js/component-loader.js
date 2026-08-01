// ======================================
// Component Loader
// Sowrov Fertilizer — V19 Self-Evolving AI
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

    console.log("Component Loader Loaded — V19 Self-Evolving AI");
});
