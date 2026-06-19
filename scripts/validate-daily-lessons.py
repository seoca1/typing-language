#!/usr/bin/env python3
"""
Validate Daily Lessons JSON

빌드된 dailyLessons.json의 스키마와 내용을 검증합니다.
CI/빌드 시 자동으로 실행되어 콘텐츠 품질을 보장합니다.

Usage:
    python3 scripts/validate-daily-lessons.py
    python3 scripts/validate-daily-lessons.py --strict
"""

import argparse
import json
import re
import sys
from pathlib import Path

OUTPUT_PATH = Path(__file__).parent.parent / "prototype" / "src" / "data" / "dailyLessons.json"

# Required structure
REQUIRED_LANG = ["en", "jp", "es", "kr"]
MIN_LESSONS_PER_LANG = 1
MIN_VOCAB_PER_LESSON = 3
MIN_EXPRESSIONS_PER_LESSON = 1
MIN_RAW_EXCERPT_CHARS = 30
MAX_READ_MINUTES = 15
MIN_READ_MINUTES = 1

# Color codes for terminal output
class Colors:
    RED = "\033[0;31m"
    GREEN = "\033[0;32m"
    YELLOW = "\033[1;33m"
    BLUE = "\033[0;34m"
    GRAY = "\033[0;90m"
    END = "\033[0m"


def color(text: str, c: str) -> str:
    """Color text if stdout is a TTY."""
    if sys.stdout.isatty():
        return f"{c}{text}{Colors.END}"
    return text


def fail(msg: str) -> str:
    return color(f"✗ {msg}", Colors.RED)


def warn(msg: str) -> str:
    return color(f"⚠ {msg}", Colors.YELLOW)


def ok(msg: str) -> str:
    return color(f"✓ {msg}", Colors.GREEN)


def info(msg: str) -> str:
    return color(f"ℹ {msg}", Colors.BLUE)


def validate_schema(data: dict) -> list[str]:
    """Validate top-level schema. Returns list of errors."""
    errors = []
    required_top = ["schemaVersion", "generatedAt", "lessonCount", "byLanguage", "lessons"]
    for key in required_top:
        if key not in data:
            errors.append(f"Missing top-level key: {key}")

    if data.get("schemaVersion") != "1.0":
        errors.append(f"Invalid schemaVersion: {data.get('schemaVersion')}")

    if not isinstance(data.get("lessons"), list):
        errors.append(f"'lessons' must be list, got {type(data.get('lessons'))}")

    if data.get("lessonCount") != len(data.get("lessons", [])):
        errors.append(
            f"lessonCount mismatch: {data.get('lessonCount')} vs actual {len(data.get('lessons', []))}"
        )
    return errors


def validate_lesson(lesson: dict, idx: int) -> list[str]:
    """Validate a single lesson. Returns list of errors."""
    errors = []
    prefix = f"Lesson[{idx}] ({lesson.get('id', '?')})"

    # Required fields
    required = ["id", "date", "language", "sourceTopic", "raw", "wiki", "meta"]
    for key in required:
        if key not in lesson:
            errors.append(f"{prefix}: missing '{key}'")

    # Language check
    if lesson.get("language") not in REQUIRED_LANG:
        errors.append(
            f"{prefix}: invalid language '{lesson.get('language')}' "
            f"(expected one of {REQUIRED_LANG})"
        )

    # Raw excerpt
    raw = lesson.get("raw", {})
    excerpt = raw.get("excerpt", "")
    if len(excerpt) < MIN_RAW_EXCERPT_CHARS:
        errors.append(
            f"{prefix}: raw.excerpt too short ({len(excerpt)} chars, "
            f"min {MIN_RAW_EXCERPT_CHARS})"
        )

    # Wiki content
    wiki = lesson.get("wiki", {})
    vocab = wiki.get("vocabulary", [])
    exprs = wiki.get("expressions", [])

    if len(vocab) < MIN_VOCAB_PER_LESSON:
        errors.append(
            f"{prefix}: only {len(vocab)} vocabulary pages (min {MIN_VOCAB_PER_LESSON})"
        )
    if len(exprs) < MIN_EXPRESSIONS_PER_LESSON:
        errors.append(
            f"{prefix}: only {len(exprs)} expression pages (min {MIN_EXPRESSIONS_PER_LESSON})"
        )

    # Check each vocab/expression page has required fields
    for j, v in enumerate(vocab):
        for key in ["filename", "title", "body"]:
            if not v.get(key):
                errors.append(f"{prefix}: vocab[{j}] missing '{key}'")

    for j, e in enumerate(exprs):
        for key in ["filename", "title", "body"]:
            if not e.get(key):
                errors.append(f"{prefix}: expression[{j}] missing '{key}'")

    # Meta
    meta = lesson.get("meta", {})
    read_min = meta.get("estimatedReadMinutes", 0)
    if not (MIN_READ_MINUTES <= read_min <= MAX_READ_MINUTES):
        errors.append(
            f"{prefix}: estimatedReadMinutes={read_min} out of range "
            f"[{MIN_READ_MINUTES}, {MAX_READ_MINUTES}]"
        )

    # Wiki page cross-reference: filename should match actual files
    # (We don't validate this here, but we can check the file paths look reasonable)
    for v in vocab:
        if v.get("filename", "").endswith(".md"):
            continue  # OK
        errors.append(f"{prefix}: vocab filename doesn't end in .md: {v.get('filename')}")

    return errors


