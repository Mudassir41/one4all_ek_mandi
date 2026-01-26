'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Grid, GridItem } from '@/components/ui/Grid';
import { ProductCard } from '@/components/ui/ProductCard';
import { VoiceModal } from '@/components/ui/Modal';
import { VoiceButton } from '@/components/ui/VoiceButton';

// Mock product data
const mockProducts = [
  {
    id: '1',
    title: 'ताजे टमाटर',
    description: 'Farm fresh tomatoes from Agra. Organic and pesticide-free.',
    price: {
      wholesale: { min_quantity: 100, price: 35 },
      retail: { price: 45 },
    },
    images: ['/api/placeholder/300/200'],
    vendor: {
      name: 'राम कुमार',
      location: 'Agra, Uttar Pradesh',
      rating: 4.8,
      verified: true,
    },
    category: 'Vegetables',
    language: 'hi',
  },
  {
    id: '2',
    title: 'புதிய தக்காளி',
    description: 'Fresh tomatoes from Tamil Nadu farms. High quality produce.',
    price: {
      wholesale: { min_quantity: 50, price: 40 },
      retail: { price: 50 },
    },
    images: ['/api/placeholder/300/200'],
    vendor: {
      name: 'முருகன்',
      location: 'Coimbatore, Tamil Nadu',
      rating: 4.9,
      verified: true,
    },
    category: 'Vegetables',
    language: 'ta',
  },
  {
    id: '3',
    title: 'Kerala Spices Mix',
    description: 'Authentic spice blend from Kerala. Perfect for traditional cooking.',
    price: {
      retail: { price: 250 },
    },
    images: ['/api/placeholder/300/200'],
    vendor: {
      name: 'രാജു',
      location: 'Kochi, Kerala',
      rating: 4.7,
      verified: true,
    },
    category: 'Spices',
    language: 'ml',
  },
  {
    id: '4',
    title: 'তাজা মাছ',
    description: 'Fresh fish from Bengal rivers. Caught this morning.',
    price: {
      wholesale: { min_quantity: 10, price: 180 },
      retail: { price: 220 },
    },
    images: ['/api/placeholder/300/200'],
    vendor: {
      name: 'রহিম মিয়া',
      location: 'Kolkata, West Bengal',
      rating: 4.6,
      verified: true,
    },
    category: 'Seafood',
    language: 'bn',
  },
];

