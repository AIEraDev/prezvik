/**
 * Pipeline Controller
 *
 * Orchestrates execution of Theme Layer, Visual Layer, and Export Layer
 * with error handling, performance monitoring, and caching.
 */

import type { ColorPalette } from "@kyro/theme-layer";
import type { VisualContext, SlideVisualContext } from "@kyro/visual-layer";
import type { Renderer, RenderOptions, RenderResult } from "@kyro/export-layer";
import { ErrorHandler, type ThemeErrorContext, type VisualErrorContext, type ExportErrorContext } from "./error-handler";

/**
 * Output format options
 */
export type OutputFormat = "pptx" | "html" | "pdf";

/**
 * Execution mode for the pipeline
 */
export type PipelineMode = "legacy" | "layered";

/**
 * Pipeline execution options
 */
export interface PipelineOptions {
  /** Rendering mode (legacy or layered) */
  mode?: PipelineMode;

  /** Renderer-specific options */
  renderOptions?: RenderOptions;

  /** Include Visual Context in result */
  includeVisualContext?: boolean;
}

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  /** Whether execution succeeded */
  success: boolean;

  /** Path to output file if successful */
  outputPath?: string;

  /** Visual Context if requested */
  visualContext?: VisualContext;

  /** Error information if failed */
  error?: {
    message: string;
    phase: string;
    stack?: string;
  };

  /** Performance metrics */
  performance: PerformanceReport;

  /** Total execution time in milliseconds */
  totalTime: number;
}

/**
 * Performance report for pipeline execution
 */
export interface PerformanceReport {
  phases: {
    [phase: string]: PhaseMetrics;
  };
}

/**
 * Metrics for a single phase
 */
export interface PhaseMetrics {
  count: number;
  totalTime: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
}

/**
 * Layout tree structure from layout engine
 */
export interface LayoutTree {
  root: LayoutNode;
  metadata: {
    slideId: string;
    slideType: string;
  };
}

/**
 * Layout node structure
 */
export interface LayoutNode {
  type: string;
  _rect: { x: number; y: number; width: number; height: number };
  children?: LayoutNode[];
  text?: string;
  image?: string;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
  };
}

/**
 * Theme specification input
 */
export interface ThemeSpec {
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    lightBg: string;
    darkBg: string;
    textOnDark: string;
    textOnLight: string;
    mutedOnDark: string;
    mutedOnLight: string;
  };
  typography: {
    displayFont: string;
    bodyFont: string;
  };
  slideRhythm: SlideTheme[];
  tone: "executive" | "minimal" | "modern";
}

/**
 * Per-slide theme specification
 */
export interface SlideTheme {
  slideId: string;
  backgroundMode: "dark" | "light";
  accentColor: string;
  headerStyle: "band" | "none";
  decorations: any[];
}

/**
 * Theme Layer facade interface
 */
export interface ThemeLayerFacade {
  generatePalette(themeSpec: ThemeSpec): Promise<ColorPalette>;
}

/**
 * Visual Layer facade interface
 */
export interface VisualLayerFacade {
  generateSlideVisuals(layoutTree: LayoutTree, colorPalette: ColorPalette, slideTheme: SlideTheme, themeTone: "executive" | "minimal" | "modern"): Promise<SlideVisualContext>;
}

/**
 * Export Layer facade interface
 */
export interface ExportLayerFacade {
  getRenderer(format: OutputFormat): Renderer;
}

/**
 * Cache Manager interface
 */
export interface CacheManager {
  get<T>(namespace: string, key: string): T | undefined;
  set<T>(namespace: string, key: string, value: T): void;
  hashThemeSpec(themeSpec: ThemeSpec): string;
  hashLayoutTrees(layoutTrees: LayoutTree[]): string;
}

/**
 * Performance Monitor interface
 */
export interface PerformanceMonitor {
  startPhase(phase: string): void;
  endPhase(phase: string): void;
  getCurrentPhase(): string;
  getReport(): PerformanceReport;
  reset(): void;
}

