# System: Stage Addition Workflow
# 스테이지 추가 워크플로우 — Language Wiki → Game 파이프라인

> 이 문서는 새로운 주제/카테고리를 게임에 추가할 때의 전단계를 설명한다.
> Language Wiki 콘텐츠가 어떻게 게임 스테이지가 되는지를 체계화한다.

## 1. 파이프라인 개요

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Language/wiki/{lang}/                                                   │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐  │
│  │ raw/{lang}/     │───▶│ wiki/{lang}/     │───▶│ game corpus.ts  │  │
│  │ (출처 원문)      │    │ (인제스트된 어휘) │    │ (게임용 코퍼스)  │  │
│  └─────────────────┘    └──────────────────┘    └─────────────────┘  │
│                                                              │          │
│                                                              ▼          │
│  prototype/src/                                                         │
│  ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐  │
│  │ data/stages.ts  │───▶│ ui/Menu.tsx      │───▶│ 플레이어 선택    │  │
│  │ (스테이지 정의)   │    │ (메뉴 UI)         │    │                 │  │
│  └─────────────────┘    └──────────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. 단계별 체크리스트

### Step 1: Raw 소스 추가 (Language/raw/{lang}/)

**파일명 형식**: `{주제}-vocabulary.md`

**필수 필드**:
- 출처 (source) 표기
- 테이블 형식: 한글 | 로마자 | 의미

**예시**:
```markdown
# Korean Food Vocabulary

> **출처**: 국립국어원 표준국어대사전, TOPIK 1-2급 어휘 목록

| 한글 | 로마자 | 의미 |
| --- | --- | --- |
| 고기 | gogi | meat |
| 생선 | saengseon | fish |
```

### Step 2: Wiki 인제스트 (Language/wiki/{lang}/)

**필요 작업**:
1. `vocabulary/` 폴더에 개별 단어 페이지 생성 (선택, 권장)
2. `index.md` 갱신 — 새 섹션 추가
3. `log.md` 갱신 — ingest 로그 기록

**index.md 섹션 형식**:
```markdown
## Vocabulary (주제 Theme)

### 하위 카테고리 (N entries)

- [[단어]] - 단어 — 의미
```

### Step 3: 게임 코퍼스 추가 (prototype/src/data/corpus.ts)

**추가 위치**: 각 언어별 WORDS 배열 (예: `KR_WORDS`)

**Entry 형식**:
```typescript
// ===== 주제 (Topic) — source: [[source-wiki-page]] =====
// Level 1: 기본
{ id: 'kr_{prefix}_001', display: '단어', jamo: 'ㅈㅏㅁㅗ', meanings: { ko: '단어' }, meaningLang: 'ko', level: 1, category: '주제' },
```

**필드 설명**:
| 필드 | 타입 | 설명 | 예시 |
|------|------|------|------|
| `id` | string | 고유 ID | `'kr_f_001'` |
| `display` | string | 표시할 단어 | `'고기'` |
| `jamo` | string | 자모 분해 (KR만) | `'ㄱㅗㄱㅣ'` |
| `romaji` | string | 로마자 (JP만) | `'gogi'` |
| `meanings` | object | 의미 (언어별) | `{ ko: '고기' }` |
| `meaningLang` | string | 의미 언어 | `'ko'` |
| `level` | number |难度 tier (1-5) | `1` |
| `category` | string | 주제 카테고리 | `'food'` |

**ID 접두사 규칙**:
| 언어 | 접두사 | 예시 |
|------|--------|------|
| EN | `en_` | `en_f_001` |
| JP | `jp_` | `jp_f_001` |
| ES | `es_` | `es_f_001` |
| KR | `kr_` | `kr_f_001` |

### Step 4: 스테이지 정의 (prototype/src/data/stages.ts)

**추가 위치**: 해당 언어의 STAGES 배열

