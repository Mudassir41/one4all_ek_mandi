# Ek Bharath Ek Mandi - Design Document

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Web Application                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  Vendor Portal  │ │  B2B Portal     │ │  B2C Portal     ││
│  │  (Voice-First)  │ │  (Search-Focus) │ │  (Simple UI)    ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│           (Authentication, Rate Limiting, Routing)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Microservices Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │Translation  │ │Product      │ │Bidding      │ │Price    ││
│  │Service      │ │Service      │ │Service      │ │Discovery││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │User         │ │Notification │ │Chat         │ │Analytics││
│  │Service      │ │Service      │ │Service      │ │Service  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │DynamoDB     │ │S3 Storage   │ │ElastiCache  │ │OpenSearch││
│  │(Core Data)  │ │(Media/Voice)│ │(Sessions)   │ │(Search) ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI/ML Services                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│  │Amazon       │ │Amazon       │ │Amazon       │ │Bedrock  ││
│  │Transcribe   │ │Translate    │ │Polly        │ │(Claude) ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Frontend Design

### User Interface Architecture

#### 1. Vendor Portal (Voice-First Design)
```
┌─────────────────────────────────────────────────────────────┐
│                    Vendor Dashboard                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Voice Command Center                       ││
│  │  🎤 "मेरे टमाटर की कीमत क्या है मुंबई में?"                ││
│  │  🔊 "Mumbai mein tomato ₹40/kg mil raha hai"           ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │   My Products   │ │  Active Bids    │ │  Messages       ││
│  │   📸 Add Photo  │ │  💰 ₹45/kg     │ │  🔔 3 New       ││
│  │   🎤 Describe   │ │  📈 Trending ↑  │ │  🎤 Voice Reply ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Large voice input button prominently displayed
- Visual product grid with photo-first layout
- Real-time bid notifications with audio alerts
- Simple navigation with icons and minimal text
- Offline-first photo capture with sync indicators

#### 2. B2B Buyer Portal (Search-Focused Design)
```
┌─────────────────────────────────────────────────────────────┐
│                    B2B Buyer Dashboard                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🔍 Search: "tomatoes" | 📍 Location | 💰 Price Range  ││
│  │  🎤 Voice Search: "दिल्ली में टमाटर चाहिए"              ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  Search Results │ │  My Bids        │ │  Suppliers      ││
│  │  📊 Compare     │ │  ⏰ Pending: 5  │ │  ⭐ Favorites   ││
│  │  🎤 Quick Bid   │ │  ✅ Won: 2      │ │  📞 Contact     ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Advanced search with filters and voice input
- Comparative analysis tools
- Bid management dashboard
- Supplier relationship management
- Price trend analytics

#### 3. B2C Consumer Portal (Simple & Tourist-Friendly)
```
┌─────────────────────────────────────────────────────────────┐
│                   Consumer Marketplace                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  🌍 Language: English | 📍 Kerala | 🛒 Cart (0)       ││
│  │  🎤 "I want to buy spices" → "मुझे मसाले चाहिए"        ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐│
│  │  Local Products │ │  Chat with      │ │  My Orders      ││
│  │  🌶️ Spices      │ │  Vendor         │ │  📦 Shipping    ││
│  │  🎨 Handicrafts │ │  🎤 Voice Chat  │ │  ⭐ Reviews     ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Tourist-friendly interface with clear language selection
- Category-based browsing with visual icons
- Real-time voice chat with vendors
- Simple checkout process
- Cultural context and authenticity indicators

### Responsive Design Strategy

#### Mobile-First Approach
```css
/* Base Mobile Design (320px+) */
.voice-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #FF6B35, #F7931E);
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.4);
}

/* Tablet Design (768px+) */
@media (min-width: 768px) {
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
}

/* Desktop Design (1024px+) */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

## Backend Services Architecture

### 1. Translation Service
```typescript
interface TranslationService {
  // Real-time voice translation
  translateVoice(audioBlob: Blob, sourceLang: string, targetLang: string): Promise<{
    translatedAudio: Blob;
    sourceTranscript: string;
    targetTranscript: string;
    confidence: number;
  }>;
  
  // Text translation with context
  translateText(text: string, context: 'trade' | 'casual' | 'formal'): Promise<string>;
  
  // Batch translation for search
  translateBatch(items: string[], targetLang: string): Promise<string[]>;
}
```

**Implementation Stack:**
- **Primary**: Amazon Transcribe → Amazon Bedrock (Claude) → Amazon Polly
- **Fallback**: Google Cloud Translation API
- **Caching**: ElastiCache for common translations
- **Context**: Trade-specific terminology database

