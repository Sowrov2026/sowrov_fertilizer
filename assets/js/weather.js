/**
 * SFWeather - Weather Intelligence Module for Bangladesh Farming
 * SF AI V15 - Client-side ES Module
 *
 * Features:
 * - Browser GPS location detection
 * - Manual location entry (District selection)
 * - Open-Meteo API integration (free, no key needed)
 * - Current weather, 24h forecast, 3-day forecast, 7-day forecast
 * - Farming-specific weather advice
 */

const DISTRICT_COORDS = {
    'ঢাকা': { lat: 23.8103, lon: 90.4125 },
    'চট্টগ্রাম': { lat: 22.3569, lon: 91.7832 },
    'রাজশাহী': { lat: 24.3745, lon: 88.6042 },
    'খুলনা': { lat: 22.8456, lon: 89.5403 },
    'সিলেট': { lat: 24.8949, lon: 91.8687 },
    'বরিশাল': { lat: 22.7010, lon: 90.3535 },
    'রংপুর': { lat: 25.7439, lon: 89.2752 },
    'কুমিল্লা': { lat: 23.4607, lon: 91.1809 },
    'ময়মনসিংহ': { lat: 24.7471, lon: 90.4203 },
    'গাজীপুর': { lat: 23.9999, lon: 90.4203 },
    'নারায়ণগঞ্জ': { lat: 23.6239, lon: 90.5000 },
    'যশোর': { lat: 23.1664, lon: 89.2088 },
    'বগুড়া': { lat: 24.8510, lon: 89.3711 },
    'দিনাজপুর': { lat: 25.6217, lon: 88.6354 },
    'কক্সবাজার': { lat: 21.5839, lon: 92.0168 },
    'কিশোরগঞ্জ': { lat: 24.4332, lon: 90.7864 },
    'ফরিদপুর': { lat: 23.5422, lon: 89.8333 },
    'মাদারীপুর': { lat: 23.1664, lon: 90.0000 },
    'মানিকগঞ্জ': { lat: 23.8500, lon: 90.0000 },
    'মুন্সীগঞ্জ': { lat: 23.5422, lon: 90.5000 },
    'তঙ্গী': { lat: 21.7756, lon: 92.3531 },
    'পাবনা': { lat: 24.0000, lon: 89.2500 },
    'সিরাজগঞ্জ': { lat: 24.4539, lon: 89.7000 },
    'নাটোর': { lat: 24.4167, lon: 89.0000 },
    'চাঁদপুর': { lat: 23.2333, lon: 90.6667 },
    'লক্ষ্মীপুর': { lat: 22.9167, lon: 90.8333 },
    'হবিগঞ্জ': { lat: 24.3750, lon: 91.4167 },
    'ব্রাহ্মণবাড়িয়া': { lat: 23.9578, lon: 91.1111 },
    'কুয়েটা': { lat: 23.3333, lon: 91.5000 },
    'বান্দরবান': { lat: 22.1953, lon: 92.2184 },
    'রাঙ্গামাটি': { lat: 22.6333, lon: 92.2000 },
    'খাগড়াডহরি': { lat: 23.0425, lon: 91.9667 },
    'মৌলভীবাজার': { lat: 24.4833, lon: 91.7667 },
    'সুনামগঞ্জ': { lat: 25.0667, lon: 91.4000 },
    'নেত্রকোনা': { lat: 24.8833, lon: 90.7333 },
    'জামালপুর': { lat: 24.9333, lon: 89.9500 },
    'শেরপুর': { lat: 25.0000, lon: 90.0167 },
    'টাঙ্গাইল': { lat: 24.2500, lon: 89.9167 },
    'গোপালঞ্চ': { lat: 23.0000, lon: 89.8333 },
    'বাগেরহাট': { lat: 22.6500, lon: 89.7833 },
    'সাতক্ষীরা': { lat: 22.3500, lon: 89.1167 },
    'মেহেরপুর': { lat: 23.7833, lon: 88.6333 },
    'ঝিনাইদহ': { lat: 23.5422, lon: 89.1500 },
    'কুশ্টিয়া': { lat: 23.9000, lon: 89.1333 },
    'চুয়াডাঙ্গা': { lat: 23.6167, lon: 88.7167 },
    'ঝালকাঠি': { lat: 22.6500, lon: 90.2000 },
    'পটুয়াখালী': { lat: 22.3500, lon: 90.3333 },
    'পিরোজপুর': { lat: 22.5833, lon: 89.9833 },
    'নীলফামারী': { lat: 25.9333, lon: 88.8500 },
    'লালমনিরহাট': { lat: 25.9167, lon: 89.4500 },
    'ঠাকুরগাঁহ': { lat: 26.0333, lon: 88.4667 },
    'পঞ্চগড়': { lat: 26.3333, lon: 88.5500 },
    'জয়পুরহাট': { lat: 25.1000, lon: 89.0167 },
    'নোগাঁ': { lat: 24.8667, lon: 88.9333 },
    'চাঁপাইনবাবগঞ্জ': { lat: 24.5833, lon: 88.2833 }
};

