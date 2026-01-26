# Multilingual Mandi — Master Development Roadmap

## Vision
India's Voice-First Cross-State Trading Platform — breaking language barriers through AI-powered real-time translation for farmers, artisans, and traders.

---

# PHASE 1: UI MOCKUP ✅ COMPLETE

## Goal
Static UI mockup with hardcoded data for initial visualization.

## Features Done
- Homepage with static product grid
- Basic navigation between pages
- i18n infrastructure (8 languages) 
- Cultural theme system
- Voice recording components (UI only)
- Static seller/buyer dashboard mockups

## Current Status
- **NOT FUNCTIONAL**: Just UI mockups with alert boxes
- **NO BACKEND**: No real data persistence or APIs
- **NO AI**: No actual voice translation or processing
- **NEEDS FULL IMPLEMENTATION**: All core features need to be built

## Tech Stack
- Next.js 14, TypeScript, Tailwind CSS
- Static components only

---

# PHASE 2: FUNCTIONAL MVP - CORE FEATURES

## Goal
Build actual functional platform with real data flows and basic AI integration.

## Priority 1: Backend Infrastructure & Data Layer
### 2.1 Database & API Setup
- [ ] Set up DynamoDB tables (Users, Products, Bids, Conversations)
- [ ] Create Lambda API functions for CRUD operations
- [ ] Implement API Gateway routing
- [ ] Add authentication system (phone OTP)
- [ ] Create user registration/login flows

### 2.2 Product Management System
- [ ] **Seller Product Creation** (Voice + Manual + AI-driven)
  - [ ] Voice description input with transcription
  - [ ] AI-powered product categorization
  - [ ] Manual form input for literate users
  - [ ] Photo upload with S3 integration
  - [ ] Dual pricing (wholesale/retail)
  - [ ] Location-based categorization
- [ ] Product listing API with real database
- [ ] Product search with basic filtering
- [ ] Product detail pages with real data

### 2.3 Bidding & Transaction System
- [ ] Real bidding system with database persistence
- [ ] Bid notifications (real-time)
- [ ] Bid acceptance/rejection workflows
- [ ] Transaction status tracking
- [ ] Order management system

## Priority 2: AI Integration (Basic)
### 2.4 Voice & Translation Pipeline
- [ ] **Voice-to-Text**: AWS Transcribe integration
- [ ] **Text Translation**: AWS Translate API
- [ ] **Text-to-Speech**: AWS Polly integration
- [ ] **Voice Product Creation**: Full voice-driven product listing
- [ ] **Voice Bidding**: Voice-based bid placement
- [ ] **Voice Chat**: Basic voice messaging between users

### 2.5 AI-Driven Features
- [ ] **Smart Product Categorization**: AI categorizes products from voice descriptions
- [ ] **Price Suggestions**: AI suggests competitive pricing
- [ ] **Basic Price Discovery**: Simple market price queries
- [ ] **Translation Context**: Trade-specific terminology handling

## Priority 3: User Flows & Experience
### 2.6 Complete User Journeys
- [ ] **Seller Journey**: Register → Add Products (Voice/Manual) → Manage Bids → Accept Orders
- [ ] **B2B Buyer Journey**: Register → Search Products → Place Bids → Track Orders
- [ ] **B2C Buyer Journey**: Browse → Chat with Seller → Direct Purchase
- [ ] **Cross-Language Communication**: Real voice translation in conversations

### 2.7 Essential Pages & UI Components

#### Pages to Build

**2.7.1 Product Detail Page `/product/[id]`**
```
[← Back]                    [❤️] [Share]
┌─────────────────────────────────────┐
│         [Large Image]               │
└─────────────────────────────────────┘
Organic Tomatoes ⭐ 4.8 (23 reviews)
• 📍 Chennai, TN 👨‍🌾 Ravi Kumar

┌─────────────────────────────────────┐
│ ₹45/kg      [- 50 kg +]  = ₹2,250  │
└─────────────────────────────────────┘

📊 Price Trend [Chart placeholder]
📦 Available: 500 kg
🚚 Delivery: 2-3 days

[🎤 Talk to Seller]  [💰 Place Bid]
```

**2.7.2 Place Bid Modal**
```
┌─────────────────────────────────────┐
│ Place Bid on Organic Tomatoes       │
├─────────────────────────────────────┤
│ Current Price: ₹45/kg               │
│ Top Bid: ₹48/kg                     │
│                                     │
│ Your Bid: [₹____]/kg                │
│ Quantity: [___] kg                  │
│                                     │
│ Message to Seller:                  │
│ ┌─────────────────────────────────┐ │
│ │ [🎤] Type or speak...           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]              [Submit Bid]  │
└─────────────────────────────────────┘
```

