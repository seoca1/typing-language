# Glossary - Game Terms

게임 내에서 사용되는 용어 정의. 디자인/코드/UI 일관성 유지.

## 입력 관련

| 용어 | 정의 | 예 |
| --- | --- | --- |
| **Target** | 화면에 표시되어 타이핑해야 할 단어/문장 | `こんにちは`, `niño`, `hello` |
| **Buffer** | 플레이어가 현재 입력 중인 텍스트 | `kon` (target: こんにちは) |
| **Composition** | IME 등에서 입력 중인 미완성 텍스트 | (주로 JP에서 의미 있음) |
| **Acceptance** | 입력이 정답으로 인정되는 조건 | 정확 일치, 부분 일치 등 |
| **Tolerance** | 오타 허용 정책 | ES의 ASCII 폴백 등 |

## 게임 진행

| 용어 | 정의 |
| --- | --- |
| **Stage** | 3~7분 단위의 한 판. 적과 미션으로 구성 |
| **Enemy** | 격파 대상인 단어/문장. HP = 글자 수 |
| **Mission** | 스테이지 내 클리어 조건 (예: "JP 명사 5개 정확히") |
| **WPM** | Words Per Minute — 분당 정확 입력 단어 수 |
| **Accuracy** | 정확 입력 비율 (0~100%) |
| **Combo** | 연속 정확 입력. 보너스 점수 |
| **Score** | 종합 점수 (WPM × Accuracy × 난이도 가중치) |

## 메타 진행

| 용어 | 정의 |
| --- | --- |
| **Level** | 누적 점수 기반 레벨 |
| **Unlock** | 새 스테이지/테마/언어 해금 |
| **Stats** | 누적 통계 (언어별, 난이도별) |

## 언어별

| 용어 | 정의 |
| --- | --- |
| **EN** | 영어 |
| **JP** | 일본어 (Japanese) |
| **ES** | 스페인어 (Spanish/Español) |
| **Romaji** | 일본어 단어를 로마자로 표기한 것 (예: `konnichiwa`) |
| **Accent Mode** | ES의 액센트 입력 정책 (Strict / Loose) |

## 모드

| 모드 | 설명 |
| --- | --- |
| **Combat / Defeat** | 단어/문장을 적으로 격파 |
| **Mission / Objective** | 조건 충족형 미션 |
| **Practice** | 자유 입력 (점수 없음, 미션 없음) |

## UI

| 용어 | 정의 |
| --- | --- |
| **HUD** | Heads-Up Display — 화면 상단 정보 (점수, HP, 시간) |
| **Field** | 적이 등장하는 메인 영역 |
| **Input Bar** | 현재 입력이 표시되는 영역 |
| **Result Screen** | 스테이지 종료 후 결과 표시 |

## 코드/설계

| 용어 | 정의 |
| --- | --- |
| **Handler** | 언어별 입력 처리 모듈 |
| **Engine** | 게임 루프, 렌더링, 입력 처리 등 코어 |
| **Corpus** | 단어/문장 데이터 모음 (raw/ 참조) |
| **Pillar** | 디자인 기둥 (pillars.md) |
| **ADR** | Architecture Decision Record (decisions/) |