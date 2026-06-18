# 캐릭터 이미지 표시 방식 개선안

Emily 이미지가 상반신 위주(687×1024)로 하반신이 잘려있어 어색한 문제 해결 방안

---

## 🎨 옵션 1: 액자/프레임 방식 (추천!)

캐릭터 이미지를 액자나 모니터 화면처럼 프레임 안에 배치

### **장점:**
- ✅ 하반신 잘림이 자연스러움 (원래 그런 디자인처럼 보임)
- ✅ 게임 UI와 조화
- ✅ 캐릭터에 집중도 향상
- ✅ 다양한 디자인 가능 (테두리, 그림자 등)

### **구현 방법:**

```typescript
// 1. 둥근 프레임으로 감싸기
ctx.save();
ctx.beginPath();
ctx.roundRect(cx - width/2, cy - height, width, height, 20); // 둥근 모서리
ctx.clip(); // 프레임 안쪽만 그리기

// 캐릭터 그리기
ctx.drawImage(image, ...);

ctx.restore();

// 2. 프레임 테두리 그리기
ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
ctx.lineWidth = 3;
ctx.roundRect(cx - width/2, cy - height, width, height, 20);
ctx.stroke();
```

### **디자인 예시:**

- **모니터 스타일:** 전자 디스플레이처럼
- **액자 스타일:** 고급스러운 테두리
- **창문 스타일:** 게임 세계의 창
- **홀로그램 스타일:** 미래적인 디스플레이

---

## 🖼️ 옵션 2: 하단 그라데이션 페이드

이미지 하단을 서서히 투명하게 만들어 자연스럽게 페이드 아웃

### **장점:**
- ✅ 부드러운 전환
- ✅ 잘림이 의도적으로 보임
- ✅ 세련된 느낌

### **구현 방법:**

```typescript
// 이미지 그린 후 하단에 그라데이션 마스크
const gradient = ctx.createLinearGradient(
  cx, groundY - height,
  cx, groundY
);
gradient.addColorStop(0, 'rgba(10, 10, 20, 0)');    // 상단: 투명
gradient.addColorStop(0.7, 'rgba(10, 10, 20, 0)');  // 70%까지 투명
gradient.addColorStop(1, 'rgba(10, 10, 20, 1)');    // 하단: 불투명

ctx.fillStyle = gradient;
ctx.fillRect(cx - width/2, groundY - height, width, height);
```

---

## 📐 옵션 3: UI 레이어 뒤로 배치

게임 UI(타이핑 영역, 점수 등)를 캐릭터 앞에 배치하여 하단을 자연스럽게 가림

### **장점:**
- ✅ UI와 자연스러운 통합
- ✅ 깊이감 있는 레이아웃
- ✅ 공간 활용 효율적

### **구현 방법:**

```typescript
// 렌더링 순서 변경
1. 배경 렌더링
2. 캐릭터 렌더링 (하단이 UI 영역까지 확장)
3. UI 요소 렌더링 (캐릭터 위에 오버레이)

// 캐릭터를 더 아래로 배치
const characterY = canvasHeight * 0.6; // 화면의 60% 위치
// UI 하단 영역이 캐릭터 하반신을 자연스럽게 가림
```

---

## 🎭 옵션 4: 상반신 포커스 디자인

상반신만 보이는 것이 의도된 디자인임을 명확히

### **장점:**
- ✅ "Portrait Mode" 느낌
- ✅ 얼굴/표정에 집중
- ✅ VN(비주얼 노벨) 스타일

### **구현 방법:**

```typescript
// 캐릭터를 화면 상단에 배치
const portraitY = canvasHeight * 0.3;

// 배경에 비네팅 효과
const vignette = ctx.createRadialGradient(
  cx, portraitY, 0,
  cx, portraitY, canvasWidth * 0.6
);
vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');

// 캐릭터에 스포트라이트 효과
```

---

## 🔲 옵션 5: 화면 분할 레이아웃

화면을 왼쪽(캐릭터)/오른쪽(게임)으로 분할

### **장점:**
- ✅ 명확한 영역 구분
- ✅ VN 스타일 UI
- ✅ 캐릭터 크게 표시 가능

### **구현 방법:**

