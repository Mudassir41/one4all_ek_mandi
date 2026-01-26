'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Agricultural Icons
export const RiceIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon rice-icon', className)}
  >
    <path
      d="M12 2L10 8L12 14L14 8L12 2Z M8 6L6 12L8 18L10 12L8 6Z M16 6L14 12L16 18L18 12L16 6Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="12" cy="20" r="1" fill={color} />
    <circle cx="8" cy="20" r="1" fill={color} />
    <circle cx="16" cy="20" r="1" fill={color} />
  </svg>
);

export const WheatIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon wheat-icon', className)}
  >
    <path
      d="M12 2V22 M8 4L12 2L16 4 M7 7L12 5L17 7 M6 10L12 8L18 10 M5 13L12 11L19 13 M4 16L12 14L20 16"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SpiceIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon spice-icon', className)}
  >
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill="none" />
    <path
      d="M12 4V20 M4 12H20 M7.5 7.5L16.5 16.5 M16.5 7.5L7.5 16.5"
      stroke={color}
      strokeWidth="1"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

export const VegetableIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon vegetable-icon', className)}
  >
    <path
      d="M12 2C8 2 6 6 6 10C6 14 8 18 12 22C16 18 18 14 18 10C18 6 16 2 12 2Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M12 2C12 2 10 4 12 6C14 4 12 2 12 2Z"
      fill={color}
    />
  </svg>
);

// Cultural Symbols
export const LotusIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon lotus-icon', className)}
  >
    <path
      d="M12 20C12 20 4 16 4 10C4 6 8 4 12 4C16 4 20 6 20 10C20 16 12 20 12 20Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M12 16C12 16 8 14 8 10C8 8 10 7 12 7C14 7 16 8 16 10C16 14 12 16 12 16Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="12" cy="10" r="2" fill={color} />
  </svg>
);

export const ElephantIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon elephant-icon', className)}
  >
    <path
      d="M4 12C4 8 7 5 11 5H13C17 5 20 8 20 12V16H18V20H16V16H8V20H6V16H4V12Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M4 12C2 12 2 14 4 14"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="9" cy="10" r="1" fill={color} />
    <circle cx="15" cy="10" r="1" fill={color} />
  </svg>
);

export const PeacockIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon peacock-icon', className)}
  >
    <path
      d="M12 18C12 18 8 16 6 12C4 8 6 4 10 4C12 4 14 5 14 7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M14 7C16 5 18 6 20 8C22 10 20 12 18 12C16 12 14 10 14 7Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="10" cy="6" r="1" fill={color} />
    <path
      d="M12 18V22"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Trading Icons
export const MandiIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon mandi-icon', className)}
  >
    <rect x="2" y="8" width="20" height="12" stroke={color} strokeWidth="1.5" fill="none" />
    <path
      d="M2 8L12 2L22 8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <rect x="6" y="12" width="3" height="6" fill={color} />
    <rect x="10.5" y="12" width="3" height="6" fill={color} />
    <rect x="15" y="12" width="3" height="6" fill={color} />
  </svg>
);

export const ScaleIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon scale-icon', className)}
  >
    <path
      d="M12 2V22"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M6 8L12 6L18 8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 8L8 8L6 12L4 8Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M16 8L20 8L18 12L16 8Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

// Voice Interaction Icons
export const VoiceWaveIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon voice-wave-icon', className)}
  >
    <path
      d="M3 12H5L7 8L9 16L11 4L13 20L15 8L17 16L19 12H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TranslateIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon translate-icon', className)}
  >
    <path
      d="M5 8L3 14L5 20"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 8L21 14L19 20"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12H16"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

// Regional Symbols
export const CoconutIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon coconut-icon', className)}
  >
    <ellipse cx="12" cy="14" rx="6" ry="8" stroke={color} strokeWidth="1.5" fill="none" />
    <path
      d="M12 6C12 6 10 4 8 6C6 8 8 10 12 6Z"
      fill={color}
    />
    <circle cx="10" cy="12" r="1" fill={color} />
    <circle cx="14" cy="12" r="1" fill={color} />
    <path
      d="M12 16C10 16 10 18 12 18C14 18 14 16 12 16Z"
      fill={color}
    />
  </svg>
);

export const CamelIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon camel-icon', className)}
  >
    <path
      d="M4 16H6V20H8V16H16V20H18V16H20C20 12 18 10 16 10C14 8 12 8 10 10C8 10 6 12 6 16H4Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M10 10C10 8 11 6 13 6C15 6 16 8 16 10"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="11" cy="8" r="1" fill={color} />
  </svg>
);

// Festival Icons
export const DiyaIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon diya-icon', className)}
  >
    <ellipse cx="12" cy="16" rx="8" ry="4" stroke={color} strokeWidth="1.5" fill="none" />
    <path
      d="M12 12C12 12 10 8 12 6C14 8 12 12 12 12Z"
      fill={color}
    />
    <circle cx="12" cy="16" r="1" fill={color} />
  </svg>
);

export const RangoliIcon: React.FC<IconProps> = ({ size = 24, className, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={cn('cultural-icon rangoli-icon', className)}
  >
    <path
      d="M12 4L16 8L12 12L8 8L12 4Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M12 12L16 16L12 20L8 16L12 12Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M4 12L8 8L12 12L8 16L4 12Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M20 12L16 8L12 12L16 16L20 12Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

// Icon mapping for easy access
export const culturalIcons = {
  // Agricultural
  rice: RiceIcon,
  wheat: WheatIcon,
  spice: SpiceIcon,
  vegetable: VegetableIcon,
  
  // Cultural symbols
  lotus: LotusIcon,
  elephant: ElephantIcon,
  peacock: PeacockIcon,
  
  // Trading
  mandi: MandiIcon,
  scale: ScaleIcon,
  
  // Voice
  voiceWave: VoiceWaveIcon,
  translate: TranslateIcon,
  
  // Regional
  coconut: CoconutIcon,
  camel: CamelIcon,
  
  // Festival
  diya: DiyaIcon,
  rangoli: RangoliIcon
};

// Icon component with cultural context
interface CulturalIconProps extends IconProps {
  name: keyof typeof culturalIcons;
  animated?: boolean;
  culturalContext?: string;
}

export const CulturalIcon: React.FC<CulturalIconProps> = ({
  name,
  size = 24,
  className,
  color,
  animated = false,
  culturalContext,
  ...props
}) => {
  const IconComponent = culturalIcons[name];
  
  if (!IconComponent) {
    console.warn(`Cultural icon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent
      size={size}
      className={cn(
        'cultural-icon',
        animated && 'animate-pulse',
        culturalContext && `context-${culturalContext}`,
        className
      )}
      color={color}
      {...props}
    />
  );
};

export default CulturalIcon;