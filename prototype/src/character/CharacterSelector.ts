/**
 * Character Selector - 언어별 캐릭터 자동 선택
 *
 * 스테이지 언어에 따라 적절한 캐릭터를 자동으로 선택합니다.
 * 사용자가 캐릭터를 선택하지 않은 경우, 언어별 3명 중 한 명이
 * 스테이지 ID 기반 deterministic random으로 선택됩니다.
 *
 * Selection modes:
 * 1. **Manual** (setCharacter 호출) — 사용자 선택 우선
 * 2. **Random default** (selectCharacterForStage) — 언어별 3명 중 random
 * 3. **Fixed default** (getCharacterForLanguage) — 언어별 1명 고정
 */

import type { Language } from '../types.js';
import {
  getCharacterForLanguage,
  LANGUAGE_CHARACTERS,
  USE_EXTERNAL_IMAGES,
} from '../config/characterImages.js';

/**
 * 현재 선택된 캐릭터 ID
 * null이면 자동 선택 (random default 또는 fixed default)
 */
let currentCharacterId: string | null = null;

/**
 * 사용자가 명시적으로 캐릭터를 선택했는지 여부
 * true면 어떤 random/default도 무시하고 사용자 선택 유지
 */
let userHasSelected: boolean = false;

/**
 * 언어에 맞는 캐릭터 선택 (legacy — 항상 언어별 default 반환)
 */
export function selectCharacterForLanguage(language: Language): string {
  if (!USE_EXTERNAL_IMAGES) {
    return 'default';
  }

  const characterId = getCharacterForLanguage(language);
  currentCharacterId = characterId;
  userHasSelected = false;

  console.log(`[CharacterSelector] Language: ${language} → Default: ${characterId}`);

  return characterId;
}

/**
 * 스테이지 진입 시 캐릭터 선택
 *
 * 우선순위:
 * 1. 사용자가 명시적으로 선택한 캐릭터 (있으면 그대로)
 * 2. 스테이지 ID 기반 random 캐릭터 (deterministic — 같은 stage는 같은 캐릭터)
 * 3. 언어별 default
 *
 * @param language - 스테이지 언어
 * @param stageId - 스테이지 ID (random seed로 사용)
 * @returns 선택된 캐릭터 ID
 */
export function selectCharacterForStage(
  language: Language,
  stageId: string,
): string {
  if (!USE_EXTERNAL_IMAGES) {
    return 'default';
  }

  // 1. User-selected takes priority
  if (userHasSelected && currentCharacterId) {
    console.log(
      `[CharacterSelector] Stage ${stageId}: Using user-selected ${currentCharacterId}`
    );
    return currentCharacterId;
  }

  // 2. Random selection from language's 3 characters
  const languageChars = LANGUAGE_CHARACTERS[language];
  if (languageChars && languageChars.length > 0) {
    const randomIndex = hashStringToIndex(stageId, languageChars.length);
    const characterId = languageChars[randomIndex];
    currentCharacterId = characterId;
    console.log(
      `[CharacterSelector] Stage ${stageId}: Random from ${language} (${randomIndex + 1}/${languageChars.length}) → ${characterId}`
    );
    return characterId;
  }

  // 3. Fallback to language default
  return selectCharacterForLanguage(language);
}

/**
 * 현재 캐릭터 ID 가져오기
 */
export function getCurrentCharacter(): string | null {
  return currentCharacterId;
}

/**
 * 사용자가 캐릭터를 명시적으로 선택했는지 여부
 */
export function hasUserSelectedCharacter(): boolean {
  return userHasSelected;
}

/**
 * 캐릭터 강제 설정 (사용자 선택용)
 *
 * 호출 후 hasUserSelectedCharacter()는 true 반환.
 * selectCharacterForStage()는 이 선택을 우선 사용.
 */
export function setCharacter(characterId: string): void {
  currentCharacterId = characterId;
  userHasSelected = true;
  console.log(`[CharacterSelector] Character manually set: ${characterId}`);
}

/**
 * 사용자 선택 해제 (다음 스테이지에서 random)
 */
export function clearUserSelection(): void {
  userHasSelected = false;
  currentCharacterId = null;
  console.log('[CharacterSelector] User selection cleared');
}

/**
 * Random 시드 리셋 (테스트용)
 */
export function resetCharacterSelector(): void {
  currentCharacterId = null;
  userHasSelected = false;
}

/**
 * 문자열을 0..(modulus-1) 범위 정수로 해시
 *
 * FNV-1a 변형 (간단하고 deterministic):
 * - 같은 입력은 항상 같은 출력
 * - 다른 입력은 다른 출력 (충돌 가능하지만 분포 양호)
 *
 * @param input - 해시할 문자열 (stage ID)
 * @param modulus - 출력 범위 (0 ~ modulus-1)
 */
function hashStringToIndex(input: string, modulus: number): number {
  if (modulus <= 0) return 0;

  // FNV-1a 32-bit hash
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime, force unsigned
  }

  return hash % modulus;
}
