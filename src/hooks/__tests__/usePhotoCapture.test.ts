/**
 * Tests for usePhotoCapture hook
 */

import { renderHook, act } from '@testing-library/react';
import { usePhotoCapture } from '../usePhotoCapture';

// Mock dependencies
jest.mock('../../lib/image-utils', () => ({
  processPhoto: jest.fn(),
  validateImageFile: jest.fn(() => ({ valid: true })),
  formatFileSize: jest.fn((size) => `${size} bytes`)
}));

jest.mock('../../lib/indexeddb-utils', () => ({
  storePhoto: jest.fn(),
  getUserPhotos: jest.fn(() => Promise.resolve([])),
  deletePhoto: jest.fn(),
  getPhotoGallery: jest.fn(() => Promise.resolve({
    photos: [],
    totalSize: 0,
    syncPending: 0,
    lastSync: null
  })),
  getStorageUsage: jest.fn(() => Promise.resolve({
    used: 0,
    available: 1000000,
    quota: 1000000
  }))
}));

jest.mock('../../lib/photo-sync', () => ({
  startPhotoSync: jest.fn(),
  getSyncStatus: jest.fn(() => Promise.resolve({
    inProgress: false,
    pendingCount: 0,
    failedCount: 0,
    lastSync: null
  })),
  onSyncProgress: jest.fn(() => () => {})
}));

// Mock MediaDevices API
const mockGetUserMedia = jest.fn();
const mockEnumerateDevices = jest.fn();

Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
    enumerateDevices: mockEnumerateDevices
  }
});

