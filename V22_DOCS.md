# SF AI V22 Enterprise Platform Documentation

> Version 22.0.0 | Bangladesh Agriculture Enterprise Platform
> Last Updated: August 2026

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [API Reference](#3-api-reference)
4. [Payment Integration](#4-payment-integration)
5. [Shipping Integration](#5-shipping-integration)
6. [Notification System](#6-notification-system)
7. [Real-time Features](#7-real-time-features)
8. [Business Analytics](#8-business-analytics)
9. [AI Insights](#9-ai-insights)
10. [Deployment](#10-deployment)
11. [Security](#11-security)
12. [Scalability](#12-scalability)
13. [Monitoring](#13-monitoring)

---

## 1. Architecture Overview

### 1.1 Multi-Tenant Architecture

SF AI V22 operates on a multi-tenant model where each organization (dealer, retailer, wholesaler) is isolated via `tenantId`. Tenant data is partitioned at the application layer using Firestore collection groups and query filters.

```
┌─────────────────────────────────────────────────┐
│                   SF AI V22                     │
├──────────┬──────────┬──────────┬────────────────┤
│ Tenant A │ Tenant B │ Tenant C │   Tenant N     │
│ Dealer   │ Retailer │ Wholesal │   Admin        │
└──────────┴──────────┴──────────┴────────────────┘
         │          │          │
    ┌────▼────┐┌────▼────┐┌────▼────┐
    │ Firestore││ Firestore││ Firestore│  (Partitioned by tenantId)
    └─────────┘└─────────┘└─────────┘
```

### 1.2 Microservices Design

Each V22 backend module is an independent Netlify Function:

| Service | Function | Responsibility |
|---------|----------|---------------|
| Auth | `v22-auth.js` | JWT, roles, user CRUD |
| Orders | `v22-order.js` | Order lifecycle management |
| Payments | `v22-payment.js` | Multi-provider payment routing |
| Shipping | `v22-shipping.js` | Courier integration & tracking |
| Notifications | `v22-notification.js` | Multi-channel delivery |
| Live Chat | `v22-livechat.js` | Real-time messaging |
| Analytics | `v22-analytics.js` | Business intelligence |
| AI Insights | `v22-insights.js` | Predictive analytics |
| API Gateway | `v22-api-gateway.js` | Rate limiting, keys, OpenAPI |

### 1.3 Event-Driven Architecture

Frontend modules emit events that trigger backend processing. Analytics events are batched and flushed asynchronously to avoid blocking the UI thread.

```javascript
// Event flow
SFEnterprise.createOrder(data)
  → POST /.netlify/functions/v22-order
  → Order created event emitted
  → Notification triggered (v22-notification)
  → Analytics tracked (v22-analytics)
  → Real-time broadcast (WebSocket / polling)
```

### 1.4 CQRS Pattern

Read and write operations are separated. Commands (create, update, delete) go through validation middleware. Queries return cached results when possible.

```
Command Side                  Query Side
─────────────                 ──────────
POST /v22-order               GET /v22-order?action=list
  → validate                   → check cache
  → persist                    → query Firestore
  → emit event                 → return cached result
```

---

## 2. Authentication & Authorization

### 2.1 JWT + Refresh Token Flow

```
┌──────────┐     POST /v22-auth?action=login     ┌──────────┐
│  Client  │ ──────────────────────────────────▶  │  Server  │
│          │                                      │          │
│          │ ◀──── { accessToken, refreshToken }  │          │
│          │                                      │          │
│          │     GET /v22-auth (Bearer token)     │          │
│          │ ──────────────────────────────────▶  │          │
│          │ ◀──── { user data }                  │          │
│          │                                      │          │
│          │     POST /v22-auth?action=refresh    │          │
│          │ ──────────────────────────────────▶  │          │
│          │ ◀──── { new accessToken }            │          │
└──────────┘                                      └──────────┘
```

**Token Details:**
- Access Token: 15-minute expiry (HS256 signed)
- Refresh Token: 7-day expiry (cryptographic random)
- Token rotation on each refresh

### 2.2 User Roles (7 Levels)

| Role | Level | Description | Key Permissions |
|------|-------|-------------|-----------------|
| `super_admin` | 100 | সুপার অ্যাডমিন | `*` (all) |
| `admin` | 80 | অ্যাডমিন | `users:*`, `products:*`, `orders:*`, `inventory:*`, `reports:*`, `settings:*` |
| `officer` | 60 | কৃষি কর্মকর্তা | `users:view`, `products:*`, `orders:view`, `inventory:*`, `reports:view` |
| `wholesaler` | 35 | পাইকারি | `products:view`, `orders:own`, `inventory:own`, `bulk:own` |
| `dealer` | 40 | ডিলার | `products:view`, `orders:own`, `inventory:own`, `customers:own` |
| `retailer` | 30 | রিটেইলার | `products:view`, `orders:own`, `inventory:own` |
| `farmer` | 10 | কৃষক | `chat:own`, `products:view`, `orders:own`, `farm:own` |

### 2.3 Permission Matrix

| Resource | super_admin | admin | officer | wholesaler | dealer | retailer | farmer |
|----------|:-----------:|:-----:|:-------:|:----------:|:------:|:--------:|:------:|
| Users CRUD | ✅ | ✅ | view | ❌ | ❌ | ❌ | ❌ |
| Products CRUD | ✅ | ✅ | ✅ | view | view | view | view |
| Orders CRUD | ✅ | ✅ | view | own | own | own | own |
| Inventory | ✅ | ✅ | ✅ | own | own | own | ❌ |
| Reports | ✅ | ✅ | view | ❌ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | own |
| AI Insights | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Farm Data | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | own |

### 2.4 API Key Authentication

API keys are generated via `v22-api-gateway.js` and passed via `X-API-Key` header. Keys support granular permissions and automatic expiry.

```
Header: X-API-Key: sf_a1b2c3d4e5f6...
```

---

## 3. API Reference

### 3.1 REST Endpoints

Base URL: `/.netlify/functions`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|:-------------:|
| `/v22-auth?action=login` | POST | User login | No |
| `/v22-auth?action=register` | POST | User registration | No |
| `/v22-auth?action=refresh` | POST | Refresh access token | Yes (refresh) |
| `/v22-auth` | GET | Get current user profile | Yes |
| `/v22-auth` | PUT | Update user profile | Yes |
| `/v22-order?action=create` | POST | Create new order | Yes |
| `/v22-order?action=list` | GET | List orders | Yes |
| `/v22-order?action=update` | POST | Update order status | Yes (officer+) |
| `/v22-order?action=stats` | GET | Order statistics | Yes (officer+) |
| `/v22-payment?action=create` | POST | Initiate payment | Yes |
| `/v22-payment?action=verify` | POST | Verify payment | Yes |
| `/v22-payment?action=refund` | POST | Process refund | Yes (admin+) |
| `/v22-shipping?action=create` | POST | Create shipment | Yes (officer+) |
| `/v22-shipping?action=track` | GET | Track shipment | Yes |
| `/v22-shipping?action=rates` | GET | Get courier rates | Yes |
| `/v22-notification` | GET | Get notifications | Yes |
| `/v22-notification` | POST | Create notification | Yes (admin+) |
| `/v22-notification?action=markRead` | POST | Mark as read | Yes |
| `/v22-notification?action=readAll` | POST | Mark all read | Yes |
| `/v22-livechat?action=createRoom` | POST | Create chat room | Yes |
| `/v22-livechat?action=send` | POST | Send message | Yes |
| `/v22-livechat?action=messages` | GET | Get messages | Yes |
| `/v22-livechat?action=typing` | POST | Typing indicator | Yes |
| `/v22-analytics?action=dashboard` | GET | Dashboard summary | Yes (officer+) |
| `/v22-analytics?action=sales` | GET | Sales analytics | Yes (officer+) |
| `/v22-analytics?action=users` | GET | User analytics | Yes (admin+) |
| `/v22-analytics?action=products` | GET | Product analytics | Yes (officer+) |
| `/v22-analytics?action=revenue` | GET | Revenue analytics | Yes (admin+) |
| `/v22-analytics?action=crops` | GET | Crop analytics | Yes |
| `/v22-insights?action=predictDemand` | POST | Demand prediction | Yes |
| `/v22-insights?action=predictDiseaseRisk` | POST | Disease risk | Yes |
| `/v22-insights?action=predictCropYield` | POST | Yield prediction | Yes |
| `/v22-insights?action=predictCropPrice` | POST | Price prediction | Yes |
| `/v22-insights?action=assessWeatherRisk` | POST | Weather risk | Yes |
| `/v22-insights?action=predictBusinessGrowth` | POST | Growth prediction | Yes (admin+) |
| `/v22-api-gateway?action=info` | GET | API info | No |
| `/v22-api-gateway?action=health` | GET | Health check | No |
| `/v22-api-gateway?action=openapi` | GET | OpenAPI spec | No |

### 3.2 Authentication Header

```
Authorization: Bearer <access_token>
```

### 3.3 Rate Limiting

Default limits per API key:

| Tier | Requests/min | Burst |
|------|:-----------:|:-----:|
| Free | 30 | 5 |
| Basic | 100 | 20 |
| Pro | 500 | 50 |
| Enterprise | 2000 | 200 |

Rate limit headers returned on every response:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1691234567
```

### 3.4 Error Codes

| Code | HTTP Status | Description |
|------|:-----------:|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `INVALID_TOKEN` | 401 | Invalid or expired JWT |
| `INVALID_API_KEY` | 401 | Invalid API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `SHIPPING_ERROR` | 502 | Shipping provider error |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 4. Payment Integration

### 4.1 SSLCommerz Setup

```javascript
// Environment variables required
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password

// Sandbox URL
https://sandbox.sslcommerz.com/gw-process/v4/

// Supported methods: card, mobile_banking, internet_banking
```

**Flow:**
1. Client sends order to `v22-payment`
2. Payment record created with `initiated` status
3. SSLCommerz gateway URL returned
4. Client redirects to SSLCommerz
5. After payment, callback updates status to `verified`

### 4.2 bKash Integration

```javascript
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret

// Flow: Tokenize → Create → Execute → Query
```

### 4.3 COD Handling

Cash on Delivery is handled internally — no external API call. Payment status set to `confirmed` immediately with a `COD-{timestamp}` transaction ID.

```javascript
// COD auto-confirmed
payment.status = 'confirmed';
payment.transactionId = 'COD-' + Date.now();
```

---

## 5. Shipping Integration

### 5.1 SteadFast API

```javascript
STEADFAST_API_KEY=your_api_key
STEADFAST_API_SECRET=your_api_secret

// API: https://api.steadfast.com.bd/v1
// Coverage: ঢাকা, চাটগ্রাম, রাজশাহী, খুলনা, সিলেট, বরিশাল, রংপুর
```

**Tracking Number Format:** `SF{timestamp}` (e.g., `SF1A2B3C4D`)

### 5.2 Pathao Courier

```javascript
PATHAO_API_KEY=your_api_key
// Coverage: ঢাকা, চাটগ্রাম
// Tracking: PT{timestamp}
```

### 5.3 RedX

```javascript
REDX_API_KEY=your_api_key
// Coverage: ঢাকা, চাটগ্রাম, রাজশাহী
// Tracking: RX{timestamp}
```

### 5.4 Paperfly

```javascript
PAPERFLY_API_KEY=your_api_key
// Coverage: ঢাকা
// Tracking: PF{timestamp}
```

### 5.5 Rate Calculation

| Courier | Base (৳) | Per kg (৳) | COD Fee (%) |
|---------|:--------:|:----------:|:-----------:|
| SteadFast | 60 | 10 | 1.0% |
| Pathao | 80 | 15 | 1.5% |
| RedX | 70 | 12 | 1.0% |
| Paperfly | 75 | 13 | 1.0% |

---

## 6. Notification System

### 6.1 Push Notifications

Firebase Cloud Messaging (FCM) integration for browser push notifications.

```javascript
// Service Worker registration
navigator.serviceWorker.register('/sw.js');
// FCM token stored per user in Firestore
```

### 6.2 SMS Gateway

Twilio-based SMS delivery for order updates, OTPs, and alerts.

**Templates:**
- `order_placed` — অর্ডার গৃহীত হয়েছে
- `order_shipped` — অর্ডার পাঠানো হয়েছে
- `order_delivered` — অর্ডার ডেলিভারি হয়েছে
- `payment_received` — পেমেন্ট গৃহীত

### 6.3 Email Templates

SendGrid integration for transactional emails (order confirmation, invoices, weekly reports).

### 6.4 WhatsApp / Telegram

Optional integrations via WhatsApp Business API and Telegram Bot API.

### 6.5 User Preferences

```javascript
// Per-user notification settings
{
  enabled: true,
  channels: ['push', 'sms', 'system']
}
```

---

## 7. Real-time Features

### 7.1 Live Chat

Chat rooms support three types:
- **Direct** — 1:1 customer-support
- **Group** — Team collaboration
- **Support** — Customer service queue

### 7.2 Typing Indicators

```javascript
// Client sends typing status
SFEnterprise.sendMessage(roomId, { typing: true });
// Server auto-expires after 5 seconds
// Other participants receive typing event
```

### 7.3 Read Receipts

Messages track `readBy` array. Status transitions: `sent` → `delivered` → `read`.

### 7.4 Real-time Database

Firebase Realtime Database for live updates. Client-side listeners receive push events for:
- New messages
- Order status changes
- Inventory updates
- Price changes

---

## 8. Business Analytics

### 8.1 Dashboard Metrics

```javascript
// GET /v22-analytics?action=dashboard
{
  totalOrders: 1250,
  totalRevenue: 4850000,
  totalUsers: 340,
  totalProducts: 85,
  pendingOrders: 12,
  lowStockItems: 5,
  todayOrders: 18,
  todayRevenue: 72000
}
```

### 8.2 Sales Analytics

Period-based analysis: `day`, `week`, `month`, `year`.

Returns: total sales, orders, average order value, conversion rate, top products, sales by day, sales by category.

### 8.3 User Analytics

- Total users, active users (30-day), new users
- Users by role breakdown
- Users by district (geographic distribution)
- Returning user rate

### 8.4 Crop Analytics

- Popular crops by order volume
- Crop demand by district
- Seasonal trend analysis
- Monthly crop activity

### 8.5 Revenue Analytics

- Total revenue vs expenses
- Net profit and margin calculation
- Monthly revenue breakdown
- Expense categories

---

## 9. AI Insights

### 9.1 Demand Prediction

Weighted moving average with seasonal adjustment for Bangladesh agriculture cycles.

```javascript
// Input: 7+ days of product history
// Output: predicted quantity, confidence %, trend, recommendation
{
  prediction: 450,
  confidence: 78,
  trend: "increasing",
  recommendation: "increase_stock",
  seasonalFactor: 1.3
}
```

### 9.2 Disease Risk

Multi-factor risk assessment using crop type, season, humidity, temperature, rainfall, and wind data.

```javascript
// Risk levels: low, medium, high
// Factors weighted: humidity (25%), temp (20%), rainfall (20%), season (20%), crop (10%), wind (5%)
{
  riskLevel: "high",
  riskScore: 72,
  recommendations: ["প্রতিরোধমূলক স্প্রে করুন", "সংক্রমিত গাছ সরিয়ে ফেলুন"]
}
```

### 9.3 Yield Prediction

Per-acre yield estimation factoring weather, soil quality, irrigation, and fertilizer usage.

```javascript
// Supports: ধান (22/acre), গম (10/acre), ভুট্টা (15/acre), আলু (40/acre), etc.
{
  expectedYield: 1100,
  yieldPerAcre: 22,
  confidence: 75,
  financials: { totalProfit: 185000 }
}
```

### 9.4 Price Prediction

SMA, EMA, and momentum analysis for crop price forecasting.

```javascript
{
  crop: "ধান",
  predictedPrice: 42,
  trend: "rising",
  recommendation: "buy",
  confidence: 70,
  priceRange: { min: 38, max: 46 }
}
```

### 9.5 Weather Risk Assessment

Comprehensive weather risk analysis covering flood, storm, drought, frost, fungal, and UV risks.

### 9.6 Business Growth Prediction

Linear regression with R-squared trend analysis for 6-month business forecasting.

---

## 10. Deployment

### 10.1 Netlify Deployment

```toml
# netlify.toml
[build]
  functions = "netlify/functions"
  publish = "."

[[redirects]]
  from = "/.netlify/functions/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 10.2 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 10.3 Environment Variables

**Required:**

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Secret key for JWT signing (64-byte hex) |
| `FIREBASE_CONFIG` | Firebase project configuration |
| `STEADFAST_API_KEY` | SteadFast courier API key |
| `STEADFAST_API_SECRET` | SteadFast courier API secret |
| `SSLCOMMERZ_STORE_ID` | SSLCommerz store ID |
| `SSLCOMMERZ_STORE_PASSWORD` | SSLCommerz store password |

**Optional:**

| Variable | Description |
|----------|-------------|
| `BKASH_APP_KEY` | bKash app key |
| `BKASH_APP_SECRET` | bKash app secret |
| `PATHAO_API_KEY` | Pathao courier API key |
| `REDX_API_KEY` | RedX courier API key |
| `PAPERFLY_API_KEY` | Paperfly courier API key |
| `TWILIO_SID` | Twilio account SID |
| `TWILIO_TOKEN` | Twilio auth token |
| `SENDGRID_API_KEY` | SendGrid API key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |

---

## 11. Security

### 11.1 JWT Implementation

- **Algorithm:** HMAC-SHA256 (HS256)
- **Access Token TTL:** 15 minutes
- **Refresh Token TTL:** 7 days
- **Signing:** 64-byte cryptographically random secret

```javascript
// Token structure
{
  header: { alg: "HS256", typ: "JWT" },
  payload: {
    id: "user_id",
    email: "user@email.com",
    role: "farmer",
    tenantId: "default",
    iat: 1691234567,
    exp: 1691235467
  }
}
```

### 11.2 Encryption (AES-GCM)

Sensitive data encrypted at rest using AES-256-GCM with unique IV per record. Used for:
- API keys storage
- Payment credentials
- Personal identification numbers

### 11.3 Rate Limiting

Per-identifier sliding window rate limiting:

```javascript
// Headers returned
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1691234567
Retry-After: 30  // Only on 429
```

### 11.4 Audit Logging

Every API request logged with:
- Timestamp
- Method, path, status
- Response duration
- IP address, User-Agent
- Authenticated user ID

Logs retained: 1000 most recent entries (production uses CloudWatch/Grafana).

### 11.5 Input Sanitization

```javascript
// XSS prevention
sanitizeInput('<script>alert("xss")</script>') → "scriptalert(xss)/script"

// SQL/NoSQL injection prevention
validateBody(body, { required: ['email', 'password'] })
```

---

## 12. Scalability

### 12.1 Code Splitting

Frontend JavaScript modules are lazy-loaded per page:

```javascript
// Only load what's needed
if (window.location.pathname.includes('admin')) {
  import('./v22-admin-enterprise.js');
}
```

### 12.2 Lazy Loading

Dashboard components render on-demand:

```javascript
SFEnterprise.createEnterpriseDashboard('container');
// Only fetches analytics data when user scrolls to that section
```

### 12.3 Caching Strategies

| Layer | TTL | Strategy |
|-------|-----|----------|
| Browser | 5 min | Service Worker cache |
| CDN | 1 hour | Static asset caching |
| API Response | 15 min | Redis/in-memory |
| Firestore | Real-time | Sync listener |

### 12.4 Queue System

Background job processing for:
- Bulk notification dispatch
- Analytics event aggregation
- Email batch sending
- Report generation

```javascript
// Queue priorities
const QUEUE_PRIORITY = {
  critical: 0,   // Payment confirmations
  high: 1,       // Order status updates
  medium: 2,     // Notifications
  low: 3,        // Analytics batch
};
```

---

## 13. Monitoring

### 13.1 Health Checks

```javascript
// GET /v22-api-gateway?action=health
{
  status: "healthy",
  version: "22.0.0",
  uptime: 86400,
  timestamp: "2026-08-01T00:00:00Z",
  apiKeys: 45,
  rateLimits: 120,
  requestLogs: 8500
}
```

### 13.2 API Metrics

Tracked per endpoint:
- Request count
- Average response time
- Error rate (4xx, 5xx)
- P95/P99 latency

### 13.3 Error Tracking

All errors captured with:
- Stack trace
- Request context
- User ID
- Timestamp
- Severity level

### 13.4 Usage Statistics

```javascript
// GET /v22-api-gateway?action=usage
{
  totalApiKeys: 45,
  activeApiKeys: 38,
  totalRequests: 125000,
  recentRequests: [...],
  rateLimits: 120
}
```

---

## Appendix: File Reference

| File | Lines | Description |
|------|:-----:|-------------|
| `netlify/functions/v22-auth.js` | 168 | Authentication & user management |
| `netlify/functions/v22-order.js` | 94 | Order lifecycle |
| `netlify/functions/v22-payment.js` | 170 | Multi-provider payments |
| `netlify/functions/v22-shipping.js` | 115 | Courier integration |
| `netlify/functions/v22-notification.js` | 228 | Multi-channel notifications |
| `netlify/functions/v22-livechat.js` | 149 | Real-time chat |
| `netlify/functions/v22-analytics.js` | 422 | Business analytics |
| `netlify/functions/v22-insights.js` | 527 | AI predictive analytics |
| `netlify/functions/v22-api-gateway.js` | 563 | API gateway & OpenAPI |
| `assets/js/v22-integration.js` | — | Frontend enterprise hub |
| `assets/js/v22-admin-enterprise.js` | — | Admin panel |

---

*SF AI Enterprise Platform — Empowering Bangladesh Agriculture*
