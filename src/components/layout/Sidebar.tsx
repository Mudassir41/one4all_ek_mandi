'use client';

import React from 'react';
import Link from 'next/link';
import { LanguageSelector } from '../ui/LanguageSelector';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'vendor' | 'b2b' | 'b2c' | 'guest';
}

export function Sidebar({ isOpen, onClose, userType }: SidebarProps) {
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getNavigationItems = () => {
    switch (userType) {
      case 'vendor':
        return [
          { href: '/vendor/dashboard', label: 'Dashboard', icon: '📊' },
          { href: '/vendor/products', label: 'My Products', icon: '🌾' },
          { href: '/vendor/bids', label: 'Bids & Orders', icon: '💰' },
          { href: '/vendor/messages', label: 'Messages', icon: '💬' },
          { href: '/vendor/analytics', label: 'Analytics', icon: '📈' },
        ];
      case 'b2b':
        return [
          { href: '/b2b/search', label: 'Search Products', icon: '🔍' },
          { href: '/b2b/suppliers', label: 'Suppliers', icon: '🏭' },
          { href: '/b2b/orders', label: 'My Orders', icon: '📦' },
          { href: '/b2b/messages', label: 'Messages', icon: '💬' },
          { href: '/b2b/analytics', label: 'Analytics', icon: '📊' },
        ];
      case 'b2c':
        return [
          { href: '/marketplace', label: 'Marketplace', icon: '🛒' },
          { href: '/local-products', label: 'Local Products', icon: '🏪' },
          { href: '/cart', label: 'My Cart', icon: '🛍️' },
          { href: '/orders', label: 'My Orders', icon: '📦' },
          { href: '/favorites', label: 'Favorites', icon: '❤️' },
        ];
      default:
        return [
          { href: '/about', label: 'About', icon: 'ℹ️' },
          { href: '/how-it-works', label: 'How It Works', icon: '❓' },
          { href: '/languages', label: 'Languages', icon: '🌐' },
          { href: '/contact', label: 'Contact', icon: '📞' },
        ];
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">एम</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <p className="text-sm text-gray-600">
                {userType === 'guest' ? 'Guest' : userType.toUpperCase()} Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-6">
          <ul className="space-y-2">
            {getNavigationItems().map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-gray-700 group-hover:text-primary-600">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Language Selector */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Language / भाषा</h3>
          <LanguageSelector variant="full" />
        </div>

        {/* Voice Assistant */}
        <div className="p-6 border-t border-gray-200">
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">🎤</span>
              <h3 className="font-medium text-gray-900">Voice Assistant</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Speak in your language for instant help
            </p>
            <button className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors">
              Start Voice Chat
            </button>
          </div>
        </div>

        {/* Auth Actions for Guest */}
        {userType === 'guest' && (
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-3">
              <Link
                href="/login"
                onClick={onClose}
                className="block w-full text-center py-2 px-4 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="block w-full text-center py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Join Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}