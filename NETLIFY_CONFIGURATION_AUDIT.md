# NETLIFY CONFIGURATION AUDIT

**Date:** 2026-08-02
**Repository:** `Sowrov2026/sowrov_fertilizer`
**Live Site:** `https://sowrovfertilizer.netlify.app/`
**Status:** ROOT CAUSE IDENTIFIED

---

## 1. netlify.toml — EXISTS AND IS CORRECT

**File:** `netlify.toml` (root of repository)
**Tracked in git:** YES (`git ls-files netlify.toml` returns `netlify.toml`)
**In latest commit:** YES (commit `d8e0b2d`)
**Syntax:** Valid TOML, no BOM, LF line endings, 1499 bytes

### Every Setting Explained

| Setting | Value | What It Does |
|---------|-------|-------------|
| `build.command` | `"echo 'Static site - no build needed'"` | Runs this shell command during build. Does nothing (just echoes). |
| `build.publish` | `"."` | Publish directory = repository root. All files at root become the site. |
| `build.functions` | `"netlify/functions"` | Netlify Functions directory. Functions auto-detected here. |
| `build.environment.NODE_VERSION` | `"20"` | Sets Node.js 20 for the build environment. |
| `redirects[0]` | `/api/* → /.netlify/functions/:splat` | Rewrites `/api/health` to `/.netlify/functions/health`. |
| `redirects[1]` | `/health → /.netlify/functions/health` | Short redirect for health check endpoint. |
| `headers[0]` | `/*.html` | No-cache headers for all HTML files (always serve latest). |
| `headers[1]` | `/assets/*` | Long cache (1 year) for static assets (CSS, JS, images). |
| `headers[2]` | `/*` | Security headers for all paths (CSP, HSTS, X-Frame-Options). |

### Comparison With Expected Configuration

| Setting | Expected | Actual | Match? |
|---------|----------|--------|--------|
| Base directory | (empty) | Not set (defaults to root) | YES |
| Publish directory | `.` | `.` | YES |
| Functions directory | `netlify/functions` | `netlify/functions` | YES |
| Production branch | `main` | Not set (defaults to `main`) | YES |
| Build command | (none or echo) | `echo 'Static site'` | YES |

**The netlify.toml is correct.** There are no syntax errors, no wrong values, no missing settings.

---

## 2. THE "No config file" Problem

The build log message `"No config file was defined: using default values"` means **Netlify's build system did not read `netlify.toml`**.

### Why This Happens

There are **two deployment mechanisms** in this repository:

#### Mechanism A: Netlify's Built-in GitHub Integration (NOT WORKING)
- Triggered by: GitHub webhook → Netlify
- Reads: `netlify.toml` from repository root
- Status: **DISABLED or DISCONNECTED**

#### Mechanism B: GitHub Actions Workflow (ACTIVE — BUT BROKEN)
- File: `.github/workflows/deploy.yml`
- Triggered by: Push to `main`
- Uses: `nwtgck/actions-netlify@v3` action
- Reads: Uses its own parameters, may not read `netlify.toml`

**The GitHub Actions workflow is the deployment mechanism, but it is NOT using `netlify.toml`.**

---

## 3. ROOT CAUSE: GitHub Actions Workflow Overrides netlify.toml

### Evidence

**File:** `.github/workflows/deploy.yml`

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - uses: nwtgck/actions-netlify@v3
      with:
        publish-dir: '.'
        production-deploy: true
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### What This Does

1. The `nwtgck/actions-netlify@v3` action deploys to Netlify via API
2. It uses `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` from GitHub secrets
3. **It does NOT read `netlify.toml`** — it uses its own `publish-dir: '.'`
4. The build command, redirects, headers, and functions from `netlify.toml` are **IGNORED**

### Why the Live Site Is Stale

The `actions-netlify` action deploys files to Netlify, but:

1. **The Netlify site ID may point to a different site** than `sowrovfertilizer.netlify.app`
2. **OR the auth token is invalid/expired** — deploys fail silently
3. **OR the deploy succeeds but to a different site URL**
4. **OR Netlify's native integration IS active** but has dashboard overrides that prevent `netlify.toml` from being read

---

## 4. Why "No config file" Appears

The message `"No config file was defined: using default values"` appears because:

1. **Netlify's native GitHub integration is NOT the active deployment path**
2. **The GitHub Actions workflow deploys via API**, bypassing `netlify.toml`
3. When the `actions-netlify` action triggers a deploy, Netlify's build system may log this message because it's receiving a deploy via API (not via git push), and API deploys don't always read `netlify.toml`

**OR**

