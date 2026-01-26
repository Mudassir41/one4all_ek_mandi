'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  closeOnOverlayClick = true,
  showCloseButton = true,
}: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={cn(
            'relative bg-white rounded-lg shadow-xl transform transition-all w-full',
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  transcript?: string;
  translation?: string;
  targetLanguage?: string;
  className?: string;
}

export function VoiceModal({
  isOpen,
  onClose,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  transcript,
  translation,
  targetLanguage = 'Hindi',
  className,
}: VoiceModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voice Translation"
      size="md"
      className={className}
    >
      <div className="text-center">
        {/* Voice Button */}
        <div className="mb-6">
          <button
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 mx-auto',
              isRecording
                ? 'bg-red-500 shadow-voice scale-110 animate-pulse'
                : 'bg-gradient-to-br from-primary-500 to-secondary-500 shadow-cultural hover:shadow-voice hover:scale-105'
            )}
            onMouseDown={onStartRecording}
            onMouseUp={onStopRecording}
            onMouseLeave={onStopRecording}
            onTouchStart={onStartRecording}
            onTouchEnd={onStopRecording}
          >
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          {isRecording ? (
            <div className="text-red-600">
              <p className="font-medium">🔴 Recording...</p>
              <p className="text-sm">Release to stop and translate</p>
            </div>
          ) : (
            <div className="text-gray-600">
              <p className="font-medium">Hold to record your message</p>
              <p className="text-sm">Speak in your preferred language</p>
            </div>
          )}
        </div>

        {/* Transcript and Translation */}
        {(transcript || translation) && (
          <div className="space-y-4">
            {transcript && (
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">Your Message:</h4>
                <p className="text-gray-700">{transcript}</p>
              </div>
            )}

            {translation && (
              <div className="bg-primary-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-primary-900 mb-2">
                  Translation ({targetLanguage}):
                </h4>
                <p className="text-primary-700">{translation}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {translation && (
            <button className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Send Message
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default Modal;