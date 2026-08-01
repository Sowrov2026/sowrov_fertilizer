# SF AI V31 — Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Netlify account
- GitHub repository connected to Netlify
- API keys for at least one provider

## Environment Variables

### Required (at least one)

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxx
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxx
```

### Optional (existing)

```
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
```

## Netlify Setup

### 1. Set Environment Variables

```bash
# Via Netlify Dashboard
Site Settings → Environment Variables → Add

# Or via Netlify CLI
netlify env:set GROQ_API_KEY "gsk_xxxxx"
netlify env:set GEMINI_API_KEY "AIzaxxxxx"
netlify env:set HUGGINGFACE_API_KEY "hf_xxxxx"
```

### 2. Deploy

```bash
# Production deploy
netlify deploy --prod

# Or via git push (auto-deploy)
git push origin main
```

### 3. Verify Health

```bash
curl https://your-site.netlify.app/api/health
# or
curl https://your-site.netlify.app/health
```

## Provider Setup

### Groq (Primary)

1. Visit https://console.groq.com
2. Create API key
3. Add to Netlify env: `GROQ_API_KEY`
4. Free tier: 30 requests/minute

### Gemini (Secondary)

1. Visit https://aistudio.google.com/apikey
2. Create API key
3. Add to Netlify env: `GEMINI_API_KEY`
4. Free tier: 15 requests/minute

### HuggingFace (Tertiary)

1. Visit https://huggingface.co/settings/tokens
2. Create API token
3. Add to Netlify env: `HUGGINGFACE_API_KEY`
4. Free tier: 10 requests/minute

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Chat with AI |
| `/api/health` | GET | Provider health status |

### Chat Request

```bash
curl -X POST https://your-site.netlify.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "ধানে কীভাবে রোগ প্রতিরোধ করবো?"}
    ]
  }'
```

### Health Response

```json
{
  "status": "operational",
  "providers": [
    {
      "provider": "Groq",
      "status": "healthy",
      "latency": 1250,
      "circuitState": "CLOSED"
    }
  ],
  "cache": {
    "size": 450,
    "hitRate": "40.0%"
  }
}
```

## Troubleshooting

### All Providers Down

1. Check API keys are set correctly
2. Check provider status pages:
   - Groq: https://status.groq.com
   - Gemini: https://status.cloud.google.com
   - HuggingFace: https://status.huggingface.co
3. Check Netlify function logs

### High Latency

1. Check `/api/health` for provider latency
2. Circuit breaker may be tripping providers
3. Check cache hit rate (higher = faster)

### Rate Limiting

1. Request queue handles 429 automatically
2. Check queue status in health endpoint
3. Consider upgrading provider tier

### Circuit Breaker Tripped

- Provider disabled for 5 minutes after 5 consecutive failures
- Check health endpoint for `circuitState: "OPEN"`
- Will auto-recover after 5 minutes

## Monitoring

### Health Check Script

```bash
#!/bin/bash
while true; do
  curl -s https://your-site.netlify.app/api/health | jq '.status'
  sleep 60
done
```

### Alert on Degraded

```bash
STATUS=$(curl -s https://your-site.netlify.app/api/health | jq -r '.status')
if [ "$STATUS" != "operational" ]; then
  echo "ALERT: SF AI is $STATUS"
fi
```

## Cost Estimation

| Provider | Free Tier | Cost After |
|----------|-----------|------------|
| Groq | 30 req/min | $0.05/1M tokens |
| Gemini | 15 req/min | $0.075/1M tokens |
| HuggingFace | 10 req/min | $0.06/1M tokens |

### Estimated Monthly Cost (1000 users/day)

- Avg tokens per request: 1500
- Daily requests: 1000
- Monthly tokens: ~45M
- Estimated cost: $2-5/month (with free tiers)
