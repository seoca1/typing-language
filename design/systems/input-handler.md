# System: Input Handler

> Pillar 1 (입력 방식 정확성) 의 핵심 구현. 이 문서는 **게임의 심장**.

## 책임

1. 키보드 이벤트 캡처 (브라우저 환경)
2. 언어별 입력 변환 (EN: 통과, JP: romaji→kanji, ES: accent 처리)
3. 타겟과의 일치 검증
4. 정확도/오타 추적
5. 버퍼/콤포지션 상태 관리

## 아키텍처

```
KeyboardEvent
    ↓
[BaseInputHandler] — 공통 인터페이스
    ↓
├── [EnglishHandler]      — 통과
├── [JapaneseHandler]     — romaji → 표시 변환
└── [SpanishHandler]      — accent 처리 (Strict/Loose 모드)
    ↓
[MatchResult] — 타겟과의 일치 정보
```

## 인터페이스

```typescript
interface InputHandler {
  /** 현재 타겟 설정 */
  setTarget(target: Target): void;

  /** 키 입력 처리 */
  handleKey(event: KeyboardEvent): MatchResult;

  /** 현재 버퍼 상태 */
  getBuffer(): string;

  /** 리셋 */
  reset(): void;
}

interface MatchResult {
  /** 입력 종료 여부 (타겟 완성) */
  completed: boolean;
  /** 정확도 (0~100) */
  accuracy: number;
  /** 오타 수 */
  errors: number;
  /** 다음 행동 힌트 (선택) */
  hint?: string;
}
```

## 언어별 핸들러

### EnglishHandler

**전략**: 가장 단순. 입력된 키의 문자를 그대로 버퍼에 추가.

```
Target: "hello"
Buffer: "he" → "hel" → "hell" → "hello" (completed)
```

- 대소문자: 기본 case-insensitive (스테이지 설정 시 strict)
- 공백: 단어 사이 공백은 정확히 입력
- 문장 부호: 포함된 경우 정확히 입력

**엣지 케이스**:
- Backspace: 마지막 문자 제거
- Composition 이벤트 무시 (영어는 IME 미사용)
- 다른 키 (Tab, Esc, 화살표 등): 핸들러가 무시

### JapaneseHandler

**전략**: 로마자→한자/히라가나 매핑 (ADR-0002).

```
Target: "こんにちは" (한자/히라가나)
Romaji 입력이 버퍼에 누적 → 매칭
Buffer: "k" → "ko" → "kon" → ... → "konnichiwa" (matched)
```

#### 매핑 규칙

| Romaji | 표시 | 비고 |
| --- | --- | --- |
| `konnichiwa` | こんにちは | んん→撥音 |
| `kyou` | きょう (또는 今日) | 拗音 |
| `gakkou` | がっこう | っ→촉음 |
| `osaka` | おおさか (또는 大阪) | おう→長音 |
| `toukyou` | とうきょう (또는 東京) | う+長音 |

#### 상세 규칙 (코퍼스에 명시)

- **장음**: `ou`/`oo` → `おう`/`おお` (긴 음)
- **촉음**: 다음 자음 더블 (예: `kk`, `tt`, `pp`) → っ
- **요음**: `kyo`, `sho`, `cho`, `nyo`, `hyo`, `myo`, `ryo`, `gyo`, `jyo`, `byo`, `pyo`
- **ん**: 모든 n (단, 다음 문자가 모음/y가 아닐 때)
- **特殊**: `ji` → じ, `shi` → し, `chi` → ち, `tsu` → つ

#### 표기 선택

타겟 표기는 사전에 명시:
- 일부 단어: 히라가나만 (초급)
- 일부 단어: 한자 포함 (중급)
- 한자 단어는 romaji 매핑에 한자 표기 병기

**예시 데이터 형식** (`raw/jp_words.md` 참조):
```yaml
- id: jp_001
  display: こんにちは
  romaji: konnichiwa
  meaning: hello
  level: 5  # JLPT N5
  category: greeting
```

#### 매칭 알고리즘

1. 현재 romaji 입력을 버퍼에 저장 (`konnichiwa`의 일부)
2. 타겟의 정답 romaji와 매칭
3. 정확히 일치하면 completed
4. 매칭 중에는 실시간 힌트 가능 (선택적 UI 기능)

