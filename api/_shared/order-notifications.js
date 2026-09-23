// ============================================
// SF — Order Notification Providers
// WhatsApp, SMS, Email after successful order
// All credentials via server-side env vars
//
// Idempotency: Firestore-backed via
//   orderNotificationStatus/{orderId}
// ============================================

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ---- Firestore Admin Init (lazy) ----

let _adminApp = null;
let _notifDb = null;

function getNotifDb() {
    if (_notifDb) return _notifDb;
    const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!saJson) return null;
    try {
        const serviceAccount = typeof saJson === 'string' ? JSON.parse(saJson) : saJson;
        const existing = getApps().find(a => a.name === '(default)');
        if (existing) {
            _adminApp = existing;
        } else {
            _adminApp = initializeApp({ credential: cert(serviceAccount) });
        }
        _notifDb = getFirestore(_adminApp);
        return _notifDb;
    } catch (err) {
        console.error('[Notifications] Failed to init Firebase Admin:', err.message);
        return null;
    }
}

function getDb() {
    return getNotifDb();
}

// Allow injecting a mock Firestore for testing
function setNotificationDb(db) {
    _notifDb = db;
}

const IDEMPOTENCY_COLLECTION = 'orderNotificationStatus';
const CLAIM_TIMEOUT_MS = 120_000; // 2 minutes — if claiming longer, consider stale

// ---- WhatsApp (Meta WhatsApp Business API) ----
async function sendWhatsApp(phoneNumber, message) {
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
        console.warn('[WhatsApp] Credentials not configured — skipping');
        return { sent: false, error: 'not_configured' };
    }

    try {
        const normalized = normalizePhoneBD(phoneNumber);
        const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: normalized,
                type: 'text',
                text: { body: message },
            }),
        });
        if (!resp.ok) {
            const err = await resp.text();
            console.error('[WhatsApp] API error:', resp.status, err);
            return { sent: false, error: err };
        }
        return { sent: true };
    } catch (err) {
        console.error('[WhatsApp] Send failed:', err.message);
        return { sent: false, error: err.message };
    }
}

// ---- SMS (Twilio API) ----
async function sendSms(phoneNumber, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        console.warn('[SMS] Twilio credentials not configured — skipping');
        return { sent: false, error: 'not_configured' };
    }

    try {
        const normalized = normalizePhoneBD(phoneNumber);
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const creds = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const body = new URLSearchParams({
            To: `+${normalized}`,
            From: fromNumber,
            Body: message,
        });
        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${creds}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        if (!resp.ok) {
            const err = await resp.text();
            console.error('[SMS] Twilio error:', resp.status, err);
            return { sent: false, error: err };
        }
        return { sent: true };
    } catch (err) {
        console.error('[SMS] Send failed:', err.message);
        return { sent: false, error: err.message };
    }
}

// ---- Email (Nodemailer via SMTP) ----
async function sendEmail(toAddress, subject, htmlBody) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
        console.warn('[Email] SMTP credentials not configured — skipping');
        return { sent: false, error: 'not_configured' };
    }

    try {
        let nodemailer;
        try {
            nodemailer = await import('nodemailer');
        } catch {
            return await sendEmailRawSmtp(toAddress, subject, htmlBody);
        }
        const transporter = nodemailer.default.createTransport({
            host: smtpHost,
            port: Number(smtpPort) || 587,
            secure: Number(smtpPort) === 465,
            auth: { user: smtpUser, pass: smtpPass },
        });
        await transporter.sendMail({
            from: process.env.SMTP_FROM || smtpUser,
            to: toAddress,
            subject,
            html: htmlBody,
        });
        return { sent: true };
    } catch (err) {
        console.error('[Email] Send failed:', err.message);
        return { sent: false, error: err.message };
    }
}

