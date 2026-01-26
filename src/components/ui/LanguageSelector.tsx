'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
  onLanguageChange?: (languageCode: string) => void;
}

export function LanguageSelector({ 
  variant = 'compact', 
  className,
  onLanguageChange 
}: LanguageSelectorProps) {
  const { currentLanguage, languages, changeLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setIsOpen(false);
      onLanguageChange?.(languageCode);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  if (variant === 'full') {
    return (
      <div className={cn('space-y-2', className)}>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageSelect(language.code)}
            className={cn(
              'w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left',
              currentLanguage.code === language.code
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'hover:bg-gray-50 text-gray-700'
            )}
          >
            <span className="text-lg">{language.flag}</span>
            <div>
              <div className="font-medium">{language.nativeName}</div>
              <div className="text-sm text-gray-500">{language.name}</div>
              <div className="text-xs text-gray-400">{language.region}</div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        aria-label={t('auth.selectLanguage')}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="font-medium text-gray-700 hidden sm:block">
          {currentLanguage.nativeName}
        </span>
        <svg
          className={cn(
            'w-4 h-4 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
              {t('auth.selectLanguage')}
            </div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={cn(
                  'w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left',
                  currentLanguage.code === language.code
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-gray-50 text-gray-700'
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-sm text-gray-500">{language.name}</div>
                  <div className="text-xs text-gray-400">{language.region}</div>
                </div>
                {currentLanguage.code === language.code && (
                  <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}