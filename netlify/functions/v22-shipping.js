// V22 Shipping Integration
const crypto = require('crypto');

// Courier services
const COURIERS = {
    steadfast: {
        name: 'SteadFast',
        enabled: true,
        api_url: 'https://api.steadfast.com.bd/v1',
        api_key: process.env.STEADFAST_API_KEY || '',
        api_secret: process.env.STEADFAST_API_SECRET || '',
        cod_enabled: true,
        areas: ['ঢাকা', 'চাটগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর'],
    },
    pathao: {
        name: 'Pathao Courier',
        enabled: false,
        api_url: 'https://merchant-api-express.pathao.com',
        api_key: process.env.PATHAO_API_KEY || '',
        cod_enabled: true,
        areas: ['ঢাকা', 'চাটগ্রাম'],
    },
    redx: {
        name: 'RedX',
        enabled: false,
        api_url: 'https://openapi.redx.com.bd/v1.0.0-beta',
        api_key: process.env.REDX_API_KEY || '',
        cod_enabled: true,
        areas: ['ঢাকা', 'চাটগ্রাম', 'রাজশাহী'],
    },
    paperfly: {
        name: 'Paperfly',
        enabled: false,
        api_url: 'https://api.paperfly.com.bd/v1',
        api_key: process.env.PAPERFLY_API_KEY || '',
        cod_enabled: true,
        areas: ['ঢাকা'],
    },
};

// Create shipment
async function createShipment(orderData, courier) {
    const shipment = {
        id: crypto.randomBytes(16).toString('hex'),
        orderId: orderData.orderId,
        courier: courier || 'steadfast',
        trackingNumber: null,
        status: 'created',
        codAmount: orderData.codAmount || orderData.total,
        senderName: orderData.senderName || 'Sowrov Fertilizer',
        senderPhone: orderData.senderPhone || '01829775552',
        senderAddress: orderData.senderAddress || 'কক্সবাজার',
        receiverName: orderData.customerName,
        receiverPhone: orderData.customerPhone,
        receiverAddress: orderData.customerAddress,
        invoice: orderData.invoice || '',
        productType: orderData.productType || 'Agriculture Products',
        weight: orderData.weight || 1,
        created_at: new Date().toISOString(),
    };
    
    // Generate tracking
    shipment.trackingNumber = generateTrackingNumber(courier);
    shipment.status = 'dispatched';
    
    return shipment;
}

// Generate tracking number
function generateTrackingNumber(courier) {
    const prefix = { steadfast: 'SF', pathao: 'PT', redx: 'RX', paperfly: 'PF' };
    return `${prefix[courier] || 'SH'}${Date.now().toString(36).toUpperCase()}`;
}

// Track shipment
async function trackShipment(trackingNumber) {
    return {
        trackingNumber,
        status: 'in_transit',
        location: 'ঢাকা স্টোর',
        updatedAt: new Date().toISOString(),
        history: [],
    };
}

// Get courier rates
function getCourierRate(courier, weight, codAmount) {
    const rates = {
        steadfast: { base: 60, per_kg: 10, cod_percent: 1 },
        pathao: { base: 80, per_kg: 15, cod_percent: 1.5 },
        redx: { base: 70, per_kg: 12, cod_percent: 1 },
        paperfly: { base: 75, per_kg: 13, cod_percent: 1 },
    };
    const rate = rates[courier] || rates.steadfast;
    return {
        shipping: rate.base + (weight * rate.per_kg),
        cod_fee: codAmount * (rate.cod_percent / 100),
        total: rate.base + (weight * rate.per_kg) + (codAmount * rate.cod_percent / 100),
    };
}

// List available couriers
function getAvailableCouriers(area) {
    return Object.entries(COURIERS)
        .filter(([_, c]) => c.enabled && c.areas.includes(area))
        .map(([id, c]) => ({ id, name: c.name, cod_enabled: c.cod_enabled }));
}

module.exports = {
    COURIERS,
    createShipment,
    trackShipment,
    getCourierRate,
    getAvailableCouriers,
};