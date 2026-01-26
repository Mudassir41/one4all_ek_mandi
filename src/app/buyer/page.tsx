'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function BuyerDashboard() {
  const [selectedLang, setSelectedLang] = useState('en');

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  ];

  // Mock bids placed by buyer
  const myBids = [
    {
      id: '1',
      productName: 'Organic Tomatoes',
      sellerName: 'Ravi Kumar',
      amount: 48,
      unit: 'kg',
      message: 'मुझे 50 किलो चाहिए',
      status: 'accepted',
      timestamp: '10 minutes ago'
    },
    {
      id: '2',
      productName: 'Basmati Rice',
      sellerName: 'Gurpreet Singh',
      amount: 90,
      unit: 'kg',
      message: 'Quality rice needed for restaurant',
      status: 'pending',
      timestamp: '30 minutes ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {selectedLang === 'hi' ? 'खरीदार डैशबोर्ड' : 
                 selectedLang === 'ta' ? 'வாங்குபவர் டாஷ்போர்டு' : 
                 'Buyer Dashboard'}
              </h1>
              <p className="text-blue-100 text-sm">Track your bids and orders</p>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="hover:text-blue-200 transition font-medium">
                {selectedLang === 'hi' ? 'होम' : selectedLang === 'ta' ? 'முகப்பு' : 'Home'}
              </Link>
              <Link href="/seller" className="hover:text-blue-200 transition font-medium">
                {selectedLang === 'hi' ? 'विक्रेता' : selectedLang === 'ta' ? 'விற்பனையாளர்கள்' : 'Sellers'}
              </Link>
              <Link href="/buyer" className="text-blue-200 font-medium">
                {selectedLang === 'hi' ? 'खरीदार' : selectedLang === 'ta' ? 'வாங்குபவர்கள்' : 'Buyers'}
              </Link>
            </div>

            {/* Language Selector */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-white"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.native}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Buyer Profile */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
              🛒
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Demo Buyer</h2>
              <p className="text-gray-600">📍 Delhi</p>
              <p className="text-gray-600">🏪 Looking for quality produce for restaurant</p>
            </div>
            <div className="ml-auto">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-blue-800 font-semibold">
                  💰 {myBids.length} Active Bids
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* My Bids */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            💰 My Bids — Track Your Offers
          </h3>

          <div className="space-y-4">
            {myBids.map(bid => (
              <div
                key={bid.id}
                className="border rounded-xl p-6 bg-white hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-bold text-lg text-gray-900">
                        {bid.productName}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bid.status)}`}>
                        {getStatusIcon(bid.status)} {bid.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600">
                          <strong>Your Bid:</strong> ₹{bid.amount}/{bid.unit}
                        </p>
                        <p className="text-gray-600">
                          <strong>Seller:</strong> {bid.sellerName}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">
                          <strong>Status:</strong> {bid.status}
                        </p>
                        <p className="text-gray-600 text-sm">{bid.timestamp}</p>
                      </div>

                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Your Message:</strong>
                        </p>
                        <p className="text-gray-900 text-sm">"{bid.message}"</p>
                      </div>
                    </div>

                    {bid.status === 'accepted' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-600">🎉</span>
                          <p className="font-semibold text-green-800">Congratulations! Your bid was accepted!</p>
                        </div>
                        <p className="text-green-700 text-sm mb-3">
                          The seller has accepted your offer of ₹{bid.amount}/{bid.unit}. 
                          You can now proceed with the purchase.
                        </p>
                        <div className="flex gap-2">
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium">
                            💳 Proceed to Payment
                          </button>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                            💬 Contact Seller
                          </button>
                        </div>
                      </div>
                    )}

                    {bid.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-600">⏳</span>
                          <p className="font-semibold text-yellow-800">Waiting for seller response</p>
                        </div>
                        <p className="text-yellow-700 text-sm">
                          Your bid is under review. The seller will respond soon.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Quick Actions</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/"
              className="bg-blue-50 hover:bg-blue-100 p-6 rounded-xl transition text-center block"
            >
              <div className="text-3xl mb-2">🔍</div>
              <h4 className="font-semibold text-blue-900">Browse Products</h4>
              <p className="text-blue-700 text-sm">Find new products to bid on</p>
            </Link>

            <div className="bg-green-50 hover:bg-green-100 p-6 rounded-xl transition text-center cursor-pointer">
              <div className="text-3xl mb-2">🌐</div>
              <h4 className="font-semibold text-green-900">Translation Tool</h4>
              <p className="text-green-700 text-sm">Communicate in any language</p>
            </div>

            <div className="bg-purple-50 hover:bg-purple-100 p-6 rounded-xl transition text-center cursor-pointer">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-purple-900">Price Trends</h4>
              <p className="text-purple-700 text-sm">Track market prices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}