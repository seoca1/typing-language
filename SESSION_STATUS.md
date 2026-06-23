# Phase 7 Progress — Typing Language

**Last Updated:** 2026-06-23
**Status:** Active development — Phase 7 Polish

---

## 1. Build & Test Status

```
Build:     ✓ 909 KB (gzip 272 KB) — index-UsbrxN5A.js
Tests:     ✓ 673 passed | 1 failed (EffectsSystem) | 1 skipped
SAMPLE_STAGES: 140 stages (was 133, +7 newly unlocked)
```

**Key commands:**
```bash
cd prototype && npm run build
cd prototype && npm test
cd .. && python3 dashboard/generate_data.py  # regenerate dashboard data
```

---

## 2. This Session — ImageLoader Fix (Character Images)

### Problem
Character images visible in CharacterSelect screen but NOT in game screen. Error in browser console:
```
[ImageLoader] Failed to load: /typing-language/characters/en/emily/1-idle.png
GET https://seoca1.github.io/typing-language/typing-language/characters/... 404
```

### Root Cause
`ImageLoader.ts` URL construction had TWO bugs:

**Bug 1:** `pathname.startsWith('/typing-language/')` failed when GitHub Pages
served the page at `/typing-language` (no trailing slash) — ImageLoader fell back
to base `/`, prepending `/typing-language/` again → double prefix.

**Bug 2:** `config.src` already contains `/typing-language/` prefix (e.g.,
`/typing-language/characters/en/emily/1-idle.png`), but ImageLoader was
concatenating `base + cleanSrc` regardless → `/typing-language/typing-language/...`.

### Fix Applied

**File:** `prototype/src/sprites/ImageLoader.ts`

```typescript
// Before (buggy):
const base = pathname.startsWith('/typing-language/') ? '/typing-language/' : '/';
const cleanSrc = config.src.startsWith('/') ? config.src.slice(1) : config.src;
finalUrl = base + cleanSrc;  // DOUBLE PREFIX when base='/typing-language/'

// After (fixed):
const base = pathname.startsWith('/typing-language') ? '/typing-language/' : '/';
finalUrl = config.src.startsWith(base) ? config.src : base + config.src;
```

### Commits

```
7e517ad — fix: prevent double base path prefix in ImageLoader URL construction
d8709cd — fix: ImageLoader path detection for GitHub Pages without trailing slash
```

### Note
Deploy was pushed to GitHub Pages — build/run may still be in progress.

---

## 3. Git Commits (Recent)

```
7e517ad — fix: prevent double base path prefix in ImageLoader URL construction
d8709cd — fix: ImageLoader path detection for GitHub Pages without trailing slash
44dbec2 — feat: add quotes, business, passages corpus — unlock all locked stages
6ff1e34 — feat: add Cross-Language Stage Map to dashboard Overview tab
31e44a7 — fix: render loop safe guards (early exit, try-catch)
```

---

## 4. Known Issues

| # | Issue | Status |
|---|-------|--------|
| 1 | Blank/Black screen on load | OPEN — requires live browser testing |
| 2 | JP Wiki Proverb Pages missing | FIXED |
| 3 | Character images not showing in game screen | FIXED (7e517ad) |

---

## 5. Recent Changes Summary (Phase 7 — Polish)

### Visual Fixes & Effects
- `EffectsSystem.ts`: `AmbientParticle` + `maybeSpawnAmbient()` + `spawnAmbientBurst()`
- `Renderer.ts`: `drawAmbient()`, `width`/`height` made public
- `App.tsx`: Early exit guard in `tick()`, try-catch render loop, spin scaleX clamp ±0.15

### Dashboard Enhancement
- Overview tab: 🗺️ Cross-Language Stage Map (EN/JP/ES/KR × Tiers 0-5)
- Language detail tab: "구조" sub-tab with Tier-organized stage grid
- CSS: `stage-structure-grid` + `cross-lang-grid` (~120 lines)

### Corpus Expansion (THIS SESSION)
Added new corpus types (quotes, business, passages) → ALL LOCKED STAGES UNLOCKED:

| Stage | Language | Corpus Added | Status |
|-------|----------|-------------|--------|
| en_4_2 | EN | `quotes` (10 movie quotes) | ✓ Unlocked |
| jp_3_2 | JP | `quotes` (7 anime/drama quotes) | ✓ Unlocked |
| jp_4_2 | JP | `business` (8 business email phrases) | ✓ Unlocked |
| en_5_1 | EN | `passages` (3 literature excerpts) | ✓ Unlocked |
| jp_5_1 | JP | `passages` (3 literature excerpts) | ✓ Unlocked |
| es_5_1 | ES | `passages` (4 literature excerpts) | ✓ Unlocked |
| kr_5_1 | KR | `passages` (3 literature excerpts) | ✓ Unlocked |

**AVAILABLE_CORPUS now includes:**
`hiragana_basic`, `katakana_basic`, `hiragana_dakuten`, `hiragana_yoon`,
`sentences`, `news`, `proverbs`, `quotes`, `business`, `passages`

**SAMPLE_STAGES:** 133 → 140 (+7)

**Raw source files added:**
- `Language/raw/English/movie-quotes.md`
- `Language/raw/Japanese/anime-drama-quotes.md`
- `Language/raw/Japanese/business-email.md`
- `Language/raw/*/literature-passages.md` (EN/JP/ES/KR)

---

## 6. Next Steps

1. **Verify character image fix** — After GitHub Pages deploy completes, test in browser
2. **Wiki ingestion** — Create wiki pages for new corpus sources with `source: [[...]]` citations
3. **Dashboard regeneration** — Run `generate_data.py` after wiki ingestion
4. **Issue #1 investigation** — Need live browser testing with DevTools for blank screen root cause

---

## 7. Deployment

**GitHub Pages URL:** https://seoca1.github.io/typing-language/

**Deploy method:** Push to `main` → GitHub Actions auto-build + deploy

**Last deploy commit:** `7e517ad`
