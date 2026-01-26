/**
 * Audio utilities for voice recording and processing
 * Optimized for speech recognition and mobile networks
 */

export interface AudioProcessingOptions {
  targetSampleRate?: number;
  targetBitRate?: number;
  maxFileSize?: number; // in bytes
  format?: 'webm' | 'mp3' | 'wav';
}

export interface AudioMetadata {
  duration: number;
  size: number;
  sampleRate: number;
  channels: number;
  format: string;
}

/**
 * Get supported audio MIME types for recording
 */
export const getSupportedMimeTypes = (): string[] => {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm;codecs=vp8,opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav'
  ];

  return types.filter(type => MediaRecorder.isTypeSupported(type));
};

/**
 * Get the best supported MIME type for recording
 */
export const getBestMimeType = (): string => {
  const supported = getSupportedMimeTypes();
  
  // Prefer Opus codec for best compression and quality
  if (supported.includes('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus';
  }
  
  // Fallback to WebM
  if (supported.includes('audio/webm')) {
    return 'audio/webm';
  }
  
  // Fallback to MP4
  if (supported.includes('audio/mp4')) {
    return 'audio/mp4';
  }
  
  // Last resort
  return supported[0] || 'audio/webm';
};

/**
 * Get optimal recording constraints for speech recognition
 */
export const getOptimalConstraints = (options: {
  preferredSampleRate?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
} = {}): MediaTrackConstraints => {
  const {
    preferredSampleRate = 16000, // Optimal for speech recognition
    echoCancellation = true,
    noiseSuppression = true,
    autoGainControl = true
  } = options;

  return {
    sampleRate: preferredSampleRate,
    channelCount: 1, // Mono for better compression
    echoCancellation,
    noiseSuppression,
    autoGainControl,
    // Additional constraints for mobile optimization
    latency: 0.1, // Low latency for real-time feedback
    volume: 1.0
  };
};

/**
 * Compress audio blob for transmission
 */
export const compressAudio = async (
  audioBlob: Blob,
  options: AudioProcessingOptions = {}
): Promise<Blob> => {
  const {
    targetSampleRate = 16000,
    targetBitRate = 32000,
    maxFileSize = 5 * 1024 * 1024 // 5MB default
  } = options;

  // If the file is already small enough, return as-is
  if (audioBlob.size <= maxFileSize) {
    return audioBlob;
  }

  try {
    // Create audio context for processing
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: targetSampleRate
    });

    // Convert blob to array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Resample if necessary
    let processedBuffer = audioBuffer;
    if (audioBuffer.sampleRate !== targetSampleRate) {
      processedBuffer = await resampleAudioBuffer(audioBuffer, targetSampleRate, audioContext);
    }

    // Convert back to blob with compression
    const compressedBlob = await audioBufferToBlob(processedBuffer, {
      sampleRate: targetSampleRate,
      bitRate: targetBitRate
    });

    audioContext.close();
    return compressedBlob;
  } catch (error) {
    console.warn('Audio compression failed, returning original:', error);
    return audioBlob;
  }
};

/**
 * Resample audio buffer to target sample rate
 */
const resampleAudioBuffer = async (
  audioBuffer: AudioBuffer,
  targetSampleRate: number,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const ratio = audioBuffer.sampleRate / targetSampleRate;
  const newLength = Math.round(audioBuffer.length / ratio);
  const newBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    newLength,
    targetSampleRate
  );

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const inputData = audioBuffer.getChannelData(channel);
    const outputData = newBuffer.getChannelData(channel);

    for (let i = 0; i < newLength; i++) {
      const sourceIndex = i * ratio;
      const index = Math.floor(sourceIndex);
      const fraction = sourceIndex - index;

      if (index + 1 < inputData.length) {
        // Linear interpolation
        outputData[i] = inputData[index] * (1 - fraction) + inputData[index + 1] * fraction;
      } else {
        outputData[i] = inputData[index] || 0;
      }
    }
  }

  return newBuffer;
};

/**
 * Convert audio buffer to compressed blob
 */
const audioBufferToBlob = async (
  audioBuffer: AudioBuffer,
  options: { sampleRate: number; bitRate: number }
): Promise<Blob> => {
  // Create offline context for rendering
  const offlineContext = new OfflineAudioContext(
    1, // Mono
    audioBuffer.length,
    options.sampleRate
  );

  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();

  const renderedBuffer = await offlineContext.startRendering();

  // Convert to WAV format (simple implementation)
  const wavBlob = audioBufferToWav(renderedBuffer);
  return wavBlob;
};

/**
 * Convert audio buffer to WAV blob
 */
const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
  const length = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Convert audio data
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

/**
 * Get audio metadata from blob
 */
export const getAudioMetadata = async (audioBlob: Blob): Promise<AudioMetadata> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const metadata: AudioMetadata = {
      duration: audioBuffer.duration,
      size: audioBlob.size,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      format: audioBlob.type
    };

    audioContext.close();
    return metadata;
  } catch (error) {
    // Fallback metadata
    return {
      duration: 0,
      size: audioBlob.size,
      sampleRate: 0,
      channels: 0,
      format: audioBlob.type
    };
  }
};

/**
 * Validate audio blob for speech recognition
 */
export const validateAudioForSpeech = async (audioBlob: Blob): Promise<{
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    const metadata = await getAudioMetadata(audioBlob);

    // Check duration
    if (metadata.duration < 0.5) {
      issues.push('Recording too short (less than 0.5 seconds)');
      recommendations.push('Record for at least 1 second');
    }

    if (metadata.duration > 300) {
      issues.push('Recording too long (over 5 minutes)');
      recommendations.push('Keep recordings under 5 minutes for better processing');
    }

    // Check file size
    if (metadata.size > 10 * 1024 * 1024) { // 10MB
      issues.push('File size too large');
      recommendations.push('Use audio compression or shorter recordings');
    }

    // Check sample rate
    if (metadata.sampleRate > 0 && metadata.sampleRate < 8000) {
      issues.push('Sample rate too low for speech recognition');
      recommendations.push('Use at least 8kHz sample rate');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  } catch (error) {
    return {
      isValid: false,
      issues: ['Failed to analyze audio'],
      recommendations: ['Try recording again']
    };
  }
};

/**
 * Create audio visualization data
 */
export const createVisualizationData = (
  audioBuffer: AudioBuffer,
  targetPoints: number = 100
): number[] => {
  const channelData = audioBuffer.getChannelData(0); // Use first channel
  const blockSize = Math.floor(channelData.length / targetPoints);
  const visualizationData: number[] = [];

  for (let i = 0; i < targetPoints; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, channelData.length);
    
    let sum = 0;
    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j]);
    }
    
    const average = sum / (end - start);
    visualizationData.push(average);
  }

  return visualizationData;
};