/**
 * IndexedDB utilities for offline-first photo storage
 * Provides robust offline storage with sync capabilities
 */

import { PhotoCapture, PhotoGallery, PhotoSyncResult } from '@/types';

const DB_NAME = 'EkBharathEkMandi';
const DB_VERSION = 1;
const PHOTOS_STORE = 'photos';
const METADATA_STORE = 'metadata';

interface DBSchema {
  photos: {
    key: string;
    value: PhotoCapture;
    indexes: {
      'by-timestamp': Date;
      'by-sync-status': string;
      'by-product-id': string;
      'by-user-id': string;
    };
  };
  metadata: {
    key: string;
    value: any;
  };
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create photos store
        if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
          const photosStore = db.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
          photosStore.createIndex('by-timestamp', 'timestamp');
          photosStore.createIndex('by-sync-status', 'syncStatus');
          photosStore.createIndex('by-product-id', 'productId');
          photosStore.createIndex('by-user-id', 'userId');
        }

        // Create metadata store
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Store photo in IndexedDB
   */
  async storePhoto(photo: PhotoCapture): Promise<void> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTOS_STORE);
      
      const request = store.put(photo);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store photo'));
    });
  }

  /**
   * Get photo by ID
   */
  async getPhoto(id: string): Promise<PhotoCapture | null> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      
      const request = store.get(id);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(new Error('Failed to get photo'));
    });
  }

  /**
   * Get all photos for a user
   */
  async getUserPhotos(userId: string): Promise<PhotoCapture[]> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const index = store.index('by-user-id');
      
      const request = index.getAll(userId);
      
      request.onsuccess = () => {
        const photos = request.result || [];
        // Sort by timestamp descending
        photos.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        resolve(photos);
      };
      request.onerror = () => reject(new Error('Failed to get user photos'));
    });
  }

  /**
   * Get photos by sync status
   */
  async getPhotosBySyncStatus(status: string): Promise<PhotoCapture[]> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const index = store.index('by-sync-status');
      
      const request = index.getAll(status);
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(new Error('Failed to get photos by sync status'));
    });
  }

  /**
   * Get photos for a product
   */
  async getProductPhotos(productId: string): Promise<PhotoCapture[]> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readonly');
      const store = transaction.objectStore(PHOTOS_STORE);
      const index = store.index('by-product-id');
      
      const request = index.getAll(productId);
      
      request.onsuccess = () => {
        const photos = request.result || [];
        photos.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        resolve(photos);
      };
      request.onerror = () => reject(new Error('Failed to get product photos'));
    });
  }

  /**
   * Update photo sync status
   */
  async updatePhotoSyncStatus(
    id: string, 
    status: PhotoCapture['syncStatus'],
    uploadKey?: string,
    uploadUrl?: string
  ): Promise<void> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTOS_STORE);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const photo = getRequest.result;
        if (!photo) {
          reject(new Error('Photo not found'));
          return;
        }

        photo.syncStatus = status;
        if (uploadKey) photo.uploadKey = uploadKey;
        if (uploadUrl) photo.uploadUrl = uploadUrl;

        const putRequest = store.put(photo);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to update photo'));
      };
      
      getRequest.onerror = () => reject(new Error('Failed to get photo for update'));
    });
  }

  /**
   * Delete photo
   */
  async deletePhoto(id: string): Promise<void> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([PHOTOS_STORE], 'readwrite');
      const store = transaction.objectStore(PHOTOS_STORE);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete photo'));
    });
  }

  /**
   * Get photo gallery summary
   */
  async getPhotoGallery(userId: string): Promise<PhotoGallery> {
    const photos = await this.getUserPhotos(userId);
    const pendingPhotos = photos.filter(p => p.syncStatus === 'pending' || p.syncStatus === 'failed');
    
    const totalSize = photos.reduce((sum, photo) => sum + photo.size, 0);
    const lastSync = await this.getMetadata('lastSync');

    return {
      photos,
      totalSize,
      syncPending: pendingPhotos.length,
      lastSync: lastSync ? new Date(lastSync) : null
    };
  }

  /**
   * Clear all photos for a user
   */
  async clearUserPhotos(userId: string): Promise<void> {
    const photos = await this.getUserPhotos(userId);
    
    for (const photo of photos) {
      await this.deletePhoto(photo.id);
    }
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{ used: number; available: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
        quota: estimate.quota || 0
      };
    }

    // Fallback for browsers without storage API
    return {
      used: 0,
      available: 50 * 1024 * 1024, // 50MB fallback
      quota: 50 * 1024 * 1024
    };
  }

  /**
   * Store metadata
   */
  async setMetadata(key: string, value: any): Promise<void> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readwrite');
      const store = transaction.objectStore(METADATA_STORE);
      
      const request = store.put({ key, value, timestamp: new Date() });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store metadata'));
    });
  }

  /**
   * Get metadata
   */
  async getMetadata(key: string): Promise<any> {
    const db = await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(new Error('Failed to get metadata'));
    });
  }

  /**
   * Cleanup old photos (keep only last N photos per user)
   */
  async cleanupOldPhotos(userId: string, keepCount: number = 100): Promise<number> {
    const photos = await this.getUserPhotos(userId);
    
    if (photos.length <= keepCount) {
      return 0;
    }

    const photosToDelete = photos.slice(keepCount);
    let deletedCount = 0;

    for (const photo of photosToDelete) {
      try {
        await this.deletePhoto(photo.id);
        deletedCount++;
      } catch (error) {
        console.error('Failed to delete old photo:', error);
      }
    }

    return deletedCount;
  }

  /**
   * Export photos for backup
   */
  async exportPhotos(userId: string): Promise<Blob> {
    const photos = await this.getUserPhotos(userId);
    const exportData = {
      version: 1,
      timestamp: new Date().toISOString(),
      userId,
      photos: photos.map(photo => ({
        ...photo,
        // Convert blob to base64 for export
        blob: undefined, // Will be handled separately
        url: undefined
      }))
    };

    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}

// Singleton instance
const indexedDBManager = new IndexedDBManager();

export default indexedDBManager;

// Convenience functions
export const storePhoto = (photo: PhotoCapture) => indexedDBManager.storePhoto(photo);
export const getPhoto = (id: string) => indexedDBManager.getPhoto(id);
export const getUserPhotos = (userId: string) => indexedDBManager.getUserPhotos(userId);
export const getPhotosBySyncStatus = (status: string) => indexedDBManager.getPhotosBySyncStatus(status);
export const getProductPhotos = (productId: string) => indexedDBManager.getProductPhotos(productId);
export const updatePhotoSyncStatus = (id: string, status: PhotoCapture['syncStatus'], uploadKey?: string, uploadUrl?: string) => 
  indexedDBManager.updatePhotoSyncStatus(id, status, uploadKey, uploadUrl);
export const deletePhoto = (id: string) => indexedDBManager.deletePhoto(id);
export const getPhotoGallery = (userId: string) => indexedDBManager.getPhotoGallery(userId);
export const clearUserPhotos = (userId: string) => indexedDBManager.clearUserPhotos(userId);
export const getStorageUsage = () => indexedDBManager.getStorageUsage();
export const setMetadata = (key: string, value: any) => indexedDBManager.setMetadata(key, value);
export const getMetadata = (key: string) => indexedDBManager.getMetadata(key);
export const cleanupOldPhotos = (userId: string, keepCount?: number) => indexedDBManager.cleanupOldPhotos(userId, keepCount);
export const exportPhotos = (userId: string) => indexedDBManager.exportPhotos(userId);