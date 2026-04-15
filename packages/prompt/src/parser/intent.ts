/**
 * Intent Detection
 *
 * Simple keyword-based detection (80% accuracy is enough to start)
 * No ML needed - just pattern matching
 */

export type Intent = "pitch" | "report" | "educational" | "general";

/**
 * Detect intent from prompt
 */
export function detectIntent(prompt: string): Intent {
  const p = prompt.toLowerCase();

  // Pitch deck patterns
  if (p.includes("pitch") || p.includes("investor") || p.includes("funding") || p.includes("startup")) {
    return "pitch";
  }

  // Report patterns
  if (p.includes("report") || p.includes("quarterly") || p.includes("annual") || p.includes("summary")) {
    return "report";
  }

  // Educational patterns
  if (p.includes("teach") || p.includes("explain") || p.includes("tutorial") || p.includes("learn") || p.includes("course")) {
    return "educational";
  }

  return "general";
}
