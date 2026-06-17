/**
 * Language Registry - 동적 언어 추가 시스템
 * 
 * 새로운 언어를 추가하려면:
 * 1. InputHandler 구현 (BaseInputHandler 상속)
 * 2. LanguageConfig 정의
 * 3. registerLanguage() 호출
 * 
 * 설계 문서: ../../../wiki/extensible-languages.md
 */

import type { InputHandler } from '../input/InputHandler.js';
import type { WordEntry } from '../types.js';

/**
 * 언어 메타데이터
 */
export interface LanguageConfig {
  /** 언어 코드 (예: 'en', 'jp', 'es', 'kr', 'zh', 'fr') */
  code: string;
  
  /** 표시 이름 (영어) */
  name: string;
  
  /** 표시 이름 (원어) */
  nativeName: string;
  
  /** 입력 방식 설명 */
  inputDescription: string;
  
  /** InputHandler 생성자 */
  createHandler: () => InputHandler;
  
  /** 이 언어가 Tier 0 (문자 단위)를 지원하는지 */
  supportsTier0: boolean;
  
  /** 코퍼스 데이터 */
  corpus: {
    words: WordEntry[];
    sentences: WordEntry[];
    chars?: Record<string, WordEntry[]>;  // Tier 0용 (JP만 해당)
  };
  
  /** UI 아이콘/플래그 (선택사항) */
  icon?: string;
  
  /** 언어별 테마 색상 (선택사항) */
  themeColor?: string;
}

/**
 * 언어 레지스트리 (싱글톤)
 */
class LanguageRegistry {
  private languages = new Map<string, LanguageConfig>();
  
  /**
   * 언어 등록
   */
  register(config: LanguageConfig): void {
    if (this.languages.has(config.code)) {
      console.warn(`Language '${config.code}' already registered. Overwriting.`);
    }
    this.languages.set(config.code, config);
  }
  
  /**
   * 언어 조회
   */
  get(code: string): LanguageConfig | undefined {
    return this.languages.get(code);
  }
  
  /**
   * 모든 언어 코드 목록
   */
  getAllCodes(): string[] {
    return Array.from(this.languages.keys());
  }
  
  /**
   * 모든 언어 설정 목록
   */
  getAll(): LanguageConfig[] {
    return Array.from(this.languages.values());
  }
  
  /**
   * 언어가 등록되어 있는지 확인
   */
  has(code: string): boolean {
    return this.languages.has(code);
  }
  
  /**
   * 언어 개수
   */
  get size(): number {
    return this.languages.size;
  }
}

/**
 * 전역 레지스트리 인스턴스
 */
export const LANGUAGE_REGISTRY = new LanguageRegistry();

/**
 * 헬퍼: 언어 등록
 */
export function registerLanguage(config: LanguageConfig): void {
  LANGUAGE_REGISTRY.register(config);
}

/**
 * 헬퍼: 언어 조회
 */
export function getLanguage(code: string): LanguageConfig {
  const lang = LANGUAGE_REGISTRY.get(code);
  if (!lang) {
    throw new Error(`Language '${code}' not registered. Available: ${LANGUAGE_REGISTRY.getAllCodes().join(', ')}`);
  }
  return lang;
}

/**
 * 헬퍼: 모든 언어 코드
 */
export function getAllLanguageCodes(): string[] {
  return LANGUAGE_REGISTRY.getAllCodes();
}

/**
 * 헬퍼: 모든 언어 설정
 */
export function getAllLanguages(): LanguageConfig[] {
  return LANGUAGE_REGISTRY.getAll();
}
