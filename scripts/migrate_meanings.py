#!/usr/bin/env python3
"""
Migrate WordEntry `meaning` to `meanings: { en, ko, ja, es }`.

The original corpus has `meaning: <text>` in mixed languages:
- EN corpus: Korean meanings (안녕, 부디, 미안)
- JP corpus: English meanings (hello, good morning)
- ES corpus: Korean meanings (안녕, 고마워)
- KR corpus: English meanings (hello, thank you)

This script:
1. Detects each meaning's language (heuristic: Korean chars = ko, etc.)
2. Converts to `meanings: { <lang>: <text> }` map
3. Adds English meanings to entries that have only Korean ones
   (using a small manual dictionary for common words)
4. Adds the new field to the corpus
"""

import re
from pathlib import Path
import sys

CORPUS_PATH = Path(__file__).parent.parent / "prototype" / "src" / "data" / "corpus.ts"

# Manual dictionary for common words — EN, KO, JA, ES meanings
# Used as fallback when only one meaning is available
COMMON_DICT = {
    # Greetings
    "hello": {
        "en": "hello (greeting)",
        "ko": "안녕 (인사)",
        "ja": "こんにちは (挨拶)",
        "es": "hola (saludo)",
    },
    "hi": {
        "en": "hi (casual greeting)",
        "ko": "안녕 (캐주얼)",
        "ja": "やあ (カジュアル)",
        "es": "hola (informal)",
    },
    "goodbye": {
        "en": "goodbye",
        "ko": "안녕히 가세요",
        "ja": "さようなら",
        "es": "adiós",
    },
    "thanks": {
        "en": "thanks",
        "ko": "고마워",
        "ja": "ありがとう",
        "es": "gracias",
    },
    "thank": {
        "en": "thank you",
        "ko": "감사합니다",
        "ja": "ありがとう",
        "es": "gracias",
    },
    "please": {
        "en": "please",
        "ko": "부디 / 제발",
        "ja": "お願いします",
        "es": "por favor",
    },
    "sorry": {
        "en": "sorry",
        "ko": "미안합니다",
        "ja": "ごめんなさい",
        "es": "lo siento",
    },
    "yes": {
        "en": "yes",
        "ko": "네",
        "ja": "はい",
        "es": "sí",
    },
    "no": {
        "en": "no",
        "ko": "아니오",
        "ja": "いいえ",
        "es": "no",
    },
    "one": {"en": "one", "ko": "하나", "ja": "一 (いち)", "es": "uno"},
    "two": {"en": "two", "ko": "둘", "ja": "二 (に)", "es": "dos"},
    "three": {"en": "three", "ko": "셋", "ja": "三 (さん)", "es": "tres"},
    "love": {
        "en": "love",
        "ko": "사랑",
        "ja": "愛 (あい)",
        "es": "amor",
    },
    "beautiful": {
        "en": "beautiful",
        "ko": "아름다운",
        "ja": "美しい",
        "es": "hermoso/a",
    },
    "kiss": {"en": "kiss", "ko": "키스", "ja": "キス", "es": "beso"},
    "date": {"en": "date", "ko": "데이트", "ja": "デート", "es": "cita"},
    "boyfriend": {
        "en": "boyfriend",
        "ko": "남자친구",
        "ja": "彼氏 (かれし)",
        "es": "novio",
    },
    "girlfriend": {
        "en": "girlfriend",
        "ko": "여자친구",
        "ja": "彼女 (かのじょ)",
        "es": "novia",
    },
}


def detect_meaning_lang(text: str) -> str:
    """Detect language of a meaning string.

    Heuristic:
    - Korean chars: ko
    - Japanese-specific kana (ひらがな/カタカナ): ja
    - Otherwise assume English (or Latin script Spanish/other)
    """
    if not text:
        return "en"

    # Korean Hangul (U+AC00-U+D7AF)
    if re.search(r"[\uAC00-\uD7AF]", text):
        return "ko"

    # Japanese hiragana (U+3040-U+309F) or katakana (U+30A0-U+30FF)
    if re.search(r"[\u3040-\u30FF]", text):
        return "ja"

    # Spanish-specific chars
    if re.search(r"[ñ¿¡áéíóú]", text, re.IGNORECASE):
        return "es"

    # Default to English
    return "en"


def migrate_entry(entry_text: str) -> str:
    """Convert a single corpus entry line to use meanings map."""
    # Find `meaning: '...'` (with single quotes, possibly with apostrophes escaped)
    match = re.search(r"meaning:\s*'([^']*)'", entry_text)
    if not match:
        return entry_text

    meaning = match.group(1)
    detected_lang = detect_meaning_lang(meaning)

    # Find display field for fallback
    display_match = re.search(r"display:\s*'([^']*)'", entry_text)
    display = display_match.group(1) if display_match else ""

    # Build meanings map
    meanings = {detected_lang: meaning}

    # Add English meaning from dict if available
    en_meaning = COMMON_DICT.get(display.lower(), {}).get("en")
    if en_meaning and "en" not in meanings:
        meanings["en"] = en_meaning

    # Add all 4 from dict if available
    dict_meanings = COMMON_DICT.get(display.lower(), {})
    for lang in ["en", "ko", "ja", "es"]:
        if lang not in meanings and lang in dict_meanings:
            meanings[lang] = dict_meanings[lang]

    # Build new meanings string
    parts = [f"{lang}: '{m}'" for lang, m in sorted(meanings.items())]
    meanings_str = "{ " + ", ".join(parts) + " }"

    # Replace the meaning field with meanings map + meaningLang
    new_text = re.sub(
        r"meaning:\s*'[^']*'(,\s*)?",
        f"meanings: {meanings_str}, meaningLang: '{detected_lang}'\\1",
        entry_text,
        count=1,
    )

    return new_text


def main():
    if not CORPUS_PATH.exists():
        print(f"Error: corpus not found: {CORPUS_PATH}")
        sys.exit(1)

    text = CORPUS_PATH.read_text(encoding="utf-8")
    lines = text.splitlines()

    new_lines = []
    migrated_count = 0
    skipped_count = 0
    already_migrated = 0

    for line in lines:
        # Only process word entry lines (have id, display, meaning)
        if "meaning:" in line and "display:" in line and "id:" in line:
            if "meanings:" in line:
                # Already migrated
                already_migrated += 1
                new_lines.append(line)
            else:
                new_line = migrate_entry(line)
                if new_line != line:
                    migrated_count += 1
                else:
                    skipped_count += 1
                new_lines.append(new_line)
        else:
            new_lines.append(line)

    new_text = "\n".join(new_lines)

    # Write back
    CORPUS_PATH.write_text(new_text, encoding="utf-8")

    print(f"=== Migration Summary ===")
    print(f"Migrated: {migrated_count} entries")
    print(f"Already migrated: {already_migrated} entries")
    print(f"Skipped (no meaning field): {skipped_count} entries")
    print(f"Output: {CORPUS_PATH}")


if __name__ == "__main__":
    main()
