'use client';

import Link from 'next/link';
import { SimpleProductCreator } from '@/components/products/SimpleProductCreator';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AddProductPage() {
  const { user, isLoading } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Add New Product</h1>
                <p className="text-green-100 text-sm">Voice-first product creation</p>
              </div>
              <Link href="/" className="hover:text-green-200 transition font-medium">
                ← Back to Home
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in as a vendor to create products.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowLoginPrompt(true)}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600"
              >
                Login / Register
              </button>
              <Link
                href="/"
                className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-300"
              >
                Back to Home
              </Link>
            </div>
          </div>

          {showLoginPrompt && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Demo Instructions:</strong><br/>
                For this demo, you can use phone: <code>+919876543210</code> and OTP: <code>123456</code>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (user.userType !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Add New Product</h1>
                <p className="text-green-100 text-sm">Voice-first product creation</p>
              </div>
              <Link href="/" className="hover:text-green-200 transition font-medium">
                ← Back to Home
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendor Access Required</h2>
            <p className="text-gray-600 mb-6">
              Only vendors can create products. Your account type is: <strong>{user.userType}</strong>
            </p>
            <Link
              href="/seller"
              className="inline-block bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Add New Product</h1>
              <p className="text-green-100 text-sm">Voice-first product creation with AI assistance</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/seller" className="hover:text-green-200 transition font-medium">
                ← Back to Dashboard
              </Link>
              <div className="text-sm">
                <p>Welcome, {user.name}</p>
                <p className="text-green-200">📍 {user.location?.state}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <SimpleProductCreator />
      </div>
    </div>
  );
}