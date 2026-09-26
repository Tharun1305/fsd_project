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

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (e) {
      console.warn('Could not parse FIREBASE_SERVICE_ACCOUNT JSON environment variable.');
    }
  } else if (envKeyPath && fs.existsSync(envKeyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(envKeyPath, 'utf-8'));
  } else if (fs.existsSync(serverKeyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serverKeyPath, 'utf-8'));
  } else if (fs.existsSync(rootKeyPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(rootKeyPath, 'utf-8'));
  }

  if (serviceAccount) {
    const app = initializeApp({
      credential: cert(serviceAccount)
    });
    firestoreDb = getFirestore(app);
    isFirestoreConnected = true;
    console.log('✅ Connected to Google Cloud Firestore using Service Account Key.');
  } else if (process.env.NODE_ENV === 'production' && process.env.K_SERVICE) {
    const app = initializeApp();
    firestoreDb = getFirestore(app);
    isFirestoreConnected = true;
    console.log('✅ Connected to Google Cloud Firestore via Cloud Run Application Default Credentials.');
  } else {
    console.log('ℹ️ Google Cloud Firestore key not detected. Using high-speed local data store.');
    console.log('ℹ️ Place serviceAccountKey.json in project root to activate live cloud Firestore.');
  }
} catch (err) {
  console.warn('⚠️ Google Cloud Firestore initialization skipped:', err.message);
  console.log('ℹ️ Operating on local database store.');
}

export { firestoreDb, isFirestoreConnected };
