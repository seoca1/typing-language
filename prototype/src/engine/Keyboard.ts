/**
 * Virtual Keyboard - QWERTY / 한글 2벌식 레이아웃
 *
 * 화면에 가상 키보드를 그리고, 사용자가 누른 키를 짧게 강조.
 * 다음에 눌러야 할 키(힌트)를 부드럽게 펄스 표시.
 *
 * ADR-0010: 한글 입력 방식:
 * - jamo 모드: korean2set 레이아웃 (자모 직접 입력)
 * - romanized 모드: QWERTY 레이아웃 (로마자 입력)
 */

import type { Language } from '../types.js';
import { getKoreanInputMode } from '../data/koreanInputMode.js';

interface KeyDef {
  label: string;
  display: string;
  width: number;
}

interface KeyState {
  label: string;
  display: string;
  width: number;
  x: number;
  y: number;
  w: number;
  h: number;
  pressed: boolean;
  pressTime: number;
  hinted: boolean;
}

export type KeyboardLayout = 'qwerty' | 'korean2set';

export class Keyboard {
  private keys: KeyState[] = [];
  private keyByLabel: Map<string, KeyState> = new Map();
  private lang: Language;
  private layout: KeyboardLayout;
  private originX: number;
  private originY: number;
  private unitW: number;
  private rowH: number;
  private gap: number;
  /** Total available vertical space; rows auto-shrink to fit */
  private maxHeight: number;

  constructor(
    lang: Language,
    originX: number,
    originY: number,
    unitW = 60,
    rowH = 50,
    gap = 4,
    maxHeight = 260,
  ) {
    this.lang = lang;
    let layout: KeyboardLayout;
    if (lang === 'kr') {
      layout = getKoreanInputMode() === 'romanized' ? 'qwerty' : 'korean2set';
    } else {
      layout = 'qwerty';
    }
    this.layout = layout;
    this.originX = originX;
    this.originY = originY;
    this.unitW = unitW;
    this.rowH = rowH;
    this.gap = gap;
    this.maxHeight = maxHeight;
    this.build();
  }

  setLanguage(lang: Language): void {
    if (this.lang === lang) return;
    this.lang = lang;
    let newLayout: KeyboardLayout;
    if (lang === 'kr') {
      newLayout = getKoreanInputMode() === 'romanized' ? 'qwerty' : 'korean2set';
    } else {
      newLayout = 'qwerty';
    }
    if (newLayout !== this.layout) {
      this.layout = newLayout;
      this.keys = [];
      this.keyByLabel.clear();
      this.build();
    }
  }

  setLayout(layout: KeyboardLayout): void {
    if (this.layout === layout) return;
    this.layout = layout;
    this.keys = [];
    this.keyByLabel.clear();
    this.build();
  }

  getLayout(): KeyboardLayout {
    return this.layout;
  }

  private build(): void {
    const layout = this.layout === 'korean2set' ? this.getKoreanLayout() : this.getQwertyLayout();

    // Adaptive rowH: shrink rows when total height would exceed maxHeight
    // (e.g., Spanish QWERTY + accent row = 6 rows must fit in available space)
    const rowCount = layout.length;
    let effectiveRowH = this.rowH;
    const totalHeight = rowCount * effectiveRowH;
    if (totalHeight > this.maxHeight && rowCount > 0) {
      effectiveRowH = Math.floor(this.maxHeight / rowCount);
      // Clamp to a sensible minimum so keys remain visible/clickable
      effectiveRowH = Math.max(effectiveRowH, 28);
    }

    layout.forEach((row, rowIdx) => {
      let x = this.originX;
      const y = this.originY + rowIdx * effectiveRowH;
      row.forEach((def) => {
        const w = def.width * this.unitW - this.gap;
        const state: KeyState = {
          label: def.label,
          display: def.display,
          width: def.width,
          x,
          y,
          w,
          h: effectiveRowH - this.gap,
          pressed: false,
          pressTime: 0,
          hinted: false,
        };
        this.keys.push(state);
        this.keyByLabel.set(def.label.toLowerCase(), state);
        x += def.width * this.unitW;
      });
    });
  }