### 2. Product Service
```typescript
interface ProductService {
  // Create product listing
  createProduct(product: {
    title: string;
    description: string;
    images: File[];
    pricing: {
      wholesale: { min_quantity: number; price: number };
      retail: { price: number };
    };
    location: GeoLocation;
    language: string;
  }): Promise<Product>;
  
  // Search products with multilingual support
  searchProducts(query: {
    text?: string;
    voice?: Blob;
    location?: GeoLocation;
    priceRange?: [number, number];
    category?: string;
    buyerType?: 'B2B' | 'B2C';
  }): Promise<Product[]>;
}
```

### 3. Bidding & Transaction Service
```typescript
interface BiddingService {
  // Place bid (B2B) or direct purchase (B2C)
  placeBid(productId: string, bid: {
    amount: number;
    quantity: number;
    buyerType: 'B2B' | 'B2C';
    message?: string;
    voiceMessage?: Blob;
  }): Promise<Bid>;
  
  // Real-time bid updates
  subscribeToBids(productId: string): EventStream<BidUpdate>;
}
```

### 4. Chat & Communication Service
```typescript
interface ChatService {
  // Send voice message with translation
  sendVoiceMessage(chatId: string, message: {
    audio: Blob;
    sourceLang: string;
    targetLang: string;
  }): Promise<{
    messageId: string;
    translatedAudio: Blob;
    transcript: { source: string; target: string };
  }>;
  
  // Real-time chat updates
  subscribeToChat(chatId: string): EventStream<ChatMessage>;
}
```

## Database Design

### DynamoDB Table Structure

#### 1. Users Table
```json
{
  "PK": "USER#12345",
  "SK": "PROFILE",
  "user_type": "vendor",
  "name": "राम कुमार",
  "phone": "+91-9876543210",
  "languages": ["hindi", "english"],
  "location": {
    "state": "uttar_pradesh",
    "district": "agra",
    "coordinates": [27.1767, 78.0081]
  },
  "verification_status": "verified",
  "created_at": "2024-01-26T10:00:00Z"
}
```

#### 2. Products Table
```json
{
  "PK": "PRODUCT#67890",
  "SK": "DETAILS",
  "vendor_id": "USER#12345",
  "title": {
    "hindi": "ताजे टमाटर",
    "english": "Fresh Tomatoes",
    "tamil": "புதிய தக்காளி"
  },
  "category": "agriculture",
  "subcategory": "vegetables",
  "pricing": {
    "wholesale": {"min_qty": 100, "price": 35},
    "retail": {"price": 45}
  },
  "images": ["s3://bucket/product-images/67890-1.jpg"],
  "location": {
    "state": "uttar_pradesh",
    "coordinates": [27.1767, 78.0081]
  },
  "status": "active",
  "created_at": "2024-01-26T10:00:00Z"
}
```

#### 3. Bids Table
```json
{
  "PK": "PRODUCT#67890",
  "SK": "BID#98765",
  "buyer_id": "USER#54321",
  "buyer_type": "B2B",
  "amount": 40,
  "quantity": 500,
  "message": {
    "original": "Good quality chahiye",
    "translated": "अच्छी गुणवत्ता चाहिए"
  },
  "voice_message": "s3://bucket/voice/bid-98765.mp3",
  "status": "pending",
  "created_at": "2024-01-26T11:00:00Z"
}
```

#### 4. Conversations Table
```json
{
  "PK": "CHAT#vendor-12345-buyer-54321",
  "SK": "MSG#2024-01-26T11:30:00Z",
  "sender_id": "USER#54321",
  "message": {
    "original_text": "What is the quality of tomatoes?",
    "original_audio": "s3://bucket/voice/msg-1.mp3",
    "translated_text": "टमाटर की गुणवत्ता कैसी है?",
    "translated_audio": "s3://bucket/voice/msg-1-translated.mp3"
  },
  "source_lang": "english",
  "target_lang": "hindi",
  "read_status": false
}
```

## AI/ML Integration

### 1. Voice Processing Pipeline
```
Audio Input → Noise Reduction → Speech-to-Text → Context Analysis → Translation → Text-to-Speech → Audio Output
     ↓              ↓               ↓              ↓              ↓              ↓              ↓
  WebRTC      Audio Processing   Transcribe    Bedrock      Translate      Polly       WebRTC
```

