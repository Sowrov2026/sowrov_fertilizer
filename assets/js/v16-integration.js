/**
 * SF AI V16 — Enterprise Integration Layer
 * Connects all V16 modules to the existing V15 system
 */

import { SFVoice } from './voice.js';
import { SFMemory } from './memory.js';
import { SFOCR } from './ocr.js';
import { SFPDF } from './pdf-ai.js';
import { SFSemanticSearch } from './semantic-search.js';
import { SFFarmerProfile } from './farmer-profile.js';
import { SFAnalytics } from './analytics.js';
import { SFSelfLearning } from './self-learning.js';
import { SFOffline } from './offline.js';
import { SFErrorHandler } from './error-handler.js';
import { SFPerformance } from './performance.js';

/**
 * SF V16 — Enterprise Agriculture AI
 */
const SFEnterprise = {
    version: 'SF AI V16 Enterprise',
    modules: {
        voice: SFVoice,
        memory: SFMemory,
        ocr: SFOCR,
        pdf: SFPDF,
        semanticSearch: SFSemanticSearch,
        farmerProfile: SFFarmerProfile,
        analytics: SFAnalytics,
        selfLearning: SFSelfLearning,
        offline: SFOffline,
        errorHandler: SFErrorHandler,
        performance: SFPerformance,
    },

    async init() {
        console.log(`🌾 ${this.version} — Agriculture Operating System`);
        console.log('Modules:', Object.keys(this.modules).join(', '));

        // Initialize core modules first
        SFErrorHandler.setupGlobalHandlers();
        SFErrorHandler.init();
        SFPerformance.init();
        SFMemory.init();
        SFAnalytics.init();
        SFSelfLearning.init();
        SFOffline.init();

        // Initialize feature modules
        SFVoice.init();
        SFSemanticSearch.init();

        // Setup V16 integration with existing chat
        this.injectVoiceButton();
        this.injectEnhancedInput();
        this.injectOfflineDetection();
        this.injectMemoryHook();
        this.injectAnalyticsHook();

        console.log('V16 Enterprise modules initialized.');
    },

    /**
     * Inject voice button into chat input area
     */
    injectVoiceButton() {
        const inputContainer = document.querySelector('.input-container');
        if (!inputContainer) return;

        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'btn-voice';
        voiceBtn.className = 'input-btn voice-btn';
        voiceBtn.title = 'কণ্ঠ দিয়ে বলুন (Voice Input)';
        voiceBtn.setAttribute('aria-label', 'Voice Input');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';

        const fileInput = document.getElementById('file-input');
        if (fileInput && fileInput.parentNode) {
            fileInput.parentNode.insertBefore(voiceBtn, fileInput.nextSibling);
        }

        voiceBtn.addEventListener('click', async () => {
            if (SFVoice.isListening()) {
                SFVoice.stopListening();
                voiceBtn.classList.remove('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            } else {
                voiceBtn.classList.add('recording');
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                await SFVoice.startListening({
                    onResult: (text, isFinal) => {
                        const chatInput = document.getElementById('chat-input');
                        if (chatInput) {
                            chatInput.value = text;
                            chatInput.dispatchEvent(new Event('input'));
                        }
                        if (isFinal) {
                            voiceBtn.classList.remove('recording');
                            voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                        }
                    },
                    onError: () => {
                        voiceBtn.classList.remove('recording');
                        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                    },
                });
            }
        });
    },

    /**
     * Inject enhanced input with OCR and PDF buttons
     */
    injectEnhancedInput() {
        const inputContainer = document.querySelector('.input-container');
        if (!inputContainer) return;

        const ocrBtn = document.createElement('button');
        ocrBtn.id = 'btn-ocr';
        ocrBtn.className = 'input-btn ocr-btn';
        ocrBtn.title = 'ছবি থেকে পড়ুন (OCR)';
        ocrBtn.setAttribute('aria-label', 'OCR');
        ocrBtn.innerHTML = '<i class="fas fa-file-alt"></i>';

        const pdfBtn = document.createElement('button');
        pdfBtn.id = 'btn-pdf';
        pdfBtn.className = 'input-btn pdf-btn';
        pdfBtn.title = 'PDF পড়ুন';
        pdfBtn.setAttribute('aria-label', 'PDF Reader');
        pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i>';

        const fileInput = document.getElementById('file-input');
        if (fileInput && fileInput.parentNode) {
            fileInput.parentNode.insertBefore(ocrBtn, fileInput.nextSibling);
            fileInput.parentNode.insertBefore(pdfBtn, ocrBtn.nextSibling);
        }

        ocrBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const messagesEl = document.getElementById('chat-messages');
                if (!messagesEl) return;

                const panel = document.createElement('div');
                panel.className = 'v15-panel v16-ocr-panel';
                panel.innerHTML = '<div class="v15-panel-header"><i class="fas fa-file-alt"></i> OCR বিশ্লেষণ</div><div class="v15-panel-body"><div class="v15-loading"><i class="fas fa-spinner fa-spin"></i> পড়ছে...</div></div>';
                messagesEl.appendChild(panel);

                try {
                    await SFOCR.init();
                    const result = await SFOCR.processImage(file);
                    const body = panel.querySelector('.v15-panel-body');
                    if (result && result.text) {
                        body.innerHTML = `<div class="v16-ocr-result"><h4>নির্যাস:</h4><pre>${result.text}</pre></div>`;
                    } else {
                        body.innerHTML = '<div class="v15-error">ছবি থেকে কোনো লেখা পড়া যায়নি।</div>';
                    }
                } catch (err) {
                    panel.querySelector('.v15-panel-body').innerHTML = `<div class="v15-error">সমস্যা: ${err.message}</div>`;
                }
                messagesEl.scrollTop = messagesEl.scrollHeight;
            };
            input.click();
        });

        pdfBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const messagesEl = document.getElementById('chat-messages');
                if (!messagesEl) return;

                const panel = document.createElement('div');
                panel.className = 'v15-panel v16-pdf-panel';
                panel.innerHTML = '<div class="v15-panel-header"><i class="fas fa-file-pdf"></i> PDF পড়ছে...</div><div class="v15-panel-body"><div class="v15-loading"><i class="fas fa-spinner fa-spin"></i> PDF বিশ্লেষণ করছে...</div></div>';
                messagesEl.appendChild(panel);

                try {
                    await SFPDF.init();
                    const result = await SFPDF.processPDF(file);
                    const body = panel.querySelector('.v15-panel-body');
                    if (result && result.text) {
                        body.innerHTML = `<div class="v16-pdf-result"><h4>সারসংক্ষেপ:</h4><div>${result.summary || 'সারসংক্ষেপ তৈরি হয়নি'}</div><h4>পাঠ্য:</h4><pre style="max-height:300px;overflow:auto">${result.text.substring(0, 2000)}</pre></div>`;
                    } else {
                        body.innerHTML = '<div class="v15-error">PDF থেকে লেখা বের করা যায়নি।</div>';
                    }
                } catch (err) {
                    panel.querySelector('.v15-panel-body').innerHTML = `<div class="v15-error">সমস্যা: ${err.message}</div>`;
                }
                messagesEl.scrollTop = messagesEl.scrollHeight;
            };
            input.click();
        });
    },

    /**
     * Inject offline detection
     */
    injectOfflineDetection() {
        window.addEventListener('online', () => SFOffline.hideOfflineIndicator());
        window.addEventListener('offline', () => SFOffline.showOfflineIndicator());
    },

    /**
     * Inject memory hook into chat
     */
    injectMemoryHook() {
        const messagesEl = document.getElementById('chat-messages');
        if (!messagesEl) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(m => {
                m.addedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('user-message-wrapper')) {
                        const text = node.querySelector('.message-text');
                        if (text) {
                            SFMemory.extractInfo(text.textContent);
                        }
                    }
                });
            });
        });
        observer.observe(messagesEl, { childList: true, subtree: true });
    },

    /**
     * Inject analytics hook into chat
     */
    injectAnalyticsHook() {
        const originalSendMessage = window._sfSendMessage;
        if (!originalSendMessage) return;

        const startTime = Date.now();
        window._sfSendMessage = async function (...args) {
            const result = await originalSendMessage.apply(this, args);
            const duration = Date.now() - startTime;
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                SFAnalytics.trackQuestion(chatInput.value, duration, 0);
            }
            return result;
        };
    },

    /**
     * Get system status
     */
    getStatus() {
        return {
            version: this.version,
            modulesLoaded: Object.keys(this.modules).length,
            online: navigator.onLine,
            memory: SFMemory.getStats(),
            cache: SFPerformance.getStats(),
            errors: SFErrorHandler.getErrorStats(),
        };
    },
};

window.SFEnterprise = SFEnterprise;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SFEnterprise.init());
} else {
    SFEnterprise.init();
}

export default SFEnterprise;
