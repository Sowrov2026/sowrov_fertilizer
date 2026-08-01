# SF AI — Final Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SF AI V33 Architecture                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│  │   Frontend   │    │   Netlify Fn    │    │    Providers    │    │
│  │  (V22 IIFE)  │───▶│   (chat.js)     │───▶│  Groq/Gemini/HF │    │
│  └─────────────┘    └─────────────────┘    └─────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│                    ┌─────────────────┐                              │
│                    │ Provider Router  │                              │
│                    │   (V31 Router)   │                              │
│                    └─────────────────┘                              │
│                              │                                       │
│              ┌───────────────┼───────────────┐                     │
│              ▼               ▼               ▼                     │
│     ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│     │ Circuit Breaker│ │ Request Queue │ │ Health Monitor│         │
│     └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    V33 Reasoning Pipeline                    │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ 1. Understand → 2. Break Down → 3. Search → 4. Compare     │   │
│  │ 5. Choose → 6. Explain → 7. Next Step → 8. Predict         │   │
│  │ 9. Prevention → 10. Products                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                       │
│              ┌───────────────┼───────────────┐                     │
│              ▼               ▼               ▼                     │
│     ┌───────────────┐ ┌───────────────┐ ┌───────────────┐         │
│     │  Knowledge    │ │   Products    │ │    Memory     │         │
│     │  (999+ docs)  │ │  (Firebase)   │ │  (Session)    │         │
│     └───────────────┘ └───────────────┘ └───────────────┘         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Agent Pipeline

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     V33 Reasoning Pipeline                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: UNDERSTAND                                              │
│  ├── Detect Language (Bangla/English/Banglish/Chatgaiya)       │
│  ├── Detect Intent (Disease/Fertilizer/Weather/Market)          │
│  └── Extract Context (Crop/Location/Season)                     │
│                                                                 │
│  Step 2: BREAK DOWN                                             │
│  ├── Identify problem components                                │
│  ├── Extract keywords                                           │
│  └── Classify severity                                          │
│                                                                 │
│  Step 3: SEARCH                                                 │
│  ├── Knowledge Base (999+ documents)                           │
│  ├── Product Database (Firebase)                                │
│  ├── Disease Database                                           │
│  ├── Weather Data                                               │
│  └── Crop Database                                              │
│                                                                 │
│  Step 4: COMPARE                                                │
│  ├── Knowledge-based answer (confidence: 85%)                   │
│  ├── Product-based answer (confidence: 75%)                     │
│  └── General answer (confidence: 50%)                           │
│                                                                 │
│  Step 5: CHOOSE BEST                                            │
│  └── Select highest confidence answer                           │
│                                                                 │
│  Step 6: EXPLAIN WHY                                            │
│  └── Justify answer source                                      │
│                                                                 │
│  Step 7: NEXT STEP                                              │
│  └── Suggest follow-up actions                                  │
│                                                                 │
│  Step 8: PREDICT                                                │
│  └── Anticipate future problems                                 │
│                                                                 │
│  Step 9: PREVENTION                                             │
│  └── Recommend preventive measures                              │
│                                                                 │
│  Step 10: PRODUCTS                                              │
│  └── Recommend verified products                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    V32 Verification Pipeline                     │
├─────────────────────────────────────────────────────────────────┤
│  Fact Check → Confidence → Product Verify → Reference Validate  │
│  → Language Check → Quality Score                               │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
Response
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Request Processing Flow                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Rate Limit Check (trusted IP only)                     │
│  2. Memory Cleanup (inline, not setInterval)               │
│  3. Language Detection                                      │
│  4. Intent Classification                                   │
│  5. Knowledge Search (cached)                               │
│  6. Product Search (single fetch + cache)                   │
│  7. Context Injection                                       │
│  8. Provider Router (Groq → Gemini → HuggingFace)          │
│  9. V33 Reasoning Pipeline                                  │
│  10. V32 Verification Pipeline                              │
│  11. Response Cache (24h TTL)                               │
│  12. Return Response                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: CORS (origin locked)                              │
│  Layer 2: Rate Limiting (trusted IP)                        │
│  Layer 3: Input Validation (size limits)                    │
│  Layer 4: Input Sanitization (XSS/HTML)                     │
│  Layer 5: API Key Security (headers, not URLs)              │
│  Layer 6: Output Sanitization (URL whitelist)               │
│  Layer 7: Internal Details Stripping (_meta)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
