# DEPLOYMENT AUDIT — SF AI RC-2

**Date:** 2026-08-02
**Commit:** `70876a3` — RC-2: Production stabilization + deployment fixes
**Live URL:** https://sowrovfertilizer.netlify.app/
**Repository:** https://github.com/Sowrov2026/sowrov_fertilizer

---

## Current Deployment Flow

```
Local Code → git push → GitHub (main branch) → Netlify Webhook → Build → Deploy → CDN
```

**Configuration (netlify.toml):**
- Build command: `echo 'Static site - no build needed'`
- Publish directory: `.` (repo root)
- Functions directory: `netlify/functions`
- Node version: 20

---

## CRITICAL PROBLEM: Live Site Not Updating

### Evidence

| Check | Local (latest) | Live Site (deployed) | Match? |
|-------|----------------|---------------------|--------|
| `<html lang>` | `bn` | `en` | **NO** |
| `<title>` | "SF Fertilizer — Growing Better, Together" | "Sowrov Fertilizer" | **NO** |
| Favicon path | `assets/images/logo/favicon.png` | `assets/images/favicon.png` | **NO** |
| Hero image | `assets/images/hero/hero.png` | `assets/images/hero.png` | **NO` |
| Nav links | Home, Products, Contact, Reviews, Cart, Login | Home, About, Products, Gallery, FAQ, Contact, Cart, Dashboard | **NO** |
| Homepage sections | Only announcement, products, contact, reviews | About, Gallery, FAQ, Why Choose Us, Statistics, Reviews, FAQ | **NO** |
| Login button | Present in nav | Absent | **NO** |
| Floating button | WhatsApp only | Home + WhatsApp | **NO** |
| Footer timestamp | "Deploy: RC-2 \| 2026-08-02" | Absent | **NO** |

### Root Cause Analysis

The live site serves a **completely different version** of index.html than the latest commit on `main`. This means:

1. **Netlify is NOT deploying from `main` branch** — Possible causes:
   - Netlify dashboard has a different production branch configured
   - GitHub integration is disconnected or pointing to wrong repo
   - Branch deploy rules are filtering out `main`

2. **OR Netlify build is failing silently** — Possible causes:
   - Build command error (though `echo` should always succeed)
   - Publish directory mismatch between dashboard and netlify.toml
   - Functions directory causing build failure

3. **OR Netlify CDN is aggressively caching** — Possible causes:
   - Old deployment cached at edge locations
   - No cache invalidation triggered

4. **OR GitHub webhook is not firing** — Possible causes:
   - Webhook deleted or disabled in GitHub settings
   - Netlify site disconnected from GitHub repo

---

## What Was Fixed (Committed but Not Deployed)

### Security Fixes
1. **5 admin pages missing auth guard** — Added `auth.js` to admin-reviews, admin-settings, admin-users, admin-gallery, admin-reports
2. **Admin auth doesn't verify role** — Added Firestore role check (admin/super_admin)
3. **Google login skips status check** — Added blocked user and role verification
4. **Raw Firebase errors shown to users** — Replaced with user-friendly messages

### Bug Fixes
5. **Broken image paths** — Fixed about.html (favicon, logo, hero), dashboard.html (favicon, about)
6. **Wrong firebase import path** — Fixed forgot-password.html (`../assets/js` → `assets/js`)
7. **Broken require paths** — Fixed benchmark.js (evaluation/runner, evaluation/reports, knowledge/index)
8. **reviews.js undefined var** — Moved `reviewRating` declaration before usage
9. **cart.js null check** — Added null check on `clearCart` element
10. **product-details.js null checks** — Added null checks on plusQty/minusQty
11. **profile.js duplicate line** — Removed duplicate `profileStatus.textContent`

### Cleanup
12. **Removed empty files** — vermi.html, trico.html, register.html
13. **Removed empty CSS** — responsive.css, print.css, dashboard.css, animation.css
14. **Removed unused components** — header.html, footer.html
15. **Removed orphaned module** — knowledge/search-v21.js

### Deployment Fixes
16. **Fixed netlify.toml** — Explicit functions directory, no-cache headers for HTML, cache headers for static assets
17. **Added deployment timestamp** — Footer shows "Deploy: RC-2 | 2026-08-02"

---

## Solutions Applied

### 1. netlify.toml (Fixed)
```toml
[build]
  command = "echo 'Static site - no build needed'"
  publish = "."
  functions = "netlify/functions"

# HTML files: no-cache (always serve latest)
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

# Static assets: long cache
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Content-Security-Policy (Fixed)
Updated CSP to allow Firebase, Groq API, and Google Fonts:
```
connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://api.groq.com;
```

---

## Verification Steps (Manual — Must Be Done by User)

### Step 1: Check Netlify Dashboard
1. Go to https://app.netlify.com/sites/sowrovfertilizer
2. Click **Site settings** → **Build & deploy**
3. Verify:
   - **Production branch:** `main`
   - **Build command:** `echo 'Static site - no build needed'`
   - **Publish directory:** `.` (dot)
   - **Functions directory:** `netlify/functions`

