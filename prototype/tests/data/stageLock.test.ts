/**
 * StageLock Tests — Phase I
 *
 * Verifies tier-based and romance/travel unlock logic.
 */

import { describe, it, expect } from 'vitest';
import {
  checkStageUnlocked,
  countClearedStages,
  getAllStageLocks,
  getNextStageToPlay,
  countNewlyUnlocked,
} from '../../src/data/stageLock.js';
import type { StageRecord } from '../../src/types.js';

function makeRecord(
  stageId: string,
  cleared: boolean = true,
  stars: number = 1
): StageRecord {
  return {
    stageId,
    cleared,
    stars,
    bestScore: 100,
    bestWpm: 30,
    bestAccuracy: 90,
    playCount: 1,
    lastPlayedAt: Date.now(),
  };
}

function makeRecords(
  entries: Array<[string, boolean]>
): Record<string, StageRecord> {
  const result: Record<string, StageRecord> = {};
  for (const [id, cleared] of entries) {
    result[id] = makeRecord(id, cleared);
  }
  return result;
}

describe('stageLock — tier-based unlock', () => {
  it('Tier 0 is always unlocked', () => {
    expect(checkStageUnlocked('en_0_1', {}).unlocked).toBe(true);
    expect(checkStageUnlocked('jp_0_1', {}).unlocked).toBe(true);
  });

  it('Tier 1 is locked when no Tier 0 cleared', () => {
    const result = checkStageUnlocked('en_1_1', {});
    expect(result.unlocked).toBe(false);
    expect(result.reason).toContain('Tier 0');
  });

  it('Tier 1 unlocks after clearing any Tier 0', () => {
    const records = makeRecords([['en_0_1', true]]);
    expect(checkStageUnlocked('en_1_1', records).unlocked).toBe(true);
  });

  it('Tier 2 unlocks after clearing any Tier 1', () => {
    const records = makeRecords([
      ['en_0_1', true],
      ['en_1_1', true],
    ]);
    expect(checkStageUnlocked('en_2_1', records).unlocked).toBe(true);
  });

  it('Tier 2 still locked if only Tier 0 cleared', () => {
    const records = makeRecords([['en_0_1', true]]);
    expect(checkStageUnlocked('en_2_1', records).unlocked).toBe(false);
  });

  it('Tier 3 requires Tier 2 cleared', () => {
    const records = makeRecords([
      ['en_0_1', true],
      ['en_1_1', true],
      // missing en_2_1
    ]);
    expect(checkStageUnlocked('en_3_1', records).unlocked).toBe(false);

    const records2 = makeRecords([
      ['en_0_1', true],
      ['en_1_1', true],
      ['en_2_1', true],
    ]);
    expect(checkStageUnlocked('en_3_1', records2).unlocked).toBe(true);
  });

  it('Tier 4 and Tier 5 follow same chain', () => {
    let records: Record<string, StageRecord> = {};
    for (let i = 0; i <= 4; i++) {
      records[`en_${i}_1`] = makeRecord(`en_${i}_1`, true);
    }
    expect(checkStageUnlocked('en_5_1', records).unlocked).toBe(true);

    // Remove Tier 4 — Tier 5 locked
    delete records['en_4_1'];
    expect(checkStageUnlocked('en_5_1', records).unlocked).toBe(false);
  });
});

describe('stageLock — romance/travel unlock', () => {
  it('Romance requires 2 cleared stages', () => {
    const r1 = makeRecords([['en_0_1', true]]);
    expect(checkStageUnlocked('en_d_1', r1).unlocked).toBe(false);

    const r2 = makeRecords([
      ['en_0_1', true],
      ['en_1_1', true],
    ]);
    expect(checkStageUnlocked('en_d_1', r2).unlocked).toBe(true);
  });

  it('Travel requires 3 cleared stages', () => {
    const r2 = makeRecords([
      ['en_0_1', true],
      ['en_1_1', true],
    ]);
    expect(checkStageUnlocked('en_t_1', r2).unlocked).toBe(false);

    const r3 = makeRecords([
      ['en_0_1', true],
      ['en_1_1', true],
      ['en_2_1', true],
    ]);
    expect(checkStageUnlocked('en_t_1', r3).unlocked).toBe(true);
  });

  it('JP romance/travel format detection', () => {
    expect(checkStageUnlocked('jp_d_1', {}).unlocked).toBe(false);
    expect(checkStageUnlocked('jp_t_1', {}).unlocked).toBe(false);
  });
});

describe('stageLock — multi-language', () => {
  it('KR stages unlock independently per language', () => {
    // EN cleared doesn't unlock KR
    const records = makeRecords([['en_0_1', true]]);
    expect(checkStageUnlocked('kr_1_1', records).unlocked).toBe(false);
    // KR cleared doesn't unlock EN
    const records2 = makeRecords([['kr_0_1', true]]);
    expect(checkStageUnlocked('en_1_1', records2).unlocked).toBe(false);
  });

  it('handles unknown stage ID format (allow by default)', () => {
    expect(checkStageUnlocked('unknown_format', {}).unlocked).toBe(true);
  });
});

describe('stageLock — utility functions', () => {
  it('countClearedStages counts cleared only', () => {
    const records = makeRecords([
      ['en_0_1', true],
      ['en_0_2', false],
      ['en_1_1', true],
    ]);
    expect(countClearedStages(records)).toBe(2);
  });

  it('getAllStageLocks returns map', () => {
    const records = makeRecords([['en_0_1', true]]);
    const locks = getAllStageLocks(['en_0_1', 'en_1_1', 'en_2_1'], records);
    expect(locks['en_0_1'].unlocked).toBe(true);
    expect(locks['en_1_1'].unlocked).toBe(true);
    expect(locks['en_2_1'].unlocked).toBe(false);
  });

  it('getNextStageToPlay finds first unlocked but not cleared', () => {
    const records = makeRecords([
      ['en_0_1', true], // cleared, skip
      ['en_0_2', false], // first unlocked+not cleared → return this
    ]);
    expect(getNextStageToPlay(['en_0_1', 'en_0_2'], records)).toBe('en_0_2');
  });

  it('getNextStageToPlay returns null when all cleared or locked', () => {
    // No tier 0 cleared, no tier 1 cleared
    const records = makeRecords([
      ['en_1_1', false], // locked
    ]);
    expect(getNextStageToPlay(['en_1_1'], records)).toBeNull();
  });
});

describe('stageLock — countNewlyUnlocked', () => {
  it('detects newly unlocked stages after clearing', () => {
    const prevRecords = makeRecords([
      ['en_0_1', true],
      // en_1_1 not in prevRecords
    ]);
    const newRecords = makeRecords([
      ['en_0_1', true],
      ['en_1_1', true], // newly cleared
    ]);
    const newly = countNewlyUnlocked(
      ['en_0_1', 'en_1_1', 'en_2_1'],
      prevRecords,
      newRecords
    );
    // en_2_1 unlocks because en_1_1 cleared
    expect(newly).toContain('en_2_1');
    expect(newly).not.toContain('en_0_1'); // was already unlocked
  });

  it('returns empty when nothing new unlocks', () => {
    const records = makeRecords([
      ['en_0_1', true],
      ['en_1_1', true],
    ]);
    const newly = countNewlyUnlocked(
      ['en_0_1', 'en_1_1', 'en_2_1'],
      records,
      records
    );
    expect(newly).toEqual([]);
  });

  it('romance unlocks when total clears >= 2', () => {
    const prev = makeRecords([['en_0_1', true]]);
    const next = makeRecords([
      ['en_0_1', true],
      ['en_1_1', true],
    ]);
    const newly = countNewlyUnlocked(['en_d_1', 'en_0_1', 'en_1_1'], prev, next);
    expect(newly).toContain('en_d_1');
  });
});