export const SFA11y = {
    _settings: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        reducedMotion: false,
        fontSize: 1,
    },
    _storageKey: 'sf_a11y',
    _fontSizeLabels: ['ছোট', 'মাঝারি', 'বড়', 'বেশ বড়', 'সবচেয়ে বড়'],

    init() {
        this._loadSettings();
        this._applyAll();
        this.setupSkipLinks();
        this.setupKeyboardNav();
    },

    toggleHighContrast() {
        this._settings.highContrast = !this._settings.highContrast;
        this._applyHighContrast();
        this._saveSettings();
        this.announce(this._settings.highContrast ? 'উচ্চ কনট্রাস্ট চালু হয়েছে' : 'উচ্চ কনট্রাস্ট বন্ধ হয়েছে');
    },

    toggleLargeText() {
        this._settings.largeText = !this._settings.largeText;
        this._applyLargeText();
        this._saveSettings();
        this.announce(this._settings.largeText ? 'বড় টেক্সট চালু হয়েছে' : 'বড় টেক্সট বন্ধ হয়েছে');
    },

    toggleScreenReaderMode() {
        this._settings.screenReader = !this._settings.screenReader;
        this._applyScreenReader();
        this._saveSettings();
        this.announce(this._settings.screenReader ? 'স্ক্রিন রিডার মোড চালু হয়েছে' : 'স্ক্রিন রিডার মোড বন্ধ হয়েছে');
    },

    toggleReducedMotion() {
        this._settings.reducedMotion = !this._settings.reducedMotion;
        this._applyReducedMotion();
        this._saveSettings();
        this.announce(this._settings.reducedMotion ? 'কম মোশন চালু হয়েছে' : 'কম মোশন বন্ধ হয়েছে');
    },

    setFontSize(level) {
        const clamped = Math.max(1, Math.min(5, level));
        this._settings.fontSize = clamped;
        this._applyFontSize();
        this._saveSettings();
        this.announce(`ফন্ট সাইজ ${this._fontSizeLabels[clamped - 1]} করা হয়েছে`);
    },

    getSettings() {
        return { ...this._settings };
    },

    applySettings() {
        this._loadSettings();
        this._applyAll();
    },

    addAriaLabels() {
        document.querySelectorAll('a:not([aria-label])').forEach(a => {
            const text = a.textContent.trim();
            if (text && text.length < 80) a.setAttribute('aria-label', text);
        });
        document.querySelectorAll('button:not([aria-label])').forEach(btn => {
            const text = btn.textContent.trim() || btn.getAttribute('title');
            if (text) btn.setAttribute('aria-label', text);
        });
        document.querySelectorAll('input:not([aria-label])').forEach(input => {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) input.setAttribute('aria-label', label.textContent.trim());
            else if (input.placeholder) input.setAttribute('aria-label', input.placeholder);
        });
        document.querySelectorAll('img:not([alt])').forEach(img => {
            img.setAttribute('alt', '');
        });
    },

    announce(message, priority = 'polite') {
        const existing = document.getElementById('sf_a11y_announcer');
        if (existing) existing.remove();

        const el = document.createElement('div');
        el.id = 'sf_a11y_announcer';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', priority);
        el.setAttribute('aria-atomic', 'true');
        el.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
        document.body.appendChild(el);
        requestAnimationFrame(() => {
            el.textContent = message;
            setTimeout(() => el.remove(), 3000);
        });
    },

    setupSkipLinks() {
        if (document.getElementById('sf_a11y_skip')) return;
        const skip = document.createElement('a');
        skip.id = 'sf_a11y_skip';
        skip.href = '#main-content';
        skip.textContent = 'মূল বিষয়বস্তুতে যান';
        skip.style.cssText = 'position:absolute;top:-100%;left:0;background:#000;color:#fff;padding:8px 16px;z-index:100000;font-size:16px;text-decoration:none;border-radius:0 0 4px 0;';
        skip.addEventListener('focus', () => { skip.style.top = '0'; });
        skip.addEventListener('blur', () => { skip.style.top = '-100%'; });
        document.body.insertBefore(skip, document.body.firstChild);
    },

    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                const main = document.getElementById('main-content') || document.querySelector('main');
                if (main) main.focus();
            }
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                const nav = document.querySelector('nav');
                if (nav) nav.focus();
            }
            if (e.altKey && e.key === '3') {
                e.preventDefault();
                const footer = document.querySelector('footer');
                if (footer) footer.focus();
            }
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                this.toggleHighContrast();
            }
            if (e.altKey && e.key === 'l') {
                e.preventDefault();
                this.toggleLargeText();
            }
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                this.toggleReducedMotion();
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: false });
                }
            });
        });
    },

    createA11yToolbar(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const toolbar = document.createElement('div');
        toolbar.id = 'sf_a11y_toolbar';
        toolbar.setAttribute('role', 'toolbar');
        toolbar.setAttribute('aria-label', 'প্রবেশযোগ্যতা সরঞ্জাম');
        toolbar.style.cssText = 'background:#f5f5f5;border:1px solid #ddd;border-radius:8px;padding:12px;margin:8px 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-family:sans-serif;';

        const makeBtn = (label, onClick, active = false) => {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            btn.style.cssText = `padding:6px 14px;border:2px solid ${active ? '#0055ff' : '#999'};background:${active ? '#0055ff' : '#fff'};color:${active ? '#fff' : '#333'};border-radius:4px;cursor:pointer;font-size:14px;min-width:40px;`;
            btn.addEventListener('click', () => {
                onClick(btn);
            });
            return btn;
        };

        const updateBtn = (btn, isActive) => {
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            btn.style.borderColor = isActive ? '#0055ff' : '#999';
            btn.style.background = isActive ? '#0055ff' : '#fff';
            btn.style.color = isActive ? '#fff' : '#333';
        };

        const hcBtn = makeBtn('উচ্চ কনট্রাস্ট', () => {
            this.toggleHighContrast();
            updateBtn(hcBtn, this._settings.highContrast);
        }, this._settings.highContrast);

        const ltBtn = makeBtn('বড় টেক্সট', () => {
            this.toggleLargeText();
            updateBtn(ltBtn, this._settings.largeText);
        }, this._settings.largeText);

        const srBtn = makeBtn('স্ক্রিন রিডার', () => {
            this.toggleScreenReaderMode();
            updateBtn(srBtn, this._settings.screenReader);
        }, this._settings.screenReader);

        const rmBtn = makeBtn('কম মোশন', () => {
            this.toggleReducedMotion();
            updateBtn(rmBtn, this._settings.reducedMotion);
        }, this._settings.reducedMotion);

        const fsLabel = document.createElement('span');
        fsLabel.textContent = 'ফন্ট সাইজ:';
        fsLabel.style.cssText = 'font-size:14px;font-weight:600;color:#333;margin-left:8px;';

        const fsDown = makeBtn('−', () => {
            this.setFontSize(this._settings.fontSize - 1);
            fsValue.textContent = this._fontSizeLabels[this._settings.fontSize - 1];
        });
        fsDown.style.minWidth = '36px';

        const fsValue = document.createElement('span');
        fsValue.textContent = this._fontSizeLabels[this._settings.fontSize - 1];
        fsValue.style.cssText = 'font-size:14px;min-width:60px;text-align:center;font-weight:600;color:#333;';

        const fsUp = makeBtn('+', () => {
            this.setFontSize(this._settings.fontSize + 1);
            fsValue.textContent = this._fontSizeLabels[this._settings.fontSize - 1];
        });
        fsUp.style.minWidth = '36px';

        toolbar.append(hcBtn, ltBtn, srBtn, rmBtn, fsLabel, fsDown, fsValue, fsUp);
        container.appendChild(toolbar);
    },

    getFontSize() {
        return this._settings.fontSize;
    },

    _loadSettings() {
        try {
            const stored = localStorage.getItem(this._storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                this._settings = { ...this._settings, ...parsed };
            }
        } catch (e) {
            console.warn('SFA11y: সেটিংস লোড করা যায়নি', e);
        }
    },

    _saveSettings() {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify(this._settings));
        } catch (e) {
            console.warn('SFA11y: সেটিংস সংরক্ষণ করা যায়নি', e);
        }
    },

    _applyAll() {
        this._applyHighContrast();
        this._applyLargeText();
        this._applyScreenReader();
        this._applyReducedMotion();
        this._applyFontSize();
        this.addAriaLabels();
    },

    _applyHighContrast() {
        document.documentElement.classList.toggle('sf-high-contrast', this._settings.highContrast);
        if (this._settings.highContrast) {
            if (!document.getElementById('sf_a11y_hc_style')) {
                const style = document.createElement('style');
                style.id = 'sf_a11y_hc_style';
                style.textContent = `
                    .sf-high-contrast, .sf-high-contrast * {
                        background-color: #000 !important;
                        color: #ff0 !important;
                        border-color: #ff0 !important;
                        text-shadow: none !important;
                        box-shadow: none !important;
                    }
                    .sf-high-contrast a, .sf-high-contrast button {
                        color: #0ff !important;
                        text-decoration: underline !important;
                    }
                    .sf-high-contrast img {
                        filter: contrast(1.5) brightness(1.2);
                    }
                `;
                document.head.appendChild(style);
            }
        }
    },

    _applyLargeText() {
        document.documentElement.classList.toggle('sf-large-text', this._settings.largeText);
        if (this._settings.largeText) {
            if (!document.getElementById('sf_a11y_lt_style')) {
                const style = document.createElement('style');
                style.id = 'sf_a11y_lt_style';
                style.textContent = `
                    .sf-large-text, .sf-large-text * {
                        font-size: 1.2em !important;
                        line-height: 1.8 !important;
                        letter-spacing: 0.02em !important;
                    }
                    .sf-large-text h1 { font-size: 2.4em !important; }
                    .sf-large-text h2 { font-size: 2em !important; }
                    .sf-large-text h3 { font-size: 1.6em !important; }
                `;
                document.head.appendChild(style);
            }
        }
    },

    _applyScreenReader() {
        const el = document.getElementById('sf_a11y_sr_region');
        if (this._settings.screenReader) {
            if (!el) {
                const region = document.createElement('div');
                region.id = 'sf_a11y_sr_region';
                region.setAttribute('role', 'region');
                region.setAttribute('aria-label', 'স্ক্রিন রিডার তথ্য');
                region.setAttribute('tabindex', '-1');
                region.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);';
                document.body.appendChild(region);
            }
        } else {
            if (el) el.remove();
        }
    },

    _applyReducedMotion() {
        document.documentElement.classList.toggle('sf-reduced-motion', this._settings.reducedMotion);
        if (this._settings.reducedMotion) {
            if (!document.getElementById('sf_a11y_rm_style')) {
                const style = document.createElement('style');
                style.id = 'sf_a11y_rm_style';
                style.textContent = `
                    .sf-reduced-motion *, .sf-reduced-motion *::before, .sf-reduced-motion *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        scroll-behavior: auto !important;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    },

    _applyFontSize() {
        document.documentElement.style.setProperty('--sf-a11y-font-scale', this._settings.fontSize);
        const map = { 1: '14px', 2: '16px', 3: '18px', 4: '21px', 5: '24px' };
        document.documentElement.style.fontSize = map[this._settings.fontSize] || '16px';
    },
};
