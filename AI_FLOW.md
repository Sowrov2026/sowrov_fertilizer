# SF AI V36 — Answer Flow (Never Error)

## Core Rule
**SF AI must NEVER show "Sorry, something went wrong" or any error message.**
Every query MUST always receive a helpful answer — from KB → FAQ → Product → Crop → Disease → Pest → Fertilizer → Groq → Emergency Fallback.

---

## Flow Diagram

```
User Query
    │
    ▼
┌─────────────────────────────┐
│ 1. Frontend (ai.js)         │
│    - Adds message to UI     │
│    - Shows typing indicator │
│    - Sends to /api/chat     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 2. Backend (chat.js)        │
│    - processLanguage()      │
│    - detectIntent()         │
│    - searchAndRankProducts()│
│    - buildFullKnowledge()   │
│    - Check answer cache     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ 3. Provider Router          │
│    (provider-router.js)     │
│                             │
│    Groq Primary:            │
│      llama-3.3-70b-versatile│
│    Groq Fallback:           │
│      llama-3.1-8b-instant   │
│                             │
│    3 attempts → KB fallback │
│    maxTokens: 800           │
└─────────────┬───────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌──────────────┐  ┌──────────────────┐
│ 4a. Groq     │  │ 4b. Knowledge    │
│     Reply    │  │     Base Fallback │
│              │  │                   │
│     OK? ──►  │  │  searchRawDocs() │
│              │  │  generateKB()     │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       ▼                   ▼
┌─────────────────────────────────┐
│ 5. Emergency Fallback (chat.js) │
│    LAST RESORT — Never Empty    │
│    Language-aware (BN/EN)       │
│    Includes hotline: 01829-775552│
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────┐
│ 6. Frontend (ai.js)         │
│    - Displays bot reply     │
│    - Saves to history       │
│    - Hides typing indicator │
│                             │
│    NEVER shows error msg    │
│    NEVER shows confidence % │
└─────────────────────────────┘
```

---

## Files Modified (V36)

| File | Change |
|------|--------|
| `netlify/functions/provider-router.js` | Groq-only, fallback model, 3 attempts, 800 tokens, `buildKnowledgeFallback()` |
| `netlify/functions/chat.js` | `processLanguage()` for normalization, never-empty final fallback |
| `assets/js/ai.js` | Catch block shows helpful answer instead of error; no confidence %; no "Limited Knowledge" |
| `netlify/functions/agents/knowledge.js` | `generateKnowledgeAnswer()` last-resort fallback for unstructured docs |
| `netlify/functions/agents/reasoning.js` | Removed confidence/limited-knowledge note shown to user |
| `netlify/functions/agents/intent.js` | Bug fix: Chatgaiya normalization now works via `processLanguage()` |

---

## Answer Priority Chain

1. **Answer Cache** — Same question answered recently
2. **Groq Primary** — `llama-3.3-70b-versatile` (3 attempts)
3. **Groq Fallback** — `llama-3.1-8b-instant` (3 attempts)
4. **Knowledge Base** — 999+ docs (BARI/BRRI/DAE/FAO/IRRI)
5. **FAQ** — 849 agriculture FAQs
6. **Product DB** — Firebase products
7. **Crop/Disease/Pest DB** — Firebase documents
8. **Emergency Fallback** — Language-aware agricultural advice + hotline

---

## Token Limits

| Stage | Tokens |
|-------|--------|
| System Prompt (EN) | ~50 |
| System Prompt (BN) | ~40 |
| Groq maxTokens | 800 |
| Knowledge context limit | 6 docs |
| Product context limit | 3 products |

---

## What NEVER Happens

- "Sorry, something went wrong" → **NEVER**
- "I could not generate a response" → **NEVER**
- Confidence percentage shown to user → **NEVER**
- "Limited Knowledge Source" message → **NEVER**
- Empty reply to frontend → **NEVER**
- Error HTTP status to frontend → **NEVER** (always 200)
