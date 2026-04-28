/**
 * Prezvik AI - Vercel AI SDK Implementation
 *
 * High-level AI interface using generateObject with Zod schemas
 * Eliminates manual JSON parsing and repair logic
 */

import { generateObject } from "ai";
import { openai, anthropic, groq, google } from "./providers/index.js";
import { getModelConfig, type Strategy } from "./model-router.js";
import { PrezVikBlueprintSchema, type PrezVikBlueprint } from "@prezvik/schema";
import { PrezVikThemeSchema, type PrezVikTheme } from "@prezvik/schema";
import { z } from "zod";

/**
 * Helper to get provider instance by name
 */
function getProviderInstance(providerName: string): any {
  const providers: Record<string, any> = {
    openai,
    anthropic,
    groq,
    google,
    gemini: google,
  };
  return providers[providerName] || openai;
}

export class PrezVikAI {
  /**
   * Generate slide deck blueprint using structured outputs
   * Returns validated PrezVikBlueprint directly - no manual parsing needed
   */
  async generateSlideDeck(prompt: string, options: { provider?: string; strategy?: Strategy; temperature?: number; maxTokens?: number; timeout?: number } = {}): Promise<PrezVikBlueprint> {
    const strategy = options.strategy || "speed";
    const modelConfig = getModelConfig("blueprint", strategy, options.provider);
    const timeout = options.timeout || 30000;

    console.log(`      [PrezVikAI.generateSlideDeck] Task: blueprint, strategy: ${strategy}, provider: ${modelConfig.provider}, model: ${modelConfig.model}`);

    const providerInstance = getProviderInstance(modelConfig.provider);

    const startTime = Date.now();
    const { object } = await generateObject({
      model: providerInstance(modelConfig.model),
      schema: PrezVikBlueprintSchema,
      system: `You are a presentation expert. Generate structured slide content following the Blueprint schema.

Rules:
- Each slide must have a unique ID, type, intent, layout, and content array
- Content blocks must use the discriminated union pattern (type field determines structure)
- Valid slide types: hero, section, content, comparison, grid, quote, data, callout, closing
- Valid layouts: center_focus, two_column, three_column, split_screen, grid_2x2, hero_overlay, timeline, stat_highlight, image_dominant
- Content emphasis: "low" | "medium" | "high"
- Version must be "2.0"`,
      prompt,
      temperature: options.temperature ?? modelConfig.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? modelConfig.maxTokens ?? 4000,
      // @ts-ignore
      abortSignal: AbortSignal.timeout(timeout),
    });

    const duration = Date.now() - startTime;
    console.log(`      [PrezVikAI.generateSlideDeck] SUCCESS in ${duration}ms, slides: ${object.slides?.length || 0}`);

    return object as PrezVikBlueprint;
  }

  /**
   * Enhance slide content with structured output
   */
  async enhanceContent(content: string, options: { provider?: string; strategy?: Strategy; temperature?: number; maxTokens?: number } = {}): Promise<{ enhanced: string; improvements: string[] }> {
    const strategy = options.strategy || "balanced";
    const modelConfig = getModelConfig("enhance", strategy, options.provider);
    const providerInstance = getProviderInstance(modelConfig.provider);

    console.log(`      [PrezVikAI.enhanceContent] provider: ${modelConfig.provider}, model: ${modelConfig.model}`);

    const EnhancementSchema = z.object({
      enhanced: z.string().describe("The improved slide content"),
      improvements: z.array(z.string()).describe("List of specific improvements made"),
    });

    const { object } = await generateObject({
      model: providerInstance(modelConfig.model),
      schema: EnhancementSchema,
      system: "You are a presentation expert. Improve slide content for clarity, impact, and engagement.",
      prompt: `Enhance this slide content:\n\n${content}`,
      temperature: options.temperature ?? modelConfig.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? modelConfig.maxTokens ?? 500,
    });

    return object as { enhanced: string; improvements: string[] };
  }

  /**
   * Generate theme from description using structured outputs
   * Returns validated PrezVikTheme directly - no manual parsing needed
   */
  async generateTheme(description: string, options: { provider?: string; strategy?: Strategy; temperature?: number; maxTokens?: number } = {}): Promise<PrezVikTheme> {
    const strategy = options.strategy || "speed";
    const modelConfig = getModelConfig("theme", strategy, options.provider);
    const providerInstance = getProviderInstance(modelConfig.provider);

    console.log(`      [PrezVikAI.generateTheme] Task: theme, strategy: ${strategy}, provider: ${modelConfig.provider}, model: ${modelConfig.model}`);

    const startTime = Date.now();
    const { object } = await generateObject({
      model: providerInstance(modelConfig.model),
      schema: PrezVikThemeSchema,
      system: `You are a design system expert. Generate a complete theme following the Theme schema.

Guidelines:
- Use 6-digit hex colors without # prefix (e.g., "FF5733")
- Typography scale: hero (24-120pt), h1 (20-80pt), h2 (16-60pt), h3 (14-48pt), body (10-32pt), caption (8-18pt)
- Mood options: bold, minimal, corporate, playful, luxury, academic, tech, creative, elegant
- Spacing scale: xs, sm, md, lg, xl, 2xl, 3xl (in points)
- Motion defaultEntrance: fade, slide, zoom, scale, none
- Include all required fields: id, name, version, mood, colorSystem, typography, spacing, radii, layout, media, icons`,
      prompt: `Generate a theme for: ${description}\n\nCreate a complete design system with colors, typography, spacing, and visual effects.`,
      temperature: options.temperature ?? modelConfig.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? modelConfig.maxTokens ?? 1000,
    });

    const duration = Date.now() - startTime;
    console.log(`      [PrezVikAI.generateTheme] SUCCESS in ${duration}ms`);

    return object as PrezVikTheme;
  }

