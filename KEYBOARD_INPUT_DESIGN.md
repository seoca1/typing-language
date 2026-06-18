# Keyboard Input Design

PC와 모바일 환경에서 키보드 입력이 어떻게 처리되는지 정리하고, OS 키보드를 활용하는 방식으로 개선한 과정을 문서화합니다.

---

## 📋 목차

- [현재 구조](#-현재-구조)
- [문제점과 한계](#-문제점과-한계)
- [개선 방향: OS 키보드 활용](#-개선-방향-os-키보드-활용)
- [구현 상세](#-구현-상세)
- [언어별 입력 처리](#-언어별-입력-처리)
- [테스트 가이드](#-테스트-가이드)

---

## 🏗️ 현재 구조

### PC 버전

**파일:** `prototype/src/App.tsx`, `prototype/src/engine/Keyboard.ts`

```
[사용자 키 입력]
    ↓
window.addEventListener('keydown', onKey)
    ↓
handler.handleKey(event)
    ↓
inputHandler.handleKey(event)  // EnglishHandler/KoreanHandler/etc.
    ↓
inputHandler.match() → { completed, buffer }
    ↓
dispatch({ type: 'KEY_INPUT', result, romajiHint })
    ↓
gameReducer → state 업데이트
    ↓
Canvas에 새 buffer 렌더링
```

**세부 사항:**
- `App.tsx`의 `useEffect`에서 `window.addEventListener('keydown', onKey)` 등록
- 키 이벤트에서 `Escape` → 메뉴, `Enter` → 단어 확정, 그 외 → `handler.handleKey(event)`
- `Keyboard.ts`는 캔버스에 그려진 가상 키보드 (PC에서는 시각적 표시만, 실제 입력은 OS 키보드 사용)

**문제점:**
- `Keyboard.ts`의 가상 키보드는 PC에서는 시각적 표시일 뿐
- 캔버스 위에 그려져서 실제 DOM 입력 이벤트와 분리됨

### 모바일 버전

**파일:** `prototype/src/ui/VirtualKeyboard.tsx`, `prototype/src/utils/device.ts`

```
[사용자가 버튼 터치]
    ↓
VirtualKeyboard.handleKeyClick(key)
    ↓
handleVirtualKeyPress(key)  // App.tsx의 함수
    ↓
window.dispatchEvent(new KeyboardEvent('keydown', { key }))
    ↓
(PC와 동일)
```

**디바이스 감지:**
```typescript
export function needsVirtualKeyboard(): boolean {
  return isMobileDevice() && !isTablet();
}
```

**문제점:**
1. **제한된 레이아웃**: ES 액센트, 한글 자모, 일본어 히라가나 등 일부만 지원
2. **시각적 충돌**: 캔버스 영역과 가상 키보드 영역이 분리되어 있어 게임 화면이 좁아짐
3. **OS 키보드 미사용**: 디바이스가 가진 OS 키보드를 활용하지 못함
4. **다국어 전환 어려움**: 언어 변경 시 가상 키보드 재구성 필요
5. **IME 미지원**: 일본어/중국어 변환 기능 사용 불가

---

## ❌ 문제점과 한계

### 1. **모바일 UX 문제**

| 문제 | 영향 |
|------|------|
| 좁은 화면 | 게임 캔버스 영역 축소 |
| 일부 키 누락 | ES 액센트, 한글 자모 일부 미지원 |
| OS 키보드 무시 | 디바이스의 강력한 키보드 활용 불가 |
| IME 변환 불가 | 일본어 한자 변환, 중국어 병음 등 |
| 키보드 영역 차지 | 가상 키보드가 화면 아래 고정 영역 차지 |

### 2. **PC UX 문제**

| 문제 | 영향 |
|------|------|
| 시각적 혼란 | 캔버스 키보드가 표시되지만 실제 입력은 OS 키보드 |
| 입력 방식 불일치 | PC는 OS, 모바일은 커스텀 가상 |
| 유지보수 복잡도 | 두 가지 입력 처리 경로 |

### 3. **기술적 한계**

- `VirtualKeyboard.tsx`의 `LAYOUTS`가 하드코딩된 4개 언어만 지원
- 새로운 언어 추가 시 컴포넌트 + 데이터 모두 수정 필요
- 캔버스 키보드는 검색/이모지/특수문자 등 OS 키보드의 강력한 기능 활용 불가

---

## ✅ 개선 방향: OS 키보드 활용

### 핵심 아이디어

**모든 플랫폼에서 OS가 제공하는 가상 키보드를 사용**하여 일관된 입력 경험 제공.

```
[사용자 키 입력]
    ↓
OS 가상 키보드 또는 물리 키보드
    ↓
<input> 요소 (DOM, hidden or focused)
    ↓
'input' 이벤트
    ↓
inputHandler.handleKey(event)
    ↓
gameReducer → state 업데이트
```

### 장점

| 측면 | 이전 | 개선 |
|------|------|------|
| 키보드 | 캔버스/HTML 가상 키보드 | OS 가상 키보드 |
| 화면 점유 | 캔버스 + 가상 키보드 | 캔버스만 |
| 다국어 | 4개 언어 하드코딩 | OS가 모든 언어 지원 |
| IME | 미지원 | OS/IME 자동 처리 |
| 접근성 | 가상 키보드 별도 | OS 표준 접근성 |
| 유지보수 | 두 경로 | 단일 경로 |

### 디바이스별 동작

**PC (데스크톱):**
- 물리 키보드 사용
- OS 키보드 레이아웃 자동 적용 (QWERTY, AZERTY, DVORAK 등)
- 일본어/중국어 사용자: OS의 IME 자동 사용

**모바일:**
- `<input>` 요소에 포커스 → OS 가상 키보드 자동 표시
- 언어별 키보드 자동 전환 (영어 키보드, 한글 키보드, 일본어 IME 등)
- 일본어: OS IME의 한자 변환, 히라가나 → 가타카나 변환 사용 가능

---

## 🔧 구현 상세

### 1. 디바이스 감지 변경

`prototype/src/utils/device.ts`는 그대로 두되 `needsVirtualKeyboard`는 더 이상 사용하지 않음. 대신 OS 키보드를 항상 사용.

```typescript
// 이전: needsVirtualKeyboard()로 판단
// 개선: 항상 <input> 포커스, OS가 알아서 키보드 표시
```

### 2. Hidden Input 컴포넌트

새 컴포넌트: `prototype/src/ui/OSKeyboardInput.tsx`

```typescript
/**
 * OS Keyboard Input
 *
 * 숨겨진 input 요소를 통해 OS 키보드/IME 입력을 받음.
 * 모든 플랫폼에서 일관된 입력 경험 제공.
 */
export function OSKeyboardInput({ onInput, language, enabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (enabled) inputRef.current?.focus();
  }, [enabled]);

  // PC: 물리 키보드 이벤트도 받기 위해 keydown도 처리
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      // ...
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);

  return (
    <input
      ref={inputRef}
      type="text"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      inputMode={getInputMode(language)}
      lang={getLangAttr(language)}
      // 시각적으로만 숨김 (focus는 유지)
      style={{
        position: 'absolute',
        opacity: 0,
        pointerEvents: 'none',
        left: '-9999px',
      }}
      onInput={(e) => {
        const value = e.currentTarget.value;
        onInput(value);
        e.currentTarget.value = ''; // 입력 후 비우기
      }}
    />
  );
}
```

### 3. App.tsx 통합

```typescript
// 이전
const [showVirtualKeyboard] = useState(() => needsVirtualKeyboard());
// ...
{showVirtualKeyboard && stage && (
  <VirtualKeyboard language={stage.language} ... />
)}

// 개선
<OSKeyboardInput
  enabled={state.phase === 'stage'}
  language={stage?.language ?? 'en'}
  onInput={handleOSInput}
/>
```

### 4. 언어별 input 속성

```typescript
function getInputMode(lang: Language): string {
  switch (lang) {
    case 'kr': return 'korean';  // 모바일 OS 한글 키보드
    case 'jp': return 'ja';       // 일본어 IME
    case 'es': return 'text';     // 스페인어 (액센트 포함)
    default:  return 'text';
  }
}

function getLangAttr(lang: Language): string {
  return lang; // 'en' | 'jp' | 'es' | 'kr'
}
```

### 5. 캔버스 키보드 유지 (선택적)

`Keyboard.ts`는 옵션으로 유지할 수 있음:
- 디버깅/시각화 목적
- PC에서 현재 키 강조 (pressed 표시)
- 미래 튜토리얼 기능에서 활용 가능

---

## 🌐 언어별 입력 처리

### 🇺🇸 English (en)

**입력 방식:**
- `<input>` 직접 입력
- IME 영향 없음

**InputHandler:**
- `EnglishHandler.handleKey()` 직접 처리
- `event.key`가 알파벳이면 버퍼에 추가

### 🇯🇵 日本語 (jp)

**입력 방식:**
- `<input lang="ja">` + OS IME
- OS IME가 로마자 → 히라가나/한자 변환 처리

**InputHandler:**
- `JapaneseHandler.handleKey()` 
- `event.isComposing` 체크하여 변환 중 입력이 완성될 때까지 대기
- 변환 완료된 텍스트를 `event.data`로 받아 처리

```typescript
handleKey(event: KeyboardEvent): MatchResult {
  if (event.isComposing) {
    // 변환 중: 결과가 나올 때까지 대기
    return this.currentResult();
  }
  // 변환 완료 후의 텍스트 사용
  if (event.data) {
    this.buffer = event.data;
    return this.match();
  }
}
```

### 🇪🇸 Español (es)

**입력 방식:**
- `<input lang="es">` + OS 스페인어 키보드
- OS 키보드의 액센트 키 사용 (á, é, í, ó, ú, ñ, ¿, ¡)

**InputHandler:**
- `SpanishHandler.handleKey()`
- loose/strict 모드에 따라 액센트 매칭
- `accentMode: 'any'` 또는 `'loose'`로 폴백 지원

### 🇰🇷 한국어 (kr)

**입력 방식:**
- `<input lang="kr">` + OS 한글 키보드
- OS가 한글 조합을 처리 (자음+모음 → 완성형)
- 또는 직접 자모 입력 (KeyboardEvent)

**InputHandler:**
- `KoreanHandler.handleKey()`
- `event.key`가 자모인 경우 합성 처리
- 2-bulsik 자모 직접 입력 + 스마트 모음 변환

---

## 📝 변경된 파일 목록

### 신규
- `prototype/src/ui/OSKeyboardInput.tsx` - OS 키보드 입력 컴포넌트

### 수정
- `prototype/src/App.tsx` - VirtualKeyboard 제거, OSKeyboardInput 추가
- `prototype/src/utils/device.ts` - `needsVirtualKeyboard` deprecate (또는 제거)

### 유지 (옵션)
- `prototype/src/engine/Keyboard.ts` - 캔버스 시각화용 (디버그/튜토리얼)
- `prototype/src/ui/VirtualKeyboard.tsx` - 레거시 코드 (필요 시 fallback)

### 삭제 가능
- `prototype/src/ui/VirtualKeyboard.tsx` - 더 이상 사용 안 함 (또는 deprecate)

---

## 🧪 테스트 가이드

### PC 테스트

1. **물리 키보드**
   - 영어 단어 입력 → 정상
   - 한글 단어 입력 → OS의 한글 IME 사용 (한국어 PC)
   - 일본어 단어 입력 → OS의 일본어 IME 사용

2. **언어 전환**
   - 메뉴에서 언어 선택
   - `<input lang>` 속성이 언어에 맞게 변경됨
   - OS 키보드 레이아웃 자동 전환 (모바일만 의미 있음)

### 모바일 테스트

1. **OS 키보드 표시**
   - 스테이지 진입 시 자동으로 `<input>` 포커스
   - OS 키보드 자동 표시
   - 언어별 키보드 자동 선택 (예: 한국어 → 한글 키보드)

2. **특수 케이스**
   - iOS Safari: 한글 입력 확인
   - Android Chrome: 일본어 IME (한자 변환) 확인
   - ES: 액센트 문자 입력 확인

3. **성능**
   - OS 키보드는 가상 키보드보다 빠름 (네이티브)
   - 입력 지연 없음
   - 자동완성, swipe 타이핑 등 OS 기능 활용 가능

### 회귀 테스트

기존 단위 테스트 (`tests/input/*.test.ts`)는 모두 통과해야 함:
```bash
npx vitest run tests/input
```

---

## 📊 비교 표

### 이전 vs 개선

| 항목 | 이전 (가상 키보드) | 개선 (OS 키보드) |
|------|------------------|-----------------|
| 모바일 UX | 좁은 화면, 커스텀 UI | 넓은 화면, OS 표준 |
| 다국어 | 4개 언어 하드코딩 | OS가 모두 지원 |
| IME | 미지원 | OS 자동 처리 |
| 성능 | 느림 (커스텀) | 빠름 (네이티브) |
| 접근성 | 제한적 | OS 표준 |
| 유지보수 | 높음 | 낮음 |
| 코드 복잡도 | 2가지 입력 경로 | 1가지 입력 경로 |
| 신규 언어 추가 | 컴포넌트 + 데이터 | OS가 자동 |

---

## 🎯 구현 우선순위

1. **High Priority**: `OSKeyboardInput.tsx` 구현 + `App.tsx` 통합
2. **Medium Priority**: 캔버스 `Keyboard.ts` 시각화 유지 (디버그용)
3. **Low Priority**: `VirtualKeyboard.tsx` 제거 또는 deprecate

---

## 🔗 관련 문서

- `design/systems/input-handler.md` - InputHandler 인터페이스
- `prototype/src/input/` - 언어별 핸들러 구현
- `prototype/tests/input/` - 단위 테스트
- `wiki/languages/{lang}.md` - 언어별 입력 방식 설명

---

**마지막 업데이트:** 2024-06-18
**상태:** 구현 진행 중
