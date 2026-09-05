import { RECAPTCHA_CHECKBOX_SITE_KEY } from "./app-config.js";

const SCRIPT_URL = "https://www.google.com/recaptcha/enterprise.js?render=" + RECAPTCHA_CHECKBOX_SITE_KEY;
let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks = [];

function loadScript() {
    if (scriptLoaded) { fireCallbacks(); return; }
    if (typeof grecaptcha !== "undefined" && grecaptcha.enterprise) {
        scriptLoaded = true;
        fireCallbacks();
        return;
    }
    if (scriptLoading) { return; }
    scriptLoading = true;
    const s = document.createElement("script");
    s.src = SCRIPT_URL;
    s.async = true;
    s.defer = true;
    s.onload = function () {
        scriptLoaded = true;
        scriptLoading = false;
        fireCallbacks();
    };
    s.onerror = function () {
        scriptLoading = false;
        console.error("[reCAPTCHA] Failed to load Enterprise script");
    };
    document.head.appendChild(s);
}

function fireCallbacks() {
    while (loadCallbacks.length) { loadCallbacks.shift()(); }
}

export function onRecaptchaReady(cb) {
    if (scriptLoaded) { cb(); return; }
    loadCallbacks.push(cb);
    loadScript();
}

const widgetInstances = new Map();
const tokenStore = new Map();

export function renderWidget(containerId, options) {
    onRecaptchaReady(function () {
        if (widgetInstances.has(containerId)) return;
        const container = document.getElementById(containerId);
        if (!container) return;
        const widgetId = grecaptcha.enterprise.render(container, {
            sitekey: RECAPTCHA_CHECKBOX_SITE_KEY,
            theme: (options && options.theme) || "light",
            size: "normal",
            callback: function (token) {
                tokenStore.set(containerId, token);
                const errEl = container.closest(".form-group, .recaptcha-group")
                    ? container.closest(".form-group, .recaptcha-group").querySelector(".recaptcha-error")
                    : null;
                if (errEl) errEl.style.display = "none";
            },
            "expired-callback": function () {
                tokenStore.delete(containerId);
            },
            "error-callback": function () {
                tokenStore.delete(containerId);
            }
        });
        widgetInstances.set(containerId, widgetId);
    });
}

export function getToken(containerId) {
    return tokenStore.get(containerId) || null;
}

export function resetWidget(containerId) {
    const widgetId = widgetInstances.get(containerId);
    if (widgetId !== undefined && grecaptcha && grecaptcha.enterprise) {
        grecaptcha.enterprise.reset(widgetId);
        tokenStore.delete(containerId);
    }
}