### 2. Price Discovery AI
```typescript
interface PriceDiscoveryAI {
  // Natural language price queries
  queryPrice(query: {
    voice?: Blob;
    text?: string;
    language: string;
    location?: GeoLocation;
  }): Promise<{
    response: {
      text: string;
      audio: Blob;
    };
    data: {
      current_price: number;
      trend: 'up' | 'down' | 'stable';
      markets: Array<{
        name: string;
        price: number;
        date: string;
      }>;
    };
  }>;
}
```

**Implementation:**
- **RAG System**: Bedrock Knowledge Base with APMC price data
- **Context Understanding**: Claude 3.5 Sonnet for query interpretation
- **Response Generation**: Natural language responses in user's language

### 3. Search & Recommendation Engine
```typescript
interface SearchEngine {
  // Multilingual semantic search
  search(query: {
    text?: string;
    voice?: Blob;
    filters: SearchFilters;
    user_context: UserContext;
  }): Promise<{
    products: Product[];
    suggestions: string[];
    related_queries: string[];
  }>;
}
```

**Features:**
- Cross-language semantic search using embeddings
- User behavior-based recommendations
- Location-aware results
- Cultural preference learning

## Security & Privacy Design

### 1. Data Protection
```typescript
interface SecurityLayer {
  // Voice data encryption
  encryptVoiceData(audio: Blob, userId: string): Promise<EncryptedBlob>;
  
  // PII anonymization
  anonymizeUserData(data: UserData): AnonymizedData;
  
  // Consent management
  manageConsent(userId: string, permissions: Permission[]): Promise<void>;
}
```

### 2. Authentication & Authorization
- **Multi-factor Authentication**: Phone OTP + Voice verification
- **Role-based Access**: Vendor, B2B Buyer, B2C Buyer permissions
- **Session Management**: JWT tokens with refresh mechanism
- **API Security**: Rate limiting, request validation, CORS

### 3. Privacy Controls
- **Data Retention**: Automatic deletion of voice recordings after 30 days
- **User Control**: Granular privacy settings for profile visibility
- **Compliance**: GDPR-like controls for Indian users
- **Audit Logging**: All data access and modifications logged

## Performance Optimization

### 1. Caching Strategy
```typescript
interface CacheLayer {
  // Translation cache
  translations: Map<string, {
    text: string;
    audio?: Blob;
    expiry: Date;
  }>;
  
  // Product search cache
  searchResults: Map<string, {
    results: Product[];
    expiry: Date;
  }>;
  
  // Price data cache
  priceData: Map<string, {
    prices: PriceInfo[];
    expiry: Date;
  }>;
}
```

### 2. CDN & Asset Optimization
- **Global CDN**: CloudFront for static assets and audio files
- **Image Optimization**: WebP format with fallbacks
- **Audio Compression**: Optimized for mobile networks
- **Progressive Loading**: Critical content first

### 3. Database Optimization
- **Read Replicas**: For search and analytics queries
- **Indexing Strategy**: GSI for location-based and category searches
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Batch operations where possible

## Monitoring & Analytics

### 1. Real-time Monitoring
```typescript
interface MonitoringSystem {
  // Performance metrics
  trackLatency(operation: string, duration: number): void;
  
  // Translation quality
  trackTranslationAccuracy(sourceText: string, feedback: number): void;
  
  // User engagement
  trackUserAction(userId: string, action: string, context: object): void;
}
```

### 2. Business Intelligence
- **User Behavior Analytics**: Conversion funnels, engagement patterns
- **Market Insights**: Price trends, demand patterns
- **Translation Quality**: Accuracy metrics, user feedback
- **Performance Dashboards**: Real-time system health

## Deployment Architecture

### 1. AWS Infrastructure
```yaml
# Infrastructure as Code (CDK/Terraform)
Resources:
  - API Gateway: Multi-region deployment
  - Lambda Functions: Auto-scaling serverless compute
  - DynamoDB: Global tables for multi-region
  - S3: Cross-region replication for media
  - CloudFront: Global CDN
  - ElastiCache: Redis clusters for caching
  - OpenSearch: Search and analytics
```

### 2. CI/CD Pipeline
```yaml
# GitHub Actions Workflow
stages:
  - Code Quality: ESLint, Prettier, TypeScript checks
  - Testing: Unit tests, integration tests, E2E tests
  - Security: SAST, dependency scanning
  - Build: Webpack optimization, asset bundling
  - Deploy: Blue-green deployment to staging/production
  - Monitor: Health checks, rollback triggers
```

