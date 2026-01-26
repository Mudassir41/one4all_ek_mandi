'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface CulturalPatternProps {
  pattern: string;
  className?: string;
  opacity?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

// SVG Pattern Definitions
const patternDefinitions = {
  'kolam': (color: string, opacity: number) => (
    <pattern id="kolam" patternUnits="userSpaceOnUse" width="40" height="40">
      <g opacity={opacity}>
        <path
          d="M20 5 L30 15 L20 25 L10 15 Z M5 20 L15 30 L25 20 L15 10 Z"
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
        <circle cx="20" cy="20" r="3" fill={color} />
      </g>
    </pattern>
  ),

  'mandala': (color: string, opacity: number) => (
    <pattern id="mandala" patternUnits="userSpaceOnUse" width="60" height="60">
      <g opacity={opacity}>
        <circle cx="30" cy="30" r="25" fill="none" stroke={color} strokeWidth="1" />
        <circle cx="30" cy="30" r="15" fill="none" stroke={color} strokeWidth="1" />
        <circle cx="30" cy="30" r="8" fill="none" stroke={color} strokeWidth="1" />
        <path d="M30 5 L35 25 L30 30 L25 25 Z" fill={color} />
        <path d="M55 30 L35 35 L30 30 L35 25 Z" fill={color} />
        <path d="M30 55 L25 35 L30 30 L35 35 Z" fill={color} />
        <path d="M5 30 L25 25 L30 30 L25 35 Z" fill={color} />
      </g>
    </pattern>
  ),

  'paisley': (color: string, opacity: number) => (
    <pattern id="paisley" patternUnits="userSpaceOnUse" width="50" height="50">
      <g opacity={opacity}>
        <path
          d="M25 10 Q35 15 30 25 Q25 35 15 30 Q10 20 15 15 Q20 10 25 10"
          fill={color}
        />
        <path
          d="M25 35 Q15 40 20 50 Q25 60 35 55 Q40 45 35 40 Q30 35 25 35"
          fill={color}
        />
      </g>
    </pattern>
  ),

  'lotus': (color: string, opacity: number) => (
    <pattern id="lotus" patternUnits="userSpaceOnUse" width="80" height="80">
      <g opacity={opacity}>
        <path
          d="M40 20 Q50 25 45 35 Q40 45 35 35 Q30 25 40 20"
          fill={color}
        />
        <path
          d="M40 20 Q30 25 35 35 Q40 45 45 35 Q50 25 40 20"
          fill="none"
          stroke={color}
          strokeWidth="1"
        />
        <circle cx="40" cy="35" r="3" fill={color} />
      </g>
    </pattern>
  ),

  'geometric': (color: string, opacity: number) => (
    <pattern id="geometric" patternUnits="userSpaceOnUse" width="30" height="30">
      <g opacity={opacity}>
        <rect x="5" y="5" width="20" height="20" fill="none" stroke={color} strokeWidth="1" />
        <rect x="10" y="10" width="10" height="10" fill={color} />
        <circle cx="15" cy="15" r="2" fill="white" />
      </g>
    </pattern>
  ),

  'rangoli': (color: string, opacity: number) => (
    <pattern id="rangoli" patternUnits="userSpaceOnUse" width="60" height="60">
      <g opacity={opacity}>
        <path d="M30 10 L40 20 L30 30 L20 20 Z" fill={color} />
        <path d="M30 30 L40 40 L30 50 L20 40 Z" fill={color} />
        <path d="M10 30 L20 20 L30 30 L20 40 Z" fill={color} />
        <path d="M50 30 L40 20 L30 30 L40 40 Z" fill={color} />
        <circle cx="30" cy="30" r="5" fill="white" />
      </g>
    </pattern>
  ),

  'temple-border': (color: string, opacity: number) => (
    <pattern id="temple-border" patternUnits="userSpaceOnUse" width="40" height="20">
      <g opacity={opacity}>
        <path d="M0 20 L10 10 L20 20 L30 10 L40 20" fill="none" stroke={color} strokeWidth="2" />
        <circle cx="10" cy="15" r="2" fill={color} />
        <circle cx="30" cy="15" r="2" fill={color} />
      </g>
    </pattern>
  ),

  'wheat-field': (color: string, opacity: number) => (
    <pattern id="wheat-field" patternUnits="userSpaceOnUse" width="20" height="40">
      <g opacity={opacity}>
        <path d="M10 5 L10 35" stroke={color} strokeWidth="1" />
        <path d="M5 10 L10 5 L15 10" fill="none" stroke={color} strokeWidth="1" />
        <path d="M5 15 L10 10 L15 15" fill="none" stroke={color} strokeWidth="1" />
        <path d="M5 20 L10 15 L15 20" fill="none" stroke={color} strokeWidth="1" />
      </g>
    </pattern>
  ),

  'coconut-palm': (color: string, opacity: number) => (
    <pattern id="coconut-palm" patternUnits="userSpaceOnUse" width="30" height="50">
      <g opacity={opacity}>
        <path d="M15 45 L15 10" stroke={color} strokeWidth="2" />
        <path d="M15 10 Q5 5 10 15" fill="none" stroke={color} strokeWidth="1" />
        <path d="M15 10 Q25 5 20 15" fill="none" stroke={color} strokeWidth="1" />
        <path d="M15 10 Q10 0 5 10" fill="none" stroke={color} strokeWidth="1" />
        <path d="M15 10 Q20 0 25 10" fill="none" stroke={color} strokeWidth="1" />
      </g>
    </pattern>
  ),

  'ikat': (color: string, opacity: number) => (
    <pattern id="ikat" patternUnits="userSpaceOnUse" width="25" height="25">
      <g opacity={opacity}>
        <path d="M0 12.5 Q12.5 0 25 12.5 Q12.5 25 0 12.5" fill={color} />
        <path d="M12.5 0 Q25 12.5 12.5 25 Q0 12.5 12.5 0" fill="none" stroke="white" strokeWidth="1" />
      </g>
    </pattern>
  )
};

