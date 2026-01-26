/**
 * Photo synchronization utilities
 * Handles background sync, retry mechanisms, and network-aware uploads
 */

import { PhotoCapture, PhotoSyncResult, PhotoUploadProgress } from '@/types';
import { ProductImageManager } from '@/lib/s3-utils';
import { 
  getPhotosBySyncStatus, 
  updatePhotoSyncStatus, 
  setMetadata, 
  getMetadata 
} from '@/lib/indexeddb-utils';

// Sync configuration
const SYNC_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  batchSize: 5,
  maxConcurrent: 2,
  networkTimeout: 30000, // 30 seconds
  minBatteryLevel: 0.2, // 20%
  wifiOnly: false
};

// Network quality thresholds
const NETWORK_QUALITY = {
  GOOD: 1000, // < 1s RTT
  FAIR: 3000, // < 3s RTT
  POOR: 5000  // < 5s RTT
};

interface SyncOptions {
  force?: boolean;
  wifiOnly?: boolean;
  maxRetries?: number;
  onProgress?: (progress: PhotoUploadProgress) => void;
}

class PhotoSyncManager {
  private syncInProgress = false;
  private uploadQueue: PhotoCapture[] = [];
  private activeUploads = new Map<string, AbortController>();
  private retryCount = new Map<string, number>();
  private progressCallbacks = new Set<(progress: PhotoUploadProgress) => void>();

  /**
   * Start background sync
   */
  async startSync(options: SyncOptions = {}): Promise<PhotoSyncResult> {
    if (this.syncInProgress && !options.force) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;
    
    try {
      // Check network conditions
      if (!await this.shouldSync(options)) {
        return {
          success: false,
          syncedCount: 0,
          failedCount: 0,
          errors: [{ photoId: '', error: 'Network conditions not suitable for sync' }]
        };
      }

      // Get pending photos
      const pendingPhotos = await getPhotosBySyncStatus('pending');
      const failedPhotos = await getPhotosBySyncStatus('failed');
      
      this.uploadQueue = [...pendingPhotos, ...failedPhotos];
      
      if (this.uploadQueue.length === 0) {
        return {
          success: true,
          syncedCount: 0,
          failedCount: 0,
          errors: []
        };
      }

      // Process uploads in batches
      const result = await this.processBatchUploads(options);
      
      // Update last sync time
      await setMetadata('lastSync', new Date().toISOString());
      
      return result;
    } finally {
      this.syncInProgress = false;
      this.uploadQueue = [];
      this.activeUploads.clear();
    }
  }

  /**
   * Process batch uploads
   */
  private async processBatchUploads(options: SyncOptions): Promise<PhotoSyncResult> {
    const results: PhotoSyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: []
    };

    // Process in batches to avoid overwhelming the network
    for (let i = 0; i < this.uploadQueue.length; i += SYNC_CONFIG.batchSize) {
      const batch = this.uploadQueue.slice(i, i + SYNC_CONFIG.batchSize);
      
      // Process batch with concurrency limit
      const batchPromises = batch.map(photo => 
        this.uploadPhoto(photo, options)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process results
      batchResults.forEach((result, index) => {
        const photo = batch[index];
        
        if (result.status === 'fulfilled' && result.value.success) {
          results.syncedCount++;
        } else {
          results.failedCount++;
          const error = result.status === 'rejected' 
            ? result.reason.message 
            : result.value.error || 'Unknown error';
          
          results.errors.push({
            photoId: photo.id,
            error
          });
        }
      });

      // Check if we should continue (network conditions, battery, etc.)
      if (!await this.shouldContinueSync()) {
        break;
      }

      // Small delay between batches
      if (i + SYNC_CONFIG.batchSize < this.uploadQueue.length) {
        await this.delay(500);
      }
    }

    results.success = results.failedCount === 0;
    return results;
  }

  /**
   * Upload single photo
   */
  private async uploadPhoto(
    photo: PhotoCapture, 
    options: SyncOptions
  ): Promise<{ success: boolean; error?: string }> {
    const maxRetries = options.maxRetries || SYNC_CONFIG.maxRetries;
    const currentRetries = this.retryCount.get(photo.id) || 0;

    if (currentRetries >= maxRetries) {
      await updatePhotoSyncStatus(photo.id, 'failed');
      return { success: false, error: 'Max retries exceeded' };
    }

    try {
      // Update status to syncing
      await updatePhotoSyncStatus(photo.id, 'syncing');
      
      // Notify progress
      this.notifyProgress({
        photoId: photo.id,
        progress: 0,
        status: 'preparing'
      });

      // Create abort controller for this upload
      const abortController = new AbortController();
      this.activeUploads.set(photo.id, abortController);

      // Convert blob to buffer for upload
      const arrayBuffer = await photo.blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Notify upload start
      this.notifyProgress({
        photoId: photo.id,
        progress: 10,
        status: 'uploading'
      });

      // Upload to S3
      const uploadResult = await ProductImageManager.uploadProductImage(
        photo.productId || 'general',
        buffer,
        photo.format,
        photo.filename
      );

      // Notify processing
      this.notifyProgress({
        photoId: photo.id,
        progress: 90,
        status: 'processing'
      });

      // Update photo with upload info
      await updatePhotoSyncStatus(
        photo.id, 
        'synced', 
        uploadResult.key, 
        uploadResult.url
      );

      // Notify completion
      this.notifyProgress({
        photoId: photo.id,
        progress: 100,
        status: 'complete'
      });

      // Reset retry count
      this.retryCount.delete(photo.id);
      
      return { success: true };
    } catch (error) {
      // Increment retry count
      this.retryCount.set(photo.id, currentRetries + 1);
      
      // Update status back to pending for retry
      await updatePhotoSyncStatus(photo.id, 'pending');
      
      // Notify error
      this.notifyProgress({
        photoId: photo.id,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    } finally {
      this.activeUploads.delete(photo.id);
    }
  }

  /**
   * Check if sync should proceed
   */
  private async shouldSync(options: SyncOptions): Promise<boolean> {
    // Check network connectivity
    if (!navigator.onLine) {
      return false;
    }

    // Check network quality
    const networkQuality = await this.getNetworkQuality();
    if (networkQuality === 'poor' && !options.force) {
      return false;
    }

    // Check WiFi requirement
    if ((options.wifiOnly || SYNC_CONFIG.wifiOnly) && !await this.isWiFiConnection()) {
      return false;
    }

    // Check battery level (if available)
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        if (battery.level < SYNC_CONFIG.minBatteryLevel && !battery.charging) {
          return false;
        }
      } catch (error) {
        // Battery API not available, continue
      }
    }

    return true;
  }

