import React, { useState } from 'react';
import { Send, CheckCircle2, PackageCheck } from 'lucide-react';
import { useData } from '../context/DataContext';

export function SampleRequestPage({ selectedProduct }) {
  const { products, submitSampleRequest } = useData();

  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    mobile: '',
    location: '',
    product_id: selectedProduct?.product_id || '',
    product_name: selectedProduct ? `${selectedProduct.product_name} (${selectedProduct.product_code})` : '',
    requirement: 'Fabric Swatch Shade Card & Single Piece Sample',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitSampleRequest(formData);
    setSubmitting(false);
    if (res.success) {
      setSuccessMsg(res.message);
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl text-center space-y-2">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Quality Verification</span>
        <h1 className="text-2xl font-extrabold">Request Fabric & Product Samples</h1>
        <p className="text-xs text-slate-300">
          Inspect fabric GSM, bio-wash finish, and sizing fit before placing large bulk commitments.
        </p>
      </div>

      {successMsg ? (
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 text-center space-y-3">
          <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
          <h2 className="font-bold text-xl text-slate-900">Sample Request Submitted!</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{successMsg}</p>
          <button onClick={() => setSuccessMsg('')} className="btn btn-primary btn-sm">
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input type="text" name="customer_name" required value={formData.customer_name} onChange={handleChange} className="form-control" placeholder="e.g. P. Murugan" />
          </div>

          <div className="form-group">
            <label className="form-label">Company / Shop Name</label>
            <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="form-control" placeholder="e.g. Murugan Mens Park" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="form-control" placeholder="+91 97890 11223" />
            </div>
            <div className="form-group">
              <label className="form-label">Location / City *</label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} className="form-control" placeholder="Madurai, Tamil Nadu" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Fabric Product</label>
            <select name="product_id" value={formData.product_id} onChange={(e) => {
              const p = products.find(prod => String(prod.product_id) === String(e.target.value));
              setFormData(prev => ({
                ...prev,
                product_id: e.target.value,
                product_name: p ? `${p.product_name} (${p.product_code})` : ''
              }));
            }} className="form-control">
              <option value="">Select Product Style</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>{p.product_name} ({p.product_code})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address & Notes</label>
            <textarea name="message" rows="3" value={formData.message} onChange={handleChange} className="form-control" placeholder="Enter courier delivery address for sample parcel dispatch..." />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
            <Send size={18} />
            <span>{submitting ? 'Submitting...' : 'Submit Sample Request'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