```typescript
// 화면 분할
const leftPanelWidth = canvasWidth * 0.3;
const rightPanelX = leftPanelWidth;

// 왼쪽: 캐릭터 영역
ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
ctx.fillRect(0, 0, leftPanelWidth, canvasHeight);

// 캐릭터를 왼쪽 패널에 배치
renderCharacter(ctx, leftPanelWidth / 2, canvasHeight);

// 오른쪽: 게임 영역
renderGameContent(ctx, rightPanelX, ...);
```

---

## 🎯 권장 방안: 옵션 1 + 옵션 3 조합

**프레임 + UI 오버레이**

### **최종 구현:**

```typescript
function renderCharacterWithFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  cx: number,
  cy: number,
  width: number,
  height: number
) {
  ctx.save();
  
  // 1. 캐릭터 배치 (약간 아래로)
  const offsetY = 50; // 하단부가 UI 영역과 겹치도록
  
  // 2. 프레임 배경 (약간 어둡게)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.roundRect(cx - width/2 - 10, cy - height + offsetY - 10, width + 20, height + 20, 15);
  ctx.fill();
  
  // 3. 클리핑 영역 (둥근 프레임)
  ctx.beginPath();
  ctx.roundRect(cx - width/2, cy - height + offsetY, width, height, 10);
  ctx.clip();
  
  // 4. 캐릭터 이미지
  ctx.drawImage(
    image,
    cx - width/2,
    cy - height + offsetY,
    width,
    height
  );
  
  ctx.restore();
  
  // 5. 프레임 테두리 (빛나는 효과)
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 217, 255, 0.5)'; // 청록색 빛
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(0, 217, 255, 0.5)';
  ctx.shadowBlur = 10;
  ctx.roundRect(cx - width/2, cy - height + offsetY, width, height, 10);
  ctx.stroke();
  ctx.restore();
}
```

### **결과:**
- ✅ 캐릭터가 프레임 안에 깔끔하게 표시
- ✅ 하반신 잘림이 자연스러움
- ✅ 사이버펑크/게임 느낌의 UI
- ✅ 타이핑 영역과 자연스럽게 조화

---

## 📊 옵션 비교

| 옵션 | 구현 난이도 | 시각적 효과 | 자연스러움 | 추천도 |
|------|-----------|-----------|----------|--------|
| 1. 프레임 | 중간 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ 추천 |
| 2. 그라데이션 | 쉬움 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| 3. UI 오버레이 | 쉬움 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| 4. 포트레잇 | 쉬움 | ⭐⭐⭐ | ⭐⭐⭐ | - |
| 5. 화면 분할 | 어려움 | ⭐⭐⭐⭐ | ⭐⭐⭐ | - |
| **조합 (1+3)** | 중간 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅✅ **최고** |

---

## 🎨 디자인 스타일별 권장

### **사이버펑크/매트릭스 테마:**
→ **홀로그램 프레임** (옵션 1)
- 청록색 네온 테두리
- 스캔라인 효과
- 글리치 애니메이션

### **모던/미니멀:**
→ **그라데이션 페이드** (옵션 2)
- 심플한 페이드 아웃
- 깔끔한 느낌

### **클래식 게임:**
→ **UI 오버레이** (옵션 3)
- 전통적인 레이아웃
- 명확한 UI 구분

### **비주얼 노벨 스타일:**
→ **포트레잇 모드** (옵션 4)
- 대화형 게임 느낌
- 얼굴 중심

---

## 🚀 구현 우선순위

1. **프레임 + UI 오버레이** (옵션 1+3)
2. 테스트 및 피드백
3. 스타일 조정 (색상, 테두리, 그림자)
4. 다른 캐릭터 적용

---

## 💡 추가 아이디어

### **동적 프레임:**
- 포즈에 따라 프레임 색상 변경
- Idle: 파란색
- Jump/Dance: 주황색
- Clap/Pose: 금색

### **애니메이션 효과:**
- 프레임 테두리 맥동 (pulse)
- 스캔라인 움직임
- 입자 효과

### **상황별 스타일:**
- 정상: 깔끔한 프레임
- 콤보: 빛나는 효과
- Perfect: 반짝이는 별

---

**가장 자연스럽고 게임 느낌이 나는 방법은 프레임 + UI 오버레이 조합입니다!**