  private getQwertyLayout(): KeyDef[][] {
    const isES = this.lang === 'es';

    const baseLayout: KeyDef[][] = [
      [
        { label: '`', display: '`', width: 1 },
        { label: '1', display: '1', width: 1 },
        { label: '2', display: '2', width: 1 },
        { label: '3', display: '3', width: 1 },
        { label: '4', display: '4', width: 1 },
        { label: '5', display: '5', width: 1 },
        { label: '6', display: '6', width: 1 },
        { label: '7', display: '7', width: 1 },
        { label: '8', display: '8', width: 1 },
        { label: '9', display: '9', width: 1 },
        { label: '0', display: '0', width: 1 },
        { label: '-', display: '-', width: 1 },
        { label: '=', display: '=', width: 1 },
        { label: 'Backspace', display: '⌫', width: 2 },
      ],
      [
        { label: 'Tab', display: 'Tab', width: 1.5 },
        { label: 'q', display: 'q', width: 1 },
        { label: 'w', display: 'w', width: 1 },
        { label: 'e', display: 'e', width: 1 },
        { label: 'r', display: 'r', width: 1 },
        { label: 't', display: 't', width: 1 },
        { label: 'y', display: 'y', width: 1 },
        { label: 'u', display: 'u', width: 1 },
        { label: 'i', display: 'i', width: 1 },
        { label: 'o', display: 'o', width: 1 },
        { label: 'p', display: 'p', width: 1 },
        { label: '[', display: isES ? '´\n[{' : '[', width: 1 },
        { label: ']', display: isES ? ']\nç}' : ']', width: 1 },
        { label: '\\', display: '\\', width: 1.5 },
      ],
      [
        { label: 'Caps', display: 'Caps', width: 1.75 },
        { label: 'a', display: 'a', width: 1 },
        { label: 's', display: 's', width: 1 },
        { label: 'd', display: 'd', width: 1 },
        { label: 'f', display: 'f', width: 1 },
        { label: 'g', display: 'g', width: 1 },
        { label: 'h', display: 'h', width: 1 },
        { label: 'j', display: 'j', width: 1 },
        { label: 'k', display: 'k', width: 1 },
        { label: 'l', display: 'l', width: 1 },
        { label: ';', display: isES ? 'ñ' : ';', width: 1 },
        { label: "'", display: isES ? 'áéíóú' : "'", width: 1 },
        { label: 'Enter', display: '⏎', width: 2.25 },
      ],
      [
        { label: 'Shift', display: 'Shift', width: 2.25 },
        { label: 'z', display: 'z', width: 1 },
        { label: 'x', display: 'x', width: 1 },
        { label: 'c', display: 'c', width: 1 },
        { label: 'v', display: 'v', width: 1 },
        { label: 'b', display: 'b', width: 1 },
        { label: 'n', display: 'n', width: 1 },
        { label: 'm', display: 'm', width: 1 },
        { label: ',', display: ',', width: 1 },
        { label: '.', display: '.', width: 1 },
        { label: '/', display: isES ? '¿\n/' : '/', width: 1 },
        { label: 'Shift', display: 'Shift', width: 2.75 },
      ],
      [
        { label: 'Ctrl', display: 'Ctrl', width: 1.5 },
        { label: 'Cmd', display: '⌘', width: 1.25 },
        { label: 'Alt', display: 'Alt', width: 1.25 },
        { label: 'Space', display: '', width: 7 },
        { label: 'Alt', display: 'Alt', width: 1.25 },
        { label: 'Cmd', display: '⌘', width: 1.25 },
        { label: 'Ctrl', display: 'Ctrl', width: 1.5 },
      ],
    ];

    // ES-only: Add accent row for direct input of á é í ó ú ¿ ¡
    if (isES) {
      baseLayout.push([
        { label: 'á', display: 'á', width: 1 },
        { label: 'é', display: 'é', width: 1 },
        { label: 'í', display: 'í', width: 1 },
        { label: 'ó', display: 'ó', width: 1 },
        { label: 'ú', display: 'ú', width: 1 },
        { label: '¿', display: '¿', width: 1 },
        { label: '¡', display: '¡', width: 1 },
        { label: 'ñ', display: 'ñ', width: 1 },
      ]);
    }

    return baseLayout;
  }

