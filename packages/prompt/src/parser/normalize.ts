/**
 * Normalization
 *
 * Clean and normalize extracted data
 */

/**
 * Normalize title (capitalize, clean)
 */
export function normalizeTitle(title: string): string {
  // Remove "create", "generate", "make" prefixes
  let normalized = title.replace(/^(create|generate|make|build)\s+/i, "");

  // Remove "a", "an" prefixes
  normalized = normalized.replace(/^(a|an)\s+/i, "");

  // Capitalize first letter
  normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return normalized.trim();
}

/**
 * Normalize company name
 */
export function normalizeCompanyName(name: string): string {
  return name.trim();
}
