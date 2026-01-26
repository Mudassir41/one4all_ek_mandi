/**
 * Image processing utilities for photo capture
 * Handles compression, resizing, format conversion, and optimization
 */

import { PhotoCapture, PhotoMetadata, PhotoProcessingResult, PhotoCaptureConfig } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Default configuration
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

/**
 * Compress and resize image
 */
export async function compressImage(
  file: File | Blob,
  config: Partial<PhotoCaptureConfig> = {}
): Promise<{ blob: Blob; metadata: Partial<PhotoMetadata> }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width,
          img.height,
          finalConfig.targetWidth,
          finalConfig.targetHeight
        );

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const originalSize = file.size;
            const compressionRatio = blob.size / originalSize;

            const metadata: Partial<PhotoMetadata> = {
              originalSize,
              compressionRatio,
              deviceInfo: getDeviceInfo(),
            };

            resolve({ blob, metadata });
          },
          'image/jpeg',
          finalConfig.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Create object URL for the image
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(
  file: File | Blob,
  size: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate square thumbnail dimensions
        const minDimension = Math.min(img.width, img.height);
        const scale = size / minDimension;
        
        canvas.width = size;
        canvas.height = size;

        // Center crop for square thumbnail
        const sx = (img.width - minDimension) / 2;
        const sy = (img.height - minDimension) / 2;

        ctx.drawImage(
          img,
          sx, sy, minDimension, minDimension,
          0, 0, size, size
        );

        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnailDataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'));
    };

    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

/**
 * Process captured photo
 */
export async function processPhoto(
  file: File | Blob,
  userId: string,
  productId?: string,
  category?: string,
  config: Partial<PhotoCaptureConfig> = {}
): Promise<PhotoProcessingResult> {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Validate file size
    if (file.size > finalConfig.maxFileSize) {
      return {
        success: false,
        error: `File size (${formatFileSize(file.size)}) exceeds limit (${formatFileSize(finalConfig.maxFileSize)})`
      };
    }

    // Validate file type
    const fileType = file.type || 'image/jpeg';
    if (!finalConfig.formats.includes(fileType)) {
      return {
        success: false,
        error: `Unsupported file format: ${fileType}`
      };
    }

    // Compress image if enabled
    let processedBlob = file;
    let metadata: Partial<PhotoMetadata> = {
      deviceInfo: getDeviceInfo()
    };

    if (finalConfig.enableCompression) {
      const compressed = await compressImage(file, finalConfig);
      processedBlob = compressed.blob;
      metadata = { ...metadata, ...compressed.metadata };
    }

    // Generate thumbnail
    let thumbnail = '';
    if (finalConfig.enableThumbnails) {
      thumbnail = await generateThumbnail(processedBlob, finalConfig.thumbnailSize);
    }

    // Get image dimensions
    const dimensions = await getImageDimensions(processedBlob);

    // Create photo object
    const photo: PhotoCapture = {
      id: uuidv4(),
      blob: processedBlob,
      url: URL.createObjectURL(processedBlob),
      thumbnail,
      filename: generateFilename(fileType),
      size: processedBlob.size,
      width: dimensions.width,
      height: dimensions.height,
      format: fileType,
      quality: finalConfig.quality,
      timestamp: new Date(),
      userId,
      productId,
      category: category as any,
      metadata: metadata as PhotoMetadata,
      syncStatus: 'pending'
    };

    return {
      success: true,
      photo,
      thumbnail
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Convert image to different format
 */
export async function convertImageFormat(
  file: File | Blob,
  targetFormat: string,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image'));
            return;
          }
          resolve(blob);
        },
        targetFormat,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

/**
 * Calculate optimal dimensions maintaining aspect ratio
 */
export function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // Ensure all inputs are positive
  if (originalWidth <= 0 || originalHeight <= 0 || maxWidth <= 0 || maxHeight <= 0) {
    return { width: Math.max(1, maxWidth), height: Math.max(1, maxHeight) };
  }

  const aspectRatio = originalWidth / originalHeight;
  
  let newWidth = originalWidth;
  let newHeight = originalHeight;
  
  // Scale down if larger than max dimensions
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = newWidth / aspectRatio;
  }
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = newHeight * aspectRatio;
  }
  
  // Round to integers, ensuring minimum of 1
  newWidth = Math.max(1, Math.round(newWidth));
  newHeight = Math.max(1, Math.round(newHeight));
  
  // If rounding caused us to exceed limits, adjust while preserving aspect ratio as much as possible
  if (newWidth > maxWidth) {
    newWidth = maxWidth;
    newHeight = Math.max(1, Math.round(newWidth / aspectRatio));
  }
  
  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = Math.max(1, Math.round(newHeight * aspectRatio));
  }
  
  return {
    width: newWidth,
    height: newHeight
  };
}

