'use client';

import React from 'react';
import Link from 'next/link';
import { LanguageSelector } from '../ui/LanguageSelector';
import { UserMenu } from '../ui/UserMenu';
import { NotificationBell } from '../ui/NotificationBell';

interface HeaderProps {
  userType: 'vendor' | 'b2b' | 'b2c' | 'guest';
  onMenuClick: () => void;
}

export function Header({ userType, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-cultural border-b border-orange-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-orange-50 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">एम</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                एक भारत एक मंडी
              </h1>
              <p className="text-sm text-gray-600 hidden lg:block">
                Voice-First Trading Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {userType === 'vendor' && (
              <>
                <Link href="/vendor/dashboard" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/vendor/products" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  My Products
                </Link>
                <Link href="/vendor/bids" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Bids
                </Link>
              </>
            )}
            
            {userType === 'b2b' && (
              <>
                <Link href="/b2b/search" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Search Products
                </Link>
                <Link href="/b2b/suppliers" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Suppliers
                </Link>
                <Link href="/b2b/orders" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  My Orders
                </Link>
              </>
            )}
            
            {userType === 'b2c' && (
              <>
                <Link href="/marketplace" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Marketplace
                </Link>
                <Link href="/local-products" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Local Products
                </Link>
                <Link href="/cart" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  Cart
                </Link>
              </>
            )}
            
            {userType === 'guest' && (
              <>
                <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  About
                </Link>
                <Link href="/how-it-works" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                  How It Works
                </Link>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Notifications (for logged in users) */}
            {userType !== 'guest' && (
              <NotificationBell count={3} />
            )}

            {/* User Menu or Auth Buttons */}
            {userType === 'guest' ? (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium transition-colors"
                >
                  Join Now
                </Link>
              </div>
            ) : (
              <UserMenu userType={userType} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}