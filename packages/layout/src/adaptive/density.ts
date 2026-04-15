/**
 * Density Engine
 *
 * Adjust spacing and layout density based on content volume
 */

export type DensityLevel = "spacious" | "comfortable" | "compact";

/**
 * Get density level based on item count
 *
 * 3 bullets → lots of whitespace
 * 10 bullets → tighter spacing
 */
export function getDensityLevel(itemCount: number): DensityLevel {
  if (itemCount <= 3) return "spacious";
  if (itemCount <= 6) return "comfortable";
  return "compact";
}

/**
 * Get spacing multiplier for density level
 */
export function getSpacingMultiplier(density: DensityLevel): number {
  switch (density) {
    case "spacious":
      return 1.5;
    case "comfortable":
      return 1.0;
    case "compact":
      return 0.7;
  }
}

/**
 * Get gap size based on density and base spacing
 */
export function getDensityGap(baseGap: number, itemCount: number): number {
  const density = getDensityLevel(itemCount);
  const multiplier = getSpacingMultiplier(density);
  return Math.round(baseGap * multiplier);
}

/**
 * Calculate adaptive padding based on content density
 */
export function getAdaptivePadding(basePadding: number, contentVolume: number): number {
  if (contentVolume < 100) return basePadding;
  if (contentVolume < 500) return Math.round(basePadding * 0.9);
  if (contentVolume < 1000) return Math.round(basePadding * 0.8);
  return Math.round(basePadding * 0.7);
}

/**
 * Determine if content should use multi-column layout
 */
export function shouldUseMultiColumn(itemCount: number): boolean {
  return itemCount > 8;
}
