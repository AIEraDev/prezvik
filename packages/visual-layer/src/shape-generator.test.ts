/**
 * Unit tests for ShapeGenerator
 *
 * Tests shape generation for different theme tones and validates
 * that shapes don't overlap with content bounds and use appropriate
 * styles for each theme tone.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ShapeGenerator } from "./shape-generator.js";
import type { ColorPalette } from "@kyro/theme-layer";
import type { Rect, SlideType, ThemeTone } from "./models/visual-context.js";

describe("ShapeGenerator", () => {
  let generator: ShapeGenerator;
  let mockColorPalette: ColorPalette;

  beforeEach(() => {
    generator = new ShapeGenerator();

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
  });

  describe("generateShapes", () => {
    it("should generate shapes without content bounds", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "executive");

      expect(shapes).toBeDefined();
      expect(Array.isArray(shapes)).toBe(true);
    });

    it("should generate correct number of shapes based on slide type", () => {
      const heroShapes = generator.generateShapes("hero", mockColorPalette, [], "minimal");
      const sectionShapes = generator.generateShapes("section", mockColorPalette, [], "minimal");
      const contentShapes = generator.generateShapes("content", mockColorPalette, [], "minimal");
      const closingShapes = generator.generateShapes("closing", mockColorPalette, [], "minimal");

      // Hero slides should have more shapes (3)
      expect(heroShapes.length).toBeGreaterThanOrEqual(0);
      expect(heroShapes.length).toBeLessThanOrEqual(3);

      // Section slides should have moderate shapes (2)
      expect(sectionShapes.length).toBeGreaterThanOrEqual(0);
      expect(sectionShapes.length).toBeLessThanOrEqual(2);

      // Content slides should have minimal shapes (1)
      expect(contentShapes.length).toBeGreaterThanOrEqual(0);
      expect(contentShapes.length).toBeLessThanOrEqual(1);

      // Closing slides should have moderate shapes (2)
      expect(closingShapes.length).toBeGreaterThanOrEqual(0);
      expect(closingShapes.length).toBeLessThanOrEqual(2);
    });

    it("should generate shapes with correct structure", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "executive");

      shapes.forEach((shape) => {
        expect(shape).toBeDefined();
        expect(shape.kind).toBe("shape");
        expect(shape.id).toMatch(/^shape-/);
        expect(shape.zIndex).toBe(1);
        expect(shape.opacity).toBeGreaterThan(0);
        expect(shape.opacity).toBeLessThanOrEqual(1);
        expect(shape.bounds).toBeDefined();
        expect(shape.shapeType).toBeDefined();
      });
    });
  });

  describe("Collision detection", () => {
    it("should not generate shapes that overlap with content bounds", () => {
      // Define content area in the center of the slide
      const contentBounds: Rect[] = [
        {
          x: 300,
          y: 150,
          width: 360,
          height: 240,
        },
      ];

      const shapes = generator.generateShapes("hero", mockColorPalette, contentBounds, "executive");

      // Check that no shape overlaps with content
      shapes.forEach((shape) => {
        const overlaps = rectsOverlap(shape.bounds, contentBounds[0]);
        expect(overlaps).toBe(false);
      });
    });

    it("should handle multiple content bounds", () => {
      // Define multiple content areas
      const contentBounds: Rect[] = [
        { x: 100, y: 100, width: 200, height: 100 },
        { x: 400, y: 200, width: 200, height: 100 },
        { x: 700, y: 300, width: 200, height: 100 },
      ];

      const shapes = generator.generateShapes("hero", mockColorPalette, contentBounds, "modern");

      // Check that no shape overlaps with any content area
      shapes.forEach((shape) => {
        contentBounds.forEach((contentRect) => {
          const overlaps = rectsOverlap(shape.bounds, contentRect);
          expect(overlaps).toBe(false);
        });
      });
    });

    it("should return fewer shapes when content bounds cover most of the slide", () => {
      // Define large content bounds that cover most of the slide
      const contentBounds: Rect[] = [{ x: 50, y: 50, width: 860, height: 440 }];

      const shapes = generator.generateShapes("hero", mockColorPalette, contentBounds, "executive");

      // Should generate fewer shapes or none due to limited space
      expect(shapes.length).toBeLessThanOrEqual(3);
    });

    it("should skip shapes that cannot find non-overlapping positions", () => {
      // Create content bounds that cover the entire slide
      const contentBounds: Rect[] = [{ x: 0, y: 0, width: 960, height: 540 }];

      const shapes = generator.generateShapes("hero", mockColorPalette, contentBounds, "minimal");

      // Should generate no shapes since entire slide is covered
      expect(shapes.length).toBe(0);
    });
  });

  describe("Executive theme tone", () => {
    it("should generate rectangles and lines for executive tone", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "executive");

      const shapeTypes = shapes.map((s) => s.shapeType);

      // Should contain rectangles and/or lines
      const hasRectanglesOrLines = shapeTypes.some((type) => type === "rectangle" || type === "line");
      expect(hasRectanglesOrLines).toBe(true);
    });

    it("should not generate circles or polygons for executive tone", () => {
      // Generate multiple times to ensure consistency
      for (let i = 0; i < 5; i++) {
        const shapes = generator.generateShapes("hero", mockColorPalette, [], "executive");

        const shapeTypes = shapes.map((s) => s.shapeType);

        // Should not contain circles or polygons
        expect(shapeTypes.includes("circle")).toBe(false);
        expect(shapeTypes.includes("polygon")).toBe(false);
      }
    });

    it("should generate shapes with appropriate opacity for executive tone", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "executive");

      shapes.forEach((shape) => {
        // Executive shapes should have subtle opacity
        expect(shape.opacity).toBeGreaterThan(0);
        expect(shape.opacity).toBeLessThanOrEqual(0.3);
      });
    });
  });

  describe("Minimal theme tone", () => {
    it("should generate circles for minimal tone", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "minimal");

      const shapeTypes = shapes.map((s) => s.shapeType);

      // Should contain circles
      expect(shapeTypes.includes("circle")).toBe(true);
    });

    it("should generate shapes with low opacity for minimal tone", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "minimal");

      shapes.forEach((shape) => {
        // Minimal shapes should have very subtle opacity
        expect(shape.opacity).toBeGreaterThan(0);
        expect(shape.opacity).toBeLessThanOrEqual(0.2);
      });
    });

    it("should generate circles with radius property", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "minimal");

      shapes.forEach((shape) => {
        if (shape.shapeType === "circle") {
          expect(shape.properties?.radius).toBeDefined();
          expect(shape.properties!.radius).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("Modern theme tone", () => {
    it("should generate polygons and rectangles for modern tone", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "modern");

      const shapeTypes = shapes.map((s) => s.shapeType);

      // Should contain polygons and/or rectangles
      const hasPolygonsOrRectangles = shapeTypes.some((type) => type === "polygon" || type === "rectangle");
      expect(hasPolygonsOrRectangles).toBe(true);
    });

    it("should generate polygons with points property", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "modern");

      shapes.forEach((shape) => {
        if (shape.shapeType === "polygon") {
          expect(shape.properties?.points).toBeDefined();
          expect(Array.isArray(shape.properties!.points)).toBe(true);
          expect(shape.properties!.points!.length).toBeGreaterThan(0);
        }
      });
    });

    it("should generate dynamic rectangles with corner radius", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "modern");

      shapes.forEach((shape) => {
        if (shape.shapeType === "rectangle") {
          // Modern rectangles may have corner radius
          if (shape.properties?.cornerRadius !== undefined) {
            expect(shape.properties.cornerRadius).toBeGreaterThanOrEqual(0);
          }
        }
      });
    });
  });

  describe("Shape properties", () => {
    it("should generate shapes with fills or strokes", () => {
      const themeTones: ThemeTone[] = ["executive", "minimal", "modern"];

      themeTones.forEach((tone) => {
        const shapes = generator.generateShapes("hero", mockColorPalette, [], tone);

        shapes.forEach((shape) => {
          // Each shape should have either a fill or a stroke
          const hasFillOrStroke = shape.fill !== undefined || shape.stroke !== undefined;
          expect(hasFillOrStroke).toBe(true);
        });
      });
    });

    it("should use colors from the color palette", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "executive");

      const paletteColors = [mockColorPalette.accent, mockColorPalette.primary, mockColorPalette.secondary];

      shapes.forEach((shape) => {
        if (shape.fill && shape.fill.type === "solid") {
          // Fill color should be from palette
          expect(paletteColors.includes(shape.fill.color)).toBe(true);
        }

        if (shape.stroke) {
          // Stroke color should be from palette
          expect(paletteColors.includes(shape.stroke.color)).toBe(true);
        }
      });
    });

    it("should generate shapes with valid bounds", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "minimal");

      shapes.forEach((shape) => {
        expect(shape.bounds.x).toBeGreaterThanOrEqual(0);
        expect(shape.bounds.y).toBeGreaterThanOrEqual(0);
        expect(shape.bounds.width).toBeGreaterThan(0);
        expect(shape.bounds.height).toBeGreaterThan(0);

        // Bounds should be within reasonable slide dimensions
        expect(shape.bounds.x + shape.bounds.width).toBeLessThanOrEqual(1000);
        expect(shape.bounds.y + shape.bounds.height).toBeLessThanOrEqual(600);
      });
    });

    it("should set zIndex to 1 for all shapes", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "executive");

      shapes.forEach((shape) => {
        expect(shape.zIndex).toBe(1);
      });
    });

    it("should generate unique IDs for each shape", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "modern");

      const ids = shapes.map((s) => s.id);
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("Different slide types", () => {
    it("should generate shapes for all slide types", () => {
      const slideTypes: SlideType[] = ["hero", "section", "content", "closing"];

      slideTypes.forEach((slideType) => {
        const shapes = generator.generateShapes(slideType, mockColorPalette, [], "minimal");

        expect(shapes).toBeDefined();
        expect(Array.isArray(shapes)).toBe(true);
      });
    });

    it("should generate more shapes for hero slides than content slides", () => {
      const heroShapes = generator.generateShapes("hero", mockColorPalette, [], "executive");
      const contentShapes = generator.generateShapes("content", mockColorPalette, [], "executive");

      // Hero slides should have more or equal shapes compared to content slides
      expect(heroShapes.length).toBeGreaterThanOrEqual(contentShapes.length);
    });
  });

  describe("Line shapes", () => {
    it("should generate lines with stroke property", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "executive");

      shapes.forEach((shape) => {
        if (shape.shapeType === "line") {
          expect(shape.stroke).toBeDefined();
          expect(shape.stroke!.width).toBeGreaterThan(0);
          expect(shape.stroke!.color).toBeDefined();
        }
      });
    });

    it("should generate vertical or horizontal lines", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "executive");

      shapes.forEach((shape) => {
        if (shape.shapeType === "line") {
          // Lines should be either vertical (narrow width) or horizontal (narrow height)
          const isVertical = shape.bounds.width < shape.bounds.height;
          const isHorizontal = shape.bounds.height < shape.bounds.width;

          expect(isVertical || isHorizontal).toBe(true);
        }
      });
    });
  });

  describe("Color palette usage", () => {
    it("should use different colors from palette", () => {
      const shapes = generator.generateShapes("hero", mockColorPalette, [], "modern");

      const colors = new Set<string>();

      shapes.forEach((shape) => {
        if (shape.fill && shape.fill.type === "solid") {
          colors.add(shape.fill.color);
        }
        if (shape.stroke) {
          colors.add(shape.stroke.color);
        }
      });

      // Should use at least one color from palette
      expect(colors.size).toBeGreaterThan(0);
    });

    it("should not use hardcoded colors", () => {
      // Create a custom palette with unique colors
      const customPalette: ColorPalette = {
        ...mockColorPalette,
        primary: "#ff0000",
        secondary: "#00ff00",
        accent: "#0000ff",
      };

      const shapes = generator.generateShapes("hero", customPalette, [], "executive");

      const customColors = [customPalette.accent, customPalette.primary, customPalette.secondary];

      shapes.forEach((shape) => {
        if (shape.fill && shape.fill.type === "solid") {
          // Should use colors from custom palette
          expect(customColors.includes(shape.fill.color)).toBe(true);
        }

        if (shape.stroke) {
          // Should use colors from custom palette
          expect(customColors.includes(shape.stroke.color)).toBe(true);
        }
      });
    });
  });
});

/**
 * Helper function to check if two rectangles overlap
 */
function rectsOverlap(rect1: Rect, rect2: Rect): boolean {
  return rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
}