  private getKoreanLayout(): KeyDef[][] {
    return [
      // Row 1: 자음 14개 + Backspace
      [
        { label: 'ㄱ', display: 'ㄱ', width: 1 },
        { label: 'ㄴ', display: 'ㄴ', width: 1 },
        { label: 'ㄷ', display: 'ㄷ', width: 1 },
        { label: 'ㄹ', display: 'ㄹ', width: 1 },
        { label: 'ㅁ', display: 'ㅁ', width: 1 },
        { label: 'ㅂ', display: 'ㅂ', width: 1 },
        { label: 'ㅅ', display: 'ㅅ', width: 1 },
        { label: 'ㅇ', display: 'ㅇ', width: 1 },
        { label: 'ㅈ', display: 'ㅈ', width: 1 },
        { label: 'ㅊ', display: 'ㅊ', width: 1 },
        { label: 'ㅋ', display: 'ㅋ', width: 1 },
        { label: 'ㅌ', display: 'ㅌ', width: 1 },
        { label: 'ㅍ', display: 'ㅍ', width: 1 },
        { label: 'ㅎ', display: 'ㅎ', width: 1 },
        { label: 'Backspace', display: '⌫', width: 2 },
      ],
      // Row 2: 기본 모음 10개
      [
        { label: 'ㅏ', display: 'ㅏ', width: 1 },
        { label: 'ㅑ', display: 'ㅑ', width: 1 },
        { label: 'ㅓ', display: 'ㅓ', width: 1 },
        { label: 'ㅕ', display: 'ㅕ', width: 1 },
        { label: 'ㅗ', display: 'ㅗ', width: 1 },
        { label: 'ㅛ', display: 'ㅛ', width: 1 },
        { label: 'ㅜ', display: 'ㅜ', width: 1 },
        { label: 'ㅠ', display: 'ㅠ', width: 1 },
        { label: 'ㅡ', display: 'ㅡ', width: 1 },
        { label: 'ㅣ', display: 'ㅣ', width: 1 },
      ],
      // Row 3: y-/복합 모음 11개 + Enter
      [
        { label: 'ㅐ', display: 'ㅐ', width: 1 },
        { label: 'ㅒ', display: 'ㅒ', width: 1 },
        { label: 'ㅔ', display: 'ㅔ', width: 1 },
        { label: 'ㅖ', display: 'ㅖ', width: 1 },
        { label: 'ㅘ', display: 'ㅘ', width: 1 },
        { label: 'ㅙ', display: 'ㅙ', width: 1 },
        { label: 'ㅚ', display: 'ㅚ', width: 1 },
        { label: 'ㅝ', display: 'ㅝ', width: 1 },
        { label: 'ㅞ', display: 'ㅞ', width: 1 },
        { label: 'ㅟ', display: 'ㅟ', width: 1 },
        { label: 'ㅢ', display: 'ㅢ', width: 1 },
        { label: 'Enter', display: '⏎', width: 2.5 },
      ],
      // Row 4: Space
      [
        { label: 'Space', display: '', width: 14 },
      ],
    ];
  }

  pressByEvent(eventKey: string): void {
    let label = eventKey;
    if (eventKey === ' ') label = 'Space';
    else if (eventKey === 'Backspace') label = 'Backspace';
    else if (eventKey === 'Tab') label = 'Tab';
    else if (eventKey === 'Enter') label = 'Enter';

    const key = this.keyByLabel.get(label.toLowerCase());
    if (key) {
      key.pressed = true;
      key.pressTime = performance.now();
    }
  }

