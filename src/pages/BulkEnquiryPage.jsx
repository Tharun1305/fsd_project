import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { useData } from '../context/DataContext';
import { openWhatsApp } from '../utils/whatsapp';

export function BulkEnquiryPage({ selectedProduct }) {
  const { products, submitEnquiry } = useData();

  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    mobile: '',
    email: '',
    location: '',
    buyer_type: 'Wholesaler',
    product_id: selectedProduct?.product_id || '',
    product_name: selectedProduct ? `${selectedProduct.product_name} (${selectedProduct.product_code})` : '',
    quantity: selectedProduct?.moq || 500,
    size: 'Assorted (S-XXL)',
    colour: 'Assorted Colours',
    sample_required: false,
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductSelect = (e) => {
    const pId = e.target.value;
    const target = products.find(p => String(p.product_id) === String(pId));
    if (target) {
      setFormData(prev => ({
        ...prev,
        product_id: target.product_id,
        product_name: `${target.product_name} (${target.product_code})`,
        quantity: target.moq || 500
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        product_id: '',
        product_name: 'General Catalogue Requirement',
        quantity: 500
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.mobile || !formData.location) {
      setErrorMsg('Please fill in required fields: Name, Mobile Number, and Location.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    const result = await submitEnquiry(formData);
    setSubmitting(false);

    if (result.success) {
      setSuccessResponse(result);
    } else {
      setErrorMsg(result.message || 'Submission failed. Please try again.');
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl text-center space-y-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Direct Factory Quotation</span>
        <h1 className="text-2xl md:text-3xl font-extrabold">Submit Bulk Purchase Enquiry</h1>
        <p className="text-xs md:text-sm text-slate-300">
          Fill out your fabric requirements below. Our Tiruppur sales desk will contact you with wholesale pricing & availability.
        </p>
      </div>

      {successResponse ? (
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Bulk Enquiry Received!</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            {successResponse.message}
          </p>
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 font-mono inline-block">
            Enquiry Reference ID: <strong>{successResponse.data?.enquiry_id || 'ENQ-CONFIRMED'}</strong>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => openWhatsApp(selectedProduct, formData.quantity)}
              className="btn btn-whatsapp text-xs font-bold"
            >
              <MessageSquare size={16} />
              <span>Connect on WhatsApp Now</span>
            </button>
            <button
              onClick={() => setSuccessResponse(null)}
              className="btn btn-outline text-xs"
            >
              Submit Another Enquiry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200 shadow-lg space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Customer Details */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 border-b border-slate-100 pb-2">
              1. Business & Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  placeholder="e.g. K. Rajesh Kumar"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company / Shop Name</label>
                <input
                  type="text"
                  name="company_name"
                  placeholder="e.g. Rajesh Textiles & Wholesalers"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  placeholder="e.g. +91 73390 22308"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. sales@yourbusiness.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location / City *</label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Ernakulam / Kochi, Kerala"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Buyer Type *</label>
                <select
                  name="buyer_type"
                  value={formData.buyer_type}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="Fabric Manufacturer">Fabric Manufacturer</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Retailer">Retailer</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Clothing Business">Clothing Business</option>
                  <option value="Other">Other Bulk Buyer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Product & Quantity */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 border-b border-slate-100 pb-2">
              2. Product & Order Requirements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group md:col-span-2">
                <label className="form-label">Select Product Style</label>
                <select
                  value={formData.product_id}
                  onChange={handleProductSelect}
                  className="form-control"
                >
                  <option value="">General Tiruppur Fabric Enquiry (Multiple Products)</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} ({p.product_code}) - MOQ: {p.moq} Pcs
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Required Quantity (Pieces) *</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="50"
                  placeholder="e.g. 500"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Sizes</label>
                <input
                  type="text"
                  name="size"
                  placeholder="e.g. M, L, XL or Assorted ratio"
                  value={formData.size}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Colours</label>
                <input
                  type="text"
                  name="colour"
                  placeholder="e.g. Navy Blue (200), Black (200), White (100)"
                  value={formData.colour}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    name="sample_required"
                    checked={formData.sample_required}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Request physical sample swatch delivery prior to bulk dispatch</span>
                </label>
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Additional Instructions / Showroom Visit Plans</label>
                <textarea
                  name="message"
                  rows="3"
                  placeholder="Mention if you are planning a visit to Tiruppur, require custom branding labels, or specific delivery deadlines..."
                  value={formData.message}
                  onChange={handleChange}
                  className="form-control"
                ></textarea>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg w-full"
          >
            <Send size={18} />
            <span>{submitting ? 'Submitting Enquiry...' : 'Submit Bulk Enquiry Now'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
