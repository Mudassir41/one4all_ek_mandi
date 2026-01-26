/**
 * Lambda utility functions for accessing secrets and configuration
 */

import { SecretsManagerClient } from '../../../infrastructure/lib/secrets-manager';

// Cache for configuration values
const configCache = new Map<string, { value: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get configuration value with caching
 */
async function getCachedConfig<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = configCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.value;
  }

  const value = await fetcher();
  configCache.set(key, {
    value,
    expiry: Date.now() + CACHE_TTL,
  });

  return value;
}

/**
 * Get JWT secret from AWS Secrets Manager
 */
export async function getJWTSecret(): Promise<string> {
  return getCachedConfig('jwt-secret', async () => {
    const secretsManager = SecretsManagerClient.getInstance();
    return await secretsManager.getJWTSecret();
  });
}

/**
 * Get encryption key from AWS Secrets Manager
 */
export async function getEncryptionKey(): Promise<string> {
  return getCachedConfig('encryption-key', async () => {
    const secretsManager = SecretsManagerClient.getInstance();
    return await secretsManager.getEncryptionKey();
  });
}

/**
 * Get external API keys
 */
export async function getExternalApiKeys(): Promise<Record<string, string>> {
  return getCachedConfig('external-api-keys', async () => {
    const secretsManager = SecretsManagerClient.getInstance();
    return await secretsManager.getExternalApiKeys();
  });
}

/**
 * Get AI service configuration
 */
export async function getAIServiceConfig(): Promise<Record<string, string>> {
  return getCachedConfig('ai-service-config', async () => {
    const secretsManager = SecretsManagerClient.getInstance();
    return await secretsManager.getAIServiceConfig();
  });
}

/**
 * Get SSM parameter value
 */
export async function getSSMParameter(parameterName: string): Promise<string> {
  return getCachedConfig(`ssm-${parameterName}`, async () => {
    const { SSMClient, GetParameterCommand } = await import('@aws-sdk/client-ssm');
    const client = new SSMClient({});
    
    const response = await client.send(new GetParameterCommand({
      Name: parameterName,
      WithDecryption: true,
    }));

    return response.Parameter?.Value || '';
  });
}

/**
 * Get multiple SSM parameters by path
 */
