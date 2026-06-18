/**
 * Keyboard (Canvas-based virtual keyboard) tests
 *
 * Verifies:
 * - Adaptive rowH fits layout within maxHeight (Spanish 6-row overflow fix)
 * - getKeyAt() correctly hit-tests keys at canvas-relative coordinates
 * - pressByEvent() visual feedback works for char keys and special keys
 * - getKeyAt() returns null for clicks outside any key
 */

import { describe, it, expect } from 'vitest';
import { Keyboard } from '../../src/engine/Keyboard.js';

describe('Keyboard — adaptive row height', () => {
  it('Spanish (6 rows) fits within maxHeight', () => {
    // 6 rows × 50px = 300px default; maxHeight=260 forces shrinking
    const kb = new Keyboard('es', 32, 610, 60, 50, 4, 260);
    const totalHeight = kb.getTotalHeight();
    expect(totalHeight).toBeLessThanOrEqual(260);
  });

  it('English (5 rows) does not shrink when within maxHeight', () => {
    const kb = new Keyboard('en', 32, 610, 60, 50, 4, 260);
    // 5 × 50 = 250 < 260 → keep rowH=50
    expect(kb.getRowHeight()).toBe(50);
  });

  it('Korean (4 rows) keeps default rowH', () => {
    const kb = new Keyboard('kr', 32, 610, 60, 50, 4, 260);
    expect(kb.getRowHeight()).toBe(50);
  });

  it('rowH is clamped to minimum 28px (keystay visible/clickable)', () => {
    // Tiny maxHeight forcing extreme shrink should clamp at 28
    const kb = new Keyboard('es', 32, 610, 60, 50, 4, 100);
    expect(kb.getRowHeight()).toBeGreaterThanOrEqual(28);
  });
});

describe('Keyboard — getKeyAt hit-testing', () => {
  it('returns label of key at given coords', () => {
    const kb = new Keyboard('en', 0, 0, 60, 50, 4, 260);
    // First key of row 0 is '`' at (0, 0), width=60
    expect(kb.getKeyAt(30, 25)).toBe('`');
    expect(kb.getKeyAt(5, 5)).toBe('`');
  });

  it('returns null for coords outside any key', () => {
    const kb = new Keyboard('en', 0, 0, 60, 50, 4, 260);
    expect(kb.getKeyAt(-1, 0)).toBeNull();
    expect(kb.getKeyAt(10000, 10000)).toBeNull();
  });

  it('hit-tests accent row keys for Spanish', () => {
    const kb = new Keyboard('es', 0, 0, 60, 50, 4, 260);
    // Accent row is the 6th row (index 5) — at y=5*rowH
    const accentRowY = 5 * kb.getRowHeight();
    // First accent key is 'á' at x=0
    const label = kb.getKeyAt(30, accentRowY + 10);
    expect(['á', 'é', 'í', 'ó', 'ú', '¿', '¡', 'ñ']).toContain(label);
  });

  it('hit-tests Korean jamo keys', () => {
    const kb = new Keyboard('kr', 0, 0, 60, 50, 4, 260);
    // First key of row 0 is 'ㄱ' at (0, 0)
    expect(kb.getKeyAt(30, 25)).toBe('ㄱ');
  });

  it('hit-tests Enter and Backspace (wide keys)', () => {
    const kb = new Keyboard('en', 0, 0, 60, 50, 4, 260);
    // Backspace is at the end of row 0 (width=2)
    // Tab is at start of row 1 (width=1.5)
    // Row 0, last key: Backspace
    const bsLabel = kb.getKeyAt(kb.getKeyBounds('Backspace')!.x + 10, 25);
    expect(bsLabel).toBe('Backspace');
  });
});

describe('Keyboard — pressByEvent visual feedback', () => {
  it('sets pressed=true on matching key', () => {
    const kb = new Keyboard('en', 0, 0, 60, 50, 4, 260);
    kb.pressByEvent('a');
    const state = kb.getDebugState();
    const aKey = state.find((k) => k.label === 'a');
    expect(aKey?.pressed).toBe(true);
  });

  it('handles special keys (Space, Backspace, Enter)', () => {
    const kb = new Keyboard('en', 0, 0, 60, 50, 4, 260);
    kb.pressByEvent(' ');
    kb.pressByEvent('Backspace');
    kb.pressByEvent('Enter');
    const state = kb.getDebugState();
    expect(state.find((k) => k.label === 'Space')?.pressed).toBe(true);
    expect(state.find((k) => k.label === 'Backspace')?.pressed).toBe(true);
    expect(state.find((k) => k.label === 'Enter')?.pressed).toBe(true);
  });

  it('handles Spanish accent keys (á, é, ñ, etc.)', () => {
    const kb = new Keyboard('es', 0, 0, 60, 50, 4, 260);
    kb.pressByEvent('á');
    kb.pressByEvent('ñ');
    const state = kb.getDebugState();
    expect(state.find((k) => k.label === 'á')?.pressed).toBe(true);
    expect(state.find((k) => k.label === 'ñ')?.pressed).toBe(true);
  });
});
