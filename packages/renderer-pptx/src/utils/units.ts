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
 */
export function pctXtoIn(percent: number): number {
  return (percent / 100) * SLIDE_WIDTH_IN;
}

/**
 * Convert percentage to inches for Y axis (vertical)
 */
export function pctYtoIn(percent: number): number {
  return (percent / 100) * SLIDE_HEIGHT_IN;
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
