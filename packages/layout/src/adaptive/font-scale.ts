/**
 * Font Scaling
 *
 * CRITICAL: Dynamically adjust font sizes based on content length
 * This is design intelligence
 */

/**
 * Scale font size based on text length
 *
 * Short text → BIG bold typography
 * Long text → compact readable
 */
export function scaleFontSize(baseFontSize: number, textLength: number): number {
  if (textLength < 50) return baseFontSize;
  if (textLength < 100) return Math.round(baseFontSize * 0.9);
  if (textLength < 200) return Math.round(baseFontSize * 0.8);
  return Math.round(baseFontSize * 0.7);
}

/**
 * Scale font size for title based on length
 */
export function scaleTitleFont(baseFontSize: number, titleLength: number): number {
  if (titleLength < 20) return baseFontSize;
  if (titleLength < 40) return Math.round(baseFontSize * 0.9);
  if (titleLength < 60) return Math.round(baseFontSize * 0.8);
  return Math.round(baseFontSize * 0.7);
}

/**
 * Scale font size for body text based on total content
 */
export function scaleBodyFont(baseFontSize: number, totalLength: number): number {
  if (totalLength < 200) return baseFontSize;
  if (totalLength < 400) return Math.round(baseFontSize * 0.95);
  if (totalLength < 800) return Math.round(baseFontSize * 0.9);
  return Math.round(baseFontSize * 0.85);
}

/**
 * Calculate optimal font size to fit text in a box
 */
export function fitFontSize(text: string, maxWidth: number, maxHeight: number, minFontSize: number = 12, maxFontSize: number = 200): number {
  // Binary search for optimal font size
  let low = minFontSize;
  let high = maxFontSize;
  let bestSize = minFontSize;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const avgCharWidth = mid * 0.6;
    const charsPerLine = Math.floor(maxWidth / avgCharWidth);
    const lineCount = Math.ceil(text.length / charsPerLine);
    const estimatedHeight = lineCount * mid * 1.5;

    if (estimatedHeight <= maxHeight) {
      bestSize = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestSize;
}
