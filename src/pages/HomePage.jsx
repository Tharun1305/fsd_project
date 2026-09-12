import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MessageSquare, ShieldCheck, Factory, Truck, Sparkles, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import { useData } from '../context/DataContext';
import { ProductCard } from '../components/ProductCard';
import { openWhatsApp } from '../utils/whatsapp';

/* ─── Hero Slides ─── */
const heroSlides = [
  {
    image: '/images/products/fabric_printed.jpg',
    tag: 'New Collection',
    headline: 'Fine Printed\nCotton Fabrics',
    sub: 'Vibrant reactive prints · 180 GSM · Wholesale from ₹320/Kg',
    cta: 'products',
    ctaLabel: 'Shop Printed Fabrics',
    accent: '#e8a87c',
  },
  {
    image: '/images/products/fabric_plain.jpg',
    tag: 'Best Seller',
    headline: 'Plain & Single\nJersey Fabrics',
    sub: 'Solid dyed · 160–220 GSM · Bulk supply from Tiruppur',
    cta: 'products',
    ctaLabel: 'View Plain Fabrics',
    accent: '#7ec8e3',
  },
  {
    image: '/images/products/fabric_biowash.jpg',
    tag: 'Premium Quality',
    headline: 'Bio-Washed\nCotton Fabrics',
    sub: 'Ultra-soft enzyme finish · Zero lint · Ready-to-cut quality',
    cta: 'bulk_enquiry',
    ctaLabel: 'Request Wholesale Quote',
    accent: '#a8d8a8',
  },
];

/* ─── Category images mapping ─── */
const CAT_IMAGES = {
  'Fine Printed':   '/images/products/fabric_printed.jpg',
  'Plain / Normal': '/images/products/fabric_plain.jpg',
  'Loop Knit':      '/images/products/fabric_loopknit.jpg',
  'Interlock':      '/images/products/fabric_interlock.jpg',
  'Terry':          '/images/products/fabric_terry.jpg',
  'Thread':         '/images/products/fabric_thread.jpg',
  'Yarn':           '/images/products/fabric_yarn.jpg',
  'Bio-Wash':       '/images/products/fabric_biowash.jpg',
};

