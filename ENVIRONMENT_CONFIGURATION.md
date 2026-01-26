# Environment Variables and Secrets Management

This document provides comprehensive guidance on configuring environment variables and secrets for the Ek Bharath Ek Mandi platform.

## Overview

The platform uses a multi-layered configuration approach:

1. **AWS Secrets Manager** - For sensitive data (API keys, JWT secrets, encryption keys)
2. **AWS Systems Manager Parameter Store** - For configuration parameters
3. **Environment Variables** - For runtime configuration and feature flags
4. **CDK Context** - For deployment-time configuration

## Environment Structure

### Supported Environments

- **development** - Local development and testing
- **staging** - Pre-production testing and validation
- **production** - Live production environment

### Environment-Specific Configuration

Each environment has its own:
- AWS Secrets Manager secrets with environment prefix
- SSM Parameter Store parameters
- Feature flag settings
- Resource sizing and configuration

## AWS Secrets Manager

### Secret Structure

All secrets are organized under the pattern: `ek-bharath/{environment}/{secret-type}`

#### 1. JWT Secret (`ek-bharath/{environment}/jwt-secret`)
```json
{
    "algorithm": "HS256",
    "secret": "base64-encoded-secret-key"
}
```

#### 2. Encryption Key (`ek-bharath/{environment}/encryption-key`)
```json
{
    "algorithm": "AES-256-GCM",
    "key": "base64-encoded-encryption-key"
}
```

#### 3. External API Keys (`ek-bharath/{environment}/external-api-keys`)
```json
{
    "enam_api_key": "your-enam-api-key",
    "apmc_api_key": "your-apmc-api-key",
    "weather_api_key": "your-weather-api-key",
    "maps_api_key": "your-maps-api-key"
}
```

#### 4. AI Service Keys (`ek-bharath/{environment}/ai-service-keys`)
```json
{
    "bedrock_model_id": "anthropic.claude-3-sonnet-20240229-v1:0",
    "openai_api_key": "your-openai-key-if-needed",
    "google_translate_key": "your-google-key-if-needed",
    "azure_cognitive_key": "your-azure-key-if-needed",
    "translation_confidence_threshold": "0.9",
    "max_translation_retries": "3"
}
```

#### 5. Database Credentials (`ek-bharath/{environment}/database-credentials`)
```json
{
    "username": "ekbharath_admin",
    "password": "generated-secure-password",
    "engine": "postgres",
    "host": "rds-endpoint-when-created",
    "port": 5432,
    "dbname": "ekbharath_production"
}
```

### Accessing Secrets in Lambda Functions

```typescript
import { getJWTSecret, getExternalApiKeys, getAIServiceConfig } from '../lib/lambda-utils';

// Get JWT secret
const jwtSecret = await getJWTSecret();

// Get external API keys
const apiKeys = await getExternalApiKeys();
const enamKey = apiKeys.enam_api_key;

// Get AI service configuration
const aiConfig = await getAIServiceConfig();
const bedrockModel = aiConfig.bedrock_model_id;
```

## SSM Parameter Store

### Parameter Structure

Parameters are organized under: `/ek-bharath/{environment}/{parameter-name}`

### Key Parameters

- `/ek-bharath/{environment}/dynamodb-billing-mode`
- `/ek-bharath/{environment}/s3-max-image-size`
- `/ek-bharath/{environment}/lambda-timeout`
- `/ek-bharath/{environment}/ai-confidence-threshold`
- `/ek-bharath/{environment}/security-jwt-expiration`
- `/ek-bharath/{environment}/feature-voice-translation`

### Accessing Parameters

```typescript
import { getSSMParameter, getEnvironmentConfig } from '../lib/lambda-utils';

// Get single parameter
const timeout = await getSSMParameter('/ek-bharath/development/lambda-timeout');

// Get all environment parameters
const config = await getEnvironmentConfig();
```

## Environment Variables

### Lambda Function Environment Variables

All Lambda functions receive these environment variables:

#### Core Configuration
```bash
NODE_ENV=development
ENVIRONMENT=development
AWS_REGION=us-east-1
FUNCTION_NAME=auth
```

#### AWS Resource References
```bash
USERS_TABLE=ek-bharath-users
PRODUCTS_TABLE=ek-bharath-products
BIDS_TABLE=ek-bharath-bids
CONVERSATIONS_TABLE=ek-bharath-conversations
PRICE_HISTORY_TABLE=ek-bharath-price-history
TRANSLATION_CACHE_TABLE=ek-bharath-translation-cache
USER_SESSIONS_TABLE=ek-bharath-user-sessions
MEDIA_BUCKET=ek-bharath-media-123456789012-us-east-1
VOICE_BUCKET=ek-bharath-voice-123456789012-us-east-1
USER_POOL_ID=us-east-1_abcdefghi
```

