function predictDemand(productHistory, days = 30) {
    if (!productHistory || productHistory.length < 7) {
        return { prediction: 'insufficient_data', confidence: 0, message: 'Minimum 7 data points required' };
    }
    const recent = productHistory.slice(-7);
    const avg = recent.reduce((sum, d) => sum + d.quantity, 0) / recent.length;
    const trend = recent[6].quantity - recent[0].quantity;
    const weights = [1, 1.5, 2, 2, 2.5, 3, 3.5];
    const weightedSum = recent.reduce((sum, d, i) => sum + d.quantity * weights[i], 0);
    const weightedAvg = weightedSum / weights.reduce((a, b) => a + b, 0);
    const month = new Date().getMonth();
    const seasonalFactors = [0.8, 0.7, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.2, 1.1, 0.9, 0.8];
    const seasonalFactor = seasonalFactors[month] || 1;
    const basePrediction = Math.round(weightedAvg + (trend * days / 7));
    const adjustedPrediction = Math.round(basePrediction * seasonalFactor);
    const variance = recent.reduce((sum, d) => sum + Math.pow(d.quantity - avg, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? stdDev / avg : 1;
    const confidence = Math.round(Math.min(98, Math.max(20, 95 - cv * 100) + Math.min(20, productHistory.length)));
    let recommendation = 'maintain_current';
    if (adjustedPrediction > avg * 1.3) recommendation = 'increase_stock';
    else if (adjustedPrediction < avg * 0.7) recommendation = 'reduce_stock';
    return {
        prediction: adjustedPrediction, confidence,
        trend: trend > 2 ? 'increasing' : trend < -2 ? 'decreasing' : 'stable',
        avgDaily: Math.round(avg), weightedAvg: Math.round(weightedAvg), seasonalFactor,
        volatility: Math.round(stdDev), recommendation, forecastPeriod: `${days} days`,
        dataPoints: productHistory.length,
    };
}

function predictDiseaseRisk(crop, season, weather) {
    const seasonRisk = { 'বর্ষা': 0.8, 'শীত': 0.3, 'গ্রীষ্ম': 0.5, 'হাওর': 0.7, 'monsoon': 0.8, 'winter': 0.3, 'summer': 0.5, 'foggy': 0.7 };
    const cropDiseaseRisk = {
        'ধান': { base: 0.5, seasons: { 'বর্ষা': 0.9 } }, 'গম': { base: 0.3, seasons: { 'শীত': 0.4 } },
        'ভুট্টা': { base: 0.4, seasons: { 'গ্রীষ্ম': 0.6 } }, 'আলু': { base: 0.35, seasons: { 'শীত': 0.3 } },
        'পেঁয়াজ': { base: 0.3, seasons: { 'শীত': 0.2 } }, 'tomato': { base: 0.5, seasons: { 'monsoon': 0.8 } },
        'potato': { base: 0.35, seasons: { 'winter': 0.3 } },
    };
    const humidityRisk = weather?.humidity > 80 ? 0.7 : weather?.humidity > 60 ? 0.5 : 0.3;
    const temperatureRisk = weather?.temp > 30 ? 0.6 : weather?.temp > 20 ? 0.4 : 0.2;
    const rainfallRisk = weather?.rainfall > 50 ? 0.8 : weather?.rainfall > 20 ? 0.5 : 0.2;
    const windRisk = weather?.wind > 30 ? 0.3 : weather?.wind > 15 ? 0.2 : 0.1;
    const cropRisk = cropDiseaseRisk[crop] || { base: 0.4, seasons: {} };
    const seasonFactor = cropRisk.seasons[season] || seasonRisk[season] || 0.5;
    const riskFactors = { humidity: humidityRisk, temperature: temperatureRisk, rainfall: rainfallRisk, wind: windRisk, season: seasonFactor, crop: cropRisk.base };
    const w = { humidity: 0.25, temperature: 0.2, rainfall: 0.2, wind: 0.05, season: 0.2, crop: 0.1 };
    const weightedRisk = Object.entries(riskFactors).reduce((sum, [key, val]) => sum + val * (w[key] || 0.1), 0);
    const riskLevel = weightedRisk > 0.65 ? 'high' : weightedRisk > 0.4 ? 'medium' : 'low';
    const recommendations = {
        high: ['প্রতিরোধমূলক স্প্রে করুন', 'সংক্রমিত গাছ সরিয়ে ফেলুন', 'দূরত্ব বজায় রাখুন', 'রোগ প্রতিরোধী জাত ব্যবহার করুন'],
        medium: ['নিয়মিত পর্যবেক্ষণ করুন', 'সেচ ব্যবস্থা উন্নত করুন', 'কীটনাশক প্রয়োগ করুন'],
        low: ['সাধারণ পর্যবেক্ষণ রাখুন', 'পুষ্টি ব্যবস্থা ভালো রাখুন'],
    };
    return { riskLevel, riskScore: Math.round(weightedRisk * 100), factors: riskFactors, recommendations: recommendations[riskLevel], crop, season, weather: weather || null, generatedAt: new Date().toISOString() };
}

function predictCropYield(crop, acreage, conditions) {
    const baseYield = { 'ধান': 22, 'rice': 22, 'গম': 10, 'wheat': 10, 'ভুট্টা': 15, 'maize': 15, 'আলু': 40, 'potato': 40, 'পেঁয়াজ': 35, 'onion': 35 };
    const base = baseYield[crop] || 20;
    let weatherFactor = 1.0;
    if (conditions) {
        if (conditions.rainfall === 'normal' || (conditions.rainfallMm >= 200 && conditions.rainfallMm <= 500)) weatherFactor *= 1.1;
        else if (conditions.rainfall === 'drought' || (conditions.rainfallMm !== undefined && conditions.rainfallMm < 100)) weatherFactor *= 0.7;
        else if (conditions.rainfall === 'excess' || (conditions.rainfallMm !== undefined && conditions.rainfallMm > 600)) weatherFactor *= 0.8;
        if (conditions.temp >= 20 && conditions.temp <= 30) weatherFactor *= 1.05;
        else if (conditions.temp > 35) weatherFactor *= 0.85;
        else if (conditions.temp < 10) weatherFactor *= 0.75;
    }
    let soilFactor = conditions?.soil === 'fertile' ? 1.15 : conditions?.soil === 'poor' ? 0.85 : 1.0;
    let waterFactor = conditions?.irrigation === 'good' ? 1.1 : conditions?.irrigation === 'poor' ? 0.8 : 1.0;
    let fertilizerFactor = conditions?.fertilizer === 'optimal' ? 1.12 : conditions?.fertilizer === 'insufficient' ? 0.85 : 1.0;
    const yieldPerAcre = Math.round(base * weatherFactor * soilFactor * waterFactor * fertilizerFactor);
    const expectedYield = Math.round(yieldPerAcre * acreage);
    const totalCostPerAcre = base * 22;
    const revenuePerAcre = yieldPerAcre * base * 15;
    const profitPerAcre = revenuePerAcre - totalCostPerAcre;
    let confidence = 60;
    if (conditions?.soil) confidence += 5;
    if (conditions?.rainfall) confidence += 5;
    if (conditions?.temp) confidence += 5;
    if (conditions?.irrigation) confidence += 5;
    if (acreage > 5) confidence += 5;
    return {
        expectedYield, yieldPerAcre, acreage, crop, confidence: Math.min(90, confidence),
        factors: { weatherFactor: Math.round(weatherFactor * 100) / 100, soilFactor: Math.round(soilFactor * 100) / 100, waterFactor: Math.round(waterFactor * 100) / 100, fertilizerFactor: Math.round(fertilizerFactor * 100) / 100 },
        financials: { totalCost: Math.round(totalCostPerAcre * acreage), totalRevenue: Math.round(revenuePerAcre * acreage), totalProfit: Math.round(profitPerAcre * acreage) },
        generatedAt: new Date().toISOString(),
    };
}

function assessWeatherRisk(weatherForecast) {
    const risks = [];
    const recommendations = [];
    if (!weatherForecast) return { overallRisk: 'unknown', risks: [], recommendations: ['আবহাওয়ার তথ্য প্রয়োজন'], generatedAt: new Date().toISOString() };
    if (weatherForecast.rainfall > 50) { risks.push({ type: 'flood', level: weatherForecast.rainfall > 100 ? 'extreme' : 'high', description: 'প্রচুর বৃষ্টিপাতের ঝুঁকি' }); recommendations.push('বন্যা প্রতিরোধী ব্যবস্থা নিন'); }
    if (weatherForecast.wind > 40) { risks.push({ type: 'storm', level: 'high', description: 'ঝড়ের ঝুঁকি' }); recommendations.push('ফসলের সমর্থন বাড়ান'); }
    if (weatherForecast.temp > 40) { risks.push({ type: 'drought', level: 'high', description: 'তীব্র খরার ঝুঁকি' }); recommendations.push('সেচ ব্যবস্থা বাড়ান'); }
    if (weatherForecast.temp < 5) { risks.push({ type: 'frost', level: 'high', description: 'শীতের শস্যের ঝুঁকি' }); recommendations.push('শীতের আবরণ ব্যবহার করুন'); }
    if (weatherForecast.humidity > 85) { risks.push({ type: 'fungal', level: 'medium', description: 'ছত্রাক রোগের ঝুঁকি' }); recommendations.push('বাতাস চলাচল নিশ্চিত করুন'); }
    const levelOrder = { extreme: 4, high: 3, medium: 2, low: 1 };
    const maxRisk = risks.reduce((max, r) => (levelOrder[r.level] || 0) > (levelOrder[max] || 0) ? r.level : max, 'low');
    return { overallRisk: risks.length > 0 ? maxRisk : 'low', riskCount: risks.length, risks, recommendations: [...new Set(recommendations)], weather: weatherForecast, generatedAt: new Date().toISOString() };
}

function predictBusinessGrowth(salesHistory) {
    if (!salesHistory || salesHistory.length < 3) return { growth: 'unknown', confidence: 0, message: 'Minimum 3 months of data required' };
    const recent = salesHistory.slice(-3);
    const earlier = salesHistory.slice(-6, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : recentAvg;
    const growth = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;
    const n = salesHistory.length;
    const yMean = salesHistory.reduce((a, b) => a + b, 0) / n;
    let numerator = 0, denominator = 0;
    const xMean = (n - 1) / 2;
    for (let i = 0; i < n; i++) { numerator += (i - xMean) * (salesHistory[i] - yMean); denominator += (i - xMean) * (i - xMean); }
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;
    const predicted = salesHistory.map((_, i) => intercept + slope * i);
    const ssRes = salesHistory.reduce((sum, y, i) => sum + Math.pow(y - predicted[i], 2), 0);
    const ssTot = salesHistory.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
    const forecast = [];
    for (let i = 1; i <= 6; i++) forecast.push(Math.max(0, Math.round(intercept + slope * (n + i - 1))));
    let trend;
    if (growth > 10) trend = 'strong_growth';
    else if (growth > 3) trend = 'growing';
    else if (growth > -3) trend = 'stable';
    else if (growth > -10) trend = 'declining';
    else trend = 'strong_decline';
    return {
        growthRate: Math.round(growth * 100) / 100, trend,
        confidence: Math.min(90, Math.round(40 + salesHistory.length * 3 + rSquared * 30)),
        monthlyGrowth: Math.round((slope / yMean) * 100 * 100) / 100,
        forecast, historicalAvg: Math.round(yMean), recentAvg: Math.round(recentAvg),
        trendStrength: Math.round(rSquared * 100), dataPoints: n, generatedAt: new Date().toISOString(),
    };
}

function predictCropPrice(crop, history) {
    if (!history || history.length < 7) return { prediction: 'insufficient_data', message: 'Minimum 7 days of price history required' };
    const latest7 = history.slice(-7);
    const avg = latest7.reduce((a, b) => a + b, 0) / latest7.length;
    const volatility = Math.max(...latest7) - Math.min(...latest7);
    const ema = latest7.reduce((ema, price, i) => { const k = 2 / (7 + 1); return price * k + ema * (1 - k); }, avg);
    const momentum = latest7[6] - latest7[0];
    const sorted = [...latest7].sort((a, b) => a - b);
    const support = sorted[1], resistance = sorted[5];
    const sma7 = avg;
    const predictedPrice = Math.round(sma7 * 0.3 + ema * 0.4 + momentum * 0.1 + avg * 0.2);
    const recentAvg = latest7.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = latest7.slice(4).reduce((a, b) => a + b, 0) / 3;
    const trendDirection = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    let trend;
    if (trendDirection > 5) trend = 'rising';
    else if (trendDirection < -5) trend = 'falling';
    else trend = 'stable';
    let confidence = 50;
    if (history.length >= 14) confidence += 10;
    if (history.length >= 30) confidence += 10;
    if (volatility <= avg * 0.15) confidence += 10;
    let recommendation = 'hold';
    if (trend === 'rising' && predictedPrice > avg * 1.05) recommendation = 'buy';
    else if (trend === 'falling' && predictedPrice < avg * 0.95) recommendation = 'sell';
    return {
        crop, predictedPrice, priceRange: { min: Math.round(Math.max(support, predictedPrice - volatility / 2)), max: Math.round(Math.min(resistance, predictedPrice + volatility / 2)) },
        trend, trendPercent: Math.round(trendDirection * 100) / 100,
        volatility: volatility > avg * 0.25 ? 'high' : volatility > avg * 0.15 ? 'medium' : 'low',
        momentum: Math.round(momentum), recommendation, confidence: Math.min(85, confidence),
        generatedAt: new Date().toISOString(),
    };
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

export async function onRequest(context) {
    const { request } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const url = new URL(request.url);
        const action = url.searchParams.get('action') || body.action;

        let result;
        switch (action) {
            case 'predictDemand': result = predictDemand(body.productHistory, body.days); break;
            case 'predictDiseaseRisk': result = predictDiseaseRisk(body.crop, body.season, body.weather); break;
            case 'predictCropYield': result = predictCropYield(body.crop, body.acreage, body.conditions); break;
            case 'assessWeatherRisk': result = assessWeatherRisk(body.weatherForecast); break;
            case 'predictBusinessGrowth': result = predictBusinessGrowth(body.salesHistory); break;
            case 'predictCropPrice': result = predictCropPrice(body.crop, body.history); break;
            default:
                return new Response(JSON.stringify({ error: `Unknown action: ${action}. Available: predictDemand, predictDiseaseRisk, predictCropYield, assessWeatherRisk, predictBusinessGrowth, predictCropPrice` }), { status: 400, headers: corsHeaders });
        }

        return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
}

export { predictDemand, predictDiseaseRisk, predictCropYield, assessWeatherRisk, predictBusinessGrowth, predictCropPrice };
