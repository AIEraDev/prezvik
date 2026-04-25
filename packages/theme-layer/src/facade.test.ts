/**
 * Unit tests for ThemeLayerFacade
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeLayerFacadeImpl } from "./facade.js";
import { ColorPaletteGenerator } from "./palette-generator.js";
import { GradientGenerator } from "./gradient-generator.js";
import { BlendModeEngine } from "./blend-mode-engine.js";
import type { ThemeSpec } from "./palette-generator.js";

describe("ThemeLayerFacade", () => {
  let paletteGenerator: ColorPaletteGenerator;
  let gradientGenerator: GradientGenerator;
  let blendModeEngine: BlendModeEngine;
  let facade: ThemeLayerFacadeImpl;

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

  beforeEach(() => {
    paletteGenerator = new ColorPaletteGenerator();
    gradientGenerator = new GradientGenerator();
    blendModeEngine = new BlendModeEngine();
    facade = new ThemeLayerFacadeImpl(paletteGenerator, gradientGenerator, blendModeEngine);
  });

  describe("constructor", () => {
    it("should accept ColorPaletteGenerator, GradientGenerator, and BlendModeEngine", () => {
      expect(facade).toBeInstanceOf(ThemeLayerFacadeImpl);
    });
  });

  describe("generatePalette", () => {
    it("should return a Promise that resolves to ColorPalette", async () => {
      const result = facade.generatePalette(validThemeSpec);
      expect(result).toBeInstanceOf(Promise);

      const palette = await result;
      expect(palette).toBeDefined();
      expect(palette.version).toBe("1.0");
    });

    it("should delegate to ColorPaletteGenerator", async () => {
      const spy = vi.spyOn(paletteGenerator, "generatePalette");

      await facade.generatePalette(validThemeSpec);

      expect(spy).toHaveBeenCalledWith(validThemeSpec);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should return a valid ColorPalette with all semantic colors", async () => {
      const palette = await facade.generatePalette(validThemeSpec);

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

    it("should return a ColorPalette with color scales", async () => {
      const palette = await facade.generatePalette(validThemeSpec);

      expect(palette.scales).toBeDefined();
      expect(palette.scales?.primary).toHaveLength(9);
      expect(palette.scales?.secondary).toHaveLength(9);
      expect(palette.scales?.accent).toHaveLength(9);
    });

    it("should return a ColorPalette with metadata", async () => {
      const palette = await facade.generatePalette(validThemeSpec);

      expect(palette.metadata).toBeDefined();
      expect(palette.metadata.colorSpace).toBe("oklch");
      expect(palette.metadata.generatedAt).toBeDefined();
      expect(palette.metadata.themeSpecHash).toBeDefined();
    });

    it("should throw ColorParseError for invalid colors", async () => {
      const invalidThemeSpec: ThemeSpec = {
        palette: {
          ...validThemeSpec.palette,
          primary: "not-a-color",
        },
      };

      await expect(facade.generatePalette(invalidThemeSpec)).rejects.toThrow();
    });

    it("should produce deterministic results for the same input", async () => {
      const palette1 = await facade.generatePalette(validThemeSpec);
      const palette2 = await facade.generatePalette(validThemeSpec);

      expect(palette1.primary).toBe(palette2.primary);
      expect(palette1.scales?.primary).toEqual(palette2.scales?.primary);
      expect(palette1.metadata.themeSpecHash).toBe(palette2.metadata.themeSpecHash);
    });
  });
});
