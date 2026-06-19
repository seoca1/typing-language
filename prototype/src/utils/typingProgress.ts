/**
 * Typing progress helpers for the JP inline reading display
 *
 * Calculates how much of a Japanese target's romaji has been typed,
 * used to dim the kanji part of the inline display as the player
 * makes progress.
 */

/**
 * Calculate typing progress (0 to 1) for a Japanese target.
 *
 * - bufferLength: how many romaji chars the player has typed
 * - totalRomaji: full romaji length (e.g., 6 for "gakkou")
 *
 * Returns a value in [0, 1]:
 * - 0 = nothing typed yet
 * - 1 = all romaji typed (or buffer exceeds target)
 * - Clamped to [0, 1]
 */
export function calculateTypingProgress(
  bufferLength: number,
  totalRomaji: number,
): number {
  if (totalRomaji <= 0) return 0;
  return Math.max(0, Math.min(1, bufferLength / totalRomaji));
}

/**
 * Calculate the kanji opacity (0.3 to 1.0) for a given progress.
 *
 * - progress 0 → alpha 1.0 (full bright)
 * - progress 1 → alpha 0.3 (very dim, "achieved" state)
 * - Linear interpolation in between
 */
export function calculateKanjiAlpha(progress: number): number {
  const clamped = Math.max(0, Math.min(1, progress));
  return Math.max(0.3, 1 - clamped * 0.7);
}
