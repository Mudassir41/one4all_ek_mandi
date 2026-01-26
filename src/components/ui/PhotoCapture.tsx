'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  RotateCcw, 
  SwitchCamera, 
  Check, 
  X, 
  Upload,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  Battery,
  HardDrive
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePhotoCapture } from '@/hooks/usePhotoCapture';
import { PhotoCapture as PhotoCaptureType, PhotoCaptureConfig } from '@/types';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/image-utils';

interface PhotoCaptureProps {
  userId: string;
  productId?: string;
  category?: string;
  config?: Partial<PhotoCaptureConfig>;
  onPhotoCapture?: (photo: PhotoCaptureType) => void;
  onPhotosChange?: (photos: PhotoCaptureType[]) => void;
  onError?: (error: string) => void;
  className?: string;
  showGallery?: boolean;
  showUpload?: boolean;
  showGuides?: boolean;
  maxPhotos?: number;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  userId,
  productId,
  category = 'agriculture',
  config,
  onPhotoCapture,
  onPhotosChange,
  onError,
  className,
  showGallery = true,
  showUpload = true,
  showGuides = true,
  maxPhotos = 10
}) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'capture' | 'gallery' | 'guides'>('capture');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    // Camera state
    isSupported,
    hasPermission,
    isActive,
    currentCamera,
    availableCameras,
    
    // Capture state
    isCapturing,
    capturedPhoto,
    
    // Gallery state
    photos,
    gallery,
    
    // Sync state
    syncStatus,
    
    // Storage state
    storageUsage,
    
    // Actions
    requestPermission,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
    retakePhoto,
    savePhoto,
    deletePhotoById,
    loadPhotos,
    syncPhotos,
    uploadFiles,
    
    // Refs
    videoRef,
    canvasRef
  } = usePhotoCapture({
    userId,
    productId,
    category,
    config,
    onPhotoCapture,
    onError
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Notify parent of photos changes
  useEffect(() => {
    onPhotosChange?.(photos);
  }, [photos, onPhotosChange]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      await uploadFiles(files);
    } catch (error) {
      console.error('File upload failed:', error);
    }
    
    // Reset input
    event.target.value = '';
  };

  // Handle photo save
  const handleSavePhoto = async () => {
    if (!capturedPhoto) return;
    
    try {
      await savePhoto(capturedPhoto);
      retakePhoto();
    } catch (error) {
      console.error('Failed to save photo:', error);
    }
  };

  // Render camera not supported
  if (!isSupported) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg', className)}>
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('camera.cameraNotSupported')}
        </h3>
        <p className="text-gray-600 text-center">
          {t('camera.cameraError')}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      {/* Header with status indicators */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('camera.photoCapture')}
          </h2>
          
          {/* Online/Offline indicator */}
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-gray-600">
              {isOnline ? 'Online' : t('camera.offlineMode')}
            </span>
          </div>

          {/* Sync status */}
          {syncStatus.pendingCount > 0 && (
            <div className="flex items-center space-x-1">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-xs text-blue-600">
                {syncStatus.pendingCount} {t('camera.syncPending')}
              </span>
            </div>
          )}
        </div>

        {/* Storage usage */}
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <HardDrive className="w-4 h-4" />
          <span>
            {formatFileSize(storageUsage.used)} / {formatFileSize(storageUsage.quota)}
          </span>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setMode('capture')}
          className={cn(
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            mode === 'capture'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {t('camera.takePhoto')}
        </button>
        
        {showGallery && (
          <button
            onClick={() => setMode('gallery')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              mode === 'gallery'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {t('camera.photoGallery')} ({photos.length})
          </button>
        )}
        
        {showGuides && (
          <button
            onClick={() => setMode('guides')}
            className={cn(
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
              mode === 'guides'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {t('camera.qualityTips')}
          </button>
        )}
      </div>

      {/* Content based on mode */}
      {mode === 'capture' && (
        <CaptureMode
          isActive={isActive}
          hasPermission={hasPermission}
          isCapturing={isCapturing}
          capturedPhoto={capturedPhoto}
          currentCamera={currentCamera}
          availableCameras={availableCameras}
          videoRef={videoRef}
          canvasRef={canvasRef}
          onRequestPermission={requestPermission}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          onSwitchCamera={switchCamera}
          onCapturePhoto={capturePhoto}
          onRetakePhoto={retakePhoto}
          onSavePhoto={handleSavePhoto}
          showUpload={showUpload}
          onFileUpload={handleFileUpload}
          maxPhotos={maxPhotos}
          currentPhotoCount={photos.length}
        />
      )}

      {mode === 'gallery' && showGallery && (
        <GalleryMode
          photos={photos}
          gallery={gallery}
          syncStatus={syncStatus}
          onDeletePhoto={deletePhotoById}
          onSyncPhotos={syncPhotos}
          onRefresh={loadPhotos}
        />
      )}

      {mode === 'guides' && showGuides && (
        <GuidesMode category={category} />
      )}
    </div>
  );
};

// Capture Mode Component
interface CaptureModeProps {
  isActive: boolean;
  hasPermission: boolean;
  isCapturing: boolean;
  capturedPhoto: PhotoCaptureType | null;
  currentCamera: 'user' | 'environment';
  availableCameras: MediaDeviceInfo[];
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onRequestPermission: () => Promise<boolean>;
  onStartCamera: () => Promise<void>;
  onStopCamera: () => void;
  onSwitchCamera: () => Promise<void>;
  onCapturePhoto: () => Promise<PhotoCaptureType | null>;
  onRetakePhoto: () => void;
  onSavePhoto: () => Promise<void>;
  showUpload: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  maxPhotos: number;
  currentPhotoCount: number;
}

const CaptureMode: React.FC<CaptureModeProps> = ({
  isActive,
  hasPermission,
  isCapturing,
  capturedPhoto,
  currentCamera,
  availableCameras,
  videoRef,
  canvasRef,
  onRequestPermission,
  onStartCamera,
  onStopCamera,
  onSwitchCamera,
  onCapturePhoto,
  onRetakePhoto,
  onSavePhoto,
  showUpload,
  onFileUpload,
  maxPhotos,
  currentPhotoCount
}) => {
  const { t } = useTranslation();

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <Camera className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('camera.cameraPermission')}
        </h3>
        <p className="text-gray-600 text-center mb-4">
          {t('camera.allowCamera')}
        </p>
        <button
          onClick={onRequestPermission}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('camera.allowCamera')}
        </button>
      </div>
    );
  }

  if (capturedPhoto) {
    return (
      <div className="space-y-4">
        {/* Captured photo preview */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <img
            src={capturedPhoto.url}
            alt="Captured photo"
            className="w-full h-auto max-h-96 object-contain"
          />
        </div>

        {/* Photo actions */}
        <div className="flex space-x-4">
          <button
            onClick={onRetakePhoto}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t('camera.retakePhoto')}</span>
          </button>
          
          <button
            onClick={onSavePhoto}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Check className="w-5 h-5" />
            <span>{t('camera.usePhoto')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera viewfinder */}
      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Camera overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Grid lines */}
            <div className="absolute inset-4 border border-white/30">
              <div className="absolute top-1/3 left-0 right-0 border-t border-white/20" />
              <div className="absolute top-2/3 left-0 right-0 border-t border-white/20" />
              <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/20" />
              <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/20" />
            </div>
            
            {/* Center focus indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-16 h-16 border-2 border-white rounded-full opacity-50" />
            </div>
          </div>
        )}
        
        {/* Loading overlay */}
        {isCapturing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>{t('camera.processing')}</p>
            </div>
          </div>
        )}
        
        {/* Camera not active */}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={onStartCamera}
              className="flex flex-col items-center space-y-2 text-white"
            >
              <Camera className="w-16 h-16" />
              <span>{t('camera.takePhoto')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Camera controls */}
      {isActive && (
        <div className="flex items-center justify-between">
          {/* Switch camera */}
          {availableCameras.length > 1 && (
            <button
              onClick={onSwitchCamera}
              className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
              title={t('camera.switchCamera')}
            >
              <SwitchCamera className="w-6 h-6" />
            </button>
          )}
          
          {/* Capture button */}
          <button
            onClick={onCapturePhoto}
            disabled={isCapturing || currentPhotoCount >= maxPhotos}
            className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-full h-full bg-red-500 rounded-full" />
          </button>
          
          {/* Stop camera */}
          <button
            onClick={onStopCamera}
            className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Upload option */}
      {showUpload && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">{t('common.upload')}</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFileUpload}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              {t('products.addPhotos')}
            </label>
          </div>
        </div>
      )}

      {/* Photo count indicator */}
      {maxPhotos && (
        <div className="text-center text-sm text-gray-600">
          {currentPhotoCount} / {maxPhotos} {t('products.photos')}
          {currentPhotoCount >= maxPhotos && (
            <p className="text-red-600 mt-1">
              {t('camera.maxPhotosReached', { max: maxPhotos })}
            </p>
          )}
        </div>
      )}

      {/* Capture guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          {t('camera.captureGuide')}
        </p>
      </div>

      {/* Hidden canvas for photo processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// Gallery Mode Component
interface GalleryModeProps {
  photos: PhotoCaptureType[];
  gallery: any;
  syncStatus: any;
  onDeletePhoto: (id: string) => Promise<void>;
  onSyncPhotos: (force?: boolean) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const GalleryMode: React.FC<GalleryModeProps> = ({
  photos,
  gallery,
  syncStatus,
  onDeletePhoto,
  onSyncPhotos,
  onRefresh
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Gallery header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {t('camera.photoGallery')}
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onSyncPhotos(true)}
            disabled={syncStatus.inProgress}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {syncStatus.inProgress ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t('camera.syncComplete')
            )}
          </button>
          
          <button
            onClick={onRefresh}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {/* Photo grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={photo.thumbnail || photo.url}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Photo overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  onClick={() => onDeletePhoto(photo.id)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Sync status indicator */}
              <div className="absolute top-2 right-2">
                {photo.syncStatus === 'pending' && (
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" title="Pending sync" />
                )}
                {photo.syncStatus === 'syncing' && (
                  <Loader2 className="w-3 h-3 text-blue-500 animate-spin" title="Syncing" />
                )}
                {photo.syncStatus === 'synced' && (
                  <div className="w-3 h-3 bg-green-500 rounded-full" title="Synced" />
                )}
                {photo.syncStatus === 'failed' && (
                  <div className="w-3 h-3 bg-red-500 rounded-full" title="Sync failed" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t('search.noResults')}</p>
        </div>
      )}
    </div>
  );
};

// Guides Mode Component
interface GuidesModeProps {
  category: string;
}

const GuidesMode: React.FC<GuidesModeProps> = ({ category }) => {
  const { t } = useTranslation();

  const getGuideKey = (cat: string) => {
    const guides = ['agriculture', 'vegetables', 'fruits', 'spices'];
    return guides.includes(cat) ? cat : 'agriculture';
  };

  const guideKey = getGuideKey(category);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">
        {t(`photoGuides.${guideKey}.title`)}
      </h3>
      
      <div className="space-y-4">
        {t(`photoGuides.${guideKey}.tips`, { returnObjects: true }).map((tip: string, index: number) => (
          <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
              {index + 1}
            </div>
            <p className="text-green-800">{tip}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">{t('camera.qualityTips')}</h4>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• {t('camera.goodLighting')}</li>
          <li>• {t('camera.steadyHands')}</li>
          <li>• {t('camera.clearBackground')}</li>
          <li>• {t('camera.multipleAngles')}</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoCapture;