import type { VisualContext } from "@prezvik/visual-layer";

/**
 * Renderer-specific options
 */
export interface RenderOptions {
  /** Output file path */
  outputPath?: string;

  /** Rendering quality */
  quality?: "low" | "medium" | "high";

  /** Additional renderer-specific options */
  [key: string]: any;
}

/**
 * Result of a render operation
 */
export interface RenderResult {
  /** Whether rendering succeeded */
  success: boolean;

  /** Path to output file if successful */
  outputPath?: string;

  /** Output buffer if not written to file */
  buffer?: Buffer;

  /** Errors encountered during rendering */
  errors?: string[];

  /** Warnings encountered during rendering */
  warnings?: string[];
}

/**
 * Result of validating a Visual Context
 */
export interface ValidationResult {
  /** Whether the Visual Context is valid */
  valid: boolean;

  /** Validation errors */
  errors: string[];

  /** Validation warnings */
  warnings: string[];
}

/**
 * Feature support matrix for a renderer
 */
export interface FeatureSupport {
  /** Supports gradient fills */
  gradients: boolean;

  /** Supports pattern fills */
  patterns: boolean;

  /** Supports blend modes */
  blendModes: boolean;

  /** Supports custom shapes */
  customShapes: boolean;

  /** Additional renderer-specific features */
  [key: string]: boolean;
}

/**
 * Common interface for all renderers
 * Renderers convert Visual Context to specific output formats (PPTX, HTML, etc.)
 */
export interface Renderer {
  /**
   * Render Visual Context to output format
   * @param visualContext - Complete visual context
   * @param options - Renderer-specific options
   * @returns Render result with output path or buffer
   */
  render(visualContext: VisualContext, options?: RenderOptions): Promise<RenderResult>;

  /**
   * Validate that Visual Context can be rendered
   * @param visualContext - Visual context to validate
   * @returns Validation result with errors if any
   */
  validate(visualContext: VisualContext): ValidationResult;

  /**
   * Get supported features for this renderer
   * @returns Feature support matrix
   */
  getSupportedFeatures(): FeatureSupport;
}