/**
 * Pipeline Controller
 *
 * Coordinates execution of all three layers with error handling,
 * performance monitoring, and caching support.
 */
export class PipelineController {
  constructor(
    private themeLayer: ThemeLayerFacade,
    private visualLayer: VisualLayerFacade,
    private exportLayer: ExportLayerFacade,
    private cacheManager: CacheManager,
    private performanceMonitor: PerformanceMonitor,
  ) {}

  /**
   * Execute the complete pipeline
   * @param layoutTrees - Resolved layout trees for all slides
   * @param themeSpec - Theme specification
   * @param outputFormat - Desired output format
   * @param options - Pipeline options
   * @returns Pipeline result with output path
   */
  async execute(layoutTrees: LayoutTree[], themeSpec: ThemeSpec, outputFormat: OutputFormat, options: PipelineOptions = {}): Promise<PipelineResult> {
    const startTime = Date.now();
    const mode = options.mode || "legacy";

    console.log(`[Pipeline] Executing in ${mode} mode`);

    try {
      // Phase 1: Theme Layer
      this.performanceMonitor.startPhase("theme");
      const colorPalette = await this.executeThemeLayer(themeSpec);
      this.performanceMonitor.endPhase("theme");

      // Phase 2: Visual Layer
      this.performanceMonitor.startPhase("visual");
      const visualContext = await this.executeVisualLayer(layoutTrees, colorPalette, themeSpec);
      this.performanceMonitor.endPhase("visual");

      // Phase 3: Export Layer
      this.performanceMonitor.startPhase("export");
      const renderResult = await this.executeExportLayer(visualContext, outputFormat, options.renderOptions);
      this.performanceMonitor.endPhase("export");

      const totalTime = Date.now() - startTime;

      return {
        success: true,
        outputPath: renderResult.outputPath,
        visualContext: options.includeVisualContext ? visualContext : undefined,
        performance: this.performanceMonitor.getReport(),
        totalTime,
      };
    } catch (error: any) {
      return this.handleError(error, startTime);
    }
  }

  /**
   * Execute Theme Layer with caching
   */
  private async executeThemeLayer(themeSpec: ThemeSpec): Promise<ColorPalette> {
    const cacheKey = this.cacheManager.hashThemeSpec(themeSpec);

    // Check cache
    const cached = this.cacheManager.get<ColorPalette>("palette", cacheKey);
    if (cached) {
      console.log("[Pipeline] Using cached color palette");
      return cached;
    }

    // Generate palette with error handling
    console.log("[Pipeline] Generating color palette...");
    try {
      const palette = await this.themeLayer.generatePalette(themeSpec);

      // Cache result
      this.cacheManager.set("palette", cacheKey, palette);

      return palette;
    } catch (error: any) {
      // Handle theme layer errors with fallback
      const context: ThemeErrorContext = {
        invalidColor: error.color,
        retryWithRGB: () => {
          // Fallback to default palette
          return ErrorHandler["getDefaultPalette"]();
        },
      };

      return ErrorHandler.handleThemeError(error, context);
    }
  }

