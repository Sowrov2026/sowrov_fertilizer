# SF AI V31 — Provider Monitor

## Overview

The Provider Monitor provides real-time visibility into AI provider health, performance, and availability.

## Health Endpoint

```
GET /api/health
GET /health
```

### Response Format

```json
{
  "status": "operational",
  "timestamp": "2026-08-01T12:00:00.000Z",
  "uptime": 3600,
  "providers": [
    {
      "provider": "Groq",
      "providerId": "groq",
      "status": "healthy",
      "latency": 1250,
      "lastSuccess": "2026-08-01T11:59:50.000Z",
      "lastFailure": null,
      "requestsToday": 150,
      "totalRequests": 1250,
      "totalFailures": 3,
      "circuitState": "CLOSED",
      "cacheHitRate": "45.2%",
      "model": "llama-3.3-70b-versatile",
      "hasApiKey": true
    }
  ],
  "cache": {
    "size": 450,
    "totalHits": 200,
    "totalMisses": 300,
    "hitRate": "40.0%"
  },
  "queues": [
    {
      "provider": "groq",
      "pending": 0
    }
  ],
  "summary": {
    "totalProviders": 3,
    "healthyProviders": 1,
    "circuitBreakers": [
      {
        "provider": "groq",
        "state": "CLOSED",
        "failures": 0,
        "totalRequests": 1250
      }
    ]
  }
}
```

## Status Values

| Status | Description |
|--------|-------------|
| `operational` | At least one provider is healthy |
| `degraded` | All providers are degraded or down |
| `error` | Health check failed |

## Provider Status Values

| Status | Description |
|--------|-------------|
| `healthy` | Provider responding normally |
| `degraded` | Provider has recent failures |
| `standby` | Provider not yet tested |
| `no_key` | API key not configured |
| `circuit_open` | Circuit breaker tripped (disabled for 5 min) |
| `unknown` | Initial state |

## Circuit Breaker States

| State | Description |
|-------|-------------|
| `CLOSED` | Normal operation |
| `OPEN` | Disabled due to consecutive failures (5 min cooldown) |
| `HALF_OPEN` | Testing if provider recovered |

## Monitoring Dashboard

To build a monitoring dashboard:

1. Poll `/api/health` every 30 seconds
2. Track `latency` trends per provider
3. Alert when `circuitState` changes to `OPEN`
4. Monitor `cache.hitRate` for optimization
5. Track `requestsToday` for capacity planning

## Logs

All provider activity is logged to console:

```
V31: groq/llama-3.3-70b-versatile | 1250ms | tokens: 1500 | lang: bn | intent: fertilizer | attempts: 1
```

## Alerting Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Latency | > 3000ms | > 10000ms |
| Failure Rate | > 5% | > 20% |
| Circuit Open | Any | All providers |
| Cache Hit Rate | < 30% | < 10% |
