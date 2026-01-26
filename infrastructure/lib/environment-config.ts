import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface EnvironmentConfigProps {
  environment: string;
  region: string;
  account?: string;
}

export interface ServiceConfiguration {
  // DynamoDB Configuration
  dynamodb: {
    billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
    pointInTimeRecovery: boolean;
    encryption: boolean;
    streamEnabled: boolean;
  };
  
  // S3 Configuration
  s3: {
    versioning: boolean;
    lifecycleRules: boolean;
    encryption: boolean;
    corsEnabled: boolean;
    maxImageSizeMB: number;
    maxAudioSizeMB: number;
    voiceRetentionDays: number;
  };
  
  // Lambda Configuration
  lambda: {
    timeout: number;
    memorySize: number;
    reservedConcurrency?: number;
    enableXRay: boolean;
    logRetention: number;
  };
  
  // AI Services Configuration
  aiServices: {
    transcribeRegion: string;
    translateRegion: string;
    pollyRegion: string;
    bedrockRegion: string;
    translationCacheTTL: number;
    maxTranslationRetries: number;
    confidenceThreshold: number;
  };
  
  // API Gateway Configuration
  apiGateway: {
    throttling: {
      rateLimit: number;
      burstLimit: number;
    };
    caching: {
      enabled: boolean;
      ttl: number;
    };
    cors: {
      allowOrigins: string[];
      allowMethods: string[];
      allowHeaders: string[];
    };
  };
  
  // Security Configuration
  security: {
    jwtExpirationHours: number;
    mfaEnabled: boolean;
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      requireUppercase: boolean;
      requireLowercase: boolean;
    };
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute: number;
    };
  };
  
  // Monitoring Configuration
  monitoring: {
    enableCloudWatch: boolean;
    enableXRay: boolean;
    logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
    metricsEnabled: boolean;
    alertingEnabled: boolean;
  };
  
  // Feature Flags
  features: {
    voiceTranslation: boolean;
    realTimeChat: boolean;
    priceDiscovery: boolean;
    offlineMode: boolean;
    paymentGateway: boolean;
    advancedAnalytics: boolean;
    multiRegionSupport: boolean;
  };
}

export class EnvironmentConfig extends Construct {
  public readonly configuration: ServiceConfiguration;
  private readonly parameters: Map<string, ssm.StringParameter> = new Map();

  constructor(scope: Construct, id: string, props: EnvironmentConfigProps) {
    super(scope, id);

    this.configuration = this.getConfigurationForEnvironment(props.environment);
    this.createSSMParameters(props);
  }

