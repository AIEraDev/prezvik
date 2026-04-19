/**
 * Template Primitives
 *
 * Base building blocks for infinite template generation.
 *
 * CORE PRINCIPLE:
 * All templates are combinations of these finite primitives.
 * This provides structure while enabling exponential variety.
 */

import type {
  BaseLayout,
  DensityLevel,
  VisualEmphasis,
  MediaStrategy,
  SpacingSystem,
} from "./types.js";

/**
 * Base Layout Primitives (the "physics engine")
 *
 * These are the fundamental spatial arrangements that never change.
 * All templates derive from these 9 base layouts.
 */
export const BASE_LAYOUTS: BaseLayout[] = [
  "center_focus", // Hero/title slides
  "two_column", // Comparison, pros/cons
  "three_column", // Features, benefits
  "split_screen", // Image + text
  "grid_2x2", // 4-quadrant layouts
  "hero_overlay", // Background image with text overlay
  "timeline", // Sequential content
  "stat_highlight", // Metrics/dashboard
  "image_dominant", // Visual-first slides
];

/**
 * Layout metadata: Content capacity by layout
 */
export const LAYOUT_CAPACITY: Record<
  BaseLayout,
  { min: number; max: number; optimal: number }
> = {
  center_focus: { min: 1, max: 3, optimal: 2 },
  two_column: { min: 2, max: 6, optimal: 4 },
  three_column: { min: 3, max: 9, optimal: 6 },
  split_screen: { min: 2, max: 4, optimal: 3 },
  grid_2x2: { min: 2, max: 5, optimal: 4 },
  hero_overlay: { min: 1, max: 3, optimal: 2 },
  timeline: { min: 3, max: 7, optimal: 5 },
  stat_highlight: { min: 2, max: 6, optimal: 4 },
  image_dominant: { min: 1, max: 2, optimal: 1 },
};

/**
 * Density Levels
 *
 * Controls how much content fits in a layout.
 * Higher density = more items, tighter spacing.
 */
export const DENSITY_LEVELS: DensityLevel[] = [
  "minimal", // 1-2 items, generous whitespace
  "low", // 2-3 items
  "medium", // Standard density
  "high", // Many items
  "maximal", // Maximum content
];

/**
 * Density multipliers for content capacity
 */
export const DENSITY_MULTIPLIERS: Record<DensityLevel, number> = {
  minimal: 0.5,
  low: 0.75,
  medium: 1.0,
  high: 1.5,
  maximal: 2.0,
};

/**
 * Visual Emphasis Options
 *
 * Determines what gets visual priority in the layout.
 */
export const VISUAL_EMPHASIS: VisualEmphasis[] = [
  "text", // Prioritize readability, larger text
  "media", // Prioritize images/visuals
  "balanced", // Equal weight to all elements
  "data", // Prioritize stats, numbers, charts
];

/**
 * Media Strategy Options
 *
 * How media (images, icons) is integrated into the layout.
 */
export const MEDIA_STRATEGIES: MediaStrategy[] = [
  "none", // Text only
  "background", // Full-bleed background
  "side", // Side-by-side with content
  "inline", // Within content flow
  "hero", // Large hero image with overlay text
  "grid", // Multiple images in grid
];

/**
 * Media strategy compatibility with layouts
 */
export const MEDIA_STRATEGY_LAYOUT_COMPATIBILITY: Record<
  MediaStrategy,
  BaseLayout[]
> = {
  none: ["center_focus", "two_column", "three_column", "timeline", "stat_highlight"],
  background: ["center_focus", "hero_overlay", "split_screen"],
  side: ["two_column", "split_screen", "three_column"],
  inline: ["two_column", "three_column", "grid_2x2", "timeline"],
  hero: ["hero_overlay", "image_dominant"],
  grid: ["grid_2x2", "three_column"],
};

/**
 * Spacing Systems
 *
 * Controls whitespace and breathing room.
 */
export const SPACING_SYSTEMS: SpacingSystem[] = [
  "tight", // Minimal spacing, compact
  "balanced", // Standard comfortable spacing
  "airy", // Generous whitespace, premium feel
];

/**
 * Spacing multipliers
 */
export const SPACING_MULTIPLIERS: Record<SpacingSystem, number> = {
  tight: 0.7,
  balanced: 1.0,
  airy: 1.5,
};

/**
 * Content type to preferred layouts mapping
 */
export const CONTENT_TYPE_LAYOUT_PREFERENCES: Record<string, BaseLayout[]> = {
  title: ["center_focus", "hero_overlay"],
  comparison: ["two_column", "split_screen", "grid_2x2"],
  features: ["three_column", "grid_2x2", "timeline"],
  metrics: ["stat_highlight", "three_column"],
  story: ["timeline", "hero_overlay"],
  visual: ["image_dominant", "hero_overlay"],
  data: ["stat_highlight", "grid_2x2"],
};

/**
 * Calculate effective content capacity for a template configuration
 */
export function calculateContentCapacity(
  baseLayout: BaseLayout,
  density: DensityLevel
): { min: number; max: number } {
  const baseCapacity = LAYOUT_CAPACITY[baseLayout];
  const densityMultiplier = DENSITY_MULTIPLIERS[density];

  return {
    min: Math.ceil(baseCapacity.min * densityMultiplier),
    max: Math.floor(baseCapacity.max * densityMultiplier),
  };
}

/**
 * Check if a template configuration is valid
 */
export function isValidTemplateConfig(
  baseLayout: BaseLayout,
  mediaStrategy: MediaStrategy
): boolean {
  const compatibleLayouts = MEDIA_STRATEGY_LAYOUT_COMPATIBILITY[mediaStrategy];
  return compatibleLayouts.includes(baseLayout);
}

/**
 * Get recommended visual emphasis based on content
 */
export function getRecommendedEmphasis(
  hasMedia: boolean,
  hasData: boolean,
  textWeight: number
): VisualEmphasis {
  if (hasMedia && !hasData && textWeight < 100) {
    return "media";
  }
  if (hasData && textWeight < 200) {
    return "data";
  }
  if (textWeight > 500) {
    return "text";
  }
  return "balanced";
}

/**
 * Generate a unique template ID from configuration
 */
export function generateTemplateId(
  baseLayout: BaseLayout,
  density: DensityLevel,
  emphasis: VisualEmphasis,
  mediaStrategy: MediaStrategy,
  spacing: SpacingSystem
): string {
  const parts = [baseLayout, density, emphasis, mediaStrategy, spacing];
  return parts.join("-");
}

/**
 * Calculate total possible template combinations
 */
export function calculateTemplatePossibilities(): number {
  let count = 0;

  for (const layout of BASE_LAYOUTS) {
    for (const media of MEDIA_STRATEGIES) {
      if (isValidTemplateConfig(layout, media)) {
        count +=
          DENSITY_LEVELS.length *
          VISUAL_EMPHASIS.length *
          SPACING_SYSTEMS.length;
      }
    }
  }

  return count;
}

/**
 * Total valid template combinations:
 * Approximately 7 layouts × 4 media strategies × 5 densities × 4 emphases × 3 spacings
 * = ~1,600+ valid template combinations
 */
export const TOTAL_VALID_COMBINATIONS = calculateTemplatePossibilities();
