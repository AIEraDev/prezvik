import { describe, it, expect } from "vitest";
import { BlendModeEngine } from "./blend-mode-engine.js";
import type { BlendMode } from "./blend-mode-engine.js";
import { rgb } from "culori";

describe("BlendModeEngine", () => {
  const engine = new BlendModeEngine();

  describe("blend", () => {
    it("should blend two colors using multiply mode", () => {
      const result = engine.blend("#ff0000", "#00ff00", "multiply");
      expect(result).toBe("#000000");
    });

    it("should blend two colors using screen mode", () => {
      const result = engine.blend("#ff0000", "#00ff00", "screen");
      expect(result).toBe("#ffff00");
    });

    it("should blend two colors using overlay mode", () => {
      const result = engine.blend("#808080", "#ff0000", "overlay");
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("should blend two colors using darken mode", () => {
      const result = engine.blend("#ff8080", "#80ff80", "darken");
      expect(result).toBe("#808080");
    });

    it("should blend two colors using lighten mode", () => {
      const result = engine.blend("#ff8080", "#80ff80", "lighten");
      expect(result).toBe("#ffff80");
    });

    it("should apply opacity parameter correctly", () => {
      const fullOpacity = engine.blend("#ff0000", "#0000ff", "multiply", 1);
      const noOpacity = engine.blend("#ff0000", "#0000ff", "multiply", 0);
      expect(noOpacity).toBe("#ff0000");
      expect(fullOpacity).toBe("#000000");
    });

    it("should throw error for invalid base color", () => {
      expect(() => engine.blend("not-a-color", "#0000ff", "multiply")).toThrow("Invalid base color");
    });

    it("should throw error for invalid blend color", () => {
      expect(() => engine.blend("#ff0000", "invalid", "multiply")).toThrow("Invalid blend color");
    });

    it("should throw error for invalid blend mode", () => {
      expect(() => engine.blend("#ff0000", "#0000ff", "invalid-mode" as BlendMode)).toThrow("Unsupported blend mode");
    });

    it("should throw error for opacity less than 0", () => {
      expect(() => engine.blend("#ff0000", "#0000ff", "multiply", -0.1)).toThrow("Opacity must be between 0 and 1");
    });

    it("should throw error for opacity greater than 1", () => {
      expect(() => engine.blend("#ff0000", "#0000ff", "multiply", 1.1)).toThrow("Opacity must be between 0 and 1");
    });
  });

  describe("multiply blend mode", () => {
    it("should darken colors", () => {
      const result = engine.blend("#808080", "#808080", "multiply");
      const parsed = rgb(result);
      expect(parsed?.r).toBeLessThan(0.5);
    });

    it("should produce original color when multiplied with white", () => {
      const result = engine.blend("#ff0000", "#ffffff", "multiply");
      expect(result).toBe("#ff0000");
    });
  });

  describe("screen blend mode", () => {
    it("should lighten colors", () => {
      const result = engine.blend("#404040", "#404040", "screen");
      const parsed = rgb(result);
      expect(parsed?.r).toBeGreaterThan(0.25);
    });
  });

  describe("all blend modes", () => {
    const blendModes: BlendMode[] = ["multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion"];

    it.each(blendModes)("should produce valid hex color for %s mode", (mode) => {
      const result = engine.blend("#ff0000", "#0000ff", mode);
      expect(result).toMatch(/^#[0-9a-f]{6,8}$/i);
    });

    it.each(blendModes)("should handle opacity for %s mode", (mode) => {
      const result = engine.blend("#ff0000", "#0000ff", mode, 0.5);
      expect(result).toMatch(/^#[0-9a-f]{6,8}$/i);
    });
  });
});
