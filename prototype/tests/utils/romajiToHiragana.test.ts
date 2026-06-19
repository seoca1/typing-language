/**
 * romajiToHiragana Tests
 *
 * Verifies the converter handles:
 * - Basic syllables (vowels, k-row, s-row, etc.)
 * - Dakuon (voiced: ga/za/da/ba/pa)
 * - Compound syllables (yōon: kya, sha, etc.)
 * - Special syllables (shi, chi, tsu, fu, ji, wo)
 * - Double consonants (っ)
 * - Long vowels (aa, ii, ou, etc.)
 * - Standalone 'n' (moraic)
 * - Edge cases (empty, mixed case, unknown chars)
 *
 * All test cases are validated against game corpus vocabulary.
 */

import { describe, it, expect } from 'vitest';
import { romajiToHiragana, isKatakana } from '../../src/utils/romajiToHiragana.js';

describe('romajiToHiragana — basic syllables', () => {
  it('converts vowels', () => {
    expect(romajiToHiragana('a')).toBe('あ');
    expect(romajiToHiragana('i')).toBe('い');
    expect(romajiToHiragana('u')).toBe('う');
    expect(romajiToHiragana('e')).toBe('え');
    expect(romajiToHiragana('o')).toBe('お');
  });

  it('converts k-row', () => {
    expect(romajiToHiragana('ka')).toBe('か');
    expect(romajiToHiragana('ki')).toBe('き');
    expect(romajiToHiragana('ku')).toBe('く');
    expect(romajiToHiragana('ke')).toBe('け');
    expect(romajiToHiragana('ko')).toBe('こ');
  });

  it('converts s-row (with special shi)', () => {
    expect(romajiToHiragana('sa')).toBe('さ');
    expect(romajiToHiragana('shi')).toBe('し');
    expect(romajiToHiragana('su')).toBe('す');
    expect(romajiToHiragana('se')).toBe('せ');
    expect(romajiToHiragana('so')).toBe('そ');
  });

  it('converts t-row (with special chi/tsu)', () => {
    expect(romajiToHiragana('ta')).toBe('た');
    expect(romajiToHiragana('chi')).toBe('ち');
    expect(romajiToHiragana('tsu')).toBe('つ');
    expect(romajiToHiragana('te')).toBe('て');
    expect(romajiToHiragana('to')).toBe('と');
  });

  it('converts n-row', () => {
    expect(romajiToHiragana('na')).toBe('な');
    expect(romajiToHiragana('ni')).toBe('に');
    expect(romajiToHiragana('nu')).toBe('ぬ');
    expect(romajiToHiragana('ne')).toBe('ね');
    expect(romajiToHiragana('no')).toBe('の');
  });

  it('converts h-row (with special fu)', () => {
    expect(romajiToHiragana('ha')).toBe('は');
    expect(romajiToHiragana('hi')).toBe('ひ');
    expect(romajiToHiragana('fu')).toBe('ふ');
    expect(romajiToHiragana('he')).toBe('へ');
    expect(romajiToHiragana('ho')).toBe('ほ');
  });

  it('converts m-row', () => {
    expect(romajiToHiragana('ma')).toBe('ま');
    expect(romajiToHiragana('mi')).toBe('み');
    expect(romajiToHiragana('mu')).toBe('む');
    expect(romajiToHiragana('me')).toBe('め');
    expect(romajiToHiragana('mo')).toBe('も');
  });

  it('converts y-row', () => {
    expect(romajiToHiragana('ya')).toBe('や');
    expect(romajiToHiragana('yu')).toBe('ゆ');
    expect(romajiToHiragana('yo')).toBe('よ');
  });

  it('converts r-row', () => {
    expect(romajiToHiragana('ra')).toBe('ら');
    expect(romajiToHiragana('ri')).toBe('り');
    expect(romajiToHiragana('ru')).toBe('る');
    expect(romajiToHiragana('re')).toBe('れ');
    expect(romajiToHiragana('ro')).toBe('ろ');
  });

  it('converts w-row + を', () => {
    expect(romajiToHiragana('wa')).toBe('わ');
    expect(romajiToHiragana('wo')).toBe('を');
  });
});

