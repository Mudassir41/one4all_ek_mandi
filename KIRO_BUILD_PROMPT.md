# Kiro Task: Build Functional MVP for Multilingual Mandi

## CRITICAL ISSUES TO FIX FIRST

### 1. Theme Visibility Problem
The current theme has white/light text on cream/light backgrounds making text unreadable.

**Fix:**
- Use ONE clean theme: Orange header (#FF9933), white body background (#FFFFFF), dark text (#1a1a1a)
- Remove all the complex theme switching for now
- Ensure ALL text has sufficient contrast (dark text on light backgrounds, white text on dark backgrounds)
- Remove cream/beige backgrounds that clash with text

### 2. Simplify ThemeContext
- Strip down to one simple color scheme
- Remove festival themes, time-based themes, regional themes for MVP
- Keep it simple: Primary (orange), Secondary (green), Background (white), Text (dark gray)

---

## MAIN TASK: Build Functional Dashboards

### Page 1: Homepage (`src/app/page.tsx`)

Create a functional homepage with:

**Header:**
- Orange gradient header with logo "एक भारत एक मंडी"
- Language selector dropdown (8 languages)
- "Translate" button that opens translation panel

**Translation Panel (THE KILLER FEATURE):**
- Collapsible dark panel below header
- Two text areas side by side: Input | Output
- Language dropdowns for: From → To
- "Translate" button (simulates translation with mock data)
- "Voice" button (placeholder for voice input)
- "Listen" button (placeholder for TTS)
- Quick phrase buttons for common trading phrases

**Hero Section:**
- Title: "India's Voice-First Cross-State Trading Platform"
- Subtitle about breaking language barriers
- Search bar for products
- Stats row: Languages, States, Products, Vendors

**Product Grid:**
- Show 5-6 mock products with:
  - Product image placeholder (emoji)
  - Product name (English + Hindi)
  - Price per unit
  - Location
  - Seller name
  - Active bids count
  - Top bid amount
  - "Place Bid" button
  - "Chat" button

**Footer:**
- Simple footer with branding and challenge attribution

---

### Page 2: Vendor Dashboard (`src/app/vendor/page.tsx`)

Create a new page at `/vendor` with:

**Header:**
- Same as homepage but with "Vendor Dashboard" title
- "Add Product" button

**My Products Section:**
- List of vendor's products
- Each product card shows:
  - Product name + image
  - Current price
  - Active bids (expandable to see details)
  - "Edit" and "Delete" buttons

**Incoming Bids Section:**
- List of bids from buyers
- Each bid shows:
  - Product name
  - Buyer name + location
  - Bid amount
  - Buyer's message (with translation indicator)
  - "Accept" / "Counter" / "Reject" buttons

**Add Product Modal:**
- Form with:
  - Product name (with translation preview)
  - Category dropdown
  - Quantity
  - Price per unit
  - Location
  - Photo upload placeholder
  - Submit button

**Voice Negotiation Panel:**
- Shows active negotiations
- Voice message input
- Auto-translation toggle
- Message history with translations

---

### Page 3: Buyer Dashboard (`src/app/buyer/page.tsx`)

Create a new page at `/buyer` with:

**Header:**
- Same style with "Buyer Dashboard" title
- Search bar

**Browse Products:**
- Filter by category, location, price range
- Product grid similar to homepage but larger
- Each product shows detailed info

**My Bids Section:**
- List of bids placed by buyer
- Status: Pending / Accepted / Rejected / Counter-offered
- "Edit Bid" / "Cancel Bid" buttons

**Negotiation Panel:**
- Active negotiations with vendors
- Voice/text input with auto-translation
- Message history

**Cart / Orders Section:**
- Won bids ready for checkout
- Order history

---

## MOCK DATA TO USE

```typescript
// Products
const products = [
  { id: 1, name: 'Organic Tomatoes', nameHi: 'जैविक टमाटर', price: 45, unit: 'kg', location: 'Chennai, TN', seller: 'Ravi Kumar', bids: 3, topBid: 48 },
  { id: 2, name: 'Basmati Rice', nameHi: 'बासमती चावल', price: 85, unit: 'kg', location: 'Punjab', seller: 'Gurpreet Singh', bids: 5, topBid: 90 },
  { id: 3, name: 'Silk Cocoons', nameHi: 'रेशम कोकून', price: 450, unit: 'kg', location: 'Ramanagara, KA', seller: 'Lakshmi Devi', bids: 2, topBid: 470 },
  { id: 4, name: 'Fresh Fish', nameHi: 'ताज़ी मछली', price: 280, unit: 'kg', location: 'Kochi, KL', seller: 'Thomas Mathew', bids: 4, topBid: 300 },
  { id: 5, name: 'Handloom Sarees', nameHi: 'हथकरघा साड़ी', price: 2500, unit: 'piece', location: 'Varanasi, UP', seller: 'Anwar Khan', bids: 1, topBid: 2600 },
];

// Languages
const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
];

// Quick translation phrases
const quickPhrases = [
  'आज टमाटर का भाव क्या है?',
  'मुझे 50 किलो चावल चाहिए',
  'What is the price?',
  'I want to buy rice',
];
```

---

## STYLING REQUIREMENTS

**Color Scheme (STRICT):**
- Primary: #FF9933 (Orange/Saffron)
- Secondary: #138808 (Green)
- Background: #FFFFFF (White)
- Surface: #F9FAFB (Light gray)
- Text: #1F2937 (Dark gray)
- Text Muted: #6B7280 (Medium gray)

**DO NOT USE:**
- Cream backgrounds with light text
- Complex theme switching
- Multiple regional themes

**Typography:**
- Use Inter or system fonts
- Ensure Hindi/Tamil/etc text is readable (use Noto Sans fonts)
- Good line height for Indian scripts

---

## IMPLEMENTATION ORDER

1. Fix globals.css to use simple high-contrast theme
2. Simplify or remove ThemeContext complexity
3. Build Homepage with translation panel
4. Build Vendor Dashboard
5. Build Buyer Dashboard
6. Test all pages for visibility and functionality

---

## SUCCESS CRITERIA

- [ ] All text is readable (no visibility issues)
- [ ] Homepage shows products and translation works
- [ ] Vendor dashboard shows products and bids
- [ ] Buyer dashboard shows search and bidding
- [ ] Navigation between pages works
- [ ] Translation panel demonstrates the feature
- [ ] Mobile responsive

---

## REMEMBER

This is a 24-hour hackathon. Focus on:
1. **Demo-ability** — Make it look functional and impressive
2. **The killer feature** — Translation panel that actually "translates" (mock is fine)
3. **Clean design** — High contrast, professional look
4. **Working navigation** — All pages accessible
