/**
 * SF AI V15 — AI Vision Module
 * Crop disease identification via image upload
 * Client-side ES module with no external dependencies
 */

const VISION_PROMPT = `You are an expert agriculture disease diagnostician for Bangladesh farming.

Analyze this crop image and provide a detailed diagnosis in the following JSON-like format:

**Disease/Problem Name (রোগ/সমস্যার নাম):** [Name]
**Confidence (আত্মবিশ্বাস):** [0-100]%
**Crop Detected (শনাক্তকৃত ফসল):** [Crop name]
**Symptoms Observed (লক্ষণ):** [What you see]
**Cause (কারণ):** [Why it happened]
**Severity (তীব্রতা):** [Low/Medium/High/Critical]

**Organic Treatment (জৈব সমাধান):**
- [Step 1]
- [Step 2]

**Chemical Treatment (রাসায়নিক সমাধান):**
- [Step 1]
- [Step 2]

**Prevention (প্রতিরোধ):**
- [Step 1]
- [Step 2]

**Recommended Products:**
- [Product 1 with brief reason]
- [Product 2 with brief reason]

Important: Answer in the same language as the user's message. If the user writes in Bangla, answer in Bangla.`;

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_WIDTH = 800;
const COMPRESSION_QUALITY = 0.8;
const HISTORY_KEY = 'sf_vision_history';
const MAX_HISTORY = 20;

/**
 * Check if the file is an allowed image type
 * @param {File} file
 * @returns {boolean}
 */
function isAllowedType(file) {
    return ALLOWED_TYPES.includes(file.type);
}

/**
 * Get a user-friendly error message for validation failures
 * @param {File} file
 * @returns {string|null} Error message or null if valid
 */
function getValidationError(file) {
    if (!isAllowedType(file)) {
        return 'শুধুমাত্র JPG, JPEG, PNG এবং WEBP ফরম্যাট সমর্থিত।';
    }
    if (file.size > MAX_FILE_SIZE) {
        return 'ফাইলের সাইজ ৫MB এর বেশি হতে পারবে না।';
    }
    return null;
}

/**
 * Generate a thumbnail data URL from a file
 * @param {File} file
 * @returns {Promise<string>} Base64 data URL
 */
function createThumbnail(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('থাম্বনেল তৈরি করা যায়নি'));
        reader.readAsDataURL(file);
    });
}

/**
 * Extract structured fields from the AI text response
 * @param {string} text - Raw AI response
 * @returns {object} Parsed diagnosis object
 */
function extractField(text, pattern) {
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
}

/**
 * Extract a list section (lines starting with -) from the response
 * @param {string} text - Full response text
 * @param {string} sectionHeader - Header to search after
 * @returns {string[]} Array of list items
 */
function extractList(text, sectionHeader) {
    const regex = new RegExp(
        sectionHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?(?=\\n\\*\\*|$)',
        'i'
    );
    const section = text.match(regex);
    if (!section) return [];
    return section[0]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line.length > 0);
}

/**
 * Parse the AI response into a structured result object
 * @param {string} aiResponse - Raw AI text response
 * @returns {object} Structured diagnosis
 */
function parseResponse(aiResponse) {
    const confidenceRaw = extractField(
        aiResponse,
        /\*\*(?:Confidence|আত্মবিশ্বাস)\*\*[:\s]*([^\n*]+)/i
    );
    const confidenceNum = parseInt(confidenceRaw, 10);

    return {
        diseaseName: extractField(
            aiResponse,
            /\*\*(?:Disease\/Problem Name|রোগ\/সমস্যার নাম)\*\*[:\s]*([^\n*]+)/i
        ),
        confidence: isNaN(confidenceNum) ? 0 : Math.min(100, Math.max(0, confidenceNum)),
        cropDetected: extractField(
            aiResponse,
            /\*\*(?:Crop Detected|শনাক্তকৃত ফসল)\*\*[:\s]*([^\n*]+)/i
        ),
        symptoms: extractField(
            aiResponse,
            /\*\*(?:Symptoms Observed|লক্ষণ)\*\*[:\s]*([^\n*]+)/i
        ),
        cause: extractField(
            aiResponse,
            /\*\*(?:Cause|কারণ)\*\*[:\s]*([^\n*]+)/i
        ),
        severity: extractField(
            aiResponse,
            /\*\*(?:Severity|তীব্রতা)\*\*[:\s]*([^\n*]+)/i
        ),
        organicTreatment: extractList(
            aiResponse,
            /\*\*(?:Organic Treatment|জৈব সমাধান)\*\*:?/i
        ),
        chemicalTreatment: extractList(
            aiResponse,
            /\*\*(?:Chemical Treatment|রাসায়নিক সমাধান)\*\*:?/i
        ),
        prevention: extractList(
            aiResponse,
            /\*\*(?:Prevention|প্রতিরোধ)\*\*:?/i
        ),
        recommendedProducts: extractList(
            aiResponse,
            /\*\*(?:Recommended Products)\*\*:?/i
        ),
        rawResponse: aiResponse,
    };
}