export async function getSSMParametersByPath(path: string): Promise<Record<string, string>> {
  return getCachedConfig(`ssm-path-${path}`, async () => {
    const { SSMClient, GetParametersByPathCommand } = await import('@aws-sdk/client-ssm');
    const client = new SSMClient({});
    
    const response = await client.send(new GetParametersByPathCommand({
      Path: path,
      Recursive: true,
      WithDecryption: true,
    }));

    const parameters: Record<string, string> = {};
    response.Parameters?.forEach(param => {
      if (param.Name && param.Value) {
        const key = param.Name.replace(path, '').replace(/^\//, '');
        parameters[key] = param.Value;
      }
    });

    return parameters;
  });
}

/**
 * Get environment-specific configuration
 */
export async function getEnvironmentConfig(): Promise<Record<string, string>> {
  const environment = process.env.ENVIRONMENT || 'development';
  const configPath = `/ek-bharath/${environment}`;
  
  return getSSMParametersByPath(configPath);
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureName: string): boolean {
  const envVar = `FEATURE_${featureName.toUpperCase().replace(/-/g, '_')}`;
  return process.env[envVar] === 'true';
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): string[] {
  const languages = process.env.SUPPORTED_LANGUAGES || 'hi,ta,te,kn,bn,or,ml,en';
  return languages.split(',').map(lang => lang.trim());
}

/**
 * Get AI service regions
 */
export function getAIServiceRegions() {
  return {
    transcribe: process.env.AI_TRANSCRIBE_REGION || process.env.AWS_REGION || 'us-east-1',
    translate: process.env.AI_TRANSLATE_REGION || process.env.AWS_REGION || 'us-east-1',
    polly: process.env.AI_POLLY_REGION || process.env.AWS_REGION || 'us-east-1',
    bedrock: process.env.AI_BEDROCK_REGION || 'us-east-1',
  };
}

/**
 * Get S3 configuration
 */
export function getS3Config() {
  return {
    mediaBucket: process.env.MEDIA_BUCKET!,
    voiceBucket: process.env.VOICE_BUCKET!,
    maxImageSize: parseInt(process.env.S3_MAX_IMAGE_SIZE || '10485760'), // 10MB
    maxAudioSize: parseInt(process.env.S3_MAX_AUDIO_SIZE || '52428800'), // 50MB
    voiceRetentionDays: parseInt(process.env.S3_VOICE_RETENTION_DAYS || '30'),
  };
}

/**
 * Get DynamoDB table names
 */
export function getDynamoDBTables() {
  return {
    users: process.env.USERS_TABLE!,
    products: process.env.PRODUCTS_TABLE!,
    bids: process.env.BIDS_TABLE!,
    conversations: process.env.CONVERSATIONS_TABLE!,
    priceHistory: process.env.PRICE_HISTORY_TABLE!,
    translationCache: process.env.TRANSLATION_CACHE_TABLE!,
    userSessions: process.env.USER_SESSIONS_TABLE!,
  };
}

/**
 * Get security configuration
 */
export function getSecurityConfig() {
  return {
    jwtExpirationHours: parseInt(process.env.SECURITY_JWT_EXPIRATION_HOURS || '24'),
    mfaEnabled: process.env.SECURITY_MFA_ENABLED === 'true',
    rateLimitRPM: parseInt(process.env.SECURITY_RATE_LIMIT_RPM || '100'),
  };
}

/**
 * Get AI service configuration
 */
export function getAIConfig() {
  return {
    cacheTTL: parseInt(process.env.AI_CACHE_TTL || '86400'), // 24 hours
    confidenceThreshold: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.9'),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
  };
}

/**
 * Get logging configuration
 */
export function getLoggingConfig() {
  return {
    level: process.env.LOG_LEVEL || 'INFO',
    enableXRay: process.env.ENABLE_XRAY === 'true',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
  };
}

/**
 * Logger utility with configurable levels
 */
export class Logger {
  private static instance: Logger;
  private logLevel: string;

  private constructor() {
    this.logLevel = getLoggingConfig().level;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: string): boolean {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  public debug(message: string, ...args: any[]): void {
    if (this.shouldLog('DEBUG')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (this.shouldLog('INFO')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.shouldLog('WARN')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  public error(message: string, ...args: any[]): void {
    if (this.shouldLog('ERROR')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const requiredVars = [
    'AWS_REGION',
    'ENVIRONMENT',
    'USERS_TABLE',
    'PRODUCTS_TABLE',
    'BIDS_TABLE',
    'CONVERSATIONS_TABLE',
    'MEDIA_BUCKET',
    'VOICE_BUCKET',
    'USER_POOL_ID',
  ];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Check secrets ARNs
  const secretArns = [
    'JWT_SECRET_ARN',
    'ENCRYPTION_KEY_ARN',
    'EXTERNAL_API_KEYS_ARN',
    'AI_SERVICE_KEYS_ARN',
  ];

  secretArns.forEach(arnVar => {
    if (!process.env[arnVar]) {
      errors.push(`Missing required secret ARN: ${arnVar}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Initialize Lambda function with proper error handling
 */
export async function initializeLambda(functionName: string): Promise<void> {
  const logger = Logger.getInstance();
  
  try {
    logger.info(`Initializing Lambda function: ${functionName}`);
    
    // Validate environment
    const validation = validateEnvironment();
    if (!validation.isValid) {
      logger.error('Environment validation failed:', validation.errors);
      throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
    }

    // Pre-load secrets to warm up the cache
    if (process.env.JWT_SECRET_ARN) {
      await getJWTSecret();
      logger.debug('JWT secret loaded');
    }

    if (process.env.AI_SERVICE_KEYS_ARN) {
      await getAIServiceConfig();
      logger.debug('AI service config loaded');
    }

    logger.info(`Lambda function ${functionName} initialized successfully`);
  } catch (error) {
    logger.error(`Failed to initialize Lambda function ${functionName}:`, error);
    throw error;
  }
}

/**
 * Clear all caches (useful for testing)
 */
export function clearCaches(): void {
  configCache.clear();
  SecretsManagerClient.getInstance().clearCache();
}