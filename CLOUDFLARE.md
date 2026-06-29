# Deployment Guide

## Overview

**Website:** https://darwingeospatial.com
**Repository:** https://github.com/darwin-geospatial/darwinlabsweb
**DNS:** Cloudflare (registrar + nameservers)

> ⚠️ **Known issue (as of June 2026):** the live site is NOT auto-deploying from
> this repo. See [Deployment Status](#deployment-status) below before troubleshooting.

---

## Deployment Status

There are currently **two** hosting paths configured, and DNS points at the broken one.

### 1. Cloudflare Pages — `darwinweb` (BROKEN / disconnected)
- Pages project `darwinweb` (`darwinweb.pages.dev`) was connected to the **old
  personal repo** `gabrielireland/darwinlabsweb`.
- The repo was moved into the `darwin-geospatial` org (~June 2026), which **broke
  the Pages → GitHub connection**, so pushes to `main` no longer trigger deploys.
- `darwinweb.pages.dev` no longer resolves.
- Cloudflare still proxies `darwingeospatial.com` and serves the **last cached
  build**, so the live site is stale (homepage + missing `/blog`).

### 2. GitHub Pages (WORKING, but not served)
- GitHub Pages is enabled on `darwin-geospatial/darwinlabsweb`, building from
  `main` / root, with custom domain `darwingeospatial.com` (`CNAME` + `.nojekyll`
  present in repo).
- It rebuilds correctly on every merge and already has the current site
  (including `/blog`), but it is **not served** because DNS points at Cloudflare.

### How to make the site live again
Pick **one** host and point DNS at it:

**Option A — switch DNS to GitHub Pages (fastest; build already current):**
1. Cloudflare dashboard → DNS for `darwingeospatial.com`.
2. Replace the apex/`www` records that point to `darwinweb.pages.dev` with the
   GitHub Pages targets:
   - Apex `darwingeospatial.com`: A records →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     (or a flattened CNAME → `darwin-geospatial.github.io`).
   - `www` → CNAME `darwin-geospatial.github.io`.
3. In the GitHub repo → Settings → Pages, confirm the custom domain
   `darwingeospatial.com` is verified and enable "Enforce HTTPS".
4. Cloudflare proxy can stay on; allow a few minutes for SSL.

**Option B — reconnect Cloudflare Pages to the org repo:**
1. Cloudflare dashboard → Workers & Pages → `darwinweb` → Settings →
   reconnect the Git source to `darwin-geospatial/darwinlabsweb`, branch `main`.
2. Trigger a redeploy; confirm `darwinweb.pages.dev` resolves with the new build.
3. Disable GitHub Pages to avoid the duplicate custom-domain claim.

---

## Cloudflare DNS Configuration

**Domain:** `darwingeospatial.com`
**Registrar:** Cloudflare (expires July 23, 2026)

### Email (Google Workspace)
MX records point to Google (leave these untouched during any DNS change):
- `aspmx.l.google.com` (priority 1)
- `alt1.aspmx.l.google.com` (priority 5)
- `alt2.aspmx.l.google.com` (priority 5)
- `alt3.aspmx.l.google.com` (priority 10)
- `alt4.aspmx.l.google.com` (priority 10)

---

## How to Deploy Changes

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Once a host is correctly connected (see [Deployment Status](#deployment-status)),
pushing to `main` will deploy automatically. No build step (static HTML/CSS/JS).

### Verify Deployment
```bash
# Live homepage size should match repo index.html after deploy
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" https://darwingeospatial.com/
# Blog should be the real file (~11 KB), not a copy of the homepage
curl -s -o /dev/null -w "%{http_code} %{size_download}\n" https://darwingeospatial.com/blog/
# Sitemap should list blog entries
curl -s https://darwingeospatial.com/sitemap.xml | grep -c blog
```

---

## Cloudflare Account Access

**Account:** `Cloudflare.factoid955@passmail.net`
**Dashboard:** https://dash.cloudflare.com

- **DNS Settings:** Domains → darwingeospatial.com → DNS
- **Pages Project:** Workers & Pages → darwinweb
- **Domain Registration:** Domain Registration → darwingeospatial.com

---

## Related Files

- `CNAME` — custom domain for GitHub Pages (`darwingeospatial.com`)
- `.nojekyll` — disables Jekyll processing on GitHub Pages
- `PENDING.md` — website restructure proposal
- `index.html` — main website file
- `services.html` — comprehensive services page
- `blog/` — blog index + articles

---

## Claude Code Rules

**NO COMMITS unless explicitly requested by the user.** Make changes but wait for
user approval before committing.

---

## Development Guidelines

### Team Section
- **Descriptions MUST be aligned** — all team member cards similar description lengths
- **Abilities bullet points** — keep label lengths consistent (e.g., "Backend Systems:")
- Use `mt-auto` on the abilities div to push them to the bottom of cards
- Use `h-full` and `flex-grow` so cards stretch equally
- Use `min-w-0` on cards to prevent text overflow
- **Responsive grid:** `sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`

### Values Section
- Darwin green at 10% opacity: `rgba(70, 99, 58, 0.1)`
- Cards have rounded corners and centered text

### General
- Always test both ES and EN language versions
- Check mobile responsiveness after changes
- Abilities should have 3 items each with similar character counts

---

## Historical Notes

- **Previous repo:** `irishdevops/darwinlabsweb` (no longer exists)
- **Previous Pages project:** `darwinlabsweb` (deleted)
- **Migrated:** February 3, 2026 → `gabrielireland/darwinlabsweb` + Pages `darwinweb`
- **Moved to org:** ~June 2026 → `darwin-geospatial/darwinlabsweb`
  (this broke the Cloudflare Pages → GitHub connection; see Deployment Status)
