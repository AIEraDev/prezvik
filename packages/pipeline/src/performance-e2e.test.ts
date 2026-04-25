/**
 * End-to-End Performance Tests for Complete Pipeline
 *
 * Tests that the complete pipeline meets performance requirements:
 * - 10-slide presentation: < 5000ms
 * - Per-slide average: < 500ms
 * - Theme Layer: < 100ms per slide
 * - Visual Layer: < 500ms per slide
 * - Export Layer: < 1000ms per slide
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PipelineController } from "./pipeline-controller.js";
import { CacheManager } from "./cache-manager.js";
import { PerformanceMonitor } from "./performance-monitor.js";
import type { ThemeLayerFacade, VisualLayerFacade, ExportLayerFacade, LayoutTree, ThemeSpec } from "./pipeline-controller.js";

// Mock implementations for testing
class MockThemeLayerFacade implements ThemeLayerFacade {
  async generatePalette(themeSpec: ThemeSpec) {
    // Simulate theme layer work
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      version: "1.0" as const,
      primary: themeSpec.palette.primary,
      secondary: themeSpec.palette.secondary,
      accent: themeSpec.palette.accent,
      lightBg: themeSpec.palette.lightBg,
      darkBg: themeSpec.palette.darkBg,
      textOnDark: themeSpec.palette.textOnDark,
      textOnLight: themeSpec.palette.textOnLight,
      mutedOnDark: themeSpec.palette.mutedOnDark,
      mutedOnLight: themeSpec.palette.mutedOnLight,
      metadata: {
        colorSpace: "oklch" as const,
        generatedAt: new Date().toISOString(),
        themeSpecHash: "test-hash",
      },
    };
  }
}

class MockVisualLayerFacade implements VisualLayerFacade {
  async generateSlideVisuals(layoutTree: any, colorPalette: any, _slideTheme: any, _themeTone: any) {
    // Simulate visual layer work
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      slideId: layoutTree.metadata.slideId,
      type: layoutTree.metadata.slideType,
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
    };
  }
}

class MockExportLayerFacade implements ExportLayerFacade {
  getRenderer(_format: string) {
    return {
      validate: (_context: any) => ({ valid: true, errors: [], warnings: [] }),
      render: async (_context: any, options: any) => {
        // Simulate export layer work
        await new Promise((resolve) => setTimeout(resolve, 500));

        return {
          success: true,
          outputPath: options?.outputPath || "test-output.pptx",
        };
      },
      getSupportedFeatures: () => ({
        gradients: true,
        patterns: true,
        blendModes: true,
        customShapes: true,
      }),
    };
  }
}

describe("End-to-End Pipeline Performance Tests", () => {
  let pipeline: PipelineController;
  let cacheManager: CacheManager;
  let performanceMonitor: PerformanceMonitor;
  let mockThemeSpec: ThemeSpec;
  let mockLayoutTrees: LayoutTree[];

  beforeEach(() => {
    cacheManager = new CacheManager();
    performanceMonitor = new PerformanceMonitor();

    const themeLayer = new MockThemeLayerFacade();
    const visualLayer = new MockVisualLayerFacade();
    const exportLayer = new MockExportLayerFacade();

    pipeline = new PipelineController(themeLayer, visualLayer, exportLayer, cacheManager, performanceMonitor);

    mockThemeSpec = {
      palette: {
        primary: "#1a365d",
        secondary: "#2c7a7b",
        accent: "#3182ce",
        lightBg: "#f7fafc",
        darkBg: "#1a365d",
        textOnDark: "#ffffff",
        textOnLight: "#1a202c",
        mutedOnDark: "#cbd5e0",
        mutedOnLight: "#718096",
      },
      typography: {
        displayFont: "Montserrat",
        bodyFont: "Open Sans",
      },
      slideRhythm: [],
      tone: "executive",
    };

    mockLayoutTrees = [];
  });

  describe("Single Slide Performance", () => {
    beforeEach(() => {
      mockLayoutTrees = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 960, height: 540 },
            children: [
              {
                type: "text",
                _rect: { x: 50, y: 50, width: 860, height: 100 },
                text: "Test Title",
              },
            ],
          },
          metadata: {
            slideId: "slide-1",
            slideType: "hero",
          },
        },
      ];

      mockThemeSpec.slideRhythm = [
        {
          slideId: "slide-1",
          backgroundMode: "dark",
          accentColor: "#3182ce",
          headerStyle: "band",
          decorations: [],
        },
      ];
    });

    it("should complete single slide in < 1000ms", async () => {
      const startTime = performance.now();

      const result = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx", {
        renderOptions: { outputPath: "test-output/perf-single.pptx" },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1000);

      console.log(`[Performance] Single slide pipeline: ${duration.toFixed(2)}ms`);
      console.log(`  - Theme Layer: ${result.performance.phases.theme?.avgTime.toFixed(2)}ms`);
      console.log(`  - Visual Layer: ${result.performance.phases.visual?.avgTime.toFixed(2)}ms`);
      console.log(`  - Export Layer: ${result.performance.phases.export?.avgTime.toFixed(2)}ms`);
    });

    it("should meet per-layer performance targets", async () => {
      const result = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx");

      expect(result.success).toBe(true);

      // Theme Layer: < 100ms per slide
      expect(result.performance.phases.theme?.avgTime).toBeLessThan(100);

      // Visual Layer: < 500ms per slide
      expect(result.performance.phases.visual?.avgTime).toBeLessThan(500);

      // Export Layer: < 1000ms per slide
      expect(result.performance.phases.export?.avgTime).toBeLessThan(1000);

      console.log(`[Performance] Layer breakdown:`);
      console.log(`  - Theme: ${result.performance.phases.theme?.avgTime.toFixed(2)}ms (target: < 100ms)`);
      console.log(`  - Visual: ${result.performance.phases.visual?.avgTime.toFixed(2)}ms (target: < 500ms)`);
      console.log(`  - Export: ${result.performance.phases.export?.avgTime.toFixed(2)}ms (target: < 1000ms)`);
    });
  });

  describe("10-Slide Presentation Performance", () => {
    beforeEach(() => {
      mockLayoutTrees = [];
      mockThemeSpec.slideRhythm = [];

      for (let i = 0; i < 10; i++) {
        const slideType = i % 3 === 0 ? "hero" : i % 3 === 1 ? "section" : "content";

        mockLayoutTrees.push({
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 960, height: 540 },
            children: [
              {
                type: "text",
                _rect: { x: 50, y: 50, width: 860, height: 100 },
                text: `Slide ${i + 1} Title`,
              },
            ],
          },
          metadata: {
            slideId: `slide-${i}`,
            slideType,
          },
        });

        mockThemeSpec.slideRhythm.push({
          slideId: `slide-${i}`,
          backgroundMode: i % 2 === 0 ? "dark" : "light",
          accentColor: "#3182ce",
          headerStyle: "band",
          decorations: [],
        });
      }
    });

    it("should complete 10-slide presentation in < 5000ms", async () => {
      const startTime = performance.now();

      const result = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx", {
        renderOptions: { outputPath: "test-output/perf-10-slides.pptx" },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000);

      console.log(`[Performance] 10-slide presentation: ${duration.toFixed(2)}ms`);
      console.log(`  - Average per slide: ${(duration / 10).toFixed(2)}ms`);
      console.log(`  - Theme Layer total: ${result.performance.phases.theme?.totalTime.toFixed(2)}ms`);
      console.log(`  - Visual Layer total: ${result.performance.phases.visual?.totalTime.toFixed(2)}ms`);
      console.log(`  - Export Layer total: ${result.performance.phases.export?.totalTime.toFixed(2)}ms`);
    });

    it("should maintain per-slide average < 500ms", async () => {
      const result = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx");

      expect(result.success).toBe(true);

      const avgPerSlide = result.totalTime / 10;
      expect(avgPerSlide).toBeLessThan(500);

      console.log(`[Performance] Average per slide: ${avgPerSlide.toFixed(2)}ms (target: < 500ms)`);
    });

    it("should benefit from caching on second run", async () => {
      // First run
      const firstResult = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx", {
        renderOptions: { outputPath: "test-output/perf-first-run.pptx" },
      });

      expect(firstResult.success).toBe(true);
      const firstRunTime = firstResult.totalTime;

      // Second run with same theme spec (should use cache)
      const secondResult = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx", {
        renderOptions: { outputPath: "test-output/perf-second-run.pptx" },
      });

      expect(secondResult.success).toBe(true);
      const secondRunTime = secondResult.totalTime;

      // Second run should be faster or similar (cache hit)
      expect(secondRunTime).toBeLessThanOrEqual(firstRunTime * 1.1); // Allow 10% variance

      console.log(`[Performance] Caching benefit:`);
      console.log(`  - First run: ${firstRunTime.toFixed(2)}ms`);
      console.log(`  - Second run: ${secondRunTime.toFixed(2)}ms`);
      console.log(`  - Improvement: ${(((firstRunTime - secondRunTime) / firstRunTime) * 100).toFixed(1)}%`);
    });
  });

  describe("Large Presentation Performance", () => {
    beforeEach(() => {
      mockLayoutTrees = [];
      mockThemeSpec.slideRhythm = [];

      for (let i = 0; i < 20; i++) {
        const slideType = i % 3 === 0 ? "hero" : i % 3 === 1 ? "section" : "content";

        mockLayoutTrees.push({
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 960, height: 540 },
            children: [
              {
                type: "text",
                _rect: { x: 50, y: 50, width: 860, height: 100 },
                text: `Slide ${i + 1} Title`,
              },
            ],
          },
          metadata: {
            slideId: `slide-${i}`,
            slideType,
          },
        });

        mockThemeSpec.slideRhythm.push({
          slideId: `slide-${i}`,
          backgroundMode: i % 2 === 0 ? "dark" : "light",
          accentColor: "#3182ce",
          headerStyle: "band",
          decorations: [],
        });
      }
    });

    it("should complete 20-slide presentation in < 10000ms", async () => {
      const startTime = performance.now();

      const result = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx", {
        renderOptions: { outputPath: "test-output/perf-20-slides.pptx" },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(10000);

      console.log(`[Performance] 20-slide presentation: ${duration.toFixed(2)}ms`);
      console.log(`  - Average per slide: ${(duration / 20).toFixed(2)}ms`);
    });

    it("should scale linearly with slide count", async () => {
      // Test with 10 slides
      const layoutTrees10 = mockLayoutTrees.slice(0, 10);
      const themeSpec10 = {
        ...mockThemeSpec,
        slideRhythm: mockThemeSpec.slideRhythm.slice(0, 10),
      };

      const result10 = await pipeline.execute(layoutTrees10, themeSpec10, "pptx");
      const time10 = result10.totalTime;

      // Test with 20 slides
      const result20 = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx");
      const time20 = result20.totalTime;

      // 20 slides should take roughly 2x the time of 10 slides (allow 20% variance)
      const ratio = time20 / time10;
      expect(ratio).toBeGreaterThan(1.6); // At least 1.6x
      expect(ratio).toBeLessThan(2.4); // At most 2.4x

      console.log(`[Performance] Scaling:`);
      console.log(`  - 10 slides: ${time10.toFixed(2)}ms`);
      console.log(`  - 20 slides: ${time20.toFixed(2)}ms`);
      console.log(`  - Ratio: ${ratio.toFixed(2)}x`);
    });
  });

  describe("Performance Monitoring", () => {
    beforeEach(() => {
      mockLayoutTrees = [
        {
          root: {
            type: "container",
            _rect: { x: 0, y: 0, width: 960, height: 540 },
            children: [],
          },
          metadata: {
            slideId: "slide-1",
            slideType: "hero",
          },
        },
      ];

      mockThemeSpec.slideRhythm = [
        {
          slideId: "slide-1",
          backgroundMode: "dark",
          accentColor: "#3182ce",
          headerStyle: "band",
          decorations: [],
        },
      ];
    });

    it("should track phase metrics correctly", async () => {
      const result = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx");

      expect(result.success).toBe(true);
      expect(result.performance.phases.theme).toBeDefined();
      expect(result.performance.phases.visual).toBeDefined();
      expect(result.performance.phases.export).toBeDefined();

      // Each phase should have been executed once
      expect(result.performance.phases.theme?.count).toBe(1);
      expect(result.performance.phases.visual?.count).toBe(1);
      expect(result.performance.phases.export?.count).toBe(1);

      console.log(`[Performance] Phase metrics:`);
      console.log(`  - Theme: ${JSON.stringify(result.performance.phases.theme)}`);
      console.log(`  - Visual: ${JSON.stringify(result.performance.phases.visual)}`);
      console.log(`  - Export: ${JSON.stringify(result.performance.phases.export)}`);
    });

    it("should calculate min/max/avg correctly over multiple runs", async () => {
      const results = [];

      for (let i = 0; i < 5; i++) {
        const result = await pipeline.execute(mockLayoutTrees, mockThemeSpec, "pptx");
        results.push(result);
      }

      const lastResult = results[results.length - 1];

      // After 5 runs, count should be 5
      expect(lastResult.performance.phases.theme?.count).toBe(5);

      // Min should be <= avg <= max
      const themeMetrics = lastResult.performance.phases.theme!;
      expect(themeMetrics.minTime).toBeLessThanOrEqual(themeMetrics.avgTime);
      expect(themeMetrics.avgTime).toBeLessThanOrEqual(themeMetrics.maxTime);

      console.log(`[Performance] Metrics over 5 runs:`);
      console.log(`  - Theme: min=${themeMetrics.minTime.toFixed(2)}ms, avg=${themeMetrics.avgTime.toFixed(2)}ms, max=${themeMetrics.maxTime.toFixed(2)}ms`);
    });
  });
});
