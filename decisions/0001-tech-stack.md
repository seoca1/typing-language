# 0001 - Tech Stack: TypeScript + React + Canvas + Vite

## 상태

Accepted (2026-06-18, 사용자 결정)

## 컨텍스트

외국어 타자 게임을 만들기 위한 기술 스택 결정. 다음 요건 충족 필요:

1. **타입 안정성**: 언어별 입력 로직이 복잡 → 타입 시스템 필수
2. **빠른 개발 사이클**: LLM/사용자 협업 → 빠른 빌드/리로드 필요
3. **키보드 이벤트 처리**: IME, composition events 정확히 처리
4. **렌더링 자유도**: 격파 시각 효과 → Canvas 또는 WebGL 가능성
5. **테스트 용이성**: 입력 핸들러 등 핵심 로직 단위 테스트
6. **배포 단순성**: 웹 우선 → 별도 설치 없이 URL로 플레이

## 옵션 비교

| 옵션 | 장점 | 단점 | 비고 |
| --- | --- | --- | --- |
| **TypeScript + React + Canvas + Vite** | 타입 안전, 빠른 HMR, 풍부한 생태계, IME 호환, 브라우저 즉시 실행 | React 오버헤드, Canvas는 직접 제어 | **선택됨** |
| Vanilla TS + Canvas + Vite | 가장 가벼움, 빠른 부팅 | UI 컴포넌트 직접 작성, 상태 관리 보일러플레이트 | |
| TypeScript + Phaser | 게임 엔진 강력, 적/충돌 처리 내장 | 외부 의존성, IME 이벤트 처리 한계, 학습 곡선 | |
| TypeScript + PixiJS (WebGL) | 고성능 렌더링 | 격파 게임에 과한 기능, IME 처리 추가 작업 | |
| Python + Pygame | 빠른 프로토타이핑 | 웹 배포 불가, 별도 설치 필요 | |

## 결정

**TypeScript + React + Canvas + Vite**

## 이유

1. **타입 안정성**: 입력 핸들러, 코퍼스, 미션 정의가 복잡 → TypeScript 필수
2. **Vite HMR**: LLM 협업 중 빠른 피드백 루프
3. **React**: UI 컴포넌트화, 메뉴/결과 화면에 적합
4. **Canvas**: 격파 시각 효과 자유도 (필요시 WebGL 업그레이드 가능)
5. **웹 우선**: URL만으로 플레이 가능, 별도 설치 불필요
6. **생태계**: Vitest, ESLint, Prettier 모두 잘 지원

## 결과 / 영향

### 긍정적
- 빠른 개발 시작 가능
- 타입 시스템으로 입력 핸들러 버그 조기 발견
- 브라우저만 있으면 어디서나 플레이

### 부정적 / 트레이드오프
- React 오버헤드: 메뉴 UI에만 영향 (게임 자체는 Canvas)
- Canvas 직접 제어: 적은 양이지만 보일러플레이트

### 제약
- Canvas 접근성: 키보드만 지원 (마우스 보조는 Phase 7+)
- 브라우저 의존: 모바일 터치 키보드는 Phase 7+

## 열린 질문

- [ ] Canvas 2D vs WebGL (성능은 Phase 5에서 결정)
- [ ] React + Canvas 통합 패턴 (ref로 캔버스 접근)
- [ ] 사운드 처리 (Web Audio API 별도 모듈)

## 다음 단계

- `design/systems/input-handler.md` 구현
- `prototype/` 에 Vite 스켈레톤 (Phase 3)
- ADR-0004 (렌더링), ADR-0005 (상태 관리) 등 후속 결정