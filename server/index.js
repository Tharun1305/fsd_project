import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { initializeSeedData } from './seed.js';
import { isFirestoreConnected } from './firestore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all incoming client requests
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Initialize seed data if empty
(async () => {
  try {
    const products = await db.getProducts();
    if (products.length === 0) {
      initializeSeedData();
    }
  } catch (err) {
    console.warn('Initial seed check notice:', err.message);
  }
})();

// System Health & Database Connection Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'G V Clothings B2B Backend',
    database: isFirestoreConnected ? 'Google Cloud Firestore (Live)' : 'Local Storage Engine (Fallback)',
    firestore_connected: isFirestoreConnected,
    mode: isFirestoreConnected ? 'firestore' : 'local_json',
    timestamp: new Date().toISOString()
  });
});

// REST API Endpoints

// 1. Categories
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await db.getCategories();
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const newCat = await db.addCategory(req.body);
    res.status(201).json({ success: true, data: newCat });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const updated = await db.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    await db.deleteCategory(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Products (with multi-filter, live search, and sorting)
app.get('/api/products', async (req, res) => {
  try {
    let products = await db.getProducts();
    const { q, category, fabric, color, size, availability, new_arrivals, latest } = req.query;

    if (q) {
      const term = q.toLowerCase().trim();
      products = products.filter(p =>
        (p.product_name && p.product_name.toLowerCase().includes(term)) ||
        (p.product_code && p.product_code.toLowerCase().includes(term)) ||
        (p.fabric && p.fabric.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    if (category && category !== 'all') {
      products = products.filter(p => String(p.category_id) === String(category));
    }

    if (fabric && fabric !== 'all') {
      products = products.filter(p => p.fabric && p.fabric.toLowerCase().includes(fabric.toLowerCase()));
    }

    if (color && color !== 'all') {
      products = products.filter(p => p.colours && p.colours.some(c => c.toLowerCase() === color.toLowerCase()));
    }

    if (size && size !== 'all') {
      products = products.filter(p => p.sizes && p.sizes.includes(size));
    }

    if (availability && availability !== 'all') {
      products = products.filter(p => p.availability && p.availability.toLowerCase() === availability.toLowerCase());
    }

    if (new_arrivals === 'true') {
      products = products.filter(p => p.is_new_arrival);
    }

    if (latest === 'true') {
      products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const all = await db.getProducts();
    const similar = all.filter(p =>
      String(p.product_id) !== String(product.product_id) &&
      (String(p.category_id) === String(product.category_id) || p.fabric === product.fabric)
    ).slice(0, 4);

    res.json({ success: true, data: product, similar });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Product Management
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = await db.addProduct(req.body);
    res.status(201).json({ success: true, message: 'Product added successfully', data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await db.updateProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/products/:id/quick-update', async (req, res) => {
  try {
    const { price, moq, availability } = req.body;
    const updated = await db.updateProduct(req.params.id, { price, moq: Number(moq), availability });
    if (!updated) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Quick update successful', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products/:id/duplicate', async (req, res) => {
  try {
    const duplicated = await db.duplicateProduct(req.params.id);
    if (!duplicated) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product duplicated successfully', data: duplicated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await db.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Enquiries & Follow-up History
app.get('/api/enquiries', async (req, res) => {
  try {
    const enquiries = await db.getEnquiries();
    res.json({ success: true, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/enquiries', async (req, res) => {
  try {
    const enquiry = await db.addEnquiry(req.body);
    res.status(201).json({
      success: true,
      message: 'Thank you. Your bulk enquiry has been received. Our team will contact you shortly.',
      data: enquiry
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/enquiries/:id', async (req, res) => {
  try {
    const updated = await db.updateEnquiry(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/enquiries/:id/status', async (req, res) => {
  try {
    const { status, note, author } = req.body;
    const updated = await db.updateEnquiryStatus(req.params.id, status, note, author);
    if (!updated) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/enquiries/:id/notes', async (req, res) => {
  try {
    const { note, author } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }
    const updated = await db.addEnquiryNote(req.params.id, note.trim(), author || 'Admin');
    if (!updated) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/enquiries/:id', async (req, res) => {
  try {
    await db.deleteEnquiry(req.params.id);
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Sample Requests
app.get('/api/sample-requests', async (req, res) => {
  try {
    const data = await db.getSampleRequests();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sample-requests', async (req, res) => {
  try {
    const sampleReq = await db.addSampleRequest(req.body);
    res.status(201).json({
      success: true,
      message: 'Sample request submitted successfully. Our Tiruppur dispatch coordinator will call you.',
      data: sampleReq
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/sample-requests/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await db.updateSampleRequestStatus(req.params.id, status, notes);
    if (!updated) return res.status(404).json({ success: false, message: 'Sample request not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/sample-requests/:id', async (req, res) => {
  try {
    await db.deleteSampleRequest(req.params.id);
    res.json({ success: true, message: 'Sample request deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Callback Requests
app.get('/api/callback-requests', async (req, res) => {
  try {
    const data = await db.getCallbackRequests();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/callback-requests', async (req, res) => {
  try {
    const cb = await db.addCallbackRequest(req.body);
    res.status(201).json({
      success: true,
      message: 'Callback request received. We will call you at your preferred time.',
      data: cb
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/callback-requests/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await db.updateCallbackRequestStatus(req.params.id, status, notes);
    if (!updated) return res.status(404).json({ success: false, message: 'Callback request not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/callback-requests/:id', async (req, res) => {
  try {
    await db.deleteCallbackRequest(req.params.id);
    res.json({ success: true, message: 'Callback request deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Offers & Announcements
app.get('/api/offers', async (req, res) => {
  try {
    const data = await db.getActiveOffers();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/offers', async (req, res) => {
  try {
    const data = await db.getOffers();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/offers', async (req, res) => {
  try {
    const offer = await db.addOffer(req.body);
    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/offers/:id', async (req, res) => {
  try {
    const updated = await db.updateOffer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/offers/:id', async (req, res) => {
  try {
    await db.deleteOffer(req.params.id);
    res.json({ success: true, message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/announcements', async (req, res) => {
  try {
    const data = await db.getActiveAnnouncements();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/admin/announcements', async (req, res) => {
  try {
    const data = await db.getAnnouncements();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const ann = await db.addAnnouncement(req.body);
    res.status(201).json({ success: true, data: ann });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/announcements/:id', async (req, res) => {
  try {
    const updated = await db.updateAnnouncement(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    await db.deleteAnnouncement(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Activity & Audit History Logs
app.get('/api/admin/activity-logs', async (req, res) => {
  try {
    const logs = await db.getActivityLogs();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Admin Auth
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
    const admin = await db.verifyAdmin(username.trim(), password);
    if (admin) {
      await db.logActivity({
        action: 'ADMIN_LOGIN',
        entity_type: 'AUTH',
        entity_id: admin.username,
        details: `Administrator "${admin.name}" signed in successfully`,
        user: admin.name
      });
      res.json({
        success: true,
        token: 'admin-token-' + Date.now(),
        admin: { username: admin.username, name: admin.name }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Stats Endpoint
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [products, enquiries, samples, callbacks, offers] = await Promise.all([
      db.getProducts(),
      db.getEnquiries(),
      db.getSampleRequests(),
      db.getCallbackRequests(),
      db.getActiveOffers()
    ]);

    res.json({
      success: true,
      data: {
        total_products: products.length,
        new_enquiries: enquiries.filter(e => e.status === 'New').length,
        total_enquiries: enquiries.length,
        sample_requests: samples.length,
        callback_requests: callbacks.length,
        out_of_stock: products.filter(p => p.availability === 'Out of Stock').length,
        active_offers: offers.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. AI Chatbot Endpoint (Powered by Groq AI)
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.6-27b'];

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], language = 'en' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const [products, categories, offers] = await Promise.all([
      db.getProducts(),
      db.getCategories(),
      db.getActiveOffers()
    ]);

    const catalogSummary = products.map(p => 
      `- [Code: ${p.product_code}] ${p.product_name} (${p.fabric}, ${p.gsm}) | Price: ${p.price} | MOQ: ${p.moq} ${p.unit || 'Kg'} | Status: ${p.availability} | Colors: ${(p.colours || []).join(', ')}`
    ).join('\n');

    const categoriesSummary = categories.map(c => `- ${c.category_name}: ${c.description}`).join('\n');
    const offersSummary = offers.map(o => `- ${o.title}: ${o.discount_text || ''} (Code: ${o.coupon_code || ''})`).join('\n');

    const systemPrompt = `You are the intelligent B2B Sales & Customer Support AI Assistant for "G V Clothings", a premier textile and fabric manufacturer & wholesale supplier based in Tiruppur, Tamil Nadu, India.

COMPANY PROFILE:
- Name: G V Clothings
- Factory & Showroom Address: 34, 4th Cross St, T N K Nagar, Nesavalar Colony, Tiruppur, Tamil Nadu 641602, India
- Phone / WhatsApp: +91 73390 22308
- Email: sales@tirupurtexcraft.com
- Showroom Timings: Open 7 days a week, 9:00 AM – 8:30 PM (Welcoming wholesale buyers from across India)
- Logistics & Shipping: Daily direct cargo dispatch to Kerala (Kochi, Kozhikode, Trivandrum), Bangalore/Karnataka (Chickpet, Commercial St), Tamil Nadu (Chennai, Coimbatore, Madurai, Salem), Andhra Pradesh, Telangana, Maharashtra, and Pan-India.

CURRENT FABRIC CATEGORIES:
${categoriesSummary}

LIVE PRODUCT CATALOGUE (${products.length} Items):
${catalogSummary}

CURRENT SPECIAL OFFERS:
${offersSummary || 'No active coupon at the moment; wholesale rate negotiations available on high volumes (>500 Kg).'}

YOUR GUIDELINES:
1. Answer ALL user questions accurately, politely, and professionally as an expert textile manufacturer assistant.
2. If asked in Hindi, Tamil, Malayalam, Kannada, English, or any other language, ALWAYS reply in that same language fluently!
3. Provide exact product specs (GSM, width, MOQ, wholesale price range in INR ₹, fabric composition) from the catalog above whenever asked.
4. If a user wants to place an order, negotiate bulk price, or visit the Tiruppur showroom, warmly encourage them to connect on WhatsApp at +91 73390 22308 or submit the Bulk Enquiry / Sample Request form.
5. Keep responses concise, clear, well-formatted with bullet points and emojis where helpful.`;

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(h => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      })),
      { role: 'user', content: message }
    ];

    let aiReply = null;
    let lastError = null;

    for (const model of GROQ_MODELS) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: conversationMessages,
            temperature: 0.7,
            max_tokens: 800
          })
        });

        const groqData = await groqRes.json();
        if (groqData.choices && groqData.choices[0]?.message?.content) {
          aiReply = groqData.choices[0].message.content;
          break;
        } else if (groqData.error) {
          lastError = groqData.error.message;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!aiReply) {
      aiReply = `Thank you for reaching out to G V Clothings Tiruppur! We manufacture 100% Bio-Wash Combed Cotton (180 GSM), Single Jersey (160 GSM), Loop Knit (280 GSM), Interlock (220 GSM), French Terry (240 GSM), Sewing Thread, and Cotton Yarn at true wholesale factory rates (₹85–₹440/Kg). For immediate custom quotes or samples, please message our Tiruppur sales desk on WhatsApp at +91 73390 22308 or visit our showroom at T N K Nagar, Tiruppur.`;
    }

    res.json({
      success: true,
      reply: aiReply
    });

  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({
      success: false,
      reply: "Thank you for contacting G V Clothings Tiruppur. Please reach our sales team on WhatsApp at +91 73390 22308."
    });
  }
});

// Production Static Serving for Google Cloud Run / Google App Engine / Docker
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`G V Clothings API Server running on port ${PORT}`);
  console.log(`Live Database Engine: ${isFirestoreConnected ? 'Google Cloud Firestore' : 'Local Data Storage'}`);
});
