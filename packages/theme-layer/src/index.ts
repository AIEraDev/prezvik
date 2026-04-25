/**
 * @kyro/theme-layer
 *
 * Theme/Color Layer for Kyro presentation generation.
 * Provides centralized color management, palette generation,
 * gradient creation, and blend mode operations.
 */

// Models
export type { ColorPalette, ColorSpace } from "./models/color-palette.js";

// Generators
export { ColorPaletteGenerator } from "./palette-generator.js";
export type { ThemeSpec } from "./palette-generator.js";
export { GradientGenerator } from "./gradient-generator.js";
export type { ColorStop, LinearGradient, RadialGradient, Point } from "./gradient-generator.js";
export { BlendModeEngine } from "./blend-mode-engine.js";
export type { BlendMode } from "./blend-mode-engine.js";

// Optimizations
export { ColorScaleCache } from "./optimizations/color-scale-cache.js";
export { InterpolationLookup } from "./optimizations/interpolation-lookup.js";

// Errors
export { ColorParseError } from "./errors/color-parse-error.js";

// Facade
export { ThemeLayerFacadeImpl } from "./facade.js";
export type { ThemeLayerFacade } from "./facade.js";
