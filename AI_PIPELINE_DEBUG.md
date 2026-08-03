# AI Pipeline Debug — V36 Cloudflare

**Date:** 2026-08-03
**Branch:** `main` (Cloudflare migration merged)
**Handler:** `functions/api/chat.js`

---

## CRITICAL BUG FOUND & FIXED

### Root Cause: `smartMemory.updateSession()` does not exist

**File:** `functions/api/chat.js:73`
**Bug:** `smartMemory.updateSession(sessionId, {...})` — method does not exist on SmartMemory class
**Effect:** Every request crashes AFTER the reply is computed, forcing the outer `catch` to return the generic emergency fallback

**Why it affected EVERY question:**
1. The full pipeline runs correctly: language detection → intent detection → knowledge search → Groq API call → reply computed
2. `finalAnswer` is set with the correct, knowledge-rich response
3. Line 73: `smartMemory.updateSession(...)` throws `TypeError: smartMemory.updateSession is not a function`
4. The outer `catch` in `onRequest` (line 115) catches the error
5. Returns `getEmergencyFallback('bangla')` — the same generic message every time
6. The computed `finalAnswer` (with actual knowledge) is **discarded**

**The SmartMemory class (`memory.js`) only has:**
- `getSession(sessionId)` ✅
- `updateFromMessage(sessionId, message, intentResult, languageResult)` ✅
- `getContextSummary(sessionId)`
- `shouldAsk(sessionId, questionType)`
- `cleanup()`
- `activeSessions()`

**There is NO `updateSession()` method.**

### Fix Applied

```javascript
// BEFORE (broken):
const session = smartMemory.getSession(sessionId);
smartMemory.updateSession(sessionId, { lastIntent: intent.primaryIntent, crop: intent.cropName || session.crop, language: lang, lastActivity: Date.now() });

// AFTER (fixed):
const session = smartMemory.getSession(sessionId);
try {
    smartMemory.updateFromMessage(sessionId, rawInput, intent, languageResult);
} catch (memErr) {
    console.warn('Memory update failed:', memErr.message);
}
```

Also added defensive try/catch around `setCachedAnswer` to prevent cache errors from crashing the response.

---

## Pipeline Stage-by-Stage Trace

### Stage 1: Entry Point (`chat.js:onRequest`)
- Cloudflare Pages Function receives POST to `/api/chat`
- CORS headers applied
- Body parsed: `{ messages: [...], sessionId: '...' }`
- `handleChatRequest(body, env)` called

### Stage 2: Language Detection (`language.js:processLanguage`)
- `detectLanguage()`: checks Unicode ranges (`\u0980-\u09FF` = Bangla)
- `detectDialect()`: checks for Chittagonian/Maheshkhali/Kutubdia patterns
- `normalizeChatgaiya()`: only activates for Chittagonian dialect; for standard Bangla, just trims
- Returns: `{ language: 'bn'|'english'|'mixed'|'banglish', dialect, normalized, isChittagonian }`

### Stage 3: Intent Detection (`intent.js:detectIntent`)
- Keyword matching against 12 intent categories
- Priority order: emergency > disease > pest > fertilizer > product > weather > soil > government > organic > crop > faq > general
- Crop extraction: matches against 30 Bangla/English aliases
- Location extraction: 14 districts
- Season extraction: 5 seasons
- Returns: `{ primaryIntent, cropName, location, season, confidence, ... }`

### Stage 4: Product Search (`product.js:searchAndRankProducts`)
- Only triggered if `isProductQuery || isFertilizerQuery || primaryIntent === 'product' || primaryIntent === 'fertilizer'`
- Fetches from Firebase Firestore REST API: `firestore.googleapis.com/v1/projects/sowrov-fertilizer-905de/...`
- 5-minute cache TTL
- Ranked by relevance to crop + intent

