/**
 * FillEngine
 *
 * Responsible for applying fills to shapes and backgrounds in the Visual Layer.
 * Creates solid color fills, gradient fills, and pattern fills.
 */

import type { SolidFill, GradientFill, PatternFill, LinearGradient, RadialGradient, Pattern } from "./models/visual-element.js";

/**
 * FillEngine class for creating fills for shapes and backgrounds
 *
 * Provides methods to create:
 * - Solid color fills from color strings
 * - Gradient fills from LinearGradient or RadialGradient definitions
 * - Pattern fills from Pattern definitions
 *
 * Converts gradient definitions to Konva gradient objects for rendering.
 */
export class FillEngine {
  /**
   * Create a solid color fill
   *
   * @param color - Color string in CSS Color Level 4 format
   * @returns SolidFill object
   *
   * @example
   * ```typescript
   * const fill = fillEngine.createSolidFill("#1a73e8");
   * // Returns: { type: "solid", color: "#1a73e8" }
   * ```
   */
  createSolidFill(color: string): SolidFill {
    return {
      type: "solid",
      color,
    };
  }

  /**
   * Create a gradient fill from gradient definition
   *
   * Converts LinearGradient or RadialGradient definitions to GradientFill objects
   * that can be used with Konva for rendering.
   *
   * @param gradient - LinearGradient or RadialGradient definition
   * @returns GradientFill object
   *
   * @example
   * ```typescript
   * const linearGradient: LinearGradient = {
   *   type: "linear",
   *   angle: 45,
   *   stops: [
   *     { position: 0, color: "#1a73e8" },
   *     { position: 1, color: "#34a853" }
   *   ]
   * };
   * const fill = fillEngine.createGradientFill(linearGradient);
   * ```
   */
  createGradientFill(gradient: LinearGradient | RadialGradient): GradientFill {
    return {
      type: "gradient",
      gradient,
    };
  }

  /**
   * Create a pattern fill
   *
   * @param pattern - Pattern definition (image, svg, dots, lines, grid)
   * @returns PatternFill object
   *
   * @example
   * ```typescript
   * const pattern: Pattern = {
   *   type: "dots",
   *   repeat: "repeat",
   *   scale: 1.0,
   *   properties: {
   *     dotSize: 4,
   *     dotSpacing: 20,
   *     dotColor: "#cccccc"
   *   }
   * };
   * const fill = fillEngine.createPatternFill(pattern);
   * ```
   */
  createPatternFill(pattern: Pattern): PatternFill {
    return {
      type: "pattern",
      pattern,
    };
  }
}
