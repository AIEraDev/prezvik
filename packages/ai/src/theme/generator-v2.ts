/**
 * AI Theme Generator v2
 *
 * Model-agnostic version using the adapter layer
 */

import { getRouter } from "../adapters/index.js";
import type { RoutingStrategy } from "../adapters/types.js";
import { buildThemePrompt } from "./prompt.js";
import { validateTheme } from "./validator.js";
import { normalizeTheme } from "./normalizer.js";

/**
 * Generate theme from description using AI
 */
export async function generateTheme(description: string, options: { provider?: string; strategy?: RoutingStrategy } = {}): Promise<any> {
  const router = getRouter();

  if (!router.hasAvailableAdapter()) {
    throw new Error("No LLM providers available. Set API keys for at least one provider.");
  }

  // Build prompt
  const prompt = buildThemePrompt(description);

  const request = {
    messages: [{ role: "user" as const, content: prompt }],
    temperature: 0.7,
    maxTokens: 1000,
  };

  // Use specified provider or smart routing (quality for theme generation)
  const response = options.provider ? await router.generate(options.provider, request) : await router.generateSmart(options.strategy || "quality", request);

  // Parse JSON
  let theme;
  try {
    theme = JSON.parse(response.text);
  } catch (error) {
    throw new Error("Failed to parse AI response as JSON");
  }

  // Validate
  validateTheme(theme);

  // Normalize
  return normalizeTheme(theme);
}

/**
 * Check if AI theme generation is available
 */
export function isThemeGenerationAvailable(): boolean {
  const router = getRouter();
  return router.hasAvailableAdapter();
}
