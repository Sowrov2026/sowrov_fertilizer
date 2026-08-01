# SF AI — Critical Issues Report

**Date:** 2025-08-01
**Status:** FIXED — All 7 critical issues resolved

---

## Critical Issues (All Fixed)

### 1. Firebase Database Wide Open
- **Severity:** CRITICAL
- **File:** firestore.rules, firebase.json
- **Issue:** Both files are empty (0 bytes). No security rules deployed.
- **Impact:** Any client can read, write, delete all data
- **Fix:** Deploy proper Firestore rules (see firestore.rules)

### 2. API Gateway JWT Bypass
- **Severity:** CRITICAL
- **File:** v22-api-gateway.js:362-366
- **Issue:** JWT verification accepts any token ≥10 characters
- **Impact:** Unauthenticated access to all protected endpoints
- **Fix:** Now calls `verifyToken()` from v22-auth.js

### 3. JWT Timing Attack
- **Severity:** CRITICAL
- **File:** v22-auth.js:78
- **Issue:** String equality leaks timing information
- **Impact:** Attacker can brute-force JWT signature
- **Fix:** Now uses `crypto.timingSafeEqual()`

### 4. Payment Verification Fake
- **Severity:** CRITICAL
- **File:** v22-payment.js:127-135
- **Issue:** `verifyPayment()` always returns `{ verified: true }`
- **Impact:** Anyone can claim payment was made
- **Fix:** Now returns `{ verified: false }` with warning

### 5. JWT Secret Fallback
- **Severity:** CRITICAL
- **File:** v22-auth.js:6
- **Issue:** Random key generated per cold start
- **Impact:** All tokens invalidated on cold start
- **Fix:** Now fails hard if JWT_SECRET not set

### 6. API Key Generation Unauthenticated
- **Severity:** CRITICAL
- **File:** v22-api-gateway.js:490-497
- **Issue:** Anyone can generate API keys
- **Impact:** Unauthorized API access
- **Fix:** Now requires admin JWT authentication

### 7. Rate Limit Clear Unauthenticated
- **Severity:** CRITICAL
- **File:** v22-api-gateway.js:525-531
- **Issue:** Anyone can clear rate limits
- **Impact:** Rate limiting bypassed
- **Fix:** Now requires admin authentication

---

## High Issues (Partially Fixed)

### 8. Wildcard CORS
- **Severity:** HIGH
- **File:** chat.js:423, v22-api-gateway.js:341
- **Issue:** `Access-Control-Allow-Origin: *`
- **Status:** FIXED — Restricted to `https://sowrov2026.github.io`

### 9. Rate Limit IP Spoofing
- **Severity:** HIGH
- **File:** chat.js:437
- **Issue:** `x-forwarded-for` is client-controllable
- **Status:** FIXED — Uses Netlify's trusted `client-ip` header

### 10. In-Memory State Loss
- **Severity:** HIGH
- **File:** Multiple (v22-auth.js, v22-api-gateway.js, chat.js)
- **Issue:** All state lost on cold start
- **Status:** DOCUMENTED — Requires Firebase Firestore migration

### 11. CDN Without SRI
- **Severity:** HIGH
- **File:** ai.js:109,120,125
- **Issue:** Font Awesome, marked.js, DOMPurify loaded without SRI
- **Status:** DOCUMENTED — Requires SRI hash addition

### 12. Session ID Based on IP
- **Severity:** HIGH
- **File:** chat.js:478
- **Issue:** Session keyed by spoofable IP
- **Status:** DOCUMENTED — Requires JWT-based sessions

---

## Summary

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| CRITICAL | 7 | 7 | 0 |
| HIGH | 5 | 2 | 3 |
| MEDIUM | 8 | 1 | 7 |
| LOW | 5 | 2 | 3 |
| **Total** | **25** | **12** | **13** |

All critical issues have been fixed. High issues require Firebase migration and environment configuration.