**2.7.3 Chat/Negotiation Page `/chat/[id]`**
```
┌─────────────────────────────────────┐
│ [←] Chat with Ravi Kumar      [📞] │
├─────────────────────────────────────┤
│ Re: Organic Tomatoes @ ₹48/kg       │
├─────────────────────────────────────┤
│                                     │
│ [Seller] நல்ல தக்காளி, கிலோ 45 ரூபாய் │
│          "Good tomatoes, ₹45/kg"    │
│                                     │
│              [You] मुझे 50 किलो     │
│              चाहिए, 42 में दोगे?     │
│                                     │
│ [Seller] 44 ரூபாய் கொடுங்க          │
│          "Give ₹44"                 │
│                                     │
├─────────────────────────────────────┤
│ [🎤 Hold to speak]        [Type ▶️] │
└─────────────────────────────────────┘
```

**2.7.4 Add Product Page (Seller) - Voice-First Design**
```
┌─────────────────────────────────────┐
│ [←] Add New Product                 │
├─────────────────────────────────────┤
│ 🎤 Describe Your Product            │
│ ┌─────────────────────────────────┐ │
│ │ [🎤 Hold to Record]             │ │
│ │ "मेरे पास ताजे टमाटर हैं..."      │ │
│ │ ↓ AI Processing...              │ │
│ │ "Fresh tomatoes available"      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📸 Add Photos                       │
│ [📷 Camera] [📁 Gallery]            │
│                                     │
│ 🏷️ AI Suggested Details            │
│ Category: Vegetables ✓              │
│ Price: ₹45/kg (Market: ₹40-50)     │
│ Quantity: [___] kg                  │
│ Location: Chennai, TN ✓             │
│                                     │
│ 💰 Pricing Options                  │
│ Wholesale (100kg+): ₹[___]/kg      │
│ Retail: ₹[___]/kg                  │
│                                     │
│ [Save Draft] [🎤 Review] [Publish]  │
└─────────────────────────────────────┘
```

**2.7.5 Analytics Page (Seller)**
```
┌─────────────────────────────────────┐
│ 📊 My Business Analytics            │
├─────────────────────────────────────┤
│ This Month: ₹45,230 📈 +12%        │
│                                     │
│ 📈 Revenue Trend                    │
│ [Line Chart - 6 months]            │
│                                     │
│ 🏆 Top Products                     │
│ 1. Tomatoes - ₹15,400              │
│ 2. Onions - ₹12,800                │
│ 3. Potatoes - ₹8,900               │
│                                     │
│ 👥 Buyer Demographics               │
│ [Pie Chart]                        │
│ • B2B Wholesale: 65%               │
│ • B2C Retail: 25%                  │
│ • Tourists: 10%                    │
│                                     │
│ 🌍 Geographic Reach                 │
│ Delhi: 35% | Mumbai: 25%           │
│ Bangalore: 20% | Others: 20%       │
└─────────────────────────────────────┘
```

#### Essential Components to Build
- [ ] **VoiceInputField** - Real recording with waveform visualization
- [ ] **AudioPlayer** - Playback with translation toggle
- [ ] **TranslationBubble** - Original + translated text with confidence score
- [ ] **PriceChart** - Interactive charts using Recharts
- [ ] **ImageUploader** - Drag & drop with preview
- [ ] **QuantitySelector** - Smart input with unit conversion
- [ ] **AIProcessingIndicator** - Shows AI categorization in progress
- [ ] **BidNotificationToast** - Real-time bid alerts
- [ ] **VoiceWaveform** - Visual feedback during recording
- [ ] **LanguageToggle** - Switch between original and translated content
- [ ] **SmartPricingSuggestion** - AI-powered price recommendations
- [ ] **LocationPicker** - GPS + manual location selection

## Success Criteria for Phase 2
- [ ] Sellers can add products using voice description
- [ ] AI categorizes and suggests pricing for products
- [ ] Buyers can search and bid on real products
- [ ] Voice messages are translated between languages
- [ ] Real-time bidding notifications work
- [ ] Cross-state demo: Tamil seller ↔ Hindi buyer works end-to-end

---

# PHASE 3: AI Integration

## Goal
Replace mocks with real AI services for voice and translation.