### Stage 5: Knowledge Search (`knowledge/index.js:searchKnowledge`)
- **2037+ documents** across 34 data files (crops, diseases, fertilizers, insects, FAQ, etc.)
- ALL documents use `export default [...]` — all imports verified working
- Scoring algorithm:
  - Title exact match: +15
  - Per-word match in allText: +2, in title: +4, in bangla name: +3
  - Intent boost (disease/fertilizer/etc.): +5
  - Crop filter match: +8, mismatch: -5
  - Disease filter match: +8
  - Season filter match: +4, mismatch: -3
  - Source priority (BARI/BRRI/DAE): +1-2
- **Threshold:** `score > 0` to be included
- Returns top N documents sorted by score

### Stage 6: Knowledge Context Building (`knowledge.js:buildFullKnowledgeContext`)
- Runs `searchInternalKnowledge` first
- If fewer results than limit, also searches government docs
- Deduplicates by document ID
- `buildKnowledgeContext()` formats documents into context string with metadata

### Stage 7: Groq API Call (`provider-router.js:sendMessage`)
- **Primary model:** `llama-3.3-70b-versatile` (800 max tokens)
- **Fallback model:** `llama-3.1-8b-instant` (560 max tokens)
- **Circuit breaker:** Opens after 5 consecutive failures, 5-minute timeout
- Retry strategy: primary → reduced tokens on 429/402 → fallback model
- Knowledge context injected into user message as `[KNOWLEDGE]:\n{context}`

### Stage 8: Response Assembly (`chat.js:handleChatRequest`)
- If Groq reply exists → use it
- If Groq fails → `searchRawDocuments` + `generateKnowledgeAnswer` from knowledge base
- If still empty → `getEmergencyFallback` (hotline number: 01829-775552)

### Stage 9: Session Memory (`memory.js:SmartMemory`)
- **NOW FIXED:** `updateFromMessage()` correctly updates session state
- Stores: crop, location, language, dialect, disease, lastIntent, topics (max 10)

### Stage 10: Response Return
- JSON: `{ reply, language, provider, model, latency }`
- Always HTTP 200 (even on error — handled by outer catch)

---

## Secondary Issues Found

### 1. `disease: null` hardcoded in chat.js
**File:** `chat.js:37,64`
Both `buildFullKnowledgeContext` and `searchRawDocuments` pass `disease: null`, even though `intent.isDiseaseQuery` is detected. Disease-specific documents lose the +8 crop filter boost.

**Fix needed:** Extract disease keywords from the query and pass as `disease` parameter.

### 2. `queryWords` filter drops meaningful Bangla words
**File:** `knowledge/index.js:81`
```javascript
const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
```
Bangla words like `কী` (2 chars), `সার` (2 chars), `পোকা` (3 chars) — the first two get dropped. However, scoring still works because:
- Full query match (`queryLower.includes(queryLower)`) catches title matches
- Remaining words still score +2-4 per match
- Intent/crop/source boosts still apply

### 3. Emergency fallback text nearly identical to knowledge fallback
Both `getEmergencyFallback()` and `generateKnowledgeAnswer()` return similar generic messages, making it hard to distinguish "no knowledge found" from "system error."

---

## Verified Working

- All 34 knowledge module imports: ✅ `export default [...]` confirmed
- Language detection: ✅ Bangla/English/mixed/Banglish all handled
- Intent detection: ✅ 12 categories with priority scoring
- Crop extraction: ✅ 30 crops with Bangla/English/Chatgaiya aliases
- Knowledge search scoring: ✅ Math verified for sample queries
- Groq API integration: ✅ Primary + fallback model with circuit breaker
- Frontend chat module: ✅ `API_ENDPOINT: '/api/chat'`

---

## Fix Summary

| Issue | File | Status |
|-------|------|--------|
| `smartMemory.updateSession` crash | `chat.js:73` | ✅ FIXED |
| Defensive cache write | `chat.js:79` | ✅ FIXED |
| `disease: null` hardcoded | `chat.js:37,64` | ⚠️ Secondary |
| `queryWords` length filter | `knowledge/index.js:81` | ⚠️ Secondary |
