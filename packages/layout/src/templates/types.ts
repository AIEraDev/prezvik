/**
 * Template Agent Types
 *
 * Type definitions for template generation and selection
 */

/**
 * Base layout primitive
 */
export type BaseLayout = "center_focus" | "two_column" | "three_column" | "split_screen" | "grid_2x2" | "hero_overlay" | "timeline" | "stat_highlight" | "image_dominant";

/**
 * Content density level
 */
export type DensityLevel = "minimal" | "low" | "medium" | "high" | "maximal";

/**
 * Visual emphasis strategy
 */
export type VisualEmphasis = "text" | "media" | "balanced" | "data";

/**
 * Media placement strategy
 */
export type MediaStrategy = "none" | "background" | "side" | "inline" | "hero" | "grid";

/**
 * Spacing system
 */
export type SpacingSystem = "tight" | "balanced" | "airy";

/**
 * Template variant - a specific configuration
 */
export interface TemplateVariant {
  /** Unique template ID */
  id: string;
  /** Base layout primitive */
  baseLayout: BaseLayout;
  /** Content density */
  density: DensityLevel;
  /** Visual emphasis */
  emphasis: VisualEmphasis;
  /** Media strategy */
  mediaStrategy: MediaStrategy;
  /** Spacing system */
  spacing: SpacingSystem;
  /** Minimum items this template supports */
  minItems: number;
  /** Maximum items this template supports */
  maxItems: number;
  /** Whether template supports media */
  supportsMedia: boolean;
  /** Whether template supports data/stats */
  supportsData: boolean;
  /** Visual style tokens */
  styleTokens: {
    /** Padding multiplier (1.0 = standard) */
    paddingMultiplier: number;
    /** Gap multiplier (1.0 = standard) */
    gapMultiplier: number;
    /** Font scale factor */
    fontScale: number;
  };
  /** Layout rules reference */
  layoutRules: string;
  /** Quality score from validation (populated after validation) */
  qualityScore?: number;
  /** Whether template passed validation */
  isValid?: boolean;
}

/**
 * Template generation options
 */
export interface TemplateGenerationOptions {
  /** Content type hint */
  contentType?: "pitch" | "report" | "training" | "generic";
  /** Number of content items */
  itemCount: number;
  /** Whether content includes media */
  hasMedia: boolean;
  /** Whether content includes data/stats */
  hasData: boolean;
  /** Whether content includes quotes */
  hasQuotes: boolean;
  /** Preferred base layouts (if known) */
  preferredLayouts?: BaseLayout[];
  /** Theme compatibility hint */
  theme?: string;
  /** Maximum templates to generate */
  maxTemplates?: number;
  /** Whether to include experimental layouts */
  includeExperimental?: boolean;
}

/**
 * Content profile for template matching
 */
export interface ContentProfile {
  /** Number of text blocks */
  textBlocks: number;
  /** Number of bullet lists */
  bulletLists: number;
  /** Number of stats/data points */
  dataPoints: number;
  /** Number of media elements */
  mediaCount: number;
  /** Has quote/testimonial */
  hasQuote: boolean;
  /** Has call-to-action */
  hasCTA: boolean;
  /** Total content weight (character count) */
  contentWeight: number;
}

/**
 * Template selection criteria
 */
export interface TemplateSelectionCriteria {
  /** Minimum quality score threshold */
  minQualityScore?: number;
  /** Prefer templates with media support */
  preferMediaSupport?: boolean;
  /** Prefer certain density */
  preferredDensity?: DensityLevel;
  /** Maximum items template must support */
  maxItemCapacity?: number;
  /** Theme compatibility requirement */
  themeCompatible?: string;
}

/**
 * Template configuration (for generation)
 */
export interface TemplateConfig {
  /** Base layout */
  baseLayout: BaseLayout;
  /** Density level */
  density: DensityLevel;
  /** Visual emphasis */
  emphasis: VisualEmphasis;
  /** Media strategy */
  mediaStrategy: MediaStrategy;
  /** Spacing system */
  spacing: SpacingSystem;
}

/**
 * Template score breakdown
 */
export interface TemplateScore {
  /** Overall score (0-100) */
  overall: number;
  /** Content fit score */
  contentFit: number;
  /** Layout quality score */
  layoutQuality: number;
  /** Theme compatibility score */
  themeFit: number;
  /** Performance score (render speed) */
  performance: number;
}

/**
 * Template match result
 */
export interface TemplateMatch {
  /** The template variant */
  template: TemplateVariant;
  /** Match score */
  score: TemplateScore;
  /** Rank among candidates */
  rank: number;
  /** Why this template was selected */
  reasoning: string[];
}

/**
 * Generation result
 */
export interface GenerationResult {
  /** Generated templates */
  templates: TemplateVariant[];
  /** Validated templates count */
  validatedCount: number;
  /** Generation duration in ms */
  duration: number;
  /** Combinations explored */
  combinationsExplored: number;
}

/**
 * Template cache entry
 */
export interface TemplateCacheEntry {
  /** Cached template */
  template: TemplateVariant;
  /** Content profile hash */
  profileHash: string;
  /** Timestamp */
  timestamp: number;
  /** Usage count */
  usageCount: number;
  /** Average quality score achieved */
  averageQuality: number;
}
