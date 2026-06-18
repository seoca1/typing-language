# 🐛 알려진 이슈 (Known Issues)

게임의 알려진 버그와 문제점을 추적하는 문서입니다.

---

## 🔴 Critical Issues (치명적)

### Issue #1: 게임 중단 후 재시작 불가 문제

**상태:** 🔴 Open (미해결)  
**우선순위:** Critical  
**발견일:** 2024-06-18  
**영향:** 게임 플레이 차단

#### **증상:**
1. 게임 진행 중 메뉴로 돌아가기 (ESC 또는 메뉴 버튼)
2. 새로운 게임 시작 시도
3. 게임이 시작되지 않거나 정상 작동 안 함

#### **재현 방법:**
```
1. 메인 메뉴 → 언어 선택 (예: English)
2. 스테이지 진행 (타이핑 시작)
3. 게임 중 ESC 키 또는 "메뉴" 버튼 클릭
4. 메인 메뉴로 돌아옴
5. 다시 언어 선택 → 스테이지 시작 시도
6. ❌ 게임이 시작되지 않음
```

#### **예상 원인:**
- [ ] 게임 상태(state)가 완전히 초기화되지 않음
- [ ] 이벤트 리스너가 중복 등록됨
- [ ] 타이머/애니메이션 프레임이 정리되지 않음
- [ ] 캐릭터/스테이지 상태가 리셋되지 않음
- [ ] Redux state가 불완전하게 초기화됨

#### **관련 파일:**
- `src/state/gameReducer.ts` - 게임 상태 관리
- `src/App.tsx` - 메인 컴포넌트, 게임 초기화
- `src/engine/Renderer.ts` - 렌더링 루프
- `src/ui/GameScreen.tsx` - 게임 화면 컴포넌트

#### **테스트 체크리스트:**
- [ ] 메뉴 → 게임 → 메뉴 → 게임 (2회 반복)
- [ ] 다른 언어 선택 후 재시작
- [ ] 캐릭터 테스트 → 메뉴 → 게임
- [ ] 설정 변경 → 메뉴 → 게임
- [ ] 여러 스테이지 진행 → 메뉴 → 게임

#### **디버깅 로그:**
```javascript
// App.tsx에 추가 필요
console.log('[GameRestart] Menu button clicked, current phase:', state.phase);
console.log('[GameRestart] Resetting state to menu');
console.log('[GameRestart] New game starting, phase:', state.phase);
```

#### **시도한 해결책:**
1. ❓ (아직 시도 안 함)

#### **다음 단계:**
1. 게임 상태 초기화 로직 검토
2. 이벤트 리스너 cleanup 확인
3. 애니메이션 프레임 정리 확인
4. Redux reducer의 BACK_TO_MENU 액션 검증
5. 디버깅 로그 추가하여 상태 추적

---

## 🟡 Medium Issues (중간)

### Issue #2: 캐릭터 테스트 화면 - 이미지 위치 문제

**상태:** ✅ Fixed (해결됨)  
**우선순위:** Medium  
**발견일:** 2024-06-18  
**해결일:** 2024-06-18

#### **증상:**
캐릭터 테스트 화면에서 이미지가 너무 위로 올라가서 얼굴이 상단에 가려짐

#### **해결책:**
캐릭터 위치를 화면 중앙에서 65% 위치로 하향 조정
```typescript
// Before: cy = canvas.height / 2 - 50
// After:  cy = canvas.height * 0.65
```

#### **커밋:** (이번 커밋에 포함)

---

## 🟢 Minor Issues (경미)

(현재 없음)

---

## 📋 이슈 템플릿

새로운 이슈 발견 시 아래 형식으로 추가:

```markdown
### Issue #X: [이슈 제목]

**상태:** 🔴/🟡/🟢 Open/In Progress/Fixed  
**우선순위:** Critical/High/Medium/Low  
**발견일:** YYYY-MM-DD  
**해결일:** YYYY-MM-DD (해결 시)

#### **증상:**
[문제 설명]

#### **재현 방법:**
1. [단계 1]
2. [단계 2]
3. [결과]

#### **예상 원인:**
- [ ] [가능한 원인 1]
- [ ] [가능한 원인 2]

#### **관련 파일:**
- `파일 경로` - 설명

#### **시도한 해결책:**
1. [시도 1] - 결과

#### **다음 단계:**
1. [계획 1]
2. [계획 2]
```

---

## 🔍 검증 프로세스

### **매 커밋마다 확인:**

#### 1. 게임 재시작 테스트 (Issue #1)
```bash
# 로컬 개발 서버
npm run dev

# 테스트 시나리오
1. 메인 메뉴 → English → 게임 시작
2. 몇 단어 타이핑
3. ESC 또는 메뉴 버튼
4. 메인 메뉴로 돌아옴 확인
5. English → 게임 시작 (다시)
6. ✅ 정상 작동 / ❌ 실패

# 결과 기록
- [ ] Pass (정상)
- [ ] Fail (실패) - 에러 메시지:
```

#### 2. 언어 전환 테스트
```bash
1. 메인 메뉴 → English → 게임 → 메뉴
2. 메인 메뉴 → 日本語 → 게임 → 메뉴
3. 메인 메뉴 → Español → 게임
4. ✅ 모두 정상 작동
```

#### 3. 캐릭터 테스트 왕복
```bash
1. 메인 메뉴 → 캐릭터 테스트 → 메뉴
2. 메인 메뉴 → English → 게임
3. ✅ 정상 작동
```

### **주간 회귀 테스트:**

**매주 1회 전체 시나리오 테스트:**

1. Fresh start (캐시 클리어)
2. 모든 메뉴 탐색
3. 각 언어별 게임 시작/중단
4. 설정 변경
5. 캐릭터 테스트
6. 여러 번 왕복

**체크리스트:**
- [ ] 메뉴 → 게임 → 메뉴 (각 언어)
- [ ] 여러 스테이지 진행 후 중단
- [ ] 설정 변경 후 재시작
- [ ] 캐릭터 테스트 왕복
- [ ] 장시간 플레이 (메모리 누수 확인)

---

## 📊 이슈 통계

**현재 상태:**
- 🔴 Critical: 1개 (게임 재시작 불가)
- 🟡 Medium: 0개
- 🟢 Minor: 0개
- ✅ Fixed: 1개

**해결률:** 50% (1/2)

---

## 🔧 디버깅 도구

### **브라우저 콘솔 명령어:**

```javascript
// 현재 게임 상태 확인
console.log(window.__GAME_STATE__);

// Redux state 확인 (개발 모드)
// Redux DevTools 사용 권장

// 로컬 스토리지 확인
console.log(localStorage.getItem('typing-game-progress'));

// 이벤트 리스너 개수 확인
getEventListeners(window);
```

### **로깅 추가:**

```typescript
// gameReducer.ts
case 'BACK_TO_MENU':
  console.log('[Reducer] BACK_TO_MENU action received');
  console.log('[Reducer] Current phase:', state.phase);
  // ... reset logic
  console.log('[Reducer] New phase:', 'menu');
  
case 'START_STAGE':
  console.log('[Reducer] START_STAGE action received');
  console.log('[Reducer] Stage config:', action.payload);
```

---

## 📝 이슈 업데이트 로그

### 2024-06-18
- ✅ Issue #2 해결: 캐릭터 테스트 이미지 위치 조정
- 🔴 Issue #1 등록: 게임 재시작 불가 문제 추적 시작

---

**이 문서는 지속적으로 업데이트됩니다.**
