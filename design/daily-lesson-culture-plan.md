# Daily Lesson — 문화 페이지 계층화 개선 계획

**상태**: ✅ Complete — Phase A/B/C/D/F 구현 완료, Phase E는 optional future
**작성일**: 2026-06-24
**최종 갱신**: 2026-06-24
**관련**: `decisions/0011-extensible-languages.md`, `wiki/corpus-pipeline.md`

---

## 1. 현황 분석

### 1.1 문제: 모든 EN/JP/KR lesson이 동일한 문화 페이지를 공유

| 언어 | lesson 수 | culture 페이지 | 문제 |
|------|-----------|-------------|------|
| EN | 13 | `english-dating-culture.md` (×13) | ✅ 올바른 lesson: dating-romance<br>❌ 잘못된 lesson: technology, health, sports |
| JP | 11 | `japanese-dating-culture.md` (×11) | ✅ 올바른 lesson: dating-romance-jp<br>❌ 잘못된 lesson: technology, health, food |
| KR | 11 | `korean-dating-culture.md` (×11) | ✅ 올바른 lesson: dating-romance-kr<br>❌ 잘못된 lesson: technology, health, food |
| ES | 10 | 5개 다양 (문학 기반) + 5개 중 2개 dating | ✅ literature lessons은 올바른 culture<br>❌ travel, celebrations도 dating culture |

### 1.2 근본 원인

**build-daily-lessons.py의 culture page 선택 로직:**

```python
# 1단계: 소스 파일의 culture 인용 섹션에서 wikilink 추출
culture_links = extract_section_wikilinks(body, "culture 인용")
# → 현재 Language wiki 소스 파일에 culture 인용이 없음 → 빈 리스트

# 2단계: wikilink로 직접 매칭
for link in culture_links:
    if target and target in wiki["culture"]:
        culture_page = wiki["culture"][target]
        break

# 3단계: 폴백 — 키워드 매칭 → 없으면 첫 번째 culture 페이지
# 문제: 키워드 매칭이 "english-dating-culture" vs "technology-and-internet" 실패
# → 결국 iter(wiki["culture"].values())[0] = "english-dating-culture"
```

**Language wiki의 현재 상태:**
- 소스 파일에 `culture 인용` 섹션이 없음 → culture_links = []
- 폴백 키워드 매칭 실패 → 가장 먼저 로드된 culture 페이지 (alphabetical first)

### 1.3 dailyLessons.json wikiIndex 분석

| category | 수 | 비고 |
|----------|---|------|
| vocabulary | 292 | 4개 언어 통합 |
| expression | 24 | 부족 |
| culture | 8 | **EN: 1, JP: 1, KR: 1, ES: 5** — 주제별 불균형 |
| **Total** | **324** | |

### 1.4 DailyLessonModal UI 구조 (정상)

```
📜 원문 자료 (raw.excerpt)
📚 어휘 (N/M)     ← vocab wiki page (상세 보기)
💬 표현 (N/M)     ← expression wiki page (상세 보기)
🌏 문화           ← culture wiki page (Standard+)
```

- 구조 자체는 문제 없음
- **문제**: culture page content가 lesson topic과 불일치

---

## 2. 해결 방안

### 2.1 계층적 culture page 전략

각 lesson의 topic에 맞는 culture page를 직접 선택:

| lesson topic | culture page | 상세 |
|---|---|---|
| `travel` | `travel-culture.md` | 교통,礼仪, 목적지 문화 |
| `technology` | `technology-culture.md` | 디지털 에티켓, 온라인 문화 |
| `health` | `health-culture.md` | 의료 시스템, 건강 관념 |
| `food` | `food-culture.md` | 식사 예절, 음식 문화 |
| `holidays` | `holidays-culture.md` | 명절, 축제, 의식 |
| `shopping` | `shopping-culture.md` | 상거래 문화, 팁 |
| `work` | `work-culture.md` | 직장 예절, 미팅 |
| `sports` | `sports-culture.md` | 스포츠 문화, 팬 |
| `dating` | `dating-culture.md` | 연애 문화 (기존) |
| `daily-life` | `daily-culture.md` | 일상 문화 |

### 2.2 Language wiki 구조 설계

```
Language/
├── raw/                          # 원본 자료 (읽기 전용, 출처 명시)
│   └── {Lang}/
│       ├── first-travel-japan.md
│       ├── technology.md
│       ├── health.md
│       └── ...
│
├── wiki/
│   └── {Lang}/
│       ├── sources/              # Lesson 소스 hub 페이지
│       │   ├── first-travel-japan.md   ← 소스 파일 (원문 발췌 + 인용)
│       │   ├── technology.md
│       │   └── ...
│       ├── vocabulary/           # 단어 wiki 페이지
│       │   ├── kuukou.md
│       │   ├── ...
│       ├── expressions/          # 표현 wiki 페이지
│       │   ├── where-is.md
│       │   └── ...
│       └── culture/              # 🌏 문화 페이지 ← 핵심 개선 대상
│           ├── english-dating-culture.md
│           ├── english-travel-culture.md     ← NEW
│           ├── english-technology-culture.md ← NEW
│           ├── english-food-culture.md       ← NEW
│           ├── japanese-dating-culture.md
│           ├── japanese-travel-culture.md    ← NEW
│           └── ...
```

### 2.3 소스 파일의 culture 인용 형식

```yaml
## Sources / 인용 / Sources

### culture 인용 (culture citations)
- [[english-travel-culture]] — 여행 관련 문화
```

이렇게 인용하면 build 스크립트가 자동으로 해당 culture page를 lesson에 연결.

---

## 3. 구현 계획 (Phase별)

