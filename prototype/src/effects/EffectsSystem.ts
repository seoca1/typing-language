/**
 * Effects System - 파티클, 팝업, 화면 흔들림, 플래시
 *
 * 단어/문장 격파 시 시각 피드백. 자세한 내용: ../../../design/GDD.md > "Feedback Loop"
 */

import type { Language } from '../types.js';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'star';
}

export interface FloatingText {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  color: string;
  fontSize: number;
  life: number;
  maxLife: number;
}

/**
 * FloatingWord - 떠다니는 단어 (다른 언어 번역 효과)
 * 입력한 단어 주변에 다른 언어 단어가 잠깐 떠다님
 */
export interface FloatingWord {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  lang: 'en' | 'jp' | 'es' | 'kr';
  color: string;
  fontSize: number;
  life: number;
  maxLife: number;
  /** 회전 각도 (도) */
  rotation: number;
}

/**
 * SentencePreview - 문장 미리보기 (영어 번역)
 * 문장 입력 시작 시 영어 번역이 잠깐 표시됨
 */
export interface SentencePreview {
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface Flash {
  life: number;
  maxLife: number;
  color: string;
  intensity: number;
}

export interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
  offsetX: number;
  offsetY: number;
}

export interface EffectsState {
  particles: Particle[];
  floatingTexts: FloatingText[];
  floatingWords: FloatingWord[];
  sentencePreview: SentencePreview | null;
  flash: Flash | null;
  shake: ScreenShake | null;
}

export function createEffectsState(): EffectsState {
  return {
    particles: [],
    floatingTexts: [],
    floatingWords: [],
    sentencePreview: null,
    flash: null,
    shake: null,
  };
}

export function updateEffects(state: EffectsState, dt: number): void {
  const dtSec = dt / 1000;

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dtSec;
    p.y += p.vy * dtSec;
    p.vy += 600 * dtSec;
    p.rotation += p.rotationSpeed * dtSec;
    p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }

  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const t = state.floatingTexts[i];
    t.x += t.vx * dtSec;
    t.y += t.vy * dtSec;
    t.vy *= 0.96;
    t.life -= dt;
    if (t.life <= 0) state.floatingTexts.splice(i, 1);
  }

  for (let i = state.floatingWords.length - 1; i >= 0; i--) {
    const w = state.floatingWords[i];
    w.x += w.vx * dtSec;
    w.y += w.vy * dtSec;
    w.vy *= 0.92;
    w.vx *= 0.96;
    w.rotation += 60 * dtSec;
    w.life -= dt;
    if (w.life <= 0) state.floatingWords.splice(i, 1);
  }

  if (state.sentencePreview) {
    state.sentencePreview.life -= dt;
    if (state.sentencePreview.life <= 0) {
      state.sentencePreview = null;
    }
  }

  if (state.flash) {
    state.flash.life -= dt;
    if (state.flash.life <= 0) state.flash = null;
  }

  if (state.shake) {
    state.shake.elapsed += dt;
    const decay = 1 - state.shake.elapsed / state.shake.duration;
    if (decay <= 0) {
      state.shake = null;
    } else {
      const current = state.shake.intensity * decay;
      state.shake.offsetX = (Math.random() - 0.5) * current * 2;
      state.shake.offsetY = (Math.random() - 0.5) * current * 2;
    }
  }
}

export function spawnHitBurst(state: EffectsState, x: number, y: number, color: string, count = 24): void {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
    const speed = 180 + Math.random() * 220;
    const shapes: Particle['shape'][] = ['circle', 'square', 'star'];
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      life: 600 + Math.random() * 400,
      maxLife: 1000,
      color,
      size: 3 + Math.random() * 4,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    });
  }
}

export function spawnColorShower(state: EffectsState, x: number, y: number, colors: string[], count = 30): void {
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = 250 + Math.random() * 350;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 800 + Math.random() * 600,
      maxLife: 1400,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 5,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: 'star',
    });
  }
}

export function spawnPopup(
  state: EffectsState,
  x: number,
  y: number,
  text: string,
  color: string,
  fontSize = 36,
): void {
  state.floatingTexts.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 40,
    vy: -120,
    text,
    color,
    fontSize,
    life: 1000,
    maxLife: 1000,
  });
}

export function spawnFlash(state: EffectsState, color: string, intensity = 0.6, duration = 120): void {
  state.flash = { color, intensity, life: duration, maxLife: duration };
}

export function triggerShake(state: EffectsState, intensity: number, duration: number): void {
  state.shake = {
    intensity,
    duration,
    elapsed: 0,
    offsetX: 0,
    offsetY: 0,
  };
}

/**
 * 다른 언어 단어를 주변에 효과처럼 띄움 (단어 입력 시)
 * @param centerX - 중심 x 좌표
 * @param centerY - 중심 y 좌표
 * @param words - 표시할 단어 배열 (각각 다른 언어)
 */
