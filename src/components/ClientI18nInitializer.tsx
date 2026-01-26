'use client';

import { useEffect } from 'react';
import '@/lib/i18n'; // Initialize i18n

export function ClientI18nInitializer() {
  useEffect(() => {
    // This component ensures i18n is initialized on the client side
    // The import above triggers the i18n initialization
  }, []);

  return null; // This component doesn't render anything
}