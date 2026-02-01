# 🌾 Ek Bharath Ek Mandi (एक भारत एक मंडी)

> **India's Voice-First Multilingual Trading Platform** — Breaking language barriers for 400M+ regional traders

[![AI for Bharat Challenge](https://img.shields.io/badge/AI%20for%20Bharat-26%20Jan%20Challenge-orange)](https://hack2skill.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org)
[![Built with AI](https://img.shields.io/badge/Built%20with-AI-purple)](https://hack2skill.com)

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

### Complete User Journey

**1. User Role Switching**
- Switch between 4 demo profiles (2 sellers, 2 buyers)
- Language auto-switches based on user preference
- Persistent user selection across sessions

**2. Seller Journey** (`/seller`)
- View incoming bids from buyers across India
- See original message + AI translation
- Accept/Reject bids with one click
- Track bid history and analytics

**3. Buyer Journey** (`/buyer`)
- Browse products in your language
- Place bids with custom messages
- Track bid status (pending/accepted/rejected)
- Chat with sellers

**4. Voice Chat** (`/chat/[id]`)
- Send voice messages in your language
- AI transcribes and translates automatically
- Recipient hears in their language
- Shows: Original → Transcription → Translation → Audio

**5. Product Creation** (`/seller/add-product`)
- Voice-first product listing
- AI categorization and price suggestions
- Photo upload with preview
- Multilingual product descriptions

---

## ✨ Features (Demo Ready)

| Feature | Status | Description |
|---------|--------|-------------|
| 🌐 **8-Language UI** | ✅ | Hindi, Tamil, Telugu, Kannada, Bengali, Odia, Malayalam, English |
| 👥 **User Switching** | ✅ | Seamless role switching with auto-language |
| 🛒 **Product Marketplace** | ✅ | Browse products with category filters |
| 💰 **Bidding System** | ✅ | Place bids, track status, accept/reject |
| 👨‍🌾 **Seller Dashboard** | ✅ | Manage incoming bids, view analytics |
| 🛍️ **Buyer Dashboard** | ✅ | Track bids, view order history |
| 💬 **Voice Chat UI** | ✅ | Voice recording + translation display |
| 🎤 **Voice Product Creation** | ✅ | Voice-first listing with AI assistance |
| 🔔 **Real-time Notifications** | ✅ | Bid updates and status changes |
| 📱 **Responsive Design** | ✅ | Works on mobile, tablet, desktop |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **State Management** | React Context (BiddingContext, LanguageContext, DemoUserContext) |
| **Styling** | Tailwind CSS with custom gradients and animations |
| **i18n** | Custom LanguageContext with 8 languages |
| **UI Components** | Custom components (Navbar, UserSwitcher, VoiceMessage) |
| **Demo System** | DemoUserContext for role switching |

---

## 🔮 AWS AI Integration (Planned)

### Phase 2: Voice Translation Pipeline
```
User Voice (Hindi) 
    ↓
AWS Transcribe (Speech-to-Text)
    ↓
AWS Translate (Hindi → Tamil)
    ↓
AWS Polly (Text-to-Speech in Tamil)
    ↓
Recipient hears in Tamil
```

### Phase 3: AI Intelligence
- **Amazon Bedrock** — Context-aware translation with cultural nuances
- **Bedrock Knowledge Base** — RAG for APMC price data
- **Bedrock Agents** — Negotiation assistance

### Phase 4: Production Features
- **AWS DynamoDB** — Scalable data storage
- **AWS S3** — Media storage (voice, images)
- **AWS Lambda** — Serverless API
- **AWS API Gateway** — RESTful endpoints
- **AWS Cognito** — User authentication

---

## 🏃 Quick Start

```bash
# Clone the repository
git clone https://github.com/Mudassir41/one4all_ek_mandi.git
cd one4all_ek_mandi

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Demo Instructions

**No authentication required!** Just:

1. **Visit Homepage** (`/`) — Browse products
2. **Switch User** — Click user dropdown (top right)
3. **Select Profile:**
   - **Sellers:** Ravi Kumar (Tamil), Gurpreet Singh (Hindi)
   - **Buyers:** Amit Sharma (Hindi), Lakshmi Enterprises (Kannada)
4. **Explore Dashboards:**
   - `/seller` — Manage incoming bids
   - `/buyer` — Track your bids
   - `/chat/demo` — Voice chat interface
5. **Switch Languages** — Use language dropdown (8 languages)

---

## 📁 Project Structure

```
mandi/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage with products
│   │   ├── seller/page.tsx             # Seller dashboard
│   │   ├── buyer/page.tsx              # Buyer dashboard
│   │   ├── chat/[id]/page.tsx          # Voice chat interface
│   │   ├── seller/add-product/page.tsx # Product creation
│   │   └── layout.tsx                  # Root layout
│   ├── components/
│   │   └── ui/
│   │       ├── Navbar.tsx              # Navigation with role-based links
│   │       ├── UserSwitcher.tsx        # User profile switcher
│   │       ├── VoiceMessage.tsx        # Voice recording components
│   │       └── InteractiveHomepage.tsx # Main marketplace
│   └── contexts/
│       ├── BiddingContext.tsx          # Bid state management
│       ├── LanguageContext.tsx         # i18n with 8 languages
│       └── DemoUserContext.tsx         # User role switching
```

---

## 🎯 Target Users

| User Type | Need | Solution |
|-----------|------|----------|
| **Farmers/Artisans** | Fair prices, wider market | Direct access to national buyers |
| **B2B Buyers** | Quality sourcing across India | Multilingual negotiation |
| **B2C Consumers** | Authentic local products | Transparent pricing |
| **Low Literacy Users** | Easy-to-use interface | Voice-first interaction |

---

## 🏆 AI for Bharat Challenge

This project addresses the **"Multilingual Mandi"** challenge track:
> *"Use AI to break language barriers and enable seamless commerce across India's diverse linguistic landscape."*

### Key Innovation
- **Voice-First Design** — Optimized for users with low digital literacy
- **Real-Time Translation** — Speak in your language, they hear in theirs
- **Cultural Sensitivity** — UI adapts to regional preferences
- **Economic Inclusion** — Removes language barriers to digital commerce

---

## 📊 Impact Potential

| Metric | Value |
|--------|-------|
| **Target Users** | 400M+ regional traders in India |
| **Languages Supported** | 8 Indian languages (expandable to 22+) |
| **Market Size** | ₹15 lakh crore agricultural trade |
| **Middleman Margin Saved** | 40-60% (directly to farmers) |
| **States Connected** | All 28 states + 8 UTs |

---

## 🎥 Video Demo

**Submission for AI for Bharat Hackathon**
- Duration: < 5 minutes
- Shows: Complete user flow across seller and buyer roles
- Highlights: Multilingual UI, voice translation, bidding system
- Deadline: Sunday, 1st February 2026

---

## 👨‍💻 Team

**Built with AI for AI for Bharat 26 Jan Challenge**

*Leveraging AI to break language barriers and enable economic inclusion for millions of Indian traders.*
