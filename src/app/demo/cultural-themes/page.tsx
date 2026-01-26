'use client';

import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import ThemeSelector from '@/components/ui/ThemeSelector';
import { CulturalIcon } from '@/components/ui/CulturalIcons';
import { CulturalPattern, BackgroundPattern, PatternShowcase } from '@/components/ui/CulturalPatterns';
import { VoiceButton } from '@/components/ui/VoiceButton';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export default function CulturalThemesDemo() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <CulturalThemesDemoContent />
      </ThemeProvider>
    </I18nProvider>
  );
}

function CulturalThemesDemoContent() {
  const handleVoiceMessage = async (audioBlob: Blob) => {
    console.log('Voice message received:', audioBlob);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 relative overflow-hidden">
      {/* Background Pattern */}
      <BackgroundPattern pattern="kolam" opacity={0.03} />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-cultural sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">एम</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Cultural Theme System Demo
                  </h1>
                  <p className="text-sm text-gray-600">
                    Ek Bharath Ek Mandi - Cultural Diversity Showcase
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <LanguageSelector />
                <ThemeSelector />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-12">
          
          {/* Hero Section */}
          <section className="text-center space-y-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
                एक भारत एक मंडी
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Experience India's rich cultural diversity through our adaptive theme system
              </p>
              
              {/* Voice Interaction Demo */}
              <div className="flex justify-center items-center space-x-6">
                <VoiceButton
                  size="lg"
                  onVoiceMessage={handleVoiceMessage}
                  title="Try Voice Interaction"
                  placeholder="Say something in any Indian language..."
                />
                <div className="text-left">
                  <p className="text-sm text-gray-600">Try voice interaction</p>
                  <p className="text-xs text-gray-500">Supports 8 Indian languages</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cultural Icons Showcase */}
          <section className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Cultural Icons</h3>
              <p className="text-gray-600">Icons representing India's agricultural and cultural heritage</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {[
                { name: 'rice', label: 'Rice', context: 'agriculture' },
                { name: 'wheat', label: 'Wheat', context: 'agriculture' },
                { name: 'spice', label: 'Spices', context: 'agriculture' },
                { name: 'vegetable', label: 'Vegetables', context: 'agriculture' },
                { name: 'lotus', label: 'Lotus', context: 'cultural' },
                { name: 'elephant', label: 'Elephant', context: 'cultural' },
                { name: 'peacock', label: 'Peacock', context: 'cultural' },
                { name: 'diya', label: 'Diya', context: 'festival' }
              ].map(({ name, label, context }) => (
                <div key={name} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center bg-white rounded-lg shadow-md group-hover:shadow-lg transition-shadow">
                    <CulturalIcon 
                      name={name as any} 
                      size={32} 
                      animated={true}
                      culturalContext={context}
                      className="text-primary-600 group-hover:text-primary-700"
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Regional Themes Showcase */}
          <section className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Regional Themes</h3>
              <p className="text-gray-600">Each region has its unique color palette and cultural elements</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { region: 'Kerala', colors: ['#228B22', '#F59E0B'], pattern: 'coconut-palm', icon: 'coconut' },
                { region: 'Rajasthan', colors: ['#FF9933', '#d97706'], pattern: 'mandala', icon: 'camel' },
                { region: 'Tamil Nadu', colors: ['#8B4513', '#F59E0B'], pattern: 'kolam', icon: 'rice' },
                { region: 'Punjab', colors: ['#F59E0B', '#16a34a'], pattern: 'wheat-field', icon: 'wheat' }
              ].map(({ region, colors, pattern, icon }) => (
                <div key={region} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <CulturalIcon name={icon as any} size={24} />
                    <h4 className="text-lg font-semibold text-gray-900">{region}</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      {colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    <CulturalPattern pattern={pattern} size="sm" />
                    
                    <p className="text-sm text-gray-600">
                      Traditional {pattern.replace('-', ' ')} pattern
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cultural Patterns Showcase */}
          <section className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Cultural Patterns</h3>
              <p className="text-gray-600">Traditional Indian art patterns and motifs</p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-md">
              <PatternShowcase />
            </div>
          </section>

          {/* Voice States Demo */}
          <section className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Voice Interaction States</h3>
              <p className="text-gray-600">Visual feedback for different voice interaction states</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { state: 'idle', label: 'Ready', color: '#6b7280' },
                { state: 'listening', label: 'Listening', color: '#22c55e' },
                { state: 'processing', label: 'Processing', color: '#f59e0b' },
                { state: 'error', label: 'Error', color: '#ef4444' }
              ].map(({ state, label, color }) => (
                <div key={state} className="text-center">
                  <div className="mb-4">
                    <VoiceButton
                      size="lg"
                      className="mx-auto"
                      isActive={state !== 'idle'}
                      disabled={state === 'error'}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-gray-900">{label}</p>
                    <div className="flex items-center justify-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {state}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Theme Controls */}
          <section className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Theme Customization</h3>
              <p className="text-gray-600">Full theme selector with regional and accessibility options</p>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-md">
              <ThemeSelector variant="full" />
            </div>
          </section>

          {/* Accessibility Features */}
          <section className="space-y-6">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Accessibility Features</h3>
              <p className="text-gray-600">WCAG 2.1 AA compliant design with cultural sensitivity</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CulturalIcon name="translate" size={24} className="text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Voice-First Design</h4>
                <p className="text-gray-600 text-sm">
                  Primary interactions through voice with visual support for users with varying literacy levels.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <CulturalIcon name="lotus" size={24} className="text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Cultural Context</h4>
                <p className="text-gray-600 text-sm">
                  Respectful representation of diverse Indian cultures with authentic colors and patterns.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <CulturalIcon name="scale" size={24} className="text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">High Contrast</h4>
                <p className="text-gray-600 text-sm">
                  Accessibility-compliant color contrasts and large touch targets for mobile devices.
                </p>
              </div>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <CulturalIcon name="lotus" size={32} color="white" />
              <h3 className="text-2xl font-bold">एक भारत एक मंडी</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Bridging India's linguistic diversity in trade through cultural-aware design
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>8 Indian Languages</span>
              <span>•</span>
              <span>8 Regional Themes</span>
              <span>•</span>
              <span>Voice-First Design</span>
              <span>•</span>
              <span>WCAG 2.1 AA Compliant</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}