import { firestoreDb, isFirestoreConnected } from './firestore.js';
import { db } from './db.js';

async function migrateData() {
  if (!isFirestoreConnected || !firestoreDb) {
    console.error('❌ Cannot migrate: Google Cloud Firestore is not connected.');
    console.error('👉 Please download serviceAccountKey.json from Firebase Console into project root, then re-run.');
    process.exit(1);
  }

  console.log('🚀 Starting data migration from local files to Google Cloud Firestore...\n');

  try {
    // 1. Categories
    const categories = db.getCategories();
    console.log(`📦 Migrating ${categories.length} categories...`);
    const catBatch = firestoreDb.batch();
    categories.forEach(cat => {
      const docRef = firestoreDb.collection('categories').doc(String(cat.category_id));
      catBatch.set(docRef, cat, { merge: true });
    });
    await catBatch.commit();
    console.log('✅ Categories migrated successfully.');

    // 2. Products
    const products = db.getProducts();
    console.log(`📦 Migrating ${products.length} products...`);
    const prodBatch = firestoreDb.batch();
    products.forEach(p => {
      const docRef = firestoreDb.collection('products').doc(String(p.product_id));
      prodBatch.set(docRef, p, { merge: true });
    });
    await prodBatch.commit();
    console.log('✅ Products migrated successfully.');

    // 3. Enquiries
    const enquiries = db.getEnquiries();
    console.log(`📦 Migrating ${enquiries.length} enquiries...`);
    const enqBatch = firestoreDb.batch();
    enquiries.forEach(e => {
      const docRef = firestoreDb.collection('enquiries').doc(String(e.enquiry_id));
      enqBatch.set(docRef, e, { merge: true });
    });
    await enqBatch.commit();
    console.log('✅ Enquiries migrated successfully.');

    // 4. Offers
    const offers = db.getOffers();
    console.log(`📦 Migrating ${offers.length} offers...`);
    const offBatch = firestoreDb.batch();
    offers.forEach(o => {
      const docRef = firestoreDb.collection('offers').doc(String(o.offer_id));
      offBatch.set(docRef, o, { merge: true });
    });
    await offBatch.commit();
    console.log('✅ Offers migrated successfully.');

    // 5. Announcements
    const announcements = db.getAnnouncements();
    console.log(`📦 Migrating ${announcements.length} announcements...`);
    const annBatch = firestoreDb.batch();
    announcements.forEach(a => {
      const docRef = firestoreDb.collection('announcements').doc(String(a.announcement_id));
      annBatch.set(docRef, a, { merge: true });
    });
    await annBatch.commit();
    console.log('✅ Announcements migrated successfully.');

    // 6. Admin User
    const admin = db.getAdmin()[0];
    if (admin) {
      await firestoreDb.collection('admins').doc(String(admin.username)).set(admin, { merge: true });
      console.log('✅ Admin credentials registered in Firestore.');
    }

    console.log('\n🎉 ALL DATA HAS BEEN SUCCESSFULLY MIGRATED TO GOOGLE CLOUD FIRESTORE!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateData();
