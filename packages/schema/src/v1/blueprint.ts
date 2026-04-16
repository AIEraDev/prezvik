/**
 * Kyro Blueprint Schema v2
 *
 * Design-aware, renderer-agnostic intermediate representation
 * This is NOT "JSON for slides" - it's a design compiler IR
 *
 * CORE PRINCIPLE:
 * Kyro does NOT store "slides". Kyro stores visual communication intent
 * structured into layouts.
 */

import { z } from "zod";

/**
 * Top-Level Blueprint
 *
 * The complete intermediate representation of a presentation
 */
export const KyroBlueprintSchema = z.object({
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

  slides: z.array(z.lazy(() => SlideSchema)),
});

export type KyroBlueprint = z.infer<typeof KyroBlueprintSchema>;

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
export const SlideSchema = z.object({
  id: z.string(),

  // Slide type (semantic category)
  type: z.enum(["hero", "section", "content", "comparison", "grid", "quote", "data", "callout", "closing"]),

  // Intent: WHY this slide exists (critical for AI reasoning)
  intent: z.string(),

  // Layout: HOW content is arranged (explicit, never guessed)
  layout: z.enum(["center_focus", "two_column", "three_column", "split_screen", "grid_2x2", "hero_overlay", "timeline", "stat_highlight", "image_dominant"]),

  // Content: Structured blocks (not raw text)
  content: z.array(z.lazy(() => ContentBlockSchema)),

  // Media: Semantic placement (not decorative noise)
  media: z.array(z.lazy(() => MediaBlockSchema)).optional(),

  // Styling: Design tokens (not inline styles)
  styling: z.lazy(() => SlideStyleSchema).optional(),

  // Animation: Hints (not execution)
  animation: z.lazy(() => AnimationHintSchema).optional(),
});

export type Slide = z.infer<typeof SlideSchema>;

/**
 * Content Blocks - Structured thinking, not raw text
 */
export const ContentBlockSchema = z.discriminatedUnion("type", [
  // Text Block
  z.object({
    type: z.literal("text"),
    value: z.string(),
    emphasis: z.enum(["low", "medium", "high"]).optional(),
  }),

  // Heading Block
  z.object({
    type: z.literal("heading"),
    value: z.string(),
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
 * Kyro explicitly models media placement (not random decoration)
 */
export const MediaBlockSchema = z.object({
  type: z.enum(["image", "icon", "illustration", "chart"]),

  source: z
    .object({
      query: z.string().optional(), // AI image search query
      url: z.string().optional(), // Direct URL
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
 * Animation Hint - Intent, not execution
 *
 * This is NOT animation execution - just hints for renderers
 * Renderers decide how to implement (or ignore)
 */
export const AnimationHintSchema = z.object({
  entrance: z.enum(["fade", "slide", "zoom", "none"]).optional(),
  sequence: z.enum(["all", "staggered", "step_by_step"]).optional(),
  emphasis: z.enum(["pulse", "highlight", "scale_focus"]).optional(),
});

export type AnimationHint = z.infer<typeof AnimationHintSchema>;

/**
 * Type exports (alias for convenience)
 */
export type Blueprint = KyroBlueprint;
