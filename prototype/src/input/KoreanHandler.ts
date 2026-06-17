/**
 * Korean Input Handler — 한글 자모 직접 입력 + 클라이언트 합성
 *
 * ADR-0010: 한글 2벌식 키보드의 자모를 직접 타이핑, 클라이언트 사이드에서
 * 완성형 한글 음절로 합성. IME 비의존.
 *
 * 자세한 내용: ../../../decisions/0010-kr-input.md, ../../../wiki/languages/korean.md
 *
 * 작동:
 * - 사용자가 한글 2벌식 키보드 활성화 (Caps Lock OFF)
 * - event.key = 자모 (ㄱ, ㄴ, ㅏ, ...)
 * - 자모를 초성/중성/종성으로 조합해 완성형 음절 생성
 * - 완성형 syllable가 target.display 와 일치하면 격파
 */

import { BaseInputHandler } from './InputHandler.js';
import type { MatchResult, Target } from '../types.js';

// ===== Jamo sets =====

const CONSONANTS = new Set([
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]);

const VOWELS = new Set([
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
]);

// 합성 모음 (두 모음 → 단일 모음)
const COMPOUND_VOWEL: Record<string, string> = {
  'ㅏㅣ': 'ㅐ', 'ㅑㅣ': 'ㅒ', 'ㅓㅣ': 'ㅔ', 'ㅕㅣ': 'ㅖ',
  'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ',
};

// 쌍자음 (두 자음 → 단일 자음)
const COMPOUND_LEADING: Record<string, string> = {
  'ㄱㄱ': 'ㄲ', 'ㄷㄷ': 'ㄸ', 'ㅂㅂ': 'ㅃ', 'ㅅㅅ': 'ㅆ', 'ㅈㅈ': 'ㅉ',
};

// 겹받침 (두 받침 → 단일 받침)
const COMPOUND_TRAILING: Record<string, string> = {
  'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ',
  'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ',
};

// ===== Unicode Hangul composition tables =====

const LEADINGS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
const VOWELS_LIST = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];
const TRAILINGS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

const LEADING_INDEX: Record<string, number> = {};
LEADINGS.forEach((c, i) => { LEADING_INDEX[c] = i; });
const VOWEL_INDEX: Record<string, number> = {};
VOWELS_LIST.forEach((c, i) => { VOWEL_INDEX[c] = i; });
const TRAILING_INDEX: Record<string, number> = {};
TRAILINGS.forEach((c, i) => { TRAILING_INDEX[c] = i; });

function composeSyllable(lead: string, vowel: string, trail: string | null): string {
  const L = LEADING_INDEX[lead];
  const V = VOWEL_INDEX[vowel];
  if (L === undefined || V === undefined) return '';
  const T = trail ? (TRAILING_INDEX[trail] ?? 0) : 0;
  return String.fromCharCode(0xAC00 + L * 21 * 28 + V * 28 + T);
}

// 음절을 자모 시퀀스로 분해 (힌트 계산용)
export function decomposeSyllable(syllable: string): string[] {
  const code = syllable.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return [syllable];

  const offset = code - 0xAC00;
  const L = Math.floor(offset / (21 * 28));
  const V = Math.floor((offset % (21 * 28)) / 28);
  const T = offset % 28;

  const result: string[] = [];

  const compoundLeading: Record<number, string[]> = {
    1: ['ㄱ', 'ㄱ'], 4: ['ㄷ', 'ㄷ'], 8: ['ㅂ', 'ㅂ'], 10: ['ㅅ', 'ㅅ'], 13: ['ㅈ', 'ㅈ'],
  };
  result.push(...(compoundLeading[L] ?? [LEADINGS[L]]));

  const compoundVowel: Record<number, string[]> = {
    1: ['ㅏ', 'ㅣ'], 4: ['ㅓ', 'ㅣ'],
    9: ['ㅗ', 'ㅏ'], 10: ['ㅗ', 'ㅐ'], 11: ['ㅗ', 'ㅣ'],
    14: ['ㅜ', 'ㅓ'], 15: ['ㅜ', 'ㅔ'], 16: ['ㅜ', 'ㅣ'],
    19: ['ㅡ', 'ㅣ'],
  };
  result.push(...(compoundVowel[V] ?? [VOWELS_LIST[V]]));

  if (T > 0) {
    const compoundTrail: Record<number, string[]> = {
      3: ['ㄱ', 'ㅅ'],   // ㄳ
      5: ['ㄴ', 'ㅈ'],   // ㄵ
      6: ['ㄴ', 'ㅎ'],   // ㄶ
      9: ['ㄹ', 'ㄱ'],   // ㄺ
      10: ['ㄹ', 'ㅁ'],  // ㄻ
      11: ['ㄹ', 'ㅂ'],  // ㄼ
      12: ['ㄹ', 'ㅅ'],  // ㄽ
      13: ['ㄹ', 'ㅌ'],  // ㄾ
      14: ['ㄹ', 'ㅍ'],  // ㄿ
      15: ['ㄹ', 'ㅎ'],  // ㅀ
      18: ['ㅂ', 'ㅅ'],  // ㅄ
    };
    result.push(...(compoundTrail[T] ?? [TRAILINGS[T]]));
  }

  return result;
}