def validate_coverage(data: dict) -> list[str]:
    """Validate language coverage."""
    warnings = []
    by_lang = data.get("byLanguage", {})

    for lang in REQUIRED_LANG:
        count = by_lang.get(lang, 0)
        if count < MIN_LESSONS_PER_LANG:
            warnings.append(
                f"Language '{lang}' has only {count} lessons (min recommended: {MIN_LESSONS_PER_LANG})"
            )
    return warnings


def main():
    parser = argparse.ArgumentParser(description="Validate daily lessons JSON")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as errors")
    parser.add_argument("--json", action="store_true", help="Output JSON report")
    args = parser.parse_args()

    if not OUTPUT_PATH.exists():
        print(fail(f"Output file not found: {OUTPUT_PATH}"))
        print(info("Run scripts/build-daily-lessons.py first"))
        sys.exit(1)

    try:
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(fail(f"Invalid JSON: {e}"))
        sys.exit(1)

    # Run validations
    all_errors = []
    all_warnings = []

    # Schema
    all_errors.extend(validate_schema(data))

    # Lessons
    for i, lesson in enumerate(data.get("lessons", [])):
        all_errors.extend(validate_lesson(lesson, i))

    # Coverage
    all_warnings.extend(validate_coverage(data))

    # Report
    if args.json:
        report = {
            "passed": len(all_errors) == 0 and (not args.strict or len(all_warnings) == 0),
            "errors": all_errors,
            "warnings": all_warnings,
            "summary": {
                "totalLessons": data.get("lessonCount", 0),
                "byLanguage": data.get("byLanguage", {}),
            },
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        # Pretty print
        print(color("=" * 60, Colors.GRAY))
        print(color("  Daily Lessons Validation Report", Colors.BLUE))
        print(color("=" * 60, Colors.GRAY))
        print()

        summary = data.get("byLanguage", {})
        print(info(f"Total lessons: {data.get('lessonCount', 0)}"))
        for lang, count in summary.items():
            print(info(f"  {lang}: {count} lessons"))
        print()

        if all_warnings:
            print(color("Warnings:", Colors.YELLOW))
            for w in all_warnings:
                print(f"  {w}")
            print()

        if all_errors:
            print(color("Errors:", Colors.RED))
            for e in all_errors:
                print(f"  {e}")
            print()
            print(fail(f"Validation FAILED: {len(all_errors)} error(s)"))
            sys.exit(1)

        if args.strict and all_warnings:
            print(fail(f"Validation FAILED (--strict): {len(all_warnings)} warning(s)"))
            sys.exit(1)

        print(ok(f"Validation PASSED: 0 errors, {len(all_warnings)} warning(s)"))

        # Size check
        size_kb = OUTPUT_PATH.stat().st_size / 1024
        if size_kb > 500:
            print(warn(f"File size {size_kb:.1f} KB exceeds 500 KB (consider trimming excerpts)"))
        else:
            print(ok(f"File size: {size_kb:.1f} KB"))


if __name__ == "__main__":
    main()
