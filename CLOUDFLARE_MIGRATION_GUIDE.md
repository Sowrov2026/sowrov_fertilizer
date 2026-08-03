# CLOUDFLARE MIGRATION GUIDE

**Date:** 2026-08-03
**Branch:** `cloudflare-migration` → `main`
**Commit:** `fb76d68`

---

## What Changed

### Deleted (Netlify)
- `netlify.toml`
- `netlify/` directory (89 files)
- `DEPLOYMENT_AUDIT.md`, `NETLIFY_CONFIGURATION_AUDIT.md`, `ROOT_CAUSE_ANALYSIS.md`

### Created (Cloudflare)
- `wrangler.toml` — Cloudflare Pages config
- `_headers` — Security headers (CSP, HSTS, X-Frame-Options)
- `_redirects` — URL rewrites
- `functions/api/` — 7 Cloudflare Pages Functions (ES modules)
- `functions/api/_shared/` — 89 shared modules (converted from CommonJS)

### Modified
| File | Change |
|------|--------|
| `assets/js/ai.js` | `/.netlify/functions/chat` → `/api/chat` |
| `assets/js/vision.js` | `/.netlify/functions/chat` → `/api/chat` |
| `assets/js/v19-integration.js` | `/.netlify/functions/v19-api` → `/api/v19-api` |
| `assets/js/v22-integration.js` | `/.netlify/functions` → `/api` |
| `sw.js` | `/.netlify/functions/` → `/api/` |
| `package.json` | `netlify dev` → `wrangler pages dev` |

### NOT Modified
- All 33 HTML pages
- All CSS files
- Firebase configuration (`assets/js/firebase.js`)
- All client-side JS (except path changes above)
- All static assets

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | AI chat (Groq + KB fallback) |
| `/api/health` | GET | Provider health check |
| `/api/benchmark` | POST | Run evaluation benchmarks |
| `/api/v19-api` | GET/POST | Self-evolving AI data |
| `/api/v22-api-gateway` | * | Enterprise API gateway |
| `/api/v22-analytics` | GET/POST | Business analytics |
| `/api/v22-insights` | POST | AI predictive insights |

---

## Environment Variables (Cloudflare Dashboard)

Set these in **Cloudflare Pages → Settings → Environment variables**:

| Variable | Required For |
|----------|-------------|
| `GROQ_API_KEY` | AI Chat (Groq LLM) |
| `JWT_SECRET` | Server-side JWT auth |
| `SSLCOMMERZ_STORE_ID` | Payment (SSLCommerz) |
| `SSLCOMMERZ_STORE_PASSWORD` | Payment (SSLCommerz) |
| `BKASH_APP_KEY` | Payment (bKash) |
| `BKASH_APP_SECRET` | Payment (bKash) |
| `NAGAD_PUBLIC_KEY` | Payment (Nagad) |
| `NAGAD_PRIVATE_KEY` | Payment (Nagad) |
| `STRIPE_SECRET_KEY` | Payment (Stripe) |
| `STEADFAST_API_KEY` | Shipping (SteadFast) |
| `STEADFAST_API_SECRET` | Shipping (SteadFast) |
| `PATHAO_API_KEY` | Shipping (Pathao) |
| `REDX_API_KEY` | Shipping (RedX) |
| `PAPERFLY_API_KEY` | Shipping (Paperfly) |

---

## Deploy to Cloudflare Pages

### Step 1: Connect GitHub Repo
1. Go to https://dash.cloudflare.com → Pages
2. Click **Create a project** → **Connect to Git**
3. Select `Sowrov2026/sowrov_fertilizer`
4. Branch: `main`
5. Build command: `echo 'Static site'`
6. Build output directory: `.`
7. Click **Save and Deploy**

### Step 2: Set Environment Variables
1. Pages project → **Settings** → **Environment variables**
2. Add all 14 variables from the table above
3. Click **Save**

### Step 3: Trigger Deploy
1. Pages project → **Deployments** → **Retry deployment**
2. Or push a commit to `main`

### Step 4: Custom Domain (Optional)
1. Pages project → **Custom domains**
2. Add `sowrovfertilizer.com`
3. Update DNS records as instructed

---

## Local Development

```bash
npm install
npm run dev
# Opens at http://localhost:8788
```

---

## Architecture

```
Cloudflare Pages (static)
├── index.html, about.html, products.html, ... (33 pages)
├── assets/css/style.css, ai.css, ... (6 CSS files)
├── assets/js/ai.js, firebase.js, ... (101 JS files)
├── functions/api/ (Cloudflare Pages Functions)
│   ├── chat.js          → POST /api/chat
│   ├── health.js        → GET /api/health
│   ├── benchmark.js     → POST /api/benchmark
│   ├── v19-api.js       → /api/v19-api
│   ├── v22-api-gateway.js → /api/v22-api-gateway
│   ├── v22-analytics.js → /api/v22-analytics
│   ├── v22-insights.js  → /api/v22-insights
│   └── _shared/         → Internal modules (not served)
│       ├── provider-router.js (Groq API, circuit breaker)
│       ├── agents/ (language, intent, product, knowledge, memory, reasoning)
│       ├── knowledge/ (999+ agriculture docs)
│       ├── chatgaiya/ (5000+ dialect entries)
│       ├── evaluation/ (benchmark system)
│       └── v19-*, v22-* (enterprise modules)
├── _headers (security headers)
├── _redirects (URL rewrites)
└── wrangler.toml (Cloudflare config)
```

---

## Key Differences from Netlify

| Feature | Netlify | Cloudflare Pages |
|---------|---------|-----------------|
| Functions runtime | Node.js 20 | V8 (Workers) |
| Module system | CommonJS | ES Modules |
| File I/O | `fs.readFileSync` | Not available (use KV) |
| Crypto | `require('crypto')` | Web Crypto API |
| Env vars | `process.env.X` | `context.env.X` |
| Handler format | `exports.handler` | `export async function onRequest` |
| Deploy | GitHub Actions / dashboard | Native GitHub integration |

---

## Known Limitations

1. **V19 data persistence** — In-memory only (resets on cold start). Use Cloudflare KV for persistence.
2. **V19 knowledge index** — `v19-index.js` used `fs` to scan knowledge files. Removed (not critical).
3. **Evaluation reports** — `fs.writeFileSync` removed. Reports generated in-memory only.
4. **Benchmark** — `ensureDirs()` is a no-op. Benchmark logs not persisted to disk.

---

## Verification

After deployment, verify:
1. `https://your-domain.com/api/health` — Returns provider status
2. `https://your-domain.com/` — Homepage loads
3. AI chat works (send a message)
4. Firebase auth works (login/register)
