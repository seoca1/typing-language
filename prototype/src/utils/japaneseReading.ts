/**
 * Japanese reading helpers
 *
 * Helpers for extracting and formatting the romaji reading aid
 * shown next to Japanese kanji/hiragana so beginners can see what
 * to type.
 */

import type { Target } from '../types.js';

/**
 * Get the romaji reading for a Japanese target.
 * Returns the romaji string if available, or null if it equals
 * the target text (e.g., when target IS already romaji).
 */
export function getRomajiReading(target: Target): string | null {
  const romaji = target.acceptedInputs[0];
  if (!romaji) return null;
  if (romaji === target.text) return null;
  return romaji;
}

/**
 * Format a romaji reading with parentheses for inline display.
 * Returns "(romaji)" or null if no reading.
 */
export function formatReading(romaji: string | null): string | null {
  if (!romaji) return null;
  return `(${romaji})`;
}
