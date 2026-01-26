'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Play, Pause, Square, Trash2, Download } from 'lucide-react';
import { useVoiceRecording, VoiceRecordingOptions } from '@/hooks/useVoiceRecording';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: string) => void;
  className?: string;
  maxDuration?: number;
  showWaveform?: boolean;
  showPlayback?: boolean;
  showDownload?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onError,
  className,
  maxDuration = 300,
  showWaveform = true,
  showPlayback = true,
  showDownload = false,
  disabled = false,
  size = 'md'
}) => {
  const options: VoiceRecordingOptions = {
    maxDuration,
    onRecordingComplete,
    onError
  };

  const {
    isRecording,
    isPaused,
    isPlaying,
    duration,
    audioLevel,
    error,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    playAudio,
    stopAudio,
    clearRecording,
    isSupported
  } = useVoiceRecording(options);

  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(20).fill(0));

  // Update waveform visualization
  useEffect(() => {
    if (isRecording && !isPaused && showWaveform) {
      const interval = setInterval(() => {
        setWaveformBars(prev => {
          const newBars = [...prev];
          newBars.shift();
          newBars.push(audioLevel);
          return newBars;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isRecording, isPaused, audioLevel, showWaveform]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Size variants
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  if (!isSupported) {
    return (
      <div className={cn('flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg', className)}>
        <MicOff className="w-5 h-5 text-red-500" />
        <span className="text-red-700 text-sm">Voice recording is not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <MicOff className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Main Recording Controls */}
      <div className="flex items-center gap-4">
        {/* Record/Stop Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center rounded-full transition-all duration-200',
            sizeClasses[size],
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-green-500 hover:bg-green-600 text-white',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isRecording ? (
            <Square className={`w-${iconSizes[size]/4} h-${iconSizes[size]/4}`} />
          ) : (
            <Mic size={iconSizes[size]} />
          )}
        </button>

        {/* Pause/Resume Button */}
        {isRecording && (
          <button
            onClick={isPaused ? resumeRecording : pauseRecording}
            className="flex items-center justify-center w-10 h-10 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        )}

        {/* Duration Display */}
        {(isRecording || audioBlob) && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-600">
              {formatDuration(duration)}
            </span>
            {maxDuration && (
              <span className="text-xs text-gray-400">
                / {formatDuration(maxDuration)}
              </span>
            )}
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-600 font-medium">
              {isPaused ? 'Paused' : 'Recording'}
            </span>
          </div>
        )}
      </div>

      {/* Waveform Visualization */}
      {showWaveform && (isRecording || audioBlob) && (
        <div className="flex items-center justify-center gap-1 h-12 bg-gray-50 rounded-lg p-2">
          {waveformBars.map((level, index) => (
            <div
              key={index}
              className="bg-blue-500 rounded-full transition-all duration-100"
              style={{
                width: '3px',
                height: `${Math.max(2, level * 40)}px`,
                opacity: isRecording && !isPaused ? 1 : 0.5
              }}
            />
          ))}
        </div>
      )}

      {/* Audio Level Indicator */}
      {isRecording && !isPaused && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-100"
            style={{ width: `${audioLevel * 100}%` }}
          />
        </div>
      )}

      {/* Playback Controls */}
      {showPlayback && audioBlob && !isRecording && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <button
            onClick={isPlaying ? stopAudio : playAudio}
            className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            {isPlaying ? <Square size={16} /> : <Play size={16} />}
          </button>

          <div className="flex-1">
            <div className="text-sm text-gray-600">
              Recorded audio ({formatDuration(duration)})
            </div>
            {isPlaying && (
              <div className="text-xs text-blue-600">Playing...</div>
            )}
          </div>

          <div className="flex gap-2">
            {showDownload && (
              <button
                onClick={() => {
                  if (audioUrl) {
                    const a = document.createElement('a');
                    a.href = audioUrl;
                    a.download = `recording-${Date.now()}.webm`;
                    a.click();
                  }
                }}
                className="flex items-center justify-center w-8 h-8 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
                title="Download recording"
              >
                <Download size={14} />
              </button>
            )}

            <button
              onClick={clearRecording}
              className="flex items-center justify-center w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              title="Delete recording"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Recording Tips */}
      {!isRecording && !audioBlob && (
        <div className="text-xs text-gray-500 text-center">
          Click the microphone to start recording. Speak clearly for best results.
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;