  private getConfigurationForEnvironment(environment: string): ServiceConfiguration {
    const baseConfig: ServiceConfiguration = {
      dynamodb: {
        billingMode: 'PAY_PER_REQUEST',
        pointInTimeRecovery: false,
        encryption: true,
        streamEnabled: true,
      },
      s3: {
        versioning: false,
        lifecycleRules: true,
        encryption: true,
        corsEnabled: true,
        maxImageSizeMB: 10,
        maxAudioSizeMB: 50,
        voiceRetentionDays: 30,
      },
      lambda: {
        timeout: 30,
        memorySize: 512,
        enableXRay: false,
        logRetention: 7,
      },
      aiServices: {
        transcribeRegion: 'us-east-1',
        translateRegion: 'us-east-1',
        pollyRegion: 'us-east-1',
        bedrockRegion: 'us-east-1',
        translationCacheTTL: 86400, // 24 hours
        maxTranslationRetries: 3,
        confidenceThreshold: 0.9,
      },
      apiGateway: {
        throttling: {
          rateLimit: 1000,
          burstLimit: 2000,
        },
        caching: {
          enabled: false,
          ttl: 300,
        },
        cors: {
          allowOrigins: ['*'],
          allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
        },
      },
      security: {
        jwtExpirationHours: 24,
        mfaEnabled: false,
        passwordPolicy: {
          minLength: 8,
          requireNumbers: true,
          requireSymbols: false,
          requireUppercase: false,
          requireLowercase: false,
        },
        rateLimiting: {
          enabled: true,
          requestsPerMinute: 100,
        },
      },
      monitoring: {
        enableCloudWatch: true,
        enableXRay: false,
        logLevel: 'INFO',
        metricsEnabled: true,
        alertingEnabled: false,
      },
      features: {
        voiceTranslation: true,
        realTimeChat: true,
        priceDiscovery: true,
        offlineMode: false,
        paymentGateway: false,
        advancedAnalytics: false,
        multiRegionSupport: false,
      },
    };

    // Environment-specific overrides
    switch (environment) {
      case 'development':
        return {
          ...baseConfig,
          lambda: {
            ...baseConfig.lambda,
            timeout: 60,
            memorySize: 256,
          },
          security: {
            ...baseConfig.security,
            mfaEnabled: false,
            rateLimiting: {
              enabled: false,
              requestsPerMinute: 1000,
            },
          },
          monitoring: {
            ...baseConfig.monitoring,
            logLevel: 'DEBUG',
            alertingEnabled: false,
          },
        };

      case 'staging':
        return {
          ...baseConfig,
          dynamodb: {
            ...baseConfig.dynamodb,
            pointInTimeRecovery: true,
          },
          s3: {
            ...baseConfig.s3,
            versioning: true,
          },
          lambda: {
            ...baseConfig.lambda,
            timeout: 120,
            memorySize: 512,
            enableXRay: true,
            logRetention: 30,
          },
          apiGateway: {
            ...baseConfig.apiGateway,
            caching: {
              enabled: true,
              ttl: 300,
            },
            cors: {
              allowOrigins: ['https://staging.ek-bharath.com'],
              allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
              allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
            },
          },
          security: {
            ...baseConfig.security,
            mfaEnabled: true,
            rateLimiting: {
              enabled: true,
              requestsPerMinute: 500,
            },
          },
          monitoring: {
            ...baseConfig.monitoring,
            enableXRay: true,
            alertingEnabled: true,
          },
          features: {
            ...baseConfig.features,
            advancedAnalytics: true,
          },
        };

      case 'production':
        return {
          ...baseConfig,
          dynamodb: {
            ...baseConfig.dynamodb,
            pointInTimeRecovery: true,
          },
          s3: {
            ...baseConfig.s3,
            versioning: true,
          },
          lambda: {
            ...baseConfig.lambda,
            timeout: 300,
            memorySize: 1024,
            reservedConcurrency: 100,
            enableXRay: true,
            logRetention: 90,
          },
          apiGateway: {
            ...baseConfig.apiGateway,
            throttling: {
              rateLimit: 10000,
              burstLimit: 20000,
            },
            caching: {
              enabled: true,
              ttl: 600,
            },
            cors: {
              allowOrigins: ['https://ek-bharath.com', 'https://www.ek-bharath.com'],
              allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
              allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key'],
            },
          },
          security: {
            ...baseConfig.security,
            jwtExpirationHours: 12,
            mfaEnabled: true,
            passwordPolicy: {
              minLength: 12,
              requireNumbers: true,
              requireSymbols: true,
              requireUppercase: true,
              requireLowercase: true,
            },
            rateLimiting: {
              enabled: true,
              requestsPerMinute: 1000,
            },
          },
          monitoring: {
            ...baseConfig.monitoring,
            enableXRay: true,
            logLevel: 'WARN',
            alertingEnabled: true,
          },
          features: {
            ...baseConfig.features,
            paymentGateway: true,
            advancedAnalytics: true,
            multiRegionSupport: true,
          },
        };

      default:
        return baseConfig;
    }
  }

  private createSSMParameters(props: EnvironmentConfigProps): void {
    const parameterPrefix = `/ek-bharath/${props.environment}`;

    // Create SSM parameters for configuration values
    this.createParameter('dynamodb-billing-mode', this.configuration.dynamodb.billingMode, parameterPrefix);
    this.createParameter('s3-max-image-size', this.configuration.s3.maxImageSizeMB.toString(), parameterPrefix);
    this.createParameter('s3-max-audio-size', this.configuration.s3.maxAudioSizeMB.toString(), parameterPrefix);
    this.createParameter('s3-voice-retention-days', this.configuration.s3.voiceRetentionDays.toString(), parameterPrefix);
    
    this.createParameter('lambda-timeout', this.configuration.lambda.timeout.toString(), parameterPrefix);
    this.createParameter('lambda-memory-size', this.configuration.lambda.memorySize.toString(), parameterPrefix);
    this.createParameter('lambda-log-retention', this.configuration.lambda.logRetention.toString(), parameterPrefix);
    
    this.createParameter('ai-transcribe-region', this.configuration.aiServices.transcribeRegion, parameterPrefix);
    this.createParameter('ai-translate-region', this.configuration.aiServices.translateRegion, parameterPrefix);
    this.createParameter('ai-polly-region', this.configuration.aiServices.pollyRegion, parameterPrefix);
    this.createParameter('ai-bedrock-region', this.configuration.aiServices.bedrockRegion, parameterPrefix);
    this.createParameter('ai-cache-ttl', this.configuration.aiServices.translationCacheTTL.toString(), parameterPrefix);
    this.createParameter('ai-confidence-threshold', this.configuration.aiServices.confidenceThreshold.toString(), parameterPrefix);
    
    this.createParameter('api-rate-limit', this.configuration.apiGateway.throttling.rateLimit.toString(), parameterPrefix);
    this.createParameter('api-burst-limit', this.configuration.apiGateway.throttling.burstLimit.toString(), parameterPrefix);
    this.createParameter('api-cache-ttl', this.configuration.apiGateway.caching.ttl.toString(), parameterPrefix);
    
    this.createParameter('security-jwt-expiration', this.configuration.security.jwtExpirationHours.toString(), parameterPrefix);
    this.createParameter('security-mfa-enabled', this.configuration.security.mfaEnabled.toString(), parameterPrefix);
    this.createParameter('security-rate-limit-rpm', this.configuration.security.rateLimiting.requestsPerMinute.toString(), parameterPrefix);
    
    this.createParameter('monitoring-log-level', this.configuration.monitoring.logLevel, parameterPrefix);
    this.createParameter('monitoring-xray-enabled', this.configuration.monitoring.enableXRay.toString(), parameterPrefix);
    
    // Feature flags
    Object.entries(this.configuration.features).forEach(([feature, enabled]) => {
      this.createParameter(`feature-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`, enabled.toString(), parameterPrefix);
    });
  }

