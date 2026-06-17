# Stage Design Spec — 단어부터 장문까지 단계화

> 스테이지 카탈로그, 난이도 곡선, 해금 메커니즘, 데이터 요구사항.
> 자세한 시스템 동작: `design/systems/stage.md` (구버전 — 본 문서가 상위 spec).

## 1. 난이도 티어 (6단계)

| 티어 | 코드 | 정의 | 대상 | 입력 길이 |
| --- | --- | --- | --- | --- |
| **0** | `chars` | 문자 1개 (히라가나/가타가나) | JP 전용, 입문자 | 1 글자 |
| **1** | `words` | 단어 (한 단어/한 명사) | A1~A2 | 3~8 글자 |
| **2** | `words+` | 단어 확장 (긴 단어/복합어) | A2~B1 | 6~15 글자 |
| **3** | `sentences` | 짧은 문장 (1줄) | B1~B2 | 10~30 글자 |
| **4** | `sentences+` | 중간 문장 (1~2줄) | B2~C1 | 30~60 글자 |
| **5** | `passages` | 긴 문장/단락 (3줄+) | C1~C2 | 60+ 글자 |

### 티어 진행 곡선

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

### 등급 라벨 매핑

| 티어 | 라벨 | CEFR | JLPT | DELE | TOPIK |
| --- | --- | --- | --- | --- | --- |
| 0 | 입문 | — | — | — | — |
| 1 | 초급 | A1 | N5 | A1 | 1급 |
| 2 | 초중급 | A2~B1 | N4 | A2 | 2급 |
| 3 | 중급 | B1~B2 | N3 | B1 | 3급 |
| 4 | 중상급 | B2~C1 | N2 | B2 | 4급 |
| 5 | 고급 | C1~C2 | N1 | C1~C2 | 5~6급 |

## 2. 스테이지 ID 규칙

```
{language}_{tier}_{sequence}

language: en | jp | es | kr
tier:     0 (chars) | 1 (words) | 2 (words+) | 3 (sentences) | 4 (sentences+) | 5 (passages)
sequence: 1, 2, 3 (스테이지 순서)

예: jp_0_1, en_1_1, kr_3_2
```

## 3. 언어별 풀 스테이지 카탈로그

### 3.1 English (EN)

| ID | 이름 | 티어 | 적 수 | 코퍼스 필터 | 미션 |
| --- | --- | --- | --- | --- | --- |
| en_1_1 | First Words | 1 | 10 | A1, category=greeting/basic | 5 처치 |
| en_1_2 | Numbers & Colors | 1 | 12 | A1, category=number/color | 카테고리 5 처치 |
| en_1_3 | Everyday Objects | 1 | 10 | A1, category=object/food | 정확도 90% |
| en_2_1 | Phrases & Verbs | 2 | 12 | A2, mix | 콤보 5 |
| en_2_2 | Daily Life | 2 | 15 | A2, mix | 10 처치 |
| en_3_1 | Short Sentences | 3 | 10 | B1, sentences | 정확도 85% + 5 처치 |
| en_3_2 | Travel Phrases | 3 | 8 | B1, sentences/travel | WPM 25 |
| en_4_1 | News Headlines | 4 | 8 | B2, sentences | 정확도 80% |
| en_4_2 | Movie Quotes | 4 | 6 | C1, sentences | 콤보 10 |
| en_5_1 | Literature Excerpts | 5 | 5 | C2, passages | 정확도 75% + WPM 30 |

**총 10개 스테이지**

### 3.2 Japanese (JP) — 유일하게 6 티어 모두

| ID | 이름 | 티어 | 적 수 | 코퍼스 필터 | 미션 |
| --- | --- | --- | --- | --- | --- |
| jp_0_1 | ひらがな (기본 46자) | 0 | 20 | hiragana_basic | 정확도 95% |
| jp_0_2 | カタカナ (기본 46자) | 0 | 20 | katakana_basic | 정확도 95% |
| jp_0_3 | 濁音・拗音 (탁음/요음) | 0 | 18 | hiragana_dakuten + yoon | 정확도 90% |
| jp_1_1 | ひらがな単語 | 1 | 10 | N5, hiragana_only | 5 처치 |
| jp_1_2 | 挨拶 | 1 | 12 | N5, category=greeting | 카테고리 5 처치 |
| jp_2_1 | 漢字入門 | 2 | 12 | N4, mix | 콤보 5 |
| jp_2_2 | カタカナ語 | 2 | 10 | N4, katakana_words | 정확도 90% |
| jp_3_1 | 日常会話 | 3 | 10 | N3, sentences | WPM 20 |
| jp_3_2 | アニメ・ドラマの名台詞 | 3 | 8 | N3, sentences | 콤보 8 |
| jp_4_1 | ニュース見出し | 4 | 8 | N2, sentences | 정확도 80% |
| jp_4_2 | ビジネスメール | 4 | 6 | N2, sentences | WPM 25 |
| jp_5_1 | 文学作品 | 5 | 5 | N1, passages | 정확도 75% + WPM 30 |