  /**
   * Check if sync should continue
   */
  private async shouldContinueSync(): Promise<boolean> {
    // Check network connectivity
    if (!navigator.onLine) {
      return false;
    }

    // Check if user is on a metered connection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.saveData) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get network quality
   */
  private async getNetworkQuality(): Promise<'good' | 'fair' | 'poor'> {
    try {
      const start = performance.now();
      
      // Simple network test - fetch a small resource
      await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const rtt = performance.now() - start;
      
      if (rtt < NETWORK_QUALITY.GOOD) return 'good';
      if (rtt < NETWORK_QUALITY.FAIR) return 'fair';
      return 'poor';
    } catch (error) {
      return 'poor';
    }
  }

  /**
   * Check if connection is WiFi
   */
  private async isWiFiConnection(): Promise<boolean> {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        return connection.type === 'wifi';
      }
    }
    
    // Fallback: assume WiFi if we can't determine
    return true;
  }

  /**
   * Cancel all active uploads
   */
  cancelAllUploads(): void {
    this.activeUploads.forEach(controller => {
      controller.abort();
    });
    this.activeUploads.clear();
    this.syncInProgress = false;
  }

  /**
   * Cancel specific upload
   */
  cancelUpload(photoId: string): void {
    const controller = this.activeUploads.get(photoId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(photoId);
    }
  }

  /**
   * Add progress callback
   */
  onProgress(callback: (progress: PhotoUploadProgress) => void): () => void {
    this.progressCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.progressCallbacks.delete(callback);
    };
  }

  /**
   * Notify progress to all callbacks
   */
  private notifyProgress(progress: PhotoUploadProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in progress callback:', error);
      }
    });
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<{
    inProgress: boolean;
    pendingCount: number;
    failedCount: number;
    lastSync: Date | null;
  }> {
    const [pendingPhotos, failedPhotos, lastSyncStr] = await Promise.all([
      getPhotosBySyncStatus('pending'),
      getPhotosBySyncStatus('failed'),
      getMetadata('lastSync')
    ]);

    return {
      inProgress: this.syncInProgress,
      pendingCount: pendingPhotos.length,
      failedCount: failedPhotos.length,
      lastSync: lastSyncStr ? new Date(lastSyncStr) : null
    };
  }

  /**
   * Retry failed uploads
   */
  async retryFailedUploads(options: SyncOptions = {}): Promise<PhotoSyncResult> {
    const failedPhotos = await getPhotosBySyncStatus('failed');
    
    // Reset retry counts for failed photos
    failedPhotos.forEach(photo => {
      this.retryCount.delete(photo.id);
    });

    // Update status back to pending
    await Promise.all(
      failedPhotos.map(photo => updatePhotoSyncStatus(photo.id, 'pending'))
    );

    return this.startSync(options);
  }

  /**
   * Schedule automatic sync
   */
  scheduleAutoSync(): void {
    // Sync when network comes online
    window.addEventListener('online', () => {
      setTimeout(() => {
        this.startSync({ wifiOnly: true }).catch(console.error);
      }, 2000); // Wait 2 seconds after coming online
    });

    // Periodic sync (every 5 minutes when online)
    setInterval(async () => {
      if (navigator.onLine && !this.syncInProgress) {
        try {
          await this.startSync({ wifiOnly: true });
        } catch (error) {
          console.error('Auto sync failed:', error);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
const photoSyncManager = new PhotoSyncManager();

// Auto-schedule sync when module loads
if (typeof window !== 'undefined') {
  photoSyncManager.scheduleAutoSync();
}

export default photoSyncManager;

// Convenience exports
export const startPhotoSync = (options?: SyncOptions) => photoSyncManager.startSync(options);
export const cancelAllUploads = () => photoSyncManager.cancelAllUploads();
export const cancelUpload = (photoId: string) => photoSyncManager.cancelUpload(photoId);
export const onSyncProgress = (callback: (progress: PhotoUploadProgress) => void) => 
  photoSyncManager.onProgress(callback);
export const getSyncStatus = () => photoSyncManager.getSyncStatus();
export const retryFailedUploads = (options?: SyncOptions) => 
  photoSyncManager.retryFailedUploads(options);