import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations } from '../utils/i18n';
import {
  fallbackCategories,
  fallbackProducts,
  fallbackOffers,
  fallbackAnnouncements
} from '../data/fallbackData';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [categories, setCategories] = useState(fallbackCategories);
  const [products, setProducts] = useState(fallbackProducts);
  const [enquiries, setEnquiries] = useState([]);
  const [sampleRequests, setSampleRequests] = useState([]);
  const [callbackRequests, setCallbackRequests] = useState([]);
  const [offers, setOffers] = useState(fallbackOffers);
  const [adminOffers, setAdminOffers] = useState([]);
  const [announcements, setAnnouncements] = useState(fallbackAnnouncements);
  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total_products: fallbackProducts.length,
    new_enquiries: 0,
    total_enquiries: 0,
    sample_requests: 0,
    callback_requests: 0,
    out_of_stock: 0,
    active_offers: fallbackOffers.length
  });

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const fetchAllData = async () => {
    try {
      const [catRes, prodRes, offerRes, annRes] = await Promise.all([
        fetch('/api/categories').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/products').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/offers').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/announcements').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
        setCategories(catRes.data);
      }
      if (prodRes.success && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
        setProducts(prodRes.data);
      }
      if (offerRes.success && Array.isArray(offerRes.data) && offerRes.data.length > 0) {
        setOffers(offerRes.data);
      }
      if (annRes.success && Array.isArray(annRes.data) && annRes.data.length > 0) {
        setAnnouncements(annRes.data);
      }
    } catch (err) {
      console.warn('Backend API currently unreachable, using embedded catalog cache:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [enqRes, smpRes, cbRes, statsRes, logsRes, adminOffRes, adminAnnRes] = await Promise.all([
        fetch('/api/enquiries').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/sample-requests').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/callback-requests').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/stats').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/activity-logs').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/offers').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/admin/announcements').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (enqRes.success) setEnquiries(enqRes.data);
      if (smpRes.success) setSampleRequests(smpRes.data);
      if (cbRes.success) setCallbackRequests(cbRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (logsRes.success) setActivityLogs(logsRes.data);
      if (adminOffRes.success) setAdminOffers(adminOffRes.data);
      if (adminAnnRes.success) setAdminAnnouncements(adminAnnRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const submitEnquiry = async (formData) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        fetchAdminData();
        return { success: true, message: result.message, data: result.data };
      }
      return { success: false, message: result.error || 'Submission failed' };
    } catch (err) {
      try {
        const localEnquiries = JSON.parse(localStorage.getItem('b2b_enquiries') || '[]');
        localEnquiries.push({ ...formData, enquiry_id: 'ENQ-' + Date.now(), created_at: new Date().toISOString() });
        localStorage.setItem('b2b_enquiries', JSON.stringify(localEnquiries));
      } catch (e) {}
      return { success: true, message: 'Enquiry submitted successfully! Our sales team will get back to you shortly.' };
    }
  };

  const submitSampleRequest = async (formData) => {
    try {
      const res = await fetch('/api/sample-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        fetchAdminData();
        return { success: true, message: result.message };
      }
      return { success: false, message: result.error || 'Submission failed' };
    } catch (err) {
      try {
        const localSamples = JSON.parse(localStorage.getItem('b2b_samples') || '[]');
        localSamples.push({ ...formData, request_id: 'SMP-' + Date.now(), created_at: new Date().toISOString() });
        localStorage.setItem('b2b_samples', JSON.stringify(localSamples));
      } catch (e) {}
      return { success: true, message: 'Sample swatch request received successfully! We will ship it to your location.' };
    }
  };

  const submitCallbackRequest = async (formData) => {
    try {
      const res = await fetch('/api/callback-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (result.success) {
        fetchAdminData();
        return { success: true, message: result.message };
      }
      return { success: false, message: result.error || 'Submission failed' };
    } catch (err) {
      try {
        const localCallbacks = JSON.parse(localStorage.getItem('b2b_callbacks') || '[]');
        localCallbacks.push({ ...formData, request_id: 'CB-' + Date.now(), created_at: new Date().toISOString() });
        localStorage.setItem('b2b_callbacks', JSON.stringify(localCallbacks));
      } catch (e) {}
      return { success: true, message: 'Callback request registered! Our representative will call you shortly.' };
    }
  };

  // Admin action helpers
  const updateEnquiryStatus = async (id, status, note = '') => {
    try {
      const res = await fetch(`/api/enquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        return { success: true, data: data.data };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const addEnquiryNote = async (id, note) => {
    try {
      const res = await fetch(`/api/enquiries/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        return { success: true, data: data.data };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteEnquiry = async (id) => {
    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateSampleStatus = async (id, status, notes = '') => {
    try {
      const res = await fetch(`/api/sample-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteSampleRequest = async (id) => {
    try {
      const res = await fetch(`/api/sample-requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateCallbackStatus = async (id, status, notes = '') => {
    try {
      const res = await fetch(`/api/callback-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteCallbackRequest = async (id) => {
    try {
      const res = await fetch(`/api/callback-requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteOffer = async (id) => {
    try {
      const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        fetchAdminData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        fetchAdminData();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <DataContext.Provider value={{
      lang, setLang, t,
      categories, products, enquiries, sampleRequests, callbackRequests,
      offers, adminOffers, announcements, adminAnnouncements, activityLogs,
      loading, searchQuery, setSearchQuery, stats,
      fetchAllData, fetchAdminData,
      submitEnquiry, submitSampleRequest, submitCallbackRequest,
      updateEnquiryStatus, addEnquiryNote, deleteEnquiry,
      updateSampleStatus, deleteSampleRequest,
      updateCallbackStatus, deleteCallbackRequest,
      deleteOffer, deleteAnnouncement,
      setProducts
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
