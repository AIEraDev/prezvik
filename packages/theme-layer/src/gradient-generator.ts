/**
 * GradientGenerator
 *
 * Creates linear and radial gradient definitions with configurable stops.
 * Validates color formats and stop positions for use in visual generation.
 */

import { parse } from "culori";
import { ColorParseError } from "./errors/color-parse-error.js";

/**
 * Point in 2D space with normalized coordinates (0-1)
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Color stop with position and color
 */
export interface ColorStop {
  /** Position along gradient (0-1 range) */
  position: number;
  /** Color in any CSS Color Level 4 format */
  color: string;
}

/**
 * Linear gradient definition
 */
export interface LinearGradient {
  type: "linear";
  /** Gradient angle in degrees (0 = left to right, 90 = bottom to top) */
  angle: number;
  /** Array of color stops */
  stops: ColorStop[];
}

/**
 * Radial gradient definition
 */
export interface RadialGradient {
  type: "radial";
  /** Center point in normalized coordinates (0-1) */
  center: Point;
  /** Radius in normalized units (0-1) */
  radius: number;
  /** Array of color stops */
  stops: ColorStop[];
}

/**
 * GradientGenerator class
 *
 * Provides methods for generating linear and radial gradient definitions
 * with validation of color formats and stop positions.
 */
export class GradientGenerator {
  /**
   * Generate a linear gradient definition
   *
   * @param stops - Array of color stops with positions (0-1)
   * @param angle - Gradient angle in degrees (0 = left to right)
   * @returns LinearGradient definition
   * @throws Error if stops are invalid or colors cannot be parsed
   */
  generateLinear(stops: ColorStop[], angle: number): LinearGradient {
    // Validate stops
    this.validateStops(stops);

    // Validate angle
    if (typeof angle !== "number" || !isFinite(angle)) {
      throw new Error(`Invalid angle: ${angle}. Expected a finite number.`);
    }

    // Normalize angle to 0-360 range
    const normalizedAngle = ((angle % 360) + 360) % 360;

    return {
      type: "linear",
      angle: normalizedAngle,
      stops: stops.map((stop) => ({ ...stop })), // Clone stops
    };
  }

  /**
   * Generate a radial gradient definition
   *
   * @param stops - Array of color stops with positions (0-1)
   * @param center - Center point {x, y} in normalized coordinates (0-1)
   * @param radius - Radius in normalized units (0-1)
   * @returns RadialGradient definition
   * @throws Error if stops, center, or radius are invalid
   */
  generateRadial(stops: ColorStop[], center: Point, radius: number): RadialGradient {
    // Validate stops
    this.validateStops(stops);

    // Validate center
    this.validatePoint(center, "center");

    // Validate radius
    if (typeof radius !== "number" || !isFinite(radius) || radius < 0 || radius > 1) {
      throw new Error(`Invalid radius: ${radius}. Expected a number between 0 and 1.`);
    }

    return {
      type: "radial",
      center: { ...center }, // Clone center
      radius,
      stops: stops.map((stop) => ({ ...stop })), // Clone stops
    };
  }

  /**
   * Validate an array of color stops
   *
   * @param stops - Array of color stops to validate
   * @throws Error if stops are invalid
   */
  private validateStops(stops: ColorStop[]): void {
    if (!Array.isArray(stops)) {
      throw new Error("Stops must be an array");
    }

    if (stops.length < 2) {
      throw new Error("Gradient must have at least 2 color stops");
    }

    // Validate each stop
    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];

      // Validate position
      if (typeof stop.position !== "number" || !isFinite(stop.position)) {
        throw new Error(`Invalid position at stop ${i}: ${stop.position}. Expected a finite number.`);
      }

      if (stop.position < 0 || stop.position > 1) {
        throw new Error(`Invalid position at stop ${i}: ${stop.position}. Expected a number between 0 and 1.`);
      }

      // Validate color
      const parsed = parse(stop.color);
      if (!parsed) {
        throw new ColorParseError(`Invalid color at stop ${i}: "${stop.color}". Expected a valid CSS color.`);
      }
    }

    // Validate stop ordering (positions should be in ascending order)
    for (let i = 1; i < stops.length; i++) {
      if (stops[i].position < stops[i - 1].position) {
        throw new Error(`Color stops must be in ascending order by position. Stop ${i} (${stops[i].position}) is before stop ${i - 1} (${stops[i - 1].position}).`);
      }
    }
  }

  /**
   * Validate a point with normalized coordinates
   *
   * @param point - Point to validate
   * @param fieldName - Name of the field for error messages
   * @throws Error if point is invalid
   */
  private validatePoint(point: Point, fieldName: string): void {
    if (!point || typeof point !== "object") {
      throw new Error(`Invalid ${fieldName}: expected an object with x and y properties`);
    }

    if (typeof point.x !== "number" || !isFinite(point.x) || point.x < 0 || point.x > 1) {
      throw new Error(`Invalid ${fieldName}.x: ${point.x}. Expected a number between 0 and 1.`);
    }

    if (typeof point.y !== "number" || !isFinite(point.y) || point.y < 0 || point.y > 1) {
      throw new Error(`Invalid ${fieldName}.y: ${point.y}. Expected a number between 0 and 1.`);
    }
  }
}
