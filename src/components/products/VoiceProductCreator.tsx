'use client';

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Mic, MicOff, Upload, MapPin, DollarSign, Package, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProductCreationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface AIProcessingState {
  transcribing: boolean;
  categorizing: boolean;
  pricing: boolean;
  completed: boolean;
}

export function VoiceProductCreator() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [aiProcessing, setAiProcessing] = useState<AIProcessingState>({
    transcribing: false,
    categorizing: false,
    pricing: false,
    completed: false
  });
  
  const [productData, setProductData] = useState({
    voiceDescription: '',
    category: '',
    subcategory: '',
    suggestedPrice: { wholesale: 0, retail: 0 },
    location: {
      state: user?.location?.state || '',
      district: user?.location?.district || '',
      coordinates: user?.location?.coordinates || [0, 0]
    },
    inventory: { available: 100, unit: 'kg' },
    quality: { grade: '', certifications: [] }
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const steps: ProductCreationStep[] = [
    {
      id: 'voice',
      title: t('products.voiceDescription'),
      description: t('products.voiceDescriptionHelp'),
      completed: !!audioBlob
    },
    {
      id: 'images',
      title: t('products.addPhotos'),
      description: t('products.addPhotosHelp'),
      completed: images.length > 0
    },
    {
      id: 'details',
      title: t('products.reviewDetails'),
      description: t('products.reviewDetailsHelp'),
      completed: aiProcessing.completed
    },
    {
      id: 'publish',
      title: t('products.publish'),
      description: t('products.publishHelp'),
      completed: false
    }
  ];

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
      alert(t('voice.microphoneError'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceDescription = async () => {
    if (!audioBlob || !user) return;

    setAiProcessing({ transcribing: true, categorizing: false, pricing: false, completed: false });

    try {
      const formData = new FormData();
      formData.append('voiceAudio', audioBlob, 'description.wav');
      formData.append('voiceLanguage', user.languages[0] || 'en');
      formData.append('location', JSON.stringify(productData.location));

      const response = await fetch('/api/products/analyze-voice', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to process voice description');
      }

      const result = await response.json();
      
      setProductData(prev => ({
        ...prev,
        voiceDescription: result.transcription,
        category: result.categorization.category,
        subcategory: result.categorization.subcategory,
        suggestedPrice: result.pricing
      }));

      setAiProcessing({ transcribing: false, categorizing: false, pricing: false, completed: true });
      setCurrentStep(1); // Move to images step
    } catch (error) {
      console.error('Error processing voice:', error);
      setAiProcessing({ transcribing: false, categorizing: false, pricing: false, completed: false });
      alert(t('products.voiceProcessingError'));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const createProduct = async () => {
    if (!user || !audioBlob) return;

    try {
      const formData = new FormData();
      
      // Add voice data
      formData.append('voiceAudio', audioBlob, 'description.wav');
      formData.append('voiceLanguage', user.languages[0] || 'en');
      
      // Add images
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });
      
      // Add other data
      formData.append('location', JSON.stringify(productData.location));
      formData.append('inventory', JSON.stringify(productData.inventory));
      formData.append('quality', JSON.stringify(productData.quality));

      const response = await fetch('/api/products/create', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create product');
      }

      const result = await response.json();
      
      // Success - redirect to product page or dashboard
      alert(t('products.createSuccess'));
      window.location.href = `/seller/products/${result.product.id}`;
    } catch (error) {
      console.error('Error creating product:', error);
      alert(t('products.createError'));
    }
  };

  const renderVoiceStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('products.describeYourProduct')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('products.voiceInstructions')}
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isRecording ? (
            <MicOff className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>
        
        <p className="text-sm text-gray-600">
          {isRecording ? t('voice.recording') : t('voice.tapToRecord')}
        </p>
      </div>

      {audioBlob && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{t('voice.recordingComplete')}</span>
          </div>
          <audio controls className="w-full mt-2">
            <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
          </audio>
          
          <button
            onClick={processVoiceDescription}
            disabled={aiProcessing.transcribing}
            className="w-full mt-4 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center"
          >
            {aiProcessing.transcribing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('products.processingVoice')}
              </>
            ) : (
              t('products.analyzeDescription')
            )}
          </button>
        </div>
      )}

      {aiProcessing.completed && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">{t('products.aiAnalysis')}</h4>
          <div className="space-y-2 text-sm">
            <p><strong>{t('products.transcription')}:</strong> {productData.voiceDescription}</p>
            <p><strong>{t('products.category')}:</strong> {productData.category} / {productData.subcategory}</p>
            <p><strong>{t('products.suggestedPricing')}:</strong></p>
            <ul className="ml-4">
              <li>• {t('products.wholesale')}: ₹{productData.suggestedPrice.wholesale}/kg</li>
              <li>• {t('products.retail')}: ₹{productData.suggestedPrice.retail}/kg</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderImagesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('products.addProductPhotos')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('products.photoInstructions')}
        </p>
      </div>

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
          <Upload className="w-12 h-12 text-gray-400" />
          <span className="text-gray-600">{t('products.clickToUpload')}</span>
          <span className="text-xs text-gray-500">{t('products.maxImages', { max: 5 })}</span>
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(image)}
                alt={`Product ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('products.reviewAndAdjust')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.category')}
            </label>
            <input
              type="text"
              value={productData.category}
              onChange={(e) => setProductData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.subcategory')}
            </label>
            <input
              type="text"
              value={productData.subcategory}
              onChange={(e) => setProductData(prev => ({ ...prev, subcategory: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.availableQuantity')}
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={productData.inventory.available}
                onChange={(e) => setProductData(prev => ({
                  ...prev,
                  inventory: { ...prev.inventory, available: parseInt(e.target.value) || 0 }
                }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={productData.inventory.unit}
                onChange={(e) => setProductData(prev => ({
                  ...prev,
                  inventory: { ...prev.inventory, unit: e.target.value }
                }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="kg">kg</option>
                <option value="piece">piece</option>
                <option value="bag">bag</option>
                <option value="ton">ton</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.wholesalePrice')} (₹/{productData.inventory.unit})
            </label>
            <input
              type="number"
              value={productData.suggestedPrice.wholesale}
              onChange={(e) => setProductData(prev => ({
                ...prev,
                suggestedPrice: { ...prev.suggestedPrice, wholesale: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.retailPrice')} (₹/{productData.inventory.unit})
            </label>
            <input
              type="number"
              value={productData.suggestedPrice.retail}
              onChange={(e) => setProductData(prev => ({
                ...prev,
                suggestedPrice: { ...prev.suggestedPrice, retail: parseFloat(e.target.value) || 0 }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('products.quality')}
            </label>
            <select
              value={productData.quality.grade}
              onChange={(e) => setProductData(prev => ({
                ...prev,
                quality: { ...prev.quality, grade: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">{t('products.selectGrade')}</option>
              <option value="premium">Premium</option>
              <option value="grade-a">Grade A</option>
              <option value="grade-b">Grade B</option>
              <option value="standard">Standard</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPublishStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('products.readyToPublish')}
        </h3>
        <p className="text-gray-600">
          {t('products.publishInstructions')}
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-left">
        <h4 className="font-medium text-gray-900 mb-2">{t('products.productSummary')}</h4>
        <div className="space-y-1 text-sm text-gray-600">
          <p><strong>{t('products.category')}:</strong> {productData.category} / {productData.subcategory}</p>
          <p><strong>{t('products.quantity')}:</strong> {productData.inventory.available} {productData.inventory.unit}</p>
          <p><strong>{t('products.pricing')}:</strong> ₹{productData.suggestedPrice.wholesale} (wholesale) / ₹{productData.suggestedPrice.retail} (retail)</p>
          <p><strong>{t('products.images')}:</strong> {images.length} photos</p>
        </div>
      </div>

      <button
        onClick={createProduct}
        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center"
      >
        <Package className="w-5 h-5 mr-2" />
        {t('products.publishProduct')}
      </button>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderVoiceStep();
      case 1: return renderImagesStep();
      case 2: return renderDetailsStep();
      case 3: return renderPublishStep();
      default: return renderVoiceStep();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  index === currentStep
                    ? 'bg-orange-600 text-white'
                    : step.completed
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  index === currentStep ? 'text-orange-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  step.completed ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.previous')}
        </button>
        
        {currentStep < steps.length - 1 && (
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            disabled={!steps[currentStep].completed}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.next')}
          </button>
        )}
      </div>
    </div>
  );
}