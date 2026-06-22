import { useEffect, useCallback } from 'react';
import { ENGLISH_KEYBOARD_LAYOUT } from '../utils/keyboardLayout.js';

interface NonKoreanKeyboardWarningProps {
  onDismiss: () => void;
  onContinue: () => void;
}

export function NonKoreanKeyboardWarning({ onDismiss, onContinue }: NonKoreanKeyboardWarningProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onDismiss();
    } else if (e.key === 'Enter' || e.key === ' ') {
      onContinue();
    }
  }, [onDismiss, onContinue]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="keyboard-warning-overlay">
      <div className="keyboard-warning-modal">
        <div className="keyboard-warning-header">
          <span className="warning-icon">⌨️</span>
          <h2>키보드 입력 불일치</h2>
        </div>

        <div className="keyboard-warning-alert">
          ⚠️ 한국어 키보드 입력이 감지되었습니다.
        </div>

        <p className="keyboard-warning-desc">
          이 언어(<strong>EN/JP/ES</strong>)는 <strong>영문 키보드</strong>로 입력해야 합니다.
          영어/일본어/스페인어 문자를 직접 타이핑하세요.
        </p>

        <div className="keyboard-layout-preview">
          <h3>영문 키보드 자판</h3>
          <div className="keyboard-row">
            {ENGLISH_KEYBOARD_LAYOUT.row1.map(k => (
              <div key={k} className="keyboard-key">
                <span className="key-en">{k.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div className="keyboard-row">
            {ENGLISH_KEYBOARD_LAYOUT.row2.map(k => (
              <div key={k} className="keyboard-key">
                <span className="key-en">{k.toUpperCase()}</span>
              </div>
            ))}
          </div>
          <div className="keyboard-row">
            {ENGLISH_KEYBOARD_LAYOUT.row3.map(k => (
              <div key={k} className="keyboard-key">
                <span className="key-en">{k.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="keyboard-warning-example">
          <h3>일본어 예시</h3>
          <div className="example-row">
            <span className="example-expected">konnichiwa</span>
            <span className="example-keys">영문 키보드</span>
            <span className="example-physical">k-o-n-n-i-c-h-i-w-a</span>
          </div>
        </div>

        <div className="keyboard-warning-actions">
          <button onClick={onDismiss} className="warning-btn warning-btn-secondary">
            메뉴로 돌아가기 (Esc)
          </button>
          <button onClick={onContinue} className="warning-btn warning-btn-primary">
            계속 진행 (Enter)
          </button>
        </div>
      </div>
    </div>
  );
}