/**
 * Floating word perimeter positions (canvas corners + edges).
 * These are the "safe zones" that don't overlap with the target text
 * (y ~200-300), input buffer (y ~400-500), or virtual keyboard (y > 580).
 *
 * The renderer cycles through these slots so multiple words don't
 * stack on top of each other.
 *
 * Coordinates assume a 1024x880 canvas — if different, the caller
 * can pass width/height via the optional `bounds` parameter.
 */
const DEFAULT_PERIMETER_SLOTS: ReadonlyArray<{ x: number; y: number }> = [
  // Top edge (above target text)
  { x: 180, y: 50 },
  { x: 380, y: 35 },
  { x: 644, y: 35 },
  { x: 844, y: 50 },
  // Mid edges (left/right of canvas, between target and input)
  { x: 60, y: 280 },
  { x: 964, y: 280 },
];

export interface FloatingWordsBounds {
  width: number;
  height: number;
}

export function spawnFloatingWords(
  state: EffectsState,
  _centerX: number,
  _centerY: number,
  words: Array<{ text: string; lang: 'en' | 'jp' | 'es' | 'kr' }>,
  bounds: FloatingWordsBounds = { width: 1024, height: 880 },
): void {
  // Cap concurrent floating words to avoid clutter.
  // Make room for incoming words (cap at 6 total)
  const CAP = 6;
  const roomNeeded = CAP - state.floatingWords.length;
  if (roomNeeded < words.length) {
    const toShift = words.length - roomNeeded;
    for (let i = 0; i < toShift; i++) {
      state.floatingWords.shift();
    }
  }

  // Scale perimeter slots to actual canvas size (proportional to default 1024×880)
  const scaleX = bounds.width / 1024;
  const scaleY = bounds.height / 880;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    // Cycle through perimeter slots so words spread across the canvas
    // instead of stacking in the center where the text lives.
    const slotIdx = (state.floatingWords.length + i) % DEFAULT_PERIMETER_SLOTS.length;
    const slot = DEFAULT_PERIMETER_SLOTS[slotIdx];
    const targetX = slot.x * scaleX + (Math.random() - 0.5) * 30;
    const targetY = slot.y * scaleY + (Math.random() - 0.5) * 20;

    // Spawn at a random perimeter slot too (not at center) so words
    // don't fly inward toward the text. Add slight randomness.
    const spawnSlot = DEFAULT_PERIMETER_SLOTS[(slotIdx + 1) % DEFAULT_PERIMETER_SLOTS.length];
    const startX = spawnSlot.x * scaleX + (Math.random() - 0.5) * 40;
    const startY = spawnSlot.y * scaleY + (Math.random() - 0.5) * 20;

    // Gentle drift velocity toward target slot (no big arc)
    const vx = (targetX - startX) * 0.15 + (Math.random() - 0.5) * 8;
    const vy = (targetY - startY) * 0.15 + (Math.random() - 0.5) * 8;

    state.floatingWords.push({
      x: startX,
      y: startY,
      vx,
      vy,
      text: w.text,
      lang: w.lang,
      color: getLangColor(w.lang),
      fontSize: 20 + Math.random() * 6, // 20-26px (was 14-18)
      life: 1700 + Math.random() * 400, // 1.7-2.1s (was 1.3-1.6s)
      maxLife: 2100,
      rotation: (Math.random() - 0.5) * 16, // a bit more tilt for liveliness
    });
  }
}

/**
 * 문장 영어 번역 미리보기 표시 (문장 입력 시)
 * @param text - 영어 번역 텍스트
 * @param x - 표시 x 좌표
 * @param y - 표시 y 좌표
 * @param duration - 표시 시간 (기본 2.5초)
 */
export function showSentencePreview(
  state: EffectsState,
  text: string,
  x: number,
  y: number,
  duration = 2500,
): void {
  state.sentencePreview = {
    text,
    x,
    y,
    life: duration,
    maxLife: duration,
    color: '#a0d8ff',
  };
}

function getLangColor(lang: 'en' | 'jp' | 'es' | 'kr'): string {
  switch (lang) {
    case 'en':
      return '#3b82f6'; // blue
    case 'jp':
      return '#ec4899'; // pink
    case 'es':
      return '#f59e0b'; // orange
    case 'kr':
      return '#10b981'; // green
    default:
      return '#ffffff';
  }
}

export function getShakeOffset(state: EffectsState): { x: number; y: number } {
  if (!state.shake) return { x: 0, y: 0 };
  return { x: state.shake.offsetX, y: state.shake.offsetY };
}

export function getLanguageAccent(language: Language): string[] {
  switch (language) {
    case 'en':
      return ['#00d9ff', '#00ff88', '#ffd700'];
    case 'jp':
      return ['#ff6b9d', '#ff4757', '#ffa502'];
    case 'es':
      return ['#ffdd59', '#ff6348', '#7bed9f'];
    case 'kr':
      return ['#ffb6c1', '#5b9bd5', '#ffd700'];
    default:
      return ['#ffffff'];
  }
}