/**
 * Shape Generation Cache
 *
 * Caches generated shapes by slide type and theme tone to avoid
 * redundant shape generation for similar slides.
 */

import type { ShapeElement } from "../models/visual-element.js";
import type { SlideType, ThemeTone } from "../models/visual-context.js";

/**
 * Cache entry for generated shapes
 */
interface ShapeCacheEntry {
  shapes: ShapeElement[];
  timestamp: number;
}

/**
 * ShapeCache class
 *
 * Provides caching for generated decoration shapes based on slide type and theme tone.
 */
export class ShapeCache {
  private cache: Map<string, ShapeCacheEntry>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 50, ttl: number = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Get cached shapes
   */
  get(slideType: SlideType, themeTone: ThemeTone, contentBoundsHash: string): ShapeElement[] | undefined {
    const key = this.generateKey(slideType, themeTone, contentBoundsHash);
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Return deep copy to avoid mutation
    return entry.shapes.map((shape) => ({ ...shape }));
  }

  /**
   * Set cached shapes
   */
  set(slideType: SlideType, themeTone: ThemeTone, contentBoundsHash: string, shapes: ShapeElement[]): void {
    const key = this.generateKey(slideType, themeTone, contentBoundsHash);

    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    // Store deep copy to avoid mutation
    this.cache.set(key, {
      shapes: shapes.map((shape) => ({ ...shape })),
      timestamp: Date.now(),
    });
  }

  /**
   * Generate cache key
   */
  private generateKey(slideType: SlideType, themeTone: ThemeTone, contentBoundsHash: string): string {
    return `${slideType}:${themeTone}:${contentBoundsHash}`;
  }

  /**
   * Hash content bounds for cache key
   */
  hashContentBounds(bounds: Array<{ x: number; y: number; width: number; height: number }>): string {
    // Create a simple hash of the bounds
    const boundsStr = bounds.map((b) => `${b.x},${b.y},${b.width},${b.height}`).join("|");

    let hash = 0;
    for (let i = 0; i < boundsStr.length; i++) {
      const char = boundsStr.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return hash.toString(36);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}
