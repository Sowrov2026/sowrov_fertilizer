/**
 * SF AI V17 — Export Module
 * Export chat, reports, products in multiple formats
 * ES module for Sowrov Fertilizer
 */

const CROP_REPORTS = {
    'ধান': {
        name: 'ধান',
        season: 'খরিফ',
        duration: '120-150 দিন',
        soil: 'পলি মাটি, কালো মাটি',
        ph: '5.5 - 7.0',
        fertilizer: 'ইউরিয়া 60-80 kg/হেক্টর, DAP 30-40 kg/হেক্টর, MOP 20-30 kg/হেক্টর',
        irrigation: 'রোপণের পর থেকে পর্যায়ক্রমে সেচ',
        harvest: 'ফসল পাকলে তোলা',
        yield: '3-5 টন/হেক্টর',
        tips: [
            'বীজ শোষণ 2-3 দিন আগে করুন',
            'রোপণের সময় পানির গভীরতা 2-3 সেমি রাখুন',
            'ইউরিয়া ৩ ভাগে ভাগ করে দিন',
            'নাইট্রজেন অভাব হলে পাতায় ছিটিয়ে দিন',
        ],
    },
    'গম': {
        name: 'গম',
        season: 'রবি',
        duration: '120-150 দিন',
        soil: 'দোআঁশ মাটি, পলি মাটি',
        ph: '6.0 - 7.5',
        fertilizer: 'ইউরিয়া 100-120 kg/হেক্টর, DAP 60-80 kg/হেক্টর',
        irrigation: '3-4টি সেচ পর্যাপ্ত',
        harvest: 'শস্যদানা শুকিয়ে গেলে তোলা',
        yield: '3-4 টন/হেক্টর',
        tips: [
            'বীজ হার: 100-125 kg/হেক্টর',
            'সার প্রয়োগ রোপণ ও শাখা বিভাজনের সময়',
            'পানি জমে থাকতে দিবেন না',
            'তৃণশ্ম নিয়ন্ত্রণ সময়মতো করুন',
        ],
    },
    'পাট': {
        name: 'পাট',
        season: 'খরিফ/রবি',
        duration: '120-180 দিন',
        soil: 'পলি মাটি, জলাভূমি',
        ph: '6.0 - 7.5',
        fertilizer: 'ইউরিয়া 150-200 kg/হেক্টর, DAP 80-100 kg/হেক্টর',
        irrigation: 'প্রচুর পানি প্রয়োজন',
        harvest: 'তন্তু গুণগত মান নির্ভর করে',
        yield: '2-3 টন/হেক্টর',
        tips: [
            'পানির গভীরতা 5-10 সেমি রাখুন',
            'অংকুরোদ্গমের পর সার দিন',
            'পোকা নিয়ন্ত্রণে সতর্ক থাকুন',
        ],
    },
    'ভুট্টা': {
        name: 'ভুট্টা',
        season: 'খরিফ/রবি',
        duration: '90-120 দিন',
        soil: 'সকল ধরনের মাটি',
        ph: '5.5 - 7.5',
        fertilizer: 'ইউরিয়া 150-200 kg/হেক্টর, DAP 60-80 kg/হেক্টর',
        irrigation: 'মাঝারি সেচ প্রয়োজন',
        harvest: 'দানা শুকিয়ে গেলে তোলা',
        yield: '8-12 টন/হেক্টর',
        tips: [
            'বীজ হার: 20-25 kg/হেক্টর',
            'দূরত্ব: 60x20 সেমি',
            'প্রথম সার রোপণের ২০ দিন পর',
            'ভেজা মাটিতে সার দিন',
        ],
    },
    'আলু': {
        name: 'আলু',
        season: 'রবি',
        duration: '80-120 দিন',
        soil: 'বালু মাটি, দোআঁশ মাটি',
        ph: '5.0 - 6.5',
        fertilizer: 'ইউরিয়া 150-200 kg/হেক্টর, DAP 100-150 kg/হেক্টর',
        irrigation: 'পর্যায়ক্রমে সেচ',
        harvest: 'পাতা হলুদ হলে তোলা',
        yield: '15-25 টন/হেক্টর',
        tips: [
            'বীজ 50-80 গ্রাম করে কাটুন',
            'মাটি ওঠানো ও গোড়া মাটি দিন',
            'আগাছা নিয়ন্ত্রণ সময়মতো করুন',
            'দীর্ঘদিন মাটিতে রাখবেন না',
        ],
    },
    'মরিচ': {
        name: 'মরিচ',
        season: 'খরিফ/রবি',
        duration: '90-120 দিন',
        soil: 'দোআঁশ মাটি, পলি মাটি',
        ph: '6.0 - 7.0',
        fertilizer: 'ইউরিয়া 80-100 kg/হেক্টর, DAP 60-80 kg/হেক্টর',
        irrigation: 'মাঝারি সেচ',
        harvest: 'লাল হলে তোলা',
        yield: '8-12 টন/হেক্টর',
        tips: [
            'রোপণের ৩০ দিন পর প্রথম সার',
            'পোকা নিয়ন্ত্রণে সতর্ক থাকুন',
            'বেশি গরমে ছায়া দিন',
        ],
    },
};

