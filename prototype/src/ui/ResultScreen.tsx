import type { MissionConfig } from '../types.js';

interface ResultScreenProps {
  score: number;
  enemiesDefeated: number;
  missions: MissionConfig[];
  results: { missionId: string; cleared: boolean }[];
  onBack: () => void;
}

export function ResultScreen({ score, enemiesDefeated, missions, results, onBack }: ResultScreenProps) {
  return (
    <div className="result-screen">
      <h1>Stage Result</h1>
      <div className="result-summary">
        <p>Score: <strong>{score}</strong></p>
        <p>Defeated: <strong>{enemiesDefeated}</strong></p>
      </div>
      <div className="result-missions">
        <h2>Missions</h2>
        {missions.map((m) => {
          const result = results.find((r) => r.missionId === m.id);
          const cleared = result?.cleared ?? false;
          return (
            <div key={m.id} className={`mission-result ${cleared ? 'cleared' : 'failed'}`}>
              <strong>{cleared ? '✓' : '✗'} {m.name}</strong>
              <p>{m.description}</p>
            </div>
          );
        })}
      </div>
      <button onClick={onBack}>Back to Menu</button>
    </div>
  );
}