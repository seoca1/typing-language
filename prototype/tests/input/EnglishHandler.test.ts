/**
 * English Input Handler Tests
 *
 * 가장 단순한 핸들러. 직접 타이핑 검증.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EnglishHandler } from '../../src/input/EnglishHandler.js';
import type { Target } from '../../src/types.js';

describe('EnglishHandler', () => {
  let handler: EnglishHandler;

  beforeEach(() => {
    handler = new EnglishHandler();
  });

  describe('Basic Properties', () => {
    it('should have language "en"', () => {
      expect(handler.language).toBe('en');
    });

    it('should start with empty buffer', () => {
      expect(handler.getBuffer()).toBe('');
    });

    it('should start with 100% accuracy', () => {
      expect(handler.getAccuracy()).toBe(100);
    });
  });

  describe('Simple Word Input', () => {
    it('should match "hello"', () => {
      const target: Target = {
        text: 'hello',
        acceptedInputs: ['hello'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      handler.handleKey(mockEvent('h'));
      expect(handler.getBuffer()).toBe('h');

      handler.handleKey(mockEvent('e'));
      expect(handler.getBuffer()).toBe('he');

      handler.handleKey(mockEvent('l'));
      handler.handleKey(mockEvent('l'));
      handler.handleKey(mockEvent('o'));

      expect(handler.getBuffer()).toBe('hello');
    });

    it('should complete target when fully typed', () => {
      const target: Target = {
        text: 'cat',
        acceptedInputs: ['cat'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      handler.handleKey(mockEvent('c'));
      handler.handleKey(mockEvent('a'));
      const result = handler.handleKey(mockEvent('t'));

      expect(result.completed).toBe(true);
      expect(result.buffer).toBe('cat');
    });
  });

  describe('Case Sensitivity', () => {
    it('should accept lowercase input for lowercase target', () => {
      const target: Target = {
        text: 'apple',
        acceptedInputs: ['apple'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      'apple'.split('').forEach((char) => handler.handleKey(mockEvent(char)));

      expect(handler.getBuffer()).toBe('apple');
    });

    it('should accept uppercase input for uppercase target', () => {
      const target: Target = {
        text: 'HELLO',
        acceptedInputs: ['HELLO'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      'HELLO'.split('').forEach((char) => handler.handleKey(mockEvent(char)));

      expect(handler.getBuffer()).toBe('HELLO');
    });

    it('should accept mixed case', () => {
      const target: Target = {
        text: 'TypeScript',
        acceptedInputs: ['TypeScript'],
        level: 2,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      'TypeScript'.split('').forEach((char) => handler.handleKey(mockEvent(char)));

      expect(handler.getBuffer()).toBe('TypeScript');
    });
  });

  describe('Punctuation and Special Characters', () => {
    it('should handle periods', () => {
      const target: Target = {
        text: 'Hello.',
        acceptedInputs: ['Hello.'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      'Hello.'.split('').forEach((char) => handler.handleKey(mockEvent(char)));

      expect(handler.getBuffer()).toBe('Hello.');
    });

    it('should handle commas', () => {
      const target: Target = {
        text: 'Hello, world',
        acceptedInputs: ['Hello, world'],
        level: 2,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      'Hello, world'.split('').forEach((char) => handler.handleKey(mockEvent(char)));

      expect(handler.getBuffer()).toBe('Hello, world');
    });

    it('should handle question marks', () => {
      const target: Target = {
        text: 'How are you?',
        acceptedInputs: ['How are you?'],
        level: 2,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      'How are you?'.split('').forEach((char) => handler.handleKey(mockEvent(char)));

      expect(handler.getBuffer()).toBe('How are you?');
    });
  });

  describe('Backspace Handling', () => {
    it('should remove last character on backspace', () => {
      const target: Target = {
        text: 'hello',
        acceptedInputs: ['hello'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      handler.handleKey(mockEvent('h'));
      handler.handleKey(mockEvent('e'));
      handler.handleKey(mockEvent('l'));

      expect(handler.getBuffer()).toBe('hel');

      handler.handleKey(mockEvent('Backspace'));
      expect(handler.getBuffer()).toBe('he');

      handler.handleKey(mockEvent('Backspace'));
      expect(handler.getBuffer()).toBe('h');
    });

    it('should not remove from empty buffer', () => {
      const target: Target = {
        text: 'hello',
        acceptedInputs: ['hello'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      handler.handleKey(mockEvent('Backspace'));
      expect(handler.getBuffer()).toBe('');
    });
  });

  describe('Accuracy Tracking', () => {
    it('should maintain 100% accuracy on correct input', () => {
      const target: Target = {
        text: 'hello',
        acceptedInputs: ['hello'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      'hello'.split('').forEach((char) => handler.handleKey(mockEvent(char)));

      expect(handler.getAccuracy()).toBe(100);
    });

    it('should decrease accuracy on wrong input', () => {
      const target: Target = {
        text: 'hello',
        acceptedInputs: ['hello'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      handler.handleKey(mockEvent('h')); // correct
      handler.handleKey(mockEvent('x')); // wrong
      handler.handleKey(mockEvent('e')); // correct

      const accuracy = handler.getAccuracy();
      expect(accuracy).toBeLessThan(100);
      expect(accuracy).toBeGreaterThan(0);
    });
  });

  describe('Expected Character', () => {
    it('should return next expected character', () => {
      const target: Target = {
        text: 'hello',
        acceptedInputs: ['hello'],
        level: 1,
      };
      handler.setTarget(target);

      expect(handler.getExpectedChar()).toBe('h');

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      handler.handleKey(mockEvent('h'));
      expect(handler.getExpectedChar()).toBe('e');

      handler.handleKey(mockEvent('e'));
      expect(handler.getExpectedChar()).toBe('l');
    });

    it('should return empty string when target is complete', () => {
      const target: Target = {
        text: 'hi',
        acceptedInputs: ['hi'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      handler.handleKey(mockEvent('h'));
      handler.handleKey(mockEvent('i'));

      expect(handler.getExpectedChar()).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty target', () => {
      const result = handler.handleKey({
        key: 'a',
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      expect(result.completed).toBe(false);
      expect(result.buffer).toBe('');
    });

    it('should ignore composition events', () => {
      const target: Target = {
        text: 'hello',
        acceptedInputs: ['hello'],
        level: 1,
      };
      handler.setTarget(target);

      const result = handler.handleKey({
        key: 'h',
        isComposing: true,
        preventDefault: () => {},
      } as KeyboardEvent);

      expect(handler.getBuffer()).toBe('');
      expect(result.completed).toBe(false);
    });

    it('should ignore special keys (longer than 1 char)', () => {
      const target: Target = {
        text: 'hello',
        acceptedInputs: ['hello'],
        level: 1,
      };
      handler.setTarget(target);

      handler.handleKey({
        key: 'Shift',
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      handler.handleKey({
        key: 'Control',
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      expect(handler.getBuffer()).toBe('');
    });

    it('should handle reset correctly', () => {
      const target: Target = {
        text: 'hello',
        acceptedInputs: ['hello'],
        level: 1,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      handler.handleKey(mockEvent('h'));
      handler.handleKey(mockEvent('e'));

      handler.reset();

      expect(handler.getBuffer()).toBe('');
      expect(handler.getAccuracy()).toBe(100);
    });
  });

  describe('Long Sentences', () => {
    it('should handle long sentences correctly', () => {
      const sentence = 'The quick brown fox jumps over the lazy dog.';
      const target: Target = {
        text: sentence,
        acceptedInputs: [sentence],
        level: 3,
      };
      handler.setTarget(target);

      const mockEvent = (key: string) => ({
        key,
        isComposing: false,
        preventDefault: () => {},
      } as KeyboardEvent);

      sentence.split('').forEach((char) => handler.handleKey(mockEvent(char)));

      expect(handler.getBuffer()).toBe(sentence);
      expect(handler.getAccuracy()).toBe(100);
    });
  });
});
