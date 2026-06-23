# Phase 7 Progress — Typing Language

**Last Updated:** 2026-06-23
**Status:** Active development

---

## 1. Build & Test Status

```
Build:     ✓ 909 KB (gzip 272 KB)
Tests:     ✓ 674 passed, 1 skipped
SAMPLE_STAGES: 140 stages (was 133, +7 newly unlocked)
```

**Key commands:**
```bash
cd prototype && npm run build
cd prototype && npm test
cd .. && python3 dashboard/generate_data.py  # regenerate dashboard data
```

---

## 2. Recent Changes (Phase 7 — Polish)

### 2.1 Visual Fixes & Effects

| File | Change |
|------|--------|
| `prototype/src/effects/EffectsSystem.ts` | `AmbientParticle` interface + `maybeSpawnAmbient()` + `spawnAmbientBurst()` + `drawAmbient()` |
| `prototype/src/engine/Renderer.ts` | `drawAmbient()`, `width`/`height` made public |
| `prototype/src/App.tsx` | Early exit guard in `tick()` if `phase !== 'stage'`, `maybeSpawnAmbient()` call, try-catch render loop |
| `prototype/src/App.tsx` | Spin animation fix: scaleX clamp ±0.15 (prevents image vanishing at midpoint) |

### 2.2 Dashboard Enhancement (THIS SESSION)

**Overview Tab:** Added 🗺️ **Cross-Language Stage Map** — a grid showing EN/JP/ES/KR × Tier 0-5 at a glance

**Language Detail Tab:** Added **"구조" (Structure)** sub-tab — shows each language's stages organized by Tier with stage ID, corpus type, and category tags

| File | Change |
|------|--------|
| `dashboard/index.html` | Added stage-structure-grid + cross-lang-grid CSS (~120 lines) |
| `dashboard/dashboard.js` | Added `renderStageStructure()`, `renderCrossLangStageMap()` |

### 2.3 Proverb Corpus Entries Added

Added proverb entries to `prototype/src/data/corpus.ts` for all 4 languages:

**EN proverbs** (8 entries: en_p_001–en_p_008)
- The early bird catches the worm, Actions speak louder than words, Practice makes perfect, Where there is a will there is a way, Don't count your chickens before they hatch, Look before you leap, Better late than never, When in Rome do as the Romans do

**JP proverbs** (6 entries: jp_p_001–jp_p_006)
- 七転び八起き, 石の上にも三年, 継続は力なり, 花より団子, 雨降って地固まる, 痘痕も笑窪

**KR proverbs** (5 entries: kr_p_001–kr_p_005)
- 천 리 길도 한 걸음부터, 칠전팔기, 물은源头부터 흐른다, 소와 돼지도 사이좋게 살다, 배고프면 투자름도能找到

**ES proverbs** (8 entries: es_p_001–es_p_008) — already existed

---

## 3. Known Issues

### Issue #1 — Blank/Black Screen (OPEN)
- **Symptom:** Game screen sometimes renders blank or black on load
- **Investigation:** `GameScreen.tsx` doesn't exist; `StageScreen.tsx` is used instead
- **Defensive fixes applied:**
  - Render error handling with try-catch in `App.tsx`
  - Early exit guard in `tick()` if `phase !== 'stage'`
  - Spin animation scaleX clamp ±0.15
- **Status:** Still open — requires live user testing with browser DevTools
- **Ref:** `KNOWN_ISSUES.md`

### Issue #2 — JP Wiki Proverb Pages (FIXED)
- `Japanese/proverbs/hana-yori-dango.md` was missing
- Created with proper content

---

## 4. Stage Structure (Current)

