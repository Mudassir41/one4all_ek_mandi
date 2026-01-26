# Ek Bharath Ek Mandi - Infrastructure Summary

## Overview
This document provides a comprehensive summary of the AWS infrastructure configured for the Ek Bharath Ek Mandi platform using AWS CDK.

## Infrastructure Components

### 1. Core Database Layer (DynamoDB)

#### Users Table (`ek-bharath-users`)
- **Purpose**: Store user profiles, authentication data, and preferences
- **Partition Key**: `PK` (User ID)
- **Sort Key**: `SK` (Profile/metadata type)
- **Global Secondary Indexes**:
  - `PhoneIndex`: For phone number lookups
  - `LocationIndex`: For location-based user queries

#### Products Table (`ek-bharath-products`)
- **Purpose**: Store product listings, descriptions, and metadata
- **Partition Key**: `PK` (Product ID)
- **Sort Key**: `SK` (Details/metadata type)
- **Global Secondary Indexes**:
  - `CategoryIndex`: For category-based searches
  - `LocationIndex`: For location-based product searches
  - `VendorIndex`: For vendor-specific product listings

#### Bids Table (`ek-bharath-bids`)
- **Purpose**: Store bidding data and transaction information
- **Partition Key**: `PK` (Product ID)
- **Sort Key**: `SK` (Bid ID)
- **Global Secondary Indexes**:
  - `BuyerIndex`: For buyer-specific bid history
  - `StatusIndex`: For bid status filtering

#### Conversations Table (`ek-bharath-conversations`)
- **Purpose**: Store chat messages and voice translations
- **Partition Key**: `PK` (Chat ID)
- **Sort Key**: `SK` (Message timestamp)
- **Global Secondary Indexes**:
  - `UserIndex`: For user-specific conversation history

### 2. Storage Layer (S3)

#### Media Bucket
- **Purpose**: Store product images and general media files
- **Features**:
  - Versioning enabled
  - S3 managed encryption
  - CORS configuration for web uploads
  - Lifecycle rules for cleanup

#### Voice Bucket
- **Purpose**: Store audio recordings and voice messages
- **Features**:
  - Automatic deletion after 30 days (privacy compliance)
  - S3 managed encryption
  - CORS configuration for audio uploads
  - Lifecycle rules for automatic cleanup

### 3. API Layer (API Gateway + Lambda)

