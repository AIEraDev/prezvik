/**
 * Interpolation Lookup Table
 *
 * Provides fast lookup for frequently used color interpolations
 * by pre-computing and storing common interpolation results.
 */

import { interpolate, formatHex } from "culori";
import type { ColorSpace } from "../models/color-palette.js";

/**
 * Lookup table entry
 */
interface LookupEntry {
  result: string;
  timestamp: number;
}

/**
 * InterpolationLookup class
 *
 * Provides O(1) lookup for common color interpolations.
 */
export class InterpolationLookup {
  private lookupTable: Map<string, LookupEntry>;
  private maxSize: number;
  private ttl: number;

  constructor(maxSize: number = 1000, ttl: number = 3600000) {
    this.lookupTable = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;

    // Pre-populate with common interpolations
    this.prePopulateCommonInterpolations();
  }

  /**
   * Get interpolated color from lookup or compute it
   */
  getOrCompute(startColor: string, endColor: string, position: number, colorSpace: ColorSpace): string {
    const key = this.generateKey(startColor, endColor, position, colorSpace);

    // Check lookup table
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    // Compute and store
    const result = this.computeInterpolation(startColor, endColor, position, colorSpace);
    this.set(key, result);

    return result;
  }

  /**
   * Get cached interpolation result
   */
  private get(key: string): string | undefined {
    const entry = this.lookupTable.get(key);

    if (!entry) {
      return undefined;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > this.ttl) {
      this.lookupTable.delete(key);
      return undefined;
    }

    return entry.result;
  }

  /**
   * Set cached interpolation result
   */
  private set(key: string, result: string): void {
    // Evict oldest entry if table is full
    if (this.lookupTable.size >= this.maxSize) {
      const oldestKey = this.lookupTable.keys().next().value;
      if (oldestKey) {
        this.lookupTable.delete(oldestKey);
      }
    }

    this.lookupTable.set(key, {
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Compute color interpolation
   */
  private computeInterpolation(startColor: string, endColor: string, position: number, colorSpace: ColorSpace): string {
    const interpolator = interpolate([startColor, endColor], colorSpace);
    const color = interpolator(position);
    return color ? formatHex(color) : startColor;
  }

  /**
   * Generate lookup key
   */
  private generateKey(startColor: string, endColor: string, position: number, colorSpace: ColorSpace): string {
    // Round position to 2 decimal places for better cache hits
    const roundedPosition = Math.round(position * 100) / 100;
    return `${startColor}:${endColor}:${roundedPosition}:${colorSpace}`;
  }

  /**
   * Pre-populate with common interpolations
   */
  private prePopulateCommonInterpolations(): void {
    const commonColors = [
      "#1a365d", // Primary dark blue
      "#2c7a7b", // Secondary teal
      "#3182ce", // Accent blue
      "#f7fafc", // Light background
      "#1a202c", // Dark text
      "#ffffff", // White
      "#000000", // Black
    ];

    const commonPositions = [0, 0.25, 0.5, 0.75, 1];
    const colorSpace: ColorSpace = "oklch";

    // Pre-compute common color pairs at common positions
    for (let i = 0; i < commonColors.length; i++) {
      for (let j = i + 1; j < commonColors.length; j++) {
        for (const position of commonPositions) {
          const key = this.generateKey(commonColors[i], commonColors[j], position, colorSpace);
          const result = this.computeInterpolation(commonColors[i], commonColors[j], position, colorSpace);
          this.set(key, result);
        }
      }
    }
  }

  /**
   * Clear lookup table
   */
  clear(): void {
    this.lookupTable.clear();
    this.prePopulateCommonInterpolations();
  }

  /**
   * Get lookup table statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.lookupTable.size,
      maxSize: this.maxSize,
    };
  }
}
