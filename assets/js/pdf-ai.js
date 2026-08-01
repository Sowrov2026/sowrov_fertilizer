export const SFPDF = {
    pdfjsLib: null,
    workerSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    pdfJsSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',

    async init() {
        await this.loadPDFJS();
        return this;
    },

    async loadPDFJS() {
        if (window.pdfjsLib) {
            this.pdfjsLib = window.pdfjsLib;
            this.pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc;
            return;
        }
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = this.pdfJsSrc;
            script.onload = () => {
                this.pdfjsLib = window.pdfjsLib;
                this.pdfjsLib.GlobalWorkerOptions.workerSrc = this.workerSrc;
                resolve();
            };
            script.onerror = () => reject(new Error('PDF.js CDN লোড ব্যর্থ হয়েছে'));
            document.head.appendChild(script);
        });
    },

    async extractText(pdfFile) {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        const pageTexts = [];
        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            const pageText = strings.join(' ');
            pageTexts.push({ page: i, text: pageText });
        }
        return pageTexts;
    },

    async getMetadata(pdfFile) {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const metadata = await pdf.getMetadata();
        const info = metadata.info || {};
        return {
            title: info.Title || 'শিরোনাম নেই',
            author: info.Author || 'লেখক নেই',
            subject: info.Subject || 'বিষয় নেই',
            pageCount: pdf.numPages,
            creator: info.Creator || '',
            producer: info.Producer || '',
            creationDate: info.CreationDate || '',
            modDate: info.ModDate || ''
        };
    },

    searchInPDF(pdfText, query) {
        if (!query || query.trim() === '') return [];
        const results = [];
        const lowerQuery = query.toLowerCase();
        const lowerText = pdfText.toLowerCase();
        let startIndex = 0;
        while (startIndex < lowerText.length) {
            const matchIndex = lowerText.indexOf(lowerQuery, startIndex);
            if (matchIndex === -1) break;
            const contextStart = Math.max(0, matchIndex - 50);
            const contextEnd = Math.min(pdfText.length, matchIndex + query.length + 50);
            const contextBefore = pdfText.substring(contextStart, matchIndex);
            const matchedText = pdfText.substring(matchIndex, matchIndex + query.length);
            const contextAfter = pdfText.substring(matchIndex + query.length, contextEnd);
            results.push({
                position: matchIndex,
                match: matchedText,
                context: `${contextBefore}${matchedText}${contextAfter}`,
                before: contextBefore,
                after: contextAfter
            });
            startIndex = matchIndex + query.length;
        }
        return results;
    },

    highlightText(text, query) {
        if (!query || query.trim() === '') return text;
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return text.replace(regex, '<mark style="background:#ffeb3b;padding:2px 4px;border-radius:3px;">$1</mark>');
    },

    extractKeySections(pdfText) {
        const lines = pdfText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const sections = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isHeading =
                (line.endsWith(':') && line.length < 100) ||
                (line === line.toUpperCase() && line.length > 2 && line.length < 100) ||
                (/^[০-৯0-9]+[.)]\s/.test(line)) ||
                (/^(অধ্যায়|বিভাগ|পরিচ্ছেদ|Chapter|Section|Part)\s/i.test(line));
            if (isHeading) {
                const sectionLines = [];
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j];
                    const isNextHeading =
                        (nextLine.endsWith(':') && nextLine.length < 100) ||
                        (nextLine === nextLine.toUpperCase() && nextLine.length > 2 && nextLine.length < 100) ||
                        (/^[০-৯0-9]+[.)]\s/.test(nextLine)) ||
                        (/^(অধ্যায়|বিভাগ|পরিচ্ছেদ|Chapter|Section|Part)\s/i.test(nextLine));
                    if (isNextHeading) break;
                    sectionLines.push(nextLine);
                }
                sections.push({
                    heading: line,
                    content: sectionLines.join(' ')
                });
            }
        }
        if (sections.length === 0 && lines.length > 0) {
            const chunkSize = Math.ceil(lines.length / 5) || 1;
            for (let i = 0; i < lines.length; i += chunkSize) {
                const chunk = lines.slice(i, i + chunkSize);
                sections.push({
                    heading: `বিভাগ ${Math.floor(i / chunkSize) + 1}`,
                    content: chunk.join(' ')
                });
            }
        }
        return sections;
    },

    generateSummary(pdfText) {
        if (!pdfText || pdfText.trim() === '') {
            return { summary: 'কোনো টেক্সট পাওয়া যায়নি।', sections: [] };
        }
        const sections = this.extractKeySections(pdfText);
        const summaryParts = [];
        const maxSections = Math.min(sections.length, 5);
        for (let i = 0; i < maxSections; i++) {
            const section = sections[i];
            const content = section.content;
            const preview = content.substring(0, 500).trim();
            if (preview.length > 0) {
                summaryParts.push({
                    heading: section.heading,
                    summary: preview
                });
            }
        }
        const bulletPoints = summaryParts.map(s => {
            const short = s.summary.length > 150 ? s.summary.substring(0, 150) + '...' : s.summary;
            return `• ${s.heading}: ${short}`;
        });
        const banglaSummary = `মোট ${sections.length}টি বিভাগ পাওয়া গেছে।\n\n` +
            `প্রধান বিষয়গুলো:\n${bulletPoints.join('\n')}\n\n` +
            `নথিটি মূলত ${pdfText.length} অক্ষরের টেক্সট ধারণ করে।`;
        return {
            summary: banglaSummary,
            sections: summaryParts
        };
    },

    createPDFReaderUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`কন্টেইনার পাওয়া যায়নি: ${containerId}`);
            return;
        }
        container.innerHTML = `
            <style>
                .sf-pdf-reader {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 100%;
                    margin: 0 auto;
                }
                .sf-pdf-upload-zone {
                    border: 3px dashed #4CAF50;
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: #f8fff8;
                    margin-bottom: 20px;
                }
                .sf-pdf-upload-zone:hover {
                    border-color: #388E3C;
                    background: #e8f5e9;
                }
                .sf-pdf-upload-zone.dragover {
                    border-color: #2E7D32;
                    background: #c8e6c9;
                    transform: scale(1.02);
                }
                .sf-pdf-upload-icon {
                    font-size: 48px;
                    margin-bottom: 10px;
                }
                .sf-pdf-upload-text {
                    font-size: 16px;
                    color: #333;
                    margin-bottom: 5px;
                }
                .sf-pdf-upload-hint {
                    font-size: 13px;
                    color: #777;
                }
                .sf-pdf-input {
                    display: none;
                }
                .sf-pdf-search-bar {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .sf-pdf-search-input {
                    flex: 1;
                    min-width: 200px;
                    padding: 12px 16px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 15px;
                    transition: border-color 0.3s;
                }
                .sf-pdf-search-input:focus {
                    outline: none;
                    border-color: #4CAF50;
                }
                .sf-pdf-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 15px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                }
                .sf-pdf-btn-primary {
                    background: #4CAF50;
                    color: white;
                }
                .sf-pdf-btn-primary:hover {
                    background: #388E3C;
                }
                .sf-pdf-btn-secondary {
                    background: #607D8B;
                    color: white;
                }
                .sf-pdf-btn-secondary:hover {
                    background: #455A64;
                }
                .sf-pdf-btn-danger {
                    background: #f44336;
                    color: white;
                }
                .sf-pdf-btn-danger:hover {
                    background: #d32f2f;
                }
                .sf-pdf-info {
                    display: none;
                    background: #e3f2fd;
                    border-radius: 10px;
                    padding: 16px 20px;
                    margin-bottom: 20px;
                    border-left: 5px solid #2196F3;
                }
                .sf-pdf-info-title {
                    font-weight: 700;
                    font-size: 16px;
                    color: #1565C0;
                    margin-bottom: 8px;
                }
                .sf-pdf-info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 8px;
                }
                .sf-pdf-info-item {
                    font-size: 13px;
                    color: #333;
                }
                .sf-pdf-info-item span {
                    font-weight: 600;
                    color: #1976D2;
                }
                .sf-pdf-results {
                    display: none;
                    background: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 20px;
                    max-height: 500px;
                    overflow-y: auto;
                }
                .sf-pdf-result-item {
                    padding: 12px 16px;
                    border-bottom: 1px solid #eee;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #333;
                }
                .sf-pdf-result-item:last-child {
                    border-bottom: none;
                }
                .sf-pdf-result-count {
                    font-size: 13px;
                    color: #777;
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #eee;
                }
                .sf-pdf-summary {
                    display: none;
                    background: #fffde7;
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 20px;
                    border-left: 5px solid #FFC107;
                    white-space: pre-wrap;
                    line-height: 1.8;
                    font-size: 14px;
                    color: #333;
                }
                .sf-pdf-summary-title {
                    font-weight: 700;
                    font-size: 17px;
                    color: #F57F17;
                    margin-bottom: 12px;
                }
                .sf-pdf-status {
                    text-align: center;
                    padding: 12px;
                    font-size: 14px;
                    color: #666;
                    display: none;
                }
                .sf-pdf-status.loading {
                    display: block;
                    color: #FF9800;
                }
                .sf-pdf-status.success {
                    display: block;
                    color: #4CAF50;
                }
                .sf-pdf-status.error {
                    display: block;
                    color: #f44336;
                }
                .sf-pdf-extracted-text {
                    display: none;
                    background: #f5f5f5;
                    border-radius: 10px;
                    padding: 20px;
                    margin-bottom: 20px;
                    max-height: 400px;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 13px;
                    line-height: 1.7;
                    white-space: pre-wrap;
                    color: #333;
                    border: 1px solid #e0e0e0;
                }
                .sf-pdf-extracted-title {
                    font-weight: 700;
                    font-size: 15px;
                    color: #555;
                    margin-bottom: 10px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
            </style>

            <div class="sf-pdf-reader">
                <div class="sf-pdf-upload-zone" id="sfPdfUploadZone">
                    <div class="sf-pdf-upload-icon">📄</div>
                    <div class="sf-pdf-upload-text">PDF ফাইল আপলোড করুন</div>
                    <div class="sf-pdf-upload-hint">ড্র্যাগ এন্ড ড্রপ করুন অথবা ক্লিক করে ফাইল নির্বাচন করুন (সর্বোচ্চ 20MB)</div>
                    <input type="file" class="sf-pdf-input" id="sfPdfFileInput" accept=".pdf,application/pdf">
                </div>

                <div class="sf-pdf-status" id="sfPdfStatus"></div>

                <div class="sf-pdf-info" id="sfPdfInfo">
                    <div class="sf-pdf-info-title">📋 ডকুমেন্ট তথ্য</div>
                    <div class="sf-pdf-info-grid" id="sfPdfInfoGrid"></div>
                </div>

                <div class="sf-pdf-search-bar" id="sfPdfSearchBar" style="display:none;">
                    <input type="text" class="sf-pdf-search-input" id="sfPdfSearchInput" placeholder="PDF এ খুঁজুন...">
                    <button class="sf-pdf-btn sf-pdf-btn-primary" id="sfPdfSearchBtn">🔍 খুঁজুন</button>
                    <button class="sf-pdf-btn sf-pdf-btn-secondary" id="sfPdfSummaryBtn">📝 সারসংক্ষেপ</button>
                    <button class="sf-pdf-btn sf-pdf-btn-secondary" id="sfPdfExtractBtn">📄 টেক্সট দেখুন</button>
                    <button class="sf-pdf-btn sf-pdf-danger" id="sfPdfClearBtn">🗑️ মুছুন</button>
                </div>

                <div class="sf-pdf-results" id="sfPdfResults"></div>
                <div class="sf-pdf-summary" id="sfPdfSummary"></div>
                <div class="sf-pdf-extracted-text" id="sfPdfExtractedText"></div>
            </div>
        `;

        const uploadZone = document.getElementById('sfPdfUploadZone');
        const fileInput = document.getElementById('sfPdfFileInput');
        const statusEl = document.getElementById('sfPdfStatus');
        const infoEl = document.getElementById('sfPdfInfo');
        const infoGrid = document.getElementById('sfPdfInfoGrid');
        const searchBar = document.getElementById('sfPdfSearchBar');
        const searchInput = document.getElementById('sfPdfSearchInput');
        const searchBtn = document.getElementById('sfPdfSearchBtn');
        const summaryBtn = document.getElementById('sfPdfSummaryBtn');
        const extractBtn = document.getElementById('sfPdfExtractBtn');
        const clearBtn = document.getElementById('sfPdfClearBtn');
        const resultsEl = document.getElementById('sfPdfResults');
        const summaryEl = document.getElementById('sfPdfSummary');
        const extractedEl = document.getElementById('sfPdfExtractedText');

        let currentPDFText = '';
        let currentPDFFile = null;

        const setStatus = (msg, type) => {
            statusEl.textContent = msg;
            statusEl.className = `sf-pdf-status ${type}`;
        };

        const validateFile = (file) => {
            if (!file) return { valid: false, error: 'কোনো ফাইল নির্বাচন করা হয়নি।' };
            if (file.type !== 'application/pdf') {
                return { valid: false, error: 'শুধুমাত্র PDF ফাইল গ্রহণযোগ্য।' };
            }
            const maxSize = 20 * 1024 * 1024;
            if (file.size > maxSize) {
                return { valid: false, error: 'ফাইলের আকার 20MB এর বেশি। অনুগ্রহ করে ছোট ফাইল ব্যবহার করুন।' };
            }
            return { valid: true };
        };

        const displayMetadata = (metadata) => {
            infoGrid.innerHTML = `
                <div class="sf-pdf-info-item"><span>শিরোনাম:</span> ${metadata.title}</div>
                <div class="sf-pdf-info-item"><span>লেখক:</span> ${metadata.author}</div>
                <div class="sf-pdf-info-item"><span>বিষয়:</span> ${metadata.subject}</div>
                <div class="sf-pdf-info-item"><span>মোট পৃষ্ঠা:</span> ${metadata.pageCount}</div>
                <div class="sf-pdf-info-item"><span>তৈরিকারক:</span> ${metadata.creator || 'N/A'}</div>
                <div class="sf-pdf-info-item"><span>প্রডিউসার:</span> ${metadata.producer || 'N/A'}</div>
            `;
            infoEl.style.display = 'block';
        };

        const processFile = async (file) => {
            const validation = validateFile(file);
            if (!validation.valid) {
                setStatus(validation.error, 'error');
                return;
            }
            currentPDFFile = file;
            setStatus('⏳ PDF প্রক্রিয়াকরণ হচ্ছে...', 'loading');
            infoEl.style.display = 'none';
            resultsEl.style.display = 'none';
            summaryEl.style.display = 'none';
            extractedEl.style.display = 'none';
            try {
                const pageTexts = await this.extractText(file);
                currentPDFText = pageTexts.map(p => `[পৃষ্ঠা ${p.page}]\n${p.text}`).join('\n\n');
                const metadata = await this.getMetadata(file);
                displayMetadata(metadata);
                searchBar.style.display = 'flex';
                setStatus('✅ PDF সফলভাবে লোড হয়েছে!', 'success');
            } catch (err) {
                console.error(err);
                setStatus('❌ PDF প্রক্রিয়াকরণে সমস্যা হয়েছে। অনুগ্রহ করে ফাইলটি পরীক্ষা করুন।', 'error');
            }
        };

        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) processFile(files[0]);
        });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) processFile(e.target.files[0]);
        });

        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (!query) {
                resultsEl.style.display = 'none';
                return;
            }
            if (!currentPDFText) {
                setStatus('⚠️ প্রথমে PDF আপলোড করুন।', 'error');
                return;
            }
            const matches = this.searchInPDF(currentPDFText, query);
            if (matches.length === 0) {
                resultsEl.innerHTML = `<div class="sf-pdf-result-count">কোনো ফলাফল পাওয়া যায়নি।</div>`;
            } else {
                const highlighted = matches.map((m, i) => {
                    const displayContext = this.highlightText(m.context, query);
                    return `<div class="sf-pdf-result-item"><strong>${i + 1}.</strong> ${displayContext}</div>`;
                }).join('');
                resultsEl.innerHTML = `<div class="sf-pdf-result-count">মোট ${matches.length}টি ফলাফল পাওয়া গেছে:</div>${highlighted}`;
            }
            resultsEl.style.display = 'block';
            summaryEl.style.display = 'none';
            extractedEl.style.display = 'none';
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchBtn.click();
        });

        summaryBtn.addEventListener('click', () => {
            if (!currentPDFText) {
                setStatus('⚠️ প্রথমে PDF আপলোড করুন।', 'error');
                return;
            }
            const result = this.generateSummary(currentPDFText);
            summaryEl.innerHTML = `<div class="sf-pdf-summary-title">📝 সারসংক্ষেপ</div>${result.summary}`;
            summaryEl.style.display = 'block';
            resultsEl.style.display = 'none';
            extractedEl.style.display = 'none';
        });

        extractBtn.addEventListener('click', () => {
            if (!currentPDFText) {
                setStatus('⚠️ প্রথমে PDF আপলোড করুন।', 'error');
                return;
            }
            extractedEl.innerHTML = `<div class="sf-pdf-extracted-title">📄 নিষ্কাশিত টেক্সট</div>${currentPDFText}`;
            extractedEl.style.display = 'block';
            resultsEl.style.display = 'none';
            summaryEl.style.display = 'none';
        });

        clearBtn.addEventListener('click', () => {
            currentPDFText = '';
            currentPDFFile = null;
            fileInput.value = '';
            infoEl.style.display = 'none';
            searchBar.style.display = 'none';
            resultsEl.style.display = 'none';
            summaryEl.style.display = 'none';
            extractedEl.style.display = 'none';
            searchInput.value = '';
            setStatus('', '');
            statusEl.className = 'sf-pdf-status';
        });
    },

    async processPDF(file) {
        const validation = this.validateFile ? this.validateFile(file) : { valid: true };
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        const pageTexts = await this.extractText(file);
        const fullText = pageTexts.map(p => `[পৃষ্ঠা ${p.page}]\n${p.text}`).join('\n\n');
        const metadata = await this.getMetadata(file);
        const summary = this.generateSummary(fullText);
        const sections = this.extractKeySections(fullText);
        return {
            text: fullText,
            pageTexts: pageTexts,
            metadata: metadata,
            summary: summary,
            sections: sections,
            charCount: fullText.length,
            wordCount: fullText.split(/\s+/).length
        };
    },

    async getPageCount(pdfFile) {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        return pdf.numPages;
    }
};
