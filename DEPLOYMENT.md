# Ek Bharath Ek Mandi - Deployment Guide

This guide walks you through deploying the Ek Bharath Ek Mandi platform infrastructure and application.

## Prerequisites

### 1. AWS Account Setup
- AWS Account with appropriate permissions
- AWS CLI installed and configured
- Sufficient service limits for the resources

### 2. Required Permissions
Your AWS user/role needs the following permissions:
- CloudFormation full access
- DynamoDB full access
- S3 full access
- Lambda full access
- API Gateway full access
- Cognito full access
- ElastiCache access
- OpenSearch access
- IAM role creation and management
- CloudFront access

### 3. Local Development Environment
- Node.js 18+ installed
- Git installed
- Terminal/Command line access

## Step-by-Step Deployment

### Step 1: Clone and Setup Project

```bash
# Clone the repository
git clone <repository-url>
cd ek-bharath-ek-mandi

# Install dependencies
npm install

# Install infrastructure dependencies
npm run infra:install
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI (if not already done)
aws configure

# Verify your AWS identity
aws sts get-caller-identity
```

### Step 3: Deploy Infrastructure

```bash
# Deploy the AWS infrastructure
npm run infra:deploy

# This will:
# 1. Bootstrap CDK (if needed)
# 2. Build TypeScript code
# 3. Synthesize CloudFormation template
# 4. Deploy all AWS resources
```

### Step 4: Update Environment Variables

After infrastructure deployment, you'll see output values. Update your `.env.local` file:

```bash
# Copy the example file
cp .env.example .env.local

# Update with the output values from CDK deployment
# Example outputs:
# - ApiGatewayUrl: https://abc123.execute-api.us-east-1.amazonaws.com/prod/
# - UserPoolId: us-east-1_ABC123DEF
# - MediaBucketName: ek-bharath-media-123456789012-us-east-1
# etc.
```

### Step 5: Deploy Application

```bash
# Build the Next.js application
npm run build

# Start the application
npm start

# Or for development
npm run dev
```

## Infrastructure Components

### Core Services Deployed

1. **DynamoDB Tables**
   - `ek-bharath-users`: User profiles and authentication data
   - `ek-bharath-products`: Product listings and metadata
   - `ek-bharath-bids`: Bidding and transaction data
   - `ek-bharath-conversations`: Chat messages and translations

2. **S3 Buckets**
   - Media bucket: Product images and general media files
   - Voice bucket: Audio recordings (auto-deleted after 30 days)

3. **API Gateway**
   - RESTful API endpoints for all services
   - CORS enabled for web application
   - Binary media type support for audio/images

4. **Lambda Functions**
   - Authentication service
   - Translation service
   - Product management
   - Bidding system
   - Chat service

5. **Cognito User Pool**
   - Phone-based authentication
   - Multi-language user attributes
   - MFA support

6. **ElastiCache (Redis)**
   - Translation caching
   - Session management
   - Search result caching

7. **OpenSearch**
   - Product search indexing
   - Multi-language search support
   - Analytics and insights

8. **CloudFront CDN**
   - Global content delivery
   - API caching
   - Media file distribution

## Environment Configuration

### Development Environment
```bash
export NODE_ENV=development
npm run infra:deploy
```

### Staging Environment
```bash
export NODE_ENV=staging
npm run infra:deploy
```

### Production Environment
```bash
export NODE_ENV=production
npm run infra:deploy
```

## Post-Deployment Configuration

### 1. Configure AI Services

Ensure your AWS account has access to:
- Amazon Transcribe (for speech-to-text)
- Amazon Translate (for text translation)
- Amazon Polly (for text-to-speech)
- Amazon Bedrock (for Claude AI model)

### 2. Set up External API Keys

Update your environment variables with:
- eNAM API key (for market price data)
- APMC API keys (for regional market data)

### 3. Configure Domain and SSL

For production deployment:
```bash
# Add custom domain to API Gateway
# Configure SSL certificate
# Update CloudFront distribution
```

### 4. Set up Monitoring

- Configure CloudWatch alarms
- Set up SNS notifications
- Enable X-Ray tracing (staging/production)

## Verification Steps

### 1. Infrastructure Health Check

```bash
# Check API Gateway
curl https://your-api-gateway-url/v1/health

# Check DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Check S3 buckets
aws s3 ls
```

### 2. Application Health Check

```bash
# Start the application
npm run dev

# Visit http://localhost:3000
# Test user registration
# Test voice recording
# Test translation services
```

### 3. End-to-End Testing

1. Register as a vendor
2. Create a product listing with voice description
3. Register as a buyer
4. Search for products
5. Place a bid with voice message
6. Test real-time chat translation

## Troubleshooting

### Common Issues

1. **CDK Bootstrap Required**
   ```bash
   npx cdk bootstrap aws://ACCOUNT-NUMBER/REGION
   ```

2. **Insufficient Permissions**
   - Check IAM policies
   - Ensure CloudFormation permissions
   - Verify service-specific permissions

3. **Resource Limits**
   - Check AWS service quotas
   - Request limit increases if needed

4. **Region Availability**
   - Ensure all services are available in your region
   - Some AI services may have limited regional availability

### Debugging Commands

```bash
# Check CDK diff
npm run infra:diff

# View CloudFormation events
aws cloudformation describe-stack-events --stack-name EkBharathEkMandiStack

# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/

# Test API endpoints
curl -X GET https://your-api-gateway-url/v1/health
```

## Cleanup

To remove all infrastructure:

```bash
# Destroy infrastructure
npm run infra:destroy

# This will:
# 1. Empty S3 buckets
# 2. Delete CloudFormation stack
# 3. Remove all AWS resources
```

## Cost Optimization

### Development
- Use minimal instance sizes
- Enable lifecycle policies
- Use pay-per-request billing

### Production
- Monitor usage patterns
- Set up cost alerts
- Optimize based on actual usage

## Security Considerations

1. **Data Encryption**
   - All data encrypted at rest
   - TLS for data in transit
   - Voice recordings auto-deleted

2. **Access Control**
   - IAM roles with least privilege
   - API Gateway authentication
   - Cognito user management

3. **Network Security**
   - VPC configuration (optional)
   - Security groups
   - CORS policies

## Monitoring and Maintenance

### Regular Tasks
- Monitor CloudWatch metrics
- Review cost reports
- Update dependencies
- Security patches

### Scaling Considerations
- DynamoDB auto-scaling
- Lambda concurrency limits
- ElastiCache cluster sizing
- OpenSearch instance scaling

## Support

For deployment issues:
1. Check AWS CloudFormation console
2. Review CloudWatch logs
3. Verify IAM permissions
4. Check service quotas and limits

For application issues:
1. Check browser console
2. Review Next.js logs
3. Test API endpoints
4. Verify environment variables