#### Secrets Manager ARNs
```bash
JWT_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:ek-bharath/development/jwt-secret
ENCRYPTION_KEY_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:ek-bharath/development/encryption-key
EXTERNAL_API_KEYS_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:ek-bharath/development/external-api-keys
AI_SERVICE_KEYS_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:ek-bharath/development/ai-service-keys
```

#### Configuration Parameters
```bash
CONFIG_PARAMETER_PREFIX=/ek-bharath/development
AI_TRANSCRIBE_REGION=us-east-1
AI_TRANSLATE_REGION=us-east-1
AI_POLLY_REGION=us-east-1
AI_BEDROCK_REGION=us-east-1
AI_CACHE_TTL=86400
AI_CONFIDENCE_THRESHOLD=0.9
AI_MAX_RETRIES=3
```

#### Feature Flags
```bash
FEATURE_VOICE_TRANSLATION=true
FEATURE_REAL_TIME_CHAT=true
FEATURE_PRICE_DISCOVERY=true
FEATURE_OFFLINE_MODE=false
FEATURE_PAYMENT_GATEWAY=false
FEATURE_ADVANCED_ANALYTICS=false
FEATURE_MULTI_REGION=false
```

#### Security and Performance
```bash
SECURITY_JWT_EXPIRATION_HOURS=24
SECURITY_MFA_ENABLED=false
SECURITY_RATE_LIMIT_RPM=100
S3_MAX_IMAGE_SIZE=10485760
S3_MAX_AUDIO_SIZE=52428800
S3_VOICE_RETENTION_DAYS=30
LOG_LEVEL=INFO
ENABLE_XRAY=false
ENABLE_METRICS=true
```

### Frontend Environment Variables (Next.js)

```bash
# Public variables (exposed to browser)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_API_GATEWAY_URL=https://api-id.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_USER_POOL_ID=us-east-1_abcdefghi
NEXT_PUBLIC_USER_POOL_CLIENT_ID=client-id
NEXT_PUBLIC_MEDIA_BUCKET=ek-bharath-media-123456789012-us-east-1
NEXT_PUBLIC_VOICE_BUCKET=ek-bharath-voice-123456789012-us-east-1
NEXT_PUBLIC_SUPPORTED_LANGUAGES=hi,ta,te,kn,bn,or,ml,en
NEXT_PUBLIC_APP_ENV=development

# Server-side only variables
JWT_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:ek-bharath/development/jwt-secret
```

## Environment-Specific Configurations

### Development Environment

**Characteristics:**
- Cost-optimized resources
- Debug logging enabled
- Relaxed security settings
- All features enabled for testing

**Key Settings:**
```bash
LOG_LEVEL=DEBUG
ENABLE_XRAY=false
SECURITY_MFA_ENABLED=false
LAMBDA_MEMORY_SIZE=256
DYNAMODB_BILLING_MODE=PAY_PER_REQUEST
S3_VERSIONING=false
```

### Staging Environment

**Characteristics:**
- Production-like configuration
- Enhanced monitoring
- Moderate security settings
- Most features enabled

**Key Settings:**
```bash
LOG_LEVEL=INFO
ENABLE_XRAY=true
SECURITY_MFA_ENABLED=true
LAMBDA_MEMORY_SIZE=512
DYNAMODB_POINT_IN_TIME_RECOVERY=true
S3_VERSIONING=true
FEATURE_ADVANCED_ANALYTICS=true
```

### Production Environment

**Characteristics:**
- High availability and performance
- Maximum security settings
- Comprehensive monitoring
- All production features enabled

**Key Settings:**
```bash
LOG_LEVEL=WARN
ENABLE_XRAY=true
SECURITY_MFA_ENABLED=true
SECURITY_JWT_EXPIRATION_HOURS=12
LAMBDA_MEMORY_SIZE=1024
LAMBDA_RESERVED_CONCURRENCY=100
DYNAMODB_POINT_IN_TIME_RECOVERY=true
S3_VERSIONING=true
FEATURE_PAYMENT_GATEWAY=true
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_MULTI_REGION=true
```

## Deployment and Management

### Setting Up Secrets

