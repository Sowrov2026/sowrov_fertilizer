const DISEASE_TIMELINES = {
    'পাতা হলুদ': {
        stages: [
            { day: 0, name: 'প্রাথমিক', risk: 'low', symptoms: 'হালকা হলুদ দাগ', action: 'পর্যবেক্ষণ করুন' },
            { day: 3, name: 'মাঝারি', risk: 'medium', symptoms: 'হলুদ বিস্তার, পাতা ঝরা শুরু', action: 'নিম তেল স্প্রে, ইউরিয়া বন্ধ' },
            { day: 7, name: 'তীব্র', risk: 'high', symptoms: 'বেশিরভাগ পাতা হলুদ, গাছ দুর্বল', action: 'ছত্রাকনাশক স্প্রে, আক্রান্ত পাতা সরান' },
            { day: 15, name: 'সম্ভাব্য ক্ষতি', risk: 'critical', symptoms: 'ফলন কমে যাবে, গাছ মরতে পারে', action: 'রাসায়নিক চিকিৎসা, পেরিমিটার সেচ' },
        ],
        prevention: ['ভালো জল নিকাশন', 'অতিরিক্ত নাইট্রোজেন এড়িয়ে চলুন', 'নিয়মিত পর্যবেক্ষণ'],
    },
    'পাতা কুকড়ানো': {
        stages: [
            { day: 0, name: 'প্রাথমিক', risk: 'low', symptoms: 'পাতার প্রান্ত কুকড়ে', action: 'পানির অভাব চেক করুন' },
            { day: 3, name: 'মাঝারি', risk: 'medium', symptoms: 'পাতা সম্পূর্ণ কুকড়ে', action: 'সেচ দিন, পোকা চেক করুন' },
            { day: 7, name: 'তীব্র', risk: 'high', symptoms: 'নতুন পাতাও কুকড়ে', action: 'অ্যাফিড স্প্রে, নিম তেল' },
            { day: 15, name: 'গুরুতর', risk: 'critical', symptoms: 'গাছ বৃদ্ধি থেমে গেছে', action: 'রাসায়নিক চিকিৎসা প্রয়োজন' },
        ],
        prevention: ['নিয়মিত সেচ', 'পোকা পর্যবেক্ষণ', 'ভালো পুষ্টি'],
    },
    'দাগ রোগ': {
        stages: [
            { day: 0, name: 'প্রাথমিক', risk: 'low', symptoms: 'ছোট বাদামী দাগ', action: 'পর্যবেক্ষণ করুন' },
            { day: 4, name: 'মাঝারি', risk: 'medium', symptoms: 'দাগ বড় হচ্ছে, সংখ্যা বাড়ছে', action: 'তামার ফাঙ্গিসাইড স্প্রে' },
            { day: 8, name: 'তীব্র', risk: 'high', symptoms: 'দাগ পাতা জুড়ে ছড়িয়ে পড়ে', action: 'শক্তিশালী ছত্রাকনাশক প্রয়োগ' },
            { day: 14, name: 'গুরুতর', risk: 'critical', symptoms: 'পাতা ঝরে পড়ছে, গাছ দুর্বল', action: 'আক্রান্ত অংশ কাটুন, রাসায়নিক চিকিৎসা' },
        ],
        prevention: ['বাতাস চলাচল নিশ্চিত করুন', 'অতিরিক্ত আর্দ্রতা এড়িয়ে চলুন', 'রোগ প্রতিরোধী জাত ব্যবহার করুন'],
    },
    'পাতা পচা': {
        stages: [
            { day: 0, name: 'প্রাথমিক', risk: 'low', symptoms: 'পাতায় হালকা ভেজা দাগ', action: 'পানির অতিরিকতা চেক করুন' },
            { day: 3, name: 'মাঝারি', risk: 'medium', symptoms: 'পাতা নরম ও পচনশীল', action: 'সেচ কমান, নিকাশন উন্নত করুন' },
            { day: 6, name: 'তীব্র', risk: 'high', symptoms: 'দুর্গন্ধ ছড়িয়ে পড়ে, পাতা কালো', action: 'আক্রান্ত পাতা সরান, ব্যাকটেরিয়াল স্প্রে' },
            { day: 12, name: 'গুরুতর', risk: 'critical', symptoms: 'কাণ্ডও পচতে শুরু করে', action: 'গাছ সরিয়ে ফেলুন, মাটি শুকান' },
        ],
        prevention: ['অতিরিক্ত সেচ এড়িয়ে চলুন', 'ভালো জল নিকাশন', 'আক্রান্ত গাছ থেকে দূরে থাকুন'],
    },
    'কালো দাগ': {
        stages: [
            { day: 0, name: 'প্রাথমিক', risk: 'low', symptoms: 'ছোট কালো বিন্দু', action: 'পর্যবেক্ষণ করুন' },
            { day: 5, name: 'মাঝারি', risk: 'medium', symptoms: 'কালো দাগ বড় হচ্ছে', action: 'তামা-ভিত্তিক স্প্রে প্রয়োগ' },
            { day: 10, name: 'তীব্র', risk: 'high', symptoms: 'দাগ পুরো পাতায় ছড়িয়ে পড়ে', action: 'শক্তিশালী ছত্রাকনাশক ব্যবহার' },
            { day: 18, name: 'গুরুতর', risk: 'critical', symptoms: 'পাতা ঝরে গাছ দুর্বল', action: 'রাসায়নিক চিকিৎসা, গাছ কাটুন' },
        ],
        prevention: ['পাতা শুকিয়ে রাখুন', 'বীজ শোধন করুন', 'সময়মতো ছত্রাকনাশক প্রয়োগ'],
    },
    'বাতাসা রোগ': {
        stages: [
            { day: 0, name: 'প্রাথমিক', risk: 'low', symptoms: 'সাদা পাউডার জমা', action: 'নাড়িয়ে পরিষ্কার করুন' },
            { day: 4, name: 'মাঝারি', risk: 'medium', symptoms: 'সাদা আস্তরণ বাড়ছে', action: 'বেকিং সোডা স্প্রে' },
            { day: 8, name: 'তীব্র', risk: 'high', symptoms: 'পাতা হলুদ ও মলিচ হচ্ছে', action: 'সালফার-ভিত্তিক স্প্রে' },
            { day: 14, name: 'গুরুতর', risk: 'critical', symptoms: 'গাছের বৃদ্ধি মারাত্মক বাধাগ্রস্ত', action: 'শক্তিশালী ছত্রাকনাশক, পুষ্টি বৃদ্ধি' },
        ],
        prevention: ['বাতাস চলাচল নিশ্চিত করুন', 'অতিরিক্ত নাইট্রোজেন এড়িয়ে চলুন', 'নিয়মিত পর্যবেক্ষণ'],
    },
    'মলিচ রোগ': {
        stages: [
            { day: 0, name: 'প্রাথমিক', risk: 'low', symptoms: 'হালকা মলিচ রং', action: 'পর্যবেক্ষণ করুন' },
            { day: 3, name: 'মাঝারি', risk: 'medium', symptoms: 'মলিচ রং গাঢ় হচ্ছে', action: 'নিম তেল স্প্রে' },
            { day: 7, name: 'তীব্র', risk: 'high', symptoms: 'পাতা শুকিয়ে ঝরছে', action: 'কীটনাশক স্প্রে' },
            { day: 14, name: 'গুরুতর', risk: 'critical', symptoms: 'গাছ গুরুতর ক্ষতিগ্রস্ত', action: 'রাসায়নিক চিকিৎসা প্রয়োজন' },
        ],
        prevention: ['পোকা পর্যবেক্ষণ', 'নিয়মিত সেচ', 'শত্রুপোকা নিয়ন্ত্রণ'],
    },
    'গলা রোগ': {
        stages: [
            { day: 0, name: 'প্রাথমিক', risk: 'low', symptoms: 'কাণ্ডে হালকা দাগ', action: 'পর্যবেক্ষণ করুন' },
            { day: 5, name: 'মাঝারি', risk: 'medium', symptoms: 'কাণ্ড নরম হচ্ছে', action: 'তামা স্প্রে প্রয়োগ' },
            { day: 10, name: 'তীব্র', risk: 'high', symptoms: 'কাণ্ড পচছে, গাছ ভাঙছে', action: 'আক্রান্ত অংশ কাটুন' },
            { day: 16, name: 'গুরুতর', risk: 'critical', symptoms: 'গাছ মরতে শুরু করেছে', action: 'গাছ সরিয়ে ফেলুন, মাটি শোধন' },
        ],
        prevention: ['কাণ্ডে আঘাত এড়িয়ে চলুন', 'ভালো নিকাশন', 'রোগ প্রতিরোধী জাত ব্যবহার'],
    },
};

