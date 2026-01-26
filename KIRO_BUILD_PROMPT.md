# Kiro: Build Demonstrable MVP — 3 Hours Left!

## GOAL: Fully Demonstrable Trading Flow

Build a working demo where evaluators can:
1. Browse products as buyer
2. Place a bid on a product  
3. Switch to seller view → see the bid notification
4. Accept/reject the bid
5. See translation in action throughout

---

## CORE REQUIREMENTS

### Language Switching
- When user selects Tamil → ALL UI text changes to Tamil
- When user selects Hindi → ALL UI text changes to Hindi
- Use the existing i18n system properly
- Product names can stay bilingual

### No Login
- All pages accessible directly via navigation
- Mock user profiles shown (no auth needed)

### Demo Flow Priority
Focus on making THIS flow work end-to-end:

```
BUYER VIEW                     SELLER VIEW
─────────────                  ─────────────
1. See products grid           
2. Click "Place Bid"           
3. Enter bid amount            
4. Send message (translated)   
                    ↓
                    Switch to Seller View → See notification
                    ↓
                               5. See "New Bid" notification
                               6. View bid details + translation
                               7. Accept bid
                    ↓
Back to Buyer View → Bid accepted!
```

---

## PAGE STRUCTURE

### Homepage `/`
- Product grid (6 items)
- Category filter chips
- Search bar
- Each product: image, name, price, location, bids count
- "Place Bid" button on each product

### Buyer Dashboard `/buyer`
- My Bids list (shows placed bids with status)
- Active negotiations
- When bid is placed → appears here
- Status updates: Pending → Accepted/Rejected

### Seller Dashboard `/seller`
- My Products list
- **Incoming Bids section** (IMPORTANT for demo)
  - Shows new bids with notification badge
  - Each bid shows: buyer name, amount, message (with translation)
  - Accept / Counter / Reject buttons
- Messages/Negotiations

---

## SHARED STATE (for demo)

Create a simple shared state (React Context or Zustand) that:
- Stores placed bids
- When buyer places bid → it appears in seller's incoming bids
- When seller accepts → buyer sees updated status

```typescript
// Simple shared state
const [bids, setBids] = useState([
  { id: 1, product: 'Tomatoes', buyer: 'Demo Buyer', amount: 48, status: 'pending', message: 'I need 50kg' }
]);

// Buyer places bid → add to bids
// Seller accepts → update status to 'accepted'
```

---

## TRANSLATION FEATURE

### Translation Panel
- Show on homepage (collapsible)
- Input → Output with language selectors
- Quick phrases for trading
- Voice button (placeholder icon, doesn't need to work)

### In-Message Translation
- When buyer sends Hindi message, seller sees:
  - Original: "मुझे 50 किलो चाहिए"
  - Translated: "I need 50 kg"
- Mock translation is fine

---

## UI ELEMENTS NEEDED

### Navigation Bar
```
[Logo] Ek Bharath Ek Mandi    [Browse] [Seller] [Buyer]    [Language ▼]
```

### Product Card
```
┌─────────────────────┐
│  [Product Image]    │
│  Tomatoes           │
│  📍 Chennai         │
│  ₹45/kg            │
│  3 bids • Top: ₹48  │
│  [Place Bid]        │
└─────────────────────┘
```

### Bid Notification (Seller View)
```
┌─────────────────────────────────────┐
│ 🔔 New Bid on Tomatoes              │
│ Buyer: Raj (Delhi)   Amount: ₹48/kg │
│ Message: "मुझे 50 किलो चाहिए"       │
│ Translation: "I need 50 kg"         │
│ [Accept] [Counter] [Reject]         │
└─────────────────────────────────────┘
```

---

## MOCK PROFILES

### Seller Profile (shown in seller dashboard)
```
👨‍🌾 Ravi Kumar
📍 Chennai, Tamil Nadu
⭐ 4.8 rating
Products: 12 active listings
```

### Buyer Profile (shown when placing bid)
```
🛒 Demo Buyer
📍 Delhi
"Looking for quality produce for my restaurant"
```

---

## WHAT TO BUILD (Priority Order)

1. **Fix any visibility issues** (text readable)
2. **Navigation** between /, /seller, /buyer
3. **Homepage** with product grid + bid functionality
4. **Seller Dashboard** with incoming bids + accept/reject
5. **Buyer Dashboard** with my bids + status
6. **Translation panel** on homepage
7. **Language switching** that changes all text

---

## i18n Example (make sure this works)

```typescript
// When language = 'ta' (Tamil)
t('common.products') → "பொருட்கள்"
t('common.placeBid') → "ஏலம் இடுங்கள்"
t('common.accept') → "ஏற்றுக்கொள்"
```

---

## SUCCESS = DEMO WORKS

Evaluator should be able to:
- [ ] Browse products
- [ ] Place a bid (with message)
- [ ] Switch to seller view
- [ ] See the bid notification
- [ ] Accept the bid
- [ ] Switch language → see UI change
- [ ] Use translation panel

**Ship something that works, not something perfect!**
