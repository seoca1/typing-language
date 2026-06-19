/**
 * Japanese reading helpers tests
 *
 * Verifies the helpers used by Renderer to display the romaji
 * reading aid next to Japanese kanji/hiragana targets.
 */

import { describe, it, expect } from 'vitest';
import { getRomajiReading, formatReading } from '../../src/utils/japaneseReading.js';
import type { Target } from '../../src/types.js';

function makeTarget(overrides: Partial<Target> = {}): Target {
  return {
    text: 'こんにちは',
    acceptedInputs: ['konnichiwa'],
    meaning: 'hello',
    level: 1,
    ...overrides,
  };
}

describe('getRomajiReading', () => {
  it('returns romaji when target has acceptedInputs[0]', () => {
    const target = makeTarget({
      text: 'こんにちは',
      acceptedInputs: ['konnichiwa'],
    });
    expect(getRomajiReading(target)).toBe('konnichiwa');
  });

  it('returns null when acceptedInputs is empty', () => {
    const target = makeTarget({
      text: 'こんにちは',
      acceptedInputs: [],
    });
    expect(getRomajiReading(target)).toBeNull();
  });

  it('returns null when romaji equals target text (no reading needed)', () => {
    const target = makeTarget({
      text: 'hello',
      acceptedInputs: ['hello'],
    });
    expect(getRomajiReading(target)).toBeNull();
  });

  it('returns romaji for kanji target', () => {
    const target = makeTarget({
      text: '日本',
      acceptedInputs: ['nihon'],
      meaning: 'Japan',
    });
    expect(getRomajiReading(target)).toBe('nihon');
  });

  it('handles complex multi-word romaji', () => {
    const target = makeTarget({
      text: 'おはようございます',
      acceptedInputs: ['ohayougozaimasu'],
    });
    expect(getRomajiReading(target)).toBe('ohayougozaimasu');
  });

  it('handles sentence-level romaji with spaces', () => {
    const target = makeTarget({
      text: 'おはようございます、今日もいい天気ですね。',
      acceptedInputs: ['ohayougozaimasu, kyoumoii tenkidesune.'],
    });
    expect(getRomajiReading(target)).toBe('ohayougozaimasu, kyoumoii tenkidesune.');
  });
});

describe('formatReading', () => {
  it('wraps romaji in parentheses', () => {
    expect(formatReading('konnichiwa')).toBe('(konnichiwa)');
  });

  it('returns null for null input', () => {
    expect(formatReading(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(formatReading('')).toBeNull();
  });

  it('handles long romaji', () => {
    expect(formatReading('ohayougozaimasu')).toBe('(ohayougozaimasu)');
  });
});
