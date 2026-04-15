/**
 * Content Rewriter v2
 *
 * Model-agnostic version using the adapter layer
 */

import { getRouter } from "../adapters/index.js";
import type { RoutingStrategy } from "../adapters/types.js";

/**
 * Rewrite text for clarity and impact
 */
export async function rewriteText(text: string, options: { provider?: string; strategy?: RoutingStrategy } = {}): Promise<string> {
  const router = getRouter();

  if (!router.hasAvailableAdapter()) {
    throw new Error("No LLM providers available. Set API keys for at least one provider (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GROQ_API_KEY).");
  }

  const prompt = `Rewrite this text for a professional presentation slide.
Make it clear, concise, and impactful. Keep it under 100 characters if possible.

Original: "${text}"

Return ONLY the rewritten text, no explanation.`;

  const request = {
    messages: [{ role: "user" as const, content: prompt }],
    temperature: 0.7,
    maxTokens: 100,
  };

  // Use specified provider or smart routing
  const response = options.provider ? await router.generate(options.provider, request) : await router.generateSmart(options.strategy || "balanced", request);

  return response.text || text;
}

/**
 * Rewrite multiple texts in parallel
 */
export async function rewriteTexts(texts: string[], options: { provider?: string; strategy?: RoutingStrategy } = {}): Promise<string[]> {
  return Promise.all(texts.map((text) => rewriteText(text, options)));
}