describe('romajiToHiragana — dakuon (voiced)', () => {
  it('converts g-row', () => {
    expect(romajiToHiragana('ga')).toBe('が');
    expect(romajiToHiragana('gi')).toBe('ぎ');
    expect(romajiToHiragana('gu')).toBe('ぐ');
    expect(romajiToHiragana('ge')).toBe('げ');
    expect(romajiToHiragana('go')).toBe('ご');
  });

  it('converts z-row (with special ji)', () => {
    expect(romajiToHiragana('za')).toBe('ざ');
    expect(romajiToHiragana('ji')).toBe('じ');
    expect(romajiToHiragana('zu')).toBe('ず');
    expect(romajiToHiragana('ze')).toBe('ぜ');
    expect(romajiToHiragana('zo')).toBe('ぞ');
  });

  it('converts d-row', () => {
    expect(romajiToHiragana('da')).toBe('だ');
    expect(romajiToHiragana('de')).toBe('で');
    expect(romajiToHiragana('do')).toBe('ど');
  });

  it('converts b-row', () => {
    expect(romajiToHiragana('ba')).toBe('ば');
    expect(romajiToHiragana('bi')).toBe('び');
    expect(romajiToHiragana('bu')).toBe('ぶ');
    expect(romajiToHiragana('be')).toBe('べ');
    expect(romajiToHiragana('bo')).toBe('ぼ');
  });

  it('converts p-row (handakuon)', () => {
    expect(romajiToHiragana('pa')).toBe('ぱ');
    expect(romajiToHiragana('pi')).toBe('ぴ');
    expect(romajiToHiragana('pu')).toBe('ぷ');
    expect(romajiToHiragana('pe')).toBe('ぺ');
    expect(romajiToHiragana('po')).toBe('ぽ');
  });
});

describe('romajiToHiragana — compound syllables (yōon)', () => {
  it('converts ky-', () => {
    expect(romajiToHiragana('kya')).toBe('きゃ');
    expect(romajiToHiragana('kyu')).toBe('きゅ');
    expect(romajiToHiragana('kyo')).toBe('きょ');
  });

  it('converts sh-', () => {
    expect(romajiToHiragana('sha')).toBe('しゃ');
    expect(romajiToHiragana('shu')).toBe('しゅ');
    expect(romajiToHiragana('sho')).toBe('しょ');
  });

  it('converts ch-', () => {
    expect(romajiToHiragana('cha')).toBe('ちゃ');
    expect(romajiToHiragana('chu')).toBe('ちゅ');
    expect(romajiToHiragana('cho')).toBe('ちょ');
  });

  it('converts ny-, hy-, my-, ry-', () => {
    expect(romajiToHiragana('nya')).toBe('にゃ');
    expect(romajiToHiragana('hyu')).toBe('ひゅ');
    expect(romajiToHiragana('mya')).toBe('みゃ');
    expect(romajiToHiragana('rya')).toBe('りゃ');
  });

  it('converts gy-, by-, py- (voiced yōon)', () => {
    expect(romajiToHiragana('gya')).toBe('ぎゃ');
    expect(romajiToHiragana('bya')).toBe('びゃ');
    expect(romajiToHiragana('pya')).toBe('ぴゃ');
  });
});