  /**
   * Hit-test the keyboard at canvas-relative coordinates.
   * Returns the key's `label` (e.g., 'a', 'Backspace', 'á', 'ㄱ') if a key
   * was hit, or null if the click was outside all keys.
   *
   * Callers can convert the click event to the actual character using the
   * language's input conventions (or use the label as-is).
   */
  getKeyAt(x: number, y: number): string | null {
    for (const key of this.keys) {
      if (x >= key.x && x <= key.x + key.w && y >= key.y && y <= key.y + key.h) {
        return key.label;
      }
    }
    return null;
  }

  /** Test helper: returns the bounding rect { x, y, w, h } of a key by label */
  getKeyBounds(label: string): { x: number; y: number; w: number; h: number } | null {
    const key = this.keyByLabel.get(label.toLowerCase());
    if (!key) return null;
    return { x: key.x, y: key.y, w: key.w, h: key.h };
  }

  /** Test helper: total height of the keyboard (rows × effective rowH) */
  getTotalHeight(): number {
    if (this.keys.length === 0) return 0;
    const maxY = Math.max(...this.keys.map((k) => k.y + k.h));
    return maxY - this.originY;
  }

  /** Test helper: the effective row height after adaptive shrinking */
  getRowHeight(): number {
    if (this.keys.length === 0) return this.rowH;
    return this.keys[0].h + this.gap;
  }

  /** Test helper: snapshot of all key states (for tests only) */
  getDebugState(): Array<{ label: string; pressed: boolean; hinted: boolean }> {
    return this.keys.map((k) => ({
      label: k.label,
      pressed: k.pressed,
      hinted: k.hinted,
    }));
  }

  setHint(label: string | null): void {
    for (const key of this.keys) key.hinted = false;
    if (!label) return;
    const key = this.keyByLabel.get(label.toLowerCase());
    if (key) key.hinted = true;
  }

  update(): void {
    const now = performance.now();
    for (const key of this.keys) {
      if (key.pressed && now - key.pressTime > 220) {
        key.pressed = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const key of this.keys) {
      this.renderKey(ctx, key);
    }
  }

  private renderKey(ctx: CanvasRenderingContext2D, key: KeyState): void {
    const { x, y, w, h, display, pressed, hinted } = key;

    ctx.save();

    if (pressed) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.scale(0.88, 0.82);
      ctx.translate(-(x + w / 2), -(y + h / 2));
    }

    let baseColor: string;
    let borderColor: string | null = null;
    let textColor: string;
    let glowColor: string | null = null;
    let glowBlur = 0;

    if (pressed) {
      baseColor = '#00d9ff';
      borderColor = '#ffffff';
      textColor = '#ffffff';
      glowColor = '#00d9ff';
      glowBlur = 24;
    } else if (hinted) {
      const pulse = 0.5 + Math.sin(performance.now() / 220) * 0.5;
      baseColor = '#3a3a5e';
      borderColor = '#ffd700';
      textColor = '#ffd700';
      glowColor = `rgba(255, 215, 0, ${0.3 + pulse * 0.5})`;
      glowBlur = 12 + pulse * 6;
    } else {
      baseColor = '#252538';
      borderColor = '#3a3a55';
      textColor = '#888899';
    }

    if (glowColor) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = glowBlur;
    }
    ctx.fillStyle = baseColor;
    this.roundRect(ctx, x, y, w, h, 6);
    ctx.fill();

    ctx.shadowBlur = 0;
    if (borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = pressed ? 2 : 1.5;
      this.roundRect(ctx, x, y, w, h, 6);
      ctx.stroke();
    }

    if (display) {
      ctx.fillStyle = textColor;
      const isWide = key.width >= 1.5;
      ctx.font = `bold ${pressed ? 16 : (isWide ? 13 : 15)}px -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(display, x + w / 2, y + h / 2);
    }

    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}