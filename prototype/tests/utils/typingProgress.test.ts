/**
 * typingProgress Tests
 *
 * Verifies the calculation of typing progress and kanji alpha for
 * the JP inline reading display.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTypingProgress,
  calculateKanjiAlpha,
} from '../../src/utils/typingProgress.js';

describe('calculateTypingProgress', () => {
  it('returns 0 when nothing typed', () => {
    expect(calculateTypingProgress(0, 6)).toBe(0);
  });

  it('returns 1 when fully typed', () => {
    expect(calculateTypingProgress(6, 6)).toBe(1);
  });

  it('returns proportional value for partial', () => {
    expect(calculateTypingProgress(3, 6)).toBeCloseTo(0.5, 5);
    expect(calculateTypingProgress(1, 4)).toBeCloseTo(0.25, 5);
    expect(calculateTypingProgress(2, 4)).toBeCloseTo(0.5, 5);
    expect(calculateTypingProgress(3, 4)).toBeCloseTo(0.75, 5);
  });

  it('clamps to 1 when buffer exceeds total', () => {
    expect(calculateTypingProgress(10, 6)).toBe(1);
  });

  it('clamps to 0 when buffer is negative', () => {
    expect(calculateTypingProgress(-1, 6)).toBe(0);
  });

  it('returns 0 when totalRomaji is 0 (no romaji available)', () => {
    expect(calculateTypingProgress(5, 0)).toBe(0);
  });

  it('returns 0 when totalRomaji is negative', () => {
    expect(calculateTypingProgress(5, -1)).toBe(0);
  });
});

describe('calculateKanjiAlpha', () => {
  it('returns 1.0 at progress 0 (full bright)', () => {
    expect(calculateKanjiAlpha(0)).toBe(1.0);
  });

  it('returns 0.3 at progress 1 (max dim, achieved state)', () => {
    expect(calculateKanjiAlpha(1)).toBeCloseTo(0.3, 10);
  });

  it('interpolates linearly between', () => {
    // progress 0.5 → 1 - 0.5*0.7 = 0.65
    expect(calculateKanjiAlpha(0.5)).toBeCloseTo(0.65, 5);
    // progress 0.25 → 1 - 0.25*0.7 = 0.825
    expect(calculateKanjiAlpha(0.25)).toBeCloseTo(0.825, 5);
    // progress 0.75 → 1 - 0.75*0.7 = 0.475
    expect(calculateKanjiAlpha(0.75)).toBeCloseTo(0.475, 5);
  });

  it('clamps to 0.3 minimum (never fully invisible)', () => {
    expect(calculateKanjiAlpha(1)).toBeCloseTo(0.3, 10);
    expect(calculateKanjiAlpha(2)).toBeCloseTo(0.3, 10); // beyond 1
  });

  it('clamps progress > 1 to alpha 0.3', () => {
    expect(calculateKanjiAlpha(1.5)).toBeCloseTo(0.3, 10);
  });

  it('returns 1.0 for negative progress (defensive)', () => {
    expect(calculateKanjiAlpha(-0.5)).toBeCloseTo(1.0, 10);
  });
});

describe('typingProgress integration (real game scenarios)', () => {
  it('gakkou (6 romaji) → progress decreases kanji alpha', () => {
    // "がっこう学校" (gakkou + 学校)
    const total = 6;
    // Typed 0 → alpha 1.0
    expect(calculateKanjiAlpha(calculateTypingProgress(0, total))).toBeCloseTo(1.0, 10);
    // Typed 3 (half) → alpha 0.65
    expect(calculateKanjiAlpha(calculateTypingProgress(3, total))).toBeCloseTo(0.65, 5);
    // Typed 6 (all) → alpha 0.3
    expect(calculateKanjiAlpha(calculateTypingProgress(6, total))).toBeCloseTo(0.3, 10);
  });

  it('kirei (5 romaji) → progress', () => {
    // "きれい綺麗" (kirei + 綺麗)
    const total = 5;
    expect(calculateTypingProgress(2, total)).toBeCloseTo(0.4, 5);
    expect(calculateKanjiAlpha(calculateTypingProgress(2, total))).toBeCloseTo(0.72, 5);
  });

  it('sensei (6 romaji) → progress', () => {
    const total = 6;
    expect(calculateTypingProgress(1, total)).toBeCloseTo(1 / 6, 5);
    expect(calculateKanjiAlpha(calculateTypingProgress(1, total))).toBeCloseTo(0.883, 3);
  });
});
