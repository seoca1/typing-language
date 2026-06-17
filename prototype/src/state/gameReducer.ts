/**
 * Game State (useReducer)
 *
 * ADR-0005 (Draft): React state (useReducer) + Context.
 * 자세한 내용: ../../../decisions/0005-state-management.md
 */

import type {
  Enemy,
  MatchResult,
  MissionConfig,
  PlayerProgress,
  StageConfig,
} from '../types.js';

export type GamePhase = 'menu' | 'stage' | 'result';

export interface GameState {
  phase: GamePhase;
  currentStage: StageConfig | null;
  currentEnemy: Enemy | null;
  buffer: string;
  score: number;
  combo: number;
  comboMax: number;
  wpm: number;
  accuracy: number;
  startTime: number;
  clearedAt?: number;
  enemiesDefeated: number;
  totalErrors: number;
  player: PlayerProgress;
  missions: MissionConfig[];
  missionResults: { missionId: string; cleared: boolean }[];
  romajiHint?: string;
  lastHitCorrect: boolean;
  lastHitCharIndex: number;
  lastHitTime: number;
}

export type GameAction =
  | { type: 'START_STAGE'; stage: StageConfig; enemy: Enemy }
  | { type: 'SET_ENEMY'; enemy: Enemy }
  | { type: 'KEY_INPUT'; result: MatchResult; romajiHint?: string }
  | { type: 'ENEMY_DEFEATED'; nextEnemy: Enemy | null; scoreDelta: number; cleared: boolean }
  | { type: 'END_STAGE'; missions: MissionConfig[]; results: { missionId: string; cleared: boolean }[] }
  | { type: 'BACK_TO_MENU' }
  | { type: 'UPDATE_STATS'; accuracy: number; wpm: number };

export const initialState: GameState = {
  phase: 'menu',
  currentStage: null,
  currentEnemy: null,
  buffer: '',
  score: 0,
  combo: 0,
  comboMax: 0,
  wpm: 0,
  accuracy: 100,
  startTime: 0,
  enemiesDefeated: 0,
  totalErrors: 0,
  player: {
    level: 1,
    totalScore: 0,
    stats: {
      totalEnemiesDefeated: 0,
      totalStagesCleared: 0,
      totalPlayTimeMs: 0,
      bestWpm: { en: 0, jp: 0, es: 0, kr: 0 },
      avgAccuracy: { en: 0, jp: 0, es: 0, kr: 0 },
    },
    unlockedStages: [
      'en_easy_1',
      'en_easy_2',
      'jp_easy_1',
      'jp_easy_2',
      'es_easy_1',
      'es_easy_2',
    ],
    achievements: [],
    stageRecords: {},
  },
  missions: [],
  missionResults: [],
  lastHitCorrect: false,
  lastHitCharIndex: -1,
  lastHitTime: 0,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_STAGE':
      return {
        ...state,
        phase: 'stage',
        currentStage: action.stage,
        currentEnemy: action.enemy,
        buffer: '',
        score: 0,
        combo: 0,
        comboMax: 0,
        wpm: 0,
        accuracy: 100,
        startTime: Date.now(),
        enemiesDefeated: 0,
        totalErrors: 0,
        missions: action.stage.missions,
        missionResults: [],
      };

    case 'SET_ENEMY':
      return { ...state, currentEnemy: action.enemy, buffer: '' };

    case 'KEY_INPUT': {
      const newCombo = action.result.completed ? state.combo + 1 : 0;
      const target = state.currentEnemy?.target.text ?? '';
      const idx = Math.max(0, action.result.buffer.length - 1);
      const correctChar = target[idx];
      const typedChar = action.result.buffer[idx];
      const isCorrect = correctChar !== undefined && typedChar === correctChar;
      return {
        ...state,
        buffer: action.result.buffer,
        accuracy: action.result.accuracy,
        combo: newCombo,
        comboMax: Math.max(state.comboMax, newCombo),
        totalErrors: state.totalErrors + action.result.errors,
        romajiHint: action.romajiHint,
        lastHitCorrect: isCorrect,
        lastHitCharIndex: idx,
        lastHitTime: Date.now(),
      };
    }

    case 'ENEMY_DEFEATED':
      return {
        ...state,
        currentEnemy: action.nextEnemy,
        buffer: '',
        score: state.score + action.scoreDelta,
        enemiesDefeated: state.enemiesDefeated + 1,
        clearedAt: action.cleared ? Date.now() : state.clearedAt,
        combo: 0,
        romajiHint: undefined,
      };

    case 'END_STAGE':
      return {
        ...state,
        phase: 'result',
        missions: action.missions,
        missionResults: action.results,
        player: {
          ...state.player,
          totalScore: state.player.totalScore + state.score,
          stats: {
            ...state.player.stats,
            totalEnemiesDefeated:
              state.player.stats.totalEnemiesDefeated + state.enemiesDefeated,
            totalStagesCleared: state.clearedAt
              ? state.player.stats.totalStagesCleared + 1
              : state.player.stats.totalStagesCleared,
            totalPlayTimeMs:
              state.player.stats.totalPlayTimeMs +
              (state.clearedAt ? state.clearedAt - state.startTime : 0),
          },
        },
      };

    case 'BACK_TO_MENU':
      return { ...initialState, player: state.player };

    case 'UPDATE_STATS':
      return { ...state, accuracy: action.accuracy, wpm: action.wpm };

    default:
      return state;
  }
}