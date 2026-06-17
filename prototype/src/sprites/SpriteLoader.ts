/**
 * Sprite Loader - Image loading and caching system
 * 
 * Loads sprite sheets and individual sprites, caches them for performance.
 * Supports both external images and programmatically generated sprites.
 */

export type SpriteName = 
  | 'character-idle'
  | 'character-attack'
  | 'character-hit'
  | 'character-victory'
  | 'enemy-idle'
  | 'enemy-hit'
  | 'effect-hit'
  | 'effect-sparkle'
  | 'effect-star';

export interface Sprite {
  image: HTMLImageElement;
  width: number;
  height: number;
  frames?: number; // For animated sprites
}

class SpriteLoaderClass {
  private cache: Map<SpriteName, Sprite> = new Map();
  private loading: Map<SpriteName, Promise<Sprite>> = new Map();

  /**
   * Load a sprite by name
   */
  async load(name: SpriteName): Promise<Sprite> {
    // Check cache first
    const cached = this.cache.get(name);
    if (cached) return cached;

    // Check if already loading
    const loadingPromise = this.loading.get(name);
    if (loadingPromise) return loadingPromise;

    // Start loading
    const promise = this.loadSprite(name);
    this.loading.set(name, promise);

    try {
      const sprite = await promise;
      this.cache.set(name, sprite);
      return sprite;
    } finally {
      this.loading.delete(name);
    }
  }

  /**
   * Preload multiple sprites
   */
  async preload(names: SpriteName[]): Promise<void> {
    await Promise.all(names.map(name => this.load(name)));
  }

  /**
   * Get cached sprite (synchronous)
   */
  get(name: SpriteName): Sprite | null {
    return this.cache.get(name) || null;
  }

  private async loadSprite(name: SpriteName): Promise<Sprite> {
    // For now, we'll generate sprites programmatically
    // Later, these can be replaced with actual image URLs
    const dataUrl = this.generateSprite(name);
    return this.loadFromDataUrl(dataUrl, name);
  }

