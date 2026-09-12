import React from 'react';
import { Tag, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { openWhatsApp } from '../utils/whatsapp';

export function OffersPage({ navigate }) {
  const { offers, announcements } = useData();

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">Wholesale Savings</span>
        <h1 className="text-2xl md:text-3xl font-extrabold">Active Wholesale Offers & Announcements</h1>
        <p className="text-xs text-slate-300 mt-1">
          Special volume discount deals and factory announcements for bulk buyers.
        </p>
      </div>

      {/* Announcements Banner List */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-lg">📢 Factory Announcements</h3>
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.announcement_id} className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {ann.badge || 'Announcement'}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mt-1">{ann.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{ann.description}</p>
                </div>
                {ann.expiry_date && (
                  <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
                    <Calendar size={12} /> Valid till: {ann.expiry_date}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Offers Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-lg">🏷️ Current Bulk Offers</h3>
        {offers.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            No active promotional offers currently. Contact sales for custom bulk quote.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer) => (
              <div key={offer.offer_id} className="card p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {offer.discount_text}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xl">{offer.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{offer.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs gap-2">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar size={13} className="text-blue-600" />
                    Expires: <strong>{offer.expiry_date}</strong>
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('bulk_enquiry')}
                      className="btn btn-primary btn-sm text-xs"
                    >
                      <span>Claim Offer</span>
                      <ArrowRight size={13} />
                    </button>
                    <button
                      onClick={() => openWhatsApp(null, 500)}
                      className="btn btn-whatsapp btn-sm text-xs"
                    >
                      <MessageSquare size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
