/**
 * Unit tests for FillEngine
 *
 * Tests solid fill creation, gradient fill creation, and pattern fill creation.
 * Validates that fills are created with correct structure and properties.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { FillEngine } from "./fill-engine.js";
import type { LinearGradient, RadialGradient, Pattern, SolidFill, GradientFill, PatternFill } from "./models/visual-element.js";

describe("FillEngine", () => {
  let fillEngine: FillEngine;

  beforeEach(() => {
    fillEngine = new FillEngine();
  });

  describe("createSolidFill", () => {
    it("should create a solid fill with correct structure", () => {
      const color = "#1a73e8";
      const fill = fillEngine.createSolidFill(color);

      expect(fill).toBeDefined();
      expect(fill.type).toBe("solid");
      expect(fill.color).toBe(color);
    });

    it("should create solid fills with different color formats", () => {
      const colors = ["#1a73e8", "rgb(26, 115, 232)", "hsl(217, 80%, 51%)", "oklch(0.6 0.15 250)"];

      colors.forEach((color) => {
        const fill = fillEngine.createSolidFill(color);

        expect(fill.type).toBe("solid");
        expect(fill.color).toBe(color);
      });
    });

    it("should preserve color string exactly as provided", () => {
      const color = "#FF5733";
      const fill = fillEngine.createSolidFill(color);

      expect(fill.color).toBe(color);
    });

    it("should handle named colors", () => {
      const color = "red";
      const fill = fillEngine.createSolidFill(color);

      expect(fill.type).toBe("solid");
      expect(fill.color).toBe(color);
    });

    it("should handle colors with alpha channel", () => {
      const color = "rgba(26, 115, 232, 0.5)";
      const fill = fillEngine.createSolidFill(color);

      expect(fill.type).toBe("solid");
      expect(fill.color).toBe(color);
    });
  });

  describe("createGradientFill", () => {
    describe("Linear gradients", () => {
      it("should create a gradient fill from linear gradient definition", () => {
        const linearGradient: LinearGradient = {
          type: "linear",
          angle: 45,
          stops: [
            { position: 0, color: "#1a73e8" },
            { position: 1, color: "#34a853" },
          ],
        };

        const fill = fillEngine.createGradientFill(linearGradient);

        expect(fill).toBeDefined();
        expect(fill.type).toBe("gradient");
        expect(fill.gradient).toEqual(linearGradient);
      });

      it("should preserve gradient type", () => {
        const linearGradient: LinearGradient = {
          type: "linear",
          angle: 90,
          stops: [
            { position: 0, color: "#ff0000" },
            { position: 1, color: "#00ff00" },
          ],
        };

        const fill = fillEngine.createGradientFill(linearGradient);

        expect(fill.gradient.type).toBe("linear");
      });

      it("should preserve gradient angle", () => {
        const angles = [0, 45, 90, 135, 180, 270];

        angles.forEach((angle) => {
          const linearGradient: LinearGradient = {
            type: "linear",
            angle,
            stops: [
              { position: 0, color: "#000000" },
              { position: 1, color: "#ffffff" },
            ],
          };

          const fill = fillEngine.createGradientFill(linearGradient);

          if (fill.gradient.type === "linear") {
            expect(fill.gradient.angle).toBe(angle);
          }
        });
      });

      it("should preserve all gradient stops", () => {
        const linearGradient: LinearGradient = {
          type: "linear",
          angle: 45,
          stops: [
            { position: 0, color: "#1a73e8" },
            { position: 0.5, color: "#34a853" },
            { position: 1, color: "#fbbc04" },
          ],
        };

        const fill = fillEngine.createGradientFill(linearGradient);

        expect(fill.gradient.stops).toHaveLength(3);
        expect(fill.gradient.stops).toEqual(linearGradient.stops);
      });

      it("should handle gradients with two stops", () => {
        const linearGradient: LinearGradient = {
          type: "linear",
          angle: 0,
          stops: [
            { position: 0, color: "#000000" },
            { position: 1, color: "#ffffff" },
          ],
        };

        const fill = fillEngine.createGradientFill(linearGradient);

        expect(fill.gradient.stops).toHaveLength(2);
        expect(fill.gradient.stops[0].position).toBe(0);
        expect(fill.gradient.stops[1].position).toBe(1);
      });

      it("should handle gradients with multiple stops", () => {
        const linearGradient: LinearGradient = {
          type: "linear",
          angle: 90,
          stops: [
            { position: 0, color: "#ff0000" },
            { position: 0.25, color: "#ff7f00" },
            { position: 0.5, color: "#ffff00" },
            { position: 0.75, color: "#00ff00" },
            { position: 1, color: "#0000ff" },
          ],
        };

        const fill = fillEngine.createGradientFill(linearGradient);

        expect(fill.gradient.stops).toHaveLength(5);
      });
    });

    describe("Radial gradients", () => {
      it("should create a gradient fill from radial gradient definition", () => {
        const radialGradient: RadialGradient = {
          type: "radial",
          center: { x: 0.5, y: 0.5 },
          radius: 0.5,
          stops: [
            { position: 0, color: "#1a73e8" },
            { position: 1, color: "#34a853" },
          ],
        };

        const fill = fillEngine.createGradientFill(radialGradient);

        expect(fill).toBeDefined();
        expect(fill.type).toBe("gradient");
        expect(fill.gradient).toEqual(radialGradient);
      });

      it("should preserve gradient type", () => {
        const radialGradient: RadialGradient = {
          type: "radial",
          center: { x: 0.5, y: 0.5 },
          radius: 0.5,
          stops: [
            { position: 0, color: "#ff0000" },
            { position: 1, color: "#00ff00" },
          ],
        };

        const fill = fillEngine.createGradientFill(radialGradient);

        expect(fill.gradient.type).toBe("radial");
      });

      it("should preserve center point", () => {
        const centers = [
          { x: 0, y: 0 },
          { x: 0.5, y: 0.5 },
          { x: 1, y: 1 },
          { x: 0.25, y: 0.75 },
        ];

        centers.forEach((center) => {
          const radialGradient: RadialGradient = {
            type: "radial",
            center,
            radius: 0.5,
            stops: [
              { position: 0, color: "#000000" },
              { position: 1, color: "#ffffff" },
            ],
          };

          const fill = fillEngine.createGradientFill(radialGradient);

          if (fill.gradient.type === "radial") {
            expect(fill.gradient.center).toEqual(center);
          }
        });
      });

      it("should preserve radius", () => {
        const radii = [0.1, 0.25, 0.5, 0.75, 1.0];

        radii.forEach((radius) => {
          const radialGradient: RadialGradient = {
            type: "radial",
            center: { x: 0.5, y: 0.5 },
            radius,
            stops: [
              { position: 0, color: "#000000" },
              { position: 1, color: "#ffffff" },
            ],
          };

          const fill = fillEngine.createGradientFill(radialGradient);

          if (fill.gradient.type === "radial") {
            expect(fill.gradient.radius).toBe(radius);
          }
        });
      });

      it("should preserve all gradient stops", () => {
        const radialGradient: RadialGradient = {
          type: "radial",
          center: { x: 0.5, y: 0.5 },
          radius: 0.5,
          stops: [
            { position: 0, color: "#1a73e8" },
            { position: 0.5, color: "#34a853" },
            { position: 1, color: "#fbbc04" },
          ],
        };

        const fill = fillEngine.createGradientFill(radialGradient);

        expect(fill.gradient.stops).toHaveLength(3);
        expect(fill.gradient.stops).toEqual(radialGradient.stops);
      });
    });

    describe("Gradient stop handling", () => {
      it("should preserve stop positions", () => {
        const linearGradient: LinearGradient = {
          type: "linear",
          angle: 0,
          stops: [
            { position: 0, color: "#000000" },
            { position: 0.3, color: "#555555" },
            { position: 0.7, color: "#aaaaaa" },
            { position: 1, color: "#ffffff" },
          ],
        };

        const fill = fillEngine.createGradientFill(linearGradient);

        fill.gradient.stops.forEach((stop, index) => {
          expect(stop.position).toBe(linearGradient.stops[index].position);
        });
      });

      it("should preserve stop colors", () => {
        const linearGradient: LinearGradient = {
          type: "linear",
          angle: 0,
          stops: [
            { position: 0, color: "#1a73e8" },
            { position: 0.5, color: "rgb(52, 168, 83)" },
            { position: 1, color: "hsl(45, 98%, 51%)" },
          ],
        };

        const fill = fillEngine.createGradientFill(linearGradient);

        fill.gradient.stops.forEach((stop, index) => {
          expect(stop.color).toBe(linearGradient.stops[index].color);
        });
      });
    });
  });

  describe("createPatternFill", () => {
    describe("Image patterns", () => {
      it("should create a pattern fill from image pattern definition", () => {
        const pattern: Pattern = {
          type: "image",
          src: "https://example.com/pattern.png",
          repeat: "repeat",
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill).toBeDefined();
        expect(fill.type).toBe("pattern");
        expect(fill.pattern).toEqual(pattern);
      });

      it("should preserve image source", () => {
        const pattern: Pattern = {
          type: "image",
          src: "https://example.com/texture.jpg",
          repeat: "repeat",
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.pattern.src).toBe("https://example.com/texture.jpg");
      });

      it("should handle different repeat modes", () => {
        const repeatModes: Array<"repeat" | "repeat-x" | "repeat-y" | "no-repeat"> = ["repeat", "repeat-x", "repeat-y", "no-repeat"];

        repeatModes.forEach((repeat) => {
          const pattern: Pattern = {
            type: "image",
            src: "https://example.com/pattern.png",
            repeat,
          };

          const fill = fillEngine.createPatternFill(pattern);

          expect(fill.pattern.repeat).toBe(repeat);
        });
      });

      it("should preserve scale property", () => {
        const pattern: Pattern = {
          type: "image",
          src: "https://example.com/pattern.png",
          repeat: "repeat",
          scale: 2.0,
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.pattern.scale).toBe(2.0);
      });
    });

    describe("SVG patterns", () => {
      it("should create a pattern fill from SVG pattern definition", () => {
        const pattern: Pattern = {
          type: "svg",
          src: '<svg><circle cx="10" cy="10" r="5" fill="blue"/></svg>',
          repeat: "repeat",
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.type).toBe("pattern");
        expect(fill.pattern.type).toBe("svg");
        expect(fill.pattern.src).toBeDefined();
      });
    });

    describe("Dots patterns", () => {
      it("should create a pattern fill from dots pattern definition", () => {
        const pattern: Pattern = {
          type: "dots",
          repeat: "repeat",
          properties: {
            dotSize: 4,
            dotSpacing: 20,
            dotColor: "#cccccc",
          },
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.type).toBe("pattern");
        expect(fill.pattern.type).toBe("dots");
        expect(fill.pattern.properties).toBeDefined();
      });

      it("should preserve dot properties", () => {
        const pattern: Pattern = {
          type: "dots",
          repeat: "repeat",
          properties: {
            dotSize: 6,
            dotSpacing: 30,
            dotColor: "#ff0000",
          },
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.pattern.properties?.dotSize).toBe(6);
        expect(fill.pattern.properties?.dotSpacing).toBe(30);
        expect(fill.pattern.properties?.dotColor).toBe("#ff0000");
      });
    });

    describe("Lines patterns", () => {
      it("should create a pattern fill from lines pattern definition", () => {
        const pattern: Pattern = {
          type: "lines",
          repeat: "repeat",
          properties: {
            lineWidth: 2,
            lineSpacing: 10,
            lineAngle: 45,
            lineColor: "#000000",
          },
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.type).toBe("pattern");
        expect(fill.pattern.type).toBe("lines");
        expect(fill.pattern.properties).toBeDefined();
      });

      it("should preserve line properties", () => {
        const pattern: Pattern = {
          type: "lines",
          repeat: "repeat",
          properties: {
            lineWidth: 3,
            lineSpacing: 15,
            lineAngle: 90,
            lineColor: "#0000ff",
          },
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.pattern.properties?.lineWidth).toBe(3);
        expect(fill.pattern.properties?.lineSpacing).toBe(15);
        expect(fill.pattern.properties?.lineAngle).toBe(90);
        expect(fill.pattern.properties?.lineColor).toBe("#0000ff");
      });
    });

    describe("Grid patterns", () => {
      it("should create a pattern fill from grid pattern definition", () => {
        const pattern: Pattern = {
          type: "grid",
          repeat: "repeat",
          properties: {
            gridSize: 20,
            gridColor: "#dddddd",
          },
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.type).toBe("pattern");
        expect(fill.pattern.type).toBe("grid");
        expect(fill.pattern.properties).toBeDefined();
      });

      it("should preserve grid properties", () => {
        const pattern: Pattern = {
          type: "grid",
          repeat: "repeat",
          properties: {
            gridSize: 25,
            gridColor: "#00ff00",
          },
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.pattern.properties?.gridSize).toBe(25);
        expect(fill.pattern.properties?.gridColor).toBe("#00ff00");
      });
    });

    describe("Pattern structure", () => {
      it("should preserve pattern type", () => {
        const types: Array<"image" | "svg" | "dots" | "lines" | "grid"> = ["image", "svg", "dots", "lines", "grid"];

        types.forEach((type) => {
          const pattern: Pattern = {
            type,
            repeat: "repeat",
            src: type === "image" || type === "svg" ? "source" : undefined,
          };

          const fill = fillEngine.createPatternFill(pattern);

          expect(fill.pattern.type).toBe(type);
        });
      });

      it("should preserve repeat mode", () => {
        const pattern: Pattern = {
          type: "dots",
          repeat: "no-repeat",
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.pattern.repeat).toBe("no-repeat");
      });

      it("should handle patterns without properties", () => {
        const pattern: Pattern = {
          type: "image",
          src: "https://example.com/pattern.png",
          repeat: "repeat",
        };

        const fill = fillEngine.createPatternFill(pattern);

        expect(fill.pattern.properties).toBeUndefined();
      });

      it("should handle patterns with scale", () => {
        const scales = [0.5, 1.0, 1.5, 2.0];

        scales.forEach((scale) => {
          const pattern: Pattern = {
            type: "image",
            src: "https://example.com/pattern.png",
            repeat: "repeat",
            scale,
          };

          const fill = fillEngine.createPatternFill(pattern);

          expect(fill.pattern.scale).toBe(scale);
        });
      });
    });
  });

  describe("Fill type discrimination", () => {
    it("should create fills with distinct types", () => {
      const solidFill = fillEngine.createSolidFill("#000000");
      const gradientFill = fillEngine.createGradientFill({
        type: "linear",
        angle: 0,
        stops: [
          { position: 0, color: "#000000" },
          { position: 1, color: "#ffffff" },
        ],
      });
      const patternFill = fillEngine.createPatternFill({
        type: "dots",
        repeat: "repeat",
      });

      expect(solidFill.type).toBe("solid");
      expect(gradientFill.type).toBe("gradient");
      expect(patternFill.type).toBe("pattern");
    });

    it("should allow type-based discrimination", () => {
      const fills = [
        fillEngine.createSolidFill("#000000"),
        fillEngine.createGradientFill({
          type: "linear",
          angle: 0,
          stops: [
            { position: 0, color: "#000000" },
            { position: 1, color: "#ffffff" },
          ],
        }),
        fillEngine.createPatternFill({
          type: "dots",
          repeat: "repeat",
        }),
      ];

      fills.forEach((fill) => {
        if (fill.type === "solid") {
          const solidFill = fill as SolidFill;
          expect(solidFill.color).toBeDefined();
        } else if (fill.type === "gradient") {
          const gradientFill = fill as GradientFill;
          expect(gradientFill.gradient).toBeDefined();
        } else if (fill.type === "pattern") {
          const patternFill = fill as PatternFill;
          expect(patternFill.pattern).toBeDefined();
        }
      });
    });
  });
});
