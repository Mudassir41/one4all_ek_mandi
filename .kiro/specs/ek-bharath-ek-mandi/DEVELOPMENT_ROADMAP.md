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

# PHASE 2: Complete UI Polish

## Goal
Polish UI, add missing pages, voice-first design patterns.

## Pages to Build

### 2.1 Product Detail Page `/product/[id]`
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

### 2.2 Place Bid Modal
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

### 2.3 Chat/Negotiation Page `/chat/[id]`
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

### 2.4 Add Product Page (Seller)
- Photo upload
- Voice description input
- Category, price, quantity fields
- Save draft / Publish

### 2.5 Analytics Page (Seller)
- Revenue trend chart
- Top products
- Buyer demographics pie chart

## Components to Build
- [ ] VoiceInputField (with mic button)
- [ ] AudioPlayer (for voice messages)
- [ ] TranslationBubble (original + translated)
- [ ] PriceChart (Recharts)
- [ ] ImageUploader
- [ ] QuantitySelector

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
| 1 ✅ | Bid flow works | Yes |
| 2 | Full UI pages | Yes |
| 3 | Real translation | Yes |
| 4 | Full product | Yes |

---

# NEXT STEPS

**Tonight**: Test MVP → Fix bugs → Submit  
**Week 1**: Build missing UI pages + text translation API  
**Month 1**: Full AI pipeline + analytics  
**Month 2-3**: ML models + payments + beta launch

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