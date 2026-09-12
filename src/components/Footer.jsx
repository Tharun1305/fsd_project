import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageSquare, QrCode, ArrowRight, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import { openWhatsApp } from '../utils/whatsapp';
import { downloadDigitalCatalogue } from '../utils/pdfCatalog';

export function Footer({ navigate, onOpenQR }) {
  const { products, t } = useData();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t border-slate-800">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Column 1: Company Profile */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                GV
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">G V Clothings</span>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Premier B2B fabric manufacturer & bulk supplier located in Tiruppur, Tamil Nadu. Specializing in high-volume bio-wash cotton fabrics, interlock, loop knit, terry, yarn, and thread for wholesalers and textile buyers.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openWhatsApp(null, 500)}
                className="btn btn-whatsapp btn-sm"
              >
                <MessageSquare size={15} />
                <span>WhatsApp Desk</span>
              </button>
              <button
                onClick={onOpenQR}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-amber-400 transition-colors"
                title="Scan QR Code"
              >
                <QrCode size={18} />
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-4 border-blue-600 pl-2">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              {['products', 'categories', 'latest', 'new_arrivals', 'offers', 'digital_catalogue', 'bulk_enquiry', 'sample_request', 'callback_request', 'faq'].map((linkKey) => (
                <li key={linkKey}>
                  <button
                    onClick={() => navigate(linkKey)}
                    className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 capitalize"
                  >
                    <ArrowRight size={12} className="text-blue-500" />
                    <span>{t(linkKey)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Regions & Catalogue */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-4 border-emerald-500 pl-2">
              Major Buyer Hubs Served
            </h4>
            <ul className="space-y-2 text-sm text-slate-400 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span><strong>Tamil Nadu:</strong> Chennai, Madurai, Coimbatore, Salem</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span><strong>Kerala:</strong> Kochi/Ernakulam, Kozhikode, Trivandrum</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span><strong>Karnataka:</strong> Bangalore (Commercial St, Chickpet)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span><strong>Pan-India:</strong> Telangana, AP, Maharashtra & Exports</span>
              </li>
            </ul>

            <button
              onClick={() => downloadDigitalCatalogue(products)}
              className="btn btn-outline w-full text-xs font-semibold text-slate-200 border-slate-700 hover:bg-slate-800"
            >
              <Download size={14} className="text-blue-400" />
              <span>Download PDF Catalogue</span>
            </button>
          </div>

          {/* Column 4: Factory & Showroom Contact */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-l-4 border-amber-500 pl-2">
              Factory & Showroom
            </h4>
            <div className="space-y-3 text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin size={18} className="text-amber-400 shrink-0 mt-1" />
                <span>34, 4th Cross St, T N K Nagar, Nesavalar Colony, Tiruppur, Tamil Nadu 641602, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-blue-400 shrink-0" />
                <span>+91 73390 22308</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-rose-400 shrink-0" />
                <span>sales@tirupurtexcraft.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-emerald-400 shrink-0" />
                <span>Mon - Sun: 9:00 AM - 8:30 PM (Showroom open for buyers)</span>
              </div>
            </div>

            <button
              onClick={() => navigate('contact')}
              className="mt-4 text-xs text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Get Directions to Tiruppur Unit</span>
              <ArrowRight size={12} />
            </button>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <p>© 2026 G V Clothings. Built for Wholesale Buyers & Manufacturers.</p>
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('faq')} className="hover:text-slate-300">B2B FAQs</button>
            <span>•</span>
            <button onClick={() => navigate('about')} className="hover:text-slate-300">Quality Process</button>
            <span>•</span>
            <button onClick={() => navigate('admin_login')} className="hover:text-slate-300">Admin Login</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
