/**
 * Image Loader - External image loading system
 * 
 * Loads external images (anime characters, photos, etc.) for use as character sprites.
 * Supports PNG, JPG, WebP with transparent backgrounds.
 */

export interface ImageConfig {
  /** Image source path (relative to public/ or absolute URL) */
  src: string;
  /** Display width in pixels */
  width: number;
  /** Display height in pixels */
  height: number;
  /** Number of frames for sprite sheet (horizontal layout) */
  frames?: number;
  /** Frame duration in ms (for animations) */
  frameDuration?: number;
  /** Offset X for positioning */
  offsetX?: number;
  /** Offset Y for positioning */
  offsetY?: number;
  /** Scale factor (1.0 = original size) */
  scale?: number;
}

export interface LoadedImage {
  element: HTMLImageElement;
  config: ImageConfig;
  loaded: boolean;
}

class ImageLoaderClass {
  private cache: Map<string, LoadedImage> = new Map();
  private loading: Map<string, Promise<LoadedImage>> = new Map();

  /**
   * Load an external image
   */
  async load(config: ImageConfig): Promise<LoadedImage> {
    // Check cache first
    const cached = this.cache.get(config.src);
    if (cached && cached.loaded) {
      return cached;
    }

    // Check if already loading
    const loadingPromise = this.loading.get(config.src);
    if (loadingPromise) {
      return loadingPromise;
    }

    // Start loading
    const promise = this.loadImage(config);
    this.loading.set(config.src, promise);

    try {
      const loaded = await promise;
      this.cache.set(config.src, loaded);
      return loaded;
    } finally {
      this.loading.delete(config.src);
    }
  }

  /**
   * Preload multiple images
   */
  async preload(configs: ImageConfig[]): Promise<void> {
    await Promise.all(configs.map(config => this.load(config)));
  }

  /**
   * Get cached image (synchronous)
   */
  get(src: string): LoadedImage | null {
    const cached = this.cache.get(src);
    return cached && cached.loaded ? cached : null;
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.loading.clear();
  }

  private loadImage(config: ImageConfig): Promise<LoadedImage> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const loadedImage: LoadedImage = {
        element: img,
        config,
        loaded: false,
      };

      img.onload = () => {
        loadedImage.loaded = true;
        console.log(`[ImageLoader] Loaded: ${config.src} (${img.width}×${img.height})`);
        resolve(loadedImage);
      };

      img.onerror = (error) => {
        console.error(`[ImageLoader] Failed to load: ${config.src}`, error);
        reject(new Error(`Failed to load image: ${config.src}`));
      };

      // Support both relative and absolute URLs
      if (config.src.startsWith('http://') || config.src.startsWith('https://')) {
        // Absolute URL (external image)
        img.crossOrigin = 'anonymous'; // Enable CORS
        img.src = config.src;
      } else {
        // Relative path (from public/)
        img.src = config.src;
      }
    });
  }
}

// Singleton instance
export const ImageLoader = new ImageLoaderClass();
