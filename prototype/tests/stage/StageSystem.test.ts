/**
 * StageSystem Tests - corpus filtering + fallback chain
 *
 * Verifies that createStageState returns at least `wordCount` enemies
 * even when the strict corpusFilter matches too few (or no) entries.
 */

import { describe, it, expect } from 'vitest';
import { createStageState, filterCorpus } from '../../src/stage/StageSystem.js';
import type { StageConfig, WordEntry } from '../../src/types.js';

function makeEntry(id: string, level: number, category: string): WordEntry {
  return {
    id,
    display: id,
    meaning: id,
    level,
    category,
  };
}

function makeStage(overrides: Partial<StageConfig> = {}): StageConfig {
  return {
    id: 'test_1_1',
    language: 'en',
    name: 'Test Stage',
    description: 'Test',
    difficulty: 1,
    wordCount: 5,
    corpusFilter: { minLevel: 1, maxLevel: 1, categories: ['food'] },
    missions: [],
    ...overrides,
  };
}

describe('filterCorpus', () => {
  const corpus: WordEntry[] = [
    makeEntry('w1', 1, 'food'),
    makeEntry('w2', 1, 'food'),
    makeEntry('w3', 1, 'animal'),
    makeEntry('w4', 2, 'food'),
    makeEntry('w5', 3, 'food'),
  ];

  it('filters by category and level', () => {
    const result = filterCorpus(corpus, makeStage({ corpusFilter: { minLevel: 1, maxLevel: 1, categories: ['food'] } }));
    expect(result.map(e => e.id).sort()).toEqual(['w1', 'w2']);
  });

  it('filters by level only', () => {
    const result = filterCorpus(corpus, makeStage({ corpusFilter: { minLevel: 1, maxLevel: 2 } }));
    expect(result.length).toBe(4);
  });

  it('returns empty when no matches', () => {
    const result = filterCorpus(corpus, makeStage({ corpusFilter: { categories: ['nonexistent'] } }));
    expect(result.length).toBe(0);
  });
});

describe('createStageState — strict match', () => {
  const corpus: WordEntry[] = [
    makeEntry('apple', 1, 'food'),
    makeEntry('banana', 1, 'food'),
    makeEntry('cherry', 1, 'food'),
    makeEntry('date', 1, 'food'),
    makeEntry('elderberry', 1, 'food'),
    makeEntry('fig', 1, 'food'),
  ];

  it('returns enemies when corpus has enough matches', () => {
    const stage = makeStage({ wordCount: 5 });
    const state = createStageState(stage, corpus);
    expect(state.enemies.length).toBe(5);
  });
});

