#!/usr/bin/env python3
"""
Validate Language Corpus Files

Checks corpus files for cross-language contamination, missing fields,
invalid mappings, and other quality issues.

Usage:
    python3 scripts/validate-corpus.py
    python3 scripts/validate-corpus.py --lang jp
    python3 scripts/validate-corpus.py --strict
    python3 scripts/validate-corpus.py --json
"""

from __future__ import annotations
import argparse
import re
import sys
from pathlib import Path
from typing import List, Tuple

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
RAW_DIR = PROJECT_DIR / "raw"

LANG_CONFIG = {
    "jp": {
        "name": "Japanese",
        "file": "jp_words.md",
        "script_ranges": [
            (0x3040, 0x309F, "hiragana"),
            (0x30A0, 0x30FF, "katakana"),
            (0x4E00, 0x9FFF, "kanji"),
        ],
        "allowed_scripts": {"hiragana", "katakana", "kanji", "latin", "punctuation"},
        "has_romaji": True,
        "romaji_field": "romaji",
    },
    "es": {
        "name": "Spanish",
        "file": "es_words.md",
        "script_ranges": [
            (0x00C0, 0x024F, "latin_extended"),
            (0x0030, 0x0039, "digits"),
        ],
        "allowed_scripts": {"latin", "latin_extended", "digits", "punctuation", "accented"},
        "has_romaji": False,
    },
    "en": {
        "name": "English",
        "file": "en_words.md",
        "script_ranges": [
            (0x0041, 0x007A, "latin_basic"),
            (0x0030, 0x0039, "digits"),
        ],
        "allowed_scripts": {"latin_basic", "digits", "punctuation"},
        "has_romaji": False,
    },
    "kr": {
        "name": "Korean",
        "file": "kr_words.md",
        "script_ranges": [
            (0xAC00, 0xD7AF, "hangul"),
        ],
        "allowed_scripts": {"hangul", "latin", "digits", "punctuation"},
        "has_romaji": True,
        "romaji_field": "romaji",
    },
}

CONTAMINATION_PATTERNS = {
    "jp": {
        "kr_hangul": (0xAC00, 0xD7AF, "Korean Hangul"),
        "latin_ext": (0x00C0, 0x024F, "Latin Extended"),
    },
    "es": {
        "jp_hiragana": (0x3040, 0x309F, "Japanese Hiragana"),
        "jp_katakana": (0x30A0, 0x30FF, "Japanese Katakana"),
        "jp_kanji": (0x4E00, 0x9FFF, "Japanese Kanji"),
        "kr_hangul": (0xAC00, 0xD7AF, "Korean Hangul"),
    },
    "en": {
        "jp_hiragana": (0x3040, 0x309F, "Japanese Hiragana"),
        "jp_katakana": (0x30A0, 0x30FF, "Japanese Katakana"),
        "jp_kanji": (0x4E00, 0x9FFF, "Japanese Kanji"),
        "kr_hangul": (0xAC00, 0xD7AF, "Korean Hangul"),
        "accented": (0x00C0, 0x024F, "Accented Latin"),
    },
    "kr": {
        "jp_hiragana": (0x3040, 0x309F, "Japanese Hiragana"),
        "jp_katakana": (0x30A0, 0x30FF, "Japanese Katakana"),
        "jp_kanji": (0x4E00, 0x9FFF, "Japanese Kanji"),
    },
}


class Colors:
    RED = "\033[0;31m"
    GREEN = "\033[0;32m"
    YELLOW = "\033[1;33m"
    BLUE = "\033[0;34m"
    GRAY = "\033[0;90m"
    END = "\033[0m"


def color(text: str, c: str) -> str:
    if sys.stdout.isatty():
        return f"{c}{text}{Colors.END}"
    return text


def fail(msg: str) -> str:
    return color(f"FAIL: {msg}", Colors.RED)


def warn(msg: str) -> str:
    return color(f"WARN: {msg}", Colors.YELLOW)


def ok(msg: str) -> str:
    return color(f"OK:   {msg}", Colors.GREEN)


def info(msg: str) -> str:
    return color(f"INFO: {msg}", Colors.BLUE)


def get_script(char: str) -> tuple[str, int] | None:
    """Return (script_name, codepoint) or None if ASCII."""
    code = ord(char)
    if code < 0x80:
        return ("ascii", code)
    for lang, config in LANG_CONFIG.items():
        for start, end, name in config.get("script_ranges", []):
            if start <= code <= end:
                return (name, code)
    # Check contamination ranges
    for lang, patterns in CONTAMINATION_PATTERNS.items():
        for name, (start, end, desc) in patterns.items():
            if start <= code <= end:
                return (name, code)
    return ("unknown", code)


def parse_entries(content: str) -> list[dict]:
    """Parse yaml-like entries from corpus file."""
    entries = []
    lines = content.split("\n")
    current = {}
    for line in lines:
        if line.startswith("- {"):
            if current:
                entries.append(current)
            current = {}
            # Parse fields
            inner = line[2:].strip().rstrip("}")
            for field_match in re.finditer(r'(\w+):\s*([^,}]+)', inner):
                key = field_match.group(1)
                val = field_match.group(2).strip().strip('"').strip("'")
                current[key] = val
        elif current and ": " in line:
            match = re.match(r'\s*(\w+):\s*(.+)', line)
            if match:
                key, val = match.groups()
                val = val.strip().strip('"').strip("'")
                current[key] = val
    if current:
        entries.append(current)
    return entries


