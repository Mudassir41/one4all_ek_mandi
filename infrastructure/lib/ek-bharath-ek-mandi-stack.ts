import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { SecretsManager } from './secrets-manager';
import { EnvironmentConfig } from './environment-config';

export interface EkBharathEkMandiStackProps extends cdk.StackProps {
  environment: string;
}

export class EkBharathEkMandiStack extends cdk.Stack {
  public readonly usersTable!: dynamodb.Table;
  public readonly productsTable!: dynamodb.Table;
  public readonly bidsTable!: dynamodb.Table;
  public readonly conversationsTable!: dynamodb.Table;
  public readonly priceHistoryTable!: dynamodb.Table;
  public readonly translationCacheTable!: dynamodb.Table;
  public readonly userSessionsTable!: dynamodb.Table;
  public readonly mediaBucket!: s3.Bucket;
  public readonly voiceBucket!: s3.Bucket;
  public readonly api!: apigateway.RestApi;
  public readonly userPool!: cognito.UserPool;
  public readonly secretsManager!: SecretsManager;
  public readonly environmentConfig!: EnvironmentConfig;

  constructor(scope: Construct, id: string, props: EkBharathEkMandiStackProps) {
    super(scope, id, props);

    // Initialize secrets manager and environment configuration
    this.secretsManager = new SecretsManager(this, 'SecretsManager', {
      environment: props.environment,
      region: this.region,
    });

    this.environmentConfig = new EnvironmentConfig(this, 'EnvironmentConfig', {
      environment: props.environment,
      region: this.region,
      account: this.account,
    });

    // Create DynamoDB Tables
    this.createDynamoDBTables();
    
    // Create S3 Buckets
    this.createS3Buckets();
    
    // Create ElastiCache for caching
    this.createElastiCache();
    
    // Create OpenSearch for search functionality
    this.createOpenSearch();
    
    // Create Cognito User Pool for authentication
    this.createCognitoUserPool();
    
    // Create API Gateway
    this.createApiGateway();
    
    // Create Lambda functions
    this.createLambdaFunctions();
    
    // Create CloudFront distribution
    this.createCloudFrontDistribution();
    
    // Output important values
    this.createOutputs();
  }

