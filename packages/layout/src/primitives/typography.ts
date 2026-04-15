/**
 * Typography System
 *
 * Font scaling logic based on slide dimensions
 */

/**
 * Standard slide dimensions (16:9)
 */
export const STANDARD_WIDTH = 1920;
export const STANDARD_HEIGHT = 1080;

/**
 * Base font sizes at standard dimensions
 */
export const BaseFontSizes = {
  hero: 96,
  title: 72,
  h1: 72,
  h2: 56,
  h3: 40,
  body: 32,
  small: 24,
  tiny: 18,
} as const;

export type FontSizeKey = keyof typeof BaseFontSizes;

/**
 * Font weights
 */
export const FontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  black: 900,
} as const;

/**
 * Get base font size by key
 */
export function getFontSize(key: FontSizeKey): number {
  return BaseFontSizes[key];
}

/**
 * Calculate scaled font size based on slide dimensions
 */
export function scaleFontSize(baseFontSize: number, slideWidth: number, slideHeight: number = slideWidth * (9 / 16)): number {
  // Scale based on width (primary factor)
  const widthScale = slideWidth / STANDARD_WIDTH;

  // Scale based on height (secondary factor)
  const heightScale = slideHeight / STANDARD_HEIGHT;

  // Use geometric mean for balanced scaling
  const scale = Math.sqrt(widthScale * heightScale);

  return Math.round(baseFontSize * scale);
}

/**
 * Get font size by key, scaled to slide dimensions
 */
export function fontSize(key: FontSizeKey, slideWidth: number, slideHeight?: number): number {
  return scaleFontSize(BaseFontSizes[key], slideWidth, slideHeight);
}

/**
 * Calculate optimal font size for text to fit in a box
 */
export function fitText(text: string, maxWidth: number, maxHeight: number, minFontSize: number = 12, maxFontSize: number = 200): number {
  // Rough estimate: average character width is ~0.6 * fontSize
  // Average line height is ~1.5 * fontSize

  const charCount = text.length;
  const avgCharWidth = 0.6;

  // Calculate font size based on width constraint
  const fontSizeByWidth = maxWidth / (charCount * avgCharWidth);

  // Calculate font size based on height constraint (single line)
  const fontSizeByHeight = maxHeight / 1.5;

  // Use the smaller of the two
  const calculatedSize = Math.min(fontSizeByWidth, fontSizeByHeight);

  // Clamp to min/max
  return Math.max(minFontSize, Math.min(maxFontSize, Math.round(calculatedSize)));
}

/**
 * Calculate line height for a given font size
 */
export function getLineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.5);
}

/**
 * Estimate text width (rough approximation)
 */
export function estimateTextWidth(text: string, fontSize: number): number {
  // Average character width is ~0.6 * fontSize for most fonts
  return text.length * fontSize * 0.6;
}

/**
 * Estimate text height for multi-line text
 */
export function estimateTextHeight(text: string, fontSize: number, maxWidth: number): number {
  const lineHeight = getLineHeight(fontSize);
  const avgCharWidth = fontSize * 0.6;
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);
  const lineCount = Math.ceil(text.length / charsPerLine);

  return lineCount * lineHeight;
}
