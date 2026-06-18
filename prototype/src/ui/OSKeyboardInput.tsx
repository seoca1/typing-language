/**
 * OS Keyboard Input Component
 *
 * Uses the OS-provided keyboard/IME instead of custom virtual keyboards.
 * Works on both PC (physical keyboard + IME) and mobile (OS virtual keyboard).
 *
 * Architecture:
 * - Hidden <input> element captures OS keyboard input
 * - On mobile: focusing the input triggers the OS virtual keyboard
 * - On PC: physical keyboard events bubble up to the input element
 * - IME languages (ja, zh) use OS IME for conversion
 * - lang attribute hints which OS keyboard to show (korean, japanese, etc.)
 */

import { useEffect, useRef } from 'react';
import type { Language } from '../types.js';

interface OSKeyboardInputProps {
  /** Whether the input is enabled (e.g., during gameplay) */
  enabled: boolean;
  /** Game language — controls which OS keyboard layout to request */
  language: Language;
  /** Called when user types a character */
  onChar: (char: string) => void;
  /** Called when user presses Backspace */
  onBackspace: () => void;
  /** Called when user presses Enter */
  onEnter: () => void;
  /** Called when user presses Escape */
  onEscape?: () => void;
  /** Called when composition (IME) starts */
  onCompositionStart?: () => void;
  /** Called when composition (IME) updates with intermediate text */
  onCompositionUpdate?: (data: string) => void;
  /** Called when composition (IME) ends with final text */
  onCompositionEnd?: (data: string) => void;
}

/**
 * Map game language to inputMode for mobile keyboards
 *
 * inputMode hints which virtual keyboard to show on mobile devices.
 * See: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/inputmode
 */
function getInputMode(lang: Language): 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined {
  switch (lang) {
    case 'kr':
      return undefined; // OS default works well
    case 'jp':
      return undefined;
    case 'es':
      return 'text';
    default:
      return 'text';
  }
}

/**
 * Map game language to OS language code (BCP 47)
 */
function getLangCode(lang: Language): string {
  return lang;
}

export function OSKeyboardInput({
  enabled,
  language,
  onChar,
  onBackspace,
  onEnter,
  onEscape,
  onCompositionStart,
  onCompositionUpdate,
  onCompositionEnd,
}: OSKeyboardInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);
  const lastValueRef = useRef('');

  // Focus / blur based on enabled state
  useEffect(() => {
    if (!enabled) {
      inputRef.current?.blur();
      return;
    }
    // Focus the input to trigger OS keyboard on mobile
    const focusInput = () => {
      inputRef.current?.focus();
    };
    // Defer to next tick so the DOM is ready
    const timer = setTimeout(focusInput, 50);
    return () => clearTimeout(timer);
  }, [enabled]);

  // Re-focus when language changes (so OS picks the right keyboard)
  useEffect(() => {
    if (enabled) {
      inputRef.current?.focus();
    }
  }, [language, enabled]);

  // PC physical keyboard events (mobile OS keyboard also fires keydown)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if IME composition is active (let OS handle it)
      if (e.isComposing) return;
      if (e.key === 'CompositionStart' as any) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter();
        return;
      }
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }
      // Single character keys are handled via input event
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onBackspace, onEnter, onEscape]);

  /**
   * Handle input event (covers both PC physical keyboard and OS mobile keyboard)
   *
   * On mobile: OS keyboard inserts composed text. We compare with previous value
   * to figure out what was typed.
   * On PC: same event fires for physical keyboard input.
   * On IME: compositionstart/update/end events fire during conversion.
   */
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (!enabled) return;
    const input = e.currentTarget;
    const value = input.value;
    const prev = lastValueRef.current;

    if (composingRef.current) {
      // IME is composing — skip char-level processing
      // The final result will come via onCompositionEnd
      return;
    }

    if (value.length > prev.length) {
      // New character(s) appended
      const newChars = value.slice(prev.length);
      for (const ch of newChars) {
        onChar(ch);
      }
    } else if (value.length < prev.length) {
      // Character(s) deleted (e.g., Backspace on mobile keyboard)
      const diff = prev.length - value.length;
      for (let i = 0; i < diff; i++) {
        onBackspace();
      }
    }

    lastValueRef.current = '';
    input.value = '';
  };

  const handleCompositionStart = () => {
    composingRef.current = true;
    onCompositionStart?.();
  };

  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLInputElement>) => {
    if (e.data) {
      onCompositionUpdate?.(e.data);
    }
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    composingRef.current = false;
    const finalText = e.data || '';
    if (finalText) {
      onCompositionEnd?.(finalText);
      // Pass each char of the final composed text
      for (const ch of finalText) {
        onChar(ch);
      }
    }
    // Clear input after composition ends
    e.currentTarget.value = '';
    lastValueRef.current = '';
  };

  return (
    <input
      ref={inputRef}
      type="text"
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      inputMode={getInputMode(language)}
      lang={getLangCode(language)}
      aria-label={`${language} typing input`}
      onInput={handleInput}
      onCompositionStart={handleCompositionStart}
      onCompositionUpdate={handleCompositionUpdate}
      onCompositionEnd={handleCompositionEnd}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'auto',
        zIndex: -1,
      }}
    />
  );
}