const EXPORT_FORMATS = {
    text: 'প্লেইন টেক্সট',
    json: 'JSON',
    csv: 'CSV',
    pdf: 'PDF',
};

function getChatHistory() {
    try {
        const keys = ['sf_chat_history', 'sf_ai_v17_chat', 'sf_ai_v17_context'];
        for (const key of keys) {
            const val = localStorage.getItem(key);
            if (val) {
                const data = JSON.parse(val);
                if (Array.isArray(data) && data.length > 0) return data;
                if (data.messages && Array.isArray(data.messages)) return data.messages;
                if (data.conversations && Array.isArray(data.conversations)) {
                    return data.conversations;
                }
            }
        }
    } catch {}
    return [];
}

function getProfileData() {
    try {
        const keys = ['sf_ai_memory', 'sf_ai_v17_memory'];
        for (const key of keys) {
            const val = localStorage.getItem(key);
            if (val) {
                const data = JSON.parse(val);
                if (data && data.profile) return data.profile;
                return data;
            }
        }
    } catch {}
    return {};
}

function getProductList() {
    try {
        const val = localStorage.getItem('sf_products');
        if (val) return JSON.parse(val);
        const val2 = localStorage.getItem('sf_product_list');
        if (val2) return JSON.parse(val2);
    } catch {}
    return [];
}

function formatCurrency(amount) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '৳০';
    return '৳' + num.toLocaleString('bn-BD');
}

