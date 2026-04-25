/**
 * ColorPaletteGenerator
 *
 * Generates color palettes from theme specifications using Culori
 * for perceptually uniform color interpolation and manipulation.
 */

import { parse } from "culori";
import type { ColorPalette, ColorSpace } from "./models/color-palette.js";
import { ColorParseError } from "./errors/color-parse-error.js";
import { createHash } from "crypto";
import { ColorScaleCache } from "./optimizations/color-scale-cache.js";
import { InterpolationLookup } from "./optimizations/interpolation-lookup.js";

/**
 * Theme specification input structure
 */
export interface ThemeSpec {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    lightBg: string;
    darkBg: string;
    textOnDark: string;
    textOnLight: string;
    mutedOnDark: string;
    mutedOnLight: string;
  };
  typography?: {
    displayFont: string;
    bodyFont: string;
  };
  slideRhythm?: unknown[];
  tone?: string;
  generation?: {
    proceduralBackgrounds: boolean;
    decorationShapes: boolean;
    seed?: number;
    decorationDensity: number;
  };
}

/**
 * ColorPaletteGenerator class
 *
 * Provides methods for generating color palettes and color scales
 * using perceptually uniform color interpolation with caching optimizations.
 */
export class ColorPaletteGenerator {
  private colorScaleCache: ColorScaleCache;
  private interpolationLookup: InterpolationLookup;

  constructor() {
    this.colorScaleCache = new ColorScaleCache();
    this.interpolationLookup = new InterpolationLookup();
  }
  /**
   * Generate a complete color palette from a ThemeSpec
   *
   * @param themeSpec - Theme specification with base colors
   * @returns ColorPalette with all semantic color roles resolved
   * @throws ColorParseError if any color in the palette is invalid
   */
  generatePalette(themeSpec: ThemeSpec): ColorPalette {
    const { palette } = themeSpec;

    // Validate all colors in the palette
    this.validateColor(palette.primary, "primary");
    this.validateColor(palette.secondary, "secondary");
    this.validateColor(palette.accent, "accent");
    this.validateColor(palette.lightBg, "lightBg");
    this.validateColor(palette.darkBg, "darkBg");
    this.validateColor(palette.textOnDark, "textOnDark");
    this.validateColor(palette.textOnLight, "textOnLight");
    this.validateColor(palette.mutedOnDark, "mutedOnDark");
    this.validateColor(palette.mutedOnLight, "mutedOnLight");

    // Generate color scales for primary, secondary, and accent
    const scales = {
      primary: this.generateScale(palette.primary, palette.lightBg, 9, "oklch"),
      secondary: this.generateScale(palette.secondary, palette.lightBg, 9, "oklch"),
      accent: this.generateScale(palette.accent, palette.lightBg, 9, "oklch"),
    };

    // Generate hash of ThemeSpec for cache invalidation
    const themeSpecHash = this.hashThemeSpec(themeSpec);

    return {
      version: "1.0",
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      lightBg: palette.lightBg,
      darkBg: palette.darkBg,
      textOnDark: palette.textOnDark,
      textOnLight: palette.textOnLight,
      mutedOnDark: palette.mutedOnDark,
      mutedOnLight: palette.mutedOnLight,
      scales,
      metadata: {
        colorSpace: "oklch",
        generatedAt: new Date().toISOString(),
        themeSpecHash,
      },
    };
  }

  /**
   * Generate a color scale between two colors
   *
   * Uses caching to avoid repeated interpolation of common color scales.
   *
   * @param startColor - Starting color in any CSS Color Level 4 format
   * @param endColor - Ending color in any CSS Color Level 4 format
   * @param steps - Number of colors to generate (including start and end)
   * @param colorSpace - Color space for interpolation (default: 'oklch')
   * @returns Array of interpolated colors in hex format
   * @throws ColorParseError if either color is invalid
   */
  generateScale(startColor: string, endColor: string, steps: number, colorSpace: ColorSpace = "oklch"): string[] {
    // Validate input colors
    this.validateColor(startColor, "startColor");
    this.validateColor(endColor, "endColor");

    // Validate steps
    if (steps < 2) {
      throw new Error("Steps must be at least 2");
    }

    // Use cache for common scales
    return this.colorScaleCache.getOrGenerate(startColor, endColor, steps, colorSpace);
  }

  /**
   * Validate that a color string can be parsed
   *
   * @param color - Color string to validate
   * @param fieldName - Name of the field for error messages
   * @throws ColorParseError if the color cannot be parsed
   */
  private validateColor(color: string, fieldName: string): void {
    const parsed = parse(color);
    if (!parsed) {
      throw new ColorParseError(`Invalid color format for ${fieldName}: "${color}". Expected a valid CSS color (e.g., #ff0000, rgb(255, 0, 0), hsl(0, 100%, 50%))`);
    }
  }

  /**
   * Generate a hash of the ThemeSpec for cache invalidation
   *
   * @param themeSpec - Theme specification to hash
   * @returns Hash string
   */
  private hashThemeSpec(themeSpec: ThemeSpec): string {
    const hash = createHash("sha256");
    hash.update(JSON.stringify(themeSpec.palette));
    return hash.digest("hex").substring(0, 16);
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    colorScaleCache: { size: number; maxSize: number; hitRate: number };
    interpolationLookup: { size: number; maxSize: number };
  } {
    return {
      colorScaleCache: this.colorScaleCache.getStats(),
      interpolationLookup: this.interpolationLookup.getStats(),
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.colorScaleCache.clear();
    this.interpolationLookup.clear();
  }
}
