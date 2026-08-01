// ======================================
// Component Loader
// Sowrov Fertilizer — V15 Smart Agriculture
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
            // Load V15 modules after AI is ready
            loadV15Modules();
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
        v15Script.onload = () => {
            console.log("V15 Smart Agriculture Modules Loaded");
        };
        document.body.appendChild(v15Script);
    }

    console.log("Component Loader Loaded — V15");
});
