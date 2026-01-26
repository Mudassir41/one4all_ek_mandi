import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface SecretsManagerProps {
  environment: string;
  region: string;
}

export class SecretsManager extends Construct {
  public readonly jwtSecret: secretsmanager.Secret;
  public readonly encryptionKey: secretsmanager.Secret;
  public readonly externalApiKeys: secretsmanager.Secret;
  public readonly databaseCredentials: secretsmanager.Secret;
  public readonly aiServiceKeys: secretsmanager.Secret;
  
  constructor(scope: Construct, id: string, props: SecretsManagerProps) {
    super(scope, id);

    // JWT Secret for authentication
    this.jwtSecret = new secretsmanager.Secret(this, 'JWTSecret', {
      secretName: `ek-bharath/${props.environment}/jwt-secret`,
      description: 'JWT signing secret for authentication tokens',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ algorithm: 'HS256' }),
        generateStringKey: 'secret',
        excludeCharacters: '"@/\\\'',
        passwordLength: 64,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development
    });

    // Encryption key for sensitive data
    this.encryptionKey = new secretsmanager.Secret(this, 'EncryptionKey', {
      secretName: `ek-bharath/${props.environment}/encryption-key`,
      description: 'Encryption key for sensitive user data',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ algorithm: 'AES-256-GCM' }),
        generateStringKey: 'key',
        excludeCharacters: '"@/\\\'',
        passwordLength: 64,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // External API keys (eNAM, APMC, etc.)
    this.externalApiKeys = new secretsmanager.Secret(this, 'ExternalApiKeys', {
      secretName: `ek-bharath/${props.environment}/external-api-keys`,
      description: 'API keys for external services (eNAM, APMC, etc.)',
      secretObjectValue: {
        enam_api_key: cdk.SecretValue.unsafePlainText('placeholder-enam-key'),
        apmc_api_key: cdk.SecretValue.unsafePlainText('placeholder-apmc-key'),
        weather_api_key: cdk.SecretValue.unsafePlainText('placeholder-weather-key'),
        maps_api_key: cdk.SecretValue.unsafePlainText('placeholder-maps-key'),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Database credentials (for future RDS integration)
    this.databaseCredentials = new secretsmanager.Secret(this, 'DatabaseCredentials', {
      secretName: `ek-bharath/${props.environment}/database-credentials`,
      description: 'Database credentials for RDS instances',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'ekbharath_admin',
          engine: 'postgres',
          host: 'placeholder-host',
          port: 5432,
          dbname: 'ekbharath',
        }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\\'',
        passwordLength: 32,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // AI Service configuration and keys
    this.aiServiceKeys = new secretsmanager.Secret(this, 'AIServiceKeys', {
      secretName: `ek-bharath/${props.environment}/ai-service-keys`,
      description: 'Configuration and keys for AI services',
      secretObjectValue: {
        bedrock_model_id: cdk.SecretValue.unsafePlainText('anthropic.claude-3-sonnet-20240229-v1:0'),
        openai_api_key: cdk.SecretValue.unsafePlainText('placeholder-openai-key'),
        google_translate_key: cdk.SecretValue.unsafePlainText('placeholder-google-key'),
        azure_cognitive_key: cdk.SecretValue.unsafePlainText('placeholder-azure-key'),
        translation_confidence_threshold: cdk.SecretValue.unsafePlainText('0.9'),
        max_translation_retries: cdk.SecretValue.unsafePlainText('3'),
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Add tags for better organization
    const tags = {
      Project: 'EkBharathEkMandi',
      Environment: props.environment,
      Component: 'SecretsManager',
      ManagedBy: 'CDK',
    };

    Object.entries(tags).forEach(([key, value]) => {
      cdk.Tags.of(this.jwtSecret).add(key, value);
      cdk.Tags.of(this.encryptionKey).add(key, value);
      cdk.Tags.of(this.externalApiKeys).add(key, value);
      cdk.Tags.of(this.databaseCredentials).add(key, value);
      cdk.Tags.of(this.aiServiceKeys).add(key, value);
    });
  }

  /**
   * Grant read access to secrets for Lambda functions
   */
  public grantReadToLambda(lambdaFunction: lambda.Function, secrets?: secretsmanager.Secret[]): void {
    const secretsToGrant = secrets || [
      this.jwtSecret,
      this.encryptionKey,
      this.externalApiKeys,
      this.aiServiceKeys,
    ];

    secretsToGrant.forEach(secret => {
      secret.grantRead(lambdaFunction);
    });
  }

  /**
   * Create IAM policy for secrets access
   */
  public createSecretsAccessPolicy(): iam.PolicyDocument {
    return new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'secretsmanager:GetSecretValue',
            'secretsmanager:DescribeSecret',
          ],
          resources: [
            this.jwtSecret.secretArn,
            this.encryptionKey.secretArn,
            this.externalApiKeys.secretArn,
            this.aiServiceKeys.secretArn,
          ],
        }),
      ],
    });
  }

  /**
   * Get environment variables for Lambda functions
   */
  public getLambdaEnvironmentVariables(): Record<string, string> {
    return {
      JWT_SECRET_ARN: this.jwtSecret.secretArn,
      ENCRYPTION_KEY_ARN: this.encryptionKey.secretArn,
      EXTERNAL_API_KEYS_ARN: this.externalApiKeys.secretArn,
      AI_SERVICE_KEYS_ARN: this.aiServiceKeys.secretArn,
      DATABASE_CREDENTIALS_ARN: this.databaseCredentials.secretArn,
    };
  }
}

