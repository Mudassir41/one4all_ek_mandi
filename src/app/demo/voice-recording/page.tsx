'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceButton from '@/components/ui/VoiceButton';
import VoiceRecorder from '@/components/ui/VoiceRecorder';
import { getLanguageName } from '@/lib/utils';
import { Language } from '@/types';

const VoiceRecordingDemo: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('english');
  const [recordings, setRecordings] = useState<Array<{
    id: string;
    blob: Blob;
    url: string;
    duration: number;
    language: Language;
    timestamp: Date;
  }>>([]);

  const languages: Language[] = [
    'english', 'hindi', 'tamil', 'telugu', 'kannada', 'bengali', 'odia', 'malayalam'
  ];

  const handleVoiceMessage = async (audioBlob: Blob) => {
    const url = URL.createObjectURL(audioBlob);
    const newRecording = {
      id: Date.now().toString(),
      blob: audioBlob,
      url,
      duration: 0, // Would be calculated from audio metadata
      language: selectedLanguage,
      timestamp: new Date()
    };
    
    setRecordings(prev => [newRecording, ...prev]);
    
    // Simulate processing
    console.log('Processing voice message:', {
      size: audioBlob.size,
      type: audioBlob.type,
      language: selectedLanguage
    });
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    handleVoiceMessage(audioBlob);
  };

  const handleError = (error: string) => {
    console.error('Voice recording error:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            Voice Recording Demo
          </h1>
          <p className="text-gray-600">
            Test the WebRTC voice recording component for Ek Bharath Ek Mandi
          </p>
        </div>

        {/* Language Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Language Selection</CardTitle>
            <CardDescription>
              Choose your preferred language for voice recording
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedLanguage === lang
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {getLanguageName(lang)}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {lang}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Voice Recording Components */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Voice Button Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Button Component</CardTitle>
              <CardDescription>
                Modal-based voice recording with full UI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <VoiceButton
                  onVoiceMessage={handleVoiceMessage}
                  language={selectedLanguage}
                  title={`Record in ${getLanguageName(selectedLanguage)}`}
                  placeholder={`Speak clearly in ${getLanguageName(selectedLanguage)}...`}
                  size="lg"
                />
              </div>
              <p className="text-sm text-gray-600 text-center">
                Click to open recording modal
              </p>
            </CardContent>
          </Card>

          {/* Voice Recorder Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Recorder Component</CardTitle>
              <CardDescription>
                Inline voice recording with waveform visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                onError={handleError}
                maxDuration={60}
                showWaveform={true}
                showPlayback={true}
                showDownload={true}
                size="md"
              />
            </CardContent>
          </Card>
        </div>

        {/* Recording History */}
        <Card>
          <CardHeader>
            <CardTitle>Recording History</CardTitle>
            <CardDescription>
              Your recorded voice messages ({recordings.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recordings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recordings yet. Try recording a voice message above!
              </div>
            ) : (
              <div className="space-y-3">
                {recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        🎤
                      </div>
                      <div>
                        <div className="font-medium">
                          {getLanguageName(recording.language)} Recording
                        </div>
                        <div className="text-sm text-gray-500">
                          {recording.timestamp.toLocaleTimeString()} • {Math.round(recording.blob.size / 1024)}KB
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <audio
                        controls
                        src={recording.url}
                        className="h-8"
                      />
                      <button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = recording.url;
                          a.download = `recording-${recording.id}.webm`;
                          a.click();
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Features</CardTitle>
            <CardDescription>
              WebRTC voice recording capabilities implemented
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">✅ Implemented Features</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• WebRTC audio stream management</li>
                  <li>• Real-time audio recording with MediaRecorder</li>
                  <li>• Audio quality optimization (16kHz, mono)</li>
                  <li>• Visual feedback with waveform display</li>
                  <li>• Audio playback functionality</li>
                  <li>• Browser compatibility detection</li>
                  <li>• Error handling for permissions</li>
                  <li>• Audio compression and optimization</li>
                  <li>• Multiple audio format support</li>
                  <li>• Mobile device optimization</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">🔧 Technical Specs</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Sample Rate: 16kHz (optimized for speech)</li>
                  <li>• Bit Rate: 32kbps (mobile-friendly)</li>
                  <li>• Format: WebM/Opus (with fallbacks)</li>
                  <li>• Echo Cancellation: Enabled</li>
                  <li>• Noise Suppression: Enabled</li>
                  <li>• Auto Gain Control: Enabled</li>
                  <li>• Max Duration: Configurable (default 5min)</li>
                  <li>• Real-time Level Monitoring</li>
                  <li>• Pause/Resume Support</li>
                  <li>• Resource Cleanup</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceRecordingDemo;