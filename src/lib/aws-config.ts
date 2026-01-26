/**
 * AWS Configuration and Resource Management
 * This file manages AWS service configurations and resource identifiers
 */

export interface AWSConfig {
  region: string;
  apiGatewayUrl: string;
  userPoolId: string;
  userPoolClientId: string;
  mediaBucket: string;
  voiceBucket: string;
  
  // DynamoDB Tables
  tables: {
    users: string;
    products: string;
    bids: string;
    conversations: string;
    priceHistory: string;
    translationCache: string;
    userSessions: string;
  };
  
  // S3 Configuration
  s3: {
    mediaBucket: string;
    voiceBucket: string;
    region: string;
    maxImageSize: number;
    maxAudioSize: number;
    allowedImageTypes: string[];
    allowedAudioTypes: string[];
  };
  
  // AI Services
  aiServices: {
    transcribe: {
      region: string;
    };
    translate: {
      region: string;
    };
    polly: {
      region: string;
    };
    bedrock: {
      region: string;
      modelId: string;
    };
  };
}

/**
 * Get AWS configuration from environment variables
 */
export function getAWSConfig(): AWSConfig {
  return {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    apiGatewayUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL || '',
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
    userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
    mediaBucket: process.env.NEXT_PUBLIC_MEDIA_BUCKET || '',
    voiceBucket: process.env.NEXT_PUBLIC_VOICE_BUCKET || '',
    
    tables: {
      users: process.env.USERS_TABLE || '',
      products: process.env.PRODUCTS_TABLE || '',
      bids: process.env.BIDS_TABLE || '',
      conversations: process.env.CONVERSATIONS_TABLE || '',
      priceHistory: process.env.PRICE_HISTORY_TABLE || '',
      translationCache: process.env.TRANSLATION_CACHE_TABLE || '',
      userSessions: process.env.USER_SESSIONS_TABLE || '',
    },
    
    s3: {
      mediaBucket: process.env.NEXT_PUBLIC_MEDIA_BUCKET || '',
      voiceBucket: process.env.NEXT_PUBLIC_VOICE_BUCKET || '',
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      maxImageSize: parseInt(process.env.MAX_IMAGE_SIZE || '10485760'), // 10MB
      maxAudioSize: parseInt(process.env.MAX_AUDIO_SIZE || '52428800'), // 50MB
      allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
      allowedAudioTypes: (process.env.ALLOWED_AUDIO_TYPES || 'audio/mpeg,audio/wav,audio/mp4,audio/ogg,audio/webm').split(','),
    },
    
    aiServices: {
      transcribe: {
        region: process.env.AWS_TRANSCRIBE_REGION || process.env.AWS_REGION || 'us-east-1',
      },
      translate: {
        region: process.env.AWS_TRANSLATE_REGION || process.env.AWS_REGION || 'us-east-1',
      },
      polly: {
        region: process.env.AWS_POLLY_REGION || process.env.AWS_REGION || 'us-east-1',
      },
      bedrock: {
        region: process.env.AWS_BEDROCK_REGION || 'us-east-1',
        modelId: process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0',
      },
    },
  };
}

/**
 * Validate AWS configuration
 */
export function validateAWSConfig(config: AWSConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.region) {
    errors.push('AWS region is required');
  }
  
  if (!config.apiGatewayUrl) {
    errors.push('API Gateway URL is required');
  }
  
  if (!config.userPoolId) {
    errors.push('Cognito User Pool ID is required');
  }
  
  if (!config.mediaBucket) {
    errors.push('Media S3 bucket name is required');
  }
  
  if (!config.voiceBucket) {
    errors.push('Voice S3 bucket name is required');
  }
  
  // Check S3 configuration
  if (!config.s3.mediaBucket) {
    errors.push('S3 media bucket name is required');
  }
  
  if (!config.s3.voiceBucket) {
    errors.push('S3 voice bucket name is required');
  }
  
  if (config.s3.maxImageSize <= 0) {
    errors.push('S3 max image size must be positive');
  }
  
  if (config.s3.maxAudioSize <= 0) {
    errors.push('S3 max audio size must be positive');
  }
  
  // Check table names
  Object.entries(config.tables).forEach(([tableName, tableValue]) => {
    if (!tableValue) {
      errors.push(`DynamoDB table '${tableName}' is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get supported languages configuration
 */
export function getSupportedLanguages(): string[] {
  const languages = process.env.NEXT_PUBLIC_SUPPORTED_LANGUAGES || 'hi,ta,te,kn,bn,or,ml,en';
  return languages.split(',').map(lang => lang.trim());
}

/**
 * Language configuration with display names and voice models
 */
export const LANGUAGE_CONFIG = {
  hi: {
    name: 'Hindi',
    nativeName: 'हिन्दी',
    code: 'hi-IN',
    transcribeCode: 'hi-IN',
    pollyVoiceId: 'Aditi',
    rtl: false,
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    code: 'ta-IN',
    transcribeCode: 'ta-IN',
    pollyVoiceId: 'Aditi', // Fallback, update when Tamil voice available
    rtl: false,
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    code: 'te-IN',
    transcribeCode: 'te-IN',
    pollyVoiceId: 'Aditi', // Fallback
    rtl: false,
  },
  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    code: 'kn-IN',
    transcribeCode: 'kn-IN',
    pollyVoiceId: 'Aditi', // Fallback
    rtl: false,
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    code: 'bn-IN',
    transcribeCode: 'bn-IN',
    pollyVoiceId: 'Aditi', // Fallback
    rtl: false,
  },
  or: {
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    code: 'or-IN',
    transcribeCode: 'or-IN',
    pollyVoiceId: 'Aditi', // Fallback
    rtl: false,
  },
  ml: {
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    code: 'ml-IN',
    transcribeCode: 'ml-IN',
    pollyVoiceId: 'Aditi', // Fallback
    rtl: false,
  },
  en: {
    name: 'English',
    nativeName: 'English',
    code: 'en-IN',
    transcribeCode: 'en-IN',
    pollyVoiceId: 'Aditi',
    rtl: false,
  },
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_CONFIG;

/**
 * Get language configuration by code
 */
export function getLanguageConfig(langCode: string) {
  return LANGUAGE_CONFIG[langCode as SupportedLanguage];
}

/**
 * Check if the application is properly configured
 */
export function isAppConfigured(): boolean {
  const config = getAWSConfig();
  const validation = validateAWSConfig(config);
  return validation.isValid;
}

/**
 * Get configuration status for debugging
 */
export function getConfigurationStatus() {
  const config = getAWSConfig();
  const validation = validateAWSConfig(config);
  
  return {
    config,
    validation,
    supportedLanguages: getSupportedLanguages(),
    isConfigured: validation.isValid,
  };
}