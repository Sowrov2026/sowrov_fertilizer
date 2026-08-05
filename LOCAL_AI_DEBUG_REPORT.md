# 🔧 Local AI Debug Report
## Wrangler Local Development Setup

**Date:** August 4, 2026  
**Status:** ⚠️ GROQ_API_KEY must be added manually

---

## 🔍 Problem

VS Code Live Server cannot run the AI because:
1. No Cloudflare Functions backend
2. No environment variables
3. No `GROQ_API_KEY`

## ✅ Solution: Wrangler Local Dev Server

### Setup Complete

| File | Status | Purpose |
|------|--------|---------|
| `.local.dev.vars` | ✅ Created | Local environment variables |
| `wrangler.toml` | ✅ Updated | Added `[vars]` section |
| `.gitignore` | ✅ Updated | Excludes `.local.dev.vars` from git |

### How to Run

```bash
# 1. Start Wrangler dev server
npx wrangler pages dev . --port 8788

# 2. Open browser
http://localhost:8788
```

---

## ⚠️ GROQ_API_KEY Required

The `.local.dev.vars` file currently has a placeholder. You must add your real key:

1. Get your key from: https://console.groq.com/keys
2. Open `.local.dev.vars` in your editor
3. Replace the placeholder with your actual key:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. Restart Wrangler:

```bash
# Stop current server (Ctrl+C), then restart
npx wrangler pages dev . --port 8788
```

---

## 🧪 Test Results (Current State)

### Without API Key

| Test | Result | Notes |
|------|--------|-------|
| Health endpoint | ✅ PASS | Responds correctly |
| GROQ_API_KEY available | ❌ FAIL | Empty string |
| AI Chat responds | ✅ PASS | Falls back to knowledge base |
| AI Provider | ⚠️ knowledge | Not Groq (expected without key) |

### After Adding API Key

| Test | Expected |
|------|----------|
| Health endpoint | `"hasApiKey": true` |
| AI Chat responds | `"provider": "groq"` |
| AI Model | `"model": "llama-3.3-70b-versatile"` |

---

## 📋 Environment Variable Flow

```
.local.dev.vars
    ↓
wrangler.toml [vars]
    ↓
env.GROQ_API_KEY
    ↓
provider-router.js → sendMessage()
    ↓
Groq API → AI Response
```

---

## 🔧 Troubleshooting

### Key not detected
```bash
# Check if key is loaded
npx wrangler pages dev . --port 8788
# Look for: env.GROQ_API_KEY ("gsk_...") in startup output
```

### AI still returns knowledge fallback
```bash
# 1. Verify key in .local.dev.vars (no quotes needed)
# 2. Restart Wrangler completely
# 3. Check health endpoint
curl http://localhost:8788/api/health
# Should show: "hasApiKey": true
```

### Port already in use
```bash
# Kill existing node processes
taskkill /F /IM node.exe
# Or use different port
npx wrangler pages dev . --port 8789
```

---

## 📁 Files Created/Modified

| File | Action |
|------|--------|
| `.local.dev.vars` | Created (placeholder key) |
| `wrangler.toml` | Updated (added `[vars]`) |
| `.gitignore` | Updated (excludes `.local.dev.vars`) |

---

## ✅ Next Steps

1. Add your `GROQ_API_KEY` to `.local.dev.vars`
2. Restart Wrangler
3. Verify with: `curl http://localhost:8788/api/health`
4. Test AI: `curl -X POST http://localhost:8788/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"টমেটোতে সাদা মাছি হয়েছে"}]}'`
