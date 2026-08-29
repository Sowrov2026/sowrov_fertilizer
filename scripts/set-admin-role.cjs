/**
 * Firebase Admin SDK v14 — Set Admin Role in Firestore (one-time use)
 *
 * Sets role: "admin" in Firestore document users/{uid} for admin@sowrovfertilizer.com
 *
 * Usage:
 *   1. Place service-account.json in scripts/ (gitignored)
 *   2. Run:
 *      cd scripts
 *      node set-admin-role.cjs
 *   3. Delete service-account.json after use
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const TARGET_EMAIL = 'admin@sowrovfertilizer.com';

let serviceAccount;
try {
    serviceAccount = require(SERVICE_ACCOUNT_PATH);
} catch (e) {
    console.error('Service account key not found at scripts/service-account.json');
    console.error('Download from Firebase Console -> Project Settings -> Service Accounts');
    process.exit(1);
}

const app = initializeApp({
    credential: cert(serviceAccount),
});

async function setAdminRole() {
    try {
        const auth = getAuth(app);
        const db = getFirestore(app);

        const userRecord = await auth.getUserByEmail(TARGET_EMAIL);
        console.log('Found user:', userRecord.email, '(uid:', userRecord.uid + ')');

        const userRef = db.collection('users').doc(userRecord.uid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const data = userDoc.data();
            console.log('Current role:', data.role || '(not set)');

            if (data.role === 'admin' || data.role === 'super_admin') {
                console.log('User already has admin role. No change needed.');
                return;
            }

            await userRef.update({ role: 'admin' });
            console.log('Updated role from "' + (data.role || 'none') + '" to "admin"');
        } else {
            await userRef.set({ role: 'admin', email: TARGET_EMAIL });
            console.log('Created users/' + userRecord.uid + ' with role: "admin"');
        }

        console.log('');
        console.log('Admin role set successfully!');
        console.log('Log in at: https://sowrov-fertilizer.vercel.app/admin-login.html');
        console.log('');
        console.log('SECURITY: Delete scripts/service-account.json now!');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

setAdminRole();
