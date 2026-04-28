/**
 * Performance Tests for Export Layer
 *
 * Tests that Export Layer operations meet performance requirements:
 * - PPTX rendering: < 1000ms per slide
 * - Web rendering: < 500ms per slide
 * - Gradient conversion: < 10ms per gradient
 * - Shape conversion: < 10ms per shape
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PPTXRenderer } from "./pptx-renderer.js";
import { WebRenderer } from "./web-renderer.js";
import type { VisualContext, SlideVisualContext } from "@prezvik/visual-layer";
import type { ColorPalette } from "@prezvik/theme-layer";

describe("Export Layer Performance Tests", () => {
  let pptxRenderer: PPTXRenderer;
  let webRenderer: WebRenderer;
  let mockVisualContext: VisualContext;

  beforeEach(() => {
    pptxRenderer = new PPTXRenderer();
    webRenderer = new WebRenderer("reveal");

    const mockColorPalette: ColorPalette = {
      version: "1.0",
      primary: "#1a365d",
      secondary: "#2c7a7b",
      accent: "#3182ce",
      lightBg: "#f7fafc",
      darkBg: "#1a365d",
      textOnDark: "#ffffff",
      textOnLight: "#1a202c",
      mutedOnDark: "#cbd5e0",
      mutedOnLight: "#718096",
      metadata: {
        colorSpace: "oklch",
        generatedAt: new Date().toISOString(),
        themeSpecHash: "test-hash",
      },
    };

    const mockSlide: SlideVisualContext = {
      slideId: "slide-1",
      type: "hero",
      dimensions: { width: 960, height: 540 },
      background: {
        id: "bg-1",
        kind: "background",
        zIndex: 0,
        opacity: 1,
        fill: {
          type: "gradient",
          gradient: {
            type: "linear",
            angle: 45,
            stops: [
              { position: 0, color: "#1a365d" },
              { position: 1, color: "#2c7a7b" },
            ],
          },
        },
        dimensions: { width: 960, height: 540 },
      },
      decorations: [
        {
          id: "shape-1",
          kind: "shape",
          shapeType: "rectangle",
          zIndex: 1,
          opacity: 0.3,
          bounds: { x: 700, y: 50, width: 200, height: 200 },
          fill: {
            type: "solid",
            color: "#3182ce",
          },
        },
        {
          id: "shape-2",
          kind: "shape",
          shapeType: "circle",
          zIndex: 1,
          opacity: 0.2,
          bounds: { x: 50, y: 400, width: 100, height: 100 },
          fill: {
            type: "solid",
            color: "#2c7a7b",
          },
          properties: {
            radius: 50,
          },
        },
      ],
      content: [
        {
          id: "text-1",
          kind: "text",
          zIndex: 10,
          opacity: 1,
          bounds: { x: 50, y: 50, width: 860, height: 100 },
          content: {
            text: "Test Title",
            font: "Montserrat",
            fontSize: 48,
            color: "#1a202c",
            align: "left",
            verticalAlign: "top",
            bold: true,
          },
        },
      ],
    };

    mockVisualContext = {
      version: "1.0",
      slides: [mockSlide],
      colorPalette: mockColorPalette,
      theme: {
        tone: "executive",
        typography: {
          displayFont: "Montserrat",
          bodyFont: "Open Sans",
        },
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        layoutTreeHash: "test-layout-hash",
        themeSpecHash: "test-theme-hash",
      },
    };
  });

  describe("PPTX Renderer Performance", () => {
    it("should validate visual context in < 50ms", () => {
      const startTime = performance.now();

      const validation = pptxRenderer.validate(mockVisualContext);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(validation.valid).toBe(true);
      expect(duration).toBeLessThan(50);

      console.log(`[Performance] PPTX validation: ${duration.toFixed(2)}ms`);
    });

    it("should render single slide in < 1000ms", async () => {
      const startTime = performance.now();

      const result = await pptxRenderer.render(mockVisualContext, {
        outputPath: "test-output/perf-test-single.pptx",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1000);

      console.log(`[Performance] PPTX single slide: ${duration.toFixed(2)}ms`);
    });

    it("should render 10 slides in < 10000ms", async () => {
      // Create context with 10 slides
      const slides: SlideVisualContext[] = [];
      for (let i = 0; i < 10; i++) {
        slides.push({
          ...mockVisualContext.slides[0],
          slideId: `slide-${i}`,
        });
      }

      const context: VisualContext = {
        ...mockVisualContext,
        slides,
      };

      const startTime = performance.now();

      const result = await pptxRenderer.render(context, {
        outputPath: "test-output/perf-test-10-slides.pptx",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(10000);

      console.log(`[Performance] PPTX 10 slides: ${duration.toFixed(2)}ms (avg: ${(duration / 10).toFixed(2)}ms per slide)`);
    });

    it("should handle complex slide with many shapes in < 1500ms", async () => {
      // Create slide with many decorations
      const decorations = [];
      for (let i = 0; i < 20; i++) {
        decorations.push({
          id: `shape-${i}`,
          kind: "shape" as const,
          shapeType: i % 2 === 0 ? ("rectangle" as const) : ("circle" as const),
          zIndex: 1,
          opacity: 0.2,
          bounds: {
            x: (i % 5) * 200,
            y: Math.floor(i / 5) * 150,
            width: 100,
            height: 100,
          },
          fill: {
            type: "solid" as const,
            color: "#3182ce",
          },
        });
      }

      const complexSlide: SlideVisualContext = {
        ...mockVisualContext.slides[0],
        decorations,
      };

      const context: VisualContext = {
        ...mockVisualContext,
        slides: [complexSlide],
      };

      const startTime = performance.now();

      const result = await pptxRenderer.render(context, {
        outputPath: "test-output/perf-test-complex.pptx",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1500);

      console.log(`[Performance] PPTX complex slide (20 shapes): ${duration.toFixed(2)}ms`);
    });
  });

  describe("Web Renderer Performance", () => {
    it("should validate visual context in < 50ms", () => {
      const startTime = performance.now();

      const validation = webRenderer.validate(mockVisualContext);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(validation.valid).toBe(true);
      expect(duration).toBeLessThan(50);

      console.log(`[Performance] Web validation: ${duration.toFixed(2)}ms`);
    });

    it("should render single slide in < 500ms", async () => {
      const startTime = performance.now();

      const result = await webRenderer.render(mockVisualContext, {
        outputPath: "test-output/perf-test-single.html",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(500);

      console.log(`[Performance] Web single slide: ${duration.toFixed(2)}ms`);
    });

    it("should render 10 slides in < 5000ms", async () => {
      // Create context with 10 slides
      const slides: SlideVisualContext[] = [];
      for (let i = 0; i < 10; i++) {
        slides.push({
          ...mockVisualContext.slides[0],
          slideId: `slide-${i}`,
        });
      }

      const context: VisualContext = {
        ...mockVisualContext,
        slides,
      };

      const startTime = performance.now();

      const result = await webRenderer.render(context, {
        outputPath: "test-output/perf-test-10-slides.html",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000);

      console.log(`[Performance] Web 10 slides: ${duration.toFixed(2)}ms (avg: ${(duration / 10).toFixed(2)}ms per slide)`);
    });

    it("should handle complex slide with many shapes in < 1000ms", async () => {
      // Create slide with many decorations
      const decorations = [];
      for (let i = 0; i < 20; i++) {
        decorations.push({
          id: `shape-${i}`,
          kind: "shape" as const,
          shapeType: i % 2 === 0 ? ("rectangle" as const) : ("circle" as const),
          zIndex: 1,
          opacity: 0.2,
          bounds: {
            x: (i % 5) * 200,
            y: Math.floor(i / 5) * 150,
            width: 100,
            height: 100,
          },
          fill: {
            type: "solid" as const,
            color: "#3182ce",
          },
        });
      }

      const complexSlide: SlideVisualContext = {
        ...mockVisualContext.slides[0],
        decorations,
      };

      const context: VisualContext = {
        ...mockVisualContext,
        slides: [complexSlide],
      };

      const startTime = performance.now();

      const result = await webRenderer.render(context, {
        outputPath: "test-output/perf-test-complex.html",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1000);

      console.log(`[Performance] Web complex slide (20 shapes): ${duration.toFixed(2)}ms`);
    });
  });

  describe("Gradient Conversion Performance", () => {
    it("should convert linear gradient in < 10ms", () => {
      const gradient = {
        type: "linear" as const,
        angle: 45,
        stops: [
          { position: 0, color: "#ff0000" },
          { position: 1, color: "#0000ff" },
        ],
      };

      const startTime = performance.now();

      // Access private method through type assertion for testing
      const renderer = pptxRenderer as any;
      const converted = renderer.convertGradient(gradient);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(converted).toBeDefined();
      expect(duration).toBeLessThan(10);

      console.log(`[Performance] Gradient conversion: ${duration.toFixed(2)}ms`);
    });

    it("should convert 100 gradients in < 1000ms", () => {
      const gradient = {
        type: "linear" as const,
        angle: 45,
        stops: [
          { position: 0, color: "#ff0000" },
          { position: 1, color: "#0000ff" },
        ],
      };

      const startTime = performance.now();

      const renderer = pptxRenderer as any;
      for (let i = 0; i < 100; i++) {
        renderer.convertGradient(gradient);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);

      console.log(`[Performance] 100 gradient conversions: ${duration.toFixed(2)}ms (avg: ${(duration / 100).toFixed(2)}ms)`);
    });
  });

  describe("Overall Export Performance", () => {
    it("should complete full export cycle in < 1500ms", async () => {
      const startTime = performance.now();

      // Validate
      const validation = pptxRenderer.validate(mockVisualContext);
      expect(validation.valid).toBe(true);

      // Render
      const result = await pptxRenderer.render(mockVisualContext, {
        outputPath: "test-output/perf-full-cycle.pptx",
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1500);

      console.log(`[Performance] Full export cycle: ${duration.toFixed(2)}ms`);
    });
  });
});
