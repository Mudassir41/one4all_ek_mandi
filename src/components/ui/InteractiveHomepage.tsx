'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBidding } from '@/contexts/BiddingContext';
import { SimpleLoginModal } from '@/components/auth/SimpleLoginModal';
import { useState } from 'react';

const categories = [
  { id: 'all', name: 'All', nameHi: 'सभी', nameTa: 'அனைத்தும்', emoji: '🏪' },
  { id: 'vegetables', name: 'Vegetables', nameHi: 'सब्जियां', nameTa: 'காய்கறிகள்', emoji: '🥬' },
  { id: 'grains', name: 'Grains', nameHi: 'अनाज', nameTa: 'தானியங்கள்', emoji: '🌾' },
  { id: 'fruits', name: 'Fruits', nameHi: 'फल', nameTa: 'பழங்கள்', emoji: '🍎' },
  { id: 'textiles', name: 'Textiles', nameHi: 'वस्त्र', nameTa: 'ஜவுளி', emoji: '🧵' },
  { id: 'spices', name: 'Spices', nameHi: 'मसाले', nameTa: 'மசாலாப்பொருட்கள்', emoji: '🌶️' },
  { id: 'dairy', name: 'Dairy', nameHi: 'डेयरी', nameTa: 'பால் பொருட்கள்', emoji: '🥛' },
];

const products = [
  {
    id: 1,
    name: 'Organic Tomatoes',
    nameHi: 'जैविक टमाटर',
    nameTa: 'இயற்கை தக்காளி',
    price: 45,
    unit: 'kg',
    location: 'Chennai, TN',
    seller: 'Ravi Kumar',
    rating: 4.8,
    bidsCount: 3,
    category: 'vegetables',
    emoji: '🍅',
    gradient: 'from-red-400 to-orange-500'
  },
  {
    id: 2,
    name: 'Basmati Rice',
    nameHi: 'बासमती चावल',
    nameTa: 'பாஸ்மதி அரிசி',
    price: 85,
    unit: 'kg',
    location: 'Punjab',
    seller: 'Gurpreet Singh',
    rating: 4.9,
    bidsCount: 7,
    category: 'grains',
    emoji: '🌾',
    gradient: 'from-amber-400 to-yellow-500'
  },
  {
    id: 3,
    name: 'Silk Cocoons',
    nameHi: 'रेशम कोकून',
    nameTa: 'பட்டு கூட்டுப்புழு',
    price: 450,
    unit: 'kg',
    location: 'Ramanagara, KA',
    seller: 'Lakshmi Devi',
    rating: 4.7,
    bidsCount: 2,
    category: 'textiles',
    emoji: '🧵',
    gradient: 'from-purple-400 to-pink-500'
  },
  {
    id: 4,
    name: 'Fresh Fish',
    nameHi: 'ताज़ी मछली',
    nameTa: 'புதிய மீன்',
    price: 280,
    unit: 'kg',
    location: 'Kochi, KL',
    seller: 'Thomas Varghese',
    rating: 4.6,
    bidsCount: 5,
    category: 'dairy',
    emoji: '🐟',
    gradient: 'from-blue-400 to-cyan-500'
  },
  {
    id: 5,
    name: 'Alphonso Mangoes',
    nameHi: 'अल्फांसो आम',
    nameTa: 'அல்போன்சோ மாம்பழம்',
    price: 350,
    unit: 'dozen',
    location: 'Ratnagiri, MH',
    seller: 'Santosh Patil',
    rating: 4.9,
    bidsCount: 12,
    category: 'fruits',
    emoji: '🥭',
    gradient: 'from-yellow-400 to-orange-500'
  },
  {
    id: 6,
    name: 'Red Chillies',
    nameHi: 'लाल मिर्च',
    nameTa: 'சிவப்பு மிளகாய்',
    price: 180,
    unit: 'kg',
    location: 'Guntur, AP',
    seller: 'Venkatesh Reddy',
    rating: 4.5,
    bidsCount: 4,
    category: 'spices',
    emoji: '🌶️',
    gradient: 'from-red-500 to-red-700'
  },
];

