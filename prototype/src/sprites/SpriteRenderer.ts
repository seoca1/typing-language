/**
 * Sprite Renderer - Draws sprites with animation support
 */

import type { Sprite } from './SpriteLoader.js';

export interface SpriteAnimation {
  currentFrame: number;
  lastFrameTime: number;
  frameDuration: number; // ms per frame
  loop: boolean;
  finished: boolean;
}

export class SpriteRenderer {
  private animations: Map<string, SpriteAnimation> = new Map();

  /**
   * Draw a sprite at position
   */
  drawSprite(
    ctx: CanvasRenderingContext2D,
    sprite: Sprite,
    x: number,
    y: number,
    options?: {
      scale?: number;
      rotation?: number;
      alpha?: number;
      flipH?: boolean;
      flipV?: boolean;
    }
  ): void {
    const scale = options?.scale ?? 1;
    const rotation = options?.rotation ?? 0;
    const alpha = options?.alpha ?? 1;
    const flipH = options?.flipH ?? false;
    const flipV = options?.flipV ?? false;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flipH ? -scale : scale, flipV ? -scale : scale);
    
    ctx.drawImage(
      sprite.image,
      -sprite.width / 2,
      -sprite.height / 2,
      sprite.width,
      sprite.height
    );

    ctx.restore();
  }

  /**
   * Draw an animated sprite frame
   */
  drawAnimatedSprite(
    ctx: CanvasRenderingContext2D,
    sprite: Sprite,
    animId: string,
    x: number,
    y: number,
    now: number,
    options?: {
      scale?: number;
      rotation?: number;
      alpha?: number;
      flipH?: boolean;
      frameDuration?: number;
      loop?: boolean;
      onComplete?: () => void;
    }
  ): void {
    if (!sprite.frames || sprite.frames <= 1) {
      // Not animated, draw normally
      this.drawSprite(ctx, sprite, x, y, options);
      return;
    }

    // Get or create animation state
    let anim = this.animations.get(animId);
    if (!anim) {
      anim = {
        currentFrame: 0,
        lastFrameTime: now,
        frameDuration: options?.frameDuration ?? 100,
        loop: options?.loop ?? true,
        finished: false,
      };
      this.animations.set(animId, anim);
    }

    // Update frame
    if (!anim.finished) {
      const elapsed = now - anim.lastFrameTime;
      if (elapsed >= anim.frameDuration) {
        anim.currentFrame++;
        anim.lastFrameTime = now;

        if (anim.currentFrame >= sprite.frames) {
          if (anim.loop) {
            anim.currentFrame = 0;
          } else {
            anim.currentFrame = sprite.frames - 1;
            anim.finished = true;
            options?.onComplete?.();
          }
        }
      }
    }

    // Draw current frame
    const frameWidth = sprite.width / sprite.frames;
    const frameHeight = sprite.height;
    const scale = options?.scale ?? 1;
    const rotation = options?.rotation ?? 0;
    const alpha = options?.alpha ?? 1;
    const flipH = options?.flipH ?? false;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(flipH ? -scale : scale, scale);
    
    ctx.drawImage(
      sprite.image,
      anim.currentFrame * frameWidth,
      0,
      frameWidth,
      frameHeight,
      -frameWidth / 2,
      -frameHeight / 2,
      frameWidth,
      frameHeight
    );

    ctx.restore();
  }

  /**
   * Reset an animation
   */
  resetAnimation(animId: string): void {
    this.animations.delete(animId);
  }

  /**
   * Stop an animation
   */
  stopAnimation(animId: string): void {
    const anim = this.animations.get(animId);
    if (anim) {
      anim.finished = true;
    }
  }

  /**
   * Check if animation is finished
   */
  isAnimationFinished(animId: string): boolean {
    return this.animations.get(animId)?.finished ?? false;
  }

  /**
   * Clear all animations
   */
  clearAnimations(): void {
    this.animations.clear();
  }
}
