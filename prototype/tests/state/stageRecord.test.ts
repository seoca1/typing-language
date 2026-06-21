/**
 * Stage Record Persistence Tests — Bug Fix
 *
 * Regression test for the bug where clearing a stage did not update
 * `state.player.stageRecords`, causing the Menu to not show ✓/stars
 * and the tier-based lock chain to remain unchanged.
 */

import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../../src/state/gameReducer.js';

describe('Stage record persistence on clear', () => {
  it('UPDATE_STAGE_RECORD action adds new stage record', () => {
    const newState = gameReducer(initialState, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 100,
      wpm: 45,
      accuracy: 92,
    });

    expect(newState.player.stageRecords['en_1_1']).toBeDefined();
    expect(newState.player.stageRecords['en_1_1'].cleared).toBe(true);
    expect(newState.player.stageRecords['en_1_1'].stars).toBe(2);
    expect(newState.player.stageRecords['en_1_1'].bestScore).toBe(100);
  });

  it('Star calculation: 3 stars = 95%+ accuracy AND 60+ WPM', () => {
    const newState = gameReducer(initialState, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 200,
      wpm: 65,
      accuracy: 96,
    });
    expect(newState.player.stageRecords['en_1_1'].stars).toBe(3);
  });

  it('Star calculation: 2 stars = 90%+ accuracy AND 40+ WPM', () => {
    const newState = gameReducer(initialState, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 150,
      wpm: 45,
      accuracy: 91,
    });
    expect(newState.player.stageRecords['en_1_1'].stars).toBe(2);
  });

  it('Star calculation: 1 star = 80%+ accuracy AND 20+ WPM', () => {
    const newState = gameReducer(initialState, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 80,
      wpm: 25,
      accuracy: 85,
    });
    expect(newState.player.stageRecords['en_1_1'].stars).toBe(1);
  });

  it('Star calculation: 0 stars = low accuracy/WPM', () => {
    const newState = gameReducer(initialState, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 50,
      wpm: 10,
      accuracy: 60,
    });
    expect(newState.player.stageRecords['en_1_1'].stars).toBe(0);
  });

  it('Updates existing record with higher score', () => {
    let state = gameReducer(initialState, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 100,
      wpm: 30,
      accuracy: 90,
    });
    expect(state.player.stageRecords['en_1_1'].bestScore).toBe(100);
    expect(state.player.stageRecords['en_1_1'].playCount).toBe(1);

    // Replay with higher score
    state = gameReducer(state, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 200,
      wpm: 40,
      accuracy: 95,
    });
    expect(state.player.stageRecords['en_1_1'].bestScore).toBe(200);
    expect(state.player.stageRecords['en_1_1'].playCount).toBe(2);
    expect(state.player.stageRecords['en_1_1'].stars).toBe(2); // wpm=40, acc=95
  });

  it('Preserves best score when replayed with lower score', () => {
    let state = gameReducer(initialState, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 200,
      wpm: 50,
      accuracy: 95,
    });
    state = gameReducer(state, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 100,
      wpm: 30,
      accuracy: 80,
    });
    expect(state.player.stageRecords['en_1_1'].bestScore).toBe(200);
    expect(state.player.stageRecords['en_1_1'].bestWpm).toBe(50);
  });

  it('Multiple stages can be tracked independently', () => {
    let state = gameReducer(initialState, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 100,
      wpm: 30,
      accuracy: 90,
    });
    state = gameReducer(state, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_2',
      score: 150,
      wpm: 40,
      accuracy: 95,
    });
    expect(Object.keys(state.player.stageRecords)).toHaveLength(2);
    expect(state.player.stageRecords['en_1_1'].cleared).toBe(true);
    expect(state.player.stageRecords['en_1_2'].cleared).toBe(true);
  });

  it('END_STAGE + UPDATE_STAGE_RECORD combined clear flow', () => {
    // Start a stage
    let state = gameReducer(initialState, {
      type: 'START_STAGE',
      stage: {
        id: 'en_1_1',
        language: 'en',
        name: 'First Words',
        description: '',
        difficulty: 1,
        wordCount: 5,
        corpusFilter: {},
        missions: [],
      },
      enemy: {
        id: 'e1',
        target: { text: 'hello', acceptedInputs: ['hello'], level: 1 },
        hp: 0,
        maxHp: 100,
        spawnTime: 0,
      },
    });
    expect(state.phase).toBe('stage');

    // Clear stage
    state = gameReducer(
      { ...state, score: 100, enemiesDefeated: 5, accuracy: 95, wpm: 65, clearedAt: Date.now() },
      { type: 'END_STAGE', missions: [], results: [] }
    );
    expect(state.phase).toBe('result');
    expect(state.player.stats.totalStagesCleared).toBe(1);

    // Now persist the stage record
    state = gameReducer(state, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 100,
      wpm: 65,
      accuracy: 95,
    });
    expect(state.player.stageRecords['en_1_1']).toBeDefined();
    expect(state.player.stageRecords['en_1_1'].cleared).toBe(true);
    expect(state.player.stageRecords['en_1_1'].stars).toBe(3);
    expect(state.player.stageRecords['en_1_1'].playCount).toBe(1);
  });

  it('Does not affect other player stats (level, totalScore)', () => {
    let state = gameReducer(initialState, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_1',
      score: 100,
      wpm: 30,
      accuracy: 90,
    });
    const beforeLevel = state.player.level;
    const beforeScore = state.player.totalScore;
    state = gameReducer(state, {
      type: 'UPDATE_STAGE_RECORD',
      stageId: 'en_1_2',
      score: 150,
      wpm: 40,
      accuracy: 95,
    });
    expect(state.player.level).toBe(beforeLevel);
    expect(state.player.totalScore).toBe(beforeScore);
  });
});