1. **Automated Setup (Recommended)**
   ```bash
   cd infrastructure/scripts
   ./setup-secrets.sh --environment development
   ./setup-secrets.sh --environment staging
   ./setup-secrets.sh --environment production
   ```

2. **Manual Setup**
   ```bash
   # Create JWT secret
   aws secretsmanager create-secret \
     --name "ek-bharath/development/jwt-secret" \
     --secret-string '{"algorithm":"HS256","secret":"your-secret-here"}'
   
   # Update existing secret
   aws secretsmanager update-secret \
     --secret-id "ek-bharath/development/external-api-keys" \
     --secret-string '{"enam_api_key":"real-key-here"}'
   ```

### Environment-Specific Deployment

```bash
# Deploy to development
./deploy-with-env.sh --environment development

# Deploy to staging
./deploy-with-env.sh --environment staging --region us-east-1

# Deploy to production (with confirmation)
./deploy-with-env.sh --environment production --region us-east-1
```

### Validation

```bash
# Validate deployment
./validate.sh --environment development --verbose

# Check specific environment
./validate.sh --environment production --region us-east-1
```

## Security Best Practices

### 1. Secret Rotation

- **JWT Secrets**: Rotate every 90 days
- **API Keys**: Rotate based on provider recommendations
- **Encryption Keys**: Rotate annually or when compromised

### 2. Access Control

- Use IAM roles with least privilege principle
- Separate secrets per environment
- Enable CloudTrail for audit logging

### 3. Monitoring

- Set up CloudWatch alarms for secret access
- Monitor failed authentication attempts
- Track unusual API usage patterns

### 4. Backup and Recovery

- Enable automatic backup for Secrets Manager
- Document secret recovery procedures
- Test disaster recovery scenarios

## Troubleshooting

### Common Issues

1. **Secret Not Found**
   ```bash
   # Check if secret exists
   aws secretsmanager describe-secret --secret-id "ek-bharath/development/jwt-secret"
   
   # List all secrets
   aws secretsmanager list-secrets --query 'SecretList[?contains(Name, `ek-bharath`)]'
   ```

2. **Permission Denied**
   ```bash
   # Check IAM permissions
   aws iam simulate-principal-policy \
     --policy-source-arn "arn:aws:iam::123456789012:role/lambda-role" \
     --action-names "secretsmanager:GetSecretValue" \
     --resource-arns "arn:aws:secretsmanager:us-east-1:123456789012:secret:ek-bharath/development/jwt-secret"
   ```

3. **Environment Variable Missing**
   ```bash
   # Check Lambda function configuration
   aws lambda get-function-configuration --function-name "function-name"
   ```

### Debug Commands

```bash
# Test secret access
aws secretsmanager get-secret-value --secret-id "ek-bharath/development/jwt-secret"

# Test parameter access
aws ssm get-parameter --name "/ek-bharath/development/lambda-timeout"

# Validate environment configuration
node -e "console.log(JSON.stringify(process.env, null, 2))"
```

## Migration and Updates

### Adding New Secrets

1. Update `infrastructure/lib/secrets-manager.ts`
2. Add to deployment scripts
3. Update Lambda environment variables
4. Update documentation

### Changing Configuration

1. Update environment configuration files
2. Deploy infrastructure changes
3. Update application code if needed
4. Validate changes

### Environment Promotion

1. Export configuration from lower environment
2. Update environment-specific values
3. Deploy to target environment
4. Validate and test

## Monitoring and Alerting

### CloudWatch Metrics

- Secret access frequency
- Failed authentication attempts
- Lambda function errors
- API Gateway response times

### Alarms

- Unusual secret access patterns
- High error rates
- Performance degradation
- Security violations

### Dashboards

- Environment health overview
- Security metrics
- Performance metrics
- Cost optimization metrics

## Cost Optimization

### Development Environment

- Use smaller instance sizes
- Enable auto-shutdown for non-critical resources
- Use on-demand billing for DynamoDB
- Minimize data retention periods

### Production Environment

- Use reserved instances where applicable
- Enable S3 lifecycle policies
- Optimize Lambda memory allocation
- Monitor and optimize costs regularly

## Compliance and Governance

### Data Protection

- Encrypt all data at rest and in transit
- Implement proper access controls
- Enable audit logging
- Regular security assessments

### Regulatory Compliance

- GDPR compliance for user data
- Data localization requirements
- Industry-specific regulations
- Regular compliance audits

This comprehensive configuration ensures secure, scalable, and maintainable environment management for the Ek Bharath Ek Mandi platform across all deployment environments.