## Architecture
```
CLIENT (Next.js)
├── VAD (Silero) — detect speech
├── Recorder (PCM audio)
└── WebSocket/WebRTC
│
▼
BACKEND (Lambda/FastAPI)
├── AWS Transcribe (STT)
├── Bedrock Claude (Translation + Agent)
├── AWS Polly (TTS)
└── Pydantic AI (Agent orchestration)
```

## Voice Pipeline

### 3.1 Voice Activity Detection (VAD)
```typescript
import { useSileroVad } from '@vad/react';

const { isSpeaking } = useSileroVad({
  onSpeechEnd: (audio) => sendToBackend(audio),
});
```

### 3.2 Speech-to-Text (STT)
```python
# AWS Transcribe streaming
transcribe.start_stream_transcription(
    LanguageCode='hi-IN',
    MediaEncoding='pcm',
)
```

### 3.3 Translation (Pydantic AI + Bedrock)
```python
from pydantic_ai import Agent

translation_agent = Agent(
    'anthropic:claude-3-sonnet',
    system_prompt="Translate for Indian agricultural trade..."
)
```

### 3.4 Text-to-Speech (TTS)
```python
# AWS Polly
polly.synthesize_speech(
    Text=translated_text,
    VoiceId='Aditi',  # Hindi voice
    OutputFormat='mp3',
)
```

## Implementation Order
1. [ ] AWS Translate API (text translation)
2. [ ] Web Speech API (browser STT)
3. [ ] AWS Transcribe (better accuracy)
4. [ ] AWS Polly (TTS)
5. [ ] Silero VAD
6. [ ] WebRTC real-time
7. [ ] Pydantic AI agent

---

# PHASE 4: ML & Production

## ML Models

### Price Prediction (XGBoost)
```python
features = ['commodity', 'district', 'month', 'weather', 'supply']
model = xgb.XGBRegressor()
model.fit(apmc_data)
```

### Demand Forecasting (Prophet)
```python
model = Prophet(yearly_seasonality=True)
model.fit(historical_data)
```

### Smart Matching (Collaborative Filtering)
- Buyer-seller recommendations based on transaction history

## Production Features

### Payments
- UPI via Razorpay
- Escrow for bids
- Auto-release on delivery

### Verification
- Phone OTP
- Aadhaar (optional)
- Business license

### Logistics
- Partner APIs (Dunzo, Porter)
- Delivery tracking

## Implementation Order
1. [ ] Price data API (agmarknet scraper)
2. [ ] Analytics charts (Recharts)
3. [ ] XGBoost training
4. [ ] SageMaker deployment
5. [ ] Razorpay integration
6. [ ] OTP verification

---

# TECH STACK BY PHASE

| Layer | Phase 1-2 | Phase 3 | Phase 4 |
|-------|-----------|---------|---------|
| Frontend | Next.js, Tailwind | + WebRTC, VAD | + Charts |
| Backend | Mock | Lambda, FastAPI | + SageMaker |
| AI | Mock | Transcribe, Polly, Bedrock | + XGBoost |

---

# SUBMISSION CHECKPOINTS

| Phase | Demo | Submission Ready |
|-------|------|------------------|
| 1 ✅ | UI Mockup only | No - needs functionality |
| 2 | Functional MVP | Yes - core features work |
| 3 | Advanced AI | Yes - production ready |
| 4 | Full product | Yes - market ready |

---

# NEXT STEPS

**Immediate Priority**: Build functional MVP (Phase 2)
**Week 1**: Core backend APIs + voice integration
**Week 2**: Real bidding system + AI features  
**Month 1**: Advanced AI pipeline + production deployment

---

# IMPLEMENTATION PRIORITIES

## Immediate (Next 24-48 hours)
1. Fix any remaining MVP bugs
2. Complete Phase 2 UI components
3. Implement basic text translation API
4. Add missing product detail pages

## Week 1-2 (Post-submission)
1. Real voice translation pipeline
2. Advanced search functionality
3. Chat/negotiation interface
4. Price discovery AI

## Month 1 (Production Ready)
1. Full AI integration
2. Payment system
3. User verification
4. Performance optimization
5. Security hardening

## Month 2-3 (Scale & Growth)
1. ML recommendation engine
2. Advanced analytics
3. Mobile app
4. Multi-sector expansion
5. Logistics integration

---

# REFERENCE LINKS

- **Current Spec**: `.kiro/specs/ek-bharath-ek-mandi/`
- **Requirements**: `requirements.md`
- **Design**: `design.md`
- **Tasks**: `tasks.md`
- **Codebase**: `src/`
- **Infrastructure**: `infrastructure/`

---

*This roadmap serves as the master reference for all development phases. Update this document as priorities shift and new requirements emerge.*