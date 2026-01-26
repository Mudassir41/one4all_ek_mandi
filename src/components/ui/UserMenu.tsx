'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  userType: 'vendor' | 'b2b' | 'b2c';
  className?: string;
}

export function UserMenu({ userType, className }: UserMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInfo = () => {
    switch (userType) {
      case 'vendor':
        return {
          name: 'राम कुमार',
          subtitle: 'Farmer, Agra',
          avatar: '👨‍🌾',
          dashboardLink: '/vendor/dashboard',
        };
      case 'b2b':
        return {
          name: 'Rajesh Traders',
          subtitle: 'Wholesale Buyer',
          avatar: '🏢',
          dashboardLink: '/b2b/dashboard',
        };
      case 'b2c':
        return {
          name: 'Priya Sharma',
          subtitle: 'Consumer',
          avatar: '👩',
          dashboardLink: '/consumer/dashboard',
        };
    }
  };

  const userInfo = getUserInfo();

  const menuItems = [
    { href: userInfo.dashboardLink, label: 'Dashboard', icon: '📊' },
    { href: '/profile', label: 'Profile', icon: '👤' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
    { href: '/help', label: 'Help & Support', icon: '❓' },
    { href: '/logout', label: 'Logout', icon: '🚪' },
  ];

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="User menu"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-lg">
          {userInfo.avatar}
        </div>
        <div className="hidden md:block text-left">
          <div className="font-medium text-gray-900">{userInfo.name}</div>
          <div className="text-sm text-gray-600">{userInfo.subtitle}</div>
        </div>
        <svg
          className={cn(
            'w-4 h-4 text-gray-500 transition-transform duration-200 hidden md:block',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-xl">
                {userInfo.avatar}
              </div>
              <div>
                <div className="font-medium text-gray-900">{userInfo.name}</div>
                <div className="text-sm text-gray-600">{userInfo.subtitle}</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-gray-50',
                  item.label === 'Logout' && 'text-red-600 hover:bg-red-50'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="text-xs font-medium text-gray-500 mb-2">Quick Actions</div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-primary-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-primary-600 transition-colors">
                🎤 Voice Chat
              </button>
              <button className="flex-1 bg-secondary-500 text-white py-2 px-3 rounded-lg text-sm hover:bg-secondary-600 transition-colors">
                💰 Price Check
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}