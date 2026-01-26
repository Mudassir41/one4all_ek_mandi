/**
 * S3 Utilities for Ek Bharath Ek Mandi
 * Provides secure and optimized S3 operations for media and voice files
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

// Bucket names from environment variables
const MEDIA_BUCKET = process.env.MEDIA_BUCKET_NAME || '';
const VOICE_BUCKET = process.env.VOICE_BUCKET_NAME || '';

// File type configurations
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
  size?: number;
  contentType?: string;
}

export interface PreSignedUrlOptions {
  expiresIn?: number;
  contentType?: string;
  contentLength?: number;
}

/**
 * Generate a pre-signed URL for secure file uploads
 */
export async function generateUploadUrl(
  fileType: 'image' | 'audio',
  fileName: string,
  contentType: string,
  options: PreSignedUrlOptions = {}
): Promise<{ uploadUrl: string; key: string }> {
  // Validate file type
  if (fileType === 'image' && !ALLOWED_IMAGE_TYPES.includes(contentType)) {
    throw new Error(`Invalid image type: ${contentType}`);
  }
  if (fileType === 'audio' && !ALLOWED_AUDIO_TYPES.includes(contentType)) {
    throw new Error(`Invalid audio type: ${contentType}`);
  }

  // Generate unique key
  const fileExtension = getFileExtension(contentType);
  const uniqueId = uuidv4();
  const key = `uploads/${fileType}s/${uniqueId}/${fileName}.${fileExtension}`;

  // Select appropriate bucket
  const bucket = fileType === 'image' ? MEDIA_BUCKET : VOICE_BUCKET;

  // Create pre-signed URL
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: options.contentLength,
    Metadata: {
      uploadedAt: new Date().toISOString(),
      fileType: fileType,
    },
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: options.expiresIn || 3600, // 1 hour default
  });

  return { uploadUrl, key };
}

/**
 * Generate a pre-signed URL for secure file downloads
 */
export async function generateDownloadUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Upload a file directly to S3 (server-side)
 */
export async function uploadFile(
  fileType: 'image' | 'audio',
  fileName: string,
  fileBuffer: Buffer,
  contentType: string,
  metadata: Record<string, string> = {}
): Promise<UploadResult> {
  // Validate file size
  const maxSize = fileType === 'image' ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE;
  if (fileBuffer.length > maxSize) {
    throw new Error(`File too large: ${fileBuffer.length} bytes (max: ${maxSize})`);
  }

  // Generate unique key
  const fileExtension = getFileExtension(contentType);
  const uniqueId = uuidv4();
  const key = `uploads/${fileType}s/${uniqueId}/${fileName}.${fileExtension}`;

  // Select appropriate bucket
  const bucket = fileType === 'image' ? MEDIA_BUCKET : VOICE_BUCKET;

  // Upload file
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    Metadata: {
      ...metadata,
      uploadedAt: new Date().toISOString(),
      fileType: fileType,
      originalName: fileName,
    },
  });

  await s3Client.send(command);

  return {
    key,
    url: `https://${bucket}.s3.amazonaws.com/${key}`,
    bucket,
    size: fileBuffer.length,
    contentType,
  };
}

/**
 * Delete a file from S3
 */
