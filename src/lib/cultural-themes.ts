/**
 * Cultural Theme System for Ek Bharath Ek Mandi
 * 
 * This module provides comprehensive cultural theming that reflects India's
 * rich cultural diversity while maintaining accessibility and usability.
 */

// Base Indian cultural color palette
export const indianColors = {
  // Indian Flag Colors (Primary Theme)
  saffron: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#FF9933', // Traditional saffron
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  white: {
    50: '#ffffff',
    100: '#fefefe',
    200: '#fafafa',
    300: '#f5f5f5',
    400: '#f0f0f0',
    500: '#FFFFFF', // Pure white
    600: '#e5e5e5',
    700: '#d4d4d4',
    800: '#a3a3a3',
    900: '#737373',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#138808', // Traditional green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Cultural accent colors
  navy: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#000080', // Traditional navy
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Agricultural colors (earth tones)
  earth: {
    50: '#fdf8f6',
    100: '#f2e8e5',
    200: '#eaddd7',
    300: '#e0cfc5',
    400: '#d2bab0',
    500: '#A0522D', // Sienna brown
    600: '#a16207',
    700: '#92400e',
    800: '#78350f',
    900: '#451a03',
  },
  
  // Harvest colors (golden tones)
  harvest: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#F59E0B', // Golden yellow
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Festival colors
  festival: {
    holi: '#FF69B4', // Bright pink
    diwali: '#FFD700', // Gold
    durga: '#DC143C', // Crimson
    ganesh: '#FF8C00', // Dark orange
    karva: '#8B0000', // Dark red
    onam: '#32CD32', // Lime green
  },
  
  // Regional accent colors
  regional: {
    kerala: '#228B22', // Forest green
    rajasthan: '#FF4500', // Orange red
    punjab: '#FFD700', // Gold
    bengal: '#FF1493', // Deep pink
    tamil: '#8B4513', // Saddle brown
    karnataka: '#FF6347', // Tomato
    andhra: '#4169E1', // Royal blue
    odisha: '#FF8C00', // Dark orange
  }
};

// Regional theme variations
export const regionalThemes = {
  kerala: {
    name: 'Kerala Theme',
    primary: indianColors.green[600],
    secondary: indianColors.harvest[500],
    accent: indianColors.regional.kerala,
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#14532d',
    textMuted: '#166534',
    patterns: ['coconut-palm', 'backwater', 'spice-garden'],
    culturalElements: {
      motifs: ['elephant', 'boat', 'coconut'],
      colors: ['green', 'gold', 'white'],
      festivals: ['onam', 'vishu']
    }
  },
  
  rajasthan: {
    name: 'Rajasthan Theme',
    primary: indianColors.saffron[500],
    secondary: indianColors.harvest[600],
    accent: indianColors.regional.rajasthan,
    background: '#fff7ed',
    surface: '#ffffff',
    text: '#7c2d12',
    textMuted: '#9a3412',
    patterns: ['mandala', 'paisley', 'geometric'],
    culturalElements: {
      motifs: ['camel', 'palace', 'desert'],
      colors: ['saffron', 'red', 'gold'],
      festivals: ['teej', 'gangaur']
    }
  },
  
  punjab: {
    name: 'Punjab Theme',
    primary: indianColors.harvest[500],
    secondary: indianColors.green[600],
    accent: indianColors.regional.punjab,
    background: '#fffbeb',
    surface: '#ffffff',
    text: '#78350f',
    textMuted: '#92400e',
    patterns: ['wheat-field', 'phulkari', 'geometric'],
    culturalElements: {
      motifs: ['wheat', 'tractor', 'turban'],
      colors: ['gold', 'green', 'white'],
      festivals: ['baisakhi', 'karva-chauth']
    }
  },
  
  bengal: {
    name: 'Bengal Theme',
    primary: indianColors.festival.durga,
    secondary: indianColors.harvest[500],
    accent: indianColors.regional.bengal,
    background: '#fef2f2',
    surface: '#ffffff',
    text: '#7f1d1d',
    textMuted: '#991b1b',
    patterns: ['alpana', 'fish-scale', 'lotus'],
    culturalElements: {
      motifs: ['fish', 'lotus', 'book'],
      colors: ['red', 'white', 'gold'],
      festivals: ['durga-puja', 'kali-puja']
    }
  },
  
  tamil: {
    name: 'Tamil Theme',
    primary: indianColors.earth[600],
    secondary: indianColors.harvest[500],
    accent: indianColors.regional.tamil,
    background: '#fdf8f6',
    surface: '#ffffff',
    text: '#451a03',
    textMuted: '#78350f',
    patterns: ['kolam', 'temple-art', 'banana-leaf'],
    culturalElements: {
      motifs: ['temple', 'rice', 'banana-leaf'],
      colors: ['brown', 'gold', 'green'],
      festivals: ['pongal', 'tamil-new-year']
    }
  },
  
  karnataka: {
    name: 'Karnataka Theme',
    primary: indianColors.regional.karnataka,
    secondary: indianColors.harvest[500],
    accent: indianColors.saffron[500],
    background: '#fff5f5',
    surface: '#ffffff',
    text: '#7c2d12',
    textMuted: '#9a3412',
    patterns: ['mysore-silk', 'sandalwood', 'coffee-bean'],
    culturalElements: {
      motifs: ['silk', 'coffee', 'sandalwood'],
      colors: ['red', 'gold', 'green'],
      festivals: ['dasara', 'ugadi']
    }
  },
  
  andhra: {
    name: 'Andhra Theme',
    primary: indianColors.regional.andhra,
    secondary: indianColors.harvest[500],
    accent: indianColors.green[600],
    background: '#eff6ff',
    surface: '#ffffff',
    text: '#1e3a8a',
    textMuted: '#1e40af',
    patterns: ['kalamkari', 'ikat', 'temple-border'],
    culturalElements: {
      motifs: ['peacock', 'mango', 'temple'],
      colors: ['blue', 'gold', 'red'],
      festivals: ['ugadi', 'bonalu']
    }
  },
  
  odisha: {
    name: 'Odisha Theme',
    primary: indianColors.regional.odisha,
    secondary: indianColors.harvest[500],
    accent: indianColors.green[600],
    background: '#fff7ed',
    surface: '#ffffff',
    text: '#7c2d12',
    textMuted: '#9a3412',
    patterns: ['pattachitra', 'ikat', 'temple-art'],
    culturalElements: {
      motifs: ['jagannath', 'conch', 'lotus'],
      colors: ['orange', 'red', 'yellow'],
      festivals: ['jagannath-rath-yatra', 'durga-puja']
    }
  }
};

// Time-based themes
export const timeBasedThemes = {
  morning: {
    name: 'Morning Theme',
    primary: indianColors.harvest[400],
    secondary: indianColors.green[400],
    background: '#fffbeb',
    surface: '#ffffff',
    text: '#78350f',
    mood: 'energetic',
    greeting: 'सुप्रभात / Good Morning'
  },
  
  afternoon: {
    name: 'Afternoon Theme',
    primary: indianColors.saffron[500],
    secondary: indianColors.earth[500],
    background: '#fff7ed',
    surface: '#ffffff',
    text: '#7c2d12',
    mood: 'productive',
    greeting: 'नमस्कार / Good Afternoon'
  },
  
  evening: {
    name: 'Evening Theme',
    primary: indianColors.festival.diwali,
    secondary: indianColors.navy[600],
    background: '#fef3c7',
    surface: '#ffffff',
    text: '#451a03',
    mood: 'warm',
    greeting: 'शुभ संध्या / Good Evening'
  },
  
  night: {
    name: 'Night Theme',
    primary: indianColors.navy[600],
    secondary: indianColors.harvest[600],
    background: '#1e3a8a',
    surface: '#1e40af',
    text: '#ffffff',
    mood: 'calm',
    greeting: 'शुभ रात्रि / Good Night'
  }
};

// Festival themes
export const festivalThemes = {
  holi: {
    name: 'Holi Theme',
    primary: indianColors.festival.holi,
    secondary: indianColors.harvest[500],
    accent: indianColors.green[500],
    background: 'linear-gradient(135deg, #FF69B4, #FFD700, #32CD32)',
    patterns: ['color-splash', 'rangoli'],
    duration: { start: '03-01', end: '03-15' } // March 1-15
  },
  
  diwali: {
    name: 'Diwali Theme',
    primary: indianColors.festival.diwali,
    secondary: indianColors.saffron[500],
    accent: indianColors.navy[600],
    background: 'linear-gradient(135deg, #FFD700, #FF9933)',
    patterns: ['diya', 'rangoli', 'fireworks'],
    duration: { start: '10-15', end: '11-15' } // Oct 15 - Nov 15
  },
  
  durga: {
    name: 'Durga Puja Theme',
    primary: indianColors.festival.durga,
    secondary: indianColors.harvest[500],
    accent: indianColors.white[500],
    background: 'linear-gradient(135deg, #DC143C, #FFD700)',
    patterns: ['goddess', 'lotus', 'alpana'],
    duration: { start: '09-15', end: '10-15' } // Sep 15 - Oct 15
  }
};

// Accessibility-compliant color combinations
export const accessibleCombinations = {
  highContrast: {
    background: '#ffffff',
    text: '#000000',
    primary: '#0066cc',
    secondary: '#cc6600',
    success: '#006600',
    warning: '#cc6600',
    error: '#cc0000'
  },
  
  lowVision: {
    background: '#f5f5f5',
    text: '#1a1a1a',
    primary: '#0052cc',
    secondary: '#b35900',
    success: '#005200',
    warning: '#b35900',
    error: '#b30000'
  },
  
  colorBlind: {
    background: '#ffffff',
    text: '#333333',
    primary: '#0066cc', // Blue
    secondary: '#ff6600', // Orange
    success: '#009900', // Green
    warning: '#ffcc00', // Yellow
    error: '#cc0000' // Red
  }
};

// Voice-first interaction colors
export const voiceColors = {
  listening: {
    primary: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.3)',
    pulse: 'rgba(34, 197, 94, 0.6)'
  },
  
  processing: {
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.3)',
    pulse: 'rgba(245, 158, 11, 0.6)'
  },
  
  speaking: {
    primary: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.3)',
    pulse: 'rgba(59, 130, 246, 0.6)'
  },
  
  error: {
    primary: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.3)',
    pulse: 'rgba(239, 68, 68, 0.6)'
  }
};

