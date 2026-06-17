# Test Cases: English Handler

## 기본 동작

### TC-EN-001: 단순 단어 입력

```
전제: Target = "hello"
실행: 'h' 'e' 'l' 'l' 'o' 순차 입력
기대: completed=true, accuracy=100, errors=0
```

### TC-EN-002: 오타 1개

```
전제: Target = "hello"
실행: 'h' 'e' 'l' 'x' 'l' 'o' ('x' 오타)
기대: completed=true, accuracy=80, errors=1
```

### TC-EN-003: Backspace로 수정

```
전제: Target = "hello"
실행: 'h' 'e' 'l' 'l' 'o' (정확 입력) — 통과
또는: 'h' 'e' 'x' (오타) → Backspace → 'h' 'e' 'l' 'l' 'o'
기대: 두 시나리오 모두 completed=true, errors=0 (backspace로 복구된 경우)
```

## 대소문자

### TC-EN-010: 기본 case-insensitive

```
전제: Target = "Hello", 모드: case-insensitive
실행: 'h' 'e' 'l' 'l' 'o'
기대: completed=true (대소문자 무시)
```

### TC-EN-011: Strict 모드 (case-sensitive)

```
전제: Target = "Hello", 모드: case-sensitive
실행: 'h' 'e' 'l' 'l' 'o'
기대: completed=false (대소문자 불일치)
실행: 'H' 'e' 'l' 'l' 'o'
기대: completed=true
```

## 문장

### TC-EN-020: 짧은 문장

```
전제: Target = "How are you?"
실행: 'H' 'o' 'w' ' ' 'a' 'r' 'e' ' ' 'y' 'o' 'u' '?'
기대: completed=true, accuracy=100
```

### TC-EN-021: 문장 부호 포함

```
전제: Target = "Hello, world!"
실행: 'H' 'e' 'l' 'l' 'o' ',' ' ' 'w' 'o' 'r' 'l' 'd' '!'
기대: completed=true, accuracy=100
```

### TC-EN-022: Apostrophe

```
전제: Target = "don't"
실행: 'd' 'o' 'n' ''' 't'
기대: completed=true
```

## 엣지 케이스

### TC-EN-030: 빈 입력

```
전제: Target = "hello"
실행: (입력 없음)
기대: completed=false, buffer=""
```

### TC-EN-031: 초과 입력

```
전제: Target = "hi"
실행: 'h' 'i' 'x' (초과)
기대: 정책에 따라 (무시 또는 완료 후 새 단어)
```

### TC-EN-032: 매우 긴 문장

```
전제: Target = "The quick brown fox jumps over the lazy dog" (43자)
실행: 모두 정확히 입력
기대: completed=true, accuracy=100
```

### TC-EN-033: 숫자

```
전제: Target = "2024"
실행: '2' '0' '2' '4'
기대: completed=true
```

### TC-EN-034: 특수문자

```
전제: Target = "$100"
실행: '$' '1' '0' '0'
기대: completed=true
```

## 키 이벤트 무시

### TC-EN-040: IME composition 이벤트

```
전제: 영어 입력 중
실행: CompositionStart 이벤트
기대: 핸들러 무시
```

### TC-EN-041: 특수 키 (Tab, Esc, 화살표)

```
전제: Target = "hello"
실행: 'h' Tab 'e'
기대: Tab 무시, 버퍼는 "he"
```

## 정확도 계산

### TC-EN-050: 정확도 100%

```
전제: Target = "hello"
실행: 5글자 모두 정확
기대: accuracy=100
```

### TC-EN-051: 정확도 50%

```
전제: Target = "hello" (5글자)
실행: 5글자 중 2글자 오타 (예: "hexlo")
기대: accuracy=60 (3/5)
```

### TC-EN-052: 정확도 0%

```
전제: Target = "hello"
실행: 5글자 모두 오타 (예: "xxxxx")
기대: accuracy=0
```

## 다음 단계

- 핸들러 구현: `prototype/src/input/EnglishHandler.ts`
- 자동화 테스트: Vitest `prototype/tests/input/english.test.ts`