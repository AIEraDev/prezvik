/**
 * Prezvik Blueprint Schema v2
 *
 * Design-aware, renderer-agnostic intermediate representation
 * This is NOT "JSON for slides" - it's a design compiler IR
 *
 * CORE PRINCIPLE:
 * Prezvik does NOT store "slides". Prezvik stores visual communication intent
 * structured into layouts.
 */

import { z } from "zod";

/**
 * Top-Level Blueprint
 *
 * The complete intermediate representation of a presentation
 */
export const PrezVikBlueprintSchema = z.object({
  version: z.literal("2.0"),

  meta: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    author: z.string().optional(),
    audience: z.string().optional(),
    goal: z.enum(["inform", "persuade", "educate", "pitch", "report"]),
    tone: z.enum(["formal", "modern", "bold", "minimal", "friendly"]),
    language: z.string().optional().default("en"),
  }),

  theme: z
    .object({
      name: z.string().optional(),
      primaryColor: z.string().optional(),
      fontPairing: z.string().optional(),
      styleTokens: z.record(z.any()).optional(),
    })
    .optional(),

  slides: z.array(z.lazy(() => SlideSchema)).max(50, "Maximum 50 slides allowed per presentation"),
});

export type PrezVikBlueprint = z.infer<typeof PrezVikBlueprintSchema>;

/**
 * Slide - A composition unit, not a text container
 *
 * Every slide has:
 * - Structure (type, layout)
 * - Intent (why it exists)
 * - Content (structured blocks)
 * - Media (semantic placement)
 * - Styling (design tokens)
 * - Animation (hints, not execution)
 */
export const SlideSchema = z
  .object({
    id: z
      .string()
      .min(1, "Slide ID cannot be empty")
      .regex(/^[a-zA-Z0-9_-]+$/, "Slide ID must be alphanumeric with hyphens/underscores only"),

    // Slide type (semantic category)
    type: z.enum(["hero", "section", "content", "bullet-list", "two-column", "comparison", "stat-trio", "quote", "data", "callout", "timeline", "grid", "closing"]),

    // Intent: WHY this slide exists (critical for AI reasoning)
    intent: z.string(),

    // Layout: HOW content is arranged (explicit, never guessed)
    layout: z.enum(["center_focus", "two_column", "three_column", "split_screen", "grid_2x2", "hero_overlay", "timeline", "stat_highlight", "image_dominant"]),

    // Content: Structured blocks (not raw text)
    content: z.array(z.lazy(() => ContentBlockSchema)).min(1, "Slide must have at least one content block"),

    // Media: Semantic placement (not decorative noise)
    media: z.array(z.lazy(() => MediaBlockSchema)).optional(),

    // Styling: Design tokens (not inline styles)
    styling: z.lazy(() => SlideStyleSchema).optional(),
  })
  .refine(
    (slide) => {
      // Layout-content contract validation
      const layoutLimits: Record<string, { min: number; max: number }> = {
        center_focus: { min: 1, max: 3 },
        two_column: { min: 1, max: 6 },
        three_column: { min: 2, max: 9 },
        split_screen: { min: 2, max: 4 },
        grid_2x2: { min: 2, max: 5 },
        hero_overlay: { min: 1, max: 2 },
        timeline: { min: 2, max: 6 },
        stat_highlight: { min: 1, max: 4 },
        image_dominant: { min: 1, max: 3 },
      };

      const limits = layoutLimits[slide.layout];
      if (!limits) return true; // Unknown layout, skip validation

      return slide.content.length >= limits.min && slide.content.length <= limits.max;
    },
    {
      message: "Content count does not match layout constraints",
      path: ["content"],
    },
  )
  .refine(
    (slide) => {
      // Layout type vs slide type mismatch validation (soft warning)
      const layoutTypeMap: Record<string, string[]> = {
        hero: ["center_focus", "hero_overlay", "image_dominant"],
        section: ["center_focus", "two_column"],
        content: ["two_column", "three_column", "split_screen"],
        "bullet-list": ["two_column", "three_column", "split_screen", "center_focus"],
        "two-column": ["two_column", "three_column", "split_screen"],
        comparison: ["two_column", "three_column", "split_screen"],
        grid: ["grid_2x2", "three_column"],
        "stat-trio": ["stat_highlight", "three_column"],
        quote: ["center_focus"],
        data: ["stat_highlight", "timeline"],
        callout: ["center_focus", "hero_overlay"],
        timeline: ["timeline", "two_column"],
        closing: ["center_focus"],
      };

      const allowedLayouts = layoutTypeMap[slide.type];
      if (allowedLayouts && !allowedLayouts.includes(slide.layout)) {
        console.warn(`[schema] Slide type "${slide.type}" may not work well with layout "${slide.layout}". ` + `Recommended layouts: ${allowedLayouts.join(", ")}`);
      }
      return true; // Always pass, just warn
    },
    { message: "Layout type may not be optimal for slide type" },
  )
  .refine(
    (slide) => {
      // Heading level/emphasis validation
      const recommendedEmphasis: Record<string, string> = {
        h1: "high",
        h2: "medium",
        h3: "low",
      };

      for (const block of slide.content) {
        if (block.type === "heading") {
          const heading = block as { level?: string; emphasis?: string; value: string };
          if (heading.emphasis && heading.level) {
            const expected = recommendedEmphasis[heading.level];
            if (heading.emphasis !== expected) {
              console.warn(`[schema] Heading level "${heading.level}" typically uses "${expected}" emphasis, but got "${heading.emphasis}". ` + `Value: "${heading.value.substring(0, 30)}..."`);
            }
          }
        }
      }
      return true; // Always pass, just warn
    },
    { message: "Heading level/emphasis mismatch detected" },
  );