#### API Gateway
- **Type**: REST API
- **Features**:
  - CORS enabled for web applications
  - Binary media type support (audio/*, image/*)
  - Rate limiting and throttling
  - Request/response validation

#### API Endpoints Structure
```
/v1/
├── auth/
│   ├── login
│   ├── register
│   └── verify
├── users/
│   └── {userId}
├── products/
│   ├── {productId}
│   └── search
├── bids/
│   └── {bidId}
├── translate/
│   ├── voice
│   └── text
├── chat/
│   └── {chatId}/
│       └── messages
└── prices/
    ├── query
    └── market-data
```

#### Lambda Functions
1. **Authentication Service**: User registration, login, verification
2. **Translation Service**: Voice-to-voice translation pipeline
3. **Product Service**: Product CRUD operations and search
4. **Bidding Service**: Bid management and transaction processing
5. **Chat Service**: Real-time messaging with translation

### 4. Authentication (Cognito)

#### User Pool Configuration
- **Sign-in**: Phone number based
- **MFA**: Optional SMS-based
- **Custom Attributes**:
  - `user_type`: vendor/B2B/B2C
  - `languages`: Supported languages
  - `state`: User's state
  - `district`: User's district
- **Password Policy**: Flexible for diverse user base

### 5. Caching Layer (ElastiCache)

#### Redis Configuration
- **Instance Type**: cache.t3.micro (development)
- **Purpose**: 
  - Translation result caching
  - Session management
  - Search result caching
  - API response caching

### 6. Search Engine (OpenSearch)

#### Domain Configuration
- **Version**: OpenSearch 2.11
- **Instance**: t3.small.search (single node for development)
- **Storage**: 20GB GP3 EBS volume
- **Features**:
  - Encryption at rest and in transit
  - HTTPS enforcement
  - Application and slow query logging
  - Multi-language search support

### 7. Content Delivery (CloudFront)

#### Distribution Configuration
- **Origin**: S3 media bucket with Origin Access Control
- **Behaviors**:
  - Default: Media files from S3
  - `/api/*`: API Gateway endpoints
- **Geographic Restriction**: India only (MVP scope)
- **Price Class**: 100 (cost optimization)

### 8. AI/ML Services Integration

#### Supported Services
- **Amazon Transcribe**: Speech-to-text conversion
- **Amazon Translate**: Text translation between languages
- **Amazon Polly**: Text-to-speech synthesis
- **Amazon Bedrock**: Claude AI for context-aware translation

#### IAM Permissions
Lambda functions have appropriate permissions to access:
- All AI/ML services for translation pipeline
- DynamoDB tables for data operations
- S3 buckets for media storage
- CloudWatch for logging and monitoring

### 9. Security Features

#### Data Protection
- **Encryption at Rest**: All DynamoDB tables and S3 buckets
- **Encryption in Transit**: HTTPS/TLS for all communications
- **Voice Data**: Automatic deletion after 30 days

#### Access Control
- **IAM Roles**: Least privilege principle
- **API Gateway**: Authentication and authorization
- **Cognito**: User identity management
- **Resource Policies**: Fine-grained access control

#### Network Security
- **CORS**: Properly configured for web applications
- **HTTPS**: Enforced across all services
- **API Rate Limiting**: Protection against abuse

### 10. Monitoring and Logging

#### CloudWatch Integration
- **Lambda Logs**: Function execution logs
- **API Gateway Logs**: Request/response logging
- **DynamoDB Metrics**: Performance monitoring
- **OpenSearch Logs**: Search and indexing logs

#### Custom Metrics
- Translation accuracy and latency
- User engagement patterns
- System performance indicators
- Business metrics (transactions, users)

## Environment Configuration

### Development Environment
- **Resources**: Minimal sizing for cost optimization
- **Billing**: Pay-per-request for DynamoDB
- **Retention**: Short log retention periods
- **Monitoring**: Basic CloudWatch monitoring

### Production Considerations
- **Auto-scaling**: Enabled for all scalable services
- **Multi-AZ**: For high availability
- **Backup**: Point-in-time recovery for DynamoDB
- **Monitoring**: Enhanced monitoring and alerting

## Cost Optimization Features

### Pay-per-Use Services
- DynamoDB on-demand billing
- Lambda serverless compute
- API Gateway request-based pricing
- S3 storage with lifecycle policies

### Resource Right-Sizing
- Development: Minimal instance types
- Staging: Medium instance types
- Production: Auto-scaling based on demand

### Lifecycle Management
- S3 lifecycle rules for automatic cleanup
- Voice recordings auto-deletion
- Log retention policies

## Deployment Process

### Prerequisites
1. AWS CLI configured with appropriate permissions
2. Node.js 18+ installed
3. CDK CLI installed (locally or globally)

### Deployment Steps
```bash
# Install dependencies
npm run infra:install

# Deploy infrastructure
npm run infra:deploy

# Validate deployment
npm run infra:validate
```

### Post-Deployment
1. Update application environment variables
2. Configure external API keys
3. Set up monitoring and alerting
4. Test all services and integrations

## Scalability Design

### Horizontal Scaling
- Lambda functions: Automatic concurrency scaling
- DynamoDB: On-demand scaling
- API Gateway: Automatic request handling
- ElastiCache: Cluster scaling (production)

### Vertical Scaling
- OpenSearch: Instance type upgrades
- ElastiCache: Memory optimization
- Lambda: Memory and timeout adjustments

### Global Scaling
- CloudFront: Global edge locations
- Multi-region deployment capability
- Cross-region replication for critical data

## Disaster Recovery

### Backup Strategy
- DynamoDB: Point-in-time recovery
- S3: Cross-region replication (production)
- Lambda: Code versioning and aliases
- Configuration: Infrastructure as Code

### Recovery Procedures
- Automated CloudFormation rollback
- Database restore from backups
- Multi-region failover capability
- Health checks and auto-recovery

## Compliance and Governance

### Data Governance
- Data retention policies
- Privacy controls (voice data deletion)
- Audit logging for all operations
- Compliance with Indian data regulations

### Security Compliance
- Encryption standards
- Access control policies
- Regular security assessments
- Vulnerability management

## Future Enhancements

### Planned Improvements
1. **Multi-region deployment** for global availability
2. **Advanced monitoring** with X-Ray tracing
3. **Machine learning** for improved translations
4. **Real-time analytics** with Kinesis
5. **Mobile app support** with additional APIs

### Scalability Roadmap
1. **Phase 1**: Single region, basic scaling
2. **Phase 2**: Multi-region, advanced caching
3. **Phase 3**: Global deployment, edge computing
4. **Phase 4**: AI/ML optimization, predictive scaling

This infrastructure provides a solid foundation for the Ek Bharath Ek Mandi platform, supporting the voice-first, multilingual trading experience while maintaining security, scalability, and cost-effectiveness.