/**
 * English Input Handler
 *
 * ADR-0001 / 0002 / 0003: 영어는 가장 단순한 핸들러.
 * 자세한 내용: ../../../wiki/languages/english.md
 */

import { BaseInputHandler } from './InputHandler.js';
import type { MatchResult } from '../types.js';

export class EnglishHandler extends BaseInputHandler {
  readonly language = 'en' as const;

  handleKey(event: KeyboardEvent): MatchResult {
    // IME 입력 무시 (한글 키보드 모드)
    if (event.isComposing) {
      return this.currentResult();
    }

    // 영어 모드에서는 ASCII만 허용 (한글 차단)
    if (event.key.length === 1) {
      const code = event.key.charCodeAt(0);
      // ASCII 범위가 아니면 무시
      if (code < 32 || code > 126) {
        console.warn('[English] Non-ASCII key ignored:', event.key, 'code:', code);
        return this.currentResult();
      }
    }

    return super.handleKey(event);
  }

  protected match(): MatchResult {
    if (!this.target) return this.emptyResult();

    const targetText = this.target.text;
    const buffer = this.buffer;

    if (buffer === targetText) {
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

  protected expectedChar(): string {
    if (!this.target) return '';
    return this.target.text[this.buffer.length] ?? '';
  }
}