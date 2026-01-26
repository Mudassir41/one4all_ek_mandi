'use client';

import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import VoiceRecordingModal from './VoiceRecordingModal';

interface VoiceButtonProps {
  onClick?: () => void;
  onVoiceMessage?: (audioBlob: Blob) => Promise<void>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  isActive?: boolean;
  showModal?: boolean;
  language?: string;
  title?: string;
  placeholder?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  onClick,
  onVoiceMessage,
  className,
  size = 'md',
  variant = 'primary',
  disabled = false,
  isActive = false,
  showModal = true,
  language = 'en',
  title = 'Voice Message',
  placeholder = 'Record your message...'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const { currentTheme, getVoiceColor, setVoiceState, voiceState } = useTheme();

  React.useEffect(() => {
    // Check WebRTC support
    const supported = !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    );
    setIsSupported(supported);
  }, []);

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

  const variantClasses = {
    primary: isSupported 
      ? `bg-gradient-to-br from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-cultural` 
      : 'bg-gray-400 text-white cursor-not-allowed',
    secondary: isSupported 
      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
      : 'bg-gray-400 text-white cursor-not-allowed',
    outline: isSupported 
      ? `border-2 text-white hover:bg-primary-50` 
      : 'border-2 border-gray-400 text-gray-400 cursor-not-allowed'
  };

  // Dynamic styling based on voice state and cultural theme
  const getVoiceButtonStyle = () => {
    if (!isSupported || disabled) return {};
    
    const baseColor = getVoiceColor();
    
    return {
      backgroundColor: baseColor,
      borderColor: baseColor,
      boxShadow: isActive || voiceState !== 'idle' 
        ? `0 0 20px ${baseColor}40, 0 0 40px ${baseColor}20`
        : `0 4px 20px ${currentTheme.primary}30`
    };
  };

  const handleClick = () => {
    if (!isSupported || disabled) return;

    if (showModal && onVoiceMessage) {
      setVoiceState('listening');
      setIsModalOpen(true);
    } else if (onClick) {
      onClick();
    }
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    if (onVoiceMessage) {
      setVoiceState('processing');
      try {
        await onVoiceMessage(audioBlob);
        setVoiceState('idle');
      } catch (error) {
        setVoiceState('error');
        setTimeout(() => setVoiceState('idle'), 2000);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setVoiceState('idle');
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || !isSupported}
        style={getVoiceButtonStyle()}
        className={cn(
          'flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 voice-button',
          sizeClasses[size],
          variantClasses[variant],
          (isActive || voiceState !== 'idle') && isSupported && 'animate-pulse-slow',
          (disabled || !isSupported) && 'opacity-50 cursor-not-allowed',
          voiceState === 'listening' && 'ring-4 ring-green-400 ring-opacity-50',
          voiceState === 'processing' && 'ring-4 ring-yellow-400 ring-opacity-50',
          voiceState === 'error' && 'ring-4 ring-red-400 ring-opacity-50',
          className
        )}
        aria-label={isSupported ? "Voice input" : "Voice input not supported"}
        title={isSupported ? "Record voice message" : "Voice recording not supported in this browser"}
      >
        {isSupported ? (
          <Mic size={iconSizes[size]} />
        ) : (
          <MicOff size={iconSizes[size]} />
        )}
      </button>

      {showModal && onVoiceMessage && (
        <VoiceRecordingModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSend={handleVoiceMessage}
          title={title}
          placeholder={placeholder}
          language={language}
        />
      )}
    </>
  );
};

export { VoiceButton };
export default VoiceButton;