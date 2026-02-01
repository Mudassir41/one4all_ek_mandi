'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Product } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBidding } from '@/contexts/BiddingContext';
import { BiddingModal } from '@/components/ui/BiddingModal';
import { useNotifications } from '@/components/ui/NotificationToast';
import { Mic, MicOff, Play, Pause, Star, Shield, Truck, MessageCircle, TrendingUp, MapPin, Calendar, Package } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBiddingModal, setShowBiddingModal] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { currentLanguage, setLanguage, t, languages } = useLanguage();
  const { addBid, bids } = useBidding();
  const { addNotification } = useNotifications();

  // Get bids for this product
  const productBids = bids.filter(bid => bid.productId === params.id);
  const topBid = productBids.length > 0 ? Math.max(...productBids.map(b => b.amount)) : null;

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

  const handleSubmitBid = async (bidData: {
    amount: number;
    quantity: number;
    message: string;
    voiceMessage?: Blob;
  }) => {
    if (!product) return;

    await addBid({
      productId: product.id,
      productName: product.title[currentLanguage] || product.title.en || 'Product',
      buyerId: 'demo-buyer',
      buyerName: 'Demo Buyer',
      buyerLocation: 'Delhi',
      sellerId: 'seller-1',
      sellerName: 'Demo Seller',
      amount: bidData.amount,
      quantity: bidData.quantity,
      unit: product.pricing.retail.unit,
      message: bidData.message,
      voiceMessage: bidData.voiceMessage ? URL.createObjectURL(bidData.voiceMessage) : undefined,
      status: 'pending'
    });

    addNotification({
      type: 'success',
      title: 'Bid Submitted!',
      message: `Your bid of ₹${bidData.amount}/${product.pricing.retail.unit} has been sent to the seller.`
    });

    setShowBiddingModal(false);
  };

  const playVoiceDescription = () => {
    if (product?.voiceDescription?.originalAudio) {
      setIsPlayingVoice(true);
      // Mock audio playback
      setTimeout(() => setIsPlayingVoice(false), 3000);
    }
  };

  const handleChatWithSeller = () => {
    addNotification({
      type: 'info',
      title: 'Chat Feature',
      message: 'Real-time chat with seller will be available soon!'
    });
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-96 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.title[currentLanguage] || 'Product'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl">📦</span>
                )}
                
                {/* Image Navigation */}
                {product.images && product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      disabled={selectedImageIndex === 0}
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(Math.min(product.images!.length - 1, selectedImageIndex + 1))}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                      disabled={selectedImageIndex === product.images!.length - 1}
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`bg-white rounded-lg overflow-hidden shadow border-2 transition ${
                      selectedImageIndex === index ? 'border-orange-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Main Product Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.title[currentLanguage] || product.title.en || 'Product'}
                  </h1>
                  <p className="text-gray-600 mb-2">
                    {product.category} • {product.subcategory}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    {product.tags.map(tag => (
                      <span key={tag} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* Seller Info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Demo Seller</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>4.8 rating</span>
                        <span>•</span>
                        <span>156 sales</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pricing */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ₹{product.pricing.retail.price}
                    <span className="text-lg text-gray-500">/{product.pricing.retail.unit}</span>
                  </div>
                  {topBid && (
                    <div className="text-sm text-orange-600 font-medium mb-2">
                      Top Bid: ₹{topBid}/{product.pricing.retail.unit}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    {t('wholesale')}: ₹{product.pricing.wholesale.price} 
                    <br />
                    (min {product.pricing.wholesale.minQuantity}{product.pricing.wholesale.unit})
                  </div>
                </div>
              </div>

              {/* Product Description */}
              {product.description[currentLanguage] && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {t('description')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{product.description[currentLanguage]}</p>
                </div>
              )}

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{t('location')}</p>
                    <p className="text-sm text-gray-600">{product.location.district}, {product.location.state}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{t('availability')}</p>
                    <p className="text-sm text-gray-600">{product.inventory.available} {product.inventory.unit}</p>
                  </div>
                </div>
                
                {product.quality.grade && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">{t('quality')}</p>
                      <p className="text-sm text-gray-600">{product.quality.grade}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">{t('listed')}</p>
                    <p className="text-sm text-gray-600">{new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              {product.quality.certifications && product.quality.certifications.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {t('certifications')}
                  </h4>
                  <div className="flex gap-2">
                    {product.quality.certifications.map(cert => (
                      <span key={cert} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowBiddingModal(true)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition flex items-center justify-center gap-2"
                >
                  💰 {t('placeBid')}
                </button>
                <button 
                  onClick={handleChatWithSeller}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('chatWithSeller')}
                </button>
              </div>
            </div>

            {/* Voice Description Card */}
            {product.voiceDescription && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  {t('voiceDescription')}
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-gray-600">Original ({product.voiceDescription.language.toUpperCase()})</p>
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {showTranslation ? 'Hide Translation' : 'Show Translation'}
                    </button>
                  </div>
                  
                  <p className="text-gray-900 mb-3 italic">"{product.voiceDescription.originalText}"</p>
                  
                  {showTranslation && product.description[currentLanguage] && (
                    <div className="border-t border-blue-200 pt-3 mt-3">
                      <p className="text-sm text-blue-600 mb-1">{t('translation')} ({currentLanguage.toUpperCase()})</p>
                      <p className="text-gray-700">"{product.description[currentLanguage]}"</p>
                    </div>
                  )}
                  
                  {product.voiceDescription.originalAudio && (
                    <button
                      onClick={playVoiceDescription}
                      className="flex items-center gap-2 mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      disabled={isPlayingVoice}
                    >
                      {isPlayingVoice ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Play Voice
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Bid History */}
            {productBids.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Bids ({productBids.length})
                </h3>
                <div className="space-y-3">
                  {productBids.slice(0, 3).map(bid => (
                    <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{bid.buyerName}</p>
                        <p className="text-sm text-gray-600">{bid.buyerLocation}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₹{bid.amount}/{bid.unit}</p>
                        <p className="text-xs text-gray-500">{bid.quantity} {bid.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bidding Modal */}
      {product && (
        <BiddingModal
          isOpen={showBiddingModal}
          onClose={() => setShowBiddingModal(false)}
          product={{
            id: product.id,
            title: product.title[currentLanguage] || product.title.en || 'Product',
            currentPrice: product.pricing.retail.price,
            unit: product.pricing.retail.unit,
            topBid: topBid || undefined,
            sellerName: 'Demo Seller'
          }}
          onSubmitBid={handleSubmitBid}
        />
      )}
    </div>
  );
}