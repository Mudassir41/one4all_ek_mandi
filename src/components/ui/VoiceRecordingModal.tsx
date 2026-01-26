'use client';

import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import Modal from './Modal';
import VoiceRecorder from './VoiceRecorder';
import { cn } from '@/lib/utils';

interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: (audioBlob: Blob) => Promise<void>;
  title?: string;
  placeholder?: string;
  language?: string;
  className?: string;
}

const VoiceRecordingModal: React.FC<VoiceRecordingModalProps> = ({
  isOpen,
  onClose,
  onSend,
  title = 'Voice Message',
  placeholder = 'Record your message...',
  language = 'en',
  className
}) => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSend = async () => {
    if (!audioBlob || !onSend) return;

    setIsUploading(true);
    try {
      await onSend(audioBlob);
      handleClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send voice message');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setAudioBlob(null);
    setError(null);
    setIsUploading(false);
    onClose();
  };

  const getLanguageLabel = (lang: string) => {
    const languages: Record<string, string> = {
      'en': 'English',
      'hi': 'हिंदी',
      'ta': 'தமிழ்',
      'te': 'తెలుగు',
      'kn': 'ಕನ್ನಡ',
      'bn': 'বাংলা',
      'or': 'ଓଡ଼ିଆ',
      'ml': 'മലയാളം'
    };
    return languages[lang] || lang;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className={className}>
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">
              Recording in {getLanguageLabel(language)}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isUploading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Instructions */}
          <div className="mb-6 text-center">
            <p className="text-gray-600 text-sm mb-2">{placeholder}</p>
            <p className="text-xs text-gray-500">
              Speak clearly and ensure you're in a quiet environment for best results
            </p>
          </div>

          {/* Voice Recorder */}
          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            onError={handleError}
            maxDuration={180} // 3 minutes for voice messages
            showWaveform={true}
            showPlayback={true}
            showDownload={false}
            size="lg"
            className="mb-6"
          />

          {/* Language-specific tips */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Recording Tips for {getLanguageLabel(language)}:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Speak at a normal pace</li>
              <li>• Pronounce words clearly</li>
              <li>• Avoid background noise</li>
              {language !== 'en' && (
                <li>• Use common words for better translation</li>
              )}
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            disabled={!audioBlob || isUploading}
            className={cn(
              'flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all',
              audioBlob && !isUploading
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            )}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Message
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VoiceRecordingModal;