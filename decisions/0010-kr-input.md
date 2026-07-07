# ADR-0010: 한국어(KR) 입력 방식 — 자모 입력 + 로마자 입력 (하이브리드)

## 번호

`0010-kr-input.md`

## 제목

한국어 입력: 자모 직접 입력 + 로마자 입력 모드 (사용자 선택)

## 상태

Accepted

## 날짜

2026-06-18 (초안)
2026-06-25 (로마자 모드 추가)

## 결정일

2026-06-18 (자모 입력 선호)
2026-06-25 (하이브리드 모드 추가 — 외국인을 위해 로마자 입력 옵션)

## 컨텍스트

외국인 사용자들은 한글 키보드가 없으므로 자모 직접 입력이 불가능. 일본어(jp)처럼 QWERTY 로마자 입력을 지원하면 외국人も學習 가능.

ADR-0009 (옵션 A: 로마자→한글 매핑) 가 있었으나 자모 직접 입력이 우선 채택되었고, 이후 로마자 모드가 하이브리드로 추가.

## 옵션 비교

| 옵션 | 장점 | 단점 | 비고 |
| --- | --- | --- | --- |
| **A.** 로마자 직접 매핑 (구 ADR-0009) | QWERTY 키보드 호환, IME 비의존, JP 패턴 계승 | 실제 한글 키보드 사용자에게 부적절, 발음 변동 매핑 필요 | Superseded |
| **B.** IME 의존 | 실제 한/영 변환 그대로 | 복잡도 ↑, OS 의존 | 비채택 |
| **C.** 자모 직접 입력 + 클라이언트 합성 ⭐ | 실제 한글 키보드 직관 | foreigner 비친화 | 채택 (default) |
| **D.** Hybrid (자모 + 로마자 모드 토글) ⭐ | 모두 지원, 설정으로 전환 | UI + 로마자 corpus 필요 | **최종 채택** |

## 결정

**하이브리드 — 자모 입력 (기본) + 로마자 입력 모드** 채택.

### 모드 작동 방식

#### 자모 모드 (기본, 'jamo')

1. 사용자는 OS에 한글 키보드(2벌식) 활성화, Caps Lock OFF
2. 물리 키 → OS → 브라우저 `keydown` → `event.key` = 자모
3. `KoreanHandler` 가 자모 composition 진행
4. 완성형 syllable를 버퍼에 누적
5. 버퍼가 `target.display` 와 정확히 일치하면 적 격파

#### 로마자 모드 ('romanized')

1. 사용자는 일반 QWERTY 키보드 사용
2. `target.acceptedInputs[0]` (로마자)을 정답으로 매칭
3. 예: "안녕하세요" → `annyeonghaseyo` 입력
4. JapaneseHandler와 동일한 패턴

### 로마자 매핑 (Korean romanization)

| 한글 | 로마자 | 비고 |
| --- | --- | --- |
| ㄱ | g/k | 초성 g, 종성 k |
| ㄴ | n | |
| ㄷ | d/t | 초성 d, 종성 t |
| ㄹ | r/l | 초성 r, 종성 l |
| ㅁ | m | |
| ㅂ | b/p | 초성 b, 종성 p |
| ㅅ | s | |
| ㅇ | ng/null | 초성无声, 종성 ng |
| ㅈ | j | |
| ㅊ | ch | |
| ㅋ | k | |
| ㅌ | t | |
| ㅍ | p | |
| ㅎ | h | |
| ㅏ | a | |
| ㅑ | ya | |
| ㅓ | eo | |
| ㅕ | yeo | |
| ㅗ | o | |
| ㅛ | yo | |
| ㅜ | u | |
| ㅠ | yu | |
| ㅡ | eu | |
| ㅣ | i | |
| ㅐ | ae | |
| ㅒ | yae | |
| ㅔ | e | |
| ㅖ | ye | |
| ㅘ | wa | ㅗ + ㅏ |
| ㅙ | wae | ㅗ + ㅐ |
| ㅚ | oe | ㅗ + ㅣ |
| ㅝ | wo | ㅜ + ㅓ |
| ㅞ | we | ㅜ + ㅔ |
| ㅟ | wi | ㅜ + ㅣ |
| ㅢ | ui | ㅡ + ㅣ |
| ㄲ | kk | 쌍자음 |
| ㄸ | tt | |
| ㅃ | pp | |
| ㅆ | ss | |
| ㅉ | jj | |

