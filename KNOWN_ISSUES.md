# 🐛 알려진 이슈 (Known Issues)

게임의 알려진 버그와 문제점을 추적하는 문서입니다.

**최종 업데이트:** 2026-06-24

---

## 🔴 Critical Issues (치명적)

### Issue #1: 게임 중단 후 재시작 시 빈 화면

**상태:** 🟡 Mitigated (방어 코드 추가)  
**우선순위:** Critical  
**발견일:** 2026-06-18  
**마지막 수정:** 2026-06-24

#### **증상:**
게임 여러 번 왕복 후 새 스테이지 시작 시 빈 화면 표시

#### **근본 원인:**
- StageScreen mount/unmount 주기에 canvas ref가 stale 참조가 될 수 있음
- Renderer 생성 시점의 canvas context가 unmount 후 무효화될 수 있음
- 렌더 루프에서 stale closure(`renderer` 로컬 const)를 참조하여 유효하지 않은 canvas에 렌더링 시도

#### **해결책 (2026-06-24):**

1. **App.tsx — render effect 가드 추가:**
   - `canvas.isConnected` + dimensions 0 체크로 StageScreen 미준비 상태 건너뛰기
   - 새 스테이지 시작 시 fresh Renderer 생성 보장

2. **App.tsx — tick 루프 방어:**
   - 매 프레임 `canvas.isConnected` + dimensions 체크
   - `Renderer.isCanvasValid()`로 context 유효성 검증
   - 유효하지 않으면 `Renderer.recreateFrom()`으로 컨텍스트 재생성
   - `rendererRef.current` 직접 접근으로 stale closure 방지

3. **Renderer.ts — 새 메서드:**
   - `isCanvasValid(canvas)`: canvas 연결 및 dimensions 유효성 검사
   - `recreateFrom(canvas)`: 컨텍스트 재생성 (dimensions 갱신 포함)

#### **관련 파일:**
- `src/ui/StageScreen.tsx` - Canvas 렌더링 컴포넌트
- `src/engine/Renderer.ts` - 렌더링 루프 (isCanvasValid, recreateFrom 추가)
- `src/App.tsx` - 컴포넌트 마운팅, render 호출 (방어 코드 추가)

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
- 🔴 Critical: 0개
- 🟡 Medium: 3개 (빈 화면 완화, spin 효과, 설정 저장)
- ✅ Fixed: 2개

**해결률:** 40% (2/5)

---

**마지막 업데이트:** 2026-06-24
