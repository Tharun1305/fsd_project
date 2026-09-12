import React from 'react';
import { useData } from '../context/DataContext';
import { ProductCard } from '../components/ProductCard';

export function LatestCollectionsPage({ onSelectProduct, onEnquireProduct }) {
  const { products } = useData();

  // Sorted by creation date descending
  const sorted = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">Automated Collection</span>
        <h1 className="text-2xl md:text-3xl font-extrabold">Latest Collections</h1>
        <p className="text-xs text-slate-300 mt-1">
          Recently added fabric products automatically sorted by production date.
        </p>
      </div>

      <div className="grid-4">
        {sorted.map(product => (
          <ProductCard
            key={product.product_id}
            product={product}
            onSelect={onSelectProduct}
            onEnquire={onEnquireProduct}
          />
        ))}
      </div>
    </div>
  );
}
