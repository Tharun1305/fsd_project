import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { firestoreDb, isFirestoreConnected } from './firestore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

// In-memory cache to maintain data across requests within the process
const memoryCache = {};

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem (Vercel)
}

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

export function readData(filename, defaultVal = []) {
  if (memoryCache[filename]) {
    return JSON.parse(JSON.stringify(memoryCache[filename]));
  }
  const filepath = getFilePath(filename);
  if (!fs.existsSync(filepath)) {
    try {
      fs.writeFileSync(filepath, JSON.stringify(defaultVal, null, 2), 'utf-8');
    } catch (e) {}
    memoryCache[filename] = defaultVal;
    return defaultVal;
  }
  try {
    const raw = fs.readFileSync(filepath, 'utf-8');
    const parsed = JSON.parse(raw);
    memoryCache[filename] = parsed;
    return parsed;
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultVal;
  }
}

export function writeData(filename, data) {
  memoryCache[filename] = JSON.parse(JSON.stringify(data));
  try {
    const filepath = getFilePath(filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    if (err.code === 'EROFS' || err.code === 'EACCES' || err.code === 'EPERM') {
      // Read-only filesystem (Vercel) — in-memory cache and Firestore handle persistence
    } else {
      throw err;
    }
  }
}

// Firestore Direct Query Helper
export async function getFromFirestore(collectionName, sortFn) {
  if (isFirestoreConnected && firestoreDb) {
    try {
      const snap = await firestoreDb.collection(collectionName).get();
      if (!snap.empty) {
        const items = [];
        snap.forEach(doc => items.push(doc.data()));
        if (sortFn) items.sort(sortFn);
        // Also keep memory cache fresh
        memoryCache[`${collectionName}.json`] = JSON.parse(JSON.stringify(items));
        return items;
      }
    } catch (e) {
      console.warn(`Firestore read failed [${collectionName}]:`, e.message);
    }
  }
  return null;
}

// Firestore Direct Write Helper (Awaited for Serverless safety)
export async function syncFirestore(collection, id, data, isDelete = false) {
  if (isFirestoreConnected && firestoreDb && id) {
    try {
      const docRef = firestoreDb.collection(collection).doc(String(id));
      if (isDelete) {
        await docRef.delete();
      } else if (data) {
        await docRef.set(data, { merge: true });
      }
    } catch (e) {
      console.warn(`Firestore sync error [${collection}/${id}]:`, e.message);
    }
  }
}

// Real-time two-way listener: automatically pull cloud updates into memory cache
export function initFirestoreListeners() {
  if (!isFirestoreConnected || !firestoreDb) return;

  const collections = [
    {
      name: 'categories',
      file: 'categories.json',
      sortFn: (a, b) => Number(a.category_id || 0) - Number(b.category_id || 0)
    },
    {
      name: 'products',
      file: 'products.json',
      sortFn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    },
    {
      name: 'enquiries',
      file: 'enquiries.json',
      sortFn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    },
    {
      name: 'sample_requests',
      file: 'sample_requests.json',
      sortFn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    },
    {
      name: 'callback_requests',
      file: 'callback_requests.json',
      sortFn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    },
    {
      name: 'offers',
      file: 'offers.json',
      sortFn: (a, b) => (b.offer_id || 0) - (a.offer_id || 0)
    },
    {
      name: 'announcements',
      file: 'announcements.json',
      sortFn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    },
    {
      name: 'activity_logs',
      file: 'activity_logs.json',
      sortFn: (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    }
  ];

  collections.forEach(({ name, file, sortFn }) => {
    try {
      firestoreDb.collection(name).onSnapshot(
        snapshot => {
          if (!snapshot.empty) {
            const items = [];
            snapshot.forEach(doc => items.push(doc.data()));
            if (sortFn) items.sort(sortFn);
            writeData(file, items);
          }
        },
        err => {
          console.warn(`Firestore listener warning on [${name}]:`, err.message);
        }
      );
    } catch (err) {
      console.warn(`Failed to attach Firestore listener to [${name}]:`, err.message);
    }
  });

  console.log('🔄 Live 2-way Firestore sync active.');
}

if (isFirestoreConnected && firestoreDb) {
  initFirestoreListeners();
}

// Database helper functions
export const db = {
  // Activity History & Audit Logs
  getActivityLogs: async () => {
    const fsData = await getFromFirestore('activity_logs', (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return fsData || readData('activity_logs.json', []);
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
      await syncFirestore('activity_logs', newLog.log_id, newLog);
      try {
        const logs = readData('activity_logs.json', []);
        logs.unshift(newLog);
        if (logs.length > 500) logs.length = 500;
        writeData('activity_logs.json', logs);
      } catch (e) {}
      return newLog;
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  },

  // Categories
  getCategories: async () => {
    const fsData = await getFromFirestore('categories', (a, b) => Number(a.category_id || 0) - Number(b.category_id || 0));
    return fsData || readData('categories.json');
  },
  saveCategories: (cats) => writeData('categories.json', cats),
  addCategory: async (catData) => {
    const newId = String(Date.now());
    const newCat = {
      category_id: newId,
      category_name: catData.category_name || 'New Category',
      icon: catData.icon || 'Layers',
      description: catData.description || ''
    };
    await syncFirestore('categories', newId, newCat);
    try {
      const cats = readData('categories.json');
      cats.push(newCat);
      writeData('categories.json', cats);
    } catch (e) {}
    await db.logActivity({ action: 'CREATE_CATEGORY', entity_type: 'CATEGORY', entity_id: newId, details: `Category ${newCat.category_name} created` });
    return newCat;
  },
  updateCategory: async (id, updateData) => {
    let target = null;
    if (isFirestoreConnected && firestoreDb) {
      try {
        const docRef = firestoreDb.collection('categories').doc(String(id));
        const snap = await docRef.get();
        if (snap.exists) {
          target = { ...snap.data(), ...updateData };
          await docRef.set(target, { merge: true });
        }
      } catch (e) {}
    }
    const cats = readData('categories.json');
    const index = cats.findIndex(c => String(c.category_id) === String(id));
    if (index !== -1) {
      cats[index] = { ...cats[index], ...updateData };
      writeData('categories.json', cats);
      if (!target) target = cats[index];
    }
    if (target) {
      await db.logActivity({ action: 'UPDATE_CATEGORY', entity_type: 'CATEGORY', entity_id: id, details: `Category ${target.category_name} updated` });
    }
    return target;
  },
  deleteCategory: async (id) => {
    await syncFirestore('categories', id, null, true);
    let cats = readData('categories.json');
    const target = cats.find(c => String(c.category_id) === String(id));
    cats = cats.filter(c => String(c.category_id) !== String(id));
    writeData('categories.json', cats);
    if (target) {
      await db.logActivity({ action: 'DELETE_CATEGORY', entity_type: 'CATEGORY', entity_id: id, details: `Category ${target.category_name} deleted` });
    }
    return true;
  },

  // Products
  getProducts: async () => {
    const fsData = await getFromFirestore('products', (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const prods = fsData || readData('products.json');
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
    const products = await db.getProducts();
    return products.find(p => String(p.product_id) === String(id));
  },
  saveProducts: (products) => writeData('products.json', products),
  addProduct: async (productData) => {
    const newId = Date.now().toString();
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
        : ['36 inch', '42 inch', '48 inch', '54 inch', '60 inch'],
      colours: Array.isArray(productData.colours) && productData.colours.length > 0
        ? productData.colours
        : ['Navy Blue', 'Jet Black', 'White', 'Melange Grey'],
      tags: Array.isArray(productData.tags) ? productData.tags : ['Bio-Wash', 'Combed Cotton'],
      specifications: productData.specifications || {
        composition: productData.fabric || '100% Cotton',
        yarn_count: '30s Combed',
        dyeing_type: 'Reactive Dye',
        shrinkage: '< 3%'
      },
      bulk_pricing: Array.isArray(productData.bulk_pricing) && productData.bulk_pricing.length > 0
        ? productData.bulk_pricing
        : [
            { tier: '100 - 300 Kg', price: productData.price || '₹320 / Kg' },
            { tier: '300 - 500 Kg', price: '₹305 / Kg' },
            { tier: '500+ Kg', price: '₹290 / Kg' }
          ],
      created_at: new Date().toISOString()
    };
    await syncFirestore('products', newId, newProduct);
    try {
      const products = readData('products.json');
      products.unshift(newProduct);
      writeData('products.json', products);
    } catch (e) {}
    await db.logActivity({
      action: 'ADD_PRODUCT',
      entity_type: 'PRODUCT',
      entity_id: newId,
      details: `Added new product "${newProduct.product_name}" (${newProduct.product_code})`
    });
    return newProduct;
  },
  updateProduct: async (id, updateData) => {
    let target = null;
    if (isFirestoreConnected && firestoreDb) {
      try {
        const docRef = firestoreDb.collection('products').doc(String(id));
        const snap = await docRef.get();
        if (snap.exists) {
          target = { ...snap.data(), ...updateData, updated_at: new Date().toISOString() };
          await docRef.set(target, { merge: true });
        }
      } catch (e) {}
    }
    const products = readData('products.json');
    const index = products.findIndex(p => String(p.product_id) === String(id));
    if (index !== -1) {
      products[index] = { ...products[index], ...updateData, updated_at: new Date().toISOString() };
      writeData('products.json', products);
      if (!target) target = products[index];
    }
    if (target) {
      await db.logActivity({
        action: 'UPDATE_PRODUCT',
        entity_type: 'PRODUCT',
        entity_id: id,
        details: `Updated product "${target.product_name}" (${target.product_code})`
      });
    }
    return target;
  },
  duplicateProduct: async (id) => {
    const products = await db.getProducts();
    const original = products.find(p => String(p.product_id) === String(id));
    if (!original) return null;
    const newId = Date.now().toString();
    const duplicated = {
      ...original,
      product_id: newId,
      product_name: `${original.product_name} (Copy)`,
      product_code: `GVF-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString()
    };
    await syncFirestore('products', newId, duplicated);
    try {
      const local = readData('products.json');
      local.unshift(duplicated);
      writeData('products.json', local);
    } catch (e) {}
    await db.logActivity({
      action: 'DUPLICATE_PRODUCT',
      entity_type: 'PRODUCT',
      entity_id: newId,
      details: `Duplicated product "${original.product_name}" as "${duplicated.product_name}"`
    });
    return duplicated;
  },
  deleteProduct: async (id) => {
    await syncFirestore('products', id, null, true);
    let products = readData('products.json');
    const target = products.find(p => String(p.product_id) === String(id));
    products = products.filter(p => String(p.product_id) !== String(id));
    writeData('products.json', products);
    if (target) {
      await db.logActivity({
        action: 'DELETE_PRODUCT',
        entity_type: 'PRODUCT',
        entity_id: id,
        details: `Deleted product "${target.product_name}" (${target.product_code})`
      });
    }
    return true;
  },

  // Enquiries & Customer Timeline History
  getEnquiries: async () => {
    const fsData = await getFromFirestore('enquiries', (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const enquiries = fsData || readData('enquiries.json');
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
  saveEnquiries: (enquiries) => writeData('enquiries.json', enquiries),
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
    // 1. Await Firestore write so serverless function never terminates before save
    await syncFirestore('enquiries', newEnquiryId, newEnquiry);
    // 2. Also keep local data store updated
    try {
      const enquiries = readData('enquiries.json');
      enquiries.unshift(newEnquiry);
      writeData('enquiries.json', enquiries);
    } catch (e) {}
    // 3. Log activity
    await db.logActivity({
      action: 'NEW_ENQUIRY',
      entity_type: 'ENQUIRY',
      entity_id: newEnquiryId,
      details: `New enquiry received from ${newEnquiry.customer_name} (${newEnquiry.company_name}) for ${newEnquiry.quantity} Pcs of ${newEnquiry.product_name}`
    });
    return newEnquiry;
  },
  updateEnquiryStatus: async (id, status, note = '', author = 'Admin') => {
    let target = null;
    if (isFirestoreConnected && firestoreDb) {
      try {
        const docRef = firestoreDb.collection('enquiries').doc(String(id));
        const snap = await docRef.get();
        if (snap.exists) {
          target = snap.data();
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
        }
      } catch (err) {
        console.warn('Firestore updateEnquiryStatus failed:', err.message);
      }
    }
    const enquiries = readData('enquiries.json');
    const local = enquiries.find(e => String(e.enquiry_id) === String(id));
    if (local) {
      const oldStatus = local.status;
      local.status = status;
      local.updated_at = new Date().toISOString();
      if (!Array.isArray(local.history)) local.history = [];
      local.history.unshift({
        timestamp: new Date().toISOString(),
        status: status,
        note: note || `Status updated from ${oldStatus} to ${status}`,
        author: author
      });
      writeData('enquiries.json', enquiries);
      if (!target) target = local;
    }
    if (target) {
      await db.logActivity({
        action: 'UPDATE_ENQUIRY_STATUS',
        entity_type: 'ENQUIRY',
        entity_id: id,
        details: `Enquiry ${id} status changed: ${target.status} (${note || 'No notes'})`
      });
    }
    return target;
  },
  addEnquiryNote: async (id, note, author = 'Admin') => {
    let target = null;
    if (isFirestoreConnected && firestoreDb) {
      try {
        const docRef = firestoreDb.collection('enquiries').doc(String(id));
        const snap = await docRef.get();
        if (snap.exists) {
          target = snap.data();
          if (!Array.isArray(target.history)) target.history = [];
          target.history.unshift({
            timestamp: new Date().toISOString(),
            status: target.status || 'New',
            note: note,
            author: author
          });
          target.updated_at = new Date().toISOString();
          await docRef.set(target, { merge: true });
        }
      } catch (err) {
        console.warn('Firestore add note error:', err.message);
      }
    }
    const enquiries = readData('enquiries.json');
    const local = enquiries.find(e => String(e.enquiry_id) === String(id));
    if (local) {
      if (!Array.isArray(local.history)) local.history = [];
      local.history.unshift({
        timestamp: new Date().toISOString(),
        status: local.status || 'New',
        note: note,
        author: author
      });
      local.updated_at = new Date().toISOString();
      writeData('enquiries.json', enquiries);
      if (!target) target = local;
    }
    return target;
  },
  updateEnquiry: async (id, updateData) => {
    let target = null;
    if (isFirestoreConnected && firestoreDb) {
      try {
        const docRef = firestoreDb.collection('enquiries').doc(String(id));
        const snap = await docRef.get();
        if (snap.exists) {
          target = { ...snap.data(), ...updateData, updated_at: new Date().toISOString() };
          await docRef.set(target, { merge: true });
        }
      } catch (err) {}
    }
    const enquiries = readData('enquiries.json');
    const index = enquiries.findIndex(e => String(e.enquiry_id) === String(id));
    if (index !== -1) {
      enquiries[index] = {
        ...enquiries[index],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      writeData('enquiries.json', enquiries);
      if (!target) target = enquiries[index];
    }
    if (target) {
      await db.logActivity({
        action: 'EDIT_ENQUIRY',
        entity_type: 'ENQUIRY',
        entity_id: id,
        details: `Enquiry ${id} details updated`
      });
    }
    return target;
  },
  deleteEnquiry: async (id) => {
    await syncFirestore('enquiries', id, null, true);
    let enquiries = readData('enquiries.json');
    const target = enquiries.find(e => String(e.enquiry_id) === String(id));
    enquiries = enquiries.filter(e => String(e.enquiry_id) !== String(id));
    writeData('enquiries.json', enquiries);
    if (target) {
      await db.logActivity({
        action: 'DELETE_ENQUIRY',
        entity_type: 'ENQUIRY',
        entity_id: id,
        details: `Deleted enquiry ${id} from ${target.customer_name}`
      });
    }
    return true;
  },

  // Sample Requests
  getSampleRequests: async () => {
    const fsData = await getFromFirestore('sample_requests', (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return fsData || readData('sample_requests.json');
  },
  saveSampleRequests: (list) => writeData('sample_requests.json', list),
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
    await syncFirestore('sample_requests', newId, newReq);
    try {
      const list = readData('sample_requests.json');
      list.unshift(newReq);
      writeData('sample_requests.json', list);
    } catch (e) {}
    await db.logActivity({
      action: 'NEW_SAMPLE_REQUEST',
      entity_type: 'SAMPLE_REQUEST',
      entity_id: newId,
      details: `Sample requested by ${newReq.customer_name} for ${newReq.product_name}`
    });
    return newReq;
  },
  updateSampleRequestStatus: async (id, status, notes = '') => {
    let target = null;
    if (isFirestoreConnected && firestoreDb) {
      try {
        const docRef = firestoreDb.collection('sample_requests').doc(String(id));
        const snap = await docRef.get();
        if (snap.exists) {
          target = snap.data();
          target.status = status;
          if (notes) target.notes = notes;
          target.updated_at = new Date().toISOString();
          await docRef.set(target, { merge: true });
        }
      } catch (e) {}
    }
    const list = readData('sample_requests.json');
    const local = list.find(s => String(s.sample_id) === String(id));
    if (local) {
      local.status = status;
      if (notes) local.notes = notes;
      local.updated_at = new Date().toISOString();
      writeData('sample_requests.json', list);
      if (!target) target = local;
    }
    if (target) {
      await db.logActivity({
        action: 'UPDATE_SAMPLE_STATUS',
        entity_type: 'SAMPLE_REQUEST',
        entity_id: id,
        details: `Sample request ${id} status set to ${status}`
      });
    }
    return target;
  },
  deleteSampleRequest: async (id) => {
    await syncFirestore('sample_requests', id, null, true);
    let list = readData('sample_requests.json');
    list = list.filter(s => String(s.sample_id) !== String(id));
    writeData('sample_requests.json', list);
    await db.logActivity({ action: 'DELETE_SAMPLE_REQUEST', entity_type: 'SAMPLE_REQUEST', entity_id: id, details: `Deleted sample request ${id}` });
    return true;
  },

  // Callback Requests
  getCallbackRequests: async () => {
    const fsData = await getFromFirestore('callback_requests', (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return fsData || readData('callback_requests.json');
  },
  saveCallbackRequests: (list) => writeData('callback_requests.json', list),
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
    await syncFirestore('callback_requests', newId, newItem);
    try {
      const list = readData('callback_requests.json');
      list.unshift(newItem);
      writeData('callback_requests.json', list);
    } catch (e) {}
    await db.logActivity({
      action: 'NEW_CALLBACK_REQUEST',
      entity_type: 'CALLBACK_REQUEST',
      entity_id: newId,
      details: `Callback requested by ${newItem.name} (${newItem.mobile})`
    });
    return newItem;
  },
  updateCallbackRequestStatus: async (id, status, notes = '') => {
    let target = null;
    if (isFirestoreConnected && firestoreDb) {
      try {
        const docRef = firestoreDb.collection('callback_requests').doc(String(id));
        const snap = await docRef.get();
        if (snap.exists) {
          target = snap.data();
          target.status = status;
          if (notes) target.notes = notes;
          target.updated_at = new Date().toISOString();
          await docRef.set(target, { merge: true });
        }
      } catch (e) {}
    }
    const list = readData('callback_requests.json');
    const local = list.find(c => String(c.callback_id) === String(id));
    if (local) {
      local.status = status;
      if (notes) local.notes = notes;
      local.updated_at = new Date().toISOString();
      writeData('callback_requests.json', list);
      if (!target) target = local;
    }
    return target;
  },
  deleteCallbackRequest: async (id) => {
    await syncFirestore('callback_requests', id, null, true);
    let list = readData('callback_requests.json');
    list = list.filter(c => String(c.callback_id) !== String(id));
    writeData('callback_requests.json', list);
    await db.logActivity({ action: 'DELETE_CALLBACK_REQUEST', entity_type: 'CALLBACK_REQUEST', entity_id: id, details: `Deleted callback request ${id}` });
    return true;
  },

  // Offers
  getOffers: async () => {
    const fsData = await getFromFirestore('offers', (a, b) => (b.offer_id || 0) - (a.offer_id || 0));
    const offers = fsData || readData('offers.json');
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
  saveOffers: (offers) => writeData('offers.json', offers),
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
    await syncFirestore('offers', newId, newItem);
    try {
      const list = readData('offers.json');
      list.unshift(newItem);
      writeData('offers.json', list);
    } catch (e) {}
    await db.logActivity({ action: 'ADD_OFFER', entity_type: 'OFFER', entity_id: newId, details: `Created offer "${newItem.title}"` });
    return newItem;
  },
  updateOffer: async (id, updateData) => {
    let target = null;
    if (isFirestoreConnected && firestoreDb) {
      try {
        const docRef = firestoreDb.collection('offers').doc(String(id));
        const snap = await docRef.get();
        if (snap.exists) {
          target = { ...snap.data(), ...updateData, updated_at: new Date().toISOString() };
          await docRef.set(target, { merge: true });
        }
      } catch (e) {}
    }
    const list = readData('offers.json');
    const index = list.findIndex(o => String(o.offer_id) === String(id));
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData, updated_at: new Date().toISOString() };
      writeData('offers.json', list);
      if (!target) target = list[index];
    }
    if (target) {
      await db.logActivity({ action: 'UPDATE_OFFER', entity_type: 'OFFER', entity_id: id, details: `Updated offer "${target.title}"` });
    }
    return target;
  },
  deleteOffer: async (id) => {
    await syncFirestore('offers', id, null, true);
    let list = readData('offers.json');
    const target = list.find(o => String(o.offer_id) === String(id));
    list = list.filter(o => String(o.offer_id) !== String(id));
    writeData('offers.json', list);
    if (target) {
      await db.logActivity({ action: 'DELETE_OFFER', entity_type: 'OFFER', entity_id: id, details: `Deleted offer "${target.title}"` });
    }
    return true;
  },

  // Announcements
  getAnnouncements: async () => {
    const fsData = await getFromFirestore('announcements', (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const list = fsData || readData('announcements.json');
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
  saveAnnouncements: (list) => writeData('announcements.json', list),
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
    await syncFirestore('announcements', newId, newItem);
    try {
      const list = readData('announcements.json');
      list.unshift(newItem);
      writeData('announcements.json', list);
    } catch (e) {}
    await db.logActivity({ action: 'ADD_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: newId, details: `Added announcement "${newItem.title}"` });
    return newItem;
  },
  updateAnnouncement: async (id, updateData) => {
    let target = null;
    if (isFirestoreConnected && firestoreDb) {
      try {
        const docRef = firestoreDb.collection('announcements').doc(String(id));
        const snap = await docRef.get();
        if (snap.exists) {
          target = { ...snap.data(), ...updateData, updated_at: new Date().toISOString() };
          await docRef.set(target, { merge: true });
        }
      } catch (e) {}
    }
    const list = readData('announcements.json');
    const index = list.findIndex(a => String(a.announcement_id) === String(id));
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData, updated_at: new Date().toISOString() };
      writeData('announcements.json', list);
      if (!target) target = list[index];
    }
    if (target) {
      await db.logActivity({ action: 'UPDATE_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: id, details: `Updated announcement "${target.title}"` });
    }
    return target;
  },
  deleteAnnouncement: async (id) => {
    await syncFirestore('announcements', id, null, true);
    let list = readData('announcements.json');
    const target = list.find(a => String(a.announcement_id) === String(id));
    list = list.filter(a => String(a.announcement_id) !== String(id));
    writeData('announcements.json', list);
    if (target) {
      await db.logActivity({ action: 'DELETE_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: id, details: `Deleted announcement "${target.title}"` });
    }
    return true;
  },

  // Admin Auth
  getAdmin: async () => {
    const fsData = await getFromFirestore('admins');
    if (fsData && fsData.length > 0) return fsData;
    return readData('admin.json', [{ admin_id: 1, username: 'admin', password_hash: 'admin123', name: 'Tirupur Admin Owner' }]);
  },
  verifyAdmin: async (username, password) => {
    const admins = await db.getAdmin();
    return admins.find(a => a.username === username && a.password_hash === password);
  }
};
