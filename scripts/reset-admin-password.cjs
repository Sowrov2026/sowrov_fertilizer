/**
 * Firebase Admin SDK v14 — Reset Admin Password (one-time use)
 *
 * Usage:
 *   1. Download service account key from Firebase Console:
 *      Project Settings -> Service Accounts -> Generate New Private Key
 *   2. Save the JSON file as scripts/service-account.json (gitignored)
 *   3. Run:
 *      cd scripts
 *      node reset-admin-password.cjs NEW_PASSWORD_HERE
 *   4. Delete scripts/service-account.json after use
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const TARGET_EMAIL = 'admin@sowrovfertilizer.com';

const newPassword = process.argv[2];

if (!newPassword || newPassword.length < 6) {
    console.error('Usage: node reset-admin-password.cjs <new-password>');
    console.error('Password must be at least 6 characters.');
    process.exit(1);
}

let serviceAccount;
try {
    serviceAccount = require(SERVICE_ACCOUNT_PATH);
} catch (e) {
    console.error('Service account key not found at scripts/service-account.json');
    console.error('');
    console.error('Steps:');
    console.error('1. Go to Firebase Console -> Project Settings -> Service Accounts');
    console.error('2. Click "Generate New Private Key"');
    console.error('3. Save the downloaded JSON as scripts/service-account.json');
    console.error('4. Run this script again');
    process.exit(1);
}

const app = initializeApp({
    credential: cert(serviceAccount),
});

async function resetPassword() {
    try {
        const auth = getAuth(app);
        const userRecord = await auth.getUserByEmail(TARGET_EMAIL);
        console.log('Found user:', userRecord.email, '(uid:', userRecord.uid + ')');

        await auth.updateUser(userRecord.uid, {
            password: newPassword,
        });

        console.log('');
        console.log('Password updated successfully for:', TARGET_EMAIL);
        console.log('UID unchanged:', userRecord.uid);
        console.log('');
        console.log('Log in at: https://sowrov-fertilizer.vercel.app/admin-login.html');
        console.log('');
        console.log('SECURITY: Delete scripts/service-account.json now!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

resetPassword();
