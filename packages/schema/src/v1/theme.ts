/**
 * Kyro Theme Schema v1
 *
 * Comprehensive design token system for theme-aware presentation generation
 *
 * CORE PRINCIPLE:
 * Theme is NOT cosmetic - it's a structural input to the blueprint pipeline.
 * The theme determines: layout fit, content density, media rules, animation hints.
 */

import { z } from "zod";

/**
 * Theme Mood - Core personality of the theme
 */
export const ThemeMoodSchema = z.enum(["bold", "minimal", "corporate", "playful", "luxury", "academic", "tech", "creative", "elegant"]);

export type ThemeMood = z.infer<typeof ThemeMoodSchema>;

/**
 * Color System - Semantic color tokens
 */
export const ColorSystemSchema = z.object({
  background: z.string().regex(/^[0-9A-Fa-f]{6}$/, "Must be 6-digit hex without #"),
  surface: z.string().regex(/^[0-9A-Fa-f]{6}$/),
  surfaceElevated: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  textPrimary: z.string().regex(/^[0-9A-Fa-f]{6}$/),
  textSecondary: z.string().regex(/^[0-9A-Fa-f]{6}$/),
  textInverse: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  accent: z.string().regex(/^[0-9A-Fa-f]{6}$/),
  accentLight: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  accentDark: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  primary: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  secondary: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  success: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  warning: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  danger: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  info: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  border: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  borderLight: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
  overlay: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/)
    .optional(),
});

export type ColorSystem = z.infer<typeof ColorSystemSchema>;

/**
 * Typography Scale - Semantic type sizing (in points)
 */
export const TypographyScaleSchema = z.object({
  hero: z.number().min(24).max(120),
  h1: z.number().min(20).max(80),
  h2: z.number().min(16).max(60),
  h3: z.number().min(14).max(48),
  body: z.number().min(10).max(32),
  bodySmall: z.number().min(8).max(24).optional(),
  caption: z.number().min(8).max(18),
});

export type TypographyScale = z.infer<typeof TypographyScaleSchema>;

/**
 * Font Family Configuration
 */
export const FontFamilySchema = z.object({
  heading: z.string(),
  body: z.string(),
  mono: z.string().optional(),
  accent: z.string().optional(),
});

export type FontFamily = z.infer<typeof FontFamilySchema>;

/**
 * Typography System - Complete type configuration
 */
export const TypographySchema = z.object({
  family: FontFamilySchema,
  scale: TypographyScaleSchema,
  weight: z.object({
    light: z.number().optional(),
    regular: z.number(),
    medium: z.number(),
    semibold: z.number().optional(),
    bold: z.number(),
    black: z.number().optional(),
  }),
  lineHeight: z.object({
    tight: z.number(),
    normal: z.number(),
    relaxed: z.number(),
  }),
  letterSpacing: z
    .object({
      tight: z.number(),
      normal: z.number(),
      wide: z.number(),
    })
    .optional(),
});

export type Typography = z.infer<typeof TypographySchema>;

/**
 * Spacing Scale - 8px base unit system
 */
export const SpacingScaleSchema = z.object({
  xs: z.number(),
  sm: z.number(),
  md: z.number(),
  lg: z.number(),
  xl: z.number(),
  "2xl": z.number(),
  "3xl": z.number(),
});

export type SpacingScale = z.infer<typeof SpacingScaleSchema>;

/**
 * Border Radius Scale
 */
export const RadiusScaleSchema = z.object({
  none: z.number(),
  sm: z.number(),
  md: z.number(),
  lg: z.number(),
  xl: z.number(),
  full: z.number(),
});

export type RadiusScale = z.infer<typeof RadiusScaleSchema>;

/**
 * Effects - Visual treatments
 */
export const EffectsSchema = z.object({
  shadow: z
    .object({
      none: z.string(),
      sm: z.string(),
      md: z.string(),
      lg: z.string(),
      xl: z.string(),
    })
    .optional(),
  glass: z.boolean().optional(),
  blur: z.number().optional(),
  grain: z.boolean().optional(),
  glow: z
    .object({
      color: z.string().optional(),
      intensity: z.number().optional(),
    })
    .optional(),
});

