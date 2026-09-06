import { RECAPTCHA_CHECKBOX_SITE_KEY } from "./app-config.js";

var ONLOAD_CB = "_sfRecaptchaOnload";
var SCRIPT_URL = "https://www.google.com/recaptcha/enterprise.js?onload=" + ONLOAD_CB + "&render=explicit";

var scriptLoaded = false;
var scriptLoading = false;
var loadCallbacks = [];

function hasRenderApi() {
    return typeof grecaptcha !== "undefined"
        && grecaptcha.enterprise
        && typeof grecaptcha.enterprise.render === "function";
}

function fireCallbacks() {
    scriptLoaded = true;
    scriptLoading = false;
    while (loadCallbacks.length) { loadCallbacks.shift()(); }
}

function loadScript() {
    if (scriptLoaded) { fireCallbacks(); return; }
    if (hasRenderApi()) { fireCallbacks(); return; }
    if (scriptLoading) { return; }
    scriptLoading = true;

    window[ONLOAD_CB] = function () {
        delete window[ONLOAD_CB];
        fireCallbacks();
    };

    var s = document.createElement("script");
    s.src = SCRIPT_URL;
    s.async = true;
    s.defer = true;
    s.onerror = function () {
        scriptLoading = false;
        console.error("[reCAPTCHA] Failed to load Enterprise checkbox script");
    };
    document.head.appendChild(s);
}

export function onRecaptchaReady(cb) {
    if (hasRenderApi()) { cb(); return; }
    loadCallbacks.push(cb);
    loadScript();
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
