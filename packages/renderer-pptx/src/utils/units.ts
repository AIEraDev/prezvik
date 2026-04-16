/**
 * Unit Conversion - FIXED
 *
 * CRITICAL: Separate X and Y axis conversion
 * v0 bug: used width for both axes, distorting vertical by 1.78×
 */

// PowerPoint dimensions for LAYOUT_WIDE (16:9)
const SLIDE_WIDTH_IN = 10;
const SLIDE_HEIGHT_IN = 5.625;

/**
 * Convert percentage to inches for X axis (horizontal)
 * Rounds to 4 decimal places to prevent floating point precision issues
 */
export function pctXtoIn(percent: number): number {
  return Math.round((percent / 100) * SLIDE_WIDTH_IN * 10000) / 10000;
}

/**
 * Convert percentage to inches for Y axis (vertical)
 * Rounds to 4 decimal places to prevent floating point precision issues
 */
export function pctYtoIn(percent: number): number {
  return Math.round((percent / 100) * SLIDE_HEIGHT_IN * 10000) / 10000;
}

/**
 * Get slide dimensions in inches
 */
export function getSlideDimensions() {
  return {
    width: SLIDE_WIDTH_IN,
    height: SLIDE_HEIGHT_IN,
  };
}

/**
 * Convert inches to percentage for X axis
 */
export function inToPctX(inches: number): number {
  return (inches / SLIDE_WIDTH_IN) * 100;
}

/**
 * Convert inches to percentage for Y axis
 */
export function inToPctY(inches: number): number {
  return (inches / SLIDE_HEIGHT_IN) * 100;
}
