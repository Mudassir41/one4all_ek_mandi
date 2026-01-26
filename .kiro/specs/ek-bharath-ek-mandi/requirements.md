# Ek Bharath Ek Mandi - Requirements Document

## Project Overview

**Name**: Ek Bharath Ek Mandi (एक भारत एक मंडी)  
**Tagline**: India's Voice-First Cross-State Trading Platform  
**Challenge**: AI for Bharat - 26 Jan Prompt Challenge  

### Problem Statement
India's local trade (agriculture, sericulture, handicrafts, fisheries) is fragmented by language barriers. Regional vendors cannot effectively negotiate with buyers from other states due to linguistic differences, resulting in billions in lost trade opportunities and unfair pricing. Additionally, individual consumers and tourists face communication barriers when trying to purchase authentic local products directly from vendors.

### Solution Vision
A web platform that connects regional vendors with national buyers (both B2B and B2C) through real-time AI voice translation, live bidding, price discovery, and multilingual negotiation tools.

## Target Users

### Primary Users: Vendors (Sellers)
- **Profile**: Farmers, artisans, fishers, producers across India
- **Languages**: Regional languages (Tamil, Telugu, Kannada, Bengali, Odia, Hindi, etc.)
- **Business Model**: Sell to bulk buyers and individual consumers from other states
- **Pain Points**: Language barriers, price opacity, limited market access
- **Goals**: Fair prices, wider market reach, seamless communication

### Secondary Users: Buyers (B2B)
- **Profile**: Wholesalers, traders, retailers from different states
- **Business Model**: Source products from across India for resale
- **Pain Points**: Finding suppliers, language barriers, price comparison
- **Goals**: Discover suppliers, negotiate effectively, compare prices

### Tertiary Users: Buyers (B2C)
- **Profile**: Tourists, travelers, individual consumers wanting local products
- **Languages**: Any supported language (Hindi, English, regional languages)
- **Business Model**: Direct purchase from vendors for personal use
- **Pain Points**: Tourist pricing, communication barriers, lack of authentic local access
- **Goals**: Fair pricing, authentic local products, seamless communication with vendors

## Supported Sectors

| Sector | Products | Trade Pattern |
|--------|----------|---------------|
| Agriculture | Vegetables, grains, rice | Farm states → Metro cities & consumers |
| Sericulture | Cocoons, silk yarn, mulberry | Karnataka/TN ↔ West Bengal & consumers |
| Fisheries | Fresh fish, dried fish | Coastal → Landlocked states & consumers |
| Handicrafts | Textiles, pottery, wood crafts | Artisan clusters → National retailers & tourists |
| Spices | Bulk spices | Kerala → North India & individual buyers |

## User Stories

### Vendor Stories

**US-1: Product Listing**
- **As a** Tamil vegetable farmer
- **I want to** list my tomatoes with photos and quantity in Tamil
- **So that** both bulk buyers and individual consumers across India can discover my products

**US-2: Voice Negotiation**
- **As a** Kannada silk producer
- **I want to** receive voice messages from Hindi-speaking buyers and respond in Kannada
- **So that** I can negotiate naturally without language barriers

**US-3: Price Discovery**
- **As a** Bengali fish vendor
- **I want to** ask "What are fish selling for in Mumbai today?" in Bengali
- **So that** I can price my products competitively for both wholesale and retail

**US-4: Bid Management**
- **As a** Odia handicraft artisan
- **I want to** see all incoming bids and direct purchase requests sorted by price
- **So that** I can choose the best offer

**US-5: Market Alerts**
- **As a** Kerala spice farmer
- **I want to** receive notifications when spice prices increase in North India
- **So that** I can time my sales optimally

### B2B Buyer Stories

**US-6: Multilingual Search**
- **As a** Delhi wholesaler
- **I want to** search for "tomatoes" and find listings in all Indian languages
- **So that** I can source from the best suppliers nationwide

**US-7: Voice Bidding**
- **As a** Mumbai trader
- **I want to** place voice bids in Hindi for Tamil farmer's products
- **So that** I can negotiate efficiently

**US-8: Supplier Discovery**
- **As a** Bangalore retailer
- **I want to** find verified silk suppliers with reviews
- **So that** I can build reliable supply chains

**US-9: Price Comparison**
- **As a** Pune buyer
- **I want to** compare rice prices across different states
- **So that** I can make informed purchasing decisions

### B2C Buyer Stories

**US-10: Tourist Shopping**
- **As a** tourist visiting Kerala
- **I want to** communicate with spice vendors in English and hear their responses translated
- **So that** I can buy authentic spices at fair prices

**US-11: Direct Purchase**
- **As a** consumer in Delhi
- **I want to** buy handicrafts directly from artisans in Rajasthan using voice chat
- **So that** I can get authentic products and support artisans directly