/**
 * Load diagnosis history from localStorage
 * @returns {object[]} Array of past analyses
 */
function getHistory() {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Save a single entry to history (keeps last MAX_HISTORY entries)
 * @param {object} entry - Analysis result entry
 */
function saveToHistory(entry) {
    try {
        const history = getHistory();
        history.unshift(entry);
        if (history.length > MAX_HISTORY) {
            history.length = MAX_HISTORY;
        }
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
        // Storage full or unavailable — silently ignore
    }
}

/**
 * Clear all diagnosis history
 */
function clearHistory() {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch {
        // ignore
    }
}

/**
 * Compress an image file to maxWidth while maintaining aspect ratio
 * @param {File} file - Source image file
 * @param {number} [maxWidth=800] - Maximum width in pixels
 * @param {number} [quality=0.8] - JPEG/WebP quality (0–1)
 * @returns {Promise<Blob>} Compressed image blob
 */
async function compressImage(file, maxWidth = MAX_WIDTH, quality = COMPRESSION_QUALITY) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                blob => {
                    if (blob) resolve(blob);
                    else reject(new Error('ছবি সংকুচিত করা যায়নি'));
                },
                file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('ছবি লোড করা যায়নি'));
        };

        img.src = url;
    });
}

/**
 * Convert a Blob to a base64 data URL string
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা'));
        reader.readAsDataURL(blob);
    });
}

/**
 * Validate a file for upload
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
function validateFile(file) {
    const error = getValidationError(file);
    if (error) return { valid: false, error };
    return { valid: true };
}

/**
 * Send image + prompt to the chat API and return the AI response text
 * @param {string} base64DataUrl - Full data URL (data:image/...;base64,...)
 * @param {string} question - User question / prompt
 * @returns {Promise<string>} AI response text
 */
