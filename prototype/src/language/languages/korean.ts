/**
 * Korean Language Configuration
 */

import { KoreanHandler } from '../../input/KoreanHandler.js';
import { KR_WORDS, KR_SENTENCES } from '../../data/corpus.js';
import type { LanguageConfig } from '../LanguageRegistry.js';

export const KOREAN_CONFIG: LanguageConfig = {
  code: 'kr',
  name: 'Korean',
  nativeName: '한국어',
  inputDescription: '2-beol (dubeolsik) keyboard - Jamo composition (ㄱ + ㅏ + ㄴ → 간)',
  createHandler: () => new KoreanHandler(),
  supportsTier0: false,
  corpus: {
    words: KR_WORDS,
    sentences: KR_SENTENCES,
  },
  themeColor: '#9B59B6', // Purple
};