### 3. Scalability Design
- **Auto-scaling**: Based on CPU, memory, and request metrics
- **Load Balancing**: Application Load Balancer with health checks
- **Database Scaling**: DynamoDB on-demand scaling
- **CDN Scaling**: CloudFront automatic scaling
- **Monitoring**: CloudWatch alarms and auto-remediation

## Testing Strategy

### 1. Automated Testing
```typescript
// Voice translation testing
describe('Voice Translation', () => {
  test('should translate Tamil to Hindi with >90% accuracy', async () => {
    const tamilAudio = await loadTestAudio('tamil-sample.mp3');
    const result = await translationService.translateVoice(
      tamilAudio, 'tamil', 'hindi'
    );
    expect(result.confidence).toBeGreaterThan(0.9);
  });
});

// Cross-language search testing
describe('Multilingual Search', () => {
  test('should find Tamil products when searching in Hindi', async () => {
    const results = await productService.searchProducts({
      text: 'टमाटर',
      language: 'hindi'
    });
    expect(results).toContainProductsInLanguage('tamil');
  });
});
```

### 2. User Acceptance Testing
- **Regional Testing**: Native speakers testing in their languages
- **Device Testing**: Low-end smartphones, various network conditions
- **Accessibility Testing**: Screen readers, voice navigation
- **Cultural Testing**: Regional preferences and customs

### 3. Performance Testing
- **Load Testing**: 100K concurrent users simulation
- **Stress Testing**: Peak traffic scenarios
- **Latency Testing**: Voice translation under 2s requirement
- **Network Testing**: 2G/3G connectivity scenarios

## Correctness Properties

### Property 1: Translation Consistency
**Validates: Requirements AC-1**
```typescript
property('translation consistency', () => {
  forAll(arbitrary.audioMessage(), arbitrary.languagePair(), (audio, langs) => {
    const result1 = translateVoice(audio, langs.source, langs.target);
    const result2 = translateVoice(audio, langs.source, langs.target);
    
    return semanticSimilarity(result1.transcript, result2.transcript) > 0.95;
  });
});
```

### Property 2: Search Completeness
**Validates: Requirements AC-5**
```typescript
property('multilingual search completeness', () => {
  forAll(arbitrary.productListing(), arbitrary.searchQuery(), (product, query) => {
    const searchResults = searchProducts(query);
    const translatedQuery = translateQuery(query, product.language);
    const translatedResults = searchProducts(translatedQuery);
    
    return searchResults.includes(product) === translatedResults.includes(product);
  });
});
```

### Property 3: Price Discovery Accuracy
**Validates: Requirements AC-4**
```typescript
property('price discovery accuracy', () => {
  forAll(arbitrary.priceQuery(), arbitrary.marketData(), (query, marketData) => {
    const aiResponse = priceDiscoveryAI.queryPrice(query);
    const actualPrices = getMarketPrices(query.product, query.location);
    
    return Math.abs(aiResponse.data.current_price - actualPrices.average) < actualPrices.average * 0.1;
  });
});
```

### Property 4: Real-time Communication Latency
**Validates: Requirements AC-8**
```typescript
property('real-time communication latency', () => {
  forAll(arbitrary.voiceMessage(), (message) => {
    const startTime = Date.now();
    const translatedMessage = translateVoiceRealtime(message);
    const endTime = Date.now();
    
    return (endTime - startTime) < 2000; // Less than 2 seconds
  });
});
```

### Property 5: Cultural Appropriateness
**Validates: Requirements AC-9**
```typescript
property('cultural appropriateness', () => {
  forAll(arbitrary.userProfile(), arbitrary.uiElement(), (user, element) => {
    const localizedElement = localizeForUser(element, user);
    
    return isCulturallyAppropriate(localizedElement, user.culture) &&
           isAccessible(localizedElement, user.accessibility_needs);
  });
});
```

## Implementation Roadmap

### Phase 1: Core MVP (24 hours)
1. **Hour 1-4**: Basic UI setup with voice recording
2. **Hour 5-8**: Translation service integration
3. **Hour 9-12**: Product listing and search
4. **Hour 13-16**: Bidding system and notifications
5. **Hour 17-20**: Real-time chat with translation
6. **Hour 21-24**: Testing, deployment, and demo preparation

### Phase 2: Enhancement (Post-MVP)
- Advanced AI features and recommendations
- Additional language support
- Mobile app development
- Payment gateway integration
- Advanced analytics and reporting

This design provides a comprehensive foundation for building the Ek Bharath Ek Mandi platform that truly bridges India's linguistic diversity in trade, making it natural and intuitive for all users regardless of their technical background or language preferences.