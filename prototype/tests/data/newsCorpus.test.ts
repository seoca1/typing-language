/**
 * News Corpus Tests — Phase K
 *
 * Verifies that the 'news' corpus has 12+ entries per language and that
 * Tier 4 stages can produce sufficient enemies without fallback.
 */

import { describe, it, expect } from 'vitest';
import { SAMPLE_STAGES } from '../../src/data/stages.js';
import { SENTENCES } from '../../src/data/corpus.js';
import { createStageState } from '../../src/stage/StageSystem.js';

describe('News corpus — Phase K Tier 4 unlock', () => {
  it('All 4 languages have ≥12 news entries (level 4, category news)', () => {
    for (const lang of ['en', 'jp', 'es', 'kr'] as const) {
      const news = SENTENCES[lang].filter(
        (s) => s.level === 4 && s.category === 'news'
      );
      expect(news.length, `${lang} news count`).toBeGreaterThanOrEqual(12);
    }
  });

  it('News entries have required fields', () => {
    for (const lang of ['en', 'jp', 'es', 'kr'] as const) {
      const news = SENTENCES[lang].filter(
        (s) => s.level === 4 && s.category === 'news'
      );
      for (const entry of news) {
        expect(entry.id, `${lang} entry id`).toBeDefined();
        expect(entry.display, `${lang} entry display`).toBeTruthy();
        expect(entry.level, `${lang} entry level`).toBe(4);
        expect(entry.category, `${lang} entry category`).toBe('news');
        // JP entries should have romaji for typing
        if (lang === 'jp') {
          expect(entry.romaji, `${lang} entry romaji`).toBeTruthy();
        }
      }
    }
  });

  it('Tier 4 stages (en_4_1, jp_4_1, es_4_1, kr_4_1) exist in SAMPLE_STAGES', () => {
    expect(SAMPLE_STAGES.find((s) => s.id === 'en_4_1')).toBeDefined();
    expect(SAMPLE_STAGES.find((s) => s.id === 'jp_4_1')).toBeDefined();
    expect(SAMPLE_STAGES.find((s) => s.id === 'es_4_1')).toBeDefined();
    expect(SAMPLE_STAGES.find((s) => s.id === 'kr_4_1')).toBeDefined();
  });

  it('Tier 4 stages can produce ≥ wordCount enemies', () => {
    for (const lang of ['en', 'jp', 'es', 'kr'] as const) {
      const stage = SAMPLE_STAGES.find((s) => s.id === `${lang}_4_1`);
      expect(stage, `${lang}_4_1 exists`).toBeDefined();
      if (stage) {
        const stageState = createStageState(stage, SENTENCES[lang]);
        expect(
          stageState.enemies.length,
          `${lang}_4_1 enemy count`
        ).toBeGreaterThanOrEqual(stage.wordCount);
      }
    }
  });

  it('JP news entries have romaji for typing input', () => {
    const jpNews = SENTENCES.jp.filter(
      (s) => s.level === 4 && s.category === 'news'
    );
    expect(jpNews.length).toBeGreaterThanOrEqual(12);
    for (const entry of jpNews) {
      expect(entry.romaji).toBeTruthy();
      // Romaji: lowercase letters, may contain uppercase acronyms (e.g., "AI", "USA")
      expect(entry.romaji).toMatch(/^[a-zA-Z]+$/);
    }
  });
});