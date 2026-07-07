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
- { id: en_001, display: hello, meaning: 안녕, level: 1, category: greeting, source: [[hello]] }
- { id: en_002, display: hi, meaning: 안녕, level: 1, category: greeting, source: [[hi]] }
- { id: en_003, display: goodbye, meaning: 안녕히, level: 1, category: greeting, source: [[goodbye]] }
- { id: en_004, display: thanks, meaning: 고마워, level: 1, category: greeting, source: [[thanks]] }
- { id: en_005, display: please, meaning: 부디, level: 1, category: greeting, source: [[please]] }
- { id: en_006, display: yes, meaning: 네, level: 1, category: basic, source: [[yes]] }
- { id: en_007, display: no, meaning: 아니오, level: 1, category: basic, source: [[no]] }
- { id: en_008, display: sorry, meaning: 미안, level: 1, category: basic, source: [[sorry]] }
- { id: en_009, display: one, meaning: 하나, level: 1, category: number, source: [[one]] }
- { id: en_010, display: two, meaning: 둘, level: 1, category: number, source: [[two]] }
- { id: en_011, display: three, meaning: 셋, level: 1, category: number, source: [[three]] }
- { id: en_012, display: ten, meaning: 열, level: 1, category: number, source: [[ten]] }
- { id: en_013, display: red, meaning: 빨강, level: 1, category: color, source: [[red]] }
- { id: en_014, display: blue, meaning: 파랑, level: 1, category: color, source: [[blue]] }
- { id: en_015, display: green, meaning: 초록, level: 1, category: color, source: [[green]] }
- { id: en_016, display: cat, meaning: 고양이, level: 1, category: animal, source: [[cat]] }
- { id: en_017, display: dog, meaning: 개, level: 1, category: animal, source: [[dog]] }
- { id: en_018, display: book, meaning: 책, level: 1, category: object, source: [[book]] }
- { id: en_019, display: water, meaning: 물, level: 1, category: food, source: [[water]] }
- { id: en_020, display: bread, meaning: 빵, level: 1, category: food, source: [[bread]] }
- { id: en_021, display: today, meaning: 오늘, level: 1, category: time, source: [[today]] }
- { id: en_022, display: tomorrow, meaning: 내일, level: 1, category: time, source: [[tomorrow]] }
- { id: en_023, display: morning, meaning: 아침, level: 1, category: time, source: [[morning]] }
- { id: en_024, display: mother, meaning: 어머니, level: 1, category: family, source: [[mother]] }
- { id: en_025, display: father, meaning: 아버지, level: 1, category: family, source: [[father]] }
- { id: en_036, display: face, meaning: 얼굴, level: 1, category: body, source: [[face]] }
- { id: en_037, display: chest, meaning: 가슴, level: 1, category: body, source: [[chest]] }
- { id: en_038, display: aunt, meaning: 이모, level: 1, category: family, source: [[aunt]] }
- { id: en_039, display: baby, meaning: 아기, level: 1, category: family, source: [[baby]] }
- { id: en_040, display: cola, meaning: 콜라, level: 1, category: food, source: [[cola]] }
- { id: en_041, display: pepper, meaning: 후추, level: 1, category: food, source: [[pepper]] }
- { id: en_042, display: vinegar, meaning: 식초, level: 1, category: food, source: [[vinegar]] }
```

## 단어 — Level 2 (A2)

```yaml
- { id: en_026, display: morning, meaning: 아침, level: 2, category: time, source: [[morning]] }
- { id: en_027, display: hungry, meaning: 배고픈, level: 2, category: feeling, source: [[hungry]] }
- { id: en_028, display: together, meaning: 함께, level: 2, category: basic, source: [[together]] }
- { id: en_029, display: beautiful, meaning: 아름다운, level: 2, category: adjective, source: [[beautiful]] }
- { id: en_030, display: restaurant, meaning: 식당, level: 2, category: place, source: [[restaurant]] }
- { id: en_031, display: hospital, meaning: 병원, level: 2, category: place, source: [[hospital]] }
- { id: en_032, display: expensive, meaning: 비싼, level: 2, category: adjective, source: [[expensive]] }
- { id: en_033, display: important, meaning: 중요한, level: 2, category: adjective, source: [[important]] }
- { id: en_034, display: difficult, meaning: 어려운, level: 2, category: adjective, source: [[difficult]] }
- { id: en_035, display: favorite, meaning: 좋아하는, level: 2, category: adjective, source: [[favorite]] }
```

## 단어 — Level 3~5

(추가 예정)

## 문장 (Sentences) — Level 1~2

```yaml
- { id: ens_001, display: Hello, how are you?, level: 1, category: greeting, source: [[hello-how-are-you]] }
- { id: ens_002, display: I am happy today., level: 1, category: basic, source: [[i-am-happy-today]] }
- { id: ens_003, display: Where is the bathroom?, level: 2, category: question, source: [[where-is-the-bathroom]] }
- { id: ens_004, display: I would like some water., level: 2, category: restaurant, source: [[i-would-like-some-water]] }
- { id: ens_005, display: Thank you very much., level: 1, category: greeting, source: [[thank-you-very-much]] }
```

## 문장 — Level 3~5

(추가 예정)

## 여행 어휘 (Travel) — Level 1~2

> **출처**: [[first-travel-japan]] (raw/English/first-travel-japan.md)
> **위키 페이지**: 각 단어마다 별도 페이지 존재 (예: [[airport]], [[hotel]], [[passport]])
> **카테고리**: travel (여행)

### 공항 & 비행기 (Airport)

```yaml
- { id: en_t_001, display: airport, meaning: 공항, level: 1, category: travel, source: [[airport]], romaji: airport }
- { id: en_t_002, display: passport, meaning: 여권, level: 1, category: travel, source: [[passport]], romaji: passport }
- { id: en_t_003, display: immigration, meaning: 입국심사, level: 2, category: travel, source: [[immigration]], romaji: immigration }
- { id: en_t_004, display: customs, meaning: 세관, level: 2, category: travel, source: [[customs]], romaji: customs }
- { id: en_t_005, display: luggage, meaning: 짐, level: 2, category: travel, source: [[luggage]], romaji: luggage }
- { id: en_t_006, display: exit, meaning: 출구, level: 1, category: travel, source: [[exit]], romaji: exit }
- { id: en_t_007, display: entrance, meaning: 입구, level: 2, category: travel, source: [[entrance]], romaji: entrance }
```

### 호텔 & 숙소 (Hotel)

```yaml
- { id: en_t_010, display: hotel, meaning: 호텔, level: 1, category: travel, source: [[hotel]], romaji: hotel }
- { id: en_t_011, display: reservation, meaning: 예약, level: 2, category: travel, source: [[reservation]], romaji: reservation }
- { id: en_t_012, display: room, meaning: 방, level: 1, category: travel, source: [[room]], romaji: room }
- { id: en_t_013, display: breakfast, meaning: 아침 식사, level: 2, category: travel, source: [[breakfast]], romaji: breakfast }
- { id: en_t_014, display: key, meaning: 열쇠, level: 1, category: travel, source: [[key]], romaji: key }
```

### 식당 & 음식 (Restaurant)

```yaml
- { id: en_t_020, display: restaurant, meaning: 식당, level: 1, category: travel, source: [[restaurant]], romaji: restaurant }
- { id: en_t_021, display: menu, meaning: 메뉴, level: 1, category: travel, source: [[menu]], romaji: menu }
- { id: en_t_022, display: order, meaning: 주문하다, level: 1, category: travel, source: [[order]], romaji: order }
- { id: en_t_023, display: bill, meaning: 계산서, level: 2, category: travel, source: [[bill]], romaji: bill }
- { id: en_t_024, display: tip, meaning: 팁, level: 2, category: travel, source: [[tip]], romaji: tip }
- { id: en_t_025, display: delicious, meaning: 맛있다, level: 1, category: travel, source: [[delicious]], romaji: delicious }
- { id: en_t_026, display: spicy, meaning: 맵다, level: 2, category: travel, source: [[spicy]], romaji: spicy }
```

### 교통 (Transport)

```yaml
- { id: en_t_030, display: station, meaning: 역, level: 1, category: travel, source: [[station]], romaji: station }
- { id: en_t_031, display: subway, meaning: 지하철, level: 2, category: travel, source: [[subway]], romaji: subway }
- { id: en_t_032, display: train, meaning: 기차, level: 2, category: travel, source: [[train]], romaji: train }
- { id: en_t_033, display: bus, meaning: 버스, level: 1, category: travel, source: [[bus]], romaji: bus }
- { id: en_t_034, display: taxi, meaning: 택시, level: 1, category: travel, source: [[taxi]], romaji: taxi }
- { id: en_t_035, display: ticket, meaning: 표, level: 1, category: travel, source: [[ticket]], romaji: ticket }
- { id: en_t_036, display: left, meaning: 왼쪽, level: 1, category: travel, source: [[left]], romaji: left }
- { id: en_t_037, display: right, meaning: 오른쪽, level: 1, category: travel, source: [[right]], romaji: right }
- { id: en_t_038, display: straight, meaning: 직진, level: 2, category: travel, source: [[straight]], romaji: straight }
- { id: en_t_039, display: near, meaning: 가까이, level: 1, category: travel, source: [[near]], romaji: near }
- { id: en_t_040, display: far, meaning: 멀리, level: 1, category: travel, source: [[far]], romaji: far }
```

### 관광 (Sightseeing)

```yaml
- { id: en_t_050, display: temple, meaning: 절, level: 2, category: travel, source: [[temple]], romaji: temple }
- { id: en_t_051, display: shrine, meaning: 신사, level: 2, category: travel, source: [[shrine]], romaji: shrine }
- { id: en_t_052, display: museum, meaning: 박물관, level: 1, category: travel, source: [[museum]], romaji: museum }
- { id: en_t_053, display: park, meaning: 공원, level: 1, category: travel, source: [[park]], romaji: park }
- { id: en_t_054, display: mountain, meaning: 산, level: 1, category: travel, source: [[mountain]], romaji: mountain }
- { id: en_t_055, display: sea, meaning: 바다, level: 1, category: travel, source: [[sea]], romaji: sea }
- { id: en_t_056, display: photo, meaning: 사진, level: 1, category: travel, source: [[photo]], romaji: photo }
- { id: en_t_057, display: map, meaning: 지도, level: 1, category: travel, source: [[map]], romaji: map }
- { id: en_t_058, display: guide, meaning: 가이드, level: 2, category: travel, source: [[guide]], romaji: guide }
- { id: en_t_059, display: cheap, meaning: 싸다, level: 2, category: travel, source: [[cheap]], romaji: cheap }
- { id: en_t_060, display: expensive, meaning: 비싸다, level: 2, category: travel, source: [[expensive]], romaji: expensive }
```

### 여행 표현 (Travel Expressions) — Level 3

```yaml
- id: en_t_s_001
  display: Where is the hotel?
  meaning: 호텔은 어디에 있나요?
  level: 3
  category: travel
  source: [[where-is]]
  romaji: where-is-the-hotel

- id: en_t_s_002
  display: How much is it?
  meaning: 얼마예요?
  level: 3
  category: travel
  source: [[how-much]]
  romaji: how-much-is-it

- id: en_t_s_003
  display: I would like to check in.
  meaning: 체크인하고 싶습니다.
  level: 3
  category: travel
  source: [[first-travel-japan]]
  romaji: i-would-like-to-check-in

- id: en_t_s_004
  display: Where is the bathroom?
  meaning: 화장실 어디예요?
  level: 3
  category: travel
  source: [[first-travel-japan]]
  romaji: where-is-the-bathroom

- id: en_t_s_005
  display: May I see the menu?
  meaning: 메뉴판 좀 볼 수 있을까요?
  level: 3
  category: travel
  source: [[first-travel-japan]]
  romaji: may-i-see-the-menu

- id: en_t_s_006
  display: Thank you very much.
  meaning: 정말 감사합니다.
  level: 1
  category: travel
  source: [[first-travel-japan]]
  romaji: thank-you-very-much
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