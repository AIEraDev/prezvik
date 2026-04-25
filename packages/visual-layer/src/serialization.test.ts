/**
 * Property-based tests for Visual Context serialization
 * **Validates: Requirements 9.7**
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { serializeVisualContext, parseVisualContext } from "./serialization.js";
import type { VisualContext, SlideVisualContext, Dimensions, Point, Rect } from "./models/visual-context.js";
import type { VisualElement, Fill, LinearGradient, RadialGradient, Pattern } from "./models/visual-element.js";

// Arbitraries for generating random VisualContext objects

const dimensionsArb = fc.record({
  width: fc.integer({ min: 1, max: 10000 }),
  height: fc.integer({ min: 1, max: 10000 }),
}) as fc.Arbitrary<Dimensions>;

const pointArb = fc.record({
  x: fc.integer({ min: -10000, max: 10000 }),
  y: fc.integer({ min: -10000, max: 10000 }),
}) as fc.Arbitrary<Point>;

const rectArb = fc.record({
  x: fc.integer({ min: -10000, max: 10000 }),
  y: fc.integer({ min: -10000, max: 10000 }),
  width: fc.integer({ min: 1, max: 10000 }),
  height: fc.integer({ min: 1, max: 10000 }),
}) as fc.Arbitrary<Rect>;

const colorArb = fc.oneof(
  fc.tuple(fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 })).map(([r, g, b]) => `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`),
  fc.tuple(fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 }), fc.integer({ min: 0, max: 255 })).map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`),
  fc.tuple(fc.integer({ min: 0, max: 360 }), fc.integer({ min: 0, max: 100 }), fc.integer({ min: 0, max: 100 })).map(([h, s, l]) => `hsl(${h}, ${s}%, ${l}%)`),
);

const colorStopArb = fc.record({
  position: fc.double({ min: 0, max: 1 }),
  color: colorArb,
});

const linearGradientArb = fc.record({
  type: fc.constant("linear" as const),
  angle: fc.integer({ min: 0, max: 360 }),
  stops: fc.array(colorStopArb, { minLength: 2, maxLength: 5 }),
}) as fc.Arbitrary<LinearGradient>;

const radialGradientArb = fc.record({
  type: fc.constant("radial" as const),
  center: pointArb,
  radius: fc.integer({ min: 1, max: 1000 }),
  stops: fc.array(colorStopArb, { minLength: 2, maxLength: 5 }),
}) as fc.Arbitrary<RadialGradient>;

const patternArb = fc.record({
  type: fc.constantFrom("image" as const, "svg" as const, "dots" as const, "lines" as const, "grid" as const),
  src: fc.option(fc.webUrl(), { nil: undefined }),
  repeat: fc.constantFrom("repeat" as const, "repeat-x" as const, "repeat-y" as const, "no-repeat" as const),
  scale: fc.option(fc.double({ min: 0.1, max: 5 }), { nil: undefined }),
  properties: fc.option(
    fc.record({
      dotSize: fc.option(fc.integer({ min: 1, max: 20 }), { nil: undefined }),
      dotSpacing: fc.option(fc.integer({ min: 1, max: 50 }), { nil: undefined }),
      dotColor: fc.option(colorArb, { nil: undefined }),
      lineWidth: fc.option(fc.integer({ min: 1, max: 10 }), { nil: undefined }),
      lineSpacing: fc.option(fc.integer({ min: 1, max: 50 }), { nil: undefined }),
      lineAngle: fc.option(fc.integer({ min: 0, max: 360 }), { nil: undefined }),
      lineColor: fc.option(colorArb, { nil: undefined }),
      gridSize: fc.option(fc.integer({ min: 1, max: 50 }), { nil: undefined }),
      gridColor: fc.option(colorArb, { nil: undefined }),
    }),
    { nil: undefined },
  ),
}) as fc.Arbitrary<Pattern>;

const fillArb: fc.Arbitrary<Fill> = fc.oneof(
  fc.record({
    type: fc.constant("solid" as const),
    color: colorArb,
  }),
  fc.record({
    type: fc.constant("gradient" as const),
    gradient: fc.oneof(linearGradientArb, radialGradientArb),
  }),
  fc.record({
    type: fc.constant("pattern" as const),
    pattern: patternArb,
  }),
);

const visualElementArb = fc.record({
  id: fc.uuid(),
  kind: fc.constantFrom("background" as const, "shape" as const, "text" as const, "image" as const),
  zIndex: fc.integer({ min: 0, max: 100 }),
  opacity: fc.double({ min: 0, max: 1 }),
}) as fc.Arbitrary<VisualElement>;

const slideVisualContextArb = fc.record({
  slideId: fc.uuid(),
  type: fc.constantFrom("hero" as const, "section" as const, "content" as const, "closing" as const),
  dimensions: dimensionsArb,
  background: visualElementArb,
  decorations: fc.array(visualElementArb, { maxLength: 5 }),
  content: fc.array(visualElementArb, { maxLength: 10 }),
}) as fc.Arbitrary<SlideVisualContext>;

const colorPaletteArb = fc.record({
  primary: colorArb,
  secondary: colorArb,
  accent: colorArb,
  background: colorArb,
  text: colorArb,
});

const visualContextArb = fc.record({
  version: fc.constant("1.0" as const),
  slides: fc.array(slideVisualContextArb, { minLength: 1, maxLength: 10 }),
  colorPalette: colorPaletteArb,
  theme: fc.record({
    tone: fc.constantFrom("executive" as const, "minimal" as const, "modern" as const),
    typography: fc.record({
      displayFont: fc.constantFrom("Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana"),
      bodyFont: fc.constantFrom("Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana"),
    }),
  }),
  metadata: fc.record({
    generatedAt: fc.date({ min: new Date("2000-01-01"), max: new Date("2030-12-31") }).map((d) => d.toISOString()),
    layoutTreeHash: fc.string({ minLength: 32, maxLength: 64 }),
    themeSpecHash: fc.string({ minLength: 32, maxLength: 64 }),
  }),
}) as fc.Arbitrary<VisualContext>;

describe("Visual Context Serialization", () => {
  describe("Property 1: Round-trip consistency", () => {
    it("should maintain equivalence after parse -> serialize -> parse", () => {
      fc.assert(
        fc.property(visualContextArb, (vc) => {
          // Serialize the original
          const json1 = serializeVisualContext(vc);

          // Parse it
          const parsed1 = parseVisualContext(json1);

          // Serialize again
          const json2 = serializeVisualContext(parsed1);

          // Parse again
          const parsed2 = parseVisualContext(json2);

          // The two parsed objects should be deeply equal
          expect(parsed2).toEqual(parsed1);

          // The two JSON strings should be identical
          expect(json2).toBe(json1);
        }),
        { numRuns: 100 },
      );
    });

    it("should handle empty arrays correctly", () => {
      const vc: VisualContext = {
        version: "1.0",
        slides: [],
        colorPalette: {
          primary: "#000000",
          secondary: "#111111",
          accent: "#222222",
          background: "#ffffff",
          text: "#000000",
        },
        theme: {
          tone: "minimal",
          typography: {
            displayFont: "Arial",
            bodyFont: "Arial",
          },
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          layoutTreeHash: "abc123",
          themeSpecHash: "def456",
        },
      };

      const json = serializeVisualContext(vc);
      const parsed = parseVisualContext(json);

      expect(parsed).toEqual(vc);
      expect(parsed.slides).toEqual([]);
    });

    it("should handle special characters in strings", () => {
      const vc: VisualContext = {
        version: "1.0",
        slides: [
          {
            slideId: "test-slide",
            type: "hero",
            dimensions: { width: 1920, height: 1080 },
            background: {
              id: "bg-1",
              kind: "background",
              zIndex: 0,
              opacity: 1,
            },
            decorations: [],
            content: [],
          },
        ],
        colorPalette: {
          primary: "#000000",
          secondary: "#111111",
          accent: "#222222",
          background: "#ffffff",
          text: "#000000",
        },
        theme: {
          tone: "modern",
          typography: {
            displayFont: 'Arial "Bold"',
            bodyFont: "Times New Roman's",
          },
        },
        metadata: {
          generatedAt: "2024-01-01T00:00:00.000Z",
          layoutTreeHash: "hash with spaces & special chars: <>/\\",
          themeSpecHash: "hash\twith\ttabs\nand\nnewlines",
        },
      };

      const json = serializeVisualContext(vc);
      const parsed = parseVisualContext(json);

      expect(parsed).toEqual(vc);
      expect(parsed.theme.typography.displayFont).toBe('Arial "Bold"');
      expect(parsed.metadata.layoutTreeHash).toBe("hash with spaces & special chars: <>/\\");
    });

    it("should handle boundary values", () => {
      const vc: VisualContext = {
        version: "1.0",
        slides: [
          {
            slideId: "boundary-test",
            type: "content",
            dimensions: { width: 1, height: 1 },
            background: {
              id: "bg-boundary",
              kind: "background",
              zIndex: 0,
              opacity: 0,
            },
            decorations: [],
            content: [],
          },
        ],
        colorPalette: {
          primary: "#000000",
          secondary: "#ffffff",
          accent: "#ff0000",
          background: "#00ff00",
          text: "#0000ff",
        },
        theme: {
          tone: "executive",
          typography: {
            displayFont: "",
            bodyFont: "",
          },
        },
        metadata: {
          generatedAt: "1970-01-01T00:00:00.000Z",
          layoutTreeHash: "",
          themeSpecHash: "",
        },
      };

      const json = serializeVisualContext(vc);
      const parsed = parseVisualContext(json);

      expect(parsed).toEqual(vc);
      expect(parsed.slides[0].dimensions.width).toBe(1);
      expect(parsed.slides[0].background.opacity).toBe(0);
    });
  });

  describe("Error handling", () => {
    it("should throw error for invalid JSON", () => {
      expect(() => parseVisualContext("not valid json {")).toThrow("Invalid JSON");
    });

    it("should throw error for non-object JSON", () => {
      expect(() => parseVisualContext("[]")).toThrow("Invalid VisualContext");
      expect(() => parseVisualContext("null")).toThrow("Invalid VisualContext");
      expect(() => parseVisualContext("123")).toThrow("Invalid VisualContext");
    });

    it("should throw error for missing required fields", () => {
      expect(() => parseVisualContext("{}")).toThrow("Invalid VisualContext");
      expect(() => parseVisualContext('{"version": "1.0"}')).toThrow("Invalid VisualContext");
    });

    it("should throw error for wrong version", () => {
      const invalidVc = {
        version: "2.0",
        slides: [],
        colorPalette: {},
        theme: {},
        metadata: {},
      };
      expect(() => parseVisualContext(JSON.stringify(invalidVc))).toThrow("Invalid VisualContext");
    });
  });
});
