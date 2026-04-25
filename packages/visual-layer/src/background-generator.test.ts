/**
 * Unit tests for BackgroundGenerator
 *
 * Tests background generation for different slide types and validates
 * that backgrounds use colors from the ColorPalette correctly.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { BackgroundGenerator } from "./background-generator.js";
import type { ColorPalette } from "@kyro/theme-layer";
import type { Dimensions, SlideType } from "./models/visual-context.js";
import type { GradientFill, LinearGradient, SolidFill } from "./models/visual-element.js";

describe("BackgroundGenerator", () => {
  let generator: BackgroundGenerator;
  let mockColorPalette: ColorPalette;
  let mockDimensions: Dimensions;

  beforeEach(() => {
    generator = new BackgroundGenerator();

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

    mockDimensions = {
      width: 1920,
      height: 1080,
    };
  });

  describe("generateBackground", () => {
    it("should generate a background element with correct structure", () => {
      const background = generator.generateBackground("content", mockColorPalette, mockDimensions);

      expect(background).toBeDefined();
      expect(background.kind).toBe("background");
      expect(background.id).toMatch(/^bg-content-\d+-\d+$/);
      expect(background.zIndex).toBe(0);
      expect(background.opacity).toBe(1.0);
      expect(background.dimensions).toEqual(mockDimensions);
      expect(background.fill).toBeDefined();
    });

    it("should generate backgrounds for all slide types", () => {
      const slideTypes: SlideType[] = ["hero", "section", "content", "closing"];

      slideTypes.forEach((slideType) => {
        const background = generator.generateBackground(slideType, mockColorPalette, mockDimensions);

        expect(background).toBeDefined();
        expect(background.kind).toBe("background");
        expect(background.id).toContain(`bg-${slideType}`);
      });
    });
  });

  describe("Hero slide backgrounds", () => {
    it("should generate gradient background for hero slides", () => {
      const background = generator.generateBackground("hero", mockColorPalette, mockDimensions);

      expect(background.fill.type).toBe("gradient");

      const gradientFill = background.fill as GradientFill;
      expect(gradientFill.gradient.type).toBe("linear");
      expect(gradientFill.gradient.stops).toHaveLength(3); // Now has 3 stops with mid-point
    });

    it("should use primary and secondary colors from palette", () => {
      const background = generator.generateBackground("hero", mockColorPalette, mockDimensions);

      const gradientFill = background.fill as GradientFill;
      const stops = gradientFill.gradient.stops;

      expect(stops[0].color).toBe(mockColorPalette.primary);
      expect(stops[2].color).toBe(mockColorPalette.secondary); // Last stop is secondary
      // Middle stop is a blend of primary and secondary
      expect(stops[1].position).toBe(0.5);
    });

    it("should use varied angles (45°, 135°, 90°, 180°)", () => {
      // Generate multiple backgrounds to test randomness
      const angles = new Set<number>();

      for (let i = 0; i < 40; i++) {
        const background = generator.generateBackground("hero", mockColorPalette, mockDimensions);
        const gradientFill = background.fill as GradientFill;

        if (gradientFill.gradient.type === "linear") {
          const linearGradient = gradientFill.gradient as LinearGradient;
          angles.add(linearGradient.angle);
        }
      }

      // Should have multiple angles (with high probability)
      expect(angles.size).toBeGreaterThan(1);
      // All angles should be one of the valid options
      for (const angle of angles) {
        expect([45, 135, 90, 180]).toContain(angle);
      }
    });

    it("should have gradient stops at positions 0, 0.5, and 1", () => {
      const background = generator.generateBackground("hero", mockColorPalette, mockDimensions);

      const gradientFill = background.fill as GradientFill;
      const stops = gradientFill.gradient.stops;

      expect(stops[0].position).toBe(0);
      expect(stops[1].position).toBe(0.5);
      expect(stops[2].position).toBe(1);
    });
  });

  describe("Section slide backgrounds", () => {
    it("should generate solid or gradient background for section slides", () => {
      // Generate multiple backgrounds to test both possibilities
      const fillTypes = new Set<string>();

      for (let i = 0; i < 20; i++) {
        const background = generator.generateBackground("section", mockColorPalette, mockDimensions);
        fillTypes.add(background.fill.type);
      }

      // Should have at least one type (solid is more common)
      expect(fillTypes.size).toBeGreaterThan(0);
      expect(fillTypes.has("solid") || fillTypes.has("gradient")).toBe(true);
    });

    it("should use dark background color for solid fills", () => {
      // Generate multiple backgrounds and check solid ones
      for (let i = 0; i < 10; i++) {
        const background = generator.generateBackground("section", mockColorPalette, mockDimensions);

        if (background.fill.type === "solid") {
          const solidFill = background.fill as SolidFill;
          expect(solidFill.color).toBe(mockColorPalette.darkBg);
        }
      }
    });

    it("should use subtle gradient with dark background when gradient is used", () => {
      // Generate multiple backgrounds to find a gradient one
      let foundGradient = false;

      for (let i = 0; i < 30; i++) {
        const background = generator.generateBackground("section", mockColorPalette, mockDimensions);

        if (background.fill.type === "gradient") {
          foundGradient = true;
          const gradientFill = background.fill as GradientFill;

          expect(gradientFill.gradient.type).toBe("linear");

          if (gradientFill.gradient.type === "linear") {
            const linearGradient = gradientFill.gradient as LinearGradient;
            expect(linearGradient.angle).toBe(135); // Diagonal for visual interest
          }

          expect(gradientFill.gradient.stops[0].color).toBe(mockColorPalette.darkBg);

          // Second stop should be a lightened version
          expect(gradientFill.gradient.stops[1].color).toMatch(/^#[0-9a-f]{6}$/i);
          break;
        }
      }

      // With 30 attempts and 30% probability, we should find at least one gradient
      expect(foundGradient).toBe(true);
    });
  });

  describe("Content slide backgrounds", () => {
    it("should generate solid background for content slides", () => {
      const background = generator.generateBackground("content", mockColorPalette, mockDimensions);

      expect(background.fill.type).toBe("solid");
    });

    it("should use light background color from palette", () => {
      const background = generator.generateBackground("content", mockColorPalette, mockDimensions);

      const solidFill = background.fill as SolidFill;
      expect(solidFill.color).toBe(mockColorPalette.lightBg);
    });

    it("should generate minimal backgrounds consistently", () => {
      // Generate multiple content backgrounds
      const backgrounds = Array.from({ length: 5 }, () => generator.generateBackground("content", mockColorPalette, mockDimensions));

      // All should be solid fills with light background
      backgrounds.forEach((background) => {
        expect(background.fill.type).toBe("solid");
        const solidFill = background.fill as SolidFill;
        expect(solidFill.color).toBe(mockColorPalette.lightBg);
      });
    });
  });

  describe("Closing slide backgrounds", () => {
    it("should generate gradient background for closing slides", () => {
      const background = generator.generateBackground("closing", mockColorPalette, mockDimensions);

      expect(background.fill.type).toBe("gradient");

      const gradientFill = background.fill as GradientFill;
      expect(gradientFill.gradient.type).toBe("linear");
      expect(gradientFill.gradient.stops).toHaveLength(2);
    });

    it("should use secondary and accent colors from palette", () => {
      const background = generator.generateBackground("closing", mockColorPalette, mockDimensions);

      const gradientFill = background.fill as GradientFill;
      const stops = gradientFill.gradient.stops;

      expect(stops[0].color).toBe(mockColorPalette.secondary);
      expect(stops[1].color).toBe(mockColorPalette.accent);
    });

    it("should use consistent 135° angle", () => {
      // Generate multiple backgrounds to verify consistency
      for (let i = 0; i < 5; i++) {
        const background = generator.generateBackground("closing", mockColorPalette, mockDimensions);
        const gradientFill = background.fill as GradientFill;

        if (gradientFill.gradient.type === "linear") {
          const linearGradient = gradientFill.gradient as LinearGradient;
          expect(linearGradient.angle).toBe(135);
        }
      }
    });
  });

  describe("Color palette usage", () => {
    it("should use colors from the provided ColorPalette", () => {
      const slideTypes: SlideType[] = ["hero", "section", "content", "closing"];

      slideTypes.forEach((slideType) => {
        const background = generator.generateBackground(slideType, mockColorPalette, mockDimensions);

        // Extract colors from the background
        const colors: string[] = [];

        if (background.fill.type === "solid") {
          const solidFill = background.fill as SolidFill;
          colors.push(solidFill.color);
        } else if (background.fill.type === "gradient") {
          const gradientFill = background.fill as GradientFill;
          gradientFill.gradient.stops.forEach((stop) => colors.push(stop.color));
        }

        // Verify at least one color is from the palette
        const paletteColors = [mockColorPalette.primary, mockColorPalette.secondary, mockColorPalette.accent, mockColorPalette.lightBg, mockColorPalette.darkBg];

        const usesColorFromPalette = colors.some((color) => paletteColors.includes(color));
        expect(usesColorFromPalette).toBe(true);
      });
    });

    it("should not use hardcoded colors", () => {
      // Create a custom palette with unique colors
      const customPalette: ColorPalette = {
        ...mockColorPalette,
        primary: "#ff0000",
        secondary: "#00ff00",
        accent: "#0000ff",
        lightBg: "#f0f0f0",
        darkBg: "#101010",
      };

      const background = generator.generateBackground("hero", customPalette, mockDimensions);

      const gradientFill = background.fill as GradientFill;
      const stops = gradientFill.gradient.stops;

      // Should use the custom colors, not hardcoded ones
      expect(stops[0].color).toBe(customPalette.primary);
      expect(stops[2].color).toBe(customPalette.secondary); // Last stop is secondary
      // Middle stop should be a blend of primary and secondary
      expect(stops[1].color).not.toBe(customPalette.primary);
      expect(stops[1].color).not.toBe(customPalette.secondary);
    });
  });

  describe("Dimensions handling", () => {
    it("should preserve provided dimensions", () => {
      const customDimensions: Dimensions = {
        width: 1280,
        height: 720,
      };

      const background = generator.generateBackground("content", mockColorPalette, customDimensions);

      expect(background.dimensions).toEqual(customDimensions);
    });

    it("should handle different aspect ratios", () => {
      const dimensions16x9: Dimensions = { width: 1920, height: 1080 };
      const dimensions4x3: Dimensions = { width: 1024, height: 768 };

      const bg1 = generator.generateBackground("hero", mockColorPalette, dimensions16x9);
      const bg2 = generator.generateBackground("hero", mockColorPalette, dimensions4x3);

      expect(bg1.dimensions).toEqual(dimensions16x9);
      expect(bg2.dimensions).toEqual(dimensions4x3);
    });
  });

  describe("Background element properties", () => {
    it("should always set zIndex to 0 for backgrounds", () => {
      const slideTypes: SlideType[] = ["hero", "section", "content", "closing"];

      slideTypes.forEach((slideType) => {
        const background = generator.generateBackground(slideType, mockColorPalette, mockDimensions);
        expect(background.zIndex).toBe(0);
      });
    });

    it("should always set opacity to 1.0 for backgrounds", () => {
      const slideTypes: SlideType[] = ["hero", "section", "content", "closing"];

      slideTypes.forEach((slideType) => {
        const background = generator.generateBackground(slideType, mockColorPalette, mockDimensions);
        expect(background.opacity).toBe(1.0);
      });
    });

    it("should generate unique IDs for each background", () => {
      const ids = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const background = generator.generateBackground("content", mockColorPalette, mockDimensions);
        ids.add(background.id);
      }

      // All IDs should be unique
      expect(ids.size).toBe(10);
    });
  });
});
