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
  flash: Flash | null;
  shake: ScreenShake | null;
}

export function createEffectsState(): EffectsState {
  return {
    particles: [],
    floatingTexts: [],
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