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

## 여행 (Travel) — Level 1

> **출처**: [[travel-basics-kr]], [[travel]] (TOPIK 1급)

### 공항 & 비행기

```yaml
- { id: kr_t_001, display: 공항, jamo: ㄱㅗㅎㅏㅇ, meaning: 공항, level: 1, category: travel }
- { id: kr_t_002, display: 여권, jamo: ㅇㅕㄱㅝㄴ, meaning: 여권, level: 1, category: travel }
- { id: kr_t_003, display: 비행기, jamo: ㅂㅣㅎㅐㅇㄱㅣ, meaning: 비행기, level: 1, category: travel }
- { id: kr_t_004, display: 짐, jamo: ㅈㅣㅁ, meaning: 짐, level: 1, category: travel }
- { id: kr_t_005, display: 가방, jamo: ㄱㅏㅂㅏㅇ, meaning: 가방, level: 1, category: travel }
- { id: kr_t_006, display: 표, jamo: ㅍㅛ, meaning: 표, level: 1, category: travel }
- { id: kr_t_007, display: 탑승구, jamo: ㅌㅏㅂㅅㅡㅇㄱㅜ, meaning: 탑승구, level: 1, category: travel }
- { id: kr_t_008, display: 도착, jamo: ㄷㅗㅊㅏㄱ, meaning: 도착, level: 1, category: travel }
- { id: kr_t_009, display: 출발, jamo: ㅊㅜㅂㅏㄹ, meaning: 출발, level: 1, category: travel }
```

### 호텔

```yaml
- { id: kr_t_010, display: 호텔, jamo: ㅎㅗㅌㅔㄹ, meaning: 호텔, level: 1, category: travel }
- { id: kr_t_011, display: 방, jamo: ㅂㅏㅇ, meaning: 방, level: 1, category: travel }
- { id: kr_t_012, display: 예약, jamo: ㅇㅖㅇㅏㄱ, meaning: 예약, level: 1, category: travel }
- { id: kr_t_013, display: 로비, jamo: ㄹㅗㅂㅣ, meaning: 로비, level: 1, category: travel }
- { id: kr_t_014, display: 열쇠, jamo: ㅇㅕㄹㅅㅚ, meaning: 열쇠, level: 1, category: travel }
- { id: kr_t_015, display: 묵다, jamo: ㅁㅜㄱㄷㅏ, meaning: 묵다, level: 1, category: travel }
```

### 식당

```yaml
- { id: kr_t_020, display: 식당, jamo: ㅅㅣㄱㄷㅏㅇ, meaning: 식당, level: 1, category: travel }
- { id: kr_t_021, display: 메뉴, jamo: ㅁㅔㄴㅠ, meaning: 메뉴, level: 1, category: travel }
- { id: kr_t_022, display: 주문, jamo: ㅈㅜㅁㅜㄴ, meaning: 주문, level: 1, category: travel }
- { id: kr_t_023, display: 음식, jamo: ㅇㅡㅁㅅㅣㄱ, meaning: 음식, level: 1, category: travel }
- { id: kr_t_024, display: 계산, jamo: ㄱㅖㅅㅏㄴ, meaning: 계산, level: 1, category: travel }
- { id: kr_t_025, display: 팁, jamo: ㅌㅣㅍ, meaning: 팁, level: 1, category: travel }
- { id: kr_t_026, display: 맛있다, jamo: ㅁㅏㅅㅇㅣㅆㄷㅏ, meaning: 맛있다, level: 1, category: travel }
```

### 교통

```yaml
- { id: kr_t_030, display: 지하철, jamo: ㅈㅣㅎㅏㅊㅓㄹ, meaning: 지하철, level: 1, category: travel }
- { id: kr_t_031, display: 버스, jamo: ㅂㅓㅅㅡ, meaning: 버스, level: 1, category: travel }
- { id: kr_t_032, display: 택시, jamo: ㅌㅐㄱㅅㅣ, meaning: 택시, level: 1, category: travel }
- { id: kr_t_033, display: 기차, jamo: ㄱㅣㅊㅏ, meaning: 기차, level: 1, category: travel }
- { id: kr_t_034, display: 역, jamo: ㅇㅕㄱ, meaning: 역, level: 1, category: travel }
- { id: kr_t_035, display: 정류장, jamo: ㅈㅓㅇㄹㅠㅈㅏㅇ, meaning: 정류장, level: 1, category: travel }
- { id: kr_t_036, display: 환승, jamo: ㅎㅘㄴㅅㅡㅇ, meaning: 환승, level: 1, category: travel }
- { id: kr_t_037, display: 타다, jamo: ㅌㅏㄷㅏ, meaning: 타다, level: 1, category: travel }
- { id: kr_t_038, display: 내리다, jamo: ㄴㅐㄹㅣㄷㅏ, meaning: 내리다, level: 1, category: travel }
```

### 관광

```yaml
- { id: kr_t_040, display: 박물관, jamo: ㅂㅏㄱㅁㅜㄹㄱㅘㄴ, meaning: 박물관, level: 1, category: travel }
- { id: kr_t_041, display: 해변, jamo: ㅎㅐㅂㅕㄴ, meaning: 해변, level: 1, category: travel }
- { id: kr_t_042, display: 산, jamo: ㅅㅏㄴ, meaning: 산, level: 1, category: travel }
- { id: kr_t_043, display: 공원, jamo: ㄱㅗㅇㅇㅜㅓㄴ, meaning: 공원, level: 1, category: travel }
- { id: kr_t_044, display: 절, jamo: ㅈㅓㄹ, meaning: 절, level: 1, category: travel }
- { id: kr_t_045, display: 궁궐, jamo: ㄱㅜㅇㄱㅜㄹ, meaning: 궁궐, level: 1, category: travel }
- { id: kr_t_046, display: 지도, jamo: ㅈㅣㄷㅗ, meaning: 지도, level: 1, category: travel }
- { id: kr_t_047, display: 사진, jamo: ㅅㅏㅈㅣㄴ, meaning: 사진, level: 1, category: travel }
- { id: kr_t_048, display: 구경하다, jamo: ㄱㅜㄱㅕㅇㅎㅏㄷㅏ, meaning: 구경하다, level: 1, category: travel }
```

### 여행 문장 (Travel Phrases)

```yaml
- id: kr_t_s_001
  display: 화장실 어디예요?
  jamo: ㅎㅘㅈㅏㅇㅅㅣㄹ ㅇㅓㄷㅣㅇㅖㅛ?
  meaning: 화장실 어디예요?
  level: 1
  category: travel
  source: [[travel]]

- id: kr_t_s_002
  display: 얼마예요?
  jamo: ㅇㅓㄹㅁㅏㅇㅖㅛ?
  meaning: 얼마예요?
  level: 1
  category: travel
  source: [[travel]]

- id: kr_t_s_003
  display: 도와주세요
  jamo: ㄷㅗㅇㅘㅈㅜㅅㅔㅇㅛ
  meaning: 도와주세요
  level: 1
  category: travel
  source: [[travel]]

- id: kr_t_s_004
  display: 감사합니다
  jamo: ㄱㅏㅁㅅㅏㅎㅏㅂㄴㅣㄷㅏ
  meaning: 감사합니다
  level: 1
  category: travel
  source: [[travel]]

- id: kr_t_s_005
  display: 호텔은 어디예요?
  jamo: ㅎㅗㅌㅔㄹㅇㅡㄴ ㅇㅓㄷㅣㅇㅖㅛ?
  meaning: 호텔은 어디예요?
  level: 1
  category: travel
  source: [[travel]]
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
- travel (여행)

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