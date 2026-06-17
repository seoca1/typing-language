# ADR-0010: 한국어(KR) 입력 방식 — 한글 키보드 직접 입력 (자모 합성)

## 번호

`0010-kr-input.md`

## 제목

한국어 입력: 한글 2벌식 키보드의 자모를 직접 타이핑, 클라이언트 사이드 한글 합성

## 상태

Accepted

## 날짜

2026-06-18

## 결정일

2026-06-18 (사용자 — "한글은 한글 키보드로 입력할거야")

## 컨텍스트

ADR-0009 (옵션 A: 로마자→한글 매핑) 가 Accepted 되었으나, 사용자가 실제 한글 키보드 자모 직접 입력을 선호. ADR-0009 → Superseded.

이전 옵션 A는 게임 키보드 자판이 QWERTY라 로마자 입력이 자연스러웠지만, 실제 한글 키보드(2벌식) 보유 사용자에게는 자모 직접 입력이 더 직관적.

## 옵션 비교

| 옵션 | 장점 | 단점 | 비고 |
| --- | --- | --- | --- |
| **A.** 로마자 직접 매핑 (구 ADR-0009) | QWERTY 키보드 호환, IME 비의존, JP 패턴 계승 | 실제 한글 키보드 사용자에게 부자연스러움, 발음 변동 일일이 매핑 | Superseded |
| **B.** IME 의존 (브라우저 native composition events) | 실제 한/영 변환 그대로 | `compositionstart`/`compositionend` 이벤트 처리 복잡, OS/IME 상태 의존, 크로스플랫폼 일관성↓ | 비채택 |
| **C.** 자모 직접 입력 + 클라이언트 합성 ⭐ | 실제 한글 키보드 직관, IME 비의존, 완성형 비교 가능, JP 패턴과 동일 (display=완성형) | 자모 composition 알고리즘 필요, 받침/복합 모음 처리 | **채택** |

## 결정

**옵션 C — 자모 직접 입력 + 클라이언트 사이드 합성** 채택.

### 작동 방식

1. 사용자는 OS에 한글 키보드(2벌식) 활성화, Caps Lock OFF
2. 물리 키 → OS → 브라우저 `keydown` 이벤트 → `event.key` = 자모 (ㄱ, ㄴ, ㅏ, ...)
3. `KoreanHandler` 가 `event.key`를 받아 자모 composition 진행:
   - 초성(자음) + 중성(모음) + 종성(자음) → 완성형 한글 한 음절
   - 복합 모음: 모음 2개 연속 입력 → 단일 모음 합성 (ㅗ+ㅏ → ㅘ)
4. 완성형 syllable를 버퍼에 누적
5. 버퍼가 `target.display` 와 정확히 일치하면 적 격파

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

- 실제 한글 키보드 사용자 경험 그대로 (가장 자연스러운 입력)
- IME 의존성 제거 (OS/IME 환경 일관성)
- JP romaji 패턴과 동일한 display=완성형 + 클라이언트 합성 구조
- 가상 키보드 시각화로 자모 위치 학습 가능

### 부정적 / 트레이드오프

- 자모 composition 알고리즘 구현 복잡도 (특히 겹받침·복합 모음)
- macOS Caps Lock ON 시 영문 출력 → 한글 입력이 안 됨 (사용자 OS 설정 필요)
- 가상 키보드가 자모를 표시하므로 QWERTY 사용자도 자모 위치 학습 가능

### 제약

- `KoreanHandler` 가 기본 `BaseInputHandler` 의 `buffer += event.key` 패턴에서 벗어남 (별도 composition state 필요)
- 시각화: 입력 버퍼에는 자모가 아닌 완성형 한글 표시
- 정확도 측정: prefix-mismatch 방식으로 변경 (자모 단위 비교가 어려움)

## 구현

- `src/input/KoreanHandler.ts` — 자모 composition 엔진
- `src/engine/Keyboard.ts` — `korean2set` 레이아웃 추가, `setLayout()` API
- `src/App.tsx` — KR 스테이지 시작 시 `keyboardRef.current?.setLayout('korean2set')` 호출
- `src/data/corpus.ts` — KR 항목의 `romaji` 필드 제거, `display` 만으로 매칭

## 열린 질문

- [ ] 한글 3벌식(안마달 등) 입력 지원 여부 — 현재는 2벌식만
- [ ] macOS Caps Lock ON 상태 감지 및 경고 — 미구현
- [ ] 자모 키 단위 정확도 측정 vs 완성형 음절 단위 측정 — 현재는 prefix-mismatch 방식

## Supersedes

ADR-0009 (로마자 직접 매핑) — Superseded by ADR-0010.

## 다음 단계

1. ✅ `KoreanHandler.ts` 자모 composition 엔진 작성
2. ✅ `Keyboard.ts` korean2set 레이아웃 추가
3. ✅ `App.tsx` 레이아웃 전환
4. ✅ `corpus.ts` romaji 제거
5. ⏳ Language 위키 한국어 페이지 입력 방식 갱신
6. ⏳ 단위 테스트 (받침/복합 모음 경계 케이스)
7. ⏳ OS Caps Lock 상태 감지 + 경고 UI