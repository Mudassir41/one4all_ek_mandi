# S3 Bucket Configuration for Ek Bharath Ek Mandi

## Overview

This document outlines the S3 bucket configuration for the Ek Bharath Ek Mandi platform, designed to handle media storage with appropriate security, performance, and privacy compliance measures.

## Bucket Architecture

### 1. Media Bucket (`ek-bharath-media-{account}-{region}`)

**Purpose**: Stores product images, thumbnails, and general media files

**Key Features**:
- **Encryption**: KMS-managed encryption for enhanced security
- **Versioning**: Enabled for data protection and recovery
- **Public Access**: Blocked for security (access via CloudFront only)
- **CORS**: Configured for web application uploads
- **Lifecycle Management**: Automatic transition to cost-effective storage classes

**Storage Classes Transition**:
- Day 0-30: Standard storage
- Day 30-90: Infrequent Access (IA)
- Day 90+: Glacier for long-term archival

**Security Measures**:
- SSL/TLS enforcement for all connections
- Bucket policy denying insecure connections
- CloudFront-only access for public content
- Inventory tracking for compliance

### 2. Voice Bucket (`ek-bharath-voice-{account}-{region}`)

**Purpose**: Stores voice recordings, audio messages, and transcription files

**Key Features**:
- **Privacy Compliance**: Automatic deletion after 30 days
- **Enhanced Encryption**: KMS-managed encryption
- **Strict Access Control**: Service-only access (Lambda, Transcribe, Polly)
- **Fast Cleanup**: Aggressive cleanup of incomplete uploads and old versions

**Privacy Features**:
- Automatic expiration of voice files after 30 days
- No public access allowed
- Encrypted at rest and in transit
- Audit logging for compliance

## CORS Configuration

### Media Bucket CORS
```json
{
  "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
  "allowedOrigins": [
    "https://localhost:3000",
    "https://*.ek-bharath.com",
    "https://*.amazonaws.com"
  ],
  "allowedHeaders": [
    "Content-Type",
    "Content-Length",
    "Authorization",
    "X-Amz-Date",
    "X-Api-Key",
    "X-Amz-Security-Token",
    "x-amz-content-sha256",
    "x-amz-user-agent"
  ],
  "exposedHeaders": ["ETag"],
  "maxAge": 3600
}
```

### Voice Bucket CORS
```json
{
  "allowedMethods": ["GET", "POST", "PUT"],
  "allowedOrigins": [
    "https://localhost:3000",
    "https://*.ek-bharath.com",
    "https://*.amazonaws.com"
  ],
  "allowedHeaders": [
    "Content-Type",
    "Content-Length",
    "Authorization",
    "X-Amz-Date",
    "X-Api-Key",
    "X-Amz-Security-Token",
    "x-amz-content-sha256",
    "x-amz-user-agent"
  ],
  "exposedHeaders": ["ETag"],
  "maxAge": 1800
}
```

## Lifecycle Rules

### Media Bucket Lifecycle
1. **Incomplete Multipart Upload Cleanup**: Delete after 1 day
2. **Storage Class Transitions**:
   - Standard → IA: 30 days
   - IA → Glacier: 90 days
3. **Version Management**: Delete old versions after 30 days

### Voice Bucket Lifecycle
1. **Privacy Compliance**: Delete all files after 30 days
2. **Incomplete Upload Cleanup**: Delete after 1 hour
3. **Version Cleanup**: Delete old versions after 1 day

## Security Policies

### Bucket Policies

#### Media Bucket Policy
- **Deny Insecure Connections**: All requests must use HTTPS
- **CloudFront Access**: Allow CloudFront service to read objects
- **Authenticated Access**: Require valid AWS credentials for uploads

#### Voice Bucket Policy
- **Deny Insecure Connections**: All requests must use HTTPS
- **Service-Only Access**: Only AWS services (Lambda, Transcribe, Polly) can access
- **No Public Access**: Completely block public access

### IAM Permissions

