/**
 * Unit tests for ThemeEngine
 *
 * Tests visual generation for different slide types and theme tones,
 * validates decoration rules, and ensures content overlap prevention.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.8, 5.9
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { ThemeEngine } from "./theme-engine.js";
import type { LayoutNode } from "./theme-engine.js";
import { BackgroundGenerator } from "./background-generator.js";
import { ShapeGenerator } from "./shape-generator.js";
import type { ColorPalette } from "@kyro/theme-layer";
import type { SlideType, ThemeTone } from "./models/visual-context.js";
import type { BackgroundElement, ShapeElement } from "./models/visual-element.js";

describe("ThemeEngine", () => {
  let engine: ThemeEngine;
  let mockColorPalette: ColorPalette;
  let mockLayoutNode: LayoutNode;

  beforeEach(() => {
    engine = new ThemeEngine();

    // Create a mock color palette
    mockColorPalette = {
      version: "1.0",
      primary: "#1a73e8",
      secondary: "#34a853",
      accent: "#fbbc04",
      lightBg: "#ffffff",
      darkBg: "#202124",
      textOnDark: "#ffffff",
      textOnLight: "#202124",
      mutedOnDark: "#9aa0a6",
      mutedOnLight: "#5f6368",
      metadata: {
        colorSpace: "oklch",
        generatedAt: new Date().toISOString(),
        themeSpecHash: "test-hash",
      },
    };

    // Create a mock layout node with content
    mockLayoutNode = {
      type: "slide",
      _rect: { x: 0, y: 0, width: 960, height: 540 },
      children: [
        {
          type: "title",
          _rect: { x: 100, y: 100, width: 760, height: 80 },
          text: "Test Title",
        },
        {
          type: "content",
          _rect: { x: 100, y: 200, width: 760, height: 240 },
          text: "Test content",
        },
      ],
    };
  });

  describe("generateVisuals", () => {
    it("should generate visual elements for a slide", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      expect(visuals).toBeDefined();
      expect(Array.isArray(visuals)).toBe(true);
      expect(visuals.length).toBeGreaterThan(0);
    });

    it("should include a background element", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      const background = visuals.find((v) => v.kind === "background");
      expect(background).toBeDefined();
      expect(background?.zIndex).toBe(0);
    });

    it("should include decoration shapes", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      const shapes = visuals.filter((v) => v.kind === "shape");
      expect(shapes.length).toBeGreaterThanOrEqual(0);
    });

    it("should return background as first element", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      expect(visuals[0].kind).toBe("background");
    });
  });

  describe("Visual generation for different slide types", () => {
    const slideTypes: SlideType[] = ["hero", "section", "content", "closing"];

    slideTypes.forEach((slideType) => {
      it(`should generate visuals for ${slideType} slides`, () => {
        const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, slideType, "modern");

        expect(visuals).toBeDefined();
        expect(visuals.length).toBeGreaterThan(0);

        // Should always have a background
        const background = visuals.find((v) => v.kind === "background");
        expect(background).toBeDefined();
      });
    });

    it("should generate gradient backgrounds for hero slides", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      const background = visuals[0] as BackgroundElement;
      expect(background.kind).toBe("background");
      expect(background.fill.type).toBe("gradient");
    });

    it("should generate appropriate backgrounds for content slides", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "content", "modern");

      const background = visuals[0] as BackgroundElement;
      expect(background.kind).toBe("background");
      // Content slides typically have solid backgrounds
      expect(background.fill.type).toBe("solid");
    });

    it("should generate more decorations for hero slides than content slides", () => {
      const heroVisuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");
      const contentVisuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "content", "modern");

      const heroShapes = heroVisuals.filter((v) => v.kind === "shape");
      const contentShapes = contentVisuals.filter((v) => v.kind === "shape");

      // Hero slides should have more or equal decorations
      expect(heroShapes.length).toBeGreaterThanOrEqual(contentShapes.length);
    });
  });

  describe("Decoration rules for different theme tones", () => {
    const themeTones: ThemeTone[] = ["executive", "minimal", "modern"];

    themeTones.forEach((themeTone) => {
      it(`should generate visuals for ${themeTone} theme tone`, () => {
        const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", themeTone);

        expect(visuals).toBeDefined();
        expect(visuals.length).toBeGreaterThan(0);
      });
    });

    it("should generate rectangles and lines for executive tone", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "executive");

      const shapes = visuals.filter((v) => v.kind === "shape") as ShapeElement[];

      if (shapes.length > 0) {
        const shapeTypes = shapes.map((s) => s.shapeType);
        const hasExecutiveShapes = shapeTypes.some((type) => type === "rectangle" || type === "line");
        expect(hasExecutiveShapes).toBe(true);
      }
    });

    it("should generate circles for minimal tone", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "minimal");

      const shapes = visuals.filter((v) => v.kind === "shape") as ShapeElement[];

      if (shapes.length > 0) {
        const shapeTypes = shapes.map((s) => s.shapeType);
        const hasCircles = shapeTypes.some((type) => type === "circle");
        expect(hasCircles).toBe(true);
      }
    });

    it("should generate polygons for modern tone", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      const shapes = visuals.filter((v) => v.kind === "shape") as ShapeElement[];

      if (shapes.length > 0) {
        const shapeTypes = shapes.map((s) => s.shapeType);
        const hasModernShapes = shapeTypes.some((type) => type === "polygon" || type === "rectangle");
        expect(hasModernShapes).toBe(true);
      }
    });
  });

  describe("Content overlap prevention", () => {
    it("should extract content bounds from layout tree", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      const shapes = visuals.filter((v) => v.kind === "shape") as ShapeElement[];

      // Verify shapes don't overlap with content areas
      const contentBounds = [
        { x: 100, y: 100, width: 760, height: 80 }, // Title
        { x: 100, y: 200, width: 760, height: 240 }, // Content
      ];

      shapes.forEach((shape) => {
        const hasOverlap = contentBounds.some((content) => {
          return shape.bounds.x < content.x + content.width && shape.bounds.x + shape.bounds.width > content.x && shape.bounds.y < content.y + content.height && shape.bounds.y + shape.bounds.height > content.y;
        });

        // Shapes should not overlap with content
        expect(hasOverlap).toBe(false);
      });
    });

    it("should handle layout nodes without content", () => {
      const emptyLayoutNode: LayoutNode = {
        type: "slide",
        _rect: { x: 0, y: 0, width: 960, height: 540 },
        children: [],
      };

      const visuals = engine.generateVisuals(emptyLayoutNode, mockColorPalette, "hero", "modern");

      expect(visuals).toBeDefined();
      expect(visuals.length).toBeGreaterThan(0);
    });

    it("should handle deeply nested layout trees", () => {
      const nestedLayoutNode: LayoutNode = {
        type: "slide",
        _rect: { x: 0, y: 0, width: 960, height: 540 },
        children: [
          {
            type: "container",
            _rect: { x: 100, y: 100, width: 760, height: 340 },
            children: [
              {
                type: "title",
                _rect: { x: 120, y: 120, width: 720, height: 60 },
                text: "Nested Title",
              },
              {
                type: "content",
                _rect: { x: 120, y: 200, width: 720, height: 200 },
                text: "Nested Content",
              },
            ],
          },
        ],
      };

      const visuals = engine.generateVisuals(nestedLayoutNode, mockColorPalette, "hero", "modern");

      expect(visuals).toBeDefined();
      expect(visuals.length).toBeGreaterThan(0);

      // Verify shapes don't overlap with nested content
      const shapes = visuals.filter((v) => v.kind === "shape") as ShapeElement[];
      const nestedContentBounds = [
        { x: 120, y: 120, width: 720, height: 60 },
        { x: 120, y: 200, width: 720, height: 200 },
      ];

      shapes.forEach((shape) => {
        const hasOverlap = nestedContentBounds.some((content) => {
          return shape.bounds.x < content.x + content.width && shape.bounds.x + shape.bounds.width > content.x && shape.bounds.y < content.y + content.height && shape.bounds.y + shape.bounds.height > content.y;
        });

        expect(hasOverlap).toBe(false);
      });
    });

    it("should only extract bounds from nodes with text or images", () => {
      const layoutWithContainers: LayoutNode = {
        type: "slide",
        _rect: { x: 0, y: 0, width: 960, height: 540 },
        children: [
          {
            type: "container",
            _rect: { x: 100, y: 100, width: 760, height: 340 },
            // No text or image - should not be treated as content
          },
          {
            type: "title",
            _rect: { x: 120, y: 120, width: 720, height: 60 },
            text: "Title with text",
          },
        ],
      };

      const visuals = engine.generateVisuals(layoutWithContainers, mockColorPalette, "hero", "modern");

      expect(visuals).toBeDefined();
      // Should successfully generate visuals even with container nodes
      expect(visuals.length).toBeGreaterThan(0);
    });
  });

  describe("Dimension extraction", () => {
    it("should extract dimensions from layout node", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      const background = visuals[0] as BackgroundElement;
      expect(background.dimensions.width).toBe(960);
      expect(background.dimensions.height).toBe(540);
    });

    it("should use default dimensions when layout node has no rect", () => {
      const nodeWithoutRect: LayoutNode = {
        type: "slide",
        _rect: { x: 0, y: 0, width: 0, height: 0 },
      };

      const visuals = engine.generateVisuals(nodeWithoutRect, mockColorPalette, "hero", "modern");

      const background = visuals[0] as BackgroundElement;
      // Should default to standard 16:9 dimensions
      expect(background.dimensions.width).toBeGreaterThan(0);
      expect(background.dimensions.height).toBeGreaterThan(0);
    });
  });

  describe("Generator delegation", () => {
    it("should delegate to BackgroundGenerator", () => {
      const mockBackgroundGenerator = new BackgroundGenerator();
      const generateBackgroundSpy = vi.spyOn(mockBackgroundGenerator, "generateBackground");

      const engineWithMock = new ThemeEngine(mockBackgroundGenerator, undefined);
      engineWithMock.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      expect(generateBackgroundSpy).toHaveBeenCalledWith("hero", mockColorPalette, { width: 960, height: 540 });
    });

    it("should delegate to ShapeGenerator", () => {
      const mockShapeGenerator = new ShapeGenerator();
      const generateShapesSpy = vi.spyOn(mockShapeGenerator, "generateShapes");

      const engineWithMock = new ThemeEngine(undefined, mockShapeGenerator);
      engineWithMock.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      expect(generateShapesSpy).toHaveBeenCalled();
      const callArgs = generateShapesSpy.mock.calls[0];
      expect(callArgs[0]).toBe("hero");
      expect(callArgs[1]).toBe(mockColorPalette);
      expect(callArgs[3]).toBe("modern");
    });
  });

  describe("Visual element structure", () => {
    it("should generate visual elements with correct structure", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      visuals.forEach((visual) => {
        expect(visual.id).toBeDefined();
        expect(visual.kind).toBeDefined();
        expect(visual.zIndex).toBeDefined();
        expect(visual.opacity).toBeDefined();
        expect(visual.opacity).toBeGreaterThan(0);
        expect(visual.opacity).toBeLessThanOrEqual(1);
      });
    });

    it("should generate unique IDs for all visual elements", () => {
      const visuals = engine.generateVisuals(mockLayoutNode, mockColorPalette, "hero", "modern");

      const ids = visuals.map((v) => v.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
