/**
 * ThemeAgent - AI-driven theme generation
 *
 * Uses AI to generate ThemeSpec based on blueprint content and user preferences.
 * Falls back to static themes if AI generation fails.
 */

import type { Blueprint } from "@prezvik/schema";
import type { ThemeSpec } from "./theme-spec.js";
import { buildStaticThemeSpec } from "./static-themes.js";
import { z } from "zod";

export interface ThemeGenerationOptions {
  provider?: string;
  temperature?: number;
  fallbackTheme?: string;
}

// Zod schema for AI-generated theme
const ThemeSpecSchema = z.object({
  palette: z.object({
    primary: z.string().regex(/^[0-9A-Fa-f]{6}$/, "Must be 6-digit hex without #"),
    secondary: z.string().regex(/^[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^[0-9A-Fa-f]{6}$/),
    lightBg: z.string().regex(/^[0-9A-Fa-f]{6}$/),
    darkBg: z.string().regex(/^[0-9A-Fa-f]{6}$/),
    textOnDark: z.string().regex(/^[0-9A-Fa-f]{6}$/),
    textOnLight: z.string().regex(/^[0-9A-Fa-f]{6}$/),
    mutedOnDark: z.string().regex(/^[0-9A-Fa-f]{6}$/),
    mutedOnLight: z.string().regex(/^[0-9A-Fa-f]{6}$/),
  }),
  typography: z.object({
    displayFont: z.string(),
    bodyFont: z.string(),
  }),
  slideRhythm: z.array(
    z.object({
      slideId: z.string(),
      backgroundMode: z.enum(["dark", "light"]),
      accentColor: z.string().regex(/^[0-9A-Fa-f]{6}$/),
      headerStyle: z.enum(["band", "none"]),
      decorations: z.array(
        z.discriminatedUnion("kind", [
          z.object({
            kind: z.literal("left-bar"),
            color: z.string().regex(/^[0-9A-Fa-f]{6}$/),
            width: z.number().min(0.05).max(1),
          }),
          z.object({
            kind: z.literal("oval"),
            x: z.number(),
            y: z.number(),
            w: z.number().positive(),
            h: z.number().positive(),
            color: z.string().regex(/^[0-9A-Fa-f]{6}$/),
            opacity: z.number().min(0).max(1),
          }),
          z.object({
            kind: z.literal("bottom-bar"),
            color: z.string().regex(/^[0-9A-Fa-f]{6}$/),
            height: z.number().min(0.1).max(1),
          }),
          z.object({
            kind: z.literal("corner-accent"),
            position: z.enum(["top-right", "top-left"]),
            color: z.string().regex(/^[0-9A-Fa-f]{6}$/),
          }),
          z.object({
            kind: z.literal("geometric-split"),
            colors: z.array(z.string().regex(/^[0-9A-Fa-f]{6}$/)).length(5),
          }),
        ]),
      ),
    }),
  ),
});

export class ThemeAgent {
  /**
   * Generate a ThemeSpec using AI or fall back to static themes
   */
  async generateTheme(blueprint: Blueprint, options: ThemeGenerationOptions = {}): Promise<ThemeSpec> {
    const { fallbackTheme = "executive" } = options;

    try {
      // Try AI generation
      const aiTheme = await this.generateWithAI(blueprint, options);
      return aiTheme;
    } catch (error) {
      console.warn(`[ThemeAgent] AI generation failed, falling back to static theme: ${error}`);
      // Fall back to static theme
      return buildStaticThemeSpec(blueprint, fallbackTheme);
    }
  }

  /**
   * Generate theme using AI provider
   */
  private async generateWithAI(blueprint: Blueprint, options: ThemeGenerationOptions): Promise<ThemeSpec> {
    // Dynamically import to avoid circular dependencies
    const { generateObject } = await import("ai");

    // Get provider instance
    const providerName = options.provider || "groq";
    let providerInstance: any;

    try {
      if (providerName === "openai") {
        const { openai } = await import("@ai-sdk/openai");
        providerInstance = openai("gpt-4o-mini");
      } else if (providerName === "anthropic") {
        const { anthropic } = await import("@ai-sdk/anthropic");
        providerInstance = anthropic("claude-3-5-sonnet-20241022");
      } else if (providerName === "groq") {
        const { groq } = await import("@ai-sdk/groq");
        providerInstance = groq("llama-3.3-70b-versatile");
      } else if (providerName === "gemini" || providerName === "google") {
        const { google } = await import("@ai-sdk/google");
        providerInstance = google("gemini-2.0-flash-exp");
      } else {
        throw new Error(`Unknown provider: ${providerName}`);
      }
    } catch (error) {
      throw new Error(`Failed to load AI provider ${providerName}: ${error}`);
    }

    // Build context about the presentation
    const context = this.buildThemeContext(blueprint);

    const prompt = `You are a professional presentation designer. Analyze this presentation and create a cohesive visual theme.

PRESENTATION CONTEXT:
${context}

DESIGN REQUIREMENTS:
1. Choose colors that match the content domain and tone:
   - Financial/Corporate: Navy, teal, professional blues
   - Creative/Marketing: Purple, pink, vibrant colors
   - Technical/Data: Dark grays, blues, clean palette
   - Healthcare: Blues, greens, trustworthy colors
   - Education: Warm colors, accessible palette

2. Typography should match the tone:
   - Formal/Executive: Georgia, Garamond, serif fonts
   - Modern/Tech: Trebuchet MS, Segoe UI, sans-serif
   - Minimal/Clean: Calibri Light, Arial, simple fonts

3. Slide rhythm (background alternation):
   - Hero slides: ALWAYS dark background
   - Closing slides: ALWAYS dark background
   - Data slides: ALWAYS dark background
   - Content slides: Light background
   - Section slides: Dark background
   - Alternate between dark/light for visual rhythm

4. Decorations:
   - ALWAYS use headerStyle: "none" — full-width header bands are FORBIDDEN (they signal AI generation)
   - Hero slides: Use ovals and left-bar decorations for visual interest
   - Closing slides: Use bottom-bar or corner-accent instead of left-bar
   - Use 1-2 tasteful decorations per slide maximum

5. Color format: All colors must be 6-digit hex WITHOUT the # symbol (e.g., "0D1B4B" not "#0D1B4B")

SLIDE IDS TO THEME:
${blueprint.slides.map((s) => `- ${s.id} (type: ${s.type})`).join("\n")}

Generate a complete ThemeSpec with palette, typography, and slideRhythm for all ${blueprint.slides.length} slides.`;

    console.log(`[ThemeAgent] Calling AI for theme generation with provider: ${providerName}`);

    const result = await generateObject({
      model: providerInstance,
      schema: ThemeSpecSchema,
      prompt,
      temperature: options.temperature || 0.7,
    });

    console.log(`[ThemeAgent] AI theme generated successfully`);
    console.log(`[ThemeAgent] ========== AI GENERATED THEME ==========`);
    console.log(`[ThemeAgent] Primary Color: ${result.object.palette.primary}`);
    console.log(`[ThemeAgent] Secondary Color: ${result.object.palette.secondary}`);
    console.log(`[ThemeAgent] Accent Color: ${result.object.palette.accent}`);
    console.log(`[ThemeAgent] Display Font: ${result.object.typography.displayFont}`);
    console.log(`[ThemeAgent] Body Font: ${result.object.typography.bodyFont}`);
    console.log(`[ThemeAgent] Slide Rhythm (${result.object.slideRhythm.length} slides):`);
    result.object.slideRhythm.forEach((slide, i) => {
      console.log(`[ThemeAgent]   Slide ${i + 1} (${slide.slideId}): ${slide.backgroundMode} bg, ${slide.headerStyle} header, ${slide.decorations.length} decorations`);
    });
    console.log(`[ThemeAgent] ================================================`);

    return result.object as ThemeSpec;
  }

  /**
   * Build context string from blueprint for AI analysis
   */
  private buildThemeContext(blueprint: Blueprint): string {
    const meta = blueprint.meta;
    const slides = blueprint.slides;

    const lines: string[] = [];

    if (meta?.title) lines.push(`Title: ${meta.title}`);
    if (meta?.subtitle) lines.push(`Subtitle: ${meta.subtitle}`);
    if (meta?.audience) lines.push(`Audience: ${meta.audience}`);
    if (meta?.goal) lines.push(`Goal: ${meta.goal}`);
    if (meta?.tone) lines.push(`Tone: ${meta.tone}`);

    lines.push(`\nSlide Count: ${slides.length}`);
    lines.push(`Slide Types: ${slides.map((s) => s.type).join(", ")}`);

    // Extract key content themes
    const contentSample = slides
      .slice(0, 3)
      .map((s, i) => {
        const heading = s.content.find((c) => c.type === "heading");
        return `Slide ${i + 1}: ${heading ? (heading as any).value : "Untitled"}`;
      })
      .join("\n");

    lines.push(`\nContent Sample:\n${contentSample}`);

    return lines.join("\n");
  }
}
