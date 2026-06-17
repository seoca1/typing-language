# System: Mission (미션)

> Pillar 4 (단어/문장의 이중 의미) 의 핵심. 격파 메카닉 위의 조건부 클리어.

## 책임

1. 미션 정의 (조건)
2. 진행 추적
3. 클리어/실패 판정
4. 보상

## 미션 정의

```typescript
interface MissionConfig {
  id: string;
  name: string;
  description: string;            // 플레이어 안내 ("다음 5개 단어를 정확히 입력하라")
  type: MissionType;
  params: MissionParams;
}

type MissionType =
  | 'defeat_count'              // N개 처치
  | 'accuracy_threshold'        // 정확도 X% 이상
  | 'wpm_threshold'             // WPM X 이상
  | 'category_focus'            // 특정 카테고리 N개
  | 'no_errors'                  // 오타 0개
  | 'combo_chain'                // 콤보 N 이상
  | 'time_bonus'                 // N초 이내 클리어
  | 'perfect_run';               // 모든 적 정확 입력

interface MissionParams {
  count?: number;
  threshold?: number;
  category?: string;
  // 타입별 추가 파라미터
}
```

## 기본 미션 템플릿

### 단일 미션

| 타입 | 예시 | 조건 |
| --- | --- | --- |
| `defeat_count` | "5개 단어 격파" | 적 5개 처치 |
| `accuracy_threshold` | "정확도 95% 이상" | 정확도 ≥ 95% |
| `wpm_threshold` | "WPM 30 이상" | WPM ≥ 30 |
| `category_focus` | "인사 표현 5개" | category=greeting 단어 5개 |
| `no_errors` | "오타 없이 클리어" | errors === 0 |
| `combo_chain` | "콤보 10 달성" | 콤보 ≥ 10 |
| `time_bonus` | "30초 이내" | elapsed ≤ 30000ms |
| `perfect_run` | "완벽한 런" | 모든 적 정확 입력 |

### 복합 미션 (AND/OR)

```typescript
interface CompositeMission extends MissionConfig {
  logic: 'AND' | 'OR';
  subMissions: MissionConfig[];
}
```

예: `("5개 단어 격파" AND "정확도 95% 이상")`

### 스테이지별 미션

각 스테이지에 1~3개 미션 부여. 일반적으로:
- 메인 미션 1개 (필수 클리어)
- 보너스 미션 1~2개 (추가 점수/해금)

## 진행 추적

```typescript
interface MissionProgress {
  missionId: string;
  status: 'pending' | 'cleared' | 'failed';
  current: number;        // 현재 값
  required: number;       // 목표 값
  clearedAt?: number;     // 클리어 시각 (ms timestamp)
}
```

## 미션 트리거

### 자동 트리거 (격파 메카닉 기반)

- 적이 처치될 때마다 `defeat_count`, `category_focus`, `perfect_run` 자동 갱신
- 키 입력마다 `no_errors`, `accuracy_threshold` 자동 갱신

### 시간 기반

- 스테이지 종료 시점에 `time_bonus`, `wpm_threshold`, `accuracy_threshold` 평가

### 콤보 기반

- 콤보 갱신 시 `combo_chain` 평가

## 클리어/실패

### 클리어 조건

- 메인 미션 1개 이상 클리어 → 스테이지 클리어
- 보너스 미션 클리어 → 추가 점수/해금

### 실패 조건

- 메인 미션 모두 실패 → 스테이지 실패 (재시도)
- 단, 격파 메카닉의 점수는 별도로 집계 (학습 효과)

## 보상

### 메인 미션 클리어

- 스테이지 점수의 100%

### 보너스 미션 클리어

- 스테이지 점수의 20% 추가 (각)
- 일부 보너스는 메타 진행 해금 트리거

### 미션 실패

- 스테이지 점수의 30% (격파 점수의 일부)

## 미션 표시

### HUD

```
┌───────────────────────────────────────────────┐
│ Stage 3: Saludos                              │
│ Missions:                                     │
│   [●] Saludar 5 personas           5/5   ✓   │
│   [●] Sin errores                  12/∞  ✓   │
│   [○] WPM 25+                      23       │
└───────────────────────────────────────────────┘
```

각 미션에 현재 진행도 표시.

### 결과 화면

```
┌───────────────────────────────────────────────┐
│ Stage Clear: Saludos                          │
│                                               │
│ Missions:                                     │
│   [✓] Saludar 5 personas           (clear)    │
│   [✓] Sin errores                  (clear)    │
│   [✗] WPM 25+                      23/25      │
│                                               │
│ Score: 1250                                   │
│ Time: 1:23                                    │
└───────────────────────────────────────────────┘
```

## 미션과 격파의 결합

### 격파 모드의 변형

| 변형 | 설명 |
| --- | --- |
| **순수 격파** | 미션 없음, 적 N개 처치 = 클리어 |
| **미션 + 격파** | 격파하면서 미션도 클리어 (기본) |
| **미션 전용** | 격파는 미션의 수단 (예: 카테고리 필터) |

기본값: **미션 + 격파**.

### 미션 클리어 = 스테이지 클리어

- 격파 실패가 있어도 미션을 클리어하면 스테이지 통과
- 격파만으로는 점수 미달 가능 (메타 진행 약화)

## 미해결 질문

- [ ] 보너스 미션의 가중치 (모든 미션 동일 vs 카테고리별)
- [ ] 미션 진행도의 실시간 표시 vs 종료 시점 평가
- [ ] 미션 실패 후 재시도 시 점수 처리 (실패 마커 유지? 리셋?)
- [ ] 사용자 정의 미션 (커뮤니티/PvP)

## 다음 단계

- 메타 진행: `design/systems/progression.md`
- 구현: `prototype/src/mission/`
- 테스트: `testcases/mission.md`