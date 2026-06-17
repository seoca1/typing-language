# Character Generation Prompts

Organized prompts for generating all 84 character images with ChatGPT or Grok.

---

## 📁 Directory Structure

```
prompts/
├── en/           # English Characters (3)
│   ├── emily/    # Modern American Girl - READY! ✓
│   ├── oliver/   # British Gentleman
│   └── sophia/   # Tech Expert
├── jp/           # Japanese Characters (3)
│   ├── sakura/   # Traditional Girl
│   ├── yuki/     # School Girl
│   └── kaito/    # Cool Boy
├── es/           # Spanish Characters (3)
│   ├── isabella/ # Flamenco Dancer
│   ├── carlos/   # Spanish Youth
│   └── luna/     # Barcelona Artist
└── kr/           # Korean Characters (3)
    ├── hana/     # Traditional Hanbok Girl
    ├── minho/    # K-pop Idol
    └── jiwoo/    # Gamer Girl
```

---

## 🎯 Usage

### Method 1: Individual Prompt Files (Emily - READY)

Emily has complete individual prompt files:

```bash
cd en/emily
cat idle.txt    # Copy this prompt
# Paste into ChatGPT/Grok
# Save image to: prototype/public/characters/en/emily/idle.png
```

### Method 2: Reference Main Prompts Document

For other characters, refer to the complete prompts:

```bash
# View all character prompts
cat ../../docs/AI_CHARACTER_PROMPTS.md

# Find specific character section
# Copy the relevant prompt
# Generate image
# Save to appropriate location
```

---

## 📝 Standard Poses (All Characters)

Each character needs 7 poses:

1. **idle** - Standing neutral/relaxed
2. **wave** - Waving cheerfully
3. **jump** - Jumping with excitement
4. **clap** - Clapping hands happily
5. **spin** - Spinning/twirling motion
6. **dance** - Dancing energetically
7. **pose** - Victory/confident pose

---

## 🚀 Quick Start

### Start with Emily (Recommended)

1. **Navigate to Emily:**
   ```bash
   cd en/emily
   ```

2. **Generate idle pose first:**
   ```bash
   cat idle.txt
   # Copy entire content
   # Paste into ChatGPT/Grok
   # Generate and download
   ```

3. **Save image:**
   ```
   prototype/public/characters/en/emily/idle.png
   ```

4. **Test in game before continuing**

5. **Continue with other Emily poses** (wave, jump, etc.)

6. **Move to other characters**

---

## 💾 Save Locations

### English
```
prototype/public/characters/en/emily/[pose].png
prototype/public/characters/en/oliver/[pose].png
prototype/public/characters/en/sophia/[pose].png
```

### Japanese
```
prototype/public/characters/jp/sakura/[pose].png
prototype/public/characters/jp/yuki/[pose].png
prototype/public/characters/jp/kaito/[pose].png
```

### Spanish
```
prototype/public/characters/es/isabella/[pose].png
prototype/public/characters/es/carlos/[pose].png
prototype/public/characters/es/luna/[pose].png
```

### Korean
```
prototype/public/characters/kr/hana/[pose].png
prototype/public/characters/kr/minho/[pose].png
prototype/public/characters/kr/jiwoo/[pose].png
```

---

## 📊 Progress Tracking

### English (EN)
- [ ] Emily - 7 poses (PROMPTS READY ✓)
- [ ] Oliver - 7 poses
- [ ] Sophia - 7 poses

### Japanese (JP)
- [ ] Sakura - 7 poses
- [ ] Yuki - 7 poses
- [ ] Kaito - 7 poses

### Spanish (ES)
- [ ] Isabella - 7 poses
- [ ] Carlos - 7 poses
- [ ] Luna - 7 poses

### Korean (KR)
- [ ] Hana - 7 poses
- [ ] Minho - 7 poses
- [ ] Jiwoo - 7 poses

**Total:** ___ / 84 images

---

## 🔗 Related Files

**Complete Prompts (All Characters):**
```
../docs/AI_CHARACTER_PROMPTS.md
```

**Generation Guide:**
```
../docs/CHATGPT_IMAGE_GENERATION.md
```

**Quick Start:**
```
../QUICKSTART.md
```

**Ready Prompts (Emily):**
```
~/CHATGPT_PROMPTS_READY.md
```

---

## 📌 Important Notes

### File Naming
- **Correct:** `idle.png`, `wave.png`, etc. ✓
- **Wrong:** `Idle.PNG`, `emily_idle.png` ✗

### Image Specs
- **Format:** PNG (preferred)
- **Size:** 512×768 pixels (portrait)
- **Background:** White or transparent
- **Style:** Anime/manga aesthetic

### Generation Tips
1. Start with Emily (prompts are ready)
2. Test idle pose in game first
3. Generate all 7 Emily poses
4. Move to next character
5. Use consistent style for each language

---

## ✅ Status

**Ready to Use:**
- ✅ Emily prompts (7 .txt files)
- ✅ Save locations documented
- ✅ Complete guide available

**Next Steps:**
1. Generate Emily images
2. Test in game
3. Create prompts for other characters (or use AI_CHARACTER_PROMPTS.md)

---

**Start here:** `cd en/emily && cat idle.txt`

**Happy generating! 🎨✨**
