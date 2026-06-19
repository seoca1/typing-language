import { useState, useMemo } from 'react';
import type { MissionConfig } from '../types.js';
import { DailyLessonCard } from './DailyLessonCard.js';
import { DailyLessonModal } from './DailyLessonModal.js';
import {
  getNextDailyLesson,
  type DailyLesson,
} from '../data/dailyLessons.js';

interface ResultScreenProps {
  score: number;
  enemiesDefeated: number;
  missions: MissionConfig[];
  results: { missionId: string; cleared: boolean }[];
  onBack: () => void;
  /** Current stage language — used to select language-appropriate daily lesson */
  currentLanguage?: 'en' | 'jp' | 'es' | 'kr';
  /** Callback to start a practice stage from the daily lesson card */
  onPracticeStage?: (stageId: string) => void;
}

export function ResultScreen({
  score,
  enemiesDefeated,
  missions,
  results,
  onBack,
  currentLanguage,
  onPracticeStage,
}: ResultScreenProps) {
  const [dailyLessonOpen, setDailyLessonOpen] = useState(false);
  const [dailyLessonDismissed, setDailyLessonDismissed] = useState(false);

  // Pick today's lesson for the current language (deterministic by date)
  const dailyLesson: DailyLesson | null = useMemo(() => {
    if (!currentLanguage) return null;
    return getNextDailyLesson({ language: currentLanguage });
  }, [currentLanguage]);

  const handleOpenLesson = () => {
    setDailyLessonOpen(true);
  };

  const handleSkipLesson = () => {
    setDailyLessonDismissed(true);
  };

  const handlePractice = (stageId: string) => {
    if (onPracticeStage) {
      onPracticeStage(stageId);
    }
  };

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

      {/* Daily Lesson integration — shown after a stage clear */}
      {dailyLesson && !dailyLessonDismissed && !dailyLessonOpen && (
        <DailyLessonCard
          lesson={dailyLesson}
          onOpen={handleOpenLesson}
          onSkip={handleSkipLesson}
          onPractice={handlePractice}
        />
      )}

      {dailyLessonOpen && dailyLesson && (
        <DailyLessonModal
          lesson={dailyLesson}
          onClose={() => setDailyLessonOpen(false)}
          onPractice={handlePractice}
        />
      )}

      <button onClick={onBack}>Back to Menu</button>
    </div>
  );
}