export function HomePage({ navigate, onSelectProduct, onEnquireProduct }) {
  const { products, categories, t } = useData();
  const [slide, setSlide] = useState(0);
  const timerRef = useRef(null);

  const latestProducts = [...products]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4);

  const newArrivals = products.filter(p => p.is_new_arrival).length
    ? products.filter(p => p.is_new_arrival).slice(0, 4)
    : latestProducts;

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 5000);
  };

  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const goSlide = (i) => { setSlide(i); startTimer(); };
  const prevSlide = () => goSlide((slide - 1 + heroSlides.length) % heroSlides.length);
  const nextSlide = () => goSlide((slide + 1) % heroSlides.length);

  const cur = heroSlides[slide];

  return (
    <div className="homepage-wrapper">

      {/* ════════════════════════════════════
          HERO SLIDER  (full-width, no padding)
          ════════════════════════════════════ */}
      <section className="hero-slider relative overflow-hidden" style={{ height: 'clamp(420px, 58vw, 680px)' }}>
        {/* Slides */}
        {heroSlides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === slide ? 1 : 0, zIndex: i === slide ? 1 : 0 }}
          >
            <img
              src={s.image}
              alt={s.headline}
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(0.55)' }}
            />
          </div>
        ))}

        {/* Text overlay – right-aligned */}
        <div className="absolute inset-0 z-10 flex items-center justify-end">
          <div className="text-right px-8 md:px-16 lg:px-24 max-w-xl ml-auto">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: cur.accent, color: '#1a1a2e' }}
            >
              {cur.tag}
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
              style={{ fontFamily: "'Outfit', sans-serif", whiteSpace: 'pre-line' }}
            >
              {cur.headline}
            </h1>
            <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed">
              {cur.sub}
            </p>
            <div className="flex gap-3 justify-end flex-wrap">
              <button
                onClick={() => navigate(cur.cta)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-900 hover:scale-105 transition-transform shadow-xl"
                style={{ backgroundColor: cur.accent }}
              >
                {cur.ctaLabel} <ArrowRight size={16} />
              </button>
              <button
                onClick={() => openWhatsApp(null, 500)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white/15 backdrop-blur-sm text-white border border-white/30 hover:bg-white/25 transition-colors"
              >
                <MessageSquare size={16} /> {t('whatsapp_us')}
              </button>
            </div>
          </div>
        </div>

        {/* Arrow Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/40 transition-colors"
        >
          <ChevronRight size={20} />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => goSlide(i)}
              className="rounded-full transition-all duration-300"
              style={{
                height: 8,
                width: i === slide ? 28 : 8,
                backgroundColor: i === slide ? cur.accent : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          TRUST STRIP
          ════════════════════════════════════ */}
      <section className="bg-gray-900 text-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { icon: '🏭', label: 'Direct Factory Price', sub: 'No Middleman Commission' },
              { icon: '🧵', label: 'Bio-Wash Premium Quality', sub: '100% Combed Cotton' },
              { icon: '🚚', label: 'Daily Shipping', sub: 'Kerala · Karnataka · TN' },
              { icon: '📦', label: 'Low MOQ', sub: 'Starts from 150 Kg' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{item.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FABRIC CATEGORIES  (image cards)
          ════════════════════════════════════ */}
      <section className="container py-14">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-1">Product Catalogues</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Our Fabric Categories</h2>
          </div>
          <button
            onClick={() => navigate('categories')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            {t('view_all_categories')} <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div
              key={cat.category_id}
              onClick={() => navigate('products', { category: cat.category_id })}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-400 hover:shadow-xl transition-all duration-300"
            >
              {/* Category image */}
              <div className="relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
                <img
                  src={CAT_IMAGES[cat.category_name] || '/images/products/fabric_plain.jpg'}
                  alt={cat.category_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-bold text-white text-sm leading-tight">{cat.category_name}</h3>
                </div>
              </div>
              {/* Browse link */}
              <div className="bg-white px-3 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-500 line-clamp-1">{cat.description?.split('.')[0]}</span>
                <ChevronRight size={14} className="text-blue-500 shrink-0 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          LATEST FABRIC PRODUCTS
          ════════════════════════════════════ */}
      <section className="bg-gray-50 py-14">
        <div className="container">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">Fresh From Factory</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Latest Fabric Arrivals</h2>
            </div>
            <button onClick={() => navigate('products')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              {t('view_all')} <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestProducts.map(product => (
              <ProductCard
                key={product.product_id}
                product={product}
                onSelect={onSelectProduct}
                onEnquire={onEnquireProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          BANNER – Bulk Enquiry CTA
          ════════════════════════════════════ */}
      <section className="container py-10">
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #1a1a2e 100%)' }}
        >
          {/* Background fabric texture overlay */}
          <div className="absolute inset-0 opacity-20">
            <img src="/images/products/fabric_loopknit.jpg" className="w-full h-full object-cover" alt="" />
          </div>
          <div className="relative z-10 px-8 md:px-16 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-white space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Tiruppur Direct</span>
              <h2 className="text-3xl md:text-4xl font-black leading-tight">
                Planning a Bulk Fabric Order?
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Submit your requirements, get wholesale quotes, and receive free fabric swatch kits — all before your Tiruppur visit.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
              <button
                onClick={() => navigate('bulk_enquiry')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-gray-900 hover:scale-105 transition-transform shadow-xl text-sm"
                style={{ backgroundColor: '#e8d5b7' }}
              >
                {t('send_enquiry')} <ArrowRight size={16} />
              </button>
              <button
                onClick={() => openWhatsApp(null, 500)}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors text-sm"
              >
                <MessageSquare size={16} /> {t('whatsapp_us')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          WHY CHOOSE US
          ════════════════════════════════════ */}
      <section className="container py-10 pb-14">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">Tiruppur Manufacturing Advantage</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Why Wholesale Buyers Choose Us</h2>
          <p className="text-gray-500 text-sm mt-2">Streamline your bulk fabric sourcing with direct factory pricing and reliable dispatch.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Factory size={26} />,
              color: '#2563eb',
              bg: '#eff6ff',
              title: 'Direct B2B Manufacturer',
              desc: 'No middleman costs. Buy directly from our Tiruppur knitting, dyeing, and bio-wash processing units at true wholesale prices.',
            },
            {
              icon: <ShieldCheck size={26} />,
              color: '#059669',
              bg: '#f0fdf4',
              title: 'Tested Bio-Wash Quality',
              desc: 'Super-combed 100% cotton with enzyme bio-wash, zero-lint finish, and colour fastness certified for premium retail standards.',
            },
            {
              icon: <Truck size={26} />,
              color: '#d97706',
              bg: '#fffbeb',
              title: 'Fast Regional Dispatch',
              desc: 'Overnight transport to Kerala (Kochi, Calicut), Bangalore (Chickpet, Commercial St), and all Tamil Nadu towns.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════ */}
      <section className="bg-gray-50 py-14">
        <div className="container">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">Simple Process</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { n: '01', title: 'Browse Fabrics', desc: 'Explore our digital fabric catalogue' },
              { n: '02', title: 'Check Specs', desc: 'GSM, width, MOQ & price tiers' },
              { n: '03', title: 'Send Enquiry', desc: 'Submit your bulk requirement form' },
              { n: '04', title: 'WhatsApp Consult', desc: 'Speak with our sales coordinator' },
              { n: '05', title: 'Visit Showroom', desc: 'Check samples at T N K Nagar' },
              { n: '06', title: 'Finalize Order', desc: 'Complete bulk purchase & dispatch' },
            ].map(s => (
              <div key={s.n} className="bg-white rounded-2xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
                <div
                  className="w-9 h-9 rounded-full text-white font-black text-sm flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e, #2563eb)' }}
                >
                  {s.n}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h4>
                <p className="text-[11px] text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          REGIONS SERVED
          ════════════════════════════════════ */}
      <section className="container py-14">
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%)' }}
        >
          <div className="px-8 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 text-white space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <MapPin size={14} />
                <span>Dedicated Logistics Network</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold">Serving Wholesale Buyers<br />Across South India</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Regular bulk fabric supply to buyers from <strong className="text-white">Tamil Nadu</strong>, <strong className="text-white">Kerala</strong> (Ernakulam, Kozhikode, Trivandrum), <strong className="text-white">Bangalore</strong> (Chickpet & Commercial St), <strong className="text-white">Telangana</strong> & <strong className="text-white">Andhra Pradesh</strong>.
              </p>
            </div>
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-5 space-y-3 text-sm text-white">
              {[
                { icon: '🌴', label: 'Kerala Buyers', detail: 'Daily Lorry via Walayar / Palakkad' },
                { icon: '🏬', label: 'Bangalore Buyers', detail: 'Overnight Cargo via Hosur NH44' },
                { icon: '🏢', label: 'Tamil Nadu Outlets', detail: 'Same-Day Parcel Delivery' },
              ].map((r, i) => (
                <div key={i} className={`flex justify-between items-center text-xs ${i < 2 ? 'pb-3 border-b border-white/15' : ''}`}>
                  <span className="font-bold flex items-center gap-1.5"><span>{r.icon}</span>{r.label}</span>
                  <span className="text-gray-300">{r.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
