/**
 * Unit tests for GradientGenerator
 */

import { describe, it, expect } from "vitest";
import { GradientGenerator } from "./gradient-generator.js";
import { ColorParseError } from "./errors/color-parse-error.js";
import type { ColorStop, Point } from "./gradient-generator.js";

describe("GradientGenerator", () => {
  const generator = new GradientGenerator();

  describe("generateLinear", () => {
    it("should generate a valid linear gradient", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      const gradient = generator.generateLinear(stops, 90);

      expect(gradient.type).toBe("linear");
      expect(gradient.angle).toBe(90);
      expect(gradient.stops).toHaveLength(2);
      expect(gradient.stops[0].position).toBe(0);
      expect(gradient.stops[0].color).toBe("#ff0000");
      expect(gradient.stops[1].position).toBe(1);
      expect(gradient.stops[1].color).toBe("#0000ff");
    });

    it("should support multiple color stops", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 0.5, color: "#00ff00" },
        { position: 1, color: "#0000ff" },
      ];

      const gradient = generator.generateLinear(stops, 45);

      expect(gradient.stops).toHaveLength(3);
      expect(gradient.stops[1].position).toBe(0.5);
      expect(gradient.stops[1].color).toBe("#00ff00");
    });

    it("should normalize angle to 0-360 range", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      const gradient1 = generator.generateLinear(stops, 450);
      expect(gradient1.angle).toBe(90);

      const gradient2 = generator.generateLinear(stops, -90);
      expect(gradient2.angle).toBe(270);

      const gradient3 = generator.generateLinear(stops, 720);
      expect(gradient3.angle).toBe(0);
    });

    it("should accept angle of 0 (left to right)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      const gradient = generator.generateLinear(stops, 0);

      expect(gradient.angle).toBe(0);
    });

    it("should accept angle of 180 (right to left)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      const gradient = generator.generateLinear(stops, 180);

      expect(gradient.angle).toBe(180);
    });

    it("should accept various CSS color formats", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "rgb(255, 0, 0)" },
        { position: 0.5, color: "hsl(120, 100%, 50%)" },
        { position: 1, color: "#0000ff" },
      ];

      const gradient = generator.generateLinear(stops, 90);

      expect(gradient.stops).toHaveLength(3);
    });

    it("should throw error for less than 2 stops", () => {
      const stops: ColorStop[] = [{ position: 0, color: "#ff0000" }];

      expect(() => generator.generateLinear(stops, 90)).toThrow("Gradient must have at least 2 color stops");
    });

    it("should throw error for invalid color format", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "not-a-color" },
        { position: 1, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, 90)).toThrow(ColorParseError);
      expect(() => generator.generateLinear(stops, 90)).toThrow(/Invalid color at stop 0/);
    });

    it("should throw error for position outside 0-1 range", () => {
      const stops: ColorStop[] = [
        { position: -0.1, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, 90)).toThrow(/Invalid position at stop 0/);
      expect(() => generator.generateLinear(stops, 90)).toThrow(/Expected a number between 0 and 1/);
    });

    it("should throw error for position greater than 1", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1.5, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, 90)).toThrow(/Invalid position at stop 1/);
    });

    it("should throw error for non-numeric position", () => {
      const stops: ColorStop[] = [
        { position: NaN, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, 90)).toThrow(/Invalid position at stop 0/);
    });

    it("should throw error for stops not in ascending order", () => {
      const stops: ColorStop[] = [
        { position: 0.5, color: "#ff0000" },
        { position: 0.3, color: "#00ff00" },
        { position: 1, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, 90)).toThrow(/Color stops must be in ascending order/);
    });

    it("should allow stops with same position", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 0.5, color: "#00ff00" },
        { position: 0.5, color: "#0000ff" },
        { position: 1, color: "#ffff00" },
      ];

      const gradient = generator.generateLinear(stops, 90);

      expect(gradient.stops).toHaveLength(4);
    });

    it("should throw error for invalid angle (NaN)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, NaN)).toThrow(/Invalid angle/);
    });

    it("should throw error for invalid angle (Infinity)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, Infinity)).toThrow(/Invalid angle/);
    });

    it("should throw error for non-array stops", () => {
      expect(() => generator.generateLinear(null as any, 90)).toThrow("Stops must be an array");
    });

    it("should clone stops array (not mutate input)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      const gradient = generator.generateLinear(stops, 90);

      // Modify the gradient stops
      gradient.stops[0].color = "#00ff00";

      // Original should be unchanged
      expect(stops[0].color).toBe("#ff0000");
    });
  });

  describe("generateRadial", () => {
    it("should generate a valid radial gradient", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 0.5 };
      const radius = 0.5;

      const gradient = generator.generateRadial(stops, center, radius);

      expect(gradient.type).toBe("radial");
      expect(gradient.center.x).toBe(0.5);
      expect(gradient.center.y).toBe(0.5);
      expect(gradient.radius).toBe(0.5);
      expect(gradient.stops).toHaveLength(2);
    });

    it("should support multiple color stops", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 0.5, color: "#00ff00" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 0.5 };

      const gradient = generator.generateRadial(stops, center, 0.7);

      expect(gradient.stops).toHaveLength(3);
      expect(gradient.stops[1].position).toBe(0.5);
    });

    it("should accept center at top-left corner", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0, y: 0 };

      const gradient = generator.generateRadial(stops, center, 0.5);

      expect(gradient.center.x).toBe(0);
      expect(gradient.center.y).toBe(0);
    });

    it("should accept center at bottom-right corner", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 1, y: 1 };

      const gradient = generator.generateRadial(stops, center, 0.5);

      expect(gradient.center.x).toBe(1);
      expect(gradient.center.y).toBe(1);
    });

    it("should accept radius of 0", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 0.5 };

      const gradient = generator.generateRadial(stops, center, 0);

      expect(gradient.radius).toBe(0);
    });

    it("should accept radius of 1", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 0.5 };

      const gradient = generator.generateRadial(stops, center, 1);

      expect(gradient.radius).toBe(1);
    });

    it("should throw error for less than 2 stops", () => {
      const stops: ColorStop[] = [{ position: 0, color: "#ff0000" }];
      const center: Point = { x: 0.5, y: 0.5 };

      expect(() => generator.generateRadial(stops, center, 0.5)).toThrow("Gradient must have at least 2 color stops");
    });

    it("should throw error for invalid color format", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "invalid-color" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 0.5 };

      expect(() => generator.generateRadial(stops, center, 0.5)).toThrow(ColorParseError);
    });

    it("should throw error for center.x outside 0-1 range", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: -0.1, y: 0.5 };

      expect(() => generator.generateRadial(stops, center, 0.5)).toThrow(/Invalid center.x/);
    });

    it("should throw error for center.y outside 0-1 range", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 1.5 };

      expect(() => generator.generateRadial(stops, center, 0.5)).toThrow(/Invalid center.y/);
    });

    it("should throw error for radius outside 0-1 range", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 0.5 };

      expect(() => generator.generateRadial(stops, center, -0.1)).toThrow(/Invalid radius/);
      expect(() => generator.generateRadial(stops, center, 1.5)).toThrow(/Invalid radius/);
    });

    it("should throw error for invalid center (null)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      expect(() => generator.generateRadial(stops, null as any, 0.5)).toThrow(/Invalid center/);
    });

    it("should throw error for invalid center (missing x)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center = { y: 0.5 } as any;

      expect(() => generator.generateRadial(stops, center, 0.5)).toThrow(/Invalid center.x/);
    });

    it("should throw error for invalid center (missing y)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center = { x: 0.5 } as any;

      expect(() => generator.generateRadial(stops, center, 0.5)).toThrow(/Invalid center.y/);
    });

    it("should throw error for NaN radius", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 0.5 };

      expect(() => generator.generateRadial(stops, center, NaN)).toThrow(/Invalid radius/);
    });

    it("should throw error for Infinity radius", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 0.5 };

      expect(() => generator.generateRadial(stops, center, Infinity)).toThrow(/Invalid radius/);
    });

    it("should clone center and stops (not mutate input)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];
      const center: Point = { x: 0.5, y: 0.5 };

      const gradient = generator.generateRadial(stops, center, 0.5);

      // Modify the gradient
      gradient.center.x = 0.8;
      gradient.stops[0].color = "#00ff00";

      // Original should be unchanged
      expect(center.x).toBe(0.5);
      expect(stops[0].color).toBe("#ff0000");
    });
  });

  describe("stop position validation", () => {
    it("should validate stop positions are numbers", () => {
      const stops: ColorStop[] = [
        { position: "0" as any, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, 90)).toThrow(/Invalid position at stop 0/);
    });

    it("should validate stop positions are finite", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: Infinity, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, 90)).toThrow(/Invalid position at stop 1/);
    });

    it("should validate all stop colors are valid", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 0.5, color: "not-valid" },
        { position: 1, color: "#0000ff" },
      ];

      expect(() => generator.generateLinear(stops, 90)).toThrow(/Invalid color at stop 1/);
    });

    it("should accept stops at boundaries (0 and 1)", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 1, color: "#0000ff" },
      ];

      const gradient = generator.generateLinear(stops, 90);

      expect(gradient.stops[0].position).toBe(0);
      expect(gradient.stops[1].position).toBe(1);
    });

    it("should accept intermediate stop positions", () => {
      const stops: ColorStop[] = [
        { position: 0, color: "#ff0000" },
        { position: 0.25, color: "#ff8800" },
        { position: 0.5, color: "#ffff00" },
        { position: 0.75, color: "#00ff00" },
        { position: 1, color: "#0000ff" },
      ];

      const gradient = generator.generateLinear(stops, 90);

      expect(gradient.stops).toHaveLength(5);
    });
  });
});
