import type { ColorPalette } from "@kyro/theme-layer";
import type { BackgroundElement, Fill, GradientFill, LinearGradient, SolidFill } from "./models/visual-element.js";
import type { Dimensions, SlideType } from "./models/visual-context.js";

/**
 * BackgroundGenerator is responsible for procedurally generating backgrounds
 * for slides based on slide type and color palette.
 *
 * Background generation rules:
 * - Hero slides: gradient backgrounds with 45° or 135° angles
 * - Section slides: solid or subtle gradient backgrounds
 * - Content slides: minimal backgrounds (solid light color)
 * - Closing slides: similar to hero slides
 */
export class BackgroundGenerator {
  private idCounter = 0;

  /**
   * Generate a background element for a slide
   *
   * @param slideType - Type of slide (hero, section, content, closing)
   * @param colorPalette - Resolved color palette from Theme Layer
   * @param dimensions - Slide dimensions
   * @returns BackgroundElement with appropriate fill
   */
  generateBackground(slideType: SlideType, colorPalette: ColorPalette, dimensions: Dimensions): BackgroundElement {
    const fill = this.generateFill(slideType, colorPalette);

    return {
      id: `bg-${slideType}-${Date.now()}-${this.idCounter++}`,
      kind: "background",
      zIndex: 0, // Backgrounds are always at the bottom
      opacity: 1.0,
      fill,
      dimensions,
    };
  }

  /**
   * Generate appropriate fill based on slide type
   */
  private generateFill(slideType: SlideType, colorPalette: ColorPalette): Fill {
    switch (slideType) {
      case "hero":
        return this.generateHeroFill(colorPalette);
      case "section":
        return this.generateSectionFill(colorPalette);
      case "content":
        return this.generateContentFill(colorPalette);
      case "closing":
        return this.generateClosingFill(colorPalette);
      default:
        // Fallback to content style
        return this.generateContentFill(colorPalette);
    }
  }

  /**
   * Generate gradient background for hero slides
   * Uses varied angles (45°, 135°, 90°, 180°) with primary and secondary colors
   * Adds a mid-point color stop for richer gradients
   */
  private generateHeroFill(colorPalette: ColorPalette): GradientFill {
    // Choose from multiple angles for more variety
    const angles = [45, 135, 90, 180];
    const angle = angles[Math.floor(Math.random() * angles.length)];

    // Add a mid-point color for richer gradients
    const midColor = this.blendColors(colorPalette.primary, colorPalette.secondary, 0.5);

    const gradient: LinearGradient = {
      type: "linear",
      angle,
      stops: [
        { position: 0, color: colorPalette.primary },
        { position: 0.5, color: midColor },
        { position: 1, color: colorPalette.secondary },
      ],
    };

    return {
      type: "gradient",
      gradient,
    };
  }

  /**
   * Generate solid or subtle gradient background for section slides
   * Uses dark background with optional subtle gradient to accent
   * Improved gradient uses accent color for better visual interest
   */
  private generateSectionFill(colorPalette: ColorPalette): Fill {
    // 60% chance of solid, 40% chance of subtle gradient (increased gradient probability)
    const useSolid = Math.random() > 0.4;

    if (useSolid) {
      return {
        type: "solid",
        color: colorPalette.darkBg,
      };
    }

    // Subtle gradient from dark background to accent color with low opacity
    const lightAccent = this.blendColors(colorPalette.darkBg, colorPalette.accent, 0.15);

    const gradient: LinearGradient = {
      type: "linear",
      angle: 135, // Diagonal for more visual interest
      stops: [
        { position: 0, color: colorPalette.darkBg },
        { position: 1, color: lightAccent },
      ],
    };

    return {
      type: "gradient",
      gradient,
    };
  }

  /**
   * Generate minimal background for content slides
   * Uses solid light background color
   */
  private generateContentFill(colorPalette: ColorPalette): SolidFill {
    return {
      type: "solid",
      color: colorPalette.lightBg,
    };
  }

  /**
   * Generate background for closing slides
   * Similar to hero slides but with different color combination
   */
  private generateClosingFill(colorPalette: ColorPalette): GradientFill {
    const angle = 135; // Consistent angle for closing

    const gradient: LinearGradient = {
      type: "linear",
      angle,
      stops: [
        { position: 0, color: colorPalette.secondary },
        { position: 1, color: colorPalette.accent },
      ],
    };

    return {
      type: "gradient",
      gradient,
    };
  }

  /**
   * Utility function to blend two colors
   * Simple linear interpolation in RGB space
   *
   * @param color1 - First hex color string
   * @param color2 - Second hex color string
   * @param ratio - Blend ratio (0 = all color1, 1 = all color2)
   * @returns Blended hex color
   */
  private blendColors(color1: string, color2: string, ratio: number): string {
    // Remove # if present
    const hex1 = color1.replace("#", "");
    const hex2 = color2.replace("#", "");

    // Parse RGB values
    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);

    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);

    // Blend
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    // Convert back to hex
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
