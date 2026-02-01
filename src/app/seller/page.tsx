'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBidding } from '@/contexts/BiddingContext';
import { useDemoUser } from '@/contexts/DemoUserContext';
import { Navbar } from '@/components/ui/Navbar';
import { useState } from 'react';

export default function SellerDashboard() {
  const { t } = useLanguage();
  const { bids, updateBidStatus } = useBidding();
  const { currentUser } = useDemoUser();
  const [notification, setNotification] = useState<string | null>(null);

  // Get pending bids for this seller
  const incomingBids = bids.filter(bid => bid.status === 'pending');
  const acceptedBids = bids.filter(bid => bid.status === 'accepted');
  const rejectedBids = bids.filter(bid => bid.status === 'rejected');

  const formatTimestamp = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAcceptBid = (bidId: string, productName: string) => {
    updateBidStatus(bidId, 'accepted');
    showNotification(`✅ Accepted bid for ${productName}`);
  };

  const handleRejectBid = (bidId: string, productName: string) => {
    updateBidStatus(bidId, 'rejected');
    showNotification(`❌ Rejected bid for ${productName}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-2xl">
            {notification}
          </div>
        </div>
      )}

      {/* Shared Navbar */}
      <Navbar activePage="seller" />

      {/* Role Check: Show empty state if not a seller */}
      {!currentUser ? (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">👆</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a User Profile</h2>
          <p className="text-gray-600 mb-6">Please select a seller profile from the dropdown above to access the Seller Dashboard.</p>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-700 text-sm">💡 Try selecting <strong>Ravi Kumar</strong> or <strong>Gurpreet Singh</strong></p>
          </div>
        </div>
      ) : currentUser.userType !== 'vendor' ? (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Buyer Account Selected</h2>
          <p className="text-gray-600 mb-6">You're currently logged in as a <strong>buyer</strong>. Switch to a seller profile to access this dashboard.</p>
          <Link
            href="/buyer"
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition"
          >
            Go to Buyer Dashboard →
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Seller Profile Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-green-100">
            <div className="flex flex-wrap items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                👨‍🌾
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{currentUser?.name || 'Select a seller'}</h2>
                <p className="text-gray-600">📍 {currentUser?.location || 'No location set'}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">⭐ 4.8 rating</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">📦 12 listings</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/seller/add-product"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-3 rounded-xl hover:shadow-lg transition font-medium flex items-center gap-2"
                >
                  ➕ {t('addProduct')}
                </Link>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 px-5 py-3 rounded-xl">
                  <p className="text-green-700 font-bold text-lg">
                    🔔 {incomingBids.length} New Bids
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="text-3xl mb-2">📥</div>
              <div className="text-2xl font-bold text-gray-900">{incomingBids.length}</div>
              <div className="text-gray-500 text-sm">Pending Bids</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{acceptedBids.length}</div>
              <div className="text-gray-500 text-sm">Accepted</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="text-3xl mb-2">❌</div>
              <div className="text-2xl font-bold text-red-600">{rejectedBids.length}</div>
              <div className="text-gray-500 text-sm">Rejected</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-orange-600">₹24.5K</div>
              <div className="text-gray-500 text-sm">This Month</div>
            </div>
          </div>

          {/* Incoming Bids */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🔔 Incoming Bids
                {incomingBids.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                    {incomingBids.length} NEW
                  </span>
                )}
              </h3>
            </div>

            {incomingBids.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg">No pending bids</p>
                <p className="text-gray-400 text-sm mt-2">New bids will appear here when buyers place them</p>
                <Link href="/" className="text-green-600 hover:underline mt-4 inline-block">
                  ← Back to marketplace
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingBids.map(bid => (
                  <div
                    key={bid.id}
                    className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-5 hover:shadow-lg transition"
                  >
                    <div className="flex flex-wrap gap-4 items-start justify-between">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">🔔</span>
                          <h4 className="font-bold text-lg text-gray-900">
                            {bid.productName}
                          </h4>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                            NEW
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-1">
                            <p className="text-gray-600">
                              <span className="font-medium">Buyer:</span> {bid.buyerName}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Location:</span> {bid.buyerLocation}
                            </p>
                            <p className="text-gray-600 text-sm">{formatTimestamp(bid.timestamp)}</p>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-500 mb-1">Original Message:</p>
                            <p className="text-gray-900 font-medium">"{bid.message}"</p>
                            {bid.messageTranslated && bid.messageTranslated !== bid.message && (
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-sm text-blue-600">🌐 {bid.messageTranslated}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right mb-2">
                          <div className="text-3xl font-bold text-green-600">₹{bid.amount}</div>
                          <div className="text-gray-500">per {bid.unit}</div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Link
                            href="/chat/demo"
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-3 rounded-xl hover:shadow-lg transition font-medium flex items-center gap-2"
                          >
                            💬 Chat
                          </Link>
                          <button
                            onClick={() => handleAcceptBid(bid.id, bid.productName)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl hover:shadow-lg transition font-medium flex items-center gap-2"
                          >
                            ✅ Accept
                          </button>
                          <button
                            onClick={() => handleRejectBid(bid.id, bid.productName)}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 rounded-xl hover:shadow-lg transition font-medium flex items-center gap-2"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          {(acceptedBids.length > 0 || rejectedBids.length > 0) && (
            <div className="bg-white rounded-3xl shadow-lg p-6 mt-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📜 Recent Activity</h3>
              <div className="space-y-3">
                {[...acceptedBids, ...rejectedBids].slice(0, 5).map(bid => (
                  <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={bid.status === 'accepted' ? 'text-green-600' : 'text-red-600'}>
                        {bid.status === 'accepted' ? '✅' : '❌'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{bid.productName}</p>
                        <p className="text-sm text-gray-500">{bid.buyerName} • ₹{bid.amount}/{bid.unit}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${bid.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {bid.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}