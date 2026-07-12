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

## 카타카나 매핑

### TC-JP-060: 카타카나 기본

```
전제: Target = "アニメ" (display), 정답 romaji = "anime"
실행: 'a' 'n' 'i' 'm' 'e'
기대: completed=true
```

### TC-JP-061: 카타카나 장음 (ー)

```
전제: Target = "コーヒー" (display), 정답 romaji = "koohii"
실행: 'k' 'o' 'o' 'h' 'i' 'i'
기대: completed=true
설명: 'oo' → ー
```

### TC-JP-062: 카타카나 장음 (ou)

```
전제: Target = "ゲーム" (display), 정답 romaji = "geemu"
실행: 'g' 'e' 'e' 'm' 'u'
기대: completed=true
설명: 'ee' → ー
```

### TC-JP-063: 카타카나 촉음 (ッ)

```
전제: Target = "酒店" (display), 정답 romaji = "osake"
실행: 'o' 's' 'a' 'k' 'e'
기대: completed=true
```

### TC-JP-064: 카타카나 합성어

```
전제: Target = "インターネット" (display), 정답 romaji = "inta-netto"
실행: 'i' 'n' 't' 'a' '-' 'a' 'n' 'e' 't' 't' 'o'
기대: completed=true
```

### TC-JP-065: 카타카나 + 히라가나 혼합

```
전제: Target = "ノートパソコン" (display), 정답 romaji = "nootopasokon"
실행: 'n' 'o' 'o' 't' 'o' 'p' 'a' 's' 'o' 'k' 'o' 'n'
기대: completed=true
```

### TC-JP-066: 카타카나外来어

```
전제: Target = "ラーメン" (display), 정답 romaji = "raamen"
실행: 'r' 'a' 'a' 'm' 'e' 'n'
기대: completed=true
```

### TC-JP-067: 카타카나外来어

```
전제: Target = "パン" (display), 정답 romaji = "pan"
실행: 'p' 'a' 'n'
기대: completed=true
```

### TC-JP-068: 카타카나 복합어

```
전제: Target = "ジャーナリズム" (display), 정답 romaji = "jaanarizumu"
실행: 'j' 'a' 'a' 'n' 'a' 'r' 'i' 'z' 'u' 'm' 'u'
기대: completed=true
```

### TC-JP-069: 카타카나 促음

```
전제: Target = "サッカー" (display), 정답 romaji = "sakkaa"
실행: 's' 'a' 'k' 'k' 'a' 'a'
기대: completed=true
설명: 'kk' → ッ, 'aa' → ー
```

### TC-JP-070: 카타카나 外来어

```
전제: Target = "パスワード" (display), 정답 romaji = "pasuwaado"
실행: 'p' 'a' 's' 'u' 'w' 'a' 'a' 'd' 'o'
기대: completed=true
```

### TC-JP-071: 카타카나 システム

```
전제: Target = "コンピュータ" (display), 정답 romaji = "konpyu-ta"
실행: 'k' 'o' 'n' 'p' 'y' 'u' '-' 't' 'a'
기대: completed=true
```

### TC-JP-072: 카타카나 コーヒー

```
전제: Target = "コーヒー" (display), 정답 romaji = "koohii"
실행: 'k' 'o' 'o' 'h' 'i' 'i'
기대: completed=true
```

### TC-JP-073: 카타카나 タクシー

```
전제: Target = "タクシー" (display), 정답 romaji = "takushii"
실행: 't' 'a' 'k' 'u' 's' 'h' 'i' 'i'
기대: completed=true
```

### TC-JP-074: 카타카나 ジャケット

```
전제: Target = "ジャケット" (display), 정답 romaji = "jaketto"
실행: 'j' 'a' 'k' 'e' 't' 't' 'o'
기대: completed=true
```

### TC-JP-075: 카타카나 スケジュール

```
전제: Target = "スケジュール" (display), 정답 romaji = "sukejuuru"
실행: 's' 'u' 'k' 'e' 'j' 'u' 'u' 'r' 'u'
기대: completed=true
```

## 한자 매핑

### TC-JP-080: 한자 기본 (数字)

```
전제: Target = "一" (display), 정답 romaji = "ichi"
실행: 'i' 'c' 'h' 'i'
기대: completed=true
```

### TC-JP-081: 한자 基本 (日本)

```
전제: Target = "日" (display), 정답 romaji = "hi"
실행: 'n' 'i' 'h' 'o' 'n'
기대: completed=true
```

### TC-JP-082: 한자 火水

```
전제: Target = "火" (display), 정답 romaji = "ka"
실행: 'h' 'i'
기대: completed=true
```

### TC-JP-083: 한자 山川

```
전제: Target = "川" (display), 정답 romaji = "kawa"
실행: 'k' 'a' 'w' 'a'
기대: completed=true
```

### TC-JP-084: 한자 大中小

```
전제: Target = "体" (display), 정답 romaji = "karada"
실행: 'd' 'a' 'i'
기대: completed=true
```

### TC-JP-085: 한자 複数読み

```
전제: Target = "人" (display), 정답 romaji = "hito"
실행: 'h' 'i' 't' 'o'
기대: completed=true
```

### TC-JP-086: 한자複合語 (日本)

```
전제: Target = "日" (display), 정답 romaji = "hi"
실행: 'n' 'i' 'h' 'o' 'n'
기대: completed=true
```

### TC-JP-087: 한자 時間 (今日)

```
전제: Target = "今日" (display), 정답 romaji = "kyou"
실행: 'k' 'y' 'o' 'u'
기대: completed=true
```

### TC-JP-088: 한자 自然 (山)

```
전제: Target = "山" (display), 정답 romaji = "yama"
실행: 'y' 'a' 'm' 'a'
기대: completed=true
```

### TC-JP-089: 한자 仕事

```
전제: Target = "仕事" (display), 정답 romaji = "shigoto"
실행: 's' 'h' 'i' 'g' 'o' 't' 'o'
기대: completed=true
```

### TC-JP-090: 한자 学校

```
전제: Target = "学校" (display), 정답 romaji = "gakkou"
실행: 'g' 'a' 'k' 'k' 'o' 'u'
기대: completed=true
```

### TC-JP-091: 한자 先生

```
전제: Target = "先生" (display), 정답 romaji = "sensei"
실행: 's' 'e' 'n' 's' 'e' 'i'
기대: completed=true
```

### TC-JP-092: 한자 曜日 (水曜日)

```
전제: Target = "水" (display), 정답 romaji = "mizu"
실행: 'm' 'i' 'z' 'u'
기대: completed=true
```

### TC-JP-093: 한자 金銭 (金)

```
전제: Target = "金" (display), 정답 romaji = "kin"
실행: 'k' 'a' 'n' 'e'
기대: completed=true
```

### TC-JP-094: 한자 복합어 (電話)

```
전제: Target = "電話" (display), 정답 romaji = "denwa"
실행: 'd' 'e' 'n' 'w' 'a'
기대: completed=true
```

### TC-JP-095: 한자 복합어 (電気)

```
전제: Target = "駅" (display), 정답 romaji = "eki"
실행: 'e' 'k' 'i'
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