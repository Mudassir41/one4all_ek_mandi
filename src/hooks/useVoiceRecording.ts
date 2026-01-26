import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  duration: number;
  audioLevel: number;
  error: string | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export interface VoiceRecordingOptions {
  maxDuration?: number; // in seconds
  sampleRate?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: string) => void;
}

export const useVoiceRecording = (options: VoiceRecordingOptions = {}) => {
  const {
    maxDuration = 300, // 5 minutes default
    sampleRate = 16000, // Optimized for speech recognition
    echoCancellation = true,
    noiseSuppression = true,
    autoGainControl = true,
    onRecordingComplete,
    onError
  } = options;

  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isPaused: false,
    isPlaying: false,
    duration: 0,
    audioLevel: 0,
    error: null,
    audioBlob: null,
    audioUrl: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Check browser compatibility
  const isWebRTCSupported = useCallback(() => {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
  }, []);

  // Get audio level for visual feedback
  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = Math.min(average / 128, 1);

    setState(prev => ({ ...prev, audioLevel: normalizedLevel }));
    
    if (state.isRecording && !state.isPaused) {
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [state.isRecording, state.isPaused]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isWebRTCSupported()) {
      const error = 'WebRTC is not supported in this browser';
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    try {
      // Request microphone access with optimized constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          echoCancellation,
          noiseSuppression,
          autoGainControl,
          channelCount: 1, // Mono for better compression
        }
      });

      streamRef.current = stream;

      // Set up audio context for level monitoring
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Set up MediaRecorder with optimized settings
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 32000 // Optimized for mobile networks
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        setState(prev => ({
          ...prev,
          audioBlob: blob,
          audioUrl: url,
          isRecording: false,
          isPaused: false
        }));

        onRecordingComplete?.(blob);
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms

      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null,
        duration: 0
      }));

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newDuration = prev.duration + 1;
          
          // Auto-stop at max duration
          if (newDuration >= maxDuration) {
            stopRecording();
            return prev;
          }
          
          return { ...prev, duration: newDuration };
        });
      }, 1000);

      // Start audio level monitoring
      updateAudioLevel();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access microphone';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [isWebRTCSupported, sampleRate, echoCancellation, noiseSuppression, autoGainControl, maxDuration, onRecordingComplete, onError, updateAudioLevel]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }

    // Clean up timers and animation frames
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setState(prev => ({
      ...prev,
      audioLevel: 0
    }));
  }, [state.isRecording]);

  // Pause/Resume recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [state.isRecording, state.isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
      updateAudioLevel();
    }
  }, [state.isRecording, state.isPaused, updateAudioLevel]);

  // Play recorded audio
  const playAudio = useCallback(() => {
    if (!state.audioUrl) return;

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }

    const audio = new Audio(state.audioUrl);
    audioElementRef.current = audio;

    audio.onplay = () => setState(prev => ({ ...prev, isPlaying: true }));
    audio.onended = () => setState(prev => ({ ...prev, isPlaying: false }));
    audio.onerror = () => {
      setState(prev => ({ ...prev, isPlaying: false, error: 'Failed to play audio' }));
    };

    audio.play().catch(error => {
      setState(prev => ({ ...prev, error: 'Failed to play audio' }));
    });
  }, [state.audioUrl]);

  // Stop audio playback
  const stopAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, []);

  // Clear recording
  const clearRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }

    setState(prev => ({
      ...prev,
      audioBlob: null,
      audioUrl: null,
      isPlaying: false,
      duration: 0,
      error: null
    }));
  }, [state.audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      clearRecording();
    };
  }, [stopRecording, clearRecording]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    playAudio,
    stopAudio,
    clearRecording,
    isSupported: isWebRTCSupported()
  };
};