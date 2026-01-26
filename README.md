# Ek Bharath Ek Mandi (एक भारत एक मंडी)

India's Voice-First Cross-State Trading Platform

## Project Overview

Ek Bharath Ek Mandi is a revolutionary web platform that connects regional vendors with national buyers (both B2B and B2C) through real-time AI voice translation, live bidding, price discovery, and multilingual negotiation tools. The platform aims to break language barriers in India's local trade sectors including agriculture, sericulture, handicrafts, and fisheries.

## Features

- 🎤 **Voice-First Interface**: Natural communication in regional languages
- 🌍 **Multi-Language Support**: 7+ Indian languages with real-time translation
- 🌾 **Cross-State Commerce**: Connect farmers, artisans, and buyers across India
- 💰 **AI-Powered Price Discovery**: Transparent market pricing with trend analysis
- 🏪 **Dual Market Support**: Both B2B wholesale and B2C retail transactions
- 📱 **Mobile-Responsive**: Optimized for smartphones and low-bandwidth networks

## Supported Languages

- हिंदी (Hindi)
- தமிழ் (Tamil)
- తెలుగు (Telugu)
- ಕನ್ನಡ (Kannada)
- বাংলা (Bengali)
- ଓଡ଼ିଆ (Odia)
- മലയാളം (Malayalam)
- English

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: AWS Lambda + API Gateway (planned)
- **Database**: DynamoDB (planned)
- **AI Services**: Amazon Bedrock, Transcribe, Polly (planned)
- **Storage**: S3 for media files (planned)
- **Search**: OpenSearch (planned)

## Getting Started

### Prerequisites

- Node.js 18.19.1 or higher
- npm 9.2.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ek-bharath-ek-mandi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
│   ├── config.ts      # Application configuration
│   └── utils.ts       # Common utility functions
├── types/             # TypeScript type definitions
├── hooks/             # Custom React hooks
└── services/          # API and external service integrations
```

## Development Roadmap

### Phase 1: Foundation (Hours 1-4) ✅
- [x] Initialize Next.js project with TypeScript
- [x] Set up basic project structure
- [x] Configure responsive design with Tailwind CSS
- [x] Create core type definitions
- [x] Set up utility functions and configuration

### Phase 2: Core Translation Services (Hours 5-8)
- [ ] Integrate Amazon Transcribe for speech-to-text
- [ ] Integrate Amazon Bedrock for context-aware translation
- [ ] Integrate Amazon Polly for text-to-speech
- [ ] Create translation service API
- [ ] Implement real-time communication

### Phase 3: Product & Search System (Hours 9-12)
- [ ] Build product management system
- [ ] Implement multilingual search engine
- [ ] Create vendor dashboard
- [ ] Build buyer interfaces (B2B and B2C)

### Phase 4: Bidding & Transaction System (Hours 13-16)
- [ ] Implement bidding system
- [ ] Create transaction management
- [ ] Build notification system

### Phase 5: AI-Powered Features (Hours 17-20)
- [ ] Integrate price discovery AI
- [ ] Implement smart recommendations
- [ ] Create AI chat assistant

### Phase 6: Testing & Deployment (Hours 21-24)
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Security implementation
- [ ] Production deployment

## Target Users

### Vendors (Primary Users)
- Farmers, artisans, fishers, producers across India
- Communicate in regional languages
- Seek fair prices and wider market reach

### B2B Buyers (Secondary Users)
- Wholesalers, traders, retailers from different states
- Source products from across India for resale
- Need efficient supplier discovery and negotiation

### B2C Buyers (Tertiary Users)
- Tourists, travelers, individual consumers
- Want authentic local products at fair prices
- Prefer simple, intuitive interfaces

## Contributing

This project is part of the AI for Bharat - 26 Jan Prompt Challenge. Development follows a 24-hour MVP sprint methodology.

## License

This project is developed for the AI for Bharat challenge and follows applicable open-source guidelines.

## Contact

For questions about this project, please refer to the challenge documentation or contact the development team.

---

**Status**: 🚧 MVP Development in Progress - 24 Hour Sprint
