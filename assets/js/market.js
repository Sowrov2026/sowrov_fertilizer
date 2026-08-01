export const SFMarket = {
    _BASE_PRICES: {
        'ধান': { wholesale: 28, retail: 35, unit: 'প্রতি কেজি', seasonal: { 'বোরো': 32, 'আউশ': 25, 'আমন': 30 } },
        'পেঁয়াজ': { wholesale: 40, retail: 60, unit: 'প্রতি কেজি', seasonal: { 'শীত': 50, 'গ্রীষ্ম': 80 } },
        'রসুন': { wholesale: 80, retail: 120, unit: 'প্রতি কেজি' },
        'আলু': { wholesale: 20, retail: 35, unit: 'প্রতি কেজি' },
        'টমেটো': { wholesale: 30, retail: 50, unit: 'প্রতি কেজি' },
        'মরিচ': { wholesale: 100, retail: 150, unit: 'প্রতি কেজি' },
        'বেগুন': { wholesale: 25, retail: 40, unit: 'প্রতি কেজি' },
        'কলা': { wholesale: 15, retail: 25, unit: 'প্রতি ডজন' },
        'পেপে': { wholesale: 20, retail: 35, unit: 'প্রতি কেজি' },
        'লাউ': { wholesale: 15, retail: 25, unit: 'প্রতি টুকরো' },
        'তরমুজ': { wholesale: 12, retail: 20, unit: 'প্রতি কেজি' },
        'বাঁধাকপি': { wholesale: 20, retail: 35, unit: 'প্রতি কেজি' },
        'ফুলফি': { wholesale: 25, retail: 40, unit: 'প্রতি কেজি' },
        'আম': { wholesale: 40, retail: 70, unit: 'প্রতি কেজি' },
        'কাঁঠাল': { wholesale: 30, retail: 50, unit: 'প্রতি কেজি' },
        'জাম': { wholesale: 50, retail: 80, unit: 'প্রতি কেজি' },
        'কমলা': { wholesale: 25, retail: 40, unit: 'প্রতি কেজি' },
    },

    _DISTRICT_MULTIPLIERS: {
        'ঢাকা': 1.0,
        'চাটগ্রাম': 1.05,
        'রাজশাহী': 0.90,
        'খুলনা': 0.95,
        'সিলেট': 1.08,
        'কক্সবাজার': 1.15,
        'বরিশাল': 1.02,
        'রংপুর': 0.92,
        'ময়মনসিংহ': 0.88,
    },

    _MONTHS_BN: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],

    _TREND_CHARS: '▁▂▃▄▅▆▇█',

    init() {
        this._initialized = true;
    },

    _applyDistrict(base, district) {
        const mult = this._DISTRICT_MULTIPLIERS[district] || 1.0;
        const jitter = () => (Math.random() * 0.04) - 0.02;
        return {
            wholesale: Math.round(base.wholesale * mult * (1 + jitter())),
            retail: Math.round(base.retail * mult * (1 + jitter())),
        };
    },

    async getDailyPrices(district) {
        const result = [];
        for (const [name, data] of Object.entries(this._BASE_PRICES)) {
            const adj = this._applyDistrict(data, district);
            result.push({
                name,
                wholesale: adj.wholesale,
                retail: adj.retail,
                unit: data.unit,
                trend: this._quickTrend(name),
            });
        }
        return result;
    },

    async getCropPrice(cropName, district) {
        const base = this._BASE_PRICES[cropName];
        if (!base) return null;
        const adj = this._applyDistrict(base, district);
        return {
            name: cropName,
            wholesale: adj.wholesale,
            retail: adj.retail,
            unit: base.unit,
            district,
            trend: this._quickTrend(cropName),
        };
    },

    async getPriceTrend(cropName, days) {
        const history = this.getPriceHistory(cropName, days);
        const recent = history.slice(-7);
        const older = history.slice(-14, -7);
        if (recent.length === 0 || older.length === 0) {
            return { direction: 'stable', change: 0, description: 'স্থির' };
        }
        const avgRecent = recent.reduce((s, p) => s + p, 0) / recent.length;
        const avgOlder = older.reduce((s, p) => s + p, 0) / older.length;
        const pct = ((avgRecent - avgOlder) / avgOlder) * 100;
        if (pct > 2) return { direction: 'up', change: Math.round(pct * 10) / 10, description: 'বাড়ছে' };
        if (pct < -2) return { direction: 'down', change: Math.round(pct * 10) / 10, description: 'কমছে' };
        return { direction: 'stable', change: Math.round(pct * 10) / 10, description: 'স্থির' };
    },

    async getWholesaleVsRetail(cropName, district) {
        const price = await this.getCropPrice(cropName, district);
        if (!price) return null;
        const margin = price.retail - price.wholesale;
        const marginPercent = Math.round((margin / price.wholesale) * 100);
        return { wholesale: price.wholesale, retail: price.retail, margin, marginPercent };
    },

    getPriceHistory(cropName, days) {
        const base = this._BASE_PRICES[cropName];
        if (!base) return [];
        const history = [];
        let price = base.retail;
        for (let i = days; i > 0; i--) {
            const drift = (Math.random() - 0.5) * (base.retail * 0.03);
            price = Math.max(base.retail * 0.7, Math.min(base.retail * 1.4, price + drift));
            history.push(Math.round(price));
        }
        return history;
    },

    async getAllCropPrices(district) {
        return this.getDailyPrices(district);
    },

    async getMarketAlerts(district) {
        const alerts = [];
        for (const [name, data] of Object.entries(this._BASE_PRICES)) {
            const current = this._applyDistrict(data, district);
            const baseline = data.retail;
            const change = ((current.retail - baseline) / baseline) * 100;
            if (Math.abs(change) > 10) {
                alerts.push({
                    crop: name,
                    currentPrice: current.retail,
                    change: Math.round(change * 10) / 10,
                    direction: change > 0 ? 'বাড়েছে' : 'কমেছে',
                    unit: data.unit,
                });
            }
        }
        return alerts;
    },

    createPriceWidget(containerId, district) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const districts = Object.keys(this._DISTRICT_MULTIPLIERS);

        container.innerHTML = `
            <div style="font-family:inherit;max-width:700px;margin:0 auto;">
                <h3 style="margin:0 0 8px;color:#2d6a4f;">🌾 বাজার মূল্য তালিকা</h3>
                <div style="margin-bottom:10px;">
                    <label style="font-size:13px;color:#555;">জেলা: </label>
                    <select id="${containerId}-district" style="padding:4px 8px;border:1px solid #ccc;border-radius:4px;">
                        ${districts.map(d => `<option value="${d}" ${d === district ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </div>
                <div id="${containerId}-table"></div>
            </div>
        `;

        const renderTable = async (d) => {
            const prices = await this.getDailyPrices(d);
            const tableDiv = document.getElementById(`${containerId}-table`);
            if (!tableDiv) return;
            tableDiv.innerHTML = `
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                    <thead>
                        <tr style="background:#d8f3dc;">
                            <th style="padding:6px 8px;text-align:left;border-bottom:2px solid #2d6a4f;">ফসল</th>
                            <th style="padding:6px 8px;text-align:right;border-bottom:2px solid #2d6a4f;">পাইকারি (৳)</th>
                            <th style="padding:6px 8px;text-align:right;border-bottom:2px solid #2d6a4f;">খুচরা (৳)</th>
                            <th style="padding:6px 8px;text-align:center;border-bottom:2px solid #2d6a4f;">প্রবণতা</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${prices.map((p, i) => `
                            <tr style="background:${i % 2 === 0 ? '#f8f9fa' : '#fff'};">
                                <td style="padding:5px 8px;border-bottom:1px solid #eee;">${p.name}</td>
                                <td style="padding:5px 8px;text-align:right;border-bottom:1px solid #eee;">${p.wholesale}</td>
                                <td style="padding:5px 8px;text-align:right;border-bottom:1px solid #eee;">${p.retail}</td>
                                <td style="padding:5px 8px;text-align:center;border-bottom:1px solid #eee;">${p.trend}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <p style="font-size:11px;color:#888;margin:6px 0 0;">শেষ হালনাগাদ: ${new Date().toLocaleDateString('bn-BD')}</p>
            `;
        };

        renderTable(district);

        document.getElementById(`${containerId}-district`)?.addEventListener('change', (e) => {
            renderTable(e.target.value);
        });
    },

    createTrendDisplay(priceData) {
        if (!Array.isArray(priceData) || priceData.length === 0) return '';
        const min = Math.min(...priceData);
        const max = Math.max(...priceData);
        const range = max - min || 1;
        return priceData.map(v => {
            const idx = Math.round(((v - min) / range) * 7);
            return this._TREND_CHARS[idx];
        }).join('');
    },

    async compareDistricts(cropName) {
        const results = [];
        for (const [district, mult] of Object.entries(this._DISTRICT_MULTIPLIERS)) {
            const price = await this.getCropPrice(cropName, district);
            if (price) {
                results.push({ district, wholesale: price.wholesale, retail: price.retail });
            }
        }
        results.sort((a, b) => a.retail - b.retail);
        return results;
    },

    async getBestSellingPrice(cropName) {
        let best = null;
        for (const district of Object.keys(this._DISTRICT_MULTIPLIERS)) {
            const price = await this.getCropPrice(cropName, district);
            if (price && (!best || price.retail > best.price)) {
                best = { district, price: price.retail };
            }
        }
        return best;
    },

    _quickTrend(cropName) {
        const seed = cropName.charCodeAt(0) + new Date().getDate();
        const hash = (seed * 9301 + 49297) % 233280;
        const val = hash / 233280;
        if (val > 0.6) return '📈';
        if (val < 0.4) return '📉';
        return '➡️';
    },
};
