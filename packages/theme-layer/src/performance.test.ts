/**
 * Performance Tests for Theme Layer
 *
 * Tests that Theme Layer operations meet performance requirements:
 * - Color palette generation: < 100ms per slide
 * - Color interpolation: < 10ms per operation
 * - Gradient generation: < 5ms per gradient
 * - Blend mode operations: < 5ms per operation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ColorPaletteGenerator, type ThemeSpec } from "./palette-generator.js";
import { GradientGenerator } from "./gradient-generator.js";
import { BlendModeEngine } from "./blend-mode-engine.js";

describe("Theme Layer Performance Tests", () => {
  let paletteGenerator: ColorPaletteGenerator;
  let gradientGenerator: GradientGenerator;
  let blendModeEngine: BlendModeEngine;

  beforeEach(() => {
    paletteGenerator = new ColorPaletteGenerator();
    gradientGenerator = new GradientGenerator();
    blendModeEngine = new BlendModeEngine();
  });

  describe("Color Palette Generation Performance", () => {
    it("should generate palette in < 100ms", () => {
      const themeSpec: ThemeSpec = {
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

      const startTime = performance.now();
      const palette = paletteGenerator.generatePalette(themeSpec);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(palette).toBeDefined();
      expect(duration).toBeLessThan(100);

      console.log(`[Performance] Palette generation: ${duration.toFixed(2)}ms`);
    });

    it("should generate palette with scales in < 100ms", () => {
      const themeSpec: ThemeSpec = {
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

      const startTime = performance.now();
      const palette = paletteGenerator.generatePalette(themeSpec);

      // Generate scales for primary, secondary, accent
      if (palette.scales) {
        const primaryScale = palette.scales.primary;
        const secondaryScale = palette.scales.secondary;
        const accentScale = palette.scales.accent;

        expect(primaryScale).toBeDefined();
        expect(secondaryScale).toBeDefined();
        expect(accentScale).toBeDefined();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);

      console.log(`[Performance] Palette with scales: ${duration.toFixed(2)}ms`);
    });

    it("should handle 10 palette generations in < 1000ms", () => {
      const themeSpec: ThemeSpec = {
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

      const startTime = performance.now();

      for (let i = 0; i < 10; i++) {
        paletteGenerator.generatePalette(themeSpec);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000);

      console.log(`[Performance] 10 palette generations: ${duration.toFixed(2)}ms (avg: ${(duration / 10).toFixed(2)}ms)`);
    });
  });

  describe("Color Interpolation Performance", () => {
    it("should interpolate colors in < 10ms", () => {
      const startTime = performance.now();

      const scale = paletteGenerator.generateScale("#ff0000", "#0000ff", 10, "oklch");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(scale).toHaveLength(10);
      expect(duration).toBeLessThan(10);

      console.log(`[Performance] Color interpolation (10 steps): ${duration.toFixed(2)}ms`);
    });

    it("should handle large scale generation in < 50ms", () => {
      const startTime = performance.now();

      const scale = paletteGenerator.generateScale("#ff0000", "#0000ff", 100, "oklch");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(scale).toHaveLength(100);
      expect(duration).toBeLessThan(50);

      console.log(`[Performance] Large scale (100 steps): ${duration.toFixed(2)}ms`);
    });

    it("should handle multiple interpolations in < 100ms", () => {
      const startTime = performance.now();

      for (let i = 0; i < 20; i++) {
        paletteGenerator.generateScale("#ff0000", "#0000ff", 10, "oklch");
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);

      console.log(`[Performance] 20 interpolations: ${duration.toFixed(2)}ms (avg: ${(duration / 20).toFixed(2)}ms)`);
    });
  });

  describe("Gradient Generation Performance", () => {
    it("should generate linear gradient in < 5ms", () => {
      const stops = [
        { position: 0, color: "#ff0000" },
        { position: 0.5, color: "#00ff00" },
        { position: 1, color: "#0000ff" },
      ];

      const startTime = performance.now();

      const gradient = gradientGenerator.generateLinear(stops, 45);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(gradient).toBeDefined();
      expect(gradient.type).toBe("linear");
      expect(duration).toBeLessThan(5);

      console.log(`[Performance] Linear gradient: ${duration.toFixed(2)}ms`);
    });

    it("should generate radial gradient in < 5ms", () => {
      const stops = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      const startTime = performance.now();

      const gradient = gradientGenerator.generateRadial(stops, { x: 0.5, y: 0.5 }, 0.5);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(gradient).toBeDefined();
      expect(gradient.type).toBe("radial");
      expect(duration).toBeLessThan(5);

      console.log(`[Performance] Radial gradient: ${duration.toFixed(2)}ms`);
    });

    it("should handle 100 gradient generations in < 500ms", () => {
      const stops = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        gradientGenerator.generateLinear(stops, 45);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);

      console.log(`[Performance] 100 gradients: ${duration.toFixed(2)}ms (avg: ${(duration / 100).toFixed(2)}ms)`);
    });
  });

  describe("Blend Mode Performance", () => {
    it("should blend colors in < 5ms", () => {
      const startTime = performance.now();

      const blended = blendModeEngine.blend("#ff0000", "#0000ff", "multiply", 0.5);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(blended).toBeDefined();
      expect(duration).toBeLessThan(5);

      console.log(`[Performance] Blend operation: ${duration.toFixed(2)}ms`);
    });

    it("should handle multiple blend modes in < 50ms", () => {
      const modes: Array<"multiply" | "screen" | "overlay" | "darken" | "lighten"> = ["multiply", "screen", "overlay", "darken", "lighten"];

      const startTime = performance.now();

      for (const mode of modes) {
        for (let i = 0; i < 10; i++) {
          blendModeEngine.blend("#ff0000", "#0000ff", mode, 0.5);
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);

      console.log(`[Performance] 50 blend operations: ${duration.toFixed(2)}ms (avg: ${(duration / 50).toFixed(2)}ms)`);
    });
  });

  describe("End-to-End Theme Layer Performance", () => {
    it("should complete all theme operations for a slide in < 100ms", () => {
      const themeSpec: ThemeSpec = {
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

      const startTime = performance.now();

      // Generate palette
      const palette = paletteGenerator.generatePalette(themeSpec);

      // Generate gradients
      const gradient1 = gradientGenerator.generateLinear(
        [
          { position: 0, color: palette.primary },
          { position: 1, color: palette.secondary },
        ],
        45,
      );

      const gradient2 = gradientGenerator.generateRadial(
        [
          { position: 0, color: palette.accent },
          { position: 1, color: palette.lightBg },
        ],
        { x: 0.5, y: 0.5 },
        0.5,
      );

      // Blend colors
      const blended = blendModeEngine.blend(palette.primary, palette.accent, "multiply", 0.5);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(palette).toBeDefined();
      expect(gradient1).toBeDefined();
      expect(gradient2).toBeDefined();
      expect(blended).toBeDefined();
      expect(duration).toBeLessThan(100);

      console.log(`[Performance] Complete theme operations: ${duration.toFixed(2)}ms`);
    });
  });
});