// Cultural patterns and motifs
export const culturalPatterns = {
  'coconut-palm': {
    svg: `<pattern id="coconut-palm" patternUnits="userSpaceOnUse" width="40" height="40">
      <path d="M20 5 Q15 10 20 15 Q25 10 20 5" fill="currentColor" opacity="0.1"/>
    </pattern>`,
    description: 'Kerala coconut palm pattern'
  },
  
  'mandala': {
    svg: `<pattern id="mandala" patternUnits="userSpaceOnUse" width="60" height="60">
      <circle cx="30" cy="30" r="20" fill="none" stroke="currentColor" opacity="0.1"/>
      <circle cx="30" cy="30" r="10" fill="none" stroke="currentColor" opacity="0.1"/>
    </pattern>`,
    description: 'Rajasthani mandala pattern'
  },
  
  'kolam': {
    svg: `<pattern id="kolam" patternUnits="userSpaceOnUse" width="30" height="30">
      <path d="M15 5 L25 15 L15 25 L5 15 Z" fill="none" stroke="currentColor" opacity="0.1"/>
    </pattern>`,
    description: 'Tamil kolam pattern'
  },
  
  'paisley': {
    svg: `<pattern id="paisley" patternUnits="userSpaceOnUse" width="50" height="50">
      <path d="M25 10 Q35 15 30 25 Q20 30 15 20 Q20 10 25 10" fill="currentColor" opacity="0.1"/>
    </pattern>`,
    description: 'Traditional paisley pattern'
  }
};

