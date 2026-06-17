# Test Cases: Spanish Handler

> ADR-0003: 액센트 직접 입력 + ASCII 폴백

## Loose 모드 (ASCII 폴백)

### TC-ES-001: 폴백 ñ

```
전제: Target = "niño" (display), 모드: Loose
실행: 'n' 'i' 'n' 'o' (n으로 ñ 입력)
기대: completed=true, accuracy=100
```

### TC-ES-002: 직접 입력 ñ

```
전제: Target = "niño" (display), 모드: Loose
실행: 'n' 'i' 'ñ' 'o' (ñ 직접 입력)
기대: completed=true, accuracy=100
```

### TC-ES-003: 폴백 á

```
전제: Target = "rápido" (display), 모드: Loose
실행: 'r' 'a' 'p' 'i' 'd' 'o' (a로 á 입력)
기대: completed=true
```

### TC-ES-004: 폴백 é

```
전제: Target = "café" (display), 모드: Loose
실행: 'c' 'a' 'f' 'e' (e로 é 입력)
기대: completed=true
```

## Strict 모드 (액센트 직접)

### TC-ES-010: Strict ñ

```
전제: Target = "niño" (display), 모드: Strict
실행: 'n' 'i' 'n' 'o' (n으로 입력)
기대: completed=false (오타)
실행: 'n' 'i' 'ñ' 'o'
기대: completed=true
```

### TC-ES-011: Strict é

```
전제: Target = "café" (display), 모드: Strict
실행: 'c' 'a' 'f' 'e'
기대: completed=false (e만 입력)
실행: 'c' 'a' 'f' 'é'
기대: completed=true
```

## 대문자 액센트

### TC-ES-020: Ñ 대문자

```
전제: Target = "España" (display), 모드: Loose
실행: 'E' 's' 'p' 'a' 'n' 'a' (N으로 Ñ 폴백)
기대: completed=true
```

### TC-ES-021: Á 대문자

```
전제: Target = "Árbol" (display), 모드: Loose
실행: 'A' 'r' 'b' 'o' 'l' (A로 Á 폴백)
기대: completed=true
```

## ¿/¡ 처리

### TC-ES-030: ¿ 물음표 (선택적 폴백)

```
전제: Target = "¿Hola?" (display), 모드: Loose, ¿ → ? 폴백 ON
실행: '?' 'H' 'o' 'l' 'a' '?'
기대: completed=true
```

### TC-ES-031: ¿ 물음표 (Strict)

```
전제: Target = "¿Hola?" (display), 모드: Strict
실행: '?' 'H' 'o' 'l' 'a' '?'
기대: completed=false (첫 ?는 ¿여야 함)
실행: '¿' 'H' 'o' 'l' 'a' '?'
기대: completed=true
```

### TC-ES-032: ¡ 느낌표

```
전제: Target = "¡Hola!" (display), 모드: Loose, 폴백 ON
실행: '!' 'H' 'o' 'l' 'a' '!'
기대: completed=true
```

## 폴백 매핑 종합

### TC-ES-040: 모든 액센트 폴백

```
전제: Target = "áéíóúñ" (display), 모드: Loose
실행: 'a' 'e' 'i' 'o' 'u' 'n'
기대: completed=true, accuracy=100
```

### TC-ES-041: 혼합 입력

```
전제: Target = "niño" (display), 모드: Loose
실행: 'n' 'i' 'ñ' 'o' (직접 입력)
기대: completed=true (두 방식 모두 OK)
```

### TC-ES-042: 대소문자 혼합

```
전제: Target = "Niño" (display), 모드: Loose
실행: 'N' 'i' 'n' 'o' (n으로 ñ)
기대: completed=true (대문자 N으로 Ñ 폴백)
```

## 정규화 검증

### TC-ES-050: NFD 정규화

```
전제: Target = "á" (U+00E1, NFC)
실행: 'á' (U+00E1)
기대: completed=true (동일 코드포인트)
```

### TC-ES-051: NFC/NFD 혼합

```
전제: Target = "á" (U+00E1 NFC)
실행: 'á' (U+0061 U+0301 NFD)
기대: completed=true (정규화 후 매칭)
설명: 핸들러는 양쪽 정규화 형태 모두 받아들여야 함
```

## 정확도

### TC-ES-060: 폴백 정확도

```
전제: Target = "niño" (display), 모드: Loose
실행: 'n' 'i' 'n' 'o' (모두 폴백)
기대: accuracy=100 (폴백이 정답 처리됨)
```

### TC-ES-061: 정확도 0% (Strict)

```
전제: Target = "niño" (display), 모드: Strict
실행: 'n' 'i' 'n' 'o' (모두 ASCII)
기대: accuracy=0 또는 매우 낮음 (Strict 모드에서 오답)
```

## 다음 단계

- 핸들러 구현: `prototype/src/input/SpanishHandler.ts`
- 자동화 테스트: Vitest `prototype/tests/input/spanish.test.ts`
- 정규화 함수: NFD + 폴백 매핑