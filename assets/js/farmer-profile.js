// ==========================================
// SF AI V16 — Farmer Profile Module
// ==========================================

import { db } from './firebase.js';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    arrayUnion,
    increment
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

// ==========================================
// Profile Schema
// ==========================================
const DEFAULT_PROFILE = {
    uid: '',
    name: '',
    phone: '',
    district: '',
    upazila: '',
    village: '',
    farmSize: 0,
    farmSizeUnit: 'acre',
    landType: '',
    crops: [],
    cropHistory: [],
    purchaseHistory: [],
    diseaseHistory: [],
    preferredProducts: [],
    preferredLanguage: 'bangla',
    preferredDialect: null,
    soilTestResults: null,
    createdAt: null,
    updatedAt: null
};

// ==========================================
// Crop Seasons
// ==========================================
const CROP_SEASONS = {
    boro: { name: 'বোরো', months: [11, 0, 1, 2, 3, 4] },
    aus: { name: 'আউস', months: [3, 4, 5, 6] },
    aman: { name: 'আমন', months: [5, 6, 7, 8, 9, 10] },
    rabi: { name: 'রবি', months: [10, 11, 0, 1, 2, 3] },
    kharif: { name: 'খরিফ', months: [4, 5, 6, 7, 8, 9] }
};

// ==========================================
// Land Types (Bangla)
// ==========================================
const LAND_TYPES = [
    'দোআঁশ',
    'এঁটেল',
    'বেলে',
    'কালো',
    'পলি',
    'চিকন',
    'দোমাটি',
    'বালুকাময়'
];

// ==========================================
// Recommended Products by Crop & Disease
// ==========================================
const RECOMMENDATIONS_DB = {
    rice: {
        diseases: {
            'ব্লাস্ট': ['ট্রাইসাইক্লাজল', 'আইসোপ্রোথিওলান', '�ারবেন্ডাজিম'],
            'ব্রাউন ব্লাচ': ['ট্রাইসাইক্লাজল', 'প্রোপিকোনাজল'],
            'শিথ ব্লাচ': ['ম্যানকোজেব', 'কারবেন্ডাজিম'],
            'হিমন্তী': ['ম্যানকোজেব', 'ট্রাইসাইক্লাজল'],
            'কার্ক': ['কপার অক্সিক্লোরাইড', 'ম্যানকোজেব']
        },
        nutrients: {
            'N': 'ইউরিয়া',
            'P': 'টিএসপি',
            'K': 'এমওপি',
            'Zn': 'জিঙ্ক সালফেট'
        }
    },
    wheat: {
        diseases: {
            'লাল চিটা': ['প্রোপিকোনাজল', 'টেবুকোনাজল'],
            'কালো চিটা': ['ম্যানকোজেব', 'কারবেন্ডাজিম'],
            'পাউডারী মিলডিউ': 'সালফার'
        }
    },
    potato: {
        diseases: {
            'আলটারনেরিয়া': ['ম্যানকোজেব', 'আজকোক্সিস্ট্রোবিন'],
            'লেট ব্লাইট': ['মেটালাক্সিল', 'ম্যানকোজেব'],
            'আরলি ব্লাইট': ['ক্লোরোথালোনিল', 'ম্যানকোজেব']
        }
    },
    tomato: {
        diseases: {
            'লিফ কার্ল': ['ইমিডাক্লোপ্রিড', 'নিম তেল'],
            'লেট ব্লাইট': ['মেটালাক্সিল', 'ম্যানকোজেব'],
            'ফল রট': '�পার অক্সিক্লোরাইড'
        }
    },
    onion: {
        diseases: {
            'লিফ ব্লাইট': ['ম্যানকোজেব', 'কারবেন্ডাজিম'],
            'ডাউনি মিলডিউ': ['মেটালাক্সিল', 'ফসিটাল-অ্যালুমিনিয়াম']
        }
    }
};

// ==========================================
// Helper Functions
// ==========================================

