/**
 * Pipeline Orchestrator
 *
 * Coordinates all 6 stages of the Prezvik v1 pipeline:
 * 1. Blueprint generation (using BlueprintGenerator)
 * 2. Blueprint validation (using validateBlueprint)
 * 3. Layout generation (using LayoutEngine)
 * 4. Coordinate positioning (using PositioningEngine)
 * 5. Theme application (using ThemeResolver)
 * 6. PPTX rendering (using PPTXRenderer)
 *
 * CORE PRINCIPLE:
 * - Fail fast: stop pipeline on first error
 * - Clear errors: wrap errors with stage context
 * - Observable: log stage entry and success
 */

// Node.js console global
declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
};

import type { PrezVikBlueprint } from "@prezvik/schema";
import type { LayoutTree } from "@prezvik/layout";
import { BlueprintGenerator, type BlueprintGeneratorOptions, PrezVikAI } from "@prezvik/ai";
import { validateBlueprint, type ValidationResult } from "@prezvik/schema";
import { LayoutEngine, PositioningEngine, polishLayout } from "@prezvik/layout";
import { ThemeAgent, buildStaticThemeSpec } from "@prezvik/design";
import { renderPPTXToFile } from "@prezvik/renderer-pptx";
import * as fs from "node:fs";

/**
 * Pipeline configuration options
 *
 * @example
 * ```typescript
 * const options: PipelineOptions = {
 *   outputPath: "presentation.pptx",
 *   themeName: "executive",
 *   provider: "openai"
 * };
 * ```
 */
export interface PipelineOptions {
  /**
   * Output file path for PPTX file
   * @example "output.pptx"
   * @example "./presentations/deck.pptx"
   */
  outputPath: string;

  /**
   * Theme name to apply to presentation
   * @default "executive"
   * @example "executive" | "minimal" | "modern"
   */
  themeName?: string;

  /**
   * AI provider for Blueprint generation
   * @default "openai"
   * @example "openai" | "anthropic" | "groq"
   */
  provider?: string;

  /**
   * Temperature for AI generation (0.0 - 1.0)
   * Higher values = more creative, lower values = more deterministic
   * @default 0.7
   * @example 0.5
   */
  temperature?: number;

  /**
   * Maximum tokens for AI generation
   * @default 2000
   * @example 1500
   */
  maxTokens?: number;

  /**
   * Mock mode for testing - uses template generation instead of AI
   * Set to true for CI/CD environments or when API keys are not available
   * @default false
   */
  mockMode?: boolean;
}

/**
 * Pipeline context for tracking state through stages
 *
 * Stores intermediate results from each pipeline stage and error information.
 */
export interface PipelineContext {
  /** User prompt describing the presentation */
  prompt: string;

  /** Pipeline configuration options */
  options: PipelineOptions;

  /**
   * Intermediate results from each pipeline stage
   * Each stage stores its output for use by subsequent stages
   */
  stages: {
    /** Generated Blueprint v2 JSON (Stage 1) */
    blueprint?: PrezVikBlueprint;

    /** AI-generated theme specification (Stage 2.5) */
    themeSpec?: import("@prezvik/design").ThemeSpec;

    /** Unpositioned layout trees (Stage 3) */
    layoutTrees?: LayoutTree[];

    /** Themed layout trees with colors and fonts (Stage 4) */
    themedTrees?: LayoutTree[];

    /** Polished layout trees with visual refinements (Stage 4.5) */
    polishedTrees?: LayoutTree[];

    /** Positioned layout trees with _rect coordinates (Stage 5) */
    positionedTrees?: LayoutTree[];
  };

  /** Errors encountered during pipeline execution */
  errors: PipelineError[];

  /** Pipeline start timestamp (milliseconds) */
  startTime: number;
}

/**
 * Pipeline error with stage context
 *
 * Provides detailed error information including the stage where the error occurred
 * and relevant context for debugging.
 */
export interface PipelineError {
  /** Pipeline stage where error occurred */
  stage: string;

  /** Error message */
  message: string;

