# 🌾 Ek Bharath Ek Mandi (एक भारत एक मंडी)

> **India's Voice-First Multilingual Trading Platform** — Breaking language barriers for 400M+ regional traders

[![AI for Bharat Challenge](https://img.shields.io/badge/AI%20for%20Bharat-26%20Jan%20Challenge-orange)](https://hack2skill.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org)

---

## 🎯 The Problem

**India's ₹15 lakh crore agricultural trade is fragmented by language.**

| Reality | Impact |
|---------|--------|
| 22 official languages, 19,500+ dialects | Cross-state trade is nearly impossible |
| 86% of farmers speak only regional languages | Can't negotiate with buyers from other states |
| Middlemen take 40-60% margins | Due to communication barriers |

**Example:** A Tamil farmer growing premium tomatoes can't directly negotiate with a Hindi-speaking restaurant owner in Delhi — losing potential income to middlemen.

---

## 💡 Our Solution

**AI-powered real-time translation** enabling seamless trade across language barriers.

```
Tamil Farmer → "நல்ல தக்காளி, கிலோ 45 ரூபாய்"
                     ↓ AI Translation
Hindi Buyer  ← "अच्छे टमाटर, ₹45/किलो"
                     ↓
                 Successful Trade! 🤝
```

---

## 🚀 Demo Walkthrough

### Flow 1: Buyer Places Bid
1. **Homepage** (`/`) — Browse products, switch UI language
2. **Product Card** — View tomatoes from Tamil Nadu seller
3. **Place Bid** — Hindi buyer submits: `"मुझे 50 किलो चाहिए"` (I need 50 kg)

### Flow 2: Seller Receives & Responds
1. **Seller Dashboard** (`/seller`) — See incoming bids with translation
2. **Translation Panel** — Original: `"मुझे 50 किलो चाहिए"` → Translated: `"I need 50 kg"`
3. **Accept/Reject/Counter** — Respond in your own language

### Flow 3: Buyer Tracks Status
1. **Buyer Dashboard** (`/buyer`) — Track all bids
2. **Status Updates** — See ✅ Accepted / ⏳ Pending / ❌ Rejected
3. **Proceed** — Payment & delivery coordination

---

## ✨ Features (MVP)

| Feature | Status |
|---------|--------|
| 🌐 8-language UI (Hindi, Tamil, Telugu, Kannada, Bengali, Odia, Malayalam, English) | ✅ |
| 🛒 Product marketplace with categories | ✅ |
| 💰 Bidding system with real-time translation | ✅ |
| 👨‍🌾 Seller dashboard with bid management | ✅ |
| 🛍️ Buyer dashboard with bid tracking | ✅ |
| 🔄 Language switcher in all pages | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **State** | React Context (BiddingContext, I18nContext) |
| **Styling** | Tailwind CSS with responsive design |
| **i18n** | Custom i18n infrastructure for 8 languages |

---

## 🔮 Future Roadmap

### Phase 2: Voice-First
- Silero VAD (Voice Activity Detection)
- AWS Transcribe (Speech-to-Text)
- AWS Polly (Text-to-Speech)

### Phase 3: AI Intelligence
- Amazon Bedrock for context-aware translation
- Pydantic AI agents for negotiation assistance

### Phase 4: Production
- XGBoost price prediction (trained on APMC data)
- UPI payments via Razorpay
- Logistics integration (Dunzo, Porter)

---

## 🏃 Quick Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/multilingual-mandi.git
cd multilingual-mandi/mandi

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Demo Credentials
This is a UI mockup demo — no authentication required. Simply:
1. Visit `/` for homepage
2. Visit `/seller` for seller dashboard
3. Visit `/buyer` for buyer dashboard

---

## 📁 Project Structure

```
mandi/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Homepage with products
│   │   ├── seller/page.tsx   # Seller dashboard
│   │   ├── buyer/page.tsx    # Buyer dashboard
│   │   └── layout.tsx        # Root layout
│   ├── components/
│   │   └── ui/               # Reusable UI components
│   └── contexts/
│       ├── BiddingContext.tsx  # Shared bid state
│       └── I18nContext.tsx     # Language switching
```

---

## 🎯 Target Users

| User Type | Need | Solution |
|-----------|------|----------|
| **Farmers/Artisans** | Fair prices, wider market | Direct access to national buyers |
| **B2B Buyers** | Quality sourcing across India | Multilingual negotiation |
| **B2C Consumers** | Authentic local products | Transparent pricing |

---

## 🏆 AI for Bharat Challenge

This project addresses the **"Multilingual Mandi"** challenge track:
> *"Use AI to break language barriers and enable seamless commerce across India's diverse linguistic landscape."*

**AWS Services (Planned):**
- Amazon Transcribe — Regional language STT
- Amazon Bedrock — Context-aware translation
- Amazon Polly — Natural TTS in Indian languages

---

## 👨‍💻 Team

Built with AI for AI for Bharat 26 Jan Challenge

---
