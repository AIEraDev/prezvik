/**
 * @prezvik/export-layer
 *
 * Export/Rendering Layer for Prezvik presentation generation.
 * Provides pluggable renderers for converting Visual Context to output formats
 * (PPTX, HTML, etc.). Uses existing pptxgenjs from @prezvik/renderer-pptx.
 */

// Interfaces
export type { Renderer, RenderOptions, RenderResult, ValidationResult, FeatureSupport } from "./renderer-interface.js";

// Renderers
export { PPTXRenderer } from "./pptx-renderer.js";
export type { PPTXRenderOptions } from "./pptx-renderer.js";
export { WebRenderer } from "./web-renderer.js";
export type { WebRenderOptions } from "./web-renderer.js";

// Facade
export { ExportLayerFacade } from "./facade.js";
export type { OutputFormat } from "./facade.js";
