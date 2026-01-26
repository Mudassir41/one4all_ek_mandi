'use client';

import React, { useState } from 'react';
import { Camera, Image, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PhotoCapture as PhotoCaptureType } from '@/types';
import { cn } from '@/lib/utils';
import Modal from './Modal';
import PhotoCapture from './PhotoCapture';

interface PhotoCaptureButtonProps {
  userId: string;
  productId?: string;
  category?: string;
  onPhotosChange?: (photos: PhotoCaptureType[]) => void;
  onError?: (error: string) => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}

const PhotoCaptureButton: React.FC<PhotoCaptureButtonProps> = ({
  userId,
  productId,
  category,
  onPhotosChange,
  onError,
  className,
  variant = 'primary',
  size = 'md',
  showIcon = true,
  children,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenModal = () => {
    if (disabled) return;
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePhotosChange = (photos: PhotoCaptureType[]) => {
    onPhotosChange?.(photos);
  };

  const handleError = (error: string) => {
    onError?.(error);
  };

  // Button variants
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
  };

  // Button sizes
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  // Icon sizes
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center space-x-2 rounded-lg font-medium transition-colors',
          variants[variant],
          sizes[size],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {isLoading ? (
          <Loader2 className={cn('animate-spin', iconSizes[size])} />
        ) : (
          showIcon && <Camera className={iconSizes[size]} />
        )}
        <span>
          {children || t('camera.takePhoto')}
        </span>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={t('camera.photoCapture')}
        size="lg"
      >
        <PhotoCapture
          userId={userId}
          productId={productId}
          category={category}
          onPhotosChange={handlePhotosChange}
          onError={handleError}
          showGallery={true}
          showUpload={true}
          showGuides={true}
        />
      </Modal>
    </>
  );
};

export default PhotoCaptureButton;