  /**
   * Execute Visual Layer
   */
  private async executeVisualLayer(layoutTrees: LayoutTree[], colorPalette: ColorPalette, themeSpec: ThemeSpec): Promise<VisualContext> {
    console.log("[Pipeline] Generating visual elements...");

    const slides: SlideVisualContext[] = [];

    for (const layoutTree of layoutTrees) {
      const slideTheme = themeSpec.slideRhythm.find((st) => st.slideId === layoutTree.metadata.slideId);

      if (!slideTheme) {
        throw new Error(`No slide theme found for slide: ${layoutTree.metadata.slideId}`);
      }

      try {
        const slideVisuals = await this.visualLayer.generateSlideVisuals(layoutTree, colorPalette, slideTheme, themeSpec.tone);
        slides.push(slideVisuals);
      } catch (error: any) {
        // Handle visual layer errors with fallback
        const context: VisualErrorContext = {
          slideId: layoutTree.metadata.slideId,
          buildWithoutDecorations: () => {
            // Build minimal visual context without decorations
            return this.buildMinimalVisualContext(layoutTrees, colorPalette, themeSpec);
          },
          buildMinimal: () => {
            // Build minimal visual context
            return this.buildMinimalVisualContext(layoutTrees, colorPalette, themeSpec);
          },
        };

        // If error handling returns a full context, use it and break
        const fallbackContext = ErrorHandler.handleVisualError(error, context);
        return fallbackContext;
      }
    }

    return {
      version: "1.0",
      slides,
      colorPalette,
      theme: {
        tone: themeSpec.tone,
        typography: themeSpec.typography,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        layoutTreeHash: this.cacheManager.hashLayoutTrees(layoutTrees),
        themeSpecHash: this.cacheManager.hashThemeSpec(themeSpec),
      },
    };
  }

  /**
   * Build minimal visual context as fallback
   */
  private buildMinimalVisualContext(layoutTrees: LayoutTree[], colorPalette: ColorPalette, themeSpec: ThemeSpec): VisualContext {
    const slides: SlideVisualContext[] = layoutTrees.map((layoutTree) => ({
      slideId: layoutTree.metadata.slideId,
      type: layoutTree.metadata.slideType as any,
      dimensions: { width: 960, height: 540 },
      background: {
        id: `bg-${layoutTree.metadata.slideId}`,
        kind: "background" as const,
        zIndex: 0,
        opacity: 1,
        fill: {
          type: "solid" as const,
          color: colorPalette.lightBg,
        },
        dimensions: { width: 960, height: 540 },
      },
      decorations: [],
      content: [],
    }));

    return {
      version: "1.0",
      slides,
      colorPalette,
      theme: {
        tone: themeSpec.tone,
        typography: themeSpec.typography,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        layoutTreeHash: this.cacheManager.hashLayoutTrees(layoutTrees),
        themeSpecHash: this.cacheManager.hashThemeSpec(themeSpec),
      },
    };
  }

  /**
   * Execute Export Layer
   */
  private async executeExportLayer(visualContext: VisualContext, outputFormat: OutputFormat, renderOptions?: RenderOptions): Promise<RenderResult> {
    console.log(`[Pipeline] Rendering to ${outputFormat}...`);

    try {
      const renderer = this.exportLayer.getRenderer(outputFormat);

      // Validate before rendering
      const validation = renderer.validate(visualContext);
      if (!validation.valid) {
        throw new Error(`Visual Context validation failed: ${validation.errors.join(", ")}`);
      }

      // Render
      const result = await renderer.render(visualContext, renderOptions);

      if (!result.success) {
        throw new Error(`Rendering failed: ${result.errors?.join(", ")}`);
      }

      return result;
    } catch (error: any) {
      // Handle export layer errors with fallback
      const context: ExportErrorContext = {
        format: outputFormat,
        renderAsPPTX: async () => {
          // Fallback to PPTX renderer
          const pptxRenderer = this.exportLayer.getRenderer("pptx");
          return await pptxRenderer.render(visualContext, renderOptions);
        },
        renderSimplified: async () => {
          // Try simplified rendering
          const renderer = this.exportLayer.getRenderer(outputFormat);
          return await renderer.render(visualContext, { ...renderOptions, quality: "low" });
        },
      };

      return ErrorHandler.handleExportError(error, context);
    }
  }

  /**
   * Handle pipeline errors
   */
  private handleError(error: any, startTime: number): PipelineResult {
    const totalTime = Date.now() - startTime;
    const currentPhase = this.performanceMonitor.getCurrentPhase();

    console.error(`[Pipeline] Error in ${currentPhase} phase:`, error);

    return {
      success: false,
      error: {
        message: error.message,
        phase: currentPhase,
        stack: error.stack,
      },
      performance: this.performanceMonitor.getReport(),
      totalTime,
    };
  }
}
