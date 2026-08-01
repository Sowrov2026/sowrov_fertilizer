// V22 AI Insights
// Production-ready predictive analytics for Bangladesh agriculture business

// Predict demand
function predictDemand(productHistory, days = 30) {
    if (!productHistory || productHistory.length < 7) {
        return { prediction: 'insufficient_data', confidence: 0, message: 'Minimum 7 data points required' };
    }

    // Simple moving average prediction
    const recent = productHistory.slice(-7);
    const avg = recent.reduce((sum, d) => sum + d.quantity, 0) / recent.length;
    const trend = recent[6].quantity - recent[0].quantity;

    // Weighted moving average for better accuracy
    const weights = [1, 1.5, 2, 2, 2.5, 3, 3.5];
    const weightedSum = recent.reduce((sum, d, i) => sum + d.quantity * weights[i], 0);
    const weightedAvg = weightedSum / weights.reduce((a, b) => a + b, 0);

    // Seasonal adjustment factor
    const month = new Date().getMonth();
    const seasonalFactors = [0.8, 0.7, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.2, 1.1, 0.9, 0.8];
    const seasonalFactor = seasonalFactors[month] || 1;

    const basePrediction = Math.round(weightedAvg + (trend * days / 7));
    const adjustedPrediction = Math.round(basePrediction * seasonalFactor);

    // Confidence calculation
    const variance = recent.reduce((sum, d) => sum + Math.pow(d.quantity - avg, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? stdDev / avg : 1;
    const baseConfidence = Math.max(20, 95 - cv * 100);
    const lengthBonus = Math.min(20, productHistory.length);
    const confidence = Math.round(Math.min(98, baseConfidence + lengthBonus));

    // Determine stock recommendation
    let recommendation = 'maintain_current';
    if (adjustedPrediction > avg * 1.3) {
        recommendation = 'increase_stock';
    } else if (adjustedPrediction < avg * 0.7) {
        recommendation = 'reduce_stock';
    }

    return {
        prediction: adjustedPrediction,
        confidence,
        trend: trend > 2 ? 'increasing' : trend < -2 ? 'decreasing' : 'stable',
        avgDaily: Math.round(avg),
        weightedAvg: Math.round(weightedAvg),
        seasonalFactor,
        volatility: Math.round(stdDev),
        recommendation,
        forecastPeriod: `${days} days`,
        dataPoints: productHistory.length,
    };
}

// Predict disease risk
function predictDiseaseRisk(crop, season, weather) {
    const seasonRisk = {
        'বর্ষা': 0.8,
        'শীত': 0.3,
        'গ্রীষ্ম': 0.5,
        'হাওর': 0.7,
        'monsoon': 0.8,
        'winter': 0.3,
        'summer': 0.5,
        'foggy': 0.7,
    };

    const cropDiseaseRisk = {
        'ধান': { base: 0.5, seasons: { 'বর্ষা': 0.9 } },
        'গম': { base: 0.3, seasons: { 'শীত': 0.4 } },
        'ভুট্টা': { base: 0.4, seasons: { 'গ্রীষ্ম': 0.6 } },
        'আলু': { base: 0.35, seasons: { 'শীত': 0.3 } },
        'পেঁয়াজ': { base: 0.3, seasons: { 'শীত': 0.2 } },
        'tomato': { base: 0.5, seasons: { 'monsoon': 0.8 } },
        'potato': { base: 0.35, seasons: { 'winter': 0.3 } },
    };

    const humidityRisk = weather?.humidity > 80 ? 0.7 : weather?.humidity > 60 ? 0.5 : 0.3;
    const temperatureRisk = weather?.temp > 30 ? 0.6 : weather?.temp > 20 ? 0.4 : 0.2;
    const rainfallRisk = weather?.rainfall > 50 ? 0.8 : weather?.rainfall > 20 ? 0.5 : 0.2;
    const windRisk = weather?.wind > 30 ? 0.3 : weather?.wind > 15 ? 0.2 : 0.1;

    const cropRisk = cropDiseaseRisk[crop] || { base: 0.4, seasons: {} };
    const seasonFactor = cropRisk.seasons[season] || seasonRisk[season] || 0.5;

    const riskFactors = {
        humidity: humidityRisk,
        temperature: temperatureRisk,
        rainfall: rainfallRisk,
        wind: windRisk,
        season: seasonFactor,
        crop: cropRisk.base,
    };

    const weights = { humidity: 0.25, temperature: 0.2, rainfall: 0.2, wind: 0.05, season: 0.2, crop: 0.1 };
    const weightedRisk = Object.entries(riskFactors).reduce(
        (sum, [key, val]) => sum + val * (weights[key] || 0.1), 0
    );

    const riskLevel = weightedRisk > 0.65 ? 'high' : weightedRisk > 0.4 ? 'medium' : 'low';
    const riskScore = Math.round(weightedRisk * 100);

    const recommendations = {
        high: [
            'প্রতিরোধমূলক স্প্রে করুন (Bordeaux mixture)',
            'সংক্রমিত গাছ সরিয়ে ফেলুন',
            'দূরত্ব বজায় রাখুন',
            'রোগ প্রতিরোধী জাত ব্যবহার করুন',
            'মাটি পরিষ্কার রাখুন',
        ],
        medium: [
            'নিয়মিত পর্যবেক্ষণ করুন',
            'সেচ ব্যবস্থা উন্নত করুন',
            'কীটনাশক প্রয়োগ করুন',
        ],
        low: [
            'সাধারণ পর্যবেক্ষণ রাখুন',
            'পুষ্টি ব্যবস্থা ভালো রাখুন',
        ],
    };

    return {
        riskLevel,
        riskScore,
        factors: riskFactors,
        recommendations: recommendations[riskLevel],
        crop,
        season,
        weather: weather || null,
        generatedAt: new Date().toISOString(),
    };
}

// Predict crop yield
function predictCropYield(crop, acreage, conditions) {
    const baseYield = {
        'ধান': 22, 'rice': 22,
        'গম': 10, 'wheat': 10,
        'ভুট্টা': 15, 'maize': 15,
        'আলু': 40, 'potato': 40,
        'পেঁয়াজ': 35, 'onion': 35,
        'সয়াবিন': 12, 'soybean': 12,
        'সরিষা': 8, 'mustard': 8,
        'তুলা': 18, 'cotton': 18,
        'চিনিকলা': 50, 'sugarcane': 50,
    };

    const base = baseYield[crop] || 20;

    // Weather factor calculation
    let weatherFactor = 1.0;
    if (conditions) {
        if (conditions.rainfall === 'normal' || (conditions.rainfallMm >= 200 && conditions.rainfallMm <= 500)) {
            weatherFactor *= 1.1;
        } else if (conditions.rainfall === 'drought' || (conditions.rainfallMm !== undefined && conditions.rainfallMm < 100)) {
            weatherFactor *= 0.7;
        } else if (conditions.rainfall === 'excess' || (conditions.rainfallMm !== undefined && conditions.rainfallMm > 600)) {
            weatherFactor *= 0.8;
        }

        if (conditions.temp >= 20 && conditions.temp <= 30) {
            weatherFactor *= 1.05;
        } else if (conditions.temp > 35) {
            weatherFactor *= 0.85;
        } else if (conditions.temp < 10) {
            weatherFactor *= 0.75;
        }
    }

    // Soil factor
    let soilFactor = 1.0;
    if (conditions?.soil === 'fertile' || conditions?.soilQuality === 'high') {
        soilFactor = 1.15;
    } else if (conditions?.soil === 'poor' || conditions?.soilQuality === 'low') {
        soilFactor = 0.85;
    } else if (conditions?.soil === 'average' || conditions?.soilQuality === 'medium') {
        soilFactor = 1.0;
    }

    // Water availability
    let waterFactor = 1.0;
    if (conditions?.irrigation === 'good' || conditions?.waterAvailability === 'high') {
        waterFactor = 1.1;
    } else if (conditions?.irrigation === 'poor' || conditions?.waterAvailability === 'low') {
        waterFactor = 0.8;
    }

    // Fertilizer factor
    let fertilizerFactor = 1.0;
    if (conditions?.fertilizer === 'optimal') {
        fertilizerFactor = 1.12;
    } else if (conditions?.fertilizer === 'insufficient') {
        fertilizerFactor = 0.85;
    }

    const yieldPerAcre = Math.round(base * weatherFactor * soilFactor * waterFactor * fertilizerFactor);
    const expectedYield = Math.round(yieldPerAcre * acreage);

    // Cost and revenue estimates
    const costPerAcre = {
        seed: base * 5,
        fertilizer: base * 3,
        labor: base * 8,
        irrigation: base * 4,
        other: base * 2,
    };
    const totalCostPerAcre = Object.values(costPerAcre).reduce((a, b) => a + b, 0);
    const pricePerUnit = base * 15;
    const revenuePerAcre = yieldPerAcre * pricePerUnit;
    const profitPerAcre = revenuePerAcre - totalCostPerAcre;

    // Confidence based on data quality
    let confidence = 60;
    if (conditions?.soil) confidence += 5;
    if (conditions?.rainfall) confidence += 5;
    if (conditions?.temp) confidence += 5;
    if (conditions?.irrigation) confidence += 5;
    if (acreage > 5) confidence += 5;
    confidence = Math.min(90, confidence);

    return {
        expectedYield,
        yieldPerAcre,
        acreage,
        crop,
        confidence,
        factors: {
            weatherFactor: Math.round(weatherFactor * 100) / 100,
            soilFactor: Math.round(soilFactor * 100) / 100,
            waterFactor: Math.round(waterFactor * 100) / 100,
            fertilizerFactor: Math.round(fertilizerFactor * 100) / 100,
        },
        financials: {
            costPerAcre: Math.round(totalCostPerAcre),
            revenuePerAcre: Math.round(revenuePerAcre),
            profitPerAcre: Math.round(profitPerAcre),
            totalCost: Math.round(totalCostPerAcre * acreage),
            totalRevenue: Math.round(revenuePerAcre * acreage),
            totalProfit: Math.round(profitPerAcre * acreage),
        },
        generatedAt: new Date().toISOString(),
    };
}

// Weather risk assessment
function assessWeatherRisk(weatherForecast) {
    const risks = [];
    const recommendations = [];

    if (!weatherForecast) {
        return {
            overallRisk: 'unknown',
            risks: [],
            recommendations: ['আবহাওয়ার তথ্য প্রয়োজন'],
            generatedAt: new Date().toISOString(),
        };
    }

    if (weatherForecast.rainfall > 50) {
        risks.push({
            type: 'flood',
            level: weatherForecast.rainfall > 100 ? 'extreme' : 'high',
            description: 'প্রচুর বৃষ্টিপাতের ঝুঁকি',
        });
        recommendations.push('বন্যা প্রতিরোধী ব্যবস্থা নিন', 'জলাবদ্ধতা প্রতিরোধে নিকাশ ব্যবস্থা করুন');
    } else if (weatherForecast.rainfall > 20) {
        risks.push({ type: 'heavy_rain', level: 'medium', description: 'মাঝারি বৃষ্টিপাত' });
        recommendations.push('বৃষ্টির আগে ফসল সংরক্ষণ করুন');
    }

    if (weatherForecast.wind > 40) {
        risks.push({ type: 'storm', level: 'high', description: 'ঝড়ের ঝুঁকি' });
        recommendations.push('ফসলের সমর্থন বাড়ান', 'ঝড় সতর্কতা অনুসরণ করুন');
    } else if (weatherForecast.wind > 25) {
        risks.push({ type: 'wind', level: 'medium', description: 'মাঝারি বাতাস' });
    }

    if (weatherForecast.temp > 40) {
        risks.push({ type: 'drought', level: 'high', description: 'তীব্র খরার ঝুঁকি' });
        recommendations.push('সেচ ব্যবস্থা বাড়ান', 'দিনের বেলা স্প্রে এড়িয়ে চলুন', 'মালচিং করুন');
    } else if (weatherForecast.temp > 35) {
        risks.push({ type: 'heat', level: 'medium', description: 'উচ্চ তাপমাত্রা' });
        recommendations.push('বেশি পানি সরবরাহ করুন');
    }

    if (weatherForecast.temp < 5) {
        risks.push({ type: 'frost', level: 'high', description: 'শীতের শস্যের ঝুঁকি' });
        recommendations.push('শীতের আবরণ ব্যবহার করুন', 'রাতের সময় সেচ দিন');
    } else if (weatherForecast.temp < 10) {
        risks.push({ type: 'cold', level: 'medium', description: 'শীতল আবহাওয়া' });
    }

    if (weatherForecast.humidity > 85) {
        risks.push({ type: 'fungal', level: 'medium', description: 'ছত্রাক রোগের ঝুঁকি' });
        recommendations.push('বাতাস চলাচল নিশ্চিত করুন', 'রোগ প্রতিরোধী স্প্রে করুন');
    }

    if (weatherForecast.uvIndex > 8) {
        risks.push({ type: 'uv', level: 'medium', description: 'তীব্র সূর্যালোক' });
        recommendations.push('সন্ধ্যার সময় সেচ দিন');
    }

    const levelOrder = { extreme: 4, high: 3, medium: 2, low: 1 };
    const maxRisk = risks.reduce((max, r) => {
        return (levelOrder[r.level] || 0) > (levelOrder[max] || 0) ? r.level : max;
    }, 'low');

    return {
        overallRisk: risks.length > 0 ? maxRisk : 'low',
        riskCount: risks.length,
        risks,
        recommendations: [...new Set(recommendations)],
        weather: weatherForecast,
        generatedAt: new Date().toISOString(),
    };
}

// Business growth prediction
function predictBusinessGrowth(salesHistory) {
    if (!salesHistory || salesHistory.length < 3) {
        return { growth: 'unknown', confidence: 0, message: 'Minimum 3 months of data required' };
    }

    const recent = salesHistory.slice(-3);
    const earlier = salesHistory.slice(-6, -3);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : recentAvg;

    const growth = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;

    // Linear regression for better trend
    const n = salesHistory.length;
    const xMean = (n - 1) / 2;
    const yMean = salesHistory.reduce((a, b) => a + b, 0) / n;
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (salesHistory[i] - yMean);
        denominator += (i - xMean) * (i - xMean);
    }
    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = yMean - slope * xMean;

    // R-squared calculation
    const predicted = salesHistory.map((_, i) => intercept + slope * i);
    const ssRes = salesHistory.reduce((sum, y, i) => sum + Math.pow(y - predicted[i], 2), 0);
    const ssTot = salesHistory.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

    // Forecast next 6 months
    const forecast = [];
    for (let i = 1; i <= 6; i++) {
        const value = Math.max(0, Math.round(intercept + slope * (n + i - 1)));
        forecast.push(value);
    }

    let trend;
    if (growth > 10) trend = 'strong_growth';
    else if (growth > 3) trend = 'growing';
    else if (growth > -3) trend = 'stable';
    else if (growth > -10) trend = 'declining';
    else trend = 'strong_decline';

    const confidence = Math.min(90, Math.round(40 + salesHistory.length * 3 + rSquared * 30));

    return {
        growthRate: Math.round(growth * 100) / 100,
        trend,
        confidence,
        monthlyGrowth: Math.round((slope / yMean) * 100 * 100) / 100,
        forecast,
        historicalAvg: Math.round(yMean),
        recentAvg: Math.round(recentAvg),
        trendStrength: Math.round(rSquared * 100),
        dataPoints: n,
        generatedAt: new Date().toISOString(),
    };
}

// Crop price prediction
function predictCropPrice(crop, history) {
    if (!history || history.length < 7) {
        return {
            prediction: 'insufficient_data',
            message: 'Minimum 7 days of price history required',
        };
    }

    const recent = history.slice(-14);
    const latest7 = history.slice(-7);
    const avg = latest7.reduce((a, b) => a + b, 0) / latest7.length;
    const volatility = Math.max(...latest7) - Math.min(...latest7);

    // Simple moving average
    const sma7 = avg;
    const sma14 = recent.reduce((a, b) => a + b, 0) / recent.length;

    // Exponential moving average
    const ema = latest7.reduce((ema, price, i) => {
        const k = 2 / (7 + 1);
        return price * k + ema * (1 - k);
    }, avg);

    // Momentum
    const momentum = latest7[6] - latest7[0];

    // Support and resistance levels
    const sorted = [...latest7].sort((a, b) => a - b);
    const support = sorted[1];
    const resistance = sorted[5];

    // Predict next day
    const predictedPrice = Math.round((sma7 * 0.3 + ema * 0.4 + momentum * 0.1 + avg * 0.2));
    const priceRange = {
        min: Math.round(Math.max(support, predictedPrice - volatility / 2)),
        max: Math.round(Math.min(resistance, predictedPrice + volatility / 2)),
    };

    // Trend analysis
    const recentAvg = latest7.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = latest7.slice(4).reduce((a, b) => a + b, 0) / 3;
    const trendDirection = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

    let trend;
    if (trendDirection > 5) trend = 'rising';
    else if (trendDirection < -5) trend = 'falling';
    else trend = 'stable';

    const volatilityLevel = volatility > avg * 0.25 ? 'high' : volatility > avg * 0.15 ? 'medium' : 'low';

    // Confidence based on data quality
    let confidence = 50;
    if (history.length >= 14) confidence += 10;
    if (history.length >= 30) confidence += 10;
    if (volatilityLevel === 'low') confidence += 10;
    confidence = Math.min(85, confidence);

    // Price recommendation
    let recommendation = 'hold';
    if (trend === 'rising' && predictedPrice > avg * 1.05) recommendation = 'buy';
    else if (trend === 'falling' && predictedPrice < avg * 0.95) recommendation = 'sell';

    return {
        crop,
        predictedPrice,
        priceRange,
        trend,
        trendPercent: Math.round(trendDirection * 100) / 100,
        volatility: volatilityLevel,
        volatilityValue: Math.round(volatility),
        support,
        resistance,
        sma7: Math.round(sma7),
        sma14: Math.round(sma14),
        ema: Math.round(ema),
        momentum: Math.round(momentum),
        recommendation,
        confidence,
        historyLength: history.length,
        generatedAt: new Date().toISOString(),
    };
}

// Netlify function handler
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    try {
        if (event.httpMethod === 'OPTIONS') {
            return { statusCode: 200, headers, body: '' };
        }

        const body = JSON.parse(event.body || '{}');
        const params = new URLSearchParams(event.queryStringParameters || {});
        const action = params.get('action') || body.action;

        let result;

        switch (action) {
            case 'predictDemand':
                result = predictDemand(body.productHistory, body.days);
                break;
            case 'predictDiseaseRisk':
                result = predictDiseaseRisk(body.crop, body.season, body.weather);
                break;
            case 'predictCropYield':
                result = predictCropYield(body.crop, body.acreage, body.conditions);
                break;
            case 'assessWeatherRisk':
                result = assessWeatherRisk(body.weatherForecast);
                break;
            case 'predictBusinessGrowth':
                result = predictBusinessGrowth(body.salesHistory);
                break;
            case 'predictCropPrice':
                result = predictCropPrice(body.crop, body.history);
                break;
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: `Unknown action: ${action}. Available: predictDemand, predictDiseaseRisk, predictCropYield, assessWeatherRisk, predictBusinessGrowth, predictCropPrice` }),
                };
        }

        return { statusCode: 200, headers, body: JSON.stringify(result) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};

module.exports = {
    predictDemand,
    predictDiseaseRisk,
    predictCropYield,
    assessWeatherRisk,
    predictBusinessGrowth,
    predictCropPrice,
};
