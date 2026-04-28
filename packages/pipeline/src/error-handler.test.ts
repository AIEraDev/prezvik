/**
 * Error Handler Tests
 */

import { describe, it, expect, vi } from "vitest";
import { ErrorHandler, ColorParseError, ShapeGenerationError, GradientGenerationError, RenderError, ValidationError, type ThemeErrorContext, type VisualErrorContext, type ExportErrorContext } from "./error-handler";
import type { ColorPalette } from "@prezvik/theme-layer";
import type { VisualContext } from "@prezvik/visual-layer";
import type { RenderResult } from "@prezvik/export-layer";

describe("ErrorHandler", () => {
  describe("Custom Error Types", () => {
    it("should create ColorParseError with color", () => {
      const error = new ColorParseError("Invalid color", "#invalid");
      expect(error.name).toBe("ColorParseError");
      expect(error.message).toBe("Invalid color");
      expect(error.color).toBe("#invalid");
    });

    it("should create ShapeGenerationError with slideId", () => {
      const error = new ShapeGenerationError("Shape generation failed", "slide-1");
      expect(error.name).toBe("ShapeGenerationError");
      expect(error.message).toBe("Shape generation failed");
      expect(error.slideId).toBe("slide-1");
    });

    it("should create GradientGenerationError with gradientType", () => {
      const error = new GradientGenerationError("Gradient generation failed", "linear");
      expect(error.name).toBe("GradientGenerationError");
      expect(error.message).toBe("Gradient generation failed");
      expect(error.gradientType).toBe("linear");
    });

    it("should create RenderError with format", () => {
      const error = new RenderError("Rendering failed", "pptx");
      expect(error.name).toBe("RenderError");
      expect(error.message).toBe("Rendering failed");
      expect(error.format).toBe("pptx");
    });

    it("should create ValidationError with errors array", () => {
      const errors = ["Missing field", "Invalid value"];
      const error = new ValidationError("Validation failed", errors);
      expect(error.name).toBe("ValidationError");
      expect(error.message).toBe("Validation failed");
      expect(error.errors).toEqual(errors);
    });
  });

  describe("handleThemeError", () => {
    it("should call retryWithRGB and return fallback palette", () => {
      const mockPalette: ColorPalette = {
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
          generatedAt: "2024-01-01T00:00:00.000Z",
          themeSpecHash: "test",
        },
      };

      const context: ThemeErrorContext = {
        invalidColor: "#invalid",
        retryWithRGB: vi.fn().mockReturnValue(mockPalette),
      };

      const error = new ColorParseError("Invalid color");
      const result = ErrorHandler.handleThemeError(error, context);

      expect(context.retryWithRGB).toHaveBeenCalled();
      expect(result).toEqual(mockPalette);
    });
  });

  describe("handleVisualError", () => {
    it("should call buildMinimal and return minimal visual context", () => {
      const mockContext: VisualContext = {
        version: "1.0",
        slides: [],
        colorPalette: ErrorHandler.getDefaultPalette(),
        theme: {
          tone: "minimal",
          typography: {
            displayFont: "Arial",
            bodyFont: "Arial",
          },
        },
        metadata: {
          generatedAt: "2024-01-01T00:00:00.000Z",
          layoutTreeHash: "test",
          themeSpecHash: "test",
        },
      };

      const context: VisualErrorContext = {
        slideId: "slide-1",
        buildWithoutDecorations: vi.fn(),
        buildMinimal: vi.fn().mockReturnValue(mockContext),
      };

      const error = new ShapeGenerationError("Shape generation failed");
      const result = ErrorHandler.handleVisualError(error, context);

      expect(context.buildMinimal).toHaveBeenCalled();
      expect(result).toEqual(mockContext);
    });
  });

  describe("handleExportError", () => {
    it("should call renderAsPPTX and return result", async () => {
      const mockResult: RenderResult = {
        success: true,
        outputPath: "/path/to/output.pptx",
      };

      const context: ExportErrorContext = {
        format: "html",
        renderAsPPTX: vi.fn().mockResolvedValue(mockResult),
        renderSimplified: vi.fn(),
      };

      const error = new RenderError("HTML rendering failed");
      const result = await ErrorHandler.handleExportError(error, context);

      expect(context.renderAsPPTX).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it("should fallback to renderSimplified if renderAsPPTX fails", async () => {
      const mockResult: RenderResult = {
        success: true,
        outputPath: "/path/to/output.pptx",
      };

      const context: ExportErrorContext = {
        format: "html",
        renderAsPPTX: vi.fn().mockRejectedValue(new Error("PPTX failed")),
        renderSimplified: vi.fn().mockResolvedValue(mockResult),
      };

      const error = new RenderError("HTML rendering failed");
      const result = await ErrorHandler.handleExportError(error, context);

      expect(context.renderAsPPTX).toHaveBeenCalled();
      expect(context.renderSimplified).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe("getDefaultPalette", () => {
    it("should return a valid default color palette", () => {
      const palette = ErrorHandler.getDefaultPalette();

      expect(palette.version).toBe("1.0");
      expect(palette.primary).toBe("#0066CC");
      expect(palette.secondary).toBe("#6B7280");
      expect(palette.accent).toBe("#F59E0B");
      expect(palette.lightBg).toBe("#FFFFFF");
      expect(palette.darkBg).toBe("#1F2937");
      expect(palette.metadata.colorSpace).toBe("rgb");
      expect(palette.metadata.themeSpecHash).toBe("fallback");
    });
  });

  describe("isRecoverable", () => {
    it("should return true for ColorParseError", () => {
      const error = new ColorParseError("Invalid color");
      expect(ErrorHandler.isRecoverable(error)).toBe(true);
    });

    it("should return true for ShapeGenerationError", () => {
      const error = new ShapeGenerationError("Shape generation failed");
      expect(ErrorHandler.isRecoverable(error)).toBe(true);
    });

    it("should return true for GradientGenerationError", () => {
      const error = new GradientGenerationError("Gradient generation failed");
      expect(ErrorHandler.isRecoverable(error)).toBe(true);
    });

    it("should return false for RenderError", () => {
      const error = new RenderError("Rendering failed");
      expect(ErrorHandler.isRecoverable(error)).toBe(false);
    });

    it("should return false for generic Error", () => {
      const error = new Error("Generic error");
      expect(ErrorHandler.isRecoverable(error)).toBe(false);
    });
  });

  describe("getSeverity", () => {
    it("should return low for ColorParseError", () => {
      const error = new ColorParseError("Invalid color");
      expect(ErrorHandler.getSeverity(error)).toBe("low");
    });

    it("should return low for GradientGenerationError", () => {
      const error = new GradientGenerationError("Gradient generation failed");
      expect(ErrorHandler.getSeverity(error)).toBe("low");
    });

    it("should return medium for ShapeGenerationError", () => {
      const error = new ShapeGenerationError("Shape generation failed");
      expect(ErrorHandler.getSeverity(error)).toBe("medium");
    });

    it("should return high for RenderError", () => {
      const error = new RenderError("Rendering failed");
      expect(ErrorHandler.getSeverity(error)).toBe("high");
    });

    it("should return high for ValidationError", () => {
      const error = new ValidationError("Validation failed");
      expect(ErrorHandler.getSeverity(error)).toBe("high");
    });

    it("should return medium for generic Error", () => {
      const error = new Error("Generic error");
      expect(ErrorHandler.getSeverity(error)).toBe("medium");
    });
  });
});
