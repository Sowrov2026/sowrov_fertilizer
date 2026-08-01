/**
 * SF Voice AI Module V16
 * Client-side ES module for Speech-to-Text and Text-to-Speech
 * Supports: Bangla (bn-BD), English (en-US), Banglish
 */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

const BANGLA_UNICODE_RANGE = /[\u0980-\u09FF]/;
const BANGLISH_INDICATORS = [
    'ami', 'tumi', 'apni', 'kemon', 'ache', 'nai', 'korte', 'pari', 'jodi', 'hobe',
    'ki', 'kotha', 'bolte', 'chai', 'dhonnobad', 'please', 'haan', 'na', 'bhalo',
    'thik', 'hmm', 'accha', 'darun', 'bujhte', 'parlam', 'jani', 'ekhane', 'otha',
    'khub', 'onek', 'kom', 'beshi', 'shob', 'kono', 'sobar', 'amake', 'take'
];

const BANGLA_KEYWORDS = [
    'আমি', 'তুমি', 'আপনি', 'কেমন', 'আছে', 'নাই', 'করতে', 'পারি', 'যদি', 'হবে',
    'কি', 'কথা', 'বলতে', 'চাই', 'ধন্যবাদ', 'অনুগ্রহ', 'হ্যাঁ', 'না', 'ভালো',
    'ঠিক', 'এখানে', 'খুব', 'অনেক', 'কম', 'বেশি', 'সব', 'কোনো', 'সবার', 'আমাকে'
];

const DEFAULT_OPTIONS = {
    lang: 'bn-BD',
    continuous: true,
    interimResults: true,
    autoRestart: true,
    vadEnabled: true,
    noiseReduction: true,
    tts: {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        preferredVoice: 'bn-BD'
    }
};

const UI_TEXT = {
    micButton: 'মাইক্রোফোন চালু করুন',
    micActive: 'বন্ধ করুন',
    stopButton: 'থামুন',
    languageLabel: 'ভাষা নির্বাচন',
    rateLabel: 'গতি',
    pitchLabel: 'সুর',
    volumeLabel: 'ভলিউম',
    listening: 'শুনছে...',
    speaking: 'কথা বলছে...',
    notSupported: 'আপনার ব্রাউজার ভয়েস সাপোর্ট করে না',
    continuousOn: 'ক্রমাগত মোড চালু',
    continuousOff: 'ক্রমাগত মোড বন্ধ',
    error: 'ত্রুটি ঘটেছে',
    retry: 'আবার চেষ্টা করুন'
};

function detectLanguage(text) {
    if (!text || text.trim().length === 0) return 'en-US';
    
    const normalized = text.trim().toLowerCase();
    const words = normalized.split(/\s+/);
    
    if (BANGLA_UNICODE_RANGE.test(text)) {
        let banglaScore = 0;
        for (const word of words) {
            if (BANGLA_KEYWORDS.some(kw => word.includes(kw))) {
                banglaScore += 2;
            }
        }
        if (banglaScore > 0) return 'bn-BD';
    }
    
    let banglishScore = 0;
    for (const word of words) {
        if (BANGLISH_INDICATORS.includes(word)) {
            banglishScore++;
        }
    }
    
    if (banglishScore >= 2 || (banglishScore >= 1 && words.length <= 3)) {
        return 'bn-BD';
    }
    
    if (words.length > 0 && banglishScore / words.length > 0.3) {
        return 'bn-BD';
    }
    
    return 'en-US';
}

function createVoiceUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('কনটেইনার পাওয়া যায়নি:', containerId);
        return null;
    }
    
    container.innerHTML = `
        <div class="sf-voice-ui">
            <div class="sf-voice-controls">
                <button id="sf-voice-mic" class="sf-voice-btn sf-mic-btn" title="${UI_TEXT.micButton}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                </button>
                <button id="sf-voice-stop" class="sf-voice-btn sf-stop-btn" style="display:none" title="${UI_TEXT.stopButton}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                </button>
                <button id="sf-voice-continuous" class="sf-voice-btn sf-continuous-btn" title="${UI_TEXT.continuousOn}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                    </svg>
                </button>
            </div>
            <div class="sf-voice-status" id="sf-voice-status"></div>
            <div class="sf-voice-indicator" id="sf-voice-indicator">
                <div class="sf-wave"></div>
                <div class="sf-wave"></div>
                <div class="sf-wave"></div>
                <div class="sf-wave"></div>
                <div class="sf-wave"></div>
            </div>
            <div class="sf-voice-settings">
                <label class="sf-voice-label">${UI_TEXT.languageLabel}
                    <select id="sf-voice-lang" class="sf-voice-select">
                        <option value="bn-BD">বাংলা</option>
                        <option value="en-US">English</option>
                    </select>
                </label>
                <label class="sf-voice-label">${UI_TEXT.rateLabel}
                    <input type="range" id="sf-voice-rate" class="sf-voice-range" min="0.5" max="2" step="0.1" value="1">
                </label>
                <label class="sf-voice-label">${UI_TEXT.pitchLabel}
                    <input type="range" id="sf-voice-pitch" class="sf-voice-range" min="0.5" max="2" step="0.1" value="1">
                </label>
                <label class="sf-voice-label">${UI_TEXT.volumeLabel}
                    <input type="range" id="sf-voice-volume" class="sf-voice-range" min="0" max="1" step="0.1" value="1">
                </label>
            </div>
            <div class="sf-voice-result" id="sf-voice-result"></div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .sf-voice-ui {
            font-family: 'Hind Siliguri', Arial, sans-serif;
            max-width: 400px;
            padding: 16px;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .sf-voice-controls {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 12px;
        }
        .sf-voice-btn {
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        .sf-mic-btn {
            background: #4CAF50;
            color: white;
        }
        .sf-mic-btn:hover {
            background: #45a049;
            transform: scale(1.05);
        }
        .sf-mic-btn.active {
            background: #f44336;
            animation: pulse 1s infinite;
        }
        .sf-stop-btn {
            background: #ff9800;
            color: white;
        }
        .sf-stop-btn:hover {
            background: #f57c00;
        }
        .sf-continuous-btn {
            background: #2196F3;
            color: white;
        }
        .sf-continuous-btn:hover {
            background: #1976D2;
        }
        .sf-continuous-btn.active {
            background: #0d47a1;
        }
        .sf-voice-status {
            text-align: center;
            font-size: 14px;
            color: #666;
            min-height: 20px;
            margin-bottom: 10px;
        }
        .sf-voice-indicator {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 40px;
            gap: 4px;
            margin-bottom: 12px;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .sf-voice-indicator.active {
            opacity: 1;
        }
        .sf-wave {
            width: 4px;
            height: 10px;
            background: #4CAF50;
            border-radius: 2px;
            animation: wave 0.5s ease-in-out infinite;
        }
        .sf-wave:nth-child(2) { animation-delay: 0.1s; }
        .sf-wave:nth-child(3) { animation-delay: 0.2s; }
        .sf-wave:nth-child(4) { animation-delay: 0.3s; }
        .sf-wave:nth-child(5) { animation-delay: 0.4s; }
        @keyframes wave {
            0%, 100% { height: 10px; }
            50% { height: 30px; }
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(244, 67, 54, 0); }
            100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
        }
        .sf-voice-settings {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 12px;
        }
        .sf-voice-label {
            font-size: 12px;
            color: #555;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .sf-voice-select {
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 13px;
        }
        .sf-voice-range {
            width: 100%;
            height: 6px;
            -webkit-appearance: none;
            background: #ddd;
            border-radius: 3px;
            outline: none;
        }
        .sf-voice-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            background: #4CAF50;
            border-radius: 50%;
            cursor: pointer;
        }
        .sf-voice-result {
            background: white;
            padding: 12px;
            border-radius: 8px;
            min-height: 60px;
            font-size: 14px;
            line-height: 1.5;
            border: 1px solid #e0e0e0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .sf-voice-result:empty::before {
            content: 'এখানে আপনার কথা দেখা যাবে...';
            color: #999;
        }
    `;
    document.head.appendChild(style);
    
    return {
        micBtn: document.getElementById('sf-voice-mic'),
        stopBtn: document.getElementById('sf-voice-stop'),
        continuousBtn: document.getElementById('sf-voice-continuous'),
        statusEl: document.getElementById('sf-voice-status'),
        indicatorEl: document.getElementById('sf-voice-indicator'),
        langSelect: document.getElementById('sf-voice-lang'),
        rateRange: document.getElementById('sf-voice-rate'),
        pitchRange: document.getElementById('sf-voice-pitch'),
        volumeRange: document.getElementById('sf-voice-volume'),
        resultEl: document.getElementById('sf-voice-result')
    };
}

