/**
 * Text Measurement
 *
 * Approximation engine for text dimensions
 * We don't need perfect measurement - we need consistent heuristics
 */

/**
 * Estimate text length (character count)
 */
export function estimateTextLength(text: string): number {
  return text.length;
}

/**
 * Estimate line count based on max characters per line
 */
export function estimateLineCount(text: string, maxCharsPerLine: number): number {
  return Math.ceil(text.length / maxCharsPerLine);
}

/**
 * Estimate text width in pixels (rough approximation)
 * Average character width is ~0.6 * fontSize for most fonts
 */
export function estimateTextWidth(text: string, fontSize: number): number {
  const avgCharWidth = fontSize * 0.6;
  return text.length * avgCharWidth;
}

/**
 * Estimate text height for multi-line text
 */
export function estimateTextHeight(text: string, fontSize: number, maxWidth: number, lineHeight: number = 1.5): number {
  const avgCharWidth = fontSize * 0.6;
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  const lineCount = Math.ceil(text.length / charsPerLine);

  return lineCount * fontSize * lineHeight;
}

/**
 * Check if text will fit in a box
 */
export function willTextFit(text: string, fontSize: number, maxWidth: number, maxHeight: number): boolean {
  const estimatedHeight = estimateTextHeight(text, fontSize, maxWidth);
  return estimatedHeight <= maxHeight;
}

/**
 * Calculate total content length for multiple text items
 */
export function totalContentLength(items: string[]): number {
  return items.reduce((sum, item) => sum + item.length, 0);
}
