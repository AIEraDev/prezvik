/**
 * Unit Conversion
 *
 * Convert percentage coordinates to Google Slides points
 * Google Slides uses 72 DPI (points)
 */

// Slide dimensions in points (16:9 aspect ratio)
const SLIDE_WIDTH_PT = 720; // 10 inches * 72 DPI
const SLIDE_HEIGHT_PT = 405; // 5.625 inches * 72 DPI

/**
 * Convert percentage to points
 *
 * @param pct - Percentage value (0-100)
 * @param axis - Which axis (x uses width, y uses height)
 */
export function pctToPt(pct: number, axis: "x" | "y"): number {
  if (axis === "x") {
    return (pct / 100) * SLIDE_WIDTH_PT;
  } else {
    return (pct / 100) * SLIDE_HEIGHT_PT;
  }
}

/**
 * Convert points to percentage
 */
export function ptToPct(pt: number, axis: "x" | "y"): number {
  if (axis === "x") {
    return (pt / SLIDE_WIDTH_PT) * 100;
  } else {
    return (pt / SLIDE_HEIGHT_PT) * 100;
  }
}