**StageConfig 형식**:
```typescript
{
  id: 'kr_f_1',              // '{lang}_{prefix}_{seq}'
  language: 'kr',             // 'en' | 'jp' | 'es' | 'kr'
  name: '한국 음식',           // 표시명
  description: '기본 음식 어휘', // 플레이어 안내
  difficulty: 1,              // 1 | 2 | 3 | 4 | 5
  wordCount: 10,              // 등장 적 수
  corpusFilter: {
    minLevel: 1,              // 최소难度
    maxLevel: 1,              // 최대难度
    categories: ['food'],     // 카테고리 필터
  },
  romajiHint: true,           // JP/KR: romaji 힌트 표시
  missions: defaultMissionsForTier(1),  // 자동 미션
},
```

**Stage ID 규칙**:
```
{lang}_{prefix}_{seq}
 예: kr_f_1, kr_b_2, kr_e_1
```

### Step 5: 메뉴 UI 갱신 (prototype/src/ui/Menu.tsx)

**필요 작업**:
1. 새 카테고리 StageCard 추가
2. `data-stage-id` 属性 설정
3. `selected` prop (keyboard navigation용)

**예시**:
```tsx
<StageCard
  data-stage-id="kr_f_1"
  selected={selectedStage?.id === 'kr_f_1'}
  onSelect={() => handleSelectStage('kr_f_1')}
>
  <StageIcon category="food" />
  <StageName>한국 음식</StageName>
  <DifficultyBadge difficulty={1} />
</StageCard>
```

## 3. 카테고리 네이밍 컨벤션

### 현재 카테고리 (corpus.ts)

| 카테고리 | 언어 | 설명 |
|----------|------|------|
| `hiragana_basic` | JP | 기본 히라가나 46자 |
| `katakana_basic` | JP | 기본 카타카나 46자 |
| `hiragana_dakuten` | JP | 탁음/반탁음 |
| `hiragana_yoon` | JP | 요음 (きゃ, しゅ等) |
| `katakana_words` | JP | 카타카나 외래어 |
| `greeting` | EN/JP/ES/KR | 인사 |
| `basic` | EN/ES/KR | 기본 어휘 |
| `number` | EN/JP/ES/KR | 숫자 |
| `color` | EN/JP/ES | 색상 |
| `food` | EN/JP/ES/KR | 음식 |
| `family` | EN/JP/ES/KR | 가족 |
| `place` | EN/JP/ES/KR | 장소 |
| `person` | EN/JP/ES/KR | 사람 |
| `time` | EN/JP/ES/KR | 시간 |
| `travel` | EN/JP/ES/KR | 여행 |
| `romance` | EN/JP/ES/KR | 연애/로맨스 |
| `business` | KR | 비즈니스 |
| `emotion` | KR | 감정/성격 |
| `object` | EN/JP/ES | 사물 |
| `adjective` | EN/ES | 형용사 |
| `verb` | EN | 동사 |
| `conversation` | ES | 회화 |
| `sentence` | EN/JP/ES/KR | 문장 |

### 신규 카테고리 추가 규칙

1. **소문자** 사용 (space 대신 underscore 권장)
2. **언어별 고유한 경우** language prefix 사용 (例: `hiragana_basic`)
3. **공통 카테고리**는 언어 무관 공용 (例: `food`, `travel`)

## 4. 언어별 코퍼스 Entry 형식

### English (EN)

```typescript
{ id: 'en_f_001', display: 'apple', meanings: { en: 'apple', es: 'manzana', ja: 'りんご', ko: '사과' }, meaningLang: 'en', level: 1, category: 'food' },
```

### Japanese (JP)

```typescript
{ id: 'jp_f_001', display: 'りんご', romaji: 'ringo', meanings: { ko: '사과' }, meaningLang: 'ko', level: 1, category: 'food' },
```

### Spanish (ES)

```typescript
{ id: 'es_f_001', display: 'manzana', meanings: { ko: '사과' }, meaningLang: 'ko', level: 1, category: 'food', accentMode: 'any' },
```

### Korean (KR)

