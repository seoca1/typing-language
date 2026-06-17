/**
 * English Language Configuration
 */

import { EnglishHandler } from '../../input/EnglishHandler.js';
import { EN_WORDS, EN_SENTENCES } from '../../data/corpus.js';
import type { LanguageConfig } from '../LanguageRegistry.js';

export const ENGLISH_CONFIG: LanguageConfig = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  inputDescription: 'Standard QWERTY keyboard',
  createHandler: () => new EnglishHandler(),
  supportsTier0: false,
  corpus: {
    words: EN_WORDS,
    sentences: EN_SENTENCES,
  },
  themeColor: '#4A90E2', // Blue
};
