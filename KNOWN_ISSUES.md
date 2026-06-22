# 🐛 알려진 이슈 (Known Issues)

게임의 알려진 버그와 문제점을 추적하는 문서입니다.

---

## 🔴 Critical Issues (치명적)

### Issue #1: 게임 중단 후 재시작 시 빈 화면

**상태:** 🔴 Open (재현 확인!)  
**우선순위:** Critical  
**발견일:** 2024-06-18  
**재현 확인:** 2024-06-18

#### **증상:**
게임 여러 번 왕복 후 새 스테이지 시작 시 빈 화면 표시

#### **테스트 결과 (2024-06-18):**
```
✅ 재현 성공!
- 4번째 재시작 시도 시 빈 화면 발생
- 콘솔 로그는 정상:
  [GameReducer] BACK_TO_MENU: Resetting game state
  [GameReducer] New phase: menu
  [GameReducer] START_STAGE: Starting new stage
  [GameReducer] Stage: en_1_3 en
  [GameReducer] Enemy: pen
- 상태는 정상 전환되지만 화면 렌더링 안 됨
```

#### **재현 패턴:**
```
1. en_1_3 (apple) → BACK_TO_MENU → menu
2. en_1_2 (blue) → BACK_TO_MENU → menu  
3. en_1_3 (pen) → BACK_TO_MENU → menu
4. 다음 스테이지 시작 → ❌ 빈 화면
```

#### **예상 원인:**
- [x] 게임 상태(Redux)는 정상 - 로그 확인됨
- [ ] 렌더링 컴포넌트(GameScreen)가 마운트 안 됨
- [ ] Canvas 초기화 실패
- [ ] 애니메이션 루프가 시작 안 됨
- [ ] useEffect cleanup 이슈

#### **관련 파일:**
- `src/ui/GameScreen.tsx` - 렌더링 컴포넌트 (가장 의심)
- `src/engine/Renderer.ts` - 렌더링 루프
- `src/App.tsx` - 컴포넌트 마운팅

#### **다음 단계:**
1. GameScreen의 useEffect 확인
2. Canvas ref가 유지되는지 확인
3. 애니메이션 루프 cleanup 확인
4. 컴포넌트 key 추가로 강제 리마운트

---

## 🟡 Medium Issues (중간)

### Issue #3: Spin 효과 부자연스러움

**상태:** 🟡 Open  
**우선순위:** Medium  
**발견일:** 2024-06-18

#### **증상:**
이미지를 회전시키면 캐릭터가 스핀하는 것처럼 안 보임
- 현재: 이미지 자체가 회전 (2D 평면 회전)
- 기대: 캐릭터가 빙글빙글 도는 느낌

#### **해결 방안:**
1. 회전 대신 scale x 변화로 좌우 뒤집기
2. 여러 프레임 이미지 사용 (추후)
3. 파티클 효과 추가

---

## ✅ Fixed Issues (해결됨)

### Issue #2: 캐릭터 테스트 화면 - 이미지 위치 문제

**상태:** ✅ Fixed  
**발견일:** 2024-06-18  
**해결일:** 2024-06-18

#### **해결책:**
캐릭터 위치를 65%로 조정
```typescript
cy = canvas.height * 0.65
```

---

## 🟡 Medium Issues (중간)

### Issue #4: 설정 버튼 - 환경설정 저장 안됨

**상태:** 🟡 Open
**우선순위:** Medium
**발견일:** 2026-06-23

#### **증상:**
스테이지 선택 화면 우측 상단 ⚙️ 버튼 클릭 시 설정 화면이 열리나, Native Language 변경이 저장되지 않음

#### **예상 원인:**
- `SettingsScreen`에서 `setNativeLanguage()` 호출은 되나 localStorage 연동 미확인
- 또는 App.tsx의 `nativeLanguage` state와 `SettingsScreen`의 local state가 동기화 안됨

#### **관련 파일:**
- `src/ui/SettingsScreen.tsx` - 설정 화면
- `src/App.tsx` - 네이티브 언어 상태 관리
- `src/state/localStorage.ts` - 영속성

#### **다음 단계:**
1. `setNativeLanguage()`이 localStorage에 저장되는지 확인
2. 앱 재시작 후 언어 설정이 유지되는지 테스트
3. SettingsScreen의 local state와 App state 동기화 확인

---

## 📊 이슈 통계

**현재 상태:**
- 🔴 Critical: 1개 (빈 화면)
- 🟡 Medium: 2개 (spin 효과, 설정 저장 안됨)
- ✅ Fixed: 1개

**해결률:** 25% (1/4)

---

**마지막 업데이트:** 2026-06-23
