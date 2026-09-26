import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firestoreDb = null;
let isFirestoreConnected = false;

try {
  const rootKeyPath = path.join(__dirname, '../serviceAccountKey.json');
  const serverKeyPath = path.join(__dirname, 'serviceAccountKey.json');
  const envKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  let serviceAccount = null;

  // 1. Check for FIREBASE_SERVICE_ACCOUNT (raw JSON, Base64, or URI-encoded)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    try {
      if (raw.startsWith('{')) {
        serviceAccount = JSON.parse(raw);
      } else {
        // Base64 encoded JSON string
        const decoded = Buffer.from(raw, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(decoded);
      }
    } catch (e) {
      console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT environment variable:', e.message);
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64.trim(), 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded);
    } catch (e) {
      console.warn('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable:', e.message);
    }
  } else if (envKeyPath) {
    if (fs.existsSync(envKeyPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(envKeyPath, 'utf-8'));
    } else if (envKeyPath.trim().startsWith('{')) {
      serviceAccount = JSON.parse(envKeyPath.trim());
    }
  } else if (fs.existsSync(serverKeyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serverKeyPath, 'utf-8'));
  } else if (fs.existsSync(rootKeyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(rootKeyPath, 'utf-8'));
  }

  if (serviceAccount) {
    // Correct escaped newlines in private key if passed via environment variable string
    if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    const app = initializeApp({
      credential: cert(serviceAccount)
    });
    firestoreDb = getFirestore(app);
    isFirestoreConnected = true;
    console.log(`✅ Connected to Google Firebase Firestore database (Project: ${serviceAccount.project_id || 'active'}).`);
  } else if (process.env.NODE_ENV === 'production' && process.env.K_SERVICE) {
    const app = initializeApp();
    firestoreDb = getFirestore(app);
    isFirestoreConnected = true;
    console.log('✅ Connected to Google Firebase Firestore via Cloud Run Application Default Credentials.');
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ CRITICAL: Google Firebase Firestore service account is not configured in production environment!');
      console.error('👉 Please configure FIREBASE_SERVICE_ACCOUNT environment variable on Render.');
    } else {
      console.log('ℹ️ Google Firebase Firestore credentials not detected.');
      console.log('ℹ️ Set FIREBASE_SERVICE_ACCOUNT or place serviceAccountKey.json to activate live Firestore.');
    }
  }
} catch (err) {
  console.warn('⚠️ Google Firebase Firestore initialization failed:', err.message);
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Running in production without live Firestore connection is not recommended.');
  }
}

export { firestoreDb, isFirestoreConnected };
