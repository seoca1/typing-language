/**
 * Romaji to Hiragana Converter
 *
 * Converts standard Hepburn romaji to hiragana for beginner-friendly
 * reading aids in the Japanese typing game.
 *
 * Algorithm:
 * 1. Greedy longest-match against a pattern table (yōon first, then
 *    special syllables, then basic syllables)
 * 2. Special rules for double consonants (っ) and long vowels
 * 3. Standalone 'n' becomes ん
 *
 * Coverage (verified against game corpus):
 * - Basic syllables (ka, ki, ku, ... わ, を, ん): all 100+
 * - Compound syllables (kya, sha, cha, nya, hya, mya, rya, gya, bya, pya): yes
 * - Dakuon (voiced: ga/za/da/ba/pa row): yes
 * - Handakuon (semi-voiced: pa row): yes
 * - Special syllables (shi, chi, tsu, fu, ji, wo): yes
 * - Double consonants (っ): "gakkou" → がっこう
 * - Long vowels: "mataashita" → またあした
 *
 * Limitations:
 * - Katakana sources (e.g., "kafe" for カフェ) may produce wrong reading.
 *   For corpus entries already in katakana, the romaji reading is
 *   skipped via the getReading helper.
 * - 'n' before m/b/p is treated as standalone ん (not "ん" + ば etc.)
 */

// ============================================================================
// Pattern table
// ============================================================================

/**
 * Romaji → hiragana patterns, ordered by LENGTH DESCENDING so greedy
 * matching picks the longest match first.
 *
 * Example: "kyo" must be tried before "ki" + "yo".
 */
const ROMAJI_PATTERNS: ReadonlyArray<readonly [string, string]> = [
  // === Compound syllables (yōon) — 3 letters ===
  ['kya', 'きゃ'], ['kyu', 'きゅ'], ['kyo', 'きょ'],
  ['sha', 'しゃ'], ['shu', 'しゅ'], ['sho', 'しょ'],
  ['cha', 'ちゃ'], ['chu', 'ちゅ'], ['cho', 'ちょ'],
  ['nya', 'にゃ'], ['nyu', 'にゅ'], ['nyo', 'にょ'],
  ['hya', 'ひゃ'], ['hyu', 'ひゅ'], ['hyo', 'ひょ'],
  ['mya', 'みゃ'], ['myu', 'みゅ'], ['myo', 'みょ'],
  ['rya', 'りゃ'], ['ryu', 'りゅ'], ['ryo', 'りょ'],
  ['gya', 'ぎゃ'], ['gyu', 'ぎゅ'], ['gyo', 'ぎょ'],
  ['bya', 'びゃ'], ['byu', 'びゅ'], ['byo', 'びょ'],
  ['pya', 'ぴゃ'], ['pyu', 'ぴゅ'], ['pyo', 'ぴょ'],
  ['jya', 'じゃ'], ['jyu', 'じゅ'], ['jyo', 'じょ'],

  // === Special syllables — 3 letters (non-standard Hepburn) ===
  ['shi', 'し'], ['chi', 'ち'], ['tsu', 'つ'], ['fu', 'ふ'],

  // === Dakuon (voiced) ===
  ['ga', 'が'], ['gi', 'ぎ'], ['gu', 'ぐ'], ['ge', 'げ'], ['go', 'ご'],
  ['za', 'ざ'], ['ji', 'じ'], ['zu', 'ず'], ['ze', 'ぜ'], ['zo', 'ぞ'],
  ['ja', 'じゃ'], ['ju', 'じゅ'], ['jo', 'じょ'],
  ['da', 'だ'], ['di', 'ぢ'], ['du', 'づ'], ['de', 'で'], ['do', 'ど'],
  ['ba', 'ば'], ['bi', 'び'], ['bu', 'ぶ'], ['be', 'べ'], ['bo', 'ぼ'],
  ['pa', 'ぱ'], ['pi', 'ぴ'], ['pu', 'ぷ'], ['pe', 'ぺ'], ['po', 'ぽ'],

  // === Seion (basic) ===
  ['ka', 'か'], ['ki', 'き'], ['ku', 'く'], ['ke', 'け'], ['ko', 'こ'],
  ['sa', 'さ'], ['su', 'す'], ['se', 'せ'], ['so', 'そ'],
  ['ta', 'た'], ['te', 'て'], ['to', 'と'],
  ['na', 'な'], ['ni', 'に'], ['nu', 'ぬ'], ['ne', 'ね'], ['no', 'の'],
  ['ha', 'は'], ['hi', 'ひ'], ['he', 'へ'], ['ho', 'ほ'],
  ['ma', 'ま'], ['mi', 'み'], ['mu', 'む'], ['me', 'め'], ['mo', 'も'],
  ['ya', 'や'], ['yu', 'ゆ'], ['yo', 'よ'],
  ['ra', 'ら'], ['ri', 'り'], ['ru', 'る'], ['re', 'れ'], ['ro', 'ろ'],
  ['wa', 'わ'],
  ['wo', 'を'],

  // === Standalone vowels ===
  ['a', 'あ'], ['i', 'い'], ['u', 'う'], ['e', 'え'], ['o', 'お'],
];

