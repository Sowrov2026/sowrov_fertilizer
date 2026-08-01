// ==========================================
// SF AI V15 — Product Recommendation Module
// Sowrov Fertilizer
// ==========================================

import { db } from './firebase.js';
import {
    collection,
    getDocs,
    doc,
    getDoc,
    query,
    where,
    orderBy,
    limit
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

// ==========================================
// Crop → Category Mapping
// ==========================================

const CROP_CATEGORY_MAP = {
    'ধান': ['fertilizer', 'pesticide', 'seed'],
    'গম': ['fertilizer', 'seed'],
    'ভুট্টা': ['fertilizer', 'pesticide'],
    'পাট': ['fertilizer'],
    'তেলবীজ': ['fertilizer', 'pesticide'],
    'সরিষা': ['fertilizer', 'pesticide'],
    'ডাল': ['fertilizer', 'pesticide'],
    'আলু': ['fertilizer', 'pesticide', 'seed'],
    'মুলা': ['fertilizer', 'pesticide', 'seed'],
    'শাকসবজি': ['fertilizer', 'pesticide', 'seed'],
    'কাঁচামশলা': ['fertilizer', 'pesticide'],
    'লেবু': ['fertilizer', 'pesticide'],
    'কলা': ['fertilizer', 'pesticide'],
    'পানির ফল': ['fertilizer', 'pesticide'],
    'চা': ['fertilizer', 'pesticide'],
    'তামাক': ['fertilizer', 'pesticide'],
};

const INTENT_CATEGORY_MAP = {
    'fertilizer': ['fertilizer', 'organic'],
    'pesticide': ['pesticide', 'insecticide', 'fungicide'],
    'seed': ['seed', 'hybrid'],
    'organic': ['organic', 'fertilizer'],
    'disease': ['pesticide', 'fungicide', 'insecticide'],
    'growth': ['fertilizer', 'vitamin', 'hormone'],
};

const WHATSAPP_NUMBER = '8801XXXXXXXXX';

// ==========================================
// Search Products
// ==========================================

async function searchProducts(keyword) {
    if (!keyword || typeof keyword !== 'string') return [];

    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return [];

    try {
        const snapshot = await getDocs(collection(db, 'products'));
        const results = [];

        snapshot.forEach(docSnap => {
            const p = docSnap.data();
            const searchable = [
                p.name || '',
                p.category || '',
                p.description || ''
            ].join(' ').toLowerCase();

            if (searchable.includes(trimmed)) {
                results.push({ id: docSnap.id, ...p });
            }
        });

        return results;
    } catch (err) {
        console.error('Search error:', err);
        return [];
    }
}

// ==========================================
// Get Products By Category
// ==========================================

async function getProductsByCategory(category) {
    if (!category) return [];

    try {
        const q = query(
            collection(db, 'products'),
            where('category', '==', category)
        );
        const snapshot = await getDocs(q);
        const products = [];

        snapshot.forEach(docSnap => {
            products.push({ id: docSnap.id, ...docSnap.data() });
        });

        return products;
    } catch (err) {
        console.error('Category fetch error:', err);
        return [];
    }
}

// ==========================================
// Get Product By ID
// ==========================================

async function getProductById(docId) {
    if (!docId) return null;

    try {
        const snap = await getDoc(doc(db, 'products', docId));
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() };
    } catch (err) {
        console.error('Product fetch error:', err);
        return null;
    }
}

// ==========================================
// Rank Products
// ==========================================

function rankProducts(products, cropName, intent) {
    if (!products || !products.length) return [];

    const scored = products.map(p => {
        let score = 0;

        // Category match from crop
        if (cropName && CROP_CATEGORY_MAP[cropName]) {
            const cats = CROP_CATEGORY_MAP[cropName].map(c => c.toLowerCase());
            if (cats.includes((p.category || '').toLowerCase())) {
                score += 10;
            }
        }

        // Intent category match
        if (intent && INTENT_CATEGORY_MAP[intent]) {
            const cats = INTENT_CATEGORY_MAP[intent].map(c => c.toLowerCase());
            if (cats.includes((p.category || '').toLowerCase())) {
                score += 8;
            }
        }

        // Crop name in product name/description
        if (cropName) {
            const text = ((p.name || '') + ' ' + (p.description || '')).toLowerCase();
            if (text.includes(cropName.toLowerCase())) {
                score += 6;
            }
        }

        // Keyword intent in product name/description
        if (intent) {
            const text = ((p.name || '') + ' ' + (p.description || '')).toLowerCase();
            if (text.includes(intent.toLowerCase())) {
                score += 4;
            }
        }

        // In stock bonus
        if (p.stock > 0) {
            score += 3;
        }

        // Has image bonus
        if (p.image) {
            score += 1;
        }

        return { ...p, _score: score };
    });

    scored.sort((a, b) => b._score - a._score);
    return scored;
}

// ==========================================
// Generate Product Card HTML
// ==========================================

