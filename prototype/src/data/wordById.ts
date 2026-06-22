/**
 * WordById - corpus word lookup by ID
 *
 * Provides a fast O(1) lookup for WordEntry given a word ID.
 * Used by ResultScreen to enrich weak words with display/meaning/source.
 */

import { EN_WORDS } from './corpus.js';
import { JP_WORDS } from './corpus.js';
import { ES_WORDS } from './corpus.js';
import { KR_WORDS } from './corpus.js';
import type { WordEntry } from '../types.js';

const ALL_WORDS: readonly WordEntry[] = [
  ...EN_WORDS,
  ...JP_WORDS,
  ...ES_WORDS,
  ...KR_WORDS,
];

const WORD_MAP = new Map<string, WordEntry>(
  ALL_WORDS.map((w) => [w.id, w])
);

export function lookupWordById(id: string): WordEntry | undefined {
  return WORD_MAP.get(id);
}
