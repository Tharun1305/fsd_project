import { firestoreDb, isFirestoreConnected } from './firestore.js';
import { readData } from './db.js';

async function migrateData() {
  if (!isFirestoreConnected || !firestoreDb) {
    console.error('❌ Cannot migrate: Google Cloud Firestore is not connected.');
    console.error('👉 Please download serviceAccountKey.json from Firebase Console into project root, or set FIREBASE_SERVICE_ACCOUNT, then re-run.');
    process.exit(1);
  }

  console.log('🚀 Starting data migration from local JSON files to Google Firebase Firestore...\n');

  try {
    // 1. Categories
    const categories = readData('categories.json', []);
    console.log(`📦 Migrating ${categories.length} categories...`);
    const catBatch = firestoreDb.batch();
    categories.forEach(cat => {
      const docRef = firestoreDb.collection('categories').doc(String(cat.category_id));
      catBatch.set(docRef, cat, { merge: true });
    });
    await catBatch.commit();
    console.log('✅ Categories migrated successfully.');

    // 2. Products
    const products = readData('products.json', []);
    console.log(`📦 Migrating ${products.length} products...`);
    const prodBatch = firestoreDb.batch();
    products.forEach(p => {
      const docRef = firestoreDb.collection('products').doc(String(p.product_id));
      prodBatch.set(docRef, p, { merge: true });
    });
    await prodBatch.commit();
    console.log('✅ Products migrated successfully.');

    // 3. Enquiries
    const enquiries = readData('enquiries.json', []);
    console.log(`📦 Migrating ${enquiries.length} enquiries...`);
    const enqBatch = firestoreDb.batch();
    enquiries.forEach(e => {
      const docRef = firestoreDb.collection('enquiries').doc(String(e.enquiry_id));
      enqBatch.set(docRef, e, { merge: true });
    });
    await enqBatch.commit();
    console.log('✅ Enquiries migrated successfully.');

    // 4. Sample Requests
    const sampleRequests = readData('sample_requests.json', []);
    if (sampleRequests.length > 0) {
      console.log(`📦 Migrating ${sampleRequests.length} sample requests...`);
      const smpBatch = firestoreDb.batch();
      sampleRequests.forEach(s => {
        const docRef = firestoreDb.collection('sample_requests').doc(String(s.sample_id));
        smpBatch.set(docRef, s, { merge: true });
      });
      await smpBatch.commit();
      console.log('✅ Sample requests migrated successfully.');
    }

    // 5. Callback Requests
    const callbackRequests = readData('callback_requests.json', []);
    if (callbackRequests.length > 0) {
      console.log(`📦 Migrating ${callbackRequests.length} callback requests...`);
      const cbBatch = firestoreDb.batch();
      callbackRequests.forEach(c => {
        const docRef = firestoreDb.collection('callback_requests').doc(String(c.callback_id));
        cbBatch.set(docRef, c, { merge: true });
      });
      await cbBatch.commit();
      console.log('✅ Callback requests migrated successfully.');
    }

    // 6. Offers
    const offers = readData('offers.json', []);
    console.log(`📦 Migrating ${offers.length} offers...`);
    const offBatch = firestoreDb.batch();
    offers.forEach(o => {
      const docRef = firestoreDb.collection('offers').doc(String(o.offer_id));
      offBatch.set(docRef, o, { merge: true });
    });
    await offBatch.commit();
    console.log('✅ Offers migrated successfully.');

    // 7. Announcements
    const announcements = readData('announcements.json', []);
    console.log(`📦 Migrating ${announcements.length} announcements...`);
    const annBatch = firestoreDb.batch();
    announcements.forEach(a => {
      const docRef = firestoreDb.collection('announcements').doc(String(a.announcement_id));
      annBatch.set(docRef, a, { merge: true });
    });
    await annBatch.commit();
    console.log('✅ Announcements migrated successfully.');

    // 8. Activity Logs
    const activityLogs = readData('activity_logs.json', []);
    if (activityLogs.length > 0) {
      console.log(`📦 Migrating ${activityLogs.length} activity logs...`);
      const logBatch = firestoreDb.batch();
      activityLogs.slice(0, 50).forEach(l => {
        const docRef = firestoreDb.collection('activity_logs').doc(String(l.log_id));
        logBatch.set(docRef, l, { merge: true });
      });
      await logBatch.commit();
      console.log('✅ Activity logs migrated successfully.');
    }

    // 9. Admin User
    const admins = readData('admin.json', [{ admin_id: 1, username: 'admin', password_hash: 'admin123', name: 'Tirupur Admin Owner' }]);
    for (const admin of admins) {
      await firestoreDb.collection('admins').doc(String(admin.username)).set(admin, { merge: true });
    }
    console.log('✅ Admin credentials registered in Firestore.');

    console.log('\n🎉 ALL DATA HAS BEEN SUCCESSFULLY MIGRATED TO GOOGLE FIREBASE FIRESTORE!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateData();
