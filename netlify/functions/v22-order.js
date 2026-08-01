// V22 Order Management
const crypto = require('crypto');

// Order statuses
const STATUSES = {
    pending: { name: 'অপেক্ষমান', color: '#f59e0b', next: ['confirmed', 'cancelled'] },
    confirmed: { name: 'নিশ্চিত', color: '#3b82f6', next: ['processing', 'cancelled'] },
    processing: { name: 'প্রক্রিয়াকরণ', color: '#8b5cf6', next: ['shipped', 'cancelled'] },
    shipped: { name: 'পাঠানো হয়েছে', color: '#06b6d4', next: ['delivered', 'returned'] },
    delivered: { name: 'ডেলিভারি', color: '#10b981', next: ['completed'] },
    completed: { name: 'সম্পন্ন', color: '#22c55e', next: [] },
    cancelled: { name: 'বাতিল', color: '#ef4444', next: [] },
    returned: { name: 'ফেরত', color: '#f97316', next: ['refunded'] },
    refunded: { name: 'রিফান্ড', color: '#6366f1', next: [] },
};

// Create order
function createOrder(orderData) {
    const order = {
        id: 'ORD-' + Date.now().toString(36).toUpperCase(),
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerAddress: orderData.customerAddress,
        items: orderData.items.map(item => ({
            id: crypto.randomBytes(8).toString('hex'),
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || 'কেজি',
            price: item.price,
            total: item.quantity * item.price,
        })),
        subtotal: orderData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
        tax: orderData.tax || 0,
        shipping: orderData.shipping || 0,
        discount: orderData.discount || 0,
        total: 0,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: orderData.paymentMethod || 'cod',
        shippingMethod: orderData.shippingMethod || 'steadfast',
        trackingNumber: null,
        notes: orderData.notes || '',
        dealerId: orderData.dealerId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    order.total = order.subtotal + order.tax + order.shipping - order.discount;
    return order;
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    return { updated: true, orderId, status: newStatus, updatedAt: new Date().toISOString() };
}

// Cancel order
function cancelOrder(orderId, reason) {
    return { cancelled: true, orderId, reason, updatedAt: new Date().toISOString() };
}

// Get order
function getOrder(orderId) {
    return null; // In production: query Firestore
}

// List orders
function listOrders(filter = {}) {
    return []; // In production: query Firestore
}

// Get order stats
function getOrderStats(dealerId = null) {
    return {
        total: 0,
        pending: 0,
        confirmed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0,
    };
}

module.exports = {
    STATUSES,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    getOrder,
    listOrders,
    getOrderStats,
};