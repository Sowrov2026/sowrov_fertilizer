/* ============================================
   SF AI Assistant - Self-Contained Module
   Finds existing #aiButton or creates one
   Injects chat window + handles all logic
   ============================================ */

(function () {
    'use strict';

    // ========================================
    // Configuration
    // ========================================
    const CONFIG = {
        API_ENDPOINT: '/.netlify/functions/chat',
        MAX_INPUT_LENGTH: 2000,
        MAX_IMAGE_SIZE_MB: 5,
        RATE_LIMIT_MS: 2000,
        AUTO_RESIZE_MAX_ROWS: 6,
        STORAGE_KEY: 'sf_ai_chat_history',
    };

    // ========================================
    // Build Chat Window HTML
    // ========================================
    function buildChatWindowHTML() {
        return `
        <div id="chat-window" class="chat-window hidden">
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar"><i class="fas fa-leaf"></i></div>
                    <div class="chat-header-text">
                        <h3>SF AI Assistant</h3>
                        <span class="chat-status">
                            <span class="status-dot"></span>
                            Online - Agricultural Expert
                        </span>
                    </div>
                </div>
                <div class="chat-header-actions">
                    <button id="btn-new-chat" class="header-btn" title="New Chat" aria-label="New Chat">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button id="btn-clear-chat" class="header-btn" title="Clear Chat" aria-label="Clear Chat">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button id="btn-minimize" class="header-btn" title="Minimize" aria-label="Minimize Chat">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            <div id="chat-messages" class="chat-messages">
                <div class="message-wrapper bot-message-wrapper">
                    <div class="message-avatar bot-avatar"><i class="fas fa-leaf"></i></div>
                    <div class="message-content">
                        <div class="message-bubble bot-bubble">
                            <div class="message-text" id="welcome-message">
                                <h4>Welcome to SF AI Assistant!</h4>
                                <p>I'm your expert agricultural consultant from <strong>Sowrov Fertilizer</strong>.</p>
                                <p>I can help you with:</p>
                                <ul>
                                    <li>Fertilizer recommendations</li>
                                    <li>Crop disease diagnosis</li>
                                    <li>Pest management</li>
                                    <li>Organic farming tips</li>
                                    <li>Vegetable &amp; fruit farming</li>
                                    <li>Rice cultivation</li>
                                    <li>Crop image analysis</li>
                                </ul>
                                <p>Ask me anything about agriculture! <em>You can write in English or Bangla.</em></p>
                            </div>
                        </div>
                        <span class="message-time" id="welcome-time"></span>
                    </div>
                </div>
            </div>
            <div id="typing-indicator" class="typing-indicator hidden">
                <div class="message-wrapper bot-message-wrapper">
                    <div class="message-avatar bot-avatar"><i class="fas fa-leaf"></i></div>
                    <div class="typing-bubble">
                        <div class="typing-dots"><span></span><span></span><span></span></div>
                        <span class="typing-text">Thinking...</span>
                    </div>
                </div>
            </div>
            <div class="chat-input-area">
                <div class="input-container">
                    <button id="btn-attach" class="input-btn attach-btn" title="Upload Crop Image" aria-label="Upload Image">
                        <i class="fas fa-image"></i>
                    </button>
                    <input type="file" id="file-input" accept="image/*" class="hidden">
                    <textarea id="chat-input" class="chat-input" placeholder="Ask about agriculture..." rows="1" aria-label="Type your message"></textarea>
                    <button id="btn-send" class="input-btn send-btn" disabled title="Send Message" aria-label="Send Message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="input-footer">
                    <span>Powered by Sowrov Fertilizer</span>
                </div>
            </div>
        </div>`;
    }

    // ========================================
    // Inject Font Awesome if missing
    // ========================================
    function ensureFontAwesome() {
        if (document.querySelector('link[href*="font-awesome"]')) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(link);
    }

    // ========================================
    // Inject marked + DOMPurify if missing
    // V33 FIX: Wait for scripts to load before resolving
    // ========================================
    function ensureDependencies() {
        const promises = [];

        if (typeof marked === 'undefined') {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            promises.push(new Promise((resolve) => {
                s.onload = resolve;
                s.onerror = resolve; // Don't block on failure
                document.head.appendChild(s);
            }));
        }

        if (typeof DOMPurify === 'undefined') {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js';
            promises.push(new Promise((resolve) => {
                s.onload = resolve;
                s.onerror = resolve;
                document.head.appendChild(s);
            }));
        }

        return promises.length > 0 ? Promise.all(promises) : Promise.resolve();
    }

    // ========================================
    // Find or Create Button
    // ========================================
    function getOrCreateButton() {
        let btn = document.getElementById('aiButton') || document.getElementById('chat-toggle');
        if (btn) return btn;

        btn = document.createElement('button');
        btn.id = 'chat-toggle';
        btn.className = 'chat-toggle';
        btn.setAttribute('aria-label', 'Open AI Chat');
        btn.innerHTML = '<span class="chat-toggle-icon"><i class="fas fa-robot"></i></span><span class="chat-toggle-pulse"></span>';
        document.body.appendChild(btn);
        return btn;
    }

    // ========================================
    // Utilities
    // ========================================
    const Utils = {
        getTimestamp() {
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        escapeHtml(text) {
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return String(text).replace(/[&<>"']/g, (m) => map[m]);
        },
        renderMarkdown(text) {
            if (typeof marked === 'undefined') return Utils.escapeHtml(text);
            marked.setOptions({ breaks: true, gfm: true, headerIds: false, mangle: false });
            const rawHtml = marked.parse(text);
            if (typeof DOMPurify !== 'undefined') {
                return DOMPurify.sanitize(rawHtml, {
                    ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','hr','strong','em','b','i','u','s','ul','ol','li','a','code','pre','blockquote','table','thead','tbody','tr','th','td','span','img'],
                    ALLOWED_ATTR: ['href','src','alt','title','class','target','rel'],
                    ALLOW_DATA_ATTR: false,
                });
            }
            return rawHtml;
        },
    };

    // ========================================
    // Storage
    // ========================================
    const Storage = {
        save(h) { try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(h)); } catch(e) {} },
        load() { try { const d = localStorage.getItem(CONFIG.STORAGE_KEY); return d ? JSON.parse(d) : []; } catch(e) { return []; } },
        clear() { try { localStorage.removeItem(CONFIG.STORAGE_KEY); } catch(e) {} },
    };

    // ========================================
    // State
    // ========================================
    const state = {
        conversationHistory: [],
        isOpen: false,
        isLoading: false,
        lastSendTime: 0,
        selectedImageBase64: null,
    };

    // ========================================
    // DOM refs (set after inject)
    // ========================================
    let DOM = {};

    // ========================================
    // Initialize
    // ========================================
    function init() {
        ensureFontAwesome();
        ensureDependencies();

        const btn = getOrCreateButton();

        // Inject chat window
        const wrapper = document.createElement('div');
        wrapper.id = 'ai-app';
        wrapper.innerHTML = buildChatWindowHTML();
        document.body.appendChild(wrapper);

        // Set btn to use new id if it was the old one
        if (btn.id === 'aiButton') {
            btn.id = 'chat-toggle';
            btn.className = 'chat-toggle';
            btn.innerHTML = '<span class="chat-toggle-icon"><i class="fas fa-robot"></i></span><span class="chat-toggle-pulse"></span>';
        }

        // Cache DOM
        DOM = {
            chatToggle: btn,
            chatWindow: document.getElementById('chat-window'),
            chatMessages: document.getElementById('chat-messages'),
            chatInput: document.getElementById('chat-input'),
            btnSend: document.getElementById('btn-send'),
            btnAttach: document.getElementById('btn-attach'),
            fileInput: document.getElementById('file-input'),
            btnClear: document.getElementById('btn-clear-chat'),
            btnNewChat: document.getElementById('btn-new-chat'),
            btnMinimize: document.getElementById('btn-minimize'),
            typingIndicator: document.getElementById('typing-indicator'),
            welcomeTime: document.getElementById('welcome-time'),
        };

        setWelcomeTime();
        initEventListeners();
        restoreHistory();
    }

    // ========================================
    // Welcome Time
    // ========================================
    function setWelcomeTime() {
        if (DOM.welcomeTime) DOM.welcomeTime.textContent = Utils.getTimestamp();
    }

    // ========================================
    // Toggle Chat
    // ========================================
    function toggleChat() {
        state.isOpen = !state.isOpen;
        if (state.isOpen) {
            DOM.chatWindow.classList.remove('hidden');
            DOM.chatToggle.classList.add('open');
            const icon = DOM.chatToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-times';
            DOM.chatInput.focus();
            scrollToBottom();
        } else {
            DOM.chatWindow.classList.add('hidden');
            DOM.chatToggle.classList.remove('open');
            const icon = DOM.chatToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-robot';
        }
    }

    // ========================================
    // Messages
    // ========================================
    function createMessageElement(role, text, imageDataUrl) {
        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper ' + (role === 'user' ? 'user-message-wrapper' : 'bot-message-wrapper');

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar ' + (role === 'user' ? 'user-avatar' : 'bot-avatar');
        avatarDiv.innerHTML = role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-leaf"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble ' + (role === 'user' ? 'user-bubble' : 'bot-bubble');

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        if (role === 'user') {
            textDiv.textContent = text;
        } else {
            textDiv.innerHTML = Utils.renderMarkdown(text);
        }
        bubble.appendChild(textDiv);

        if (imageDataUrl && role === 'user') {
            const imgWrap = document.createElement('div');
            imgWrap.style.marginBottom = '8px';
            const img = document.createElement('img');
            img.src = imageDataUrl;
            img.alt = 'Uploaded crop image';
            img.style.cssText = 'max-width:200px;max-height:150px;border-radius:8px;border:1px solid rgba(16,185,129,0.3);';
            imgWrap.appendChild(img);
            bubble.insertBefore(imgWrap, textDiv);
        }

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = Utils.getTimestamp();

        contentDiv.appendChild(bubble);
        contentDiv.appendChild(timeSpan);
        wrapper.appendChild(avatarDiv);
        wrapper.appendChild(contentDiv);
        return wrapper;
    }

    function addMessage(role, text, imageDataUrl) {
        DOM.chatMessages.appendChild(createMessageElement(role, text, imageDataUrl));
        scrollToBottom();
    }

    function scrollToBottom() {
        requestAnimationFrame(() => { DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight; });
    }

    // ========================================
    // Typing
    // ========================================
    function showTyping() { DOM.typingIndicator.classList.remove('hidden'); scrollToBottom(); }
    function hideTyping() { DOM.typingIndicator.classList.add('hidden'); }

    // ========================================
    // Send Message
    // ========================================
    async function sendMessage() {
        const text = DOM.chatInput.value.trim();
        const imageDataUrl = state.selectedImageBase64;
        if (!text && !imageDataUrl) return;
        if (state.isLoading) return;

        const now = Date.now();
        if (now - state.lastSendTime < CONFIG.RATE_LIMIT_MS) return;
        state.lastSendTime = now;

        if (text.length > CONFIG.MAX_INPUT_LENGTH) {
            addMessage('bot', 'আপনার বার্তা অনেক বড়। ২০০০ অক্ষরের কম রাখুন।\nYour message is too long. Please keep it under 2000 characters.');
            return;
        }

        addMessage('user', text || 'Please analyze this crop image.', imageDataUrl);
        state.conversationHistory.push({ role: 'user', content: text || 'Please analyze this crop image.' });

        DOM.chatInput.value = '';
        DOM.chatInput.style.height = 'auto';
        DOM.btnSend.disabled = true;
        clearImagePreview();

        state.isLoading = true;
        showTyping();

        try {
            const payload = { messages: state.conversationHistory };
            if (imageDataUrl) payload.image = imageDataUrl;

            // V33 FIX: Add fetch timeout to prevent infinite loading
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

            const response = await fetch(CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || 'Server error (' + response.status + ')');
            }

            const data = await response.json();
            const botReply = data.reply || data.message || 'I could not generate a response. Please try again.';

            addMessage('bot', botReply);
            state.conversationHistory.push({ role: 'assistant', content: botReply });
            Storage.save(state.conversationHistory);
        } catch (error) {
            console.error('Chat error:', error);
            let msg = 'দুঃখিত, কিছু সমস্যা হয়েছে। ';
            if (!navigator.onLine) {
                msg = 'ইন্টারনেট সংযোগ চেক করুন এবং আবার চেষ্টা করুন।';
            } else if (error.name === 'AbortError') {
                msg = 'সার্ভিসে সময় বেশি লাচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
            } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.name === 'TypeError') {
                msg = 'নেটওয়ার্ক সমস্যা। কিছুক্ষণ পর আবার চেষ্টা করুন।';
            } else if (error.message?.includes('429') || error.message?.includes('busy')) {
                msg = 'AI সার্ভিস এখন ব্যস্ত। কিছুক্ষণ পর আবার চেষ্টা করুন।';
            } else if (error.message?.includes('500') || error.message?.includes('502')) {
                msg = 'সার্ভিসে সমস্যা হচ্ছে। পরে আবার চেষ্টা করুন।';
            } else {
                msg += 'আবার চেষ্টা করুন।';
            }
            addMessage('bot', msg);
        } finally {
            state.isLoading = false;
            hideTyping();
            DOM.chatInput.focus();
        }
    }

    // ========================================
    // Image Handling
    // ========================================
    function handleImageSelect(file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            addMessage('bot', 'Please upload a valid image file (JPG, PNG, WEBP).');
            return;
        }
        if (file.size / (1024 * 1024) > CONFIG.MAX_IMAGE_SIZE_MB) {
            addMessage('bot', 'Image size must be under ' + CONFIG.MAX_IMAGE_SIZE_MB + 'MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function (e) {
            state.selectedImageBase64 = e.target.result;
            showImagePreview(file.name, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    function showImagePreview(name, dataUrl) {
        removeExistingPreview();
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.id = 'image-preview';
        preview.innerHTML = '<img src="' + dataUrl + '" alt="Preview"><div class="image-preview-info"><div class="image-preview-name">' + Utils.escapeHtml(name) + '</div><div>Ready to analyze</div></div><button class="image-preview-remove" title="Remove image" aria-label="Remove image"><i class="fas fa-times"></i></button>';
        preview.querySelector('.image-preview-remove').addEventListener('click', clearImagePreview);
        document.querySelector('.input-container').parentNode.insertBefore(preview, document.querySelector('.input-container'));
    }

    function clearImagePreview() {
        removeExistingPreview();
        state.selectedImageBase64 = null;
        if (DOM.fileInput) DOM.fileInput.value = '';
    }

    function removeExistingPreview() {
        const el = document.getElementById('image-preview');
        if (el) el.remove();
    }

    // ========================================
    // Auto Resize
    // ========================================
    function autoResize() {
        DOM.chatInput.style.height = 'auto';
        DOM.chatInput.style.height = Math.min(DOM.chatInput.scrollHeight, CONFIG.AUTO_RESIZE_MAX_ROWS * 24) + 'px';
    }

    // ========================================
    // Clear / New Chat
    // ========================================
    function clearChat() {
        if (!confirm('Are you sure you want to clear all messages?')) return;
        state.conversationHistory = [];
        Storage.clear();
        const msgs = DOM.chatMessages.querySelectorAll('.message-wrapper');
        msgs.forEach((m, i) => { if (i > 0) m.remove(); });
        clearImagePreview();
    }

    function newChat() {
        state.conversationHistory = [];
        Storage.clear();
        clearImagePreview();
        const msgs = DOM.chatMessages.querySelectorAll('.message-wrapper');
        msgs.forEach((m, i) => { if (i > 0) m.remove(); });
        DOM.chatInput.value = '';
        DOM.chatInput.style.height = 'auto';
        DOM.btnSend.disabled = true;
    }

    // ========================================
    // Restore History
    // ========================================
    function restoreHistory() {
        const history = Storage.load();
        if (!history || history.length === 0) return;
        state.conversationHistory = history;
        history.forEach((msg) => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                addMessage(msg.role === 'assistant' ? 'bot' : 'user', msg.content);
            }
        });
    }

    // ========================================
    // Event Listeners
    // ========================================
    function initEventListeners() {
        DOM.chatToggle.addEventListener('click', toggleChat);
        DOM.btnMinimize.addEventListener('click', toggleChat);
        DOM.btnSend.addEventListener('click', sendMessage);

        DOM.chatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        });

        DOM.chatInput.addEventListener('input', function () {
            autoResize();
            DOM.btnSend.disabled = !this.value.trim() && !state.selectedImageBase64;
        });

        DOM.btnAttach.addEventListener('click', function () { DOM.fileInput.click(); });

        DOM.fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                handleImageSelect(this.files[0]);
                DOM.btnSend.disabled = false;
            }
        });

        DOM.btnClear.addEventListener('click', clearChat);
        DOM.btnNewChat.addEventListener('click', newChat);

        DOM.chatMessages.addEventListener('dragover', function (e) { e.preventDefault(); e.stopPropagation(); });
        DOM.chatMessages.addEventListener('drop', function (e) {
            e.preventDefault(); e.stopPropagation();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleImageSelect(e.dataTransfer.files[0]);
                DOM.btnSend.disabled = false;
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && state.isOpen) toggleChat();
        });
    }

    // ========================================
    // Boot
    // ========================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
