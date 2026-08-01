# SF AI V31 — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SF AI V31 Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Frontend   │    │   Backend   │    │  Providers  │         │
│  │  (V22 IIFE)  │───▶│ (Netlify)   │───▶│  (Groq/Gemini/HF)│   │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                            │                                     │
│                            ▼                                     │
│                    ┌───────────────┐                             │
│                    │ Provider Router│                            │
│                    │  (V31 Router)  │                            │
│                    └───────────────┘                             │
│                            │                                     │
│              ┌─────────────┼─────────────┐                     │
│              ▼             ▼             ▼                     │
│     ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│     │ Circuit Breaker│ │ Request Queue │ │ Health Monitor│     │
│     └───────────────┘ └───────────────┘ └───────────────┘     │
│              │             │             │                     │
│              ▼             ▼             ▼                     │
│     ┌───────────────┐ ┌───────────────┐ ┌───────────────┐     │
│     │ Smart Cache   │ │ Rate Limiter  │ │ Exponential   │     │
│     │ (24h TTL)     │ │               │ │ Backoff       │     │
│     └───────────────┘ └───────────────┘ └───────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Provider Router Architecture

### Provider Priority

```
Priority 1: Groq (Primary)
    ├── Model: llama-3.3-70b-versatile
    ├── Fallback: llama-3.1-8b-instant
    ├── Timeout: 30s
    └── Rate Limit: 30 req/min

Priority 2: Gemini (Secondary)
    ├── Model: gemini-2.5-flash
    ├── Fallback: gemini-2.0-flash
    ├── Timeout: 60s
    └── Rate Limit: 15 req/min

Priority 3: HuggingFace (Tertiary)
    ├── Model: meta-llama/Llama-3.3-70B-Instruct
    ├── Fallback: mistralai/Mistral-7B-Instruct-v0.3
    ├── Timeout: 120s
    └── Rate Limit: 10 req/min
```

### Request Flow

```
User Request
    │
    ▼
┌─────────────────┐
│  Rate Limiter   │──▶ 429 if exceeded
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Answer Cache   │──▶ Return cached if HIT
└─────────────────┘
    │ MISS
    ▼
┌─────────────────┐
│  Agent Pipeline │
│  (5 Agents)     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Provider Router │
└─────────────────┘
    │
    ├──▶ Try Groq ──▶ Circuit Breaker Check
    │         │
    │         ├─▶ Success ──▶ Return Response
    │         │
    │         └─▶ Failure ──▶ Record Failure
    │                              │
    │                              ▼
    │                    ┌───────────────┐
    │                    │ Circuit Open? │
    │                    └───────────────┘
    │                         │
    │                    Yes  │  No
    │                         ▼  ▼
    │                    Skip   Retry with Backoff
    │
    ├──▶ Try Gemini ──▶ (same flow)
    │
    └──▶ Try HuggingFace ──▶ (same flow)
```

## Circuit Breaker

### States

```
CLOSED ────────▶ OPEN ────────▶ HALF_OPEN
  │                │               │
  │ 5 failures     │ 5 min timeout │ 2 successes
  │                │               │
  ▼                ▼               ▼
Normal         Disabled        Testing
```

### Configuration

```javascript
{
    failureThreshold: 5,      // Failures before OPEN
    successThreshold: 2,      // Successes before CLOSED
    timeoutMs: 300000,        // 5 minutes
}
```

## Request Queue

### Rate Limit Handling

```
Request ──▶ 429 Response
                │
                ▼
         ┌─────────────┐
         │   Queue     │
         │ (max 30s)   │
         └─────────────┘
                │
                ▼
         Retry with Backoff
                │
                ▼
         Return Response or Next Provider
```

## Smart Cache

### Cache Strategy

```
Cache Key: normalized_input::crop::intent_type
TTL: 24 hours
Max Size: 2000 entries
Eviction: LRU (oldest first)
```

### Cache Flow

```
User Question
    │
    ▼
┌─────────────┐
│ Normalize   │
│ Input       │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Generate    │
│ Cache Key   │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Check Cache │──▶ HIT: Return cached answer
└─────────────┘
    │ MISS
    ▼
┌─────────────┐
│ Call LLM    │
└─────────────┘
    │
    ▼
┌─────────────┐
│ Store in    │
│ Cache       │
└─────────────┘
```

## Agent Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                    Agent Pipeline                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Language Agent ──▶ Detect language (bn/en/bn-roman) │
│           │                                             │
│           ▼                                             │
│  2. Intent Agent ──▶ Classify intent (crop/disease/etc) │
│           │                                             │
│           ▼                                             │
│  3. Memory Agent ──▶ Load conversation context          │
│           │                                             │
│           ▼                                             │
│  4. Knowledge Agent ──▶ RAG search (999+ documents)    │
│           │                                             │
│           ▼                                             │
│  5. Product Agent ──▶ Firebase product search           │
│           │                                             │
│           ▼                                             │
│  6. Provider Router ──▶ Multi-provider failover         │
│           │                                             │
│           ▼                                             │
│  7. Reasoning Agent ──▶ Self-check & sanitize           │
│           │                                             │
│           ▼                                             │
│        Response                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Error Handling

### Never Expose to User

| Error | Internal Log | User Message |
|-------|--------------|--------------|
| 429 Rate Limit | `Provider 429` | Queued, then retry |
| 401 Invalid Key | `Invalid API key` | Skip provider |
| 402 Quota Exceeded | `Quota exceeded` | Skip provider |
| 500 Server Error | `Server error` | Skip provider |
| Timeout | `Timeout` | Skip provider |
| All Failed | `All providers failed` | Friendly Bengali error |

### User-Facing Errors (Bengali)

```
"AI সেবা এখন সমস্যায় আছে। কিছুক্ষণ পর আবার চেষ্টা করুন।"
"AI service is experiencing issues. Please try again shortly."
```

## Logging

### Console Output

```
V31: groq/llama-3.3-70b-versatile | 1250ms | tokens: 1500 | lang: bn | intent: fertilizer | attempts: 1
Provider gemini failed: Rate limited status: 429
Circuit breaker OPEN for huggingface - disabled for 300s
```

### Response Headers

```
X-Provider: groq
X-Model: llama-3.3-70b-versatile
X-Latency: 1250
X-Cache: HIT | MISS
```
