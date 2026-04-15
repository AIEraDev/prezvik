/**
 * Spacing Engine
 *
 * Professional spacing calculations
 * This is what makes layouts feel polished
 */

import type { BoundingBox, Padding, Margin } from "./types";

/**
 * Standard spacing scale (8px base unit)
 */
export const SPACING_SCALE = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
  "4xl": 96,
} as const;

export type SpacingSize = keyof typeof SPACING_SCALE;

/**
 * Get spacing value
 */
export function getSpacing(size: SpacingSize): number {
  return SPACING_SCALE[size];
}

/**
 * Create uniform padding
 */
export function createPadding(value: number): Padding {
  return {
    top: value,
    right: value,
    bottom: value,
    left: value,
  };
}

/**
 * Create padding from individual values
 */
export function createPaddingFrom(top: number, right: number, bottom: number, left: number): Padding {
  return { top, right, bottom, left };
}

/**
 * Create uniform margin
 */
export function createMargin(value: number): Margin {
  return {
    top: value,
    right: value,
    bottom: value,
    left: value,
  };
}

/**
 * Apply padding to box (shrinks content area)
 */
export function applyPadding(box: BoundingBox, padding: Padding): BoundingBox {
  return {
    x: box.x + padding.left,
    y: box.y + padding.top,
    width: box.width - padding.left - padding.right,
    height: box.height - padding.top - padding.bottom,
  };
}

/**
 * Apply margin to box (expands outer area)
 */
export function applyMargin(box: BoundingBox, margin: Margin): BoundingBox {
  return {
    x: box.x - margin.left,
    y: box.y - margin.top,
    width: box.width + margin.left + margin.right,
    height: box.height + margin.top + margin.bottom,
  };
}

/**
 * Calculate optimal gap based on content density
 */
export function calculateOptimalGap(itemCount: number, availableSpace: number, minGap: number = 8, maxGap: number = 48): number {
  // More items = tighter spacing
  if (itemCount <= 2) return maxGap;
  if (itemCount <= 4) return Math.round(maxGap * 0.75);
  if (itemCount <= 6) return Math.round(maxGap * 0.5);

  // Calculate based on available space
  const calculatedGap = availableSpace / (itemCount + 1);
  return Math.max(minGap, Math.min(maxGap, calculatedGap));
}

/**
 * Distribute space evenly between items
 */
export function distributeSpace(totalSpace: number, itemCount: number, itemSizes: number[]): number[] {
  const totalItemSize = itemSizes.reduce((sum, size) => sum + size, 0);
  const remainingSpace = totalSpace - totalItemSize;
  const gapCount = itemCount - 1;

  if (gapCount <= 0) return [];

  const gap = remainingSpace / gapCount;
  return Array(gapCount).fill(gap);
}
