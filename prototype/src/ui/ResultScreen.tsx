import { useState, useMemo } from 'react';
import type { MissionConfig } from '../types.js';
import { DailyLessonCard } from './DailyLessonCard.js';
import { DailyLessonModal } from './DailyLessonModal.js';
import {
  getNextDailyLesson,
  type DailyLesson,
} from '../data/dailyLessons.js';
import {
  getSessionWeakWords,
  getOverallMastery,
  getAttemptedWordCount,
  getWordStats,
} from '../data/wordMastery.js';
import { getNativeLanguage } from '../data/nativeLanguage.js';
import { t } from '../data/uiTranslations.js';

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

  // Phase B-4: Weak Words from this session
  const sessionWeakWords = useMemo(() => {
    return getSessionWeakWords().map((id) => {
      const stats = getWordStats(id);
      return { id, stats };
    });
  }, []);

  // Phase B-4: Mastery overview
  const overallMastery = useMemo(() => getOverallMastery(), []);
  const attemptedWordCount = useMemo(() => getAttemptedWordCount(), []);

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

      {/* Phase B-4: Mastery Overview */}
      <div className="result-mastery">
        <h2>{t('learningProgress', getNativeLanguage())}</h2>
        <div className="mastery-bar">
          <div className="mastery-bar__fill" style={{ width: `${overallMastery}%` }}>
            <span className="mastery-bar__label">{overallMastery}%</span>
          </div>
        </div>
        <p className="mastery-meta">
          {t('masteryPercent', getNativeLanguage())} · {attemptedWordCount}{' '}
          {t('wordsLearned', getNativeLanguage())}
        </p>
      </div>

      {/* Phase B-4: Weak Words */}
      {sessionWeakWords.length > 0 && (
        <div className="result-weak-words">
          <h2>{t('weakWords', getNativeLanguage())}</h2>
          <p className="weak-words-hint">
            {(() => {
              const nl = getNativeLanguage();
              if (nl === 'ko')
                return '실수가 많았던 단어들입니다. 일일 학습에서 복습해보세요.';
              if (nl === 'ja')
                return 'ミスの多い単語です。毎日の学習で復習しましょう。';
              if (nl === 'es')
                return 'Palabras con más errores. Repásalas en la lección diaria.';
              return 'Words with many mistakes. Review them in the daily lesson.';
            })()}
          </p>
          <div className="weak-words-list">
            {sessionWeakWords.slice(0, 5).map(({ id, stats }) => (
              <div key={id} className="weak-word-chip">
                <span className="weak-word-id">{id}</span>
                <span className="weak-word-mistakes">
                  {stats?.mistakeCount ?? 0}{' '}
                  {(() => {
                    const nl = getNativeLanguage();
                    if (nl === 'ko') return '회 실수';
                    if (nl === 'ja') return '回ミス';
                    if (nl === 'es') return ' errores';
                    return ' mistakes';
                  })()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <style>{`
        .result-mastery {
          background: #0d1420;
          border: 1px solid #1a2530;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        .result-mastery h2 {
          font-size: 16px;
          color: #00d9ff;
          margin: 0 0 12px 0;
        }
        .mastery-bar {
          background: #1a2530;
          border-radius: 8px;
          height: 24px;
          overflow: hidden;
          position: relative;
        }
        .mastery-bar__fill {
          background: linear-gradient(90deg, #00d9ff, #66dd66);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          transition: width 0.3s;
          min-width: 40px;
        }
        .mastery-bar__label {
          color: #0d1420;
          font-weight: 700;
          font-size: 12px;
        }
        .mastery-meta {
          color: #6a7888;
          font-size: 12px;
          margin: 8px 0 0 0;
        }

        .result-weak-words {
          background: rgba(255, 102, 102, 0.05);
          border: 1px solid rgba(255, 102, 102, 0.3);
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        .result-weak-words h2 {
          font-size: 16px;
          color: #ff6666;
          margin: 0 0 8px 0;
        }
        .weak-words-hint {
          color: #b4d2fa;
          font-size: 12px;
          margin: 0 0 12px 0;
        }
        .weak-words-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .weak-word-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 102, 102, 0.15);
          border: 1px solid rgba(255, 102, 102, 0.4);
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 12px;
        }
        .weak-word-id {
          color: #fff;
          font-weight: 600;
        }
        .weak-word-mistakes {
          color: #ffaa55;
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}
