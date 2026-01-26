'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SimpleLoginModal } from '@/components/auth/SimpleLoginModal';
import { useState } from 'react';

export function InteractiveHomepage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout } = useAuth();
  const { currentLanguage, setLanguage, t, languages } = useLanguage();

  const products = [
    { 
      id: 1, 
      name: 'Organic Tomatoes', 
      nameHi: 'जैविक टमाटर', 
      nameTa: 'இயற்கை தக்காளி',
      price: 45, 
      unit: 'kg', 
      location: 'Chennai, TN', 
      emoji: '🍅' 
    },
    { 
      id: 2, 
      name: 'Basmati Rice', 
      nameHi: 'बासमती चावल', 
      nameTa: 'பாஸ்மதி அரிசி',
      price: 85, 
      unit: 'kg', 
      location: 'Punjab', 
      emoji: '🌾' 
    },
    { 
      id: 3, 
      name: 'Silk Cocoons', 
      nameHi: 'रेशम कोकून', 
      nameTa: 'பட்டு கூட்டுப்புழு',
      price: 450, 
      unit: 'kg', 
      location: 'Ramanagara, KA', 
      emoji: '🧵' 
    },
    { 
      id: 4, 
      name: 'Fresh Fish', 
      nameHi: 'ताज़ी मछली', 
      nameTa: 'புதிய மீன்',
      price: 280, 
      unit: 'kg', 
      location: 'Kochi, KL', 
      emoji: '🐟' 
    },
    { 
      id: 5, 
      name: 'Handloom Sarees', 
      nameHi: 'हथकरघा साड़ी', 
      nameTa: 'கைத்தறி புடவை',
      price: 2500, 
      unit: 'piece', 
      location: 'Varanasi, UP', 
      emoji: '👗' 
    },
    { 
      id: 6, 
      name: 'Alphonso Mangoes', 
      nameHi: 'अल्फांसो आम', 
      nameTa: 'அல்போன்சோ மாம்பழம்',
      price: 120, 
      unit: 'kg', 
      location: 'Ratnagiri, MH', 
      emoji: '🥭' 
    },
  ];

  const getProductName = (product: any) => {
    switch (currentLanguage) {
      case 'hi':
        return product.nameHi;
      case 'ta':
        return product.nameTa;
      default:
        return product.name;
    }
  };

  const handlePlaceBid = (productName: string) => {
    alert(`Bid placed for ${productName}! Switch to Seller Dashboard to see it.`);
  };

  return (
    <div className={`min-h-screen bg-white ${currentLanguage === 'ta' ? 'font-tamil' : currentLanguage === 'hi' ? 'font-devanagari' : 'font-latin'}`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="text-orange-100 text-sm">{t('subtitle')}</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-orange-200 transition font-medium">
                {t('home')}
              </Link>
              <Link href="/products" className="hover:text-orange-200 transition font-medium">
                {t('products')}
              </Link>
              <Link href="/seller" className="hover:text-orange-200 transition font-medium">
                {t('sellers')}
              </Link>
              
              {/* Auth Section */}
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-orange-100 text-sm">
                    👋 {user.name || user.phone}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="bg-orange-400 text-white px-3 py-1 rounded text-sm hover:bg-orange-500"
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-orange-400 text-white px-4 py-2 rounded-lg hover:bg-orange-500 transition font-medium"
                >
                  {t('login')}
                </button>
              )}
              
              {/* Language Selector */}
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-orange-400 text-white px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-white"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code} className="text-gray-900">
                    {lang.native}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('demoWorking')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('demoSubtitle')}
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link 
              href="/seller"
              className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition text-center block"
            >
              <div className="text-4xl mb-2">👨‍🌾</div>
              <h3 className="text-xl font-bold mb-2">{t('sellerDashboard')}</h3>
              <p className="text-green-100">{t('sellerDesc')}</p>
            </Link>

            <Link 
              href="/buyer"
              className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition text-center block"
            >
              <div className="text-4xl mb-2">🛒</div>
              <h3 className="text-xl font-bold mb-2">{t('buyerDashboard')}</h3>
              <p className="text-blue-100">{t('buyerDesc')}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('liveMarketplace')}</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-40 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <span className="text-5xl">{product.emoji}</span>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{getProductName(product)}</h3>
                      {currentLanguage !== 'en' && (
                        <p className="text-gray-500 text-sm">{product.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">₹{product.price}/{product.unit}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>📍 {product.location}</span>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-2 mb-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">3 {t('activeBids')}</span>
                      <span className="font-bold text-orange-600">{t('top')}: ₹{product.price + 5}/{product.unit}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handlePlaceBid(product.name)}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                  >
                    {t('placeBid')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">✅ Demo Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="font-bold text-gray-900 mb-2">Multilingual Support</h3>
              <p className="text-gray-600">8 Indian languages with real-time translation</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">Live Bidding</h3>
              <p className="text-gray-600">Real-time bid notifications and management</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold text-gray-900 mb-2">Cross-State Trade</h3>
              <p className="text-gray-600">Connect buyers and sellers across India</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl font-bold mb-2">एक भारत एक मंडी</p>
          <p className="text-gray-400 mb-4">Breaking Language Barriers in Trade</p>
          <p className="text-gray-500 text-sm">🏆 AI for Bharat - Republic Day 24-Hour Sprint Challenge</p>
        </div>
      </footer>

      {/* Login Modal */}
      <SimpleLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          // Refresh the page to update user state
          window.location.reload();
        }}
      />
    </div>
  );
}