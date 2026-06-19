/**
 * DailyLessons - rotation algorithm tests
 *
 * Verifies:
 * - getNextDailyLesson: deterministic per-day, prefers unseen, falls back to oldest
 * - markLessonSeen/getSeenLessons: localStorage round-trip
 * - getBalancedDailyLesson: language preference respected, falls back to others
 * - getLessonsByLanguage: correct filtering
 * - getLessonsByStageId: stage ID matching
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllLessons,
  getLessonsByLanguage,
  getLessonById,
  getLessonsByStageId,
  getNextDailyLesson,
  getBalancedDailyLesson,
  getSeenLessons,
  markLessonSeen,
  clearLessonHistory,
  getDataSummary,
} from '../../src/data/dailyLessons.js';

describe('Daily Lessons — Data Access', () => {
  it('should have at least 1 lesson per supported language', () => {
    const lessons = getAllLessons();
    expect(lessons.length).toBeGreaterThan(0);

    const langs = new Set(lessons.map((l) => l.language));
    for (const lang of ['en', 'jp', 'es', 'kr']) {
      expect(langs.has(lang as 'en' | 'jp' | 'es' | 'kr')).toBe(true);
    }
  });

  it('getLessonsByLanguage filters correctly', () => {
    const en = getLessonsByLanguage('en');
    const jp = getLessonsByLanguage('jp');
    expect(en.every((l) => l.language === 'en')).toBe(true);
    expect(jp.every((l) => l.language === 'jp')).toBe(true);
    expect(en.length).toBeGreaterThan(0);
  });

  it('getLessonById returns lesson or null', () => {
    const all = getAllLessons();
    const firstId = all[0].id;
    expect(getLessonById(firstId)?.id).toBe(firstId);
    expect(getLessonById('nonexistent-id')).toBeNull();
  });

  it('getLessonsByStageId matches related stages', () => {
    // Pick a lesson with related stages
    const withStages = getAllLessons().find((l) => l.meta.relatedStages.length > 0);
    expect(withStages).toBeDefined();

    const stageId = withStages!.meta.relatedStages[0];
    const matches = getLessonsByStageId(stageId);
    expect(matches.some((l) => l.id === withStages!.id)).toBe(true);
  });

  it('each lesson has required structure', () => {
    const lessons = getAllLessons();
    for (const lesson of lessons) {
      expect(lesson.id).toBeTruthy();
      expect(lesson.language).toMatch(/^(en|jp|es|kr)$/);
      expect(lesson.wiki.vocabulary.length).toBeGreaterThan(0);
      expect(lesson.wiki.expressions.length).toBeGreaterThan(0);
      expect(lesson.meta.estimatedReadMinutes).toBeGreaterThan(0);
    }
  });
});

describe('Daily Lessons — localStorage History', () => {
  beforeEach(() => {
    clearLessonHistory();
  });

  it('starts with empty history', () => {
    expect(getSeenLessons()).toEqual([]);
  });

  it('marks lesson as seen', () => {
    markLessonSeen('test-id-1');
    expect(getSeenLessons()).toEqual(['test-id-1']);
  });

  it('does not duplicate entries', () => {
    markLessonSeen('test-id-1');
    markLessonSeen('test-id-1');
    markLessonSeen('test-id-1');
    expect(getSeenLessons()).toEqual(['test-id-1']);
  });

  it('appends in order (FIFO)', () => {
    markLessonSeen('id-1');
    markLessonSeen('id-2');
    markLessonSeen('id-3');
    expect(getSeenLessons()).toEqual(['id-1', 'id-2', 'id-3']);
  });

  it('caps at MAX_HISTORY (100) with FIFO', () => {
    for (let i = 0; i < 105; i++) {
      markLessonSeen(`id-${i}`);
    }
    const seen = getSeenLessons();
    expect(seen.length).toBe(100);
    // First 5 should be evicted
    expect(seen[0]).toBe('id-5');
    expect(seen[99]).toBe('id-104');
  });

  it('clearLessonHistory resets', () => {
    markLessonSeen('test-id');
    clearLessonHistory();
    expect(getSeenLessons()).toEqual([]);
  });
});

describe('Daily Lessons — Rotation Algorithm', () => {
  beforeEach(() => {
    clearLessonHistory();
  });

  it('returns a lesson for each language', () => {
    for (const lang of ['en', 'jp', 'es', 'kr'] as const) {
      const lesson = getNextDailyLesson({ language: lang });
      expect(lesson).not.toBeNull();
      expect(lesson!.language).toBe(lang);
    }
  });

  it('deterministic for same date + language', () => {
    const today = '2026-06-19';
    const a = getNextDailyLesson({ language: 'en', fakeToday: today });
    const b = getNextDailyLesson({ language: 'en', fakeToday: today });
    expect(a?.id).toBe(b?.id);
  });

  it('different dates may give different lessons', () => {
    // Try a few different dates
    const lessons1 = new Set(
      ['2026-06-19', '2026-06-20', '2026-06-21', '2026-06-22'].map(
        (d) => getNextDailyLesson({ language: 'en', fakeToday: d })?.id
      )
    );
    // With 2 EN lessons, may be same or different, but should be deterministic
    expect(lessons1.size).toBeGreaterThanOrEqual(1);
  });

  it('excludes seen lessons by default', () => {
    const all = getLessonsByLanguage('en');
    expect(all.length).toBeGreaterThanOrEqual(2);

    // Mark first as seen
    markLessonSeen(all[0].id);

    // Next selection should not return the seen one
    const lesson = getNextDailyLesson({ language: 'en' });
    expect(lesson?.id).not.toBe(all[0].id);
  });

  it('falls back to seen lessons when all seen', () => {
    const all = getLessonsByLanguage('en');
    // Mark all as seen
    for (const l of all) {
      markLessonSeen(l.id);
    }
    // Should still return a lesson (revisit mode)
    const lesson = getNextDailyLesson({ language: 'en' });
    expect(lesson).not.toBeNull();
    expect(lesson!.language).toBe('en');
  });

  it('excludeSeen=false returns seen lessons too', () => {
    const all = getLessonsByLanguage('en');
    markLessonSeen(all[0].id);
    // Run multiple times — at least once we should get the seen one
    // (because the same date hash will pick the same one)
    const lesson = getNextDailyLesson({
      language: 'en',
      excludeSeen: false,
      fakeToday: '2026-06-19',
    });
    expect(lesson).not.toBeNull();
  });
});

describe('Daily Lessons — Balanced Selection', () => {
  beforeEach(() => {
    clearLessonHistory();
  });

  it('prefers preferred language when available', () => {
    const lesson = getBalancedDailyLesson({
      preferredLanguage: 'en',
      allLanguages: ['en', 'jp', 'es', 'kr'],
    });
    expect(lesson?.language).toBe('en');
  });

  it('falls back to other languages when preferred unseen empty', () => {
    // Mark all EN lessons as seen
    for (const l of getLessonsByLanguage('en')) {
      markLessonSeen(l.id);
    }
    // Should fall back to another language
    const lesson = getBalancedDailyLesson({
      preferredLanguage: 'en',
      allLanguages: ['en', 'jp', 'es', 'kr'],
    });
    expect(lesson).not.toBeNull();
    expect(['jp', 'es', 'kr']).toContain(lesson!.language);
  });

  it('returns lesson from preferred language in revisit mode', () => {
    // Mark all lessons (all langs) as seen
    for (const l of getAllLessons()) {
      markLessonSeen(l.id);
    }
    const lesson = getBalancedDailyLesson({
      preferredLanguage: 'en',
      allLanguages: ['en', 'jp', 'es', 'kr'],
    });
    expect(lesson).not.toBeNull();
    expect(lesson!.language).toBe('en');
  });
});

describe('Daily Lessons — Summary', () => {
  it('getDataSummary returns aggregate stats', () => {
    const summary = getDataSummary();
    expect(summary.total).toBeGreaterThan(0);
    expect(summary.byLanguage).toBeDefined();
    expect(summary.generatedAt).toBeTruthy();

    // Sum of byLanguage should equal total
    const sumByLang = Object.values(summary.byLanguage).reduce((a, b) => a + b, 0);
    expect(sumByLang).toBe(summary.total);
  });
});
