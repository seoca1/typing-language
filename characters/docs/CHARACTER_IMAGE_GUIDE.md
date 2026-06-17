# 🎨 캐릭터 이미지 사용 가이드

외부 이미지(아니메, 실사 사진 등)를 캐릭터로 사용하는 방법입니다.

---

## 📋 목차

1. [빠른 시작](#빠른-시작)
2. [이미지 준비](#이미지-준비)
3. [설정 방법](#설정-방법)
4. [포즈별 이미지](#포즈별-이미지)
5. [스프라이트 시트](#스프라이트-시트)
6. [고급 설정](#고급-설정)
7. [문제 해결](#문제-해결)

---

## 🚀 빠른 시작

### 1단계: 이미지 준비

캐릭터 이미지를 준비합니다:
- **형식:** PNG (투명 배경 권장), JPG, WebP
- **크기:** 200-400px (너비 또는 높이)
- **비율:** 자유 (설정에서 조정 가능)

### 2단계: 이미지 배치

이미지를 `public/characters/` 폴더에 배치합니다:

```
public/
└── characters/
    ├── my-character-idle.png
    ├── my-character-wave.png
    ├── my-character-jump.png
    └── my-character-dance.png
```

**폴더가 없으면 생성하세요!**

### 3단계: 설정 파일 수정

`src/config/characterImages.ts` 파일을 열고 설정을 추가합니다:

```typescript
export const CHARACTER_IMAGES: Record<string, CharacterImageSet> = {
  'my-character': {
    idle: {
      src: '/characters/my-character-idle.png',
      width: 300,
      height: 400,
      scale: 0.8,
      offsetY: -50,
    },
    // 다른 포즈도 추가...
  },
};

// 사용할 캐릭터 선택
export const DEFAULT_CHARACTER_IMAGE = 'my-character';

// 외부 이미지 활성화
export const USE_EXTERNAL_IMAGES = true;
```

### 4단계: 게임 실행

```bash
npm run dev
```

이미지가 자동으로 로드되고 캐릭터로 표시됩니다!

---

## 🖼️ 이미지 준비

### 권장 사양

**이미지 형식:**
- ✅ **PNG** - 투명 배경 지원 (최고 권장)
- ✅ **WebP** - 작은 파일 크기
- ⚠️ **JPG** - 투명 배경 불가 (배경색 주의)

**이미지 크기:**
- **작은 캐릭터:** 200×300px
- **중간 캐릭터:** 300×400px (권장)
- **큰 캐릭터:** 400×600px

**최적화:**
- 파일 크기 100KB 이하 권장
- 투명 배경 PNG 사용 시 더 자연스러움
- 웹 최적화 도구 사용 (TinyPNG, Squoosh 등)

### 이미지 소스

**아니메 캐릭터:**
- AI 생성: Stable Diffusion, Midjourney, NovelAI
- 일러스트: Pixiv, DeviantArt (저작권 확인)
- VTuber 모델: Live2D 스크린샷

**실사 사진:**
- AI 생성: Midjourney, DALL-E
- 스톡 사진: Unsplash, Pexels (무료 라이선스)
- 직접 촬영 (모델 동의 필요)

**저작권 주의!**
- 본인이 만든 이미지만 사용
- 라이선스 확인 필수
- 상업적 사용 시 특히 주의

---

## ⚙️ 설정 방법

### 기본 설정

`src/config/characterImages.ts`:

```typescript
export const CHARACTER_IMAGES: Record<string, CharacterImageSet> = {
  'anime-girl-1': {
    idle: {
      src: '/characters/anime-girl-idle.png',  // 이미지 경로
      width: 300,        // 표시 너비
      height: 400,       // 표시 높이
      scale: 0.8,        // 크기 배율 (선택)
      offsetX: 0,        // X 위치 조정 (선택)
      offsetY: -50,      // Y 위치 조정 (선택)
    },
  },
};
```

### 파라미터 설명

| 파라미터 | 필수 | 설명 | 예시 |
|----------|------|------|------|
| `src` | ✅ | 이미지 파일 경로 | `/characters/idle.png` |
| `width` | ✅ | 표시 너비 (픽셀) | `300` |
| `height` | ✅ | 표시 높이 (픽셀) | `400` |
| `scale` | ❌ | 크기 배율 (1.0=원본) | `0.8` |
| `offsetX` | ❌ | 가로 위치 조정 | `10` (우측), `-10` (좌측) |
| `offsetY` | ❌ | 세로 위치 조정 | `-50` (위쪽), `20` (아래) |
| `frames` | ❌ | 스프라이트 시트 프레임 수 | `4` |
| `frameDuration` | ❌ | 프레임당 시간 (ms) | `200` |

---

## 🎭 포즈별 이미지

게임에서 사용하는 7가지 포즈:

### 1. Idle (대기)
**필수** - 기본 대기 자세
```typescript
idle: {
  src: '/characters/idle.png',
  width: 300,
  height: 400,
  offsetY: -50,
}
```

### 2. Wave (손 흔들기)
스테이지 시작 시 인사
```typescript
wave: {
  src: '/characters/wave.png',
  width: 300,
  height: 400,
  offsetY: -50,
}
```

### 3. Jump (점프)
콤보 5+ 달성 시
```typescript
jump: {
  src: '/characters/jump.png',
  width: 300,
  height: 420,  // 점프 시 더 높게
  offsetY: -60,
}
```

### 4. Clap (박수)
완벽한 타이핑 달성 시
```typescript
clap: {
  src: '/characters/clap.png',
  width: 300,
  height: 400,
  offsetY: -50,
}
```

### 5. Spin (회전)
콤보 10+ 달성 시
```typescript
spin: {
  src: '/characters/spin.png',
  width: 300,
  height: 400,
  offsetY: -50,
}
```

### 6. Dance (춤)
스테이지 클리어 시
```typescript
dance: {
  src: '/characters/dance.png',
  width: 320,
  height: 420,
  offsetY: -60,
}
```

### 7. Pose (포즈)
특별한 승리 포즈
```typescript
pose: {
  src: '/characters/pose.png',
  width: 300,
  height: 400,
  offsetY: -50,
}
```

### 최소 구성

**Idle만 필수**, 나머지는 선택사항입니다:

```typescript
'simple-character': {
  idle: {
    src: '/characters/my-character.png',
    width: 300,
    height: 400,
  },
  // 나머지 포즈는 idle 이미지를 재사용
}
```

---

## 📑 스프라이트 시트

여러 프레임을 하나의 이미지에 담아 애니메이션 효과를 줄 수 있습니다.

### 스프라이트 시트 형식

**가로로 프레임 배열:**
```
┌────┬────┬────┬────┐
│ 1  │ 2  │ 3  │ 4  │
└────┴────┴────┴────┘
```

**예시:**
- 전체 이미지: 800×200px
- 4프레임 = 각 프레임 200×200px

### 설정 방법

```typescript
idle: {
  src: '/characters/sprite-sheet-idle.png',
  width: 200,
  height: 300,
  frames: 4,            // 4개 프레임
  frameDuration: 200,   // 200ms마다 프레임 전환
}
```

### 애니메이션 효과

- **frames: 2-4** - 간단한 깜빡임
- **frames: 4-8** - 부드러운 애니메이션
- **frames: 8+** - 매우 부드러운 움직임

**frameDuration 조정:**
- `100ms` - 빠른 애니메이션
- `200ms` - 보통 속도 (권장)
- `300ms` - 느린 애니메이션

---

## 🔧 고급 설정

### 여러 캐릭터 등록

```typescript
export const CHARACTER_IMAGES: Record<string, CharacterImageSet> = {
  'anime-girl-1': { /* ... */ },
  'anime-girl-2': { /* ... */ },
  'photo-girl-1': { /* ... */ },
  'cat-mascot': { /* ... */ },
};

// 사용할 캐릭터 선택
export const DEFAULT_CHARACTER_IMAGE = 'anime-girl-1';
```

### 외부 URL 사용

```typescript
idle: {
  src: 'https://example.com/character.png', // CORS 허용 필요
  width: 300,
  height: 400,
}
```

**주의:** 외부 URL은 CORS 정책 때문에 차단될 수 있습니다!

### 위치 미세 조정

```typescript
idle: {
  src: '/characters/idle.png',
  width: 300,
  height: 400,
  scale: 0.85,     // 15% 축소
  offsetX: 10,     // 우측으로 10px
  offsetY: -60,    // 위로 60px
}
```

**팁:**
1. 먼저 `scale`로 크기 조정
2. `offsetY`로 세로 위치 (발이 바닥에 닿도록)
3. `offsetX`로 가로 위치 (중앙 정렬)

### CharacterTest 모드에서 테스트

메인 메뉴 → "🎨 캐릭터 애니메이션 테스트" 버튼 클릭:
1. 모든 포즈 확인
2. 위치/크기 조정
3. 설정 수정 후 새로고침

---

## 🔥 실전 예시

### 예시 1: 아니메 소녀 (단일 이미지)

```typescript
'my-anime-waifu': {
  idle: {
    src: '/characters/waifu.png',
    width: 280,
    height: 380,
    scale: 0.9,
    offsetY: -45,
  },
}
```

**준비물:**
- `public/characters/waifu.png` (투명 배경 PNG)

### 예시 2: 실사 모델 (포즈별 이미지)

```typescript
'photo-model': {
  idle: {
    src: '/characters/model-idle.jpg',
    width: 300,
    height: 450,
    offsetY: -70,
  },
  wave: {
    src: '/characters/model-wave.jpg',
    width: 300,
    height: 450,
    offsetY: -70,
  },
  dance: {
    src: '/characters/model-dance.jpg',
    width: 320,
    height: 470,
    offsetY: -80,
  },
}
```

**준비물:**
- `public/characters/model-idle.jpg`
- `public/characters/model-wave.jpg`
- `public/characters/model-dance.jpg`

### 예시 3: 스프라이트 시트 애니메이션

```typescript
'animated-character': {
  idle: {
    src: '/characters/sprite-idle.png',
    width: 200,
    height: 300,
    frames: 8,
    frameDuration: 150,
    offsetY: -40,
  },
  jump: {
    src: '/characters/sprite-jump.png',
    width: 200,
    height: 320,
    frames: 6,
    frameDuration: 100,
    offsetY: -50,
  },
}
```

**준비물:**
- `public/characters/sprite-idle.png` (1600×300px, 8프레임)
- `public/characters/sprite-jump.png` (1200×320px, 6프레임)

---

## ❓ 문제 해결

### 이미지가 표시되지 않음

**1. 경로 확인**
```typescript
// ❌ 잘못된 경로
src: 'characters/idle.png'

// ✅ 올바른 경로
src: '/characters/idle.png'  // 슬래시(/) 필수!
```

**2. 파일 존재 확인**
- `public/characters/` 폴더 확인
- 파일 이름 대소문자 정확히 일치
- 확장자 확인 (.png vs .PNG)

**3. 콘솔 확인**
- F12 개발자 도구 열기
- Console 탭에서 에러 확인
- 404 에러 = 파일 경로 오류

### 이미지 크기가 이상함

```typescript
// offsetY로 위치 조정 (음수 = 위로)
offsetY: -50,  // 50픽셀 위로

// scale로 크기 조정
scale: 0.8,    // 80% 크기
```

### 이미지가 잘림

```typescript
// width/height 늘리기
width: 350,   // 300 → 350
height: 450,  // 400 → 450
```

### 애니메이션이 너무 빠름/느림

```typescript
// frameDuration 조정
frameDuration: 300,  // 200 → 300 (느리게)
frameDuration: 100,  // 200 → 100 (빠르게)
```

### Loading... 계속 표시됨

**원인:**
- 이미지 로드 실패
- 경로 오류
- CORS 차단 (외부 URL)

**해결:**
1. 콘솔에서 에러 확인
2. 파일 경로 재확인
3. 로컬 파일 사용 권장

### 투명 배경이 안 됨

**JPG는 투명 배경 불가!**

```typescript
// ❌ JPG (배경색 나타남)
src: '/characters/idle.jpg'

// ✅ PNG (투명 배경)
src: '/characters/idle.png'
```

---

## 🎯 체크리스트

### 이미지 준비
- [ ] PNG/JPG 이미지 준비 (200-400px)
- [ ] 투명 배경 확인 (PNG 권장)
- [ ] 파일 크기 100KB 이하 최적화
- [ ] 저작권 확인 (본인 제작 또는 라이선스)

### 파일 배치
- [ ] `public/characters/` 폴더 생성
- [ ] 이미지 파일 복사
- [ ] 파일 이름 확인 (소문자 권장)

### 설정
- [ ] `characterImages.ts` 파일 수정
- [ ] CHARACTER_IMAGES에 설정 추가
- [ ] DEFAULT_CHARACTER_IMAGE 설정
- [ ] USE_EXTERNAL_IMAGES = true

### 테스트
- [ ] `npm run dev` 실행
- [ ] 메인 메뉴에서 캐릭터 확인
- [ ] CharacterTest 모드에서 포즈 확인
- [ ] 위치/크기 미세 조정

---

## 📚 참고 자료

### 이미지 생성 도구

**AI 생성:**
- [Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
- [Midjourney](https://midjourney.com)
- [NovelAI](https://novelai.net)

**이미지 편집:**
- [GIMP](https://www.gimp.org/) - 무료 포토샵 대안
- [Photopea](https://www.photopea.com/) - 온라인 편집기

**최적화:**
- [TinyPNG](https://tinypng.com/) - PNG 압축
- [Squoosh](https://squoosh.app/) - 이미지 최적화

### 스프라이트 시트 제작

- [Aseprite](https://www.aseprite.org/) - 픽셀 아트 에디터
- [TexturePacker](https://www.codeandweb.com/texturepacker) - 스프라이트 시트 생성
- [Shoebox](https://renderhjs.net/shoebox/) - 무료 스프라이트 도구

---

## 💡 팁

### 빠른 프로토타입

**한 장으로 시작:**
```typescript
'quick-test': {
  idle: {
    src: '/characters/my-image.png',
    width: 300,
    height: 400,
  },
  // idle만 설정하면 모든 포즈에서 재사용됨
}
```

### 여러 캐릭터 쉽게 전환

```typescript
// 설정 파일 상단
const CURRENT_CHARACTER = 'anime-girl-1'; // 이것만 변경!

export const DEFAULT_CHARACTER_IMAGE = CURRENT_CHARACTER;
```

### 개발 중 빠른 확인

1. CharacterTest 모드 사용
2. 브라우저 새로고침 (Ctrl+R)
3. offsetY/scale만 수정 반복

---

**이제 당신만의 캐릭터로 게임을 즐기세요!** 🎮✨

질문이나 문제가 있으면 GitHub Issues에 올려주세요.
