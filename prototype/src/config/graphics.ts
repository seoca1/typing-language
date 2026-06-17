/**
 * Graphics Configuration
 * 
 * Toggle between different rendering modes
 */

export const GraphicsConfig = {
  /**
   * Use sprite-based rendering instead of primitives
   * 
   * - false: Canvas primitives (circles, rectangles) - lighter, faster
   * - true: Image sprites - more detailed, requires loading
   */
  USE_SPRITES: true,

  /**
   * Enable particle effects
   */
  ENABLE_PARTICLES: true,

  /**
   * Enable screen shake
   */
  ENABLE_SCREEN_SHAKE: true,

  /**
   * Enable character animations
   */
  ENABLE_ANIMATIONS: true,

  /**
   * Sprite preload list
   */
  SPRITE_PRELOAD: [
    'character-idle',
    'character-attack',
    'character-hit',
    'character-victory',
    'enemy-idle',
    'enemy-hit',
    'effect-hit',
    'effect-sparkle',
    'effect-star',
  ] as const,
};
