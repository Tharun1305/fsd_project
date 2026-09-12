import React, { useState } from 'react';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { QRCodeModal } from './components/QRCodeModal';
import { Chatbot } from './components/Chatbot';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { LatestCollectionsPage } from './pages/LatestCollectionsPage';
import { NewArrivalsPage } from './pages/NewArrivalsPage';
import { OffersPage } from './pages/OffersPage';
import { DigitalCataloguePage } from './pages/DigitalCataloguePage';
import { BulkEnquiryPage } from './pages/BulkEnquiryPage';
import { SampleRequestPage } from './pages/SampleRequestPage';
import { CallbackRequestPage } from './pages/CallbackRequestPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const navigate = (view, params = {}) => {
    if (params.product) setSelectedProduct(params.product);
    if (params.category) setSelectedCategory(params.category);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView('product_detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnquireProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView('bulk_enquiry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      <Header
        onOpenQR={() => setQrModalOpen(true)}
        currentView={currentView}
        navigate={navigate}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            navigate={navigate}
            onSelectProduct={handleSelectProduct}
            onEnquireProduct={handleEnquireProduct}
          />
        )}
        {currentView === 'about' && <AboutPage navigate={navigate} />}
        {currentView === 'products' && (
          <ProductsPage
            initialCategory={selectedCategory}
            onSelectProduct={handleSelectProduct}
            onEnquireProduct={handleEnquireProduct}
          />
        )}
        {currentView === 'product_detail' && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => setCurrentView('products')}
            navigate={navigate}
            onEnquireProduct={handleEnquireProduct}
          />
        )}
        {currentView === 'categories' && <CategoriesPage navigate={navigate} />}
        {currentView === 'latest' && (
          <LatestCollectionsPage
            onSelectProduct={handleSelectProduct}
            onEnquireProduct={handleEnquireProduct}
          />
        )}
        {currentView === 'new_arrivals' && (
          <NewArrivalsPage
            onSelectProduct={handleSelectProduct}
            onEnquireProduct={handleEnquireProduct}
          />
        )}
        {currentView === 'offers' && <OffersPage navigate={navigate} />}
        {currentView === 'digital_catalogue' && (
          <DigitalCataloguePage
            navigate={navigate}
            onOpenQR={() => setQrModalOpen(true)}
            onEnquireProduct={handleEnquireProduct}
          />
        )}
        {currentView === 'bulk_enquiry' && (
          <BulkEnquiryPage selectedProduct={selectedProduct} />
        )}
        {currentView === 'sample_request' && (
          <SampleRequestPage selectedProduct={selectedProduct} />
        )}
        {currentView === 'callback_request' && <CallbackRequestPage />}
        {currentView === 'contact' && <ContactPage navigate={navigate} />}
        {currentView === 'faq' && <FAQPage navigate={navigate} />}
        {currentView === 'admin_login' && <AdminLoginPage navigate={navigate} />}
        {currentView === 'admin_dashboard' && <AdminDashboardPage navigate={navigate} />}
      </main>

      <Footer navigate={navigate} onOpenQR={() => setQrModalOpen(true)} />

      {/* Floating QR Code Modal */}
      <QRCodeModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />

      {/* Floating AI B2B Chatbot */}
      <Chatbot navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