async function sendEmailRawSmtp(toAddress, subject, htmlBody) {
    const net = await import('net');
    return new Promise((resolve) => {
        const socket = new net.default.Socket();
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT) || 587;
        let buffer = '';
        let step = 0;
        const commands = [];

        function send(cmd) {
            socket.write(cmd + '\r\n');
        }

        function nextStep() {
            if (step < commands.length) {
                send(commands[step]);
                step++;
            } else {
                socket.end();
            }
        }

        socket.connect(port, host, () => {
            commands.push('EHLO localhost');
            commands.push('AUTH LOGIN');
            commands.push(Buffer.from(process.env.SMTP_USER).toString('base64'));
            commands.push(Buffer.from(process.env.SMTP_PASS).toString('base64'));
            commands.push(`MAIL FROM:<${process.env.SMTP_FROM || process.env.SMTP_USER}>`);
            commands.push(`RCPT TO:<${toAddress}>`);
            commands.push('DATA');
            commands.push(`From: ${process.env.SMTP_FROM || process.env.SMTP_USER}\r\nTo: ${toAddress}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n${htmlBody}\r\n.`);
            commands.push('QUIT');
            nextStep();
        });

        socket.on('data', (data) => {
            buffer += data.toString();
            if (buffer.includes('334') || buffer.includes('250') || buffer.includes('354') || buffer.includes('221') || buffer.includes('2')) {
                buffer = '';
                nextStep();
            }
        });

        socket.on('end', () => resolve({ sent: true }));
        socket.on('error', (err) => {
            console.error('[Email] Raw SMTP error:', err.message);
            resolve({ sent: false, error: err.message });
        });

        setTimeout(() => { socket.end(); resolve({ sent: false, error: 'timeout' }); }, 10000);
    });
}

// ---- Helpers ----

function normalizePhoneBD(phone) {
    if (!phone) return phone;
    let p = phone.replace(/[\s\-()]/g, '');
    if (p.startsWith('+880')) return p.slice(1);
    if (p.startsWith('880')) return p;
    if (p.startsWith('0')) return '880' + p.slice(1);
    return '880' + p;
}

function formatOrderWhatsApp(order) {
    const lines = [
        `🛒 *নতুন অর্ডার — Sowrov Fertilizer*`,
        ``,
        `📋 অর্ডার নম্বর: ${order.orderId}`,
        `👤 কাস্টমার: ${order.customerName}`,
        `📱 ফোন: ${order.phone}`,
        `📦 পণ্য: ${order.productName}`,
        `🏷️ অর্ডার টাইপ: ${order.orderType}`,
        `⚖️ পরিমাণ: ${order.quantity} কেজি`,
        `💰 মোট: ৳${Number(order.totalAmount).toLocaleString()}`,
        `💳 পেমেন্ট: ${order.paymentMethod}`,
        `📍 ঠিকানা: ${order.fullAddress}`,
        `🕐 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}`,
    ];
    return lines.join('\n');
}

function formatOrderSms(order) {
    const lines = [
        `[Sowrov Fertilizer] নতুন অর্ডার`,
        `অর্ডার: ${order.orderId}`,
        `কাস্টমার: ${order.customerName}`,
        `পণ্য: ${order.productName}`,
        `পরিমাণ: ${order.quantity} কেজি`,
        `মোট: ৳${Number(order.totalAmount).toLocaleString()}`,
        `পেমেন্ট: ${order.paymentMethod}`,
        `ঠিকানা: ${order.fullAddress}`,
    ];
    return lines.join('\n');
}

