import { 
  languages, 
  formatCurrency, 
  formatNumber, 
  formatDate, 
  formatTime, 
  getGreeting, 
  getLanguageByCode, 
  isRTL,
  getVoicePrompts,
  getAgriculturalTerms
} from '../i18n';

// Mock Date for consistent testing
const mockDate = new Date('2024-01-26T10:30:00Z');

describe('i18n Configuration', () => {
  test('should have all required languages', () => {
    const expectedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'bn', 'or', 'ml'];
    const actualLanguages = languages.map(lang => lang.code);
    
    expectedLanguages.forEach(lang => {
      expect(actualLanguages).toContain(lang);
    });
  });

  test('should have proper language structure', () => {
    languages.forEach(lang => {
      expect(lang).toHaveProperty('code');
      expect(lang).toHaveProperty('name');
      expect(lang).toHaveProperty('nativeName');
      expect(lang).toHaveProperty('flag');
      expect(lang).toHaveProperty('dir');
      expect(lang).toHaveProperty('script');
      expect(lang).toHaveProperty('region');
      expect(lang).toHaveProperty('currency');
      expect(lang).toHaveProperty('dateFormat');
      expect(lang).toHaveProperty('numberFormat');
      expect(lang).toHaveProperty('greetingTime');
    });
  });

  test('should find language by code', () => {
    const hindi = getLanguageByCode('hi');
    expect(hindi).toBeDefined();
    expect(hindi?.name).toBe('Hindi');
    expect(hindi?.nativeName).toBe('हिंदी');

    const tamil = getLanguageByCode('ta');
    expect(tamil).toBeDefined();
    expect(tamil?.name).toBe('Tamil');
    expect(tamil?.nativeName).toBe('தமிழ்');
  });

  test('should return undefined for invalid language code', () => {
    const invalid = getLanguageByCode('invalid');
    expect(invalid).toBeUndefined();
  });
});

describe('Currency Formatting', () => {
  test('should format currency in Indian format', () => {
    const amount = 123456.78;
    const formatted = formatCurrency(amount, 'en');
    expect(formatted).toMatch(/₹.*1,23,456/); // Indian number format
  });

  test('should format currency for different locales', () => {
    const amount = 1000;
    
    const enFormatted = formatCurrency(amount, 'en');
    const hiFormatted = formatCurrency(amount, 'hi');
    
    expect(enFormatted).toContain('₹');
    expect(hiFormatted).toContain('₹');
  });
});

describe('Number Formatting', () => {
  test('should format numbers in Indian format', () => {
    const number = 1234567;
    const formatted = formatNumber(number, 'en');
    expect(formatted).toBe('12,34,567'); // Indian lakh system
  });
});

describe('Date and Time Formatting', () => {
  test('should format date correctly', () => {
    const formatted = formatDate(mockDate, 'en');
    expect(formatted).toMatch(/26.*Jan.*2024/);
  });

  test('should format time correctly', () => {
    // The mockDate is in UTC, but formatting uses local timezone
    // So we'll just check that it returns a valid time format
    const formatted = formatTime(mockDate, 'en');
    expect(formatted).toMatch(/\d{1,2}:\d{2}.*[ap]m/i);
  });
});

describe('Greeting System', () => {
  test('should return appropriate greeting based on time', () => {
    // Use jest.spyOn to mock Date.prototype.getHours
    const mockGetHours = jest.spyOn(Date.prototype, 'getHours');
    
    // Morning (8 AM)
    mockGetHours.mockReturnValue(8);
    let greeting = getGreeting('en');
    expect(greeting).toContain('morning');

    // Afternoon (2 PM)
    mockGetHours.mockReturnValue(14);
    greeting = getGreeting('en');
    expect(greeting).toContain('afternoon');

    // Evening (7 PM)
    mockGetHours.mockReturnValue(19);
    greeting = getGreeting('en');
    expect(greeting).toContain('evening');

    // Night (11 PM)
    mockGetHours.mockReturnValue(23);
    greeting = getGreeting('en');
    expect(greeting).toContain('night');

    // Restore the original implementation
    mockGetHours.mockRestore();
  });
});