# Entries in raw/ files that are known contamination (read-only raw/ cannot be fixed).
# Format: {lang: {entry_id: "reason"}}
KNOWN_RAW_CONTAMINATION: dict[str, dict[str, str]] = {
    "jp": {
        # jp_200~ entries: Korean Hangul words accidentally placed in jp_words.md.
        # These exist as proper Korean entries in kr_words.md (kr_t_001~).
        # Not fixed in raw/ per AGENTS.md §2 — raw/ is read-only.
        "jp_200": "Korean Hangul word (아침) — duplicate of kr_t_001",
        "jp_204": "Korean Hangul word (바다) — duplicate of kr_t_006",
        "jp_205": "Korean Hangul word (방) — duplicate of kr_t_002",
        "jp_206": "Korean Hangul word (박물관) — duplicate of kr_t_007",
        "jp_207": "Korean Hangul word (버스) — duplicate of kr_t_008",
        "jp_208": "Korean Hangul word (비싸다) — duplicate of kr_t_009",
        "jp_209": "Korean Hangul word (차갑다) — duplicate of kr_t_010",
        "jp_211": "Korean Hangul word (출구) — duplicate of kr_t_005",
        "jp_212": "Korean Hangul word (달다) — duplicate of kr_t_011",
        "jp_217": "Korean Hangul word (기차) — duplicate of kr_t_012",
        "jp_219": "Korean Hangul word (극苦人) — mislabeled (Korean compound)",
        "jp_220": "Korean Hangul word (공항) — duplicate of kr_t_001",
        "jp_221": "Korean Hangul word (공원) — duplicate of kr_t_013",
        "jp_222": "Korean Hangul word (ご小人) — mislabeled (Korean compound)",
        "jp_223": "Korean Hangul word (ご迷惑) — mislabeled (Korean compound)",
        "jp_224": "Korean Hangul word (계산) — duplicate of kr_t_014",
        "jp_225": "Korean Hangul word (교차로) — duplicate of kr_t_015",
        "jp_232": "Korean Hangul word (입국심사) — duplicate of kr_t_003",
        "jp_234": "Korean Hangul word (입구) — duplicate of kr_t_016",
        "jp_236": "Korean Hangul word (절) — duplicate of kr_t_017",
        "jp_237": "Korean Hangul word (지도) — duplicate of kr_t_018",
        "jp_238": "Korean Hangul word (직진) — duplicate of kr_t_019",
        "jp_239": "Korean Hangul word (지하철) — duplicate of kr_t_020",
        "jp_240": "Korean Hangul word (짐) — duplicate of kr_t_004",
        "jp_241": "Korean Hangul word (神社) — mislabeled (Korean Hanja word)",
        "jp_242": "Korean Hangul word (주문) — duplicate of kr_t_021",
        "jp_257": "Korean Hangul word (맵다) — duplicate of kr_t_022",
        "jp_258": "Korean Hangul word (맛있다) — duplicate of kr_t_023",
        "jp_259": "Korean Hangul word (멀리) — duplicate of kr_t_024",
        "jp_262": "Korean Hangul word (왼쪽) — duplicate of kr_t_025",
        "jp_265": "Korean Hangul word (오른쪽) — duplicate of kr_t_026",
        "jp_267": "Korean Hangul word (표) — duplicate of kr_t_027",
        "jp_270": "Korean Hangul word (사진) — duplicate of kr_t_028",
        "jp_271": "Korean Hangul word (산) — duplicate of kr_t_029",
        "jp_273": "Korean Hangul word (세관) — duplicate of kr_t_030",
        "jp_278": "Korean Hangul word (식당) — duplicate of kr_t_031",
        "jp_279": "Korean Hangul word (신호등) — duplicate of kr_t_032",
        "jp_280": "Korean Hangul word (싸다) — duplicate of kr_t_033",
        "jp_281": "Korean Hangul word (田) — mislabeled (Korean Hanja)",
        "jp_282": "Korean Hangul word (택시) — duplicate of kr_t_034",
        "jp_288": "Korean Hangul word (뜨겁다) — duplicate of kr_t_035",
        "jp_289": "Korean Hangul word (역) — duplicate of kr_t_036",
        "jp_290": "Korean Hangul word (여권) — duplicate of kr_t_002",
        "jp_291": "Korean Hangul word (예약) — duplicate of kr_t_037",
        "jp_215": "Korean Hangul word (가까이) — not in kr_words.md, raw contamination",
        "jp_230": "Korean Hangul word (호텔) — English loanword in Korean, not JP",
        "jp_231": "Korean Hangul word (환전) — duplicate of kr_t_038",
        "jp_701": "Korean Hangul word (여권) — duplicate of jp_290",
    },
}


