/**
 * SF AI V15 — Module Integration Layer
 * Connects all V15 modules to the existing chat system
 * Loaded via component-loader.js alongside ai.js
 */

import { SFVision } from './vision.js';
import { SFSoil } from './soil.js';
import { SFWeather } from './weather.js';
import { SFCalculator } from './calculator.js';
import { SFCropCalendar } from './crop-calendar.js';
import { SFYieldPrediction } from './yield-prediction.js';
import { SFReminder } from './reminder.js';
import { SFDiseaseTimeline } from './disease-timeline.js';
import { SFProductRec } from './product-rec.js';
import { SFConfidence } from './confidence.js';
import { SFSecurity } from './security.js';

/**
 * SF V15 — Global module registry
 * Exposes all V15 capabilities to the existing AI chat
 */
const SFModules = {
    version: 'SF AI V15',
    modules: {
        vision: SFVision,
        soil: SFSoil,
        weather: SFWeather,
        calculator: SFCalculator,
        cropCalendar: SFCropCalendar,
        yieldPrediction: SFYieldPrediction,
        reminder: SFReminder,
        diseaseTimeline: SFDiseaseTimeline,
        productRec: SFProductRec,
        confidence: SFConfidence,
        security: SFSecurity,
    },

    /**
     * Initialize all modules
     */
    init() {
        console.log(`🌱 ${this.version} — Smart Agriculture Super AI`);
        console.log('Modules loaded:', Object.keys(this.modules).join(', '));
        this.injectQuickActions();
        this.injectConfidenceHook();
        this.injectSecurityHook();
    },

    /**
     * Inject quick-action buttons into the chat interface
     */
    injectQuickActions() {
        const inputArea = document.querySelector('.chat-input-area');
        if (!inputArea) return;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'v15-quick-actions';
        actionsDiv.innerHTML = `
            <button class="v15-action-btn" data-action="vision" title="Upload Crop Image for Diagnosis">
                <i class="fas fa-camera"></i> <span>রোগ শনাক্তকরণ</span>
            </button>
            <button class="v15-action-btn" data-action="soil" title="Soil Analysis">
                <i class="fas fa-mountain"></i> <span>মাটি পরীক্ষা</span>
            </button>
            <button class="v15-action-btn" data-action="weather" title="Weather & Farming Advice">
                <i class="fas fa-cloud-sun"></i> <span>আবহাওয়া</span>
            </button>
            <button class="v15-action-btn" data-action="calculator" title="Fertilizer Calculator">
                <i class="fas fa-calculator"></i> <span>সার হিসাব</span>
            </button>
            <button class="v15-action-btn" data-action="calendar" title="Crop Calendar">
                <i class="fas fa-calendar-alt"></i> <span>ফসল ক্যালেন্ডার</span>
            </button>
            <button class="v15-action-btn" data-action="yield" title="Yield Prediction">
                <i class="fas fa-chart-line"></i> <span>ফলন পূর্বাভাস</span>
            </button>
            <button class="v15-action-btn" data-action="reminder" title="Set Farming Reminder">
                <i class="fas fa-bell"></i> <span>রিমাইন্ডার</span>
            </button>
        `;

        inputArea.parentNode.insertBefore(actionsDiv, inputArea);

        actionsDiv.querySelectorAll('.v15-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleAction(action);
            });
        });
    },

    /**
     * Handle quick-action button clicks
     */
    handleAction(action) {
        const chatInput = document.getElementById('chat-input');
        const messagesEl = document.getElementById('chat-messages');

        switch (action) {
            case 'vision':
                this.showVisionPanel(messagesEl);
                break;
            case 'soil':
                if (chatInput) {
                    chatInput.value = 'আমার জমির মাটির ধরন কী? কোন ফসল উপযুক্ত হবে?';
                    chatInput.dispatchEvent(new Event('input'));
                }
                break;
            case 'weather':
                this.showWeatherPanel(messagesEl);
                break;
            case 'calculator':
                if (chatInput) {
                    chatInput.value = 'আমার _ শতক জমিতে _ ফসলের জন্য কত সার লাগবে?';
                    chatInput.dispatchEvent(new Event('input'));
                    chatInput.focus();
                    chatInput.setSelectionRange(chatInput.value.indexOf('_'), chatInput.value.indexOf('_') + 1);
                }
                break;
            case 'calendar':
                this.showCalendarPanel(messagesEl);
                break;
            case 'yield':
                if (chatInput) {
                    chatInput.value = 'আমার _ শতক জমিতে কোন ফসল থেকে বেশি লাভ হবে?';
                    chatInput.dispatchEvent(new Event('input'));
                    chatInput.focus();
                }
                break;
            case 'reminder':
                this.showReminderPanel(messagesEl);
                break;
        }
    },

    /**
     * Show vision (image upload) panel in chat
     */
    showVisionPanel(messagesEl) {
        const panel = document.createElement('div');
        panel.className = 'v15-panel vision-panel';
        panel.innerHTML = `
            <div class="v15-panel-header">
                <i class="fas fa-camera"></i> রোগ শনাক্তকরণ (Disease Detection)
            </div>
            <div class="v15-panel-body">
                <div class="v15-upload-zone" id="v15-vision-upload">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>ছবি আপলোড করুন</p>
                    <p class="v15-upload-hint">Drag & drop, camera, or click to browse</p>
                    <input type="file" id="v15-vision-file" accept="image/jpeg,image/png,image/webp" capture="environment" style="display:none">
                </div>
                <div id="v15-vision-preview" class="v15-vision-preview"></div>
                <div id="v15-vision-result" class="v15-vision-result"></div>
            </div>
        `;
        messagesEl.appendChild(panel);

        const uploadZone = panel.querySelector('#v15-vision-upload');
        const fileInput = panel.querySelector('#v15-vision-file');
        const previewEl = panel.querySelector('#v15-vision-preview');
        const resultEl = panel.querySelector('#v15-vision-result');

        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
        uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files[0]) this.processVisionImage(e.dataTransfer.files[0], previewEl, resultEl);
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files[0]) this.processVisionImage(fileInput.files[0], previewEl, resultEl);
        });

        this.scrollToBottom();
    },

    /**
     * Process an image for vision analysis
     */
    async processVisionImage(file, previewEl, resultEl) {
        const validation = SFSecurity.validateImage(file);
        if (!validation.valid) {
            resultEl.innerHTML = `<div class="v15-error">${validation.message}</div>`;
            return;
        }

        previewEl.innerHTML = `<div class="v15-loading"><i class="fas fa-spinner fa-spin"></i> ছবি প্রস্তুত হচ্ছে...</div>`;

        const compressed = await SFVision.compressImage(file);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target.result;
            previewEl.innerHTML = `<img src="${base64}" alt="Uploaded image" class="v15-preview-img">`;
            resultEl.innerHTML = `<div class="v15-loading"><i class="fas fa-spinner fa-spin"></i> AI বিশ্লেষণ করছে...</div>`;
            try {
                const result = await SFVision.analyzeImage(base64, 'এই ছবিতে কোন রোগ বা সমস্যা আছে কি?');
                resultEl.innerHTML = this.formatVisionResult(result);
            } catch (err) {
                resultEl.innerHTML = `<div class="v15-error">বিশ্লেষণে সমস্যা: ${err.message}</div>`;
            }
        };
        reader.readAsDataURL(compressed);
    },

    /**
     * Format vision analysis result
     */
    formatVisionResult(result) {
        if (!result || !result.diagnosis) {
            return '<div class="v15-error">রোগ শনাক্ত করা যায়নি।</div>';
        }
        const d = result.diagnosis;
        let html = '<div class="v15-vision-diagnosis">';
        if (d.disease) html += `<h4>🦠 ${d.disease}</h4>`;
        if (d.confidence) html += `<span class="v15-confidence-badge">${d.confidence}%</span>`;
        if (d.symptoms) html += `<p><strong>লক্ষণ:</strong> ${d.symptoms}</p>`;
        if (d.cause) html += `<p><strong>কারণ:</strong> ${d.cause}</p>`;
        if (d.organicTreatment && d.organicTreatment.length) {
            html += '<p><strong>জৈব সমাধান:</strong></p><ul>';
            d.organicTreatment.forEach(t => html += `<li>${t}</li>`);
            html += '</ul>';
        }
        if (d.chemicalTreatment && d.chemicalTreatment.length) {
            html += '<p><strong>রাসায়নিক সমাধান:</strong></p><ul>';
            d.chemicalTreatment.forEach(t => html += `<li>${t}</li>`);
            html += '</ul>';
        }
        if (d.prevention && d.prevention.length) {
            html += '<p><strong>প্রতিরোধ:</strong></p><ul>';
            d.prevention.forEach(p => html += `<li>${p}</li>`);
            html += '</ul>';
        }
        html += '</div>';
        return html;
    },

    /**
     * Show weather panel
     */
    showWeatherPanel(messagesEl) {
        const panel = document.createElement('div');
        panel.className = 'v15-panel weather-panel';
        panel.innerHTML = `
            <div class="v15-panel-header">
                <i class="fas fa-cloud-sun"></i> আবহাওয়া ও কৃষি পরামর্শ
            </div>
            <div class="v15-panel-body" id="v15-weather-body">
                <div class="v15-loading"><i class="fas fa-spinner fa-spin"></i> অবস্থান খুঁজে বের করছে...</div>
            </div>
        `;
        messagesEl.appendChild(panel);
        const body = panel.querySelector('#v15-weather-body');

        SFWeather.getCurrentLocation()
            .then(pos => SFWeather.getWeatherByCoords(pos.lat, pos.lon))
            .then(data => {
                const advice = SFWeather.getFarmingAdvice(data);
                body.innerHTML = this.formatWeatherResult(data, advice);
            })
            .catch(() => {
                body.innerHTML = `
                    <p>GPS পাওয়া যায়নি। আপনার জেলা নির্বাচন করুন:</p>
                    <select id="v15-district-select" class="v15-select">
                        <option value="">-- জেলা বাছাই করুন --</option>
                        ${Object.keys(SFWeather.getDistrictCoords ? {} : {}).map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                    <button id="v15-weather-go" class="v15-btn">আবহাওয়া দেখুন</button>
                `;
                const goBtn = body.querySelector('#v15-weather-go');
                const sel = body.querySelector('#v15-district-select');
                goBtn?.addEventListener('click', async () => {
                    if (!sel.value) return;
                    body.innerHTML = '<div class="v15-loading"><i class="fas fa-spinner fa-spin"></i></div>';
                    try {
                        const data = await SFWeather.getWeatherByDistrict(sel.value);
                        const advice = SFWeather.getFarmingAdvice(data);
                        body.innerHTML = this.formatWeatherResult(data, advice);
                    } catch (e) {
                        body.innerHTML = `<div class="v15-error">আবহাওয়া তথ্য পাওয়া যায়নি।</div>`;
                    }
                });
            });

        this.scrollToBottom();
    },

    /**
     * Format weather result
     */
    formatWeatherResult(data, advice) {
        if (!data || !data.current) return '<div class="v15-error">তথ্য পাওয়া যায়নি</div>';
        const c = data.current;
        let html = '<div class="v15-weather-info">';
        html += `<p>🌡️ তাপমাত্রা: <strong>${c.temperature}°C</strong></p>`;
        html += `<p>💧 আর্দ্রতা: <strong>${c.humidity}%</strong></p>`;
        html += `<p>🌧️ বৃষ্টি: <strong>${c.precipitation}mm</strong></p>`;
        html += `<p>💨 বাতাস: <strong>${c.windSpeed} km/h</strong></p>`;
        if (advice) {
            html += '<div class="v15-weather-advice">';
            html += '<h4>🌾 কৃষি পরামর্শ:</h4>';
            if (advice.fertilize !== undefined) {
                html += `<p>${advice.fertilize ? '✅ সার প্রয়োগ করা যাবে' : '❌ সার প্রয়োগ এখন উপযুক্ত নয়'}</p>`;
            }
            if (advice.irrigation) html += `<p>${advice.irrigation}</p>`;
            if (advice.diseaseRisk) html += `<p>🦠 রোগ ঝুঁকি: ${advice.diseaseRisk}</p>`;
            if (advice.pestRisk) html += `<p>🐛 পোকা ঝুঁকি: ${advice.pestRisk}</p>`;
            html += '</div>';
        }
        html += '</div>';
        return html;
    },

    /**
     * Show calendar panel
     */
    showCalendarPanel(messagesEl) {
        const panel = document.createElement('div');
        panel.className = 'v15-panel calendar-panel';
        const month = SFCropCalendar.getCurrentMonth();
        const season = SFCropCalendar.getCurrentSeason();
        const plantThisMonth = SFCropCalendar.getPlantThisMonth(month);
        const harvestThisMonth = SFCropCalendar.getHarvestThisMonth(month);

        panel.innerHTML = `
            <div class="v15-panel-header">
                <i class="fas fa-calendar-alt"></i> ফসল ক্যালেন্ডার — ${month}
            </div>
            <div class="v15-panel-body">
                <p><strong>বর্তমান মৌসুম:</strong> ${season}</p>
                <h4>এই মাসে কী করবেন:</h4>
                <div class="v15-calendar-items">
                    <div class="v15-calendar-section">
                        <h5>🌱 রোপণ করুন</h5>
                        <ul>${(plantThisMonth || []).map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                    <div class="v15-calendar-section">
                        <h5>🌾 ফসল তুলুন</h5>
                        <ul>${(harvestThisMonth || []).map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                </div>
            </div>
        `;
        messagesEl.appendChild(panel);
        this.scrollToBottom();
    },

    /**
     * Show reminder panel
     */
    showReminderPanel(messagesEl) {
        const panel = document.createElement('div');
        panel.className = 'v15-panel reminder-panel';
        const upcoming = SFReminder.getUpcoming(7);

        panel.innerHTML = `
            <div class="v15-panel-header">
                <i class="fas fa-bell"></i> কৃষি রিমাইন্ডার
            </div>
            <div class="v15-panel-body">
                <div class="v15-reminder-actions">
                    <button class="v15-btn v15-btn-sm" data-reminder="fertilizer"> সার দেওয়ার রিমাইন্ডার</button>
                    <button class="v15-btn v15-btn-sm" data-reminder="spray"> স্প্রে করার রিমাইন্ডার</button>
                    <button class="v15-btn v15-btn-sm" data-reminder="irrigation"> সেচ দেওয়ার রিমাইন্ডার</button>
                    <button class="v15-btn v15-btn-sm" data-reminder="harvest"> ফসল তোলার রিমাইন্ডার</button>
                </div>
                <div id="v15-reminder-list">
                    ${upcoming.length ? upcoming.map(r => `
                        <div class="v15-reminder-item">
                            <span>${r.title}</span>
                            <span class="v15-reminder-date">${r.date} ${r.time || ''}</span>
                        </div>
                    `).join('') : '<p>আগামী ৭ দিনে কোনো রিমাইন্ডার নেই।</p>'}
                </div>
            </div>
        `;
        messagesEl.appendChild(panel);
        this.scrollToBottom();
    },

    /**
     * Inject confidence score display after bot responses
     */
    injectConfidenceHook() {
        const originalAddMessage = this._originalAddMessage;
        const self = this;
        const messagesEl = document.getElementById('chat-messages');
        if (!messagesEl) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('bot-message-wrapper')) {
                        const bubble = node.querySelector('.message-bubble');
                        if (bubble) {
                            const text = bubble.textContent || '';
                            const analysis = SFConfidence.analyzeResponse(text, false, true);
                            if (analysis && analysis.badge) {
                                const badgeEl = document.createElement('div');
                                badgeEl.className = 'v15-confidence-container';
                                badgeEl.innerHTML = analysis.badge;
                                bubble.appendChild(badgeEl);

                                if (analysis.shouldRequestMoreInfo) {
                                    const msg = SFConfidence.getNeedMoreInfoMessage('bangla');
                                    const tipEl = document.createElement('div');
                                    tipEl.className = 'v15-more-info-tip';
                                    tipEl.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
                                    bubble.appendChild(tipEl);
                                }
                            }
                        }
                    }
                });
            });
        });
        observer.observe(messagesEl, { childList: true, subtree: true });
    },

    /**
     * Inject security checks into chat input
     */
    injectSecurityHook() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        const originalSend = window._sfOriginalSendMessage;
        const checkSend = () => {
            const text = chatInput.value;
            const injection = SFSecurity.detectPromptInjection(text);
            if (injection.detected) {
                console.warn('Prompt injection detected:', injection.matches);
            }
            const rateLimit = SFSecurity.checkRateLimit('chat', 15, 60000);
            if (!rateLimit.allowed) {
                const msgEl = document.createElement('div');
                msgEl.className = 'v15-panel v15-rate-limit';
                msgEl.innerHTML = `<p>⏰ অনেক বেশি বার্তা পাঠানো হয়েছে। ${rateLimit.resetIn} সেকেন্ড অপেক্ষা করুন।</p>`;
                const messagesEl = document.getElementById('chat-messages');
                if (messagesEl) messagesEl.appendChild(msgEl);
                return false;
            }
            return true;
        };

        const sendBtn = document.getElementById('btn-send');
        if (sendBtn) {
            sendBtn.addEventListener('click', (e) => {
                if (!checkSend()) e.stopImmediatePropagation();
            }, true);
        }
    },

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        const el = document.getElementById('chat-messages');
        if (el) requestAnimationFrame(() => el.scrollTop = el.scrollHeight);
    },
};

// Expose globally for the existing IIFE-based ai.js
window.SFModules = SFModules;

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SFModules.init());
} else {
    SFModules.init();
}

export default SFModules;
