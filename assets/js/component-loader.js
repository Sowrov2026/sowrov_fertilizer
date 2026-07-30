// ======================================
// Component Loader
// Sowrov Fertilizer
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
        };
        document.body.appendChild(script);
    }

    console.log("Component Loader Loaded");
});
