/**
 * Spanish Language Configuration
 */

import { SpanishHandler } from '../../input/SpanishHandler.js';
import { ES_WORDS, ES_SENTENCES } from '../../data/corpus.js';
import type { LanguageConfig } from '../LanguageRegistry.js';

export const SPANISH_CONFIG: LanguageConfig = {
  code: 'es',
  name: 'Spanish',
  nativeName: 'Español',
  inputDescription: 'Direct accent input (á, é, í, ó, ú, ñ) or ASCII fallback',
  createHandler: () => new SpanishHandler(),
  supportsTier0: false,
  corpus: {
    words: ES_WORDS,
    sentences: ES_SENTENCES,
  },
  themeColor: '#F39C12', // Orange
};
