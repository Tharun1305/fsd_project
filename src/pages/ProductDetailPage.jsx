import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, ShieldCheck, CheckCircle2, Share2, PhoneCall, Package, Layers, Sparkles, Truck } from 'lucide-react';
import { openWhatsApp } from '../utils/whatsapp';
import { useData } from '../context/DataContext';
import { ProductCard } from '../components/ProductCard';

export function ProductDetailPage({ product, onBack, navigate, onEnquireProduct }) {
  const { categories, products } = useData();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const categoryName = categories.find(c => String(c.category_id) === String(product.category_id))?.category_name || 'Fabrics';

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'];

  // Similar Products Generator
  const similarProducts = products.filter(p =>
    String(p.product_id) !== String(product.product_id) &&
    (String(p.category_id) === String(product.category_id) || p.fabric === product.fabric)
  ).slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.product_name} (${product.product_code})`,
        text: `Check out ${product.product_name} wholesale details from G V Clothings.`,
        url: window.location.href
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="container py-8 space-y-10 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm"
      >
        <ArrowLeft size={16} />
        <span>Back to Catalogue</span>
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-lg">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
            <img
              src={images[selectedImageIndex]}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-4 left-4 bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1 rounded-md shadow-md">
              CODE: {product.product_code}
            </span>
          </div>

          {/* Thumbnail slider */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Tiruppur Wholesale Assurance */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Direct Tiruppur Factory Assurance</span>
            </div>
            <p>● 100% Bio-Wash Enzyme Finished Fabric</p>
            <p>● Pre-Shrunk & Color Bleed Tested</p>
            <p>● Overnight Dispatch to Tamil Nadu, Kerala & Bangalore</p>
          </div>
        </div>

        {/* Right: Specifications & CTAs */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <span>{categoryName}</span>
              <span>•</span>
              <span>{product.fabric}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
              {product.product_name}
            </h1>

            {/* Price & MOQ Highlight Box */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl mb-6 shadow-md grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-xs font-medium block">Approx Wholesale Price</span>
                <span className="text-xl md:text-2xl font-extrabold text-amber-400">{product.price}</span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-slate-400 text-xs font-medium block">Minimum Order (MOQ)</span>
                <span className="text-xl md:text-2xl font-extrabold text-blue-400">{product.moq} Pcs</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Specification Badges */}
            <div className="space-y-4 border-t border-b border-slate-200 py-4 mb-6 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Fabric Weight (GSM):</span>
                <span className="font-bold text-slate-900">{product.gsm || '180 GSM'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Stock Availability:</span>
                <span className="font-bold text-emerald-600">{product.availability}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Available Sizes:</span>
                <span className="font-bold text-slate-900">{(product.sizes || []).join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-semibold">Available Colours:</span>
                <span className="font-bold text-slate-900">{(product.colours || []).join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onEnquireProduct(product)}
                className="btn btn-primary btn-lg w-full"
              >
                <span>Submit Bulk Enquiry</span>
              </button>

              <button
                onClick={() => openWhatsApp(product, product.moq || 100)}
                className="btn btn-whatsapp btn-lg w-full"
              >
                <MessageSquare size={18} />
                <span>WhatsApp Quote</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => navigate('sample_request', { product })}
                className="btn btn-outline btn-sm text-xs"
              >
                Request Sample
              </button>

              <button
                onClick={() => navigate('callback_request')}
                className="btn btn-outline btn-sm text-xs"
              >
                Request Callback
              </button>

              <button
                onClick={handleShare}
                className="btn btn-outline btn-sm text-xs flex items-center justify-center gap-1"
              >
                <Share2 size={13} />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SIMILAR PRODUCTS */}
      {similarProducts.length > 0 && (
        <section className="space-y-4 pt-6">
          <h3 className="text-xl font-extrabold text-slate-900">Similar Fabric Products</h3>
          <div className="grid-3">
            {similarProducts.map(sim => (
              <ProductCard
                key={sim.product_id}
                product={sim}
                onSelect={(p) => navigate('product_detail', { product: p })}
                onEnquire={onEnquireProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
