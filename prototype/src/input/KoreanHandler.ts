/**
 * Korean Input Handler — 한글 자모 직접 입력 + 로마자 입력 모드
 *
 * ADR-0010: 한글 2벌식 키보드의 자모를 직접 타이핑, 클라이언트 사이드에서
 * 완성형 한글 음절로 합성. IME 비의존.
 *
 * 두 입력 모드 지원:
 * - 'jamo': 자모 직접 입력 (2벌식 키보드) — 기본값
 * - 'romanized': 로마자 입력 (QWERTY) —外国人 친화적
 *
 * 자세한 내용: ../../../decisions/0010-kr-input.md, ../../../wiki/languages/korean.md
 *
 * romanized 모드 작동 (JapaneseHandler와 동일):
 * - target.acceptedInputs[0]을 로마자 정답으로 사용
 * - 예: "안녕하세요" → acceptedInputs: ["annyeonghaseyo"]
 */

import { BaseInputHandler } from './InputHandler.js';
import type { MatchResult, Target } from '../types.js';
import { getKoreanInputMode } from '../data/koreanInputMode.js';

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

/** 완성형 한글 범위 체크 (AC00 ~ D7A3) */
function isCompleteHangul(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
}

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

  private get isRomanized(): boolean {
    return getKoreanInputMode() === 'romanized';
  }

  private get romanizedTarget(): string {
    if (!this.target) return '';
    return this.target.acceptedInputs?.[0] ?? '';
  }

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

  /** Flush pending syllable to syllables array */
  private flushPending(): void {
    const p = this.pending;
    if (p.lead) {
      if (p.vowel) {
        this.syllables.push(composeSyllable(p.lead, p.vowel, p.trail));
      } else {
        // Vowelless consonant at end - shouldn't happen in normal input
        // but handle gracefully by treating as separate syllable
        this.syllables.push(p.lead);
      }
    }
    this.pending = { lead: null, vowel: null, trail: null };
  }

  /** 현재까지 합성된 완성형 한글 버퍼 (space 포함) */
  getComposedDisplay(): string {
    return this.syllables.join('') + this.getPendingDisplay();
  }

  /** 현재 pending 상태의 표시 */
  private getPendingDisplay(): string {
    const p = this.pending;
    if (p.lead) {
      if (p.vowel) {
        return composeSyllable(p.lead, p.vowel, p.trail);
      } else {
        return p.lead;
      }
    }
    return '';
  }

  /** 다음에 입력해야 할 자모 (가상 키보드 힌트용) */
  getNextJamo(): string | null {
    if (!this.target) return null;
    const target = this.target.text;
    const display = this.getComposedDisplay();
    if (display.length >= target.length) return null;

    const nextChar = target[display.length];
    if (!nextChar) return null;

    // Space: return null since space is not a jamo (handled separately)
    if (nextChar === ' ') return null;

    const decomposed = decomposeSyllable(nextChar);
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

    // Romanized mode: pass through to buffer directly (like JapaneseHandler)
    if (this.isRomanized) {
      this.buffer += event.key;
      this.totalKeystrokes += 1;
      return this.match();
    }

    const key = event.key;

    // Space handling: flush pending syllable and add space marker
    if (key === ' ') {
      this.flushPending();
      this.syllables.push(' ');
      this.totalKeystrokes += 1;
      return this.match();
    }

    if (CONSONANTS.has(key)) {
      this.inputConsonant(key);
    } else if (VOWELS.has(key)) {
      this.inputVowel(key);
    } else if (isCompleteHangul(key)) {
      this.flushPending();
      this.syllables.push(key);
      this.totalKeystrokes += 1;
      return this.match();
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
      } else if (this.tryCompoundVowelInsertion(c)) {
        // 복모음 자동 삽입 성공 (예: ㅗ+ㄴ → ㅘ+ㄴ for "관")
        // (tryCompoundVowelInsertion에서 p.vowel을 변경하고 종성 추가함)
      } else {
        p.trail = c;
      }
      return;
    }

    // 종성이 이미 있을 때 →
    // 1. 먼저 타겟 기반으로 새 초성으로 시작해야 하는지 확인
    //    (예: "박물관"에서 ㄹ 종성 + ㄱ은 종성 ㄺ이 아닌 새 초성 ㄱ)
    if (this.shouldStartNewSyllable(c)) {
      this.syllables.push(composeSyllable(p.lead, p.vowel, p.trail));
      p.lead = c;
      p.vowel = null;
      p.trail = null;
      return;
    }

    // 2. 겹받침 시도 (예: ㄱ + ㅅ = ㄳ)
    const compoundTrail = COMPOUND_TRAILING[p.trail + c];
    if (compoundTrail) {
      p.trail = compoundTrail;
      return;
    }

    // 3. 현재 음절 완성, 새 음절 시작
    this.syllables.push(composeSyllable(p.lead, p.vowel, p.trail));
    p.lead = c;
    p.vowel = null;
    p.trail = null;
  }

  /**
   * 다음 자음이 새 음절의 초성으로 시작해야 하는지 판단
   *
   * 타겟 문자열의 다음 음절 초성을 분해하여 직접 비교.
   * 종성 후보 consonant으로 만든 음절이 타겟의 다음 글자와 일치하면 종성으로 추가,
   * 일치하지 않으면 새 초성으로 시작.
   *
   * 박물관 입력에서 "물관" 처리 시, ㄹ 종성 + ㄱ 입력을 ㄺ이 아닌 새 초성으로 분리.
   */
  private shouldStartNewSyllable(consonant: string): boolean {
    if (!this.target) return false;

    const p = this.pending;
    if (!p.lead || !p.vowel) return false;

    const syllablesStr = this.syllables.join('');
    const target = this.target.text;

    if (!p.trail) {
      // 종성이 없는 경우: 새 자음이 종성이 될지 새 초성이 될지 결정
      const withNewTrail = syllablesStr + composeSyllable(p.lead, p.vowel, consonant);
      const withoutNewTrail = syllablesStr + composeSyllable(p.lead, p.vowel, null);

      // 종성으로 추가했을 때 target과 일치하면 종성으로 추가
      if (target.startsWith(withNewTrail)) {
        return false;
      }

      // 종성 없이 현재 상태가 target과 일치하면 새 초성으로 분리
      if (target.startsWith(withoutNewTrail)) {
        return true;
      }

      // 둘 다 안 맞으면 (defensive) 종성으로 추가
      return false;
    }

    // 종성이 이미 있는 경우: 새 자음이 겹받침이 될지 새 초성이 될지 결정
    const currentDisplay = syllablesStr + composeSyllable(p.lead, p.vowel, p.trail);

    // 현재 표시가 target의 prefix가 아니면 새 초성으로 분리하지 않음
    // (예: "넓다"의 ㄹ+ㅂ → ㄼ로 결합해야 하는 경우)
    if (!target.startsWith(currentDisplay)) {
      return false;
    }

    const nextIdx = currentDisplay.length;
    if (nextIdx >= target.length) {
      // Target 끝: 종성으로 결합 (겹받침 가능하면)
      return false;
    }

    // Target의 다음 글자가 새 자음을 초성으로 가지는지 확인
    // (예: "박물관"의 "물관" - ㄹ 종성 다음 ㄱ이 관의 초성)
    const nextChar = target[nextIdx];
    const nextJamo = decomposeSyllable(nextChar);
    if (nextJamo.length > 0 && nextJamo[0] === consonant) {
      return true;
    }

    // 새 자음이 target의 다음 글자 초성과 다르면 겹받침으로 결합
    return false;
  }

  /**
   * Smart IME-style compound vowel insertion
   *
   * 사용자가 ㄱ+ㅗ+ㄴ 처럼 입력했을 때 자동으로 ㄱ+ㅘ+ㄴ (관)으로 변환.
   * 종성 consonant이 추가됐을 때 target의 다음 글자가 같은 초성+복합모음+같은 종성
   * 조합을 가지고 있다면, 현재 모음을 복합 모음으로 변환하고 종성을 추가.
   *
   * 일반적인 케이스:
   * - ㅗ + ㄴ → ㅘ + ㄴ (관, 단, 안...)
   * - ㅜ + ㄴ → ㅝ + ㄴ (권, 둔, 문...)
   * - ㅡ + ㄴ → ㅢ + ㄴ (슨, 근, 늘...)
   */
  private tryCompoundVowelInsertion(c: string): boolean {
    if (!this.target) return false;

    const p = this.pending;
    if (!p.lead || !p.vowel) return false;

    const syllablesStr = this.syllables.join('');
    const target = this.target.text;

    // Common compound vowel pairs: base vowel -> (additional vowel, compound vowel)
    const compoundPairs: Record<string, [string, string]> = {
      'ㅗ': ['ㅏ', 'ㅘ'],  // ㄱ+ㅗ+ㄴ → ㄱ+ㅘ+ㄴ (관)
      'ㅜ': ['ㅓ', 'ㅝ'],  // ㄱ+ㅜ+ㄴ → ㄱ+ㅝ+ㄴ (권)
      'ㅡ': ['ㅣ', 'ㅢ'],  // ㄱ+ㅡ+ㄴ → ㄱ+ㅢ+ㄴ (슨)
      'ㅚ': ['ㅣ', 'ㅚ'],  // no change for ㅚ
      'ㅟ': ['ㅣ', 'ㅟ'],  // no change for ㅟ
    };

    const pair = compoundPairs[p.vowel];
    if (!pair) return false;

    const [, compoundVowel] = pair;

    // 현재 모음을 복합 모음으로 변환했을 때의 음절을 계산
    const compoundSyllable = composeSyllable(p.lead, compoundVowel, c);

    // syllablesStr + compoundSyllable이 target의 다음 위치와 일치하는지 확인
    const targetPos = syllablesStr.length;
    if (targetPos < target.length && target[targetPos] === compoundSyllable) {
      // 변환 적용: 모음을 복합 모음으로, 종성으로 추가
      p.vowel = compoundVowel;
      p.trail = c;
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
    // Romanized mode: simple buffer truncation
    if (this.isRomanized) {
      if (this.buffer.length > 0) {
        this.buffer = this.buffer.slice(0, -1);
      }
      return this.currentResult();
    }

    // Jamo mode: jamo-level backspace
    const p = this.pending;
    if (p.trail) p.trail = null;
    else if (p.vowel) p.vowel = null;
    else if (p.lead) p.lead = null;
    else if (this.syllables.length > 0) this.syllables.pop();
    return this.currentResult();
  }

  protected match(): MatchResult {
    if (!this.target) return this.emptyResult();

    // Romanized mode: compare buffer to romanized target (like JapaneseHandler)
    if (this.isRomanized) {
      const romanized = this.romanizedTarget;
      if (this.buffer === romanized) {
        return {
          completed: true,
          accuracy: this.getAccuracy(),
          errors: this.errors,
          buffer: this.buffer,
        };
      }
      return {
        completed: false,
        accuracy: this.getAccuracy(),
        errors: this.errors,
        buffer: this.buffer,
      };
    }

    // Jamo mode: compare composed Hangul to target display
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

    // Romanized mode
    if (this.isRomanized) {
      const romanized = this.romanizedTarget;
      return romanized[this.buffer.length] ?? '';
    }

    // Jamo mode
    return this.target.text[this.getComposedDisplay().length] ?? '';
  }

  getBuffer(): string {
    // Romanized mode: return buffer directly
    if (this.isRomanized) {
      return this.buffer;
    }
    return this.getComposedDisplay();
  }

  getHint(): string | undefined {
    if (!this.target) return undefined;

    // Romanized mode: return next romanized characters
    if (this.isRomanized) {
      const romanized = this.romanizedTarget;
      if (this.buffer.length >= romanized.length) return undefined;
      return romanized.slice(this.buffer.length, this.buffer.length + 2);
    }

    // Jamo mode: return next Hangul characters
    const display = this.getComposedDisplay();
    const target = this.target.text;
    if (display.length >= target.length) return undefined;
    return target.slice(display.length, display.length + 2);
  }
}