/**
 * Spanish Input Handler
 *
 * ADR-0003: 액센트 직접 입력 + ASCII 폴백.
 * 자세한 내용: ../../../wiki/languages/spanish.md
 *
 * 모드:
 * - strict: 액센트 문자 정확히 입력 필요
 * - loose: ASCII 폴백 허용 (n → ñ, a → á 등)
 */

import { BaseInputHandler } from './InputHandler.js';
import type { MatchResult } from '../types.js';

type AccentMode = 'strict' | 'loose';

export class SpanishHandler extends BaseInputHandler {
  readonly language = 'es' as const;
  private mode: AccentMode = 'loose';

  setMode(mode: AccentMode): void {
    this.mode = mode;
  }

  /**
   * Loose 모드 정규화: 액센트 제거 + ñ → n
   */
  private normalize(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N');
  }

  protected match(): MatchResult {
    if (!this.target) return this.emptyResult();

    const targetText = this.target.text;
    const buffer = this.buffer;

    if (this.mode === 'strict') {
      if (buffer === targetText) {
        return this.completedResult();
      }
    } else {
      // Loose: normalize both
      if (this.normalize(buffer) === this.normalize(targetText)) {
        return this.completedResult();
      }
    }

    return this.currentResult();
  }

  protected expectedChar(): string {
    if (!this.target) return '';
    return this.target.text[this.buffer.length] ?? '';
  }

  private completedResult(): MatchResult {
    return {
      completed: true,
      accuracy: this.getAccuracy(),
      errors: this.errors,
      buffer: this.buffer,
    };
  }
}