import React, { useState } from 'react';
import { PhoneCall, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export function CallbackRequestPage() {
  const { submitCallbackRequest } = useData();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    mobile: '',
    requirement: 'Bulk Purchase & Wholesale Pricing Enquiry',
    preferred_time: 'Immediate / Next 2 Hours'
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await submitCallbackRequest(formData);
    setSubmitting(false);
    if (res.success) {
      setSuccessMsg(res.message);
    }
  };

  return (
    <div className="container py-8 max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl text-center space-y-2">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-white">
          <PhoneCall size={22} />
        </div>
        <h1 className="text-2xl font-extrabold">Request Instant Callback</h1>
        <p className="text-xs text-slate-300">
          Our Tiruppur wholesale manager will call you back at your preferred convenience.
        </p>
      </div>

      {successMsg ? (
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 text-center space-y-3">
          <CheckCircle2 size={40} className="text-emerald-600 mx-auto" />
          <h2 className="font-bold text-xl text-slate-900">Callback Registered!</h2>
          <p className="text-xs text-slate-600">{successMsg}</p>
          <button onClick={() => setSuccessMsg('')} className="btn btn-primary btn-sm">
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="form-control" placeholder="e.g. Venkatesh R." />
          </div>

          <div className="form-group">
            <label className="form-label">Company / Shop Name</label>
            <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-control" placeholder="e.g. Sri Balaji Textiles" />
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number *</label>
            <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="form-control" placeholder="+91 99400 55667" />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Time Slot</label>
            <select name="preferred_time" value={formData.preferred_time} onChange={handleChange} className="form-control">
              <option value="Immediate / Next 2 Hours">Immediate / Next 2 Hours</option>
              <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
              <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
            </select>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg w-full">
            <span>{submitting ? 'Submitting...' : 'Request Telephone Call'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
