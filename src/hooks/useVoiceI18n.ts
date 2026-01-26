'use client';

import { useI18n } from '@/contexts/I18nContext';
import { getVoicePrompts, getAgriculturalTerms } from '@/lib/i18n';

export interface VoiceI18nHook {
  getVoicePrompt: (context: 'price' | 'listing' | 'search' | 'bid') => string;
  getAgriculturalTerms: () => Record<string, string[]>;
  formatVoiceQuery: (template: string, params: Record<string, string>) => string;
  getLanguageSpecificVoiceSettings: () => {
    language: string;
    region: string;
    voiceId?: string;
    speechRate: number;
    pitch: number;
  };
}

export const useVoiceI18n = (): VoiceI18nHook => {
  const { currentLanguage, t } = useI18n();

  const getVoicePrompt = (context: 'price' | 'listing' | 'search' | 'bid'): string => {
    return getVoicePrompts(context, currentLanguage.code);
  };

  const getAgriculturalTermsForLanguage = () => {
    return getAgriculturalTerms(currentLanguage.code);
  };

  const formatVoiceQuery = (template: string, params: Record<string, string>): string => {
    let formatted = template;
    Object.entries(params).forEach(([key, value]) => {
      formatted = formatted.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return formatted;
  };

  const getLanguageSpecificVoiceSettings = () => {
    // Voice settings optimized for different Indian languages
    const voiceSettings = {
      en: {
        language: 'en-IN',
        region: 'India',
        voiceId: 'Aditi', // AWS Polly voice for Indian English
        speechRate: 1.0,
        pitch: 0.0
      },
      hi: {
        language: 'hi-IN',
        region: 'India',
        voiceId: 'Aditi', // AWS Polly supports Hindi
        speechRate: 0.9, // Slightly slower for better comprehension
        pitch: 0.1
      },
      ta: {
        language: 'ta-IN',
        region: 'Tamil Nadu',
        speechRate: 0.9,
        pitch: 0.0
      },
      te: {
        language: 'te-IN',
        region: 'Andhra Pradesh',
        speechRate: 0.9,
        pitch: 0.0
      },
      kn: {
        language: 'kn-IN',
        region: 'Karnataka',
        speechRate: 0.9,
        pitch: 0.0
      },
      bn: {
        language: 'bn-IN',
        region: 'West Bengal',
        speechRate: 0.9,
        pitch: 0.0
      },
      or: {
        language: 'or-IN',
        region: 'Odisha',
        speechRate: 0.9,
        pitch: 0.0
      },
      ml: {
        language: 'ml-IN',
        region: 'Kerala',
        speechRate: 0.9,
        pitch: 0.0
      }
    };

    return voiceSettings[currentLanguage.code as keyof typeof voiceSettings] || voiceSettings.en;
  };

  return {
    getVoicePrompt,
    getAgriculturalTerms: getAgriculturalTermsForLanguage,
    formatVoiceQuery,
    getLanguageSpecificVoiceSettings
  };
};