import { RECAPTCHA_CHECKBOX_SITE_KEY } from "./app-config.js";

var scriptLoaded = false;
var pollTimer = null;
var loadCallbacks = [];

function hasRenderApi() {
    return typeof grecaptcha !== "undefined"
        && grecaptcha.enterprise
        && typeof grecaptcha.enterprise.render === "function";
}

function checkReady() {
    if (hasRenderApi()) {
        scriptLoaded = true;
        if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
        while (loadCallbacks.length) { loadCallbacks.shift()(); }
        return true;
    }
    return false;
}

function pollForApi() {
    if (checkReady()) return;
    pollTimer = setTimeout(pollForApi, 50);
}

export function onRecaptchaReady(cb) {
    if (checkReady()) { cb(); return; }
    loadCallbacks.push(cb);
    pollForApi();
}

var widgetInstances = new Map();
var tokenStore = new Map();

export function renderWidget(containerId, options) {
    onRecaptchaReady(function () {
        if (widgetInstances.has(containerId)) return;
        var container = document.getElementById(containerId);
        if (!container) return;
        var widgetId = grecaptcha.enterprise.render(container, {
            sitekey: RECAPTCHA_CHECKBOX_SITE_KEY,
            theme: (options && options.theme) || "light",
            size: "normal",
            callback: function (token) {
                tokenStore.set(containerId, token);
                var errEl = container.closest(".form-group, .recaptcha-group")
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
    var widgetId = widgetInstances.get(containerId);
    if (widgetId !== undefined && grecaptcha && grecaptcha.enterprise) {
        grecaptcha.enterprise.reset(widgetId);
        tokenStore.delete(containerId);
    }
}
