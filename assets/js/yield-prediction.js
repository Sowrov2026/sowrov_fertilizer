/**
 * SF AI V15 — Yield Prediction Module
 * ফসল ফলন পূর্বাভাস ও লাভজনকতা বিশ্লেষণ
 * Bangladesh-specific agriculture yield prediction
 */

// Area conversion constants
const AREA = {
    BIGHA: 1,
    SHOTOK: 20,
    ACRE: 0.333,
    KATHA: 40,
    SQM: 2508,
};

const UNIT_FACTORS = {
    'বিঘা': 1,
    'শতক': 1 / AREA.SHOTOK,
    'একর': 1 / AREA.ACRE,
    'কাঠা': 1 / AREA.KATHA,
    'বর্গমিটার': 1 / AREA.SQM,
    'বর্গফুট': 1 / (AREA.SQM * 10.764),
};

// Yield data — Bangladesh averages per bigha
const YIELD_DATA = {
    'টমেটো': {
        yieldPerBigha: '20-30 মণ',
        yieldMin: 20,
        yieldMax: 30,
        pricePerMound: 800,
        costPerBigha: 15000,
        riskLevel: 'medium',
        notes: 'পোকা ঝুঁকি বেশি',
        bestSeason: 'শীত',
        soilPreference: ['দোআঁশ', 'লালদোআঁশ'],
        waterNeed: 'মাঝারি',
        growthDays: 90,
    },
    'ধান (বোরো)': {
        yieldPerBigha: '20-25 মণ',
        yieldMin: 20,
        yieldMax: 25,
        pricePerMound: 1200,
        costPerBigha: 8000,
        riskLevel: 'low',
        notes: 'নিশ্চিত ফলন',
        bestSeason: 'হেমন্ত-শীত',
        soilPreference: ['পলি', 'কালোপলি', 'দোআঁশ'],
        waterNeed: 'বেশি',
        growthDays: 150,
    },
    'ধান (আউশ)': {
        yieldPerBigha: '10-15 মণ',
        yieldMin: 10,
        yieldMax: 15,
        pricePerMound: 1200,
        costPerBigha: 6000,
        riskLevel: 'medium',
        notes: 'খরা ঝুঁকি',
        bestSeason: 'গ্রীষ্ম',
        soilPreference: ['পলি', 'কালোপলি'],
        waterNeed: 'বেশি',
        growthDays: 120,
    },
    'মরিচ': {
        yieldPerBigha: '8-12 মণ',
        yieldMin: 8,
        yieldMax: 12,
        pricePerMound: 3000,
        costPerBigha: 12000,
        riskLevel: 'high',
        notes: 'রোগ ঝুঁকি বেশি',
        bestSeason: 'শীত',
        soilPreference: ['দোআঁশ', 'বালুআঁশ'],
        waterNeed: 'মাঝারি',
        growthDays: 120,
    },
    'বেগুন': {
        yieldPerBigha: '25-35 মণ',
        yieldMin: 25,
        yieldMax: 35,
        pricePerMound: 600,
        costPerBigha: 10000,
        riskLevel: 'medium',
        notes: '',
        bestSeason: 'সারা বছর',
        soilPreference: ['দোআঁশ', 'লালদোআঁশ'],
        waterNeed: 'মাঝারি',
        growthDays: 100,
    },
    'আলু': {
        yieldPerBigha: '40-60 মণ',
        yieldMin: 40,
        yieldMax: 60,
        pricePerMound: 400,
        costPerBigha: 8000,
        riskLevel: 'low',
        notes: 'নিশ্চিত বাজার',
        bestSeason: 'শীত',
        soilPreference: ['বালুআঁশ', 'দোআঁশ'],
        waterNeed: 'কম',
        growthDays: 90,
    },
    'পেঁয়াজ': {
        yieldPerBigha: '30-40 মণ',
        yieldMin: 30,
        yieldMax: 40,
        pricePerMound: 600,
        costPerBigha: 10000,
        riskLevel: 'medium',
        notes: 'রপ্তানি চাহিদা',
        bestSeason: 'শীত',
        soilPreference: ['বালুআঁশ', 'দোআঁশ'],
        waterNeed: 'কম',
        growthDays: 110,
    },
    'কলা': {
        yieldPerBigha: '100-150 ডজন',
        yieldMin: 100,
        yieldMax: 150,
        pricePerDozen: 100,
        costPerBigha: 20000,
        riskLevel: 'medium',
        notes: '',
        bestSeason: 'সারা বছর',
        soilPreference: ['কালোপলি', 'পলি'],
        waterNeed: 'বেশি',
        growthDays: 300,
    },
    'পেপে': {
        yieldPerBigha: '80-120 টুকরো',
        yieldMin: 80,
        yieldMax: 120,
        pricePerPiece: 50,
        costPerBigha: 8000,
        riskLevel: 'low',
        notes: '',
        bestSeason: 'গ্রীষ্ম',
        soilPreference: ['দোআঁশ', 'পলি'],
        waterNeed: 'মাঝারি',
        growthDays: 90,
    },
    'লাউ': {
        yieldPerBigha: '100-150 টুকরো',
        yieldMin: 100,
        yieldMax: 150,
        pricePerPiece: 40,
        costPerBigha: 6000,
        riskLevel: 'low',
        notes: '',
        bestSeason: 'গ্রীষ্ম',
        soilPreference: ['দোআঁশ', 'লালদোআঁশ'],
        waterNeed: 'বেশি',
        growthDays: 80,
    },
    'তরমুজ': {
        yieldPerBigha: '80-120 টুকরো',
        yieldMin: 80,
        yieldMax: 120,
        pricePerPiece: 60,
        costPerBigha: 8000,
        riskLevel: 'medium',
        notes: '',
        bestSeason: 'গ্রীষ্ম',
        soilPreference: ['বালুআঁশ', 'দোআঁশ'],
        waterNeed: 'মাঝারি',
        growthDays: 100,
    },
};

