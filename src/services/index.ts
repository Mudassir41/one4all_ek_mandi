// Service factory - switches between mock and real services based on environment
import { authService as realAuthService } from './auth';
import { productService as realProductService } from './products';
import { translationService as realTranslationService } from './translation';

import { mockAuthService } from './mock-auth';
import { mockProductService } from './mock-products';
import { mockTranslationService } from './mock-translation';

// Check if we should use mock services
const useMockServices = process.env.SKIP_AWS_SERVICES === 'true' || process.env.USE_MOCK_DATA === 'true';

console.log(`🔧 Using ${useMockServices ? 'MOCK' : 'REAL'} services for development`);

// Export the appropriate services
export const authService = useMockServices ? mockAuthService : realAuthService;
export const productService = useMockServices ? mockProductService : realProductService;
export const translationService = useMockServices ? mockTranslationService : realTranslationService;

// Re-export types
export type { User, OTPSession } from './auth';
export type { Product, ProductSearchQuery, ProductSearchResult } from './products';
export type { VoiceTranslationResult, ProductCategorizationResult, PriceSuggestion } from './translation';