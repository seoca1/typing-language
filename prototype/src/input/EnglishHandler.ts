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