// Theme utility functions
export const getRegionalTheme = (region: string) => {
  return regionalThemes[region as keyof typeof regionalThemes] || regionalThemes.kerala;
};

export const getTimeBasedTheme = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) return timeBasedThemes.morning;
  if (hour >= 12 && hour < 17) return timeBasedThemes.afternoon;
  if (hour >= 17 && hour < 21) return timeBasedThemes.evening;
  return timeBasedThemes.night;
};

export const getFestivalTheme = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  for (const [name, theme] of Object.entries(festivalThemes)) {
    if (dateStr >= theme.duration.start && dateStr <= theme.duration.end) {
      return { name, ...theme };
    }
  }
  
  return null;
};

export const generateThemeCSS = (theme: any) => {
  return `
    :root {
      --theme-primary: ${theme.primary};
      --theme-secondary: ${theme.secondary};
      --theme-accent: ${theme.accent || theme.primary};
      --theme-background: ${theme.background};
      --theme-surface: ${theme.surface};
      --theme-text: ${theme.text};
      --theme-text-muted: ${theme.textMuted};
    }
  `;
};

export const isAccessibilityMode = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(prefers-contrast: high)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    localStorage.getItem('accessibility-mode') === 'true'
  );
};

export const getAccessibleTheme = (baseTheme: any) => {
  if (!isAccessibilityMode()) return baseTheme;
  
  return {
    ...baseTheme,
    ...accessibleCombinations.highContrast
  };
};