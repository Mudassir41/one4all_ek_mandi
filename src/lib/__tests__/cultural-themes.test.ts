/**
 * @jest-environment jsdom
 */

import {
  regionalThemes,
  timeBasedThemes,
  festivalThemes,
  getRegionalTheme,
  getTimeBasedTheme,
  getFestivalTheme,
  generateThemeCSS,
  isAccessibilityMode,
  getAccessibleTheme,
  indianColors,
  accessibleCombinations
} from '../cultural-themes';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Set up localStorage mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Cultural Themes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Regional Themes', () => {
    test('should have all required regional themes', () => {
      const expectedRegions = [
        'kerala', 'rajasthan', 'punjab', 'bengal', 
        'tamil', 'karnataka', 'andhra', 'odisha'
      ];
      
      expectedRegions.forEach(region => {
        expect(regionalThemes).toHaveProperty(region);
      });
    });

    test('should have valid theme structure for each region', () => {
      Object.values(regionalThemes).forEach(theme => {
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('primary');
        expect(theme).toHaveProperty('secondary');
        expect(theme).toHaveProperty('accent');
        expect(theme).toHaveProperty('background');
        expect(theme).toHaveProperty('surface');
        expect(theme).toHaveProperty('text');
        expect(theme).toHaveProperty('textMuted');
        expect(theme).toHaveProperty('patterns');
        expect(theme).toHaveProperty('culturalElements');
        
        // Validate cultural elements structure
        expect(theme.culturalElements).toHaveProperty('motifs');
        expect(theme.culturalElements).toHaveProperty('colors');
        expect(theme.culturalElements).toHaveProperty('festivals');
        
        expect(Array.isArray(theme.patterns)).toBe(true);
        expect(Array.isArray(theme.culturalElements.motifs)).toBe(true);
        expect(Array.isArray(theme.culturalElements.colors)).toBe(true);
        expect(Array.isArray(theme.culturalElements.festivals)).toBe(true);
      });
    });

    test('should return valid theme for getRegionalTheme', () => {
      const theme = getRegionalTheme('kerala');
      expect(theme).toBeDefined();
      expect(theme.name).toBe('Kerala Theme');
      expect(theme.primary).toBe('#16a34a');
    });

    test('should return default theme for invalid region', () => {
      const theme = getRegionalTheme('invalid-region');
      expect(theme).toBeDefined();
      expect(theme.name).toBe('Kerala Theme'); // Default fallback
    });

    test('should have valid color values', () => {
      Object.values(regionalThemes).forEach(theme => {
        // Test color format (hex colors)
        expect(theme.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(theme.secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(theme.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('Time-based Themes', () => {
    test('should have all time periods', () => {
      const expectedPeriods = ['morning', 'afternoon', 'evening', 'night'];
      expectedPeriods.forEach(period => {
        expect(timeBasedThemes).toHaveProperty(period);
      });
    });

    test('should return appropriate theme based on time', () => {
      // Mock different times
      const originalDate = Date;
      
      // Morning (8 AM)
      global.Date = jest.fn(() => ({ getHours: () => 8 })) as any;
      let theme = getTimeBasedTheme();
      expect(theme.name).toBe('Morning Theme');
      
      // Afternoon (2 PM)
      global.Date = jest.fn(() => ({ getHours: () => 14 })) as any;
      theme = getTimeBasedTheme();
      expect(theme.name).toBe('Afternoon Theme');
      
      // Evening (7 PM)
      global.Date = jest.fn(() => ({ getHours: () => 19 })) as any;
      theme = getTimeBasedTheme();
      expect(theme.name).toBe('Evening Theme');
      
      // Night (11 PM)
      global.Date = jest.fn(() => ({ getHours: () => 23 })) as any;
      theme = getTimeBasedTheme();
      expect(theme.name).toBe('Night Theme');
      
      global.Date = originalDate;
    });

    test('should have valid mood and greeting for each time theme', () => {
      Object.values(timeBasedThemes).forEach(theme => {
        expect(theme).toHaveProperty('mood');
        expect(theme).toHaveProperty('greeting');
        expect(typeof theme.mood).toBe('string');
        expect(typeof theme.greeting).toBe('string');
      });
    });
  });

  describe('Festival Themes', () => {
    test('should have major Indian festivals', () => {
      const expectedFestivals = ['holi', 'diwali', 'durga'];
      expectedFestivals.forEach(festival => {
        expect(festivalThemes).toHaveProperty(festival);
      });
    });

    test('should have valid duration format', () => {
      Object.values(festivalThemes).forEach(theme => {
        expect(theme).toHaveProperty('duration');
        expect(theme.duration).toHaveProperty('start');
        expect(theme.duration).toHaveProperty('end');
        
        // Check date format MM-DD
        expect(theme.duration.start).toMatch(/^\d{2}-\d{2}$/);
        expect(theme.duration.end).toMatch(/^\d{2}-\d{2}$/);
      });
    });

    test('should return null when no festival is active', () => {
      // Mock a date that's not in any festival period
      const originalDate = Date;
      global.Date = jest.fn(() => ({
        getMonth: () => 5, // June
        getDate: () => 15
      })) as any;
      
      const festival = getFestivalTheme();
      expect(festival).toBeNull();
      
      global.Date = originalDate;
    });
  });

  describe('Indian Colors', () => {
    test('should have complete color palette', () => {
      const expectedColorSets = [
        'saffron', 'white', 'green', 'navy', 'earth', 
        'harvest', 'festival', 'regional'
      ];
      
      expectedColorSets.forEach(colorSet => {
        expect(indianColors).toHaveProperty(colorSet);
      });
    });

    test('should have valid color shades for main colors', () => {
      const mainColors = ['saffron', 'white', 'green', 'navy', 'earth', 'harvest'];
      
      mainColors.forEach(color => {
        const colorSet = indianColors[color as keyof typeof indianColors];
        if (typeof colorSet === 'object' && !Array.isArray(colorSet)) {
          // Should have shade 500 as main color
          expect(colorSet).toHaveProperty('500');
          // Should have valid hex color
          expect(colorSet['500']).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      });
    });

    test('should have festival colors', () => {
      const expectedFestivalColors = ['holi', 'diwali', 'durga', 'ganesh'];
      
      expectedFestivalColors.forEach(festival => {
        expect(indianColors.festival).toHaveProperty(festival);
        expect(indianColors.festival[festival as keyof typeof indianColors.festival])
          .toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    test('should have regional colors', () => {
      const expectedRegions = ['kerala', 'rajasthan', 'punjab', 'bengal'];
      
      expectedRegions.forEach(region => {
        expect(indianColors.regional).toHaveProperty(region);
        expect(indianColors.regional[region as keyof typeof indianColors.regional])
          .toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('Accessibility', () => {
    test('should detect accessibility mode correctly', () => {
      // Test with localStorage
      localStorageMock.getItem.mockReturnValue('true');
      expect(isAccessibilityMode()).toBe(true);
      
      localStorageMock.getItem.mockReturnValue('false');
      expect(isAccessibilityMode()).toBe(false);
      
      localStorageMock.getItem.mockReturnValue(null);
      expect(isAccessibilityMode()).toBe(false);
    });

    test('should have accessible color combinations', () => {
      const combinations = ['highContrast', 'lowVision', 'colorBlind'];
      
      combinations.forEach(combination => {
        expect(accessibleCombinations).toHaveProperty(combination);
        const combo = accessibleCombinations[combination as keyof typeof accessibleCombinations];
        
        expect(combo).toHaveProperty('background');
        expect(combo).toHaveProperty('text');
        expect(combo).toHaveProperty('primary');
        expect(combo).toHaveProperty('secondary');
        
        // Validate color formats
        Object.values(combo).forEach(color => {
          expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
      });
    });

    test('should apply accessible theme correctly', () => {
      const baseTheme = {
        primary: '#FF9933',
        secondary: '#138808',
        background: '#ffffff',
        text: '#000000'
      };
      
      const accessibleTheme = getAccessibleTheme(baseTheme);
      
      // Should contain base theme properties
      expect(accessibleTheme).toMatchObject(baseTheme);
    });
  });

  describe('Theme CSS Generation', () => {
    test('should generate valid CSS custom properties', () => {
      const theme = {
        primary: '#FF9933',
        secondary: '#138808',
        accent: '#000080',
        background: '#ffffff',
        surface: '#ffffff',
        text: '#000000',
        textMuted: '#666666'
      };
      
      const css = generateThemeCSS(theme);
      
      expect(css).toContain('--theme-primary: #FF9933');
      expect(css).toContain('--theme-secondary: #138808');
      expect(css).toContain('--theme-accent: #000080');
      expect(css).toContain('--theme-background: #ffffff');
      expect(css).toContain('--theme-surface: #ffffff');
      expect(css).toContain('--theme-text: #000000');
      expect(css).toContain('--theme-text-muted: #666666');
    });

    test('should handle missing accent color', () => {
      const theme = {
        primary: '#FF9933',
        secondary: '#138808',
        background: '#ffffff',
        surface: '#ffffff',
        text: '#000000',
        textMuted: '#666666'
      };
      
      const css = generateThemeCSS(theme);
      
      // Should use primary as accent when accent is missing
      expect(css).toContain('--theme-accent: #FF9933');
    });
  });

  describe('Cultural Context Validation', () => {
    test('should have culturally appropriate color combinations', () => {
      // Test that saffron, white, and green are present (Indian flag colors)
      expect(indianColors.saffron['500']).toBe('#FF9933');
      expect(indianColors.white['500']).toBe('#FFFFFF');
      expect(indianColors.green['500']).toBe('#138808');
    });

    test('should have region-specific cultural elements', () => {
      // Kerala should have coconut-related elements
      const keralaTheme = regionalThemes.kerala;
      expect(keralaTheme.culturalElements.motifs).toContain('coconut');
      expect(keralaTheme.patterns).toContain('coconut-palm');
      
      // Rajasthan should have desert/camel elements
      const rajasthanTheme = regionalThemes.rajasthan;
      expect(rajasthanTheme.culturalElements.motifs).toContain('camel');
      expect(rajasthanTheme.patterns).toContain('mandala');
      
      // Tamil should have temple/rice elements
      const tamilTheme = regionalThemes.tamil;
      expect(tamilTheme.culturalElements.motifs).toContain('rice');
      expect(tamilTheme.patterns).toContain('kolam');
    });

    test('should have appropriate festival associations', () => {
      // Bengal should have Durga Puja
      const bengalTheme = regionalThemes.bengal;
      expect(bengalTheme.culturalElements.festivals).toContain('durga-puja');
      
      // Kerala should have Onam
      const keralaTheme = regionalThemes.kerala;
      expect(keralaTheme.culturalElements.festivals).toContain('onam');
      
      // Punjab should have Baisakhi
      const punjabTheme = regionalThemes.punjab;
      expect(punjabTheme.culturalElements.festivals).toContain('baisakhi');
    });
  });
});