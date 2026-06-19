/**
 * Meaning Resolver
 *
 * Given a WordEntry and a native language, return the best available
 * meaning in the user's preferred language. Falls back gracefully:
 *   1. meanings[nativeLanguage]
 *   2. meanings.en (English default)
 *   3. meanings.ko (Korean legacy)
 *   4. legacy `meaning` (if meaningLang matches)
 *   5. text/display (self-explanatory for same-language target)
 *   6. undefined (no meaning available)
 */

import type { WordEntry, Target } from '../types.js';
import type { NativeLanguage } from './nativeLanguage.js';

/** The languages we support for meanings (subset of NativeLanguage) */
export type MeaningLang = 'en' | 'ko' | 'ja' | 'es';

const FALLBACK_ORDER: MeaningLang[] = ['en', 'ko', 'ja', 'es'];

/** Shape accepted by getMeaning — WordEntry (with `display`) or Target (with `text`) */
export type MeaningSource = Partial<WordEntry & Target>;

export function getMeaning(
  entry: MeaningSource,
  nativeLanguage: NativeLanguage
): string | undefined {
  // 1. Multilingual map
  if (entry.meanings) {
    if (entry.meanings[nativeLanguage]) return entry.meanings[nativeLanguage];
    // Fallback chain
    for (const lang of FALLBACK_ORDER) {
      if (entry.meanings[lang]) return entry.meanings[lang];
    }
  }

  // 2. Legacy `meaning` + `meaningLang`
  if (entry.meaning) {
    if (entry.meaningLang === nativeLanguage) return entry.meaning;
    if (entry.meaningLang === 'en' && nativeLanguage === 'ko') return entry.meaning;
    return entry.meaning;
  }

  // 3. Last resort: use display (WordEntry) or text (Target)
  if ('display' in entry && entry.display) return entry.display;
  if ('text' in entry && entry.text) return entry.text;

  return undefined;
}

/**
 * Check whether an entry has any meaning available.
 */
export function hasMeaning(entry: WordEntry | Target): boolean {
  return getMeaning(entry, 'en') !== undefined;
}
