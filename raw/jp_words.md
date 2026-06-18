# Japanese Word/Sentence Corpus (Romaji 매핑)

> **상태**: 골격. Phase 6에서 본격 확장.
> **ADR-0002**: 로마자→한자 직접 매핑.

## 코퍼스 형식

```yaml
- id: jp_001
  display: こんにちは
  romaji: konnichiwa
  meaning: hello
  level: 5        # JLPT N5=5, N4=4, N3=3, N2=2, N1=1 (낮을수록 어려움)
  category: greeting
```

## Level 5 (JLPT N5) — 히라가나 중심

```yaml
- { id: jp_001, display: こんにちは, romaji: konnichiwa, meaning: hello, level: 5, category: greeting }
- { id: jp_002, display: おはよう, romaji: ohayou, meaning: good morning, level: 5, category: greeting }
- { id: jp_003, display: こんばんは, romaji: konbanwa, meaning: good evening, level: 5, category: greeting }
- { id: jp_004, display: ありがとう, romaji: arigatou, meaning: thank you, level: 5, category: greeting }
- { id: jp_005, display: さようなら, romaji: sayounara, meaning: goodbye, level: 5, category: greeting }
- { id: jp_006, display: すみません, romaji: sumimasen, meaning: excuse me, level: 5, category: greeting }
- { id: jp_007, display: いち, romaji: ichi, meaning: one, level: 5, category: number }
- { id: jp_008, display: に, romaji: ni, meaning: two, level: 5, category: number }
- { id: jp_009, display: さん, romaji: san, meaning: three, level: 5, category: number }
- { id: jp_010, display: よん, romaji: yon, meaning: four, level: 5, category: number }
- { id: jp_011, display: ご, romaji: go, meaning: five, level: 5, category: number }
- { id: jp_012, display: ろく, romaji: roku, meaning: six, level: 5, category: number }
- { id: jp_013, display: なな, romaji: nana, meaning: seven, level: 5, category: number }
- { id: jp_014, display: はち, romaji: hachi, meaning: eight, level: 5, category: number }
- { id: jp_015, display: きゅう, romaji: kyuu, meaning: nine, level: 5, category: number }
- { id: jp_016, display: じゅう, romaji: juu, meaning: ten, level: 5, category: number }
- { id: jp_017, display: あか, romaji: aka, meaning: red, level: 5, category: color }
- { id: jp_018, display: あお, romaji: ao, meaning: blue, level: 5, category: color }
- { id: jp_019, display: しろ, romaji: shiro, meaning: white, level: 5, category: color }
- { id: jp_020, display: くろ, romaji: kuro, meaning: black, level: 5, category: color }
- { id: jp_021, display: みず, romaji: mizu, meaning: water, level: 5, category: food }
- { id: jp_022, display: ごはん, romaji: gohan, meaning: rice/meal, level: 5, category: food }
- { id: jp_023, display: さかな, romaji: sakana, meaning: fish, level: 5, category: food }
- { id: jp_024, display: ねこ, romaji: neko, meaning: cat, level: 5, category: animal }
- { id: jp_025, display: いぬ, romaji: inu, meaning: dog, level: 5, category: animal }
```

## Level 5 — 한자 포함 (기본 한자 100)

