'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useI18n } from './I18nContext';
import {
  regionalThemes,
  timeBasedThemes,
  festivalThemes,
  getRegionalTheme,
  getTimeBasedTheme,
  getFestivalTheme,
  generateThemeCSS,
  getAccessibleTheme,
  isAccessibilityMode,
  voiceColors,
  culturalPatterns
} from '@/lib/cultural-themes';

interface ThemeContextType {
  // Current theme state
  currentTheme: any;
  regionalTheme: any;
  timeTheme: any;
  festivalTheme: any;

  // Theme switching
  setRegionalTheme: (region: string) => void;
  toggleDarkMode: () => void;
  toggleAccessibilityMode: () => void;

  // Theme utilities
  isDarkMode: boolean;
  isAccessibilityMode: boolean;
  isVoiceActive: boolean;
  voiceState: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

  // Voice interaction colors
  getVoiceColor: () => string;
  setVoiceState: (state: 'idle' | 'listening' | 'processing' | 'speaking' | 'error') => void;

  // Cultural elements
  getCulturalPattern: (patternName: string) => string;
  getGreetingForTime: () => string;

  // Theme application
  applyTheme: () => void;
  resetToDefault: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultRegion?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultRegion = 'kerala'
}) => {
  const { currentLanguage } = useI18n();

  // Theme state
  const [regionalTheme, setRegionalThemeState] = useState(() => getRegionalTheme(defaultRegion));
  const [timeTheme, setTimeTheme] = useState(() => getTimeBasedTheme());
  const [festivalTheme, setFestivalTheme] = useState(() => getFestivalTheme());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');

  // Computed current theme
  const [currentTheme, setCurrentTheme] = useState(regionalTheme);

  // Initialize theme from localStorage and system preferences
  useEffect(() => {
    const initializeTheme = () => {
      // Load saved preferences
      const savedRegion = localStorage.getItem('cultural-theme-region');
      const savedDarkMode = localStorage.getItem('cultural-theme-dark') === 'true';
      const savedAccessibility = localStorage.getItem('accessibility-mode') === 'true';

      if (savedRegion && regionalThemes[savedRegion as keyof typeof regionalThemes]) {
        setRegionalThemeState(getRegionalTheme(savedRegion));
      }

      setIsDarkMode(savedDarkMode || window.matchMedia('(prefers-color-scheme: dark)').matches);
      setAccessibilityMode(savedAccessibility || isAccessibilityMode());
    };

    initializeTheme();
  }, []);

  // Update time-based theme every hour
  useEffect(() => {
    const updateTimeTheme = () => {
      setTimeTheme(getTimeBasedTheme());
    };

    updateTimeTheme();
    const interval = setInterval(updateTimeTheme, 60 * 60 * 1000); // Every hour

    return () => clearInterval(interval);
  }, []);

  // Update festival theme daily
  useEffect(() => {
    const updateFestivalTheme = () => {
      setFestivalTheme(getFestivalTheme());
    };

    updateFestivalTheme();
    const interval = setInterval(updateFestivalTheme, 24 * 60 * 60 * 1000); // Daily

    return () => clearInterval(interval);
  }, []);

  // Compute current theme based on all factors
  useEffect(() => {
    let theme = { ...regionalTheme };

    // Apply time-based modifications
    if (timeTheme) {
      theme = {
        ...theme,
        primary: timeTheme.primary,
        mood: timeTheme.mood,
        greeting: timeTheme.greeting
      };
    }

    // Apply festival theme if active
    if (festivalTheme) {
      theme = {
        ...theme,
        primary: festivalTheme.primary,
        secondary: festivalTheme.secondary,
        accent: festivalTheme.accent,
        background: festivalTheme.background,
        patterns: [...(theme.patterns || []), ...(festivalTheme.patterns || [])]
      };
    }

    // Apply dark mode
    if (isDarkMode) {
      theme = {
        ...theme,
        background: '#1a1a1a',
        surface: '#2d2d2d',
        text: '#ffffff',
        textMuted: '#cccccc'
      };
    }

    // Apply accessibility mode
    if (accessibilityMode) {
      theme = getAccessibleTheme(theme);
    }

    setCurrentTheme(theme);
  }, [regionalTheme, timeTheme, festivalTheme, isDarkMode, accessibilityMode]);

  // Apply theme to DOM
  useEffect(() => {
    applyTheme();
  }, [currentTheme]);

  // Auto-detect region from language
  useEffect(() => {
    const regionMap: { [key: string]: string } = {
      'ta': 'tamil',
      'kn': 'karnataka',
      'te': 'andhra',
      'ml': 'kerala',
      'bn': 'bengal',
      'or': 'odisha',
      'hi': 'rajasthan', // Default for Hindi
      'en': 'kerala' // Default for English
    };

    const suggestedRegion = regionMap[currentLanguage.code];
    if (suggestedRegion && !localStorage.getItem('cultural-theme-region')) {
      setRegionalTheme(suggestedRegion);
    }
  }, [currentLanguage]);

  const setRegionalTheme = (region: string) => {
    const theme = getRegionalTheme(region);
    setRegionalThemeState(theme);
    localStorage.setItem('cultural-theme-region', region);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('cultural-theme-dark', newDarkMode.toString());
  };

  const toggleAccessibilityMode = () => {
    const newAccessibilityMode = !accessibilityMode;
    setAccessibilityMode(newAccessibilityMode);
    localStorage.setItem('accessibility-mode', newAccessibilityMode.toString());
  };

  const getVoiceColor = () => {
    switch (voiceState) {
      case 'listening':
        return voiceColors.listening.primary;
      case 'processing':
        return voiceColors.processing.primary;
      case 'speaking':
        return voiceColors.speaking.primary;
      case 'error':
        return voiceColors.error.primary;
      default:
        return currentTheme.primary;
    }
  };

  const getCulturalPattern = (patternName: string) => {
    return culturalPatterns[patternName as keyof typeof culturalPatterns]?.svg || '';
  };

  const getGreetingForTime = () => {
    return timeTheme?.greeting || 'नमस्कार / Namaste';
  };

  const applyTheme = () => {
    if (typeof document === 'undefined') return;

    // Apply CSS custom properties
    const css = generateThemeCSS(currentTheme);

    // Remove existing theme style
    const existingStyle = document.getElementById('cultural-theme-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new theme style
    const style = document.createElement('style');
    style.id = 'cultural-theme-style';
    style.textContent = css;
    document.head.appendChild(style);

    // Apply theme classes to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .replace(/voice-\w+/g, '');

    const classesToAdd = [
      `theme-${regionalTheme.name.toLowerCase().replace(/\s+/g, '-')}`,
      `voice-${voiceState}`,
      isDarkMode ? 'dark-mode' : 'light-mode',
      accessibilityMode ? 'accessibility-mode' : ''
    ].filter(Boolean);

    if (classesToAdd.length > 0) {
      document.body.classList.add(...classesToAdd);
    }

    // Apply cultural patterns as CSS variables
    if (currentTheme.patterns) {
      currentTheme.patterns.forEach((pattern: string) => {
        const patternSvg = getCulturalPattern(pattern);
        if (patternSvg) {
          document.documentElement.style.setProperty(
            `--pattern-${pattern}`,
            `url("data:image/svg+xml,${encodeURIComponent(patternSvg)}")`
          );
        }
      });
    }
  };

  const resetToDefault = () => {
    setRegionalThemeState(getRegionalTheme('kerala'));
    setIsDarkMode(false);
    setAccessibilityMode(false);
    setVoiceState('idle');

    localStorage.removeItem('cultural-theme-region');
    localStorage.removeItem('cultural-theme-dark');
    localStorage.removeItem('accessibility-mode');
  };

  const contextValue: ThemeContextType = {
    currentTheme,
    regionalTheme,
    timeTheme,
    festivalTheme,
    setRegionalTheme,
    toggleDarkMode,
    toggleAccessibilityMode,
    isDarkMode,
    isAccessibilityMode: accessibilityMode,
    isVoiceActive: voiceState !== 'idle',
    voiceState,
    getVoiceColor,
    setVoiceState,
    getCulturalPattern,
    getGreetingForTime,
    applyTheme,
    resetToDefault
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};