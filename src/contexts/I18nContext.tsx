'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, getLanguageByCode, formatCurrency, formatDate, formatTime, getGreeting } from '@/lib/i18n';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  script: string;
  region: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  greetingTime: {
    morning: [number, number];
    afternoon: [number, number];
    evening: [number, number];
    night: [number, number];
  };
}

interface I18nContextType {
  currentLanguage: Language;
  languages: Language[];
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string, options?: any) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date | string) => string;
  formatTime: (date: Date | string) => string;
  getGreeting: () => string;
  isRTL: boolean;
  loading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Wait for i18n to be initialized
        await i18n.loadNamespaces('common');
        
        const currentLang = getLanguageByCode(i18n.language) || languages[0];
        setCurrentLanguage(currentLang);
        
        // Set document direction and language
        document.documentElement.lang = currentLang.code;
        document.documentElement.dir = currentLang.dir;
        
        // Add language-specific CSS classes
        document.documentElement.className = `lang-${currentLang.code} script-${currentLang.script.toLowerCase()}`;
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
        setLoading(false);
      }
    };

    initializeLanguage();
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    try {
      setLoading(true);
      await i18n.changeLanguage(languageCode);
      
      const newLanguage = getLanguageByCode(languageCode) || languages[0];
      setCurrentLanguage(newLanguage);
      
      // Update document attributes
      document.documentElement.lang = newLanguage.code;
      document.documentElement.dir = newLanguage.dir;
      document.documentElement.className = `lang-${newLanguage.code} script-${newLanguage.script.toLowerCase()}`;
      
      // Store preference
      localStorage.setItem('i18nextLng', languageCode);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to change language:', error);
      setLoading(false);
    }
  };

  const contextValue: I18nContextType = {
    currentLanguage,
    languages,
    changeLanguage,
    t,
    formatCurrency: (amount: number) => formatCurrency(amount, currentLanguage.code),
    formatDate: (date: Date | string) => formatDate(date, currentLanguage.code),
    formatTime: (date: Date | string) => formatTime(date, currentLanguage.code),
    getGreeting: () => getGreeting(currentLanguage.code),
    isRTL: currentLanguage.dir === 'rtl',
    loading
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};