export type Effects = z.infer<typeof EffectsSchema>;

/**
 * Motion Preferences - Animation hints
 */
export const MotionSchema = z.object({
  defaultEntrance: z.enum(["fade", "slide", "zoom", "scale", "none"]),
  emphasis: z.enum(["pulse", "scale", "highlight", "none"]).optional(),
  duration: z
    .object({
      fast: z.number(),
      normal: z.number(),
      slow: z.number(),
    })
    .optional(),
  easing: z
    .object({
      default: z.string(),
      entrance: z.string(),
      exit: z.string(),
    })
    .optional(),
});

export type Motion = z.infer<typeof MotionSchema>;

/**
 * Layout Density - Content spacing philosophy
 */
export const LayoutDensitySchema = z.enum(["compact", "comfortable", "spacious"]);
export type LayoutDensity = z.infer<typeof LayoutDensitySchema>;

/**
 * Content Width - Reading comfort zones
 */
export const ContentWidthSchema = z.enum(["narrow", "medium", "wide", "full"]);
export type ContentWidth = z.infer<typeof ContentWidthSchema>;

/**
 * Layout Preferences
 */
export const LayoutPreferencesSchema = z.object({
  density: LayoutDensitySchema,
  contentWidth: ContentWidthSchema,
  maxContentLines: z.number().min(1).max(20),
  preferredAlignment: z.enum(["left", "center", "right", "justified"]),
  gridColumns: z.number().min(1).max(12).optional(),
  safeAreaMargin: z.number(),
});

export type LayoutPreferences = z.infer<typeof LayoutPreferencesSchema>;

/**
 * Media Treatment - How images/icons are handled
 */
export const MediaTreatmentSchema = z.object({
  style: z.enum(["photo", "illustration", "icon", "chart", "mixed"]),
  cornerStyle: z.enum(["sharp", "rounded", "circle"]),
  borderTreatment: z.enum(["none", "thin", "thick", "shadow"]),
  overlayStyle: z.enum(["none", "gradient", "solid", "blur"]).optional(),
  preferredAspectRatio: z.enum(["square", "landscape", "portrait", "wide", "auto"]).optional(),
});

export type MediaTreatment = z.infer<typeof MediaTreatmentSchema>;

/**
 * Icon Style
 */
export const IconStyleSchema = z.enum(["filled", "outlined", "duotone", "emoji", "none"]);
export type IconStyle = z.infer<typeof IconStyleSchema>;

/**
 * Complete KyroTheme Schema
 */
export const KyroThemeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "Theme ID must be lowercase kebab-case"),
  name: z.string(),
  version: z.literal("1.0"),
  mood: ThemeMoodSchema,
  description: z.string().optional(),
  colorSystem: ColorSystemSchema,
  typography: TypographySchema,
  spacing: SpacingScaleSchema,
  radii: RadiusScaleSchema,
  effects: EffectsSchema.optional(),
  motion: MotionSchema.optional(),
  layout: LayoutPreferencesSchema,
  media: MediaTreatmentSchema,
  icons: IconStyleSchema,
  tags: z.array(z.string()).optional(),
  category: z.enum(["business", "education", "creative", "tech", "minimal", "bold", "elegant"]).optional(),
  isDark: z.boolean().optional().default(false),
  accessibility: z
    .object({
      minContrast: z.number().min(1).max(21).optional(),
      prefersReducedMotion: z.boolean().optional(),
    })
    .optional(),
});

export type KyroTheme = z.infer<typeof KyroThemeSchema>;

/**
 * Theme Validation
 */
export function validateTheme(theme: unknown): { success: true; data: KyroTheme } | { success: false; errors: string[] } {
  const result = KyroThemeSchema.safeParse(theme);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.errors.map((e: { path: (string | number)[]; message: string }) => `${e.path.join(".")}: ${e.message}`),
  };
}

/**
 * Theme Registry Type
 */
export type ThemeRegistry = Record<string, KyroTheme>;
