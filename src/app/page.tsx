'use client';

import Link from 'next/link';
import { useState } from 'react';

// Mock product data
const mockProducts = [
  { id: 1, name: 'Organic Tomatoes', nameHi: 'जैविक टमाटर', price: 45, unit: 'kg', location: 'Chennai, TN', seller: 'Ravi Kumar', bids: 3, topBid: 48 },
  { id: 2, name: 'Basmati Rice', nameHi: 'बासमती चावल', price: 85, unit: 'kg', location: 'Punjab', seller: 'Gurpreet Singh', bids: 5, topBid: 90 },
  { id: 3, name: 'Silk Cocoons', nameHi: 'रेशम कोकून', price: 450, unit: 'kg', location: 'Ramanagara, KA', seller: 'Lakshmi Devi', bids: 2, topBid: 470 },
  { id: 4, name: 'Fresh Fish', nameHi: 'ताज़ी मछली', price: 280, unit: 'kg', location: 'Kochi, KL', seller: 'Thomas Mathew', bids: 4, topBid: 300 },
  { id: 5, name: 'Handloom Sarees', nameHi: 'हथकरघा साड़ी', price: 2500, unit: 'piece', location: 'Varanasi, UP', seller: 'Anwar Khan', bids: 1, topBid: 2600 },
];

export default function Home() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTranslator, setShowTranslator] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [fromLang, setFromLang] = useState('hi');
  const [toLang, setToLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  ];

  // Mock translation (in real app, this would call AWS Translate/Bedrock)
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock translations
    const translations: { [key: string]: { [key: string]: string } } = {
      'hi': {
        'en': inputText === 'आज टमाटर का भाव क्या है?' ? 'What is the price of tomatoes today?' :
          inputText === 'मुझे 50 किलो चावल चाहिए' ? 'I need 50 kg rice' :
            `[Translated from Hindi]: ${inputText}`,
      },
      'ta': {
        'en': inputText === 'தக்காளி விலை என்ன?' ? 'What is the tomato price?' :
          `[Translated from Tamil]: ${inputText}`,
      },
      'en': {
        'hi': inputText === 'What is the price?' ? 'कीमत क्या है?' :
          inputText === 'I want to buy rice' ? 'मुझे चावल खरीदना है' :
            `[अनुवादित]: ${inputText}`,
        'ta': `[தமிழில் மொழிபெயர்ப்பு]: ${inputText}`,
      }
    };

    const result = translations[fromLang]?.[toLang] || `[${toLang.toUpperCase()}]: ${inputText}`;
    setTranslatedText(result);
    setIsTranslating(false);
  };

  const filteredProducts = mockProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nameHi.includes(searchQuery) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">एक भारत एक मंडी</h1>
              <p className="text-orange-100 text-sm">Ek Bharath Ek Mandi</p>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4">
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-orange-400 text-white px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-white"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.native}</option>
                ))}
              </select>

              <button
                onClick={() => setShowTranslator(!showTranslator)}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition flex items-center gap-2"
              >
                🌐 Translate
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Translation Panel */}
      {showTranslator && (
        <div className="bg-gray-900 text-white p-6 shadow-inner">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">🌐 Multilingual Bridge — Real-time Translation</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Input */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <select
                    value={fromLang}
                    onChange={(e) => setFromLang(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-1 rounded"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.native}</option>
                    ))}
                  </select>
                  <span className="text-gray-400">→</span>
                  <select
                    value={toLang}
                    onChange={(e) => setToLang(e.target.value)}
                    className="bg-gray-700 text-white px-3 py-1 rounded"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.native}</option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or speak your message..."
                  className="w-full h-32 bg-gray-800 text-white p-4 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                />

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
                  >
                    {isTranslating ? '⏳ Translating...' : '🔄 Translate'}
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition">
                    🎤 Voice
                  </button>
                </div>
              </div>

              {/* Output */}
              <div>
                <p className="text-gray-400 mb-2">Translation:</p>
                <div className="w-full h-32 bg-gray-800 text-white p-4 rounded-lg border border-gray-600 overflow-auto">
                  {translatedText || <span className="text-gray-500">Translation will appear here...</span>}
                </div>

                <div className="flex gap-2 mt-2">
                  <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition">
                    🔊 Listen
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(translatedText)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-3 rounded-lg transition"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Quick phrases */}
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-2">Quick phrases:</p>
              <div className="flex flex-wrap gap-2">
                {['आज टमाटर का भाव क्या है?', 'मुझे 50 किलो चावल चाहिए', 'What is the price?', 'I want to buy rice'].map(phrase => (
                  <button
                    key={phrase}
                    onClick={() => setInputText(phrase)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm transition"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            India's Voice-First Cross-State Trading Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Breaking language barriers in trade through AI-powered translation
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, locations... (खोजें...)"
                className="flex-1 px-6 py-4 rounded-full border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-lg"
              />
              <button className="bg-orange-500 text-white px-8 py-4 rounded-full font-medium hover:bg-orange-600 transition">
                🔍 Search
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-8 max-w-2xl mx-auto">
            {[
              { label: 'Languages', value: '8+', icon: '🌐' },
              { label: 'States', value: '28', icon: '🗺️' },
              { label: 'Products', value: '1000+', icon: '🛒' },
              { label: 'Vendors', value: '5000+', icon: '👨‍🌾' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl shadow p-4">
                <div className="text-2xl">{stat.icon}</div>
                <div className="text-2xl font-bold text-orange-600">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">📦 Live Marketplace</h2>
            <div className="flex gap-2">
              <Link href="/vendor" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                👨‍🌾 Vendor Dashboard
              </Link>
              <Link href="/buyer" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                🛒 Buyer Dashboard
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                {/* Product Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <span className="text-6xl">
                    {product.name.includes('Tomato') ? '🍅' :
                      product.name.includes('Rice') ? '🌾' :
                        product.name.includes('Silk') ? '🧵' :
                          product.name.includes('Fish') ? '🐟' :
                            product.name.includes('Saree') ? '👗' : '📦'}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      <p className="text-gray-500 text-sm">{product.nameHi}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">₹{product.price}/{product.unit}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span>📍 {product.location}</span>
                    <span>•</span>
                    <span>👤 {product.seller}</span>
                  </div>

                  {/* Bids */}
                  <div className="bg-orange-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{product.bids} active bids</span>
                      <span className="font-bold text-orange-600">Top: ₹{product.topBid}/{product.unit}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium">
                      💰 Place Bid
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                      💬
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🎤', title: 'Speak Your Language', desc: 'Use voice or text in any of 8 Indian languages' },
              { icon: '🔄', title: 'AI Translates', desc: 'Real-time translation bridges the gap between buyer and seller' },
              { icon: '🤝', title: 'Trade Seamlessly', desc: 'Negotiate, bid, and close deals across state borders' },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl font-bold mb-2">एक भारत एक मंडी</p>
          <p className="text-gray-400 mb-4">Breaking Language Barriers in Trade</p>
          <p className="text-gray-500 text-sm">
            🏆 AI for Bharat - Republic Day 24-Hour Sprint Challenge
          </p>
        </div>
      </footer>
    </div>
  );
}
