# Korean Word/Sentence Corpus

> **상태**: 골격. Phase 6에서 본격 확장.
> **ADR-0009**: 한국어 입력 방식 — Draft (사용자 결정 대기).
> **업스트림**: `Language/wiki/Korean/` 에서 인용. 인제스트 후 채워짐.

## 파이프라인

이 코퍼스의 모든 항목은 `Language/wiki/Korean/vocabulary/{word}.md` 페이지를 **반드시** 인용해야 한다.

```
Language/raw/Korean/         (소스 자료, immutable)
  └─ ingest
Language/wiki/Korean/vocabulary/
  └─ curate (source: [[...]])
Game/typing_language/raw/kr_words.md  ← 이 파일
  └─ build
Game/typing_language/prototype/src/data/kr_words.json
```

자세한 내용: `wiki/corpus-pipeline.md`, `wiki/languages/korean.md`

## 코퍼스 형식

```yaml
- id: kr_001
  display: 안녕하세요          # 화면 표시 (한글 완성형)
  input: annyeonghaseyo       # 사용자가 타이핑 (로마자)
  meaning: hello (polite)     # 영어 정의 또는 한국어 뜻
  level: 1                    # TOPIK 1~6 (1=기초, 6=최고)
  category: greeting
  source: "[[annyeonghaseyo]]"   # Language/wiki/Korean/vocabulary/ 페이지 인용 (필수)
  note: ""                    # 선택. irregular, 발음 변동 등 게임 메카닉 비고
```

> **`source` 필드는 필수**. 누락 시 lint 결함.

## Level 1 (TOPIK 1, 기초)

### 인사 (Greeting)

> Language 위키 인제스트 후 채워질 골격. 현재 `Language/wiki/Korean/vocabulary/` 비어 있음 — 인제스트가 선행되어야 한다.

```yaml
# (예정 — Language 위키 시드 후 추가)
# - { id: kr_001, display: 안녕하세요, input: annyeonghaseyo, meaning: hello (polite), level: 1, category: greeting, source: "[[annyeonghaseyo]]" }
# - { id: kr_002, display: 안녕히 가세요, input: annyeonghi gaseyo, meaning: goodbye (to person leaving), level: 1, category: greeting, source: "[[annyeonghi-gaseyo]]" }
# - { id: kr_003, display: 감사합니다, input: gamsahamnida, meaning: thank you, level: 1, category: greeting, source: "[[gamsahamnida]]" }
# - { id: kr_004, display: 죄송합니다, input: joesonghamnida, meaning: I'm sorry, level: 1, category: greeting, source: "[[joesonghamnida]]" }
```

### 숫자 (Number)

```yaml
# (예정 — Language 위키 시드 후 추가)
# - { id: kr_010, display: 하나, input: hana, meaning: one, level: 1, category: number, source: "[[hana]]" }
# - { id: kr_011, display: 둘, input: dul, meaning: two, level: 1, category: number, source: "[[dul]]" }
# - { id: kr_012, display: 셋, input: set, meaning: three, level: 1, category: number, source: "[[set]]" }
# - { id: kr_013, display: 열, input: yeol, meaning: ten, level: 1, category: number, source: "[[yeol]]" }
# - { id: kr_014, display: 백, input: baek, meaning: hundred, level: 1, category: number, source: "[[baek]]" }
```

### 색상 (Color)

```yaml
# (예정)
```

### 가족 (Family)

```yaml
# (예정)
```

### 음식 (Food)

```yaml
# (예정)
```

## Level 2 (TOPIK 2, 일상)

(예정 — Language 위키 인제스트 후)

## Level 3~6

(예정)

## 문장 (Sentences)

(예정)

## 카테고리

- greeting (인사)
- number (숫자)
- color (색상)
- time (시간)
- family (가족)
- animal (동물)
- food (음식)
- place (장소)
- person (사람)
- object (사물)
- common_verb (기본 동사)
- adjective (형용사)
- feeling (감정)
- question (질문)

## 발음 변동 메모 (게임 핸들러 참고)

ADR-0009 결정 후 정식 매핑. 자주 쓰는 변동:

| 패턴 | 예시 | 입력 노트 |
| --- | --- | --- |
| ㄷ + ㅣ → ㅊ | 같이 (gachi) | dat → cha 음변 |
| ㅂ + ㅅ → ㅆ | 있습니다 (isseumnida) | b + s → ss |
| ㅂ + ㄴ → ㅁ | 않습니다 (animnida) | b + n → m |
| ㄴ + ㅇ → ㄴㄴ | 한국어 (hangug-eo) | 연음 방지 |

자세한 내용: `wiki/languages/korean.md` > 받침 규칙, 발음 변동 예시

## 라이선스

- 단어 자체는 저작권 없음
- 문장은 출처 명시 + 라이선스 확인 필수
- 교재 인용은 학습 목적 fair use 범위 내에서

## 확장 계획

1. `Language/raw/Korean/` 에 TOPIK 1 단어장 PDF/웹클립 추가
2. `Language/wiki/Korean/` 인제스트 → vocabulary 페이지 30~50개 생성
3. `Game/typing_language/raw/kr_words.md` 에 인용과 함께 큐레이션
4. 발음 변동 매핑 단어 단위 추가
5. Level 2~6 순차 확장

## 다음 단계

- ADR-0009 사용자 결정
- `Language/raw/Korean/` 첫 출처 추가 (TOPIK 1 또는 Yonsei Korean 1-1)
- Language 위키 인제스트 (vocabulary 페이지 시드)
- 본 코퍼스 파일에 실제 항목 추가 (인용 필수)
- JSON 변환: `prototype/src/data/kr_words.json`
- 핸들러 구현: `prototype/src/input/KoreanHandler.ts`
- 단위 테스트