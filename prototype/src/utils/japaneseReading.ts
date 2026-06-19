/**
 * Japanese reading helpers
 *
 * Helpers for extracting and formatting the reading aid (romaji or
 * converted hiragana) shown next to Japanese targets.
 */

import type { Target } from '../types.js';
import { romajiToHiragana, isKatakana } from './romajiToHiragana.js';

/**
 * Get the romaji reading for a Japanese target.
 * Returns null if no romaji is available, or if target is already romaji.
 */
export function getRomajiReading(target: Target): string | null {
  const romaji = target.acceptedInputs[0];
  if (!romaji) return null;
  if (romaji === target.text) return null;
  return romaji;
}

/**
 * Get the hiragana reading for a Japanese target.
 * Converts the romaji reading to hiragana for better readability for
 * absolute beginners. Returns null if:
 * - No romaji available
 * - Target is already romaji
 * - Target is in katakana (skip — romaji is more useful for katakana)
 */
export function getHiraganaReading(target: Target): string | null {
  const romaji = getRomajiReading(target);
  if (!romaji) return null;
  if (isKatakana(target.text)) return null;
  return romajiToHiragana(romaji);
}

/**
 * Format a reading string with parentheses for inline display.
 * Returns "(reading)" or null if no reading.
 */
export function formatReading(reading: string | null): string | null {
  if (!reading) return null;
  return `(${reading})`;
}
