/**
 * Overflow Handling
 *
 * VERY IMPORTANT: Prevent slides from becoming unreadable garbage
 * Controlled degradation instead of chaos
 */

/**
 * Enforce maximum number of items
 *
 * Without this → slides become unreadable garbage
 * With this → controlled degradation
 */
export function enforceMaxItems<T>(items: T[], max: number): (T | string)[] {
  if (items.length <= max) return items;

  return [...items.slice(0, max - 1), `+${items.length - (max - 1)} more`];
}

/**
 * Truncate text to maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Truncate each item in a list
 */
export function truncateItems(items: string[], maxLength: number): string[] {
  return items.map((item) => truncateText(item, maxLength));
}

/**
 * Smart truncation that preserves word boundaries
 */
export function smartTruncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Split long list into multiple columns
 */
export function splitIntoColumns<T>(items: T[], columnCount: number): T[][] {
  const itemsPerColumn = Math.ceil(items.length / columnCount);
  const columns: T[][] = [];

  for (let i = 0; i < columnCount; i++) {
    const start = i * itemsPerColumn;
    const end = start + itemsPerColumn;
    columns.push(items.slice(start, end));
  }

  return columns;
}

/**
 * Check if content exceeds reasonable limits
 */
export function isContentOverflowing(itemCount: number, totalLength: number, maxItems: number = 10, maxTotalLength: number = 1000): boolean {
  return itemCount > maxItems || totalLength > maxTotalLength;
}

/**
 * Get recommended max items based on slide type
 */
export function getMaxItemsForType(slideType: string): number {
  switch (slideType) {
    case "bullet-list":
      return 8;
    case "stat-trio":
      return 3;
    case "two-column":
      return 12;
    default:
      return 10;
  }
}
