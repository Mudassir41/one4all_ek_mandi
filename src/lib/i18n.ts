import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../../public/locales/en/common.json';
import hiCommon from '../../public/locales/hi/common.json';
import taCommon from '../../public/locales/ta/common.json';
import teCommon from '../../public/locales/te/common.json';
import knCommon from '../../public/locales/kn/common.json';
import bnCommon from '../../public/locales/bn/common.json';
import orCommon from '../../public/locales/or/common.json';
import mlCommon from '../../public/locales/ml/common.json';

// Language configuration with cultural context
export const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇮🇳',
    dir: 'ltr',
    script: 'Latin',
    region: 'India',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'en-IN',
    greetingTime: {
      morning: [6, 12],
      afternoon: [12, 17],
      evening: [17, 21],
      night: [21, 6]
    }
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    dir: 'ltr',
    script: 'Devanagari',
    region: 'North India',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'hi-IN',
    greetingTime: {
      morning: [6, 12],
      afternoon: [12, 17],
      evening: [17, 21],
      night: [21, 6]
    }
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    dir: 'ltr',
    script: 'Tamil',
    region: 'Tamil Nadu',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'ta-IN',
    greetingTime: {
      morning: [6, 12],
      afternoon: [12, 17],
      evening: [17, 21],
      night: [21, 6]
    }
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    dir: 'ltr',
    script: 'Telugu',
    region: 'Andhra Pradesh & Telangana',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'te-IN',
    greetingTime: {
      morning: [6, 12],
      afternoon: [12, 17],
      evening: [17, 21],
      night: [21, 6]
    }
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    dir: 'ltr',
    script: 'Kannada',
    region: 'Karnataka',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'kn-IN',
    greetingTime: {
      morning: [6, 12],
      afternoon: [12, 17],
      evening: [17, 21],
      night: [21, 6]
    }
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    dir: 'ltr',
    script: 'Bengali',
    region: 'West Bengal',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'bn-IN',
    greetingTime: {
      morning: [6, 12],
      afternoon: [12, 17],
      evening: [17, 21],
      night: [21, 6]
    }
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    flag: '🇮🇳',
    dir: 'ltr',
    script: 'Odia',
    region: 'Odisha',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'or-IN',
    greetingTime: {
      morning: [6, 12],
      afternoon: [12, 17],
      evening: [17, 21],
      night: [21, 6]
    }
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    dir: 'ltr',
    script: 'Malayalam',
    region: 'Kerala',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'ml-IN',
    greetingTime: {
      morning: [6, 12],
      afternoon: [12, 17],
      evening: [17, 21],
      night: [21, 6]
    }
  }
];

// Resources object for i18next
const resources = {
  en: { common: enCommon },
  hi: { common: hiCommon },
  ta: { common: taCommon },
  te: { common: teCommon },
  kn: { common: knCommon },
  bn: { common: bnCommon },
  or: { common: orCommon },
  ml: { common: mlCommon }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
      format: function(value, format, lng) {
        if (format === 'currency') {
          return new Intl.NumberFormat(lng || 'en-IN', {
            style: 'currency',
            currency: 'INR'
          }).format(value);
        }
        if (format === 'number') {
          return new Intl.NumberFormat(lng || 'en-IN').format(value);
        }
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng || 'en-IN').format(new Date(value));
        }
        return value;
      }
    },

    // React options
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em']
    },

    // Debug in development
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;

// Utility functions for cultural formatting
export const formatCurrency = (amount: number, locale?: string): string => {
  const lang = locale || i18n.language || 'en';
  return new Intl.NumberFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (number: number, locale?: string): string => {
  const lang = locale || i18n.language || 'en';
  return new Intl.NumberFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`).format(number);
};

export const formatDate = (date: Date | string, locale?: string): string => {
  const lang = locale || i18n.language || 'en';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
};

export const formatTime = (date: Date | string, locale?: string): string => {
  const lang = locale || i18n.language || 'en';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-IN' : `${lang}-IN`, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(dateObj);
};

export const getGreeting = (locale?: string): string => {
  const lang = locale || i18n.language || 'en';
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    return i18n.t('greetings.morning', { lng: lang });
  } else if (hour >= 12 && hour < 17) {
    return i18n.t('greetings.afternoon', { lng: lang });
  } else if (hour >= 17 && hour < 21) {
    return i18n.t('greetings.evening', { lng: lang });
  } else {
    return i18n.t('greetings.night', { lng: lang });
  }
};

export const getLanguageByCode = (code: string) => {
  return languages.find(lang => lang.code === code);
};

export const isRTL = (locale?: string): boolean => {
  const lang = locale || i18n.language || 'en';
  const language = getLanguageByCode(lang);
  return language?.dir === 'rtl';
};

// Voice-specific language context
export const getVoicePrompts = (context: 'price' | 'listing' | 'search' | 'bid', locale?: string) => {
  const lang = locale || i18n.language || 'en';
  
  switch (context) {
    case 'price':
      return i18n.t('voice_prompts.askPrice', { lng: lang });
    case 'listing':
      return i18n.t('voice_prompts.listProduct', { lng: lang });
    case 'search':
      return i18n.t('voice_prompts.searchProduct', { lng: lang });
    case 'bid':
      return i18n.t('voice_prompts.placeBid', { lng: lang });
    default:
      return i18n.t('voice.speakNow', { lng: lang });
  }
};

// Agricultural terminology mapping for better voice recognition
export const getAgriculturalTerms = (locale?: string) => {
  const lang = locale || i18n.language || 'en';
  
  const terms = {
    en: {
      vegetables: ['tomato', 'potato', 'onion', 'cabbage', 'carrot', 'beans'],
      fruits: ['apple', 'banana', 'mango', 'orange', 'grapes', 'pomegranate'],
      grains: ['rice', 'wheat', 'corn', 'barley', 'millet', 'sorghum'],
      spices: ['turmeric', 'chili', 'coriander', 'cumin', 'cardamom', 'pepper']
    },
    hi: {
      vegetables: ['टमाटर', 'आलू', 'प्याज', 'पत्तागोभी', 'गाजर', 'बीन्स'],
      fruits: ['सेब', 'केला', 'आम', 'संतरा', 'अंगूर', 'अनार'],
      grains: ['चावल', 'गेहूं', 'मक्का', 'जौ', 'बाजरा', 'ज्वार'],
      spices: ['हल्दी', 'मिर्च', 'धनिया', 'जीरा', 'इलायची', 'काली मिर्च']
    },
    ta: {
      vegetables: ['தக்காளி', 'உருளைக்கிழங்கு', 'வெங்காயம்', 'முட்டைகோஸ்', 'கேரட்', 'பீன்ஸ்'],
      fruits: ['ஆப்பிள்', 'வாழைப்பழம்', 'மாம்பழம்', 'ஆரஞ்சு', 'திராட்சை', 'மாதுளை'],
      grains: ['அரிசி', 'கோதுமை', 'சோளம்', 'பார்லி', 'கம்பு', 'சோளம்'],
      spices: ['மஞ்சள்', 'மிளகாய்', 'கொத்தமல்லி', 'சீரகம்', 'ஏலக்காய்', 'மிளகு']
    }
    // Add more languages as needed
  };
  
  return terms[lang as keyof typeof terms] || terms.en;
};