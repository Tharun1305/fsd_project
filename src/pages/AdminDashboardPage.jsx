import React, { useState, useEffect } from 'react';
import { Package, Inbox, Copy, Edit, Trash2, Plus, Check, RefreshCw, AlertCircle, Sparkles, Tag, Bell, CheckCircle2, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export function AdminDashboardPage({ navigate }) {
  const { products, categories, fetchAdminData, enquiries, sampleRequests, callbackRequests, offers, announcements, stats, fetchAllData } = useData();
  const { isAuthenticated, logout, admin } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickUpdateId, setQuickUpdateId] = useState(null);
  const [quickData, setQuickData] = useState({ price: '', moq: 100, availability: 'Available' });

  // Add/Edit Product Form State
  const [prodForm, setProdForm] = useState({
    product_name: '',
    product_code: '',
    category_id: '1',
    description: '',
    fabric: '100% Combed Cotton Bio-Wash',
    gsm: '180 GSM',
    price: '₹130 - ₹160 / Pc',
    moq: 100,
    availability: 'Available',
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colours: ['Navy Blue', 'Black', 'White']
  });

  // Offers Form State
  const [offerForm, setOfferForm] = useState({ title: '', description: '', discount_text: '', expiry_date: '2026-12-31' });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    } else {
      navigate('admin_login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  // Status Change Handler for Enquiries
  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      await fetch(`/api/enquiries/${enquiryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Duplicate Product Handler
  const handleDuplicateProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        alert('Product duplicated successfully! Edit to customize title or image.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Inline Update Handler
  const handleStartQuickEdit = (p) => {
    setQuickUpdateId(p.product_id);
    setQuickData({ price: p.price, moq: p.moq, availability: p.availability });
  };

  const handleSaveQuickEdit = async (id) => {
    try {
      await fetch(`/api/products/${id}/quick-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickData)
      });
      setQuickUpdateId(null);
      fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Save Product (Add or Edit)
  const handleSaveProductForm = async (e) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.product_id}` : '/api/products';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setEditingProduct(null);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Form
  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    setProdForm({
      product_name: p.product_name,
      product_code: p.product_code,
      category_id: p.category_id,
      description: p.description,
      fabric: p.fabric,
      gsm: p.gsm || '180 GSM',
      price: p.price,
      moq: p.moq,
      availability: p.availability,
      images: p.images || ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
      sizes: p.sizes || ['S', 'M', 'L', 'XL'],
      colours: p.colours || ['Black', 'Navy']
    });
    setShowAddModal(true);
  };

  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={16} />
            <span>Minimum Admin Work – Maximum Automation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">Owner Control Dashboard</h1>
          <p className="text-xs text-slate-300">Welcome, {admin?.name || 'Owner'}. Managing G V Clothings.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingProduct(null);
              setProdForm({
                product_name: '',
                product_code: `GVF-${Math.floor(100 + Math.random() * 900)}`,
                category_id: '1',
                description: 'Premium quality combed cotton fabric processed in Tiruppur.',
                fabric: '100% Combed Cotton',
                gsm: '180 GSM',
                price: '₹300 - ₹360 / Kg',
                moq: 100,
                availability: 'Available',
                images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colours: ['Navy Blue', 'Black', 'White']
              });
              setShowAddModal(true);
            }}
            className="btn btn-gold btn-sm"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>

          <button onClick={logout} className="btn btn-outline btn-sm text-rose-300 border-slate-700 hover:bg-slate-800">
            Logout
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Products</span>
          <span className="text-2xl font-extrabold text-slate-900">{stats.total_products || products.length}</span>
        </div>

        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-md text-center relative overflow-hidden">
          <span className="text-[11px] font-bold text-blue-200 uppercase block">New Enquiries</span>
          <span className="text-2xl font-extrabold text-amber-300">{stats.new_enquiries}</span>
          {stats.new_enquiries > 0 && (
            <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-bounce">
              NEW!
            </span>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Sample Requests</span>
          <span className="text-2xl font-extrabold text-blue-600">{stats.sample_requests}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Callbacks</span>
          <span className="text-2xl font-extrabold text-purple-600">{stats.callback_requests}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Out of Stock</span>
          <span className="text-2xl font-extrabold text-rose-600">{stats.out_of_stock}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Active Offers</span>
          <span className="text-2xl font-extrabold text-emerald-600">{stats.active_offers || offers.length}</span>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'overview', label: 'Recent Enquiries' },
          { key: 'products', label: `Manage Products (${products.length})` },
          { key: 'samples', label: `Sample Requests (${sampleRequests.length})` },
          { key: 'callbacks', label: `Callbacks (${callbackRequests.length})` },
          { key: 'offers', label: 'Offers & Announcements' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
              activeTab === t.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RECENT ENQUIRIES OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Inbox size={20} className="text-blue-600" />
              <span>Bulk Customer Enquiries ({enquiries.length})</span>
            </h3>
            <button onClick={fetchAdminData} className="text-xs text-blue-600 font-bold flex items-center gap-1">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Ref ID & Date</th>
                  <th className="p-3">Customer & Business</th>
                  <th className="p-3">Location & Type</th>
                  <th className="p-3">Product / Qty</th>
                  <th className="p-3">Sample?</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {enquiries.map(e => (
                  <tr key={e.enquiry_id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <strong className="block text-slate-900 font-mono">{e.enquiry_id}</strong>
                      <span className="text-[10px] text-slate-400">{new Date(e.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="p-3">
                      <strong className="block text-slate-900">{e.customer_name}</strong>
                      <span className="text-slate-500">{e.company_name} • 📞 {e.mobile}</span>
                    </td>
                    <td className="p-3">
                      <span className="block font-semibold text-blue-600">{e.location}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{e.buyer_type}</span>
                    </td>
                    <td className="p-3">
                      <span className="block font-bold text-slate-900 line-clamp-1">{e.product_name}</span>
                      <span className="text-blue-600 font-bold">Qty: {e.quantity} Pcs</span>
                    </td>
                    <td className="p-3">
                      {e.sample_required ? (
                        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">YES</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="p-3">
                      <select
                        value={e.status}
                        onChange={(ev) => handleStatusChange(e.enquiry_id, ev.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded border ${
                          e.status === 'New'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : e.status === 'Contacted'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        <option value="New">🔴 New</option>
                        <option value="Contacted">🟡 Contacted</option>
                        <option value="Completed">🟢 Completed</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <a
                        href={`https://wa.me/${e.mobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${e.customer_name}, regarding your bulk enquiry ${e.enquiry_id} for ${e.product_name}...`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-whatsapp btn-sm text-[10px] py-1 px-2"
                      >
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT WITH INLINE EDIT & DUPLICATE */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              <span>Products Catalogue Management ({products.length})</span>
            </h3>

            <button
              onClick={() => {
                setEditingProduct(null);
                setProdForm({
                  product_name: '',
                  product_code: `TPG-${Math.floor(100 + Math.random() * 900)}`,
                  category_id: '1',
                  description: '',
                  fabric: '100% Combed Cotton Bio-Wash',
                  gsm: '180 GSM',
                  price: '₹130 - ₹160 / Pc',
                  moq: 100,
                  availability: 'Available',
                  images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'],
                  sizes: ['S', 'M', 'L', 'XL'],
                  colours: ['Navy Blue', 'Black', 'White']
                });
                setShowAddModal(true);
              }}
              className="btn btn-primary btn-sm text-xs"
            >
              <Plus size={14} /> Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px]">
                <tr>
                  <th className="p-3">Product Image & Code</th>
                  <th className="p-3">Name & Fabric</th>
                  <th className="p-3">Wholesale Price (Quick Edit)</th>
                  <th className="p-3">MOQ (Quick Edit)</th>
                  <th className="p-3">Availability (Quick Edit)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {products.map(p => {
                  const isQuick = quickUpdateId === p.product_id;
                  return (
                    <tr key={p.product_id} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-3">
                        <img src={p.images?.[0]} alt="" className="w-12 h-12 object-cover rounded-lg border" />
                        <div>
                          <strong className="block text-slate-900 font-mono">{p.product_code}</strong>
                          {p.is_new_arrival && <span className="badge badge-new text-[9px]">NEW</span>}
                        </div>
                      </td>
                      <td className="p-3">
                        <strong className="block text-slate-900">{p.product_name}</strong>
                        <span className="text-slate-500">{p.fabric} • {p.gsm}</span>
                      </td>
                      <td className="p-3">
                        {isQuick ? (
                          <input
                            type="text"
                            value={quickData.price}
                            onChange={(e) => setQuickData(prev => ({ ...prev, price: e.target.value }))}
                            className="form-control text-xs py-1 w-28"
                          />
                        ) : (
                          <span className="font-bold text-blue-600">{p.price}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isQuick ? (
                          <input
                            type="number"
                            value={quickData.moq}
                            onChange={(e) => setQuickData(prev => ({ ...prev, moq: e.target.value }))}
                            className="form-control text-xs py-1 w-20"
                          />
                        ) : (
                          <span className="font-bold text-slate-900">{p.moq} Pcs</span>
                        )}
                      </td>
                      <td className="p-3">
                        {isQuick ? (
                          <select
                            value={quickData.availability}
                            onChange={(e) => setQuickData(prev => ({ ...prev, availability: e.target.value }))}
                            className="form-control text-xs py-1"
                          >
                            <option value="Available">Available</option>
                            <option value="Limited">Limited</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        ) : (
                          <span className={`badge text-[10px] ${
                            p.availability === 'Available' ? 'badge-available' : p.availability === 'Limited' ? 'badge-limited' : 'badge-outofstock'
                          }`}>
                            {p.availability}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {isQuick ? (
                          <button
                            onClick={() => handleSaveQuickEdit(p.product_id)}
                            className="btn btn-primary btn-sm text-[10px] py-1 px-2"
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartQuickEdit(p)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                            title="Quick Inline Edit"
                          >
                            Quick Edit
                          </button>
                        )}

                        <button
                          onClick={() => handleDuplicateProduct(p.product_id)}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
                          title="Duplicate Product"
                        >
                          <Copy size={13} />
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded"
                          title="Edit Full Details"
                        >
                          <Edit size={13} />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.product_id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded"
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3 & 4: SAMPLES & CALLBACKS */}
      {activeTab === 'samples' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg">Sample Requests ({sampleRequests.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px]">
                <tr>
                  <th className="p-3">Sample ID & Date</th>
                  <th className="p-3">Customer & Location</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sampleRequests.map(s => (
                  <tr key={s.sample_id}>
                    <td className="p-3 font-mono font-bold">{s.sample_id}</td>
                    <td className="p-3">
                      <strong>{s.customer_name}</strong> ({s.company_name})<br />
                      📞 {s.mobile} • 📍 {s.location}
                    </td>
                    <td className="p-3 font-bold text-blue-600">{s.product_name}</td>
                    <td className="p-3 text-slate-600">{s.message || 'Standard swatch request'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'callbacks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg">Callback Requests ({callbackRequests.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px]">
                <tr>
                  <th className="p-3">Callback ID</th>
                  <th className="p-3">Name & Company</th>
                  <th className="p-3">Mobile Number</th>
                  <th className="p-3">Preferred Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {callbackRequests.map(c => (
                  <tr key={c.callback_id}>
                    <td className="p-3 font-mono font-bold">{c.callback_id}</td>
                    <td className="p-3"><strong>{c.name}</strong> ({c.company})</td>
                    <td className="p-3 font-bold text-blue-600">📞 {c.mobile}</td>
                    <td className="p-3 text-amber-700 font-bold">{c.preferred_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-xl">
                {editingProduct ? 'Edit Product Specification' : 'Add New Fabric Product'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input type="text" required value={prodForm.product_name} onChange={(e) => setProdForm({ ...prodForm, product_name: e.target.value })} className="form-control text-xs" />
                </div>
                <div className="form-group">
                  <label className="form-label">Product Code *</label>
                  <input type="text" required value={prodForm.product_code} onChange={(e) => setProdForm({ ...prodForm, product_code: e.target.value })} className="form-control text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={prodForm.category_id} onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })} className="form-control text-xs">
                    {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fabric Specification</label>
                  <input type="text" value={prodForm.fabric} onChange={(e) => setProdForm({ ...prodForm, fabric: e.target.value })} className="form-control text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label">Wholesale Price *</label>
                  <input type="text" required value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} className="form-control text-xs" placeholder="e.g. ₹130 - ₹160" />
                </div>
                <div className="form-group">
                  <label className="form-label">MOQ (Pcs) *</label>
                  <input type="number" required value={prodForm.moq} onChange={(e) => setProdForm({ ...prodForm, moq: e.target.value })} className="form-control text-xs" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Status</label>
                  <select value={prodForm.availability} onChange={(e) => setProdForm({ ...prodForm, availability: e.target.value })} className="form-control text-xs">
                    <option value="Available">Available</option>
                    <option value="Limited">Limited</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (High-Res Product Photo)</label>
                <input
                  type="url"
                  value={prodForm.images[0] || ''}
                  onChange={(e) => setProdForm({ ...prodForm, images: [e.target.value] })}
                  className="form-control text-xs"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Description</label>
                <textarea rows="2" value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} className="form-control text-xs" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn btn-primary btn-sm flex-1">
                  Save & Publish Product
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline btn-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
