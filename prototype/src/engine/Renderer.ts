/**
 * Canvas Renderer
 *
 * ADR-0004 (Draft): Canvas 2D 렌더링.
 * 자세한 내용: ../../../decisions/0004-rendering.md
 */

import type { Enemy, Language } from '../types.js';
import type { EffectsState } from '../effects/EffectsSystem.js';
import { Keyboard } from './Keyboard.js';
import type { CharacterState } from '../character/CharacterController.js';
import {
  renderBackground,
  renderCharacter,
  renderProps,
} from '../character/CharacterRenderer.js';
import { GraphicsConfig } from '../config/graphics.js';
import { SpriteLoader } from '../sprites/SpriteLoader.js';

export interface RenderState {
  currentEnemy: Enemy | null;
  buffer: string;
  score: number;
  combo: number;
  wpm: number;
  accuracy: number;
  language: Language;
  romajiHint?: string;
  effects: EffectsState;
  lastHitCorrect: boolean;
  lastHitCharIndex: number;
  lastHitTime: number;
  character: CharacterState;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private keyboard: Keyboard | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  setKeyboard(keyboard: Keyboard): void {
    this.keyboard = keyboard;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  render(state: RenderState): void {
    this.clear();
    this.applyShake(state.effects);

    this.drawBackground();
    renderBackground(this.ctx, state.character, this.width, this.height, performance.now());
    this.drawCharacter(state.character);
    this.drawHud(state);
    this.drawEnemy(state);
    this.drawInputBuffer(state);
    this.drawComboMeter(state);
    this.drawKeyboardSection(state);
    this.drawParticles(state.effects);
    this.drawFloatingTexts(state.effects);
    this.drawFlash(state.effects);

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private drawCharacter(state: CharacterState): void {
    const cx = this.width - 130;
    const groundY = 540;
    const now = performance.now();
    renderProps(this.ctx, state, cx, groundY, now);
    renderCharacter(this.ctx, state, cx, groundY, now);
  }

  private applyShake(effects: EffectsState): void {
    if (!effects.shake) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      return;
    }
    this.ctx.setTransform(1, 0, 0, 1, effects.shake.offsetX, effects.shake.offsetY);
  }

  private clear(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private drawBackground(): void {
    const grad = this.ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      50,
      this.width / 2,
      this.height / 2,
      Math.max(this.width, this.height) * 0.7,
    );
    grad.addColorStop(0, 'rgba(233, 69, 96, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  private drawHud(state: RenderState): void {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 22px -apple-system, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      `WPM ${state.wpm.toFixed(0)}   ACC ${state.accuracy.toFixed(0)}%`,
      20,
      34,
    );

    this.ctx.fillStyle = '#00d9ff';
    this.ctx.font = 'bold 28px -apple-system, sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${state.score}`, this.width - 20, 36);
    this.ctx.font = '14px -apple-system, sans-serif';
    this.ctx.fillStyle = '#aaa';
    this.ctx.fillText('SCORE', this.width - 20, 56);
  }

  private drawEnemy(state: RenderState): void {
    if (!state.currentEnemy) return;
    const enemy = state.currentEnemy;
    const text = enemy.target.text;
    const progress = Math.min(1, state.buffer.length / enemy.maxHp);

    const cx = this.width / 2;
    const cy = 290;

    this.ctx.save();
    this.ctx.translate(cx, cy);

    const glowIntensity = 0.4 + progress * 0.6;
    this.ctx.shadowColor = '#e94560';
    this.ctx.shadowBlur = 20 * glowIntensity;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 52px -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, 0, 0);
    this.ctx.shadowBlur = 0;

    this.ctx.restore();

    if (state.romajiHint) {
      this.ctx.fillStyle = '#888888';
      this.ctx.font = '20px -apple-system, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(state.romajiHint, cx, cy + 40);
    }

    const barWidth = 460;
    const barHeight = 14;
    const x = (this.width - barWidth) / 2;
    const y = cy + 80;

    if (GraphicsConfig.USE_SPRITES) {
      // Sprite-based HP bar
      const hpBarSprite = SpriteLoader.get('ui-hp-bar');
      if (hpBarSprite) {
        // Draw full sprite as background
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(hpBarSprite.image, x, y, barWidth, barHeight);
        this.ctx.restore();

        // Draw clipped progress
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x, y, barWidth * progress, barHeight);
        this.ctx.clip();
        this.ctx.drawImage(hpBarSprite.image, x, y, barWidth, barHeight);
        this.ctx.restore();
      } else {
        // Fallback to primitive rendering
        this.drawHPBarPrimitive(x, y, barWidth, barHeight, progress);
      }
    } else {
      this.drawHPBarPrimitive(x, y, barWidth, barHeight, progress);
    }

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px -apple-system, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${state.buffer.length} / ${enemy.maxHp}`, x + barWidth / 2, y - 6);
  }

  private drawHPBarPrimitive(x: number, y: number, width: number, height: number, progress: number): void {
    this.ctx.fillStyle = '#1f1f2e';
    this.ctx.fillRect(x - 2, y - 2, width + 4, height + 4);

    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x, y, width, height);

    const hpGrad = this.ctx.createLinearGradient(x, y, x + width, y);
    hpGrad.addColorStop(0, '#00d9ff');
    hpGrad.addColorStop(1, '#00ff88');
    this.ctx.fillStyle = hpGrad;
    this.ctx.fillRect(x, y, width * progress, height);
  }

  private drawInputBuffer(state: RenderState): void {
    if (!state.currentEnemy) return;
    const targetText = state.currentEnemy.target.text;
    const buffer = state.buffer;
    const charWidth = 22;
    const startX = this.width / 2 - (targetText.length * charWidth) / 2;
    const baseY = 500;
    const now = Date.now();
    const recent = now - state.lastHitTime < 220;

    this.ctx.font = 'bold 34px ui-monospace, monospace';
    this.ctx.textAlign = 'center';

    for (let i = 0; i < targetText.length; i++) {
      const char = buffer[i];
      const targetChar = targetText[i];

      const isLastHit = recent && i === state.lastHitCharIndex;
      const correct = char !== undefined && char === targetChar;
      const wrong = char !== undefined && char !== targetChar;

      let pulse = 0;
      if (isLastHit && correct) {
        pulse = 1 - (now - state.lastHitTime) / 220;
      } else if (isLastHit && wrong) {
        pulse = 1 - (now - state.lastHitTime) / 220;
      }

      const x = startX + i * charWidth;
      const y = baseY + (wrong && isLastHit ? Math.sin(now / 30) * 3 : 0);
      const scale = 1 + pulse * 0.4;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.scale(scale, scale);

      if (correct && isLastHit) {
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 16;
        this.ctx.fillStyle = '#00ff88';
      } else if (wrong && isLastHit) {
        this.ctx.shadowColor = '#ff4444';
        this.ctx.shadowBlur = 16;
        this.ctx.fillStyle = '#ff4444';
      } else if (correct) {
        this.ctx.fillStyle = '#aaffcc';
      } else if (wrong) {
        this.ctx.fillStyle = '#ff7777';
      } else {
        this.ctx.fillStyle = '#444';
      }

      this.ctx.fillText(targetChar, 0, 0);
      this.ctx.restore();
    }

    if (buffer.length > targetText.length) {
      this.ctx.fillStyle = '#ff4444';
      this.ctx.font = '14px -apple-system, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('⚠ 글자 수 초과', this.width / 2, baseY + 30);
    }
  }

  private drawKeyboardSection(state: RenderState): void {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.fillRect(0, 580, this.width, this.height - 580);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 580);
    this.ctx.lineTo(this.width, 580);
    this.ctx.stroke();

    this.ctx.fillStyle = '#666';
    this.ctx.font = '11px -apple-system, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      `⌨  ${state.language.toUpperCase()} keyboard · 노란색 = 다음 키`,
      32,
      596,
    );

    if (this.keyboard) {
      this.keyboard.update();
      this.keyboard.render(this.ctx);
    }
  }

  private drawComboMeter(state: RenderState): void {
    if (state.combo < 2) return;

    const baseSize = 28;
    const scaleBoost = Math.min(state.combo / 20, 1);
    const size = baseSize + scaleBoost * 24;
    const hue = (state.combo * 25) % 360;
    const color = `hsl(${hue}, 90%, 60%)`;

    const cx = this.width / 2;
    const cy = 110;
    const wobble = Math.sin(performance.now() / 150) * 3;

    if (GraphicsConfig.USE_SPRITES && state.combo >= 5) {
      // Draw combo badge sprite
      const badgeSprite = SpriteLoader.get('ui-combo-badge');
      if (badgeSprite) {
        this.ctx.save();
        this.ctx.translate(cx, cy + wobble);
        const scale = 1 + scaleBoost * 0.5;
        this.ctx.scale(scale, scale);
        this.ctx.globalAlpha = 0.9;
        this.ctx.drawImage(
          badgeSprite.image,
          -badgeSprite.width / 2,
          -badgeSprite.height / 2,
          badgeSprite.width,
          badgeSprite.height
        );
        this.ctx.restore();
      }
    }

    // Draw combo text
    this.ctx.save();
    this.ctx.translate(cx, cy + wobble);
    this.ctx.font = `bold ${size}px -apple-system, sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 20 + state.combo;
    this.ctx.fillStyle = color;
    this.ctx.fillText(`${state.combo} COMBO`, 0, 0);
    this.ctx.shadowBlur = 0;
    this.ctx.restore();

