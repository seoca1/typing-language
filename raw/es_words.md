# Spanish Word/Sentence Corpus (Accent 처리)

> **상태**: 골격. Phase 6에서 본격 확장.
> **ADR-0003**: 액센트 직접 입력 + ASCII 폴백.

## 코퍼스 형식

```yaml
- id: es_001
  display: hola
  meaning: 안녕
  level: 1            # 1=A1, 2=A2, 3=B1, 4=B2, 5=C1/C2
  category: greeting
  accentMode: any     # 'strict' | 'loose' | 'any'
```

`accentMode`:
- `strict`: Strict 모드에서만 등장 (액센트 직접 입력 필수)
- `loose`: Loose 모드에서만 등장 (ASCII 폴백 OK)
- `any`: 두 모드 모두 등장

## Level 1 (A1, 액센트 없거나 일부)

```yaml
- { id: es_001, display: hola, meaning: 안녕, level: 1, category: greeting, accentMode: any }
- { id: es_002, display: adios, meaning: 안녕히, level: 1, category: greeting, accentMode: any }
- { id: es_003, display: gracias, meaning: 고마워, level: 1, category: greeting, accentMode: any }
- { id: es_004, display: por_favor, meaning: 부디, level: 1, category: greeting, accentMode: any }
- { id: es_005, display: si, meaning: 네, level: 1, category: basic, accentMode: any }
- { id: es_006, display: no, meaning: 아니오, level: 1, category: basic, accentMode: any }
- { id: es_007, display: uno, meaning: 하나, level: 1, category: number, accentMode: any }
- { id: es_008, display: dos, meaning: 둘, level: 1, category: number, accentMode: any }
- { id: es_009, display: tres, meaning: 셋, level: 1, category: number, accentMode: any }
- { id: es_010, display: cuatro, meaning: 넷, level: 1, category: number, accentMode: any }
- { id: es_011, display: cinco, meaning: 다섯, level: 1, category: number, accentMode: any }
- { id: es_012, display: diez, meaning: 열, level: 1, category: number, accentMode: any }
- { id: es_013, display: rojo, meaning: 빨강, level: 1, category: color, accentMode: any }
- { id: es_014, display: azul, meaning: 파랑, level: 1, category: color, accentMode: any }
- { id: es_015, display: verde, meaning: 초록, level: 1, category: color, accentMode: any }
- { id: es_016, display: gato, meaning: 고양이, level: 1, category: animal, accentMode: any }
- { id: es_017, display: perro, meaning: 개, level: 1, category: animal, accentMode: any }
- { id: es_018, display: libro, meaning: 책, level: 1, category: object, accentMode: any }
- { id: es_019, display: agua, meaning: 물, level: 1, category: food, accentMode: any }
- { id: es_020, display: pan, meaning: 빵, level: 1, category: food, accentMode: any }
- { id: es_021, display: hoy, meaning: 오늘, level: 1, category: time, accentMode: any }
- { id: es_022, display: manana, meaning: 내일/아침, level: 1, category: time, accentMode: any }
  # 주의: mañana (mañana) — 두 의미 모두 있음
- { id: es_023, display: madre, meaning: 어머니, level: 1, category: family, accentMode: any }
- { id: es_024, display: padre, meaning: 아버지, level: 1, category: family, accentMode: any }
```

## Level 1 — 액센트 단어 (기본)

```yaml
- { id: es_030, display: nino, meaning: 아이 (남아), level: 1, category: family, accentMode: loose }
  # ñ 직접 또는 n 폴백
- { id: es_031, display: senor, meaning: 신사, level: 1, category: person, accentMode: loose }
  # ñ 직접 또는 n 폴백
- { id: es_032, display: anio, meaning: 해/년, level: 1, category: time, accentMode: loose }
  # ñ 폴백
- { id: es_033, display: maniana, meaning: 내일/아침, level: 1, category: time, accentMode: loose }
- { id: es_034, display: espana, meaning: 스페인, level: 1, category: place, accentMode: loose }
```

## Level 2 (A2) — 액센트 단어 증가

```yaml
- { id: es_040, display: rapido, meaning: 빠른, level: 2, category: adjective, accentMode: any }
- { id: es_041, display: facil, meaning: 쉬운, level: 2, category: adjective, accentMode: any }
- { id: es_042, display: dificil, meaning: 어려운, level: 2, category: adjective, accentMode: any }
- { id: es_043, display: telefono, meaning: 전화, level: 2, category: object, accentMode: any }
- { id: es_044, display: restaurante, meaning: 식당, level: 2, category: place, accentMode: any }
- { id: es_045, display: hospital, meaning: 병원, level: 2, category: place, accentMode: any }
- { id: es_046, display: importante, meaning: 중요한, level: 2, category: adjective, accentMode: any }
- { id: es_047, display: despues, meaning: 그 후, level: 2, category: time, accentMode: any }
  # 부사형: después — é
- { id: es_048, display: ademas, meaning: 게다가, level: 2, category: basic, accentMode: any }
  # además — á
```

## Level 3~5 (B1~C2)

(추가 예정 — Phase 6)

## 문장 (Sentences)

```yaml
- { id: ess_001, display: Hola, ¿cómo estás?, meaning: "안녕, 어떻게 지내?", level: 1, category: greeting, accentMode: any }
  # ¿ → ¿ or ?
- { id: ess_002, display: Buenos días, ¿qué tal?, meaning: "좋은 아침, 어때?", level: 1, category: greeting, accentMode: any }
- { id: ess_003, display: ¿Dónde está el baño?, meaning: "화장실 어디예요?", level: 1, category: question, accentMode: any }
- { id: ess_004, display: Me gustaría un café., meaning: "커피 한 잔 주세요.", level: 2, category: restaurant, accentMode: any }
- { id: ess_005, display: Muchísimas gracias., meaning: "정말정말 고마워요.", level: 1, category: greeting, accentMode: any }
```

## 액센트 단어 일람 (참고)

자주 사용되는 액센트 단어:

| 단어 | 폴백 |
| --- | --- |
| año (년) | anio |
| niño (아이) | nino |
| señor (신사) | senor |
| España (스페인) | espana |
| mañana (내일/아침) | maniana |
| después (그 후) | despues |
| además (게다가) | ademas |
| México (멕시코) | mexico |
| árbol (나무) | arbol |
| inglés (영어) | ingles |
| francés (프랑스어) | frances |
| alemán (독일어) | aleman |
| japonés (일본어) | japones |

## 카테고리

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
- person (사람)
- adjective (형용사)
- question (질문)

## 확장 계획 (Phase 6)

- [ ] A1 단어 100개 (현재 ~35)
- [ ] A2~C2 단어 각 150개
- [ ] 액센트 단어 카탈로그 100개
- [ ] 일상 회화 문장 50개
- [ ] 뉴스 문장 30개
- [ ] ¿/¡ 처리 정책 확정

## 다음 단계

- JSON 변환: `prototype/src/data/es_words.json`
- 액센트 검증 (display 정규화)
- Loose 모드 정규화 함수 검증