// ===== Handler =====

interface JamoState {
  lead: string | null;
  vowel: string | null;
  trail: string | null;
}

export class KoreanHandler extends BaseInputHandler {
  readonly language = 'kr' as const;

  private syllables: string[] = [];
  private pending: JamoState = { lead: null, vowel: null, trail: null };

  setTarget(target: Target): void {
    super.setTarget(target);
    this.syllables = [];
    this.pending = { lead: null, vowel: null, trail: null };
  }

  reset(): void {
    super.reset();
    this.syllables = [];
    this.pending = { lead: null, vowel: null, trail: null };
  }

  /** 현재까지 합성된 완성형 한글 버퍼 */
  getComposedDisplay(): string {
    let result = this.syllables.join('');
    const p = this.pending;
    if (p.lead) {
      if (p.vowel) {
        result += composeSyllable(p.lead, p.vowel, p.trail);
      } else {
        result += p.lead;
      }
    }
    return result;
  }

  /** 다음에 입력해야 할 자모 (가상 키보드 힌트용) */
  getNextJamo(): string | null {
    if (!this.target) return null;
    const target = this.target.text;
    const composed = this.getComposedDisplay();
    if (composed.length >= target.length) return null;

    const nextSyllable = target[composed.length];
    if (!nextSyllable) return null;

    const decomposed = decomposeSyllable(nextSyllable);
    const p = this.pending;

    if (p.lead && !p.vowel) return decomposed[1] ?? null;
    if (p.lead && p.vowel && !p.trail) return decomposed[2] ?? null;
    return decomposed[0] ?? null;
  }

  handleKey(event: KeyboardEvent): MatchResult {
    if (!this.target) return this.emptyResult();
    if (event.isComposing) return this.currentResult();
    if (event.key === 'Backspace') return this.handleBackspace();
    if (event.key.length !== 1) return this.currentResult();

    const key = event.key;
    if (CONSONANTS.has(key)) {
      this.inputConsonant(key);
    } else if (VOWELS.has(key)) {
      this.inputVowel(key);
    } else {
      return this.currentResult();
    }

    this.totalKeystrokes += 1;

    // Note: Accuracy tracking for Korean is simplified due to jamo composition complexity.
    // We only count errors when the user types an invalid jamo (not a consonant or vowel).
    // Per-keystroke accuracy is not meaningful for Korean since jamos are intermediate states.
    // The game will still track overall completion and speed (WPM).

    return this.match();
  }