**US-12: Product Discovery**
- **As a** food enthusiast in Mumbai
- **I want to** discover regional specialties from different states
- **So that** I can experience authentic flavors from across India

### System Stories

**US-13: Real-time Translation**
- **As a** platform user
- **I want** voice messages translated in under 2 seconds
- **So that** conversations flow naturally

**US-14: Conversation History**
- **As a** vendor or buyer
- **I want** all voice negotiations transcribed and saved in both languages
- **So that** I have records of agreements

## Acceptance Criteria

### AC-1: Voice Translation System
- **Given** a vendor speaks in Tamil
- **When** a buyer (B2B or B2C) receives the message
- **Then** the buyer hears the message in their preferred language with < 2s latency
- **And** the original Tamil and translated text are both saved as transcripts
- **And** translation accuracy is > 90% for common trade terms

### AC-2: Product Listing
- **Given** a vendor wants to list a product
- **When** they fill the form in their regional language
- **Then** the listing is searchable by both B2B and B2C buyers using any supported language
- **And** product photos are uploaded and displayed correctly
- **And** listing includes pricing for both wholesale and retail quantities

### AC-3: Bidding and Direct Purchase System
- **Given** a buyer wants to purchase a product
- **When** they place a bid (B2B) or direct purchase request (B2C)
- **Then** the vendor receives a notification in their language
- **And** the request appears in the vendor's dashboard with buyer type clearly indicated
- **And** different pricing tiers are supported (wholesale vs retail)

### AC-4: Price Discovery
- **Given** a vendor asks about market prices
- **When** they voice their query in their regional language
- **Then** the AI responds with current market prices for both wholesale and retail in the same language
- **And** the response includes data from multiple markets
- **And** price trends are shown for the past 7 days

### AC-5: Cross-Language Search
- **Given** a buyer searches for "टमाटर" (tomatoes in Hindi)
- **When** the search is executed
- **Then** results include listings posted in Tamil, Telugu, Kannada, etc.
- **And** all results are displayed with translated titles
- **And** search results show both wholesale and retail options

### AC-6: Mobile Responsiveness
- **Given** a user accesses the platform on a smartphone
- **When** they use voice features
- **Then** the interface works smoothly without performance issues
- **And** offline photo capture works for product listings
- **And** voice recording works with poor network connectivity

### AC-7: Data Privacy
- **Given** a vendor lists products
- **When** they set visibility preferences
- **Then** they can choose to show products to B2B only, B2C only, or both
- **And** personal information is protected according to privacy settings
- **And** voice recordings are encrypted and stored securely

### AC-9: Natural User Experience
- **Given** a user (vendor, B2B buyer, or B2C buyer) accesses the platform
- **When** they interact with the interface
- **Then** the design feels familiar and intuitive based on their cultural context
- **And** voice interactions feel as natural as face-to-face conversations
- **And** visual elements use culturally appropriate colors, icons, and layouts
- **And** the interface adapts to user's preferred language and regional conventions

### AC-10: Accessibility and Inclusivity
- **Given** users with varying technical literacy levels
- **When** they use the platform
- **Then** the interface provides clear visual cues and audio feedback
- **And** important actions are confirmed through multiple sensory channels
- **And** error messages are helpful and presented in user's preferred language
- **And** the platform works effectively for users with disabilities

## UI/UX Design Principles

### Natural Interaction Design
- **Voice-First Approach**: Primary interactions through voice with visual support
- **Conversational UI**: Interface mimics natural conversation patterns
- **Cultural Familiarity**: Use familiar metaphors from local markets and trading practices
- **Progressive Disclosure**: Show only relevant information at each step
- **Contextual Help**: Assistance appears when needed without cluttering the interface

### Regional Adaptation
- **Language-Specific Layouts**: Right-to-left support where needed, appropriate typography
- **Cultural Color Schemes**: Colors that resonate with regional preferences and avoid cultural taboos
- **Local Iconography**: Icons and symbols familiar to regional users
- **Regional Business Practices**: Interface reflects local trading customs and etiquette

### Accessibility Standards
- **Low Literacy Support**: Heavy use of voice, icons, and visual cues over text
- **Multi-Modal Feedback**: Visual, audio, and haptic feedback for all actions
- **Large Touch Targets**: Optimized for various hand sizes and motor abilities
- **High Contrast**: Readable in various lighting conditions including bright sunlight
- **Offline Indicators**: Clear status of connectivity and sync state

## Technical Requirements

