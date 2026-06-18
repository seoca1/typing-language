# English Word/Sentence Corpus

> **상태**: 골격. Phase 6에서 본격 확장.

## 출처

- 일반 단어: OEC (Oxford English Corpus) 빈도순
- CEFR 어휘: Oxford 3000, English Profile
- 문장: 위키피디아 (CC-BY-SA), BBC Learning English
- 빈도: SUBTLEX-US, COCA

## 코퍼스 형식

각 단어/문장은 다음 형식을 따름 (YAML):

```yaml
- id: en_001
  display: hello
  meaning: 인사
  level: 1        # 1=A1, 2=A2, 3=B1, 4=B2, 5=C1/C2
  category: greeting
  # sentences only:
  # source: Wikipedia
  # license: CC-BY-SA
```

## 단어 (Words) — Level 1 (A1, 가장 흔함)

```yaml
- { id: en_001, display: hello, meaning: 안녕, level: 1, category: greeting }
- { id: en_002, display: hi, meaning: 안녕, level: 1, category: greeting }
- { id: en_003, display: goodbye, meaning: 안녕히, level: 1, category: greeting }
- { id: en_004, display: thanks, meaning: 고마워, level: 1, category: greeting }
- { id: en_005, display: please, meaning: 부디, level: 1, category: greeting }
- { id: en_006, display: yes, meaning: 네, level: 1, category: basic }
- { id: en_007, display: no, meaning: 아니오, level: 1, category: basic }
- { id: en_008, display: sorry, meaning: 미안, level: 1, category: basic }
- { id: en_009, display: one, meaning: 하나, level: 1, category: number }
- { id: en_010, display: two, meaning: 둘, level: 1, category: number }
- { id: en_011, display: three, meaning: 셋, level: 1, category: number }
- { id: en_012, display: ten, meaning: 열, level: 1, category: number }
- { id: en_013, display: red, meaning: 빨강, level: 1, category: color }
- { id: en_014, display: blue, meaning: 파랑, level: 1, category: color }
- { id: en_015, display: green, meaning: 초록, level: 1, category: color }
- { id: en_016, display: cat, meaning: 고양이, level: 1, category: animal }
- { id: en_017, display: dog, meaning: 개, level: 1, category: animal }
- { id: en_018, display: book, meaning: 책, level: 1, category: object }
- { id: en_019, display: water, meaning: 물, level: 1, category: food }
- { id: en_020, display: bread, meaning: 빵, level: 1, category: food }
- { id: en_021, display: today, meaning: 오늘, level: 1, category: time }
- { id: en_022, display: tomorrow, meaning: 내일, level: 1, category: time }
- { id: en_023, display: morning, meaning: 아침, level: 1, category: time }
- { id: en_024, display: mother, meaning: 어머니, level: 1, category: family }
- { id: en_025, display: father, meaning: 아버지, level: 1, category: family }
```

## 단어 — Level 2 (A2)

```yaml
- { id: en_026, display: morning, meaning: 아침, level: 2, category: time }
- { id: en_027, display: hungry, meaning: 배고픈, level: 2, category: feeling }
- { id: en_028, display: together, meaning: 함께, level: 2, category: basic }
- { id: en_029, display: beautiful, meaning: 아름다운, level: 2, category: adjective }
- { id: en_030, display: restaurant, meaning: 식당, level: 2, category: place }
- { id: en_031, display: hospital, meaning: 병원, level: 2, category: place }
- { id: en_032, display: expensive, meaning: 비싼, level: 2, category: adjective }
- { id: en_033, display: important, meaning: 중요한, level: 2, category: adjective }
- { id: en_034, display: difficult, meaning: 어려운, level: 2, category: adjective }
- { id: en_035, display: favorite, meaning: 좋아하는, level: 2, category: adjective }
```

## 단어 — Level 3~5

(추가 예정)

## 문장 (Sentences) — Level 1~2

```yaml
- { id: ens_001, display: Hello, how are you?, level: 1, category: greeting, source: "Basic English" }
- { id: ens_002, display: I am happy today., level: 1, category: basic, source: "Basic English" }
- { id: ens_003, display: Where is the bathroom?, level: 2, category: question, source: "Travel phrases" }
- { id: ens_004, display: I would like some water., level: 2, category: restaurant, source: "Restaurant phrases" }
- { id: ens_005, display: Thank you very much., level: 1, category: greeting, source: "Basic English" }
```

## 문장 — Level 3~5

(추가 예정)

## 여행 어휘 (Travel) — Level 1~2

> **출처**: [[travel-basics]], [[travel]] (CEFR A1-A2)
> **카테고리**: travel (여행)

### 공항 & 비행기 (Airport)

```yaml
- { id: en_t_001, display: passport, meaning: 여권, level: 1, category: travel }
- { id: en_t_002, display: ticket, meaning: 표, level: 1, category: travel }
- { id: en_t_003, display: suitcase, meaning: 여행가방, level: 1, category: travel }
- { id: en_t_004, display: airport, meaning: 공항, level: 1, category: travel }
- { id: en_t_005, display: gate, meaning: 탑승구, level: 2, category: travel }
- { id: en_t_006, display: boarding, meaning: 탑승, level: 2, category: travel }
- { id: en_t_007, display: flight, meaning: 항공편, level: 2, category: travel }
- { id: en_t_008, display: arrive, meaning: 도착하다, level: 1, category: travel }
```

