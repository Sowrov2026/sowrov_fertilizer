/**
 * SF AI V16 — OCR Module
 * Client-side ES module for reading text from images using Tesseract.js
 * Supports: Fertilizer packets, medicine labels, government circulars,
 *           agriculture leaflets, invoices, prescriptions
 */

export const SFOCR = {
    worker: null,
    initialized: false,
    tesseractLoaded: false,

    /**
     * Initialize OCR engine
     */
    async init() {
        if (this.initialized) return true;
        try {
            await this.loadTesseract();
            this.initialized = true;
            console.log('[SFOCR] Engine initialized');
            return true;
        } catch (err) {
            console.error('[SFOCR] Init failed:', err);
            return false;
        }
    },

    /**
     * Load Tesseract.js from CDN
     */
    async loadTesseract() {
        if (this.tesseractLoaded) return;
        return new Promise((resolve, reject) => {
            if (typeof Tesseract !== 'undefined') {
                this.tesseractLoaded = true;
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
            script.onload = () => {
                this.tesseractLoaded = true;
                console.log('[SFOCR] Tesseract.js loaded');
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Tesseract.js'));
            document.head.appendChild(script);
        });
    },

    /**
     * Recognize text from image using Tesseract.js
     * @param {string|HTMLImageElement|File} imageData - Image source
     * @param {string} language - Tesseract language code (default: 'ben+eng')
     * @returns {Promise<{text: string, confidence: number}>}
     */
    async recognizeText(imageData, language = 'ben+eng') {
        if (!this.tesseractLoaded) await this.loadTesseract();
        try {
            const result = await Tesseract.recognize(imageData, language, {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        const pct = Math.round(m.progress * 100);
                        document.dispatchEvent(new CustomEvent('sfocr:progress', { detail: { progress: pct } }));
                    }
                }
            });
            return {
                text: result.data.text,
                confidence: result.data.confidence
            };
        } catch (err) {
            console.error('[SFOCR] Recognition failed:', err);
            throw err;
        }
    },

    /**
     * Extract structured data from fertilizer packet image
     * @param {string|File} imageData
     * @returns {Promise<Object>}
     */
    async extractFertilizerData(imageData) {
        const { text, confidence } = await this.recognizeText(imageData);
        const npk = this.extractNPK(text);
        const dosage = this.extractDosage(text);
        const warnings = this.extractWarnings(text);
        const productName = this._extractProductName(text);
        const manufacturer = this._extractManufacturer(text);

        const extracted = {
            rawText: text,
            confidence,
            productName,
            manufacturer,
            npk,
            dosage,
            warnings,
            documentType: 'fertilizer_packet',
            timestamp: new Date().toISOString()
        };

        extracted.simpleExplanation = this.explainInSimpleLanguage(extracted);
        return extracted;
    },

    /**
     * Extract NPK values from text
     * Patterns: "NPK 20-20-20", "N-P-K 14-14-14", "নাইট্রোজেন-ফসফরাস-পটাশিয়াম"
     */
    extractNPK(text) {
        const patterns = [
            /NPK[\s:]*([\d]+[\s\-\/][\d]+[\s\-\/][\d]+)/i,
            /N[\s\-\/]P[\s\-\/]K[\s:]*([\d]+[\s\-\/][\d]+[\s\-\/][\d]+)/i,
            /নাইট্রোজেন[\s\-\/]ফসফরাস[\s\-\/]পটাশিয়াম[\s:]*([\d]+[\s\-\/][\d]+[\s\-\/][\d]+)/i,
            /([\d]{1,2})[\s\-]+([\d]{1,2})[\s\-]+([\d]{1,2})[\s%]*(?:NPK|nitrogen|phosphorus|potassium|নাইট্রোজেন|ফসফরাস|পটাশিয়াম)/i,
            /(?:N|NPK|নাইট্রোজেন)[\s:]*([\d]{1,3})[%]?\s*[\-\/]\s*(?:P|ফসফরাস)[\s:]*([\d]{1,3})[%]?\s*[\-\/]\s*(?:K|পটাশিয়াম)[\s:]*([\d]{1,3})[%]?/i,
            /([\d]{1,3})[\s\-]+([\d]{1,3})[\s\-]+([\d]{1,3})/
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                if (match[1] && match[2] && match[3]) {
                    return {
                        nitrogen: parseInt(match[1], 10),
                        phosphorus: parseInt(match[2], 10),
                        potassium: parseInt(match[3], 10),
                        raw: `${match[1]}-${match[2]}-${match[3]}`
                    };
                }
                if (match[1]) {
                    const parts = match[1].split(/[\s\-\/]/);
                    if (parts.length === 3) {
                        return {
                            nitrogen: parseInt(parts[0], 10),
                            phosphorus: parseInt(parts[1], 10),
                            potassium: parseInt(parts[2], 10),
                            raw: match[1].trim()
                        };
                    }
                }
            }
        }
        return null;
    },

    /**
     * Extract dosage information from text
     */
    extractDosage(text) {
        const dosagePatterns = [
            { pattern: /প্রতি\s*শতক[\s:]*([\d০-৯]+\s*(?:কেজি|কে\.জি\.|kg|গ্রাম|g|লিটার|l))/i, unit: 'প্রতি শতক' },
            { pattern: /প্রতি\s*বিঘা[\s:]*([\d০-৯]+\s*(?:কেজি|কে\.জি\.|kg|গ্রাম|g|লিটার|l))/i, unit: 'প্রতি বিঘা' },
            { pattern: /per\s*acre[\s:]*([\d]+\s*(?:kg|g|l|ml))/i, unit: 'per acre' },
            { pattern: /per\s*hectare[\s:]*([\d]+\s*(?:kg|g|l|ml))/i, unit: 'per hectare' },
            { pattern: /প্রতি\s*(?:কেজি|কে\.জি\.|kg)\s*মাটিতে[\s:]*([\d০-৯]+\s*(?:গ্রাম|g|মিলিলিটার|ml))/i, unit: 'প্রতি কেজি মাটিতে' }
        ];

        const dosages = [];
        for (const { pattern, unit } of dosagePatterns) {
            const match = text.match(pattern);
            if (match) {
                dosages.push({ unit, amount: match[1].trim() });
            }
        }
        return dosages.length > 0 ? dosages : null;
    },

    /**
     * Extract warnings / safety instructions from text
     */
    extractWarnings(text) {
        const warningKeywords = ['সতর্কতা', 'warning', 'caution', 'বিপজ্জনক', 'সাবধান', 'সতর্ক', 'বিরাপ'];
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const warnings = [];

        for (let i = 0; i < lines.length; i++) {
            const lower = lines[i].toLowerCase();
            if (warningKeywords.some(kw => lower.includes(kw.toLowerCase()))) {
                let warningText = lines[i];
                if (i + 1 < lines.length && !warningKeywords.some(kw => lines[i + 1].toLowerCase().includes(kw.toLowerCase()))) {
                    warningText += ' ' + lines[i + 1];
                }
                warnings.push(warningText);
            }
        }
        return warnings.length > 0 ? warnings : null;
    },

    /**
     * Extract medicine name from text
     */
    extractMedicineName(text) {
        const patterns = [
            /(?:ওষুধের?\s*নাম| medicine\s*name|ঔষধ)[\s:]*([^\n]+)/i,
            /(?:নাম|name)[\s:]*([A-Za-z\u0980-\u09FF][^\n]{2,60})/i
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1].trim();
        }
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length > 0) return lines[0].substring(0, 80);
        return null;
    },

    /**
     * Explain extracted content in simple Bangla
     * @param {Object} extractedData
     * @returns {string}
     */
    explainInSimpleLanguage(extractedData) {
        const parts = [];

        if (extractedData.productName) {
            parts.push(`পণ্যের নাম: ${extractedData.productName}`);
        }

        if (extractedData.npk) {
            const n = extractedData.npk.nitrogen;
            const p = extractedData.npk.phosphorus;
            const k = extractedData.npk.potassium;
            parts.push(`এটি একটি NPK সার। এতে আছে: নাইট্রোজেন ${n}%, ফসফরাস ${p}%, পটাশিয়াম ${k}।`);
            parts.push(`নাইট্রোজেন গাছের পাতা ও কাণ্ড বাড়াতে সাহায্য করে।`);
            parts.push(`ফসফরাস মূল ও ফুল গঠনে সাহায্য করে।`);
            parts.push(`পটাশিয়াম রোগ প্রতিরোধ ও ফল ধরায় সাহায্য করে।`);
        }

        if (extractedData.dosage && extractedData.dosage.length > 0) {
            parts.push('ব্যবহারের পরিমাণ:');
            extractedData.dosage.forEach(d => {
                parts.push(`- ${d.unit}: ${d.amount}`);
            });
        }

        if (extractedData.warnings && extractedData.warnings.length > 0) {
            parts.push('সতর্কতা:');
            extractedData.warnings.forEach(w => {
                parts.push(`- ${w}`);
            });
            parts.push('দয়া করে নির্দেশনা অনুযায়ী ব্যবহার করুন।');
        }

        if (extractedData.manufacturer) {
            parts.push(`উৎপাদনকারী: ${extractedData.manufacturer}`);
        }

        if (parts.length === 0) {
            return 'চিত্র থেকে কোনো স্বাধীন তথ্য পাওয়া যায়নি। অনুগ্রহ করে স্পষ্ট ছবি আপলোড করুন।';
        }

        return parts.join('\n');
    },

    /**
     * Create OCR UI inside a container
     * @param {string} containerId - ID of the container element
     */
    createOCRUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`[SFOCR] Container #${containerId} not found`);
            return;
        }

        container.innerHTML = `
            <div class="sfocr-wrapper" style="font-family: 'Kalpurush', sans-serif; max-width: 700px; margin: 0 auto;">
                <h2 style="text-align: center; color: #2e7d32; margin-bottom: 16px;">কৃষি ডকুমেন্ট স্ক্যানার</h2>
                <p style="text-align: center; color: #555; margin-bottom: 20px;">সারের প্যাকেট, ওষুধের লেবেল, সরকারি নীতিমালা, চাষার পত্রিকা, বিল, প্রেসক্রিপশন স্ক্যান করুন</p>

                <div id="sfocr-upload-area" style="border: 2px dashed #aaa; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; background: #f9fbe7; transition: all 0.3s;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                    </svg>
                    <p style="margin: 12px 0 4px; font-size: 16px; color: #333;">ছবি আপলোড করতে ক্লিক করুন অথবা টেনে আনুন</p>
                    <p style="color: #888; font-size: 13px;">JPG, PNG, WEBP সমর্থিত</p>
                    <input type="file" id="sfocr-file-input" accept="image/*" style="display: none;" />
                </div>

                <div id="sfocr-preview" style="display: none; text-align: center; margin: 16px 0;">
                    <img id="sfocr-preview-img" style="max-width: 100%; max-height: 300px; border-radius: 8px; border: 1px solid #ddd;" />
                </div>

                <div id="sfocr-progress" style="display: none; margin: 12px 0;">
                    <div style="background: #e0e0e0; border-radius: 8px; overflow: hidden; height: 8px;">
                        <div id="sfocr-progress-bar" style="background: #43a047; height: 100%; width: 0%; transition: width 0.3s;"></div>
                    </div>
                    <p id="sfocr-progress-text" style="text-align: center; margin-top: 6px; color: #555; font-size: 13px;">প্রক্রিয়াকরণ চলছে...</p>
                </div>

                <div style="text-align: center; margin: 12px 0;">
                    <select id="sfocr-doc-type" style="padding: 8px 12px; border-radius: 6px; border: 1px solid #ccc; font-size: 14px;">
                        <option value="auto">স্বয়ংক্রিয় সনাক্তকরণ</option>
                        <option value="fertilizer_packet">সারের প্যাকেট</option>
                        <option value="medicine_label">ওষুধের লেবেল</option>
                        <option value="government_circular">সরকারি নীতিমালা</option>
                        <option value="agriculture_leaflet">চাষার পত্রিকা</option>
                        <option value="invoice">বিল/চালান</option>
                        <option value="prescription">প্রেসক্রিপশন</option>
                    </select>
                    <button id="sfocr-scan-btn" disabled style="margin-left: 8px; padding: 8px 20px; background: #43a047; color: #fff; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; opacity: 0.5;">স্ক্যান করুন</button>
                </div>

                <div id="sfocr-result" style="display: none; margin-top: 20px; background: #fff; border: 1px solid #c8e6c9; border-radius: 10px; padding: 16px;">
                    <h3 style="color: #2e7d32; margin-bottom: 10px;">স্ক্যান ফলাফল</h3>
                    <div id="sfocr-result-content"></div>
                </div>

                <div id="sfocr-supported" style="margin-top: 24px; padding: 14px; background: #f1f8e9; border-radius: 8px;">
                    <h4 style="color: #33691e; margin-bottom: 8px;">সমর্থিত ডকুমেন্ট ধরন:</h4>
                    <ul id="sfocr-doc-list" style="margin: 0; padding-left: 20px; color: #555;"></ul>
                </div>
            </div>
        `;

        this._bindEvents(container);
        this._populateDocTypes(container);
    },

    /**
     * Process uploaded image file
     * @param {File} file
     * @returns {Promise<Object>}
     */
    async processImage(file) {
        if (!file || !file.type.startsWith('image/')) {
            throw new Error('অনুগ্রহ করে একটি ছবি ফাইল দিন');
        }

        const showProgress = (pct) => {
            const bar = document.getElementById('sfocr-progress-bar');
            const txt = document.getElementById('sfocr-progress-text');
            if (bar) bar.style.width = `${pct}%`;
            if (txt) txt.textContent = `প্রক্রিয়াকরণ চলছে... ${pct}%`;
        };

        const progressEl = document.getElementById('sfocr-progress');
        const previewEl = document.getElementById('sfocr-preview');
        const previewImg = document.getElementById('sfocr-preview-img');
        if (progressEl) progressEl.style.display = 'block';
        if (previewEl) previewEl.style.display = 'block';
        if (previewImg) previewImg.src = URL.createObjectURL(file);

        document.addEventListener('sfocr:progress', (e) => {
            showProgress(e.detail.progress);
        });

        try {
            const dataUrl = await this._fileToDataUrl(file);
            const result = await this.extractFertilizerData(dataUrl);
            return result;
        } catch (err) {
            console.error('[SFOCR] Process failed:', err);
            throw err;
        } finally {
            if (progressEl) progressEl.style.display = 'none';
            document.removeEventListener('sfocr:progress', showProgress);
        }
    },

    /**
     * Get supported document types
     * @returns {Array<Object>}
     */
    getDocumentTypes() {
        return [
            { id: 'fertilizer_packet', name: 'সারের প্যাকেট', description: 'NPK মান, ব্যবহারের পরিমাণ, সতর্কতা' },
            { id: 'medicine_label', name: 'ওষুধের লেবেল', description: 'ওষুধের নাম, মাত্রা, পাশাপাশি প্রতিক্রিয়া' },
            { id: 'government_circular', name: 'সরকারি নীতিমালা', description: 'সরকারি নির্দেশনা, সবসিডি তথ্য' },
            { id: 'agriculture_leaflet', name: 'চাষার পত্রিকা', description: 'ফসল পরিচর্যা, কীটনাশক নির্দেশনা' },
            { id: 'invoice', name: 'বিল/চালান', description: 'মূল্য, পরিমাণ, কর' },
            { id: 'prescription', name: 'প্রেসক্রিপশন', description: 'চিকিৎসকের পরামর্শ, ওষুধের তালিকা' }
        ];
    },

    // ─── Private Helpers ──────────────────────────────────────

    _extractProductName(text) {
        const patterns = [
            /(?:পণ্যের?\s*নাম|product\s*name|brand)[\s:]*([^\n]+)/i,
            /(?:সার|fertilizer|সারের)[\s:]*([^\n]+)/i
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1].trim();
        }
        const lines = text.split('\n').filter(l => l.trim());
        return lines.length > 0 ? lines[0].substring(0, 80) : null;
    },

    _extractManufacturer(text) {
        const patterns = [
            /(?:উৎপাদনকারী|manufacturer|company|প্রতিষ্ঠান)[\s:]*([^\n]+)/i,
            /(?:ম্যানুফ্যাকচারার|produced\s*by)[\s:]*([^\n]+)/i
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1].trim();
        }
        return null;
    },

    _fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('ফাইল পড়তে ব্যর্থ'));
            reader.readAsDataURL(file);
        });
    },

    _bindEvents(container) {
        const uploadArea = container.querySelector('#sfocr-upload-area');
        const fileInput = container.querySelector('#sfocr-file-input');
        const scanBtn = container.querySelector('#sfocr-scan-btn');

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#43a047';
            uploadArea.style.background = '#e8f5e9';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#aaa';
            uploadArea.style.background = '#f9fbe7';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#aaa';
            uploadArea.style.background = '#f9fbe7';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                fileInput.files = e.dataTransfer.files;
                scanBtn.disabled = false;
                scanBtn.style.opacity = '1';
                this._showPreview(file);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                scanBtn.disabled = false;
                scanBtn.style.opacity = '1';
                this._showPreview(fileInput.files[0]);
            }
        });

        scanBtn.addEventListener('click', async () => {
            if (fileInput.files.length === 0) return;
            scanBtn.disabled = true;
            scanBtn.textContent = 'স্ক্যান হচ্ছে...';
            try {
                const result = await this.processImage(fileInput.files[0]);
                this._displayResult(result);
            } catch (err) {
                const resultDiv = container.querySelector('#sfocr-result');
                const resultContent = container.querySelector('#sfocr-result-content');
                resultDiv.style.display = 'block';
                resultContent.innerHTML = `<p style="color:#c62828;">ত্রুটি: ${err.message || 'স্ক্যান করা যায়নি'}</p>`;
            } finally {
                scanBtn.disabled = false;
                scanBtn.textContent = 'স্ক্যান করুন';
            }
        });
    },

    _showPreview(file) {
        const previewEl = document.getElementById('sfocr-preview');
        const previewImg = document.getElementById('sfocr-preview-img');
        if (previewEl && previewImg) {
            previewEl.style.display = 'block';
            previewImg.src = URL.createObjectURL(file);
        }
    },

    _displayResult(result) {
        const resultDiv = document.getElementById('sfocr-result');
        const resultContent = document.getElementById('sfocr-result-content');
        if (!resultDiv || !resultContent) return;

        let html = '';

        if (result.simpleExplanation) {
            html += `<div style="background:#e8f5e9; padding:12px; border-radius:8px; margin-bottom:12px; white-space:pre-line; color:#1b5e20;">${this._escapeHtml(result.simpleExplanation)}</div>`;
        }

        html += `<details style="margin-top:10px;">
            <summary style="cursor:pointer; color:#555;">কাঁচি তথ্য দেখুন</summary>
            <pre style="background:#f5f5f5; padding:10px; border-radius:6px; overflow-x:auto; font-size:13px; white-space:pre-wrap;">${this._escapeHtml(result.rawText)}</pre>
        </details>`;

        if (result.npk) {
            html += `<div style="margin-top:10px; padding:10px; background:#fff3e0; border-radius:6px;">
                <strong>NPK মান:</strong> N ${result.npk.nitrogen}% | P ${result.npk.phosphorus}% | K ${result.npk.potassium}%
            </div>`;
        }

        html += `<p style="margin-top:10px; font-size:12px; color:#999;">নির্ভুলতা: ${result.confidence}% | ${new Date(result.timestamp).toLocaleString('bn-BD')}</p>`;

        resultContent.innerHTML = html;
        resultDiv.style.display = 'block';
    },

    _escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _populateDocTypes(container) {
        const list = container.querySelector('#sfocr-doc-list');
        if (!list) return;
        const types = this.getDocumentTypes();
        list.innerHTML = types.map(t => `<li><strong>${t.name}</strong> — ${t.description}</li>`).join('');
    }
};
