# Kiro: Complete Multilingual Mandi — Post-Hackathon Task List

**Last Updated**: 2026-01-27 00:45 IST
**Context**: Hackathon MVP submitted. Now building production-ready platform.

> ✅ = Completed | 🔧 = In Progress | ❌ = Not Started | 🚨 = Blocker

---

## PHASE 1: FIX CURRENT ISSUES (Priority: CRITICAL)

### 1.1 TypeScript Errors ❌
Fix all compilation errors before adding new features:

```bash
npx tsc --noEmit 2>&1 | head -50
```

**Known Issues:**
- [ ] `I18nContext.tsx` - Type mismatch: `dir: string` should be `dir: 'ltr' | 'rtl'`
- [ ] `ThemeContext.tsx` - `mood` property not in type definition
- [ ] `usePhotoCapture.test.ts` - `current` is read-only
- [ ] `useVoiceRecording.test.ts` - Type callable issue

**Fix Pattern:**
```typescript
// Before (error)
dir: 'ltr',

// After (explicit typing)
dir: 'ltr' as const,
```

### 1.2 BiddingContext Connected ✅
All pages now use shared BiddingContext:
- Homepage: `addBid()` when placing bid
- Seller: `updateBidStatus()` for accept/reject
- Buyer: Shows real-time status from `bids`

---

## PHASE 2: UI/UX POLISH (Priority: HIGH)

### 2.1 Homepage Improvements ❌

**Product Grid:**
- [ ] Add horizontal scrollable category chips (Agrinaut pattern)
  ```jsx
  <div className="overflow-x-auto">
    <div className="flex gap-2 px-4">
      {categories.map(cat => <Chip key={cat}>{cat}</Chip>)}
    </div>
  </div>
  ```
- [ ] Add search bar with voice input button
- [ ] Product images (currently using emojis)
- [ ] Product rating display
- [ ] "Hot" / "New" badges on products

**Bid Flow:**
- [ ] Bid modal instead of alert (use existing BidModal.tsx)
- [ ] Custom bid amount input
- [ ] Voice message for bid (use VoiceRecorder.tsx)
- [ ] Show translation preview before submitting

### 2.2 Seller Dashboard Improvements ❌

- [ ] My Products section with CRUD
- [ ] Revenue analytics cards (mockup)
- [ ] Notification bell with unread count
- [ ] Filter bids by status (Pending/Accepted/Rejected)
- [ ] Counter-offer modal with price input
- [ ] Voice response button

### 2.3 Buyer Dashboard Improvements ❌

- [ ] Active orders section
- [ ] Favorite sellers list
- [ ] Price alerts (mockup)
- [ ] Search history
- [ ] Recommended products

### 2.4 Common UI Components ❌

- [ ] Toast notifications instead of alerts
  ```bash
  npm install react-hot-toast
  ```
- [ ] Loading skeletons for data fetching
- [ ] Empty state illustrations
- [ ] Error boundary with retry button
- [ ] Pull-to-refresh on mobile

---

## PHASE 3: NEW PAGES (Priority: MEDIUM)

### 3.1 Product Detail Page `/product/[id]` ❌

```
┌─────────────────────────────────────┐
│         [Large Image Gallery]       │
└─────────────────────────────────────┘
Product Name (Hindi/Tamil/English)
⭐ 4.8 (23 reviews) • 📍 Location

👨‍🌾 Seller: Ravi Kumar [View Profile]

┌─────────────────────────────────────┐
│ ₹45/kg      [- 50 kg +]  = ₹2,250  │
│                                     │
│ [🎤 Voice Bid]  [💰 Place Bid]     │
└─────────────────────────────────────┘

📊 Price Trend [Chart]
📦 Available: 500 kg
🚚 Delivery: 2-3 days to Delhi

💬 Other Buyers Asking: [Questions]
```

**Components needed:**
- [ ] ImageGallery with swipe
- [ ] QuantitySelector
- [ ] PriceChart (use Recharts)
- [ ] DeliveryEstimator
- [ ] RelatedProducts
- [ ] SellerCard

