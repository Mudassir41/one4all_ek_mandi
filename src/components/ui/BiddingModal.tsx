'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mic, MicOff, X, Send } from 'lucide-react';

interface BiddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    currentPrice: number;
    unit: string;
    topBid?: number;
    sellerName: string;
  };
  onSubmitBid: (bid: {
    amount: number;
    quantity: number;
    message: string;
    voiceMessage?: Blob;
  }) => void;
}

export function BiddingModal({ isOpen, onClose, product, onSubmitBid }: BiddingModalProps) {
  const { t } = useLanguage();
  const [bidAmount, setBidAmount] = useState(product.topBid ? product.topBid + 1 : product.currentPrice);
  const [quantity, setQuantity] = useState(50);
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (bidAmount <= 0 || quantity <= 0) {
      alert('Please enter valid bid amount and quantity');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmitBid({
        amount: bidAmount,
        quantity,
        message: message || `Bidding ₹${bidAmount}/${product.unit} for ${quantity} ${product.unit}`,
        voiceMessage: voiceMessage || undefined
      });
      
      // Reset form
      setBidAmount(product.currentPrice);
      setQuantity(50);
      setMessage('');
      setVoiceMessage(null);
      onClose();
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Failed to submit bid. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = bidAmount * quantity;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {t('placeBid')} on {product.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Price Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Current Price:</span>
              <span className="font-semibold">₹{product.currentPrice}/{product.unit}</span>
            </div>
            {product.topBid && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Top Bid:</span>
                <span className="font-semibold text-green-600">₹{product.topBid}/{product.unit}</span>
              </div>
            )}
          </div>

          {/* Bid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Bid (₹/{product.unit})
            </label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min={product.topBid ? product.topBid + 1 : product.currentPrice}
              step="0.5"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity ({product.unit})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min="1"
            />
          </div>

          {/* Total Amount */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-green-800 font-medium">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Seller:
            </label>
            <div className="space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message or use voice recording..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent h-20 resize-none"
              />
              
              {/* Voice Recording */}
              <div className="flex items-center gap-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Voice Message
                    </>
                  )}
                </button>
                
                {voiceMessage && (
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="text-sm">✓ Voice message recorded</span>
                    <button
                      onClick={() => setVoiceMessage(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Seller:</strong> {product.sellerName}
            </p>
            <p className="text-blue-700 text-xs mt-1">
              Your message will be automatically translated if needed
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || bidAmount <= 0 || quantity <= 0}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Bid
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}