describe('createStageState — fallback chain', () => {
  it('falls back to relaxed level when strict match too small', () => {
    const corpus: WordEntry[] = [
      // 2 entries match strict (level 1, food)
      makeEntry('a1', 1, 'food'),
      makeEntry('a2', 1, 'food'),
      // 5 entries match relaxed level (level 2, food)
      makeEntry('b1', 2, 'food'),
      makeEntry('b2', 2, 'food'),
      makeEntry('b3', 2, 'food'),
      makeEntry('b4', 2, 'food'),
      makeEntry('b5', 2, 'food'),
    ];
    const stage = makeStage({
      wordCount: 5,
      corpusFilter: { minLevel: 1, maxLevel: 1, categories: ['food'] },
    });
    const state = createStageState(stage, corpus);
    expect(state.enemies.length).toBe(5);
    // Verify fallback worked — should include level 2 entries
    const levels = state.enemies.flatMap(e => [e.target.text]).map(t => {
      const entry = corpus.find(c => c.id === t);
      return entry?.level;
    });
    expect(levels).toContain(2);
  });

  it('falls back to no-category when category match too small', () => {
    const corpus: WordEntry[] = [
      // 2 entries match strict (level 1, food)
      makeEntry('a1', 1, 'food'),
      makeEntry('a2', 1, 'food'),
      // 5 entries with level 1, any category (no 'food')
      makeEntry('c1', 1, 'animal'),
      makeEntry('c2', 1, 'object'),
      makeEntry('c3', 1, 'place'),
      makeEntry('c4', 1, 'plant'),
      makeEntry('c5', 1, 'thing'),
    ];
    const stage = makeStage({
      wordCount: 5,
      corpusFilter: { minLevel: 1, maxLevel: 1, categories: ['food'] },
    });
    const state = createStageState(stage, corpus);
    expect(state.enemies.length).toBe(5);
  });

  it('falls back to full corpus when all filters too restrictive', () => {
    const corpus: WordEntry[] = [
      makeEntry('a1', 5, 'food'),
      makeEntry('b1', 4, 'food'),
      makeEntry('c1', 3, 'food'),
      makeEntry('d1', 2, 'food'),
      makeEntry('e1', 1, 'food'),
      makeEntry('f1', 5, 'animal'),
    ];
    const stage = makeStage({
      wordCount: 5,
      corpusFilter: { minLevel: 1, maxLevel: 1, categories: ['nonexistent'] },
    });
    const state = createStageState(stage, corpus);
    expect(state.enemies.length).toBe(5);
  });

  it('uses full corpus as final fallback when corpus itself is empty', () => {
    const corpus: WordEntry[] = [];
    const stage = makeStage({ wordCount: 5 });
    // Should warn and return empty state — caller should ensure corpus is non-empty
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = createStageState(stage, corpus);
    expect(state.enemies.length).toBe(0);
    expect(consoleWarn).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });
});

describe('createStageState — real broken stages (regression)', () => {
  it('kr_3_2 (introduction category missing) should still produce 8 enemies', () => {
    // Simulate KR_SENTENCES level 3 (no 'introduction' category)
    const krSentences: WordEntry[] = [
      makeEntry('krs_001', 3, 'greeting'),
      makeEntry('krs_002', 3, 'basic'),
      makeEntry('krs_003', 3, 'time'),
      makeEntry('krs_004', 3, 'greeting'),
      makeEntry('krs_005', 3, 'question'),
      makeEntry('krs_006', 3, 'greeting'),
      makeEntry('krs_007', 3, 'restaurant'),
      makeEntry('krs_008', 3, 'question'),
      makeEntry('krs_009', 3, 'weather'),
      makeEntry('krs_010', 3, 'travel'),
    ];
    const stage = makeStage({
      id: 'kr_3_2',
      language: 'kr',
      wordCount: 8,
      corpusFilter: { minLevel: 3, maxLevel: 3, categories: ['introduction'] },
    });
    const state = createStageState(stage, krSentences);
    expect(state.enemies.length).toBe(8);
  });

  it('en_t_3 (travel level 3 sentences missing) should still produce 8 enemies', () => {
    // Simulate EN_SENTENCES (no level 3 travel entries)
    const enSentences: WordEntry[] = [
      makeEntry('ens_001', 3, 'greeting'),
      makeEntry('ens_002', 3, 'basic'),
      makeEntry('ens_003', 3, 'question'),
      makeEntry('ens_004', 3, 'restaurant'),
      makeEntry('ens_005', 3, 'greeting'),
      makeEntry('ens_006', 3, 'greeting'),
      makeEntry('ens_007', 3, 'greeting'),
      makeEntry('ens_008', 3, 'question'),
      makeEntry('ens_009', 3, 'basic'),
      makeEntry('ens_010', 3, 'question'),
      // level 4 travel (ens_104, 106) — not level 3
      makeEntry('ens_104', 4, 'travel'),
      makeEntry('ens_106', 4, 'travel'),
    ];
    const stage = makeStage({
      id: 'en_t_3',
      language: 'en',
      wordCount: 8,
      corpusFilter: { minLevel: 3, maxLevel: 3, categories: ['travel'] },
    });
    const state = createStageState(stage, enSentences);
    expect(state.enemies.length).toBe(8);
  });
});