### 3.2 Chat/Negotiation Page `/chat/[id]` ❌

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
│              "I need 50kg, ₹42?"    │
│                                     │
├─────────────────────────────────────┤
│ [🎤 Hold to speak]        [Type ▶️] │
└─────────────────────────────────────┘
```

**Components needed:**
- [ ] ChatBubble with translation toggle
- [ ] VoiceMessagePlayer
- [ ] TranslationIndicator
- [ ] MessageInput with voice

### 3.3 Add Product Page `/seller/add-product` ❌

**Voice-First Flow:**
1. [ ] Record voice description → AI transcribes
2. [ ] Upload photos → AI categorizes
3. [ ] Review AI suggestions → Edit
4. [ ] Set price (AI suggests) → Publish

Use existing VoiceProductCreator.tsx as base.

### 3.4 Analytics Dashboard `/seller/analytics` ❌

- [ ] Revenue chart (7d/30d/all)
- [ ] Top products table
- [ ] Buyer demographics pie chart
- [ ] Conversion funnel (views → bids → sales)

---

## PHASE 4: TRANSLATION SYSTEM (Priority: HIGH)

### 4.1 i18n Infrastructure ❌

**Missing Translations:**
```typescript
// Add to each language file
{
  // Homepage
  "placeBid": "Place Bid" | "बोली लगाएं" | "ஏலம் விடவும்",
  "activeBids": "active bids" | "सक्रिय बोलियां" | "செயலில் உள்ள ஏலங்கள்",
  
  // Seller
  "acceptBid": "Accept Bid" | "बोली स्वीकार करें" | "ஏலத்தை ஏற்கவும்",
  "rejectBid": "Reject Bid" | "बोली अस्वीकार करें" | "ஏலத்தை நிராகரிக்கவும்",
  
  // Add all missing keys...
}
```

- [ ] Audit all hardcoded strings
- [ ] Add missing translation keys
- [ ] RTL support for Urdu (future)
- [ ] Font loading for each script

### 4.2 Translation Panel ❌

Live translation tool on homepage:
- [ ] Input field with language selector
- [ ] Output with audio playback
- [ ] Quick phrases for trading
- [ ] Copy/share translation

### 4.3 Message Translation ❌

When buyer sends message:
- [ ] Detect source language
- [ ] Translate to seller's language
- [ ] Show original + translation
- [ ] Audio playback of translation

---

## PHASE 5: VOICE FEATURES (Priority: MEDIUM)

### 5.1 Voice Recording ❌

Use existing VoiceRecorder.tsx:
- [ ] Integrate in bid modal
- [ ] Integrate in chat
- [ ] Integrate in product creation
- [ ] Show waveform during recording

### 5.2 Voice Playback ❌

- [ ] Audio player for voice messages
- [ ] Speed control (0.5x, 1x, 1.5x)
- [ ] Translation toggle

### 5.3 Voice-to-Text (Future) ❌

AWS Transcribe integration:
- [ ] Streaming transcription
- [ ] Multiple Indian languages
- [ ] Confidence scores

---

## PHASE 6: BACKEND INTEGRATION (Priority: LOW for hackathon)

### 6.1 API Endpoints ❌

```
POST /api/products         - Create product
GET  /api/products         - List products
GET  /api/products/[id]    - Get product
POST /api/bids             - Create bid
PUT  /api/bids/[id]        - Update bid status
GET  /api/bids/buyer/[id]  - Get buyer's bids
GET  /api/bids/seller/[id] - Get seller's bids
POST /api/translate        - Translate text
POST /api/transcribe       - Voice to text
```

### 6.2 Database Schema ❌

```sql
-- Users
- id, phone, name, type (vendor/buyer), languages[], location

-- Products
- id, seller_id, name_{lang}, price, unit, category, images[], status

-- Bids
- id, product_id, buyer_id, amount, message, message_translated, status

-- Conversations
- id, bid_id, messages[]
```

### 6.3 AWS Services ❌

- [ ] Transcribe - Speech-to-text
- [ ] Translate - Text translation
- [ ] Polly - Text-to-speech
- [ ] Bedrock - AI categorization
- [ ] S3 - Image storage
- [ ] DynamoDB - Database

---

## EXECUTION ORDER

**Day 1 (Today):**
1. Fix TypeScript errors
2. Add Toast notifications
3. Implement Bid Modal properly

**Day 2:**
4. Product Detail Page
5. Search with filters
6. Translation Panel

**Day 3:**
7. Chat Page
8. Voice integration
9. Add Product Page

**Day 4:**
10. Backend API stubs
11. Analytics Dashboard
12. Full testing

---

## FILES TO MODIFY

| File | Changes |
|------|---------|
| `src/contexts/I18nContext.tsx` | Fix type errors, add translations |
| `src/contexts/ThemeContext.tsx` | Fix type errors |
| `src/components/ui/InteractiveHomepage.tsx` | Category chips, search bar |
| `src/app/seller/page.tsx` | Enhanced dashboard |
| `src/app/buyer/page.tsx` | Enhanced dashboard |
| `src/app/product/[id]/page.tsx` | NEW - Product detail |
| `src/app/chat/[id]/page.tsx` | NEW - Chat/negotiation |
| `src/components/ui/BidModal.tsx` | Wire up to BiddingContext |
| `src/components/ui/Toast.tsx` | NEW - Toast notifications |

---

## TESTING CHECKLIST

Before any commit, verify:
- [ ] `npm run build` passes
- [ ] Homepage loads, products display
- [ ] Place Bid → Seller sees notification
- [ ] Seller Accept → Buyer sees ✅
- [ ] Language switch → All text changes
- [ ] Mobile responsive

---

## DESIGN REFERENCES

Apply these Agrinaut patterns:
1. **Horizontal scrollable chips** - Categories, filters
2. **Interactive mock elements** - Snackbar feedback on actions
3. **FAB for primary action** - "New Post" style button
4. **Bottom sheet modals** - Bid details, filters
5. **Consistent 16px padding** - All cards and sections
6. **Touch targets 48px minimum** - All buttons

---

**Remember: Ship something that works, not something perfect!**
