# DynamoDB Data Access Patterns for Ek Bharath Ek Mandi

## Overview

This document outlines the data access patterns for the Ek Bharath Ek Mandi platform's DynamoDB tables. The design supports efficient queries for a voice-first, multilingual trading platform connecting vendors and buyers across India.

## Table Design Philosophy

### Single-Table vs Multi-Table Approach
We use a **multi-table approach** for this platform because:
- Different entities have distinct access patterns and scaling requirements
- Voice data has different retention policies (30-day TTL for privacy)
- Translation cache needs aggressive TTL for performance
- Price history requires time-series optimizations

### Key Design Principles
1. **Voice-First Optimization**: Fast access to conversation data and translation cache
2. **Multilingual Support**: Efficient cross-language search and translation
3. **Real-Time Requirements**: Support for live bidding and chat
4. **Privacy Compliance**: Automatic data cleanup with TTL
5. **Scalability**: GSIs designed for high-volume queries

## Table Schemas and Access Patterns

### 1. Users Table (`ek-bharath-users`)

#### Schema
```
PK: USER#{userId}
SK: PROFILE | SETTINGS | VERIFICATION
```

#### Attributes
- `user_type`: "vendor" | "b2b_buyer" | "b2c_buyer"
- `name`: User's name in their preferred language
- `phone`: Phone number (for authentication)
- `languages`: Array of supported languages
- `location`: { state, district, coordinates }
- `verification_status`: "pending" | "verified" | "rejected"
- `created_at`: ISO timestamp

#### Access Patterns

| Pattern | GSI | Query |
|---------|-----|-------|
| Login by phone | PhoneIndex | PK = phone |
| Find vendors by location | LocationIndex | PK = state, SK = district |
| List users by type | UserTypeIndex | PK = user_type |
| Get user profile | Main Table | PK = USER#{userId}, SK = PROFILE |

#### Example Queries
```typescript
// Find all vendors in Karnataka
const vendors = await dynamodb.query({
  TableName: 'ek-bharath-users',
  IndexName: 'UserTypeIndex',
  KeyConditionExpression: 'user_type = :type',
  ExpressionAttributeValues: { ':type': 'vendor' }
});

// Find vendors in specific location
const localVendors = await dynamodb.query({
  TableName: 'ek-bharath-users',
  IndexName: 'LocationIndex',
  KeyConditionExpression: 'state = :state AND district = :district',
  ExpressionAttributeValues: { 
    ':state': 'karnataka', 
    ':district': 'bangalore' 
  }
});
```

### 2. Products Table (`ek-bharath-products`)

#### Schema
```
PK: PRODUCT#{productId}
SK: DETAILS | PRICING | IMAGES
```

#### Attributes
- `vendor_id`: Reference to vendor user
- `title`: Multilingual object { hindi: "...", english: "...", tamil: "..." }
- `category`: "agriculture" | "handicrafts" | "fisheries" | "sericulture"
- `subcategory`: Specific product type
- `pricing`: { wholesale: {min_qty, price}, retail: {price} }
- `location`: { state, coordinates }
- `status`: "active" | "sold" | "expired"
- `images`: Array of S3 URLs
- `price_sort_key`: "price#created_at" for range queries

#### Access Patterns

| Pattern | GSI | Query |
|---------|-----|-------|
| Search by category | CategoryIndex | PK = category |
| Find products by location | LocationIndex | PK = state |
| Vendor's products | VendorIndex | PK = vendor_id |
| Active products | StatusIndex | PK = status |
| Price range search | PriceIndex | PK = category, SK begins_with price |

#### Example Queries
```typescript
// Find tomatoes in price range ₹30-50
const products = await dynamodb.query({
  TableName: 'ek-bharath-products',
  IndexName: 'PriceIndex',
  KeyConditionExpression: 'category = :cat AND price_sort_key BETWEEN :min AND :max',
  ExpressionAttributeValues: { 
    ':cat': 'agriculture',
    ':min': '30#',
    ':max': '50#'
  }
});

// Get vendor's active products
const vendorProducts = await dynamodb.query({
  TableName: 'ek-bharath-products',
  IndexName: 'VendorIndex',
  KeyConditionExpression: 'vendor_id = :vendorId',
  FilterExpression: 'status = :status',
  ExpressionAttributeValues: { 
    ':vendorId': 'USER#12345',
    ':status': 'active'
  }
});
```

