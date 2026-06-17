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
}

export function StageScreen({ 
  canvasRef, 
  state, 
  stage, 
  languageLabel,
  canvasWidth = 1024,
  canvasHeight = 880,
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

  return (
    <div className="stage-screen">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="game-canvas"
      />
      <aside className="stage-info">
        <h2>
          <span className="lang-badge">{languageLabel}</span> {stage?.name}
        </h2>
        <p>{stage?.description}</p>
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
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}>
          Back to Menu (Esc)
        </button>
      </aside>
    </div>
  );
}