### 호텔 & 숙소 (Hotel)

```yaml
- { id: en_t_010, display: hotel, meaning: 호텔, level: 1, category: travel }
- { id: en_t_011, display: room, meaning: 방, level: 1, category: travel }
- { id: en_t_012, display: reservation, meaning: 예약, level: 2, category: travel }
- { id: en_t_013, display: lobby, meaning: 로비, level: 2, category: travel }
- { id: en_t_014, display: elevator, meaning: 엘리베이터, level: 2, category: travel }
- { id: en_t_015, display: checkout, meaning: 체크아웃, level: 2, category: travel }
- { id: en_t_016, display: stay, meaning: 묵다, level: 1, category: travel }
```

### 식당 & 음식 (Restaurant)

```yaml
- { id: en_t_020, display: menu, meaning: 메뉴, level: 1, category: travel }
- { id: en_t_021, display: waiter, meaning: 웨이터, level: 2, category: travel }
- { id: en_t_022, display: order, meaning: 주문하다, level: 1, category: travel }
- { id: en_t_023, display: dessert, meaning: 디저트, level: 2, category: travel }
- { id: en_t_024, display: bill, meaning: 계산서, level: 2, category: travel }
- { id: en_t_025, display: recommend, meaning: 추천하다, level: 2, category: travel }
```

### 교통 (Transport)

```yaml
- { id: en_t_030, display: subway, meaning: 지하철, level: 1, category: travel }
- { id: en_t_031, display: taxi, meaning: 택시, level: 1, category: travel }
- { id: en_t_032, display: station, meaning: 역, level: 1, category: travel }
- { id: en_t_033, display: platform, meaning: 승강장, level: 2, category: travel }
- { id: en_t_034, display: transfer, meaning: 환승, level: 2, category: travel }
- { id: en_t_035, display: ride, meaning: 타다, level: 1, category: travel }
- { id: en_t_036, display: walk, meaning: 걷다, level: 1, category: travel }
- { id: en_t_037, display: bus, meaning: 버스, level: 1, category: travel }
```

### 관광 (Sightseeing)

```yaml
- { id: en_t_040, display: museum, meaning: 박물관, level: 1, category: travel }
- { id: en_t_041, display: beach, meaning: 해변, level: 1, category: travel }
- { id: en_t_042, display: mountain, meaning: 산, level: 1, category: travel }
- { id: en_t_043, display: park, meaning: 공원, level: 1, category: travel }
- { id: en_t_044, display: visit, meaning: 방문하다, level: 1, category: travel }
- { id: en_t_045, display: explore, meaning: 탐험하다, level: 2, category: travel }
- { id: en_t_046, display: map, meaning: 지도, level: 1, category: travel }
- { id: en_t_047, display: guide, meaning: 가이드, level: 2, category: travel }
- { id: en_t_048, display: tour, meaning: 투어, level: 2, category: travel }
- { id: en_t_049, display: view, meaning: 전망, level: 2, category: travel }
```

### 여행 문장 (Travel Phrases) — Level 3

```yaml
- id: en_t_s_001
  display: Where is the hotel?
  meaning: 호텔은 어디에 있나요?
  level: 3
  category: travel
  source: [[travel]]

- id: en_t_s_002
  display: How much does it cost?
  meaning: 얼마예요?
  level: 3
  category: travel
  source: [[travel]]

- id: en_t_s_003
  display: I would like to check in.
  meaning: 체크인하고 싶습니다.
  level: 3
  category: travel
  source: [[travel]]

- id: en_t_s_004
  display: Could you help me?
  meaning: 도와주실 수 있나요?
  level: 3
  category: travel
  source: [[travel]]

- id: en_t_s_005
  display: Where is the bathroom?
  meaning: 화장실 어디예요?
  level: 3
  category: travel
  source: [[travel]]

- id: en_t_s_006
  display: I would like to order.
  meaning: 주문하겠습니다.
  level: 3
  category: travel
  source: [[travel]]
```

## 카테고리 목록

- greeting (인사)
- basic (기본)
- number (숫자)
- color (색상)
- time (시간)
- family (가족)
- animal (동물)
- food (음식)
- object (사물)
- place (장소)
- adjective (형용사)
- feeling (감정)
- question (질문)
- travel (여행)

## 라이선스

- 단어 자체는 저작권 없음 (사실/언어)
- 문장은 출처 명시 + 라이선스 확인 필수
- 현재 골격의 문장은 학습용 일반 표현 (출처 불명확한 경우 추후 교체)

## 확장 계획 (Phase 6)

- [ ] Level 1 단어 100개 확장
- [ ] Level 2~5 단어 각 200개
- [ ] 일상 회화 문장 50개
- [ ] 뉴스 헤드라인 30개
- [ ] 문학 발췌 10개

## 다음 단계

- JSON 형식 변환: `prototype/src/data/en_words.json`
- 단어 검증 (오타, 중복)
- 라이선스 명시