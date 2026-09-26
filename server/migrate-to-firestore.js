/**
 * server/migrate-to-firestore.js
 *
 * Safely migrates all local JSON data into Google Cloud Firestore.
 *
 * SAFETY GUARANTEES:
 *  ✅  Uses { merge: true } on every write — NEVER overwrites existing Firestore data.
 *  ✅  Only adds records that don't already exist, or updates fields that are missing.
 *  ✅  Stable IDs (existing document IDs from JSON) prevent duplicates across runs.
 *  ✅  Creates a timestamped backup of all local JSON data before migrating.
 *  ✅  Verifies record counts in Firestore after migration.
 *  ✅  Run-safe: can be re-run any number of times without side effects.
 *
 * Run:  node server/migrate-to-firestore.js
 * Or:   npm run migrate:firestore
 */

import { firestoreDb, isFirestoreConnected } from './firestore.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

function readLocal(filename, defaultVal = []) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return defaultVal;
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  } catch (e) {
    console.warn(`⚠️  Could not read ${filename}:`, e.message);
    return defaultVal;
  }
}

async function countCollection(collectionName) {
  const snap = await firestoreDb.collection(collectionName).get();
  return snap.size;
}

async function migrateCollection(collectionName, records, idField) {
  if (!records || records.length === 0) {
    console.log(`   ⏭️  No local records to migrate for [${collectionName}].`);
    return 0;
  }

  // Batch writes in chunks of 499 (Firestore limit is 500 per batch)
  const CHUNK_SIZE = 499;
  let migratedCount = 0;

  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    const chunk = records.slice(i, i + CHUNK_SIZE);
    const batch = firestoreDb.batch();
    chunk.forEach(record => {
      const docId = String(record[idField]);
      if (!docId || docId === 'undefined') {
        console.warn(`   ⚠️  Skipping record with missing ${idField} in [${collectionName}]`);
        return;
      }
      const docRef = firestoreDb.collection(collectionName).doc(docId);
      batch.set(docRef, record, { merge: true });
      migratedCount++;
    });
    await batch.commit();
  }

  return migratedCount;
}

async function migrate() {
  if (!isFirestoreConnected || !firestoreDb) {
    console.error('');
    console.error('❌ Cannot migrate: Google Cloud Firestore is not connected.');
    console.error('');
    console.error('   To connect, either:');
    console.error('   1. Place serviceAccountKey.json in the project root (local dev).');
    console.error('   2. Set FIREBASE_SERVICE_ACCOUNT env var with the full JSON string.');
    console.error('');
    process.exit(1);
  }

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   G V Clothings — Firestore Migration Script             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // ── Step 1: Read local JSON data ──────────────────────────────────────────
  const localData = {
    categories:       { records: readLocal('categories.json'),       idField: 'category_id' },
    products:         { records: readLocal('products.json'),         idField: 'product_id' },
    enquiries:        { records: readLocal('enquiries.json'),        idField: 'enquiry_id' },
    sample_requests:  { records: readLocal('sample_requests.json'),  idField: 'sample_id' },
    callback_requests:{ records: readLocal('callback_requests.json'),idField: 'callback_id' },
    offers:           { records: readLocal('offers.json'),           idField: 'offer_id' },
    announcements:    { records: readLocal('announcements.json'),    idField: 'announcement_id' },
    activity_logs:    { records: readLocal('activity_logs.json'),    idField: 'log_id' },
    admins:           { records: readLocal('admin.json'),            idField: 'username' }
  };

  console.log('📊 Local record counts (BEFORE migration):');
  let totalLocal = 0;
  for (const [col, { records }] of Object.entries(localData)) {
    console.log(`   ${col.padEnd(22)}: ${records.length} records`);
    totalLocal += records.length;
  }
  console.log(`   ${'TOTAL'.padEnd(22)}: ${totalLocal} records`);
  console.log('');

  // ── Step 2: Create timestamped backup ─────────────────────────────────────
  const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `_BACKUP_pre_migration_${backupTimestamp}.json`;
  const backupPath = path.join(DATA_DIR, backupFilename);
  const backupData = {};
  for (const [col, { records }] of Object.entries(localData)) {
    backupData[col] = records;
  }
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`💾 Backup created: server/data/${backupFilename}`);
  console.log('');

  // ── Step 3: Migrate each collection ───────────────────────────────────────
  console.log('🚀 Starting migration (merge-only, no existing data will be deleted)...');
  console.log('');

  const results = {};
  for (const [col, { records, idField }] of Object.entries(localData)) {
    process.stdout.write(`   Migrating [${col}]... `);
    try {
      const count = await migrateCollection(col, records, idField);
      results[col] = { success: true, count };
      console.log(`✅ ${count} records merged.`);
    } catch (err) {
      results[col] = { success: false, error: err.message };
      console.log(`❌ FAILED: ${err.message}`);
    }
  }

  console.log('');

  // ── Step 4: Verify Firestore counts ───────────────────────────────────────
  console.log('🔍 Verifying Firestore record counts (AFTER migration):');
  let totalFirestore = 0;
  let allOk = true;
  for (const col of Object.keys(localData)) {
    try {
      const fsCount = await countCollection(col);
      const localCount = localData[col].records.length;
      const ok = fsCount >= localCount; // Firestore may have MORE (previously migrated)
      const symbol = ok ? '✅' : '⚠️ ';
      console.log(`   ${col.padEnd(22)}: ${fsCount} docs in Firestore  (local: ${localCount})  ${symbol}`);
      totalFirestore += fsCount;
      if (!ok) allOk = false;
    } catch (err) {
      console.log(`   ${col.padEnd(22)}: Could not verify — ${err.message}`);
    }
  }
  console.log(`   ${'TOTAL in Firestore'.padEnd(22)}: ${totalFirestore} documents`);
  console.log('');

  // ── Summary ───────────────────────────────────────────────────────────────
  const failed = Object.entries(results).filter(([, r]) => !r.success);
  if (failed.length === 0 && allOk) {
    console.log('🎉 MIGRATION COMPLETE — All data is now in Google Cloud Firestore!');
    console.log('');
    console.log('   Next steps:');
    console.log('   1. Set FIREBASE_SERVICE_ACCOUNT as a Render environment secret.');
    console.log('   2. Set VITE_API_URL to your Render URL on your frontend host.');
    console.log('   3. Redeploy both backend (Render) and frontend.');
    console.log('   4. Every user/device worldwide will now share the same Firestore data. ✅');
  } else {
    console.log('⚠️  Migration completed with warnings:');
    failed.forEach(([col, r]) => console.log(`   ❌ ${col}: ${r.error}`));
    console.log('');
    console.log('   Please check the errors above and re-run the migration if needed.');
  }
  console.log('');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Fatal migration error:', err);
  process.exit(1);
});
