# 배경 투명도 문제 해결 가이드

## 문제 상황

Emily 이미지 중 일부는 투명 배경(RGBA), 일부는 흰색 배경(RGB)으로 생성되어 일관성이 없습니다:

```
✅ 1-idle.png: RGBA (투명)
❌ 2-wave.png: RGB (흰색)
❌ 3-jump.png: RGB (흰색)
❌ 4-clap.png: RGB (흰색)
✅ 5-spin.png: RGBA (투명)
✅ 6-dance.png: RGBA (투명)
❌ 7-pose.png: RGB (흰색)
```

게임 화면에서 흰색 박스로 보이는 이미지들이 있습니다.

---

## 해결 방법

### 옵션 1: AI 생성 도구에서 명확히 요청

**기존 프롬프트 (문제):**
```
- White or transparent background
```

**개선된 프롬프트 (해결):**
```
BACKGROUND (CRITICAL):
- **TRANSPARENT BACKGROUND REQUIRED**
- PNG format with alpha channel (RGBA)
- NO white background
- NO colored background
- Completely remove/cut out all background
- Only the character should be visible
- Background must be 100% transparent
```

**추가 강조 문구:**
```
IMPORTANT: The background MUST be completely transparent (not white, not gray, not any color).
Export as PNG with transparency/alpha channel enabled.
This is for game development where transparent backgrounds are required.
```

---

### 옵션 2: ChatGPT/DALL-E 사용 시

**생성 후 요청:**
```
Please make the background completely transparent and export as PNG with alpha channel.
```

또는 처음부터:
```
Generate with a transparent background (PNG with alpha channel, no white background).
```

---

### 옵션 3: Grok 사용 시

Grok (Flux)는 기본적으로 배경을 포함하므로, 명확히 요청:

```
CRITICAL REQUIREMENT: Transparent background only.
- Format: PNG with transparency
- Remove all background elements
- Character should be on transparent layer
- No white, no colors, pure transparency
```

---

### 옵션 4: 생성 후 배경 제거 도구 사용

만약 AI가 투명 배경을 제공하지 않으면, 온라인 도구로 배경 제거:

**추천 무료 도구:**
1. **remove.bg** - https://www.remove.bg/
2. **Adobe Express Background Remover** - https://www.adobe.com/express/feature/image/remove-background
3. **Photopea** (무료 포토샵) - https://www.photopea.com/

**사용 방법:**
1. 생성된 이미지 업로드
2. 배경 자동 제거
3. PNG로 다운로드 (투명 배경 포함)

---

## 프롬프트 업데이트 가이드

### 모든 캐릭터 프롬프트에 추가할 섹션:

기존 COMPOSITION 섹션을 다음과 같이 수정:

```
COMPOSITION:
- Portrait orientation (vertical)
- Full body shot (head to toe)
- Character centered

**BACKGROUND (CRITICAL - MUST READ):**
- ✅ TRANSPARENT background (PNG with alpha channel)
- ❌ NO white background
- ❌ NO colored background  
- ❌ NO gradient background
- The entire background must be 100% transparent
- Only the character should be visible
- This is for game development requiring transparency

- No additional objects or scenery
- Solo character (no other people)
```

**TECHNICAL 섹션에 추가:**
```
TECHNICAL:
- Resolution: 1024×1536 pixels (portrait 2:3 ratio)
- Format: PNG with alpha channel (RGBA)
- **Color mode: RGBA (NOT RGB)**
- **Background: Fully transparent (alpha = 0)**
- High detail level
- Professional quality
```

**AVOID 섹션에 추가:**
```
AVOID:
- Multiple characters
- Busy backgrounds
- **White or colored backgrounds (TRANSPARENCY REQUIRED)**
- **Solid background layers**
- Text or watermarks
- Low quality or blurry
- Incorrect anatomy
```

---

## 재생성 우선순위

### 투명 배경 필요한 이미지 (4개):

```
❌ 2-wave.png   (RGB → RGBA로 재생성 필요)
❌ 3-jump.png   (RGB → RGBA로 재생성 필요)
❌ 4-clap.png   (RGB → RGBA로 재생성 필요)
❌ 7-pose.png   (RGB → RGBA로 재생성 필요)
```

### 재생성 절차:

1. **프롬프트 파일 수정:**
   ```bash
   # 2-wave.txt, 3-jump.txt, 4-clap.txt, 7-pose.txt 수정
   # 위의 개선된 배경 요청 섹션 추가
   ```

2. **AI 도구에서 재생성:**
   - ChatGPT/Grok 열기
   - 업데이트된 프롬프트 붙여넣기
   - **배경 투명도 명확히 강조**
   - 이미지 생성

3. **생성 후 확인:**
   ```bash
   # PNG 파일 다운로드 후 확인
   file 2-wave.png
   # "PNG image data, 1024 x 1536, 8-bit/color RGBA" 확인
   ```

4. **배경 확인 방법:**
   - 이미지 뷰어에서 열기
   - 체크무늬 패턴(투명도 표시)이 보이는지 확인
   - 또는 `file` 명령으로 RGBA 확인

5. **파일 교체:**
   ```bash
   # 기존 파일 백업 (선택사항)
   mv 2-wave.png 2-wave-old.png
   
   # 새 파일로 교체
   # 다운로드한 파일을 2-wave.png로 이름 변경하여 저장
   ```

---

## 다른 캐릭터 생성 시 주의사항

### Oliver, Sophia, Sakura 등 나머지 캐릭터:

**모든 프롬프트에 다음 강조:**

```
🚨 CRITICAL BACKGROUND REQUIREMENT 🚨

The background MUST be completely transparent.

- Format: PNG with alpha channel (RGBA)
- No white background
- No colored background
- Pure transparency (alpha = 0 for all background pixels)
- Only the character should be visible

This image will be used in a game with various backgrounds,
so transparency is absolutely required.

Please ensure you export/generate with transparency enabled.
```

---

## 검증 체크리스트

생성된 이미지가 올바른지 확인:

### 1. 파일 형식 확인:
```bash
file *.png
# 모든 파일이 "RGBA" 포함해야 함
```

### 2. 이미지 뷰어 확인:
- [ ] 배경이 체크무늬로 보임 (투명도)
- [ ] 흰색 박스 없음
- [ ] 캐릭터만 보임

### 3. 게임에서 확인:
- [ ] 캐릭터 테스트 화면에서 모든 포즈 확인
- [ ] 배경이 일관되게 투명
- [ ] 흰색/회색 박스 없음

---

## 요약

**문제:** 일부 이미지만 투명, 나머지는 흰색 배경
**원인:** 프롬프트에서 배경 투명도 명확히 요청 안 함
**해결:** 프롬프트에 투명 배경 명확히 강조

**재생성 필요:** 2-wave, 3-jump, 4-clap, 7-pose (4개)
**정상:** 1-idle, 5-spin, 6-dance (3개)

**다음 캐릭터 생성 시:** 모든 프롬프트에 투명 배경 요구사항 추가!