const RISK_CONFIG = {
    low: { color: '#22c55e', label: 'কম ঝুঁকি', icon: '🟢', priority: 1 },
    medium: { color: '#f59e0b', label: 'মাঝারি ঝুঁকি', icon: '🟡', priority: 2 },
    high: { color: '#f97316', label: 'উচ্চ ঝুঁকি', icon: '🟠', priority: 3 },
    critical: { color: '#ef4444', label: 'সমালোচনামূলক', icon: '🔴', priority: 4 },
};

function getCurrentStage(stages, daysSinceSymptom) {
    if (daysSinceSymptom < 0) return stages[0];
    let current = stages[0];
    for (const stage of stages) {
        if (daysSinceSymptom >= stage.day) {
            current = stage;
        }
    }
    return current;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export const SFDiseaseTimeline = {
    getTimeline(diseaseName) {
        const timeline = DISEASE_TIMELINES[diseaseName];
        if (!timeline) return null;
        return {
            disease: diseaseName,
            stages: [...timeline.stages],
            prevention: [...timeline.prevention],
        };
    },

    getRiskLevel(diseaseName, daysSinceSymptom = 0) {
        const timeline = DISEASE_TIMELINES[diseaseName];
        if (!timeline) return null;
        const stage = getCurrentStage(timeline.stages, daysSinceSymptom);
        const risk = RISK_CONFIG[stage.risk] || RISK_CONFIG.low;
        return {
            level: stage.risk,
            label: risk.label,
            color: risk.color,
            icon: risk.icon,
            priority: risk.priority,
            stage: stage.name,
            day: stage.day,
        };
    },

    getTreatment(diseaseName, daysSinceSymptom = 0) {
        const timeline = DISEASE_TIMELINES[diseaseName];
        if (!timeline) return null;
        const stage = getCurrentStage(timeline.stages, daysSinceSymptom);
        return {
            disease: diseaseName,
            stage: stage.name,
            risk: stage.risk,
            action: stage.action,
            symptoms: stage.symptoms,
            daysSinceSymptom,
        };
    },

    getPrevention(diseaseName) {
        const timeline = DISEASE_TIMELINES[diseaseName];
        if (!timeline) return null;
        return {
            disease: diseaseName,
            tips: [...timeline.prevention],
        };
    },

    getAllDiseases() {
        return Object.keys(DISEASE_TIMELINES).map((name) => {
            const timeline = DISEASE_TIMELINES[name];
            const lastStage = timeline.stages[timeline.stages.length - 1];
            return {
                name,
                stageCount: timeline.stages.length,
                maxRisk: lastStage.risk,
                maxRiskLabel: RISK_CONFIG[lastStage.risk]?.label || '',
            };
        });
    },

    formatTimeline(diseaseName, daysSinceSymptom = 0) {
        const timeline = DISEASE_TIMELINES[diseaseName];
        if (!timeline) return `রোগ পাওয়া যায়নি: ${diseaseName}`;

        const currentStage = getCurrentStage(timeline.stages, daysSinceSymptom);
        const risk = RISK_CONFIG[currentStage.risk] || RISK_CONFIG.low;

        let output = `═══════════════════════════════════════\n`;
        output += `  রোগ: ${diseaseName}\n`;
        output += `  বর্তমান পর্যায়: ${currentStage.name}\n`;
        output += `  ঝুঁকি: ${risk.icon} ${risk.label}\n`;
        output += `  লক্ষণ: ${currentStage.symptoms}\n`;
        output += `  পরামর্শ: ${currentStage.action}\n`;
        output += `═══════════════════════════════════════\n\n`;

        output += `সময়রেখা:\n`;
        for (const stage of timeline.stages) {
            const stageRisk = RISK_CONFIG[stage.risk] || RISK_CONFIG.low;
            const isCurrent = stage.day === currentStage.day;
            const marker = isCurrent ? '◄── আপনি এখানে' : '';
            output += `  [দিন ${String(stage.day).padStart(2, ' ')}] ${stageRisk.icon} ${stage.name.padEnd(12, ' ')} | ${stageRisk.label}\n`;
            if (isCurrent) {
                output += `               ${marker}\n`;
            }
        }

        output += `\nপ্রতিরোধ:\n`;
        for (const tip of timeline.prevention) {
            output += `  • ${tip}\n`;
        }

        return output;
    },

    createTimelineUI(containerId, diseaseName, daysSinceSymptom = 0) {
        const container = typeof containerId === 'string'
            ? document.getElementById(containerId)
            : containerId;

        if (!container) return null;

        const timeline = DISEASE_TIMELINES[diseaseName];
        if (!timeline) {
            container.innerHTML = `<div class="sf-timeline-error">রোগ পাওয়া যায়নি: ${escapeHtml(diseaseName)}</div>`;
            return null;
        }

        const currentStage = getCurrentStage(timeline.stages, daysSinceSymptom);
        const risk = RISK_CONFIG[currentStage.risk] || RISK_CONFIG.low;

        container.innerHTML = '';
        container.classList.add('sf-timeline');

        const header = document.createElement('div');
        header.className = 'sf-timeline-header';
        header.innerHTML = `
            <h3 class="sf-timeline-disease">${escapeHtml(diseaseName)}</h3>
            <div class="sf-timeline-current" style="border-left-color: ${risk.color}">
                <span class="sf-timeline-risk-icon">${risk.icon}</span>
                <div class="sf-timeline-current-info">
                    <span class="sf-timeline-stage">${escapeHtml(currentStage.name)} পর্যায়</span>
                    <span class="sf-timeline-risk-label" style="color: ${risk.color}">${escapeHtml(risk.label)}</span>
                </div>
            </div>
        `;
        container.appendChild(header);

        const details = document.createElement('div');
        details.className = 'sf-timeline-details';
        details.innerHTML = `
            <div class="sf-timeline-detail-item">
                <span class="sf-timeline-label">লক্ষণ:</span>
                <span class="sf-timeline-value">${escapeHtml(currentStage.symptoms)}</span>
            </div>
            <div class="sf-timeline-detail-item">
                <span class="sf-timeline-label">পরামর্শ:</span>
                <span class="sf-timeline-value sf-timeline-action">${escapeHtml(currentStage.action)}</span>
            </div>
        `;
        container.appendChild(details);

        const track = document.createElement('div');
        track.className = 'sf-timeline-track';

        for (let i = 0; i < timeline.stages.length; i++) {
            const stage = timeline.stages[i];
            const stageRisk = RISK_CONFIG[stage.risk] || RISK_CONFIG.low;
            const isCurrent = stage.day === currentStage.day;
            const isPast = stage.day < currentStage.day;
            const isLast = i === timeline.stages.length - 1;

            const node = document.createElement('div');
            node.className = 'sf-timeline-node';
            if (isCurrent) node.classList.add('sf-timeline-node--current');
            if (isPast) node.classList.add('sf-timeline-node--past');

            node.innerHTML = `
                <div class="sf-timeline-dot" style="background-color: ${stageRisk.color}"></div>
                ${!isLast ? '<div class="sf-timeline-line"></div>' : ''}
                <div class="sf-timeline-node-content">
                    <span class="sf-timeline-node-day">দিন ${stage.day}</span>
                    <span class="sf-timeline-node-name">${escapeHtml(stage.name)}</span>
                    <span class="sf-timeline-node-risk" style="color: ${stageRisk.color}">${stageRisk.icon} ${escapeHtml(stageRisk.label)}</span>
                </div>
            `;

            track.appendChild(node);
        }

        container.appendChild(track);

        const prevention = document.createElement('div');
        prevention.className = 'sf-timeline-prevention';
        prevention.innerHTML = `
            <h4 class="sf-timeline-prevention-title">প্রতিরোধের উপায়</h4>
            <ul class="sf-timeline-prevention-list">
                ${timeline.prevention.map((tip) => `<li class="sf-timeline-prevention-item">${escapeHtml(tip)}</li>`).join('')}
            </ul>
        `;
        container.appendChild(prevention);

        return {
            disease: diseaseName,
            stage: currentStage.name,
            risk: currentStage.risk,
            container,
        };
    },
};
