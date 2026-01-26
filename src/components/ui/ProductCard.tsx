'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: {
      wholesale?: { min_quantity: number; price: number };
      retail?: { price: number };
    };
    images: string[];
    vendor: {
      name: string;
      location: string;
      rating: number;
      verified: boolean;
    };
    category: string;
    language: string;
  };
  variant?: 'default' | 'compact' | 'detailed';
  showPricing?: 'both' | 'wholesale' | 'retail';
  onVoiceChat?: () => void;
  onBid?: () => void;
  onBuy?: () => void;
  className?: string;
}

export function ProductCard({
  product,
  variant = 'default',
  showPricing = 'both',
  onVoiceChat,
  onBid,
  onBuy,
  className,
}: ProductCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      hi: '🇮🇳',
      ta: '🇮🇳',
      te: '🇮🇳',
      kn: '🇮🇳',
      bn: '🇮🇳',
      or: '🇮🇳',
      ml: '🇮🇳',
      en: '🇮🇳',
    };
    return flags[lang] || '🇮🇳';
  };

  if (variant === 'compact') {
    return (
      <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow', className)}>
        <div className="flex">
          {/* Image */}
          <div className="w-24 h-24 flex-shrink-0 relative">
            {!imageError && product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-3">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{product.title}</h3>
            <p className="text-xs text-gray-600 mt-1">{product.vendor.location}</p>
            
            {/* Price */}
            <div className="mt-2">
              {showPricing === 'both' || showPricing === 'retail' ? (
                product.price.retail && (
                  <span className="text-sm font-semibold text-primary-600">
                    {formatPrice(product.price.retail.price)}/kg
                  </span>
                )
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white rounded-lg shadow-cultural border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1',
      className
    )}>
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {!imageError && product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🌾</span>
          </div>
        )}

        {/* Language Badge */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium">
          {getLanguageFlag(product.language)} {product.language.toUpperCase()}
        </div>

        {/* Verified Badge */}
        {product.vendor.verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Category */}
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">{product.title}</h3>
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full mt-1">
            {product.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{product.description}</p>

        {/* Vendor Info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {product.vendor.name.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900 text-sm">{product.vendor.name}</p>
            <p className="text-gray-600 text-xs">{product.vendor.location}</p>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm font-medium">{product.vendor.rating}</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          {showPricing === 'both' || showPricing === 'wholesale' ? (
            product.price.wholesale && (
              <div className="mb-2">
                <span className="text-xs text-gray-500">Wholesale (min {product.price.wholesale.min_quantity}kg)</span>
                <div className="text-lg font-bold text-secondary-600">
                  {formatPrice(product.price.wholesale.price)}/kg
                </div>
              </div>
            )
          ) : null}
          
          {showPricing === 'both' || showPricing === 'retail' ? (
            product.price.retail && (
              <div>
                <span className="text-xs text-gray-500">Retail</span>
                <div className="text-lg font-bold text-primary-600">
                  {formatPrice(product.price.retail.price)}/kg
                </div>
              </div>
            )
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {onVoiceChat && (
            <button
              onClick={onVoiceChat}
              className="flex-1 bg-primary-500 text-white py-2 px-3 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
            >
              <span>🎤</span>
              <span>Voice Chat</span>
            </button>
          )}
          
          {onBid && (
            <button
              onClick={onBid}
              className="flex-1 bg-secondary-500 text-white py-2 px-3 rounded-lg hover:bg-secondary-600 transition-colors text-sm font-medium"
            >
              Place Bid
            </button>
          )}
          
          {onBuy && (
            <button
              onClick={onBuy}
              className="flex-1 bg-accent-500 text-white py-2 px-3 rounded-lg hover:bg-accent-600 transition-colors text-sm font-medium"
            >
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}