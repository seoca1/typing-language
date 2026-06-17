/**
 * French Language Configuration (Example)
 * 
 * 새로운 언어 추가 예제입니다.
 * 실제로 활성화하려면:
 * 1. 이 파일을 french.ts로 복사
 * 2. FrenchHandler 구현 (input/FrenchHandler.ts)
 * 3. FR_WORDS, FR_SENTENCES 추가 (data/corpus.ts)
 * 4. language/index.ts에서 registerLanguage(FRENCH_CONFIG) 호출
 * 5. character/CharacterData.ts에 'fr' 외형 추가 (선택사항)
 */

import { EnglishHandler } from '../../input/EnglishHandler.js';
import type { LanguageConfig } from '../LanguageRegistry.js';

// Example: French uses similar input to English but with accents
export const FRENCH_CONFIG: LanguageConfig = {
  code: 'fr',
  name: 'French',
  nativeName: 'Français',
  inputDescription: 'Accented characters (é, è, ê, à, ù, ç) with ASCII fallback',
  
  // Temporarily use EnglishHandler until FrenchHandler is implemented
  createHandler: () => new EnglishHandler(),
  
  supportsTier0: false,
  
  corpus: {
    words: [
      // Example French words
      { id: 'fr_001', display: 'bonjour', meaning: 'hello', level: 1, category: 'greeting' },
      { id: 'fr_002', display: 'merci', meaning: 'thank you', level: 1, category: 'greeting' },
      { id: 'fr_003', display: 'au revoir', meaning: 'goodbye', level: 1, category: 'greeting' },
    ],
    sentences: [
      // Example French sentences
      { id: 'frs_001', display: 'Comment allez-vous?', meaning: 'How are you?', level: 3, category: 'greeting' },
      { id: 'frs_002', display: 'Je suis heureux.', meaning: 'I am happy.', level: 3, category: 'basic' },
    ],
  },
  
  themeColor: '#0055A4', // French blue
  icon: '🇫🇷',
};

/**
 * 사용 방법:
 * 
 * 1. src/language/index.ts에 추가:
 *    import { FRENCH_CONFIG } from './languages/french.js';
 *    registerLanguage(FRENCH_CONFIG);
 * 
 * 2. FrenchHandler 구현:
 *    - input/FrenchHandler.ts 생성
 *    - BaseInputHandler 상속
 *    - 악센트 문자 처리 로직 구현
 * 
 * 3. 스테이지 추가:
 *    - data/stages.ts에 FR_STAGES 추가
 * 
 * 4. 빌드 및 테스트:
 *    npm run typecheck
 *    npm run build
 *    npm test
 */
