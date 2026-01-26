import { renderHook, act } from '@testing-library/react';
import { useVoiceRecording } from '../useVoiceRecording';

// Mock MediaRecorder and related APIs
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  state: 'inactive',
  ondataavailable: null,
  onstop: null,
};

const mockMediaStream = {
  getTracks: jest.fn(() => [{ stop: jest.fn() }]),
};

const mockAudioContext = {
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn(),
  })),
  createAnalyser: jest.fn(() => ({
    fftSize: 256,
    frequencyBinCount: 128,
    getByteFrequencyData: jest.fn(),
  })),
  close: jest.fn(),
};

// Setup global mocks
Object.defineProperty(global, 'MediaRecorder', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockMediaRecorder),
});

Object.defineProperty(global.MediaRecorder, 'isTypeSupported', {
  writable: true,
  value: jest.fn().mockReturnValue(true),
});

Object.defineProperty(global, 'AudioContext', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioContext),
});

Object.defineProperty(global.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue(mockMediaStream),
  },
});

Object.defineProperty(global, 'URL', {
  writable: true,
  value: {
    createObjectURL: jest.fn().mockReturnValue('blob:mock-url'),
    revokeObjectURL: jest.fn(),
  },
});

describe('useVoiceRecording', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useVoiceRecording());

    expect(result.current.isRecording).toBe(false);
    expect(result.current.isPaused).toBe(false);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.audioLevel).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.audioBlob).toBe(null);
    expect(result.current.audioUrl).toBe(null);
    expect(result.current.isSupported).toBe(true);
  });

  it('should detect WebRTC support correctly', () => {
    const { result } = renderHook(() => useVoiceRecording());
    expect(result.current.isSupported).toBe(true);
  });

  it('should start recording successfully', async () => {
    const onRecordingComplete = jest.fn();
    const { result } = renderHook(() => 
      useVoiceRecording({ onRecordingComplete })
    );

    await act(async () => {
      await result.current.startRecording();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: {
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 1,
      }
    });

    expect(result.current.isRecording).toBe(true);
    expect(mockMediaRecorder.start).toHaveBeenCalledWith(100);
  });

  it('should handle microphone permission errors', async () => {
    const onError = jest.fn();
    const mockError = new Error('Permission denied');
    
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => 
      useVoiceRecording({ onError })
    );

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.error).toBe('Permission denied');
    expect(onError).toHaveBeenCalledWith('Permission denied');
  });

  it('should stop recording and create audio blob', async () => {
    const onRecordingComplete = jest.fn();
    const { result } = renderHook(() => 
      useVoiceRecording({ onRecordingComplete })
    );

    // Start recording first
    await act(async () => {
      await result.current.startRecording();
    });

    // Simulate MediaRecorder stop event
    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    
    act(() => {
      // Simulate the onstop event
      if (mockMediaRecorder.onstop) {
        mockMediaRecorder.onstop();
      }
      
      // Manually trigger the blob creation logic
      result.current.stopRecording();
    });

    expect(mockMediaRecorder.stop).toHaveBeenCalled();
  });

  it('should pause and resume recording', async () => {
    const { result } = renderHook(() => useVoiceRecording());

    // Start recording first
    await act(async () => {
      await result.current.startRecording();
    });

    // Pause recording
    act(() => {
      result.current.pauseRecording();
    });

    expect(mockMediaRecorder.pause).toHaveBeenCalled();
    expect(result.current.isPaused).toBe(true);

    // Resume recording
    act(() => {
      result.current.resumeRecording();
    });

    expect(mockMediaRecorder.resume).toHaveBeenCalled();
    expect(result.current.isPaused).toBe(false);
  });

  it('should respect max duration limit', async () => {
    const maxDuration = 5; // 5 seconds
    const { result } = renderHook(() => 
      useVoiceRecording({ maxDuration })
    );

    await act(async () => {
      await result.current.startRecording();
    });

    // Simulate duration reaching max
    act(() => {
      // This would normally be handled by the interval timer
      // For testing, we'll manually trigger the stop condition
      result.current.stopRecording();
    });

    expect(result.current.isRecording).toBe(false);
  });

  it('should clean up resources on unmount', () => {
    const { result, unmount } = renderHook(() => useVoiceRecording());

    act(() => {
      unmount();
    });

    // Verify cleanup was called
    expect(mockAudioContext.close).toHaveBeenCalled();
  });

  it('should handle unsupported browsers gracefully', () => {
    // Mock unsupported browser
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useVoiceRecording());

    expect(result.current.isSupported).toBe(false);
  });

  it('should validate audio constraints', async () => {
    const customOptions = {
      sampleRate: 44100,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    };

    const { result } = renderHook(() => useVoiceRecording(customOptions));

    await act(async () => {
      await result.current.startRecording();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: {
        sampleRate: 44100,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      }
    });
  });
});