  /**
   * Summarize text with structured output
   */
  async summarize(text: string, maxLength: number = 100, options: { provider?: string; strategy?: Strategy; temperature?: number; maxTokens?: number } = {}): Promise<{ summary: string; keyPoints: string[] }> {
    const strategy = options.strategy || "speed";
    const modelConfig = getModelConfig("summarize", strategy, options.provider);
    const providerInstance = getProviderInstance(modelConfig.provider);

    const SummarySchema = z.object({
      summary: z.string().max(maxLength).describe(`Summary in ${maxLength} characters or less`),
      keyPoints: z.array(z.string()).describe("Key points extracted from the text"),
    });

    const { object } = await generateObject<typeof SummarySchema._type>({
      model: providerInstance(modelConfig.model),
      schema: SummarySchema,
      prompt: `Summarize this text:\n\n${text}\n\nProvide a summary within ${maxLength} characters and list key points.`,
      temperature: options.temperature ?? modelConfig.temperature ?? 0.5,
      maxTokens: options.maxTokens ?? modelConfig.maxTokens ?? 200,
    });

    return object;
  }

  /**
   * Score content quality with structured output
   */
  async scoreContent(text: string, options: { provider?: string; strategy?: Strategy; temperature?: number; maxTokens?: number } = {}): Promise<{ score: number; feedback: string; suggestions: string[] }> {
    const strategy = options.strategy || "balanced";
    const modelConfig = getModelConfig("score", strategy, options.provider);
    const providerInstance = getProviderInstance(modelConfig.provider);

    const ScoreSchema = z.object({
      score: z.number().min(1).max(10).describe("Quality score from 1-10"),
      feedback: z.string().describe("Brief feedback on the content quality"),
      suggestions: z.array(z.string()).describe("Specific suggestions for improvement"),
    });

    const { object } = await generateObject<typeof ScoreSchema._type>({
      model: providerInstance(modelConfig.model),
      schema: ScoreSchema,
      prompt: `Score this presentation text for quality:\n\n"${text}"\n\nProvide a score (1-10), feedback, and improvement suggestions.`,
      temperature: options.temperature ?? modelConfig.temperature ?? 0.3,
      maxTokens: options.maxTokens ?? modelConfig.maxTokens ?? 200,
    });

    return object;
  }

  /**
   * Get an AI SDK model instance for direct use with generateObject/generateText
   */
  getModel(provider?: string, strategy?: string): any {
    if (strategy === "theme") return groq("llama-3.1-8b-instant");
    if (strategy === "balanced") return google("gemini-2.5-flash");
    if (provider === "groq" || !provider || strategy === "speed") return groq("llama-3.3-70b-versatile");
    const providerInstance = getProviderInstance(provider);
    return providerInstance("llama-3.3-70b-versatile");
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): string[] {
    const providers: string[] = [];
    if (process.env.OPENAI_API_KEY) providers.push("openai");
    if (process.env.ANTHROPIC_API_KEY) providers.push("anthropic");
    if (process.env.GROQ_API_KEY) providers.push("groq");
    if (process.env.GEMINI_API_KEY) providers.push("gemini");
    console.log(`      [PrezVikAI.getAvailableProviders] Found: ${providers.join(", ") || "none"}`);
    return providers;
  }

  /**
   * Check if any provider is available
   */
  isAvailable(): boolean {
    return this.getAvailableProviders().length > 0;
  }

  /**
   * Set default provider (no-op in Vercel SDK - provider selected per call)
   */
  setDefaultProvider(_name: string): void {
    // Vercel SDK selects provider per call, so this is deprecated
    console.warn("setDefaultProvider is deprecated with Vercel AI SDK - select provider per call instead");
  }
}

/**
 * Global instance
 */
let globalPrezVikAI: PrezVikAI | null = null;

/**
 * Get global Prezvik AI instance
 */
export function getPrezVikAI(): PrezVikAI {
  if (!globalPrezVikAI) {
    console.log("      [PrezVikAI] Creating new global instance");
    globalPrezVikAI = new PrezVikAI();
  } else {
    console.log("      [PrezVikAI] Reusing existing global instance");
  }
  return globalPrezVikAI;
}
