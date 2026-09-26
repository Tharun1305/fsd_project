import React, { useState, useEffect, useMemo } from 'react';
import {
  Package, Inbox, Copy, Edit, Trash2, Plus, Check, RefreshCw,
  AlertCircle, Sparkles, Tag, Bell, CheckCircle2, Clock, Phone,
  MessageSquare, ExternalLink, Calendar, Search, Filter, Eye,
  ChevronRight, X, Download, ShieldCheck, Layers, FileText,
  ArrowLeft, History, Percent, Megaphone, Send
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export function AdminDashboardPage({ navigate }) {
  const {
    products, categories, fetchAdminData, enquiries, sampleRequests,
    callbackRequests, offers, adminOffers, announcements, adminAnnouncements,
    activityLogs, stats, fetchAllData,
    updateEnquiryStatus, addEnquiryNote, deleteEnquiry,
    updateSampleStatus, deleteSampleRequest,
    updateCallbackStatus, deleteCallbackRequest,
    deleteOffer, deleteAnnouncement
  } = useData();

  const { isAuthenticated, logout, admin } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState(null);

  // Search & Filter States
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('all');

  // Modals & Active Edit State
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Enquiry Details & History Modal
  const [viewingEnquiry, setViewingEnquiry] = useState(null);
  const [newEnquiryNote, setNewEnquiryNote] = useState('');
  const [newEnquiryStatus, setNewEnquiryStatus] = useState('');

  // Quick Inline Product Edit State
  const [quickUpdateId, setQuickUpdateId] = useState(null);
  const [quickData, setQuickData] = useState({ price: '', moq: 100, availability: 'Available' });

  // Offers & Announcement Modals
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({
    title: '',
    description: '',
    discount_text: '',
    coupon_code: '',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop',
    expiry_date: '2026-12-31',
    status: 'Active'
  });

  const [showAnnModal, setShowAnnModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [annForm, setAnnForm] = useState({
    title: '',
    description: '',
    badge: 'New Collection',
    expiry_date: '2026-12-31',
    status: 'Active'
  });

  // Category Modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ category_name: '', description: '', icon: 'Layers' });

  // Product Form State
  const [prodForm, setProdForm] = useState({
    product_name: '',
    product_code: '',
    category_id: '1',
    description: '',
    fabric: '100% Combed Cotton Bio-Wash',
    gsm: '180 GSM',
    unit: 'Kg',
    price: '₹300 - ₹360 / Kg',
    moq: 100,
    availability: 'Available',
    images: ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop'],
    sizes: '36 inch, 42 inch, 48 inch, 54 inch, 60 inch',
    colours: 'Navy Blue, Black, White, Melange Grey',
    tags: '100% Combed, Bio-Wash, Reactive Dye, Pre-Shrunk',
    is_new_arrival: true
  });

  // Notification Toast Helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    } else {
      navigate('admin_login', { loggedOut: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="container py-24 text-center animate-fade-in">
        <div className="inline-block p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm max-w-sm">
          <p className="text-xs font-bold text-slate-700">Signed out successfully.</p>
          <p className="text-[11px] text-slate-400 mt-1">Redirecting to administrator login...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('admin_login', { loggedOut: true });
  };

  // Filtered Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(e => {
      const matchSearch =
        !enquirySearch ||
        e.customer_name?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        e.company_name?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        e.mobile?.includes(enquirySearch) ||
        e.enquiry_id?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        e.product_name?.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        e.location?.toLowerCase().includes(enquirySearch.toLowerCase());

      const matchStatus =
        enquiryStatusFilter === 'all' ||
        e.status?.toLowerCase() === enquiryStatusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [enquiries, enquirySearch, enquiryStatusFilter]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch =
        !productSearch ||
        p.product_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.product_code?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.fabric?.toLowerCase().includes(productSearch.toLowerCase());

      const matchCat =
        productCatFilter === 'all' ||
        String(p.category_id) === String(productCatFilter);

      return matchSearch && matchCat;
    });
  }, [products, productSearch, productCatFilter]);

  // --- PRODUCT HANDLERS ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      product_name: '',
      product_code: `GVF-${Math.floor(100 + Math.random() * 900)}`,
      category_id: categories[0]?.category_id || '1',
      description: 'Premium quality combed cotton fabric manufactured in Tiruppur. Zero shrinkage, superior hand feel and high colour fastness.',
      fabric: '100% Combed Cotton Bio-Wash',
      gsm: '180 GSM',
      unit: 'Kg',
      price: '₹300 - ₹360 / Kg',
      moq: 100,
      availability: 'Available',
      images: ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop'],
      sizes: '36 inch, 42 inch, 48 inch, 54 inch, 60 inch',
      colours: 'Navy Blue, Black, White, Melange Grey',
      tags: '100% Combed, Bio-Wash, Reactive Dye, Pre-Shrunk',
      is_new_arrival: true
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p) => {
    setEditingProduct(p);
    setProdForm({
      product_name: p.product_name || '',
      product_code: p.product_code || '',
      category_id: String(p.category_id || '1'),
      description: p.description || '',
      fabric: p.fabric || '',
      gsm: p.gsm || '180 GSM',
      unit: p.unit || 'Kg',
      price: p.price || '',
      moq: p.moq || 100,
      availability: p.availability || 'Available',
      images: p.images && p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop'],
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || ''),
      colours: Array.isArray(p.colours) ? p.colours.join(', ') : (p.colours || ''),
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
      is_new_arrival: Boolean(p.is_new_arrival)
    });
    setShowProductModal(true);
  };

  const handleSaveProductForm = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `/api/products/${editingProduct.product_id}` : '/api/products';
      const payload = {
        ...prodForm,
        moq: Number(prodForm.moq) || 0,
        sizes: typeof prodForm.sizes === 'string' ? prodForm.sizes.split(',').map(s => s.trim()).filter(Boolean) : prodForm.sizes,
        colours: typeof prodForm.colours === 'string' ? prodForm.colours.split(',').map(c => c.trim()).filter(Boolean) : prodForm.colours,
        tags: typeof prodForm.tags === 'string' ? prodForm.tags.split(',').map(t => t.trim()).filter(Boolean) : prodForm.tags,
        images: prodForm.images.filter(Boolean)
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowProductModal(false);
        setEditingProduct(null);
        await Promise.all([fetchAllData(), fetchAdminData()]);
        showToast(editingProduct ? 'Product specifications updated successfully!' : 'New product published to live catalogue!');
      } else {
        showToast(data.message || 'Failed to save product', 'error');
      }
    } catch (err) {
      showToast('Error saving product: ' + err.message, 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDuplicateProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchAllData(), fetchAdminData()]);
        showToast('Product duplicated successfully! You can now edit its name and code.');
      }
    } catch (err) {
      showToast('Failed to duplicate product', 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchAllData(), fetchAdminData()]);
        showToast(`Product "${name}" deleted.`);
      }
    } catch (err) {
      showToast('Error deleting product', 'error');
    }
  };

  // Quick Inline Product Edit
  const handleStartQuickEdit = (p) => {
    setQuickUpdateId(p.product_id);
    setQuickData({ price: p.price, moq: p.moq, availability: p.availability });
  };

  const handleSaveQuickEdit = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}/quick-update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickData)
      });
      const data = await res.json();
      if (data.success) {
        setQuickUpdateId(null);
        await Promise.all([fetchAllData(), fetchAdminData()]);
        showToast('Quick details updated!');
      }
    } catch (err) {
      showToast('Failed to quick-update product', 'error');
    }
  };

  // --- ENQUIRY STATUS & HISTORY HANDLERS ---
  const handleQuickStatusChange = async (enquiryId, newStatus) => {
    const res = await updateEnquiryStatus(enquiryId, newStatus, `Status updated to ${newStatus}`);
    if (res.success) {
      showToast(`Enquiry ${enquiryId} status updated to ${newStatus}`);
    }
  };

  const handleOpenEnquiryDetails = (enquiry) => {
    setViewingEnquiry(enquiry);
    setNewEnquiryStatus(enquiry.status);
    setNewEnquiryNote('');
  };

  const handleAddEnquiryFollowupNote = async (e) => {
    e.preventDefault();
    if (!newEnquiryNote.trim()) return;

    let res;
    if (newEnquiryStatus !== viewingEnquiry.status) {
      res = await updateEnquiryStatus(viewingEnquiry.enquiry_id, newEnquiryStatus, newEnquiryNote.trim());
    } else {
      res = await addEnquiryNote(viewingEnquiry.enquiry_id, newEnquiryNote.trim());
    }

    if (res.success) {
      // Refresh current viewing enquiry with updated data
      const updatedList = await fetch('/api/enquiries').then(r => r.json());
      if (updatedList.success) {
        const refreshed = updatedList.data.find(x => x.enquiry_id === viewingEnquiry.enquiry_id);
        if (refreshed) setViewingEnquiry(refreshed);
      }
      setNewEnquiryNote('');
      showToast('Follow-up note logged into history timeline!');
    }
  };

  const handleDeleteEnquiryItem = async (id) => {
    if (!window.confirm(`Delete enquiry ${id}? This cannot be undone.`)) return;
    const res = await deleteEnquiry(id);
    if (res.success) {
      if (viewingEnquiry?.enquiry_id === id) setViewingEnquiry(null);
      showToast(`Enquiry ${id} deleted.`);
    }
  };

  // --- OFFERS CRUD ---
  const handleSaveOffer = async (e) => {
    e.preventDefault();
    try {
      const url = editingOffer ? `/api/offers/${editingOffer.offer_id}` : '/api/offers';
      const method = editingOffer ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowOfferModal(false);
        setEditingOffer(null);
        await Promise.all([fetchAllData(), fetchAdminData()]);
        showToast(editingOffer ? 'Offer updated successfully!' : 'New offer banner published!');
      }
    } catch (err) {
      showToast('Failed to save offer', 'error');
    }
  };

  const handleDeleteOfferItem = async (id, title) => {
    if (!window.confirm(`Delete offer "${title}"?`)) return;
    const res = await deleteOffer(id);
    if (res.success) showToast('Offer deleted.');
  };

  // --- ANNOUNCEMENTS CRUD ---
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const url = editingAnn ? `/api/announcements/${editingAnn.announcement_id}` : '/api/announcements';
      const method = editingAnn ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowAnnModal(false);
        setEditingAnn(null);
        await Promise.all([fetchAllData(), fetchAdminData()]);
        showToast(editingAnn ? 'Announcement updated!' : 'New announcement published!');
      }
    } catch (err) {
      showToast('Failed to save announcement', 'error');
    }
  };

  const handleDeleteAnnItem = async (id) => {
    if (!window.confirm('Delete this announcement marquee?')) return;
    const res = await deleteAnnouncement(id);
    if (res.success) showToast('Announcement removed.');
  };

  // --- CSV EXPORT ---
  const exportEnquiriesToCSV = () => {
    if (enquiries.length === 0) {
      alert('No enquiries to export.');
      return;
    }
    const headers = ['Enquiry ID', 'Date', 'Customer Name', 'Company', 'Mobile', 'Location', 'Buyer Type', 'Product', 'Quantity', 'Status'];
    const rows = enquiries.map(e => [
      e.enquiry_id,
      new Date(e.created_at).toLocaleDateString(),
      `"${e.customer_name?.replace(/"/g, '""') || ''}"`,
      `"${e.company_name?.replace(/"/g, '""') || ''}"`,
      e.mobile,
      `"${e.location || ''}"`,
      e.buyer_type || 'Wholesaler',
      `"${e.product_name?.replace(/"/g, '""') || ''}"`,
      e.quantity,
      e.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GV_Clothings_Enquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const samplePresets = [
    { label: 'Printed Cotton', url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&auto=format&fit=crop' },
    { label: 'Single Jersey', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop' },
    { label: 'Loop Knit Fleece', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop' },
    { label: 'French Terry', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop' },
    { label: 'Bio-Wash Cotton', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop' }
  ];

  return (
    <div className="container py-6 space-y-6 animate-fade-in relative min-h-screen">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all transform animate-bounce ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* TOP HEADER BANNER */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={16} />
            <span>Tiruppur B2B Master Administration Console</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">G V Clothings Admin Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-white font-bold">{admin?.name || 'Owner'}</span> ({admin?.username || 'admin'}) · Live Data Connected
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('home')}
            className="btn btn-outline btn-sm text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Back to Store
          </button>

          <button
            onClick={handleOpenAddProduct}
            className="btn btn-gold btn-sm text-xs font-bold flex items-center gap-1.5 shadow-md"
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="btn btn-outline btn-sm text-slate-300 border-slate-700 hover:bg-slate-800 text-xs flex items-center gap-1"
            title="Refresh All Data"
          >
            <RefreshCw size={13} /> Refresh
          </button>

          <button
            onClick={handleLogout}
            className="btn btn-outline btn-sm text-rose-300 border-rose-900/60 hover:bg-rose-950/50 text-xs"
          >
            Logout
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveTab('products')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Products</span>
          <span className="text-2xl font-black text-slate-900">{stats.total_products || products.length}</span>
        </div>

        <div
          onClick={() => { setActiveTab('overview'); setEnquiryStatusFilter('New'); }}
          className="bg-blue-600 text-white p-4 rounded-2xl shadow-md text-center relative overflow-hidden cursor-pointer hover:bg-blue-700 transition-all"
        >
          <span className="text-[11px] font-bold text-blue-200 uppercase block">New Enquiries</span>
          <span className="text-2xl font-black text-amber-300">{stats.new_enquiries}</span>
          {stats.new_enquiries > 0 && (
            <span className="absolute top-2 right-2 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full animate-bounce">
              ACTION!
            </span>
          )}
        </div>

        <div
          onClick={() => setActiveTab('overview')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center cursor-pointer hover:border-blue-500 transition-all"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Enquiries</span>
          <span className="text-2xl font-black text-blue-600">{enquiries.length}</span>
        </div>

        <div
          onClick={() => setActiveTab('samples')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center cursor-pointer hover:border-blue-500 transition-all"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Sample Requests</span>
          <span className="text-2xl font-black text-purple-600">{sampleRequests.length}</span>
        </div>

        <div
          onClick={() => setActiveTab('callbacks')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center cursor-pointer hover:border-blue-500 transition-all"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Callbacks</span>
          <span className="text-2xl font-black text-amber-600">{callbackRequests.length}</span>
        </div>

        <div
          onClick={() => setActiveTab('offers')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center cursor-pointer hover:border-blue-500 transition-all"
        >
          <span className="text-[11px] font-bold text-slate-500 uppercase block">Active Offers</span>
          <span className="text-2xl font-black text-emerald-600">{(adminOffers.length > 0 ? adminOffers.length : offers.length)}</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-none">
        {[
          { key: 'overview', label: `Enquiries (${enquiries.length})`, icon: Inbox },
          { key: 'products', label: `Products (${products.length})`, icon: Package },
          { key: 'samples', label: `Samples (${sampleRequests.length})`, icon: Tag },
          { key: 'callbacks', label: `Callbacks (${callbackRequests.length})`, icon: Phone },
          { key: 'offers', label: `Offers & Banners (${(adminOffers.length || offers.length)})`, icon: Percent },
          { key: 'history', label: `Activity History (${activityLogs.length})`, icon: History }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RECENT ENQUIRIES & DETAILED TIMELINE HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Inbox size={22} className="text-blue-600" />
                <span>Bulk Customer Enquiries & Lead Pipeline</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track each customer enquiry with full timestamped status changes and follow-up notes history.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={exportEnquiriesToCSV}
                className="btn btn-outline btn-sm text-xs font-bold flex items-center gap-1.5"
                title="Export Enquiries to CSV Spreadsheet"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={enquirySearch}
                onChange={e => setEnquirySearch(e.target.value)}
                placeholder="Search by customer name, company, mobile, location, product..."
                className="form-control pl-9 text-xs py-2 rounded-xl"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={enquiryStatusFilter}
                onChange={e => setEnquiryStatusFilter(e.target.value)}
                className="form-control text-xs py-2 w-40 rounded-xl font-medium"
              >
                <option value="all">All Statuses ({enquiries.length})</option>
                <option value="New">🔴 New ({enquiries.filter(e => e.status === 'New').length})</option>
                <option value="Contacted">🟡 Contacted ({enquiries.filter(e => e.status === 'Contacted').length})</option>
                <option value="Sample Sent">📦 Sample Sent ({enquiries.filter(e => e.status === 'Sample Sent').length})</option>
                <option value="Completed">🟢 Completed ({enquiries.filter(e => e.status === 'Completed').length})</option>
                <option value="Cancelled">⚪ Cancelled ({enquiries.filter(e => e.status === 'Cancelled').length})</option>
              </select>
            </div>
          </div>

          {/* Enquiries Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Ref ID & Date</th>
                  <th className="p-3.5">Customer & Business</th>
                  <th className="p-3.5">Location & Buyer Type</th>
                  <th className="p-3.5">Fabric Product / Qty</th>
                  <th className="p-3.5">Sample?</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 text-right">Actions & History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      No customer enquiries found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredEnquiries.map(e => (
                    <tr key={e.enquiry_id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <strong className="block text-slate-900 font-mono text-[11px]">{e.enquiry_id}</strong>
                        <span className="text-[10px] text-slate-400">{new Date(e.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="p-3.5">
                        <strong className="block text-slate-900 text-xs">{e.customer_name}</strong>
                        <span className="text-slate-500 text-[11px] block">{e.company_name}</span>
                        <a href={`tel:${e.mobile}`} className="text-blue-600 hover:underline text-[11px] font-mono">
                          📞 {e.mobile}
                        </a>
                      </td>
                      <td className="p-3.5">
                        <span className="block font-semibold text-slate-900">{e.location}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold inline-block mt-0.5">
                          {e.buyer_type}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="block font-bold text-slate-900 line-clamp-1">{e.product_name}</span>
                        <span className="text-blue-700 font-bold text-[11px]">Qty: {e.quantity} Pcs</span>
                      </td>
                      <td className="p-3.5">
                        {e.sample_required ? (
                          <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">YES</span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">No</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={e.status}
                          onChange={(ev) => handleQuickStatusChange(e.enquiry_id, ev.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                            e.status === 'New'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : e.status === 'Contacted'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : e.status === 'Sample Sent'
                              ? 'bg-purple-50 text-purple-700 border-purple-300'
                              : e.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                          }`}
                        >
                          <option value="New">🔴 New</option>
                          <option value="Contacted">🟡 Contacted</option>
                          <option value="Sample Sent">📦 Sample Sent</option>
                          <option value="Completed">🟢 Completed</option>
                          <option value="Cancelled">⚪ Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEnquiryDetails(e)}
                          className="btn btn-outline btn-sm text-[11px] py-1 px-2.5 text-blue-700 border-blue-200 hover:bg-blue-50"
                          title="View Full Details & Follow-up History"
                        >
                          <History size={13} />
                          <span>History & Notes</span>
                        </button>

                        <a
                          href={`https://wa.me/${e.mobile?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${e.customer_name}, this is from G V Clothings Tiruppur regarding your bulk enquiry ${e.enquiry_id} for ${e.product_name}...`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-whatsapp btn-sm text-[10px] py-1 px-2.5"
                          title="Chat on WhatsApp"
                        >
                          WhatsApp
                        </a>

                        <button
                          onClick={() => handleDeleteEnquiryItem(e.enquiry_id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          title="Delete Enquiry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCTS CATALOGUE MANAGEMENT (WITH INLINE EDIT & MODAL) */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Package size={22} className="text-blue-600" />
                <span>Fabric Products Catalogue Management ({products.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, edit, duplicate, or quick-update wholesale rates, MOQ, and stock availability.
              </p>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={15} /> Add New Fabric Product
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search products by code (e.g. GVF-101), name, or fabric..."
                className="form-control pl-9 text-xs py-2 rounded-xl"
              />
            </div>

            <select
              value={productCatFilter}
              onChange={e => setProductCatFilter(e.target.value)}
              className="form-control text-xs py-2 w-48 rounded-xl font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Image & Code</th>
                  <th className="p-3.5">Product Name & Fabric Specs</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Wholesale Price (Quick Edit)</th>
                  <th className="p-3.5">MOQ</th>
                  <th className="p-3.5">Availability</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      No products found. Click "Add New Fabric Product" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const isQuick = quickUpdateId === p.product_id;
                    const cat = categories.find(c => String(c.category_id) === String(p.category_id));

                    return (
                      <tr key={p.product_id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800'}
                            alt=""
                            className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-xs"
                          />
                          <div>
                            <strong className="block text-slate-900 font-mono text-[11px]">{p.product_code}</strong>
                            {p.is_new_arrival && (
                              <span className="badge badge-new text-[9px] px-1 py-0.2 mt-0.5">NEW</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <strong className="block text-slate-900 text-xs">{p.product_name}</strong>
                          <span className="text-slate-500 text-[11px] block">{p.fabric} • {p.gsm}</span>
                        </td>

                        <td className="p-3.5">
                          <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                            {cat?.category_name || 'Fabric'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {isQuick ? (
                            <input
                              type="text"
                              value={quickData.price}
                              onChange={(e) => setQuickData(prev => ({ ...prev, price: e.target.value }))}
                              className="form-control text-xs py-1 w-32 border-blue-500 font-bold"
                            />
                          ) : (
                            <span className="font-extrabold text-blue-700">{p.price}</span>
                          )}
                        </td>

                        <td className="p-3.5">
                          {isQuick ? (
                            <input
                              type="number"
                              value={quickData.moq}
                              onChange={(e) => setQuickData(prev => ({ ...prev, moq: e.target.value }))}
                              className="form-control text-xs py-1 w-20 border-blue-500 font-bold"
                            />
                          ) : (
                            <span className="font-bold text-slate-900">{p.moq} {p.unit || 'Kg'}</span>
                          )}
                        </td>

                        <td className="p-3.5">
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

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {isQuick ? (
                            <button
                              onClick={() => handleSaveQuickEdit(p.product_id)}
                              className="btn btn-primary btn-sm text-[10px] py-1 px-2.5 font-bold"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartQuickEdit(p)}
                              className="p-1.5 text-slate-600 hover:bg-slate-200 rounded font-semibold text-[11px]"
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
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded"
                            title="Edit Full Specifications"
                          >
                            <Edit size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(p.product_id, p.product_name)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded"
                            title="Delete Product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SAMPLE REQUESTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'samples' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Tag size={22} className="text-blue-600" />
                <span>Fabric Swatch Sample Requests ({sampleRequests.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage swatch kit dispatches to buyers across India.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Sample ID & Date</th>
                  <th className="p-3.5">Buyer & Company</th>
                  <th className="p-3.5">Product / Requirement</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Dispatch Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {sampleRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No swatch sample requests received yet.
                    </td>
                  </tr>
                ) : (
                  sampleRequests.map(s => (
                    <tr key={s.sample_id} className="hover:bg-slate-50">
                      <td className="p-3.5">
                        <strong className="block text-slate-900 font-mono text-[11px]">{s.sample_id}</strong>
                        <span className="text-[10px] text-slate-400">{new Date(s.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="p-3.5">
                        <strong className="block text-slate-900">{s.customer_name}</strong>
                        <span className="text-slate-500 text-[11px]">{s.company_name}</span>
                        <a href={`tel:${s.mobile}`} className="text-blue-600 block text-[11px]">📞 {s.mobile}</a>
                      </td>
                      <td className="p-3.5">
                        <strong className="block text-blue-700">{s.product_name}</strong>
                        <span className="text-slate-600 text-[11px]">{s.requirement}</span>
                        {s.message && <p className="text-[10px] text-slate-500 italic mt-0.5">"{s.message}"</p>}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{s.location}</td>
                      <td className="p-3.5">
                        <select
                          value={s.status || 'New'}
                          onChange={(e) => updateSampleStatus(s.sample_id, e.target.value)}
                          className="form-control text-xs py-1 font-bold"
                        >
                          <option value="New">🔴 New</option>
                          <option value="In Progress">🟡 Processing</option>
                          <option value="Dispatched">📦 Dispatched</option>
                          <option value="Delivered">🟢 Delivered</option>
                          <option value="Closed">⚪ Closed</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <a
                          href={`https://wa.me/${s.mobile?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${s.customer_name}, regarding your sample request ${s.sample_id} for ${s.product_name} from G V Clothings Tiruppur...`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-whatsapp btn-sm text-[10px] py-1 px-2.5"
                        >
                          WhatsApp
                        </a>
                        <button
                          onClick={() => deleteSampleRequest(s.sample_id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          title="Delete Request"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CALLBACK REQUESTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'callbacks' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Phone size={22} className="text-blue-600" />
                <span>Instant Buyer Callbacks ({callbackRequests.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Buyers requesting phone callbacks for rate negotiation and logistics queries.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Callback ID</th>
                  <th className="p-3.5">Buyer Name & Company</th>
                  <th className="p-3.5">Mobile Number</th>
                  <th className="p-3.5">Requirement</th>
                  <th className="p-3.5">Preferred Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {callbackRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      No callback requests pending.
                    </td>
                  </tr>
                ) : (
                  callbackRequests.map(c => (
                    <tr key={c.callback_id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{c.callback_id}</td>
                      <td className="p-3.5">
                        <strong className="block text-slate-900">{c.name}</strong>
                        <span className="text-slate-500 text-[11px]">{c.company}</span>
                      </td>
                      <td className="p-3.5">
                        <a href={`tel:${c.mobile}`} className="font-bold text-blue-700 hover:underline">
                          📞 {c.mobile}
                        </a>
                      </td>
                      <td className="p-3.5 text-slate-700">{c.requirement}</td>
                      <td className="p-3.5 font-bold text-amber-700">{c.preferred_time}</td>
                      <td className="p-3.5">
                        <select
                          value={c.status || 'Pending'}
                          onChange={(e) => updateCallbackStatus(c.callback_id, e.target.value)}
                          className="form-control text-xs py-1 font-bold"
                        >
                          <option value="Pending">🔴 Pending</option>
                          <option value="Call Completed">🟢 Call Completed</option>
                          <option value="No Answer">🟡 No Answer</option>
                          <option value="Rescheduled">⚪ Rescheduled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <a
                          href={`https://wa.me/${c.mobile?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${c.name}, calling from G V Clothings Tiruppur regarding your callback request...`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-whatsapp btn-sm text-[10px] py-1 px-2.5"
                        >
                          WhatsApp
                        </a>
                        <button
                          onClick={() => deleteCallbackRequest(c.callback_id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                          title="Delete Request"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: OFFERS & ANNOUNCEMENTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'offers' && (
        <div className="space-y-6">
          {/* OFFERS SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Percent size={22} className="text-emerald-600" />
                  <span>Wholesale Promotional Offers & Discount Banners</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Offers displayed on the wholesale storefront and catalogue.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingOffer(null);
                  setOfferForm({
                    title: '',
                    description: '',
                    discount_text: 'Flat ₹15 OFF per Kg on 500+ Kg Orders',
                    coupon_code: 'GVBULK500',
                    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&auto=format&fit=crop',
                    expiry_date: '2026-12-31',
                    status: 'Active'
                  });
                  setShowOfferModal(true);
                }}
                className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={15} /> Add New Offer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(adminOffers.length > 0 ? adminOffers : offers).map(o => (
                <div key={o.offer_id} className="border border-slate-200 rounded-2xl p-4 flex gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <img src={o.image} alt="" className="w-24 h-24 object-cover rounded-xl border border-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {o.discount_text || 'Special Deal'}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingOffer(o);
                            setOfferForm(o);
                            setShowOfferModal(true);
                          }}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteOfferItem(o.offer_id, o.title)}
                          className="p-1 hover:bg-rose-100 rounded text-rose-600"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm">{o.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{o.description}</p>
                    <div className="text-[10px] text-slate-400 font-medium">
                      Expires: {o.expiry_date} · Status: <span className="font-bold text-emerald-600">{o.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ANNOUNCEMENTS SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Megaphone size={22} className="text-amber-600" />
                  <span>Storefront Announcement Ticker Banners</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top bar scrolling announcements seen by visitors on every page.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingAnn(null);
                  setAnnForm({
                    title: 'Direct daily cargo dispatch to Kerala, Bangalore, Chennai & Pan-India',
                    description: '',
                    badge: 'Logistics Update',
                    expiry_date: '2026-12-31',
                    status: 'Active'
                  });
                  setShowAnnModal(true);
                }}
                className="btn btn-outline btn-sm text-xs font-bold flex items-center gap-1.5"
              >
                <Plus size={15} /> Add Announcement
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {(adminAnnouncements.length > 0 ? adminAnnouncements : announcements).map(a => (
                <div key={a.announcement_id} className="py-3 flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      {a.badge || 'Ticker'}
                    </span>
                    <p className="text-xs font-semibold text-slate-900">{a.title}</p>
                    <span className="text-[10px] text-slate-400">Expires: {a.expiry_date}</span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setEditingAnn(a);
                        setAnnForm(a);
                        setShowAnnModal(true);
                      }}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnItem(a.announcement_id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUDIT TRAIL & SYSTEM ACTIVITY HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <History size={22} className="text-blue-600" />
                <span>Admin Audit Trail & Activity History Log</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every action (product addition, price modification, status updates, enquiries) is tracked with timestamp.
              </p>
            </div>

            <button
              onClick={fetchAdminData}
              className="btn btn-outline btn-sm text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw size={13} /> Refresh Log
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No recent activity records. Start editing products or managing enquiries to view the audit log.
              </div>
            ) : (
              activityLogs.map(log => (
                <div key={log.log_id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900 text-amber-400 shrink-0 mt-0.5">
                    <Clock size={14} />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{log.action?.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs">{log.details}</p>
                    <span className="text-[10px] text-slate-400">Performed by: {log.user || 'Admin'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT FULL PRODUCT SPECIFICATIONS */}
      {/* ========================================================================= */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">
                  {editingProduct ? 'Edit Product Specifications' : 'Add New Fabric Product'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingProduct ? `Editing product code: ${editingProduct.product_code}` : 'Publish new Tiruppur fabric to live catalogue'}
                </p>
              </div>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label font-bold">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.product_name}
                    onChange={(e) => setProdForm({ ...prodForm, product_name: e.target.value })}
                    className="form-control text-xs"
                    placeholder="e.g. 100% Combed Cotton Fine Printed Fabric"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">Product Code *</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      required
                      value={prodForm.product_code}
                      onChange={(e) => setProdForm({ ...prodForm, product_code: e.target.value })}
                      className="form-control text-xs font-mono font-bold"
                      placeholder="e.g. GVF-101"
                    />
                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, product_code: `GVF-${Math.floor(100 + Math.random() * 900)}` })}
                      className="btn btn-outline btn-sm text-[10px] px-2"
                      title="Auto Generate"
                    >
                      Gen
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label font-bold">Category *</label>
                  <select
                    value={prodForm.category_id}
                    onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}
                    className="form-control text-xs font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">Fabric Composition</label>
                  <input
                    type="text"
                    value={prodForm.fabric}
                    onChange={(e) => setProdForm({ ...prodForm, fabric: e.target.value })}
                    className="form-control text-xs"
                    placeholder="e.g. 100% Combed Cotton Bio-Wash"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">GSM Weight</label>
                  <input
                    type="text"
                    value={prodForm.gsm}
                    onChange={(e) => setProdForm({ ...prodForm, gsm: e.target.value })}
                    className="form-control text-xs"
                    placeholder="e.g. 180 GSM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="form-group">
                  <label className="form-label font-bold">Wholesale Price *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="form-control text-xs font-bold text-blue-700"
                    placeholder="e.g. ₹320 - ₹380 / Kg"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">MOQ *</label>
                  <input
                    type="number"
                    required
                    value={prodForm.moq}
                    onChange={(e) => setProdForm({ ...prodForm, moq: e.target.value })}
                    className="form-control text-xs font-bold"
                    placeholder="100"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">Unit</label>
                  <select
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                    className="form-control text-xs"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Meters">Meters</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Rolls">Rolls</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">Stock Availability</label>
                  <select
                    value={prodForm.availability}
                    onChange={(e) => setProdForm({ ...prodForm, availability: e.target.value })}
                    className="form-control text-xs font-bold"
                  >
                    <option value="Available">Available</option>
                    <option value="Limited">Limited</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label font-bold">Widths / Sizes (comma separated)</label>
                  <input
                    type="text"
                    value={prodForm.sizes}
                    onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })}
                    className="form-control text-xs"
                    placeholder="e.g. 36 inch, 42 inch, 48 inch, 54 inch, 60 inch"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">Colours / Shades (comma separated)</label>
                  <input
                    type="text"
                    value={prodForm.colours}
                    onChange={(e) => setProdForm({ ...prodForm, colours: e.target.value })}
                    className="form-control text-xs"
                    placeholder="e.g. White, Black, Navy Blue, Melange Grey, Maroon"
                  />
                </div>
              </div>

              {/* Product Image URL & Preview */}
              <div className="form-group space-y-2">
                <label className="form-label font-bold">Product High-Resolution Photo URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={prodForm.images[0] || ''}
                    onChange={(e) => setProdForm({ ...prodForm, images: [e.target.value] })}
                    className="form-control text-xs flex-1"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {prodForm.images[0] && (
                    <img
                      src={prodForm.images[0]}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                  )}
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-bold">Quick Presets:</span>
                  {samplePresets.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, images: [preset.url] })}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-medium transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label font-bold">Full Product Description</label>
                <textarea
                  rows="3"
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="form-control text-xs"
                  placeholder="Detailed specifications, quality certifications, processing notes..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_new_arrival"
                  checked={prodForm.is_new_arrival}
                  onChange={(e) => setProdForm({ ...prodForm, is_new_arrival: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="is_new_arrival" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Feature as "New Arrival" on Homepage & Catalogue
                </label>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="btn btn-primary btn-md flex-1 font-bold shadow-md text-xs"
                >
                  {savingProduct ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product to Live Catalogue'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-outline btn-md text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DETAILED ENQUIRY & FOLLOW-UP TIMELINE HISTORY MODAL */}
      {/* ========================================================================= */}
      {viewingEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 border border-slate-200">
            <div className="flex justify-between items-start pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                    {viewingEnquiry.enquiry_id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    viewingEnquiry.status === 'New'
                      ? 'bg-rose-100 text-rose-800'
                      : viewingEnquiry.status === 'Contacted'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {viewingEnquiry.status}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Enquiry Details & Follow-up History
                </h3>
              </div>
              <button
                onClick={() => setViewingEnquiry(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Buyer & Requirements Summary */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Buyer Contact</span>
                <strong className="text-slate-900 text-sm block">{viewingEnquiry.customer_name}</strong>
                <span className="text-slate-600 block">{viewingEnquiry.company_name}</span>
                <span className="text-blue-700 font-mono block mt-0.5">📞 {viewingEnquiry.mobile}</span>
                <span className="text-slate-500 block">📍 {viewingEnquiry.location} ({viewingEnquiry.buyer_type})</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Fabric Requirement</span>
                <strong className="text-slate-900 text-sm block">{viewingEnquiry.product_name}</strong>
                <span className="text-blue-700 font-bold block">Quantity: {viewingEnquiry.quantity} Pcs / Kg</span>
                <span className="text-slate-600 block text-[11px]">Size/Width: {viewingEnquiry.size}</span>
                <span className="text-slate-600 block text-[11px]">Colour/Print: {viewingEnquiry.colour}</span>
                <span className="text-amber-800 font-semibold block text-[11px]">
                  Sample Required: {viewingEnquiry.sample_required ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {viewingEnquiry.message && (
              <div className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl text-xs text-amber-950">
                <span className="font-bold block mb-0.5">Customer Message:</span>
                "{viewingEnquiry.message}"
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${viewingEnquiry.mobile?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${viewingEnquiry.customer_name}, regarding your bulk enquiry ${viewingEnquiry.enquiry_id} for ${viewingEnquiry.product_name}...`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-whatsapp btn-sm flex-1 text-xs"
              >
                <MessageSquare size={14} /> WhatsApp Buyer
              </a>
              <a
                href={`tel:${viewingEnquiry.mobile}`}
                className="btn btn-primary btn-sm flex-1 text-xs"
              >
                <Phone size={14} /> Call Buyer
              </a>
            </div>

            {/* ADD NOTE & UPDATE STATUS FORM */}
            <form onSubmit={handleAddEnquiryFollowupNote} className="space-y-3 pt-3 border-t border-slate-200">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Edit size={14} className="text-blue-600" />
                <span>Log New Follow-up Remark or Change Status</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={newEnquiryStatus}
                  onChange={(e) => setNewEnquiryStatus(e.target.value)}
                  className="form-control text-xs font-bold"
                >
                  <option value="New">🔴 Status: New</option>
                  <option value="Contacted">🟡 Status: Contacted</option>
                  <option value="Sample Sent">📦 Status: Sample Sent</option>
                  <option value="Completed">🟢 Status: Completed</option>
                  <option value="Cancelled">⚪ Status: Cancelled</option>
                </select>

                <input
                  type="text"
                  required
                  value={newEnquiryNote}
                  onChange={(e) => setNewEnquiryNote(e.target.value)}
                  placeholder="e.g. Quoted ₹310/Kg, buyer requested 500Kg dispatch next Monday..."
                  className="form-control text-xs sm:col-span-2"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary btn-sm text-xs font-bold flex items-center gap-1.5">
                  <Send size={13} /> Save to Timeline History
                </button>
              </div>
            </form>

            {/* TIMELINE / HISTORY TRAIL */}
            <div className="space-y-3 pt-3 border-t border-slate-200 max-h-60 overflow-y-auto pr-1">
              <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <History size={14} className="text-blue-600" />
                <span>Enquiry Interaction Timeline & History Trail</span>
              </h4>

              {(!viewingEnquiry.history || viewingEnquiry.history.length === 0) ? (
                <p className="text-xs text-slate-400">No interaction records yet.</p>
              ) : (
                <div className="space-y-2">
                  {viewingEnquiry.history.map((h, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">
                            {h.status ? `Status: ${h.status}` : 'Note'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(h.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs">{h.note}</p>
                        <span className="text-[10px] text-slate-400">By: {h.author || 'Admin'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT PROMOTIONAL OFFER */}
      {/* ========================================================================= */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingOffer ? 'Edit Promotional Offer' : 'Create New Wholesale Offer'}
              </h3>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveOffer} className="space-y-3 text-xs">
              <div className="form-group">
                <label className="form-label font-bold">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={offerForm.title}
                  onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                  className="form-control text-xs"
                  placeholder="e.g. Festival Wholesale Cotton Bonanza"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label font-bold">Discount Text *</label>
                  <input
                    type="text"
                    required
                    value={offerForm.discount_text}
                    onChange={(e) => setOfferForm({ ...offerForm, discount_text: e.target.value })}
                    className="form-control text-xs"
                    placeholder="e.g. Flat ₹20 OFF per Kg"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">Coupon Code</label>
                  <input
                    type="text"
                    value={offerForm.coupon_code || ''}
                    onChange={(e) => setOfferForm({ ...offerForm, coupon_code: e.target.value })}
                    className="form-control text-xs font-mono font-bold"
                    placeholder="e.g. GVBULK500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label font-bold">Expiry Date</label>
                  <input
                    type="date"
                    value={offerForm.expiry_date}
                    onChange={(e) => setOfferForm({ ...offerForm, expiry_date: e.target.value })}
                    className="form-control text-xs"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">Status</label>
                  <select
                    value={offerForm.status}
                    onChange={(e) => setOfferForm({ ...offerForm, status: e.target.value })}
                    className="form-control text-xs font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label font-bold">Banner Image URL</label>
                <input
                  type="url"
                  value={offerForm.image}
                  onChange={(e) => setOfferForm({ ...offerForm, image: e.target.value })}
                  className="form-control text-xs"
                />
              </div>

              <div className="form-group">
                <label className="form-label font-bold">Offer Description</label>
                <textarea
                  rows="2"
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  className="form-control text-xs"
                  placeholder="Terms & conditions or applicable fabric lines..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn btn-primary btn-md flex-1 text-xs font-bold">
                  Save Offer
                </button>
                <button type="button" onClick={() => setShowOfferModal(false)} className="btn btn-outline btn-md text-xs">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD / EDIT ANNOUNCEMENT TICKER */}
      {/* ========================================================================= */}
      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingAnn ? 'Edit Announcement' : 'Add Storefront Announcement'}
              </h3>
              <button onClick={() => setShowAnnModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-3 text-xs">
              <div className="form-group">
                <label className="form-label font-bold">Badge Text</label>
                <input
                  type="text"
                  required
                  value={annForm.badge}
                  onChange={(e) => setAnnForm({ ...annForm, badge: e.target.value })}
                  className="form-control text-xs"
                  placeholder="e.g. Festival Launch, Logistics Alert"
                />
              </div>

              <div className="form-group">
                <label className="form-label font-bold">Announcement Text *</label>
                <textarea
                  rows="2"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="form-control text-xs"
                  placeholder="Announcement shown in header ticker..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label font-bold">Expiry Date</label>
                  <input
                    type="date"
                    value={annForm.expiry_date}
                    onChange={(e) => setAnnForm({ ...annForm, expiry_date: e.target.value })}
                    className="form-control text-xs"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label font-bold">Status</label>
                  <select
                    value={annForm.status}
                    onChange={(e) => setAnnForm({ ...annForm, status: e.target.value })}
                    className="form-control text-xs font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn btn-primary btn-md flex-1 text-xs font-bold">
                  Save Announcement
                </button>
                <button type="button" onClick={() => setShowAnnModal(false)} className="btn btn-outline btn-md text-xs">
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