describe('RTL Support', () => {
  test('should correctly identify RTL languages', () => {
    // Currently all Indian languages are LTR
    expect(isRTL('en')).toBe(false);
    expect(isRTL('hi')).toBe(false);
    expect(isRTL('ta')).toBe(false);
    expect(isRTL('ar')).toBe(false); // Arabic not in our list, should default to false
  });
});

describe('Voice Prompts', () => {
  test('should return voice prompts for different contexts', () => {
    const pricePrompt = getVoicePrompts('price', 'en');
    const listingPrompt = getVoicePrompts('listing', 'en');
    const searchPrompt = getVoicePrompts('search', 'en');
    const bidPrompt = getVoicePrompts('bid', 'en');

    expect(pricePrompt).toBeDefined();
    expect(listingPrompt).toBeDefined();
    expect(searchPrompt).toBeDefined();
    expect(bidPrompt).toBeDefined();

    expect(typeof pricePrompt).toBe('string');
    expect(typeof listingPrompt).toBe('string');
    expect(typeof searchPrompt).toBe('string');
    expect(typeof bidPrompt).toBe('string');
  });

  test('should return prompts in different languages', () => {
    const enPrompt = getVoicePrompts('price', 'en');
    const hiPrompt = getVoicePrompts('price', 'hi');
    const taPrompt = getVoicePrompts('price', 'ta');

    expect(enPrompt).toBeDefined();
    expect(hiPrompt).toBeDefined();
    expect(taPrompt).toBeDefined();

    // They should be different (unless fallback is used)
    expect(enPrompt).not.toBe(hiPrompt);
  });
});

describe('Agricultural Terms', () => {
  test('should return agricultural terms for supported languages', () => {
    const enTerms = getAgriculturalTerms('en');
    const hiTerms = getAgriculturalTerms('hi');
    const taTerms = getAgriculturalTerms('ta');

    expect(enTerms).toBeDefined();
    expect(hiTerms).toBeDefined();
    expect(taTerms).toBeDefined();

    expect(enTerms).toHaveProperty('vegetables');
    expect(enTerms).toHaveProperty('fruits');
    expect(enTerms).toHaveProperty('grains');
    expect(enTerms).toHaveProperty('spices');

    expect(Array.isArray(enTerms.vegetables)).toBe(true);
    expect(enTerms.vegetables.length).toBeGreaterThan(0);
  });

  test('should fallback to English for unsupported languages', () => {
    const unsupportedTerms = getAgriculturalTerms('unsupported');
    const enTerms = getAgriculturalTerms('en');

    expect(unsupportedTerms).toEqual(enTerms);
  });
});

describe('Language Configuration Validation', () => {
  test('should have valid script names', () => {
    const validScripts = [
      'Latin', 'Devanagari', 'Tamil', 'Telugu', 'Kannada', 
      'Bengali', 'Odia', 'Malayalam'
    ];

    languages.forEach(lang => {
      expect(validScripts).toContain(lang.script);
    });
  });

  test('should have valid direction values', () => {
    languages.forEach(lang => {
      expect(['ltr', 'rtl']).toContain(lang.dir);
    });
  });

  test('should have valid currency codes', () => {
    languages.forEach(lang => {
      expect(lang.currency).toBe('INR');
    });
  });

  test('should have valid greeting time ranges', () => {
    languages.forEach(lang => {
      expect(lang.greetingTime).toHaveProperty('morning');
      expect(lang.greetingTime).toHaveProperty('afternoon');
      expect(lang.greetingTime).toHaveProperty('evening');
      expect(lang.greetingTime).toHaveProperty('night');

      // Check that time ranges are valid arrays with 2 numbers
      Object.values(lang.greetingTime).forEach(timeRange => {
        expect(Array.isArray(timeRange)).toBe(true);
        expect(timeRange).toHaveLength(2);
        expect(typeof timeRange[0]).toBe('number');
        expect(typeof timeRange[1]).toBe('number');
        expect(timeRange[0]).toBeGreaterThanOrEqual(0);
        expect(timeRange[1]).toBeLessThanOrEqual(24);
      });
    });
  });
});