/**
 * Kyro Template Schema v1
 *
 * Theme-bound templates with layout rules and compatibility constraints
 *
 * CORE PRINCIPLE:
 * A template is NOT just "hero slide" or "two column." It is:
 * - layout family
 * - content density
 * - visual rhythm
 * - media rules
 * - animation rules
 * - theme compatibility constraints
 */

import { z } from "zod";

/**
 * Slide Type - Semantic categorization
 */
export const SlideTypeSchema = z.enum(["hero", "section", "content", "comparison", "grid", "quote", "data", "callout", "closing"]);

export type SlideType = z.infer<typeof SlideTypeSchema>;

/**
 * Media Type - What kind of media the template prefers
 */
export const MediaTypeSchema = z.enum(["image", "icon", "illustration", "chart", "none"]);

export type MediaType = z.infer<typeof MediaTypeSchema>;

/**
 * Content Density - How much content fits
 */
export const ContentDensitySchema = z.enum([
  "low", // Hero slides, minimal content
  "medium", // Standard content slides
  "high", // Data slides, comparison grids
]);

export type ContentDensity = z.infer<typeof ContentDensitySchema>;

/**
 * Layout Rules - Constraints for content composition
 */
export const LayoutRulesSchema = z.object({
  /** Maximum text blocks this layout can handle */
  maxTextBlocks: z.number().min(1).max(10),

  /** Maximum bullet points per block */
  maxBulletPoints: z.number().min(1).max(12).optional(),

  /** Preferred media type for this template */
  preferredMedia: MediaTypeSchema,

  /** Maximum media elements */
  maxMediaElements: z.number().min(0).max(4).optional(),

  /** Content density philosophy */
  density: ContentDensitySchema,

  /** Minimum content required to use this template */
  minContentBlocks: z.number().min(0).max(5).optional(),

  /** Whether this template supports a call-to-action */
  supportsCta: z.boolean().optional(),

  /** Whether this template supports statistics/highlights */
  supportsStats: z.boolean().optional(),

  /** Whether this template supports quotes/testimonials */
  supportsQuotes: z.boolean().optional(),
});

export type LayoutRules = z.infer<typeof LayoutRulesSchema>;

/**
 * Visual Rhythm - How the template composes visually
 */
export const VisualRhythmSchema = z.object({
  /** Focal point of the slide */
  focalPoint: z.enum(["top", "center", "bottom", "left", "right", "balanced"]),

  /** Visual weight distribution */
  weightDistribution: z.enum(["symmetric", "asymmetric", "centered", "offset"]),

  /** Reading direction hint */
  readingDirection: z.enum(["top-to-bottom", "left-to-right", "z-pattern", "f-pattern"]).optional(),

  /** Whether content should be grouped visually */
  groupedContent: z.boolean().optional(),

  /** Whether to emphasize whitespace */
  whitespaceEmphasis: z.enum(["minimal", "balanced", "maximum"]).optional(),
});

export type VisualRhythm = z.infer<typeof VisualRhythmSchema>;

/**
 * Media Rules - How media is handled
 */
export const MediaRulesSchema = z.object({
  /** Media placement strategy */
  placement: z.enum(["background", "inline", "side", "corner", "full-bleed", "none"]),

  /** Aspect ratio preference */
  preferredRatio: z.enum(["square", "landscape", "portrait", "wide", "auto"]).optional(),

  /** Whether media can overlap text */
  allowOverlap: z.boolean().optional(),

  /** Minimum media size (percentage of slide) */
  minSize: z.number().min(5).max(100).optional(),

  /** Maximum media size (percentage of slide) */
  maxSize: z.number().min(5).max(100).optional(),

  /** Treatment for media containers */
  containerTreatment: z.enum(["none", "frame", "shadow", "border"]).optional(),

  /** Whether to apply filters/effects */
  applyFilters: z.boolean().optional(),
});

export type MediaRules = z.infer<typeof MediaRulesSchema>;

/**
 * Animation Rules - Motion behavior
 */
