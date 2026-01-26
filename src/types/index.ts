// Core types for the Ek Bharath Ek Mandi platform

export type Language = 
  | 'hindi' 
  | 'tamil' 
  | 'telugu' 
  | 'kannada' 
  | 'bengali' 
  | 'odia' 
  | 'malayalam' 
  | 'english';

export type UserType = 'vendor' | 'b2b_buyer' | 'b2c_buyer';

export type ProductCategory = 
  | 'agriculture' 
  | 'sericulture' 
  | 'fisheries' 
  | 'handicrafts' 
  | 'spices';

export interface User {
  id: string;
  name: string;
  phone: string;
  user_type: UserType;
  languages: Language[];
  location: {
    state: string;
    district: string;
    coordinates: [number, number];
  };
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  category: ProductCategory;
  subcategory: string;
  pricing: {
    wholesale?: {
      min_quantity: number;
      price: number;
    };
    retail: {
      price: number;
    };
  };
  images: string[];
  location: {
    state: string;
    coordinates: [number, number];
  };
  status: 'active' | 'inactive' | 'sold';
  created_at: string;
}

export interface Bid {
  id: string;
  product_id: string;
  buyer_id: string;
  buyer_type: 'B2B' | 'B2C';
  amount: number;
  quantity: number;
  message?: {
    original: string;
    translated: string;
  };
  voice_message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: {
    original_text: string;
    original_audio?: string;
    translated_text: string;
    translated_audio?: string;
  };
  source_lang: Language;
  target_lang: Language;
  read_status: boolean;
  created_at: string;
}

export interface TranslationResult {
  translatedAudio: Blob;
  sourceTranscript: string;
  targetTranscript: string;
  confidence: number;
}

// Voice recording types
export interface VoiceMessage {
  id: string;
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
  language: Language;
  transcript?: string;
  translation?: string;
  timestamp: Date;
  userId: string;
}

export interface VoiceRecordingConfig {
  maxDuration: number;
  sampleRate: number;
  bitRate: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface AudioProcessingResult {
  success: boolean;
  audioBlob?: Blob;
  transcript?: string;
  translation?: string;
  confidence?: number;
  error?: string;
}

// Photo capture types
export interface PhotoCapture {
  id: string;
  blob: Blob;
  url: string;
  thumbnail: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  format: string;
  quality: number;
  timestamp: Date;
  userId: string;
  productId?: string;
  category?: ProductCategory;
  metadata: PhotoMetadata;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  uploadKey?: string;
  uploadUrl?: string;
}

export interface PhotoMetadata {
  originalSize: number;
  compressionRatio: number;
  deviceInfo: {
    userAgent: string;
    platform: string;
    isMobile: boolean;
  };
  cameraInfo?: {
    facingMode: 'user' | 'environment';
    resolution: { width: number; height: number };
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  exifData?: Record<string, any>;
}

export interface PhotoCaptureConfig {
  maxPhotos: number;
  maxFileSize: number; // in bytes
  quality: number; // 0.1 to 1.0
  targetWidth: number;
  targetHeight: number;
  formats: string[];
  enableCompression: boolean;
  enableThumbnails: boolean;
  thumbnailSize: number;
  offlineStorage: boolean;
  autoSync: boolean;
}

export interface CameraConstraints {
  video: {
    facingMode: 'user' | 'environment';
    width?: { ideal: number; max: number };
    height?: { ideal: number; max: number };
    aspectRatio?: number;
  };
}

export interface PhotoProcessingResult {
  success: boolean;
  photo?: PhotoCapture;
  thumbnail?: string;
  error?: string;
  warnings?: string[];
}

export interface PhotoSyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: Array<{
    photoId: string;
    error: string;
  }>;
}

export interface PhotoGallery {
  photos: PhotoCapture[];
  totalSize: number;
  syncPending: number;
  lastSync: Date | null;
}

export interface PhotoUploadProgress {
  photoId: string;
  progress: number; // 0 to 100
  status: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface PriceInfo {
  product: string;
  current_price: number;
  trend: 'up' | 'down' | 'stable';
  markets: Array<{
    name: string;
    price: number;
    date: string;
  }>;
}