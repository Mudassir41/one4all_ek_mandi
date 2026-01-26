# Ek Bharath Ek Mandi - API Gateway Documentation

## Overview

This document describes the API Gateway setup and Lambda function integrations for the Ek Bharath Ek Mandi platform. The API provides comprehensive endpoints for authentication, translation, product management, bidding, chat, and price discovery services.

## Base URL

```
https://{api-id}.execute-api.{region}.amazonaws.com/prod/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

## API Endpoints

### 1. Authentication Service (`/auth`)

#### POST `/auth/register`
Register a new user (vendor, B2B buyer, or B2C buyer).

**Request Body:**
```json
{
  "phone": "+91-9876543210",
  "name": "राम कुमार",
  "userType": "vendor",
  "languages": ["hindi", "english"],
  "location": {
    "state": "uttar_pradesh",
    "district": "agra",
    "coordinates": [27.1767, 78.0081]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your phone number.",
  "userId": "uuid",
  "tempPassword": "temp123"
}
```

#### POST `/auth/login`
Login with phone and password, supports MFA.

**Request Body:**
```json
{
  "phone": "+91-9876543210",
  "password": "password123"
}
```

**Response (MFA Challenge):**
```json
{
  "success": true,
  "challengeName": "SMS_MFA",
  "session": "session-token",
  "message": "OTP sent to your phone"
}
```

**Response (MFA Completion):**
```json
{
  "phone": "+91-9876543210",
  "otp": "123456",
  "session": "session-token"
}
```

#### POST `/auth/verify`
Verify phone number with OTP.

**Request Body:**
```json
{
  "phone": "+91-9876543210",
  "code": "123456"
}
```

### 2. Translation Service (`/translate`)

#### POST `/translate/voice`
Translate voice messages between languages.

**Request Body:**
```json
{
  "audioData": "base64-encoded-audio",
  "sourceLang": "tamil",
  "targetLang": "hindi",
  "context": "trade"
}
```

**Response:**
```json
{
  "success": true,
  "sourceTranscript": "நல்ல தரமான தக்காளி",
  "targetTranscript": "अच्छी गुणवत्ता के टमाटर",
  "translatedAudio": "base64-encoded-audio",
  "confidence": 0.95,
  "jobId": "uuid"
}
```

#### POST `/translate/text`
Translate text between languages.

**Request Body:**
```json
{
  "text": "What is the price of tomatoes?",
  "sourceLang": "english",
  "targetLang": "hindi",
  "context": "trade"
}
```

#### POST `/translate/batch`
Translate multiple text items at once.

**Request Body:**
```json
{
  "items": ["tomatoes", "good quality", "fresh produce"],
  "sourceLang": "english",
  "targetLang": "hindi"
}
```

### 3. Product Service (`/products`)

#### POST `/products`
Create a new product listing (vendors only).

**Request Body:**
```json
{
  "title": {
    "hindi": "ताजे टमाटर",
    "english": "Fresh Tomatoes"
  },
  "description": {
    "hindi": "उच्च गुणवत्ता के ताजे टमाटर",
    "english": "High quality fresh tomatoes"
  },
  "category": "agriculture",
  "subcategory": "vegetables",
  "pricing": {
    "wholesale": {"min_quantity": 100, "price": 35},
    "retail": {"price": 45}
  },
  "location": {
    "state": "uttar_pradesh",
    "district": "agra",
    "coordinates": [27.1767, 78.0081]
  },
  "images": ["base64-image-1", "base64-image-2"],
  "quantity_available": 1000,
  "unit": "kg",
  "harvest_date": "2024-01-25",
  "expiry_date": "2024-02-01"
}
```

#### GET `/products/search`
Search for products with filters.

**Query Parameters:**
- `query`: Text search query
- `category`: Product category
- `state`: Location filter
- `priceRange`: Format "min,max"
- `buyerType`: "B2B" or "B2C"
- `limit`: Number of results (default: 20)

#### GET `/products/{productId}`
Get details of a specific product.

#### PUT `/products/{productId}`
Update product details (vendor only).

#### DELETE `/products/{productId}`
Delete/deactivate product (vendor only).

#### GET `/products`
Get vendor's own products (vendors only).

### 4. Bidding Service (`/bids`)

#### POST `/bids`
Place a bid or direct purchase request.

**Request Body:**
```json
{
  "productId": "product-uuid",
  "amount": 40,
  "quantity": 500,
  "buyerType": "B2B",
  "message": "Need good quality for export",
  "voiceMessage": "base64-encoded-audio",
  "deliveryLocation": {
    "state": "delhi",
    "district": "new_delhi",
    "address": "Azadpur Mandi"
  }
}
```

#### GET `/bids`
Get bids based on user role and filters.

**Query Parameters:**
- `productId`: Filter by product
- `status`: Filter by bid status
- `limit`: Number of results

#### GET `/bids/{bidId}`
Get details of a specific bid.

#### PUT `/bids/{bidId}`
Update bid status (vendor) or modify bid (buyer).

**Request Body:**
```json
{
  "status": "accepted",
  "vendorMessage": "Accepted. Ready for pickup tomorrow.",
  "counterOffer": {
    "amount": 38,
    "quantity": 500,
    "message": "Best price I can offer"
  }
}
```

### 5. Chat Service (`/chat`)

#### POST `/chat`
Create a new chat conversation.

**Request Body:**
```json
{
  "participantId": "user-uuid",
  "initialMessage": "Hello, interested in your tomatoes",
  "productId": "product-uuid"
}
```

#### GET `/chat`
Get user's chat conversations.

#### POST `/chat/{chatId}/messages`
Send a message in a chat.

**Request Body:**
```json
{
  "message": "What is the quality like?",
  "voiceMessage": "base64-encoded-audio",
  "sourceLang": "english",
  "targetLang": "hindi",
  "messageType": "text"
}
```

#### GET `/chat/{chatId}/messages`
Get messages from a chat conversation.

#### PUT `/chat/{chatId}/messages`
Mark messages as read.

### 6. Price Discovery Service (`/prices`)

#### POST `/prices/query`
Natural language price queries.

**Request Body:**
```json
{
  "query": "मुंबई में टमाटर की कीमत क्या है?",
  "language": "hindi",
  "location": {
    "state": "maharashtra",
    "district": "mumbai"
  }
}
```

**Response:**
```json
{
  "success": true,
  "query": {
    "original": "मुंबई में टमाटर की कीमत क्या है?",
    "parsed": {
      "product": "tomatoes",
      "location": {"state": "maharashtra"},
      "queryType": "current_price"
    }
  },
  "response": {
    "text": "मुंबई में टमाटर की वर्तमान कीमत ₹42 प्रति किलो है। बाजार में स्थिरता है।",
    "audio": null
  },
  "data": {
    "averagePrice": 42,
    "trend": "stable",
    "change": 0,
    "markets": [...]
  }
}
```

#### GET `/prices/market-data`
Get historical market data and analytics.

**Query Parameters:**
- `product`: Specific product name
- `category`: Product category
- `state`: State filter
- `dateRange`: Format "start,end"

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

## Rate Limiting

API Gateway implements rate limiting:
- **Burst Limit**: 1000 requests per second
- **Rate Limit**: 500 requests per second sustained
- **Quota**: 100,000 requests per day per API key

## CORS Configuration

CORS is enabled for all endpoints with the following configuration:
- **Allowed Origins**: `*` (configure specific domains in production)
- **Allowed Methods**: `GET, POST, PUT, DELETE, OPTIONS`
- **Allowed Headers**: `Content-Type, Authorization, X-Api-Key`

## Binary Media Types

The API supports binary media types for audio and image uploads:
- `audio/*`
- `image/*`

## WebSocket Support

Real-time features (chat, notifications) will be implemented using AWS API Gateway WebSocket API in future iterations.

## Monitoring and Logging

- **CloudWatch Logs**: All Lambda function logs
- **X-Ray Tracing**: Distributed tracing enabled
- **CloudWatch Metrics**: API Gateway and Lambda metrics
- **Custom Metrics**: Business metrics for translation quality, user engagement

## Security Features

1. **JWT Authentication**: Stateless token-based authentication
2. **IAM Roles**: Least privilege access for Lambda functions
3. **VPC**: Lambda functions can be deployed in VPC for enhanced security
4. **Encryption**: Data encrypted at rest and in transit
5. **Input Validation**: All inputs validated and sanitized

## Performance Optimizations

1. **Connection Pooling**: DynamoDB connections reused across invocations
2. **Caching**: Translation results cached in ElastiCache
3. **Compression**: Response compression enabled
4. **Cold Start Optimization**: Provisioned concurrency for critical functions

## Deployment

The API is deployed using AWS CDK with the following stages:
- **Development**: `dev` stage with relaxed security
- **Staging**: `staging` stage for testing
- **Production**: `prod` stage with full security and monitoring

## Usage Examples

### Complete User Flow Example

1. **Register User**:
```bash
curl -X POST https://api.example.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+91-9876543210","name":"राम कुमार","userType":"vendor",...}'
```

2. **Login**:
```bash
curl -X POST https://api.example.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+91-9876543210","password":"password123"}'
```

3. **Create Product**:
```bash
curl -X POST https://api.example.com/v1/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":{"hindi":"ताजे टमाटर"},...}'
```

4. **Search Products**:
```bash
curl "https://api.example.com/v1/products/search?query=tomatoes&state=uttar_pradesh"
```

5. **Place Bid**:
```bash
curl -X POST https://api.example.com/v1/bids \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"productId":"uuid","amount":40,"quantity":500,...}'
```

This API Gateway setup provides a comprehensive, scalable, and secure foundation for the Ek Bharath Ek Mandi platform, supporting all the core features required for the voice-first cross-state trading platform.