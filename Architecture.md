# SF AI Architecture

## System Diagram

```
User Browser
  ├── component-loader.js
  │   ├── ai.js (IIFE - Chat Widget)
  │   ├── v15-integration.js (ES Module)
  │   │   ├── vision.js, soil.js, weather.js
  │   │   ├── calculator.js, crop-calendar.js
  │   │   ├── yield-prediction.js, reminder.js
  │   │   ├── disease-timeline.js, product-rec.js
  │   │   ├── confidence.js, security.js
  │   └── v16-integration.js (ES Module)
  │       ├── voice.js, memory.js, ocr.js
  │       ├── pdf-ai.js, semantic-search.js
  │       ├── farmer-profile.js, analytics.js
  │       ├── self-learning.js, offline.js
  │       ├── error-handler.js, performance.js
  └── Netlify Functions (API)
      ├── chat.js (Main Handler)
      │   ├── agents/language.js
      │   ├── agents/intent.js
      │   ├── agents/knowledge.js
      │   ├── agents/product.js
      │   ├── agents/reasoning.js
      │   ├── agents/memory.js
      │   ├── knowledge/index.js
      │   ├── chatgaiya/engine.js
      │   ├── cache.js
      │   └── tools.js
      └── benchmark.js
```

## Data Flow
1. User sends message → ai.js captures
2. V16 memory hook extracts user info
3. V16 security hook validates input
4. Message sent to /.netlify/functions/chat
5. Server: Language → Intent → Knowledge → Product → Reasoning
6. Response returned with confidence score
7. V16 analytics hook tracks the interaction
8. V16 memory hook updates user profile
