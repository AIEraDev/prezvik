/**
 * ID Generation
 *
 * Generate unique IDs for Google Slides objects
 */

/**
 * Generate a unique ID
 *
 * Google Slides requires unique IDs for all objects
 * Using timestamp + random for simplicity
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `sf_${timestamp}_${random}`;
}