export default function LayoutDemoPage() {
  const [voiceModalOpen, setVoiceModalOpen] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [translation, setTranslation] = React.useState('');

  const handleVoiceChat = (productId: string) => {
    console.log('Starting voice chat for product:', productId);
    setVoiceModalOpen(true);
  };

  const handleBid = (productId: string) => {
    console.log('Placing bid for product:', productId);
  };

  const handleBuy = (productId: string) => {
    console.log('Buying product:', productId);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording
    setTimeout(() => {
      setTranscript('मुझे टमाटर चाहिए। क्या आप दिल्ली तक डिलीवरी कर सकते हैं?');
      setTimeout(() => {
        setTranslation('I need tomatoes. Can you deliver to Delhi?');
      }, 1000);
    }, 2000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  return (
    <MainLayout userType="b2c" showSidebar>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Layout Components Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Showcasing responsive layout components for the voice-first trading platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setVoiceModalOpen(true)}
              className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              🎤 Test Voice Modal
            </button>
            <button className="bg-secondary-500 text-white px-6 py-3 rounded-lg hover:bg-secondary-600 transition-colors font-medium">
              🔍 Browse Products
            </button>
          </div>
        </section>

        {/* Grid System Demo */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Responsive Grid System</h2>
          
          {/* Basic Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Basic Grid (1-2-3 columns)</h3>
            <Grid cols={1} responsive={{ sm: 2, lg: 3 }} gap="lg">
              <div className="bg-primary-100 p-6 rounded-lg text-center">
                <h4 className="font-semibold text-primary-800">Column 1</h4>
                <p className="text-primary-600">Mobile: Full width</p>
                <p className="text-primary-600">Tablet: Half width</p>
                <p className="text-primary-600">Desktop: Third width</p>
              </div>
              <div className="bg-secondary-100 p-6 rounded-lg text-center">
                <h4 className="font-semibold text-secondary-800">Column 2</h4>
                <p className="text-secondary-600">Responsive design</p>
                <p className="text-secondary-600">Cultural colors</p>
                <p className="text-secondary-600">Accessible layout</p>
              </div>
              <div className="bg-accent-100 p-6 rounded-lg text-center">
                <h4 className="font-semibold text-accent-800">Column 3</h4>
                <p className="text-accent-600">Voice-first approach</p>
                <p className="text-accent-600">Mobile optimized</p>
                <p className="text-accent-600">Touch-friendly</p>
              </div>
            </Grid>
          </div>

          {/* Complex Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Complex Grid Layout</h3>
            <Grid cols={4} gap="md" className="min-h-64">
              <GridItem span={2} className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg p-6 text-white">
                <h4 className="text-2xl font-bold mb-2">Featured Product</h4>
                <p className="text-primary-100">Large featured area spanning 2 columns</p>
              </GridItem>
              <GridItem className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800">Quick Stats</h5>
                <p className="text-2xl font-bold text-primary-600">1,234</p>
                <p className="text-sm text-gray-600">Active Vendors</p>
              </GridItem>
              <GridItem className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800">Languages</h5>
                <p className="text-2xl font-bold text-secondary-600">8+</p>
                <p className="text-sm text-gray-600">Supported</p>
              </GridItem>
            </Grid>
          </div>
        </section>

        {/* Product Cards Demo */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Product Cards</h2>
          
          {/* Default Cards */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Default Product Cards</h3>
            <Grid cols={1} responsive={{ sm: 2, lg: 3, xl: 4 }} gap="lg">
              {mockProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onVoiceChat={() => handleVoiceChat(product.id)}
                  onBid={() => handleBid(product.id)}
                  onBuy={() => handleBuy(product.id)}
                />
              ))}
            </Grid>
          </div>

          {/* Compact Cards */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Compact Product Cards</h3>
            <Grid cols={1} responsive={{ sm: 2, lg: 3 }} gap="md">
              {mockProducts.slice(0, 3).map((product) => (
                <ProductCard
                  key={`compact-${product.id}`}
                  product={product}
                  variant="compact"
                />
              ))}
            </Grid>
          </div>
        </section>

        {/* Voice Interaction Demo */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Voice Interaction Components</h2>
          
          <div className="bg-white rounded-lg p-8 shadow-cultural">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Voice Button Sizes</h3>
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="text-center">
                <VoiceButton size="small" className="mb-2" />
                <p className="text-sm text-gray-600">Small</p>
              </div>
              <div className="text-center">
                <VoiceButton size="medium" className="mb-2" />
                <p className="text-sm text-gray-600">Medium</p>
              </div>
              <div className="text-center">
                <VoiceButton size="large" className="mb-2" />
                <p className="text-sm text-gray-600">Large</p>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Interactive Voice Button</h4>
              <VoiceButton
                size="large"
                isRecording={isRecording}
                onStartRecording={handleStartRecording}
                onStopRecording={handleStopRecording}
              />
              <p className="text-sm text-gray-600 mt-2">
                Hold to record • Release to translate
              </p>
            </div>
          </div>
        </section>

        {/* Cultural Elements Demo */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Cultural Design Elements</h2>
          
          <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="lg">
            <div className="bg-gradient-to-br from-cultural-saffron to-cultural-white rounded-lg p-6 text-center">
              <h4 className="text-xl font-bold text-gray-900 mb-2">Saffron Theme</h4>
              <p className="text-gray-700">Traditional Indian colors</p>
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-6 h-6 bg-cultural-saffron rounded"></div>
                <div className="w-6 h-6 bg-cultural-white border border-gray-300 rounded"></div>
                <div className="w-6 h-6 bg-cultural-green rounded"></div>
              </div>
            </div>

            <div className="bg-white border-2 border-primary-200 rounded-lg p-6 text-center">
              <h4 className="text-xl font-bold text-primary-800 mb-2">Primary Theme</h4>
              <p className="text-primary-600">Modern orange palette</p>
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-6 h-6 bg-primary-300 rounded"></div>
                <div className="w-6 h-6 bg-primary-500 rounded"></div>
                <div className="w-6 h-6 bg-primary-700 rounded"></div>
              </div>
            </div>

            <div className="bg-white border-2 border-secondary-200 rounded-lg p-6 text-center">
              <h4 className="text-xl font-bold text-secondary-800 mb-2">Secondary Theme</h4>
              <p className="text-secondary-600">Natural green palette</p>
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-6 h-6 bg-secondary-300 rounded"></div>
                <div className="w-6 h-6 bg-secondary-500 rounded"></div>
                <div className="w-6 h-6 bg-secondary-700 rounded"></div>
              </div>
            </div>
          </Grid>
        </section>

        {/* Language Support Demo */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Multilingual Support</h2>
          
          <div className="bg-white rounded-lg p-8 shadow-cultural">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Supported Languages | समर्थित भाषाएं
            </h3>
            <Grid cols={2} responsive={{ sm: 3, md: 4, lg: 8 }} gap="md">
              {[
                { lang: 'हिंदी', code: 'HI' },
                { lang: 'தமிழ்', code: 'TA' },
                { lang: 'తెలుగు', code: 'TE' },
                { lang: 'ಕನ್ನಡ', code: 'KN' },
                { lang: 'বাংলা', code: 'BN' },
                { lang: 'ଓଡ଼ିଆ', code: 'OR' },
                { lang: 'മലയാളം', code: 'ML' },
                { lang: 'English', code: 'EN' },
              ].map((language) => (
                <div
                  key={language.code}
                  className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-4 text-center border border-primary-100 hover:border-primary-300 transition-colors"
                >
                  <div className="text-2xl mb-2">🇮🇳</div>
                  <div className="font-medium text-gray-900">{language.lang}</div>
                  <div className="text-xs text-gray-600">{language.code}</div>
                </div>
              ))}
            </Grid>
          </div>
        </section>
      </div>

      {/* Voice Modal */}
      <VoiceModal
        isOpen={voiceModalOpen}
        onClose={() => {
          setVoiceModalOpen(false);
          setTranscript('');
          setTranslation('');
          setIsRecording(false);
        }}
        isRecording={isRecording}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        transcript={transcript}
        translation={translation}
        targetLanguage="English"
      />
    </MainLayout>
  );
}