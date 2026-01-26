'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { User, MapPin, Languages, Building, Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  phone: string;
  onSuccess?: () => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
];

export function RegistrationForm({ phone, onSuccess }: RegistrationFormProps) {
  const { t } = useTranslation();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: '' as 'vendor' | 'b2b_buyer' | 'b2c_buyer' | '',
    languages: [] as string[],
    location: {
      state: '',
      district: '',
      coordinates: [0, 0] as [number, number]
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageToggle = (langCode: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(langCode)
        ? prev.languages.filter(l => l !== langCode)
        : [...prev.languages, langCode]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get user's location if available
      if (navigator.geolocation && formData.location.coordinates[0] === 0) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                coordinates: [position.coords.latitude, position.coords.longitude]
              }
            }));
          },
          () => {
            // Use default coordinates if geolocation fails
            console.log('Geolocation not available, using default coordinates');
          }
        );
      }

      await register({
        phone,
        name: formData.name,
        email: formData.email || undefined,
        userType: formData.userType,
        languages: formData.languages,
        location: formData.location
      });

      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.name && formData.userType && formData.languages.length > 0 && 
                     formData.location.state && formData.location.district;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('auth.completeProfile')}
        </h2>
        <p className="text-gray-600">
          {t('auth.registrationSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            {t('auth.personalInfo')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.fullName')} *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* User Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            {t('auth.userType')} *
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'vendor', label: t('auth.vendor'), desc: t('auth.vendorDesc') },
              { value: 'b2b_buyer', label: t('auth.b2bBuyer'), desc: t('auth.b2bBuyerDesc') },
              { value: 'b2c_buyer', label: t('auth.b2cBuyer'), desc: t('auth.b2cBuyerDesc') }
            ].map((type) => (
              <label
                key={type.value}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                  formData.userType === type.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="userType"
                  value={type.value}
                  checked={formData.userType === type.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value as any }))}
                  className="sr-only"
                />
                <div className="font-medium text-gray-900">{type.label}</div>
                <div className="text-sm text-gray-600 mt-1">{type.desc}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Languages className="w-5 h-5 mr-2" />
            {t('auth.languages')} *
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <label
                key={lang.code}
                className={`cursor-pointer border-2 rounded-lg p-3 transition-colors ${
                  formData.languages.includes(lang.code)
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang.code)}
                  onChange={() => handleLanguageToggle(lang.code)}
                  className="sr-only"
                />
                <div className="font-medium text-gray-900 text-sm">{lang.name}</div>
                <div className="text-xs text-gray-600">{lang.native}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            {t('auth.location')} *
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.state')} *
              </label>
              <select
                id="state"
                value={formData.location.state}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, state: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">{t('auth.selectState')}</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.district')} *
              </label>
              <input
                id="district"
                type="text"
                value={formData.location.district}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location, district: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full bg-orange-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            t('auth.completeRegistration')
          )}
        </button>
      </form>
    </div>
  );
}