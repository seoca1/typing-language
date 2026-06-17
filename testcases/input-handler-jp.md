# Test Cases: Japanese Handler

> ADR-0002: 로마자→한자 직접 매핑

## 기본 매핑

### TC-JP-001: 단순 단어

```
전제: Target = "こんにちは" (display), 정답 romaji = "konnichiwa"
실행: 'k' 'o' 'n' 'n' 'i' 'c' 'h' 'i' 'w' 'a'
기대: completed=true, accuracy=100
```

### TC-JP-002: 일반 단어

```
전제: Target = "ありがとう" (display), 정답 romaji = "arigatou"
실행: 'a' 'r' 'i' 'g' 'a' 't' 'o' 'u'
기대: completed=true
```

## 특수 매핑

### TC-JP-010: 촉음 (っ)

```
전제: Target = "がっこう" (display), 정답 romaji = "gakkou"
실행: 'g' 'a' 'k' 'k' 'o' 'u'
기대: completed=true
설명: 'kk' → っ
```

### TC-JP-011: 촉음 + っ

```
전제: Target = "きって" (display), 정답 romaji = "kitte"
실행: 'k' 'i' 't' 't' 'e'
기대: completed=true
```

### TC-JP-012: 요음 (ょ)

```
전제: Target = "きょう" (display), 정답 romaji = "kyou"
실행: 'k' 'y' 'o' 'u'
기대: completed=true
설명: 'kyo' → きょ
```

### TC-JP-013: 요음 (しゃ)

```
전제: Target = "しゃしん" (display), 정답 romaji = "shashin"
실행: 's' 'h' 'a' 's' 'h' 'i' 'n'
기대: completed=true
```

### TC-JP-014: 탁음 + 요음

```
전제: Target = "きょうと" (display), 정답 romaji = "kyouto"
  # 또는 京都 (kyouto vs kyouto)
실행: 'k' 'y' 'o' 'u' 't' 'o'
기대: completed=true
```

### TC-JP-015: 장음 (ou)

```
전제: Target = "とうきょう" (display), 정답 romaji = "toukyou"
실행: 't' 'o' 'u' 'k' 'y' 'o' 'u'
기대: completed=true
설명: 'ou' → おう, 'kyou' → きょう
```

### TC-JP-016: 장음 (oo)

```
전제: Target = "おおさか" (display), 정답 romaji = "oosaka"
실행: 'o' 'o' 's' 'a' 'k' 'a'
기대: completed=true
```

### TC-JP-017: ん

```
전제: Target = "せんせい" (display), 정답 romaji = "sensei"
실행: 's' 'e' 'n' 's' 'e' 'i'
기대: completed=true
설명: 'n' 다음이 's' (자음) → ん (nn 아님)
```

### TC-JP-018: ん (nn)

```
전제: Target = "こんにちは" (display), 정답 romaji = "konnichiwa"
실행: 'k' 'o' 'n' 'n' 'i' ...
기대: completed=true
설명: 첫 'n' 다음이 'n' (자음) → ん (nn)
```

### TC-JP-019: n + 모음

```
전제: Target = "くに" (display), 정답 romaji = "kuni"
실행: 'k' 'u' 'n' 'i'
기대: completed=true
설명: 'n' 다음이 'i' (모음) → ん이 아니라 'ni'
```

## 엣지 케이스

### TC-JP-030: 모호한 ん

```
전제: Target = "かんい" (display), 정답 romaji = "kan'i" 또는 "kanni"?
실행: 'k' 'a' 'n' 'i'
기대: 명확한 매핑 테이블에 따라 결정 (현재: "kan'i" 가정)
설명: 'ni'는 に, 'nn'은 んん. 매핑 테이블에 명시.
```

### TC-JP-031: Backspace

```
전제: Target = "ありがとう" (display)
실행: 'a' 'r' 'i' 'g' 'a' 't' 'x' Backspace 'o' 'u'
기대: 오타 후 복구 시 errors=0
```

### TC-JP-032: 한자만 표시

```
전제: Target = "東京" (display), 정답 romaji = "toukyou"
  # 또는 히라가나 표시 옵션: とうきょう
실행: 't' 'o' 'u' 'k' 'y' 'o' 'u'
기대: completed=true
설명: 표시 방식과 무관하게 romaji 매칭
```

## 힌트 시스템

### TC-JP-040: 빈 입력 힌트

```
전제: Target = "ありがとう" (display), 힌트 모드 ON
실행: (입력 없음)
기대: 힌트 = "다음: a..."
```

### TC-JP-041: 부분 입력 힌트

```
전제: Target = "ありがとう" (display), 힌트 모드 ON
실행: 'a' 'r' 'i'
기대: 힌트 = "다음: ga..."
```

## 정확도

### TC-JP-050: 정확도 100%

```
전제: Target = "ありがとう" (display)
실행: 8글자 모두 정확
기대: accuracy=100
```

### TC-JP-051: 중간 오타

```
전제: Target = "ありがとう" (display)
실행: 'a' 'r' 'i' 'x' 'a' 't' 'o' 'u' ('x' 오타)
기대: accuracy=88 (7/8)
```

## 다음 단계

- 핸들러 구현: `prototype/src/input/JapaneseHandler.ts`
- 자동화 테스트: Vitest `prototype/tests/input/japanese.test.ts`
- 매핑 테이블: `wiki/languages/japanese.md` 참조