async function sendToAPI(base64DataUrl, question) {
    const userContent = question || 'এই ছবিটি বিশ্লেষণ করে রোগ নির্ণয় দিন।';

    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [{ role: 'user', content: userContent }],
            image: base64DataUrl,
        }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`সার্ভার ত্রুটি (${res.status}): ${text || 'অজানা সমস্যা'}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || data.content || data.response || '';
}

/**
 * Analyze a single image
 * @param {File|string} imageData - File object or base64 data URL
 * @param {string} [question] - Optional question to accompany the image
 * @returns {Promise<object>} Structured diagnosis result
 */
async function analyzeImage(imageData, question) {
    let base64DataUrl;
    let previewUrl;

    if (imageData instanceof File) {
        const validation = validateFile(imageData);
        if (!validation.valid) throw new Error(validation.error);

        const compressed = await compressImage(imageData);
        base64DataUrl = await blobToDataURL(compressed);
        previewUrl = await createThumbnail(imageData);
    } else if (typeof imageData === 'string') {
        base64DataUrl = imageData;
        previewUrl = imageData.substring(0, 80) + '...';
    } else {
        throw new Error('অবৈধ ইনপুট: File অথবা base64 data URL প্রয়োজন');
    }

    const aiResponse = await sendToAPI(base64DataUrl, VISION_PROMPT + (question ? '\n\nUser question: ' + question : ''));
    const diagnosis = parseResponse(aiResponse);

    const entry = {
        timestamp: new Date().toISOString(),
        imagePreview: previewUrl,
        diagnosis,
        confidence: diagnosis.confidence,
    };

    saveToHistory(entry);
    return entry;
}

/* ──────────────────────────────────────────────
   UI Helpers
   ────────────────────────────────────────────── */

/**
 * Create and inject the upload UI into the given container
 * @param {string} containerId - ID of the container element
 * @param {object} [options] - Configuration overrides
 */
function createUploadUI(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }

    const {
        multiple = true,
        accept = 'image/jpeg,image/jpg,image/png,image/webp',
        onAnalysisComplete = null,
    } = options;

    container.innerHTML = `
        <div class="vision-upload-zone" id="${containerId}-dropzone">
            <input
                type="file"
                id="${containerId}-fileinput"
                accept="${accept}"
                ${multiple ? 'multiple' : ''}
                capture="environment"
                style="display:none"
            />
            <div class="vision-upload-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p class="vision-upload-text">ছবি আপলোড করুন</p>
                <p class="vision-upload-hint">ড্র্যাগ করুন, ক্লিক করুন, অথবা ক্যামেরা ব্যবহার করুন</p>
                <div class="vision-upload-buttons">
                    <button type="button" class="vision-btn-file" id="${containerId}-btn-file">ফাইল নির্বাচন</button>
                    <button type="button" class="vision-btn-camera" id="${containerId}-btn-camera">ক্যামেরা</button>
                </div>
            </div>
        </div>
        <div class="vision-preview-grid" id="${containerId}-previews"></div>
        <div class="vision-loading" id="${containerId}-loading" style="display:none">
            <div class="vision-spinner"></div>
            <p>বিশ্লেষণ করা হচ্ছে...</p>
        </div>
        <div class="vision-result" id="${containerId}-result"></div>
    `;

    const dropzone = container.querySelector(`#${containerId}-dropzone`);
    const fileInput = container.querySelector(`#${containerId}-fileinput`);
    const btnFile = container.querySelector(`#${containerId}-btn-file`);
    const btnCamera = container.querySelector(`#${containerId}-btn-camera`);
    const previewsEl = container.querySelector(`#${containerId}-previews`);
    const loadingEl = container.querySelector(`#${containerId}-loading`);
    const resultEl = container.querySelector(`#${containerId}-result`);

    let selectedFiles = [];

    /** Show selected files in the preview grid */
    function renderPreviews() {
        previewsEl.innerHTML = '';
        selectedFiles.forEach((file, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'vision-preview-item';

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            img.className = 'vision-preview-img';
            img.style.cursor = 'zoom-in';

            let scale = 1;
            img.addEventListener('click', () => {
                scale = scale === 1 ? 2 : 1;
                img.style.transform = `scale(${scale})`;
                img.style.zIndex = scale > 1 ? '10' : '';
                img.style.position = scale > 1 ? 'relative' : '';
            });

            const removeBtn = document.createElement('button');
            removeBtn.className = 'vision-preview-remove';
            removeBtn.textContent = '✕';
            removeBtn.addEventListener('click', () => {
                selectedFiles.splice(idx, 1);
                renderPreviews();
            });

            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            previewsEl.appendChild(wrapper);
        });
    }

    /** Handle files added by any method */
    function addFiles(files) {
        for (const file of files) {
            const validation = validateFile(file);
            if (!validation.valid) {
                alert(validation.error);
                continue;
            }
            selectedFiles.push(file);
        }
        renderPreviews();
    }

    /** Run analysis on all selected files */
    async function runAnalysis() {
        if (selectedFiles.length === 0) {
            alert('অনুগ্রহ করে একটি ছবি নির্বাচন করুন।');
            return;
        }

        loadingEl.style.display = 'flex';
        resultEl.innerHTML = '';

        try {
            const results = [];
            for (const file of selectedFiles) {
                const result = await analyzeImage(file);
                results.push(result);
            }

            resultEl.innerHTML = results
                .map(r => renderResultHTML(r.diagnosis))
                .join('<hr class="vision-result-divider" />');

            if (typeof onAnalysisComplete === 'function') {
                onAnalysisComplete(results);
            }
        } catch (err) {
            resultEl.innerHTML = `<div class="vision-error">ত্রুটি: ${err.message}</div>`;
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    // ── Event bindings ──

    btnFile.addEventListener('click', () => fileInput.click());

    btnCamera.addEventListener('click', () => {
        fileInput.removeAttribute('capture');
        fileInput.setAttribute('capture', 'environment');
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) addFiles(fileInput.files);
        fileInput.value = '';
    });

    // Drag-and-drop
    dropzone.addEventListener('dragover', e => {
        e.preventDefault();
        dropzone.classList.add('vision-dragover');
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('vision-dragover');
    });
    dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('vision-dragover');
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });

    // Paste support
    document.addEventListener('paste', e => {
        const items = e.clipboardData?.items;
        if (!items) return;
        const imageFiles = [];
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) imageFiles.push(file);
            }
        }
        if (imageFiles.length) addFiles(imageFiles);
    });

    // Add analyze button
    const analyzeBtn = document.createElement('button');
    analyzeBtn.type = 'button';
    analyzeBtn.className = 'vision-btn-analyze';
    analyzeBtn.textContent = 'রোগ নির্ণয় করুন';
    analyzeBtn.addEventListener('click', runAnalysis);
    container.appendChild(analyzeBtn);
}