### Functional Requirements
- Support 7+ Indian languages (Hindi, Tamil, Telugu, Kannada, Bengali, Odia, Malayalam)
- Real-time voice-to-voice translation with < 2s latency
- Product listing with image upload capability
- Live bidding system and direct purchase options
- AI-powered price discovery using market data
- Conversation transcription in both source and target languages
- Mobile-responsive web interface
- Offline-first photo capture for product listings
- Real-time chat with voice translation for B2C interactions

### Non-Functional Requirements
- **Performance**: Support 100K concurrent users
- **Scalability**: Auto-scaling based on demand
- **Availability**: 99.9% uptime
- **Security**: End-to-end encryption for voice messages
- **Compliance**: Data localization as per Indian regulations
- **Accessibility**: Works on low-end smartphones with 2G connectivity
- **Usability**: Interface feels natural and intuitive to users regardless of technical literacy
- **Cultural Sensitivity**: Design respects regional preferences and cultural contexts

## UI/UX Design Principles

### Natural Interaction Design
- **Voice-First Approach**: Primary interactions through voice with visual support
- **Conversational UI**: Interface mimics natural conversation patterns
- **Cultural Familiarity**: Use familiar metaphors from local markets and trading practices
- **Progressive Disclosure**: Show only relevant information at each step
- **Contextual Help**: Assistance appears when needed without cluttering the interface

### Regional Adaptation
- **Language-Specific Layouts**: Right-to-left support where needed, appropriate typography
- **Cultural Color Schemes**: Colors that resonate with regional preferences and avoid cultural taboos
- **Local Iconography**: Icons and symbols familiar to regional users
- **Regional Business Practices**: Interface reflects local trading customs and etiquette

### Accessibility Standards
- **Low Literacy Support**: Heavy use of voice, icons, and visual cues over text
- **Multi-Modal Feedback**: Visual, audio, and haptic feedback for all actions
- **Large Touch Targets**: Optimized for various hand sizes and motor abilities
- **High Contrast**: Readable in various lighting conditions including bright sunlight
- **Offline Indicators**: Clear status of connectivity and sync state

## MVP Scope (24-hour Sprint)

### Include in MVP
- Vendor dashboard with B2B and B2C product listings
- B2B and B2C buyer dashboards
- Voice messaging with real-time translation (Agriculture sector focus)
- Basic bidding system and direct purchase options
- Price discovery showing current market rates
- Product listing with photos and dual pricing (wholesale/retail)
- Cross-state demo: Tamil vendor ↔ Delhi B2B buyer ↔ Tourist B2C buyer
- Real-time voice chat for B2C interactions

### Defer for Later
- Mobile app development
- Real-time call translation (beyond messaging)
- Other sectors (sericulture, fisheries, handicrafts)
- AI negotiation suggestions
- Integration with coordination hubs
- Advanced analytics and reporting
- Payment gateway integration

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Languages supported | 7+ | System configuration |
| Voice translation latency | < 2 seconds | Performance monitoring |
| Vendor listings | Functional demo | Feature completion |
| B2B and B2C transactions | Functional demo | Feature completion |
| Cross-state match | Demo: TN vendor ↔ Delhi buyer ↔ Tourist | Integration test |
| User engagement | Voice messages exchanged | Usage analytics |
| Translation accuracy | > 90% | User feedback |
| B2C adoption | Tourist/consumer usage | User registration |

## Data Sources
- eNAM (National Agriculture Market) for mandi prices
- APMC price APIs (state-wise)
- Sector coordination hubs (sericulture boards, fisher cooperatives)
- User-generated price data from bids and transactions
- Historical price trends for AI training
- Retail market price data for B2C pricing

## Constraints and Assumptions

### Constraints
- 24-hour development timeline for MVP
- Web-only platform (no mobile app in MVP)
- Limited to agriculture sector in MVP
- AWS infrastructure requirement

### Assumptions
- Users have basic smartphone with internet connectivity
- Voice input/output is preferred over text
- Regional language support is critical for adoption
- Price transparency will drive user engagement
- Both B2B and B2C demand exists for cross-state trade
- Tourists and consumers are willing to use voice translation

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Voice translation accuracy | High | Use multiple AI services, fallback to text |
| Network connectivity issues | Medium | Offline-first design, sync when online |
| User adoption in rural areas | High | Simple UI, voice-first approach |
| Data privacy concerns | Medium | Transparent privacy policy, user controls |
| Scalability challenges | Medium | AWS auto-scaling, performance monitoring |
| B2C market validation | Medium | Start with tourist-heavy regions, gather feedback |

## Compliance Requirements
- Data Protection: Comply with Indian data protection regulations
- Language Support: Accurate translation without cultural bias
- Accessibility: Support for users with disabilities
- Content Moderation: Prevent misuse and fraudulent listings
- Consumer Protection: Fair pricing transparency for B2C transactions