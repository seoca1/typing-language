/**
 * Character Image Configuration
 * 
 * Define external images for characters (anime, photos, etc.)
 * Place your images in public/characters/ folder
 */

import type { ImageConfig } from '../sprites/ImageLoader.js';

export interface CharacterImageSet {
  idle: ImageConfig;
  wave?: ImageConfig;
  jump?: ImageConfig;
  clap?: ImageConfig;
  spin?: ImageConfig;
  dance?: ImageConfig;
  pose?: ImageConfig;
}

/**
 * Character image collections
 * 
 * To add your own character images:
 * 1. Place images in public/characters/ folder
 * 2. Add configuration below
 * 3. Images should be transparent PNG (recommended)
 * 4. Size: 200-400px recommended for good quality
 */
export const CHARACTER_IMAGES: Record<string, CharacterImageSet> = {
  // Example: Anime style character
  'anime-girl-1': {
    idle: {
      src: '/characters/anime-girl-idle.png',
      width: 300,
      height: 400,
      scale: 0.8,
      offsetX: 0,
      offsetY: -50,
    },
    wave: {
      src: '/characters/anime-girl-wave.png',
      width: 300,
      height: 400,
      scale: 0.8,
      offsetX: 0,
      offsetY: -50,
    },
    jump: {
      src: '/characters/anime-girl-jump.png',
      width: 300,
      height: 400,
      scale: 0.8,
      offsetX: 0,
      offsetY: -50,
    },
    dance: {
      src: '/characters/anime-girl-dance.png',
      width: 300,
      height: 400,
      scale: 0.8,
      offsetX: 0,
      offsetY: -50,
    },
  },

  // Example: Photo style character
  'photo-girl-1': {
    idle: {
      src: '/characters/photo-girl-idle.jpg',
      width: 250,
      height: 350,
      scale: 0.9,
      offsetX: 0,
      offsetY: -40,
    },
    wave: {
      src: '/characters/photo-girl-wave.jpg',
      width: 250,
      height: 350,
      scale: 0.9,
      offsetX: 0,
      offsetY: -40,
    },
  },

  // Example: Sprite sheet (multiple frames in one image)
  'anime-sprite-sheet': {
    idle: {
      src: '/characters/sprite-sheet-idle.png',
      width: 200,
      height: 300,
      frames: 4, // 4 frames horizontally
      frameDuration: 200, // 200ms per frame
      scale: 1.0,
    },
  },

  // You can add more character sets here!
  // Just follow the same pattern and place your images in public/characters/
};

/**
 * Default character image set to use
 * Change this to switch characters
 */
export const DEFAULT_CHARACTER_IMAGE = 'anime-girl-1';

/**
 * Enable/disable external image rendering
 * Set to false to use procedural rendering (original)
 */
export const USE_EXTERNAL_IMAGES = false; // Set to true when you have images ready
