/**
 * @prezvik/visual-layer
 *
 * Visual Generation Layer for Prezvik presentation generation.
 * Provides procedural generation of backgrounds, shapes, and visual elements
 * using canvas operations.
 */

// Models
export type { VisualContext, SlideVisualContext, Dimensions, Point, Rect, ThemeTone, SlideType, ThemeTypography } from "./models/visual-context.js";

export type { VisualElement, BackgroundElement, ShapeElement, ContentElement, Fill, SolidFill, GradientFill, PatternFill, LinearGradient, RadialGradient, ColorStop, Pattern, Stroke, TextContent, ImageContent } from "./models/visual-element.js";

// Generators
export { BackgroundGenerator } from "./background-generator.js";
export { ShapeGenerator } from "./shape-generator.js";
export { FillEngine } from "./fill-engine.js";
export { ThemeEngine } from "./theme-engine.js";
export type { LayoutNode } from "./theme-engine.js";

// Visual Context Builder
export { VisualContextBuilder } from "./visual-context-builder.js";
export type { LayoutTree } from "./visual-context-builder.js";

// Serialization
export { serializeVisualContext, parseVisualContext } from "./serialization.js";

// Optimizations
export { ShapeCache } from "./optimizations/shape-cache.js";
export { SpatialIndex, createSpatialIndexFromBounds } from "./optimizations/spatial-index.js";
export { StagePool, getGlobalStagePool, resetGlobalStagePool } from "./optimizations/stage-pool.js";

// Facade
export { VisualLayerFacade } from "./facade.js";
export type { SlideTheme, Decoration } from "./facade.js";
