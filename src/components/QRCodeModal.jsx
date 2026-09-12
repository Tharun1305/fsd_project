import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download, Share2, Smartphone } from 'lucide-react';

export function QRCodeModal({ isOpen, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const catalogueUrl = window.location.origin + '/#digital_catalogue';
      QRCode.toCanvas(canvasRef.current, catalogueUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      }, (err) => {
        if (err) console.error('QR code generation error:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg bg-slate-100 hover:bg-slate-200"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-xl">
            📱
          </div>
          <h3 className="font-extrabold text-slate-900 text-xl">Digital Catalogue QR</h3>
          <p className="text-xs text-slate-500 mt-1">
            Scan with your mobile phone camera to instantly access our Tiruppur wholesale catalogue.
          </p>
        </div>

        {/* Canvas QR rendering */}
        <div className="flex justify-center my-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <canvas ref={canvasRef} className="rounded-lg shadow-sm" />
        </div>

        <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-4 border border-blue-100">
          💡 <strong>Showroom & Brochure Use:</strong> Print this QR code on visiting cards, packaging boxes, and showroom banners.
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (canvasRef.current) {
                const link = document.createElement('a');
                link.download = 'GV-Clothings-Catalogue-QR.png';
                link.href = canvasRef.current.toDataURL();
                link.click();
              }
            }}
            className="btn btn-primary btn-sm flex-1 text-xs"
          >
            <Download size={14} />
            <span>Download PNG</span>
          </button>

          <button
            onClick={onClose}
            className="btn btn-outline btn-sm text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