**총 12개 스테이지 (Tier 0: 3개 + Tier 1~5: 9개)**

### 3.3 Spanish (ES)

| ID | 이름 | 티어 | 적 수 | 코퍼스 필터 | accentMode | 미션 |
| --- | --- | --- | --- | --- | --- | --- |
| es_1_1 | Primeras Palabras | 1 | 10 | A1, mix | loose | 5 처치 |
| es_1_2 | Saludos | 1 | 12 | A1, category=greeting | loose | 카테고리 5 처치 |
| es_2_1 | Acentos (Strict 시작) | 2 | 10 | A2, accentMode=strict | strict | 정확도 90% |
| es_2_2 | Cotidiano | 2 | 12 | A2, mix | strict | 콤보 5 |
| es_3_1 | Frases Cortas | 3 | 10 | B1, sentences | strict | WPM 20 |
| es_3_2 | Conversación | 3 | 8 | B1, sentences | strict | 정확도 85% |
| es_4_1 | Noticias | 4 | 8 | B2, sentences | strict | 콤보 10 |
| es_4_2 | Refranes | 4 | 6 | C1, sentences | strict | 정확도 80% |
| es_5_1 | Literatura | 5 | 5 | C2, passages | strict | WPM 30 + 정확도 75% |

**총 9개 스테이지**

### 3.4 Korean (KR)

| ID | 이름 | 티어 | 적 수 | 코퍼스 필터 | 미션 |
| --- | --- | --- | --- | --- | --- |
| kr_1_1 | 첫 인사 | 1 | 8 | TOPIK 1, category=greeting/basic | 카테고리 5 처치 |
| kr_1_2 | 숫자 | 1 | 10 | TOPIK 1, category=number | 정확도 90% |
| kr_1_3 | 가족·음식 | 1 | 10 | TOPIK 1, category=family/food | 5 처치 |
| kr_2_1 | 일상 단어 | 2 | 12 | TOPIK 2, mix | 콤보 5 |
| kr_2_2 | 시간·장소 | 2 | 12 | TOPIK 2, category=time/place | WPM 20 |
| kr_3_1 | 짧은 문장 | 3 | 10 | TOPIK 3, sentences | 정확도 85% |
| kr_3_2 | 자기소개 | 3 | 8 | TOPIK 3, sentences | 콤보 8 |
| kr_4_1 | 뉴스 헤드라인 | 4 | 8 | TOPIK 4, sentences | 정확도 80% |
| kr_5_1 | 한국 문화 단락 | 5 | 5 | TOPIK 5~6, passages | WPM 25 + 정확도 75% |

**총 9개 스테이지**

### 전체 합계: 40개 스테이지

| 언어 | Tier 0 | Tier 1 | Tier 2 | Tier 3 | Tier 4 | Tier 5 | 합계 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| EN | — | 3 | 2 | 2 | 2 | 1 | 10 |
| JP | 3 | 2 | 2 | 2 | 2 | 1 | 12 |
| ES | — | 2 | 2 | 2 | 2 | 1 | 9 |
| KR | — | 3 | 2 | 2 | 1 | 1 | 9 |
| **합계** | **3** | **10** | **8** | **8** | **7** | **4** | **40** |

## 4. 해금 메커니즘

### 4.1 선형 해금 (v1 기본)

기본 정책: 각 언어의 Tier N 클리어 시 Tier (N+1) 해금.

```
tier 0 (JP chars) → tier 1 → tier 2 → tier 3 → tier 4 → tier 5
```

EN 예: en_1_1 클리어 → en_1_2 해금, en_1_3 해금, en_2_1 해금.

### 4.2 점수 기반 해금 (Phase 7+)

`unlockRequirement?: number` 필드로 누적 점수 임계값 설정 가능.

예: en_5_1 해금에 누적 점수 5000 필요.

### 4.3 초기에 해금된 스테이지

`player.unlockedStages` 초기값:
- en_1_1
- jp_0_1, jp_0_2, jp_1_1
- es_1_1
- kr_1_1

이 스테이지들은 처음부터 플레이 가능.

## 5. 적 등장 간격 (SPAWN_INTERVAL)

| 티어 | 간격 (ms) | 비고 |
| --- | --- | --- |
| 0 | 4000 | 한 글자라 짧음, 여유 |
| 1 | 4000 | 단어, 여유 |
| 2 | 3500 | |
| 3 | 3000 | 문장, 적당한 페이스 |
| 4 | 2500 | 긴 문장, 빠른 페이스 |
| 5 | 2000 | 패시지, 빠른 페이스 |

## 6. 코퍼스 요구사항

각 스테이지가 의도한 적 수만큼 등장하려면 코퍼스에 충분한 데이터가 있어야 함.

### 6.1 현재 코퍼스 상태

| 언어 | 단어 | 문장 | Tier 0 chars | 비고 |
| --- | --- | --- | --- | --- |
| EN | 25 | 5 | — | Phase 6 확장 필요 |
| JP | 25 | 3 | 0 | hiragana/katakana chars 미시드 |
| ES | 26 | 0 | — | 문장 미시드 |
| KR | 28 | 3 | — | 충분 (Tier 1~2) |

