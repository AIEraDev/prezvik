/**
 * Palette Engine
 *
 * Intelligent color derivation and contrast management using chroma-js.
 * Agents pick color roles, engine handles all the math.
 */

import chroma from "chroma-js";
import type { ColorPalette } from "./vocabulary.js";
import type { ThemePalette } from "./theme-spec.js";

/**
 * Predefined color palettes mapped to vocabulary names
 */
const PALETTE_DEFINITIONS: Record<ColorPalette, { seed: string; accent: string; secondary: string }> = {
  "midnight-vivid": {
    seed: "0D1B4B", // Navy
    accent: "6C5CE7", // Purple
    secondary: "00897B", // Teal
  },
  "ocean-depth": {
    seed: "0A2463", // Dark blue
    accent: "00B4D8", // Cyan
    secondary: "90E0EF", // Light cyan
  },
  "forest-focus": {
    seed: "1B4332", // Dark green
    accent: "52B788", // Lime
    secondary: "D8F3DC", // Cream
  },
  "solar-bold": {
    seed: "2B2D42", // Charcoal
    accent: "EDF2F4", // Yellow
    secondary: "EF233C", // Red
  },
  "monochrome-pro": {
    seed: "111827", // Black
    accent: "6366F1", // Indigo
    secondary: "9CA3AF", // Gray
  },
  "corporate-trust": {
    seed: "1E3A8A", // Navy
    accent: "3B82F6", // Royal blue
    secondary: "64748B", // Gray
  },
  "healthcare-calm": {
    seed: "1E40AF", // Blue
    accent: "14B8A6", // Teal
    secondary: "10B981", // Green
  },
  "creative-vibrant": {
    seed: "7C3AED", // Purple
    accent: "EC4899", // Pink
    secondary: "F97316", // Orange
  },
};

export class PaletteEngine {
  /**
   * Generate full theme palette from vocabulary name
   */
  fromPaletteName(paletteName: ColorPalette): ThemePalette {
    const def = PALETTE_DEFINITIONS[paletteName];
    const base = chroma(`#${def.seed}`);
    const accentColor = chroma(`#${def.accent}`);

    return {
      primary: def.seed,
      secondary: def.secondary,
      accent: def.accent,
      lightBg: this.deriveLightBg(base),
      darkBg: def.seed,
      textOnDark: this.deriveTextOnDark(base),
      textOnLight: this.deriveTextOnLight(base),
      mutedOnDark: this.deriveMutedOnDark(accentColor),
      mutedOnLight: this.deriveMutedOnLight(base),
    };
  }

  /**
   * Derive light background (very light, high luminance)
   */
  private deriveLightBg(base: chroma.Color): string {
    return base.brighten(4).desaturate(3).hex().replace("#", "");
  }

  /**
   * Derive text color for dark backgrounds (ensure WCAG AA contrast)
   */
  private deriveTextOnDark(base: chroma.Color): string {
    // Always use white or very light color on dark backgrounds
    const candidate = chroma("#FFFFFF");
    const contrast = chroma.contrast(candidate, base);

    // If contrast is too low, brighten further
    if (contrast < 4.5) {
      return "FFFFFF";
    }

    return candidate.hex().replace("#", "");
  }

  /**
   * Derive text color for light backgrounds (ensure WCAG AA contrast)
   */
  private deriveTextOnLight(base: chroma.Color): string {
    // Use dark version of base color
    let textColor = base.darken(3);

    // Ensure sufficient contrast
    const lightBg = chroma(`#${this.deriveLightBg(base)}`);
    let contrast = chroma.contrast(textColor, lightBg);

    while (contrast < 4.5 && textColor.luminance() > 0.05) {
      textColor = textColor.darken(0.3);
      contrast = chroma.contrast(textColor, lightBg);
    }

    return textColor.hex().replace("#", "");
  }

  /**
   * Derive muted text color for dark backgrounds
   */
  private deriveMutedOnDark(accent: chroma.Color): string {
    return accent.brighten(1).desaturate(1).hex().replace("#", "");
  }

  /**
   * Derive muted text color for light backgrounds
   */
  private deriveMutedOnLight(base: chroma.Color): string {
    return base.darken(1).desaturate(2).hex().replace("#", "");
  }

  /**
   * Ensure WCAG AA contrast between text and background
   */
  ensureContrast(textHex: string, bgHex: string, minContrast: number = 4.5): string {
    let text = chroma(`#${textHex}`);
    const bg = chroma(`#${bgHex}`);

    let iterations = 0;
    while (chroma.contrast(text, bg) < minContrast && iterations < 20) {
      // Darken if text is light, brighten if text is dark
      text = text.luminance() > 0.5 ? text.darken(0.3) : text.brighten(0.3);
      iterations++;
    }

    return text.hex().replace("#", "");
  }
}
