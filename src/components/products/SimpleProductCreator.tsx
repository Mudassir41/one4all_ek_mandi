'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mic, MicOff, Upload, Loader2, CheckCircle } from 'lucide-react';

export function SimpleProductCreator() {
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [productData, setProductData] = useState({
    textDescription: '',
    category: '',
    subcategory: '',
    wholesalePrice: 0,
    retailPrice: 0,
    quantity: 100,
    unit: 'kg'
  });

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
        setAudioBlob(audioBlob);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const createProduct = async () => {
    if (!user) {
      alert('Please log in to create products');
      return;
    }

    setIsCreating(true);

    try {
      const formData = new FormData();
      
      // Add voice data if available
      if (audioBlob) {
        formData.append('voiceAudio', audioBlob, 'description.wav');
        formData.append('voiceLanguage', user.languages?.[0] || 'en');
      }
      
      // Add text description if provided
      if (productData.textDescription) {
        formData.append('textDescription', productData.textDescription);
      }
      
      // Add images
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });
      
      // Add location and other data
      formData.append('location', JSON.stringify({
        state: user.location?.state || 'Tamil Nadu',
        district: user.location?.district || 'Chennai',
        coordinates: user.location?.coordinates || [13.0827, 80.2707]
      }));
      
      formData.append('inventory', JSON.stringify({
        available: productData.quantity,
        unit: productData.unit
      }));

      if (productData.wholesalePrice > 0 || productData.retailPrice > 0) {
        formData.append('pricing', JSON.stringify({
          wholesale: { minQuantity: 50, price: productData.wholesalePrice, unit: productData.unit },
          retail: { price: productData.retailPrice, unit: productData.unit }
        }));
      }

      const response = await fetch('/api/products/create', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      const result = await response.json();
      
      alert('Product created successfully! 🎉');
      
      // Reset form
      setAudioBlob(null);
      setImages([]);
      setProductData({
        textDescription: '',
        category: '',
        subcategory: '',
        wholesalePrice: 0,
        retailPrice: 0,
        quantity: 100,
        unit: 'kg'
      });
      
    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Error creating product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Product</h2>
      
      {/* Voice Description */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎤 Voice Description (Recommended)
        </h3>
        
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>
          
          <p className="text-sm text-gray-600">
            {isRecording ? '🔴 Recording... Click to stop' : 'Click to start recording'}
          </p>
        </div>

        {audioBlob && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">Voice recording complete!</span>
            </div>
            <audio controls className="w-full">
              <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
            </audio>
          </div>
        )}
      </div>

      {/* Text Description (Alternative) */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📝 Text Description (Alternative)
        </h3>
        <textarea
          value={productData.textDescription}
          onChange={(e) => setProductData(prev => ({ ...prev, textDescription: e.target.value }))}
          placeholder="Describe your product in detail..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 h-24"
        />
      </div>

      {/* Images */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📸 Product Photos</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-gray-600">Click to upload photos (max 5)</span>
          </label>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Product ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Manual Details (Optional) */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Manual Details (Optional)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wholesale Price (₹/{productData.unit})
            </label>
            <input
              type="number"
              value={productData.wholesalePrice || ''}
              onChange={(e) => setProductData(prev => ({ ...prev, wholesalePrice: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="AI will suggest if not provided"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retail Price (₹/{productData.unit})
            </label>
            <input
              type="number"
              value={productData.retailPrice || ''}
              onChange={(e) => setProductData(prev => ({ ...prev, retailPrice: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="AI will suggest if not provided"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Quantity
            </label>
            <input
              type="number"
              value={productData.quantity}
              onChange={(e) => setProductData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              value={productData.unit}
              onChange={(e) => setProductData(prev => ({ ...prev, unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="kg">kg</option>
              <option value="piece">piece</option>
              <option value="bag">bag</option>
              <option value="ton">ton</option>
              <option value="liter">liter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="text-center">
        <button
          onClick={createProduct}
          disabled={isCreating || (!audioBlob && !productData.textDescription)}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Product...
            </>
          ) : (
            '🚀 Create Product'
          )}
        </button>
        
        <p className="text-sm text-gray-500 mt-2">
          {!audioBlob && !productData.textDescription 
            ? 'Please provide either voice or text description'
            : 'AI will automatically categorize and suggest pricing'
          }
        </p>
      </div>
    </div>
  );
}