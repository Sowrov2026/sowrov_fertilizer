// V22 Shipping Integration
// Cloudflare Pages ES Module

const COURIERS = {
    steadfast: {
        name: 'SteadFast', enabled: true, cod_enabled: true,
        areas: ['ঢাকা', 'চাটগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর'],
    },
    pathao: { name: 'Pathao Courier', enabled: false, cod_enabled: true, areas: ['ঢাকা', 'চাটগ্রাম'] },
    redx: { name: 'RedX', enabled: false, cod_enabled: true, areas: ['ঢাকা', 'চাটগ্রাম', 'রাজশাহী'] },
    paperfly: { name: 'Paperfly', enabled: false, cod_enabled: true, areas: ['ঢাকা'] },
};

async function createShipment(orderData, courier) {
    const idArr = new Uint8Array(16);
    crypto.getRandomValues(idArr);
    const shipment = {
        id: Array.from(idArr, b => b.toString(16).padStart(2, '0')).join(''),
        orderId: orderData.orderId,
        courier: courier || 'steadfast',
        trackingNumber: generateTrackingNumber(courier),
        status: 'dispatched',
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
    return shipment;
}

function generateTrackingNumber(courier) {
    const prefix = { steadfast: 'SF', pathao: 'PT', redx: 'RX', paperfly: 'PF' };
    return `${prefix[courier] || 'SH'}${Date.now().toString(36).toUpperCase()}`;
}

async function trackShipment(trackingNumber) {
    return { trackingNumber, status: 'in_transit', location: 'ঢাকা স্টোর', updatedAt: new Date().toISOString(), history: [] };
}

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

function getAvailableCouriers(area) {
    return Object.entries(COURIERS)
        .filter(([_, c]) => c.enabled && c.areas.includes(area))
        .map(([id, c]) => ({ id, name: c.name, cod_enabled: c.cod_enabled }));
}

export { COURIERS, createShipment, trackShipment, getCourierRate, getAvailableCouriers };