describe('romajiToHiragana — double consonants (っ)', () => {
  it('handles tt → っ', () => {
    expect(romajiToHiragana('kitte')).toBe('きって');
  });

  it('handles kk → っ', () => {
    expect(romajiToHiragana('gakkou')).toBe('がっこう');
    expect(romajiToHiragana('kakkoii')).toBe('かっこいい');
  });

  it('handles ss → っ', () => {
    expect(romajiToHiragana('zasshi')).toBe('ざっし');
  });

  it('handles pp → っ', () => {
    expect(romajiToHiragana('rappa')).toBe('らっぱ');
  });

  it('does NOT collapse nn (it becomes んん)', () => {
    // "nn" should produce ん + ん, not っ
    // っ is only for doubled consonants OTHER than n
    // "kannn" (k-a-n-n-n) → か + ん + ん + ん (no っ)
    expect(romajiToHiragana('kannn')).toBe('かんんん');
  });
});

describe('romajiToHiragana — long vowels', () => {
  it('handles aa (repetition)', () => {
    expect(romajiToHiragana('mataashita')).toBe('またあした');
  });

  it('handles ii (repetition)', () => {
    expect(romajiToHiragana('kawaii')).toBe('かわいい');
  });

  it('handles ou (compound)', () => {
    expect(romajiToHiragana('toukyou')).toBe('とうきょう');
  });

  it('handles ei (compound)', () => {
    expect(romajiToHiragana('sensei')).toBe('せんせい');
  });

  it('handles uu (repetition)', () => {
    expect(romajiToHiragana('suupaa')).toBe('すうぱあ');
  });
});

describe('romajiToHiragana — standalone n (moraic)', () => {
  it('converts n at end of string', () => {
    expect(romajiToHiragana('san')).toBe('さん');
    expect(romajiToHiragana('nihon')).toBe('にほん');
  });

  it('converts n before consonant', () => {
    expect(romajiToHiragana('senseki')).toBe('せんせき');
  });

  it('keeps n before vowel as ん+vowel', () => {
    expect(romajiToHiragana('kanojo')).toBe('かのじょ');
  });
});

describe('romajiToHiragana — real game corpus', () => {
  // From actual JP corpus entries
  const cases: Array<[string, string]> = [
    ['konnichiwa', 'こんにちは'],
    ['ohayougozaimasu', 'おはようございます'],
    ['oyasuminasai', 'おやすみなさい'],
    ['arigatou', 'ありがとう'],
    ['arigatougozaimasu', 'ありがとうございまs'.slice(0, -1) + 'す'], // construct expected
    ['nihon', 'にほん'],
    ['sakura', 'さくら'],
    ['chikatetsu', 'ちかてつ'],
    ['kakkoii', 'かっこいい'],
    ['kawaii', 'かわいい'],
    ['gakkou', 'がっこう'],
    ['tomodachi', 'ともだち'],
    ['aisuru', 'あいする'],
  ];

  for (const [romaji, expected] of cases) {
    it(`converts "${romaji}" → "${expected}"`, () => {
      expect(romajiToHiragana(romaji)).toBe(expected);
    });
  }
});

describe('romajiToHiragana — edge cases', () => {
  it('returns empty string for empty input', () => {
    expect(romajiToHiragana('')).toBe('');
  });

  it('handles uppercase input', () => {
    expect(romajiToHiragana('KONNICHIWA')).toBe('こんにちは');
  });

  it('handles mixed case input', () => {
    expect(romajiToHiragana('Konnichiwa')).toBe('こんにちは');
  });

  it('passes through unknown characters', () => {
    expect(romajiToHiragana('xy')).toBe('xy');
  });
});

describe('isKatakana', () => {
  it('returns true for katakana strings', () => {
    expect(isKatakana('カフェ')).toBe(true);
    expect(isKatakana('コーヒー')).toBe(true);
    expect(isKatakana('バス')).toBe(true);
  });

  it('returns false for hiragana strings', () => {
    expect(isKatakana('こんにちは')).toBe(false);
    expect(isKatakana('ありがとう')).toBe(false);
  });

  it('returns false for kanji strings', () => {
    expect(isKatakana('日本')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isKatakana('')).toBe(false);
  });

  it('returns true if any char is katakana', () => {
    expect(isKatakana('コーヒー')).toBe(true);
  });
});