**힌트 시스템** (선택):
- "다음 글자: `ko`" (버퍼가 비어 있을 때)
- "다음 글자: `kon`" (현재 입력 반영)

### SpanishHandler

**전략**: 액센트 직접 입력 + ASCII 폴백 (ADR-0003).

#### 모드 A: Strict (액센트 강제)

```
Target: "niño"
Buffer: "n" → "ni" → "niñ" → "niño" (completed)
```

- `ñ`, `á`, `é`, `í`, `ó`, `ú`, `¿`, `¡` 모두 정확히 입력
- 대소문자: `Ñ`, `Á` 등도 정확히 입력

#### 모드 B: Loose (ASCII 폴백)

```
Target: "niño"
입력 "nino" → 정확히 매칭 (폴백 규칙 적용)
```

폴백 규칙:
- `n` ↔ `ñ`
- `a` ↔ `á`
- `e` ↔ `é`
- `i` ↔ `í`
- `o` ↔ `ó`
- `u` ↔ `ú`

#### 모드 선택

- 스테이지 설정에 따라 Strict/Loose 결정
- 기본: Loose (초급자 친화)
- 후반 스테이지: Strict (실제 입력 연습)

#### 키보드 단축키 (선택적)

- Linux/Windows: US International Keyboard 또는 Compose 키
- Mac: Option + `e` + `a` → `á` (Mac의 표준 액센트 입력)
- 게임 자체에서 키보드 매핑 UI 제공 가능

**핵심**: 핸들러는 **두 입력 모두** 정답으로 처리. OS 키보드 환경은 사용자가 책임.

## 타겟과의 매칭

### 정확 일치 (Default)

- 버퍼 == 타겟 → completed

### 부분 일치 추적

- 매 키 입력마다 prefix 매칭 확인
- 불일치 발생 시 오타 카운트 증가
- 정확도 = (정확 입력 / 전체 입력) × 100

### Backspace 처리

- 모든 핸들러에서 동일: 마지막 문자 제거
- 오타 카운트도 함께 조정 (선택적)

## 키 이벤트 캡처

### 브라우저 이벤트

```typescript
window.addEventListener('keydown', (event) => {
  if (event.isComposing) return; // IME 합성 중 무시
  handler.handleKey(event);
});
```

### CompositionEvent (IME)

- EN: 무시
- JP: 시스템 IME를 거치지 않으므로 무시 (romaji 직접 입력)
- ES: 일부 OS에서 IME 자동 변환 가능. 비활성화 권장.

### 브라우저 IME 우회 (선택)

- 일부 ES 사용자는 OS IME가 `n` → `ñ` 자동 변환 시도
- 게임은 `event.preventDefault()`로 IME 변환 비활성화 가능
- 단, 사용자 입력 환경 다양성 존중 (설정으로 토글)

## 정확도 계산

```typescript
function calculateAccuracy(
  target: string,
  buffer: string,
  errors: number,
): number {
  if (target.length === 0) return 100;
  const correct = buffer.length - errors;
  return Math.max(0, (correct / target.length) * 100);
}
```

## WPM 계산

```typescript
function calculateWPM(
  completedTargets: string[],
  elapsedMs: number,
): number {
  const words = completedTargets.reduce(
    (sum, t) => sum + t.split(/\s+/).length,
    0,
  );
  const minutes = elapsedMs / 60000;
  return minutes > 0 ? words / minutes : 0;
}
```

## 성능

- 핸들러는 **키 입력마다** 호출 → O(1) 처리 필수
- 매칭 알고리즘은 prefix만 비교 (전체 매칭은 completed 시점에만)
- 한국어/중국어 등 추가 언어 시 O(n) 매칭 허용

## 테스트

- `testcases/input-handler.md` 참조
- 각 언어별 핵심 케이스 + 엣지 케이스

## 미해결 질문

- [ ] JP 한자 표기 시, 한자 읽기 어려운 사용자를 위한 후리가나 표시 여부
- [ ] ES Loose 모드에서 대소문자 정책 (기본 동일 처리?)
- [ ] 추가 언어(중국어/프랑스어 등) 우선순위
- [ ] 키보드 레이아웃 (QWERTY vs AZERTY vs Dvorak) 지원 여부

## 다음 단계

- 코퍼스 데이터 형식 확정: `design/systems/data-format.md` (ADR-0006 후)
- 핸들러 구현: `prototype/src/input/`
- 테스트: `testcases/input-handler.md`