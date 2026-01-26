/**
 * Photo capture hook
 * Provides comprehensive photo capture functionality with offline support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  PhotoCapture, 
  PhotoCaptureConfig, 
  PhotoProcessingResult, 
  CameraConstraints,
  PhotoUploadProgress,
  PhotoGallery
} from '@/types';
import { processPhoto, validateImageFile } from '@/lib/image-utils';
import { 
  storePhoto, 
  getUserPhotos, 
  deletePhoto, 
  getPhotoGallery,
  getStorageUsage 
} from '@/lib/indexeddb-utils';
import { startPhotoSync, onSyncProgress, getSyncStatus } from '@/lib/photo-sync';

interface UsePhotoCaptureOptions {
  userId: string;
  productId?: string;
  category?: string;
  config?: Partial<PhotoCaptureConfig>;
  onPhotoCapture?: (photo: PhotoCapture) => void;
  onError?: (error: string) => void;
  onSyncProgress?: (progress: PhotoUploadProgress) => void;
}

interface UsePhotoCaptureReturn {
  // Camera state
  isSupported: boolean;
  hasPermission: boolean;
  isActive: boolean;
  currentCamera: 'user' | 'environment';
  availableCameras: MediaDeviceInfo[];
  
  // Capture state
  isCapturing: boolean;
  capturedPhoto: PhotoCapture | null;
  
  // Gallery state
  photos: PhotoCapture[];
  gallery: PhotoGallery | null;
  
  // Sync state
  syncStatus: {
    inProgress: boolean;
    pendingCount: number;
    failedCount: number;
    lastSync: Date | null;
  };
  
  // Storage state
  storageUsage: {
    used: number;
    available: number;
    quota: number;
  };
  
  // Actions
  requestPermission: () => Promise<boolean>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  capturePhoto: () => Promise<PhotoCapture | null>;
  retakePhoto: () => void;
  savePhoto: (photo: PhotoCapture) => Promise<void>;
  deletePhotoById: (id: string) => Promise<void>;
  loadPhotos: () => Promise<void>;
  syncPhotos: (force?: boolean) => Promise<void>;
  
  // File upload
  uploadFiles: (files: FileList) => Promise<PhotoCapture[]>;
  
  // Refs
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const DEFAULT_CONFIG: PhotoCaptureConfig = {
  maxPhotos: 10,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  quality: 0.8,
  targetWidth: 1200,
  targetHeight: 1200,
  formats: ['image/jpeg', 'image/png', 'image/webp'],
  enableCompression: true,
  enableThumbnails: true,
  thumbnailSize: 200,
  offlineStorage: true,
  autoSync: true
};

export function usePhotoCapture(options: UsePhotoCaptureOptions): UsePhotoCaptureReturn {
  const {
    userId,
    productId,
    category,
    config = {},
    onPhotoCapture,
    onError,
    onSyncProgress
  } = options;

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Camera state
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentCamera, setCurrentCamera] = useState<'user' | 'environment'>('environment');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  
  // Capture state
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoCapture | null>(null);
  
  // Gallery state
  const [photos, setPhotos] = useState<PhotoCapture[]>([]);
  const [gallery, setGallery] = useState<PhotoGallery | null>(null);
  
  // Sync state
  const [syncStatus, setSyncStatus] = useState({
    inProgress: false,
    pendingCount: 0,
    failedCount: 0,
    lastSync: null as Date | null
  });
  
  // Storage state
  const [storageUsage, setStorageUsage] = useState({
    used: 0,
    available: 0,
    quota: 0
  });

  // Check camera support
  useEffect(() => {
    const checkSupport = () => {
      const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      setIsSupported(supported);
    };
    
    checkSupport();
  }, []);

  // Load available cameras
  useEffect(() => {
    const loadCameras = async () => {
      if (!isSupported) return;
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(cameras);
      } catch (error) {
        console.error('Failed to enumerate cameras:', error);
      }
    };
    
    loadCameras();
  }, [isSupported]);

  // Load photos on mount
  useEffect(() => {
    loadPhotos();
    updateSyncStatus();
    updateStorageUsage();
  }, [userId]);

  // Setup sync progress listener
  useEffect(() => {
    if (!onSyncProgress) return;
    
    const unsubscribe = onSyncProgress(onSyncProgress);
    return unsubscribe;
  }, [onSyncProgress]);

  // Request camera permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      onError?.('Camera not supported on this device');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentCamera }
      });
      
      // Stop the stream immediately, we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      onError?.('Camera permission denied. Please allow camera access.');
      setHasPermission(false);
      return false;
    }
  }, [isSupported, currentCamera, onError]);

  // Start camera
  const startCamera = useCallback(async (): Promise<void> => {
    if (!isSupported || !hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      const constraints: CameraConstraints = {
        video: {
          facingMode: currentCamera,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          aspectRatio: 16/9
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsActive(true);
    } catch (error) {
      console.error('Failed to start camera:', error);
      onError?.('Failed to start camera. Please check your camera permissions.');
    }
  }, [isSupported, hasPermission, currentCamera, requestPermission, onError]);

  // Stop camera
  const stopCamera = useCallback((): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
  }, []);

  // Switch camera
  const switchCamera = useCallback(async (): Promise<void> => {
    const newCamera = currentCamera === 'user' ? 'environment' : 'user';
    setCurrentCamera(newCamera);
    
    if (isActive) {
      stopCamera();
      // Small delay to ensure camera is released
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  }, [currentCamera, isActive, stopCamera, startCamera]);

  // Capture photo
  const capturePhoto = useCallback(async (): Promise<PhotoCapture | null> => {
    if (!videoRef.current || !canvasRef.current || !isActive) {
      onError?.('Camera not ready');
      return null;
    }

    setIsCapturing(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }
            resolve(blob);
          },
          'image/jpeg',
          finalConfig.quality
        );
      });

      // Process the photo
      const result = await processPhoto(blob, userId, productId, category, finalConfig);
      
      if (!result.success || !result.photo) {
        throw new Error(result.error || 'Failed to process photo');
      }

      setCapturedPhoto(result.photo);
      onPhotoCapture?.(result.photo);
      
      return result.photo;
    } catch (error) {
      console.error('Failed to capture photo:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to capture photo');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isActive, userId, productId, category, finalConfig, onPhotoCapture, onError]);

  // Retake photo
  const retakePhoto = useCallback((): void => {
    setCapturedPhoto(null);
  }, []);

  // Save photo
  const savePhoto = useCallback(async (photo: PhotoCapture): Promise<void> => {
    try {
      await storePhoto(photo);
      await loadPhotos();
      
      // Auto-sync if enabled
      if (finalConfig.autoSync && navigator.onLine) {
        syncPhotos().catch(console.error);
      }
    } catch (error) {
      console.error('Failed to save photo:', error);
      onError?.('Failed to save photo');
    }
  }, [finalConfig.autoSync, onError]);

  // Delete photo
  const deletePhotoById = useCallback(async (id: string): Promise<void> => {
    try {
      await deletePhoto(id);
      await loadPhotos();
    } catch (error) {
      console.error('Failed to delete photo:', error);
      onError?.('Failed to delete photo');
    }
  }, [onError]);

  // Load photos
  const loadPhotos = useCallback(async (): Promise<void> => {
    try {
      const [userPhotos, photoGallery] = await Promise.all([
        getUserPhotos(userId),
        getPhotoGallery(userId)
      ]);
      
      setPhotos(userPhotos);
      setGallery(photoGallery);
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  }, [userId]);

  // Sync photos
  const syncPhotos = useCallback(async (force = false): Promise<void> => {
    try {
      await startPhotoSync({ force });
      await updateSyncStatus();
    } catch (error) {
      console.error('Failed to sync photos:', error);
      onError?.('Failed to sync photos');
    }
  }, [onError]);

  // Upload files
  const uploadFiles = useCallback(async (files: FileList): Promise<PhotoCapture[]> => {
    const results: PhotoCapture[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file
      const validation = validateImageFile(file, finalConfig);
      if (!validation.valid) {
        onError?.(validation.error || 'Invalid file');
        continue;
      }

      try {
        // Process the file
        const result = await processPhoto(file, userId, productId, category, finalConfig);
        
        if (result.success && result.photo) {
          await storePhoto(result.photo);
          results.push(result.photo);
        } else {
          onError?.(result.error || 'Failed to process file');
        }
      } catch (error) {
        console.error('Failed to upload file:', error);
        onError?.(error instanceof Error ? error.message : 'Failed to upload file');
      }
    }
    
    if (results.length > 0) {
      await loadPhotos();
      
      // Auto-sync if enabled
      if (finalConfig.autoSync && navigator.onLine) {
        syncPhotos().catch(console.error);
      }
    }
    
    return results;
  }, [userId, productId, category, finalConfig, onError, loadPhotos, syncPhotos]);

  // Update sync status
  const updateSyncStatus = useCallback(async (): Promise<void> => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }
  }, []);

  // Update storage usage
  const updateStorageUsage = useCallback(async (): Promise<void> => {
    try {
      const usage = await getStorageUsage();
      setStorageUsage(usage);
    } catch (error) {
      console.error('Failed to get storage usage:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
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
    
    // File upload
    uploadFiles,
    
    // Refs
    videoRef,
    canvasRef
  };
}