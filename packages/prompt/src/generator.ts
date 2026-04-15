/**
 * Deck Generator from Prompt
 *
 * Main entry point: Prompt → DeckSchema
 * Template-driven (v1) - fast and deterministic
 */

import { detectIntent } from "./parser/intent.js";
import { extractTitle, extractCompanyName } from "./parser/extract.js";
import { normalizeTitle, normalizeCompanyName } from "./parser/normalize.js";
import { pitchTemplate } from "./templates/pitch.js";
import { reportTemplate } from "./templates/report.js";
import { educationalTemplate } from "./templates/educational.js";

/**
 * Generate deck schema from natural language prompt
 *
 * Pipeline: Prompt → Intent → Extract → Template → DeckSchema
 */
export function generateDeckFromPrompt(prompt: string): any {
  // 1. Detect intent
  const intent = detectIntent(prompt);

  // 2. Extract information
  const rawTitle = extractTitle(prompt);
  const title = normalizeTitle(rawTitle);
  const companyName = extractCompanyName(prompt);

  // 3. Select and apply template
  switch (intent) {
    case "pitch":
      return pitchTemplate({
        title,
        companyName: companyName ? normalizeCompanyName(companyName) : undefined,
      });

    case "report":
      return reportTemplate({
        title,
      });

    case "educational":
      return educationalTemplate({
        title,
      });

    case "general":
    default:
      // Fallback to pitch template
      return pitchTemplate({
        title,
        companyName: companyName ? normalizeCompanyName(companyName) : undefined,
      });
  }
}

/**
 * Generate deck with custom options
 */
export function generateDeckFromPromptWithOptions(
  prompt: string,
  options?: {
    theme?: string;
    slideCount?: number;
  },
): any {
  const deck = generateDeckFromPrompt(prompt);

  // Apply options
  if (options?.theme) {
    deck.meta.theme = options.theme;
  }

  if (options?.slideCount && deck.slides.length > options.slideCount) {
    deck.slides = deck.slides.slice(0, options.slideCount);
  }

  return deck;
}