/**
 * Render a single diagnosis result as HTML
 * @param {object} diagnosis - Structured diagnosis from parseResponse
 * @returns {string} HTML string
 */
function renderResultHTML(diagnosis) {
    const severityClass = {
        low: 'severity-low',
        medium: 'severity-medium',
        high: 'severity-high',
        critical: 'severity-critical',
    }[(diagnosis.severity || '').toLowerCase()] || '';

    return `
        <div class="vision-result-card">
            <h3 class="vision-result-title">${diagnosis.diseaseName || 'অজানা রোগ'}</h3>
            <div class="vision-result-meta">
                <span class="vision-confidence">${diagnosis.confidence}% আত্মবিশ্বাস</span>
                <span class="vision-severity ${severityClass}">${diagnosis.severity || '-'}</span>
            </div>
            ${diagnosis.cropDetected ? `<p><strong>ফসল:</strong> ${diagnosis.cropDetected}</p>` : ''}
            ${diagnosis.symptoms ? `<p><strong>লক্ষণ:</strong> ${diagnosis.symptoms}</p>` : ''}
            ${diagnosis.cause ? `<p><strong>কারণ:</strong> ${diagnosis.cause}</p>` : ''}
            ${diagnosis.organicTreatment.length ? `
                <div class="vision-treatment">
                    <h4>জৈব সমাধান</h4>
                    <ul>${diagnosis.organicTreatment.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
            ` : ''}
            ${diagnosis.chemicalTreatment.length ? `
                <div class="vision-treatment">
                    <h4>রাসায়নিক সমাধান</h4>
                    <ul>${diagnosis.chemicalTreatment.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
            ` : ''}
            ${diagnosis.prevention.length ? `
                <div class="vision-prevention">
                    <h4>প্রতিরোধ</h4>
                    <ul>${diagnosis.prevention.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
            ` : ''}
            ${diagnosis.recommendedProducts.length ? `
                <div class="vision-products">
                    <h4>প্রস্তাবিত পণ্য</h4>
                    <ul>${diagnosis.recommendedProducts.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Render history entries into a container
 * @param {string} containerId - ID of the container element
 */
function renderHistory(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const history = getHistory();
    if (history.length === 0) {
        container.innerHTML = '<p class="vision-history-empty">কোনো পূর্ববর্তী রোগ নির্ণয় নেই।</p>';
        return;
    }

    container.innerHTML = history
        .map(entry => {
            const date = new Date(entry.timestamp).toLocaleString('bn-BD');
            return `
                <div class="vision-history-item">
                    <div class="vision-history-header">
                        <span class="vision-history-date">${date}</span>
                        <span class="vision-history-confidence">${entry.confidence}%</span>
                    </div>
                    <p class="vision-history-disease">${entry.diagnosis.diseaseName || 'অজানা'}</p>
                </div>
            `;
        })
        .join('');
}

/* ──────────────────────────────────────────────
   Public API
   ────────────────────────────────────────────── */

export const SFVision = {
    /** Shorthand init that combines container setup + UI creation */
    init(containerId, options = {}) {
        createUploadUI(containerId, options);
        if (options.showHistory) {
            renderHistory(containerId + '-history');
        }
    },

    createUploadUI,

    analyzeImage,

    parseResponse,

    compressImage,

    validateFile,

    getHistory,

    clearHistory,

    /** Re-render the history panel inside a container */
    renderHistory,

    /** Render a diagnosis result object into an HTML string */
    renderResultHTML,
};

export default SFVision;
