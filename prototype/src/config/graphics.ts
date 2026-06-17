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
    'ui-button-normal',
    'ui-button-hover',
    'ui-button-active',
    'ui-progress-bar',
    'ui-hp-bar',
    'ui-combo-badge',
    'ui-star-empty',
    'ui-star-filled',
    'ui-panel',
    'ui-icon-sound',
    'ui-icon-mute',
  ] as const,
};