### Unicode Composition

한글 음절 = `0xAC00 + (초성 × 21 × 28) + (중성 × 28) + 종성`

- 초성 19개 (ㄱ~ㅎ, 쌍자음 포함)
- 중성 21개 (ㅏ~ㅣ, 복합 모음 포함)
- 종성 28개 (없음 + ㄱ~ㅎ, 겹받침 포함)

### 입력 매핑 표 (브라우저 event.key 기준)

| 물리 키 (한글 2벌식) | event.key | 분류 |
| --- | --- | --- |
| Q | ㅂ | 자음 |
| W | ㅈ | 자음 |
| E | ㄷ | 자음 |
| R | ㄱ | 자음 |
| T | ㅅ | 자음 |
| A | ㅁ | 자음 |
| S | ㄴ | 자음 |
| D | ㅇ | 자음 |
| F | ㄹ | 자음 |
| G | ㅎ | 자음 |
| H | ㅗ | 모음 |
| J | ㅓ | 모음 |
| K | ㅏ | 모음 |
| L | ㅣ | 모음 |
| Z | ㅋ | 자음 |
| X | ㅌ | 자음 |
| C | ㅊ | 자음 |
| V | ㅍ | 자음 |
| B | ㅠ | 모음 |
| N | ㅜ | 모음 |
| M | ㅡ | 모음 |

## 결과 / 영향

### 긍정적

- 자모 모드: 실제 한글 키보드 사용자 경험 (가장 자연스러운 입력)
- 로마자 모드: foreigner도 QWERTY로 한국어 학습 가능
- IME 의존성 제거 (자모 모드)
- JP romaji 패턴과 동일한 구조 (로마자 모드)

### 부정적 / 트레이드오프

- 로마자 모드: 로마자 corpus (`acceptedInputs`)가 필요
- 자모 composition 알고리즘 복잡도 (겹받침·복합 모음)
- macOS Caps Lock ON 시 자모 입력 안 됨 (자모 모드)

## 구현

- `src/input/KoreanHandler.ts` — 자모 composition + 로마자 모드 지원
- `src/data/koreanInputMode.ts` — 설정 persistence (localStorage)
- `src/ui/SettingsScreen.tsx` — 한국어 입력 모드 선택 UI
- `src/engine/Keyboard.ts` — `korean2set` 레이아웃 (자모 모드용)
- `src/data/corpus.ts` — 로마자 모드용 `acceptedInputs` 필드 필요

## 열린 질문

- [x] 로마자 corpus 채우기 — **2026-06-26**: ✅ 완료 (모든 KR entries에 romaji 필드 추가)
- [ ] 한글 3벌식 지원 여부
- [ ] macOS Caps Lock 경고

## Supersedes

ADR-0009 (로마자 직접 매핑) — Superseded by ADR-0010.

## 다음 단계

1. ✅ `KoreanHandler.ts` 자모 composition 엔진 작성
2. ✅ `KoreanHandler.ts` 로마자 모드 추가 (2026-06-25)
3. ✅ `koreanInputMode.ts` 설정 persistence (2026-06-25)
4. ✅ `SettingsScreen.tsx` 입력 모드 선택 UI (2026-06-25)
5. ✅ 로마자 corpus 채우기 (`romaji` 필드) — **2026-06-26**: 완료
6. ⏳ Language 위키 한국어 페이지 입력 방식 갱신
7. ⏳ 단위 테스트 (받침/복합 모음 경계 케이스)

## 로마자 매핑 표 (참고)

전체 매핑은 상단 테이블 참조. 주요 조합 예시:

| 한글 예시 | 로마자 | 설명 |
| --- | --- | --- |
| 안녕하세요 | annyeonghaseyo | 기본 인사 |
| 감사합니다 | gamsahamnida | 격식 인사 |
| 물 | mul | 단어 |
| 삼겹살 | samgyeopsal | 음식 |
| 서울 | seoul |地名 |
| 인사 | insa | 명사 |
| 计算机 | <废弃> | 한자混用 → 한글로 기록 |