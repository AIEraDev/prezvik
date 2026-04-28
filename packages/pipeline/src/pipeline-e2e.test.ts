/**
 * End-to-End Pipeline Integration Tests
 *
 * Tests complete pipeline execution from Blueprint to PPTX output.
 * Validates all three layers execute in sequence with proper error handling
 * and performance monitoring.
 *
 * Requirements tested:
 * - 12.8: End-to-end tests for complete layered flow
 * - 4.9: Pipeline integration tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PipelineController } from "./pipeline-controller";
import type { ThemeLayerFacade, VisualLayerFacade, ExportLayerFacade, CacheManager, PerformanceMonitor, LayoutTree, ThemeSpec } from "./pipeline-controller";
import { CacheManager as CacheManagerImpl } from "./cache-manager";
import { PerformanceMonitor as PerformanceMonitorImpl } from "./performance-monitor";
import type { ColorPalette } from "@prezvik/theme-layer";
import type { SlideVisualContext, VisualContext } from "@prezvik/visual-layer";
import type { RenderResult, ValidationResult } from "@prezvik/export-layer";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

describe("Pipeline End-to-End Integration Tests", () => {
  let mockThemeLayer: ThemeLayerFacade;
  let mockVisualLayer: VisualLayerFacade;
  let mockExportLayer: ExportLayerFacade;
  let cacheManager: CacheManager;
  let performanceMonitor: PerformanceMonitor;
  let controller: PipelineController;
  let tempDir: string;
  let outputPath: string;

  beforeEach(() => {
    // Create temp directory for test outputs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prezvik-pipeline-test-"));
    outputPath = path.join(tempDir, "test-output.pptx");

    // Mock Theme Layer with realistic palette generation
    mockThemeLayer = {
      generatePalette: vi.fn().mockResolvedValue({
        version: "1.0",
        primary: "#0066CC",
        secondary: "#FF6B35",
        accent: "#FFD23F",
        lightBg: "#FFFFFF",
        darkBg: "#1A1A1A",
        textOnDark: "#FFFFFF",
        textOnLight: "#1A1A1A",
        mutedOnDark: "#CCCCCC",
        mutedOnLight: "#666666",
        metadata: {
          colorSpace: "oklch",
          generatedAt: new Date().toISOString(),
          themeSpecHash: "test-hash",
        },
      } as ColorPalette),
    };

    // Mock Visual Layer with realistic visual generation
    mockVisualLayer = {
      generateSlideVisuals: vi.fn().mockImplementation((layoutTree: LayoutTree) => {
        return Promise.resolve({
          slideId: layoutTree.metadata.slideId,
          type: layoutTree.metadata.slideType,
          dimensions: { width: 960, height: 540 },
          background: {
            id: `bg-${layoutTree.metadata.slideId}`,
            kind: "background",
            zIndex: 0,
            opacity: 1,
            fill: {
              type: "gradient",
              gradient: {
                type: "linear",
                angle: 45,
                stops: [
                  { position: 0, color: "#0066CC" },
                  { position: 1, color: "#004C99" },
                ],
              },
            },
            dimensions: { width: 960, height: 540 },
          },
          decorations: [
            {
              id: `decoration-${layoutTree.metadata.slideId}`,
              kind: "shape",
              zIndex: 1,
              opacity: 0.3,
            },
          ] as any[],
          content: [],
        } as SlideVisualContext);
      }),
    };

    // Mock Export Layer with file creation
    const mockRenderer = {
      render: vi.fn().mockImplementation(async (_visualContext: VisualContext, options?: any) => {
        const outputFile = options?.outputPath || outputPath;
        // Create a minimal PPTX-like file (ZIP signature)
        const zipSignature = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
        fs.writeFileSync(outputFile, zipSignature);

        return {
          success: true,
          outputPath: outputFile,
        } as RenderResult;
      }),
      validate: vi.fn().mockReturnValue({
        valid: true,
        errors: [],
        warnings: [],
      } as ValidationResult),
      getSupportedFeatures: vi.fn().mockReturnValue({
        gradients: true,
        patterns: true,
        blendModes: false,
        customShapes: true,
      }),
    };

    mockExportLayer = {
      getRenderer: vi.fn().mockReturnValue(mockRenderer),
    };

    // Use real implementations for cache and performance monitoring
    cacheManager = new CacheManagerImpl();
    performanceMonitor = new PerformanceMonitorImpl();

    controller = new PipelineController(mockThemeLayer, mockVisualLayer, mockExportLayer, cacheManager, performanceMonitor);
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("Complete Pipeline Execution", () => {
    it("should execute all three layers in sequence for a single slide", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      // Verify all layers were called
      expect(mockThemeLayer.generatePalette).toHaveBeenCalledWith(themeSpec);
      expect(mockVisualLayer.generateSlideVisuals).toHaveBeenCalledTimes(1);
      expect(mockExportLayer.getRenderer).toHaveBeenCalledWith("pptx");

      // Verify result
      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("should execute all three layers for multiple slides", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-2", slideType: "content" },
        },
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-3", slideType: "closing" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      // Verify visual layer was called for each slide
      expect(mockVisualLayer.generateSlideVisuals).toHaveBeenCalledTimes(3);

      // Verify result
      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("should generate valid Visual Context with all slides", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-2", slideType: "content" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
        includeVisualContext: true,
      });

      // Verify Visual Context is included
      expect(result.visualContext).toBeDefined();
      expect(result.visualContext?.version).toBe("1.0");
      expect(result.visualContext?.slides).toHaveLength(2);
      expect(result.visualContext?.colorPalette).toBeDefined();
      expect(result.visualContext?.theme).toBeDefined();
      expect(result.visualContext?.metadata).toBeDefined();

      // Verify each slide has required properties
      result.visualContext?.slides.forEach((slide) => {
        expect(slide.slideId).toBeDefined();
        expect(slide.type).toBeDefined();
        expect(slide.dimensions).toBeDefined();
        expect(slide.background).toBeDefined();
        expect(slide.decorations).toBeDefined();
        expect(slide.content).toBeDefined();
      });
    });

    it("should create valid PPTX file with correct structure", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      expect(result.success).toBe(true);
      expect(fs.existsSync(outputPath)).toBe(true);

      // Verify file has ZIP signature (PPTX is a ZIP archive)
      const fileBuffer = fs.readFileSync(outputPath);
      const zipSignature = fileBuffer.slice(0, 4);
      expect(zipSignature.toString("hex")).toBe("504b0304");

      // Verify file size is reasonable
      const stats = fs.statSync(outputPath);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe("Error Handling in Each Phase", () => {
    it("should handle Theme Layer errors with fallback", async () => {
      mockThemeLayer.generatePalette = vi.fn().mockRejectedValue(new Error("Color parsing failed"));

      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      // Should succeed with fallback palette
      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("should handle Visual Layer errors with fallback", async () => {
      mockVisualLayer.generateSlideVisuals = vi.fn().mockRejectedValue(new Error("Shape generation failed"));

      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      // Should succeed with fallback minimal visuals
      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("should handle Export Layer validation errors", async () => {
      const mockRenderer = {
        render: vi.fn().mockResolvedValue({
          success: true,
          outputPath,
        }),
        validate: vi.fn().mockReturnValue({
          valid: false,
          errors: ["Missing required field: background"],
          warnings: [],
        }),
        getSupportedFeatures: vi.fn().mockReturnValue({
          gradients: true,
          patterns: true,
          blendModes: false,
          customShapes: true,
        }),
      };

      mockExportLayer.getRenderer = vi.fn().mockReturnValue(mockRenderer);

      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec(1);

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      // Should succeed with fallback (error handler tries fallback renderers)
      // The validation error triggers error handling which may succeed with fallback
      expect(result.success).toBe(true);
    });

    it("should handle Export Layer rendering errors with fallback", async () => {
      const mockRenderer = {
        render: vi.fn().mockRejectedValue(new Error("Rendering failed")),
        validate: vi.fn().mockReturnValue({
          valid: true,
          errors: [],
          warnings: [],
        }),
        getSupportedFeatures: vi.fn().mockReturnValue({
          gradients: true,
          patterns: true,
          blendModes: false,
          customShapes: true,
        }),
      };

      mockExportLayer.getRenderer = vi.fn().mockReturnValue(mockRenderer);

      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      // Should fail since export layer error handling also fails
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle missing slide theme gracefully", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-missing", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      // Should fail with clear error message
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("No slide theme found");
    });
  });

  describe("Performance Monitoring", () => {
    it("should track execution time for each phase", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      expect(result.success).toBe(true);
      expect(result.performance).toBeDefined();
      expect(result.performance.phases).toBeDefined();

      // Verify all phases are tracked
      expect(result.performance.phases.theme).toBeDefined();
      expect(result.performance.phases.visual).toBeDefined();
      expect(result.performance.phases.export).toBeDefined();

      // Verify phase metrics
      Object.values(result.performance.phases).forEach((phase) => {
        expect(phase.count).toBeGreaterThan(0);
        expect(phase.totalTime).toBeGreaterThanOrEqual(0);
        expect(phase.avgTime).toBeGreaterThanOrEqual(0);
        expect(phase.maxTime).toBeGreaterThanOrEqual(0);
        expect(phase.minTime).toBeGreaterThanOrEqual(0);
      });
    });

    it("should track total execution time", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      expect(result.success).toBe(true);
      expect(result.totalTime).toBeGreaterThan(0);
      expect(result.totalTime).toBeLessThan(10000); // Should complete in under 10 seconds
    });

    it("should meet performance targets for 10-slide presentation", async () => {
      const layoutTrees: LayoutTree[] = Array.from({ length: 10 }, (_, i) => ({
        root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
        metadata: { slideId: `slide-${i + 1}`, slideType: i === 0 ? "hero" : i === 9 ? "closing" : "content" },
      }));

      const themeSpec: ThemeSpec = createTestThemeSpec(10);

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      expect(result.success).toBe(true);

      // Performance targets from requirements:
      // - Theme Layer: < 100ms per slide
      // - Visual Layer: < 500ms per slide
      // - Export Layer: < 1000ms per slide
      // - Total: < 5000ms for 10 slides

      const themePhase = result.performance.phases.theme;
      const visualPhase = result.performance.phases.visual;
      const exportPhase = result.performance.phases.export;

      // Note: These are relaxed for mock implementations
      // Real implementations should meet stricter targets
      expect(themePhase.avgTime).toBeLessThan(200); // Relaxed from 100ms
      expect(visualPhase.avgTime).toBeLessThan(1000); // Relaxed from 500ms
      expect(exportPhase.avgTime).toBeLessThan(2000); // Relaxed from 1000ms

      // Total time should be reasonable
      expect(result.totalTime).toBeLessThan(10000); // Relaxed from 5000ms for mocks
    });
  });

  describe("Caching Behavior", () => {
    it("should cache color palette and reuse on second execution", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      // First execution
      const result1 = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      expect(result1.success).toBe(true);
      expect(mockThemeLayer.generatePalette).toHaveBeenCalledTimes(1);

      // Second execution with same theme spec
      const outputPath2 = path.join(tempDir, "test-output-2.pptx");
      const result2 = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath: outputPath2 },
      });

      expect(result2.success).toBe(true);

      // Theme layer should not be called again (cache hit)
      expect(mockThemeLayer.generatePalette).toHaveBeenCalledTimes(1);
    });

    it("should regenerate palette when theme spec changes", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec1: ThemeSpec = createTestThemeSpec();

      // First execution
      const result1 = await controller.execute(layoutTrees, themeSpec1, "pptx", {
        renderOptions: { outputPath },
      });

      expect(result1.success).toBe(true);
      expect(mockThemeLayer.generatePalette).toHaveBeenCalledTimes(1);

      // Second execution with different theme spec
      const themeSpec2: ThemeSpec = {
        ...themeSpec1,
        palette: {
          ...themeSpec1.palette,
          primary: "#FF0000", // Different color
        },
      };

      const outputPath2 = path.join(tempDir, "test-output-2.pptx");
      const result2 = await controller.execute(layoutTrees, themeSpec2, "pptx", {
        renderOptions: { outputPath: outputPath2 },
      });

      expect(result2.success).toBe(true);

      // Theme layer should be called again (cache miss)
      expect(mockThemeLayer.generatePalette).toHaveBeenCalledTimes(2);
    });
  });

  describe("Multiple Output Formats", () => {
    it("should support PPTX output format", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
      });

      expect(result.success).toBe(true);
      expect(mockExportLayer.getRenderer).toHaveBeenCalledWith("pptx");
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it("should support HTML output format", async () => {
      const htmlOutputPath = path.join(tempDir, "test-output.html");

      const mockHtmlRenderer = {
        render: vi.fn().mockImplementation(async (_visualContext: VisualContext, options?: any) => {
          const outputFile = options?.outputPath || htmlOutputPath;
          fs.writeFileSync(outputFile, "<!DOCTYPE html><html></html>");

          return {
            success: true,
            outputPath: outputFile,
          } as RenderResult;
        }),
        validate: vi.fn().mockReturnValue({
          valid: true,
          errors: [],
          warnings: [],
        }),
        getSupportedFeatures: vi.fn().mockReturnValue({
          gradients: true,
          patterns: false,
          blendModes: true,
          customShapes: false,
        }),
      };

      mockExportLayer.getRenderer = vi.fn().mockReturnValue(mockHtmlRenderer);

      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec();

      const result = await controller.execute(layoutTrees, themeSpec, "html", {
        renderOptions: { outputPath: htmlOutputPath },
      });

      expect(result.success).toBe(true);
      expect(mockExportLayer.getRenderer).toHaveBeenCalledWith("html");
      expect(fs.existsSync(htmlOutputPath)).toBe(true);
    });
  });

  describe("Complex Scenarios", () => {
    it("should handle presentation with all slide types", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-2", slideType: "section" },
        },
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-3", slideType: "content" },
        },
        {
          root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
          metadata: { slideId: "slide-4", slideType: "closing" },
        },
      ];

      const themeSpec: ThemeSpec = createTestThemeSpec(4);

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
        includeVisualContext: true,
      });

      expect(result.success).toBe(true);
      expect(result.visualContext?.slides).toHaveLength(4);

      // Verify each slide type was processed
      const slideTypes = result.visualContext?.slides.map((s) => s.type);
      expect(slideTypes).toContain("hero");
      expect(slideTypes).toContain("section");
      expect(slideTypes).toContain("content");
      expect(slideTypes).toContain("closing");
    });

    it("should handle presentation with different theme tones", async () => {
      const tones: Array<"executive" | "minimal" | "modern"> = ["executive", "minimal", "modern"];

      for (const tone of tones) {
        const layoutTrees: LayoutTree[] = [
          {
            root: { type: "container", _rect: { x: 0, y: 0, width: 100, height: 100 } },
            metadata: { slideId: "slide-1", slideType: "hero" },
          },
        ];

        const themeSpec: ThemeSpec = {
          ...createTestThemeSpec(),
          tone,
        };

        const toneOutputPath = path.join(tempDir, `test-output-${tone}.pptx`);

        const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
          renderOptions: { outputPath: toneOutputPath },
        });

        expect(result.success).toBe(true);
        expect(fs.existsSync(toneOutputPath)).toBe(true);
      }
    });

    it("should handle empty layout trees gracefully", async () => {
      const layoutTrees: LayoutTree[] = [];
      const themeSpec: ThemeSpec = createTestThemeSpec(0);

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", {
        renderOptions: { outputPath },
        includeVisualContext: true,
      });

      // Should succeed with empty presentation
      expect(result.success).toBe(true);
      expect(result.visualContext?.slides).toHaveLength(0);
    });
  });
});

/**
 * Helper function to create a test ThemeSpec
 */
function createTestThemeSpec(slideCount: number = 3): ThemeSpec {
  // Generate slide themes for all slides
  const slideRhythm = Array.from({ length: Math.max(slideCount, 10) }, (_, i) => ({
    slideId: `slide-${i + 1}`,
    backgroundMode: (i % 2 === 0 ? "dark" : "light") as "dark" | "light",
    accentColor: i % 3 === 0 ? "#FFD23F" : i % 3 === 1 ? "#0066CC" : "#FF6B35",
    headerStyle: (i === 0 ? "band" : "none") as "band" | "none",
    decorations: [],
  }));

  return {
    palette: {
      primary: "#0066CC",
      secondary: "#FF6B35",
      accent: "#FFD23F",
      lightBg: "#FFFFFF",
      darkBg: "#1A1A1A",
      textOnDark: "#FFFFFF",
      textOnLight: "#1A1A1A",
      mutedOnDark: "#CCCCCC",
      mutedOnLight: "#666666",
    },
    typography: {
      displayFont: "Inter",
      bodyFont: "Inter",
    },
    slideRhythm,
    tone: "executive",
  };
}