```typescript
{ id: 'kr_f_001', display: '사과', jamo: 'ㅅㅏㄱㅘ', meanings: { ko: '사과' }, meaningLang: 'ko', level: 1, category: 'food' },
```

## 5. Tier vs Level 매핑

| Tier (스테이지) | Level (코퍼스) | CEFR | 설명 |
|-----------------|----------------|------|------|
| 1 | 1 | A1~A2 | 기본 단어 |
| 2 | 2 | A2~B1 | 확장 어휘 |
| 3 | 3 | B1~B2 | 짧은 문장 |
| 4 | 4 | B2~C1 | 긴 문장 |
| 5 | 5 | C1~C2 | 단락 |

**핵심 규칙**: Tier N 스테이지는 보통 `minLevel: N, maxLevel: N` 범위 사용

## 6. 단계별 실습: "비즈니스" 한국어 스테이지 추가

### 현재 상태 (2026-06-22 완료分)

| 단계 | 상태 | 비고 |
|------|------|------|
| Step 1: Raw 추가 | ✅ 완료 | `raw/Korean/business-vocabulary.md` |
| Step 2: Wiki 인제스트 | ✅ 완료 | `index.md` Business 섹션 추가 |
| Step 3: 코퍼스 추가 | ✅ 완료 | `kr_b_001` ~ `kr_b_063` |
| Step 4: 스테이지 정의 | 🔲 미완료 | stages.ts에 정의 필요 |
| Step 5: 메뉴 UI | 🔲 미완료 | Menu.tsx에 StageCard 추가 |

### Step 4 예시 (stages.ts에 추가할 내용)

```typescript
// Korean - Business
{ id: 'kr_b_1', language: 'kr', tier: 2, name: '비즈니스 기본', difficulty: 2, wordCount: 10,
  corpusFilter: { minLevel: 1, maxLevel: 2, categories: ['business'] },
  romajiHint: true,
  missions: defaultMissionsForTier(2) },
```

## 7. 체크리스트 템플릿

새 주제 추가 시 이 체크리스트 사용:

```markdown
## [주제명] 추가 체크리스트

### Language侧
- [ ] `raw/{lang}/{topic}-vocabulary.md` 생성
- [ ] `wiki/{lang}/index.md` 갱신 (섹션 추가)
- [ ] `wiki/{lang}/log.md` ingest 로그 기록

### Game侧
- [ ] `prototype/src/data/corpus.ts`에 코퍼스 추가 (ID: `{lang}_{prefix}_001` ~)
- [ ] `prototype/src/data/stages.ts`에 스테이지 정의
- [ ] `prototype/src/ui/Menu.tsx`에 StageCard 추가
- [ ] Build 확인 (`npm run build`)
- [ ] Typecheck 확인 (`npm run typecheck`)
- [ ] 테스트 확인 (`npm test`)
```

## 8. 관련 파일索引

| 파일 | 역할 |
|------|------|
| `Language/raw/{lang}/*.md` | 원본 출처 (읽기 전용) |
| `Language/wiki/{lang}/index.md` | Wiki 인덱스 |
| `Language/wiki/{lang}/log.md` | 활동 로그 |
| `prototype/src/data/corpus.ts` | 게임 코퍼스 |
| `prototype/src/data/stages.ts` | 스테이지 정의 |
| `prototype/src/ui/Menu.tsx` | 스테이지 선택 UI |
| `design/systems/stage.md` | 스테이지 시스템 설계 |
| `design/StageDesignSpec.md` | 스테이지 카탈로그 |

## 9. 다음 단계

1. **美食/요리** → Stage kr_f_1 추가 (Step 4, 5 미완료)
2. **비즈니스** → Stage kr_b_1 추가 (Step 4, 5 미완료)
3. **감정/성격** → Stage kr_e_1 추가 (Step 4, 5 미완료)
4. 기존 한국어 스테이지 (kr_1_1, kr_1_2 등) 손상 여부 확인
