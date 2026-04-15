/**
 * Spacing Tokens
 *
 * 8px base unit scale for consistent spacing
 * Use these for padding, margin, gap
 */

export interface SpacingTokens {
  scale: number[];
  unit: number;
}

/**
 * Default spacing tokens (8px base unit)
 */
export const spacing: SpacingTokens = {
  unit: 8,

  // 0.5x, 1x, 2x, 3x, 4x, 6x, 8x
  scale: [4, 8, 16, 24, 32, 48, 64],
};

/**
 * Get spacing value by index
 */
export function getSpacing(index: number): number {
  return spacing.scale[index] ?? spacing.unit;
}

/**
 * Semantic spacing helpers
 */
export const spacingPresets = {
  tight: spacing.scale[1], // 8px
  normal: spacing.scale[2], // 16px
  relaxed: spacing.scale[3], // 24px
  loose: spacing.scale[4], // 32px
};
