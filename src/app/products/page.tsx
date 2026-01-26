'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Product } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentLanguage, setLanguage, t, languages } = useLanguage();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/search');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('products')}</h1>
              <p className="text-orange-100 text-sm">Browse products from across India</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-orange-200 transition font-medium">
                ← {t('backToHome')}
              </Link>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchProducts')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition font-medium"
            >
              🔍 {t('search')}
            </button>
          </form>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('noProductsFound')}</h2>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term' : 'No products available yet'}
            </p>
            <Link
              href="/seller/add-product"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-medium"
            >
              ➕ {t('addProduct')}
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title.en || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">📦</span>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {product.title[currentLanguage] || product.title.en || 'Product'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {product.category} • {product.subcategory}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ₹{product.pricing.retail.price}/{product.pricing.retail.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t('wholesale')}: ₹{product.pricing.wholesale.price}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span>📍 {product.location.state}, {product.location.district}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>📦 {t('availability')}: {product.inventory.available} {product.inventory.unit}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition font-medium text-center"
                    >
                      {t('viewDetails')}
                    </Link>
                    <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition font-medium">
                      💰 {t('bid')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}