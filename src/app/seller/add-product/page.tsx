'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function AddProductPage() {
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState('vegetables');
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: 'vegetables', name: 'Vegetables', emoji: '🥬' },
    { id: 'grains', name: 'Grains', emoji: '🌾' },
    { id: 'fruits', name: 'Fruits', emoji: '🍎' },
    { id: 'textiles', name: 'Textiles', emoji: '🧵' },
    { id: 'spices', name: 'Spices', emoji: '🌶️' },
    { id: 'dairy', name: 'Dairy', emoji: '🥛' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In production, this would call an API
    setTimeout(() => {
      setSubmitted(false);
      setProductName('');
      setDescription('');
      setPrice('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/80 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl">
                ➕
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-700">Add New Product</h1>
                <p className="text-xs text-gray-500">List your products for buyers across India</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/seller" className="text-gray-600 hover:text-green-600 transition">
                ← Back to Dashboard
              </Link>
              <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-white border-2 border-green-200 text-gray-900 px-4 py-2 rounded-xl font-medium focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.native}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Message */}
        {submitted && (
          <div className="mb-6 bg-green-100 border-2 border-green-300 text-green-800 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold">Product Added Successfully!</p>
              <p className="text-sm">Your product is now live in the marketplace.</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-block bg-green-100 p-4 rounded-2xl mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create Product Listing</h2>
            <p className="text-gray-500">Fill in the details below to list your product</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Organic Tomatoes"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-gray-900"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-4 rounded-xl border-2 text-center transition ${category === cat.id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="text-2xl mb-1">{cat.emoji}</div>
                    <div className="text-sm font-medium">{cat.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product quality, origin, etc."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-gray-900 resize-none"
              />
            </div>

            {/* Price & Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="45"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-gray-900 cursor-pointer"
                >
                  <option value="kg">Per Kilogram (kg)</option>
                  <option value="piece">Per Piece</option>
                  <option value="dozen">Per Dozen</option>
                  <option value="quintal">Per Quintal</option>
                </select>
              </div>
            </div>

            {/* Voice Description Hint */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">🎤</span>
              <div>
                <p className="font-semibold text-blue-800">Coming Soon: Voice Description</p>
                <p className="text-sm text-blue-700">Describe your product in your language and AI will transcribe and translate!</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition ${submitted
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-[1.02]'
                }`}
            >
              {submitted ? (
                <>
                  <span className="animate-spin">⏳</span> Publishing...
                </>
              ) : (
                <>
                  🚀 Publish Product
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">💡 Tips for Better Sales</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Use clear, high-quality photos of your products</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Mention the origin/farm location for credibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Set competitive prices based on market rates</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✓</span>
              <span>Respond quickly to buyer inquiries</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}