describe('usePhotoCapture', () => {
  const defaultOptions = {
    userId: 'test-user',
    productId: 'test-product',
    category: 'vegetables'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEnumerateDevices.mockResolvedValue([
      { kind: 'videoinput', deviceId: 'camera1', label: 'Front Camera' },
      { kind: 'videoinput', deviceId: 'camera2', label: 'Back Camera' }
    ]);
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => usePhotoCapture(defaultOptions));

    expect(result.current.isSupported).toBe(true);
    expect(result.current.hasPermission).toBe(false);
    expect(result.current.isActive).toBe(false);
    expect(result.current.currentCamera).toBe('environment');
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.capturedPhoto).toBe(null);
    expect(result.current.photos).toEqual([]);
  });

  it('should detect camera support', () => {
    const { result } = renderHook(() => usePhotoCapture(defaultOptions));
    expect(result.current.isSupported).toBe(true);
  });

  it('should handle camera permission request', async () => {
    const mockStream = {
      getTracks: jest.fn(() => [{ stop: jest.fn() }])
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => usePhotoCapture(defaultOptions));

    await act(async () => {
      const granted = await result.current.requestPermission();
      expect(granted).toBe(true);
    });

    expect(result.current.hasPermission).toBe(true);
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: { facingMode: 'environment' }
    });
  });

  it('should handle camera permission denial', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

    const { result } = renderHook(() => usePhotoCapture(defaultOptions));

    await act(async () => {
      const granted = await result.current.requestPermission();
      expect(granted).toBe(false);
    });

    expect(result.current.hasPermission).toBe(false);
  });

  it('should start camera successfully', async () => {
    const mockStream = {
      getTracks: jest.fn(() => [{ stop: jest.fn() }])
    };
    mockGetUserMedia.mockResolvedValue(mockStream);

    const { result } = renderHook(() => usePhotoCapture(defaultOptions));

    // Mock video element
    const mockVideo = {
      srcObject: null,
      play: jest.fn().mockResolvedValue(undefined)
    };
    result.current.videoRef.current = mockVideo as any;

    await act(async () => {
      await result.current.startCamera();
    });

    expect(result.current.isActive).toBe(true);
    expect(mockVideo.srcObject).toBe(mockStream);
    expect(mockVideo.play).toHaveBeenCalled();
  });

  it('should stop camera', () => {
    const mockTrack = { stop: jest.fn() };
    const mockStream = {
      getTracks: jest.fn(() => [mockTrack])
    };

    const { result } = renderHook(() => usePhotoCapture(defaultOptions));

    // Set up active camera state
    act(() => {
      (result.current as any).streamRef.current = mockStream;
      result.current.videoRef.current = { srcObject: mockStream } as any;
    });

    act(() => {
      result.current.stopCamera();
    });

    expect(result.current.isActive).toBe(false);
    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it('should switch camera', async () => {
    const { result } = renderHook(() => usePhotoCapture(defaultOptions));

    expect(result.current.currentCamera).toBe('environment');

    await act(async () => {
      await result.current.switchCamera();
    });

    expect(result.current.currentCamera).toBe('user');
  });

  it('should handle file upload', async () => {
    const { processPhoto } = require('../../lib/image-utils');
    const { storePhoto } = require('../../lib/indexeddb-utils');

    const mockPhoto = {
      id: 'photo-1',
      blob: new Blob(['test'], { type: 'image/jpeg' }),
      url: 'mock-url',
      size: 1024
    };

    processPhoto.mockResolvedValue({
      success: true,
      photo: mockPhoto
    });

    const { result } = renderHook(() => usePhotoCapture(defaultOptions));

    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockFileList = {
      length: 1,
      0: mockFile,
      [Symbol.iterator]: function* () { yield mockFile; }
    } as FileList;

    await act(async () => {
      const photos = await result.current.uploadFiles(mockFileList);
      expect(photos).toHaveLength(1);
      expect(photos[0]).toBe(mockPhoto);
    });

    expect(processPhoto).toHaveBeenCalledWith(
      mockFile,
      'test-user',
      'test-product',
      'vegetables',
      expect.any(Object)
    );
    expect(storePhoto).toHaveBeenCalledWith(mockPhoto);
  });

  it('should handle photo deletion', async () => {
    const { deletePhoto } = require('../../lib/indexeddb-utils');
    const { result } = renderHook(() => usePhotoCapture(defaultOptions));

    await act(async () => {
      await result.current.deletePhotoById('photo-1');
    });

    expect(deletePhoto).toHaveBeenCalledWith('photo-1');
  });

  it('should handle sync operations', async () => {
    const { startPhotoSync } = require('../../lib/photo-sync');
    const { result } = renderHook(() => usePhotoCapture(defaultOptions));

    await act(async () => {
      await result.current.syncPhotos(true);
    });

    expect(startPhotoSync).toHaveBeenCalledWith({ force: true });
  });

  it('should call error handler on failures', async () => {
    const mockOnError = jest.fn();
    const { result } = renderHook(() => 
      usePhotoCapture({ ...defaultOptions, onError: mockOnError })
    );

    mockGetUserMedia.mockRejectedValue(new Error('Camera error'));

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(mockOnError).toHaveBeenCalledWith(
      'Camera permission denied. Please allow camera access.'
    );
  });

  it('should call photo capture handler', async () => {
    const mockOnPhotoCapture = jest.fn();
    const { result } = renderHook(() => 
      usePhotoCapture({ ...defaultOptions, onPhotoCapture: mockOnPhotoCapture })
    );

    const mockPhoto = {
      id: 'photo-1',
      blob: new Blob(['test'], { type: 'image/jpeg' }),
      url: 'mock-url'
    };

    // Mock canvas and video elements
    const mockCanvas = {
      getContext: jest.fn(() => ({
        drawImage: jest.fn()
      })),
      toBlob: jest.fn((callback) => callback(new Blob(['test'], { type: 'image/jpeg' }))),
      width: 0,
      height: 0
    };

    const mockVideo = {
      videoWidth: 640,
      videoHeight: 480
    };

    result.current.canvasRef.current = mockCanvas as any;
    result.current.videoRef.current = mockVideo as any;

    const { processPhoto } = require('../../lib/image-utils');
    processPhoto.mockResolvedValue({
      success: true,
      photo: mockPhoto
    });

    await act(async () => {
      // Set camera as active first
      (result.current as any).setIsActive(true);
      const photo = await result.current.capturePhoto();
      expect(photo).toBe(mockPhoto);
    });

    expect(mockOnPhotoCapture).toHaveBeenCalledWith(mockPhoto);
  });
});

// Mock DOM APIs
global.HTMLVideoElement = class HTMLVideoElement {
  videoWidth = 640;
  videoHeight = 480;
  srcObject: any = null;
  
  play() {
    return Promise.resolve();
  }
} as any;

global.HTMLCanvasElement = class HTMLCanvasElement {
  width = 0;
  height = 0;
  
  getContext() {
    return {
      drawImage: jest.fn()
    };
  }
  
  toBlob(callback: (blob: Blob | null) => void) {
    callback(new Blob(['test'], { type: 'image/jpeg' }));
  }
} as any;