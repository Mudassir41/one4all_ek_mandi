'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentLanguage, setLanguage, t, languages } = useLanguage();

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = () => {
    alert('Bid functionality coming soon! This would open a bidding modal.');
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link
            href="/products"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition font-medium"
          >
            ← {t('backToProducts')}
          </Link>
        </div>
      </div>
    );
  }

  const availableLanguages = Object.keys(product.title).filter(lang => product.title[lang]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t('productDetails')}</h1>
              <p className="text-orange-100 text-sm">View product information and place bids</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/products" className="hover:text-orange-200 transition font-medium">
                ← {t('backToProducts')}
              </Link>
              {availableLanguages.length > 1 && (
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
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title[currentLanguage] || 'Product'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl">📦</span>
                )}
              </div>
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow">
                    <img
                      src={image}
                      alt={`Product ${index + 2}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.title[currentLanguage] || product.title.en || 'Product'}
                  </h1>
                  <p className="text-gray-600">
                    {product.category} • {product.subcategory}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {product.tags.map(tag => (
                      <span key={tag} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{product.pricing.retail.price}/{product.pricing.retail.unit}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('wholesale')}: ₹{product.pricing.wholesale.price} (min {product.pricing.wholesale.minQuantity}{product.pricing.wholesale.unit})
                  </div>
                </div>
              </div>

              {product.description[currentLanguage] && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('description')}</h3>
                  <p className="text-gray-700">{product.description[currentLanguage]}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📍 {t('location')}</h4>
                  <p className="text-gray-700">{product.location.district}, {product.location.state}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📦 {t('availability')}</h4>
                  <p className="text-gray-700">{product.inventory.available} {product.inventory.unit}</p>
                </div>
                {product.quality.grade && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">⭐ {t('quality')}</h4>
                    <p className="text-gray-700">{product.quality.grade}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📅 {t('listed')}</h4>
                  <p className="text-gray-700">{new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {product.quality.certifications && product.quality.certifications.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">🏆 {t('certifications')}</h4>
                  <div className="flex gap-2">
                    {product.quality.certifications.map(cert => (
                      <span key={cert} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handlePlaceBid}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  💰 {t('placeBid')}
                </button>
                <button className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition">
                  🎤 {t('chatWithSeller')}
                </button>
              </div>
            </div>

            {/* Voice Description */}
            {product.voiceDescription && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">🎤 {t('voiceDescription')}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-3">"{product.voiceDescription.originalText}"</p>
                  {product.voiceDescription.originalAudio && (
                    <audio controls className="w-full">
                      <source src={product.voiceDescription.originalAudio} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}