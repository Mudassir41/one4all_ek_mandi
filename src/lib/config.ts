// Configuration for the Ek Bharath Ek Mandi platform

export const config = {
  // Supported languages
  languages: {
    hindi: { name: 'हिंदी', code: 'hi', rtl: false },
    tamil: { name: 'தமிழ்', code: 'ta', rtl: false },
    telugu: { name: 'తెలుగు', code: 'te', rtl: false },
    kannada: { name: 'ಕನ್ನಡ', code: 'kn', rtl: false },
    bengali: { name: 'বাংলা', code: 'bn', rtl: false },
    odia: { name: 'ଓଡ଼ିଆ', code: 'or', rtl: false },
    malayalam: { name: 'മലയാളം', code: 'ml', rtl: false },
    english: { name: 'English', code: 'en', rtl: false },
  },

  // Product categories
  categories: {
    agriculture: {
      name: 'Agriculture',
      icon: '🌾',
      subcategories: ['vegetables', 'grains', 'fruits', 'pulses']
    },
    sericulture: {
      name: 'Sericulture',
      icon: '🐛',
      subcategories: ['cocoons', 'silk_yarn', 'mulberry']
    },
    fisheries: {
      name: 'Fisheries',
      icon: '🐟',
      subcategories: ['fresh_fish', 'dried_fish', 'seafood']
    },
    handicrafts: {
      name: 'Handicrafts',
      icon: '🎨',
      subcategories: ['textiles', 'pottery', 'wood_crafts', 'jewelry']
    },
    spices: {
      name: 'Spices',
      icon: '🌶️',
      subcategories: ['whole_spices', 'ground_spices', 'spice_mixes']
    }
  },

  // Indian states
  states: [
    'andhra_pradesh', 'arunachal_pradesh', 'assam', 'bihar', 'chhattisgarh',
    'goa', 'gujarat', 'haryana', 'himachal_pradesh', 'jharkhand', 'karnataka',
    'kerala', 'madhya_pradesh', 'maharashtra', 'manipur', 'meghalaya',
    'mizoram', 'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim',
    'tamil_nadu', 'telangana', 'tripura', 'uttar_pradesh', 'uttarakhand',
    'west_bengal', 'delhi', 'jammu_kashmir', 'ladakh'
  ],

  // Performance thresholds
  performance: {
    translation_latency_ms: 2000,
    translation_accuracy_threshold: 0.9,
    max_concurrent_users: 100000,
    max_file_size_mb: 10,
    max_audio_duration_seconds: 60
  },

  // API endpoints (will be configured based on environment)
  api: {
    base_url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    aws_region: process.env.AWS_REGION || 'ap-south-1',
  },

  // Feature flags
  features: {
    voice_translation: true,
    real_time_chat: true,
    price_discovery: true,
    offline_mode: false, // Will be enabled in future versions
    payment_gateway: false, // Post-MVP feature
  }
} as const;

export type Config = typeof config;