### Phase A: EN culture pages 생성 (6개) ✅
- [x] `english-dating-culture.md` — 기존 (dating/romance)
- [x] `english-travel-culture.md` — travel-adventure, travel, first-travel-japan
- [x] `english-technology-culture.md` — technology-and-internet
- [x] `english-food-culture.md` — food-and-dining
- [x] `english-health-culture.md` — health-and-body
- [x] `english-holidays-culture.md` — holidays-and-celebrations
- [x] `english-sports-culture.md` — sports-and-hobbies
- [x] `english-business-culture.md` — work-and-career
- [x] `english-shopping-culture.md` — shopping-and-money
- [x] `english-daily-life-culture.md` — daily-life-basics

### Phase B: JP culture pages 생성 (6개) ✅
- [x] `japanese-dating-culture.md` — 기존
- [x] `japanese-travel-culture.md`
- [x] `japanese-technology-culture.md`
- [x] `japanese-food-culture.md`
- [x] `japanese-health-culture.md`
- [x] `japanese-holidays-culture.md`
- [x] `japanese-sports-culture.md` — sports-and-hobbies
- [x] `japanese-shopping-culture.md` — shopping-and-money
- [x] `japanese-daily-life-culture.md` — daily-life-basics

### Phase C: KR culture pages 생성 (8개) ✅
- [x] `korean-dating-culture.md` — 기존
- [x] `korean-travel-culture.md`
- [x] `korean-food-culture.md`
- [x] `korean-technology-culture.md` — technology-and-internet
- [x] `korean-health-culture.md` — health-and-body
- [x] `korean-holidays-culture.md` — holidays-and-celebrations
- [x] `korean-daily-life-culture.md` — daily-life-basics
- [x] `korean-sports-culture.md` — sports-and-hobbies
- [x] `korean-shopping-culture.md` — shopping-and-money

### Phase D: ES culture pages 개선 (4개) ✅
- [x] 기존 literature culture pages 유지
- [x] `spanish-travel-culture.md` — first-travel-spain, viaje-aventura
- [x] `spanish-food-culture.md` — comida-y-restaurante
- [x] `spanish-holidays-culture.md` — fiestas-y-celebraciones
- [x] `spanish-business-culture.md` — trabajo-y-carrera

### Phase E: Language wiki 소스 파일 생성 (optional future)
- [ ] 각 lesson topic당 1개 source 파일 생성
- [ ] `## culture 인용` 섹션에 올바른 culture page wikilink 추가
- [ ] `## Vocabulary 인용`, `## Expressions 인용` 추가

> **Note:** Phase E is optional — `TOPIC_KEYWORD_MAP` + keyword matching (Phase F ✅) already achieves 45/45 topic-appropriate culture assignment without explicit wikilinks. Phase E adds explicitness and maintainability but requires editing 45 source files. Consider doing this when adding new lessons rather than backfilling existing ones.

### Phase F: build 스크립트 개선 ✅
- [x] 폴백 시 키워드 기반 문화 페이지 선택 개선 (TOPIC_KEYWORD_MAP)
- [x] lesson topic 키워드 → culture page stem 매칭 정확도 향상 (expanded_keywords + full-stem check)
- [x] 폴백 culture가 topic과 무관할 때 경고 로그 (score < 0.5)

---

## 4. 검증 방법

### 4.1 build 후 검증 쿼리

```bash
python3 -c "
import json
with open('prototype/src/data/dailyLessons.json') as f:
    d = json.load(f)
lessons = d['lessons']
culture_by_lesson = {}
for l in lessons:
    cid = l.get('wikiOutput',{}).get('culturePage','NONE') or 'NONE'
    culture_by_lesson[cid] = culture_by_lesson.get(cid,0) + 1
for cid, cnt in sorted(culture_by_lesson.items(), key=lambda x: -x[1]):
    print(f'{cnt:3d} lessons: {cid}')
"
```

### 4.2 성공 기준

| 지표 | 이전 | 목표 | 현재 |
|------|------|------|------|
| culture page 종류 (EN) | 1개 | 6개+ | **10개** ✅ |
| culture page 종류 (JP) | 1개 | 6개+ | **9개** ✅ |
| culture page 종류 (KR) | 1개 | 3개+ | **11개** ✅ |
| culture page 종류 (ES) | 3개 | 5개+ | **14개** ✅ |
| topic-culture 불일치 lesson | 37개 | 0개 | **0개** ✅ |
| lessons with culture | 8/45 | 45/45 | **45/45** ✅ |

---

## 5. UI Tier별 culture 표시 정책

| Tier | 시간 | culture 표시 | 비고 |
|------|------|-------------|------|
| Quick | 1분 | ❌ 숨김 ✅ | 어휘 미리보기만 |
| Standard | 5분 | ✅ topic-적절한 culture | 모든 lesson에 topic-적절한 culture page 배정됨 |
| Deep | 10분 | ✅ 전체 culture + TTS | 전체 content + 음성 지원 |

**Implementation:** `DailyLessonModal.tsx` — quick tier `culture: null` override

---

## 6. 열린 질문

- [x] ~~Language wiki를 별도 repo로 분리할지?~~ → 이미 결정: `/Users/emilio/projects/Projects/Language/` (별도 upstream)
- [x] ~~culture page의 최소/최대 길이는?~~ → 상관없음; topic-appropriate content 우선
- [x] ~~Tier 0 (JP 히라가나/카타카나) lessons의 culture는?~~ → daily lessons corpus는 JP source hub 기반이므로 적절한 culture page 배정됨
- [x] ~~DailyLessonCard의 "🌏 1" 표시 — culture가 없으면 숨길지?~~ → Quick tier culture 숨김 구현 완료; DailyLessonCard는 항상 culture count 1임 (45/45 lessons에 culture page 있음)