function formatOrderEmail(order) {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<div style="background:#2E7D32;color:white;padding:20px;border-radius:8px 8px 0 0;">
<h1 style="margin:0;font-size:22px;">🛒 নতুন অর্ডার — Sowrov Fertilizer</h1>
</div>
<div style="background:#f9f9f9;padding:20px;border:1px solid #eee;border-radius:0 0 8px 8px;">
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">অর্ডার নম্বর:</td><td style="padding:8px 0;">${order.orderId}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">কাস্টমার:</td><td style="padding:8px 0;">${order.customerName}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">ফোন:</td><td style="padding:8px 0;">${order.phone}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">পণ্য:</td><td style="padding:8px 0;">${order.productName}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">অর্ডার টাইপ:</td><td style="padding:8px 0;">${order.orderType}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">পরিমাণ:</td><td style="padding:8px 0;">${order.quantity} কেজি</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">দর/কেজি:</td><td style="padding:8px 0;">৳${Number(order.pricePerKg).toLocaleString()}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">মোট:</td><td style="padding:8px 0;font-size:18px;color:#2E7D32;font-weight:bold;">৳${Number(order.totalAmount).toLocaleString()}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">পেমেন্ট:</td><td style="padding:8px 0;">${order.paymentMethod}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">ঠিকানা:</td><td style="padding:8px 0;">${order.fullAddress}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold;color:#333;">সময়:</td><td style="padding:8px 0;">${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}</td></tr>
</table>
</div>
<div style="text-align:center;padding:10px;color:#999;font-size:12px;">
Sowrov Fertilizer — Automated Order Notification
</div>
</body>
</html>`;
}

// ---- Main: send all notifications for a successful order ----

async function sendOrderNotifications(order) {
    const results = { whatsapp: 'skipped', sms_018: 'skipped', sms_015: 'skipped', email: 'skipped' };

    const whatsappMsg = formatOrderWhatsApp(order);
    const smsMsg = formatOrderSms(order);
    const emailHtml = formatOrderEmail(order);
    const emailSubject = `New Order — ${order.orderId}`;
    const smsPhone1 = '01829775552';
    const smsPhone2 = '01518902528';

    // WhatsApp → 01829775552 only
    const waResult = await sendWhatsApp(smsPhone1, whatsappMsg);
    results.whatsapp = waResult.sent ? 'sent' : 'failed';
    if (!waResult.sent && waResult.error) results.whatsapp_error = waResult.error;

    // SMS → 01829775552
    const sms1Result = await sendSms(smsPhone1, smsMsg);
    results.sms_018 = sms1Result.sent ? 'sent' : 'failed';
    if (!sms1Result.sent && sms1Result.error) results.sms_018_error = sms1Result.error;

    // SMS → 01518902528 (NOT WhatsApp)
    const sms2Result = await sendSms(smsPhone2, smsMsg);
    results.sms_015 = sms2Result.sent ? 'sent' : 'failed';
    if (!sms2Result.sent && sms2Result.error) results.sms_015_error = sms2Result.error;

    // Email → shohrahuddinsowrov2026@gmail.com
    const emailResult = await sendEmail('shohrahuddinsowrov2026@gmail.com', emailSubject, emailHtml);
    results.email = emailResult.sent ? 'sent' : 'failed';
    if (!emailResult.sent && emailResult.error) results.email_error = emailResult.error;

    return results;
}

// ---- Firestore-backed Idempotency ----

/**
 * Attempt to claim an order's notification slot.
 * Returns:
 *   'claimed'     — this caller owns the slot, proceed with sending
 *   'completed'   — notifications already fully sent
 *   'already_claimed' — another caller is currently sending (wait/retry)
 *   'no_db'       — Firestore unavailable, proceed unsafely (degraded)
 */
async function claimNotificationSlot(orderId) {
    const db = getDb();
    if (!db) return 'no_db';

    const docRef = db.collection(IDEMPOTENCY_COLLECTION).doc(orderId);
    let txAction = 'none';

    try {
        await db.runTransaction(async (tx) => {
            const snap = await tx.get(docRef);

            if (!snap.exists) {
                tx.set(docRef, {
                    orderId,
                    status: 'claiming',
                    createdAt: FieldValue.serverTimestamp(),
                    completedAt: null,
                    providers: {},
                });
                txAction = 'created';
                return;
            }

            const data = snap.data();
            if (data.status === 'completed') {
                txAction = 'already_completed';
                return;
            }

            if (data.status === 'claiming') {
                const createdAt = data.createdAt?.toDate
                    ? data.createdAt.toDate()
                    : (data.createdAt instanceof Date ? data.createdAt : null);
                if (createdAt && (Date.now() - createdAt.getTime()) > CLAIM_TIMEOUT_MS) {
                    tx.set(docRef, {
                        status: 'claiming',
                        createdAt: FieldValue.serverTimestamp(),
                        completedAt: null,
                        providers: {},
                    }, { merge: true });
                    txAction = 'reclaimed';
                    return;
                }
                txAction = 'already_claimed';
                return;
            }

            if (data.status === 'partial') {
                tx.update(docRef, {
                    status: 'claiming',
                    createdAt: FieldValue.serverTimestamp(),
                });
                txAction = 'retried';
                return;
            }
        });

        if (txAction === 'already_completed') return 'completed';
        if (txAction === 'already_claimed') return 'already_claimed';
        return 'claimed';
    } catch (err) {
        console.error('[Notifications] Claim transaction failed:', err.message);
        return 'no_db';
    }
}

/**
 * Update the notification status document after sending.
 * If all providers succeeded → 'completed'
 * If some failed → 'partial' (allows retry of failed ones)
 */
async function finalizeNotificationStatus(orderId, providerResults) {
    const db = getDb();
    if (!db) return;

    const docRef = db.collection(IDEMPOTENCY_COLLECTION).doc(orderId);
    const allSent = Object.entries(providerResults)
        .filter(([k]) => !k.endsWith('_error'))
        .every(([, v]) => v === 'sent' || v === 'skipped');

    const finalStatus = allSent ? 'completed' : 'partial';

    try {
        await docRef.set({
            status: finalStatus,
            completedAt: FieldValue.serverTimestamp(),
            providers: providerResults,
        }, { merge: true });
    } catch (err) {
        console.error('[Notifications] Failed to finalize status:', err.message);
    }
}

/**
 * Get the saved provider results for retry purposes.
 */
async function getNotificationStatus(orderId) {
    const db = getDb();
    if (!db) return null;
    try {
        const snap = await db.collection(IDEMPOTENCY_COLLECTION).doc(orderId).get();
        return snap.exists ? snap.data() : null;
    } catch {
        return null;
    }
}

/**
 * Send notifications with Firestore-backed idempotency.
 * - Claims the slot atomically (prevents concurrent duplicates)
 * - Sends only providers that haven't already succeeded (for partial retries)
 * - Persists results for retry after partial failure
 */
async function sendOrderNotificationsOnce(order) {
    if (!order.orderId) return { whatsapp: 'skipped', sms_018: 'skipped', sms_015: 'skipped', email: 'skipped' };

    // Read previous status BEFORE claiming (transaction will overwrite status to 'claiming')
    let prevStatus = null;
    const db = getDb();
    if (db) {
        try {
            const snap = await db.collection(IDEMPOTENCY_COLLECTION).doc(order.orderId).get();
            prevStatus = snap.exists ? snap.data() : null;
        } catch {
            prevStatus = null;
        }
    }

    const claim = await claimNotificationSlot(order.orderId);

    if (claim === 'completed') {
        return { whatsapp: 'already_sent', sms_018: 'already_sent', sms_015: 'already_sent', email: 'already_sent' };
    }

    if (claim === 'already_claimed') {
        return { whatsapp: 'already_claimed', sms_018: 'already_claimed', sms_015: 'already_claimed', email: 'already_claimed' };
    }

    // claim === 'claimed' or 'no_db' — proceed

    // For partial retries: check what already succeeded, skip those
    let skipProviders = {};
    if (prevStatus && prevStatus.status === 'partial' && prevStatus.providers) {
        const p = prevStatus.providers;
        if (p.whatsapp === 'sent') skipProviders.whatsapp = true;
        if (p.sms_018 === 'sent') skipProviders.sms_018 = true;
        if (p.sms_015 === 'sent') skipProviders.sms_015 = true;
        if (p.email === 'sent') skipProviders.email = true;
    }

    // Send all notifications (skip already-succeeded ones for retries)
    const results = { whatsapp: 'skipped', sms_018: 'skipped', sms_015: 'skipped', email: 'skipped' };

    if (!skipProviders.whatsapp) {
        const whatsappMsg = formatOrderWhatsApp(order);
        const waResult = await sendWhatsApp('01829775552', whatsappMsg);
        results.whatsapp = waResult.sent ? 'sent' : 'failed';
    } else {
        results.whatsapp = 'sent';
    }

    if (!skipProviders.sms_018) {
        const smsMsg = formatOrderSms(order);
        const sms1Result = await sendSms('01829775552', smsMsg);
        results.sms_018 = sms1Result.sent ? 'sent' : 'failed';
    } else {
        results.sms_018 = 'sent';
    }

    if (!skipProviders.sms_015) {
        const smsMsg = formatOrderSms(order);
        const sms2Result = await sendSms('01518902528', smsMsg);
        results.sms_015 = sms2Result.sent ? 'sent' : 'failed';
    } else {
        results.sms_015 = 'sent';
    }

    if (!skipProviders.email) {
        const emailHtml = formatOrderEmail(order);
        const emailSubject = `New Order — ${order.orderId}`;
        const emailResult = await sendEmail('shohrahuddinsowrov2026@gmail.com', emailSubject, emailHtml);
        results.email = emailResult.sent ? 'sent' : 'failed';
    } else {
        results.email = 'sent';
    }

    // Persist results
    if (claim !== 'no_db') {
        await finalizeNotificationStatus(order.orderId, results);
    }

    return results;
}

export {
    sendWhatsApp,
    sendSms,
    sendEmail,
    sendOrderNotifications,
    sendOrderNotificationsOnce,
    claimNotificationSlot,
    finalizeNotificationStatus,
    getNotificationStatus,
    setNotificationDb,
    normalizePhoneBD,
    formatOrderWhatsApp,
    formatOrderSms,
    formatOrderEmail,
    IDEMPOTENCY_COLLECTION,
    CLAIM_TIMEOUT_MS,
};