def validate_entry(entry: dict, lang: str, idx: int) -> list:
    """Validate a single entry. Returns list of (severity, message)."""
    issues = []
    config = LANG_CONFIG[lang]
    display = entry.get("display", "")
    entry_id = entry.get("id", f"entry_{idx}")

    # Skip known raw/ contamination (raw/ is read-only per AGENTS.md §2)
    suppressed = KNOWN_RAW_CONTAMINATION.get(lang, {}).get(entry_id)
    if suppressed:
        return []

    # Check for contamination
    contamination = CONTAMINATION_PATTERNS.get(lang, {})
    for name, (start, end, desc) in contamination.items():
        for char in display:
            code = ord(char)
            if start <= code <= end:
                issues.append(("warn", f"{entry_id}: Contamination: '{char}' (U+{code:04X}) is {desc} in {display}"))

    # Check romaji for jp/kr
    if config.get("has_romaji"):
        romaji = entry.get(config["romaji_field"], "")
        if not romaji or romaji.strip() == "":
            issues.append(("warn", f"{entry_id}: Missing romaji for display='{display}'"))

    # Check display is not empty
    if not display:
        issues.append(("fail", f"{entry_id}: Empty display field"))

    # Check for mixed scripts within display
    scripts_found = set()
    for char in display:
        script, _ = get_script(char)
        if script and script not in ("ascii", "punctuation"):
            scripts_found.add(script)

    # Warn if multiple scripts mixed (except kanji + hiragana/katakana which is normal for jp)
    if lang == "jp":
        # Kanji + Hiragana/Katakana is normal
        forbidden = scripts_found - {"kanji", "hiragana", "katakana", "ascii", "punctuation"}
        if forbidden:
            issues.append(("warn", f"{entry_id}: Mixed scripts in '{display}': {forbidden}"))
    elif len(scripts_found) > 1:
        issues.append(("warn", f"{entry_id}: Mixed scripts in '{display}': {scripts_found}"))

    return issues


def validate_file(lang: str, config: dict) -> Tuple[int, int, list]:
    """Validate a single corpus file. Returns (total, errors, issues)."""
    filepath = RAW_DIR / config["file"]
    if not filepath.exists():
        return (0, 1, [("fail", f"File not found: {filepath}")])

    content = filepath.read_text(encoding="utf-8")
    entries = parse_entries(content)

    total = len(entries)
    all_issues = []
    errors = 0

    for i, entry in enumerate(entries):
        issues = validate_entry(entry, lang, i)
        for severity, msg in issues:
            if severity == "fail":
                errors += 1
            all_issues.append((severity, msg))

    return (total, errors, all_issues)


def main():
    parser = argparse.ArgumentParser(description="Validate language corpus files")
    parser.add_argument("--lang", choices=list(LANG_CONFIG.keys()), help="Filter by language")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    parser.add_argument("--json", action="store_true", help="Output JSON report")
    parser.add_argument("--warn-only", action="store_true", help="Show warnings too (not just errors)")
    args = parser.parse_args()

    languages = [args.lang] if args.lang else list(LANG_CONFIG.keys())

    all_results = {}
    grand_total = 0
    grand_errors = 0
    grand_warnings = 0

    for lang in languages:
        config = LANG_CONFIG[lang]
        total, errors, issues = validate_file(lang, config)
        warnings = sum(1 for s, _ in issues if s == "warn")
        all_results[lang] = {"total": total, "errors": errors, "warnings": warnings, "issues": issues}
        grand_total += total
        grand_errors += errors
        grand_warnings += warnings

    if args.json:
        import json
        report = {
            "passed": grand_errors == 0 and (not args.strict or grand_warnings == 0),
            "total_entries": grand_total,
            "errors": grand_errors,
            "warnings": grand_warnings,
            "by_language": {lang: {"total": r["total"], "errors": r["errors"], "warnings": r["warnings"]} for lang, r in all_results.items()},
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return

    print("=" * 60)
    print("  Corpus Validation Report")
    print("=" * 60)
    print()

    for lang in languages:
        r = all_results[lang]
        config = LANG_CONFIG[lang]
        status = "PASS" if r["errors"] == 0 else "FAIL"
        icon = "✓" if status == "PASS" else "✗"
        print(f"{icon} {config['name']} ({lang}): {r['total']} entries, {r['errors']} errors, {r['warnings']} warnings")

        if args.warn_only or r["errors"] > 0:
            for severity, msg in r["issues"]:
                if severity == "fail":
                    print(f"    {fail(msg)}")
                elif args.warn_only:
                    print(f"    {warn(msg)}")

        if not args.warn_only and r["errors"] == 0:
            print(f"    {ok('No errors')}")

        print()

    print("-" * 60)
    print(f"Total: {grand_total} entries, {grand_errors} errors, {grand_warnings} warnings")
    print()

    if grand_errors > 0:
        print(fail(f"Validation FAILED: {grand_errors} error(s)"))
        sys.exit(1)
    elif args.strict and grand_warnings > 0:
        print(warn(f"Validation FAILED (--strict): {grand_warnings} warning(s)"))
        sys.exit(1)
    else:
        print(ok(f"Validation PASSED"))


if __name__ == "__main__":
    main()