/**
 * Utility class for managing secrets in Lambda functions
 */
export class SecretsManagerClient {
  private static instance: SecretsManagerClient;
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): SecretsManagerClient {
    if (!SecretsManagerClient.instance) {
      SecretsManagerClient.instance = new SecretsManagerClient();
    }
    return SecretsManagerClient.instance;
  }

  /**
   * Get secret value with caching
   */
  public async getSecret(secretArn: string): Promise<any> {
    const cached = this.cache.get(secretArn);
    if (cached && cached.expiry > Date.now()) {
      return cached.value;
    }

    try {
      const { SecretsManagerClient, GetSecretValueCommand } = await import('@aws-sdk/client-secrets-manager');
      const client = new SecretsManagerClient({});
      
      const response = await client.send(new GetSecretValueCommand({
        SecretId: secretArn,
      }));

      let secretValue;
      if (response.SecretString) {
        try {
          secretValue = JSON.parse(response.SecretString);
        } catch {
          secretValue = response.SecretString;
        }
      } else if (response.SecretBinary) {
        secretValue = Buffer.from(response.SecretBinary).toString('utf-8');
      } else {
        throw new Error('No secret value found');
      }

      // Cache the secret
      this.cache.set(secretArn, {
        value: secretValue,
        expiry: Date.now() + this.CACHE_TTL,
      });

      return secretValue;
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretArn}:`, error);
      throw error;
    }
  }

  /**
   * Get JWT secret
   */
  public async getJWTSecret(): Promise<string> {
    const secretArn = process.env.JWT_SECRET_ARN;
    if (!secretArn) {
      throw new Error('JWT_SECRET_ARN environment variable not set');
    }

    const secret = await this.getSecret(secretArn);
    return typeof secret === 'string' ? secret : secret.secret;
  }

  /**
   * Get encryption key
   */
  public async getEncryptionKey(): Promise<string> {
    const secretArn = process.env.ENCRYPTION_KEY_ARN;
    if (!secretArn) {
      throw new Error('ENCRYPTION_KEY_ARN environment variable not set');
    }

    const secret = await this.getSecret(secretArn);
    return typeof secret === 'string' ? secret : secret.key;
  }

  /**
   * Get external API keys
   */
  public async getExternalApiKeys(): Promise<Record<string, string>> {
    const secretArn = process.env.EXTERNAL_API_KEYS_ARN;
    if (!secretArn) {
      throw new Error('EXTERNAL_API_KEYS_ARN environment variable not set');
    }

    return await this.getSecret(secretArn);
  }

  /**
   * Get AI service configuration
   */
  public async getAIServiceConfig(): Promise<Record<string, string>> {
    const secretArn = process.env.AI_SERVICE_KEYS_ARN;
    if (!secretArn) {
      throw new Error('AI_SERVICE_KEYS_ARN environment variable not set');
    }

    return await this.getSecret(secretArn);
  }

  /**
   * Clear cache (useful for testing)
   */
  public clearCache(): void {
    this.cache.clear();
  }
}