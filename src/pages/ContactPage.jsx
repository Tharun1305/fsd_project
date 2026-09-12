import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, Navigation, ArrowRight } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';

export function ContactPage({ navigate }) {
  return (
    <div className="container py-8 space-y-10 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Tiruppur Unit & Showroom</span>
        <h1 className="text-3xl font-extrabold text-slate-900">Contact Us & Showroom Location</h1>
        <p className="text-slate-600 text-sm">
          Visit our factory showroom in Tiruppur or connect directly with our wholesale sales desk.
        </p>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-l-blue-600 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin size={22} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Factory & Showroom Address</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            34, 4th Cross St, T N K Nagar, Nesavalar Colony, Tiruppur, Tamil Nadu - 641602, India
          </p>
        </div>

        <div className="card p-6 border-l-4 border-l-emerald-600 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Phone size={22} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Phone & WhatsApp Sales</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Hotline:</strong> +91 73390 22308<br />
            <strong>Landline:</strong> +91 421 2248900<br />
            <strong>Email:</strong> sales@tirupurtexcraft.com
          </p>
          <button
            onClick={() => openWhatsApp(null, 500)}
            className="btn btn-whatsapp btn-sm w-full text-xs"
          >
            <MessageSquare size={14} />
            <span>Chat on WhatsApp</span>
          </button>
        </div>

        <div className="card p-6 border-l-4 border-l-amber-600 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Showroom Timings</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Monday – Sunday:</strong> 9:00 AM – 8:30 PM<br />
            Open all 7 days for outstation wholesale buyers from Kerala & Bangalore.
          </p>
          <button
            onClick={() => navigate('callback_request')}
            className="btn btn-primary btn-sm w-full text-xs"
          >
            Request Callback
          </button>
        </div>
      </div>

      {/* TRAVEL & DIRECTIONS GUIDE FOR OUTSTATION BUYERS */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Navigation size={18} />
          <span>Outstation Buyer Travel Guide</span>
        </div>
        <h2 className="text-2xl font-extrabold">How to Reach Our Tiruppur Showroom</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm">🌴 Travelling from Kerala (Palakkad / Kochi / Calicut)</h4>
            <p>● <strong>By Train:</strong> All major Kerala trains stop at Tiruppur Railway Station (TUP). Our showroom at T N K Nagar is a short auto ride from the station.</p>
            <p>● <strong>By Road:</strong> Travel via NH544 through Walayar / Palakkad toll. Auto & taxi pickup available upon arrival.</p>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
            <h4 className="font-bold text-blue-300 text-sm">🏬 Travelling from Bangalore / Karnataka</h4>
            <p>● <strong>By Bus / Car:</strong> Travel via Hosur - Salem - Perundurai - Tiruppur NH44 highway. Total journey is ~5 hours.</p>
            <p>● <strong>Pickup Facility:</strong> Call our sales desk in advance and we can arrange showroom transport from the Tiruppur Bus Stand.</p>
          </div>
        </div>
      </div>

      {/* Google Maps Simulation Canvas/Iframe container */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-md space-y-3">
        <h3 className="font-bold text-slate-900 text-base">Google Maps Location</h3>
        <div className="relative aspect-21/9 rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center text-center p-6">
          <div className="space-y-2">
            <MapPin size={36} className="text-rose-600 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-slate-900 text-lg">G V Clothings Factory Showroom</h4>
            <p className="text-xs text-slate-600">34, 4th Cross St, T N K Nagar, Nesavalar Colony, Tiruppur - 641602</p>
            <a
              href="https://www.google.com/maps/place/11%C2%B007'34.1%22N+77%C2%B020'42.5%22E/@11.126133,77.342556,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm text-xs inline-flex items-center gap-1 mt-2"
            >
              <Navigation size={14} />
              <span>Open in Google Maps App</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