export async function deleteFile(bucket: string, key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Check if a file exists in S3
 */
export async function fileExists(bucket: string, key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(bucket: string, key: string) {
  const command = new HeadObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3Client.send(command);
  return {
    size: response.ContentLength,
    contentType: response.ContentType,
    lastModified: response.LastModified,
    metadata: response.Metadata,
    etag: response.ETag,
  };
}

/**
 * Product image upload utilities
 */
export class ProductImageManager {
  /**
   * Upload product image with automatic optimization
   */
  static async uploadProductImage(
    productId: string,
    imageBuffer: Buffer,
    contentType: string,
    originalName: string
  ): Promise<UploadResult> {
    const key = `uploads/products/${productId}/original/${uuidv4()}.${getFileExtension(contentType)}`;
    
    const command = new PutObjectCommand({
      Bucket: MEDIA_BUCKET,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
      Metadata: {
        productId,
        originalName,
        uploadedAt: new Date().toISOString(),
        imageType: 'original',
      },
    });

    await s3Client.send(command);

    return {
      key,
      url: `https://${MEDIA_BUCKET}.s3.amazonaws.com/${key}`,
      bucket: MEDIA_BUCKET,
      size: imageBuffer.length,
      contentType,
    };
  }

  /**
   * Generate pre-signed URL for product image upload
   */
  static async generateProductImageUploadUrl(
    productId: string,
    contentType: string,
    contentLength: number
  ): Promise<{ uploadUrl: string; key: string }> {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      throw new Error(`Invalid image type: ${contentType}`);
    }

    const key = `uploads/products/${productId}/original/${uuidv4()}.${getFileExtension(contentType)}`;
    
    const command = new PutObjectCommand({
      Bucket: MEDIA_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
      Metadata: {
        productId,
        uploadedAt: new Date().toISOString(),
        imageType: 'original',
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return { uploadUrl, key };
  }
}

/**
 * Voice message utilities
 */
export class VoiceMessageManager {
  /**
   * Upload voice message
   */
  static async uploadVoiceMessage(
    conversationId: string,
    messageId: string,
    audioBuffer: Buffer,
    contentType: string,
    metadata: Record<string, string> = {}
  ): Promise<UploadResult> {
    if (audioBuffer.length > MAX_AUDIO_SIZE) {
      throw new Error(`Audio file too large: ${audioBuffer.length} bytes`);
    }

    const key = `recordings/${conversationId}/${messageId}/original.${getFileExtension(contentType)}`;
    
    const command = new PutObjectCommand({
      Bucket: VOICE_BUCKET,
      Key: key,
      Body: audioBuffer,
      ContentType: contentType,
      Metadata: {
        ...metadata,
        conversationId,
        messageId,
        uploadedAt: new Date().toISOString(),
        audioType: 'original',
      },
    });

    await s3Client.send(command);

    return {
      key,
      url: `https://${VOICE_BUCKET}.s3.amazonaws.com/${key}`,
      bucket: VOICE_BUCKET,
      size: audioBuffer.length,
      contentType,
    };
  }

  /**
   * Upload processed/translated voice message
   */
  static async uploadProcessedVoice(
    conversationId: string,
    messageId: string,
    audioBuffer: Buffer,
    contentType: string,
    processType: 'translated' | 'transcribed',
    metadata: Record<string, string> = {}
  ): Promise<UploadResult> {
    const key = `recordings/${conversationId}/${messageId}/${processType}.${getFileExtension(contentType)}`;
    
    const command = new PutObjectCommand({
      Bucket: VOICE_BUCKET,
      Key: key,
      Body: audioBuffer,
      ContentType: contentType,
      Metadata: {
        ...metadata,
        conversationId,
        messageId,
        processType,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    return {
      key,
      url: `https://${VOICE_BUCKET}.s3.amazonaws.com/${key}`,
      bucket: VOICE_BUCKET,
      size: audioBuffer.length,
      contentType,
    };
  }

  /**
   * Generate pre-signed URL for voice message upload
   */
  static async generateVoiceUploadUrl(
    conversationId: string,
    messageId: string,
    contentType: string,
    contentLength: number
  ): Promise<{ uploadUrl: string; key: string }> {
    if (!ALLOWED_AUDIO_TYPES.includes(contentType)) {
      throw new Error(`Invalid audio type: ${contentType}`);
    }

    if (contentLength > MAX_AUDIO_SIZE) {
      throw new Error(`Audio file too large: ${contentLength} bytes`);
    }

    const key = `recordings/${conversationId}/${messageId}/original.${getFileExtension(contentType)}`;
    
    const command = new PutObjectCommand({
      Bucket: VOICE_BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
      Metadata: {
        conversationId,
        messageId,
        uploadedAt: new Date().toISOString(),
        audioType: 'original',
      },
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 1800 }); // 30 minutes

    return { uploadUrl, key };
  }
}

/**
 * Utility functions
 */
function getFileExtension(contentType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/mp4': 'm4a',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
  };

  return extensions[contentType] || 'bin';
}

/**
 * Validate file type and size
 */
export function validateFile(
  fileType: 'image' | 'audio',
  contentType: string,
  size: number
): { valid: boolean; error?: string } {
  // Check content type
  const allowedTypes = fileType === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_AUDIO_TYPES;
  if (!allowedTypes.includes(contentType)) {
    return { valid: false, error: `Invalid ${fileType} type: ${contentType}` };
  }

  // Check file size
  const maxSize = fileType === 'image' ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE;
  if (size > maxSize) {
    return { valid: false, error: `File too large: ${size} bytes (max: ${maxSize})` };
  }

  return { valid: true };
}

/**
 * Get bucket name by type
 */
export function getBucketName(type: 'media' | 'voice'): string {
  return type === 'media' ? MEDIA_BUCKET : VOICE_BUCKET;
}

export default {
  generateUploadUrl,
  generateDownloadUrl,
  uploadFile,
  deleteFile,
  fileExists,
  getFileMetadata,
  ProductImageManager,
  VoiceMessageManager,
  validateFile,
  getBucketName,
};