  private createParameter(name: string, value: string, prefix: string): void {
    const parameter = new ssm.StringParameter(this, `Parameter-${name}`, {
      parameterName: `${prefix}/${name}`,
      stringValue: value,
      description: `Configuration parameter for ${name}`,
      tier: ssm.ParameterTier.STANDARD,
    });

    this.parameters.set(name, parameter);
  }

  /**
   * Get environment variables for Lambda functions
   */
  public getLambdaEnvironmentVariables(props: EnvironmentConfigProps): Record<string, string> {
    const parameterPrefix = `/ek-bharath/${props.environment}`;
    
    return {
      // Environment info
      NODE_ENV: props.environment,
      AWS_REGION: props.region,
      ENVIRONMENT: props.environment,
      
      // Configuration parameters
      CONFIG_PARAMETER_PREFIX: parameterPrefix,
      
      // Direct configuration values (for performance)
      LAMBDA_TIMEOUT: this.configuration.lambda.timeout.toString(),
      LAMBDA_MEMORY_SIZE: this.configuration.lambda.memorySize.toString(),
      
      AI_TRANSCRIBE_REGION: this.configuration.aiServices.transcribeRegion,
      AI_TRANSLATE_REGION: this.configuration.aiServices.translateRegion,
      AI_POLLY_REGION: this.configuration.aiServices.pollyRegion,
      AI_BEDROCK_REGION: this.configuration.aiServices.bedrockRegion,
      AI_CACHE_TTL: this.configuration.aiServices.translationCacheTTL.toString(),
      AI_CONFIDENCE_THRESHOLD: this.configuration.aiServices.confidenceThreshold.toString(),
      AI_MAX_RETRIES: this.configuration.aiServices.maxTranslationRetries.toString(),
      
      S3_MAX_IMAGE_SIZE: (this.configuration.s3.maxImageSizeMB * 1024 * 1024).toString(),
      S3_MAX_AUDIO_SIZE: (this.configuration.s3.maxAudioSizeMB * 1024 * 1024).toString(),
      S3_VOICE_RETENTION_DAYS: this.configuration.s3.voiceRetentionDays.toString(),
      
      SECURITY_JWT_EXPIRATION_HOURS: this.configuration.security.jwtExpirationHours.toString(),
      SECURITY_MFA_ENABLED: this.configuration.security.mfaEnabled.toString(),
      SECURITY_RATE_LIMIT_RPM: this.configuration.security.rateLimiting.requestsPerMinute.toString(),
      
      LOG_LEVEL: this.configuration.monitoring.logLevel,
      ENABLE_XRAY: this.configuration.monitoring.enableXRay.toString(),
      ENABLE_METRICS: this.configuration.monitoring.metricsEnabled.toString(),
      
      // Feature flags
      FEATURE_VOICE_TRANSLATION: this.configuration.features.voiceTranslation.toString(),
      FEATURE_REAL_TIME_CHAT: this.configuration.features.realTimeChat.toString(),
      FEATURE_PRICE_DISCOVERY: this.configuration.features.priceDiscovery.toString(),
      FEATURE_OFFLINE_MODE: this.configuration.features.offlineMode.toString(),
      FEATURE_PAYMENT_GATEWAY: this.configuration.features.paymentGateway.toString(),
      FEATURE_ADVANCED_ANALYTICS: this.configuration.features.advancedAnalytics.toString(),
      FEATURE_MULTI_REGION: this.configuration.features.multiRegionSupport.toString(),
    };
  }

  /**
   * Grant read access to SSM parameters for Lambda functions
   */
  public grantParameterReadAccess(lambdaFunction: lambda.Function): void {
    this.parameters.forEach(parameter => {
      parameter.grantRead(lambdaFunction);
    });
  }

  /**
   * Get parameter by name
   */
  public getParameter(name: string): ssm.StringParameter | undefined {
    return this.parameters.get(name);
  }

  /**
   * Get all parameters
   */
  public getAllParameters(): Map<string, ssm.StringParameter> {
    return new Map(this.parameters);
  }
}