function escapeCSV(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const SFExport = {
    init() {
        return this;
    },

    exportChatAsPDF() {
        const messages = getChatHistory();
        if (messages.length === 0) {
            alert('কোনো চ্যাট হিস্ট্রি পাওয়া যায়নি');
            return;
        }

        const profile = getProfileData();
        const userName = profile.name || 'ব্যবহারকারী';

        let html = `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>SF AI চ্যাট হিস্ট্রি - ${userName}</title>
    <style>
        body { font-family: 'Hind Siliguri', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }
        h1 { text-align: center; color: #2d7a2d; border-bottom: 2px solid #2d7a2d; padding-bottom: 10px; }
        .meta { text-align: center; color: #666; margin-bottom: 24px; font-size: 0.9em; }
        .message { margin-bottom: 16px; padding: 12px; border-radius: 8px; }
        .user { background: #e8f5e9; border-left: 4px solid #2d7a2d; }
        .ai { background: #f5f5f5; border-left: 4px solid #666; }
        .role { font-weight: bold; color: #2d7a2d; margin-bottom: 4px; }
        .ai .role { color: #666; }
        .content { line-height: 1.6; }
        .time { font-size: 0.8em; color: #999; margin-top: 4px; }
        @media print {
            body { padding: 0; }
            .message { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <h1>SF AI চ্যাট হিস্ট্রি</h1>
    <div class="meta">ব্যবহারকারী: ${userName} | মোট বার্তা: ${messages.length} | তৈরি: ${new Date().toLocaleDateString('bn-BD')}</div>
`;

        messages.forEach((msg, i) => {
            const role = msg.role === 'user' ? 'ব্যবহারকারী' : 'SF AI';
            const roleClass = msg.role === 'user' ? 'user' : 'ai';
            const content = msg.content || msg.text || msg.message || '';
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString('bn-BD') : '';

            html += `
    <div class="message ${roleClass}">
        <div class="role">${role}</div>
        <div class="content">${content.replace(/\n/g, '<br>')}</div>
        ${time ? `<div class="time">${time}</div>` : ''}
    </div>`;
        });

        html += `
</body>
</html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
            }, 500);
        } else {
            downloadFile(html, 'sf_chat_history.html', 'text/html;charset=utf-8');
        }
    },

    exportChatAsText() {
        const messages = getChatHistory();
        if (messages.length === 0) {
            alert('কোনো চ্যাট হিস্ট্রি পাওয়া যায়নি');
            return;
        }

        const profile = getProfileData();
        let text = '═══════════════════════════════════════\n';
        text += '          SF AI চ্যাট হিস্ট্রি\n';
        text += '═══════════════════════════════════════\n';
        text += `ব্যবহারকারী: ${profile.name || 'অজ্ঞাত'}\n`;
        text += `তৈরি: ${new Date().toLocaleString('bn-BD')}\n`;
        text += `মোট বার্তা: ${messages.length}\n`;
        text += '═══════════════════════════════════════\n\n';

        messages.forEach((msg, i) => {
            const role = msg.role === 'user' ? 'ব্যবহারকারী' : 'SF AI';
            const content = msg.content || msg.text || msg.message || '';
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString('bn-BD') : '';

            text += `[${role}]${time ? ' (' + time + ')' : ''}\n`;
            text += content + '\n';
            text += '─────────────────────────────────────\n\n';
        });

        downloadFile(text, 'sf_chat_history.txt', 'text/plain;charset=utf-8');
    },

    exportChatAsJSON() {
        const messages = getChatHistory();
        if (messages.length === 0) {
            alert('কোনো চ্যাট হিস্ট্রি পাওয়া যায়নি');
            return;
        }

        const exportData = {
            exportDate: new Date().toISOString(),
            appVersion: 'SF AI V17',
            profile: getProfileData(),
            messages: messages,
            totalMessages: messages.length,
        };

        const json = JSON.stringify(exportData, null, 2);
        downloadFile(json, 'sf_chat_history.json', 'application/json');
    },

    exportCropReport(cropName) {
        const crop = CROP_REPORTS[cropName];
        if (!crop) {
            const available = Object.keys(CROP_REPORTS).join(', ');
            alert(`"${cropName}" এর রিপোর্ট পাওয়া যায়নি।\nউপলব্ধ ফসল: ${available}`);
            return;
        }

        const report = `
═══════════════════════════════════════
      ফসল রিপোর্ট: ${crop.name}
═══════════════════════════════════════

মৌসুম: ${crop.season}
সময়কাল: ${crop.duration}
মাটির ধরন: ${crop.soil}
pH পরিসীমা: ${crop.ph}

সার প্রয়োগ:
${crop.fertilizer}

সেচ:
${crop.irrigation}

ফসল তোলা:
${crop.harvest}

আনুমানিক উৎপাদন:
${crop.yield}

টিপস:
${crop.tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}

═══════════════════════════════════════
তৈরি: ${new Date().toLocaleString('bn-BD')}
SF AI V17 — সোভর্ভ সার
═══════════════════════════════════════
`.trim();

        downloadFile(report, `sf_crop_report_${crop.name}.txt`, 'text/plain;charset=utf-8');
    },

    exportCalculationReport(calc) {
        if (!calc) {
            alert('কোনো ক্যালকুলেশন ডেটা পাওয়া যায়নি');
            return;
        }

        let report = `
═══════════════════════════════════════
      কৃষি ক্যালকুলেশন রিপোর্ট
═══════════════════════════════════════

`;
        if (calc.type) report += `ধরন: ${calc.type}\n`;
        if (calc.crop) report += `ফসল: ${calc.crop}\n`;
        if (calc.area) report += `এলাকা: ${calc.area}\n`;

        report += '\nবিস্তারিত:\n';
        report += '─────────────────────────────────────\n';

        if (calc.items && Array.isArray(calc.items)) {
            calc.items.forEach(item => {
                report += `• ${item.name || item.label}: ${item.value || item.amount || ''}\n`;
            });
        } else if (calc.results) {
            for (const [key, value] of Object.entries(calc.results)) {
                report += `• ${key}: ${value}\n`;
            }
        } else {
            for (const [key, value] of Object.entries(calc)) {
                if (key !== 'type' && key !== 'crop' && key !== 'area') {
                    report += `• ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
                }
            }
        }

        if (calc.totalCost) {
            report += `\nমোট খরচ: ${formatCurrency(calc.totalCost)}\n`;
        }
        if (calc.expectedYield) {
            report += `প্রত্যাশিত উৎপাদন: ${calc.expectedYield}\n`;
        }

        report += `
═══════════════════════════════════════
তৈরি: ${new Date().toLocaleString('bn-BD')}
SF AI V17 — সোভর্ভ সার
═══════════════════════════════════════
`;

        downloadFile(report, 'sf_calculation_report.txt', 'text/plain;charset=utf-8');
    },

    exportProductList() {
        const products = getProductList();
        if (products.length === 0) {
            alert('কোনো পণ্য তথ্য পাওয়া যায়নি');
            return;
        }

        let text = `
═══════════════════════════════════════
      সোভর্ভ সার — পণ্য তালিকা
═══════════════════════════════════════

মোট পণ্য: ${products.length}
তৈরি: ${new Date().toLocaleString('bn-BD')}

`;
        products.forEach((p, i) => {
            text += `${i + 1}. ${p.name || 'নামহীন'}\n`;
            if (p.category) text += `   ধরন: ${p.category}\n`;
            if (p.price) text += `   মূল্য: ${formatCurrency(p.price)}\n`;
            if (p.stock !== undefined) text += `   স্টক: ${p.stock}\n`;
            if (p.description) text += `   বিবরণ: ${p.description}\n`;
            text += '─────────────────────────────────────\n\n';
        });

        downloadFile(text, 'sf_product_list.txt', 'text/plain;charset=utf-8');
    },

    exportData(format, data) {
        if (!data) {
            alert('কোনো ডেটা পাওয়া যায়নি');
            return;
        }

        switch (format) {
            case 'json':
                const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
                downloadFile(jsonData, 'sf_export.json', 'application/json');
                break;

            case 'csv':
                let csv = '';
                if (Array.isArray(data) && data.length > 0) {
                    const headers = Object.keys(data[0]);
                    csv += headers.map(escapeCSV).join(',') + '\n';
                    data.forEach(row => {
                        csv += headers.map(h => escapeCSV(row[h])).join(',') + '\n';
                    });
                } else if (typeof data === 'object') {
                    csv = 'মান,কী\n';
                    for (const [key, val] of Object.entries(data)) {
                        csv += `${escapeCSV(typeof val === 'object' ? JSON.stringify(val) : val)},${escapeCSV(key)}\n`;
                    }
                }
                downloadFile(csv, 'sf_export.csv', 'text/csv;charset=utf-8');
                break;

            case 'text':
            default:
                const textContent = typeof data === 'string'
                    ? data
                    : JSON.stringify(data, null, 2);
                downloadFile(textContent, 'sf_export.txt', 'text/plain;charset=utf-8');
                break;
        }
    },

    createExportPanel(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const crops = Object.keys(CROP_REPORTS);
        const formats = Object.entries(EXPORT_FORMATS);

        container.innerHTML = `
            <style>
                .sf-export-panel {
                    font-family: 'Hind Siliguri', 'Kalpurush', sans-serif;
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 24px;
                    background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
                    border-radius: 16px;
                    border: 2px solid #1a56db;
                }
                .sf-export-title {
                    text-align: center;
                    font-size: 1.5em;
                    color: #1a3a8a;
                    margin-bottom: 24px;
                    font-weight: bold;
                }
                .sf-export-section {
                    margin-bottom: 24px;
                }
                .sf-export-section h3 {
                    color: #1a3a8a;
                    margin: 0 0 12px 0;
                    font-size: 1.1em;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 8px;
                }
                .sf-export-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                .sf-export-btn {
                    padding: 14px;
                    border: none;
                    border-radius: 10px;
                    font-size: 1em;
                    font-weight: bold;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .sf-export-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                .sf-export-btn-pdf { background: #dc3545; color: #fff; }
                .sf-export-btn-pdf:hover { background: #c82333; }
                .sf-export-btn-text { background: #28a745; color: #fff; }
                .sf-export-btn-text:hover { background: #218838; }
                .sf-export-btn-json { background: #ffc107; color: #333; }
                .sf-export-btn-json:hover { background: #e0a800; }
                .sf-export-btn-csv { background: #17a2b8; color: #fff; }
                .sf-export-btn-csv:hover { background: #138496; }
                .sf-export-btn-secondary { background: #fff; color: #1a3a8a; border: 2px solid #1a3a8a; }
                .sf-export-btn-secondary:hover { background: #e8f0fe; }
                .sf-export-btn-wide { grid-column: 1 / -1; }
                .sf-export-select {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #aaa;
                    border-radius: 8px;
                    font-size: 1em;
                    font-family: inherit;
                    margin-bottom: 12px;
                    background: #fff;
                }
                .sf-export-select:focus { border-color: #1a56db; outline: none; }
                .sf-export-custom {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }
                .sf-export-custom select {
                    flex: 1;
                    padding: 10px;
                    border: 2px solid #aaa;
                    border-radius: 8px;
                    font-family: inherit;
                    font-size: 0.95em;
                }
                .sf-export-custom button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    background: #1a56db;
                    color: #fff;
                    font-weight: bold;
                    font-family: inherit;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .sf-export-custom button:hover { background: #1444b0; }
                .sf-export-toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    padding: 14px 24px;
                    border-radius: 10px;
                    color: #fff;
                    font-weight: bold;
                    font-family: inherit;
                    z-index: 10000;
                    animation: sfExportToastIn 0.3s ease;
                }
                .sf-export-toast.success { background: #28a745; }
                .sf-export-toast.error { background: #dc3545; }
                @keyframes sfExportToastIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>

            <div class="sf-export-panel">
                <div class="sf-export-title">এক্সপোর্ট সেন্টার</div>

                <div class="sf-export-section">
                    <h3>চ্যাট হিস্ট্রি এক্সপোর্ট</h3>
                    <div class="sf-export-grid">
                        <button class="sf-export-btn sf-export-btn-pdf" id="sf-export-chat-pdf">
                            PDF হিসেবে ডাউনলোড
                        </button>
                        <button class="sf-export-btn sf-export-btn-text" id="sf-export-chat-text">
                            টেক্সট হিসেবে ডাউনলোড
                        </button>
                        <button class="sf-export-btn sf-export-btn-json sf-export-btn-wide" id="sf-export-chat-json">
                            JSON হিসেবে ডাউনলোড
                        </button>
                    </div>
                </div>

                <div class="sf-export-section">
                    <h3>ফসল রিপোর্ট</h3>
                    <select class="sf-export-select" id="sf-export-crop-select">
                        <option value="">ফসল নির্বাচন করুন</option>
                        ${crops.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <div class="sf-export-grid">
                        <button class="sf-export-btn sf-export-btn-text sf-export-btn-wide" id="sf-export-crop-report">
                            ফসল রিপোর্ট ডাউনলোড
                        </button>
                    </div>
                </div>

                <div class="sf-export-section">
                    <h3>ক্যালকুলেশন ও পণ্য</h3>
                    <div class="sf-export-grid">
                        <button class="sf-export-btn sf-export-btn-secondary" id="sf-export-calc">
                            ক্যালকুলেশন রিপোর্ট
                        </button>
                        <button class="sf-export-btn sf-export-btn-secondary" id="sf-export-products">
                            পণ্য তালিকা
                        </button>
                    </div>
                </div>

                <div class="sf-export-section">
                    <h3>কাস্টম এক্সপোর্ট</h3>
                    <div class="sf-export-custom">
                        <select id="sf-export-custom-format">
                            ${formats.map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
                        </select>
                        <select id="sf-export-custom-source">
                            <option value="memory">ব্যবহারকারী মেমরি</option>
                            <option value="analytics">বিশ্লেষণ</option>
                            <option value="reminders">রিমাইন্ডার</option>
                            <option value="all">সমস্ত ডেটা</option>
                        </select>
                        <button id="sf-export-custom-btn">এক্সপোর্ট</button>
                    </div>
                </div>
            </div>
        `;

        const self = this;

        function showToast(message, type) {
            const existing = document.querySelector('.sf-export-toast');
            if (existing) existing.remove();
            const toast = document.createElement('div');
            toast.className = `sf-export-toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        document.getElementById('sf-export-chat-pdf').addEventListener('click', function () {
            self.exportChatAsPDF();
            showToast('PDF তৈরি হচ্ছে...', 'success');
        });

        document.getElementById('sf-export-chat-text').addEventListener('click', function () {
            self.exportChatAsText();
            showToast('টেক্সট ফাইল ডাউনলোড হচ্ছে!', 'success');
        });

        document.getElementById('sf-export-chat-json').addEventListener('click', function () {
            self.exportChatAsJSON();
            showToast('JSON ফাইল ডাউনলোড হচ্ছে!', 'success');
        });

        document.getElementById('sf-export-crop-report').addEventListener('click', function () {
            const crop = document.getElementById('sf-export-crop-select').value;
            if (!crop) {
                alert('অনুগ্রহ করে একটি ফসল নির্বাচন করুন');
                return;
            }
            self.exportCropReport(crop);
            showToast(`${crop} রিপোর্ট ডাউনলোড হচ্ছে!`, 'success');
        });

        document.getElementById('sf-export-calc').addEventListener('click', function () {
            let calcData = null;
            try {
                const raw = localStorage.getItem('sf_calculations');
                if (raw) calcData = JSON.parse(raw);
            } catch {}
            if (!calcData) {
                alert('কোনো ক্যালকুলেশন ডেটা পাওয়া যায়নি। প্রথমে ক্যালকুলেটর ব্যবহার করুন।');
                return;
            }
            self.exportCalculationReport(calcData);
            showToast('ক্যালকুলেশন রিপোর্ট ডাউনলোড হচ্ছে!', 'success');
        });

        document.getElementById('sf-export-products').addEventListener('click', function () {
            self.exportProductList();
            showToast('পণ্য তালিকা ডাউনলোড হচ্ছে!', 'success');
        });

        document.getElementById('sf-export-custom-btn').addEventListener('click', function () {
            const format = document.getElementById('sf-export-custom-format').value;
            const source = document.getElementById('sf-export-custom-source').value;
            let data = null;

            try {
                switch (source) {
                    case 'memory':
                        data = JSON.parse(localStorage.getItem('sf_ai_memory') || '{}');
                        break;
                    case 'analytics':
                        data = JSON.parse(localStorage.getItem('sf_ai_analytics') || '[]');
                        break;
                    case 'reminders':
                        data = JSON.parse(localStorage.getItem('sf_reminders') || '[]');
                        break;
                    case 'all':
                        data = {};
                        const keys = [
                            'sf_ai_memory', 'sf_reminders', 'sf_ai_analytics',
                            'sf_chat_history', 'sf_calculations',
                        ];
                        keys.forEach(k => {
                            const val = localStorage.getItem(k);
                            if (val) {
                                try { data[k] = JSON.parse(val); }
                                catch { data[k] = val; }
                            }
                        });
                        break;
                }
            } catch (e) {
                alert('ডেটা পড়তে সমস্যা: ' + e.message);
                return;
            }

            if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
                alert('নির্বাচিত উৎসে কোনো ডেটা পাওয়া যায়নি');
                return;
            }

            self.exportData(format, data);
            showToast('এক্সপোর্ট সম্পন্ন!', 'success');
        });

        return {
            destroy() { container.innerHTML = ''; },
        };
    },

    downloadFile(content, filename, mimeType) {
        downloadFile(content, filename, mimeType);
    },

    generateReport(type) {
        switch (type) {
            case 'profile': {
                const profile = getProfileData();
                let report = `
═══════════════════════════════════════
      ব্যবহারকারী প্রোফাইল রিপোর্ট
═══════════════════════════════════════

নাম: ${profile.name || 'অজ্ঞাত'}
জেলা: ${profile.district || 'অজ্ঞাত'}
উপজেলা: ${profile.upazila || 'অজ্ঞাত'}
গ্রাম: ${profile.village || 'অজ্ঞাত'}
জমির পরিমাণ: ${profile.farmSize || 'অজ্ঞাত'} ${profile.farmSizeUnit || 'বিঘা'}
মাটির ধরন: ${profile.landType || 'অজ্ঞাত'}

═══════════════════════════════════════
তৈরি: ${new Date().toLocaleString('bn-BD')}
═══════════════════════════════════════
`;
                return report.trim();
            }

            case 'summary': {
                let summary = `
═══════════════════════════════════════
      সারসংক্ষেপ রিপোর্ট
═══════════════════════════════════════

`;
                const profile = getProfileData();
                if (profile.name) summary += `ব্যবহারকারী: ${profile.name}\n`;
                if (profile.district) summary += `অবস্থান: ${profile.district}\n`;

                const messages = getChatHistory();
                summary += `মোট চ্যাট: ${messages.length} বার্তা\n`;

                try {
                    const reminders = JSON.parse(localStorage.getItem('sf_reminders') || '[]');
                    const pending = reminders.filter(r => !r.completed).length;
                    const completed = reminders.filter(r => r.completed).length;
                    summary += `রিমাইন্ডার: ${pending} বাকি, ${completed} সম্পন্ন\n`;
                } catch {}

                summary += `\nতৈরি: ${new Date().toLocaleString('bn-BD')}\n`;
                summary += '═══════════════════════════════════════\n';
                return summary;
            }

            default:
                return null;
        }
    },
};