### Step 2: Check Deploys Tab
1. Go to **Deploys** tab
2. Check if latest deploy shows commit `70876a3`
3. If NOT showing, the GitHub integration is broken

### Step 3: Check GitHub Integration
1. Go to **Site settings** → **Build & deploy** → **Continuous deployment**
2. Click **Edit settings** next to GitHub
3. Verify:
   - Repository: `Sowrov2026/sowrov_fertilizer`
   - Branch: `main`
4. If wrong, reconnect the repository

### Step 4: Check GitHub Webhook
1. Go to GitHub repo → **Settings** → **Webhooks**
2. Find the Netlify webhook
3. Verify:
   - Status: Active
   - Events: Just the push event
   - URL: Contains `api.netlify.com`
4. If missing, reconnect in Netlify dashboard

### Step 5: Force Deploy
1. In Netlify dashboard → **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deploy to complete (1-2 minutes)
4. Check the deploy log for errors

### Step 6: Verify Live Site
1. Open https://sowrovfertilizer.netlify.app/ in incognito window
2. Check footer for "Deploy: RC-2 | 2026-08-02"
3. Check that nav only has: Home, Products, Contact, Reviews, Cart, Login
4. Check that homepage does NOT have About, Gallery, FAQ sections

### Step 7: Clear Browser Cache
If still showing old version:
1. Press `Ctrl+Shift+R` (hard refresh)
2. Or open DevTools → Application → Storage → Clear site data

---

## Files Modified in RC-2 (42 files)

### Modified (26 files)
- `about.html` — Fixed image paths
- `admin-gallery.html` — Added auth.js
- `admin-login.html` — Removed responsive.css
- `admin-product-add.html` — Removed responsive.css
- `admin-product-edit.html` — Removed responsive.css
- `admin-reports.html` — Added auth.js
- `admin-reviews.html` — Added auth.js
- `admin-settings.html` — Added auth.js
- `admin-stock.html` — Removed responsive.css
- `admin-users.html` — Added auth.js
- `assets/js/auth.js` — Added admin role verification
- `assets/js/cart.js` — Added null check
- `assets/js/login.js` — Added Google login role check, user-friendly errors
- `assets/js/product-details.js` — Added null checks
- `assets/js/profile.js` — Removed duplicate line
- `assets/js/reviews.js` — Fixed reviewRating declaration order
- `dashboard.html` — Fixed image paths, added timestamp
- `forgot-password.html` — Fixed firebase import path, user-friendly errors
- `index.html` — Added deployment timestamp
- `netlify.toml` — Fixed build config, added cache headers, CSP
- `netlify/functions/benchmark.js` — Fixed require paths
- `products.html` — Removed responsive.css
- `netlify/functions/evaluation/reports/benchmark-report.json` — Updated
- `netlify/functions/evaluation/reports/benchmark-report.md` — Updated
- `netlify/functions/evaluation/reports/dashboard-summary.json` — Updated

### Deleted (10 files)
- `assets/components/footer.html` — Unused empty file
- `assets/components/header.html` — Unused empty file
- `assets/css/animation.css` — Empty file
- `assets/css/dashboard.css` — Empty file
- `assets/css/print.css` — Empty file
- `assets/css/responsive.css` — Empty file
- `netlify/functions/knowledge/search-v21.js` — Orphaned module
- `register.html` — Superseded by customer-register.html
- `trico.html` — Empty file
- `vermi.html` — Empty file

### New Files (7 files)
- `netlify/functions/data/feedback.json`
- `netlify/functions/data/flagged.json`
- `netlify/functions/data/logs.json`
- `netlify/functions/data/popular.json`
- `netlify/functions/data/quality.json`
- `netlify/functions/data/suggestions.json`
- `netlify/functions/data/unanswered.json`

---

## Deployment Checklist

- [x] All changes committed
- [x] All changes pushed to `main`
- [x] netlify.toml properly configured
- [x] No build errors in netlify.toml
- [x] HTML cache headers set to no-cache
- [ ] **Netlify dashboard settings verified** — USER ACTION REQUIRED
- [ ] **GitHub integration active** — USER ACTION REQUIRED
- [ ] **Latest deploy shows commit 70876a3** — USER ACTION REQUIRED
- [ ] **Live site shows deployment timestamp** — USER ACTION REQUIRED

---

## Known Limitations

1. **Cannot access Netlify dashboard** — All dashboard checks require manual user action
2. **Cannot trigger deploy** — Only the user can trigger a deploy from the Netlify dashboard
3. **Cannot verify GitHub webhook** — Only the user can check webhook status

---

## Summary

| Item | Status |
|------|--------|
| Git push | SUCCESS |
| Commit hash | `70876a3` |
| Working tree | CLEAN |
| netlify.toml | FIXED |
| Live site | **NOT UPDATED** — Requires Netlify dashboard verification |
| Root cause | Netlify not deploying from `main` or build failing silently |
| Action required | User must verify Netlify dashboard settings and trigger deploy |
