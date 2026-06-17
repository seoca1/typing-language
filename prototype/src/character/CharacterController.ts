/**
 * Character Controller - 상태 머신 + 이벤트 구독
 *
 * 격파/콤보/스테이지 이벤트에 반응해 포즈, 모드, 입 애니메이션을 갱신.
 */

import {
  DEFAULT_APPEARANCE,
  STAGE_PROGRESSION,
  appearanceForLanguage,
  moodForState,
  type Accessory,
  type CharacterStage,
  type CulturalAppearance,
  type LanguageKey,
  type Mood,
  type PoseName,
  type Prop,
} from './CharacterData.js';

export interface CharacterState {
  appearance: CulturalAppearance;
  language: LanguageKey;
  stage: CharacterStage;
  pose: PoseName;
  poseStart: number;
  mood: Mood;
  /** 말하기 시작 시간 (입 애니메이션) */
  speechStart: number;
  /** 누적 격파 수 (현재 스테이지 내) */
  enemiesDefeated: number;
  /** 누적 스테이지 클리어 수 → 캐릭터 레벨 */
  totalStagesCleared: number;
  /** 직전 콤보 */
  lastCombo: number;
}

export function createInitialCharacterState(): CharacterState {
  return {
    appearance: DEFAULT_APPEARANCE,
    language: 'en',
    stage: STAGE_PROGRESSION[0],
    pose: 'idle',
    poseStart: performance.now(),
    mood: 'neutral',
    speechStart: 0,
    enemiesDefeated: 0,
    totalStagesCleared: 0,
    lastCombo: 0,
  };
}

export function applyLanguageChange(s: CharacterState, lang: LanguageKey): void {
  s.language = lang;
  s.appearance = appearanceForLanguage(lang);
}

export interface CharacterEvents {
  /** 키를 정확히 입력했을 때 (입만 살짝 움직이는 작은 반응) */
  onCorrectKeystroke(): void;
  /** 적 격파 */
  onEnemyDefeated(combo: number, isPerfect: boolean): void;
  /** 콤보 갱신 */
  onComboUpdate(combo: number): void;
  /** 스테이지 클리어 → 다음 캐릭터 레벨로 진화 */
  onStageCleared(): void;
  /** 게임 시작/리셋 시 호출 */
  resetForNewStage(keepStageLevel: boolean): void;
}

export function applyCorrectKeystroke(s: CharacterState, now: number): void {
  s.speechStart = now;
}

export function applyEnemyDefeated(
  s: CharacterState,
  combo: number,
  isPerfect: boolean,
  now: number,
): void {
  s.enemiesDefeated += 1;
  s.lastCombo = combo;
  s.mood = moodForState(combo, s.enemiesDefeated, isPerfect);
  s.speechStart = now;

  if (isPerfect) {
    s.pose = 'clap';
    s.poseStart = now;
    return;
  }
  if (combo >= 10) {
    s.pose = 'spin';
    s.poseStart = now;
    return;
  }
  if (combo >= 5) {
    s.pose = 'jump';
    s.poseStart = now;
    return;
  }
  if (combo >= 3) {
    s.pose = 'wave';
    s.poseStart = now;
    return;
  }
  s.pose = 'wave';
  s.poseStart = now;
}

export function applyComboUpdate(s: CharacterState, combo: number): void {
  s.lastCombo = combo;
  s.mood = moodForState(combo, s.enemiesDefeated, false);
}

export function applyStageCleared(s: CharacterState, now: number): void {
  s.totalStagesCleared += 1;
  const idx = Math.min(s.totalStagesCleared, STAGE_PROGRESSION.length - 1);
  s.stage = STAGE_PROGRESSION[idx];
  s.pose = 'dance';
  s.poseStart = now;
  s.mood = 'triumphant';
}

export function resetForNewStage(s: CharacterState): void {
  s.pose = 'idle';
  s.poseStart = performance.now();
  s.mood = 'neutral';
  s.speechStart = 0;
  s.enemiesDefeated = 0;
  s.lastCombo = 0;
}

export function tickPose(s: CharacterState, now: number): void {
  if (s.pose === 'idle') return;
  const dur = getPoseDuration(s.pose);
  if (now - s.poseStart >= dur) {
    s.pose = 'idle';
    s.poseStart = now;
  }
}

function getPoseDuration(pose: PoseName): number {
  switch (pose) {
    case 'idle':
      return Infinity;
    case 'wave':
      return 900;
    case 'clap':
      return 800;
    case 'jump':
      return 700;
    case 'spin':
      return 1400;
    case 'dance':
      return 3000;
    case 'pose':
      return 1800;
  }
}

export function hasAccessory(s: CharacterState, acc: Accessory): boolean {
  return s.stage.accessories.includes(acc);
}

export function hasProp(s: CharacterState, prop: Prop): boolean {
  return s.stage.props.includes(prop);
}