/**
 * ThemeLayerFacade
 *
 * Provides a simplified interface to the Theme Layer subsystem.
 * Coordinates ColorPaletteGenerator, GradientGenerator, and BlendModeEngine
 * to provide a unified API for theme operations.
 */

import type { ColorPalette } from "./models/color-palette.js";
import type { ColorPaletteGenerator, ThemeSpec } from "./palette-generator.js";
import type { GradientGenerator } from "./gradient-generator.js";
import type { BlendModeEngine } from "./blend-mode-engine.js";

/**
 * Facade interface for the Theme Layer
 */
export interface ThemeLayerFacade {
  generatePalette(themeSpec: ThemeSpec): Promise<ColorPalette>;
}

/**
 * ThemeLayerFacade class
 *
 * Provides a simplified interface to the Theme Layer subsystem.
 * While the current implementation only exposes palette generation,
 * the facade can be extended in the future to expose gradient generation
 * and blend mode operations if needed by other layers.
 */
export class ThemeLayerFacadeImpl implements ThemeLayerFacade {
  constructor(
    private readonly paletteGenerator: ColorPaletteGenerator,
    // @ts-expect-error - gradientGenerator reserved for future use
    private readonly gradientGenerator: GradientGenerator,
    // @ts-expect-error - blendModeEngine reserved for future use
    private readonly blendModeEngine: BlendModeEngine,
  ) {}

  /**
   * Generate a color palette from a theme specification
   *
   * @param themeSpec - Theme specification with base colors
   * @returns Promise resolving to ColorPalette with all semantic color roles resolved
   * @throws ColorParseError if any color in the palette is invalid
   */
  async generatePalette(themeSpec: ThemeSpec): Promise<ColorPalette> {
    // Delegate to ColorPaletteGenerator
    // Wrapped in Promise for consistency with the interface
    return Promise.resolve(this.paletteGenerator.generatePalette(themeSpec));
  }
}
