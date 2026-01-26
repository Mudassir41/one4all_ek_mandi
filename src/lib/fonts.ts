import { Inter } from 'next/font/google';

// Primary font for Latin script (English)
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Font configurations for different scripts
export const fontConfigs = {
  // Latin script (English)
  latin: {
    fontFamily: 'var(--font-inter), system-ui, -apple-system, sans-serif',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Devanagari script (Hindi)
  devanagari: {
    fontFamily: '"Noto Sans Devanagari", "Mangal", "Kokila", system-ui, sans-serif',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Tamil script
  tamil: {
    fontFamily: '"Noto Sans Tamil", "Latha", "Vijaya", system-ui, sans-serif',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Telugu script
  telugu: {
    fontFamily: '"Noto Sans Telugu", "Gautami", "Vani", system-ui, sans-serif',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Kannada script
  kannada: {
    fontFamily: '"Noto Sans Kannada", "Tunga", "Kedage", system-ui, sans-serif',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Bengali script
  bengali: {
    fontFamily: '"Noto Sans Bengali", "Vrinda", "Akaash", system-ui, sans-serif',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Odia script
  odia: {
    fontFamily: '"Noto Sans Oriya", "Kalinga", "Utkal", system-ui, sans-serif',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },
  
  // Malayalam script
  malayalam: {
    fontFamily: '"Noto Sans Malayalam", "Kartika", "Rachana", system-ui, sans-serif',
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  }
};

// Get font configuration for a specific script
export const getFontConfig = (script: string) => {
  const scriptKey = script.toLowerCase() as keyof typeof fontConfigs;
  return fontConfigs[scriptKey] || fontConfigs.latin;
};

// Generate CSS custom properties for fonts
export const generateFontCSS = () => {
  return Object.entries(fontConfigs).map(([script, config]) => `
    .script-${script} {
      --font-family: ${config.fontFamily};
      --font-weight-normal: ${config.fontWeight.normal};
      --font-weight-medium: ${config.fontWeight.medium};
      --font-weight-semibold: ${config.fontWeight.semibold};
      --font-weight-bold: ${config.fontWeight.bold};
      font-family: var(--font-family);
    }
  `).join('\n');
};