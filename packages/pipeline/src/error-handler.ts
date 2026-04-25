/**
 * Error Handler
 *
 * Provides error handling with fallback strategies for each pipeline layer.
 */

import type { ColorPalette } from "@kyro/theme-layer";
import type { VisualContext } from "@kyro/visual-layer";
import type { RenderResult } from "@kyro/export-layer";

/**
 * Custom error types for pipeline failures
 */

/**
 * Error thrown when color parsing fails
 */
export class ColorParseError extends Error {
  constructor(
    message: string,
    public color?: string,
  ) {
    super(message);
    this.name = "ColorParseError";
  }
}

/**
 * Error thrown when shape generation fails
 */
export class ShapeGenerationError extends Error {
  constructor(
    message: string,
    public slideId?: string,
  ) {
    super(message);
    this.name = "ShapeGenerationError";
  }
}

/**
 * Error thrown when gradient generation fails
 */
export class GradientGenerationError extends Error {
  constructor(
    message: string,
    public gradientType?: string,
  ) {
    super(message);
    this.name = "GradientGenerationError";
  }
}

/**
 * Error thrown when rendering fails
 */
export class RenderError extends Error {
  constructor(
    message: string,
    public format?: string,
  ) {
    super(message);
    this.name = "RenderError";
  }
}

/**
 * Error thrown when visual context validation fails
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors?: string[],
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Context for theme error handling
 */
export interface ThemeErrorContext {
  invalidColor?: string;
  retryWithRGB: () => ColorPalette;
}

/**
 * Context for visual error handling
 */
export interface VisualErrorContext {
  slideId: string;
  buildWithoutDecorations: () => VisualContext;
  buildMinimal: () => VisualContext;
}

/**
 * Context for export error handling
 */
export interface ExportErrorContext {
  format: string;
  renderAsPPTX: () => Promise<RenderResult>;
  renderSimplified: () => Promise<RenderResult>;
}

/**
 * Error Handler
 *
 * Provides fallback strategies for pipeline layer failures.
 */
export class ErrorHandler {
  /**
   * Handle Theme Layer errors with fallback to default palette
   */
  static handleThemeError(error: Error, context: ThemeErrorContext): ColorPalette {
    console.error("[ErrorHandler] Theme Layer error:", error.message);
    console.log("[ErrorHandler] Falling back to default color palette");

    // Use the retry function from context
    return context.retryWithRGB();
  }

  /**
   * Handle Visual Layer errors with fallback to minimal visuals
   */
  static handleVisualError(error: Error, context: VisualErrorContext): VisualContext {
    console.error("[ErrorHandler] Visual Layer error:", error.message);
    console.log("[ErrorHandler] Falling back to minimal visuals");

    // Use the buildMinimal function from context
    return context.buildMinimal();
  }

  /**
   * Handle Export Layer errors with fallback to PPTX
   */
  static async handleExportError(error: Error, context: ExportErrorContext): Promise<RenderResult> {
    console.error("[ErrorHandler] Export Layer error:", error.message);
    console.log(`[ErrorHandler] Falling back from ${context.format} to PPTX format`);

    // Try PPTX fallback
    try {
      return await context.renderAsPPTX();
    } catch (fallbackError: any) {
      // If PPTX also fails, try simplified rendering
      console.error("[ErrorHandler] PPTX fallback failed, trying simplified rendering");
      return await context.renderSimplified();
    }
  }

  /**
   * Get default color palette
   */
  static getDefaultPalette(): ColorPalette {
    return {
      version: "1.0",
      primary: "#0066CC",
      secondary: "#6B7280",
      accent: "#F59E0B",
      lightBg: "#FFFFFF",
      darkBg: "#1F2937",
      textOnDark: "#F9FAFB",
      textOnLight: "#111827",
      mutedOnDark: "#9CA3AF",
      mutedOnLight: "#6B7280",
      metadata: {
        colorSpace: "rgb",
        generatedAt: new Date().toISOString(),
        themeSpecHash: "fallback",
      },
    };
  }

  /**
   * Determine if an error is recoverable
   */
  static isRecoverable(error: Error): boolean {
    return error instanceof ColorParseError || error instanceof ShapeGenerationError || error instanceof GradientGenerationError;
  }

  /**
   * Get error severity level
   */
  static getSeverity(error: Error): "low" | "medium" | "high" {
    if (error instanceof ColorParseError || error instanceof GradientGenerationError) {
      return "low";
    }
    if (error instanceof ShapeGenerationError) {
      return "medium";
    }
    if (error instanceof RenderError || error instanceof ValidationError) {
      return "high";
    }
    return "medium";
  }
}
