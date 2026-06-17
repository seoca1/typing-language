import type { RefObject } from 'react';
import type { GameState } from '../state/gameReducer.js';
import type { StageConfig } from '../types.js';

interface StageScreenProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  state: GameState;
  stage: StageConfig | null;
  languageLabel: string;
}

export function StageScreen({ canvasRef, state, stage, languageLabel }: StageScreenProps) {
  return (
    <div className="stage-screen">
      <canvas
        ref={canvasRef}
        width={1024}
        height={880}
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
        <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}>
          Back to Menu (Esc)
        </button>
      </aside>
    </div>
  );
}