const RISK_LABELS = {
    low: 'কম ঝুঁকি',
    medium: 'মাঝারি ঝুঁকি',
    high: 'বেশি ঝুঁকি',
};

const RISK_COLORS = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
};

const SEASON_COMPAT = {
    low: 'এই মৌসুমে ফসল চাষ করা সম্ভব, তবে সেরা ফলনের জন্য উপযুক্ত নয়।',
    medium: 'এই মৌসুমে ফসল চাষ করা যায়।',
    high: 'এই মৌসুমে ফসল চাষের জন্য খুবই উপযুক্ত।',
};

/**
 * Convert area to bigha
 */
function toBigha(value, unit) {
    const factor = UNIT_FACTORS[unit];
    if (!factor) return 0;
    return value * factor;
}

/**
 * Format currency in BDT
 */
function formatBDT(amount) {
    const formatted = Math.round(amount).toLocaleString('bn-BD');
    return `৳${formatted}`;
}

/**
 * Calculate risk score from soil/season match
 */
function soilSeasonScore(cropData, soilType, season) {
    let score = 50;

    if (soilType && cropData.soilPreference.includes(soilType)) {
        score += 25;
    }

    if (season && cropData.bestSeason === season) {
        score += 25;
    } else if (season && cropData.bestSeason === 'সারা বছর') {
        score += 15;
    }

    return Math.min(score, 100);
}

/**
 * Parse yield range
 */
function parseYieldRange(yieldStr) {
    const match = yieldStr.match(/(\d+)-(\d+)/);
    if (!match) return { min: 0, max: 0 };
    return { min: parseInt(match[1], 10), max: parseInt(match[2], 10), unit: yieldStr.replace(/\d+-\d+\s*/, '') };
}

/**
 * Calculate total revenue for a crop
 */
function calcRevenue(cropData, bighaCount, expectedYield) {
    const yieldRange = parseYieldRange(cropData.yieldPerBigha);
    const avgYield = expectedYield || ((yieldRange.min + yieldRange.max) / 2);

    if (cropData.pricePerMound) {
        return avgYield * bighaCount * cropData.pricePerMound;
    }
    if (cropData.pricePerDozen) {
        return avgYield * bighaCount * cropData.pricePerDozen;
    }
    if (cropData.pricePerPiece) {
        return avgYield * bighaCount * cropData.pricePerPiece;
    }
    return 0;
}

