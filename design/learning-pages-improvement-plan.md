# 학습 페이지 개선 계획 (Learning Pages Improvement Plan)

> 작성일: 2026-06-23
> 상태: 기획 단계

---

## 1. 현황 분석 (Current State)

### 1.1 학습 페이지 흐름

```
스테이지 선택 → LearnScreen (예습) → 게임 → ResultScreen (결과) → DailyLessonModal (일일 학습)
```

### 1.2 현재 LearnScreen 문제점

| 문제 | 설명 | 우선순위 |
|------|------|----------|
| 위키 미연동 | 단어 클릭 시 위키 컨텐츠 대신 기본 테이블만 표시 | 🔴 높음 |
| TTS 제한 | 모달에서만 TTS 가능, 카드에서는 불가 | 🟡 중간 |
| 예습 효과 제한 | 단어 목록만 보여주고 실제 학습 유도 없음 | 🟡 중간 |
| 로마자 힌트 부재 | 일본어 로마자가 카드에 표시되지 않음 | 🟡 중간 |

**현재 LearnScreen 모달 내용:**
```
- display (단어)
- input (입력값)
- meaning (의미)
- level
- category
- TTS 버튼
- 기본 정보 테이블
```

### 1.3 현재 ResultScreen 문제점

| 문제 | 설명 | 우선순위 |
|------|------|----------|
| 약점 단어 부재 | 약점 단어가 ID만 표시, 의미 없음 | 🔴 높음 |
| 클릭 불가 | 약점 단어 클릭 시 아무 일도 안 일어남 | 🔴 높음 |
| 일일 학습 카드 부진 | Daily Lesson이 작고 두드러지지 않음 | 🟡 중간 |
| 복습 유도 부재 | 약점 단어 복습への 경로 없음 | 🟡 중간 |

**현재 약점 단어 표시:**
```
[en_w_042] 5 mistakes
```
바람: 클릭 → 단어 상세 (위키 컨텐츠 포함)

### 1.4 현재 DailyLessonModal 상태

| 기능 | 상태 | 비고 |
|------|------|------|
| 3단계 티어 (Quick/Standard/Deep) | ✅ | 1분/5분/10분 |
| MarkdownView + Wikilink | ✅ | 위키 컨텐츠 렌더링 |
| TTS (Deep 모드) | ✅ | 있음 |
| 학습 진행 추적 | ❌ | 없음 |
| 단어 검색/필터 | ❌ | 없음 |
| "마스터함" 표시 | ❌ | 없음 |

---

## 2. 개선 계획

### 2.1 LearnScreen 개선 (높은 우선순위)

#### 목표: 위키 컨텐츠를 예습 화면에 통합

**구현 방향:**

1. **위키 컨텐츠 모달 통합**
   - 현재: 기본 정보 테이블만 표시
   - 개선: 위키 페이지의 Definition, Pronunciation, Examples, Memory Tip 표시
   - 방법: `source` 필드로 위키 페이지 찾아서 `MarkdownView`로 렌더링

2. **TTS 카드가장화**
   - 각 단어 카드에 🔊 버튼 추가
   - Hover 시rottentip로 "발음 듣기"
   - 현재는 모달에서만 가능 → 카드에서 직접 들을 수 있게

3. **일본어 로마자 힌트**
   - 카드에 로마자 표시 (현재는 표시 안됨)
   - Hover/focus 시 전체 로마자

4. **예습 모드 토글**
   - "학습 모드": 단어 의미 먼저 보여주고 타이핑
   - "복습 모드": 의미 숨기고 타이핑

**변경 파일:**
- `src/ui/LearnScreen.tsx`
- `src/ui/VocabDetailModal.tsx` (신규)
- `src/data/wikiLookup.ts` (신규 - source → 위키 페이지 조회)

#### WikiLookup 유틸리티 설계

```typescript
// source 필드로 위키 페이지 조회
async function lookupWikiPage(source: string, language: Language): Promise<WikiPage | null>
// language별 wiki 디렉토리에서 파일 읽기
// 캐싱 고려
```

### 2.2 ResultScreen 개선 (높은 우선순위)

#### 목표: 약점 단어를 클릭 가능한 학습 도구로 전환

**구현 방향:**

1. **약점 단어 클릭 → 상세 모달**
   - 현재: `[en_w_042] 5 mistakes`
   - 개선: 클릭 → 위키 기반 단어 상세 (意味, 발음, 예문, TTS)
   - 기존 DailyLessonModal의WikilinkResolver 재사용

2. **약점 단어 의미 표시**
   - ID 옆에 의미도 표시
   - 색상으로 난이도 구분 (赤: 어려움, 緑: 보통)

3. **빠른 복습 버튼**
   - "이 단어 연습하기" → 해당 단어가 포함된 간단한 연습 시작
   - 또는 "일일 학습에서 복습" → Daily Lesson 열기

