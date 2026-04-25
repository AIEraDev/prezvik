/**
 * Unit tests for ColorPaletteGenerator
 */

import { describe, it, expect } from "vitest";
import { ColorPaletteGenerator } from "./palette-generator.js";
import { ColorParseError } from "./errors/color-parse-error.js";
import type { ThemeSpec } from "./palette-generator.js";
import { parse, formatHex, differenceEuclidean } from "culori";

describe("ColorPaletteGenerator", () => {
  const generator = new ColorPaletteGenerator();

  const validThemeSpec: ThemeSpec = {
    palette: {
      primary: "#1e3a8a",
      secondary: "#0891b2",
      accent: "#3b82f6",
      lightBg: "#f8fafc",
      darkBg: "#0f172a",
      textOnDark: "#f1f5f9",
      textOnLight: "#1e293b",
      mutedOnDark: "#94a3b8",
      mutedOnLight: "#64748b",
    },
  };

  describe("generatePalette", () => {
    it("should generate a valid color palette from ThemeSpec", () => {
      const palette = generator.generatePalette(validThemeSpec);

      expect(palette.version).toBe("1.0");
      expect(palette.primary).toBe(validThemeSpec.palette.primary);
      expect(palette.secondary).toBe(validThemeSpec.palette.secondary);
      expect(palette.accent).toBe(validThemeSpec.palette.accent);
      expect(palette.lightBg).toBe(validThemeSpec.palette.lightBg);
      expect(palette.darkBg).toBe(validThemeSpec.palette.darkBg);
      expect(palette.textOnDark).toBe(validThemeSpec.palette.textOnDark);
      expect(palette.textOnLight).toBe(validThemeSpec.palette.textOnLight);
      expect(palette.mutedOnDark).toBe(validThemeSpec.palette.mutedOnDark);
      expect(palette.mutedOnLight).toBe(validThemeSpec.palette.mutedOnLight);
    });

    it("should generate color scales for primary, secondary, and accent", () => {
      const palette = generator.generatePalette(validThemeSpec);

      expect(palette.scales).toBeDefined();
      expect(palette.scales?.primary).toHaveLength(9);
      expect(palette.scales?.secondary).toHaveLength(9);
      expect(palette.scales?.accent).toHaveLength(9);
    });

    it("should include metadata with colorSpace, generatedAt, and themeSpecHash", () => {
      const palette = generator.generatePalette(validThemeSpec);

      expect(palette.metadata.colorSpace).toBe("oklch");
      expect(palette.metadata.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(palette.metadata.themeSpecHash).toHaveLength(16);
    });

    it("should throw ColorParseError for invalid primary color", () => {
      const invalidSpec: ThemeSpec = {
        ...validThemeSpec,
        palette: {
          ...validThemeSpec.palette,
          primary: "not-a-color",
        },
      };

      expect(() => generator.generatePalette(invalidSpec)).toThrow(ColorParseError);
      expect(() => generator.generatePalette(invalidSpec)).toThrow(/Invalid color format for primary/);
    });

    it("should throw ColorParseError for invalid secondary color", () => {
      const invalidSpec: ThemeSpec = {
        ...validThemeSpec,
        palette: {
          ...validThemeSpec.palette,
          secondary: "invalid",
        },
      };

      expect(() => generator.generatePalette(invalidSpec)).toThrow(ColorParseError);
      expect(() => generator.generatePalette(invalidSpec)).toThrow(/Invalid color format for secondary/);
    });

    it("should throw ColorParseError for invalid accent color", () => {
      const invalidSpec: ThemeSpec = {
        ...validThemeSpec,
        palette: {
          ...validThemeSpec.palette,
          accent: "xyz",
        },
      };

      expect(() => generator.generatePalette(invalidSpec)).toThrow(ColorParseError);
    });

    it("should accept various CSS color formats", () => {
      const rgbSpec: ThemeSpec = {
        palette: {
          primary: "rgb(30, 58, 138)",
          secondary: "rgb(8, 145, 178)",
          accent: "rgb(59, 130, 246)",
          lightBg: "rgb(248, 250, 252)",
          darkBg: "rgb(15, 23, 42)",
          textOnDark: "rgb(241, 245, 249)",
          textOnLight: "rgb(30, 41, 59)",
          mutedOnDark: "rgb(148, 163, 184)",
          mutedOnLight: "rgb(100, 116, 139)",
        },
      };

      expect(() => generator.generatePalette(rgbSpec)).not.toThrow();
    });

    it("should accept HSL color format", () => {
      const hslSpec: ThemeSpec = {
        palette: {
          primary: "hsl(217, 91%, 60%)",
          secondary: "hsl(188, 95%, 37%)",
          accent: "hsl(217, 91%, 60%)",
          lightBg: "hsl(210, 40%, 98%)",
          darkBg: "hsl(222, 47%, 11%)",
          textOnDark: "hsl(210, 40%, 96%)",
          textOnLight: "hsl(217, 33%, 17%)",
          mutedOnDark: "hsl(215, 16%, 65%)",
          mutedOnLight: "hsl(215, 19%, 47%)",
        },
      };

      expect(() => generator.generatePalette(hslSpec)).not.toThrow();
    });

    it("should generate consistent hash for same ThemeSpec", () => {
      const palette1 = generator.generatePalette(validThemeSpec);
      const palette2 = generator.generatePalette(validThemeSpec);

      expect(palette1.metadata.themeSpecHash).toBe(palette2.metadata.themeSpecHash);
    });

    it("should generate different hash for different ThemeSpec", () => {
      const palette1 = generator.generatePalette(validThemeSpec);

      const differentSpec: ThemeSpec = {
        ...validThemeSpec,
        palette: {
          ...validThemeSpec.palette,
          primary: "#ff0000",
        },
      };
      const palette2 = generator.generatePalette(differentSpec);

      expect(palette1.metadata.themeSpecHash).not.toBe(palette2.metadata.themeSpecHash);
    });
  });

  describe("generateScale", () => {
    it("should generate a color scale with correct number of steps", () => {
      const scale = generator.generateScale("#1e3a8a", "#f8fafc", 9);

      expect(scale).toHaveLength(9);
    });

    it("should start with the start color", () => {
      const startColor = "#1e3a8a";
      const scale = generator.generateScale(startColor, "#f8fafc", 9);

      // Parse both colors and compare
      const startParsed = parse(startColor);
      const scaleParsed = parse(scale[0]);

      expect(formatHex(startParsed!)).toBe(formatHex(scaleParsed!));
    });

    it("should end with the end color", () => {
      const endColor = "#f8fafc";
      const scale = generator.generateScale("#1e3a8a", endColor, 9);

      // Parse both colors and compare
      const endParsed = parse(endColor);
      const scaleParsed = parse(scale[scale.length - 1]);

      expect(formatHex(endParsed!)).toBe(formatHex(scaleParsed!));
    });

    it("should interpolate colors in OKLCH color space by default", () => {
      const scale = generator.generateScale("#ff0000", "#0000ff", 5, "oklch");

      expect(scale).toHaveLength(5);
      // All colors should be valid hex colors
      scale.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should support RGB color space interpolation", () => {
      const scale = generator.generateScale("#ff0000", "#0000ff", 5, "rgb");

      expect(scale).toHaveLength(5);
      scale.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should support HSL color space interpolation", () => {
      const scale = generator.generateScale("#ff0000", "#0000ff", 5, "hsl");

      expect(scale).toHaveLength(5);
      scale.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should support LAB color space interpolation", () => {
      const scale = generator.generateScale("#ff0000", "#0000ff", 5, "lab");

      expect(scale).toHaveLength(5);
      scale.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should throw ColorParseError for invalid start color", () => {
      expect(() => generator.generateScale("not-a-color", "#0000ff", 5)).toThrow(ColorParseError);
      expect(() => generator.generateScale("not-a-color", "#0000ff", 5)).toThrow(/Invalid color format for startColor/);
    });

    it("should throw ColorParseError for invalid end color", () => {
      expect(() => generator.generateScale("#ff0000", "invalid", 5)).toThrow(ColorParseError);
      expect(() => generator.generateScale("#ff0000", "invalid", 5)).toThrow(/Invalid color format for endColor/);
    });

    it("should throw error for steps less than 2", () => {
      expect(() => generator.generateScale("#ff0000", "#0000ff", 1)).toThrow("Steps must be at least 2");
    });

    it("should produce perceptually uniform results with OKLCH", () => {
      const scale = generator.generateScale("#1e3a8a", "#f8fafc", 9, "oklch");

      // Calculate perceptual distances between consecutive colors
      const distances: number[] = [];
      for (let i = 0; i < scale.length - 1; i++) {
        const color1 = parse(scale[i]);
        const color2 = parse(scale[i + 1]);
        if (color1 && color2) {
          const distance = differenceEuclidean("oklch")(color1, color2);
          distances.push(distance);
        }
      }

      // Check that distances are relatively uniform (within 50% variance)
      const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
      const maxDeviation = Math.max(...distances.map((d) => Math.abs(d - avgDistance)));
      const relativeDeviation = maxDeviation / avgDistance;

      expect(relativeDeviation).toBeLessThan(0.5);
    });

    it("should handle edge case with 2 steps", () => {
      const scale = generator.generateScale("#ff0000", "#0000ff", 2);

      expect(scale).toHaveLength(2);
      expect(formatHex(parse(scale[0])!)).toBe("#ff0000");
      expect(formatHex(parse(scale[1])!)).toBe("#0000ff");
    });

    it("should accept color names", () => {
      const scale = generator.generateScale("red", "blue", 5);

      expect(scale).toHaveLength(5);
      scale.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("should accept rgba colors with transparency", () => {
      const scale = generator.generateScale("rgba(255, 0, 0, 0.5)", "rgba(0, 0, 255, 0.5)", 5);

      expect(scale).toHaveLength(5);
      scale.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-f]{6,8}$/i);
      });
    });
  });
});
