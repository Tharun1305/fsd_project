import React, { useState } from 'react';
import { MessageSquare, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Layers } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';
import { useData } from '../context/DataContext';

const FALLBACK_IMAGE = '/images/products/fabric_plain.jpg';

export function ProductCard({ product, onSelect, onEnquire }) {
  const { categories, t } = useData();
  const [imgError, setImgError] = useState(false);
  const categoryName = categories.find(c => String(c.category_id) === String(product.category_id))?.category_name || 'Fabrics';

  const getAvailabilityBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <span className="badge badge-available"><CheckCircle2 size={12} /> {t('in_stock')}</span>;
      case 'limited':
        return <span className="badge badge-limited"><AlertTriangle size={12} /> {t('limited_stock')}</span>;
      case 'out of stock':
        return <span className="badge badge-outofstock"><XCircle size={12} /> {t('out_of_stock')}</span>;
      default:
        return <span className="badge badge-available"><CheckCircle2 size={12} /> {t('in_stock')}</span>;
    }
  };

  const imgSrc = imgError
    ? FALLBACK_IMAGE
    : (product.images?.[0] || FALLBACK_IMAGE);

  const moqUnit = product.unit || 'Kg';

  return (
    <div className="card group flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-blue-400 transition-all duration-300">
      {/* Product Image Box */}
      <div
        className="relative overflow-hidden bg-slate-100 cursor-pointer"
        style={{ aspectRatio: '4/3' }}
        onClick={() => onSelect(product)}
      >
        <img
          src={imgSrc}
          alt={product.product_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start gap-2">
          <span className="bg-slate-900/90 text-white font-mono text-xs font-bold px-2 py-0.5 rounded backdrop-blur-sm shrink-0">
            {product.product_code || 'GVF-100'}
          </span>
          {getAvailabilityBadge(product.availability)}
        </div>

        {product.is_new_arrival && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="badge badge-new shadow-sm">NEW ARRIVAL</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-1.5 text-xs text-slate-500 mb-1.5 min-h-[2rem]">
          <span className="font-semibold text-blue-600 uppercase tracking-wider shrink-0">{categoryName}</span>
          <span className="shrink-0">•</span>
          <span className="flex items-center gap-1 font-medium text-slate-600 line-clamp-1">
            <Layers size={12} className="shrink-0" />
            <span className="truncate">{product.fabric}</span>
          </span>
        </div>

        <h3
          onClick={() => onSelect(product)}
          className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug min-h-[2.75rem]"
          title={product.product_name}
        >
          {product.product_name}
        </h3>

        {/* Pricing & MOQ Grid */}
        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 my-2 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">{t('approx_wholesale')}</span>
            <span className="font-bold text-slate-900 text-sm">{product.price || 'Contact for Price'}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">{t('min_order')}</span>
            <span className="font-bold text-blue-600 text-sm">{product.moq || 100} {moqUnit}</span>
          </div>
        </div>

        {/* Available Colors */}
        <div className="text-xs text-slate-500 mb-4 line-clamp-1">
          <span className="font-semibold text-slate-700">{t('colors')}:</span> {(product.colours || []).slice(0, 3).join(', ')}
          {product.colours?.length > 3 ? ` +${product.colours.length - 3} more` : ''}
        </div>

        {/* Card Action Buttons */}
        <div className="mt-auto space-y-2 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelect(product)}
              className="btn btn-outline btn-sm w-full text-xs font-semibold"
            >
              <span>{t('view_specs')}</span>
              <ArrowRight size={13} />
            </button>

            <button
              onClick={() => onEnquire(product)}
              className="btn btn-primary btn-sm w-full text-xs font-semibold"
            >
              <span>{t('bulk_enquiry')}</span>
            </button>
          </div>

          <button
            onClick={() => openWhatsApp(product, product.moq || 100)}
            className="btn btn-whatsapp btn-sm w-full text-xs font-semibold py-1.5"
          >
            <MessageSquare size={14} />
            <span>{t('whatsapp_quote')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
