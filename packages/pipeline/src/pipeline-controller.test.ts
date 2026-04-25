/**
 * Pipeline Controller Tests
 *
 * Tests for dual-mode switching, error handling, and performance monitoring
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { PipelineController } from "./pipeline-controller";
import type { ThemeLayerFacade, VisualLayerFacade, ExportLayerFacade, CacheManager, PerformanceMonitor, LayoutTree, ThemeSpec } from "./pipeline-controller";
import type { ColorPalette } from "@kyro/theme-layer";
import type { SlideVisualContext } from "@kyro/visual-layer";
import type { RenderResult, ValidationResult } from "@kyro/export-layer";

describe("PipelineController", () => {
  let mockThemeLayer: ThemeLayerFacade;
  let mockVisualLayer: VisualLayerFacade;
  let mockExportLayer: ExportLayerFacade;
  let mockCacheManager: CacheManager;
  let mockPerformanceMonitor: PerformanceMonitor;
  let controller: PipelineController;

  beforeEach(() => {
    // Mock Theme Layer
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

    // Mock Visual Layer
    mockVisualLayer = {
      generateSlideVisuals: vi.fn().mockResolvedValue({
        slideId: "slide-1",
        type: "hero",
        dimensions: { width: 1920, height: 1080 },
        background: {
          id: "bg-1",
          kind: "background",
          zIndex: 0,
          opacity: 1,
          fill: { type: "solid", color: "#FFFFFF" },
          dimensions: { width: 1920, height: 1080 },
        },
        decorations: [],
        content: [],
      } as SlideVisualContext),
    };

    // Mock Export Layer
    const mockRenderer = {
      render: vi.fn().mockResolvedValue({
        success: true,
        outputPath: "/tmp/test.pptx",
      } as RenderResult),
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

    // Mock Cache Manager
    mockCacheManager = {
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      hashThemeSpec: vi.fn().mockReturnValue("theme-hash"),
      hashLayoutTrees: vi.fn().mockReturnValue("layout-hash"),
    };

    // Mock Performance Monitor
    const phases: Record<string, any> = {};
    mockPerformanceMonitor = {
      startPhase: vi.fn((phase: string) => {
        phases[phase] = { start: Date.now() };
      }),
      endPhase: vi.fn((phase: string) => {
        if (phases[phase]) {
          phases[phase].end = Date.now();
        }
      }),
      getCurrentPhase: vi.fn().mockReturnValue("theme"),
      getReport: vi.fn().mockReturnValue({
        phases: {
          theme: { count: 1, totalTime: 50, avgTime: 50, maxTime: 50, minTime: 50 },
          visual: { count: 1, totalTime: 200, avgTime: 200, maxTime: 200, minTime: 200 },
          export: { count: 1, totalTime: 500, avgTime: 500, maxTime: 500, minTime: 500 },
        },
      }),
      reset: vi.fn(),
    };

    controller = new PipelineController(mockThemeLayer, mockVisualLayer, mockExportLayer, mockCacheManager, mockPerformanceMonitor);
  });

  describe("Dual-mode switching", () => {
    it("should execute in legacy mode when mode is 'legacy'", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", { mode: "legacy" });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe("/tmp/test.pptx");
    });

    it("should execute in layered mode when mode is 'layered'", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      const result = await controller.execute(layoutTrees, themeSpec, "pptx", { mode: "layered" });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe("/tmp/test.pptx");
    });

    it("should default to legacy mode when mode is not specified", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      const result = await controller.execute(layoutTrees, themeSpec, "pptx");

      expect(result.success).toBe(true);
    });
  });

  describe("Error handling", () => {
    it("should handle theme layer errors with fallback palette", async () => {
      mockThemeLayer.generatePalette = vi.fn().mockRejectedValue(new Error("Theme generation failed"));

      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      const result = await controller.execute(layoutTrees, themeSpec, "pptx");

      // Should succeed with fallback palette
      expect(result.success).toBe(true);
      expect(result.outputPath).toBe("/tmp/test.pptx");
    });

    it("should handle visual layer errors with fallback visuals", async () => {
      mockVisualLayer.generateSlideVisuals = vi.fn().mockRejectedValue(new Error("Visual generation failed"));

      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      const result = await controller.execute(layoutTrees, themeSpec, "pptx");

      // Should succeed with fallback minimal visuals
      expect(result.success).toBe(true);
      expect(result.outputPath).toBe("/tmp/test.pptx");
    });

    it("should handle export layer errors with fallback renderer", async () => {
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

      // Update performance monitor to return correct phase
      mockPerformanceMonitor.getCurrentPhase = vi.fn().mockReturnValue("export");

      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      const result = await controller.execute(layoutTrees, themeSpec, "pptx");

      // Should fail since export layer error handling tries fallbacks but they also fail
      expect(result.success).toBe(false);
      expect(result.error?.phase).toBe("export");
    });
  });

  describe("Performance monitoring", () => {
    it("should track execution time for each phase", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      const result = await controller.execute(layoutTrees, themeSpec, "pptx");

      expect(result.success).toBe(true);
      expect(mockPerformanceMonitor.startPhase).toHaveBeenCalledWith("theme");
      expect(mockPerformanceMonitor.endPhase).toHaveBeenCalledWith("theme");
      expect(mockPerformanceMonitor.startPhase).toHaveBeenCalledWith("visual");
      expect(mockPerformanceMonitor.endPhase).toHaveBeenCalledWith("visual");
      expect(mockPerformanceMonitor.startPhase).toHaveBeenCalledWith("export");
      expect(mockPerformanceMonitor.endPhase).toHaveBeenCalledWith("export");
      expect(result.performance).toBeDefined();
    });
  });

  describe("Caching", () => {
    it("should check cache before generating palette", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      await controller.execute(layoutTrees, themeSpec, "pptx");

      // Verify cache was checked
      expect(mockCacheManager.hashThemeSpec).toHaveBeenCalledWith(themeSpec);
      expect(mockCacheManager.get).toHaveBeenCalledWith("palette", "theme-hash");
    });

    it("should store generated palette in cache", async () => {
      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      await controller.execute(layoutTrees, themeSpec, "pptx");

      // Verify palette was stored in cache
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        "palette",
        "theme-hash",
        expect.objectContaining({
          version: "1.0",
          primary: "#0066CC",
        }),
      );
    });

    it("should use cached palette when available", async () => {
      const cachedPalette: ColorPalette = {
        version: "1.0",
        primary: "#CACHED",
        secondary: "#CACHED",
        accent: "#CACHED",
        lightBg: "#CACHED",
        darkBg: "#CACHED",
        textOnDark: "#CACHED",
        textOnLight: "#CACHED",
        mutedOnDark: "#CACHED",
        mutedOnLight: "#CACHED",
        metadata: {
          colorSpace: "oklch",
          generatedAt: new Date().toISOString(),
          themeSpecHash: "cached-hash",
        },
      };

      // Mock cache to return cached palette
      mockCacheManager.get = vi.fn().mockReturnValue(cachedPalette);

      const layoutTrees: LayoutTree[] = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 100, height: 100 },
          },
          metadata: { slideId: "slide-1", slideType: "hero" },
        },
      ];

      const themeSpec: ThemeSpec = {
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
        slideRhythm: [
          {
            slideId: "slide-1",
            backgroundMode: "dark",
            accentColor: "#FFD23F",
            headerStyle: "band",
            decorations: [],
          },
        ],
        tone: "executive",
      };

      await controller.execute(layoutTrees, themeSpec, "pptx");

      // Verify theme layer was NOT called (used cache instead)
      expect(mockThemeLayer.generatePalette).not.toHaveBeenCalled();
    });
  });
});
