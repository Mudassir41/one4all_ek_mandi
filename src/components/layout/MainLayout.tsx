'use client';

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { VoiceButton } from '../ui/VoiceButton';

interface MainLayoutProps {
  children: React.ReactNode;
  userType?: 'vendor' | 'b2b' | 'b2c' | 'guest';
  showSidebar?: boolean;
  className?: string;
}

export function MainLayout({ 
  children, 
  userType = 'guest', 
  showSidebar = false,
  className = ''
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-green-50 ${className}`}>
      {/* Header */}
      <Header 
        userType={userType}
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Sidebar for mobile */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userType={userType}
      />

      {/* Main Content */}
      <main className="relative">
        {/* Content Container */}
        <div className="container mx-auto px-4 py-6 lg:py-8">
          {children}
        </div>

        {/* Voice Button - Fixed position for easy access */}
        <VoiceButton 
          className="fixed bottom-6 right-6 z-40"
          size="large"
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}