  private createDynamoDBTables() {
    // Users Table - Stores vendor, B2B buyer, and B2C buyer profiles
    (this as any).usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'ek-bharath-users',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, // USER#{userId}
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING }, // PROFILE | SETTINGS | VERIFICATION
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // For real-time updates
    });

    // GSI for phone number lookup (authentication)
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'PhoneIndex',
      partitionKey: { name: 'phone', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for location-based user queries (find vendors/buyers by location)
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'LocationIndex',
      partitionKey: { name: 'state', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'district', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for user type queries (find all vendors, B2B buyers, etc.)
    this.usersTable.addGlobalSecondaryIndex({
      indexName: 'UserTypeIndex',
      partitionKey: { name: 'user_type', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Products Table - Stores multilingual product listings with dual pricing
    (this as any).productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: 'ek-bharath-products',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, // PRODUCT#{productId}
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING }, // DETAILS | PRICING | IMAGES
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // For search index updates
    });

    // GSI for category-based searches (agriculture, handicrafts, etc.)
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'CategoryIndex',
      partitionKey: { name: 'category', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for location-based product searches (find products by state/region)
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'LocationIndex',
      partitionKey: { name: 'state', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for vendor products (vendor dashboard - my products)
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'VendorIndex',
      partitionKey: { name: 'vendor_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for product status queries (active, sold, expired)
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for price range queries (find products within price range)
    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'PriceIndex',
      partitionKey: { name: 'category', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'price_sort_key', type: dynamodb.AttributeType.STRING }, // Format: "price#created_at"
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Bids Table - Stores both B2B bids and B2C direct purchase requests
    (this as any).bidsTable = new dynamodb.Table(this, 'BidsTable', {
      tableName: 'ek-bharath-bids',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, // PRODUCT#{productId}
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING }, // BID#{bidId} | PURCHASE#{purchaseId}
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // For real-time bid notifications
    });

    // GSI for buyer bids (buyer dashboard - my bids/purchases)
    this.bidsTable.addGlobalSecondaryIndex({
      indexName: 'BuyerIndex',
      partitionKey: { name: 'buyer_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for bid status queries (pending, accepted, rejected, completed)
    this.bidsTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for buyer type queries (B2B vs B2C analytics)
    this.bidsTable.addGlobalSecondaryIndex({
      indexName: 'BuyerTypeIndex',
      partitionKey: { name: 'buyer_type', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for vendor bids (vendor dashboard - incoming bids)
    this.bidsTable.addGlobalSecondaryIndex({
      indexName: 'VendorBidsIndex',
      partitionKey: { name: 'vendor_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Conversations Table - Stores multilingual voice and text conversations
    (this as any).conversationsTable = new dynamodb.Table(this, 'ConversationsTable', {
      tableName: 'ek-bharath-conversations',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, // CHAT#{vendorId}#{buyerId}
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING }, // MSG#{timestamp} | METADATA
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // For real-time chat updates
      // TTL for automatic message cleanup (privacy compliance)
      timeToLiveAttribute: 'ttl',
    });

    // GSI for user conversations (user dashboard - my chats)
    this.conversationsTable.addGlobalSecondaryIndex({
      indexName: 'UserIndex',
      partitionKey: { name: 'sender_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for recipient conversations (find chats where user is recipient)
    this.conversationsTable.addGlobalSecondaryIndex({
      indexName: 'RecipientIndex',
      partitionKey: { name: 'recipient_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'created_at', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for unread messages (notification system)
    this.conversationsTable.addGlobalSecondaryIndex({
      indexName: 'UnreadIndex',
      partitionKey: { name: 'recipient_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'read_status', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for language-based analytics (translation quality monitoring)
    this.conversationsTable.addGlobalSecondaryIndex({
      indexName: 'LanguageIndex',
      partitionKey: { name: 'source_lang', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'target_lang', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.KEYS_ONLY,
    });

    // Price History Table - Stores market price data for AI price discovery
    const priceHistoryTable = new dynamodb.Table(this, 'PriceHistoryTable', {
      tableName: 'ek-bharath-price-history',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, // MARKET#{state}#{product}
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING }, // DATE#{date}
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // GSI for product price queries across markets
    priceHistoryTable.addGlobalSecondaryIndex({
      indexName: 'ProductIndex',
      partitionKey: { name: 'product_category', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI for state-wise price analysis
    priceHistoryTable.addGlobalSecondaryIndex({
      indexName: 'StateIndex',
      partitionKey: { name: 'state', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Translation Cache Table - Caches common translations for performance
    const translationCacheTable = new dynamodb.Table(this, 'TranslationCacheTable', {
      tableName: 'ek-bharath-translation-cache',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, // TRANSLATION#{hash}
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING }, // {sourceLang}#{targetLang}
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // TTL for cache expiration
      timeToLiveAttribute: 'ttl',
    });

    // GSI for language pair queries
    translationCacheTable.addGlobalSecondaryIndex({
      indexName: 'LanguagePairIndex',
      partitionKey: { name: 'source_lang', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'target_lang', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // User Sessions Table - Manages user sessions and real-time presence
    const userSessionsTable = new dynamodb.Table(this, 'UserSessionsTable', {
      tableName: 'ek-bharath-user-sessions',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING }, // SESSION#{sessionId}
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING }, // USER#{userId}
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // TTL for automatic session cleanup
      timeToLiveAttribute: 'ttl',
    });

    // GSI for user active sessions
    userSessionsTable.addGlobalSecondaryIndex({
      indexName: 'UserIndex',
      partitionKey: { name: 'user_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'last_activity', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Store additional table references for use in other methods
    (this as any).priceHistoryTable = priceHistoryTable;
    (this as any).translationCacheTable = translationCacheTable;
    (this as any).userSessionsTable = userSessionsTable;
  }

  private createS3Buckets() {
    // Media Bucket for product images and general media
    (this as any).mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: `ek-bharath-media-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.KMS_MANAGED, // Enhanced encryption
      enforceSSL: true, // Enforce HTTPS
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Enhanced security
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: [
            'https://localhost:3000', // Development
            'https://*.ek-bharath.com', // Production domains
            'https://*.amazonaws.com', // CloudFront
          ],
          allowedHeaders: [
            'Content-Type',
            'Content-Length',
            'Authorization',
            'X-Amz-Date',
            'X-Api-Key',
            'X-Amz-Security-Token',
            'x-amz-content-sha256',
            'x-amz-user-agent',
          ],
          exposedHeaders: ['ETag'],
          maxAge: 3600,
        },
      ],
      lifecycleRules: [
        {
          id: 'DeleteIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
        },
        {
          id: 'TransitionToIA',
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
        {
          id: 'DeleteOldVersions',
          noncurrentVersionExpiration: cdk.Duration.days(30),
        },
      ],
      notificationsHandlerRole: new iam.Role(this, 'MediaBucketNotificationRole', {
        assumedBy: new iam.ServicePrincipal('s3.amazonaws.com'),
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Voice Bucket for audio files with automatic deletion and enhanced privacy
    (this as any).voiceBucket = new s3.Bucket(this, 'VoiceBucket', {
      bucketName: `ek-bharath-voice-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.KMS_MANAGED, // Enhanced encryption
      enforceSSL: true, // Enforce HTTPS
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Enhanced security
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: [
            'https://localhost:3000', // Development
            'https://*.ek-bharath.com', // Production domains
            'https://*.amazonaws.com', // CloudFront
          ],
          allowedHeaders: [
            'Content-Type',
            'Content-Length',
            'Authorization',
            'X-Amz-Date',
            'X-Api-Key',
            'X-Amz-Security-Token',
            'x-amz-content-sha256',
            'x-amz-user-agent',
          ],
          exposedHeaders: ['ETag'],
          maxAge: 1800, // Shorter cache for voice files
        },
      ],
      lifecycleRules: [
        {
          id: 'DeleteVoiceFiles',
          expiration: cdk.Duration.days(30), // Auto-delete after 30 days for privacy compliance
        },
        {
          id: 'DeleteIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(1), // Keep as 1 day for voice files too
        },
        {
          id: 'DeleteOldVersions',
          noncurrentVersionExpiration: cdk.Duration.days(1), // Quick cleanup of old versions
        },
      ],
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED, // Enhanced security
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create bucket policies for enhanced security
    this.createBucketPolicies();
    
    // Set up bucket notifications for processing
    this.setupBucketNotifications();
  }

  private createBucketPolicies() {
    // Media bucket policy - Allow CloudFront and authenticated users
    const mediaBucketPolicyStatements = [
      // Deny insecure connections
      new iam.PolicyStatement({
        sid: 'DenyInsecureConnections',
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:*'],
        resources: [
          this.mediaBucket.bucketArn,
          `${this.mediaBucket.bucketArn}/*`,
        ],
        conditions: {
          Bool: {
            'aws:SecureTransport': 'false',
          },
        },
      }),
      // Allow CloudFront access
      new iam.PolicyStatement({
        sid: 'AllowCloudFrontAccess',
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        actions: ['s3:GetObject'],
        resources: [`${this.mediaBucket.bucketArn}/*`],
      }),
    ];

    // Voice bucket policy - Stricter access for privacy
    const voiceBucketPolicyStatements = [
      // Deny insecure connections
      new iam.PolicyStatement({
        sid: 'DenyInsecureConnections',
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:*'],
        resources: [
          this.voiceBucket.bucketArn,
          `${this.voiceBucket.bucketArn}/*`,
        ],
        conditions: {
          Bool: {
            'aws:SecureTransport': 'false',
          },
        },
      }),
      // Deny public access
      new iam.PolicyStatement({
        sid: 'DenyPublicAccess',
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:GetObject', 's3:PutObject'],
        resources: [`${this.voiceBucket.bucketArn}/*`],
        conditions: {
          StringNotEquals: {
            'aws:PrincipalServiceName': [
              'lambda.amazonaws.com',
              'transcribe.amazonaws.com',
              'polly.amazonaws.com',
            ],
          },
        },
      }),
    ];

    // Apply bucket policies
    mediaBucketPolicyStatements.forEach(statement => {
      this.mediaBucket.addToResourcePolicy(statement);
    });
    
    voiceBucketPolicyStatements.forEach(statement => {
      this.voiceBucket.addToResourcePolicy(statement);
    });
  }

  private setupBucketNotifications() {
    // Create Lambda function for processing uploaded media
    const mediaProcessorFunction = new lambda.Function(this, 'MediaProcessorFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const AWS = require('aws-sdk');
        const sharp = require('sharp');
        
        exports.handler = async (event) => {
          console.log('Processing media upload:', JSON.stringify(event, null, 2));
          
          for (const record of event.Records) {
            if (record.eventName.startsWith('ObjectCreated')) {
              const bucket = record.s3.bucket.name;
              const key = record.s3.object.key;
              
              // Process image files
              if (key.match(/\\.(jpg|jpeg|png|webp)$/i)) {
                await processImage(bucket, key);
              }
              
              // Update search index
              await updateSearchIndex(bucket, key);
            }
          }
          
          return { statusCode: 200, body: 'Processing complete' };
        };
        
        async function processImage(bucket, key) {
          // Image optimization logic will be implemented here
          console.log(\`Processing image: \${bucket}/\${key}\`);
        }
        
        async function updateSearchIndex(bucket, key) {
          // Search index update logic will be implemented here
          console.log(\`Updating search index for: \${bucket}/\${key}\`);
        }
      `),
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      environment: {
        MEDIA_BUCKET: this.mediaBucket.bucketName,
        PRODUCTS_TABLE: this.productsTable.tableName,
      },
    });

    // Grant permissions to the media processor
    this.mediaBucket.grantReadWrite(mediaProcessorFunction);
    this.productsTable.grantReadWriteData(mediaProcessorFunction);

    // Add S3 event notification
    this.mediaBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(mediaProcessorFunction),
      { prefix: 'uploads/' }
    );

    // Create Lambda function for voice file processing
    const voiceProcessorFunction = new lambda.Function(this, 'VoiceProcessorFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          console.log('Processing voice upload:', JSON.stringify(event, null, 2));
          
          for (const record of event.Records) {
            if (record.eventName.startsWith('ObjectCreated')) {
              const bucket = record.s3.bucket.name;
              const key = record.s3.object.key;
              
              // Trigger transcription for voice files
              if (key.match(/\\.(mp3|wav|m4a|ogg)$/i)) {
                await triggerTranscription(bucket, key);
              }
            }
          }
          
          return { statusCode: 200, body: 'Voice processing initiated' };
        };
        
        async function triggerTranscription(bucket, key) {
          // Transcription logic will be implemented here
          console.log(\`Triggering transcription for: \${bucket}/\${key}\`);
        }
      `),
      timeout: cdk.Duration.minutes(2),
      environment: {
        VOICE_BUCKET: this.voiceBucket.bucketName,
        CONVERSATIONS_TABLE: this.conversationsTable.tableName,
      },
    });

    // Grant permissions to the voice processor
    this.voiceBucket.grantRead(voiceProcessorFunction);
    this.conversationsTable.grantReadWriteData(voiceProcessorFunction);

    // Add S3 event notification for voice files
    this.voiceBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(voiceProcessorFunction)
    );
  }

  private createElastiCache() {
    // Create ElastiCache subnet group
    const subnetGroup = new elasticache.CfnSubnetGroup(this, 'CacheSubnetGroup', {
      description: 'Subnet group for ElastiCache',
      subnetIds: ['subnet-12345'], // Replace with actual subnet IDs
    });

    // Create ElastiCache Redis cluster for caching translations and search results
    new elasticache.CfnCacheCluster(this, 'RedisCache', {
      cacheNodeType: 'cache.t3.micro',
      engine: 'redis',
      numCacheNodes: 1,
      cacheSubnetGroupName: subnetGroup.ref,
      tags: [
        { key: 'Name', value: 'ek-bharath-redis-cache' },
        { key: 'Purpose', value: 'Translation and Search Caching' },
      ],
    });
  }

  private createOpenSearch() {
    // Create OpenSearch domain for product search
    new opensearch.Domain(this, 'SearchDomain', {
      version: opensearch.EngineVersion.OPENSEARCH_2_11,
      capacity: {
        dataNodes: 1,
        dataNodeInstanceType: 't3.small.search',
        multiAzWithStandbyEnabled: false, // T3 instances don't support Multi-AZ with standby
      },
      ebs: {
        volumeSize: 20,
        volumeType: cdk.aws_ec2.EbsDeviceVolumeType.GP3,
      },
      zoneAwareness: {
        enabled: false,
      },
      logging: {
        slowSearchLogEnabled: true,
        appLogEnabled: true,
        slowIndexLogEnabled: true,
      },
      nodeToNodeEncryption: true,
      encryptionAtRest: {
        enabled: true,
      },
      enforceHttps: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }

  private createCognitoUserPool() {
    // Create Cognito User Pool for authentication
    (this as any).userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'ek-bharath-users',
      signInAliases: {
        phone: true,
      },
      standardAttributes: {
        phoneNumber: {
          required: true,
          mutable: true,
        },
        preferredUsername: {
          required: false,
          mutable: true,
        },
      },
      customAttributes: {
        user_type: new cognito.StringAttribute({ mutable: true }),
        languages: new cognito.StringAttribute({ mutable: true }),
        state: new cognito.StringAttribute({ mutable: true }),
        district: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: false,
        requireUppercase: false,
        requireDigits: true,
        requireSymbols: false,
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: true,
        otp: false,
      },
      accountRecovery: cognito.AccountRecovery.PHONE_ONLY_WITHOUT_MFA,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create User Pool Client
    new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE, cognito.OAuthScope.PHONE],
      },
    });
  }

  private createApiGateway() {
    // Create API Gateway
    (this as any).api = new apigateway.RestApi(this, 'EkBharathApi', {
      restApiName: 'Ek Bharath Ek Mandi API',
      description: 'API for Ek Bharath Ek Mandi platform',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
      binaryMediaTypes: ['audio/*', 'image/*'],
    });

    // Create API resources
    const v1 = this.api.root.addResource('v1');
    
    // Authentication endpoints
    const auth = v1.addResource('auth');
    auth.addResource('login');
    auth.addResource('register');
    auth.addResource('verify');
    
    // User endpoints
    const users = v1.addResource('users');
    users.addResource('{userId}');
    
    // Product endpoints
    const products = v1.addResource('products');
    products.addResource('{productId}');
    products.addResource('search');
    
    // Bidding endpoints
    const bids = v1.addResource('bids');
    bids.addResource('{bidId}');
    
    // Translation endpoints
    const translate = v1.addResource('translate');
    translate.addResource('voice');
    translate.addResource('text');
    
    // Chat endpoints
    const chat = v1.addResource('chat');
    const chatWithId = chat.addResource('{chatId}');
    const chatMessages = chatWithId.addResource('messages');
    
    // Price discovery endpoints
    const prices = v1.addResource('prices');
    prices.addResource('query');
    prices.addResource('market-data');
  }

  private createLambdaFunctions() {
    // Create IAM role for Lambda functions with enhanced permissions
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXRayDaemonWriteAccess'),
      ],
      inlinePolicies: {
        DynamoDBAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:BatchGetItem',
                'dynamodb:BatchWriteItem',
              ],
              resources: [
                this.usersTable.tableArn,
                this.productsTable.tableArn,
                this.bidsTable.tableArn,
                this.conversationsTable.tableArn,
                this.priceHistoryTable.tableArn,
                this.translationCacheTable.tableArn,
                this.userSessionsTable.tableArn,
                `${this.usersTable.tableArn}/index/*`,
                `${this.productsTable.tableArn}/index/*`,
                `${this.bidsTable.tableArn}/index/*`,
                `${this.conversationsTable.tableArn}/index/*`,
                `${this.priceHistoryTable.tableArn}/index/*`,
                `${this.translationCacheTable.tableArn}/index/*`,
                `${this.userSessionsTable.tableArn}/index/*`,
              ],
            }),
          ],
        }),
        S3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
              ],
              resources: [
                `${this.mediaBucket.bucketArn}/*`,
                `${this.voiceBucket.bucketArn}/*`,
              ],
            }),
          ],
        }),
        AIServicesAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'transcribe:StartTranscriptionJob',
                'transcribe:GetTranscriptionJob',
                'translate:TranslateText',
                'polly:SynthesizeSpeech',
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
                'cognito-idp:InitiateAuth',
                'cognito-idp:RespondToAuthChallenge',
                'cognito-idp:SignUp',
                'cognito-idp:ConfirmSignUp',
              ],
              resources: ['*'],
            }),
          ],
        }),
        SecretsManagerAccess: this.secretsManager.createSecretsAccessPolicy(),
        SSMParameterAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'ssm:GetParameter',
                'ssm:GetParameters',
                'ssm:GetParametersByPath',
              ],
              resources: [
                `arn:aws:ssm:${this.region}:${this.account}:parameter/ek-bharath/*`,
              ],
            }),
          ],
        }),
      },
    });

    // Get base environment variables from configuration
    const baseEnvironment = {
      ...this.environmentConfig.getLambdaEnvironmentVariables({
        environment: this.environmentConfig.configuration.monitoring.logLevel === 'DEBUG' ? 'development' : 'production',
        region: this.region,
        account: this.account,
      }),
      ...this.secretsManager.getLambdaEnvironmentVariables(),
      // DynamoDB table names
      USERS_TABLE: this.usersTable.tableName,
      PRODUCTS_TABLE: this.productsTable.tableName,
      BIDS_TABLE: this.bidsTable.tableName,
      CONVERSATIONS_TABLE: this.conversationsTable.tableName,
      PRICE_HISTORY_TABLE: this.priceHistoryTable.tableName,
      TRANSLATION_CACHE_TABLE: this.translationCacheTable.tableName,
      USER_SESSIONS_TABLE: this.userSessionsTable.tableName,
      // S3 bucket names
      MEDIA_BUCKET: this.mediaBucket.bucketName,
      VOICE_BUCKET: this.voiceBucket.bucketName,
      // Cognito configuration
      USER_POOL_ID: this.userPool.userPoolId,
      // Supported languages
      SUPPORTED_LANGUAGES: 'hi,ta,te,kn,bn,or,ml,en',
    };

    // Create Lambda functions for different services
    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/auth'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(this.environmentConfig.configuration.lambda.timeout),
      memorySize: this.environmentConfig.configuration.lambda.memorySize,
      environment: {
        ...baseEnvironment,
        FUNCTION_NAME: 'auth',
      },
      tracing: this.environmentConfig.configuration.lambda.enableXRay ? lambda.Tracing.ACTIVE : lambda.Tracing.DISABLED,
      reservedConcurrentExecutions: this.environmentConfig.configuration.lambda.reservedConcurrency,
    });

    const translationFunction = new lambda.Function(this, 'TranslationFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/translation'),
      role: lambdaRole,
      timeout: cdk.Duration.minutes(5), // Translation needs more time
      memorySize: Math.max(1024, this.environmentConfig.configuration.lambda.memorySize), // Translation needs more memory
      environment: {
        ...baseEnvironment,
        FUNCTION_NAME: 'translation',
      },
      tracing: this.environmentConfig.configuration.lambda.enableXRay ? lambda.Tracing.ACTIVE : lambda.Tracing.DISABLED,
    });

    const productFunction = new lambda.Function(this, 'ProductFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/products'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(this.environmentConfig.configuration.lambda.timeout),
      memorySize: this.environmentConfig.configuration.lambda.memorySize,
      environment: {
        ...baseEnvironment,
        FUNCTION_NAME: 'products',
      },
      tracing: this.environmentConfig.configuration.lambda.enableXRay ? lambda.Tracing.ACTIVE : lambda.Tracing.DISABLED,
    });

    const biddingFunction = new lambda.Function(this, 'BiddingFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/bidding'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(this.environmentConfig.configuration.lambda.timeout),
      memorySize: this.environmentConfig.configuration.lambda.memorySize,
      environment: {
        ...baseEnvironment,
        FUNCTION_NAME: 'bidding',
      },
      tracing: this.environmentConfig.configuration.lambda.enableXRay ? lambda.Tracing.ACTIVE : lambda.Tracing.DISABLED,
    });

    const chatFunction = new lambda.Function(this, 'ChatFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/chat'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(this.environmentConfig.configuration.lambda.timeout),
      memorySize: this.environmentConfig.configuration.lambda.memorySize,
      environment: {
        ...baseEnvironment,
        FUNCTION_NAME: 'chat',
      },
      tracing: this.environmentConfig.configuration.lambda.enableXRay ? lambda.Tracing.ACTIVE : lambda.Tracing.DISABLED,
    });

    const priceDiscoveryFunction = new lambda.Function(this, 'PriceDiscoveryFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/lambda/price-discovery'),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(this.environmentConfig.configuration.lambda.timeout),
      memorySize: this.environmentConfig.configuration.lambda.memorySize,
      environment: {
        ...baseEnvironment,
        FUNCTION_NAME: 'price-discovery',
      },
      tracing: this.environmentConfig.configuration.lambda.enableXRay ? lambda.Tracing.ACTIVE : lambda.Tracing.DISABLED,
    });

    // Grant secrets access to all Lambda functions
    [authFunction, translationFunction, productFunction, biddingFunction, chatFunction, priceDiscoveryFunction].forEach(func => {
      this.secretsManager.grantReadToLambda(func);
      this.environmentConfig.grantParameterReadAccess(func);
    });

    // Integrate Lambda functions with API Gateway
    const authIntegration = new apigateway.LambdaIntegration(authFunction);
    const translationIntegration = new apigateway.LambdaIntegration(translationFunction);
    const productIntegration = new apigateway.LambdaIntegration(productFunction);
    const biddingIntegration = new apigateway.LambdaIntegration(biddingFunction);
    const chatIntegration = new apigateway.LambdaIntegration(chatFunction);
    const priceDiscoveryIntegration = new apigateway.LambdaIntegration(priceDiscoveryFunction);

    // Add methods to API Gateway resources
    // Authentication endpoints
    this.api.root.resourceForPath('/v1/auth/login').addMethod('POST', authIntegration);
    this.api.root.resourceForPath('/v1/auth/register').addMethod('POST', authIntegration);
    this.api.root.resourceForPath('/v1/auth/verify').addMethod('POST', authIntegration);
    
    // Translation endpoints
    this.api.root.resourceForPath('/v1/translate/voice').addMethod('POST', translationIntegration);
    this.api.root.resourceForPath('/v1/translate/text').addMethod('POST', translationIntegration);
    this.api.root.resourceForPath('/v1/translate/batch').addMethod('POST', translationIntegration);
    
    // Product endpoints
    this.api.root.resourceForPath('/v1/products').addMethod('GET', productIntegration);
    this.api.root.resourceForPath('/v1/products').addMethod('POST', productIntegration);
    this.api.root.resourceForPath('/v1/products/search').addMethod('GET', productIntegration);
    this.api.root.resourceForPath('/v1/products/{productId}').addMethod('GET', productIntegration);
    this.api.root.resourceForPath('/v1/products/{productId}').addMethod('PUT', productIntegration);
    this.api.root.resourceForPath('/v1/products/{productId}').addMethod('DELETE', productIntegration);
    
    // Bidding endpoints
    this.api.root.resourceForPath('/v1/bids').addMethod('GET', biddingIntegration);
    this.api.root.resourceForPath('/v1/bids').addMethod('POST', biddingIntegration);
    this.api.root.resourceForPath('/v1/bids/{bidId}').addMethod('GET', biddingIntegration);
    this.api.root.resourceForPath('/v1/bids/{bidId}').addMethod('PUT', biddingIntegration);
    
    // Chat endpoints
    this.api.root.resourceForPath('/v1/chat').addMethod('GET', chatIntegration);
    this.api.root.resourceForPath('/v1/chat').addMethod('POST', chatIntegration);
    this.api.root.resourceForPath('/v1/chat/{chatId}/messages').addMethod('GET', chatIntegration);
    this.api.root.resourceForPath('/v1/chat/{chatId}/messages').addMethod('POST', chatIntegration);
    this.api.root.resourceForPath('/v1/chat/{chatId}/messages').addMethod('PUT', chatIntegration);
    
    // Price discovery endpoints
    this.api.root.resourceForPath('/v1/prices/query').addMethod('POST', priceDiscoveryIntegration);
    this.api.root.resourceForPath('/v1/prices/market-data').addMethod('GET', priceDiscoveryIntegration);
  }

  private createCloudFrontDistribution() {
    // Create CloudFront distribution for global content delivery
    new cloudfront.Distribution(this, 'CDNDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.mediaBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(this.api),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        },
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      geoRestriction: cloudfront.GeoRestriction.allowlist('IN'), // India only for MVP
    });
  }

  private createOutputs() {
    // Output important resource identifiers
    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: this.usersTable.tableName,
      description: 'Users DynamoDB Table Name',
    });

    new cdk.CfnOutput(this, 'ProductsTableName', {
      value: this.productsTable.tableName,
      description: 'Products DynamoDB Table Name',
    });

    new cdk.CfnOutput(this, 'BidsTableName', {
      value: this.bidsTable.tableName,
      description: 'Bids DynamoDB Table Name',
    });

    new cdk.CfnOutput(this, 'ConversationsTableName', {
      value: this.conversationsTable.tableName,
      description: 'Conversations DynamoDB Table Name',
    });

    new cdk.CfnOutput(this, 'PriceHistoryTableName', {
      value: this.priceHistoryTable.tableName,
      description: 'Price History DynamoDB Table Name',
    });

    new cdk.CfnOutput(this, 'TranslationCacheTableName', {
      value: this.translationCacheTable.tableName,
      description: 'Translation Cache DynamoDB Table Name',
    });

    new cdk.CfnOutput(this, 'UserSessionsTableName', {
      value: this.userSessionsTable.tableName,
      description: 'User Sessions DynamoDB Table Name',
    });

    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: this.mediaBucket.bucketName,
      description: 'Media S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'VoiceBucketName', {
      value: this.voiceBucket.bucketName,
      description: 'Voice S3 Bucket Name',
    });
  }
}