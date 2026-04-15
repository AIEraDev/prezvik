/**
 * Clamp Utilities
 *
 * Prevents ugly extremes in sizing and spacing
 */

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp font size to readable range
 */
export function clampFontSize(fontSize: number): number {
  return clamp(fontSize, 12, 72);
}

/**
 * Clamp spacing to reasonable range
 */
export function clampSpacing(spacing: number): number {
  return clamp(spacing, 0, 16);
}

/**
 * Clamp gap to prevent too tight or too loose
 */
export function clampGap(gap: number): number {
  return clamp(gap, 1, 12);
}

/**
 * Clamp padding to prevent cramped or excessive whitespace
 */
export function clampPadding(padding: number): number {
  return clamp(padding, 2, 16);
}

/**
 * Round to nearest multiple (for grid snapping)
 */
export function roundToNearest(value: number, multiple: number): number {
  return Math.round(value / multiple) * multiple;
}
