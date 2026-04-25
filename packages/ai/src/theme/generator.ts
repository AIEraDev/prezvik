/**
 * AI Theme Generator
 *
 * Uses generateObject with Zod schema for structured outputs
 * Eliminates manual JSON parsing and validation
 */

import { generateObject } from "ai";
import { openai, anthropic, groq, google } from "../providers/index.js";
import { KyroThemeSchema, type KyroTheme } from "@kyro/schema";
import { getModelConfig } from "../model-router.js";
import { normalizeTheme } from "./normalizer.js";

/**
 * Generate theme from description using structured outputs
 * Returns validated KyroTheme directly - no manual parsing needed
 */
export async function generateTheme(description: string, options: { provider?: string; strategy?: "speed" | "balanced" | "quality" } = {}): Promise<KyroTheme> {
  const strategy = options.strategy || "speed";
  const modelConfig = getModelConfig("theme", strategy, options.provider);

  // Get provider instance
  const providers: Record<string, any> = { openai, anthropic, groq, google, gemini: google };
  const provider = providers[modelConfig.provider] || groq;

  console.log(`  [ThemeGenerator] Using ${modelConfig.provider} with ${modelConfig.model} (${strategy} strategy)`);

  const startTime = Date.now();
  const { object } = await generateObject({
    model: provider(modelConfig.model),
    schema: KyroThemeSchema,
    system: `You are a design system expert. Generate a complete theme following the Theme schema.

Guidelines:
- Use 6-digit hex colors without # prefix (e.g., "FF5733")
- Typography scale: hero (24-120pt), h1 (20-80pt), h2 (16-60pt), h3 (14-48pt), body (10-32pt), caption (8-18pt)
- Mood options: bold, minimal, corporate, playful, luxury, academic, tech, creative, elegant
- Spacing scale: xs, sm, md, lg, xl, 2xl, 3xl (in points)
- Motion defaultEntrance: fade, slide, zoom, scale, none
- Include all required fields: id, name, version ("1.0"), mood, colorSystem, typography, spacing, radii, layout, media, icons`,
    prompt: `Generate a complete design system theme for: ${description}\n\nCreate a comprehensive theme with colors, typography, spacing, and visual effects that matches the described aesthetic.`,
    temperature: modelConfig.temperature ?? 0.7,
    maxTokens: modelConfig.maxTokens ?? 1000,
  });

  const duration = Date.now() - startTime;
  console.log(`  [ThemeGenerator] Generated theme in ${duration}ms`);

  // Normalize theme (apply any additional transformations)
  return normalizeTheme(object as KyroTheme);
}

/**
 * Check if AI theme generation is available
 */
export function isThemeGenerationAvailable(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY);
}
