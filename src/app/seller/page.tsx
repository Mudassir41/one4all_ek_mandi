'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SellerDashboard() {
  const [selectedLang, setSelectedLang] = useState('en');

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  ];

  // Mock incoming bids
  const incomingBids = [
    {
      id: '1',
      productName: 'Organic Tomatoes',
      buyerName: 'Demo Buyer',
      buyerLocation: 'Delhi',
      amount: 48,
      unit: 'kg',
      message: 'मुझे 50 किलो चाहिए',
      messageTranslated: 'I need 50 kg',
      status: 'pending',
      timestamp: '10 minutes ago'
    },
    {
      id: '2',
      productName: 'Basmati Rice',
      buyerName: 'Restaurant Owner',
      buyerLocation: 'Mumbai',
      amount: 90,
      unit: 'kg',
      message: 'Quality rice needed for restaurant',
      status: 'pending',
      timestamp: '30 minutes ago'
    }
  ];

  const handleAcceptBid = (bidId: string) => {
    alert('Bid accepted! The buyer will be notified.');
  };

  const handleRejectBid = (bidId: string) => {
    alert('Bid rejected.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {selectedLang === 'hi' ? 'विक्रेता डैशबोर्ड' : 
                 selectedLang === 'ta' ? 'விற்பனையாளர் டாஷ்போர்டு' : 
                 'Seller Dashboard'}
              </h1>
              <p className="text-green-100 text-sm">Manage your products and bids</p>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="hover:text-green-200 transition font-medium">
                {selectedLang === 'hi' ? 'होम' : selectedLang === 'ta' ? 'முகப்பு' : 'Home'}
              </Link>
              <Link href="/seller" className="text-green-200 font-medium">
                {selectedLang === 'hi' ? 'विक्रेता' : selectedLang === 'ta' ? 'விற்பனையாளர்கள்' : 'Sellers'}
              </Link>
              <Link href="/buyer" className="hover:text-green-200 transition font-medium">
                {selectedLang === 'hi' ? 'खरीदार' : selectedLang === 'ta' ? 'வாங்குபவர்கள்' : 'Buyers'}
              </Link>
            </div>

            {/* Language Selector */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-green-500 text-white px-3 py-2 rounded-lg border-none focus:ring-2 focus:ring-white"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.native}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Seller Profile */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              👨‍🌾
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ravi Kumar</h2>
              <p className="text-gray-600">📍 Chennai, Tamil Nadu</p>
              <p className="text-gray-600">⭐ 4.8 rating • 12 active listings</p>
            </div>
            <div className="ml-auto">
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <p className="text-green-800 font-semibold">
                  🔔 {incomingBids.length} New Bids
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Incoming Bids */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            🔔 Incoming Bids — Real-time Notifications
          </h3>

          <div className="space-y-4">
            {incomingBids.map(bid => (
              <div
                key={bid.id}
                className="border border-orange-200 bg-orange-50 rounded-xl p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg text-gray-900">
                        🔔 New Bid on {bid.productName}
                      </h4>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                        NEW
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-600">
                          <strong>Buyer:</strong> {bid.buyerName} ({bid.buyerLocation})
                        </p>
                        <p className="text-gray-600">
                          <strong>Amount:</strong> ₹{bid.amount}/{bid.unit}
                        </p>
                        <p className="text-gray-600 text-sm">{bid.timestamp}</p>
                      </div>

                      <div className="bg-gray-100 p-4 rounded-lg border">
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Original Message:</strong>
                        </p>
                        <p className="text-gray-900 mb-2">"{bid.message}"</p>
                        
                        {bid.messageTranslated && bid.messageTranslated !== bid.message && (
                          <>
                            <p className="text-sm text-blue-700 mb-1">
                              <strong>🌐 Translation:</strong>
                            </p>
                            <p className="text-blue-900">"{bid.messageTranslated}"</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptBid(bid.id)}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-medium"
                      >
                        ✅ {selectedLang === 'hi' ? 'बोली स्वीकार करें' : selectedLang === 'ta' ? 'ஏலத்தை ஏற்கவும்' : 'Accept Bid'}
                      </button>
                      <button
                        onClick={() => handleRejectBid(bid.id)}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition font-medium"
                      >
                        ❌ {selectedLang === 'hi' ? 'बोली अस्वीकार करें' : selectedLang === 'ta' ? 'ஏலத்தை நிராகரிக்கவும்' : 'Reject Bid'}
                      </button>
                      <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium">
                        🔄 Counter Offer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}