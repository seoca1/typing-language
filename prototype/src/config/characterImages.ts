/**
 * Character Image Configuration
 *
 * Define external images for characters (anime, photos, etc.)
 * Place your images in public/characters/ folder
 */

import type { ImageConfig } from '../sprites/ImageLoader.js';

export interface CharacterImageSet {
  idle: ImageConfig;
  wave?: ImageConfig;
  jump?: ImageConfig;
  clap?: ImageConfig;
  spin?: ImageConfig;
  dance?: ImageConfig;
  pose?: ImageConfig;
}

/**
 * Character image collections - 언어별 3명씩
 *
 * 이미지 생성 방법: AI_CHARACTER_PROMPTS.md 참조
 *
 * 파일 구조:
 * public/characters/
 *   ├── en/ (영어)
 *   │   ├── emily/
 *   │   ├── oliver/
 *   │   └── sophia/
 *   ├── jp/ (일본어)
 *   │   ├── sakura/
 *   │   ├── yuki/
 *   │   └── kaito/
 *   ├── es/ (스페인어)
 *   │   ├── isabella/
 *   │   ├── carlos/
 *   │   └── luna/
 *   └── kr/ (한국어)
 *       ├── hana/
 *       ├── minho/
 *       └── jiwoo/
 */

export const CHARACTER_IMAGES: Record<string, CharacterImageSet> = {
  // ===== 영어 캐릭터 (EN) =====

  // Emily - Modern American Girl (현대 미국 소녀)
  'en-emily': {
    idle: {
      src: '/typing-language/characters/en/emily/1-idle.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    wave: {
      src: '/typing-language/characters/en/emily/2-wave.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    jump: {
      src: '/typing-language/characters/en/emily/3-jump.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    clap: {
      src: '/typing-language/characters/en/emily/4-clap.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    spin: {
      src: '/typing-language/characters/en/emily/5-spin.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    dance: {
      src: '/typing-language/characters/en/emily/6-dance.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    pose: {
      src: '/typing-language/characters/en/emily/7-pose.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
  },

  // Oliver - British Gentleman Style (영국 신사 스타일)
  'en-oliver': {
    idle: {
      src: '/typing-language/characters/en/oliver/1-idle.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    wave: {
      src: '/typing-language/characters/en/oliver/2-wave.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    jump: {
      src: '/typing-language/characters/en/oliver/3-jump.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    clap: {
      src: '/typing-language/characters/en/oliver/4-clap.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    spin: {
      src: '/typing-language/characters/en/oliver/5-spin.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    dance: {
      src: '/typing-language/characters/en/oliver/6-dance.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    pose: {
      src: '/typing-language/characters/en/oliver/7-pose.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
  },

  // Sophia - Tech-savvy Modern Girl (기술 소녀)
  'en-sophia': {
    idle: {
      src: '/typing-language/characters/en/sophia/1-idle.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    wave: {
      src: '/typing-language/characters/en/sophia/2-wave.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    jump: {
      src: '/typing-language/characters/en/sophia/3-jump.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    clap: {
      src: '/typing-language/characters/en/sophia/4-clap.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    spin: {
      src: '/typing-language/characters/en/sophia/5-spin.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    dance: {
      src: '/typing-language/characters/en/sophia/6-dance.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    pose: {
      src: '/typing-language/characters/en/sophia/7-pose.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
  },

  // ===== 일본어 캐릭터 (JP) =====

  // Sakura - Traditional Japanese Girl (전통 일본 소녀)
  'jp-sakura': {
    idle: {
      src: '/typing-language/characters/jp/sakura/1-idle.png',
      width: 310,
      height: 430,
      scale: 0.8,
      offsetY: -65,
    },
    wave: {
      src: '/typing-language/characters/jp/sakura/2-wave.png',
      width: 310,
      height: 430,
      scale: 0.8,
      offsetY: -65,
    },
    jump: {
      src: '/typing-language/characters/jp/sakura/3-jump.png',
      width: 310,
      height: 430,
      scale: 0.8,
      offsetY: -75,
    },
    clap: {
      src: '/typing-language/characters/jp/sakura/4-clap.png',
      width: 310,
      height: 430,
      scale: 0.8,
      offsetY: -65,
    },
    spin: {
      src: '/typing-language/characters/jp/sakura/5-spin.png',
      width: 320,
      height: 440,
      scale: 0.8,
      offsetY: -70,
    },
    dance: {
      src: '/typing-language/characters/jp/sakura/6-dance.png',
      width: 330,
      height: 450,
      scale: 0.8,
      offsetY: -75,
    },
    pose: {
      src: '/typing-language/characters/jp/sakura/7-pose.png',
      width: 320,
      height: 440,
      scale: 0.8,
      offsetY: -70,
    },
  },

  // Yuki - Modern Japanese School Girl (현대 일본 여학생)
  'jp-yuki': {
    idle: {
      src: '/typing-language/characters/jp/yuki/1-idle.png',
      width: 280,
      height: 400,
      scale: 0.9,
      offsetY: -55,
    },
    wave: {
      src: '/typing-language/characters/jp/yuki/2-wave.png',
      width: 280,
      height: 400,
      scale: 0.9,
      offsetY: -55,
    },
    jump: {
      src: '/typing-language/characters/jp/yuki/3-jump.png',
      width: 280,
      height: 420,
      scale: 0.9,
      offsetY: -65,
    },
    clap: {
      src: '/typing-language/characters/jp/yuki/4-clap.png',
      width: 280,
      height: 400,
      scale: 0.9,
      offsetY: -55,
    },
    spin: {
      src: '/typing-language/characters/jp/yuki/5-spin.png',
      width: 290,
      height: 410,
      scale: 0.9,
      offsetY: -60,
    },
    dance: {
      src: '/typing-language/characters/jp/yuki/6-dance.png',
      width: 290,
      height: 410,
      scale: 0.9,
      offsetY: -65,
    },
    pose: {
      src: '/typing-language/characters/jp/yuki/7-pose.png',
      width: 280,
      height: 400,
      scale: 0.9,
      offsetY: -55,
    },
  },

  // Kaito - Cool Japanese Boy (쿨한 일본 남학생)
  'jp-kaito': {
    idle: {
      src: '/typing-language/characters/jp/kaito/1-idle.png',
      width: 290,
      height: 410,
      scale: 0.85,
      offsetY: -58,
    },
    wave: {
      src: '/typing-language/characters/jp/kaito/2-wave.png',
      width: 290,
      height: 410,
      scale: 0.85,
      offsetY: -58,
    },
    jump: {
      src: '/typing-language/characters/jp/kaito/3-jump.png',
      width: 290,
      height: 420,
      scale: 0.85,
      offsetY: -68,
    },
    clap: {
      src: '/typing-language/characters/jp/kaito/4-clap.png',
      width: 290,
      height: 410,
      scale: 0.85,
      offsetY: -58,
    },
    spin: {
      src: '/typing-language/characters/jp/kaito/5-spin.png',
      width: 300,
      height: 420,
      scale: 0.85,
      offsetY: -63,
    },
    dance: {
      src: '/typing-language/characters/jp/kaito/6-dance.png',
      width: 300,
      height: 420,
      scale: 0.85,
      offsetY: -68,
    },
    pose: {
      src: '/typing-language/characters/jp/kaito/7-pose.png',
      width: 290,
      height: 410,
      scale: 0.85,
      offsetY: -58,
    },
  },

  // ===== 스페인어 캐릭터 (ES) =====

  // Isabella - Flamenco Dancer (플라멩코 댄서)
  'es-isabella': {
    idle: {
      src: '/typing-language/characters/es/isabella/1-idle.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    wave: {
      src: '/typing-language/characters/es/isabella/2-wave.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    jump: {
      src: '/typing-language/characters/es/isabella/3-jump.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    clap: {
      src: '/typing-language/characters/es/isabella/4-clap.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    spin: {
      src: '/typing-language/characters/es/isabella/5-spin.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    dance: {
      src: '/typing-language/characters/es/isabella/6-dance.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    pose: {
      src: '/typing-language/characters/es/isabella/7-pose.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
  },

  // Carlos - Modern Spanish Youth (현대 스페인 청년)
  'es-carlos': {
    idle: {
      src: '/typing-language/characters/es/carlos/1-idle.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    wave: {
      src: '/typing-language/characters/es/carlos/2-wave.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    jump: {
      src: '/typing-language/characters/es/carlos/3-jump.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    clap: {
      src: '/typing-language/characters/es/carlos/4-clap.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    spin: {
      src: '/typing-language/characters/es/carlos/5-spin.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    dance: {
      src: '/typing-language/characters/es/carlos/6-dance.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    pose: {
      src: '/typing-language/characters/es/carlos/7-pose.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
  },

  // Luna - Barcelona Artist (바르셀로나 예술가)
  'es-luna': {
    idle: {
      src: '/typing-language/characters/es/luna/1-idle.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    wave: {
      src: '/typing-language/characters/es/luna/2-wave.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    jump: {
      src: '/typing-language/characters/es/luna/3-jump.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    clap: {
      src: '/typing-language/characters/es/luna/4-clap.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    spin: {
      src: '/typing-language/characters/es/luna/5-spin.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
    dance: {
      src: '/typing-language/characters/es/luna/6-dance.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -70,
    },
    pose: {
      src: '/typing-language/characters/es/luna/7-pose.png',
      width: 300,
      height: 450,
      scale: 0.85,
      offsetY: -60,
    },
  },

  // ===== 한국어 캐릭터 (KR) =====

  // Hana - Traditional Hanbok Girl (전통 한복 소녀)
  'kr-hana': {
    idle: {
      src: '/typing-language/characters/kr/hana/1-idle.png',
      width: 320,
      height: 440,
      scale: 0.8,
      offsetY: -68,
    },
    wave: {
      src: '/typing-language/characters/kr/hana/2-wave.png',
      width: 320,
      height: 440,
      scale: 0.8,
      offsetY: -68,
    },
    jump: {
      src: '/typing-language/characters/kr/hana/3-jump.png',
      width: 320,
      height: 450,
      scale: 0.8,
      offsetY: -75,
    },
    clap: {
      src: '/typing-language/characters/kr/hana/4-clap.png',
      width: 320,
      height: 440,
      scale: 0.8,
      offsetY: -68,
    },
    spin: {
      src: '/typing-language/characters/kr/hana/5-spin.png',
      width: 330,
      height: 450,
      scale: 0.8,
      offsetY: -73,
    },
    dance: {
      src: '/typing-language/characters/kr/hana/6-dance.png',
      width: 340,
      height: 460,
      scale: 0.8,
      offsetY: -78,
    },
    pose: {
      src: '/typing-language/characters/kr/hana/7-pose.png',
      width: 330,
      height: 450,
      scale: 0.8,
      offsetY: -73,
    },
  },

  // Minho - K-pop Idol Style (K-pop 아이돌)
  'kr-minho': {
    idle: {
      src: '/typing-language/characters/kr/minho/1-idle.png',
      width: 290,
      height: 410,
      scale: 0.85,
      offsetY: -58,
    },
    wave: {
      src: '/typing-language/characters/kr/minho/2-wave.png',
      width: 290,
      height: 410,
      scale: 0.85,
      offsetY: -58,
    },
    jump: {
      src: '/typing-language/characters/kr/minho/3-jump.png',
      width: 290,
      height: 420,
      scale: 0.85,
      offsetY: -68,
    },
    clap: {
      src: '/typing-language/characters/kr/minho/4-clap.png',
      width: 290,
      height: 410,
      scale: 0.85,
      offsetY: -58,
    },
    spin: {
      src: '/typing-language/characters/kr/minho/5-spin.png',
      width: 300,
      height: 420,
      scale: 0.85,
      offsetY: -63,
    },
    dance: {
      src: '/typing-language/characters/kr/minho/6-dance.png',
      width: 310,
      height: 430,
      scale: 0.85,
      offsetY: -68,
    },
    pose: {
      src: '/typing-language/characters/kr/minho/7-pose.png',
      width: 290,
      height: 410,
      scale: 0.85,
      offsetY: -58,
    },
  },

  // Jiwoo - Modern Korean Gamer Girl (게이머 소녀)
  'kr-jiwoo': {
    idle: {
      src: '/typing-language/characters/kr/jiwoo/1-idle.png',
      width: 280,
      height: 400,
      scale: 0.9,
      offsetY: -55,
    },
    wave: {
      src: '/typing-language/characters/kr/jiwoo/2-wave.png',
      width: 280,
      height: 400,
      scale: 0.9,
      offsetY: -55,
    },
    jump: {
      src: '/typing-language/characters/kr/jiwoo/3-jump.png',
      width: 280,
      height: 420,
      scale: 0.9,
      offsetY: -65,
    },
    clap: {
      src: '/typing-language/characters/kr/jiwoo/4-clap.png',
      width: 280,
      height: 400,
      scale: 0.9,
      offsetY: -55,
    },
    spin: {
      src: '/typing-language/characters/kr/jiwoo/5-spin.png',
      width: 290,
      height: 410,
      scale: 0.9,
      offsetY: -60,
    },
    dance: {
      src: '/typing-language/characters/kr/jiwoo/6-dance.png',
      width: 290,
      height: 410,
      scale: 0.9,
      offsetY: -65,
    },
    pose: {
      src: '/typing-language/characters/kr/jiwoo/7-pose.png',
      width: 280,
      height: 400,
      scale: 0.9,
      offsetY: -55,
    },
  },
};

/**
 * 언어별 기본 캐릭터 매핑
 */
export const LANGUAGE_DEFAULT_CHARACTERS: Record<string, string> = {
  'en': 'en-emily',      // 영어 → Emily
  'jp': 'jp-sakura',     // 일본어 → Sakura
  'es': 'es-isabella',   // 스페인어 → Isabella
  'kr': 'kr-hana',       // 한국어 → Hana
};

/**
 * 언어별 사용 가능한 캐릭터 목록
 */
export const LANGUAGE_CHARACTERS: Record<string, string[]> = {
  'en': ['en-emily', 'en-oliver', 'en-sophia'],
  'jp': ['jp-sakura', 'jp-yuki', 'jp-kaito'],
  'es': ['es-isabella', 'es-carlos', 'es-luna'],
  'kr': ['kr-hana', 'kr-minho', 'kr-jiwoo'],
};

/**
 * 캐릭터 정보 (이름, 설명)
 */
export interface CharacterInfo {
  id: string;
  name: string;
  description: string;
  style: string;
}

export const CHARACTER_INFO: Record<string, CharacterInfo> = {
  // 영어
  'en-emily': {
    id: 'en-emily',
    name: 'Emily',
    description: 'Modern American Girl',
    style: '활발하고 친근한 미국 소녀'
  },
  'en-oliver': {
    id: 'en-oliver',
    name: 'Oliver',
    description: 'British Gentleman',
    style: '우아한 영국 신사'
  },
  'en-sophia': {
    id: 'en-sophia',
    name: 'Sophia',
    description: 'Tech Expert',
    style: '기술에 능한 현대 소녀'
  },

  // 일본어
  'jp-sakura': {
    id: 'jp-sakura',
    name: 'Sakura (さくら)',
    description: 'Traditional Japanese Girl',
    style: '전통 기모노 소녀'
  },
  'jp-yuki': {
    id: 'jp-yuki',
    name: 'Yuki (ゆき)',
    description: 'School Girl',
    style: '밝고 활발한 여학생'
  },
  'jp-kaito': {
    id: 'jp-kaito',
    name: 'Kaito (かいと)',
    description: 'Cool Boy',
    style: '쿨한 일본 남학생'
  },

  // 스페인어
  'es-isabella': {
    id: 'es-isabella',
    name: 'Isabella',
    description: 'Flamenco Dancer',
    style: '정열적인 플라멩코 댄서'
  },
  'es-carlos': {
    id: 'es-carlos',
    name: 'Carlos',
    description: 'Spanish Youth',
    style: '스포티한 스페인 청년'
  },
  'es-luna': {
    id: 'es-luna',
    name: 'Luna',
    description: 'Barcelona Artist',
    style: '자유로운 예술가'
  },

  // 한국어
  'kr-hana': {
    id: 'kr-hana',
    name: 'Hana (하나)',
    description: 'Traditional Hanbok Girl',
    style: '우아한 한복 소녀'
  },
  'kr-minho': {
    id: 'kr-minho',
    name: 'Minho (민호)',
    description: 'K-pop Idol',
    style: '세련된 아이돌 스타'
  },
  'kr-jiwoo': {
    id: 'kr-jiwoo',
    name: 'Jiwoo (지우)',
    description: 'Gamer Girl',
    style: '귀여운 게이머 소녀'
  },
};

/**
 * Default character image set to use
 * Change this to switch characters globally
 */
export const DEFAULT_CHARACTER_IMAGE = 'en-emily';

/**
 * Enable/disable external image rendering
 * Set to false to use procedural rendering (original)
 */
export const USE_EXTERNAL_IMAGES = true; // All 12 characters have real images

/**
 * 언어에 맞는 기본 캐릭터 가져오기
 */
export function getCharacterForLanguage(language: string): string {
  return LANGUAGE_DEFAULT_CHARACTERS[language] || DEFAULT_CHARACTER_IMAGE;
}

/**
 * 언어의 캐릭터 목록 가져오기
 */
export function getCharactersForLanguage(language: string): string[] {
  return LANGUAGE_CHARACTERS[language] || [DEFAULT_CHARACTER_IMAGE];
}

/**
 * 캐릭터 정보 가져오기
 */
export function getCharacterInfo(characterId: string): CharacterInfo | null {
  return CHARACTER_INFO[characterId] || null;
}
