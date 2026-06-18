/**
 * Virtual Keyboard for Mobile Devices
 */

import { useState } from 'react';
import type { Language } from '../types.js';

interface VirtualKeyboardProps {
  language: Language;
  onKeyPress: (key: string) => void;
  expectedChar?: string | null;
}

const LAYOUTS: Record<Language, string[][]> = {
  en: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ],
  jp: [
    ['a', 'i', 'u', 'e', 'o'],
    ['k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w'],
    ['g', 'z', 'd', 'b', 'p'],
  ],
  es: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ['á', 'é', 'í', 'ó', 'ú', '¿', '¡'], // Accent row
  ],
  kr: [
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ'],
  ],
};

export function VirtualKeyboard({ language, onKeyPress, expectedChar }: VirtualKeyboardProps) {
  const [shift, setShift] = useState(false);
  const layout = LAYOUTS[language] || LAYOUTS.en;

  const handleKeyClick = (key: string) => {
    // Spanish: shift disabled (accent row handles accents directly)
    // Other languages: apply shift
    const finalKey = shift && language !== 'es' ? key.toUpperCase() : key;
    onKeyPress(finalKey);
    if (shift && language !== 'es') setShift(false); // Auto-unshift after key press
  };

  const handleBackspace = () => {
    onKeyPress('Backspace');
  };

  const handleEnter = () => {
    onKeyPress('Enter');
  };

  const handleSpace = () => {
    onKeyPress(' ');
  };

  return (
    <div className="virtual-keyboard">
      {layout.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.map((key) => {
            const displayKey = shift ? key.toUpperCase() : key;
            const isExpected = expectedChar && displayKey.toLowerCase() === expectedChar.toLowerCase();
            
            return (
              <button
                key={key}
                className={`key ${isExpected ? 'key-expected' : ''}`}
                onClick={() => handleKeyClick(key)}
              >
                {displayKey}
              </button>
            );
          })}
        </div>
      ))}
      <div className="keyboard-row keyboard-controls">
        <button className="key key-shift" onClick={() => setShift(!shift)}>
          {shift ? '⬆' : '⇧'}
        </button>
        <button className="key key-space" onClick={handleSpace}>
          Space
        </button>
        <button className="key key-backspace" onClick={handleBackspace}>
          ⌫
        </button>
        <button className="key key-enter" onClick={handleEnter}>
          Enter
        </button>
      </div>
    </div>
  );
}
