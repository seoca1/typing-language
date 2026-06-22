import { useState, useEffect, useCallback } from 'react';
import { KOREAN_KEYBOARD_LAYOUT } from '../utils/keyboardLayout.js';

interface KoreanKeyboardWarningProps {
  onDismiss: () => void;
  onContinue: () => void;
}

export function KoreanKeyboardWarning({ onDismiss, onContinue }: KoreanKeyboardWarningProps) {
  const [detectedEnglish, setDetectedEnglish] = useState(false);
  const [typedKeys, setTypedKeys] = useState<string[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      const char = e.key.toLowerCase();
      setTypedKeys(prev => {
        const next = [...prev, char].slice(-5);
        return next;
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      onContinue();
    }
  }, [onContinue]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onDismiss();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const char = e.key.toLowerCase();
        setTypedKeys(prev => {
          const next = [...prev, char].slice(-5);
          return next;
        });
      } else if (e.key === 'Enter' || e.key === ' ') {
        onContinue();
      }
    };

    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [handleKeyDown, onDismiss, onContinue]);

  useEffect(() => {
    const recentKeys = typedKeys.slice(-3);
    const isEnglish = recentKeys.every(c => /^[a-z]$/.test(c));
    setDetectedEnglish(isEnglish && recentKeys.length >= 2);
  }, [typedKeys]);

  return (
    <div className="keyboard-warning-overlay">
      <div className="keyboard-warning-modal">
        <div className="keyboard-warning-header">
          <span className="warning-icon">⌨️</span>
          <h2>한국어 키보드 필요</h2>
        </div>

        {detectedEnglish && (
          <div className="keyboard-warning-alert">
            ⚠️ 영어 키보드로 감지됨. 한글 키보드로 전환하세요.
          </div>
        )}

        <p className="keyboard-warning-desc">
          이 스테이지를 플레이하려면 <strong>한국어(한글) 키보드</strong>가 필요합니다.
          한글 2벌식 키보드에서 자모를 직접 입력하세요.
        </p>

        <div className="keyboard-layout-preview">
          <h3>한글 키보드 자판</h3>
          <div className="keyboard-row">
            {KOREAN_KEYBOARD_LAYOUT.row1.map(k => (
              <div key={k.key} className="keyboard-key">
                <span className="key-en">{k.en}</span>
                <span className="key-ko">{k.ko}</span>
              </div>
            ))}
          </div>
          <div className="keyboard-row">
            {KOREAN_KEYBOARD_LAYOUT.row2.map(k => (
              <div key={k.key} className="keyboard-key">
                <span className="key-en">{k.en}</span>
                <span className="key-ko">{k.ko}</span>
              </div>
            ))}
          </div>
          <div className="keyboard-row">
            {KOREAN_KEYBOARD_LAYOUT.row3.map(k => (
              <div key={k.key} className="keyboard-key">
                <span className="key-en">{k.en}</span>
                <span className="key-ko">{k.ko}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="keyboard-warning-example">
          <h3>예시</h3>
          <div className="example-row">
            <span className="example-expected">한</span>
            <span className="example-keys">ㅎ + ㅏ + ㄴ</span>
            <span className="example-physical">HJK (영문)</span>
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

        <p className="keyboard-warning-hint">
          Mac: 시스템 설정 → 키보드 → 입력 소스에서 한국어 추가<br/>
          Windows: 설정 → 시간 및 언어 → 언어에서 한국어 추가
        </p>
      </div>
    </div>
  );
}
