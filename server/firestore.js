/**
 * server/firestore.js
 *
 * Firebase Admin SDK initialisation.
 *
 * Credential resolution order (first found wins):
 *  1. FIREBASE_SERVICE_ACCOUNT env var  → JSON string (Render secret / any cloud host)
 *  2. GOOGLE_APPLICATION_CREDENTIALS env var → path to a key file
 *  3. serviceAccountKey.json in /server directory (local dev only)
 *  4. serviceAccountKey.json in project root   (local dev only)
 *  5. Google Cloud Application Default Credentials (Cloud Run / GKE only)
 *
 * IMPORTANT: serviceAccountKey.json is git-ignored and must NEVER be committed.
 * For Render, set FIREBASE_SERVICE_ACCOUNT as an environment secret with the
 * full JSON contents of the service account key.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
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
  // Prevent duplicate app initialisation (e.g. during hot-reload)
  if (getApps().length > 0) {
    firestoreDb = getFirestore(getApps()[0]);
    isFirestoreConnected = true;
    console.log('♻️  Reusing existing Firebase Admin app.');
  } else {
    let serviceAccount = null;

    // 1. Environment variable (Render / Vercel / Railway secret)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('🔑 Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT env var.');
      } catch (e) {
        console.warn('⚠️  Could not parse FIREBASE_SERVICE_ACCOUNT JSON:', e.message);
      }
    }

    // 2. GOOGLE_APPLICATION_CREDENTIALS file path
    if (!serviceAccount && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const envKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (fs.existsSync(envKeyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(envKeyPath, 'utf-8'));
        console.log(`🔑 Firebase credentials loaded from GOOGLE_APPLICATION_CREDENTIALS: ${envKeyPath}`);
      }
    }

    // 3. Local serviceAccountKey.json in /server
    if (!serviceAccount) {
      const serverKeyPath = path.join(__dirname, 'serviceAccountKey.json');
      if (fs.existsSync(serverKeyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(serverKeyPath, 'utf-8'));
        console.log('🔑 Firebase credentials loaded from server/serviceAccountKey.json (local dev).');
      }
    }

    // 4. Local serviceAccountKey.json in project root
    if (!serviceAccount) {
      const rootKeyPath = path.join(__dirname, '../serviceAccountKey.json');
      if (fs.existsSync(rootKeyPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(rootKeyPath, 'utf-8'));
        console.log('🔑 Firebase credentials loaded from root serviceAccountKey.json (local dev).');
      }
    }

    if (serviceAccount) {
      const app = initializeApp({ credential: cert(serviceAccount) });
      firestoreDb = getFirestore(app);
      isFirestoreConnected = true;
      console.log('✅ Connected to Google Cloud Firestore using Service Account.');
    } else if (process.env.NODE_ENV === 'production' && process.env.K_SERVICE) {
      // 5. Google Cloud Run Application Default Credentials
      const app = initializeApp();
      firestoreDb = getFirestore(app);
      isFirestoreConnected = true;
      console.log('✅ Connected to Google Cloud Firestore via Cloud Run ADC.');
    } else {
      console.log('ℹ️  No Firebase credentials found. Using local JSON data store as fallback.');
      console.log('ℹ️  Set FIREBASE_SERVICE_ACCOUNT env var on Render to activate Firestore.');
    }
  }
} catch (err) {
  console.warn('⚠️  Google Cloud Firestore initialisation failed:', err.message);
  console.log('ℹ️  Falling back to local JSON data store.');
}

export { firestoreDb, isFirestoreConnected };
