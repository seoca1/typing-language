# 🐛 알려진 이슈 (Known Issues)

게임의 알려진 버그와 문제점을 추적하는 문서입니다.

**최종 업데이트:** 2026-06-23

---

## 🔴 Critical Issues (치명적)

### Issue #1: 게임 중단 후 재시작 시 빈 화면

**상태:** 🔴 Open (미확인)  
**우선순위:** Critical  
**발견일:** 2026-06-18  
**마지막 확인:** 2026-06-23

#### **증상:**
게임 여러 번 왕복 후 새 스테이지 시작 시 빈 화면 표시

#### **예상 원인 (미확인):**
- 게임 상태는 정상 전환되지만 화면 렌더링 안 됨
- useEffect cleanup 문제로 추정

#### **관련 파일:**
- `src/ui/GameScreen.tsx` - 렌더링 컴포넌트
- `src/engine/Renderer.ts` - 렌더링 루프
- `src/App.tsx` - 컴포넌트 마운팅

---

## 🟡 Medium Issues (중간)

### Issue #3: Spin 효과 부자연스러움

**상태:** 🟡 Open  
**우선순위:** Medium  
**발견일:** 2026-06-18

#### **증상:**
이미지를 회전시키면 캐릭터가 스핀하는 것처럼 안 보임
- 현재: 이미지 자체가 회전 (2D 평면 회전)
- 기대: 캐릭터가 빙글빙글 도는 느낌

#### **해결 방안:**
1. 회전 대신 scale x 변화로 좌우 뒤집기
2. 여러 프레임 이미지 사용 (추후)
3. 파티클 효과 추가

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

## ✅ Fixed Issues (해결됨)

### Issue #2: 캐릭터 테스트 화면 - 이미지 위치 문제

**상태:** ✅ Fixed  
**발견일:** 2026-06-18  
**해결일:** 2026-06-18

#### **해결책:**
캐릭터 위치를 65%로 조정
```typescript
cy = canvas.height * 0.65
```

---

## 📊 이슈 통계

**현재 상태:**
- 🔴 Critical: 1개 (빈 화면 - 미확인)
- 🟡 Medium: 2개 (spin 효과, 설정 저장)
- ✅ Fixed: 1개

**해결률:** 25% (1/4)

---

**마지막 업데이트:** 2026-06-23
