import React from 'react';
import { Download, QrCode, MessageSquare, Layers, FileText, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { downloadDigitalCatalogue } from '../utils/pdfCatalog';
import { openWhatsApp } from '../utils/whatsapp';

export function DigitalCataloguePage({ navigate, onOpenQR, onEnquireProduct }) {
  const { products } = useData();

  return (
    <div className="container py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Official 2026 Release</span>
          <h1 className="text-2xl md:text-3xl font-extrabold">G V Clothings Digital Catalogue</h1>
          <p className="text-xs md:text-sm text-slate-300">
            Download or view product specifications, wholesale price ranges, and minimum order quantities.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadDigitalCatalogue(products)}
            className="btn btn-primary btn-md shadow-lg"
          >
            <Download size={16} />
            <span>Download PDF Catalogue</span>
          </button>

          <button
            onClick={onOpenQR}
            className="btn btn-gold btn-md shadow-lg"
          >
            <QrCode size={16} />
            <span>Scan QR Code</span>
          </button>
        </div>
      </div>

      {/* Grid Catalogue View */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            <span>Catalogued Fabric Products ({products.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Updated 7 Days Ago</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.product_id} className="p-4 border border-slate-200 rounded-xl flex gap-4 hover:border-blue-400 transition-colors bg-slate-50/50">
              <img
                src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'}
                alt={p.product_name}
                className="w-24 h-28 object-cover rounded-lg border border-slate-200 shrink-0"
              />

              <div className="flex-1 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="bg-slate-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                      {p.product_code}
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      MOQ: {p.moq} Pcs
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{p.product_name}</h4>
                  <p className="text-slate-500 mt-1 line-clamp-1"><strong>Fabric:</strong> {p.fabric}</p>
                  <p className="text-slate-500"><strong>Sizes:</strong> {(p.sizes || []).join(', ')}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-extrabold text-blue-600 text-sm">{p.price}</span>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onEnquireProduct(p)}
                      className="btn btn-primary btn-sm text-[11px] py-1 px-2"
                    >
                      Enquire
                    </button>
                    <button
                      onClick={() => openWhatsApp(p, p.moq)}
                      className="btn btn-whatsapp btn-sm text-[11px] py-1 px-2"
                    >
                      <MessageSquare size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
