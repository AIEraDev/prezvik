/**
 * Alignment Engine
 *
 * Handles alignment of content within containers
 */

export type Align = "start" | "center" | "end";
export type Justify = "start" | "center" | "end" | "space-between" | "space-around";

/**
 * Apply alignment to a value within a container
 *
 * @param value - Size of the content
 * @param container - Size of the container
 * @param align - Alignment type
 * @returns Offset from start
 */
export function applyAlignment(value: number, container: number, align: Align): number {
  switch (align) {
    case "center":
      return (container - value) / 2;
    case "end":
      return container - value;
    case "start":
    default:
      return 0;
  }
}

/**
 * Calculate positions for justified content
 *
 * @param itemCount - Number of items
 * @param containerSize - Size of container
 * @param itemSize - Size of each item
 * @param justify - Justification type
 * @returns Array of offsets for each item
 */
export function applyJustification(itemCount: number, containerSize: number, itemSize: number, justify: Justify): number[] {
  const totalItemSize = itemSize * itemCount;
  const remainingSpace = containerSize - totalItemSize;

  switch (justify) {
    case "center": {
      const offset = remainingSpace / 2;
      return Array.from({ length: itemCount }, (_, i) => offset + i * itemSize);
    }

    case "end": {
      return Array.from({ length: itemCount }, (_, i) => remainingSpace + i * itemSize);
    }

    case "space-between": {
      if (itemCount === 1) return [0];
      const gap = remainingSpace / (itemCount - 1);
      return Array.from({ length: itemCount }, (_, i) => i * (itemSize + gap));
    }

    case "space-around": {
      const gap = remainingSpace / itemCount;
      return Array.from({ length: itemCount }, (_, i) => gap / 2 + i * (itemSize + gap));
    }

    case "start":
    default:
      return Array.from({ length: itemCount }, (_, i) => i * itemSize);
  }
}
