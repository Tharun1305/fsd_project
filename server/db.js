import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Database helper functions
export const db = {
  // Categories
  getCategories: () => readData('categories.json'),
  saveCategories: (cats) => writeData('categories.json', cats),

  // Products
  getProducts: () => {
    const prods = readData('products.json');
    // Automate auto-organization & expiry flags
    const now = new Date();
    return prods.map(p => {
      const createdDate = new Date(p.created_at || Date.now());
      const ageDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
      return {
        ...p,
        is_new_arrival: ageDays <= (p.new_arrival_days || 30)
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
      product_code: productData.product_code || `TPG-${Math.floor(100 + Math.random() * 900)}`,
      category_id: productData.category_id || '1',
      description: productData.description || '',
      fabric: productData.fabric || '100% Combed Cotton Bio-Wash',
      price: productData.price || '₹120 - ₹160',
      moq: Number(productData.moq) || 100,
      availability: productData.availability || 'Available',
      images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop'],
      sizes: productData.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
      colours: productData.colours || ['Navy Blue', 'Black', 'White', 'Melange Grey'],
      gsm: productData.gsm || '180 GSM',
      tags: productData.tags || ['Bio-Wash', 'Pre-Shrunk'],
      created_at: new Date().toISOString()
    };
    products.unshift(newProduct);
    db.saveProducts(products);
    return newProduct;
  },
  updateProduct: (id, updateData) => {
    const products = db.getProducts();
    const index = products.findIndex(p => String(p.product_id) === String(id));
    if (index !== -1) {
      products[index] = { ...products[index], ...updateData, updated_at: new Date().toISOString() };
      db.saveProducts(products);
      return products[index];
    }
    return null;
  },
  deleteProduct: (id) => {
    let products = db.getProducts();
    products = products.filter(p => String(p.product_id) !== String(id));
    db.saveProducts(products);
    return true;
  },
  duplicateProduct: (id) => {
    const products = db.getProducts();
    const target = products.find(p => String(p.product_id) === String(id));
    if (!target) return null;
    const newProduct = {
      ...target,
      product_id: Date.now().toString(),
      product_name: `${target.product_name} (Copy)`,
      product_code: `${target.product_code}-COPY`,
      created_at: new Date().toISOString()
    };
    products.unshift(newProduct);
    db.saveProducts(products);
    return newProduct;
  },

  // Enquiries
  getEnquiries: () => readData('enquiries.json'),
  addEnquiry: (enquiry) => {
    const enquiries = db.getEnquiries();
    const newEnquiry = {
      enquiry_id: 'ENQ-' + Date.now().toString().slice(-6),
      customer_name: enquiry.customer_name,
      company_name: enquiry.company_name || 'N/A',
      mobile: enquiry.mobile,
      email: enquiry.email || '',
      location: enquiry.location,
      buyer_type: enquiry.buyer_type || 'Wholesaler',
      product_id: enquiry.product_id || '',
      product_name: enquiry.product_name || 'General Catalogue Enquiry',
      quantity: Number(enquiry.quantity) || 100,
      size: enquiry.size || 'Assorted (S-XXL)',
      colour: enquiry.colour || 'Assorted',
      sample_required: Boolean(enquiry.sample_required),
      message: enquiry.message || '',
      status: 'New',
      created_at: new Date().toISOString()
    };
    enquiries.unshift(newEnquiry);
    writeData('enquiries.json', enquiries);
    return newEnquiry;
  },
  updateEnquiryStatus: (id, status) => {
    const enquiries = db.getEnquiries();
    const target = enquiries.find(e => String(e.enquiry_id) === String(id));
    if (target) {
      target.status = status;
      writeData('enquiries.json', enquiries);
      return target;
    }
    return null;
  },

  // Sample Requests
  getSampleRequests: () => readData('sample_requests.json'),
  addSampleRequest: (req) => {
    const requests = db.getSampleRequests();
    const newReq = {
      sample_id: 'SMP-' + Date.now().toString().slice(-6),
      customer_name: req.customer_name,
      company_name: req.company_name || 'N/A',
      mobile: req.mobile,
      location: req.location,
      product_id: req.product_id || '',
      product_name: req.product_name || '',
      requirement: req.requirement || 'Fabric Swatch & Quality Sample',
      message: req.message || '',
      status: 'New',
      created_at: new Date().toISOString()
    };
    requests.unshift(newReq);
    writeData('sample_requests.json', requests);
    return newReq;
  },

  // Callback Requests
  getCallbackRequests: () => readData('callback_requests.json'),
  addCallbackRequest: (req) => {
    const list = db.getCallbackRequests();
    const newItem = {
      callback_id: 'CB-' + Date.now().toString().slice(-6),
      name: req.name,
      company: req.company || '',
      mobile: req.mobile,
      requirement: req.requirement || 'Wholesale Pricing & Bulk Order',
      preferred_time: req.preferred_time || 'Immediate / Anytime',
      status: 'Pending',
      created_at: new Date().toISOString()
    };
    list.unshift(newItem);
    writeData('callback_requests.json', list);
    return newItem;
  },

  // Offers (Auto-hides expired offers)
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
    const newItem = {
      offer_id: 'OFF-' + Date.now().toString().slice(-5),
      title: data.title,
      description: data.description,
      image: data.image || 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop',
      discount_text: data.discount_text || '10% OFF on 500+ Pcs',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      expiry_date: data.expiry_date || '2026-12-31',
      status: 'Active',
      created_at: new Date().toISOString()
    };
    list.unshift(newItem);
    db.saveOffers(list);
    return newItem;
  },

  // Announcements (Auto-hides expired announcements)
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
    const newItem = {
      announcement_id: 'ANN-' + Date.now().toString().slice(-5),
      title: data.title,
      description: data.description,
      badge: data.badge || 'New Collection Launch',
      expiry_date: data.expiry_date || '2026-12-31',
      status: 'Active',
      created_at: new Date().toISOString()
    };
    list.unshift(newItem);
    db.saveAnnouncements(list);
    return newItem;
  },

  // Admin Auth
  getAdmin: () => readData('admin.json', [{ admin_id: 1, username: 'admin', password_hash: 'admin123', name: 'Tirupur Admin Owner' }]),
  verifyAdmin: (username, password) => {
    const admins = db.getAdmin();
    return admins.find(a => a.username === username && a.password_hash === password);
  }
};
