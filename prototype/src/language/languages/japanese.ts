/**
 * Japanese Language Configuration
 */

import { JapaneseHandler } from '../../input/JapaneseHandler.js';
import { JP_WORDS, JP_SENTENCES, JP_CHARS } from '../../data/corpus.js';
import type { LanguageConfig } from '../LanguageRegistry.js';

export const JAPANESE_CONFIG: LanguageConfig = {
  code: 'jp',
  name: 'Japanese',
  nativeName: '日本語',
  inputDescription: 'Romaji input (e.g., "konnichiwa" → こんにちは)',
  createHandler: () => new JapaneseHandler(),
  supportsTier0: true, // Hiragana/Katakana character tier
  corpus: {
    words: JP_WORDS,
    sentences: JP_SENTENCES,
    chars: JP_CHARS,
  },
  themeColor: '#E74C3C', // Red
};
