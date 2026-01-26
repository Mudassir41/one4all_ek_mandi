import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Language } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Language utilities
export function getLanguageName(code: Language): string {
  const languageNames: Record<Language, string> = {
    hindi: 'हिंदी',
    tamil: 'தமிழ்',
    telugu: 'తెలుగు',
    kannada: 'ಕನ್ನಡ',
    bengali: 'বাংলা',
    odia: 'ଓଡ଼ିଆ',
    malayalam: 'മലയാളം',
    english: 'English',
  };
  return languageNames[code] || code;
}

export function getLanguageCode(language: Language): string {
  const languageCodes: Record<Language, string> = {
    hindi: 'hi',
    tamil: 'ta',
    telugu: 'te',
    kannada: 'kn',
    bengali: 'bn',
    odia: 'or',
    malayalam: 'ml',
    english: 'en',
  };
  return languageCodes[language] || 'en';
}

// Format currency for Indian market
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date for Indian locale
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Validate phone number (Indian format)
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Debounce function for search and other operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Check if browser supports required features
export function checkBrowserSupport(): {
  webRTC: boolean;
  mediaRecorder: boolean;
  speechRecognition: boolean;
} {
  return {
    webRTC: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    mediaRecorder: !!(window.MediaRecorder),
    speechRecognition: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
  };
}
// Cultural theme utilities
export const culturalThemes = {
  saffron: {
    primary: '#FF9933',
    secondary: '#FFFFFF',
    accent: '#138808',
  },
  traditional: {
    primary: '#F97316', // Orange
    secondary: '#22C55E', // Green
    accent: '#EAB308', // Golden yellow
  },
  regional: {
    tamil: { primary: '#DC2626', secondary: '#FEF3C7' },
    bengali: { primary: '#7C3AED', secondary: '#FEF3C7' },
    punjabi: { primary: '#F59E0B', secondary: '#DBEAFE' },
    kerala: { primary: '#059669', secondary: '#FEF3C7' },
  }
};

// Responsive breakpoint utilities
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1600px',
};

// Format numbers in Indian numbering system
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

// Get language direction
export function getLanguageDirection(langCode: string): 'ltr' | 'rtl' {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(langCode) ? 'rtl' : 'ltr';
}

// Accessibility utilities
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color library
  return 4.5; // Placeholder
}

export function isHighContrast(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

// Voice interaction utilities
export function isVoiceSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Cultural formatting utilities
export function formatTimeForRegion(date: Date, region: string): string {
  const timeZones: Record<string, string> = {
    'tamil-nadu': 'Asia/Kolkata',
    'kerala': 'Asia/Kolkata',
    'karnataka': 'Asia/Kolkata',
    'telangana': 'Asia/Kolkata',
    'west-bengal': 'Asia/Kolkata',
    'odisha': 'Asia/Kolkata',
    'default': 'Asia/Kolkata',
  };

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: timeZones[region] || timeZones.default,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}