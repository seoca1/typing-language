import { useState } from 'react';
import type { RefObject } from 'react';
import type { GameState } from '../state/gameReducer.js';
import type { StageConfig } from '../types.js';
import { getAudioManager } from '../audio/AudioManager.js';

interface StageScreenProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  state: GameState;
  stage: StageConfig | null;
  languageLabel: string;
  canvasWidth?: number;
  canvasHeight?: number;
  /** Called when the user clicks on the canvas — receives canvas-relative (x, y) */
  onCanvasClick?: (x: number, y: number) => void;
  /** Called when the user clicks the Back to Menu button */
  onBackToMenu?: () => void;
}

export function StageScreen({
  canvasRef,
  state,
  stage,
  languageLabel,
  canvasWidth = 1024,
  canvasHeight = 880,
  onCanvasClick,
  onBackToMenu,
}: StageScreenProps) {
  const audio = getAudioManager();
  const [volume, setVolume] = useState(audio.getVolume());
  const [soundEnabled, setSoundEnabled] = useState(audio.isEnabled());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audio.setVolume(newVolume);
  };

  const toggleSound = () => {
    const newEnabled = !soundEnabled;
    setSoundEnabled(newEnabled);
    audio.setEnabled(newEnabled);
  };

  /**
   * Convert a click event on the canvas to canvas-relative coordinates.
   * The canvas may be CSS-scaled (e.g., responsive layout), so we need to
   * scale the clientX/clientY by the actual canvas resolution ratio.
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasClick || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    onCanvasClick(x, y);
  };

  return (
    <div className="stage-screen">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="game-canvas"
        onClick={handleCanvasClick}
        style={{ cursor: onCanvasClick ? 'pointer' : 'default' }}
      />
      <aside className="stage-info">
        <h2>
          <span className="lang-badge">{languageLabel}</span> {stage?.name}
          {stage?.language === 'es' && stage.accentMode && (
            <span className={`mode-badge mode-${stage.accentMode}`}>
              {stage.accentMode === 'strict' ? '⌨️ Strict' : '⌨️ Loose'}
            </span>
          )}
        </h2>
        <p>{stage?.description}</p>
        {stage?.language === 'es' && stage.accentMode && (
          <div className="keyboard-mode-info">
            {stage.accentMode === 'strict' ? (
              <small>⚠️ 스페인어 키보드 필요: á, é, í, ó, ú, ñ 직접 입력</small>
            ) : (
              <small>✓ 영어 키보드 가능: a→á, e→é 자동 인식</small>
            )}
          </div>
        )}
        <div className="missions">
          <h3>Missions</h3>
          {stage?.missions.map((m) => (
            <div key={m.id} className="mission">
              <strong>{m.name}</strong>
              <p>{m.description}</p>
            </div>
          ))}
        </div>
        <div className="hud-info">
          <p>Score: {state.score}</p>
          <p>Defeated: {state.enemiesDefeated}</p>
          <p>Combo: {state.combo} (max: {state.comboMax})</p>
          <p>WPM: {state.wpm.toFixed(0)}</p>
          <p>ACC: {state.accuracy.toFixed(0)}%</p>
        </div>
        <div className="audio-controls">
          <h3>Audio</h3>
          <div className="audio-toggle">
            <button onClick={toggleSound} className="toggle-btn">
              {soundEnabled ? '🔊' : '🔇'} {soundEnabled ? 'On' : 'Off'}
            </button>
          </div>
          {soundEnabled && (
            <div className="volume-slider">
              <label>
                Volume: {Math.round(volume * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                />
              </label>
            </div>
          )}
        </div>
        <button onClick={onBackToMenu}>
          Back to Menu (Esc)
        </button>
      </aside>
    </div>
  );
}