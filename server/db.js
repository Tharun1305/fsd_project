/**
 * server/db.js
 *
 * Unified data-access layer.
 *
 * When Firestore is connected (isFirestoreConnected === true):
 *   - ALL reads come from Firestore (globally shared, real-time).
 *   - ALL writes go to Firestore first, then update the local JSON file as a
 *     redundant backup (never as the source of truth).
 *
 * When Firestore is NOT connected (local dev without credentials):
 *   - ALL reads/writes use local JSON files under server/data/.
 *   - This is purely a convenience fallback for offline development.
 *
 * Data flow:
 *   Write: Firestore (primary) → local JSON (backup)
 *   Read:  Firestore (primary) → local JSON (fallback)
 */

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

// ─── Local JSON helpers (used as fallback / backup only) ───────────────────────

export function readData(filename, defaultVal = []) {
  const filepath = getFilePath(filename);
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(defaultVal, null, 2), 'utf-8');
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
  const filepath = getFilePath(filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`Warning: could not write backup file ${filename}:`, err.message);
  }
}

// ─── Firestore helpers ─────────────────────────────────────────────────────────

/**
 * Read all documents from a Firestore collection.
 * Returns null if Firestore is not connected.
 */
async function fsReadAll(collection) {
  if (!isFirestoreConnected || !firestoreDb) return null;
  try {
    const snap = await firestoreDb.collection(collection).get();
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.warn(`Firestore read error [${collection}]:`, err.message);
    return null;
  }
}

/**
 * Write (merge) a single document to Firestore.
 * Fire-and-forget — does not block the response.
 */
function fsWrite(collection, id, data) {
  if (!isFirestoreConnected || !firestoreDb || !id) return;
  firestoreDb.collection(collection).doc(String(id))
    .set(data, { merge: true })
    .catch(err => console.warn(`Firestore write error [${collection}/${id}]:`, err.message));
}

/**
 * Delete a single document from Firestore.
 * Fire-and-forget.
 */
function fsDelete(collection, id) {
  if (!isFirestoreConnected || !firestoreDb || !id) return;
  firestoreDb.collection(collection).doc(String(id))
    .delete()
    .catch(err => console.warn(`Firestore delete error [${collection}/${id}]:`, err.message));
}

/**
 * Read all documents from a Firestore collection synchronously-ish via a
 * cached snapshot.  We use the async version everywhere in the new db object.
 * This legacy helper keeps backward-compat for code that calls readData() directly.
 */
function syncFirestore(collection, id, data, isDelete = false) {
  if (isDelete) {
    fsDelete(collection, id);
  } else if (data) {
    fsWrite(collection, id, data);
  }
}

// ─── Database object ───────────────────────────────────────────────────────────

