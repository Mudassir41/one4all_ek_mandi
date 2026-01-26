/**
 * Tests for image processing utilities
 */

import { 
  calculateDimensions, 
  formatFileSize, 
  getFileExtension, 
  validateImageFile,
  generateFilename,
  getDeviceInfo
} from '../image-utils';

// Mock browser APIs
Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    platform: 'Win32'
  },
  writable: true
});

// Mock File constructor
global.File = class File {
  name: string;
  size: number;
  type: string;
  
  constructor(bits: any[], filename: string, options: any = {}) {
    this.name = filename;
    this.size = options.size || 0;
    this.type = options.type || '';
  }
} as any;

describe('Image Utils', () => {
  describe('calculateDimensions', () => {
    it('should maintain aspect ratio when scaling down', () => {
      const result = calculateDimensions(1920, 1080, 800, 600);
      expect(result.width).toBe(800);
      expect(result.height).toBe(450);
    });

    it('should not scale up smaller images', () => {
      const result = calculateDimensions(400, 300, 800, 600);
      expect(result.width).toBe(400);
      expect(result.height).toBe(300);
    });

    it('should handle portrait orientation', () => {
      const result = calculateDimensions(1080, 1920, 600, 800);
      expect(result.width).toBe(450);
      expect(result.height).toBe(800);
    });

    it('should handle square images', () => {
      const result = calculateDimensions(1000, 1000, 500, 500);
      expect(result.width).toBe(500);
      expect(result.height).toBe(500);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2621440)).toBe('2.5 MB');
    });

    it('should handle large numbers', () => {
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });
  });

  describe('getFileExtension', () => {
    it('should return correct extensions for common MIME types', () => {
      expect(getFileExtension('image/jpeg')).toBe('jpg');
      expect(getFileExtension('image/png')).toBe('png');
      expect(getFileExtension('image/webp')).toBe('webp');
      expect(getFileExtension('image/gif')).toBe('gif');
    });

    it('should return jpg as default for unknown types', () => {
      expect(getFileExtension('image/unknown')).toBe('jpg');
      expect(getFileExtension('application/pdf')).toBe('jpg');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with correct extension', () => {
      const filename = generateFilename('image/jpeg');
      expect(filename).toMatch(/^photo-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.jpg$/);
    });

    it('should generate unique filenames', async () => {
      const filename1 = generateFilename('image/png');
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      const filename2 = generateFilename('image/png');
      expect(filename1).not.toBe(filename2);
    });
  });

  describe('validateImageFile', () => {
    const createMockFile = (size: number, type: string): File => {
      const file = new File([''], 'test.jpg', { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('should validate correct image files', () => {
      const file = createMockFile(1024 * 1024, 'image/jpeg'); // 1MB
      const result = validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files that are too large', () => {
      const file = createMockFile(10 * 1024 * 1024, 'image/jpeg'); // 10MB (over default 5MB limit)
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds limit');
    });

    it('should reject unsupported file types', () => {
      const file = createMockFile(1024, 'application/pdf');
      const result = validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
    });

    it('should respect custom config', () => {
      const file = createMockFile(2 * 1024 * 1024, 'image/jpeg'); // 2MB
      const config = { maxFileSize: 1024 * 1024 }; // 1MB limit
      const result = validateImageFile(file, config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds limit');
    });
  });

  describe('getDeviceInfo', () => {
    it('should return device information', () => {
      const info = getDeviceInfo();
      expect(info).toHaveProperty('userAgent');
      expect(info).toHaveProperty('platform');
      expect(info).toHaveProperty('isMobile');
      expect(typeof info.userAgent).toBe('string');
      expect(typeof info.platform).toBe('string');
      expect(typeof info.isMobile).toBe('boolean');
    });
  });
});

// Mock canvas and image for browser environment
global.HTMLCanvasElement = class HTMLCanvasElement {
  getContext() {
    return {
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
      putImageData: jest.fn()
    };
  }
  
  toBlob(callback: (blob: Blob | null) => void) {
    callback(new Blob(['mock'], { type: 'image/jpeg' }));
  }
  
  toDataURL() {
    return 'data:image/jpeg;base64,mock';
  }
  
  width = 100;
  height = 100;
} as any;

global.Image = class Image {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 100;
  height = 100;
  
  set src(value: string) {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
} as any;

global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
} as any;