### 6.2 시드 필요량 (Tier 1~2 충당)

| 언어 | 단어 최소 | 카테고리 |
| --- | --- | --- |
| EN | 50~80 | greeting, basic, number, color, animal, food, family, time, object, place |
| JP | 50 | hiragana_only, greeting, number, color, food, person, place |
| ES | 50 | greeting, basic, number, color, family, food, time, place |
| KR | 40 | greeting, basic, number, family, food, time, place, person |

Tier 3~5 (문장/패시지)는 별도 코퍼스 확장 필요 — Phase 6 작업.

## 7. 미션 자동 생성 규칙

스테이지 정의 시 미션을 일관되게 자동 생성할 수 있다:

```typescript
function defaultMissionsForTier(tier: number): MissionConfig[] {
  switch (tier) {
    case 0:
      return [
        { type: 'accuracy_threshold', params: { threshold: 95 } },
        { type: 'defeat_count', params: { count: 15 } },
      ];
    case 1:
      return [
        { type: 'defeat_count', params: { count: 5 } },
      ];
    case 2:
      return [
        { type: 'defeat_count', params: { count: 8 } },
        { type: 'combo_chain', params: { count: 5 } },
      ];
    case 3:
      return [
        { type: 'defeat_count', params: { count: 8 } },
        { type: 'accuracy_threshold', params: { threshold: 85 } },
        { type: 'wpm_threshold', params: { threshold: 20 } },
      ];
    case 4:
      return [
        { type: 'defeat_count', params: { count: 5 } },
        { type: 'accuracy_threshold', params: { threshold: 80 } },
        { type: 'combo_chain', params: { count: 10 } },
      ];
    case 5:
      return [
        { type: 'defeat_count', params: { count: 4 } },
        { type: 'accuracy_threshold', params: { threshold: 75 } },
        { type: 'wpm_threshold', params: { threshold: 25 } },
      ];
  }
}
```

각 스테이지는 명시적 미션을 가질 수도, 자동 생성을 사용할 수도 있음.

## 8. 일본어 Tier 0 (문자 입력) 특수 설계

### 8.1 왜 JP만?

다른 언어는 문자 단위 입력이 비현실적:
- EN: 알파벳 26자는 "단어 입력"과 동일 (의미 단위가 아님)
- ES: EN과 동일
- KR: 한글 자모는 단어의 부분 (단독 입력은 학습 효과 낮음)

일본어만 히라가나/가타가나 자체가 **독립된 학습 단위**:
- あ (a) → ㅇ + ㅏ → 2자모로 구성된 음절이지만 학습 시 1단위로 암기
- 단어 "あい" (love/hi) 의 "あ"와 단독 "あ"가 학습적으로 다름

### 8.2 Tier 0 코퍼스 구조

```typescript
// hiragana_basic
{ id: 'jpc_001', display: 'あ', romaji: 'a', meaning: 'a (vowel)', level: 0, category: 'hiragana_basic' }
{ id: 'jpc_002', display: 'い', romaji: 'i', meaning: 'i (vowel)', level: 0, category: 'hiragana_basic' }
// ... 46 chars total

// katakana_basic
{ id: 'jpk_001', display: 'ア', romaji: 'a', meaning: 'a (katakana)', level: 0, category: 'katakana_basic' }
// ... 46 chars total

// hiragana_dakuten (が、ぎ、ぐ... ぱ、ぴ、ぷ... きゃ、きゅ、きょ...)
{ id: 'jpd_001', display: 'が', romaji: 'ga', meaning: 'ga', level: 0, category: 'hiragana_dakuten' }
```

### 8.3 Tier 0 핸들러 동작

기존 `JapaneseHandler` 그대로 사용 — display=kana, input=romaji 매칭이 정확히 이 케이스.

Tier 0 → Tier 1 전환 시:
- Tier 0: 짧은 입력 (1~3글자 romaji), 여유로운 등장
- Tier 1: 단어 입력 (4~10글자 romaji), 점진적 페이스 상승

## 9. 구현 단계

### Phase 1 (현재)
- [x] 본 spec 작성
- [ ] stages.ts 풀 카탈로그 작성 (40개)
- [ ] JP hiragana/katakana 코퍼스 시드 (46+46 = 92 chars)
- [ ] EN/ES/KR 코퍼스 확장 (각 50 단어)
- [ ] unlockedStages 초기값 갱신
- [ ] 자동 미션 생성 헬퍼
- [ ] Menu UI 갱신 (Tier 0 단계 추가)

### Phase 2 (Phase 7 이후)
- [ ] 점수 기반 해금
- [ ] 스테이지별 리더보드
- [ ] 보스/특수 스테이지
- [ ] 다중 언어 혼합 스테이지

## 10. 다음 단계

- 미션 시스템: `design/systems/mission.md`
- 메타 진행: `design/systems/progression.md`
- 구현: `prototype/src/data/stages.ts`, `prototype/src/data/corpus.ts`
- 테스트: `testcases/stage.md`