'use client';

import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useVoiceI18n } from '@/hooks/useVoiceI18n';
import { LanguageSelector } from '@/components/ui/LanguageSelector';

export default function I18nDemoPage() {
  const { 
    currentLanguage, 
    t, 
    formatCurrency, 
    formatDate, 
    formatTime, 
    getGreeting,
    isRTL 
  } = useI18n();
  
  const { 
    getVoicePrompt, 
    getAgriculturalTerms, 
    formatVoiceQuery,
    getLanguageSpecificVoiceSettings 
  } = useVoiceI18n();

  const [selectedContext, setSelectedContext] = React.useState<'price' | 'listing' | 'search' | 'bid'>('price');
  const [sampleProduct, setSampleProduct] = React.useState('tomatoes');
  const [sampleLocation, setSampleLocation] = React.useState('Mumbai');

  const agriculturalTerms = getAgriculturalTerms();
  const voiceSettings = getLanguageSpecificVoiceSettings();
  const currentTime = new Date();

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('app.name')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('app.tagline')}
              </p>
            </div>
            <LanguageSelector />
          </div>
        </div>

        {/* Current Language Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('common.info')}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">{t('navigation.profile')}:</span>
                <div className="font-medium">{currentLanguage.nativeName}</div>
                <div className="text-sm text-gray-500">{currentLanguage.name}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Script:</span>
                <div className="font-medium">{currentLanguage.script}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Region:</span>
                <div className="font-medium">{currentLanguage.region}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Direction:</span>
                <div className="font-medium">{currentLanguage.dir.toUpperCase()}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {getGreeting()}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">{t('time.now')}:</span>
                <div className="font-medium">{formatTime(currentTime)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">{t('common.info')}:</span>
                <div className="font-medium">{formatDate(currentTime)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">{t('currency.rupees')}:</span>
                <div className="font-medium">{formatCurrency(1250)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Voice Settings
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Language:</span>
                <div className="font-medium">{voiceSettings.language}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Speech Rate:</span>
                <div className="font-medium">{voiceSettings.speechRate}x</div>
              </div>
              {voiceSettings.voiceId && (
                <div>
                  <span className="text-sm text-gray-500">Voice ID:</span>
                  <div className="font-medium">{voiceSettings.voiceId}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Voice Prompts Demo */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('voice.voiceMessage')} {t('common.info')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Context
              </label>
              <select
                value={selectedContext}
                onChange={(e) => setSelectedContext(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="price">{t('pricing.priceDiscovery')}</option>
                <option value="listing">{t('products.addProduct')}</option>
                <option value="search">{t('search.searchProducts')}</option>
                <option value="bid">{t('bidding.placeBid')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Recording
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Voice recording component will be integrated here
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Current Voice Prompt:
            </h3>
            <p className="text-gray-700">
              {getVoicePrompt(selectedContext)}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('products.productName')}
              </label>
              <input
                type="text"
                value={sampleProduct}
                onChange={(e) => setSampleProduct(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={sampleLocation}
                onChange={(e) => setSampleLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Formatted Query Example:
            </h3>
            <p className="text-gray-700">
              {formatVoiceQuery(
                t('voice_prompts.priceQuery'),
                { product: sampleProduct, location: sampleLocation }
              )}
            </p>
          </div>
        </div>

        {/* Agricultural Terms */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('categories.agriculture')} Terms
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(agriculturalTerms).map(([category, terms]) => (
              <div key={category}>
                <h3 className="font-medium text-gray-900 mb-2 capitalize">
                  {t(`categories.${category}`) || category}
                </h3>
                <ul className="space-y-1">
                  {terms.slice(0, 6).map((term, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Demo */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('navigation.home')} Elements
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'home', 'products', 'vendors', 'buyers', 'dashboard', 'profile'
            ].map((key) => (
              <button
                key={key}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
              >
                {t(`navigation.${key}`)}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                {t('common.save')} Actions
              </h3>
              <div className="space-y-2">
                {['save', 'cancel', 'delete', 'edit'].map((action) => (
                  <button
                    key={action}
                    className="block w-full text-left px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                  >
                    {t(`common.${action}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                {t('bidding.placeBid')}
              </h3>
              <div className="space-y-2">
                {['placeBid', 'currentBid', 'acceptBid', 'rejectBid'].map((bid) => (
                  <div key={bid} className="text-sm text-gray-600">
                    {t(`bidding.${bid}`)}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">
                {t('greetings.welcome')}
              </h3>
              <div className="space-y-2">
                {['morning', 'afternoon', 'evening', 'night'].map((time) => (
                  <div key={time} className="text-sm text-gray-600">
                    {t(`greetings.${time}`)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}