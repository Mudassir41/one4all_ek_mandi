'use client';

import Link from 'next/link';
import { useState } from 'react';

export function InteractiveHomepage() {
  const [selectedLang, setSelectedLang] = useState('en');

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
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

  const getTranslatedText = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        title: 'Ek Bharath Ek Mandi',
        subtitle: "India's Voice-First Cross-State Trading Platform",
        home: 'Home',
        sellers: 'Sellers',
        buyers: 'Buyers',
        demoWorking: '🎉 Demo is Working!',
        demoSubtitle: 'Your multilingual trading platform is ready for demonstration',
        sellerDashboard: 'Seller Dashboard',
        sellerDesc: 'View incoming bids and manage products',
        buyerDashboard: 'Buyer Dashboard',
        buyerDesc: 'Track your bids and orders',
        liveMarketplace: '📦 Live Marketplace',
        placeBid: '💰 Place Bid',
        activeBids: 'active bids',
        top: 'Top',
        demoFeatures: '✅ Demo Features',
        multilingualSupport: 'Multilingual Support',
        multilingualDesc: '8 Indian languages with real-time translation',
        liveBidding: 'Live Bidding',
        liveBiddingDesc: 'Real-time bid notifications and management',
        crossStateTrade: 'Cross-State Trade',
        crossStateDesc: 'Connect buyers and sellers across India'
      },
      hi: {
        title: 'एक भारत एक मंडी',
        subtitle: 'भारत का आवाज-प्रथम अंतर-राज्यीय व्यापार मंच',
        home: 'होम',
        sellers: 'विक्रेता',
        buyers: 'खरीदार',
        demoWorking: '🎉 डेमो काम कर रहा है!',
        demoSubtitle: 'आपका बहुभाषी व्यापार मंच प्रदर्शन के लिए तैयार है',
        sellerDashboard: 'विक्रेता डैशबोर्ड',
        sellerDesc: 'आने वाली बोलियां देखें और उत्पादों का प्रबंधन करें',
        buyerDashboard: 'खरीदार डैशबोर्ड',
        buyerDesc: 'अपनी बोलियों और ऑर्डर को ट्रैक करें',
        liveMarketplace: '📦 लाइव मार्केटप्लेस',
        placeBid: '💰 बोली लगाएं',
        activeBids: 'सक्रिय बोलियां',
        top: 'शीर्ष',
        demoFeatures: '✅ डेमो सुविधाएं',
        multilingualSupport: 'बहुभाषी समर्थन',
        multilingualDesc: 'वास्तविक समय अनुवाद के साथ 8 भारतीय भाषाएं',
        liveBidding: 'लाइव बिडिंग',
        liveBiddingDesc: 'वास्तविक समय बोली सूचनाएं और प्रबंधन',
        crossStateTrade: 'अंतर-राज्यीय व्यापार',
        crossStateDesc: 'भारत भर में खरीदारों और विक्रेताओं को जोड़ें'
      },
      ta: {
        title: 'ஏக பாரத் ஏக மண்டி',
        subtitle: 'இந்தியாவின் குரல்-முதல் மாநில-கடந்த வர்த்தக தளம்',
        home: 'முகப்பு',
        sellers: 'விற்பனையாளர்கள்',
        buyers: 'வாங்குபவர்கள்',
        demoWorking: '🎉 டெமோ வேலை செய்கிறது!',
        demoSubtitle: 'உங்கள் பன்மொழி வர்த்தக தளம் காட்சிக்கு தயார்',
        sellerDashboard: 'விற்பனையாளர் டாஷ்போர்டு',
        sellerDesc: 'வரும் ஏலங்களைப் பார்க்கவும் மற்றும் தயாரிப்புகளை நிர்வகிக்கவும்',
        buyerDashboard: 'வாங்குபவர் டாஷ்போர்டு',
        buyerDesc: 'உங்கள் ஏலங்கள் மற்றும் ஆர்டர்களைக் கண்காணிக்கவும்',
        liveMarketplace: '📦 நேரடி சந்தை',
        placeBid: '💰 ஏலம் விடவும்',
        activeBids: 'செயலில் உள்ள ஏலங்கள்',
        top: 'மேல்',
        demoFeatures: '✅ டெமோ அம்சங்கள்',
        multilingualSupport: 'பன்மொழி ஆதரவு',
        multilingualDesc: 'நேரடி மொழிபெயர்ப்புடன் 8 இந்திய மொழிகள்',
        liveBidding: 'நேரடி ஏலம்',
        liveBiddingDesc: 'நேரடி ஏல அறிவிப்புகள் மற்றும் நிர்வாகம்',
        crossStateTrade: 'மாநில-கடந்த வர்த்தகம்',
        crossStateDesc: 'இந்தியா முழுவதும் வாங்குபவர்கள் மற்றும் விற்பனையாளர்களை இணைக்கவும்'
      }
    };
    return translations[selectedLang]?.[key] || translations.en[key] || key;
  };

  const getProductName = (product: any) => {
    switch (selectedLang) {
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
    <div className={`min-h-screen bg-white ${selectedLang === 'ta' ? 'script-tamil' : selectedLang === 'hi' ? 'script-devanagari' : 'script-latin'}`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{getTranslatedText('title')}</h1>
              <p className="text-orange-100 text-sm">{getTranslatedText('subtitle')}</p>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-6">
              <Link href="/" className="hover:text-orange-200 transition font-medium">
                {getTranslatedText('home')}
              </Link>
              <Link href="/seller" className="hover:text-orange-200 transition font-medium">
                {getTranslatedText('sellers')}
              </Link>
              <Link href="/buyer" className="hover:text-orange-200 transition font-medium">
                {getTranslatedText('buyers')}
              </Link>
              
              {/* Language Selector */}
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
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
            {getTranslatedText('demoWorking')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {getTranslatedText('demoSubtitle')}
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link 
              href="/seller"
              className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition text-center block"
            >
              <div className="text-4xl mb-2">👨‍🌾</div>
              <h3 className="text-xl font-bold mb-2">{getTranslatedText('sellerDashboard')}</h3>
              <p className="text-green-100">{getTranslatedText('sellerDesc')}</p>
            </Link>

            <Link 
              href="/buyer"
              className="bg-blue-600 text-white p-6 rounded-xl hover:bg-blue-700 transition text-center block"
            >
              <div className="text-4xl mb-2">🛒</div>
              <h3 className="text-xl font-bold mb-2">{getTranslatedText('buyerDashboard')}</h3>
              <p className="text-blue-100">{getTranslatedText('buyerDesc')}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{getTranslatedText('liveMarketplace')}</h2>

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
                      {selectedLang !== 'en' && (
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
                      <span className="text-gray-600">3 {getTranslatedText('activeBids')}</span>
                      <span className="font-bold text-orange-600">{getTranslatedText('top')}: ₹{product.price + 5}/{product.unit}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handlePlaceBid(product.name)}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                  >
                    {getTranslatedText('placeBid')}
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
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{getTranslatedText('demoFeatures')}</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="font-bold text-gray-900 mb-2">{getTranslatedText('multilingualSupport')}</h3>
              <p className="text-gray-600">{getTranslatedText('multilingualDesc')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold text-gray-900 mb-2">{getTranslatedText('liveBidding')}</h3>
              <p className="text-gray-600">{getTranslatedText('liveBiddingDesc')}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="font-bold text-gray-900 mb-2">{getTranslatedText('crossStateTrade')}</h3>
              <p className="text-gray-600">{getTranslatedText('crossStateDesc')}</p>
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
    </div>
  );
}