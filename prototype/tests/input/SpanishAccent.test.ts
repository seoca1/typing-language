/**
 * Spanish Accent Handling Test
 * 
 * loose 모드에서 악센트 없이 입력해도 인식되는지 테스트
 */

import { describe, it, expect } from 'vitest';
import { SpanishHandler } from '../../src/input/SpanishHandler.js';

describe('SpanishHandler - Accent Handling', () => {
  it('should accept "adios" for "adiós" in loose mode', () => {
    const handler = new SpanishHandler();
    handler.setMode('loose');
    
    const target = {
      text: 'adiós',
      acceptedInputs: ['adiós'],
      level: 1,
    };
    handler.setTarget(target);

    // Type without accent
    let result;
    for (const char of 'adios') {
      result = handler.handleKey({ key: char } as KeyboardEvent);
    }

    expect(result?.completed).toBe(true);
  });

  it('should accept "manana" for "mañana" in loose mode', () => {
    const handler = new SpanishHandler();
    handler.setMode('loose');
    
    const target = {
      text: 'mañana',
      acceptedInputs: ['mañana'],
      level: 1,
    };
    handler.setTarget(target);

    let result;
    for (const char of 'manana') {
      result = handler.handleKey({ key: char } as KeyboardEvent);
    }

    expect(result?.completed).toBe(true);
  });

  it('should handle spaces in "por favor"', () => {
    const handler = new SpanishHandler();
    handler.setMode('loose');
    
    const target = {
      text: 'por favor',
      acceptedInputs: ['por favor'],
      level: 1,
    };
    handler.setTarget(target);

    let result;
    for (const char of 'por favor') {
      result = handler.handleKey({ key: char } as KeyboardEvent);
    }

    expect(result?.completed).toBe(true);
  });

  it('should accept "buenos dias" for "buenos días" in loose mode', () => {
    const handler = new SpanishHandler();
    handler.setMode('loose');
    
    const target = {
      text: 'buenos días',
      acceptedInputs: ['buenos días'],
      level: 1,
    };
    handler.setTarget(target);

    let result;
    for (const char of 'buenos dias') {
      result = handler.handleKey({ key: char } as KeyboardEvent);
    }

    expect(result?.completed).toBe(true);
  });

  it('should accept "muchas gracias" with spaces', () => {
    const handler = new SpanishHandler();
    handler.setMode('loose');
    
    const target = {
      text: 'muchas gracias',
      acceptedInputs: ['muchas gracias'],
      level: 1,
    };
    handler.setTarget(target);

    let result;
    for (const char of 'muchas gracias') {
      result = handler.handleKey({ key: char } as KeyboardEvent);
    }

    expect(result?.completed).toBe(true);
  });

  it('should NOT accept without accent in strict mode', () => {
    const handler = new SpanishHandler();
    handler.setMode('strict');
    
    const target = {
      text: 'adiós',
      acceptedInputs: ['adiós'],
      level: 1,
    };
    handler.setTarget(target);

    let result;
    for (const char of 'adios') {
      result = handler.handleKey({ key: char } as KeyboardEvent);
    }

    expect(result?.completed).toBe(false);
  });
});
