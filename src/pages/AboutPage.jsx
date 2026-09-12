import React from 'react';
import { Factory, ShieldCheck, MapPin, Users, Award, Phone, Mail, ArrowRight, MessageSquare } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';

export function AboutPage({ navigate }) {
  return (
    <div className="container py-10 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Fabric Capital Sourcing</span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">About G V Clothings</h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          We are a premier B2B fabric manufacturing and wholesale supply house situated in the knitwear capital of India — <strong>Tiruppur, Tamil Nadu</strong>.
        </p>
      </div>

      {/* Main Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Our Tiruppur Heritage & B2B Focus</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Founded with a commitment to textile excellence, G V Clothings exclusively serves commercial buyers including fabric manufacturers, wholesalers, retail chain stores, distributors, and online apparel brands.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Our state-of-the-art knitting, bio-wash dyeing, and processing facilities in T N K Nagar, Tiruppur produce high-volume knit fabrics with stringent quality control standards.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200">
              <strong className="block text-2xl font-extrabold text-blue-600">50,000+</strong>
              <span className="text-xs text-slate-600 font-medium">Pieces Monthly Capacity</span>
            </div>
            <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200">
              <strong className="block text-2xl font-extrabold text-emerald-600">500+</strong>
              <span className="text-xs text-slate-600 font-medium">Active B2B Buyers</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop"
            alt="Tiruppur Textile Factory"
            className="w-full h-80 object-cover"
          />
        </div>
      </div>

      {/* Product Quality & Values */}
      <div className="bg-slate-900 text-white p-8 md:p-12 rounded-3xl space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Uncompromising Quality</span>
          <h2 className="text-2xl md:text-3xl font-extrabold">Our Quality & Manufacturing Process</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-base text-white">Combed Yarn Selection</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We source top-grade super combed cotton yarns to guarantee uniform knit structure, high tensile strength, and pill resistance.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-base text-white">Enzyme Bio-Wash Dyeing</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All our cotton fabrics undergo eco-friendly enzyme bio-wash treatments resulting in ultra-soft feel and 0% color bleeding.
            </p>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-base text-white">Precision Stitching & Inspection</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Double-needle shoulder-to-shoulder taping and 100% inline quality inspections before master bale packing.
            </p>
          </div>
        </div>
      </div>

      {/* Location & Showroom Invitation */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <MapPin size={16} className="text-blue-600" />
            <span>T N K Nagar Factory Showroom</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">Visiting Tiruppur? Stop by Our Showroom!</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            We welcome wholesale buyers, retailers, and distributors from Kerala, Tamil Nadu, Karnataka, and across India to physically inspect product samples, feel fabric GSM quality, and finalize bulk terms.
          </p>
          <div className="text-xs text-slate-600 font-semibold space-y-1">
            <p>📍 34, 4th Cross St, T N K Nagar, Nesavalar Colony, Tiruppur - 641602</p>
            <p>🕒 Open 7 Days a Week: 9:00 AM – 8:30 PM</p>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-3">
          <button
            onClick={() => navigate('contact')}
            className="btn btn-primary w-full"
          >
            <span>View Tiruppur Directions</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => openWhatsApp(null, 500)}
            className="btn btn-whatsapp w-full"
          >
            <MessageSquare size={16} />
            <span>WhatsApp Sales Manager</span>
          </button>
        </div>
      </div>
    </div>
  );
}