function generateLocalId() {
    return 'sf_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

function getStorageUserId() {
    return localStorage.getItem('sf_farmer_uid') || null;
}

function setStorageUserId(uid) {
    localStorage.setItem('sf_farmer_uid', uid);
}

function getCurrentSeason() {
    const month = new Date().getMonth();
    for (const [key, season] of Object.entries(CROP_SEASONS)) {
        if (season.months.includes(month)) {
            return { key, ...season };
        }
    }
    return { key: 'unknown', name: 'অজানা', months: [] };
}

function getSeasonForDate(date) {
    const month = new Date(date).getMonth();
    for (const [key, season] of Object.entries(CROP_SEASONS)) {
        if (season.months.includes(month)) {
            return { key, ...season };
        }
    }
    return { key: 'unknown', name: 'অজানা', months: [] };
}

// ==========================================
// Main Module
// ==========================================
export const SFFarmerProfile = {

    /**
     * Initialize the farmer profile module
     */
    async init() {
        const userId = getStorageUserId();
        if (userId) {
            try {
                const profile = await this.getProfile(userId);
                if (profile) {
                    console.log('[SFFarmerProfile] Profile loaded for:', profile.name || userId);
                    return profile;
                }
            } catch (error) {
                console.warn('[SFFarmerProfile] Failed to load profile:', error.message);
            }
        }
        return null;
    },

    /**
     * Get existing profile or create new one
     */
    async getOrCreateProfile(userId) {
        if (!userId) {
            userId = generateLocalId();
            setStorageUserId(userId);
        }

        let profile = await this.getProfile(userId);

        if (!profile) {
            profile = {
                ...DEFAULT_PROFILE,
                uid: userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            try {
                const profileRef = doc(db, 'farmer_profiles', userId);
                await setDoc(profileRef, profile);
                console.log('[SFFarmerProfile] New profile created:', userId);
            } catch (error) {
                console.error('[SFFarmerProfile] Failed to create profile:', error.message);
                localStorage.setItem(`sf_profile_${userId}`, JSON.stringify(profile));
            }
        }

        return profile;
    },

    /**
     * Get profile by user ID
     */
    async getProfile(userId) {
        if (!userId) return null;

        try {
            const profileRef = doc(db, 'farmer_profiles', userId);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                return { id: profileSnap.id, ...profileSnap.data() };
            }
        } catch (error) {
            console.warn('[SFFarmerProfile] Firestore read failed, checking local:', error.message);
        }

        const localData = localStorage.getItem(`sf_profile_${userId}`);
        if (localData) {
            try {
                return JSON.parse(localData);
            } catch {
                return null;
            }
        }

        return null;
    },

    /**
     * Update profile data
     */
    async updateProfile(userId, data) {
        if (!userId || !data) return false;

        const updateData = {
            ...data,
            updatedAt: new Date().toISOString()
        };

        try {
            const profileRef = doc(db, 'farmer_profiles', userId);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                await updateDoc(profileRef, updateData);
            } else {
                await setDoc(profileRef, {
                    ...DEFAULT_PROFILE,
                    ...updateData,
                    uid: userId,
                    createdAt: new Date().toISOString()
                });
            }

            console.log('[SFFarmerProfile] Profile updated:', userId);
            return true;
        } catch (error) {
            console.error('[SFFarmerProfile] Update failed:', error.message);

            const localData = localStorage.getItem(`sf_profile_${userId}`);
            const localProfile = localData ? JSON.parse(localData) : { ...DEFAULT_PROFILE, uid: userId };
            localStorage.setItem(`sf_profile_${userId}`, JSON.stringify({ ...localProfile, ...updateData }));
            return true;
        }
    },

    /**
     * Add crop history entry
     */
    async addCropHistory(userId, crop, season, year) {
        if (!userId || !crop) return false;

        const entry = {
            crop: crop,
            season: season || getCurrentSeason().key,
            year: year || new Date().getFullYear(),
            seasonName: (CROP_SEASONS[season] || getCurrentSeason()).name,
            dateAdded: new Date().toISOString()
        };

        try {
            const profileRef = doc(db, 'farmer_profiles', userId);
            await updateDoc(profileRef, {
                cropHistory: arrayUnion(entry),
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.warn('[SFFarmerProfile] Firestore update failed, saving locally:', error.message);

            const profile = await this.getProfile(userId);
            if (profile) {
                profile.cropHistory = [...(profile.cropHistory || []), entry];
                profile.updatedAt = new Date().toISOString();
                localStorage.setItem(`sf_profile_${userId}`, JSON.stringify(profile));
            }
            return true;
        }
    },

    /**
     * Add disease history entry
     */
    async addDiseaseHistory(userId, crop, disease, date) {
        if (!userId || !crop || !disease) return false;

        const entry = {
            crop: crop,
            disease: disease,
            date: date || new Date().toISOString(),
            dateAdded: new Date().toISOString()
        };

        try {
            const profileRef = doc(db, 'farmer_profiles', userId);
            await updateDoc(profileRef, {
                diseaseHistory: arrayUnion(entry),
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.warn('[SFFarmerProfile] Firestore update failed, saving locally:', error.message);

            const profile = await this.getProfile(userId);
            if (profile) {
                profile.diseaseHistory = [...(profile.diseaseHistory || []), entry];
                profile.updatedAt = new Date().toISOString();
                localStorage.setItem(`sf_profile_${userId}`, JSON.stringify(profile));
            }
            return true;
        }
    },

    /**
     * Add purchase history entry
     */
    async addPurchaseHistory(userId, product, date) {
        if (!userId || !product) return false;

        const entry = {
            product: product,
            date: date || new Date().toISOString(),
            dateAdded: new Date().toISOString()
        };

        try {
            const profileRef = doc(db, 'farmer_profiles', userId);
            await updateDoc(profileRef, {
                purchaseHistory: arrayUnion(entry),
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.warn('[SFFarmerProfile] Firestore update failed, saving locally:', error.message);

            const profile = await this.getProfile(userId);
            if (profile) {
                profile.purchaseHistory = [...(profile.purchaseHistory || []), entry];
                profile.updatedAt = new Date().toISOString();
                localStorage.setItem(`sf_profile_${userId}`, JSON.stringify(profile));
            }
            return true;
        }
    },

    /**
     * Get crops by season
     */
    async getSeasonalCrops(userId) {
        const profile = await this.getProfile(userId);
        if (!profile || !profile.cropHistory) return {};

        const seasonal = {};
        for (const entry of profile.cropHistory) {
            const seasonKey = entry.season || 'unknown';
            if (!seasonal[seasonKey]) {
                seasonal[seasonKey] = {
                    name: (CROP_SEASONS[seasonKey] || { name: 'অজানা' }).name,
                    crops: [],
                    years: new Set()
                };
            }
            seasonal[seasonKey].crops.push(entry.crop);
            if (entry.year) seasonal[seasonKey].years.add(entry.year);
        }

        for (const key of Object.keys(seasonal)) {
            seasonal[key].years = Array.from(seasonal[key].years).sort((a, b) => b - a);
            seasonal[key].crops = [...new Set(seasonal[key].crops)];
        }

        return seasonal;
    },

    /**
     * Get personalized recommendations based on profile
     */
    async getRecommendations(userId) {
        const profile = await this.getProfile(userId);
        if (!profile) return { products: [], advice: [] };

        const recommendations = {
            products: [],
            diseaseAlerts: [],
            seasonalTips: [],
            nutrientAdvice: []
        };

        const currentSeason = getCurrentSeason();

        if (profile.crops && profile.crops.length > 0) {
            for (const crop of profile.crops) {
                const cropLower = crop.toLowerCase();

                if (RECOMMENDATIONS_DB[cropLower]) {
                    const cropRecs = RECOMMENDATIONS_DB[cropLower];

                    if (profile.diseaseHistory && profile.diseaseHistory.length > 0) {
                        const recentDiseases = profile.diseaseHistory
                            .filter(d => d.crop.toLowerCase() === cropLower)
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .slice(0, 3);

                        for (const diseaseEntry of recentDiseases) {
                            const diseaseName = diseaseEntry.disease;
                            if (cropRecs.diseases && cropRecs.diseases[diseaseName]) {
                                const products = cropRecs.diseases[diseaseName];
                                recommendations.diseaseAlerts.push({
                                    crop: crop,
                                    disease: diseaseName,
                                    recommendedProducts: Array.isArray(products) ? products : [products],
                                    lastOccurrence: diseaseEntry.date
                                });
                            }
                        }
                    }

                    if (cropRecs.nutrients) {
                        for (const [nutrient, product] of Object.entries(cropRecs.nutrients)) {
                            recommendations.nutrientAdvice.push({
                                crop: crop,
                                nutrient: nutrient,
                                product: product
                            });
                        }
                    }
                }
            }
        }

        if (profile.landType) {
            const landAdvice = this._getLandTypeAdvice(profile.landType);
            if (landAdvice) {
                recommendations.seasonalTips.push(landAdvice);
            }
        }

        if (profile.farmSize > 0) {
            recommendations.seasonalTips.push({
                type: 'farmSize',
                message: `আপনার মোট জমির পরিমাণ: ${profile.farmSize} ${profile.farmSizeUnit === 'acre' ? 'একর' : 'শতাংশ'}`
            });
        }

        return recommendations;
    },

    /**
     * Get profile completeness percentage
     */
    getProfileCompleteness(profile) {
        if (!profile) return 0;

        const fields = [
            { key: 'name', weight: 15 },
            { key: 'phone', weight: 10 },
            { key: 'district', weight: 10 },
            { key: 'upazila', weight: 10 },
            { key: 'village', weight: 5 },
            { key: 'farmSize', weight: 10, validate: (v) => v > 0 },
            { key: 'landType', weight: 10 },
            { key: 'crops', weight: 15, validate: (v) => Array.isArray(v) && v.length > 0 },
            { key: 'preferredLanguage', weight: 5 }
        ];

        let totalWeight = 0;
        let completedWeight = 0;

        for (const field of fields) {
            totalWeight += field.weight;
            const value = profile[field.key];

            if (field.validate) {
                if (field.validate(value)) {
                    completedWeight += field.weight;
                }
            } else if (value !== null && value !== undefined && value !== '' && value !== 0) {
                completedWeight += field.weight;
            }
        }

        return Math.round((completedWeight / totalWeight) * 100);
    },

    /**
     * Create profile management UI
     */
    createProfileUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[SFFarmerProfile] Container not found:', containerId);
            return;
        }

        const userId = getStorageUserId() || generateLocalId();
        const profile = this.getProfile(userId);

        container.innerHTML = `
            <div class="sf-profile-container" style="font-family: 'Hind Siliguri', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2e7d32; text-align: center; margin-bottom: 20px;">
                    👨‍🌾 কৃষক প্রোফাইল
                </h2>

                <div id="sf-profile-completeness" style="background: #f5f5f5; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>প্রোফাইল সম্পূর্ণতা</span>
                        <span id="sf-completeness-percent">0%</span>
                    </div>
                    <div style="background: #e0e0e0; border-radius: 4px; height: 8px;">
                        <div id="sf-completeness-bar" style="background: #4caf50; height: 100%; border-radius: 4px; width: 0%; transition: width 0.3s;"></div>
                    </div>
                </div>

                <form id="sf-profile-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">নাম *</label>
                        <input type="text" id="sf-name" placeholder="আপনার নাম লিখুন" required
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">মোবাইল নম্বর *</label>
                        <input type="tel" id="sf-phone" placeholder="01XXXXXXXXX" pattern="01[3-9]\\d{8}" required
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">জেলা *</label>
                            <input type="text" id="sf-district" placeholder="জেলা" required
                                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">উপজেলা *</label>
                            <input type="text" id="sf-upazila" placeholder="উপজেলা" required
                                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                        </div>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">গ্রাম</label>
                        <input type="text" id="sf-village" placeholder="গ্রামের নাম"
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                    </div>

                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">জমির পরিমাণ *</label>
                            <input type="number" id="sf-farm-size" placeholder="যেমন: ২.৫" step="0.1" min="0" required
                                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 500;">একক</label>
                            <select id="sf-farm-unit"
                                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                                <option value="acre">একর</option>
                                <option value="bigha">বিঘা</option>
                                <option value="decimal">শতাংশ</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">জমির ধরন *</label>
                        <select id="sf-land-type" required
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                            <option value="">-- জমির ধরন নির্বাচন করুন --</option>
                            ${LAND_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500;">বর্তমান ফসল (কমা দিয়ে আলাদা করুন)</label>
                        <input type="text" id="sf-crops" placeholder="যেমন: ধান, গম, আলু"
                            style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box;">
                    </div>

                    <button type="submit" id="sf-save-btn"
                        style="background: #2e7d32; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: 500; transition: background 0.2s;">
                        💾 সংরক্ষণ করুন
                    </button>
                </form>

                <div id="sf-profile-message" style="display: none; margin-top: 15px; padding: 10px; border-radius: 6px; text-align: center;"></div>

                <div id="sf-profile-history" style="margin-top: 25px;">
                    <h3 style="color: #555; border-bottom: 1px solid #eee; padding-bottom: 10px;">📊 ফসল ইতিহাস</h3>
                    <div id="sf-crop-history-list" style="font-size: 14px; color: #666;"></div>
                </div>
            </div>
        `;

        const form = container.querySelector('#sf-profile-form');
        const messageEl = container.querySelector('#sf-profile-message');

        const showMessage = (msg, type) => {
            messageEl.textContent = msg;
            messageEl.style.display = 'block';
            messageEl.style.background = type === 'success' ? '#e8f5e9' : '#ffebee';
            messageEl.style.color = type === 'success' ? '#2e7d32' : '#c62828';
            setTimeout(() => { messageEl.style.display = 'none'; }, 3000);
        };

        const updateCompleteness = (prof) => {
            const pct = this.getProfileCompleteness(prof);
            const bar = container.querySelector('#sf-completeness-bar');
            const percent = container.querySelector('#sf-completeness-percent');
            if (bar) bar.style.width = pct + '%';
            if (percent) percent.textContent = pct + '%';
        };

        const populateForm = (prof) => {
            if (!prof) return;
            const setVal = (id, val) => {
                const el = container.querySelector(`#${id}`);
                if (el) el.value = val || '';
            };
            setVal('sf-name', prof.name);
            setVal('sf-phone', prof.phone);
            setVal('sf-district', prof.district);
            setVal('sf-upazila', prof.upazila);
            setVal('sf-village', prof.village);
            setVal('sf-farm-size', prof.farmSize || '');
            setVal('sf-farm-unit', prof.farmSizeUnit || 'acre');
            setVal('sf-land-type', prof.landType || '');
            if (prof.crops && prof.crops.length > 0) {
                setVal('sf-crops', prof.crops.join(', '));
            }
            updateCompleteness(prof);
        };

        const renderHistory = (prof) => {
            const historyList = container.querySelector('#sf-crop-history-list');
            if (!historyList || !prof.cropHistory || prof.cropHistory.length === 0) {
                if (historyList) historyList.innerHTML = '<p style="color: #999; text-align: center;">এখনো কোনো ফসল ইতিহাস নেই</p>';
                return;
            }

            const sorted = [...prof.cropHistory].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            historyList.innerHTML = sorted.slice(0, 10).map(entry => `
                <div style="padding: 8px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between;">
                    <span>🌾 ${entry.crop}</span>
                    <span style="color: #888;">${entry.seasonName || entry.season} ${entry.year}</span>
                </div>
            `).join('');
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const saveBtn = container.querySelector('#sf-save-btn');
            saveBtn.disabled = true;
            saveBtn.textContent = '⏳ সংরক্ষণ হচ্ছে...';

            const cropsInput = container.querySelector('#sf-crops').value;
            const crops = cropsInput ? cropsInput.split(',').map(c => c.trim()).filter(c => c) : [];

            const data = {
                name: container.querySelector('#sf-name').value.trim(),
                phone: container.querySelector('#sf-phone').value.trim(),
                district: container.querySelector('#sf-district').value.trim(),
                upazila: container.querySelector('#sf-upazila').value.trim(),
                village: container.querySelector('#sf-village').value.trim(),
                farmSize: parseFloat(container.querySelector('#sf-farm-size').value) || 0,
                farmSizeUnit: container.querySelector('#sf-farm-unit').value,
                landType: container.querySelector('#sf-land-type').value,
                crops: crops
            };

            const success = await this.updateProfile(userId, data);

            if (success) {
                showMessage('✅ প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!', 'success');
                const updatedProfile = await this.getProfile(userId);
                if (updatedProfile) {
                    updateCompleteness(updatedProfile);
                    renderHistory(updatedProfile);
                }
            } else {
                showMessage('❌ সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
            }

            saveBtn.disabled = false;
            saveBtn.textContent = '💾 সংরক্ষণ করুন';
        });

        if (profile) {
            populateForm(profile);
            renderHistory(profile);
        } else {
            updateCompleteness({});
        }
    },

    /**
     * Generate personalized greeting in Bangla
     */
    generatePersonalizedGreeting(profile) {
        const hour = new Date().getHours();
        let timeGreeting = '';

        if (hour >= 5 && hour < 12) {
            timeGreeting = 'সুপ্রভাত';
        } else if (hour >= 12 && hour < 17) {
            timeGreeting = 'শুভ অপরাহ্ন';
        } else if (hour >= 17 && hour < 20) {
            timeGreeting = 'শুভ সন্ধ্যা';
        } else {
            timeGreeting = 'শুভ রাত্রি';
        }

        let greeting = `${timeGreeting}`;
        const name = profile?.name;
        if (name) {
            greeting += `, ${name}`;
        }
        greeting += '!';

        if (profile?.crops && profile.crops.length > 0) {
            const cropList = profile.crops.slice(0, 3).join(', ');
            greeting += ` আপনার ${cropList} ফসল কেমন চলছে?`;
        } else {
            greeting += ' আজ আপনার জমির কি অবস্থা?';
        }

        const currentSeason = getCurrentSeason();
        if (currentSeason.key !== 'unknown') {
            greeting += ` ${currentSeason.name} মৌসুমে সুস্থ ফসলের জন্য শুভেচ্ছা!`;
        }

        return greeting;
    },

    /**
     * Get localized weather advice based on profile and weather data
     */
    getLocalWeatherAdvice(profile, weatherData) {
        if (!weatherData) {
            return { title: 'আবহাওয়া তথ্য', advice: 'আবহাওয়ার তথ্য পাওয়া যায়নি।', icon: '❓' };
        }

        const temp = weatherData.temp || weatherData.temperature || 25;
        const humidity = weatherData.humidity || 70;
        const rain = weatherData.rain || weatherData.rainfall || 0;
        const condition = (weatherData.condition || weatherData.weather || '').toLowerCase();

        let advice = '';
        let icon = '☀️';
        let title = 'আজকের আবহাওয়া';

        const crops = profile?.crops || [];
        const landType = profile?.landType || '';

        if (rain > 10) {
            icon = '🌧️';
            title = 'বৃষ্টির পরামর্শ';
            advice = 'বৃষ্টি হচ্ছে। ';
            if (crops.includes('ধান') || crops.includes('rice')) {
                advice += 'ধানের জমিতে পানি নিশ্চিত করুন। ';
            }
            if (landType === 'দোআঁশ' || landType === 'বেলে') {
                advice += 'পানি নিষ্কাশনের ব্যবস্থা করুন। ';
            }
            advice += 'সার ও পেস্টিসাইড ছিটানো এড়িয়ে চলুন।';
        } else if (temp > 35) {
            icon = '🌡️';
            title = 'প্রচণ্ড গরমের পরামর্শ';
            advice = 'তাপমাত্রা অনেক বেশি। ';
            if (crops.length > 0) {
                advice += 'সকালে বা সন্ধ্যায় সেচ দিন। ';
            }
            advice += 'ফসলে পানির চাহিদা বাড়ে। ';
            if (landType === 'বেলে' || landType === 'বালুকাময়') {
                advice += 'বেলে জমিতে বেশি পানি লাগবে। ';
            }
            advice += 'গরু-ছাগলের জন্য ছায়ার ব্যবস্থা করুন।';
        } else if (humidity > 85) {
            icon = '💧';
            title = 'বেশি আর্দ্রতার পরামর্শ';
            advice = 'আর্দ্রতা বেশি। ';
            if (crops.length > 0) {
                advice += 'ফসলে ছত্রাক রোগের ঝুঁকি বেশি। ';
            }
            advice += 'জমিতে বাতাস চলাচল নিশ্চিত করুন। ';
            advice += 'প্রয়োজনে ছত্রাকনাশক প্রয়োগ করুন।';
        } else if (temp >= 20 && temp <= 30 && humidity >= 50 && humidity <= 80) {
            icon = '🌤️';
            title = 'ভালো আবহাওয়া';
            advice = 'আবহাওয়া ফসলের জন্য অনুকূল। ';
            if (crops.length > 0) {
                advice += 'এটি সার প্রয়োগের ভালো সময়। ';
            }
            advice += 'জমির যত্ন নিন।';
        } else {
            icon = '⛅';
            title = 'সাধারণ আবহাওয়া';
            advice = 'আবহাওয়া সাধারণ। ';
            if (crops.length > 0) {
                advice += 'নিয়মিত জমি পরিদর্শন করুন। ';
            }
            advice += 'প্রয়োজনীয় কৃষি কার্যক্রম চালিয়ে যান।';
        }

        if (weatherData.windSpeed > 30 || weatherData.wind > 30) {
            advice += ' ঝড়ের আশঙ্কা থাকলে ফসল রক্ষা করুন।';
        }

        return { title, advice, icon };
    },

    // ==========================================
    // Internal Helpers
    // ==========================================

    /**
     * Get land type specific advice
     */
    _getLandTypeAdvice(landType) {
        const adviceMap = {
            'দোআঁশ': 'দোআঁশ জমিতে ধান, গম ও সবজি ভালো জন্মায়।',
            'এঁটেল': 'এঁটেল জমিতে পানি রাখুন। ধান ও আখ উপযুক্ত।',
            'বেলে': 'বেলে জমিতে বেশি পানি ও সার লাগে। আলু, মিষ্টি আলু ভালো।',
            'কালো': 'কালো জমি উর্বর। সকল ধরনের ফসল হয়।',
            'পলি': 'পলি জমিতে জলজ ফসল উপযুক্ত।',
            'চিকন': 'চিকন জমিতে পানি জমে থাকে। ধান ভালো হয়।',
            'দোমাটি': 'দোমাটি জমি সব ধরনের ফসলের জন্য উপযুক্ত।',
            'বালুকাময়': 'বালুকাময় জমিতে আলু, তিল ও শুকনো ফসল ভালো হয়।'
        };

        return adviceMap[landType] || null;
    },

    /**
     * Get land types list
     */
    getLandTypes() {
        return [...LAND_TYPES];
    },

    /**
     * Get seasons list
     */
    getSeasons() {
        return Object.entries(CROP_SEASONS).map(([key, val]) => ({ key, ...val }));
    },

    /**
     * Get current season info
     */
    getCurrentSeason() {
        return getCurrentSeason();
    }
};
