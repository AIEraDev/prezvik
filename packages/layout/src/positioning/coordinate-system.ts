/**
 * Coordinate System
 *
 * Proper coordinate math for professional layouts
 * Handles conversion between different coordinate spaces
 */

import type { BoundingBox, AbsolutePosition, Size } from "./types";

/**
 * Standard slide dimensions (pixels at 96 DPI)
 */
export const SLIDE_DIMENSIONS = {
  width: 1920,
  height: 1080,
} as const;

/**
 * Convert percentage to absolute pixels
 */
export function percentToPixels(percent: number, dimension: "width" | "height"): number {
  const base = dimension === "width" ? SLIDE_DIMENSIONS.width : SLIDE_DIMENSIONS.height;
  return (percent / 100) * base;
}

/**
 * Convert pixels to percentage
 */
export function pixelsToPercent(pixels: number, dimension: "width" | "height"): number {
  const base = dimension === "width" ? SLIDE_DIMENSIONS.width : SLIDE_DIMENSIONS.height;
  return (pixels / base) * 100;
}

/**
 * Create bounding box from position and size
 */
export function createBox(x: number, y: number, width: number, height: number): BoundingBox {
  return { x, y, width, height };
}

/**
 * Get center point of a box
 */
export function getCenter(box: BoundingBox): AbsolutePosition {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}

/**
 * Check if two boxes overlap
 */
export function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return !(a.x + a.width < b.x || b.x + b.width < a.x || a.y + a.height < b.y || b.y + b.height < a.y);
}

/**
 * Get intersection of two boxes
 */
export function getIntersection(a: BoundingBox, b: BoundingBox): BoundingBox | null {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const width = Math.min(a.x + a.width, b.x + b.width) - x;
  const height = Math.min(a.y + a.height, b.y + b.height) - y;

  if (width <= 0 || height <= 0) return null;

  return { x, y, width, height };
}

/**
 * Constrain box within bounds
 */
export function constrainBox(box: BoundingBox, bounds: BoundingBox): BoundingBox {
  return {
    x: Math.max(bounds.x, Math.min(box.x, bounds.x + bounds.width - box.width)),
    y: Math.max(bounds.y, Math.min(box.y, bounds.y + bounds.height - box.height)),
    width: Math.min(box.width, bounds.width),
    height: Math.min(box.height, bounds.height),
  };
}

/**
 * Scale box by factor
 */
export function scaleBox(box: BoundingBox, scale: number): BoundingBox {
  return {
    x: box.x * scale,
    y: box.y * scale,
    width: box.width * scale,
    height: box.height * scale,
  };
}

/**
 * Translate box by offset
 */
export function translateBox(box: BoundingBox, dx: number, dy: number): BoundingBox {
  return {
    ...box,
    x: box.x + dx,
    y: box.y + dy,
  };
}

/**
 * Get box area
 */
export function getArea(box: BoundingBox): number {
  return box.width * box.height;
}

/**
 * Align box within container
 */
export function alignBox(box: Size, container: BoundingBox, horizontalAlign: "left" | "center" | "right" = "left", verticalAlign: "top" | "middle" | "bottom" = "top"): BoundingBox {
  let x = container.x;
  let y = container.y;

  // Horizontal alignment
  switch (horizontalAlign) {
    case "center":
      x = container.x + (container.width - box.width) / 2;
      break;
    case "right":
      x = container.x + container.width - box.width;
      break;
  }

  // Vertical alignment
  switch (verticalAlign) {
    case "middle":
      y = container.y + (container.height - box.height) / 2;
      break;
    case "bottom":
      y = container.y + container.height - box.height;
      break;
  }

  return {
    x,
    y,
    width: box.width,
    height: box.height,
  };
}
