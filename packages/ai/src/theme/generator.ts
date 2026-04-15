/**
 * AI Theme Generator
 *
 * Turn natural language → design tokens
 */

import OpenAI from "openai";
import { buildThemePrompt } from "./prompt.js";
import { validateTheme } from "./validator.js";
import { normalizeTheme } from "./normalizer.js";

/**
 * Generate theme from description using AI
 */
export async function generateTheme(description: string): Promise<any> {
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Build prompt
  const prompt = buildThemePrompt(description);

  // Call OpenAI
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  // Parse JSON
  let theme;
  try {
    theme = JSON.parse(content);
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
  return !!process.env.OPENAI_API_KEY;
}
