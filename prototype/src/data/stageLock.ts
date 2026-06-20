/**
 * Stage Lock Logic
 *
 * Determines which stages are unlocked based on previous tier completion.
 *
 * Unlock chain:
 * - Tier 0: always unlocked (foundational)
 * - Tier 1: unlocked after clearing any Tier 0 stage
 * - Tier 2: unlocked after clearing any Tier 1 stage
 * - Tier 3: unlocked after clearing any Tier 2 stage
 * - Tier 4: unlocked after clearing any Tier 3 stage
 * - Tier 5: unlocked after clearing any Tier 4 stage
 *
 * Romance/Travel stages use a special unlock pattern:
 * - Romance (d): unlocked after clearing at least 2 stages of any earlier tier
 * - Travel (t): unlocked after clearing at least 3 stages of any earlier tier
 */

import type { StageTier } from '../data/stages.js';
import type { StageRecord } from '../types.js';
import { SAMPLE_STAGES } from '../data/stages.js';

/** Romance/Travel special unlock thresholds */
const ROMANCE_MIN_CLEARS = 2;
const TRAVEL_MIN_CLEARS = 3;

/**
 * Pre-computed: which tiers exist for each language (from SAMPLE_STAGES).
 * Used to detect languages without Tier 0 (EN, ES, KR).
 *
 * Examples:
 * - EN: {1, 2, 3, 4, 5} — no Tier 0
 * - JP: {0, 1, 2, 3, 4, 5} — full range
 * - ES: {1, 2, 3, 4, 5} — no Tier 0
 * - KR: {1, 2, 3, 4, 5} — no Tier 0
 */
const ALL_LANGUAGES_TIERS: Record<string, Set<number>> = (() => {
  const map: Record<string, Set<number>> = {};
  for (const stage of SAMPLE_STAGES) {
    const m = stage.id.match(/_(\d+)_\d+$/);
    if (!m) continue;
    if (!map[stage.language]) map[stage.language] = new Set();
    map[stage.language].add(parseInt(m[1], 10));
  }
  return map;
})();

export interface StageLockInfo {
  /** Is this stage unlocked? */
  unlocked: boolean;
  /** Human-readable reason if locked */
  reason?: string;
  /** Stage IDs required to unlock (if locked) */
  requires?: string[];
}

/**
 * Count cleared stages across all tiers for a given language.
 */
export function countClearedStages(
  stageRecords: Record<string, StageRecord>
): number {
  return Object.values(stageRecords).filter((r) => r.cleared).length;
}

/**
 * Check if a stage is unlocked.
 *
 * @param stageId - The stage ID to check (e.g., "en_2_1")
 * @param stageRecords - All stage records from the profile
 * @returns Lock info with unlocked status and reason
 */
