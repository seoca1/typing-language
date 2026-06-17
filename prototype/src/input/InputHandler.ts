/**
 * Input Handler Interface
 *
 * 모든 언어별 핸들러가 구현해야 하는 인터페이스.
 * 자세한 내용: ../../../design/systems/input-handler.md
 */

import type { Language, MatchResult, Target } from '../types.js';

export interface InputHandler {
  /** 언어 식별자 */
  readonly language: Language;

  /** 현재 타겟 설정 */
  setTarget(target: Target): void;

  /** 키 입력 처리 */
  handleKey(event: KeyboardEvent): MatchResult;

  /** 현재 버퍼 */
  getBuffer(): string;

  /** 정확도 (0~100) */
  getAccuracy(): number;

  /** 리셋 */
  reset(): void;

  /** 다음 힌트 (선택) */
  getHint?(): string | undefined;

  /** 다음 입력해야 할 문자 (가상 키보드 힌트용) */
  getExpectedChar(): string;

  /** 현재 입력이 완료되었는지 확인 (Enter 키 확정용) */
  checkCompletion(): boolean;
}

export abstract class BaseInputHandler implements InputHandler {
  abstract readonly language: Language;

  protected target: Target | null = null;
  protected buffer: string = '';
  protected errors: number = 0;
  protected totalKeystrokes: number = 0;

  setTarget(target: Target): void {
    this.target = target;
    this.reset();
  }

  handleKey(event: KeyboardEvent): MatchResult {
    if (!this.target) {
      return this.emptyResult();
    }

    // Ignore composition events (IME)
    if (event.isComposing) {
      return this.currentResult();
    }

    if (event.key === 'Backspace') {
      return this.handleBackspace();
    }

    // Ignore special keys
    if (event.key.length !== 1) {
      return this.currentResult();
    }

    this.totalKeystrokes += 1;
    
    // Check if this keystroke is correct BEFORE adding to buffer
    const expected = this.expectedChar();
    if (event.key !== expected) {
      this.errors += 1;
    }
    
    this.buffer += event.key;
    return this.match();
  }

  getBuffer(): string {
    return this.buffer;
  }

  getAccuracy(): number {
    if (this.totalKeystrokes === 0) return 100;
    return Math.max(0, ((this.totalKeystrokes - this.errors) / this.totalKeystrokes) * 100);
  }

  getExpectedChar(): string {
    return this.expectedChar();
  }

  reset(): void {
    this.buffer = '';
    this.errors = 0;
    this.totalKeystrokes = 0;
  }

  protected abstract match(): MatchResult;
  protected abstract expectedChar(): string;

  protected handleBackspace(): MatchResult {
    if (this.buffer.length > 0) {
      this.buffer = this.buffer.slice(0, -1);
    }
    return this.currentResult();
  }

  protected currentResult(): MatchResult {
    return {
      completed: false,
      accuracy: this.getAccuracy(),
      errors: this.errors,
      buffer: this.buffer,
    };
  }

  protected emptyResult(): MatchResult {
    return {
      completed: false,
      accuracy: 100,
      errors: 0,
      buffer: '',
    };
  }

  /**
   * 현재 입력이 완료되었는지 확인 (Enter 키 확정용)
   */
  checkCompletion(): boolean {
    const result = this.match();
    return result.completed;
  }
}