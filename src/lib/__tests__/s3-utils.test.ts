/**
 * Tests for S3 utilities
 */

import { validateFile, getBucketName } from '../s3-utils';

describe('S3 Utils', () => {
  describe('validateFile', () => {
    it('should validate image files correctly', () => {
      // Valid image
      const validImage = validateFile('image', 'image/jpeg', 1024 * 1024); // 1MB
      expect(validImage.valid).toBe(true);
      expect(validImage.error).toBeUndefined();

      // Invalid image type
      const invalidType = validateFile('image', 'application/pdf', 1024);
      expect(invalidType.valid).toBe(false);
      expect(invalidType.error).toContain('Invalid image type');

      // Image too large
      const tooLarge = validateFile('image', 'image/jpeg', 20 * 1024 * 1024); // 20MB
      expect(tooLarge.valid).toBe(false);
      expect(tooLarge.error).toContain('File too large');
    });

    it('should validate audio files correctly', () => {
      // Valid audio
      const validAudio = validateFile('audio', 'audio/mpeg', 5 * 1024 * 1024); // 5MB
      expect(validAudio.valid).toBe(true);
      expect(validAudio.error).toBeUndefined();

      // Invalid audio type
      const invalidType = validateFile('audio', 'video/mp4', 1024);
      expect(invalidType.valid).toBe(false);
      expect(invalidType.error).toContain('Invalid audio type');

      // Audio too large
      const tooLarge = validateFile('audio', 'audio/mpeg', 100 * 1024 * 1024); // 100MB
      expect(tooLarge.valid).toBe(false);
      expect(tooLarge.error).toContain('File too large');
    });
  });

  describe('getBucketName', () => {
    // Mock environment variables
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        MEDIA_BUCKET_NAME: 'test-media-bucket',
        VOICE_BUCKET_NAME: 'test-voice-bucket',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should return correct bucket names', () => {
      expect(getBucketName('media')).toBe('test-media-bucket');
      expect(getBucketName('voice')).toBe('test-voice-bucket');
    });
  });
});

describe('File Type Validation', () => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm'];

  it('should accept all allowed image types', () => {
    allowedImageTypes.forEach(type => {
      const result = validateFile('image', type, 1024);
      expect(result.valid).toBe(true);
    });
  });

  it('should accept all allowed audio types', () => {
    allowedAudioTypes.forEach(type => {
      const result = validateFile('audio', type, 1024);
      expect(result.valid).toBe(true);
    });
  });

  it('should reject disallowed file types', () => {
    const disallowedTypes = [
      'application/pdf',
      'text/plain',
      'video/mp4',
      'application/zip',
    ];

    disallowedTypes.forEach(type => {
      const imageResult = validateFile('image', type, 1024);
      const audioResult = validateFile('audio', type, 1024);
      
      expect(imageResult.valid).toBe(false);
      expect(audioResult.valid).toBe(false);
    });
  });
});

describe('File Size Limits', () => {
  const maxImageSize = 10 * 1024 * 1024; // 10MB
  const maxAudioSize = 50 * 1024 * 1024; // 50MB

  it('should enforce image size limits', () => {
    // Just under limit
    const validSize = validateFile('image', 'image/jpeg', maxImageSize - 1);
    expect(validSize.valid).toBe(true);

    // At limit
    const atLimit = validateFile('image', 'image/jpeg', maxImageSize);
    expect(atLimit.valid).toBe(true);

    // Over limit
    const overLimit = validateFile('image', 'image/jpeg', maxImageSize + 1);
    expect(overLimit.valid).toBe(false);
  });

  it('should enforce audio size limits', () => {
    // Just under limit
    const validSize = validateFile('audio', 'audio/mpeg', maxAudioSize - 1);
    expect(validSize.valid).toBe(true);

    // At limit
    const atLimit = validateFile('audio', 'audio/mpeg', maxAudioSize);
    expect(atLimit.valid).toBe(true);

    // Over limit
    const overLimit = validateFile('audio', 'audio/mpeg', maxAudioSize + 1);
    expect(overLimit.valid).toBe(false);
  });
});