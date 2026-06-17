# 0003 - 스페인어 액센트: 직접 입력 + ASCII 폴백

## 상태

Accepted (2026-06-18, 사용자 결정)

## 컨텍스트

스페인어는 액센트 문자(á, é, í, ó, ú, ñ, ¿, ¡)를 사용한다. OS 키보드 환경마다 액센트 입력 방식이 다르다 (US International, Mac Option, Linux Compose 등). 게임에서 어떤 정책을 취할지 결정.

**핵심 요건**:
- Pillar 1: 실제 입력 방식의 정확성
- 접근성: 액센트 입력이 어려운 환경에서도 플레이 가능
- 학습 효과: 스페인어 학습에 도움이 되어야 함

## 옵션 비교

| 옵션 | 장점 | 단점 | 비고 |
| --- | --- | --- | --- |
| **액센트 직접 입력 + ASCII 폴백** | 모든 환경에서 플레이, 학습 곡선 선택 가능 | 두 가지 정책 관리 | **선택됨** |
| 액센트만 (Strict) | 정확성 우선 | 일부 환경에서 입력 불가 | |
| ASCII만 (Loose) | 입력 단순 | 스페인어 실제 입력 학습 안 됨 | |

## 결정

**두 방식 모두 지원, 스테이지/설정에서 선택** (ADR-0003)

### Strict 모드
- `á`, `é`, `í`, `ó`, `ú`, `ñ`, `¿`, `¡` 모두 정확히 입력
- 대문자 `Ñ`, `Á` 등도 정확히 입력
- OS 키보드 IME에 의존

### Loose 모드 (ASCII 폴백)
- `a`로 `á`, `n`으로 `ñ` 등 ASCII 폴백 입력 가능
- 매칭 시 폴백 규칙 적용
- 빠른 플레이 가능

## 이유

1. **Pillar 1 충족**: Strict 모드는 실제 스페인어 입력 학습
2. **접근성**: Loose 모드는 모든 환경에서 즉시 플레이
3. **난이도 곡선**: 초급 = Loose, 중급/고급 = Strict
4. **유연성**: 사용자 설정으로 모드 선택 가능

## 결과 / 영향

### 긍정적
- 모든 OS/키보드 환경에서 플레이 가능
- 학습 단계에 따른 모드 전환 가능
- "정확성 vs 접근성" 트레이드오프 해소

### 부정적 / 트레이드오프
- 두 가지 매칭 로직 관리 (테스트 복잡)
- Loose 모드 사용자가 Strict 모드로 전환 시 학습 필요
- 폴백 규칙이 모호할 수 있음 (예: `a` → `á` or `a`?)

### 제약
- 코퍼스에 액센트 표기 필수 (Loose 모드용 폴백 규칙 별도)
- UI에 현재 모드 표시 필수
- 모드 변경 시 스테이지 재시작 가능

## 구현 메모

### 폴백 규칙 (Loose 모드)

| 타겟 | 허용 입력 |
| --- | --- |
| `á` | `á`, `a` |
| `é` | `é`, `e` |
| `í` | `í`, `i` |
| `ó` | `ó`, `o` |
| `ú` | `ú`, `u` |
| `ñ` | `ñ`, `n` |
| `Á` | `Á`, `A` |
| `Ñ` | `Ñ`, `N` |
| `¿` | `¿`, `?` (선택) |
| `¡` | `¡`, `!` (선택) |

### 매칭 알고리즘 (간소화)

```typescript
function match(target: string, buffer: string, mode: 'strict' | 'loose'): boolean {
  if (mode === 'strict') return target === buffer;
  // loose: normalize both
  return normalizeForLoose(target) === normalizeForLoose(buffer);
}

function normalizeForLoose(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // 액센트 제거
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N');
}
```

### UI 표시

- HUD에 현재 모드 표시: `[STRICT]` / `[LOOSE]`
- 액센트 글자 시각 강조 (초록색 등)

## 열린 질문

- [ ] `¿`/`¡`의 폴백 (느낌표/물음표 매핑) — 학습 효과 vs 단순성
- [ ] Loose 모드 점수 보정 (더 쉽다고 보고 가중치 조정?)
- [ ] 모드 변경 시 진행도 처리 (재시작? 계속?)

## 다음 단계

- `raw/es_words.md` 코퍼스 작성
- `wiki/languages/spanish.md` 상세 표기 규칙
- `design/systems/input-handler.md` 구현
- 테스트: `testcases/input-handler.md` > SpanishHandler