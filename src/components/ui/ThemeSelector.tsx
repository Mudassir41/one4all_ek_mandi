'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { regionalThemes } from '@/lib/cultural-themes';
import { CulturalIcon } from './CulturalIcons';
import { Palette, Sun, Moon, Eye, Settings } from 'lucide-react';

interface ThemeSelectorProps {
  variant?: 'compact' | 'full' | 'modal';
  className?: string;
  onThemeChange?: (theme: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = 'compact',
  className,
  onThemeChange
}) => {
  const {
    currentTheme,
    regionalTheme,
    timeTheme,
    festivalTheme,
    setRegionalTheme,
    toggleDarkMode,
    toggleAccessibilityMode,
    isDarkMode,
    isAccessibilityMode,
    getGreetingForTime
  } = useTheme();
  
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'regional' | 'time' | 'accessibility'>('regional');

  const handleRegionalThemeSelect = (regionKey: string) => {
    setRegionalTheme(regionKey);
    onThemeChange?.(regionKey);
    if (variant === 'compact') {
      setIsOpen(false);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        {/* Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Select theme"
        >
          <Palette size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {regionalTheme.name}
          </span>
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: currentTheme.primary }}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Cultural Themes
              </h3>
              
              {/* Regional Themes */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Regional Themes
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(regionalThemes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => handleRegionalThemeSelect(key)}
                      className={cn(
                        'flex items-center space-x-2 p-2 rounded-lg text-left transition-colors',
                        regionalTheme.name === theme.name
                          ? 'bg-primary-50 border border-primary-200'
                          : 'hover:bg-gray-50 border border-transparent'
                      )}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {theme.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {theme.culturalElements?.colors.join(', ')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Options */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Options
                </h4>
                
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
                    <span className="text-sm text-gray-700">
                      {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <div className={cn(
                    'w-8 h-4 rounded-full transition-colors',
                    isDarkMode ? 'bg-primary-500' : 'bg-gray-300'
                  )}>
                    <div className={cn(
                      'w-3 h-3 rounded-full bg-white transition-transform mt-0.5',
                      isDarkMode ? 'translate-x-4' : 'translate-x-0.5'
                    )} />
                  </div>
                </button>

                <button
                  onClick={toggleAccessibilityMode}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Eye size={16} />
                    <span className="text-sm text-gray-700">
                      High Contrast
                    </span>
                  </div>
                  <div className={cn(
                    'w-8 h-4 rounded-full transition-colors',
                    isAccessibilityMode ? 'bg-primary-500' : 'bg-gray-300'
                  )}>
                    <div className={cn(
                      'w-3 h-3 rounded-full bg-white transition-transform mt-0.5',
                      isAccessibilityMode ? 'translate-x-4' : 'translate-x-0.5'
                    )} />
                  </div>
                </button>
              </div>

              {/* Current Context */}
              {(timeTheme || festivalTheme) && (
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Active Context
                  </h4>
                  
                  {timeTheme && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: timeTheme.primary }}
                      />
                      <span>{timeTheme.name}</span>
                      <span className="text-xs">({getGreetingForTime()})</span>
                    </div>
                  )}
                  
                  {festivalTheme && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CulturalIcon name="diya" size={12} />
                      <span>{festivalTheme.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Palette className="text-primary-600" size={24} />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cultural Themes</h2>
            <p className="text-sm text-gray-600">
              Customize your experience with regional cultural themes
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'regional', label: 'Regional', icon: Palette },
            { key: 'time', label: 'Time-based', icon: Sun },
            { key: 'accessibility', label: 'Accessibility', icon: Eye }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={cn(
                'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === key
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'regional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(regionalThemes).map(([key, theme]) => (
                <div
                  key={key}
                  className={cn(
                    'p-4 border-2 rounded-lg cursor-pointer transition-all',
                    regionalTheme.name === theme.name
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => handleRegionalThemeSelect(key)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-8 h-8 rounded-lg border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{theme.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Colors: {theme.culturalElements?.colors.join(', ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Festivals: {theme.culturalElements?.festivals.join(', ')}
                      </p>
                      
                      {/* Cultural Elements Preview */}
                      <div className="flex items-center space-x-2 mt-2">
                        {theme.culturalElements?.motifs.slice(0, 3).map((motif, index) => (
                          <div
                            key={index}
                            className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                          >
                            {motif}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'time' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Current Time Theme</h3>
                {timeTheme && (
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: timeTheme.primary }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{timeTheme.name}</div>
                      <div className="text-sm text-gray-600">{getGreetingForTime()}</div>
                      <div className="text-sm text-gray-500">Mood: {timeTheme.mood}</div>
                    </div>
                  </div>
                )}
              </div>

              {festivalTheme && (
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                    <CulturalIcon name="diya" size={20} />
                    <span>Active Festival Theme</span>
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: festivalTheme.primary }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{festivalTheme.name}</div>
                      <div className="text-sm text-gray-600">
                        Patterns: {festivalTheme.patterns?.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Moon size={20} />
                      <span className="font-medium text-gray-900">Dark Mode</span>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors',
                        isDarkMode ? 'bg-primary-500' : 'bg-gray-300'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full bg-white transition-transform mt-0.5',
                        isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                      )} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Reduces eye strain in low-light conditions
                  </p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Eye size={20} />
                      <span className="font-medium text-gray-900">High Contrast</span>
                    </div>
                    <button
                      onClick={toggleAccessibilityMode}
                      className={cn(
                        'w-12 h-6 rounded-full transition-colors',
                        isAccessibilityMode ? 'bg-primary-500' : 'bg-gray-300'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full bg-white transition-transform mt-0.5',
                        isAccessibilityMode ? 'translate-x-6' : 'translate-x-0.5'
                      )} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Improves readability for users with visual impairments
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Accessibility Features</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• WCAG 2.1 AA compliant color contrasts</li>
                  <li>• Screen reader optimized</li>
                  <li>• Keyboard navigation support</li>
                  <li>• Voice-first interaction design</li>
                  <li>• Large touch targets for mobile</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ThemeSelector;