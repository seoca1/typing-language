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
  const filtered = filterCorpus(corpus, config);
  const selected = selectWords(filtered, config.wordCount);

  const enemies = selected.map((word) => createEnemy(word, config.language));

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