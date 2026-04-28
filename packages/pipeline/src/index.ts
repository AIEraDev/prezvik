/**
 * @prezvik/pipeline
 *
 * Pipeline Orchestrator for Prezvik presentation generation.
 * Coordinates execution of Theme Layer, Visual Layer, and Export Layer
 * with error handling, performance monitoring, and caching.
 */

// Pipeline Controller
export { PipelineController, type PipelineOptions, type PipelineResult, type PipelineMode, type OutputFormat, type LayoutTree, type LayoutNode, type ThemeSpec, type SlideTheme, type ThemeLayerFacade, type VisualLayerFacade, type ExportLayerFacade } from "./pipeline-controller.js";

// Cache Manager
export { CacheManager } from "./cache-manager.js";

// Performance Monitor
export { PerformanceMonitor, type PerformanceReport, type PhaseMetrics } from "./performance-monitor.js";

// Error Handler
export { ErrorHandler, ColorParseError, ShapeGenerationError, GradientGenerationError, RenderError, ValidationError, type ThemeErrorContext, type VisualErrorContext, type ExportErrorContext } from "./error-handler.js";
