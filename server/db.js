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
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
}

// Real-time synchronization helper for Google Cloud Firestore
function syncFirestore(collection, id, data, isDelete = false) {
  if (isFirestoreConnected && firestoreDb && id) {
    try {
      const docRef = firestoreDb.collection(collection).doc(String(id));
      if (isDelete) {
        docRef.delete().catch(err => console.warn(`Firestore delete error [${collection}/${id}]:`, err.message));
      } else if (data) {
        docRef.set(data, { merge: true }).catch(err => console.warn(`Firestore sync error [${collection}/${id}]:`, err.message));
      }
    } catch (e) {
      console.warn(`Firestore sync exception [${collection}]:`, e.message);
    }
  }
}

// Database helper functions
export const db = {
  // Activity History & Audit Logs
  getActivityLogs: () => {
    return readData('activity_logs.json', []);
  },
  logActivity: ({ action, entity_type, entity_id, details, user = 'Admin' }) => {
    try {
      const logs = readData('activity_logs.json', []);
      const newLog = {
        log_id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        action,
        entity_type,
        entity_id: String(entity_id || ''),
        details: details || '',
        user,
        timestamp: new Date().toISOString()
      };
      logs.unshift(newLog);
      if (logs.length > 500) logs.length = 500;
      writeData('activity_logs.json', logs);
      syncFirestore('activity_logs', newLog.log_id, newLog);
      return newLog;
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  },

  // Categories
  getCategories: () => readData('categories.json'),
  saveCategories: (cats) => writeData('categories.json', cats),
  addCategory: (catData) => {
    const cats = db.getCategories();
    const newId = String(Date.now());
    const newCat = {
      category_id: newId,
      category_name: catData.category_name || 'New Category',
      icon: catData.icon || 'Layers',
      description: catData.description || ''
    };
    cats.push(newCat);
    db.saveCategories(cats);
    syncFirestore('categories', newId, newCat);
    db.logActivity({ action: 'CREATE_CATEGORY', entity_type: 'CATEGORY', entity_id: newId, details: `Category ${newCat.category_name} created` });
    return newCat;
  },
  updateCategory: (id, updateData) => {
    const cats = db.getCategories();
    const index = cats.findIndex(c => String(c.category_id) === String(id));
    if (index !== -1) {
      cats[index] = { ...cats[index], ...updateData };
      db.saveCategories(cats);
      syncFirestore('categories', id, cats[index]);
      db.logActivity({ action: 'UPDATE_CATEGORY', entity_type: 'CATEGORY', entity_id: id, details: `Category ${cats[index].category_name} updated` });
      return cats[index];
    }
    return null;
  },
  deleteCategory: (id) => {
    let cats = db.getCategories();
    const target = cats.find(c => String(c.category_id) === String(id));
    cats = cats.filter(c => String(c.category_id) !== String(id));
    db.saveCategories(cats);
    syncFirestore('categories', id, null, true);
    if (target) {
      db.logActivity({ action: 'DELETE_CATEGORY', entity_type: 'CATEGORY', entity_id: id, details: `Category ${target.category_name} deleted` });
    }
    return true;
  },

  // Products
  getProducts: () => {
    const prods = readData('products.json');
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
  getProductById: (id) => db.getProducts().find(p => String(p.product_id) === String(id)),
  saveProducts: (products) => writeData('products.json', products),
  addProduct: (productData) => {
    const products = db.getProducts();
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
    db.saveProducts(products);
    syncFirestore('products', newId, newProduct);
    db.logActivity({
      action: 'ADD_PRODUCT',
      entity_type: 'PRODUCT',
      entity_id: newId,
      details: `Added new product "${newProduct.product_name}" (${newProduct.product_code}) at ${newProduct.price}`
    });
    return newProduct;
  },
  updateProduct: (id, updateData) => {
    const products = db.getProducts();
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
      db.saveProducts(products);
      syncFirestore('products', id, products[index]);
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
  deleteProduct: (id) => {
    let products = db.getProducts();
    const target = products.find(p => String(p.product_id) === String(id));
    products = products.filter(p => String(p.product_id) !== String(id));
    db.saveProducts(products);
    syncFirestore('products', id, null, true);
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
  duplicateProduct: (id) => {
    const products = db.getProducts();
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
    db.saveProducts(products);
    syncFirestore('products', newId, newProduct);
    db.logActivity({
      action: 'DUPLICATE_PRODUCT',
      entity_type: 'PRODUCT',
      entity_id: newId,
      details: `Duplicated product "${target.product_name}" -> "${newProduct.product_name}"`
    });
    return newProduct;
  },

  // Enquiries & Customer Timeline History
  getEnquiries: () => {
    const enquiries = readData('enquiries.json');
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
  addEnquiry: (enquiry) => {
    const enquiries = db.getEnquiries();
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
    db.saveEnquiries(enquiries);
    syncFirestore('enquiries', newEnquiryId, newEnquiry);
    db.logActivity({
      action: 'NEW_ENQUIRY',
      entity_type: 'ENQUIRY',
      entity_id: newEnquiryId,
      details: `New enquiry received from ${newEnquiry.customer_name} (${newEnquiry.company_name}) for ${newEnquiry.quantity} Pcs of ${newEnquiry.product_name}`
    });
    return newEnquiry;
  },
  updateEnquiryStatus: (id, status, note = '', author = 'Admin') => {
    const enquiries = db.getEnquiries();
    const target = enquiries.find(e => String(e.enquiry_id) === String(id));
    if (target) {
      const oldStatus = target.status;
      target.status = status;
      target.updated_at = new Date().toISOString();
      if (!Array.isArray(target.history)) {
        target.history = [];
      }
      target.history.unshift({
        timestamp: new Date().toISOString(),
        status: status,
        note: note || `Status updated from ${oldStatus} to ${status}`,
        author: author
      });
      db.saveEnquiries(enquiries);
      syncFirestore('enquiries', id, target);
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
  addEnquiryNote: (id, note, author = 'Admin') => {
    const enquiries = db.getEnquiries();
    const target = enquiries.find(e => String(e.enquiry_id) === String(id));
    if (target) {
      if (!Array.isArray(target.history)) {
        target.history = [];
      }
      target.history.unshift({
        timestamp: new Date().toISOString(),
        status: target.status,
        note: note,
        author: author
      });
      target.updated_at = new Date().toISOString();
      db.saveEnquiries(enquiries);
      syncFirestore('enquiries', id, target);
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
  updateEnquiry: (id, updateData) => {
    const enquiries = db.getEnquiries();
    const index = enquiries.findIndex(e => String(e.enquiry_id) === String(id));
    if (index !== -1) {
      enquiries[index] = {
        ...enquiries[index],
        ...updateData,
        updated_at: new Date().toISOString()
      };
      db.saveEnquiries(enquiries);
      syncFirestore('enquiries', id, enquiries[index]);
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
  deleteEnquiry: (id) => {
    let enquiries = db.getEnquiries();
    const target = enquiries.find(e => String(e.enquiry_id) === String(id));
    enquiries = enquiries.filter(e => String(e.enquiry_id) !== String(id));
    db.saveEnquiries(enquiries);
    syncFirestore('enquiries', id, null, true);
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

  // Sample Requests
  getSampleRequests: () => readData('sample_requests.json'),
  saveSampleRequests: (list) => writeData('sample_requests.json', list),
  addSampleRequest: (req) => {
    const requests = db.getSampleRequests();
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
    db.saveSampleRequests(requests);
    syncFirestore('sample_requests', newId, newReq);
    db.logActivity({
      action: 'NEW_SAMPLE_REQUEST',
      entity_type: 'SAMPLE_REQUEST',
      entity_id: newId,
      details: `Sample requested by ${newReq.customer_name} for ${newReq.product_name}`
    });
    return newReq;
  },
  updateSampleRequestStatus: (id, status, notes = '') => {
    const requests = db.getSampleRequests();
    const target = requests.find(s => String(s.sample_id) === String(id));
    if (target) {
      target.status = status;
      if (notes) target.notes = notes;
      target.updated_at = new Date().toISOString();
      db.saveSampleRequests(requests);
      syncFirestore('sample_requests', id, target);
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
  deleteSampleRequest: (id) => {
    let list = db.getSampleRequests();
    list = list.filter(s => String(s.sample_id) !== String(id));
    db.saveSampleRequests(list);
    syncFirestore('sample_requests', id, null, true);
    db.logActivity({ action: 'DELETE_SAMPLE_REQUEST', entity_type: 'SAMPLE_REQUEST', entity_id: id, details: `Deleted sample request ${id}` });
    return true;
  },

  // Callback Requests
  getCallbackRequests: () => readData('callback_requests.json'),
  saveCallbackRequests: (list) => writeData('callback_requests.json', list),
  addCallbackRequest: (req) => {
    const list = db.getCallbackRequests();
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
    db.saveCallbackRequests(list);
    syncFirestore('callback_requests', newId, newItem);
    db.logActivity({
      action: 'NEW_CALLBACK_REQUEST',
      entity_type: 'CALLBACK_REQUEST',
      entity_id: newId,
      details: `Callback requested by ${newItem.name} (${newItem.mobile})`
    });
    return newItem;
  },
  updateCallbackRequestStatus: (id, status, notes = '') => {
    const list = db.getCallbackRequests();
    const target = list.find(c => String(c.callback_id) === String(id));
    if (target) {
      target.status = status;
      if (notes) target.notes = notes;
      target.updated_at = new Date().toISOString();
      db.saveCallbackRequests(list);
      syncFirestore('callback_requests', id, target);
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
  deleteCallbackRequest: (id) => {
    let list = db.getCallbackRequests();
    list = list.filter(c => String(c.callback_id) !== String(id));
    db.saveCallbackRequests(list);
    syncFirestore('callback_requests', id, null, true);
    db.logActivity({ action: 'DELETE_CALLBACK_REQUEST', entity_type: 'CALLBACK_REQUEST', entity_id: id, details: `Deleted callback request ${id}` });
    return true;
  },

  // Offers
  getOffers: () => {
    const offers = readData('offers.json');
    const today = new Date().toISOString().split('T')[0];
    return offers.map(o => ({
      ...o,
      is_active: !o.expiry_date || o.expiry_date >= today
    }));
  },
  getActiveOffers: () => {
    return db.getOffers().filter(o => o.is_active && o.status !== 'Disabled');
  },
  saveOffers: (offers) => writeData('offers.json', offers),
  addOffer: (data) => {
    const list = db.getOffers();
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
    list.unshift(newItem);
    db.saveOffers(list);
    syncFirestore('offers', newId, newItem);
    db.logActivity({ action: 'ADD_OFFER', entity_type: 'OFFER', entity_id: newId, details: `Created offer "${newItem.title}"` });
    return newItem;
  },
  updateOffer: (id, updateData) => {
    const list = db.getOffers();
    const index = list.findIndex(o => String(o.offer_id) === String(id));
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData, updated_at: new Date().toISOString() };
      db.saveOffers(list);
      syncFirestore('offers', id, list[index]);
      db.logActivity({ action: 'UPDATE_OFFER', entity_type: 'OFFER', entity_id: id, details: `Updated offer "${list[index].title}"` });
      return list[index];
    }
    return null;
  },
  deleteOffer: (id) => {
    let list = db.getOffers();
    const target = list.find(o => String(o.offer_id) === String(id));
    list = list.filter(o => String(o.offer_id) !== String(id));
    db.saveOffers(list);
    syncFirestore('offers', id, null, true);
    if (target) {
      db.logActivity({ action: 'DELETE_OFFER', entity_type: 'OFFER', entity_id: id, details: `Deleted offer "${target.title}"` });
    }
    return true;
  },

  // Announcements
  getAnnouncements: () => {
    const list = readData('announcements.json');
    const today = new Date().toISOString().split('T')[0];
    return list.map(a => ({
      ...a,
      is_active: !a.expiry_date || a.expiry_date >= today
    }));
  },
  getActiveAnnouncements: () => {
    return db.getAnnouncements().filter(a => a.is_active && a.status !== 'Disabled');
  },
  saveAnnouncements: (list) => writeData('announcements.json', list),
  addAnnouncement: (data) => {
    const list = db.getAnnouncements();
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
    list.unshift(newItem);
    db.saveAnnouncements(list);
    syncFirestore('announcements', newId, newItem);
    db.logActivity({ action: 'ADD_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: newId, details: `Added announcement "${newItem.title}"` });
    return newItem;
  },
  updateAnnouncement: (id, updateData) => {
    const list = db.getAnnouncements();
    const index = list.findIndex(a => String(a.announcement_id) === String(id));
    if (index !== -1) {
      list[index] = { ...list[index], ...updateData, updated_at: new Date().toISOString() };
      db.saveAnnouncements(list);
      syncFirestore('announcements', id, list[index]);
      db.logActivity({ action: 'UPDATE_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: id, details: `Updated announcement "${list[index].title}"` });
      return list[index];
    }
    return null;
  },
  deleteAnnouncement: (id) => {
    let list = db.getAnnouncements();
    const target = list.find(a => String(a.announcement_id) === String(id));
    list = list.filter(a => String(a.announcement_id) !== String(id));
    db.saveAnnouncements(list);
    syncFirestore('announcements', id, null, true);
    if (target) {
      db.logActivity({ action: 'DELETE_ANNOUNCEMENT', entity_type: 'ANNOUNCEMENT', entity_id: id, details: `Deleted announcement "${target.title}"` });
    }
    return true;
  },

  // Admin Auth
  getAdmin: () => readData('admin.json', [{ admin_id: 1, username: 'admin', password_hash: 'admin123', name: 'Tirupur Admin Owner' }]),
  verifyAdmin: (username, password) => {
    const admins = db.getAdmin();
    return admins.find(a => a.username === username && a.password_hash === password);
  }
};