const WEATHER_CODES = {
    0: { en: 'Clear sky', bn: 'পরিষ্কার আকাশ' },
    1: { en: 'Mainly clear', bn: 'মূলত পরিষ্কার' },
    2: { en: 'Partly cloudy', bn: 'আংশিক মেঘলা' },
    3: { en: 'Overcast', bn: 'মেঘলা' },
    45: { en: 'Foggy', bn: 'কুয়াশাচ্ছন্ন' },
    48: { en: 'Rime fog', bn: 'কুয়াশা' },
    51: { en: 'Light drizzle', bn: 'হালকা গুদবি বৃষ্টি' },
    53: { en: 'Moderate drizzle', bn: 'মাঝারি গুদবি বৃষ্টি' },
    55: { en: 'Dense drizzle', bn: 'ঘন গুদবি বৃষ্টি' },
    56: { en: 'Light freezing drizzle', bn: 'হালকা হিমশীত গুদবি বৃষ্টি' },
    57: { en: 'Dense freezing drizzle', bn: 'ঘন হিমশীত গুদবি বৃষ্টি' },
    61: { en: 'Slight rain', bn: 'হালকা বৃষ্টি' },
    63: { en: 'Moderate rain', bn: 'মাঝারি বৃষ্টি' },
    65: { en: 'Heavy rain', bn: 'ভারী বৃষ্টি' },
    66: { en: 'Light freezing rain', bn: 'হালকা হিমশীত বৃষ্টি' },
    67: { en: 'Heavy freezing rain', bn: 'ভারী হিমশীত বৃষ্টি' },
    71: { en: 'Slight snow', bn: 'হালকা তুষারপাত' },
    73: { en: 'Moderate snow', bn: 'মাঝারি তুষারপাত' },
    75: { en: 'Heavy snow', bn: 'ভারী তুষারপাত' },
    77: { en: 'Snow grains', bn: 'তুষার কণা' },
    80: { en: 'Slight rain showers', bn: 'হালকা বৃষ্টির ছিটার' },
    81: { en: 'Moderate rain showers', bn: 'মাঝারি বৃষ্টির ছিটার' },
    82: { en: 'Violent rain showers', bn: 'তীব্র বৃষ্টির ছিটার' },
    85: { en: 'Slight snow showers', bn: 'হালকা তুষার ছিটার' },
    86: { en: 'Heavy snow showers', bn: 'ভারী তুষার ছিটার' },
    95: { en: 'Thunderstorm', bn: 'বজ্রপাত' },
    96: { en: 'Thunderstorm with hail', bn: 'বজ্রপাত ও হালকা বৃষ্টি' },
    99: { en: 'Thunderstorm with heavy hail', bn: 'বজ্রপাত ও ভারী বৃষ্টি' }
};

const API_BASE = 'https://api.open-meteo.com/v1/forecast';

const DISTRICTS = Object.keys(DISTRICT_COORDS);

function getWeatherDescription(code) {
    return WEATHER_CODES[code] || { en: 'Unknown', bn: 'অজানা আবহাওয়া' };
}

function isRaining(code) {
    return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
}

function isHeavyRain(code) {
    return [65, 67, 82, 95, 96, 99].includes(code);
}

function isStormy(code) {
    return [95, 96, 99].includes(code);
}

function parseCurrentWeather(data) {
    const current = data.current;
    const weatherDesc = getWeatherDescription(current.weather_code);
    return {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code,
        weatherDescBn: weatherDesc.bn,
        weatherDescEn: weatherDesc.en,
        isRaining: isRaining(current.weather_code),
        isHeavyRain: isHeavyRain(current.weather_code),
        isStormy: isStormy(current.weather_code),
        time: current.time
    };
}

