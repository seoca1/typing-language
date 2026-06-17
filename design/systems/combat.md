# System: Combat (격파 시스템)

> Pillar 2 (격파의 쾌감) 의 핵심. 단어/문장은 적이다.

## 책임

1. 적(단어/문장) 생성
2. 플레이어 진행도 추적
3. 적 HP 및 처치 판정
4. 시각/청각 피드백
5. 점수/콤보 계산

## 기본 모델

### 적의 속성

```typescript
interface Enemy {
  id: string;             // 고유 ID
  target: Target;         // 단어/문장
  hp: number;             // 현재 HP (글자 수에 비례)
  maxHp: number;          // 최대 HP
  category?: string;      // 테마/카테고리
  difficulty?: number;    // 1~5
}
```

### HP 모델

| 적 종류 | HP 공식 |
| --- | --- |
| 단어 | `length` (글자 수) |
| 짧은 문장 (< 30 글자) | `length` |
| 긴 문장 (≥ 30 글자) | `length * 0.5` (난이도 완화) |

오타 1개 = -10% 진행도 (즉, HP 회복 또는 데미지 무효).

### 진행도

```
진행도 = (정확 입력 글자 수) / (전체 글자 수)
타이핑 완료 = 100% → 처치
```

### 처치 판정

```typescript
function isDefeated(enemy: Enemy, buffer: string): boolean {
  return buffer === enemy.target.text;
}
```

## 적 생성

### 출처

- `raw/{lang}_words.md` — 정적 코퍼스
- `design/systems/stage.md` 의 스테이지 정의에서 참조

### 생성 규칙

```typescript
function generateEnemy(
  corpus: WordEntry[],
  stage: StageConfig,
): Enemy {
  const candidates = corpus.filter(
    (w) => w.level >= stage.minLevel && w.level <= stage.maxLevel,
  );
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return {
    id: `enemy_${Date.now()}_${Math.random()}`,
    target: { text: chosen.display, ...chosen },
    hp: chosen.display.length,
    maxHp: chosen.display.length,
    category: chosen.category,
    difficulty: chosen.level,
  };
}
```

### 등장 패턴

- **단일**: 화면에 한 적만
- **다중**: 화면에 여러 적이 동시에 등장, 가장 위/아래부터 처치
- **보스**: 긴 문장, HP 2~3배, 처치 시 특별 보상

Phase 4 (Vertical Slice) 에서는 **단일** 모드만 구현. 다중/보스는 Phase 5~.

## 플레이어 진행

### 입력 → 진행도 변환

```typescript
function getProgress(enemy: Enemy, buffer: string): number {
  if (enemy.maxHp === 0) return 1;
  return Math.min(1, buffer.length / enemy.maxHp);
}
```

### 정확도 추적

- 매 키 입력마다 버퍼와 타겟의 prefix 비교
- 불일치 발생 시 오타 카운트
- 정확도 = `(정확 입력) / (전체 입력) × 100`

### 시각 피드백

| 상태 | 시각 표시 |
| --- | --- |
| 정확 입력 | 초록색 / 정상 색 |
| 오타 | 빨간색 / 깜빡임 |
| 진행 중 | 타겟 단어에 입력된 부분 색상 강조 |
| 처치 | 폭발/파티클/사운드 |

### 청각 피드백 (Phase 7)

- 키 입력음 (선택)
- 처치음
- 콤보음 (콤보 5+)

## 점수 시스템

### 단일 적 점수

```typescript
function calculateEnemyScore(enemy: Enemy, accuracy: number, timeMs: number): number {
  const baseScore = enemy.maxHp * 10;
  const accuracyMultiplier = accuracy / 100;
  const timeBonus = Math.max(0, 30000 - timeMs) / 1000;  // 30초 미만 보너스
  return Math.floor(baseScore * accuracyMultiplier + timeBonus * 5);
}
```

### 콤보 보너스

```typescript
const COMBO_BONUS = [0, 0, 5, 10, 20, 30, 50, 80, 100]; // 콤보 인덱스별 보너스%
```

콤보 10 이상: 보너스 100% (점수 2배).

### 미션 점수 (선택)

- 미션 클리어 시 추가 보너스 (스테이지 점수의 50%)

## 화면 표시

### 적 표시

```
┌─────────────────────┐
│ こんにちは           │  ← 타겟 (display)
│ konnichiwa          │  ← romaji 힌트 (JP 한정, 옵션)
│ ████████░░░░░░ 60%   │  ← 진행도 바
└─────────────────────┘
```

### 입력 표시

```
[k] [o] [n] [n] [_] [_] [_] [_] [_]  ← 입력 버퍼
```

각 글자가 정확/오류 색상으로 표시.

### HUD

```
┌────────────────────────────────────────┐
│ LV 5 | WPM 32 | ACC 95% | COMBO 7 | 1:23 │
└────────────────────────────────────────┘
```

## 스테이지 진행과의 통합

- `design/systems/stage.md` 참조
- 스테이지의 적 리스트/순서를 따라 진행
- 미션 조건은 `design/systems/mission.md` 참조

## 미해결 질문

- [ ] 다중 적 동시 등장 vs 단일 적 — UX 테스트 필요
- [ ] HP 시스템의 오타 데미지 정책 (현재: 진행도 무효 / 옵션: 적 HP 회복)
- [ ] 콤보 한계 (무한 vs 상한)
- [ ] 시간 보너스의 적절한 기준 시간
- [ ] 보스 적의 형태 (긴 문장 vs 특별 메카닉)

## 다음 단계

- 스테이지 시스템: `design/systems/stage.md`
- 미션 시스템: `design/systems/mission.md`
- 구현: `prototype/src/combat/`
- 테스트: `testcases/combat.md`