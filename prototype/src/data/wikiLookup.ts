/**
 * WikiLookup - source 필드 → WikiPage 조회 유틸리티
 *
 * corpus.ts의 WordEntry.source (예: 'meat', 'chicken')를 받아서
 * dailyLessons.ts의 wikiIndex에서 해당 위키 페이지를 찾는다.
 */

import { getWikiIndex, type WikiPage } from './dailyLessons.js';
import type { Language } from '../types.js';

/**
 * source 문자열과 언어 → WikiPage 조회
 *
 * source가 'meat'이면 'meat.md'로 변환하여 wikiIndex에서 찾는다.
 * topic-level sources (예: 'food-vocabulary')는 topic page를 찾는다.
 */
export function lookupWikiPage(source: string | undefined, _language: Language): WikiPage | null {
  if (!source) return null;

  const filename = source.endsWith('.md') ? source : `${source}.md`;
  const index = getWikiIndex();
  const entry = index[filename];
  if (!entry) return null;

  return { filename, ...entry };
}

/**
 * 해당 언어의 모든 wiki page 목록 반환 (디버깅/목록용)
 */
export function getAllWikiPages(language: Language): WikiPage[] {
  const index = getWikiIndex();
  return Object.entries(index)
    .filter(([filename]) => filename.startsWith(`${language}/`))
    .map(([filename, entry]) => ({ filename, ...entry }));
}