export type Slide = z.infer<typeof SlideSchema>;

/**
 * Content Blocks - Structured thinking, not raw text
 */
export const ContentBlockSchema = z.discriminatedUnion("type", [
  // Text Block
  z.object({
    type: z.literal("text"),
    value: z.string().min(1, "Text block value cannot be empty"),
    emphasis: z.enum(["low", "medium", "high"]).optional(),
  }),

  // Heading Block
  z.object({
    type: z.literal("heading"),
    value: z.string().min(1, "Heading value cannot be empty"),
    level: z.enum(["h1", "h2", "h3"]).optional().default("h1"),
    emphasis: z.enum(["low", "medium", "high"]).optional().default("high"),
  }),

  // Bullet Block (important for slide clarity)
  z.object({
    type: z.literal("bullets"),
    items: z.array(
      z.object({
        text: z.string(),
        icon: z.string().optional(), // semantic emoji or icon
        highlight: z.boolean().optional(),
      }),
    ),
  }),

  // Quote Block
  z.object({
    type: z.literal("quote"),
    text: z.string(),
    author: z.string().optional(),
    role: z.string().optional(),
  }),

  // Stat Block (for data slides)
  z.object({
    type: z.literal("stat"),
    value: z.union([z.string(), z.number()]),
    label: z.string(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    visualWeight: z.enum(["normal", "emphasis", "hero"]).optional().default("normal"),
  }),

  // Code Block
  z.object({
    type: z.literal("code"),
    code: z.string(),
    language: z.string().optional(),
  }),
]);

export type ContentBlock = z.infer<typeof ContentBlockSchema>;

/**
 * Media Block - Explicit media placement
 *
 * Prezvik explicitly models media placement (not random decoration)
 */
export const MediaBlockSchema = z.object({
  type: z.enum(["image", "icon", "illustration", "chart"]),

  source: z
    .object({
      query: z.string().optional(), // AI image search query
      url: z
        .string()
        .regex(/^https?:\/\/.+|^data:image\/[a-zA-Z]+;base64,.+/, "URL must be a valid http://, https://, or data:image URL")
        .optional(), // Direct URL with validation
      aiGenerated: z.boolean().optional(), // AI-generated image
    })
    .optional(),

  placement: z.enum(["background", "inline", "side", "full_bleed"]),

  style: z
    .object({
      filter: z.enum(["none", "soft", "vibrant", "monochrome"]).optional(),
      crop: z.enum(["square", "wide", "portrait", "auto"]).optional(),
    })
    .optional(),
});

export type MediaBlock = z.infer<typeof MediaBlockSchema>;

/**
 * Slide Style - Design tokens layer
 *
 * NOT inline styles - design tokens that theme resolver interprets
 */
export const SlideStyleSchema = z.object({
  background: z
    .object({
      type: z.enum(["solid", "gradient", "image"]),
      value: z.string().optional(),
    })
    .optional(),

  textColor: z.string().optional(),
  alignment: z.enum(["left", "center", "right"]).optional(),
  spacing: z.enum(["tight", "normal", "wide"]).optional(),
});

export type SlideStyle = z.infer<typeof SlideStyleSchema>;

/**
 * Type exports (alias for convenience)
 */
export type Blueprint = PrezVikBlueprint;