  private loadFromDataUrl(dataUrl: string, name: SpriteName): Promise<Sprite> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const sprite: Sprite = {
          image: img,
          width: img.width,
          height: img.height,
          frames: this.getFrameCount(name),
        };
        resolve(sprite);
      };
      img.onerror = () => reject(new Error(`Failed to load sprite: ${name}`));
      img.src = dataUrl;
    });
  }

  private getFrameCount(name: SpriteName): number {
    switch (name) {
      case 'character-idle':
        return 4;
      case 'character-attack':
        return 6;
      case 'enemy-idle':
        return 2;
      case 'effect-hit':
        return 8;
      case 'effect-sparkle':
        return 12;
      default:
        return 1;
    }
  }

  /**
   * Generate sprite programmatically using Canvas
   */
  private generateSprite(name: SpriteName): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    switch (name) {
      case 'character-idle':
        return this.generateCharacterIdleSprite(canvas, ctx);
      case 'character-attack':
        return this.generateCharacterAttackSprite(canvas, ctx);
      case 'character-hit':
        return this.generateCharacterHitSprite(canvas, ctx);
      case 'character-victory':
        return this.generateCharacterVictorySprite(canvas, ctx);
      case 'enemy-idle':
        return this.generateEnemyIdleSprite(canvas, ctx);
      case 'enemy-hit':
        return this.generateEnemyHitSprite(canvas, ctx);
      case 'effect-hit':
        return this.generateHitEffectSprite(canvas, ctx);
      case 'effect-sparkle':
        return this.generateSparkleEffectSprite(canvas, ctx);
      case 'effect-star':
        return this.generateStarEffectSprite(canvas, ctx);
      default:
        // Fallback: pink square
        canvas.width = 64;
        canvas.height = 64;
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(0, 0, 64, 64);
        return canvas.toDataURL();
    }
  }

  private generateCharacterIdleSprite(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    // 4 frames animation sprite sheet
    const frameWidth = 80;
    const frameHeight = 120;
    canvas.width = frameWidth * 4;
    canvas.height = frameHeight;

    for (let frame = 0; frame < 4; frame++) {
      const x = frame * frameWidth;
      const bounce = Math.sin((frame / 4) * Math.PI * 2) * 2;
      
      ctx.save();
      ctx.translate(x + frameWidth / 2, frameHeight - 20);

      // Body
      ctx.fillStyle = '#5b9bd5';
      ctx.beginPath();
      ctx.ellipse(0, -40 + bounce, 20, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#ffd1a9';
      ctx.beginPath();
      ctx.arc(0, -70 + bounce, 18, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#654321';
      ctx.beginPath();
      ctx.arc(0, -75 + bounce, 20, Math.PI, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#2c2c2c';
      ctx.beginPath();
      ctx.arc(-6, -72 + bounce, 2, 0, Math.PI * 2);
      ctx.arc(6, -72 + bounce, 2, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#2c2c2c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -68 + bounce, 5, 0.2, Math.PI - 0.2);
      ctx.stroke();

      ctx.restore();
    }

    return canvas.toDataURL();
  }

  private generateCharacterAttackSprite(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    // 6 frames attack animation
    const frameWidth = 80;
    const frameHeight = 120;
    canvas.width = frameWidth * 6;
    canvas.height = frameHeight;

    for (let frame = 0; frame < 6; frame++) {
      const x = frame * frameWidth;
      const progress = frame / 5;
      const armExtend = progress * 25;
      
      ctx.save();
      ctx.translate(x + frameWidth / 2, frameHeight - 20);

      // Body (lean forward)
      ctx.fillStyle = '#5b9bd5';
      ctx.save();
      ctx.rotate(progress * 0.2);
      ctx.beginPath();
      ctx.ellipse(0, -40, 20, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Arm (extending)
      ctx.fillStyle = '#ffd1a9';
      ctx.beginPath();
      ctx.ellipse(15 + armExtend, -45, 5, 15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#ffd1a9';
      ctx.beginPath();
      ctx.arc(0, -70, 18, 0, Math.PI * 2);
      ctx.fill();

      // Hair (dynamic)
      ctx.fillStyle = '#654321';
      ctx.beginPath();
      ctx.arc(-5, -75, 20, Math.PI, Math.PI * 2);
      ctx.fill();

      // Eyes (focused)
      ctx.fillStyle = '#2c2c2c';
      ctx.beginPath();
      ctx.arc(-6, -72, 3, 0, Math.PI * 2);
      ctx.arc(6, -72, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    return canvas.toDataURL();
  }

  private generateCharacterHitSprite(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    canvas.width = 80;
    canvas.height = 120;
    ctx.translate(40, 100);

    // Flash white overlay
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-40, -100, 80, 120);
    ctx.globalAlpha = 1;

    // Character knocked back
    ctx.save();
    ctx.rotate(-0.2);
    
    // Body
    ctx.fillStyle = '#5b9bd5';
    ctx.beginPath();
    ctx.ellipse(0, -40, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffd1a9';
    ctx.beginPath();
    ctx.arc(0, -70, 18, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(0, -75, 20, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes (X_X)
    ctx.strokeStyle = '#2c2c2c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-9, -75);
    ctx.lineTo(-3, -69);
    ctx.moveTo(-3, -75);
    ctx.lineTo(-9, -69);
    ctx.moveTo(3, -75);
    ctx.lineTo(9, -69);
    ctx.moveTo(9, -75);
    ctx.lineTo(3, -69);
    ctx.stroke();

    ctx.restore();

    return canvas.toDataURL();
  }

  private generateCharacterVictorySprite(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    canvas.width = 80;
    canvas.height = 120;
    ctx.translate(40, 100);

    // Body (arms up)
    ctx.fillStyle = '#5b9bd5';
    ctx.beginPath();
    ctx.ellipse(0, -40, 20, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arms raised
    ctx.fillStyle = '#ffd1a9';
    ctx.beginPath();
    ctx.ellipse(-15, -65, 5, 18, -0.5, 0, Math.PI * 2);
    ctx.ellipse(15, -65, 5, 18, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#ffd1a9';
    ctx.beginPath();
    ctx.arc(0, -70, 18, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.arc(0, -75, 20, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes (happy)
    ctx.strokeStyle = '#2c2c2c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-6, -72, 3, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.arc(6, -72, 3, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Big smile
    ctx.beginPath();
    ctx.arc(0, -66, 8, 0, Math.PI);
    ctx.stroke();

    // Sparkles
    ctx.fillStyle = '#ffd700';
    [[-25, -80], [25, -85], [-20, -50], [22, -55]].forEach(([x, y]) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-2, -4, 4, 8);
      ctx.fillRect(-4, -2, 8, 4);
      ctx.restore();
    });

    return canvas.toDataURL();
  }

  private generateEnemyIdleSprite(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    // 2 frames float animation
    const frameWidth = 100;
    const frameHeight = 100;
    canvas.width = frameWidth * 2;
    canvas.height = frameHeight;

    for (let frame = 0; frame < 2; frame++) {
      const x = frame * frameWidth;
      const float = frame === 0 ? 0 : 5;
      
      ctx.save();
      ctx.translate(x + frameWidth / 2, frameHeight / 2 + float);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, 20, 25, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (menacing shape)
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 35);
      grad.addColorStop(0, '#8b4789');
      grad.addColorStop(1, '#4a1a5e');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.bezierCurveTo(-30, -20, -30, 20, 0, 30);
      ctx.bezierCurveTo(30, 20, 30, -20, 0, -30);
      ctx.closePath();
      ctx.fill();

      // Eyes (glowing)
      ctx.fillStyle = '#ff3366';
      ctx.shadowColor = '#ff3366';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-8, -5, 4, 0, Math.PI * 2);
      ctx.arc(8, -5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Mouth (scary)
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 8);
      ctx.quadraticCurveTo(0, 15, 10, 8);
      ctx.stroke();

      ctx.restore();
    }

    return canvas.toDataURL();
  }

  private generateEnemyHitSprite(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    canvas.width = 100;
    canvas.height = 100;
    ctx.translate(50, 50);

    // Flash effect
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(-50, -50, 100, 100);
    ctx.globalAlpha = 1;

    // Cracked body
    ctx.fillStyle = '#4a1a5e';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.bezierCurveTo(-30, -20, -30, 20, 0, 30);
    ctx.bezierCurveTo(30, 20, 30, -20, 0, -30);
    ctx.closePath();
    ctx.fill();

    // Cracks
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(15, 10);
    ctx.moveTo(-10, 5);
    ctx.lineTo(10, -15);
    ctx.stroke();

    // Eyes (hurt)
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(-8, -5, 5, 0, Math.PI * 2);
    ctx.arc(8, -5, 5, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL();
  }

  private generateHitEffectSprite(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    // 8 frames explosion animation
    const frameWidth = 64;
    const frameHeight = 64;
    canvas.width = frameWidth * 8;
    canvas.height = frameHeight;

    for (let frame = 0; frame < 8; frame++) {
      const x = frame * frameWidth;
      const progress = frame / 7;
      const radius = 5 + progress * 25;
      const alpha = 1 - progress;
      
      ctx.save();
      ctx.translate(x + frameWidth / 2, frameHeight / 2);

      // Explosion ring
      ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner flash
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.8})`);
      grad.addColorStop(1, `rgba(255, 100, 100, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Spark particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = radius * 0.8;
        ctx.fillStyle = `rgba(255, 255, 100, ${alpha})`;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    return canvas.toDataURL();
  }

  private generateSparkleEffectSprite(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    // 12 frames twinkle animation
    const frameWidth = 32;
    const frameHeight = 32;
    canvas.width = frameWidth * 12;
    canvas.height = frameHeight;

    for (let frame = 0; frame < 12; frame++) {
      const x = frame * frameWidth;
      const progress = frame / 11;
      const scale = Math.sin(progress * Math.PI);
      const rotation = progress * Math.PI * 2;
      
      ctx.save();
      ctx.translate(x + frameWidth / 2, frameHeight / 2);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Star shape
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const outerX = Math.cos(angle) * 12;
        const outerY = Math.sin(angle) * 12;
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * 5;
        const innerY = Math.sin(innerAngle) * 5;
        
        if (i === 0) {
          ctx.moveTo(outerX, outerY);
        } else {
          ctx.lineTo(outerX, outerY);
        }
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();
    }

    return canvas.toDataURL();
  }

  private generateStarEffectSprite(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    canvas.width = 24;
    canvas.height = 24;
    ctx.translate(12, 12);

    // Simple star
    ctx.fillStyle = '#ffff00';
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * 10;
      const y = Math.sin(angle) * 10;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      const innerAngle = angle + Math.PI / 5;
      const innerX = Math.cos(innerAngle) * 4;
      const innerY = Math.sin(innerAngle) * 4;
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    return canvas.toDataURL();
  }
}

// Singleton instance
export const SpriteLoader = new SpriteLoaderClass();
