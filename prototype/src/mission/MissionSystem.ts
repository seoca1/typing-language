/**
 * Mission System - 미션 평가
 *
 * 자세한 내용: ../../../design/systems/mission.md
 */

import type { MissionConfig, MissionType } from '../types.js';

export interface MissionProgress {
  missionId: string;
  status: 'pending' | 'cleared' | 'failed';
  current: number;
  required: number;
  clearedAt?: number;
}

export interface StageRunStats {
  enemiesDefeated: number;
  totalEnemies: number;
  errors: number;
  comboMax: number;
  comboCurrent: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
  startTime: number;
  clearedTime?: number;
  defeatedEnemies: { category?: string; level: number }[];
  allCompleted: boolean;
}

export function evaluateMission(
  mission: MissionConfig,
  stats: StageRunStats,
): MissionProgress {
  const progress = computeProgress(mission.type, mission.params, stats);

  return {
    missionId: mission.id,
    status: progress >= 1 ? 'cleared' : 'pending',
    current: progress,
    required: 1,
    clearedAt: progress >= 1 ? Date.now() : undefined,
  };
}

function computeProgress(
  type: MissionType,
  params: MissionConfig['params'],
  stats: StageRunStats,
): number {
  switch (type) {
    case 'defeat_count': {
      const required = params.count ?? 1;
      return Math.min(1, stats.enemiesDefeated / required);
    }
    case 'accuracy_threshold': {
      const required = (params.threshold ?? 95) / 100;
      const acc = stats.totalKeystrokes > 0 ? stats.correctKeystrokes / stats.totalKeystrokes : 1;
      return acc >= required ? 1 : acc / required;
    }
    case 'wpm_threshold': {
      const required = params.threshold ?? 30;
      if (!stats.clearedTime) return 0;
      const elapsedMin = (stats.clearedTime - stats.startTime) / 60000;
      const wpm = elapsedMin > 0 ? stats.enemiesDefeated / elapsedMin : 0;
      return wpm >= required ? 1 : wpm / required;
    }
    case 'no_errors': {
      return stats.errors === 0 && stats.enemiesDefeated > 0 ? 1 : 0;
    }
    case 'combo_chain': {
      const required = params.count ?? 10;
      return Math.min(1, stats.comboMax / required);
    }
    case 'time_bonus': {
      const requiredMs = (params.count ?? 30) * 1000;
      if (!stats.clearedTime) return 0;
      const elapsed = stats.clearedTime - stats.startTime;
      return elapsed <= requiredMs ? 1 : 0;
    }
    case 'perfect_run': {
      return stats.allCompleted && stats.errors === 0 ? 1 : 0;
    }
    case 'category_focus': {
      const required = params.count ?? 5;
      const matched = stats.defeatedEnemies.filter((e) => e.category === params.category).length;
      return Math.min(1, matched / required);
    }
    default:
      return 0;
  }
}

export function evaluateAllMissions(
  missions: MissionConfig[],
  stats: StageRunStats,
): MissionProgress[] {
  return missions.map((m) => evaluateMission(m, stats));
}

export function isStageCleared(progresses: MissionProgress[]): boolean {
  return progresses.some((p) => p.status === 'cleared');
}