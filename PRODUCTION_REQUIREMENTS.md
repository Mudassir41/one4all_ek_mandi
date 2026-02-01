# Multilingual Mandi — What's Needed for Production

## 🎯 Core Product Gaps (Priority Order)

### 1. 🔐 Authentication & Authorization
| Feature | Status | Effort |
|---------|--------|--------|
| Phone OTP login | Mock only | Backend needed |
| User profiles (buyer/seller) | ❌ | Database + UI |
| Session management | ❌ | JWT/cookies |
| Role-based access | ❌ | Middleware |

### 2. 📦 Product Management
| Feature | Status | Effort |
|---------|--------|--------|
| CRUD products | Mock form only | API + DB |
| Image upload to S3 | ❌ | AWS integration |
| Category management | Mock | Database |
| Search & filters | ❌ | Elasticsearch/DB |
| Product detail page `/product/[id]` | ❌ | New page |

### 3. 💬 Communication
| Feature | Status | Effort |
|---------|--------|--------|
| Real-time chat | ❌ | WebSocket/Firebase |
| Voice messages | ❌ | Audio recording + S3 |
| Push notifications | ❌ | Firebase/OneSignal |
| Chat translation | ❌ | AWS Translate |

### 4. 🌐 Translation System
| Feature | Status | Effort |
|---------|--------|--------|
| UI text translations | Partial (EN/HI/TA) | i18n files |
| Message translation | Mock | AWS Translate API |
| Voice-to-text | ❌ | AWS Transcribe |
| Text-to-speech | ❌ | AWS Polly |

### 5. 💰 Bidding & Transactions
| Feature | Status | Effort |
|---------|--------|--------|
| Place bid (client-side) | ✅ | — |
| Accept/reject bid | ✅ | — |
| Counter offers | Mock | API |
| Payment integration | ❌ | Razorpay/UPI |
| Escrow system | ❌ | Backend logic |
| Order tracking | ❌ | New page |

### 6. 📊 Analytics & Insights
| Feature | Status | Effort |
|---------|--------|--------|
| Seller dashboard stats | Mock | Real data |
| Price trends | ❌ | Historical data |
| Buyer insights | ❌ | Analytics |

---

## 🛠️ Technical Debt

1. **TypeScript Errors** — Fix type mismatches in contexts
2. **API Routes** — Create `/api/*` endpoints
3. **Database** — Set up DynamoDB or Postgres
4. **Error Handling** — Global error boundary
5. **Loading States** — Skeleton screens
6. **Responsive Design** — Test on mobile
7. **PWA Support** — Offline capability
8. **SEO** — Meta tags, OpenGraph

---

## 📱 Missing UI Pages

| Page | Route | Description |
|------|-------|-------------|
| Product Detail | `/product/[id]` | Full product info, seller, place bid |
| Chat | `/chat/[bidId]` | Message thread with translation |
| Search Results | `/search` | Filtered product list |
| Order Detail | `/order/[id]` | Tracking, status |
| Profile | `/profile` | User settings |
| Checkout | `/checkout` | Payment flow |

---

## 🏃 Immediate Next Steps (For Kiro)

1. Fix remaining TypeScript errors
2. Create `/product/[id]` page
3. Implement real search functionality
4. Add loading skeletons
5. Create chat UI mockup
6. Test responsive design

---

## 🎯 Summary

**Hackathon MVP: 70% Complete**
- ✅ Core UI pages working
- ✅ Bidding flow end-to-end (client-side)
- ✅ Language switching
- ❌ Real backend missing
- ❌ Authentication mock only
- ❌ No persistent data
