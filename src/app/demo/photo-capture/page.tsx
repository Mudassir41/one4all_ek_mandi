'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Image, Upload, Smartphone, Wifi, WifiOff } from 'lucide-react';
import PhotoCapture from '@/components/ui/PhotoCapture';
import PhotoCaptureButton from '@/components/ui/PhotoCaptureButton';
import { PhotoCapture as PhotoCaptureType } from '@/types';
import { formatFileSize } from '@/lib/image-utils';

const PhotoCaptureDemoPage: React.FC = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<PhotoCaptureType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('vegetables');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errors, setErrors] = useState<string[]>([]);

  // Mock user ID for demo
  const userId = 'demo-user-123';
  const productId = 'demo-product-456';

  const handlePhotosChange = (newPhotos: PhotoCaptureType[]) => {
    setPhotos(newPhotos);
  };

  const handleError = (error: string) => {
    setErrors(prev => [...prev, error]);
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(e => e !== error));
    }, 5000);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  // Monitor online status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const categories = [
    { value: 'vegetables', label: t('categories.vegetables'), icon: '🥕' },
    { value: 'fruits', label: t('categories.fruits'), icon: '🍎' },
    { value: 'spices', label: t('categories.spices'), icon: '🌶️' },
    { value: 'grains', label: t('categories.grains'), icon: '🌾' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('camera.photoCapture')} - Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience offline-first photo capture with automatic compression, 
            cultural UI elements, and background sync for agricultural products.
          </p>
        </div>

        {/* Status indicators */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Online status */}
              <div className="flex items-center space-x-2">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                  {isOnline ? 'Online' : t('camera.offlineMode')}
                </span>
              </div>

              {/* Photo count */}
              <div className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">
                  {photos.length} {t('products.photos')}
                </span>
              </div>

              {/* Total size */}
              {photos.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-purple-500" />
                  <span className="text-sm text-gray-600">
                    {formatFileSize(photos.reduce((sum, photo) => sum + photo.size, 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Device info */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Smartphone className="w-4 h-4" />
              <span>
                {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                  ? 'Mobile' : 'Desktop'}
              </span>
            </div>
          </div>
        </div>

        {/* Error messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium mb-2">Errors:</h3>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={clearErrors}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main photo capture */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Photo Capture Interface
              </h2>
              
              {/* Category selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        selectedCategory === category.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{category.icon}</div>
                      <div className="text-xs font-medium">{category.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo capture component */}
              <PhotoCapture
                userId={userId}
                productId={productId}
                category={selectedCategory}
                onPhotosChange={handlePhotosChange}
                onError={handleError}
                showGallery={true}
                showUpload={true}
                showGuides={true}
                maxPhotos={10}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick capture button */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Capture
              </h3>
              <PhotoCaptureButton
                userId={userId}
                productId={productId}
                category={selectedCategory}
                onPhotosChange={handlePhotosChange}
                onError={handleError}
                className="w-full"
                size="lg"
              >
                Open Camera
              </PhotoCaptureButton>
              <p className="text-sm text-gray-600 mt-2">
                Opens photo capture in a modal dialog
              </p>
            </div>

            {/* Features showcase */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Key Features
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Offline-First</h4>
                    <p className="text-sm text-gray-600">
                      Photos stored locally with background sync
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Smart Compression</h4>
                    <p className="text-sm text-gray-600">
                      Automatic optimization for mobile networks
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Cultural UI</h4>
                    <p className="text-sm text-gray-600">
                      Multilingual interface with regional guides
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Agricultural Focus</h4>
                    <p className="text-sm text-gray-600">
                      Category-specific photography guides
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Network Aware</h4>
                    <p className="text-sm text-gray-600">
                      Adapts to 2G/3G network conditions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo statistics */}
            {photos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Photo Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Photos:</span>
                    <span className="font-medium">{photos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Size:</span>
                    <span className="font-medium">
                      {formatFileSize(photos.reduce((sum, photo) => sum + photo.size, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Size:</span>
                    <span className="font-medium">
                      {formatFileSize(photos.reduce((sum, photo) => sum + photo.size, 0) / photos.length)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending Sync:</span>
                    <span className="font-medium text-yellow-600">
                      {photos.filter(p => p.syncStatus === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Synced:</span>
                    <span className="font-medium text-green-600">
                      {photos.filter(p => p.syncStatus === 'synced').length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Technical info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Technical Details</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• IndexedDB for offline storage</div>
                <div>• WebRTC for camera access</div>
                <div>• Canvas API for image processing</div>
                <div>• Service Worker for background sync</div>
                <div>• Progressive Web App features</div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            How to Test Offline Functionality
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Desktop Testing:</h4>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Open browser DevTools (F12)</li>
                <li>Go to Network tab</li>
                <li>Check "Offline" checkbox</li>
                <li>Take photos and see offline storage</li>
                <li>Uncheck "Offline" to test sync</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Mobile Testing:</h4>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>Turn on Airplane mode</li>
                <li>Take photos using camera</li>
                <li>Photos stored locally</li>
                <li>Turn off Airplane mode</li>
                <li>Photos sync automatically</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCaptureDemoPage;