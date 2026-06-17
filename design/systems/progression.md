# System: Progression (메타 진행)

> Pillar 5 (메타 진행의 점진성) 의 핵심. 매 세션의 성장감.

## 책임

1. 플레이어 레벨/통계 추적
2. 스테이지/언어/테마 해금
3. 세이브/로드

## 진행 모델

### 레벨

```typescript
interface PlayerProgress {
  level: number;            // 1, 2, 3, ...
  totalScore: number;       // 누적 점수
  stats: {
    totalEnemiesDefeated: number;
    totalStagesCleared: number;
    totalPlayTimeMs: number;
    bestWpm: Record<Language, number>;
    avgAccuracy: Record<Language, number>;
  };
  unlockedStages: string[]; // 해금된 스테이지 ID
  unlockedThemes: string[]; // 해금된 테마 ID
  achievements: string[];    // 해금된 도전 ID
}
```

### 레벨업 공식

```typescript
function levelFromScore(totalScore: number): number {
  // 간단한 선형: 1000점당 1레벨
  return Math.floor(totalScore / 1000) + 1;
}
```

Phase 5에서 조정.

## 해금 시스템

### 스테이지 해금

```typescript
const STAGE_UNLOCK_REQUIREMENTS = {
  en_easy_1: 0,          // 기본 해금
  en_easy_2: 0,
  en_med_1: 500,         // 500점 필요
  en_med_2: 1000,
  en_hard_1: 2000,
  en_hard_2: 3000,
  // JP/ES 동일 패턴
};
```

- 모든 언어의 easy 스테이지는 시작 시 해금
- medium 이상은 누적 점수 게이트
- **하드 게이트 없음**: 학습 의지 있는 사용자는 빠르게 해금 가능

### 테마 해금

- 기본 1~2개 (free)
- 추가 테마는 누적 점수 또는 도전 미션 클리어

### 도전 (Achievement)

- "EN WPM 50 달성"
- "JP 미션 100개 클리어"
- "ES 액센트 100% 정확도"
- "콤보 50"
- 등

## 세이브

### 저장소

- **Phase 4~6**: 메모리 (새로고침 시 초기화)
- **Phase 7**: localStorage 또는 IndexedDB

### 저장 단위

```typescript
interface SaveData {
  version: string;          // 스키마 버전
  createdAt: number;
  updatedAt: number;
  player: PlayerProgress;
}
```

### 로드

- 페이지 로드 시 localStorage에서 복원
- 버전 다르면 마이그레이션 또는 새 게임

## 통계

### 누적 통계

- 총 처치 수
- 총 스테이지 클리어 수
- 총 플레이 시간
- 언어별 최고 WPM
- 언어별 평균 정확도

### 표시

- 메인 메뉴 → 통계 화면
- 언어/난이도별 필터

## 메타 진행의 균형

### 너무 강하면 (비추천)

- 신규 플레이어가 첫 세션에서 좌절
- 학습 곡선이 메타 진행에 가려짐

### 너무 약하면 (비추천)

- 리플레이 가치 부족
- "왜 다시 플레이하지?" 동기 부족

### 균형점 (현재)

- 첫 세션: 모든 언어 easy 스테이지 플레이 가능
- 1시간 플레이: medium 일부 해금
- 3시간 플레이: 모든 기본 스테이지 해금
- 그 이후: 도전/테마/추가 콘텐츠

## 도전 미션 (선택적 메타 진행)

### 정의

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (progress: PlayerProgress) => boolean;
  reward?: string;          // 테마 ID 등
}
```

### 예시

| ID | 이름 | 조건 | 보상 |
| --- | --- | --- | --- |
| first_blood | 첫 처치 | totalEnemiesDefeated >= 1 | - |
| speed_demon | 속도의 광인 | bestWpm.en >= 60 | 테마: 네온 |
| jp_master | 일본어 마스터 | jp 미션 100개 클리어 | 테마: 사쿠라 |
| es_perfectionist | 스페인어 완벽주의자 | ES 정확도 100% 50회 | 테마: 알함브라 |
| combo_king | 콤보 왕 | 콤보 50 달성 | - |

## 미해결 질문

- [ ] 레벨업 공식 (선형 vs 지수)
- [ ] 해금 게이트의 정확한 점수 (플레이 테스트 필요)
- [ ] 도전 미션의 우선순위 카탈로그
- [ ] PvP/리더보드 (현재 비목표)

## 다음 단계

- 구현: `prototype/src/progression/`
- 세이브 시스템: Phase 7에서 확정
- 테스트: `testcases/progression.md`