export const db = {

  // ── Activity History & Audit Logs ──────────────────────────────────────────

  getActivityLogs: async () => {
    if (isFirestoreConnected) {
      const docs = await fsReadAll('activity_logs');
      if (docs !== null) {
        return docs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }
    }
    return readData('activity_logs.json', []);
  },

  logActivity: ({ action, entity_type, entity_id, details, user = 'Admin' }) => {
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
      // Write to Firestore (async, fire-and-forget)
      fsWrite('activity_logs', newLog.log_id, newLog);
      // Also update local JSON backup
      try {
        const logs = readData('activity_logs.json', []);
        logs.unshift(newLog);
        if (logs.length > 500) logs.length = 500;
        writeData('activity_logs.json', logs);
      } catch (e) { /* ignore backup failures */ }
      return newLog;
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  },

  // ── Categories ─────────────────────────────────────────────────────────────

  getCategories: async () => {
    if (isFirestoreConnected) {
      const docs = await fsReadAll('categories');
      if (docs !== null) return docs;
    }
    return readData('categories.json');
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
    fsWrite('categories', newId, newCat);
    // Update local backup
    const cats = readData('categories.json');
    cats.push(newCat);
    writeData('categories.json', cats);
    db.logActivity({ action: 'CREATE_CATEGORY', entity_type: 'CATEGORY', entity_id: newId, details: `Category ${newCat.category_name} created` });
    return newCat;
  },

  updateCategory: async (id, updateData) => {
    const cats = await db.getCategories();
    const index = cats.findIndex(c => String(c.category_id) === String(id));
    if (index !== -1) {
      cats[index] = { ...cats[index], ...updateData };
      fsWrite('categories', id, cats[index]);
      writeData('categories.json', cats);
      db.logActivity({ action: 'UPDATE_CATEGORY', entity_type: 'CATEGORY', entity_id: id, details: `Category ${cats[index].category_name} updated` });
      return cats[index];
    }
    return null;
  },

  deleteCategory: async (id) => {
    const cats = await db.getCategories();
    const target = cats.find(c => String(c.category_id) === String(id));
    const remaining = cats.filter(c => String(c.category_id) !== String(id));
    writeData('categories.json', remaining);
    fsDelete('categories', id);
    if (target) {
      db.logActivity({ action: 'DELETE_CATEGORY', entity_type: 'CATEGORY', entity_id: id, details: `Category ${target.category_name} deleted` });
    }
    return true;
  },

  // ── Products ───────────────────────────────────────────────────────────────

  getProducts: async () => {
    let prods;
    if (isFirestoreConnected) {
      const docs = await fsReadAll('products');
      if (docs !== null) prods = docs;
    }
    if (!prods) prods = readData('products.json');
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
    const all = await db.getProducts();
    return all.find(p => String(p.product_id) === String(id));
  },

  saveProducts: (products) => writeData('products.json', products),

  addProduct: async (productData) => {
    const products = await db.getProducts();
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
    products.unshift(newProduct);
    fsWrite('products', newId, newProduct);
    writeData('products.json', products);
    db.logActivity({
      action: 'ADD_PRODUCT',
      entity_type: 'PRODUCT',
      entity_id: newId,
      details: `Added new product "${newProduct.product_name}" (${newProduct.product_code}) at ${newProduct.price}`
    });
    return newProduct;
  },

  updateProduct: async (id, updateData) => {
    const products = await db.getProducts();
    const index = products.findIndex(p => String(p.product_id) === String(id));
    if (index !== -1) {
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
      products[index] = {
        ...products[index],
        ...processed,
        updated_at: new Date().toISOString()
      };
      fsWrite('products', id, products[index]);
      writeData('products.json', products);
      db.logActivity({
        action: 'UPDATE_PRODUCT',
        entity_type: 'PRODUCT',
        entity_id: id,
        details: `Updated product "${products[index].product_name}" (${products[index].product_code})`
      });
      return products[index];
    }
    return null;
  },

  deleteProduct: async (id) => {
    const products = await db.getProducts();
    const target = products.find(p => String(p.product_id) === String(id));
    const remaining = products.filter(p => String(p.product_id) !== String(id));
    writeData('products.json', remaining);
    fsDelete('products', id);
    if (target) {
      db.logActivity({
        action: 'DELETE_PRODUCT',
        entity_type: 'PRODUCT',
        entity_id: id,
        details: `Deleted product "${target.product_name}" (${target.product_code})`
      });
    }
    return true;
  },

  duplicateProduct: async (id) => {
    const products = await db.getProducts();
    const target = products.find(p => String(p.product_id) === String(id));
    if (!target) return null;
    const newId = Date.now().toString();
    const newProduct = {
      ...target,
      product_id: newId,
      product_name: `${target.product_name} (Copy)`,
      product_code: `${target.product_code}-COPY`,
      created_at: new Date().toISOString()
    };
    products.unshift(newProduct);
    fsWrite('products', newId, newProduct);
    writeData('products.json', products);
    db.logActivity({
      action: 'DUPLICATE_PRODUCT',
      entity_type: 'PRODUCT',
      entity_id: newId,
      details: `Duplicated product "${target.product_name}" -> "${newProduct.product_name}"`
    });
    return newProduct;
  },

  // ── Enquiries & Customer Timeline ──────────────────────────────────────────

  getEnquiries: async () => {
    let enquiries;
    if (isFirestoreConnected) {
      const docs = await fsReadAll('enquiries');
      if (docs !== null) enquiries = docs;
    }
    if (!enquiries) enquiries = readData('enquiries.json');
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
    const enquiries = await db.getEnquiries();
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
    enquiries.unshift(newEnquiry);
    fsWrite('enquiries', newEnquiryId, newEnquiry);
    writeData('enquiries.json', enquiries);
    db.logActivity({
      action: 'NEW_ENQUIRY',
      entity_type: 'ENQUIRY',
      entity_id: newEnquiryId,
      details: `New enquiry received from ${newEnquiry.customer_name} (${newEnquiry.company_name}) for ${newEnquiry.quantity} Pcs of ${newEnquiry.product_name}`
    });
    return newEnquiry;
  },

  updateEnquiryStatus: async (id, status, note = '', author = 'Admin') => {
    const enquiries = await db.getEnquiries();
    const target = enquiries.find(e => String(e.enquiry_id) === String(id));
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
      fsWrite('enquiries', id, target);
      writeData('enquiries.json', enquiries);
      db.logActivity({
        action: 'UPDATE_ENQUIRY_STATUS',
        entity_type: 'ENQUIRY',
        entity_id: id,
        details: `Enquiry ${id} status changed: ${oldStatus} -> ${status} (${note || 'No notes'})`
      });
      return target;
    }
    return null;
  },

  addEnquiryNote: async (id, note, author = 'Admin') => {
    const enquiries = await db.getEnquiries();
    const target = enquiries.find(e => String(e.enquiry_id) === String(id));
    if (target) {
      if (!Array.isArray(target.history)) target.history = [];
      target.history.unshift({
        timestamp: new Date().toISOString(),
        status: target.status,
        note: note,
        author: author
      });
      target.updated_at = new Date().toISOString();
      fsWrite('enquiries', id, target);
      writeData('enquiries.json', enquiries);
      db.logActivity({
        action: 'ADD_ENQUIRY_NOTE',
        entity_type: 'ENQUIRY',
        entity_id: id,
        details: `Note added to enquiry ${id}: "${note}"`
      });
      return target;
    }
    return null;
  },

  updateEnquiry: async (id, updateData) => {
    const enquiries = await db.getEnquiries();
    const index = enquiries.findIndex(e => String(e.enquiry_id) === String(id));
    if (index !== -1) {
      enquiries[index] = {
        ...enquiries[index],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      fsWrite('enquiries', id, enquiries[index]);
      writeData('enquiries.json', enquiries);
      db.logActivity({
        action: 'EDIT_ENQUIRY',
        entity_type: 'ENQUIRY',
        entity_id: id,
        details: `Enquiry ${id} details updated`
      });
      return enquiries[index];
    }
    return null;
  },

  deleteEnquiry: async (id) => {
    const enquiries = await db.getEnquiries();
    const target = enquiries.find(e => String(e.enquiry_id) === String(id));
    const remaining = enquiries.filter(e => String(e.enquiry_id) !== String(id));
    writeData('enquiries.json', remaining);
    fsDelete('enquiries', id);
    if (target) {
      db.logActivity({
        action: 'DELETE_ENQUIRY',
        entity_type: 'ENQUIRY',
        entity_id: id,
        details: `Deleted enquiry ${id} from ${target.customer_name}`
      });
    }
    return true;
  },

  // ── Sample Requests ────────────────────────────────────────────────────────

  getSampleRequests: async () => {
    if (isFirestoreConnected) {
      const docs = await fsReadAll('sample_requests');
      if (docs !== null) return docs;
    }
    return readData('sample_requests.json');
  },

  saveSampleRequests: (list) => writeData('sample_requests.json', list),

  addSampleRequest: async (req) => {
    const requests = await db.getSampleRequests();
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
    requests.unshift(newReq);
    fsWrite('sample_requests', newId, newReq);
    writeData('sample_requests.json', requests);
    db.logActivity({
      action: 'NEW_SAMPLE_REQUEST',
      entity_type: 'SAMPLE_REQUEST',
      entity_id: newId,
      details: `Sample requested by ${newReq.customer_name} for ${newReq.product_name}`
    });
    return newReq;
  },

  updateSampleRequestStatus: async (id, status, notes = '') => {
    const requests = await db.getSampleRequests();
    const target = requests.find(s => String(s.sample_id) === String(id));
    if (target) {
      target.status = status;
      if (notes) target.notes = notes;
      target.updated_at = new Date().toISOString();
      fsWrite('sample_requests', id, target);
      writeData('sample_requests.json', requests);
      db.logActivity({
        action: 'UPDATE_SAMPLE_STATUS',
        entity_type: 'SAMPLE_REQUEST',
        entity_id: id,
        details: `Sample request ${id} status set to ${status}`
      });
      return target;
    }
    return null;
  },

  deleteSampleRequest: async (id) => {
    const list = await db.getSampleRequests();
    const remaining = list.filter(s => String(s.sample_id) !== String(id));
    writeData('sample_requests.json', remaining);
    fsDelete('sample_requests', id);
    db.logActivity({ action: 'DELETE_SAMPLE_REQUEST', entity_type: 'SAMPLE_REQUEST', entity_id: id, details: `Deleted sample request ${id}` });
    return true;
  },

  // ── Callback Requests ──────────────────────────────────────────────────────

  getCallbackRequests: async () => {
    if (isFirestoreConnected) {
      const docs = await fsReadAll('callback_requests');
      if (docs !== null) return docs;
    }
    return readData('callback_requests.json');
  },

  saveCallbackRequests: (list) => writeData('callback_requests.json', list),

  addCallbackRequest: async (req) => {
    const list = await db.getCallbackRequests();
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
    list.unshift(newItem);
    fsWrite('callback_requests', newId, newItem);
    writeData('callback_requests.json', list);
    db.logActivity({
      action: 'NEW_CALLBACK_REQUEST',
      entity_type: 'CALLBACK_REQUEST',
      entity_id: newId,
      details: `Callback requested by ${newItem.name} (${newItem.mobile})`
    });
    return newItem;
  },

  updateCallbackRequestStatus: async (id, status, notes = '') => {
    const list = await db.getCallbackRequests();
    const target = list.find(c => String(c.callback_id) === String(id));
    if (target) {
      target.status = status;
      if (notes) target.notes = notes;
      target.updated_at = new Date().toISOString();
      fsWrite('callback_requests', id, target);
      writeData('callback_requests.json', list);
      db.logActivity({
        action: 'UPDATE_CALLBACK_STATUS',
        entity_type: 'CALLBACK_REQUEST',
        entity_id: id,
        details: `Callback request ${id} status updated to ${status}`
      });
      return target;
    }
    return null;
  },

  deleteCallbackRequest: async (id) => {
    const list = await db.getCallbackRequests();
    const remaining = list.filter(c => String(c.callback_id) !== String(id));
    writeData('callback_requests.json', remaining);
    fsDelete('callback_requests', id);
    db.logActivity({ action: 'DELETE_CALLBACK_REQUEST', entity_type: 'CALLBACK_REQUEST', entity_id: id, details: `Deleted callback request ${id}` });
    return true;
  },

  // ── Offers ─────────────────────────────────────────────────────────────────

  getOffers: async () => {
    let offers;
    if (isFirestoreConnected) {
      const docs = await fsReadAll('offers');
      if (docs !== null) offers = docs;
    }
    if (!offers) offers = readData('offers.json');
    const today = new Date().toISOString().split('T')[0];
    return offers.map(o => ({
      ...o,
      is_active: !o.expiry_date || o.expiry_date >= today
    }));
  },

  getActiveOffers: async () => {
    const all = await db.getOffers();
    return all.filter(o => o.is_active && o.status !== 'Disabled');
  },

  saveOffers: (offers) => writeData('offers.json', offers),

  addOffer: async (data) => {
    const list = await db.getOffers();
    const newId = 'OFF-' + Date.now().toString().slice(-5);
    const newItem = {
      offer_id: newId,
      title: data.title || 'New Special Offer',
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop',
      discount_text: data.discount_text || 'Special Bulk Discount',
      coupon_code: data.coupon_code || '',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      expiry_date: data.expiry_date || '2027-12-31',
      status: data.status || 'Active',
      created_at: new Date().toISOString()
    };
    list.unshift(newItem);
    fsWrite('offers', newId, newItem);
    writeData('offers.json', list);
    db.logActivity({ action: 'ADD_OFFER', entity_type: 'OFFER', entity_id: newId, details: `Created offer "${newItem.title}"` });
    return newItem;
  },

  updateOffer: async (id, updateData) => {
    const list = await db.getOffers();
    const index = list.findIndex(o => String(o.offer_id) === String(id));
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData, updated_at: new Date().toISOString() };
      fsWrite('offers', id, list[index]);
      writeData('offers.json', list);
      db.logActivity({ action: 'UPDATE_OFFER', entity_type: 'OFFER', entity_id: id, details: `Updated offer "${list[index].title}"` });
      return list[index];
    }
    return null;
  },

  deleteOffer: async (id) => {
    const list = await db.getOffers();
    const target = list.find(o => String(o.offer_id) === String(id));
    const remaining = list.filter(o => String(o.offer_id) !== String(id));
    writeData('offers.json', remaining);
    fsDelete('offers', id);
    if (target) {
      db.logActivity({ action: 'DELETE_OFFER', entity_type: 'OFFER', entity_id: id, details: `Deleted offer "${target.title}"` });
    }
    return true;
  },

  // ── Announcements ──────────────────────────────────────────────────────────

  getAnnouncements: async () => {
    let list;
    if (isFirestoreConnected) {
      const docs = await fsReadAll('announcements');
      if (docs !== null) list = docs;
    }
    if (!list) list = readData('announcements.json');
    const today = new Date().toISOString().split('T')[0];
    return list.map(a => ({
      ...a,
      is_active: !a.expiry_date || a.expiry_date >= today
    }));
  },

  getActiveAnnouncements: async () => {
    const all = await db.getAnnouncements();
    return all.filter(a => a.is_active && a.status !== 'Disabled');
  },

  saveAnnouncements: (list) => writeData('announcements.json', list),

  addAnnouncement: async (data) => {
    const list = await db.getAnnouncements();
    const newId = 'ANN-' + Date.now().toString().slice(-5);
    const newItem = {
      announcement_id: newId,
      title: data.title || 'Announcement',
      description: data.description || '',
      badge: data.badge || 'New Collection',
      expiry_date: data.expiry_date || '2027-12-31',
      status: data.status || 'Active',
      created_at: new Date().toISOString()
    };
    list.unshift(newItem);
    fsWrite('announcements', newId, newItem);
    writeData('announcements.json', list);
    db.logActivity({ action: 'ADD_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: newId, details: `Added announcement "${newItem.title}"` });
    return newItem;
  },

  updateAnnouncement: async (id, updateData) => {
    const list = await db.getAnnouncements();
    const index = list.findIndex(a => String(a.announcement_id) === String(id));
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData, updated_at: new Date().toISOString() };
      fsWrite('announcements', id, list[index]);
      writeData('announcements.json', list);
      db.logActivity({ action: 'UPDATE_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: id, details: `Updated announcement "${list[index].title}"` });
      return list[index];
    }
    return null;
  },

  deleteAnnouncement: async (id) => {
    const list = await db.getAnnouncements();
    const target = list.find(a => String(a.announcement_id) === String(id));
    const remaining = list.filter(a => String(a.announcement_id) !== String(id));
    writeData('announcements.json', remaining);
    fsDelete('announcements', id);
    if (target) {
      db.logActivity({ action: 'DELETE_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: id, details: `Deleted announcement "${target.title}"` });
    }
    return true;
  },

  // ── Admin Auth ─────────────────────────────────────────────────────────────

  getAdmin: () => readData('admin.json', [{ admin_id: 1, username: 'admin', password_hash: 'admin123', name: 'Tirupur Admin Owner' }]),

  verifyAdmin: (username, password) => {
    const admins = db.getAdmin();
    return admins.find(a => a.username === username && a.password_hash === password);
  }
};
