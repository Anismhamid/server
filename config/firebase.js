const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountEnv) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing');
}

if (!getApps().length) {
    let serviceAccount;

    try {
        serviceAccount = JSON.parse(serviceAccountEnv);
    } catch (error) {
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON');
    }

    if (!serviceAccount.project_id || !serviceAccount.private_key) {
        throw new Error('Firebase Service Account is incomplete');
    }

    initializeApp({
        credential: cert(serviceAccount),
    });
}

module.exports = {
    messaging: getMessaging(),
};