export const SFVoice = {
    _recognition: null,
    _options: { ...DEFAULT_OPTIONS },
    _state: {
        listening: false,
        speaking: false,
        continuous: true,
        initialized: false,
        currentLang: 'bn-BD',
        finalTranscript: '',
        interimTranscript: ''
    },
    _callbacks: {
        onSpeechStart: null,
        onSpeechEnd: null,
        onResult: null,
        onError: null
    },
    _ui: null,
    _voiceMap: new Map(),
    
    init(options = {}) {
        if (this._state.initialized) {
            console.warn('ভয়েস সিস্টেম ইতিমধ্যে ইনিশিয়ালাইজ করা আছে');
            return this;
        }
        
        this._options = { ...DEFAULT_OPTIONS, ...options };
        this._options.tts = { ...DEFAULT_OPTIONS.tts, ...(options.tts || {}) };
        
        if (!this.isSupported()) {
            console.error(UI_TEXT.notSupported);
            return this;
        }
        
        this._initRecognition();
        this._initVoices();
        this._state.initialized = true;
        
        return this;
    },
    
    isSupported() {
        return !!(SpeechRecognition && synth);
    },
    
    _initRecognition() {
        this._recognition = new SpeechRecognition();
        this._recognition.continuous = this._options.continuous;
        this._recognition.interimResults = this._options.interimResults;
        this._recognition.lang = this._options.lang;
        this._recognition.maxAlternatives = 1;
        
        this._recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript;
                } else {
                    interim += transcript;
                }
            }
            
            if (final) {
                this._state.finalTranscript += final;
                const detectedLang = this.detectLanguage(final);
                if (detectedLang !== this._state.currentLang) {
                    this._state.currentLang = detectedLang;
                    this._recognition.lang = detectedLang;
                }
            }
            
            this._state.interimTranscript = interim;
            
            const result = {
                final: this._state.finalTranscript,
                interim: interim,
                language: this._state.currentLang,
                timestamp: Date.now()
            };
            
            if (this._callbacks.onResult) {
                this._callbacks.onResult(result);
            }
            
            if (this._ui) {
                this._ui.resultEl.textContent = this._state.finalTranscript + interim;
            }
        };
        
        this._recognition.onerror = (event) => {
            const error = {
                code: event.error,
                message: this._getErrorMessage(event.error),
                timestamp: Date.now()
            };
            
            if (this._callbacks.onError) {
                this._callbacks.onError(error);
            }
            
            if (this._ui) {
                this._ui.statusEl.textContent = `${UI_TEXT.error}: ${error.message}`;
            }
            
            if (event.error === 'no-speech' || event.error === 'aborted') {
                if (this._options.autoRestart && this._state.continuous && this._state.listening) {
                    setTimeout(() => this.startListening(), 500);
                }
            }
        };
        
        this._recognition.onend = () => {
            if (this._state.listening) {
                if (this._options.autoRestart && this._state.continuous) {
                    setTimeout(() => {
                        try {
                            this._recognition.start();
                        } catch (e) {
                            console.warn('পুনরায় স্টার্ট করতে সমস্যা:', e);
                        }
                    }, 100);
                } else {
                    this._setState({ listening: false });
                }
            }
        };
        
        this._recognition.onspeechstart = () => {
            if (this._state.speaking) {
                this.stopSpeaking();
            }
            
            this._setState({ listening: true });
            
            if (this._ui) {
                this._ui.statusEl.textContent = UI_TEXT.listening;
                this._ui.indicatorEl.classList.add('active');
            }
            
            if (this._callbacks.onSpeechStart) {
                this._callbacks.onSpeechStart();
            }
        };
        
        this._recognition.onspeechend = () => {
            if (this._callbacks.onSpeechEnd) {
                this._callbacks.onSpeechEnd();
            }
        };
    },
    
    _initVoices() {
        const loadVoices = () => {
            const voices = synth.getVoices();
            this._voiceMap.clear();
            
            voices.forEach(voice => {
                const lang = voice.lang.split('-')[0];
                if (!this._voiceMap.has(lang)) {
                    this._voiceMap.set(lang, []);
                }
                this._voiceMap.get(lang).push(voice);
            });
        };
        
        loadVoices();
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = loadVoices;
        }
    },
    
    _setState(newState) {
        Object.assign(this._state, newState);
    },
    
    _getErrorMessage(code) {
        const errors = {
            'no-speech': 'কোনো বাক্য শোনা যায়নি',
            'audio-capture': 'মাইক্রোফোন পাওয়া যায়নি',
            'not-allowed': 'মাইক্রোফোন অনুমতি দেওয়া হয়নি',
            'network': 'নেটওয়ার্ক সমস্যা',
            'aborted': 'বাতিল করা হয়েছে',
            'language-not-supported': 'ভাষা সাপোর্ট করে না',
            'service-not-allowed': 'সার্ভিস অনুমতি নেই',
            'unknown': 'অজানা ত্রুটি'
        };
        return errors[code] || errors['unknown'];
    },
    
    async startListening(options = {}) {
        if (!this.isSupported()) {
            throw new Error(UI_TEXT.notSupported);
        }
        
        if (this._state.listening) {
            return;
        }
        
        if (options.lang) {
            this._recognition.lang = options.lang;
            this._state.currentLang = options.lang;
        }
        
        if (options.continuous !== undefined) {
            this._recognition.continuous = options.continuous;
        }
        
        this._setState({
            listening: true,
            finalTranscript: '',
            interimTranscript: ''
        });
        
        try {
            await this._recognition.start();
        } catch (e) {
            if (e.message.includes('already started')) {
                return;
            }
            throw e;
        }
        
        if (this._ui) {
            this._ui.micBtn.classList.add('active');
            this._ui.micBtn.title = UI_TEXT.micActive;
            this._ui.stopBtn.style.display = 'flex';
            this._ui.statusEl.textContent = UI_TEXT.listening;
            this._ui.indicatorEl.classList.add('active');
        }
    },
    
    stopListening() {
        if (!this._state.listening) {
            return;
        }
        
        this._setState({ listening: false });
        this._recognition.stop();
        
        if (this._ui) {
            this._ui.micBtn.classList.remove('active');
            this._ui.micBtn.title = UI_TEXT.micButton;
            this._ui.stopBtn.style.display = 'none';
            this._ui.statusEl.textContent = '';
            this._ui.indicatorEl.classList.remove('active');
        }
    },
    
    isListening() {
        return this._state.listening;
    },
    
    speak(text, options = {}) {
        if (!this.isSupported() || !text) {
            return;
        }
        
        synth.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || this._options.tts.preferredVoice;
        utterance.rate = options.rate || this._options.tts.rate;
        utterance.pitch = options.pitch || this._options.tts.pitch;
        utterance.volume = options.volume || this._options.tts.volume;
        
        const voices = this.getVoices(utterance.lang);
        if (voices.length > 0) {
            const preferred = voices.find(v => v.lang === utterance.lang) || voices[0];
            utterance.voice = preferred;
        }
        
        utterance.onstart = () => {
            this._setState({ speaking: true });
            if (this._ui) {
                this._ui.statusEl.textContent = UI_TEXT.speaking;
            }
        };
        
        utterance.onend = () => {
            this._setState({ speaking: false });
            if (this._ui) {
                this._ui.statusEl.textContent = '';
            }
        };
        
        utterance.onerror = (event) => {
            this._setState({ speaking: false });
            if (this._ui) {
                this._ui.statusEl.textContent = `${UI_TEXT.error}: ${event.error}`;
            }
        };
        
        synth.speak(utterance);
    },
    
    stopSpeaking() {
        synth.cancel();
        this._setState({ speaking: false });
        if (this._ui) {
            this._ui.statusEl.textContent = '';
        }
    },
    
    isSpeaking() {
        return this._state.speaking;
    },
    
    detectLanguage(text) {
        return detectLanguage(text);
    },
    
    toggleContinuous() {
        this._state.continuous = !this._state.continuous;
        this._recognition.continuous = this._state.continuous;
        
        if (this._ui) {
            this._ui.continuousBtn.classList.toggle('active', this._state.continuous);
            this._ui.continuousBtn.title = this._state.continuous ? UI_TEXT.continuousOn : UI_TEXT.continuousOff;
        }
        
        return this._state.continuous;
    },
    
    getVoices(lang) {
        const baseLang = lang ? lang.split('-')[0] : '';
        if (baseLang && this._voiceMap.has(baseLang)) {
            return this._voiceMap.get(baseLang);
        }
        return Array.from(this._voiceMap.values()).flat();
    },
    
    setVoice(voiceName) {
        const allVoices = this.getVoices();
        const voice = allVoices.find(v => v.name === voiceName);
        if (voice) {
            this._options.tts.preferredVoice = voice.lang;
            return true;
        }
        return false;
    },
    
    setRate(rate) {
        const clamped = Math.min(2, Math.max(0.5, rate));
        this._options.tts.rate = clamped;
        if (this._ui) {
            this._ui.rateRange.value = clamped;
        }
    },
    
    setPitch(pitch) {
        const clamped = Math.min(2, Math.max(0.5, pitch));
        this._options.tts.pitch = clamped;
        if (this._ui) {
            this._ui.pitchRange.value = clamped;
        }
    },
    
    setVolume(volume) {
        const clamped = Math.min(1, Math.max(0, volume));
        this._options.tts.volume = clamped;
        if (this._ui) {
            this._ui.volumeRange.value = clamped;
        }
    },
    
    createVoiceUI(containerId) {
        this._ui = createVoiceUI(containerId);
        
        if (!this._ui) return null;
        
        this._ui.micBtn.addEventListener('click', () => {
            if (this._state.listening) {
                this.stopListening();
            } else {
                this.startListening({ lang: this._ui.langSelect.value });
            }
        });
        
        this._ui.stopBtn.addEventListener('click', () => {
            this.stopListening();
            this.stopSpeaking();
        });
        
        this._ui.continuousBtn.addEventListener('click', () => {
            this.toggleContinuous();
        });
        this._ui.continuousBtn.classList.toggle('active', this._state.continuous);
        
        this._ui.langSelect.addEventListener('change', (e) => {
            this._recognition.lang = e.target.value;
            this._state.currentLang = e.target.value;
        });
        
        this._ui.rateRange.addEventListener('input', (e) => {
            this.setRate(parseFloat(e.target.value));
        });
        
        this._ui.pitchRange.addEventListener('input', (e) => {
            this.setPitch(parseFloat(e.target.value));
        });
        
        this._ui.volumeRange.addEventListener('input', (e) => {
            this.setVolume(parseFloat(e.target.value));
        });
        
        return this._ui;
    },
    
    onSpeechStart(callback) {
        this._callbacks.onSpeechStart = callback;
    },
    
    onSpeechEnd(callback) {
        this._callbacks.onSpeechEnd = callback;
    },
    
    onResult(callback) {
        this._callbacks.onResult = callback;
    },
    
    onError(callback) {
        this._callbacks.onError = callback;
    }
};