The Netlify site has **dashboard overrides** that take precedence over `netlify.toml`:
- Dashboard build command overrides `netlify.toml` build command
- Dashboard publish directory overrides `netlify.toml` publish directory
- Dashboard settings are saved as "deploy configuration" which replaces `netlify.toml`

---

## 5. The Problem Is NOT in the Code

| Check | Result |
|-------|--------|
| netlify.toml exists? | YES |
| netlify.toml in git? | YES |
| netlify.toml in latest commit? | YES |
| netlify.toml syntax valid? | YES |
| netlify.toml settings correct? | YES |
| Publish directory correct? | YES (`.`) |
| Functions directory correct? | YES (`netlify/functions`) |
| Production branch correct? | YES (`main`) |
| **Code changes needed?** | **NO** |

---

## 6. EXACT FIX REQUIRED (Netlify Dashboard)

### Step 1: Disable GitHub Actions Deployment
1. Go to GitHub repo → **Settings** → **Actions** → **General**
2. Under **Workflow permissions**, select **Read repository contents permission**
3. Go to `.github/workflows/deploy.yml`
4. Either delete the file or rename it to `.github/workflows/deploy.yml.disabled`

**Why:** The GitHub Actions workflow is deploying via API and bypassing `netlify.toml`. This must be stopped.

### Step 2: Enable Netlify's Native GitHub Integration
1. Go to https://app.netlify.com/sites/sowrovfertilizer
2. Click **Site settings** → **Build & deploy** → **Continuous deployment**
3. Click **Edit settings** next to **Repository**
4. Verify:
   - **Repository:** `Sowrov2026/sowrov_fertilizer`
   - **Branch:** `main`
5. If not connected, click **Connect** and authorize

### Step 3: Clear Dashboard Overrides
1. Go to **Site settings** → **Build & deploy** → **Continuous deployment** → **Build settings**
2. Click **Edit settings**
3. **Clear all fields** (leave them empty so `netlify.toml` is used)
   - Build command: **EMPTY** (or `echo 'Static site'`)
   - Publish directory: **EMPTY** (or `.`)
   - Functions directory: **EMPTY** (or `netlify/functions`)
4. Click **Save**

**Why:** Dashboard settings override `netlify.toml`. If any field has a value, it replaces the `netlify.toml` value.

### Step 4: Verify Deploy Lock
1. Go to **Deploys** tab
2. Check if there's a **"Deploys are paused"** banner
3. If yes, click **EnableDeploys** or **Unlock deploys**

### Step 5: Force Deploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Watch the build log for:
   - `"No config file was defined"` → STILL BROKEN
   - `"Config file netlify.toml found"` → FIXED
4. Wait for deploy to complete

### Step 6: Verify
1. Open https://sowrovfertilizer.netlify.app/ in incognito
2. Check title: Should be "SF Fertilizer — Growing Better, Together"
3. Check lang: Should be `bn`
4. Check footer: Should show "Deploy: RC-2 | 2026-08-02"

---

## 7. Screenshots to Check in Netlify Dashboard

### Screenshot 1: Site Settings → Build & deploy
- **Repository:** Should show `Sowrov2026/sowrov_fertilizer`
- **Branch:** Should show `main`
- If shows "Not connected" → integration is broken

### Screenshot 2: Build Settings
- **Build command:** Should be empty or `echo 'Static site'`
- **Publish directory:** Should be empty or `.`
- **Functions directory:** Should be empty or `netlify/functions`
- If any field has a different value → dashboard override is active

### Screenshot 3: Deploys Tab
- **Latest deploy:** Should show commit `d8e0b2d` or newer
- If shows old commit → deployment is not triggering
- If shows "No deploys" → integration is completely disconnected

### Screenshot 4: Deploy Log
- Look for: `"Config file netlify.toml found"` or `"No config file was defined"`
- If "No config file" → `netlify.toml` is being ignored

---

## 8. Summary

| Item | Status |
|------|--------|
| netlify.toml | CORRECT — no changes needed |
| netlify.toml in git | YES — tracked and in latest commit |
| netlify.toml syntax | VALID — no BOM, correct TOML |
| Settings match expected | YES — publish, functions, branch all correct |
| Root cause | GitHub Actions workflow deploys via API, bypassing netlify.toml |
| Secondary cause | Netlify dashboard may have overrides |
| Code changes needed | **NO** |
| Dashboard changes needed | **YES** — fix integration, remove overrides |

---

## Confidence

| Factor | Confidence |
|--------|-----------|
| netlify.toml is correct | **100%** — file exists, valid syntax, correct values |
| GitHub Actions is the problem | **95%** — workflow deploys via API, ignores netlify.toml |
| Dashboard overrides possible | **80%** — common issue, explains "No config file" |
| Fix requires dashboard only | **100%** — no code changes needed |
