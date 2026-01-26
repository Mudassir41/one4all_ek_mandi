'use client';

import { useState } from 'react';
import { useBidding } from '@/contexts/BiddingContext';
import { useI18n } from '@/contexts/I18nContext';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    nameHi: string;
    price: number;
    unit: string;
    seller: string;
  };
}

export function BidModal({ isOpen, onClose, product }: BidModalProps) {
  const { addBid } = useBidding();
  
  // Fallback for i18n if context is not available
  let t: (key: string) => string;
  try {
    const i18nContext = useI18n();
    t = i18nContext.t;
  } catch {
    t = (key: string) => {
      const fallbacks: Record<string, string> = {
        'bidding.placeBid': 'Place Bid',
        'bidding.bidAmount': 'Bid Amount',
        'bidding.bidMessage': 'Message',
        'common.cancel': 'Cancel',
        'bidding.submitBid': 'Submit Bid'
      };
      return fallbacks[key] || key;
    };
  }
  
  const [bidAmount, setBidAmount] = useState(product.price.toString());
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || !message) return;

    setIsSubmitting(true);

    // Mock translation for demo
    let messageTranslated = '';
    if (message.includes('किलो') || message.includes('चाहिए')) {
      messageTranslated = message
        .replace('मुझे', 'I need')
        .replace('किलो', 'kg')
        .replace('चाहिए', '');
    } else if (message.includes('need') || message.includes('want')) {
      messageTranslated = message; // Already in English
    } else {
      messageTranslated = `[Translated]: ${message}`;
    }

    // Add bid to context
    addBid({
      productId: product.id,
      productName: product.name,
      buyerName: 'Demo Buyer',
      buyerLocation: 'Delhi',
      amount: parseFloat(bidAmount),
      unit: product.unit,
      message,
      messageTranslated,
      status: 'pending',
      sellerName: product.seller
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    onClose();
    setBidAmount(product.price.toString());
    setMessage('');

    // Show success message
    alert('Bid placed successfully! Switch to Seller view to see it.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('bidding.placeBid')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-600">{product.nameHi}</p>
          <p className="text-sm text-gray-500">Current price: ₹{product.price}/{product.unit}</p>
          <p className="text-sm text-gray-500">Seller: {product.seller}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('bidding.bidAmount')}
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">₹</span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your bid amount"
                min="1"
                step="0.01"
                required
              />
              <span className="text-gray-500 ml-2">/{product.unit}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('bidding.bidMessage')}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              rows={3}
              placeholder="मुझे 50 किलो चाहिए / I need 50 kg"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Type in Hindi or English - it will be translated for the seller
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Buyer Profile:</strong><br />
              📍 Delhi<br />
              🛒 Looking for quality produce for restaurant
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Placing Bid...' : t('bidding.submitBid')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}