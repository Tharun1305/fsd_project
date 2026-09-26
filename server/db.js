import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { firestoreDb, isFirestoreConnected } from './firestore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

export function readData(filename, defaultVal = []) {
  const filepath = getFilePath(filename);
  if (!fs.existsSync(filepath)) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(defaultVal, null, 2), 'utf-8');
    } catch (_) {}
    return defaultVal;
  }
  try {
    const raw = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultVal;
  }
}

export function writeData(filename, data) {
  try {
    const filepath = getFilePath(filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`Local file write warning for ${filename}:`, err.message);
  }
}

// Database Layer: Google Cloud Firestore is the PRIMARY production data store.
// Local JSON store acts only as an offline development fallback.
export const db = {
  // Activity History & Audit Logs
  getActivityLogs: async () => {
    if (isFirestoreConnected && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('activity_logs').get();
        const logs = snap.docs.map(doc => ({ log_id: doc.id, ...doc.data() }));
        logs.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
        return logs.slice(0, 200);
      } catch (e) {
        console.warn('Firestore getActivityLogs error:', e.message);
      }
    }
    return readData('activity_logs.json', []);
  },

  logActivity: async ({ action, entity_type, entity_id, details, user = 'Admin' }) => {
    try {
      const newLog = {
        log_id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        action,
        entity_type,
        entity_id: String(entity_id || ''),
        details: details || '',
        user,
        timestamp: new Date().toISOString()
      };

      if (isFirestoreConnected && firestoreDb) {
        try {
          await firestoreDb.collection('activity_logs').doc(newLog.log_id).set(newLog);
        } catch (err) {
          console.warn('Firestore logActivity write error:', err.message);
        }
      } else {
        const logs = readData('activity_logs.json', []);
        logs.unshift(newLog);
        if (logs.length > 500) logs.length = 500;
        writeData('activity_logs.json', logs);
      }
      return newLog;
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  },

  // Categories
  getCategories: async () => {
    if (isFirestoreConnected && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('categories').get();
        if (!snap.empty) {
          const list = snap.docs.map(doc => ({ category_id: doc.id, ...doc.data() }));
          list.sort((a, b) => (Number(a.category_id) || 0) - (Number(b.category_id) || 0));
          return list;
        }
      } catch (e) {
        console.warn('Firestore getCategories error:', e.message);
      }
    }
    return readData('categories.json', []);
  },

  saveCategories: async (cats) => {
    if (isFirestoreConnected && firestoreDb) {
      try {
        const batch = firestoreDb.batch();
        cats.forEach(c => {
          const docRef = firestoreDb.collection('categories').doc(String(c.category_id));
          batch.set(docRef, c, { merge: true });
        });
        await batch.commit();
        return;
      } catch (e) {
        console.warn('Firestore saveCategories error:', e.message);
      }
    }
    writeData('categories.json', cats);
  },

  addCategory: async (catData) => {
    const newId = String(catData.category_id || Date.now());
    const newCat = {
      category_id: newId,
      category_name: catData.category_name || 'New Category',
      icon: catData.icon || 'Layers',
      description: catData.description || ''
    };

    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('categories').doc(newId).set(newCat, { merge: true });
    } else {
      const cats = readData('categories.json', []);
      cats.push(newCat);
      writeData('categories.json', cats);
    }

    await db.logActivity({ action: 'CREATE_CATEGORY', entity_type: 'CATEGORY', entity_id: newId, details: `Category ${newCat.category_name} created` });
    return newCat;
  },

  updateCategory: async (id, updateData) => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      const docRef = firestoreDb.collection('categories').doc(cleanId);
      await docRef.set(updateData, { merge: true });
      const snap = await docRef.get();
      const updated = { category_id: snap.id, ...snap.data() };
      await db.logActivity({ action: 'UPDATE_CATEGORY', entity_type: 'CATEGORY', entity_id: cleanId, details: `Category ${updated.category_name || cleanId} updated` });
      return updated;
    }

    const cats = readData('categories.json', []);
    const index = cats.findIndex(c => String(c.category_id) === cleanId);
    if (index !== -1) {
      cats[index] = { ...cats[index], ...updateData };
      writeData('categories.json', cats);
      await db.logActivity({ action: 'UPDATE_CATEGORY', entity_type: 'CATEGORY', entity_id: cleanId, details: `Category ${cats[index].category_name} updated` });
      return cats[index];
    }
    return null;
  },

  deleteCategory: async (id) => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('categories').doc(cleanId).delete();
    } else {
      let cats = readData('categories.json', []);
      cats = cats.filter(c => String(c.category_id) !== cleanId);
      writeData('categories.json', cats);
    }
    await db.logActivity({ action: 'DELETE_CATEGORY', entity_type: 'CATEGORY', entity_id: cleanId, details: `Category ${cleanId} deleted` });
    return true;
  },

  // Products
  getProducts: async () => {
    let prods = [];
    if (isFirestoreConnected && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('products').get();
        if (!snap.empty) {
          prods = snap.docs.map(doc => ({ product_id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn('Firestore getProducts error:', e.message);
      }
    }

    if (prods.length === 0) {
      prods = readData('products.json', []);
    }

    const now = new Date();
    return prods.map(p => {
      const createdDate = new Date(p.created_at || Date.now());
      const ageDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
      return {
        ...p,
        is_new_arrival: p.is_new_arrival !== undefined ? p.is_new_arrival : (ageDays <= (p.new_arrival_days || 30))
      };
    });
  },

  getProductById: async (id) => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      try {
        const doc = await firestoreDb.collection('products').doc(cleanId).get();
        if (doc.exists) {
          const p = { product_id: doc.id, ...doc.data() };
          const now = new Date();
          const createdDate = new Date(p.created_at || Date.now());
          const ageDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
          return {
            ...p,
            is_new_arrival: p.is_new_arrival !== undefined ? p.is_new_arrival : (ageDays <= (p.new_arrival_days || 30))
          };
        }
      } catch (e) {
        console.warn('Firestore getProductById error:', e.message);
      }
    }
    const all = await db.getProducts();
    return all.find(p => String(p.product_id) === cleanId) || null;
  },

  saveProducts: async (products) => {
    if (isFirestoreConnected && firestoreDb) {
      try {
        const batch = firestoreDb.batch();
        products.forEach(p => {
          const docRef = firestoreDb.collection('products').doc(String(p.product_id));
          batch.set(docRef, p, { merge: true });
        });
        await batch.commit();
        return;
      } catch (e) {
        console.warn('Firestore saveProducts error:', e.message);
      }
    }
    writeData('products.json', products);
  },

  addProduct: async (productData) => {
    const newId = String(productData.product_id || Date.now());
    const newProduct = {
      product_id: newId,
      product_name: productData.product_name || 'New Product',
      product_code: productData.product_code || `GVF-${Math.floor(100 + Math.random() * 900)}`,
      category_id: String(productData.category_id || '1'),
      description: productData.description || '',
      fabric: productData.fabric || '100% Combed Cotton Bio-Wash',
      gsm: productData.gsm || '180 GSM',
      price: productData.price || '₹280 - ₹320 / Kg',
      moq: Number(productData.moq) || 100,
      unit: productData.unit || 'Kg',
      availability: productData.availability || 'Available',
      images: Array.isArray(productData.images) && productData.images.length > 0
        ? productData.images.filter(Boolean)
        : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop'],
      sizes: Array.isArray(productData.sizes) && productData.sizes.length > 0
        ? productData.sizes
        : (typeof productData.sizes === 'string' ? productData.sizes.split(',').map(s => s.trim()).filter(Boolean) : ['S', 'M', 'L', 'XL', 'XXL']),
      colours: Array.isArray(productData.colours) && productData.colours.length > 0
        ? productData.colours
        : (typeof productData.colours === 'string' ? productData.colours.split(',').map(c => c.trim()).filter(Boolean) : ['Navy Blue', 'Black', 'White', 'Melange Grey']),
      tags: Array.isArray(productData.tags) && productData.tags.length > 0
        ? productData.tags
        : (typeof productData.tags === 'string' ? productData.tags.split(',').map(t => t.trim()).filter(Boolean) : ['Bio-Wash', 'Pre-Shrunk']),
      is_new_arrival: productData.is_new_arrival !== undefined ? Boolean(productData.is_new_arrival) : true,
      created_at: new Date().toISOString()
    };

    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('products').doc(newId).set(newProduct, { merge: true });
    } else {
      const products = readData('products.json', []);
      products.unshift(newProduct);
      writeData('products.json', products);
    }

    await db.logActivity({
      action: 'ADD_PRODUCT',
      entity_type: 'PRODUCT',
      entity_id: newId,
      details: `Added new product "${newProduct.product_name}" (${newProduct.product_code}) at ${newProduct.price}`
    });
    return newProduct;
  },

  updateProduct: async (id, updateData) => {
    const cleanId = String(id);
    const processed = { ...updateData };
    if (typeof processed.sizes === 'string') {
      processed.sizes = processed.sizes.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof processed.colours === 'string') {
      processed.colours = processed.colours.split(',').map(c => c.trim()).filter(Boolean);
    }
    if (typeof processed.tags === 'string') {
      processed.tags = processed.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    if (processed.moq !== undefined) {
      processed.moq = Number(processed.moq) || 0;
    }
    if (processed.images && !Array.isArray(processed.images)) {
      processed.images = [processed.images].filter(Boolean);
    }
    processed.updated_at = new Date().toISOString();

    if (isFirestoreConnected && firestoreDb) {
      const docRef = firestoreDb.collection('products').doc(cleanId);
      await docRef.set(processed, { merge: true });
      const snap = await docRef.get();
      const updated = { product_id: snap.id, ...snap.data() };
      await db.logActivity({
        action: 'UPDATE_PRODUCT',
        entity_type: 'PRODUCT',
        entity_id: cleanId,
        details: `Updated product "${updated.product_name || cleanId}" (${updated.product_code || ''})`
      });
      return updated;
    }

    const products = readData('products.json', []);
    const index = products.findIndex(p => String(p.product_id) === cleanId);
    if (index !== -1) {
      products[index] = { ...products[index], ...processed };
      writeData('products.json', products);
      await db.logActivity({
        action: 'UPDATE_PRODUCT',
        entity_type: 'PRODUCT',
        entity_id: cleanId,
        details: `Updated product "${products[index].product_name}" (${products[index].product_code})`
      });
      return products[index];
    }
    return null;
  },

  deleteProduct: async (id) => {
    const cleanId = String(id);
    let name = cleanId;
    if (isFirestoreConnected && firestoreDb) {
      const doc = await firestoreDb.collection('products').doc(cleanId).get();
      if (doc.exists) name = doc.data().product_name || cleanId;
      await firestoreDb.collection('products').doc(cleanId).delete();
    } else {
      let products = readData('products.json', []);
      const target = products.find(p => String(p.product_id) === cleanId);
      if (target) name = target.product_name;
      products = products.filter(p => String(p.product_id) !== cleanId);
      writeData('products.json', products);
    }

    await db.logActivity({
      action: 'DELETE_PRODUCT',
      entity_type: 'PRODUCT',
      entity_id: cleanId,
      details: `Deleted product "${name}"`
    });
    return true;
  },

  duplicateProduct: async (id) => {
    const target = await db.getProductById(id);
    if (!target) return null;
    const newId = Date.now().toString();
    const newProduct = {
      ...target,
      product_id: newId,
      product_name: `${target.product_name} (Copy)`,
      product_code: `${target.product_code}-COPY`,
      created_at: new Date().toISOString()
    };

    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('products').doc(newId).set(newProduct);
    } else {
      const products = readData('products.json', []);
      products.unshift(newProduct);
      writeData('products.json', products);
    }

    await db.logActivity({
      action: 'DUPLICATE_PRODUCT',
      entity_type: 'PRODUCT',
      entity_id: newId,
      details: `Duplicated product "${target.product_name}" -> "${newProduct.product_name}"`
    });
    return newProduct;
  },

  // Enquiries & Customer Timeline History
  getEnquiries: async () => {
    let enquiries = [];
    if (isFirestoreConnected && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('enquiries').get();
        if (!snap.empty) {
          enquiries = snap.docs.map(doc => ({ enquiry_id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn('Firestore getEnquiries error:', e.message);
      }
    }

    if (enquiries.length === 0) {
      enquiries = readData('enquiries.json', []);
    }

    enquiries.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return enquiries.map(e => ({
      ...e,
      history: Array.isArray(e.history) ? e.history : [
        {
          timestamp: e.created_at || new Date().toISOString(),
          status: e.status || 'New',
          note: 'Enquiry received via website',
          author: 'Customer'
        }
      ]
    }));
  },

  saveEnquiries: async (enquiries) => {
    if (isFirestoreConnected && firestoreDb) {
      try {
        const batch = firestoreDb.batch();
        enquiries.forEach(e => {
          const docRef = firestoreDb.collection('enquiries').doc(String(e.enquiry_id));
          batch.set(docRef, e, { merge: true });
        });
        await batch.commit();
        return;
      } catch (e) {
        console.warn('Firestore saveEnquiries error:', e.message);
      }
    }
    writeData('enquiries.json', enquiries);
  },

  addEnquiry: async (enquiry) => {
    const newEnquiryId = 'ENQ-' + Date.now().toString().slice(-6);
    const now = new Date().toISOString();
    const newEnquiry = {
      enquiry_id: newEnquiryId,
      customer_name: enquiry.customer_name || 'Anonymous Buyer',
      company_name: enquiry.company_name || 'N/A',
      mobile: enquiry.mobile || '',
      email: enquiry.email || '',
      location: enquiry.location || 'India',
      buyer_type: enquiry.buyer_type || 'Wholesaler',
      product_id: enquiry.product_id || '',
      product_name: enquiry.product_name || 'General Catalogue Enquiry',
      quantity: Number(enquiry.quantity) || 100,
      size: enquiry.size || 'Assorted (S-XXL)',
      colour: enquiry.colour || 'Assorted',
      sample_required: Boolean(enquiry.sample_required),
      message: enquiry.message || '',
      status: 'New',
      created_at: now,
      history: [
        {
          timestamp: now,
          status: 'New',
          note: enquiry.message ? `Enquiry submitted: "${enquiry.message}"` : 'Enquiry submitted via B2B portal',
          author: enquiry.customer_name || 'Customer'
        }
      ]
    };

    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('enquiries').doc(newEnquiryId).set(newEnquiry);
    } else {
      const enquiries = readData('enquiries.json', []);
      enquiries.unshift(newEnquiry);
      writeData('enquiries.json', enquiries);
    }

    await db.logActivity({
      action: 'NEW_ENQUIRY',
      entity_type: 'ENQUIRY',
      entity_id: newEnquiryId,
      details: `New enquiry received from ${newEnquiry.customer_name} (${newEnquiry.company_name}) for ${newEnquiry.quantity} Pcs of ${newEnquiry.product_name}`
    });
    return newEnquiry;
  },

  updateEnquiryStatus: async (id, status, note = '', author = 'Admin') => {
    const cleanId = String(id);
    let target = null;

    if (isFirestoreConnected && firestoreDb) {
      const docRef = firestoreDb.collection('enquiries').doc(cleanId);
      const snap = await docRef.get();
      if (snap.exists) {
        target = { enquiry_id: snap.id, ...snap.data() };
        const oldStatus = target.status;
        target.status = status;
        target.updated_at = new Date().toISOString();
        if (!Array.isArray(target.history)) target.history = [];
        target.history.unshift({
          timestamp: new Date().toISOString(),
          status: status,
          note: note || `Status updated from ${oldStatus} to ${status}`,
          author: author
        });
        await docRef.set(target, { merge: true });
        await db.logActivity({
          action: 'UPDATE_ENQUIRY_STATUS',
          entity_type: 'ENQUIRY',
          entity_id: cleanId,
          details: `Enquiry ${cleanId} status changed: ${oldStatus} -> ${status} (${note || 'No notes'})`
        });
        return target;
      }
    }

    const enquiries = readData('enquiries.json', []);
    target = enquiries.find(e => String(e.enquiry_id) === cleanId);
    if (target) {
      const oldStatus = target.status;
      target.status = status;
      target.updated_at = new Date().toISOString();
      if (!Array.isArray(target.history)) target.history = [];
      target.history.unshift({
        timestamp: new Date().toISOString(),
        status: status,
        note: note || `Status updated from ${oldStatus} to ${status}`,
        author: author
      });
      writeData('enquiries.json', enquiries);
      await db.logActivity({
        action: 'UPDATE_ENQUIRY_STATUS',
        entity_type: 'ENQUIRY',
        entity_id: cleanId,
        details: `Enquiry ${cleanId} status changed: ${oldStatus} -> ${status} (${note || 'No notes'})`
      });
      return target;
    }
    return null;
  },

  addEnquiryNote: async (id, note, author = 'Admin') => {
    const cleanId = String(id);
    let target = null;

    if (isFirestoreConnected && firestoreDb) {
      const docRef = firestoreDb.collection('enquiries').doc(cleanId);
      const snap = await docRef.get();
      if (snap.exists) {
        target = { enquiry_id: snap.id, ...snap.data() };
        if (!Array.isArray(target.history)) target.history = [];
        target.history.unshift({
          timestamp: new Date().toISOString(),
          status: target.status,
          note: note,
          author: author
        });
        target.updated_at = new Date().toISOString();
        await docRef.set(target, { merge: true });
        await db.logActivity({
          action: 'ADD_ENQUIRY_NOTE',
          entity_type: 'ENQUIRY',
          entity_id: cleanId,
          details: `Note added to enquiry ${cleanId}: "${note}"`
        });
        return target;
      }
    }

    const enquiries = readData('enquiries.json', []);
    target = enquiries.find(e => String(e.enquiry_id) === cleanId);
    if (target) {
      if (!Array.isArray(target.history)) target.history = [];
      target.history.unshift({
        timestamp: new Date().toISOString(),
        status: target.status,
        note: note,
        author: author
      });
      target.updated_at = new Date().toISOString();
      writeData('enquiries.json', enquiries);
      await db.logActivity({
        action: 'ADD_ENQUIRY_NOTE',
        entity_type: 'ENQUIRY',
        entity_id: cleanId,
        details: `Note added to enquiry ${cleanId}: "${note}"`
      });
      return target;
    }
    return null;
  },

  updateEnquiry: async (id, updateData) => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      const docRef = firestoreDb.collection('enquiries').doc(cleanId);
      await docRef.set({ ...updateData, updated_at: new Date().toISOString() }, { merge: true });
      const snap = await docRef.get();
      const updated = { enquiry_id: snap.id, ...snap.data() };
      await db.logActivity({ action: 'EDIT_ENQUIRY', entity_type: 'ENQUIRY', entity_id: cleanId, details: `Enquiry ${cleanId} details updated` });
      return updated;
    }

    const enquiries = readData('enquiries.json', []);
    const index = enquiries.findIndex(e => String(e.enquiry_id) === cleanId);
    if (index !== -1) {
      enquiries[index] = { ...enquiries[index], ...updateData, updated_at: new Date().toISOString() };
      writeData('enquiries.json', enquiries);
      await db.logActivity({ action: 'EDIT_ENQUIRY', entity_type: 'ENQUIRY', entity_id: cleanId, details: `Enquiry ${cleanId} details updated` });
      return enquiries[index];
    }
    return null;
  },

  deleteEnquiry: async (id) => {
    const cleanId = String(id);
    let name = cleanId;
    if (isFirestoreConnected && firestoreDb) {
      const snap = await firestoreDb.collection('enquiries').doc(cleanId).get();
      if (snap.exists) name = snap.data().customer_name || cleanId;
      await firestoreDb.collection('enquiries').doc(cleanId).delete();
    } else {
      let enquiries = readData('enquiries.json', []);
      const target = enquiries.find(e => String(e.enquiry_id) === cleanId);
      if (target) name = target.customer_name;
      enquiries = enquiries.filter(e => String(e.enquiry_id) !== cleanId);
      writeData('enquiries.json', enquiries);
    }

    await db.logActivity({ action: 'DELETE_ENQUIRY', entity_type: 'ENQUIRY', entity_id: cleanId, details: `Deleted enquiry ${cleanId} from ${name}` });
    return true;
  },

  // Sample Requests
  getSampleRequests: async () => {
    let list = [];
    if (isFirestoreConnected && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('sample_requests').get();
        if (!snap.empty) {
          list = snap.docs.map(doc => ({ sample_id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn('Firestore getSampleRequests error:', e.message);
      }
    }
    if (list.length === 0) {
      list = readData('sample_requests.json', []);
    }
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return list;
  },

  saveSampleRequests: async (list) => {
    if (isFirestoreConnected && firestoreDb) {
      try {
        const batch = firestoreDb.batch();
        list.forEach(item => {
          const docRef = firestoreDb.collection('sample_requests').doc(String(item.sample_id));
          batch.set(docRef, item, { merge: true });
        });
        await batch.commit();
        return;
      } catch (e) {
        console.warn('Firestore saveSampleRequests error:', e.message);
      }
    }
    writeData('sample_requests.json', list);
  },

  addSampleRequest: async (req) => {
    const newId = 'SMP-' + Date.now().toString().slice(-6);
    const newReq = {
      sample_id: newId,
      customer_name: req.customer_name || 'Buyer',
      company_name: req.company_name || 'N/A',
      mobile: req.mobile || '',
      location: req.location || '',
      product_id: req.product_id || '',
      product_name: req.product_name || 'Fabric Swatch',
      requirement: req.requirement || 'Fabric Swatch & Quality Sample',
      message: req.message || '',
      status: 'New',
      created_at: new Date().toISOString()
    };

    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('sample_requests').doc(newId).set(newReq);
    } else {
      const requests = readData('sample_requests.json', []);
      requests.unshift(newReq);
      writeData('sample_requests.json', requests);
    }

    await db.logActivity({
      action: 'NEW_SAMPLE_REQUEST',
      entity_type: 'SAMPLE_REQUEST',
      entity_id: newId,
      details: `Sample requested by ${newReq.customer_name} for ${newReq.product_name}`
    });
    return newReq;
  },

  updateSampleRequestStatus: async (id, status, notes = '') => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      const docRef = firestoreDb.collection('sample_requests').doc(cleanId);
      const updateData = { status, updated_at: new Date().toISOString() };
      if (notes) updateData.notes = notes;
      await docRef.set(updateData, { merge: true });
      const snap = await docRef.get();
      const updated = { sample_id: snap.id, ...snap.data() };
      await db.logActivity({ action: 'UPDATE_SAMPLE_STATUS', entity_type: 'SAMPLE_REQUEST', entity_id: cleanId, details: `Sample request ${cleanId} status set to ${status}` });
      return updated;
    }

    const requests = readData('sample_requests.json', []);
    const target = requests.find(s => String(s.sample_id) === cleanId);
    if (target) {
      target.status = status;
      if (notes) target.notes = notes;
      target.updated_at = new Date().toISOString();
      writeData('sample_requests.json', requests);
      await db.logActivity({ action: 'UPDATE_SAMPLE_STATUS', entity_type: 'SAMPLE_REQUEST', entity_id: cleanId, details: `Sample request ${cleanId} status set to ${status}` });
      return target;
    }
    return null;
  },

  deleteSampleRequest: async (id) => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('sample_requests').doc(cleanId).delete();
    } else {
      let list = readData('sample_requests.json', []);
      list = list.filter(s => String(s.sample_id) !== cleanId);
      writeData('sample_requests.json', list);
    }
    await db.logActivity({ action: 'DELETE_SAMPLE_REQUEST', entity_type: 'SAMPLE_REQUEST', entity_id: cleanId, details: `Deleted sample request ${cleanId}` });
    return true;
  },

  // Callback Requests
  getCallbackRequests: async () => {
    let list = [];
    if (isFirestoreConnected && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('callback_requests').get();
        if (!snap.empty) {
          list = snap.docs.map(doc => ({ callback_id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn('Firestore getCallbackRequests error:', e.message);
      }
    }
    if (list.length === 0) {
      list = readData('callback_requests.json', []);
    }
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return list;
  },

  saveCallbackRequests: async (list) => {
    if (isFirestoreConnected && firestoreDb) {
      try {
        const batch = firestoreDb.batch();
        list.forEach(item => {
          const docRef = firestoreDb.collection('callback_requests').doc(String(item.callback_id));
          batch.set(docRef, item, { merge: true });
        });
        await batch.commit();
        return;
      } catch (e) {
        console.warn('Firestore saveCallbackRequests error:', e.message);
      }
    }
    writeData('callback_requests.json', list);
  },

  addCallbackRequest: async (req) => {
    const newId = 'CB-' + Date.now().toString().slice(-6);
    const newItem = {
      callback_id: newId,
      name: req.name || 'Buyer',
      company: req.company || '',
      mobile: req.mobile || '',
      requirement: req.requirement || 'Wholesale Pricing & Bulk Order',
      preferred_time: req.preferred_time || 'Immediate / Anytime',
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('callback_requests').doc(newId).set(newItem);
    } else {
      const list = readData('callback_requests.json', []);
      list.unshift(newItem);
      writeData('callback_requests.json', list);
    }

    await db.logActivity({
      action: 'NEW_CALLBACK_REQUEST',
      entity_type: 'CALLBACK_REQUEST',
      entity_id: newId,
      details: `Callback requested by ${newItem.name} (${newItem.mobile})`
    });
    return newItem;
  },

  updateCallbackRequestStatus: async (id, status, notes = '') => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      const docRef = firestoreDb.collection('callback_requests').doc(cleanId);
      const updateData = { status, updated_at: new Date().toISOString() };
      if (notes) updateData.notes = notes;
      await docRef.set(updateData, { merge: true });
      const snap = await docRef.get();
      const updated = { callback_id: snap.id, ...snap.data() };
      await db.logActivity({ action: 'UPDATE_CALLBACK_STATUS', entity_type: 'CALLBACK_REQUEST', entity_id: cleanId, details: `Callback request ${cleanId} status updated to ${status}` });
      return updated;
    }

    const list = readData('callback_requests.json', []);
    const target = list.find(c => String(c.callback_id) === cleanId);
    if (target) {
      target.status = status;
      if (notes) target.notes = notes;
      target.updated_at = new Date().toISOString();
      writeData('callback_requests.json', list);
      await db.logActivity({ action: 'UPDATE_CALLBACK_STATUS', entity_type: 'CALLBACK_REQUEST', entity_id: cleanId, details: `Callback request ${cleanId} status updated to ${status}` });
      return target;
    }
    return null;
  },

  deleteCallbackRequest: async (id) => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('callback_requests').doc(cleanId).delete();
    } else {
      let list = readData('callback_requests.json', []);
      list = list.filter(c => String(c.callback_id) !== cleanId);
      writeData('callback_requests.json', list);
    }
    await db.logActivity({ action: 'DELETE_CALLBACK_REQUEST', entity_type: 'CALLBACK_REQUEST', entity_id: cleanId, details: `Deleted callback request ${cleanId}` });
    return true;
  },

  // Offers
  getOffers: async () => {
    let offers = [];
    if (isFirestoreConnected && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('offers').get();
        if (!snap.empty) {
          offers = snap.docs.map(doc => ({ offer_id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn('Firestore getOffers error:', e.message);
      }
    }
    if (offers.length === 0) {
      offers = readData('offers.json', []);
    }
    const today = new Date().toISOString().split('T')[0];
    return offers.map(o => ({
      ...o,
      is_active: !o.expiry_date || o.expiry_date >= today
    }));
  },

  getActiveOffers: async () => {
    const offers = await db.getOffers();
    return offers.filter(o => o.is_active && o.status !== 'Disabled');
  },

  saveOffers: async (offers) => {
    if (isFirestoreConnected && firestoreDb) {
      try {
        const batch = firestoreDb.batch();
        offers.forEach(item => {
          const docRef = firestoreDb.collection('offers').doc(String(item.offer_id));
          batch.set(docRef, item, { merge: true });
        });
        await batch.commit();
        return;
      } catch (e) {
        console.warn('Firestore saveOffers error:', e.message);
      }
    }
    writeData('offers.json', offers);
  },

  addOffer: async (data) => {
    const newId = 'OFF-' + Date.now().toString().slice(-5);
    const newItem = {
      offer_id: newId,
      title: data.title || 'New Special Offer',
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop',
      discount_text: data.discount_text || 'Special Bulk Discount',
      coupon_code: data.coupon_code || '',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      expiry_date: data.expiry_date || '2026-12-31',
      status: data.status || 'Active',
      created_at: new Date().toISOString()
    };

    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('offers').doc(newId).set(newItem);
    } else {
      const list = readData('offers.json', []);
      list.unshift(newItem);
      writeData('offers.json', list);
    }

    await db.logActivity({ action: 'ADD_OFFER', entity_type: 'OFFER', entity_id: newId, details: `Created offer "${newItem.title}"` });
    return newItem;
  },

  updateOffer: async (id, updateData) => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      const docRef = firestoreDb.collection('offers').doc(cleanId);
      await docRef.set({ ...updateData, updated_at: new Date().toISOString() }, { merge: true });
      const snap = await docRef.get();
      const updated = { offer_id: snap.id, ...snap.data() };
      await db.logActivity({ action: 'UPDATE_OFFER', entity_type: 'OFFER', entity_id: cleanId, details: `Updated offer "${updated.title}"` });
      return updated;
    }

    const list = readData('offers.json', []);
    const index = list.findIndex(o => String(o.offer_id) === cleanId);
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData, updated_at: new Date().toISOString() };
      writeData('offers.json', list);
      await db.logActivity({ action: 'UPDATE_OFFER', entity_type: 'OFFER', entity_id: cleanId, details: `Updated offer "${list[index].title}"` });
      return list[index];
    }
    return null;
  },

  deleteOffer: async (id) => {
    const cleanId = String(id);
    let title = cleanId;
    if (isFirestoreConnected && firestoreDb) {
      const snap = await firestoreDb.collection('offers').doc(cleanId).get();
      if (snap.exists) title = snap.data().title || cleanId;
      await firestoreDb.collection('offers').doc(cleanId).delete();
    } else {
      let list = readData('offers.json', []);
      const target = list.find(o => String(o.offer_id) === cleanId);
      if (target) title = target.title;
      list = list.filter(o => String(o.offer_id) !== cleanId);
      writeData('offers.json', list);
    }
    await db.logActivity({ action: 'DELETE_OFFER', entity_type: 'OFFER', entity_id: cleanId, details: `Deleted offer "${title}"` });
    return true;
  },

  // Announcements
  getAnnouncements: async () => {
    let list = [];
    if (isFirestoreConnected && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('announcements').get();
        if (!snap.empty) {
          list = snap.docs.map(doc => ({ announcement_id: doc.id, ...doc.data() }));
        }
      } catch (e) {
        console.warn('Firestore getAnnouncements error:', e.message);
      }
    }
    if (list.length === 0) {
      list = readData('announcements.json', []);
    }
    const today = new Date().toISOString().split('T')[0];
    return list.map(a => ({
      ...a,
      is_active: !a.expiry_date || a.expiry_date >= today
    }));
  },

  getActiveAnnouncements: async () => {
    const list = await db.getAnnouncements();
    return list.filter(a => a.is_active && a.status !== 'Disabled');
  },

  saveAnnouncements: async (list) => {
    if (isFirestoreConnected && firestoreDb) {
      try {
        const batch = firestoreDb.batch();
        list.forEach(item => {
          const docRef = firestoreDb.collection('announcements').doc(String(item.announcement_id));
          batch.set(docRef, item, { merge: true });
        });
        await batch.commit();
        return;
      } catch (e) {
        console.warn('Firestore saveAnnouncements error:', e.message);
      }
    }
    writeData('announcements.json', list);
  },

  addAnnouncement: async (data) => {
    const newId = 'ANN-' + Date.now().toString().slice(-5);
    const newItem = {
      announcement_id: newId,
      title: data.title || 'Announcement',
      description: data.description || '',
      badge: data.badge || 'New Collection',
      expiry_date: data.expiry_date || '2026-12-31',
      status: data.status || 'Active',
      created_at: new Date().toISOString()
    };

    if (isFirestoreConnected && firestoreDb) {
      await firestoreDb.collection('announcements').doc(newId).set(newItem);
    } else {
      const list = readData('announcements.json', []);
      list.unshift(newItem);
      writeData('announcements.json', list);
    }

    await db.logActivity({ action: 'ADD_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: newId, details: `Added announcement "${newItem.title}"` });
    return newItem;
  },

  updateAnnouncement: async (id, updateData) => {
    const cleanId = String(id);
    if (isFirestoreConnected && firestoreDb) {
      const docRef = firestoreDb.collection('announcements').doc(cleanId);
      await docRef.set({ ...updateData, updated_at: new Date().toISOString() }, { merge: true });
      const snap = await docRef.get();
      const updated = { announcement_id: snap.id, ...snap.data() };
      await db.logActivity({ action: 'UPDATE_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: cleanId, details: `Updated announcement "${updated.title}"` });
      return updated;
    }

    const list = readData('announcements.json', []);
    const index = list.findIndex(a => String(a.announcement_id) === cleanId);
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData, updated_at: new Date().toISOString() };
      writeData('announcements.json', list);
      await db.logActivity({ action: 'UPDATE_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: cleanId, details: `Updated announcement "${list[index].title}"` });
      return list[index];
    }
    return null;
  },

  deleteAnnouncement: async (id) => {
    const cleanId = String(id);
    let title = cleanId;
    if (isFirestoreConnected && firestoreDb) {
      const snap = await firestoreDb.collection('announcements').doc(cleanId).get();
      if (snap.exists) title = snap.data().title || cleanId;
      await firestoreDb.collection('announcements').doc(cleanId).delete();
    } else {
      let list = readData('announcements.json', []);
      const target = list.find(a => String(a.announcement_id) === cleanId);
      if (target) title = target.title;
      list = list.filter(a => String(a.announcement_id) !== cleanId);
      writeData('announcements.json', list);
    }
    await db.logActivity({ action: 'DELETE_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: cleanId, details: `Deleted announcement "${title}"` });
    return true;
  },

  // Admin Auth
  getAdmin: async () => {
    const defaultAdmin = [{ admin_id: 1, username: 'admin', password_hash: 'admin123', name: 'Tirupur Admin Owner' }];
    if (isFirestoreConnected && firestoreDb) {
      try {
        const snap = await firestoreDb.collection('admins').get();
        if (!snap.empty) {
          return snap.docs.map(doc => ({ username: doc.id, ...doc.data() }));
        }
        // Seed initial admin document if not present in Firestore
        await firestoreDb.collection('admins').doc('admin').set(defaultAdmin[0]);
        return defaultAdmin;
      } catch (e) {
        console.warn('Firestore getAdmin error:', e.message);
      }
    }
    return readData('admin.json', defaultAdmin);
  },

  verifyAdmin: async (username, password) => {
    const admins = await db.getAdmin();
    return admins.find(a => a.username === username && a.password_hash === password);
  }
};
