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
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total_products: 0,
    new_enquiries: 0,
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
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/offers').then(r => r.json()),
        fetch('/api/announcements').then(r => r.json())
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
      const [enqRes, smpRes, cbRes, statsRes] = await Promise.all([
        fetch('/api/enquiries').then(r => r.json()),
        fetch('/api/sample-requests').then(r => r.json()),
        fetch('/api/callback-requests').then(r => r.json()),
        fetch('/api/admin/stats').then(r => r.json())
      ]);

      if (enqRes.success) setEnquiries(enqRes.data);
      if (smpRes.success) setSampleRequests(smpRes.data);
      if (cbRes.success) setCallbackRequests(cbRes.data);
      if (statsRes.success) setStats(statsRes.data);
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

  return (
    <DataContext.Provider value={{
      lang, setLang, t,
      categories, products, enquiries, sampleRequests, callbackRequests,
      offers, announcements, loading, searchQuery, setSearchQuery, stats,
      fetchAllData, fetchAdminData,
      submitEnquiry, submitSampleRequest, submitCallbackRequest,
      setProducts
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