#### Lambda Function Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::ek-bharath-media-*/*",
        "arn:aws:s3:::ek-bharath-voice-*/*"
      ]
    }
  ]
}
```

## Event Notifications

### Media Bucket Events
- **Trigger**: Object creation in `uploads/` prefix
- **Action**: Lambda function for image processing and search indexing
- **Processing**:
  - Image optimization (resize, format conversion)
  - Thumbnail generation
  - Search index updates
  - Metadata extraction

### Voice Bucket Events
- **Trigger**: Object creation (any audio file)
- **Action**: Lambda function for voice processing
- **Processing**:
  - Transcription initiation
  - Audio format validation
  - Conversation record updates

## File Organization

### Media Bucket Structure
```
ek-bharath-media-{account}-{region}/
├── uploads/
│   ├── products/
│   │   ├── {productId}/
│   │   │   ├── original/
│   │   │   ├── thumbnails/
│   │   │   └── optimized/
│   └── profiles/
│       └── {userId}/
├── processed/
└── temp/
```

### Voice Bucket Structure
```
ek-bharath-voice-{account}-{region}/
├── recordings/
│   ├── {conversationId}/
│   │   ├── original/
│   │   ├── processed/
│   │   └── transcripts/
├── translations/
└── temp/
```

## Performance Optimization

### Upload Performance
- **Multipart Upload**: Enabled for files > 100MB
- **Transfer Acceleration**: Can be enabled for global users
- **CloudFront Integration**: Fast global content delivery

### Access Patterns
- **Frequent Access**: Recent product images (Standard storage)
- **Infrequent Access**: Older product images (IA storage)
- **Archive**: Historical data (Glacier storage)
- **Temporary**: Voice recordings (30-day expiration)

## Monitoring and Compliance

### CloudWatch Metrics
- **Storage Usage**: Monitor bucket size and object count
- **Request Metrics**: Track GET/PUT/DELETE operations
- **Error Rates**: Monitor 4xx/5xx errors
- **Data Transfer**: Track ingress/egress bandwidth

### Compliance Features
- **Inventory Reports**: Weekly inventory of all objects
- **Access Logging**: Log all bucket access for audit
- **Encryption**: All data encrypted at rest and in transit
- **Data Retention**: Automatic deletion for privacy compliance

### Cost Optimization
- **Lifecycle Policies**: Automatic transition to cheaper storage classes
- **Incomplete Upload Cleanup**: Prevent storage of incomplete uploads
- **Version Management**: Limit retention of old versions
- **Intelligent Tiering**: Can be enabled for automatic cost optimization

## Disaster Recovery

### Backup Strategy
- **Cross-Region Replication**: Can be enabled for critical data
- **Versioning**: Protects against accidental deletion/modification
- **Point-in-Time Recovery**: Available through versioning

### Recovery Procedures
1. **Accidental Deletion**: Restore from version history
2. **Corruption**: Restore from previous version
3. **Regional Failure**: Restore from cross-region replica (if enabled)

## Development vs Production

### Development Environment
- **Bucket Names**: Include environment suffix
- **CORS**: Allow localhost origins
- **Lifecycle**: Shorter retention periods
- **Monitoring**: Basic CloudWatch metrics

### Production Environment
- **Bucket Names**: Production naming convention
- **CORS**: Restrict to production domains
- **Lifecycle**: Full retention and archival policies
- **Monitoring**: Comprehensive monitoring and alerting
- **Backup**: Cross-region replication enabled

## Usage Guidelines

### File Upload Best Practices
1. **Image Files**: Use WebP format when possible, fallback to JPEG
2. **Voice Files**: Use compressed formats (MP3, AAC)
3. **File Naming**: Use UUID-based naming to avoid conflicts
4. **Metadata**: Include relevant metadata for search and organization

### Security Best Practices
1. **Pre-signed URLs**: Use for secure uploads from client
2. **Content Validation**: Validate file types and sizes
3. **Virus Scanning**: Implement virus scanning for uploads
4. **Access Logging**: Monitor and audit all access

### Performance Best Practices
1. **CDN Usage**: Serve static content through CloudFront
2. **Compression**: Enable compression for text-based files
3. **Caching**: Implement appropriate cache headers
4. **Batch Operations**: Use batch operations for bulk processing

This configuration ensures secure, performant, and compliant media storage for the Ek Bharath Ek Mandi platform while supporting the voice-first trading experience with appropriate privacy controls.