```
EN (13 stages):
  T0: —                    T1: First Words, Numbers & Colors, Everyday Objects
  T2: Phrases & Verbs, Travel Essentials, Daily Life, At the Airport, Travel Phrases
  T3: Short Sentences, Travel Phrases
  T4: News Headlines, Movie Quotes
  T5: Literature Excerpts

JP (15 stages):
  T0: ひらがな, カタカナ, 濁音・拗音
  T1: ひらがな単語, 挨拶
  T2: 漢字入門, 旅行の基礎, カタカナ語, 空港・駅, 旅行フレーズ
  T3: 日常会話, アニメ・ドラマ
  T4: ニュース見出し, ビジネスメール
  T5: 文学作品

ES (12 stages):
  T1: Primeras Palabras, Saludos
  T2: Acentos (Strict), Viajes Esenciales, Cotidiano, En el Aeropuerto, Frases de Viaje
  T3: Frases Cortas, Conversación
  T4: Noticias, Refranes ← PROVERB STAGE (unlocked)
  T5: Literatura

KR (12 stages):
  T1: 첫 인사, 숫자, 가족·음식
  T2: 일상 단어, 여행 기초, 시간·장소, 공항·역에서, 여행 회화
  T3: 짧은 문장, 자기소개
  T4: 뉴스 헤드라인
  T5: 한국 문화 단락
```

---

## 5. Locked Stages — ALL UNLOCKED ✓

All previously locked stages are now unlocked by adding missing corpus types:

| Stage | Language | Corpus Added | Status |
|-------|----------|-------------|--------|
| en_4_2 | EN | `quotes` (10 movie quotes) | ✓ Unlocked |
| jp_3_2 | JP | `quotes` (7 anime/drama quotes) | ✓ Unlocked |
| jp_4_2 | JP | `business` (8 business email phrases) | ✓ Unlocked |
| en_5_1 | EN | `passages` (3 literature excerpts) | ✓ Unlocked |
| jp_5_1 | JP | `passages` (3 literature excerpts) | ✓ Unlocked |
| es_5_1 | ES | `passages` (4 literature excerpts) | ✓ Unlocked |
| kr_5_1 | KR | `passages` (3 literature excerpts) | ✓ Unlocked |

**Result:** SAMPLE_STAGES increased from 133 → 140 stages

---

## 6. Available Corpora

```typescript
AVAILABLE_CORPUS = new Set([
  'hiragana_basic',
  'katakana_basic',
  'hiragana_dakuten',
  'hiragana_yoon',
  'sentences',   // Tier 3: Short sentences
  'news',         // Tier 4: News headlines
  'proverbs',     // Tier 4: Refranes / ことわざ / 속담
  'quotes',       // Tier 4: Movie quotes / Anime & drama quotes (NEW)
  'business',     // Tier 4: Business email phrases (JP) (NEW)
  'passages',     // Tier 5: Literature excerpts (NEW)
])
```

---

## 7. Git Commits (Recent)

```
76f8186 — Spin animation fix + scaleX clamp
3cf1574 — Spin animation bounce effect
f8f6129 — Render error handling + early exit guard
31e44a7 — Render loop fix
```

---

## 8. Wiki Content (Proverbs)

**Total wiki proverb pages:** ~22

| Language | Pages | Files |
|----------|-------|-------|
| EN | 7 | early-bird-catches-worm, actions-speak-louder-than-words, practice-makes-perfect, where-there-is-a-will, dont-count-chickens, look-before-you-leap, better-late-than-never, when-in-rome |
| JP | 5 | 七転び八起き, 石の上にも三年, 継続は力なり, 花より団子, 雨降って地固まる, 痘痕も笑窪 |
| KR | 5 | 천 리 길도 한 걸음부터, 칠전팔기, 물은源头부터 흐른다, 소와 돼지도 사이좋게 살다, 배고프면 투자름도能找到 |
| ES | 5 | no-hay-mal, el-que-madruga, del-dicho-al-hecho, camaron-que-se-duerme, mas-vale-tarde-que-nunca |

---

## 9. Dashboard

**URL:** http://localhost:8766/dashboard/index.html

**To start:**
```bash
cd Game/typing_language
python3 -m http.server 8766
```

**Dashboard data files:** `dashboard/data/{en,jp,es,kr}.json`, `dashboard/data/overview.json`

**After changing corpus/stages, regenerate:**
```bash
python3 dashboard/generate_data.py
```

---

## 10. Next Steps

1. **Issue #1 investigation** — Need live browser testing with DevTools to find root cause of blank screen
2. **Wiki ingestion** — Create wiki pages for new corpus sources (movie-quotes, anime-drama-quotes, business-email, literature-passages)
3. **Dashboard regeneration** — Run `generate_data.py` after wiki ingestion
4. **Continue polish** — Any remaining visual bugs from known issues list
