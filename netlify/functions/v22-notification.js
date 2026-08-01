// V22 Notification Center
// Multi-channel notification system

const crypto = require('crypto');

// Notification channels
const CHANNELS = {
    push: { name: 'Push Notification', enabled: true, provider: 'firebase' },
    sms: { name: 'SMS', enabled: false, provider: 'twilio' },
    email: { name: 'Email', enabled: false, provider: 'sendgrid' },
    whatsapp: { name: 'WhatsApp', enabled: false, provider: 'whatsapp_api' },
    telegram: { name: 'Telegram', enabled: false, provider: 'telegram_bot' },
    system: { name: 'System Notification', enabled: true, provider: 'internal' },
};

// Notification templates
const TEMPLATES = {
    order_placed: {
        title: 'অর্ডার গৃহীত হয়েছে',
        body: 'আপনার অর্ডার #{orderId} সফলভাবে গৃহীত হয়েছে।',
        channels: ['push', 'sms', 'system'],
    },
    order_shipped: {
        title: 'অর্ডার পাঠানো হয়েছে',
        body: 'আপনার অর্ডার #{orderId} পাঠানো হয়েছে। ট্র্যাকিং: {tracking}',
        channels: ['push', 'sms', 'system'],
    },
    order_delivered: {
        title: 'অর্ডার ডেলিভারি হয়েছে',
        body: 'আপনার অর্ডার #{orderId} ডেলিভারি হয়েছে।',
        channels: ['push', 'sms', 'system'],
    },
    payment_received: {
        title: 'পেমেন্ট গৃহীত',
        body: '৳{amount} পেমেন্ট গৃহীত হয়েছে।',
        channels: ['push', 'system'],
    },
    low_stock: {
        title: 'কম স্টক',
        body: '{product} এর স্টক কমেছে। বর্তমান স্টক: {quantity}',
        channels: ['push', 'system'],
    },
    disease_alert: {
        title: 'রোগ সতর্কতা',
        body: '{crop} তে {disease} এর ঝুঁকি রয়েছে।',
        channels: ['push', 'system'],
    },
    weather_alert: {
        title: 'আবহাওয়া সতর্কতা',
        body: '{weather} প্রত্যাশিত। ফসলের যত্ন নিন।',
        channels: ['push', 'system'],
    },
    expert_reply: {
        title: 'এক্সপার্ট উত্তর',
        body: 'আপনার প্রশ্নের উত্তর দেওয়া হয়েছে।',
        channels: ['push', 'system'],
    },
    task_reminder: {
        title: 'কাজের রিমাইন্ডার',
        body: '{task} করার সময় হয়েছে।',
        channels: ['push', 'system'],
    },
    monthly_report: {
        title: 'মাসিক রিপোর্ট',
        body: 'আপনার মাসিক রিপোর্ট প্রস্তুত।',
        channels: ['push', 'system'],
    },
};

// Notification storage (in production: Firebase Firestore)
const notifications = new Map();
const userPreferences = new Map();

// Create notification
function createNotification(userId, templateKey, data = {}, channels = null) {
    const template = TEMPLATES[templateKey];
    if (!template) return null;
    
    const notification = {
        id: crypto.randomBytes(16).toString('hex'),
        userId,
        title: replaceTemplate(template.title, data),
        body: replaceTemplate(template.body, data),
        channels: channels || template.channels,
        data,
        status: 'pending',
        read: false,
        createdAt: new Date().toISOString(),
    };
    
    // Get user preferences
    const prefs = userPreferences.get(userId) || { enabled: true, channels: ['push', 'system'] };
    
    // Filter by user preferences
    notification.channels = notification.channels.filter(ch => 
        prefs.enabled && prefs.channels.includes(ch)
    );
    
    // Store
    if (!notifications.has(userId)) notifications.set(userId, []);
    notifications.get(userId).push(notification);
    
    // Send through channels
    sendNotification(notification);
    
    return notification;
}

// Send notification through channels
async function sendNotification(notification) {
    for (const channel of notification.channels) {
        try {
            switch (channel) {
                case 'push':
                    await sendPush(notification);
                    break;
                case 'sms':
                    await sendSMS(notification);
                    break;
                case 'email':
                    await sendEmail(notification);
                    break;
                case 'whatsapp':
                    await sendWhatsApp(notification);
                    break;
                case 'telegram':
                    await sendTelegram(notification);
                    break;
                case 'system':
                    // System notifications are stored, no external call needed
                    break;
            }
        } catch (e) {
            console.error(`Notification ${channel} failed:`, e.message);
        }
    }
}

// Channel implementations (stubs for production)
async function sendPush(notification) {
    // Firebase Cloud Messaging integration
    console.log('Push:', notification.title);
}

async function sendSMS(notification) {
    // Twilio/SMS gateway integration
    console.log('SMS:', notification.title);
}

async function sendEmail(notification) {
    // SendGrid/Email integration
    console.log('Email:', notification.title);
}

async function sendWhatsApp(notification) {
    // WhatsApp Business API integration
    console.log('WhatsApp:', notification.title);
}

async function sendTelegram(notification) {
    // Telegram Bot integration
    console.log('Telegram:', notification.title);
}

// Template replacement
function replaceTemplate(template, data) {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
        result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
}

// Get user notifications
function getUserNotifications(userId, filter = {}) {
    let notifs = notifications.get(userId) || [];
    if (filter.unread) notifs = notifs.filter(n => !n.read);
    if (filter.limit) notifs = notifs.slice(-filter.limit);
    return notifs;
}

// Mark as read
function markAsRead(userId, notificationId) {
    const notifs = notifications.get(userId) || [];
    const notif = notifs.find(n => n.id === notificationId);
    if (notif) {
        notif.read = true;
        notif.readAt = new Date().toISOString();
    }
    return notif;
}

// Mark all as read
function markAllAsRead(userId) {
    const notifs = notifications.get(userId) || [];
    notifs.forEach(n => {
        n.read = true;
        n.readAt = new Date().toISOString();
    });
}

// Get unread count
function getUnreadCount(userId) {
    const notifs = notifications.get(userId) || [];
    return notifs.filter(n => !n.read).length;
}

// Update preferences
function updatePreferences(userId, prefs) {
    userPreferences.set(userId, prefs);
}

// Get preferences
function getPreferences(userId) {
    return userPreferences.get(userId) || { enabled: true, channels: ['push', 'system'] };
}

module.exports = {
    CHANNELS,
    TEMPLATES,
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    updatePreferences,
    getPreferences,
};
