import React from 'react';
import { Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ProductCard } from '../components/ProductCard';

export function NewArrivalsPage({ onSelectProduct, onEnquireProduct }) {
  const { products } = useData();

  const newArrivals = products.filter(p => p.is_new_arrival);

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>30-Day Automated Arrival Window</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold">New Arrivals</h1>
          <p className="text-xs text-slate-300 mt-1">
            Newly launched fabric collections fresh from Tiruppur knitting & bio-wash processing units.
          </p>
        </div>
        <div className="hidden sm:block bg-white/10 px-4 py-2 rounded-xl text-center">
          <span className="block text-2xl font-extrabold text-amber-400">{newArrivals.length}</span>
          <span className="text-[10px] text-slate-300">New Items</span>
        </div>
      </div>

      {newArrivals.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 text-slate-500">
          No new arrivals in the last 30 days. Check back soon for new releases!
        </div>
      ) : (
        <div className="grid-4">
          {newArrivals.map(product => (
            <ProductCard
              key={product.product_id}
              product={product}
              onSelect={onSelectProduct}
              onEnquire={onEnquireProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
