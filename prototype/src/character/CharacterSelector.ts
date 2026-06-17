/**
 * Character Selector - 언어별 캐릭터 자동 선택
 * 
 * 스테이지 언어에 따라 적절한 캐릭터를 자동으로 선택합니다.
 */

import type { Language } from '../types.js';
import { 
  getCharacterForLanguage,
  USE_EXTERNAL_IMAGES,
} from '../config/characterImages.js';

/**
 * 현재 선택된 캐릭터 ID
 */
let currentCharacterId: string | null = null;

/**
 * 언어에 맞는 캐릭터 선택
 */
export function selectCharacterForLanguage(language: Language): string {
  if (!USE_EXTERNAL_IMAGES) {
    // 외부 이미지 비활성화 시 기본 렌더링
    return 'default';
  }
  
  const characterId = getCharacterForLanguage(language);
  currentCharacterId = characterId;
  
  console.log(`[CharacterSelector] Language: ${language} → Character: ${characterId}`);
  
  return characterId;
}

/**
 * 현재 캐릭터 ID 가져오기
 */
export function getCurrentCharacter(): string | null {
  return currentCharacterId;
}

/**
 * 캐릭터 강제 설정 (사용자 선택용)
 */
export function setCharacter(characterId: string): void {
  currentCharacterId = characterId;
  console.log(`[CharacterSelector] Character manually set: ${characterId}`);
}
