/**
 * Kyro PPTX Renderer
 *
 * Clean renderer pipeline: LayoutTree → .pptx
 *
 * Design principles:
 * - Renderer is a dumb executor
 * - All intelligence lives in layout engine
 * - No coupling to Kyro schema
 * - Reusable and testable
 */

export * from "./renderer/pptx-renderer.js";
export * from "./renderer/slide.js";
export * from "./renderer/node.js";
export * from "./types.js";