```yaml
- { id: jp_030, display: 一, romaji: ichi, meaning: one, level: 5, category: kanji_basic }
- { id: jp_031, display: 二, romaji: ni, meaning: two, level: 5, category: kanji_basic }
- { id: jp_032, display: 三, romaji: san, meaning: three, level: 5, category: kanji_basic }
- { id: jp_033, display: 四, romaji: yon/shi, meaning: four, level: 5, category: kanji_basic }
- { id: jp_034, display: 五, romaji: go, meaning: five, level: 5, category: kanji_basic }
- { id: jp_035, display: 六, romaji: roku, meaning: six, level: 5, category: kanji_basic }
- { id: jp_036, display: 七, romaji: nana/shichi, meaning: seven, level: 5, category: kanji_basic }
- { id: jp_037, display: 八, romaji: hachi, meaning: eight, level: 5, category: kanji_basic }
- { id: jp_038, display: 九, romaji: kyuu/ku, meaning: nine, level: 5, category: kanji_basic }
- { id: jp_039, display: 十, romaji: juu, meaning: ten, level: 5, category: kanji_basic }
- { id: jp_040, display: 人, romaji: hito, meaning: person, level: 5, category: kanji_basic }
- { id: jp_041, display: 日, romaji: hi/nichi, meaning: day/sun, level: 5, category: kanji_basic }
- { id: jp_042, display: 月, romaji: tsuki/getsu, meaning: month/moon, level: 5, category: kanji_basic }
- { id: jp_043, display: 火, romaji: hi/ka, meaning: fire, level: 5, category: kanji_basic }
- { id: jp_044, display: 水, romaji: mizu/sui, meaning: water, level: 5, category: kanji_basic }
- { id: jp_045, display: 木, romaji: ki/moku, meaning: tree/wood, level: 5, category: kanji_basic }
- { id: jp_046, display: 金, romaji: kane/kin, meaning: money/gold, level: 5, category: kanji_basic }
- { id: jp_047, display: 土, romaji: tsuchi/do, meaning: earth/soil, level: 5, category: kanji_basic }
- { id: jp_048, display: 山, romaji: yama/san, meaning: mountain, level: 5, category: kanji_basic }
- { id: jp_049, display: 川, romaji: kawa/sen, meaning: river, level: 5, category: kanji_basic }
- { id: jp_050, display: 田, romaji: ta/da, meaning: rice field, level: 5, category: kanji_basic }
- { id: jp_051, display: 学校, romaji: gakkou, meaning: school, level: 5, category: place }
- { id: jp_052, display: 教室, romaji: kyoushitsu, meaning: classroom, level: 5, category: place }
- { id: jp_053, display: 先生, romaji: sensei, meaning: teacher, level: 5, category: person }
- { id: jp_054, display: 生徒, romaji: seito, meaning: student, level: 5, category: person }
- { id: jp_055, display: 友達, romaji: tomodachi, meaning: friend, level: 5, category: person }
```

## 촉음/요음 예시

```yaml
- { id: jp_060, display: 学校, romaji: gakkou, meaning: school, level: 5, category: place }
- { id: jp_061, display: 雑誌, romaji: zasshi, meaning: magazine, level: 4, category: object }
- { id: jp_062, display: 切手, romaji: kitte, meaning: stamp, level: 4, category: object }
- { id: jp_063, display: 写真, romaji: shashin, meaning: photograph, level: 5, category: object }
- { id: jp_064, display: 今日, romaji: kyou, meaning: today, level: 5, category: time }
- { id: jp_065, display: 昨日, romaji: kinou, meaning: yesterday, level: 5, category: time }
- { id: jp_066, display: 来年, romaji: rainen, meaning: next year, level: 5, category: time }
- { id: jp_067, display: 東京, romaji: toukyou, meaning: Tokyo, level: 5, category: place }
- { id: jp_068, display: 大阪, romaji: oosaka, meaning: Osaka, level: 5, category: place }
- { id: jp_069, display: 京都, romaji: kyouto, meaning: Kyoto, level: 5, category: place }
```

## Level 4~1 (JLPT N4~N1)

(추가 예정 — Phase 6)

## 문장 (Sentences)

```yaml
- { id: jps_001, display: こんにちは、元気ですか?, romaji: konnichiwagenkidesuka, meaning: "Hello, how are you?", level: 5, category: greeting }
- { id: jps_002, display: ありがとうございます, romaji: arigatougozaimasu, meaning: "Thank you very much", level: 5, category: greeting }
- { id: jps_003, display: おはようございます, romaji: ohayougozaimasu, meaning: "Good morning (polite)", level: 5, category: greeting }
```

## 旅行 (Travel) — Level 5

> **출처**: [[travel-basics-jp]], [[travel]] (JLPT N5-N4)

### 空港・ホテル・観光