### 3. Bids Table (`ek-bharath-bids`)

#### Schema
```
PK: PRODUCT#{productId}
SK: BID#{bidId} | PURCHASE#{purchaseId}
```

#### Attributes
- `buyer_id`: Reference to buyer user
- `vendor_id`: Reference to vendor (for GSI)
- `buyer_type`: "B2B" | "B2C"
- `amount`: Bid amount
- `quantity`: Requested quantity
- `status`: "pending" | "accepted" | "rejected" | "completed"
- `message`: { original, translated }
- `voice_message`: S3 URL to audio file

#### Access Patterns

| Pattern | GSI | Query |
|---------|-----|-------|
| Product bids | Main Table | PK = PRODUCT#{productId} |
| Buyer's bids | BuyerIndex | PK = buyer_id |
| Pending bids | StatusIndex | PK = status |
| B2B vs B2C analytics | BuyerTypeIndex | PK = buyer_type |
| Vendor's incoming bids | VendorBidsIndex | PK = vendor_id |

#### Example Queries
```typescript
// Get all bids for a product (vendor dashboard)
const productBids = await dynamodb.query({
  TableName: 'ek-bharath-bids',
  KeyConditionExpression: 'PK = :productId',
  ExpressionAttributeValues: { ':productId': 'PRODUCT#67890' }
});

// Get buyer's pending bids
const pendingBids = await dynamodb.query({
  TableName: 'ek-bharath-bids',
  IndexName: 'BuyerIndex',
  KeyConditionExpression: 'buyer_id = :buyerId',
  FilterExpression: 'status = :status',
  ExpressionAttributeValues: { 
    ':buyerId': 'USER#54321',
    ':status': 'pending'
  }
});
```

### 4. Conversations Table (`ek-bharath-conversations`)

#### Schema
```
PK: CHAT#{vendorId}#{buyerId}
SK: MSG#{timestamp} | METADATA
```

#### Attributes
- `sender_id`: Message sender
- `recipient_id`: Message recipient
- `message`: { original_text, original_audio, translated_text, translated_audio }
- `source_lang`: Original language
- `target_lang`: Translated language
- `read_status`: Boolean
- `ttl`: Auto-deletion timestamp (30 days)

#### Access Patterns

| Pattern | GSI | Query |
|---------|-----|-------|
| Chat messages | Main Table | PK = CHAT#{vendorId}#{buyerId} |
| User's chats | UserIndex | PK = sender_id |
| Received chats | RecipientIndex | PK = recipient_id |
| Unread messages | UnreadIndex | PK = recipient_id, SK = read_status |
| Translation analytics | LanguageIndex | PK = source_lang, SK = target_lang |

#### Example Queries
```typescript
// Get chat conversation
const messages = await dynamodb.query({
  TableName: 'ek-bharath-conversations',
  KeyConditionExpression: 'PK = :chatId AND begins_with(SK, :msgPrefix)',
  ExpressionAttributeValues: { 
    ':chatId': 'CHAT#vendor123#buyer456',
    ':msgPrefix': 'MSG#'
  },
  ScanIndexForward: false, // Latest messages first
  Limit: 50
});

// Get unread message count
const unreadCount = await dynamodb.query({
  TableName: 'ek-bharath-conversations',
  IndexName: 'UnreadIndex',
  KeyConditionExpression: 'recipient_id = :userId AND read_status = :unread',
  ExpressionAttributeValues: { 
    ':userId': 'USER#12345',
    ':unread': 'false'
  },
  Select: 'COUNT'
});
```

### 5. Price History Table (`ek-bharath-price-history`)

#### Schema
```
PK: MARKET#{state}#{product}
SK: DATE#{date}
```

#### Attributes
- `product_category`: Product category
- `state`: Market state
- `price`: Market price
- `date`: Price date
- `source`: "enam" | "apmc" | "user_reported"
- `market_name`: Specific market name

#### Access Patterns

| Pattern | GSI | Query |
|---------|-----|-------|
| Product price history | Main Table | PK = MARKET#{state}#{product} |
| Category price trends | ProductIndex | PK = product_category |
| State market analysis | StateIndex | PK = state |

