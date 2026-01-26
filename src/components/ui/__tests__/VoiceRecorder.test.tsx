import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceRecorder from '../VoiceRecorder';

// Mock the useVoiceRecording hook
jest.mock('../../hooks/useVoiceRecording', () => ({
  useVoiceRecording: jest.fn(() => ({
    isRecording: false,
    isPaused: false,
    isPlaying: false,
    duration: 0,
    audioLevel: 0,
    error: null,
    audioBlob: null,
    audioUrl: null,
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    pauseRecording: jest.fn(),
    resumeRecording: jest.fn(),
    playAudio: jest.fn(),
    stopAudio: jest.fn(),
    clearRecording: jest.fn(),
    isSupported: true,
  })),
}));

describe('VoiceRecorder', () => {
  const mockOnRecordingComplete = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when WebRTC is supported', () => {
    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText(/Click the microphone to start recording/)).toBeInTheDocument();
  });

  it('shows unsupported message when WebRTC is not available', () => {
    const { useVoiceRecording } = require('../../hooks/useVoiceRecording');
    useVoiceRecording.mockReturnValue({
      isRecording: false,
      isPaused: false,
      isPlaying: false,
      duration: 0,
      audioLevel: 0,
      error: null,
      audioBlob: null,
      audioUrl: null,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      clearRecording: jest.fn(),
      isSupported: false,
    });

    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByText(/Voice recording is not supported/)).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    const { useVoiceRecording } = require('../../hooks/useVoiceRecording');
    useVoiceRecording.mockReturnValue({
      isRecording: false,
      isPaused: false,
      isPlaying: false,
      duration: 0,
      audioLevel: 0,
      error: 'Microphone access denied',
      audioBlob: null,
      audioUrl: null,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      clearRecording: jest.fn(),
      isSupported: true,
    });

    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Microphone access denied')).toBeInTheDocument();
  });

  it('shows recording state correctly', () => {
    const { useVoiceRecording } = require('../../hooks/useVoiceRecording');
    useVoiceRecording.mockReturnValue({
      isRecording: true,
      isPaused: false,
      isPlaying: false,
      duration: 15,
      audioLevel: 0.5,
      error: null,
      audioBlob: null,
      audioUrl: null,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      clearRecording: jest.fn(),
      isSupported: true,
    });

    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Recording')).toBeInTheDocument();
    expect(screen.getByText('0:15')).toBeInTheDocument();
  });

  it('shows paused state correctly', () => {
    const { useVoiceRecording } = require('../../hooks/useVoiceRecording');
    useVoiceRecording.mockReturnValue({
      isRecording: true,
      isPaused: true,
      isPlaying: false,
      duration: 10,
      audioLevel: 0,
      error: null,
      audioBlob: null,
      audioUrl: null,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      clearRecording: jest.fn(),
      isSupported: true,
    });

    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('shows playback controls when audio is available', () => {
    const mockBlob = new Blob(['audio'], { type: 'audio/webm' });
    const { useVoiceRecording } = require('../../hooks/useVoiceRecording');
    useVoiceRecording.mockReturnValue({
      isRecording: false,
      isPaused: false,
      isPlaying: false,
      duration: 30,
      audioLevel: 0,
      error: null,
      audioBlob: mockBlob,
      audioUrl: 'blob:mock-url',
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      clearRecording: jest.fn(),
      isSupported: true,
    });

    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
        showPlayback={true}
      />
    );

    expect(screen.getByText(/Recorded audio/)).toBeInTheDocument();
    expect(screen.getByTitle('Delete recording')).toBeInTheDocument();
  });

  it('calls startRecording when record button is clicked', () => {
    const mockStartRecording = jest.fn();
    const { useVoiceRecording } = require('../../hooks/useVoiceRecording');
    useVoiceRecording.mockReturnValue({
      isRecording: false,
      isPaused: false,
      isPlaying: false,
      duration: 0,
      audioLevel: 0,
      error: null,
      audioBlob: null,
      audioUrl: null,
      startRecording: mockStartRecording,
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      clearRecording: jest.fn(),
      isSupported: true,
    });

    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
      />
    );

    const recordButton = screen.getByRole('button');
    fireEvent.click(recordButton);

    expect(mockStartRecording).toHaveBeenCalled();
  });

  it('calls stopRecording when stop button is clicked during recording', () => {
    const mockStopRecording = jest.fn();
    const { useVoiceRecording } = require('../../hooks/useVoiceRecording');
    useVoiceRecording.mockReturnValue({
      isRecording: true,
      isPaused: false,
      isPlaying: false,
      duration: 5,
      audioLevel: 0.3,
      error: null,
      audioBlob: null,
      audioUrl: null,
      startRecording: jest.fn(),
      stopRecording: mockStopRecording,
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      clearRecording: jest.fn(),
      isSupported: true,
    });

    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
      />
    );

    const stopButton = screen.getByRole('button');
    fireEvent.click(stopButton);

    expect(mockStopRecording).toHaveBeenCalled();
  });

  it('formats duration correctly', () => {
    const { useVoiceRecording } = require('../../hooks/useVoiceRecording');
    useVoiceRecording.mockReturnValue({
      isRecording: true,
      isPaused: false,
      isPlaying: false,
      duration: 125, // 2 minutes 5 seconds
      audioLevel: 0.3,
      error: null,
      audioBlob: null,
      audioUrl: null,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      clearRecording: jest.fn(),
      isSupported: true,
    });

    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
        maxDuration={300}
      />
    );

    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByText('/ 5:00')).toBeInTheDocument();
  });

  it('respects disabled prop', () => {
    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
        disabled={true}
      />
    );

    const recordButton = screen.getByRole('button');
    expect(recordButton).toBeDisabled();
  });

  it('shows waveform when enabled and recording', () => {
    const { useVoiceRecording } = require('../../hooks/useVoiceRecording');
    useVoiceRecording.mockReturnValue({
      isRecording: true,
      isPaused: false,
      isPlaying: false,
      duration: 5,
      audioLevel: 0.7,
      error: null,
      audioBlob: null,
      audioUrl: null,
      startRecording: jest.fn(),
      stopRecording: jest.fn(),
      pauseRecording: jest.fn(),
      resumeRecording: jest.fn(),
      playAudio: jest.fn(),
      stopAudio: jest.fn(),
      clearRecording: jest.fn(),
      isSupported: true,
    });

    render(
      <VoiceRecorder
        onRecordingComplete={mockOnRecordingComplete}
        onError={mockOnError}
        showWaveform={true}
      />
    );

    // Check if waveform container exists
    const waveformContainer = screen.getByRole('button').parentElement?.querySelector('.bg-gray-50');
    expect(waveformContainer).toBeInTheDocument();
  });
});