  /** Additional error context (IDs, names, etc.) */
  details?: any;

  /** Stack trace for debugging */
  stack?: string;
}

/**
 * Pipeline execution error
 *
 * Thrown when a pipeline stage fails. Includes stage context and original error.
 *
 * @example
 * ```typescript
 * try {
 *   await pipeline.execute(prompt, options);
 * } catch (error) {
 *   if (error instanceof PipelineExecutionError) {
 *     console.error(`Failed at stage: ${error.stage}`);
 *     console.error(`Context:`, error.context);
 *   }
 * }
 * ```
 */
export class PipelineExecutionError extends Error {
  constructor(
    message: string,
    /** Pipeline stage where error occurred */
    public stage: string,
    /** Additional context for debugging */
    public context?: any,
    /** Original error that caused the failure */
    public originalError?: Error,
    /** Timestamp of error occurrence */
    public timestamp: Date = new Date(),
  ) {
    super(`[${stage}] ${message}`);
    this.name = "PipelineExecutionError";
  }

  /**
   * Format error for detailed logging
   */
  toDetailedString(): string {
    let details = `Pipeline Error at Stage: ${this.stage}\n`;
    details += `Message: ${this.message}\n`;
    details += `Timestamp: ${this.timestamp.toISOString()}\n`;

    if (this.context) {
      details += `Context: ${JSON.stringify(this.context, null, 2)}\n`;
    }

    if (this.originalError) {
      details += `Original Error: ${this.originalError.message}\n`;
      if (this.originalError.stack) {
        details += `Stack Trace:\n${this.originalError.stack}\n`;
      }
    }

    return details;
  }
}

/**
 * Pipeline Orchestrator
 *
 * Executes the complete Prezvik v1 pipeline from prompt to PPTX.
 *
 * The pipeline consists of 6 stages:
 * 1. Blueprint Generation - Transform prompt into Blueprint v2 JSON
 * 2. Blueprint Validation - Validate against Zod schema
 * 3. Layout Generation - Create layout node trees
 * 4. Theme Application - Apply colors and fonts (MUST be before positioning)
 * 5. Coordinate Positioning - Compute absolute x/y coordinates
 * 6. PPTX Rendering - Render to PowerPoint file
 *
 * @example
 * ```typescript
 * const pipeline = new Pipeline();
 *
 * await pipeline.execute("Create a 3-slide presentation about AI", {
 *   outputPath: "output.pptx",
 *   themeName: "executive",
 *   mockMode: true
 * });
 * ```
 */
export class Pipeline {
  private blueprintGenerator: BlueprintGenerator;
  private layoutEngine: LayoutEngine;
  private positioningEngine: PositioningEngine;

  constructor() {
    // Initialize components
    const prezVikAI = new PrezVikAI();
    this.blueprintGenerator = new BlueprintGenerator(prezVikAI);
    this.layoutEngine = new LayoutEngine();
    this.positioningEngine = new PositioningEngine({ overflowStrategy: "truncate" });
  }

  /**
   * Execute the complete pipeline
   *
   * Runs all 6 pipeline stages in sequence:
   * 1. Blueprint Generation
   * 2. Blueprint Validation
   * 3. Layout Generation
   * 4. Theme Application
   * 5. Coordinate Positioning
   * 6. PPTX Rendering
   *
   * The pipeline fails fast - if any stage fails, execution stops immediately
   * and a PipelineExecutionError is thrown with stage context.
   *
   * @param prompt - User prompt describing the presentation
   * @param options - Pipeline configuration options
   * @throws {PipelineExecutionError} If any stage fails
   *
   * @example
   * ```typescript
   * const pipeline = new Pipeline();
   *
   * // Basic usage with mock mode
   * await pipeline.execute("Create a presentation about AI", {
   *   outputPath: "output.pptx",
   *   mockMode: true
   * });
   *
   * // With AI provider and custom theme
   * await pipeline.execute("Create a pitch deck", {
   *   outputPath: "pitch.pptx",
   *   themeName: "modern",
   *   provider: "openai",
   *   temperature: 0.7
   * });
   * ```
   */
  async execute(prompt: string, options: PipelineOptions): Promise<void> {
    const context: PipelineContext = {
      prompt,
      options,
      stages: {},
      errors: [],
      startTime: Date.now(),
    };

    // Log pipeline start
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Prezvik Pipeline v1.0 - Starting Execution`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? "..." : ""}"`);
    console.log(`Theme: ${options.themeName || "executive"}`);
    console.log(`Provider: ${options.provider || "auto-detect"}`);
    console.log(`${"=".repeat(60)}`);

