'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">एम</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">एक भारत एक मंडी</h3>
                <p className="text-gray-300">Ek Bharath Ek Mandi</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Breaking language barriers in trade through AI-powered voice translation. 
              Connecting India's diverse markets with cultural sensitivity and technological innovation.
            </p>
            
            {/* Cultural Elements */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <span className="w-4 h-3 bg-cultural-saffron rounded-sm"></span>
                <span className="w-4 h-3 bg-cultural-white border border-gray-300 rounded-sm"></span>
                <span className="w-4 h-3 bg-cultural-green rounded-sm"></span>
              </div>
              <span className="text-sm text-gray-400">Made in India with ❤️</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/languages" className="text-gray-300 hover:text-white transition-colors">
                  Supported Languages
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-300 hover:text-white transition-colors">
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Language Support Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <h4 className="text-lg font-semibold mb-4 text-center">भाषा समर्थन | Language Support</h4>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { lang: 'हिंदी', code: 'hi' },
              { lang: 'தமிழ்', code: 'ta' },
              { lang: 'తెలుగు', code: 'te' },
              { lang: 'ಕನ್ನಡ', code: 'kn' },
              { lang: 'বাংলা', code: 'bn' },
              { lang: 'ଓଡ଼ିଆ', code: 'or' },
              { lang: 'മലയാളം', code: 'ml' },
              { lang: 'English', code: 'en' },
            ].map((language) => (
              <span 
                key={language.code}
                className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm border border-gray-700"
              >
                {language.lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Ek Bharath Ek Mandi. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 text-sm">
                🌾 Empowering Indian Agriculture
              </span>
              <span className="text-gray-400 text-sm">
                🤝 Building Bridges Across States
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}