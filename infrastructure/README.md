# Ek Bharath Ek Mandi - Infrastructure

This directory contains the AWS CDK infrastructure code for the Ek Bharath Ek Mandi platform.

## Architecture Overview

The infrastructure includes:

- **DynamoDB Tables**: Users, Products, Bids, Conversations
- **S3 Buckets**: Media storage and voice recordings
- **API Gateway**: RESTful API endpoints
- **Lambda Functions**: Serverless compute for business logic
- **Cognito**: User authentication and authorization
- **ElastiCache**: Redis caching for translations and search
- **OpenSearch**: Full-text search for products
- **CloudFront**: Global content delivery network

## Prerequisites

1. **AWS CLI**: Install and configure with appropriate credentials
   ```bash
   aws configure
   ```

2. **Node.js**: Version 18 or higher
   ```bash
   node --version
   ```

3. **AWS CDK**: Install globally or use npx
   ```bash
   npm install -g aws-cdk
   # or use npx cdk
   ```

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS account details
   ```

3. **Bootstrap CDK** (first time only)
   ```bash
   npx cdk bootstrap
   ```

4. **Deploy Infrastructure**
   ```bash
   ./scripts/deploy.sh
   ```

## Project Structure

```
infrastructure/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   └── ek-bharath-ek-mandi-stack.ts  # Main infrastructure stack
├── config/
│   └── environments.ts     # Environment-specific configurations
├── scripts/
│   ├── deploy.sh          # Deployment script
│   └── destroy.sh         # Destruction script
├── cdk.json               # CDK configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Available Commands

### Development Commands
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch for changes
npm run watch

# Run tests
npm test
```

### CDK Commands
```bash
# Synthesize CloudFormation template
npx cdk synth

# Deploy infrastructure
npx cdk deploy

# Show differences
npx cdk diff

# Destroy infrastructure
npx cdk destroy
```

### Custom Scripts
```bash
# Deploy with environment setup
./scripts/deploy.sh

# Destroy infrastructure safely
./scripts/destroy.sh
```

## Environment Configuration

The infrastructure supports multiple environments:

- **Development**: Minimal resources for local development
- **Staging**: Production-like environment for testing
- **Production**: Full-scale production environment

Configure the environment by setting the `NODE_ENV` variable:

```bash
export NODE_ENV=development  # or staging, production
```

## AWS Services Used

### Core Services
- **DynamoDB**: NoSQL database for application data
- **S3**: Object storage for media files and voice recordings
- **Lambda**: Serverless functions for business logic
- **API Gateway**: RESTful API management

### AI/ML Services
- **Amazon Transcribe**: Speech-to-text conversion
- **Amazon Translate**: Text translation between languages
- **Amazon Polly**: Text-to-speech synthesis
- **Amazon Bedrock**: Large language models for context-aware translation

### Additional Services
- **Cognito**: User authentication and management
- **ElastiCache**: Redis caching layer
- **OpenSearch**: Search and analytics
- **CloudFront**: Content delivery network

## Security Features

- **Encryption**: All data encrypted at rest and in transit
- **IAM Roles**: Least privilege access for all services
- **VPC**: Network isolation (configurable)
- **CORS**: Proper cross-origin resource sharing
- **Authentication**: Cognito-based user management

## Monitoring and Logging

- **CloudWatch**: Metrics and logging
- **X-Ray**: Distributed tracing (staging/production)
- **Custom Metrics**: Application-specific monitoring
- **Alarms**: Automated alerting for critical issues

## Cost Optimization

- **Pay-per-request**: DynamoDB billing mode
- **Lifecycle Policies**: Automatic S3 object deletion
- **Right-sizing**: Environment-appropriate instance sizes
- **Auto-scaling**: Automatic resource scaling

## Deployment Process

1. **Pre-deployment Checks**
   - AWS credentials validation
   - Environment variable verification
   - Dependency installation

2. **Infrastructure Deployment**
   - CDK bootstrap (if needed)
   - CloudFormation template synthesis
   - Stack deployment with rollback protection

3. **Post-deployment**
   - Output values for frontend configuration
   - Health checks and validation
   - Documentation updates

## Troubleshooting

### Common Issues

1. **Bootstrap Required**
   ```bash
   npx cdk bootstrap aws://ACCOUNT-NUMBER/REGION
   ```

2. **Permission Denied**
   - Ensure AWS credentials have sufficient permissions
   - Check IAM policies for CDK deployment

3. **Resource Conflicts**
   - Check for existing resources with same names
   - Verify region and account settings

4. **Deployment Failures**
   - Check CloudFormation console for detailed errors
   - Review CloudWatch logs for Lambda functions

### Getting Help

- Check AWS CDK documentation: https://docs.aws.amazon.com/cdk/
- Review CloudFormation events in AWS Console
- Check application logs in CloudWatch
- Validate IAM permissions and policies

## Contributing

1. Follow TypeScript best practices
2. Add appropriate comments and documentation
3. Test changes in development environment first
4. Update this README for any architectural changes

## License

This project is part of the Ek Bharath Ek Mandi platform.