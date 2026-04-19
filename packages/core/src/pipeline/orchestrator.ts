/**
 * Pipeline Orchestrator
 *
 * Coordinates all 6 stages of the Kyro v1 pipeline:
 * 1. Blueprint generation (using BlueprintGenerator)
 * 2. Blueprint validation (using validateBlueprint)
 * 3. Layout generation (using LayoutEngineV2)
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
};

import type { KyroBlueprint } from "@kyro/schema";
import type { LayoutTree } from "@kyro/layout";
import { BlueprintGenerator, type BlueprintGeneratorOptions, KyroAI } from "@kyro/ai";
import { validateBlueprint, type ValidationResult } from "@kyro/schema";
import { LayoutEngineV2, PositioningEngine, polishLayout } from "@kyro/layout";
import { ThemeResolver } from "@kyro/design";
import { renderPPTXToFile } from "@kyro/renderer-pptx";
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
    blueprint?: KyroBlueprint;

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
 * Executes the complete Kyro v1 pipeline from prompt to PPTX.
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
  private layoutEngine: LayoutEngineV2;
  private positioningEngine: PositioningEngine;
  private themeResolver: ThemeResolver;

  constructor() {
    // Initialize components
    const kyroAI = new KyroAI();
    this.blueprintGenerator = new BlueprintGenerator(kyroAI);
    this.layoutEngine = new LayoutEngineV2();
    this.positioningEngine = new PositioningEngine({ overflowStrategy: "truncate" });
    this.themeResolver = new ThemeResolver();
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

    try {
      // Stage 1: Blueprint generation
      await this.executeStage1(context);

      // Stage 2: Blueprint validation
      await this.executeStage2(context);

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
      console.log(`✓ Pipeline completed in ${(duration / 1000).toFixed(2)}s`);
      console.log(`✓ Output: ${options.outputPath}`);
      const slideCount = context.stages.blueprint?.slides?.length ?? 0;
      console.log(`✓ Generated ${slideCount} slides`);
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
    console.log(`→ ${stage}...`);

    try {
      const generatorOptions: BlueprintGeneratorOptions = {
        provider: context.options.provider,
        temperature: context.options.temperature,
        maxTokens: context.options.maxTokens,
      };

      const blueprint = await this.blueprintGenerator.generate(context.prompt, generatorOptions);

      context.stages.blueprint = blueprint;
      console.log(`✓ ${stage} completed`);
    } catch (error) {
      throw new PipelineExecutionError(`Blueprint generation failed: ${error instanceof Error ? error.message : String(error)}`, stage, { prompt: context.prompt }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 2: Blueprint validation
   */
  private async executeStage2(context: PipelineContext): Promise<void> {
    const stage = "Blueprint Validation";
    console.log(`→ ${stage}...`);

    try {
      if (!context.stages.blueprint) {
        throw new Error("Blueprint not found in context");
      }

      const result: ValidationResult<KyroBlueprint> = validateBlueprint(context.stages.blueprint);

      if (!result.success) {
        const errorMessages = result.errors?.map((err) => `  - ${err.path.join(".")}: ${err.message}`).join("\n");
        throw new Error(`Blueprint validation failed:\n${errorMessages}`);
      }

      // Update context with validated blueprint
      context.stages.blueprint = result.data;
      console.log(`✓ ${stage} completed`);
    } catch (error) {
      throw new PipelineExecutionError(`Blueprint validation failed: ${error instanceof Error ? error.message : String(error)}`, stage, { blueprint: context.stages.blueprint }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 3: Layout generation
   */
  private async executeStage3(context: PipelineContext): Promise<void> {
    const stage = "Layout Generation";
    console.log(`→ ${stage}...`);

    try {
      if (!context.stages.blueprint) {
        throw new Error("Validated blueprint not found in context");
      }

      const layoutTrees = await this.layoutEngine.generateLayout(context.stages.blueprint);

      context.stages.layoutTrees = layoutTrees;
      console.log(`✓ ${stage} completed (${layoutTrees.length} slides)`);
    } catch (error) {
      throw new PipelineExecutionError(`Layout generation failed: ${error instanceof Error ? error.message : String(error)}`, stage, { slideCount: context.stages.blueprint?.slides.length }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 4: Theme application
   */
  private async executeStage4(context: PipelineContext): Promise<void> {
    const stage = "Theme Application";
    console.log(`→ ${stage}...`);

    try {
      if (!context.stages.layoutTrees) {
        throw new Error("Layout trees not found in context");
      }

      const themeName = context.options.themeName || "executive";
      const themedTrees = this.themeResolver.apply(context.stages.layoutTrees, themeName);

      context.stages.themedTrees = themedTrees;
      console.log(`✓ ${stage} completed (theme: ${themeName})`);
    } catch (error) {
      throw new PipelineExecutionError(`Theme application failed: ${error instanceof Error ? error.message : String(error)}`, stage, { themeName: context.options.themeName }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 4.5: Polish layout
   */
  private async executeStage4_5(context: PipelineContext): Promise<void> {
    const stage = "Layout Polish";
    console.log(`→ ${stage}...`);

    try {
      if (!context.stages.themedTrees) {
        throw new Error("Themed trees not found in context");
      }

      // Apply polish to each themed tree for visual refinements
      const polishedTrees = context.stages.themedTrees.map((tree) => polishLayout(tree));

      context.stages.polishedTrees = polishedTrees;
      console.log(`✓ ${stage} completed (${polishedTrees.length} slides polished)`);
    } catch (error) {
      throw new PipelineExecutionError(`Layout polish failed: ${error instanceof Error ? error.message : String(error)}`, stage, { treeCount: context.stages.themedTrees?.length }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 5: Coordinate positioning
   */
  private async executeStage5(context: PipelineContext): Promise<void> {
    const stage = "Coordinate Positioning";
    console.log(`→ ${stage}...`);

    try {
      if (!context.stages.polishedTrees) {
        throw new Error("Polished trees not found in context");
      }

      const positionedTrees = this.positioningEngine.position(context.stages.polishedTrees);

      context.stages.positionedTrees = positionedTrees;
      console.log(`✓ ${stage} completed`);
    } catch (error) {
      throw new PipelineExecutionError(`Coordinate positioning failed: ${error instanceof Error ? error.message : String(error)}`, stage, { treeCount: context.stages.polishedTrees?.length }, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Stage 6: PPTX rendering
   */
  private async executeStage6(context: PipelineContext): Promise<void> {
    const stage = "PPTX Rendering";
    console.log(`→ ${stage}...`);

    try {
      if (!context.stages.positionedTrees) {
        throw new Error("Positioned trees not found in context");
      }

      await renderPPTXToFile(context.stages.positionedTrees, context.options.outputPath);

      // Verify output file exists
      if (!fs.existsSync(context.options.outputPath)) {
        throw new Error(`Output file not created: ${context.options.outputPath}`);
      }

      console.log(`✓ ${stage} completed`);
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
