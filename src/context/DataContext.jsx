import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations } from '../utils/i18n';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [sampleRequests, setSampleRequests] = useState([]);
  const [callbackRequests, setCallbackRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [adminOffers, setAdminOffers] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [adminAnnouncements, setAdminAnnouncements] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total_products: 0,
    new_enquiries: 0,
    total_enquiries: 0,
    sample_requests: 0,
    callback_requests: 0,
    out_of_stock: 0,
    active_offers: 0
  });

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes, offerRes, annRes] = await Promise.all([
        fetch('/api/categories').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/products').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/offers').then(r => r.json()).catch(() => ({ success: false })),
        fetch('/api/announcements').then(r => r.json()).catch(() => ({ success: false }))
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (offerRes.success) setOffers(offerRes.data);
      if (annRes.success) setAnnouncements(annRes.data);
    } catch (err) {
      console.error('Error fetching API data:', err);
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
      return { success: false, message: err.message };
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
      return { success: false, message: err.message };
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
      return { success: false, message: err.message };
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
