/**
 * Information Extraction
 *
 * Crude but works - extract key info from prompt
 * Refine later based on real usage
 */

/**
 * Extract title from prompt
 */
export function extractTitle(prompt: string): string {
  // Try to get first sentence
  const firstSentence = prompt.split(/[.!?]/)[0];

  if (firstSentence && firstSentence.length > 0 && firstSentence.length < 100) {
    return firstSentence.trim();
  }

  // Fallback: first 50 chars
  return prompt.slice(0, 50).trim() || "Generated Deck";
}

/**
 * Extract keywords from prompt
 */
export function extractKeywords(prompt: string): string[] {
  // Simple word extraction (filter common words)
  const commonWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"]);

  return prompt
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word))
    .slice(0, 10);
}

/**
 * Extract company/product name
 */
export function extractCompanyName(prompt: string): string | undefined {
  // Look for patterns like "for X" or "about X"
  const forMatch = prompt.match(/for\s+([A-Z][a-zA-Z0-9\s]+?)(?:\s|$|,|\.)/);
  if (forMatch) {
    return forMatch[1].trim();
  }

  const aboutMatch = prompt.match(/about\s+([A-Z][a-zA-Z0-9\s]+?)(?:\s|$|,|\.)/);
  if (aboutMatch) {
    return aboutMatch[1].trim();
  }

  return undefined;
}