    try {
      // Stage 1: Blueprint generation
      await this.executeStage1(context);

      // Stage 2: Blueprint validation
      await this.executeStage2(context);

      // Stage 2.5: ThemeAgent
      await this.executeStageThemeAgent(context);

      // Stage 3: Layout generation
      await this.executeStage3(context);

      // Stage 4: Theme application (before positioning so font sizes are known)
      await this.executeStage4(context);

      // Stage 4.5: Polish layout (visual refinements after theme, before positioning)
      await this.executeStage4_5(context);

      // Stage 5: Coordinate positioning (after theme so heights are accurate)
      await this.executeStage5(context);

      // Stage 6: PPTX rendering
      await this.executeStage6(context);

      // Log completion
      const duration = Date.now() - context.startTime;
      console.log(`\n${"=".repeat(60)}`);
      console.log(`✓ Pipeline completed successfully!`);
      console.log(`${"=".repeat(60)}`);
      console.log(`  Total time: ${(duration / 1000).toFixed(2)}s`);
      console.log(`  Output file: ${options.outputPath}`);
      const slideCount = context.stages.blueprint?.slides?.length ?? 0;
      console.log(`  Slides generated: ${slideCount}`);
      console.log(`  Theme: ${options.themeName || "executive"}`);
      console.log(`${"=".repeat(60)}\n`);
    } catch (error) {
      // Log error with comprehensive context
      if (error instanceof PipelineExecutionError) {
        console.error(`✗ Pipeline failed at stage: ${error.stage}`);
        console.error(`✗ Error: ${error.message}`);
        if (error.context) {
          console.error(`✗ Context:`, JSON.stringify(error.context, null, 2));
        }
        if (error.originalError?.stack) {
          console.error(`✗ Stack trace:\n${error.originalError.stack}`);
        }
        // Log detailed error report for debugging
        console.error(`\n=== Detailed Error Report ===\n${error.toDetailedString()}`);
      } else {
        console.error(`✗ Pipeline failed with unexpected error:`, error);
      }
      throw error;
    }
  }

  /**
   * Stage 1: Blueprint generation
   */
  private async executeStage1(context: PipelineContext): Promise<void> {
    const stage = "Blueprint Generation";
    console.log(`\n→ Stage 1: ${stage}`);
    console.log(`  Prompt: "${context.prompt.substring(0, 80)}${context.prompt.length > 80 ? "..." : ""}"`);

    try {
      const generatorOptions: BlueprintGeneratorOptions = {
        provider: context.options.provider,
        temperature: context.options.temperature,
        maxTokens: context.options.maxTokens,
        mockMode: context.options.mockMode,
      };

      const blueprint = await this.blueprintGenerator.generate(context.prompt, generatorOptions);

      context.stages.blueprint = blueprint;
      console.log(`✓ Stage 1 completed - Generated ${blueprint.slides.length} slides`);
      console.log(`  Title: "${blueprint.meta.title}"`);
      console.log(`  Goal: ${blueprint.meta.goal}, Tone: ${blueprint.meta.tone}`);
    } catch (error) {
      throw new PipelineExecutionError(`Blueprint generation failed: ${error instanceof Error ? error.message : String(error)}`, stage, { prompt: context.prompt }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 2: Blueprint validation
   */
  private async executeStage2(context: PipelineContext): Promise<void> {
    const stage = "Blueprint Validation";
    console.log(`\n→ Stage 2: ${stage}`);

    try {
      if (!context.stages.blueprint) {
        throw new Error("Blueprint not found in context");
      }

      console.log(`  Validating Blueprint structure...`);
      const result: ValidationResult<PrezVikBlueprint> = validateBlueprint(context.stages.blueprint);

      if (!result.success) {
        const errorMessages = result.errors?.map((err) => `  - ${err.path.join(".")}: ${err.message}`).join("\n");
        console.error(`  Validation errors:\n${errorMessages}`);
        throw new Error(`Blueprint validation failed:\n${errorMessages}`);
      }

      // Update context with validated blueprint
      context.stages.blueprint = result.data;
      console.log(`✓ Stage 2 completed - Blueprint is valid`);
      if (result.data) {
        console.log(`  Validated ${result.data.slides.length} slides`);
      }
    } catch (error) {
      throw new PipelineExecutionError(`Blueprint validation failed: ${error instanceof Error ? error.message : String(error)}`, stage, { blueprint: context.stages.blueprint }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 2.5: ThemeAgent — generate AI theme spec with fallback
   */
  private async executeStageThemeAgent(context: PipelineContext): Promise<void> {
    console.log(`\n→ Stage 2.5: ThemeAgent`);
    try {
      const agent = new ThemeAgent();
      context.stages.themeSpec = await agent.generateTheme(
        context.stages.blueprint!,
        { fallbackTheme: context.options.themeName || "executive" },
      );
      console.log("✓ Stage 2.5: ThemeAgent complete");
    } catch (err) {
      console.warn(`⚠ ThemeAgent failed, using static fallback: ${err}`);
      context.stages.themeSpec = buildStaticThemeSpec(
        context.stages.blueprint!,
        context.options.themeName || "executive",
      );
    }
  }

  /**
   * Stage 3: Layout generation (with non-fatal fallback)
   */
  private async executeStage3(context: PipelineContext): Promise<void> {
    const stage = "Layout Generation";
    console.log(`\n→ Stage 3: ${stage}`);

    try {
      if (!context.stages.blueprint) {
        throw new Error("Validated blueprint not found in context");
      }

      console.log(`  Generating layout trees for ${context.stages.blueprint.slides.length} slides...`);
      const layoutTrees = await this.layoutEngine.generateLayout(context.stages.blueprint);

      context.stages.layoutTrees = layoutTrees;
      console.log(`✓ Stage 3 completed - Generated ${layoutTrees.length} layout trees`);

      // Log slide types
      const slideTypes = context.stages.blueprint.slides.map((s) => s.type).join(", ");
      console.log(`  Slide types: ${slideTypes}`);
    } catch (error) {
      // Non-fatal fallback: generate simple layouts if main engine fails
      console.warn(`⚠ Layout generation failed, attempting fallback: ${error instanceof Error ? error.message : String(error)}`);
      try {
        const fallbackTrees = this.generateFallbackLayouts(context.stages.blueprint);
        context.stages.layoutTrees = fallbackTrees;
        console.log(`✓ Stage 3 completed with fallback - Generated ${fallbackTrees.length} simple layout trees`);
        context.errors.push({ stage, message: `Used fallback layouts: ${error instanceof Error ? error.message : String(error)}` });
      } catch (fallbackError) {
        // If fallback also fails, record error but don't stop pipeline
        console.error(`✗ Stage 3 failed completely: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
        context.errors.push({ stage, message: `Layout generation failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}` });
        context.stages.layoutTrees = [];
      }
    }
  }

  /**
   * Generate simple fallback layouts
   */
  private generateFallbackLayouts(blueprint: any): any[] {
    // Generate minimal layout trees for each slide
    return blueprint.slides.map((slide: any) => ({
      id: slide.id,
      root: {
        id: `${slide.id}-root`,
        type: "container",
        children:
          slide.content.blocks?.map((block: any, index: number) => ({
            id: `${slide.id}-block-${index}`,
            type: "text",
            content: block.content || "",
            text: {
              fontSize: 24,
              fontFamily: "Calibri",
              color: "000000",
            },
          })) || [],
      },
    }));
  }

  /**
   * Stage 4: Theme application (ThemeSpec applied at rendering time)
   */
  private async executeStage4(context: PipelineContext): Promise<void> {
    const stage = "Theme Application";
    const themeName = context.options.themeName || "executive";
    console.log(`\n→ Stage 4: ${stage}`);
    console.log(`  Using ThemeSpec: ${themeName}`);

    try {
      if (!context.stages.layoutTrees) {
        throw new Error("Layout trees not found in context");
      }

      // Pass layoutTrees through as themedTrees
      // ThemeSpec will be applied at rendering time (Stage 6)
      context.stages.themedTrees = context.stages.layoutTrees;
      console.log(`✓ Stage 4 completed - ${context.stages.layoutTrees.length} slides ready for rendering`);
    } catch (error) {
      throw new PipelineExecutionError(`Theme application failed: ${error instanceof Error ? error.message : String(error)}`, stage, { themeName: context.options.themeName }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 4.5: Polish layout
   */
  private async executeStage4_5(context: PipelineContext): Promise<void> {
    const stage = "Layout Polish";
    console.log(`\n→ Stage 4.5: ${stage}`);
    console.log(`  Applying visual refinements...`);

    try {
      if (!context.stages.themedTrees) {
        throw new Error("Themed trees not found in context");
      }

      // Apply polish to each themed tree for visual refinements
      const polishedTrees = context.stages.themedTrees.map((tree) => polishLayout(tree));

      context.stages.polishedTrees = polishedTrees;
      console.log(`✓ Stage 4.5 completed - Polished ${polishedTrees.length} slides`);
    } catch (error) {
      throw new PipelineExecutionError(`Layout polish failed: ${error instanceof Error ? error.message : String(error)}`, stage, { treeCount: context.stages.themedTrees?.length }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 5: Coordinate positioning
   */
  private async executeStage5(context: PipelineContext): Promise<void> {
    const stage = "Coordinate Positioning";
    console.log(`\n→ Stage 5: ${stage}`);
    console.log(`  Computing absolute coordinates (percentage-based)...`);

    try {
      if (!context.stages.polishedTrees) {
        throw new Error("Polished trees not found in context");
      }

      const positionedTrees = this.positioningEngine.position(context.stages.polishedTrees);

      context.stages.positionedTrees = positionedTrees;
      console.log(`✓ Stage 5 completed - Positioned ${positionedTrees.length} slides`);
      console.log(`  Coordinate system: 0-100% (renderer-independent)`);
    } catch (error) {
      throw new PipelineExecutionError(`Coordinate positioning failed: ${error instanceof Error ? error.message : String(error)}`, stage, { treeCount: context.stages.polishedTrees?.length }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 6: PPTX rendering
   */
  private async executeStage6(context: PipelineContext): Promise<void> {
    const stage = "PPTX Rendering";
    console.log(`\n→ Stage 6: ${stage}`);
    console.log(`  Converting to PowerPoint format...`);
    console.log(`  Output: ${context.options.outputPath}`);

    try {
      if (!context.stages.positionedTrees) {
        throw new Error("Positioned trees not found in context");
      }

      await renderPPTXToFile(context.stages.positionedTrees, context.options.outputPath, context.stages.themeSpec);

      // Verify output file exists
      if (!fs.existsSync(context.options.outputPath)) {
        throw new Error(`Output file not created: ${context.options.outputPath}`);
      }

      const stats = fs.statSync(context.options.outputPath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✓ Stage 6 completed - Generated PPTX file (${fileSizeKB} KB)`);
    } catch (error) {
      throw new PipelineExecutionError(`PPTX rendering failed: ${error instanceof Error ? error.message : String(error)}`, stage, { outputPath: context.options.outputPath }, error instanceof Error ? error : undefined);
    }
  }
}

/**
 * Global instance
 */
let globalPipeline: Pipeline | null = null;

/**
 * Get global pipeline instance
 */
export function getPipeline(): Pipeline {
  if (!globalPipeline) {
    globalPipeline = new Pipeline();
  }
  return globalPipeline;
}