export function InteractiveHomepage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notification, setNotification] = useState<string | null>(null);

  const { user, logout } = useAuth();
  const { currentLanguage, setLanguage, t, languages } = useLanguage();
  const { addBid } = useBidding();

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const getLocalizedName = (item: any) => {
    if (currentLanguage === 'hi') return item.nameHi;
    if (currentLanguage === 'ta') return item.nameTa;
    return item.name;
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePlaceBid = (product: any) => {
    setSelectedProduct(product);
    setBidAmount((product.price + 5).toString());
    setBidMessage('');
    setShowBidModal(true);
  };

  const submitBid = () => {
    if (!selectedProduct || !bidAmount) return;

    addBid({
      productId: selectedProduct.id.toString(),
      productName: selectedProduct.name,
      buyerId: user?.id || 'demo-buyer-001',
      buyerName: user?.name || 'Demo Buyer',
      buyerLocation: 'Delhi',
      sellerId: 'seller-001',
      sellerName: selectedProduct.seller,
      amount: parseInt(bidAmount),
      quantity: 10,
      unit: selectedProduct.unit,
      message: bidMessage || (currentLanguage === 'hi' ? 'मुझे यह उत्पाद चाहिए' : currentLanguage === 'ta' ? 'எனக்கு இந்த பொருள் வேண்டும்' : 'I would like to buy this product'),
      messageTranslated: 'I would like to buy this product',
      status: 'pending',
    });

    setShowBidModal(false);
    showNotification(`✅ Bid placed for ${selectedProduct.name}! Check Seller Dashboard.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2">
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl">
                🏪
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">{t('subtitle')}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-orange-600 font-semibold">{t('home')}</Link>
              <Link href="/products" className="text-gray-600 hover:text-orange-600 transition">{t('products')}</Link>
              <Link href="/search" className="text-gray-600 hover:text-orange-600 transition">Search</Link>
              <Link href="/orders" className="text-gray-600 hover:text-orange-600 transition">Orders</Link>
              <Link href="/profile" className="text-gray-600 hover:text-orange-600 transition">Profile</Link>
              <Link href="/seller" className="text-gray-600 hover:text-green-600 transition">{t('sellers')}</Link>
              <Link href="/buyer" className="text-gray-600 hover:text-blue-600 transition">{t('buyers')}</Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Language */}
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white border-2 border-orange-200 text-gray-900 px-4 py-2 rounded-xl font-medium focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.native}</option>
                ))}
              </select>

              {/* Auth */}
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 hidden sm:block">👋 {user.name || user.phone}</span>
                  <button
                    onClick={() => logout()}
                    className="text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-green-500/10 -z-10"></div>
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            🏆 AI for Bharat Hackathon
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {currentLanguage === 'hi' ? 'भाषा की बाधा तोड़ें' :
              currentLanguage === 'ta' ? 'மொழித் தடைகளை உடைக்கவும்' :
                'Break Language Barriers'}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {currentLanguage === 'hi' ? 'भारत भर में खरीदारों और विक्रेताओं को जोड़ने वाला मंच' :
              currentLanguage === 'ta' ? 'இந்தியா முழுவதும் வாங்குபவர்களையும் விற்பனையாளர்களையும் இணைக்கும்' :
                'Connect buyers and sellers across India with real-time translation'}
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/seller"
              className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
            >
              <span className="text-2xl group-hover:scale-110 transition">👨‍🌾</span>
              <div className="text-left">
                <div className="font-bold">{t('sellerDashboard')}</div>
                <div className="text-sm opacity-80">{t('sellerDesc')}</div>
              </div>
            </Link>

            <Link
              href="/buyer"
              className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all hover:scale-105 flex items-center gap-3"
            >
              <span className="text-2xl group-hover:scale-110 transition">🛒</span>
              <div className="text-left">
                <div className="font-bold">{t('buyerDashboard')}</div>
                <div className="text-sm opacity-80">{t('buyerDesc')}</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Category Chips - Horizontal Scrollable */}
      <section className="py-6 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all ${selectedCategory === cat.id
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="font-medium">{getLocalizedName(cat)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              📦 {t('liveMarketplace')}
            </h2>
            <span className="text-sm text-gray-500">{filteredProducts.length} products</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100"
              >
                {/* Product Image Area */}
                <div className={`h-44 bg-gradient-to-br ${product.gradient} flex items-center justify-center relative`}>
                  <span className="text-7xl group-hover:scale-110 transition-transform">{product.emoji}</span>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.bidsCount > 5 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        🔥 Hot
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    ⭐ {product.rating}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition">
                        {getLocalizedName(product)}
                      </h3>
                      {currentLanguage !== 'en' && (
                        <p className="text-xs text-gray-500">{product.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">₹{product.price}</div>
                      <div className="text-xs text-gray-500">per {product.unit}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">📍 {product.location}</span>
                    <span className="flex items-center gap-1">👤 {product.seller}</span>
                  </div>

                  {/* Bid Info */}
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-3 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">{product.bidsCount} {t('activeBids')}</span>
                      <span className="font-bold text-orange-600">
                        {t('top')}: ₹{product.price + 5}/{product.unit}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handlePlaceBid(product)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] font-semibold flex items-center justify-center gap-2"
                  >
                    💰 {t('placeBid')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">{t('demoFeatures')}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🌐
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">{t('multilingualSupport')}</h3>
              <p className="text-gray-600">{t('multilingualDesc')}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                💰
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">{t('liveBidding')}</h3>
              <p className="text-gray-600">{t('liveBiddingDesc')}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-lg text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                🤝
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">{t('crossStateTrade')}</h3>
              <p className="text-gray-600">{t('crossStateDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-3xl font-bold mb-2">एक भारत एक मंडी</div>
          <p className="text-gray-400 mb-4">Breaking Language Barriers in Trade</p>
          <div className="flex justify-center gap-6 mb-6">
            <Link href="/seller" className="text-green-400 hover:underline">Seller Dashboard</Link>
            <Link href="/buyer" className="text-blue-400 hover:underline">Buyer Dashboard</Link>
          </div>
          <p className="text-gray-500 text-sm">🏆 AI for Bharat - Republic Day 24-Hour Sprint Challenge</p>
        </div>
      </footer>

      {/* Bid Modal */}
      {showBidModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-scale-in overflow-hidden">
            {/* Modal Header */}
            <div className={`h-24 bg-gradient-to-r ${selectedProduct.gradient} flex items-center justify-between px-6`}>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{selectedProduct.emoji}</span>
                <div className="text-white">
                  <h3 className="font-bold text-xl">{selectedProduct.name}</h3>
                  <p className="text-white/80 text-sm">by {selectedProduct.seller}</p>
                </div>
              </div>
              <button
                onClick={() => setShowBidModal(false)}
                className="text-white/80 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Current Price</span>
                  <span className="text-2xl font-bold text-green-600">₹{selectedProduct.price}/{selectedProduct.unit}</span>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Your Bid Amount (₹/{selectedProduct.unit})</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xl font-bold"
                  placeholder="Enter your bid"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none resize-none"
                  rows={2}
                  placeholder={currentLanguage === 'hi' ? 'अपना संदेश लिखें...' : currentLanguage === 'ta' ? 'உங்கள் செய்தியை எழுதுங்கள்...' : 'Type your message...'}
                />
              </div>

              <button
                onClick={submitBid}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl hover:shadow-lg transition font-bold text-lg flex items-center justify-center gap-2"
              >
                🚀 Submit Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <SimpleLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          window.location.reload();
        }}
      />

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}