export const AnimationRulesSchema = z.object({
  /** Recommended entrance animation */
  recommendedEntrance: z.enum(["fade", "slide", "zoom", "scale", "none"]),

  /** Whether elements should animate sequentially */
  sequentialAnimation: z.boolean().optional(),

  /** Whether to use emphasis animations */
  allowEmphasis: z.boolean().optional(),

  /** Animation complexity level */
  complexity: z.enum(["simple", "moderate", "complex"]).optional(),

  /** Motion sensitivity (for accessibility) */
  motionSensitivity: z.enum(["low", "medium", "high"]).optional(),
});

export type AnimationRules = z.infer<typeof AnimationRulesSchema>;

/**
 * Theme Compatibility - Which themes work with this template
 */
export const ThemeCompatibilitySchema = z.object({
  /** Compatible theme IDs */
  compatibleThemes: z.array(z.string()),

  /** Mood compatibility (if specific themes not listed) */
  compatibleMoods: z.array(z.enum(["bold", "minimal", "corporate", "playful", "luxury", "academic", "tech", "creative", "elegant"])).optional(),

  /** Whether this template requires dark theme */
  requiresDark: z.boolean().optional(),

  /** Whether this template works best with light theme */
  prefersLight: z.boolean().optional(),

  /** Minimum contrast ratio required */
  minContrast: z.number().min(1).max(21).optional(),
});

export type ThemeCompatibility = z.infer<typeof ThemeCompatibilitySchema>;

/**
 * Complete KyroTemplate Schema
 */
export const KyroTemplateSchema = z.object({
  // Identity
  id: z.string().regex(/^[a-z0-9-]+$/, "Template ID must be lowercase kebab-case"),
  name: z.string(),
  version: z.literal("1.0"),

  // Categorization
  type: SlideTypeSchema,
  description: z.string().optional(),

  // Layout
  layoutRules: LayoutRulesSchema,
  visualRhythm: VisualRhythmSchema,

  // Media
  mediaRules: MediaRulesSchema,

  // Animation (deprecated - removed from implementation, kept for backwards compatibility)
  animationRules: AnimationRulesSchema.optional(),

  // Theme binding
  themeCompatibility: ThemeCompatibilitySchema,

  // Metadata
  tags: z.array(z.string()).optional(),
  category: z.enum(["business", "education", "creative", "data", "marketing"]).optional(),
  complexity: z.enum(["simple", "standard", "complex"]).optional(),

  // Preview data (for UI)
  preview: z
    .object({
      thumbnail: z.string().optional(),
      exampleContent: z.record(z.unknown()).optional(),
    })
    .optional(),
});

export type KyroTemplate = z.infer<typeof KyroTemplateSchema>;

/**
 * Template Registry Type
 */
export type TemplateRegistry = Record<string, KyroTemplate>;

/**
 * Template Validation
 */
export function validateTemplate(template: unknown): { success: true; data: KyroTemplate } | { success: false; errors: string[] } {
  const result = KyroTemplateSchema.safeParse(template);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map((e: { path: (string | number)[]; message: string }) => `${e.path.join(".")}: ${e.message}`),
  };
}

/**
 * Check if a template is compatible with a theme
 */
export function isTemplateCompatibleWithTheme(template: KyroTemplate, themeId: string, themeMood?: string): boolean {
  // Direct theme ID match
  if (template.themeCompatibility.compatibleThemes.includes(themeId)) {
    return true;
  }

  // Mood-based compatibility
  if (themeMood && template.themeCompatibility.compatibleMoods?.includes(themeMood as any)) {
    return true;
  }

  return false;
}

/**
 * Find best templates for a theme
 */
export function findTemplatesForTheme(templates: TemplateRegistry, themeId: string, themeMood?: string, slideType?: SlideType): KyroTemplate[] {
  return Object.values(templates).filter((template) => {
    // Check theme compatibility
    if (!isTemplateCompatibleWithTheme(template, themeId, themeMood)) {
      return false;
    }

    // Filter by slide type if specified
    if (slideType && template.type !== slideType) {
      return false;
    }

    return true;
  });
}