function parseDailyForecast(data) {
    const daily = data.daily;
    const forecasts = [];
    for (let i = 0; i < daily.time.length; i++) {
        const weatherDesc = getWeatherDescription(daily.weather_code[i]);
        forecasts.push({
            date: daily.time[i],
            tempMax: daily.temperature_2m_max[i],
            tempMin: daily.temperature_2m_min[i],
            precipitationSum: daily.precipitation_sum[i],
            precipitationProbability: daily.precipitation_probability_max[i],
            windSpeedMax: daily.wind_speed_10m_max[i],
            weatherCode: daily.weather_code[i],
            weatherDescBn: weatherDesc.bn,
            weatherDescEn: weatherDesc.en,
            isRaining: isRaining(daily.weather_code[i]),
            isHeavyRain: isHeavyRain(daily.weather_code[i])
        });
    }
    return forecasts;
}

function buildApiUrl(lat, lon, forecastDays = 7) {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code',
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,weather_code',
        timezone: 'Asia/Dhaka',
        forecast_days: forecastDays
    });
    return `${API_BASE}?${params.toString()}`;
}

async function fetchWeatherData(lat, lon, forecastDays = 7) {
    const url = buildApiUrl(lat, lon, forecastDays);
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API ত্রুটি: ${response.status}`);
    }
    return response.json();
}

const SFWeather = {
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('আপনার ব্রাউজার GPS সাপোর্ট করে না'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    const messages = {
                        1: 'অনুমতি প্রত্যাখ্যাত। দয়া করে জেলা নির্বাচন করুন।',
                        2: 'স্থান নির্ণয়ে ত্রুটি। দয়া করে জেলা নির্বাচন করুন।',
                        3: 'সময় শেষ। দয়া করে জেলা নির্বাচন করুন।'
                    };
                    reject(new Error(messages[error.code] || 'স্থান নির্ণয়ে ত্রুটি'));
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
            );
        });
    },

    async getWeatherByCoords(lat, lon) {
        const data = await fetchWeatherData(lat, lon, 7);
        const current = parseCurrentWeather(data);
        const forecast = parseDailyForecast(data);
        return {
            current,
            forecast,
            location: { lat, lon }
        };
    },

    async getWeatherByDistrict(districtName) {
        const coords = DISTRICT_COORDS[districtName];
        if (!coords) {
            throw new Error(`জেলা পাওয়া যায়নি: ${districtName}`);
        }
        const weather = await this.getWeatherByCoords(coords.lat, coords.lon);
        weather.districtName = districtName;
        return weather;
    },

    async getForecast(lat, lon, days = 7) {
        const data = await fetchWeatherData(lat, lon, days);
        return parseDailyForecast(data);
    },

    getFarmingAdvice(weatherData) {
        const { current, forecast } = weatherData;
        const advice = [];
        const temp = current.temperature;
        const humidity = current.humidity;
        const isRaining = current.isRaining;
        const isHeavyRain = current.isHeavyRain;

        if (isHeavyRain) {
            advice.push({
                type: 'warning',
                title: 'ভারী বৃষ্টি সতর্কতা',
                message: 'ভারী বৃষ্টির কারণে মাঠে কাজ করা থেকে বিরত থাকুন। জলজ ফসলের ক্ষতি হতে পারে।',
                icon: 'warning'
            });
        } else if (isRaining) {
            advice.push({
                type: 'info',
                title: 'বৃষ্টির তথ্য',
                message: 'বৃষ্টি চলছে। সার ও কীটনাশক ছিটানো এড়িয়ে চলুন। ভেজা মাঠে হেঁটে চলুন।',
                icon: 'info'
            });
        }

        if (temp > 35) {
            advice.push({
                type: 'warning',
                title: 'তীব্র গরম',
                message: 'তাপমাত্রা ৩৫°C এর উপরে। ফসলের জন্য ছায়া দিন। পর্যাপ্ত পানি দিন।',
                icon: 'warning'
            });
        } else if (temp > 30) {
            advice.push({
                type: 'caution',
                title: 'গরমের পরামর্শ',
                message: 'তাপমাত্রা বেশি। সকাল-বিকেলে সেচ দিন। পলিথিন মাল্চিং ব্যবহার করুন।',
                icon: 'caution'
            });
        } else if (temp < 10) {
            advice.push({
                type: 'warning',
                title: 'শীতের সতর্কতা',
                message: 'তাপমাত্রা কম। শীতকালীন ফসল রক্ষা করুন। পানির প্রয়োজনীয়তা কমান।',
                icon: 'warning'
            });
        }

        if (humidity > 90) {
            advice.push({
                type: 'caution',
                title: 'বেশি আর্দ্রতা',
                message: 'আর্দ্রতা বেশি। ছত্রাক রোগের ঝুঁকি বেশি। প্রতিরোধী স্প্রে করুন।',
                icon: 'caution'
            });
        } else if (humidity < 40) {
            advice.push({
                type: 'info',
                title: 'কম আর্দ্রতা',
                message: 'আর্দ্রতা কম। পর্যাপ্ত সেচ দিন। মাল্চিং ব্যবহার করুন।',
                icon: 'info'
            });
        }

        if (current.windSpeed > 30) {
            advice.push({
                type: 'warning',
                title: 'বাতাসের সতর্কতা',
                message: 'বাতাস জোরালো। লম্বা ফসল (বাঁশ, কলা) বাঁধুন। পলিথিন শিট সংরক্ষণ করুন।',
                icon: 'warning'
            });
        }

        const rainInForecast = forecast.slice(0, 3).some(d => d.precipitationSum > 1);
        const dryInForecast = forecast.slice(0, 3).every(d => d.precipitationSum < 0.5);

        if (rainInForecast && !isRaining) {
            advice.push({
                type: 'tip',
                title: 'আগামীর পরিকল্পনা',
                message: 'আগামী ৩ দিনে বৃষ্টির সম্ভাবনা আছে। সেচ পরিকল্পনা সংশোধন করুন।',
                icon: 'tip'
            });
        }

        if (dryInForecast && !isRaining) {
            advice.push({
                type: 'tip',
                title: 'সেচ পরামর্শ',
                message: 'আগামী ৩ দিনে বৃষ্টির সম্ভাবনা কম। সেচের ব্যবস্থা করুন।',
                icon: 'tip'
            });
        }

        if (advice.length === 0) {
            advice.push({
                type: 'ok',
                title: 'ভালো আবহাওয়া',
                message: 'আবহাওয়া ফসলের জন্য অনুকূল। নিয়মিত যত্ন চালিয়ে যান।',
                icon: 'ok'
            });
        }

        return advice;
    },

    canFertilizeToday(weatherData) {
        const { current, forecast } = weatherData;
        const reasons = [];
        let canFertilize = true;

        if (current.isRaining) {
            canFertilize = false;
            reasons.push('বৃষ্টি চলছে। সার ছিটানো যাবে না।');
        }

        if (current.isHeavyRain) {
            canFertilize = false;
            reasons.push('ভারী বৃষ্টি হচ্ছে। সার ধুয়ে যাবে।');
        }

        if (current.temperature > 35) {
            canFertilize = false;
            reasons.push('তীব্র গরমে সার পোড়াতে পারে।');
        }

        if (current.temperature < 10) {
            canFertilize = false;
            reasons.push('শীতে ফসল সার শোষণ কম করে।');
        }

        if (current.windSpeed > 30) {
            canFertilize = false;
            reasons.push('বাতাস জোরালো। সমানভাবে ছড়ানো সম্ভব হবে না।');
        }

        if (forecast.length > 0 && forecast[0].precipitationProbability > 80) {
            canFertilize = false;
            reasons.push('আজ বৃষ্টির সম্ভাবনা বেশি। আগামীকাল সার দিন।');
        }

        const nextRain = forecast.findIndex(d => d.precipitationSum > 1);
        if (nextRain === 0 && canFertilize) {
            reasons.push('আজ বৃষ্টি হতে পারে। সার দিলে ধুয়ে যেতে পারে।');
        }

        if (canFertilize && reasons.length === 0) {
            reasons.push('আজ সার দেওয়ার জন্য ভালো সময়।');
        }

        return { canFertilize, reasons };
    },

    needsIrrigation(weatherData, soilType = 'মাটি', lastRain = null) {
        const { current, forecast } = weatherData;
        const needsWater = [];
        let urgency = 'low';

        if (current.isRaining) {
            return {
                needsWater: false,
                urgency: 'none',
                reasons: ['বৃষ্টি চলছে। সেচের প্রয়োজন নেই।']
            };
        }

        if (current.humidity > 80) {
            return {
                needsWater: false,
                urgency: 'low',
                reasons: ['আর্দ্রতা বেশি। সেচের প্রয়োজন নেই।']
            };
        }

        const daysSinceRain = lastRain
            ? Math.floor((Date.now() - new Date(lastRain)) / 86400000)
            : null;

        if (daysSinceRain !== null && daysSinceRain > 5) {
            urgency = 'high';
            needsWater.push(`${daysSinceRain} দিন ধরে বৃষ্টি হয়নি।`);
        } else if (daysSinceRain !== null && daysSinceRain > 3) {
            urgency = 'medium';
            needsWater.push(`${daysSinceRain} দিন ধরে বৃষ্টি হয়নি।`);
        }

        const rainInForecast = forecast.slice(0, 3).find(d => d.precipitationSum > 2);
        if (rainInForecast) {
            if (needsWater.length === 0) {
                needsWater.push('আগামী ৩ দিনে বৃষ্টির সম্ভাবনা আছে।');
            }
        } else {
            needsWater.push('আগামী ৩ দিনে বৃষ্টির সম্ভাবনা কম।');
            if (urgency === 'low') urgency = 'medium';
        }

        if (current.temperature > 32) {
            needsWater.push('তাপমাত্রা বেশি। পানির চাহিদা বাড়বে।');
            if (urgency === 'low') urgency = 'medium';
        }

        if (soilType === 'বালুকাময়') {
            needsWater.push('বালুকাময় মাটিতে পানি দ্রুত শুকায়।');
            if (urgency !== 'high') urgency = 'medium';
        }

        const hourlyRain = forecast[0] && forecast[0].precipitationProbability > 50;
        if (hourlyRain && urgency !== 'high') {
            needsWater.push('সন্ধ্যায় বৃষ্টি হতে পারে। বিকেলে সেচ দিন।');
        }

        return {
            needsWater: needsWater.length > 0,
            urgency,
            reasons: needsWater
        };
    },

    getDiseaseRisk(weatherData) {
        const { current, forecast } = weatherData;
        const risks = [];
        let overallRisk = 'low';

        if (current.humidity > 85 && current.temperature > 25 && current.temperature < 35) {
            risks.push({
                disease: 'পাতা ঝলসানো',
                risk: 'high',
                detail: 'বেশি আর্দ্রতা ও উষ্ণতায় ছত্রাক রোগ বাড়ে।'
            });
        }

        if (current.humidity > 90 && current.temperature > 28) {
            risks.push({
                disease: 'বাকা রোগ',
                risk: 'high',
                detail: 'বেশি আর্দ্রতায় ধানের বাকা রোগ বাড়ে।'
            });
        }

        if (forecast.slice(0, 3).some(d => d.precipitationSum > 5 && d.tempMin > 20)) {
            risks.push({
                disease: 'লাল বা বাদামী পাতার দাগ',
                risk: 'medium',
                detail: 'বৃষ্টির পর মাঝারি তাপমাত্রায় দাগ রোগ বাড়ে।'
            });
        }

        if (current.humidity < 50 && current.temperature > 35) {
            risks.push({
                disease: 'শুষ্ক আবহাওয়ার রোগ',
                risk: 'low',
                detail: 'শুষ্ক আবহাওয়ায় কিছু রোগের ঝুঁকি কমে।'
            });
        }

        if (risks.length > 0) {
            const highRisks = risks.filter(r => r.risk === 'high').length;
            const mediumRisks = risks.filter(r => r.risk === 'medium').length;
            if (highRisks > 0) overallRisk = 'high';
            else if (mediumRisks > 0) overallRisk = 'medium';
        }

        return { overallRisk, risks };
    },

    getPestRisk(weatherData) {
        const { current, forecast } = weatherData;
        const risks = [];
        let overallRisk = 'low';

        if (current.temperature > 25 && current.temperature < 35 && current.humidity > 70) {
            risks.push({
                pest: 'পোকা',
                risk: 'high',
                detail: 'উষ্ণ ও আর্দ্র আবহাওয়ায় পোকা বাড়ে।'
            });
        }

        if (current.temperature > 30 && current.humidity > 80) {
            risks.push({
                pest: 'মশা',
                risk: 'high',
                detail: 'বেশি আর্দ্রতায় মশা বাড়ে।'
            });
        }

        if (forecast.slice(0, 3).some(d => d.tempMin > 15 && d.precipitationSum > 0)) {
            risks.push({
                pest: 'পিঁপড়া',
                risk: 'medium',
                detail: 'বৃষ্টির পর পিঁপড়া সক্রিয় হয়।'
            });
        }

        if (current.windSpeed > 20) {
            risks.push({
                pest: 'বাতাস চালিত পোকা',
                risk: 'low',
                detail: 'বাতাসে কিছু পোকা ছড়িয়ে পড়তে পারে।'
            });
        }

        if (risks.length > 0) {
            const highRisks = risks.filter(r => r.risk === 'high').length;
            const mediumRisks = risks.filter(r => r.risk === 'medium').length;
            if (highRisks > 0) overallRisk = 'high';
            else if (mediumRisks > 0) overallRisk = 'medium';
        }

        return { overallRisk, risks };
    },

    getWeatherImpact(weatherData) {
        const { current, forecast } = weatherData;
        const impacts = [];

        if (current.isHeavyRain) {
            impacts.push({ area: 'ফসল সংগ্রহ', impact: 'negative', detail: 'ভারী বৃষ্টিতে ফসল ক্ষতিগ্রস্ত হতে পারে।' });
            impacts.push({ area: 'মাটি', impact: 'negative', detail: 'প্রচুর পানিতে মাটি ক্ষয় হতে পারে।' });
        } else if (current.isRaining) {
            impacts.push({ area: 'ফসল', impact: 'positive', detail: 'বৃষ্টির পানি ফসলের জন্য উপকারী।' });
        }

        if (current.temperature > 35) {
            impacts.push({ area: 'ফসল', impact: 'negative', detail: 'তীব্র গরমে ফসল পোড়াতে পারে।' });
            impacts.push({ area: 'পানি', impact: 'negative', detail: 'বেশি পানি দরকার হবে।' });
        }

        if (current.windSpeed > 30) {
            impacts.push({ area: 'ফসল', impact: 'negative', detail: 'বাতাসে ফসল ভেঙে যেতে পারে।' });
        }

        const totalRain3Days = forecast.slice(0, 3).reduce((sum, d) => sum + d.precipitationSum, 0);
        if (totalRain3Days > 50) {
            impacts.push({ area: 'বন্যা', impact: 'negative', detail: 'প্রচুর বৃষ্টিতে বন্যা হতে পারে।' });
        } else if (totalRain3Days > 20) {
            impacts.push({ area: 'সেচ', impact: 'positive', detail: 'পর্যাপ্ত বৃষ্টি সেচের চাপ কমাবে।' });
        }

        if (current.humidity > 90) {
            impacts.push({ area: 'রোগ', impact: 'negative', detail: 'বেশি আর্দ্রতায় ছত্রাক রোগ বাড়বে।' });
        }

        if (impacts.length === 0) {
            impacts.push({ area: 'সামগ্রিক', impact: 'neutral', detail: 'আবহাওয়া ফসলের জন্য অনুকূল।' });
        }

        return impacts;
    },

    createWeatherWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`কন্টেইনার পাওয়া যায়নি: ${containerId}`);
            return;
        }

        container.innerHTML = `
            <style>
                .sf-weather-widget {
                    font-family: 'Hind Siliguri', 'SolaimanLipi', sans-serif;
                    background: linear-gradient(135deg, #1a5276 0%, #2e86c1 100%);
                    border-radius: 16px;
                    padding: 20px;
                    color: white;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                    max-width: 500px;
                    margin: 0 auto;
                }
                .sf-weather-header {
                    text-align: center;
                    margin-bottom: 16px;
                }
                .sf-weather-header h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                }
                .sf-weather-selector {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                    flex-wrap: wrap;
                }
                .sf-weather-selector select,
                .sf-weather-selector button {
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: none;
                    font-family: inherit;
                    font-size: 0.9rem;
                }
                .sf-weather-selector select {
                    flex: 1;
                    min-width: 150px;
                    background: rgba(255,255,255,0.95);
                    color: #1a5276;
                }
                .sf-weather-selector button {
                    background: #e74c3c;
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                    transition: background 0.2s;
                }
                .sf-weather-selector button:hover {
                    background: #c0392b;
                }
                .sf-weather-selector button:disabled {
                    background: #95a5a6;
                    cursor: not-allowed;
                }
                .sf-weather-current {
                    background: rgba(255,255,255,0.15);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    backdrop-filter: blur(10px);
                }
                .sf-weather-temp {
                    font-size: 2.5rem;
                    font-weight: 700;
                    text-align: center;
                }
                .sf-weather-desc {
                    text-align: center;
                    font-size: 1rem;
                    opacity: 0.9;
                    margin-bottom: 12px;
                }
                .sf-weather-details {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    text-align: center;
                }
                .sf-weather-detail-item {
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 8px 4px;
                }
                .sf-weather-detail-label {
                    font-size: 0.7rem;
                    opacity: 0.8;
                    margin-bottom: 2px;
                }
                .sf-weather-detail-value {
                    font-size: 0.95rem;
                    font-weight: 600;
                }
                .sf-weather-forecast {
                    margin-top: 16px;
                }
                .sf-weather-forecast h4 {
                    margin: 0 0 8px 0;
                    font-size: 0.95rem;
                    opacity: 0.9;
                }
                .sf-weather-forecast-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }
                .sf-weather-forecast-day {
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 10px 6px;
                    text-align: center;
                }
                .sf-weather-forecast-day-name {
                    font-size: 0.75rem;
                    opacity: 0.8;
                    margin-bottom: 4px;
                }
                .sf-weather-forecast-icon {
                    font-size: 1.5rem;
                    margin-bottom: 4px;
                }
                .sf-weather-forecast-temp {
                    font-size: 0.85rem;
                }
                .sf-weather-forecast-temp span {
                    opacity: 0.7;
                }
                .sf-weather-advice {
                    margin-top: 16px;
                }
                .sf-weather-advice h4 {
                    margin: 0 0 8px 0;
                    font-size: 0.95rem;
                    opacity: 0.9;
                }
                .sf-weather-advice-item {
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 10px 12px;
                    margin-bottom: 6px;
                    font-size: 0.85rem;
                    border-left: 3px solid;
                }
                .sf-weather-advice-item.warning { border-color: #e74c3c; }
                .sf-weather-advice-item.caution { border-color: #f39c12; }
                .sf-weather-advice-item.info { border-color: #3498db; }
                .sf-weather-advice-item.tip { border-color: #2ecc71; }
                .sf-weather-advice-item.ok { border-color: #27ae60; }
                .sf-weather-advice-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .sf-weather-loading {
                    text-align: center;
                    padding: 40px;
                    opacity: 0.8;
                }
                .sf-weather-loading .spinner {
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: sf-spin 1s linear infinite;
                    margin: 0 auto 12px;
                }
                @keyframes sf-spin {
                    to { transform: rotate(360deg); }
                }
                .sf-weather-error {
                    text-align: center;
                    padding: 20px;
                    background: rgba(231,76,60,0.2);
                    border-radius: 8px;
                    font-size: 0.9rem;
                }
                .sf-weather-location-name {
                    text-align: center;
                    font-size: 0.85rem;
                    opacity: 0.8;
                    margin-bottom: 8px;
                }
            </style>
            <div class="sf-weather-widget">
                <div class="sf-weather-header">
                    <h3>🌾 আবহাওয়ার তথ্য</h3>
                </div>
                <div class="sf-weather-selector">
                    <select id="sf-weather-district-select">
                        <option value="">জেলা নির্বাচন করুন</option>
                        ${DISTRICTS.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                    <button id="sf-weather-gps-btn" title="GPS দিয়ে স্থান নির্ণয়">📍 লোকেশন</button>
                </div>
                <div id="sf-weather-content">
                    <div class="sf-weather-loading">
                        <div class="spinner"></div>
                        <div>আবহাওয়ার তথ্য লোড হচ্ছে...</div>
                    </div>
                </div>
            </div>
        `;

        const districtSelect = document.getElementById('sf-weather-district-select');
        const gpsBtn = document.getElementById('sf-weather-gps-btn');
        const contentDiv = document.getElementById('sf-weather-content');

        const self = this;

        function getWeatherIcon(code) {
            if (code === 0) return '☀️';
            if (code <= 3) return '⛅';
            if (code === 45 || code === 48) return '🌫️';
            if (code >= 51 && code <= 67) return '🌧️';
            if (code >= 71 && code <= 77) return '❄️';
            if (code >= 80 && code <= 82) return '🌦️';
            if (code >= 85 && code <= 86) return '🌨️';
            if (code >= 95) return '⛈️';
            return '🌤️';
        }

        function formatDate(dateStr) {
            const date = new Date(dateStr);
            const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
            return days[date.getDay()];
        }

        function renderCurrentWeather(current, districtName) {
            return `
                <div class="sf-weather-location-name">
                    ${districtName ? '📍 ' + districtName : ''}
                </div>
                <div class="sf-weather-current">
                    <div class="sf-weather-temp">${current.temperature}°C</div>
                    <div class="sf-weather-desc">${current.weatherDescBn}</div>
                    <div class="sf-weather-details">
                        <div class="sf-weather-detail-item">
                            <div class="sf-weather-detail-label">আর্দ্রতা</div>
                            <div class="sf-weather-detail-value">${current.humidity}%</div>
                        </div>
                        <div class="sf-weather-detail-item">
                            <div class="sf-weather-detail-label">বাতাস</div>
                            <div class="sf-weather-detail-value">${current.windSpeed} km/h</div>
                        </div>
                        <div class="sf-weather-detail-item">
                            <div class="sf-weather-detail-label">বৃষ্টি</div>
                            <div class="sf-weather-detail-value">${current.precipitation} mm</div>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderForecast(forecast) {
            const days = forecast.slice(0, 3);
            return `
                <div class="sf-weather-forecast">
                    <h4>📅 ৩ দিনের পূর্বাভাস</h4>
                    <div class="sf-weather-forecast-grid">
                        ${days.map(day => `
                            <div class="sf-weather-forecast-day">
                                <div class="sf-weather-forecast-day-name">${formatDate(day.date)}</div>
                                <div class="sf-weather-forecast-icon">${getWeatherIcon(day.weatherCode)}</div>
                                <div class="sf-weather-forecast-temp">
                                    ${day.tempMax}° <span>/ ${day.tempMin}°</span>
                                </div>
                                <div class="sf-weather-detail-label">${day.precipitationProbability}% বৃষ্টি</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        function renderAdvice(advice) {
            if (advice.length === 0) return '';
            return `
                <div class="sf-weather-advice">
                    <h4>🌱 কৃষি পরামর্শ</h4>
                    ${advice.map(a => `
                        <div class="sf-weather-advice-item ${a.type}">
                            <div class="sf-weather-advice-title">${a.title}</div>
                            <div>${a.message}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        function renderError(message) {
            return `<div class="sf-weather-error">⚠️ ${message}</div>`;
        }

        function showLoading() {
            contentDiv.innerHTML = `
                <div class="sf-weather-loading">
                    <div class="spinner"></div>
                    <div>আবহাওয়ার তথ্য লোড হচ্ছে...</div>
                </div>
            `;
        }

        async function loadWeather(lat, lon, districtName) {
            showLoading();
            try {
                const weatherData = await self.getWeatherByCoords(lat, lon);
                const advice = self.getFarmingAdvice(weatherData);
                contentDiv.innerHTML =
                    renderCurrentWeather(weatherData.current, districtName) +
                    renderForecast(weatherData.forecast) +
                    renderAdvice(advice);
            } catch (err) {
                contentDiv.innerHTML = renderError(err.message || 'আবহাওয়ার তথ্য আনতে ত্রুটি হয়েছে।');
            }
        }

        districtSelect.addEventListener('change', () => {
            const district = districtSelect.value;
            if (district && DISTRICT_COORDS[district]) {
                const coords = DISTRICT_COORDS[district];
                loadWeather(coords.lat, coords.lon, district);
            }
        });

        gpsBtn.addEventListener('click', async () => {
            gpsBtn.disabled = true;
            gpsBtn.textContent = '⏳ অনুসন্ধান...';
            try {
                const loc = await self.getCurrentLocation();
                loadWeather(loc.lat, loc.lon, '');
                districtSelect.value = '';
            } catch (err) {
                contentDiv.innerHTML = renderError(err.message);
            } finally {
                gpsBtn.disabled = false;
                gpsBtn.textContent = '📍 লোকেশন';
            }
        });

        if (DISTRICT_COORDS['ঢাকা']) {
            loadWeather(DISTRICT_COORDS['ঢাকা'].lat, DISTRICT_COORDS['ঢাকা'].lon, 'ঢাকা');
            districtSelect.value = 'ঢাকা';
        }
    },

    getDistrictCoords(districtName) {
        return DISTRICT_COORDS[districtName] || null;
    }
};

export { SFWeather };
