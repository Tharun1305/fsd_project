import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations } from '../utils/i18n';
import { apiUrl, safeFetch } from '../config/api';

const DataContext = createContext();

// Backend connection error message shown to the user
const BACKEND_ERROR_MSG =
  'Could not reach the server. Please make sure the backend is running (npm run dev), or contact support.';

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
        safeFetch(apiUrl('/api/categories')),
        safeFetch(apiUrl('/api/products')),
        safeFetch(apiUrl('/api/offers')),
        safeFetch(apiUrl('/api/announcements'))
      ]);

      if (catRes.data?.success) setCategories(catRes.data.data);
      if (prodRes.data?.success) setProducts(prodRes.data.data);
      if (offerRes.data?.success) setOffers(offerRes.data.data);
      if (annRes.data?.success) setAnnouncements(annRes.data.data);
    } catch (err) {
      console.error('Error fetching API data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [enqRes, smpRes, cbRes, statsRes, logsRes, adminOffRes, adminAnnRes] = await Promise.all([
        safeFetch(apiUrl('/api/enquiries')),
        safeFetch(apiUrl('/api/sample-requests')),
        safeFetch(apiUrl('/api/callback-requests')),
        safeFetch(apiUrl('/api/admin/stats')),
        safeFetch(apiUrl('/api/admin/activity-logs')),
        safeFetch(apiUrl('/api/admin/offers')),
        safeFetch(apiUrl('/api/admin/announcements'))
      ]);

      if (enqRes.data?.success) setEnquiries(enqRes.data.data);
      if (smpRes.data?.success) setSampleRequests(smpRes.data.data);
      if (cbRes.data?.success) setCallbackRequests(cbRes.data.data);
      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (logsRes.data?.success) setActivityLogs(logsRes.data.data);
      if (adminOffRes.data?.success) setAdminOffers(adminOffRes.data.data);
      if (adminAnnRes.data?.success) setAdminAnnouncements(adminAnnRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const submitEnquiry = async (formData) => {
    try {
      const { ok, status, data } = await safeFetch(apiUrl('/api/enquiries'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (status === 0 || data === null) {
        return { success: false, message: BACKEND_ERROR_MSG };
      }
      if (data?.success) {
        fetchAdminData();
        return { success: true, message: data.message, data: data.data };
      }
      return { success: false, message: data?.error || data?.message || 'Submission failed. Please try again.' };
    } catch (err) {
      return { success: false, message: BACKEND_ERROR_MSG };
    }
  };

  const submitSampleRequest = async (formData) => {
    try {
      const { status, data } = await safeFetch(apiUrl('/api/sample-requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (status === 0 || data === null) {
        return { success: false, message: BACKEND_ERROR_MSG };
      }
      if (data?.success) {
        fetchAdminData();
        return { success: true, message: data.message };
      }
      return { success: false, message: data?.error || data?.message || 'Submission failed. Please try again.' };
    } catch (err) {
      return { success: false, message: BACKEND_ERROR_MSG };
    }
  };

  const submitCallbackRequest = async (formData) => {
    try {
      const { status, data } = await safeFetch(apiUrl('/api/callback-requests'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (status === 0 || data === null) {
        return { success: false, message: BACKEND_ERROR_MSG };
      }
      if (data?.success) {
        fetchAdminData();
        return { success: true, message: data.message };
      }
      return { success: false, message: data?.error || data?.message || 'Submission failed. Please try again.' };
    } catch (err) {
      return { success: false, message: BACKEND_ERROR_MSG };
    }
  };

  // Admin action helpers
  const updateEnquiryStatus = async (id, status, note = '') => {
    try {
      const { data } = await safeFetch(apiUrl(`/api/enquiries/${id}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note })
      });
      if (data?.success) {
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
      const { data } = await safeFetch(apiUrl(`/api/enquiries/${id}/notes`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      if (data?.success) {
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
      const { data } = await safeFetch(apiUrl(`/api/enquiries/${id}`), { method: 'DELETE' });
      if (data?.success) {
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
      const { data } = await safeFetch(apiUrl(`/api/sample-requests/${id}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (data?.success) {
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
      const { data } = await safeFetch(apiUrl(`/api/sample-requests/${id}`), { method: 'DELETE' });
      if (data?.success) {
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
      const { data } = await safeFetch(apiUrl(`/api/callback-requests/${id}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (data?.success) {
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
      const { data } = await safeFetch(apiUrl(`/api/callback-requests/${id}`), { method: 'DELETE' });
      if (data?.success) {
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
      const { data } = await safeFetch(apiUrl(`/api/offers/${id}`), { method: 'DELETE' });
      if (data?.success) {
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
      const { data } = await safeFetch(apiUrl(`/api/announcements/${id}`), { method: 'DELETE' });
      if (data?.success) {
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
