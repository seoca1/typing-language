/**
 * DailyLessonModal - Full-screen daily lesson viewer
 *
 * Displays the full daily lesson with:
 * - Source topic title
 * - Raw excerpt (original material)
 * - Vocabulary pages
 * - Expression pages
 * - Culture page (if present)
 * - Practice button (links to related game stage)
 * - Close button
 *
 * Renders content via MarkdownView (XSS-safe).
 */

import { useEffect } from 'react';
import type { DailyLesson } from '../data/dailyLessons.js';
import { LANGUAGE_LABEL, type Language } from '../types.js';
import { markLessonSeen } from '../data/dailyLessons.js';
import { MarkdownView } from './MarkdownView.js';

interface DailyLessonModalProps {
  lesson: DailyLesson;
  onClose: () => void;
  onPractice: (stageId: string) => void;
}

const LANG_COLORS: Record<Language, string> = {
  en: '#3b82f6',
  jp: '#ec4899',
  es: '#f59e0b',
  kr: '#10b981',
};

export function DailyLessonModal({ lesson, onClose, onPractice }: DailyLessonModalProps) {
  const color = LANG_COLORS[lesson.language];

  // Mark as seen when modal opens
  useEffect(() => {
    markLessonSeen(lesson.id);
  }, [lesson.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="daily-lesson-modal" onClick={onClose}>
      <div
        className="daily-lesson-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="daily-lesson-modal__header" style={{ background: color }}>
          <div>
            <div className="daily-lesson-modal__lang">{LANGUAGE_LABEL[lesson.language]}</div>
            <h2 className="daily-lesson-modal__title">오늘의 학습</h2>
            <div className="daily-lesson-modal__meta">
              {lesson.meta.estimatedReadMinutes}분 · {lesson.wiki.vocabulary.length} 단어 ·{' '}
              {lesson.wiki.expressions.length} 표현
              {lesson.wiki.culture && ' · 1 문화'}
            </div>
          </div>
          <button
            className="daily-lesson-modal__close"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="daily-lesson-modal__body">
          <section className="daily-lesson-modal__section">
            <h3 className="daily-lesson-modal__section-title">📜 원본 (Raw Material)</h3>
            <div className="daily-lesson-modal__raw-excerpt">
              {lesson.raw.excerpt}
            </div>
          </section>

          <section className="daily-lesson-modal__section">
            <h3 className="daily-lesson-modal__section-title">
              📚 어휘 ({lesson.wiki.vocabulary.length})
            </h3>
            {lesson.wiki.vocabulary.map((page) => (
              <details key={page.filename} className="daily-lesson-modal__page">
                <summary className="daily-lesson-modal__page-title">{page.title}</summary>
                <MarkdownView source={page.body} />
              </details>
            ))}
          </section>

          <section className="daily-lesson-modal__section">
            <h3 className="daily-lesson-modal__section-title">
              💬 표현 ({lesson.wiki.expressions.length})
            </h3>
            {lesson.wiki.expressions.map((page) => (
              <details key={page.filename} className="daily-lesson-modal__page">
                <summary className="daily-lesson-modal__page-title">{page.title}</summary>
                <MarkdownView source={page.body} />
              </details>
            ))}
          </section>

          {lesson.wiki.culture && (
            <section className="daily-lesson-modal__section">
              <h3 className="daily-lesson-modal__section-title">🌏 문화 노트</h3>
              <details open className="daily-lesson-modal__page">
                <summary className="daily-lesson-modal__page-title">
                  {lesson.wiki.culture.title}
                </summary>
                <MarkdownView source={lesson.wiki.culture.body} />
              </details>
            </section>
          )}
        </div>

        <div className="daily-lesson-modal__footer">
          {lesson.meta.relatedStages.length > 0 ? (
            <button
              className="daily-lesson-modal__practice-btn"
              style={{ background: color }}
              onClick={() => {
                onPractice(lesson.meta.relatedStages[0]);
                onClose();
              }}
            >
              🎮 연습하기 ({lesson.meta.relatedStages[0]})
            </button>
          ) : (
            <span className="daily-lesson-modal__no-practice">
              이 주제와 관련된 연습 스테이지가 곧 추가됩니다
            </span>
          )}
          <button className="daily-lesson-modal__close-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>

      <style>{`
        .daily-lesson-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          overflow-y: auto;
        }
        .daily-lesson-modal__content {
          background: #0d1420;
          border: 1px solid #1a2530;
          border-radius: 12px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .daily-lesson-modal__header {
          padding: 20px 24px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .daily-lesson-modal__lang {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          opacity: 0.85;
        }
        .daily-lesson-modal__title {
          font-size: 24px;
          margin: 4px 0;
        }
        .daily-lesson-modal__meta {
          font-size: 13px;
          opacity: 0.85;
        }
        .daily-lesson-modal__close {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .daily-lesson-modal__close:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .daily-lesson-modal__body {
          flex: 1;
          overflow-y: auto;
          padding: 16px 24px;
        }
        .daily-lesson-modal__section {
          margin-bottom: 24px;
        }
        .daily-lesson-modal__section-title {
          font-size: 16px;
          color: #ffaa55;
          margin: 0 0 8px 0;
          padding-bottom: 4px;
          border-bottom: 1px solid #1a2530;
        }
        .daily-lesson-modal__raw-excerpt {
          background: #06090f;
          border-left: 3px solid #ffaa55;
          padding: 12px 16px;
          color: #c5d4e3;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          font-style: italic;
        }
        .daily-lesson-modal__page {
          background: #06090f;
          border: 1px solid #1a2530;
          border-radius: 6px;
          margin-bottom: 8px;
          padding: 8px 12px;
        }
        .daily-lesson-modal__page summary {
          cursor: pointer;
          font-weight: 600;
          color: #66ffcc;
          font-size: 14px;
          padding: 4px 0;
          list-style: none;
        }
        .daily-lesson-modal__page summary::-webkit-details-marker {
          display: none;
        }
        .daily-lesson-modal__page summary::before {
          content: '▸ ';
          display: inline-block;
          transition: transform 0.15s;
        }
        .daily-lesson-modal__page[open] summary::before {
          content: '▾ ';
        }
        .daily-lesson-modal__page .markdown-view {
          margin-top: 8px;
          color: #c5d4e3;
          font-size: 13px;
          line-height: 1.6;
        }
        .daily-lesson-modal__page .markdown-view h1 { font-size: 16px; color: #00d9ff; }
        .daily-lesson-modal__page .markdown-view h2 { font-size: 14px; color: #00d9ff; }
        .daily-lesson-modal__page .markdown-view h3 { font-size: 13px; color: #ffaa55; }
        .daily-lesson-modal__page .markdown-view p { margin: 6px 0; }
        .daily-lesson-modal__page .markdown-view ul { margin: 6px 0; padding-left: 20px; }
        .daily-lesson-modal__page .markdown-view li { margin: 3px 0; }
        .daily-lesson-modal__page .markdown-view code {
          background: #1a2530;
          padding: 1px 4px;
          border-radius: 3px;
          font-size: 12px;
        }
        .daily-lesson-modal__page .markdown-view a.wikilink {
          color: #00d9ff;
          text-decoration: underline;
        }
        .daily-lesson-modal__page .markdown-view a.wikilink--broken {
          color: #6a7888;
          text-decoration: line-through;
        }
        .daily-lesson-modal__footer {
          display: flex;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #1a2530;
          background: #06090f;
        }
        .daily-lesson-modal__practice-btn {
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          flex: 1;
        }
        .daily-lesson-modal__close-btn {
          background: #1a2530;
          color: #c5d4e3;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }
        .daily-lesson-modal__no-practice {
          color: #6a7888;
          font-style: italic;
          flex: 1;
        }
      `}</style>
    </div>
  );
}
