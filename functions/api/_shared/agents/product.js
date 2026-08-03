const FIREBASE_PROJECT_ID = 'sowrov-fertilizer-905de';
const SITE_BASE_URL = 'https://sowrov-fertilizer-905de.web.app';

let allProductsCache = null;
let allProductsCacheTime = 0;
const PRODUCTS_CACHE_TTL = 5 * 60 * 1000;

async function fetchAllProducts() {
    const now = Date.now();
    if (allProductsCache && (now - allProductsCacheTime) < PRODUCTS_CACHE_TTL) {
        return allProductsCache;
    }

    try {
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/products`;
        const response = await fetch(url);
        if (!response.ok) return [];

        const data = await response.json();
        if (!data.documents) return [];

        allProductsCache = data.documents.map(doc => {
            const fields = doc.fields || {};
            return {
                name: fields.name?.stringValue || '',
                category: fields.category?.stringValue || '',
                description: fields.description?.stringValue || '',
                retailPrice: Number(fields.retailPrice?.integerValue || fields.retailPrice?.doubleValue) || 0,
                wholesalePrice: Number(fields.wholesalePrice?.integerValue || fields.wholesalePrice?.doubleValue) || 0,
                stock: Number(fields.stock?.integerValue) || 0,
                image: fields.image?.stringValue || '',
                docId: doc.name?.split('/').pop() || '',
            };
        });
        allProductsCacheTime = now;

        return allProductsCache;
    } catch (error) {
        console.error('Product fetch error:', error);
        return allProductsCache || [];
    }
}

async function searchFirebaseProducts(keyword) {
    const allProducts = await fetchAllProducts();
    const lowerKeyword = keyword.toLowerCase();

    return allProducts.filter(p =>
        p.name.toLowerCase().includes(lowerKeyword) ||
        p.category.toLowerCase().includes(lowerKeyword) ||
        p.description.toLowerCase().includes(lowerKeyword)
    );
}

function rankProducts(products, cropName, intent) {
    if (!products || products.length === 0) return [];

    return products.map(p => {
        let score = 0;
        const nameLower = p.name.toLowerCase();
        const catLower = p.category.toLowerCase();

        if (cropName && nameLower.includes(cropName.toLowerCase())) score += 10;
        if (cropName && catLower.includes(cropName.toLowerCase())) score += 5;

        if (p.stock > 0) score += 3;

        if (p.retailPrice > 0 && p.retailPrice < 1000) score += 2;

        if (intent === 'fertilizer' && catLower.includes('সার')) score += 8;
        if (intent === 'disease' && (catLower.includes('পেস্টিসাইড') || catLower.includes('রোগ'))) score += 8;

        return { ...p, score };
    }).sort((a, b) => b.score - a.score);
}

function generateProductContext(products) {
    if (!products || products.length === 0) return '';

    let text = '\n\n📦 SOUROV FERTILIZER PRODUCTS FOUND:\n\n';

    products.forEach((p, i) => {
        const productUrl = `${SITE_BASE_URL}/product-details.html?id=${p.docId}`;
        const orderUrl = `${SITE_BASE_URL}/order.html?product=${p.docId}`;
        const whatsappUrl = `https://wa.me/8801829775552?text=I%20want%20to%20order%20${encodeURIComponent(p.name)}`;

        text += `Product ${i + 1}:\n`;
        text += `- Name: ${p.name}\n`;
        text += `- Category: ${p.category}\n`;
        text += `- Description: ${p.description}\n`;
        text += `- Retail Price: ৳${p.retailPrice}\n`;
        text += `- Wholesale Price: ৳${p.wholesalePrice}\n`;
        text += `- Stock: ${p.stock}\n`;
        text += `- Image: ${p.image}\n`;
        text += `- Product URL: ${productUrl}\n`;
        text += `- Order URL: ${orderUrl}\n`;
        text += `- WhatsApp: ${whatsappUrl}\n\n`;
    });

    return text;
}

async function searchAndRankProducts(query, cropName, intent) {
    const searchTerms = [];
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    const stopWords = ['হয়েছে', 'হয়', 'করে', 'করা', 'হবে', 'দিতে', 'দিয়ে', 'নিয়ে', 'আছে', 'ছিল', 'কি', 'কী', 'এবং', 'বা', 'তাই', 'যে', 'যা', 'তো', 'তার', 'এই', 'সেই', 'ও', 'আর', 'কিন্তু'];
    const meaningfulWords = words.filter(w => !stopWords.includes(w) && w.length > 2);

    if (meaningfulWords.length > 3) {
        searchTerms.push(...meaningfulWords.slice(-3));
    } else {
        searchTerms.push(...meaningfulWords);
    }

    if (cropName && !searchTerms.some(t => cropName.toLowerCase().includes(t))) {
        searchTerms.unshift(cropName);
    }

    let allProducts = [];
    for (const term of searchTerms) {
        const found = await searchFirebaseProducts(term);
        allProducts = allProducts.concat(found);
    }

    const seen = new Set();
    allProducts = allProducts.filter(p => {
        if (seen.has(p.name)) return false;
        seen.add(p.name);
        return true;
    });

    const ranked = rankProducts(allProducts, cropName, intent);

    return {
        products: ranked.slice(0, 5),
        context: generateProductContext(ranked.slice(0, 5)),
    };
}

export {
    searchFirebaseProducts,
    rankProducts,
    generateProductContext,
    searchAndRankProducts,
};