/**
 * Generate unique filename
 */
export function generateFilename(mimeType: string): string {
  const extension = getFileExtension(mimeType);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `photo-${timestamp}.${extension}`;
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/tiff': 'tiff'
  };
  
  return extensions[mimeType] || 'jpg';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get device information
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  };
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  config: Partial<PhotoCaptureConfig> = {}
): { valid: boolean; error?: string } {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Check file type first (more specific error)
  if (!finalConfig.formats.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file format: ${file.type}`
    };
  }
  
  // Then check file size
  if (file.size > finalConfig.maxFileSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds limit (${formatFileSize(finalConfig.maxFileSize)})`
    };
  }
  
  return { valid: true };
}

/**
 * Create image from canvas
 */
export function canvasToBlob(canvas: HTMLCanvasElement, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Apply image filters for agricultural products
 */
export async function applyAgriculturalFilters(
  file: File | Blob,
  category: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Apply category-specific enhancements
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      switch (category) {
        case 'vegetables':
          // Enhance greens and natural colors
          enhanceVegetableColors(data);
          break;
        case 'fruits':
          // Enhance vibrant colors and freshness
          enhanceFruitColors(data);
          break;
        case 'spices':
          // Enhance warm tones and texture
          enhanceSpiceColors(data);
          break;
        default:
          // General enhancement
          enhanceGeneralColors(data);
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to apply filters'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

/**
 * Enhance vegetable colors
 */
function enhanceVegetableColors(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    // Enhance greens slightly
    if (data[i + 1] > data[i] && data[i + 1] > data[i + 2]) {
      data[i + 1] = Math.min(255, data[i + 1] * 1.1);
    }
    
    // Slight contrast enhancement
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.1 + 128));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.1 + 128));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.1 + 128));
  }
}

/**
 * Enhance fruit colors
 */
function enhanceFruitColors(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    // Enhance reds and yellows
    if (data[i] > 100 || data[i + 1] > 100) {
      data[i] = Math.min(255, data[i] * 1.05);
      data[i + 1] = Math.min(255, data[i + 1] * 1.05);
    }
    
    // Increase saturation slightly
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = Math.min(255, avg + (data[i] - avg) * 1.2);
    data[i + 1] = Math.min(255, avg + (data[i + 1] - avg) * 1.2);
    data[i + 2] = Math.min(255, avg + (data[i + 2] - avg) * 1.2);
  }
}

/**
 * Enhance spice colors
 */
function enhanceSpiceColors(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    // Enhance warm tones (reds, oranges, yellows)
    if (data[i] >= data[i + 1] && data[i + 1] >= data[i + 2]) {
      data[i] = Math.min(255, data[i] * 1.1);
      data[i + 1] = Math.min(255, data[i + 1] * 1.05);
    }
    
    // Slight sharpening effect
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (brightness > 128) {
      data[i] = Math.min(255, data[i] * 1.02);
      data[i + 1] = Math.min(255, data[i + 1] * 1.02);
      data[i + 2] = Math.min(255, data[i + 2] * 1.02);
    }
  }
}

/**
 * General color enhancement
 */
function enhanceGeneralColors(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    // Slight contrast and brightness adjustment
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.05 + 128));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.05 + 128));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.05 + 128));
  }
}

export default {
  compressImage,
  generateThumbnail,
  processPhoto,
  convertImageFormat,
  getImageDimensions,
  calculateDimensions,
  generateFilename,
  getFileExtension,
  formatFileSize,
  getDeviceInfo,
  validateImageFile,
  canvasToBlob,
  applyAgriculturalFilters
};