    if (state.combo >= 5) {
      this.ctx.font = 'bold 14px -apple-system, sans-serif';
      this.ctx.fillStyle = color;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.getComboLabel(state.combo), cx, cy + 30);
    }
  }

  private getComboLabel(combo: number): string {
    if (combo >= 20) return 'LEGENDARY';
    if (combo >= 15) return 'UNSTOPPABLE';
    if (combo >= 10) return 'ON FIRE';
    if (combo >= 5) return 'GOOD';
    return '';
  }

  private drawParticles(effects: EffectsState): void {
    for (const p of effects.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'square') {
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else {
        this.drawStar(0, 0, p.size * 1.6, p.size * 0.7, 5);
      }
      this.ctx.restore();
    }
  }

  private drawStar(cx: number, cy: number, outer: number, inner: number, points: number): void {
    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (Math.PI / points) * i - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawFloatingTexts(effects: EffectsState): void {
    for (const t of effects.floatingTexts) {
      const alpha = Math.max(0, t.life / t.maxLife);
      const scale = 1 + (1 - alpha) * 0.5;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.translate(t.x, t.y);
      this.ctx.scale(scale, scale);
      this.ctx.font = `bold ${t.fontSize}px -apple-system, sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = t.color;
      this.ctx.shadowBlur = 12;
      this.ctx.fillStyle = t.color;
      this.ctx.fillText(t.text, 0, 0);
      this.ctx.shadowBlur = 0;
      this.ctx.restore();
    }
  }

  private drawFlash(effects: EffectsState): void {
    if (!effects.flash) return;
    const alpha = (effects.flash.life / effects.flash.maxLife) * effects.flash.intensity;
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = effects.flash.color;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }
}