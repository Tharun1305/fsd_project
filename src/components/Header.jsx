import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Phone, Globe, Menu, X, QrCode, MessageSquare, ShieldCheck, ChevronDown, Headphones, Heart } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { openWhatsApp } from '../utils/whatsapp';

export function Header({ onOpenQR, currentView, navigate }) {
  const { lang, setLang, t, searchQuery, setSearchQuery, categories } = useData();
  const { isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState('All Categories');
  const [announcementIdx, setAnnouncementIdx] = useState(0);

  const announcements = [
    t('announcement_1'),
    t('announcement_2'),
    t('announcement_3'),
  ];

  useEffect(() => {
    const t = setInterval(() => setAnnouncementIdx(i => (i + 1) % announcements.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate('products');
  };

  const navItems = [
    { key: 'home', label: t('home') },
    { key: 'products', label: t('products') },
    { key: 'categories', label: t('categories') },
    { key: 'new_arrivals', label: t('new_arrivals') },
    { key: 'latest', label: t('latest') },
    { key: 'offers', label: t('offers') },
    { key: 'digital_catalogue', label: t('digital_catalogue') },
    { key: 'bulk_enquiry', label: t('bulk_enquiry') },
    { key: 'about', label: t('about') },
    { key: 'contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* ── Announcement Bar ── */}
      <div style={{ backgroundColor: '#1a1a2e' }} className="text-white text-xs py-2 overflow-hidden">
        <div className="container flex justify-between items-center gap-2">
          <div className="flex-1 overflow-hidden">
            <span
              key={announcementIdx}
              className="block animate-fade-in font-medium text-center tracking-wide"
              style={{ color: '#e8d5b7' }}
            >
              {announcements[announcementIdx]}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0 pl-4 border-l border-white/20">
            <div className="flex items-center gap-1.5">
              <Globe size={12} className="text-blue-300" />
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="bg-transparent text-white border-none text-xs focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="hi" className="bg-slate-900">हिन्दी</option>
                <option value="ta" className="bg-slate-900">தமிழ்</option>
                <option value="ml" className="bg-slate-900">മലയാളം</option>
                <option value="kn" className="bg-slate-900">ಕನ್ನಡ</option>
              </select>
            </div>
            <button onClick={onOpenQR} className="flex items-center gap-1 text-amber-300 hover:text-amber-200">
              <QrCode size={12} />
              <span>Catalog QR</span>
            </button>
            {isAuthenticated ? (
              <>
                <button onClick={() => navigate('admin_dashboard')} className="hover:text-blue-300">Admin</button>
                <button onClick={logout} className="text-rose-300 hover:underline">Logout</button>
              </>
            ) : (
              <button onClick={() => navigate('admin_login')} className="hover:text-blue-300">Admin</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container py-4 flex items-center gap-6">
          {/* Logo */}
          <div
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2563eb 100%)' }}
            >
              GV
            </div>
            <div>
              <div className="font-black text-lg tracking-tight text-gray-900 leading-none">G V Clothings</div>
              <div className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">Fabric · Tiruppur</div>
            </div>
          </div>

          {/* Search Bar with Category Dropdown */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl mx-auto">
            <div className="flex w-full border-2 border-gray-900 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">
              {/* Category dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCatDropOpen(!catDropOpen)}
                  className="flex items-center gap-1 px-3 py-2.5 bg-gray-100 text-gray-700 text-xs font-semibold border-r border-gray-300 hover:bg-gray-200 whitespace-nowrap transition-colors"
                  style={{ minWidth: 120 }}
                >
                  <span className="truncate max-w-[80px]">{selectedCat === 'All Categories' ? t('all_categories') : selectedCat}</span>
                  <ChevronDown size={12} />
                </button>
                {catDropOpen && (
                  <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1">
                    <button
                      onClick={() => { setSelectedCat(t('all_categories')); setCatDropOpen(false); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-blue-50 font-semibold text-gray-700"
                    >
                      {t('all_categories')}
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.category_id}
                        onClick={() => { setSelectedCat(cat.category_name); setCatDropOpen(false); navigate('products', { category: cat.category_id }); }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-blue-50 text-gray-600"
                      >
                        {cat.category_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none placeholder-gray-400"
              />
              <button
                type="submit"
                className="px-5 py-2.5 text-white text-sm font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                style={{ background: '#1a1a2e' }}
              >
                <Search size={16} />
                <span className="hidden sm:inline">{t('search_btn')}</span>
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="hidden lg:flex items-center gap-5 shrink-0">
            <button
              onClick={() => openWhatsApp(null, 500)}
              className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <Headphones size={22} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('support')}</span>
            </button>
            <button
              onClick={() => navigate('bulk_enquiry')}
              className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-medium">{t('enquiry')}</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 ml-auto"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Horizontal Nav Menu ── */}
      <nav className="hidden lg:block bg-white border-b border-gray-100">
        <div className="container">
          <div className="flex items-center">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  currentView === item.key
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
                {currentView === item.key && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck size={13} />
              <span>{t('quality_guarantee')}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 shadow-lg animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
            />
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          </form>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => { navigate(item.key); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2.5 text-sm rounded-lg font-medium transition-colors ${
                  currentView === item.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button onClick={() => { navigate('bulk_enquiry'); setMobileMenuOpen(false); }} className="btn btn-primary flex-1 text-sm">
              {t('bulk_enquiry')}
            </button>
            <button onClick={() => openWhatsApp(null, 500)} className="btn btn-whatsapp flex-1 text-sm">
              <MessageSquare size={15} /><span>{t('whatsapp_us')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