export function checkStageUnlocked(
  stageId: string,
  stageRecords: Record<string, StageRecord>
): StageLockInfo {
  // Romance (d) and Travel (t) special handling
  if (stageId.includes('_d_') || stageId.endsWith('_d')) {
    const cleared = countClearedStages(stageRecords);
    if (cleared < ROMANCE_MIN_CLEARS) {
      return {
        unlocked: false,
        reason: `🔒 Locked · Clear ${ROMANCE_MIN_CLEARS} stages to unlock romance (${cleared}/${ROMANCE_MIN_CLEARS})`,
        requires: [],
      };
    }
    return { unlocked: true };
  }
  if (stageId.includes('_t_') || stageId.endsWith('_t')) {
    const cleared = countClearedStages(stageRecords);
    if (cleared < TRAVEL_MIN_CLEARS) {
      return {
        unlocked: false,
        reason: `🔒 Locked · Clear ${TRAVEL_MIN_CLEARS} stages to unlock travel (${cleared}/${TRAVEL_MIN_CLEARS})`,
        requires: [],
      };
    }
    return { unlocked: true };
  }

  // Tier-based unlock (main progression)
  // e.g., en_0_X → tier 0, en_1_X → tier 1, etc.
  const tierMatch = stageId.match(/_(\d+)_\d+$/);
  if (!tierMatch) {
    // Unknown format — allow by default
    return { unlocked: true };
  }

  const currentTier = parseInt(tierMatch[1], 10);

  // Tier 0 always unlocked
  if (currentTier === 0) {
    return { unlocked: true };
  }

  // Tier N requires any Tier N-1 cleared (in the SAME language)
  // Extract language prefix (e.g., "en" from "en_0_1")
  const langPrefix = stageId.split('_')[0];
  const prevTier = currentTier - 1;

  // Check if prevTier actually exists for this language by scanning
  // ALL_STAGES (the full stage definitions). If no stage exists at
  // prevTier for this language (e.g., EN/ES/KR have no Tier 0),
  // then this tier is the lowest and auto-unlocked.
  // NOTE: This requires `langPrefix` to match a real language.
  const prevTierHasStages = ALL_LANGUAGES_TIERS[langPrefix]?.has(prevTier) ?? true;

  if (!prevTierHasStages) {
    // No stages exist at prevTier for this language → auto-unlocked
    return { unlocked: true };
  }

  const prevTierCleared = Object.entries(stageRecords).some(
    ([id, record]) => {
      if (!record.cleared) return false;
      if (!id.startsWith(`${langPrefix}_`)) return false;
      const m = id.match(/_(\d+)_\d+$/);
      return m && parseInt(m[1], 10) === prevTier;
    }
  );

  if (!prevTierCleared) {
    const safePrevTier = Math.max(0, Math.min(5, prevTier)) as StageTier;
    const exampleStageId = findFirstStageOfTier(safePrevTier, stageRecords);
    // Build example requirement (e.g., "en_1_1") for clearer instruction
    const exampleHint = exampleStageId ? ` (e.g., ${exampleStageId})` : '';
    return {
      unlocked: false,
      reason: `🔒 Locked · Clear any Tier ${prevTier} stage first${exampleHint}`,
      requires: exampleStageId ? [exampleStageId] : [],
    };
  }

  return { unlocked: true };
}

/**
 * Find the first stage ID of a given tier from the records.
 * (Useful for telling user which stage to clear.)
 */
function findFirstStageOfTier(
  tier: StageTier,
  stageRecords: Record<string, StageRecord>
): string | null {
  for (const id of Object.keys(stageRecords)) {
    const m = id.match(/_(\d+)_\d+$/);
    if (m && parseInt(m[1], 10) === tier) {
      return id;
    }
  }
  return null;
}

/**
 * Check all stages at once, returning a map of stageId → lock info.
 */
export function getAllStageLocks(
  stageIds: string[],
  stageRecords: Record<string, StageRecord>
): Record<string, StageLockInfo> {
  const result: Record<string, StageLockInfo> = {};
  for (const id of stageIds) {
    result[id] = checkStageUnlocked(id, stageRecords);
  }
  return result;
}

/**
 * Get the next stage to play (first unlocked but not cleared stage).
 */
export function getNextStageToPlay(
  stageIds: string[],
  stageRecords: Record<string, StageRecord>
): string | null {
  for (const id of stageIds) {
    const lock = checkStageUnlocked(id, stageRecords);
    if (lock.unlocked && !stageRecords[id]?.cleared) {
      return id;
    }
  }
  return null;
}

/**
 * Count newly unlocked stages after clearing a stage.
 * Used for showing "X new stages unlocked!" notification.
 */
export function countNewlyUnlocked(
  allStageIds: string[],
  prevRecords: Record<string, StageRecord>,
  newRecords: Record<string, StageRecord>
): string[] {
  const newlyUnlocked: string[] = [];
  for (const id of allStageIds) {
    const wasLocked = !checkStageUnlocked(id, prevRecords).unlocked;
    const isUnlocked = checkStageUnlocked(id, newRecords).unlocked;
    if (wasLocked && isUnlocked) {
      newlyUnlocked.push(id);
    }
  }
  return newlyUnlocked;
}