function generateProductCard(product) {
    if (!product) return '';

    const id = product.id || '';
    const name = product.name || 'নামহীন পণ্য';
    const category = product.category || '';
    const retailPrice = product.retailPrice || 0;
    const stock = product.stock || 0;
    const image = product.image || '';
    const description = product.description || '';

    const truncatedDesc = description.length > 80
        ? description.substring(0, 80) + '...'
        : description;

    const stockHtml = stock > 0
        ? '<span class="stock-badge in-stock">স্টক আছে</span>'
        : '<span class="stock-badge out-of-stock">স্টক নেই</span>';

    const imgHtml = image
        ? `<img src="${image}" alt="${name}" class="product-card-img">`
        : `<div class="product-card-img placeholder">ছবি নেই</div>`;

    return `
        <div class="product-card rec-card" data-id="${id}">
            <div class="product-card-image">
                ${imgHtml}
            </div>
            <div class="product-card-body">
                <h3 class="product-card-name">${name}</h3>
                <span class="product-card-category">${category}</span>
                <p class="product-card-price">৳${retailPrice}</p>
                ${stockHtml}
                <p class="product-card-desc">${truncatedDesc}</p>
                <div class="product-card-actions">
                    <a href="product-details.html?id=${id}" class="btn btn-view">
                        পণ্য দেখুন
                    </a>
                    <a href="order.html?product=${id}" class="btn btn-order">
                        অর্ডার করুন
                    </a>
                    <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('আমি ' + name + ' সম্পর্কে জানতে চাই')}"
                       target="_blank"
                       class="btn btn-whatsapp">
                        WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ==========================================
// Show Product Modal
// ==========================================

function showProductModal(product) {
    if (!product) return;

    let modal = document.getElementById('sfProductModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'sfProductModal';
        modal.className = 'sf-modal-overlay';
        modal.innerHTML = `
            <div class="sf-modal-content">
                <button class="sf-modal-close">&times;</button>
                <div class="sf-modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.sf-modal-close').onclick = () => {
            modal.style.display = 'none';
        };
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    }

    const stockHtml = product.stock > 0
        ? '<span class="stock-badge in-stock">স্টক আছে</span>'
        : '<span class="stock-badge out-of-stock">স্টক নেই</span>';

    const imgHtml = product.image
        ? `<img src="${product.image}" alt="${product.name}" style="width:100%;max-height:300px;object-fit:cover;border-radius:8px;">`
        : '';

    modal.querySelector('.sf-modal-body').innerHTML = `
        ${imgHtml}
        <h2 style="margin-top:12px;">${product.name || ''}</h2>
        <span class="product-card-category">${product.category || ''}</span>
        <p style="font-size:1.2rem;font-weight:700;color:#2d6a4f;margin:8px 0;">৳${product.retailPrice || 0}</p>
        ${stockHtml}
        <p style="margin-top:8px;color:#555;">${product.description || ''}</p>
        <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
            <a href="product-details.html?id=${product.id}" class="btn btn-view">পণ্য দেখুন</a>
            <a href="order.html?product=${product.id}" class="btn btn-order">অর্ডার করুন</a>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('আমি ' + (product.name || '') + ' সম্পর্কে জানতে চাই')}"
               target="_blank" class="btn btn-whatsapp">WhatsApp</a>
        </div>
    `;

    modal.style.display = 'flex';
}

// ==========================================
// Generate WhatsApp Link
// ==========================================

function generateWhatsAppLink(productName) {
    const text = productName
        ? `আমি ${productName} সম্পর্কে জানতে চাই`
        : 'আমি পণ্য সম্পর্কে জানতে চাই';
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// ==========================================
// Generate Order Link
// ==========================================

function generateOrderLink(docId) {
    return `order.html?product=${docId}`;
}

// ==========================================
// Get All Categories
// ==========================================

async function getCategories() {
    try {
        const snapshot = await getDocs(collection(db, 'products'));
        const cats = new Set();

        snapshot.forEach(docSnap => {
            const p = docSnap.data();
            if (p.category) cats.add(p.category);
        });

        return [...cats].sort();
    } catch (err) {
        console.error('Categories fetch error:', err);
        return [];
    }
}

// ==========================================
// Create Product Widget
// ==========================================

async function createProductWidget(containerId, cropName) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container not found:', containerId);
        return;
    }

    container.innerHTML = '<p style="text-align:center;padding:20px;">পণ্য লোড হচ্ছে...</p>';

    try {
        const snapshot = await getDocs(collection(db, 'products'));
        const allProducts = [];

        snapshot.forEach(docSnap => {
            allProducts.push({ id: docSnap.id, ...docSnap.data() });
        });

        if (!allProducts.length) {
            container.innerHTML = '<p style="text-align:center;padding:20px;">কোনো পণ্য পাওয়া যায়নি।</p>';
            return;
        }

        let ranked = allProducts;

        if (cropName) {
            ranked = rankProducts(allProducts, cropName, null);
        }

        const html = ranked.map(p => generateProductCard(p)).join('');

        container.innerHTML = `
            <div class="rec-widget-header">
                <h3>সুপারিশকৃত পণ্য${cropName ? ' — ' + cropName : ''}</h3>
            </div>
            <div class="rec-widget-grid">
                ${html}
            </div>
        `;
    } catch (err) {
        console.error('Widget error:', err);
        container.innerHTML = '<p style="text-align:center;padding:20px;color:red;">পণ্য লোড করতে সমস্যা হয়েছে।</p>';
    }
}

// ==========================================
// Export
// ==========================================

export const SFProductRec = {
    searchProducts,
    getProductsByCategory,
    getProductById,
    rankProducts,
    generateProductCard,
    showProductModal,
    generateWhatsAppLink,
    generateOrderLink,
    createProductWidget,
    getCategories,
};