```yaml
- { id: jp_t_001, display: 空港, romaji: kuukou, meaning: 공항, level: 5, category: travel }
- { id: jp_t_002, display: 駅, romaji: eki, meaning: 역, level: 5, category: travel }
- { id: jp_t_003, display: 切符, romaji: kippu, meaning: 표, level: 5, category: travel }
- { id: jp_t_004, display: 予約, romaji: yoyaku, meaning: 예약, level: 5, category: travel }
- { id: jp_t_005, display: 地図, romaji: chizu, meaning: 지도, level: 5, category: travel }
- { id: jp_t_006, display: 荷物, romaji: nimotsu, meaning: 짐, level: 5, category: travel }
- { id: jp_t_007, display: 切符売り場, romaji: kippu uriba, meaning: 매표소, level: 5, category: travel }
- { id: jp_t_008, display: 出口, romaji: deguchi, meaning: 출구, level: 5, category: travel }
- { id: jp_t_009, display: 入口, romaji: iriguchi, meaning: 입구, level: 5, category: travel }
- { id: jp_t_010, display: 改札, romaji: kaisatsu, meaning: 개찰구, level: 5, category: travel }
- { id: jp_t_011, display: 観光, romaji: kankou, meaning: 관광, level: 5, category: travel }
- { id: jp_t_012, display: 博物館, romaji: hakubutsukan, meaning: 박물관, level: 5, category: travel }
- { id: jp_t_013, display: 神社, romaji: jinja, meaning: 신사, level: 5, category: travel }
- { id: jp_t_014, display: 寺, romaji: tera, meaning: 절, level: 5, category: travel }
- { id: jp_t_015, display: 城, romaji: shiro, meaning: 성, level: 5, category: travel }
- { id: jp_t_016, display: 公園, romaji: kouen, meaning: 공원, level: 5, category: travel }
- { id: jp_t_017, display: ホテル, romaji: hoteru, meaning: 호텔, level: 5, category: travel }
- { id: jp_t_018, display: 部屋, romaji: heya, meaning: 방, level: 5, category: travel }
- { id: jp_t_019, display: 注文, romaji: chuumon, meaning: 주문, level: 5, category: travel }
- { id: jp_t_020, display: 電車, romaji: densha, meaning: 전철, level: 5, category: travel }
- { id: jp_t_021, display: 地下鉄, romaji: chikatetsu, meaning: 지하철, level: 5, category: travel }
- { id: jp_t_022, display: バス, romaji: basu, meaning: 버스, level: 5, category: travel }
- { id: jp_t_023, display: タクシー, romaji: takushii, meaning: 택시, level: 5, category: travel }
- { id: jp_t_024, display: 新幹線, romaji: shinkansen, meaning: 신칸센, level: 5, category: travel }
- { id: jp_t_025, display: 山, romaji: yama, meaning: 산, level: 5, category: travel }
- { id: jp_t_026, display: 海, romaji: umi, meaning: 바다, level: 5, category: travel }
```

### 旅行フレーズ (Travel Phrases) — Level 5

```yaml
- id: jp_t_s_001
  display: すみません、駅はどこですか?
  romaji: sumimaseneki-wadodesuka
  meaning: 실례합니다, 역은 어디에 있나요?
  level: 5
  category: travel
  source: [[travel]]

- id: jp_t_s_002
  display: いくらですか?
  romaji: ikuradesuka
  meaning: 얼마예요?
  level: 5
  category: travel
  source: [[travel]]

- id: jp_t_s_003
  display: トイレはどこですか?
  romaji: toire-wadodesuka
  meaning: 화장실 어디예요?
  level: 5
  category: travel
  source: [[travel]]

- id: jp_t_s_004
  display: 助けてください
  romaji: tasetekudasai
  meaning: 도와주세요
  level: 5
  category: travel
  source: [[travel]]

- id: jp_t_s_005
  display: ありがとうございます
  romaji: arigatougozaimasu
  meaning: 감사합니다
  level: 5
  category: travel
  source: [[travel]]
```

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
- kanji_basic (기본 한자)
- travel (여행)

## 확장 계획 (Phase 6)

- [ ] N5 단어 200개 (현재 ~70)
- [ ] N4~N1 단어 각 150개
- [ ] 일상 회화 문장 50개
- [ ] 뉴스 문장 30개
- [ ] 한자 다의어 처리 (예: `今日` = きょう / こんにち)

## 다음 단계

- JSON 변환: `prototype/src/data/jp_words.json`
- romaji 매핑 검증 (n, 촉음, 요음)
- 한자 다의어 표기 통일