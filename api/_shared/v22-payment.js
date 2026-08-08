// V22 Payment Gateway
// Cloudflare Pages ES Module

const PROVIDERS = {
    sslcommerz: {
        name: 'SSLCommerz',
        enabled: true,
        sandbox: true,
        currencies: ['BDT'],
        methods: ['card', 'mobile_banking', 'internet_banking'],
    },
    bkash: {
        name: 'bKash',
        enabled: true,
        sandbox: true,
        currencies: ['BDT'],
        methods: ['mobile_banking'],
    },
    nagad: { name: 'Nagad', enabled: false, sandbox: true, currencies: ['BDT'], methods: ['mobile_banking'] },
    rocket: { name: 'Rocket', enabled: false, sandbox: true, currencies: ['BDT'], methods: ['mobile_banking'] },
    stripe: { name: 'Stripe', enabled: false, currencies: ['USD', 'BDT'], methods: ['card'] },
    cod: { name: 'ক্যাশ অন ডেলিভারি', enabled: true, currencies: ['BDT'], methods: ['cod'] },
};

async function createPayment(orderData, env = {}) {
    const idArr = new Uint8Array(16);
    crypto.getRandomValues(idArr);
    const payment = {
        id: Array.from(idArr, b => b.toString(16).padStart(2, '0')).join(''),
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency || 'BDT',
        provider: orderData.provider || 'sslcommerz',
        method: orderData.method || 'card',
        status: 'pending',
        transactionId: null,
        metadata: orderData.metadata || {},
        createdAt: new Date().toISOString(),
    };
    switch (payment.provider) {
        case 'sslcommerz': payment.gatewayUrl = 'https://sandbox.sslcommerz.com/gw-process/v4/'; payment.status = 'initiated'; break;
        case 'bkash': payment.status = 'initiated'; break;
        case 'nagad': payment.status = 'initiated'; break;
        case 'rocket': payment.status = 'initiated'; break;
        case 'stripe': payment.status = 'initiated'; break;
        case 'cod': payment.status = 'confirmed'; payment.transactionId = 'COD-' + Date.now(); break;
    }
    return payment;
}

async function verifyPayment(paymentId, providerData) {
    return { verified: false, error: 'Payment verification not implemented. Configure provider API keys.' };
}

async function refundPayment(paymentId, amount) {
    return { refunded: false, error: 'Refund not implemented. Configure provider API keys.' };
}

function getPayment(paymentId) { return null; }
function getOrderPayments(orderId) { return []; }

function generateInvoice(orderData) {
    return {
        id: 'INV-' + Date.now(),
        orderId: orderData.orderId,
        items: orderData.items,
        subtotal: orderData.subtotal,
        tax: orderData.tax || 0,
        shipping: orderData.shipping || 0,
        total: orderData.total,
        status: 'issued',
        createdAt: new Date().toISOString(),
    };
}

export { PROVIDERS, createPayment, verifyPayment, refundPayment, getPayment, getOrderPayments, generateInvoice };