  private inputConsonant(c: string): void {
    const p = this.pending;

    if (!p.lead) {
      p.lead = c;
      return;
    }

    if (!p.vowel) {
      const compound = COMPOUND_LEADING[p.lead + c];
      if (compound) {
        p.lead = compound;
        return;
      }
      // 초성만 있고 모음 없을 때 새 자음 → 기존 초성을 새 음절로 push, 새 초성 시작
      this.syllables.push(p.lead);
      p.lead = c;
      p.vowel = null;
      p.trail = null;
      return;
    }

    if (!p.trail) {
      // 타겟 문자열과 비교하여 이 자음이 종성인지 다음 음절의 초성인지 판단
      if (this.shouldStartNewSyllable(c)) {
        // 현재 음절 완성, 새 음절 시작
        this.syllables.push(composeSyllable(p.lead, p.vowel, null));
        p.lead = c;
        p.vowel = null;
        p.trail = null;
      } else {
        p.trail = c;
      }
      return;
    }

    // 종성이 이미 있을 때 → 겹받침 시도
    const compoundTrail = COMPOUND_TRAILING[p.trail + c];
    if (compoundTrail) {
      p.trail = compoundTrail;
      return;
    }

    // 현재 음절 완성, 새 음절 시작
    this.syllables.push(composeSyllable(p.lead, p.vowel, p.trail));
    p.lead = c;
    p.vowel = null;
    p.trail = null;
  }

  /**
   * 다음 자음이 새 음절의 초성으로 시작해야 하는지 판단
   * 타겟 문자열과 비교하여 적응적으로 결정
   */
  private shouldStartNewSyllable(consonant: string): boolean {
    if (!this.target) return false;

    const p = this.pending;
    if (!p.lead || !p.vowel) return false;

    // 현재 음절을 종성 없이 완성한 경우와 종성 있이 완성한 경우를 모두 시뮬레이션
    const withoutTrailing = this.syllables.join('') + composeSyllable(p.lead, p.vowel, null);
    const withTrailing = this.syllables.join('') + composeSyllable(p.lead, p.vowel, consonant);

    const target = this.target.text;

    // 종성 없이 완성한 경우가 타겟의 prefix라면, 새 음절 시작
    if (target.startsWith(withoutTrailing) && !target.startsWith(withTrailing)) {
      return true;
    }

    return false;
  }

  private inputVowel(v: string): void {
    const p = this.pending;

    if (!p.lead) {
      // 모음만 (초성 없음)
      p.vowel = v;
      return;
    }

    if (!p.vowel) {
      p.vowel = v;
      return;
    }

    // 초성+중성 있고 종성 없을 때 새 모음
    if (p.trail) {
      // 종성 있음 → 종성을 새 초성으로, 새 모음
      this.syllables.push(composeSyllable(p.lead, p.vowel, p.trail));
      p.lead = p.trail;
      p.vowel = v;
      p.trail = null;
      return;
    }

    // 초성+중성 있고 종성 없을 때 → 복합 모음 시도
    const compound = COMPOUND_VOWEL[p.vowel + v];
    if (compound) {
      p.vowel = compound;
      return;
    }

    // 복합 모음 실패 → 현재 음절 완성, 새 음절은 모음만
    this.syllables.push(composeSyllable(p.lead, p.vowel, null));
    p.lead = null;
    p.vowel = v;
    p.trail = null;
  }

  protected handleBackspace(): MatchResult {
    const p = this.pending;
    if (p.trail) p.trail = null;
    else if (p.vowel) p.vowel = null;
    else if (p.lead) p.lead = null;
    else if (this.syllables.length > 0) this.syllables.pop();
    return this.currentResult();
  }

  protected match(): MatchResult {
    if (!this.target) return this.emptyResult();
    const display = this.getComposedDisplay();
    const target = this.target.text;

    if (display === target) {
      return {
        completed: true,
        accuracy: this.getAccuracy(),
        errors: this.errors,
        buffer: display,
      };
    }

    return {
      completed: false,
      accuracy: this.getAccuracy(),
      errors: this.errors,
      buffer: display,
    };
  }

  protected expectedChar(): string {
    if (!this.target) return '';
    return this.target.text[this.getComposedDisplay().length] ?? '';
  }

  getBuffer(): string {
    return this.getComposedDisplay();
  }

  getHint(): string | undefined {
    if (!this.target) return undefined;
    const display = this.getComposedDisplay();
    const target = this.target.text;
    if (display.length >= target.length) return undefined;
    return target.slice(display.length, display.length + 2);
  }
}