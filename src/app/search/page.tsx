'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBidding } from '@/contexts/BiddingContext';
import { BiddingModal } from '@/components/ui/BiddingModal';
import { Filter, Grid, List, MapPin, Star, Mic, MicOff, Search, SlidersHorizontal } from 'lucide-react';

interface SearchFilters {
  category: string;
  priceRange: { min: number; max: number };
  location: string;
  quality: string;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'date' | 'distance';
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showBiddingModal, setShowBiddingModal] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    priceRange: { min: 0, max: 1000 },
    location: '',
    quality: '',
    sortBy: 'relevance'
  });

  const { currentLanguage, setLanguage, t, languages } = useLanguage();
  const { addBid } = useBidding();

  useEffect(() => {
    performSearch();
  }, [searchQuery, filters]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filters.category) params.append('category', filters.category);
      if (filters.location) params.append('location', filters.location);
      if (filters.sortBy !== 'relevance') params.append('sort', filters.sortBy);

      const response = await fetch(`/api/products/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        let filteredProducts = data.products;

        // Apply price filter
        if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
          filteredProducts = filteredProducts.filter((product: Product) => {
            const price = product.pricing.retail.price;
            return price >= filters.priceRange.min && price <= filters.priceRange.max;
          });
        }

        // Apply quality filter
        if (filters.quality) {
          filteredProducts = filteredProducts.filter((product: Product) => 
            product.quality.grade?.toLowerCase().includes(filters.quality.toLowerCase()) ||
            product.quality.certifications?.some(cert => 
              cert.toLowerCase().includes(filters.quality.toLowerCase())
            )
          );
        }

        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const startVoiceSearch = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Mock voice search - in production, this would use speech recognition
      setTimeout(() => {
        setIsRecording(false);
        const voiceQueries = [
          'organic tomatoes from Tamil Nadu',
          'basmati rice premium quality',
          'fresh vegetables for restaurant',
          'export quality spices'
        ];
        const randomQuery = voiceQueries[Math.floor(Math.random() * voiceQueries.length)];
        setSearchQuery(randomQuery);
        stream.getTracks().forEach(track => track.stop());
      }, 3000);
    } catch (error) {
      console.error('Voice search error:', error);
      setIsRecording(false);
    }
  };

  const handleBidClick = (product: Product) => {
    setSelectedProduct(product);
    setShowBiddingModal(true);
  };

  const handleSubmitBid = async (bidData: {
    amount: number;
    quantity: number;
    message: string;
    voiceMessage?: Blob;
  }) => {
    if (!selectedProduct) return;

    await addBid({
      productId: selectedProduct.id,
      productName: selectedProduct.title[currentLanguage] || selectedProduct.title.en || 'Product',
      buyerId: 'demo-buyer',
      buyerName: 'Demo Buyer',
      buyerLocation: 'Delhi',
      sellerId: 'seller-1',
      sellerName: 'Demo Seller',
      amount: bidData.amount,
      quantity: bidData.quantity,
      unit: selectedProduct.pricing.retail.unit,
      message: bidData.message,
      voiceMessage: bidData.voiceMessage ? URL.createObjectURL(bidData.voiceMessage) : undefined,
      status: 'pending'
    });

    setShowBiddingModal(false);
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'grains', label: 'Grains & Cereals' },
    { value: 'spices', label: 'Spices' },
    { value: 'dairy', label: 'Dairy Products' }
  ];

  const locations = [
    { value: '', label: 'All Locations' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' }
  ];

  const qualityOptions = [
    { value: '', label: 'All Quality' },
    { value: 'organic', label: 'Organic' },
    { value: 'premium', label: 'Premium' },
    { value: 'export', label: 'Export Quality' },
    { value: 'grade a', label: 'Grade A' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories, locations..."
                  className="w-full pl-4 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startVoiceSearch}
                    className={`p-2 rounded-lg transition ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.native}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 bg-white rounded-xl shadow-lg p-6 h-fit sticky top-24`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setFilters({
                  category: '',
                  priceRange: { min: 0, max: 1000 },
                  location: '',
                  quality: '',
                  sortBy: 'relevance'
                })}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (₹{filters.priceRange.min} - ₹{filters.priceRange.max})
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: {...filters.priceRange, min: parseInt(e.target.value)}
                    })}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: {...filters.priceRange, max: parseInt(e.target.value)}
                    })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {locations.map(loc => (
                    <option key={loc.value} value={loc.value}>{loc.label}</option>
                  ))}
                </select>
              </div>

              {/* Quality Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
                <select
                  value={filters.quality}
                  onChange={(e) => setFilters({...filters, quality: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {qualityOptions.map(qual => (
                    <option key={qual.value} value={qual.value}>{qual.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="date">Newest First</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {loading ? 'Searching...' : `${products.length} results`}
                    {searchQuery && ` for "${searchQuery}"`}
                  </h2>
                  {!loading && (
                    <p className="text-gray-600 text-sm">
                      Found products from across India
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>
                  
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition ${
                        viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition ${
                        viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching products...</p>
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && products.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({
                      category: '',
                      priceRange: { min: 0, max: 1000 },
                      location: '',
                      quality: '',
                      sortBy: 'relevance'
                    });
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Results Grid/List */}
            {!loading && products.length > 0 && (
              <div className={viewMode === 'grid' 
                ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {products.map(product => (
                  <div key={product.id} className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}>
                    <div className={`${viewMode === 'list' ? 'w-48 h-32' : 'h-48'} bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center`}>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title.en || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">📦</span>
                      )}
                    </div>

                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">
                            {product.title[currentLanguage] || product.title.en || 'Product'}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {product.category} • {product.subcategory}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{product.location.state}, {product.location.district}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ₹{product.pricing.retail.price}/{product.pricing.retail.unit}
                          </div>
                          <div className="text-sm text-gray-500">
                            Wholesale: ₹{product.pricing.wholesale.price}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {product.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium">4.8</span>
                          <span className="text-sm text-gray-500">(23)</span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            View
                          </Link>
                          <button 
                            onClick={() => handleBidClick(product)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            Bid
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bidding Modal */}
      {selectedProduct && (
        <BiddingModal
          isOpen={showBiddingModal}
          onClose={() => setShowBiddingModal(false)}
          product={{
            id: selectedProduct.id,
            title: selectedProduct.title[currentLanguage] || selectedProduct.title.en || 'Product',
            currentPrice: selectedProduct.pricing.retail.price,
            unit: selectedProduct.pricing.retail.unit,
            sellerName: 'Demo Seller'
          }}
          onSubmitBid={handleSubmitBid}
        />
      )}
    </div>
  );
}