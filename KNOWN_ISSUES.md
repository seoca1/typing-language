# 🐛 알려진 이슈 (Known Issues)

게임의 알려진 버그와 문제점을 추적하는 문서입니다.

**최종 업데이트:** 2026-06-23

---

## 🔴 Critical Issues (치명적)

### Issue #1: 게임 중단 후 재시작 시 빈 화면

**상태:** 🔴 Open (조사 중)  
**우선순위:** Critical  
**발견일:** 2026-06-18  
**마지막 확인:** 2026-06-23

#### **증상:**
게임 여러 번 왕복 후 새 스테이지 시작 시 빈 화면 표시

#### **조사 내용:**
- GameScreen.tsx가 실제로 존재하지 않음 (StageScreen.tsx로 대체됨)
- Renderer는 stage phase 진입 시 매번 새로 생성됨
- Canvas는 StageScreen이 관리하고 App.tsx에 ref로 전달
- render() 호출을 try-catch로 감싸 오류 시 콘솔 로그 추가

#### **가능한 원인:**
- Canvas element가 DOM에서 분리 후 재연결 시 context 무효화
- StageScreen mount/unmount 주기에 따른 ref 불일치

#### **관련 파일:**
- `src/ui/StageScreen.tsx` - Canvas 렌더링 컴포넌트
- `src/engine/Renderer.ts` - 렌더링 루프
- `src/App.tsx` - 컴포넌트 마운팅, render 호출

---

## 🟡 Medium Issues (중간)

### Issue #3: Spin 효과 부자연스러움

**상태:** ✅ Improved  
**우선순위:** Medium  
**발견일:** 2026-06-18  
**수정일:** 2026-06-23

#### **수정 내용:**
기존 sin 기반 scaleX에서 0이 되는 지점에서 이미지가 사라지는 문제 수정:
- scaleX가 0에 가까워지면 최소값(±0.15) 유지하여 이미지가 사라지지 않도록
- bounce 효과 개선: 이미지 좌우 뒤집림과 동시에上下 movement 추가

#### **미해결 부분:**
아직 여러 프레임 이미지 미지원 (향후 이미지 생성 시 대응 가능)

---

### Issue #4: 설정 버튼 - Native Language 저장 안됨

**상태:** ✅ Partial Fix (Menu.tsx 다국어화 완료)  
**우선순위:** Medium  
**발견일:** 2026-06-23  
**수정일:** 2026-06-23

#### **수정 내용:**
Menu.tsx에 `getNativeLanguage()` 및 `t()` 적용:
- `{n}개 스테이지` → `{n} {t('stages', nativeLanguage)}`
- `캐릭터 선택` → `t('selectCharacter', nativeLanguage)`
- `최고: {n}점` → `{t('bestScore', nativeLanguage)}: {n} {t('points', nativeLanguage)}`
- `시작 단계 — 바로 플레이할 수 있어요` → `t('startingStageReady', nativeLanguage)`

#### **미해결 부분:**
localStorage 자체의 문제는 없음 (테스트 통과 확인). 다만 localStorage 사용 불가 환경에서는 memory fallback만 사용.

#### **관련 파일:**
- `src/ui/SettingsScreen.tsx` - 설정 화면
- `src/ui/Menu.tsx` - 다국어화 완료
- `src/data/nativeLanguage.ts` - localStorage 영속성 (정상 동작)

---

### Issue #5: 캐릭터 이미지 — 선택화면可见但游戏画面不可见

**상태:** ✅ Fixed (pending GitHub Pages deploy verification)
**우선순위:** Critical
**발견일:** 2026-06-23
**수정일:** 2026-06-23
**커밋:** 7e517ad, d8709cd

#### **증상:**
- 캐릭터 선택화면: 이미지 정상 표시
- 게임 화면(Canvas): 이미지가 안보임
- Console 오류: `GET /typing-language/typing-language/characters/... 404`

#### **근본 원인:**
`ImageLoader.ts` URL construction 중복 prefix 문제:
1. `pathname.startsWith('/typing-language/')` — trailing slash 없을 때 실패
2. `config.src`가 이미 `/typing-language/` prefix 포함 → base 재부여로 이중 prefix

#### **해결책:**
```typescript
// Before: base doubling
const base = pathname.startsWith('/typing-language/') ? '/typing-language/' : '/';
const cleanSrc = config.src.startsWith('/') ? config.src.slice(1) : config.src;
finalUrl = base + cleanSrc;  // → /typing-language/typing-language/...

// After: prevent double prefix
const base = pathname.startsWith('/typing-language') ? '/typing-language/' : '/';
finalUrl = config.src.startsWith(base) ? config.src : base + config.src;
```

#### **관련 파일:**
- `prototype/src/sprites/ImageLoader.ts`

---

## 📊 이슈 통계

**현재 상태:**
- 🔴 Critical: 1개 (빈 화면 - 미확인)
- 🟡 Medium: 2개 (spin 효과, 설정 저장)
- ✅ Fixed: 2개

**해결률:** 50% (2/4)

---

**마지막 업데이트:** 2026-06-23
