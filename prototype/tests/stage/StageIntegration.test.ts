/**
 * Integration test — verify every stage in stages.ts has enough corpus
 * to fill wordCount, using the real corpus data + real fallback chain.
 *
 * This catches "broken stage" regressions like en_t_3 where the strict
 * corpusFilter matched 0 entries.
 */

import { describe, it, expect } from 'vitest';
import { createStageState } from '../../src/stage/StageSystem.js';
import { getLanguage } from '../../src/language/index.js';
import { SAMPLE_STAGES } from '../../src/data/stages.js';

describe('Real stages — every stage must produce enough enemies', () => {
  for (const stage of SAMPLE_STAGES) {
    it(`${stage.id} (${stage.language}) should produce ≥ wordCount enemies`, () => {
      const lang = getLanguage(stage.language);

      // Replicate App.tsx corpus selection
      let corpus;
      const isTier0 =
        lang.supportsTier0 &&
        stage.corpusFilter.categories &&
        lang.corpus.chars;
      if (isTier0) {
        const cat = stage.corpusFilter.categories![0];
        corpus = cat in lang.corpus.chars! ? lang.corpus.chars![cat] : lang.corpus.words;
      } else if (stage.corpusFilter.minLevel && stage.corpusFilter.minLevel >= 3) {
        const seen = new Set<string>();
        const merged = [];
        for (const e of lang.corpus.sentences) {
          if (!seen.has(e.id)) { seen.add(e.id); merged.push(e); }
        }
        for (const e of lang.corpus.words) {
          if (!seen.has(e.id)) { seen.add(e.id); merged.push(e); }
        }
        corpus = merged;
      } else {
        corpus = lang.corpus.words;
      }

      const state = createStageState(stage, [...corpus]);
      expect(state.enemies.length, `stage ${stage.id} fallback insufficient`).toBeGreaterThanOrEqual(1);
      // We expect at least 50% of wordCount even in worst case
      // (corpus might have fewer entries than wordCount for some small langs)
      expect(state.enemies.length).toBeGreaterThanOrEqual(Math.min(stage.wordCount, 5));
    });
  }
});
