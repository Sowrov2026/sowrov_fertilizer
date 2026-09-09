/* ============================================
   SF AI Assistant - Sliding Workspace Module
   Global AI workspace that slides from the right
   Preserves all existing chat functionality
   ============================================ */

(function () {
    'use strict';

    const CONFIG = {
        API_ENDPOINT: '/api/chat',
        MAX_INPUT_LENGTH: 2000,
        MAX_IMAGE_SIZE_MB: 5,
        RATE_LIMIT_MS: 2000,
        AUTO_RESIZE_MAX_ROWS: 6,
        STORAGE_KEY: 'sf_ai_chat_history',
    };

    // ========================================
    // Workspace HTML (sliding panel)
    // ========================================
    function buildWorkspaceHTML() {
        return `
        <div id="sf-ai-panel" class="sf-ai-panel chat-window">
            <div class="sf-ai-header">
                <div class="sf-ai-header-info">
                    <div class="sf-ai-avatar"><i class="fas fa-leaf"></i></div>
                    <div class="sf-ai-header-text">
                        <h3>SF AI Assistant</h3>
                        <span class="sf-ai-status">
                            <span class="sf-ai-status-dot"></span>
                            Online - Agricultural Expert
                        </span>
                    </div>
                </div>
                <div class="sf-ai-header-actions">
                    <button id="btn-new-chat" class="sf-ai-hdr-btn" title="New Chat" aria-label="New Chat">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button id="btn-clear-chat" class="sf-ai-hdr-btn" title="Clear Chat" aria-label="Clear Chat">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button id="btn-close-workspace" class="sf-ai-hdr-btn sf-ai-close-btn" title="Close" aria-label="Close AI Workspace">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div id="chat-messages" class="sf-ai-messages chat-messages">
                <div class="sf-ai-msg-wrap sf-ai-msg-bot message-wrapper bot-message-wrapper">
                    <div class="sf-ai-msg-avatar sf-ai-avatar-bot message-avatar bot-avatar"><i class="fas fa-leaf"></i></div>
                    <div class="sf-ai-msg-body message-content">
                        <div class="sf-ai-bubble sf-ai-bubble-bot message-bubble bot-bubble">
                            <div class="sf-ai-msg-text message-text" id="welcome-message">
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
                        <span class="sf-ai-msg-time message-time" id="welcome-time"></span>
                    </div>
                </div>
            </div>
            <div id="typing-indicator" class="sf-ai-typing typing-indicator hidden">
                <div class="sf-ai-msg-wrap sf-ai-msg-bot message-wrapper bot-message-wrapper">
                    <div class="sf-ai-msg-avatar sf-ai-avatar-bot message-avatar bot-avatar"><i class="fas fa-leaf"></i></div>
                    <div class="sf-ai-typing-bubble">
                        <div class="sf-ai-typing-dots"><span></span><span></span><span></span></div>
                        <span class="sf-ai-typing-text">Thinking...</span>
                    </div>
                </div>
            </div>
            <div class="sf-ai-input-area chat-input-area">
                <div class="sf-ai-input-wrap input-container">
                    <button id="btn-attach" class="sf-ai-input-btn sf-ai-attach-btn" title="Upload Crop Image" aria-label="Upload Image">
                        <i class="fas fa-image"></i>
                    </button>
                    <input type="file" id="file-input" accept="image/*" class="hidden">
                    <textarea id="chat-input" class="sf-ai-input chat-input" placeholder="Ask about agriculture..." rows="1" aria-label="Type your message"></textarea>
                    <button id="btn-send" class="sf-ai-input-btn sf-ai-send-btn" disabled title="Send Message" aria-label="Send Message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="sf-ai-input-footer">
                    <span>Powered by Sowrov Fertilizer</span>
                </div>
            </div>
        </div>`;
    }

    // ========================================
    // Font Awesome
    // ========================================
    function ensureFontAwesome() {
        if (document.querySelector('link[href*="font-awesome"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(link);
    }

    // ========================================
    // marked + DOMPurify
    // ========================================
    function ensureDependencies() {
        var promises = [];
        if (typeof marked === 'undefined') {
            var s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
            promises.push(new Promise(function (resolve) {
                s.onload = resolve;
                s.onerror = resolve;
                document.head.appendChild(s);
            }));
        }
        if (typeof DOMPurify === 'undefined') {
            var s2 = document.createElement('script');
            s2.src = 'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js';
            promises.push(new Promise(function (resolve) {
                s2.onload = resolve;
                s2.onerror = resolve;
                document.head.appendChild(s2);
            }));
        }
        return promises.length > 0 ? Promise.all(promises) : Promise.resolve();
    }

    // ========================================
    // Find or Create AI Toggle Button
    // ========================================
    function getOrCreateButton() {
        var btn = document.getElementById('chat-toggle') || document.getElementById('aiButton');
        if (btn) {
            if (btn.id === 'aiButton') {
                btn.id = 'chat-toggle';
                btn.className = 'sf-ai-toggle';
                btn.setAttribute('aria-label', 'Open AI Chat');
                btn.innerHTML = '<span class="sf-ai-toggle-icon"><i class="fas fa-robot"></i></span><span class="sf-ai-toggle-pulse"></span>';
            }
            return btn;
        }
        btn = document.createElement('button');
        btn.id = 'chat-toggle';
        btn.className = 'sf-ai-toggle';
        btn.setAttribute('aria-label', 'Open AI Chat');
        btn.innerHTML = '<span class="sf-ai-toggle-icon"><i class="fas fa-robot"></i></span><span class="sf-ai-toggle-pulse"></span>';
        return btn;
    }

    // ========================================
    // Wrap Body Content for page shift
    // ========================================
    function wrapBodyContent() {
        if (document.getElementById('sf-ai-page-wrapper')) return;
        var wrapper = document.createElement('div');
        wrapper.id = 'sf-ai-page-wrapper';
        var body = document.body;

        // Collect all children except floating elements
        var floatingEls = [];
        var children = Array.from(body.children);
        for (var i = 0; i < children.length; i++) {
            var el = children[i];
            if (el.classList && (el.classList.contains('whatsapp-btn-only') ||
                el.id === 'chat-toggle' || el.id === 'sf-ai-app' ||
                el.id === 'sf-ai-float-stack')) {
                floatingEls.push(el);
            } else {
                wrapper.appendChild(el);
            }
        }
        body.appendChild(wrapper);

        // Extract WhatsApp buttons that may be nested inside the wrapper
        // (e.g. inside footer HTML from component-loader.js)
        var nestedWA = wrapper.querySelectorAll('.whatsapp-btn-only');
        for (var k = 0; k < nestedWA.length; k++) {
            floatingEls.push(nestedWA[k]);
        }

        // Put floating elements back outside wrapper
        for (var j = 0; j < floatingEls.length; j++) {
            body.appendChild(floatingEls[j]);
        }
    }

    // ========================================
    // Create Float Stack (AI + WhatsApp buttons)
    // ========================================
    function createFloatStack() {
        var existing = document.getElementById('sf-ai-float-stack');
        if (existing) return existing;

        var stack = document.createElement('div');
        stack.id = 'sf-ai-float-stack';
        stack.className = 'sf-ai-float-stack';

        // Move AI toggle button into stack
        var aiBtn = document.getElementById('chat-toggle') || document.getElementById('aiButton');
        if (aiBtn) {
            if (aiBtn.id === 'aiButton') {
                aiBtn.id = 'chat-toggle';
                aiBtn.className = 'sf-ai-toggle';
                aiBtn.setAttribute('aria-label', 'Open AI Chat');
                aiBtn.innerHTML = '<span class="sf-ai-toggle-icon"><i class="fas fa-robot"></i></span><span class="sf-ai-toggle-pulse"></span>';
            }
            stack.appendChild(aiBtn);
        }

        // Move WhatsApp button into stack
        var waBtn = document.querySelector('.whatsapp-btn-only');
        if (waBtn) {
            stack.appendChild(waBtn);
        }

        document.body.appendChild(stack);
        return stack;
    }

    // ========================================
    // Utilities
    // ========================================
    var Utils = {
        getTimestamp: function () {
            return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },
        escapeHtml: function (text) {
            var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
        },
        renderMarkdown: function (text) {
            if (typeof marked === 'undefined') return Utils.escapeHtml(text);
            marked.setOptions({ breaks: true, gfm: true, headerIds: false, mangle: false });
            var rawHtml = marked.parse(text);
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
    var Storage = {
        save: function (h) { try { localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(h)); } catch(e) {} },
        load: function () { try { var d = localStorage.getItem(CONFIG.STORAGE_KEY); return d ? JSON.parse(d) : []; } catch(e) { return []; } },
        clear: function () { try { localStorage.removeItem(CONFIG.STORAGE_KEY); } catch(e) {} },
    };

    // ========================================
    // State
    // ========================================
    var state = {
        conversationHistory: [],
        isOpen: false,
        isLoading: false,
        lastSendTime: 0,
        selectedImageBase64: null,
    };

    var DOM = {};

    // ========================================
    // Initialize
    // ========================================
    function init() {
        ensureFontAwesome();
        ensureDependencies();

        wrapBodyContent();

        var btn = getOrCreateButton();

        // Create float stack with AI + WhatsApp buttons
        createFloatStack();

        // Inject workspace panel into body
        var appDiv = document.createElement('div');
        appDiv.id = 'sf-ai-app';
        appDiv.innerHTML = buildWorkspaceHTML();
        document.body.appendChild(appDiv);

        DOM = {
            chatToggle: btn,
            workspace: document.getElementById('sf-ai-panel'),
            chatMessages: document.getElementById('chat-messages'),
            chatInput: document.getElementById('chat-input'),
            btnSend: document.getElementById('btn-send'),
            btnAttach: document.getElementById('btn-attach'),
            fileInput: document.getElementById('file-input'),
            btnClear: document.getElementById('btn-clear-chat'),
            btnNewChat: document.getElementById('btn-new-chat'),
            btnClose: document.getElementById('btn-close-workspace'),
            typingIndicator: document.getElementById('typing-indicator'),
            welcomeTime: document.getElementById('welcome-time'),
            pageWrapper: document.getElementById('sf-ai-page-wrapper'),
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
    // Toggle Workspace
    // ========================================
    function toggleChat() {
        state.isOpen = !state.isOpen;
        if (state.isOpen) {
            DOM.workspace.classList.add('open');
            DOM.chatToggle.classList.add('open');
            document.body.classList.add('sf-ai-open');
            var icon = DOM.chatToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-times';
            setTimeout(function () { DOM.chatInput.focus(); }, 350);
            scrollToBottom();
        } else {
            DOM.workspace.classList.remove('open');
            DOM.chatToggle.classList.remove('open');
            document.body.classList.remove('sf-ai-open');
            var icon2 = DOM.chatToggle.querySelector('i');
            if (icon2) icon2.className = 'fas fa-robot';
        }
    }

    function closeWorkspace() {
        if (state.isOpen) toggleChat();
    }

    // ========================================
    // Messages
    // ========================================
    function createMessageElement(role, text, imageDataUrl) {
        var isUser = role === 'user';
        var wrapper = document.createElement('div');
        wrapper.className = 'sf-ai-msg-wrap message-wrapper ' + (isUser ? 'sf-ai-msg-user user-message-wrapper' : 'sf-ai-msg-bot bot-message-wrapper');

        var avatarDiv = document.createElement('div');
        avatarDiv.className = 'sf-ai-msg-avatar message-avatar ' + (isUser ? 'sf-ai-avatar-user user-avatar' : 'sf-ai-avatar-bot bot-avatar');
        avatarDiv.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-leaf"></i>';

        var contentDiv = document.createElement('div');
        contentDiv.className = 'sf-ai-msg-body message-content';

        var bubble = document.createElement('div');
        bubble.className = 'sf-ai-bubble message-bubble ' + (isUser ? 'sf-ai-bubble-user user-bubble' : 'sf-ai-bubble-bot bot-bubble');

        var textDiv = document.createElement('div');
        textDiv.className = 'sf-ai-msg-text message-text';
        if (isUser) {
            textDiv.textContent = text;
        } else {
            textDiv.innerHTML = Utils.renderMarkdown(text);
        }
        bubble.appendChild(textDiv);

        if (imageDataUrl && isUser) {
            var imgWrap = document.createElement('div');
            imgWrap.style.marginBottom = '8px';
            var img = document.createElement('img');
            img.src = imageDataUrl;
            img.alt = 'Uploaded crop image';
            img.style.cssText = 'max-width:200px;max-height:150px;border-radius:8px;border:1px solid rgba(16,185,129,0.3);';
            imgWrap.appendChild(img);
            bubble.insertBefore(imgWrap, textDiv);
        }

        var timeSpan = document.createElement('span');
        timeSpan.className = 'sf-ai-msg-time message-time';
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
        requestAnimationFrame(function () { DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight; });
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
        var text = DOM.chatInput.value.trim();
        var imageDataUrl = state.selectedImageBase64;
        if (!text && !imageDataUrl) return;
        if (state.isLoading) return;

        var now = Date.now();
        if (now - state.lastSendTime < CONFIG.RATE_LIMIT_MS) return;
        state.lastSendTime = now;

        if (text.length > CONFIG.MAX_INPUT_LENGTH) {
            addMessage('bot', 'আপনার বার্তা অনেক বড়। ২০০০ অক্ষরের কম রাখুন।\nYour message is too long. Please keep it under 2000 characters.');
            return;
        }

        addMessage('user', text || 'Please analyze this crop image.', imageDataUrl);
        state.conversationHistory.push({ role: 'user', content: text || 'Please analyze this crop image.' });

        var MAX_HISTORY = 40;
        if (state.conversationHistory.length > MAX_HISTORY) {
            state.conversationHistory = state.conversationHistory.slice(-MAX_HISTORY);
        }

        DOM.chatInput.value = '';
        DOM.chatInput.style.height = 'auto';
        DOM.btnSend.disabled = true;
        clearImagePreview();

        state.isLoading = true;
        showTyping();

        try {
            var payload = { messages: state.conversationHistory };
            if (imageDataUrl) payload.image = imageDataUrl;

            var controller = new AbortController();
            var timeoutId = setTimeout(function () { controller.abort(); }, 35000);

            var response = await fetch(CONFIG.API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                var errData = await response.json().catch(function () { return null; });
                throw new Error((errData && errData.error) || 'Server error (' + response.status + ')');
            }

            var data = await response.json();
            var botReply = data.reply || data.message || 'আপনার প্রশ্নের উত্তর দিতে আমি সক্ষম। অনুগ্রহ করে আবার চেষ্টা করুন অথবা আমাদের হটলাইনে কল করুন: 01829-775552';

            addMessage('bot', botReply);
            state.conversationHistory.push({ role: 'assistant', content: botReply });
            Storage.save(state.conversationHistory);
        } catch (error) {
            console.error('Chat error:', error);
            var fallback = '\u0986\u09AE\u09BE\u09B0 \u0995\u09C3\u09B7\u09BF \u099C\u09CD\u09A8\u09BE\u09A8 \u09AD\u09BE\u09A8\u09CD\u09A1\u09BE\u09B0 \u09A5\u09C7\u0995\u09C7 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u09B8\u09BE\u09B9\u09BE\u09AF\u09CD\u09AF \u0995\u09B0\u09A4\u09C7 \u09AA\u09BE\u09B0\u09BF\u0966\n\n**\u09B8\u09BE\u09A7\u09BE\u09B0\u09A3 \u0995\u09C3\u09B7\u09BF \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6:**\n- \u09B8\u09AC\u09B8\u09AE\u09AF\u09BC \u0985\u09A8\u09C1\u09AE\u09CB\u09A6\u09BF\u09A4 \u09A1\u09BF\u09B2\u09BE\u09B0 \u09A5\u09C7\u0995\u09C7 \u09AF\u09be\u099A\u09BE\u0987\u0995\u09C3\u09A4 \u09AC\u09C0\u099C \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\n- \u09AE\u09BE\u099F\u09BF\u09B0 \u09AA\u09B0\u09C0\u0995\u09CD\u09B7\u09BE \u0995\u09B0\u09C7 \u09B8\u09A8\u09CD\u09A6\u09BF\u0995 \u09B8\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8\n- \u09A8\u09BF\u09AF\u09BC\u09AE\u09BF\u09A4 \u09B8\u09C7\u099A \u09A6\u09BF\u09A8\n- \u09AA\u09CB\u0995\u09BE\u09AE\u09BE\u0995\u09A1\u09BC\u09B0 \u09A6\u09C7\u0996\u09B2\u09C7 \u09B8\u09CD\u09A5\u09BE\u09A8\u09C0\u09AF\u09BC\u09B9 \u0995\u09C3\u09B7\u09BF \u0985\u09AB\u09BF\u09B8\u09C7 \u099C\u09BE\u09A8\u09BE\u09A8\n\n**\u09AF\u09CB\u0997\u09BE\u09AF\u09CB\u0997:**\n\u099F\u09C7\u09B2\u09BF\u09B9\u09B2\u09BE\u0987\u09A8: 01829-775552\n\u09A8\u09A8\u09CD\u09A4\u09B0\u09B8\u09CD\u09A5 \u0995\u09C3\u09B7\u09BF \u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3 \u0985\u09AB\u09BF\u09B8 (DAE)\n\n*\u0986\u09AE\u09BE\u09A6\u09C7\u09B0 \u09B9\u099F\u09B2\u09BE\u0987\u09A8\u09C7 \u0995\u09B2 \u0995\u09B0\u09B2\u09C7 \u09AC\u09BF\u09B6\u09C7\u09B7\u09CD\u099C\u09CD\u099E \u0995\u09C3\u09B7\u09BF \u09AA\u09B0\u09BE\u09AE\u09B0\u09CD\u09B6 \u09AA\u09BE\u09AC\u09C7\u09A8\u0964*';
            addMessage('bot', fallback);
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
        var reader = new FileReader();
        reader.onload = function (e) {
            state.selectedImageBase64 = e.target.result;
            showImagePreview(file.name, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    function showImagePreview(name, dataUrl) {
        removeExistingPreview();
        var preview = document.createElement('div');
        preview.className = 'sf-ai-image-preview image-preview';
        preview.id = 'image-preview';
        preview.innerHTML = '<img src="' + dataUrl + '" alt="Preview"><div class="sf-ai-preview-info"><div class="sf-ai-preview-name">' + Utils.escapeHtml(name) + '</div><div>Ready to analyze</div></div><button class="sf-ai-preview-remove" title="Remove image" aria-label="Remove image"><i class="fas fa-times"></i></button>';
        preview.querySelector('.sf-ai-preview-remove').addEventListener('click', clearImagePreview);
        document.querySelector('.sf-ai-input-wrap').parentNode.insertBefore(preview, document.querySelector('.sf-ai-input-wrap'));
    }

    function clearImagePreview() {
        removeExistingPreview();
        state.selectedImageBase64 = null;
        if (DOM.fileInput) DOM.fileInput.value = '';
        if (DOM.btnSend) {
            DOM.btnSend.disabled = !DOM.chatInput.value.trim();
        }
    }

    function removeExistingPreview() {
        var el = document.getElementById('image-preview');
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
        var msgs = DOM.chatMessages.querySelectorAll('.sf-ai-msg-wrap');
        msgs.forEach(function (m, i) { if (i > 0) m.remove(); });
        clearImagePreview();
    }

    function newChat() {
        state.conversationHistory = [];
        Storage.clear();
        clearImagePreview();
        var msgs = DOM.chatMessages.querySelectorAll('.sf-ai-msg-wrap');
        msgs.forEach(function (m, i) { if (i > 0) m.remove(); });
        DOM.chatInput.value = '';
        DOM.chatInput.style.height = 'auto';
        DOM.btnSend.disabled = true;
    }

    // ========================================
    // Restore History
    // ========================================
    function restoreHistory() {
        var history = Storage.load();
        if (!history || history.length === 0) return;
        state.conversationHistory = history;
        history.forEach(function (msg) {
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
        DOM.btnClose.addEventListener('click', closeWorkspace);
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