#### Example Queries
```typescript
// Get tomato prices in Karnataka for last 7 days
const priceHistory = await dynamodb.query({
  TableName: 'ek-bharath-price-history',
  KeyConditionExpression: 'PK = :market AND SK BETWEEN :startDate AND :endDate',
  ExpressionAttributeValues: { 
    ':market': 'MARKET#karnataka#tomato',
    ':startDate': 'DATE#2024-01-19',
    ':endDate': 'DATE#2024-01-26'
  }
});
```

### 6. Translation Cache Table (`ek-bharath-translation-cache`)

#### Schema
```
PK: TRANSLATION#{hash}
SK: {sourceLang}#{targetLang}
```

#### Attributes
- `source_text`: Original text
- `translated_text`: Translated text
- `source_lang`: Source language
- `target_lang`: Target language
- `confidence`: Translation confidence score
- `ttl`: Cache expiration (24 hours)

#### Access Patterns

| Pattern | GSI | Query |
|---------|-----|-------|
| Cached translation | Main Table | PK = TRANSLATION#{hash}, SK = {lang1}#{lang2} |
| Language pair analytics | LanguagePairIndex | PK = source_lang, SK = target_lang |

### 7. User Sessions Table (`ek-bharath-user-sessions`)

#### Schema
```
PK: SESSION#{sessionId}
SK: USER#{userId}
```

#### Attributes
- `user_id`: User reference
- `last_activity`: Last activity timestamp
- `device_info`: Device information
- `location`: Current location
- `ttl`: Session expiration

#### Access Patterns

| Pattern | GSI | Query |
|---------|-----|-------|
| Session lookup | Main Table | PK = SESSION#{sessionId} |
| User active sessions | UserIndex | PK = user_id |

## Performance Optimizations

### 1. Projection Types
- **ALL**: For frequently accessed data (Users, Products, Bids)
- **KEYS_ONLY**: For analytics queries (Language analytics)
- **INCLUDE**: For specific attribute subsets

### 2. Caching Strategy
- **Translation Cache**: 24-hour TTL for common translations
- **ElastiCache**: Session data and search results
- **Application Cache**: User preferences and settings

### 3. Batch Operations
- **BatchGetItem**: For loading multiple products in search results
- **BatchWriteItem**: For bulk price data imports
- **Parallel Queries**: For cross-table data aggregation

### 4. Stream Processing
- **DynamoDB Streams**: Real-time updates for search indices
- **Lambda Triggers**: Notification processing and analytics
- **OpenSearch Sync**: Product search index updates

## Query Patterns for Key Features

### Voice Translation Workflow
1. Check translation cache for common phrases
2. If not cached, call AI translation services
3. Store result in cache with TTL
4. Save conversation with both original and translated text

### Product Search Workflow
1. Query Products table by category/location
2. Apply price range filters using PriceIndex
3. Batch load vendor information from Users table
4. Cache results in ElastiCache for repeated searches

### Real-time Bidding Workflow
1. Insert bid into Bids table
2. DynamoDB Stream triggers notification Lambda
3. Query vendor's active sessions from UserSessions table
4. Send real-time notification via WebSocket

### Price Discovery Workflow
1. Query PriceHistory table for recent prices
2. Aggregate data across multiple markets
3. Use AI to generate natural language response
4. Cache response for similar queries

## Monitoring and Analytics

### Key Metrics to Track
- **Read/Write Capacity**: Monitor for throttling
- **GSI Performance**: Track query latency
- **Cache Hit Rates**: Translation and search caches
- **Stream Processing**: Real-time update delays

### Cost Optimization
- **On-Demand Billing**: Handles variable traffic patterns
- **TTL Cleanup**: Automatic data deletion for privacy
- **Projection Optimization**: Minimize GSI storage costs
- **Batch Operations**: Reduce request costs

## Security Considerations

### Data Protection
- **Encryption at Rest**: AWS managed keys
- **Encryption in Transit**: TLS for all connections
- **Access Control**: IAM roles with least privilege
- **Audit Logging**: CloudTrail for all table access

### Privacy Compliance
- **Voice Data TTL**: 30-day automatic deletion
- **User Consent**: Granular privacy controls
- **Data Anonymization**: Remove PII from analytics
- **Right to Deletion**: Support for user data removal

This data model supports the platform's core requirements while maintaining performance, scalability, and privacy compliance for India's diverse trading ecosystem.