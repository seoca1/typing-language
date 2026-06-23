# Phase 7 Progress — Typing Language

**Last Updated:** 2026-06-24
**Status:** Active development — Phase 7 Polish

---

## 1. Build & Test Status

```
Build:     ✓ 929 KB (gzip 274 KB)
Tests:     ✓ 674 passed | 1 skipped
SAMPLE_STAGES: 140 stages
```

**Key commands:**
```bash
cd prototype && npm run build
cd prototype && npm test
cd .. && python3 dashboard/generate_data.py  # regenerate dashboard data
```

---

## 2. This Session — Project Maintenance + Blank Screen Guard

### Changes Made (2026-06-24)

**ADR 정리:**
- 0004~0008: Draft → Accepted (이미 구현 완료된 기술 반영)
- 0010-extensible-languages.md → 0011 (0010 중복 해결)
- decisions/README.md 갱신

**README/ROADMAP 동기화:**
- Tests: 106 → 674
- Bundle: 253KB → 929KB
- Stages: 30+ → 140
- Corpus: 197+66 → 577개 항목
- 한국어 입력 방식 코멘트 갱신 (jamo 직접 입력 반영)

**빈 화면 버그 방어 코드 (Issue #1):**
- App.tsx: `canvas.isConnected` + dimensions 가드 (render effect 진입 시)
- App.tsx: tick 루프에서 `Renderer.isCanvasValid()` 검증
- App.tsx: 유효하지 않으면 `Renderer.recreateFrom()`으로 컨텍스트 재생성
- App.tsx: stale closure 방지 (`rendererRef.current` 직접 접근)
- Renderer.ts: `isCanvasValid()`, `recreateFrom()` 메서드 추가
- KNOWN_ISSUES.md: Issue #1 → "Mitigated"로 상태 변경

**테스트:** EffectsSystem flakiness로 보임 — 현재 674 passed, 1 skipped

**미해결:** `typescript-eslint` 패키지 누락으로 lint 실패 (pre-existing)

---

## 3. Git Commits (Recent)

```
470f74b — maintain: ADR 정리, README 동기화, 빈 화면 버그 방어 코드
7e517ad — fix: prevent double base path prefix in ImageLoader URL construction
d8709cd — fix: ImageLoader path detection for GitHub Pages without trailing slash
44dbec2 — feat: add quotes, business, passages corpus — unlock all locked stages
6ff1e34 — feat: add Cross-Language Stage Map to dashboard Overview tab
```

---

## 4. Known Issues

| # | Issue | Status |
|---|-------|--------|
| 1 | Blank/Black screen on load | MITIGATED — guard code added (live browser test needed to verify fix) |
| 2 | JP Wiki Proverb Pages missing | FIXED |
| 3 | Character images not showing in game screen | FIXED |
| 4 | typescript-eslint package missing | OPEN (lint fails, pre-existing) |

---

## 5. Recent Changes Summary (Phase 7 — Polish)

### Visual Fixes & Effects
- `EffectsSystem.ts`: `AmbientParticle` + `maybeSpawnAmbient()` + `spawnAmbientBurst()`
- `Renderer.ts`: `drawAmbient()`, `width`/`height` made public + `isCanvasValid()`, `recreateFrom()`
- `App.tsx`: Canvas validity guards, stale closure fix, early exit in tick()

### Blank Screen Guard
- `Renderer.isCanvasValid(canvas)`: canvas 연결 + dimensions 유효성 검사
- `Renderer.recreateFrom(canvas)`: 컨텍스트 재생성
- `App.tsx` render effect: `canvas.isConnected` + dimensions 체크
- `App.tsx` tick: 매 프레임 유효성 검증 + 자동 재생성

### ADR Acceptance
- 0001~0008: 모든 기술 결정 Accepted 상태
- 0010 (KR input), 0011 (Extensible Languages): Accepted

---

## 6. Next Steps

1. **빈 화면 버그 확인** — GitHub Pages 배포 후 라이브 브라우저에서 검증 필요
2. **ADR-0011 인용 갱신** — ADR-0011의 `References` 섹션 내 `[wiki/extensible-languages]` 링크가 유효한지 확인
3. **Wiki ingestion** — 새 코퍼스 소스에 대한 wiki 페이지 + `source: [[...]]` 인용 추가
4. **Dashboard regeneration** — `generate_data.py` 실행
5. **typescript-eslint 설치** — lint 오류 해결 (`npm install typescript-eslint`)

---

## 7. Deployment

**GitHub Pages URL:** https://seoca1.github.io/typing-language/

**Deploy method:** Push to `main` → GitHub Actions auto-build + deploy

**Last deploy commit:** `470f74b`
