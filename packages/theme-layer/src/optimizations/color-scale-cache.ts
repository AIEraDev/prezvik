/**
 * Color Scale Cache
 *
 * Pre-computes and caches common color scales to avoid repeated interpolation.
 * This optimization is particularly useful for frequently used color combinations.
 */

import { interpolate, formatHex } from "culori";
import type { ColorSpace } from "../models/color-palette.js";

/**
 * Cache entry for a color scale
 */
interface ColorScaleCacheEntry {
  scale: string[];
  timestamp: number;
}

/**
 * Common color scale configurations
 */
const COMMON_SCALES = [
  // Primary scales
  { start: "#1a365d", end: "#f7fafc", steps: 9, colorSpace: "oklch" as ColorSpace },
  { start: "#2c7a7b", end: "#f7fafc", steps: 9, colorSpace: "oklch" as ColorSpace },
  { start: "#3182ce", end: "#f7fafc", steps: 9, colorSpace: "oklch" as ColorSpace },

  // Grayscale scales
  { start: "#000000", end: "#ffffff", steps: 11, colorSpace: "oklch" as ColorSpace },
  { start: "#1a202c", end: "#f7fafc", steps: 9, colorSpace: "oklch" as ColorSpace },

  // Common gradient combinations
  { start: "#ff0000", end: "#0000ff", steps: 10, colorSpace: "oklch" as ColorSpace },
  { start: "#00ff00", end: "#0000ff", steps: 10, colorSpace: "oklch" as ColorSpace },
];

/**
 * ColorScaleCache class
 *
 * Provides caching for color scales with pre-computation of common scales.
 */
export class ColorScaleCache {
  private cache: Map<string, ColorScaleCacheEntry>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 200, ttl: number = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;

    // Pre-compute common scales
    this.preComputeCommonScales();
  }

  /**
   * Get a cached color scale or generate and cache it
   */
  getOrGenerate(startColor: string, endColor: string, steps: number, colorSpace: ColorSpace): string[] {
    const key = this.generateKey(startColor, endColor, steps, colorSpace);

    // Check cache
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    // Generate and cache
    const scale = this.generateScale(startColor, endColor, steps, colorSpace);
    this.set(key, scale);

    return scale;
  }

  /**
   * Get cached scale
   */
  private get(key: string): string[] | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.scale;
  }

  /**
   * Set cached scale
   */
  private set(key: string, scale: string[]): void {
    // Evict oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      scale,
      timestamp: Date.now(),
    });
  }

  /**
   * Generate a color scale
   */
  private generateScale(startColor: string, endColor: string, steps: number, colorSpace: ColorSpace): string[] {
    const interpolator = interpolate([startColor, endColor], colorSpace);
    const scale: string[] = [];

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const color = interpolator(t);
      if (color) {
        scale.push(formatHex(color));
      }
    }

    return scale;
  }

  /**
   * Generate cache key
   */
  private generateKey(startColor: string, endColor: string, steps: number, colorSpace: ColorSpace): string {
    return `${startColor}:${endColor}:${steps}:${colorSpace}`;
  }

  /**
   * Pre-compute common color scales
   */
  private preComputeCommonScales(): void {
    for (const config of COMMON_SCALES) {
      const key = this.generateKey(config.start, config.end, config.steps, config.colorSpace);
      const scale = this.generateScale(config.start, config.end, config.steps, config.colorSpace);
      this.set(key, scale);
    }
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.preComputeCommonScales();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses for accurate rate
    };
  }
}