export const SFYieldPrediction = {
    /**
     * Predict yield based on crop, area, soil, season
     */
    predictYield(cropName, areaValue, areaUnit, soilType, season) {
        const cropData = YIELD_DATA[cropName];
        if (!cropData) {
            return { success: false, error: 'ফসল খুঁজে পাওয়া যায়নি' };
        }

        const bighaCount = toBigha(areaValue, areaUnit);
        if (bighaCount <= 0) {
            return { success: false, error: 'সঠিক এলাকা প্রদান করুন' };
        }

        const yieldRange = parseYieldRange(cropData.yieldPerBigha);
        const totalYieldMin = yieldRange.min * bighaCount;
        const totalYieldMax = yieldRange.max * bighaCount;
        const totalYieldAvg = (totalYieldMin + totalYieldMax) / 2;

        const matchScore = soilSeasonScore(cropData, soilType, season);

        return {
            success: true,
            crop: cropName,
            area: { value: areaValue, unit: areaUnit, bigha: bighaCount },
            yield: {
                perBigha: cropData.yieldPerBigha,
                total: `${Math.round(totalYieldMin).toLocaleString('bn-BD')}-${Math.round(totalYieldMax).toLocaleString('bn-BD')} ${yieldRange.unit}`,
                average: `${Math.round(totalYieldAvg).toLocaleString('bn-BD')} ${yieldRange.unit}`,
                min: totalYieldMin,
                max: totalYieldMax,
                avg: totalYieldAvg,
            },
            matchScore,
            bestSeason: cropData.bestSeason,
            soilPreference: cropData.soilPreference.join(', '),
            waterNeed: cropData.waterNeed,
            growthDays: cropData.growthDays,
            notes: cropData.notes,
        };
    },

    /**
     * Estimate cost for a crop
     */
    estimateCost(cropName, areaValue, areaUnit) {
        const cropData = YIELD_DATA[cropName];
        if (!cropData) {
            return { success: false, error: 'ফসল খুঁজে পাওয়া যায়নি' };
        }

        const bighaCount = toBigha(areaValue, areaUnit);
        if (bighaCount <= 0) {
            return { success: false, error: 'সঠিক এলাকা প্রদান করুন' };
        }

        const totalCost = cropData.costPerBigha * bighaCount;

        return {
            success: true,
            crop: cropName,
            area: { value: areaValue, unit: areaUnit, bigha: bighaCount },
            costPerBigha: cropData.costPerBigha,
            totalCost,
            formatted: formatBDT(totalCost),
            breakdown: {
                'বীজ': Math.round(cropData.costPerBigha * 0.20 * bighaCount),
                'সার': Math.round(cropData.costPerBigha * 0.30 * bighaCount),
                'কীটনাশক': Math.round(cropData.costPerBigha * 0.15 * bighaCount),
                'জলসেচ': Math.round(cropData.costPerBigha * 0.15 * bighaCount),
                'শ্রম': Math.round(cropData.costPerBigha * 0.20 * bighaCount),
            },
        };
    },

    /**
     * Estimate profit
     */
    estimateProfit(cropName, areaValue, areaUnit, expectedYield) {
        const cropData = YIELD_DATA[cropName];
        if (!cropData) {
            return { success: false, error: 'ফসল খুঁজে পাওয়া যায়নি' };
        }

        const bighaCount = toBigha(areaValue, areaUnit);
        if (bighaCount <= 0) {
            return { success: false, error: 'সঠিক এলাকা প্রদান করুন' };
        }

        const totalCost = cropData.costPerBigha * bighaCount;
        const revenue = calcRevenue(cropData, bighaCount, expectedYield);
        const profit = revenue - totalCost;
        const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;
        const yieldRange = parseYieldRange(cropData.yieldPerBigha);

        // Calculate min/max profit
        const minRevenue = cropData.pricePerMound
            ? yieldRange.min * bighaCount * cropData.pricePerMound
            : cropData.pricePerDozen
                ? yieldRange.min * bighaCount * cropData.pricePerDozen
                : yieldRange.min * bighaCount * (cropData.pricePerPiece || 0);
        const maxRevenue = cropData.pricePerMound
            ? yieldRange.max * bighaCount * cropData.pricePerMound
            : cropData.pricePerDozen
                ? yieldRange.max * bighaCount * cropData.pricePerDozen
                : yieldRange.max * bighaCount * (cropData.pricePerPiece || 0);

        return {
            success: true,
            crop: cropName,
            area: { value: areaValue, unit: areaUnit, bigha: bighaCount },
            revenue: {
                average: revenue,
                min: minRevenue,
                max: maxRevenue,
                formatted: formatBDT(revenue),
            },
            cost: {
                total: totalCost,
                formatted: formatBDT(totalCost),
            },
            profit: {
                average: profit,
                min: minRevenue - totalCost,
                max: maxRevenue - totalCost,
                formatted: formatBDT(profit),
            },
            roi: {
                average: roi,
                min: totalCost > 0 ? (((minRevenue - totalCost) / totalCost) * 100) : 0,
                max: totalCost > 0 ? (((maxRevenue - totalCost) / totalCost) * 100) : 0,
                formatted: `${roi.toFixed(1)}%`,
            },
            isProfitable: profit > 0,
        };
    },

    /**
     * Get risk assessment
     */
    getRiskAssessment(cropName, soilType, season) {
        const cropData = YIELD_DATA[cropName];
        if (!cropData) {
            return { success: false, error: 'ফসল খুঁজে পাওয়া যায়নি' };
        }

        const matchScore = soilSeasonScore(cropData, soilType, season);
        const soilMatch = soilType ? cropData.soilPreference.includes(soilType) : null;
        const seasonMatch = season ? cropData.bestSeason === season || cropData.bestSeason === 'সারা বছর' : null;

        let overallRisk = cropData.riskLevel;
        if (matchScore < 50) overallRisk = 'high';
        else if (matchScore < 75) overallRisk = 'medium';

        const recommendations = [];
        if (!soilMatch) {
            recommendations.push(`এই ফসলের জন্য উপযুক্ত মাটি: ${cropData.soilPreference.join(', ')}`);
        }
        if (!seasonMatch) {
            recommendations.push(`সেরা মৌসুম: ${cropData.bestSeason}`);
        }
        if (cropData.riskLevel === 'high') {
            recommendations.push('বীমা করানো উচিত');
        }
        if (cropData.notes) {
            recommendations.push(cropData.notes);
        }

        return {
            success: true,
            crop: cropName,
            riskLevel: overallRisk,
            riskLabel: RISK_LABELS[overallRisk],
            riskColor: RISK_COLORS[overallRisk],
            matchScore,
            soilMatch,
            seasonMatch,
            seasonCompatibility: seasonMatch ? SEASON_COMPAT.high : SEASON_COMPAT.medium,
            waterNeed: cropData.waterNeed,
            growthDays: cropData.growthDays,
            recommendations,
        };
    },

    /**
     * Compare crops profitability
     */
    compareCrops(areaValue, areaUnit, soilType) {
        const bighaCount = toBigha(areaValue, areaUnit);
        if (bighaCount <= 0) {
            return { success: false, error: 'সঠিক এলাকা প্রদান করুন' };
        }

        const comparisons = [];

        for (const [name, data] of Object.entries(YIELD_DATA)) {
            const totalCost = data.costPerBigha * bighaCount;
            const yieldRange = parseYieldRange(data.yieldPerBigha);
            const avgYield = (yieldRange.min + yieldRange.max) / 2;

            const revenue = calcRevenue(data, bighaCount);
            const profit = revenue - totalCost;
            const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;
            const matchScore = soilSeasonScore(data, soilType, null);

            comparisons.push({
                crop: name,
                yieldPerBigha: data.yieldPerBigha,
                totalCost,
                revenue,
                profit,
                roi,
                matchScore,
                riskLevel: data.riskLevel,
                riskLabel: RISK_LABELS[data.riskLevel],
                isProfitable: profit > 0,
            });
        }

        comparisons.sort((a, b) => b.profit - a.profit);

        return {
            success: true,
            area: { value: areaValue, unit: areaUnit, bigha: bighaCount },
            topProfitable: comparisons.filter(c => c.isProfitable).slice(0, 5),
            topRoi: [...comparisons].sort((a, b) => b.roi - a.roi).slice(0, 5),
            all: comparisons,
            bestOverall: comparisons[0] || null,
            safest: comparisons.find(c => c.riskLevel === 'low') || null,
        };
    },

    /**
     * Get market price info
     */
    getMarketPrice(cropName) {
        const cropData = YIELD_DATA[cropName];
        if (!cropData) {
            return { success: false, error: 'ফসল খুঁজে পাওয়া যায়নি' };
        }

        const unit = cropData.pricePerMound ? 'মণ' : cropData.pricePerDozen ? 'ডজন' : 'টুকরো';
        const price = cropData.pricePerMound || cropData.pricePerDozen || cropData.pricePerPiece;

        return {
            success: true,
            crop: cropName,
            pricePerUnit: price,
            unit,
            formatted: `প্রতি ${unit} ৳${price}`,
            costPerBigha: cropData.costPerBigha,
            costFormatted: formatBDT(cropData.costPerBigha),
            yieldPerBigha: cropData.yieldPerBigha,
            notes: cropData.notes || null,
        };
    },

    /**
     * Format prediction as readable text
     */
    formatPrediction(prediction) {
        if (!prediction.success) return `ত্রুটি: ${prediction.error}`;

        const lines = [];
        lines.push(`ফসল: ${prediction.crop}`);
        lines.push(`এলাকা: ${prediction.area.value} ${prediction.area.unit} (${prediction.area.bigha.toFixed(2)} বিঘা)`);
        lines.push(`প্রতি বিঘা ফলন: ${prediction.yield.perBigha}`);
        lines.push(`মোট প্রত্যাশিত ফলন: ${prediction.yield.total}`);
        lines.push(`গড় ফলন: ${prediction.yield.average}`);
        lines.push('');
        lines.push(`সেরা মৌসুম: ${prediction.bestSeason}`);
        lines.push(`উপযুক্ত মাটি: ${prediction.soilPreference}`);
        lines.push(`পানির চাহিদা: ${prediction.waterNeed}`);
        lines.push(`ফসল পাকতে সময়: ${prediction.growthDays} দিন`);
        lines.push(`ম্যাচ স্কোর: ${prediction.matchScore}%`);
        if (prediction.notes) {
            lines.push(`দ্রষ্টব্য: ${prediction.notes}`);
        }
        return lines.join('\n');
    },

    /**
     * Create prediction UI
     */
    createPredictionUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const cropNames = Object.keys(YIELD_DATA);
        const soilTypes = ['পলি', 'কালোপলি', 'দোআঁশ', 'লালদোআঁশ', 'বালুআঁশ'];
        const seasons = ['গ্রীষ্ম', 'বর্ষা', 'শীত', 'হেমন্ত'];
        const areaUnits = Object.keys(UNIT_FACTORS);

        container.innerHTML = `
        <style>
            .sfp-wrap { font-family: 'Hind Siliguri', sans-serif; max-width: 900px; margin: 0 auto; }
            .sfp-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 24px; margin-bottom: 20px; }
            .sfp-card h3 { margin: 0 0 16px; color: #1a1a2e; font-size: 1.1rem; }
            .sfp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
            .sfp-field label { display: block; font-size: 0.85rem; color: #555; margin-bottom: 4px; }
            .sfp-field select, .sfp-field input {
                width: 100%; padding: 10px 12px; border: 1.5px solid #ddd; border-radius: 8px;
                font-size: 0.95rem; font-family: inherit; transition: border-color 0.2s;
            }
            .sfp-field select:focus, .sfp-field input:focus { outline: none; border-color: #6c5ce7; }
            .sfp-btn {
                display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #6c5ce7, #a855f7);
                color: #fff; border: none; border-radius: 8px; font-size: 1rem; font-family: inherit;
                cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; margin-top: 8px;
            }
            .sfp-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(108,92,231,0.35); }
            .sfp-btn:active { transform: translateY(0); }
            .sfp-result { display: none; }
            .sfp-result.active { display: block; }
            .sfp-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 16px; }
            .sfp-metric {
                background: #f8f9ff; border-radius: 10px; padding: 16px; text-align: center;
                border: 1px solid #e8e5ff;
            }
            .sfp-metric .val { font-size: 1.5rem; font-weight: 700; color: #1a1a2e; }
            .sfp-metric .lbl { font-size: 0.8rem; color: #777; margin-top: 4px; }
            .sfp-risk-badge {
                display: inline-block; padding: 4px 14px; border-radius: 20px;
                font-size: 0.85rem; font-weight: 600; color: #fff;
            }
            .sfp-breakdown { width: 100%; border-collapse: collapse; margin-top: 12px; }
            .sfp-breakdown th, .sfp-breakdown td {
                text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 0.9rem;
            }
            .sfp-breakdown th { color: #555; font-weight: 600; }
            .sfp-notes { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-top: 12px; font-size: 0.9rem; color: #92400e; }
            .sfp-compare-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            .sfp-compare-table th, .sfp-compare-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; font-size: 0.88rem; }
            .sfp-compare-table th { background: #f1f0ff; font-weight: 600; color: #555; }
            .sfp-compare-table tr:hover { background: #faf9ff; }
            .sfp-profit { color: #22c55e; font-weight: 600; }
            .sfp-loss { color: #ef4444; font-weight: 600; }
        </style>

        <div class="sfp-wrap">
            <div class="sfp-card">
                <h3>ফসল ফলন পূর্বাভাস</h3>
                <div class="sfp-grid">
                    <div class="sfp-field">
                        <label>ফসল</label>
                        <select id="sfp-crop">
                            <option value="">-- ফসল নির্বাচন করুন --</option>
                            ${cropNames.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sfp-field">
                        <label>এলাকা</label>
                        <input type="number" id="sfp-area" placeholder="এলাকা লিখুন" min="0" step="0.01">
                    </div>
                    <div class="sfp-field">
                        <label>একক</label>
                        <select id="sfp-unit">
                            ${areaUnits.map(u => `<option value="${u}">${u}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sfp-field">
                        <label>মাটির ধরন</label>
                        <select id="sfp-soil">
                            <option value="">-- মাটি নির্বাচন করুন --</option>
                            ${soilTypes.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sfp-field">
                        <label>মৌসুম</label>
                        <select id="sfp-season">
                            <option value="">-- মৌসুম নির্বাচন করুন --</option>
                            ${seasons.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div style="margin-top: 16px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="sfp-btn" id="sfp-predict-btn">ফলন পূর্বাভাস করুন</button>
                    <button class="sfp-btn" id="sfp-compare-btn" style="background: linear-gradient(135deg, #22c55e, #16a34a);">সকল ফসল তুলনা করুন</button>
                </div>
            </div>

            <div class="sfp-result" id="sfp-predict-result">
                <div class="sfp-card">
                    <h3 id="sfp-result-title"></h3>
                    <div class="sfp-metrics" id="sfp-metrics"></div>
                    <div id="sfp-risk-section"></div>
                    <div id="sfp-breakdown-section"></div>
                    <div id="sfp-notes-section"></div>
                </div>
            </div>

            <div class="sfp-result" id="sfp-compare-result">
                <div class="sfp-card">
                    <h3>ফসল তুলনা</h3>
                    <div id="sfp-compare-content"></div>
                </div>
            </div>
        </div>`;

        const self = this;

        document.getElementById('sfp-predict-btn').addEventListener('click', () => {
            const crop = document.getElementById('sfp-crop').value;
            const area = parseFloat(document.getElementById('sfp-area').value);
            const unit = document.getElementById('sfp-unit').value;
            const soil = document.getElementById('sfp-soil').value;
            const season = document.getElementById('sfp-season').value;

            if (!crop || !area) {
                alert('ফসল ও এলাকা নির্বাচন করুন');
                return;
            }

            const prediction = self.predictYield(crop, area, unit, soil, season);
            const cost = self.estimateCost(crop, area, unit);
            const profit = self.estimateProfit(crop, area, unit);
            const risk = soil ? self.getRiskAssessment(crop, soil, season) : null;

            if (!prediction.success) {
                alert(prediction.error);
                return;
            }

            document.getElementById('sfp-result-title').textContent = `${prediction.crop} — ফলন পূর্বাভাস`;
            document.getElementById('sfp-metrics').innerHTML = `
                <div class="sfp-metric">
                    <div class="val">${prediction.yield.total}</div>
                    <div class="lbl">মোট ফলন</div>
                </div>
                <div class="sfp-metric">
                    <div class="val">${profit.revenue.formatted}</div>
                    <div class="lbl">আনুমানিক আয়</div>
                </div>
                <div class="sfp-metric">
                    <div class="val">${cost.formatted}</div>
                    <div class="lbl">মোট খরচ</div>
                </div>
                <div class="sfp-metric">
                    <div class="val ${profit.isProfitable ? 'sfp-profit' : 'sfp-loss'}">${profit.profit.formatted}</div>
                    <div class="lbl">আনুমানিক লাভ</div>
                </div>
                <div class="sfp-metric">
                    <div class="val">${profit.roi.formatted}</div>
                    <div class="lbl">ROI</div>
                </div>`;

            let riskHtml = '';
            if (risk && risk.success) {
                riskHtml = `
                    <div style="margin-bottom: 12px;">
                        <span class="sfp-risk-badge" style="background:${risk.riskColor};">${risk.riskLabel}</span>
                        <span style="margin-left:12px; font-size:0.9rem; color:#555;">ম্যাচ স্কোর: ${risk.matchScore}%</span>
                    </div>`;
                if (risk.recommendations.length) {
                    riskHtml += `<div style="font-size:0.9rem; color:#555;">
                        ${risk.recommendations.map(r => `<div style="margin:4px 0;">&#x2022; ${r}</div>`).join('')}
                    </div>`;
                }
            }
            document.getElementById('sfp-risk-section').innerHTML = riskHtml;

            let breakdownHtml = '';
            if (cost.breakdown) {
                breakdownHtml = `<table class="sfp-breakdown">
                    <thead><tr><th>খরচের খাত</th><th>পরিমাণ</th></tr></thead>
                    <tbody>
                        ${Object.entries(cost.breakdown).map(([k, v]) =>
                            `<tr><td>${k}</td><td>${formatBDT(v)}</td></tr>`
                        ).join('')}
                        <tr style="font-weight:700;"><td>মোট</td><td>${cost.formatted}</td></tr>
                    </tbody>
                </table>`;
            }
            document.getElementById('sfp-breakdown-section').innerHTML = breakdownHtml;

            if (prediction.notes) {
                document.getElementById('sfp-notes-section').innerHTML =
                    `<div class="sfp-notes">${prediction.notes}</div>`;
            } else {
                document.getElementById('sfp-notes-section').innerHTML = '';
            }

            document.getElementById('sfp-predict-result').classList.add('active');
            document.getElementById('sfp-compare-result').classList.remove('active');
        });

        document.getElementById('sfp-compare-btn').addEventListener('click', () => {
            const area = parseFloat(document.getElementById('sfp-area').value);
            const unit = document.getElementById('sfp-unit').value;
            const soil = document.getElementById('sfp-soil').value;

            if (!area) {
                alert('এলাকা প্রদান করুন');
                return;
            }

            const result = self.compareCrops(area, unit, soil);
            if (!result.success) {
                alert(result.error);
                return;
            }

            const rows = result.all.map(c => `
                <tr>
                    <td>${c.crop}</td>
                    <td>${c.yieldPerBigha}</td>
                    <td>${formatBDT(c.totalCost)}</td>
                    <td>${formatBDT(c.revenue)}</td>
                    <td class="${c.isProfitable ? 'sfp-profit' : 'sfp-loss'}">${formatBDT(c.profit)}</td>
                    <td>${c.roi.toFixed(1)}%</td>
                    <td><span class="sfp-risk-badge" style="background:${RISK_COLORS[c.riskLevel]}; font-size:0.75rem;">${c.riskLabel}</span></td>
                </tr>
            `).join('');

            let summaryHtml = '<div style="margin-bottom:16px; padding:12px; background:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0;">';
            if (result.bestOverall) {
                summaryHtml += `<div style="margin-bottom:6px;"><strong>সবচেয়ে লাভজনক:</strong> ${result.bestOverall.crop} — ${formatBDT(result.bestOverall.profit)} লাভ</div>`;
            }
            if (result.safest) {
                summaryHtml += `<div><strong>সবচেয়ে নিরাপদ:</strong> ${result.safest.crop} (${result.safest.riskLabel})</div>`;
            }
            summaryHtml += '</div>';

            document.getElementById('sfp-compare-content').innerHTML = `
                ${summaryHtml}
                <div style="overflow-x:auto;">
                    <table class="sfp-compare-table">
                        <thead><tr>
                            <th>ফসল</th><th>ফলন/বিঘা</th><th>খরচ</th><th>আয়</th><th>লাভ</th><th>ROI</th><th>ঝুঁকি</th>
                        </tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>`;

            document.getElementById('sfp-compare-result').classList.add('active');
            document.getElementById('sfp-predict-result').classList.remove('active');
        });
    },
};
