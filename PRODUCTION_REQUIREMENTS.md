# Multilingual Mandi — Production Feature Analysis

## Persona-Based Requirements

### 👨‍🌾 As Tier-2 Farmer (Seller) — Tamil Speaker from Ramanagara

**Pain Points:**
- Limited English literacy
- Can't type well on smartphone
- No way to know fair market price
- Fear of getting cheated by distant buyers
- Logistics are a nightmare

**Must-Have Features:**
1. **Voice-First Product Listing** — Describe in Tamil, AI transcribes
2. **Market Price Intelligence** — Show today's mandi rates before pricing
3. **Buyer Credibility Score** — See buyer's rating, past transactions
4. **Payment Escrow** — Money held by platform, released after delivery confirmed
5. **Translation Panel** — Every message shows original + my language
6. **Audio Playback** — Hear buyer's message in Tamil

---

### 🛒 As B2B Buyer (Restaurant Owner) — Hindi Speaker from Delhi

**Pain Points:**
- Finding reliable suppliers across states
- Language barrier with Tamil/Telugu farmers
- Quality inconsistency
- Bulk order negotiation is tedious
- Tracking shipments

**Must-Have Features:**
1. **Smart Search** — "50kg organic tomatoes near Chennai" in Hindi
2. **Seller Profiles** — Ratings, certifications (organic, farm fresh)
3. **Bulk Order Management** — Request for Quote (RFQ) for large orders
4. **Price Comparison** — See same product from multiple sellers
5. **Real-time Translation** — Voice call with auto-translation
6. **Order History** — Re-order from trusted sellers easily

---

### 🏪 As Platform Operator

**Core Infrastructure:**
1. **AWS Transcribe** — Voice to text (11 Indian languages)
2. **AWS Translate** — Text translation between languages
3. **AWS Polly** — Text to speech for audio messages
4. **AWS Bedrock** — AI for categorization, pricing suggestions
5. **Payment Gateway** — UPI, Razorpay integration
6. **Logistics API** — Delhivery, Shiprocket for tracking

---

## Feature Tiers

### Tier 1 — MVP Demo ✅ (Current)
- [x] Homepage with products
- [x] Buyer/Seller dashboards
- [x] Place bid → Seller sees → Accept/Reject
- [x] Language switching (EN/HI/TA)
- [x] Mock translation display

### Tier 2 — Functional Beta
- [ ] Real AWS Transcribe integration
- [ ] Real translation API
- [ ] User registration with phone OTP
- [ ] Persistent data (DynamoDB)
- [ ] Product CRUD operations
- [ ] Image upload (S3)
- [ ] Push notifications

### Tier 3 — Market Ready
- [ ] Payment integration (UPI/Razorpay)
- [ ] Escrow system
- [ ] Logistics tracking
- [ ] Chat with history
- [ ] Voice calls with translation
- [ ] Seller verification
- [ ] Reviews & ratings
- [ ] Price trends/analytics

### Tier 4 — Scale
- [ ] ML-based price prediction
- [ ] Demand forecasting
- [ ] Credit scoring for buyers
- [ ] Multi-vendor logistics optimization
- [ ] Regional warehousing
- [ ] Mobile app (React Native)

---

## Missing UI Components for Production

| Component | Purpose | Priority |
|-----------|---------|----------|
| **Product Detail Page** | `/product/[id]` - full product info, seller info, bid history | HIGH |
| **Chat/Negotiation Page** | `/chat/[bidId]` - message thread with translation | HIGH |
| **User Profile** | `/profile` - edit info, view history | MEDIUM |
| **Search Results** | `/search?q=` - filtered product list | HIGH |
| **Order Tracking** | `/orders/[id]` - shipment status | MEDIUM |
| **Payment Flow** | `/checkout` - amount confirmation, UPI | HIGH |
| **Seller Analytics** | `/seller/analytics` - revenue, trends | LOW |
| **Settings** | `/settings` - language, notifications | LOW |

---

## Critical User Flows Not Yet Built

### 1. End-to-End Purchase Flow
```
Browse → Select Product → Place Bid → Seller Accepts
→ Proceed to Payment → Pay via UPI → Order Confirmed
→ Seller Ships → Buyer Receives → Mark Complete → Release Payment
```

### 2. Voice Message Flow
```
Buyer Records Message → AWS Transcribes → Translates to Seller's Language
→ Seller Reads/Listens → Replies via Voice → Buyer Gets Translation
```

### 3. Dispute Resolution Flow
```
Buyer Reports Issue → Platform Reviews → Mediates → Refund/Resolution
```

---

## Kiro Next Steps

1. Fix TypeScript errors in contexts
2. Create `/product/[id]` page
3. Create `/chat/[bidId]` page
4. Add user registration flow
5. Integrate AWS services
6. Add payment mock flow
7. Build mobile-responsive layouts
8. Add PWA support