export const CulturalPattern: React.FC<CulturalPatternProps> = ({
  pattern,
  className,
  opacity = 0.1,
  color,
  size = 'md',
  animated = false
}) => {
  const { currentTheme } = useTheme();
  const patternColor = color || currentTheme.primary;
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-64 h-64'
  };

  const PatternComponent = patternDefinitions[pattern as keyof typeof patternDefinitions];
  
  if (!PatternComponent) {
    console.warn(`Cultural pattern "${pattern}" not found`);
    return null;
  }

  return (
    <div className={cn(
      'cultural-pattern',
      sizeClasses[size],
      animated && 'animate-pulse',
      className
    )}>
      <svg width="100%" height="100%" className="w-full h-full">
        <defs>
          {PatternComponent(patternColor, opacity)}
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pattern})`} />
      </svg>
    </div>
  );
};

// Background pattern component for larger areas
interface BackgroundPatternProps {
  pattern: string;
  className?: string;
  opacity?: number;
  color?: string;
  overlay?: boolean;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({
  pattern,
  className,
  opacity = 0.05,
  color,
  overlay = false
}) => {
  const { currentTheme } = useTheme();
  const patternColor = color || currentTheme.primary;
  
  const PatternComponent = patternDefinitions[pattern as keyof typeof patternDefinitions];
  
  if (!PatternComponent) {
    return null;
  }

  return (
    <div className={cn(
      'absolute inset-0 pointer-events-none',
      overlay && 'z-10',
      className
    )}>
      <svg width="100%" height="100%" className="w-full h-full">
        <defs>
          {PatternComponent(patternColor, opacity)}
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pattern})`} />
      </svg>
    </div>
  );
};

// Pattern showcase component
interface PatternShowcaseProps {
  patterns?: string[];
  className?: string;
}

export const PatternShowcase: React.FC<PatternShowcaseProps> = ({
  patterns,
  className
}) => {
  const { currentTheme } = useTheme();
  const displayPatterns = patterns || Object.keys(patternDefinitions);

  return (
    <div className={cn('grid grid-cols-3 md:grid-cols-5 gap-4', className)}>
      {displayPatterns.map((pattern) => (
        <div key={pattern} className="text-center">
          <CulturalPattern
            pattern={pattern}
            size="sm"
            className="mx-auto mb-2"
          />
          <div className="text-xs text-gray-600 capitalize">
            {pattern.replace('-', ' ')}
          </div>
        </div>
      ))}
    </div>
  );
};

// Regional pattern sets
export const regionalPatterns = {
  kerala: ['coconut-palm', 'lotus'],
  rajasthan: ['mandala', 'paisley'],
  tamil: ['kolam', 'temple-border'],
  punjab: ['wheat-field', 'geometric'],
  bengal: ['lotus', 'rangoli'],
  karnataka: ['ikat', 'temple-border'],
  andhra: ['ikat', 'temple-border'],
  odisha: ['temple-border', 'lotus']
};

export default CulturalPattern;