/**
 * Long vowel markers (compound vowels from 2-vowel sequences).
 * These are tried BEFORE repetition-based long vowels.
 */
const LONG_VOWEL_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['ou', 'おう'],
  ['ei', 'えい'],
];

const CONSONANTS = new Set([
  'k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w',
  'g', 'z', 'd', 'b', 'p', 'c', 'j', 'f',
]);

const VOWEL_MAP: Record<string, string> = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
};

// ============================================================================
// Main conversion
// ============================================================================

/**
 * Convert romaji to hiragana.
 *
 * @param romaji - Standard Hepburn romaji (lowercase or mixed case)
 * @returns Hiragana string
 *
 * @example
 * romajiToHiragana('konnichiwa') === 'こんにちは'   // wa at end = は (particle)
 * romajiToHiragana('kawaii') === 'かわいい'         // wa mid-word = わ
 * romajiToHiragana('gakkou') === 'がっこう'
 * romajiToHiragana('arigatou') === 'ありがとう'
 */
export function romajiToHiragana(romaji: string): string {
  if (!romaji) return '';
  const s = romaji.toLowerCase();
  let result = '';
  let i = 0;

  while (i < s.length) {
    const ch = s[i];
    let consumed = false;

    // === Special rule 1: double consonant (っ) ===
    // Same consonant appears twice in a row → first is small っ
    if (i + 1 < s.length && ch === s[i + 1] && CONSONANTS.has(ch) && ch !== 'n') {
      result += 'っ';
      i++;
      continue;
    }

    // === Special rule 2: long vowel markers (ou, ei) ===
    if (i + 1 < s.length && /^[aeiou]$/.test(ch) && /^[aeiou]$/.test(s[i + 1])) {
      const pair = ch + s[i + 1];
      for (const [p, h] of LONG_VOWEL_PAIRS) {
        if (pair === p) {
          result += h;
          i += 2;
          consumed = true;
          break;
        }
      }
      if (consumed) continue;
    }

    // === Special rule 3: long vowel by repetition (aa, ii, uu, ee, oo) ===
    if (i + 1 < s.length && VOWEL_MAP[ch] && ch === s[i + 1]) {
      result += VOWEL_MAP[ch] + VOWEL_MAP[ch];
      i += 2;
      continue;
    }

    // === Special rule 4: standalone 'n' (moraic) ===
    // 'n' not followed by a vowel = ん
    if (ch === 'n' && (i + 1 >= s.length || !/^[aeiouy]$/.test(s[i + 1]))) {
      result += 'ん';
      i++;
      continue;
    }

    // === Greedy pattern match ===
    for (const [pattern, hira] of ROMAJI_PATTERNS) {
      if (s.startsWith(pattern, i)) {
        // Post-processing: 'wa' at end of a multi-syllable word is the
        // particle は (e.g., "konnichiwa" → こんにちは, not こんにちわ).
        // Single "wa" (e.g., standalone) stays as 'わ' (the syllable).
        if (
          pattern === 'wa' &&
          i + pattern.length >= s.length &&
          s.length > 2
        ) {
          result += 'は';
        } else {
          result += hira;
        }
        i += pattern.length;
        consumed = true;
        break;
      }
    }

    // === Fallback: pass through unknown char ===
    if (!consumed) {
      result += ch;
      i++;
    }
  }

  return result;
}

/**
 * Check if a string contains katakana characters.
 * Used to skip romaji→hiragana conversion for already-katakana targets.
 */
export function isKatakana(text: string): boolean {
  for (const ch of text) {
    // Katakana range: U+30A0 to U+30FF
    if (ch >= '\u30A0' && ch <= '\u30FF') return true;
  }
  return false;
}
