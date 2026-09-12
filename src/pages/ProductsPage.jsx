import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, SlidersHorizontal, Check, Layers, Tag } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ProductCard } from '../components/ProductCard';

export function ProductsPage({ initialCategory, onSelectProduct, onEnquireProduct }) {
  const { products, categories, searchQuery, setSearchQuery, t } = useData();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [selectedFabric, setSelectedFabric] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract unique fabrics, colors, sizes for filters
  const uniqueFabrics = useMemo(() => {
    const set = new Set();
    products.forEach(p => p.fabric && set.add(p.fabric));
    return Array.from(set);
  }, [products]);

  const uniqueColors = useMemo(() => {
    const set = new Set();
    products.forEach(p => p.colours && p.colours.forEach(c => set.add(c)));
    return Array.from(set);
  }, [products]);

  const uniqueSizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'];

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.product_name.toLowerCase().includes(q);
        const matchesCode = p.product_code.toLowerCase().includes(q);
        const matchesFabric = p.fabric.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesFabric) return false;
      }

      // Category
      if (selectedCategory !== 'all' && String(p.category_id) !== String(selectedCategory)) {
        return false;
      }

      // Fabric
      if (selectedFabric !== 'all' && p.fabric !== selectedFabric) {
        return false;
      }

      // Color
      if (selectedColor !== 'all' && (!p.colours || !p.colours.includes(selectedColor))) {
        return false;
      }

      // Size
      if (selectedSize !== 'all' && (!p.sizes || !p.sizes.includes(selectedSize))) {
        return false;
      }

      // Availability
      if (selectedAvailability !== 'all' && p.availability.toLowerCase() !== selectedAvailability.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedFabric, selectedColor, selectedSize, selectedAvailability]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedFabric('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setSelectedAvailability('all');
    setSearchQuery('');
  };

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">Tiruppur Wholesale Catalogue</span>
          <h1 className="text-2xl md:text-3xl font-extrabold">All Fabric Products</h1>
          <p className="text-xs text-slate-300 mt-1">
            Showing {filteredProducts.length} of {products.length} wholesale catalogued styles
          </p>
        </div>

        {/* Search Bar inside Header */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:border-blue-400"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Filter size={18} className="text-blue-600" />
              <span>Catalogue Filters</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control text-xs"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map(c => (
                <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
              ))}
            </select>
          </div>

          {/* Fabric Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Fabric Type</label>
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              className="form-control text-xs"
            >
              <option value="all">All Fabrics</option>
              {uniqueFabrics.map((fab, idx) => (
                <option key={idx} value={fab}>{fab}</option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Stock Status</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="form-control text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="available">In Stock / Available</option>
              <option value="limited">Limited Stock</option>
              <option value="out of stock">Out of Stock</option>
            </select>
          </div>

          {/* Color Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Colour</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="form-control text-xs"
            >
              <option value="all">All Colours</option>
              {uniqueColors.map((col, idx) => (
                <option key={idx} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="form-control text-xs"
            >
              <option value="all">All Sizes</option>
              {uniqueSizes.map((sz, idx) => (
                <option key={idx} value={sz}>{sz}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="btn btn-outline btn-sm w-full text-xs"
          >
            Clear All Filters
          </button>
        </aside>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden col-span-1 flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="btn btn-secondary btn-sm text-xs"
          >
            <SlidersHorizontal size={14} />
            <span>Filter Catalogue</span>
          </button>

          <span className="text-xs font-semibold text-slate-600">
            {filteredProducts.length} Items Found
          </span>

          <button onClick={handleResetFilters} className="text-xs text-blue-600 font-semibold">
            Reset
          </button>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1 bg-white p-4 rounded-xl border border-slate-300 space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="font-bold text-slate-700">Category</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="form-control text-xs py-1">
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700">Stock</label>
                <select value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)} className="form-control text-xs py-1">
                  <option value="all">All</option>
                  <option value="available">In Stock</option>
                  <option value="limited">Limited</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* MAIN PRODUCT GRID */}
        <main className="lg:col-span-9">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                🔍
              </div>
              <h3 className="font-bold text-slate-900 text-xl">No Fabrics Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No products match your current search query or filter criteria. Try resetting filters or searching with product codes like GVF-101.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onSelect={onSelectProduct}
                  onEnquire={onEnquireProduct}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
