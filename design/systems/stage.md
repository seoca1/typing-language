# System: Stage (스테이지)

> Pillar 3 (스테이지형 난이도 곡선) 의 핵심. 게임의 진행 구조.

## 책임

1. 스테이지 정의/선택
2. 적 등장 순서 관리
3. 난이도 곡선 적용
4. 스테이지 시작/종료/결과

## 상위 설계 문서

**`design/StageDesignSpec.md`** — 6 티어 × 4 언어 = 40개 스테이지 풀 카탈로그. 본 문서는 시스템 동작 위주.

## 스테이지 정의

```typescript
interface StageConfig {
  id: string;                     // '{lang}_{tier}_{seq}' 예: 'jp_0_1'
  language: 'en' | 'jp' | 'es' | 'kr';
  name: string;                   // 표시명
  description: string;            // 플레이어 안내
  difficulty: 1 | 2 | 3 | 4 | 5;  // 1=초급, 5=고급
  wordCount: number;              // 등장할 적 수
  timeLimit?: number;             // 초 (선택)
  corpusFilter: {
    minLevel?: number;            // JLPT/DELE/TOPIK 등급
    maxLevel?: number;
    categories?: string[];        // 테마 필터 (JP Tier 0: 'hiragana_basic' 등)
  };
  accentMode?: 'strict' | 'loose'; // ES 한정
  romajiHint?: boolean;           // JP/KR 한정, romaja 힌트 표시
  missions: MissionConfig[];      // 미션 (1+)
  unlockRequirement?: number;     // 해금에 필요한 누적 점수
}
```

## 티어 (6단계)

| Tier | 라벨 | 길이 | 비고 |
| --- | --- | --- | --- |
| 0 | 문자 | 1글자 | **JP 전용** (히라가나/가타가나) |
| 1 | 단어 | 3~8자 | A1/A2 |
| 2 | 단어 확장 | 6~15자 | A2/B1 |
| 3 | 짧은 문장 | 10~30자 | B1/B2 |
| 4 | 긴 문장 | 30~60자 | B2/C1 |
| 5 | 단락 | 60+자 | C1/C2 |

## 풀 카탈로그 (40개)

자세한 표: `design/StageDesignSpec.md` §3.

| 언어 | Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 | 합계 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EN | — | 3 | 2 | 2 | 2 | 1 | 10 |
| JP | 3 | 2 | 2 | 2 | 2 | 1 | 12 |
| ES | — | 2 | 2 | 2 | 2 | 1 | 9 |
| KR | — | 3 | 2 | 2 | 1 | 1 | 9 |
| **합계** | **3** | **10** | **8** | **8** | **7** | **4** | **40** |

### JP Tier 0 (유일한 문자 입력 단계)

| ID | 내용 | 데이터 |
| --- | --- | --- |
| jp_0_1 | 히라가나 기본 46자 | `corpus.JP_CHARS.hiragana_basic` |
| jp_0_2 | 가타카나 기본 46자 | `corpus.JP_CHARS.katakana_basic` |
| jp_0_3 | 탁음/반탁음/요음 | `corpus.JP_CHARS.hiragana_dakuten` + `JP_CHARS.hiragana_yoon` |

다른 언어는 문자 단위 입력이 비현실적(EN/ES 알파벳 = "단어 입력"과 동일, KR 자모 = 단어의 부분)이므로 Tier 0 없음.

## 난이도 곡선

### 그래프 (개념)

```
난이도
  5 │                                      ╭──● passages
  4 │                              ╭───────●  sentences+
  3 │                      ╭───────●        sentences
  2 │              ╭───────●                words+
  1 │      ╭───────●                        words
  0 │ ● (JP only)                          chars
    └──────────────────────────────────────────────
      1   2   3   4   5   6   7   8   9  10  11
```

### 곡선 원칙

1. **Tier 0~1 (chars/words)**: 짧은 입력, 강한 힌트 (romaji)
2. **Tier 2~3 (words+/sentences)**: 중간 길이, 보통 힌트
3. **Tier 4~5 (sentences+/passages)**: 긴 입력, 약한 힌트, 빠른 등장

### 적 등장 간격 (SPAWN_INTERVAL)

| Tier | 간격 (ms) | 비고 |
| --- | --- | --- |
| 0 | 4000 | 한 글자, 여유 |
| 1 | 4000 | 단어 |
| 2 | 3500 | |
| 3 | 3000 | 문장 |
| 4 | 2500 | 긴 문장 |
| 5 | 2000 | 패시지 |

## 자동 미션 생성

`stages.ts > defaultMissionsForTier(tier)` 헬퍼로 티어별 기본 미션 자동 생성:

| Tier | 미션 |
| --- | --- |
| 0 | 정확도 95% + 15 처치 |
| 1 | 5 처치 |
| 2 | 8 처치 + 콤보 5 |
| 3 | 8 처치 + 정확도 85% + WPM 20 |
| 4 | 5 처치 + 정확도 80% + 콤보 10 |
| 5 | 4 처치 + 정확도 75% + WPM 25 |

## 해금 메커니즘

### 선형 해금 (v1)

기본 정책: 각 언어의 Tier N 클리어 시 Tier (N+1) 해금.

### 초기 해금

`player.unlockedStages` 초기값:
- `en_1_1` (EN 첫 단어)
- `jp_0_1`, `jp_0_2`, `jp_1_1` (JP 문자 → 단어)
- `es_1_1` (ES 첫 단어)
- `kr_1_1` (KR 첫 인사)

## 스테이지 진행 흐름

```
[스테이지 시작]
    ↓
[적 등장] — 랜덤 코퍼스 선택
    ↓ 플레이어 타이핑
[적 처치] → 이펙트 → 다음 등장
    ↓
... (wordCount 회)
    ↓
[스테이지 종료] — 모든 적 처치 OR 시간 초과
    ↓
[스테이지 결과] — 미션 평가
```

## JP Tier 0 특이사항

Tier 0 스테이지는 메인 코퍼스(`CORPUS.jp`)가 아닌 **JP_CHARS** 코퍼스를 사용:

```typescript
if (stage.language === 'jp' && stage.corpusFilter.categories) {
  const cat = stage.corpusFilter.categories[0];
  if (cat in JP_CHARS) corpus = JP_CHARS[cat];  // 'hiragana_basic' | 'katakana_basic' | ...
}
```

`JapaneseHandler`는 그대로 사용 — display=kana, input=romaji 매칭이 정확히 이 케이스.

## 미해결 질문

- [ ] 점수 기반 해금 (unlockRequirement) 활성화
- [ ] 다중 언어 혼합 스테이지 (예: EN + JP 한 판에)
- [ ] 보스/특수 스테이지 (긴 문장 1개, 타이머 짧음)

## 다음 단계

- 미션 시스템: `design/systems/mission.md`
- 메타 진행: `design/systems/progression.md`
- 구현: `prototype/src/stage/`, `prototype/src/data/stages.ts`
- 테스트: `testcases/stage.md`