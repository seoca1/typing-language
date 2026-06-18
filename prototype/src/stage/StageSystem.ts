/**
 * Stage System - 스테이지 진행
 *
 * 자세한 내용: ../../../design/systems/stage.md
 */

import type { Enemy, StageConfig, WordEntry } from '../types.js';
import { createEnemy } from '../combat/CombatSystem.js';

export interface StageState {
  config: StageConfig;
  enemies: Enemy[];
  currentIndex: number;
  startTime: number;
  clearedAt?: number;
  failed: boolean;
}

export function createStageState(config: StageConfig, corpus: WordEntry[]): StageState {
  const initialFiltered = filterCorpus(corpus, config);

  // If we don't have enough entries to fill the requested wordCount,
  // apply a fallback chain so the player can always progress:
  //   1. Relax level constraints (widen min/max to any level in same lang+category)
  //   2. Drop category constraint
  //   3. Use entire language corpus (any category, any level)
  // Each step is logged so we can see what was needed to fill the stage.
  let finalCorpus = initialFiltered;
  let usedFallback: string | null = null;

  if (finalCorpus.length < config.wordCount) {
    // Step 1: relax level constraints within same category
    const relaxedLevel = filterCorpus(corpus, {
      ...config,
      corpusFilter: {
        ...config.corpusFilter,
        minLevel: undefined,
        maxLevel: undefined,
      },
    });
    if (relaxedLevel.length >= config.wordCount) {
      finalCorpus = relaxedLevel;
      usedFallback = 'relaxed-level';
    } else if (relaxedLevel.length > finalCorpus.length) {
      finalCorpus = relaxedLevel;
      usedFallback = 'relaxed-level-partial';
    }
  }

  if (finalCorpus.length < config.wordCount) {
    // Step 2: drop categories entirely, keep level range
    const noCategory = filterCorpus(corpus, {
      ...config,
      corpusFilter: {
        minLevel: config.corpusFilter.minLevel,
        maxLevel: config.corpusFilter.maxLevel,
      },
    });
    if (noCategory.length >= config.wordCount) {
      finalCorpus = noCategory;
      usedFallback = 'no-category';
    } else if (noCategory.length > finalCorpus.length) {
      finalCorpus = noCategory;
      usedFallback = 'no-category-partial';
    }
  }

  if (finalCorpus.length === 0) {
    // Step 3: full corpus (any level, any category). Last resort.
    finalCorpus = corpus;
    usedFallback = 'full-corpus';
    console.warn(
      `[StageSystem] Stage '${config.id}' has no matching corpus entries. ` +
      `Using full language corpus (${finalCorpus.length} entries). ` +
      `Consider expanding corpus or relaxing corpusFilter.`,
    );
  }

  if (usedFallback) {
    console.warn(
      `[StageSystem] Stage '${config.id}' used fallback '${usedFallback}': ` +
      `requested ${config.wordCount} entries, ` +
      `filter=${JSON.stringify(config.corpusFilter)}, ` +
      `matched=${initialFiltered.length}, ` +
      `after-fallback=${finalCorpus.length}`,
    );
  }

  const selectedWords = selectWords(finalCorpus, config.wordCount);
  const enemies = selectedWords.map((word) => createEnemy(word, config.language));

  return {
    config,
    enemies,
    currentIndex: 0,
    startTime: Date.now(),
    failed: false,
  };
}

export function filterCorpus(corpus: WordEntry[], config: StageConfig): WordEntry[] {
  const { minLevel, maxLevel, categories } = config.corpusFilter;

  return corpus.filter((w) => {
    if (minLevel !== undefined && w.level < minLevel) return false;
    if (maxLevel !== undefined && w.level > maxLevel) return false;
    if (categories && categories.length > 0) {
      if (!w.category || !categories.includes(w.category)) return false;
    }
    return true;
  });
}

function selectWords(corpus: WordEntry[], count: number): WordEntry[] {
  if (corpus.length === 0) return [];
  const result: WordEntry[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count; i++) {
    let idx = Math.floor(Math.random() * corpus.length);
    let attempts = 0;
    while (used.has(corpus[idx].id) && attempts < corpus.length) {
      idx = Math.floor(Math.random() * corpus.length);
      attempts++;
    }
    used.add(corpus[idx].id);
    result.push(corpus[idx]);
  }

  return result;
}

export function getCurrentEnemy(state: StageState): Enemy | null {
  return state.enemies[state.currentIndex] ?? null;
}

export function advanceStage(state: StageState): void {
  state.currentIndex += 1;
  if (state.currentIndex >= state.enemies.length) {
    state.clearedAt = Date.now();
  }
}

export function isStageComplete(state: StageState): boolean {
  return state.clearedAt !== undefined;
}

export function getStageProgress(state: StageState): number {
  return state.currentIndex / state.enemies.length;
}