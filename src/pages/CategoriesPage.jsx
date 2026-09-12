import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';

export function CategoriesPage({ navigate }) {
  const { categories, products } = useData();

  return (
    <div className="container py-10 space-y-8 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">Explore Catalogue</span>
        <h1 className="text-3xl font-extrabold text-slate-900">Fabric Categories</h1>
        <p className="text-slate-600 text-sm">
          Browse wholesale fabric collections by category crafted for textile buyers and bulk orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const count = products.filter(p => String(p.category_id) === String(cat.category_id)).length;
          return (
            <div
              key={cat.category_id}
              onClick={() => navigate('products', { category: cat.category_id })}
              className="card p-6 cursor-pointer hover:border-blue-500 group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  👕
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                    {cat.category_name}
                  </h3>
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {count} Styles
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>View All Items</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
