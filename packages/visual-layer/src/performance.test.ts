/**
 * Performance Tests for Visual Layer
 *
 * Tests that Visual Layer operations meet performance requirements:
 * - Visual generation: < 500ms per slide
 * - Background generation: < 50ms per slide
 * - Shape generation: < 100ms per slide
 * - Visual Context building: < 50ms per slide
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ThemeEngine } from "./theme-engine.js";
import { BackgroundGenerator } from "./background-generator.js";
import { ShapeGenerator } from "./shape-generator.js";
import { FillEngine } from "./fill-engine.js";
import { VisualContextBuilder } from "./visual-context-builder.js";
import type { ColorPalette } from "@prezvik/theme-layer";
import type { LayoutNode, LayoutTree } from "./models/layout-tree.js";

describe("Visual Layer Performance Tests", () => {
  let themeEngine: ThemeEngine;
  let backgroundGenerator: BackgroundGenerator;
  let shapeGenerator: ShapeGenerator;
  let fillEngine: FillEngine;
  let visualContextBuilder: VisualContextBuilder;
  let mockColorPalette: ColorPalette;
  let mockLayoutTree: LayoutTree;

  beforeEach(() => {
    backgroundGenerator = new BackgroundGenerator();
    shapeGenerator = new ShapeGenerator();
    fillEngine = new FillEngine();
    themeEngine = new ThemeEngine(backgroundGenerator, shapeGenerator, fillEngine);
    visualContextBuilder = new VisualContextBuilder();

    mockColorPalette = {
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

    mockLayoutTree = {
      root: {
        type: "container",
        _rect: { x: 0, y: 0, width: 960, height: 540 },
        children: [
          {
            type: "text",
            _rect: { x: 50, y: 50, width: 860, height: 100 },
            text: "Test Title",
            style: {
              fontSize: 48,
              fontFamily: "Montserrat",
              textColor: "#1a202c",
            },
          },
          {
            type: "text",
            _rect: { x: 50, y: 200, width: 860, height: 300 },
            text: "Test content",
            style: {
              fontSize: 24,
              fontFamily: "Open Sans",
              textColor: "#1a202c",
            },
          },
        ],
      },
      metadata: {
        slideId: "slide-1",
        slideType: "hero",
      },
    };
  });

  describe("Background Generation Performance", () => {
    it("should generate hero background in < 50ms", () => {
      const dimensions = { width: 960, height: 540 };

      const startTime = performance.now();

      const background = backgroundGenerator.generateBackground("hero", mockColorPalette, dimensions);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(background).toBeDefined();
      expect(background.kind).toBe("background");
      expect(duration).toBeLessThan(50);

      console.log(`[Performance] Hero background: ${duration.toFixed(2)}ms`);
    });

    it("should generate section background in < 50ms", () => {
      const dimensions = { width: 960, height: 540 };

      const startTime = performance.now();

      const background = backgroundGenerator.generateBackground("section", mockColorPalette, dimensions);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(background).toBeDefined();
      expect(duration).toBeLessThan(50);

      console.log(`[Performance] Section background: ${duration.toFixed(2)}ms`);
    });

    it("should generate content background in < 50ms", () => {
      const dimensions = { width: 960, height: 540 };

      const startTime = performance.now();

      const background = backgroundGenerator.generateBackground("content", mockColorPalette, dimensions);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(background).toBeDefined();
      expect(duration).toBeLessThan(50);

      console.log(`[Performance] Content background: ${duration.toFixed(2)}ms`);
    });

    it("should handle 10 background generations in < 500ms", () => {
      const dimensions = { width: 960, height: 540 };

      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        backgroundGenerator.generateBackground("hero", mockColorPalette, dimensions);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);

      console.log(`[Performance] 10 backgrounds: ${duration.toFixed(2)}ms (avg: ${(duration / 10).toFixed(2)}ms)`);
    });
  });

  describe("Shape Generation Performance", () => {
    it("should generate shapes for executive tone in < 100ms", () => {
      const contentBounds = [
        { x: 50, y: 50, width: 860, height: 100 },
        { x: 50, y: 200, width: 860, height: 300 },
      ];

      const startTime = performance.now();

      const shapes = shapeGenerator.generateShapes("hero", mockColorPalette, contentBounds, "executive");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(shapes).toBeDefined();
      expect(Array.isArray(shapes)).toBe(true);
      expect(duration).toBeLessThan(100);

      console.log(`[Performance] Executive shapes: ${duration.toFixed(2)}ms (${shapes.length} shapes)`);
    });

    it("should generate shapes for minimal tone in < 100ms", () => {
      const contentBounds = [{ x: 50, y: 50, width: 860, height: 100 }];

      const startTime = performance.now();

      const shapes = shapeGenerator.generateShapes("section", mockColorPalette, contentBounds, "minimal");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(shapes).toBeDefined();
      expect(duration).toBeLessThan(100);

      console.log(`[Performance] Minimal shapes: ${duration.toFixed(2)}ms (${shapes.length} shapes)`);
    });

    it("should generate shapes for modern tone in < 100ms", () => {
      const contentBounds = [{ x: 50, y: 50, width: 860, height: 100 }];

      const startTime = performance.now();

      const shapes = shapeGenerator.generateShapes("hero", mockColorPalette, contentBounds, "modern");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(shapes).toBeDefined();
      expect(duration).toBeLessThan(100);

      console.log(`[Performance] Modern shapes: ${duration.toFixed(2)}ms (${shapes.length} shapes)`);
    });

    it("should handle collision detection efficiently", () => {
      // Create many content bounds to test collision detection
      const contentBounds = [];
      for (let i = 0; i < 20; i++) {
        contentBounds.push({
          x: (i % 5) * 200,
          y: Math.floor(i / 5) * 150,
          width: 180,
          height: 130,
        });
      }

      const startTime = performance.now();

      const shapes = shapeGenerator.generateShapes("hero", mockColorPalette, contentBounds, "executive");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(shapes).toBeDefined();
      expect(duration).toBeLessThan(200);

      console.log(`[Performance] Collision detection (20 bounds): ${duration.toFixed(2)}ms`);
    });
  });

  describe("Theme Engine Performance", () => {
    it("should generate visuals for hero slide in < 200ms", () => {
      const startTime = performance.now();

      const visuals = themeEngine.generateVisuals(mockLayoutTree.root, mockColorPalette, "hero", "executive");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(visuals).toBeDefined();
      expect(Array.isArray(visuals)).toBe(true);
      expect(duration).toBeLessThan(200);

      console.log(`[Performance] Hero slide visuals: ${duration.toFixed(2)}ms (${visuals.length} elements)`);
    });

    it("should generate visuals for section slide in < 200ms", () => {
      const startTime = performance.now();

      const visuals = themeEngine.generateVisuals(mockLayoutTree.root, mockColorPalette, "section", "minimal");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(visuals).toBeDefined();
      expect(duration).toBeLessThan(200);

      console.log(`[Performance] Section slide visuals: ${duration.toFixed(2)}ms`);
    });

    it("should generate visuals for content slide in < 200ms", () => {
      const startTime = performance.now();

      const visuals = themeEngine.generateVisuals(mockLayoutTree.root, mockColorPalette, "content", "modern");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(visuals).toBeDefined();
      expect(duration).toBeLessThan(200);

      console.log(`[Performance] Content slide visuals: ${duration.toFixed(2)}ms`);
    });
  });

  describe("Visual Context Building Performance", () => {
    it("should build visual context for single slide in < 50ms", () => {
      const visuals = themeEngine.generateVisuals(mockLayoutTree.root, mockColorPalette, "hero", "executive");

      const startTime = performance.now();

      const context = visualContextBuilder.build([mockLayoutTree], [visuals], mockColorPalette);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(context).toBeDefined();
      expect(context.version).toBe("1.0");
      expect(context.slides).toHaveLength(1);
      expect(duration).toBeLessThan(50);

      console.log(`[Performance] Visual context (1 slide): ${duration.toFixed(2)}ms`);
    });

    it("should build visual context for 10 slides in < 500ms", () => {
      const layoutTrees: LayoutTree[] = [];
      const visualElements: any[][] = [];

      for (let i = 0; i < 10; i++) {
        const tree = {
          ...mockLayoutTree,
          metadata: {
            slideId: `slide-${i}`,
            slideType: i % 3 === 0 ? "hero" : i % 3 === 1 ? "section" : "content",
          },
        };
        layoutTrees.push(tree);

        const visuals = themeEngine.generateVisuals(tree.root, mockColorPalette, tree.metadata.slideType as any, "executive");
        visualElements.push(visuals);
      }

      const startTime = performance.now();

      const context = visualContextBuilder.build(layoutTrees, visualElements, mockColorPalette);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(context).toBeDefined();
      expect(context.slides).toHaveLength(10);
      expect(duration).toBeLessThan(500);

      console.log(`[Performance] Visual context (10 slides): ${duration.toFixed(2)}ms (avg: ${(duration / 10).toFixed(2)}ms per slide)`);
    });
  });

  describe("End-to-End Visual Layer Performance", () => {
    it("should complete all visual operations for a slide in < 500ms", () => {
      const startTime = performance.now();

      // Generate visuals
      const visuals = themeEngine.generateVisuals(mockLayoutTree.root, mockColorPalette, "hero", "executive");

      // Build context
      const context = visualContextBuilder.build([mockLayoutTree], [visuals], mockColorPalette);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(visuals).toBeDefined();
      expect(context).toBeDefined();
      expect(duration).toBeLessThan(500);

      console.log(`[Performance] Complete visual operations: ${duration.toFixed(2)}ms`);
    });

    it("should handle 10 slides in < 5000ms", () => {
      const layoutTrees: LayoutTree[] = [];
      const visualElements: any[][] = [];

      for (let i = 0; i < 10; i++) {
        const tree = {
          ...mockLayoutTree,
          metadata: {
            slideId: `slide-${i}`,
            slideType: i % 3 === 0 ? "hero" : i % 3 === 1 ? "section" : "content",
          },
        };
        layoutTrees.push(tree);
      }

      const startTime = performance.now();

      for (const tree of layoutTrees) {
        const visuals = themeEngine.generateVisuals(tree.root, mockColorPalette, tree.metadata.slideType as any, "executive");
        visualElements.push(visuals);
      }

      const context = visualContextBuilder.build(layoutTrees, visualElements, mockColorPalette);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(context).toBeDefined();
      expect(context.slides).toHaveLength(10);
      expect(duration).toBeLessThan(5000);

      console.log(`[Performance] 10 slides end-to-end: ${duration.toFixed(2)}ms (avg: ${(duration / 10).toFixed(2)}ms per slide)`);
    });
  });
});
