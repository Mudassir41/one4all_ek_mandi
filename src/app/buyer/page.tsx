'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBidding } from '@/contexts/BiddingContext';
import { useDemoUser } from '@/contexts/DemoUserContext';
import { Navbar } from '@/components/ui/Navbar';

export default function BuyerDashboard() {
  const { t } = useLanguage();
  const { bids } = useBidding();
  const { currentUser } = useDemoUser();

  const myBids = bids;
  const pendingBids = bids.filter(b => b.status === 'pending');
  const acceptedBids = bids.filter(b => b.status === 'accepted');
  const rejectedBids = bids.filter(b => b.status === 'rejected');

  const formatTimestamp = (date: Date) => {
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', border: 'border-yellow-300' };
      case 'accepted': return { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', border: 'border-green-300' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', border: 'border-red-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '❓', border: 'border-gray-300' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Shared Navbar */}
      <Navbar activePage="buyer" />

      {/* Role Check: Show empty state if not a buyer */}
      {!currentUser ? (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">👆</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select a User Profile</h2>
          <p className="text-gray-600 mb-6">Please select a buyer profile from the dropdown above to access the Buyer Dashboard.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-700 text-sm">💡 Try selecting <strong>Amit Sharma</strong> or <strong>Lakshmi Enterprises</strong></p>
          </div>
        </div>
      ) : currentUser.userType === 'vendor' ? (
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Seller Account Selected</h2>
          <p className="text-gray-600 mb-6">You're currently logged in as a <strong>seller</strong>. Switch to a buyer profile to access this dashboard.</p>
          <Link
            href="/seller"
            className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition"
          >
            Go to Seller Dashboard →
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Buyer Profile Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-8 border border-blue-100">
            <div className="flex flex-wrap items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
                🛒
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{currentUser?.name || 'Select a buyer'}</h2>
                <p className="text-gray-600">📍 {currentUser?.location || 'No location set'}</p>
                <p className="text-gray-500 text-sm">🏪 Looking for quality produce</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 px-5 py-3 rounded-xl">
                <p className="text-blue-700 font-bold text-lg">
                  💰 {myBids.length} Total Bids
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="text-3xl mb-2">📋</div>
              <div className="text-2xl font-bold text-gray-900">{myBids.length}</div>
              <div className="text-gray-500 text-sm">Total Bids</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-bold text-yellow-600">{pendingBids.length}</div>
              <div className="text-gray-500 text-sm">Pending</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-green-600">{acceptedBids.length}</div>
              <div className="text-gray-500 text-sm">Accepted</div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
              <div className="text-3xl mb-2">💸</div>
              <div className="text-2xl font-bold text-blue-600">₹{acceptedBids.reduce((sum, b) => sum + b.amount, 0)}</div>
              <div className="text-gray-500 text-sm">To Pay</div>
            </div>
          </div>

          {/* My Bids */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              💰 My Bids
              <span className="text-sm font-normal text-gray-500">Track your offers</span>
            </h3>

            {myBids.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 text-lg">No bids placed yet</p>
                <p className="text-gray-400 text-sm mt-2">Browse products and start bidding!</p>
                <Link
                  href="/"
                  className="inline-block mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition font-medium"
                >
                  🔍 Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myBids.map(bid => {
                  const style = getStatusStyle(bid.status);
                  return (
                    <div
                      key={bid.id}
                      className={`rounded-2xl p-5 border-2 ${style.border} ${style.bg} hover:shadow-lg transition`}
                    >
                      <div className="flex flex-wrap gap-4 items-start justify-between">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-bold text-lg text-gray-900">{bid.productName}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
                              {style.icon} {bid.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-gray-600">
                                <span className="font-medium">Your Bid:</span> ₹{bid.amount}/{bid.unit}
                              </p>
                              <p className="text-gray-600">
                                <span className="font-medium">Seller:</span> {bid.sellerName}
                              </p>
                              <p className="text-gray-500 text-sm">{formatTimestamp(bid.timestamp)}</p>
                            </div>

                            <div className="bg-white/50 p-3 rounded-xl">
                              <p className="text-sm text-gray-500">Your Message:</p>
                              <p className="text-gray-900">"{bid.message}"</p>
                            </div>
                          </div>
                        </div>

                        {/* Status-specific actions */}
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">₹{bid.amount}</div>
                            <div className="text-gray-500 text-sm">per {bid.unit}</div>
                          </div>

                          {bid.status === 'accepted' && (
                            <div className="flex gap-2">
                              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2 rounded-xl hover:shadow-lg transition font-medium">
                                💳 Pay Now
                              </button>
                              <Link href="/chat/demo" className="bg-white border-2 border-blue-500 text-blue-600 px-5 py-2 rounded-xl hover:bg-blue-50 transition font-medium">
                                💬 Chat
                              </Link>
                            </div>
                          )}

                          {bid.status === 'pending' && (
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-yellow-600 text-sm font-medium animate-pulse">
                                ⏳ Waiting for seller...
                              </div>
                              <Link href="/chat/demo" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl hover:shadow-lg transition text-sm">
                                💬 Chat with Seller
                              </Link>
                            </div>
                          )}

                          {bid.status === 'rejected' && (
                            <Link
                              href="/"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Find similar products →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mt-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Quick Actions</h3>

            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/"
                className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 p-6 rounded-2xl transition text-center block border border-blue-200"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition">🔍</div>
                <h4 className="font-semibold text-blue-900">Browse Products</h4>
                <p className="text-blue-700 text-sm">Find new products to bid on</p>
              </Link>

              <Link
                href="/seller"
                className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 p-6 rounded-2xl transition text-center block border border-green-200"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition">👨‍🌾</div>
                <h4 className="font-semibold text-green-900">Seller View</h4>
                <p className="text-green-700 text-sm">See incoming bids as seller</p>
              </Link>

              <div className="group bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 p-6 rounded-2xl transition text-center cursor-pointer border border-purple-200">
                <div className="text-4xl mb-3 group-hover:scale-110 transition">📊</div>
                <h4 className="font-semibold text-purple-900">Price Trends</h4>
                <p className="text-purple-700 text-sm">Track market prices</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}