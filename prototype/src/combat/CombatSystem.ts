/**
 * Combat System - 적(단어/문장) 격파
 *
 * 자세한 내용: ../../../design/systems/combat.md
 */

import type { Enemy, Language, Target, WordEntry } from '../types.js';

export function createEnemy(
  word: WordEntry,
  language: Language,
): Enemy {
  const target: Target = {
    text: word.display,
    acceptedInputs:
      language === 'jp' && word.romaji
        ? [word.romaji]
        : [word.display, word.display.toLowerCase()],
    meaning: word.meaning,
    category: word.category,
    level: word.level,
  };

  // HP는 글자 수에 비례. 단, JP는 romaji 길이 기준
  const hpLength = language === 'jp' && word.romaji ? word.romaji.length : word.display.length;

  return {
    id: `enemy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    target,
    hp: hpLength,
    maxHp: hpLength,
    spawnTime: Date.now(),
  };
}

export function getProgress(enemy: Enemy, buffer: string): number {
  if (enemy.maxHp === 0) return 1;
  return Math.min(1, buffer.length / enemy.maxHp);
}

export function isDefeated(_enemy: Enemy, buffer: string, acceptedInputs: string[]): boolean {
  return acceptedInputs.includes(buffer);
}

export interface ScoreBreakdown {
  base: number;
  accuracyMultiplier: number;
  timeBonus: number;
  total: number;
}

export function calculateScore(
  enemy: Enemy,
  accuracy: number,
  timeMs: number,
): ScoreBreakdown {
  const base = enemy.maxHp * 10;
  const accuracyMultiplier = accuracy / 100;
  const timeBonus = Math.max(0, (30000 - timeMs) / 1000);
  const total = Math.floor(base * accuracyMultiplier + timeBonus * 5);
  return { base, accuracyMultiplier, timeBonus, total };
}

const COMBO_BONUS = [0, 0, 5, 10, 20, 30, 50, 80, 100];

export function getComboBonus(combo: number): number {
  if (combo >= COMBO_BONUS.length) return COMBO_BONUS[COMBO_BONUS.length - 1];
  return COMBO_BONUS[combo] ?? 0;
}

export function calculateWpm(completedTexts: string[], elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const words = completedTexts.reduce((sum, t) => sum + t.split(/\s+/).length, 0);
  return words / (elapsedMs / 60000);
}