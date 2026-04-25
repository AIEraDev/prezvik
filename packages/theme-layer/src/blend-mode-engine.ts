import { parse, rgb, formatHex } from "culori";

/**
 * Supported blend modes for color blending operations
 */
export type BlendMode = "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion";

/**
 * Engine for applying blend modes to combine colors
 * Uses Culori for color parsing and RGB color space for blending operations
 */
export class BlendModeEngine {
  /**
   * Blend two colors using specified blend mode
   * @param baseColor - Base color in any CSS Color Level 4 format
   * @param blendColor - Color to blend in any CSS Color Level 4 format
   * @param mode - Blend mode to apply
   * @param opacity - Blend opacity (0-1), defaults to 1
   * @returns Blended color as hex string
   * @throws Error if colors cannot be parsed or blend mode is invalid
   */
  blend(baseColor: string, blendColor: string, mode: BlendMode, opacity: number = 1): string {
    // Parse colors
    const base = parse(baseColor);
    const blend = parse(blendColor);

    if (!base) {
      throw new Error(`Invalid base color: ${baseColor}`);
    }

    if (!blend) {
      throw new Error(`Invalid blend color: ${blendColor}`);
    }

    // Validate opacity
    if (opacity < 0 || opacity > 1) {
      throw new Error(`Opacity must be between 0 and 1, got: ${opacity}`);
    }

    // Convert to RGB for blending
    const baseRgb = rgb(base);
    const blendRgb = rgb(blend);

    if (!baseRgb || !blendRgb) {
      throw new Error("Failed to convert colors to RGB");
    }

    // Apply blend mode
    const blended = this.applyBlendMode(baseRgb, blendRgb, mode);

    // Apply opacity (mix blended result with base)
    const result = {
      mode: "rgb" as const,
      r: baseRgb.r + (blended.r - baseRgb.r) * opacity,
      g: baseRgb.g + (blended.g - baseRgb.g) * opacity,
      b: baseRgb.b + (blended.b - baseRgb.b) * opacity,
      alpha: baseRgb.alpha ?? 1,
    };

    return formatHex(result);
  }

  /**
   * Apply blend mode to RGB colors
   * @private
   */
  private applyBlendMode(base: { r: number; g: number; b: number; alpha?: number }, blend: { r: number; g: number; b: number; alpha?: number }, mode: BlendMode): { r: number; g: number; b: number } {
    switch (mode) {
      case "multiply":
        return this.multiply(base, blend);
      case "screen":
        return this.screen(base, blend);
      case "overlay":
        return this.overlay(base, blend);
      case "darken":
        return this.darken(base, blend);
      case "lighten":
        return this.lighten(base, blend);
      case "color-dodge":
        return this.colorDodge(base, blend);
      case "color-burn":
        return this.colorBurn(base, blend);
      case "hard-light":
        return this.hardLight(base, blend);
      case "soft-light":
        return this.softLight(base, blend);
      case "difference":
        return this.difference(base, blend);
      case "exclusion":
        return this.exclusion(base, blend);
      default:
        throw new Error(`Unsupported blend mode: ${mode}`);
    }
  }

  /**
   * Multiply blend mode: multiplies base and blend colors
   */
  private multiply(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: base.r * blend.r,
      g: base.g * blend.g,
      b: base.b * blend.b,
    };
  }

  /**
   * Screen blend mode: inverted multiply
   */
  private screen(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: 1 - (1 - base.r) * (1 - blend.r),
      g: 1 - (1 - base.g) * (1 - blend.g),
      b: 1 - (1 - base.b) * (1 - blend.b),
    };
  }

  /**
   * Overlay blend mode: combination of multiply and screen
   */
  private overlay(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: this.overlayChannel(base.r, blend.r),
      g: this.overlayChannel(base.g, blend.g),
      b: this.overlayChannel(base.b, blend.b),
    };
  }

  private overlayChannel(base: number, blend: number): number {
    return base < 0.5 ? 2 * base * blend : 1 - 2 * (1 - base) * (1 - blend);
  }

  /**
   * Darken blend mode: selects darker of two colors
   */
  private darken(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: Math.min(base.r, blend.r),
      g: Math.min(base.g, blend.g),
      b: Math.min(base.b, blend.b),
    };
  }

  /**
   * Lighten blend mode: selects lighter of two colors
   */
  private lighten(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: Math.max(base.r, blend.r),
      g: Math.max(base.g, blend.g),
      b: Math.max(base.b, blend.b),
    };
  }

  /**
   * Color dodge blend mode: brightens base color
   */
  private colorDodge(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: this.colorDodgeChannel(base.r, blend.r),
      g: this.colorDodgeChannel(base.g, blend.g),
      b: this.colorDodgeChannel(base.b, blend.b),
    };
  }

  private colorDodgeChannel(base: number, blend: number): number {
    if (blend >= 1) return 1;
    return Math.min(1, base / (1 - blend));
  }

  /**
   * Color burn blend mode: darkens base color
   */
  private colorBurn(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: this.colorBurnChannel(base.r, blend.r),
      g: this.colorBurnChannel(base.g, blend.g),
      b: this.colorBurnChannel(base.b, blend.b),
    };
  }

  private colorBurnChannel(base: number, blend: number): number {
    if (blend <= 0) return 0;
    return Math.max(0, 1 - (1 - base) / blend);
  }

  /**
   * Hard light blend mode: overlay with blend and base swapped
   */
  private hardLight(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: this.overlayChannel(blend.r, base.r),
      g: this.overlayChannel(blend.g, base.g),
      b: this.overlayChannel(blend.b, base.b),
    };
  }

  /**
   * Soft light blend mode: softer version of overlay
   */
  private softLight(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: this.softLightChannel(base.r, blend.r),
      g: this.softLightChannel(base.g, blend.g),
      b: this.softLightChannel(base.b, blend.b),
    };
  }

  private softLightChannel(base: number, blend: number): number {
    if (blend < 0.5) {
      return base - (1 - 2 * blend) * base * (1 - base);
    } else {
      const d = base < 0.25 ? ((16 * base - 12) * base + 4) * base : Math.sqrt(base);
      return base + (2 * blend - 1) * (d - base);
    }
  }

  /**
   * Difference blend mode: absolute difference between colors
   */
  private difference(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: Math.abs(base.r - blend.r),
      g: Math.abs(base.g - blend.g),
      b: Math.abs(base.b - blend.b),
    };
  }

  /**
   * Exclusion blend mode: similar to difference but lower contrast
   */
  private exclusion(base: { r: number; g: number; b: number }, blend: { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    return {
      r: base.r + blend.r - 2 * base.r * blend.r,
      g: base.g + blend.g - 2 * base.g * blend.g,
      b: base.b + blend.b - 2 * base.b * blend.b,
    };
  }
}
