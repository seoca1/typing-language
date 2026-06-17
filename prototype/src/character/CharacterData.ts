/**
 * Character Data - 외형, 포즈, 모드, 액세서리, 다문화 변형 정의
 *
 * 컴패니언 캐릭터의 비주얼 데이터를 정의. Canvas 2D 프리미티브로 그려진다.
 * 언어별로 다른 문화 의상/헤어스타일/헤드피스를 적용한다.
 */

export type PoseName =
  | 'idle'
  | 'wave'
  | 'jump'
  | 'clap'
  | 'spin'
  | 'dance'
  | 'pose';

export type Mood = 'neutral' | 'smile' | 'happy' | 'excited' | 'triumphant';

export type Accessory = 'ribbon' | 'bracelet' | 'hairpin' | 'scarf' | 'crown';

export type Prop = 'flowerpot' | 'lantern' | 'book' | 'cat' | 'lanterns';

export type HairStyle = 'twin' | 'hime' | 'long-wavy' | 'long-straight';

export type OutfitType = 'western' | 'kimono' | 'flamenco' | 'hanbok';

export type Headpiece = 'kanzashi' | 'mantilla' | 'binyeo' | 'flower';

/**
 * 캐릭터 외형 정의 — 문화 의상·헤어·헤드피스를 포함
 */
export interface CulturalAppearance {
  hairStyle: HairStyle;
  hairColor: string;
  skinColor: string;
  eyeColor: string;
  cheekColor: string;
  outfitType: OutfitType;
  outfitPrimary: string;
  outfitSecondary: string;
  outfitAccent: string;
  headpiece?: Headpiece;
  hairOrnament?: { color: string };
  earrings?: boolean;
}

/**
 * 언어 키 (동적으로 확장 가능)
 * 
 * 새로운 언어 추가 시 CULTURAL_APPEARANCES에 외형 데이터 추가
 */
export type LanguageKey = string;

export const CULTURAL_APPEARANCES: Record<LanguageKey, CulturalAppearance> = {
  en: {
    hairStyle: 'twin',
    hairColor: '#5a3a2a',
    skinColor: '#ffd9c0',
    eyeColor: '#2c2c2c',
    cheekColor: '#ffb6c1',
    outfitType: 'western',
    outfitPrimary: '#7eb6e8',
    outfitSecondary: '#ffffff',
    outfitAccent: '#ff9eb5',
    earrings: true,
  },
  jp: {
    hairStyle: 'hime',
    hairColor: '#1a1a1a',
    skinColor: '#ffe4d6',
    eyeColor: '#2c2c2c',
    cheekColor: '#ffb6c1',
    outfitType: 'kimono',
    outfitPrimary: '#ff6b9d',
    outfitSecondary: '#ffffff',
    outfitAccent: '#ffd700',
    headpiece: 'kanzashi',
    hairOrnament: { color: '#ff6b9d' },
  },
  es: {
    hairStyle: 'long-wavy',
    hairColor: '#1a1a1a',
    skinColor: '#f5c89a',
    eyeColor: '#2c2c2c',
    cheekColor: '#ff8c9c',
    outfitType: 'flamenco',
    outfitPrimary: '#c8102e',
    outfitSecondary: '#1a1a1a',
    outfitAccent: '#ffd700',
    headpiece: 'mantilla',
    hairOrnament: { color: '#ff1744' },
    earrings: true,
  },
  kr: {
    hairStyle: 'long-straight',
    hairColor: '#1a1a1a',
    skinColor: '#ffe4d6',
    eyeColor: '#2c2c2c',
    cheekColor: '#ffb6c1',
    outfitType: 'hanbok',
    outfitPrimary: '#ffb6c1',
    outfitSecondary: '#ffffff',
    outfitAccent: '#5b9bd5',
    headpiece: 'binyeo',
  },
};

export const DEFAULT_APPEARANCE: CulturalAppearance = CULTURAL_APPEARANCES.en;

export function appearanceForLanguage(lang: LanguageKey): CulturalAppearance {
  return CULTURAL_APPEARANCES[lang] ?? DEFAULT_APPEARANCE;
}

export interface CharacterStage {
  level: number;
  accessories: Accessory[];
  props: Prop[];
  background: 'plain' | 'sunset' | 'starry' | 'sakura' | 'festival';
}

export const STAGE_PROGRESSION: CharacterStage[] = [
  { level: 0, accessories: [], props: [], background: 'plain' },
  { level: 1, accessories: ['ribbon'], props: [], background: 'plain' },
  {
    level: 2,
    accessories: ['ribbon', 'bracelet', 'hairpin'],
    props: ['flowerpot'],
    background: 'sunset',
  },
  {
    level: 3,
    accessories: ['ribbon', 'bracelet', 'hairpin', 'scarf'],
    props: ['flowerpot', 'book', 'lantern'],
    background: 'sakura',
  },
  {
    level: 4,
    accessories: ['ribbon', 'bracelet', 'hairpin', 'scarf', 'crown'],
    props: ['flowerpot', 'book', 'lantern', 'cat', 'lanterns'],
    background: 'festival',
  },
];

export interface PoseConfig {
  name: PoseName;
  duration: number;
  cooldown: number;
  priority: number;
}

export const POSE_LIBRARY: Record<PoseName, PoseConfig> = {
  idle: { name: 'idle', duration: 0, cooldown: 0, priority: 0 },
  wave: { name: 'wave', duration: 900, cooldown: 0, priority: 1 },
  clap: { name: 'clap', duration: 800, cooldown: 0, priority: 2 },
  jump: { name: 'jump', duration: 700, cooldown: 0, priority: 3 },
  spin: { name: 'spin', duration: 1400, cooldown: 0, priority: 4 },
  dance: { name: 'dance', duration: 3000, cooldown: 0, priority: 5 },
  pose: { name: 'pose', duration: 1800, cooldown: 0, priority: 4 },
};

export function moodForState(
  combo: number,
  totalEnemies: number,
  isPerfect: boolean,
): Mood {
  if (isPerfect) return 'triumphant';
  if (combo >= 10) return 'triumphant';
  if (combo >= 5) return 'excited';
  if (combo >= 3 || totalEnemies >= 5) return 'happy';
  if (totalEnemies >= 1) return 'smile';
  return 'neutral';
}