/**
 * Japanese Input Handler
 *
 * ADR-0002: 로마자→한자 직접 매핑.
 * 자세한 내용: ../../../wiki/languages/japanese.md
 *
 * 기본 전략: 타겟의 display(한자/히라가나)에 대응하는 romaji를 정답으로 매칭.
 * 코퍼스에서 각 단어의 `romaji` 필드를 정답으로 사용.
 */

import { BaseInputHandler } from './InputHandler.js';
import type { MatchResult, Target } from '../types.js';

export class JapaneseHandler extends BaseInputHandler {
  readonly language = 'jp' as const;

  private getRomajiTarget(): string {
    if (!this.target) return '';
    // 타겟의 acceptedInputs[0]을 romaji로 사용
    return this.target.acceptedInputs[0] ?? this.target.text;
  }

  protected match(): MatchResult {
    if (!this.target) return this.emptyResult();

    const romaji = this.getRomajiTarget();
    const buffer = this.buffer;

    if (buffer === romaji) {
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
    const romaji = this.getRomajiTarget();
    return romaji[this.buffer.length] ?? '';
  }

  getHint(): string | undefined {
    if (!this.target) return undefined;
    const romaji = this.getRomajiTarget();
    if (this.buffer.length >= romaji.length) return undefined;
    return romaji.slice(this.buffer.length, this.buffer.length + 2);
  }

  setTarget(target: Target): void {
    super.setTarget(target);
  }
}