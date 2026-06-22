/**
 * WikiLookup - source field to WikiPage lookup utility
 *
 * Takes WordEntry.source from corpus.ts (e.g., 'meat', 'chicken') and
 * finds the corresponding WikiPage in the dailyLessons wikiIndex.
 *
 * Supports both flat keys (e.g., 'meat.md') and nested keys (e.g., 'food/meat.md').
 */

import { getWikiIndex, type WikiPage } from './dailyLessons.js';
import type { Language } from '../types.js';

/**
 * Lookup a WikiPage by source string
 *
  * source가 'meat'이면 'meat.md'로 변환하여 wikiIndex에서 찾는다.
  * 먼저 exact match 시도, 실패 시 별표패턴으로 검색.
 */
export function lookupWikiPage(source: string | undefined, _language: Language): WikiPage | null {
  if (!source) return null;

  const filename = source.endsWith('.md') ? source : `${source}.md`;
  const index = getWikiIndex();

  // Try exact match first
  const entry = index[filename];
  if (entry) return { filename, ...entry };

  // Fallback: search for key ending with /filename (nested topic directories)
  for (const key of Object.keys(index)) {
    if (key.endsWith(`/${filename}`) || key === filename) {
      const e = index[key];
      return { filename: key, ...e };
    }
  }

  return null;
}

/**
 * Get all wiki pages for a language (debugging/listing)
 */
export function getAllWikiPages(language: Language): WikiPage[] {
  const index = getWikiIndex();
  return Object.entries(index)
    .filter(([filename]) => filename.startsWith(`${language}/`))
    .map(([filename, entry]) => ({ filename, ...entry }));
}