4. **Daily Lesson 카드 강조**
   - 현재보다 크고 두드러지는 UI
   - 스테이지 클리어 후 자동으로 열리도록 选项

**변경 파일:**
- `src/ui/ResultScreen.tsx`
- `src/ui/WeakWordDetailModal.tsx` (신규)

### 2.3 DailyLessonModal 개선 (중간 우선순위)

#### 목표: 학습 진행 추적 및 UX 개선

**구현 방향:**

1. **학습 진행 표시**
   - 각 단어 옆에 ✓/✗ 상태
   - "모두 완료" 카운터

2. **단어 검색/필터**
   - 학습 페이지 내에서 단어 검색
   - "아직 학습 안 한 것만" 필터

3. **"마스터함" 토글**
   - 단어별 마스터 상태 저장
   - localStorage 연동

4. **시각적 계층 개선**
   - Quick: 개요만 (설명 + 1 예문)
   - Standard: 정의 + 발음 + 예문
   - Deep: 전체 (위키 전체 컨텐츠)

**변경 파일:**
- `src/ui/DailyLessonModal.tsx`
- `src/data/lessonProgress.ts` (신규 - 학습 진행 저장)

---

## 3. 위키 → 학습 페이지 파이프라인

### 3.1 현재 파이프라인

```
Raw Source → Wiki Ingest → corpus.ts → 위키 페이지 생성
                     ↓
              corpus.ts의 source 필드
                     ↓
              LearnScreen (미연동)
```

### 3.2 목표 파이프라인

```
Raw Source → Wiki Ingest → Wiki Pages (위키 컨텐츠)
                            ↓
                     corpus.ts source 필드
                            ↓
              WikiLookup 유틸리티 (source → WikiPage)
                            ↓
              LearnScreen/ResultScreen/DailyLessonModal
```

### 3.3 WikiLookup 구현 순서

1. `src/data/wikiLookup.ts` 생성
2. EN 위키 페이지 로드 → 테스트
3. JP/ES/KR 위키 페이지 로드 → 테스트
4. 캐싱 레이어 추가 (localStorage 또는 메모이제이션)
5. LearnScreen 모달에 통합

---

## 4. 구현 우선순위 및 일정

### Phase 1: LearnScreen + Wiki 연동 (1-2일)
1. WikiLookup 유틸리티 기본 구현 (EN만)
2. LearnScreen 모달 → Wiki 컨텐츠 표시
3. TTS 카드 버튼
4. 테스트

### Phase 2: ResultScreen 약점 단어 개선 (1일)
1. 약점 단어 클릭 → 상세 모달
2. 의미 표시
3. 빠른 복습 버튼

### Phase 3: DailyLessonModal 개선 (1일)
1. 학습 진행 추적
2. 검색/필터
3. 마스터함 토글

### Phase 4: 전체 언어 지원 (1일)
1. JP/ES/KR WikiLookup
2. 다국어 테스트

---

## 5. 검증 계획

### 5.1 WikiLookup 테스트
```
1. food-vocabulary 주제 위키 페이지 로드
2. corpus.ts EN food entries의 source로 위키 페이지 조회
3. 조회한 컨텐츠 LearnScreen 모달에 렌더링
4. TTS 동작 확인
```

### 5.2 LearnScreen 개선 테스트
```
1. EN/JP/ES/KR 각 언어LearnScreen 열기
2. 단어 카드 클릭 → 위키 컨텐츠 모달 표시
3. TTS 버튼 동작 확인
4. 일본어 로마자 힌트 표시 확인
```

### 5.3 ResultScreen 개선 테스트
```
1. 스테이지 플레이 → 결과 화면
2. 약점 단어 클릭 → 상세 모달
3. "이 단어 연습하기" → 해당 단어 포함된 연습 시작
```

---

## 6. 고려 사항

### 6.1 성능
- 위키 페이지 로드 시 비동기 처리 필요
-localStorage 캐싱으로 반복 조회 최적화
- 지연 로딩 (페이지 요청 시에만 로드)

### 6.2 다국어
- EN 위키: 상당 부분 구축됨 ✓
- JP 위키: 상당 부분 구축됨 ✓
- ES 위키: stub pages 많음 → Phase 4에서 채우기
- KR 위키: topic-level만 → 위키 페이지 추가 필요

### 6.3 사용자 경험
- 불필요한 클릭 줄이기 (바로 들을 수 있는 TTS)
- 시각적 구분 (로마자 힌트, 난이도 색상)
- 학습 진행 시각화

---

## 7. 결론

**즉시 진행:**
1. WikiLookup 유틸리티 구현 (EN만)
2. LearnScreen 모달 → 위키 컨텐츠
3. TTS 카드 버튼

**나중에 진행:**
4. ResultScreen 약점 단어 상세
5. DailyLessonModal 진행 추적
6. 전체 언어 지원

**위키 추가 필요:**
- EN/ES stub pages → 실제 컨텐츠로 채우기
- KR 위키 → 개별 단어 페이지 추가 (현재 topic-level만)
