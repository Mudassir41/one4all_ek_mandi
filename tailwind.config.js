/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced cultural color palette for Indian markets
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF9933', // Indian saffron
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#138808', // Indian green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // Golden yellow
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        cultural: {
          saffron: '#FF9933',
          white: '#FFFFFF',
          green: '#138808',
          navy: '#000080',
          maroon: '#800000',
        },
        // Regional colors
        regional: {
          kerala: '#228B22',
          rajasthan: '#FF4500',
          punjab: '#FFD700',
          bengal: '#FF1493',
          tamil: '#8B4513',
          karnataka: '#FF6347',
          andhra: '#4169E1',
          odisha: '#FF8C00',
        },
        // Agricultural colors
        earth: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cfc5',
          400: '#d2bab0',
          500: '#A0522D',
          600: '#a16207',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        harvest: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F59E0B',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Festival colors
        festival: {
          holi: '#FF69B4',
          diwali: '#FFD700',
          durga: '#DC143C',
          ganesh: '#FF8C00',
          karva: '#8B0000',
          onam: '#32CD32',
        },
        // Voice interaction colors
        voice: {
          listening: '#22c55e',
          processing: '#f59e0b',
          speaking: '#3b82f6',
          error: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        devanagari: ['Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'system-ui', 'sans-serif'],
        telugu: ['Noto Sans Telugu', 'system-ui', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'system-ui', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'system-ui', 'sans-serif'],
        odia: ['Noto Sans Odia', 'system-ui', 'sans-serif'],
        malayalam: ['Noto Sans Malayalam', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'cultural': '0 4px 20px rgba(249, 115, 22, 0.15)',
        'voice': '0 8px 32px rgba(249, 115, 22, 0.3)',
        'voice-active': '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)',
        'voice-processing': '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
        'voice-error': '0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
        'voice-pulse': 'voice-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'voice-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)'
          },
        }
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      backgroundImage: {
        'cultural-gradient': 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary))',
        'festival-gradient': 'linear-gradient(135deg, #FF9933, #138808, #000080)',
      }
    },
  },
  plugins: [],
}