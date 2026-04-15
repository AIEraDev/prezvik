/**
 * Z-Index Management
 *
 * Proper layering for overlapping elements
 */

/**
 * Standard z-index layers
 */
export const Z_INDEX = {
  background: 0,
  content: 10,
  overlay: 20,
  modal: 30,
  tooltip: 40,
} as const;

export type ZLayer = keyof typeof Z_INDEX;

/**
 * Get z-index for layer
 */
export function getZIndex(layer: ZLayer): number {
  return Z_INDEX[layer];
}

/**
 * Sort elements by z-index (ascending)
 */
export function sortByZIndex<T extends { zIndex?: number }>(elements: T[]): T[] {
  return [...elements].sort((a, b) => {
    const zA = a.zIndex ?? Z_INDEX.content;
    const zB = b.zIndex ?? Z_INDEX.content;
    return zA - zB;
  });
}
